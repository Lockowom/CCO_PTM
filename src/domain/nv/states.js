import {
  ESTADO_NV,
  ESTADO_NV_ACTIVOS,
  ESTADO_NV_FLUJO,
  ESTADO_NV_MIGRACION
} from '../../constants/operationalContracts';

export { ESTADO_NV, ESTADO_NV_ACTIVOS, ESTADO_NV_FLUJO, ESTADO_NV_MIGRACION };

export function normalizeNvState(value) {
  if (value == null) return null;
  const text = String(value).trim();
  return ESTADO_NV_MIGRACION[text] || ESTADO_NV_MIGRACION[text.toUpperCase()] || text;
}

export function nextNvState(value) {
  const normalized = normalizeNvState(value);
  const index = ESTADO_NV_FLUJO.indexOf(normalized);
  return index >= 0 && index < ESTADO_NV_FLUJO.length - 1 ? ESTADO_NV_FLUJO[index + 1] : null;
}

export function canTransitionNv(from, to) {
  return nextNvState(from) === normalizeNvState(to);
}

export default ESTADO_NV;
