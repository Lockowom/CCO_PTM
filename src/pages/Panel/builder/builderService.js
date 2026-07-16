// ============================================================================
//  builderService — datos del Builder del Panel, adaptado a CCO.
//  Lee `tms_dashboard_layouts` / `tms_builder_calculated_fields`; escribe por las
//  RPCs (guardar/eliminar) gate `manage_panel`. Filas de operaciones reales
//  reutilizadas de dash/dashData. Firmas iguales a las de queries.ts.
// ============================================================================
import { supabase } from '../../../supabase';
export {
  fetchOperacionesRows, fetchOperacionesSample,
  fetchDashboardData, fetchAuditStats, fetchTendenciaHistorica,
} from '../dash/dashData';

// ── Dashboards ───────────────────────────────────────────────────────────────
export async function fetchDashboards() {
  const { data, error } = await supabase
    .from('tms_dashboard_layouts')
    .select('id, name, owner, min_role_edit, config')
    .order('updated_at', { ascending: false });
  if (error || !data) return [];
  return data.map((r) => ({
    id: r.id, name: r.name, owner: r.owner, minRoleEdit: r.min_role_edit || 'supervisor',
    config: r.config || { widgets: [], gridLayout: [] },
  }));
}
export async function saveDashboard(d) {
  const { error } = await supabase.rpc('guardar_dashboard', {
    p: { id: d.id, name: d.name, owner: d.owner, min_role_edit: d.minRoleEdit, config: d.config },
  });
  if (error) { console.error('saveDashboard:', error.message); return false; }
  return true;
}
export async function deleteDashboard(id) {
  const { error } = await supabase.rpc('eliminar_dashboard', { p_id: id });
  if (error) { console.error('deleteDashboard:', error.message); return false; }
  return true;
}

// ── Campos calculados ────────────────────────────────────────────────────────
export async function fetchCalculatedFields(incluirInactivos = false) {
  let q = supabase.from('tms_builder_calculated_fields')
    .select('id, nombre, formula, tipo, descripcion, activo, created_by')
    .order('nombre', { ascending: true });
  if (!incluirInactivos) q = q.eq('activo', true);
  const { data, error } = await q;
  if (error || !data) return [];
  return data;
}
export async function saveCalculatedField(f) {
  const nombre = (f.nombre || '').trim();
  if (!nombre) return { ok: false, error: 'El nombre es obligatorio' };
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(nombre)) {
    return { ok: false, error: 'El nombre solo acepta letras, números y _ (sin espacios), y no puede empezar con número' };
  }
  if (!(f.formula || '').trim()) return { ok: false, error: 'La fórmula es obligatoria' };
  const { error } = await supabase.rpc('guardar_campo_calculado', {
    p: { id: f.id ?? null, nombre, formula: f.formula.trim(), tipo: f.tipo || 'texto', descripcion: f.descripcion ?? null, activo: f.activo ?? true, created_by: f.created_by ?? null },
  });
  if (error) {
    const dup = /duplicate|unique/i.test(error.message || '');
    return { ok: false, error: dup ? `Ya existe un campo "${nombre}"` : error.message };
  }
  return { ok: true };
}
export async function deleteCalculatedField(id) {
  const { error } = await supabase.rpc('eliminar_campo_calculado', { p_id: id });
  if (error) { console.error('deleteCalculatedField:', error.message); return false; }
  return true;
}
