-- ==============================================================================
-- FIX RLS POLICIES FOR TMS_ERRORES_PICKING
-- ==============================================================================
-- Este script corrige el error "new row violates row-level security policy"
-- al intentar devolver un pedido a Picking desde Packing.

-- 1. Asegurar que la tabla existe (si no, la crea)
CREATE TABLE IF NOT EXISTS public.tms_errores_picking (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nv TEXT NOT NULL,
    usuario_picking_id UUID REFERENCES auth.users(id),
    usuario_picking_nombre TEXT,
    usuario_packing_id UUID REFERENCES auth.users(id),
    usuario_packing_nombre TEXT,
    motivo TEXT,
    fecha_deteccion TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Habilitar RLS explícitamente
ALTER TABLE public.tms_errores_picking ENABLE ROW LEVEL SECURITY;

-- 3. Eliminar políticas antiguas para evitar conflictos
DROP POLICY IF EXISTS "Lectura errores para autenticados" ON public.tms_errores_picking;
DROP POLICY IF EXISTS "Insercion errores para autenticados" ON public.tms_errores_picking;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.tms_errores_picking;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.tms_errores_picking;

-- 4. Crear políticas permisivas para usuarios autenticados
-- Permitir LECTURA a cualquier usuario autenticado (para dashboard)
CREATE POLICY "Lectura errores para autenticados" 
ON public.tms_errores_picking 
FOR SELECT 
TO authenticated 
USING (true);

-- Permitir INSERCIÓN a cualquier usuario autenticado (para packing)
CREATE POLICY "Insercion errores para autenticados" 
ON public.tms_errores_picking 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- 5. Otorgar permisos básicos al rol autenticado (por si acaso)
GRANT ALL ON public.tms_errores_picking TO authenticated;
GRANT ALL ON public.tms_errores_picking TO service_role;
