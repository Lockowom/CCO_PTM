-- 1. Crear Tabla de Roles
CREATE TABLE IF NOT EXISTS public.tms_roles (
    id TEXT PRIMARY KEY, -- 'ADMIN', 'SUPERVISOR', 'OPERADOR', 'CONDUCTOR'
    nombre TEXT NOT NULL,
    descripcion TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Crear Tabla de Permisos (Relación Roles <-> Permisos)
-- En este diseño simplificado, guardamos los permisos como un array de strings en el rol,
-- o usamos una tabla pivote si queremos más normalización.
-- Para simplicidad y flexibilidad con el frontend actual, usaremos una tabla pivote clásica.

CREATE TABLE IF NOT EXISTS public.tms_permisos (
    id TEXT PRIMARY KEY, -- 'view_dashboard', 'create_routes', etc.
    nombre TEXT NOT NULL,
    modulo TEXT NOT NULL, -- 'tms', 'inbound', 'admin', etc.
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.tms_roles_permisos (
    rol_id TEXT REFERENCES public.tms_roles(id) ON DELETE CASCADE,
    permiso_id TEXT REFERENCES public.tms_permisos(id) ON DELETE CASCADE,
    PRIMARY KEY (rol_id, permiso_id)
);

-- 3. Insertar Roles Iniciales
INSERT INTO public.tms_roles (id, nombre, descripcion) VALUES
('ADMIN', 'Administrador', 'Acceso total a todos los módulos y configuración del sistema'),
('SUPERVISOR', 'Supervisor Operaciones', 'Gestión de rutas, conductores y monitoreo de entregas'),
('OPERADOR', 'Operador Bodega', 'Ejecución de tareas de recepción, picking y despacho'),
('CONDUCTOR', 'Conductor', 'Visualización de rutas asignadas y confirmación de entregas')
ON CONFLICT (id) DO UPDATE SET 
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion;

-- 4. Insertar Permisos Definidos
INSERT INTO public.tms_permisos (id, nombre, modulo) VALUES
-- Dashboard
('view_dashboard', 'Ver Dashboard General', 'dashboard'),
('view_kpis', 'Ver KPIs Financieros', 'dashboard'),

-- TMS
('view_routes', 'Ver Rutas', 'tms'),
('create_routes', 'Planificar/Crear Rutas', 'tms'),
('assign_drivers', 'Asignar Conductores', 'tms'),
('track_gps', 'Monitoreo GPS en Vivo', 'tms'),
('view_drivers', 'Ver Conductores', 'tms'),

-- Inbound
('view_reception', 'Ver Recepciones', 'inbound'),
('process_entry', 'Procesar Ingresos de Mercadería', 'inbound'),

-- Outbound
('view_sales_orders', 'Ver Notas de Venta', 'outbound'),
('view_picking', 'Ver Picking', 'outbound'),
('process_picking', 'Procesar Picking', 'outbound'),
('view_packing', 'Ver Packing', 'outbound'),
('process_packing', 'Procesar Packing', 'outbound'),
('view_shipping', 'Ver Despachos', 'outbound'),
('process_shipping', 'Gestionar Despachos', 'outbound'),

-- Inventario
('view_stock', 'Ver Stock', 'inventory'),
('manage_inventory', 'Gestionar Inventario', 'inventory'),
('view_layout', 'Ver Layout Bodega', 'inventory'),
('manage_transfers', 'Gestionar Transferencias', 'inventory'),

-- Consultas
('view_batches', 'Ver Lotes/Series', 'queries'),
('view_sales_status', 'Ver Estado N.V.', 'queries'),
('view_addresses', 'Ver Direcciones', 'queries'),

-- Admin
('manage_users', 'Gestionar Usuarios', 'admin'),
('manage_roles', 'Gestionar Roles y Permisos', 'admin'),
('manage_views', 'Configurar Vistas', 'admin'),
('view_reports', 'Ver Reportes', 'admin'),
('view_logs', 'Ver Logs de Auditoría', 'admin')
ON CONFLICT (id) DO UPDATE SET 
    nombre = EXCLUDED.nombre,
    modulo = EXCLUDED.modulo;

-- 5. Asignar Permisos a Roles (Seed Actualizado)

-- ADMIN: Todo
INSERT INTO public.tms_roles_permisos (rol_id, permiso_id)
SELECT 'ADMIN', id FROM public.tms_permisos
ON CONFLICT DO NOTHING;

-- SUPERVISOR: Dashboard, TMS completo, Inbound/Outbound lectura, Stock
INSERT INTO public.tms_roles_permisos (rol_id, permiso_id)
SELECT 'SUPERVISOR', id FROM public.tms_permisos 
WHERE modulo IN ('tms', 'dashboard', 'inventory') 
   OR id IN ('view_reception', 'view_sales_orders', 'view_picking', 'view_packing', 'view_shipping', 'view_reports')
ON CONFLICT DO NOTHING;

-- OPERADOR: Inbound, Outbound (Operativo), Stock (Lectura)
INSERT INTO public.tms_roles_permisos (rol_id, permiso_id)
SELECT 'OPERADOR', id FROM public.tms_permisos 
WHERE modulo IN ('inbound', 'outbound') 
   AND id NOT IN ('view_kpis', 'view_sales_orders')
   OR id IN ('view_stock', 'view_batches')
ON CONFLICT DO NOTHING;

-- CONDUCTOR: Solo ver rutas y GPS
INSERT INTO public.tms_roles_permisos (rol_id, permiso_id)
SELECT 'CONDUCTOR', id FROM public.tms_permisos 
WHERE id IN ('view_routes', 'track_gps')
ON CONFLICT DO NOTHING;

-- 6. Asegurar que la tabla de usuarios tenga la columna rol referenciada (Opcional pero recomendado)
-- ALTER TABLE public.tms_usuarios ADD CONSTRAINT fk_rol FOREIGN KEY (rol) REFERENCES public.tms_roles(id);
