-- Hito 2 Calidad: selección múltiple, lote trazable, lease de edición y autosave.
-- Todas las escrituras operativas siguen pasando por RPCs autenticadas.

do $$
begin
  if not exists (
    select 1 from pg_type t join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public' and t.typname = 'calidad_batch_source'
  ) then
    create type public.calidad_batch_source as enum ('system', 'manual', 'none', 'not_found');
  end if;
end
$$;

alter table public.tms_calidad_asignaciones
  add column if not exists progress_data jsonb not null default '{}'::jsonb,
  add column if not exists progress_updated_at timestamptz,
  add column if not exists progress_updated_by uuid,
  add column if not exists locked_by uuid,
  add column if not exists locked_by_name text,
  add column if not exists locked_at timestamptz;

alter table public.tms_monitoreo_items
  add column if not exists batch_value text,
  add column if not exists batch_source public.calidad_batch_source,
  add column if not exists revision_estado text not null default 'PENDIENTE';

update public.tms_monitoreo_items
set batch_value = nullif(btrim(partida), ''),
    batch_source = case
      when nullif(btrim(partida), '') is null then 'none'::public.calidad_batch_source
      else 'system'::public.calidad_batch_source
    end
where batch_source is null;

alter table public.tms_monitoreo_items
  alter column batch_source set default 'none'::public.calidad_batch_source,
  alter column batch_source set not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.tms_calidad_asignaciones'::regclass
      and conname = 'tms_calidad_asig_locked_by_fkey'
  ) then
    alter table public.tms_calidad_asignaciones
      add constraint tms_calidad_asig_locked_by_fkey
      foreign key (locked_by) references public.tms_usuarios(id) on delete set null;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.tms_calidad_asignaciones'::regclass
      and conname = 'tms_calidad_asig_progress_by_fkey'
  ) then
    alter table public.tms_calidad_asignaciones
      add constraint tms_calidad_asig_progress_by_fkey
      foreign key (progress_updated_by) references public.tms_usuarios(id) on delete set null;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.tms_monitoreo_items'::regclass
      and conname = 'tms_monitoreo_items_revision_estado_check'
  ) then
    alter table public.tms_monitoreo_items
      add constraint tms_monitoreo_items_revision_estado_check
      check (revision_estado in ('PENDIENTE', 'APROBADO', 'RECHAZADO'));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.tms_monitoreo_items'::regclass
      and conname = 'tms_monitoreo_items_batch_consistente_check'
  ) then
    alter table public.tms_monitoreo_items
      add constraint tms_monitoreo_items_batch_consistente_check
      check (
        (batch_source in ('none', 'not_found') and batch_value is null)
        or
        (batch_source in ('system', 'manual') and nullif(btrim(batch_value), '') is not null)
      );
  end if;
end
$$;

create index if not exists idx_calidad_asig_lease_activo
  on public.tms_calidad_asignaciones (locked_at)
  where locked_by is not null and estado in ('PENDIENTE', 'EN_PROCESO');

-- Lanza un 409 real a través de PostgREST, incluyendo dueño y hora del lease.
create or replace function public._calidad_asignacion_conflicto(p_asignacion_id uuid)
returns void
language plpgsql
security definer
set search_path = 'public'
as $function$
declare
  v_asig public.tms_calidad_asignaciones;
  v_message text;
begin
  select * into v_asig
  from public.tms_calidad_asignaciones
  where id = p_asignacion_id;

  if v_asig.id is null then
    raise sqlstate 'PGRST' using
      message = jsonb_build_object(
        'code', 'QUALITY_TASK_NOT_FOUND',
        'message', 'La tarea de Calidad no existe.'
      )::text,
      detail = jsonb_build_object('status', 404, 'status_text', 'Not Found')::text;
  end if;

  if v_asig.estado not in ('PENDIENTE', 'EN_PROCESO') then
    raise sqlstate 'PGRST' using
      message = jsonb_build_object(
        'code', 'QUALITY_TASK_CLOSED',
        'message', 'La tarea ya no está disponible para edición.'
      )::text,
      detail = jsonb_build_object('status', 409, 'status_text', 'Conflict')::text;
  end if;

  v_message := format(
    'La tarea está siendo procesada por %s desde las %s. No puedes modificarla.',
    coalesce(v_asig.locked_by_name, 'otro usuario'),
    to_char(v_asig.locked_at at time zone 'America/Santiago', 'HH24:MI')
  );

  raise sqlstate 'PGRST' using
    message = jsonb_build_object(
      'code', 'QUALITY_TASK_LOCKED',
      'message', v_message,
      'locked_by_name', v_asig.locked_by_name,
      'locked_at', v_asig.locked_at
    )::text,
    detail = jsonb_build_object('status', 409, 'status_text', 'Conflict')::text;
end;
$function$;

-- Adquiere o renueva el lease. Un lease vencido (>15 min) se reemplaza
-- atómicamente; no se mantiene una transacción abierta mientras el usuario edita.
create or replace function public.tomar_asignacion_calidad(p_asignacion_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = 'public'
as $function$
declare
  v_user record;
  v_asig public.tms_calidad_asignaciones;
begin
  perform public._monitoreo_assert_permiso();

  select id, nombre into v_user
  from public.tms_usuarios
  where auth_uid = auth.uid() and activo = true;
  if v_user.id is null then raise exception 'Usuario no autenticado'; end if;

  update public.tms_calidad_asignaciones
  set locked_by = v_user.id,
      locked_by_name = v_user.nombre,
      locked_at = now(),
      estado = case when estado = 'PENDIENTE' then 'EN_PROCESO' else estado end,
      updated_at = now()
  where id = p_asignacion_id
    and estado in ('PENDIENTE', 'EN_PROCESO')
    and (
      locked_by is null
      or locked_by = v_user.id
      or locked_at is null
      or locked_at < now() - interval '15 minutes'
    )
  returning * into v_asig;

  if v_asig.id is null then
    perform public._calidad_asignacion_conflicto(p_asignacion_id);
  end if;

  return to_jsonb(v_asig) || jsonb_build_object('lock_owned', true);
end;
$function$;

-- Equivalente RPC al PATCH /api/quality/progress/{id} solicitado.
create or replace function public.guardar_progreso_asignacion_calidad(
  p_asignacion_id uuid,
  p_progress_data jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = 'public'
as $function$
declare
  v_user record;
  v_asig public.tms_calidad_asignaciones;
begin
  perform public._monitoreo_assert_permiso();
  if p_progress_data is null or jsonb_typeof(p_progress_data) <> 'object' then
    raise exception 'El progreso debe ser un objeto JSON';
  end if;
  if octet_length(p_progress_data::text) > 2097152 then
    raise exception 'El progreso excede el máximo de 2 MB';
  end if;

  select id, nombre into v_user
  from public.tms_usuarios
  where auth_uid = auth.uid() and activo = true;
  if v_user.id is null then raise exception 'Usuario no autenticado'; end if;

  update public.tms_calidad_asignaciones
  set progress_data = p_progress_data,
      progress_updated_at = now(),
      progress_updated_by = v_user.id,
      locked_by = v_user.id,
      locked_by_name = v_user.nombre,
      locked_at = now(),
      estado = case when estado = 'PENDIENTE' then 'EN_PROCESO' else estado end,
      updated_at = now()
  where id = p_asignacion_id
    and estado in ('PENDIENTE', 'EN_PROCESO')
    and (
      locked_by is null
      or locked_by = v_user.id
      or locked_at is null
      or locked_at < now() - interval '15 minutes'
    )
  returning * into v_asig;

  if v_asig.id is null then
    perform public._calidad_asignacion_conflicto(p_asignacion_id);
  end if;

  return jsonb_build_object(
    'id', v_asig.id,
    'saved_at', v_asig.progress_updated_at,
    'locked_at', v_asig.locked_at,
    'locked_by_name', v_asig.locked_by_name
  );
end;
$function$;

create or replace function public.liberar_asignacion_calidad(p_asignacion_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = 'public'
as $function$
declare
  v_user_id uuid;
begin
  perform public._monitoreo_assert_permiso();
  select id into v_user_id
  from public.tms_usuarios
  where auth_uid = auth.uid() and activo = true;

  update public.tms_calidad_asignaciones
  set locked_by = null,
      locked_by_name = null,
      locked_at = null,
      updated_at = now()
  where id = p_asignacion_id and locked_by = v_user_id;

  return jsonb_build_object('id', p_asignacion_id, 'released', found);
end;
$function$;

-- Persiste lote/origen y estado de revisión en los ítems definitivos.
create or replace function public._monitoreo_insert_items(p_informe_id uuid, p_items jsonb)
returns void
language plpgsql
set search_path = 'public'
as $function$
declare
  v_not_found_note constant text := 'Lote no encontrado en el sistema al momento de la inspección';
begin
  insert into public.tms_monitoreo_items
    (informe_id, codigo_producto, partida, batch_value, batch_source,
     ubicacion, producto, unidad_medida, cantidad, estado_inventario, tipo,
     fecha_vencimiento, semaforo, condicion_observada, motivo, observaciones,
     tipo_dano, componente_afectado, consecuencia, cantidad_afectada,
     no_registrado, revision_estado)
  select p_informe_id,
         coalesce(x.codigo_producto, ''),
         case
           when coalesce(
             x.batch_source,
             case when nullif(btrim(x.partida), '') is null
               then 'none'::public.calidad_batch_source
               else 'system'::public.calidad_batch_source
             end
           ) in ('none', 'not_found') then ''
           else coalesce(nullif(btrim(x.batch_value), ''), nullif(btrim(x.partida), ''), '')
         end,
         case
           when coalesce(
             x.batch_source,
             case when nullif(btrim(x.partida), '') is null
               then 'none'::public.calidad_batch_source
               else 'system'::public.calidad_batch_source
             end
           ) in ('none', 'not_found') then null
           else coalesce(nullif(btrim(x.batch_value), ''), nullif(btrim(x.partida), ''))
         end,
         coalesce(
           x.batch_source,
           case when nullif(btrim(x.partida), '') is null
             then 'none'::public.calidad_batch_source
             else 'system'::public.calidad_batch_source
           end
         ),
         coalesce(x.ubicacion, ''), x.producto, x.unidad_medida,
         coalesce(x.cantidad, 0), x.estado_inventario, x.tipo,
         x.fecha_vencimiento, x.semaforo, x.condicion_observada, x.motivo,
         case
           when x.batch_source = 'not_found'::public.calidad_batch_source
            and coalesce(x.observaciones, '') not ilike '%' || v_not_found_note || '%'
           then concat_ws(' · ', nullif(btrim(x.observaciones), ''), v_not_found_note)
           else x.observaciones
         end,
         x.tipo_dano, x.componente_afectado, x.consecuencia,
         x.cantidad_afectada, coalesce(x.no_registrado, false),
         coalesce(x.revision_estado, 'PENDIENTE')
  from jsonb_populate_recordset(
    null::public.tms_monitoreo_items,
    coalesce(p_items, '[]'::jsonb)
  ) x;
end;
$function$;

-- Resolver también valida el lease antes de cerrar y lo libera al finalizar.
create or replace function public.resolver_asignacion_calidad(
  p_asignacion_id uuid,
  p_informe_id uuid,
  p_estado text default 'RESUELTA'
)
returns jsonb
language plpgsql
security definer
set search_path = 'public'
as $function$
declare
  v_user record;
  v_asig public.tms_calidad_asignaciones;
  v_estado text := case when upper(coalesce(p_estado, '')) = 'EN_PROCESO'
    then 'EN_PROCESO' else 'RESUELTA' end;
begin
  perform public._monitoreo_assert_permiso();
  select id, nombre into v_user
  from public.tms_usuarios
  where auth_uid = auth.uid() and activo = true;
  if v_user.id is null then raise exception 'Usuario no autenticado'; end if;

  update public.tms_calidad_asignaciones
  set estado = v_estado,
      informe_id = coalesce(p_informe_id, informe_id),
      resuelto_por = case when v_estado = 'RESUELTA' then v_user.id else resuelto_por end,
      resuelto_nombre = case when v_estado = 'RESUELTA' then v_user.nombre else resuelto_nombre end,
      resuelto_en = case when v_estado = 'RESUELTA' then now() else resuelto_en end,
      locked_by = case when v_estado = 'RESUELTA' then null else v_user.id end,
      locked_by_name = case when v_estado = 'RESUELTA' then null else v_user.nombre end,
      locked_at = case when v_estado = 'RESUELTA' then null else now() end,
      updated_at = now()
  where id = p_asignacion_id
    and estado in ('PENDIENTE', 'EN_PROCESO')
    and (
      locked_by is null
      or locked_by = v_user.id
      or locked_at is null
      or locked_at < now() - interval '15 minutes'
    )
  returning * into v_asig;

  if v_asig.id is null then
    perform public._calidad_asignacion_conflicto(p_asignacion_id);
  end if;

  return jsonb_build_object(
    'id', p_asignacion_id,
    'estado', v_estado,
    'informe_id', p_informe_id
  );
end;
$function$;

revoke all on function public._calidad_asignacion_conflicto(uuid) from public, anon, authenticated;
revoke all on function public.tomar_asignacion_calidad(uuid) from public, anon;
revoke all on function public.guardar_progreso_asignacion_calidad(uuid, jsonb) from public, anon;
revoke all on function public.liberar_asignacion_calidad(uuid) from public, anon;
revoke all on function public.resolver_asignacion_calidad(uuid, uuid, text) from public, anon;

grant execute on function public.tomar_asignacion_calidad(uuid) to authenticated, service_role;
grant execute on function public.guardar_progreso_asignacion_calidad(uuid, jsonb) to authenticated, service_role;
grant execute on function public.liberar_asignacion_calidad(uuid) to authenticated, service_role;
grant execute on function public.resolver_asignacion_calidad(uuid, uuid, text) to authenticated, service_role;

comment on function public.guardar_progreso_asignacion_calidad(uuid, jsonb)
  is 'Autosave Hito 2; renueva lease de 15 minutos y rechaza conflictos con HTTP 409.';
