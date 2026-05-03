import { CapacitorUpdater } from '@capgo/capacitor-updater';
import { PushNotifications } from '@capacitor/push-notifications';
import { supabase } from '../supabase';
import { toast } from 'sonner';

/**
 * Inicializa Capgo para actualizaciones OTA (Over-The-Air).
 * Permite actualizar la web app dentro de Capacitor sin necesidad de nueva APK.
 */
export const initOTAUpdates = async () => {
  try {
    // Le dice a Capgo que la app arrancó bien. Si fallara, Capgo haría un rollback automático.
    await CapacitorUpdater.notifyAppReady();
    console.log('✅ Capgo OTA Updater inicializado.');
  } catch (error) {
    console.error('Error inicializando OTA Updates:', error);
  }
};

/**
 * Solicita permisos e inicializa Push Notifications.
 * Guarda el token del dispositivo en la tabla de usuarios.
 * @param {string} userId - El ID del usuario en Supabase
 */
export const initPushNotifications = async (userId) => {
  if (!userId) return;

  try {
    // 1. Pedir permisos
    let permStatus = await PushNotifications.checkPermissions();
    
    if (permStatus.receive === 'prompt') {
      permStatus = await PushNotifications.requestPermissions();
    }

    if (permStatus.receive !== 'granted') {
      console.warn('Permisos de notificaciones push denegados.');
      return;
    }

    // 2. Registrar con el servicio (FCM/APNs)
    await PushNotifications.register();

    // 3. Escuchar cuando obtenemos el token
    PushNotifications.addListener('registration', async (token) => {
      console.log('📱 Push registration success, token: ' + token.value);
      
      // 4. Guardar token en Supabase para enviar mensajes dirigidos
      try {
        const { error } = await supabase
          .from('tms_usuarios')
          .update({ push_token: token.value })
          .eq('id', userId);

        if (error) throw error;
        console.log('✅ Push Token guardado en la base de datos.');
      } catch (dbErr) {
        console.error('Error guardando push_token:', dbErr);
      }
    });

    // 5. Manejar errores de registro
    PushNotifications.addListener('registrationError', (error) => {
      console.error('Error on push registration: ', error);
    });

    // 6. Escuchar notificaciones recibidas con la app en primer plano
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('Notificación recibida en foreground:', notification);
      toast.info(notification.title, {
        description: notification.body,
        duration: 5000,
        style: {
          background: '#1e293b',
          border: '1px solid #10b981',
          color: '#f8fafc',
        }
      });
    });

    // 7. Acción al tocar la notificación
    PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
      console.log('Acción sobre notificación:', notification);
      // Aquí se podría hacer un enrutamiento (ej: llevar al módulo de Picking)
    });

  } catch (error) {
    console.error('Error configurando Push Notifications:', error);
  }
};