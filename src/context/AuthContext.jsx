import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';
import { wmsToast } from '../lib/notifications';
import { processSyncQueue } from '../lib/db';
import { Capacitor } from '@capacitor/core';
import { initPushNotifications } from '../services/mobileService';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Cargar permisos desde BD
  const loadPermissions = useCallback(async (rolId) => {
    if (!rolId) {
      setPermissions([]);
      return [];
    }

    try {
      console.log('📥 Cargando permisos para rol:', rolId);

      const { data, error } = await supabase
        .from('tms_roles')
        .select('permisos_json')
        .eq('id', rolId)
        .single();

      if (error) throw error;

      const perms = data?.permisos_json || [];
      console.log('✅ Permisos cargados:', perms.length, perms);
      setPermissions(perms);
      return perms;

    } catch (err) {
      console.error('❌ Error cargando permisos:', err);
      setPermissions([]);
      return [];
    }
  }, []);

  // FUNCIÓN PÚBLICA: Refrescar permisos (llamar desde Roles.jsx)
  const refreshPermissions = useCallback(async () => {
    // Si hay usuario logueado, recargar sus permisos
    if (user?.rol) {
      console.log('🔄 Refrescando permisos...');
      const perms = await loadPermissions(user.rol);

      // Notificar a otras pestañas/componentes (opcional)
      // window.dispatchEvent(new Event('permissions_updated'));

      return perms;
    }
    return [];
  }, [user?.rol, loadPermissions]);

  // SUSCRIPCIÓN GLOBAL A CAMBIOS DE ROLES
  useEffect(() => {
    if (!user?.rol) return;

    const channel = supabase
      .channel('roles_changes_global')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tms_roles' },
        async (payload) => {
          console.log('🎭 Cambio detectado en Roles (DB):', payload);

          // Si el rol modificado es el mío, recargar permisos
          // Nota: Usamos payload.old.id o payload.new.id para soportar casos donde REPLICA IDENTITY no sea FULL
          const changedRoleId = payload.new?.id || payload.old?.id;
          
          if (changedRoleId === user.rol || !changedRoleId) {
            console.log('🔄 Rol actualizado (posiblemente el mío), recargando permisos...');
            await loadPermissions(user.rol);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.rol, loadPermissions]);

  // Restaurar sesión al iniciar
  useEffect(() => {
    const initSession = async () => {
      const stored = localStorage.getItem('currentUser');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          console.log('🔄 Restaurando sesión:', parsed.nombre);
          setUser(parsed);
          await loadPermissions(parsed.rol);
        } catch (err) {
          console.error('Error restaurando sesión:', err);
          localStorage.removeItem('currentUser');
        }
      }
      setLoading(false);
    };
    initSession();
  }, [loadPermissions]);

  // Heartbeat: Actualizar estado 'ONLINE' en BD y Manejo de Conexión Offline
  useEffect(() => {
    if (!user?.id) return;

    // --- MANEJO DE CONEXIÓN (OFFLINE/ONLINE) ---
    const handleOffline = () => {
      console.warn('📡 Sistema OFFLINE');
      wmsToast.systemOffline();
      // Actualizar localmente si se desea
    };

    const handleOnline = async () => {
      console.log('⚡ Sistema ONLINE');
      wmsToast.systemOnline();
      
      // Intentar sincronizar operaciones guardadas en Dexie
      await processSyncQueue(async (action, payload) => {
        console.log(`Ejecutando acción offline pendiente: ${action}`, payload);
        // Aquí se puede enrutar la acción a la función RPC correspondiente
        if (action === 'move_stock') {
          const { error } = await supabase.rpc('wms_move_stock', payload);
          if (error) throw error;
        }
      });
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    // --- HEARTBEAT REGULAR ---
    const updateHeartbeat = async () => {
      if (!navigator.onLine) return; // No intentar si estamos offline

      try {
        await supabase
          .from('tms_usuarios_activos')
          .upsert({
            usuario_id: user.id,
            nombre: user.nombre,
            rol: user.rol,
            ultima_actividad: new Date().toISOString(),
            modulo_actual: window.location.pathname,
            estado: 'ONLINE'
          }, { onConflict: 'usuario_id' });
      } catch (err) {
        console.error('Error updating heartbeat:', err);
      }
    };

    // Actualizar inmediatamente y luego cada 30s
    updateHeartbeat();
    const interval = setInterval(updateHeartbeat, 30000);

    return () => {
      clearInterval(interval);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, [user?.id, window.location.pathname]); // Se actualiza al cambiar de ruta también

  // Login
  const login = async (email, password) => {
    setLoading(true);
    setError('');

    try {
      const { data, error: queryError } = await supabase
        .from('tms_usuarios')
        .select('*')
        .eq('email', email)
        .single();

      if (queryError || !data) {
        setError('❌ Usuario o contraseña inválidos');
        setLoading(false);
        return false;
      }

      if (data.password_hash !== password) {
        setError('❌ Usuario o contraseña inválidos');
        setLoading(false);
        return false;
      }

      if (!data.activo) {
        setError('❌ Usuario desactivado');
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
      await loadPermissions(data.rol);

      // Inicializar notificaciones push si estamos en móvil
      if (Capacitor.isNativePlatform()) {
        initPushNotifications(userData.id);
      }

      // Registrar acceso
      try {
        await supabase.from('tms_accesos').insert({
          usuario_id: userData.id,
          nombre: userData.nombre,
          email: userData.email,
          rol: userData.rol
        });

        // ACTUALIZAR INMEDIATAMENTE el estado activo (Heartbeat inicial)
        // Esto asegura que el usuario aparezca en "Usuarios Activos" al instante
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

      } catch (logErr) {
        console.error('Error logging access/active status:', logErr);
      }

      setLoading(false);
      return true;

    } catch (err) {
      console.error('Error login:', err);
      setError('❌ Error en el sistema');
      setLoading(false);
      return false;
    }
  };

  // Logout
  const logout = useCallback(() => {
    setUser(null);
    setPermissions([]);
    localStorage.removeItem('currentUser');
    // Limpiar estado activo al salir
    if (user?.id) {
      supabase
        .from('tms_usuarios_activos')
        .delete()
        .eq('usuario_id', user.id)
        .then(() => console.log('👋 Usuario desconectado'))
        .catch(err => console.error('Error limpiando usuario activo:', err));
    }
  }, [user?.id]);

  // VIGILANTE DE SESIÓN: Escuchar cambios en mi propio usuario
  useEffect(() => {
    if (!user?.id) return;

    console.log('👁️ Iniciando vigilancia de sesión para:', user.email);

    const channel = supabase
      .channel(`session_guard_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*', // Escuchar UPDATE y DELETE
          schema: 'public',
          table: 'tms_usuarios',
          filter: `id=eq.${user.id}`
        },
        (payload) => {
          console.log('🚨 Cambio crítico en usuario detectado:', payload);

          if (payload.eventType === 'DELETE') {
            console.warn('❌ USUARIO ELIMINADO - CERRANDO SESIÓN');
            alert('Tu cuenta ha sido eliminada por un administrador.');
            logout();
          }
          else if (payload.eventType === 'UPDATE') {
            const newUser = payload.new;

            // FIX: Be defensive against partial payloads (REPLICA IDENTITY DEFAULT)
            if (newUser.activo === false) {
              console.warn('⛔ USUARIO DESACTIVADO - CERRANDO SESIÓN');
              alert('Tu sesión ha sido cerrada por un administrador.');
              logout();
            } else if (newUser.rol && newUser.rol !== user.rol) {
              console.log('🔄 Rol actualizado, refrescando permisos...');
              // Si cambia el rol, actualizar el estado local preservando variables anteriores si el payload es parcial
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
              loadPermissions(newUser.rol);
            }
          }
        }
      )
      .subscribe();

    return () => {
      console.log('🛑 Deteniendo vigilancia de sesión');
      supabase.removeChannel(channel);
    };
  }, [user?.id, user?.rol, logout, loadPermissions]);

  // Verificar permiso
  const hasPermission = useCallback((permissionId) => {
    // ADMIN BYPASS: Acceso global a todas las vistas y acciones
    if (user?.rol === 'ADMIN' || user?.es_admin_delegado) return true;

    const has = permissions.includes(permissionId);
    return has;
  }, [permissions, user?.rol, user?.es_admin_delegado]);

  return (
    <AuthContext.Provider value={{
      user,
      permissions,
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
