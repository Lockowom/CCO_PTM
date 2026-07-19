-- Historial de accesos (ingresos exitosos) desde tms_accesos, para la pestaña
-- Accesos de Identidad y Seguridad. Solo admin de app.
create or replace function public.iam_historial_acceso(
  p_desde date default null, p_hasta date default null, p_q text default null, p_limit int default 300
) returns jsonb language plpgsql stable security definer set search_path = public, authz as $$
begin
  if not authz._es_admin_app() then raise exception 'No autorizado'; end if;
  return coalesce((
    select jsonb_agg(to_jsonb(x)) from (
      select a.id, a.usuario_id, a.nombre, a.email, a.rol, a.fecha,
             tu.rol as rol_actual, coalesce(tu.activo, false) as usuario_activo
      from public.tms_accesos a
      left join public.tms_usuarios tu on tu.id = a.usuario_id
      where (p_desde is null or a.fecha >= p_desde)
        and (p_hasta is null or a.fecha < (p_hasta + 1))
        and (p_q is null or a.nombre ilike '%'||p_q||'%' or a.email ilike '%'||p_q||'%' or a.rol ilike '%'||p_q||'%')
      order by a.fecha desc
      limit greatest(1, least(coalesce(p_limit, 300), 1000))
    ) x
  ), '[]'::jsonb);
end $$;
revoke all on function public.iam_historial_acceso(date, date, text, int) from public, anon;
grant execute on function public.iam_historial_acceso(date, date, text, int) to authenticated;

create or replace function public.iam_historial_acceso_resumen()
returns jsonb language plpgsql stable security definer set search_path = public, authz as $$
begin
  if not authz._es_admin_app() then raise exception 'No autorizado'; end if;
  return jsonb_build_object(
    'total',    (select count(*) from public.tms_accesos),
    'usuarios', (select count(distinct usuario_id) from public.tms_accesos),
    'hoy',      (select count(*) from public.tms_accesos where fecha::date = current_date),
    'semana',   (select count(*) from public.tms_accesos where fecha >= now() - interval '7 days'),
    'ultimo',   (select max(fecha) from public.tms_accesos)
  );
end $$;
revoke all on function public.iam_historial_acceso_resumen() from public, anon;
grant execute on function public.iam_historial_acceso_resumen() to authenticated;
