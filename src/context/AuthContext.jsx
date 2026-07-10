import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../supabase';
import { wmsToast } from '../lib/notifications';
import { syncOfflineData } from '../lib/syncManager';
import { Capacitor } from '@capacitor/core';
import { initPushNotifications } from '../services/mobileService';
import { setUserForTracking, logError } from '../lib/sentry';
import { withTimeout } from '../lib/supabaseQuery';
import { toast } from 'sonner';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [landingPage, setLandingPage] = useState('/dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const initDoneRef = useRef(false);
  // Email del perfil ya cargado, para deduplicar la carga: login() llama a
  // setUserState y además dispara SIGNED_IN, que volvería a cargar el mismo
  // perfil (doble carga de rol + doble init push). Con esto SIGNED_IN se salta
  // si el usuario ya está cargado.
  const loadedEmailRef = useRef(null);

  // ── Cargar configuración de rol ──
  const loadRoleConfig = useCallback(async (rolId) => {
    if (!rolId) {
      setPermissions([]);
      setLandingPage('/dashboard');
      return { permissions: [], landingPage: '/dashboard' };
    }

    try {
      const { data, error } = await supabase
        .from('tms_roles')
        .select('permisos_json, landing_page')
        .eq('id', rolId)
        .single();

      if (error) throw error;

      const perms = data?.permisos_json || [];
      const landing = data?.landing_page || '/dashboard';

      setPermissions(perms);
      setLandingPage(landing);

      return { permissions: perms, landingPage: landing };

    } catch (err) {
      setPermissions([]);
      setLandingPage('/dashboard');
      return { permissions: [], landingPage: '/dashboard' };
    }
  }, []);

  const refreshPermissions = useCallback(async () => {
    if (user?.rol) {
      return await loadRoleConfig(user.rol);
    }
    return null;
  }, [user?.rol, loadRoleConfig]);

  // ── Suscripción global a cambios de roles ──
  useEffect(() => {
    if (!user?.rol) return;

    const channel = supabase
      .channel('roles_changes_global')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tms_roles' },
        async (payload) => {
          const changedRoleId = payload.new?.id || payload.old?.id;

          if (changedRoleId === user.rol || !changedRoleId) {
            await loadRoleConfig(user.rol);
          }
        }
      )
      .subscribe((status, err) => {
        if (err) console.error('Realtime subscription error:', err);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.rol, loadRoleConfig]);

  // ── Cargar perfil desde tms_usuarios usando email de sesión auth ──
  const loadUserProfile = useCallback(async (authEmail) => {
    try {
      const { data, error } = await supabase
        .from('tms_usuarios')
        .select('id, nombre, email, rol, activo, es_admin_delegado, auth_uid')
        .eq('email', authEmail)
        .eq('activo', true)
        .single();

      if (error || !data) {
        // Intentar con email en minúsculas (por si hay case mismatch)
        const { data: dataLower, error: errLower } = await supabase
          .from('tms_usuarios')
          .select('id, nombre, email, rol, activo, es_admin_delegado, auth_uid')
          .ilike('email', authEmail)
          .eq('activo', true)
          .single();

        if (errLower || !dataLower) return null;
        return dataLower;
      }

      return data;
    } catch (err) {
      console.error('[Auth] Error loading user profile:', err);
      return null;
    }
  }, []);

  // ── Establecer usuario en el estado ──
  const setUserState = useCallback(async (profile) => {
    if (!profile) return;

    const userData = {
      id: profile.id,
      nombre: profile.nombre,
      email: profile.email,
      rol: profile.rol,
      activo: profile.activo,
      es_admin_delegado: profile.es_admin_delegado || false,
    };

    loadedEmailRef.current = (userData.email || '').toLowerCase();
    setUser(userData);
    setUserForTracking(userData);
    await loadRoleConfig(userData.rol);

    if (Capacitor.isNativePlatform()) {
      initPushNotifications(userData.id);
    }
  }, [loadRoleConfig]);

  // ── Restaurar sesión al iniciar (Supabase Auth) ──
  useEffect(() => {
    const initSession = async () => {
      try {
        // Timeout (10s): si getSession() o la carga de perfil se cuelga (auth-lock
        // en WebView, red caída), el `await` nunca resolvería y la pantalla global
        // "Cargando…" quedaría infinita. Con el timeout el `finally` siempre corre.
        const { data: { session } } = await withTimeout(
          supabase.auth.getSession(),
          { ms: 10000, label: 'inicio de sesión' }
        );

        if (session?.user?.email) {
          const profile = await withTimeout(
            loadUserProfile(session.user.email),
            { ms: 10000, label: 'inicio de sesión' }
          );
          if (profile) {
            await setUserState(profile);
          } else {
            // Usuario existe en auth pero no en tms_usuarios (o desactivado)
            await supabase.auth.signOut();
          }
        } else {
          // Sin sesión auth — verificar si hay sesión legacy en localStorage
          const stored = localStorage.getItem('currentUser');
          if (stored) {
            try {
              const parsed = JSON.parse(stored);
              // Intentar login automático con Supabase Auth no es posible sin contraseña
              // Forzar re-login
              console.warn('[Auth] Sesión legacy encontrada, requiere re-login con Supabase Auth');
              localStorage.removeItem('currentUser');
            } catch (_) {
              localStorage.removeItem('currentUser');
            }
          }
        }
      } catch (err) {
        console.error('[Auth] Init session error:', err);
        logError(err, { context: 'auth_init_session' });
        // Caer a la pantalla de login en vez de quedar colgado en "Cargando…".
        toast.error('No se pudo restaurar la sesión a tiempo. Inicia sesión de nuevo.');
      } finally {
        initDoneRef.current = true;
        setLoading(false);
      }
    };

    initSession();
  }, [loadUserProfile, setUserState]);

  // ── Listener de cambios de sesión auth ──
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // Solo procesar después de la inicialización
        if (!initDoneRef.current) return;

        if (event === 'SIGNED_OUT') {
          loadedEmailRef.current = null;
          setUser(null);
          setPermissions([]);
          setLandingPage('/dashboard');
        } else if (event === 'SIGNED_IN' && session?.user?.email) {
          // Deduplicar: si login() ya cargó este perfil, no re-cargar.
          if (loadedEmailRef.current === session.user.email.toLowerCase()) return;
          // IMPORTANTE: NO hacer llamadas a supabase (`from`/`rpc`) directamente
          // dentro del callback de onAuthStateChange. supabase-js mantiene un
          // "auth lock" mientras corre el callback; cualquier consulta que a su
          // vez necesite ese lock se DEADLOCKEA y nunca resuelve → el timeout de
          // 10s disparaba "No se pudo cargar tu perfil" para TODOS los usuarios.
          // La solución oficial es diferir el trabajo fuera del callback.
          setTimeout(async () => {
            try {
              const profile = await withTimeout(
                loadUserProfile(session.user.email),
                { ms: 10000, label: 'inicio de sesión' }
              );
              if (profile) {
                await setUserState(profile);
              } else {
                // Perfil inexistente o desactivado: destruir también el token de
                // auth (igual que initSession); si queda en localStorage, un
                // usuario desactivado conserva un JWT utilizable contra la API.
                await supabase.auth.signOut();
              }
            } catch (err) {
              console.error('[Auth] SIGNED_IN profile load error:', err);
              logError(err, { context: 'auth_signed_in' });
              toast.error('No se pudo cargar tu perfil. Reintenta el ingreso.');
            }
          }, 0);
        } else if (event === 'TOKEN_REFRESHED') {
          // Token renovado automáticamente — no hacer nada
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [loadUserProfile, setUserState]);

  // ── Online/Offline + Heartbeat ──
  useEffect(() => {
    if (!user?.id) return;

    const handleOffline = () => {
      wmsToast.systemOffline();
    };

    const handleOnline = async () => {
      wmsToast.systemOnline();
      await syncOfflineData();
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    const updateHeartbeat = async () => {
      if (!navigator.onLine) return;

      try {
        await supabase
          .from('tms_usuarios_activos')
          .upsert({
            usuario_id: user.id,
            nombre: user.nombre,
            rol: user.rol,
            ultima_actividad: new Date().toISOString(),
            // Leer la URL real en el momento del latido: pathnameRef solo se
            // actualizaba con popstate y React Router navega con pushState,
            // así que el módulo reportado quedaba congelado en el de entrada.
            modulo_actual: window.location.pathname,
            estado: 'ONLINE'
          }, { onConflict: 'usuario_id' });
      } catch (_) { console.error('Heartbeat update failed:', _); }
    };

    updateHeartbeat();
    const interval = setInterval(updateHeartbeat, 30000);

    return () => {
      clearInterval(interval);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, [user?.id]);

  // ── LOGIN (Supabase Auth con fallback legacy) ──
  const login = async (email, password) => {
    setLoading(true);
    setError('');

    try {
      // 1. Intentar login con Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase(),
        password,
      });

      if (!authError && authData?.session) {
        // Login exitoso con Supabase Auth
        const profile = await loadUserProfile(email);

        if (!profile) {
          setError('Usuario no encontrado o desactivado');
          await supabase.auth.signOut();
          setLoading(false);
          return false;
        }

        if (!profile.activo) {
          setError('Usuario desactivado');
          await supabase.auth.signOut();
          setLoading(false);
          return false;
        }

        // Asegurar que auth_uid está vinculado
        if (!profile.auth_uid) {
          await supabase.from('tms_usuarios')
            .update({ auth_uid: authData.session.user.id })
            .eq('id', profile.id);
        }

        await setUserState(profile);

        // Registrar acceso
        try {
          await supabase.from('tms_accesos').insert({
            usuario_id: profile.id,
            nombre: profile.nombre,
            email: profile.email,
            rol: profile.rol
          });

          await supabase
            .from('tms_usuarios_activos')
            .upsert({
              usuario_id: profile.id,
              nombre: profile.nombre,
              rol: profile.rol,
              ultima_actividad: new Date().toISOString(),
              modulo_actual: 'Inicio de Sesión',
              estado: 'ONLINE'
            }, { onConflict: 'usuario_id' });
        } catch (_) { console.error('Login tracking failed:', _); }

        setLoading(false);
        return true;
      }

      // Sin sesión de Supabase Auth → credenciales inválidas.
      // (El fallback legacy `verify_user_password` se eliminó: todos los usuarios
      //  están migrados a Supabase Auth.)
      setError('Usuario o contraseña inválidos');
      setLoading(false);
      return false;

    } catch (err) {
      console.error('[Auth] Login error:', err);
      setError('Error en el sistema');
      setLoading(false);
      return false;
    }
  };

  // ── LOGOUT ──
  const logout = useCallback(async () => {
    const userId = user?.id;

    loadedEmailRef.current = null;
    setUser(null);
    setPermissions([]);
    localStorage.removeItem('currentUser'); // Limpiar legacy

    // Limpieza que REQUIERE el token (debe correr ANTES de signOut, que lo destruye):
    // presencia en Admin Monitor y push token del dispositivo (en PDA compartida,
    // el siguiente usuario no debe recibir las notificaciones del anterior).
    if (userId) {
      try {
        await Promise.allSettled([
          supabase.from('tms_usuarios_activos').delete().eq('usuario_id', userId),
          supabase.from('tms_usuarios').update({ push_token: null }).eq('id', userId),
        ]);
      } catch (_) { /* best-effort */ }
    }

    // Estado local persistido de otros usuarios en el mismo equipo:
    // sesión de picking (zustand persist) y cachés del service worker con
    // respuestas autenticadas de Supabase.
    try {
      const { usePickingStore } = await import('../stores/pickingStore');
      usePickingStore.getState().endSession();
      localStorage.removeItem('picking-session');
    } catch (_) { /* best-effort */ }
    // Datos operativos del turno en un PDA compartido: cola de recepción,
    // estado de patios y cachés offline de Dexie (se conserva la cola de
    // sincronización pendiente para no perder trabajo sin subir).
    try {
      localStorage.removeItem('wms_entry_queue');
      Object.keys(localStorage)
        .filter((k) => k.startsWith('yard_'))
        .forEach((k) => localStorage.removeItem(k));
    } catch (_) { /* best-effort */ }
    try {
      const { db } = await import('../lib/db');
      await Promise.allSettled([db.cachedProducts.clear(), db.cachedLocations.clear()]);
    } catch (_) { /* best-effort */ }
    try {
      if (typeof caches !== 'undefined') {
        const keys = await caches.keys();
        await Promise.allSettled(
          keys.filter((k) => k.includes('supabase')).map((k) => caches.delete(k))
        );
      }
    } catch (_) { /* best-effort */ }

    // Cerrar sesión Supabase Auth
    try {
      await supabase.auth.signOut();
    } catch (_) { console.error('Auth signOut error:', _); }
  }, [user?.id]);

  // ── Session Guard (realtime) ──
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`session_guard_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tms_usuarios',
          filter: `id=eq.${user.id}`
        },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            alert('Tu cuenta ha sido eliminada por un administrador.');
            logout();
          } else if (payload.eventType === 'UPDATE') {
            const newUser = payload.new;

            if (newUser.activo === false) {
              alert('Tu sesión ha sido cerrada por un administrador.');
              logout();
            } else {
              const rolCambio = newUser.rol && newUser.rol !== user.rol;
              // También aplicar en caliente la concesión/revocación de admin
              // delegado: antes solo se reaccionaba al cambio de rol y un
              // delegado revocado conservaba acceso total hasta recargar.
              const delegadoCambio = newUser.es_admin_delegado !== undefined &&
                newUser.es_admin_delegado !== user.es_admin_delegado;
              if (rolCambio || delegadoCambio) {
                const updatedUser = {
                  ...user,
                  rol: newUser.rol || user.rol,
                  nombre: newUser.nombre !== undefined ? newUser.nombre : user.nombre,
                  email: newUser.email !== undefined ? newUser.email : user.email,
                  activo: newUser.activo !== undefined ? newUser.activo : user.activo,
                  es_admin_delegado: newUser.es_admin_delegado !== undefined ? newUser.es_admin_delegado : user.es_admin_delegado
                };
                setUser(updatedUser);
                if (rolCambio) loadRoleConfig(newUser.rol);
              }
            }
          }
        }
      )
      .subscribe((status, err) => {
        if (err) console.error('Realtime subscription error:', err);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, user?.rol, user?.es_admin_delegado, logout, loadRoleConfig]);

  // ── Permisos ──
  // El admin delegado equivale a ADMIN: el guard de rutas ya le concede todo,
  // pero los botones internos y el Navbar consultan hasPermission — sin esta
  // línea el delegado tenía acceso por URL y una UI llena de acciones denegadas.
  const hasPermission = useCallback((permissionId) => {
    if (user?.rol === 'ADMIN' || user?.es_admin_delegado === true) return true;
    return permissions.includes(permissionId);
  }, [permissions, user?.rol, user?.es_admin_delegado]);

  return (
    <AuthContext.Provider value={{
      user,
      permissions,
      landingPage,
      loading,
      error,
      login,
      logout,
      isAuthenticated: !!user,
      hasPermission,
      refreshPermissions
    }}>
      {children}
    </AuthContext.Provider>
  );
};
