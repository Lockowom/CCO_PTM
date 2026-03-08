-- REPARACIÓN INTEGRAL DEL MÓDULO DE USUARIOS Y ACCESOS

-- 1. Asegurar estructura de la tabla de usuarios
CREATE TABLE IF NOT EXISTS public.tms_usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_usuario TEXT,
    nombre TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL, -- Almacenamos contraseña (en este modelo custom)
    rol TEXT REFERENCES public.tms_roles(id) DEFAULT 'OPERADOR',
    activo BOOLEAN DEFAULT true,
    es_admin_delegado BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Asegurar columnas faltantes (si la tabla ya existía)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tms_usuarios' AND column_name = 'es_admin_delegado') THEN
        ALTER TABLE public.tms_usuarios ADD COLUMN es_admin_delegado BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tms_usuarios' AND column_name = 'password_hash') THEN
        ALTER TABLE public.tms_usuarios ADD COLUMN password_hash TEXT DEFAULT '123456';
    END IF;
END $$;

-- 3. Configurar Seguridad (RLS) para este modelo de Auth Personalizado
-- Como no usamos Supabase Auth real, necesitamos que la API (anon) pueda leer/escribir
-- PERO protegemos esto para que solo se pueda hacer desde la App (en teoría)
ALTER TABLE public.tms_usuarios ENABLE ROW LEVEL SECURITY;

-- Política: Permitir TODO a la API (anon/authenticated) para que el login y el CRUD funcionen
-- NOTA: En producción idealmente usaríamos Supabase Auth, pero para este fix mantenemos la lógica actual
DROP POLICY IF EXISTS "Acceso total a usuarios" ON public.tms_usuarios;
CREATE POLICY "Acceso total a usuarios" ON public.tms_usuarios FOR ALL USING (true);

-- 4. Asegurar Realtime (Notificaciones instantáneas)
ALTER TABLE public.tms_usuarios REPLICA IDENTITY FULL;

DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.tms_usuarios;
    EXCEPTION
        WHEN duplicate_object THEN NULL;
        WHEN OTHERS THEN NULL;
    END;
END $$;

-- 5. Crear usuario Admin por defecto si no existe (Backup de acceso)
INSERT INTO public.tms_usuarios (id_usuario, nombre, email, password_hash, rol, activo, es_admin_delegado)
VALUES 
('ADM-MASTER', 'Administrador Principal', 'admin@cco.cl', 'admin123', 'ADMIN', true, true)
ON CONFLICT (email) DO UPDATE SET 
    rol = 'ADMIN',
    activo = true,
    es_admin_delegado = true;
