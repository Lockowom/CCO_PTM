import { supabase } from '../../../supabase';

async function rpc(name, params = {}) {
  const { data, error } = await supabase.rpc(name, params);
  if (error) throw error;
  return data;
}

export const routeCoordinationService = {
  dashboard: () => rpc('coord_rutas_tablero'),
  analytics: (desde = null, hasta = null) =>
    rpc('coord_rutas_analitica', { p_desde: desde || null, p_hasta: hasta || null }),
  importFreights: (rows) => rpc('coord_rutas_importar_fletes', { p_rows: rows }),
  createPickup: (form) => rpc('coord_rutas_crear_retiro', { p_data: form }),
  createPlan: ({ fecha, vuelta, transportistaId, notas }) =>
    rpc('coord_rutas_crear_plan', {
      p_fecha: fecha,
      p_vuelta: Number(vuelta),
      p_transportista_id: Number(transportistaId),
      p_notas: notas || null
    }),
  addStop: (planId, type, sourceId) =>
    rpc('coord_rutas_asignar_parada', {
      p_plan_id: planId,
      p_tipo: type,
      p_origen_id: String(sourceId)
    }),
  removeStop: (stopId) => rpc('coord_rutas_quitar_parada', { p_parada_id: stopId }),
  reorder: (planId, stopIds) =>
    rpc('coord_rutas_reordenar', { p_plan_id: planId, p_paradas: stopIds }),
  changePlanStatus: (planId, status) =>
    rpc('coord_rutas_cambiar_estado_plan', { p_plan_id: planId, p_estado: status }),
  subscribe(onChange) {
    let timer;
    const channel = supabase
      .channel(`coord-rutas-${crypto.randomUUID()}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tms_operaciones' },
        (payload) => {
          if (payload.new?.estado === 'Shipping' || payload.old?.estado === 'Shipping') {
            clearTimeout(timer);
            timer = setTimeout(onChange, 350);
          }
        }
      );
    ['coord_rutas_retiros', 'coord_rutas_planes', 'coord_rutas_paradas'].forEach((table) => {
      channel.on('postgres_changes', { event: '*', schema: 'public', table }, () => {
        clearTimeout(timer);
        timer = setTimeout(onChange, 350);
      });
    });
    channel.subscribe();
    return () => {
      clearTimeout(timer);
      supabase.removeChannel(channel);
    };
  }
};
