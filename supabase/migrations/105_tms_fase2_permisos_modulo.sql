-- ============================================================================
--  105_tms_fase2_permisos_modulo.sql  ·  TMS (Transporte) — Fase 2: permisos + Vistas
--  Da de alta el módulo TMS reconstruido: permisos en tms_permisos (casillas en
--  Admin → Roles) y su fila en tms_modules_config (tarjeta en Admin → Vistas).
--  El frontend (App.jsx / modules.js / Navbar / permissions.js) se wirea en el
--  mismo commit. Ruta: /tms/control (Torre de Control).
-- ============================================================================
insert into public.tms_permisos (id, nombre, modulo) values
  ('view_tms',     'TMS · Ver Torre de Control',               'TMS (Transporte)'),
  ('manage_tms',   'TMS · Gestionar (asignar, estados, POD)',  'TMS (Transporte)'),
  ('supervise_tms','TMS · Supervisar (cancelar, incidencias)', 'TMS (Transporte)')
on conflict (id) do update set nombre = excluded.nombre, modulo = excluded.modulo;

insert into public.tms_modules_config (id, enabled, label, description)
values ('tms', true, 'TMS (Transporte)', 'Gestión de transporte propio: órdenes, asignación, ruta y prueba de entrega.')
on conflict (id) do update set label = excluded.label, description = excluded.description;
