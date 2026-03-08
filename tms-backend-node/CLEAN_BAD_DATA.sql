-- LIMPIEZA DE DATOS CORRUPTOS EN N.V. DIARIAS
-- Elimina filas donde el campo 'nv' parece ser un nombre de cliente (contiene texto largo, espacios, 'SPA', 'LTDA', etc.)
-- y donde la fecha o el cliente son nulos (indicador de desfase de columnas)

DELETE FROM public.tms_nv_diarias
WHERE 
    -- Criterio 1: El NV es sospechosamente largo (> 15 chars) Y no empieza con números ni 'NV'
    (length(nv) > 15 AND nv !~ '^[0-9]+' AND nv !~ '^NV-')
    OR
    -- Criterio 2: El NV contiene palabras clave de empresas
    (nv ILIKE '% SPA%' OR nv ILIKE '% LTDA%' OR nv ILIKE '% S.A.%' OR nv ILIKE '%HOSPITAL%' OR nv ILIKE '%CLINICA%' OR nv ILIKE '%SERVICIO%')
    OR
    -- Criterio 3: Registros vacíos o basura
    (nv IS NULL OR length(nv) < 2);

-- Opcional: Si quieres ver qué se borraría antes de ejecutarlo, cambia DELETE por SELECT *
