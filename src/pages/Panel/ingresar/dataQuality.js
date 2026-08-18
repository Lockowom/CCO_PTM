// PR-016 · Data quality del módulo Ingresar N.V. (TXT 05 §22).
//
// Normaliza/sanea el payload ANTES de enviarlo a la RPC `guardar_nv`. Reglas
// espejo del trigger de BD (`tms_operaciones_norm_estado` y normalización de
// N.V.) para que el cliente envíe datos limpios y el match sea exacto.
// 100% puras y testeables (sin I/O).

import { ESTADOS_SELECCIONABLES } from './estados';

// Normaliza la N.V. igual que la BD (trigger): quita espacios y sufijo ".0".
export const normNV = (v) => {
  const t = String(v ?? '').trim();
  return /^\d+\.0+$/.test(t) ? t.split('.')[0] : t;
};

// Normaliza texto genérico: trim + colapsa espacios + nulos → ''.
export const normText = (v) =>
  String(v ?? '')
    .trim()
    .replace(/\s+/g, ' ');

// Número seguro: acepta "12", "12.5", "1.234", comas de miles chilenas
// ("1.234,5") y devuelve Number o null. Rechaza texto no numérico.
export function normNumber(v) {
  if (v === null || v === undefined || v === '') return null;
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  const s = String(v).trim().replace(/\./g, '').replace(',', '.');
  if (!/^-?\d+(\.\d+)?$/.test(s)) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

// Recorta un timestamp ISO a YYYY-MM-DD (fecha de `<input type="date">`).
export function soloFecha(v, fallback = '') {
  if (!v) return fallback;
  return typeof v === 'string' && v.length >= 10 ? v.slice(0, 10) : String(v);
}

// Versión optimista: la N.V. se identifica por su `fecha_estado` (la estampa
// el trigger en cada cambio). Si otro operador la modificó, el `fecha_estado`
// cambia → la versión del cliente queda stale → CONFLICT (sin pisar).
export function versionDe(row) {
  if (!row) return null;
  return soloFecha(row.fecha_estado, '') || null;
}

// ¿El estado destino es válido para selección manual?
export function esEstadoValido(estado) {
  return ESTADOS_SELECCIONABLES.includes(estado);
}

// Limpia el estado: si viene vacío/null → primer estado seleccionable.
export function normEstadoInput(estado) {
  const v = normText(estado);
  return esEstadoValido(v) ? v : ESTADOS_SELECCIONABLES[0];
}

/**
 * Sanea el payload de guardado. Devuelve un objeto NUEVO con los campos
 * normalizados; no muta el input. Campos no reconocidos se conservan tal cual.
 * @param {object} raw  payload crudo del form (mismo shape que guardar()).
 */
export function sanitizePayload(raw = {}) {
  const p = { ...raw };

  p.nv = normNV(p.nv);
  p.estado = normEstadoInput(p.estado);

  // Cliente/vendedor/transportista/guía/factura: texto limpio.
  ['cliente', 'vendedor', 'transportista', 'guia', 'factura', 'numeroEnvio'].forEach((k) => {
    if (k in p) p[k] = normText(p[k]);
  });

  // Fechas: recortar timestamps a YYYY-MM-DD.
  ['fechaCompromiso', 'fechaAprobacion', 'fechaAprobacionReal', 'fechaDespacho'].forEach((k) => {
    if (k in p) p[k] = soloFecha(p[k]);
  });

  // Números: bultos y valor factura → Number/null ('' → null).
  if ('bultos' in p) p.bultos = normNumber(p.bultos);
  if ('valorFactura' in p) p.valorFactura = normNumber(p.valorFactura);

  // Booleano estricto.
  if ('urgente' in p) p.urgente = p.urgente === true || p.urgente === 'true';

  // Campos del canal "Varios" e incidencias: texto limpio (nulos → '').
  ['variosCliente', 'variosVendedor', 'variosDivision', 'variosCcosto'].forEach((k) => {
    if (k in p) p[k] = normText(p[k]);
  });
  if ('incidencia' in p) p.incidencia = normText(p.incidencia);
  if ('observacionesIncidencia' in p)
    p.observacionesIncidencia = normText(p.observacionesIncidencia);

  return p;
}

/**
 * Extrae del payload los campos que realmente importan para el guardado
 * (para el resumen/audit) — sin datos sensibles ni ruido.
 */
export function resumenPayload(p = {}) {
  return {
    id: p?.id ?? null,
    mode: p?.mode || null,
    canal: p?.canal || null,
    nv: normNV(p?.nv || ''),
    estado: p?.estado || null,
    urgente: p?.urgente === true,
    transportista: p?.transportista || null,
    version: p?.version || null
  };
}

// ¿El payload tiene ALGÚN campo que mutaría inventario? La regla CCO 2.0 es
// "No inventory mutation": Ingresar N.V. solo toca tms_operaciones. Este check
// es una red de seguridad para que nunca se envíen campos de stock.
const CAMPOS_INVENTARIO = new Set([
  'cantidad',
  'stock',
  'sku',
  'codigo_producto',
  'ubicacion',
  'partida',
  'serie',
  'lote',
  'wms_move_stock',
  'ajuste'
]);

export function tieneCamposInventario(p = {}) {
  const keys = Object.keys(p || {}).map((k) => String(k).toLowerCase());
  return keys.some((k) => CAMPOS_INVENTARIO.has(k));
}

// ── Conflicto de edición (UX): diff legible servidor vs. intento local ──────
// Etiquetas legibles para el modal de conflicto (punto 6 de la review PR-016):
// al recibir CONFLICT, el usuario debe ver QUÉ cambió el otro operador y QUÉ
// tenía editado él, no solo "inténtalo de nuevo".
export const CAMPOS_LABEL = {
  transportista: 'Transportista',
  guia: 'Guía',
  factura: 'Factura',
  estado: 'Estado',
  urgente: 'Urgente',
  fechaCompromiso: 'Fecha compromiso',
  fechaAprobacion: 'Fecha aprobación',
  fechaDespacho: 'Fecha despacho',
  bultos: 'Bultos',
  valorFactura: 'Valor factura',
  numeroEnvio: 'N° envío',
  cliente: 'Cliente',
  vendedor: 'Vendedor',
  incidencia: 'Incidencia'
};

function formatoValor(v) {
  if (v === null || v === undefined || v === '') return '—';
  if (v === true) return 'Sí';
  if (v === false) return 'No';
  return String(v);
}

/**
 * Compara lo que el usuario cargó vs. la versión actual del servidor y el
 * intento de guardado del usuario. Devuelve las dos listas para el modal:
 *   - serverChanges: campos que OTRO operador modificó (cargado → servidor)
 *   - tusChanges:    campos que el usuario intentó escribir (y NO se aplicaron)
 * 100% puro y testeable.
 */
export function diffNvConflict(loaded, server, intent = {}) {
  const loadedData = loaded || {};
  const serverData = server || {};
  const serverChanges = [];
  const tusChanges = [];

  for (const key of Object.keys(CAMPOS_LABEL)) {
    const label = CAMPOS_LABEL[key];
    const cargado = loadedData[key];
    const servidor = serverData[key];
    if (formatoValor(cargado) !== formatoValor(servidor)) {
      serverChanges.push({ label, de: formatoValor(cargado), a: formatoValor(servidor) });
    }
    if (key in intent && formatoValor(intent[key]) !== formatoValor(servidor)) {
      tusChanges.push({ label, a: formatoValor(intent[key]) });
    }
  }

  return { serverChanges, tusChanges };
}
