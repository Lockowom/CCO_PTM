-- SCRIPT DEFINITIVO Y SEGURO: CORRECCIÓN "VALUE TOO LONG"
-- Este script verifica si las columnas existen antes de intentar modificarlas.
-- Así evitamos el error "column does not exist".

DO $$
DECLARE
    -- Lista de tablas y columnas que queremos asegurar que sean TEXT
    -- Formato: tabla, columna
    cols_to_fix text[][] := ARRAY[
        ['tms_nv_diarias', 'nv'],
        ['tms_nv_diarias', 'cliente'],
        ['tms_nv_diarias', 'vendedor'],
        ['tms_nv_diarias', 'codigo_producto'],
        ['tms_nv_diarias', 'descripcion_producto'],
        ['tms_nv_diarias', 'estado_erp'],
        ['tms_nv_diarias', 'zona'],
        ['tms_nv_diarias', 'unidad'],
        ['tms_nv_diarias', 'cod_cliente'],
        ['tms_nv_diarias', 'cod_vendedor'],
        ['tms_nv_diarias', 'ciudad'],
        ['tms_nv_diarias', 'region'],
        ['tms_nv_diarias', 'direccion_despacho'],
        ['tms_nv_diarias', 'observaciones'],
        
        ['tms_matriz_codigos', 'codigo_producto'],
        ['tms_matriz_codigos', 'producto'],
        ['tms_matriz_codigos', 'unidad_medida'],
        ['tms_matriz_codigos', 'categoria'],
        
        ['tms_control_despacho', 'cliente'],
        ['tms_control_despacho', 'direccion'],
        ['tms_control_despacho', 'comuna'],
        ['tms_control_despacho', 'conductor'],
        ['tms_control_despacho', 'empresa_transporte']
    ];
    
    t_name text;
    c_name text;
BEGIN
    -- Recorrer la lista de columnas
    FOR i IN 1..array_length(cols_to_fix, 1) LOOP
        t_name := cols_to_fix[i][1];
        c_name := cols_to_fix[i][2];
        
        -- Verificar si la columna existe en la tabla
        IF EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = t_name 
            AND column_name = c_name
        ) THEN
            -- Si existe, intentar cambiar el tipo a TEXT
            BEGIN
                EXECUTE format('ALTER TABLE public.%I ALTER COLUMN %I TYPE TEXT', t_name, c_name);
                RAISE NOTICE 'Columna %.% cambiada a TEXT', t_name, c_name;
            EXCEPTION WHEN OTHERS THEN
                RAISE NOTICE 'No se pudo cambiar %.%: %', t_name, c_name, SQLERRM;
            END;
        ELSE
            RAISE NOTICE 'La columna %.% no existe, saltando...', t_name, c_name;
        END IF;
    END LOOP;
END $$;
