// ============================================================================
//  iamService — Identity & Security (Fase 4: Scopes / ABAC)
//  Administración de asignaciones de rol CON ÁMBITO (scope) sobre iam.assignments,
//  y el hook de ámbitos del usuario en sesión. Todo por RPC gateada (admin ∨
//  manage_roles en el servidor). Ver docs/IAM_ARQUITECTURA.md §18-24.
// ============================================================================
import { supabase } from '../supabase';

const rpc = async (fn, args) => {
  const { data, error } = await supabase.rpc(fn, args);
  if (error) return { ok: false, error: error.message };
  return data ?? { ok: true };
};

// Catálogos para la UI (usuarios, roles, centros de costo).
export async function catalogoScope() {
  const { data, error } = await supabase.rpc('iam_catalogo_scope');
  if (error) throw error;
  return data || { usuarios: [], roles: [], centros_costo: [] };
}

// Asignaciones con ámbito (todas o de un usuario).
export async function listarAsignaciones(userId = null) {
  const { data, error } = await supabase.rpc('iam_asignaciones', { p_user: userId });
  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

// Otorgar un rol con ámbito (p.ej. OPERADOR sobre centro_costo '150').
export const asignarScope = (userId, role, scopeType, scopeCode, expires = null) =>
  rpc('iam_asignar_scope', {
    p_user: userId, p_role: role, p_scope_type: scopeType,
    p_scope_code: scopeCode, p_expires: expires,
  });

export const revocarAsignacion = (id) => rpc('iam_revocar_asignacion', { p_id: id });

// Ámbitos del usuario en sesión para un permiso → { all: bool, codes: [...] }.
// Úsalo para filtrar datos por centro de costo cuando el módulo lo adopte.
export async function misScopes(code, scopeType = 'centro_costo') {
  const { data, error } = await supabase.rpc('iam_mis_scopes', { p_code: code, p_scope_type: scopeType });
  if (error) throw error;
  return data || { all: false, codes: [] };
}

// ── Fase 5: Sesiones + Auditoría (admin) ────────────────────────────────────
export async function sesiones() {
  const { data, error } = await supabase.rpc('iam_sesiones');
  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

export const forzarLogout = (authUid) => rpc('iam_forzar_logout', { p_auth: authUid });

export async function auditoria(filtros = {}) {
  const { data, error } = await supabase.rpc('iam_auditoria', {
    p_tabla: filtros.tabla || null, p_accion: filtros.accion || null,
    p_desde: filtros.desde || null, p_hasta: filtros.hasta || null,
    p_limit: filtros.limit || 200,
  });
  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

export async function auditoriaMeta() {
  const { data, error } = await supabase.rpc('iam_auditoria_meta');
  if (error) throw error;
  return data || { tablas: [], acciones: [], total: 0 };
}

// ── Fase 7: Escala (MV de permisos + carga masiva) ──────────────────────────
export async function permisosStats() {
  const { data, error } = await supabase.rpc('iam_permisos_stats');
  if (error) throw error;
  return data || {};
}

export const refrescarPermisos = () => rpc('iam_refrescar_permisos');

// rows: [{ nombre, email, rol, password? }] → { creados, actualizados, errores[], detalle[] }
export async function bulkUsuarios(rows) {
  const { data, error } = await supabase.rpc('iam_bulk_usuarios', { p_rows: rows });
  if (error) return { ok: false, error: error.message };
  return data || { ok: true };
}

// ── Fase 8: Políticas condicionales (ABAC) ──────────────────────────────────
export async function listarPolicies() {
  const { data, error } = await supabase.rpc('iam_policies');
  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

export const guardarPolicy = (p) => rpc('iam_policy_guardar', { p });
export const togglePolicy = (id, activo) => rpc('iam_policy_toggle', { p_id: id, p_activo: activo });

// Probador del ejemplo N.V.: ¿puede el usuario (o yo) editar la N.V. p_id?
export async function probarEditarNV(id, uid = null) {
  const { data, error } = await supabase.rpc('iam_puede_editar_nv', { p_id: id, p_uid: uid });
  if (error) throw error;
  return data;
}

// ── Fase 9: Delegación / sustituciones ──────────────────────────────────────
export async function delegaciones(soloActivas = false) {
  const { data, error } = await supabase.rpc('iam_delegaciones', { p_solo_activas: soloActivas });
  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

export const delegar = ({ delegado, hasta, desde = null, role = null, motivo = null, delegador = null }) =>
  rpc('iam_delegar', { p_delegado: delegado, p_hasta: hasta, p_desde: desde, p_role: role, p_motivo: motivo, p_delegador: delegador });

export const revocarDelegacion = (id) => rpc('iam_revocar_delegacion', { p_id: id });

export async function misCoberturas() {
  const { data, error } = await supabase.rpc('iam_mis_coberturas');
  if (error) throw error;
  return data || { cubro: [], delego: [] };
}

// Lista ligera de usuarios (id+nombre) para selectores (cualquier autenticado).
export async function usuariosLite() {
  const { data, error } = await supabase.rpc('iam_usuarios_lite');
  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

// ── Historial de accesos (ingresos) ─────────────────────────────────────────
export async function historialAcceso(filtros = {}) {
  const { data, error } = await supabase.rpc('iam_historial_acceso', {
    p_desde: filtros.desde || null, p_hasta: filtros.hasta || null,
    p_q: filtros.q || null, p_limit: filtros.limit || 300,
  });
  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

export async function historialAccesoResumen() {
  const { data, error } = await supabase.rpc('iam_historial_acceso_resumen');
  if (error) throw error;
  return data || { total: 0, usuarios: 0, hoy: 0, semana: 0, ultimo: null };
}
