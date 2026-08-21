import { describe, expect, it } from 'vitest';
import { AUTHENTICATED_VISUAL_ROUTES, VISUAL_BREAKPOINTS } from '../../tests/e2e/visual-routes';

describe('PR26 · contrato de regresión visual', () => {
  it('incluye todos los breakpoints obligatorios', () => {
    expect(VISUAL_BREAKPOINTS.map((item) => item.name)).toEqual([
      '360x800',
      '390x844',
      '412x915',
      '768x1024',
      '1366x768',
      '1440x900',
      '1920x1080'
    ]);
  });

  it('mantiene el inventario mínimo de rutas autenticadas', () => {
    expect(AUTHENTICATED_VISUAL_ROUTES).toHaveLength(10);
    expect(AUTHENTICATED_VISUAL_ROUTES).toContain('/tms/control');
    expect(AUTHENTICATED_VISUAL_ROUTES).toContain('/admin/access');
  });
});
