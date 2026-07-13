export const ROUTE_PERMISSIONS = {
  '/dashboard': ['view_dashboard'],

  // TMS
  '/tms/dashboard': ['view_tms_dashboard'],
  '/tms/planning': ['view_routes', 'create_routes'],
  '/tms/control-tower': ['view_control_tower', 'manage_control_tower'],
  '/tms/drivers': ['view_drivers', 'manage_drivers'],
  '/tms/mobile': ['view_mobile_app', 'use_mobile_app'],
  '/tms/yard': ['view_control_tower'],
  '/tms/costos': ['view_transport_costs'],
  '/mobile/pda': ['view_stock', 'manage_inventory'],

  // Inbound
  '/inbound/reception': ['view_reception', 'process_reception'],
  '/inbound/reception-nacional': ['view_reception', 'process_reception'],
  '/inbound/entry': ['view_entry', 'process_entry'],
  '/inbound/cubing': ['view_reception', 'process_reception'],
  '/inbound/data-import': ['manage_data_import'],

  // Outbound
  '/outbound/sales-orders': ['view_sales_orders', 'manage_sales_orders'],
  '/outbound/picking': ['view_picking', 'process_picking'],
  '/outbound/packing': ['view_packing', 'process_packing'],
  '/outbound/packing-tv': ['view_packing_tv'],
  '/outbound/shipping': ['view_shipping', 'process_shipping'],

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
  // Inventario — Conteo Cíclico (módulo integrado desde t-o-inventario).
  '/inventory/conteo': ['view_conteo', 'manage_conteo', 'supervise_conteo', 'manage_inventory'],
  // Detalle de bloque (destino del QR impreso). Ruta con parámetro: el guard
  // la resuelve con matchPath (ver ProtectedRoute en App.jsx).
  '/inventory/bloque/:codigo': ['view_conteo', 'manage_conteo', 'supervise_conteo', 'manage_inventory'],
  // Análisis de Códigos (port del Excel de actualización P/S). Mismos permisos
  // de bodega/stock; la RPC re-verifica server-side (mig 067).
  '/inventory/analisis': ['view_analisis', 'manage_inventory', 'view_stock', 'view_batches', 'manage_data_import'],
  // Carteles de bodega (impresión único/doble/cuádruple con CODE128).
  '/inventory/carteles': ['view_carteles', 'manage_inventory', 'view_stock', 'view_batches', 'view_reception'],

  // Calidad — Inventario también entra (hito 2: asigna SKUs a revisión; crear
  // informes/dictámenes sigue gateado en la UI por manage_monitoreo/quality).
  '/quality/monitoreo': ['manage_monitoreo', 'manage_quality', 'manage_inventory'],
  // Tablero de Acciones de Calidad: visible para las áreas responsables.
  '/quality/acciones': ['view_acciones_calidad', 'manage_quality', 'manage_monitoreo'],
  // Mi Bandeja: cada área ve directo sus tareas (mismo permiso).
  '/quality/bandeja': ['view_acciones_calidad', 'manage_quality', 'manage_monitoreo'],

  // Post-Venta / Servicio Técnico — visible para quien ve/gestiona/supervisa post-venta.
  '/postventa/tickets': ['view_postventa', 'manage_postventa', 'supervise_postventa'],

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
};

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
