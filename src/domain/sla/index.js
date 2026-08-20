import { SLA_NV_ETAPA_HORAS, SLA_NV_TOTAL_HORAS } from '../../constants/operationalContracts';
import { normalizeNvState } from '../nv/states';

export const SLA_PRECISION = Object.freeze({
  EXACT: 'EXACT',
  DAY: 'DAY',
  ESTIMATED: 'ESTIMATED',
  UNKNOWN: 'UNKNOWN'
});

export function normalizeSlaDate(value, precision = SLA_PRECISION.UNKNOWN) {
  if (!value) return { value: null, precision: SLA_PRECISION.UNKNOWN };
  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.getTime())) return { value: null, precision: SLA_PRECISION.UNKNOWN };
  return { value: parsed, precision };
}

export function calculateSlaStatus({ state, startedAt, now = new Date(), precision }) {
  const normalizedState = normalizeNvState(state);
  const targetHours = SLA_NV_ETAPA_HORAS[normalizedState];
  const start = normalizeSlaDate(startedAt, precision);
  if (start.value == null || targetHours == null) {
    return {
      status: 'UNKNOWN',
      precision: SLA_PRECISION.UNKNOWN,
      targetHours: targetHours ?? null
    };
  }
  const elapsedHours = Math.max(0, (now.getTime() - start.value.getTime()) / 3_600_000);
  const remainingHours = targetHours - elapsedHours;
  return {
    status:
      remainingHours < 0
        ? 'BREACHED'
        : remainingHours <= Math.min(4, targetHours * 0.2)
          ? 'AT_RISK'
          : 'ON_TRACK',
    precision: start.precision,
    targetHours,
    elapsedHours,
    remainingHours
  };
}

export { SLA_NV_ETAPA_HORAS, SLA_NV_TOTAL_HORAS };
