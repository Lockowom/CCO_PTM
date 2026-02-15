-- 1. Eliminar la tabla actual y recrearla SIN restricción única en RUT
DROP TABLE IF EXISTS public.tms_direcciones CASCADE;

CREATE TABLE public.tms_direcciones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Campos Buscables
    razon_social TEXT,
    nombre TEXT,
    rut TEXT, -- YA NO ES UNIQUE
    
    -- Campos Informativos
    region TEXT,
    ciudad TEXT,
    comuna TEXT,
    direccion TEXT,
    telefono_1 TEXT,
    
    -- Metadatos
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indices para búsqueda rápida (Aún necesarios)
CREATE INDEX IF NOT EXISTS idx_direcciones_rut ON public.tms_direcciones(rut);
CREATE INDEX IF NOT EXISTS idx_direcciones_razon ON public.tms_direcciones(razon_social);
CREATE INDEX IF NOT EXISTS idx_direcciones_nombre ON public.tms_direcciones(nombre);

-- Habilitar RLS de nuevo (necesario porque borramos la tabla)
ALTER TABLE public.tms_direcciones ENABLE ROW LEVEL SECURITY;

-- Políticas de Seguridad (Para que funcione el Script con clave pública)
CREATE POLICY "Permitir Todo Anonimos" 
ON public.tms_direcciones 
FOR ALL 
TO anon 
USING (true) 
WITH CHECK (true);
