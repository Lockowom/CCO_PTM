import { describe, it, expect } from 'vitest';
import { groupByNV } from '../utils/groupOrders';

describe('groupByNV', () => {
  it('agrupa filas por NV correctamente', () => {
    const rows = [
      { nv: 'NV-001', cliente: 'Farmacia A', codigo_producto: 'SKU1', cantidad: '10', estado: 'PACKING' },
      { nv: 'NV-001', cliente: 'Farmacia A', codigo_producto: 'SKU2', cantidad: '5', estado: 'PACKING' },
      { nv: 'NV-002', cliente: 'Farmacia B', codigo_producto: 'SKU3', cantidad: '20', estado: 'PACKING' },
    ];

    const result = groupByNV(rows);

    expect(result).toHaveLength(2);

    const nv1 = result.find(r => r.nv === 'NV-001');
    expect(nv1.items).toHaveLength(2);
    expect(nv1.total_items).toBe(2);
    expect(nv1.total_cantidad).toBe(15);
    expect(nv1.cliente).toBe('Farmacia A');

    const nv2 = result.find(r => r.nv === 'NV-002');
    expect(nv2.items).toHaveLength(1);
    expect(nv2.total_items).toBe(1);
    expect(nv2.total_cantidad).toBe(20);
  });

  it('maneja input null/undefined', () => {
    expect(groupByNV(null)).toEqual([]);
    expect(groupByNV(undefined)).toEqual([]);
  });

  it('maneja array vacío', () => {
    expect(groupByNV([])).toEqual([]);
  });

  it('maneja cantidades no numéricas', () => {
    const rows = [
      { nv: 'NV-X', cantidad: 'abc' },
      { nv: 'NV-X', cantidad: null },
      { nv: 'NV-X', cantidad: '' },
    ];

    const result = groupByNV(rows);
    expect(result[0].total_cantidad).toBe(0); // NaN → 0 via || 0
  });

  it('preserva todas las propiedades del primer item como base', () => {
    const rows = [
      { nv: 'NV-100', cliente: 'Test', vendedor: 'Juan', fecha_emision: '2024-01-01', cantidad: '5' },
      { nv: 'NV-100', cliente: 'Test', vendedor: 'Juan', fecha_emision: '2024-01-01', cantidad: '3' },
    ];

    const result = groupByNV(rows);
    expect(result[0].cliente).toBe('Test');
    expect(result[0].vendedor).toBe('Juan');
    expect(result[0].fecha_emision).toBe('2024-01-01');
  });

  it('detecta flags de picking status para packing', () => {
    const rows = [
      { nv: 'NV-P1', cantidad: '10', picking_status: 'COMPLETO', estado: 'PACKING' },
      { nv: 'NV-P1', cantidad: '5', picking_status: 'PARCIAL', estado: 'PACKING' },
      { nv: 'NV-P1', cantidad: '3', picking_status: 'SIN_STOCK', estado: 'QUIEBRE_STOCK' },
    ];

    const result = groupByNV(rows);
    const nv = result[0];

    // groupByNV doesn't add flags — Packing.jsx does. Test the items are available for flag logic.
    expect(nv.items.some(i => i.picking_status === 'PARCIAL')).toBe(true);
    expect(nv.items.some(i => i.picking_status === 'SIN_STOCK' || i.estado === 'QUIEBRE_STOCK')).toBe(true);
  });

  it('maneja NV con un solo item', () => {
    const rows = [{ nv: 'NV-SINGLE', cantidad: '42', cliente: 'Solo' }];
    const result = groupByNV(rows);

    expect(result).toHaveLength(1);
    expect(result[0].total_items).toBe(1);
    expect(result[0].total_cantidad).toBe(42);
    expect(result[0].items[0].nv).toBe('NV-SINGLE');
  });

  it('ordena por aparición (no alfabético)', () => {
    const rows = [
      { nv: 'NV-ZZZ', cantidad: '1' },
      { nv: 'NV-AAA', cantidad: '2' },
      { nv: 'NV-ZZZ', cantidad: '3' },
    ];

    const result = groupByNV(rows);
    expect(result[0].nv).toBe('NV-ZZZ'); // first seen
    expect(result[1].nv).toBe('NV-AAA');
  });
});
