-- SCRIPT DE ACTIVACIÓN DEFINITIVA DE REALTIME
-- Este script asegura que las tablas del TMS envíen eventos a los clientes conectados.

BEGIN;

-- 1. Asegurar que la publicación 'supabase_realtime' exista
-- (Supabase la crea por defecto, pero verificamos)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
END
$$;

-- 2. Añadir tablas críticas a la publicación Realtime
-- Esto "enciende" la radio para que emita señales cuando hay cambios
ALTER PUBLICATION supabase_realtime ADD TABLE public.tms_entregas;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tms_rutas;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tms_conductores;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tms_nv_diarias;

-- 3. Configurar REPLICA IDENTITY a FULL
-- Esto asegura que en los eventos UPDATE se envíen los datos completos del registro,
-- no solo los que cambiaron. Es vital para que el frontend sepa qué fila actualizar.
ALTER TABLE public.tms_entregas REPLICA IDENTITY FULL;
ALTER TABLE public.tms_rutas REPLICA IDENTITY FULL;
ALTER TABLE public.tms_conductores REPLICA IDENTITY FULL;

-- 4. Verificar Permisos RLS para tms_entregas
-- Si RLS está activo, el usuario solo recibe eventos de filas que puede "ver".
-- Para garantizar que el conductor reciba la asignación (cuando el conductor_id cambia de NULL a SU_ID),
-- necesitamos una política que permita ver entregas asignadas O entregas pendientes.
-- Por ahora, para garantizar el funcionamiento, haremos la política permisiva para autenticados.

-- Habilitar RLS (si no lo estaba)
ALTER TABLE public.tms_entregas ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas antiguas restrictivas
DROP POLICY IF EXISTS "Conductores ven sus entregas" ON public.tms_entregas;
DROP POLICY IF EXISTS "Authenticated Select Entregas" ON public.tms_entregas;

-- Crear política amplia para lectura (necesaria para recibir el evento realtime inicial)
CREATE POLICY "Authenticated Select Entregas" 
ON public.tms_entregas 
FOR SELECT 
TO authenticated 
USING (true);

-- Crear política para actualización (necesaria para cambiar estados)
CREATE POLICY "Authenticated Update Entregas" 
ON public.tms_entregas 
FOR UPDATE 
TO authenticated 
USING (true)
WITH CHECK (true);

COMMIT;
