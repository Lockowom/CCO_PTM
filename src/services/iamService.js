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
