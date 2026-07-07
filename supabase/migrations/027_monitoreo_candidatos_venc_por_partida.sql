-- 027_monitoreo_candidatos_venc_por_partida.sql
-- FIX CA-10: monitoreo_candidatos heredaba la fecha_vencimiento de la partida de
-- MENOR vencimiento del SKU cuando la ubicación no traía partida (u.partida = '')
-- o vía un LATERAL que aceptaba cualquier lote → un SKU no perecible (o un lote
-- distinto) quedaba marcado PERECIBLE con un semáforo/vencimiento que no
-- corresponde a esa ubicación.
-- Solución: la unidad_medida/producto se siguen tomando por SKU (no son propias
-- del lote), pero la fecha_vencimiento SOLO se hereda de tms_partidas/farmapack
-- cuando la partida de la ubicación coincide exactamente con la del lote. Si la
-- ubicación no tiene partida y wms_ubicaciones no trae vencimiento propio, queda
-- NA / NO_PERECIBLE (honesto: no se conoce el lote).

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
      -- vencimiento propio de la ubicación, o el del lote SOLO si la partida coincide
      coalesce(u.fecha_vencimiento, vf.fecha_vencimiento) AS fecha_vencimiento
    FROM wms_ubicaciones u
    CROSS JOIN q
    -- producto / unidad de medida por SKU (no dependen del lote)
    LEFT JOIN LATERAL (
      SELECT vv.unidad_medida, vv.producto
      FROM venc vv
      WHERE vv.codigo_producto = u.codigo
      ORDER BY vv.fecha_vencimiento NULLS LAST
      LIMIT 1
    ) v ON true
    -- vencimiento SOLO cuando la partida de la ubicación matchea el lote
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
