import { describe, it, expect, vi } from 'vitest';

vi.mock('../supabase', () => ({ supabase: {} }));

import {
  CHECKLIST_SALIDA_NIVELES, resultadoPeso, semaforoSalida, RIESGOS_SALIDA,
} from '../services/calidadService';

describe('Calidad · Salida — certificado reforzado', () => {
  it('el checklist incluye el Nivel 3 de trazabilidad del producto', () => {
    const n3 = CHECKLIST_SALIDA_NIVELES.find(n => n.nivel === 3);
    expect(n3.titulo).toMatch(/Trazabilidad/);
    const ids = n3.params.map(p => p.id);
    expect(ids).toContain('sal_tz_venc');
    expect(ids).toContain('sal_tz_bloqueo');
    expect(ids).toContain('sal_tz_cuarentena');
    expect(ids).toContain('sal_tz_liberado');
    expect(n3.params).toHaveLength(6);
  });

  it('resultadoPeso aplica la tolerancia del ±2% (formato chileno con coma)', () => {
    expect(resultadoPeso('125', '125,3')).toBe('CONFORME');   // +0,24%
    expect(resultadoPeso('125', '120')).toBe('REVISAR');      // −4%
    expect(resultadoPeso('', '125')).toBeNull();
    expect(resultadoPeso('0', '0')).toBeNull();
  });

  it('semaforoSalida: verde liberado, naranja con salvedades, rojo no despachar', () => {
    expect(semaforoSalida({ resultado: 'CONFORME' }).key).toBe('VERDE');
    expect(semaforoSalida({ resultado: 'CONFORME' }).label).toBe('LIBERADO PARA DESPACHO');
    expect(semaforoSalida({ resultado: 'NO_CONFORME', disposicion: 'Despachar con salvedades (autorizado)' }).key).toBe('NARANJA');
    expect(semaforoSalida({ resultado: 'NO_CONFORME', disposicion: 'Retener / no despachar' }).key).toBe('ROJO');
    expect(semaforoSalida({ estado: 'PENDIENTE' }).key).toBe('PENDIENTE');
  });

  it('los riesgos incluyen la opción exclusiva "Ninguno"', () => {
    expect(RIESGOS_SALIDA.map(r => r.id)).toEqual(
      expect.arrayContaining(['ESTERIL', 'FRAGIL', 'VERTICAL', 'NO_APILAR', 'FRIO', 'PELIGROSO', 'NINGUNO']),
    );
  });
});
