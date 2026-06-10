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

  const pathnameRef = useRef(window.location.pathname);
  const initDoneRef = useRef(false);

  useEffect(() => {
    const onPopState = () => { pathnameRef.current = window.location.pathname; };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

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
      async (event, session) => {
        // Solo procesar después de la inicialización
        if (!initDoneRef.current) return;

        if (event === 'SIGNED_OUT') {
          setUser(null);
          setPermissions([]);
          setLandingPage('/dashboard');
        } else if (event === 'SIGNED_IN' && session?.user?.email) {
          try {
            const profile = await withTimeout(
              loadUserProfile(session.user.email),
              { ms: 10000, label: 'inicio de sesión' }
            );
            if (profile) {
              await setUserState(profile);
            }
          } catch (err) {
            console.error('[Auth] SIGNED_IN profile load error:', err);
            logError(err, { context: 'auth_signed_in' });
            toast.error('No se pudo cargar tu perfil. Reintenta el ingreso.');
          }
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
            modulo_actual: pathnameRef.current,
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

    setUser(null);
    setPermissions([]);
    localStorage.removeItem('currentUser'); // Limpiar legacy

    // Cerrar sesión Supabase Auth
    try {
      await supabase.auth.signOut();
    } catch (_) { console.error('Auth signOut error:', _); }

    if (userId) {
      supabase
        .from('tms_usuarios_activos')
        .delete()
        .eq('usuario_id', userId)
        .then(({ error }) => {
          if (error) console.warn('[Auth] No se pudo limpiar la presencia al cerrar sesión:', error);
        });
    }
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
            } else if (newUser.rol && newUser.rol !== user.rol) {
              const updatedUser = {
                ...user,
                rol: newUser.rol,
                nombre: newUser.nombre !== undefined ? newUser.nombre : user.nombre,
                email: newUser.email !== undefined ? newUser.email : user.email,
                activo: newUser.activo !== undefined ? newUser.activo : user.activo,
                es_admin_delegado: newUser.es_admin_delegado !== undefined ? newUser.es_admin_delegado : user.es_admin_delegado
              };
              setUser(updatedUser);
              loadRoleConfig(newUser.rol);
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
  }, [user?.id, user?.rol, logout, loadRoleConfig]);

  // ── Permisos ──
  const hasPermission = useCallback((permissionId) => {
    if (user?.rol === 'ADMIN') return true;
    return permissions.includes(permissionId);
  }, [permissions, user?.rol]);

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
