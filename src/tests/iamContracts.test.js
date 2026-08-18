import { describe, expect, it } from 'vitest';
import {
  ALL_PERMISSION_IDS,
  ROLE_BLUEPRINTS,
  ROLE_BLUEPRINTS_BY_ID,
  getRolePermissions,
  listBlueprintRoleIds,
  FRONTEND_IAM_BLUEPRINT
} from '../config/iamBlueprints';

// ── PR-006 · IAM compatibility + contract tests ──────────────────────────────
// Los blueprints de rol son el contrato del IAM frontend: definen qué permisos
// tiene cada rol asignable. Estos tests garantizan que no haya referencias
// rotas ni roles sin blueprint.

const catalog = new Set(ALL_PERMISSION_IDS);

describe('PR-006 · catálogo de permisos', () => {
  it('no tiene duplicados en el catálogo global', () => {
    expect(ALL_PERMISSION_IDS.length).toBe(catalog.size);
  });

  it('agrupa permisos por módulo sin duplicados', () => {
    Object.values(FRONTEND_IAM_BLUEPRINT.groupedPermissions).forEach((list) => {
      expect(new Set(list).size).toBe(list.length);
    });
  });
});

describe('PR-006 · blueprints de rol', () => {
  it('expone los blueprints por id y lista de ids', () => {
    expect(ROLE_BLUEPRINTS_BY_ID).toBeDefined();
    expect(listBlueprintRoleIds().length).toBe(ROLE_BLUEPRINTS.length);
    expect(Object.keys(ROLE_BLUEPRINTS_BY_ID).length).toBe(ROLE_BLUEPRINTS.length);
  });

  it('todos los permisos de cada rol existen en el catálogo', () => {
    for (const bp of ROLE_BLUEPRINTS) {
      const invalidos = bp.permissions.filter((p) => !catalog.has(p));
      expect(invalidos, `rol ${bp.id}`).toEqual([]);
    }
  });

  it('cada rol tiene landing page y scopeStrategy', () => {
    for (const bp of ROLE_BLUEPRINTS) {
      expect(bp.landingPage, `landing ${bp.id}`).toBeTruthy();
      expect(bp.scopeStrategy, `scope ${bp.id}`).toBe('global');
    }
  });

  it('ADMIN cubre todos los permisos (bypass explícito)', () => {
    expect(ROLE_BLUEPRINTS_BY_ID.ADMIN.permissions).toEqual(ALL_PERMISSION_IDS);
  });

  it('getRolePermissions devuelve lista vacía para rol desconocido', () => {
    expect(getRolePermissions('ROL_INEXISTENTE')).toEqual([]);
  });

  it('los permisos de pestañas de cada módulo están en el catálogo', () => {
    for (const bp of ROLE_BLUEPRINTS) {
      const tabs = bp.permissions.filter((p) => p.includes('_tab_'));
      tabs.forEach((t) => expect(catalog.has(t), `tab ${t} de ${bp.id}`).toBe(true));
    }
  });

  it('ningún rol referencia el permiso TMS (módulo oculto) por accidente', () => {
    // El módulo TMS está oculto; los blueprints no deberían asignar sus permisos.
    for (const bp of ROLE_BLUEPRINTS.filter((b) => b.id !== 'ADMIN')) {
      const tms = bp.permissions.filter((p) => ['view_tms', 'manage_tms', 'supervise_tms'].includes(p));
      expect(tms, `TMS en ${bp.id}`).toEqual([]);
    }
  });
});
