-- AUMENTAR TAMAÑO DE COLUMNAS PARA EVITAR ERRORES DE CARGA MASIVA
-- El error "value too long for type character varying(50)" indica que estamos intentando
-- insertar texto más largo de lo permitido en alguna columna.

-- 1. Ampliar columnas en tms_nv_diarias
ALTER TABLE public.tms_nv_diarias ALTER COLUMN codigo_producto TYPE TEXT;
ALTER TABLE public.tms_nv_diarias ALTER COLUMN descripcion_producto TYPE TEXT;
ALTER TABLE public.tms_nv_diarias ALTER COLUMN cliente TYPE TEXT;
ALTER TABLE public.tms_nv_diarias ALTER COLUMN vendedor TYPE TEXT;
ALTER TABLE public.tms_nv_diarias ALTER COLUMN nv TYPE TEXT;
ALTER TABLE public.tms_nv_diarias ALTER COLUMN estado_erp TYPE TEXT;
ALTER TABLE public.tms_nv_diarias ALTER COLUMN cod_cliente TYPE TEXT;
ALTER TABLE public.tms_nv_diarias ALTER COLUMN cod_vendedor TYPE TEXT;
ALTER TABLE public.tms_nv_diarias ALTER COLUMN zona TYPE TEXT;
ALTER TABLE public.tms_nv_diarias ALTER COLUMN unidad TYPE TEXT;

-- 2. Asegurar que otras tablas clave también tengan columnas flexibles
ALTER TABLE public.tms_matriz_codigos ALTER COLUMN codigo_producto TYPE TEXT;
ALTER TABLE public.tms_matriz_codigos ALTER COLUMN producto TYPE TEXT;

ALTER TABLE public.tms_control_despacho ALTER COLUMN cliente TYPE TEXT;
ALTER TABLE public.tms_control_despacho ALTER COLUMN empresa_transporte TYPE TEXT;
