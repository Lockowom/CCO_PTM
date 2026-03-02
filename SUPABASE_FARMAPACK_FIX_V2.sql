-- ==============================================================================
-- FIX FARMAPACK COLUMNS (PART 2)
-- ==============================================================================
-- El usuario reporta que necesita que la estructura sea idéntica a 'tms_partidas'.
-- Agregamos la columna 'estado' si falta.

DO $$ 
BEGIN 
    -- Agregar columna 'estado' si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tms_farmapack' AND column_name = 'estado') THEN
        ALTER TABLE tms_farmapack ADD COLUMN estado TEXT;
    END IF;
END $$;
