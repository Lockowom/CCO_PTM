-- SCRIPT PARA CORREGIR EL ERROR DE ELIMINACIÓN (Foreign Key Violation)
-- Este error ocurre porque intentas borrar un conductor que ya tiene Rutas o Entregas asignadas.
-- Este script cambia la configuración para que, si borras un conductor, 
-- sus rutas y entregas NO se borren, sino que queden con conductor = NULL (Sin asignar).

BEGIN;

-- 1. Corregir restricción en tms_rutas
ALTER TABLE public.tms_rutas 
DROP CONSTRAINT IF EXISTS tms_rutas_conductor_id_fkey;

ALTER TABLE public.tms_rutas 
ADD CONSTRAINT tms_rutas_conductor_id_fkey 
FOREIGN KEY (conductor_id) 
REFERENCES public.tms_conductores(id)
ON DELETE SET NULL; -- Si se borra el conductor, la ruta queda sin conductor

-- 2. Corregir restricción en tms_entregas (por seguridad)
ALTER TABLE public.tms_entregas 
DROP CONSTRAINT IF EXISTS tms_entregas_conductor_id_fkey;

ALTER TABLE public.tms_entregas 
ADD CONSTRAINT tms_entregas_conductor_id_fkey 
FOREIGN KEY (conductor_id) 
REFERENCES public.tms_conductores(id)
ON DELETE SET NULL; -- Si se borra el conductor, la entrega queda sin conductor

COMMIT;
