// R5-B1B: presentación de rutas; la autorización sigue en la ruta certificada.
// No añade permisos ni cambia el screen ID usado por overrides/IAM.
export const DEVOLUCIONES_LEGACY_PATH = '/quality/devoluciones';
export const DEVOLUCIONES_INBOUND_PATH = '/inbound/devoluciones';
export const DEVOLUCIONES_QUALITY_PATH = '/quality/devoluciones/pendientes';

export function devolucionesAccessPath(pathname) {
  const normalized = String(pathname || '')
    .split('?')[0]
    .toLowerCase()
    .replace(/\/+$/, '');
  return normalized === DEVOLUCIONES_INBOUND_PATH || normalized === DEVOLUCIONES_QUALITY_PATH
    ? DEVOLUCIONES_LEGACY_PATH
    : pathname;
}

export const DEVOLUCIONES_NAV_ENTRIES = [
  { path: DEVOLUCIONES_INBOUND_PATH, title: 'Inbound - Devoluciones', module: 'inbound' },
  {
    path: DEVOLUCIONES_QUALITY_PATH,
    title: 'Calidad - Pendientes de Devoluciones',
    module: 'quality'
  }
];
