-- SCRIPT DE REPARACIÓN DE FARMAPACK
-- 1. Limpia la tabla llena de duplicados/basura
-- 2. Crea la restricción única para que NO vuelvan a crearse duplicados

BEGIN;

-- 1. Limpiar tabla completa (Reset)
TRUNCATE TABLE public.tms_farmapack;

-- 2. Asegurar que las columnas clave sean TEXT (para evitar problemas de espacios o tipos)
ALTER TABLE public.tms_farmapack ALTER COLUMN codigo_producto TYPE TEXT;
ALTER TABLE public.tms_farmapack ALTER COLUMN lote TYPE TEXT;

-- 3. Eliminar cualquier restricción anterior defectuosa (si existe)
ALTER TABLE public.tms_farmapack DROP CONSTRAINT IF EXISTS tms_farmapack_unique_key;
ALTER TABLE public.tms_farmapack DROP CONSTRAINT IF EXISTS tms_farmapack_pkey;

-- 4. Crear la restricción ÚNICA compuesta (Código + Lote)
-- Esto obliga a que si subes el mismo lote de nuevo, se ACTUALICE en vez de duplicarse
ALTER TABLE public.tms_farmapack 
ADD CONSTRAINT tms_farmapack_unique_key UNIQUE (codigo_producto, lote);

COMMIT;
