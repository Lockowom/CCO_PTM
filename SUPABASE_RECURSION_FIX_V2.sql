-- ==============================================================================
-- FIX INFINITE RECURSION - SIMPLE SOLUTION
-- ==============================================================================

-- 1. Deshabilitar temporalmente RLS para resetear políticas
ALTER TABLE tms_usuarios DISABLE ROW LEVEL SECURITY;

-- 2. Eliminar políticas conflictivas
DROP POLICY IF EXISTS "Usuarios ven su propio perfil" ON tms_usuarios;
DROP POLICY IF EXISTS "Admins ven todo" ON tms_usuarios;
DROP POLICY IF EXISTS "Ver perfil propio" ON tms_usuarios;
DROP POLICY IF EXISTS "Lectura usuarios autenticados" ON tms_usuarios;
DROP POLICY IF EXISTS "Modificar propio perfil" ON tms_usuarios;
DROP POLICY IF EXISTS "Admin gestión total" ON tms_usuarios;

-- 3. Crear Políticas NUEVAS y LIMPIAS
-- Solución: Permitir SELECT a todos los autenticados.
-- En la mayoría de apps SaaS/WMS, ver la lista de usuarios básicos (nombre/email) es necesario
-- para asignar tareas, ver quién hizo qué, etc.
-- La restricción fuerte debe estar en UPDATE/DELETE.

CREATE POLICY "Lectura pública autenticada" ON tms_usuarios
FOR SELECT
TO authenticated
USING (true);

-- 4. Escritura SOLO para Admins (Evitando recursión usando auth.uid si es posible, o subconsulta simple)
-- Para evitar recursión en la misma tabla al hacer UPDATE/DELETE:
-- Usamos una función SECURITY DEFINER que consulta la tabla SIN pasar por RLS.

CREATE OR REPLACE FUNCTION is_user_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER -- Esto es clave: ejecuta con permisos del creador, saltando RLS del usuario
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM tms_usuarios 
    WHERE email = auth.email() -- Asumiendo auth.email() coincide con tms_usuarios.email
    AND rol = 'ADMIN'
  );
END;
$$;

-- Política de Modificación (Solo Admins o el propio usuario)
CREATE POLICY "Modificar usuarios" ON tms_usuarios
FOR UPDATE
TO authenticated
USING (
  auth.email() = email OR is_user_admin()
);

-- Política de Borrado (Solo Admins)
CREATE POLICY "Borrar usuarios" ON tms_usuarios
FOR DELETE
TO authenticated
USING ( is_user_admin() );

-- 5. Reactivar RLS
ALTER TABLE tms_usuarios ENABLE ROW LEVEL SECURITY;
