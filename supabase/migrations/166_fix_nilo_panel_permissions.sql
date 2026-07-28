-- ============================================================================
-- 166_fix_nilo_panel_permissions.sql
-- Alinea al usuario Nilo con el rol SUPERVISOR y asegura su acceso IAM global
-- al Panel para editar y guardar N.V. en Ingreso.
-- ============================================================================

do $$
declare
  v_email text := 'nilo@ptm.cl';
  v_auth_uid uuid;
  v_user_row_id uuid;
  v_role_id uuid;
  v_team_id uuid;
begin
  select u.id, u.auth_uid
    into v_user_row_id, v_auth_uid
  from public.tms_usuarios u
  where lower(coalesce(u.email, '')) = v_email
    and coalesce(u.activo, true) = true
  limit 1;

  if v_user_row_id is null or v_auth_uid is null then
    raise exception 'No se encontró un usuario activo con auth_uid para %', v_email;
  end if;

  update public.tms_usuarios
     set rol = 'SUPERVISOR'
   where id = v_user_row_id
     and coalesce(rol, '') <> 'SUPERVISOR';

  perform authz.sync_user_profile(v_auth_uid);
  perform authz.rebuild_role('SUPERVISOR');

  select r.id
    into v_role_id
  from iam.roles r
  join iam.role_permissions rp on rp.role_id = r.id
  join iam.permissions p on p.id = rp.permission_id
  where r.codigo = 'SUPERVISOR'
    and coalesce(r.activo, true) = true
    and p.codigo = 'manage_panel'
  limit 1;

  if v_role_id is null then
    raise exception 'El rol SUPERVISOR no tiene manage_panel en IAM.';
  end if;

  insert into iam.assignments (
    principal_type,
    principal_id,
    role_id,
    scope_type,
    scope_code,
    granted_by,
    granted_at,
    expires_at
  )
  values (
    'user',
    v_auth_uid,
    v_role_id,
    'global',
    null,
    null,
    now(),
    null
  )
  on conflict do nothing;

  update iam.assignments
     set expires_at = null,
         granted_at = now(),
         granted_by = null
   where principal_type = 'user'
     and principal_id = v_auth_uid
     and role_id = v_role_id
     and scope_type = 'global'
     and scope_code is null;

  select t.id
    into v_team_id
  from iam.teams t
  where t.codigo = 'ROL_SUPERVISOR'
    and coalesce(t.activo, true) = true
  limit 1;

  if v_team_id is not null then
    insert into iam.team_members (team_id, user_id)
    values (v_team_id, v_auth_uid)
    on conflict do nothing;
  end if;

  perform authz.sync_user_profile(v_auth_uid);
  perform authz.refresh_permissions();
end $$;
