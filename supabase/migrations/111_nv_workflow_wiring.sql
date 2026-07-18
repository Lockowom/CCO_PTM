-- ============================================================================
--  111_nv_workflow_wiring.sql
--  Workflow Engine — Fase 2 (cont.): cablea la N.V. (Operaciones) al motor y
--  aborda la deuda P2 (la N.V. era el único proceso central sin máquina).
--
--  DECISIONES DE SEGURIDAD:
--   • Se instrumentan SOLO los caminos de usuario (cambiar_estado_nv, guardar_nv),
--     NO un trigger sobre tms_operaciones: esa tabla recibe cargas masivas/sync
--     que inundarían el historial. Así solo se registran acciones humanas.
--   • Validación SUAVE (no bloqueante): cada cambio de estado se registra en
--     workflow_history; si la transición (desde→hasta) NO está definida en
--     workflow_transition (NV), se marca nota='off-model' pero NO se rechaza.
--     Esto respeta estados/saltos reales (NULA, RECHAZADO, etc.) sin romper la
--     operación, y da VISIBILIDAD de los movimientos fuera del modelo. Las
--     transiciones que falten se agregan luego desde Admin → Workflows (sin código).
-- ============================================================================

-- Registra un cambio de estado de N.V. en el motor (on/off-model, sin bloquear).
create or replace function public._nv_wf_log(p_id bigint, p_desde text, p_hasta text)
returns void language plpgsql security definer set search_path = public
as $function$
declare v_acc text;
begin
  if p_hasta is null or (p_hasta is not distinct from p_desde) then return; end if;
  select accion into v_acc from public.workflow_transition
    where workflow = 'NV' and hasta = p_hasta and (desde is not distinct from nullif(p_desde,''))
    order by orden limit 1;
  insert into public.workflow_history (workflow, entidad_id, desde, hasta, accion, actor, nota)
  values ('NV', p_id::text, nullif(p_desde,''), p_hasta, coalesce(v_acc, 'cambiar'),
          public._panel_actor(), case when v_acc is null then 'off-model' else null end);
end; $function$;
revoke all on function public._nv_wf_log(bigint, text, text) from public, anon;

-- ── cambio rápido de estado (+ registro en el motor) ────────────────────────
create or replace function public.cambiar_estado_nv(p_id bigint, p_estado text, p_urgente boolean default null)
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare r public.tms_operaciones; v_desde text;
begin
  if not public._panel_puede_escribir() then raise exception 'No autorizado'; end if;
  select estado into v_desde from public.tms_operaciones where id = p_id;
  update public.tms_operaciones
     set estado = p_estado, urgente = coalesce(p_urgente, urgente), origen = 'cco'
   where id = p_id
   returning * into r;
  if r.id is null then raise exception 'N.V. no encontrada'; end if;
  insert into public.tms_operaciones_log (oper_id, accion, nv, despues)
  values (r.id, 'estado', coalesce(r.nv_ptm::text, r.nv_orange, r.nv_farmapack, r.varios),
          jsonb_build_object('estado', r.estado, 'urgente', r.urgente));
  perform public._nv_wf_log(r.id, v_desde, r.estado);
  return jsonb_build_object('ok', true, 'id', r.id, 'estado', r.estado);
end;
$$;

-- ── crear / editar N.V. (+ registro 'crear' o cambio de estado) ─────────────
create or replace function public.guardar_nv(p jsonb)
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  v_id bigint := nullif(p->>'id','')::bigint;
  v_canal text := coalesce(p->>'canal','ptm');
  r public.tms_operaciones;
  v_desde text;
begin
  if not public._panel_puede_escribir() then raise exception 'No autorizado'; end if;

  if v_id is not null then
    select estado into v_desde from public.tms_operaciones where id = v_id;
    update public.tms_operaciones set
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
      estado, urgente, tipo_despacho, transportista,
      fecha_compromiso, fecha_aprobacion, fecha_aprobacion_real, fecha_facturacion, fecha_despacho,
      factura, guia, bultos, valor_factura, numero_envio, origen
    ) values (
      case when v_canal='ptm'       then nullif(p->>'nv','')::bigint end,
      case when v_canal='orange'    then nullif(p->>'nv','') end,
      case when v_canal='farmapack' then nullif(p->>'nv','') end,
      case when v_canal='varios'    then nullif(p->>'nv','') end,
      nullif(p->>'variosCliente',''), nullif(p->>'variosVendedor',''), nullif(p->>'variosDivision',''), nullif(p->>'variosCcosto',''),
      nullif(p->>'estado',''), coalesce((p->>'urgente')::boolean,false), nullif(p->>'tipoDespacho',''), nullif(p->>'transportista',''),
      nullif(p->>'fechaCompromiso','')::date, nullif(p->>'fechaAprobacion','')::date, nullif(p->>'fechaAprobacionReal','')::date, nullif(p->>'fechaFacturacion',''), nullif(p->>'fechaDespacho','')::date,
      nullif(p->>'factura',''), nullif(p->>'guia',''), nullif(p->>'bultos','')::bigint, nullif(p->>'valorFactura','')::numeric, nullif(p->>'numeroEnvio',''), 'cco'
    ) returning * into r;
  end if;

  insert into public.tms_operaciones_log (oper_id, accion, nv, despues)
  values (r.id, case when v_id is null then 'create' else 'update' end,
          coalesce(r.nv_ptm::text, r.nv_orange, r.nv_farmapack, r.varios), to_jsonb(r));

  if v_id is null then
    perform public._nv_wf_log(r.id, null, r.estado);            -- alta → 'crear'
  else
    perform public._nv_wf_log(r.id, v_desde, r.estado);         -- edición → cambio de estado (si lo hubo)
  end if;

  return jsonb_build_object('ok', true, 'id', r.id,
    'nv', coalesce(r.nv_ptm::text, r.nv_orange, r.nv_farmapack, r.varios), 'estado', r.estado);
end;
$$;

revoke all on function public.cambiar_estado_nv(bigint, text, boolean) from public, anon;
revoke all on function public.guardar_nv(jsonb) from public, anon;
grant execute on function public.cambiar_estado_nv(bigint, text, boolean) to authenticated;
grant execute on function public.guardar_nv(jsonb) to authenticated;
