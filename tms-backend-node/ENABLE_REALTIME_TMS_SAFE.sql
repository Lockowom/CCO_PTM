-- SCRIPT DE ACTIVACIÓN REALTIME (VERSIÓN SEGURA / IDEMPOTENTE)
-- Este script verifica si la tabla ya está en la publicación antes de intentar añadirla.

BEGIN;

-- 1. Asegurar que la publicación existe
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
END
$$;

-- 2. Añadir tablas SOLO si no están ya en la publicación
DO $$
BEGIN
  -- tms_entregas
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'tms_entregas') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.tms_entregas;
  END IF;

  -- tms_rutas
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'tms_rutas') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.tms_rutas;
  END IF;

  -- tms_conductores
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'tms_conductores') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.tms_conductores;
  END IF;

  -- tms_nv_diarias
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'tms_nv_diarias') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.tms_nv_diarias;
  END IF;
END
$$;

-- 3. Configurar REPLICA IDENTITY a FULL (Esto es seguro de ejecutar múltiples veces)
-- Esto asegura que el evento UPDATE contenga todos los datos de la fila
ALTER TABLE public.tms_entregas REPLICA IDENTITY FULL;
ALTER TABLE public.tms_rutas REPLICA IDENTITY FULL;
ALTER TABLE public.tms_conductores REPLICA IDENTITY FULL;

-- 4. Re-aplicar permisos RLS para asegurar acceso a eventos
ALTER TABLE public.tms_entregas ENABLE ROW LEVEL SECURITY;

-- Limpiar políticas antiguas (si existen)
DROP POLICY IF EXISTS "Authenticated Select Entregas" ON public.tms_entregas;
DROP POLICY IF EXISTS "Authenticated Update Entregas" ON public.tms_entregas;

-- Crear políticas permisivas para autenticados
CREATE POLICY "Authenticated Select Entregas" 
ON public.tms_entregas 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Authenticated Update Entregas" 
ON public.tms_entregas 
FOR UPDATE 
TO authenticated 
USING (true)
WITH CHECK (true);

COMMIT;
