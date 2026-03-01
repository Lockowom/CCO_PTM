import { supabase } from '../supabase';

// ==============================================================================
// WMS TRANSACTIONAL SERVICE (ACID GUARANTEE)
// ==============================================================================
// Este servicio maneja movimientos críticos de inventario.
// NUNCA hacer updates directos a tablas de stock desde el cliente.
// SIEMPRE usar estas funciones RPC.
// ==============================================================================

export const InventoryService = {
  
  /**
   * Mueve stock de forma atómica.
   * Lanza error si no hay saldo o hay bloqueo concurrente.
   */
  async moveStock({ sku, batch, fromLoc, toLoc, qty, userId, reason }) {
    try {
      const { data, error } = await supabase.rpc('wms_move_stock', {
        p_sku: sku,
        p_batch: batch,
        p_from_location: fromLoc,
        p_to_location: toLoc,
        p_qty: qty,
        p_user_id: userId,
        p_reason: reason
      });

      if (error) throw error;
      return data; // { success: true/false, message: ... }
    } catch (err) {
      console.error('Error moviendo stock:', err);
      return { success: false, message: err.message };
    }
  },

  /**
   * Intenta reservar stock para una orden.
   * Retorna true si tuvo éxito, false si no hay stock disponible.
   */
  async reserveStock(orderId, sku, qty) {
    try {
      const { data, error } = await supabase.rpc('wms_reserve_stock', {
        p_order_id: orderId,
        p_sku: sku,
        p_qty: qty
      });

      if (error) throw error;
      return data; // true/false
    } catch (err) {
      console.error('Error reservando stock:', err);
      return false;
    }
  }
};
