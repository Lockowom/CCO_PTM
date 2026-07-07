-- 018_fix_rbac_privilege_escalation.sql
-- Sincronizada desde la BD live (schema_migrations version 20260612001503,
-- nombre original "fix_rbac_privilege_escalation").
-- FIX DE SEGURIDAD: saca tms_usuarios/roles/permisos/roles_permisos del modelo
-- permisivo "ALL USING(true)" (que permitía a cualquier autenticado escalar su
-- propio rol) → lectura-auth + escritura-admin, más un trigger que congela las
-- columnas privilegiadas de tms_usuarios para no-admins.

-- (1) Restaurar lectura-solo en tablas sensibles
DROP POLICY IF EXISTS "usuarios_select_auth" ON tms_usuarios;
CREATE POLICY "usuarios_select_auth" ON tms_usuarios
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "roles_select_auth" ON tms_roles;
CREATE POLICY "roles_select_auth" ON tms_roles
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "modules_select_auth" ON tms_modules_config;
CREATE POLICY "modules_select_auth" ON tms_modules_config
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "auth_all_permisos" ON tms_permisos;
DROP POLICY IF EXISTS "permisos_select_auth" ON tms_permisos;
DROP POLICY IF EXISTS "permisos_write_admin" ON tms_permisos;
CREATE POLICY "permisos_select_auth" ON tms_permisos
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "permisos_write_admin" ON tms_permisos
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "auth_all_roles_permisos" ON tms_roles_permisos;
DROP POLICY IF EXISTS "roles_permisos_select_auth" ON tms_roles_permisos;
DROP POLICY IF EXISTS "roles_permisos_write_admin" ON tms_roles_permisos;
CREATE POLICY "roles_permisos_select_auth" ON tms_roles_permisos
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "roles_permisos_write_admin" ON tms_roles_permisos
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- (2) Congelar columnas privilegiadas de tms_usuarios para no-admins
CREATE OR REPLACE FUNCTION public.tms_usuarios_freeze_privileged()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF public.is_admin() OR auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;
  NEW.rol               := OLD.rol;
  NEW.es_admin_delegado := OLD.es_admin_delegado;
  NEW.activo            := OLD.activo;
  NEW.email             := OLD.email;
  NEW.auth_uid          := OLD.auth_uid;
  NEW.id_usuario        := OLD.id_usuario;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_usuarios_freeze_privileged ON tms_usuarios;
CREATE TRIGGER trg_usuarios_freeze_privileged
  BEFORE UPDATE ON tms_usuarios
  FOR EACH ROW EXECUTE FUNCTION public.tms_usuarios_freeze_privileged();

REVOKE EXECUTE ON FUNCTION public.tms_usuarios_freeze_privileged() FROM PUBLIC, anon;
