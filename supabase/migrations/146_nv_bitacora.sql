-- ============================================================================
-- 146 · Bitácora / trazabilidad de Notas de Venta
-- ----------------------------------------------------------------------------
-- La ficha de una N.V. (Consulta · Info) tiene una sección "Actividad" que
-- mostraba siempre "Sin actividad registrada" porque no existía ningún registro
-- de auditoría. Se crea `tms_nv_bitacora` + un trigger que registra QUIÉN y
-- CUÁNDO: creación de la N.V., cada cambio de estado y ediciones de campos
-- clave. Se agrega la RPC `nv_bitacora` para leer el historial y se SIEMBRA la
-- bitácora histórica desde los timestamps de hito ya existentes (registro,
-- En Proceso, Shipping, En Ruta, Entregado) para que las N.V. antiguas también
-- muestren su trazabilidad.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.tms_nv_bitacora (
  id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  operacion_id    bigint,
  canal           text NOT NULL,
  nv              text NOT NULL,
  accion          text NOT NULL,            -- 'create' | 'estado' | 'update'
  estado_anterior text,
  estado_nuevo    text,
  campos          text,                     -- detalle legible del cambio
  operador        text,                     -- nombre del usuario (o 'Sistema'/'Histórico')
  operador_uid    uuid,
  exito           boolean NOT NULL DEFAULT true,
  ts              timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_nv_bitacora_nv ON public.tms_nv_bitacora (canal, nv, ts DESC);

ALTER TABLE public.tms_nv_bitacora ENABLE ROW LEVEL SECURITY;
-- Sin políticas: el acceso de lectura es SOLO por la RPC SECURITY DEFINER de abajo;
-- las escrituras las hace el trigger (definer) → bypassa RLS.

-- ── Trigger: registra creación / cambio de estado / edición ─────────────────
CREATE OR REPLACE FUNCTION public.tms_operaciones_bitacora()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_canal  text;
  v_nv     text;
  v_uid    uuid := auth.uid();
  v_nombre text;
  v_campos text;
BEGIN
  IF NEW.nv_ptm IS NOT NULL THEN
    v_canal := 'ptm';       v_nv := NEW.nv_ptm::text;
  ELSIF NEW.nv_orange IS NOT NULL AND NEW.nv_orange <> '' THEN
    v_canal := 'orange';    v_nv := NEW.nv_orange;
  ELSIF NEW.nv_farmapack IS NOT NULL AND NEW.nv_farmapack <> '' THEN
    v_canal := 'farmapack'; v_nv := NEW.nv_farmapack;
  ELSIF NEW.varios IS NOT NULL AND NEW.varios <> '' THEN
    v_canal := 'varios';    v_nv := NEW.varios;
  ELSE
    RETURN NEW;
  END IF;

  IF v_uid IS NOT NULL THEN
    SELECT nombre INTO v_nombre FROM public.tms_usuarios
     WHERE id = v_uid OR auth_uid = v_uid LIMIT 1;
  END IF;
  v_nombre := COALESCE(NULLIF(v_nombre, ''), CASE WHEN v_uid IS NULL THEN 'Sistema' ELSE 'Usuario' END);

  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.tms_nv_bitacora(operacion_id, canal, nv, accion, estado_nuevo, campos, operador, operador_uid)
    VALUES (NEW.id, v_canal, v_nv, 'create', NEW.estado,
            NULLIF('estado inicial: ' || COALESCE(NEW.estado, ''), 'estado inicial: '),
            v_nombre, v_uid);
    RETURN NEW;
  END IF;

  -- Cambio de estado
  IF COALESCE(NEW.estado, '') IS DISTINCT FROM COALESCE(OLD.estado, '') THEN
    INSERT INTO public.tms_nv_bitacora(operacion_id, canal, nv, accion, estado_anterior, estado_nuevo, campos, operador, operador_uid)
    VALUES (NEW.id, v_canal, v_nv, 'estado', OLD.estado, NEW.estado,
            COALESCE(OLD.estado, '—') || ' → ' || COALESCE(NEW.estado, '—'),
            v_nombre, v_uid);
  END IF;

  -- Edición de campos clave (una sola entrada agrupada)
  v_campos := concat_ws(', ',
    CASE WHEN COALESCE(NEW.transportista,'')      IS DISTINCT FROM COALESCE(OLD.transportista,'')      THEN 'transportista' END,
    CASE WHEN NEW.fecha_compromiso                IS DISTINCT FROM OLD.fecha_compromiso                THEN 'compromiso'    END,
    CASE WHEN COALESCE(NEW.urgente,false)         IS DISTINCT FROM COALESCE(OLD.urgente,false)         THEN 'urgente'       END,
    CASE WHEN COALESCE(NEW.guia,'')               IS DISTINCT FROM COALESCE(OLD.guia,'')               THEN 'guía'          END,
    CASE WHEN COALESCE(NEW.factura,'')            IS DISTINCT FROM COALESCE(OLD.factura,'')            THEN 'factura'       END,
    CASE WHEN COALESCE(NEW.bultos,-1)             IS DISTINCT FROM COALESCE(OLD.bultos,-1)             THEN 'bultos'        END
  );
  IF v_campos IS NOT NULL AND v_campos <> '' THEN
    INSERT INTO public.tms_nv_bitacora(operacion_id, canal, nv, accion, campos, operador, operador_uid)
    VALUES (NEW.id, v_canal, v_nv, 'update', v_campos, v_nombre, v_uid);
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_operaciones_bitacora ON public.tms_operaciones;
CREATE TRIGGER trg_operaciones_bitacora
  AFTER INSERT OR UPDATE ON public.tms_operaciones
  FOR EACH ROW
  EXECUTE FUNCTION public.tms_operaciones_bitacora();

-- ── RPC de lectura del historial de una N.V. ────────────────────────────────
CREATE OR REPLACE FUNCTION public.nv_bitacora(p_nv text, p_canal text DEFAULT 'ptm', p_limit int DEFAULT 60)
RETURNS TABLE (
  id bigint, accion text, operador text, campos text,
  estado_anterior text, estado_nuevo text, exito boolean, ts timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, accion, operador, campos, estado_anterior, estado_nuevo, exito, ts
    FROM public.tms_nv_bitacora
   WHERE nv = p_nv
     AND (p_canal IS NULL OR canal = lower(p_canal))
   ORDER BY ts DESC, id DESC
   LIMIT COALESCE(p_limit, 60);
$$;

REVOKE ALL ON FUNCTION public.nv_bitacora(text, text, int) FROM anon;
GRANT EXECUTE ON FUNCTION public.nv_bitacora(text, text, int) TO authenticated;

-- ── Seed histórico desde los timestamps de hito existentes ──────────────────
WITH ops AS (
  SELECT id,
    CASE WHEN nv_ptm IS NOT NULL THEN 'ptm'
         WHEN nv_orange IS NOT NULL AND nv_orange <> '' THEN 'orange'
         WHEN nv_farmapack IS NOT NULL AND nv_farmapack <> '' THEN 'farmapack'
         ELSE 'varios' END AS canal,
    CASE WHEN nv_ptm IS NOT NULL THEN nv_ptm::text
         WHEN nv_orange IS NOT NULL AND nv_orange <> '' THEN nv_orange
         WHEN nv_farmapack IS NOT NULL AND nv_farmapack <> '' THEN nv_farmapack
         ELSE varios END AS nv,
    fecha_registro_nv, fecha_aprobacion, fecha_aprobacion_real,
    fecha_en_proceso, fecha_shipping, fecha_en_ruta, fecha_entregado
  FROM public.tms_operaciones
)
INSERT INTO public.tms_nv_bitacora(operacion_id, canal, nv, accion, estado_nuevo, campos, operador, ts)
SELECT o.id, o.canal, o.nv, m.accion, m.estado, m.campos, 'Histórico', m.ts
FROM ops o
CROSS JOIN LATERAL (VALUES
  ('create', NULL::text,       NULL::text,
     COALESCE(o.fecha_registro_nv, o.fecha_aprobacion_real::timestamptz, o.fecha_aprobacion::timestamptz)),
  ('estado', 'En Proceso',     'En Proceso', o.fecha_en_proceso::timestamptz),
  ('estado', 'Shipping',       'Shipping',   o.fecha_shipping::timestamptz),
  ('estado', 'En Ruta',        'En Ruta',    o.fecha_en_ruta::timestamptz),
  ('estado', 'Entregado',      'Entregado',  o.fecha_entregado::timestamptz)
) AS m(accion, estado, campos, ts)
WHERE m.ts IS NOT NULL
  AND o.nv IS NOT NULL AND o.nv <> '';

-- Seed suplementario: para N.V. históricas SIN timestamps por estado, registrar
-- al menos el ESTADO ACTUAL usando la mejor fecha disponible (estado → registro →
-- aprobación). No duplica si ya existe un registro de ese estado.
WITH ops AS (
  SELECT id, estado,
    coalesce(fecha_estado, fecha_registro_nv, fecha_aprobacion_real::timestamptz, fecha_aprobacion::timestamptz) AS ts,
    CASE WHEN nv_ptm IS NOT NULL THEN 'ptm'
         WHEN nv_orange IS NOT NULL AND nv_orange <> '' THEN 'orange'
         WHEN nv_farmapack IS NOT NULL AND nv_farmapack <> '' THEN 'farmapack'
         ELSE 'varios' END AS canal,
    CASE WHEN nv_ptm IS NOT NULL THEN nv_ptm::text
         WHEN nv_orange IS NOT NULL AND nv_orange <> '' THEN nv_orange
         WHEN nv_farmapack IS NOT NULL AND nv_farmapack <> '' THEN nv_farmapack
         ELSE varios END AS nv
  FROM public.tms_operaciones
)
INSERT INTO public.tms_nv_bitacora(operacion_id, canal, nv, accion, estado_nuevo, campos, operador, ts)
SELECT o.id, o.canal, o.nv, 'estado', o.estado, o.estado, 'Histórico', o.ts
FROM ops o
WHERE o.estado IS NOT NULL AND o.estado <> '' AND o.ts IS NOT NULL
  AND o.nv IS NOT NULL AND o.nv <> ''
  AND NOT EXISTS (SELECT 1 FROM public.tms_nv_bitacora b
                  WHERE b.operacion_id = o.id AND b.accion = 'estado' AND b.estado_nuevo = o.estado);
