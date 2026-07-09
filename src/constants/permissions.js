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
  '/inventory/traspasos': ['manage_inventory', 'view_stock', 'view_batches', 'view_reception'],
  // Inventario — módulo de conteo cíclico / bloques / proyección.
  '/inventory/proyeccion': ['manage_inventory', 'view_stock', 'view_batches', 'view_reception'],
  '/inventory/bloques': ['manage_inventory', 'view_stock', 'view_batches', 'view_reception'],
  '/inventory/conteo': ['manage_inventory', 'view_stock', 'view_batches', 'view_reception'],
  '/inventory/sesiones': ['manage_inventory', 'view_stock', 'view_batches', 'view_reception'],
  '/inventory/conciliacion': ['manage_inventory', 'view_stock', 'view_batches', 'view_reception'],
  '/inventory/ajuste': ['manage_inventory', 'view_stock', 'view_batches', 'view_reception'],
  '/inventory/analisis': ['manage_inventory', 'view_stock', 'view_batches', 'view_reception'],

  // Calidad — Inventario también entra (hito 2: asigna SKUs a revisión; crear
  // informes/dictámenes sigue gateado en la UI por manage_monitoreo/quality).
  '/quality/monitoreo': ['manage_monitoreo', 'manage_quality', 'manage_inventory'],
  // Tablero de Acciones de Calidad: visible para las áreas responsables.
  '/quality/acciones': ['view_acciones_calidad', 'manage_quality', 'manage_monitoreo'],
  // Mi Bandeja: cada área ve directo sus tareas (mismo permiso).
  '/quality/bandeja': ['view_acciones_calidad', 'manage_quality', 'manage_monitoreo'],

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
  '/admin/mediciones': ['manage_mediciones'],
  '/admin/time-reports': ['view_time_reports'],
  '/admin/login-history': ['manage_users'],
};

// La visibilidad de secciones/módulos en el Navbar se DERIVA de ROUTE_PERMISSIONS
// (una sección se muestra si el usuario puede acceder a ≥1 de sus rutas). No mantener
// una lista de permisos por sección por separado: causaba desincronización.
