-- REMOVE ALL STRICT CONSTRAINTS FOR FLEXIBLE IMPORT
-- This script drops both the UNIQUE constraint and the FOREIGN KEY constraint on wms_ubicaciones.
-- This allows:
-- 1. Multiple entries for the same location/product (duplicates).
-- 2. Locations that are NOT defined in wms_layout (orphan locations).

DO $$
BEGIN
    -- 1. Drop Unique Constraint (Allow Duplicates)
    IF EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'wms_ubicaciones_ubicacion_codigo_key'
    ) THEN
        ALTER TABLE public.wms_ubicaciones DROP CONSTRAINT wms_ubicaciones_ubicacion_codigo_key;
    END IF;

    -- 2. Drop Foreign Key Constraint (Allow Orphan Locations)
    IF EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_wms_ubicaciones_layout'
    ) THEN
        ALTER TABLE public.wms_ubicaciones DROP CONSTRAINT fk_wms_ubicaciones_layout;
    END IF;
END $$;
