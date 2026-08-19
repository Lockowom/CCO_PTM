import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  buildEffectiveView,
  DIFF,
  ORIGIN_LABEL,
  ORIGIN_TONE
} from '../domain/access/effectiveView.js';
import { SCREEN_REGISTRY } from '../domain/access/screenRegistry.js';
import { MODULE_REGISTRY } from '../domain/access/moduleRegistry.js';
import { FUNCTION_REGISTRY } from '../domain/access/functionRegistry.js';
import { ORIGIN } from '../domain/access/resolverV2.js';
import { legacyScreenAccess } from '../domain/access/resolverV2.js';

function loadData() {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  return JSON.parse(readFileSync(join(__dirname, '../../docs/iam-v2/datos_iam.json'), 'utf8'));
}

function permsOfRole(roleCode) {
  const data = loadData();
  return data.iam_role_permissions.filter((p) => p.rol === roleCode).map((p) => p.permiso);
}

const NILO_LIKE = ['view_panel', 'panel_ingresar', 'panel_info', 'manage_panel'];
const BETA = { 'panel.routes': false };

describe('PR-IAM-R09/R10 · Vista efectiva (read-only) + origen', () => {
  it('cubre todas las pantallas registradas y produce origen para cada una', () => {
    const v = buildEffectiveView({ perms: NILO_LIKE, privateBetaFlags: BETA });
    expect(v.screens).toHaveLength(SCREEN_REGISTRY.length);
    expect(v.modules).toHaveLength(MODULE_REGISTRY.length);
    expect(v.functions).toHaveLength(FUNCTION_REGISTRY.length);
    for (const s of v.screens) {
      expect(Object.values(ORIGIN)).toContain(s.origin);
      expect(Object.keys(ORIGIN_LABEL)).toContain(s.origin);
      expect(Object.keys(ORIGIN_TONE)).toContain(s.origin);
    }
  });

  it('granular → PROFILE_ALLOW; legacy broad → LEGACY_COMPATIBILITY; sin nada → DEFAULT_DENY', () => {
    const v = buildEffectiveView({ perms: NILO_LIKE, privateBetaFlags: BETA });
    const byId = new Map(v.screens.map((s) => [s.id, s]));
    expect(byId.get('panel.nv.entry').allow).toBe(true);
    expect(byId.get('panel.nv.entry').origin).toBe(ORIGIN.PROFILE_ALLOW);
    expect(byId.get('panel.dashboard').allow).toBe(true);
    expect(byId.get('panel.dashboard').origin).toBe(ORIGIN.PROFILE_ALLOW);
    expect(byId.get('admin.access').allow).toBe(false);
    expect(byId.get('admin.access').origin).toBe(ORIGIN.DEFAULT_DENY);
    expect(v.counts.losses).toBe(0);
    expect(v.counts.gains).toBe(0);
  });

  it('sin el permiso granular, el legacy broad (manage_panel) cubre → LEGACY_COMPATIBILITY', () => {
    const v = buildEffectiveView({
      perms: ['panel_ingresar', 'panel_info', 'manage_panel'],
      privateBetaFlags: BETA
    });
    const byId = new Map(v.screens.map((s) => [s.id, s]));
    expect(byId.get('panel.dashboard').allow).toBe(true);
    expect(byId.get('panel.dashboard').origin).toBe(ORIGIN.LEGACY_COMPATIBILITY);
    expect(byId.get('panel.dashboard').reasons).toContain('manage_panel');
    expect(byId.get('panel.nv.entry').origin).toBe(ORIGIN.PROFILE_ALLOW);
  });

  it('override DENY → EXPLICIT_DENY y diff LOSS contra legacy; ALLOW → DIRECT_ALLOW y GAIN', () => {
    const v = buildEffectiveView({
      perms: NILO_LIKE,
      overrides: [
        { screen: 'panel.dashboard', access: 'DENY' },
        { screen: 'admin.access', access: 'ALLOW' }
      ],
      privateBetaFlags: BETA
    });
    const byId = new Map(v.screens.map((s) => [s.id, s]));
    expect(byId.get('panel.dashboard').allow).toBe(false);
    expect(byId.get('panel.dashboard').origin).toBe(ORIGIN.EXPLICIT_DENY);
    expect(byId.get('panel.dashboard').diff).toBe(DIFF.LOSS);
    expect(byId.get('admin.access').allow).toBe(true);
    expect(byId.get('admin.access').origin).toBe(ORIGIN.DIRECT_ALLOW);
    expect(byId.get('admin.access').diff).toBe(DIFF.GAIN);
    expect(v.counts.losses).toBe(1);
    expect(v.counts.gains).toBe(1);
    expect(v.counts.overrides).toBe(2);
  });

  it('override INHERIT no altera el origen natural', () => {
    const v = buildEffectiveView({
      perms: NILO_LIKE,
      overrides: [{ screen: 'panel.nv.info', access: 'INHERIT' }],
      privateBetaFlags: BETA
    });
    const s = v.screens.find((x) => x.id === 'panel.nv.info');
    expect(s.allow).toBe(true);
    expect(s.origin).toBe(ORIGIN.PROFILE_ALLOW);
    expect(s.diff).toBe(DIFF.SAME);
    expect(v.counts.overrides).toBe(0);
  });

  it('private beta fail-closed: panel.routes sin flag → PRIVATE_BETA negado', () => {
    const v = buildEffectiveView({ perms: [...NILO_LIKE, 'manage_panel'], privateBetaFlags: BETA });
    const s = v.screens.find((x) => x.id === 'panel.routes');
    expect(s.allow).toBe(false);
    expect(s.origin).toBe(ORIGIN.PRIVATE_BETA);
  });

  it('data real: OPERADOR y ADMIN — la vista efectiva coincide 1:1 con el guard legacy (zero-loss)', () => {
    const operadorPerms = permsOfRole('OPERADOR');
    const adminPerms = permsOfRole('ADMIN');
    for (const perms of [operadorPerms, adminPerms]) {
      const v = buildEffectiveView({ perms, privateBetaFlags: BETA });
      const legacy = legacyScreenAccess({ perms, privateBetaFlags: BETA });
      for (const s of v.screens) {
        const l = legacy.find((x) => x.id === s.id);
        expect(s.allow, `${s.id}`).toBe(l.allow);
        expect(s.diff, `${s.id}`).toBe(DIFF.SAME);
      }
    }
  });

  it('meta de pantalla visible (label/rutas/riesgo) y funciones con padre', () => {
    const v = buildEffectiveView({ perms: NILO_LIKE, privateBetaFlags: BETA });
    const s = v.screens.find((x) => x.id === 'panel.nv.entry');
    expect(s.label).toBe('Ingresar N.V.');
    expect(s.routes).toContain('/panel/ingresar');
    expect(s.risk).toBe('HIGH');
    const fns = v.functions.filter((f) => f.screen === 'panel.nv.entry');
    expect(fns.length).toBeGreaterThan(0);
    expect(fns[0].screenLabel).toBe('Ingresar N.V.');
  });

  it('permisos no mapeados se reportan (unmapped) sin romper la vista', () => {
    const v = buildEffectiveView({
      perms: [...NILO_LIKE, 'permiso_inexistente_x'],
      privateBetaFlags: BETA
    });
    expect(v.unmapped).toContain('permiso_inexistente_x');
    expect(v.screens).toHaveLength(SCREEN_REGISTRY.length);
  });
});
