-- 041_modulo_inventario.sql
-- Módulo Inventario: conteo cíclico, bloques con QR + auditoría, y proyección de
-- pallets. Reutiliza los maestros existentes (tms_matriz_codigos, tms_inventario_
-- resumen, tms_partidas, tms_series, wms_ubicaciones) — no crea tabla de productos.
-- RLS: acceso completo para usuarios autenticados, igual que el resto del sistema.

-- ── Helper: aplica el patrón estándar de RLS (FOR ALL a authenticated) ────────
-- (se hace inline por tabla para no depender de funciones auxiliares)

-- ══════════════════════════════════════════════════════════════════════════
-- 1) PROYECCIÓN DE PALLETS
-- ══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.wms_proyecciones (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prod              text,
  cant_oc           numeric NOT NULL DEFAULT 0,
  cant_bx           numeric NOT NULL DEFAULT 0,   -- cajas a mano; 0 = calcular desde la OC
  cant_x_bx         numeric NOT NULL DEFAULT 0,
  pie               numeric NOT NULL DEFAULT 0,
  altura            numeric NOT NULL DEFAULT 0,
  creado_por        uuid,
  creado_por_nombre text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.wms_proyecciones ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.wms_proyecciones TO authenticated;
DROP POLICY IF EXISTS auth_all_wms_proyecciones ON public.wms_proyecciones;
CREATE POLICY auth_all_wms_proyecciones ON public.wms_proyecciones
  FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- ══════════════════════════════════════════════════════════════════════════
-- 2) CONTEO CÍCLICO: sesiones, conteos y costos (para valorizado)
-- ══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.wms_cc_sesiones (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre            text NOT NULL,
  descripcion       text,
  tipo              text NOT NULL DEFAULT 'ciclico',   -- ciclico | total | ubicacion
  estado            text NOT NULL DEFAULT 'abierta',   -- abierta | cerrada
  semana            integer,
  creado_por        uuid,
  creado_por_nombre text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  closed_at         timestamptz
);
ALTER TABLE public.wms_cc_sesiones ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.wms_cc_sesiones TO authenticated;
DROP POLICY IF EXISTS auth_all_wms_cc_sesiones ON public.wms_cc_sesiones;
CREATE POLICY auth_all_wms_cc_sesiones ON public.wms_cc_sesiones
  FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

CREATE TABLE IF NOT EXISTS public.wms_cc_conteos (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sesion_id          uuid REFERENCES public.wms_cc_sesiones(id) ON DELETE CASCADE,
  ubicacion          text,
  codigo_producto    text NOT NULL,
  descripcion        text,
  unidad_medida      text,
  partida            text,
  serie              text,
  fecha_vencimiento  date,
  cantidad_contada   numeric NOT NULL DEFAULT 0,
  cantidad_sistema   numeric DEFAULT 0,
  observaciones      text,
  estado             text,            -- CUADRADO | FALTA | SOBRA | SIN_STOCK
  contado_por        uuid,
  contado_por_nombre text,
  dispositivo        text,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_cc_conteos_sesion ON public.wms_cc_conteos (sesion_id);
CREATE INDEX IF NOT EXISTS idx_cc_conteos_codigo ON public.wms_cc_conteos (codigo_producto);
ALTER TABLE public.wms_cc_conteos ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.wms_cc_conteos TO authenticated;
DROP POLICY IF EXISTS auth_all_wms_cc_conteos ON public.wms_cc_conteos;
CREATE POLICY auth_all_wms_cc_conteos ON public.wms_cc_conteos
  FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- Costos unitarios por SKU (opcional, para el valorizado del conteo)
CREATE TABLE IF NOT EXISTS public.wms_cc_costos (
  codigo_producto text PRIMARY KEY,
  costo_unitario  numeric NOT NULL DEFAULT 0,
  updated_at      timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.wms_cc_costos ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.wms_cc_costos TO authenticated;
DROP POLICY IF EXISTS auth_all_wms_cc_costos ON public.wms_cc_costos;
CREATE POLICY auth_all_wms_cc_costos ON public.wms_cc_costos
  FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- ══════════════════════════════════════════════════════════════════════════
-- 3) BLOQUES / PALLETS con QR + AUDITORÍA
-- ══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.wms_bloques (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo            text UNIQUE NOT NULL,      -- código del QR (BLQ-XXXXXXXX)
  bodega            text NOT NULL,
  nombre            text,
  descripcion       text,
  estado            text NOT NULL DEFAULT 'activo',  -- activo | cerrado
  ubicacion         text,
  creado_por        uuid,
  creado_por_nombre text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_wms_bloques_bodega ON public.wms_bloques (bodega);
ALTER TABLE public.wms_bloques ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.wms_bloques TO authenticated;
DROP POLICY IF EXISTS auth_all_wms_bloques ON public.wms_bloques;
CREATE POLICY auth_all_wms_bloques ON public.wms_bloques
  FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

CREATE TABLE IF NOT EXISTS public.wms_bloque_items (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bloque_id         uuid NOT NULL REFERENCES public.wms_bloques(id) ON DELETE CASCADE,
  codigo_producto   text NOT NULL,
  descripcion       text,
  unidad_medida     text,
  partida           text,
  serie             text,
  fecha_vencimiento date,
  cantidad          numeric NOT NULL DEFAULT 0,
  observaciones     text,
  creado_por_nombre text,
  created_at        timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_wms_bloque_items_bloque ON public.wms_bloque_items (bloque_id);
ALTER TABLE public.wms_bloque_items ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.wms_bloque_items TO authenticated;
DROP POLICY IF EXISTS auth_all_wms_bloque_items ON public.wms_bloque_items;
CREATE POLICY auth_all_wms_bloque_items ON public.wms_bloque_items
  FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

CREATE TABLE IF NOT EXISTS public.wms_bloque_auditorias (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bloque_id      uuid NOT NULL REFERENCES public.wms_bloques(id) ON DELETE CASCADE,
  bloque_codigo  text,
  bodega         text,
  auditor_id     uuid,
  auditor_nombre text,
  esperado_total numeric DEFAULT 0,
  contado_total  numeric DEFAULT 0,
  items_total    integer DEFAULT 0,
  items_ok       integer DEFAULT 0,
  items_dif      integer DEFAULT 0,
  estado         text,                -- cuadrado | con_diferencias
  observaciones  text,
  created_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_wms_bloque_aud_bloque ON public.wms_bloque_auditorias (bloque_id, created_at DESC);
ALTER TABLE public.wms_bloque_auditorias ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.wms_bloque_auditorias TO authenticated;
DROP POLICY IF EXISTS auth_all_wms_bloque_auditorias ON public.wms_bloque_auditorias;
CREATE POLICY auth_all_wms_bloque_auditorias ON public.wms_bloque_auditorias
  FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

CREATE TABLE IF NOT EXISTS public.wms_bloque_auditoria_items (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auditoria_id    uuid NOT NULL REFERENCES public.wms_bloque_auditorias(id) ON DELETE CASCADE,
  codigo_producto text,
  descripcion     text,
  unidad_medida   text,
  partida         text,
  serie           text,
  esperada        numeric DEFAULT 0,
  contada         numeric DEFAULT 0,
  diferencia      numeric DEFAULT 0,
  estado          text                -- CUADRADO | FALTA | SOBRA
);
CREATE INDEX IF NOT EXISTS idx_wms_bloque_aud_items_aud ON public.wms_bloque_auditoria_items (auditoria_id);
ALTER TABLE public.wms_bloque_auditoria_items ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.wms_bloque_auditoria_items TO authenticated;
DROP POLICY IF EXISTS auth_all_wms_bloque_aud_items ON public.wms_bloque_auditoria_items;
CREATE POLICY auth_all_wms_bloque_aud_items ON public.wms_bloque_auditoria_items
  FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- ── Realtime para las tablas transaccionales (multi-dispositivo en vivo) ──────
DO $$
DECLARE t text;
BEGIN
  FOR t IN SELECT unnest(ARRAY['wms_cc_conteos','wms_bloques','wms_bloque_items','wms_proyecciones']) LOOP
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables
      WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename=t) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
    END IF;
  END LOOP;
END $$;
