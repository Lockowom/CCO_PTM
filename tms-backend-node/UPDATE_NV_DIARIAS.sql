-- ACTUALIZACIÓN TABLA N.V DIARIAS (Para coincidir con el Excel)
-- Agrega las columnas que faltan en la base de datos

ALTER TABLE public.tms_nv_diarias ADD COLUMN IF NOT EXISTS estado_erp TEXT;
ALTER TABLE public.tms_nv_diarias ADD COLUMN IF NOT EXISTS cod_cliente TEXT;
ALTER TABLE public.tms_nv_diarias ADD COLUMN IF NOT EXISTS cod_vendedor TEXT;
ALTER TABLE public.tms_nv_diarias ADD COLUMN IF NOT EXISTS zona TEXT;

-- Nota: Ya existían 'cliente', 'vendedor', 'codigo_producto', 'descripcion_producto', 'unidad', 'cantidad'
