-- Crea el informe definitivo y resuelve la tarea en una única transacción.
-- Si el lease cambió o cualquier inserción falla, no queda un informe huérfano.
create or replace function public.crear_informe_monitoreo_asignacion(
  p_asignacion_id uuid,
  p_cabecera jsonb,
  p_items jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = 'public'
as $function$
declare
  v_informe jsonb;
  v_informe_id uuid;
begin
  perform public._monitoreo_assert_permiso();
  perform public.tomar_asignacion_calidad(p_asignacion_id);

  v_informe := public.crear_informe_monitoreo(p_cabecera, p_items);
  v_informe_id := (v_informe->>'id')::uuid;

  perform public.resolver_asignacion_calidad(
    p_asignacion_id,
    v_informe_id,
    'RESUELTA'
  );

  return v_informe || jsonb_build_object(
    'asignacion_id', p_asignacion_id,
    'asignacion_estado', 'RESUELTA'
  );
end;
$function$;

revoke all on function public.crear_informe_monitoreo_asignacion(uuid, jsonb, jsonb)
  from public, anon;
grant execute on function public.crear_informe_monitoreo_asignacion(uuid, jsonb, jsonb)
  to authenticated, service_role;

comment on function public.crear_informe_monitoreo_asignacion(uuid, jsonb, jsonb)
  is 'Finalización atómica de una tarea Hito 2: crea informe, ítems y resuelve/libera lease.';
