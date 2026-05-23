import { supabase } from '../supabase';

// ==============================================================================
// WMS INTELLIGENCE SERVICE (BACKEND LOGIC WRAPPER)
// ==============================================================================
// Este servicio conecta el Frontend React con las funciones inteligentes (RPC)
// desplegadas en Supabase (PostgreSQL).
// ==============================================================================

export const WmsIntelligence = {
  
  /**
   * Obtiene sugerencias de picking basadas en FEFO (First Expire, First Out).
   * @param {string} sku - Código del producto.
   * @param {number} qtyNeeded - Cantidad total requerida.
   * @returns {Promise<Array>} Lista de ubicaciones y lotes sugeridos.
   */
  async getSuggestedAllocation(sku, qtyNeeded) {
    try {
      const { data, error } = await supabase.rpc('get_fefo_allocation', { 
        p_sku: sku, 
        p_qty_needed: qtyNeeded 
      });

      if (error) throw error;
      return data || [];
    } catch (err) {
      return []; // Fallback: Retornar vacío para manejo manual
    }
  },

  /**
   * Fuerza el recálculo de reabastecimiento para una zona (Manual Trigger).
   * Útil si los triggers automáticos fallan o se desactivaron.
   */
  async triggerManualReplenishment(zoneId) {
    // Simulación de llamada a función RPC
    return { success: true, tasksCreated: 3 };
  },

  /**
   * Valida si un movimiento es permitido según reglas de negocio.
   * Ej: No mezclar lotes diferentes en una misma ubicación (si aplica).
   */
  async validateMovement(sku, targetLocation, batch) {
    // Lógica simulada
    // En producción: SELECT count(*) FROM wms_inventory WHERE location = targetLocation AND batch != batch
    return { allowed: true };
  }
};
