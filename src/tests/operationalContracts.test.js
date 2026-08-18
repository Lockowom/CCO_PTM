import { describe, expect, it } from 'vitest';
import {
  ESTADO_FLUJO,
  ESTADOS_ACTIVOS,
  ESTADOS_DESCARTADOS,
  SLA_ETAPA_HORAS,
  SLA_NV_TOTAL_HORAS,
  STOCK_SIDE_EFFECT_PROHIBITIONS,
  SSOT
} from '../constants/operationalContracts';

describe('PR-002 · contratos operacionales', () => {
  it('estados: sin duplicados en activos', () => {
    expect(new Set(ESTADOS_ACTIVOS).size).toBe(ESTADOS_ACTIVOS.length);
  });

  it('estados: sin solapamiento entre activos y descartados', () => {
    const activos = new Set(ESTADOS_ACTIVOS);
    ESTADOS_DESCARTADOS.forEach((e) => expect(activos.has(e)).toBe(false));
  });

  it('SLA: todas las etapas tienen objetivo >= 0 y existe SLA total', () => {
    Object.values(SLA_ETAPA_HORAS).forEach((horas) => {
      expect(horas).toBeGreaterThanOrEqual(0);
    });
    expect(SLA_NV_TOTAL_HORAS).toBeGreaterThan(0);
  });

  it('SLA: cubre todos los estados activos del flujo', () => {
    ESTADOS_ACTIVOS.forEach((estado) => {
      expect(SLA_ETAPA_HORAS, `SLA para ${estado}`).toHaveProperty(estado);
    });
  });

  it('stock: todos los gates de prohibición están activos', () => {
    const gates = Object.values(STOCK_SIDE_EFFECT_PROHIBITIONS);
    expect(gates.length).toBeGreaterThan(0);
    gates.forEach((active) => expect(active).toBe(true));
  });

  it('SSOT: stock es ERP y ubicación es CCO visual', () => {
    expect(SSOT.STOCK).toBe('ERP');
    expect(SSOT.LOCATION).toBe('CCO_VISUAL');
    expect(SSOT.COUNT).toBe('OBSERVACION_CCO');
    expect(SSOT.QUALITY_LOCATION).toBe('CCO');
    expect(SSOT.QUALITY_STOCK).toBe('ERP');
  });

  it('SSOT: Picking/Packing son proceso "En Proceso", no inventario', () => {
    expect(SSOT.PICKING_PACKING).toBe('EN_PROCESO');
  });

  it('estados: PENDIENTE_* tienen la forma canónica del flujo visual', () => {
    expect(ESTADO_FLUJO.PENDIENTE_PICKING).toBe('Pendiente Picking');
    expect(ESTADO_FLUJO.PENDIENTE_SHIPPING).toBe('Pendiente Shipping');
    expect(ESTADO_FLUJO.PACKING).toBe('PACKING');
    expect(ESTADO_FLUJO.ENTREGADO).toBe('ENTREGADO');
  });
});
