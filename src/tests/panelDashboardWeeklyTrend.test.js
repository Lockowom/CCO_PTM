import { describe, expect, it } from 'vitest';
import { construirTendenciaSemanal } from '../pages/Panel/dash/dashData';
import { WEEKLY_TREND_RELIABLE_FROM } from '../pages/Panel/dash/weeklyTrendConfig';

describe('tendencia semanal del Panel PTM', () => {
  it('agrupa aprobaciones y entregas por la fecha real de cada evento', () => {
    const aprobadas = Array.from({ length: 10 }, (_, index) => ({
      fecha_aprobacion: `2026-07-${String(20 + (index % 5)).padStart(2, '0')}`,
      fecha_compromiso: '2026-07-27',
      estado: 'En Proceso'
    }));
    const entregadas = Array.from({ length: 15 }, (_, index) => ({
      fecha_entregado: `2026-07-${String(20 + (index % 5)).padStart(2, '0')}`
    }));

    const result = construirTendenciaSemanal(aprobadas, entregadas);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      semanaInicio: '2026-07-20',
      aprobadas: 10,
      entregadas: 15,
      aprobadasDia: 2,
      entregadasDia: 3,
      balanceCola: 5
    });
  });

  it('mantiene semanas con solo entregas de una cola anterior', () => {
    const result = construirTendenciaSemanal(
      [{ fecha_aprobacion: '2026-07-24', fecha_compromiso: '2026-07-27', estado: 'Shipping' }],
      [{ fecha_entregado: '2026-07-27' }, { fecha_entregado: '2026-07-28' }]
    );

    expect(
      result.map(({ semanaInicio, aprobadas, entregadas }) => ({
        semanaInicio,
        aprobadas,
        entregadas
      }))
    ).toEqual([
      { semanaInicio: '2026-07-20', aprobadas: 1, entregadas: 0 },
      { semanaInicio: '2026-07-27', aprobadas: 0, entregadas: 2 }
    ]);
  });

  it('excluye por completo el historial anterior al inicio confiable', () => {
    const result = construirTendenciaSemanal(
      [
        { fecha_aprobacion: '2026-06-22', estado: 'En Proceso' },
        { fecha_aprobacion: WEEKLY_TREND_RELIABLE_FROM, estado: 'En Proceso' }
      ],
      [{ fecha_entregado: '2026-06-23' }, { fecha_entregado: WEEKLY_TREND_RELIABLE_FROM }]
    );

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      semanaInicio: WEEKLY_TREND_RELIABLE_FROM,
      aprobadas: 1,
      entregadas: 1
    });
  });
});
