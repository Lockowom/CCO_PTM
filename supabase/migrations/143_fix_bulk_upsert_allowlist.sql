-- FIX: la migración 142 (aplicada por MCP) recreó bulk_upsert con un cuerpo y
-- allowlist viejos (007), perdiendo el saneo de vacíos (mig 009) y las tablas
-- tms_nv_catalogo (090) / tms_productos_activo (067). Se restaura el cuerpo
-- correcto (mig 090) con el allowlist COMPLETO + tms_producto_grupo.
CREATE OR REPLACE FUNCTION public.bulk_upsert(p_table text, p_data jsonb, p_conflict_keys text DEFAULT NULL::text)
 RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public', 'extensions', 'pg_temp'
AS $function$
DECLARE
  v_allowed text[] := ARRAY[
    'tms_inventario_general','tms_nv_diarias','tms_control_despacho',
    'tms_partidas','tms_series','tms_farmapack','wms_ubicaciones','tms_matriz_codigos',
    'tms_productos_activo','tms_nv_catalogo','tms_producto_grupo'
  ];
  v_cols text[]; v_keys text[]; v_coldef text; v_collist text; v_update text;
  v_conflict text := ''; v_total int; v_affected int := 0; v_data_clean jsonb;
BEGIN
  IF NOT (p_table = ANY(v_allowed)) THEN
    RETURN jsonb_build_object('error', 'Tabla no permitida: ' || p_table);
  END IF;
  v_total := jsonb_array_length(p_data);
  IF v_total = 0 THEN RETURN jsonb_build_object('inserted', 0, 'updated', 0, 'errors', 0, 'total', 0); END IF;
  SELECT jsonb_agg(
    (SELECT jsonb_object_agg(k,
              CASE WHEN jsonb_typeof(val)='string' AND (val#>>'{}')='' THEN 'null'::jsonb ELSE val END)
     FROM jsonb_each(elem) AS e(k, val))
  ) INTO v_data_clean FROM jsonb_array_elements(p_data) AS elem;
  SELECT array_agg(k ORDER BY k) INTO v_cols
  FROM jsonb_object_keys(v_data_clean->0) AS k
  WHERE k IN (SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name=p_table);
  IF v_cols IS NULL OR array_length(v_cols,1) = 0 THEN
    RETURN jsonb_build_object('error', 'Sin columnas válidas para ' || p_table);
  END IF;
  SELECT string_agg(format('%I %s', c.column_name,
           CASE WHEN c.data_type = 'USER-DEFINED' THEN c.udt_name ELSE c.data_type END), ', ')
  INTO v_coldef FROM information_schema.columns c
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
  EXECUTE format('INSERT INTO public.%I (%s) SELECT %s FROM jsonb_to_recordset($1) AS x(%s)%s',
    p_table, v_collist, v_collist, v_coldef, v_conflict) USING v_data_clean;
  GET DIAGNOSTICS v_affected = ROW_COUNT;
  RETURN jsonb_build_object('inserted', v_affected, 'updated', 0, 'errors', 0, 'total', v_total);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('error', SQLERRM, 'inserted', 0, 'updated', 0, 'errors', v_total, 'total', v_total);
END;
$function$;
REVOKE EXECUTE ON FUNCTION public.bulk_upsert(text, jsonb, text) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.bulk_upsert(text, jsonb, text) TO authenticated;
