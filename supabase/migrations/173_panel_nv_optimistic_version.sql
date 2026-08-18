-- 173_panel_nv_optimistic_version.sql
-- ============================================================================
--  PR-016 · Optimistic version en Ingresar N.V. (TXT 05 §22)
--
--  OBJETIVO: que dos operadores no se pisen los cambios en la misma N.V.
--
--  DISEÑO (rev. P0 — revisión de PR):
--    * Token de concurrencia dedicado `row_version bigint NOT NULL DEFAULT 1`,
--      NO `fecha_estado` (ese campo es "cuándo cambió el estado" y, truncado a
--      día, colisiona: dos ediciones el mismo día no se detectan).
--    * Cada UPDATE incrementa `row_version` vía trigger (cualquier campo).
--    * El cliente envía la versión que cargó:
--        CREATE  → id = null, version = null
--        UPDATE  → id != null, version = row_version esperado
--    * La RPC aplica el UPDATE solo si `row_version = version enviada`; si la
--      fila fue modificada por otro operador, devuelve:
--        { ok:false, conflict:true, version:<actual> }   (no pisa nada)
--    * La RPC devuelve la NUEVA versión tras cada escritura:
--        { ok:true, ..., version:<nueva> }  → el cliente no necesita lookup.
--
--  COMPATIBILITY MODE (fases A→D):
--    A) version opcional + telemetry          (hoy: gate solo si se envía)
--    B) medir clientes sin version
--    C) legacy_without_version = 0            (verificar en logs)
--    D) version obligatoria en UPDATE         (switch `app.nv_require_version`=on)
--    Hoy el gate es COMPATIBILITY MODE, no enforcement definitivo.
--
--  NO toca inventario (regla "No inventory mutation"): solo tms_operaciones,
--  tms_operaciones_log y workflow. Las RPCs mantienen authz IAM completa:
--  `_panel_puede_escribir()` + `can_manage_operacion_row` /
--  `can_change_operacion_estado_row` / `can_create_operacion_scope`.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1) Columna de versión optimista (idempotente)
-- ---------------------------------------------------------------------------
alter table public.tms_operaciones
  add column if not exists row_version bigint not null default 1;

-- ---------------------------------------------------------------------------
-- 2) Trigger: incrementa row_version en CADA UPDATE (cualquier campo).
--    No toca `tms_operaciones_before_write` (que estampa fechas de estado);
--    es un trigger independiente BEFORE UPDATE, seguro ante orden de triggers.
-- ---------------------------------------------------------------------------
create or replace function public.tms_operaciones_bump_version()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.row_version := coalesce(old.row_version, 0) + 1;
  return new;
end;
$$;

drop trigger if exists trg_tms_operaciones_bump_version on public.tms_operaciones;
create trigger trg_tms_operaciones_bump_version
  before update on public.tms_operaciones
  for each row execute function public.tms_operaciones_bump_version();

-- ---------------------------------------------------------------------------
-- 3) Switch de fase D (hoy OFF → compatibility mode; ON → version obligatoria)
--    Permite activarlo sin redeploy:  set app.nv_require_version = 'on';
-- ---------------------------------------------------------------------------
create or replace function public.nv_version_obligatoria()
returns boolean
language sql
stable
set search_path = public
as $$
  select coalesce(current_setting('app.nv_require_version', true), '') = 'on';
$$;
revoke all on function public.nv_version_obligatoria() from public, anon;
grant execute on function public.nv_version_obligatoria() to authenticated;

-- ---------------------------------------------------------------------------
-- 4) guardar_nv(jsonb) — CREAR o EDITAR N.V. con gate de versión optimista.
--    Espejo de la 158 (authz IAM + transition-only + locked Entregado) +
--    row_version como token de concurrencia.
-- ---------------------------------------------------------------------------
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
grant execute on function public.guardar_nv(jsonb) to authenticated;

-- ---------------------------------------------------------------------------
-- 5) cambiar_estado_nv — cambio rápido de estado con el MISMO gate.
--    Firma: (p_id, p_estado, p_urgente, p_expected_version bigint default null).
--    Se DROP de las firmas previas (3 args y la provisional de 4 args text).
-- ---------------------------------------------------------------------------
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
grant execute on function public.cambiar_estado_nv(bigint, text, boolean, bigint) to authenticated;

-- ---------------------------------------------------------------------------
-- ROLLBACK (documentado)
-- ---------------------------------------------------------------------------
--  1) DROP de la columna (destructivo: pierde el historial de versiones):
--       alter table public.tms_operaciones drop column if exists row_version;
--     ⚠️ Solo si no hay escrituras nuevas. Si hay UPDATEs pendientes, mejor
--     conservar la columna y DROP solo trigger + funciones:
--  2) DROP del trigger y la función de bump (NO destructivo):
--       drop trigger if exists trg_tms_operaciones_bump_version on public.tms_operaciones;
--       drop function if exists public.tms_operaciones_bump_version();
--     Con esto los gates de versión dejan de aplicarse (las RPCs existentes de
--     la migración 158 vuelven a ser las efectivas tras re-aplicar 158 o tras
--     hacer DROP de las firmas nuevas y re-crear las viejas).
--  3) DROP de las funciones nuevas:
--       drop function if exists public.guardar_nv(jsonb);
--       drop function if exists public.cambiar_estado_nv(bigint, text, boolean, bigint);
--       drop function if exists public.nv_version_obligatoria();
--     Y re-aplicar la migración 158 (firmas 3-arg) o restaurar desde el diff
--     de Supabase antes de este cambio.
--  4) El cliente: `versionDeRow` lee `row_version`; si la columna no existe,
--     vuelve a `null` (compat mode) y el gate no aplica → comportamiento igual
--     al pre-PR-016.
--  5) Verificación post-rollback: un UPDATE en tms_operaciones NO incrementa
--     `row_version` (columna eliminada) y guardar_nv/cambiar_estado_nv aceptan
--     UPDATEs sin versión (compat mode). Correr la suite + smoke de guardado.
--  PELIGRO: no hacer rollback de la columna si ya se activó la fase D
--  (`app.nv_require_version = on`): los clientes con versión quedarían con la
--  columna borrada y la fase D exigiría una versión que ya no existe. Orden
--  correcto para revertir la fase D:  set app.nv_require_version = 'off';
--  → luego rollback de la migración.
-- ============================================================================