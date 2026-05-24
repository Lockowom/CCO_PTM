export const ROUTE_PERMISSIONS = {
  '/dashboard': ['view_dashboard'],

  // TMS
  '/tms/dashboard': ['view_tms_dashboard'],
  '/tms/planning': ['view_routes', 'create_routes'],
  '/tms/control-tower': ['view_control_tower', 'manage_control_tower'],
  '/tms/drivers': ['view_drivers', 'manage_drivers'],
  '/tms/mobile': ['view_mobile_app', 'use_mobile_app'],
  '/tms/yard': ['view_control_tower'],
  '/mobile/pda': ['view_stock', 'manage_inventory'],

  // Inbound
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

  // Admin
  '/admin/users': ['manage_users', 'view_users'],
  '/admin/roles': ['manage_roles', 'view_roles'],
  '/admin/views': ['manage_views', 'view_views'],
  '/admin/cleanup': ['manage_cleanup'],
  '/admin/tickets': ['manage_tickets'],
  '/admin/upload-history': ['admin_upload_history'],
  '/admin/mediciones': ['manage_mediciones'],
  '/admin/time-reports': ['view_time_reports'],
  '/admin/login-history': ['manage_users'],
};

export const SECTION_PERMISSIONS = {
  'tms': ['view_routes', 'view_control_tower', 'view_drivers', 'view_mobile_app', 'view_tms_dashboard'],
  'dashboard': ['view_dashboard', 'view_kpis'],
  'inbound': ['view_entry', 'manage_data_import'],
  'outbound': ['view_sales_orders', 'view_picking', 'view_packing', 'view_packing_tv', 'view_shipping'],
  'queries': ['view_batches', 'view_sales_status', 'view_addresses', 'view_locations', 'view_historial_nv', 'view_dispatch_control'],
  'admin': ['manage_users', 'manage_roles', 'manage_views', 'manage_reports', 'manage_tickets', 'admin_upload_history']
};
