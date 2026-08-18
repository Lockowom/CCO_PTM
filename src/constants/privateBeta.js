// PR-015B · Registro de módulos en PRIVATE BETA / modo oculto.
//
// Regla transversal de CCO 2.0 (FEATURE_IMPLEMENTED != FEATURE_RELEASED):
// un módulo puede existir en código/BD/rutas pero NO ser visible ni accesible
// para usuarios generales hasta que se autorice su liberación.
//
//   NEW_MODULE_PUBLIC_VISIBILITY = 0
//   NEW_MODULE_NAV_VISIBILITY = 0
//   NEW_MODULE_GENERAL_ACCESS = 0
//
// Capas de protección (TODAS deben pasar):
//   1. feature flag `module_<nombre>_private_beta` (src/config/featureFlags.js)
//   2. permiso IAM `view_<nombre>_private_beta` / `manage_<nombre>_private_beta`
//   3. allowlist por rol IAM (cco_private_beta_<modulo>) — NO UUIDs hardcodeados
//   4. autorización backend/RPC + RLS (la ruta sola no basta)
//
// El guard de rutas (App.jsx → ProtectedRoute) y routeMeta consumen este registro.

import { isFeatureFlagEnabled } from '../config/featureFlags';

// Modos de visibilidad/estado de release de un módulo.
export const RELEASE_STAGES = {
  DEVELOPMENT: 'DEVELOPMENT',
  PRIVATE_BETA: 'PRIVATE_BETA',
  INTERNAL_PILOT: 'INTERNAL_PILOT',
  LIMITED_RELEASE: 'LIMITED_RELEASE',
  GENERAL_AVAILABILITY: 'GENERAL_AVAILABILITY',
};

/**
 * Módulos en modo oculto/private-beta.
 * `path` puede ser una ruta exacta o con :param (se resuelve con matchPath).
 * La asignación de beta users es por ROL IAM (`roles`), NUNCA por UUID.
 */
export const PRIVATE_BETA_MODULES = {
  rutas: {
    path: '/panel/rutas',
    flag: 'module_rutas_private_beta',
    viewPermission: 'view_rutas_private_beta',
    managePermission: 'manage_rutas_private_beta',
    betaRole: 'cco_private_beta_rutas',
    stage: RELEASE_STAGES.PRIVATE_BETA,
  },
  // FUTUROS: module_id: { path, flag, viewPermission, managePermission, betaRole, stage }
};

/** Devuelve la config de un módulo en beta según su ruta (exacta o con params). */
export function privateBetaForPath(pathname) {
  if (!pathname) return null;
  const clean = String(pathname).split('?')[0].replace(/\/+$/, '') || '/';
  for (const cfg of Object.values(PRIVATE_BETA_MODULES)) {
    if (cfg.path === clean) return cfg;
    if (cfg.path.includes(':') && matchPathLike(cfg.path, clean)) return cfg;
  }
  return null;
}

// matchPath es de react-router-dom; lo mantenemos fuera del módulo puro para
// no acoplar la resolución. La ruta con params se compara por segmentos.
function matchPathLike(pattern, path) {
  const p = pattern.split('/');
  const t = path.split('/');
  if (p.length !== t.length) return false;
  return p.every((seg, i) => seg.startsWith(':') || seg === t[i]);
}

/**
 * Evalúa el acceso a un módulo en private beta.
 * @param {object} cfg  Config del módulo (privateBetaForPath).
 * @param {object} opts { flagOn, hasPermission, roles }
 * @returns {{ allowed: boolean, reason: string|null, stage: string }}
 *   reason: 'FLAG_OFF' | 'NOT_IN_BETA' | 'NO_PERMISSION' | null (allowed)
 */
export function evaluatePrivateBetaAccess(cfg, { flagOn, hasPermission, roles = [] }) {
  if (!cfg) return { allowed: true, reason: null, stage: null };

  // Capa 1: feature flag. Apagado → el módulo NO existe (404).
  const on = flagOn !== undefined ? flagOn : isFeatureFlagEnabled(cfg.flag);
  if (!on) return { allowed: false, reason: 'FLAG_OFF', stage: cfg.stage };

  // Capa 2: allowlist por rol IAM (no UUIDs). ADMIN no abre beta por sí solo.
  const inBeta =
    Array.isArray(roles) &&
    roles.some((r) => String(r).toLowerCase() === String(cfg.betaRole).toLowerCase());
  if (!inBeta) return { allowed: false, reason: 'NOT_IN_BETA', stage: cfg.stage };

  // Capa 3: permiso específico view/manage.
  const hasView = typeof hasPermission === 'function' && hasPermission(cfg.viewPermission);
  if (!hasView) return { allowed: false, reason: 'NO_PERMISSION', stage: cfg.stage };

  return { allowed: true, reason: null, stage: cfg.stage };
}

/** ¿Un usuario tiene el rol de beta de un módulo? (helpers para UI). */
export function inPrivateBetaRole(cfg, roles = []) {
  if (!cfg) return false;
  return Array.isArray(roles) && roles.some((r) => String(r).toLowerCase() === String(cfg.betaRole).toLowerCase());
}