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

  // Cargar permisos de un rol específico - SOLUCIÓN DEFINITIVA
  const loadPermissionsForRole = async (rolId) => {
    console.log('🔍 Cargando permisos para rol:', rolId);
    try {
      setIsSyncing(true);

      // ESTRATEGIA 1: Buscar por ID exacto
      let roleData = null;
      let queryError = null;

      const { data: data1, error: err1 } = await supabase
        .from('tms_roles')
        .select('*')
        .eq('id', rolId)
        .single();

      if (!err1 && data1) {
        roleData = data1;
        console.log('✓ Rol encontrado por ID:', rolId, '→', data1);
      } else {
        console.warn('⚠️ No se encontró rol por ID:', rolId, '| Error:', err1?.message);

        // ESTRATEGIA 2: Buscar por nombre
        const { data: data2, error: err2 } = await supabase
          .from('tms_roles')
          .select('*')
          .eq('nombre', rolId)
          .single();

        if (!err2 && data2) {
          roleData = data2;
          console.log('✓ Rol encontrado por nombre:', rolId, '→', data2);
        } else {
          console.warn('⚠️ No se encontró rol por nombre:', rolId, '| Error:', err2?.message);

          // ESTRATEGIA 3: Buscar por nombre case-insensitive (ilike)
          const { data: data3, error: err3 } = await supabase
            .from('tms_roles')
            .select('*')
            .ilike('nombre', rolId)
            .single();

          if (!err3 && data3) {
            roleData = data3;
            console.log('✓ Rol encontrado por nombre (ilike):', rolId, '→', data3);
          } else {
            console.warn('⚠️ No se encontró rol por ilike:', rolId);

            // ESTRATEGIA 4: Listar TODOS los roles para debug
            const { data: allRoles, error: allErr } = await supabase
              .from('tms_roles')
              .select('*');

            console.log('📋 TODOS los roles en BD:', allRoles);
            console.log('📋 IDs disponibles:', allRoles?.map(r => `"${r.id}"`).join(', '));
            console.log('📋 Nombres disponibles:', allRoles?.map(r => `"${r.nombre}"`).join(', '));

            // ESTRATEGIA 5: Buscar coincidencia parcial en ID o nombre
            if (allRoles) {
              const rolIdLower = rolId.toLowerCase();
              const match = allRoles.find(r =>
                r.id?.toLowerCase() === rolIdLower ||
                r.nombre?.toLowerCase() === rolIdLower ||
                r.id?.toLowerCase().replace(/[\s_-]/g, '') === rolIdLower.replace(/[\s_-]/g, '') ||
                r.nombre?.toLowerCase().replace(/[\s_-]/g, '') === rolIdLower.replace(/[\s_-]/g, '')
              );

              if (match) {
                roleData = match;
                console.log('✓ Rol encontrado por coincidencia parcial:', match);
              }
            }
          }
        }
      }

      if (!roleData) {
        console.error('❌ NO se pudo encontrar el rol:', rolId, '- sin permisos');
        setPermissions([]);
        return;
      }

      // Extraer permisos - intentar múltiples campos
      let permisos = [];

      // Prioridad: permisos_json > permisos > permissions
      if (roleData.permisos_json && Array.isArray(roleData.permisos_json) && roleData.permisos_json.length > 0) {
        permisos = roleData.permisos_json;
        console.log('✓ Usando permisos_json:', permisos);
      } else if (roleData.permisos && Array.isArray(roleData.permisos) && roleData.permisos.length > 0) {
        permisos = roleData.permisos;
        console.log('✓ Usando permisos:', permisos);
      } else if (roleData.permissions && Array.isArray(roleData.permissions) && roleData.permissions.length > 0) {
        permisos = roleData.permissions;
        console.log('✓ Usando permissions:', permisos);
      } else {
        // Intentar parsear si es string JSON
        const jsonFields = ['permisos_json', 'permisos', 'permissions'];
        for (const field of jsonFields) {
          if (roleData[field] && typeof roleData[field] === 'string') {
            try {
              const parsed = JSON.parse(roleData[field]);
              if (Array.isArray(parsed) && parsed.length > 0) {
                permisos = parsed;
                console.log(`✓ Parseado de ${field} (string):`, permisos);
                break;
              }
            } catch (e) {
              // No es JSON válido, continuar
            }
          }
        }
      }

      // Mostrar todas las columnas del rol para debug
      console.log('📋 Columnas del rol:', Object.keys(roleData));
      console.log('📋 Valores del rol:', JSON.stringify(roleData, null, 2));
      console.log('✅ PERMISOS FINALES:', permisos);

      setPermissions(Array.isArray(permisos) ? permisos : []);
    } catch (err) {
      console.error('❌ Error cargando permisos:', err);
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
