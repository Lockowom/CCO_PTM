import { describe, expect, it } from 'vitest';
import {
  assignmentLocations,
  assignmentReference,
  buildProductExplorerRows,
  filterAndSortAssignments,
  matchesProductQuery
} from '../domain/quality/assignmentExplorer.js';

const assignments = [
  {
    id: '9c7d2e11-2222-3333-4444-555555555555',
    estado: 'PENDIENTE',
    created_at: '2026-11-01T10:00:00Z',
    motivo: 'Revisión de estancia',
    skus: [
      {
        codigo_producto: 'SKU-001',
        producto: 'Guante clínico',
        ubicacion: 'D-01-01',
        partida: 'P-01'
      },
      { codigo_producto: 'SKU-002', producto: 'Mascarilla', ubicacion: 'D-01-02' }
    ]
  },
  {
    id: 'ab12cd34-2222-3333-4444-555555555555',
    estado: 'RESUELTA',
    created_at: '2026-11-02T10:00:00Z',
    skus: [{ codigo_producto: 'SKU-001', producto: 'Guante clínico', ubicacion: 'D-02-01' }],
    informe: { id: 'informe-1', numero: 'INF-120', estado: 'EMITIDO', tipo_informe: 'ESTANCIA' }
  }
];

describe('explorador de tareas y estancias de Calidad', () => {
  it('busca una tarea por SKU, descripción, ubicación e identificador visible', () => {
    expect(filterAndSortAssignments(assignments, { query: 'guante' })).toHaveLength(2);
    expect(filterAndSortAssignments(assignments, { query: 'D-01-02' })).toHaveLength(1);
    expect(filterAndSortAssignments(assignments, { query: 'H2-9C7D2E11' })).toHaveLength(1);
  });

  it('mantiene la referencia estable y las estancias únicas de una tarea', () => {
    expect(assignmentReference(assignments[0])).toBe('H2-9C7D2E11');
    expect(assignmentLocations(assignments[0])).toEqual(['D-01-01', 'D-01-02']);
  });

  it('agrupa un SKU en todas sus estancias, tareas e informes vinculados', () => {
    const product = buildProductExplorerRows(assignments).find((row) => row.codigo === 'SKU-001');
    expect(product.estancias.map((stay) => stay.ubicacion)).toEqual(['D-01-01', 'D-02-01']);
    expect(product.tareas).toHaveLength(2);
    expect(product.informes.map((report) => report.numero)).toEqual(['INF-120']);
    expect(matchesProductQuery(product, 'INF-120')).toBe(true);
  });
});
