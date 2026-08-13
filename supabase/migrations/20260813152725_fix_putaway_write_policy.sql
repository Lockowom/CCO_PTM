-- Put Away es una pantalla operativa accesible con view_entry o process_entry.
-- La politica anterior permitia abrirla con ambos permisos, pero solo dejaba
-- guardar a process_entry, generando errores RLS para operarios autorizados.

drop policy if exists putaway_visual_insert on public.wms_putaway_ubicaciones;
create policy putaway_visual_insert on public.wms_putaway_ubicaciones
  for insert to authenticated
  with check (
    coalesce(
      public.usuario_tiene_algun_permiso(array['view_entry', 'process_entry']),
      false
    )
    and length(btrim(ubicacion)) > 0
    and length(btrim(codigo)) > 0
  );

-- La actualizacion/eliminacion se conserva exclusivamente para
-- manage_locations. Los operarios registran asignaciones nuevas y el cliente
-- usa ON CONFLICT DO NOTHING para reintentos idempotentes.
revoke all on table public.wms_putaway_ubicaciones from public, anon;
grant select, insert on table public.wms_putaway_ubicaciones to authenticated;
grant select, insert, update, delete on table public.wms_putaway_ubicaciones to service_role;

comment on policy putaway_visual_insert on public.wms_putaway_ubicaciones is
  'Permite registrar Put Away a usuarios autorizados para ver/procesar el modulo; nunca a anon.';
