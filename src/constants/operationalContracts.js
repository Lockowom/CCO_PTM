/**
 * PR-002 · Contratos operacionales CCO 2.0 (TXT 01)
 *
 * SSOT por dominio. Ningún componente debe hardcodear estas reglas: si cambia
 * la definición de un contrato, cambia SOLO aquí y en la migración SQL que lo
 * respalda. Fuente canónica del documento: `docs/PR-002_CONTRATOS_OPERACIONALES.md`.
 */

// ── SSOT por dominio ──────────────────────────────────────────────────────────
// Qué sistema es la fuente de verdad para cada tipo de dato.
export const SSOT = Object.freeze({
  // El stock OFICIAL es el ERP (Softland). CCO muestra/escribe espejos operativos,
  // pero ningún flujo CCO descuenta stock: el ERP es el único que transacciona.
  STOCK: 'ERP',
  // La ubicación (Put Away) es una ubicación VISUAL de CCO (wms_ubicaciones):
  // no transacciona inventario, solo señala dónde está físicamente el material.
  LOCATION: 'CCO_VISUAL',
  // El conteo es una OBSERVACIÓN física que se compara contra el ERP; NO ajusta
  // stock automáticamente. El ajuste requiere aprobación y va por RPC dedicada.
  COUNT: 'OBSERVACION_CCO',
  // Picking y Packing son procesos físicos contenidos dentro del estado
  // operativo "En Proceso" — NO son transacciones de inventario.
  PICKING_PACKING: 'EN_PROCESO',
  // Calidad usa la ubicación visual CCO; sus lotes/series vienen del stock ERP.
  QUALITY_LOCATION: 'CCO',
  QUALITY_STOCK: 'ERP',
  QUALITY_BATCH_SERIAL: 'ERP'
});

// ── Estados operativos ────────────────────────────────────────────────────────
// Definición oficial de los estados del flujo. `key` es el valor guardado.
// `etapa` agrupa los estados en etapas de vida de la N.V.
export const ESTADO_FLUJO = Object.freeze({
  // Pendientes de aprobación / preparación
  PENDIENTE: 'Pendiente',
  APROBADA: 'Aprobada',
  PENDIENTE_PICKING: 'Pendiente Picking',
  PACKING: 'PACKING',
  LISTO_DESPACHO: 'LISTO_DESPACHO',
  PENDIENTE_SHIPPING: 'Pendiente Shipping',
  DESPACHADO: 'Despachado',
  ENTREGADO: 'ENTREGADO',

  // Estados terminales / descartados (NO cuentan como activas)
  NULA: 'NULA',
  REFACTURACION: 'Refacturacion',
  SOLO_FACTURAR: 'SOLO_FACTURAR',
  QUIEBRE_STOCK: 'QUIEBRE_STOCK'
});

export const ESTADOS_ACTIVOS = Object.freeze([
  ESTADO_FLUJO.PENDIENTE,
  ESTADO_FLUJO.APROBADA,
  ESTADO_FLUJO.PENDIENTE_PICKING,
  ESTADO_FLUJO.PACKING,
  ESTADO_FLUJO.LISTO_DESPACHO,
  ESTADO_FLUJO.PENDIENTE_SHIPPING,
  ESTADO_FLUJO.DESPACHADO,
  ESTADO_FLUJO.ENTREGADO
]);

// Estados descartados: no cuentan para métricas de pipeline activo.
export const ESTADOS_DESCARTADOS = Object.freeze([
  ESTADO_FLUJO.NULA,
  ESTADO_FLUJO.REFACTURACION,
  ESTADO_FLUJO.SOLO_FACTURAR
]);

// ── SLA por etapa (lead time objetivo, en horas) ─────────────────────────────
export const SLA_ETAPA_HORAS = Object.freeze({
  [ESTADO_FLUJO.PENDIENTE]: 4,
  [ESTADO_FLUJO.APROBADA]: 4,
  [ESTADO_FLUJO.PENDIENTE_PICKING]: 8,
  [ESTADO_FLUJO.PACKING]: 8,
  [ESTADO_FLUJO.LISTO_DESPACHO]: 12,
  [ESTADO_FLUJO.PENDIENTE_SHIPPING]: 12,
  [ESTADO_FLUJO.DESPACHADO]: 24,
  [ESTADO_FLUJO.ENTREGADO]: 0 // terminal
});

// SLA total objetivo de la N.V. (de Pendiente a Entregado), en horas.
export const SLA_NV_TOTAL_HORAS = 72;

// ── Gates de stock (prohibiciones absolutas, TXT 00) ─────────────────────────
// Ninguno de estos flujos PUEDE producir un efecto secundario sobre el stock.
export const STOCK_SIDE_EFFECT_PROHIBITIONS = Object.freeze({
  VISUAL_LOCATION: true, // Put Away (ubicación visual) NO descuenta stock
  COUNT: true, // Conteo NO ajusta stock automáticamente
  ROUTE: true, // Rutas NO transaccionan stock
  TMS: true, // TMS NO transacciona stock
  PICKING: true, // Picking NO descuenta stock
  PACKING: true // Packing NO descuenta stock
});

// ── RPC de ajuste: única vía permitida para tocar stock desde CCO ────────────
export const AJUSTE_STOCK_RPC = Object.freeze({
  CONTEO: 'conteo_ajuste_erp',
  TRASPASO: 'wms_move_stock'
});

// ── Estados N.V. (flujo logístico del Panel PTM) ─────────────────────────────
// SSOT de los strings canónicos capitalizados que usan /panel (dashHelpers y
// ingresar/estados). PR-009: los archivos del Panel deben DERIVAR de aquí y no
// hardcodear ortografías. `key` = string canónico guardado en tms_operaciones.
export const ESTADO_NV = Object.freeze({
  EN_PROCESO: 'En Proceso',
  SHIPPING: 'Shipping',
  EN_RUTA: 'En Ruta',
  ENTREGADO: 'Entregado',
  RECIBIDO_CONFORME: 'Recibido Conforme',
  RECIBIDO_OBS: 'Recibido C/OBS'
});

// Normalización de variantes VIEJAS (MAYÚSCULAS) y sub-estados → canónico.
// ⚠️ ENTREGADO viejo + Recibido Conforme/C/OBS se fusionan en "Entregado"
// (decisión julio 2026: un solo estado terminal).
export const ESTADO_NV_MIGRACION = Object.freeze({
  'EN PROCESO': ESTADO_NV.EN_PROCESO,
  'EN SHIPPING': ESTADO_NV.SHIPPING,
  'P / VENDEDOR': ESTADO_NV.SHIPPING,
  'P / STOCK': ESTADO_NV.EN_PROCESO,
  'P / RETIRO': ESTADO_NV.SHIPPING,
  CURRIER: ESTADO_NV.EN_RUTA,
  Currier: ESTADO_NV.EN_RUTA,
  'EN RUTA': ESTADO_NV.EN_RUTA,
  ENTREGADO: ESTADO_NV.ENTREGADO,
  'RECIBIDO CONFORME': ESTADO_NV.ENTREGADO,
  'RECIBIDO C/OBS': ESTADO_NV.ENTREGADO,
  'Recibido Conforme': ESTADO_NV.ENTREGADO,
  'Recibido C/OBS': ESTADO_NV.ENTREGADO
});

// NVs activas (excluye terminales): visibles en lista /ingresar y KPIs activos.
export const ESTADO_NV_ACTIVOS = Object.freeze([
  ESTADO_NV.EN_PROCESO,
  ESTADO_NV.SHIPPING,
  ESTADO_NV.EN_RUTA
]);

// Flujo lineal permitido para transiciones manuales (nuevo → terminal).
export const ESTADO_NV_FLUJO = Object.freeze([
  ESTADO_NV.EN_PROCESO,
  ESTADO_NV.SHIPPING,
  ESTADO_NV.EN_RUTA,
  ESTADO_NV.ENTREGADO
]);

// ── SLA N.V. (lead time objetivo) ────────────────────────────────────────────
// Etapa → horas objetivo entre transiciones. El SLA TOTAL de la N.V. es 72 h
// (de En Proceso a Entregado).
export const SLA_NV_ETAPA_HORAS = Object.freeze({
  [ESTADO_NV.EN_PROCESO]: 24,
  [ESTADO_NV.SHIPPING]: 24,
  [ESTADO_NV.EN_RUTA]: 24,
  [ESTADO_NV.ENTREGADO]: 0 // terminal
});