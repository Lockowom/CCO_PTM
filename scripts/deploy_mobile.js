import { execSync } from 'child_process';
import fs from 'fs';

console.log('🚀 Iniciando despliegue OTA para móviles...');

// 1. Auto-incrementar la versión (Patch)
try {
  console.log('📦 Actualizando versión en package.json...');
  execSync('npm version patch --no-git-tag-version', { stdio: 'inherit' });
} catch (e) {
  console.warn('⚠️ No se pudo auto-incrementar la versión (quizás no hay un repositorio git inicializado).');
  // Auto-incremento manual si falla npm version
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const versionParts = pkg.version.split('.');
  versionParts[2] = parseInt(versionParts[2], 10) + 1;
  pkg.version = versionParts.join('.');
  fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
  console.log(`✅ Versión actualizada manualmente a ${pkg.version}`);
}

// 2. Build de la aplicación Web
console.log('🏗️ Compilando código de React (Vite)...');
execSync('npm run build', { stdio: 'inherit' });

// 3. Sincronización con Android (opcional pero recomendado)
console.log('🔄 Sincronizando assets con Capacitor...');
execSync('npx cap sync android', { stdio: 'inherit' });

// 4. Subida a Capgo
console.log('☁️ Subiendo el bundle a Capgo Cloud...');
execSync('npx @capgo/cli bundle upload', { stdio: 'inherit' });

console.log('✅ Despliegue móvil finalizado con éxito.');
