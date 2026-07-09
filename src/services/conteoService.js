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
