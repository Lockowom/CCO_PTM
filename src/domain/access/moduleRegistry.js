export const MODULE_REGISTRY = [
  {
    id: 'panel',
    label: 'Panel PTM',
    group: 'intelligence',
    description: 'Dashboard de operaciones N.V. + Ingresar/Info + TV + Builder',
    active: true,
    mobileEnabled: false,
    privateBeta: false,
    sortOrder: 10,
    owner: 'PTM'
  },
  {
    id: 'inbound',
    label: 'Inbound (Entrada)',
    group: 'wms',
    description: 'Recepción, recepción nacional, putaway, cubicaje y carga masiva',
    active: true,
    mobileEnabled: false,
    privateBeta: false,
    sortOrder: 20,
    owner: 'Bodega'
  },
  {
    id: 'inventario',
    label: 'Inventario',
    group: 'wms',
    description:
      'PDA operativa, traspasos, mapa de calor, ubicaciones, conteo, análisis, carteles, insumos',
    active: true,
    mobileEnabled: true,
    privateBeta: false,
    sortOrder: 30,
    owner: 'Bodega'
  },
  {
    id: 'queries',
    label: 'Consultas',
    group: 'intelligence',
    description:
      'Lotes/Series, estado N.V., direcciones, ubicaciones, historial, control despacho, ficha técnica, grupo SKU',
    active: true,
    mobileEnabled: false,
    privateBeta: false,
    sortOrder: 40,
    owner: 'Bodega'
  },
  {
    id: 'quality',
    label: 'Calidad',
    group: 'intelligence',
    description: 'Monitoreo, acciones, bandeja y clasificación de calidad',
    active: true,
    mobileEnabled: false,
    privateBeta: false,
    sortOrder: 50,
    owner: 'Calidad'
  },
  {
    id: 'postventa',
    label: 'Post-Venta',
    group: 'postventa',
    description:
      'Tickets de servicio técnico (tabs: tickets, bandeja, calendario, nuevo, dashboard, técnicos)',
    active: true,
    mobileEnabled: false,
    privateBeta: false,
    sortOrder: 60,
    owner: 'Post-Venta'
  },
  {
    id: 'routes',
    label: 'Coordinación de Rutas',
    group: 'intelligence',
    description:
      'Ruta /panel/rutas en PRIVATE BETA (flag ON, sin rol cco_private_beta_rutas: nadie accede)',
    active: false,
    mobileEnabled: false,
    privateBeta: true,
    sortOrder: 70,
    owner: 'PTM'
  },
  {
    id: 'tms',
    label: 'TMS (Transporte)',
    group: 'wms',
    description:
      'Torre de control y PDA de chofer. OCULTO (módulo no operativo); rutas y permisos vivos',
    active: false,
    mobileEnabled: true,
    privateBeta: false,
    sortOrder: 80,
    owner: 'Transporte'
  },
  {
    id: 'asistente',
    label: 'Asistente IA',
    group: 'intelligence',
    description: 'Widget global de chat sobre datos (solo lectura), sin ruta ni menú',
    active: true,
    mobileEnabled: true,
    privateBeta: false,
    sortOrder: 90,
    owner: 'CCO'
  },
  {
    id: 'admin',
    label: 'Configuración',
    group: 'system',
    description:
      'Usuarios, roles, vistas, cleanup, tickets, monitor, workflows, eventos, API, rendiciones',
    active: true,
    mobileEnabled: false,
    privateBeta: false,
    sortOrder: 100,
    owner: 'CCO'
  }
];
