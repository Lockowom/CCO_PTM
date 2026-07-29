-- ============================================================================
-- 169_fix_cleanup_mass_delete_where_clause.sql
-- Corrige la limpieza operativa para entornos que bloquean DELETE sin WHERE.
-- ============================================================================

create or replace function private.clean_operational_data(
  p_clean_nv boolean,
  p_clean_partidas boolean,
  p_clean_series boolean,
  p_clean_farmapack boolean
)
returns text
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  msg text := '';
begin
  if not private.is_admin() then
    raise exception 'Acceso denegado: solo administradores';
  end if;

  if p_clean_nv then
    delete from public.tms_entregas where true;
    delete from public.tms_nv_diarias where true;
    msg := msg || 'NV y Entregas eliminadas. ';
  end if;

  if p_clean_partidas then
    delete from public.tms_partidas where true;
    msg := msg || 'Partidas eliminadas. ';
  end if;

  if p_clean_series then
    delete from public.tms_series where true;
    msg := msg || 'Series eliminadas. ';
  end if;

  if p_clean_farmapack then
    delete from public.tms_farmapack where true;
    msg := msg || 'Datos Farmapack eliminados. ';
  end if;

  if msg = '' then
    return 'No se seleccionaron datos para eliminar.';
  end if;

  insert into public.tms_auditoria(actor_auth_uid, actor_rol, tabla, accion, registro_id, datos_antes, datos_despues)
  values (
    auth.uid(),
    (select rol from public.tms_usuarios where auth_uid = auth.uid() limit 1),
    'tms_operacional', 'CLEAN_OPERATIONAL', null,
    jsonb_build_object('nv', p_clean_nv, 'partidas', p_clean_partidas, 'series', p_clean_series, 'farmapack', p_clean_farmapack),
    jsonb_build_object('resultado', msg)
  );

  return msg;
exception
  when others then
    return 'Error: ' || sqlerrm;
end;
$function$;
