-- CREAR TABLA INVENTARIO CONSOLIDADO (Resumen)
-- Estructura basada en: Cod. Producto, Producto, UM, Disponible, Reserva, Transitoria, Consignación, Stock Total

DROP TABLE IF EXISTS public.tms_inventario_resumen CASCADE;

CREATE TABLE public.tms_inventario_resumen (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    codigo_producto VARCHAR(100) UNIQUE, -- Col A (Clave única)
    producto VARCHAR(255),               -- Col B
    unidad_medida VARCHAR(50),           -- Col C
    disponible NUMERIC(12,2) DEFAULT 0,  -- Col D
    reserva NUMERIC(12,2) DEFAULT 0,     -- Col E
    transitoria NUMERIC(12,2) DEFAULT 0, -- Col F
    consignacion NUMERIC(12,2) DEFAULT 0,-- Col G
    stock_total NUMERIC(12,2) DEFAULT 0, -- Col H
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para búsquedas rápidas
CREATE INDEX idx_inventario_cod_prod ON public.tms_inventario_resumen(codigo_producto, producto);
