-- ==============================================================================
-- UPDATE MODULES CONFIGURATION (SEED V3 - FIX COLUMN NAME)
-- ==============================================================================
-- El error indica que la columna 'description' no existe (probablemente se llama diferente o no se creó).
-- Vamos a verificar y crearla si es necesario, luego insertar.

DO $$ 
BEGIN 
    -- 1. Agregar columna 'description' si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tms_modules_config' AND column_name = 'description') THEN
        ALTER TABLE tms_modules_config ADD COLUMN description TEXT;
    END IF;
END $$;

-- 2. Insertar/Actualizar datos
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
