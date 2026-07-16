// ============================================================================
//  panelService — PUNTO ÚNICO DE CONEXIÓN A DATOS del Panel PTM.
//  (Equivalente a lib/queries.ts del repo panel-.)
//
//  LECTURAS: ya conectadas a DATOS REALES → leen `tms_operaciones` (migrada del
//  Panel) vía panelQueries.js. Todas las pantallas (Dashboard, Info, TV,
//  Detalle, Catálogos) consumen desde aquí, sin importar los cálculos.
//  ESCRITURAS (lookupNV/guardarNV): aún simuladas — se conectan en la fase de
//  escrituras nativas (RPC SECURITY DEFINER + cutover del Sheet).
// ============================================================================
import { getDashboard as qDashboard, getDetalle as qDetalle, buscarNV as qBuscar,
  getTV as qTV, getCatalogo as qCatalogo, invalidarCache } from './panelQueries';
import { supabase } from '../../supabase';
import { ESTADO_COLOR } from './mock';

const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms));
const soloFecha = (v) => (v ? String(v).slice(0, 10) : '');

// ── Dashboard (REAL) ─────────────────────────────────────────────────────────
export async function getDashboard() { return qDashboard(); }
export async function getDetalle(titulo, count) { return qDetalle(titulo, count); }

// ── Info N.V. (REAL) ─────────────────────────────────────────────────────────
export async function buscarNV(query) { return qBuscar(query); }

// ── Modo TV (REAL) ───────────────────────────────────────────────────────────
export async function getTV() { return qTV(); }

// ── Configuración / catálogos (REAL, derivados de operaciones) ───────────────
export async function getCatalogo(tipo) { return qCatalogo(tipo); }
export async function guardarCatalogo(/* tipo, items */) { await delay(200); return { ok: true }; }

// ── Ingresar N.V. (escrituras REALES vía RPC, tras el cutover) ───────────────
// Busca la N.V. por canal para decidir crear vs actualizar y precargar datos.
export async function lookupNV(nv, canal = 'ptm') {
  const col = canal === 'ptm' ? 'nv_ptm' : canal === 'orange' ? 'nv_orange' : canal === 'farmapack' ? 'nv_farmapack' : 'varios';
  let q = supabase.from('tms_operaciones')
    .select('id,cliente,vendedor,centro_costo,division,estado,fecha_aprobacion,fecha_aprobacion_real,fecha_compromiso')
    .order('fecha_estado', { ascending: false }).limit(1);
  q = canal === 'ptm' ? q.eq('nv_ptm', Number(String(nv).trim())) : q.eq(col, String(nv).trim());
  const { data } = await q;
  if (data && data.length) {
    const r = data[0];
    return {
      found: true, row: r.id,
      data: { cliente: r.cliente, vendedor: r.vendedor, ccosto: r.centro_costo, division: r.division },
      fechaAprobacion: soloFecha(r.fecha_aprobacion), fechaCompromiso: soloFecha(r.fecha_compromiso), estado: r.estado,
    };
  }
  return { found: false, autoFill: { cliente: '', vendedor: '' }, fechaAprobacion: new Date().toLocaleDateString('en-CA') };
}

// Crea/actualiza la N.V. vía RPC guardar_nv (id presente = update).
export async function guardarNV(payload) {
  const p = { ...payload, id: payload?.mode === 'update' ? (payload?.lookup?.row ?? null) : null };
  const { data, error } = await supabase.rpc('guardar_nv', { p });
  invalidarCache();
  if (error) return { ok: false, error: error.message };
  return data || { ok: true };
}

// Cambio rápido de estado (Info/TV) vía RPC cambiar_estado_nv.
export async function cambiarEstado(id, estado, urgente = null) {
  const { data, error } = await supabase.rpc('cambiar_estado_nv', { p_id: id, p_estado: estado, p_urgente: urgente });
  invalidarCache();
  if (error) return { ok: false, error: error.message };
  return data || { ok: true };
}

// ── Auditoría (bitácora de cambios de operaciones) ───────────────────────────
export async function getAuditoria() {
  const { data } = await supabase.from('tms_operaciones_log')
    .select('id, accion, nv, actor, ts').order('ts', { ascending: false }).limit(100);
  return { ok: true, rows: data || [] };
}

export { ESTADO_COLOR };
