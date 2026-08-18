import { describe, expect, it } from 'vitest';

// PR-009 · SSOT de estados N.V.
// Los strings canonicos viven en operationalContracts.js (ESTADO_NV_*). Los
// archivos del Panel (dashHelpers.js e ingresar/estados.js) deben DERIVAR de
// ahi y no divergir. Si alguien hardcodea una ortografia distinta, este test
// falla a proposito.

import {
  ESTADO_NV,
  ESTADO_NV_MIGRACION,
  ESTADO_NV_ACTIVOS,
  ESTADO_NV_FLUJO,
  SLA_NV_ETAPA_HORAS,
  SLA_NV_TOTAL_HORAS
} from '../constants/operationalContracts';
import * as dashHelpers from '../pages/Panel/dash/dashHelpers';
import * as ingresarEstados from '../pages/Panel/ingresar/estados';

describe('PR-009 · SSOT estados N.V.', () => {
  it('dashHelpers deriva ESTADOS y ESTADO_MIGRACION del contrato', () => {
    expect(dashHelpers.ESTADOS).toBe(ESTADO_NV);
    expect(dashHelpers.ESTADO_MIGRACION).toBe(ESTADO_NV_MIGRACION);
    expect(dashHelpers.ESTADOS_ACTIVOS_LISTA).toBe(ESTADO_NV_ACTIVOS);
  });

  it('ingresar/estados deriva ESTADOS y ESTADO_MIGRACION del contrato', () => {
    expect(ingresarEstados.ESTADOS).toBe(ESTADO_NV);
    expect(ingresarEstados.ESTADO_MIGRACION).toBe(ESTADO_NV_MIGRACION);
    expect(ingresarEstados.ESTADOS_ACTIVOS_LISTA).toBe(ESTADO_NV_ACTIVOS);
  });

  it('normaliza variantes viejas y sub-estados al canonico', () => {
    expect(ingresarEstados.normEstado('CURRIER')).toBe(ESTADO_NV.EN_RUTA);
    expect(ingresarEstados.normEstado('P / VENDEDOR')).toBe(ESTADO_NV.SHIPPING);
    expect(ingresarEstados.normEstado('EN PROCESO')).toBe(ESTADO_NV.EN_PROCESO);
    expect(ingresarEstados.normEstado('Recibido C/OBS')).toBe(ESTADO_NV.ENTREGADO);
    expect(ingresarEstados.normEstado('ENTREGADO')).toBe(ESTADO_NV.ENTREGADO);
  });

  it('flujo lineal y activos son coherentes con el contrato', () => {
    expect(ESTADO_NV_FLUJO).toEqual([
      ESTADO_NV.EN_PROCESO,
      ESTADO_NV.SHIPPING,
      ESTADO_NV.EN_RUTA,
      ESTADO_NV.ENTREGADO
    ]);
    expect(ESTADO_NV_ACTIVOS).toEqual([
      ESTADO_NV.EN_PROCESO,
      ESTADO_NV.SHIPPING,
      ESTADO_NV.EN_RUTA
    ]);
    // Los activos son un subconjunto del flujo (sin el terminal).
    ESTADO_NV_ACTIVOS.forEach((e) => expect(ESTADO_NV_FLUJO).toContain(e));
  });

  it('SLA por etapa no supera el SLA total de la N.V. (72h)', () => {
    const totalEtapas = SLA_NV_ETAPA_HORAS[ESTADO_NV.EN_PROCESO] +
      SLA_NV_ETAPA_HORAS[ESTADO_NV.SHIPPING] +
      SLA_NV_ETAPA_HORAS[ESTADO_NV.EN_RUTA];
    expect(SLA_NV_TOTAL_HORAS).toBe(72);
    expect(totalEtapas).toBeLessThanOrEqual(SLA_NV_TOTAL_HORAS);
  });

  it('transiciones del Panel usan la normalizacion del SSOT', () => {
    const { siguienteEstadoPermitido, esTransicionPermitida } = ingresarEstados;
    expect(siguienteEstadoPermitido(ESTADO_NV.EN_PROCESO)).toBe(ESTADO_NV.SHIPPING);
    expect(siguienteEstadoPermitido('CURRIER')).toBe(ESTADO_NV.ENTREGADO);
    expect(esTransicionPermitida('EN RUTA', 'ENTREGADO')).toBe(true);
    expect(esTransicionPermitida('En Ruta', 'Shipping')).toBe(false);
  });
});