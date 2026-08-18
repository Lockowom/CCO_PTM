// PR-015B · Contrato de la regla transversal HIDDEN_PRIVATE_BETA.
// FEATURE_IMPLEMENTED != FEATURE_RELEASED: un módulo en beta solo es accesible
// con flag ON + rol IAM beta + permiso específico. Sin UUIDs hardcodeados.
import { describe, expect, it } from 'vitest';
import {
  PRIVATE_BETA_MODULES,
  RELEASE_STAGES,
  privateBetaForPath,
  evaluatePrivateBetaAccess,
  inPrivateBetaRole,
} from '../constants/privateBeta';
import { isFeatureFlagEnabled, enabledFeatureFlags } from '../config/featureFlags';
import { ROUTE_META, getNavGroups, SEARCHABLE_ROUTES } from '../constants/routeMeta';
import { puedeAccederRuta } from '../constants/permissions';

const betaRole = ['cco_private_beta_rutas'];
const hasBetaPerm = (permission) => permission === 'view_rutas_private_beta';
const noPerms = () => false;
const allPerms = () => true;

describe('PR-015B · registro de módulos en private beta', () => {
  it('resuelve la config por ruta exacta y con query', () => {
    expect(privateBetaForPath('/panel/rutas')).toEqual(PRIVATE_BETA_MODULES.rutas);
    expect(privateBetaForPath('/panel/rutas?tab=plan')).toEqual(PRIVATE_BETA_MODULES.rutas);
    expect(privateBetaForPath('/panel')).toBeNull();
  });

  it('no usa UUIDs: solo rol IAM + permisos', () => {
    expect(PRIVATE_BETA_MODULES.rutas.betaRole).toBe('cco_private_beta_rutas');
    expect(PRIVATE_BETA_MODULES.rutas.viewPermission).toBe('view_rutas_private_beta');
    expect(String(JSON.stringify(PRIVATE_BETA_MODULES))).not.toMatch(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
  });

  it('declara la etapa de release', () => {
    expect(PRIVATE_BETA_MODULES.rutas.stage).toBe(RELEASE_STAGES.PRIVATE_BETA);
  });
});

describe('PR-015B · evaluatePrivateBetaAccess (3 capas)', () => {
  const cfg = PRIVATE_BETA_MODULES.rutas;

  it('flag OFF → FLAG_OFF (el módulo no existe, 404)', () => {
    const { allowed, reason } = evaluatePrivateBetaAccess(cfg, {
      flagOn: false,
      hasPermission: allPerms,
      roles: betaRole,
    });
    expect(allowed).toBe(false);
    expect(reason).toBe('FLAG_OFF');
  });

  it('flag ON + sin rol beta → NOT_IN_BETA, aunque tenga el permiso', () => {
    const { allowed, reason } = evaluatePrivateBetaAccess(cfg, {
      flagOn: true,
      hasPermission: hasBetaPerm,
      roles: [],
    });
    expect(allowed).toBe(false);
    expect(reason).toBe('NOT_IN_BETA');
  });

  it('flag ON + rol beta + sin permiso → NO_PERMISSION', () => {
    const { allowed, reason } = evaluatePrivateBetaAccess(cfg, {
      flagOn: true,
      hasPermission: noPerms,
      roles: betaRole,
    });
    expect(allowed).toBe(false);
    expect(reason).toBe('NO_PERMISSION');
  });

  it('flag ON + rol beta + permiso → allowed', () => {
    const { allowed, reason } = evaluatePrivateBetaAccess(cfg, {
      flagOn: true,
      hasPermission: hasBetaPerm,
      roles: betaRole,
    });
    expect(allowed).toBe(true);
    expect(reason).toBeNull();
  });

  it('sin config → allowed (módulo no-beta no se toca)', () => {
    expect(evaluatePrivateBetaAccess(null, { hasPermission: noPerms, roles: [] })).toEqual({
      allowed: true,
      reason: null,
      stage: null,
    });
  });

  it('ADMIN sin rol beta no abre la beta por sí solo', () => {
    const { allowed } = evaluatePrivateBetaAccess(cfg, {
      flagOn: true,
      hasPermission: allPerms, // ADMIN devuelve true para todo permiso
      roles: ['ADMIN'],
    });
    expect(allowed).toBe(false);
  });
});

describe('PR-015B · feature flags (fail-closed)', () => {
  it('flags no registrados están OFF', () => {
    expect(isFeatureFlagEnabled('module_inexistente_private_beta')).toBe(false);
  });

  it('rutas piloto activas tienen flag ON', () => {
    expect(isFeatureFlagEnabled('module_rutas_private_beta')).toBe(true);
  });

  it('enabledFeatureFlags devuelve solo los ON', () => {
    expect(enabledFeatureFlags()).toContain('module_rutas_private_beta');
  });
});

describe('PR-015B · routeMeta oculta módulos en beta (nav + búsqueda global)', () => {
  it('marca /panel/rutas como privateBeta y hiddenFromNav', () => {
    const meta = ROUTE_META.find((m) => m.path === '/panel/rutas');
    expect(meta).toBeDefined();
    expect(meta.privateBeta).toBe(true);
    expect(meta.hiddenFromNav).toBe(true);
    expect(meta.searchable).toBe(false);
  });

  it('no aparece en la navegación del AppShell', () => {
    const flat = getNavGroups().flatMap((g) => g.items.map((i) => i.path));
    expect(flat).not.toContain('/panel/rutas');
  });

  it('no aparece en la búsqueda global', () => {
    expect(SEARCHABLE_ROUTES.map((m) => m.path)).not.toContain('/panel/rutas');
  });
});

describe('PR-015B · puedeAccederRuta integra el gate (regresión)', () => {
  it('flag ON + rol beta + permiso → acceso', () => {
    expect(puedeAccederRuta('/panel/rutas', { rol: 'ADMIN' }, hasBetaPerm, betaRole)).toBe(true);
  });

  it('flag ON + sin rol beta → denegado', () => {
    expect(puedeAccederRuta('/panel/rutas', { rol: 'ADMIN' }, allPerms)).toBe(false);
  });

  it('rutas no-beta siguen sin tocarse', () => {
    expect(puedeAccederRuta('/panel', { rol: 'ADMIN' }, allPerms)).toBe(true);
  });

  it('inPrivateBetaRole detecta el rol beta', () => {
    expect(inPrivateBetaRole(PRIVATE_BETA_MODULES.rutas, ['cco_private_beta_rutas'])).toBe(true);
    expect(inPrivateBetaRole(PRIVATE_BETA_MODULES.rutas, ['ADMIN'])).toBe(false);
    expect(inPrivateBetaRole(null, betaRole)).toBe(false);
  });
});