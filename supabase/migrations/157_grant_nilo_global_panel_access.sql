-- ============================================================================
-- 157_grant_nilo_global_panel_access.sql
-- Otorga a Nilo acceso IAM global para Panel usando su rol actual, cubriendo
-- todos los centro_costo presentes y futuros.
-- ============================================================================

do $$
declare
  v_auth_uid uuid;
  v_role_code text;
  v_role_id uuid;
begin
  select u.auth_uid, u.rol
    into v_auth_uid, v_role_code
  from public.tms_usuarios u
  where lower(coalesce(u.email, '')) = 'nilo@ptm.cl'
    and u.activo = true
  limit 1;

  if v_auth_uid is null then
    raise exception 'No se encontró un usuario activo para nilo@ptm.cl';
  end if;

  select r.id
    into v_role_id
  from iam.roles r
  join iam.role_permissions rp on rp.role_id = r.id
  join iam.permissions p on p.id = rp.permission_id
  where r.codigo = v_role_code
    and r.activo
    and p.codigo = 'manage_panel'
  limit 1;

  if v_role_id is null then
    raise exception 'El rol % no tiene manage_panel en IAM; revisa el sync de roles.', v_role_code;
  end if;

  if exists (
    select 1
    from iam.assignments a
    where a.principal_type = 'user'
      and a.principal_id = v_auth_uid
      and a.role_id = v_role_id
      and a.scope_type = 'global'
      and a.scope_code is null
  ) then
    update iam.assignments
       set expires_at = null,
           granted_at = now(),
           granted_by = null
     where principal_type = 'user'
       and principal_id = v_auth_uid
       and role_id = v_role_id
       and scope_type = 'global'
       and scope_code is null;
  else
    insert into iam.assignments (
      principal_type, principal_id, role_id, scope_type, scope_code, granted_by, granted_at, expires_at
    ) values (
      'user', v_auth_uid, v_role_id, 'global', null, null, now(), null
    );
  end if;

  perform authz.refresh_permissions();
end $$;
