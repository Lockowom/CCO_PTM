-- 117_api_log_listar.sql — Lectura del log de la API (gateada) para el panel.
create or replace function public.api_log_listar()
returns setof public.tms_api_log language plpgsql stable security definer set search_path to 'public'
as $function$
begin
  if not (coalesce(private.is_admin(), false) or coalesce(public.usuario_tiene_algun_permiso(array['view_api','manage_api']), false)) then
    return;
  end if;
  return query select * from public.tms_api_log order by creado_en desc limit 100;
end; $function$;
revoke all on function public.api_log_listar() from public, anon;
grant execute on function public.api_log_listar() to authenticated;
