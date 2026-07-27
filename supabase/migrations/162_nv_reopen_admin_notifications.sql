-- ============================================================================
-- 162_nv_reopen_admin_notifications.sql
-- Solicitud de reapertura de N.V.:
--   - notificacion in-app inmediata para ADMIN
--   - push inmediata al celular de los ADMIN con push_token
-- ============================================================================

create or replace function public._nv_notificar_reapertura_admin(p_request_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_req public.tms_nv_reaperturas;
  v_titulo text;
  v_mensaje text;
  v_payload jsonb;
begin
  select *
    into v_req
  from public.tms_nv_reaperturas
  where id = p_request_id;

  if v_req.id is null then
    return;
  end if;

  v_titulo := 'Solicitud de reapertura N.V.';
  v_mensaje := format(
    '%s solicito reapertura de la N.V. %s. Motivo: %s',
    coalesce(nullif(trim(v_req.solicitada_por_nombre), ''), 'Usuario'),
    coalesce(nullif(trim(v_req.nv), ''), v_req.operacion_id::text),
    coalesce(nullif(trim(v_req.motivo), ''), 'Sin motivo')
  );
  v_payload := jsonb_build_object(
    'type', 'NV_REOPEN_REQUEST',
    'request_id', v_req.id,
    'operacion_id', v_req.operacion_id,
    'nv', v_req.nv,
    'canal', v_req.canal,
    'estado', v_req.estado,
    'route', '/admin/eventos'
  );

  insert into public.notificacion (
    canal,
    destinatario_rol,
    titulo,
    mensaje,
    payload,
    estado
  )
  values (
    'in-app',
    'ADMIN',
    v_titulo,
    v_mensaje,
    v_payload,
    'pendiente'
  );

  begin
    perform net.http_post(
      url := 'https://vtrtyzbgpsvqwbfoudaf.supabase.co/functions/v1/notify-inventario',
      body := jsonb_build_object(
        'titulo', v_titulo,
        'mensaje', v_mensaje,
        'rol', 'ADMIN',
        'payload', v_payload
      ),
      headers := jsonb_build_object('Content-Type', 'application/json'),
      timeout_milliseconds := 2000
    );
  exception when others then
    null;
  end;
end;
$$;

create or replace function public.solicitar_reapertura_nv(p_operacion_id bigint, p_motivo text)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_row public.tms_operaciones;
  v_user record;
  v_motivo text := nullif(btrim(coalesce(p_motivo, '')), '');
  v_req public.tms_nv_reaperturas;
begin
  if not public._panel_puede_escribir() then
    raise exception 'No autorizado';
  end if;

  if v_motivo is null then
    return jsonb_build_object('ok', false, 'message', 'Debes indicar el motivo de la reapertura.');
  end if;

  select * into v_row
  from public.tms_operaciones
  where id = p_operacion_id;

  if v_row.id is null then
    raise exception 'N.V. no encontrada';
  end if;

  if coalesce(v_row.estado, '') <> 'Entregado' then
    return jsonb_build_object('ok', false, 'message', 'Solo se pueden solicitar reaperturas para N.V. entregadas.');
  end if;

  select * into v_user from public._panel_usuario_actual();
  if v_user.id is null then
    raise exception 'Usuario no identificado';
  end if;

  select * into v_req
  from public.tms_nv_reaperturas
  where operacion_id = p_operacion_id
    and estado = 'PENDIENTE'
  order by solicitada_at desc
  limit 1;

  if v_req.id is not null then
    return jsonb_build_object(
      'ok', false,
      'pending', true,
      'message', 'Ya existe una solicitud de reapertura pendiente para esta N.V.'
    );
  end if;

  insert into public.tms_nv_reaperturas (
    operacion_id, nv, canal, estado_origen, motivo,
    solicitada_por, solicitada_por_nombre
  )
  values (
    v_row.id,
    coalesce(v_row.nv_ptm::text, v_row.nv_orange, v_row.nv_farmapack, v_row.varios),
    case
      when v_row.nv_ptm is not null then 'ptm'
      when v_row.nv_orange is not null then 'orange'
      when v_row.nv_farmapack is not null then 'farmapack'
      else 'varios'
    end,
    v_row.estado,
    v_motivo,
    v_user.id,
    v_user.nombre
  )
  returning * into v_req;

  insert into public.tms_operaciones_log (oper_id, accion, nv, despues)
  values (
    v_row.id,
    'reopen_request',
    coalesce(v_row.nv_ptm::text, v_row.nv_orange, v_row.nv_farmapack, v_row.varios),
    jsonb_build_object(
      'solicitud_id', v_req.id,
      'motivo', v_req.motivo,
      'estado', v_req.estado
    )
  );

  insert into public.workflow_history (workflow, entidad_id, desde, hasta, accion, actor, nota)
  values (
    'NV',
    v_row.id::text,
    v_row.estado,
    v_row.estado,
    'solicitar_reapertura',
    public._panel_actor(),
    v_motivo
  );

  perform public._nv_notificar_reapertura_admin(v_req.id);

  return jsonb_build_object(
    'ok', true,
    'request_id', v_req.id,
    'message', 'Solicitud de reapertura enviada para aprobacion.'
  );
end;
$$;

revoke all on function public._nv_notificar_reapertura_admin(uuid) from public, anon;
grant execute on function public._nv_notificar_reapertura_admin(uuid) to authenticated, service_role;
