-- IAM 2.0 runtime enforcement: activación gradual, observable y reversible.
-- Todos los usuarios comienzan en SHADOW: esta migración no cambia accesos.

alter table iam.users
  add column if not exists enforcement_mode text not null default 'SHADOW',
  add column if not exists enforcement_changed_at timestamptz,
  add column if not exists enforcement_changed_by uuid references iam.users(id) on delete set null,
  add column if not exists enforcement_reason text;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'iam_users_enforcement_mode_check'
      and conrelid = 'iam.users'::regclass
  ) then
    alter table iam.users
      add constraint iam_users_enforcement_mode_check
      check (enforcement_mode in ('SHADOW', 'ENFORCE'));
  end if;
end $$;

create table if not exists iam.access_change_log (
  id bigint generated always as identity primary key,
  principal_id uuid not null references iam.users(id) on delete cascade,
  action text not null check (action in ('MODE_CHANGED', 'OVERRIDE_UPSERTED', 'OVERRIDE_DELETED')),
  surface_type text,
  surface_id text,
  previous_value text,
  new_value text,
  reason text,
  actor_id uuid references iam.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists iam_access_change_log_principal_created_idx
  on iam.access_change_log (principal_id, created_at desc);

alter table iam.access_change_log enable row level security;
revoke all on table iam.access_change_log from public, anon, authenticated;

-- Contexto mínimo del usuario autenticado. SECURITY DEFINER es necesario para
-- leer tablas privadas IAM; se restringe a su propio auth.uid(), usa referencias
-- calificadas y no concede acceso directo a las tablas.
create or replace function public.iam_runtime_context()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((
    select jsonb_build_object(
      'mode', u.enforcement_mode,
      'permission_version', u.permission_version,
      'changed_at', u.enforcement_changed_at,
      'changed_reason', u.enforcement_reason,
      'overrides', coalesce((
        select jsonb_agg(jsonb_build_object(
          'surface_type', o.surface_type,
          'surface_id', o.surface_id,
          'access', o.access,
          'reason', o.reason,
          'updated_at', o.updated_at
        ) order by o.surface_type, o.surface_id)
        from iam.user_overrides o
        where o.principal_id = u.id
      ), '[]'::jsonb)
    )
    from iam.users u
    where u.id = (select auth.uid()) and u.activo
  ), jsonb_build_object(
    'mode', 'SHADOW',
    'permission_version', 1,
    'overrides', '[]'::jsonb
  ));
$$;

create or replace function public.iam_enforcement_list()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
begin
  if v_uid is null or not (
    private.is_admin()
    or exists (
      select 1 from iam.user_effective_permissions p
      where p.user_id = v_uid and p.permission = 'manage_users'
    )
  ) then
    raise exception 'No autorizado' using errcode = '42501';
  end if;

  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'user_id', u.id,
      'mode', u.enforcement_mode,
      'permission_version', u.permission_version,
      'changed_at', u.enforcement_changed_at,
      'changed_reason', u.enforcement_reason
    ) order by u.nombre)
    from iam.users u
    where u.activo
  ), '[]'::jsonb);
end;
$$;

create or replace function public.iam_set_enforcement_mode(
  p_uid uuid,
  p_mode text,
  p_reason text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := (select auth.uid());
  v_previous text;
  v_reason text := nullif(btrim(coalesce(p_reason, '')), '');
begin
  if v_actor is null or not (
    private.is_admin()
    or exists (
      select 1 from iam.user_effective_permissions p
      where p.user_id = v_actor and p.permission = 'manage_users'
    )
  ) then
    raise exception 'No autorizado' using errcode = '42501';
  end if;
  if p_mode not in ('SHADOW', 'ENFORCE') then
    raise exception 'Modo IAM inválido' using errcode = '22023';
  end if;
  if v_reason is null or char_length(v_reason) < 8 then
    raise exception 'Debes registrar un motivo de al menos 8 caracteres' using errcode = '22023';
  end if;

  select enforcement_mode into v_previous
  from iam.users where id = p_uid and activo for update;
  if not found then
    raise exception 'Usuario IAM inexistente o inactivo' using errcode = 'P0002';
  end if;

  update iam.users
  set enforcement_mode = p_mode,
      enforcement_changed_at = now(),
      enforcement_changed_by = v_actor,
      enforcement_reason = v_reason,
      permission_version = permission_version + 1,
      updated_at = now()
  where id = p_uid;

  insert into iam.access_change_log (
    principal_id, action, previous_value, new_value, reason, actor_id
  ) values (p_uid, 'MODE_CHANGED', v_previous, p_mode, v_reason, v_actor);

  return jsonb_build_object('ok', true, 'mode', p_mode);
end;
$$;

create or replace function public.iam_access_change_history(
  p_uid uuid,
  p_limit integer default 50
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_actor uuid := (select auth.uid());
begin
  if v_actor is null or not (
    private.is_admin()
    or exists (
      select 1 from iam.user_effective_permissions p
      where p.user_id = v_actor and p.permission = 'manage_users'
    )
  ) then
    raise exception 'No autorizado' using errcode = '42501';
  end if;

  return coalesce((
    select jsonb_agg(to_jsonb(x) order by x.created_at desc)
    from (
      select l.action, l.surface_type, l.surface_id, l.previous_value,
             l.new_value, l.reason, l.actor_id, l.created_at
      from iam.access_change_log l
      where l.principal_id = p_uid
      order by l.created_at desc
      limit least(greatest(coalesce(p_limit, 50), 1), 200)
    ) x
  ), '[]'::jsonb);
end;
$$;

-- Aplicador interno para acciones de backend. Recibe el resultado del gate
-- legado calculado por el helper dueño de la acción y superpone el override
-- solo cuando el usuario está en ENFORCE. No se expone a Data API.
create or replace function authz.apply_surface_override(
  p_surface_type text,
  p_surface_id text,
  p_legacy_allowed boolean
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select case
    when coalesce((select auth.jwt() ->> 'role'), '') = 'service_role' then true
    when (select auth.uid()) is null then false
    when coalesce((
      select u.enforcement_mode from iam.users u where u.id = (select auth.uid())
    ), 'SHADOW') <> 'ENFORCE' then coalesce(p_legacy_allowed, false)
    when exists (
      select 1 from iam.user_overrides o
      where o.principal_id = (select auth.uid())
        and o.surface_type = p_surface_type
        and o.surface_id = p_surface_id
        and o.access = 'DENY'
    ) then false
    when exists (
      select 1 from iam.user_overrides o
      where o.principal_id = (select auth.uid())
        and o.surface_type = p_surface_type
        and o.surface_id = p_surface_id
        and o.access = 'ALLOW'
    ) then true
    else coalesce(p_legacy_allowed, false)
  end;
$$;

-- Cutover de los helpers críticos del Panel. Las firmas no cambian, por lo que
-- guardar_nv/cambiar_estado_nv/eliminar_nv/reaperturas siguen siendo compatibles.
create or replace function public._panel_puede_escribir()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select authz.apply_surface_override(
    'function',
    'panel.nv.entry.edit',
    coalesce(private.is_admin(), false)
      or coalesce(public.usuario_tiene_algun_permiso(array['manage_panel']), false)
      or coalesce((select auth.jwt() ->> 'role'), '') = 'service_role'
  );
$$;

create or replace function public._panel_puede_eliminar_nv()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select authz.apply_surface_override(
    'function',
    'panel.nv.entry.delete',
    coalesce(private.is_admin(), false)
      or exists (
        select 1 from public.tms_usuarios u
        where u.auth_uid = (select auth.uid())
          and u.activo
          and lower(u.email) = any (array['angelica@ptm.cl'])
      )
      or coalesce((select auth.jwt() ->> 'role'), '') = 'service_role'
  );
$$;

create or replace function public._panel_puede_aprobar_reapertura_nv()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select authz.apply_surface_override(
    'function',
    'panel.nv.reopen.approve',
    coalesce(private.is_admin(), false)
      or coalesce(public.usuario_tiene_algun_permiso(
        array['approve_panel_reopen_nv', 'manage_roles']
      ), false)
      or coalesce((select auth.jwt() ->> 'role'), '') = 'service_role'
  );
$$;

-- Añade auditoría a los RPCs ya existentes sin cambiar su contrato público.
create or replace function public.iam_overrides_upsert(
  p_uid uuid,
  p_surface_type text,
  p_surface_id text,
  p_access text,
  p_reason text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := (select auth.uid());
  v_previous text;
begin
  if v_actor is null or not (
    private.is_admin()
    or exists (
      select 1 from iam.user_effective_permissions p
      where p.user_id = v_actor and p.permission = 'manage_users'
    )
  ) then
    raise exception 'No autorizado' using errcode = '42501';
  end if;
  if p_surface_type not in ('screen', 'function')
     or p_access not in ('ALLOW', 'DENY', 'INHERIT')
     or nullif(btrim(coalesce(p_surface_id, '')), '') is null then
    raise exception 'Override IAM inválido' using errcode = '22023';
  end if;

  select access into v_previous from iam.user_overrides
  where principal_id = p_uid and surface_type = p_surface_type and surface_id = p_surface_id;

  insert into iam.user_overrides (
    principal_id, surface_type, surface_id, access, reason, created_by
  ) values (p_uid, p_surface_type, p_surface_id, p_access, nullif(btrim(p_reason), ''), v_actor)
  on conflict (principal_id, surface_type, surface_id) do update
  set access = excluded.access,
      reason = excluded.reason,
      created_by = excluded.created_by,
      updated_at = now();

  update iam.users set permission_version = permission_version + 1, updated_at = now()
  where id = p_uid;
  insert into iam.access_change_log (
    principal_id, action, surface_type, surface_id,
    previous_value, new_value, reason, actor_id
  ) values (
    p_uid, 'OVERRIDE_UPSERTED', p_surface_type, p_surface_id,
    v_previous, p_access, nullif(btrim(p_reason), ''), v_actor
  );
  return jsonb_build_object('ok', true);
end;
$$;

create or replace function public.iam_overrides_delete(
  p_uid uuid,
  p_surface_type text,
  p_surface_id text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := (select auth.uid());
  v_previous text;
begin
  if v_actor is null or not (
    private.is_admin()
    or exists (
      select 1 from iam.user_effective_permissions p
      where p.user_id = v_actor and p.permission = 'manage_users'
    )
  ) then
    raise exception 'No autorizado' using errcode = '42501';
  end if;

  delete from iam.user_overrides
  where principal_id = p_uid and surface_type = p_surface_type and surface_id = p_surface_id
  returning access into v_previous;

  if found then
    update iam.users set permission_version = permission_version + 1, updated_at = now()
    where id = p_uid;
    insert into iam.access_change_log (
      principal_id, action, surface_type, surface_id,
      previous_value, new_value, actor_id
    ) values (
      p_uid, 'OVERRIDE_DELETED', p_surface_type, p_surface_id,
      v_previous, 'INHERIT', v_actor
    );
  end if;
  return jsonb_build_object('ok', true);
end;
$$;

revoke all on function public.iam_runtime_context() from public, anon;
revoke all on function public.iam_enforcement_list() from public, anon;
revoke all on function public.iam_set_enforcement_mode(uuid, text, text) from public, anon;
revoke all on function public.iam_access_change_history(uuid, integer) from public, anon;
revoke all on function public.iam_overrides_upsert(uuid, text, text, text, text) from public, anon;
revoke all on function public.iam_overrides_delete(uuid, text, text) from public, anon;
revoke all on function authz.apply_surface_override(text, text, boolean) from public, anon, authenticated;
revoke all on function public._panel_puede_escribir() from public, anon;
revoke all on function public._panel_puede_eliminar_nv() from public, anon;
revoke all on function public._panel_puede_aprobar_reapertura_nv() from public, anon;

grant execute on function public.iam_runtime_context() to authenticated;
grant execute on function public.iam_enforcement_list() to authenticated;
grant execute on function public.iam_set_enforcement_mode(uuid, text, text) to authenticated;
grant execute on function public.iam_access_change_history(uuid, integer) to authenticated;
grant execute on function public.iam_overrides_upsert(uuid, text, text, text, text) to authenticated;
grant execute on function public.iam_overrides_delete(uuid, text, text) to authenticated;
grant execute on function public._panel_puede_escribir() to authenticated;
grant execute on function public._panel_puede_eliminar_nv() to authenticated;
grant execute on function public._panel_puede_aprobar_reapertura_nv() to authenticated;
