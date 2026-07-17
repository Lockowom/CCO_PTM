-- ============================================================================
--  103_retiro_dashboard_general.sql
--  Retiro del módulo Dashboard General (/dashboard).
--  • Quita su tarjeta de Admin → Vistas (tms_modules_config).
--  • Borra sus permisos (view_dashboard, view_kpis).
--  • El inicio pasa a resolverlo SmartRedirect ("/"): primera ruta accesible;
--    admin → /panel. Los roles con inicio en /dashboard se limpian (NULL).
-- ============================================================================

delete from public.tms_modules_config where id = 'dashboard';
delete from public.tms_permisos where id in ('view_dashboard','view_kpis');
update public.tms_roles set landing_page = null where landing_page like '/dashboard%';
