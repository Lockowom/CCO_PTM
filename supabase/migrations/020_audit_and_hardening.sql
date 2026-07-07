-- 020_audit_and_hardening.sql
-- Sincronizada desde la BD live (schema_migrations version 20260612054359,
-- nombre original "audit_and_hardening", comentado internamente como
-- "016_audit_and_hardening"). Renumerada a 020 para evitar la colisión con
-- 016_perm_view_transport_costs del repo.
-- Tabla de auditoría + triggers en tablas sensibles; endurece
-- clean_operational_data (gate is_admin + log) y fija search_path de
-- update_updated_at_column.

CREATE TABLE IF NOT EXISTS public.tms_auditoria (
  id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ts              timestamptz NOT NULL DEFAULT now(),
  actor_auth_uid  uuid,
  actor_rol       text,
  tabla           text NOT NULL,
  accion          text NOT NULL,
  registro_id     text,
  datos_antes     jsonb,
  datos_despues   jsonb
);

CREATE INDEX IF NOT EXISTS idx_tms_auditoria_ts    ON public.tms_auditoria (ts DESC);
CREATE INDEX IF NOT EXISTS idx_tms_auditoria_tabla ON public.tms_auditoria (tabla, ts DESC);

ALTER TABLE public.tms_auditoria ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS auditoria_select_admin ON public.tms_auditoria;
CREATE POLICY auditoria_select_admin ON public.tms_auditoria
  FOR SELECT USING (public.is_admin());

CREATE OR REPLACE FUNCTION public.tms_audit_row()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_actor uuid := auth.uid();
  v_rol   text;
BEGIN
  SELECT rol INTO v_rol FROM public.tms_usuarios WHERE auth_uid = v_actor LIMIT 1;

  IF TG_OP = 'DELETE' THEN
    INSERT INTO public.tms_auditoria(actor_auth_uid, actor_rol, tabla, accion, registro_id, datos_antes, datos_despues)
    VALUES (v_actor, v_rol, TG_TABLE_NAME, TG_OP, OLD.id::text, to_jsonb(OLD), NULL);
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.tms_auditoria(actor_auth_uid, actor_rol, tabla, accion, registro_id, datos_antes, datos_despues)
    VALUES (v_actor, v_rol, TG_TABLE_NAME, TG_OP, NEW.id::text, to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSE
    INSERT INTO public.tms_auditoria(actor_auth_uid, actor_rol, tabla, accion, registro_id, datos_antes, datos_despues)
    VALUES (v_actor, v_rol, TG_TABLE_NAME, TG_OP, NEW.id::text, NULL, to_jsonb(NEW));
    RETURN NEW;
  END IF;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.tms_audit_row() FROM PUBLIC, anon;

DROP TRIGGER IF EXISTS trg_audit_tms_usuarios ON public.tms_usuarios;
CREATE TRIGGER trg_audit_tms_usuarios
  AFTER INSERT OR UPDATE OR DELETE ON public.tms_usuarios
  FOR EACH ROW EXECUTE FUNCTION public.tms_audit_row();

DROP TRIGGER IF EXISTS trg_audit_tms_roles ON public.tms_roles;
CREATE TRIGGER trg_audit_tms_roles
  AFTER INSERT OR UPDATE OR DELETE ON public.tms_roles
  FOR EACH ROW EXECUTE FUNCTION public.tms_audit_row();

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

  INSERT INTO public.tms_auditoria(actor_auth_uid, actor_rol, tabla, accion, registro_id, datos_antes, datos_despues)
  VALUES (
    auth.uid(),
    (SELECT rol FROM public.tms_usuarios WHERE auth_uid = auth.uid() LIMIT 1),
    'tms_operacional', 'CLEAN_OPERATIONAL', NULL,
    jsonb_build_object('nv', p_clean_nv, 'partidas', p_clean_partidas, 'series', p_clean_series, 'farmapack', p_clean_farmapack),
    jsonb_build_object('resultado', msg)
  );

  RETURN msg;
EXCEPTION WHEN OTHERS THEN RETURN 'Error: ' || SQLERRM;
END;
$function$;

ALTER FUNCTION public.update_updated_at_column() SET search_path = public, pg_temp;
