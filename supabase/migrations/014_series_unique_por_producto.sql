-- ============================================================
-- MIGRACIÓN 014: Serie única POR PRODUCTO (no global)
-- Fecha: 2026-06-10
-- ============================================================
-- PROBLEMA: tms_series tenía UNIQUE (serie), tratando el número de serie como
-- único a nivel global. En la realidad, el MISMO número de serie aparece para
-- códigos de producto distintos (la serie es única por SKU, no global). Por eso
-- la importación de Series, que deduplica con la clave de la tabla y hace upsert
-- ON CONFLICT (serie), colapsaba esas filas ("el último gana") y dejaba fuera
-- mucha información válida (p. ej. 2843 filas de 4793 descartadas como
-- "duplicadas (misma clave: serie)").
--
-- SOLUCIÓN: la clave de negocio correcta es (codigo_producto, serie). Se sustituye
-- la restricción UNIQUE (serie) por UNIQUE (codigo_producto, serie), igual que
-- tms_farmapack usa (codigo_producto, lote). Esto habilita el upsert por la pareja
-- correcta y conserva las series repetidas entre productos.
--
-- Es IDEMPOTENTE (DROP IF EXISTS / ADD … solo si no existe vía DO block).
-- Verificado en la BD live: no hay FKs que referencien tms_series y la pareja
-- (codigo_producto, serie) ya es única en los datos actuales (sin violación).
-- ============================================================

-- 1) Quitar la restricción global obsoleta.
ALTER TABLE public.tms_series DROP CONSTRAINT IF EXISTS tms_series_uniq;

-- 2) Añadir la restricción compuesta correcta (solo si aún no existe).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.tms_series'::regclass
      AND conname = 'tms_series_uniq_prod_serie'
  ) THEN
    ALTER TABLE public.tms_series
      ADD CONSTRAINT tms_series_uniq_prod_serie UNIQUE (codigo_producto, serie);
  END IF;
END $$;
