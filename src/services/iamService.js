// ============================================================================
//  iamService — Identity & Security (Fase 4: Scopes / ABAC)
//  Administración de asignaciones de rol CON ÁMBITO (scope) sobre iam.assignments,
//  y el hook de ámbitos del usuario en sesión. Todo por RPC gateada (admin ∨
//  manage_roles en el servidor). Ver docs/IAM_ARQUITECTURA.md §18-24.
// ============================================================================
import { rpcCommand, rpcQuery } from '../core/infrastructure/supabase/rpcClient';

// Catálogos para la UI (usuarios, roles, centros de costo).
export async function catalogoScope() {
  const data = await rpcQuery(
    'iam_catalogo_scope',
    {},
    { module: 'iam', action: 'catalogo_scope' }
  );
  return data || { usuarios: [], roles: [], centros_costo: [] };
}

// Asignaciones con ámbito (todas o de un usuario).
export async function listarAsignaciones(userId = null) {
  const data = await rpcQuery(
    'iam_asignaciones',
    { p_user: userId },
    { module: 'iam', action: 'listar_asignaciones', payload: { userId } }
  );
  return Array.isArray(data) ? data : [];
}

// Otorgar un rol con ámbito (p.ej. OPERADOR sobre centro_costo '150').
export const asignarScope = (userId, role, scopeType, scopeCode, expires = null) =>
  rpcCommand(
    'iam_asignar_scope',
    {
      p_user: userId,
      p_role: role,
      p_scope_type: scopeType,
      p_scope_code: scopeCode,
      p_expires: expires
    },
    { module: 'iam', action: 'asignar_scope', payload: { userId, role, scopeType, scopeCode } }
  );

export const revocarAsignacion = (id) =>
  rpcCommand(
    'iam_revocar_asignacion',
    { p_id: id },
    { module: 'iam', action: 'revocar_asignacion', payload: { id } }
  );

// Ámbitos del usuario en sesión para un permiso → { all: bool, codes: [...] }.
// Úsalo para filtrar datos por centro de costo cuando el módulo lo adopte.
export async function misScopes(code, scopeType = 'centro_costo') {
  const data = await rpcQuery(
    'iam_mis_scopes',
    { p_code: code, p_scope_type: scopeType },
    { module: 'iam', action: 'mis_scopes', payload: { code, scopeType } }
  );
  return data || { all: false, codes: [] };
}

// ── Fase 5: Sesiones + Auditoría (admin) ────────────────────────────────────
export async function sesiones() {
  const data = await rpcQuery('iam_sesiones', {}, { module: 'iam', action: 'sesiones' });
  return Array.isArray(data) ? data : [];
}

export const forzarLogout = (authUid) =>
  rpcCommand(
    'iam_forzar_logout',
    { p_auth: authUid },
    { module: 'iam', action: 'forzar_logout', payload: { authUid } }
  );

export async function auditoria(filtros = {}) {
  const data = await rpcQuery(
    'iam_auditoria',
    {
      p_tabla: filtros.tabla || null,
      p_accion: filtros.accion || null,
      p_desde: filtros.desde || null,
      p_hasta: filtros.hasta || null,
      p_limit: filtros.limit || 200
    },
    { module: 'iam', action: 'auditoria', payload: filtros }
  );
  return Array.isArray(data) ? data : [];
}

export async function auditoriaMeta() {
  const data = await rpcQuery(
    'iam_auditoria_meta',
    {},
    { module: 'iam', action: 'auditoria_meta' }
  );
  return data || { tablas: [], acciones: [], total: 0 };
}

// ── Fase 7: Escala (MV de permisos + carga masiva) ──────────────────────────
export async function permisosStats() {
  const data = await rpcQuery(
    'iam_permisos_stats',
    {},
    { module: 'iam', action: 'permisos_stats' }
  );
  return data || {};
}

export const refrescarPermisos = () =>
  rpcCommand('iam_refrescar_permisos', {}, { module: 'iam', action: 'refrescar_permisos' });

// rows: [{ nombre, email, rol, password? }] → { creados, actualizados, errores[], detalle[] }
export async function bulkUsuarios(rows) {
  return rpcCommand(
    'iam_bulk_usuarios',
    { p_rows: rows },
    { module: 'iam', action: 'bulk_usuarios', payload: { rows: rows.length } }
  );
}

// ── Fase 8: Políticas condicionales (ABAC) ──────────────────────────────────
export async function listarPolicies() {
  const data = await rpcQuery('iam_policies', {}, { module: 'iam', action: 'listar_policies' });
  return Array.isArray(data) ? data : [];
}

export const guardarPolicy = (p) =>
  rpcCommand(
    'iam_policy_guardar',
    { p },
    { module: 'iam', action: 'guardar_policy', payload: { id: p?.id || null } }
  );
export const togglePolicy = (id, activo) =>
  rpcCommand(
    'iam_policy_toggle',
    { p_id: id, p_activo: activo },
    { module: 'iam', action: 'toggle_policy', payload: { id, activo } }
  );

// Probador del ejemplo N.V.: ¿puede el usuario (o yo) editar la N.V. p_id?
export async function probarEditarNV(id, uid = null) {
  const data = await rpcQuery(
    'iam_puede_editar_nv',
    { p_id: id, p_uid: uid },
    { module: 'iam', action: 'probar_editar_nv', payload: { id, uid } }
  );
  return data;
}

// ── Fase 9: Delegación / sustituciones ──────────────────────────────────────
export async function delegaciones(soloActivas = false) {
  const data = await rpcQuery(
    'iam_delegaciones',
    { p_solo_activas: soloActivas },
    { module: 'iam', action: 'delegaciones', payload: { soloActivas } }
  );
  return Array.isArray(data) ? data : [];
}

export const delegar = ({
  delegado,
  hasta,
  desde = null,
  role = null,
  motivo = null,
  delegador = null
}) =>
  rpcCommand(
    'iam_delegar',
    {
      p_delegado: delegado,
      p_hasta: hasta,
      p_desde: desde,
      p_role: role,
      p_motivo: motivo,
      p_delegador: delegador
    },
    { module: 'iam', action: 'delegar', payload: { delegado, hasta, role } }
  );

export const revocarDelegacion = (id) =>
  rpcCommand(
    'iam_revocar_delegacion',
    { p_id: id },
    { module: 'iam', action: 'revocar_delegacion', payload: { id } }
  );

export async function misCoberturas() {
  const data = await rpcQuery(
    'iam_mis_coberturas',
    {},
    { module: 'iam', action: 'mis_coberturas' }
  );
  return data || { cubro: [], delego: [] };
}

// Lista ligera de usuarios (id+nombre) para selectores (cualquier autenticado).
export async function usuariosLite() {
  const data = await rpcQuery('iam_usuarios_lite', {}, { module: 'iam', action: 'usuarios_lite' });
  return Array.isArray(data) ? data : [];
}

// ── Historial de accesos (ingresos) ─────────────────────────────────────────
export async function historialAcceso(filtros = {}) {
  const data = await rpcQuery(
    'iam_historial_acceso',
    {
      p_desde: filtros.desde || null,
      p_hasta: filtros.hasta || null,
      p_q: filtros.q || null,
      p_limit: filtros.limit || 300
    },
    { module: 'iam', action: 'historial_acceso', payload: filtros }
  );
  return Array.isArray(data) ? data : [];
}

export async function historialAccesoResumen() {
  const data = await rpcQuery(
    'iam_historial_acceso_resumen',
    {},
    { module: 'iam', action: 'historial_acceso_resumen' }
  );
  return data || { total: 0, usuarios: 0, hoy: 0, semana: 0, ultimo: null };
}

// ── Fase 10: Equipos / Grupos / Principals ───────────────────────────────────
export async function catalogoOrg() {
  const data = await rpcQuery('iam_catalogo_org', {}, { module: 'iam', action: 'catalogo_org' });
  return data || { usuarios: [], roles: [], departamentos: [] };
}

export async function listarTeams() {
  const data = await rpcQuery('iam_teams', {}, { module: 'iam', action: 'listar_teams' });
  return Array.isArray(data) ? data : [];
}

export const guardarTeam = (p) =>
  rpcCommand(
    'iam_team_guardar',
    { p },
    {
      module: 'iam',
      action: 'guardar_team',
      payload: { id: p?.id || null, codigo: p?.codigo || null }
    }
  );
export const eliminarTeam = (id) =>
  rpcCommand(
    'iam_team_eliminar',
    { p_id: id },
    { module: 'iam', action: 'eliminar_team', payload: { id } }
  );

export async function miembrosTeam(teamId) {
  const data = await rpcQuery(
    'iam_team_members',
    { p_team: teamId },
    { module: 'iam', action: 'miembros_team', payload: { teamId } }
  );
  return Array.isArray(data) ? data : [];
}

export const agregarMiembroTeam = (teamId, userId) =>
  rpcCommand(
    'iam_team_member_add',
    { p_team: teamId, p_user: userId },
    { module: 'iam', action: 'agregar_miembro_team', payload: { teamId, userId } }
  );
export const quitarMiembroTeam = (teamId, userId) =>
  rpcCommand(
    'iam_team_member_remove',
    { p_team: teamId, p_user: userId },
    { module: 'iam', action: 'quitar_miembro_team', payload: { teamId, userId } }
  );

export async function listarGroups() {
  const data = await rpcQuery('iam_groups', {}, { module: 'iam', action: 'listar_groups' });
  return Array.isArray(data) ? data : [];
}

export const guardarGroup = (p) =>
  rpcCommand(
    'iam_group_guardar',
    { p },
    {
      module: 'iam',
      action: 'guardar_group',
      payload: { id: p?.id || null, codigo: p?.codigo || null }
    }
  );
export const eliminarGroup = (id) =>
  rpcCommand(
    'iam_group_eliminar',
    { p_id: id },
    { module: 'iam', action: 'eliminar_group', payload: { id } }
  );

export async function miembrosGroup(groupId) {
  const data = await rpcQuery(
    'iam_group_members',
    { p_group: groupId },
    { module: 'iam', action: 'miembros_group', payload: { groupId } }
  );
  return Array.isArray(data) ? data : [];
}

export const agregarMiembroGroup = (groupId, userId) =>
  rpcCommand(
    'iam_group_member_add',
    { p_group: groupId, p_user: userId },
    { module: 'iam', action: 'agregar_miembro_group', payload: { groupId, userId } }
  );
export const quitarMiembroGroup = (groupId, userId) =>
  rpcCommand(
    'iam_group_member_remove',
    { p_group: groupId, p_user: userId },
    { module: 'iam', action: 'quitar_miembro_group', payload: { groupId, userId } }
  );

export async function asignacionesPrincipal(principalType, principalId) {
  const data = await rpcQuery(
    'iam_principal_asignaciones',
    {
      p_principal_type: principalType,
      p_principal_id: principalId
    },
    { module: 'iam', action: 'asignaciones_principal', payload: { principalType, principalId } }
  );
  return Array.isArray(data) ? data : [];
}

export const asignarRolPrincipal = ({
  principalType,
  principalId,
  role,
  scopeType = 'global',
  scopeCode = null,
  expires = null
}) =>
  rpcCommand(
    'iam_principal_asignar_rol',
    {
      p_principal_type: principalType,
      p_principal_id: principalId,
      p_role: role,
      p_scope_type: scopeType,
      p_scope_code: scopeCode,
      p_expires: expires
    },
    {
      module: 'iam',
      action: 'asignar_rol_principal',
      payload: { principalType, principalId, role, scopeType, scopeCode }
    }
  );

export const revocarAsignacionPrincipal = (id) =>
  rpcCommand(
    'iam_principal_revocar_asignacion',
    { p_id: id },
    { module: 'iam', action: 'revocar_asignacion_principal', payload: { id } }
  );
export const refrescarGruposDinamicos = (groupId = null) =>
  rpcCommand(
    'iam_refresh_dynamic_groups',
    { p_group: groupId },
    { module: 'iam', action: 'refrescar_grupos_dinamicos', payload: { groupId } }
  );

// ── Control de Acceso (IAM 2.0, read-only) — RPCs migración 176 ─────────────
// Permisos efectivos de un usuario según el motor iam.user_effective_permissions
// (admin ∨ manage_users). Estado REAL, no una copia cliente.
export async function permisosEfectivosDe(uid) {
  const data = await rpcQuery(
    'iam_permisos_efectivos',
    { p_uid: uid },
    { module: 'iam', action: 'permisos_efectivos_de', payload: { uid } }
  );
  return Array.isArray(data) ? data : [];
}

// Overrides (INHERIT/ALLOW/DENY) de un usuario (admin ∨ manage_users).
export async function listarOverridesDe(uid) {
  const data = await rpcQuery(
    'iam_overrides_list',
    { p_uid: uid },
    { module: 'iam', action: 'overrides_list_de', payload: { uid } }
  );
  return Array.isArray(data) ? data : [];
}
