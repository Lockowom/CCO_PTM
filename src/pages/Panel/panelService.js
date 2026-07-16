// ============================================================================
//  panelService — PUNTO ÚNICO DE CONEXIÓN A DATOS del Panel PTM.
//  (Equivalente a lib/queries.ts del repo panel-.)
//
//  TODAS las pantallas del Panel (Dashboard, Ingresar, Info, TV, Builder,
//  Configuración/Auditoría) consumen SUS DATOS desde aquí — no importan los
//  mocks directamente. Hoy cada función devuelve datos de EJEMPLO; para pasar a
//  datos reales, se reemplaza el CUERPO de cada función por la consulta a
//  Supabase (o al proxy). La firma (lo que devuelve) se mantiene → las pantallas
//  no cambian. Todas son async y devuelven Promesas para reflejar el fetch real.
// ============================================================================
import {
  MOCK_KPIS, MOCK_ESTADO_TABLE, MOCK_RESUMEN, MOCK_WEEKLY, MOCK_LEADTIME,
  MOCK_RANK_TRANSP, MOCK_RANK_VEND, MOCK_DIVISIONS, MOCK_ALERTAS_OP,
  MOCK_TENDENCIA, MOCK_CALIDAD, MOCK_TIEMPOS, MOCK_NVS, ESTADO_COLOR, buildDetalle,
} from './mock';

// Simula la latencia de red (se quita al conectar Supabase real).
const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms));

// ── Dashboard ───────────────────────────────────────────────────────────────
export async function getDashboard(/* from, to */) {
  await delay();
  return {
    kpis: MOCK_KPIS,
    estadoTable: MOCK_ESTADO_TABLE,
    resumen: MOCK_RESUMEN,
    weekly: MOCK_WEEKLY,
    leadTime: MOCK_LEADTIME,
    rankTransp: MOCK_RANK_TRANSP,
    rankVend: MOCK_RANK_VEND,
    divisions: MOCK_DIVISIONS,
    alertasOp: MOCK_ALERTAS_OP,
    tendencia: MOCK_TENDENCIA,
    calidad: MOCK_CALIDAD,
    tiempos: MOCK_TIEMPOS,
  };
}
// Detalle contextual (al hacer clic en un KPI/estado/canal).
export async function getDetalle(titulo, count) {
  await delay(150);
  return buildDetalle(titulo, count);
}

// ── Info N.V. (buscador universal) ───────────────────────────────────────────
export async function buscarNV(query) {
  await delay(200);
  const q = String(query || '').trim().toLowerCase();
  if (!q) return [];
  return MOCK_NVS.filter((r) =>
    [r.nv, r.nv_ptm, r.nv_orange, r.nv_farmapack, r.varios, r.factura, r.guia,
      r.numero_envio, r.cliente, r.vendedor, r.transportista, r.estado]
      .filter(Boolean).some((v) => String(v).toLowerCase().includes(q)));
}

// ── Ingresar N.V. ────────────────────────────────────────────────────────────
// Lookup de una N.V. (mock: par=existe/actualizar, impar=nueva/crear).
export async function lookupNV(nv /* , canal */) {
  await delay(400);
  const par = Number(String(nv).slice(-1)) % 2 === 0;
  if (par) {
    return {
      found: true, row: 100 + (Number(String(nv).slice(-2)) || 0),
      data: { cliente: 'Clínica Los Andes', vendedor: 'M. González', ccosto: '1-06', division: 'DIV. HOSPITALARIA' },
      fechaAprobacion: '2026-07-08', fechaCompromiso: '2026-07-10', estado: 'En Proceso',
    };
  }
  return { found: false, autoFill: { cliente: '', vendedor: '' }, fechaAprobacion: new Date().toLocaleDateString('en-CA') };
}
export async function guardarNV(payload) {
  await delay(500);
  // Aquí irá el POST al proxy / upsert en Supabase.
  return { ok: true, nv: payload?.nv, mode: payload?.mode };
}

// ── Modo TV ──────────────────────────────────────────────────────────────────
const TV_EST = [
  { estado: 'En Proceso', color: '#f59e0b', icon: '⚙', base: 8 },
  { estado: 'P / Vendedor', color: '#d97706', icon: '👤', base: 3 },
  { estado: 'Shipping', color: '#8b5cf6', icon: '📋', base: 6 },
  { estado: 'Courier', color: '#7c3aed', icon: '🚛', base: 2 },
  { estado: 'En Ruta', color: '#06b6d4', icon: '🛣', base: 5 },
  { estado: 'Entregado', color: '#22c55e', icon: '✓', base: 22 },
];
const _nv = (n, canal, cliente, vendedor, transportista, urgente, dias) => ({ nv: n, canal, cliente, vendedor, transportista, urgente, dias });
const TV_DATA = {
  'En Proceso': [_nv('97125', 'PTM', 'Clínica Los Andes', 'M. González', '—', true, 3), _nv('55012', 'Farmapack', 'Lab. BioTest', 'C. Díaz', '—', false, 2), _nv('97140', 'PTM', 'Hospital del Valle', 'L. Torres', '—', false, 1)],
  'P / Vendedor': [_nv('V-3021', 'Varios', 'Dental Sur', 'A. Muñoz', '—', false, 4)],
  'Shipping': [_nv('97108', 'PTM', 'Centro Médico Sur', 'L. Torres', 'LogiSur', false, 2), _nv('88450', 'Orange', 'Farmacia Vida', 'P. Rojas', 'RápidoExpress', false, 1)],
  'Courier': [_nv('88431', 'Orange', 'Hospital Regional', 'P. Rojas', 'RápidoExpress', false, 1)],
  'En Ruta': [_nv('97125', 'PTM', 'Clínica Los Andes', 'M. González', 'Transportes Andes', true, 1), _nv('55070', 'Farmapack', 'Clínica Norte', 'C. Díaz', 'CargoNorte', false, 2)],
  'Entregado': [_nv('88431', 'Orange', 'Hospital Regional', 'P. Rojas', 'RápidoExpress', false, 0), _nv('97090', 'PTM', 'Policlínico Oriente', 'M. González', 'LogiSur', false, 0)],
};
export async function getTV() {
  await delay(200);
  const estados = TV_EST.map((e) => { const nvs = TV_DATA[e.estado] || []; return { estado: e.estado, color: e.color, icon: e.icon, nvs, cantidad: nvs.length + e.base }; });
  const total = estados.reduce((a, e) => a + e.cantidad, 0);
  const urgentes = Object.values(TV_DATA).flat().filter((n) => n.urgente);
  return { estados, total, urgentes };
}

// ── Configuración (catálogos) ────────────────────────────────────────────────
export async function getCatalogo(tipo) {
  await delay(150);
  if (tipo === 'transportistas') {
    return [...new Set(MOCK_RANK_TRANSP.map((t) => t.nombre))].map((n) => ({ nombre: n, activo: true }));
  }
  return [...new Set(MOCK_RANK_VEND.map((v) => v.nombre))].map((n) => ({ nombre: n, activo: true }));
}
export async function guardarCatalogo(/* tipo, items */) { await delay(200); return { ok: true }; }

// ── Auditoría ────────────────────────────────────────────────────────────────
export async function getAuditoria(/* sub, filtros */) { await delay(150); return { ok: true }; }

// Re-exports útiles para las pantallas (colores de estado, etc.).
export { ESTADO_COLOR };
