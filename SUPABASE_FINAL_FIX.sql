-- ==============================================================================
-- FIX PERMISSION DENIED (ERROR 42501)
-- ==============================================================================
-- El error indica que no tienes permiso para modificar el esquema 'auth' o crear
-- funciones SECURITY DEFINER con privilegios elevados en ciertos esquemas.
-- SOLUCIÓN: Usar el esquema 'public' y simplificar al máximo.

-- 1. Desactivar RLS en tms_usuarios (temporalmente para limpiar)
ALTER TABLE IF EXISTS tms_usuarios DISABLE ROW LEVEL SECURITY;

-- 2. Eliminar políticas conflictivas (si existen)
DROP POLICY IF EXISTS "Usuarios ven su propio perfil" ON tms_usuarios;
DROP POLICY IF EXISTS "Admins ven todo" ON tms_usuarios;
DROP POLICY IF EXISTS "Ver perfil propio" ON tms_usuarios;
DROP POLICY IF EXISTS "Lectura usuarios autenticados" ON tms_usuarios;
DROP POLICY IF EXISTS "Lectura pública autenticada" ON tms_usuarios;
DROP POLICY IF EXISTS "Modificar propio perfil" ON tms_usuarios;
DROP POLICY IF EXISTS "Admin gestión total" ON tms_usuarios;
DROP POLICY IF EXISTS "Modificar usuarios" ON tms_usuarios;
DROP POLICY IF EXISTS "Borrar usuarios" ON tms_usuarios;

-- 3. Crear función de verificación en esquema PUBLIC (seguro)
CREATE OR REPLACE FUNCTION public.is_admin_safe()
RETURNS BOOLEAN AS $$
BEGIN
  -- Verificar si el email actual tiene rol ADMIN en la tabla pública
  RETURN EXISTS (
    SELECT 1 FROM public.tms_usuarios 
    WHERE email = auth.jwt() ->> 'email' 
    AND rol = 'ADMIN'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Crear Políticas SIMPLIFICADAS
-- Lectura: Todos los usuarios autenticados pueden leer la tabla de usuarios
-- (Necesario para ver quién es quién en el sistema)
CREATE POLICY "Lectura General" ON tms_usuarios
FOR SELECT
TO authenticated
USING (true);

-- Escritura (UPDATE): Solo uno mismo puede editar su perfil, O un admin
CREATE POLICY "Edición Propia o Admin" ON tms_usuarios
FOR UPDATE
TO authenticated
USING (
  email = (auth.jwt() ->> 'email') OR public.is_admin_safe()
);

-- Borrado (DELETE): Solo Admin
CREATE POLICY "Borrado Admin" ON tms_usuarios
FOR DELETE
TO authenticated
USING ( public.is_admin_safe() );

-- 5. Reactivar RLS
ALTER TABLE tms_usuarios ENABLE ROW LEVEL SECURITY;
