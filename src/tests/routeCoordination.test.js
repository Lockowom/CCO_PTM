import { describe, expect, it } from 'vitest';
import {
  optimizeStops,
  pointForStop,
  sectorForCommune
} from '../pages/Panel/rutas/routeCoordination';

describe('sectorización de Coordinación Rutas', () => {
  it('clasifica las comunas definidas por negocio', () => {
    expect(sectorForCommune('Huechuraba')).toBe('Norte');
    expect(sectorForCommune('SANTIAGO')).toBe('Centro');
    expect(sectorForCommune('Ñuñoa')).toBe('Nororiente');
    expect(sectorForCommune('Padre Hurtado')).toBe('Surponiente');
    expect(sectorForCommune('Concepción')).toBe('Fuera de Santiago');
  });

  it('usa coordenada exacta y recurre al centro comunal solo cuando falta', () => {
    expect(pointForStop({ latitud: -33.4, longitud: -70.6, comuna: 'Santiago' })).toEqual({
      lat: -33.4,
      lng: -70.6,
      approximate: false
    });
    expect(pointForStop({ comuna: 'Santiago' })?.approximate).toBe(true);
  });

  it('ordena por cercanía sin perder paradas', () => {
    const stops = [
      { id: 'far', comuna: 'Puente Alto' },
      { id: 'near', comuna: 'Santiago' },
      { id: 'middle', comuna: 'Ñuñoa' }
    ];
    expect(optimizeStops(stops).map((item) => item.id)).toEqual(['near', 'middle', 'far']);
  });
});
