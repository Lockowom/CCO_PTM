-- Script de Diagnóstico y Corrección de Permisos RLS
-- 1. Eliminar políticas antiguas para evitar conflictos
DROP POLICY IF EXISTS "Anon Select TMS" ON public.tms_conductores;
DROP POLICY IF EXISTS "Anon Insert TMS" ON public.tms_conductores;
DROP POLICY IF EXISTS "Anon Update TMS" ON public.tms_conductores;
DROP POLICY IF EXISTS "Anon Delete TMS" ON public.tms_conductores;

DROP POLICY IF EXISTS "Authenticated Select TMS" ON public.tms_conductores;
DROP POLICY IF EXISTS "Authenticated Update TMS" ON public.tms_conductores;

-- 2. Crear políticas permisivas para todos los usuarios autenticados
-- Permite que cualquier usuario logueado pueda ver la lista de conductores (necesario para la validación inicial)
CREATE POLICY "Authenticated Select TMS" 
ON public.tms_conductores 
FOR SELECT 
TO authenticated 
USING (true);

-- Permite actualizar su propio registro (basado en user_id)
CREATE POLICY "Authenticated Update TMS" 
ON public.tms_conductores 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Política de respaldo para inserción (si se necesitara)
CREATE POLICY "Authenticated Insert TMS" 
ON public.tms_conductores 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- 3. Re-vincular usuario asegurando coincidencia de email
DO $$
DECLARE
  v_user_id UUID;
  v_email TEXT := 'davies@ptm.cl';
BEGIN
  -- Buscar ID del usuario ignorando mayúsculas/minúsculas
  SELECT id INTO v_user_id FROM auth.users WHERE LOWER(email) = LOWER(v_email);

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuario % no encontrado en auth.users', v_email;
  ELSE
    -- Actualizar registros existentes que puedan estar huérfanos o con user_id incorrecto
    -- Primero intentamos encontrar por RUT si ya existía manual
    UPDATE public.tms_conductores
    SET user_id = v_user_id, updated_at = NOW()
    WHERE rut = '11.111.111-1' OR user_id = v_user_id;

    -- Si no se actualizó nada, insertamos
    IF NOT FOUND THEN
      INSERT INTO public.tms_conductores (
        nombre, apellido, rut, telefono, vehiculo_patente, estado, user_id, updated_at
      ) VALUES (
        'Davies', 'Driver', '11.111.111-1', '+56900000000', 'PAT-001', 'DISPONIBLE', v_user_id, NOW()
      );
    END IF;
  END IF;
END $$;
