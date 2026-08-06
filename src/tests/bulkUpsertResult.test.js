import { describe, expect, it } from 'vitest';
import { normalizeBulkUpsertResult } from '../lib/bulkUpsertResult';

describe('normalizeBulkUpsertResult', () => {
  it('interpreta la respuesta actual accepted/skipped/total', () => {
    expect(normalizeBulkUpsertResult({ accepted: 998, skipped: 2, total: 1000 }, 1000)).toEqual({
      accepted: 998,
      skipped: 2,
      total: 1000,
      error: null
    });
  });

  it('mantiene compatibilidad con inserted/errors', () => {
    expect(normalizeBulkUpsertResult({ inserted: 500, errors: 0 }, 500)).toEqual({
      accepted: 500,
      skipped: 0,
      total: 500,
      error: null
    });
  });

  it('no convierte una respuesta desconocida en éxito de cero registros', () => {
    expect(normalizeBulkUpsertResult({}, 250)).toEqual({
      accepted: 0,
      skipped: 250,
      total: 250,
      error: 'Respuesta inesperada de bulk_upsert: faltan los contadores de resultado.'
    });
  });
});
