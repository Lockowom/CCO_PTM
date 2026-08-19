-- 175_iam_overrides_and_permission_version.sql
-- ============================================================================
--  PR-IAM-R07 · DIRECT OVERRIDES — adapter de overrides individuales (IAM 2.0)
--
--  SPEC: CCO_2_0_IAM_RECONSTRUCCION_ESTRUCTURAL_CONTROLADA_V1 (§12, §76, §120-121)
--  * Overrides por usuario sobre SUPERFICIES (screen | function) con
--    INHERIT | ALLOW | DENY. No se tocan roles (no reset roles).
--  * Auditar el schema IAM ANTES de forzar tablas: el motor efectivo ya existe
--    (vistas iam.user_base_roles / user_effective_roles / user_effective_permissions,
--    teams/groups/delegations). Solo falta overrides y permission_version.
--  * permission_version (§76): contador de permisos del usuario; se incrementa
--    al cambiar override (profile/team/scope/delegation llegan en sus etapas).
--
--  ADITIVA: create if not exists / add column if not exists. No drop, no rename
--  destructivo (§121). El ROLLBACK no es necesario: no toca datos existentes.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1) Tabla de overrides (aditiva)
-- ---------------------------------------------------------------------------
create table if not exists iam.user_overrides (
  id            bigint generated always as identity primary key,
  principal_id  uuid        not null references iam.users(id) on delete cascade,
  surface_type  text        not null check (surface_type in ('screen', 'function')),
  surface_id    text        not null,
  access        text        not null check (access in ('ALLOW', 'DENY', 'INHERIT')),
  reason        text,
  created_by    uuid        references iam.users(id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (principal_id, surface_type, surface_id)
);

-- ---------------------------------------------------------------------------
-- 2) permission_version en iam.users (§76) — aditivo
-- ---------------------------------------------------------------------------
alter table iam.users add column if not exists permission_version bigint not null default 1;

-- ---------------------------------------------------------------------------
-- 3) RPC: mis overrides (lectura para el resolver shadow; solo los propios)
-- ---------------------------------------------------------------------------
create or replace function public.iam_mis_overrides()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    return '[]'::jsonb;
  end if;
  return coalesce(
    (select jsonb_agg(
       jsonb_build_object(
         'surface_type', o.surface_type,
         'surface_id',   o.surface_id,
         'access',       o.access,
         'reason',       o.reason
       ) order by o.surface_type, o.surface_id
     )
     from iam.user_overrides o
     where o.principal_id = v_uid),
    '[]'::jsonb);
end;
$$;

-- ---------------------------------------------------------------------------
-- 4) RPCs de escritura (admin ∨ manage_users). Mismo patrón de gate que las
--    RPC iam_* existentes: definer + search_path público + verificación server-side.
-- ---------------------------------------------------------------------------
create or replace function public.iam_overrides_upsert(
  p_uid           uuid,
  p_surface_type  text,
  p_surface_id    text,
  p_access        text,
  p_reason        text default null
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
  if p_surface_type not in ('screen', 'function')
     or p_access not in ('ALLOW', 'DENY', 'INHERIT') then
    raise exception 'Valor de override inválido';
  end if;

  insert into iam.user_overrides (principal_id, surface_type, surface_id, access, reason, created_by)
  values (p_uid, p_surface_type, p_surface_id, p_access, p_reason, v_uid)
  on conflict (principal_id, surface_type, surface_id)
  do update set
    access     = excluded.access,
    reason     = excluded.reason,
    updated_at = now();

  update iam.users set permission_version = permission_version + 1 where id = p_uid;

  return jsonb_build_object('ok', true);
end;
$$;

create or replace function public.iam_overrides_delete(
  p_uid           uuid,
  p_surface_type  text,
  p_surface_id    text
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

  delete from iam.user_overrides
  where principal_id = p_uid
    and surface_type = p_surface_type
    and surface_id   = p_surface_id;

  update iam.users set permission_version = permission_version + 1 where id = p_uid;

  return jsonb_build_object('ok', true);
end;
$$;

-- ---------------------------------------------------------------------------
-- 5) Grants: solo authenticated (nunca anon/public). Mis overrides para todos
--    los autenticados (el resolver shadow los lee del propio usuario); las
--    escrituras van gateadas por la RPC (admin ∨ manage_users).
-- ---------------------------------------------------------------------------
revoke all on function public.iam_mis_overrides() from public, anon;
grant execute on function public.iam_mis_overrides() to authenticated;

revoke all on function public.iam_overrides_upsert(uuid, text, text, text, text) from public, anon;
grant execute on function public.iam_overrides_upsert(uuid, text, text, text, text) to authenticated;

revoke all on function public.iam_overrides_delete(uuid, text, text) from public, anon;
grant execute on function public.iam_overrides_delete(uuid, text, text) to authenticated;