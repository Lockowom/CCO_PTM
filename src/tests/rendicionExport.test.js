import { describe, expect, it } from 'vitest';
import { buildRendicionPdfDefinition } from '../lib/exportRendicion';

describe('formato original de rendición', () => {
  it('incluye todos los campos de cabecera del documento original', () => {
    const definition = buildRendicionPdfDefinition({
      rendicion: {
        responsable_nombre: 'Oscar Leiva',
        responsable_rut: '16.068.403-8',
        direccion_area: 'Operaciones',
        unidad: 'PV - ST',
        centro_costo_codigo: '1-09',
        centro_costo_nombre: 'Div. Proyecto',
        tecnico: 'David Fuentes',
        detalle: 'División Operaciones',
        fecha_rendicion: '2026-08-11',
        folio_texto: 'REN-2026-000002',
        tipo_fondo: 'Rendición de gastos',
        total: 20000
      },
      items: [],
      fotos: []
    });
    const serialized = JSON.stringify(definition);

    [
      'RESPONSABLE RENDICIÓN',
      'RUT DEL RESPONSABLE',
      'DIRECCIÓN - ÁREA',
      'UNIDAD',
      'CENTRO DE COSTO',
      'TÉCNICO',
      'DETALLE',
      'FECHA DE LA RENDICIÓN',
      'Nº FOLIO SOLICITUD',
      'FONDO POR RENDIR'
    ].forEach((label) => expect(serialized).toContain(label));

    expect(serialized).toContain('16.068.403-8');
    expect(serialized).toContain('David Fuentes');
    expect(serialized).toContain('Div. Proyecto');
  });
});
