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
  const { estado, tecnico, prioridad, q } = filtros;
  return useQuery({
    queryKey: ['pv_tickets', estado || '', tecnico || '', prioridad || '', q || ''],
    queryFn: async () => {
      let query = supabase.from('tms_postventa_tickets').select('*')
        .order('created_at', { ascending: false }).limit(500);
      if (estado) query = query.eq('estado', estado);
      if (tecnico) query = query.eq('tecnico_asignado', tecnico);
      if (prioridad) query = query.eq('prioridad', prioridad);
      if (q && q.trim()) {
        const s = q.trim();
        query = query.or(`numero.ilike.%${s}%,cliente.ilike.%${s}%,equipo_modelo.ilike.%${s}%,numero_serie.ilike.%${s}%`);
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
