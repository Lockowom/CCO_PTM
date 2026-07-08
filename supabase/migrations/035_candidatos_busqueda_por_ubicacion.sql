-- 035_candidatos_busqueda_por_ubicacion.sql
-- El buscador de stock (monitoreo_candidatos) solo emparejaba por código o
-- descripción, así que buscar por UBICACIÓN (p. ej. "D-01-01") no devolvía nada
-- y no se podían ver los SKUs de una ubicación al asignar a Calidad (hito 2) ni
-- al armar un informe de Monitoreo. Se agrega la ubicación al criterio de búsqueda.
CREATE OR REPLACE FUNCTION public.monitoreo_candidatos(p_query text, p_solo_vencimiento boolean DEFAULT false)
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  WITH q AS (SELECT '%' || trim(coalesce(p_query, '')) || '%' AS term),
  venc AS (
    SELECT codigo_producto, partida, unidad_medida, producto, fecha_vencimiento
    FROM tms_partidas
    UNION ALL
    SELECT codigo_producto, lote AS partida, unidad_medida, producto, fecha_vencimiento
    FROM tms_farmapack
  ),
  base AS (
    SELECT
      u.codigo                                       AS codigo_producto,
      coalesce(v.producto, u.descripcion)            AS producto,
      coalesce(nullif(u.partida, ''), '')            AS partida,
      u.ubicacion                                    AS ubicacion,
      u.cantidad                                     AS disponible,
      v.unidad_medida                                AS unidad_medida,
      coalesce(u.fecha_vencimiento, vf.fecha_vencimiento) AS fecha_vencimiento
    FROM wms_ubicaciones u
    CROSS JOIN q
    LEFT JOIN LATERAL (
      SELECT vv.unidad_medida, vv.producto
      FROM venc vv
      WHERE vv.codigo_producto = u.codigo
      ORDER BY vv.fecha_vencimiento NULLS LAST
      LIMIT 1
    ) v ON true
    LEFT JOIN LATERAL (
      SELECT vv.fecha_vencimiento
      FROM venc vv
      WHERE vv.codigo_producto = u.codigo
        AND nullif(u.partida, '') IS NOT NULL
        AND vv.partida = u.partida
      ORDER BY vv.fecha_vencimiento NULLS LAST
      LIMIT 1
    ) vf ON true
    WHERE coalesce(u.cantidad, 0) > 0
      AND (u.codigo ILIKE q.term
           OR coalesce(u.descripcion, '') ILIKE q.term
           OR coalesce(u.ubicacion, '') ILIKE q.term)
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
