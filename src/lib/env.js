/**
 * Validación de variables de entorno al arrancar la aplicación.
 */
export const validateEnv = () => {
  const missing = [];

  if (!import.meta.env.VITE_SUPABASE_URL) {
    missing.push('VITE_SUPABASE_URL');
  }
  
  if (!import.meta.env.VITE_SUPABASE_ANON_KEY && !import.meta.env.VITE_SUPABASE_KEY) {
    missing.push('VITE_SUPABASE_ANON_KEY');
  }

  if (missing.length > 0) {
    throw new Error(`Faltan variables de entorno requeridas: ${missing.join(', ')}. Configura un archivo .env con VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.`);
  }

};
