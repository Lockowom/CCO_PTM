-- 152_recepcion_rbac_lockdown.sql
-- Recepciones en modo controlado:
-- solo ADMIN / admin delegado / CONTROL_CALIDAD pueden crear, editar o borrar.
-- El resto queda en solo lectura.

create or replace function public._reception_write_access()
returns boolean
language plpgsql
stable
security definer
set search_path to 'public'
as $function$
declare
  v_user record;
begin
  if auth.role() = 'service_role' then
    return true;
  end if;

  if auth.role() <> 'authenticated' or auth.uid() is null then
    return false;
  end if;

  select u.rol, coalesce(u.es_admin_delegado, false) as es_admin_delegado
    into v_user
  from public.tms_usuarios u
  where u.auth_uid = auth.uid()
    and u.activo = true
  limit 1;

  if not found then
    return false;
  end if;

  return v_user.rol = 'ADMIN'
    or v_user.es_admin_delegado = true
    or v_user.rol = 'CONTROL_CALIDAD';
end
$function$;

revoke execute on function public._reception_write_access() from public, anon;
grant execute on function public._reception_write_access() to authenticated, service_role;

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

  if auth.role() <> 'service_role' and not public._reception_write_access() then
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

drop policy if exists auth_all_recepciones on public.tms_recepciones;
drop policy if exists recepciones_select_auth on public.tms_recepciones;
drop policy if exists recepciones_insert_quality_admin on public.tms_recepciones;
drop policy if exists recepciones_update_quality_admin on public.tms_recepciones;
drop policy if exists recepciones_delete_quality_admin on public.tms_recepciones;

create policy recepciones_select_auth on public.tms_recepciones
  for select to authenticated
  using (true);

create policy recepciones_insert_quality_admin on public.tms_recepciones
  for insert to authenticated
  with check (public._reception_write_access());

create policy recepciones_update_quality_admin on public.tms_recepciones
  for update to authenticated
  using (public._reception_write_access())
  with check (public._reception_write_access());

create policy recepciones_delete_quality_admin on public.tms_recepciones
  for delete to authenticated
  using (public._reception_write_access());

drop policy if exists auth_all_recepcion_items on public.tms_recepcion_items;
drop policy if exists recepcion_items_select_auth on public.tms_recepcion_items;
drop policy if exists recepcion_items_insert_quality_admin on public.tms_recepcion_items;
drop policy if exists recepcion_items_update_quality_admin on public.tms_recepcion_items;
drop policy if exists recepcion_items_delete_quality_admin on public.tms_recepcion_items;

create policy recepcion_items_select_auth on public.tms_recepcion_items
  for select to authenticated
  using (true);

create policy recepcion_items_insert_quality_admin on public.tms_recepcion_items
  for insert to authenticated
  with check (public._reception_write_access());

create policy recepcion_items_update_quality_admin on public.tms_recepcion_items
  for update to authenticated
  using (public._reception_write_access())
  with check (public._reception_write_access());

create policy recepcion_items_delete_quality_admin on public.tms_recepcion_items
  for delete to authenticated
  using (public._reception_write_access());

drop policy if exists auth_all_recepciones_nac on public.tms_recepciones_nacionales;
drop policy if exists recepciones_nac_select_auth on public.tms_recepciones_nacionales;
drop policy if exists recepciones_nac_insert_quality_admin on public.tms_recepciones_nacionales;
drop policy if exists recepciones_nac_update_quality_admin on public.tms_recepciones_nacionales;
drop policy if exists recepciones_nac_delete_quality_admin on public.tms_recepciones_nacionales;

create policy recepciones_nac_select_auth on public.tms_recepciones_nacionales
  for select to authenticated
  using (true);

create policy recepciones_nac_insert_quality_admin on public.tms_recepciones_nacionales
  for insert to authenticated
  with check (public._reception_write_access());

create policy recepciones_nac_update_quality_admin on public.tms_recepciones_nacionales
  for update to authenticated
  using (public._reception_write_access())
  with check (public._reception_write_access());

create policy recepciones_nac_delete_quality_admin on public.tms_recepciones_nacionales
  for delete to authenticated
  using (public._reception_write_access());

drop policy if exists auth_all_recep_items_nac on public.tms_recepcion_items_nacionales;
drop policy if exists recep_items_nac_select_auth on public.tms_recepcion_items_nacionales;
drop policy if exists recep_items_nac_insert_quality_admin on public.tms_recepcion_items_nacionales;
drop policy if exists recep_items_nac_update_quality_admin on public.tms_recepcion_items_nacionales;
drop policy if exists recep_items_nac_delete_quality_admin on public.tms_recepcion_items_nacionales;

create policy recep_items_nac_select_auth on public.tms_recepcion_items_nacionales
  for select to authenticated
  using (true);

create policy recep_items_nac_insert_quality_admin on public.tms_recepcion_items_nacionales
  for insert to authenticated
  with check (public._reception_write_access());

create policy recep_items_nac_update_quality_admin on public.tms_recepcion_items_nacionales
  for update to authenticated
  using (public._reception_write_access())
  with check (public._reception_write_access());

create policy recep_items_nac_delete_quality_admin on public.tms_recepcion_items_nacionales
  for delete to authenticated
  using (public._reception_write_access());
