-- ============================================================================
-- 154_workflow_quality_iam_hardening.sql
-- Fase 2 de hardening IAM:
--   - Workflow Engine: lectura solo para view/manage_workflows.
--   - Calidad: helpers legacy pasan a usuario_tiene_algun_permiso(...).
--   - Calidad operativa: se cierra SELECT abierto en informes/items/tareas/asignaciones.
--   - Flags de calidad: dejan de estar abiertas a cualquier autenticado, pero
--     se mantienen visibles para módulos operativos que consumen esos badges.
-- ============================================================================

-- ── Workflow: lectura solo por permiso IAM ───────────────────────────────────
create or replace function public.can_view_workflows()
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $$
  select coalesce(private.is_admin(), false)
      or coalesce(public.usuario_tiene_algun_permiso(array['view_workflows', 'manage_workflows']), false);
$$;
revoke all on function public.can_view_workflows() from public, anon;
grant execute on function public.can_view_workflows() to authenticated, service_role;

drop policy if exists wf_def_select on public.workflow_definition;
drop policy if exists wf_state_select on public.workflow_state;
drop policy if exists wf_trans_select on public.workflow_transition;
drop policy if exists wf_hist_select on public.workflow_history;

create policy wf_def_select
on public.workflow_definition
for select to authenticated
using (public.can_view_workflows());

create policy wf_state_select
on public.workflow_state
for select to authenticated
using (public.can_view_workflows());

create policy wf_trans_select
on public.workflow_transition
for select to authenticated
using (public.can_view_workflows());

create policy wf_hist_select
on public.workflow_history
for select to authenticated
using (public.can_view_workflows());

-- ── Calidad: helpers IAM reutilizables ───────────────────────────────────────
create or replace function public.can_view_calidad_operativa()
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $$
  select coalesce(private.is_admin(), false)
      or coalesce(public.usuario_tiene_algun_permiso(array[
        'manage_quality',
        'manage_monitoreo',
        'view_acciones_calidad',
        'manage_inventory'
      ]), false);
$$;
revoke all on function public.can_view_calidad_operativa() from public, anon;
grant execute on function public.can_view_calidad_operativa() to authenticated, service_role;

create or replace function public.can_view_calidad_flags()
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $$
  select coalesce(private.is_admin(), false)
      or coalesce(public.usuario_tiene_algun_permiso(array[
        'manage_quality',
        'manage_monitoreo',
        'view_acciones_calidad',
        'manage_inventory',
        'view_locations',
        'manage_locations',
        'view_stock',
        'manage_stock',
        'view_inventario'
      ]), false);
$$;
revoke all on function public.can_view_calidad_flags() from public, anon;
grant execute on function public.can_view_calidad_flags() to authenticated, service_role;

create or replace function public.can_manage_calidad()
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $$
  select coalesce(private.is_admin(), false)
      or coalesce(public.usuario_tiene_algun_permiso(array['manage_quality', 'manage_monitoreo']), false);
$$;

create or replace function public._monitoreo_assert_permiso()
returns void
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  if not public.can_manage_calidad() then
    raise exception 'Acceso denegado: se requiere permiso de Monitoreo o Calidad';
  end if;
end;
$function$;

create or replace function public._asignacion_calidad_assert_permiso()
returns void
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  if not (
    coalesce(private.is_admin(), false)
    or coalesce(public.usuario_tiene_algun_permiso(array[
      'manage_inventory',
      'manage_monitoreo',
      'manage_quality'
    ]), false)
  ) then
    raise exception 'Acceso denegado: se requiere permiso de Inventario o Calidad';
  end if;
end;
$function$;

-- ── Calidad: SELECT deja de estar abierto para cualquier authenticated ───────
drop policy if exists monitoreo_informes_select on public.tms_monitoreo_informes;
create policy monitoreo_informes_select
on public.tms_monitoreo_informes
for select to authenticated
using (public.can_view_calidad_operativa());

drop policy if exists monitoreo_items_select on public.tms_monitoreo_items;
create policy monitoreo_items_select
on public.tms_monitoreo_items
for select to authenticated
using (public.can_view_calidad_operativa());

drop policy if exists calidad_flags_select on public.tms_calidad_flags;
create policy calidad_flags_select
on public.tms_calidad_flags
for select to authenticated
using (public.can_view_calidad_flags());

drop policy if exists calidad_tareas_select_auth on public.tms_calidad_tareas;
create policy calidad_tareas_select_auth
on public.tms_calidad_tareas
for select to authenticated
using (public.can_view_calidad_operativa());

drop policy if exists calidad_asig_select_auth on public.tms_calidad_asignaciones;
create policy calidad_asig_select_auth
on public.tms_calidad_asignaciones
for select to authenticated
using (public.can_view_calidad_operativa());

-- ── Calidad: dictamen también pasa por gate IAM y no por permisos_json ───────
drop function if exists public.monitoreo_dictaminar(uuid, text, text, text, date, text);
create or replace function public.monitoreo_dictaminar(
  p_item_id uuid,
  p_dictamen text,
  p_accion text default null,
  p_bodega_destino text default null,
  p_fecha_limite date default null,
  p_acuse text default null
) returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_user   record;
  v_item   record;
  v_estado text;
  v_sev    int;
  v_mueve  boolean := false;
begin
  if not (
    coalesce(private.is_admin(), false)
    or coalesce(public.usuario_tiene_algun_permiso(array['manage_quality']), false)
  ) then
    raise exception 'Acceso denegado: se requiere permiso de Calidad (manage_quality)';
  end if;

  select u.id, u.nombre, u.rol, u.es_admin_delegado
    into v_user
  from public.tms_usuarios u
  where u.auth_uid = auth.uid() and u.activo = true;

  if v_user.id is null then
    raise exception 'Usuario no autenticado';
  end if;

  select * into v_item from public.tms_monitoreo_items where id = p_item_id;
  if v_item.id is null then
    raise exception 'Ítem de monitoreo no encontrado';
  end if;

  case upper(p_dictamen)
    when 'LIBERAR'    then v_estado := 'LIBERADO';     v_sev := 0; v_mueve := false;
    when 'CUARENTENA' then v_estado := 'CUARENTENA';   v_sev := 2; v_mueve := true;
    when 'REPROCESO'  then v_estado := 'EN_AUDITORIA'; v_sev := 1; v_mueve := true;
    when 'RECHAZAR'   then v_estado := 'MALO';         v_sev := 3; v_mueve := true;
    when 'BAJA'       then v_estado := 'MALO';         v_sev := 3; v_mueve := true;
    else raise exception 'Dictamen inválido: %', p_dictamen;
  end case;

  update public.tms_monitoreo_items
     set dictamen = upper(p_dictamen),
         accion             = p_accion,
         bodega_destino     = p_bodega_destino,
         fecha_limite       = p_fecha_limite,
         acuse_texto        = p_acuse,
         calidad_usuario_id = v_user.id,
         calidad_nombre     = v_user.nombre,
         fecha_dictamen     = now()
   where id = p_item_id;

  insert into public.tms_calidad_flags
    (codigo_producto, partida, ubicacion, estado_calidad, severidad, item_id,
     nota, vigente, actualizado_por, actualizado_nombre)
  values
    (v_item.codigo_producto, coalesce(v_item.partida,''), coalesce(v_item.ubicacion,''),
     v_estado, v_sev, p_item_id, p_acuse, true, v_user.id, v_user.nombre)
  on conflict (codigo_producto, partida, ubicacion)
  do update set
    estado_calidad     = excluded.estado_calidad,
    severidad          = excluded.severidad,
    item_id            = excluded.item_id,
    nota               = excluded.nota,
    vigente            = true,
    actualizado_por    = excluded.actualizado_por,
    actualizado_nombre = excluded.actualizado_nombre,
    updated_at         = now();

  if v_mueve then
    insert into public.tms_notificaciones (tipo, titulo, mensaje, destinatario_rol, payload, origen)
    values (
      'MOV_TRANSITORIA',
      'Mover a transitoria: ' || v_item.codigo_producto,
      format(
        'Calidad dictaminó %s. Mover %s uds de %s (lote %s, ubic. %s) a transitoria%s.',
        upper(p_dictamen), v_item.cantidad, v_item.codigo_producto,
        coalesce(v_item.partida,'-'), coalesce(v_item.ubicacion,'-'),
        case when p_bodega_destino is not null then ' bodega ' || p_bodega_destino else '' end
      ),
      'ADMIN',
      jsonb_build_object(
        'codigo_producto', v_item.codigo_producto,
        'partida',         v_item.partida,
        'ubicacion',       v_item.ubicacion,
        'cantidad',        v_item.cantidad,
        'dictamen',        upper(p_dictamen),
        'bodega_destino',  p_bodega_destino,
        'item_id',         p_item_id
      ),
      'monitoreo_calidad'
    );
  end if;

  return jsonb_build_object(
    'ok', true,
    'estado_calidad', v_estado,
    'requiere_movimiento', v_mueve
  );
end;
$function$;
