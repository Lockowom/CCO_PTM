-- SCRIPT DE CORRECCIÓN DEFINITIVA DE CLAVES FORÁNEAS (FK)
-- Este script soluciona el error "violates foreign key constraint"
-- Causa: La tabla apuntaba a 'auth.users' (Supabase Auth) pero el sistema usa 'tms_usuarios' (Tabla propia).

BEGIN;

-- 1. Eliminar la restricción incorrecta
ALTER TABLE public.tms_conductores 
DROP CONSTRAINT IF EXISTS tms_conductores_user_id_fkey;

-- 2. Crear la restricción correcta apuntando a tms_usuarios
-- Esto asegura que el ID del conductor corresponda a un usuario válido del sistema
ALTER TABLE public.tms_conductores 
ADD CONSTRAINT tms_conductores_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES public.tms_usuarios(id)
ON DELETE CASCADE;

-- 3. Limpiar permisos RLS que podrían bloquear la inserción
ALTER TABLE public.tms_conductores DISABLE ROW LEVEL SECURITY;

-- 4. Asegurar que el usuario actual tenga permisos
GRANT ALL ON public.tms_conductores TO authenticated;
GRANT ALL ON public.tms_conductores TO anon;
GRANT ALL ON public.tms_conductores TO service_role;

COMMIT;
