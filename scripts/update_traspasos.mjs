// Re-sincroniza el módulo "Traspasos" (lockowom/em-il) dentro de CCO_PTM.
// Uso:  npm run update:traspasos   (luego  npm run build  y commitea dist/)
//
// Clona/actualiza el repo em-il en una carpeta temporal y copia solo los archivos
// de runtime a public/traspasos/. No toca la lógica de CCO: la app se sirve como
// estática en /traspasos y se embebe vía iframe (src/pages/Tools/Traspasos.jsx).
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

const REPO = process.env.TRASPASOS_REPO || 'https://github.com/lockowom/em-il';
const RUNTIME = ['index.html', 'styles.css', 'app.js', 'scene.js', 'data', 'vendor'];
const DEST = path.resolve('public/traspasos');
const TMP = path.join(os.tmpdir(), 'em-il-src');

const run = (cmd, opts = {}) => execSync(cmd, { stdio: 'inherit', ...opts });

console.log(`🔄 Actualizando módulo Traspasos desde ${REPO} …`);

// 1) Clonar (shallow) o actualizar el repo fuente.
try {
  if (fs.existsSync(path.join(TMP, '.git'))) {
    run('git fetch --depth 1 origin main && git reset --hard origin/main', { cwd: TMP });
  } else {
    fs.rmSync(TMP, { recursive: true, force: true });
    run(`git clone --depth 1 "${REPO}" "${TMP}"`);
  }
} catch (e) {
  console.error('❌ No se pudo clonar/actualizar el repo fuente:', e.message);
  process.exit(1);
}

// 2) Copiar solo los archivos de runtime a public/traspasos/.
fs.mkdirSync(DEST, { recursive: true });
for (const item of RUNTIME) {
  const from = path.join(TMP, item);
  const to = path.join(DEST, item);
  if (!fs.existsSync(from)) { console.warn(`⚠️  No existe en el fuente: ${item} (omitido)`); continue; }
  fs.rmSync(to, { recursive: true, force: true });
  fs.cpSync(from, to, { recursive: true });
  console.log(`   ✓ ${item}`);
}

// 3) Marcar el commit de origen para trazabilidad.
let commit = 'desconocido';
try { commit = execSync('git rev-parse HEAD', { cwd: TMP }).toString().trim(); } catch (_) { /* noop */ }
fs.writeFileSync(path.join(DEST, 'SOURCE_COMMIT.txt'), commit + '\n');

console.log(`\n✅ Traspasos actualizado (lockowom/em-il @ ${commit.slice(0, 10)}).`);
console.log('   Ahora corre:  npm run build   y commitea dist/ para desplegar.');
