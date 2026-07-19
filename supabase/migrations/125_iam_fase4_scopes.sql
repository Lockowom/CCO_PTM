-- ============================================================================
--  125_iam_fase4_scopes.sql — Identity & Security · FASE 4 (Scopes / ABAC)
--  El "sobre qué datos". La realidad operativa de PTM: el único eje de ámbito
--  multivaluado real es `centro_costo` (tms_operaciones, 9 valores); `bodega`
--  está consolidada. Por eso el scope se modela sobre `centro_costo` (enum
--  `centro_costo` agregado en mig 124), SIN inventar jerarquía de sucursales.
--
--  Aporta la INFRAESTRUCTURA de decisión de ámbito (aditiva, sin RLS sobre
--  tablas de dominio → sin riesgo de bloqueo):
--    - `iam.assignments.scope_code` (ámbito por CÓDIGO de texto: centro_costo/bodega),
--      además del `scope_id` uuid para entidades org.
--    - vista `user_effective_permissions` expone `scope_code`.
--    - `authz.can_on_scope(code, scope_type, scope_code)` → ¿puede el usuario sobre
--      ESE dato? (grant global ⇒ todo; grant con ámbito ⇒ debe calzar).
--    - `authz.scopes_for(code, scope_type)` → {all, codes[]} para filtrar en dominio.
--    - RPCs de administración de asignaciones con ámbito + catálogos.
--
--  El gate central `usuario_tiene_algun_permiso` sigue siendo ciego al ámbito a
--  propósito: un permiso con ámbito hace VISIBLE el módulo (puedes operar tu
--  centro de costo); el filtrado de DATOS se hace donde se adopte `can_on_scope`/
--  `scopes_for` (opt-in por módulo). NO destructivo.
-- ============================================================================

-- ── assignments.scope_code + constraint que admite ámbito por código ────────
alter table iam.assignments add column if not exists scope_code text;

do $$
declare c text;
begin
  for c in
    select conname from pg_constraint
    where conrelid = 'iam.assignments'::regclass and contype = 'c'
  loop
    execute format('alter table iam.assignments drop constraint %I', c);
  end loop;
end $$;

alter table iam.assignments
  add constraint assignments_scope_chk
  check (scope_type = 'global' or scope_id is not null or scope_code is not null);

-- Unicidad real incluyendo scope_code (los NULL de scope_id no deduplican solos).
create unique index if not exists iam_assign_scoped_uidx
  on iam.assignments (principal_type, principal_id, role_id, scope_type, coalesce(scope_id::text, scope_code, ''));

-- ── Vista de permisos efectivos: + scope_code ──────────────────────────────
create or replace view iam.user_effective_permissions as
select a.principal_id as user_id, p.codigo as permission,
       a.scope_type, a.scope_id, a.scope_code
from iam.assignments a
join iam.role_permissions rp on rp.role_id = a.role_id
join iam.permissions p on p.id = rp.permission_id
join iam.roles r on r.id = a.role_id and r.activo
where a.principal_type = 'user'
  and (a.expires_at is null or a.expires_at > now());
grant select on iam.user_effective_permissions to authenticated;

-- ── Decisión por dato: ¿puede el usuario sobre este ámbito concreto? ────────
create or replace function authz.can_on_scope(
  p_code text, p_scope_type text, p_scope_code text
) returns boolean
language sql stable security definer set search_path = iam, authz, public as $$
  select coalesce(private.is_admin(), false)
      or exists (
        select 1 from iam.user_effective_permissions e
        where e.user_id = auth.uid() and e.permission = p_code
          and ( e.scope_type = 'global'
             or ( e.scope_type = p_scope_type::iam.scope_type
                  and e.scope_code is not distinct from p_scope_code ) )
      );
$$;
revoke all on function authz.can_on_scope(text, text, text) from public, anon;
grant execute on function authz.can_on_scope(text, text, text) to authenticated;

-- ── Ámbitos permitidos para un permiso: {all, codes[]} ─────────────────────
create or replace function authz.scopes_for(
  p_code text, p_scope_type text
) returns jsonb
language sql stable security definer set search_path = iam, authz, public as $$
  select jsonb_build_object(
    'all',
      coalesce(private.is_admin(), false)
      or exists (
        select 1 from iam.user_effective_permissions e
        where e.user_id = auth.uid() and e.permission = p_code and e.scope_type = 'global'
      ),
    'codes',
      coalesce((
        select jsonb_agg(distinct e.scope_code)
        from iam.user_effective_permissions e
        where e.user_id = auth.uid() and e.permission = p_code
          and e.scope_type = p_scope_type::iam.scope_type and e.scope_code is not null
      ), '[]'::jsonb)
  );
$$;
revoke all on function authz.scopes_for(text, text) from public, anon;
grant execute on function authz.scopes_for(text, text) to authenticated;

-- Hook para el cliente (envuelve scopes_for; permiso+eje libres).
create or replace function public.iam_mis_scopes(p_code text, p_scope_type text default 'centro_costo')
returns jsonb language sql stable security definer set search_path = public, iam, authz as $$
  select authz.scopes_for(p_code, p_scope_type);
$$;
revoke all on function public.iam_mis_scopes(text, text) from public, anon;
grant execute on function public.iam_mis_scopes(text, text) to authenticated;

-- ── Gate de administración de ámbitos (admin ∨ manage_roles) ────────────────
create or replace function authz._puede_admin_scopes()
returns boolean language sql stable security definer set search_path = public, authz as $$
  select coalesce(private.is_admin(), false)
      or coalesce(public.usuario_tiene_algun_permiso(array['manage_roles']), false);
$$;

-- ── Catálogos para la UI de ámbitos ─────────────────────────────────────────
create or replace function public.iam_catalogo_scope()
returns jsonb language plpgsql stable security definer set search_path = public, iam, authz as $$
begin
  if not authz._puede_admin_scopes() then raise exception 'No autorizado'; end if;
  return jsonb_build_object(
    'usuarios', coalesce((
      select jsonb_agg(jsonb_build_object('id', u.id, 'nombre', u.nombre, 'correo', u.correo) order by u.nombre)
      from iam.users u where u.activo), '[]'::jsonb),
    'roles', coalesce((
      select jsonb_agg(jsonb_build_object('codigo', r.codigo, 'nombre', r.nombre) order by r.codigo)
      from iam.roles r where r.activo), '[]'::jsonb),
    'centros_costo', coalesce((
      select jsonb_agg(distinct cc order by cc)
      from (select nullif(trim(centro_costo),'') as cc from public.tms_operaciones) s
      where s.cc is not null), '[]'::jsonb)
  );
end $$;
revoke all on function public.iam_catalogo_scope() from public, anon;
grant execute on function public.iam_catalogo_scope() to authenticated;

-- ── Listar asignaciones CON ÁMBITO (las globales las gestiona Usuarios) ─────
create or replace function public.iam_asignaciones(p_user uuid default null)
returns jsonb language plpgsql stable security definer set search_path = public, iam, authz as $$
begin
  if not authz._puede_admin_scopes() then raise exception 'No autorizado'; end if;
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'id', a.id, 'user_id', a.principal_id,
      'usuario', u.nombre, 'correo', u.correo,
      'role', r.codigo, 'role_nombre', r.nombre,
      'scope_type', a.scope_type, 'scope_code', a.scope_code,
      'granted_at', a.granted_at, 'expires_at', a.expires_at
    ) order by u.nombre, r.codigo, a.scope_code)
    from iam.assignments a
    join iam.roles r on r.id = a.role_id
    left join iam.users u on u.id = a.principal_id
    where a.principal_type = 'user' and a.scope_type <> 'global'
      and (p_user is null or a.principal_id = p_user)
  ), '[]'::jsonb);
end $$;
revoke all on function public.iam_asignaciones(uuid) from public, anon;
grant execute on function public.iam_asignaciones(uuid) to authenticated;

-- ── Asignar rol con ámbito (upsert por usuario+rol+eje+código) ──────────────
create or replace function public.iam_asignar_scope(
  p_user uuid, p_role text, p_scope_type text, p_scope_code text, p_expires timestamptz default null
) returns jsonb language plpgsql security definer set search_path = public, iam, authz as $$
declare v_role uuid; v_id uuid;
begin
  if not authz._puede_admin_scopes() then raise exception 'No autorizado'; end if;
  if p_scope_type = 'global' then raise exception 'Usa el rol del usuario para ámbito global'; end if;
  if nullif(trim(coalesce(p_scope_code,'')),'') is null then raise exception 'El código de ámbito es obligatorio'; end if;
  select id into v_role from iam.roles where codigo = p_role and activo;
  if v_role is null then raise exception 'Rol inexistente: %', p_role; end if;
  if not exists (select 1 from iam.users where id = p_user) then raise exception 'Usuario inexistente'; end if;

  select a.id into v_id from iam.assignments a
   where a.principal_type='user' and a.principal_id=p_user and a.role_id=v_role
     and a.scope_type=p_scope_type::iam.scope_type and a.scope_code is not distinct from p_scope_code;
  if v_id is not null then
    update iam.assignments set expires_at = p_expires, granted_by = auth.uid(), granted_at = now() where id = v_id;
    return jsonb_build_object('ok', true, 'id', v_id, 'accion', 'actualizado');
  end if;

  insert into iam.assignments (principal_type, principal_id, role_id, scope_type, scope_code, granted_by, expires_at)
  values ('user', p_user, v_role, p_scope_type::iam.scope_type, p_scope_code, auth.uid(), p_expires)
  returning id into v_id;
  return jsonb_build_object('ok', true, 'id', v_id, 'accion', 'creado');
end $$;
revoke all on function public.iam_asignar_scope(uuid, text, text, text, timestamptz) from public, anon;
grant execute on function public.iam_asignar_scope(uuid, text, text, text, timestamptz) to authenticated;

-- ── Revocar asignación con ámbito (nunca la global mirroreada) ──────────────
create or replace function public.iam_revocar_asignacion(p_id uuid)
returns jsonb language plpgsql security definer set search_path = public, iam, authz as $$
begin
  if not authz._puede_admin_scopes() then raise exception 'No autorizado'; end if;
  delete from iam.assignments where id = p_id and scope_type <> 'global';
  return jsonb_build_object('ok', true, 'id', p_id);
end $$;
revoke all on function public.iam_revocar_asignacion(uuid) from public, anon;
grant execute on function public.iam_revocar_asignacion(uuid) to authenticated;
