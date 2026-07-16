-- 089_panel_roles_grant.sql
-- ============================================================================
--  Acceso al Panel por rol: GERENCIA + SUPERVISOR + Supervisor reciben
--  `view_panel` (ver) y `manage_panel` (crear/editar N.V., cambiar estados,
--  eliminar, consolidados, catálogos, builder). ADMIN ya accede por bypass.
--  (Decisión del owner: gestionar = admin/gerencia/supervisores; ver = solo esos.)
-- ============================================================================
insert into public.tms_roles_permisos (rol_id, permiso_id)
select r, p
from (values ('GERENCIA'), ('SUPERVISOR'), ('SUPERVISOR_')) as roles(r),
     (values ('view_panel'), ('manage_panel')) as perms(p)
on conflict do nothing;
