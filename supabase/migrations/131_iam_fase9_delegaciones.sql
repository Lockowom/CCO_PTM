-- ============================================================================
--  131_iam_fase9_delegaciones.sql — Identity & Security · FASE 9 (Delegación)
--  Sustituciones / cobertura por vacaciones: un DELEGADOR presta sus permisos a
--  un DELEGADO durante una ventana [desde, hasta]. Se implementa como una RAMA en
--  `iam.user_effective_permissions` (la vista que leen el gate, iam_me, scopes y
--  ABAC) → la cobertura entra y CADUCA sola, sin tocar nada más. NO destructivo.
-- ============================================================================

create table if not exists iam.delegations (
  id uuid primary key default gen_random_uuid(),
  delegador uuid not null,                 -- auth uid cuyos permisos se prestan
  delegado  uuid not null,                 -- auth uid que cubre
  role_id   uuid references iam.roles(id), -- null = TODOS los roles del delegador
  desde timestamptz not null default now(),
  hasta timestamptz not null,
  motivo text,
  activo boolean not null default true,
  created_by uuid, created_at timestamptz default now(),
  revoked_at timestamptz, revoked_by uuid,
  constraint delegations_distintos_chk check (delegado <> delegador),
  constraint delegations_ventana_chk  check (hasta > desde)
);
create index if not exists iam_deleg_delegado_idx  on iam.delegations (delegado)  where activo;
create index if not exists iam_deleg_delegador_idx on iam.delegations (delegador) where activo;

-- ── Vista efectiva: base RBAC/scope + rama de DELEGACIÓN activa ──────────────
create or replace view iam.user_effective_permissions as
-- base: asignaciones propias
select a.principal_id as user_id, p.codigo as permission,
       a.scope_type, a.scope_id, a.scope_code
from iam.assignments a
join iam.role_permissions rp on rp.role_id = a.role_id
join iam.permissions p on p.id = rp.permission_id
join iam.roles r on r.id = a.role_id and r.activo
where a.principal_type = 'user'
  and (a.expires_at is null or a.expires_at > now())
union
-- delegación: el delegado hereda los permisos del delegador durante la ventana
select d.delegado as user_id, p.codigo as permission,
       a.scope_type, a.scope_id, a.scope_code
from iam.delegations d
join iam.assignments a on a.principal_type = 'user' and a.principal_id = d.delegador
     and (d.role_id is null or a.role_id = d.role_id)
join iam.role_permissions rp on rp.role_id = a.role_id
join iam.permissions p on p.id = rp.permission_id
join iam.roles r on r.id = a.role_id and r.activo
where d.activo and now() between d.desde and d.hasta
  and (a.expires_at is null or a.expires_at > now());
grant select on iam.user_effective_permissions to authenticated;
grant select on iam.user_effective_permissions to supabase_auth_admin;

-- ── MV = snapshot de la vista (ahora incluye delegación). Refresh NO concurrente
--    (evita el requisito de índice único con la rama union). Reporte, no gate. ──
drop materialized view if exists iam.mv_user_permissions;
create materialized view iam.mv_user_permissions as
select user_id, permission, scope_type, scope_id, scope_code
from iam.user_effective_permissions
with data;
create index mv_user_perms_lookup_idx on iam.mv_user_permissions (user_id, permission);

create or replace function authz.refresh_permissions()
returns void language plpgsql security definer set search_path = iam, authz, public as $$
begin
  refresh materialized view iam.mv_user_permissions;   -- no concurrente (rama union)
end $$;

-- ── Crear delegación (self-service o admin en nombre de otro) ───────────────
create or replace function public.iam_delegar(
  p_delegado uuid, p_hasta timestamptz, p_desde timestamptz default now(),
  p_role text default null, p_motivo text default null, p_delegador uuid default null
) returns jsonb language plpgsql security definer set search_path = public, iam, authz as $$
declare v_delegador uuid; v_role uuid; v_id uuid; v_rol text;
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
    if not exists (select 1 from iam.assignments a
                   where a.principal_type='user' and a.principal_id=v_delegador and a.role_id=v_role) then
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
end $$;
revoke all on function public.iam_delegar(uuid, timestamptz, timestamptz, text, text, uuid) from public, anon;
grant execute on function public.iam_delegar(uuid, timestamptz, timestamptz, text, text, uuid) to authenticated;

-- ── Revocar (el delegador o un admin) ───────────────────────────────────────
create or replace function public.iam_revocar_delegacion(p_id uuid)
returns jsonb language plpgsql security definer set search_path = public, iam, authz as $$
declare v_deleg iam.delegations; v_rol text;
begin
  select * into v_deleg from iam.delegations where id = p_id;
  if v_deleg.id is null then raise exception 'Delegación inexistente'; end if;
  if v_deleg.delegador <> auth.uid() and not authz._es_admin_app() then
    raise exception 'Solo el delegador o un administrador pueden revocar';
  end if;
  update iam.delegations set activo = false, revoked_at = now(), revoked_by = auth.uid() where id = p_id;
  select rol into v_rol from public.tms_usuarios where auth_uid = auth.uid() limit 1;
  insert into public.tms_auditoria (actor_auth_uid, actor_rol, tabla, accion, registro_id, datos_antes)
  values (auth.uid(), v_rol, 'iam.delegations', 'REVOKE', p_id::text, to_jsonb(v_deleg));
  return jsonb_build_object('ok', true, 'id', p_id);
end $$;
revoke all on function public.iam_revocar_delegacion(uuid) from public, anon;
grant execute on function public.iam_revocar_delegacion(uuid) to authenticated;

-- ── Listado (admin: todas; usuario: solo donde participa) ───────────────────
create or replace function public.iam_delegaciones(p_solo_activas boolean default false)
returns jsonb language plpgsql stable security definer set search_path = public, iam, authz as $$
declare v_admin boolean := authz._es_admin_app();
begin
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'id', d.id,
      'delegador', d.delegador, 'delegador_nombre', ud.nombre,
      'delegado', d.delegado, 'delegado_nombre', ur.nombre,
      'role', r.codigo, 'desde', d.desde, 'hasta', d.hasta, 'motivo', d.motivo,
      'activo', d.activo, 'vigente', (d.activo and now() between d.desde and d.hasta),
      'revoked_at', d.revoked_at
    ) order by d.activo desc, d.hasta desc)
    from iam.delegations d
    left join iam.users ud on ud.id = d.delegador
    left join iam.users ur on ur.id = d.delegado
    left join iam.roles r on r.id = d.role_id
    where (v_admin or d.delegador = auth.uid() or d.delegado = auth.uid())
      and (not p_solo_activas or (d.activo and now() between d.desde and d.hasta))
  ), '[]'::jsonb);
end $$;
revoke all on function public.iam_delegaciones(boolean) from public, anon;
grant execute on function public.iam_delegaciones(boolean) to authenticated;

-- ── Mis coberturas (banner): a quién cubro / quién me cubre ─────────────────
create or replace function public.iam_mis_coberturas()
returns jsonb language sql stable security definer set search_path = public, iam, authz as $$
  select jsonb_build_object(
    'cubro', coalesce((                       -- delegaciones donde YO soy el delegado
      select jsonb_agg(jsonb_build_object('id', d.id, 'delegador', ud.nombre, 'hasta', d.hasta, 'role', r.codigo))
      from iam.delegations d left join iam.users ud on ud.id=d.delegador left join iam.roles r on r.id=d.role_id
      where d.delegado = auth.uid() and d.activo and now() between d.desde and d.hasta), '[]'::jsonb),
    'delego', coalesce((                      -- delegaciones que YO otorgué
      select jsonb_agg(jsonb_build_object('id', d.id, 'delegado', ur.nombre, 'hasta', d.hasta, 'role', r.codigo))
      from iam.delegations d left join iam.users ur on ur.id=d.delegado left join iam.roles r on r.id=d.role_id
      where d.delegador = auth.uid() and d.activo and now() between d.desde and d.hasta), '[]'::jsonb)
  );
$$;
revoke all on function public.iam_mis_coberturas() from public, anon;
grant execute on function public.iam_mis_coberturas() to authenticated;
