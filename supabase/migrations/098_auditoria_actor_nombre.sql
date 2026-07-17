-- 098_auditoria_actor_nombre.sql
-- Auditoría del Panel (tabla tms_operaciones_log): que el "operador" quede
-- registrado con el NOMBRE del usuario, no con el UUID crudo de auth.uid().
--
-- Antes: la columna `actor` usaba su default `(auth.uid())::text`, así que la
-- pantalla Auditoría (Configuración → Auditoría) habría mostrado un UUID en la
-- columna Operador. Ahora las 3 RPCs de escritura del Panel (guardar_nv,
-- cambiar_estado_nv, eliminar_nv) resuelven el nombre desde tms_usuarios y lo
-- guardan explícitamente en `actor`.
--
-- Sin cambios de esquema: solo se recrean funciones y se agrega un helper.

-- Helper: nombre visible del usuario actual (nombre → email → uid → 'sistema').
-- SECURITY DEFINER para poder leer tms_usuarios pese a su RLS.
create or replace function public._panel_actor()
returns text
language sql
security definer
set search_path to 'public'
stable
as $$
  select coalesce(
    (select nullif(trim(u.nombre), '') from public.tms_usuarios u where u.id = auth.uid()),
    (select u.email from public.tms_usuarios u where u.id = auth.uid()),
    nullif(auth.uid()::text, ''),
    'sistema'
  );
$$;

revoke all on function public._panel_actor() from public, anon;
grant execute on function public._panel_actor() to authenticated;

-- guardar_nv: agrega actor = nombre del usuario al log create/update.
create or replace function public.guardar_nv(p jsonb)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $function$
declare v_id bigint := nullif(p->>'id','')::bigint; v_canal text := coalesce(p->>'canal','ptm'); r public.tms_operaciones;
begin
  if not public._panel_puede_escribir() then raise exception 'No autorizado'; end if;
  if v_id is not null then
    update public.tms_operaciones set
      estado = coalesce(nullif(p->>'estado',''), estado), urgente = coalesce((p->>'urgente')::boolean, urgente),
      tipo_despacho = coalesce(nullif(p->>'tipoDespacho',''), tipo_despacho), transportista = coalesce(nullif(p->>'transportista',''), transportista),
      cliente = coalesce(nullif(p->>'cliente',''), cliente), vendedor = coalesce(nullif(p->>'vendedor',''), vendedor),
      fecha_compromiso = coalesce(nullif(p->>'fechaCompromiso','')::date, fecha_compromiso),
      fecha_aprobacion = coalesce(nullif(p->>'fechaAprobacion','')::date, fecha_aprobacion),
      fecha_aprobacion_real = coalesce(nullif(p->>'fechaAprobacionReal','')::date, fecha_aprobacion_real),
      fecha_facturacion = coalesce(nullif(p->>'fechaFacturacion',''), fecha_facturacion),
      fecha_despacho = coalesce(nullif(p->>'fechaDespacho','')::date, fecha_despacho),
      factura = coalesce(nullif(p->>'factura',''), factura), guia = coalesce(nullif(p->>'guia',''), guia),
      bultos = coalesce(nullif(p->>'bultos','')::bigint, bultos), valor_factura = coalesce(nullif(p->>'valorFactura','')::numeric, valor_factura),
      numero_envio = coalesce(nullif(p->>'numeroEnvio',''), numero_envio), origen = 'cco'
    where id = v_id returning * into r;
    if r.id is null then raise exception 'N.V. no encontrada'; end if;
  else
    insert into public.tms_operaciones (
      nv_ptm, nv_orange, nv_farmapack, varios, cliente, vendedor, division, centro_costo,
      estado, urgente, tipo_despacho, transportista,
      fecha_compromiso, fecha_aprobacion, fecha_aprobacion_real, fecha_facturacion, fecha_despacho,
      factura, guia, bultos, valor_factura, numero_envio, origen
    ) values (
      case when v_canal='ptm' then nullif(p->>'nv','')::bigint end,
      case when v_canal='orange' then nullif(p->>'nv','') end,
      case when v_canal='farmapack' then nullif(p->>'nv','') end,
      case when v_canal='varios' then nullif(p->>'nv','') end,
      coalesce(nullif(p->>'variosCliente',''), nullif(p->>'cliente','')),
      coalesce(nullif(p->>'variosVendedor',''), nullif(p->>'vendedor','')),
      coalesce(nullif(p->>'variosDivision',''), nullif(p->>'division','')),
      coalesce(nullif(p->>'variosCcosto',''), nullif(p->>'centro_costo','')),
      nullif(p->>'estado',''), coalesce((p->>'urgente')::boolean,false), nullif(p->>'tipoDespacho',''), nullif(p->>'transportista',''),
      nullif(p->>'fechaCompromiso','')::date, nullif(p->>'fechaAprobacion','')::date, nullif(p->>'fechaAprobacionReal','')::date, nullif(p->>'fechaFacturacion',''), nullif(p->>'fechaDespacho','')::date,
      nullif(p->>'factura',''), nullif(p->>'guia',''), nullif(p->>'bultos','')::bigint, nullif(p->>'valorFactura','')::numeric, nullif(p->>'numeroEnvio',''), 'cco'
    ) returning * into r;
  end if;
  insert into public.tms_operaciones_log (oper_id, accion, nv, despues, actor)
  values (r.id, case when v_id is null then 'create' else 'update' end,
          coalesce(r.nv_ptm::text, r.nv_orange, r.nv_farmapack, r.varios), to_jsonb(r), public._panel_actor());
  return jsonb_build_object('ok', true, 'id', r.id, 'nv', coalesce(r.nv_ptm::text, r.nv_orange, r.nv_farmapack, r.varios), 'estado', r.estado);
end; $function$;

-- cambiar_estado_nv: actor = nombre del usuario en el log 'estado'.
create or replace function public.cambiar_estado_nv(p_id bigint, p_estado text, p_urgente boolean default null::boolean)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $function$
declare r public.tms_operaciones;
begin
  if not public._panel_puede_escribir() then raise exception 'No autorizado'; end if;
  update public.tms_operaciones
     set estado = p_estado, urgente = coalesce(p_urgente, urgente), origen = 'cco'
   where id = p_id
   returning * into r;
  if r.id is null then raise exception 'N.V. no encontrada'; end if;
  insert into public.tms_operaciones_log (oper_id, accion, nv, despues, actor)
  values (r.id, 'estado', coalesce(r.nv_ptm::text, r.nv_orange, r.nv_farmapack, r.varios),
          jsonb_build_object('estado', r.estado, 'urgente', r.urgente), public._panel_actor());
  return jsonb_build_object('ok', true, 'id', r.id, 'estado', r.estado);
end;
$function$;

-- eliminar_nv: actor = nombre del usuario en el log 'delete'.
create or replace function public.eliminar_nv(p_id bigint)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $function$
declare r public.tms_operaciones;
begin
  if not public._panel_puede_escribir() then raise exception 'No autorizado'; end if;
  delete from public.tms_operaciones where id = p_id returning * into r;
  if r.id is null then raise exception 'N.V. no encontrada'; end if;
  insert into public.tms_operaciones_log (oper_id, accion, nv, despues, actor)
  values (p_id, 'delete', coalesce(r.nv_ptm::text, r.nv_orange, r.nv_farmapack, r.varios), to_jsonb(r), public._panel_actor());
  return jsonb_build_object('ok', true, 'id', p_id);
end; $function$;
