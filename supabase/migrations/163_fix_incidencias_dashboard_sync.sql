-- ============================================================================
-- 163_fix_incidencias_dashboard_sync.sql
-- Permite limpiar incidencias desde Panel y mantener Dashboard sincronizado.
-- Antes, guardar_nv preservaba incidencia/estado/observaciones con coalesce(...)
-- aunque el frontend las enviara vacias, dejando incidencias "fantasma" activas.
-- ============================================================================

create or replace function public.guardar_nv(p jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id bigint := nullif(p->>'id', '')::bigint;
  v_canal text := coalesce(p->>'canal', 'ptm');
  v_cliente text := coalesce(nullif(p->>'cliente', ''), nullif(p->>'variosCliente', ''));
  v_vendedor text := coalesce(nullif(p->>'vendedor', ''), nullif(p->>'variosVendedor', ''));
  v_division text := coalesce(nullif(p->>'division', ''), nullif(p->>'variosDivision', ''));
  v_ccosto text := coalesce(nullif(p->>'centro_costo', ''), nullif(p->>'variosCcosto', ''));
  v_nv_orange text := nullif(p->>'nvOrangeAsociada', '');
  v_incidencia text := nullif(p->>'incidencia', '');
  v_estado_incidencia text := nullif(p->>'estadoIncidencia', '');
  v_obs_incidencia text := nullif(p->>'observacionesIncidencia', '');
  v_has_incidencia boolean := p ? 'incidencia';
  v_has_estado_incidencia boolean := p ? 'estadoIncidencia';
  v_has_obs_incidencia boolean := p ? 'observacionesIncidencia';
  v_nv text := nullif(btrim(coalesce(p->>'nv', '')), '');
  v_dup public.tms_operaciones;
  r public.tms_operaciones;
  v_desde text;
  v_estado_destino text;
  v_transition_only boolean := false;
begin
  if not public._panel_puede_escribir() then
    raise exception 'No autorizado';
  end if;

  if v_id is not null then
    select * into r from public.tms_operaciones where id = v_id;
    if r.id is null then
      raise exception 'N.V. no encontrada';
    end if;

    v_estado_destino := coalesce(nullif(p->>'estado', ''), r.estado);
    v_desde := r.estado;

    v_transition_only :=
      coalesce(v_cliente, r.cliente) is not distinct from r.cliente
      and coalesce(v_vendedor, r.vendedor) is not distinct from r.vendedor
      and coalesce(v_division, r.division) is not distinct from r.division
      and coalesce(v_ccosto, r.centro_costo) is not distinct from r.centro_costo
      and coalesce(v_nv_orange, r.nv_orange) is not distinct from r.nv_orange
      and (case when v_has_incidencia then v_incidencia else r.incidencia end) is not distinct from r.incidencia
      and (case
            when v_has_incidencia and v_incidencia is null then null
            when v_has_estado_incidencia then v_estado_incidencia
            else r.estado_incidencia
          end) is not distinct from r.estado_incidencia
      and (case
            when v_has_incidencia and v_incidencia is null then null
            when v_has_obs_incidencia then v_obs_incidencia
            else r.observaciones_incidencia
          end) is not distinct from r.observaciones_incidencia
      and coalesce(nullif(p->>'tipoDespacho', ''), r.tipo_despacho) is not distinct from r.tipo_despacho
      and coalesce(nullif(p->>'transportista', ''), r.transportista) is not distinct from r.transportista
      and coalesce(nullif(p->>'fechaCompromiso', '')::date, r.fecha_compromiso) is not distinct from r.fecha_compromiso
      and coalesce(nullif(p->>'fechaAprobacion', '')::date, r.fecha_aprobacion) is not distinct from r.fecha_aprobacion
      and coalesce(nullif(p->>'fechaAprobacionReal', '')::date, r.fecha_aprobacion_real) is not distinct from r.fecha_aprobacion_real
      and coalesce(nullif(p->>'factura', ''), r.factura) is not distinct from r.factura
      and coalesce(nullif(p->>'guia', ''), r.guia) is not distinct from r.guia
      and coalesce(nullif(p->>'bultos', '')::bigint, r.bultos) is not distinct from r.bultos
      and coalesce(nullif(p->>'valorFactura', '')::numeric, r.valor_factura) is not distinct from r.valor_factura
      and coalesce(nullif(p->>'numeroEnvio', ''), r.numero_envio) is not distinct from r.numero_envio
      and (
        v_estado_destino is distinct from r.estado
        or coalesce((p->>'urgente')::boolean, r.urgente) is distinct from r.urgente
        or coalesce(nullif(p->>'fechaFacturacion', ''), r.fecha_facturacion) is distinct from r.fecha_facturacion
        or coalesce(nullif(p->>'fechaDespacho', '')::date, r.fecha_despacho) is distinct from r.fecha_despacho
      );

    if not authz.can_manage_operacion_row(to_jsonb(r)) then
      if not v_transition_only or not authz.can_change_operacion_estado_row(to_jsonb(r), v_estado_destino) then
        return jsonb_build_object(
          'ok', false,
          'forbidden', true,
          'message', 'No tienes permisos IAM para editar esta N.V.'
        );
      end if;
    end if;

    if coalesce(r.estado, '') = 'Entregado' then
      return jsonb_build_object(
        'ok', false,
        'locked', true,
        'message', 'La N.V. está entregada. Solicita reapertura para volver a gestionarla.'
      );
    end if;

    if v_transition_only then
      update public.tms_operaciones
         set estado = v_estado_destino,
             urgente = coalesce((p->>'urgente')::boolean, urgente),
             fecha_facturacion = coalesce(nullif(p->>'fechaFacturacion', ''), fecha_facturacion),
             fecha_despacho = coalesce(nullif(p->>'fechaDespacho', '')::date, fecha_despacho),
             origen = 'cco'
       where id = v_id
       returning * into r;
    else
      update public.tms_operaciones
         set cliente = coalesce(v_cliente, cliente),
             vendedor = coalesce(v_vendedor, vendedor),
             division = coalesce(v_division, division),
             centro_costo = coalesce(v_ccosto, centro_costo),
             nv_orange = coalesce(v_nv_orange, nv_orange),
             incidencia = case
               when v_has_incidencia then v_incidencia
               else incidencia
             end,
             estado_incidencia = case
               when v_has_incidencia and v_incidencia is null then null
               when v_has_estado_incidencia then v_estado_incidencia
               else estado_incidencia
             end,
             observaciones_incidencia = case
               when v_has_incidencia and v_incidencia is null then null
               when v_has_obs_incidencia then v_obs_incidencia
               else observaciones_incidencia
             end,
             estado = v_estado_destino,
             urgente = coalesce((p->>'urgente')::boolean, urgente),
             tipo_despacho = coalesce(nullif(p->>'tipoDespacho', ''), tipo_despacho),
             transportista = coalesce(nullif(p->>'transportista', ''), transportista),
             fecha_compromiso = coalesce(nullif(p->>'fechaCompromiso', '')::date, fecha_compromiso),
             fecha_aprobacion = coalesce(nullif(p->>'fechaAprobacion', '')::date, fecha_aprobacion),
             fecha_aprobacion_real = coalesce(nullif(p->>'fechaAprobacionReal', '')::date, fecha_aprobacion_real),
             fecha_facturacion = coalesce(nullif(p->>'fechaFacturacion', ''), fecha_facturacion),
             fecha_despacho = coalesce(nullif(p->>'fechaDespacho', '')::date, fecha_despacho),
             factura = coalesce(nullif(p->>'factura', ''), factura),
             guia = coalesce(nullif(p->>'guia', ''), guia),
             bultos = coalesce(nullif(p->>'bultos', '')::bigint, bultos),
             valor_factura = coalesce(nullif(p->>'valorFactura', '')::numeric, valor_factura),
             numero_envio = coalesce(nullif(p->>'numeroEnvio', ''), numero_envio),
             origen = 'cco'
       where id = v_id
       returning * into r;
    end if;
  else
    if v_nv is null then
      return jsonb_build_object('ok', false, 'message', 'Debes indicar la N.V.');
    end if;

    if not authz.can_create_operacion_scope(v_ccosto) then
      return jsonb_build_object(
        'ok', false,
        'forbidden', true,
        'message', 'No tienes permisos IAM para crear N.V. en ese centro de costo.'
      );
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
      case when v_canal = 'ptm' then v_nv::bigint end,
      case
        when v_canal = 'orange' then v_nv
        when v_canal = 'ptm' then v_nv_orange
      end,
      case when v_canal = 'farmapack' then v_nv end,
      case when v_canal = 'varios' then v_nv end,
      v_cliente, v_vendedor, v_division, v_ccosto,
      v_incidencia, v_estado_incidencia, v_obs_incidencia,
      nullif(p->>'estado', ''), coalesce((p->>'urgente')::boolean, false), nullif(p->>'tipoDespacho', ''), nullif(p->>'transportista', ''),
      nullif(p->>'fechaCompromiso', '')::date, nullif(p->>'fechaAprobacion', '')::date, nullif(p->>'fechaAprobacionReal', '')::date, nullif(p->>'fechaFacturacion', ''), nullif(p->>'fechaDespacho', '')::date,
      nullif(p->>'factura', ''), nullif(p->>'guia', ''), nullif(p->>'bultos', '')::bigint, nullif(p->>'valorFactura', '')::numeric, nullif(p->>'numeroEnvio', ''), 'cco'
    ) returning * into r;
  end if;

  insert into public.tms_operaciones_log (oper_id, accion, nv, despues)
  values (
    r.id,
    case when v_id is null then 'create' else 'update' end,
    coalesce(r.nv_ptm::text, r.nv_orange, r.nv_farmapack, r.varios),
    to_jsonb(r)
  );

  if v_id is null then
    perform public._nv_wf_log(r.id, null, r.estado);
  else
    perform public._nv_wf_log(r.id, v_desde, r.estado);
  end if;

  return jsonb_build_object(
    'ok', true,
    'id', r.id,
    'nv', coalesce(r.nv_ptm::text, r.nv_orange, r.nv_farmapack, r.varios),
    'estado', r.estado
  );
end;
$$;
