-- Archivo reversible para limpieza operativa de ubicaciones WMS.
-- Conserva un snapshot completo antes de retirar la fila de la fuente operativa.
-- No escribe en Softland/ERP, no modifica cantidades y no toca el catálogo maestro.

create table public.wms_ubicaciones_archivadas (
  id uuid primary key default gen_random_uuid(),
  ubicacion_id_original uuid not null unique,
  datos jsonb not null,
  motivo text not null check (length(btrim(motivo)) between 3 and 500),
  archivado_en timestamptz not null default now(),
  archivado_por uuid references public.tms_usuarios(id) on delete set null,
  archivado_por_nombre text
);

create index idx_wms_ubicaciones_archivadas_ubicacion
  on public.wms_ubicaciones_archivadas ((upper(btrim(datos ->> 'ubicacion'))), archivado_en desc);

alter table public.wms_ubicaciones_archivadas enable row level security;

-- No hay escritura ni lectura directa desde el cliente: el archivo se crea
-- exclusivamente por la RPC con gate manage_locations.
revoke all on table public.wms_ubicaciones_archivadas from public, anon, authenticated;
grant all on table public.wms_ubicaciones_archivadas to service_role;

create function public.archivar_ubicaciones_wms(
  p_ids uuid[],
  p_motivo text default 'Limpieza controlada desde Gestion de Ubicaciones'
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_ids uuid[];
  v_actor_id uuid;
  v_actor_nombre text;
  v_motivo text := nullif(btrim(coalesce(p_motivo, '')), '');
  v_archivados integer := 0;
  v_solicitudes_desvinculadas integer := 0;
begin
  if auth.uid() is null
     or not coalesce(public.usuario_tiene_algun_permiso(array['manage_locations']), false) then
    raise exception 'No tienes permiso para archivar ubicaciones WMS' using errcode = '42501';
  end if;

  if p_ids is null or coalesce(array_length(p_ids, 1), 0) = 0 then
    raise exception 'Debe seleccionar al menos una ubicacion' using errcode = '22023';
  end if;

  select array_agg(distinct source.location_id order by source.location_id)
    into v_ids
  from unnest(p_ids) as source(location_id)
  where source.location_id is not null;

  if coalesce(array_length(v_ids, 1), 0) = 0 then
    raise exception 'Debe seleccionar al menos una ubicacion valida' using errcode = '22023';
  end if;
  if array_length(v_ids, 1) > 500 then
    raise exception 'Maximo 500 ubicaciones por archivo' using errcode = '22023';
  end if;
  if v_motivo is null or length(v_motivo) > 500 or v_motivo !~ '[[:alnum:]]' then
    raise exception 'Indica un motivo de archivo valido' using errcode = '22023';
  end if;

  select u.id, coalesce(nullif(u.nombre, ''), u.email)
    into v_actor_id, v_actor_nombre
  from public.tms_usuarios u
  where u.auth_uid = auth.uid() and u.activo
  limit 1;
  if v_actor_id is null then
    raise exception 'Usuario activo no encontrado' using errcode = '42501';
  end if;

  select count(*)
    into v_solicitudes_desvinculadas
  from public.wms_ubicacion_solicitudes s
  where s.ubicacion_id = any(v_ids);

  with seleccionadas as (
    select w.id, to_jsonb(w) as datos
    from public.wms_ubicaciones w
    where w.id = any(v_ids)
    order by w.id
    for update
  ), archivadas as (
    insert into public.wms_ubicaciones_archivadas (
      ubicacion_id_original, datos, motivo, archivado_por, archivado_por_nombre
    )
    select id, datos, v_motivo, v_actor_id, v_actor_nombre
    from seleccionadas
    on conflict (ubicacion_id_original) do nothing
    returning ubicacion_id_original
  ), retiradas as (
    delete from public.wms_ubicaciones w
    using archivadas a
    where w.id = a.ubicacion_id_original
    returning w.id
  )
  select count(*) into v_archivados from retiradas;

  return jsonb_build_object(
    'archivados', v_archivados,
    'omitidos', array_length(v_ids, 1) - v_archivados,
    'solicitudes_desvinculadas', v_solicitudes_desvinculadas,
    'stock_side_effect', 0,
    'erp_write', 0
  );
end;
$$;

revoke all on function public.archivar_ubicaciones_wms(uuid[], text) from public, anon;
grant execute on function public.archivar_ubicaciones_wms(uuid[], text) to authenticated, service_role;

comment on table public.wms_ubicaciones_archivadas is
  'Snapshots de ubicaciones WMS retiradas de la vista operativa. No representa stock ERP ni borra catálogo maestro.';
comment on function public.archivar_ubicaciones_wms(uuid[], text) is
  'Archiva hasta 500 filas WMS con snapshot y auditoría antes de retirarlas de la fuente operativa. Requiere manage_locations.';
