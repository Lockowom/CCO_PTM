// Genera src/constants/releaseNotes.generated.js a partir del Changelog (§15) de
// DOCUMENTACION_PROYECTO.md. Se ejecuta en cada build (prebuild), así el "cuadro
// de Novedades" SIEMPRE refleja la última versión sin mantenimiento manual.
//
//   node scripts/gen_release_notes.js
//
// Cada fila del changelog  |  version | fecha | **Título**. Texto…  |
// se convierte en  { version, fecha, titulo, cambios:[{ texto }] }.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const MAX_NOTAS = 15;          // cuántas versiones mostrar en el modal
const MAX_TEXTO = 320;         // recorte del cuerpo por versión

// Convierte markdown ligero a texto plano legible.
function limpiar(md) {
  return String(md || '')
    .replace(/\*\*(.+?)\*\*/g, '$1')       // **negrita** → texto
    .replace(/`([^`]+)`/g, '$1')           // `código` → texto
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // [texto](url) → texto
    .replace(/\s+/g, ' ')
    .trim();
}

function parse() {
  const doc = readFileSync(join(ROOT, 'DOCUMENTACION_PROYECTO.md'), 'utf8');
  const notas = [];
  for (const linea of doc.split('\n')) {
    if (!/^\|\s*\d+\.\d+\.\d+\s*\|/.test(linea)) continue;   // solo filas de versión
    const inner = linea.replace(/^\s*\|/, '').replace(/\|\s*$/, '');
    const i1 = inner.indexOf('|');
    const i2 = inner.indexOf('|', i1 + 1);
    if (i1 < 0 || i2 < 0) continue;
    const version = inner.slice(0, i1).trim();
    const fecha = inner.slice(i1 + 1, i2).trim();
    const cambiosRaw = inner.slice(i2 + 1).trim();

    // Título = primer texto en **negrita**; cuerpo = el resto.
    const mBold = cambiosRaw.match(/\*\*(.+?)\*\*/);
    const titulo = mBold ? limpiar(mBold[1]).replace(/[.:]$/, '') : `Versión ${version}`;
    let cuerpo = limpiar(mBold ? cambiosRaw.replace(mBold[0], '') : cambiosRaw).replace(/^[.·\-\s]+/, '');
    if (cuerpo.length > MAX_TEXTO) cuerpo = cuerpo.slice(0, MAX_TEXTO).replace(/\s+\S*$/, '') + '…';

    notas.push({ version, fecha: fecha === '—' ? '' : fecha, titulo, cambios: cuerpo ? [{ texto: cuerpo }] : [] });
    if (notas.length >= MAX_NOTAS) break;   // ya vienen de más nueva a más antigua
  }
  return notas;
}

const notas = parse();
const out = `// ARCHIVO GENERADO — no editar a mano.
// Se regenera en cada build desde el Changelog de DOCUMENTACION_PROYECTO.md
// (scripts/gen_release_notes.js). Para cambiar una nota, edita el changelog.
export const RELEASE_NOTES = ${JSON.stringify(notas, null, 2)};
`;
writeFileSync(join(ROOT, 'src/constants/releaseNotes.generated.js'), out);
console.log(`releaseNotes.generated.js: ${notas.length} notas (última v${notas[0]?.version}).`);
