-- Trazabilidad de reconocimiento y resolución de incidentes.
alter table public.system_alerts
  add column if not exists acknowledged_at timestamptz,
  add column if not exists acknowledged_by text,
  add column if not exists resolution_note text;
