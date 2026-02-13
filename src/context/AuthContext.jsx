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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Restaurar sesión al cargar la app
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error('Error restaurando usuario:', err);
        localStorage.removeItem('currentUser');
      }
    }
    setLoading(false);
  }, []);

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
    localStorage.removeItem('currentUser');
    setError('');
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};
