import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/supabase';
import { toast } from 'sonner';

/**
 * Hook para escuchar cambios realtime en una tabla y refrescar queries.
 * Incluye debounce para evitar cascadas de invalidación en operaciones batch.
 */
export const useRealtimeTable = (tableName, queryKeysToInvalidate = [tableName], options = {}) => {
  const queryClient = useQueryClient();
  const { showToasts = false, event = '*', filter, debounceMs = 800 } = options;
  const keysRef = useRef(queryKeysToInvalidate);
  keysRef.current = queryKeysToInvalidate;

  const debounceTimerRef = useRef(null);

  const debouncedInvalidate = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      keysRef.current.forEach(key => {
        queryClient.invalidateQueries({ queryKey: [key] });
      });
      debounceTimerRef.current = null;
    }, debounceMs);
  }, [queryClient, debounceMs]);

  useEffect(() => {
    const channelConfig = {
      event,
      schema: 'public',
      table: tableName,
      ...(filter && { filter }),
    };

    const channel = supabase
      .channel(`realtime_${tableName}`)
      .on('postgres_changes', channelConfig, (payload) => {
        // Debounce: agrupar múltiples cambios rápidos en una sola invalidación
        debouncedInvalidate();

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
        if (err) console.error('Realtime subscription error:', err);
      });

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      supabase.removeChannel(channel);
    };
  }, [tableName, queryClient, showToasts, event, filter, debouncedInvalidate]);
};

export default useRealtimeTable;
