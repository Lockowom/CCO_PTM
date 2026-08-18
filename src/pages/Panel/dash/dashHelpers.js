// Helpers portados de panel- (format.ts, estados.ts, businessDays.ts) a JS plano.
// PR-009: los estados N.V. se DERIVAN de `operationalContracts.js` (SSOT).
import {
  ESTADO_NV,
  ESTADO_NV_MIGRACION,
  ESTADO_NV_ACTIVOS,
  ESTADO_NV_FLUJO
} from '../../../constants/operationalContracts';

/* ──────────────── format ──────────────── */

/** Recorta un timestamp ISO a YYYY-MM-DD. Retorna `fallback` si el valor es falsy o no es string válido. */
export function soloFecha(v, fallback = '') {
  if (!v) return fallback;
  return typeof v === 'string' && v.length >= 10 ? v.slice(0, 10) : String(v);
}

/**
 * Formatea una fecha a "DD-MM-YYYY" SIN usar `new Date(...)` → sin corrimiento
 * por zona horaria. Muestra el dato EXACTO guardado. Para nulos devuelve `fallback`.
 */
export function fmtFechaCL(v, fallback = '—') {
  if (!v) return fallback;
  const s = String(v).slice(0, 10);
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  return m ? `${m[3]}-${m[2]}-${m[1]}` : String(v);
}

/** "Hoy" en hora de Chile como "YYYY-MM-DD". */
export function hoyChile() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Santiago' });
}

/** Suma (o resta, con N negativo) días a una fecha "YYYY-MM-DD" sin corrimiento
 * de zona horaria (ancla a mediodía local). Devuelve "YYYY-MM-DD". */
export function sumaDias(fecha, dias) {
  const d = new Date(fecha + 'T12:00:00');
  d.setDate(d.getDate() + dias);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

/** Convierte hex (#rrggbb) a "r,g,b". Fallback al naranja PTM. */
export function hexToRgb(hex) {
  if (!hex) return '245,124,0';
  const c = hex.replace('#', '');
  const n = parseInt(c, 16);
  if (isNaN(n) || c.length < 6) return '245,124,0';
  return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
}

/** Convierte hex a {r, g, b} numéricos. */
export function hexToRgbObj(hex) {
  const m = hex.replace('#', '');
  return {
    r: parseInt(m.slice(0, 2), 16) || 0,
    g: parseInt(m.slice(2, 4), 16) || 0,
    b: parseInt(m.slice(4, 6), 16) || 0
  };
}

/* ──────────────── estados ──────────────── */

/** Nombres canónicos de los estados (la forma "nueva", capitalizada). */
export const ESTADOS = ESTADO_NV;

// Mapeo de estados VIEJOS (en MAYÚSCULAS) → nuevos canónicos.
export const ESTADO_MIGRACION = ESTADO_NV_MIGRACION;

export function normEstado(e) {
  return e ? ESTADO_MIGRACION[e] || e : '';
}

// Estados "activos" visibles en la lista de /ingresar (sin Entregado/Recibido*).
export const ESTADOS_ACTIVOS_LISTA = ESTADO_NV_ACTIVOS;

// Estados que implican que la NV ya salió a despacho (estampan fecha_despacho).
export const ESTADOS_DESPACHO = [
  ESTADOS.EN_RUTA,
  ESTADOS.ENTREGADO,
  ESTADOS.RECIBIDO_CONFORME,
  ESTADOS.RECIBIDO_OBS
];

export const ESTADOS_REQUIERE_COMPROMISO = [
  ESTADOS.EN_PROCESO,
  ESTADOS.SHIPPING,
  ESTADOS.EN_RUTA,
  ESTADOS.ENTREGADO
];

// Estados seleccionables en los dropdowns de alta/edición.
export const ESTADOS_SELECCIONABLES = ESTADO_NV_FLUJO;

export const ESTADO_COLOR = {
  [ESTADOS.EN_PROCESO]: '#f59e0b',
  [ESTADOS.SHIPPING]: '#8b5cf6',
  [ESTADOS.EN_RUTA]: '#06b6d4',
  [ESTADOS.ENTREGADO]: '#22c55e',
  [ESTADOS.RECIBIDO_CONFORME]: '#16a34a',
  [ESTADOS.RECIBIDO_OBS]: '#15803d'
};

/* ──────────────── businessDays ──────────────── */

/**
 * Suma `days` días hábiles (lun–vie) a `startDate`.
 * Si `startDate` cae en fin de semana, avanza al lunes antes de contar.
 */
export function addBusinessDays(startDate, days) {
  const result = new Date(startDate);
  let added = 0;
  // Si cae en sábado o domingo, avanzar al lunes
  const dow = result.getDay();
  if (dow === 0) result.setDate(result.getDate() + 1);
  else if (dow === 6) result.setDate(result.getDate() + 2);

  while (added < days) {
    result.setDate(result.getDate() + 1);
    const d = result.getDay();
    if (d !== 0 && d !== 6) added++;
  }
  return result;
}

/**
 * Calcula la fecha compromiso: base + 2 días hábiles.
 * Prioridad: `fechaAprobacionReal` > `fechaAprobacion`.
 * Devuelve YYYY-MM-DD o "" si no hay fecha base.
 */
export function calcFechaCompromiso(fechaAprobacion, fechaAprobacionReal) {
  const base = fechaAprobacionReal || fechaAprobacion;
  if (!base) return '';
  const d = new Date(base + 'T12:00:00');
  if (isNaN(d.getTime())) return '';
  const result = addBusinessDays(d, 2);
  const y = result.getFullYear();
  const m = String(result.getMonth() + 1).padStart(2, '0');
  const day = String(result.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
