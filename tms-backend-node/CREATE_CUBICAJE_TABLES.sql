
-- 1. Crear tabla principal de pesos (Si no existe)
CREATE TABLE IF NOT EXISTS public.tms_pesos (
    codigo_producto TEXT PRIMARY KEY,
    descripcion TEXT,
    peso_unitario NUMERIC DEFAULT 0,
    largo NUMERIC DEFAULT 0,
    ancho NUMERIC DEFAULT 0,
    alto NUMERIC DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Crear tabla de historial de cubicaje (Para auditoría)
CREATE TABLE IF NOT EXISTS public.tms_cubicaje_historial (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo_producto TEXT NOT NULL,
    peso NUMERIC,
    largo NUMERIC,
    ancho NUMERIC,
    alto NUMERIC,
    tipo_empaque TEXT, -- UNIDAD, CAJA, BOLSA, ETC.
    usuario_id UUID REFERENCES auth.users(id), -- Opcional: Referencia a auth.users si usas Auth de Supabase
    observaciones TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Habilitar RLS (Seguridad)
ALTER TABLE public.tms_pesos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tms_cubicaje_historial ENABLE ROW LEVEL SECURITY;

-- 4. Políticas de acceso (Permitir todo a usuarios autenticados por ahora)
CREATE POLICY "Acceso total a pesos" ON public.tms_pesos FOR ALL USING (true);
CREATE POLICY "Acceso total a historial cubicaje" ON public.tms_cubicaje_historial FOR ALL USING (true);

-- 5. Dar permisos al rol anon y authenticated (Por si acaso)
GRANT ALL ON public.tms_pesos TO anon, authenticated, service_role;
GRANT ALL ON public.tms_cubicaje_historial TO anon, authenticated, service_role;
