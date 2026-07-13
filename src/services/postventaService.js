import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';

// ============================================================================
// Catálogos (port de lockowom/post-venta — la app Flask los tenía hardcodeados).
// Los técnicos NO viven aquí: son la tabla editable tms_postventa_tecnicos.
// ============================================================================
export const PV_REGIONES = [
  'Arica y Parinacota', 'Tarapacá', 'Antofagasta', 'Atacama', 'Coquimbo',
  'Valparaíso', 'Metropolitana de Santiago', "Libertador General Bernardo O'Higgins",
  'Maule', 'Ñuble', 'Biobío', 'La Araucanía', 'Los Ríos', 'Los Lagos',
  'Aysén', 'Magallanes y de la Antártica Chilena',
];

export const PV_TIPOS_SOLICITUD = [
  'Instalación', 'Capacitación', 'Mantención Preventiva', 'Mantención Correctiva',
  'Falla Técnica', 'Visita Técnica', 'Puesta en Marcha', 'Gestión de Garantía',
  'Venta Servicios', 'Diagnósticos', 'Otro',
];

export const PV_PRIORIDADES = ['Alta', 'Media', 'Baja'];

export const PV_ESTADOS = [
  'Abierto', 'En Proceso', 'En Evaluación', 'Programada',
  'Pendiente Cliente', 'Cerrado', 'Cancelado',
];

// Estados que cuentan como "activos" (ticket abierto/en curso).
export const PV_ESTADOS_ACTIVOS = ['Abierto', 'En Proceso', 'En Evaluación', 'Programada', 'Pendiente Cliente'];

// Flujo canónico para el botón "Siguiente". Cancelado queda fuera (terminal aparte).
export const PV_FLUJO = ['Abierto', 'En Proceso', 'En Evaluación', 'Programada', 'Pendiente Cliente', 'Cerrado'];
export const pvSiguienteEstado = (estado) => {
  const i = PV_FLUJO.indexOf(estado);
  return i >= 0 && i < PV_FLUJO.length - 1 ? PV_FLUJO[i + 1] : null;
};

export const PV_EQUIPOS = [
  'ADE', 'GIVAS', 'SAIKANG', 'CARDIOMAX', 'FH', 'YUWELL', 'WELCH "BAXTER"', 'BCF',
];

export const PV_COTIZAR = ['No', 'Sí'];

export const PV_RESULTADOS = [
  'Resuelto', 'Parcialmente Resuelto', 'No Resuelto', 'Derivado', 'Cancelado',
];

export const PV_CAMPOS_OBLIGATORIOS = ['cliente', 'region', 'equipo_modelo', 'tipo_solicitud', 'prioridad', 'descripcion'];

// ── Metadatos de estado / prioridad (chips) ─────────────────────────────────
export const PV_ESTADO_META = {
  'Abierto':           'bg-sky-100 text-sky-700 border-sky-200',
  'En Proceso':        'bg-indigo-100 text-indigo-700 border-indigo-200',
  'En Evaluación':     'bg-violet-100 text-violet-700 border-violet-200',
  'Programada':        'bg-cyan-100 text-cyan-700 border-cyan-200',
  'Pendiente Cliente': 'bg-amber-100 text-amber-700 border-amber-200',
  'Cerrado':           'bg-emerald-100 text-emerald-700 border-emerald-200',
  'Cancelado':         'bg-slate-200 text-slate-500 border-slate-300',
};
export const pvEstadoCls = (e) => PV_ESTADO_META[e] || 'bg-slate-100 text-slate-600 border-slate-200';

// Chips por TIPO de solicitud (distingue visualmente cada serie de tickets).
export const PV_TIPO_META = {
  'Instalación':           'bg-sky-100 text-sky-700 border-sky-200',
  'Capacitación':          'bg-violet-100 text-violet-700 border-violet-200',
  'Mantención Preventiva': 'bg-teal-100 text-teal-700 border-teal-200',
  'Mantención Correctiva': 'bg-amber-100 text-amber-700 border-amber-200',
  'Falla Técnica':         'bg-rose-100 text-rose-700 border-rose-200',
  'Visita Técnica':        'bg-indigo-100 text-indigo-700 border-indigo-200',
  'Puesta en Marcha':      'bg-cyan-100 text-cyan-700 border-cyan-200',
  'Gestión de Garantía':   'bg-purple-100 text-purple-700 border-purple-200',
  'Venta Servicios':       'bg-emerald-100 text-emerald-700 border-emerald-200',
  'Diagnósticos':          'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200',
  'Otro':                  'bg-slate-100 text-slate-600 border-slate-200',
};
export const pvTipoCls = (t) => PV_TIPO_META[t] || PV_TIPO_META['Otro'];
// Color del chip del FOLIO: la serie CAL- (casos de Calidad) usa verde esmeralda;
// el resto hereda el color de su tipo de solicitud.
export const pvFolioCls = (t) => (t?.folio_tipo || '').startsWith('CAL-')
  ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
  : pvTipoCls(t?.tipo_solicitud);

export const PV_PRIORIDAD_META = {
  'Alta':  'bg-rose-100 text-rose-700 border-rose-200',
  'Media': 'bg-amber-100 text-amber-700 border-amber-200',
  'Baja':  'bg-slate-100 text-slate-600 border-slate-200',
};
export const pvPrioridadCls = (p) => PV_PRIORIDAD_META[p] || 'bg-slate-100 text-slate-600 border-slate-200';

// ============================================================================
// Técnicos (catálogo editable, tabla tms_postventa_tecnicos)
// ============================================================================
export function useTecnicos(soloActivos = false) {
  return useQuery({
    queryKey: ['pv_tecnicos', soloActivos ? 'activos' : 'todos'],
    queryFn: async () => {
      let q = supabase.from('tms_postventa_tecnicos').select('*').order('orden').order('nombre');
      if (soloActivos) q = q.eq('activo', true);
      const { data, error } = await q;
      if (error) throw error;
      return data || [];
    },
    staleTime: 60_000,
  });
}

export function useGuardarTecnico() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, nombre, activo = true, orden = 0 }) => {
      const { data, error } = await supabase.rpc('guardar_pv_tecnico', {
        p_id: id || null, p_nombre: nombre, p_activo: activo, p_orden: orden,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pv_tecnicos'] }),
  });
}

export function useEliminarTecnico() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }) => {
      const { error } = await supabase.rpc('eliminar_pv_tecnico', { p_id: id });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pv_tecnicos'] }),
  });
}

// ============================================================================
// Tickets
// ============================================================================
export function useTickets(filtros = {}) {
  const { estado, tecnico, prioridad, tipo, origen, q } = filtros;
  return useQuery({
    queryKey: ['pv_tickets', estado || '', tecnico || '', prioridad || '', tipo || '', origen || '', q || ''],
    queryFn: async () => {
      let query = supabase.from('tms_postventa_tickets').select('*')
        .order('created_at', { ascending: false }).limit(2000);
      if (estado) query = query.eq('estado', estado);
      if (tecnico) query = query.eq('tecnico_asignado', tecnico);
      if (prioridad) query = query.eq('prioridad', prioridad);
      if (tipo) query = query.eq('tipo_solicitud', tipo);
      if (origen) query = query.eq('origen', origen);
      if (q && q.trim()) {
        // PostgREST: dentro de or() la coma y los paréntesis son sintaxis; se
        // citan los patrones ("%...%") y se escapan comillas/backslashes para
        // que una búsqueda como «Hospital San Juan, Talca» no rompa la query.
        const pat = `"%${q.trim().replace(/\\/g, '\\\\').replace(/"/g, '\\"')}%"`;
        const cols = ['numero', 'folio_tipo', 'cliente', 'equipo_modelo', 'numero_serie', 'contacto', 'descripcion'];
        query = query.or(cols.map((c) => `${c}.ilike.${pat}`).join(','));
      }
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    staleTime: 8_000,
  });
}

export function useCrearTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p) => {
      const { data, error } = await supabase.rpc('crear_pv_ticket', {
        p_cliente: p.cliente, p_region: p.region, p_comuna: p.comuna || null, p_equipo_modelo: p.equipo_modelo,
        p_tipo_solicitud: p.tipo_solicitud, p_prioridad: p.prioridad, p_descripcion: p.descripcion,
        p_contacto: p.contacto || '', p_numero_serie: p.numero_serie || '',
        p_tecnico: p.tecnico_asignado || 'Sin Asignar', p_estado: p.estado || 'Abierto',
        p_cotizar: p.cotizar || 'No', p_observaciones: p.observaciones || '',
        p_origen: 'Manual', p_id_correo: null,
        p_fecha_programada: p.fecha_programada || null, p_hora_programada: p.hora_programada || null,
        p_nv: p.nv || null, p_vendedor: p.vendedor || null, p_nv_info: p.nv_info || null,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pv_tickets'] });
      qc.invalidateQueries({ queryKey: ['pv_dashboard'] });
    },
  });
}

export function useActualizarTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ numero, campos }) => {
      const { data, error } = await supabase.rpc('actualizar_pv_ticket', { p_numero: numero, p_campos: campos });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pv_tickets'] });
      qc.invalidateQueries({ queryKey: ['pv_dashboard'] });
    },
  });
}

// Eliminar un caso completo (descarta sus correos → no reingresan).
export function useEliminarTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ numero, descartar = true }) => {
      const { error } = await supabase.rpc('eliminar_pv_ticket', { p_numero: numero, p_descartar: descartar });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pv_tickets'] });
      qc.invalidateQueries({ queryKey: ['pv_dashboard'] });
    },
  });
}

// Eliminar un correo puntual del hilo (lo descarta → no reingresa).
export function useEliminarCorreo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ idCorreo, descartar = true }) => {
      const { error } = await supabase.rpc('eliminar_pv_correo', { p_id_correo: idCorreo, p_descartar: descartar });
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['pv_correos'] });
      qc.invalidateQueries({ queryKey: ['pv_tickets'] });
      // Si era el último correo del caso, el RPC borra el ticket completo:
      // los KPI del dashboard también cambian.
      qc.invalidateQueries({ queryKey: ['pv_dashboard'] });
    },
  });
}

// Reasociar un correo al ticket CORRECTO (mueve ticket_id/conversation_id).
export function useReasociarCorreo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ idCorreo, numeroDestino }) => {
      const { data, error } = await supabase.rpc('reasociar_pv_correo', {
        p_id_correo: idCorreo, p_numero_destino: numeroDestino,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pv_correos'] });
      qc.invalidateQueries({ queryKey: ['pv_tickets'] });
      qc.invalidateQueries({ queryKey: ['pv_dashboard'] });
    },
  });
}

// ── Flujo de estados + trazabilidad ─────────────────────────────────────────
export function useAvanzarTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ numero, nota }) => {
      const { data, error } = await supabase.rpc('avanzar_pv_ticket', { p_numero: numero, p_nota: nota || null });
      if (error) throw error;
      return data;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['pv_tickets'] });
      qc.invalidateQueries({ queryKey: ['pv_dashboard'] });
      qc.invalidateQueries({ queryKey: ['pv_historial', vars?.numero] });
    },
  });
}
export function useCerrarTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ numero, resultado, nota }) => {
      const { data, error } = await supabase.rpc('cerrar_pv_ticket', {
        p_numero: numero, p_resultado: resultado || 'Resuelto', p_nota: nota || null,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['pv_tickets'] });
      qc.invalidateQueries({ queryKey: ['pv_dashboard'] });
      qc.invalidateQueries({ queryKey: ['pv_historial', vars?.numero] });
    },
  });
}
export function usePvHistorial(numero) {
  return useQuery({
    queryKey: ['pv_historial', numero],
    enabled: !!numero,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('pv_historial', { p_numero: numero });
      if (error) throw error;
      return data || [];
    },
  });
}

// ============================================================================
// Correos (hilo de conversación de un ticket) + interno/externo
// ============================================================================
// Dominios considerados "internos" (PTM). Ajustar si cambian.
export const DOMINIOS_INTERNOS = ['ptm.cl'];
export function esCorreoInterno(email) {
  const dom = String(email || '').split('@')[1]?.toLowerCase().trim();
  return dom ? DOMINIOS_INTERNOS.includes(dom) : false;
}

export function useCorreosTicket(numero) {
  return useQuery({
    queryKey: ['pv_correos', numero || ''],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('pv_correos_ticket', { p_numero: numero });
      if (error) throw error;
      return data || [];
    },
    enabled: !!numero,
    staleTime: 30_000,
  });
}

// ============================================================================
// Informe de Calidad adjunto a un ticket (visor para Servicio Técnico)
// ============================================================================
export function useInformeCalidadTicket(numero, enabled = true) {
  return useQuery({
    queryKey: ['pv_informe_calidad', numero || ''],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('pv_informe_calidad', { p_numero: numero });
      if (error) throw error;
      return data; // { informe, item, evidencias, accion } o null
    },
    enabled: !!numero && enabled,
    staleTime: 60_000,
  });
}

// ============================================================================
// Familias de equipos (del stock de CCO: primeros 3 chars del código de producto)
// ============================================================================
export function useFamiliasStock() {
  return useQuery({
    queryKey: ['pv_familias_stock'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('pv_familias_stock');
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60_000,
  });
}

// ============================================================================
// Dashboard
// ============================================================================
export function usePvDashboard() {
  return useQuery({
    queryKey: ['pv_dashboard'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('pv_dashboard');
      if (error) throw error;
      return data || {};
    },
    staleTime: 15_000,
  });
}
