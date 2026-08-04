-- Las búsquedas exactas del Panel leen una sola N.V. desde tms_operaciones.
-- Estos índices permiten ubicar y ordenar la versión más reciente sin recorrer
-- la vista tms_operaciones_vigentes completa.
CREATE INDEX IF NOT EXISTS ix_tms_oper_nv_ptm_fecha_id
  ON public.tms_operaciones (nv_ptm, fecha_estado DESC NULLS LAST, id DESC)
  WHERE nv_ptm IS NOT NULL;

CREATE INDEX IF NOT EXISTS ix_tms_oper_nv_orange_fecha_id
  ON public.tms_operaciones (nv_orange, fecha_estado DESC NULLS LAST, id DESC)
  WHERE nv_orange IS NOT NULL;

CREATE INDEX IF NOT EXISTS ix_tms_oper_nv_farmapack_fecha_id
  ON public.tms_operaciones (nv_farmapack, fecha_estado DESC NULLS LAST, id DESC)
  WHERE nv_farmapack IS NOT NULL;

CREATE INDEX IF NOT EXISTS ix_tms_oper_varios_fecha_id
  ON public.tms_operaciones (varios, fecha_estado DESC NULLS LAST, id DESC)
  WHERE varios IS NOT NULL;
