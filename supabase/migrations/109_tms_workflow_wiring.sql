-- ============================================================================
--  109_tms_workflow_wiring.sql
--  Workflow Engine — Fase 2: cablea el dominio TMS (piloto) al motor. Cada
--  cambio de estado de una Orden de Transporte queda registrado en
--  workflow_history vía el helper _wf_registrar. NO cambia la autorización (el
--  dominio sigue validando con _tms_puede_gestionar); el motor es el LIBRO MAYOR
--  y la definición editable (workflow_transition) es el diagrama.
--
--  • _wf_registrar(workflow, entidad, desde, hasta, accion, nota): inserta en
--    workflow_history con el actor (_panel_actor). Interno: solo lo llaman otras
--    RPCs SECURITY DEFINER (corren como owner y saltan RLS).
--  • Recrea las 5 RPCs de TMS agregando el log (misma lógica y gates de antes).
--  • Completa la definición OT con las transiciones de reprogramación.
-- ============================================================================

-- ── Helper de registro (libro mayor del motor) ──────────────────────────────
create or replace function public._wf_registrar(p_workflow text, p_entidad_id text, p_desde text, p_hasta text, p_accion text, p_nota text default null)
returns void language plpgsql security definer set search_path to 'public'
as $fn$
begin
  insert into public.workflow_history (workflow, entidad_id, desde, hasta, accion, actor, nota)
  values (p_workflow, p_entidad_id, nullif(p_desde,''), p_hasta, p_accion, public._panel_actor(), p_nota);
end; $fn$;
revoke all on function public._wf_registrar(text, text, text, text, text, text) from public, anon;

-- ── Completar definición OT: reprogramación (incidencias) ───────────────────
insert into public.workflow_transition (workflow, desde, hasta, accion, permiso_id, orden) values
  ('OT', 'en_ruta',    'programado', 'reprogramar', 'manage_tms', 90),
  ('OT', 'despachado', 'programado', 'reprogramar', 'manage_tms', 91)
on conflict do nothing;

-- ── Crear orden desde N.V. (+ log 'crear') ──────────────────────────────────
create or replace function public.tms_orden_crear_desde_nv(p_oper_id bigint)
returns jsonb language plpgsql security definer set search_path to 'public'
as $function$
declare o public.tms_operaciones; r public.tms_transporte_ordenes; v_nv text;
begin
  if not public._tms_puede_gestionar() then raise exception 'No autorizado'; end if;
  select * into o from public.tms_operaciones where id = p_oper_id;
  if o.id is null then raise exception 'N.V. no encontrada'; end if;
  select * into r from public.tms_transporte_ordenes
   where oper_id = p_oper_id and estado not in ('cerrado','cancelado') limit 1;
  if r.id is not null then return jsonb_build_object('ok', true, 'id', r.id, 'folio', r.folio, 'existia', true); end if;
  v_nv := coalesce(o.nv_ptm::text, o.nv_orange, o.nv_farmapack, o.varios);
  insert into public.tms_transporte_ordenes (folio, oper_id, nv, cliente, estado, updated_by)
  values (public._tms_next_folio(), o.id, v_nv, o.cliente, 'pendiente_asignacion', public._panel_actor())
  returning * into r;
  perform public._wf_registrar('OT', r.id::text, null, 'pendiente_asignacion', 'crear', 'N.V. '||coalesce(v_nv,''));
  return jsonb_build_object('ok', true, 'id', r.id, 'folio', r.folio);
end; $function$;

-- ── Asignar (+ log 'asignar' si pasó a programado) ──────────────────────────
create or replace function public.tms_orden_asignar(p_id bigint, p jsonb)
returns jsonb language plpgsql security definer set search_path to 'public'
as $function$
declare r public.tms_transporte_ordenes; v_desde text;
begin
  if not public._tms_puede_gestionar() then raise exception 'No autorizado'; end if;
  select estado into v_desde from public.tms_transporte_ordenes where id = p_id;
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
  if v_desde = 'pendiente_asignacion' and r.estado = 'programado' then
    perform public._wf_registrar('OT', r.id::text, v_desde, r.estado, 'asignar', null);
  end if;
  return jsonb_build_object('ok', true, 'id', r.id, 'estado', r.estado);
end; $function$;

-- ── Transición (+ log con la acción del motor) ──────────────────────────────
create or replace function public.tms_orden_transicion(p_id bigint, p_estado text)
returns jsonb language plpgsql security definer set search_path to 'public'
as $function$
declare r public.tms_transporte_ordenes; v_ok boolean := false; v_desde text; v_accion text;
begin
  if not public._tms_puede_gestionar() then raise exception 'No autorizado'; end if;
  select * into r from public.tms_transporte_ordenes where id = p_id;
  if r.id is null then raise exception 'Orden no encontrada'; end if;
  v_desde := r.estado;
  v_ok := (p_estado='en_carga'  and r.estado='programado')
       or (p_estado='despachado' and r.estado='en_carga')
       or (p_estado='en_ruta'    and r.estado='despachado')
       or (p_estado='entregado'  and r.estado='en_ruta')
       or (p_estado='cerrado'    and r.estado='entregado')
       or (p_estado='programado' and r.estado='en_ruta')
       or (p_estado='cancelado'  and r.estado <> 'cerrado');
  if not v_ok then raise exception 'Transición no permitida: % → %', r.estado, p_estado; end if;
  update public.tms_transporte_ordenes set
    estado = p_estado,
    fecha_en_carga   = case when p_estado='en_carga'   then now() else fecha_en_carga end,
    fecha_despachado = case when p_estado='despachado' then now() else fecha_despachado end,
    fecha_en_ruta    = case when p_estado='en_ruta'    then now() else fecha_en_ruta end,
    fecha_entregado  = case when p_estado='entregado'  then now() else fecha_entregado end,
    updated_at = now(), updated_by = public._panel_actor()
  where id = p_id returning * into r;
  v_accion := case p_estado
    when 'en_carga' then 'marcar_en_carga' when 'despachado' then 'marcar_despachado'
    when 'en_ruta' then 'salir_a_ruta' when 'entregado' then 'registrar_pod'
    when 'cerrado' then 'cerrar' when 'cancelado' then 'cancelar'
    when 'programado' then 'reprogramar' else p_estado end;
  perform public._wf_registrar('OT', r.id::text, v_desde, p_estado, v_accion, null);
  return jsonb_build_object('ok', true, 'id', r.id, 'estado', r.estado);
end; $function$;

-- ── POD (+ log 'registrar_pod') ─────────────────────────────────────────────
create or replace function public.tms_orden_pod(p_id bigint, p jsonb)
returns jsonb language plpgsql security definer set search_path to 'public'
as $function$
declare r public.tms_transporte_ordenes;
begin
  if not public._tms_puede_gestionar() then raise exception 'No autorizado'; end if;
  update public.tms_transporte_ordenes set
    pod_foto_url     = coalesce(p->>'foto_url', pod_foto_url),
    pod_firma_url    = coalesce(p->>'firma_url', pod_firma_url),
    pod_gps          = coalesce(p->>'gps', pod_gps),
    pod_recibido_por = coalesce(p->>'recibido_por', pod_recibido_por),
    pod_hora         = now(),
    estado           = 'entregado',
    fecha_entregado  = now(),
    updated_at = now(), updated_by = public._panel_actor()
  where id = p_id and estado = 'en_ruta' returning * into r;
  if r.id is null then raise exception 'Orden no encontrada o no está En Ruta'; end if;
  if r.oper_id is not null then
    update public.tms_operaciones set estado = 'Entregado', origen = 'tms' where id = r.oper_id;
  end if;
  perform public._wf_registrar('OT', r.id::text, 'en_ruta', 'entregado', 'registrar_pod', nullif(p->>'recibido_por',''));
  return jsonb_build_object('ok', true, 'id', r.id, 'estado', r.estado);
end; $function$;

-- ── Resolver incidencia (+ log 'reprogramar' si reprograma) ─────────────────
create or replace function public.tms_incidencia_resolver(p_id bigint, p_resolucion text)
returns jsonb language plpgsql security definer set search_path to 'public'
as $function$
declare inc public.tms_transporte_incidencias; v_desde text; ro public.tms_transporte_ordenes;
begin
  if not public._tms_puede_gestionar() then raise exception 'No autorizado'; end if;
  update public.tms_transporte_incidencias
     set estado='resuelta', resolucion=p_resolucion, resuelta_at=now()
   where id=p_id returning * into inc;
  if inc.id is null then raise exception 'Incidencia no encontrada'; end if;
  if p_resolucion ilike 'reprog%' then
    select estado into v_desde from public.tms_transporte_ordenes where id = inc.orden_id;
    update public.tms_transporte_ordenes set estado='programado', updated_at=now(), updated_by=public._panel_actor()
     where id=inc.orden_id and estado in ('en_ruta','despachado') returning * into ro;
    if ro.id is not null then
      perform public._wf_registrar('OT', ro.id::text, v_desde, 'programado', 'reprogramar', 'incidencia '||coalesce(inc.tipo,''));
    end if;
  end if;
  return jsonb_build_object('ok', true, 'id', inc.id);
end; $function$;

-- Re-grants (idénticos a 104; create or replace no altera privilegios pero se
-- reafirman por claridad).
do $$
declare fn text;
begin
  foreach fn in array array[
    'tms_orden_crear_desde_nv(bigint)','tms_orden_asignar(bigint, jsonb)','tms_orden_transicion(bigint, text)',
    'tms_orden_pod(bigint, jsonb)','tms_incidencia_resolver(bigint, text)'
  ] loop
    execute format('revoke all on function public.%s from public, anon;', fn);
    execute format('grant execute on function public.%s to authenticated;', fn);
  end loop;
end $$;
