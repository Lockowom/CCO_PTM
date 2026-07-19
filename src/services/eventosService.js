// ============================================================================
//  eventosService — Motor de Eventos + Centro de Notificaciones (migración 114)
//  Lectura directa (RLS authenticated); escrituras/gestión por RPC gateada
//  (_notif_puede_gestionar → admin o manage_eventos). Push reusa la Edge
//  Function notify-inventario (FCM v1 / Capgo). Sin WhatsApp/SMS.
// ============================================================================
import { supabase } from '../supabase';

const rpc = async (fn, args) => { const { data, error } = await supabase.rpc(fn, args); if (error) return { ok: false, error: error.message }; return data || { ok: true }; };

export async function listarEventos({ agregado, limit = 100 } = {}) {
  let q = supabase.from('dominio_eventos').select('*').order('creado_en', { ascending: false }).limit(limit);
  if (agregado && agregado !== 'todos') q = q.eq('agregado', agregado);
  const { data } = await q; return data || [];
}

export async function listarReglas() {
  const { data } = await supabase.from('notificacion_regla').select('*').order('orden');
  return data || [];
}
export const guardarRegla = (p) => rpc('notif_regla_guardar', { p });
export const eliminarRegla = (id) => rpc('notif_regla_eliminar', { p_id: id });

export async function listarBandeja({ canal, estado, limit = 150 } = {}) {
  let q = supabase.from('notificacion').select('*').order('creado_en', { ascending: false }).limit(limit);
  if (canal && canal !== 'todos') q = q.eq('canal', canal);
  if (estado && estado !== 'todos') q = q.eq('estado', estado);
  const { data } = await q; return data || [];
}

export async function metricasProceso(workflow) {
  const { data } = await supabase.rpc('proceso_metricas', { p_workflow: workflow });
  return data || null;
}

export async function misNotificaciones() { const { data } = await supabase.rpc('mis_notificaciones'); return data || []; }
export const marcarLeida = (id) => rpc('marcar_notificacion_leida', { p_id: id });
export const marcarTodasLeidas = () => rpc('marcar_todas_leidas');

// Despacha las notificaciones push pendientes vía la Edge notify-inventario (FCM/Capgo).
export async function despacharPush() {
  const { data } = await supabase.from('notificacion').select('*').eq('canal', 'push').eq('estado', 'pendiente').limit(300);
  const rows = data || [];
  if (!rows.length) return { ok: true, enviados: 0 };
  const ids = [];
  for (const r of rows) {
    try {
      const { error } = await supabase.functions.invoke('notify-inventario', { body: { titulo: r.titulo, mensaje: r.mensaje, payload: r.payload || {}, rol: r.destinatario_rol || 'ADMIN' } });
      if (!error) ids.push(r.id);
    } catch { /* deja pendiente */ }
  }
  if (ids.length) await supabase.rpc('notif_marcar_enviadas', { p_ids: ids });
  return { ok: true, enviados: ids.length, total: rows.length };
}
