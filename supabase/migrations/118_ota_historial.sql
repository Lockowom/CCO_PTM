-- 118_ota_historial.sql — Historial OTA legible para el panel (gateado).
create or replace function public.ota_historial()
returns setof public.tms_ota_despliegues language plpgsql stable security definer set search_path to 'public'
as $function$
begin
  if not (coalesce(private.is_admin(), false)
       or coalesce(public.usuario_tiene_algun_permiso(array['deploy_ota','admin_monitor']), false)) then
    return;
  end if;
  return query select * from public.tms_ota_despliegues order by created_at desc limit 60;
end; $function$;
revoke all on function public.ota_historial() from public, anon;
grant execute on function public.ota_historial() to authenticated;
