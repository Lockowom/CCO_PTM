import { CapacitorUpdater } from '@capgo/capacitor-updater';
import { PushNotifications } from '@capacitor/push-notifications';
import { supabase } from '../supabase';
import { toast } from 'sonner';

export const initOTAUpdates = async () => {
  try {
    await CapacitorUpdater.notifyAppReady();

    CapacitorUpdater.addListener('downloadComplete', async (event) => {
      const bundleInfo = event?.bundle;
      const bundleId = bundleInfo?.id;

      if (!bundleId) {
        console.error('OTA: No bundle ID received in downloadComplete event', event);
        return;
      }

      console.log('OTA: Bundle downloaded:', bundleId, 'version:', bundleInfo?.version);

      toast.info('Actualización descargada', {
        description: `v${bundleInfo?.version || '?'} — Reiniciando en 3s...`,
        duration: 3000,
      });

      setTimeout(async () => {
        try {
          // set() espera { id: string } y recarga la app inmediatamente
          await CapacitorUpdater.set({ id: bundleId });
          // set() destruye el contexto JS, este código no debería ejecutarse
        } catch (err) {
          console.error('OTA set bundle error:', err);
          // Fallback: intentar reload manual
          try {
            await CapacitorUpdater.reload();
          } catch (reloadErr) {
            console.error('OTA reload fallback error:', reloadErr);
            toast.error('No se pudo aplicar la actualización', {
              description: 'Cierra y abre la app manualmente.',
              duration: 8000,
            });
          }
        }
      }, 3000);
    });

    CapacitorUpdater.addListener('downloadFailed', (event) => {
      console.error('OTA download failed:', event?.version);
      toast.error('Error al descargar actualización', {
        description: 'Se reintentará automáticamente.',
        duration: 4000,
      });
    });

    CapacitorUpdater.addListener('updateFailed', (event) => {
      console.error('OTA update failed:', event);
      toast.error('Error al aplicar actualización', {
        description: 'Se restauró la versión anterior.',
        duration: 5000,
      });
    });

  } catch (_) { console.error('OTA init error:', _); }
};

export const initPushNotifications = async (userId) => {
  if (!userId) return;

  try {
    let permStatus = await PushNotifications.checkPermissions();

    if (permStatus.receive === 'prompt') {
      permStatus = await PushNotifications.requestPermissions();
    }

    if (permStatus.receive !== 'granted') return;

    // Crear canal de notificaciones para Android (requerido Android 8+)
    try {
      await PushNotifications.createChannel({
        id: 'cco_tickets',
        name: 'Tickets Soporte TI',
        description: 'Notificaciones de tickets y soporte técnico',
        importance: 5, // MAX — muestra en pantalla y suena
        visibility: 1, // PUBLIC
        sound: 'default',
        vibration: true,
        lights: true,
      });

      await PushNotifications.createChannel({
        id: 'cco_general',
        name: 'CCO General',
        description: 'Notificaciones generales del sistema',
        importance: 4, // HIGH
        visibility: 1,
        sound: 'default',
        vibration: true,
      });
    } catch (channelErr) {
      console.warn('Channel creation skipped:', channelErr);
    }

    await PushNotifications.register();

    PushNotifications.addListener('registration', async (token) => {
      console.log('FCM Token registered:', token.value?.slice(0, 20) + '...');
      try {
        await supabase
          .from('tms_usuarios')
          .update({ push_token: token.value })
          .eq('id', userId);
      } catch (_) { console.error('Push registration error:', _); }
    });

    PushNotifications.addListener('registrationError', (err) => {
      console.error('Push registration error:', err);
    });

    // Notificación recibida mientras app está EN PRIMER PLANO
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('Push received (foreground):', notification);
      toast.info(notification.title || 'Notificación', {
        description: notification.body,
        duration: 8000,
      });
    });

    // Usuario tocó la notificación (app estaba en BACKGROUND)
    PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
      console.log('Push action performed:', action);
      const data = action.notification?.data;
      if (data?.type === 'NEW_TICKET' || data?.type === 'TICKET_UPDATE') {
        window.location.href = '/admin/tickets';
      }
    });

  } catch (_) { console.error('Push notifications init error:', _); }
};
