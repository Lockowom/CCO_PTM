import { useEffect, useState, useRef } from 'react';
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

    const channel = supabase.channel(`room:${roomName}`, {
      config: {
        presence: {
          key: user.id
        }
      }
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const users = Object.values(state).map((userPresenceArray) => userPresenceArray[0]);
        setActiveUsers(users);
      })
      .on('presence', { event: 'join' }, () => {})
      .on('presence', { event: 'leave' }, () => {})
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            id: user.id,
            name: user.nombre || user.email,
            rol: user.rol,
            joined_at: new Date().toISOString()
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
    // Dependemos de primitivos (no del objeto `user`, que se recrea en cada
    // setUser) para no recrear el canal ni generar join/leave espurios.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, roomName]);

  return activeUsers;
};

// ─── Path → Module Name Mapping ─────────────────────
const PATH_TO_MODULE = {
  '/mobile/pda': 'PDA Operativa',
  '/inbound/reception': 'Recepción Importaciones',
  '/inbound/entry': 'Putaway',
  '/inbound/cubing': 'Cubicaje',
  '/inbound/data-import': 'Carga Masiva',
  '/queries/batches': 'Lotes/Series',
  '/queries/sales-status': 'Estado N.V.',
  '/queries/addresses': 'Direcciones',
  '/queries/locations': 'Ubicaciones',
  '/queries/heatmap': 'Mapa de Calor',
  '/queries/historial-nv': 'Historial N.V.',
  '/queries/dispatch-control': 'Control Despacho',
  '/admin/users': 'Usuarios',
  '/admin/roles': 'Roles',
  '/admin/views': 'Vistas',
  '/admin/tickets': 'Tickets TI',
  '/admin/upload-history': 'Historial Cargas',
  '/admin/locations': 'Gestión Ubicaciones',
  '/admin/cleanup': 'Limpieza',
  '/admin/monitor': 'Monitor Tiempo Real'
};

export const getModuleName = (path) => PATH_TO_MODULE[path] || path;

/**
 * Hook para tracking de presencia global (persiste en DB).
 * Se usa en ProtectedRoute/Layout para que TODOS los usuarios reporten su ubicación.
 * El Admin Monitor lee estos datos para mostrar quién está online.
 */
export const usePresenceTracker = () => {
  const { user } = useAuth();
  const intervalRef = useRef(null);
  const sessionStartRef = useRef(null);
  const lastPathRef = useRef('');

  const updatePresence = async (pathname) => {
    if (!user?.id || document.visibilityState === 'hidden') return;
    const moduleName = PATH_TO_MODULE[pathname] || pathname;
    try {
      const {
        data: { session }
      } = await supabase.auth.getSession();
      if (!session?.access_token) return;
      await supabase
        .from('tms_usuarios')
        .update({
          last_seen: new Date().toISOString(),
          current_module: moduleName,
          current_path: pathname,
          session_start: sessionStartRef.current
        })
        .eq('id', user.id);
    } catch (_) {
      // Silent fail
    }
  };

  const startTracking = (pathname) => {
    if (!user?.id) return;
    if (!sessionStartRef.current) {
      sessionStartRef.current = new Date().toISOString();
    }
    lastPathRef.current = pathname;
    updatePresence(pathname);

    // Heartbeat cada 90 s: suficiente para presencia sin saturar escrituras.
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      updatePresence(lastPathRef.current);
    }, 90000);
  };

  const updatePath = (pathname) => {
    lastPathRef.current = pathname;
    updatePresence(pathname);
  };

  const stopTracking = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  useEffect(() => {
    return () => stopTracking();
  }, []);

  return { startTracking, updatePath, stopTracking };
};

export default usePresence;
