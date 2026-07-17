/**
 * Configuración central de módulos, rutas y permisos del Proyecto CCO.
 * Este archivo sirve como fuente de verdad para el Navbar, App.jsx, Vistas y Roles.
 */

export const APP_MODULES = [
  { id: 'inbound', label: 'Inbound', section: 'wms' },
  { id: 'inventario', label: 'Inventario (Traspasos + Conteo)', section: 'wms' },
  { id: 'queries', label: 'Consultas', section: 'intelligence' },
  { id: 'quality', label: 'Calidad', section: 'intelligence' },
  { id: 'panel', label: 'Panel PTM (Dashboard)', section: 'intelligence' },
  { id: 'postventa', label: 'Post-Venta (Servicio Técnico)', section: 'postventa' },
  { id: 'admin', label: 'Configuración', section: 'system' }
];

export const APP_ROUTES = [
  // PDA Operativa de Bodega (herramienta de bodega, ahora bajo Inventario)
  { value: '/mobile/pda', label: 'PDA Operativa (Bodega)', module: 'inventario' },

  // Inbound
  { value: '/inbound/reception', label: 'Inbound - Recepción', module: 'inbound' },
  { value: '/inbound/reception-nacional', label: 'Inbound - Recepción Nacionales', module: 'inbound' },
  { value: '/inbound/entry', label: 'Inbound - Putaway', module: 'inbound' },
  { value: '/inbound/cubing', label: 'Inbound - Cubicaje', module: 'inbound' },
  { value: '/inbound/data-import', label: 'Inbound - Carga Masiva', module: 'inbound' },
  
  // Intelligence
  { value: '/queries/batches', label: 'Consultas - Lotes/Series', module: 'queries' },
  { value: '/queries/sales-status', label: 'Consultas - Estado N.V.', module: 'queries' },
  { value: '/queries/addresses', label: 'Consultas - Direcciones', module: 'queries' },
  { value: '/queries/locations', label: 'Consultas - Ubicaciones', module: 'queries' },
  { value: '/queries/historial-nv', label: 'Consultas - Historial N.V.', module: 'queries' },
  { value: '/queries/dispatch-control', label: 'Consultas - Control Despacho', module: 'queries' },
  { value: '/queries/datasheet', label: 'Consultas - Ficha Técnica', module: 'queries' },

  // Panel PTM (nativo en CCO; el iframe de Vercel se retiró tras la migración)
  { value: '/panel', label: 'Panel PTM - Dashboard', module: 'panel' },
  { value: '/panel/ingresar', label: 'Panel PTM - Ingresar N.V.', module: 'panel' },
  { value: '/panel/info', label: 'Panel PTM - Info N.V.', module: 'panel' },
  { value: '/panel/tv', label: 'Panel PTM - Modo TV', module: 'panel' },
  { value: '/panel/builder', label: 'Panel PTM - Builder', module: 'panel' },
  { value: '/panel/configuracion', label: 'Panel PTM - Configuración (admin)', module: 'panel' },

  // Inventario
  { value: '/inventory/traspasos', label: 'Inventario - Traspasos y Ajustes', module: 'inventario' },
  // Reubicados al módulo Inventario (2026-07-10): conservan su URL histórica
  // para no romper accesos directos ni landing pages ya guardadas en roles.
  { value: '/queries/heatmap', label: 'Inventario - Mapa de Calor', module: 'inventario' },
  { value: '/admin/locations', label: 'Inventario - Gestión de Ubicaciones', module: 'inventario' },
  { value: '/inventory/conteo', label: 'Inventario - Conteo Cíclico (Contar)', module: 'inventario' },
  { value: '/inventory/conteo?tab=sesiones', label: 'Inventario - Conteo · Sesiones', module: 'inventario' },
  { value: '/inventory/conteo?tab=conciliacion', label: 'Inventario - Conteo · Conciliación', module: 'inventario' },
  { value: '/inventory/conteo?tab=ajuste', label: 'Inventario - Conteo · Ajuste ERP', module: 'inventario' },
  { value: '/inventory/conteo?tab=bloques', label: 'Inventario - Conteo · Bloques/QR', module: 'inventario' },
  { value: '/inventory/conteo?tab=proyeccion', label: 'Inventario - Conteo · Proyección', module: 'inventario' },
  { value: '/inventory/analisis', label: 'Inventario - Análisis · Resumen', module: 'inventario' },
  { value: '/inventory/analisis?tab=antiguos_disp', label: 'Inventario - Análisis · Antiguos c/Disponible', module: 'inventario' },
  { value: '/inventory/analisis?tab=no_activos_stock', label: 'Inventario - Análisis · No Activos c/Stock', module: 'inventario' },
  { value: '/inventory/analisis?tab=duplicados', label: 'Inventario - Análisis · Duplicados', module: 'inventario' },
  { value: '/inventory/analisis?tab=anomalias', label: 'Inventario - Análisis · Anomalías', module: 'inventario' },
  { value: '/inventory/analisis?tab=detalle', label: 'Inventario - Análisis · Detalle', module: 'inventario' },
  { value: '/inventory/carteles', label: 'Inventario - Carteles de Bodega', module: 'inventario' },
  { value: '/inventory/insumos', label: 'Inventario - Panel de Insumos', module: 'inventario' },

  // Calidad
  { value: '/quality/monitoreo', label: 'Calidad - Monitoreo', module: 'quality' },
  { value: '/quality/acciones', label: 'Calidad - Acciones', module: 'quality' },
  { value: '/quality/bandeja', label: 'Calidad - Mi Bandeja', module: 'quality' },

  // Post-Venta
  { value: '/postventa/tickets', label: 'Post-Venta - Tickets', module: 'postventa' },
  { value: '/postventa/tickets?tab=bandeja', label: 'Post-Venta - Bandeja Correos', module: 'postventa' },
  { value: '/postventa/tickets?tab=calendario', label: 'Post-Venta - Calendario', module: 'postventa' },
  { value: '/postventa/tickets?tab=nuevo', label: 'Post-Venta - Nuevo Ticket', module: 'postventa' },
  { value: '/postventa/tickets?tab=dashboard', label: 'Post-Venta - Dashboard', module: 'postventa' },
  { value: '/postventa/tickets?tab=tecnicos', label: 'Post-Venta - Técnicos', module: 'postventa' },

  // System
  { value: '/admin/users', label: 'Admin - Usuarios y Roles', module: 'admin' },
  { value: '/admin/roles', label: 'Admin - Roles y Permisos', module: 'admin' },
  { value: '/admin/views', label: 'Admin - Vistas', module: 'admin' },
  { value: '/admin/cleanup', label: 'Admin - Limpieza', module: 'admin' },
  { value: '/admin/tickets', label: 'Admin - Tickets TI', module: 'admin' },
  { value: '/admin/upload-history', label: 'Admin - Historial de Cargas', module: 'admin' },
  { value: '/admin/bodegas-softland', label: 'Admin - Bodegas Softland', module: 'admin' },
  { value: '/admin/monitor', label: 'Admin - Monitor Tiempo Real', module: 'admin' }
];

export const APP_PERMISSIONS = [
  {
    id: 'inventario',
    label: 'Inventario (Traspasos + Conteo Cíclico)',
    permissions: [
      // PDA Operativa de Bodega (reubicada aquí tras retirar el módulo TMS):
      { id: 'view_stock', label: 'PDA · Ver Stock' },
      { id: 'manage_inventory', label: 'PDA · Gestionar Inventario' },
      // Pantallas propias del módulo Inventario (casilla 1:1 con el menú):
      { id: 'view_traspasos', label: 'Traspasos y Ajustes' },
      { id: 'view_carteles', label: 'Carteles de Bodega' },
      { id: 'view_insumos', label: 'Panel de Insumos · Ver' },
      { id: 'manage_insumos', label: 'Panel de Insumos · Editar stock/umbrales' },
      { id: 'manage_locations', label: 'Gestionar Ubicaciones WMS (y Bodegas Softland)' },
      // Análisis de Códigos — TODO o por pestaña:
      { id: 'view_analisis', label: 'Análisis · TODAS las pestañas' },
      { id: 'analisis_tab_resumen', label: 'Análisis · Resumen' },
      { id: 'analisis_tab_antiguos', label: 'Análisis · Antiguos' },
      { id: 'analisis_tab_antiguos_disp', label: 'Análisis · Antiguos c/ Disponible' },
      { id: 'analisis_tab_no_activos', label: 'Análisis · No Activos c/ Stock' },
      { id: 'analisis_tab_duplicados', label: 'Análisis · Duplicados' },
      { id: 'analisis_tab_anomalias', label: 'Análisis · Anomalías' },
      { id: 'analisis_tab_detalle', label: 'Análisis · Detalle completo' },
      // Conteo Cíclico — nivel de acción (ver/contar/supervisar) o por pestaña:
      { id: 'view_conteo', label: 'Conteo · Ver (todas las pestañas)' },
      { id: 'manage_conteo', label: 'Conteo · Contar (acción)' },
      { id: 'supervise_conteo', label: 'Conteo · Supervisar (cerrar/ajustes)' },
      { id: 'conteo_tab_contar', label: 'Conteo · pestaña Contar' },
      { id: 'conteo_tab_sesiones', label: 'Conteo · pestaña Sesiones' },
      { id: 'conteo_tab_conciliacion', label: 'Conteo · pestaña Conciliación' },
      { id: 'conteo_tab_ajuste', label: 'Conteo · pestaña Ajuste ERP' },
      { id: 'conteo_tab_bloques', label: 'Conteo · pestaña Bloques / QR' },
      { id: 'conteo_tab_proyeccion', label: 'Conteo · pestaña Proyección' }
      // Nota: Mapa de Calor usa view_locations (grupo Consultas → Ubicaciones).
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
    id: 'panel',
    label: 'Panel PTM (Dashboard)',
    permissions: [
      { id: 'view_panel', label: 'Ver Panel PTM (Dashboard + acceso base a todo el módulo)' },
      { id: 'manage_panel', label: 'Gestionar Panel PTM (crear/editar N.V. y estados)' },
      // Control por pantalla (además del umbral view_panel, que da acceso a todo):
      { id: 'panel_ingresar', label: 'Panel · pantalla Ingresar N.V.' },
      { id: 'panel_info', label: 'Panel · pantalla Info N.V. (consulta)' },
      { id: 'panel_tv', label: 'Panel · Modo TV' },
      { id: 'panel_builder', label: 'Panel · Builder de dashboards' }
    ]
  },
  {
    id: 'postventa',
    label: 'Post-Venta (Servicio Técnico)',
    permissions: [
      { id: 'view_postventa', label: 'Ver Post-Venta (todas las pestañas)' },
      { id: 'manage_postventa', label: 'Gestionar tickets Post-Venta' },
      { id: 'supervise_postventa', label: 'Supervisar Post-Venta (cerrar/eliminar/técnicos)' },
      // Control por pestaña (visibilidad):
      { id: 'pv_tab_tickets', label: 'Post-Venta · pestaña Tickets' },
      { id: 'pv_tab_bandeja', label: 'Post-Venta · pestaña Bandeja Correos' },
      { id: 'pv_tab_calendario', label: 'Post-Venta · pestaña Calendario' },
      { id: 'pv_tab_nuevo', label: 'Post-Venta · pestaña Nuevo Ticket' },
      { id: 'pv_tab_dashboard', label: 'Post-Venta · pestaña Dashboard' },
      { id: 'pv_tab_tecnicos', label: 'Post-Venta · pestaña Técnicos' }
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
      { id: 'deploy_ota', label: 'Desplegar OTA a producción (móvil)' },
      { id: 'manage_cleanup', label: 'Limpieza de Datos' }
    ]
  }
];
