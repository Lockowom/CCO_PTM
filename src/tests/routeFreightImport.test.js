import { describe, expect, it } from 'vitest';
import {
  consolidateFreightOrders,
  normalizeFreightRows
} from '../pages/Panel/rutas/routeFreightImport';

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
  it('consolida documentos de una orden Transfarma sin duplicar bultos ni kilos', () => {
    const rows = normalizeFreightRows(
      [
        {
          'ORDEN FLETE': '262479856',
          'DOCT. CLIENTE': '27166',
          'FECHA EMISION': '19-01-2026',
          DESTINO: 'Puchuncavi',
          BULTOS: 1,
          KILOS: 1
        },
        {
          'ORDEN FLETE': '262479856',
          'DOCT. CLIENTE': '78014',
          'FECHA EMISION': '19-01-2026',
          DESTINO: 'Puchuncavi',
          BULTOS: 1,
          KILOS: 1
        }
      ],
      { defaultTransportista: 'Transfarma', defaultTipoTransporte: 'EXTERNO' }
    );
    const [order] = consolidateFreightOrders(rows);

    expect(order).toMatchObject({
      orden_flete: '262479856',
      cantidad_nv: 2,
      bultos: 1,
      kilos: 1,
      transportista: 'Transfarma',
      tipo_transporte: 'EXTERNO'
    });
    expect(order.factura).toContain('27166');
    expect(order.factura).toContain('78014');
  });
});
