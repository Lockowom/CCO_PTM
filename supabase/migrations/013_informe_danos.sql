-- ============================================================
-- MIGRACIÓN 013: Informe de Daños / No Conformidad con evidencia fotográfica
-- Fecha: 2026-06-04
-- ============================================================
-- Añade un segundo tipo de informe al módulo de Monitoreo a Calidad: el
-- "Informe de Daños / No Conformidad" (mercadería dañada), con secciones narrativas
-- formales (antecedentes, hallazgos, cuadro resumen, causa probable, acciones, firmas)
-- y EVIDENCIA FOTOGRÁFICA por hallazgo, exportable a Word y PDF desde el cliente.
--
-- Contenido:
--   1) tms_monitoreo_informes: + tipo_informe (MONITOREO|DANOS) + reporte jsonb.
--   2) tms_monitoreo_items: + tipo_dano, componente_afectado, consecuencia
--      (en daños el SKU/lote/ubicación es OPCIONAL).
--   3) tms_monitoreo_evidencias: fotos por hallazgo/ítem (espejo de tms_fichas_imagenes).
--   4) Storage: bucket público 'monitoreo-evidencias' + políticas de escritura.
--
-- Es IDEMPOTENTE (ADD COLUMN IF NOT EXISTS / CREATE IF NOT EXISTS / DROP POLICY IF EXISTS).
-- Es ADITIVO: no modifica datos existentes (los informes actuales quedan tipo_informe='MONITOREO').
-- Reutiliza el helper can_manage_calidad() y el trigger update_updated_at_column() de la 011.
-- ============================================================

-- ─────────────────────────────────────────────────────────────────────────
-- 1) Cabecera: tipo de informe + bloque narrativo (jsonb)
-- ─────────────────────────────────────────────────────────────────────────
ALTER TABLE public.tms_monitoreo_informes
  ADD COLUMN IF NOT EXISTS tipo_informe text NOT NULL DEFAULT 'MONITOREO';  -- MONITOREO|DANOS

ALTER TABLE public.tms_monitoreo_informes
  ADD COLUMN IF NOT EXISTS reporte jsonb;
-- reporte = {
--   clasificacion, area_responsable, fecha_recepcion, tipo_producto,
--   antecedentes, descripcion_hallazgo, analisis_causa,
--   acciones_recomendadas: [text],
--   cuadro_resumen: [{ indicador, valor }],
--   elaborado_por, revisado_por
-- }

-- ─────────────────────────────────────────────────────────────────────────
-- 2) Detalle: campos del hallazgo (daños)
-- ─────────────────────────────────────────────────────────────────────────
ALTER TABLE public.tms_monitoreo_items
  ADD COLUMN IF NOT EXISTS tipo_dano          text,   -- p.ej. Deformación por aplastamiento
  ADD COLUMN IF NOT EXISTS componente_afectado text,  -- p.ej. Pilar / Panel
  ADD COLUMN IF NOT EXISTS consecuencia       text;   -- p.ej. No apto para despacho

-- ─────────────────────────────────────────────────────────────────────────
-- 3) Evidencia fotográfica por hallazgo/ítem
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.tms_monitoreo_evidencias (
  id            uuid        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  informe_id    uuid        NOT NULL REFERENCES public.tms_monitoreo_informes(id) ON DELETE CASCADE,
  item_id       uuid        REFERENCES public.tms_monitoreo_items(id) ON DELETE CASCADE,
  imagen_url    text        NOT NULL,            -- URL público de Supabase Storage
  storage_path  text        NOT NULL,            -- ruta en el bucket (para delete)
  descripcion   text,                            -- pie de foto / descripción corta
  orden         integer     NOT NULL DEFAULT 0,
  creado_por    uuid,
  creado_nombre text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_monitoreo_evidencias_informe ON public.tms_monitoreo_evidencias (informe_id);
CREATE INDEX IF NOT EXISTS idx_monitoreo_evidencias_item    ON public.tms_monitoreo_evidencias (item_id);

ALTER TABLE public.tms_monitoreo_evidencias ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tms_monitoreo_evidencias TO authenticated;

DROP POLICY IF EXISTS monitoreo_evidencias_select ON public.tms_monitoreo_evidencias;
CREATE POLICY monitoreo_evidencias_select ON public.tms_monitoreo_evidencias
  FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS monitoreo_evidencias_insert ON public.tms_monitoreo_evidencias;
CREATE POLICY monitoreo_evidencias_insert ON public.tms_monitoreo_evidencias
  FOR INSERT TO authenticated WITH CHECK (can_manage_calidad());
DROP POLICY IF EXISTS monitoreo_evidencias_update ON public.tms_monitoreo_evidencias;
CREATE POLICY monitoreo_evidencias_update ON public.tms_monitoreo_evidencias
  FOR UPDATE TO authenticated USING (can_manage_calidad()) WITH CHECK (can_manage_calidad());
DROP POLICY IF EXISTS monitoreo_evidencias_delete ON public.tms_monitoreo_evidencias;
CREATE POLICY monitoreo_evidencias_delete ON public.tms_monitoreo_evidencias
  FOR DELETE TO authenticated USING (can_manage_calidad());

-- ─────────────────────────────────────────────────────────────────────────
-- 4) STORAGE: bucket público + políticas de escritura restringidas
-- ─────────────────────────────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('monitoreo-evidencias', 'monitoreo-evidencias', true, 8388608,
        ARRAY['image/jpeg','image/png','image/webp','image/heic','image/heif'])
ON CONFLICT (id) DO NOTHING;

-- Subir / editar / borrar objetos del bucket: solo gestores de Calidad.
-- (No se crea política SELECT: el bucket es público, los URLs sirven sin listar.)
DROP POLICY IF EXISTS monitoreo_evid_obj_insert ON storage.objects;
CREATE POLICY monitoreo_evid_obj_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'monitoreo-evidencias' AND can_manage_calidad());

DROP POLICY IF EXISTS monitoreo_evid_obj_update ON storage.objects;
CREATE POLICY monitoreo_evid_obj_update ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'monitoreo-evidencias' AND can_manage_calidad())
  WITH CHECK (bucket_id = 'monitoreo-evidencias' AND can_manage_calidad());

DROP POLICY IF EXISTS monitoreo_evid_obj_delete ON storage.objects;
CREATE POLICY monitoreo_evid_obj_delete ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'monitoreo-evidencias' AND can_manage_calidad());
