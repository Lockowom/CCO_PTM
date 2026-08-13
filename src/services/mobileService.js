import { CapacitorUpdater } from '@capgo/capacitor-updater';
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { supabase } from '../supabase';
import { toast } from 'sonner';

// ── Estado global del update para que el componente UI pueda reaccionar ──
let updateCallback = null;
export const onUpdateAvailable = (cb) => {
  updateCallback = cb;
};

// ── Canal OTA de ESTE dispositivo (Supabase + GitHub Releases) ─────────────
// Producción recibe solo bundles promovidos; los PDA de PRUEBA se asignan al
// canal 'beta' para validar una versión antes de soltarla a toda la bodega.
// Guardado por dispositivo (no es una preferencia de usuario/servidor).
export const CANALES_OTA = ['production', 'beta'];
const OTA_URL = 'https://vtrtyzbgpsvqwbfoudaf.supabase.co/functions/v1/ota-updates';
let otaDownloadInFlight = false;

export const getOTAChannel = async () => {
  if (!Capacitor.isNativePlatform()) return null;
  try {
    const r = await CapacitorUpdater.getChannel();
    return r?.channel || 'production';
  } catch (err) {
    console.error('OTA getChannel error:', err);
    return null;
  }
};

// Asigna este dispositivo a beta o vuelve al canal production.
export const setOTAChannel = async (channel) => {
  if (!Capacitor.isNativePlatform()) throw new Error('Solo disponible en la app Android.');
  if (!CANALES_OTA.includes(channel)) throw new Error(`Canal inválido: ${channel}`);
  if (channel === 'production') {
    // Volver al canal por defecto = quitar la asignación explícita.
    await CapacitorUpdater.unsetChannel({ triggerAutoUpdate: true });
    return 'production';
  }
  await CapacitorUpdater.setChannel({ channel, triggerAutoUpdate: true });
  return channel;
};

export const initOTAUpdates = async () => {
  try {
    await CapacitorUpdater.notifyAppReady();

    // Progreso de descarga en vivo (píldora fluida en la UI).
    CapacitorUpdater.addListener('download', (event) => {
      if (updateCallback) {
        updateCallback({
          phase: 'downloading',
          version: event?.bundle?.version || event?.version || 'nueva',
          percent: Math.max(0, Math.min(100, Math.round(event?.percent ?? 0)))
        });
      }
    });

    CapacitorUpdater.addListener('downloadComplete', async (event) => {
      const bundleInfo = event?.bundle;
      const bundleId = bundleInfo?.id;

      if (!bundleId) {
        console.error('OTA: No bundle ID in downloadComplete', event);
        return;
      }

      console.log('OTA: Bundle ready:', bundleId, 'v' + bundleInfo?.version);

      // Notificar al componente UI para mostrar overlay de actualización
      if (updateCallback) {
        updateCallback({
          phase: 'ready',
          version: bundleInfo?.version || 'nueva',
          bundleId
        });
      }

      // Auditar la versión que el dispositivo va a aplicar (inventario OTA).
      try {
        await supabase.rpc('registrar_ota_aplicado', {
          p_version: bundleInfo?.version || '?',
          p_detalle: 'auto-update'
        });
      } catch {
        /* no romper */
      }

      // Aplicar automáticamente después de 4 segundos
      // El overlay ya está visible, el usuario sabe qué pasa
      setTimeout(async () => {
        await applyUpdate(bundleId);
      }, 4000);
    });

    CapacitorUpdater.addListener('downloadFailed', (event) => {
      console.error('OTA download failed:', event?.version);
      if (updateCallback) updateCallback({ phase: 'error' }); // oculta la píldora
      toast.error('Error al descargar actualización', {
        description: 'Se reintentará automáticamente.',
        duration: 4000
      });
    });

    CapacitorUpdater.addListener('updateFailed', (event) => {
      console.error('OTA update failed, rolling back:', event);
      toast.error('Error al aplicar actualización', {
        description: 'Se restauró la versión anterior.',
        duration: 5000
      });
    });

    // Puente de migración: funciona también en APK antiguos cuyo updateUrl
    // nativo todavía apunta a Capgo.
    setTimeout(() => {
      descargarActualizacionPropia('auto').catch((err) => console.error('OTA check error:', err));
    }, 2500);
  } catch (err) {
    console.error('OTA init error:', err);
  }
};

// ── Aplicar update con múltiples fallbacks ──
const applyUpdate = async (bundleId) => {
  try {
    // Intento 1: set() — debería recargar la app inmediatamente
    await CapacitorUpdater.set({ id: bundleId });
  } catch (err) {
    console.error('OTA set() failed:', err);
    try {
      // Intento 2: reload() de Capacitor
      await CapacitorUpdater.reload();
    } catch (err2) {
      console.error('OTA reload() failed:', err2);
      // Intento 3: forzar reload del webview
      window.location.reload();
    }
  }
};

// ── Aplicar update manualmente (desde botón UI) ──
// Versión/canal OTA vigente en ESTE dispositivo (para mostrar en la app).
export const versionOTA = async () => {
  if (!Capacitor.isNativePlatform()) return null;
  try {
    const cur = await CapacitorUpdater.current();
    let channel = null;
    try {
      const c = await CapacitorUpdater.getChannel();
      channel = c?.channel;
    } catch {
      /* sin canal */
    }
    return { bundle: cur?.bundle?.version || null, native: cur?.native || null, channel };
  } catch {
    return null;
  }
};

const consultarActualizacionPropia = async () => {
  const [current, device] = await Promise.all([
    CapacitorUpdater.current(),
    CapacitorUpdater.getDeviceId()
  ]);
  let channel = 'production';
  try {
    const result = await CapacitorUpdater.getChannel();
    if (CANALES_OTA.includes(result?.channel)) channel = result.channel;
  } catch {
    /* APK antiguo o canal no disponible: producción segura */
  }

  const response = await fetch(OTA_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      app_id: 'com.cco.wms',
      device_id: device?.deviceId,
      platform: Capacitor.getPlatform(),
      version_name: current?.bundle?.version || current?.native || 'builtin',
      version_build: current?.native || null,
      plugin_version: '8.50.2',
      defaultChannel: channel
    })
  });
  if (!response.ok) throw new Error(`Servidor OTA ${response.status}`);
  return response.json();
};

const descargarActualizacionPropia = async (origen = 'manual') => {
  if (otaDownloadInFlight) return { estado: 'descargando' };
  const latest = await consultarActualizacionPropia();
  if (latest?.error) return { estado: 'error', detalle: latest.message || latest.error };
  if (!latest?.url) return { estado: 'al-dia', version: latest?.version };
  otaDownloadInFlight = true;
  try {
    const bundle = await CapacitorUpdater.download({
      version: latest.version,
      url: latest.url,
      checksum: latest.checksum
    });
    try {
      await supabase.rpc('registrar_ota_aplicado', {
        p_version: latest.version,
        p_detalle: `${origen}:github-supabase`
      });
    } catch {
      /* no impedir actualización por auditoría */
    }
    return { estado: 'descargando', version: latest.version, bundleId: bundle?.id };
  } finally {
    otaDownloadInFlight = false;
  }
};

// Busca e instala una actualización OTA a demanda (botón "Buscar actualización").
export const buscarActualizacion = async () => {
  if (!Capacitor.isNativePlatform()) return { estado: 'no-nativo' };
  try {
    return await descargarActualizacionPropia('manual');
  } catch (e) {
    return { estado: 'error', detalle: String(e?.message || e) };
  }
};

export const applyPendingUpdate = async (bundleId) => {
  await applyUpdate(bundleId);
};

// ── Push Notifications ──
export const initPushNotifications = async (userId) => {
  if (!userId) return;

  try {
    let permStatus = await PushNotifications.checkPermissions();

    if (permStatus.receive === 'prompt') {
      permStatus = await PushNotifications.requestPermissions();
    }

    if (permStatus.receive !== 'granted') return;

    // Evita acumular listeners: initPushNotifications se invoca en cada
    // restauración de sesión / SIGNED_IN. Sin esto, cada login añade 4
    // listeners nuevos → toasts duplicados y fuga de memoria.
    try {
      await PushNotifications.removeAllListeners();
    } catch (_) {
      /* noop */
    }

    // Canales Android (requerido Android 8+)
    try {
      await PushNotifications.createChannel({
        id: 'cco_tickets',
        name: 'Tickets Soporte TI',
        description: 'Notificaciones de tickets y soporte técnico',
        importance: 5,
        visibility: 1,
        sound: 'default',
        vibration: true,
        lights: true
      });

      await PushNotifications.createChannel({
        id: 'cco_general',
        name: 'CCO General',
        description: 'Notificaciones generales del sistema',
        importance: 4,
        visibility: 1,
        sound: 'default',
        vibration: true
      });
    } catch (channelErr) {
      console.warn('Channel creation skipped:', channelErr);
    }

    await PushNotifications.register();

    PushNotifications.addListener('registration', async (token) => {
      console.log('FCM Token:', token.value?.slice(0, 20) + '...');
      try {
        await supabase.from('tms_usuarios').update({ push_token: token.value }).eq('id', userId);
      } catch (_) {
        console.error('Push token save error:', _);
      }
    });

    PushNotifications.addListener('registrationError', (err) => {
      console.error('Push registration error:', err);
    });

    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      toast.info(notification.title || 'Notificación', {
        description: notification.body,
        duration: 8000
      });
    });

    PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
      const data = action.notification?.data;
      if (data?.route) {
        window.location.href = data.route;
        return;
      }
      if (data?.type === 'NEW_TICKET' || data?.type === 'TICKET_UPDATE') {
        window.location.href = '/admin/tickets';
        return;
      }
      if (data?.type === 'NV_REOPEN_REQUEST') {
        window.location.href = '/admin/eventos';
      }
    });
  } catch (_) {
    console.error('Push notifications init error:', _);
  }
};
