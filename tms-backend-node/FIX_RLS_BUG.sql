-- FIX: Reparar error de permisos al eliminar N.V.
-- Este script asegura que la tabla 'tms_nv_eliminadas' exista y tenga los permisos correctos.

-- 1. Asegurar que la tabla existe
CREATE TABLE IF NOT EXISTS public.tms_nv_eliminadas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nv TEXT NOT NULL,
    fecha_eliminacion TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    usuario_elimino UUID REFERENCES auth.users(id),
    motivo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Crear índice para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_tms_nv_eliminadas_nv ON public.tms_nv_eliminadas(nv);

-- 3. Habilitar seguridad a nivel de fila (RLS)
ALTER TABLE public.tms_nv_eliminadas ENABLE ROW LEVEL SECURITY;

-- 4. Eliminar políticas antiguas para evitar conflictos
DROP POLICY IF EXISTS "Usuarios autenticados pueden ver N.V. eliminadas" ON public.tms_nv_eliminadas;
DROP POLICY IF EXISTS "Usuarios autenticados pueden registrar N.V. eliminadas" ON public.tms_nv_eliminadas;
DROP POLICY IF EXISTS "Usuarios autenticados pueden ver NV eliminadas" ON public.tms_nv_eliminadas;
DROP POLICY IF EXISTS "Usuarios autenticados pueden registrar NV eliminadas" ON public.tms_nv_eliminadas;

-- 5. Crear políticas de acceso CORRECTAS
-- Permitir lectura (SELECT) a todos los usuarios autenticados
CREATE POLICY "Usuarios autenticados pueden ver N.V. eliminadas" 
ON public.tms_nv_eliminadas FOR SELECT 
TO authenticated 
USING (true);

-- Permitir inserción (INSERT) a todos los usuarios autenticados
-- Esto soluciona el error: "new row violates row-level security policy"
CREATE POLICY "Usuarios autenticados pueden registrar N.V. eliminadas" 
ON public.tms_nv_eliminadas FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- 6. Confirmación
COMMENT ON TABLE public.tms_nv_eliminadas IS 'Registro de N.V. eliminadas - Policies fixed';
