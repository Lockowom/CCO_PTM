import { ROUTE_PERMISSIONS } from '../../constants/permissions.js';

const ROUTE_TO_SCREEN = {
  '/panel': 'panel.dashboard',
  '/panel/ingresar': 'panel.nv.entry',
  '/panel/reaperturas': 'panel.nv.reopen',
  '/panel/info': 'panel.nv.info',
  '/panel/tv': 'panel.tv',
  '/panel/builder': 'panel.builder',
  '/panel/rutas': 'panel.routes',
  '/panel/configuracion': 'panel.settings'
};

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

function expandManagePanel() {
  const routes = Object.keys(ROUTE_PERMISSIONS).filter((r) =>
    ROUTE_PERMISSIONS[r].includes('manage_panel')
  );
  const screens = routes.map((r) => ROUTE_TO_SCREEN[r]).filter(Boolean);
  const functions = [];
  for (const r of routes) {
    const fns = ROUTE_TO_FUNCTIONS[r];
    if (fns) functions.push(...fns);
  }
  return {
    id: 'manage_panel',
    type: 'LEGACY_BROAD',
    status: 'DEPRECATED_COMPATIBILITY',
    routes: routes.sort(),
    screens: [...new Set(screens)].sort(),
    functions: [...new Set(functions)].sort(),
    nota: 'Mapeo derivado del comportamiento REAL actual: ROUTE_PERMISSIONS (rutas OR) + RPCs gateadas (guardar_nv/cambiar_estado_nv/solicitar_reapertura_nv exigen manage_panel). NO incluye eliminar_nv (allowlist por email, mig 099) ni aprobar reaperturas (approve_panel_reopen_nv/manage_roles).'
  };
}

export function routeEffectsOf(permId) {
  return Object.keys(ROUTE_PERMISSIONS)
    .filter((r) => ROUTE_PERMISSIONS[r].includes(permId))
    .sort();
}

export const LEGACY_EXPANSION_MAP = {
  manage_panel: expandManagePanel(),
  manage_inventory: {
    id: 'manage_inventory',
    type: 'BROAD',
    status: 'DEPRECATED_COMPATIBILITY',
    routes: routeEffectsOf('manage_inventory'),
    screens: [
      'inventory.pda',
      'inventory.traspasos',
      'inventory.conteo',
      'inventory.analisis',
      'inventory.carteles',
      'inventory.insumos',
      'quality.monitoreo',
      'quality.acciones',
      'quality.bandeja',
      'quality.clasificacion',
      'queries.grupo'
    ],
    functions: [],
    nota: 'Rutas derivadas de ROUTE_PERMISSIONS. Expansión función-a-función pendiente (R17+ por dominio).'
  },
  manage_postventa: {
    id: 'manage_postventa',
    type: 'BROAD',
    status: 'DEPRECATED_COMPATIBILITY',
    routes: routeEffectsOf('manage_postventa'),
    screens: ['postventa.tickets'],
    functions: [],
    nota: 'Abre la ruta + TODAS las pestañas (TAB_PERMISSIONS._amplios) + acciones gestionar.'
  },
  manage_quality: {
    id: 'manage_quality',
    type: 'BROAD',
    status: 'DEPRECATED_COMPATIBILITY',
    routes: routeEffectsOf('manage_quality'),
    screens: ['quality.monitoreo', 'quality.acciones', 'quality.bandeja', 'quality.clasificacion'],
    functions: [],
    nota: 'Incluye dictaminar (monitoreo_dictaminar) y clasificación.'
  }
};

export function expansionFor(permId) {
  return LEGACY_EXPANSION_MAP[permId] || null;
}
