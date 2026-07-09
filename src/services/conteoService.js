import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
// Reusa el buscador de lotes/series del stock de CCO (RPC calidad_lotes_series):
// devuelve filas { tipo:'P'|'S', valor, disponible, ubicacion } para un SKU.
export { fetchLotesSeries } from './calidadService';

// ── Metadatos de estado (para chips/toasts) ───────────────────────────────
export const ESTADO_CONTEO_META = {
  CUADRADO:  { label: 'Cuadrado', emoji: '✅', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200', pda: 'text-emerald-400' },
  FALTA:     { label: 'Falta',    emoji: '❌', cls: 'bg-rose-100 text-rose-700 border-rose-200',        pda: 'text-rose-400' },
  SOBRA:     { label: 'Sobra',    emoji: '⚠️', cls: 'bg-amber-100 text-amber-700 border-amber-200',      pda: 'text-amber-400' },
  SIN_STOCK: { label: 'Sin stock',emoji: '🚫', cls: 'bg-slate-200 text-slate-600 border-slate-300',      pda: 'text-slate-400' },
};
export const estadoConteoMeta = (e) => ESTADO_CONTEO_META[e] || ESTADO_CONTEO_META.SIN_STOCK;

// Stock del sistema en vivo (prioridad serie > partida > total del SKU).
export async function conteoStockSistema(codigo, partida = '', serie = '') {
  const { data, error } = await supabase.rpc('conteo_stock_sistema', {
    p_codigo: codigo, p_partida: partida || '', p_serie: serie || '',
  });
  if (error) throw error;
  return Number(data) || 0;
}

// ── Sesiones de conteo ─────────────────────────────────────────────────────
export function useSesionesConteo() {
  return useQuery({
    queryKey: ['conteo_sesiones'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tms_conteo_sesiones')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      // Abiertas primero.
      return (data || []).sort((a, b) => (a.estado === 'abierta' ? 0 : 1) - (b.estado === 'abierta' ? 0 : 1));
    },
    staleTime: 15_000,
  });
}

export function useCrearSesion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ nombre, descripcion, tipo, semana }) => {
      const { data, error } = await supabase.rpc('crear_conteo_sesion', {
        p_nombre: nombre, p_descripcion: descripcion || null,
        p_tipo: tipo || 'ciclico', p_semana: semana ?? null,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['conteo_sesiones'] }),
  });
}

export function useCerrarSesion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reabrir = false }) => {
      const { data, error } = await supabase.rpc('cerrar_conteo_sesion', { p_id: id, p_reabrir: reabrir });
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['conteo_sesiones'] }),
  });
}

// ── Conteos (registros) ─────────────────────────────────────────────────────
export function useConteos(sesionId, limit = 60) {
  return useQuery({
    queryKey: ['conteos', sesionId || 'sin_sesion'],
    queryFn: async () => {
      let q = supabase.from('tms_conteos').select('*').order('created_at', { ascending: false }).limit(limit);
      q = sesionId ? q.eq('sesion_id', sesionId) : q.is('sesion_id', null);
      const { data, error } = await q;
      if (error) throw error;
      return data || [];
    },
    enabled: sesionId !== undefined,
    staleTime: 5_000,
  });
}

export function useRegistrarConteo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p) => {
      const { data, error } = await supabase.rpc('registrar_conteo', {
        p_sesion_id: p.sesionId ?? null,
        p_codigo: p.codigo,
        p_cantidad: p.cantidad,
        p_ubicacion: p.ubicacion || '',
        p_partida: p.partida || '',
        p_serie: p.serie || '',
        p_fecha_venc: p.fechaVenc || null,
        p_observaciones: p.observaciones || '',
        p_descripcion: p.descripcion || '',
        p_um: p.um || '',
        p_dispositivo: p.dispositivo || 'PDA',
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['conteos', vars.sesionId || 'sin_sesion'] });
    },
  });
}

export function useEditarConteo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p) => {
      const { data, error } = await supabase.rpc('editar_conteo', {
        p_id: p.id,
        p_cantidad: p.cantidad ?? null,
        p_ubicacion: p.ubicacion ?? null,
        p_partida: p.partida ?? null,
        p_serie: p.serie ?? null,
        p_fecha_venc: p.fechaVenc ?? null,
        p_observaciones: p.observaciones ?? null,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['conteos'] }),
  });
}

export function useEliminarConteo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }) => {
      const { error } = await supabase.rpc('eliminar_conteo', { p_id: id });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['conteos'] }),
  });
}

// ── Reportes ────────────────────────────────────────────────────────────────
export function useConciliacion(sesionId) {
  return useQuery({
    queryKey: ['conteo_conciliacion', sesionId || 'todas'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('conteo_conciliacion', { p_sesion_id: sesionId || null });
      if (error) throw error;
      return data || [];
    },
    staleTime: 10_000,
  });
}

export function useAjusteErp(sesionId) {
  return useQuery({
    queryKey: ['conteo_ajuste', sesionId || 'todas'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('conteo_ajuste_erp', { p_sesion_id: sesionId || null });
      if (error) throw error;
      return data || [];
    },
    staleTime: 10_000,
  });
}

// Resumen valorizado (análisis) derivado de la conciliación.
export function resumenAnalisis(conciliacion = []) {
  const total = conciliacion.length;
  const cuadrados = conciliacion.filter((r) => r.estado === 'CUADRADO').length;
  const impacto = conciliacion.reduce((a, r) => a + (Number(r.impacto) || 0), 0);
  const faltante = conciliacion.filter((r) => r.diferencia < 0).reduce((a, r) => a + (Number(r.impacto) || 0), 0);
  const sobrante = conciliacion.filter((r) => r.diferencia > 0).reduce((a, r) => a + (Number(r.impacto) || 0), 0);
  return {
    total, cuadrados,
    exactitud: total ? Math.round((cuadrados / total) * 100) : 0,
    impacto, faltante, sobrante,
  };
}

// ── Bloques + auditoría (QR) ─────────────────────────────────────────────────
export function useBloques(q = '') {
  return useQuery({
    queryKey: ['conteo_bloques', q],
    queryFn: async () => {
      let query = supabase.from('tms_conteo_bloques').select('*').order('created_at', { ascending: false }).limit(200);
      if (q) query = query.or(`codigo.ilike.%${q}%,bodega.ilike.%${q}%,nombre.ilike.%${q}%`);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    staleTime: 10_000,
  });
}

export function useBloque(codigo) {
  return useQuery({
    queryKey: ['conteo_bloque', codigo],
    queryFn: async () => {
      const { data: b, error } = await supabase.from('tms_conteo_bloques').select('*').eq('codigo', codigo).maybeSingle();
      if (error) throw error;
      if (!b) return null;
      const { data: items } = await supabase.from('tms_conteo_bloque_items').select('*').eq('bloque_id', b.id).order('created_at');
      const { data: auds } = await supabase.from('tms_conteo_auditorias').select('*').eq('bloque_id', b.id).order('created_at', { ascending: false });
      return { ...b, items: items || [], auditorias: auds || [] };
    },
    enabled: !!codigo,
    staleTime: 5_000,
  });
}

export function useCrearBloque() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ bodega, nombre, descripcion, ubicacion }) => {
      const { data, error } = await supabase.rpc('crear_conteo_bloque', {
        p_bodega: bodega, p_nombre: nombre || null, p_descripcion: descripcion || null, p_ubicacion: ubicacion || null,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['conteo_bloques'] }),
  });
}

export function useEditarBloque() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p) => {
      const { data, error } = await supabase.rpc('editar_conteo_bloque', {
        p_id: p.id, p_bodega: p.bodega ?? null, p_nombre: p.nombre ?? null,
        p_descripcion: p.descripcion ?? null, p_estado: p.estado ?? null, p_ubicacion: p.ubicacion ?? null,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (d) => { qc.invalidateQueries({ queryKey: ['conteo_bloques'] }); if (d?.codigo) qc.invalidateQueries({ queryKey: ['conteo_bloque', d.codigo] }); },
  });
}

export function useAgregarBloqueItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p) => {
      const { data, error } = await supabase.rpc('agregar_conteo_bloque_item', {
        p_bloque_id: p.bloqueId, p_codigo: p.codigo, p_cantidad: p.cantidad,
        p_descripcion: p.descripcion || '', p_um: p.um || '', p_partida: p.partida || '',
        p_serie: p.serie || '', p_fecha_venc: p.fechaVenc || null, p_observaciones: p.observaciones || '',
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (_d, v) => v.codigoBloque && qc.invalidateQueries({ queryKey: ['conteo_bloque', v.codigoBloque] }),
  });
}

export function useEliminarBloqueItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }) => { const { error } = await supabase.rpc('eliminar_conteo_bloque_item', { p_id: id }); if (error) throw error; },
    onSuccess: (_d, v) => v.codigoBloque && qc.invalidateQueries({ queryKey: ['conteo_bloque', v.codigoBloque] }),
  });
}

export function useRegistrarAuditoria() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ bloqueId, items, observaciones }) => {
      const { data, error } = await supabase.rpc('registrar_conteo_auditoria', {
        p_bloque_id: bloqueId, p_items: items, p_observaciones: observaciones || '',
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (_d, v) => v.codigoBloque && qc.invalidateQueries({ queryKey: ['conteo_bloque', v.codigoBloque] }),
  });
}

// ── Proyecciones (palletizado) ──────────────────────────────────────────────
export function useProyecciones() {
  return useQuery({
    queryKey: ['conteo_proyecciones'],
    queryFn: async () => {
      const { data, error } = await supabase.from('tms_conteo_proyecciones').select('*').order('created_at', { ascending: false }).limit(200);
      if (error) throw error;
      return data || [];
    },
    staleTime: 10_000,
  });
}

export function useGuardarProyeccion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p) => {
      const { data, error } = await supabase.rpc('guardar_conteo_proyeccion', {
        p_id: p.id || null, p_prod: p.prod || '', p_cant_oc: p.cantOc || 0, p_cant_bx: p.cantBx || 0,
        p_cant_x_bx: p.cantXBx || 0, p_pie: p.pie || 0, p_altura: p.altura || 0,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['conteo_proyecciones'] }),
  });
}

export function useEliminarProyeccion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }) => { const { error } = await supabase.rpc('eliminar_conteo_proyeccion', { p_id: id }); if (error) throw error; },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['conteo_proyecciones'] }),
  });
}

export function useGuardarCosto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ codigo, costo }) => {
      const { data, error } = await supabase.rpc('guardar_conteo_costo', { p_codigo: codigo, p_costo: costo });
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['conteo_conciliacion'] }); qc.invalidateQueries({ queryKey: ['conteo_ajuste'] }); },
  });
}
