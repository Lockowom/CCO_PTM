import { execSync } from 'child_process';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 Iniciando proceso de Auto-Despliegue CCO PTM...\n');

rl.question('📝 Escribe el mensaje para el commit: ', (commitMsg) => {
  if (!commitMsg.trim()) {
    console.error('❌ Error: El mensaje del commit no puede estar vacío.');
    rl.close();
    process.exit(1);
  }

  try {
    // 1. Añadir todos los cambios
    console.log('\n📦 Añadiendo archivos al stage (git add .)...');
    execSync('git add .', { stdio: 'inherit' });

    // 2. Hacer commit
    console.log(`\n💾 Creando commit: "${commitMsg}"...`);
    execSync(`git commit -m "${commitMsg}"`, { stdio: 'inherit' });

    // 3. Subir a GitHub
    console.log('\n☁️ Subiendo cambios a GitHub (git push)...');
    execSync('git push origin main', { stdio: 'inherit' });

    console.log('\n✅ ¡ÉXITO! Los cambios han sido subidos.');
    console.log('🌐 Si tienes Render/Vercel/Netlify conectado a la rama "main", el despliegue comenzará automáticamente.');
    
  } catch (error) {
    console.error('\n❌ Ocurrió un error durante el proceso de Git.');
    console.error('Asegúrate de no tener conflictos o archivos bloqueados.');
  } finally {
    rl.close();
  }
});