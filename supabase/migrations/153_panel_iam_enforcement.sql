-- ============================================================================
-- 153_panel_iam_enforcement.sql
-- Hardening IAM sobre N.V. / Panel:
--  - Cierra lectura de tms_operaciones y su log con RLS real por permiso/ámbito.
--  - Conecta guardar_nv / cambiar_estado_nv con scope + ABAC de edición.
--  - Corrige la política ejemplo nv_editar_ambito para que use estados reales.
-- ============================================================================

-- ── Helper: ¿tiene CUALQUIERA de estos permisos dentro del ámbito indicado? ──
create or replace function authz.can_any_on_scope(
  p_codes text[],
  p_scope_type text,
  p_scope_code text
) returns boolean
language sql
stable
security definer
set search_path = iam, authz, public
as $$
  select coalesce(private.is_admin(), false)
      or exists (
        select 1
        from iam.user_effective_permissions e
        where e.user_id = auth.uid()
          and e.permission = any(p_codes)
          and (
            e.scope_type = 'global'
            or (
              p_scope_code is not null
              and e.scope_type = p_scope_type::iam.scope_type
              and e.scope_code is not distinct from p_scope_code
            )
          )
      );
$$;
revoke all on function authz.can_any_on_scope(text[], text, text) from public, anon;
grant execute on function authz.can_any_on_scope(text[], text, text) to authenticated;

-- ── Lectura real de N.V.: permiso + scope para Panel; TMS conserva lectura. ───
create or replace function authz.can_read_operacion_row(p_row jsonb)
returns boolean
language plpgsql
stable
security definer
set search_path = iam, authz, public
as $$
declare
  v_ccosto text := nullif(btrim(coalesce(p_row->>'centro_costo', '')), '');
begin
  if coalesce(private.is_admin(), false) then
    return true;
  end if;

  if coalesce(public.usuario_tiene_algun_permiso(array['view_tms', 'manage_tms', 'supervise_tms']), false) then
    return true;
  end if;

  if not coalesce(public.usuario_tiene_algun_permiso(array[
    'view_panel', 'panel_ingresar', 'panel_info', 'panel_tv', 'panel_builder', 'manage_panel'
  ]), false) then
    return false;
  end if;

  if v_ccosto is null then
    return true;
  end if;

  return authz.can_any_on_scope(
    array['view_panel', 'panel_ingresar', 'panel_info', 'panel_tv', 'panel_builder', 'manage_panel'],
    'centro_costo',
    v_ccosto
  );
end;
$$;
revoke all on function authz.can_read_operacion_row(jsonb) from public, anon;
grant execute on function authz.can_read_operacion_row(jsonb) to authenticated;

-- ── Escritura real de N.V.: permiso manage_panel + ABAC + scope del registro. ─
create or replace function authz.can_manage_operacion_row(p_row jsonb)
returns boolean
language plpgsql
stable
security definer
set search_path = iam, authz, public
as $$
declare
  v_ccosto text := nullif(btrim(coalesce(p_row->>'centro_costo', '')), '');
begin
  if coalesce(private.is_admin(), false) then
    return true;
  end if;

  if not coalesce(public.usuario_tiene_algun_permiso(array['manage_panel']), false) then
    return false;
  end if;

  if not authz.policy_check('nv', 'editar', p_row) then
    return false;
  end if;

  if v_ccosto is null then
    return authz.can_any_on_scope(array['manage_panel'], 'centro_costo', null);
  end if;

  return authz.can_any_on_scope(array['manage_panel'], 'centro_costo', v_ccosto);
end;
$$;
revoke all on function authz.can_manage_operacion_row(jsonb) from public, anon;
grant execute on function authz.can_manage_operacion_row(jsonb) to authenticated;

-- ── Alta de N.V.: exige manage_panel y scope válido del centro de costo. ─────
create or replace function authz.can_create_operacion_scope(p_centro_costo text)
returns boolean
language plpgsql
stable
security definer
set search_path = iam, authz, public
as $$
declare
  v_ccosto text := nullif(btrim(coalesce(p_centro_costo, '')), '');
begin
  if coalesce(private.is_admin(), false) then
    return true;
  end if;

  if not coalesce(public.usuario_tiene_algun_permiso(array['manage_panel']), false) then
    return false;
  end if;

  if v_ccosto is null then
    return authz.can_any_on_scope(array['manage_panel'], 'centro_costo', null);
  end if;

  return authz.can_any_on_scope(array['manage_panel'], 'centro_costo', v_ccosto);
end;
$$;
revoke all on function authz.can_create_operacion_scope(text) from public, anon;
grant execute on function authz.can_create_operacion_scope(text) to authenticated;

-- ── RLS real para operaciones y su bitácora ──────────────────────────────────
drop policy if exists p_tms_operaciones_sel on public.tms_operaciones;
create policy p_tms_operaciones_sel
on public.tms_operaciones
for select
to authenticated
using (authz.can_read_operacion_row(to_jsonb(tms_operaciones.*)));

drop policy if exists p_tms_oper_log_sel on public.tms_operaciones_log;
create policy p_tms_oper_log_sel
on public.tms_operaciones_log
for select
to authenticated
using (
  coalesce(private.is_admin(), false)
  or exists (
    select 1
    from public.tms_operaciones o
    where o.id = tms_operaciones_log.oper_id
      and authz.can_read_operacion_row(to_jsonb(o))
  )
);

-- ── Política ABAC canónica: estados reales del flujo de N.V. ─────────────────
update iam.policies
   set descripcion = 'Editar N.V. solo si pertenece a un centro de costo permitido y aún no está en estados de despacho/cierre.',
       condicion = '{
         "all": [
           {
             "any": [
               { "attr": "ctx.sin_limite_centro", "op": "eq", "value": true },
               { "attr": "row.centro_costo", "op": "in", "value": "ctx.centros_costo" }
             ]
           },
           {
             "attr": "row.estado",
             "op": "nin",
             "value": ["Shipping", "Currier", "En Ruta", "Entregado", "NULA", "REFACTURADO", "RECHAZADO"]
           }
         ]
       }'::jsonb,
       updated_at = now()
 where codigo = 'nv_editar_ambito';

-- ── Probador: ahora refleja permiso + scope + ABAC reales ────────────────────
create or replace function public.iam_puede_editar_nv(p_id bigint, p_uid uuid default null)
returns jsonb
language plpgsql
security definer
set search_path = public, iam, authz
as $$
declare
  v_row jsonb;
  v_ctx jsonb;
  v_ok boolean;
  v_msg text;
begin
  select to_jsonb(o) into v_row
  from public.tms_operaciones o
  where o.id = p_id;

  if v_row is null then
    return jsonb_build_object('permitida', false, 'error', 'N.V. inexistente');
  end if;

  v_ctx := authz.user_context(p_uid);
  v_ok := authz.can_manage_operacion_row(v_row);

  if v_ok then
    v_msg := 'Edición permitida por IAM.';
  elsif not coalesce(public.usuario_tiene_algun_permiso(array['manage_panel']), false) then
    v_msg := 'Falta el permiso manage_panel.';
  else
    v_msg := 'La N.V. queda fuera de tu ámbito o bloqueada por la política ABAC.';
  end if;

  return jsonb_build_object(
    'permitida', v_ok,
    'message', v_msg,
    'contexto', v_ctx,
    'nv', jsonb_build_object(
      'id', p_id,
      'centro_costo', v_row->>'centro_costo',
      'estado', v_row->>'estado',
      'vendedor', v_row->>'vendedor',
      'cliente', v_row->>'cliente'
    )
  );
end;
$$;
revoke all on function public.iam_puede_editar_nv(bigint, uuid) from public, anon;
grant execute on function public.iam_puede_editar_nv(bigint, uuid) to authenticated;

-- ── Guard de cambio de estado conectado al hardening IAM ─────────────────────
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
  if not public._panel_puede_escribir() then
    raise exception 'No autorizado';
  end if;

  select * into r from public.tms_operaciones where id = p_id;
  if r.id is null then
    raise exception 'N.V. no encontrada';
  end if;

  if not authz.can_manage_operacion_row(to_jsonb(r)) then
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

  return jsonb_build_object('ok', true, 'id', r.id, 'estado', r.estado);
end;
$$;

-- ── Guard de alta / edición conectado al hardening IAM ───────────────────────
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
  v_dup public.tms_operaciones;
  r public.tms_operaciones;
  v_desde text;
begin
  if not public._panel_puede_escribir() then
    raise exception 'No autorizado';
  end if;

  if v_id is not null then
    select * into r from public.tms_operaciones where id = v_id;
    if r.id is null then
      raise exception 'N.V. no encontrada';
    end if;

    if not authz.can_manage_operacion_row(to_jsonb(r)) then
      return jsonb_build_object(
        'ok', false,
        'forbidden', true,
        'message', 'No tienes permisos IAM para editar esta N.V.'
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
       set cliente = coalesce(v_cliente, cliente),
           vendedor = coalesce(v_vendedor, vendedor),
           division = coalesce(v_division, division),
           centro_costo = coalesce(v_ccosto, centro_costo),
           nv_orange = coalesce(v_nv_orange, nv_orange),
           incidencia = coalesce(v_incidencia, incidencia),
           estado_incidencia = coalesce(v_estado_incidencia, estado_incidencia),
           observaciones_incidencia = coalesce(v_obs_incidencia, observaciones_incidencia),
           estado = coalesce(nullif(p->>'estado', ''), estado),
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
    'estado', r.estado,
    'nv_orange', r.nv_orange,
    'reabierta', r.reabierta,
    'motivo_reapertura', r.motivo_reapertura
  );
end;
$$;
