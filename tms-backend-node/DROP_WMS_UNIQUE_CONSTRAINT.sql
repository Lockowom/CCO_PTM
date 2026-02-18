-- DROP UNIQUE CONSTRAINT ON wms_ubicaciones
-- Purpose: Allow multiple entries for the same location and product code
-- This is required to support bulk uploads where duplicates are valid (e.g., same product in same location but different batch/serial)

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'wms_ubicaciones_ubicacion_codigo_key'
    ) THEN
        ALTER TABLE public.wms_ubicaciones DROP CONSTRAINT wms_ubicaciones_ubicacion_codigo_key;
    END IF;
END $$;
