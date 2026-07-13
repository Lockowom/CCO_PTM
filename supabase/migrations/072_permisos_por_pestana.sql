-- 072_permisos_por_pestana.sql
-- Control fino POR PESTAÑA en Conteo Cíclico, Análisis de Códigos y Post-Venta.
-- Retrocompatible: los permisos "amplios" existentes (view_conteo/manage_conteo/
-- supervise_conteo, view_analisis, view_postventa/manage_postventa/supervise_postventa)
-- siguen mostrando TODAS las pestañas; estos permisos permiten conceder SOLO
-- ciertas pestañas. Catálogo espejo de APP_PERMISSIONS.
insert into public.tms_permisos (id, nombre, modulo) values
  ('conteo_tab_contar',        'Conteo · pestaña Contar',         'Inventario'),
  ('conteo_tab_sesiones',      'Conteo · pestaña Sesiones',       'Inventario'),
  ('conteo_tab_conciliacion',  'Conteo · pestaña Conciliación',   'Inventario'),
  ('conteo_tab_ajuste',        'Conteo · pestaña Ajuste ERP',     'Inventario'),
  ('conteo_tab_bloques',       'Conteo · pestaña Bloques / QR',   'Inventario'),
  ('conteo_tab_proyeccion',    'Conteo · pestaña Proyección',     'Inventario'),
  ('analisis_tab_resumen',     'Análisis · Resumen',              'Inventario'),
  ('analisis_tab_antiguos',    'Análisis · Antiguos',             'Inventario'),
  ('analisis_tab_antiguos_disp','Análisis · Antiguos c/ Disponible','Inventario'),
  ('analisis_tab_no_activos',  'Análisis · No Activos c/ Stock',  'Inventario'),
  ('analisis_tab_duplicados',  'Análisis · Duplicados',           'Inventario'),
  ('analisis_tab_anomalias',   'Análisis · Anomalías',            'Inventario'),
  ('analisis_tab_detalle',     'Análisis · Detalle completo',     'Inventario'),
  ('pv_tab_tickets',           'Post-Venta · pestaña Tickets',        'Post-Venta'),
  ('pv_tab_bandeja',           'Post-Venta · pestaña Bandeja Correos','Post-Venta'),
  ('pv_tab_calendario',        'Post-Venta · pestaña Calendario',     'Post-Venta'),
  ('pv_tab_nuevo',             'Post-Venta · pestaña Nuevo Ticket',   'Post-Venta'),
  ('pv_tab_dashboard',         'Post-Venta · pestaña Dashboard',      'Post-Venta'),
  ('pv_tab_tecnicos',          'Post-Venta · pestaña Técnicos',       'Post-Venta')
on conflict (id) do update set nombre = excluded.nombre, modulo = excluded.modulo;
