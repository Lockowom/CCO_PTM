-- 014_fix_rbac_privilege_escalation.sql
-- Cierra DOS vectores de escalada de privilegios detectados en la BD en vivo:
--
--  (1) DRIFT DE RLS: las políticas de "solo lectura" de las tablas sensibles
--      (definidas como FOR SELECT en 003_rls_policies.sql) estaban en producción
--      como FOR ALL USING(true) WITH CHECK(true) para `authenticated`. Como las
--      políticas permisivas se combinan con OR, esa política abierta ANULABA las
--      políticas is_admin() paralelas → cualquier usuario autenticado podía
--      UPDATE/INSERT/DELETE sobre tms_usuarios, tms_roles, etc. (p. ej. ascender
--      su propio rol a ADMIN). Se restauran a FOR SELECT.
--
--  (2) AUTO-ASCENSO: la política usuarios_update_self_or_admin (necesaria para el
--      presence tracking) no restringe columnas, permitiendo que un usuario cambie
--      su propia `rol`/`es_admin_delegado`. Se añade un trigger BEFORE UPDATE que
--      congela las columnas privilegiadas para quien no sea admin.
--
-- Idempotente y aditiva: no modifica datos. Las políticas admin de escritura ya
-- existentes (*_write_admin / *_update_admin / *_delete_admin / *_insert_admin /
-- usuarios_update_self_or_admin) se conservan.

-- ============================================================
-- (1) Restaurar lectura-solo en tablas sensibles
-- ============================================================

-- tms_usuarios
DROP POLICY IF EXISTS "usuarios_select_auth" ON tms_usuarios;
CREATE POLICY "usuarios_select_auth" ON tms_usuarios
  FOR SELECT USING (auth.role() = 'authenticated');

-- tms_roles
DROP POLICY IF EXISTS "roles_select_auth" ON tms_roles;
CREATE POLICY "roles_select_auth" ON tms_roles
  FOR SELECT USING (auth.role() = 'authenticated');

-- tms_modules_config
DROP POLICY IF EXISTS "modules_select_auth" ON tms_modules_config;
CREATE POLICY "modules_select_auth" ON tms_modules_config
  FOR SELECT USING (auth.role() = 'authenticated');

-- tms_permisos (catálogo): lectura para authenticated, escritura solo admin
DROP POLICY IF EXISTS "auth_all_permisos" ON tms_permisos;
DROP POLICY IF EXISTS "permisos_select_auth" ON tms_permisos;
DROP POLICY IF EXISTS "permisos_write_admin" ON tms_permisos;
CREATE POLICY "permisos_select_auth" ON tms_permisos
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "permisos_write_admin" ON tms_permisos
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- tms_roles_permisos: lectura para authenticated, escritura solo admin
DROP POLICY IF EXISTS "auth_all_roles_permisos" ON tms_roles_permisos;
DROP POLICY IF EXISTS "roles_permisos_select_auth" ON tms_roles_permisos;
DROP POLICY IF EXISTS "roles_permisos_write_admin" ON tms_roles_permisos;
CREATE POLICY "roles_permisos_select_auth" ON tms_roles_permisos
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "roles_permisos_write_admin" ON tms_roles_permisos
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============================================================
-- (2) Congelar columnas privilegiadas de tms_usuarios para no-admins
-- ============================================================
-- Defensa en profundidad sobre la política usuarios_update_self_or_admin: un
-- usuario autenticado no-admin puede actualizar campos de presencia/perfil de su
-- propia fila (last_seen, current_module, current_path, last_action,
-- session_start, push_token, nombre) pero NO las columnas de privilegio. Los
-- admins (o procesos service_role sin JWT) no se ven afectados.
CREATE OR REPLACE FUNCTION public.tms_usuarios_freeze_privileged()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF public.is_admin() OR auth.uid() IS NULL THEN
    RETURN NEW;  -- admin o service_role: sin restricción
  END IF;
  -- No-admin: preservar los valores antiguos de las columnas de privilegio.
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
