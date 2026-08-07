-- Hito 3 / Salida: el buscador anterior reutilizaba monitoreo_candidatos(),
-- que por diseño solo devuelve ubicaciones con stock WMS positivo. Este RPC
-- conserva esos resultados, pero agrega SKUs del catálogo histórico cuando ya
-- no tienen stock actual.
CREATE OR REPLACE FUNCTION public.calidad_salida_candidatos(
  p_query text,
  p_limit integer DEFAULT 100
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_query text := btrim(coalesce(p_query, ''));
  v_limit integer := least(greatest(coalesce(p_limit, 100), 1), 200);
  v_result jsonb;
BEGIN
  PERFORM public._monitoreo_assert_permiso();

  WITH fuentes AS (
    SELECT
      btrim(split_part(coalesce(u.codigo, ''), E'\t', 1), E' \t\r\n"') AS codigo,
      nullif(btrim(u.descripcion), '') AS producto,
      NULL::text AS unidad_medida,
      1 AS prioridad
    FROM public.wms_ubicaciones u

    UNION ALL

    SELECT
      btrim(split_part(coalesce(m.codigo_producto, ''), E'\t', 1), E' \t\r\n"'),
      nullif(btrim(coalesce(nullif(m.producto, ''), split_part(m.codigo_producto, E'\t', 2))), ''),
      nullif(btrim(coalesce(nullif(m.unidad_medida, ''), split_part(m.codigo_producto, E'\t', 3))), ''),
      2
    FROM public.tms_matriz_codigos m

    UNION ALL

    SELECT btrim(p.codigo_producto, E' \t\r\n"'), nullif(btrim(p.producto), ''),
           nullif(btrim(p.unidad_medida), ''), 3
    FROM public.tms_partidas p

    UNION ALL

    SELECT btrim(s.codigo_producto, E' \t\r\n"'), nullif(btrim(s.producto), ''),
           nullif(btrim(s.unidad_medida), ''), 4
    FROM public.tms_series s

    UNION ALL

    SELECT btrim(f.codigo_producto, E' \t\r\n"'), nullif(btrim(f.producto), ''),
           nullif(btrim(f.unidad_medida), ''), 5
    FROM public.tms_farmapack f
  ),
  catalogo AS (
    SELECT
      upper(codigo) AS codigo_producto,
      coalesce(
        (array_agg(producto ORDER BY prioridad) FILTER (WHERE producto IS NOT NULL))[1],
        'Sin descripción'
      ) AS producto,
      coalesce(
        (array_agg(unidad_medida ORDER BY prioridad) FILTER (WHERE unidad_medida IS NOT NULL))[1],
        'UN'
      ) AS unidad_medida
    FROM fuentes
    WHERE nullif(codigo, '') IS NOT NULL
    GROUP BY upper(codigo)
  ),
  stock AS (
    SELECT
      upper(btrim(u.codigo, E' \t\r\n"')) AS codigo_producto,
      nullif(btrim(u.partida), '') AS partida,
      max(nullif(btrim(u.descripcion), '')) AS producto,
      sum(greatest(coalesce(u.cantidad, 0), 0))::numeric AS disponible,
      max(u.fecha_vencimiento) AS fecha_vencimiento
    FROM public.wms_ubicaciones u
    WHERE coalesce(u.cantidad, 0) > 0
      AND nullif(btrim(u.codigo), '') IS NOT NULL
    GROUP BY upper(btrim(u.codigo, E' \t\r\n"')), nullif(btrim(u.partida), '')
  ),
  candidatos AS (
    SELECT
      s.codigo_producto,
      coalesce(s.producto, c.producto, 'Sin descripción') AS producto,
      s.partida,
      s.disponible,
      coalesce(c.unidad_medida, 'UN') AS unidad_medida,
      s.fecha_vencimiento,
      false AS es_historico,
      'stock_actual'::text AS origen
    FROM stock s
    LEFT JOIN catalogo c USING (codigo_producto)

    UNION ALL

    SELECT
      c.codigo_producto,
      c.producto,
      NULL::text AS partida,
      0::numeric AS disponible,
      c.unidad_medida,
      NULL::date AS fecha_vencimiento,
      true AS es_historico,
      'catalogo_historico'::text AS origen
    FROM catalogo c
    WHERE NOT EXISTS (
      SELECT 1 FROM stock s WHERE s.codigo_producto = c.codigo_producto
    )
  ),
  filtrados AS (
    SELECT c.*
    FROM candidatos c
    WHERE v_query = ''
       OR c.codigo_producto ILIKE '%' || v_query || '%'
       OR c.producto ILIKE '%' || v_query || '%'
    ORDER BY
      CASE
        WHEN upper(c.codigo_producto) = upper(v_query) THEN 0
        WHEN c.codigo_producto ILIKE v_query || '%' THEN 1
        ELSE 2
      END,
      c.es_historico,
      c.codigo_producto,
      c.partida NULLS LAST
    LIMIT v_limit
  )
  SELECT coalesce(jsonb_agg(to_jsonb(f)), '[]'::jsonb)
  INTO v_result
  FROM filtrados f;

  RETURN v_result;
END;
$function$;

COMMENT ON FUNCTION public.calidad_salida_candidatos(text, integer) IS
  'Busca SKUs de Hito 3 en stock WMS y en catálogos históricos; los registros sin stock se marcan con es_historico=true.';

REVOKE ALL ON FUNCTION public.calidad_salida_candidatos(text, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.calidad_salida_candidatos(text, integer) FROM anon;
GRANT EXECUTE ON FUNCTION public.calidad_salida_candidatos(text, integer) TO authenticated, service_role;
