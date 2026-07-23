-- ============================================================================
-- 148_guardar_nv_orange_incidencias.sql
-- Extiende guardar_nv para:
--  - permitir asociar una N.V. Orange desde el flujo PTM (nv_orange en la misma fila)
--  - persistir cliente/vendedor/division/centro_costo también en creaciones no-"varios"
--  - guardar incidencias operacionales directamente desde Ingresar N.V.
-- ============================================================================

create or replace function public.guardar_nv(p jsonb)
returns jsonb
language plpgsql security definer set search_path = public
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
  r public.tms_operaciones;
  v_desde text;
begin
  if not public._panel_puede_escribir() then raise exception 'No autorizado'; end if;

  if v_id is not null then
    select estado into v_desde from public.tms_operaciones where id = v_id;
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
    if r.id is null then raise exception 'N.V. no encontrada'; end if;
  else
    insert into public.tms_operaciones (
      nv_ptm, nv_orange, nv_farmapack, varios,
      cliente, vendedor, division, centro_costo,
      incidencia, estado_incidencia, observaciones_incidencia,
      estado, urgente, tipo_despacho, transportista,
      fecha_compromiso, fecha_aprobacion, fecha_aprobacion_real, fecha_facturacion, fecha_despacho,
      factura, guia, bultos, valor_factura, numero_envio, origen
    ) values (
      case when v_canal='ptm'       then nullif(p->>'nv','')::bigint end,
      case
        when v_canal='orange' then nullif(p->>'nv','')
        when v_canal='ptm' then v_nv_orange
      end,
      case when v_canal='farmapack' then nullif(p->>'nv','') end,
      case when v_canal='varios'    then nullif(p->>'nv','') end,
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
    'nv_orange', r.nv_orange
  );
end;
$$;

revoke all on function public.guardar_nv(jsonb) from public, anon;
grant execute on function public.guardar_nv(jsonb) to authenticated;
