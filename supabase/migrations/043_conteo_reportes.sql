-- 043_conteo_reportes.sql
-- Reportes del módulo Conteo Cíclico (lectura/agregación). Reusan el stock de
-- CCO (conteo_stock_sistema) y los costos de tms_conteo_costos. Sólo leen datos
-- ya visibles por RLS a authenticated, así que se otorgan a authenticated.

-- Conciliación: contado (Σ) vs sistema (stock actual) por SKU, con impacto
-- valorizado. p_sesion_id NULL = todas las sesiones.
CREATE OR REPLACE FUNCTION public.conteo_conciliacion(p_sesion_id uuid DEFAULT NULL)
 RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  SELECT coalesce(jsonb_agg(to_jsonb(x) ORDER BY x.impacto), '[]'::jsonb)
  FROM (
    SELECT t.codigo_producto, t.descripcion, t.unidad_medida,
           t.contado, t.sistema,
           (t.contado - t.sistema) AS diferencia,
           t.costo_unitario,
           round((t.contado - t.sistema) * t.costo_unitario, 2) AS impacto,
           CASE
             WHEN t.contado = 0 AND t.sistema > 0 THEN 'NO_CONTADO'
             WHEN t.contado = t.sistema THEN 'CUADRADO'
             WHEN t.contado < t.sistema THEN 'FALTA'
             ELSE 'SOBRA' END AS estado
    FROM (
      SELECT co.codigo_producto,
             max(co.descripcion)   AS descripcion,
             max(co.unidad_medida) AS unidad_medida,
             sum(co.cantidad_contada) AS contado,
             public.conteo_stock_sistema(co.codigo_producto, '', '') AS sistema,
             coalesce(max(cst.costo_unitario), 0) AS costo_unitario
      FROM tms_conteos co
      LEFT JOIN tms_conteo_costos cst ON cst.codigo_producto = co.codigo_producto
      WHERE (p_sesion_id IS NULL OR co.sesion_id = p_sesion_id)
      GROUP BY co.codigo_producto
    ) t
  ) x;
$$;
GRANT EXECUTE ON FUNCTION public.conteo_conciliacion(uuid) TO authenticated, service_role;

-- Ajuste ERP: contado vs sistema por SKU + partida (para cuadrar con el ERP).
CREATE OR REPLACE FUNCTION public.conteo_ajuste_erp(p_sesion_id uuid DEFAULT NULL)
 RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  SELECT coalesce(jsonb_agg(to_jsonb(x) ORDER BY x.codigo_producto, x.partida), '[]'::jsonb)
  FROM (
    SELECT m.codigo_producto, m.descripcion,
           CASE WHEN m.partida_key = '' THEN '(sin partida)' ELSE m.partida_key END AS partida,
           m.contado, m.sistema,
           (m.contado - m.sistema) AS diferencia,
           m.costo_unitario,
           round((m.contado - m.sistema) * m.costo_unitario, 2) AS impacto,
           CASE
             WHEN m.sistema = 0 AND m.contado > 0 THEN 'PARTIDA_NUEVA'
             WHEN m.contado = 0 AND m.sistema > 0 THEN 'NO_CONTADO'
             WHEN m.contado = m.sistema THEN 'CUADRADO'
             WHEN m.contado < m.sistema THEN 'FALTA'
             ELSE 'SOBRA' END AS estado
    FROM (
      SELECT t.codigo_producto, t.descripcion, t.partida_key, t.contado, t.costo_unitario,
             public.conteo_stock_sistema(t.codigo_producto, t.partida_key, '') AS sistema
      FROM (
        SELECT co.codigo_producto,
               max(co.descripcion) AS descripcion,
               coalesce(nullif(co.partida, ''), '') AS partida_key,
               sum(co.cantidad_contada) AS contado,
               coalesce(max(cst.costo_unitario), 0) AS costo_unitario
        FROM tms_conteos co
        LEFT JOIN tms_conteo_costos cst ON cst.codigo_producto = co.codigo_producto
        WHERE (p_sesion_id IS NULL OR co.sesion_id = p_sesion_id)
        GROUP BY co.codigo_producto, coalesce(nullif(co.partida, ''), '')
      ) t
    ) m
  ) x;
$$;
GRANT EXECUTE ON FUNCTION public.conteo_ajuste_erp(uuid) TO authenticated, service_role;
