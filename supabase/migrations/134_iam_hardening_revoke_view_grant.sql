-- ============================================================================
--  134_iam_hardening_revoke_view_grant.sql — Hardening IAM (auditoría)
--  La vista iam.user_effective_permissions NO filtra por auth.uid() (devuelve la
--  matriz de TODOS los usuarios). Las RPC que la consumen (iam_me,
--  authz.has_permission, authz.scopes_for, authz.policy_check) son SECURITY
--  DEFINER → la leen como owner y NO necesitan este grant. Se revoca para que
--  ningún `authenticated` pueda leerla directamente (defensa en profundidad).
--  El hook de JWT conserva su acceso vía supabase_auth_admin.
-- ============================================================================
revoke select on iam.user_effective_permissions from authenticated;
