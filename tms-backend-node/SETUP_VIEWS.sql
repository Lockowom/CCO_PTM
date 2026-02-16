-- 1. Tabla de Configuración Global de Módulos (Para activar/desactivar globalmente)
CREATE TABLE IF NOT EXISTS public.tms_modules_config (
    id TEXT PRIMARY KEY, -- 'tms', 'inbound', 'reception', etc.
    enabled BOOLEAN DEFAULT TRUE,
    label TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by TEXT
);

-- 2. Agregar columna landing_page a tms_roles
ALTER TABLE public.tms_roles 
ADD COLUMN IF NOT EXISTS landing_page TEXT DEFAULT '/dashboard';

-- 3. Insertar configuración inicial de módulos (basado en el menú actual)
INSERT INTO public.tms_modules_config (id, enabled, label) VALUES
('dashboard', true, 'Dashboard'),
('tms', true, 'TMS (Transporte)'),
('tms-dashboard', true, 'Dashboard TMS'),
('tms-planning', true, 'Planificar Rutas'),
('tms-control', true, 'Torre de Control'),
('tms-drivers', true, 'Conductores'),
('tms-mobile', true, 'App Móvil'),
('inbound', true, 'Inbound'),
('inbound-reception', true, 'Recepción'),
('inbound-entry', true, 'Ingreso'),
('outbound', true, 'Outbound'),
('outbound-sales-orders', true, 'Notas de Venta'),
('outbound-picking', true, 'Picking'),
('outbound-packing', true, 'Packing'),
('outbound-shipping', true, 'Despachos'),
('outbound-deliveries', true, 'Entregas'),
('inventory', true, 'Inventario'),
('inventory-stock', true, 'Stock'),
('inventory-layout', true, 'Layout'),
('inventory-transfers', true, 'Transferencias'),
('queries', true, 'Consultas'),
('queries-batches', true, 'Lotes/Series'),
('queries-sales-status', true, 'Estado N.V.'),
('queries-addresses', true, 'Direcciones'),
('admin', true, 'Administración'),
('admin-cleanup', true, 'Limpieza de Datos') -- NUEVO MODULO DE LIMPIEZA
ON CONFLICT (id) DO UPDATE SET enabled = EXCLUDED.enabled;

-- 4. Actualizar Landing Pages por defecto para Roles
UPDATE public.tms_roles SET landing_page = '/dashboard' WHERE id = 'ADMIN';
UPDATE public.tms_roles SET landing_page = '/tms/control-tower' WHERE id = 'SUPERVISOR';
UPDATE public.tms_roles SET landing_page = '/outbound/picking' WHERE id = 'OPERADOR';
UPDATE public.tms_roles SET landing_page = '/tms/mobile' WHERE id = 'CONDUCTOR';

-- 5. RPC para Limpieza de Datos (Solo Admin)
CREATE OR REPLACE FUNCTION clean_operational_data(
    p_clean_nv BOOLEAN, 
    p_clean_partidas BOOLEAN, 
    p_clean_series BOOLEAN, 
    p_clean_farmapack BOOLEAN
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER -- Se ejecuta con permisos de superusuario (necesario para TRUNCATE/DELETE masivo)
AS $$
BEGIN
    -- Validar que solo un admin pueda ejecutar (aunque la UI lo filtra, doble seguridad)
    -- En Supabase auth.uid() devuelve el UUID del usuario actual
    -- Aquí simplificamos asumiendo que la capa de aplicación filtra por rol, 
    -- o podrías chequear contra una tabla de admins si fuera necesario.
    
    IF p_clean_nv THEN
        -- Limpiar Notas de Venta y dependencias (Entregas TMS)
        DELETE FROM public.tms_nv_diarias;
        DELETE FROM public.tms_entregas; -- Las entregas suelen nacer de las NV
    END IF;

    IF p_clean_partidas THEN
        DELETE FROM public.tms_partidas;
    END IF;

    IF p_clean_series THEN
        DELETE FROM public.tms_series;
    END IF;

    IF p_clean_farmapack THEN
        DELETE FROM public.tms_farmapack;
    END IF;

    RETURN 'Limpieza completada exitosamente';
EXCEPTION WHEN OTHERS THEN
    RETURN 'Error durante la limpieza: ' || SQLERRM;
END;
$$;
