import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PROFILES_V2, profileById } from '../domain/access/profilesV2.js';
import { SCREEN_REGISTRY } from '../domain/access/screenRegistry.js';
import { FUNCTION_REGISTRY } from '../domain/access/functionRegistry.js';
import { legacyScreenAccess } from '../domain/access/resolverV2.js';

const SCREEN_IDS = new Set(SCREEN_REGISTRY.map((s) => s.id));
const FUNCTION_IDS = new Set(FUNCTION_REGISTRY.map((f) => f.id));
const SCREEN_FUNCTIONS = new Map(FUNCTION_REGISTRY.map((f) => [f.id, f.screen]));

function loadData() {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  return JSON.parse(readFileSync(join(__dirname, '../../docs/iam-v2/datos_iam.json'), 'utf8'));
}

function legacyScreensOfRole(roleCode) {
  const data = loadData();
  const perms = data.iam_role_permissions.filter((p) => p.rol === roleCode).map((p) => p.permiso);
  return legacyScreenAccess({ perms, privateBetaFlags: { 'panel.routes': false } })
    .filter((s) => s.allow)
    .map((s) => s.id);
}

describe('PR-IAM-R08 · Profiles V2 (templates granulares, sin asignar)', () => {
  it('ids únicos y perfiles sugeridos del spec §60 presentes', () => {
    const ids = new Set(PROFILES_V2.map((p) => p.id));
    expect(ids.size).toBe(PROFILES_V2.length);
    for (const id of [
      'OPERADOR_PANEL_NV',
      'BODEGA',
      'INVENTARIO',
      'CALIDAD',
      'COORDINADOR_DESPACHO',
      'SUPERVISOR',
      'GERENCIA',
      'ADMIN'
    ]) {
      expect(ids.has(id), id).toBe(true);
    }
  });

  it('screens/functions referencian registries reales y funciones derivan de las screens', () => {
    for (const p of PROFILES_V2) {
      for (const s of p.screens) expect(SCREEN_IDS.has(s), `${p.id} → screen ${s}`).toBe(true);
      for (const f of p.functions) {
        expect(FUNCTION_IDS.has(f), `${p.id} → función ${f}`).toBe(true);
        expect(
          p.screens.includes(SCREEN_FUNCTIONS.get(f)),
          `${p.id} → ${f} fuera de sus screens`
        ).toBe(true);
      }
      expect([...new Set(p.functions)].length).toBe(p.functions.length);
    }
  });

  it('ADMIN cubre todas las pantallas no-private-beta', () => {
    const admin = profileById('ADMIN');
    const expected = SCREEN_REGISTRY.filter((s) => !s.privateBeta)
      .map((s) => s.id)
      .sort();
    expect(admin.screens).toEqual(expected);
  });

  it('perfiles NO normalizados ⊆ acceso efectivo real de su rol legacy (zero unexpected gain)', () => {
    for (const p of PROFILES_V2) {
      if (p.normalized || !p.legacyRole) continue;
      const legacyScreens = legacyScreensOfRole(p.legacyRole);
      for (const s of p.screens) {
        expect(
          legacyScreens,
          `${p.id} → ${s} no está en el acceso real de ${p.legacyRole}`
        ).toContain(s);
      }
    }
  });

  it('OPERADOR_PANEL_NV normalizado: sin Dashboard/TV/Builder (spec §49)', () => {
    const op = profileById('OPERADOR_PANEL_NV');
    expect(op.normalized).toBe(true);
    expect(op.screens).toEqual(expect.arrayContaining(['panel.nv.entry', 'panel.nv.info']));
    expect(op.screens).not.toContain('panel.dashboard');
    expect(op.screens).not.toContain('panel.tv');
    expect(op.screens).not.toContain('panel.builder');
    expect(op.functions).toEqual(
      expect.arrayContaining(['panel.nv.entry.create', 'panel.nv.info.view'])
    );
  });

  it('ningún perfil se asigna automáticamente (status: solo definición)', () => {
    for (const p of PROFILES_V2) {
      expect(p.assignedTo).toBeUndefined();
    }
  });
});
