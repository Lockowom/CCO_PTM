import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { supabase } from '../lib/supabase';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

// Configuración de notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expoPushToken, setExpoPushToken] = useState('');
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    // Verificar sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user.id, session.user.email);
        registerForPushNotificationsAsync().then(token => {
          setExpoPushToken(token);
          if (token) updateUserPushToken(session.user.email, token);
        });
      } else {
        setLoading(false);
      }
    });

    // Escuchar cambios de sesión
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user.id, session.user.email);
        registerForPushNotificationsAsync().then(token => {
          setExpoPushToken(token);
          if (token) updateUserPushToken(session.user.email, token);
        });
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    // Listeners de notificaciones
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notificación recibida:', notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notificación tocada:', response);
    });

    return () => {
      subscription.unsubscribe();
      if (notificationListener.current) Notifications.removeNotificationSubscription(notificationListener.current);
      if (responseListener.current) Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  const updateUserPushToken = async (email, token) => {
    try {
      const { error } = await supabase
        .from('tms_usuarios')
        .update({ push_token: token })
        .eq('email', email);
      
      if (error) console.error('Error guardando push token:', error);
    } catch (e) {
      console.error('Excepción guardando token:', e);
    }
  };

  const fetchProfile = async (userId, email) => {
    try {
      // Intentar buscar perfil de conductor
      const { data: driverData, error } = await supabase
        .from('tms_conductores')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (driverData) {
        setUser({ ...driverData, email, role: 'CONDUCTOR', id: userId });
      } else {
        // Usuario genérico
        const { data: userData } = await supabase
          .from('tms_usuarios')
          .select('*')
          .eq('email', email)
          .maybeSingle();
          
        setUser({ ...(userData || {}), id: userId, email, role: userData?.rol || 'USER' });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    // Usar el sistema de usuarios custom (tms_usuarios)
    const { data: users, error } = await supabase
        .from('tms_usuarios')
        .select('*')
        .eq('email', email)
        .eq('password_hash', password) 
        .single();

    if (error || !users) {
        throw new Error('Credenciales inválidas');
    }

    // Login "manual" para este sistema híbrido
    setUser({ ...users, role: users.rol });
    
    // Intentar registrar token al login
    const token = await registerForPushNotificationsAsync();
    if (token) await updateUserPushToken(email, token);

    return users;
  };

  const signOut = async () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signOut, expoPushToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

// Función auxiliar para obtener el token
async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return;
    }
    
    // Obtener token
    try {
      const projectId = Constants?.expoConfig?.extra?.eas?.projectId || Constants?.easConfig?.projectId;
      token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      console.log('Expo Push Token:', token);
    } catch (e) {
      console.error('Error getting token:', e);
    }
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  return token;
}
