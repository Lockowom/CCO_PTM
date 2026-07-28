// ============================================================================
//  eventosService — Motor de Eventos + Centro de Notificaciones (migración 114)
//  Lectura directa (RLS authenticated); escrituras/gestión por RPC gateada
//  (_notif_puede_gestionar → admin o manage_eventos). Push reusa la Edge
//  Function notify-inventario (FCM v1 / Capgo). Sin WhatsApp/SMS.
// ============================================================================
import { supabase } from '../supabase';
import { rpcCommand, rpcQuery } from '../core/infrastructure/supabase/rpcClient';

const NOTIFICACIONES_CACHE_TTL_MS = 90 * 1000;
let misNotificacionesCache = { ts: 0, data: null, promise: null };

function resetEventosCaches() {
  misNotificacionesCache = { ts: 0, data: null, promise: null };
}

export async function listarEventos({ agregado, limit = 100 } = {}) {
  let q = supabase
    .from('dominio_eventos')
    .select('*')
    .order('creado_en', { ascending: false })
    .limit(limit);
  if (agregado && agregado !== 'todos') q = q.eq('agregado', agregado);
  const { data } = await q;
  return data || [];
}

export async function listarReglas() {
  const { data } = await supabase.from('notificacion_regla').select('*').order('orden');
  return data || [];
}
export const guardarRegla = (p) =>
  rpcCommand(
    'notif_regla_guardar',
    { p },
    {
      module: 'eventos',
      action: 'guardar_regla',
      payload: { id: p?.id || null, evento: p?.evento || null }
    }
  );
export const eliminarRegla = (id) =>
  rpcCommand(
    'notif_regla_eliminar',
    { p_id: id },
    { module: 'eventos', action: 'eliminar_regla', payload: { id } }
  );

export async function listarBandeja({ canal, estado, limit = 150 } = {}) {
  let q = supabase
    .from('notificacion')
    .select('*')
    .order('creado_en', { ascending: false })
    .limit(limit);
  if (canal && canal !== 'todos') q = q.eq('canal', canal);
  if (estado && estado !== 'todos') q = q.eq('estado', estado);
  const { data } = await q;
  return data || [];
}

export async function metricasProceso(workflow) {
  const data = await rpcQuery(
    'proceso_metricas',
    { p_workflow: workflow },
    { module: 'eventos', action: 'metricas_proceso', payload: { workflow } }
  );
  return data || null;
}

export async function misNotificaciones() {
  const now = Date.now();
  if (misNotificacionesCache.data && (now - misNotificacionesCache.ts) < NOTIFICACIONES_CACHE_TTL_MS) {
    return misNotificacionesCache.data;
  }
  if (misNotificacionesCache.promise) {
    return misNotificacionesCache.promise;
  }

  const run = async () => {
    const data = await rpcQuery(
      'mis_notificaciones',
      {},
      { module: 'eventos', action: 'mis_notificaciones' }
    );
    const rows = data || [];
    misNotificacionesCache = { ts: Date.now(), data: rows, promise: null };
    return rows;
  };

  misNotificacionesCache.promise = run().catch((error) => {
    misNotificacionesCache.promise = null;
    throw error;
  });
  return misNotificacionesCache.promise;
}
export const marcarLeida = (id) =>
  rpcCommand(
    'marcar_notificacion_leida',
    { p_id: id },
    { module: 'eventos', action: 'marcar_leida', payload: { id } }
  ).finally(resetEventosCaches);
export const marcarTodasLeidas = () =>
  rpcCommand('marcar_todas_leidas', {}, { module: 'eventos', action: 'marcar_todas_leidas' }).finally(resetEventosCaches);

// Despacha las notificaciones push pendientes vía la Edge notify-inventario (FCM/Capgo).
export async function despacharPush() {
  const { data } = await supabase
    .from('notificacion')
    .select('*')
    .eq('canal', 'push')
    .eq('estado', 'pendiente')
    .limit(300);
  const rows = data || [];
  if (!rows.length) return { ok: true, enviados: 0 };
  const ids = [];
  for (const r of rows) {
    try {
      const { error } = await supabase.functions.invoke('notify-inventario', {
        body: {
          titulo: r.titulo,
          mensaje: r.mensaje,
          payload: r.payload || {},
          rol: r.destinatario_rol || 'ADMIN'
        }
      });
      if (!error) ids.push(r.id);
    } catch {
      /* deja pendiente */
    }
  }
  if (ids.length) await supabase.rpc('notif_marcar_enviadas', { p_ids: ids });
  return { ok: true, enviados: ids.length, total: rows.length };
}
