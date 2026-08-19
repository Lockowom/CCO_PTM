export const ROUTE_PERMISSIONS = {
  // PDA Operativa de Bodega (tool de bodega, permisos de stock/inventario)
  '/mobile/pda': ['view_stock', 'manage_inventory'],

  // TMS (Transporte) â€” reconstruido desde 0
  '/tms/control': ['view_tms', 'manage_tms', 'supervise_tms', 'manage_panel'],
  '/tms/pda': ['view_tms', 'manage_tms', 'manage_panel'], // app del chofer

  // Inbound
  '/inbound/reception': ['view_reception', 'process_reception'],
  '/inbound/reception-nacional': ['view_reception', 'process_reception'],
  '/inbound/entry': ['view_entry', 'process_entry'],
  '/inbound/cubing': ['view_reception', 'process_reception'],
  '/inbound/data-import': ['manage_data_import'],

  // Queries
  '/queries/batches': ['view_batches'],
  '/queries/sales-status': ['view_sales_status'],
  '/queries/addresses': ['view_addresses'],
  '/queries/locations': ['view_locations'],
  '/queries/heatmap': ['view_locations'],
  '/queries/historial-nv': ['view_historial_nv'],
  '/queries/dispatch-control': ['view_dispatch_control'],
  '/queries/datasheet': ['view_fichas'],
  '/queries/grupo': [
    'view_batches',
    'view_fichas',
    'view_stock',
    'manage_inventory',
    'view_sales_status'
  ],

  // Inventario â€” Traspasos/Ajustes (mÃ³dulo integrado). Visible para bodega/inventario.
  // `view_traspasos` es el permiso PROPIO (casilla en Roles); los de bodega siguen
  // dando acceso (aditivo) para no romper roles existentes.
  '/inventory/traspasos': [
    'view_traspasos',
    'manage_inventory',
    'view_stock',
    'view_batches',
    'view_reception'
  ],
  // Panel PTM nativo. `view_panel` autoriza exclusivamente el Dashboard; cada
  // pantalla restante exige su permiso propio. `manage_panel` mantiene el acceso
  // operativo completo para los responsables del mÃ³dulo.
  '/panel': ['view_panel', 'manage_panel'], // Dashboard
  '/panel/ingresar': ['panel_ingresar', 'manage_panel'],
  '/panel/reaperturas': ['approve_panel_reopen_nv', 'manage_roles'],
  '/panel/info': ['panel_info', 'manage_panel'],
  '/panel/tv': ['panel_tv', 'manage_panel'],
  '/panel/builder': ['panel_builder', 'manage_panel'],
  '/panel/rutas': ['manage_panel'],
  // ConfiguraciÃ³n (incluye AuditorÃ­a): SOLO admin. Se exige un permiso de nivel
  // admin (manage_roles); ADMIN/es_admin_delegado pasan siempre. Los usuarios con
  // solo view_panel NO ven ni acceden esta pantalla.
  '/panel/configuracion': ['manage_roles'],
  // Inventario â€” Conteo CÃ­clico (mÃ³dulo integrado desde t-o-inventario).
  '/inventory/conteo': [
    'view_conteo',
    'manage_conteo',
    'supervise_conteo',
    'manage_inventory',
    'conteo_tab_contar',
    'conteo_tab_sesiones',
    'conteo_tab_conciliacion',
    'conteo_tab_ajuste',
    'conteo_tab_bloques',
    'conteo_tab_proyeccion'
  ],
  // Detalle de bloque (destino del QR impreso). Ruta con parÃ¡metro: el guard
  // la resuelve con matchPath (ver ProtectedRoute en App.jsx).
  '/inventory/bloque/:codigo': [
    'view_conteo',
    'manage_conteo',
    'supervise_conteo',
    'manage_inventory'
  ],
  // AnÃ¡lisis de CÃ³digos (port del Excel de actualizaciÃ³n P/S). Mismos permisos
  // de bodega/stock; la RPC re-verifica server-side (mig 067).
  '/inventory/analisis': [
    'view_analisis',
    'manage_inventory',
    'view_stock',
    'view_batches',
    'manage_data_import',
    'analisis_tab_resumen',
    'analisis_tab_antiguos',
    'analisis_tab_antiguos_disp',
    'analisis_tab_no_activos',
    'analisis_tab_duplicados',
    'analisis_tab_anomalias',
    'analisis_tab_detalle'
  ],
  // Carteles de bodega (impresiÃ³n Ãºnico/doble/cuÃ¡druple con CODE128).
  '/inventory/carteles': [
    'view_carteles',
    'manage_inventory',
    'view_stock',
    'view_batches',
    'view_reception'
  ],
  // Panel de Insumos â€” permiso propio `view_insumos`; los de bodega/stock siguen
  // dando acceso (aditivo) para no romper roles existentes.
  '/inventory/insumos': ['view_insumos', 'manage_insumos', 'manage_inventory', 'view_stock'],

  // Calidad â€” Inventario tambiÃ©n entra (hito 2: asigna SKUs a revisiÃ³n; crear
  // informes/dictÃ¡menes sigue gateado en la UI por manage_monitoreo/quality).
  '/quality/monitoreo': ['manage_monitoreo', 'manage_quality', 'manage_inventory'],
  // Tablero de Acciones de Calidad: visible para las Ã¡reas responsables.
  '/quality/acciones': ['view_acciones_calidad', 'manage_quality', 'manage_monitoreo'],
  // Mi Bandeja: cada Ã¡rea ve directo sus tareas (mismo permiso).
  '/quality/bandeja': ['view_acciones_calidad', 'manage_quality', 'manage_monitoreo'],
  '/quality/clasificacion': ['manage_quality', 'manage_monitoreo'],

  // Post-Venta / Servicio TÃ©cnico â€” visible para quien ve/gestiona/supervisa post-venta.
  '/postventa/tickets': [
    'view_postventa',
    'manage_postventa',
    'supervise_postventa',
    'pv_tab_tickets',
    'pv_tab_bandeja',
    'pv_tab_calendario',
    'pv_tab_nuevo',
    'pv_tab_dashboard',
    'pv_tab_tecnicos'
  ],

  // Seguridad de la cuenta propia (MFA): cualquier usuario autenticado.
  // [] = sin permiso especÃ­fico â†’ el guard concede a todo usuario logueado.
  '/seguridad': [],

  // Admin
  '/admin/users': ['manage_users', 'view_users'],
  '/admin/access': ['view_users', 'manage_users'],
  '/admin/roles': ['manage_roles', 'view_roles'],
  '/admin/views': ['manage_views', 'view_views'],
  '/admin/cleanup': ['manage_cleanup'],
  '/admin/locations': ['manage_locations'],
  '/admin/location-requests': ['manage_locations'],
  '/admin/bodegas-softland': ['manage_locations'],
  '/admin/tickets': ['manage_tickets'],
  '/admin/upload-history': ['admin_upload_history'],
  '/admin/monitor': ['admin_monitor'],
  '/admin/observability': ['admin_monitor'],
  '/admin/workflows': ['view_workflows', 'manage_workflows'],
  '/admin/flujo-maestro': ['view_workflows', 'manage_workflows'],
  '/admin/eventos': ['view_eventos', 'manage_eventos'],
  '/admin/api': ['view_api', 'manage_api'],
  '/admin/rendiciones': ['view_rendiciones', 'manage_rendiciones']
};

// Piloto privado (PR-015B): Coordinación de Rutas es un módulo en PRIVATE BETA.
// Se migró del antiguo allowlist por UUID hardcodeado (PRIVATE_ROUTE_COORDINATOR_AUTH_UID)
// al patrón transversal: feature flag + rol IAM + permiso. El acceso se resuelve en
// `privateBeta.js` (evaluatePrivateBetaAccess). NOTA: ni ADMIN abre la beta por sí solo.
import { PRIVATE_BETA_MODULES, privateBetaForPath, evaluatePrivateBetaAccess } from './privateBeta';

export const puedeVerCoordinacionRutas = (user, hasPermission, roles = []) => {
  const cfg = PRIVATE_BETA_MODULES.rutas;
  const { allowed } = evaluatePrivateBetaAccess(cfg, {
    hasPermission,
    roles
  });
  return allowed;
};

// â”€â”€ Permisos por PESTAÃ‘A (?tab=) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Los mÃ³dulos con pestaÃ±as comparten una sola ruta; el guard de ruta ignora el
// ?tab. Este mapa permite control fino POR PESTAÃ‘A: cada tab tiene su permiso
// propio. Regla RETROCOMPATIBLE: si el rol tiene un permiso "amplio" del mÃ³dulo
// (`_amplios`) ve TODAS las pestaÃ±as (los roles actuales no cambian); si NO tiene
// un amplio pero sÃ­ el permiso de una pestaÃ±a, ve solo esa. Un tab sin permiso
// declarado es visible por defecto.
export const TAB_PERMISSIONS = {
  '/inventory/conteo': {
    _amplios: ['view_conteo', 'manage_conteo', 'supervise_conteo', 'manage_inventory'],
    _default: 'contar',
    contar: 'conteo_tab_contar',
    sesiones: 'conteo_tab_sesiones',
    conciliacion: 'conteo_tab_conciliacion',
    ajuste: 'conteo_tab_ajuste',
    bloques: 'conteo_tab_bloques',
    proyeccion: 'conteo_tab_proyeccion'
  },
  '/inventory/analisis': {
    _amplios: ['view_analisis', 'manage_inventory'],
    _default: 'resumen',
    resumen: 'analisis_tab_resumen',
    antiguos: 'analisis_tab_antiguos',
    antiguos_disp: 'analisis_tab_antiguos_disp',
    no_activos_stock: 'analisis_tab_no_activos',
    duplicados: 'analisis_tab_duplicados',
    anomalias: 'analisis_tab_anomalias',
    detalle: 'analisis_tab_detalle'
  },
  '/postventa/tickets': {
    _amplios: ['view_postventa', 'manage_postventa', 'supervise_postventa'],
    _default: 'tickets',
    tickets: 'pv_tab_tickets',
    bandeja: 'pv_tab_bandeja',
    calendario: 'pv_tab_calendario',
    nuevo: 'pv_tab_nuevo',
    dashboard: 'pv_tab_dashboard',
    tecnicos: 'pv_tab_tecnicos'
  }
};

// Â¿Puede ver una pestaÃ±a? `has` = fn(permId)->bool (hasPermission). true si tiene
// un permiso amplio del mÃ³dulo o el propio del tab. MÃ³dulos sin config â†’ true.
export function puedeVerTab(has, base, tab) {
  const cfg = TAB_PERMISSIONS[String(base || '').split('?')[0]];
  if (!cfg) return true;
  if ((cfg._amplios || []).some((p) => has(p))) return true;
  const propio = cfg[tab];
  return propio ? !!has(propio) : true;
}

// La visibilidad de secciones/mÃ³dulos en el Navbar se DERIVA de ROUTE_PERMISSIONS
// (una secciÃ³n se muestra si el usuario puede acceder a â‰¥1 de sus rutas). No mantener
// una lista de permisos por secciÃ³n por separado: causaba desincronizaciÃ³n.

// â”€â”€ ResoluciÃ³n de permisos de una URL real â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// React Router matchea rutas ignorando mayÃºsculas y slash final, pero un lookup
// exacto del mapa no: "/Admin/Users/" renderizarÃ­a la pÃ¡gina sin pasar por el
// permiso. Se normaliza el pathname y, si no hay match exacto, se prueban las
// claves parametrizadas (p.ej. '/inventory/bloque/:codigo') con matchPath.
// Devuelve undefined si la ruta NO estÃ¡ declarada: el guard DENIEGA por defecto
// (regla del proyecto: sin permiso definido se deniega).
import { matchPath } from 'react-router-dom';

export function permisosDeRuta(pathname) {
  const clean =
    String(pathname || '')
      .toLowerCase()
      .replace(/\/+$/, '') || '/';
  if (Object.prototype.hasOwnProperty.call(ROUTE_PERMISSIONS, clean))
    return ROUTE_PERMISSIONS[clean];
  for (const key of Object.keys(ROUTE_PERMISSIONS)) {
    if (key.includes(':') && matchPath({ path: key, end: true }, clean))
      return ROUTE_PERMISSIONS[key];
  }
  return undefined;
}

// DecisiÃ³n compartida por el guard, el login y los enlaces de inicio. Evita que
// un deep-link guardado antes de cambiar un rol devuelva al usuario a una ruta
// que ya no tiene autorizada.
export function puedeAccederRuta(pathname, user, hasPermission, roles = []) {
  const clean = String(pathname || '/').split('?')[0] || '/';
  if (clean === '/') return true;
  // PR-015B: módulos en private beta se evalúan con flag + rol IAM + permiso.
  // Si el flag está OFF el acceso es false → el guard renderiza 404 (no existe).
  const beta = privateBetaForPath(clean);
  if (beta) {
    const { allowed } = evaluatePrivateBetaAccess(beta, { hasPermission, roles });
    return allowed;
  }
  const required = permisosDeRuta(clean);
  // Fail-closed: si la ruta no está declarada en ROUTE_PERMISSIONS, se deniega
  // SIEMPRE (incluso para ADMIN). El bypass de admin solo abre rutas REALES.
  if (!Array.isArray(required)) return false;
  if (user?.rol === 'ADMIN' || user?.es_admin_delegado === true) return true;
  return required.length === 0 || required.some((permission) => hasPermission(permission));
}

// â”€â”€ Vista previa de accesos â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Dado el set de permisos de un rol, calcula QUÃ‰ rutas/mÃ³dulos desbloquea
// (cruzando ROUTE_PERMISSIONS con el catÃ¡logo APP_ROUTES/APP_MODULES). Alimenta
// el resumen del rol en Admin â†’ Usuarios y Roles. Nota: las rutas del mÃ³dulo
// "admin" ademÃ¡s exigen rol ADMIN en el Navbar.
import { APP_ROUTES, APP_MODULES } from '../config/modules';

export function accesosConPermisos(permisos = []) {
  const set = new Set(permisos || []);
  const rutas = APP_ROUTES.filter((r) => {
    const req = ROUTE_PERMISSIONS[String(r.value).split('?')[0]];
    return Array.isArray(req) && req.some((p) => set.has(p));
  });
  const porModulo = {};
  rutas.forEach((r) => {
    (porModulo[r.module] ||= []).push(r);
  });
  const modulos = APP_MODULES.filter((m) => (porModulo[m.id] || []).length > 0).map((m) => ({
    id: m.id,
    label: m.label,
    rutas: porModulo[m.id],
    soloAdmin: m.id === 'admin'
  }));
  return { rutas, modulos };
}

// Resuelve una pÃ¡gina inicial vÃ¡lida usando el catÃ¡logo completo de pantallas.
// Al agregar una ruta a APP_ROUTES, cualquier rol nuevo puede aterrizar allÃ­
// automÃ¡ticamente sin mantener otra lista manual en el router.
export function resolverRutaInicial(permisos = [], preferida = '') {
  const { rutas } = accesosConPermisos(permisos);
  if (rutas.length === 0) return null;

  const preferred = String(preferida || '');
  if (preferred) {
    const preferredPath = preferred.split('?')[0];
    const permitted = rutas.some((route) => {
      const routePath = String(route.value || '').split('?')[0];
      return route.value === preferred || routePath === preferredPath;
    });
    if (permitted) return preferred;
  }

  return rutas[0].value;
}
