// ============================================================================
//  panelService — PUNTO ÚNICO DE CONEXIÓN A DATOS del Panel PTM.
//  (Equivalente a lib/queries.ts del repo panel-.)
//
//  LECTURAS: ya conectadas a DATOS REALES → leen `tms_operaciones` (migrada del
//  Panel) vía panelQueries.js. Todas las pantallas (Dashboard, Info, TV,
//  Detalle, Catálogos) consumen desde aquí, sin importar los cálculos.
//  ESCRITURAS (lookupNV/guardarNV): aún simuladas — se conectan en la fase de
//  escrituras nativas (RPC SECURITY DEFINER + cutover del Sheet).
// ============================================================================
import { getDashboard as qDashboard, getDetalle as qDetalle, buscarNV as qBuscar,
  getTV as qTV, getCatalogo as qCatalogo } from './panelQueries';
import { ESTADO_COLOR } from './mock';

const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms));

// ── Dashboard (REAL) ─────────────────────────────────────────────────────────
export async function getDashboard() { return qDashboard(); }
export async function getDetalle(titulo, count) { return qDetalle(titulo, count); }

// ── Info N.V. (REAL) ─────────────────────────────────────────────────────────
export async function buscarNV(query) { return qBuscar(query); }

// ── Modo TV (REAL) ───────────────────────────────────────────────────────────
export async function getTV() { return qTV(); }

// ── Configuración / catálogos (REAL, derivados de operaciones) ───────────────
export async function getCatalogo(tipo) { return qCatalogo(tipo); }
export async function guardarCatalogo(/* tipo, items */) { await delay(200); return { ok: true }; }

// ── Ingresar N.V. (escrituras — pendiente Fase 4) ────────────────────────────
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
  return { ok: true, nv: payload?.nv, mode: payload?.mode };
}

// ── Auditoría (pendiente) ────────────────────────────────────────────────────
export async function getAuditoria(/* sub, filtros */) { await delay(150); return { ok: true }; }

export { ESTADO_COLOR };
