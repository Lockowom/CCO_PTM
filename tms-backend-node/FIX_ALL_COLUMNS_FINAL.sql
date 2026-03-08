-- SCRIPT DE EMERGENCIA: CORRECCIÓN DEFINITIVA "VALUE TOO LONG"
-- Este script cambia TODAS las columnas de texto de las tablas principales a TEXT ilimitado.
-- Ejecútalo completo en el Editor SQL de Supabase.

BEGIN;

-- 1. TABLA tms_nv_diarias (Donde ocurre el error principal)
-- Iteramos sobre todas las columnas posibles que puedan recibir texto largo
ALTER TABLE public.tms_nv_diarias ALTER COLUMN nv TYPE TEXT;
ALTER TABLE public.tms_nv_diarias ALTER COLUMN cliente TYPE TEXT;
ALTER TABLE public.tms_nv_diarias ALTER COLUMN vendedor TYPE TEXT;
ALTER TABLE public.tms_nv_diarias ALTER COLUMN descripcion_producto TYPE TEXT;
ALTER TABLE public.tms_nv_diarias ALTER COLUMN codigo_producto TYPE TEXT;
ALTER TABLE public.tms_nv_diarias ALTER COLUMN estado_erp TYPE TEXT;
ALTER TABLE public.tms_nv_diarias ALTER COLUMN zona TYPE TEXT;
ALTER TABLE public.tms_nv_diarias ALTER COLUMN unidad TYPE TEXT;
ALTER TABLE public.tms_nv_diarias ALTER COLUMN cod_cliente TYPE TEXT;
ALTER TABLE public.tms_nv_diarias ALTER COLUMN cod_vendedor TYPE TEXT;
ALTER TABLE public.tms_nv_diarias ALTER COLUMN ciudad TYPE TEXT;
ALTER TABLE public.tms_nv_diarias ALTER COLUMN region TYPE TEXT;
ALTER TABLE public.tms_nv_diarias ALTER COLUMN direccion_despacho TYPE TEXT;
ALTER TABLE public.tms_nv_diarias ALTER COLUMN observaciones TYPE TEXT;

-- 2. TABLA tms_matriz_codigos (Productos Maestros)
-- Por si el error viene al intentar crear un producto nuevo automáticamente
ALTER TABLE public.tms_matriz_codigos ALTER COLUMN codigo_producto TYPE TEXT;
ALTER TABLE public.tms_matriz_codigos ALTER COLUMN producto TYPE TEXT;
ALTER TABLE public.tms_matriz_codigos ALTER COLUMN unidad_medida TYPE TEXT;
ALTER TABLE public.tms_matriz_codigos ALTER COLUMN categoria TYPE TEXT;
ALTER TABLE public.tms_matriz_codigos ALTER COLUMN subcategoria TYPE TEXT;

-- 3. TABLA tms_control_despacho (Despachos)
ALTER TABLE public.tms_control_despacho ALTER COLUMN cliente TYPE TEXT;
ALTER TABLE public.tms_control_despacho ALTER COLUMN direccion TYPE TEXT;
ALTER TABLE public.tms_control_despacho ALTER COLUMN comuna TYPE TEXT;
ALTER TABLE public.tms_control_despacho ALTER COLUMN ciudad TYPE TEXT;
ALTER TABLE public.tms_control_despacho ALTER COLUMN conductor TYPE TEXT;
ALTER TABLE public.tms_control_despacho ALTER COLUMN patente TYPE TEXT;
ALTER TABLE public.tms_control_despacho ALTER COLUMN empresa_transporte TYPE TEXT;

-- 4. TABLA tms_maestro_direcciones (Direcciones)
ALTER TABLE public.tms_maestro_direcciones ALTER COLUMN cliente TYPE TEXT;
ALTER TABLE public.tms_maestro_direcciones ALTER COLUMN direccion TYPE TEXT;
ALTER TABLE public.tms_maestro_direcciones ALTER COLUMN comuna TYPE TEXT;
ALTER TABLE public.tms_maestro_direcciones ALTER COLUMN ciudad TYPE TEXT;
ALTER TABLE public.tms_maestro_direcciones ALTER COLUMN region TYPE TEXT;

COMMIT;
