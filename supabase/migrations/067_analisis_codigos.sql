-- 067 — Inventario → ANÁLISIS DE CÓDIGOS (port del Excel "STOCK NAME" de PTM).
--
-- El Excel clasifica cada SKU del reporte de stock del ERP según la nueva
-- nomenclatura (código termina en P/S = nuevo; si no, "Antiguo") y detecta:
-- antiguos que aún tienen Disponible, duplicados (la descripción ya existe con
-- un código P/S), el código P/S equivalente, productos NO activos con stock, y
-- anomalías de formato (punto final, códigos incompletos, sufijos inválidos,
-- filas de prueba). Aquí todo se calcula EN VIVO sobre:
--   * tms_inventario_general (reporte de stock — se carga por Carga Masiva →
--     Consolidado, sumado por SKU a través de bodegas), y
--   * tms_productos_activo (NUEVA: catálogo del ERP con la marca Activo Si/No,
--     se carga desde la propia pantalla de Análisis vía bulk_upsert).

-- ── Catálogo de productos activos ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.tms_productos_activo (
  codigo_producto text PRIMARY KEY,
  producto        text,
  unidad_medida   text,
  activo          boolean NOT NULL DEFAULT false,
  updated_at      timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.tms_productos_activo ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.tms_productos_activo FROM anon;
GRANT SELECT ON public.tms_productos_activo TO authenticated;
DROP POLICY IF EXISTS productos_activo_sel ON public.tms_productos_activo;
CREATE POLICY productos_activo_sel ON public.tms_productos_activo
  FOR SELECT USING (auth.role() = 'authenticated');
-- Escrituras SOLO vía bulk_upsert (SECURITY DEFINER, allowlist de abajo).

-- ── bulk_upsert: se agrega la tabla nueva a la allowlist ─────────────────────
-- (misma función de la migración 009/limpiezas posteriores; solo cambia v_allowed)
CREATE OR REPLACE FUNCTION public.bulk_upsert(p_table text, p_data jsonb, p_conflict_keys text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions', 'pg_temp'
AS $function$
DECLARE
  v_allowed text[] := ARRAY[
    'tms_inventario_general','tms_nv_diarias','tms_control_despacho',
    'tms_partidas','tms_series','tms_farmapack','wms_ubicaciones','tms_matriz_codigos',
    'tms_productos_activo'
  ];
  v_cols     text[];
  v_keys     text[];
  v_coldef   text;
  v_collist  text;
  v_update   text;
  v_conflict text := '';
  v_total    int;
  v_affected int := 0;
  v_data_clean jsonb;
BEGIN
  IF NOT (p_table = ANY(v_allowed)) THEN
    RETURN jsonb_build_object('error', 'Tabla no permitida: ' || p_table);
  END IF;

  v_total := jsonb_array_length(p_data);
  IF v_total = 0 THEN
    RETURN jsonb_build_object('inserted', 0, 'updated', 0, 'errors', 0, 'total', 0);
  END IF;

  -- Sanitizar: convertir strings vacíos "" a null (evita errores de coerción en date/numeric)
  SELECT jsonb_agg(
    (SELECT jsonb_object_agg(k,
              CASE WHEN jsonb_typeof(val)='string' AND (val#>>'{}')='' THEN 'null'::jsonb ELSE val END)
     FROM jsonb_each(elem) AS e(k, val))
  )
  INTO v_data_clean
  FROM jsonb_array_elements(p_data) AS elem;

  SELECT array_agg(k ORDER BY k) INTO v_cols
  FROM jsonb_object_keys(v_data_clean->0) AS k
  WHERE k IN (SELECT column_name FROM information_schema.columns
              WHERE table_schema='public' AND table_name=p_table);

  IF v_cols IS NULL OR array_length(v_cols,1) = 0 THEN
    RETURN jsonb_build_object('error', 'Sin columnas válidas para ' || p_table);
  END IF;

  SELECT string_agg(
           format('%I %s', c.column_name,
             CASE WHEN c.data_type = 'USER-DEFINED' THEN c.udt_name ELSE c.data_type END), ', ')
  INTO v_coldef
  FROM information_schema.columns c
  WHERE c.table_schema='public' AND c.table_name=p_table AND c.column_name = ANY(v_cols);

  SELECT string_agg(quote_ident(c), ', ') INTO v_collist FROM unnest(v_cols) AS c;

  IF p_conflict_keys IS NOT NULL AND p_conflict_keys <> '' THEN
    v_keys := ARRAY(SELECT trim(x) FROM unnest(string_to_array(p_conflict_keys, ',')) AS x WHERE trim(x) <> '');
    SELECT string_agg(format('%I = EXCLUDED.%I', c, c), ', ') INTO v_update
    FROM unnest(v_cols) AS c WHERE NOT (c = ANY(v_keys));

    IF v_update IS NOT NULL THEN
      v_conflict := format(' ON CONFLICT (%s) DO UPDATE SET %s',
        (SELECT string_agg(quote_ident(k), ', ') FROM unnest(v_keys) AS k), v_update);
    ELSE
      v_conflict := format(' ON CONFLICT (%s) DO NOTHING',
        (SELECT string_agg(quote_ident(k), ', ') FROM unnest(v_keys) AS k));
    END IF;
  END IF;

  EXECUTE format(
    'INSERT INTO public.%I (%s) SELECT %s FROM jsonb_to_recordset($1) AS x(%s)%s',
    p_table, v_collist, v_collist, v_coldef, v_conflict
  ) USING v_data_clean;

  GET DIAGNOSTICS v_affected = ROW_COUNT;
  RETURN jsonb_build_object('inserted', v_affected, 'updated', 0, 'errors', 0, 'total', v_total);

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('error', SQLERRM, 'inserted', 0, 'updated', 0, 'errors', v_total, 'total', v_total);
END;
$function$;

-- ── Gate compartido del análisis ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public._analisis_assert()
RETURNS void LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
BEGIN
  IF auth.role() = 'service_role' THEN RETURN; END IF;
  IF NOT public.usuario_tiene_algun_permiso(ARRAY[
    'manage_inventory','view_stock','view_batches','manage_data_import'
  ]) THEN
    RAISE EXCEPTION 'Sin permiso para el Análisis de Inventario';
  END IF;
END $$;
REVOKE EXECUTE ON FUNCTION public._analisis_assert() FROM PUBLIC, anon;

-- ── Análisis por SKU (las 6 columnas calculadas del Excel + anomalías) ───────
-- p_filtro: 'todos' | 'antiguos_disp' | 'no_activos_stock' | 'duplicados' | 'anomalias' | 'antiguos'
-- p_q: búsqueda por código o descripción (ilike).
CREATE OR REPLACE FUNCTION public.analisis_codigos(p_filtro text DEFAULT 'todos', p_q text DEFAULT '')
RETURNS TABLE(
  codigo text, producto text, unidad_medida text,
  disponible numeric, reserva numeric, transitoria numeric, consignacion numeric, stock_total numeric,
  estado text, antiguo_disponible boolean, duplicado text, ps_equivalente text,
  activo text, no_activo_stock boolean, anomalia text
) LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
BEGIN
  PERFORM public._analisis_assert();
  RETURN QUERY
  WITH base AS (
    SELECT trim(g.codigo_producto) AS codigo,
           max(nullif(trim(g.producto), '')) AS producto,
           max(nullif(trim(g.unidad_medida), '')) AS um,
           sum(coalesce(g.disponible, 0))   AS disponible,
           sum(coalesce(g.reserva, 0))      AS reserva,
           sum(coalesce(g.transitoria, 0))  AS transitoria,
           sum(coalesce(g.consignacion, 0)) AS consignacion,
           sum(coalesce(g.stock_total, 0))  AS stock_total
    FROM tms_inventario_general g
    WHERE coalesce(trim(g.codigo_producto), '') <> ''
    GROUP BY trim(g.codigo_producto)
  ), clasif AS (
    SELECT b.*,
      CASE WHEN upper(right(b.codigo, 1)) = 'P' THEN 'Nuevo (P)'
           WHEN upper(right(b.codigo, 1)) = 'S' THEN 'Nuevo (S)'
           ELSE 'Antiguo' END AS estado,
      upper(coalesce(b.producto, '')) AS pnorm
    FROM base b
  ), nuevos AS (
    -- Índice descripción → código P/S (equivale a la hoja oculta PS_Index)
    SELECT c.pnorm, min(c.codigo) AS codigo_ps
    FROM clasif c WHERE c.estado <> 'Antiguo' AND c.pnorm <> ''
    GROUP BY c.pnorm
  ), full_calc AS (
    SELECT c.codigo, c.producto, c.um AS unidad_medida,
           c.disponible, c.reserva, c.transitoria, c.consignacion, c.stock_total,
           c.estado,
           (c.estado = 'Antiguo' AND c.disponible > 0) AS antiguo_disponible,
           CASE WHEN c.estado = 'Antiguo' AND c.pnorm <> ''
                THEN CASE WHEN n.codigo_ps IS NOT NULL THEN 'Sí (duplicado)' ELSE 'No' END
                ELSE '' END AS duplicado,
           CASE WHEN c.estado = 'Antiguo' THEN coalesce(n.codigo_ps, '') ELSE '' END AS ps_equivalente,
           CASE WHEN a.codigo_producto IS NULL THEN 'No encontrado'
                WHEN a.activo THEN 'Si' ELSE 'No' END AS activo,
           (a.codigo_producto IS NOT NULL AND NOT a.activo AND c.stock_total > 0) AS no_activo_stock,
           CASE
             WHEN c.producto IS NULL AND c.codigo !~ '[0-9]'
               THEN 'Fila basura: texto en vez de código'
             WHEN upper(coalesce(c.producto,'')) = 'ERROR' OR c.producto ~* '^pru?e[bv]a' OR c.codigo ~* '(prueba|test)'
               THEN 'Fila de prueba/basura: eliminar'
             WHEN c.codigo ~ '\.\s*$' AND upper(right(regexp_replace(c.codigo, '[.\s]+$', ''), 1)) IN ('P','S')
               THEN 'Código P/S con punto final → debería ser ' || regexp_replace(c.codigo, '[.\s]+$', '')
             WHEN c.codigo ~ '\.\s*$'
               THEN 'Código antiguo con punto final sobrante → debería ser ' || regexp_replace(c.codigo, '[.\s]+$', '')
             WHEN length(c.codigo) < 5
               THEN 'Código incompleto (' || length(c.codigo) || ' caracteres)'
             WHEN c.codigo !~ '[0-9]'
               THEN 'Fila basura: texto en vez de código'
             WHEN upper(right(c.codigo, 1)) ~ '[A-Z]' AND upper(right(c.codigo, 1)) NOT IN ('P','S')
               THEN 'Termina en "' || upper(right(c.codigo, 1)) || '" (sufijo no válido) → revisar si debe ser P/S'
             ELSE NULL
           END AS anomalia
    FROM clasif c
    LEFT JOIN nuevos n ON n.pnorm = c.pnorm
    LEFT JOIN tms_productos_activo a ON trim(a.codigo_producto) = c.codigo
  )
  SELECT f.* FROM full_calc f
  WHERE (CASE lower(coalesce(p_filtro, 'todos'))
           WHEN 'antiguos_disp'    THEN f.antiguo_disponible
           WHEN 'no_activos_stock' THEN f.no_activo_stock
           WHEN 'duplicados'       THEN f.duplicado = 'Sí (duplicado)'
           WHEN 'anomalias'        THEN f.anomalia IS NOT NULL
           WHEN 'antiguos'         THEN f.estado = 'Antiguo'
           ELSE true END)
    AND (coalesce(trim(p_q), '') = ''
         OR f.codigo ILIKE '%' || trim(p_q) || '%'
         OR f.producto ILIKE '%' || trim(p_q) || '%')
  ORDER BY f.codigo;
END $$;

-- ── Resumen (la hoja "Resumen" del Excel, calculada en vivo) ─────────────────
CREATE OR REPLACE FUNCTION public.analisis_codigos_resumen()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE r jsonb;
BEGIN
  PERFORM public._analisis_assert();
  SELECT jsonb_build_object(
    'total',             count(*),
    'nuevos_p',          count(*) FILTER (WHERE a.estado = 'Nuevo (P)'),
    'nuevos_s',          count(*) FILTER (WHERE a.estado = 'Nuevo (S)'),
    'antiguos',          count(*) FILTER (WHERE a.estado = 'Antiguo'),
    'antiguos_disp',     count(*) FILTER (WHERE a.antiguo_disponible),
    'antiguos_sin_disp', count(*) FILTER (WHERE a.estado = 'Antiguo' AND NOT a.antiguo_disponible),
    'antiguos_dup',      count(*) FILTER (WHERE a.duplicado = 'Sí (duplicado)'),
    'anomalias',         count(*) FILTER (WHERE a.anomalia IS NOT NULL),
    'activos',           count(*) FILTER (WHERE a.activo = 'Si'),
    'no_activos',        count(*) FILTER (WHERE a.activo = 'No'),
    'no_encontrados',    count(*) FILTER (WHERE a.activo = 'No encontrado'),
    'no_activos_stock',  count(*) FILTER (WHERE a.no_activo_stock),
    'stock_cargado_el',  (SELECT max(g.updated_at) FROM tms_inventario_general g),
    'activo_filas',      (SELECT count(*) FROM tms_productos_activo),
    'activo_cargado_el', (SELECT max(pa.updated_at) FROM tms_productos_activo pa)
  ) INTO r
  FROM public.analisis_codigos('todos', '') a;
  RETURN r;
END $$;

DO $$
DECLARE fn text;
BEGIN
  FOREACH fn IN ARRAY ARRAY[
    'analisis_codigos(text,text)',
    'analisis_codigos_resumen()'
  ] LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION public.%s FROM PUBLIC, anon', fn);
    EXECUTE format('GRANT EXECUTE ON FUNCTION public.%s TO authenticated, service_role', fn);
  END LOOP;
END $$;
