create index if not exists idx_putaway_visual_creado_por
  on public.wms_putaway_ubicaciones (creado_por)
  where creado_por is not null;

create index if not exists idx_putaway_visual_actualizado_por
  on public.wms_putaway_ubicaciones (actualizado_por)
  where actualizado_por is not null;

create index if not exists idx_putaway_historial_actor
  on public.wms_putaway_ubicaciones_historial (actor_id)
  where actor_id is not null;
