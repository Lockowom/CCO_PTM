-- ============================================================================
-- 156_iam_org_admin_and_postventa_cutover.sql
-- Fase 4 de IAM:
--   - Administración operativa de teams / groups desde RPCs gateadas.
--   - Asignación de roles a principals team/group.
--   - Refresh manual de grupos dinámicos con reglas base.
--   - Cutover legacy de Postventa: _pv_assert deja permisos_json y usa IAM.
-- ============================================================================

-- ── Gate reutilizable de administración IAM organizacional ───────────────────
create or replace function authz._puede_admin_org()
returns boolean
language sql
stable
security definer
set search_path = public, authz
as $$
  select authz._puede_admin_scopes();
$$;

-- ── Catálogo para UI de teams/groups ─────────────────────────────────────────
create or replace function public.iam_catalogo_org()
returns jsonb
language plpgsql
stable
security definer
set search_path = public, iam, authz
as $$
begin
  if not authz._puede_admin_org() then raise exception 'No autorizado'; end if;

  return jsonb_build_object(
    'usuarios', coalesce((
      select jsonb_agg(jsonb_build_object('id', u.id, 'nombre', u.nombre, 'correo', u.correo) order by u.nombre)
      from iam.users u
      where u.activo
    ), '[]'::jsonb),
    'roles', coalesce((
      select jsonb_agg(jsonb_build_object('codigo', r.codigo, 'nombre', r.nombre) order by r.codigo)
      from iam.roles r
      where r.activo
    ), '[]'::jsonb),
    'departamentos', coalesce((
      select jsonb_agg(jsonb_build_object('id', d.id, 'codigo', d.codigo, 'nombre', d.nombre) order by d.nombre)
      from iam.departamentos d
      where coalesce(d.activo, true)
    ), '[]'::jsonb)
  );
end;
$$;
revoke all on function public.iam_catalogo_org() from public, anon;
grant execute on function public.iam_catalogo_org() to authenticated;

-- ── Equipos ──────────────────────────────────────────────────────────────────
create or replace function public.iam_teams()
returns jsonb
language plpgsql
stable
security definer
set search_path = public, iam, authz
as $$
begin
  if not authz._puede_admin_org() then raise exception 'No autorizado'; end if;

  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'id', t.id,
      'codigo', t.codigo,
      'nombre', t.nombre,
      'activo', coalesce(t.activo, true),
      'departamento_id', t.departamento_id,
      'departamento', d.nombre,
      'miembros', coalesce(tm.cnt, 0),
      'roles', coalesce(roles.roles, '[]'::jsonb)
    ) order by t.nombre)
    from iam.teams t
    left join iam.departamentos d on d.id = t.departamento_id
    left join lateral (
      select count(*)::int as cnt
      from iam.team_members tm
      where tm.team_id = t.id
    ) tm on true
    left join lateral (
      select jsonb_agg(distinct r.codigo order by r.codigo) as roles
      from iam.assignments a
      join iam.roles r on r.id = a.role_id
      where a.principal_type = 'team'
        and a.principal_id = t.id
        and (a.expires_at is null or a.expires_at > now())
    ) roles on true
  ), '[]'::jsonb);
end;
$$;
revoke all on function public.iam_teams() from public, anon;
grant execute on function public.iam_teams() to authenticated;

create or replace function public.iam_team_guardar(p jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, iam, authz
as $$
declare
  v_id uuid := nullif(p->>'id', '')::uuid;
  v_codigo text := upper(trim(coalesce(p->>'codigo', '')));
  v_nombre text := trim(coalesce(p->>'nombre', ''));
  v_departamento uuid := nullif(p->>'departamento_id', '')::uuid;
  v_activo boolean := coalesce((p->>'activo')::boolean, true);
begin
  if not authz._puede_admin_org() then raise exception 'No autorizado'; end if;
  if v_codigo = '' or v_nombre = '' then raise exception 'Código y nombre son obligatorios'; end if;
  if v_departamento is not null and not exists (select 1 from iam.departamentos where id = v_departamento) then
    raise exception 'Departamento inexistente';
  end if;

  if v_id is null then
    insert into iam.teams (codigo, nombre, departamento_id, activo)
    values (v_codigo, v_nombre, v_departamento, v_activo)
    returning id into v_id;
  else
    update iam.teams
       set codigo = v_codigo,
           nombre = v_nombre,
           departamento_id = v_departamento,
           activo = v_activo
     where id = v_id;
    if not found then raise exception 'Equipo inexistente'; end if;
  end if;

  return jsonb_build_object('ok', true, 'id', v_id);
end;
$$;
revoke all on function public.iam_team_guardar(jsonb) from public, anon;
grant execute on function public.iam_team_guardar(jsonb) to authenticated;

create or replace function public.iam_team_eliminar(p_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, iam, authz
as $$
begin
  if not authz._puede_admin_org() then raise exception 'No autorizado'; end if;
  delete from iam.assignments where principal_type = 'team' and principal_id = p_id;
  delete from iam.teams where id = p_id;
  return jsonb_build_object('ok', true);
end;
$$;
revoke all on function public.iam_team_eliminar(uuid) from public, anon;
grant execute on function public.iam_team_eliminar(uuid) to authenticated;

create or replace function public.iam_team_members(p_team uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public, iam, authz
as $$
begin
  if not authz._puede_admin_org() then raise exception 'No autorizado'; end if;
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'id', u.id,
      'nombre', u.nombre,
      'correo', u.correo
    ) order by u.nombre)
    from iam.team_members tm
    join iam.users u on u.id = tm.user_id
    where tm.team_id = p_team and u.activo
  ), '[]'::jsonb);
end;
$$;
revoke all on function public.iam_team_members(uuid) from public, anon;
grant execute on function public.iam_team_members(uuid) to authenticated;

create or replace function public.iam_team_member_add(p_team uuid, p_user uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, iam, authz
as $$
begin
  if not authz._puede_admin_org() then raise exception 'No autorizado'; end if;
  if not exists (select 1 from iam.teams where id = p_team) then raise exception 'Equipo inexistente'; end if;
  if not exists (select 1 from iam.users where id = p_user and activo) then raise exception 'Usuario inexistente'; end if;
  insert into iam.team_members (team_id, user_id) values (p_team, p_user)
  on conflict (team_id, user_id) do nothing;
  return jsonb_build_object('ok', true);
end;
$$;
revoke all on function public.iam_team_member_add(uuid, uuid) from public, anon;
grant execute on function public.iam_team_member_add(uuid, uuid) to authenticated;

create or replace function public.iam_team_member_remove(p_team uuid, p_user uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, iam, authz
as $$
begin
  if not authz._puede_admin_org() then raise exception 'No autorizado'; end if;
  delete from iam.team_members where team_id = p_team and user_id = p_user;
  return jsonb_build_object('ok', true);
end;
$$;
revoke all on function public.iam_team_member_remove(uuid, uuid) from public, anon;
grant execute on function public.iam_team_member_remove(uuid, uuid) to authenticated;

-- ── Grupos ───────────────────────────────────────────────────────────────────
create or replace function public.iam_groups()
returns jsonb
language plpgsql
stable
security definer
set search_path = public, iam, authz
as $$
begin
  if not authz._puede_admin_org() then raise exception 'No autorizado'; end if;

  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'id', g.id,
      'codigo', g.codigo,
      'nombre', g.nombre,
      'tipo', g.tipo,
      'activo', g.activo,
      'regla', g.regla,
      'miembros', coalesce(gm.cnt, 0),
      'roles', coalesce(roles.roles, '[]'::jsonb)
    ) order by g.nombre)
    from iam.groups g
    left join lateral (
      select count(*)::int as cnt from iam.group_members gm where gm.group_id = g.id
    ) gm on true
    left join lateral (
      select jsonb_agg(distinct r.codigo order by r.codigo) as roles
      from iam.assignments a
      join iam.roles r on r.id = a.role_id
      where a.principal_type = 'group'
        and a.principal_id = g.id
        and (a.expires_at is null or a.expires_at > now())
    ) roles on true
    where g.activo
  ), '[]'::jsonb);
end;
$$;
revoke all on function public.iam_groups() from public, anon;
grant execute on function public.iam_groups() to authenticated;

create or replace function public.iam_group_guardar(p jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, iam, authz
as $$
declare
  v_id uuid := nullif(p->>'id', '')::uuid;
  v_codigo text := upper(trim(coalesce(p->>'codigo', '')));
  v_nombre text := trim(coalesce(p->>'nombre', ''));
  v_tipo text := lower(trim(coalesce(p->>'tipo', 'static')));
  v_activo boolean := coalesce((p->>'activo')::boolean, true);
  v_regla jsonb := coalesce(p->'regla', '{}'::jsonb);
begin
  if not authz._puede_admin_org() then raise exception 'No autorizado'; end if;
  if v_codigo = '' or v_nombre = '' then raise exception 'Código y nombre son obligatorios'; end if;
  if v_tipo not in ('static', 'dynamic') then raise exception 'Tipo de grupo inválido'; end if;

  if v_id is null then
    insert into iam.groups (codigo, nombre, tipo, regla, activo)
    values (v_codigo, v_nombre, v_tipo, case when v_tipo = 'dynamic' then v_regla else null end, v_activo)
    returning id into v_id;
  else
    update iam.groups
       set codigo = v_codigo,
           nombre = v_nombre,
           tipo = v_tipo,
           regla = case when v_tipo = 'dynamic' then v_regla else null end,
           activo = v_activo,
           updated_at = now()
     where id = v_id;
    if not found then raise exception 'Grupo inexistente'; end if;
  end if;

  return jsonb_build_object('ok', true, 'id', v_id);
end;
$$;
revoke all on function public.iam_group_guardar(jsonb) from public, anon;
grant execute on function public.iam_group_guardar(jsonb) to authenticated;

create or replace function public.iam_group_eliminar(p_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, iam, authz
as $$
begin
  if not authz._puede_admin_org() then raise exception 'No autorizado'; end if;
  delete from iam.assignments where principal_type = 'group' and principal_id = p_id;
  delete from iam.groups where id = p_id;
  return jsonb_build_object('ok', true);
end;
$$;
revoke all on function public.iam_group_eliminar(uuid) from public, anon;
grant execute on function public.iam_group_eliminar(uuid) to authenticated;

create or replace function public.iam_group_members(p_group uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public, iam, authz
as $$
begin
  if not authz._puede_admin_org() then raise exception 'No autorizado'; end if;
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'id', u.id,
      'nombre', u.nombre,
      'correo', u.correo,
      'dinamico', gm.dinamico
    ) order by u.nombre)
    from iam.group_members gm
    join iam.users u on u.id = gm.user_id
    where gm.group_id = p_group and u.activo
  ), '[]'::jsonb);
end;
$$;
revoke all on function public.iam_group_members(uuid) from public, anon;
grant execute on function public.iam_group_members(uuid) to authenticated;

create or replace function public.iam_group_member_add(p_group uuid, p_user uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, iam, authz
as $$
declare
  v_tipo text;
begin
  if not authz._puede_admin_org() then raise exception 'No autorizado'; end if;
  select tipo into v_tipo from iam.groups where id = p_group;
  if v_tipo is null then raise exception 'Grupo inexistente'; end if;
  if v_tipo <> 'static' then raise exception 'Solo los grupos static admiten membresía manual'; end if;
  if not exists (select 1 from iam.users where id = p_user and activo) then raise exception 'Usuario inexistente'; end if;
  insert into iam.group_members (group_id, user_id, dinamico)
  values (p_group, p_user, false)
  on conflict (group_id, user_id) do update set dinamico = false;
  return jsonb_build_object('ok', true);
end;
$$;
revoke all on function public.iam_group_member_add(uuid, uuid) from public, anon;
grant execute on function public.iam_group_member_add(uuid, uuid) to authenticated;

create or replace function public.iam_group_member_remove(p_group uuid, p_user uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, iam, authz
as $$
declare
  v_tipo text;
begin
  if not authz._puede_admin_org() then raise exception 'No autorizado'; end if;
  select tipo into v_tipo from iam.groups where id = p_group;
  if v_tipo is null then raise exception 'Grupo inexistente'; end if;
  if v_tipo <> 'static' then raise exception 'Solo los grupos static admiten membresía manual'; end if;
  delete from iam.group_members where group_id = p_group and user_id = p_user and coalesce(dinamico, false) = false;
  return jsonb_build_object('ok', true);
end;
$$;
revoke all on function public.iam_group_member_remove(uuid, uuid) from public, anon;
grant execute on function public.iam_group_member_remove(uuid, uuid) to authenticated;

-- ── Roles asignados a principals team/group ──────────────────────────────────
create or replace function public.iam_principal_asignaciones(
  p_principal_type text,
  p_principal_id uuid
) returns jsonb
language plpgsql
stable
security definer
set search_path = public, iam, authz
as $$
begin
  if not authz._puede_admin_org() then raise exception 'No autorizado'; end if;
  if p_principal_type not in ('team', 'group') then raise exception 'Principal no soportado'; end if;

  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'id', a.id,
      'role', r.codigo,
      'role_nombre', r.nombre,
      'scope_type', a.scope_type,
      'scope_code', a.scope_code,
      'expires_at', a.expires_at
    ) order by r.codigo, a.scope_type, a.scope_code)
    from iam.assignments a
    join iam.roles r on r.id = a.role_id
    where a.principal_type = p_principal_type::iam.principal_type
      and a.principal_id = p_principal_id
  ), '[]'::jsonb);
end;
$$;
revoke all on function public.iam_principal_asignaciones(text, uuid) from public, anon;
grant execute on function public.iam_principal_asignaciones(text, uuid) to authenticated;

create or replace function public.iam_principal_asignar_rol(
  p_principal_type text,
  p_principal_id uuid,
  p_role text,
  p_scope_type text default 'global',
  p_scope_code text default null,
  p_expires timestamptz default null
) returns jsonb
language plpgsql
security definer
set search_path = public, iam, authz
as $$
declare
  v_role uuid;
  v_id uuid;
begin
  if not authz._puede_admin_org() then raise exception 'No autorizado'; end if;
  if p_principal_type not in ('team', 'group') then raise exception 'Principal no soportado'; end if;
  select id into v_role from iam.roles where codigo = p_role and activo;
  if v_role is null then raise exception 'Rol inexistente'; end if;
  if p_principal_type = 'team' and not exists (select 1 from iam.teams where id = p_principal_id) then
    raise exception 'Equipo inexistente';
  end if;
  if p_principal_type = 'group' and not exists (select 1 from iam.groups where id = p_principal_id) then
    raise exception 'Grupo inexistente';
  end if;
  if p_scope_type <> 'global' and nullif(trim(coalesce(p_scope_code, '')), '') is null then
    raise exception 'El scope_code es obligatorio cuando el ámbito no es global';
  end if;

  select a.id into v_id
  from iam.assignments a
  where a.principal_type = p_principal_type::iam.principal_type
    and a.principal_id = p_principal_id
    and a.role_id = v_role
    and a.scope_type = p_scope_type::iam.scope_type
    and coalesce(a.scope_code, '') = coalesce(p_scope_code, '');

  if v_id is not null then
    update iam.assignments
       set expires_at = p_expires,
           granted_at = now(),
           granted_by = auth.uid()
     where id = v_id;
    return jsonb_build_object('ok', true, 'id', v_id, 'accion', 'actualizado');
  end if;

  insert into iam.assignments (principal_type, principal_id, role_id, scope_type, scope_code, granted_by, expires_at)
  values (p_principal_type::iam.principal_type, p_principal_id, v_role, p_scope_type::iam.scope_type, p_scope_code, auth.uid(), p_expires)
  returning id into v_id;

  return jsonb_build_object('ok', true, 'id', v_id, 'accion', 'creado');
end;
$$;
revoke all on function public.iam_principal_asignar_rol(text, uuid, text, text, text, timestamptz) from public, anon;
grant execute on function public.iam_principal_asignar_rol(text, uuid, text, text, text, timestamptz) to authenticated;

create or replace function public.iam_principal_revocar_asignacion(p_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, iam, authz
as $$
begin
  if not authz._puede_admin_org() then raise exception 'No autorizado'; end if;
  delete from iam.assignments where id = p_id and principal_type in ('team', 'group');
  return jsonb_build_object('ok', true);
end;
$$;
revoke all on function public.iam_principal_revocar_asignacion(uuid) from public, anon;
grant execute on function public.iam_principal_revocar_asignacion(uuid) to authenticated;

-- ── Refresh de grupos dinámicos (reglas base) ────────────────────────────────
create or replace function iam.refresh_dynamic_group(p_group uuid)
returns integer
language plpgsql
security definer
set search_path = public, iam
as $$
declare
  v_group iam.groups%rowtype;
  v_count integer := 0;
begin
  select * into v_group from iam.groups where id = p_group;
  if v_group.id is null then raise exception 'Grupo inexistente'; end if;
  if v_group.tipo <> 'dynamic' then return 0; end if;

  delete from iam.group_members where group_id = p_group and dinamico = true;

  insert into iam.group_members (group_id, user_id, dinamico)
  select p_group, u.id, true
  from iam.users u
  where u.activo
    and (
      exists (
        select 1
        from jsonb_array_elements_text(coalesce(v_group.regla->'user_ids', '[]'::jsonb)) x(idtxt)
        where x.idtxt = u.id::text
      )
      or exists (
        select 1
        from iam.team_members tm
        join jsonb_array_elements_text(coalesce(v_group.regla->'team_ids', '[]'::jsonb)) x(idtxt)
          on x.idtxt = tm.team_id::text
        where tm.user_id = u.id
      )
      or exists (
        select 1
        from iam.user_departments ud
        join jsonb_array_elements_text(coalesce(v_group.regla->'department_ids', '[]'::jsonb)) x(idtxt)
          on x.idtxt = ud.departamento_id::text
        where ud.user_id = u.id
      )
      or exists (
        select 1
        from iam.team_members tm
        join iam.teams t on t.id = tm.team_id
        join jsonb_array_elements_text(coalesce(v_group.regla->'department_ids', '[]'::jsonb)) x(idtxt)
          on x.idtxt = t.departamento_id::text
        where tm.user_id = u.id
      )
    )
  on conflict (group_id, user_id) do update set dinamico = true;

  get diagnostics v_count = row_count;
  update iam.groups set updated_at = now() where id = p_group;
  return v_count;
end;
$$;
revoke all on function iam.refresh_dynamic_group(uuid) from public, anon, authenticated;
grant execute on function iam.refresh_dynamic_group(uuid) to supabase_auth_admin;

create or replace function public.iam_refresh_dynamic_groups(p_group uuid default null)
returns jsonb
language plpgsql
security definer
set search_path = public, iam, authz
as $$
declare
  v_total integer := 0;
  v_count integer := 0;
  g record;
begin
  if not authz._puede_admin_org() then raise exception 'No autorizado'; end if;

  if p_group is not null then
    v_count := iam.refresh_dynamic_group(p_group);
    return jsonb_build_object('ok', true, 'grupos', 1, 'miembros_actualizados', v_count);
  end if;

  for g in select id from iam.groups where tipo = 'dynamic' and activo loop
    v_total := v_total + 1;
    v_count := v_count + iam.refresh_dynamic_group(g.id);
  end loop;

  return jsonb_build_object('ok', true, 'grupos', v_total, 'miembros_actualizados', v_count);
end;
$$;
revoke all on function public.iam_refresh_dynamic_groups(uuid) from public, anon;
grant execute on function public.iam_refresh_dynamic_groups(uuid) to authenticated;

-- ── Postventa: helper legacy migrado a IAM central ───────────────────────────
create or replace function public._pv_assert(p_super boolean default false)
returns table(uid uuid, nombre text, rol text, es_admin_delegado boolean, permisos jsonb)
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v record;
  v_ok boolean;
begin
  if auth.role() = 'service_role' then
    uid := null;
    nombre := 'Extractor de correos';
    rol := 'SERVICE';
    es_admin_delegado := true;
    permisos := '[]'::jsonb;
    return next;
    return;
  end if;

  select u.auth_uid, u.nombre::text as nombre, u.rol::text as rol,
         coalesce(u.es_admin_delegado, false) as es_admin_delegado
    into v
  from tms_usuarios u
  where u.auth_uid = auth.uid() and u.activo = true
  limit 1;

  if v.auth_uid is null then
    raise exception 'Usuario no autenticado';
  end if;

  v_ok := coalesce(private.is_admin(), false);
  if not v_ok then
    if p_super then
      v_ok := coalesce(public.usuario_tiene_algun_permiso(array['supervise_postventa']), false);
    else
      v_ok := coalesce(public.usuario_tiene_algun_permiso(array['manage_postventa', 'supervise_postventa']), false);
    end if;
  end if;

  if not v_ok then
    if p_super then
      raise exception 'Acceso denegado: se requiere supervisión de Post-Venta';
    else
      raise exception 'Acceso denegado: se requiere permiso de Post-Venta';
    end if;
  end if;

  uid := v.auth_uid;
  nombre := v.nombre;
  rol := v.rol;
  es_admin_delegado := v.es_admin_delegado;
  permisos := '[]'::jsonb;
  return next;
end;
$$;
