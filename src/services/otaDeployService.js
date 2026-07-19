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

// Elimina un bundle viejo de Capgo (limpieza). No toca canales activos.
export async function eliminarBundleOTA(version) {
  const { data, error } = await supabase.functions.invoke('capgo-deploy', {
    body: { action: 'delete', version },
  });
  if (error) throw new Error(error.message || 'No se pudo eliminar');
  if (!data?.ok) throw new Error(data?.error || 'No se pudo eliminar');
  return data;
}

// ── Gobernanza de versión (versión mínima / obligatoria) ────────────────────
export async function obtenerGobernanzaOTA() {
  const { data } = await supabase.from('tms_ota_gobernanza').select('*').eq('id', 1).maybeSingle();
  return data;
}
export async function guardarGobernanzaOTA(p) {
  const { data, error } = await supabase.rpc('ota_gobernanza_set', { p });
  if (error) return { ok: false, error: error.message };
  return data || { ok: true };
}

// ── Inventario: qué versión aplicó cada dispositivo (desde nuestro log) ──────
export async function resumenDispositivosOTA() {
  const { data } = await supabase.rpc('ota_dispositivos_resumen');
  return data || [];
}

// ── Historial de despliegues (promociones / aplicados / eliminados) ──────────
export async function historialOTA() {
  const { data } = await supabase.rpc('ota_historial');
  return data || [];
}

// ── Aviso por push (Capgo/FCM) de una nueva versión ──────────────────────────
export async function avisarNuevaVersionPush(version, rol = 'ADMIN') {
  const { error } = await supabase.functions.invoke('notify-inventario', {
    body: { titulo: '🚀 Nueva versión disponible', mensaje: `Versión ${version} publicada. Abre la app para actualizar.`, rol, payload: { tipo: 'ota', version } },
  });
  if (error) throw new Error(error.message);
  return { ok: true };
}

// ── Limpieza: elimina bundles viejos dejando los últimos N (respeta canales) ─
export async function limpiarBundlesViejos(bundles, canalVersiones, keep = 10) {
  const protegidos = new Set(canalVersiones.filter(Boolean));
  const aBorrar = bundles.slice(keep).filter((b) => !protegidos.has(b.version));
  let borrados = 0;
  for (const b of aBorrar) {
    try { await eliminarBundleOTA(b.version); borrados++; } catch { /* sigue */ }
  }
  return { ok: true, borrados, total: aBorrar.length };
}
