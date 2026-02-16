-- FIX PARA AGREGAR COLUMNA 'ESTADO' A TMS_PARTIDAS
-- Ejecuta esto si deseas que la tabla 'partidas' tenga un campo 'estado' como las 'series'

ALTER TABLE public.tms_partidas 
ADD COLUMN IF NOT EXISTS estado VARCHAR(50) DEFAULT 'DISPONIBLE';

-- Comentario para el futuro: Si agregas esta columna, recuerda volver a agregarla en DataImport.jsx
