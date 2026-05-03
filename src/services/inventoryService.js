import { supabase } from '../supabase';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

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

/**
 * Custom hook con TanStack Query para movimiento de stock con caché y carga optimista.
 */
export const useMoveStock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ sku, batch, fromLoc, toLoc, qty, userId, reason }) => {
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
      return data;
    },
    onMutate: async (newMove) => {
      // 🚀 CARGA OPTIMISTA: Actualiza la UI antes de que el servidor responda
      await queryClient.cancelQueries({ queryKey: ['stock', newMove.fromLoc] });
      const previousStock = queryClient.getQueryData(['stock', newMove.fromLoc]);
      
      // Resta visualmente el stock al instante
      queryClient.setQueryData(['stock', newMove.fromLoc], old => {
        if (typeof old === 'number') return old - newMove.qty;
        // Si el estado es un array de items de stock
        if (Array.isArray(old)) {
          return old.map(item => 
            item.sku === newMove.sku ? { ...item, qty: item.qty - newMove.qty } : item
          );
        }
        return old;
      });
      return { previousStock };
    },
    onError: (err, newMove, context) => {
      // Si falla, revierte al estado anterior
      queryClient.setQueryData(['stock', newMove.fromLoc], context?.previousStock);
      toast.error('❌ Desplazamiento denegado: Bloqueo en zona destino o error de servidor.');
    },
    onSettled: () => {
      // Sincroniza la verdad absoluta de fondo
      queryClient.invalidateQueries({ queryKey: ['stock'] });
    }
  });
};
