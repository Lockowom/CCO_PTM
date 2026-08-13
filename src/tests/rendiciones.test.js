import { describe, expect, it } from 'vitest';
import { cleanHumanText, hasRealLetters, validateRendicion } from '../lib/rendicionValidation';

const valid = () => ({
  solicitante_tecnico_id: 'tecnico-postventa',
  items: [
    {
      fecha: '2026-08-11',
      categoria_codigo: 'bodega',
      subcategoria_codigo: 'epp',
      descripcion: 'Compra de elementos de protección personal',
      monto: 25000,
      tipo_documento: 'Factura',
      numero_documento: '195987'
    }
  ]
});

describe('rendiciones públicas seguras', () => {
  it('elimina espacios falsos y caracteres invisibles', () => {
    expect(cleanHumanText('  \u200B  texto   válido  ')).toBe('texto válido');
    expect(hasRealLetters(' \u200B \u200C ')).toBe(false);
    expect(hasRealLetters('123 ---')).toBe(false);
  });

  it('rechaza descripciones sin letras y montos no positivos', () => {
    const payload = valid();
    payload.items[0].descripcion = '   --- 123   ';
    payload.items[0].monto = 0;
    const errors = validateRendicion(payload);
    expect(errors['items.0.descripcion']).toBeTruthy();
    expect(errors['items.0.monto']).toBeTruthy();
  });

  it('acepta el detalle sin exigir la cabecera administrativa', () => {
    expect(validateRendicion(valid())).toEqual({});
  });
});
