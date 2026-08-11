-- Correccion operativa controlada para errores humanos de estado.
-- El flujo normal sigue siendo estrictamente secuencial; esta excepcion solo
-- permite En Ruta -> Shipping mediante un RPC autorizado, con motivo y auditoria.

create or replace function public.tms_operaciones_before_write()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_cambio_estado boolean := false;
  v_reapertura_aprobada boolean := false;
  v_correccion_shipping boolean := false;
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
    v_correccion_shipping :=
      current_setting('app.nv_workflow_correction', true) = 'on'
      and old.estado = 'En Ruta'
      and new.estado = 'Shipping';

    if v_cambio_estado
       and new.origen = 'cco'
       and current_setting('app.nv_workflow_migration', true) is distinct from 'on'
       and not v_reapertura_aprobada
       and not v_correccion_shipping
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

create or replace function public.corregir_estado_nv_a_shipping(
  p_id bigint,
  p_motivo text
) returns jsonb
language plpgsql
security definer
set search_path = public, authz
as $$
declare
  r public.tms_operaciones;
  v_motivo text := nullif(btrim(coalesce(p_motivo, '')), '');
  v_fecha_en_ruta_anterior date;
  v_fecha_despacho_anterior date;
begin
  if not public._panel_puede_escribir() then
    raise exception using errcode = '42501', message = 'No autorizado';
  end if;

  if v_motivo is null
     or char_length(v_motivo) < 10
     or char_length(v_motivo) > 500
     or v_motivo !~* '[a-záéíóúüñ]' then
    return jsonb_build_object(
      'ok', false,
      'validation', true,
      'message', 'Escribe un motivo real de entre 10 y 500 caracteres.'
    );
  end if;

  select * into r
  from public.tms_operaciones
  where id = p_id
  for update;

  if r.id is null then
    raise exception 'N.V. no encontrada';
  end if;

  if not authz.can_change_operacion_estado_row(to_jsonb(r), r.estado) then
    return jsonb_build_object(
      'ok', false,
      'forbidden', true,
      'message', 'No tienes permisos para corregir esta N.V.'
    );
  end if;

  if r.estado <> 'En Ruta' then
    return jsonb_build_object(
      'ok', false,
      'invalid_state', true,
      'estado', r.estado,
      'message', 'La correccion solo esta disponible cuando la N.V. esta En Ruta.'
    );
  end if;

  v_fecha_en_ruta_anterior := r.fecha_en_ruta;
  v_fecha_despacho_anterior := r.fecha_despacho;

  -- La marca es local a la transaccion y el trigger solo la acepta para el
  -- retroceso exacto En Ruta -> Shipping.
  perform set_config('app.nv_workflow_correction', 'on', true);

  update public.tms_operaciones
  set estado = 'Shipping',
      fecha_en_ruta = null,
      fecha_despacho = null,
      shipping_subestado = null,
      shipping_pausa_desde = null,
      shipping_pausa_elegible_sla = false,
      origen = 'cco'
  where id = p_id
  returning * into r;

  insert into public.tms_operaciones_log (oper_id, accion, nv, despues, actor)
  values (
    r.id,
    'estado_correccion',
    coalesce(r.nv_ptm::text, r.nv_orange, r.nv_farmapack, r.varios),
    jsonb_build_object(
      'desde', 'En Ruta',
      'estado', 'Shipping',
      'motivo', v_motivo,
      'fecha_en_ruta_anterior', v_fecha_en_ruta_anterior,
      'fecha_despacho_anterior', v_fecha_despacho_anterior,
      'fecha_correccion', now()
    ),
    public._panel_actor()
  );

  perform public._nv_wf_log(r.id, 'En Ruta', 'Shipping');

  return jsonb_build_object(
    'ok', true,
    'id', r.id,
    'estado', r.estado,
    'fecha_estado', r.fecha_estado,
    'fecha_en_ruta', r.fecha_en_ruta,
    'fecha_despacho', r.fecha_despacho,
    'message', 'N.V. devuelta a Shipping. La correccion quedo registrada en la bitacora.'
  );
end;
$$;

revoke all on function public.corregir_estado_nv_a_shipping(bigint, text) from public, anon;
grant execute on function public.corregir_estado_nv_a_shipping(bigint, text) to authenticated, service_role;

comment on function public.corregir_estado_nv_a_shipping(bigint, text) is
  'Correccion auditada y autorizada de En Ruta a Shipping. No altera la secuencia normal del workflow.';
