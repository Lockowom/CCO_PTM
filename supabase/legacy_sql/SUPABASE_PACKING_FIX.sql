-- ==============================================================================
-- FIX PACKING ERROR - ADD MISSING COLUMN
-- ==============================================================================
-- El módulo de Packing intenta actualizar 'fecha_actualizacion' en 'tms_entregas'
-- pero la columna no existe. Este script la crea.

DO $$ 
BEGIN 
    -- Agregar columna fecha_actualizacion si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tms_entregas' AND column_name = 'fecha_actualizacion') THEN
        ALTER TABLE tms_entregas ADD COLUMN fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;

    -- Asegurar que existe fecha_creacion también
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tms_entregas' AND column_name = 'fecha_creacion') THEN
        ALTER TABLE tms_entregas ADD COLUMN fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;
