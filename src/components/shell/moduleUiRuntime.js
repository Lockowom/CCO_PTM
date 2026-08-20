const CORE_MODULE_RULES = [
  {
    id: 'dashboard',
    flag: 'web_dashboard_v2',
    matches: (path) => path === '/panel' || path === '/panel/'
  },
  {
    id: 'routes',
    flag: 'web_routes_v2',
    mobileFlag: 'mobile_routes_v2',
    mapFlag: 'mobile_map_v2',
    matches: (path) => path === '/panel/rutas' || path.startsWith('/panel/rutas/')
  },
  {
    id: 'tms-mobile',
    flag: 'mobile_tms_v2',
    mobileFlag: 'mobile_tms_v2',
    matches: (path) => path === '/tms/pda' || path.startsWith('/tms/pda/')
  },
  {
    id: 'tms',
    flag: 'web_tms_v2',
    mobileFlag: 'mobile_tms_v2',
    matches: (path) => path === '/tms/control' || path.startsWith('/tms/control/')
  },
  {
    id: 'panel-nv',
    flag: 'web_panel_nv_v2',
    matches: (path) => path.startsWith('/panel/') && !path.startsWith('/panel/rutas')
  },
  {
    id: 'inventory',
    flag: 'web_inventory_v2',
    matches: (path) => path.startsWith('/inventory/') || path === '/queries/locations'
  },
  {
    id: 'inbound',
    flag: 'web_inbound_v2',
    matches: (path) => path === '/inbound' || path.startsWith('/inbound/')
  },
  {
    id: 'quality',
    flag: 'web_quality_v2',
    matches: (path) => path === '/quality' || path.startsWith('/quality/')
  },
  {
    id: 'postventa',
    flag: 'web_postventa_v2',
    matches: (path) => path === '/postventa' || path.startsWith('/postventa/')
  }
];

/** Resuelve la superficie visual sin alterar el componente funcional de la ruta. */
export function resolveModuleUiRuntime(pathname, isEnabled) {
  const normalized = String(pathname || '/').split('?')[0];
  const rule = CORE_MODULE_RULES.find((candidate) => candidate.matches(normalized));
  if (!rule) return { id: 'legacy', flag: null, enabled: false };
  return {
    ...rule,
    enabled: Boolean(isEnabled?.(rule.flag)),
    mobileEnabled: Boolean(rule.mobileFlag && isEnabled?.(rule.mobileFlag)),
    mapEnabled: Boolean(rule.mapFlag && isEnabled?.(rule.mapFlag))
  };
}

export { CORE_MODULE_RULES };
