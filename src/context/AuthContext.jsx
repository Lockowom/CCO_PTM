import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';

const AuthContext = createContext();

// Evento personalizado para notificar cambios de permisos
const PERMISSIONS_UPDATED_EVENT = 'permissions-updated';
const CONFIG_UPDATED_EVENT = 'config-updated';

// Función helper para emitir eventos
export const emitPermissionsUpdate = () => {
  window.dispatchEvent(new CustomEvent(PERMISSIONS_UPDATED_EVENT));
};

export const emitConfigUpdate = () => {
  window.dispatchEvent(new CustomEvent(CONFIG_UPDATED_EVENT));
};

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

  // Cargar permisos desde la BD
  const loadPermissions = useCallback(async (rolId) => {
    if (!rolId) {
      setPermissions([]);
      return;
    }

    try {
      console.log('📥 Cargando permisos para rol:', rolId);
      
      const { data, error } = await supabase
        .from('tms_roles')
        .select('permisos_json')
        .eq('id', rolId)
        .single();

      if (error) {
        console.error('Error cargando permisos:', error);
        setPermissions([]);
        return;
      }

      const permisos = data?.permisos_json || [];
      console.log('✅ Permisos cargados:', permisos.length);
      setPermissions(permisos);
      
    } catch (err) {
      console.error('Error:', err);
      setPermissions([]);
    }
  }, []);

  // Función pública para refrescar permisos
  const refreshPermissions = useCallback(async () => {
    if (user?.rol) {
      await loadPermissions(user.rol);
    }
  }, [user?.rol, loadPermissions]);

  // Restaurar sesión al iniciar
  useEffect(() => {
    const initSession = async () => {
      const stored = localStorage.getItem('currentUser');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setUser(parsed);
          await loadPermissions(parsed.rol);
        } catch (err) {
          localStorage.removeItem('currentUser');
        }
      }
      setLoading(false);
    };
    initSession();
  }, [loadPermissions]);

  // Escuchar eventos de actualización de permisos
  useEffect(() => {
    const handlePermissionsUpdate = () => {
      console.log('🔔 Evento de actualización de permisos recibido');
      if (user?.rol) {
        loadPermissions(user.rol);
      }
    };

    window.addEventListener(PERMISSIONS_UPDATED_EVENT, handlePermissionsUpdate);
    return () => window.removeEventListener(PERMISSIONS_UPDATED_EVENT, handlePermissionsUpdate);
  }, [user?.rol, loadPermissions]);

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
        activo: data.activo
      };

      setUser(userData);
      localStorage.setItem('currentUser', JSON.stringify(userData));
      await loadPermissions(data.rol);
      
      setLoading(false);
      return true;

    } catch (err) {
      setError('❌ Error en el sistema');
      setLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setPermissions([]);
    localStorage.removeItem('currentUser');
  };

  const hasPermission = useCallback((permissionId) => {
    return permissions.includes(permissionId);
  }, [permissions]);

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
