export const VISUAL_BREAKPOINTS = [
  { name: '360x800', width: 360, height: 800 },
  { name: '390x844', width: 390, height: 844 },
  { name: '412x915', width: 412, height: 915 },
  { name: '768x1024', width: 768, height: 1024 },
  { name: '1366x768', width: 1366, height: 768 },
  { name: '1440x900', width: 1440, height: 900 },
  { name: '1920x1080', width: 1920, height: 1080 }
] as const;

export const PUBLIC_VISUAL_ROUTES = ['/login', '/consulta'] as const;
export const AUTHENTICATED_VISUAL_ROUTES = [
  '/panel',
  '/panel/ingresar',
  '/panel/info',
  '/inventory/conteo',
  '/inventory/analisis',
  '/inbound/reception',
  '/quality/mi-bandeja',
  '/postventa',
  '/admin/access',
  '/tms/control'
] as const;
