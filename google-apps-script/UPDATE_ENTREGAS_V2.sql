-- Ajuste final de columnas para módulo Despachos (Estructura A-O)
ALTER TABLE public.tms_entregas 
ADD COLUMN IF NOT EXISTS empresa_transporte VARCHAR(255) DEFAULT 'PROPIO',
ADD COLUMN IF NOT EXISTS valor_flete NUMERIC(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS num_envio_ot VARCHAR(100), -- Renombramos o usamos num_envio
ADD COLUMN IF NOT EXISTS fecha_despacho TIMESTAMP WITH TIME ZONE; -- Para columna K
