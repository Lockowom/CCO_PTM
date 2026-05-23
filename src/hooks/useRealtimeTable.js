import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/supabase';
import { toast } from 'sonner';

export const useRealtimeTable = (tableName, queryKeysToInvalidate = [tableName], options = {}) => {
  const queryClient = useQueryClient();
  const { showToasts = false, event = '*', filter } = options;
  const keysRef = useRef(queryKeysToInvalidate);
  keysRef.current = queryKeysToInvalidate;

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
        keysRef.current.forEach(key => {
          queryClient.invalidateQueries({ queryKey: [key] });
        });

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
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tableName, queryClient, showToasts, event, filter]);
};

export default useRealtimeTable;
