import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/supabase';

/**
 * Hook genérico para consultar tablas de Supabase con React Query
 * 
 * @param {string} tableName - Nombre de la tabla en Supabase
 * @param {Object} options - Opciones de consulta
 * @param {string} options.select - Columnas a seleccionar (default: '*')
 * @param {Object} options.filters - Objeto con filtros (ej: { estado: 'PENDIENTE', id: 1 })
 * @param {string} options.orderBy - Columna para ordenar
 * @param {boolean} options.orderAsc - Dirección del orden (default: false / descendente)
 * @param {number} options.limit - Límite de resultados
 * @param {Array} options.queryKey - Claves adicionales para el caché de React Query
 * @param {boolean} options.enabled - Si la consulta debe ejecutarse (default: true)
 * @returns {Object} { data, isLoading, error, refetch }
 */
export const useSupabaseTable = (tableName, options = {}) => {
  const {
    select = '*',
    filters = {},
    orderBy,
    orderAsc = false,
    limit,
    queryKey = [],
    enabled = true,
  } = options;

  return useQuery({
    queryKey: [tableName, ...queryKey, filters, orderBy, orderAsc, limit],
    queryFn: async () => {
      let query = supabase.from(tableName).select(select);

      // Aplicar filtros dinámicamente
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          query = query.eq(key, value);
        }
      });

      // Ordenamiento
      if (orderBy) {
        query = query.order(orderBy, { ascending: orderAsc });
      }

      // Límite
      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    },
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutos de caché por defecto
  });
};

export default useSupabaseTable;