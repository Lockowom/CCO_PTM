import { CapacitorUpdater } from '@capgo/capacitor-updater';
import { PushNotifications } from '@capacitor/push-notifications';
import { supabase } from '../supabase';
import { toast } from 'sonner';

export const initOTAUpdates = async () => {
  try {
    await CapacitorUpdater.notifyAppReady();

    CapacitorUpdater.addListener('updateAvailable', async (info) => {
      toast.info('Nueva actualización disponible', {
        description: 'La aplicación se reiniciará para aplicar los cambios.',
        duration: 5000,
      });
      setTimeout(async () => {
        await CapacitorUpdater.set(info.version);
      }, 3000);
    });
  } catch (_) {}
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
      } catch (_) {}
    });

    PushNotifications.addListener('registrationError', () => {});

    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      toast.info(notification.title, {
        description: notification.body,
        duration: 5000,
      });
    });

    PushNotifications.addListener('pushNotificationActionPerformed', () => {});
  } catch (_) {}
};
