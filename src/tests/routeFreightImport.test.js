import { describe, expect, it } from 'vitest';
import { normalizeFreightRows } from '../pages/Panel/rutas/routeFreightImport';

describe('importación histórica de fletes', () => {
  it('reconoce encabezados habituales y normaliza fecha/peso', () => {
    const [row] = normalizeFreightRows([
      {
        'FECHA DESPACHO': '15-08-2026',
        'N° NV': '99881',
        'EMPRESA TRANSPORTE': 'Marchant',
        BULTOS: 3,
        'PESO KG': '79,3',
        COMUNA: 'Quilicura'
      }
    ]);
    expect(row).toMatchObject({
      fecha_despacho: '2026-08-15',
      nv: '99881',
      transportista: 'Marchant',
      bultos: 3,
      kilos: 79.3,
      comuna: 'Quilicura'
    });
  });

  it('descarta filas vacías y no inventa clasificación propia/externa', () => {
    const rows = normalizeFreightRows([
      { CLIENTE: 'Clínica Norte', KILOS: 20 },
      { CLIENTE: '   ', KILOS: 30 }
    ]);
    expect(rows).toHaveLength(1);
    expect(rows[0].tipo_transporte).toBe('SIN_CLASIFICAR');
  });
});
