import { ROUTE_PERMISSIONS, TAB_PERMISSIONS } from '../../constants/permissions.js';
import { APP_PERMISSIONS } from '../../config/modules.js';

const catalogPerms = new Set();
for (const mod of APP_PERMISSIONS) {
  for (const p of mod.permissions) catalogPerms.add(p.id);
}

const routePerms = new Map();
for (const [route, perms] of Object.entries(ROUTE_PERMISSIONS)) {
  routePerms.set(route, new Set(perms));
}

const tabPerms = new Set();
for (const cfg of Object.values(TAB_PERMISSIONS)) {
  for (const [tab, perm] of Object.entries(cfg)) {
    if (tab.startsWith('_')) continue;
    if (perm) tabPerms.add(perm);
  }
  for (const p of cfg._amplios || []) routePerms.set(`__tab_amplio__${p}`, new Set([p]));
}

const ADMIN_ROUTES = new Set(Object.keys(ROUTE_PERMISSIONS).filter((r) => r.startsWith('/admin/')));

export function classifyLegacyPermission(permId) {
  const routes = [];
  for (const [route, perms] of routePerms.entries()) {
    if (route.startsWith('__tab_amplio__')) continue;
    if (perms.has(permId)) routes.push(route);
  }

  const adminOnly =
    routes.length > 0 && routes.every((r) => ADMIN_ROUTES.has(r)) && routes.length >= 1;

  let type;
  if (tabPerms.has(permId)) {
    type = 'TAB';
  } else if (routes.length > 1) {
    type = 'BROAD';
  } else if (routes.length === 1) {
    type = adminOnly ? 'ADMIN' : 'GRANULAR';
  } else {
    type = 'UNUSED';
  }

  if (['manage_panel', 'manage_inventory', 'manage_postventa', 'manage_quality'].includes(permId)) {
    type = 'LEGACY_BROAD';
  }

  return {
    id: permId,
    type,
    routes: routes.sort(),
    routeCount: routes.length,
    adminOnly,
    inCatalog: catalogPerms.has(permId),
    inTabs: tabPerms.has(permId)
  };
}

export function classifyAllLegacyPermissions() {
  const all = new Set(catalogPerms);
  for (const [route, perms] of routePerms.entries()) {
    if (route.startsWith('__tab_amplio__')) continue;
    for (const p of perms) all.add(p);
  }
  return [...all].sort().map(classifyLegacyPermission);
}

export function countByType() {
  const counts = {};
  for (const c of classifyAllLegacyPermissions()) {
    counts[c.type] = (counts[c.type] || 0) + 1;
  }
  return counts;
}
