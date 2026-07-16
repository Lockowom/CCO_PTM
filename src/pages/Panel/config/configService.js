// ============================================================================
//  configService — Configuración del Panel (catálogos Transportistas/Vendedores)
//  + Auditoría. CRUD sobre tms_panel_* por RPCs (gate manage_panel); auditoría
//  desde la bitácora tms_operaciones_log. Firmas iguales a las de queries.ts.
// ============================================================================
import { supabase } from '../../../supabase';

const TABLA = { transportistas: 'tms_panel_transportistas', vendedores: 'tms_panel_vendedores' };

async function fetchCatalogo(tipo, incluirInactivos = false) {
  let q = supabase.from(TABLA[tipo]).select('*').order('nombre', { ascending: true });
  if (!incluirInactivos) q = q.eq('activo', true);
  const { data, error } = await q;
  if (error || !data) return [];
  return data;
}
async function guardarCatalogo(tipo, form) {
  const nombre = (form.nombre || '').trim();
  if (!nombre) return { ok: false, error: 'El nombre es obligatorio' };
  const { error } = await supabase.rpc('guardar_panel_catalogo', { p_tipo: tipo, p: { ...form, nombre } });
  if (error) {
    const dup = /duplicate|unique/i.test(error.message || '');
    return { ok: false, error: dup ? `Ya existe "${nombre}"` : error.message };
  }
  return { ok: true };
}
async function toggleCatalogo(tipo, id, activo) {
  const { error } = await supabase.rpc('toggle_panel_catalogo', { p_tipo: tipo, p_id: id, p_activo: activo });
  return !error;
}
async function eliminarCatalogo(tipo, id) {
  const { error } = await supabase.rpc('eliminar_panel_catalogo', { p_tipo: tipo, p_id: id });
  return !error;
}

export const fetchTransportistas = (inc = false) => fetchCatalogo('transportistas', inc);
export const saveTransportista = (f) => guardarCatalogo('transportistas', f);
export const toggleTransportista = (id, activo) => toggleCatalogo('transportistas', id, activo);
export const deleteTransportista = (id) => eliminarCatalogo('transportistas', id);
export const fetchVendedores = (inc = false) => fetchCatalogo('vendedores', inc);
export const saveVendedor = (f) => guardarCatalogo('vendedores', f);
export const toggleVendedor = (id, activo) => toggleCatalogo('vendedores', id, activo);
export const deleteVendedor = (id) => eliminarCatalogo('vendedores', id);

// ── Auditoría (bitácora de cambios de operaciones) ──────────────────────────
export async function fetchAuditoria({ operador = '', accion = '', nv = '', limit = 150 } = {}) {
  let q = supabase.from('tms_operaciones_log')
    .select('id, ts, actor, accion, nv, oper_id')
    .order('ts', { ascending: false }).limit(limit);
  if (operador) q = q.ilike('actor', `%${operador}%`);
  if (accion) q = q.eq('accion', accion);
  if (nv) q = q.eq('nv', nv);
  const { data } = await q;
  return data || [];
}
export async function fetchAuditStatsPanel() {
  const { data } = await supabase.from('tms_operaciones_log').select('actor, accion');
  const stats = {};
  (data || []).forEach((r) => {
    const op = r.actor || '?';
    if (!stats[op]) stats[op] = { creates: 0, updates: 0, estados: 0, deletes: 0, total: 0 };
    stats[op].total++;
    if (r.accion === 'create') stats[op].creates++;
    else if (r.accion === 'update') stats[op].updates++;
    else if (r.accion === 'estado') stats[op].estados++;
    else if (r.accion === 'delete') stats[op].deletes++;
  });
  return Object.entries(stats).map(([nombre, d]) => ({ nombre, ...d })).sort((a, b) => b.total - a.total);
}
