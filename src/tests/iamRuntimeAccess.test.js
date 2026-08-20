import { describe, expect, it } from 'vitest';
import {
  IAM_ENFORCEMENT_MODE,
  buildRuntimeAccess,
  runtimeAllowsFunction,
  runtimeAllowsPath,
  screenForPath
} from '../domain/access/runtimeAccess.js';

describe('IAM 2.0 runtime enforcement', () => {
  it('mantiene el guard legacy en SHADOW', () => {
    const runtime = buildRuntimeAccess({
      perms: ['manage_panel'],
      context: { mode: 'SHADOW', overrides: [] }
    });
    expect(runtimeAllowsPath(runtime, '/panel/tv', true)).toBe(true);
  });

  it('aplica DENY explícito por encima de manage_panel en ENFORCE', () => {
    const runtime = buildRuntimeAccess({
      perms: ['manage_panel'],
      context: {
        mode: IAM_ENFORCEMENT_MODE.ENFORCE,
        overrides: [{ surface_type: 'screen', surface_id: 'panel.tv', access: 'DENY' }]
      }
    });
    expect(runtimeAllowsPath(runtime, '/panel/tv', true)).toBe(false);
    expect(runtimeAllowsPath(runtime, '/panel/info', true)).toBe(true);
  });

  it('un ALLOW individual habilita una pantalla sin permiso heredado', () => {
    const runtime = buildRuntimeAccess({
      perms: [],
      context: {
        mode: 'ENFORCE',
        overrides: [{ surface_type: 'screen', surface_id: 'panel.nv.info', access: 'ALLOW' }]
      }
    });
    expect(runtimeAllowsPath(runtime, '/panel/info', false)).toBe(true);
  });

  it('una función hereda la pantalla pero respeta su DENY explícito', () => {
    const runtime = buildRuntimeAccess({
      perms: ['manage_panel'],
      context: {
        mode: 'ENFORCE',
        overrides: [
          { surface_type: 'function', surface_id: 'panel.nv.entry.delete', access: 'DENY' }
        ]
      }
    });
    expect(runtimeAllowsFunction(runtime, 'panel.nv.entry.edit', { legacyDecision: true })).toBe(
      true
    );
    expect(runtimeAllowsFunction(runtime, 'panel.nv.entry.delete', { legacyDecision: true })).toBe(
      false
    );
  });

  it('resuelve rutas parametrizadas y falla cerrado para funciones desconocidas', () => {
    expect(screenForPath('/inventory/bloque/A-01')?.id).toBe('inventory.bloque');
    const runtime = buildRuntimeAccess({ perms: [], context: { mode: 'ENFORCE' } });
    expect(runtimeAllowsFunction(runtime, 'inventada', { legacyDecision: true })).toBe(false);
  });
});
