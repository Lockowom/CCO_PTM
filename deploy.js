import { execFileSync } from 'child_process';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('Iniciando proceso de despliegue CCO PTM...\n');

rl.question('Escribe el mensaje para el commit: ', (commitMsg) => {
  if (!commitMsg.trim()) {
    console.error('Error: El mensaje del commit no puede estar vacío.');
    rl.close();
    process.exit(1);
  }

  try {
    console.log('\nAñadiendo archivos al stage...');
    execFileSync('git', ['add', '.'], { stdio: 'inherit' });

    console.log(`\nCreando commit: "${commitMsg}"...`);
    execFileSync('git', ['commit', '-m', commitMsg], { stdio: 'inherit' });

    console.log('\nSubiendo cambios a GitHub...');
    execFileSync('git', ['push', 'origin', 'main'], { stdio: 'inherit' });

    console.log('\nLos cambios han sido subidos exitosamente.');
  } catch (error) {
    console.error('\nOcurrió un error durante el proceso de Git.');
    console.error('Asegúrate de no tener conflictos o archivos bloqueados.');
  } finally {
    rl.close();
  }
});
