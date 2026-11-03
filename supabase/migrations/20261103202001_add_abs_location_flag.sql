-- Preparación de ubicaciones ABS. Esta marca no altera las reglas actuales
-- de Calidad, Transitorio, stock, ERP ni operaciones WMS.
ALTER TABLE public.wms_ubicaciones_maestras
  ADD COLUMN IF NOT EXISTS es_ubicacion_abs boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.wms_ubicaciones_maestras.es_ubicacion_abs IS
  'Reserva futura para posiciones físicas ABS. Es informativa hasta que se defina una regla operativa explícita.';

CREATE INDEX IF NOT EXISTS wms_ubicaciones_maestras_abs_idx
  ON public.wms_ubicaciones_maestras (es_ubicacion_abs, activo, ubicacion)
  WHERE es_ubicacion_abs;
