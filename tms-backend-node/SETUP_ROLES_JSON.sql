-- 1. Eliminar tabla anterior si existe (para asegurar estructura limpia)
DROP TABLE IF EXISTS public.tms_roles_permisos;
DROP TABLE IF EXISTS public.tms_permisos;

-- 2. Crear Tabla de Roles con soporte JSONB
CREATE TABLE IF NOT EXISTS public.tms_roles (
    id TEXT PRIMARY KEY, -- 'ADMIN', 'SUPERVISOR', 'OPERARIO', 'TRANSPORTE', etc.
    nombre TEXT NOT NULL,
    descripcion TEXT,
    permisos_json JSONB DEFAULT '[]'::jsonb,
    usuarios INTEGER DEFAULT 0, -- Campo calculado o mantenido por trigger
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Insertar Roles por Defecto con Permisos Granulares (Mapeados a usuarios existentes)
INSERT INTO public.tms_roles (id, nombre, descripcion, permisos_json) VALUES
(
    'ADMIN', 
    'Administrador', 
    'Acceso total a todos los módulos y configuración del sistema',
    '["view_dashboard","view_kpis","view_tms_dashboard","view_routes","create_routes","view_control_tower","manage_control_tower","view_drivers","manage_drivers","view_mobile_app","use_mobile_app","view_reception","process_reception","view_cubicaje","process_cubicaje","view_returns","process_returns","view_entry","process_entry","view_sales_orders","manage_sales_orders","delete_sales_orders","view_picking","process_picking","view_packing","process_packing","view_packing_tv","view_shipping","process_shipping","view_deliveries","manage_deliveries","view_stock","manage_stock","view_layout","manage_layout","view_transfers","manage_transfers","view_cycle_count","view_kardex","view_productivity","view_historial_nv","view_dispatch_control","view_batches","view_sales_status","view_addresses","view_locations","export_data","view_reports","view_tv_mode","view_quality","manage_quality","view_mediciones","manage_mediciones","view_users","manage_users","view_roles","manage_roles","view_views","manage_views","manage_data_import","view_audit","view_time_reports","manage_tickets","manage_cleanup"]'::jsonb
),
(
    'SUPERVISOR', 
    'Supervisor Operaciones', 
    'Gestión de rutas, conductores y monitoreo de entregas',
    '["view_dashboard","view_kpis","view_tms_dashboard","view_routes","create_routes","view_control_tower","view_drivers","view_mobile_app","view_reception","view_cubicaje","view_returns","view_entry","view_sales_orders","view_picking","view_packing","view_packing_tv","view_shipping","view_deliveries","view_stock","manage_stock","view_layout","view_transfers","view_cycle_count","view_kardex","view_productivity","view_historial_nv","view_dispatch_control","view_batches","view_sales_status","view_addresses","view_locations","export_data","view_reports","view_tv_mode","view_quality"]'::jsonb
),
(
    'OPERARIO', 
    'Operario Bodega', 
    'Ejecución de tareas de recepción, picking y despacho',
    '["view_dashboard","view_reception","process_reception","view_entry","process_entry","view_picking","process_picking","view_packing","process_packing","view_shipping","process_shipping","view_stock","view_batches"]'::jsonb
),
(
    'TRANSPORTE', 
    'Transportista / Conductor', 
    'Visualización de rutas asignadas y confirmación de entregas',
    '["view_mobile_app","use_mobile_app"]'::jsonb
),
(
    'GERENCIA', 
    'Gerencia', 
    'Visualización de Dashboards, KPIs y Reportes',
    '["view_dashboard","view_kpis","view_tms_dashboard","view_control_tower","view_reports","view_stock","view_sales_orders","view_productivity"]'::jsonb
),
(
    'ADMINISTRACION', 
    'Administración', 
    'Gestión administrativa, reportes y consultas',
    '["view_dashboard","view_reports","view_sales_orders","view_stock","view_historial_nv","view_sales_status","view_kardex"]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET 
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    permisos_json = EXCLUDED.permisos_json;

-- 4. Asegurar que la tabla de usuarios tenga la columna rol referenciada
DO $$ 
BEGIN 
    -- Verificar si existe la columna rol
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tms_usuarios' AND column_name = 'rol') THEN
        -- Intentar agregar la FK si no existe (esto puede fallar si hay roles en usuarios que no están en roles, pero hemos cubierto los casos conocidos)
        BEGIN
            ALTER TABLE public.tms_usuarios ADD CONSTRAINT fk_tms_usuarios_rol FOREIGN KEY (rol) REFERENCES public.tms_roles(id);
        EXCEPTION WHEN duplicate_object THEN
            NULL; -- Ya existe
        WHEN foreign_key_violation THEN
            NULL; -- Hay datos inconsistentes, no bloqueamos el script
        END;
    END IF;
END $$;

-- 5. Crear Policies RLS (Seguridad)
ALTER TABLE public.tms_roles ENABLE ROW LEVEL SECURITY;

-- Política: Todos pueden ver roles (necesario para login/check de permisos)
DROP POLICY IF EXISTS "Todos pueden ver roles" ON public.tms_roles;
CREATE POLICY "Todos pueden ver roles" ON public.tms_roles
    FOR SELECT USING (true);

-- Política: Solo admins pueden insertar/actualizar/borrar
DROP POLICY IF EXISTS "Admins pueden gestionar roles" ON public.tms_roles;
CREATE POLICY "Admins pueden gestionar roles" ON public.tms_roles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.tms_usuarios 
            WHERE email = auth.jwt() ->> 'email' 
            AND rol = 'ADMIN'
        )
    );
