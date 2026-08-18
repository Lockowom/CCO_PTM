import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveAccessV2, legacyScreenAccess } from '../domain/access/resolverV2.js';
import { SCREEN_REGISTRY } from '../domain/access/screenRegistry.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = join(__dirname, '../../docs/iam-v2/datos_iam.json');
const OUT_DIR = join(__dirname, '../../docs/iam-v2/harness-00c');
const PRIVATE_BETA_FLAGS = { 'panel.routes': false };

function loadData() {
  return JSON.parse(readFileSync(DATA_PATH, 'utf8'));
}

function permsForUser(data, usuario) {
  const roleIdToCode = new Map(data.iam_roles.map((r) => [r.id, r.codigo]));
  const rolePerms = new Map();
  for (const p of data.iam_role_permissions) {
    if (!rolePerms.has(p.rol)) rolePerms.set(p.rol, []);
    rolePerms.get(p.rol).push(p.permiso);
  }
  const assignments = data.assignments.filter((a) => a.principal_id === usuario.id);
  const set = new Set();
  if (assignments.length > 0) {
    for (const a of assignments) {
      const code = roleIdToCode.get(a.role_id);
      if (code && rolePerms.has(code)) for (const p of rolePerms.get(code)) set.add(p);
    }
  } else if (usuario.rol) {
    for (const p of rolePerms.get(usuario.rol) || []) set.add(p);
  }
  return [...set].sort();
}

const DIFF = { SAME_ALLOW: 0, SAME_DENY: 0, LOSS: 0, GAIN: 0, ERROR: 0 };
const diffRows = [];
const unmappedRows = [];

function runAllUsers() {
  const data = loadData();
  diffRows.length = 0;
  unmappedRows.length = 0;
  Object.keys(DIFF).forEach((k) => (DIFF[k] = 0));

  for (const usuario of data.usuarios) {
    const perms = permsForUser(data, usuario);
    let legacy;
    let v2;
    try {
      legacy = legacyScreenAccess({ perms, privateBetaFlags: PRIVATE_BETA_FLAGS });
      v2 = resolveAccessV2({ perms, privateBetaFlags: PRIVATE_BETA_FLAGS });
    } catch (e) {
      DIFF.ERROR += 1;
      diffRows.push({
        user: usuario.nombre,
        screen: '*',
        legacy: '?',
        v2: '?',
        diff: 'ERROR',
        detail: String(e)
      });
      continue;
    }

    for (const l of legacy) {
      const s = v2.screens.find((x) => x.id === l.id);
      const v2allow = s?.allow;
      let type;
      if (v2allow === l.allow) type = l.allow ? 'SAME_ALLOW' : 'SAME_DENY';
      else type = l.allow ? 'LOSS' : 'GAIN';
      DIFF[type] += 1;
      diffRows.push({
        user: usuario.nombre,
        screen: l.id,
        legacy: l.allow ? 'ALLOW' : 'DENY',
        v2: v2allow ? 'ALLOW' : 'DENY',
        diff: type,
        origin: s?.origin || ''
      });
    }

    for (const p of v2.unmapped) {
      unmappedRows.push({ user: usuario.nombre, permiso: p });
    }
  }
  return { DIFF, diffRows, unmappedRows };
}

function writeArtifacts(result) {
  mkdirSync(OUT_DIR, { recursive: true });
  const csv = ['user,screen,legacy,v2,diff,origin'];
  for (const r of result.diffRows)
    csv.push(`${r.user},${r.screen},${r.legacy},${r.v2},${r.diff},${r.origin}`);
  writeFileSync(join(OUT_DIR, 'diff_screens.csv'), csv.join('\n'), 'utf8');

  const un = ['user,permiso'];
  for (const r of result.unmappedRows) un.push(`${r.user},${r.permiso}`);
  writeFileSync(join(OUT_DIR, 'unmapped.csv'), un.join('\n'), 'utf8');

  const lines = [];
  lines.push('# Harness PR-IAM-R06 · Legacy vs Resolver V2 (surface-level, shadow mode)');
  lines.push('');
  lines.push(
    `Generado: ${new Date().toISOString()} · usuarios: ${result.users} · surfaces: ${SCREEN_REGISTRY.length}`
  );
  lines.push('');
  lines.push('## Resumen');
  lines.push('');
  for (const [k, v] of Object.entries(result.DIFF)) lines.push(`| ${k} | ${v} |`);
  lines.push('');
  lines.push('## Gate zero-loss');
  lines.push('');
  const blocking = result.DIFF.LOSS + result.DIFF.GAIN + result.DIFF.ERROR;
  lines.push(
    `LOSS+GAIN+ERROR = ${blocking} ${blocking === 0 ? 'PASS — cero, equivalente a nivel pantalla' : 'BLOQUEANTE hasta resolver'}`
  );
  lines.push('');
  lines.push('## UNMAPPED (permisos legacy sin pantalla — resolver pendiente R17+)');
  lines.push('');
  lines.push('| permiso | usuarios |');
  lines.push('|---|---|');
  const byPerm = new Map();
  for (const r of result.unmappedRows) {
    if (!byPerm.has(r.permiso)) byPerm.set(r.permiso, []);
    byPerm.get(r.permiso).push(r.user);
  }
  for (const [p, users] of [...byPerm.entries()].sort()) {
    lines.push(`| ${p} | ${users.join(', ')} |`);
  }
  lines.push('');
  lines.push(
    '> UNMAPPED no es pérdida: son permisos sin ruta (widget Asistente IA, RPCs). Se resuelven'
  );
  lines.push('> en la granularización por dominio (R17+) con permisos de función equivalentes.');
  writeFileSync(join(OUT_DIR, 'report.md'), lines.join('\n'), 'utf8');
}

describe('PR-IAM-R06 · Diff Harness Legacy vs V2 (todos los usuarios)', () => {
  const result = runAllUsers();

  it('ERROR=0 (resolver no falla para ningún usuario)', () => {
    expect(result.DIFF.ERROR).toBe(0);
  });

  it('screen-level: LOSS=0 y GAIN=0 (equivalencia legacy == V2 sin overrides)', () => {
    expect(result.DIFF.LOSS).toBe(0);
    expect(result.DIFF.GAIN).toBe(0);
  });

  it('UNMAPPED solo con permisos sin ruta (view_asistente/deploy_ota/export_data/manage_fichas)', () => {
    const expected = ['view_asistente', 'deploy_ota', 'export_data', 'manage_fichas'];
    const seen = new Set(result.unmappedRows.map((r) => r.permiso));
    for (const p of seen) expect(expected).toContain(p);
  });

  it('Nilo: legacy y V2 coinciden en las 5 pantallas del Panel (fixture spec §56-58)', () => {
    const data = loadData();
    const nilo = data.usuarios.find((u) => u.nombre.toLowerCase().includes('nilo'));
    expect(nilo).toBeDefined();
    const perms = permsForUser(data, nilo);
    const legacy = legacyScreenAccess({ perms, privateBetaFlags: PRIVATE_BETA_FLAGS });
    const v2 = resolveAccessV2({ perms, privateBetaFlags: PRIVATE_BETA_FLAGS });
    const allowed = v2.screens.filter((s) => s.allow).map((s) => s.id);
    expect(allowed).toEqual(
      expect.arrayContaining([
        'panel.dashboard',
        'panel.nv.entry',
        'panel.nv.info',
        'panel.tv',
        'panel.builder'
      ])
    );
    for (const l of legacy) {
      const s = v2.screens.find((x) => x.id === l.id);
      expect(s.allow, l.id).toBe(l.allow);
    }
    expect(allowed).not.toContain('panel.nv.reopen');
    expect(allowed).not.toContain('panel.settings');
  });

  it('escribe artefactos cuando IAM_HARNESS_WRITE=1', () => {
    if (process.env.IAM_HARNESS_WRITE === '1') {
      const data = loadData();
      result.users = data.usuarios.length;
      writeArtifacts(result);
      expect(result.DIFF.SAME_ALLOW + result.DIFF.SAME_DENY).toBe(
        data.usuarios.length * SCREEN_REGISTRY.length
      );
    } else {
      expect(true).toBe(true);
    }
  });
});
