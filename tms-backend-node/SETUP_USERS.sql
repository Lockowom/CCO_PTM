-- 1. Agregar columnas para tracking de usuarios en NV
ALTER TABLE public.tms_nv_diarias 
ADD COLUMN IF NOT EXISTS usuario_asignado TEXT,
ADD COLUMN IF NOT EXISTS usuario_nombre TEXT;

-- 2. Tabla para monitoreo de usuarios activos (Heartbeat)
CREATE TABLE IF NOT EXISTS public.tms_usuarios_activos (
    usuario_id TEXT PRIMARY KEY,
    nombre TEXT NOT NULL,
    rol TEXT NOT NULL,
    ultima_actividad TIMESTAMPTZ DEFAULT NOW(),
    modulo_actual TEXT,
    estado TEXT DEFAULT 'ONLINE' -- ONLINE, AUSENTE, OFFLINE
);

-- Habilitar Realtime para esta tabla
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'tms_usuarios_activos') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE tms_usuarios_activos;
  END IF;
END
$$;

-- 3. Función para limpiar usuarios inactivos (> 5 min)
CREATE OR REPLACE FUNCTION public.clean_inactive_users()
RETURNS void AS $$
BEGIN
  DELETE FROM public.tms_usuarios_activos
  WHERE ultima_actividad < NOW() - INTERVAL '5 minutes';
END;
$$ LANGUAGE plpgsql;

-- 4. Vincular Conductores con Usuarios del WMS
ALTER TABLE public.tms_conductores
ADD COLUMN IF NOT EXISTS user_id TEXT; -- ID del usuario en tabla 'tms_usuarios' o 'auth.users'

-- Índice para búsqueda rápida
CREATE INDEX IF NOT EXISTS idx_conductores_user_id ON public.tms_conductores(user_id);
