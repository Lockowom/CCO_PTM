// effectiveView.js — PR-IAM-R09/R10 · Vista efectiva read-only por usuario
// ----------------------------------------------------------------------------
// Construye la vista "exactamente qué tiene cada usuario" (spec §105-106):
// por cada pantalla del registro → permitido/denegado + ORIGEN + razones, y el
// diff contra el guard legacy (SAME/LOSS/GAIN) para visibilizar el zero-loss.
// Puro y testeable: no toca red ni UI.
import { SCREEN_REGISTRY } from './screenRegistry.js';
import { MODULE_REGISTRY } from './moduleRegistry.js';
import { FUNCTION_REGISTRY } from './functionRegistry.js';
import { resolveAccessV2, legacyScreenAccess } from './resolverV2.js';

export const DIFF = { SAME: 'SAME', LOSS: 'LOSS', GAIN: 'GAIN' };

export const ORIGIN_LABEL = {
  EXPLICIT_DENY: 'Denegación explícita',
  DIRECT_ALLOW: 'Permiso individual',
  VALID_DELEGATION: 'Delegación',
  PROFILE_ALLOW: 'Perfil',
  TEAM_ALLOW: 'Equipo',
  LEGACY_COMPATIBILITY: 'Legacy',
  DEFAULT_DENY: 'No asignado',
  PRIVATE_BETA: 'Private Beta'
};

export const ORIGIN_TONE = {
  EXPLICIT_DENY: 'red',
  DIRECT_ALLOW: 'emerald',
  VALID_DELEGATION: 'indigo',
  PROFILE_ALLOW: 'blue',
  TEAM_ALLOW: 'cyan',
  LEGACY_COMPATIBILITY: 'amber',
  DEFAULT_DENY: 'slate',
  PRIVATE_BETA: 'purple'
};

const screenById = new Map(SCREEN_REGISTRY.map((s) => [s.id, s]));
const moduleById = new Map(MODULE_REGISTRY.map((m) => [m.id, m]));

export function buildEffectiveView({ perms = [], overrides = [], privateBetaFlags = {} }) {
  const v2 = resolveAccessV2({ perms, overrides, privateBetaFlags });
  const legacy = new Map(
    legacyScreenAccess({ perms, privateBetaFlags }).map((s) => [s.id, s.allow])
  );

  const screens = v2.screens.map((s) => {
    const meta = screenById.get(s.id);
    const legacyAllow = legacy.get(s.id);
    const diff = s.allow === legacyAllow ? DIFF.SAME : s.allow ? DIFF.GAIN : DIFF.LOSS;
    return {
      id: s.id,
      module: s.module,
      label: meta ? meta.label : s.id,
      routes: meta ? meta.routes : [],
      risk: meta ? meta.risk : 'LOW',
      navigation: meta ? meta.navigation : false,
      privateBeta: meta ? meta.privateBeta : false,
      allow: s.allow,
      origin: s.origin,
      reasons: s.reasons,
      diff
    };
  });

  const modules = MODULE_REGISTRY.map((m) => {
    const child = screens.filter((s) => s.module === m.id);
    return {
      id: m.id,
      label: m.label,
      description: m.description,
      privateBeta: !!m.privateBeta,
      allow: child.some((s) => s.allow),
      screens: child
    };
  });

  const functions = FUNCTION_REGISTRY.map((f) => {
    const parent = screenById.get(f.screen);
    return {
      id: f.id,
      module: f.module,
      screen: f.screen,
      screenLabel: parent ? parent.label : f.screen,
      label: f.label,
      risk: f.risk,
      critical: !!f.critical,
      backendAction: f.backendAction || null
    };
  });

  const counts = {
    modules: MODULE_REGISTRY.length,
    screens: SCREEN_REGISTRY.length,
    functions: FUNCTION_REGISTRY.length,
    allowed: screens.filter((s) => s.allow).length,
    denied: screens.filter((s) => !s.allow).length,
    losses: screens.filter((s) => s.diff === DIFF.LOSS).length,
    gains: screens.filter((s) => s.diff === DIFF.GAIN).length,
    overrides: overrides.filter((o) => o.access !== 'INHERIT').length
  };

  return { modules, screens, functions, counts, unmapped: v2.unmapped };
}
