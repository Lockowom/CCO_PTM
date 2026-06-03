import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';

// ── Catálogos (estados, dictámenes, bodegas destino) ──────────────────────
export const DICTAMENES = [
  { id: 'LIBERAR',    label: 'Liberar',     estado: 'LIBERADO',     mueve: false },
  { id: 'CUARENTENA', label: 'Cuarentena',  estado: 'CUARENTENA',   mueve: true  },
  { id: 'REPROCESO',  label: 'Reproceso',   estado: 'EN_AUDITORIA', mueve: true  },
  { id: 'RECHAZAR',   label: 'Rechazar',    estado: 'MALO',         mueve: true  },
  { id: 'BAJA',       label: 'Baja',        estado: 'MALO',         mueve: true  },
];

// Bodegas destino para movimiento a transitoria (códigos del sistema).
export const BODEGAS_DESTINO = [
  { id: '5',  label: 'BD 5 — Servicio Técnico' },
  { id: '99', label: 'BD 99 — Basura / Baja definitiva' },
];

export const CONDICIONES = ['OK', 'Próximo a vencer', 'Vencido', 'Daño de empaque', 'Daño de producto', 'Faltante', 'Sobrante', 'Sin rotación'];
export const MOTIVOS = ['Rutina', 'Vencimiento', 'Reclamo', 'Devolución', 'Hallazgo', 'Auditoría'];

// Metadatos visuales del estado de calidad (para badges en todo el sistema).
export const FLAG_META = {
  EN_AUDITORIA: { label: 'En Auditoría', cls: 'bg-amber-100 text-amber-700 border-amber-200' },
  CUARENTENA:   { label: 'Cuarentena',   cls: 'bg-orange-100 text-orange-700 border-orange-200' },
  MALO:         { label: 'Malo',         cls: 'bg-rose-100 text-rose-700 border-rose-200' },
  LIBERADO:     { label: 'Liberado',     cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
};

// ── Lectura de informes ───────────────────────────────────────────────────
export function useInformes() {
  return useQuery({
    queryKey: ['monitoreo_informes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tms_monitoreo_informes')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
}

export function useInformeItems(informeId) {
  return useQuery({
    queryKey: ['monitoreo_items', informeId],
    enabled: !!informeId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tms_monitoreo_items')
        .select('*')
        .eq('informe_id', informeId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });
}

// ── Candidatos a monitoreo (stock actual + ubicación + semáforo) ───────────
export async function fetchCandidatos(query, soloVencimiento = false) {
  const { data, error } = await supabase.rpc('monitoreo_candidatos', {
    p_query: query || '',
    p_solo_vencimiento: soloVencimiento,
  });
  if (error) throw error;
  return data || [];
}

// ── Crear informe + ítems ──────────────────────────────────────────────────
export function useCrearInforme() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ cabecera, items }) => {
      const { data: numero, error: numErr } = await supabase.rpc('monitoreo_next_numero');
      if (numErr) throw numErr;

      const { data: informe, error: infErr } = await supabase
        .from('tms_monitoreo_informes')
        .insert({ ...cabecera, numero, total_items: items.length })
        .select()
        .single();
      if (infErr) throw infErr;

      if (items.length > 0) {
        const rows = items.map((it) => ({ ...it, informe_id: informe.id }));
        const { error: itErr } = await supabase.from('tms_monitoreo_items').insert(rows);
        if (itErr) throw itErr;
      }
      return informe;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['monitoreo_informes'] }),
  });
}

// ── Cambiar estado de un informe (ej. enviar a Calidad) ────────────────────
export function useActualizarEstadoInforme() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ informeId, estado }) => {
      const { error } = await supabase
        .from('tms_monitoreo_informes')
        .update({ estado })
        .eq('id', informeId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['monitoreo_informes'] }),
  });
}

// ── Dictamen de Calidad (RPC: persiste dictamen + flag + notificación) ─────
export function useDictaminar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ itemId, dictamen, bodegaDestino, accion, fechaLimite, acuse }) => {
      const { data, error } = await supabase.rpc('monitoreo_dictaminar', {
        p_item_id: itemId,
        p_dictamen: dictamen,
        p_bodega_destino: bodegaDestino || null,
        p_accion: accion || null,
        p_fecha_limite: fechaLimite || null,
        p_acuse: acuse || null,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['monitoreo_items'] });
      qc.invalidateQueries({ queryKey: ['calidad_flags'] });
      void vars;
    },
  });
}
