-- ============================================================================
--  122_iam_fase1.sql — Identity & Security · FASE 1 (Authorization Service)
--  Convierte el IAM (esquemas iam/authz creados en Fase 0) en un ESPEJO VIVO
--  de la verdad operativa actual y enchufa el gate central a esa fuente única.
--
--  Contexto crítico (reconciliación):
--    El runtime de la app autoriza leyendo `tms_roles.permisos_json` (array jsonb,
--    operador ?|). La Fase 0 pobló `iam.role_permissions` desde la tabla puente
--    `tms_roles_permisos`, que resultó ESTAR DESACTUALIZADA (p.ej. ADMIN 12 vs 60
--    permisos, CONTROL_CALIDAD 0 vs 13). Migrar el gate a esa copia habría dejado
--    a casi todos los usuarios sin acceso. Por eso esta migración:
--      (A) RECONSTRUYE iam.role_permissions desde `permisos_json` (fuente canónica),
--      (B) instala TRIGGERS tms_* → iam.* para que el espejo se mantenga en vivo,
--      (C) reescribe SOLO el gate central `usuario_tiene_algun_permiso` para leer
--          del IAM **conservando la rama legada** `permisos_json` como red de
--          seguridad → comportamiento idéntico, cero bloqueos.
--      (D) agrega `iam_me()` (perfil + roles + permisos efectivos del usuario).
--
--  NO destructivo: no borra usuarios/roles/permisos; tms_* sigue siendo el maestro
--  en Fase 1 y el IAM lo refleja. Los asserts de dominio (_pv_assert, can_manage_*,
--  _conteo_es_super, puede_desplegar_ota, …) siguen leyendo `permisos_json` (que
--  permanece canónico y espejado); se migrarán en una fase posterior.
--  Ver docs/IAM_ARQUITECTURA.md.
-- ============================================================================

-- ── Helpers de sincronía (SECURITY DEFINER; idempotentes) ───────────────────

-- Perfil de usuario iam.users (upsert desde tms_usuarios por auth_uid).
create or replace function authz.sync_user_profile(p_auth uuid)
returns void language plpgsql security definer set search_path = iam, authz, public as $$
begin
  insert into iam.users (id, nombre, correo, activo, ultimo_acceso, empresa_id)
  select tu.auth_uid, coalesce(tu.nombre,'(sin nombre)'), coalesce(tu.email,''),
         coalesce(tu.activo,true), tu.last_seen,
         (select id from iam.empresas where codigo='PTM')
  from public.tms_usuarios tu
  where tu.auth_uid = p_auth
    and exists (select 1 from auth.users au where au.id = tu.auth_uid)
  on conflict (id) do update
    set nombre = excluded.nombre, correo = excluded.correo,
        activo = excluded.activo, ultimo_acceso = excluded.ultimo_acceso,
        updated_at = now();
end $$;

-- Permiso iam.permissions (upsert desde tms_permisos; codigo = id).
create or replace function authz.sync_permiso(p_id text)
returns void language sql security definer set search_path = iam, authz, public as $$
  insert into iam.permissions (codigo, recurso, accion, descripcion, grupo)
  select tp.id,
         coalesce(nullif(substring(tp.id from position('_' in tp.id)+1),''), tp.id),
         coalesce(nullif(split_part(tp.id,'_',1),''), tp.id),
         tp.nombre, tp.modulo
  from public.tms_permisos tp
  where tp.id = p_id
  on conflict (codigo) do update
    set descripcion = excluded.descripcion, grupo = excluded.grupo,
        recurso = excluded.recurso, accion = excluded.accion;
$$;

-- Rol + su matriz de permisos, reconstruida desde `permisos_json` (canónica).
create or replace function authz.rebuild_role(p_codigo text)
returns void language plpgsql security definer set search_path = iam, authz, public as $$
declare v_role uuid;
begin
  insert into iam.roles (codigo, nombre, descripcion, es_sistema)
  select tr.id, coalesce(tr.nombre, tr.id), tr.descripcion,
         (tr.id in ('ADMIN','admin','administrador'))
  from public.tms_roles tr
  where tr.id = p_codigo
  on conflict (codigo) do update
    set nombre = excluded.nombre, descripcion = excluded.descripcion, updated_at = now();

  select id into v_role from iam.roles where codigo = p_codigo;
  if v_role is null then return; end if;

  -- Espejo EXACTO de permisos_json → sin altas/bajas efectivas respecto al runtime.
  delete from iam.role_permissions where role_id = v_role;
  insert into iam.role_permissions (role_id, permission_id)
  select distinct v_role, p.id
  from public.tms_roles tr
  cross join lateral jsonb_array_elements_text(
       case when jsonb_typeof(tr.permisos_json) = 'array' then tr.permisos_json else '[]'::jsonb end
     ) as code
  join iam.permissions p on p.codigo = code
  where tr.id = p_codigo
  on conflict do nothing;
end $$;

-- ── Reconciliación inicial (espejo fiel de la verdad operativa actual) ──────
do $$
declare rec record;
begin
  for rec in select id from public.tms_permisos loop
    perform authz.sync_permiso(rec.id);
  end loop;
  for rec in select id from public.tms_roles loop
    perform authz.rebuild_role(rec.id);
  end loop;
  for rec in
    select distinct tu.auth_uid from public.tms_usuarios tu
    where tu.auth_uid is not null
      and exists (select 1 from auth.users au where au.id = tu.auth_uid)
  loop
    perform authz.sync_user_profile(rec.auth_uid);
  end loop;
end $$;

-- ── Triggers: mantener el espejo en vivo ────────────────────────────────────

-- tms_permisos → iam.permissions
create or replace function authz.tg_sync_permisos()
returns trigger language plpgsql security definer set search_path = iam, authz, public as $$
begin
  if (tg_op = 'DELETE') then
    delete from iam.permissions where codigo = old.id;   -- cascada limpia role_permissions
    return old;
  end if;
  perform authz.sync_permiso(new.id);
  return new;
end $$;
drop trigger if exists trg_iam_sync_permisos on public.tms_permisos;
create trigger trg_iam_sync_permisos
  after insert or update or delete on public.tms_permisos
  for each row execute function authz.tg_sync_permisos();

-- tms_roles → iam.roles (+ role_permissions desde permisos_json)
create or replace function authz.tg_sync_roles()
returns trigger language plpgsql security definer set search_path = iam, authz, public as $$
begin
  if (tg_op = 'DELETE') then
    update iam.roles set activo = false, updated_at = now() where codigo = old.id;
    return old;
  end if;
  perform authz.rebuild_role(new.id);
  return new;
end $$;
drop trigger if exists trg_iam_sync_roles on public.tms_roles;
create trigger trg_iam_sync_roles
  after insert or update or delete on public.tms_roles
  for each row execute function authz.tg_sync_roles();

-- tms_usuarios → iam.users (+ assignment global usuario→rol)
create or replace function authz.tg_sync_usuarios()
returns trigger language plpgsql security definer set search_path = iam, authz, public as $$
begin
  if (tg_op = 'DELETE') then
    if old.auth_uid is not null then
      update iam.users set activo = false, updated_at = now() where id = old.auth_uid;
      delete from iam.assignments
       where principal_type = 'user' and principal_id = old.auth_uid
         and scope_type = 'global'
         and role_id = (select id from iam.roles where codigo = old.rol);
    end if;
    return old;
  end if;

  if new.auth_uid is not null and exists (select 1 from auth.users where id = new.auth_uid) then
    perform authz.sync_user_profile(new.auth_uid);

    -- Cambio de auth_uid: retirar la asignación previa.
    if tg_op = 'UPDATE' and old.auth_uid is not null and old.auth_uid is distinct from new.auth_uid then
      delete from iam.assignments
       where principal_type = 'user' and principal_id = old.auth_uid
         and scope_type = 'global'
         and role_id = (select id from iam.roles where codigo = old.rol);
    end if;
    -- Cambio de rol: retirar solo la asignación del rol anterior (no toca scopes extra).
    if tg_op = 'UPDATE' and old.rol is distinct from new.rol then
      delete from iam.assignments
       where principal_type = 'user' and principal_id = new.auth_uid
         and scope_type = 'global'
         and role_id = (select id from iam.roles where codigo = old.rol);
    end if;

    insert into iam.assignments (principal_type, principal_id, role_id, scope_type)
    select 'user', new.auth_uid, r.id, 'global'
    from iam.roles r where r.codigo = new.rol
    on conflict do nothing;
  end if;
  return new;
end $$;
drop trigger if exists trg_iam_sync_usuarios on public.tms_usuarios;
create trigger trg_iam_sync_usuarios
  after insert or update or delete on public.tms_usuarios
  for each row execute function authz.tg_sync_usuarios();

-- ── Gate central: leer del IAM, con rama legada como red de seguridad ───────
--  Firma IDÉNTICA (text[]). Semántica = superconjunto del comportamiento actual:
--  admin bypass ∨ IAM(permiso efectivo) ∨ legado(permisos_json). Como el IAM es
--  espejo exacto de permisos_json, IAM y legado coinciden → cero cambio efectivo.
create or replace function public.usuario_tiene_algun_permiso(p_perms text[])
returns boolean language sql stable security definer set search_path = public, iam, authz as $$
  select exists (
    select 1
    from tms_usuarios u
    left join tms_roles r on r.id = u.rol
    where u.auth_uid = auth.uid() and u.activo
      and (
        u.rol = 'ADMIN' or u.es_admin_delegado
        or exists (                                        -- IAM (fuente nueva)
          select 1 from iam.user_effective_permissions e
          where e.user_id = u.auth_uid and e.permission = any(p_perms)
        )
        or r.permisos_json ?| p_perms                      -- legado (red de seguridad)
      )
  );
$$;

-- ── iam_me(): perfil + roles + permisos efectivos del usuario en sesión ─────
create or replace function public.iam_me()
returns jsonb language sql stable security definer set search_path = public, iam, authz as $$
  select jsonb_build_object(
    'user_id',  tu.auth_uid,
    'nombre',   tu.nombre,
    'correo',   tu.email,
    'activo',   coalesce(tu.activo, false),
    'es_admin', (tu.rol = 'ADMIN' or coalesce(tu.es_admin_delegado, false)),
    'rol',      tu.rol,
    'roles',    coalesce((
                  select jsonb_agg(distinct r.codigo)
                  from iam.assignments a
                  join iam.roles r on r.id = a.role_id and r.activo
                  where a.principal_type = 'user' and a.principal_id = tu.auth_uid
                    and (a.expires_at is null or a.expires_at > now())
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
