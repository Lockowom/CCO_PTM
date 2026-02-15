-- ============================================================================
-- 1. SCHEMAS & EXTENSIONS
-- ============================================================================
-- Habilitar extensión para UUIDs (identificadores únicos universales)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 2. TABLA: CONDUCTORES
-- Espejo de la hoja 'Conductores'
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.tms_conductores (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    legacy_id VARCHAR(50) UNIQUE, -- ID antiguo del Excel/Sheets (ej: "COND-001")
    nombre VARCHAR(255) NOT NULL,
    apellido VARCHAR(255),
    rut VARCHAR(20),
    telefono VARCHAR(50),
    estado VARCHAR(50) DEFAULT 'DISPONIBLE', -- DISPONIBLE, EN_RUTA, OCUPADO
    vehiculo_patente VARCHAR(20),
    ultima_lat FLOAT,
    ultima_lon FLOAT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 3. TABLA: RUTAS
-- Espejo de la hoja 'Rutas'
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.tms_rutas (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    conductor_id UUID REFERENCES public.tms_conductores(id),
    fecha_inicio DATE,
    estado VARCHAR(50) DEFAULT 'PLANIFICADA', -- PLANIFICADA, EN_CURSO, COMPLETADA
    distancia_total_km FLOAT DEFAULT 0,
    tiempo_estimado_min INT DEFAULT 0,
    total_entregas INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 4. TABLA: ENTREGAS
-- Espejo de la hoja 'Entregas'
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.tms_entregas (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    nv VARCHAR(50) UNIQUE NOT NULL, -- Número de Nota de Venta (Clave única)
    cliente VARCHAR(255),
    direccion TEXT,
    comuna VARCHAR(100),
    region VARCHAR(100),
    latitud FLOAT,
    longitud FLOAT,
    telefono VARCHAR(50),
    
    -- Datos de Carga
    bultos INT DEFAULT 0,
    peso_kg FLOAT DEFAULT 0,
    volumen_m3 FLOAT DEFAULT 0,
    
    -- Estado y Gestión
    estado VARCHAR(50) DEFAULT 'PENDIENTE', -- PENDIENTE, EN_RUTA, ENTREGADO, RECHAZADO
    prioridad VARCHAR(20) DEFAULT 'NORMAL',
    observaciones TEXT,
    
    -- Relaciones (Se llenan cuando se asigna ruta)
    ruta_id UUID REFERENCES public.tms_rutas(id),
    conductor_id UUID REFERENCES public.tms_conductores(id),
    
    -- Tiempos
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- Cuándo se creó en Sheets
    fecha_asignacion TIMESTAMP WITH TIME ZONE,
    fecha_entrega_real TIMESTAMP WITH TIME ZONE,
    
    -- Auditoría
    sincronizado_desde_sheets BOOLEAN DEFAULT TRUE
);

-- ============================================================================
-- 5. TABLA: NOTAS DE VENTA DIARIAS
-- Espejo de la hoja 'N.V DIARIAS' (Columnas A-L)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.tms_nv_diarias (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    nv VARCHAR(50) NOT NULL, 
    fecha_emision TIMESTAMP WITH TIME ZONE,
    cliente VARCHAR(255),
    vendedor VARCHAR(255),
    codigo_producto VARCHAR(100) NOT NULL,
    descripcion_producto TEXT,
    unidad VARCHAR(20),
    cantidad NUMERIC(10,2) DEFAULT 0,
    precio_unitario NUMERIC(12,2) DEFAULT 0,
    neto NUMERIC(12,2) DEFAULT 0,
    estado VARCHAR(50) DEFAULT 'PENDIENTE', -- PENDIENTE, PICKING, DESPACHADO, ANULADA
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Clave única compuesta para evitar duplicados de productos en una misma NV
    CONSTRAINT tms_nv_diarias_nv_codigo_unique UNIQUE (nv, codigo_producto)
);

-- ============================================================================
-- 6. INDICES (Para velocidad extrema en búsquedas)
-- ============================================================================
CREATE INDEX idx_entregas_estado ON public.tms_entregas(estado);
CREATE INDEX idx_entregas_ruta ON public.tms_entregas(ruta_id);
CREATE INDEX idx_entregas_nv ON public.tms_entregas(nv);
CREATE INDEX idx_nv_diarias_nv ON public.tms_nv_diarias(nv);
CREATE INDEX idx_nv_diarias_cliente ON public.tms_nv_diarias(cliente);
