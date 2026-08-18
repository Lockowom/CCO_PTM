// PR-015 · Put Away visual del PDA (TXT 01 §3 + TXT 04 §9-11).
//
// Contrato: el Put Away de CCO es una REFERENCIA VISUAL de ubicación.
// - NO pide ni persiste cantidad (stock ERP no se toca).
// - Flujo: SCAN_LOC → SCAN_SKU → CONFIRM.
// - Idempotente: mismo (ubicacion, codigo) no duplica registros en la cola.
// - Cola por usuario (userId lo etiqueta enqueueSyncItem).

export const PUTAWAY_STEPS = ['SCAN_LOC', 'SCAN_SKU', 'CONFIRM'];

export const PUTAWAY_COPY = {
  title: 'Registrar ubicación visual',
  note: 'No modifica stock ERP.',
  scanLocation: 'ESCANEAR UBICACIÓN',
  scanSku: 'ESCANEAR PRODUCTO',
  confirm: 'CONFIRMAR UBICACIÓN',
};

/**
 * Record que se envía al RPC registrar_putaway_ubicaciones.
 * SIN campo cantidad: la acción no persiste cantidad real.
 */
export const buildPutawayRecord = ({ ubicacion, codigo, descripcion = null }) => {
  const d = String(descripcion || '').trim();
  return {
    ubicacion: String(ubicacion || '').trim().toUpperCase(),
    codigo: String(codigo || '').trim().toUpperCase(),
    descripcion: d || null,
  };
};

/**
 * Clave idempotente de cola offline. Un mismo (ubicacion, codigo) re-encolado
 * sobrescribe el pendiente en vez de duplicar (recordId = clave de syncQueue).
 */
export const putawayQueueKey = ({ ubicacion, codigo }) =>
  `putaway_${String(ubicacion || '').trim().toUpperCase()}_${String(codigo || '').trim().toUpperCase()}`;

/** El registro es válido solo si ubicaón y código están presentes. */
export const isValidPutaway = ({ ubicacion, codigo }) =>
  Boolean(String(ubicacion || '').trim()) && Boolean(String(codigo || '').trim());