import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';

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
  const [isSyncing, setIsSyncing] = useState(false);
  const [permissionsVersion, setPermissionsVersion] = useState(0);

  // Función para cargar permisos
  const loadPermissionsForRole = useCallback(async (rolId) => {
    if (!rolId) {
      console.log('⚠️ No hay rol ID para cargar permisos');
      setPermissions([]);
      setLoading(false);
      return [];
    }

    console.log('🔍 Cargando permisos para rol:', rolId);
    try {
      setIsSyncing(true);

      const { data: roleData, error: roleError } = await supabase
        .from('tms_roles')
        .select('id, nombre, permisos_json')
        .eq('id', rolId)
        .single();

      if (roleError) {
        console.error('❌ Error obteniendo rol:', roleError);
        setPermissions([]);
        return [];
      }

      const permisos = roleData?.permisos_json || [];
      console.log('✅ Permisos cargados:', permisos.length, 'permisos');
      
      setPermissions(permisos);
      setPermissionsVersion(v => v + 1);
      
      return permisos;

    } catch (err) {
      console.error('❌ Error cargando permisos:', err);
      setPermissions([]);
      return [];
    } finally {
      setIsSyncing(false);
      setLoading(false);
    }
  }, []);

  // Función pública para refrescar permisos manualmente
  const refreshPermissions = useCallback(async () => {
    if (user?.rol) {
      console.log('🔄 Refrescando permisos manualmente...');
      return await loadPermissionsForRole(user.rol);
    }
    return [];
  }, [user?.rol, loadPermissionsForRole]);

  // Restaurar sesión al cargar
  useEffect(() => {
    const initSession = async () => {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          console.log('🔄 Restaurando sesión para:', parsed.nombre, '| Rol:', parsed.rol);
          setUser(parsed);
          await loadPermissionsForRole(parsed.rol);
        } catch (err) {
          console.error('Error restaurando usuario:', err);
          localStorage.removeItem('currentUser');
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    initSession();
  }, [loadPermissionsForRole]);

  // Suscripción a Realtime
  useEffect(() => {
    if (!user?.rol) return;

    console.log('🔌 Suscribiendo a cambios Realtime para rol:', user.rol);

    const channel = supabase
      .channel(`role_permissions_${user.rol}_${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'tms_roles',
          filter: `id=eq.${user.rol}`
        },
        (payload) => {
          console.log('🔄 Cambio Realtime detectado:', payload);
          if (payload.new?.permisos_json) {
            console.log('✅ Actualizando permisos desde Realtime');
            setPermissions(payload.new.permisos_json);
            setPermissionsVersion(v => v + 1);
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Estado suscripción Realtime:', status);
      });

    return () => {
      console.log('🔌 Desconectando canal Realtime');
      supabase.removeChannel(channel);
    };
  }, [user?.rol]);

  // Polling como fallback (cada 30 segundos)
  useEffect(() => {
    if (!user?.rol) return;

    const pollInterval = setInterval(() => {
      console.log('⏰ Polling de permisos...');
      loadPermissionsForRole(user.rol);
    }, 30000);

    return () => clearInterval(pollInterval);
  }, [user?.rol, loadPermissionsForRole]);

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
        setError('❌ Usuario desactivado. Contacta al administrador');
        setLoading(false);
        return false;
      }

      console.log('✓ Login exitoso:', data.nombre, '| Rol:', data.rol);

      const userData = {
        id: data.id,
        nombre: data.nombre,
        email: data.email,
        rol: data.rol,
        activo: data.activo
      };

      setUser(userData);
      localStorage.setItem('currentUser', JSON.stringify(userData));

      await loadPermissionsForRole(data.rol);

      setLoading(false);
      return true;

    } catch (err) {
      console.error('Error durante login:', err);
      setError('❌ Error en el sistema. Intenta más tarde');
      setLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setPermissions([]);
    setPermissionsVersion(0);
    localStorage.removeItem('currentUser');
    setError('');
  };

  const hasPermission = useCallback((permissionId) => {
    return permissions.includes(permissionId);
  }, [permissions]);

  const isAuthenticated = !!user;

  const value = {
    user,
    permissions,
    permissionsVersion,
    loading,
    error,
    login,
    logout,
    isAuthenticated,
    hasPermission,
    isSyncing,
    refreshPermissions
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
