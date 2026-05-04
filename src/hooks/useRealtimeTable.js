import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/supabase';
import { toast } from 'sonner';

/**
 * Hook para suscribirse a cambios en tiempo real (INSERT/UPDATE/DELETE) en cualquier tabla.
 * Automáticamente invalida el caché de React Query para refrescar los datos.
 * 
 * @param {string} tableName - Nombre de la tabla a escuchar
 * @param {Array<string>} queryKeysToInvalidate - Lista de query keys a invalidar cuando haya cambios
 * @param {Object} options - Opciones extras
 * @param {boolean} options.showToasts - Si debe mostrar notificaciones flotantes al haber cambios (default: false)
 * @param {string} options.event - Evento a escuchar ('*' | 'INSERT' | 'UPDATE' | 'DELETE') (default: '*')
 * @param {string} options.filter - Filtro opcional (ej: 'estado=eq.PENDIENTE')
 */
export const useRealtimeTable = (tableName, queryKeysToInvalidate = [tableName], options = {}) => {
  const queryClient = useQueryClient();
  const { showToasts = false, event = '*', filter } = options;

  useEffect(() => {
    let channelConfig = {
      event: event,
      schema: 'public',
      table: tableName,
    };

    if (filter) {
      channelConfig.filter = filter;
    }

    const channel = supabase
      .channel(`realtime_${tableName}`)
      .on('postgres_changes', channelConfig, (payload) => {
        // Invalidar caché automáticamente
        queryKeysToInvalidate.forEach(key => {
          queryClient.invalidateQueries({ queryKey: [key] });
        });

        // Mostrar notificaciones opcionales
        if (showToasts) {
          if (payload.eventType === 'INSERT') {
            toast.info(`Nuevo registro en ${tableName}`);
          } else if (payload.eventType === 'UPDATE') {
            toast.info(`Registro actualizado en ${tableName}`);
          } else if (payload.eventType === 'DELETE') {
            toast.warning(`Registro eliminado de ${tableName}`);
          }
        }
      })
      .subscribe((status, err) => {
        if (err) {
          console.error(`Error subscribing to ${tableName}:`, err);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tableName, queryClient, JSON.stringify(queryKeysToInvalidate), showToasts, event, filter]);
};

export default useRealtimeTable;