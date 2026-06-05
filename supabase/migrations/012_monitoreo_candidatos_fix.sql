-- ============================================================
-- MIGRACIÓN 012: Fix de monitoreo_candidatos (ubicaciones reales)
-- Fecha: 2026-06-04
-- ============================================================
-- PROBLEMA: la versión original (011) se alimentaba de tms_partidas/tms_farmapack
-- (una fila por SKU+lote) y resolvía UNA sola ubicación por SKU con
-- `ORDER BY u.cantidad DESC LIMIT 1`. Como un SKU puede estar en muchas ubicaciones
-- físicas, el informe mostraba una ubicación incorrecta (o filas duplicadas con la
-- misma ubicación), que NO coincidía con la vista de Ubicaciones WMS.
--
-- SOLUCIÓN: la fuente de verdad física es `wms_ubicaciones` (UNIQUE(ubicacion, codigo)),
-- la misma que alimenta WmsLocations.jsx. Ahora se devuelve UNA fila candidata por
-- (SKU, ubicación) real con cantidad>0, enriquecida con vencimiento / unidad de medida /
-- producto desde el stock (tms_partidas/tms_farmapack) por codigo (+partida cuando aplica).
--
-- Es IDEMPOTENTE (CREATE OR REPLACE). Solo reemplaza la función; no toca datos ni esquema.
-- Mantiene la firma (text, boolean) y los nombres de campos que consume InformeBuilder.
-- ============================================================

CREATE OR REPLACE FUNCTION public.monitoreo_candidatos(p_query text, p_solo_vencimiento boolean DEFAULT false)
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  WITH q AS (SELECT '%' || trim(coalesce(p_query, '')) || '%' AS term),
  -- Vencimiento / UM / producto por SKU(+lote) desde el stock (columnas date confiables).
  venc AS (
    SELECT codigo_producto, partida, unidad_medida, producto, fecha_vencimiento
    FROM tms_partidas
    UNION ALL
    SELECT codigo_producto, lote AS partida, unidad_medida, producto, fecha_vencimiento
    FROM tms_farmapack
  ),
  -- Base: una fila por (SKU, ubicación) REAL con stock físico (verdad de wms_ubicaciones).
  base AS (
    SELECT
      u.codigo                                       AS codigo_producto,
      coalesce(v.producto, u.descripcion)            AS producto,
      coalesce(nullif(u.partida, ''), '')            AS partida,
      u.ubicacion                                    AS ubicacion,
      u.cantidad                                     AS disponible,
      v.unidad_medida                                AS unidad_medida,
      coalesce(u.fecha_vencimiento, v.fecha_vencimiento) AS fecha_vencimiento
    FROM wms_ubicaciones u
    CROSS JOIN q
    LEFT JOIN LATERAL (
      SELECT vv.unidad_medida, vv.producto, vv.fecha_vencimiento
      FROM venc vv
      WHERE vv.codigo_producto = u.codigo
        AND (u.partida IS NULL OR u.partida = '' OR vv.partida = u.partida)
      ORDER BY vv.fecha_vencimiento NULLS LAST
      LIMIT 1
    ) v ON true
    WHERE coalesce(u.cantidad, 0) > 0
      AND (u.codigo ILIKE q.term OR coalesce(u.descripcion, '') ILIKE q.term)
  ),
  calc AS (
    SELECT b.*,
      CASE
        WHEN b.fecha_vencimiento IS NULL THEN 'NA'
        WHEN b.fecha_vencimiento <= current_date + INTERVAL '30 days' THEN 'ROJO'
        WHEN b.fecha_vencimiento <= current_date + INTERVAL '90 days' THEN 'NARANJA'
        ELSE 'VERDE'
      END AS semaforo,
      CASE WHEN b.fecha_vencimiento IS NULL THEN 'NO_PERECIBLE' ELSE 'PERECIBLE' END AS tipo
    FROM base b
  )
  SELECT coalesce(jsonb_agg(row_to_json(c) ORDER BY c.ubicacion, c.codigo_producto), '[]'::jsonb)
  FROM calc c
  WHERE (NOT p_solo_vencimiento) OR c.semaforo IN ('ROJO', 'NARANJA');
$function$;

-- Grants (idénticos a 011): SECURITY DEFINER no ejecutable por anon.
REVOKE EXECUTE ON FUNCTION public.monitoreo_candidatos(text, boolean) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.monitoreo_candidatos(text, boolean) TO authenticated, service_role;
