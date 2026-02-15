-- RECREACIÓN DE TABLAS DE INVENTARIO (LIMPIEZA TOTAL)
-- Ejecutar esto en el Editor SQL de Supabase para reiniciar la estructura

-- 1. ELIMINAR TABLAS EXISTENTES (Cuidado: Borra todos los datos)
DROP TABLE IF EXISTS public.tms_partidas CASCADE;
DROP TABLE IF EXISTS public.tms_series CASCADE;
DROP TABLE IF EXISTS public.tms_farmapack CASCADE;

-- 2. CREAR TABLA PARTIDAS (Base para Hoja PARTIDA)
-- Estructura basada en: Cod. Producto, Producto, Cod. U. Medida, Partida / Talla, Fecha Venc, Disponible, Reserva, Transitoria, Consignación, Stock Total
CREATE TABLE public.tms_partidas (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    codigo_producto VARCHAR(100), -- Col A
    producto VARCHAR(255),        -- Col B
    unidad_medida VARCHAR(50),    -- Col C
    partida VARCHAR(100),         -- Col D (Partida / Talla)
    fecha_vencimiento DATE,       -- Col E
    disponible NUMERIC(12,2) DEFAULT 0,    -- Col F
    reserva NUMERIC(12,2) DEFAULT 0,       -- Col G
    transitoria NUMERIC(12,2) DEFAULT 0,   -- Col H
    consignacion NUMERIC(12,2) DEFAULT 0,  -- Col I
    stock_total NUMERIC(12,2) DEFAULT 0,   -- Col J
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Restricción de unicidad para UPSERT (evitar duplicados)
    CONSTRAINT tms_partidas_uniq UNIQUE (codigo_producto, partida)
);

-- 3. CREAR TABLA SERIES (Base para Hoja SERIE)
-- Estructura: Cod. Producto, Producto, Cod. U. Medida, Serie, Disponible, Reserva, Transitoria, Consignación, Stock Total
CREATE TABLE public.tms_series (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    codigo_producto VARCHAR(100), -- Col A
    producto VARCHAR(255),        -- Col B
    unidad_medida VARCHAR(50),    -- Col C
    serie VARCHAR(100),           -- Col D
    disponible NUMERIC(12,2) DEFAULT 0,    -- Col E
    reserva NUMERIC(12,2) DEFAULT 0,       -- Col F
    transitoria NUMERIC(12,2) DEFAULT 0,   -- Col G
    consignacion NUMERIC(12,2) DEFAULT 0,  -- Col H
    stock_total NUMERIC(12,2) DEFAULT 0,   -- Col I
    ubicacion_actual VARCHAR(100), -- Opcional, por si se enriquece luego
    estado VARCHAR(50) DEFAULT 'DISPONIBLE',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Restricción de unicidad para UPSERT
    CONSTRAINT tms_series_uniq UNIQUE (serie)
);

-- 4. CREAR TABLA FARMAPACK (Base para Hoja FARMAPACK)
-- Estructura: Cod. Producto, Producto, Cod. U. Medida, Partida / Talla, Disponible, Reserva, Transitoria, Consignación, Stock Total
CREATE TABLE public.tms_farmapack (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    codigo_producto VARCHAR(100), -- Col A
    producto VARCHAR(255),        -- Col B
    unidad_medida VARCHAR(50),    -- Col C
    lote VARCHAR(100),            -- Col D (Partida / Talla)
    disponible NUMERIC(12,2) DEFAULT 0,    -- Col E
    reserva NUMERIC(12,2) DEFAULT 0,       -- Col F
    transitoria NUMERIC(12,2) DEFAULT 0,   -- Col G
    consignacion NUMERIC(12,2) DEFAULT 0,  -- Col H
    stock_total NUMERIC(12,2) DEFAULT 0,   -- Col I
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Restricción de unicidad (asumiendo Codigo + Lote es único)
    CONSTRAINT tms_farmapack_uniq UNIQUE (codigo_producto, lote)
);

-- 5. ÍNDICES PARA BÚSQUEDA RÁPIDA
CREATE INDEX idx_partidas_search ON public.tms_partidas(codigo_producto, producto);
CREATE INDEX idx_series_search ON public.tms_series(codigo_producto, producto, serie);
CREATE INDEX idx_farmapack_search ON public.tms_farmapack(codigo_producto, producto, lote);
