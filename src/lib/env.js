/**
 * Validación estricta de variables de entorno al arrancar la aplicación.
 * Evita pantallas blancas silenciosas y provee mensajes de error claros.
 */
export const validateEnv = () => {
  const required = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY'
  ];

  const missing = [];

  required.forEach(key => {
    if (!import.meta.env[key]) {
      missing.push(key);
    }
  });

  if (missing.length > 0) {
    const errorMsg = `🚨 CRITICAL ERROR: Faltan variables de entorno requeridas: ${missing.join(', ')}. 
Asegúrate de crear un archivo .env en la raíz del proyecto.`;
    
    console.error(errorMsg);
    
    // Lanzar el error detendrá la ejecución y será atrapado por el ErrorBoundary si ya montó,
    // o detendrá el renderizado inicial y mostrará el error en consola.
    throw new Error(errorMsg);
  }

  console.log('✅ Variables de entorno validadas correctamente.');
};
