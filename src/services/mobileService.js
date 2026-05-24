import { CapacitorUpdater } from '@capgo/capacitor-updater';
import { PushNotifications } from '@capacitor/push-notifications';
import { supabase } from '../supabase';
import { toast } from 'sonner';

export const initOTAUpdates = async () => {
  try {
    await CapacitorUpdater.notifyAppReady();

    CapacitorUpdater.addListener('downloadComplete', async (bundle) => {
      toast.info('Actualización descargada', {
        description: 'La aplicación se reiniciará en 3 segundos...',
        duration: 3000,
      });
      setTimeout(async () => {
        try {
          await CapacitorUpdater.set(bundle);
        } catch (_) { console.error('OTA set bundle error:', _); }
      }, 3000);
    });

    CapacitorUpdater.addListener('downloadFailed', () => {
      toast.error('Error al descargar actualización', {
        description: 'Se reintentará automáticamente.',
        duration: 4000,
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

    await PushNotifications.register();

    PushNotifications.addListener('registration', async (token) => {
      try {
        await supabase
          .from('tms_usuarios')
          .update({ push_token: token.value })
          .eq('id', userId);
      } catch (_) { console.error('Push registration error:', _); }
    });

    PushNotifications.addListener('registrationError', () => {});

    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      toast.info(notification.title, {
        description: notification.body,
        duration: 5000,
      });
    });

    PushNotifications.addListener('pushNotificationActionPerformed', () => {});
  } catch (_) { console.error('Push notifications init error:', _); }
};
