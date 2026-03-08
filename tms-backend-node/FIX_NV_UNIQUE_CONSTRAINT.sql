-- CORRECCIÓN CRÍTICA PARA PERMITIR MÚLTIPLES ÍTEMS POR N.V.
-- Este script elimina la restricción que obliga a que la N.V sea única por sí sola.

-- 1. Eliminar la restricción incorrecta (la que causa el error "tms_nv_diarias_nv_unique")
ALTER TABLE tms_nv_diarias 
DROP CONSTRAINT IF EXISTS tms_nv_diarias_nv_unique;

-- 2. Asegurar que la restricción correcta exista (NV + Producto = Único)
-- Esto permite tener la misma N.V muchas veces, siempre que el producto sea distinto
ALTER TABLE tms_nv_diarias 
DROP CONSTRAINT IF EXISTS tms_nv_diarias_nv_codigo_unique;

ALTER TABLE tms_nv_diarias 
ADD CONSTRAINT tms_nv_diarias_nv_codigo_unique UNIQUE (nv, codigo_producto);

-- 3. Confirmación
SELECT 'Restricciones corregidas correctamente. Ahora se permiten múltiples ítems por N.V.' as mensaje;
