import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../supabase';
import { wmsToast } from '../lib/notifications';
import { syncOfflineData } from '../lib/syncManager';
import { Capacitor } from '@capacitor/core';
import { initPushNotifications } from '../services/mobileService';
import { setUserForTracking } from '../lib/sentry';

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

  useEffect(() => {
    const onPopState = () => { pathnameRef.current = window.location.pathname; };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

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

  // SUSCRIPCIÓN GLOBAL A CAMBIOS DE ROLES
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

  // Restaurar sesión al iniciar
  useEffect(() => {
    const initSession = async () => {
      const stored = localStorage.getItem('currentUser');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          // Validate session against server
          const { data, error } = await supabase
            .from('tms_usuarios')
            .select('id, nombre, email, rol, activo, es_admin_delegado')
            .eq('id', parsed.id)
            .eq('activo', true)
            .single();

          if (error || !data) {
            // User no longer exists or is deactivated
            localStorage.removeItem('currentUser');
            setLoading(false);
            return;
          }

          // Update with fresh server data
          const freshUser = {
            id: data.id,
            nombre: data.nombre,
            email: data.email,
            rol: data.rol,
            activo: data.activo,
            es_admin_delegado: data.es_admin_delegado || false
          };

          setUser(freshUser);
          localStorage.setItem('currentUser', JSON.stringify(freshUser));
          setUserForTracking(freshUser);
          await loadRoleConfig(freshUser.rol);
        } catch (err) {
          localStorage.removeItem('currentUser');
        }
      }
      setLoading(false);
    };
    initSession();
  }, [loadRoleConfig]);

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

  const login = async (email, password) => {
    setLoading(true);
    setError('');

    try {
      // Verificar credenciales via RPC (bcrypt en servidor)
      const { data: authResult, error: authError } = await supabase
        .rpc('verify_user_password', { p_email: email, p_password: password });

      if (authError || !authResult || authResult.length === 0) {
        setError('Usuario o contraseña inválidos');
        setLoading(false);
        return false;
      }

      const data = authResult[0];

      if (!data.activo) {
        setError('Usuario desactivado');
        setLoading(false);
        return false;
      }

      const userData = {
        id: data.id,
        nombre: data.nombre,
        email: data.email,
        rol: data.rol,
        activo: data.activo,
        es_admin_delegado: data.es_admin_delegado || false
      };

      setUser(userData);
      localStorage.setItem('currentUser', JSON.stringify(userData));
      await loadRoleConfig(data.rol);
      setUserForTracking(userData);

      if (Capacitor.isNativePlatform()) {
        initPushNotifications(userData.id);
      }

      try {
        await supabase.from('tms_accesos').insert({
          usuario_id: userData.id,
          nombre: userData.nombre,
          email: userData.email,
          rol: userData.rol
        });

        await supabase
          .from('tms_usuarios_activos')
          .upsert({
            usuario_id: userData.id,
            nombre: userData.nombre,
            rol: userData.rol,
            ultima_actividad: new Date().toISOString(),
            modulo_actual: 'Inicio de Sesión',
            estado: 'ONLINE'
          }, { onConflict: 'usuario_id' });
      } catch (_) { console.error('Login tracking failed:', _); }

      setLoading(false);
      return true;

    } catch (err) {
      setError('Error en el sistema');
      setLoading(false);
      return false;
    }
  };

  const logout = useCallback(() => {
    const userId = user?.id;
    setUser(null);
    setPermissions([]);
    localStorage.removeItem('currentUser');
    if (userId) {
      supabase
        .from('tms_usuarios_activos')
        .delete()
        .eq('usuario_id', userId)
        .catch(() => {});
    }
  }, [user?.id]);

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
              localStorage.setItem('currentUser', JSON.stringify(updatedUser));
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
