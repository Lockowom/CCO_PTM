import { SCREEN_REGISTRY } from './screenRegistry.js';
import { MODULE_REGISTRY } from './moduleRegistry.js';
import { ROUTE_PERMISSIONS } from '../../constants/permissions.js';
import { LEGACY_EXPANSION_MAP } from './legacyExpansionMap.js';

const routePermMap = new Map(Object.entries(ROUTE_PERMISSIONS));

function buildPermToScreens() {
  const map = new Map();
  for (const screen of SCREEN_REGISTRY) {
    const permSet = new Set();
    for (const r of screen.routes) {
      const perms = routePermMap.get(r);
      if (perms) for (const p of perms) permSet.add(p);
    }
    for (const p of permSet) {
      if (!map.has(p)) map.set(p, []);
      map.get(p).push(screen.id);
    }
  }
  return map;
}

const PERM_TO_SCREENS = buildPermToScreens();

export const ORIGIN = {
  EXPLICIT_DENY: 'EXPLICIT_DENY',
  DIRECT_ALLOW: 'DIRECT_ALLOW',
  VALID_DELEGATION: 'VALID_DELEGATION',
  PROFILE_ALLOW: 'PROFILE_ALLOW',
  TEAM_ALLOW: 'TEAM_ALLOW',
  LEGACY_COMPATIBILITY: 'LEGACY_COMPATIBILITY',
  DEFAULT_DENY: 'DEFAULT_DENY',
  PRIVATE_BETA: 'PRIVATE_BETA'
};

const LEGACY_BROAD_IDS = new Set(Object.keys(LEGACY_EXPANSION_MAP));

export function isLegacyBroadPerm(permId) {
  return LEGACY_BROAD_IDS.has(permId);
}

export function unmappedLegacyPerms(perms) {
  return [...new Set(perms)]
    .filter((p) => !PERM_TO_SCREENS.has(p) && !LEGACY_BROAD_IDS.has(p))
    .sort();
}

export function legacyScreenAccess({ perms = [], privateBetaFlags = {} }) {
  const permSet = new Set(perms);
  return SCREEN_REGISTRY.map((screen) => {
    if (screen.privateBeta && !privateBetaFlags[screen.id]) {
      return { id: screen.id, allow: false };
    }
    const grant = screen.routes.some((r) =>
      (routePermMap.get(r) || []).some((p) => permSet.has(p))
    );
    return { id: screen.id, allow: grant };
  });
}

export function resolveAccessV2({ perms = [], overrides = [], privateBetaFlags = {} }) {
  const permSet = new Set(perms);
  const overrideMap = new Map(overrides.map((o) => [o.screen, o.access]));

  const screens = SCREEN_REGISTRY.map((screen) => {
    const decision = (allow, origin, reasons = []) => ({
      id: screen.id,
      module: screen.module,
      allow,
      origin,
      reasons
    });

    if (screen.privateBeta && !privateBetaFlags[screen.id]) {
      return decision(false, ORIGIN.PRIVATE_BETA);
    }

    const override = overrideMap.get(screen.id);
    if (override === 'DENY') {
      return decision(false, ORIGIN.EXPLICIT_DENY);
    }
    if (override === 'ALLOW') {
      return decision(true, ORIGIN.DIRECT_ALLOW);
    }

    const profileReasons = [];
    for (const p of permSet) {
      if (LEGACY_BROAD_IDS.has(p)) continue;
      const screensFor = PERM_TO_SCREENS.get(p) || [];
      if (screensFor.includes(screen.id)) profileReasons.push(p);
    }
    if (profileReasons.length > 0) {
      return decision(true, ORIGIN.PROFILE_ALLOW, profileReasons);
    }

    const legacyReasons = [];
    for (const p of permSet) {
      const exp = LEGACY_EXPANSION_MAP[p];
      if (exp && exp.screens.includes(screen.id)) legacyReasons.push(p);
    }
    if (legacyReasons.length > 0) {
      return decision(true, ORIGIN.LEGACY_COMPATIBILITY, legacyReasons);
    }

    return decision(false, ORIGIN.DEFAULT_DENY);
  });

  const modules = MODULE_REGISTRY.map((m) => ({
    id: m.id,
    allow: screens.some((s) => s.module === m.id && s.allow)
  }));

  return { screens, modules, unmapped: unmappedLegacyPerms([...permSet]) };
}
