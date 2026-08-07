import { j as r, k as o } from './index-Pwuftu2X.js';
async function m() {
  return (
    (await r('iam_catalogo_scope', {}, { module: 'iam', action: 'catalogo_scope' })) || {
      usuarios: [],
      roles: [],
      centros_costo: []
    }
  );
}
async function l(a = null) {
  const i = await r(
    'iam_asignaciones',
    { p_user: a },
    { module: 'iam', action: 'listar_asignaciones', payload: { userId: a } }
  );
  return Array.isArray(i) ? i : [];
}
const _ = (a, i, s, n, t = null) =>
    o(
      'iam_asignar_scope',
      { p_user: a, p_role: i, p_scope_type: s, p_scope_code: n, p_expires: t },
      {
        module: 'iam',
        action: 'asignar_scope',
        payload: { userId: a, role: i, scopeType: s, scopeCode: n }
      }
    ),
  u = (a) =>
    o(
      'iam_revocar_asignacion',
      { p_id: a },
      { module: 'iam', action: 'revocar_asignacion', payload: { id: a } }
    );
async function d() {
  const a = await r('iam_sesiones', {}, { module: 'iam', action: 'sesiones' });
  return Array.isArray(a) ? a : [];
}
const p = (a) =>
  o(
    'iam_forzar_logout',
    { p_auth: a },
    { module: 'iam', action: 'forzar_logout', payload: { authUid: a } }
  );
async function g(a = {}) {
  const i = await r(
    'iam_auditoria',
    {
      p_tabla: a.tabla || null,
      p_accion: a.accion || null,
      p_desde: a.desde || null,
      p_hasta: a.hasta || null,
      p_limit: a.limit || 200
    },
    { module: 'iam', action: 'auditoria', payload: a }
  );
  return Array.isArray(i) ? i : [];
}
async function y() {
  return (
    (await r('iam_auditoria_meta', {}, { module: 'iam', action: 'auditoria_meta' })) || {
      tablas: [],
      acciones: [],
      total: 0
    }
  );
}
async function b() {
  return (await r('iam_permisos_stats', {}, { module: 'iam', action: 'permisos_stats' })) || {};
}
const A = () => o('iam_refrescar_permisos', {}, { module: 'iam', action: 'refrescar_permisos' });
async function f(a) {
  return o(
    'iam_bulk_usuarios',
    { p_rows: a },
    { module: 'iam', action: 'bulk_usuarios', payload: { rows: a.length } }
  );
}
async function w() {
  const a = await r('iam_policies', {}, { module: 'iam', action: 'listar_policies' });
  return Array.isArray(a) ? a : [];
}
const v = (a) =>
    o(
      'iam_policy_guardar',
      { p: a },
      {
        module: 'iam',
        action: 'guardar_policy',
        payload: { id: (a == null ? void 0 : a.id) || null }
      }
    ),
  h = (a, i) =>
    o(
      'iam_policy_toggle',
      { p_id: a, p_activo: i },
      { module: 'iam', action: 'toggle_policy', payload: { id: a, activo: i } }
    );
async function G(a, i = null) {
  return await r(
    'iam_puede_editar_nv',
    { p_id: a, p_uid: i },
    { module: 'iam', action: 'probar_editar_nv', payload: { id: a, uid: i } }
  );
}
async function q(a = !1) {
  const i = await r(
    'iam_delegaciones',
    { p_solo_activas: a },
    { module: 'iam', action: 'delegaciones', payload: { soloActivas: a } }
  );
  return Array.isArray(i) ? i : [];
}
const P = ({
    delegado: a,
    hasta: i,
    desde: s = null,
    role: n = null,
    motivo: t = null,
    delegador: e = null
  }) =>
    o(
      'iam_delegar',
      { p_delegado: a, p_hasta: i, p_desde: s, p_role: n, p_motivo: t, p_delegador: e },
      { module: 'iam', action: 'delegar', payload: { delegado: a, hasta: i, role: n } }
    ),
  M = (a) =>
    o(
      'iam_revocar_delegacion',
      { p_id: a },
      { module: 'iam', action: 'revocar_delegacion', payload: { id: a } }
    );
async function k() {
  return (
    (await r('iam_mis_coberturas', {}, { module: 'iam', action: 'mis_coberturas' })) || {
      cubro: [],
      delego: []
    }
  );
}
async function x() {
  const a = await r('iam_usuarios_lite', {}, { module: 'iam', action: 'usuarios_lite' });
  return Array.isArray(a) ? a : [];
}
async function z(a = {}) {
  const i = await r(
    'iam_historial_acceso',
    {
      p_desde: a.desde || null,
      p_hasta: a.hasta || null,
      p_q: a.q || null,
      p_limit: a.limit || 300
    },
    { module: 'iam', action: 'historial_acceso', payload: a }
  );
  return Array.isArray(i) ? i : [];
}
async function D() {
  return (
    (await r(
      'iam_historial_acceso_resumen',
      {},
      { module: 'iam', action: 'historial_acceso_resumen' }
    )) || { total: 0, usuarios: 0, hoy: 0, semana: 0, ultimo: null }
  );
}
async function L() {
  return (
    (await r('iam_catalogo_org', {}, { module: 'iam', action: 'catalogo_org' })) || {
      usuarios: [],
      roles: [],
      departamentos: []
    }
  );
}
async function S() {
  const a = await r('iam_teams', {}, { module: 'iam', action: 'listar_teams' });
  return Array.isArray(a) ? a : [];
}
const j = (a) =>
    o(
      'iam_team_guardar',
      { p: a },
      {
        module: 'iam',
        action: 'guardar_team',
        payload: {
          id: (a == null ? void 0 : a.id) || null,
          codigo: (a == null ? void 0 : a.codigo) || null
        }
      }
    ),
  E = (a) =>
    o(
      'iam_team_eliminar',
      { p_id: a },
      { module: 'iam', action: 'eliminar_team', payload: { id: a } }
    );
async function R(a) {
  const i = await r(
    'iam_team_members',
    { p_team: a },
    { module: 'iam', action: 'miembros_team', payload: { teamId: a } }
  );
  return Array.isArray(i) ? i : [];
}
const T = (a, i) =>
    o(
      'iam_team_member_add',
      { p_team: a, p_user: i },
      { module: 'iam', action: 'agregar_miembro_team', payload: { teamId: a, userId: i } }
    ),
  B = (a, i) =>
    o(
      'iam_team_member_remove',
      { p_team: a, p_user: i },
      { module: 'iam', action: 'quitar_miembro_team', payload: { teamId: a, userId: i } }
    );
async function C() {
  const a = await r('iam_groups', {}, { module: 'iam', action: 'listar_groups' });
  return Array.isArray(a) ? a : [];
}
const F = (a) =>
    o(
      'iam_group_guardar',
      { p: a },
      {
        module: 'iam',
        action: 'guardar_group',
        payload: {
          id: (a == null ? void 0 : a.id) || null,
          codigo: (a == null ? void 0 : a.codigo) || null
        }
      }
    ),
  H = (a) =>
    o(
      'iam_group_eliminar',
      { p_id: a },
      { module: 'iam', action: 'eliminar_group', payload: { id: a } }
    );
async function J(a) {
  const i = await r(
    'iam_group_members',
    { p_group: a },
    { module: 'iam', action: 'miembros_group', payload: { groupId: a } }
  );
  return Array.isArray(i) ? i : [];
}
const K = (a, i) =>
    o(
      'iam_group_member_add',
      { p_group: a, p_user: i },
      { module: 'iam', action: 'agregar_miembro_group', payload: { groupId: a, userId: i } }
    ),
  N = (a, i) =>
    o(
      'iam_group_member_remove',
      { p_group: a, p_user: i },
      { module: 'iam', action: 'quitar_miembro_group', payload: { groupId: a, userId: i } }
    );
async function O(a, i) {
  const s = await r(
    'iam_principal_asignaciones',
    { p_principal_type: a, p_principal_id: i },
    {
      module: 'iam',
      action: 'asignaciones_principal',
      payload: { principalType: a, principalId: i }
    }
  );
  return Array.isArray(s) ? s : [];
}
const Q = ({
    principalType: a,
    principalId: i,
    role: s,
    scopeType: n = 'global',
    scopeCode: t = null,
    expires: e = null
  }) =>
    o(
      'iam_principal_asignar_rol',
      {
        p_principal_type: a,
        p_principal_id: i,
        p_role: s,
        p_scope_type: n,
        p_scope_code: t,
        p_expires: e
      },
      {
        module: 'iam',
        action: 'asignar_rol_principal',
        payload: { principalType: a, principalId: i, role: s, scopeType: n, scopeCode: t }
      }
    ),
  V = (a) =>
    o(
      'iam_principal_revocar_asignacion',
      { p_id: a },
      { module: 'iam', action: 'revocar_asignacion_principal', payload: { id: a } }
    ),
  U = (a = null) =>
    o(
      'iam_refresh_dynamic_groups',
      { p_group: a },
      { module: 'iam', action: 'refrescar_grupos_dinamicos', payload: { groupId: a } }
    );
export {
  B as A,
  V as B,
  N as C,
  j as D,
  E,
  F,
  H as G,
  T as H,
  K as I,
  Q as J,
  U as K,
  k as L,
  x as M,
  _ as a,
  u as b,
  m as c,
  g as d,
  y as e,
  p as f,
  f as g,
  w as h,
  v as i,
  G as j,
  q as k,
  l,
  P as m,
  M as n,
  z as o,
  b as p,
  D as q,
  A as r,
  d as s,
  h as t,
  L as u,
  S as v,
  C as w,
  R as x,
  O as y,
  J as z
};
