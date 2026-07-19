-- ============================================================================
--  126_iam_fase5_sesiones_auditoria.sql — Identity & Security · FASE 5
--  Sesiones + Auditoría. Reutiliza lo YA existente (no duplica):
--    - Auditoría: trigger genérico `tms_audit_row()` → `tms_auditoria`
--      (ya cubre tms_roles y tms_usuarios). Fase 5 añade el VISOR + audita los
--      cambios de ámbito (iam.assignments vía las RPC de Fase 4).
--    - Sesiones: `auth.sessions` (reales, Supabase Auth) + presencia
--      (`tms_usuarios_activos`) + bitácora de acceso (`tms_accesos`).
--      Fase 5 añade el LISTADO admin y el FORZAR CIERRE (revoca + señal al guard).
--  Gate: admin de aplicación (private.is_admin ∨ es_admin_delegado). NO destructivo.
-- ============================================================================

-- Señal precisa de cierre forzado (el Session Guard del cliente reacciona a
-- cambios de la fila del usuario; con esto forzamos logout SIN desactivar).
alter table public.tms_usuarios add column if not exists force_logout_at timestamptz;

-- ── Gate: admin de aplicación ───────────────────────────────────────────────
create or replace function authz._es_admin_app()
returns boolean language sql stable security definer set search_path = public, authz as $$
  select coalesce(private.is_admin(), false)
      or exists (select 1 from public.tms_usuarios
                 where auth_uid = auth.uid() and coalesce(es_admin_delegado,false) and coalesce(activo,true));
$$;

-- ── AUDITORÍA de cambios de ámbito (Fase 4) dentro de las RPC ───────────────
-- Se re-declaran iam_asignar_scope / iam_revocar_asignacion añadiendo escritura
-- en tms_auditoria (tabla lógica 'iam.assignments'); el resto es idéntico.
create or replace function public.iam_asignar_scope(
  p_user uuid, p_role text, p_scope_type text, p_scope_code text, p_expires timestamptz default null
) returns jsonb language plpgsql security definer set search_path = public, iam, authz as $$
declare v_role uuid; v_id uuid; v_rol text; v_accion text;
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
    v_accion := 'UPDATE';
  else
    insert into iam.assignments (principal_type, principal_id, role_id, scope_type, scope_code, granted_by, expires_at)
    values ('user', p_user, v_role, p_scope_type::iam.scope_type, p_scope_code, auth.uid(), p_expires)
    returning id into v_id;
    v_accion := 'INSERT';
  end if;

  select rol into v_rol from public.tms_usuarios where auth_uid = auth.uid() limit 1;
  insert into public.tms_auditoria(actor_auth_uid, actor_rol, tabla, accion, registro_id, datos_despues)
  values (auth.uid(), v_rol, 'iam.assignments', v_accion, v_id::text,
          jsonb_build_object('user_id',p_user,'role',p_role,'scope_type',p_scope_type,'scope_code',p_scope_code,'expires_at',p_expires));

  return jsonb_build_object('ok', true, 'id', v_id, 'accion', case when v_accion='INSERT' then 'creado' else 'actualizado' end);
end $$;
grant execute on function public.iam_asignar_scope(uuid, text, text, text, timestamptz) to authenticated;

create or replace function public.iam_revocar_asignacion(p_id uuid)
returns jsonb language plpgsql security definer set search_path = public, iam, authz as $$
declare v_rol text; v_before jsonb;
begin
  if not authz._puede_admin_scopes() then raise exception 'No autorizado'; end if;
  select to_jsonb(a) into v_before from iam.assignments a where a.id = p_id and a.scope_type <> 'global';
  delete from iam.assignments where id = p_id and scope_type <> 'global';
  if v_before is not null then
    select rol into v_rol from public.tms_usuarios where auth_uid = auth.uid() limit 1;
    insert into public.tms_auditoria(actor_auth_uid, actor_rol, tabla, accion, registro_id, datos_antes)
    values (auth.uid(), v_rol, 'iam.assignments', 'DELETE', p_id::text, v_before);
  end if;
  return jsonb_build_object('ok', true, 'id', p_id);
end $$;
grant execute on function public.iam_revocar_asignacion(uuid) to authenticated;

-- ── SESIONES: listar (auth.sessions + presencia + rol) ──────────────────────
create or replace function public.iam_sesiones()
returns jsonb language plpgsql stable security definer set search_path = public, iam, authz as $$
begin
  if not authz._es_admin_app() then raise exception 'No autorizado'; end if;
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'session_id', s.id, 'auth_uid', s.user_id,
      'usuario_id', tu.id, 'nombre', coalesce(tu.nombre,'(desconocido)'),
      'correo', tu.email, 'rol', tu.rol,
      'ip', host(s.ip), 'user_agent', s.user_agent,
      'created_at', s.created_at, 'refreshed_at', s.refreshed_at, 'not_after', s.not_after,
      'estado', ua.estado, 'modulo', ua.modulo_actual, 'ultima_actividad', ua.ultima_actividad
    ) order by s.refreshed_at desc nulls last, s.created_at desc)
    from auth.sessions s
    left join public.tms_usuarios tu on tu.auth_uid = s.user_id
    left join public.tms_usuarios_activos ua on ua.usuario_id = tu.id
  ), '[]'::jsonb);
end $$;
revoke all on function public.iam_sesiones() from public, anon;
grant execute on function public.iam_sesiones() to authenticated;

-- ── SESIONES: forzar cierre (revoca auth.sessions + señal al guard) ─────────
create or replace function public.iam_forzar_logout(p_auth uuid)
returns jsonb language plpgsql security definer set search_path = public, iam, authz as $$
declare v_rol text; v_n int;
begin
  if not authz._es_admin_app() then raise exception 'No autorizado'; end if;
  if p_auth is null then raise exception 'Falta el usuario'; end if;

  delete from auth.sessions where user_id = p_auth;
  get diagnostics v_n = row_count;

  -- Señal al Session Guard (realtime) para cierre inmediato en el cliente.
  update public.tms_usuarios set force_logout_at = now() where auth_uid = p_auth;
  update public.tms_usuarios_activos ua set estado = 'desconectado'
    from public.tms_usuarios tu where tu.auth_uid = p_auth and ua.usuario_id = tu.id;

  select rol into v_rol from public.tms_usuarios where auth_uid = auth.uid() limit 1;
  insert into public.tms_auditoria(actor_auth_uid, actor_rol, tabla, accion, registro_id, datos_despues)
  values (auth.uid(), v_rol, 'auth.sessions', 'FORCE_LOGOUT', p_auth::text,
          jsonb_build_object('sesiones_revocadas', v_n));

  return jsonb_build_object('ok', true, 'revocadas', v_n);
end $$;
revoke all on function public.iam_forzar_logout(uuid) from public, anon;
grant execute on function public.iam_forzar_logout(uuid) to authenticated;

-- ── AUDITORÍA: visor (filtros + diff) ───────────────────────────────────────
create or replace function public.iam_auditoria(
  p_tabla text default null, p_accion text default null,
  p_desde date default null, p_hasta date default null, p_limit int default 200
) returns jsonb language plpgsql stable security definer set search_path = public, iam, authz as $$
begin
  if not authz._es_admin_app() then raise exception 'No autorizado'; end if;
  return coalesce((
    select jsonb_agg(to_jsonb(x))
    from (
      select a.id, a.ts, coalesce(tu.nombre, a.actor_auth_uid::text) as actor,
             a.actor_rol, a.tabla, a.accion, a.registro_id,
             a.datos_antes as antes, a.datos_despues as despues
      from public.tms_auditoria a
      left join public.tms_usuarios tu on tu.auth_uid = a.actor_auth_uid
      where (p_tabla is null or a.tabla = p_tabla)
        and (p_accion is null or a.accion = p_accion)
        and (p_desde is null or a.ts >= p_desde)
        and (p_hasta is null or a.ts < (p_hasta + 1))
      order by a.ts desc
      limit greatest(1, least(coalesce(p_limit,200), 1000))
    ) x
  ), '[]'::jsonb);
end $$;
revoke all on function public.iam_auditoria(text, text, date, date, int) from public, anon;
grant execute on function public.iam_auditoria(text, text, date, date, int) to authenticated;

-- ── AUDITORÍA: catálogo de filtros ──────────────────────────────────────────
create or replace function public.iam_auditoria_meta()
returns jsonb language plpgsql stable security definer set search_path = public, iam, authz as $$
begin
  if not authz._es_admin_app() then raise exception 'No autorizado'; end if;
  return jsonb_build_object(
    'tablas', coalesce((select jsonb_agg(distinct tabla order by tabla) from public.tms_auditoria where tabla is not null), '[]'::jsonb),
    'acciones', coalesce((select jsonb_agg(distinct accion order by accion) from public.tms_auditoria where accion is not null), '[]'::jsonb),
    'total', (select count(*) from public.tms_auditoria)
  );
end $$;
revoke all on function public.iam_auditoria_meta() from public, anon;
grant execute on function public.iam_auditoria_meta() to authenticated;
