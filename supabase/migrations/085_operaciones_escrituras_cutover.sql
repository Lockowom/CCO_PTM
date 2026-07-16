-- 085_operaciones_escrituras_cutover.sql
-- ============================================================================
--  Fase 4 — CUTOVER: CCO pasa a ser la fuente de verdad de tms_operaciones.
--   1) Se APAGA el auto-sync desde el Panel (el Sheet queda congelado / solo
--      lectura). A partir de aquí las escrituras salen de CCO.
--   2) Escrituras nativas: RPCs `guardar_nv` (crear/editar) y `cambiar_estado_nv`
--      (cambio rápido de estado), gateadas por permiso (`manage_panel` o admin).
--   3) El trigger de la tabla estampa automáticamente `fecha_estado` al cambiar
--      de estado y las fechas de etapa (en proceso/shipping/en ruta/entregado)
--      la primera vez — igual que hacía el onEdit del Google Sheet.
--   4) Bitácora de cambios en `tms_operaciones_log`.
-- ============================================================================

-- 1) Apagar el auto-refresco (cutover) ---------------------------------------
do $$
begin
  if exists (select 1 from cron.job where jobname = 'panel-sync-operaciones') then
    perform cron.unschedule('panel-sync-operaciones');
  end if;
end $$;
update private.panel_sync_config set enabled = false where id = 1;

-- 2) Permiso de gestión del Panel --------------------------------------------
insert into public.tms_permisos (id, nombre, modulo)
values ('manage_panel', 'Gestionar Panel PTM (crear/editar N.V. y estados)', 'Panel PTM')
on conflict (id) do update set nombre = excluded.nombre, modulo = excluded.modulo;

-- 3) Bitácora de cambios ------------------------------------------------------
create table if not exists public.tms_operaciones_log (
  id       bigint generated always as identity primary key,
  oper_id  bigint,
  accion   text,
  nv       text,
  despues  jsonb,
  actor    text default auth.uid()::text,
  ts       timestamptz not null default now()
);
alter table public.tms_operaciones_log enable row level security;
drop policy if exists p_tms_oper_log_sel on public.tms_operaciones_log;
create policy p_tms_oper_log_sel on public.tms_operaciones_log for select to authenticated using (true);

-- 4) Trigger: normaliza estado + updated_at + estampa fechas de flujo ---------
create or replace function public.tms_operaciones_before_write()
returns trigger
language plpgsql
as $$
declare cambio_estado boolean := false;
begin
  new.estado := public.tms_operaciones_norm_estado(new.estado);
  new.updated_at := now();

  if tg_op = 'INSERT' then
    cambio_estado := (new.origen = 'cco');           -- alta nativa CCO
    if new.fecha_estado is null then new.fecha_estado := now(); end if;
  elsif tg_op = 'UPDATE' then
    cambio_estado := new.estado is distinct from old.estado;
    if cambio_estado then new.fecha_estado := now(); end if;
  end if;

  -- Estampa la fecha de etapa la PRIMERA vez (solo en cambios nativos CCO),
  -- sin sobreescribir el histórico importado del Sheet.
  if cambio_estado then
    if new.estado = 'En Proceso' and new.fecha_en_proceso is null then new.fecha_en_proceso := current_date; end if;
    if new.estado = 'Shipping'   and new.fecha_shipping   is null then new.fecha_shipping   := current_date; end if;
    if new.estado = 'En Ruta'    and new.fecha_en_ruta    is null then new.fecha_en_ruta    := current_date; end if;
    if new.estado = 'Entregado'  and new.fecha_entregado  is null then new.fecha_entregado  := current_date; end if;
  end if;

  return new;
end;
$$;

-- 5) Gate de escritura (admin o permiso manage_panel) ------------------------
create or replace function public._panel_puede_escribir()
returns boolean
language sql stable security definer set search_path = public
as $$
  select coalesce(private.is_admin(), false)
      or coalesce(public.usuario_tiene_algun_permiso(array['manage_panel']), false);
$$;

-- 6) RPC: cambio rápido de estado --------------------------------------------
create or replace function public.cambiar_estado_nv(p_id bigint, p_estado text, p_urgente boolean default null)
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare r public.tms_operaciones;
begin
  if not public._panel_puede_escribir() then raise exception 'No autorizado'; end if;
  update public.tms_operaciones
     set estado = p_estado, urgente = coalesce(p_urgente, urgente), origen = 'cco'
   where id = p_id
   returning * into r;
  if r.id is null then raise exception 'N.V. no encontrada'; end if;
  insert into public.tms_operaciones_log (oper_id, accion, nv, despues)
  values (r.id, 'estado', coalesce(r.nv_ptm::text, r.nv_orange, r.nv_farmapack, r.varios),
          jsonb_build_object('estado', r.estado, 'urgente', r.urgente));
  return jsonb_build_object('ok', true, 'id', r.id, 'estado', r.estado);
end;
$$;

-- 7) RPC: crear / editar N.V. -------------------------------------------------
create or replace function public.guardar_nv(p jsonb)
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  v_id bigint := nullif(p->>'id','')::bigint;
  v_canal text := coalesce(p->>'canal','ptm');
  r public.tms_operaciones;
begin
  if not public._panel_puede_escribir() then raise exception 'No autorizado'; end if;

  if v_id is not null then
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

  return jsonb_build_object('ok', true, 'id', r.id,
    'nv', coalesce(r.nv_ptm::text, r.nv_orange, r.nv_farmapack, r.varios), 'estado', r.estado);
end;
$$;

revoke all on function public.cambiar_estado_nv(bigint, text, boolean) from public;
revoke all on function public.guardar_nv(jsonb) from public;
grant execute on function public.cambiar_estado_nv(bigint, text, boolean) to authenticated;
grant execute on function public.guardar_nv(jsonb) to authenticated;
