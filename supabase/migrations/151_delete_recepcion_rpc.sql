-- 151_delete_recepcion_rpc.sql
-- Elimina una recepción completa desde un único punto seguro.
-- Cubre Importación y Nacional, y deja el frontend sin borrados manuales por tabla.

create or replace function public.eliminar_recepcion_completa(
  p_id uuid,
  p_origen text default 'IMPORTACION'
)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_origen text := upper(trim(coalesce(p_origen, 'IMPORTACION')));
  v_proveedor text;
  v_items integer := 0;
begin
  if auth.role() <> 'authenticated' and auth.role() <> 'service_role' then
    raise exception 'No autenticado';
  end if;

  if auth.role() <> 'service_role'
     and not (
       coalesce(private.is_admin(), false)
       or coalesce(public.usuario_tiene_algun_permiso(array['process_reception', 'manage_data_import']), false)
     ) then
    raise exception 'Sin permisos para eliminar recepciones';
  end if;

  if p_id is null then
    raise exception 'El identificador de la recepción es obligatorio';
  end if;

  if v_origen not in ('IMPORTACION', 'NACIONAL') then
    raise exception 'Origen inválido: %', v_origen;
  end if;

  if v_origen = 'NACIONAL' then
    select proveedor into v_proveedor
    from public.tms_recepciones_nacionales
    where id = p_id
    for update;

    if not found then
      return jsonb_build_object('ok', false, 'error', 'La recepción nacional no existe o ya fue eliminada');
    end if;

    delete from public.tms_recepcion_items_nacionales
    where recepcion_id = p_id;
    get diagnostics v_items = row_count;

    delete from public.tms_recepciones_nacionales
    where id = p_id;
  else
    select proveedor into v_proveedor
    from public.tms_recepciones
    where id = p_id
    for update;

    if not found then
      return jsonb_build_object('ok', false, 'error', 'La recepción de importación no existe o ya fue eliminada');
    end if;

    delete from public.tms_recepcion_items
    where recepcion_id = p_id;
    get diagnostics v_items = row_count;

    delete from public.tms_recepciones
    where id = p_id;
  end if;

  return jsonb_build_object(
    'ok', true,
    'id', p_id,
    'origen', v_origen,
    'proveedor', coalesce(v_proveedor, ''),
    'items_eliminados', v_items
  );
end
$function$;

revoke execute on function public.eliminar_recepcion_completa(uuid, text) from public, anon;
grant execute on function public.eliminar_recepcion_completa(uuid, text) to authenticated, service_role;
