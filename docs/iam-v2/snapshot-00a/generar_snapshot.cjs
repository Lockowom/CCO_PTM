// Generador del PR-IAM-00A (snapshot cero-pérdida) — 2026-08-18
// Computa el acceso EFECTIVO por usuario: permisos = union(legacy tms_roles.permisos_json, IAM iam.role_permissions)
// + bypass ADMIN + allowlist individual (eliminar_nv) + superficie sin gate (bulk_upsert, tier1 RLS).
// Fuentes: BD PROD (consultas Management API 2026-08-18) + src/constants/permissions.js + src/config/modules.js.
// Uso: node generar_snapshot.js  (escribe los CSVs + sha256sums.txt junto a este archivo)
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const OUT = __dirname;

const USERS = [
  ['Admin Respaldo', 'ADMIN', true, true],
  ['Administrador', 'ADMIN', true, false],
  ['ARIEL SPOLANSKY', 'CEO_PTM', true, false],
  ['Christian Vargas', 'OPERARIO_3', true, false],
  ['Cristopher', 'INVENTARIO_', false, false],
  ['Gisselle Romero', 'SUPERVISOR', false, false],
  ['Juan Carlos', 'OPERADOR', false, false],
  ['Lucas Toloza', 'OPERADOR', true, false],
  ['Marco Negroni', 'CONTROL_CALIDAD', true, false],
  ['Maria Angelica', 'SUPERVISOR_', true, false],
  ['MOISES', 'OPERADOR', false, false],
  ['NILO Langebach', 'SUPERVISOR', true, false],
  ['Oscar Leiva', 'GERENCIA', true, false],
  ['PickingBD1', 'OPERADOR', false, false],
  ['PickingBD3', 'OPERADOR', false, false],
  ['Revision', 'OPERADOR', true, false]
];
// roles extra por usuario (ej. Oscar: GERENCIA + rendiciones_oscar)
const EXTRA_ROLES = { 'Oscar Leiva': ['rendiciones_oscar'] };

const ROLE_PERMS = {
  ADMIN: ['view_stock','manage_inventory','view_traspasos','view_carteles','view_insumos','manage_insumos','manage_locations','view_analisis','analisis_tab_resumen','analisis_tab_antiguos','analisis_tab_antiguos_disp','analisis_tab_no_activos','analisis_tab_duplicados','analisis_tab_anomalias','analisis_tab_detalle','view_conteo','manage_conteo','supervise_conteo','conteo_tab_contar','conteo_tab_sesiones','conteo_tab_conciliacion','conteo_tab_ajuste','conteo_tab_bloques','conteo_tab_proyeccion','view_entry','process_entry','view_reception','process_reception','manage_data_import','view_historial_nv','view_dispatch_control','view_batches','view_sales_status','view_addresses','view_locations','view_fichas','manage_fichas','export_data','manage_monitoreo','manage_quality','view_acciones_calidad','view_panel','manage_panel','approve_panel_reopen_nv','panel_ingresar','panel_info','panel_tv','panel_builder','view_postventa','manage_postventa','supervise_postventa','pv_tab_tickets','pv_tab_bandeja','pv_tab_calendario','pv_tab_nuevo','pv_tab_dashboard','pv_tab_tecnicos','view_users','manage_users','view_roles','manage_roles','view_views','manage_views','manage_tickets','admin_upload_history','admin_monitor','deploy_ota','view_workflows','manage_workflows','view_eventos','manage_eventos','view_api','manage_api','manage_cleanup','view_rendiciones','manage_rendiciones','view_tms','manage_tms','supervise_tms'],
  CEO_PTM: ['panel_info','process_reception','view_panel','panel_tv'],
  CONTROL_CALIDAD: ['view_entry','process_entry','view_reception','process_reception','manage_monitoreo','manage_quality','view_acciones_calidad','view_batches','view_locations','view_addresses','view_fichas','view_carteles','view_historial_nv','panel_tv'],
  GERENCIA: ['view_entry','process_entry','view_reception','process_reception','manage_data_import','manage_monitoreo','manage_quality','view_acciones_calidad','view_postventa','manage_postventa','supervise_postventa','pv_tab_tickets','pv_tab_bandeja','pv_tab_calendario','pv_tab_nuevo','pv_tab_dashboard','pv_tab_tecnicos','view_panel','manage_panel','approve_panel_reopen_nv','panel_ingresar','panel_info','panel_tv','panel_builder','view_batches','view_addresses','view_locations'],
  INVENTARIO_: ['view_stock','manage_inventory','view_traspasos','view_carteles','view_insumos','manage_insumos','manage_locations','view_analisis','analisis_tab_resumen','analisis_tab_antiguos','analisis_tab_antiguos_disp','analisis_tab_no_activos','analisis_tab_duplicados','analisis_tab_anomalias','analisis_tab_detalle','view_conteo','manage_conteo','conteo_tab_contar','conteo_tab_sesiones','conteo_tab_conciliacion','conteo_tab_ajuste','conteo_tab_bloques','conteo_tab_proyeccion','view_entry','process_entry','view_reception','process_reception','manage_data_import','view_batches','view_locations','view_addresses'],
  OPERADOR: ['view_entry','view_reception','view_batches','view_locations','view_sales_status','view_carteles'],
  OPERARIO_3: ['view_batches','view_addresses','view_locations','view_entry','view_reception','manage_data_import'],
  SUPERVISOR: ['view_panel','panel_ingresar','panel_info','manage_panel'],
  SUPERVISOR_: ['view_entry','process_entry','view_reception','manage_data_import','view_carteles','view_historial_nv','view_batches','view_addresses','view_locations','manage_panel','panel_ingresar','panel_info'],
  rendiciones_oscar: ['view_rendiciones','complete_rendiciones']
};

const ALL_PERMS = ROLE_PERMS.ADMIN.concat('complete_rendiciones').filter((v, i, a) => a.indexOf(v) === i);

const ROUTES = {
  '/mobile/pda': ['view_stock','manage_inventory'],
  '/tms/control': ['view_tms','manage_tms','supervise_tms','manage_panel'],
  '/tms/pda': ['view_tms','manage_tms','manage_panel'],
  '/inbound/reception': ['view_reception','process_reception'],
  '/inbound/reception-nacional': ['view_reception','process_reception'],
  '/inbound/entry': ['view_entry','process_entry'],
  '/inbound/cubing': ['view_reception','process_reception'],
  '/inbound/data-import': ['manage_data_import'],
  '/queries/batches': ['view_batches'],
  '/queries/sales-status': ['view_sales_status'],
  '/queries/addresses': ['view_addresses'],
  '/queries/locations': ['view_locations'],
  '/queries/heatmap': ['view_locations'],
  '/queries/historial-nv': ['view_historial_nv'],
  '/queries/dispatch-control': ['view_dispatch_control'],
  '/queries/datasheet': ['view_fichas'],
  '/queries/grupo': ['view_batches','view_fichas','view_stock','manage_inventory','view_sales_status'],
  '/inventory/traspasos': ['view_traspasos','manage_inventory','view_stock','view_batches','view_reception'],
  '/panel': ['view_panel','manage_panel'],
  '/panel/ingresar': ['panel_ingresar','manage_panel'],
  '/panel/reaperturas': ['approve_panel_reopen_nv','manage_roles'],
  '/panel/info': ['panel_info','manage_panel'],
  '/panel/tv': ['panel_tv','manage_panel'],
  '/panel/builder': ['panel_builder','manage_panel'],
  '/panel/rutas': ['PRIVATE_BETA'], // flag ON; sin rol cco_private_beta_rutas nadie entra
  '/panel/configuracion': ['manage_roles'],
  '/inventory/conteo': ['view_conteo','manage_conteo','supervise_conteo','manage_inventory'],
  '/inventory/bloque/:codigo': ['view_conteo','manage_conteo','supervise_conteo','manage_inventory'],
  '/inventory/analisis': ['view_analisis','manage_inventory','view_stock','view_batches','manage_data_import'],
  '/inventory/carteles': ['view_carteles','manage_inventory','view_stock','view_batches','view_reception'],
  '/inventory/insumos': ['view_insumos','manage_insumos','manage_inventory','view_stock'],
  '/quality/monitoreo': ['manage_monitoreo','manage_quality','manage_inventory'],
  '/quality/acciones': ['view_acciones_calidad','manage_quality','manage_monitoreo'],
  '/quality/bandeja': ['view_acciones_calidad','manage_quality','manage_monitoreo'],
  '/quality/clasificacion': ['manage_quality','manage_monitoreo'],
  '/postventa/tickets': ['view_postventa','manage_postventa','supervise_postventa'],
  '/seguridad': ['AUTH'],
  '/admin/users': ['manage_users','view_users'],
  '/admin/roles': ['manage_roles','view_roles'],
  '/admin/views': ['manage_views','view_views'],
  '/admin/cleanup': ['manage_cleanup'],
  '/admin/locations': ['manage_locations'],
  '/admin/location-requests': ['manage_locations'],
  '/admin/bodegas-softland': ['manage_locations'],
  '/admin/tickets': ['manage_tickets'],
  '/admin/upload-history': ['admin_upload_history'],
  '/admin/monitor': ['admin_monitor'],
  '/admin/observability': ['admin_monitor'],
  '/admin/workflows': ['view_workflows','manage_workflows'],
  '/admin/flujo-maestro': ['view_workflows','manage_workflows'],
  '/admin/eventos': ['view_eventos','manage_eventos'],
  '/admin/api': ['view_api','manage_api'],
  '/admin/rendiciones': ['view_rendiciones','manage_rendiciones']
};

const TABS = {
  '/inventory/conteo': { amplios: ['view_conteo','manage_conteo','supervise_conteo','manage_inventory'], def: 'contar', tabs: { contar: 'conteo_tab_contar', sesiones: 'conteo_tab_sesiones', conciliacion: 'conteo_tab_conciliacion', ajuste: 'conteo_tab_ajuste', bloques: 'conteo_tab_bloques', proyeccion: 'conteo_tab_proyeccion' } },
  '/inventory/analisis': { amplios: ['view_analisis','manage_inventory'], def: 'resumen', tabs: { resumen: 'analisis_tab_resumen', antiguos: 'analisis_tab_antiguos', antiguos_disp: 'analisis_tab_antiguos_disp', no_activos_stock: 'analisis_tab_no_activos', duplicados: 'analisis_tab_duplicados', anomalias: 'analisis_tab_anomalias', detalle: 'analisis_tab_detalle' } },
  '/postventa/tickets': { amplios: ['view_postventa','manage_postventa','supervise_postventa'], def: 'tickets', tabs: { tickets: 'pv_tab_tickets', bandeja: 'pv_tab_bandeja', calendario: 'pv_tab_calendario', nuevo: 'pv_tab_nuevo', dashboard: 'pv_tab_dashboard', tecnicos: 'pv_tab_tecnicos' } }
};

const FUNCS = [
  ['guardar_nv (crear/editar N.V.)', p => p.has('manage_panel'), 'gate manage_panel'],
  ['cambiar_estado_nv', p => p.has('manage_panel'), 'gate manage_panel'],
  ['eliminar_nv', (p, u) => u === 'Maria Angelica', 'allowlist individual (mig 099)'],
  ['solicitar_reapertura_nv', p => p.has('manage_panel'), 'gate manage_panel'],
  ['resolver_reapertura_nv', p => p.has('approve_panel_reopen_nv') || p.has('manage_roles'), 'gate approve_panel_reopen_nv|manage_roles'],
  ['wms_move_stock', () => true, 'HALLAZGO: sin gate (authenticated)'],
  ['batch_update_nv_estado', () => true, 'HALLAZGO: sin gate (authenticated)'],
  ['bulk_upsert (11 tablas stock)', () => true, 'HALLAZGO: allowlist sin gate'],
  ['ia_kpis / ia_buscar_* (Asistente)', p => p.has('view_asistente'), 'gate view_asistente'],
  ['iam_asignar_scope / iam_*', p => p.has('manage_roles'), 'gate manage_roles'],
  ['insumos_guardar/set_cantidad', p => p.has('manage_insumos') || p.has('manage_inventory'), 'gate manage_insumos|manage_inventory'],
  ['monitoreo_dictaminar', p => p.has('manage_quality') || p.has('manage_monitoreo'), 'gate manage_quality|manage_monitoreo'],
  ['pv_correos_ticket', p => p.has('view_postventa') || p.has('manage_postventa') || p.has('supervise_postventa'), 'gate view/manage/supervise_postventa'],
  ['usuarios_bulk / guardar_usuario', p => p.has('manage_users'), 'gate manage_users']
];

function effectivePerms(name, rol) {
  const roles = [rol].concat(EXTRA_ROLES[name] || []);
  const set = new Set();
  let origen = 'Perfil';
  for (const r of roles) for (const p of ROLE_PERMS[r] || []) set.add(p);
  const isAdmin = rol === 'ADMIN';
  return { set, isAdmin, origen };
}

function csvRows(rows) { return rows.join('\n') + '\n'; }

// 1) permisos efectivos por usuario (80 filas por usuario, explícito PERMITIDO/No asignado)
const rowsP = ['usuario,rol,permiso,estado,origen'];
for (const [name, rol, activo, delegado] of USERS) {
  const { set, isAdmin } = effectivePerms(name, rol);
  for (const perm of ALL_PERMS) {
    if (isAdmin) rowsP.push(`${name},${rol},${perm},PERMITIDO,Bypass ADMIN`);
    else rowsP.push(`${name},${rol},${perm},${set.has(perm) ? 'PERMITIDO' : 'No asignado'},${set.has(perm) ? 'Perfil' : ''}`);
  }
}
fs.writeFileSync(path.join(OUT, 'permisos_efectivos_por_usuario.csv'), csvRows(rowsP));

// 2) rutas efectivas por usuario
const rowsR = ['usuario,rol,ruta,estado,via'];
for (const [name, rol, activo, delegado] of USERS) {
  const { set, isAdmin } = effectivePerms(name, rol);
  for (const [route, reqs] of Object.entries(ROUTES)) {
    if (reqs[0] === 'PRIVATE_BETA') { rowsR.push(`${name},${rol},${route},DENEGADO,Private beta (flag ON, sin rol cco_private_beta_rutas)`); continue; }
    if (reqs[0] === 'AUTH') { rowsR.push(`${name},${rol},${route},PERMITIDO,Autenticado`); continue; }
    if (isAdmin) { rowsR.push(`${name},${rol},${route},PERMITIDO,Bypass ADMIN`); continue; }
    const via = reqs.filter(r => set.has(r));
    rowsR.push(`${name},${rol},${route},${via.length ? 'PERMITIDO' : 'DENEGADO'},${via.length ? via.join('|') : 'No asignado'}`);
  }
}
fs.writeFileSync(path.join(OUT, 'rutas_efectivas_por_usuario.csv'), csvRows(rowsR));

// 3) tabs efectivos por usuario
const rowsT = ['usuario,modulo,tab,estado'];
for (const [name, rol, activo, delegado] of USERS) {
  const { set, isAdmin } = effectivePerms(name, rol);
  for (const [base, cfg] of Object.entries(TABS)) {
    const amplio = isAdmin || cfg.amplios.some(p => set.has(p));
    for (const [tab, perm] of Object.entries(cfg.tabs)) {
      rowsT.push(`${name},${base},${tab},${amplio || set.has(perm) ? 'PERMITIDO' : 'DENEGADO'}`);
    }
  }
}
fs.writeFileSync(path.join(OUT, 'tabs_efectivas_por_usuario.csv'), csvRows(rowsT));

// 4) scopes por usuario
const SCOPES = {
  'Admin Respaldo': ['global'], 'Administrador': ['global'], 'ARIEL SPOLANSKY': ['global'],
  'Christian Vargas': ['global'], 'Cristopher': ['global'], 'Gisselle Romero': ['global'],
  'Juan Carlos': ['global'], 'Lucas Toloza': ['global'], 'Marco Negroni': ['global'],
  'Maria Angelica': ['global', 'bodega:100'], 'MOISES': ['global'], 'NILO Langebach': ['global'],
  'Oscar Leiva': ['global'], 'PickingBD1': ['global'], 'PickingBD3': ['global'], 'Revision': ['global']
};
const rowsS = ['usuario,scope_type,scope_code'];
for (const [name, scopes] of Object.entries(SCOPES)) for (const s of scopes) {
  const [t, c] = s.split(':');
  rowsS.push(`${name},${t},${c || ''}`);
}
fs.writeFileSync(path.join(OUT, 'scopes_por_usuario.csv'), csvRows(rowsS));

// 5) funciones RPC por usuario
const rowsF = ['usuario,funcion,estado,via'];
for (const [name, rol, activo, delegado] of USERS) {
  const { set, isAdmin } = effectivePerms(name, rol);
  for (const [fn, gate, via] of FUNCS) {
    const ok = isAdmin || gate(set, name);
    rowsF.push(`${name},${fn},${ok ? 'PERMITIDO' : 'DENEGADO'},${ok ? (isAdmin ? 'Bypass ADMIN' : via) : 'No asignado'}`);
  }
}
fs.writeFileSync(path.join(OUT, 'funciones_rpc_por_usuario.csv'), csvRows(rowsF));

// 6) hash del snapshot
const files = ['permisos_efectivos_por_usuario.csv','rutas_efectivas_por_usuario.csv','tabs_efectivas_por_usuario.csv','scopes_por_usuario.csv','funciones_rpc_por_usuario.csv'];
const hashes = [];
for (const f of files) {
  const data = fs.readFileSync(path.join(OUT, f));
  hashes.push(`${crypto.createHash('sha256').update(data).digest('hex')}  ${f}`);
}
fs.writeFileSync(path.join(OUT, 'sha256sums.txt'), hashes.join('\n') + '\n');

console.log('OK: ' + files.length + ' CSVs + sha256sums.txt');
console.log(hashes.join('\n'));