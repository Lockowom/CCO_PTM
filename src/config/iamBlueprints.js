import { APP_PERMISSIONS } from './modules.js';

const flattenPermissions = (moduleId) => (
  APP_PERMISSIONS.find((module) => module.id === moduleId)?.permissions?.map((permission) => permission.id) || []
);

const uniq = (values) => Array.from(new Set(values));

export const ALL_PERMISSION_IDS = uniq(
  APP_PERMISSIONS.flatMap((module) => module.permissions.map((permission) => permission.id)),
);

const ANALISIS_TABS = [
  'analisis_tab_resumen',
  'analisis_tab_antiguos',
  'analisis_tab_antiguos_disp',
  'analisis_tab_no_activos',
  'analisis_tab_duplicados',
  'analisis_tab_anomalias',
  'analisis_tab_detalle',
];

const CONTEO_TABS = [
  'conteo_tab_contar',
  'conteo_tab_sesiones',
  'conteo_tab_conciliacion',
  'conteo_tab_ajuste',
  'conteo_tab_bloques',
  'conteo_tab_proyeccion',
];

const POSTVENTA_TABS = [
  'pv_tab_tickets',
  'pv_tab_bandeja',
  'pv_tab_calendario',
  'pv_tab_nuevo',
  'pv_tab_dashboard',
  'pv_tab_tecnicos',
];

export const ROLE_BLUEPRINTS = [
  {
    id: 'ADMIN',
    nombre: 'Administrador',
    descripcion: 'Administracion integral del sistema, seguridad, configuracion y soporte.',
    landingPage: '/admin/users',
    defaultTeamCode: 'ROL_ADMIN',
    scopeStrategy: 'global',
    permissions: ALL_PERMISSION_IDS,
  },
  {
    id: 'CONTROL_CALIDAD',
    nombre: 'Control Calidad',
    descripcion: 'Operacion y dictamen de calidad, inbound controlado y consulta transversal.',
    landingPage: '/quality/monitoreo',
    defaultTeamCode: 'ROL_CONTROL_CALIDAD',
    scopeStrategy: 'global',
    permissions: uniq([
      'view_entry',
      'process_entry',
      'view_reception',
      'process_reception',
      'manage_monitoreo',
      'manage_quality',
      'view_acciones_calidad',
      'view_batches',
      'view_locations',
      'view_addresses',
      'view_fichas',
      'view_carteles',
      'view_historial_nv',
      'panel_info',
      'panel_tv',
    ]),
  },
  {
    id: 'GERENCIA',
    nombre: 'Gerencia',
    descripcion: 'Vision ejecutiva con gestion amplia de panel, calidad, postventa y reportabilidad.',
    landingPage: '/panel',
    defaultTeamCode: 'ROL_GERENCIA',
    scopeStrategy: 'global',
    permissions: uniq([
      'view_entry',
      'process_entry',
      'view_reception',
      'process_reception',
      'manage_data_import',
      'view_batches',
      'view_locations',
      'view_addresses',
      'view_fichas',
      'export_data',
      'view_historial_nv',
      'view_dispatch_control',
      'view_sales_status',
      'manage_monitoreo',
      'manage_quality',
      'view_acciones_calidad',
      'view_postventa',
      'manage_postventa',
      'supervise_postventa',
      ...POSTVENTA_TABS,
      'view_panel',
      'manage_panel',
      'approve_panel_reopen_nv',
      'panel_ingresar',
      'panel_info',
      'panel_tv',
      'panel_builder',
      'view_workflows',
    ]),
  },
  {
    id: 'INVENTARIO_',
    nombre: 'Inventario',
    descripcion: 'Rol operativo de bodega extendido para inventario, recepcion y control fisico.',
    landingPage: '/inventory/traspasos',
    defaultTeamCode: 'ROL_INVENTARIO',
    scopeStrategy: 'global',
    permissions: uniq([
      'view_stock',
      'manage_inventory',
      'view_traspasos',
      'view_carteles',
      'view_insumos',
      'manage_insumos',
      'manage_locations',
      'view_analisis',
      ...ANALISIS_TABS,
      'view_conteo',
      'manage_conteo',
      ...CONTEO_TABS,
      'view_entry',
      'process_entry',
      'view_reception',
      'process_reception',
      'manage_data_import',
      'view_batches',
      'view_locations',
      'view_addresses',
    ]),
  },
  {
    id: 'OPERADOR',
    nombre: 'Operador Bodega',
    descripcion: 'Operacion diaria de bodega, consultas logisticas y herramientas de conteo.',
    landingPage: '/mobile/pda',
    defaultTeamCode: 'ROL_OPERADOR',
    scopeStrategy: 'global',
    permissions: uniq([
      'view_stock',
      'manage_inventory',
      'view_traspasos',
      'view_carteles',
      'view_insumos',
      'view_conteo',
      'manage_conteo',
      'conteo_tab_contar',
      'view_entry',
      'view_reception',
      'view_batches',
      'view_locations',
      'view_addresses',
      'view_sales_status',
    ]),
  },
  {
    id: 'OPERARIO_3',
    nombre: 'Operario 3',
    descripcion: 'Rol legacy de apoyo operativo, traspasos, recepcion, consultas y carga puntual.',
    landingPage: '/inventory/traspasos',
    defaultTeamCode: 'ROL_OPERARIO_3',
    scopeStrategy: 'global',
    permissions: uniq([
      'view_stock',
      'view_traspasos',
      'view_batches',
      'view_addresses',
      'view_locations',
      'view_entry',
      'view_reception',
      'manage_data_import',
      'view_carteles',
    ]),
  },
  {
    id: 'SUPERVISOR',
    nombre: 'Supervisor',
    descripcion: 'Jefatura operativa del panel con control de estados, reaperturas y consulta ejecutiva.',
    landingPage: '/panel/ingresar',
    defaultTeamCode: 'ROL_SUPERVISOR',
    scopeStrategy: 'global',
    permissions: uniq([
      'view_panel',
      'manage_panel',
      'approve_panel_reopen_nv',
      'panel_ingresar',
      'panel_info',
      'panel_tv',
      'view_historial_nv',
      'view_dispatch_control',
      'view_sales_status',
      'export_data',
      'view_batches',
      'view_locations',
      'view_addresses',
      'pv_tab_tickets',
      'pv_tab_dashboard',
    ]),
  },
  {
    id: 'SUPERVISOR_',
    nombre: 'Supervisor Legacy',
    descripcion: 'Supervisor legado alineado al nuevo estandar con apoyo en inbound y consultas.',
    landingPage: '/panel/ingresar',
    defaultTeamCode: 'ROL_SUPERVISOR_LEGACY',
    scopeStrategy: 'global',
    permissions: uniq([
      'view_panel',
      'manage_panel',
      'approve_panel_reopen_nv',
      'panel_ingresar',
      'panel_info',
      'panel_tv',
      'view_historial_nv',
      'view_dispatch_control',
      'view_sales_status',
      'view_entry',
      'process_entry',
      'view_reception',
      'manage_data_import',
      'view_batches',
      'view_locations',
      'view_addresses',
      'view_fichas',
    ]),
  },
];

export const ROLE_BLUEPRINTS_BY_ID = Object.fromEntries(
  ROLE_BLUEPRINTS.map((blueprint) => [blueprint.id, blueprint]),
);

export function getRoleBlueprint(roleId) {
  return ROLE_BLUEPRINTS_BY_ID[roleId] || null;
}

export function getRolePermissions(roleId) {
  return getRoleBlueprint(roleId)?.permissions || [];
}

export function listBlueprintRoleIds() {
  return ROLE_BLUEPRINTS.map((blueprint) => blueprint.id);
}

export const FRONTEND_IAM_BLUEPRINT = {
  version: '2026.07',
  source: 'frontend',
  roles: ROLE_BLUEPRINTS,
  permissionCatalog: ALL_PERMISSION_IDS,
  groupedPermissions: {
    inventario: flattenPermissions('inventario'),
    inbound: flattenPermissions('inbound'),
    queries: flattenPermissions('queries'),
    quality: flattenPermissions('quality'),
    panel: flattenPermissions('panel'),
    asistente: flattenPermissions('asistente'),
    postventa: flattenPermissions('postventa'),
    admin: flattenPermissions('admin'),
  },
};
