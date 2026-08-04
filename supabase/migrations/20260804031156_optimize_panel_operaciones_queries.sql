-- Cubre la carga del panel: filtro por estado y orden estable para paginación.
-- No modifica la vista tms_operaciones_vigentes ni su semántica de última fila.
CREATE INDEX IF NOT EXISTS ix_tms_operaciones_estado_fecha_id
  ON public.tms_operaciones (estado, fecha_estado DESC NULLS LAST, id DESC);
