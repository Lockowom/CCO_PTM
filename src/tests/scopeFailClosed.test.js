import { describe, expect, it } from 'vitest';
import { permisosDeRuta, puedeAccederRuta } from '../constants/permissions';

// ── PR-004 · Scope fail-closed ───────────────────────────────────────────────
// Contrato: cualquier ruta SIN permiso declarado se DENIEGA (guard fail-closed).
// Estos tests blindan ese comportamiento para que un cambio futuro no reabra
// rutas desconocidas a usuarios autenticados.

const userBase = { rol: 'USUARIO', es_admin_delegado: false };
const sinPermisos = () => false;
const conTodos = () => true;

describe('PR-004 · fail-closed del guard', () => {
  it('permisosDeRuta devuelve undefined para rutas no declaradas', () => {
    expect(permisosDeRuta('/ruta/inexistente')).toBeUndefined();
    expect(permisosDeRuta('/admin/secret-route')).toBeUndefined();
    expect(permisosDeRuta('/panel/oculto')).toBeUndefined();
  });

  it('puedeAccederRuta deniega una ruta no declarada (aunque el usuario tenga permisos)', () => {
    expect(puedeAccederRuta('/ruta/inexistente', userBase, conTodos)).toBe(false);
  });

  it('deniega rutas no declaradas incluso con query string', () => {
    expect(puedeAccederRuta('/queries/desconocido?tab=x', userBase, conTodos)).toBe(false);
  });

  it('normaliza mayúsculas y slash final antes de decidir', () => {
    // /Admin/Users/ es la misma ruta declarada y debe evaluarse igual.
    expect(permisosDeRuta('/admin/users')).toEqual(['manage_users', 'view_users']);
    expect(permisosDeRuta('/Admin/Users/')).toEqual(['manage_users', 'view_users']);
    expect(puedeAccederRuta('/Admin/Users/', userBase, conTodos)).toBe(true);
    expect(puedeAccederRuta('/ADMIN/USERS/', userBase, () => false)).toBe(false);
  });

  it('el bypass de ADMIN no abre rutas inexistentes', () => {
    const admin = { rol: 'ADMIN', es_admin_delegado: false };
    expect(puedeAccederRuta('/admin/users', admin, () => true)).toBe(true);
    expect(puedeAccederRuta('/ruta/que/no/existe', admin, () => true)).toBe(false);
  });

  it('una ruta con permiso requerido pero usuario sin permiso es denegada', () => {
    expect(puedeAccederRuta('/admin/users', userBase, sinPermisos)).toBe(false);
    expect(puedeAccederRuta('/inventory/conteo', userBase, sinPermisos)).toBe(false);
  });
});
