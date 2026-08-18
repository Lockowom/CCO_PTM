// run_harness.cjs — PR-IAM-00B: ACCESS EQUIVALENCE HARNESS
// Compara el resolver LEGACY (hoy, snapshot-00a) contra el resolver IAM 2.0 (spec).
// Outputs (spec): loss | gain | unmapped (+ impacto a nivel de rutas).
// Uso: node run_harness.cjs
const fs = require('fs');
const path = require('path');
const { DATA, legacyPerms, iam2Perms, ALL_PERMS, ROUTES, TABS, FUNCS } = require(path.join(__dirname, '..', 'snapshot-00a', 'generar_snapshot.cjs'));

const OUT = __dirname;
function write(name, rows) { fs.writeFileSync(path.join(OUT, name), rows.join('\n') + '\n'); }

// ---- verificaciones de integridad: snapshot == resolver legacy ----
const snap = fs.readFileSync(path.join(__dirname, '..', 'snapshot-00a', 'permisos_efectivos_por_usuario.csv'), 'utf8');
const integridad = [];
for (const user of DATA.usuarios) {
  const { set, isAdmin } = legacyPerms(user);
  for (const perm of ALL_PERMS) {
    const esperado = isAdmin ? 'PERMITIDO' : (set.has(perm) ? 'PERMITIDO' : 'No asignado');
    const fila = snap.split('\n').find(l => l.startsWith(`${user.nombre},${user.rol},${perm},`));
    if (!fila) { integridad.push(`FALTA fila snapshot: ${user.nombre},${perm}`); continue; }
    const real = fila.split(',')[3];
    if (real !== esperado) integridad.push(`DIVERGE snapshot: ${user.nombre},${perm} => snapshot=${real} legacy=${esperado}`);
  }
}

// ---- loss / gain / unmapped (nivel permiso) ----
const loss = [], gain = [], unmapped = [];
for (const user of DATA.usuarios) {
  const { set: legacySet, isAdmin } = legacyPerms(user);
  const iam2Set = iam2Perms(user);
  const rolesIam2 = (DATA.iam_role_permissions || []);
  const rolCodes = new Set(rolesIam2.filter(r => [DATA].length && true).map(r => r.rol));
  for (const perm of ALL_PERMS) {
    const tieneLegacy = isAdmin || legacySet.has(perm);
    const tieneIam2 = iam2Set.has(perm);
    if (tieneLegacy && !tieneIam2) loss.push([user.nombre, perm, isAdmin ? 'Bypass ADMIN' : 'Perfil', `sin bypass en IAM2 (catalogado, ningun rol asignado lo otorga)`]);
    if (!tieneLegacy && tieneIam2) gain.push([user.nombre, perm, user.rol, 'via iam.role_permissions']);
  }
}

// ---- unmapped: permisos huerfanos, roles sin equivalente, diffs por rol ----
const tmsPermsByRole = {};
for (const r of DATA.tms_roles) tmsPermsByRole[r.nombre] = new Set(r.permisos);
const iamPermsByRole = {};
for (const x of DATA.iam_role_permissions) (iamPermsByRole[x.rol] = iamPermsByRole[x.rol] || new Set()).add(x.permiso);
const ROL_MAP = { Administrador: 'ADMIN', 'CEO PTM': 'CEO_PTM', 'Control Calidad': 'CONTROL_CALIDAD', Gerencia: 'GERENCIA', Inventario: 'INVENTARIO_', 'Operador Bodega': 'OPERADOR', 'Operario 3': 'OPERARIO_3', 'Supervisor ': 'SUPERVISOR', 'SupervisorN.v': 'SUPERVISOR_' };
for (const [tmsName, iamName] of Object.entries(ROL_MAP)) {
  const t = tmsPermsByRole[tmsName], i = iamPermsByRole[iamName] || new Set();
  for (const p of t) if (!i.has(p)) unmapped.push(['permiso', p, `solo-legacy (rol ${tmsName})`, 'IAM 2.0 perderia acceso a esta funcion para este perfil']);
  for (const p of i) if (!t.has(p)) unmapped.push(['permiso', p, `solo-iam (rol ${iamName})`, 'legacy no lo tiene; GAIN potencial para usuarios de ese perfil']);
}
for (const r of Object.keys(iamPermsByRole)) if (!Object.values(ROL_MAP).includes(r)) unmapped.push(['rol-iam-sin-legacy', r, 'IAM 2.0', 'rol no existe en tms_roles']);
for (const p of DATA.catalog) {
  const enAlguno = Object.values(tmsPermsByRole).some(s => s.has(p)) || Object.values(iamPermsByRole).some(s => s.has(p));
  if (!enAlguno) unmapped.push(['permiso-huerfano', p, 'catalog', 'ningun rol lo tiene (legacy ni IAM2)']);
}

// ---- unmapped funciones (gates sin permiso en catalog) ----
const cat = new Set(DATA.catalog);
const FUNC_UNMAPPED = [
  ['eliminar_nv', 'allowlist por EMAIL en mig 099 (admin + angelica@ptm.cl)', 'no existe permiso en catalog; IAM2 no la representa'],
  ['wms_move_stock', 'EXECUTE a authenticated sin gate (mig 174)', 'no existe permiso en catalog; IAM2 la gatea → pérdida para TODOS'],
  ['batch_update_nv_estado', 'EXECUTE a authenticated sin gate (mig 174)', 'no existe permiso en catalog; IAM2 la gatea → pérdida para TODOS'],
  ['bulk_upsert', 'allowlist de 11 tablas sin gate (mig 143)', 'no existe permiso en catalog; IAM2 la gatea → pérdida para TODOS']
];
for (const [fn, ladoLegacy, detalle] of FUNC_UNMAPPED) unmapped.push(['funcion-sin-permiso', fn, ladoLegacy, detalle]);

// ---- loss / gain a nivel FUNCION (gates RPC con o sin permiso) ----
const lossFunc = [], gainFunc = [];
for (const user of DATA.usuarios) {
  const { set: legacySet, isAdmin } = legacyPerms(user);
  const iam2Set = iam2Perms(user);
  for (const [fn, gate, via, iam2Denied] of FUNCS) {
    const okLegacy = isAdmin || gate(legacySet, user);
    const okIam2 = iam2Denied ? false : gate(iam2Set, user);
    if (okLegacy && !okIam2) lossFunc.push([user.nombre, fn, isAdmin ? 'Bypass ADMIN' : via, 'IAM2 la gatea y el usuario no tiene el permiso']);
    if (!okLegacy && okIam2) gainFunc.push([user.nombre, fn, via, 'IAM2 la habilita']);
  }
}

// ---- rutas que se rompen bajo IAM2 ----
const rutasImpacto = [];
for (const user of DATA.usuarios) {
  const { set: legacySet, isAdmin } = legacyPerms(user);
  const iam2Set = iam2Perms(user);
  for (const [route, reqs] of Object.entries(ROUTES)) {
    if (reqs[0] === 'PRIVATE_BETA' || reqs[0] === 'AUTH') continue;
    const habilitadaLegacy = isAdmin || reqs.some(r => legacySet.has(r));
    if (!habilitadaLegacy) continue;
    const viasLegacy = reqs.filter(r => legacySet.has(r));
    const habilitadaIam2 = reqs.some(r => iam2Set.has(r));
    if (!habilitadaIam2) {
      rutasImpacto.push([user.nombre, route, viasLegacy.join('|'), 'ruta se PIERDE bajo IAM2 (ningun permiso habilitante)']);
    }
  }
}
const rutasIam2Gain = [];
for (const user of DATA.usuarios) {
  const { set: legacySet, isAdmin } = legacyPerms(user);
  const iam2Set = iam2Perms(user);
  for (const [route, reqs] of Object.entries(ROUTES)) {
    if (reqs[0] === 'PRIVATE_BETA' || reqs[0] === 'AUTH') continue;
    const habilitadaLegacy = isAdmin || reqs.some(r => legacySet.has(r));
    const habilitadaIam2 = reqs.some(r => iam2Set.has(r));
    if (habilitadaIam2 && !habilitadaLegacy) rutasIam2Gain.push([user.nombre, route, iam2Set.size ? [...iam2Set].filter(r => reqs.includes(r)).join('|') : '']);
  }
}

// ---- resumen ----
const rows = [];
const perUser = {};
for (const u of DATA.usuarios) perUser[u.nombre] = { legacy: 0, iam2: 0, loss: 0, gain: 0 };
for (const u of DATA.usuarios) {
  const { set: ls, isAdmin } = legacyPerms(u);
  const i2 = iam2Perms(u);
  perUser[u.nombre].legacy = isAdmin ? ALL_PERMS.length : ls.size;
  perUser[u.nombre].iam2 = i2.size;
}
for (const [name] of loss) perUser[name].loss++;
for (const [name] of gain) perUser[name].gain++;

write('loss.csv', ['usuario,permiso,via_legacy,detalle'].concat(loss.map(l => l.join(','))));
write('gain.csv', ['usuario,permiso,rol_legacy,via_iam2'].concat(gain.map(l => l.join(','))));
write('loss_funciones.csv', ['usuario,funcion,via_legacy,detalle'].concat(lossFunc.map(l => l.join(','))));
write('gain_funciones.csv', ['usuario,funcion,via_iam2,detalle'].concat(gainFunc.map(l => l.join(','))));
write('unmapped.csv', ['categoria,codigo,lado,detalle'].concat(unmapped.map(l => l.join(','))));
write('rutas_impacto.csv', ['usuario,ruta,vias_legacy,detalle'].concat(rutasImpacto.map(l => l.join(','))));
write('rutas_ganadas_iam2.csv', ['usuario,ruta,vias_iam2'].concat(rutasIam2Gain.map(l => l.join(','))));

const resumen = [];
resumen.push('# PR-IAM-00B — Resultado del equivalence harness');
resumen.push('');
resumen.push('Fecha snapshot: ' + DATA.snapshot_fecha + ' · Usuarios: ' + DATA.usuarios.length);
resumen.push('');
resumen.push('| usuario | legacy | IAM2 | loss | gain |');
resumen.push('|---|---|---|---|---|');
for (const u of DATA.usuarios) {
  const p = perUser[u.nombre];
  resumen.push(`| ${u.nombre} | ${p.legacy} | ${p.iam2} | ${p.loss} | ${p.gain} |`);
}
resumen.push('');
resumen.push(`## Totales: loss=${loss.length} · gain=${gain.length} · unmapped=${unmapped.length} · rutas que se pierden=${rutasImpacto.length} · rutas ganadas=${rutasIam2Gain.length} · funciones-loss=${lossFunc.length} · funciones-gain=${gainFunc.length}`);
resumen.push('');
resumen.push('## Pérdida de FUNCIONES bajo IAM2 (por usuario)');
if (!lossFunc.length) resumen.push('- (ninguna)');
else {
  const porFn = {};
  for (const [u, fn] of lossFunc) (porFn[fn] = porFn[fn] || []).push(u);
  for (const [fn, users] of Object.entries(porFn)) resumen.push(`- **${fn}** → pierden ${users.length}/${DATA.usuarios.length}: ${users.join(', ')}`);
}
resumen.push('');
resumen.push('## Ganancia de FUNCIONES bajo IAM2 (por usuario)');
if (!gainFunc.length) resumen.push('- (ninguna)');
else for (const [u, fn] of gainFunc) resumen.push(`- ${u}: ${fn}`);
resumen.push('');
resumen.push('## Verificaciones de integridad (snapshot == resolver legacy)');
resumen.push(integridad.length === 0 ? '- OK: snapshot consistente.' : integridad.map(i => '- ' + i).join('\n'));
resumen.push('');
resumen.push('## Rutas que se pierden bajo IAM2 (por usuario)');
if (!rutasImpacto.length) resumen.push('- (ninguna)');
else for (const [u, r, v] of rutasImpacto) resumen.push(`- ${u}: ${r} (antes vía ${v})`);
resumen.push('');
resumen.push('## Rutas que se GANAN bajo IAM2 (por usuario)');
if (!rutasIam2Gain.length) resumen.push('- (ninguna)');
else for (const [u, r, v] of rutasIam2Gain) resumen.push(`- ${u}: ${r} (vía ${v})`);
resumen.push('');
resumen.push('## Unmapped');
for (const [cat, cod, lado, det] of unmapped) resumen.push(`- [${cat}] ${cod} — ${lado}: ${det}`);
fs.writeFileSync(path.join(OUT, 'resumen.md'), resumen.join('\n') + '\n');

console.log(resumen.join('\n'));
console.log('\n=== VERIFICACION FINAL ===');
console.log(integridad.length ? 'FALLA: ' + integridad.join('; ') : 'OK: snapshot == resolver legacy (sin divergencias)');