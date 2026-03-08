-- Script para habilitar acceso al conductor davies@ptm.cl y corregir estructura
-- 1. Asegurar que existe la columna user_id en la tabla de conductores
ALTER TABLE public.tms_conductores 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- 2. Asegurar que existe la columna updated_at (requerida por la App Móvil)
ALTER TABLE public.tms_conductores 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 3. Vincular el usuario davies@ptm.cl como conductor
DO $$
DECLARE
  v_user_id UUID;
  v_conductor_id UUID;
BEGIN
  -- Buscar ID del usuario en autenticación
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'davies@ptm.cl';

  IF v_user_id IS NULL THEN
    RAISE NOTICE 'Usuario davies@ptm.cl no encontrado en auth.users. Asegúrese de que se haya registrado primero.';
  ELSE
    -- Verificar si ya existe un conductor vinculado a este usuario
    SELECT id INTO v_conductor_id FROM public.tms_conductores WHERE user_id = v_user_id;

    IF v_conductor_id IS NOT NULL THEN
      -- Ya existe, actualizamos estado
      UPDATE public.tms_conductores 
      SET estado = 'DISPONIBLE', updated_at = NOW()
      WHERE id = v_conductor_id;
      RAISE NOTICE 'Conductor existente actualizado.';
    ELSE
      -- No existe, creamos un nuevo perfil de conductor
      INSERT INTO public.tms_conductores (
        nombre, 
        apellido, 
        rut, 
        telefono, 
        vehiculo_patente, 
        estado, 
        user_id,
        updated_at
      ) VALUES (
        'Davies',          -- Nombre (Placeholder)
        'Driver',          -- Apellido (Placeholder)
        '11.111.111-1',    -- RUT (Placeholder)
        '+56900000000',    -- Teléfono (Placeholder)
        'PAT-001',         -- Patente (Placeholder)
        'DISPONIBLE',
        v_user_id,
        NOW()
      );
      RAISE NOTICE 'Nuevo perfil de conductor creado para davies@ptm.cl';
    END IF;
  END IF;
END $$;
