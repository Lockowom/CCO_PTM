-- Agregar columnas faltantes para sincronización manual con Sheets
ALTER TABLE public.tms_entregas 
ADD COLUMN IF NOT EXISTS facturas VARCHAR(255),
ADD COLUMN IF NOT EXISTS guia VARCHAR(100),
ADD COLUMN IF NOT EXISTS transportista VARCHAR(255),
ADD COLUMN IF NOT EXISTS division VARCHAR(100),
ADD COLUMN IF NOT EXISTS num_envio VARCHAR(100);
