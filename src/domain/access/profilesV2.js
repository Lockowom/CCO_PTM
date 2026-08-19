import { FUNCTION_REGISTRY } from './functionRegistry.js';
import { SCREEN_REGISTRY } from './screenRegistry.js';

const SCREEN_MODULE = new Map(SCREEN_REGISTRY.map((s) => [s.id, s.module]));
const SCREEN_IDS = new Set(SCREEN_REGISTRY.map((s) => s.id));

function functionsOf(screens) {
  return FUNCTION_REGISTRY.filter((f) => screens.includes(f.screen))
    .map((f) => f.id)
    .sort();
}

function modulesOf(screens) {
  return [...new Set(screens.map((s) => SCREEN_MODULE.get(s)).filter(Boolean))].sort();
}

function profile(id, label, legacyRole, screens, note, opts = {}) {
  const unknown = screens.filter((s) => !SCREEN_IDS.has(s));
  if (unknown.length > 0) {
    throw new Error(`profile ${id}: screens inválidas: ${unknown.join(', ')}`);
  }
  return {
    id,
    label,
    legacyRole,
    normalized: Boolean(opts.normalized),
    screens: [...screens].sort(),
    functions: functionsOf(screens),
    modules: modulesOf(screens),
    note
  };
}

export const PROFILES_V2 = [
  profile(
    'OPERADOR_PANEL_NV',
    'Operador Panel N.V.',
    null,
    ['panel.nv.entry', 'panel.nv.info'],
    'Perfil NORMALIZADO (spec §49): ingresa y consulta N.V. sin Dashboard/TV/Builder (lo que hoy concede manage_panel). Asignarlo es decisión explícita de normalización (Etapa B).',
    { normalized: true }
  ),
  profile(
    'BODEGA',
    'Operador Bodega',
    'OPERADOR',
    [
      'inbound.reception',
      'inbound.reception-nacional',
      'inbound.entry',
      'inbound.cubing',
      'inventory.traspasos',
      'inventory.heatmap',
      'inventory.analisis',
      'inventory.carteles',
      'queries.batches',
      'queries.sales-status',
      'queries.locations',
      'queries.grupo'
    ],
    'Equivalente al acceso efectivo REAL del rol OPERADOR (6 permisos amplios → 12 pantallas vía manage_inventory).'
  ),
  profile(
    'INVENTARIO',
    'Inventario',
    'INVENTARIO_',
    [
      'inbound.reception',
      'inbound.reception-nacional',
      'inbound.entry',
      'inbound.cubing',
      'inbound.data-import',
      'inventory.pda',
      'inventory.traspasos',
      'inventory.heatmap',
      'inventory.locations',
      'inventory.conteo',
      'inventory.bloque',
      'inventory.analisis',
      'inventory.carteles',
      'inventory.insumos',
      'queries.batches',
      'queries.addresses',
      'queries.locations',
      'queries.grupo',
      'quality.monitoreo'
    ],
    'Equivalente al acceso efectivo REAL del rol Inventario (31 permisos → 19 pantallas).'
  ),
  profile(
    'CALIDAD',
    'Control Calidad',
    'CONTROL_CALIDAD',
    [
      'panel.tv',
      'inbound.reception',
      'inbound.reception-nacional',
      'inbound.entry',
      'inbound.cubing',
      'inventory.traspasos',
      'inventory.heatmap',
      'inventory.analisis',
      'inventory.carteles',
      'queries.batches',
      'queries.addresses',
      'queries.locations',
      'queries.historial-nv',
      'queries.datasheet',
      'queries.grupo',
      'quality.monitoreo',
      'quality.acciones',
      'quality.bandeja',
      'quality.clasificacion'
    ],
    'Equivalente al acceso efectivo REAL del rol Control Calidad (14 permisos → 19 pantallas).'
  ),
  profile(
    'COORDINADOR_DESPACHO',
    'Coordinador Despacho',
    null,
    ['queries.dispatch-control', 'queries.sales-status', 'panel.nv.info'],
    'Sin rol TMS actual (módulo retirado, mig 102). Definición mínima a validar con el dueño del proceso.',
    { normalized: true }
  ),
  profile(
    'SUPERVISOR',
    'Supervisor',
    'SUPERVISOR_',
    [
      'panel.dashboard',
      'panel.nv.entry',
      'panel.nv.info',
      'panel.tv',
      'panel.builder',
      'inbound.reception',
      'inbound.reception-nacional',
      'inbound.entry',
      'inbound.cubing',
      'inbound.data-import',
      'inventory.traspasos',
      'inventory.heatmap',
      'inventory.analisis',
      'inventory.carteles',
      'queries.batches',
      'queries.addresses',
      'queries.locations',
      'queries.historial-nv',
      'queries.grupo',
      'tms.control',
      'tms.pda'
    ],
    'Equivalente al acceso efectivo REAL del rol SupervisorN.v (12 permisos → 21 pantallas).'
  ),
  profile(
    'GERENCIA',
    'Gerencia',
    'GERENCIA',
    [
      'panel.dashboard',
      'panel.nv.entry',
      'panel.nv.info',
      'panel.nv.reopen',
      'panel.tv',
      'panel.builder',
      'inbound.reception',
      'inbound.reception-nacional',
      'inbound.entry',
      'inbound.cubing',
      'inbound.data-import',
      'inventory.traspasos',
      'inventory.heatmap',
      'inventory.analisis',
      'inventory.carteles',
      'queries.batches',
      'queries.addresses',
      'queries.locations',
      'queries.grupo',
      'quality.monitoreo',
      'quality.acciones',
      'quality.bandeja',
      'quality.clasificacion',
      'postventa.tickets',
      'tms.control',
      'tms.pda'
    ],
    'Equivalente al acceso efectivo REAL del rol Gerencia (27 permisos → 26 pantallas).'
  ),
  profile(
    'ADMIN',
    'Administrador',
    'ADMIN',
    SCREEN_REGISTRY.filter((s) => !s.privateBeta).map((s) => s.id),
    'Todas las pantallas no-private-beta (47). Equivalente al acceso efectivo REAL del rol Administrador (79 permisos).'
  )
];

export function profileById(id) {
  return PROFILES_V2.find((p) => p.id === id) || null;
}
