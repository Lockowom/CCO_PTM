-- FULL SETUP FOR ACCESS CONTROL & ACTIVE USERS
-- This script creates both tables needed for the "Control de Accesos" module.
-- Run this entire script in Supabase SQL Editor.

BEGIN;

-- 1. Create Login History Table (tms_accesos)
CREATE TABLE IF NOT EXISTS public.tms_accesos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    usuario_id TEXT NOT NULL,
    nombre TEXT,
    email TEXT,
    rol TEXT,
    fecha TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Active Users Table (tms_usuarios_activos)
CREATE TABLE IF NOT EXISTS public.tms_usuarios_activos (
    usuario_id TEXT PRIMARY KEY,
    nombre TEXT NOT NULL,
    rol TEXT NOT NULL,
    ultima_actividad TIMESTAMPTZ DEFAULT NOW(),
    modulo_actual TEXT,
    estado TEXT DEFAULT 'ONLINE'
);

-- 3. Disable strict security policies for these tables (Public/Internal use)
ALTER TABLE public.tms_accesos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tms_usuarios_activos DISABLE ROW LEVEL SECURITY;

-- 4. Grant permissions to authenticated users
GRANT ALL ON public.tms_accesos TO authenticated;
GRANT ALL ON public.tms_accesos TO service_role;

GRANT ALL ON public.tms_usuarios_activos TO authenticated;
GRANT ALL ON public.tms_usuarios_activos TO service_role;

-- 5. Enable Realtime for Active Users (Critical for "Usuarios Activos" tab)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'tms_usuarios_activos'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.tms_usuarios_activos;
  END IF;
END $$;

COMMIT;
