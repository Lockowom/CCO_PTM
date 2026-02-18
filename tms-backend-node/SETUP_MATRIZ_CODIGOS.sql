-- SETUP MATRIZ CODIGOS TABLE
-- This table stores the master list of product codes, descriptions, and units of measure.

CREATE TABLE IF NOT EXISTS public.tms_matriz_codigos (
    codigo_producto TEXT PRIMARY KEY,
    producto TEXT NOT NULL,
    unidad_medida TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Disable strict RLS for easy bulk import
ALTER TABLE public.tms_matriz_codigos DISABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON public.tms_matriz_codigos TO authenticated;
GRANT ALL ON public.tms_matriz_codigos TO service_role;
