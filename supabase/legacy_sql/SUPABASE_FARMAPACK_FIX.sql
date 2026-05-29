-- ==============================================================================
-- FIX FARMAPACK ERROR - ADD MISSING COLUMN
-- ==============================================================================
-- El error indica que falta la columna 'fecha_vencimiento' en la tabla 'tms_farmapack'.
-- Esta columna es crítica para productos farmacéuticos (FEFO).

DO $$ 
BEGIN 
    -- Agregar columna fecha_vencimiento si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tms_farmapack' AND column_name = 'fecha_vencimiento') THEN
        ALTER TABLE tms_farmapack ADD COLUMN fecha_vencimiento DATE;
    END IF;

    -- Agregar columna lote (batch) si no existe, ya que suele ir junto a vencimiento
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tms_farmapack' AND column_name = 'lote') THEN
        ALTER TABLE tms_farmapack ADD COLUMN lote TEXT;
    END IF;

     -- Agregar columna serie si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tms_farmapack' AND column_name = 'serie') THEN
        ALTER TABLE tms_farmapack ADD COLUMN serie TEXT;
    END IF;
END $$;
