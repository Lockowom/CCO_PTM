import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user.id, session.user.email);
      } else {
        setLoading(false);
      }
    });

    // Escuchar cambios de sesión
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user.id, session.user.email);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId, email) => {
    try {
      // Intentar buscar perfil de conductor
      const { data: driverData, error } = await supabase
        .from('tms_conductores')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (driverData) {
        setUser({ ...driverData, email, role: 'CONDUCTOR', id: userId });
      } else {
        // Usuario genérico
        setUser({ id: userId, email, role: 'USER' });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    // Usar el sistema de usuarios custom (tms_usuarios)
    // 1. Buscar en tms_usuarios
    const { data: users, error } = await supabase
        .from('tms_usuarios')
        .select('*')
        .eq('email', email)
        .eq('password_hash', password) // En producción usar hash real
        .single();

    if (error || !users) {
        throw new Error('Credenciales inválidas');
    }

    // 2. Simular sesión (ya que usamos auth custom en web)
    // Para simplificar en móvil, buscamos el conductor asociado a este usuario custom
    // Nota: Esto asume que el user_id en tms_conductores coincide con el id de tms_usuarios
    // O que vamos a usar el ID de tms_usuarios como sesión.
    
    // Si queremos usar Supabase Auth real (recomendado para móvil):
    // const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    // if (authError) throw authError;
    
    // PERO, como el sistema web usa tabla custom, haremos un "login manual" guardando estado local
    setUser({ ...users, role: users.rol });
    return users;
  };

  const signOut = async () => {
    // await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
