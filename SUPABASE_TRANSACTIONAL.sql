-- ==============================================================================
-- WMS TRANSACTIONAL CORE - SUPABASE / POSTGRESQL
-- ==============================================================================
-- Este script implementa el manejo seguro de inventario (ACID Transactions)
-- para evitar condiciones de carrera (Race Conditions) en picking concurrente.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. FUNCIÓN DE MOVIMIENTO DE STOCK (ATÓMICA)
-- ------------------------------------------------------------------------------
-- Mueve stock de una ubicación a otra, o ajusta cantidades.
-- Maneja errores si no hay suficiente saldo.

CREATE OR REPLACE FUNCTION wms_move_stock(
    p_sku TEXT,
    p_batch TEXT,
    p_from_location TEXT,
    p_to_location TEXT,
    p_qty INTEGER,
    p_user_id UUID,
    p_reason TEXT
)
RETURNS JSONB AS $$
DECLARE
    v_current_qty INTEGER;
    v_new_id UUID;
BEGIN
    -- 1. Bloquear fila de origen para lectura (SELECT FOR UPDATE)
    -- Esto evita que dos operarios tomen el mismo stock al mismo tiempo
    SELECT quantity INTO v_current_qty
    FROM wms_inventory
    WHERE sku = p_sku 
    AND batch_number = p_batch 
    AND location_code = p_from_location
    FOR UPDATE;

    -- 2. Validar saldo suficiente
    IF v_current_qty IS NULL OR v_current_qty < p_qty THEN
        RAISE EXCEPTION 'Saldo insuficiente en origen. Disponible: %, Solicitado: %', COALESCE(v_current_qty, 0), p_qty;
    END IF;

    -- 3. Descontar de origen
    UPDATE wms_inventory
    SET quantity = quantity - p_qty,
        updated_at = NOW()
    WHERE sku = p_sku 
    AND batch_number = p_batch 
    AND location_code = p_from_location;

    -- 4. Incrementar en destino (Upsert)
    INSERT INTO wms_inventory (sku, batch_number, location_code, quantity, updated_at)
    VALUES (p_sku, p_batch, p_to_location, p_qty, NOW())
    ON CONFLICT (sku, batch_number, location_code)
    DO UPDATE SET 
        quantity = wms_inventory.quantity + p_qty,
        updated_at = NOW();

    -- 5. Registrar en Kardex (Auditoría)
    INSERT INTO wms_kardex (
        sku, batch, from_loc, to_loc, qty, user_id, reason, created_at
    ) VALUES (
        p_sku, p_batch, p_from_location, p_to_location, p_qty, p_user_id, p_reason, NOW()
    );

    -- 6. Limpiar origen si quedó en 0 (Opcional, para no llenar tabla de ceros)
    DELETE FROM wms_inventory 
    WHERE sku = p_sku 
    AND batch_number = p_batch 
    AND location_code = p_from_location 
    AND quantity = 0;

    RETURN jsonb_build_object('success', true, 'message', 'Movimiento exitoso');
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'message', SQLERRM);
END;
$$ LANGUAGE plpgsql;


-- ------------------------------------------------------------------------------
-- 2. RESERVA DE STOCK PARA PICKING (Soft Allocation)
-- ------------------------------------------------------------------------------
-- Cuando se genera una orden, se "reserva" el stock para que no se venda dos veces
-- antes de ser pickeado físicamente.

CREATE OR REPLACE FUNCTION wms_reserve_stock(
    p_order_id UUID,
    p_sku TEXT,
    p_qty INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
    v_available INTEGER;
    v_reserved INTEGER;
BEGIN
    -- Calcular disponible real (Total - Reservado en otras órdenes)
    SELECT 
        COALESCE(SUM(quantity), 0) - 
        COALESCE((SELECT SUM(qty_reserved) FROM wms_allocations WHERE sku = p_sku), 0)
    INTO v_available
    FROM wms_inventory
    WHERE sku = p_sku AND status = 'AVAILABLE';

    IF v_available < p_qty THEN
        RETURN FALSE; -- No hay stock suficiente para reservar
    END IF;

    -- Crear reserva
    INSERT INTO wms_allocations (order_id, sku, qty_reserved, created_at)
    VALUES (p_order_id, p_sku, p_qty, NOW());

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
