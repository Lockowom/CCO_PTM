-- Conserva los metadatos de pausas Shipping ya cerradas al corregir un estado.
-- La correccion solo limpia las marcas del despacho equivocado.

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
