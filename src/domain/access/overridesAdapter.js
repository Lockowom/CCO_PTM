import { rpcQuery } from '../../core/infrastructure/supabase/rpcClient.js';

export const OVERRIDE_ACCESS = Object.freeze({
  ALLOW: 'ALLOW',
  DENY: 'DENY',
  INHERIT: 'INHERIT'
});

const VALID_ACCESS = new Set(Object.values(OVERRIDE_ACCESS));

export function normalizeOverrides(rows) {
  if (!Array.isArray(rows)) return [];
  const out = [];
  for (const r of rows) {
    if (!r || r.surface_type !== 'screen') continue;
    if (!VALID_ACCESS.has(r.access)) continue;
    out.push({ surface: r.surface_id, access: r.access, reason: r.reason || null });
  }
  return out;
}

export async function fetchMyOverrides() {
  try {
    const rows = await rpcQuery(
      'iam_mis_overrides',
      {},
      { module: 'iam', action: 'mis_overrides' }
    );
    return normalizeOverrides(rows);
  } catch {
    return [];
  }
}
