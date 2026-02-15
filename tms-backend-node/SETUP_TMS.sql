-- LIMPIEZA DE TABLAS CREADAS POR SCRIPTS ANTERIORES (Para asegurar consistencia)
-- DROP TABLE IF EXISTS public.tms_entregas CASCADE;
-- DROP TABLE IF EXISTS public.tms_rutas CASCADE;
-- DROP TABLE IF EXISTS public.tms_conductores CASCADE;
-- DROP TABLE IF EXISTS public.tms_nv_diarias CASCADE;

-- 1. Tabla de Conductores (Compatible con MIGRATION_SQL)
CREATE TABLE IF NOT EXISTS public.tms_conductores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre TEXT NOT NULL,
    apellido TEXT,
    rut TEXT,
    telefono TEXT,
    vehiculo_patente TEXT,
    estado TEXT DEFAULT 'DISPONIBLE',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabla de Rutas (Compatible con MIGRATION_SQL)
CREATE TABLE IF NOT EXISTS public.tms_rutas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre TEXT NOT NULL,
    conductor_id UUID REFERENCES public.tms_conductores(id),
    fecha_inicio TIMESTAMPTZ,
    fecha_fin TIMESTAMPTZ,
    estado TEXT DEFAULT 'PLANIFICADA',
    total_entregas INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabla de Entregas (Compatible con MIGRATION_SQL)
CREATE TABLE IF NOT EXISTS public.tms_entregas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nv TEXT NOT NULL,
    cliente TEXT,
    direccion TEXT,
    comuna TEXT,
    latitud DOUBLE PRECISION,
    longitud DOUBLE PRECISION,
    estado TEXT DEFAULT 'PENDIENTE',
    ruta_id UUID REFERENCES public.tms_rutas(id),
    conductor_id UUID REFERENCES public.tms_conductores(id),
    fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
    fecha_asignacion TIMESTAMPTZ,
    fecha_entrega TIMESTAMPTZ
);

-- 4. Tabla de NV Diarias (Estructura COMPLETA requerida por tu DB actual)
CREATE TABLE IF NOT EXISTS public.tms_nv_diarias (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nv TEXT NOT NULL, 
    fecha_emision TIMESTAMPTZ,
    cliente TEXT,
    vendedor TEXT,
    codigo_producto TEXT NOT NULL, -- NOT NULL Constraint que causó el error
    descripcion_producto TEXT,
    unidad TEXT,
    cantidad NUMERIC(10,2) DEFAULT 0,
    precio_unitario NUMERIC(12,2) DEFAULT 0,
    neto NUMERIC(12,2) DEFAULT 0,
    estado TEXT DEFAULT 'PENDIENTE',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT tms_nv_diarias_nv_codigo_unique UNIQUE (nv, codigo_producto)
);

-- SEED DATA (Datos de Prueba)

-- Conductores
INSERT INTO public.tms_conductores (nombre, apellido, rut, telefono, vehiculo_patente, estado) VALUES
('Juan', 'Pérez', '12.345.678-9', '+56911111111', 'ABCD-12', 'DISPONIBLE'),
('María', 'González', '9.876.543-2', '+56922222222', 'WXYZ-99', 'DISPONIBLE'),
('Carlos', 'López', '15.555.555-5', '+56933333333', 'JJKK-55', 'OCUPADO');

-- Entregas de prueba
DELETE FROM public.tms_entregas WHERE nv IN ('NV-1001', 'NV-1002', 'NV-1003', 'NV-1004', 'NV-1005');

INSERT INTO public.tms_entregas (nv, cliente, direccion, comuna, latitud, longitud, estado) VALUES
('NV-1001', 'Cliente A', 'Av. Providencia 1234', 'Providencia', -33.426280, -70.610930, 'PENDIENTE'),
('NV-1002', 'Cliente B', 'Alameda 456', 'Santiago', -33.442900, -70.643000, 'PENDIENTE'),
('NV-1003', 'Cliente C', 'Pio Nono 50', 'Providencia', -33.433800, -70.635000, 'LISTO_DESPACHO'),
('NV-1004', 'Cliente D', 'Eliodoro Yañez 2000', 'Providencia', -33.435000, -70.605000, 'PENDIENTE'),
('NV-1005', 'Cliente E', 'Sin Coordenadas', 'Maipú', NULL, NULL, 'PENDIENTE');

-- Sincronizar NV Diarias (FIXED: Incluyendo codigo_producto dummy)
-- Primero borramos las de prueba para evitar conflictos
DELETE FROM public.tms_nv_diarias WHERE nv IN ('NV-1001', 'NV-1002', 'NV-1003', 'NV-1004', 'NV-1005');

-- Insertamos con un producto dummy 'GENERICO' para satisfacer la constraint NOT NULL
INSERT INTO public.tms_nv_diarias (nv, cliente, estado, codigo_producto, descripcion_producto, cantidad, precio_unitario, fecha_emision)
SELECT 
    e.nv, 
    e.cliente, 
    e.estado, 
    'PROD-GENERICO', -- Valor dummy para codigo_producto
    'Producto de Prueba Generado Automáticamente', 
    1, 
    10000,
    NOW()
FROM public.tms_entregas e
WHERE e.nv IN ('NV-1001', 'NV-1002', 'NV-1003', 'NV-1004', 'NV-1005');
