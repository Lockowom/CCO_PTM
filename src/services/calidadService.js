import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { withTimeout } from '../lib/supabaseQuery';

// UUID con fallback: crypto.randomUUID no existe en orígenes no seguros / WebViews
// viejos y lanzaría TypeError al construir el path de la evidencia.
const uid = () => (globalThis.crypto?.randomUUID
  ? globalThis.crypto.randomUUID()
  : `${Date.now()}-${Math.random().toString(16).slice(2)}`);

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
      const { data, error } = await withTimeout(
        supabase
          .from('tms_monitoreo_informes')
          .select('*')
          .order('created_at', { ascending: false }),
        { ms: 12000, label: 'informes de monitoreo' }
      );
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
      const { data, error } = await withTimeout(
        supabase
          .from('tms_monitoreo_items')
          .select('*')
          .eq('informe_id', informeId)
          .order('created_at', { ascending: true }),
        { ms: 12000, label: 'ítems del informe' }
      );
      if (error) throw error;
      return data || [];
    },
  });
}

// ── Candidatos a monitoreo (stock actual + ubicación + semáforo) ───────────
// Guarda de timeout (15s): evita que el spinner quede "cargando eternamente"
// si la promesa de supabase-js no se resuelve (p. ej. bloqueo de auth-lock en
// WebView o conexión colgada). Si vence, aborta la petición y lanza error.
export async function fetchCandidatos(query, soloVencimiento = false) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const { data, error } = await supabase
      .rpc('monitoreo_candidatos', {
        p_query: query || '',
        p_solo_vencimiento: soloVencimiento,
      })
      .abortSignal(controller.signal);
    if (error) throw error;
    return data || [];
  } catch (e) {
    if (e?.name === 'AbortError' || controller.signal.aborted) {
      throw new Error('La búsqueda tardó demasiado (timeout 15s). Revisa tu conexión e inténtalo de nuevo.');
    }
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

// ── Lotes y series de un producto (para elegir en la toma) ─────────────────
export async function fetchLotesSeries(codigo, query = '') {
  const { data, error } = await supabase.rpc('calidad_lotes_series', {
    p_codigo: codigo, p_query: query || '', p_limit: 300,
  });
  if (error) throw error;
  return data || [];
}

// ── Push a móvil (ADMIN) — Edge Function notify-inventario (FCM v1) ─────────
// Genérico; no bloquea el flujo si falla.
export async function pushAdminInventario({ title, body, payload }) {
  try {
    await supabase.functions.invoke('notify-inventario', {
      body: { rol: 'ADMIN', title, body, payload: payload || {} },
    });
  } catch (e) { console.error('pushAdminInventario', e); }
}

// Alerta por SKU no registrado hallado en auditoría.
export function notificarInventarioPush(alertas, informeId) {
  return pushAdminInventario({
    title: '🚨 SKU no registrado en auditoría',
    body: `${alertas} SKU no registrado(s) hallados en auditoría de Calidad. Requieren alta/ajuste por Inventario.`,
    payload: { informe_id: informeId, tipo: 'CALIDAD_NO_REGISTRADO' },
  });
}

// Aviso por dictamen que requiere movimiento (Cuarentena / Rechazar / Baja).
export function notificarDictamenPush({ codigo, ubicacion, estadoLabel, tipo }) {
  return pushAdminInventario({
    title: `⚠️ Calidad: ${estadoLabel}`,
    body: `${codigo}${ubicacion ? ` en ${ubicacion}` : ''} dictaminado como ${estadoLabel}. Requiere movimiento/gestión por Inventario.`,
    payload: { codigo_producto: codigo, ubicacion: ubicacion || '', tipo: tipo || 'CALIDAD_DICTAMEN' },
  });
}

// ── Reflejo preliminar en Ubicaciones al enviar a Calidad ──────────────────
// Genera flags EN_AUDITORIA en tms_calidad_flags para los ítems con condición
// problemática (≠ OK) y ubicación, para que se vean de inmediato en Ubicaciones.
export async function marcarPreliminarCalidad(informeId) {
  const { data, error } = await supabase.rpc('monitoreo_marcar_preliminar', { p_informe_id: informeId });
  if (error) throw error;
  return data;
}

// ── Crear informe + ítems (RPC transaccional: cabecera + número + ítems en una
//    sola transacción; el número se genera bajo lock → sin cabecera huérfana ni
//    carrera del correlativo). ────────────────────────────────────────────────
export function useCrearInforme() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ cabecera, items }) => {
      const { data, error } = await supabase.rpc('crear_informe_monitoreo', {
        p_cabecera: cabecera,
        p_items: items,
      });
      if (error) throw error;
      return data; // fila del informe (jsonb)
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

// ── Editar informe (cabecera + reemplazo de ítems) ─────────────────────────
// Usado por el informe de MONITOREO rutinario. RPC transaccional: si el INSERT
// de ítems falla, TODO revierte (incluido el DELETE) → nunca deja el informe sin
// ítems (antes eran 3 peticiones sueltas y un fallo borraba los datos). NO se usa
// para DANOS (que conserva los IDs de ítem para no romper las evidencias).
export function useActualizarInforme() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ informeId, cabecera, items }) => {
      const { data, error } = await supabase.rpc('actualizar_informe_monitoreo', {
        p_informe_id: informeId,
        p_cabecera: cabecera,
        p_items: items,
      });
      if (error) throw error;
      return data; // { id }
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['monitoreo_informes'] });
      qc.invalidateQueries({ queryKey: ['monitoreo_items', vars.informeId] });
    },
  });
}

// ── Eliminar informe (cascade borra ítems y evidencias) ────────────────────
export function useEliminarInforme() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (informeId) => {
      const { error } = await supabase
        .from('tms_monitoreo_informes')
        .delete()
        .eq('id', informeId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['monitoreo_informes'] }),
  });
}

// ── Informe de Daños / No Conformidad ──────────────────────────────────────
// Catálogos del informe de daños.
export const CLASIFICACIONES_DANO = [
  'Informe de No Conformidad / Daño en Transporte',
  'Daño en Recepción',
  'Daño en Almacenamiento',
  'Daño por Manipulación',
  'Producto Vencido / Deteriorado',
];

// Guarda (crea o actualiza) un informe de daños conservando los IDs de los
// hallazgos (ítems) existentes, para no romper las evidencias asociadas.
export function useGuardarInformeDanos() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ informeId, cabecera, reporte, hallazgos }) => {
      let id = informeId;

      if (!id) {
        const { data: numero, error: numErr } = await supabase.rpc('monitoreo_next_numero');
        if (numErr) throw numErr;
        const { data: inf, error } = await supabase
          .from('tms_monitoreo_informes')
          .insert({ ...cabecera, numero, tipo_informe: 'DANOS', reporte, total_items: hallazgos.length })
          .select()
          .single();
        if (error) throw error;
        id = inf.id;
      } else {
        const { error } = await supabase
          .from('tms_monitoreo_informes')
          .update({ ...cabecera, reporte, total_items: hallazgos.length })
          .eq('id', id);
        if (error) throw error;
      }

      // Diff de hallazgos preservando IDs.
      const { data: existentes } = await supabase
        .from('tms_monitoreo_items')
        .select('id')
        .eq('informe_id', id);
      const existIds = new Set((existentes || []).map((r) => r.id));
      const keepIds = new Set();
      const out = [];

      for (const h of hallazgos) {
        const row = {
          codigo_producto: h.codigo_producto || '',
          partida: h.partida || '',
          ubicacion: h.ubicacion || '',
          producto: h.producto || '',
          unidad_medida: h.unidad_medida || '',
          cantidad: Number(h.cantidad) || 0,
          estado_inventario: h.estado_inventario || 'Disponible',
          tipo: h.tipo || 'NO_PERECIBLE',
          semaforo: h.semaforo || 'NA',
          condicion_observada: h.condicion_observada || 'Daño de producto',
          motivo: h.motivo || 'Hallazgo',
          observaciones: h.observaciones || '',
          tipo_dano: h.tipo_dano || '',
          componente_afectado: h.componente_afectado || '',
          consecuencia: h.consecuencia || '',
        };
        if (h.id && existIds.has(h.id)) {
          const { error } = await supabase.from('tms_monitoreo_items').update(row).eq('id', h.id);
          if (error) throw error;
          keepIds.add(h.id);
          out.push({ ...h, id: h.id });
        } else {
          const { data: ins, error } = await supabase
            .from('tms_monitoreo_items')
            .insert({ ...row, informe_id: id })
            .select('id')
            .single();
          if (error) throw error;
          keepIds.add(ins.id);
          out.push({ ...h, id: ins.id });
        }
      }

      const toDelete = [...existIds].filter((x) => !keepIds.has(x));
      if (toDelete.length) {
        // Limpiar evidencias en Storage antes de borrar los ítems: el ON DELETE
        // CASCADE elimina las filas de tms_monitoreo_evidencias pero NO los
        // objetos del bucket → quedarían huérfanos (fuga de almacenamiento).
        const { data: evHuerfanas } = await supabase
          .from('tms_monitoreo_evidencias')
          .select('storage_path')
          .in('item_id', toDelete);
        const paths = (evHuerfanas || []).map((e) => e.storage_path).filter(Boolean);
        if (paths.length) {
          await supabase.storage.from(EVIDENCIAS_BUCKET).remove(paths);
        }
        const { error } = await supabase.from('tms_monitoreo_items').delete().in('id', toDelete);
        if (error) throw error;
      }

      return { id, hallazgos: out };
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['monitoreo_informes'] });
      qc.invalidateQueries({ queryKey: ['monitoreo_items', res?.id] });
    },
  });
}

// ── Evidencia fotográfica (Supabase Storage + tabla) ───────────────────────
export const EVIDENCIAS_BUCKET = 'monitoreo-evidencias';

export function useInformeEvidencias(informeId) {
  return useQuery({
    queryKey: ['monitoreo_evidencias', informeId],
    enabled: !!informeId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tms_monitoreo_evidencias')
        .select('*')
        .eq('informe_id', informeId)
        .order('orden', { ascending: true })
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });
}

// Sube una imagen (blob ya comprimido) y registra la fila de evidencia.
export async function uploadEvidencia({ informeId, itemId, blob, descripcion, user }) {
  const path = `${informeId}/${itemId || 'general'}/${uid()}.jpg`;
  const { error: upErr } = await supabase.storage
    .from(EVIDENCIAS_BUCKET)
    .upload(path, blob, { contentType: 'image/jpeg', upsert: false });
  if (upErr) throw upErr;

  const { data: pub } = supabase.storage.from(EVIDENCIAS_BUCKET).getPublicUrl(path);

  const { data, error } = await supabase
    .from('tms_monitoreo_evidencias')
    .insert({
      informe_id: informeId,
      item_id: itemId || null,
      imagen_url: pub.publicUrl,
      storage_path: path,
      descripcion: descripcion || null,
      creado_por: user?.id || null,
      creado_nombre: user?.nombre || null,
    })
    .select()
    .single();
  if (error) {
    // Limpiar el objeto huérfano si la fila falla.
    await supabase.storage.from(EVIDENCIAS_BUCKET).remove([path]);
    throw error;
  }
  return data;
}

export async function deleteEvidencia(ev) {
  await supabase.storage.from(EVIDENCIAS_BUCKET).remove([ev.storage_path]);
  const { error } = await supabase.from('tms_monitoreo_evidencias').delete().eq('id', ev.id);
  if (error) throw error;
}

export async function updateEvidenciaDescripcion(id, descripcion) {
  const { error } = await supabase
    .from('tms_monitoreo_evidencias')
    .update({ descripcion })
    .eq('id', id);
  if (error) throw error;
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
