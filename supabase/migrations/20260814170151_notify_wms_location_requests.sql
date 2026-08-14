-- Notifica de inmediato a administracion cuando bodega reporta una ubicacion.
-- Se conservan los codigos internos AGOTADO/MOVIDO por compatibilidad historica;
-- la interfaz los presenta como UBICACION NO CORRESPONDE/TRANSFERENCIA.

create or replace function public._notificar_solicitud_ubicacion_admin(
  p_solicitud_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_solicitud public.wms_ubicacion_solicitudes%rowtype;
  v_titulo text;
  v_mensaje text;
  v_payload jsonb;
  v_service_role text;
begin
  select * into v_solicitud
  from public.wms_ubicacion_solicitudes
  where id = p_solicitud_id;

  if v_solicitud.id is null then
    return;
  end if;

  if v_solicitud.tipo = 'MOVIDO' then
    v_titulo := 'Nueva transferencia de ubicacion';
    v_mensaje := format(
      '%s solicita transferir SKU %s: %s -> %s.',
      v_solicitud.solicitante_nombre,
      v_solicitud.codigo,
      v_solicitud.ubicacion_actual,
      v_solicitud.nueva_ubicacion
    );
  else
    v_titulo := 'Ubicacion no corresponde';
    v_mensaje := format(
      '%s informa que el SKU %s no se encuentra en %s.',
      v_solicitud.solicitante_nombre,
      v_solicitud.codigo,
      v_solicitud.ubicacion_actual
    );
  end if;

  v_payload := jsonb_build_object(
    'type', 'WMS_LOCATION_REQUEST',
    'request_id', v_solicitud.id,
    'request_type', v_solicitud.tipo,
    'codigo', v_solicitud.codigo,
    'ubicacion_actual', v_solicitud.ubicacion_actual,
    'nueva_ubicacion', v_solicitud.nueva_ubicacion,
    'route', '/admin/location-requests'
  );

  insert into public.notificacion (
    canal, destinatario_rol, titulo, mensaje, payload, estado
  ) values (
    'in-app', 'ADMIN', v_titulo, v_mensaje, v_payload, 'pendiente'
  );

  -- notify-inventario exige JWT. La credencial solo se lee desde Vault y nunca
  -- se devuelve al cliente ni se almacena en la solicitud.
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
          'titulo', v_titulo,
          'mensaje', v_mensaje,
          'rol', 'ADMIN',
          'payload', v_payload
        ),
        timeout_milliseconds := 5000
      );
    else
      raise warning 'No se envio push WMS: falta edge_webhook_service_role en Vault';
    end if;
  exception
    when others then
      -- La solicitud y la alerta in-app no deben perderse si FCM esta caido.
      raise warning 'No se pudo encolar push WMS para solicitud %: %',
        v_solicitud.id, sqlerrm;
  end;
end;
$$;

create or replace function public.wms_ubicacion_solicitud_notificar()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public._notificar_solicitud_ubicacion_admin(new.id);
  return new;
end;
$$;

drop trigger if exists wms_ubicacion_solicitud_notificar_admin
  on public.wms_ubicacion_solicitudes;
create trigger wms_ubicacion_solicitud_notificar_admin
after insert on public.wms_ubicacion_solicitudes
for each row execute function public.wms_ubicacion_solicitud_notificar();

revoke all on function public._notificar_solicitud_ubicacion_admin(uuid)
  from public, anon, authenticated;
revoke all on function public.wms_ubicacion_solicitud_notificar()
  from public, anon, authenticated;
grant execute on function public._notificar_solicitud_ubicacion_admin(uuid)
  to service_role;

comment on function public._notificar_solicitud_ubicacion_admin(uuid) is
  'Crea alerta in-app y push ADMIN para una nueva solicitud de ubicacion WMS.';
