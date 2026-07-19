-- ============================================================================
--  121_iam_fase0.sql — Identity & Security · FASE 0 (cimiento, NO destructivo)
--  Crea los esquemas iam/authz y COPIA los datos actuales (usuarios/roles/
--  permisos) SIN tocar tms_*. La app sigue operando sobre tms_*; el IAM queda
--  en paralelo, listo para el cutover gradual (Fase 1). Ver docs/IAM_ARQUITECTURA.md.
-- ============================================================================
create schema if not exists iam;
create schema if not exists authz;

-- ── Enums (idempotentes) ────────────────────────────────────────────────────
do $$ begin
  create type iam.scope_type as enum ('global','empresa','departamento','sucursal','cd','bodega','cliente','transportista');
exception when duplicate_object then null; end $$;
do $$ begin
  create type iam.principal_type as enum ('user','team','department','group');
exception when duplicate_object then null; end $$;

-- ── Organización ────────────────────────────────────────────────────────────
create table if not exists iam.empresas (
  id uuid primary key default gen_random_uuid(),
  codigo text unique not null, nombre text not null,
  activo boolean not null default true, created_at timestamptz default now());
create table if not exists iam.departamentos (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references iam.empresas(id) on delete restrict,
  codigo text not null, nombre text not null, activo boolean default true,
  unique (empresa_id, codigo));
create table if not exists iam.sucursales (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references iam.empresas(id) on delete restrict,
  codigo text not null, nombre text not null, activo boolean default true,
  unique (empresa_id, codigo));
create table if not exists iam.centros_distribucion (
  id uuid primary key default gen_random_uuid(),
  sucursal_id uuid not null references iam.sucursales(id) on delete restrict,
  codigo text not null, nombre text not null, activo boolean default true,
  unique (sucursal_id, codigo));
create table if not exists iam.bodegas (
  id uuid primary key default gen_random_uuid(),
  cd_id uuid not null references iam.centros_distribucion(id) on delete restrict,
  codigo text not null, nombre text not null, activo boolean default true,
  unique (cd_id, codigo));
create table if not exists iam.teams (
  id uuid primary key default gen_random_uuid(),
  codigo text unique not null, nombre text not null,
  departamento_id uuid references iam.departamentos(id), activo boolean default true);
create table if not exists iam.team_members (
  team_id uuid references iam.teams(id) on delete cascade,
  user_id uuid, primary key (team_id, user_id));

insert into iam.empresas (codigo, nombre) values ('PTM','PTM Health Care')
on conflict (codigo) do nothing;

-- ── Usuarios (perfil 1:1 con auth.users) ────────────────────────────────────
create table if not exists iam.users (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre text not null, apellido text, correo text not null,
  avatar_url text, telefono text, cargo text,
  empresa_id uuid references iam.empresas(id),
  sucursal_id uuid references iam.sucursales(id),
  cd_id uuid references iam.centros_distribucion(id),
  activo boolean not null default true, mfa_enabled boolean not null default false,
  idioma text not null default 'es', zona_horaria text not null default 'America/Santiago',
  preferencias jsonb not null default '{}'::jsonb, ultimo_acceso timestamptz,
  created_at timestamptz default now(), updated_at timestamptz default now());
create index if not exists iam_users_org_idx on iam.users (empresa_id, sucursal_id, cd_id);
create index if not exists iam_users_correo_idx on iam.users (lower(correo));

-- ── RBAC ────────────────────────────────────────────────────────────────────
create table if not exists iam.roles (
  id uuid primary key default gen_random_uuid(),
  codigo text unique not null, nombre text not null, descripcion text,
  es_sistema boolean not null default false, activo boolean not null default true,
  created_at timestamptz default now(), updated_at timestamptz default now(), updated_by uuid);
create table if not exists iam.permissions (
  id uuid primary key default gen_random_uuid(),
  codigo text unique not null, recurso text not null, accion text not null,
  descripcion text, grupo text, es_sistema boolean not null default false,
  created_at timestamptz default now());
create table if not exists iam.role_permissions (
  role_id uuid references iam.roles(id) on delete cascade,
  permission_id uuid references iam.permissions(id) on delete cascade,
  primary key (role_id, permission_id));
create index if not exists iam_rp_perm_idx on iam.role_permissions (permission_id);

-- Asignaciones (principal user/team/dept/group → rol con scope)
create table if not exists iam.assignments (
  id uuid primary key default gen_random_uuid(),
  principal_type iam.principal_type not null,
  principal_id uuid not null,
  role_id uuid not null references iam.roles(id) on delete cascade,
  scope_type iam.scope_type not null default 'global', scope_id uuid,
  granted_by uuid, granted_at timestamptz default now(), expires_at timestamptz,
  unique (principal_type, principal_id, role_id, scope_type, scope_id),
  check (scope_type='global' or scope_id is not null));
create index if not exists iam_assign_principal_idx on iam.assignments (principal_type, principal_id);

-- ── MIGRACIÓN de datos (copia desde tms_*, idempotente) ─────────────────────
-- Usuarios: solo los que tienen auth_uid válido en auth.users.
insert into iam.users (id, nombre, correo, activo, ultimo_acceso, empresa_id)
select tu.auth_uid, coalesce(tu.nombre,'(sin nombre)'), coalesce(tu.email,''),
       coalesce(tu.activo,true), tu.last_seen, (select id from iam.empresas where codigo='PTM')
from public.tms_usuarios tu
where tu.auth_uid is not null and exists (select 1 from auth.users au where au.id = tu.auth_uid)
on conflict (id) do nothing;

-- Roles (codigo = id textual actual).
insert into iam.roles (codigo, nombre, descripcion, es_sistema)
select tr.id, coalesce(tr.nombre, tr.id), tr.descripcion,
       (tr.id in ('admin','administrador'))
from public.tms_roles tr
on conflict (codigo) do nothing;

-- Permisos (codigo = id; recurso/accion parseados del id 'accion_recurso').
insert into iam.permissions (codigo, recurso, accion, descripcion, grupo)
select tp.id,
       coalesce(nullif(substring(tp.id from position('_' in tp.id)+1),''), tp.id) as recurso,
       coalesce(nullif(split_part(tp.id,'_',1),''), tp.id) as accion,
       tp.nombre, tp.modulo
from public.tms_permisos tp
on conflict (codigo) do nothing;

-- Matriz rol↔permiso.
insert into iam.role_permissions (role_id, permission_id)
select r.id, p.id
from public.tms_roles_permisos trp
join iam.roles r on r.codigo = trp.rol_id
join iam.permissions p on p.codigo = trp.permiso_id
on conflict do nothing;

-- Asignación usuario→rol (scope global), desde tms_usuarios.rol.
insert into iam.assignments (principal_type, principal_id, role_id, scope_type)
select 'user', u.id, r.id, 'global'
from public.tms_usuarios tu
join iam.users u on u.id = tu.auth_uid
join iam.roles r on r.codigo = tu.rol
where tu.auth_uid is not null
on conflict do nothing;

-- ── Vista de permisos efectivos (Fase 0: principal=user; se ampliará) ───────
create or replace view iam.user_effective_permissions as
select a.principal_id as user_id, p.codigo as permission, a.scope_type, a.scope_id
from iam.assignments a
join iam.role_permissions rp on rp.role_id = a.role_id
join iam.permissions p on p.id = rp.permission_id
join iam.roles r on r.id = a.role_id and r.activo
where a.principal_type = 'user'
  and (a.expires_at is null or a.expires_at > now());

-- ── Authz service (aún NO se enchufa a RLS; parte I §9) ─────────────────────
create or replace function authz.uid() returns uuid language sql stable as $$ select auth.uid() $$;

create or replace function authz.has_permission(
  p_code text, p_scope_type iam.scope_type default null, p_scope_id uuid default null
) returns boolean language sql stable security definer set search_path = iam, authz, public as $$
  select coalesce(private.is_admin(), false)                 -- admin conserva acceso total
      or exists (
        select 1 from iam.user_effective_permissions e
        where e.user_id = auth.uid() and e.permission = p_code
          and ( e.scope_type = 'global' or p_scope_type is null
             or (e.scope_type = p_scope_type and e.scope_id is not distinct from p_scope_id) )
      );
$$;
revoke all on function authz.has_permission(text, iam.scope_type, uuid) from public, anon;
grant execute on function authz.has_permission(text, iam.scope_type, uuid) to authenticated;
grant usage on schema iam, authz to authenticated;
grant select on iam.user_effective_permissions to authenticated;
