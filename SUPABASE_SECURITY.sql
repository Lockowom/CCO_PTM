-- ==============================================================================
-- WMS SECURITY PACK - ROW LEVEL SECURITY (RLS) - CORREGIDO
-- ==============================================================================
-- Este script asegura tu base de datos usando los nombres de tabla correctos.
-- Instrucciones: Ejecuta esto en el Editor SQL de Supabase.
-- ==============================================================================

-- 1. Habilitar RLS en tablas críticas
-- Si alguna tabla no existe, el comando fallará, pero puedes ignorarlo si no usas ese módulo.

ALTER TABLE tms_usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE tms_nv_diarias ENABLE ROW LEVEL SECURITY;
-- Habilitar en tablas de inventario si existen
DO $$ BEGIN
    ALTER TABLE tms_partidas ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE wms_inventory ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- ==============================================================================
-- POLÍTICAS DE USUARIOS (Tabla 'tms_usuarios')
-- ==============================================================================

-- Permitir que cada usuario vea su propio perfil
-- Asumiendo que 'id' en tms_usuarios es el UUID de auth.users, o hay un campo 'email'
-- Si tms_usuarios.id NO es el uuid de auth, necesitamos vincular por email.
-- Por seguridad, permitimos lectura a usuarios autenticados para que el login funcione.

CREATE POLICY "Usuarios ven su propio perfil" ON tms_usuarios
FOR SELECT USING (
  email = auth.email() OR id::text = auth.uid()::text
);

-- Permitir que los ADMINS vean a todos los usuarios
CREATE POLICY "Admins ven todo" ON tms_usuarios
FOR ALL USING (
  EXISTS (SELECT 1 FROM tms_usuarios WHERE email = auth.email() AND rol = 'ADMIN')
);

-- ==============================================================================
-- POLÍTICAS OPERATIVAS (Tablas de Trabajo)
-- ==============================================================================

-- NOTAS DE VENTA (tms_nv_diarias)
-- Lectura: Todo usuario autenticado (operadores, choferes, admins)
CREATE POLICY "Acceso lectura NV" ON tms_nv_diarias
FOR SELECT USING (auth.role() = 'authenticated');

-- Escritura: Todo usuario autenticado puede actualizar estados (picking, entrega)
CREATE POLICY "Acceso escritura NV" ON tms_nv_diarias
FOR UPDATE USING (auth.role() = 'authenticated');

-- Borrado: SOLO ADMINS pueden borrar notas de venta
CREATE POLICY "Solo Admin borra NV" ON tms_nv_diarias
FOR DELETE USING (
  EXISTS (SELECT 1 FROM tms_usuarios WHERE email = auth.email() AND rol = 'ADMIN')
);

-- INVENTARIO (wms_inventory si existe, o tms_partidas)
-- Si usas wms_inventory (la tabla nueva transaccional):
DO $$ BEGIN
    CREATE POLICY "Ver inventario" ON wms_inventory
    FOR SELECT USING (auth.role() = 'authenticated');

    CREATE POLICY "Modificar inventario" ON wms_inventory
    FOR ALL USING (auth.role() = 'authenticated');
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- ==============================================================================
-- FUNCIONES DE SEGURIDAD (RPC)
-- ==============================================================================

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM tms_usuarios 
    WHERE email = auth.email() 
    AND rol = 'ADMIN'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
