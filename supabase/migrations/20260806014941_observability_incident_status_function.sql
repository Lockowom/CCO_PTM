-- Actualiza el ciclo de vida de una alerta sin conceder UPDATE directo.
create or replace function public.update_system_alert_status(
  p_alert_id uuid,
  p_status text,
  p_note text default null
)
returns public.system_alerts
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_actor text;
  v_alert public.system_alerts;
begin
  if not (public.is_admin() or public.usuario_tiene_algun_permiso(array['admin_monitor'])) then
    raise exception 'No autorizado';
  end if;
  if p_status not in ('open', 'ack', 'resolved') then
    raise exception 'Estado de alerta invalido';
  end if;
  select coalesce(nombre, email, auth.uid()::text)
    into v_actor
  from public.tms_usuarios
  where auth_uid = auth.uid()
  limit 1;
  update public.system_alerts
     set status = p_status,
         acknowledged_at = case when p_status = 'ack' then now() else acknowledged_at end,
         acknowledged_by = case when p_status = 'ack' then coalesce(v_actor, auth.uid()::text) else acknowledged_by end,
         resolved_at = case when p_status = 'resolved' then now() else null end,
         resolved_by = case when p_status = 'resolved' then coalesce(v_actor, auth.uid()::text) else null end,
         resolution_note = nullif(left(trim(coalesce(p_note, '')), 1000), '')
   where id = p_alert_id
   returning * into v_alert;
  if v_alert.id is null then
    raise exception 'Alerta no encontrada';
  end if;
  return v_alert;
end;
$$;
revoke all on function public.update_system_alert_status(uuid, text, text) from public, anon;
grant execute on function public.update_system_alert_status(uuid, text, text) to authenticated, service_role;
