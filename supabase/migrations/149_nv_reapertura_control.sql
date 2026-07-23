-- ============================================================================
-- 149_nv_reapertura_control.sql
-- Bloquea la edición directa de N.V. entregadas, crea el flujo de reapertura
-- aprobada y evita duplicados lógicos al crear nuevas operaciones desde CCO.
-- ============================================================================

alter table public.tms_operaciones
  add column if not exists reabierta boolean not null default false,
  add column if not exists fecha_reapertura timestamptz,
  add column if not exists motivo_reapertura text,
  add column if not exists reapertura_aprobada_por uuid references public.tms_usuarios(id);

create table if not exists public.tms_nv_reaperturas (
  id uuid primary key default gen_random_uuid(),
  operacion_id bigint not null references public.tms_operaciones(id) on delete cascade,
  nv text not null,
  canal text not null,
  estado_origen text not null,
  motivo text not null,
  estado text not null default 'PENDIENTE' check (estado in ('PENDIENTE', 'APROBADA', 'RECHAZADA')),
  solicitada_por uuid references public.tms_usuarios(id),
  solicitada_por_nombre text,
  solicitada_at timestamptz not null default now(),
  resuelta_por uuid references public.tms_usuarios(id),
  resuelta_por_nombre text,
  resuelta_at timestamptz,
  observacion_resolucion text
);

create index if not exists ix_nv_reaperturas_operacion on public.tms_nv_reaperturas(operacion_id, solicitada_at desc);
create index if not exists ix_nv_reaperturas_estado on public.tms_nv_reaperturas(estado, solicitada_at desc);
create unique index if not exists ux_nv_reaperturas_operacion_pendiente
  on public.tms_nv_reaperturas(operacion_id)
  where estado = 'PENDIENTE';

alter table public.tms_nv_reaperturas enable row level security;

drop policy if exists nv_reaperturas_select on public.tms_nv_reaperturas;
create policy nv_reaperturas_select on public.tms_nv_reaperturas
  for select to authenticated
  using (
    public.usuario_tiene_algun_permiso(array['view_panel', 'manage_panel', 'approve_panel_reopen_nv', 'manage_roles'])
  );

create or replace function public._panel_usuario_actual()
returns table (
  id uuid,
  nombre text,
  rol text,
  es_admin_delegado boolean
)
language sql
stable
security definer
set search_path to 'public'
as $$
  select u.id, u.nombre, u.rol, coalesce(u.es_admin_delegado, false)
  from public.tms_usuarios u
  where u.auth_uid = auth.uid() and u.activo
  limit 1
$$;

create or replace function public._panel_puede_aprobar_reapertura_nv()
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $$
  select
    auth.role() = 'service_role'
    or public.is_admin()
    or public.usuario_tiene_algun_permiso(array['approve_panel_reopen_nv', 'manage_roles'])
$$;

create or replace function public.solicitar_reapertura_nv(p_operacion_id bigint, p_motivo text)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_row public.tms_operaciones;
  v_user record;
  v_motivo text := nullif(btrim(coalesce(p_motivo, '')), '');
  v_req public.tms_nv_reaperturas;
begin
  if not public._panel_puede_escribir() then
    raise exception 'No autorizado';
  end if;

  if v_motivo is null then
    return jsonb_build_object('ok', false, 'message', 'Debes indicar el motivo de la reapertura.');
  end if;

  select * into v_row
  from public.tms_operaciones
  where id = p_operacion_id;

  if v_row.id is null then
    raise exception 'N.V. no encontrada';
  end if;

  if coalesce(v_row.estado, '') <> 'Entregado' then
    return jsonb_build_object('ok', false, 'message', 'Solo se pueden solicitar reaperturas para N.V. entregadas.');
  end if;

  select * into v_user from public._panel_usuario_actual();
  if v_user.id is null then
    raise exception 'Usuario no identificado';
  end if;

  select * into v_req
  from public.tms_nv_reaperturas
  where operacion_id = p_operacion_id
    and estado = 'PENDIENTE'
  order by solicitada_at desc
  limit 1;

  if v_req.id is not null then
    return jsonb_build_object(
      'ok', false,
      'pending', true,
      'message', 'Ya existe una solicitud de reapertura pendiente para esta N.V.'
    );
  end if;

  insert into public.tms_nv_reaperturas (
    operacion_id, nv, canal, estado_origen, motivo,
    solicitada_por, solicitada_por_nombre
  )
  values (
    v_row.id,
    coalesce(v_row.nv_ptm::text, v_row.nv_orange, v_row.nv_farmapack, v_row.varios),
    case
      when v_row.nv_ptm is not null then 'ptm'
      when v_row.nv_orange is not null then 'orange'
      when v_row.nv_farmapack is not null then 'farmapack'
      else 'varios'
    end,
    v_row.estado,
    v_motivo,
    v_user.id,
    v_user.nombre
  )
  returning * into v_req;

  insert into public.tms_operaciones_log (oper_id, accion, nv, despues)
  values (
    v_row.id,
    'reopen_request',
    coalesce(v_row.nv_ptm::text, v_row.nv_orange, v_row.nv_farmapack, v_row.varios),
    jsonb_build_object(
      'solicitud_id', v_req.id,
      'motivo', v_req.motivo,
      'estado', v_req.estado
    )
  );

  insert into public.workflow_history (workflow, entidad_id, desde, hasta, accion, actor, nota)
  values (
    'NV',
    v_row.id::text,
    v_row.estado,
    v_row.estado,
    'solicitar_reapertura',
    public._panel_actor(),
    v_motivo
  );

  return jsonb_build_object(
    'ok', true,
    'request_id', v_req.id,
    'message', 'Solicitud de reapertura enviada para aprobación.'
  );
end;
$$;

create or replace function public.resolver_reapertura_nv(p_request_id uuid, p_aprobar boolean, p_observacion text default null)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_req public.tms_nv_reaperturas;
  v_row public.tms_operaciones;
  v_user record;
  v_obs text := nullif(btrim(coalesce(p_observacion, '')), '');
begin
  if not public._panel_puede_aprobar_reapertura_nv() then
    raise exception 'No autorizado para aprobar reaperturas';
  end if;

  select * into v_req
  from public.tms_nv_reaperturas
  where id = p_request_id
  for update;

  if v_req.id is null then
    raise exception 'Solicitud de reapertura no encontrada';
  end if;

  if v_req.estado <> 'PENDIENTE' then
    return jsonb_build_object('ok', false, 'message', 'La solicitud ya fue resuelta.');
  end if;

  select * into v_user from public._panel_usuario_actual();
  if v_user.id is null then
    raise exception 'Usuario no identificado';
  end if;

  if v_req.solicitada_por = v_user.id and not public.is_admin() then
    return jsonb_build_object('ok', false, 'message', 'La reapertura debe ser aprobada por otro rol.');
  end if;

  if p_aprobar then
    update public.tms_nv_reaperturas
       set estado = 'APROBADA',
           resuelta_por = v_user.id,
           resuelta_por_nombre = v_user.nombre,
           resuelta_at = now(),
           observacion_resolucion = v_obs
     where id = v_req.id
     returning * into v_req;

    update public.tms_operaciones
       set estado = 'En Proceso',
           reabierta = true,
           fecha_reapertura = now(),
           motivo_reapertura = v_req.motivo,
           reapertura_aprobada_por = v_user.id,
           origen = 'cco'
     where id = v_req.operacion_id
     returning * into v_row;

    if v_row.id is null then
      raise exception 'N.V. no encontrada';
    end if;

    insert into public.tms_operaciones_log (oper_id, accion, nv, despues)
    values (
      v_row.id,
      'reopen_approved',
      coalesce(v_row.nv_ptm::text, v_row.nv_orange, v_row.nv_farmapack, v_row.varios),
      jsonb_build_object(
        'solicitud_id', v_req.id,
        'motivo', v_req.motivo,
        'observacion_resolucion', v_req.observacion_resolucion,
        'estado', v_row.estado,
        'reabierta', true
      )
    );

    insert into public.workflow_history (workflow, entidad_id, desde, hasta, accion, actor, nota)
    values (
      'NV',
      v_row.id::text,
      'Entregado',
      'En Proceso',
      'reabrir',
      public._panel_actor(),
      coalesce(v_req.motivo, '') || case when v_obs is not null then ' | ' || v_obs else '' end
    );

    return jsonb_build_object(
      'ok', true,
      'approved', true,
      'operacion_id', v_row.id,
      'estado', v_row.estado,
      'message', 'N.V. reabierta y enviada automáticamente a En Proceso.'
    );
  end if;

  update public.tms_nv_reaperturas
     set estado = 'RECHAZADA',
         resuelta_por = v_user.id,
         resuelta_por_nombre = v_user.nombre,
         resuelta_at = now(),
         observacion_resolucion = v_obs
   where id = v_req.id
   returning * into v_req;

  insert into public.tms_operaciones_log (oper_id, accion, nv, despues)
  values (
    v_req.operacion_id,
    'reopen_rejected',
    v_req.nv,
    jsonb_build_object(
      'solicitud_id', v_req.id,
      'motivo', v_req.motivo,
      'observacion_resolucion', v_req.observacion_resolucion,
      'estado', v_req.estado
    )
  );

  return jsonb_build_object(
    'ok', true,
    'approved', false,
    'message', 'Solicitud de reapertura rechazada.'
  );
end;
$$;

grant select on public.tms_nv_reaperturas to authenticated, service_role;

create or replace function public.cambiar_estado_nv(p_id bigint, p_estado text, p_urgente boolean default null)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.tms_operaciones;
  v_desde text;
begin
  if not public._panel_puede_escribir() then raise exception 'No autorizado'; end if;
  select * into r from public.tms_operaciones where id = p_id;
  if r.id is null then raise exception 'N.V. no encontrada'; end if;
  if coalesce(r.estado, '') = 'Entregado' then
    return jsonb_build_object('ok', false, 'locked', true, 'message', 'La N.V. está entregada. Solicita reapertura para volver a gestionarla.');
  end if;
  v_desde := r.estado;
  update public.tms_operaciones
     set estado = p_estado, urgente = coalesce(p_urgente, urgente), origen = 'cco'
   where id = p_id
   returning * into r;
  insert into public.tms_operaciones_log (oper_id, accion, nv, despues)
  values (r.id, 'estado', coalesce(r.nv_ptm::text, r.nv_orange, r.nv_farmapack, r.varios),
          jsonb_build_object('estado', r.estado, 'urgente', r.urgente));
  perform public._nv_wf_log(r.id, v_desde, r.estado);
  return jsonb_build_object('ok', true, 'id', r.id, 'estado', r.estado);
end;
$$;

create or replace function public.guardar_nv(p jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id bigint := nullif(p->>'id','')::bigint;
  v_canal text := coalesce(p->>'canal','ptm');
  v_cliente text := coalesce(nullif(p->>'cliente',''), nullif(p->>'variosCliente',''));
  v_vendedor text := coalesce(nullif(p->>'vendedor',''), nullif(p->>'variosVendedor',''));
  v_division text := coalesce(nullif(p->>'division',''), nullif(p->>'variosDivision',''));
  v_ccosto text := coalesce(nullif(p->>'centro_costo',''), nullif(p->>'variosCcosto',''));
  v_nv_orange text := nullif(p->>'nvOrangeAsociada','');
  v_incidencia text := nullif(p->>'incidencia','');
  v_estado_incidencia text := nullif(p->>'estadoIncidencia','');
  v_obs_incidencia text := nullif(p->>'observacionesIncidencia','');
  v_nv text := nullif(btrim(coalesce(p->>'nv','')), '');
  v_dup public.tms_operaciones;
  r public.tms_operaciones;
  v_desde text;
begin
  if not public._panel_puede_escribir() then raise exception 'No autorizado'; end if;

  if v_id is not null then
    select * into r from public.tms_operaciones where id = v_id;
    if r.id is null then raise exception 'N.V. no encontrada'; end if;
    if coalesce(r.estado, '') = 'Entregado' then
      return jsonb_build_object('ok', false, 'locked', true, 'message', 'La N.V. está entregada. Solicita reapertura para volver a gestionarla.');
    end if;
    v_desde := r.estado;
    update public.tms_operaciones set
      cliente               = coalesce(v_cliente, cliente),
      vendedor              = coalesce(v_vendedor, vendedor),
      division              = coalesce(v_division, division),
      centro_costo          = coalesce(v_ccosto, centro_costo),
      nv_orange             = coalesce(v_nv_orange, nv_orange),
      incidencia            = coalesce(v_incidencia, incidencia),
      estado_incidencia     = coalesce(v_estado_incidencia, estado_incidencia),
      observaciones_incidencia = coalesce(v_obs_incidencia, observaciones_incidencia),
      estado                = coalesce(nullif(p->>'estado',''), estado),
      urgente               = coalesce((p->>'urgente')::boolean, urgente),
      tipo_despacho         = coalesce(nullif(p->>'tipoDespacho',''), tipo_despacho),
      transportista         = coalesce(nullif(p->>'transportista',''), transportista),
      fecha_compromiso      = coalesce(nullif(p->>'fechaCompromiso','')::date, fecha_compromiso),
      fecha_aprobacion      = coalesce(nullif(p->>'fechaAprobacion','')::date, fecha_aprobacion),
      fecha_aprobacion_real = coalesce(nullif(p->>'fechaAprobacionReal','')::date, fecha_aprobacion_real),
      fecha_facturacion     = coalesce(nullif(p->>'fechaFacturacion',''), fecha_facturacion),
      fecha_despacho        = coalesce(nullif(p->>'fechaDespacho','')::date, fecha_despacho),
      factura               = coalesce(nullif(p->>'factura',''), factura),
      guia                  = coalesce(nullif(p->>'guia',''), guia),
      bultos                = coalesce(nullif(p->>'bultos','')::bigint, bultos),
      valor_factura         = coalesce(nullif(p->>'valorFactura','')::numeric, valor_factura),
      numero_envio          = coalesce(nullif(p->>'numeroEnvio',''), numero_envio),
      origen                = 'cco'
    where id = v_id
    returning * into r;
  else
    if v_nv is null then
      return jsonb_build_object('ok', false, 'message', 'Debes indicar la N.V.');
    end if;

    perform pg_advisory_xact_lock(hashtext('tms-oper-nv:' || lower(v_canal) || ':' || lower(v_nv)));

    select *
      into v_dup
      from public.tms_operaciones
     where (
       (v_canal = 'ptm' and v_nv ~ '^\d+$' and nv_ptm = v_nv::bigint) or
       (v_canal = 'orange' and lower(coalesce(nv_orange, '')) = lower(v_nv)) or
       (v_canal = 'farmapack' and lower(coalesce(nv_farmapack, '')) = lower(v_nv)) or
       (v_canal = 'varios' and lower(coalesce(varios, '')) = lower(v_nv))
     )
     order by id desc
     limit 1;

    if v_dup.id is not null then
      return jsonb_build_object(
        'ok', false,
        'duplicate', true,
        'id', v_dup.id,
        'estado', v_dup.estado,
        'message', format(
          'La N.V. %s ya fue registrada y está en estado %s. Usa el registro existente para evitar duplicados.',
          v_nv,
          coalesce(v_dup.estado, 'Sin estado')
        )
      );
    end if;

    insert into public.tms_operaciones (
      nv_ptm, nv_orange, nv_farmapack, varios,
      cliente, vendedor, division, centro_costo,
      incidencia, estado_incidencia, observaciones_incidencia,
      estado, urgente, tipo_despacho, transportista,
      fecha_compromiso, fecha_aprobacion, fecha_aprobacion_real, fecha_facturacion, fecha_despacho,
      factura, guia, bultos, valor_factura, numero_envio, origen
    ) values (
      case when v_canal='ptm'       then v_nv::bigint end,
      case
        when v_canal='orange' then v_nv
        when v_canal='ptm' then v_nv_orange
      end,
      case when v_canal='farmapack' then v_nv end,
      case when v_canal='varios'    then v_nv end,
      v_cliente, v_vendedor, v_division, v_ccosto,
      v_incidencia, v_estado_incidencia, v_obs_incidencia,
      nullif(p->>'estado',''), coalesce((p->>'urgente')::boolean,false), nullif(p->>'tipoDespacho',''), nullif(p->>'transportista',''),
      nullif(p->>'fechaCompromiso','')::date, nullif(p->>'fechaAprobacion','')::date, nullif(p->>'fechaAprobacionReal','')::date, nullif(p->>'fechaFacturacion',''), nullif(p->>'fechaDespacho','')::date,
      nullif(p->>'factura',''), nullif(p->>'guia',''), nullif(p->>'bultos','')::bigint, nullif(p->>'valorFactura','')::numeric, nullif(p->>'numeroEnvio',''), 'cco'
    ) returning * into r;
  end if;

  insert into public.tms_operaciones_log (oper_id, accion, nv, despues)
  values (r.id, case when v_id is null then 'create' else 'update' end,
          coalesce(r.nv_ptm::text, r.nv_orange, r.nv_farmapack, r.varios), to_jsonb(r));

  if v_id is null then
    perform public._nv_wf_log(r.id, null, r.estado);
  else
    perform public._nv_wf_log(r.id, v_desde, r.estado);
  end if;

  return jsonb_build_object(
    'ok', true,
    'id', r.id,
    'nv', coalesce(r.nv_ptm::text, r.nv_orange, r.nv_farmapack, r.varios),
    'estado', r.estado,
    'nv_orange', r.nv_orange,
    'reabierta', r.reabierta,
    'motivo_reapertura', r.motivo_reapertura
  );
end;
$$;

revoke all on function public._panel_usuario_actual() from public, anon;
grant execute on function public._panel_usuario_actual() to authenticated, service_role;
revoke all on function public._panel_puede_aprobar_reapertura_nv() from public, anon;
grant execute on function public._panel_puede_aprobar_reapertura_nv() to authenticated, service_role;
revoke all on function public.solicitar_reapertura_nv(bigint, text) from public, anon;
grant execute on function public.solicitar_reapertura_nv(bigint, text) to authenticated;
revoke all on function public.resolver_reapertura_nv(uuid, boolean, text) from public, anon;
grant execute on function public.resolver_reapertura_nv(uuid, boolean, text) to authenticated;
revoke all on function public.cambiar_estado_nv(bigint, text, boolean) from public, anon;
grant execute on function public.cambiar_estado_nv(bigint, text, boolean) to authenticated;
revoke all on function public.guardar_nv(jsonb) from public, anon;
grant execute on function public.guardar_nv(jsonb) to authenticated;
