-- ==============================================================================
-- FIX INFINITE RECURSION IN RLS POLICY
-- ==============================================================================
-- El error "infinite recursion detected in policy" ocurre porque la política
-- "Admins ven todo" hace una consulta a la misma tabla 'tms_usuarios' para
-- verificar si el usuario es admin. Esto crea un bucle.

-- SOLUCIÓN: Usar una función SECURITY DEFINER para romper el ciclo, o simplificar.

-- 1. Eliminar políticas problemáticas
DROP POLICY IF EXISTS "Admins ven todo" ON tms_usuarios;
DROP POLICY IF EXISTS "Usuarios ven su propio perfil" ON tms_usuarios;

-- 2. Crear función auxiliar segura para verificar rol (evita recursión directa)
CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Consultar tms_usuarios saltándose RLS temporalmente
  -- (Al estar en esquema auth o ser security definer, podemos controlar esto)
  RETURN EXISTS (
    SELECT 1 FROM public.tms_usuarios 
    WHERE email = auth.email() 
    AND rol = 'ADMIN'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Recrear políticas SIN recursión
-- Política Base: Un usuario puede ver su propio registro
CREATE POLICY "Ver perfil propio" ON tms_usuarios
FOR SELECT USING (
  auth.email() = email OR auth.uid()::text = id::text
);

-- Política Admin: Usar la función o una subconsulta que no dependa de la política misma
-- Truco: Para evitar recursión en la misma tabla, a veces es mejor permitir lectura pública
-- autenticada de usuarios básicos (id, nombre, email) si no hay datos sensibles.
-- Si hay datos sensibles, la mejor opción es usar auth.jwt() -> role si estuviera ahí.

-- OPCIÓN SEGURA Y SIMPLE PARA EVITAR RECURSIÓN:
-- Permitir lectura a todos los autenticados (necesario para login y listar usuarios)
CREATE POLICY "Lectura usuarios autenticados" ON tms_usuarios
FOR SELECT USING (
  auth.role() = 'authenticated'
);

-- PERO restringir escritura/modificación SOLO al propio usuario o admins
CREATE POLICY "Modificar propio perfil" ON tms_usuarios
FOR UPDATE USING (
  auth.email() = email
);

-- Admin puede borrar/insertar (aquí sí usamos la subconsulta, pero como SELECT ya está abierto, no hay ciclo)
CREATE POLICY "Admin gestión total" ON tms_usuarios
FOR ALL USING (
  (SELECT rol FROM tms_usuarios WHERE email = auth.email()) = 'ADMIN'
);
