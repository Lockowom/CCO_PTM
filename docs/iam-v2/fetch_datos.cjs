// fetch_datos.cjs — PR-IAM-00B: descarga el estado real del IAM desde la Management API
// y escribe docs/iam-v2/datos_iam.json (fuente única para snapshot + harness).
// Uso: node fetch_datos.cjs
const fs = require('fs');
const path = require('path');
const TOKEN = fs.readFileSync(path.join(process.env.USERPROFILE, '.supabase', 'access-token'), 'utf8').trim();
const REF = 'vtrtyzbgpsvqwbfoudaf';
const URL = `https://api.supabase.com/v1/projects/${REF}/database/query`;
const OUT = path.join(__dirname, 'datos_iam.json');

async function q(query) {
  const res = await fetch(URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  });
  if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
  return res.json();
}

(async () => {
  const catalog = (await q('select codigo from iam.permissions order by codigo')).map(r => r.codigo);
  const tms = await q("select nombre, permisos_json from tms_roles order by nombre");
  const iamRp = await q(`select r.codigo as rol, p.codigo as permiso from iam.roles r
    join iam.role_permissions rp on rp.role_id = r.id
    join iam.permissions p on p.id = rp.permission_id order by r.codigo, p.codigo`);
  const iamUsers = await q("select id, nombre, apellido, correo from iam.users");
  const tmsUsers = await q("select id, nombre, email, rol, activo, es_admin_delegado from tms_usuarios");
  const roles = await q("select id, codigo from iam.roles order by codigo");
  const assignments = await q("select principal_id, role_id, scope_type, scope_code from iam.assignments");
  const delegations = await q("select delegador, delegado, desde, hasta, activo from iam.delegations");

  const data = {
    snapshot_fecha: '2026-08-18',
    catalog,
    tms_roles: tms.map(r => ({ nombre: r.nombre, permisos: r.permisos_json })),
    iam_role_permissions: iamRp.map(r => ({ rol: r.rol, permiso: r.permiso })),
    usuarios: tmsUsers.map(u => ({ id: u.id, nombre: u.nombre.trim(), email: u.email, rol: u.rol, activo: u.activo, es_admin_delegado: u.es_admin_delegado })),
    iam_roles: roles.map(r => ({ id: r.id, codigo: r.codigo })),
    iam_usuarios: iamUsers.map(u => ({ id: u.id, correo: u.correo })),
    assignments: assignments.map(a => ({ principal_id: a.principal_id, role_id: a.role_id, scope_type: a.scope_type, scope_code: a.scope_code })),
    delegations: delegations.map(d => ({ delegador: d.delegador, delegado: d.delegado, desde: d.desde, hasta: d.hasta, activo: d.activo }))
  };
  fs.writeFileSync(OUT, JSON.stringify(data, null, 2));
  console.log('OK -> datos_iam.json  (catalog:', data.catalog.length, '| tms_roles:', data.tms_roles.length, '| iam_roles:', data.iam_roles.length, '| usuarios:', data.usuarios.length, '| assignments:', data.assignments.length, '| delegations:', data.delegations.length, ')');
})().catch(e => { console.error(e.message); process.exit(1); });