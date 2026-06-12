-- 016_audit_and_hardening.sql
-- Auditoría de acciones privilegiadas + hardening de funciones.
-- Idempotente. No modifica datos existentes.
--
-- Contexto: la auditoría de ciberseguridad detectó que (a) los cambios sobre usuarios y
-- roles no quedaban registrados (imposible saber "quién hizo qué"), (b) la limpieza masiva
-- de datos no dejaba traza, y (c) public.update_updated_at_column() tenía search_path mutable
-- (lint 0011 de Supabase). Esta migración resuelve los tres.

-- ─────────────────────────────────────────────────────────────────────────
-- 1. Tabla de auditoría
-- ─────────────────────────────────────────────────────────────────────────
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

-- RLS: solo administradores pueden leerla. No hay políticas de escritura: únicamente los
-- triggers/funciones SECURITY DEFINER (owner) insertan, evitando manipulación desde el cliente.
ALTER TABLE public.tms_auditoria ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS auditoria_select_admin ON public.tms_auditoria;
CREATE POLICY auditoria_select_admin ON public.tms_auditoria
  FOR SELECT USING (public.is_admin());

-- ─────────────────────────────────────────────────────────────────────────
-- 2. Trigger genérico de auditoría de filas
-- ─────────────────────────────────────────────────────────────────────────
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
  ELSE -- INSERT
    INSERT INTO public.tms_auditoria(actor_auth_uid, actor_rol, tabla, accion, registro_id, datos_antes, datos_despues)
    VALUES (v_actor, v_rol, TG_TABLE_NAME, TG_OP, NEW.id::text, NULL, to_jsonb(NEW));
    RETURN NEW;
  END IF;
END;
$$;

-- Es una función de trigger: ningún rol debe poder invocarla vía /rpc.
REVOKE EXECUTE ON FUNCTION public.tms_audit_row() FROM PUBLIC, anon, authenticated;
-- Mismo endurecimiento para el trigger de freeze (migración 014, quedó ejecutable por authenticated).
REVOKE EXECUTE ON FUNCTION public.tms_usuarios_freeze_privileged() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_audit_tms_usuarios ON public.tms_usuarios;
CREATE TRIGGER trg_audit_tms_usuarios
  AFTER INSERT OR UPDATE OR DELETE ON public.tms_usuarios
  FOR EACH ROW EXECUTE FUNCTION public.tms_audit_row();

DROP TRIGGER IF EXISTS trg_audit_tms_roles ON public.tms_roles;
CREATE TRIGGER trg_audit_tms_roles
  AFTER INSERT OR UPDATE OR DELETE ON public.tms_roles
  FOR EACH ROW EXECUTE FUNCTION public.tms_audit_row();

-- ─────────────────────────────────────────────────────────────────────────
-- 3. Auditar la limpieza masiva de datos operativos
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

  -- Traza de auditoría de la acción destructiva (actor + opciones seleccionadas).
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

-- ─────────────────────────────────────────────────────────────────────────
-- 4. Hardening: fijar search_path en public.update_updated_at_column (lint 0011)
--    (la función homónima del schema `storage` es gestionada por Supabase; no se toca)
-- ─────────────────────────────────────────────────────────────────────────
ALTER FUNCTION public.update_updated_at_column() SET search_path = public, pg_temp;
