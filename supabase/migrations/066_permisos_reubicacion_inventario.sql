-- 066 — Reorganización de módulos (checklist de CLAUDE.md, paso 5):
-- "Mapa de Calor" (antes Consultas) y "Gestión de Ubicaciones" (antes
-- Configuración) pasan al módulo INVENTARIO. Las rutas no cambian
-- (/queries/heatmap y /admin/locations siguen vivas para no romper accesos
-- directos ni landing pages guardadas); cambia el menú, los catálogos de
-- Roles/Vistas (src/config/modules.js) y la clasificación del permiso aquí.
--
-- view_locations NO se mueve: sigue en Consultas porque también abre
-- Consultas → Ubicaciones (el Mapa de Calor lo comparte).

UPDATE public.tms_permisos
SET modulo = 'inventario'
WHERE id = 'manage_locations';
