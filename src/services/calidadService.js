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

// ── CheckList de Ingreso (hito "Ingreso a bodega" de la matriz de Calidad) ──
// Parámetros del checklist, agrupados por nivel (matriz: Nivel 1 revisión
// documental del Packing List, Nivel 2 inspección física de embalajes).
// Editar aquí para cambiar los ítems del checklist.
export const CHECKLIST_INGRESO_NIVELES = [
  {
    nivel: 1,
    titulo: 'Nivel 1 — Revisión documental (Packing List)',
    params: [
      { id: 'pl_adjunto',           label: 'Packing list / factura adjunta y legible' },
      { id: 'pl_proveedor_oc',      label: 'Proveedor y OC coinciden con lo esperado' },
      { id: 'pl_cantidad',          label: 'Cantidad recibida coincide con la declarada (packing list)' },
      { id: 'pl_lote_serie',        label: 'Lote/serie identificado y documentado' },
      { id: 'pl_vencimiento',       label: 'Fecha de vencimiento vigente y registrada' },
      { id: 'pl_registro_sanitario',label: 'Registro sanitario / certificado del producto disponible' },
      { id: 'pl_cadena_frio',       label: 'Condiciones de transporte / cadena de frío documentadas (si aplica)' },
    ],
  },
  {
    nivel: 2,
    titulo: 'Nivel 2 — Inspección física de embalajes',
    params: [
      { id: 'fis_embalaje',       label: 'Embalaje externo íntegro (sin golpes, roturas o aplastamiento)' },
      { id: 'fis_sellos',         label: 'Sellos / precintos íntegros' },
      { id: 'fis_humedad',        label: 'Sin señales de humedad o mojado' },
      { id: 'fis_etiquetado',     label: 'Etiquetado correcto y legible (producto, lote, vencimiento)' },
      { id: 'fis_bultos',         label: 'N° de bultos coincide con lo declarado' },
      { id: 'fis_dano_visible',   label: 'Producto sin daño visible' },
      { id: 'fis_empaque_primario', label: 'Empaque primario / unidades de venta en buen estado' },
    ],
  },
];

// Parámetros UNIVERSALES (aplican a toda recepción). Los parámetros específicos
// por familia de producto (equipo activo, insumo estéril, etc.) se cargan por RPC
// según lo que contenga la recepción (ver useCategoriasTarea / migración 032).
export const CHECKLIST_TODOS_PARAMS = CHECKLIST_INGRESO_NIVELES.flatMap(n => n.params);
export const RESP_OPCIONES = ['OK', 'NO', 'NA'];

// Metadatos visuales de las familias de producto (chips del checklist).
export const CATEGORIA_META = {
  EQUIPO_ACTIVO:  { cls: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  INSUMO_ESTERIL: { cls: 'bg-cyan-100 text-cyan-700 border-cyan-200' },
  MOBILIARIO:     { cls: 'bg-amber-100 text-amber-700 border-amber-200' },
  AYUDA_TECNICA:  { cls: 'bg-lime-100 text-lime-700 border-lime-200' },
  BIENESTAR:      { cls: 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200' },
  EMPAQUE:        { cls: 'bg-slate-100 text-slate-600 border-slate-200' },
  SIN_CLASIFICAR: { cls: 'bg-rose-100 text-rose-700 border-rose-200' },
};

// Familias de producto presentes en la recepción de una tarea (criterios de
// aceptación específicos + flags regulatorios). Alimenta el checklist por familia.
export function useCategoriasTarea(tareaId) {
  return useQuery({
    queryKey: ['calidad_categorias_tarea', tareaId],
    enabled: !!tareaId,
    staleTime: 60000,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('calidad_categorias_tarea', { p_tarea_id: tareaId });
      if (error) throw error;
      return data || { categorias: [], total_items: 0 };
    },
  });
}

export const ESTADO_TAREA_META = {
  PENDIENTE:    { label: 'Pendiente',    cls: 'bg-amber-100 text-amber-700 border-amber-200' },
  EN_PROCESO:   { label: 'En proceso',   cls: 'bg-sky-100 text-sky-700 border-sky-200' },
  CONFORME:     { label: 'Conforme',     cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  NO_CONFORME:  { label: 'No conforme',  cls: 'bg-rose-100 text-rose-700 border-rose-200' },
};

// Lista de tareas de checklist (cola). Pendientes/en proceso primero.
// staleTime 0 + refetchOnMount → al abrir la pestaña siempre trae lo último
// (una recepción recién registrada aparece de inmediato); realtime complementa.
export function useTareasChecklist() {
  return useQuery({
    queryKey: ['calidad_tareas'],
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,   // al volver a la pestaña del navegador, refresca
    refetchInterval: 20000,       // respaldo por si realtime no entrega (poll 20s)
    refetchIntervalInBackground: false,
    queryFn: async () => {
      const { data, error } = await withTimeout(
        supabase
          .from('tms_calidad_tareas')
          .select('*')
          .eq('tipo', 'CHECKLIST_INGRESO')   // solo hito 1 (excluye CERTIFICADO_SALIDA)
          .order('created_at', { ascending: false }),
        { ms: 12000, label: 'tareas de checklist' }
      );
      if (error) throw error;
      const prio = { PENDIENTE: 0, EN_PROCESO: 1, NO_CONFORME: 2, CONFORME: 3 };
      return (data || []).sort((a, b) => (prio[a.estado] ?? 9) - (prio[b.estado] ?? 9));
    },
  });
}

// Nº de tareas pendientes/en proceso (para badge).
export function useTareasPendientesCount() {
  const { data = [] } = useTareasChecklist();
  return data.filter(t => t.estado === 'PENDIENTE' || t.estado === 'EN_PROCESO').length;
}

// Firma electrónica del certificado/acta (HMAC-SHA256 server-side).
export function useFirmarCertificado() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (tareaId) => {
      const { data, error } = await supabase.rpc('firmar_certificado', { p_tarea_id: tareaId });
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['calidad_tareas'] }),
  });
}

// Verificación pública por folio (para el QR / página de verificación).
export async function verificarCertificado(folio) {
  const { data, error } = await supabase.rpc('verificar_certificado', { p_folio: folio });
  if (error) throw error;
  return data;
}

// ── Hito 2 — Asignaciones de estancia (Inventario → Calidad) ──────────────
export const ESTADO_ASIGNACION_META = {
  PENDIENTE:  { label: 'Pendiente',  cls: 'bg-amber-100 text-amber-700 border-amber-200' },
  EN_PROCESO: { label: 'En proceso', cls: 'bg-sky-100 text-sky-700 border-sky-200' },
  RESUELTA:   { label: 'Resuelta',   cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  ANULADA:    { label: 'Anulada',    cls: 'bg-slate-100 text-slate-500 border-slate-200' },
};

// Cola de asignaciones del hito 2 (pendientes/en proceso primero).
export function useAsignacionesCalidad() {
  return useQuery({
    queryKey: ['calidad_asignaciones'],
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchInterval: 20000,
    refetchIntervalInBackground: false,
    queryFn: async () => {
      const { data, error } = await withTimeout(
        supabase.from('tms_calidad_asignaciones').select('*').order('created_at', { ascending: false }),
        { ms: 12000, label: 'asignaciones de calidad' }
      );
      if (error) throw error;
      const prio = { PENDIENTE: 0, EN_PROCESO: 1, RESUELTA: 2, ANULADA: 3 };
      return (data || []).sort((a, b) => (prio[a.estado] ?? 9) - (prio[b.estado] ?? 9));
    },
  });
}

// Nº de asignaciones pendientes/en proceso (badge del hito 2).
export function useAsignacionesPendientesCount() {
  const { data = [] } = useAsignacionesCalidad();
  return data.filter(a => a.estado === 'PENDIENTE' || a.estado === 'EN_PROCESO').length;
}

// Crear asignación (Inventario asigna SKUs a Calidad).
export function useCrearAsignacion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ skus, motivo, prioridad }) => {
      const { data, error } = await supabase.rpc('crear_asignacion_calidad', {
        p_skus: skus || [], p_motivo: motivo ?? null, p_prioridad: prioridad || 'NORMAL',
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['calidad_asignaciones'] }),
  });
}

// Resolver asignación enlazando el informe/dictamen generado.
export function useResolverAsignacion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ asignacionId, informeId, estado }) => {
      const { data, error } = await supabase.rpc('resolver_asignacion_calidad', {
        p_asignacion_id: asignacionId, p_informe_id: informeId ?? null, p_estado: estado || 'RESUELTA',
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['calidad_asignaciones'] }),
  });
}

// Anular asignación (antes de resolver).
export function useAnularAsignacion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (asignacionId) => {
      const { data, error } = await supabase.rpc('anular_asignacion_calidad', { p_asignacion_id: asignacionId });
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['calidad_asignaciones'] }),
  });
}

// ── Hito 3 — Certificado de Conformidad de Salida (previo al despacho) ──────
export const CHECKLIST_SALIDA_NIVELES = [
  {
    nivel: 1,
    titulo: 'Nivel 1 — Documentación de salida',
    params: [
      { id: 'sal_nv',           label: 'Nota de Venta / pedido coincide con lo preparado' },
      { id: 'sal_factura',      label: 'Factura / guía de despacho emitida y adjunta' },
      { id: 'sal_cliente',      label: 'Cliente y dirección de destino correctos' },
      { id: 'sal_transportista',label: 'Transportista / empresa de transporte asignada' },
    ],
  },
  {
    nivel: 2,
    titulo: 'Nivel 2 — Verificación física de la carga',
    params: [
      { id: 'sal_producto',   label: 'Producto despachado coincide con la NV (SKU y descripción)' },
      { id: 'sal_cantidad',   label: 'Cantidades coinciden con la NV' },
      { id: 'sal_lote_serie', label: 'Lote/serie registrado para trazabilidad de salida' },
      { id: 'sal_embalaje',   label: 'Embalaje de salida íntegro y adecuado para transporte' },
      { id: 'sal_rotulado',   label: 'Rotulado / etiqueta de despacho correcta' },
      { id: 'sal_bultos',     label: 'N° de bultos coincide con la guía' },
      { id: 'sal_condiciones',label: 'Condiciones de transporte adecuadas (cadena de frío si aplica)' },
    ],
  },
];
export const CHECKLIST_SALIDA_TODOS = CHECKLIST_SALIDA_NIVELES.flatMap(n => n.params);
export const DISPOSICIONES_SALIDA = [
  'Retener / no despachar',
  'Reacondicionar y reinspeccionar',
  'Corregir documentación',
  'Despachar con salvedades (autorizado)',
];

// Cola de certificaciones de salida (tipo CERTIFICADO_SALIDA).
export function useTareasSalida() {
  return useQuery({
    queryKey: ['calidad_tareas_salida'],
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchInterval: 20000,
    refetchIntervalInBackground: false,
    queryFn: async () => {
      const { data, error } = await withTimeout(
        supabase.from('tms_calidad_tareas').select('*')
          .eq('tipo', 'CERTIFICADO_SALIDA').order('created_at', { ascending: false }),
        { ms: 12000, label: 'certificaciones de salida' }
      );
      if (error) throw error;
      const prio = { PENDIENTE: 0, EN_PROCESO: 1, NO_CONFORME: 2, CONFORME: 3 };
      return (data || []).sort((a, b) => (prio[a.estado] ?? 9) - (prio[b.estado] ?? 9));
    },
  });
}

export function useSalidaPendientesCount() {
  const { data = [] } = useTareasSalida();
  return data.filter(t => t.estado === 'PENDIENTE' || t.estado === 'EN_PROCESO').length;
}

// Buscar despachos para certificar (por NV, cliente o guía).
export async function buscarDespachos(query) {
  let q = supabase.from('tms_control_despacho')
    .select('id, nv, cliente, guia, facturas, bultos, transportista, empresa_transporte, fecha_despacho, numero_envio')
    .order('fecha_despacho', { ascending: false, nullsFirst: false })
    .limit(25);
  const term = (query || '').trim();
  if (term) q = q.or(`nv.ilike.%${term}%,cliente.ilike.%${term}%,guia.ilike.%${term}%`);
  const { data, error } = await withTimeout(q, { ms: 12000, label: 'despachos' });
  if (error) throw error;
  return data || [];
}

// Crear la tarea de certificación de salida a partir de un despacho.
export function useCrearTareaSalida() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (despachoId) => {
      const { data, error } = await supabase.rpc('crear_tarea_salida', { p_despacho_id: despachoId });
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['calidad_tareas_salida'] }),
  });
}

// Crear la tarea de certificación de salida MANUAL (N.V. escrita a mano + SKUs).
export function useCrearTareaSalidaManual() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ nv, skus, cliente, guia, factura, transportista, bultos }) => {
      const { data, error } = await supabase.rpc('crear_tarea_salida_manual', {
        p_nv: nv, p_skus: skus || [], p_cliente: cliente ?? null, p_guia: guia ?? null,
        p_factura: factura ?? null, p_transportista: transportista ?? null,
        p_bultos: bultos ?? null,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['calidad_tareas_salida'] }),
  });
}

// ── Borrado por ADMIN (limpieza de pruebas) ────────────────────────────────
// Elimina una tarea de calidad (hito 1 checklist de ingreso / hito 3 salida).
export function useEliminarTareaCalidad() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (tareaId) => {
      const { data, error } = await supabase.rpc('eliminar_tarea_calidad', { p_tarea_id: tareaId });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['calidad_tareas'] });
      qc.invalidateQueries({ queryKey: ['calidad_tareas_salida'] });
    },
  });
}

// Elimina una asignación de estancia (hito 2).
export function useEliminarAsignacionCalidad() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (asignacionId) => {
      const { data, error } = await supabase.rpc('eliminar_asignacion_calidad', { p_asignacion_id: asignacionId });
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['calidad_asignaciones'] }),
  });
}

// ── Acciones de Calidad (acción recomendada del dictamen → tarea promulgada) ─
export const TIPOS_ACCION = [
  { id: 'AJUSTE',          label: 'Ajuste de inventario',        area: 'BODEGA' },
  { id: 'BAJA',            label: 'Dar de baja',                 area: 'BODEGA' },
  { id: 'TRANSITORIO',     label: 'Enviar a transitorio',        area: 'BODEGA' },
  { id: 'REACONDICIONAR',  label: 'Reacondicionar / reproceso',  area: 'BODEGA' },
  { id: 'POST_VENTA',      label: 'Post-venta',                  area: 'VENTAS' },
  { id: 'REPARACION',      label: 'Reparación / servicio técnico', area: 'CALIDAD' },
  { id: 'OPINION_EXPERTA', label: 'Opinión experta',             area: 'CALIDAD' },
];

export const ESTADO_ACCION_META = {
  PENDIENTE:  { label: 'Pendiente',  cls: 'bg-amber-100 text-amber-700 border-amber-200' },
  EN_PROCESO: { label: 'En proceso', cls: 'bg-sky-100 text-sky-700 border-sky-200' },
  RESUELTA:   { label: 'Resuelta',   cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  ANULADA:    { label: 'Anulada',    cls: 'bg-slate-100 text-slate-500 border-slate-200' },
};

// Áreas responsables (con su mapeo de roles, para saber si el usuario puede cerrar).
export function useAreasCalidad() {
  return useQuery({
    queryKey: ['areas_calidad'],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase.from('tms_areas_calidad').select('*').order('orden');
      if (error) throw error;
      return data || [];
    },
  });
}

// Cola/tablero de acciones (pendientes primero).
export function useAccionesCalidad() {
  return useQuery({
    queryKey: ['calidad_acciones'],
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchInterval: 20000,
    refetchIntervalInBackground: false,
    queryFn: async () => {
      const { data, error } = await withTimeout(
        supabase.from('tms_calidad_acciones').select('*').order('created_at', { ascending: false }),
        { ms: 12000, label: 'acciones de calidad' }
      );
      if (error) throw error;
      const prio = { PENDIENTE: 0, EN_PROCESO: 1, RESUELTA: 2, ANULADA: 3 };
      return (data || []).sort((a, b) => (prio[a.estado] ?? 9) - (prio[b.estado] ?? 9));
    },
  });
}

export function useAccionesPendientesCount() {
  const { data = [] } = useAccionesCalidad();
  return data.filter(a => a.estado === 'PENDIENTE' || a.estado === 'EN_PROCESO').length;
}

// Crear (promulgar) una acción desde un ítem dictaminado.
export function useCrearAccion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ itemId, tipoAccion, area, descripcion, prioridad, fechaLimite }) => {
      const { data, error } = await supabase.rpc('crear_accion_calidad', {
        p_item_id: itemId, p_tipo_accion: tipoAccion, p_area: area,
        p_descripcion: descripcion ?? null, p_prioridad: prioridad || 'NORMAL',
        p_fecha_limite: fechaLimite ?? null,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['calidad_acciones'] }),
  });
}

// Resolver (cerrar) una acción — la cierra el área responsable o admin.
export function useResolverAccion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ accionId, resolucion, estado }) => {
      const { data, error } = await supabase.rpc('resolver_accion_calidad', {
        p_accion_id: accionId, p_resolucion: resolucion ?? '', p_estado: estado || 'RESUELTA',
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['calidad_acciones'] }),
  });
}

export function useAnularAccion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (accionId) => {
      const { data, error } = await supabase.rpc('anular_accion_calidad', { p_accion_id: accionId });
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['calidad_acciones'] }),
  });
}

// Guardar (parcial) o finalizar (CONFORME/NO_CONFORME) el checklist.
export function useGuardarChecklist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ tareaId, checklist, observaciones, finalizar, resultado, disposicion }) => {
      const { data, error } = await supabase.rpc('guardar_checklist_ingreso', {
        p_tarea_id: tareaId,
        p_checklist: checklist || {},
        p_observaciones: observaciones ?? null,
        p_finalizar: !!finalizar,
        p_resultado: resultado ?? null,
        p_disposicion: disposicion ?? null,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['calidad_tareas'] });
      qc.invalidateQueries({ queryKey: ['calidad_tareas_salida'] });
    },
  });
}
