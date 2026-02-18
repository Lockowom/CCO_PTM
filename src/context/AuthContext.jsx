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
    if (user?.rol) {
      console.log('🔄 Refrescando permisos...');
      const perms = await loadPermissions(user.rol);
      return perms;
    }
    return [];
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

  // Heartbeat: Actualizar estado 'ONLINE' en BD
  useEffect(() => {
    if (!user?.id) return;

    const updateHeartbeat = async () => {
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

    return () => clearInterval(interval);
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
        activo: data.activo
      };

      setUser(userData);
      localStorage.setItem('currentUser', JSON.stringify(userData));
      await loadPermissions(data.rol);
      
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
  const logout = () => {
    setUser(null);
    setPermissions([]);
    localStorage.removeItem('currentUser');
  };

  // Verificar permiso
  const hasPermission = useCallback((permissionId) => {
    const has = permissions.includes(permissionId);
    return has;
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
