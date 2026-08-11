import { describe, expect, it } from 'vitest';
import {
  ESTADOS,
  estadosDisponibles,
  esTransicionPermitida,
  normEstado,
  siguienteEstadoPermitido
} from '../pages/Panel/ingresar/estados';

describe('workflow secuencial de N.V.', () => {
  it('solo permite En Proceso -> Shipping -> En Ruta -> Entregado', () => {
    expect(siguienteEstadoPermitido(ESTADOS.EN_PROCESO)).toBe(ESTADOS.SHIPPING);
    expect(siguienteEstadoPermitido(ESTADOS.SHIPPING)).toBe(ESTADOS.EN_RUTA);
    expect(siguienteEstadoPermitido(ESTADOS.EN_RUTA)).toBe(ESTADOS.ENTREGADO);
    expect(siguienteEstadoPermitido(ESTADOS.ENTREGADO)).toBeNull();

    expect(esTransicionPermitida(ESTADOS.EN_PROCESO, ESTADOS.EN_RUTA)).toBe(false);
    expect(esTransicionPermitida(ESTADOS.SHIPPING, ESTADOS.ENTREGADO)).toBe(false);
    expect(esTransicionPermitida(ESTADOS.EN_RUTA, ESTADOS.SHIPPING)).toBe(false);
    expect(esTransicionPermitida(ESTADOS.EN_PROCESO, ESTADOS.SHIPPING)).toBe(true);
  });

  it('una N.V. nueva solo puede comenzar En Proceso', () => {
    expect(estadosDisponibles('', { nuevo: true })).toEqual([ESTADOS.EN_PROCESO]);
  });

  it('una pausa Shipping bloquea el avance hasta reactivarla', () => {
    expect(estadosDisponibles(ESTADOS.SHIPPING, { pausada: true })).toEqual([ESTADOS.SHIPPING]);
    expect(estadosDisponibles(ESTADOS.SHIPPING, { pausada: false })).toEqual([
      ESTADOS.SHIPPING,
      ESTADOS.EN_RUTA
    ]);
  });

  it('normaliza los estados legacy sin conservar saltos obsoletos', () => {
    expect(normEstado('Currier')).toBe(ESTADOS.EN_RUTA);
    expect(normEstado('P / VENDEDOR')).toBe(ESTADOS.SHIPPING);
    expect(normEstado('P / RETIRO')).toBe(ESTADOS.SHIPPING);
    expect(normEstado('P / STOCK')).toBe(ESTADOS.EN_PROCESO);
  });
});
