-- FIX ACTIVE USERS REALTIME & PERMISSIONS
-- This script ensures that the active users table is properly configured for realtime updates.

-- 1. Ensure the table exists (just in case)
CREATE TABLE IF NOT EXISTS public.tms_usuarios_activos (
    usuario_id TEXT PRIMARY KEY,
    nombre TEXT NOT NULL,
    rol TEXT NOT NULL,
    ultima_actividad TIMESTAMPTZ DEFAULT NOW(),
    modulo_actual TEXT,
    estado TEXT DEFAULT 'ONLINE'
);

-- 2. DISABLE Row Level Security (RLS) for this specific table
-- This allows any authenticated user to read/write their status without complex policies blocking them.
-- Since this is a public status table, it's safe for internal use.
ALTER TABLE public.tms_usuarios_activos DISABLE ROW LEVEL SECURITY;

-- 3. Enable Realtime for this table
-- This is critical for the "Control de Accesos" module to update automatically.
DO $$
BEGIN
  -- Check if the table is already in the publication, if not, add it
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'tms_usuarios_activos'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.tms_usuarios_activos;
  END IF;
END $$;

-- 4. Grant permissions to authenticated users (just to be sure)
GRANT ALL ON public.tms_usuarios_activos TO authenticated;
GRANT ALL ON public.tms_usuarios_activos TO service_role;
