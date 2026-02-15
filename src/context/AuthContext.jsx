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
        console.log('🔄 Restaurando sesión para:', parsed.nombre, '| Rol:', parsed.rol);
        setUser(parsed);
        // Cargar permisos del rol guardado
      loadPermissionsForRole(parsed.rol);
      // Listener se activa con useEffect
    } catch (err) {
        console.error('Error restaurando usuario:', err);
        localStorage.removeItem('currentUser');
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  // Cargar permisos de un rol específico - SOLUCIÓN DEFINITIVA
  const loadPermissionsForRole = async (rolId) => {
    console.log('🔍 Cargando permisos para rol:', rolId);
    try {
      setIsSyncing(true);

      // Obtener el rol con sus permisos desde permisos_json
      const { data: roleData, error: roleError } = await supabase
        .from('tms_roles')
        .select('id, nombre, permisos_json')
        .eq('id', rolId)
        .single();

      if (roleError) {
        console.error('❌ Error obteniendo rol:', roleError);
        setPermissions([]);
        return;
      }

      // Extraer permisos del campo permisos_json (es un array JSONB)
      const permisos = roleData?.permisos_json || [];
      console.log('✅ Permisos cargados desde permisos_json:', permisos);
      setPermissions(permisos);

    } catch (err) {
      console.error('❌ Error cargando permisos:', err);
      setPermissions([]);
    } finally {
      setIsSyncing(false);
      setLoading(false);
    }
  };

  // Configurar listeners de Realtime para cambios en roles y permisos
  useEffect(() => {
    if (!user?.rol) return;

    console.log('🔌 Suscribiendo a cambios de permisos para rol:', user.rol);

    // Escuchar cambios en la tabla tms_roles (donde están los permisos_json)
    const channel = supabase
      .channel(`permissions_watch_${user.rol}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tms_roles',
          filter: `id=eq.${user.rol}`
        },
        (payload) => {
          console.log('🔄 Cambio en rol/permisos detectado (Realtime):', payload);
          // Si hay permisos_json en el payload, actualizar directamente
          if (payload.new?.permisos_json) {
            console.log('✅ Actualizando permisos en tiempo real:', payload.new.permisos_json);
            setPermissions(payload.new.permisos_json);
          } else {
            // Fallback: recargar permisos
            loadPermissionsForRole(user.rol);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.rol]);

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

      console.log('✓ Login exitoso:', data.nombre, '| Rol:', data.rol);
      console.log('📋 Datos completos del usuario:', JSON.stringify(data, null, 2));

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
      
      // Listener se activa con useEffect al setear user

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
    const has = permissions.includes(permissionId);
    return has;
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
