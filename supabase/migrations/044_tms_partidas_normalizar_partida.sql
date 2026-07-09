-- 044_tms_partidas_normalizar_partida.sql
-- ============================================================
-- FIX de integridad del STOCK (tms_partidas): duplicados por partida NULL.
-- ============================================================
-- Bug: el índice UNIQUE(codigo_producto, partida) NO deduplica las filas SIN
-- lote porque `bulk_upsert` (mig 009) convierte la partida vacía '' → NULL, y
-- en Postgres los NULL no chocan entre sí en un índice único. Resultado: cada
-- carga semanal RE-INSERTA las filas sin lote (ON CONFLICT nunca matchea) →
-- acumulación masiva (se hallaron 45.681 filas duplicadas; hasta 31 copias de
-- una misma fila sin lote) → el stock aparecía inflado/sumado.
--
-- Prevención: normalizar la partida (NULL/espacios → '') en cada INSERT/UPDATE.
-- Con partida siempre '' (no NULL), UNIQUE(codigo_producto, partida) ya
-- deduplica las filas sin lote y el upsert del import actualiza en vez de apilar.
--
-- Limpieza de los duplicados ya acumulados: se ejecutó una sola vez vía MCP
-- (con respaldo public.tms_partidas_backup_20260709), en tres pasos:
--   1) colapsar duplicados por (codigo_producto, partida normalizada) → la más
--      reciente (updated_at);
--   2) quitar la fila SIN lote cuando su stock_total DUPLICA la suma del lote
--      real del mismo SKU (1.024 casos, p.ej. NGE12450390P);
--   3) normalizar la partida a '' en las filas restantes.
--   tms_partidas: 51.489 → 4.784 filas (3.044 SKUs intactos).
-- ============================================================

CREATE OR REPLACE FUNCTION public._tms_partidas_norm_partida()
 RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.partida := coalesce(nullif(btrim(NEW.partida), ''), '');
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS tms_partidas_norm_partida ON public.tms_partidas;
CREATE TRIGGER tms_partidas_norm_partida
  BEFORE INSERT OR UPDATE ON public.tms_partidas
  FOR EACH ROW EXECUTE FUNCTION public._tms_partidas_norm_partida();
