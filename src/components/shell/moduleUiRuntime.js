const CORE_MODULE_RULES = [
  {
    id: 'dashboard',
    flag: 'web_dashboard_v2',
    matches: (path) => path === '/panel' || path === '/panel/'
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
  return { ...rule, enabled: Boolean(isEnabled?.(rule.flag)) };
}

export { CORE_MODULE_RULES };
