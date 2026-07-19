export const ROUTE_PERMISSIONS = {
  // PDA Operativa de Bodega (tool de bodega, permisos de stock/inventario)
  '/mobile/pda': ['view_stock', 'manage_inventory'],

  // TMS (Transporte) — reconstruido desde 0
  '/tms/control': ['view_tms', 'manage_tms', 'supervise_tms', 'manage_panel'],
  '/tms/pda': ['view_tms', 'manage_tms', 'manage_panel'],   // app del chofer

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

  // Inventario — Traspasos/Ajustes (módulo integrado). Visible para bodega/inventario.
  // `view_traspasos` es el permiso PROPIO (casilla en Roles); los de bodega siguen
  // dando acceso (aditivo) para no romper roles existentes.
  '/inventory/traspasos': ['view_traspasos', 'manage_inventory', 'view_stock', 'view_batches', 'view_reception'],
  // Panel PTM — dashboard externo (Next.js/Vercel) embebido en iframe. Permiso propio.
  // Panel PTM nativo (estructura portada). Control POR PANTALLA: cada pantalla
  // tiene su permiso propio (casilla en Roles) Y acepta `view_panel` como umbral
  // (quien tiene view_panel ve todo el módulo → no se rompe ningún rol existente).
  '/panel': ['view_panel'],                              // Dashboard = acceso base
  '/panel/ingresar': ['panel_ingresar', 'view_panel'],
  '/panel/info': ['panel_info', 'view_panel'],
  '/panel/tv': ['panel_tv', 'view_panel'],
  '/panel/builder': ['panel_builder', 'view_panel'],
  // Configuración (incluye Auditoría): SOLO admin. Se exige un permiso de nivel
  // admin (manage_roles); ADMIN/es_admin_delegado pasan siempre. Los usuarios con
  // solo view_panel NO ven ni acceden esta pantalla.
  '/panel/configuracion': ['manage_roles'],
  // Inventario — Conteo Cíclico (módulo integrado desde t-o-inventario).
  '/inventory/conteo': ['view_conteo', 'manage_conteo', 'supervise_conteo', 'manage_inventory',
    'conteo_tab_contar', 'conteo_tab_sesiones', 'conteo_tab_conciliacion', 'conteo_tab_ajuste', 'conteo_tab_bloques', 'conteo_tab_proyeccion'],
  // Detalle de bloque (destino del QR impreso). Ruta con parámetro: el guard
  // la resuelve con matchPath (ver ProtectedRoute en App.jsx).
  '/inventory/bloque/:codigo': ['view_conteo', 'manage_conteo', 'supervise_conteo', 'manage_inventory'],
  // Análisis de Códigos (port del Excel de actualización P/S). Mismos permisos
  // de bodega/stock; la RPC re-verifica server-side (mig 067).
  '/inventory/analisis': ['view_analisis', 'manage_inventory', 'view_stock', 'view_batches', 'manage_data_import',
    'analisis_tab_resumen', 'analisis_tab_antiguos', 'analisis_tab_antiguos_disp', 'analisis_tab_no_activos', 'analisis_tab_duplicados', 'analisis_tab_anomalias', 'analisis_tab_detalle'],
  // Carteles de bodega (impresión único/doble/cuádruple con CODE128).
  '/inventory/carteles': ['view_carteles', 'manage_inventory', 'view_stock', 'view_batches', 'view_reception'],
  // Panel de Insumos — permiso propio `view_insumos`; los de bodega/stock siguen
  // dando acceso (aditivo) para no romper roles existentes.
  '/inventory/insumos': ['view_insumos', 'manage_insumos', 'manage_inventory', 'view_stock'],

  // Calidad — Inventario también entra (hito 2: asigna SKUs a revisión; crear
  // informes/dictámenes sigue gateado en la UI por manage_monitoreo/quality).
  '/quality/monitoreo': ['manage_monitoreo', 'manage_quality', 'manage_inventory'],
  // Tablero de Acciones de Calidad: visible para las áreas responsables.
  '/quality/acciones': ['view_acciones_calidad', 'manage_quality', 'manage_monitoreo'],
  // Mi Bandeja: cada área ve directo sus tareas (mismo permiso).
  '/quality/bandeja': ['view_acciones_calidad', 'manage_quality', 'manage_monitoreo'],

  // Post-Venta / Servicio Técnico — visible para quien ve/gestiona/supervisa post-venta.
  '/postventa/tickets': ['view_postventa', 'manage_postventa', 'supervise_postventa',
    'pv_tab_tickets', 'pv_tab_bandeja', 'pv_tab_calendario', 'pv_tab_nuevo', 'pv_tab_dashboard', 'pv_tab_tecnicos'],

  // Admin
  '/admin/users': ['manage_users', 'view_users'],
  '/admin/roles': ['manage_roles', 'view_roles'],
  '/admin/views': ['manage_views', 'view_views'],
  '/admin/cleanup': ['manage_cleanup'],
  '/admin/locations': ['manage_locations'],
  '/admin/bodegas-softland': ['manage_locations'],
  '/admin/tickets': ['manage_tickets'],
  '/admin/upload-history': ['admin_upload_history'],
  '/admin/monitor': ['admin_monitor'],
  '/admin/workflows': ['view_workflows', 'manage_workflows'],
  '/admin/flujo-maestro': ['view_workflows', 'manage_workflows'],
  '/admin/eventos': ['view_eventos', 'manage_eventos'],
  '/admin/api': ['view_api', 'manage_api'],
};

// ── Permisos por PESTAÑA (?tab=) ────────────────────────────────────────────
// Los módulos con pestañas comparten una sola ruta; el guard de ruta ignora el
// ?tab. Este mapa permite control fino POR PESTAÑA: cada tab tiene su permiso
// propio. Regla RETROCOMPATIBLE: si el rol tiene un permiso "amplio" del módulo
// (`_amplios`) ve TODAS las pestañas (los roles actuales no cambian); si NO tiene
// un amplio pero sí el permiso de una pestaña, ve solo esa. Un tab sin permiso
// declarado es visible por defecto.
export const TAB_PERMISSIONS = {
  '/inventory/conteo': {
    _amplios: ['view_conteo', 'manage_conteo', 'supervise_conteo', 'manage_inventory'], _default: 'contar',
    contar: 'conteo_tab_contar', sesiones: 'conteo_tab_sesiones', conciliacion: 'conteo_tab_conciliacion',
    ajuste: 'conteo_tab_ajuste', bloques: 'conteo_tab_bloques', proyeccion: 'conteo_tab_proyeccion',
  },
  '/inventory/analisis': {
    _amplios: ['view_analisis', 'manage_inventory'], _default: 'resumen',
    resumen: 'analisis_tab_resumen', antiguos: 'analisis_tab_antiguos', antiguos_disp: 'analisis_tab_antiguos_disp',
    no_activos_stock: 'analisis_tab_no_activos', duplicados: 'analisis_tab_duplicados',
    anomalias: 'analisis_tab_anomalias', detalle: 'analisis_tab_detalle',
  },
  '/postventa/tickets': {
    _amplios: ['view_postventa', 'manage_postventa', 'supervise_postventa'], _default: 'tickets',
    tickets: 'pv_tab_tickets', bandeja: 'pv_tab_bandeja', calendario: 'pv_tab_calendario',
    nuevo: 'pv_tab_nuevo', dashboard: 'pv_tab_dashboard', tecnicos: 'pv_tab_tecnicos',
  },
};

// ¿Puede ver una pestaña? `has` = fn(permId)->bool (hasPermission). true si tiene
// un permiso amplio del módulo o el propio del tab. Módulos sin config → true.
export function puedeVerTab(has, base, tab) {
  const cfg = TAB_PERMISSIONS[String(base || '').split('?')[0]];
  if (!cfg) return true;
  if ((cfg._amplios || []).some((p) => has(p))) return true;
  const propio = cfg[tab];
  return propio ? !!has(propio) : true;
}

// La visibilidad de secciones/módulos en el Navbar se DERIVA de ROUTE_PERMISSIONS
// (una sección se muestra si el usuario puede acceder a ≥1 de sus rutas). No mantener
// una lista de permisos por sección por separado: causaba desincronización.

// ── Resolución de permisos de una URL real ──────────────────────────────────
// React Router matchea rutas ignorando mayúsculas y slash final, pero un lookup
// exacto del mapa no: "/Admin/Users/" renderizaría la página sin pasar por el
// permiso. Se normaliza el pathname y, si no hay match exacto, se prueban las
// claves parametrizadas (p.ej. '/inventory/bloque/:codigo') con matchPath.
// Devuelve undefined si la ruta NO está declarada: el guard DENIEGA por defecto
// (regla del proyecto: sin permiso definido se deniega).
import { matchPath } from 'react-router-dom';

export function permisosDeRuta(pathname) {
  const clean = (String(pathname || '').toLowerCase().replace(/\/+$/, '')) || '/';
  if (Object.prototype.hasOwnProperty.call(ROUTE_PERMISSIONS, clean)) return ROUTE_PERMISSIONS[clean];
  for (const key of Object.keys(ROUTE_PERMISSIONS)) {
    if (key.includes(':') && matchPath({ path: key, end: true }, clean)) return ROUTE_PERMISSIONS[key];
  }
  return undefined;
}

// ── Vista previa de accesos ─────────────────────────────────────────────────
// Dado el set de permisos de un rol, calcula QUÉ rutas/módulos desbloquea
// (cruzando ROUTE_PERMISSIONS con el catálogo APP_ROUTES/APP_MODULES). Alimenta
// el resumen del rol en Admin → Usuarios y Roles. Nota: las rutas del módulo
// "admin" además exigen rol ADMIN en el Navbar.
import { APP_ROUTES, APP_MODULES } from '../config/modules';

export function accesosConPermisos(permisos = []) {
  const set = new Set(permisos || []);
  const rutas = APP_ROUTES.filter((r) => {
    const req = ROUTE_PERMISSIONS[String(r.value).split('?')[0]];
    return Array.isArray(req) && req.some((p) => set.has(p));
  });
  const porModulo = {};
  rutas.forEach((r) => { (porModulo[r.module] ||= []).push(r); });
  const modulos = APP_MODULES
    .filter((m) => (porModulo[m.id] || []).length > 0)
    .map((m) => ({ id: m.id, label: m.label, rutas: porModulo[m.id], soloAdmin: m.id === 'admin' }));
  return { rutas, modulos };
}
