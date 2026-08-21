import { readdirSync, readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import path from 'node:path';

const assetsDir = path.resolve('dist/assets');
const files = readdirSync(assetsDir)
  .filter((name) => name.endsWith('.js'))
  .map((name) => {
    const bytes = readFileSync(path.join(assetsDir, name));
    return { name, raw: bytes.length, gzip: gzipSync(bytes).length };
  })
  .sort((a, b) => b.raw - a.raw);

const kib = (bytes) => Math.round((bytes / 1024) * 10) / 10;
const failures = [];
for (const file of files) {
  const isKnownHeavy = /^(pdfmake|vfs_fonts|xlsx)-/.test(file.name);
  const rawLimit = isKnownHeavy ? 1400 * 1024 : 650 * 1024;
  if (file.raw > rawLimit) failures.push(`${file.name}: ${kib(file.raw)} KiB > ${kib(rawLimit)} KiB`);
}

console.table(files.slice(0, 15).map((file) => ({ archivo: file.name, 'raw KiB': kib(file.raw), 'gzip KiB': kib(file.gzip) })));
if (failures.length) {
  console.error(`Bundle budget excedido:\n- ${failures.join('\n- ')}`);
  process.exit(1);
}
console.log(`Bundle budget OK: ${files.length} chunks JS auditados.`);
