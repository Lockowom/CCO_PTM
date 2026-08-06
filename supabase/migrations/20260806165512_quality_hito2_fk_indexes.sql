create index if not exists idx_calidad_asig_locked_by
  on public.tms_calidad_asignaciones (locked_by)
  where locked_by is not null;

create index if not exists idx_calidad_asig_progress_updated_by
  on public.tms_calidad_asignaciones (progress_updated_by)
  where progress_updated_by is not null;
