-- ============================================================================
--  096_panel_permisos_por_pantalla.sql
--  Control del Panel PTM "módulo x módulo": permisos por PANTALLA (paridad con
--  Conteo/Análisis/Post-Venta, que ya tienen permisos por pestaña).
--
--  Agrega 4 permisos nuevos a tms_permisos (aparecen como casillas en
--  Admin → Roles, módulo Panel PTM). Son ADITIVOS: `view_panel` sigue siendo el
--  umbral que da acceso a TODO el Panel (ROUTE_PERMISSIONS acepta el permiso de
--  la pantalla O view_panel), así que ningún rol existente pierde acceso.
-- ============================================================================
insert into public.tms_permisos (id, nombre, modulo) values
  ('panel_ingresar', 'Panel · pantalla Ingresar N.V.',        'Panel PTM'),
  ('panel_info',     'Panel · pantalla Info N.V. (consulta)', 'Panel PTM'),
  ('panel_tv',       'Panel · Modo TV',                        'Panel PTM'),
  ('panel_builder',  'Panel · Builder de dashboards',          'Panel PTM')
on conflict (id) do update set nombre = excluded.nombre, modulo = excluded.modulo;
