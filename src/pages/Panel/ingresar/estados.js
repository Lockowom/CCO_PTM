// Fuente única de verdad para estados del flujo logístico (port de lib/estados.ts).
//
// ⚠️ Cada string canónico se escribe UNA sola vez: en `ESTADOS`. Todo lo demás
// (listas, colores, migración) se construye a partir de ese objeto, para que no
// puedan divergir ortografías ("En Ruta" vs "EN RUTA" vs "en_ruta").

/** Nombres canónicos de los estados (la forma "nueva", capitalizada). */
export const ESTADOS = {
  EN_PROCESO: "En Proceso",
  P_VENDEDOR: "P / VENDEDOR",
  P_STOCK: "P / STOCK",
  P_RETIRO: "P / RETIRO",
  SHIPPING: "Shipping",
  CURRIER: "Currier",
  EN_RUTA: "En Ruta",
  ENTREGADO: "Entregado",
  RECIBIDO_CONFORME: "Recibido Conforme",
  RECIBIDO_OBS: "Recibido C/OBS",
};

// Mapeo de estados VIEJOS (en MAYÚSCULAS) → nuevos canónicos. La data histórica
// trae ambas formas conviviendo; `normEstado` aplica este mapeo.
// ⚠️ ENTREGADO viejo + "Recibido Conforme" + "Recibido C/OBS" se FUSIONAN en un
// único estado terminal "Entregado" (decisión julio 2026: un solo estado final).
export const ESTADO_MIGRACION = {
  "EN PROCESO": ESTADOS.EN_PROCESO,
  "EN SHIPPING": ESTADOS.SHIPPING,
  "EN RUTA": ESTADOS.EN_RUTA,
  "ENTREGADO": ESTADOS.ENTREGADO,
  "RECIBIDO CONFORME": ESTADOS.ENTREGADO,
  "RECIBIDO C/OBS": ESTADOS.ENTREGADO,
  "Recibido Conforme": ESTADOS.ENTREGADO,
  "Recibido C/OBS": ESTADOS.ENTREGADO,
};

export function normEstado(e) {
  return e ? (ESTADO_MIGRACION[e] || e) : "";
}

// Estados "activos" visibles en la lista de /ingresar (sin Entregado/Recibido*).
export const ESTADOS_ACTIVOS_LISTA = [
  ESTADOS.EN_PROCESO, ESTADOS.P_VENDEDOR, ESTADOS.P_STOCK, ESTADOS.P_RETIRO,
  ESTADOS.SHIPPING, ESTADOS.CURRIER, ESTADOS.EN_RUTA,
];

// Estados que implican que la NV ya salió a despacho (estampan fecha_despacho).
export const ESTADOS_DESPACHO = [
  ESTADOS.CURRIER, ESTADOS.EN_RUTA, ESTADOS.ENTREGADO, ESTADOS.RECIBIDO_CONFORME, ESTADOS.RECIBIDO_OBS,
];

export const ESTADOS_REQUIERE_COMPROMISO = [
  ESTADOS.EN_PROCESO, ESTADOS.P_VENDEDOR, ESTADOS.P_STOCK, ESTADOS.P_RETIRO,
  ESTADOS.SHIPPING, ESTADOS.CURRIER, ESTADOS.EN_RUTA, ESTADOS.ENTREGADO,
];

// Estados seleccionables en los dropdowns de alta/edición (form individual y modal).
// "Entregado" es el estado terminal único (ya no se ofrece Recibido Conforme/C/OBS).
export const ESTADOS_SELECCIONABLES = [
  ESTADOS.EN_PROCESO, ESTADOS.SHIPPING, ESTADOS.CURRIER, ESTADOS.EN_RUTA,
  ESTADOS.ENTREGADO,
];

export const ESTADO_COLOR = {
  [ESTADOS.EN_PROCESO]: "#f59e0b",
  [ESTADOS.P_VENDEDOR]: "#d97706",
  [ESTADOS.P_STOCK]: "#b45309",
  [ESTADOS.P_RETIRO]: "#92400e",
  [ESTADOS.SHIPPING]: "#8b5cf6",
  [ESTADOS.CURRIER]: "#7c3aed",
  [ESTADOS.EN_RUTA]: "#06b6d4",
  [ESTADOS.ENTREGADO]: "#22c55e",
  [ESTADOS.RECIBIDO_CONFORME]: "#16a34a",
  [ESTADOS.RECIBIDO_OBS]: "#15803d",
};

export function esActivo(estado) {
  return ESTADOS_ACTIVOS_LISTA.includes(estado);
}

export function requiereDespacho(estado) {
  return ESTADOS_DESPACHO.includes(estado);
}

export function requiereCompromiso(estado) {
  return ESTADOS_REQUIERE_COMPROMISO.includes(estado);
}

// ¿El estado implica despacho, comparando sin distinguir mayúsculas? Sirve para
// el autofill de fechas, donde `estado` puede venir aún en forma vieja
// ("EN RUTA", "CURRIER") antes de normalizar.
export function estampaDespacho(estado) {
  const up = (estado || "").toUpperCase();
  return ESTADOS_DESPACHO.some((e) => e.toUpperCase() === up);
}
