import { describe, expect, it, vi } from 'vitest';
import {
  normalizeOverrides,
  fetchMyOverrides,
  OVERRIDE_ACCESS
} from '../domain/access/overridesAdapter.js';
import { resolveAccessV2, ORIGIN } from '../domain/access/resolverV2.js';

vi.mock('../supabase.js', () => ({ supabase: {} }));

vi.mock('../core/infrastructure/supabase/rpcClient.js', () => ({
  rpcQuery: vi.fn()
}));

import { rpcQuery } from '../core/infrastructure/supabase/rpcClient.js';

describe('PR-IAM-R07 · Direct Overrides (adapter + precedencia)', () => {
  it('normalizeOverrides: solo screens con access válido; INHERIT se conserva', () => {
    const rows = [
      { surface_type: 'screen', surface_id: 'panel.tv', access: 'DENY', reason: 'ruido' },
      { surface_type: 'screen', surface_id: 'panel.builder', access: 'ALLOW' },
      { surface_type: 'screen', surface_id: 'panel.dashboard', access: 'INHERIT' },
      { surface_type: 'function', surface_id: 'panel.nv.entry.delete', access: 'ALLOW' },
      { surface_type: 'screen', surface_id: 'panel.info', access: 'MAYBE' },
      null
    ];
    const out = normalizeOverrides(rows);
    expect(out).toEqual([
      { surface: 'panel.tv', access: 'DENY', reason: 'ruido' },
      { surface: 'panel.builder', access: 'ALLOW', reason: null },
      { surface: 'panel.dashboard', access: 'INHERIT', reason: null }
    ]);
  });

  it('normalizeOverrides: no-array → []', () => {
    expect(normalizeOverrides(undefined)).toEqual([]);
    expect(normalizeOverrides(null)).toEqual([]);
    expect(normalizeOverrides('x')).toEqual([]);
  });

  it('INHERIT = sin override: cae a PROFILE_ALLOW / DEFAULT_DENY', () => {
    const res = resolveAccessV2({
      perms: ['panel_ingresar'],
      overrides: [{ surface: 'panel.nv.entry', access: OVERRIDE_ACCESS.INHERIT }],
      privateBetaFlags: {}
    });
    const entry = res.screens.find((s) => s.id === 'panel.nv.entry');
    expect(entry.allow).toBe(true);
    expect(entry.origin).toBe(ORIGIN.PROFILE_ALLOW);

    const res2 = resolveAccessV2({
      perms: [],
      overrides: [{ surface: 'panel.nv.entry', access: OVERRIDE_ACCESS.INHERIT }],
      privateBetaFlags: {}
    });
    expect(res2.screens.find((s) => s.id === 'panel.nv.entry').allow).toBe(false);
  });

  it('fetchMyOverrides: RPC ok → overrides normalizados; error → [] (shadow fail-closed)', async () => {
    rpcQuery.mockResolvedValueOnce([
      { surface_type: 'screen', surface_id: 'panel.tv', access: 'DENY', reason: null }
    ]);
    expect(await fetchMyOverrides()).toEqual([
      { surface: 'panel.tv', access: 'DENY', reason: null }
    ]);

    rpcQuery.mockRejectedValueOnce(new Error('no hay tabla'));
    expect(await fetchMyOverrides()).toEqual([]);
  });
});
