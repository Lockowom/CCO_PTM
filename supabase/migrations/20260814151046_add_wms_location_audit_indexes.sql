create index if not exists idx_wms_ubicaciones_creado_por
  on public.wms_ubicaciones (creado_por) where creado_por is not null;
create index if not exists idx_wms_ubicaciones_actualizado_por
  on public.wms_ubicaciones (actualizado_por) where actualizado_por is not null;
create index if not exists idx_wms_ubicaciones_historial_actor
  on public.wms_ubicaciones_historial (actor_id, creado_en desc)
  where actor_id is not null;
