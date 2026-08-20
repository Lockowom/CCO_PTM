import { matchPath } from 'react-router-dom';
import { SCREEN_REGISTRY } from './screenRegistry.js';
import { FUNCTION_REGISTRY } from './functionRegistry.js';
import { resolveAccessV2 } from './resolverV2.js';

export const IAM_ENFORCEMENT_MODE = Object.freeze({
  SHADOW: 'SHADOW',
  ENFORCE: 'ENFORCE'
});

const screenById = new Map(SCREEN_REGISTRY.map((screen) => [screen.id, screen]));
const functionById = new Map(FUNCTION_REGISTRY.map((fn) => [fn.id, fn]));

function normalizePath(pathname = '/') {
  return (
    String(pathname || '/')
      .split('?')[0]
      .toLowerCase()
      .replace(/\/+$/, '') || '/'
  );
}

export function screenForPath(pathname) {
  const clean = normalizePath(pathname);
  return (
    SCREEN_REGISTRY.find((screen) =>
      screen.routes.some((route) => {
        const candidate = normalizePath(route);
        return candidate.includes(':')
          ? !!matchPath({ path: candidate, end: true }, clean)
          : candidate === clean;
      })
    ) || null
  );
}

export function normalizeRuntimeContext(value) {
  const mode =
    value?.mode === IAM_ENFORCEMENT_MODE.ENFORCE
      ? IAM_ENFORCEMENT_MODE.ENFORCE
      : IAM_ENFORCEMENT_MODE.SHADOW;
  const overrides = Array.isArray(value?.overrides)
    ? value.overrides.filter(
        (row) =>
          row &&
          ['screen', 'function'].includes(row.surface_type) &&
          ['ALLOW', 'DENY', 'INHERIT'].includes(row.access) &&
          typeof row.surface_id === 'string'
      )
    : [];
  return {
    mode,
    permissionVersion: Number(value?.permission_version || 1),
    overrides,
    changedAt: value?.changed_at || null,
    changedReason: value?.changed_reason || null
  };
}

export function buildRuntimeAccess({ perms = [], context, privateBetaFlags = {} }) {
  const runtime = normalizeRuntimeContext(context);
  const screenOverrides = runtime.overrides
    .filter((row) => row.surface_type === 'screen')
    .map((row) => ({ screen: row.surface_id, access: row.access, reason: row.reason || null }));
  const resolved = resolveAccessV2({ perms, overrides: screenOverrides, privateBetaFlags });
  return {
    ...runtime,
    screens: new Map(resolved.screens.map((screen) => [screen.id, screen])),
    functions: new Map(
      runtime.overrides
        .filter((row) => row.surface_type === 'function')
        .map((row) => [row.surface_id, row])
    ),
    unmapped: resolved.unmapped
  };
}

export function runtimeAllowsScreen(runtime, screenId, legacyDecision = false, isAdmin = false) {
  if (isAdmin) return true;
  if (!runtime || runtime.mode !== IAM_ENFORCEMENT_MODE.ENFORCE) return legacyDecision;
  const decision = runtime.screens?.get(screenId);
  return decision ? decision.allow === true : false;
}

export function runtimeAllowsPath(runtime, pathname, legacyDecision = false, isAdmin = false) {
  const screen = screenForPath(pathname);
  if (!screen) return legacyDecision;
  return runtimeAllowsScreen(runtime, screen.id, legacyDecision, isAdmin);
}

export function runtimeAllowsFunction(
  runtime,
  functionId,
  { legacyDecision = false, isAdmin = false } = {}
) {
  if (isAdmin) return true;
  if (!runtime || runtime.mode !== IAM_ENFORCEMENT_MODE.ENFORCE) return legacyDecision;

  const fn = functionById.get(functionId);
  if (!fn) return false;
  const override = runtime.functions?.get(functionId);
  if (override?.access === 'DENY') return false;
  if (override?.access === 'ALLOW') return true;

  // Sin excepción funcional, la función hereda la pantalla. Esto mantiene una
  // sola cadena de decisión y evita botones visibles dentro de una pantalla negada.
  return runtimeAllowsScreen(runtime, fn.screen, legacyDecision, false);
}

export function runtimeDecisionDetails(runtime, pathname) {
  const screen = screenForPath(pathname);
  if (!screen) return null;
  return {
    screen: screenById.get(screen.id) || screen,
    decision: runtime?.screens?.get(screen.id) || null,
    mode: runtime?.mode || IAM_ENFORCEMENT_MODE.SHADOW
  };
}
