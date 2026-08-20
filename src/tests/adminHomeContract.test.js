import { describe, expect, it } from 'vitest';
import { ADMIN_DOMAINS } from '../pages/Admin/AdminHome';
import { ROUTE_PERMISSIONS } from '../constants/permissions';

describe('PR21 · arquitectura de información Admin 2.0', () => {
  it('expone los cuatro dominios obligatorios', () => {
    expect(ADMIN_DOMAINS.map((domain) => domain.id)).toEqual([
      'identity',
      'operation',
      'platform',
      'observability'
    ]);
  });

  it('no duplica herramientas y todas las rutas están protegidas', () => {
    const paths = ADMIN_DOMAINS.flatMap((domain) => domain.items.map((item) => item.path));
    expect(new Set(paths).size).toBe(paths.length);
    paths.forEach((path) => expect(ROUTE_PERMISSIONS[path]).toBeDefined());
  });
});
