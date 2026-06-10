-- ============================================================
-- MIGRACIÓN 015: Maestro de Direcciones — columna Transporte,
--                búsqueda más rápida (RPC única + índices trigram) y edición
-- Fecha: 2026-06-10
-- ============================================================
-- 1) Nueva columna `transporte` (texto libre): transportista / nota de
--    transporte por punto de entrega (ej. "Transportes XYZ", "Retira cliente").
-- 2) Índices GIN trigram en las columnas que se buscan con ILIKE '%term%'
--    (hoy solo razon_social tenía índice trigram → nombre/rut/direccion/comuna
--    hacían seq-scan sobre 8k filas). Aceleran la coincidencia parcial.
-- 3) RPC `buscar_direcciones(p_query, p_limit)`: hace en UNA sola ida al servidor
--    lo que el cliente hacía en 2-3 (exact ILIKE + fuzzy + fetch de extras),
--    devolviendo resultados ya rankeados por relevancia (RUT exacto > prefijo de
--    razón social > similitud trigram). SECURITY DEFINER, no ejecutable por anon.
--
-- Es IDEMPOTENTE (ADD COLUMN IF NOT EXISTS / CREATE INDEX IF NOT EXISTS /
-- CREATE OR REPLACE). La edición de registros la cubre la RLS existente
-- (`auth_all_direcciones`, authenticated). No cambia datos existentes.
-- ============================================================

-- 1) Columna Transporte ─────────────────────────────────────────────────────
ALTER TABLE public.tms_direcciones
  ADD COLUMN IF NOT EXISTS transporte text;

-- 2) Índices trigram para ILIKE parcial rápido ──────────────────────────────
CREATE INDEX IF NOT EXISTS idx_trgm_direcciones_nombre
  ON public.tms_direcciones USING gin (nombre gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_trgm_direcciones_rut
  ON public.tms_direcciones USING gin (rut gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_trgm_direcciones_direccion
  ON public.tms_direcciones USING gin (direccion gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_trgm_direcciones_comuna
  ON public.tms_direcciones USING gin (comuna gin_trgm_ops);

-- 3) RPC de búsqueda única y rankeada ───────────────────────────────────────
CREATE OR REPLACE FUNCTION public.buscar_direcciones(p_query text, p_limit integer DEFAULT 50)
 RETURNS SETOF public.tms_direcciones
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  WITH q AS (SELECT btrim(coalesce(p_query, '')) AS term)
  SELECT d.*
  FROM public.tms_direcciones d, q
  WHERE q.term <> ''
    AND (
      d.razon_social ILIKE '%' || q.term || '%'
      OR d.nombre    ILIKE '%' || q.term || '%'
      OR d.rut       ILIKE '%' || q.term || '%'
      OR d.direccion ILIKE '%' || q.term || '%'
      OR d.comuna    ILIKE '%' || q.term || '%'
    )
  ORDER BY
    (lower(coalesce(d.rut, '')) = lower((SELECT term FROM q))) DESC,           -- RUT exacto primero
    (coalesce(d.razon_social, '') ILIKE (SELECT term FROM q) || '%') DESC,     -- luego prefijo de razón social
    GREATEST(
      extensions.similarity(coalesce(d.razon_social, ''), (SELECT term FROM q)),
      extensions.similarity(coalesce(d.nombre, ''),       (SELECT term FROM q))
    ) DESC,                                                                     -- luego similitud trigram
    d.razon_social ASC
  LIMIT GREATEST(1, LEAST(coalesce(p_limit, 50), 100));
$function$;

REVOKE EXECUTE ON FUNCTION public.buscar_direcciones(text, integer) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.buscar_direcciones(text, integer) TO authenticated, service_role;
