-- ==============================================================================
-- SEED: TMS MODULES CONFIGURATION
-- ==============================================================================
-- Inserta los módulos base si no existen para que aparezcan en el panel de Vistas.

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
ON CONFLICT (id) DO NOTHING;
