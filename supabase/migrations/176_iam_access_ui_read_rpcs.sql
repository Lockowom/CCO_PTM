-- 176_iam_access_ui_read_rpcs.sql
-- ============================================================================
--  PR-IAM-R09/R10 · CONTROL DE ACCESO UI (read-only) — RPCs de lectura admin
--
--  SPEC: CCO_2_0_IAM_RECONSTRUCCION_ESTRUCTURAL_CONTROLADA_V1 (§105-106)
--  * La UI read-only debe poder mostrar EXACTAMENTE qué tiene cada usuario.
--  * iam_permisos_efectivos(p_uid): permisos efectivos del usuario leídos del
--    motor existente (vista iam.user_effective_permissions: permission,
--    scope_type, scope_id, scope_code). Muestra el estado REAL, no una copia.
--  * iam_overrides_list(p_uid): overrides del usuario (para que el admin vea
--    y luego gestione la vista; la escritura sigue en iam_overrides_upsert/
--    delete de la migración 175).
--
--  ADITIVA: no toca datos, no revoca nada, no altera el resolver vigente.
--  Gate idéntico al 175: private.is_admin() ∨ permiso efectivo manage_users.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1) Permisos efectivos de un usuario (admin ∨ manage_users)
-- ---------------------------------------------------------------------------
create or replace function public.iam_permisos_efectivos(
  p_uid uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'No autorizado';
  end if;
  if not (
    private.is_admin()
    or exists (
      select 1 from iam.user_effective_permissions p
      where p.user_id = v_uid and p.permission = 'manage_users'
    )
  ) then
    raise exception 'No autorizado';
  end if;

  return coalesce(
    (select jsonb_agg(
       jsonb_build_object(
         'permission', p.permission,
         'scope_type', p.scope_type,
         'scope_id',   p.scope_id,
         'scope_code', p.scope_code
       ) order by p.permission, p.scope_code nulls last
     )
     from iam.user_effective_permissions p
     where p.user_id = p_uid),
    '[]'::jsonb);
end;
$$;

-- ---------------------------------------------------------------------------
-- 2) Overrides de un usuario (admin ∨ manage_users)
-- ---------------------------------------------------------------------------
create or replace function public.iam_overrides_list(
  p_uid uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'No autorizado';
  end if;
  if not (
    private.is_admin()
    or exists (
      select 1 from iam.user_effective_permissions p
      where p.user_id = v_uid and p.permission = 'manage_users'
    )
  ) then
    raise exception 'No autorizado';
  end if;

  return coalesce(
    (select jsonb_agg(
       jsonb_build_object(
         'surface_type', o.surface_type,
         'surface_id',   o.surface_id,
         'access',       o.access,
         'reason',       o.reason,
         'updated_at',   o.updated_at
       ) order by o.surface_type, o.surface_id
     )
     from iam.user_overrides o
     where o.principal_id = p_uid),
    '[]'::jsonb);
end;
$$;

-- ---------------------------------------------------------------------------
-- 3) Grants: solo authenticated (nunca anon/public)
-- ---------------------------------------------------------------------------
revoke all on function public.iam_permisos_efectivos(uuid) from public, anon;
grant execute on function public.iam_permisos_efectivos(uuid) to authenticated;

revoke all on function public.iam_overrides_list(uuid) from public, anon;
grant execute on function public.iam_overrides_list(uuid) to authenticated;