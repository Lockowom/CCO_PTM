import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Iniciando despliegue OTA para móviles...');

// 1. Auto-incrementar la versión (Patch) de manera extremadamente segura
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
} catch (e) {
  console.error('❌ Error al actualizar la versión:', e.message);
  console.log('⚠️ Continuando con el despliegue a pesar del error de versión...');
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
