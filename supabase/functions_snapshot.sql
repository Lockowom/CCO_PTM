-- ============================================================================
-- SNAPSHOT AUTORITATIVO DE FUNCIONES / RPC  —  exportado de la BD live
-- Proyecto Supabase: WMS-CCO-PTM (vtrtyzbgpsvqwbfoudaf)
-- Fecha: 2026-05-29
-- ============================================================================
-- Fuente de verdad de las funciones que ANTES solo vivían en la base de datos
-- (no estaban versionadas). Idempotente (CREATE OR REPLACE). No reemplaza a las
-- migraciones numeradas; documenta el estado real para poder recrearlo.
--
-- Capa de seguridad canónica: funciones en esquema `private` (SECURITY DEFINER)
-- con wrappers en `public`. La autorización se basa en private.is_admin() (auth_uid).
-- ============================================================================


-- ─────────────────────────────────────────────────────────────────────────
-- SEGURIDAD / AUTH  (esquema private + wrappers public)
-- ─────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION private.is_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM tms_usuarios u
    WHERE u.auth_uid = auth.uid()
    AND (u.rol = 'ADMIN' OR u.es_admin_delegado = true)
  )
$function$;

CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean LANGUAGE sql STABLE SET search_path TO 'public'
AS $function$ SELECT private.is_admin() $function$;

CREATE OR REPLACE FUNCTION private.get_user_role()
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT u.rol FROM tms_usuarios u
  WHERE u.auth_uid = auth.uid()
$function$;

CREATE OR REPLACE FUNCTION public.get_user_role()
 RETURNS text LANGUAGE sql STABLE SET search_path TO 'public'
AS $function$ SELECT private.get_user_role() $function$;

CREATE OR REPLACE FUNCTION private.create_auth_user(p_email text, p_password text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'auth', 'public', 'extensions'
AS $function$
DECLARE
  new_user_id UUID;
BEGIN
  IF NOT private.is_admin() THEN
    RAISE EXCEPTION 'Acceso denegado: solo administradores';
  END IF;

  INSERT INTO auth.users (
    instance_id, id, aud, role, email,
    encrypted_password, email_confirmed_at,
    created_at, updated_at, confirmation_token,
    email_change, email_change_token_new, email_change_token_current,
    email_change_confirm_status, phone_change, phone_change_token,
    recovery_token, reauthentication_token,
    raw_app_meta_data, raw_user_meta_data
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(), 'authenticated', 'authenticated',
    LOWER(p_email), crypt(p_password, gen_salt('bf')),
    NOW(), NOW(), NOW(), '',
    '', '', '', 0, '', '', '', '',
    jsonb_build_object('provider', 'email', 'providers', ARRAY['email']),
    '{}'::jsonb
  ) RETURNING id INTO new_user_id;

  INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
  VALUES (
    gen_random_uuid(), new_user_id,
    jsonb_build_object('sub', new_user_id::text, 'email', LOWER(p_email)),
    'email', new_user_id::text, NOW(), NOW(), NOW()
  );
  RETURN new_user_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.create_auth_user(p_email text, p_password text)
 RETURNS uuid LANGUAGE plpgsql SET search_path TO 'public'
AS $function$ BEGIN RETURN private.create_auth_user(p_email, p_password); END; $function$;

CREATE OR REPLACE FUNCTION private.update_auth_password(p_auth_uid uuid, p_new_password text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'auth', 'public', 'extensions'
AS $function$
BEGIN
  IF NOT private.is_admin() THEN
    RAISE EXCEPTION 'Acceso denegado: solo administradores';
  END IF;
  UPDATE auth.users
  SET encrypted_password = crypt(p_new_password, gen_salt('bf')), updated_at = NOW()
  WHERE id = p_auth_uid;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_auth_password(p_auth_uid uuid, p_new_password text)
 RETURNS void LANGUAGE plpgsql SET search_path TO 'public'
AS $function$ BEGIN PERFORM private.update_auth_password(p_auth_uid, p_new_password); END; $function$;

-- NOTA: verify_user_password() (login legacy) fue ELIMINADA en la migración 006 junto con
-- la columna tms_usuarios.password_hash. Todos los usuarios usan Supabase Auth.


-- ─────────────────────────────────────────────────────────────────────────
-- ADMIN: limpieza de datos operativos (gate is_admin)
-- ─────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION private.clean_operational_data(p_clean_nv boolean, p_clean_partidas boolean, p_clean_series boolean, p_clean_farmapack boolean)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE msg TEXT := '';
BEGIN
  IF NOT private.is_admin() THEN
    RAISE EXCEPTION 'Acceso denegado: solo administradores';
  END IF;
  IF p_clean_nv THEN DELETE FROM tms_entregas; DELETE FROM tms_nv_diarias; msg := msg || 'NV y Entregas eliminadas. '; END IF;
  IF p_clean_partidas THEN DELETE FROM tms_partidas; msg := msg || 'Partidas eliminadas. '; END IF;
  IF p_clean_series THEN DELETE FROM tms_series; msg := msg || 'Series eliminadas. '; END IF;
  IF p_clean_farmapack THEN DELETE FROM tms_farmapack; msg := msg || 'Datos Farmapack eliminados. '; END IF;
  IF msg = '' THEN RETURN 'No se seleccionaron datos para eliminar.'; END IF;
  RETURN msg;
EXCEPTION WHEN OTHERS THEN RETURN 'Error: ' || SQLERRM;
END;
$function$;

CREATE OR REPLACE FUNCTION public.clean_operational_data(p_clean_nv boolean, p_clean_partidas boolean, p_clean_series boolean, p_clean_farmapack boolean)
 RETURNS text LANGUAGE plpgsql SET search_path TO 'public'
AS $function$ BEGIN RETURN private.clean_operational_data(p_clean_nv, p_clean_partidas, p_clean_series, p_clean_farmapack); END; $function$;


-- ─────────────────────────────────────────────────────────────────────────
-- RPC DE NEGOCIO
-- ─────────────────────────────────────────────────────────────────────────

-- Búsqueda Lotes y Series (1 RPC en vez de 8 queries). SECURITY DEFINER.
CREATE OR REPLACE FUNCTION public.search_batches(p_query text, p_limit integer DEFAULT 150)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions', 'pg_temp'
AS $function$
DECLARE
  v_term TEXT;
  v_partidas JSONB;
  v_series JSONB;
  v_farmapack JSONB;
  v_pesos JSONB;
BEGIN
  v_term := '%' || p_query || '%';

  WITH exact AS (
    SELECT id, codigo_producto, producto, unidad_medida, partida, fecha_vencimiento,
           disponible, reserva, transitoria, consignacion, stock_total
    FROM tms_partidas
    WHERE codigo_producto ILIKE v_term OR producto ILIKE v_term OR partida ILIKE v_term
    LIMIT p_limit
  ),
  fuzzy AS (
    SELECT id FROM tms_partidas
    WHERE similarity(producto, p_query) > 0.15
    AND id NOT IN (SELECT id FROM exact)
    ORDER BY similarity(producto, p_query) DESC
    LIMIT 30
  ),
  fuzzy_full AS (
    SELECT p.id, p.codigo_producto, p.producto, p.unidad_medida, p.partida, p.fecha_vencimiento,
           p.disponible, p.reserva, p.transitoria, p.consignacion, p.stock_total
    FROM tms_partidas p JOIN fuzzy f ON p.id = f.id
  ),
  merged AS ( SELECT * FROM exact UNION ALL SELECT * FROM fuzzy_full )
  SELECT COALESCE(jsonb_agg(row_to_json(m)), '[]'::jsonb) INTO v_partidas FROM merged m;

  WITH exact AS (
    SELECT id, codigo_producto, producto, unidad_medida, serie,
           disponible, reserva, transitoria, consignacion, stock_total
    FROM tms_series
    WHERE codigo_producto ILIKE v_term OR producto ILIKE v_term OR serie ILIKE v_term
    LIMIT p_limit
  ),
  fuzzy AS (
    SELECT id FROM tms_series
    WHERE similarity(producto, p_query) > 0.15
    AND id NOT IN (SELECT id FROM exact)
    ORDER BY similarity(producto, p_query) DESC
    LIMIT 30
  ),
  fuzzy_full AS (
    SELECT s.id, s.codigo_producto, s.producto, s.unidad_medida, s.serie,
           s.disponible, s.reserva, s.transitoria, s.consignacion, s.stock_total
    FROM tms_series s JOIN fuzzy f ON s.id = f.id
  ),
  merged AS ( SELECT * FROM exact UNION ALL SELECT * FROM fuzzy_full )
  SELECT COALESCE(jsonb_agg(row_to_json(m)), '[]'::jsonb) INTO v_series FROM merged m;

  SELECT COALESCE(jsonb_agg(row_to_json(t)), '[]'::jsonb) INTO v_farmapack
  FROM (
    SELECT id, codigo_producto, producto, lote, fecha_vencimiento, disponible, estado
    FROM tms_farmapack
    WHERE codigo_producto ILIKE v_term OR producto ILIKE v_term OR lote ILIKE v_term
    LIMIT p_limit
  ) t;

  SELECT COALESCE(jsonb_agg(row_to_json(t)), '[]'::jsonb) INTO v_pesos
  FROM (
    SELECT codigo_producto, descripcion, peso_unitario, largo, ancho, alto, updated_at
    FROM tms_pesos
    WHERE codigo_producto ILIKE v_term OR descripcion ILIKE v_term
    LIMIT p_limit
  ) t;

  RETURN jsonb_build_object('partidas', v_partidas, 'series', v_series, 'farmapack', v_farmapack, 'pesos', v_pesos);
END;
$function$;

-- Carga masiva server-side (whitelist de tablas). SECURITY DEFINER.
-- Inserción SET-BASED con jsonb_to_recordset + sanitización "" -> null. Ver migraciones 007/009.
CREATE OR REPLACE FUNCTION public.bulk_upsert(p_table text, p_data jsonb, p_conflict_keys text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions', 'pg_temp'
AS $function$
DECLARE
  v_allowed text[] := ARRAY['tms_inventario_general','tms_nv_diarias','tms_control_despacho',
    'tms_partidas','tms_series','tms_farmapack','wms_ubicaciones','tms_matriz_codigos'];
  v_cols text[]; v_keys text[]; v_coldef text; v_collist text;
  v_update text; v_conflict text := ''; v_total int; v_affected int := 0; v_data_clean jsonb;
BEGIN
  IF NOT (p_table = ANY(v_allowed)) THEN RETURN jsonb_build_object('error','Tabla no permitida: '||p_table); END IF;
  v_total := jsonb_array_length(p_data);
  IF v_total = 0 THEN RETURN jsonb_build_object('inserted',0,'updated',0,'errors',0,'total',0); END IF;

  -- Sanitizar "" -> null (evita errores de coercion en date/numeric)
  SELECT jsonb_agg(
    (SELECT jsonb_object_agg(k, CASE WHEN jsonb_typeof(val)='string' AND (val#>>'{}')='' THEN 'null'::jsonb ELSE val END)
     FROM jsonb_each(elem) AS e(k, val))
  ) INTO v_data_clean FROM jsonb_array_elements(p_data) AS elem;

  SELECT array_agg(k ORDER BY k) INTO v_cols
  FROM jsonb_object_keys(v_data_clean->0) AS k
  WHERE k IN (SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name=p_table);
  IF v_cols IS NULL OR array_length(v_cols,1)=0 THEN RETURN jsonb_build_object('error','Sin columnas validas para '||p_table); END IF;

  SELECT string_agg(format('%I %s', c.column_name,
           CASE WHEN c.data_type='USER-DEFINED' THEN c.udt_name ELSE c.data_type END), ', ')
  INTO v_coldef FROM information_schema.columns c
  WHERE c.table_schema='public' AND c.table_name=p_table AND c.column_name = ANY(v_cols);
  SELECT string_agg(quote_ident(c), ', ') INTO v_collist FROM unnest(v_cols) AS c;

  IF p_conflict_keys IS NOT NULL AND p_conflict_keys <> '' THEN
    v_keys := ARRAY(SELECT trim(x) FROM unnest(string_to_array(p_conflict_keys, ',')) AS x WHERE trim(x) <> '');
    SELECT string_agg(format('%I = EXCLUDED.%I', c, c), ', ') INTO v_update FROM unnest(v_cols) AS c WHERE NOT (c = ANY(v_keys));
    IF v_update IS NOT NULL THEN
      v_conflict := format(' ON CONFLICT (%s) DO UPDATE SET %s', (SELECT string_agg(quote_ident(k), ', ') FROM unnest(v_keys) AS k), v_update);
    ELSE
      v_conflict := format(' ON CONFLICT (%s) DO NOTHING', (SELECT string_agg(quote_ident(k), ', ') FROM unnest(v_keys) AS k));
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

-- Búsqueda fuzzy universal (whitelist tabla/columna).
CREATE OR REPLACE FUNCTION public.fuzzy_search(p_table text, p_column text, p_query text, p_limit integer DEFAULT 20, p_threshold double precision DEFAULT 0.15)
 RETURNS TABLE(id uuid, match_text text, similarity_score double precision)
 LANGUAGE plpgsql
 SET search_path TO 'public', 'extensions'
AS $function$
BEGIN
  IF p_table NOT IN (
    'tms_nv_diarias', 'tms_matriz_codigos', 'tms_direcciones',
    'wms_ubicaciones', 'tms_partidas', 'tms_series',
    'tms_control_despacho', 'tms_farmapack'
  ) THEN
    RAISE EXCEPTION 'Tabla no permitida: %', p_table;
  END IF;
  IF p_column NOT IN (
    'cliente', 'descripcion_producto', 'producto', 'razon_social',
    'nombre', 'descripcion', 'codigo', 'codigo_producto', 'partida',
    'serie', 'nv', 'rut', 'ubicacion'
  ) THEN
    RAISE EXCEPTION 'Columna no permitida: %', p_column;
  END IF;

  RETURN QUERY EXECUTE format(
    'SELECT id, %I::TEXT as match_text, extensions.similarity(%I, $1)::FLOAT as similarity_score
     FROM %I
     WHERE extensions.similarity(%I, $1) > $2
     ORDER BY extensions.similarity(%I, $1) DESC
     LIMIT $3',
    p_column, p_column, p_table, p_column, p_column
  ) USING p_query, p_threshold, p_limit;
END;
$function$;

-- KPIs del dashboard desde la materialized view.
CREATE OR REPLACE FUNCTION public.get_dashboard_kpis()
 RETURNS json
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  v_result JSON;
BEGIN
  SELECT json_build_object(
    'pendientes', pendientes, 'en_picking', en_picking, 'en_packing', en_packing,
    'despachados', despachados, 'entregados', entregados, 'facturados', facturados,
    'solo_facturar', solo_facturar, 'total', total, 'creadas_hoy', creadas_hoy,
    'despachados_hoy', despachados_hoy, 'last_refresh', last_refresh
  ) INTO v_result FROM mv_dashboard_kpis LIMIT 1;
  RETURN v_result;
END;
$function$;

-- Cambio de estado de N notas de venta en 1 llamada.
CREATE OR REPLACE FUNCTION public.batch_update_nv_estado(p_nv_ids uuid[], p_nuevo_estado text, p_usuario_nombre text DEFAULT NULL::text)
 RETURNS TABLE(updated_count integer, failed_count integer)
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  v_updated INT;
  v_total INT;
BEGIN
  v_total := array_length(p_nv_ids, 1);
  IF p_nuevo_estado NOT IN (
    'PENDIENTE', 'EN_PICKING', 'PICKING_PARCIAL', 'PICKING_COMPLETO',
    'EN_PACKING', 'PACKING_COMPLETO', 'LISTO_DESPACHO',
    'DESPACHADO', 'ENTREGADO', 'FACTURADO', 'SOLO_FACTURAR', 'ANULADA'
  ) THEN
    RAISE EXCEPTION 'Estado no válido: %', p_nuevo_estado;
  END IF;
  UPDATE tms_nv_diarias
  SET estado = p_nuevo_estado,
      usuario_nombre = COALESCE(p_usuario_nombre, usuario_nombre),
      updated_at = NOW()
  WHERE id = ANY(p_nv_ids);
  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN QUERY SELECT v_updated, (v_total - v_updated);
END;
$function$;

-- Dedup inteligente de import de N.V.: resetea NVs cambiadas y cancela ítems faltantes.
CREATE OR REPLACE FUNCTION public.prepare_nv_import(payload jsonb, sync_deleted boolean DEFAULT false)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
    v_nv TEXT;
    v_items_input JSONB;
    v_items_db JSONB;
    v_reseteadas INT := 0;
    v_cancelados INT := 0;
    v_total_nvs INT;
BEGIN
    CREATE TEMP TABLE tmp_nv_input (
        nv TEXT, codigo_producto TEXT, cantidad NUMERIC,
        PRIMARY KEY (nv, codigo_producto)
    ) ON COMMIT DROP;

    INSERT INTO tmp_nv_input (nv, codigo_producto, cantidad)
    SELECT (p->>'nv')::text, (p->>'codigo_producto')::text, (p->>'cantidad')::numeric
    FROM jsonb_array_elements(payload) AS p;

    FOR v_nv IN
        SELECT DISTINCT t.nv FROM tmp_nv_input t
        JOIN tms_nv_diarias d ON d.nv = t.nv
        WHERE d.estado NOT IN ('PENDIENTE', 'ENTREGADO', 'DESPACHADO', 'CANCELADO', 'DEVUELTO', 'ANULADO')
    LOOP
        SELECT jsonb_agg(jsonb_build_object('c', codigo_producto, 'q', cantidad) ORDER BY codigo_producto)
        INTO v_items_input FROM tmp_nv_input WHERE nv = v_nv;

        SELECT jsonb_agg(jsonb_build_object('c', codigo_producto, 'q', cantidad) ORDER BY codigo_producto)
        INTO v_items_db FROM tms_nv_diarias WHERE nv = v_nv AND estado != 'CANCELADO';

        IF v_items_input IS DISTINCT FROM v_items_db THEN
            UPDATE tms_nv_diarias SET estado = 'PENDIENTE', updated_at = NOW() WHERE nv = v_nv;
            v_reseteadas := v_reseteadas + 1;
        END IF;
    END LOOP;

    IF sync_deleted THEN
        WITH input_nvs AS ( SELECT DISTINCT nv FROM tmp_nv_input ),
        cancelaciones AS (
            UPDATE tms_nv_diarias d SET estado = 'CANCELADO', updated_at = NOW()
            FROM input_nvs i
            WHERE d.nv = i.nv
              AND d.codigo_producto NOT IN (SELECT codigo_producto FROM tmp_nv_input WHERE nv = i.nv)
              AND d.estado NOT IN ('ENTREGADO', 'CANCELADO', 'DEVUELTO', 'DESPACHADO')
            RETURNING 1
        )
        SELECT count(*) INTO v_cancelados FROM cancelaciones;
    END IF;

    SELECT count(DISTINCT nv) INTO v_total_nvs FROM tmp_nv_input;
    RETURN jsonb_build_object('procesadas', v_total_nvs, 'reseteadas', v_reseteadas, 'items_cancelados', v_cancelados);
END;
$function$;

-- Cancela ítems de N.V. que ya no vienen en la carga.
CREATE OR REPLACE FUNCTION public.sync_deleted_items(payload jsonb)
 RETURNS TABLE(nv text, items_cancelados integer)
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
    r RECORD;
    v_nv TEXT;
    v_codigos TEXT[];
    v_count INT;
BEGIN
    FOR r IN SELECT * FROM jsonb_to_recordset(payload) AS x(nv TEXT, codigos TEXT[])
    LOOP
        v_nv := r.nv;
        v_codigos := r.codigos;
        WITH updated_rows AS (
            UPDATE public.tms_nv_diarias SET estado = 'CANCELADO', updated_at = NOW()
            WHERE nv = v_nv
              AND codigo_producto != ALL(v_codigos)
              AND estado NOT IN ('ENTREGADO', 'CANCELADO', 'DEVUELTO', 'DESPACHADO')
            RETURNING 1
        )
        SELECT COUNT(*) INTO v_count FROM updated_rows;
        IF v_count > 0 THEN
            nv := v_nv; items_cancelados := v_count; RETURN NEXT;
        END IF;
    END LOOP;
    RETURN;
END;
$function$;

-- ─────────────────────────────────────────────────────────────────────────
-- FICHA TÉCNICA DEL PRODUCTO (módulo /queries/datasheet, v1.4.17). Ver migración 010.
-- ─────────────────────────────────────────────────────────────────────────

-- ¿El usuario actual puede gestionar fichas? (ADMIN / admin delegado / permiso manage_fichas)
CREATE OR REPLACE FUNCTION public.can_manage_fichas()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.tms_usuarios u
    LEFT JOIN public.tms_roles r ON r.id = u.rol
    WHERE u.auth_uid = auth.uid()
      AND u.activo = true
      AND (
        u.rol = 'ADMIN'
        OR u.es_admin_delegado = true
        OR (r.permisos_json ? 'manage_fichas')
      )
  );
$function$;

-- Ficha completa de un código: cabecera + partidas + imágenes.
CREATE OR REPLACE FUNCTION public.get_ficha_producto(p_codigo text)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_code     text := upper(trim(p_codigo));
  v_header   jsonb;
  v_partidas jsonb;
  v_imagenes jsonb;
BEGIN
  SELECT to_jsonb(h) INTO v_header FROM (
    SELECT codigo_producto, producto, unidad_medida FROM tms_partidas  WHERE upper(codigo_producto) = v_code
    UNION ALL
    SELECT codigo_producto, producto, unidad_medida FROM tms_series    WHERE upper(codigo_producto) = v_code
    UNION ALL
    SELECT codigo_producto, producto, unidad_medida FROM tms_farmapack WHERE upper(codigo_producto) = v_code
    LIMIT 1
  ) h;

  SELECT coalesce(jsonb_agg(to_jsonb(p) ORDER BY p.fecha_vencimiento NULLS LAST), '[]'::jsonb)
  INTO v_partidas FROM (
    SELECT partida, fecha_vencimiento, unidad_medida,
           disponible, reserva, transitoria, consignacion, stock_total
    FROM tms_partidas WHERE upper(codigo_producto) = v_code
  ) p;

  SELECT coalesce(jsonb_agg(to_jsonb(i) ORDER BY i.es_principal DESC, i.orden, i.created_at), '[]'::jsonb)
  INTO v_imagenes FROM (
    SELECT id, imagen_url, storage_path, descripcion, es_principal, orden, created_at
    FROM tms_fichas_imagenes WHERE upper(codigo_producto) = v_code
  ) i;

  RETURN jsonb_build_object(
    'codigo',   v_code,
    'header',   v_header,
    'partidas', v_partidas,
    'imagenes', v_imagenes
  );
END;
$function$;

-- Búsqueda de productos por código/nombre (con flag tiene_foto).
CREATE OR REPLACE FUNCTION public.search_productos(p_query text, p_limit integer DEFAULT 30)
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  WITH q AS (SELECT '%' || trim(p_query) || '%' AS term)
  SELECT coalesce(jsonb_agg(row_to_json(t)), '[]'::jsonb)
  FROM (
    SELECT base.codigo_producto,
           max(base.producto)       AS producto,
           max(base.unidad_medida)  AS unidad_medida,
           coalesce(bool_or(img.has_img), false) AS tiene_foto
    FROM (
      SELECT codigo_producto, producto, unidad_medida FROM tms_partidas
      UNION ALL SELECT codigo_producto, producto, unidad_medida FROM tms_series
      UNION ALL SELECT codigo_producto, producto, unidad_medida FROM tms_farmapack
    ) base
    LEFT JOIN LATERAL (
      SELECT true AS has_img FROM tms_fichas_imagenes f
      WHERE f.codigo_producto = base.codigo_producto LIMIT 1
    ) img ON true
    CROSS JOIN q
    WHERE base.codigo_producto ILIKE q.term OR base.producto ILIKE q.term
    GROUP BY base.codigo_producto
    ORDER BY base.codigo_producto
    LIMIT p_limit
  ) t;
$function$;

-- ============================================================================
-- GRANTS (estado deseado): RPCs SECURITY DEFINER NO ejecutables por anon.
-- ============================================================================
REVOKE EXECUTE ON FUNCTION public.bulk_upsert(text, jsonb, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.search_batches(text, integer)   FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.bulk_upsert(text, jsonb, text) TO authenticated;
GRANT  EXECUTE ON FUNCTION public.search_batches(text, integer)   TO authenticated;
REVOKE EXECUTE ON FUNCTION public.can_manage_fichas()             FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_ficha_producto(text)        FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.search_productos(text, integer) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.can_manage_fichas()             TO authenticated, service_role;
GRANT  EXECUTE ON FUNCTION public.get_ficha_producto(text)        TO authenticated, service_role;
GRANT  EXECUTE ON FUNCTION public.search_productos(text, integer) TO authenticated, service_role;

-- ============================================================================
-- RBAC HARDENING (migración 014) — trigger que congela columnas privilegiadas
-- de tms_usuarios para no-admins. Defensa en profundidad sobre la política
-- usuarios_update_self_or_admin (presence tracking) para impedir auto-ascenso.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.tms_usuarios_freeze_privileged()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF public.is_admin() OR auth.uid() IS NULL THEN
    RETURN NEW;  -- admin o service_role: sin restricción
  END IF;
  NEW.rol               := OLD.rol;
  NEW.es_admin_delegado := OLD.es_admin_delegado;
  NEW.activo            := OLD.activo;
  NEW.email             := OLD.email;
  NEW.auth_uid          := OLD.auth_uid;
  NEW.id_usuario        := OLD.id_usuario;
  RETURN NEW;
END;
$function$;
REVOKE EXECUTE ON FUNCTION public.tms_usuarios_freeze_privileged() FROM PUBLIC, anon;
-- Trigger asociado:
--   DROP TRIGGER IF EXISTS trg_usuarios_freeze_privileged ON tms_usuarios;
--   CREATE TRIGGER trg_usuarios_freeze_privileged BEFORE UPDATE ON tms_usuarios
--     FOR EACH ROW EXECUTE FUNCTION public.tms_usuarios_freeze_privileged();
