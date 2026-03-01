-- ==============================================================================
-- WMS INTELLIGENCE PACK - SUPABASE / POSTGRESQL
-- ==============================================================================
-- Instrucciones: Ejecuta este script en el Editor SQL de tu proyecto Supabase.
-- Este script dota al WMS de "cerebro" para automatizar decisiones logísticas.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. AUTOMATIZACIÓN DE ESTADO DE PICKING (Auto-Packing)
-- ------------------------------------------------------------------------------
-- Descripción: Cuando todas las líneas de una orden de picking se marcan como 
-- 'COMPLETED', la orden principal cambia automáticamente a estado 'PACKING'.

CREATE OR REPLACE FUNCTION fn_auto_complete_picking()
RETURNS TRIGGER AS $$
DECLARE
    v_total_lines INTEGER;
    v_completed_lines INTEGER;
    v_order_id UUID;
BEGIN
    -- Obtener ID de la orden (ajustar nombre de columna según esquema real)
    v_order_id := NEW.order_id;

    -- Contar líneas totales vs completadas
    SELECT COUNT(*), COUNT(*) FILTER (WHERE status = 'COMPLETED')
    INTO v_total_lines, v_completed_lines
    FROM tms_picking_lines
    WHERE order_id = v_order_id;

    -- Si todas las líneas están completas, avanzar estado de la orden
    IF v_total_lines > 0 AND v_total_lines = v_completed_lines THEN
        UPDATE tms_nv_diarias 
        SET estado = 'PACKING', 
            updated_at = NOW(),
            picking_progress = 100
        WHERE id = v_order_id;
    ELSE
        -- Actualizar progreso porcentual
        UPDATE tms_nv_diarias 
        SET picking_progress = (v_completed_lines::FLOAT / v_total_lines::FLOAT) * 100,
            updated_at = NOW()
        WHERE id = v_order_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger (Descomentar cuando la tabla tms_picking_lines exista)
-- CREATE TRIGGER tr_picking_progress
-- AFTER UPDATE ON tms_picking_lines
-- FOR EACH ROW
-- EXECUTE FUNCTION fn_auto_complete_picking();


-- ------------------------------------------------------------------------------
-- 2. REABASTECIMIENTO AUTOMÁTICO (Min/Max Trigger)
-- ------------------------------------------------------------------------------
-- Descripción: Monitorea el stock en ubicaciones de picking. Si baja del mínimo,
-- crea automáticamente una tarea de reposición desde reserva.

CREATE OR REPLACE FUNCTION fn_trigger_replenishment()
RETURNS TRIGGER AS $$
DECLARE
    v_min_stock INTEGER;
    v_max_stock INTEGER;
    v_pending_tasks INTEGER;
BEGIN
    -- Buscar reglas de stock para este producto en esta ubicación
    -- (Asumiendo tabla de configuración de ubicaciones)
    SELECT min_qty, max_qty INTO v_min_stock, v_max_stock
    FROM wms_location_rules
    WHERE sku = NEW.sku AND location_code = NEW.location_code;

    -- Si no hay regla configurada, ignorar
    IF v_min_stock IS NULL THEN RETURN NEW; END IF;

    -- Verificar si el stock cayó por debajo del mínimo
    IF NEW.quantity <= v_min_stock THEN
        
        -- Verificar si ya existe una tarea pendiente (para no duplicar)
        SELECT COUNT(*) INTO v_pending_tasks
        FROM wms_replenishment_tasks
        WHERE sku = NEW.sku 
        AND destination_location = NEW.location_code 
        AND status IN ('PENDING', 'IN_PROGRESS');

        IF v_pending_tasks = 0 THEN
            -- Crear Tarea de Reabastecimiento
            INSERT INTO wms_replenishment_tasks (
                sku, 
                destination_location, 
                qty_requested, 
                priority, 
                status, 
                created_at
            )
            VALUES (
                NEW.sku, 
                NEW.location_code, 
                (v_max_stock - NEW.quantity), 
                'HIGH', 
                'PENDING', 
                NOW()
            );
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger (Descomentar cuando tabla wms_inventory exista)
-- CREATE TRIGGER tr_check_min_stock
-- AFTER UPDATE OF quantity ON wms_inventory
-- FOR EACH ROW
-- EXECUTE FUNCTION fn_trigger_replenishment();


-- ------------------------------------------------------------------------------
-- 3. ALGORITMO FEFO (First Expire, First Out) - RPC Function
-- ------------------------------------------------------------------------------
-- Descripción: Función invocable desde el Frontend (Supabase RPC) que sugiere
-- qué lotes tomar para una orden, priorizando los próximos a vencer.

CREATE OR REPLACE FUNCTION get_fefo_allocation(
    p_sku TEXT,
    p_qty_needed INTEGER
)
RETURNS TABLE (
    location_code TEXT,
    batch_number TEXT,
    expiry_date DATE,
    qty_available INTEGER,
    qty_to_pick INTEGER
) AS $$
DECLARE
    v_remaining_qty INTEGER := p_qty_needed;
    r RECORD;
BEGIN
    -- Iterar sobre inventario disponible ordenado por fecha de vencimiento
    FOR r IN 
        SELECT i.location_code, i.batch_number, i.expiry_date, i.quantity
        FROM wms_inventory i
        WHERE i.sku = p_sku
        AND i.quantity > 0
        AND i.status = 'AVAILABLE'
        ORDER BY i.expiry_date ASC, i.created_at ASC
    LOOP
        -- Si ya cubrimos la necesidad, terminamos
        IF v_remaining_qty <= 0 THEN EXIT; END IF;

        -- Calcular cuánto tomar de esta ubicación
        DECLARE
            v_take_qty INTEGER;
        BEGIN
            v_take_qty := LEAST(v_remaining_qty, r.quantity);
            
            -- Asignar valores de retorno
            location_code := r.location_code;
            batch_number := r.batch_number;
            expiry_date := r.expiry_date;
            qty_available := r.quantity;
            qty_to_pick := v_take_qty;
            
            RETURN NEXT;

            -- Reducir remanente
            v_remaining_qty := v_remaining_qty - v_take_qty;
        END;
    END LOOP;
    
    RETURN;
END;
$$ LANGUAGE plpgsql;
