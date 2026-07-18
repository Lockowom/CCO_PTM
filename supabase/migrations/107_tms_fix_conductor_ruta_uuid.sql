-- ============================================================================
--  107_tms_fix_conductor_ruta_uuid.sql
--  Corrige un desajuste de tipos: tms_conductores.id y tms_rutas.id son UUID,
--  pero tms_transporte_ordenes.conductor_id/ruta_id se crearon como bigint
--  (Fase 1). Con la tabla de órdenes vacía, se cambian a uuid y se ajusta el
--  cast del RPC de asignación. Sin esto, asignar un chofer/ruta fallaba y el
--  filtro "Mis órdenes" de Mi Ruta nunca calzaba.
-- ============================================================================
alter table public.tms_transporte_ordenes alter column conductor_id type uuid using null::uuid;
alter table public.tms_transporte_ordenes alter column ruta_id type uuid using null::uuid;

create or replace function public.tms_orden_asignar(p_id bigint, p jsonb)
returns jsonb language plpgsql security definer set search_path to 'public'
as $function$
declare r public.tms_transporte_ordenes;
begin
  if not public._tms_puede_gestionar() then raise exception 'No autorizado'; end if;
  update public.tms_transporte_ordenes set
    vehiculo_id = coalesce(nullif(p->>'vehiculo_id','')::bigint, vehiculo_id),
    conductor_id = coalesce(nullif(p->>'conductor_id','')::uuid, conductor_id),
    ruta_id = coalesce(nullif(p->>'ruta_id','')::uuid, ruta_id),
    fecha_programada = coalesce(nullif(p->>'fecha_programada','')::date, fecha_programada),
    hora_programada = coalesce(nullif(p->>'hora_programada',''), hora_programada),
    estado = case when estado = 'pendiente_asignacion' then 'programado' else estado end,
    updated_at = now(), updated_by = public._panel_actor()
  where id = p_id returning * into r;
  if r.id is null then raise exception 'Orden no encontrada'; end if;
  return jsonb_build_object('ok', true, 'id', r.id, 'estado', r.estado);
end; $function$;
