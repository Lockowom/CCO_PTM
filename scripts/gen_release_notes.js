// Genera src/constants/releaseNotes.generated.js a partir del Changelog (§15) de
// DOCUMENTACION_PROYECTO.md. Se ejecuta en cada build (prebuild), así el "cuadro
// de Novedades" SIEMPRE refleja la última versión sin mantenimiento manual.
//
//   node scripts/gen_release_notes.js
//
// FORMATO (estilo "patch notes", simple para el usuario):
//   Cada fila del changelog es  |  version | fecha | **Título técnico**. Texto…  |
//   y OPCIONALMENTE puede llevar, dentro de la misma celda, una versión amable:
//     {{titulo: Título simple para el usuario}}
//     {{simple: [nuevo] Algo nuevo ;; [mejora] Algo mejoró ;; [fix] Se arregló X}}
//   Etiquetas: nuevo · mejora (alias buff) · fix (alias arreglo/bug) ·
//              ajuste (alias nerf/cambio) · seguridad.  Separador de items: " ;; "
//   (NO usar "|" dentro de la anotación: rompería la tabla markdown).
//   Si NO hay {{simple}}, se auto-clasifica y se limpia la jerga técnica.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const MAX_NOTAS = 15;          // cuántas versiones mostrar en el modal
const MAX_TEXTO = 260;         // recorte del cuerpo cuando NO hay versión simple

const ALIAS = {
  nuevo: 'nuevo', nueva: 'nuevo', new: 'nuevo',
  mejora: 'mejora', buff: 'mejora', mejoro: 'mejora',
  fix: 'fix', arreglo: 'fix', bug: 'fix', arreglado: 'fix',
  ajuste: 'ajuste', nerf: 'ajuste', cambio: 'ajuste',
  seguridad: 'seguridad', security: 'seguridad',
};
const EMOJI = { nuevo: '🆕', mejora: '⬆️', fix: '🔧', ajuste: '⚙️', seguridad: '🛡️' };

// Markdown ligero → texto plano legible.
function limpiar(md) {
  return String(md || '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

// Quita la jerga técnica del texto (para las notas SIN versión simple).
function simplificar(t) {
  return String(t || '')
    .replace(/\(?\bmigraci[oó]n(?:es)?\s*\d+[^)]*\)?/gi, '')   // (migración 137 …)
    .replace(/\bmig\.?\s*\d+\b/gi, '')                          // mig 137
    .replace(/\bsrc\/[^\s,;)]+/gi, '')                         // rutas de archivo
    .replace(/\b[\w.-]+\.(?:jsx?|sql|css|md|json)\b/gi, '')    // archivo.jsx
    .replace(/\bRPCs?\b/gi, '').replace(/\bMV\b/g, '')
    .replace(/\bSECURITY DEFINER\b/gi, '')
    .replace(/\s*\(\s*\)/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([.,;:])/g, '$1')
    .replace(/[·\-\s]+$/,'')
    .trim();
}

// Adivina la etiqueta a partir del texto (prioridad: seguridad→nuevo→fix→mejora).
function clasificar(txt) {
  const t = String(txt || '').toLowerCase();
  if (/segur|permiso|rls|hardening|2fa|mfa|contrase|revoke|\banon\b|hallazgo|blindaje/.test(t)) return 'seguridad';
  if (/nuevo|nueva|añad|agrega|incorpora|m[oó]dulo|pesta[ñn]a|asistente|\bpanel\b|\bport\b|llega|integra/.test(t)) return 'nuevo';
  if (/\bfix\b|arregl|corrig|\bbug|soluciona|repara|se rompe|crash|evita/.test(t)) return 'fix';
  return 'mejora';
}

function itemsDesdeSimple(raw) {
  return String(raw).split(';;').map((s) => s.trim()).filter(Boolean).map((seg) => {
    const m = seg.match(/^\[([^\]]+)\]\s*([\s\S]*)$/);
    const tag = m ? String(m[1]).toLowerCase().trim() : 'mejora';
    const tipo = ALIAS[tag] || 'mejora';
    return { tipo, texto: limpiar(m ? m[2] : seg) };
  }).filter((x) => x.texto);
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
    let cambiosRaw = inner.slice(i2 + 1).trim();

    // Anotaciones amables opcionales.
    const mSimple = cambiosRaw.match(/\{\{\s*simple\s*:\s*([\s\S]*?)\}\}/i);
    const mTitulo = cambiosRaw.match(/\{\{\s*titulo\s*:\s*([\s\S]*?)\}\}/i);
    // Cuerpo técnico sin las anotaciones (para el fallback).
    const sinAnot = cambiosRaw.replace(/\{\{[\s\S]*?\}\}/g, '').trim();

    const mBold = sinAnot.match(/\*\*(.+?)\*\*/);
    const tituloTecnico = mBold ? limpiar(mBold[1]).replace(/[.:]$/, '') : `Versión ${version}`;
    const titulo = mTitulo ? limpiar(mTitulo[1]) : tituloTecnico;

    let cambios;
    if (mSimple) {
      cambios = itemsDesdeSimple(mSimple[1]);
    } else {
      // Fallback: un solo item, etiqueta auto. Se toma solo la PRIMERA frase
      // (más legible que volcar el párrafo técnico) y se limpia la jerga.
      let cuerpo = simplificar(limpiar(mBold ? sinAnot.replace(mBold[0], '') : sinAnot).replace(/^[.·\-\s]+/, ''));
      const primera = cuerpo.split(/(?<=[.!?])\s+/).find((s) => s.trim().length > 12) || cuerpo;
      cuerpo = primera.trim();
      if (cuerpo.length > MAX_TEXTO) cuerpo = cuerpo.slice(0, MAX_TEXTO).replace(/\s+\S*$/, '') + '…';
      const tipo = clasificar(`${tituloTecnico} ${cuerpo}`);
      cambios = cuerpo ? [{ tipo, texto: cuerpo }] : [];
    }

    const emoji = EMOJI[cambios[0]?.tipo] || '🚀';
    notas.push({ version, fecha: fecha === '—' ? '' : fecha, titulo, emoji, cambios });
    if (notas.length >= MAX_NOTAS) break;   // ya vienen de más nueva a más antigua
  }
  return notas;
}

const notas = parse();
const out = `// ARCHIVO GENERADO — no editar a mano.
// Se regenera en cada build desde el Changelog de DOCUMENTACION_PROYECTO.md
// (scripts/gen_release_notes.js). Para cambiar una nota, edita el changelog
// (opcional: anota {{titulo: …}} y {{simple: [etiqueta] … ;; …}} para lenguaje simple).
export const RELEASE_NOTES = ${JSON.stringify(notas, null, 2)};
`;
writeFileSync(join(ROOT, 'src/constants/releaseNotes.generated.js'), out);
console.log(`releaseNotes.generated.js: ${notas.length} notas (última v${notas[0]?.version}).`);
