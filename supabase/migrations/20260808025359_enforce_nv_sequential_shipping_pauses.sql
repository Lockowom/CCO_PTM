-- Flujo N.V. estricto, pausas controladas de Shipping e incidencia post-entrega.
-- Estados principales permitidos: En Proceso -> Shipping -> En Ruta -> Entregado.

alter table public.tms_operaciones
  add column if not exists shipping_subestado text,
  add column if not exists shipping_pausa_desde timestamptz,
  add column if not exists shipping_pausa_hasta timestamptz,
  add column if not exists shipping_pausa_motivo text,
  add column if not exists shipping_pausa_total_segundos bigint not null default 0,
  add column if not exists shipping_pausa_elegible_sla boolean not null default false,
  add column if not exists incidencia_area text,
  add column if not exists incidencia_origen text,
  add column if not exists incidencia_reportada_at timestamptz,
  add column if not exists incidencia_reportada_por uuid references public.tms_usuarios(id);

alter table public.tms_operaciones
  drop constraint if exists tms_operaciones_shipping_subestado_check;
alter table public.tms_operaciones
  add constraint tms_operaciones_shipping_subestado_check
  check (shipping_subestado is null or shipping_subestado in ('REZAGADA_COMERCIAL', 'RETIRO_CLIENTE'));

alter table public.tms_operaciones
  drop constraint if exists tms_operaciones_shipping_pausa_estado_check;
alter table public.tms_operaciones
  add constraint tms_operaciones_shipping_pausa_estado_check
  check (shipping_subestado is null or estado = 'Shipping');

create index if not exists ix_tms_oper_shipping_pausa_activa
  on public.tms_operaciones (shipping_subestado, fecha_estado desc)
  where shipping_subestado is not null;

create index if not exists ix_tms_oper_incidencia_area_activa
  on public.tms_operaciones (incidencia_area, estado_incidencia, fecha_estado desc)
  where incidencia is not null;

create or replace function public.nv_siguiente_estado(p_estado text)
returns text
language sql
immutable
set search_path = public
as $$
  select case public.tms_operaciones_norm_estado(p_estado)
    when 'En Proceso' then 'Shipping'
    when 'Shipping' then 'En Ruta'
    when 'Currier' then 'Entregado'
    when 'En Ruta' then 'Entregado'
    else null
  end
$$;

create or replace function public.nv_transicion_secuencial_valida(p_desde text, p_hasta text)
returns boolean
language sql
immutable
set search_path = public
as $$
  select public.tms_operaciones_norm_estado(p_hasta)
         is not distinct from public.nv_siguiente_estado(p_desde)
$$;

-- Sustituye el control historico "suave" por un control estricto. El rol admin
-- conserva autorizacion funcional, pero no puede saltarse la secuencia.
create or replace function authz.can_change_operacion_estado_row(
  p_row jsonb,
  p_hasta text default null
) returns boolean
language plpgsql
stable
security definer
set search_path = iam, authz, public
as $$
declare
  v_ccosto text := nullif(btrim(coalesce(p_row->>'centro_costo', '')), '');
  v_desde text := public.tms_operaciones_norm_estado(nullif(btrim(coalesce(p_row->>'estado', '')), ''));
  v_hasta text := public.tms_operaciones_norm_estado(nullif(btrim(coalesce(p_hasta, '')), ''));
  v_autorizado boolean;
begin
  v_autorizado :=
    coalesce(private.is_admin(), false)
    or (
      coalesce(public.usuario_tiene_algun_permiso(array['manage_panel']), false)
      and authz.can_any_on_scope(array['manage_panel'], 'centro_costo', v_ccosto)
    );

  if not v_autorizado then
    return false;
  end if;

  if v_hasta is null or v_hasta is not distinct from v_desde then
    return true;
  end if;

  if nullif(p_row->>'shipping_subestado', '') is not null then
    return false;
  end if;

  return public.nv_transicion_secuencial_valida(v_desde, v_hasta);
end;
$$;

-- Fuente final de verdad. Se aplica a toda escritura CCO, incluidos RPCs que
-- intenten actualizar estado de forma indirecta. Las cargas historicas/sync con
-- origen distinto de cco conservan su semantica de importacion.
create or replace function public.tms_operaciones_before_write()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_cambio_estado boolean := false;
  v_reapertura_aprobada boolean := false;
begin
  new.estado := public.tms_operaciones_norm_estado(new.estado);
  new.updated_at := now();

  if tg_op = 'INSERT' then
    if new.origen = 'cco' then
      new.estado := 'En Proceso';
      v_cambio_estado := true;
    end if;
    if new.fecha_estado is null then new.fecha_estado := now(); end if;
  else
    v_cambio_estado := new.estado is distinct from old.estado;
    v_reapertura_aprobada :=
      old.estado = 'Entregado'
      and new.estado = 'En Proceso'
      and new.reabierta
      and new.fecha_reapertura is not null
      and new.reapertura_aprobada_por is not null;

    if v_cambio_estado
       and new.origen = 'cco'
       and current_setting('app.nv_workflow_migration', true) is distinct from 'on'
       and not v_reapertura_aprobada
       and not public.nv_transicion_secuencial_valida(old.estado, new.estado) then
      raise exception using
        errcode = '23514',
        message = format(
          'Transicion N.V. bloqueada: %s -> %s. El siguiente estado permitido es %s.',
          coalesce(old.estado, 'Sin estado'),
          coalesce(new.estado, 'Sin estado'),
          coalesce(public.nv_siguiente_estado(old.estado), 'ninguno')
        );
    end if;

    if v_cambio_estado and old.shipping_subestado is not null then
      raise exception using
        errcode = '23514',
        message = 'La N.V. esta pausada en Shipping. Reactivala antes de avanzar a En Ruta.';
    end if;

    if v_cambio_estado
       and current_setting('app.nv_workflow_migration', true) is distinct from 'on' then
      new.fecha_estado := now();
    end if;
  end if;

  if v_cambio_estado then
    if new.estado = 'En Proceso' and new.fecha_en_proceso is null then new.fecha_en_proceso := current_date; end if;
    if new.estado = 'Shipping' and new.fecha_shipping is null then new.fecha_shipping := current_date; end if;
    if new.estado = 'En Ruta' and new.fecha_en_ruta is null then new.fecha_en_ruta := current_date; end if;
    if new.estado = 'Entregado' and new.fecha_entregado is null then new.fecha_entregado := current_date; end if;
  end if;

  return new;
end;
$$;

-- Canoniza estados legacy sin falsear la fecha historica disponible.
select set_config('app.nv_workflow_migration', 'on', true);

update public.tms_operaciones
set estado = 'Shipping',
    shipping_subestado = 'REZAGADA_COMERCIAL',
    shipping_pausa_desde = coalesce(fecha_estado, updated_at, now()),
    shipping_pausa_motivo = coalesce(shipping_pausa_motivo, 'Migrado desde P / VENDEDOR'),
    shipping_pausa_elegible_sla = case
      when fecha_compromiso is not null then coalesce(fecha_estado, updated_at, now()) < (fecha_compromiso::timestamptz + interval '1 day')
      when coalesce(fecha_aprobacion_real, fecha_aprobacion) is not null then coalesce(fecha_estado, updated_at, now()) < (coalesce(fecha_aprobacion_real, fecha_aprobacion)::timestamptz + interval '48 hours')
      else false
    end,
    fecha_shipping = coalesce(fecha_shipping, fecha_estado::date, updated_at::date)
where estado = 'P / VENDEDOR';

update public.tms_operaciones
set estado = 'Shipping',
    shipping_subestado = 'RETIRO_CLIENTE',
    shipping_pausa_desde = coalesce(fecha_estado, updated_at, now()),
    shipping_pausa_motivo = coalesce(shipping_pausa_motivo, 'Migrado desde P / RETIRO'),
    shipping_pausa_elegible_sla = case
      when fecha_compromiso is not null then coalesce(fecha_estado, updated_at, now()) < (fecha_compromiso::timestamptz + interval '1 day')
      when coalesce(fecha_aprobacion_real, fecha_aprobacion) is not null then coalesce(fecha_estado, updated_at, now()) < (coalesce(fecha_aprobacion_real, fecha_aprobacion)::timestamptz + interval '48 hours')
      else false
    end,
    fecha_shipping = coalesce(fecha_shipping, fecha_estado::date, updated_at::date)
where estado = 'P / RETIRO';

update public.tms_operaciones
set estado = 'En Proceso',
    fecha_en_proceso = coalesce(fecha_en_proceso, fecha_estado::date, updated_at::date)
where estado = 'P / STOCK';

update public.tms_operaciones
set estado = 'En Ruta',
    fecha_en_ruta = coalesce(fecha_en_ruta, fecha_estado::date, fecha_despacho, updated_at::date)
where estado = 'Currier';

select set_config('app.nv_workflow_migration', 'off', true);

-- Workflow declarativo alineado con la regla real.
delete from public.workflow_transition where workflow = 'NV';
insert into public.workflow_transition (workflow, desde, hasta, accion, permiso_id, orden) values
  ('NV', null, 'En Proceso', 'crear', 'manage_panel', 10),
  ('NV', 'En Proceso', 'Shipping', 'avanzar', 'manage_panel', 20),
  ('NV', 'Shipping', 'En Ruta', 'avanzar', 'manage_panel', 30),
  ('NV', 'En Ruta', 'Entregado', 'avanzar', 'manage_panel', 40)
on conflict do nothing;

delete from public.workflow_state
where workflow = 'NV' and codigo in ('P / VENDEDOR', 'P / STOCK', 'P / RETIRO', 'Currier');

update public.tms_operaciones_estado_cat
set activo = false
where estado in ('P / VENDEDOR', 'P / STOCK', 'P / RETIRO', 'Currier');

update public.tms_operaciones_estado_cat
set activo = true
where estado in ('En Proceso', 'Shipping', 'En Ruta', 'Entregado');

-- Cambio rapido con mensaje de negocio claro antes de llegar al trigger.
create or replace function public.cambiar_estado_nv(p_id bigint, p_estado text, p_urgente boolean default null)
returns jsonb
language plpgsql
security definer
set search_path = public, authz
as $$
declare
  r public.tms_operaciones;
  v_desde text;
  v_hasta text := public.tms_operaciones_norm_estado(p_estado);
begin
  if not public._panel_puede_escribir() then raise exception 'No autorizado'; end if;

  select * into r from public.tms_operaciones where id = p_id for update;
  if r.id is null then raise exception 'N.V. no encontrada'; end if;

  if coalesce(r.estado, '') = 'Entregado' then
    return jsonb_build_object('ok', false, 'locked', true, 'message', 'La N.V. esta entregada. Solicita reapertura o reporta una incidencia de armado.');
  end if;

  if r.shipping_subestado is not null then
    return jsonb_build_object('ok', false, 'paused', true, 'message', 'Reactiva la N.V. en Shipping antes de avanzar a En Ruta.');
  end if;

  if not authz.can_change_operacion_estado_row(to_jsonb(r), v_hasta) then
    return jsonb_build_object(
      'ok', false,
      'forbidden', true,
      'message', format('No se permite saltar etapas. Desde %s solo puedes avanzar a %s.', r.estado, coalesce(public.nv_siguiente_estado(r.estado), 'ningun estado'))
    );
  end if;

  v_desde := r.estado;
  update public.tms_operaciones
  set estado = v_hasta,
      urgente = coalesce(p_urgente, urgente),
      origen = 'cco'
  where id = p_id
  returning * into r;

  insert into public.tms_operaciones_log (oper_id, accion, nv, despues)
  values (r.id, 'estado', coalesce(r.nv_ptm::text, r.nv_orange, r.nv_farmapack, r.varios),
          jsonb_build_object('desde', v_desde, 'estado', r.estado, 'urgente', r.urgente));
  perform public._nv_wf_log(r.id, v_desde, r.estado);

  return jsonb_build_object('ok', true, 'id', r.id, 'estado', r.estado, 'siguiente_estado', public.nv_siguiente_estado(r.estado));
end;
$$;

create or replace function public.gestionar_pausa_shipping_nv(
  p_id bigint,
  p_subestado text default null,
  p_motivo text default null
) returns jsonb
language plpgsql
security definer
set search_path = public, authz
as $$
declare
  r public.tms_operaciones;
  v_subestado text := nullif(upper(btrim(coalesce(p_subestado, ''))), '');
  v_motivo text := nullif(btrim(coalesce(p_motivo, '')), '');
  v_limite timestamptz;
  v_elegible boolean := false;
  v_segundos bigint := 0;
begin
  if not public._panel_puede_escribir() then raise exception 'No autorizado'; end if;
  if v_subestado is not null and v_subestado not in ('REZAGADA_COMERCIAL', 'RETIRO_CLIENTE') then
    return jsonb_build_object('ok', false, 'message', 'Subestado Shipping no valido.');
  end if;

  select * into r from public.tms_operaciones where id = p_id for update;
  if r.id is null then raise exception 'N.V. no encontrada'; end if;
  if not authz.can_change_operacion_estado_row(to_jsonb(r), r.estado) then
    return jsonb_build_object('ok', false, 'forbidden', true, 'message', 'No tienes permisos para gestionar esta N.V.');
  end if;
  if r.estado <> 'Shipping' then
    return jsonb_build_object('ok', false, 'message', 'Los subestados solo se pueden aplicar mientras la N.V. esta en Shipping.');
  end if;

  if v_subestado is null then
    if r.shipping_subestado is null then
      return jsonb_build_object('ok', true, 'id', r.id, 'estado', r.estado, 'shipping_subestado', null, 'message', 'La N.V. ya estaba activa.');
    end if;
    if r.shipping_pausa_elegible_sla and r.shipping_pausa_desde is not null then
      v_segundos := greatest(0, extract(epoch from (now() - r.shipping_pausa_desde))::bigint);
    end if;

    update public.tms_operaciones
    set shipping_pausa_total_segundos = shipping_pausa_total_segundos + v_segundos,
        shipping_pausa_hasta = now(),
        shipping_subestado = null,
        shipping_pausa_desde = null,
        shipping_pausa_motivo = coalesce(v_motivo, shipping_pausa_motivo),
        shipping_pausa_elegible_sla = false,
        origen = 'cco'
    where id = p_id
    returning * into r;

    insert into public.tms_operaciones_log (oper_id, accion, nv, despues)
    values (r.id, 'shipping_resume', coalesce(r.nv_ptm::text, r.nv_orange, r.nv_farmapack, r.varios),
            jsonb_build_object('segundos_sla_pausados', v_segundos, 'pausa_total_segundos', r.shipping_pausa_total_segundos, 'motivo', v_motivo));
    return jsonb_build_object('ok', true, 'id', r.id, 'estado', r.estado, 'shipping_subestado', null, 'shipping_pausa_total_segundos', r.shipping_pausa_total_segundos, 'message', 'N.V. reactivada. Ya puede avanzar a En Ruta.');
  end if;

  if v_motivo is null then
    return jsonb_build_object('ok', false, 'message', 'Debes indicar el motivo de la pausa Shipping.');
  end if;

  if r.fecha_compromiso is not null then
    v_limite := r.fecha_compromiso::timestamptz + interval '1 day';
  elsif coalesce(r.fecha_aprobacion_real, r.fecha_aprobacion) is not null then
    v_limite := coalesce(r.fecha_aprobacion_real, r.fecha_aprobacion)::timestamptz + interval '48 hours';
  end if;
  v_elegible := v_limite is not null and now() < v_limite;

  update public.tms_operaciones
  set shipping_subestado = v_subestado,
      shipping_pausa_desde = case when shipping_subestado is null then now() else shipping_pausa_desde end,
      shipping_pausa_hasta = null,
      shipping_pausa_motivo = v_motivo,
      shipping_pausa_elegible_sla = case when shipping_subestado is null then v_elegible else shipping_pausa_elegible_sla end,
      origen = 'cco'
  where id = p_id
  returning * into r;

  insert into public.tms_operaciones_log (oper_id, accion, nv, despues)
  values (r.id, 'shipping_pause', coalesce(r.nv_ptm::text, r.nv_orange, r.nv_farmapack, r.varios),
          jsonb_build_object('shipping_subestado', r.shipping_subestado, 'motivo', r.shipping_pausa_motivo, 'elegible_sla', r.shipping_pausa_elegible_sla, 'desde', r.shipping_pausa_desde));

  return jsonb_build_object(
    'ok', true,
    'id', r.id,
    'estado', r.estado,
    'shipping_subestado', r.shipping_subestado,
    'shipping_pausa_desde', r.shipping_pausa_desde,
    'shipping_pausa_elegible_sla', r.shipping_pausa_elegible_sla,
    'message', case when r.shipping_pausa_elegible_sla then 'N.V. pausada y excluida temporalmente del SLA/OTIF.' else 'N.V. pausada. El atraso previo se conserva en los indicadores.' end
  );
end;
$$;

create or replace function public.reportar_incidencia_armado_nv(p_id bigint, p_observacion text)
returns jsonb
language plpgsql
security definer
set search_path = public, authz
as $$
declare
  r public.tms_operaciones;
  v_user record;
  v_obs text := nullif(btrim(coalesce(p_observacion, '')), '');
begin
  if not public._panel_puede_escribir() then raise exception 'No autorizado'; end if;
  if v_obs is null then
    return jsonb_build_object('ok', false, 'message', 'Describe el problema detectado en el armado.');
  end if;

  select * into r from public.tms_operaciones where id = p_id for update;
  if r.id is null then raise exception 'N.V. no encontrada'; end if;
  if r.estado <> 'Entregado' then
    return jsonb_build_object('ok', false, 'message', 'Esta incidencia post-entrega solo aplica a N.V. entregadas.');
  end if;
  if not authz.can_change_operacion_estado_row(to_jsonb(r), r.estado) then
    return jsonb_build_object('ok', false, 'forbidden', true, 'message', 'No tienes permisos para gestionar esta N.V.');
  end if;

  select * into v_user from public._panel_usuario_actual();
  update public.tms_operaciones
  set incidencia = 'PROBLEMA DE ARMADO',
      estado_incidencia = 'ABIERTA',
      observaciones_incidencia = v_obs,
      incidencia_area = 'BODEGA',
      incidencia_origen = 'POST_ENTREGA',
      incidencia_reportada_at = now(),
      incidencia_reportada_por = v_user.id,
      origen = 'cco'
  where id = p_id
  returning * into r;

  insert into public.tms_operaciones_log (oper_id, accion, nv, despues)
  values (r.id, 'post_delivery_warehouse_incident', coalesce(r.nv_ptm::text, r.nv_orange, r.nv_farmapack, r.varios),
          jsonb_build_object('incidencia', r.incidencia, 'area', r.incidencia_area, 'estado_incidencia', r.estado_incidencia, 'observacion', v_obs));
  insert into public.workflow_history (workflow, entidad_id, desde, hasta, accion, actor, nota)
  values ('NV', r.id::text, r.estado, r.estado, 'reportar_incidencia_bodega', public._panel_actor(), v_obs);

  return jsonb_build_object('ok', true, 'id', r.id, 'incidencia', r.incidencia, 'area', r.incidencia_area, 'message', 'Incidencia asignada a Bodega sin alterar el estado Entregado.');
end;
$$;

-- Agrega los campos al final de la vista sin alterar el contrato existente.
create or replace view public.tms_operaciones_vigentes
with (security_invoker = true)
as
with ranked as (
  select
    o.*,
    case
      when o.nv_ptm is not null then 'ptm:' || o.nv_ptm::text
      when nullif(btrim(coalesce(o.nv_orange, '')), '') is not null then 'orange:' || lower(btrim(o.nv_orange))
      when nullif(btrim(coalesce(o.nv_farmapack, '')), '') is not null then 'farmapack:' || lower(btrim(o.nv_farmapack))
      when nullif(btrim(coalesce(o.varios, '')), '') is not null then 'varios:' || lower(btrim(o.varios))
      else 'row:' || o.id::text
    end as nv_key,
    row_number() over (
      partition by case
        when o.nv_ptm is not null then 'ptm:' || o.nv_ptm::text
        when nullif(btrim(coalesce(o.nv_orange, '')), '') is not null then 'orange:' || lower(btrim(o.nv_orange))
        when nullif(btrim(coalesce(o.nv_farmapack, '')), '') is not null then 'farmapack:' || lower(btrim(o.nv_farmapack))
        when nullif(btrim(coalesce(o.varios, '')), '') is not null then 'varios:' || lower(btrim(o.varios))
        else 'row:' || o.id::text
      end
      order by coalesce(o.fecha_estado, o.fecha_aprobacion_real::timestamptz, o.fecha_aprobacion::timestamptz, o.created_at) desc, o.id desc
    ) as rn
  from public.tms_operaciones o
)
select
  id, nv_ptm, nv_orange, nv_farmapack, varios, factura, guia, numero_envio,
  vendedor, cliente, centro_costo, division, transportista, empresa_transporte,
  tipo_despacho, estado, urgente, fecha_aprobacion, fecha_aprobacion_real,
  fecha_facturacion, fecha_despacho, fecha_compromiso, fecha_estado,
  fecha_registro_nv, fecha_en_proceso, fecha_shipping, fecha_en_ruta,
  fecha_entregado, valor_factura, costo_flete, valor_nv, bultos,
  dias_en_proceso, incidencia, estado_incidencia, observaciones_incidencia,
  dias_incidencia, fillrate, origen, row_hash, created_at, updated_at,
  reabierta, fecha_reapertura, motivo_reapertura, reapertura_aprobada_por,
  case when nv_ptm is not null then 'ptm' when nv_orange is not null then 'orange' when nv_farmapack is not null then 'farmapack' else 'varios' end as canal_operacion,
  coalesce(nv_ptm::text, nv_orange, nv_farmapack, varios) as nv_operacion,
  nv_key,
  shipping_subestado, shipping_pausa_desde, shipping_pausa_hasta,
  shipping_pausa_motivo, shipping_pausa_total_segundos,
  shipping_pausa_elegible_sla, incidencia_area, incidencia_origen,
  incidencia_reportada_at, incidencia_reportada_por
from ranked
where rn = 1;

grant select on public.tms_operaciones_vigentes to authenticated;

revoke all on function public.nv_siguiente_estado(text) from public, anon;
revoke all on function public.nv_transicion_secuencial_valida(text, text) from public, anon;
revoke all on function public.cambiar_estado_nv(bigint, text, boolean) from public, anon;
revoke all on function public.gestionar_pausa_shipping_nv(bigint, text, text) from public, anon;
revoke all on function public.reportar_incidencia_armado_nv(bigint, text) from public, anon;
grant execute on function public.nv_siguiente_estado(text) to authenticated, service_role;
grant execute on function public.nv_transicion_secuencial_valida(text, text) to authenticated, service_role;
grant execute on function public.cambiar_estado_nv(bigint, text, boolean) to authenticated, service_role;
grant execute on function public.gestionar_pausa_shipping_nv(bigint, text, text) to authenticated, service_role;
grant execute on function public.reportar_incidencia_armado_nv(bigint, text) to authenticated, service_role;

comment on column public.tms_operaciones.shipping_subestado is
  'Pausa operativa de Shipping: REZAGADA_COMERCIAL o RETIRO_CLIENTE. No es un estado principal.';
comment on column public.tms_operaciones.shipping_pausa_elegible_sla is
  'True solo si la pausa comenzo antes del vencimiento; mientras este activa excluye la N.V. del SLA/OTIF.';
comment on column public.tms_operaciones.shipping_pausa_total_segundos is
  'Tiempo acumulado de pausas elegibles que ajusta el vencimiento efectivo al reactivar la N.V.';
