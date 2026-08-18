import { ROUTE_PERMISSIONS } from '../../constants/permissions.js';
import { SCREEN_REGISTRY } from './screenRegistry.js';

const ROUTE_TO_SCREEN = {};
for (const s of SCREEN_REGISTRY) {
  for (const r of s.routes) ROUTE_TO_SCREEN[r] = s.id;
}

const ROUTE_TO_FUNCTIONS = {
  '/panel': ['panel.dashboard.view'],
  '/panel/ingresar': [
    'panel.nv.entry.view',
    'panel.nv.entry.create',
    'panel.nv.entry.edit',
    'panel.nv.entry.change_state',
    'panel.nv.entry.documents.manage',
    'panel.nv.entry.transport.manage',
    'panel.nv.entry.mark_urgent'
  ],
  '/panel/info': ['panel.nv.info.view', 'panel.nv.info.export', 'panel.nv.info.history'],
  '/panel/tv': ['panel.tv.view'],
  '/panel/builder': ['panel.builder.view', 'panel.builder.manage'],
  '/panel/rutas': ['panel.routes.view'],
  '/panel/configuracion': ['panel.settings.view', 'panel.settings.manage']
};

function routesOf(permId) {
  return Object.keys(ROUTE_PERMISSIONS)
    .filter((r) => ROUTE_PERMISSIONS[r].includes(permId))
    .sort();
}

function screensOf(routes) {
  return [...new Set(routes.map((r) => ROUTE_TO_SCREEN[r]).filter(Boolean))].sort();
}

function expandManagePanel() {
  const routes = routesOf('manage_panel');
  return {
    id: 'manage_panel',
    type: 'LEGACY_BROAD',
    status: 'DEPRECATED_COMPATIBILITY',
    routes,
    screens: screensOf(routes),
    functions: [...new Set(routes.flatMap((r) => ROUTE_TO_FUNCTIONS[r] || []))].sort(),
    nota: 'Mapeo DERIVADO del comportamiento real: ROUTE_PERMISSIONS (rutas OR, incluye /tms/*) + RPCs gateadas (guardar_nv/cambiar_estado_nv/solicitar_reapertura_nv exigen manage_panel). NO incluye eliminar_nv (allowlist por email, mig 099) ni aprobar reaperturas (approve_panel_reopen_nv/manage_roles).'
  };
}

function expandGeneric(permId, nota) {
  const routes = routesOf(permId);
  return {
    id: permId,
    type: 'BROAD',
    status: 'DEPRECATED_COMPATIBILITY',
    routes,
    screens: screensOf(routes),
    functions: [],
    nota
  };
}

export const LEGACY_EXPANSION_MAP = {
  manage_panel: expandManagePanel(),
  manage_inventory: expandGeneric(
    'manage_inventory',
    'Rutas derivadas de ROUTE_PERMISSIONS (incluye /mobile/pda, conteo, bloque/:codigo, calidad, consultas). Expansión función-a-función pendiente (R17+ por dominio).'
  ),
  manage_postventa: expandGeneric(
    'manage_postventa',
    'Abre /postventa/tickets + TODAS sus pestañas (TAB_PERMISSIONS._amplios) + acciones gestionar.'
  ),
  manage_quality: expandGeneric(
    'manage_quality',
    'Incluye dictaminar (monitoreo_dictaminar) y clasificación.'
  )
};

export function expansionFor(permId) {
  return LEGACY_EXPANSION_MAP[permId] || null;
}
