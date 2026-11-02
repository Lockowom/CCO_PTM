-- Retiro masivo de referencias visuales de Put Away.
-- No elimina SKU, no elimina registros WMS, no cambia cantidad ni escribe ERP.

create or replace function public.retirar_putaway_ubicaciones(p_items jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_item jsonb;
  v_ubicacion text;
  v_codigo text;
  v_actualizados integer;
  v_retirados integer := 0;
  v_omitidos integer := 0;
  v_resultados jsonb := '[]'::jsonb;
begin
  if auth.uid() is null or not coalesce(public.usuario_tiene_algun_permiso(array['manage_locations']), false) then
    raise exception 'Acceso denegado para retirar ubicaciones Put Away' using errcode = '42501';
  end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Debe enviar at least one location and SKU' using errcode = '22023';
  end if;
  if jsonb_array_length(p_items) > 500 then
    raise exception 'Máximo 500 ubicaciones por lote' using errcode = '22023';
  end if;

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    v_ubicacion := upper(btrim(coalesce(v_item->>'ubicacion', '')));
    v_codigo := upper(btrim(coalesce(v_item->>'codigo', '')));

    if v_ubicacion = '' or v_codigo = '' then
      v_omitidos := v_omitidos + 1;
      v_resultados := v_resultados || jsonb_build_array(jsonb_build_object(
        'ubicacion', v_ubicacion,
        'codigo', v_codigo,
        'estado', 'OMITIDO',
        'motivo', 'Ubicación y SKU son obligatorios'
      ));
      continue;
    end if;

    with retirados as (
      update public.wms_ubicaciones w
         set registrado_putaway = false,
             origen_registro = 'inventario'
       where upper(btrim(w.ubicacion)) = v_ubicacion
         and upper(btrim(coalesce(w.codigo, ''))) = v_codigo
         and coalesce(w.registrado_putaway, false)
      returning w.id
    )
    select count(*) into v_actualizados from retirados;

    if v_actualizados = 0 then
      v_omitidos := v_omitidos + 1;
      v_resultados := v_resultados || jsonb_build_array(jsonb_build_object(
        'ubicacion', v_ubicacion,
        'codigo', v_codigo,
        'estado', 'OMITIDO',
        'motivo', 'No existe como registro Put Away activo'
      ));
    else
      v_retirados := v_retirados + v_actualizados;
      v_resultados := v_resultados || jsonb_build_array(jsonb_build_object(
        'ubicacion', v_ubicacion,
        'codigo', v_codigo,
        'estado', 'RETIRADO',
        'registros_actualizados', v_actualizados
      ));
    end if;
  end loop;

  return jsonb_build_object(
    'retirados', v_retirados,
    'omitidos', v_omitidos,
    'resultados', v_resultados
  );
end;
$$;

revoke all on function public.retirar_putaway_ubicaciones(jsonb) from public, anon;
grant execute on function public.retirar_putaway_ubicaciones(jsonb) to authenticated, service_role;

comment on function public.retirar_putaway_ubicaciones(jsonb) is
  'Retira asociaciones visuales Put Away en lote. No borra SKU ni afecta cantidades o ERP.';
