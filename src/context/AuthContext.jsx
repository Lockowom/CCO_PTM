import React, { createContext, useContext, useState, useEffect } from 'react';
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

  // Restaurar sesión al cargar la app
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        // Cargar permisos del rol guardado
        loadPermissionsForRole(parsed.rol);
        // Escuchar cambios en Realtime
        setupRealtimeListeners(parsed.rol);
      } catch (err) {
        console.error('Error restaurando usuario:', err);
        localStorage.removeItem('currentUser');
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  // Cargar permisos de un rol específico
  const loadPermissionsForRole = async (rolId) => {
    try {
      setIsSyncing(true);
      const { data: roleData, error: roleError } = await supabase
        .from('tms_roles')
        .select('permisos_json, permisos')
        .eq('id', rolId)
        .single();

      if (roleError) {
        console.error('Error cargando role:', roleError);
        setPermissions([]);
        return;
      }

      const permisos = roleData?.permisos_json || roleData?.permisos || [];
      setPermissions(Array.isArray(permisos) ? permisos : []);
      console.log('✓ Permisos cargados para rol', rolId, ':', permisos);
    } catch (err) {
      console.error('Error cargando permisos:', err);
      setPermissions([]);
    } finally {
      setIsSyncing(false);
      setLoading(false);
    }
  };


  // Configurar listeners de Realtime para cambios en roles
  const setupRealtimeListeners = (rolId) => {
    const channel = supabase
      .channel(`role_changes_${rolId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'tms_roles',
          filter: `id=eq.${rolId}`
        },
        (payload) => {
          console.log('🔄 Cambios detectados en rol (Realtime):', payload);
          // Recargar permisos
          loadPermissionsForRole(rolId);
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  };

  const login = async (email, password) => {
    setLoading(true);
    setError('');
    try {
      // Buscar usuario en la BD por email
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

      // Verificar contraseña (en producción, deberías usar comparación de hash)
      if (data.password_hash !== password) {
        setError('❌ Usuario o contraseña inválidos');
        setLoading(false);
        return false;
      }

      // Verificar si el usuario está activo
      if (!data.activo) {
        setError('❌ Usuario desactivado. Contacta al administrador');
        setLoading(false);
        return false;
      }

      // Guardar usuario en estado y localStorage
      const userData = {
        id: data.id,
        nombre: data.nombre,
        email: data.email,
        rol: data.rol,
        activo: data.activo
      };

      setUser(userData);
      localStorage.setItem('currentUser', JSON.stringify(userData));

      // Cargar permisos del rol
      await loadPermissionsForRole(data.rol);

      // Configurar listeners en tiempo real
      setupRealtimeListeners(data.rol);

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
    localStorage.removeItem('currentUser');
    setError('');
  };

  // Función para verificar si el usuario tiene un permiso específico
  const hasPermission = (permissionId) => {
    return permissions.includes(permissionId);
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{
      user,
      permissions,
      loading,
      error,
      login,
      logout,
      isAuthenticated,
      hasPermission,
      isSyncing
    }}>
      {children}
    </AuthContext.Provider>
  );
};
