-- El archivo queda legible solamente para quien ya administra ubicaciones.
-- No se concede INSERT/UPDATE/DELETE directo al cliente.

create policy wms_ubicaciones_archivadas_admin_select
  on public.wms_ubicaciones_archivadas
  for select to authenticated
  using (public.usuario_tiene_algun_permiso(array['manage_locations']));

grant select on table public.wms_ubicaciones_archivadas to authenticated;
