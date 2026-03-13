-- ==============================================================================
-- FUNCIÓN PARA SINCRONIZAR ÍTEMS ELIMINADOS EN N.V.
-- ==============================================================================
-- Esta función permite detectar cuando una N.V. viene con menos ítems que antes.
-- Los ítems que ya no vienen en la carga se marcan automáticamente como 'CANCELADO'.

CREATE OR REPLACE FUNCTION public.sync_deleted_items(payload JSONB)
RETURNS TABLE(nv TEXT, items_cancelados INT) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    r RECORD;
    v_nv TEXT;
    v_codigos TEXT[]; -- Array de códigos que SÍ vienen en la carga
    v_count INT;
BEGIN
    -- Recorrer cada N.V. recibida en la carga
    -- Payload estructura esperada: [{ "nv": "NV-100", "codigos": ["PROD1", "PROD2"] }, ...]
    
    FOR r IN SELECT * FROM jsonb_to_recordset(payload) AS x(nv TEXT, codigos TEXT[])
    LOOP
        v_nv := r.nv;
        v_codigos := r.codigos;
        
        -- Actualización Masiva:
        -- Busca filas de esta N.V. en la base de datos
        -- Que NO estén en la lista de códigos nuevos ( != ALL(v_codigos) )
        -- Y que NO estén ya terminados (Entregado, Cancelado, Devuelto)
        -- Y los marca como CANCELADO.
        
        WITH updated_rows AS (
            UPDATE public.tms_nv_diarias
            SET estado = 'CANCELADO',
                updated_at = NOW()
            WHERE nv = v_nv 
            AND codigo_producto != ALL(v_codigos) -- La clave de la detección
            AND estado NOT IN ('ENTREGADO', 'CANCELADO', 'DEVUELTO', 'DESPACHADO') -- No tocar lo ya finalizado
            RETURNING 1
        )
        SELECT COUNT(*) INTO v_count FROM updated_rows;
        
        -- Si hubo cancelaciones, reportarlo en el resultado
        IF v_count > 0 THEN
            nv := v_nv;
            items_cancelados := v_count;
            RETURN NEXT;
        END IF;
    END LOOP;
    
    RETURN;
END;
$$;

-- Otorgar permisos
GRANT EXECUTE ON FUNCTION public.sync_deleted_items(JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.sync_deleted_items(JSONB) TO service_role;
