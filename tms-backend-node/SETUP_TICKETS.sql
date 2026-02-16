-- 1. Tabla de Tickets de Soporte
CREATE TABLE IF NOT EXISTS public.tms_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id TEXT UNIQUE NOT NULL, -- ID amigable ej: T-20240220-001
    usuario_id TEXT NOT NULL,
    usuario_nombre TEXT NOT NULL,
    descripcion TEXT NOT NULL,
    prioridad TEXT DEFAULT 'MEDIA', -- BAJA, MEDIA, ALTA, CRITICA
    estado TEXT DEFAULT 'PENDIENTE', -- PENDIENTE, EN_REVISION, RESUELTO
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    respuesta_admin TEXT
);

-- 2. Habilitar Realtime para Tickets (Para alertas Admin)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'tms_tickets') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE tms_tickets;
  END IF;
END
$$;

-- 3. Permisos (RLS) - Simplificado: Todos pueden crear, Admin puede ver todo
-- Opcional: Activar RLS si se requiere privacidad estricta
-- ALTER TABLE public.tms_tickets ENABLE ROW LEVEL SECURITY;

-- 4. Registrar permiso en tabla de permisos (si usas sistema de roles)
INSERT INTO public.tms_permisos (id, nombre, modulo) 
VALUES ('manage_tickets', 'Gestionar Tickets TI', 'admin')
ON CONFLICT DO NOTHING;

INSERT INTO public.tms_roles_permisos (rol_id, permiso_id)
SELECT 'ADMIN', 'manage_tickets'
WHERE NOT EXISTS (SELECT 1 FROM public.tms_roles_permisos WHERE rol_id = 'ADMIN' AND permiso_id = 'manage_tickets');
