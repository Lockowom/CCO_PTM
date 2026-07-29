-- ============================================================================
-- 168_fix_runtime_permissions_presence_and_dates.sql
-- Repara drift remoto de grants/cron y sanea casts de fecha vacia en Monitoreo.
-- ============================================================================

-- ── Presencia: grants + RLS explícitos para authenticated ───────────────────
alter table public.tms_usuarios_activos enable row level security;

drop policy if exists auth_all_usuarios_activos on public.tms_usuarios_activos;
create policy auth_all_usuarios_activos
  on public.tms_usuarios_activos
  for all
  to authenticated
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

revoke all on public.tms_usuarios_activos from public, anon;
grant select, insert, update, delete on public.tms_usuarios_activos to authenticated, service_role;

-- ── Regrants idempotentes para RPCs / helpers calientes ─────────────────────
create or replace function public.is_admin()
returns boolean
language sql
stable
set search_path to 'public'
as $function$
  select private.is_admin()
$function$;

revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated, service_role;

revoke all on function public.usuario_tiene_algun_permiso(text[]) from public, anon;
grant execute on function public.usuario_tiene_algun_permiso(text[]) to authenticated, service_role;

revoke all on function public.log_client_event(jsonb) from public, anon;
grant execute on function public.log_client_event(jsonb) to authenticated, service_role;

revoke all on function public.mis_notificaciones() from public, anon;
grant execute on function public.mis_notificaciones() to authenticated, service_role;

revoke all on function public.marcar_notificacion_leida(bigint) from public, anon;
grant execute on function public.marcar_notificacion_leida(bigint) to authenticated, service_role;

revoke all on function public.marcar_todas_leidas() from public, anon;
grant execute on function public.marcar_todas_leidas() to authenticated, service_role;

revoke all on function public.iam_catalogo_scope() from public, anon;
grant execute on function public.iam_catalogo_scope() to authenticated, service_role;

revoke all on function public.iam_asignaciones(uuid) from public, anon;
grant execute on function public.iam_asignaciones(uuid) to authenticated, service_role;

-- ── Corrige job de limpieza de presencia (la columna correcta es ultima_actividad)
create extension if not exists pg_cron;

do $$
begin
  if exists (select 1 from cron.job where jobname = 'cleanup-presencia-stale') then
    perform cron.unschedule('cleanup-presencia-stale');
  end if;

  perform cron.schedule(
    'cleanup-presencia-stale',
    '0 */6 * * *',
    'delete from public.tms_usuarios_activos
      where ultima_actividad < now() - interval ''24 hours'''
  );
exception
  when others then
    raise notice 'No se pudo reprogramar cleanup-presencia-stale: %', sqlerrm;
end;
$$;

-- ── Monitoreo: no castear strings vacíos a date/timestamptz/uuid ────────────
create or replace function public.crear_informe_monitoreo(p_cabecera jsonb, p_items jsonb)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_year   text := to_char(current_date, 'YYYY');
  v_max    int;
  v_numero text;
  v_informe tms_monitoreo_informes;
begin
  perform public._monitoreo_assert_permiso();

  perform pg_advisory_xact_lock(hashtext('monitoreo_numero'));
  select coalesce(max((regexp_replace(numero, '^MON-\d{4}-', ''))::int), 0)
    into v_max
  from tms_monitoreo_informes
  where numero like 'MON-' || v_year || '-%';
  v_numero := 'MON-' || v_year || '-' || lpad((v_max + 1)::text, 4, '0');

  insert into tms_monitoreo_informes
    (numero, fecha, analista_id, analista_nombre, bodega, periodicidad,
     periodo_desde, periodo_hasta, estado, total_items, observaciones,
     tipo_informe, reporte)
  values (
    v_numero,
    coalesce(nullif(p_cabecera->>'fecha', '')::date, current_date),
    nullif(p_cabecera->>'analista_id', '')::uuid,
    p_cabecera->>'analista_nombre',
    p_cabecera->>'bodega',
    coalesce(nullif(p_cabecera->>'periodicidad', ''), 'ADHOC'),
    nullif(p_cabecera->>'periodo_desde', '')::date,
    nullif(p_cabecera->>'periodo_hasta', '')::date,
    coalesce(nullif(p_cabecera->>'estado', ''), 'BORRADOR'),
    coalesce(jsonb_array_length(p_items), 0),
    nullif(p_cabecera->>'observaciones', ''),
    coalesce(nullif(p_cabecera->>'tipo_informe', ''), 'MONITOREO'),
    case when p_cabecera ? 'reporte' then p_cabecera->'reporte' else null end
  )
  returning * into v_informe;

  perform public._monitoreo_insert_items(v_informe.id, p_items);

  return to_jsonb(v_informe);
end;
$function$;

create or replace function public.actualizar_informe_monitoreo(p_informe_id uuid, p_cabecera jsonb, p_items jsonb)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_old jsonb;
  r     record;
  nk    text;
  dic   jsonb;
begin
  perform public._monitoreo_assert_permiso();

  update tms_monitoreo_informes set
    bodega        = case when p_cabecera ? 'bodega'        then p_cabecera->>'bodega'        else bodega end,
    periodicidad  = coalesce(nullif(p_cabecera->>'periodicidad', ''), periodicidad),
    estado        = coalesce(nullif(p_cabecera->>'estado', ''), estado),
    observaciones = case when p_cabecera ? 'observaciones' then nullif(p_cabecera->>'observaciones', '') else observaciones end,
    reporte       = case when p_cabecera ? 'reporte'       then p_cabecera->'reporte'         else reporte end,
    total_items   = coalesce(jsonb_array_length(p_items), 0),
    updated_at    = now()
  where id = p_informe_id;

  if not found then
    raise exception 'Informe % no encontrado', p_informe_id;
  end if;

  select coalesce(jsonb_object_agg(k, v), '{}'::jsonb) into v_old
  from (
    select (codigo_producto || '|' || coalesce(partida,'') || '|' || coalesce(ubicacion,'')) as k,
           jsonb_build_object(
             'id', id, 'dictamen', dictamen, 'accion', accion,
             'bodega_destino', bodega_destino, 'fecha_limite', fecha_limite,
             'calidad_usuario_id', calidad_usuario_id, 'calidad_nombre', calidad_nombre,
             'fecha_dictamen', fecha_dictamen, 'acuse_texto', acuse_texto,
             'evidencia_url', evidencia_url) as v
    from tms_monitoreo_items
    where informe_id = p_informe_id and dictamen is not null
  ) t;

  delete from tms_monitoreo_items where informe_id = p_informe_id;
  perform public._monitoreo_insert_items(p_informe_id, p_items);

  if v_old <> '{}'::jsonb then
    for r in
      select id, codigo_producto, partida, ubicacion
      from tms_monitoreo_items
      where informe_id = p_informe_id
    loop
      nk := r.codigo_producto || '|' || coalesce(r.partida,'') || '|' || coalesce(r.ubicacion,'');
      if v_old ? nk then
        dic := v_old -> nk;
        update tms_monitoreo_items set
          dictamen           = dic->>'dictamen',
          accion             = dic->>'accion',
          bodega_destino     = dic->>'bodega_destino',
          fecha_limite       = nullif(dic->>'fecha_limite', '')::date,
          calidad_usuario_id = nullif(dic->>'calidad_usuario_id', '')::uuid,
          calidad_nombre     = dic->>'calidad_nombre',
          fecha_dictamen     = nullif(dic->>'fecha_dictamen', '')::timestamptz,
          acuse_texto        = dic->>'acuse_texto',
          evidencia_url      = dic->>'evidencia_url'
        where id = r.id;

        update tms_calidad_flags
        set item_id = r.id
        where item_id = nullif(dic->>'id', '')::uuid;
      end if;
    end loop;

    update tms_calidad_flags f
    set item_id = null
    where f.item_id = any (select nullif(value->>'id', '')::uuid from jsonb_each(v_old))
      and not exists (select 1 from tms_monitoreo_items i where i.id = f.item_id);
  end if;

  return jsonb_build_object('id', p_informe_id);
end;
$function$;

revoke execute on function public.crear_informe_monitoreo(jsonb, jsonb) from public, anon;
revoke execute on function public.actualizar_informe_monitoreo(uuid, jsonb, jsonb) from public, anon;
grant execute on function public.crear_informe_monitoreo(jsonb, jsonb) to authenticated, service_role;
grant execute on function public.actualizar_informe_monitoreo(uuid, jsonb, jsonb) to authenticated, service_role;
