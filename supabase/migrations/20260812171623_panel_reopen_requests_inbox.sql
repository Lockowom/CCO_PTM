-- Bandeja central de solicitudes de reapertura de N.V.
-- La operacion conserva sus fechas historicas: aprobar cambia el estado actual,
-- pero no borra fecha_aprobacion, fecha_compromiso ni fecha_entregado.

create or replace function public.listar_bandeja_reaperturas_nv(
  p_estado text default null,
  p_busqueda text default null,
  p_limit integer default 200
) returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_estado text := nullif(upper(btrim(coalesce(p_estado, ''))), '');
  v_busqueda text := nullif(btrim(coalesce(p_busqueda, '')), '');
  v_limit integer := least(greatest(coalesce(p_limit, 200), 1), 500);
  v_items jsonb;
  v_stats jsonb;
begin
  if not public._panel_puede_aprobar_reapertura_nv() then
    raise exception using errcode = '42501', message = 'No autorizado para revisar reaperturas';
  end if;

  if v_estado is not null and v_estado not in ('PENDIENTE', 'APROBADA', 'RECHAZADA') then
    raise exception using errcode = '22023', message = 'Estado de solicitud no valido';
  end if;

  if length(coalesce(v_busqueda, '')) > 100 then
    raise exception using errcode = '22023', message = 'La busqueda no puede superar 100 caracteres';
  end if;

  select coalesce(jsonb_agg(to_jsonb(q) order by q.solicitada_at desc), '[]'::jsonb)
    into v_items
  from (
    select
      r.id as request_id,
      r.operacion_id,
      r.nv,
      r.canal,
      r.estado_origen,
      r.motivo,
      r.estado as estado_solicitud,
      r.solicitada_por,
      r.solicitada_por_nombre,
      r.solicitada_at,
      r.resuelta_por,
      r.resuelta_por_nombre,
      r.resuelta_at,
      r.observacion_resolucion,
      o.cliente,
      o.vendedor,
      o.estado as estado_nv,
      o.transportista,
      o.urgente,
      o.fecha_aprobacion::text as fecha_aprobacion,
      o.fecha_aprobacion_real::text as fecha_aprobacion_real,
      o.fecha_compromiso::text as fecha_compromiso,
      o.fecha_entregado::text as fecha_entregado,
      o.reabierta,
      o.fecha_reapertura,
      o.motivo_reapertura
    from public.tms_nv_reaperturas r
    join public.tms_operaciones o on o.id = r.operacion_id
    where (v_estado is null or r.estado = v_estado)
      and (
        v_busqueda is null
        or r.nv ilike '%' || v_busqueda || '%'
        or coalesce(o.cliente, '') ilike '%' || v_busqueda || '%'
        or coalesce(o.vendedor, '') ilike '%' || v_busqueda || '%'
        or coalesce(r.solicitada_por_nombre, '') ilike '%' || v_busqueda || '%'
        or coalesce(r.motivo, '') ilike '%' || v_busqueda || '%'
      )
    order by
      case r.estado when 'PENDIENTE' then 0 when 'APROBADA' then 1 else 2 end,
      r.solicitada_at desc
    limit v_limit
  ) q;

  select jsonb_build_object(
    'total', count(*),
    'pendientes', count(*) filter (where estado = 'PENDIENTE'),
    'aprobadas', count(*) filter (where estado = 'APROBADA'),
    'rechazadas', count(*) filter (where estado = 'RECHAZADA')
  )
  into v_stats
  from public.tms_nv_reaperturas;

  return jsonb_build_object('ok', true, 'items', v_items, 'stats', v_stats);
end;
$$;

revoke all on function public.listar_bandeja_reaperturas_nv(text, text, integer)
  from public, anon;
grant execute on function public.listar_bandeja_reaperturas_nv(text, text, integer)
  to authenticated, service_role;

-- Solo quien puede resolver ve todas las solicitudes. El solicitante conserva
-- acceso a su propio historial desde Ingresar N.V.
drop policy if exists nv_reaperturas_select on public.tms_nv_reaperturas;
create policy nv_reaperturas_select on public.tms_nv_reaperturas
  for select
  to authenticated
  using (
    public._panel_puede_aprobar_reapertura_nv()
    or solicitada_por = (select u.id from public._panel_usuario_actual() u limit 1)
  );

-- Habilita refresco instantaneo de la bandeja sin duplicar la tabla en la
-- publicacion si ya estaba incorporada.
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'tms_nv_reaperturas'
  ) then
    alter publication supabase_realtime add table public.tms_nv_reaperturas;
  end if;
end
$$;
