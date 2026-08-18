import { describe, expect, it } from 'vitest';
import { buildPutawayRecord, putawayQueueKey, isValidPutaway, PUTAWAY_STEPS, PUTAWAY_COPY } from '../pages/Mobile/putawayVisual';

// PR-015 · contrato Put Away visual del PDA (TXT 01 §3 + TXT 04 §9-11).
// El Put Away es referencia visual: NO pide ni persiste cantidad; es
// idempotente por (ubicacion, codigo); copia clara de que no toca stock ERP.

describe('PR-015 · Put Away visual — sin cantidad', () => {
  it('el flujo es SCAN_LOC → SCAN_SKU → CONFIRM (sin paso de cantidad)', () => {
    expect(PUTAWAY_STEPS).toEqual(['SCAN_LOC', 'SCAN_SKU', 'CONFIRM']);
    expect(PUTAWAY_STEPS).not.toContain('ENTER_QTY');
    expect(PUTAWAY_STEPS).not.toContain('QTY');
  });

  it('buildPutawayRecord no incluye campo cantidad', () => {
    const rec = buildPutawayRecord({ ubicacion: 'rack-a-01', codigo: 'sku123', descripcion: 'X' });
    expect(rec).toEqual({
      ubicacion: 'RACK-A-01',
      codigo: 'SKU123',
      descripcion: 'X'
    });
    expect('cantidad' in rec).toBe(false);
    expect('qty' in rec).toBe(false);
  });

  it('normaliza a mayúsculas y trim', () => {
    const rec = buildPutawayRecord({ ubicacion: '  rack-a-01 ', codigo: ' sku ', descripcion: '  ' });
    expect(rec.ubicacion).toBe('RACK-A-01');
    expect(rec.codigo).toBe('SKU');
    expect(rec.descripcion).toBeNull(); // vacío → null
  });
});

describe('PR-015 · idempotencia y validación', () => {
  it('putawayQueueKey es determinista por (ubicacion, codigo)', () => {
    const a = putawayQueueKey({ ubicacion: 'rack-a-01', codigo: 'SKU123' });
    const b = putawayQueueKey({ ubicacion: '  RACK-A-01 ', codigo: 'sku123' });
    expect(a).toBe(b);
    expect(a).toBe('putaway_RACK-A-01_SKU123');
  });

  it('claves distintas para combinaciones distintas', () => {
    const a = putawayQueueKey({ ubicacion: 'rack-a-01', codigo: 'SKU123' });
    const c = putawayQueueKey({ ubicacion: 'rack-a-01', codigo: 'SKU456' });
    expect(a).not.toBe(c);
  });

  it('isValidPutaway exige ubicación y código', () => {
    expect(isValidPutaway({ ubicacion: 'rack-a-01', codigo: 'SKU123' })).toBe(true);
    expect(isValidPutaway({ ubicacion: '', codigo: 'SKU123' })).toBe(false);
    expect(isValidPutaway({ ubicacion: 'rack-a-01', codigo: '  ' })).toBe(false);
  });
});

describe('PR-015 · copia operacional', () => {
  it('declara que es referencia visual y no modifica stock ERP', () => {
    expect(PUTAWAY_COPY.title).toBe('Registrar ubicación visual');
    expect(PUTAWAY_COPY.note).toBe('No modifica stock ERP.');
  });
});