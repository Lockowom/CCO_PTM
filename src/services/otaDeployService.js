import { supabase } from '../supabase';

// Cliente del despliegue OTA (Edge Function `capgo-deploy`). La API key de Capgo
// NO está aquí — vive solo en la función; estas llamadas van con el JWT de la
// sesión (Supabase lo adjunta) y la función verifica el permiso `deploy_ota`.

// Lista los bundles subidos a Capgo + qué versión sirve cada canal (beta/prod).
export async function listarDespliegueOTA() {
  const { data, error } = await supabase.functions.invoke('capgo-deploy', {
    body: { action: 'list' },
  });
  if (error) throw new Error(error.message || 'No se pudo consultar Capgo');
  if (!data?.ok) throw new Error(data?.error || 'No se pudo consultar Capgo');
  return data; // { bundles:[{version,created_at}], channels:[{name,version}] }
}

// Promueve (enlaza) una versión ya existente al canal indicado (por defecto
// production = toda la bodega). No recompila; solo apunta el canal al bundle.
export async function promoverOTA(version, channel = 'production') {
  const { data, error } = await supabase.functions.invoke('capgo-deploy', {
    body: { action: 'promote', version, channel },
  });
  if (error) throw new Error(error.message || 'No se pudo promover');
  if (!data?.ok) throw new Error(data?.error || 'No se pudo promover');
  return data; // { version, channel }
}
