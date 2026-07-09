-- 049_pv_familias_stock.sql
-- Post-Venta: el selector "Equipo / Modelo" se alimenta de las FAMILIAS reales del
-- stock de CCO. Regla de negocio: la familia = los 3 primeros caracteres del código
-- de producto (tms_partidas.codigo_producto). RPC de solo lectura para authenticated.

CREATE OR REPLACE FUNCTION public.pv_familias_stock()
 RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  SELECT coalesce(jsonb_agg(jsonb_build_object('familia', familia, 'skus', skus, 'ejemplo', ejemplo) ORDER BY familia), '[]'::jsonb)
  FROM (
    SELECT left(upper(btrim(codigo_producto)), 3) AS familia,
           count(DISTINCT codigo_producto)        AS skus,
           (array_agg(producto ORDER BY codigo_producto))[1] AS ejemplo
    FROM public.tms_partidas
    WHERE codigo_producto IS NOT NULL AND btrim(codigo_producto) <> ''
    GROUP BY 1
  ) f;
$$;
REVOKE EXECUTE ON FUNCTION public.pv_familias_stock() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.pv_familias_stock() TO authenticated, service_role;
