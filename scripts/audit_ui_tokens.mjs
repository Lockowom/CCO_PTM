import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const sourceRoot = path.join(root, 'src');
const reportPath = path.join(root, 'docs', 'ui', 'UI_TOKEN_DEBT.md');
const extensions = new Set(['.js', '.jsx', '.ts', '.tsx', '.css']);

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return extensions.has(path.extname(entry.name)) ? [full] : [];
  });
}

const patterns = [
  { name: 'Colores hex', regex: /#[0-9a-fA-F]{3,8}\b/g },
  { name: 'Valores px', regex: /\b\d+(?:\.\d+)?px\b/g },
  { name: 'Sombras inline', regex: /box-shadow\s*:|shadow-\[/g },
  { name: 'z-index arbitrario', regex: /z-\[\d+\]|z-index\s*:\s*\d+/g }
];

const rows = walk(sourceRoot)
  .map((file) => {
    const text = fs.readFileSync(file, 'utf8');
    const counts = Object.fromEntries(
      patterns.map((p) => [p.name, text.match(p.regex)?.length || 0])
    );
    return { file: path.relative(root, file).replaceAll('\\', '/'), counts };
  })
  .filter((row) => Object.values(row.counts).some(Boolean));

const totals = Object.fromEntries(
  patterns.map((p) => [p.name, rows.reduce((sum, row) => sum + row.counts[p.name], 0)])
);
const generated = new Date().toISOString();
const markdown =
  `# Auditoría de deuda visual CCO 2.0\n\nGenerado automáticamente: ${generated}\n\n` +
  `> Este informe es una puerta de migración, no autoriza reemplazos mecánicos que cambien el comportamiento.\n\n` +
  `## Totales\n\n| Categoría | Coincidencias |\n|---|---:|\n${patterns.map((p) => `| ${p.name} | ${totals[p.name]} |`).join('\n')}\n\n` +
  `## Archivos con mayor deuda\n\n| Archivo | Hex | px | Sombras | z-index |\n|---|---:|---:|---:|---:|\n` +
  rows
    .sort(
      (a, b) =>
        Object.values(b.counts).reduce((x, y) => x + y, 0) -
        Object.values(a.counts).reduce((x, y) => x + y, 0)
    )
    .slice(0, 80)
    .map(
      (r) =>
        `| \`${r.file}\` | ${r.counts['Colores hex']} | ${r.counts['Valores px']} | ${r.counts['Sombras inline']} | ${r.counts['z-index arbitrario']} |`
    )
    .join('\n') +
  '\n';

fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(reportPath, markdown);
console.log(`UI token audit: ${rows.length} archivos -> ${path.relative(root, reportPath)}`);
