import { describe, expect, it } from 'vitest';
import { construirTendenciaSemanal } from '../pages/Panel/dash/dashData';

describe('tendencia semanal del Panel PTM', () => {
  it('agrupa aprobaciones y entregas por la fecha real de cada evento', () => {
    const aprobadas = Array.from({ length: 10 }, (_, index) => ({
      fecha_aprobacion: `2026-03-${String(23 + (index % 5)).padStart(2, '0')}`,
      fecha_compromiso: '2026-03-30',
      estado: 'En Proceso'
    }));
    const entregadas = Array.from({ length: 15 }, (_, index) => ({
      fecha_entregado: `2026-03-${String(23 + (index % 5)).padStart(2, '0')}`
    }));

    const result = construirTendenciaSemanal(aprobadas, entregadas);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      semanaInicio: '2026-03-23',
      aprobadas: 10,
      entregadas: 15,
      aprobadasDia: 2,
      entregadasDia: 3,
      balanceCola: 5
    });
  });

  it('mantiene semanas con solo entregas de una cola anterior', () => {
    const result = construirTendenciaSemanal(
      [{ fecha_aprobacion: '2026-03-20', fecha_compromiso: '2026-03-23', estado: 'Shipping' }],
      [{ fecha_entregado: '2026-03-24' }, { fecha_entregado: '2026-03-25' }]
    );

    expect(
      result.map(({ semanaInicio, aprobadas, entregadas }) => ({
        semanaInicio,
        aprobadas,
        entregadas
      }))
    ).toEqual([
      { semanaInicio: '2026-03-16', aprobadas: 1, entregadas: 0 },
      { semanaInicio: '2026-03-23', aprobadas: 0, entregadas: 2 }
    ]);
  });
});
