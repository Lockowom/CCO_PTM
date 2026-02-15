-- LIMPIEZA PREVIA IMPORTANTE
DROP TABLE IF EXISTS public.tms_direcciones CASCADE;

-- 1. Tabla de Direcciones (Maestro de Clientes)
CREATE TABLE public.tms_direcciones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Campos Buscables (Col B, C, F)
    razon_social TEXT,      -- Col B
    nombre TEXT,            -- Col C
    rut TEXT,               -- Col F
    
    -- Campos Informativos (Col I, J, K, L, S)
    region TEXT,            -- Col I
    ciudad TEXT,            -- Col J
    comuna TEXT,            -- Col K
    direccion TEXT,         -- Col L
    telefono_1 TEXT,        -- Col S (Teléfono 1)
    
    -- Metadatos
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Restricción Única para evitar duplicados y permitir Upserts
    CONSTRAINT tms_direcciones_rut_key UNIQUE (rut)
);

-- Indices para búsqueda rápida
CREATE INDEX IF NOT EXISTS idx_direcciones_razon ON public.tms_direcciones(razon_social);
CREATE INDEX IF NOT EXISTS idx_direcciones_nombre ON public.tms_direcciones(nombre);

-- SEED DATA (Datos de Prueba Actualizados)
INSERT INTO public.tms_direcciones (razon_social, nombre, rut, region, ciudad, comuna, direccion, telefono_1) VALUES
('COMERCIALIZADORA EJEMPLO SPA', 'TIENDA EJEMPLO', '76.123.456-7', 'RM', 'SANTIAGO', 'PROVIDENCIA', 'AV. PROVIDENCIA 1234', '+56912345678'),
('FERRETERIA INDUSTRIAL LIMITADA', 'FERRETERIA NORTE', '77.987.654-3', 'RM', 'SANTIAGO', 'QUILICURA', 'PANAMERICANA NORTE 9900', '+56222222222'),
('JUAN PEREZ E.I.R.L', 'ALMACEN JUANITO', '12.345.678-9', 'RM', 'SANTIAGO', 'MAIPU', 'AV. PAJARITOS 555', '+56999999999')
ON CONFLICT (rut) DO NOTHING;
