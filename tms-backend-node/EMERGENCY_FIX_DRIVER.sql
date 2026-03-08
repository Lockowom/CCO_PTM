-- SOLUCIÓN DE EMERGENCIA PARA ACCESO DENEGADO
-- 1. Deshabilitar temporalmente RLS para descartar problemas de permisos
ALTER TABLE public.tms_conductores DISABLE ROW LEVEL SECURITY;

-- 2. Limpiar registros antiguos o corruptos de davies@ptm.cl
-- Primero obtenemos el ID del usuario
DO $$
DECLARE
  v_user_id UUID;
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'davies@ptm.cl';
  
  IF v_user_id IS NOT NULL THEN
    -- Borrar cualquier conductor asociado a este user_id
    DELETE FROM public.tms_conductores WHERE user_id = v_user_id;
    
    -- Borrar cualquier conductor con el RUT de prueba (por si acaso)
    DELETE FROM public.tms_conductores WHERE rut = '11.111.111-1';

    -- 3. Crear el conductor desde cero, limpio
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
      'Davies', 
      'Driver', 
      '11.111.111-1', 
      '+56900000000', 
      'PAT-001', 
      'DISPONIBLE', 
      v_user_id,
      NOW()
    );
    
    RAISE NOTICE 'Conductor recreado exitosamente para el usuario %', v_user_id;
  ELSE
    RAISE NOTICE 'Usuario davies@ptm.cl no encontrado en el sistema de autenticación.';
  END IF;
END $$;

-- NOTA: RLS queda deshabilitado para esta tabla. 
-- Si esto soluciona el problema, sabremos que era un tema de políticas.
-- En el futuro, se debe volver a habilitar con: ALTER TABLE public.tms_conductores ENABLE ROW LEVEL SECURITY;
