import { describe, expect, it } from 'vitest';
import {
  absAssignmentCopy,
  isAbsSkuSearch,
  latestAbsAssignment,
  normalizeAbsSku
} from '../lib/absAssignments';

describe('ABS-LOC-001 · historial de asignación visual', () => {
  it('normaliza los SKU sin convertir una descripción en búsqueda de SKU', () => {
    expect(normalizeAbsSku(' n022350020 ')).toBe('N022350020');
    expect(isAbsSkuSearch('N022350020')).toBe(true);
    expect(isAbsSkuSearch('Resucitador manual')).toBe(false);
  });

  it('muestra la última asignación aunque ya se haya liberado', () => {
    const latest = latestAbsAssignment([
      { ubicacion: 'E-01-01', estado: 'LIBERADA', asignada_en: '2026-11-02T10:00:00Z' },
      { ubicacion: 'E-02-01', estado: 'TRASLADADA', asignada_en: '2026-11-01T10:00:00Z' }
    ]);

    expect(latest.ubicacion).toBe('E-01-01');
    expect(absAssignmentCopy(latest)).toMatchObject({
      title: 'Última ubicación ABS',
      detail: expect.stringContaining('E-01-01')
    });
  });

  it('declara una asignación activa sin inferir cantidad ni stock', () => {
    const copy = absAssignmentCopy({ ubicacion: 'A-01-01', estado: 'ACTIVA' });
    expect(copy).toMatchObject({ title: 'Ubicación ABS activa' });
    expect(copy.detail).not.toMatch(/stock|cantidad|ERP/i);
  });
});
