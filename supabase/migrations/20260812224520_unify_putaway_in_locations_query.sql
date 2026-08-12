-- La consulta general de Ubicaciones debe ver tambien las asignaciones
-- visuales creadas en Put Away. La politica conserva el control por permiso.
drop policy if exists putaway_visual_select on public.wms_putaway_ubicaciones;
create policy putaway_visual_select on public.wms_putaway_ubicaciones
  for select to authenticated
  using (
    public.usuario_tiene_algun_permiso(
      array['view_entry', 'process_entry', 'manage_locations', 'view_locations']
    )
  );
