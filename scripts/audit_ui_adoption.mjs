import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const pagesRoot = path.join(root, 'src', 'pages');
const reportPath = path.join(root, 'docs', 'ui', 'UI_ADOPTION.md');
const core = ['PageFrame', 'PageHeader', 'BrandHeader', 'DataTable', 'FormSection', 'InlineAlert'];

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return /\.(jsx?|tsx?)$/.test(entry.name) ? [full] : [];
  });
}

const pages = walk(pagesRoot).map((file) => {
  const text = fs.readFileSync(file, 'utf8');
  const used = core.filter((name) => new RegExp(`\\b${name}\\b`).test(text));
  return { file: path.relative(root, file).replaceAll('\\', '/'), used };
});
const adopted = pages.filter((page) => page.used.length > 0);
const coverage = pages.length ? (adopted.length / pages.length) * 100 : 100;
const generated = new Date().toISOString();
const markdown =
  `# Adopción UI CCO 2.0\n\nGenerado automáticamente: ${generated}\n\n` +
  `- Pantallas detectadas: **${pages.length}**\n- Con al menos un componente core: **${adopted.length}**\n- Cobertura actual: **${coverage.toFixed(1)}%**\n- Gate final requerido: **≥95%**\n\n` +
  `## Detalle\n\n| Pantalla | Componentes core | Estado |\n|---|---|---|\n` +
  pages
    .map(
      (p) =>
        `| \`${p.file}\` | ${p.used.join(', ') || '—'} | ${p.used.length ? 'En migración' : 'Pendiente'} |`
    )
    .join('\n') +
  '\n';

fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(reportPath, markdown);
console.log(`UI adoption: ${coverage.toFixed(1)}% -> ${path.relative(root, reportPath)}`);
