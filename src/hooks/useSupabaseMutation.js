import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/supabase';
import { toast } from 'sonner';

/**
 * Hook genérico para realizar mutaciones (Insert, Update, Delete) en Supabase
 * con soporte para invalidación automática de caché y actualizaciones optimistas.
 * 
 * @param {string} tableName - Nombre de la tabla en Supabase
 * @param {Object} options - Opciones de configuración
 * @param {string} options.operation - 'insert' | 'update' | 'delete' | 'upsert' (default: 'insert')
 * @param {string} options.matchColumn - Columna para hacer match en update/delete (default: 'id')
 * @param {Array<string>} options.invalidates - Query keys a invalidar al terminar (ej: [tableName])
 * @param {boolean} options.optimistic - Activar carga optimista (default: false)
 * @param {string} options.successMessage - Mensaje de éxito para el toast
 * @returns {Object} { mutate, mutateAsync, isLoading, error }
 */
export const useSupabaseMutation = (tableName, options = {}) => {
  const queryClient = useQueryClient();
  const {
    operation = 'insert',
    matchColumn = 'id',
    invalidates = [tableName],
    optimistic = false,
    successMessage = 'Operación completada con éxito'
  } = options;

  return useMutation({
    mutationFn: async (payload) => {
      let query = supabase.from(tableName);

      switch (operation) {
        case 'insert':
          query = query.insert(payload);
          break;
        case 'update':
          if (!payload[matchColumn]) throw new Error(`Payload missing matchColumn: ${matchColumn}`);
          const { [matchColumn]: matchValue, ...updateData } = payload;
          query = query.update(updateData).eq(matchColumn, matchValue);
          break;
        case 'delete':
          query = query.delete().eq(matchColumn, payload[matchColumn] || payload);
          break;
        case 'upsert':
          query = query.upsert(payload);
          break;
        default:
          throw new Error(`Operation ${operation} not supported`);
      }

      const { data, error } = await query.select();
      if (error) throw error;
      return data;
    },
    
    // Carga Optimista
    onMutate: async (newPayload) => {
      if (!optimistic) return null;

      // Cancelar consultas en vuelo para que no sobrescriban nuestra actualización optimista
      await Promise.all(invalidates.map(key => queryClient.cancelQueries({ queryKey: [key] })));

      // Guardar snapshot del estado anterior
      const previousStates = {};
      invalidates.forEach(key => {
        previousStates[key] = queryClient.getQueryData([key]);
        
        // Modificar el caché optimísticamente dependiendo de la operación
        if (operation === 'update') {
          queryClient.setQueryData([key], (oldData) => {
            if (!oldData) return oldData;
            return oldData.map(item => 
              item[matchColumn] === newPayload[matchColumn] ? { ...item, ...newPayload } : item
            );
          });
        }
        // Nota: Para insert y delete se requiere lógica más compleja dependiendo 
        // de los filtros y ordenamiento del useQuery original, 
        // por simplicidad el update es el más directo para carga optimista global.
      });

      return { previousStates };
    },

    onError: (err, newPayload, context) => {
      // Revertir a la snapshot en caso de error
      if (context?.previousStates) {
        Object.entries(context.previousStates).forEach(([key, oldData]) => {
          queryClient.setQueryData([key], oldData);
        });
      }
      toast.error(`Error en la operación: ${err.message}`);
    },

    onSuccess: () => {
      if (successMessage) {
        toast.success(successMessage, {
          style: { background: '#1e293b', border: '1px solid #10b981', color: '#f8fafc' },
        });
      }
    },

    onSettled: () => {
      // Invalidar y refetch siempre para asegurar sincronización con la BD
      invalidates.forEach(key => {
        queryClient.invalidateQueries({ queryKey: [key] });
      });
    }
  });
};

export default useSupabaseMutation;