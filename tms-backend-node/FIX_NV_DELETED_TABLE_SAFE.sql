
-- Script seguro para crear la tabla de N.V. eliminadas y sus políticas
-- Elimina las políticas existentes antes de recrearlas para evitar errores

-- 1. Crear la tabla si no existe
CREATE TABLE IF NOT EXISTS public.tms_nv_eliminadas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nv TEXT NOT NULL,
    fecha_eliminacion TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    usuario_elimino UUID REFERENCES auth.users(id),
    motivo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Crear índice si no existe
CREATE INDEX IF NOT EXISTS idx_tms_nv_eliminadas_nv ON public.tms_nv_eliminadas(nv);

-- 3. Habilitar RLS (seguro de ejecutar múltiples veces)
ALTER TABLE public.tms_nv_eliminadas ENABLE ROW LEVEL SECURITY;

-- 4. Eliminar políticas antiguas (con y sin puntos en "N.V.") para evitar conflictos
DROP POLICY IF EXISTS "Usuarios autenticados pueden ver N.V. eliminadas" ON public.tms_nv_eliminadas;
DROP POLICY IF EXISTS "Usuarios autenticados pueden registrar N.V. eliminadas" ON public.tms_nv_eliminadas;
DROP POLICY IF EXISTS "Usuarios autenticados pueden ver NV eliminadas" ON public.tms_nv_eliminadas;
DROP POLICY IF EXISTS "Usuarios autenticados pueden registrar NV eliminadas" ON public.tms_nv_eliminadas;

-- 5. Crear políticas nuevas
-- Permitir lectura a usuarios autenticados (para que DataImport pueda verificar)
CREATE POLICY "Usuarios autenticados pueden ver N.V. eliminadas" 
ON public.tms_nv_eliminadas FOR SELECT 
TO authenticated 
USING (true);

-- Permitir inserción a usuarios autenticados (para que SalesOrders pueda registrar)
CREATE POLICY "Usuarios autenticados pueden registrar N.V. eliminadas" 
ON public.tms_nv_eliminadas FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- 6. Comentarios
COMMENT ON TABLE public.tms_nv_eliminadas IS 'Registro de Notas de Venta eliminadas manualmente para evitar re-importación';
