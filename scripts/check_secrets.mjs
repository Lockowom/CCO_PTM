import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const files = execFileSync('git', ['ls-files'], { encoding: 'utf8' })
  .split(/\r?\n/)
  .filter(Boolean)
  .filter((file) => !/^(package-lock\.json|docs\/cco2\/)/.test(file));

const patterns = [
  { name: 'Sentry user token', regex: /sntryu_[a-f0-9]{32,}/i },
  { name: 'Supabase service JWT', regex: /eyJ[a-zA-Z0-9_-]+\.eyJ[a-zA-Z0-9_-]*InNlcnZpY2Vfcm9sZSI[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]+/ },
  { name: 'Private key', regex: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/ }
];

const findings = [];
for (const file of files) {
  if (!fs.existsSync(file) || fs.statSync(file).size > 2_000_000) continue;
  const content = fs.readFileSync(file, 'utf8');
  for (const pattern of patterns) {
    if (pattern.regex.test(content)) findings.push(`${file}: ${pattern.name}`);
  }
}

if (findings.length) {
  console.error('Secretos potenciales detectados (el valor no se imprime):');
  findings.forEach((finding) => console.error(`- ${finding}`));
  process.exit(1);
}
console.log(`Secret scan OK: ${files.length} archivos versionados revisados.`);
