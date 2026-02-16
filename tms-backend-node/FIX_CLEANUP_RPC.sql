-- Función corregida para limpieza de datos operativos
-- Soluciona el error "DELETE requires a WHERE clause" usando condiciones explícitas

CREATE OR REPLACE FUNCTION public.clean_operational_data(
    p_clean_nv BOOLEAN,
    p_clean_partidas BOOLEAN,
    p_clean_series BOOLEAN,
    p_clean_farmapack BOOLEAN
)
RETURNS TEXT AS $$
DECLARE
    msg TEXT := '';
BEGIN
    -- 1. Limpiar Notas de Venta y Entregas TMS asociadas
    IF p_clean_nv THEN
        -- Borrar entregas asociadas a NVs (si existen claves foráneas, esto podría requerir CASCADE o borrar primero hijos)
        DELETE FROM public.tms_entregas WHERE true; 
        DELETE FROM public.tms_nv_diarias WHERE true;
        msg := msg || 'NV y Entregas eliminadas. ';
    END IF;

    -- 2. Limpiar Partidas
    IF p_clean_partidas THEN
        DELETE FROM public.tms_partidas WHERE true;
        msg := msg || 'Partidas eliminadas. ';
    END IF;

    -- 3. Limpiar Series
    IF p_clean_series THEN
        DELETE FROM public.tms_series WHERE true;
        msg := msg || 'Series eliminadas. ';
    END IF;

    -- 4. Limpiar Farmapack
    IF p_clean_farmapack THEN
        DELETE FROM public.tms_farmapack WHERE true;
        msg := msg || 'Datos Farmapack eliminados. ';
    END IF;

    IF msg = '' THEN
        RETURN 'No se seleccionaron datos para eliminar.';
    END IF;

    RETURN msg;
EXCEPTION
    WHEN OTHERS THEN
        RETURN 'Error: ' || SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
