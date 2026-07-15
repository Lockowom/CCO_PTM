-- 081_panel_ptm_modulo.sql
-- Panel PTM: dashboard externo (repo lockowom/panel-, Next.js en Vercel) embebido
-- en CCO vía iframe en /tools/panel. Registra el permiso propio y la fila del
-- módulo (para Admin → Roles y Admin → Vistas). Sin tablas de datos nuevas: el
-- Panel usa su propio backend.

insert into public.tms_permisos (id, nombre, modulo)
values ('view_panel', 'Ver Panel PTM (dashboard embebido)', 'Panel PTM')
on conflict (id) do update set nombre = excluded.nombre, modulo = excluded.modulo;

insert into public.tms_modules_config (id, enabled, label, description)
values ('panel', true, 'Panel PTM (Dashboard)', 'Dashboard de indicadores PTM en tiempo real, embebido (Next.js/Vercel).')
on conflict (id) do update set label = excluded.label, description = excluded.description;
