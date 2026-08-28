// PR-013 · routeMeta.js — SSOT de metadatos de ruta (TXT 03 §4).
//
// NO duplica lógica de permisos: `requiredPermissions` se deriva de
// ROUTE_PERMISSIONS (fuente de verdad de acceso). El AppShell (sidebar,
// breadcrumb, búsqueda global) y el mobile shell consumen ESTE catálogo,
// no `APP_ROUTES` directamente.
//
// Forma: { path, title, module, group, parent, requiredPermissions,
//          searchable, mobilePriority, hiddenFromNav }

import { ROUTE_PERMISSIONS } from './permissions';
import { APP_ROUTES } from '../config/modules';
import { privateBetaForPath } from './privateBeta';

// Grupo por módulo (para sidebar/breadcrumb). Los labels salen de APP_ROUTES.
const MODULE_GROUP = {
  inbound: { label: 'Inbound', icon: 'PackagePlus' },
  inventario: { label: 'Inventario', icon: 'Warehouse' },
  queries: { label: 'Consultas', icon: 'ScanSearch' },
  panel: { label: 'Panel PTM', icon: 'LayoutDashboard' },
  quality: { label: 'Calidad', icon: 'ClipboardCheck' },
  postventa: { label: 'Post-Venta', icon: 'Headphones' },
  admin: { label: 'Admin', icon: 'ShieldCog' },
  tms: { label: 'TMS', icon: 'Truck' }
};

// Rutas ocultas del menú pero que siguen siendo rutas válidas (requieren
// permiso igual que cualquier otra; solo no se listan en nav/búsqueda global).
const HIDDEN_FROM_NAV = new Set([
  '/panel/tv', // TV se abre por URL directa (kiosko)
  '/admin/monitor', // monitor dentro de Admin → Monitor
  '/tms/control',
  '/tms/pda'
]);

// Prioridad de búsqueda móvil (menor = más arriba). Default: 50.
const MOBILE_PRIORITY = {
  '/mobile/pda': 10,
  '/inventory/traspasos': 20,
  '/inventory/conteo': 30,
  '/inbound/entry': 40,
  '/panel/ingresar': 30
};

function normalizePath(path) {
  // Normaliza a la ruta base (sin query) para buscar en ROUTE_PERMISSIONS.
  const base = path.split('?')[0];
  return ROUTE_PERMISSIONS[path] ? path : base;
}

// Rutas de private beta que NO viven en APP_ROUTES (no son landing públicas ni
// aparecen en el catálogo de Roles). Se catalogan igual para que el AppShell las
// resuelva (breadcrumb/SEO) pero SIEMPRE ocultas de nav y búsqueda global.
const PRIVATE_BETA_EXTRA = [
  {
    path: '/panel/rutas',
    label: 'Coordinación Rutas',
    module: 'panel',
    group: { label: 'Panel PTM', icon: 'LayoutDashboard' }
  }
];

const PRIVATE_BETA_EXTRA_META = PRIVATE_BETA_EXTRA.map((r) => {
  const privateBeta = privateBetaForPath(r.path);
  return {
    path: r.path,
    title: r.label,
    module: r.module,
    group: r.group,
    parent: r.group ? r.group.label : null,
    requiredPermissions: ROUTE_PERMISSIONS[r.path] || null,
    searchable: false,
    mobilePriority: 50,
    hiddenFromNav: true,
    privateBeta: Boolean(privateBeta),
    privateBetaStage: privateBeta ? privateBeta.stage : null
  };
});

export const ROUTE_META = [
  ...APP_ROUTES.map((r) => {
    const norm = normalizePath(r.value);
    const requiredPermissions = ROUTE_PERMISSIONS[norm] || null;
    const module = r.module || null;
    const group = MODULE_GROUP[module] || null;
    // PR-015B: módulos en private beta nunca aparecen en nav/búsqueda global
    // (NEW_MODULE_NAV_VISIBILITY = 0). Se accede solo por URL directa y el guard
    // evalúa flag + rol IAM + permiso. Si el flag está OFF, getRouteMeta aun así
    // no debe listarlo; el guard de rutas devuelve 404.
    const privateBeta = privateBetaForPath(r.value);
    return {
      path: r.value,
      title: r.label,
      module,
      group,
      parent: group ? group.label : null,
      requiredPermissions,
      searchable: !HIDDEN_FROM_NAV.has(r.value) && !privateBeta,
      mobilePriority: MOBILE_PRIORITY[r.value] ?? 50,
      hiddenFromNav: HIDDEN_FROM_NAV.has(r.value) || Boolean(privateBeta),
      privateBeta: Boolean(privateBeta),
      privateBetaStage: privateBeta ? privateBeta.stage : null
    };
  }),
  ...PRIVATE_BETA_EXTRA_META
];

const byPath = new Map(ROUTE_META.map((m) => [m.path, m]));

/** Devuelve el metadato de una ruta (normalizando query y trailing slash). */
export function getRouteMeta(pathname) {
  if (!pathname) return null;
  if (byPath.has(pathname)) return byPath.get(pathname);
  const base = pathname.split('?')[0].replace(/\/$/, '');
  if (byPath.has(base)) return byPath.get(base);
  // Fallback: coincidencia por prefijo (páginas con params tipo /inventory/bloque/:codigo)
  const exact = [...byPath.values()].find((m) => m.path === base);
  if (exact) return exact;
  const byPrefix = [...byPath.values()]
    .filter((m) => !m.path.includes('?'))
    .sort((a, b) => b.path.length - a.path.length)
    .find((m) => base.startsWith(m.path));
  return byPrefix || null;
}

/** Breadcrumb jerárquico para el AppShell: [grupo?, padre, página]. */
export function getBreadcrumb(pathname) {
  const meta = getRouteMeta(pathname);
  if (!meta) return [];
  const crumbs = [];
  if (meta.group) crumbs.push({ label: meta.group.label, path: null });
  if (meta.parent && meta.parent !== meta.group?.label) {
    crumbs.push({ label: meta.parent, path: null });
  }
  crumbs.push({ label: meta.title, path: meta.path });
  return crumbs;
}

/** Rutas buscables para la paleta de búsqueda global (ordenadas por prioridad). */
export const SEARCHABLE_ROUTES = ROUTE_META.filter((m) => m.searchable).sort(
  (a, b) => a.mobilePriority - b.mobilePriority
);

/** Agrupa las rutas del menú por grupo (para el Sidebar del AppShell). */
export function getNavGroups(canAccessRoute = null) {
  const groups = new Map();
  for (const meta of ROUTE_META) {
    if (meta.hiddenFromNav) continue;
    if (canAccessRoute && !canAccessRoute(meta.path)) continue;
    const key = meta.module || 'other';
    if (!groups.has(key)) {
      groups.set(key, {
        id: key,
        label: meta.group?.label || key,
        icon: meta.group?.icon || 'Circle',
        items: []
      });
    }
    groups.get(key).items.push(meta);
  }
  return [...groups.values()].filter((group) => group.items.length > 0);
}

export default ROUTE_META;
