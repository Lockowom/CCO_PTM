-- ============================================================================
--  120_ocultar_tms.sql — Ocultar el módulo TMS (Transporte).
--  El módulo NO está operativo; se oculta de Vistas/Roles/menú SIN borrar nada
--  (tablas, RPCs, componentes y permisos quedan para reactivarlo). Frontend:
--  se comentó TMS en modules.js y Navbar en el mismo commit.
--   • tms_modules_config: enabled=false (no aparece en Admin → Vistas).
--   • Roles con landing_page a /tms/* → se limpia (evita caer en un módulo oculto).
--  Los permisos view_tms/manage_tms/supervise_tms se conservan (para reactivar).
-- ============================================================================
update public.tms_modules_config set enabled = false where id = 'tms';
update public.tms_roles set landing_page = null where landing_page like '/tms/%';
