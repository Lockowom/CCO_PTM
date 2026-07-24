-- ============================================================================
-- 155_iam_principal_inheritance.sql
-- Fase 3 de IAM:
--   - Herencia real por principals: user + team + department + group.
--   - Se incorporan grupos y membresías de departamento explícitas.
--   - Se separan roles base vs roles efectivos (con delegación).
--   - iam_me(), user_context y delegaciones pasan a leer la capa efectiva.
-- ============================================================================

-- ── Estructura faltante para groups / department memberships ─────────────────
create table if not exists iam.groups (
  id uuid primary key default gen_random_uuid(),
  codigo text unique not null,
  nombre text not null,
  tipo text not null default 'static' check (tipo in ('static', 'dynamic')),
  regla jsonb,
  activo boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists iam.group_members (
  group_id uuid not null references iam.groups(id) on delete cascade,
  user_id uuid not null references iam.users(id) on delete cascade,
  dinamico boolean not null default false,
  created_at timestamptz default now(),
  primary key (group_id, user_id)
);
create index if not exists iam_group_members_user_idx on iam.group_members (user_id);

create table if not exists iam.user_departments (
  departamento_id uuid not null references iam.departamentos(id) on delete cascade,
  user_id uuid not null references iam.users(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (departamento_id, user_id)
);
create index if not exists iam_user_departments_user_idx on iam.user_departments (user_id);

-- ── Roles base del usuario: directos + heredados por team/department/group ──
create or replace view iam.user_base_roles as
with principals as (
  select u.id as user_id, 'user'::iam.principal_type as principal_type, u.id as principal_id
  from iam.users u
  where u.activo

  union

  select tm.user_id, 'team'::iam.principal_type, tm.team_id
  from iam.team_members tm
  join iam.users u on u.id = tm.user_id and u.activo
  join iam.teams t on t.id = tm.team_id and coalesce(t.activo, true)

  union

  select ud.user_id, 'department'::iam.principal_type, ud.departamento_id
  from iam.user_departments ud
  join iam.users u on u.id = ud.user_id and u.activo
  join iam.departamentos d on d.id = ud.departamento_id and coalesce(d.activo, true)

  union

  select tm.user_id, 'department'::iam.principal_type, t.departamento_id
  from iam.team_members tm
  join iam.users u on u.id = tm.user_id and u.activo
  join iam.teams t on t.id = tm.team_id and coalesce(t.activo, true)
  join iam.departamentos d on d.id = t.departamento_id and coalesce(d.activo, true)
  where t.departamento_id is not null

  union

  select gm.user_id, 'group'::iam.principal_type, gm.group_id
  from iam.group_members gm
  join iam.users u on u.id = gm.user_id and u.activo
  join iam.groups g on g.id = gm.group_id and g.activo
)
select distinct
  pr.user_id,
  a.role_id,
  r.codigo as role_codigo,
  a.scope_type,
  a.scope_id,
  a.scope_code,
  a.principal_type,
  a.principal_id
from principals pr
join iam.assignments a
  on a.principal_type = pr.principal_type
 and a.principal_id = pr.principal_id
join iam.roles r on r.id = a.role_id and r.activo
where a.expires_at is null or a.expires_at > now();

revoke all on iam.user_base_roles from public, anon, authenticated;

-- ── Roles efectivos: base + delegación activa ────────────────────────────────
create or replace view iam.user_effective_roles as
select
  br.user_id,
  br.role_id,
  br.role_codigo,
  br.scope_type,
  br.scope_id,
  br.scope_code,
  br.principal_type,
  br.principal_id,
  'base'::text as source
from iam.user_base_roles br

union

select
  d.delegado as user_id,
  br.role_id,
  br.role_codigo,
  br.scope_type,
  br.scope_id,
  br.scope_code,
  br.principal_type,
  br.principal_id,
  'delegation'::text as source
from iam.delegations d
join iam.user_base_roles br
  on br.user_id = d.delegador
 and (d.role_id is null or br.role_id = d.role_id)
where d.activo
  and now() between d.desde and d.hasta;

revoke all on iam.user_effective_roles from public, anon, authenticated;

-- ── Permisos efectivos reconstruidos sobre roles efectivos ───────────────────
create or replace view iam.user_effective_permissions as
select distinct
  er.user_id,
  p.codigo as permission,
  er.scope_type,
  er.scope_id,
  er.scope_code
from iam.user_effective_roles er
join iam.role_permissions rp on rp.role_id = er.role_id
join iam.permissions p on p.id = rp.permission_id;

revoke select on iam.user_effective_permissions from authenticated;
grant select on iam.user_effective_permissions to supabase_auth_admin;

-- ── MV: snapshot actual sobre la vista efectiva ──────────────────────────────
drop materialized view if exists iam.mv_user_permissions;
create materialized view iam.mv_user_permissions as
select user_id, permission, scope_type, scope_id, scope_code
from iam.user_effective_permissions
with data;
create index mv_user_perms_lookup_idx on iam.mv_user_permissions (user_id, permission);

create or replace function authz.refresh_permissions()
returns void
language plpgsql
security definer
set search_path = iam, authz, public
as $$
begin
  refresh materialized view iam.mv_user_permissions;
end;
$$;

-- ── iam_me(): ahora expone roles efectivos, no solo directos ─────────────────
create or replace function public.iam_me()
returns jsonb
language sql
stable
security definer
set search_path = public, iam, authz
as $$
  select jsonb_build_object(
    'user_id',  tu.auth_uid,
    'nombre',   tu.nombre,
    'correo',   tu.email,
    'activo',   coalesce(tu.activo, false),
    'es_admin', (tu.rol = 'ADMIN' or coalesce(tu.es_admin_delegado, false)),
    'rol',      tu.rol,
    'roles',    coalesce((
                  select jsonb_agg(distinct er.role_codigo)
                  from iam.user_effective_roles er
                  where er.user_id = tu.auth_uid
                ), jsonb_build_array(tu.rol)),
    'permisos', coalesce((
                  select jsonb_agg(distinct e.permission)
                  from iam.user_effective_permissions e
                  where e.user_id = tu.auth_uid
                ), '[]'::jsonb)
  )
  from tms_usuarios tu
  where tu.auth_uid = auth.uid()
  limit 1;
$$;
revoke all on function public.iam_me() from public, anon;
grant execute on function public.iam_me() to authenticated;

-- ── Contexto ABAC/scopes: ya usa herencia efectiva ───────────────────────────
create or replace function authz.user_context(p_uid uuid default null)
returns jsonb
language plpgsql
stable
security definer
set search_path = public, iam, authz
as $$
declare
  v_uid uuid := coalesce(p_uid, auth.uid());
  v_rol text;
  v_nombre text;
  v_admin boolean;
  v_global boolean;
  v_centros jsonb;
begin
  if p_uid is not null and p_uid <> auth.uid() and not authz._es_admin_app() then
    raise exception 'No autorizado para inspeccionar el contexto de otro usuario';
  end if;

  select rol, nombre into v_rol, v_nombre
  from public.tms_usuarios
  where auth_uid = v_uid
  limit 1;

  v_admin := (v_rol = 'ADMIN') or exists (
    select 1
    from public.tms_usuarios
    where auth_uid = v_uid and coalesce(es_admin_delegado, false)
  );

  v_global := v_admin or exists (
    select 1
    from iam.user_effective_permissions e
    where e.user_id = v_uid
      and e.scope_type = 'global'
  );

  v_centros := coalesce((
    select jsonb_agg(distinct e.scope_code)
    from iam.user_effective_permissions e
    where e.user_id = v_uid
      and e.scope_type = 'centro_costo'
      and e.scope_code is not null
  ), '[]'::jsonb);

  return jsonb_build_object(
    'uid', v_uid,
    'rol', v_rol,
    'nombre', v_nombre,
    'es_admin', v_admin,
    'sin_limite_centro', v_global,
    'centros_costo', v_centros
  );
end;
$$;
revoke all on function authz.user_context(uuid) from public, anon;
grant execute on function authz.user_context(uuid) to authenticated;

-- ── Delegación: permitir roles base heredados por principals ─────────────────
create or replace function public.iam_delegar(
  p_delegado uuid,
  p_hasta timestamptz,
  p_desde timestamptz default null,
  p_role text default null,
  p_motivo text default null,
  p_delegador uuid default null
) returns jsonb
language plpgsql
security definer
set search_path = public, iam, authz
as $$
declare
  v_delegador uuid;
  v_role uuid;
  v_id uuid;
  v_rol text;
begin
  v_delegador := coalesce(p_delegador, auth.uid());
  if v_delegador <> auth.uid() and not authz._es_admin_app() then
    raise exception 'Solo un administrador puede delegar en nombre de otro';
  end if;
  if p_delegado is null then raise exception 'Falta el usuario que cubre'; end if;
  if p_delegado = v_delegador then raise exception 'No puedes delegarte a ti mismo'; end if;
  if not exists (select 1 from iam.users where id = p_delegado) then raise exception 'Usuario de cobertura inexistente'; end if;
  if not exists (select 1 from iam.users where id = v_delegador) then raise exception 'Delegador inexistente'; end if;
  if p_hasta <= coalesce(p_desde, now()) then raise exception 'La fecha de término debe ser posterior al inicio'; end if;

  if p_role is not null then
    select id into v_role from iam.roles where codigo = p_role;
    if v_role is null then raise exception 'Rol inexistente: %', p_role; end if;
    if not exists (
      select 1
      from iam.user_base_roles br
      where br.user_id = v_delegador
        and br.role_id = v_role
    ) then
      raise exception 'El delegador no posee el rol %', p_role;
    end if;
  end if;

  insert into iam.delegations (delegador, delegado, role_id, desde, hasta, motivo, created_by)
  values (v_delegador, p_delegado, v_role, coalesce(p_desde, now()), p_hasta, p_motivo, auth.uid())
  returning id into v_id;

  select rol into v_rol from public.tms_usuarios where auth_uid = auth.uid() limit 1;
  insert into public.tms_auditoria (actor_auth_uid, actor_rol, tabla, accion, registro_id, datos_despues)
  values (auth.uid(), v_rol, 'iam.delegations', 'INSERT', v_id::text,
          jsonb_build_object('delegador', v_delegador, 'delegado', p_delegado, 'role', p_role,
                             'desde', coalesce(p_desde, now()), 'hasta', p_hasta, 'motivo', p_motivo));
  return jsonb_build_object('ok', true, 'id', v_id);
end;
$$;
revoke all on function public.iam_delegar(uuid, timestamptz, timestamptz, text, text, uuid) from public, anon;
grant execute on function public.iam_delegar(uuid, timestamptz, timestamptz, text, text, uuid) to authenticated;
