import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { compressImage } from '../lib/imageCompress';

export const DEVOLUCIONES_EVIDENCIAS_BUCKET = 'devoluciones-evidencias';
const MAX_EVIDENCE_BYTES = 10 * 1024 * 1024;
const ALLOWED_EVIDENCE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif'
]);

const extensionForMime = (mime) =>
  ({
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/heic': 'heic',
    'image/heif': 'heif'
  })[mime] || 'jpg';

const randomId = () =>
  globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;

export const DEVOLUCION_ESTADOS = [
  'RECIBIDA',
  'EN_INSPECCION',
  'CONFORME',
  'NO_CONFORME',
  'DERIVADA_POSTVENTA',
  'CERRADA'
];

export const estadoDevolucionLabel = (estado) =>
  ({
    RECIBIDA: 'Recibida',
    EN_INSPECCION: 'En inspección',
    CONFORME: 'Conforme',
    NO_CONFORME: 'No conforme',
    DERIVADA_POSTVENTA: 'Derivada a Post-Venta',
    CERRADA: 'Cerrada'
  })[estado] || estado;

export const folioDevolucion = (row) => {
  const year = new Date(row?.recibido_en || row?.created_at || Date.now()).getFullYear();
  return `DEV-${year}-${String(row?.folio || 0).padStart(6, '0')}`;
};

export function useDevoluciones({ estado = '', q = '' } = {}) {
  return useQuery({
    queryKey: ['devoluciones', estado, q],
    queryFn: async () => {
      let query = supabase
        .from('tms_devoluciones')
        .select('*, items:tms_devolucion_items(*)')
        .order('recibido_en', { ascending: false })
        .limit(300);
      if (estado) query = query.eq('estado', estado);
      if (q.trim()) {
        const safe = q.trim().replace(/[%_,()]/g, ' ');
        query = query.or(
          `cliente.ilike.%${safe}%,nv.ilike.%${safe}%,guia.ilike.%${safe}%,factura.ilike.%${safe}%`
        );
      }
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    staleTime: 10_000
  });
}

export function useClientesConsignacion() {
  return useQuery({
    queryKey: ['clientes_consignacion'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tms_clientes_consignacion')
        .select('*')
        .eq('activo', true)
        .order('nombre')
        .limit(2000);
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60_000
  });
}

export async function buscarReferenciaDevolucion(term) {
  const { data, error } = await supabase.rpc('buscar_referencia_devolucion', { p_q: term });
  if (error) throw error;
  return data || [];
}

export async function uploadEvidenciaDevolucion({ devolucionId, itemId = null, file }) {
  const blob = await compressImage(file);
  const mime = blob?.type || file?.type || 'image/jpeg';
  if (!ALLOWED_EVIDENCE_TYPES.has(mime)) {
    throw new Error('La evidencia debe ser una imagen JPG, PNG, WebP, HEIC o HEIF');
  }
  if (!blob?.size || blob.size > MAX_EVIDENCE_BYTES) {
    throw new Error('La evidencia supera el máximo de 10 MB');
  }

  const path = `${devolucionId}/${itemId || 'general'}/${randomId()}.${extensionForMime(mime)}`;
  const { error: uploadError } = await supabase.storage
    .from(DEVOLUCIONES_EVIDENCIAS_BUCKET)
    .upload(path, blob, { contentType: mime, upsert: false });
  if (uploadError) throw uploadError;

  const { data, error } = await supabase.rpc('registrar_evidencia_devolucion', {
    p_devolucion_id: devolucionId,
    p_item_id: itemId,
    p_storage_path: path,
    p_mime_type: mime,
    p_size_bytes: blob.size,
    p_sha256: null
  });
  if (error) {
    await supabase.storage.from(DEVOLUCIONES_EVIDENCIAS_BUCKET).remove([path]);
    throw error;
  }
  return data;
}

export function useRegistrarDevolucion() {
  const qc = useQueryClient();
  return useMutation({
    retry: false,
    mutationFn: async (payload) => {
      const { data, error } = await supabase.rpc('registrar_devolucion', {
        p_payload: payload
      });
      if (error) throw error;
      return data;
    },
    onSettled: () =>
      Promise.all([
        qc.invalidateQueries({ queryKey: ['devoluciones'] }),
        qc.invalidateQueries({ queryKey: ['devoluciones_pendientes_calidad'] })
      ])
  });
}

export function useDevolucionesPendientesCalidad({ enabled = false } = {}) {
  return useQuery({
    queryKey: ['devoluciones_pendientes_calidad'],
    enabled,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('listar_devoluciones_pendientes_calidad', {
        p_limit: 100
      });
      if (error) throw error;
      return data || [];
    },
    staleTime: 0,
    retry: false
  });
}

// R5 only exposes CONFORME. The server remains the authorization authority.
export function useDictaminarItemConforme() {
  const qc = useQueryClient();
  return useMutation({
    retry: false,
    mutationFn: async ({ itemId, detalle }) => {
      const limpio = String(detalle || '')
        .trim()
        .replace(/\s+/g, ' ');
      if (!itemId || limpio.length < 3) throw new Error('Describe el dictamen oficial');
      const { data, error } = await supabase.rpc('dictaminar_item_devolucion', {
        p_item_id: itemId,
        p_dictamen: 'CONFORME',
        p_detalle: limpio
      });
      if (error) throw error;
      return data;
    },
    onSettled: () =>
      Promise.all([
        qc.invalidateQueries({ queryKey: ['devoluciones'] }),
        qc.invalidateQueries({ queryKey: ['devoluciones_pendientes_calidad'] }),
        qc.invalidateQueries({ queryKey: ['devolucion_historial'] })
      ])
  });
}

export function useHistorialDevolucion(id) {
  return useQuery({
    queryKey: ['devolucion_historial', id],
    enabled: Boolean(id),
    queryFn: async () => {
      const { data, error } = await supabase.rpc('historial_devolucion', { p_id: id });
      if (error) throw error;
      return data || [];
    }
  });
}
