-- Asegurar estructura correcta para tablas de inventario
-- Si las tablas ya existen, esto agregará las columnas faltantes de forma segura.

-- 1. TABLA PARTIDAS
CREATE TABLE IF NOT EXISTS public.tms_partidas (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    codigo_producto VARCHAR(100),
    producto VARCHAR(255), -- Esta es la columna que faltaba
    unidad_medida VARCHAR(50),
    partida VARCHAR(100),
    fecha_venc DATE,
    disponible NUMERIC(12,2) DEFAULT 0,
    reserva NUMERIC(12,2) DEFAULT 0,
    transitoria NUMERIC(12,2) DEFAULT 0,
    consignacion NUMERIC(12,2) DEFAULT 0,
    stock_total NUMERIC(12,2) DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Si existe pero falta la columna 'producto' (o se llama diferente), agregamos 'producto'
ALTER TABLE public.tms_partidas ADD COLUMN IF NOT EXISTS producto VARCHAR(255);


-- 2. TABLA SERIES
CREATE TABLE IF NOT EXISTS public.tms_series (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    codigo_producto VARCHAR(100),
    producto VARCHAR(255),
    unidad_medida VARCHAR(50),
    serie VARCHAR(100),
    estado VARCHAR(50), -- DISPONIBLE, RESERVADO, etc.
    disponible NUMERIC(12,2) DEFAULT 0,
    reserva NUMERIC(12,2) DEFAULT 0,
    transitoria NUMERIC(12,2) DEFAULT 0,
    consignacion NUMERIC(12,2) DEFAULT 0,
    stock_total NUMERIC(12,2) DEFAULT 0,
    ubicacion_actual VARCHAR(100),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.tms_series ADD COLUMN IF NOT EXISTS producto VARCHAR(255);


-- 3. TABLA FARMAPACK
CREATE TABLE IF NOT EXISTS public.tms_farmapack (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    codigo_producto VARCHAR(100),
    producto VARCHAR(255),
    unidad_medida VARCHAR(50),
    lote VARCHAR(100),
    fecha_venc DATE,
    disponible NUMERIC(12,2) DEFAULT 0,
    reserva NUMERIC(12,2) DEFAULT 0,
    transitoria NUMERIC(12,2) DEFAULT 0,
    consignacion NUMERIC(12,2) DEFAULT 0,
    stock_total NUMERIC(12,2) DEFAULT 0,
    estado_calidad VARCHAR(50),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.tms_farmapack ADD COLUMN IF NOT EXISTS producto VARCHAR(255);

-- Índices para búsqueda rápida
CREATE INDEX IF NOT EXISTS idx_partidas_prod ON public.tms_partidas(producto);
CREATE INDEX IF NOT EXISTS idx_series_prod ON public.tms_series(producto);
CREATE INDEX IF NOT EXISTS idx_farma_prod ON public.tms_farmapack(producto);
CREATE INDEX IF NOT EXISTS idx_partidas_cod ON public.tms_partidas(codigo_producto);
