-- HOTFIX AUGUST 2026 — transactional production migration
-- The public-search contract is intentionally NOT changed here: it needs an
-- approved replacement UI because the current public page depends on status/logistics.

BEGIN;

DO $$
BEGIN
  IF to_regclass('public.tms_operaciones') IS NULL
     OR to_regclass('public.tms_nv_bitacora') IS NULL THEN
    RAISE EXCEPTION 'Expected CCO tables are missing';
  END IF;
END $$;

-- `verify_jwt = true` requires calls made by the two pg_net triggers to carry
-- the legacy service-role JWT. Keep the value in Vault; never embed it in SQL.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM vault.secrets WHERE name = 'edge_webhook_service_role'
  ) THEN
    RAISE EXCEPTION
      'Missing Vault secret edge_webhook_service_role; create it before applying this hotfix';
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.notify_new_ticket()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, vault
AS $$
DECLARE
  v_service_role text;
BEGIN
  SELECT decrypted_secret INTO v_service_role
    FROM vault.decrypted_secrets
   WHERE name = 'edge_webhook_service_role';

  PERFORM net.http_post(
    url := 'https://vtrtyzbgpsvqwbfoudaf.supabase.co/functions/v1/notify-ticket',
    body := jsonb_build_object(
      'ticket_id', NEW.ticket_id, 'usuario_nombre', NEW.usuario_nombre,
      'usuario_id', NEW.usuario_id, 'asunto', NEW.asunto,
      'descripcion', NEW.descripcion, 'prioridad', NEW.prioridad
    ),
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || v_service_role
    ),
    timeout_milliseconds := 2000
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'notify_new_ticket failed: %', SQLERRM;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_ticket_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, vault
AS $$
DECLARE
  v_service_role text;
BEGIN
  IF OLD.estado = NEW.estado
     AND coalesce(OLD.respuesta_admin, '') = coalesce(NEW.respuesta_admin, '') THEN
    RETURN NEW;
  END IF;

  SELECT decrypted_secret INTO v_service_role
    FROM vault.decrypted_secrets
   WHERE name = 'edge_webhook_service_role';

  PERFORM net.http_post(
    url := 'https://vtrtyzbgpsvqwbfoudaf.supabase.co/functions/v1/notify-ticket-update',
    body := jsonb_build_object(
      'record', jsonb_build_object(
        'ticket_id', NEW.ticket_id, 'usuario_id', NEW.usuario_id,
        'usuario_nombre', NEW.usuario_nombre, 'asunto', NEW.asunto,
        'estado', NEW.estado, 'respuesta_admin', NEW.respuesta_admin
      ),
      'old_record', jsonb_build_object(
        'estado', OLD.estado, 'respuesta_admin', OLD.respuesta_admin
      )
    ),
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || v_service_role
    ),
    timeout_milliseconds := 2000
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'notify_ticket_update failed: %', SQLERRM;
  RETURN NEW;
END;
$$;

-- Defense in depth: both tables must stay behind RLS and never be read directly
-- by anonymous clients. The application reads the audit through the gated RPC.
ALTER TABLE public.tms_operaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tms_nv_bitacora ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.tms_nv_bitacora FROM PUBLIC, anon;
REVOKE ALL ON TABLE public.tms_operaciones FROM anon;

CREATE OR REPLACE FUNCTION public.nv_bitacora(
  p_nv text,
  p_canal text DEFAULT 'ptm',
  p_limit int DEFAULT 60
)
RETURNS TABLE(
  id bigint,
  accion text,
  operador text,
  campos text,
  estado_anterior text,
  estado_nuevo text,
  exito boolean,
  ts timestamptz
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT (
    coalesce(private.is_admin(), false)
    OR coalesce(public.usuario_tiene_algun_permiso(ARRAY['view_panel', 'manage_panel']), false)
  ) THEN
    RAISE EXCEPTION 'Acceso denegado para bitácora de N.V.' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  SELECT b.id, b.accion, b.operador, b.campos, b.estado_anterior,
         b.estado_nuevo, b.exito, b.ts
    FROM public.tms_nv_bitacora b
   WHERE b.nv = btrim(p_nv)
     AND (p_canal IS NULL OR b.canal = lower(btrim(p_canal)))
   ORDER BY b.ts DESC, b.id DESC
   LIMIT least(greatest(coalesce(p_limit, 60), 1), 100);
END;
$$;

REVOKE ALL ON FUNCTION public.nv_bitacora(text, text, int) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.nv_bitacora(text, text, int) TO authenticated, service_role;

-- Per-row ingestion: blank/zero dates become JSON null. A malformed date skips
-- only that row, reports its array index to Postgres logs, and does not abort the batch.
CREATE OR REPLACE FUNCTION public.bulk_upsert(
  p_table text,
  p_data jsonb,
  p_conflict_keys text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
  v_allowed text[] := ARRAY[
    'tms_inventario_general', 'tms_nv_diarias', 'tms_control_despacho',
    'tms_partidas', 'tms_series', 'tms_farmapack', 'wms_ubicaciones',
    'tms_matriz_codigos', 'tms_productos_activo', 'tms_nv_catalogo',
    'tms_producto_grupo'
  ];
  v_cols text[];
  v_keys text[];
  v_coldef text;
  v_collist text;
  v_update text;
  v_conflict text := '';
  v_row jsonb;
  v_total int;
  v_accepted int := 0;
  v_skipped int := 0;
  v_idx int;
BEGIN
  IF p_table IS NULL OR NOT (p_table = ANY(v_allowed)) THEN
    RAISE EXCEPTION 'Tabla no permitida para carga masiva: %', p_table USING ERRCODE = '42501';
  END IF;
  IF jsonb_typeof(p_data) <> 'array' THEN
    RAISE EXCEPTION 'p_data debe ser un arreglo JSON' USING ERRCODE = '22023';
  END IF;
  v_total := jsonb_array_length(p_data);
  IF v_total = 0 THEN
    RETURN jsonb_build_object('accepted', 0, 'skipped', 0, 'total', 0);
  END IF;

  -- The imported sheet has a stable column set. Ignore unknown fields before
  -- composing dynamic SQL and use the first row only to define the record type.
  SELECT array_agg(k ORDER BY k)
    INTO v_cols
    FROM jsonb_object_keys(p_data -> 0) AS k
   WHERE k IN (
     SELECT column_name
       FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = p_table
   );
  IF coalesce(array_length(v_cols, 1), 0) = 0 THEN
    RAISE EXCEPTION 'Sin columnas válidas para %', p_table USING ERRCODE = '22023';
  END IF;

  SELECT string_agg(
           format('%I %s', c.column_name,
             CASE WHEN c.data_type = 'USER-DEFINED' THEN c.udt_name ELSE c.data_type END),
           ', ' ORDER BY c.ordinal_position
         ),
         string_agg(quote_ident(c.column_name), ', ' ORDER BY c.ordinal_position)
    INTO v_coldef, v_collist
    FROM information_schema.columns c
   WHERE c.table_schema = 'public'
     AND c.table_name = p_table
     AND c.column_name = ANY(v_cols);

  IF nullif(btrim(coalesce(p_conflict_keys, '')), '') IS NOT NULL THEN
    v_keys := ARRAY(
      SELECT btrim(key)
        FROM unnest(string_to_array(p_conflict_keys, ',')) AS key
       WHERE btrim(key) = ANY(v_cols)
    );
    IF coalesce(array_length(v_keys, 1), 0) = 0 THEN
      RAISE EXCEPTION 'Claves de conflicto inválidas para %', p_table USING ERRCODE = '22023';
    END IF;
    SELECT string_agg(format('%1$I = EXCLUDED.%1$I', c), ', ')
      INTO v_update
      FROM unnest(v_cols) AS c
     WHERE NOT (c = ANY(v_keys));
    v_conflict := format(
      ' ON CONFLICT (%s) DO %s',
      (SELECT string_agg(quote_ident(k), ', ') FROM unnest(v_keys) AS k),
      CASE WHEN v_update IS NULL THEN 'NOTHING' ELSE 'UPDATE SET ' || v_update END
    );
  END IF;

  FOR v_idx IN 0 .. v_total - 1 LOOP
    SELECT jsonb_object_agg(key,
             CASE
               WHEN jsonb_typeof(value) = 'string'
                AND lower(btrim(value #>> '{}')) IN (
                  '', '0000-00-00', '0000-00-00 00:00:00', '0000-00-00t00:00:00'
                )
               THEN 'null'::jsonb
               ELSE value
             END)
      INTO v_row
      FROM jsonb_each(p_data -> v_idx) AS item(key, value)
     WHERE key = ANY(v_cols);

    BEGIN
      EXECUTE format(
        'INSERT INTO public.%I (%s) SELECT %s FROM jsonb_to_record($1) AS x(%s)%s',
        p_table, v_collist, v_collist, v_coldef, v_conflict
      ) USING coalesce(v_row, '{}'::jsonb);
      v_accepted := v_accepted + 1;
    EXCEPTION
      WHEN invalid_datetime_format OR datetime_field_overflow THEN
        v_skipped := v_skipped + 1;
        RAISE WARNING 'bulk_upsert skipped row % for table % due to invalid date/timestamp', v_idx, p_table;
    END;
  END LOOP;

  RETURN jsonb_build_object(
    'accepted', v_accepted,
    'skipped', v_skipped,
    'total', v_total
  );
END;
$$;

REVOKE ALL ON FUNCTION public.bulk_upsert(text, jsonb, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.bulk_upsert(text, jsonb, text) TO authenticated, service_role;

COMMIT;
