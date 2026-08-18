import { describe, expect, it } from 'vitest';
import { ROUTE_PERMISSIONS, TAB_PERMISSIONS } from '../constants/permissions.js';
import { APP_PERMISSIONS } from '../config/modules.js';
import { MODULE_REGISTRY } from '../domain/access/moduleRegistry.js';
import { SCREEN_REGISTRY } from '../domain/access/screenRegistry.js';
import { FUNCTION_REGISTRY } from '../domain/access/functionRegistry.js';
import { classifyAllLegacyPermissions, countByType } from '../domain/access/legacyClassifier.js';
import { LEGACY_EXPANSION_MAP, expansionFor } from '../domain/access/legacyExpansionMap.js';

const MODULE_IDS = new Set(MODULE_REGISTRY.map((m) => m.id));
const SCREEN_IDS = new Set(SCREEN_REGISTRY.map((s) => s.id));

describe('PR-IAM-R02 · Module/Screen/Function Registry', () => {
  it('módulos: ids únicos y screens referencian módulos existentes', () => {
    expect(MODULE_IDS.size).toBe(MODULE_REGISTRY.length);
    for (const s of SCREEN_REGISTRY)
      expect(MODULE_IDS.has(s.module), `screen ${s.id} → módulo ${s.module}`).toBe(true);
  });

  it('screens: ids únicos, rutas declaradas en ROUTE_PERMISSIONS y defaultPermission coherente', () => {
    expect(SCREEN_IDS.size).toBe(SCREEN_REGISTRY.length);
    for (const s of SCREEN_REGISTRY) {
      for (const r of s.routes) {
        expect(
          ROUTE_PERMISSIONS[r],
          `ruta ${r} (screen ${s.id}) debe existir en ROUTE_PERMISSIONS`
        ).toBeDefined();
        if (!s.privateBeta) {
          expect(
            ROUTE_PERMISSIONS[r].includes(s.defaultPermission),
            `defaultPermission ${s.defaultPermission} de ${s.id} debe estar entre los permisos de ${r}`
          ).toBe(true);
        }
      }
    }
  });

  it('screens: toda ruta de ROUTE_PERMISSIONS (excepto /seguridad) está mapeada a una pantalla', () => {
    const mapeadas = new Set(SCREEN_REGISTRY.flatMap((s) => s.routes));
    for (const r of Object.keys(ROUTE_PERMISSIONS)) {
      if (r === '/seguridad' || r === '/inventory/bloque/:codigo') continue;
      expect(mapeadas.has(r), `ruta ${r} sin screen en SCREEN_REGISTRY`).toBe(true);
    }
  });

  it('funciones: ids únicos, patrón module.screen.action, screen existente y riesgo válido', () => {
    const ids = new Set(FUNCTION_REGISTRY.map((f) => f.id));
    expect(ids.size).toBe(FUNCTION_REGISTRY.length);
    const RISKS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
    for (const f of FUNCTION_REGISTRY) {
      expect(SCREEN_IDS.has(f.screen), `función ${f.id} → screen ${f.screen}`).toBe(true);
      expect(f.id.split('.').length >= 3, `${f.id} debe seguir module.screen.action`).toBe(true);
      expect(RISKS).toContain(f.risk);
      expect(['DENY']).toContain(f.defaultAccess);
    }
  });
});

describe('PR-IAM-R03 · Legacy Permission Classifier', () => {
  const catalog = new Set(APP_PERMISSIONS.flatMap((m) => m.permissions.map((p) => p.id)));
  const classified = classifyAllLegacyPermissions();
  const byId = new Map(classified.map((c) => [c.id, c]));

  it('clasifica TODO el catálogo de APP_PERMISSIONS (ninguno sin tipo)', () => {
    for (const permId of catalog) {
      expect(byId.has(permId), `${permId} sin clasificar`).toBe(true);
    }
  });

  it('manage_panel es LEGACY_BROAD y su expansión abre exactamente las rutas reales', () => {
    const cls = byId.get('manage_panel');
    expect(cls.type).toBe('LEGACY_BROAD');
    const real = Object.keys(ROUTE_PERMISSIONS)
      .filter((r) => ROUTE_PERMISSIONS[r].includes('manage_panel'))
      .sort();
    expect(expansionFor('manage_panel').routes).toEqual(real);
  });

  it('permisos tab y amplios de TAB_PERMISSIONS están clasificados', () => {
    for (const cfg of Object.values(TAB_PERMISSIONS)) {
      for (const p of cfg._amplios || [])
        expect(byId.has(p), `amplio ${p} sin clasificar`).toBe(true);
      for (const [tab, perm] of Object.entries(cfg)) {
        if (!tab.startsWith('_') && perm)
          expect(byId.has(perm), `tab perm ${perm} sin clasificar`).toBe(true);
      }
    }
  });

  it('tipos presentes: hay BROAD, GRANULAR, TAB, ADMIN y UNUSED', () => {
    const counts = countByType();
    expect(counts.BROAD || 0).toBeGreaterThan(0);
    expect(counts.GRANULAR || 0).toBeGreaterThan(0);
    expect(counts.TAB || 0).toBeGreaterThan(0);
    expect(counts.ADMIN || 0).toBeGreaterThan(0);
    expect(counts.UNUSED || 0).toBeGreaterThan(0);
  });
});

describe('PR-IAM-R04 · Legacy Expansion Map', () => {
  it('expansión de manage_panel NO incluye eliminar_nv ni aprobar reaperturas', () => {
    const fns = expansionFor('manage_panel').functions;
    expect(fns).not.toContain('panel.nv.entry.delete');
    expect(fns).not.toContain('panel.nv.reopen.approve');
    expect(fns).toContain('panel.nv.entry.create');
    expect(fns).toContain('panel.tv.view');
  });

  it('cada permiso del mapa de expansión existe en el mapa de rutas', () => {
    for (const [perm, cfg] of Object.entries(LEGACY_EXPANSION_MAP)) {
      for (const r of cfg.routes) {
        expect(ROUTE_PERMISSIONS[r]?.includes(perm), `${perm} no abre ${r}`).toBe(true);
      }
    }
  });
});
