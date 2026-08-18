import { describe, expect, it } from 'vitest';

// PR-008 · RPC/GRANT/RLS audit phase 1 — contrato de superficie del cliente.
// El frontend NO debe invocar RPCs de escalada de privilegios ni de
// administración IAM directa desde el cliente. Si alguien agrega una llamada
// a estos RPCs en src, este test falla a propósito.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const srcDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// RPCs que NUNCA deben ejecutarse desde el cliente, aunque sea un admin:
// reasignación de roles, cambio de contraseña, creación/desactivación de
// usuarios y delegaciones administrativas. Estas operaciones pasan por
// mecanismos server-side (service_role / triggers) y no tienen equivalente
// de invocación directa en el frontend.
const RPC_PROHIBIDOS = [
  'iam_assign_rol',
  'iam_set_password',
  'iam_crear_usuario',
  'iam_actualizar_usuario',
  'iam_desactivar_usuario',
  'iam_admin_change',
];

function rpcNombresUsados() {
  const names = new Set();
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === 'tests' || entry.name.startsWith('__')) continue;
        walk(p);
      } else if (/\.(js|jsx)$/.test(entry.name)) {
        const content = fs.readFileSync(p, 'utf8');
        for (const m of content.matchAll(/\.rpc\(\s*['"]([a-zA-Z0-9_]+)/g)) {
          names.add(m[1]);
        }
      }
    }
  };
  walk(srcDir);
  return names;
}

describe('PR-008 · superficie RPC del cliente', () => {
  it('no invoca RPCs de escalada / admin IAM desde el frontend', () => {
    const usados = rpcNombresUsados();
    const violaciones = RPC_PROHIBIDOS.filter((rpc) => usados.has(rpc));
    expect(violaciones, 'RPCs prohibidos usados en el cliente: ' + violaciones.join(', ')).toEqual([]);
  });
});