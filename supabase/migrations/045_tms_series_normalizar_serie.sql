-- 045_tms_series_normalizar_serie.sql
-- ============================================================
-- Mismo fix que 044 pero para tms_series (mismo bug: UNIQUE(codigo_producto,
-- serie) no deduplica las filas sin serie porque serie vacía va como NULL).
-- Se hallaron 44.358 filas duplicadas por serie NULL acumuladas en cada carga.
--
-- Prevención: normalizar la serie (NULL/espacios → '') en cada INSERT/UPDATE.
-- Limpieza única vía MCP (respaldo public.tms_series_backup_20260709), mismos
-- 3 pasos que partidas: tms_series 49.432 → 5.074 filas.
-- ============================================================

CREATE OR REPLACE FUNCTION public._tms_series_norm_serie()
 RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.serie := coalesce(nullif(btrim(NEW.serie), ''), '');
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS tms_series_norm_serie ON public.tms_series;
CREATE TRIGGER tms_series_norm_serie
  BEFORE INSERT OR UPDATE ON public.tms_series
  FOR EACH ROW EXECUTE FUNCTION public._tms_series_norm_serie();
