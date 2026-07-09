/**
 * Configuración central de módulos, rutas y permisos del Proyecto CCO.
 * Este archivo sirve como fuente de verdad para el Navbar, App.jsx, Vistas y Roles.
 */

export const APP_MODULES = [
  { id: 'dashboard', label: 'Dashboard General', section: 'core' },
  { id: 'tms', label: 'TMS Logistics', section: 'core' },
  { id: 'inbound', label: 'Inbound', section: 'wms' },
  { id: 'outbound', label: 'Outbound', section: 'wms' },
  { id: 'queries', label: 'Consultas', section: 'intelligence' },
  { id: 'quality', label: 'Calidad', section: 'intelligence' },
  { id: 'admin', label: 'Configuración', section: 'system' }
];

export const APP_ROUTES = [
  // Core
  { value: '/dashboard', label: 'Dashboard General', module: 'dashboard' },
  
  // TMS
  { value: '/tms/dashboard', label: 'TMS - Dashboard', module: 'tms' },
  { value: '/tms/planning', label: 'TMS - Planificación', module: 'tms' },
  { value: '/tms/control-tower', label: 'TMS - Torre de Control', module: 'tms' },
  { value: '/tms/yard', label: 'TMS - Gestión de Patio', module: 'tms' },
  { value: '/tms/drivers', label: 'TMS - Conductores', module: 'tms' },
  { value: '/tms/costos', label: 'TMS - Costos Transporte', module: 'tms' },
  { value: '/tms/mobile', label: 'TMS - App Móvil', module: 'tms' },
  
  // Inbound
  { value: '/inbound/reception', label: 'Inbound - Recepción', module: 'inbound' },
  { value: '/inbound/reception-nacional', label: 'Inbound - Recepción Nacionales', module: 'inbound' },
  { value: '/inbound/entry', label: 'Inbound - Putaway', module: 'inbound' },
  { value: '/inbound/cubing', label: 'Inbound - Cubicaje', module: 'inbound' },
  { value: '/inbound/data-import', label: 'Inbound - Carga Masiva', module: 'inbound' },
  
  // Outbound
  { value: '/outbound/sales-orders', label: 'Outbound - Notas de Venta', module: 'outbound' },
  { value: '/outbound/picking', label: 'Outbound - Picking', module: 'outbound' },
  { value: '/outbound/packing', label: 'Outbound - Packing', module: 'outbound' },
  { value: '/outbound/packing-tv', label: 'Outbound - Monitor Packing', module: 'outbound' },
  { value: '/outbound/shipping', label: 'Outbound - Despachos', module: 'outbound' },
  
  // Intelligence
  { value: '/queries/batches', label: 'Consultas - Lotes/Series', module: 'queries' },
  { value: '/queries/sales-status', label: 'Consultas - Estado N.V.', module: 'queries' },
  { value: '/queries/addresses', label: 'Consultas - Direcciones', module: 'queries' },
  { value: '/queries/locations', label: 'Consultas - Ubicaciones', module: 'queries' },
  { value: '/queries/heatmap', label: 'Consultas - Mapa Calor', module: 'queries' },
  { value: '/queries/historial-nv', label: 'Consultas - Historial N.V.', module: 'queries' },
  { value: '/queries/dispatch-control', label: 'Consultas - Control Despacho', module: 'queries' },
  { value: '/queries/datasheet', label: 'Consultas - Ficha Técnica', module: 'queries' },

  // Inventario
  { value: '/inventory/traspasos', label: 'Inventario - Traspasos y Ajustes', module: 'wms' },
  { value: '/inventory/conteo', label: 'Inventario - Conteo Cíclico', module: 'wms' },

  // Calidad
  { value: '/quality/monitoreo', label: 'Calidad - Monitoreo', module: 'quality' },
  { value: '/quality/acciones', label: 'Calidad - Acciones', module: 'quality' },
  { value: '/quality/bandeja', label: 'Calidad - Mi Bandeja', module: 'quality' },

  // System
  { value: '/admin/users', label: 'Admin - Usuarios', module: 'admin' },
  { value: '/admin/roles', label: 'Admin - Roles', module: 'admin' },
  { value: '/admin/views', label: 'Admin - Vistas', module: 'admin' },
  { value: '/admin/cleanup', label: 'Admin - Limpieza', module: 'admin' },
  { value: '/admin/tickets', label: 'Admin - Tickets TI', module: 'admin' },
  { value: '/admin/upload-history', label: 'Admin - Historial de Cargas', module: 'admin' },
  { value: '/admin/locations', label: 'Admin - Gestión Ubicaciones', module: 'admin' },
  { value: '/admin/bodegas-softland', label: 'Admin - Bodegas Softland', module: 'admin' },
  { value: '/admin/monitor', label: 'Admin - Monitor Tiempo Real', module: 'admin' }
];

export const APP_PERMISSIONS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    permissions: [
      { id: 'view_dashboard', label: 'Ver Dashboard Principal' },
      { id: 'view_kpis', label: 'Ver KPIs y Estadísticas' }
    ]
  },
  {
    id: 'tms',
    label: 'TMS (Transporte)',
    permissions: [
      { id: 'view_tms_dashboard', label: 'Ver Dashboard TMS' },
      { id: 'view_routes', label: 'Ver Rutas' },
      { id: 'create_routes', label: 'Planificar Rutas' },
      { id: 'view_control_tower', label: 'Ver Torre de Control' },
      { id: 'manage_control_tower', label: 'Gestionar Torre de Control' },
      { id: 'view_drivers', label: 'Ver Conductores' },
      { id: 'manage_drivers', label: 'Gestionar Conductores' },
      { id: 'view_transport_costs', label: 'Ver Costos de Transporte' },
      { id: 'view_mobile_app', label: 'Acceder App Móvil' },
      { id: 'use_mobile_app', label: 'Usar App Móvil (Entregas)' },
      { id: 'view_stock', label: 'Ver Stock (PDA)' },
      { id: 'manage_inventory', label: 'Gestionar Inventario (PDA)' },
      { id: 'view_conteo', label: 'Ver Conteo Cíclico' },
      { id: 'manage_conteo', label: 'Contar (Conteo Cíclico)' },
      { id: 'supervise_conteo', label: 'Supervisar Conteo (cerrar/ajustes)' }
    ]
  },
  {
    id: 'inbound',
    label: 'Inbound (Entrada)',
    permissions: [
      { id: 'view_entry', label: 'Ver Ingresos (Putaway)' },
      { id: 'process_entry', label: 'Procesar Ingresos' },
      { id: 'view_reception', label: 'Ver Recepción/Cubicaje' },
      { id: 'process_reception', label: 'Gestionar Recepción' },
      { id: 'manage_data_import', label: 'Carga Masiva de Datos' }
    ]
  },
  {
    id: 'outbound',
    label: 'Outbound (Salida)',
    permissions: [
      { id: 'view_sales_orders', label: 'Ver Notas de Venta' },
      { id: 'manage_sales_orders', label: 'Gestionar N.V.' },
      { id: 'view_picking', label: 'Ver Picking' },
      { id: 'process_picking', label: 'Procesar Picking' },
      { id: 'view_packing', label: 'Ver Packing' },
      { id: 'process_packing', label: 'Procesar Packing' },
      { id: 'view_packing_tv', label: 'Ver Monitor Packing TV' },
      { id: 'view_shipping', label: 'Ver Despachos' },
      { id: 'process_shipping', label: 'Gestionar Despachos' },
      { id: 'view_deliveries', label: 'Ver Entregas' },
      { id: 'manage_deliveries', label: 'Gestionar Entregas' }
    ]
  },
  {
    id: 'queries',
    label: 'Consultas',
    permissions: [
      { id: 'view_historial_nv', label: 'Ver Historial N.V.' },
      { id: 'view_dispatch_control', label: 'Control Despacho' },
      { id: 'view_batches', label: 'Ver Lotes/Series' },
      { id: 'view_sales_status', label: 'Ver Estado N.V.' },
      { id: 'view_addresses', label: 'Ver Direcciones' },
      { id: 'view_locations', label: 'Ver Ubicaciones' },
      { id: 'view_fichas', label: 'Ver Ficha Técnica' },
      { id: 'manage_fichas', label: 'Gestionar Fotos Ficha Técnica' },
      { id: 'export_data', label: 'Exportar Datos (CSV)' }
    ]
  },
  {
    id: 'quality',
    label: 'Calidad',
    permissions: [
      { id: 'manage_monitoreo', label: 'Crear/Editar Informes de Monitoreo' },
      { id: 'manage_quality', label: 'Dictaminar Calidad (Liberar/Cuarentena/Baja)' },
      { id: 'view_acciones_calidad', label: 'Ver Acciones de Calidad (tablero por área)' }
    ]
  },
  {
    id: 'admin',
    label: 'Administración',
    permissions: [
      { id: 'view_users', label: 'Ver Usuarios' },
      { id: 'manage_users', label: 'Gestionar Usuarios' },
      { id: 'view_roles', label: 'Ver Roles' },
      { id: 'manage_roles', label: 'Gestionar Roles' },
      { id: 'view_views', label: 'Ver Configuración Vistas' },
      { id: 'manage_views', label: 'Configurar Vistas/Módulos' },
      { id: 'manage_tickets', label: 'Gestionar Tickets' },
      { id: 'admin_upload_history', label: 'Historial de Cargas' },
      { id: 'admin_monitor', label: 'Monitor Tiempo Real' },
      { id: 'manage_cleanup', label: 'Limpieza de Datos' },
      { id: 'manage_locations', label: 'Gestionar Ubicaciones WMS' }
    ]
  }
];
