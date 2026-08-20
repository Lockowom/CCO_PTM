import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const outDir = path.join(root, 'docs', 'cco2');
fs.mkdirSync(outDir, { recursive: true });

const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const walk = (dir, extension) => {
  const result = [];
  for (const entry of fs.readdirSync(path.join(root, dir), { withFileTypes: true })) {
    const relative = path.join(dir, entry.name);
    if (entry.isDirectory()) result.push(...walk(relative, extension));
    else if (!extension || entry.name.endsWith(extension)) result.push(relative.replaceAll('\\', '/'));
  }
  return result;
};
const write = (name, body) => fs.writeFileSync(path.join(outDir, name), `${body.trim()}\n`);

const app = read('src/App.jsx');
const permissions = read('src/constants/permissions.js');
const permissionMap = new Map(
  [...permissions.matchAll(/["'](\/[^"']+)["']\s*:\s*\[([^\]]*)\]/g)].map((match) => [
    match[1],
    [...match[2].matchAll(/["']([^"']+)["']/g)].map((item) => item[1]).join(' OR ') || 'authenticated'
  ])
);
const publicRoutes = [...app.matchAll(/path=["'](\/[^"']+)["']/g)]
  .map((match) => match[1])
  .filter((route) => ['/login', '/verificar', '/soporte', '/consulta', '/rendiciones'].some((base) => route.startsWith(base)));
const routes = [...new Set([...permissionMap.keys(), ...publicRoutes])]
  .map((route) => ({ path: route, component: 'Ver App.jsx / routeMeta' }));
const routeRows = routes
  .sort((a, b) => a.path.localeCompare(b.path))
  .map((route) => `| \`${route.path}\` | ${route.component} | ${permissionMap.get(route.path) || 'PUBLIC/guard especial'} | routeMeta/App guard |`)
  .join('\n');
write('route-inventory.md', `
# CCO 2.0 · Inventario de rutas

Generado mecánicamente con \`npm run cco2:baseline\`. Fuente: \`src/App.jsx\`,
\`src/constants/permissions.js\` y \`src/constants/routeMeta.js\`.

| Path | Componente | Permiso efectivo | Control |
|---|---|---|---|
${routeRows}

Reglas: ruta protegida no catalogada = denegada; private beta no aparece en navegación;
la equivalencia completa está bloqueada por \`routePermissionMatrix.test.js\`.
`);

const permissionIds = [...new Set([...permissions.matchAll(/["']([a-z][a-z0-9_]+)["']/g)].map((m) => m[1]))].sort();
write('permission-inventory.md', `
# CCO 2.0 · Inventario de permisos

Catálogo observado: **${permissionIds.length}** identificadores referenciados por el guard.

${permissionIds.map((id) => `- \`${id}\``).join('\n')}

## Contrato de migración

\`effectivePermission = IAM OR LEGACY OR ADMIN OR DELEGATED_ADMIN\` durante compatibilidad.
El harness en \`docs/iam-v2\` debe mantener \`LOSS=0\` antes de retirar legacy.
`);

const migrations = walk('supabase/migrations', '.sql');
const migrationSources = migrations.map((file) => ({ file, sql: read(file) }));
const sql = migrationSources.map(({ file, sql: source }) => `\n-- FILE:${file}\n${source}`).join('\n');
const functions = new Map();
for (const { file: source, sql: migrationSql } of migrationSources) {
  for (const match of migrationSql.matchAll(/create\s+(?:or\s+replace\s+)?function\s+((?:[a-z_][\w$]*\.)?[a-z_][\w$]*)\s*\(([^)]*)\)([\s\S]*?)(?=\n\s*create\s+(?:or\s+replace\s+)?function|$)/gi)) {
    const name = match[1].toLowerCase();
    const args = match[2].replace(/\s+/g, ' ').trim();
    const body = match[3];
    const classification = /trigger/i.test(body) || /^(?:public\.)?(?:trg_|trigger_|audit_)/.test(name)
      ? 'TRIGGER_ONLY'
      : /publico|verificar_certificado|buscar_nv_publico/.test(name)
        ? 'PUBLIC_API'
        : /admin|usuarios_|api_key|cleanup|eliminar/.test(name)
          ? 'ADMIN_API'
          : /_assert|_puede_|_normalizar|private\./.test(name)
            ? 'INTERNAL_HELPER'
            : 'AUTHENTICATED_API';
    functions.set(`${name}(${args})`, {
      name, args, classification, source,
      definer: /security\s+definer/i.test(body),
      fixedPath: /set\s+search_path\s*=/i.test(body)
    });
  }
}
const rpcRows = [...functions.values()].sort((a, b) => a.name.localeCompare(b.name)).map((fn) =>
  `| \`${fn.name}(${fn.args})\` | ${fn.classification} | ${fn.definer ? 'sí' : 'no'} | ${fn.fixedPath ? 'sí' : 'REVISAR'} | \`${fn.source}\` |`
).join('\n');
write('rpc-inventory.md', `
# CCO 2.0 · Registro RPC

Inventario estático completo de las firmas definidas en migraciones. Antes de producción se
compara con \`pg_proc\` y Supabase Advisor.

| Función | Clasificación | Definer | search_path fijo | Última fuente detectada |
|---|---|---:|---:|---|
${rpcRows}
`);

const tables = new Map();
for (const { file: source, sql: migrationSql } of migrationSources) {
  for (const match of migrationSql.matchAll(/create\s+table\s+(?:if\s+not\s+exists\s+)?((?:[a-z_][\w$]*\.)?[a-z_][\w$]*)/gi)) {
    const table = match[1].toLowerCase();
    tables.set(table, { table, source });
  }
}
const tableRows = [...tables.values()].sort((a, b) => a.table.localeCompare(b.table)).map(({ table, source }) => {
  const escaped = table.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const rls = new RegExp(`alter\\s+table\\s+(?:only\\s+)?${escaped}\\s+enable\\s+row\\s+level\\s+security`, 'i').test(sql);
  const policies = [...sql.matchAll(new RegExp(`create\\s+policy[\\s\\S]{0,200}?on\\s+${escaped}`, 'gi'))].length;
  return `| \`${table}\` | ${rls ? 'ON' : 'REVISAR'} | ${policies} | ACTIVE/COMPATIBILITY por validar | \`${source}\` |`;
}).join('\n');
write('table-inventory.md', `
# CCO 2.0 · Inventario de tablas

| Tabla | RLS estático | Policies detectadas | Lifecycle | Fuente |
|---|---:|---:|---|---|
${tableRows}

\`REVISAR\` no significa que RLS esté desactivado en PROD: indica que el generador no encontró
la sentencia en el historial disponible. El gate live usa \`pg_class.relrowsecurity\`.
`);

const sourceFiles = walk('src').filter((file) => /\.(js|jsx|ts|tsx)$/.test(file));
const sourceText = sourceFiles.map((file) => `\n// FILE:${file}\n${read(file)}`).join('\n');
const buckets = new Set();
for (const match of `${sql}\n${sourceText}`.matchAll(/storage\.from\s*\(\s*["']([^"']+)["']\s*\)|bucket_id\s*=\s*["']([^"']+)["']/gi)) {
  const bucket = match[1] || match[2];
  if (bucket && !bucket.includes('.')) buckets.add(bucket);
}
write('storage-inventory.md', `
# CCO 2.0 · Inventario Storage

| Bucket referenciado | Clasificación inicial | Gate requerido |
|---|---|---|
${[...buckets].sort().map((bucket) => `| \`${bucket}\` | PRIVATE hasta demostrar lo contrario | MIME, tamaño, TTL, ownership, checksum |`).join('\n') || '| — | Sin referencias estáticas | Validar live |'}

Las duraciones de retención quedan \`PENDING_BUSINESS_APPROVAL\`; no se inventan plazos legales.
`);

write('regression-matrix.md', `
# CCO 2.0 · Matriz de regresión

| Gate | Evidencia automática | Resultado exigido |
|---|---|---|
| PERMISSION_LOSS | \`routePermissionMatrix.test.js\`, harness IAM | 0 |
| FUNCTION_LOSS | \`rpcSurfaceContract.test.js\` + inventario RPC | 0 |
| ROUTE_LOSS | \`routePermissionMatrix.test.js\` | 0 |
| DATA_LOSS | migraciones aditivas + smoke SQL rollback | 0 |
| STOCK_SIDE_EFFECT_FROM_VISUAL_LOCATION | \`putawayVisualContract.test.js\` | 0 |
| STOCK_SIDE_EFFECT_FROM_COUNT | \`operationalContracts.test.js\` | 0 |
| STOCK_SIDE_EFFECT_FROM_ROUTE/TMS/POD | contratos + pruebas SQL | 0 |
| Offline cross-user | \`syncManager.test.js\` | 0 |
| PWA sensitive cache | \`pwaConfigContract.test.js\` | NetworkOnly |
| Build | \`npm run build\` | exit 0 |

## Secuencia obligatoria

BASELINE → FLAG → NEW PATH → SHADOW → TEST → PILOT → CUTOVER → OBSERVE.
`);

console.log(`CCO 2.0 baseline generado: ${routes.length} rutas, ${permissionIds.length} permisos, ${functions.size} RPCs, ${tables.size} tablas, ${buckets.size} buckets.`);
