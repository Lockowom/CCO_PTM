-- ============================================================================
--  133_fix_sesiones_join_cast.sql — Fix Identity & Security · Sesiones
--  `tms_usuarios_activos.usuario_id` es TEXT y `tms_usuarios.id` es UUID, así que
--  el JOIN de presencia lanzaba `operator does not exist: text = uuid` y la RPC
--  `iam_sesiones` abortaba (la pestaña Sesiones mostraba "0 sesiones"). Se castea
--  el uuid a texto en el join (mismo fix en `iam_forzar_logout`).
-- ============================================================================
create or replace function public.iam_sesiones()
returns jsonb language plpgsql stable security definer set search_path = public, iam, authz, auth as $$
begin
  if not authz._es_admin_app() then raise exception 'No autorizado'; end if;
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'session_id', s.id, 'auth_uid', s.user_id,
      'usuario_id', tu.id, 'nombre', coalesce(tu.nombre,'(desconocido)'),
      'correo', tu.email, 'rol', tu.rol,
      'ip', host(s.ip), 'user_agent', s.user_agent,
      'created_at', s.created_at, 'refreshed_at', s.refreshed_at, 'not_after', s.not_after,
      'aal', s.aal,
      'mfa', exists (select 1 from auth.mfa_factors f where f.user_id = s.user_id and f.status='verified'),
      'estado', ua.estado, 'modulo', ua.modulo_actual, 'ultima_actividad', ua.ultima_actividad
    ) order by s.refreshed_at desc nulls last, s.created_at desc)
    from auth.sessions s
    left join public.tms_usuarios tu on tu.auth_uid = s.user_id
    left join public.tms_usuarios_activos ua on ua.usuario_id = tu.id::text
  ), '[]'::jsonb);
end $$;
revoke all on function public.iam_sesiones() from public, anon;
grant execute on function public.iam_sesiones() to authenticated;

create or replace function public.iam_forzar_logout(p_auth uuid)
returns jsonb language plpgsql security definer set search_path = public, iam, authz as $$
declare v_rol text; v_n int;
begin
  if not authz._es_admin_app() then raise exception 'No autorizado'; end if;
  if p_auth is null then raise exception 'Falta el usuario'; end if;

  delete from auth.sessions where user_id = p_auth;
  get diagnostics v_n = row_count;

  update public.tms_usuarios set force_logout_at = now() where auth_uid = p_auth;
  update public.tms_usuarios_activos ua set estado = 'desconectado'
    from public.tms_usuarios tu where tu.auth_uid = p_auth and ua.usuario_id = tu.id::text;

  select rol into v_rol from public.tms_usuarios where auth_uid = auth.uid() limit 1;
  insert into public.tms_auditoria(actor_auth_uid, actor_rol, tabla, accion, registro_id, datos_despues)
  values (auth.uid(), v_rol, 'auth.sessions', 'FORCE_LOGOUT', p_auth::text,
          jsonb_build_object('sesiones_revocadas', v_n));

  return jsonb_build_object('ok', true, 'revocadas', v_n);
end $$;
revoke all on function public.iam_forzar_logout(uuid) from public, anon;
grant execute on function public.iam_forzar_logout(uuid) to authenticated;
