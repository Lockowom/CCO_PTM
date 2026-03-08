-- FIX: Asegurar estructura de Picking en tms_nv_diarias

-- 1. Agregar columna 'picking_status' (TEXT)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tms_nv_diarias' AND column_name = 'picking_status') THEN 
        ALTER TABLE public.tms_nv_diarias ADD COLUMN picking_status TEXT; 
    END IF; 
END $$;

-- 2. Agregar columna 'cantidad_real' (NUMERIC)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tms_nv_diarias' AND column_name = 'cantidad_real') THEN 
        ALTER TABLE public.tms_nv_diarias ADD COLUMN cantidad_real NUMERIC DEFAULT 0; 
    END IF; 
END $$;

-- 3. Asegurar que usuario_asignado y usuario_nombre existan (por si acaso)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tms_nv_diarias' AND column_name = 'usuario_asignado') THEN 
        ALTER TABLE public.tms_nv_diarias ADD COLUMN usuario_asignado UUID; 
    END IF; 
END $$;

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tms_nv_diarias' AND column_name = 'usuario_nombre') THEN 
        ALTER TABLE public.tms_nv_diarias ADD COLUMN usuario_nombre TEXT; 
    END IF; 
END $$;

-- 4. Asegurar permisos de escritura
GRANT ALL ON public.tms_nv_diarias TO authenticated;
GRANT ALL ON public.tms_nv_diarias TO service_role;

-- 5. Desactivar RLS estricto si está causando problemas (opcional, pero recomendado para debug)
-- ALTER TABLE public.tms_nv_diarias DISABLE ROW LEVEL SECURITY;
