-- Evita falsos positivos en Admin > Limpieza: los errores de DELETE deben
-- llegar al cliente como error RPC, nunca como un texto de éxito.
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
  v_nv bigint := 0;
  v_entregas bigint := 0;
  v_partidas bigint := 0;
  v_series bigint := 0;
  v_farmapack bigint := 0;
begin
  if not private.is_admin() then
    raise exception 'Acceso denegado: solo administradores';
  end if;

  if p_clean_nv then
    delete from public.tms_entregas where true;
    get diagnostics v_entregas = row_count;
    delete from public.tms_nv_diarias where true;
    get diagnostics v_nv = row_count;
    msg := msg || format('NV %s y entregas %s eliminadas. ', v_nv, v_entregas);
  end if;

  if p_clean_partidas then
    delete from public.tms_partidas where true;
    get diagnostics v_partidas = row_count;
    msg := msg || format('Partidas %s eliminadas. ', v_partidas);
  end if;

  if p_clean_series then
    delete from public.tms_series where true;
    get diagnostics v_series = row_count;
    msg := msg || format('Series %s eliminadas. ', v_series);
  end if;

  if p_clean_farmapack then
    delete from public.tms_farmapack where true;
    get diagnostics v_farmapack = row_count;
    msg := msg || format('Farmapack %s eliminados. ', v_farmapack);
  end if;

  if msg = '' then
    return 'No se seleccionaron datos para eliminar.';
  end if;

  insert into public.tms_auditoria(
    actor_auth_uid, actor_rol, tabla, accion, registro_id,
    datos_antes, datos_despues
  )
  values (
    auth.uid(),
    (select rol from public.tms_usuarios where auth_uid = auth.uid() limit 1),
    'tms_operacional', 'CLEAN_OPERATIONAL', null,
    jsonb_build_object(
      'nv', p_clean_nv,
      'partidas', p_clean_partidas,
      'series', p_clean_series,
      'farmapack', p_clean_farmapack
    ),
    jsonb_build_object(
      'nv', v_nv,
      'entregas', v_entregas,
      'partidas', v_partidas,
      'series', v_series,
      'farmapack', v_farmapack
    )
  );

  return 'Limpieza completada: ' || msg;
exception
  when others then
    -- Revierte la función completa y conserva el código/mensaje de PostgreSQL.
    raise;
end;
$function$;

create or replace function public.clean_operational_data(
  p_clean_nv boolean,
  p_clean_partidas boolean,
  p_clean_series boolean,
  p_clean_farmapack boolean
)
returns text
language plpgsql
set search_path to 'public'
as $function$
begin
  return private.clean_operational_data(
    p_clean_nv, p_clean_partidas, p_clean_series, p_clean_farmapack
  );
end;
$function$;

revoke all on function public.clean_operational_data(boolean, boolean, boolean, boolean) from public, anon;
grant execute on function public.clean_operational_data(boolean, boolean, boolean, boolean) to authenticated, service_role;
