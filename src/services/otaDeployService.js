import { supabase } from '../supabase';

// Cliente OTA propio: Supabase administra canales/auditoría y GitHub Releases
// aloja bundles inmutables. No contiene claves privadas ni depende de Capgo.

// Lista bundles y la versión servida por cada canal.
export async function listarDespliegueOTA() {
  const { data, error } = await supabase.functions.invoke('ota-deploy', {
    body: { action: 'list' }
  });
  if (error) throw new Error(error.message || 'No se pudo consultar OTA');
  if (!data?.ok) throw new Error(data?.error || 'No se pudo consultar OTA');
  return data; // { bundles:[{version,created_at}], channels:[{name,version}] }
}

// Promueve (enlaza) una versión ya existente al canal indicado (por defecto
// production = toda la bodega). No recompila; solo apunta el canal al bundle.
export async function promoverOTA(version, channel = 'production', options = {}) {
  const { data, error } = await supabase.functions.invoke('ota-deploy', {
    body: {
      action: 'promote',
      version,
      channel,
      rollback: options.rollback === true,
      reason: options.reason || ''
    }
  });
  if (error) throw new Error(error.message || 'No se pudo promover');
  if (!data?.ok) throw new Error(data?.error || 'No se pudo promover');
  return data; // { version, channel }
}

export async function asignarCanalDispositivoOTA(deviceId, channel, deviceAlias = '') {
  const { data, error } = await supabase.functions.invoke('ota-deploy', {
    body: {
      action: 'set-device-channel',
      device_id: deviceId,
      channel,
      device_alias: deviceAlias
    }
  });
  if (error) throw new Error(error.message || 'No se pudo asignar el dispositivo');
  if (!data?.ok) throw new Error(data?.error || 'No se pudo asignar el dispositivo');
  return data.device;
}

export async function revisarBetaOTA(version, decision, notes) {
  const { data, error } = await supabase.functions.invoke('ota-deploy', {
    body: { action: 'review-beta', version, decision, notes }
  });
  if (error) throw new Error(error.message || 'No se pudo registrar la revisión beta');
  if (!data?.ok) throw new Error(data?.error || 'No se pudo registrar la revisión beta');
  return data;
}

// Archiva un bundle viejo. No toca canales activos ni borra evidencia histórica.
export async function eliminarBundleOTA(version) {
  const { data, error } = await supabase.functions.invoke('ota-deploy', {
    body: { action: 'delete', version }
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
  const data = await listarDespliegueOTA();
  return data.devices || [];
}

// ── Historial de despliegues (promociones / aplicados / eliminados) ──────────
export async function historialOTA() {
  const { data } = await supabase.rpc('ota_historial');
  return data || [];
}

// ── Aviso por push FCM de una nueva versión ──────────────────────────────────
export async function avisarNuevaVersionPush(version, rol = 'ADMIN') {
  const { error } = await supabase.functions.invoke('notify-inventario', {
    body: {
      titulo: '🚀 Nueva versión disponible',
      mensaje: `Versión ${version} publicada. Abre la app para actualizar.`,
      rol,
      payload: { tipo: 'ota', version }
    }
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
    try {
      await eliminarBundleOTA(b.version);
      borrados++;
    } catch {
      /* sigue */
    }
  }
  return { ok: true, borrados, total: aBorrar.length };
}
