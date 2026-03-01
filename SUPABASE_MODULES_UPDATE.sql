-- ==============================================================================
-- UPDATE MODULES CONFIGURATION (SEED V2)
-- ==============================================================================
-- Actualiza la lista de módulos disponibles en Admin > Vistas
-- para incluir todas las secciones del sistema.

-- 1. Asegurar que existan los módulos principales
INSERT INTO tms_modules_config (id, label, enabled, description)
VALUES 
  ('tms', 'TMS (Transporte)', true, 'Gestión de flota, choferes y rutas.'),
  ('dashboard', 'Dashboard General', true, 'Vista principal de KPIs.'),
  ('inbound', 'Inbound (Entradas)', true, 'Recepción y almacenamiento.'),
  ('outbound', 'Outbound (Salidas)', true, 'Picking, packing y despachos.'),
  ('inventory', 'Inventario (WMS)', true, 'Control de stock y layout.'),
  ('quality', 'Calidad', true, 'Inspección y control.'),
  ('analytics', 'Analytics / TV', true, 'Reportes y modo pantalla gigante.'),
  ('queries', 'Consultas', true, 'Kardex, trazabilidad y búsquedas.'),
  ('admin', 'Administración', true, 'Configuración del sistema (Solo Admins).')
ON CONFLICT (id) DO UPDATE SET 
  label = EXCLUDED.label,
  description = EXCLUDED.description;

-- 2. (Opcional) Si quisieras controlar submódulos individualmente, 
-- tendrías que agregarlos aquí y actualizar Navbar.jsx para usar esos IDs.
-- Por ahora, el diseño controla por "Sección Principal" en Vistas y "Permiso Granular" en Roles.
