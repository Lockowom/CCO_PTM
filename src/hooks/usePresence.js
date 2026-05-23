import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useAuth } from '../context/AuthContext';

/**
 * Hook para manejar la presencia en tiempo real (Modo Multijugador)
 * Permite saber quién está viendo qué documento/módulo para evitar colisiones.
 * 
 * @param {string} roomName - El nombre de la sala (ej: 'picking_nv_123')
 * @returns {Array} users - Lista de usuarios activos en la sala
 */
export const usePresence = (roomName) => {
  const { user } = useAuth();
  const [activeUsers, setActiveUsers] = useState([]);

  useEffect(() => {
    if (!user || !roomName) return;

    // Crear un canal de presencia para esta "sala"
    const channel = supabase.channel(`room:${roomName}`, {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        // Extraer los usuarios del estado anidado de Supabase
        const users = Object.values(state).map((userPresenceArray) => userPresenceArray[0]);
        setActiveUsers(users);
      })
      .on('presence', { event: 'join' }, () => {})
      .on('presence', { event: 'leave' }, () => {})
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Anunciar mi presencia al canal
          await channel.track({
            id: user.id,
            name: user.nombre || user.email,
            rol: user.rol,
            joined_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, roomName]);

  return activeUsers;
};

export default usePresence;
