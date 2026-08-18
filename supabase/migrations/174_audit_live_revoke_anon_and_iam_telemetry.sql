-- 174_audit_live_revoke_anon_and_iam_telemetry.sql
-- ============================================================================
--  PR-008b · AUDIT LIVE (phase 2) — revokes de superficie anon/public + IAM telemetry
--
--  PARTE 1 — REVOKES (hallazgos del audit LIVE en PROD, 2026-08-17):
--    * `wms_move_stock` tenía EXECUTE para anon/public SIN gate interno de IAM:
--      mover stock sin autenticación (la RLS de wms_inventory no es sustituto:
--      la función es invoker y escribe vía wms_inventory/wms_kardex).
--    * `batch_update_nv_estado` (legacy) cambia estados en lote SIN gate.
--    * `get_dashboard_kpis` lee la MV de KPIs sin gate (legacy).
--    * `fuzzy_search` expone búsqueda con whitelist pero sin gate de sesión;
--      el frontend la usa como `authenticated` (se conserva ese grant).
--    * Helpers de normalización/triggers/workflow con EXECUTE residual a
--      anon/public (no son superficie de cliente; se revocan por higiene).
--    * `monitoreo_dictaminar`/`crear_pv_ticket` SÍ tienen gate interno
--      (is_admin/manage_quality y _pv_assert) → solo se revoca anon/public,
--      `authenticated` conserva EXECUTE.
--    * Públicas POR DISEÑO (se conservan con EXECUTE anon):
--      `buscar_nv_publico` (rate-limit por IP), `verificar_certificado`
--      (verificación pública de folio). NO se tocan.
--    * Los revokes se hacen SOLO sobre anon/public; `authenticated` y
--      `service_role` mantienen EXECUTE → sin pérdida de función para el
--      cliente ni para los flujos de sync/edge functions.
--
--  PARTE 2 — IAM TELEMETRY (registro de denegaciones de autorización):
--    * Tabla `tms_iam_denegaciones`: quién (uid/rol), qué (rpc/acción),
--      dónde (centro de costo / N.V.), cuándo y por qué motivo.
--    * Función `iam_log_denegacion(...)` SECURITY DEFINER: inserta el intento
--      denegado sin exponer datos (nunca escribe el payload).
--    * Hooks en las ramas `forbidden` de `guardar_nv` y `cambiar_estado_nv`
--      (mismas firmas y cuerpo EXACTO que la migración 173; solo se añade el
--      `perform iam_log_denegacion` antes de cada return forbidden).
--    * Lectura: RLS admin-only (patrón de tms_accesos/system_logs); los
--      operadores NO ven la tabla, la RPC solo inserta como definer.
--
--  ROLLBACK:
--    1) Hooks: re-aplicar la migración 173 (reescribe guardar_nv/cambiar_estado_nv
--       sin los PERFORM de telemetría) o hacer CREATE OR REPLACE manual.
--    2) drop function if exists public.iam_log_denegacion(text, text, text, bigint, text, text);
--    3) drop table if exists public.tms_iam_denegaciones;
--    4) Revokes: no hay rollback automático de un REVOKE (volver a aplicar los
--       grants anteriores en PROD era: `grant execute ... to anon, public`).
-- ============================================================================

-- ---------------------------------------------------------------------------
-- PARTE 1 — REVOKES de anon/public (audit LIVE, phase 2)
-- ---------------------------------------------------------------------------

-- 1.1) Funciones de ESCRITURA sin gate interno (riesgo real) ----------------
revoke all on function public.wms_move_stock(text, text, text, text, integer, uuid, text) from public, anon;
revoke all on function public.batch_update_nv_estado(uuid[], text, text) from public, anon;
revoke all on function public.get_dashboard_kpis() from public, anon;
revoke all on function public.fuzzy_search(text, text, text, integer, double precision) from public, anon;

-- 1.2) Escrituras con gate interno (higiene; authenticated conserva EXECUTE) --
revoke all on function public.monitoreo_dictaminar(uuid, text, text, text, date, text) from public, anon;
revoke all on function public.crear_pv_ticket(text, text, text, text, text, text, text, text, text, text, text, text, text, text, date, text, text, text, text, jsonb) from public, anon;

-- 1.3) Triggers / funciones de trigger (no son superficie de cliente) --------
revoke all on function public.tms_operaciones_before_write() from public, anon;
revoke all on function public.tms_operaciones_bitacora() from public, anon;
revoke all on function public.tms_operaciones_bump_version() from public, anon;
revoke all on function public.tms_operaciones_enrich_catalogo() from public, anon;
revoke all on function public.update_nv_updated_at() from public, anon;
revoke all on function public.update_updated_at_column() from public, anon;
revoke all on function public.tms_operaciones_norm_estado(text) from public, anon;
revoke all on function public._tms_partidas_norm_partida() from public, anon;
revoke all on function public._tms_series_norm_serie() from public, anon;
revoke all on function public.wms_ubicaciones_auditar() from public, anon;
revoke all on function public.wms_ubicaciones_preparar() from public, anon;
revoke all on function public.set_categoria_item() from public, anon;
revoke all on function public.set_categoria_producto(text, text) from public, anon;

-- 1.4) Helpers de normalización / workflow (invoker internos) ----------------
revoke all on function public.norm_desc(text) from public, anon;
revoke all on function public.normalizar_nv(text) from public, anon;
revoke all on function public.categoria_efectiva(text) from public, anon;
revoke all on function public.clasificar_producto(text) from public, anon;
revoke all on function public.tms_nv_catalogo_norm() from public, anon;
revoke all on function public._cal_wf_alta() from public, anon;
revoke all on function public._cal_wf_cambio() from public, anon;
revoke all on function public._conteo_wf_alta() from public, anon;
revoke all on function public._conteo_wf_cambio() from public, anon;
revoke all on function public._pv_wf_alta() from public, anon;
revoke all on function public._pv_wf_cambio() from public, anon;
revoke all on function public._wf_emitir_evento() from public, anon;
revoke all on function public._evento_despachar() from public, anon;
revoke all on function public._notif_render(text, dominio_eventos) from public, anon;
revoke all on function public._conteo_es_super(text, boolean, jsonb) from public, anon;
revoke all on function public._conteo_estado(numeric, numeric) from public, anon;
revoke all on function public.compat_putaway_a_wms() from public, anon;
revoke all on function public.notificar_certificado_salida_finalizado() from public, anon;
revoke all on function public.vincular_calidad_salida_a_operacion() from public, anon;

-- 1.5) authz/iam/private internos (SECURITY DEFINER llamados por otras RPCs) --
revoke all on function authz._es_admin_app() from public, anon;
revoke all on function authz._puede_admin_org() from public, anon;
revoke all on function authz._puede_admin_scopes() from public, anon;
revoke all on function authz._resolve(jsonb, jsonb, jsonb) from public, anon;
revoke all on function authz.eval_condition(jsonb, jsonb, jsonb) from public, anon;
revoke all on function authz.uid() from public, anon;
revoke all on function authz.rebuild_role(text) from public, anon;
revoke all on function authz.refresh_permissions() from public, anon;
revoke all on function authz.sync_permiso(text) from public, anon;
revoke all on function authz.sync_user_profile(uuid) from public, anon;
revoke all on function authz.tg_sync_permisos() from public, anon;
revoke all on function authz.tg_sync_roles() from public, anon;
revoke all on function authz.tg_sync_usuarios() from public, anon;
revoke all on function private.create_auth_user(text, text) from public, anon;
revoke all on function private.update_auth_password(uuid, text) from public, anon;
revoke all on function private.get_user_role() from public, anon;
revoke all on function private.clean_operational_data(boolean, boolean, boolean, boolean) from public, anon;
revoke all on function private.calidad_firma_mensaje(tms_calidad_tareas) from public, anon;

-- 1.5b) Duplicados en public (mismas firmas que private; higiene total) ------
revoke all on function public.clean_operational_data(boolean, boolean, boolean, boolean) from public, anon;
revoke all on function public.create_auth_user(text, text) from public, anon;
revoke all on function public.update_auth_password(uuid, text) from public, anon;
revoke all on function public.get_user_role() from public, anon;

-- 1.6) Verificación post-revoke (debe devolver solo las excepciones) ---------
-- select count(*) from pg_proc p
--  join pg_namespace n on n.oid = p.pronamespace
-- where n.nspname in ('public','authz','iam','private')
--   and p.prokind = 'f'
--   and has_function_privilege('anon', p.oid, 'EXECUTE')
--   and p.proname not in ('buscar_nv_publico', 'verificar_certificado');
-- Excepciones INTENCIONALES con EXECUTE anon:
--   * buscar_nv_publico / verificar_certificado — públicas por diseño.
--   * private.is_admin() — la usan quals de políticas RLS; sin EXECUTE las
--     policies de anon fallarían con error en vez de devolver 0 filas
--     (fail-closed correcto = dejar el EXECUTE, la función devuelve false).

-- ---------------------------------------------------------------------------
-- PARTE 2 — IAM TELEMETRY
-- ---------------------------------------------------------------------------

-- 2.1) Tabla de denegaciones (solo lectura para admin; inserts vía definer) --
create table if not exists public.tms_iam_denegaciones (
  id               bigint generated always as identity primary key,
  ocurrido_en      timestamptz not null default now(),
  uid              uuid,
  rol              text,
  accion           text not null,          -- 'guardar_nv' | 'cambiar_estado_nv' | ...
  permiso          text,                   -- permiso IAM que faltaba (best effort)
  centro_costo     text,                   -- scope involucrado (si aplica)
  nv_id            bigint,                 -- N.V. involucrada (si aplica)
  nv_texto         text,                   -- N.V. legible (si aplica)
  motivo           text                    -- mensaje de denegación
);

alter table public.tms_iam_denegaciones enable row level security;

drop policy if exists iam_denegaciones_select_admin on public.tms_iam_denegaciones;
create policy iam_denegaciones_select_admin on public.tms_iam_denegaciones
  for select
  to authenticated
  using (public.is_admin());

revoke all on table public.tms_iam_denegaciones from public, anon;
grant select on table public.tms_iam_denegaciones to authenticated;

-- 2.2) Función de registro (SECURITY DEFINER: inserta aunque el llamante no
--      tenga permiso; nunca guarda payload, solo metadatos del intento). ------
create or replace function public.iam_log_denegacion(
  p_accion text,
  p_permiso text default null,
  p_centro_costo text default null,
  p_nv_id bigint default null,
  p_nv_texto text default null,
  p_motivo text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_rol text;
begin
  select rol into v_rol from public.tms_usuarios u
   where u.auth_uid = v_uid limit 1;

  insert into public.tms_iam_denegaciones
    (uid, rol, accion, permiso, centro_costo, nv_id, nv_texto, motivo)
  values
    (v_uid, v_rol, coalesce(p_accion, 'rpc'), p_permiso, p_centro_costo,
     p_nv_id, p_nv_texto, p_motivo);
end;
$$;

revoke all on function public.iam_log_denegacion(text, text, text, bigint, text, text) from public, anon;
grant execute on function public.iam_log_denegacion(text, text, text, bigint, text, text) to authenticated;

-- 2.3) Hook en guardar_nv — cuerpo EXACTO de la migración 173 + telemetría ----
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
  v_nv text := nullif(btrim(coalesce(p->>'nv', '')), '');
  v_version bigint := nullif(p->>'version', '')::bigint;
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
    -- UPDATE — contrato: id != null, version = row_version esperado.
    select * into r from public.tms_operaciones where id = v_id for update;
    if r.id is null then
      raise exception 'N.V. no encontrada';
    end if;

    -- PR-016 · Gate de concurrencia real.
    if v_version is not null then
      if v_version <> r.row_version then
        return jsonb_build_object(
          'ok', false,
          'conflict', true,
          'version', r.row_version,
          'message', 'Otra persona modificó esta N.V. mientras la editabas. Revisa los datos e intenta guardar de nuevo.'
        );
      end if;
    elsif public.nv_version_obligatoria() then
      -- Fase D: sin versión el UPDATE se rechaza (clientes legacy bloqueados).
      return jsonb_build_object(
        'ok', false,
        'version_required', true,
        'version', r.row_version,
        'message', 'Esta N.V. requiere la versión actual para editarse. Recarga la ficha e inténtalo de nuevo.'
      );
    end if;

    v_estado_destino := coalesce(nullif(p->>'estado', ''), r.estado);
    v_desde := r.estado;

    v_transition_only :=
      coalesce(v_cliente, r.cliente) is not distinct from r.cliente
      and coalesce(v_vendedor, r.vendedor) is not distinct from r.vendedor
      and coalesce(v_division, r.division) is not distinct from r.division
      and coalesce(v_ccosto, r.centro_costo) is not distinct from r.centro_costo
      and coalesce(v_nv_orange, r.nv_orange) is not distinct from r.nv_orange
      and coalesce(v_incidencia, r.incidencia) is not distinct from r.incidencia
      and coalesce(v_estado_incidencia, r.estado_incidencia) is not distinct from r.estado_incidencia
      and coalesce(v_obs_incidencia, r.observaciones_incidencia) is not distinct from r.observaciones_incidencia
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

    -- authz IAM: edición completa O transición de estado restringida.
    if not authz.can_manage_operacion_row(to_jsonb(r)) then
      if not v_transition_only or not authz.can_change_operacion_estado_row(to_jsonb(r), v_estado_destino) then
        perform public.iam_log_denegacion(
          'guardar_nv', 'manage_panel', r.centro_costo, r.id,
          coalesce(r.nv_ptm::text, r.nv_orange, r.nv_farmapack, r.varios),
          'No tienes permisos IAM para editar esta N.V.'
        );
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
             incidencia = coalesce(v_incidencia, incidencia),
             estado_incidencia = coalesce(v_estado_incidencia, estado_incidencia),
             observaciones_incidencia = coalesce(v_obs_incidencia, observaciones_incidencia),
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
    -- CREATE — contrato: id = null, version = null.
    if v_nv is null then
      return jsonb_build_object('ok', false, 'message', 'Debes indicar la N.V.');
    end if;

    if not authz.can_create_operacion_scope(v_ccosto) then
      perform public.iam_log_denegacion(
        'guardar_nv', 'manage_panel', v_ccosto, null, v_nv,
        'No tienes permisos IAM para crear N.V. en ese centro de costo.'
      );
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

  -- Devuelve la NUEVA versión (row_version) para que el cliente siga editando
  -- sin necesidad de un lookup extra.
  return jsonb_build_object(
    'ok', true,
    'id', r.id,
    'nv', coalesce(r.nv_ptm::text, r.nv_orange, r.nv_farmapack, r.varios),
    'estado', r.estado,
    'version', r.row_version
  );
end;
$$;

revoke all on function public.guardar_nv(jsonb) from public;
revoke all on function public.guardar_nv(jsonb) from anon;
grant execute on function public.guardar_nv(jsonb) to authenticated;

-- 2.4) Hook en cambiar_estado_nv — cuerpo EXACTO de la migración 173 + telemetría
drop function if exists public.cambiar_estado_nv(bigint, text, boolean);
drop function if exists public.cambiar_estado_nv(bigint, text, boolean, text);

create or replace function public.cambiar_estado_nv(
  p_id bigint,
  p_estado text,
  p_urgente boolean default null,
  p_expected_version bigint default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.tms_operaciones;
  v_desde text;
begin
  if not public._panel_puede_escribir() then
    raise exception 'No autorizado';
  end if;

  select * into r from public.tms_operaciones where id = p_id for update;
  if r.id is null then
    raise exception 'N.V. no encontrada';
  end if;

  -- PR-016 · Gate de concurrencia real (mismo token row_version).
  if p_expected_version is not null then
    if p_expected_version <> r.row_version then
      return jsonb_build_object(
        'ok', false,
        'conflict', true,
        'version', r.row_version,
        'message', 'Otra persona modificó esta N.V. mientras la editabas. Revisa los datos e intenta guardar de nuevo.'
      );
    end if;
  elsif public.nv_version_obligatoria() then
    return jsonb_build_object(
      'ok', false,
      'version_required', true,
      'version', r.row_version,
      'message', 'Esta N.V. requiere la versión actual para cambiar de estado. Recarga la ficha e inténtalo de nuevo.'
    );
  end if;

  -- authz IAM: transición de estado (manage_panel + scope + workflow).
  if not authz.can_change_operacion_estado_row(to_jsonb(r), p_estado) then
    perform public.iam_log_denegacion(
      'cambiar_estado_nv', 'manage_panel', r.centro_costo, r.id,
      coalesce(r.nv_ptm::text, r.nv_orange, r.nv_farmapack, r.varios),
      'No tienes permisos IAM para cambiar el estado de esta N.V.'
    );
    return jsonb_build_object(
      'ok', false,
      'forbidden', true,
      'message', 'No tienes permisos IAM para cambiar el estado de esta N.V.'
    );
  end if;

  if coalesce(r.estado, '') = 'Entregado' then
    return jsonb_build_object(
      'ok', false,
      'locked', true,
      'message', 'La N.V. está entregada. Solicita reapertura para volver a gestionarla.'
    );
  end if;

  v_desde := r.estado;

  update public.tms_operaciones
     set estado = p_estado,
         urgente = coalesce(p_urgente, urgente),
         origen = 'cco'
   where id = p_id
   returning * into r;

  insert into public.tms_operaciones_log (oper_id, accion, nv, despues)
  values (
    r.id,
    'estado',
    coalesce(r.nv_ptm::text, r.nv_orange, r.nv_farmapack, r.varios),
    jsonb_build_object('estado', r.estado, 'urgente', r.urgente)
  );

  perform public._nv_wf_log(r.id, v_desde, r.estado);

  -- Devuelve la NUEVA versión.
  return jsonb_build_object(
    'ok', true,
    'id', r.id,
    'estado', r.estado,
    'version', r.row_version
  );
end;
$$;

revoke all on function public.cambiar_estado_nv(bigint, text, boolean, bigint) from public;
revoke all on function public.cambiar_estado_nv(bigint, text, boolean, bigint) from anon;
grant execute on function public.cambiar_estado_nv(bigint, text, boolean, bigint) to authenticated;