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
  costCatalog: () => rpc('coord_rutas_catalogo_costos'),
  capacityCatalog: () => rpc('coord_rutas_capacidad_catalogo'),
  saveRate: (rate) => rpc('coord_rutas_guardar_tarifa', { p_data: rate }),
  saveFleet: (vehicle) => rpc('coord_rutas_guardar_flota', { p_data: vehicle }),
  saveCubicage: (operacionId, groups, totalWeightKg) =>
    rpc('coord_rutas_guardar_cubicaje', {
      p_operacion_id: Number(operacionId),
      p_grupos: groups,
      p_peso_total_kg: totalWeightKg === '' ? null : Number(totalWeightKg)
    }),
  evaluateAlternatives: (payload) => rpc('coord_rutas_evaluar_alternativas', { p_data: payload }),
  calculateCost: (payload) => rpc('coord_rutas_calcular_costo', { p_data: payload }),
  configuration: () => rpc('coord_rutas_origen'),
  saveConfiguration: (payload) => rpc('coord_rutas_guardar_origen', { p_data: payload }),
  async planRoute(origin, stops, returnToOrigin = true) {
    const { data, error } = await supabase.functions.invoke('coord-route-plan', {
      body: { origin, stops, return: returnToOrigin, optimize: true }
    });
    if (error) throw error;
    if (data?.error) throw new Error(data.error);
    return data;
  },
  async calculateDistance(origen, destino) {
    const { data, error } = await supabase.functions.invoke('coord-route-distance', {
      body: { origen, destino }
    });
    if (error) throw error;
    if (data?.error) throw new Error(data.error);
    return data;
  },
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
  confirmPlan: (planId, expectedVersion, idempotencyKey = crypto.randomUUID()) =>
    rpc('coord_rutas_confirmar_plan', {
      p_plan_id: planId,
      p_expected_version: Number(expectedVersion),
      p_idempotency_key: `cco:route:confirm:${planId}:${idempotencyKey}`
    }),
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
    [
      'coord_rutas_retiros',
      'coord_rutas_planes',
      'coord_rutas_paradas',
      'tms_operacion_bultos',
      'tms_vehiculos',
      'coord_rutas_decisiones_flota'
    ].forEach((table) => {
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
