import { describe, expect, it } from 'vitest';
import {
  classifyPutawayRow,
  normalizePutawayLocation,
  parsePutawaySheetRows
} from '../lib/putawayBulk';

describe('putawayBulk', () => {
  it('normaliza posiciones y niveles numéricos', () => {
    expect(normalizePutawayLocation('e-8-1')).toBe('E-08-01');
    expect(normalizePutawayLocation(' E.08/03 ')).toBe('E-08-03');
  });

  it('no convierte códigos de SKU inexistentes en una carga válida', () => {
    const row = classifyPutawayRow({
      raw: { ubicacion: 'E-8-1', codigo: 'SKU-MAL' },
      rowNumber: 2,
      skuByCode: new Map(),
      activeLocations: new Set(['E-08-01'])
    });
    expect(row.status).toBe('ERROR');
    expect(row.reason).toBe('SKU no encontrado en maestro');
  });

  it('recupera la descripción del maestro y no usa una descripción del archivo', () => {
    const row = classifyPutawayRow({
      raw: { ubicacion: 'E-8-1', codigo: 'n022350020' },
      rowNumber: 2,
      skuByCode: new Map([['N022350020', { producto: 'Producto maestro' }]]),
      activeLocations: new Set(['E-08-01'])
    });
    expect(row).toMatchObject({ status: 'READY', ubicacion: 'E-08-01', descripcion: 'Producto maestro' });
  });

  it('acepta cabeceras de Excel y omite filas totalmente vacías', () => {
    expect(parsePutawaySheetRows([['UBICACIÓN', 'SKU'], ['E-8-1', 'N022350020'], ['', '']])).toEqual([
      { rowNumber: 2, ubicacion: 'E-8-1', codigo: 'N022350020' }
    ]);
  });
});
