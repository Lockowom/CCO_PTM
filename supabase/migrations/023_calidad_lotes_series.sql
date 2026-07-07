-- 023_calidad_lotes_series.sql
-- Sincronizada desde la BD live (schema_migrations version 20260707011200,
-- nombre original "019_calidad_lotes_series"). Renumerada a 023.
-- Lista de lotes (tms_partidas) y series (tms_series) de un producto, para
-- elegir en la toma de calidad. Filtrable por texto (p_query), acotada por p_limit.

CREATE OR REPLACE FUNCTION public.calidad_lotes_series(
  p_codigo text,
  p_query  text DEFAULT '',
  p_limit  integer DEFAULT 300
)
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  WITH q AS (SELECT '%' || btrim(coalesce(p_query, '')) || '%' AS term),
  lotes AS (
    SELECT 'P'::text AS tipo, p.partida AS valor,
           coalesce(p.disponible, 0) AS disponible,
           p.fecha_vencimiento::text AS venc,
           u.ubicacion AS ubicacion
    FROM tms_partidas p
    CROSS JOIN q
    LEFT JOIN LATERAL (
      SELECT wu.ubicacion FROM wms_ubicaciones wu
      WHERE wu.codigo = p.codigo_producto
        AND coalesce(wu.partida,'') = coalesce(p.partida,'')
      ORDER BY wu.cantidad DESC NULLS LAST LIMIT 1
    ) u ON true
    WHERE p.codigo_producto = p_codigo
      AND coalesce(p.partida,'') <> ''
      AND p.partida ILIKE (SELECT term FROM q)
  ),
  sers AS (
    SELECT 'S'::text AS tipo, s.serie AS valor,
           coalesce(s.disponible, 0) AS disponible,
           NULL::text AS venc,
           nullif(btrim(coalesce(s.ubicacion_actual,'')),'') AS ubicacion
    FROM tms_series s
    CROSS JOIN q
    WHERE s.codigo_producto = p_codigo
      AND coalesce(s.serie,'') <> ''
      AND s.serie ILIKE (SELECT term FROM q)
  ),
  merged AS (
    SELECT * FROM lotes
    UNION ALL
    SELECT * FROM sers
    ORDER BY tipo, valor
    LIMIT greatest(1, least(coalesce(p_limit,300), 1000))
  )
  SELECT coalesce(jsonb_agg(row_to_json(m)), '[]'::jsonb) FROM merged m;
$function$;

REVOKE EXECUTE ON FUNCTION public.calidad_lotes_series(text, text, integer) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.calidad_lotes_series(text, text, integer) TO authenticated, service_role;
