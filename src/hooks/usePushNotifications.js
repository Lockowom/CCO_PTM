import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { supabase } from '../supabase';
import { toast } from 'sonner';

export const usePushNotifications = (userId) => {
  useEffect(() => {
    if (Capacitor.isNativePlatform() && userId) {
      registerPush(userId);
    }
  }, [userId]);

  const registerPush = async (userId) => {
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
        toast.info(notification.title || 'Nueva Notificación', {
          description: notification.body,
          duration: 5000,
        });
      });

      PushNotifications.addListener('pushNotificationActionPerformed', () => {});
    } catch (_) {}
  };
};
