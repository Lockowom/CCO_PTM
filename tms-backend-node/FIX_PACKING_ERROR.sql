-- FIX: Agregar columna 'peso' a la tabla tms_entregas para solucionar error en Packing

-- 1. Agregar columna 'peso' (NUMERIC)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tms_entregas' AND column_name = 'peso') THEN 
        ALTER TABLE public.tms_entregas ADD COLUMN peso NUMERIC DEFAULT 0; 
    END IF; 
END $$;

-- 2. Asegurar otras columnas que podrían faltar (bultos, direccion, comuna)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tms_entregas' AND column_name = 'bultos') THEN 
        ALTER TABLE public.tms_entregas ADD COLUMN bultos INTEGER DEFAULT 0; 
    END IF; 
END $$;

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tms_entregas' AND column_name = 'direccion') THEN 
        ALTER TABLE public.tms_entregas ADD COLUMN direccion TEXT; 
    END IF; 
END $$;

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tms_entregas' AND column_name = 'comuna') THEN 
        ALTER TABLE public.tms_entregas ADD COLUMN comuna TEXT; 
    END IF; 
END $$;

-- 3. Asegurar permisos
GRANT ALL ON public.tms_entregas TO authenticated;
GRANT ALL ON public.tms_entregas TO service_role;
