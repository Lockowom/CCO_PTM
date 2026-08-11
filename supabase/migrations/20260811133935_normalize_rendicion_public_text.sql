begin;

update public.rendicion_public_links
set nombre = U&'Rendiciones t\00E9cnicos PTM', updated_at = now()
where es_public_default;

create or replace function public.rendicion_admin_toggle_link(p_id uuid, p_activo boolean)
returns boolean language plpgsql security definer set search_path = public
as $$
begin
  if not coalesce(public.usuario_tiene_algun_permiso(array['manage_rendiciones']), false) then
    raise exception 'Acceso denegado';
  end if;
  if exists (
    select 1 from public.rendicion_public_links
    where id = p_id and es_public_default
  ) then
    raise exception '%', U&'El enlace principal de t\00E9cnicos no se puede desactivar';
  end if;
  update public.rendicion_public_links set activo=p_activo,updated_at=now() where id=p_id;
  if not found then raise exception 'Enlace no encontrado'; end if;
  return true;
end;
$$;

revoke all on function public.rendicion_admin_toggle_link(uuid,boolean) from public, anon;
grant execute on function public.rendicion_admin_toggle_link(uuid,boolean) to authenticated, service_role;

commit;
