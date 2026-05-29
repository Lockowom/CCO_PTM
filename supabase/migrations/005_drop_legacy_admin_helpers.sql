-- ============================================================
-- MIGRACIÓN 005: Eliminar helpers de admin legacy
-- Fecha: 2026-05-29
-- ============================================================
-- is_admin_safe() / is_user_admin() chequeaban admin por email (auth.email()).
-- Quedaron obsoletas tras introducir la canónica private.is_admin() (por auth_uid),
-- expuesta vía wrapper public.is_admin(). No las referencia ninguna política RLS,
-- ninguna función ni el código de la app. Se eliminan como residuo.
-- ============================================================

DROP FUNCTION IF EXISTS public.is_admin_safe();
DROP FUNCTION IF EXISTS public.is_user_admin();
