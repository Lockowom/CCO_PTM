-- Script optimizado para evitar Deadlocks (Bloqueos)
-- Ejecuta este script en el Editor SQL de Supabase.
-- Si vuelve a fallar, intenta ejecutar cada bloque por separado.

-- BLOQUE 1: Configurar Roles
ALTER TABLE public.tms_roles REPLICA IDENTITY FULL;

DO $$
BEGIN
    -- Intentar agregar la tabla, si ya está, no hacer nada
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.tms_roles;
    EXCEPTION
        WHEN duplicate_object THEN NULL;
        WHEN unique_violation THEN NULL;
        WHEN OTHERS THEN NULL;
    END;
END $$;

-- BLOQUE 2: Configurar Usuarios
ALTER TABLE public.tms_usuarios REPLICA IDENTITY FULL;

DO $$
BEGIN
    -- Intentar agregar la tabla, si ya está, no hacer nada
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.tms_usuarios;
    EXCEPTION
        WHEN duplicate_object THEN NULL;
        WHEN unique_violation THEN NULL;
        WHEN OTHERS THEN NULL;
    END;
END $$;
