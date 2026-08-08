import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'src');
const OUTPUT = path.join(SRC, 'data', 'ccoArchitecture.generated.json');

const { APP_MODULES, APP_ROUTES } = await import(
  `${pathToFileURL(path.join(SRC, 'config', 'modules.js')).href}?catalog=${Date.now()}`
);

const MODULE_META = {
  public: {
    label: 'Acceso público',
    section: 'platform',
    description: 'Consultas y solicitudes disponibles sin iniciar sesión.',
    owner: 'Operaciones / Servicio Técnico',
    color: '#0ea5e9'
  },
  inbound: {
    label: 'Inbound',
    section: 'wms',
    description: 'Recepción, carga masiva, cubicaje y ubicación inicial de mercadería.',
    owner: 'Bodega / Recepción',
    color: '#f97316'
  },
  inventario: {
    label: 'Inventario',
    section: 'wms',
    description: 'Stock, ubicaciones, conteos, traspasos, insumos y análisis de códigos.',
    owner: 'Bodega / Inventario',
    color: '#8b5cf6'
  },
  queries: {
    label: 'Consultas',
    section: 'intelligence',
    description: 'Lecturas operativas de N.V., series, lotes, direcciones, fichas y despachos.',
    owner: 'Operaciones',
    color: '#0ea5e9'
  },
  quality: {
    label: 'Calidad',
    section: 'intelligence',
    description: 'Hitos de recepción, inventario y salida; informes, acciones y dictámenes.',
    owner: 'Control de Calidad',
    color: '#10b981'
  },
  panel: {
    label: 'Panel PTM',
    section: 'intelligence',
    description: 'Ciclo de vida de la Nota de Venta, dashboard, consulta, TV y configuración.',
    owner: 'Operaciones PTM',
    color: '#f97316'
  },
  asistente: {
    label: 'Asistente IA',
    section: 'intelligence',
    description: 'Consultas asistidas sobre información operativa con acceso controlado.',
    owner: 'Operaciones / TI',
    color: '#6366f1'
  },
  postventa: {
    label: 'Post-Venta',
    section: 'postventa',
    description: 'Ingreso, asignación, agenda, atención técnica, informe y cierre de tickets.',
    owner: 'Servicio Técnico',
    color: '#ec4899'
  },
  tms: {
    label: 'TMS Transporte',
    section: 'wms',
    description: 'Órdenes, conductores, vehículos, rutas, incidencias y prueba de entrega.',
    owner: 'Transporte',
    color: '#14b8a6',
    status: 'oculto'
  },
  admin: {
    label: 'Administración y plataforma',
    section: 'system',
    description: 'IAM, seguridad, observabilidad, cargas, workflows, eventos y APIs.',
    owner: 'TI / Administración',
    color: '#334155'
  }
};

const EXTRA_ROUTES = [
  { value: '/login', label: 'Inicio de sesión', module: 'public' },
  { value: '/consulta', label: 'Consulta pública N.V.', module: 'public' },
  { value: '/verificar', label: 'Verificar certificado', module: 'public' },
  { value: '/soporte', label: 'Solicitud pública de soporte', module: 'public' },
  { value: '/seguridad', label: 'Seguridad de mi cuenta', module: 'admin' },
  { value: '/tms/control', label: 'TMS · Torre de Control', module: 'tms' },
  { value: '/tms/pda', label: 'TMS · Ruta del conductor', module: 'tms' }
];

const SERVICE_MODULE = {
  analisisService: 'inventario',
  conteoService: 'inventario',
  insumosService: 'inventario',
  calidadService: 'quality',
  panelPtm: 'panel',
  ingresarService: 'panel',
  builderService: 'panel',
  configService: 'panel',
  postventaService: 'postventa',
  tmsService: 'tms',
  asistenteService: 'asistente',
  iamService: 'admin',
  securityService: 'admin',
  apiService: 'admin',
  workflowService: 'admin',
  flujoService: 'admin',
  eventosService: 'admin',
  mobileService: 'admin',
  otaDeployService: 'admin'
};

const EDGE_DESCRIPTIONS = {
  'api-v1': 'Expone la API operacional autenticada por claves y scopes.',
  'capgo-deploy': 'Orquesta despliegues OTA de la aplicación móvil.',
  'notify-inventario': 'Genera notificaciones ante eventos críticos de inventario.',
  'notify-ticket': 'Notifica la creación de tickets de servicio técnico.',
  'notify-ticket-update': 'Notifica cambios relevantes de tickets existentes.',
  'postventa-extractor': 'Extrae y normaliza solicitudes de postventa recibidas.',
  'postventa-inbox': 'Sincroniza la bandeja de entrada de Post-Venta.',
  'postventa-publico': 'Recibe solicitudes públicas de servicio técnico.',
  'send-push': 'Despacha notificaciones push a dispositivos registrados.'
};

const read = (file) => fs.readFileSync(file, 'utf8');
const posix = (file) => path.relative(ROOT, file).replaceAll('\\', '/');
const slug = (value) =>
  String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
const humanize = (value) =>
  String(value)
    .replace(/^use(?=[A-Z])/, '')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/^./, (letter) => letter.toUpperCase());

function listFiles(dir, predicate = () => true) {
  if (!fs.existsSync(dir)) return [];
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...listFiles(full, predicate));
    else if (predicate(full)) files.push(full);
  }
  return files;
}

function resolveSource(baseFile, specifier) {
  if (!specifier.startsWith('.')) return null;
  const unresolved = path.resolve(path.dirname(baseFile), specifier);
  const candidates = [
    unresolved,
    `${unresolved}.js`,
    `${unresolved}.jsx`,
    `${unresolved}.ts`,
    `${unresolved}.tsx`,
    path.join(unresolved, 'index.js'),
    path.join(unresolved, 'index.jsx')
  ];
  return candidates.find((candidate) => fs.existsSync(candidate)) || null;
}

function moduleForSource(file) {
  const source = posix(file).toLowerCase();
  if (source.includes('/quality/')) return 'quality';
  if (source.includes('/panel/')) return 'panel';
  if (source.includes('/postventa/')) return 'postventa';
  if (source.includes('/tms/')) return 'tms';
  if (source.includes('/inbound/')) return 'inbound';
  if (source.includes('/queries/')) return 'queries';
  if (source.includes('/inventory/') || source.includes('/mobile/')) return 'inventario';
  if (source.includes('/public/')) return 'public';
  if (source.includes('/admin/') || source.endsWith('/pages/seguridad.jsx')) return 'admin';
  if (source.endsWith('/tools/traspasos.jsx')) return 'inventario';
  if (source.endsWith('/tools/flujomaestro.jsx')) return 'admin';
  return 'admin';
}

function sourceComment(source, start) {
  const before = source.slice(Math.max(0, start - 700), start);
  const block = before.match(/\/\*\*([\s\S]*?)\*\/\s*$/)?.[1];
  const lines = before.match(/(?:^|\n)((?:\s*\/\/[^\n]*\n?)+)\s*$/)?.[1];
  const raw = block || lines || '';
  return raw
    .replace(/^\s*\/\/?\**/gm, '')
    .replace(/\*\/?\s*$/gm, '')
    .replace(/@\w+[^\n]*/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 240);
}

function inferDescription(name, operations, resources) {
  const label = humanize(name).toLowerCase();
  const target = resources.length ? ` sobre ${resources.map((item) => item.name).join(', ')}` : '';
  if (
    /^(listar|obtener|buscar|fetch|get|use|cargar|consultar|verificar|estado|resumen|mis)/i.test(
      name
    )
  )
    return `Consulta ${label}${target} y entrega el resultado a la interfaz.`;
  if (
    /^(crear|registrar|guardar|agregar|enviar|subir|importar|generar|asignar|delegar)/i.test(name)
  )
    return `Registra ${label}${target} y devuelve el resultado de la operación.`;
  if (
    /^(actualizar|editar|cambiar|marcar|toggle|cerrar|resolver|reclasificar|forzar|refrescar)/i.test(
      name
    )
  )
    return `Actualiza ${label}${target} aplicando las validaciones del servicio.`;
  if (/^(eliminar|borrar|revocar|quitar|limpiar)/i.test(name))
    return `Elimina o revoca ${label}${target} según las reglas de acceso.`;
  const action = operations.length ? operations.join(', ') : 'lógica de aplicación';
  return `Ejecuta ${label}; participa en ${action}${target}.`;
}

function parsePermissions() {
  const source = read(path.join(SRC, 'constants', 'permissions.js'));
  const result = {};
  const pattern = /['"](\/[^'"]+)['"]\s*:\s*\[([\s\S]*?)\]/g;
  for (const match of source.matchAll(pattern)) {
    result[match[1]] = [...match[2].matchAll(/['"]([^'"]+)['"]/g)].map((item) => item[1]);
  }
  return result;
}

function parseAppRouteSources() {
  const appFile = path.join(SRC, 'App.jsx');
  const source = read(appFile);
  const lazySources = Object.fromEntries(
    [
      ...source.matchAll(
        /const\s+(\w+)\s*=\s*React\.lazy\(\(\)\s*=>\s*import\(['"]([^'"]+)['"]\)\)/g
      )
    ].map((match) => [match[1], resolveSource(appFile, match[2])])
  );
  const starts = [...source.matchAll(/<Route\b/g)].map((match) => match.index);
  const routeSources = {};
  let panelChildren = false;
  for (let index = 0; index < starts.length; index += 1) {
    const block = source.slice(starts[index], starts[index + 1] ?? source.length);
    const rawPath = block.match(/path=["']([^"']+)["']/)?.[1];
    if (!rawPath || rawPath === '*' || rawPath === '/') continue;
    const componentNames = [...block.matchAll(/<([A-Z][\w]*)\b/g)].map((match) => match[1]);
    const component = componentNames.find((name) => lazySources[name]);
    if (!component) continue;
    if (rawPath === 'panel') panelChildren = true;
    const isPanelChild =
      panelChildren && ['ingresar', 'info', 'tv', 'builder', 'configuracion'].includes(rawPath);
    const normalized = rawPath.startsWith('/')
      ? rawPath
      : isPanelChild
        ? `/panel/${rawPath}`
        : `/${rawPath}`;
    routeSources[normalized] = lazySources[component];
  }
  return routeSources;
}

function operationList(segment) {
  const operations = [];
  const checks = [
    ['lectura', /\.select\s*\(|\.maybeSingle\s*\(|\.single\s*\(/],
    ['creación', /\.insert\s*\(/],
    ['actualización', /\.update\s*\(/],
    ['upsert', /\.upsert\s*\(/],
    ['eliminación', /\.delete\s*\(/],
    ['RPC', /\.rpc\s*\(/],
    ['Edge Function', /functions\.invoke\s*\(/],
    ['Realtime', /\.channel\s*\(|postgres_changes/],
    ['archivo', /storage\s*\.\s*from\s*\(|\.upload\s*\(|\.download\s*\(/]
  ];
  for (const [label, pattern] of checks) if (pattern.test(segment)) operations.push(label);
  return operations;
}

function resourcesForSegment(segment) {
  const resources = new Map();
  const add = (kind, name) => {
    if (!name) return;
    resources.set(`${kind}:${name}`, { kind, name });
  };
  for (const match of segment.matchAll(/functions\.invoke\(\s*['"]([^'"]+)['"]/g))
    add('edge-function', match[1]);
  for (const match of segment.matchAll(/\.rpc\(\s*['"]([^'"]+)['"]/g)) add('rpc', match[1]);
  for (const match of segment.matchAll(/storage\s*\.\s*from\(\s*['"]([^'"]+)['"]/g))
    add('storage', match[1]);
  for (const match of segment.matchAll(/\.from\(\s*['"]([^'"]+)['"]/g)) {
    if (!segment.slice(Math.max(0, match.index - 18), match.index).includes('storage'))
      add('table', match[1]);
  }
  return [...resources.values()];
}

const nodes = [];
const connections = [];
const nodeById = new Map();
const connectionKeys = new Set();
const addNode = (node) => {
  if (nodeById.has(node.id)) return nodeById.get(node.id);
  const normalized = { status: 'activo', ...node };
  nodeById.set(node.id, normalized);
  nodes.push(normalized);
  return normalized;
};
const addConnection = (from, to, relation, label = relation) => {
  if (!from || !to || from === to) return;
  const key = `${from}|${to}|${relation}`;
  if (connectionKeys.has(key)) return;
  connectionKeys.add(key);
  connections.push({ id: `connection:${connections.length + 1}`, from, to, relation, label });
};

const configuredModules = new Map(APP_MODULES.map((module) => [module.id, module]));
for (const moduleId of Object.keys(MODULE_META)) {
  const configured = configuredModules.get(moduleId);
  const meta = MODULE_META[moduleId];
  addNode({
    id: `module:${moduleId}`,
    kind: 'module',
    module: moduleId,
    label: meta.label || configured?.label || humanize(moduleId),
    description: meta.description,
    owner: meta.owner,
    section: configured?.section || meta.section,
    color: meta.color,
    status: meta.status || 'activo'
  });
}

const permissions = parsePermissions();
const routeSources = parseAppRouteSources();
const allRoutes = [...EXTRA_ROUTES, ...APP_ROUTES].filter(
  (route, index, list) => list.findIndex((item) => item.value === route.value) === index
);
const screenIdsBySource = new Map();

for (const route of allRoutes) {
  const baseRoute = route.value.split('?')[0];
  const sourceFile = routeSources[baseRoute];
  const id = `screen:${slug(route.value)}`;
  addNode({
    id,
    kind: 'screen',
    module: route.module,
    label: route.label,
    description: `Pantalla disponible en ${route.value}.`,
    route: route.value,
    permissions: permissions[baseRoute] || (route.module === 'public' ? ['público'] : []),
    source: sourceFile ? posix(sourceFile) : null
  });
  addConnection(`module:${route.module}`, id, 'contiene', 'incluye pantalla');
  if (sourceFile) {
    const sourceKey = path.normalize(sourceFile);
    const ids = screenIdsBySource.get(sourceKey) || [];
    ids.push(id);
    screenIdsBySource.set(sourceKey, ids);
  }
}

const serviceFiles = [
  ...listFiles(path.join(SRC, 'services'), (file) => /\.(?:js|ts)$/.test(file)),
  ...listFiles(path.join(SRC, 'pages'), (file) => /(?:service|Service)\.(?:js|ts)$/.test(file))
].sort();
const functionBySourceAndName = new Map();
const functionsByFile = new Map();

for (const file of serviceFiles) {
  const source = read(file);
  const serviceName = path.basename(file).replace(/\.(?:js|ts)$/, '');
  const moduleId = SERVICE_MODULE[serviceName] || moduleForSource(file);
  const serviceId = `service:${slug(posix(file))}`;
  addNode({
    id: serviceId,
    kind: 'service',
    module: moduleId,
    label: humanize(serviceName),
    description: `Capa de acceso y reglas reutilizables de ${MODULE_META[moduleId]?.label || moduleId}.`,
    source: posix(file)
  });
  addConnection(`module:${moduleId}`, serviceId, 'implementa', 'usa servicio');

  const patterns = [
    /export\s+(?:async\s+)?function\s+([\w$]+)\s*\(([^)]*)\)/g,
    /export\s+const\s+([\w$]+)\s*=\s*(?:async\s*)?(?:\(([^)]*)\)|([\w$]+))\s*=>/g
  ];
  const matches = patterns
    .flatMap((pattern) => [...source.matchAll(pattern)])
    .map((match) => ({
      name: match[1],
      args: (match[2] || match[3] || '').replace(/\s+/g, ' ').trim(),
      index: match.index,
      raw: match[0]
    }))
    .sort((a, b) => a.index - b.index);

  const fileFunctions = [];
  for (let index = 0; index < matches.length; index += 1) {
    const match = matches[index];
    const segment = source.slice(match.index, matches[index + 1]?.index ?? source.length);
    const operations = operationList(segment);
    const resources = resourcesForSegment(segment);
    const functionId = `function:${slug(posix(file))}:${match.name}`;
    const comment = sourceComment(source, match.index);
    const functionNode = addNode({
      id: functionId,
      kind: 'function',
      module: moduleId,
      label: match.name,
      displayLabel: humanize(match.name),
      description: comment || inferDescription(match.name, operations, resources),
      signature: `${match.name}(${match.args})`,
      source: posix(file),
      operations,
      resources
    });
    functionBySourceAndName.set(`${path.normalize(file)}:${match.name}`, functionId);
    fileFunctions.push({ ...functionNode, segment });
    addConnection(serviceId, functionId, 'expone', 'expone función');
  }
  functionsByFile.set(path.normalize(file), fileFunctions);
}

const resourceIds = new Map();
const ensureResource = (kind, name, moduleId = 'admin') => {
  const key = `${kind}:${name}`;
  if (resourceIds.has(key)) return resourceIds.get(key);
  const id = kind === 'edge-function' ? `edge:${slug(name)}` : `resource:${kind}:${slug(name)}`;
  const labels = {
    table: 'Tabla',
    rpc: 'RPC',
    storage: 'Storage',
    'edge-function': 'Edge Function'
  };
  addNode({
    id,
    kind,
    module: kind === 'edge-function' ? 'admin' : moduleId,
    label: name,
    description:
      kind === 'edge-function'
        ? EDGE_DESCRIPTIONS[name] || `Función Edge ${name}.`
        : `${labels[kind] || humanize(kind)} utilizada por la aplicación.`,
    source: kind === 'edge-function' ? `supabase/functions/${name}/index.ts` : null
  });
  resourceIds.set(key, id);
  return id;
};

for (const [, functions] of functionsByFile) {
  const localNames = new Map(functions.map((fn) => [fn.label, fn.id]));
  for (const fn of functions) {
    for (const resource of fn.resources) {
      const resourceId = ensureResource(resource.kind, resource.name, fn.module);
      const relation =
        resource.kind === 'edge-function'
          ? 'invoca'
          : resource.kind === 'rpc'
            ? 'ejecuta'
            : fn.operations.some((operation) =>
                  ['creación', 'actualización', 'upsert', 'eliminación'].includes(operation)
                )
              ? 'escribe'
              : 'lee';
      addConnection(fn.id, resourceId, relation, `${relation} ${resource.kind}`);
    }
    for (const [calledName, calledId] of localNames) {
      if (calledId !== fn.id && new RegExp(`\\b${calledName}\\s*\\(`).test(fn.segment))
        addConnection(fn.id, calledId, 'invoca', 'invoca función');
    }
  }
}

const componentFiles = listFiles(path.join(SRC, 'pages'), (file) =>
  /\.(?:js|jsx|ts|tsx)$/.test(file)
);
const componentIdBySource = new Map();
const callersForFile = (file) => {
  const normalized = path.normalize(file);
  const screenIds = screenIdsBySource.get(normalized) || [];
  if (screenIds.length) return screenIds;
  if (componentIdBySource.has(normalized)) return [componentIdBySource.get(normalized)];
  const moduleId = moduleForSource(file);
  const componentId = `component:${slug(posix(file))}`;
  addNode({
    id: componentId,
    kind: 'component',
    module: moduleId,
    label: humanize(path.basename(file).replace(/\.(?:js|jsx|ts|tsx)$/, '')),
    description: `Componente interno que participa en ${MODULE_META[moduleId]?.label || moduleId}.`,
    source: posix(file)
  });
  addConnection(`module:${moduleId}`, componentId, 'contiene', 'incluye componente');
  componentIdBySource.set(normalized, componentId);
  return [componentId];
};

for (const file of componentFiles) {
  const source = read(file);
  const importedFunctions = [];
  for (const match of source.matchAll(/import\s*\{([\s\S]*?)\}\s*from\s*['"]([^'"]+)['"]/g)) {
    const importedFile = resolveSource(file, match[2]);
    if (!importedFile || !functionsByFile.has(path.normalize(importedFile))) continue;
    for (const item of match[1].split(',')) {
      const importedName = item
        .trim()
        .split(/\s+as\s+/)[0]
        ?.trim();
      const functionId = functionBySourceAndName.get(
        `${path.normalize(importedFile)}:${importedName}`
      );
      if (functionId) importedFunctions.push(functionId);
    }
  }
  if (!importedFunctions.length) continue;

  const callerIds = callersForFile(file);
  for (const callerId of callerIds)
    for (const functionId of importedFunctions)
      addConnection(callerId, functionId, 'usa', 'usa función');
}

// Algunas pantallas consultan Supabase directamente por razones históricas. Esas
// acciones también forman parte del mapa para que ningún flujo quede silencioso.
for (const file of componentFiles) {
  const source = read(file);
  if (!/\.from\s*\(|\.rpc\s*\(|functions\.invoke\s*\(|\.channel\s*\(/.test(source)) continue;
  const moduleId = moduleForSource(file);
  const actionMatches = [
    ...source.matchAll(/(?:export\s+default\s+)?(?:async\s+)?function\s+([\w$]+)\s*\(([^)]*)\)/g),
    ...source.matchAll(/(?:const|let)\s+([\w$]+)\s*=\s*(?:async\s*)?(?:\(([^)]*)\)|([\w$]+))\s*=>/g)
  ]
    .map((match) => ({
      name: match[1],
      args: (match[2] || match[3] || '').replace(/\s+/g, ' ').trim(),
      index: match.index
    }))
    .sort((a, b) => a.index - b.index);
  const actionIds = new Map();
  const actions = [];
  for (let index = 0; index < actionMatches.length; index += 1) {
    const match = actionMatches[index];
    const segment = source.slice(match.index, actionMatches[index + 1]?.index ?? source.length);
    const resources = resourcesForSegment(segment);
    const operations = operationList(segment);
    if (!resources.length && !operations.includes('Realtime')) continue;
    const actionId = `action:${slug(posix(file))}:${match.name}`;
    addNode({
      id: actionId,
      kind: 'action',
      module: moduleId,
      label: match.name,
      displayLabel: humanize(match.name),
      description:
        sourceComment(source, match.index) || inferDescription(match.name, operations, resources),
      signature: `${match.name}(${match.args})`,
      source: posix(file),
      operations,
      resources
    });
    actions.push({ id: actionId, name: match.name, segment });
    actionIds.set(match.name, actionId);
    for (const callerId of callersForFile(file))
      addConnection(callerId, actionId, 'ejecuta', 'ejecuta acción');
    for (const resource of resources) {
      const resourceId = ensureResource(resource.kind, resource.name, moduleId);
      const relation =
        resource.kind === 'edge-function'
          ? 'invoca'
          : resource.kind === 'rpc'
            ? 'ejecuta'
            : operations.some((operation) =>
                  ['creación', 'actualización', 'upsert', 'eliminación'].includes(operation)
                )
              ? 'escribe'
              : 'lee';
      addConnection(actionId, resourceId, relation, `${relation} ${resource.kind}`);
    }
  }
  for (const action of actions) {
    for (const [calledName, calledId] of actionIds) {
      if (calledId !== action.id && new RegExp(`\\b${calledName}\\s*\\(`).test(action.segment))
        addConnection(action.id, calledId, 'invoca', 'invoca acción');
    }
  }
}

const edgeRoot = path.join(ROOT, 'supabase', 'functions');
for (const directory of fs.existsSync(edgeRoot)
  ? fs
      .readdirSync(edgeRoot, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && !entry.name.startsWith('_'))
  : []) {
  const name = directory.name;
  const edgeId = ensureResource('edge-function', name, 'admin');
  const indexFile = path.join(edgeRoot, name, 'index.ts');
  if (!fs.existsSync(indexFile)) continue;
  const segment = read(indexFile);
  for (const resource of resourcesForSegment(segment).filter(
    (item) => item.kind !== 'edge-function'
  )) {
    const resourceId = ensureResource(resource.kind, resource.name, 'admin');
    addConnection(
      edgeId,
      resourceId,
      resource.kind === 'rpc' ? 'ejecuta' : 'accede',
      `accede ${resource.kind}`
    );
  }
}

const countsByModule = {};
for (const moduleId of Object.keys(MODULE_META)) {
  const moduleNodes = nodes.filter((node) => node.module === moduleId);
  countsByModule[moduleId] = Object.fromEntries(
    [
      'screen',
      'component',
      'service',
      'function',
      'action',
      'table',
      'rpc',
      'edge-function',
      'storage'
    ].map((kind) => [kind, moduleNodes.filter((node) => node.kind === kind).length])
  );
}

const catalog = {
  meta: {
    name: 'Arquitectura funcional CCO',
    schemaVersion: 2,
    generator: 'scripts/generate_architecture_catalog.mjs',
    sourceVersion: JSON.parse(read(path.join(ROOT, 'package.json'))).version,
    fingerprint: '',
    totals: {}
  },
  modules: Object.keys(MODULE_META),
  countsByModule,
  nodes,
  connections
};
catalog.meta.totals = Object.fromEntries(
  [
    'module',
    'screen',
    'component',
    'service',
    'function',
    'action',
    'table',
    'rpc',
    'edge-function',
    'storage'
  ].map((kind) => [kind, nodes.filter((node) => node.kind === kind).length])
);
catalog.meta.fingerprint = crypto
  .createHash('sha256')
  .update(JSON.stringify({ nodes, connections }))
  .digest('hex')
  .slice(0, 12);

const output = `${JSON.stringify(catalog, null, 2)}\n`;
if (!fs.existsSync(OUTPUT) || read(OUTPUT) !== output) fs.writeFileSync(OUTPUT, output, 'utf8');

console.log(
  `Arquitectura CCO: ${nodes.length} elementos, ${connections.length} conexiones, ${catalog.meta.totals.function} funciones (${catalog.meta.fingerprint})`
);
