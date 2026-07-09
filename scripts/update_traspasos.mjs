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

// 2.5) Re-inyectar en index.html los archivos propios de CCO (no vienen de
//      em-il y no están en RUNTIME, así que persisten entre updates):
//        - cco-theme.css   → tema de marca (en <head>, tras styles.css)
//        - cco-bridge.js   → puente a Supabase (antes de </body>)
const INDEX = path.join(DEST, 'index.html');
const THEME_TAG =
  '<!-- CCO_PTM: tema de marca (re-inyectado por scripts/update_traspasos.mjs) -->\n' +
  '<link rel="stylesheet" href="cco-theme.css">\n' +
  '<!-- CCO_PTM: embebido en CCO → forzar tema claro antes de pintar -->\n' +
  "<script>if(window.self!==window.top){document.documentElement.classList.add('cco-embedded');document.documentElement.dataset.theme='light';}</script>";
const BRIDGE_TAG =
  '<!-- CCO_PTM: puente a Supabase (re-inyectado por scripts/update_traspasos.mjs) -->\n' +
  '<script src="cco-bridge.js"></script>';
try {
  let html = fs.readFileSync(INDEX, 'utf8');

  // Tema de marca (tras el <link> de styles.css; si no, antes de </head>).
  if (!html.includes('cco-theme.css')) {
    if (html.includes('href="styles.css">')) {
      html = html.replace('href="styles.css">', 'href="styles.css">\n' + THEME_TAG);
    } else if (html.includes('</head>')) {
      html = html.replace('</head>', THEME_TAG + '\n</head>');
    } else {
      html = THEME_TAG + '\n' + html;
    }
    console.log('   ✓ cco-theme.css re-inyectado en index.html');
  } else {
    console.log('   ✓ index.html ya referencia cco-theme.css');
  }

  // Puente a Supabase (antes de </body>).
  if (!html.includes('cco-bridge.js')) {
    if (html.includes('</body>')) {
      html = html.replace('</body>', BRIDGE_TAG + '\n</body>');
    } else {
      html += '\n' + BRIDGE_TAG + '\n';
    }
    console.log('   ✓ cco-bridge.js re-inyectado en index.html');
  } else {
    console.log('   ✓ index.html ya referencia cco-bridge.js');
  }

  fs.writeFileSync(INDEX, html);

  for (const f of ['cco-theme.css', 'cco-bridge.js']) {
    if (!fs.existsSync(path.join(DEST, f))) {
      console.warn(`   ⚠️  Falta public/traspasos/${f} (archivo propio de CCO)`);
    }
  }
} catch (e) {
  console.error('❌ No se pudo re-inyectar los archivos de CCO:', e.message);
  process.exit(1);
}

// 3) Marcar el commit de origen para trazabilidad.
let commit = 'desconocido';
try { commit = execSync('git rev-parse HEAD', { cwd: TMP }).toString().trim(); } catch (_) { /* noop */ }
fs.writeFileSync(path.join(DEST, 'SOURCE_COMMIT.txt'), commit + '\n');

console.log(`\n✅ Traspasos actualizado (lockowom/em-il @ ${commit.slice(0, 10)}).`);
console.log('   Ahora corre:  npm run build   y commitea dist/ para desplegar.');
