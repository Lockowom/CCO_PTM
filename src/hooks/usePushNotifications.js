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

      if (permStatus.receive !== 'granted') {
        console.warn('Permisos de notificaciones push no otorgados');
        return;
      }

      // Register with Apple / Google to receive push via APNS/FCM
      await PushNotifications.register();

      // On success, we should be able to receive notifications
      PushNotifications.addListener('registration', async (token) => {
        console.log('Push registration success, token: ' + token.value);
        
        // Save token to Supabase table
        const { error } = await supabase
          .from('tms_usuarios')
          .update({ push_token: token.value })
          .eq('id', userId);
          
        if (error) {
          console.error('Error saving push token to Supabase:', error);
        }
      });

      // Some issue with our setup and push will not work
      PushNotifications.addListener('registrationError', (error) => {
        console.error('Error on push registration: ', error);
      });

      // Show us the notification payload if the app is open on our device
      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('Push received: ', notification);
        toast.info(notification.title || 'Nueva Notificación', {
          description: notification.body,
          duration: 5000,
        });
      });

      // Method called when tapping on a notification
      PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
        console.log('Push action performed: ', notification);
        // Here you can navigate to specific screens based on notification.data
      });

    } catch (error) {
      console.error('Error initializing push notifications:', error);
    }
  };
};
