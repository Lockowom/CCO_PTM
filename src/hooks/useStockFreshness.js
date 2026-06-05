import { useQuery } from '@tanstack/react-query';
import { supabase } from '../supabase';

// Tabs de Lotes y Series → tabla real
export const STOCK_TABLES = {
  partidas: 'tms_partidas',
  series: 'tms_series',
  farmapack: 'tms_farmapack',
  pesos: 'tms_pesos',
};

// Tablas sujetas a la regla de vigencia de 24 hrs (ciclo 06:00 → 06:00)
export const TABLES_24H = ['tms_partidas', 'tms_series', 'tms_farmapack'];

// Inicio del ciclo de stock: 06:00 del día actual si ya pasó, si no el de ayer.
// El corte se fija ANTES de la ventana de carga matutina real (~08:11–08:20) para
// que una carga de la mañana cuente para el día en curso y no se marque desactualizada.
export const RESET_HOUR = 6;
export const RESET_MIN = 0;

// Etiqueta "HH:MM" derivada de las constantes, para la copia visible (evita desajustes).
export const RESET_LABEL = `${String(RESET_HOUR).padStart(2, '0')}:${String(RESET_MIN).padStart(2, '0')}`;

export function getCycleStart(now = new Date()) {
  const c = new Date(now);
  c.setHours(RESET_HOUR, RESET_MIN, 0, 0);
  if (now < c) c.setDate(c.getDate() - 1);
  return c;
}

// Última carga (fecha + usuario) por cada tabla de stock, desde tms_historial_cargas.
export function useStockFreshness() {
  return useQuery({
    queryKey: ['stock_freshness'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tms_historial_cargas')
        .select('tabla_destino, usuario_nombre, fecha_carga')
        .in('tabla_destino', Object.values(STOCK_TABLES))
        .order('fecha_carga', { ascending: false })
        .limit(80);
      if (error) throw error;
      const latest = {};
      (data || []).forEach((r) => {
        if (r.tabla_destino && !latest[r.tabla_destino]) latest[r.tabla_destino] = r;
      });
      return latest;
    },
    // Se re-evalúa cada minuto para detectar el cruce de las 06:00 sin recargar.
    refetchInterval: 60000,
    staleTime: 30000,
  });
}
