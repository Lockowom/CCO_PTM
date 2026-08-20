import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const read = (file) => readFileSync(join(process.cwd(), file), 'utf8').toLowerCase();

describe('Centro OTA beta → producción', () => {
  const migration = read('supabase/migrations/20260820173922_ota_beta_control_center.sql');
  const deploy = read('supabase/functions/ota-deploy/index.ts');
  const updates = read('supabase/functions/ota-updates/index.ts');

  it('mantiene revisión auditada y bloquea acceso directo', () => {
    expect(migration).toContain('mobile_ota_release_reviews');
    expect(migration).toContain('enable row level security');
    expect(migration).toMatch(
      /revoke all on table public\.mobile_ota_release_reviews from public,anon,authenticated/
    );
    expect(migration).toContain("'beta_testing','approved','rejected','production','rolled_back'");
  });

  it('administra dispositivos y exige beta sana/aprobada', () => {
    expect(deploy).toContain("action === 'set-device-channel'");
    expect(deploy).toContain("action === 'review-beta'");
    expect(deploy).toContain("review?.status !== 'approved'");
    expect(deploy).toContain("eq('current_version', version)");
    expect(deploy).toContain("gte('last_seen_at', freshafter)");
  });

  it('el endpoint público no permite que un equipo se autoasigne a beta', () => {
    expect(updates).toContain("managed: 'admin_web'");
    expect(updates).toContain(".select('channel')");
    expect(updates).not.toContain('channel: next');
  });
});
