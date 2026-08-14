-- Alertas operativas para Calidad y reaperturas de N.V.
-- La alerta in-app siempre se conserva. El push es best-effort y nunca debe
-- impedir la creación de una tarea o solicitud si FCM no está disponible.

create or replace function public._notificar_rol_operativo(
  p_rol text,
  p_titulo text,
  p_mensaje text,
  p_payload jsonb
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_service_role text;
begin
  if p_rol not in ('ADMIN', 'CONTROL_CALIDAD') then
    raise exception 'Rol de notificación no permitido';
  end if;

  insert into public.notificacion (
    canal, destinatario_rol, titulo, mensaje, payload, estado
  ) values (
    'in-app', p_rol, p_titulo, p_mensaje, coalesce(p_payload, '{}'::jsonb), 'pendiente'
  );

  begin
    select decrypted_secret into v_service_role
    from vault.decrypted_secrets
    where name = 'edge_webhook_service_role'
    limit 1;

    if nullif(v_service_role, '') is not null then
      perform net.http_post(
        url := 'https://vtrtyzbgpsvqwbfoudaf.supabase.co/functions/v1/notify-inventario',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || v_service_role
        ),
        body := jsonb_build_object(
          'titulo', p_titulo,
          'mensaje', p_mensaje,
          'rol', p_rol,
          'payload', coalesce(p_payload, '{}'::jsonb)
        ),
        timeout_milliseconds := 5000
      );
    else
      raise warning 'Push no enviado: falta edge_webhook_service_role en Vault';
    end if;
  exception
    when others then
      raise warning 'No se pudo encolar push para rol %: %', p_rol, sqlerrm;
  end;
end;
$$;

create or replace function public._notificar_calidad_hito1_pendiente()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_mensaje text;
begin
  if new.tipo <> 'CHECKLIST_INGRESO' or new.estado <> 'PENDIENTE' then
    return new;
  end if;

  v_mensaje := format(
    'Nueva recepción pendiente de revisión: %s%s.',
    coalesce(nullif(btrim(new.proveedor), ''), 'proveedor sin identificar'),
    case
      when nullif(btrim(new.oc), '') is not null then ' · OC ' || btrim(new.oc)
      else ''
    end
  );

  perform public._notificar_rol_operativo(
    'CONTROL_CALIDAD',
    'Nueva tarea pendiente · Hito 1',
    v_mensaje,
    jsonb_build_object(
      'type', 'QUALITY_HITO1_PENDING',
      'task_id', new.id,
      'recepcion_id', new.recepcion_id,
      'oc', new.oc,
      'proveedor', new.proveedor,
      'route', '/quality/monitoreo?hito=1'
    )
  );

  return new;
end;
$$;

drop trigger if exists trg_notificar_calidad_hito1_pendiente
  on public.tms_calidad_tareas;
create trigger trg_notificar_calidad_hito1_pendiente
after insert on public.tms_calidad_tareas
for each row execute function public._notificar_calidad_hito1_pendiente();

create or replace function public._notificar_calidad_hito2_asignado()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_total integer;
  v_mensaje text;
begin
  if new.estado <> 'PENDIENTE' then
    return new;
  end if;

  v_total := case
    when jsonb_typeof(new.skus) = 'array' then jsonb_array_length(new.skus)
    else 0
  end;
  v_mensaje := format(
    '%s asignó %s SKU(s)%s.',
    coalesce(nullif(btrim(new.asignado_nombre), ''), 'Inventario'),
    v_total,
    case
      when nullif(btrim(new.motivo), '') is not null then ' · ' || btrim(new.motivo)
      else ''
    end
  );

  perform public._notificar_rol_operativo(
    'CONTROL_CALIDAD',
    case
      when new.prioridad = 'URGENTE' then 'Asignación urgente · Hito 2'
      else 'Nueva asignación · Hito 2'
    end,
    v_mensaje,
    jsonb_build_object(
      'type', 'QUALITY_HITO2_ASSIGNED',
      'assignment_id', new.id,
      'priority', new.prioridad,
      'sku_count', v_total,
      'route', '/quality/monitoreo?hito=2'
    )
  );

  return new;
end;
$$;

drop trigger if exists trg_notificar_calidad_hito2_asignado
  on public.tms_calidad_asignaciones;
create trigger trg_notificar_calidad_hito2_asignado
after insert on public.tms_calidad_asignaciones
for each row execute function public._notificar_calidad_hito2_asignado();

-- Corrige el push de reapertura: la Edge Function exige JWT y la alerta debe
-- abrir directamente la bandeja operativa, no el centro genérico de eventos.
create or replace function public._nv_notificar_reapertura_admin(p_request_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_req public.tms_nv_reaperturas%rowtype;
  v_titulo text;
  v_mensaje text;
  v_payload jsonb;
begin
  select * into v_req
  from public.tms_nv_reaperturas
  where id = p_request_id;

  if v_req.id is null then
    return;
  end if;

  v_titulo := 'Solicitud de reapertura N.V.';
  v_mensaje := format(
    '%s solicitó reabrir la N.V. %s · %s',
    coalesce(nullif(btrim(v_req.solicitada_por_nombre), ''), 'Usuario'),
    coalesce(nullif(btrim(v_req.nv), ''), v_req.operacion_id::text),
    coalesce(nullif(btrim(v_req.motivo), ''), 'Sin motivo informado')
  );
  v_payload := jsonb_build_object(
    'type', 'NV_REOPEN_REQUEST',
    'request_id', v_req.id,
    'operacion_id', v_req.operacion_id,
    'nv', v_req.nv,
    'canal', v_req.canal,
    'estado', v_req.estado,
    'route', '/panel/reaperturas'
  );

  perform public._notificar_rol_operativo(
    'ADMIN', v_titulo, v_mensaje, v_payload
  );
end;
$$;

revoke all on function public._notificar_rol_operativo(text, text, text, jsonb)
  from public, anon, authenticated;
revoke all on function public._notificar_calidad_hito1_pendiente()
  from public, anon, authenticated;
revoke all on function public._notificar_calidad_hito2_asignado()
  from public, anon, authenticated;
revoke all on function public._nv_notificar_reapertura_admin(uuid)
  from public, anon, authenticated;

grant execute on function public._notificar_rol_operativo(text, text, text, jsonb)
  to service_role;
grant execute on function public._nv_notificar_reapertura_admin(uuid)
  to service_role;

comment on function public._notificar_rol_operativo(text, text, text, jsonb) is
  'Registra alerta in-app y encola push JWT para roles operativos permitidos.';
comment on function public._notificar_calidad_hito1_pendiente() is
  'Notifica a CONTROL_CALIDAD cuando nace un checklist Hito 1 pendiente.';
comment on function public._notificar_calidad_hito2_asignado() is
  'Notifica a CONTROL_CALIDAD cuando recibe una asignación Hito 2.';
