-- Tablas para módulo de Consulta Maestra (replicando LotesSeries.gs)

-- Tabla PESOS (desde hoja Peso)
CREATE TABLE IF NOT EXISTS public.tms_pesos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    codigo_producto VARCHAR(100),
    descripcion VARCHAR(255),
    peso_unitario NUMERIC(10,4),
    largo NUMERIC(10,2),
    ancho NUMERIC(10,2),
    alto NUMERIC(10,2),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla UBICACIONES (desde hoja Ubicaciones)
CREATE TABLE IF NOT EXISTS public.tms_ubicaciones_historial (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    ubicacion VARCHAR(100),
    codigo_producto VARCHAR(100),
    serie VARCHAR(100),
    partida VARCHAR(100),
    pieza VARCHAR(100),
    fecha_venc DATE,
    cantidad NUMERIC(12,2),
    descripcion VARCHAR(255),
    usuario VARCHAR(100),
    fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para búsqueda rápida
CREATE INDEX IF NOT EXISTS idx_pesos_cod ON public.tms_pesos(codigo_producto);
CREATE INDEX IF NOT EXISTS idx_pesos_desc ON public.tms_pesos(descripcion);
CREATE INDEX IF NOT EXISTS idx_ubic_cod ON public.tms_ubicaciones_historial(codigo_producto);
CREATE INDEX IF NOT EXISTS idx_ubic_serie ON public.tms_ubicaciones_historial(serie);
