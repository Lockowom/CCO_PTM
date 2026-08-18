// generar_snapshot.cjs — PR-IAM-00A: regenera el snapshot de acceso efectivo (legacy)
// desde docs/iam-v2/datos_iam.json (fuente única). Exporta el modelo compartido
// (ROUTES/TABS/FUNCS/resolvers) usado también por el harness PR-IAM-00B.
// Uso: node generar_snapshot.cjs
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const OUT = __dirname;
const DATA = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'datos_iam.json'), 'utf8').replace(/^\uFEFF/, ''));

const ROL_TMS_LEGACY = {
  ADMIN: 'Administrador', CEO_PTM: 'CEO PTM', CONTROL_CALIDAD: 'Control Calidad',
  GERENCIA: 'Gerencia', INVENTARIO_: 'Inventario', OPERADOR: 'Operador Bodega',
  OPERARIO_3: 'Operario 3', SUPERVISOR: 'Supervisor ', SUPERVISOR_: 'SupervisorN.v'
};

function iamRolesByEmail() {
  const iamRoles = new Map(DATA.iam_roles.map(r => [r.id, r.codigo]));
  const emailToId = new Map(DATA.iam_usuarios.map(u => [u.correo.toLowerCase(), u.id]));
  const byEmail = {};
  for (const a of DATA.assignments) {
    const role = iamRoles.get(a.role_id);
    if (!role) continue;
    for (const u of DATA.usuarios) {
      const uid = emailToId.get(u.email.toLowerCase());
      if (uid === a.principal_id) {
        (byEmail[u.email.toLowerCase()] = byEmail[u.email.toLowerCase()] || []).push({ role, scope_type: a.scope_type, scope_code: a.scope_code });
      }
    }
  }
  return byEmail;
}

const IAM_ROLES_BY_EMAIL = iamRolesByEmail();

function rolPermsIam(roleCode) {
  return DATA.iam_role_permissions.filter(r => r.rol === roleCode).map(r => r.permiso);
}

// RESOLVER LEGACY (hoy): tms_roles[rol] ∪ iam.role_permissions de roles asignados + bypass ADMIN
function legacyPerms(user) {
  const { rol, es_admin_delegado } = user;
  const set = new Set();
  const tms = DATA.tms_roles.find(r => r.nombre === ROL_TMS_LEGACY[rol]);
  if (tms) for (const p of tms.permisos) set.add(p);
  for (const a of IAM_ROLES_BY_EMAIL[user.email.toLowerCase()] || []) for (const p of rolPermsIam(a.role)) set.add(p);
  return { set, isAdmin: rol === 'ADMIN' || es_admin_delegado };
}

// RESOLVER IAM 2.0 (spec): solo iam.role_permissions de roles asignados, sin bypass
function iam2Perms(user) {
  const set = new Set();
  for (const a of IAM_ROLES_BY_EMAIL[user.email.toLowerCase()] || []) for (const p of rolPermsIam(a.role)) set.add(p);
  return set;
}

const ALL_PERMS = DATA.catalog.slice();

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
  '/panel/rutas': ['PRIVATE_BETA'],
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

// FUNCS: [nombre, gateLegacy, viaLegacy, iam2Denied?]
// iam2Denied = true → la funcion NO existe en el catalogo IAM2 (o su gate es allowlist legacy)
// y el resolver IAM2 SIEMPRE la deniega (hay que crear permiso nuevo y asignarlo en el plan).
const FUNCS = [
  ['guardar_nv (crear/editar N.V.)', p => p.has('manage_panel'), 'gate manage_panel', false],
  ['cambiar_estado_nv', p => p.has('manage_panel'), 'gate manage_panel', false],
  ['eliminar_nv', (p, u) => u.email === 'angelica@ptm.cl', 'allowlist individual (mig 099)', true],
  ['solicitar_reapertura_nv', p => p.has('manage_panel'), 'gate manage_panel', false],
  ['resolver_reapertura_nv', p => p.has('approve_panel_reopen_nv') || p.has('manage_roles'), 'gate approve_panel_reopen_nv|manage_roles', false],
  ['wms_move_stock', () => true, 'HALLAZGO: sin gate (authenticated)', true],
  ['batch_update_nv_estado', () => true, 'HALLAZGO: sin gate (authenticated)', true],
  ['bulk_upsert (11 tablas stock)', () => true, 'HALLAZGO: allowlist sin gate', true],
  ['ia_kpis / ia_buscar_* (Asistente)', p => p.has('view_asistente'), 'gate view_asistente', false],
  ['iam_asignar_scope / iam_*', p => p.has('manage_roles'), 'gate manage_roles', false],
  ['insumos_guardar/set_cantidad', p => p.has('manage_insumos') || p.has('manage_inventory'), 'gate manage_insumos|manage_inventory', false],
  ['monitoreo_dictaminar', p => p.has('manage_quality') || p.has('manage_monitoreo'), 'gate manage_quality|manage_monitoreo', false],
  ['pv_correos_ticket', p => p.has('view_postventa') || p.has('manage_postventa') || p.has('supervise_postventa'), 'gate view/manage/supervise_postventa', false],
  ['usuarios_bulk / guardar_usuario', p => p.has('manage_users'), 'gate manage_users', false]
];

function csv(rows) { return rows.join('\n') + '\n'; }
function write(name, rows) { fs.writeFileSync(path.join(OUT, name), csv(rows)); }

const rowsP = ['usuario,rol,permiso,estado,origen'];
const rowsR = ['usuario,rol,ruta,estado,via'];
const rowsT = ['usuario,modulo,tab,estado'];
const rowsS = ['usuario,scope_type,scope_code'];
const rowsF = ['usuario,funcion,estado,via'];

for (const user of DATA.usuarios) {
  const { set, isAdmin } = legacyPerms(user);
  const scopes = IAM_ROLES_BY_EMAIL[user.email.toLowerCase()] || [];
  const scopeRows = new Set();
  for (const a of scopes) scopeRows.add(`${a.scope_type}:${a.scope_code || ''}`);
  for (const s of scopeRows) {
    const [t, c] = s.split(':');
    rowsS.push(`${user.nombre},${t},${c}`);
  }
  for (const perm of ALL_PERMS) {
    if (isAdmin) rowsP.push(`${user.nombre},${user.rol},${perm},PERMITIDO,Bypass ADMIN`);
    else rowsP.push(`${user.nombre},${user.rol},${perm},${set.has(perm) ? 'PERMITIDO' : 'No asignado'},${set.has(perm) ? 'Perfil' : ''}`);
  }
  for (const [route, reqs] of Object.entries(ROUTES)) {
    if (reqs[0] === 'PRIVATE_BETA') { rowsR.push(`${user.nombre},${user.rol},${route},DENEGADO,Private beta (flag ON, sin rol cco_private_beta_rutas)`); continue; }
    if (reqs[0] === 'AUTH') { rowsR.push(`${user.nombre},${user.rol},${route},PERMITIDO,Autenticado`); continue; }
    if (isAdmin) { rowsR.push(`${user.nombre},${user.rol},${route},PERMITIDO,Bypass ADMIN`); continue; }
    const via = reqs.filter(r => set.has(r));
    rowsR.push(`${user.nombre},${user.rol},${route},${via.length ? 'PERMITIDO' : 'DENEGADO'},${via.length ? via.join('|') : 'No asignado'}`);
  }
  for (const [base, cfg] of Object.entries(TABS)) {
    const amplio = isAdmin || cfg.amplios.some(p => set.has(p));
    for (const [tab, perm] of Object.entries(cfg.tabs)) {
      rowsT.push(`${user.nombre},${base},${tab},${amplio || set.has(perm) ? 'PERMITIDO' : 'DENEGADO'}`);
    }
  }
  for (const [fn, gate, via] of FUNCS) {
    const ok = isAdmin || gate(set, user);
    rowsF.push(`${user.nombre},${fn},${ok ? 'PERMITIDO' : 'DENEGADO'},${ok ? (isAdmin ? 'Bypass ADMIN' : via) : 'No asignado'}`);
  }
}

write('permisos_efectivos_por_usuario.csv', rowsP);
write('rutas_efectivas_por_usuario.csv', rowsR);
write('tabs_efectivas_por_usuario.csv', rowsT);
write('scopes_por_usuario.csv', rowsS);
write('funciones_rpc_por_usuario.csv', rowsF);

const files = ['permisos_efectivos_por_usuario.csv','rutas_efectivas_por_usuario.csv','tabs_efectivas_por_usuario.csv','scopes_por_usuario.csv','funciones_rpc_por_usuario.csv'];
const hashes = [];
for (const f of files) {
  const data = fs.readFileSync(path.join(OUT, f));
  hashes.push(`${crypto.createHash('sha256').update(data).digest('hex')}  ${f}`);
}
fs.writeFileSync(path.join(OUT, 'sha256sums.txt'), hashes.join('\n') + '\n');

console.log('OK: snapshot regenerado desde datos_iam.json (' + DATA.snapshot_fecha + ')');
console.log(hashes.join('\n'));

module.exports = { DATA, ROL_TMS_LEGACY, IAM_ROLES_BY_EMAIL, legacyPerms, iam2Perms, ALL_PERMS, ROUTES, TABS, FUNCS, csv, write };