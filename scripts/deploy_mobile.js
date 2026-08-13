import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Iniciando despliegue OTA para móviles...');

// 0. GUARDA DE SEGURIDAD: no compilar/subir un bundle OTA sin las variables de
// Supabase. Sin ellas el bundle queda SIN backend y dejaría la app Android rota
// para TODOS los dispositivos. Abortar antes de construir.
if (
  !process.env.VITE_SUPABASE_URL ||
  !(process.env.VITE_SUPABASE_KEY || process.env.VITE_SUPABASE_ANON_KEY)
) {
  console.error('\n❌ ABORTADO: faltan VITE_SUPABASE_URL / VITE_SUPABASE_KEY en el entorno.');
  console.error('   Compilar sin ellas produce un bundle OTA SIN conexión a Supabase.');
  console.error('   Corre este deploy en una máquina/CI con el .env correcto.\n');
  process.exit(1);
}

// 1. Auto-incrementar la versión (Patch) de manera extremadamente segura
let versionWasUpdated = false;
try {
  console.log('📦 Actualizando versión en package.json...');

  const pkgPath = path.resolve('package.json');

  // Usamos un bloque try-catch interno con reintentos para evadir bloqueos de antivirus/Vite
  let pkgData = null;
  let attempts = 0;

  while (!pkgData && attempts < 3) {
    try {
      pkgData = fs.readFileSync(pkgPath, 'utf8');
    } catch (err) {
      if (err.code === 'EPERM' || err.code === 'EBUSY') {
        attempts++;
        console.warn(`⚠️ Archivo bloqueado. Reintentando lectura... (${attempts}/3)`);
        // Pausa síncrona de 1 segundo
        Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 1000);
      } else {
        throw err;
      }
    }
  }

  if (!pkgData) throw new Error('No se pudo leer package.json después de varios intentos.');

  const pkg = JSON.parse(pkgData);

  const versionParts = pkg.version.split('.');
  versionParts[2] = parseInt(versionParts[2], 10) + 1;
  pkg.version = versionParts.join('.');

  // Escribir con un pequeño delay para asegurar que otros procesos hayan soltado el archivo
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
  console.log(`✅ Versión actualizada exitosamente a ${pkg.version}`);
  versionWasUpdated = true;
} catch (e) {
  console.error('❌ Error al actualizar la versión:', e.message);
  console.error('❌ ABORTADO: no se puede publicar OTA sin una versión nueva y consistente.');
  process.exit(1);
}

// 1.1 Mantener package-lock.json sincronizado para que GitHub Actions pueda usar
// `npm ci` sin fallar por desalineación entre package.json y package-lock.json.
if (versionWasUpdated) {
  console.log('🔒 Sincronizando package-lock.json...');
  execSync('npm install --package-lock-only --ignore-scripts', { stdio: 'inherit' });
}

// 2. Build de la aplicación Web
console.log('🏗️ Compilando código de React (Vite)...');
execSync('npm run build', { stdio: 'inherit' });

// 3. Sincronización con Android (opcional pero recomendado)
console.log('🔄 Sincronizando assets con Capacitor...');
execSync('npx cap sync android', { stdio: 'inherit' });

// 4. La publicación gratuita ocurre al subir el cambio a main. GitHub Actions
// genera un ZIP inmutable, calcula SHA-256, crea el Release y activa beta.
console.log('✅ Bundle y proyecto Android preparados.');
console.log('👉 Sube el cambio a main; GitHub publicará la versión en el canal beta gratuito.');
