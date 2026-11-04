-- QUALITY-OFFLINE-001
-- Contrato forward-only para descargar y sincronizar trabajo de Calidad sin
-- permitir escrituras genéricas offline, efectos de stock, ERP ni IAM.
-- Esta migración no se aplica automáticamente: requiere certificación y despliegue
-- controlado en una fase posterior.

create table if not exists public.tms_calidad_offline_comandos (
  id uuid primary key default gen_random_uuid(),
  idempotency_key text not null unique,
  usuario_id uuid not null references public.tms_usuarios(id),
  hito text not null check (hito in ('HITO_1', 'HITO_2', 'HITO_3')),
  tarea_id uuid not null,
  accion text not null check (accion in ('GUARDAR', 'FINALIZAR', 'PROGRESO')),
  base_version text not null,
  payload jsonb not null default '{}'::jsonb,
  estado text not null default 'APLICADO' check (estado in ('APLICADO', 'CONFLICTO', 'RECHAZADO')),
  resultado jsonb not null default '{}'::jsonb,
  procesado_en timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists idx_calidad_offline_comandos_usuario_created
  on public.tms_calidad_offline_comandos (usuario_id, created_at desc);

alter table public.tms_calidad_offline_comandos enable row level security;
revoke all on table public.tms_calidad_offline_comandos from public, anon, authenticated;

-- La versión deriva del updated_at remoto. El cliente la descarga sin inferirla;
-- al sincronizar, cualquier cambio ajeno genera conflicto explícito.
create or replace function public.calidad_offline_version(p_id uuid, p_updated_at timestamptz)
returns text
language sql
stable
set search_path = ''
as $$
  select md5(p_id::text || ':' || coalesce(p_updated_at::text, ''));
$$;

create or replace function public.descargar_tareas_calidad_offline()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_user public.tms_usuarios;
begin
  perform public._monitoreo_assert_permiso();
  select * into v_user
  from public.tms_usuarios
  where auth_uid = auth.uid() and activo = true;
  if v_user.id is null then raise exception 'Usuario no autenticado'; end if;

  return jsonb_build_object(
    'downloaded_at', now(),
    'hito_1', coalesce((
      select jsonb_agg(to_jsonb(t) || jsonb_build_object(
        'offline_version', public.calidad_offline_version(t.id, t.updated_at)
      ) order by t.created_at desc)
      from public.tms_calidad_tareas t
      where t.tipo = 'CHECKLIST_INGRESO'
        and t.estado in ('PENDIENTE', 'EN_PROCESO')
    ), '[]'::jsonb),
    'hito_2', coalesce((
      select jsonb_agg(to_jsonb(a) || jsonb_build_object(
        'offline_version', public.calidad_offline_version(a.id, a.updated_at)
      ) order by a.created_at desc)
      from public.tms_calidad_asignaciones a
      where a.estado in ('PENDIENTE', 'EN_PROCESO')
    ), '[]'::jsonb),
    'hito_3', coalesce((
      select jsonb_agg(to_jsonb(t) || jsonb_build_object(
        'offline_version', public.calidad_offline_version(t.id, t.updated_at)
      ) order by t.created_at desc)
      from public.tms_calidad_tareas t
      where t.tipo = 'CERTIFICADO_SALIDA'
        and t.estado in ('PENDIENTE', 'EN_PROCESO')
    ), '[]'::jsonb)
  );
end;
$function$;

create or replace function public.sincronizar_calidad_offline(p_comandos jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_user public.tms_usuarios;
  v_command jsonb;
  v_key text;
  v_hito text;
  v_action text;
  v_task_id uuid;
  v_base_version text;
  v_payload jsonb;
  v_existing public.tms_calidad_offline_comandos;
  v_task public.tms_calidad_tareas;
  v_assignment public.tms_calidad_asignaciones;
  v_result jsonb;
  v_results jsonb := '[]'::jsonb;
begin
  perform public._monitoreo_assert_permiso();
  if p_comandos is null or jsonb_typeof(p_comandos) <> 'array' then
    raise exception 'Los comandos offline deben ser un arreglo JSON';
  end if;
  if jsonb_array_length(p_comandos) > 25 then
    raise exception 'Máximo 25 comandos por sincronización';
  end if;

  select * into v_user
  from public.tms_usuarios
  where auth_uid = auth.uid() and activo = true;
  if v_user.id is null then raise exception 'Usuario no autenticado'; end if;

  for v_command in select value from jsonb_array_elements(p_comandos)
  loop
    v_key := nullif(btrim(v_command->>'idempotency_key'), '');
    v_hito := upper(coalesce(v_command->>'hito', ''));
    v_action := upper(coalesce(v_command->>'accion', ''));
    v_task_id := nullif(v_command->>'tarea_id', '')::uuid;
    v_base_version := nullif(v_command->>'base_version', '');
    v_payload := coalesce(v_command->'payload', '{}'::jsonb);

    if v_key is null or v_task_id is null or v_base_version is null
      or v_hito not in ('HITO_1', 'HITO_2', 'HITO_3')
      or v_action not in ('GUARDAR', 'FINALIZAR', 'PROGRESO') then
      raise exception 'Comando offline inválido';
    end if;

    select * into v_existing
    from public.tms_calidad_offline_comandos
    where idempotency_key = v_key;

    if v_existing.id is not null then
      if v_existing.usuario_id <> v_user.id then
        raise exception 'Clave de sincronización no pertenece al usuario actual';
      end if;
      v_results := v_results || jsonb_build_array(v_existing.resultado || jsonb_build_object(
        'idempotency_key', v_key,
        'idempotent_replay', true,
        'estado_sync', v_existing.estado
      ));
      continue;
    end if;

    begin
      if v_hito in ('HITO_1', 'HITO_3') then
        select * into v_task from public.tms_calidad_tareas where id = v_task_id for update;
        if v_task.id is null
          or (v_hito = 'HITO_1' and v_task.tipo <> 'CHECKLIST_INGRESO')
          or (v_hito = 'HITO_3' and v_task.tipo <> 'CERTIFICADO_SALIDA') then
          raise exception 'La tarea offline ya no está disponible';
        end if;
        if public.calidad_offline_version(v_task.id, v_task.updated_at) <> v_base_version then
          raise exception 'QUALITY_OFFLINE_CONFLICT';
        end if;

        v_result := public.guardar_checklist_ingreso(
          v_task_id,
          coalesce(v_payload->'checklist', '{}'::jsonb),
          nullif(v_payload->>'observaciones', ''),
          coalesce((v_payload->>'finalizar')::boolean, false),
          nullif(v_payload->>'resultado', ''),
          nullif(v_payload->>'disposicion', '')
        );
      else
        select * into v_assignment from public.tms_calidad_asignaciones where id = v_task_id for update;
        if v_assignment.id is null or v_assignment.estado not in ('PENDIENTE', 'EN_PROCESO') then
          raise exception 'La asignación offline ya no está disponible';
        end if;
        if public.calidad_offline_version(v_assignment.id, v_assignment.updated_at) <> v_base_version then
          raise exception 'QUALITY_OFFLINE_CONFLICT';
        end if;

        if v_action = 'PROGRESO' then
          v_result := public.guardar_progreso_asignacion_calidad(
            v_task_id,
            coalesce(v_payload->'progress_data', '{}'::jsonb)
          );
        elsif v_action in ('GUARDAR', 'FINALIZAR') then
          v_result := public.crear_informe_monitoreo_asignacion(
            v_task_id,
            coalesce(v_payload->'cabecera', '{}'::jsonb),
            coalesce(v_payload->'items', '[]'::jsonb)
          );
        end if;
      end if;

      insert into public.tms_calidad_offline_comandos
        (idempotency_key, usuario_id, hito, tarea_id, accion, base_version, payload, estado, resultado)
      values
        (v_key, v_user.id, v_hito, v_task_id, v_action, v_base_version, v_payload, 'APLICADO', v_result);
      v_results := v_results || jsonb_build_array(v_result || jsonb_build_object(
        'idempotency_key', v_key,
        'estado_sync', 'APLICADO'
      ));
    exception when others then
      if sqlerrm = 'QUALITY_OFFLINE_CONFLICT' then
        v_result := jsonb_build_object(
          'idempotency_key', v_key,
          'estado_sync', 'CONFLICTO',
          'message', 'La tarea cambió en el servidor. Revisa antes de volver a sincronizar.'
        );
        insert into public.tms_calidad_offline_comandos
          (idempotency_key, usuario_id, hito, tarea_id, accion, base_version, payload, estado, resultado)
        values
          (v_key, v_user.id, v_hito, v_task_id, v_action, v_base_version, v_payload, 'CONFLICTO', v_result);
        v_results := v_results || jsonb_build_array(v_result);
      else
        v_result := jsonb_build_object(
          'idempotency_key', v_key,
          'estado_sync', 'RECHAZADO',
          'message', left(sqlerrm, 500)
        );
        insert into public.tms_calidad_offline_comandos
          (idempotency_key, usuario_id, hito, tarea_id, accion, base_version, payload, estado, resultado)
        values
          (v_key, v_user.id, v_hito, v_task_id, v_action, v_base_version, v_payload, 'RECHAZADO', v_result);
        v_results := v_results || jsonb_build_array(v_result);
      end if;
    end;
  end loop;

  return jsonb_build_object('results', v_results);
end;
$function$;

revoke all on function public.calidad_offline_version(uuid, timestamptz) from public, anon, authenticated;
revoke all on function public.descargar_tareas_calidad_offline() from public, anon;
revoke all on function public.sincronizar_calidad_offline(jsonb) from public, anon;
grant execute on function public.descargar_tareas_calidad_offline() to authenticated;
grant execute on function public.sincronizar_calidad_offline(jsonb) to authenticated;

comment on table public.tms_calidad_offline_comandos is
  'Auditoría e idempotencia de sincronización offline de Calidad. No afecta stock, ERP, IAM ni notificaciones por sí misma.';
