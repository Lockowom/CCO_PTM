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
    console.warn(`⚠️ ADVERTENCIA: Faltan variables de entorno: ${missing.join(', ')}. El sistema usará las credenciales por defecto de supabase.js.`);
    return; // Ya no lanzamos error ni mostramos pantalla roja para no romper producción
  }

  console.log('✅ Variables de entorno validadas correctamente.');
};
