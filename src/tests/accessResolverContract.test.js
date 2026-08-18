import { describe, expect, it } from 'vitest';
import {
  resolveAccessV2,
  legacyScreenAccess,
  ORIGIN,
  unmappedLegacyPerms
} from '../domain/access/resolverV2.js';

const NO_BETA = {};

const screenById = (res, id) => res.screens.find((s) => s.id === id);

describe('PR-IAM-R05 · Access Resolver V2 (shadow mode, sin autoridad)', () => {
  it('usuario sin permisos: todo deny (fail-closed, DEFAULT_DENY o PRIVATE_BETA)', () => {
    const res = resolveAccessV2({ perms: [], privateBetaFlags: NO_BETA });
    expect(res.screens.every((s) => s.allow === false)).toBe(true);
    expect(
      res.screens.every((s) => s.origin === ORIGIN.DEFAULT_DENY || s.origin === ORIGIN.PRIVATE_BETA)
    ).toBe(true);
    expect(res.modules.every((m) => m.allow === false)).toBe(true);
  });

  it('manage_panel (LEGACY_BROAD) abre Panel + TMS vía LEGACY_COMPATIBILITY (caso NILO)', () => {
    const res = resolveAccessV2({ perms: ['manage_panel'], privateBetaFlags: NO_BETA });
    const allowed = res.screens.filter((s) => s.allow).map((s) => s.id);
    expect(allowed).toContain('panel.dashboard');
    expect(allowed).toContain('panel.nv.entry');
    expect(allowed).toContain('panel.nv.info');
    expect(allowed).toContain('panel.tv');
    expect(allowed).toContain('panel.builder');
    expect(allowed).toContain('tms.control');
    expect(allowed).toContain('tms.pda');
    for (const id of ['panel.dashboard', 'panel.nv.entry', 'panel.tv', 'tms.control']) {
      expect(screenById(res, id).origin).toBe(ORIGIN.LEGACY_COMPATIBILITY);
      expect(screenById(res, id).reasons).toContain('manage_panel');
    }
    expect(allowed).not.toContain('panel.nv.reopen');
    expect(allowed).not.toContain('panel.settings');
    expect(allowed).not.toContain('panel.routes');
  });

  it('permiso granular (panel_ingresar): solo su pantalla vía PROFILE_ALLOW', () => {
    const res = resolveAccessV2({ perms: ['panel_ingresar'], privateBetaFlags: NO_BETA });
    const allowed = res.screens.filter((s) => s.allow).map((s) => s.id);
    expect(allowed).toEqual(['panel.nv.entry']);
    expect(screenById(res, 'panel.nv.entry').origin).toBe(ORIGIN.PROFILE_ALLOW);
  });

  it('manage_panel no abre Reaperturas (requiere approve_panel_reopen_nv/manage_roles)', () => {
    const res = resolveAccessV2({ perms: ['manage_panel'], privateBetaFlags: NO_BETA });
    expect(screenById(res, 'panel.nv.reopen').allow).toBe(false);
    const res2 = resolveAccessV2({ perms: ['approve_panel_reopen_nv'], privateBetaFlags: NO_BETA });
    expect(screenById(res2, 'panel.nv.reopen').allow).toBe(true);
    expect(screenById(res2, 'panel.nv.reopen').origin).toBe(ORIGIN.PROFILE_ALLOW);
  });

  it('precedencia: EXPLICIT_DENY > PROFILE_ALLOW; DIRECT_ALLOW concede sin permiso', () => {
    const res = resolveAccessV2({
      perms: ['panel_ingresar'],
      overrides: [{ screen: 'panel.nv.entry', access: 'DENY' }],
      privateBetaFlags: NO_BETA
    });
    expect(screenById(res, 'panel.nv.entry').allow).toBe(false);
    expect(screenById(res, 'panel.nv.entry').origin).toBe(ORIGIN.EXPLICIT_DENY);

    const res2 = resolveAccessV2({
      perms: [],
      overrides: [{ screen: 'panel.tv', access: 'ALLOW' }],
      privateBetaFlags: NO_BETA
    });
    expect(screenById(res2, 'panel.tv').allow).toBe(true);
    expect(screenById(res2, 'panel.tv').origin).toBe(ORIGIN.DIRECT_ALLOW);
  });

  it('PRIVATE BETA fail-closed: ruta beta denegada por defecto, permitida solo con flag', () => {
    const res = resolveAccessV2({ perms: ['manage_panel'], privateBetaFlags: NO_BETA });
    expect(screenById(res, 'panel.routes').allow).toBe(false);
    expect(screenById(res, 'panel.routes').origin).toBe(ORIGIN.PRIVATE_BETA);

    const res2 = resolveAccessV2({
      perms: ['manage_panel'],
      privateBetaFlags: { 'panel.routes': true }
    });
    expect(screenById(res2, 'panel.routes').allow).toBe(true);
  });

  it('permisos UNUSED no mapean a pantalla: salen como unmapped', () => {
    const res = resolveAccessV2({
      perms: ['deploy_ota', 'export_data', 'view_asistente'],
      privateBetaFlags: NO_BETA
    });
    expect(res.screens.every((s) => !s.allow)).toBe(true);
    expect(res.unmapped).toEqual(
      expect.arrayContaining(['deploy_ota', 'export_data', 'view_asistente'])
    );
    expect(unmappedLegacyPerms(['deploy_ota', 'manage_panel', 'panel_ingresar'])).toEqual([
      'deploy_ota'
    ]);
  });

  it('consistencia legacy vs V2 sin overrides (Nilo: manage_panel == resolver legacy)', () => {
    const perms = ['manage_panel'];
    const legacy = legacyScreenAccess({ perms, privateBetaFlags: NO_BETA });
    const v2 = resolveAccessV2({ perms, privateBetaFlags: NO_BETA });
    for (const l of legacy) {
      const s = screenById(v2, l.id);
      expect(s.allow, `screen ${l.id}`).toBe(l.allow);
    }
  });
});
