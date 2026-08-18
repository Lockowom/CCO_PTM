/**
 * Presence — helpers puros del tracker global de presencia (PR-008 fase B4).
 * Separados del componente para tener un contrato testeable entre el tracker
 * (usePresenceTracker, heartbeat 90 s) y el Admin Monitor (umbrales online/idle).
 */

export const HEARTBEAT_MS = 90000; // usePresenceTracker: escritura cada 90 s
export const ONLINE_THRESHOLD_S = 180; // AdminMonitor: online < 180 s (3 heartbeats)
export const IDLE_THRESHOLD_S = 300; // AdminMonitor: idle entre 180 y 300 s

/** true si last_seen tiene menos de ONLINE_THRESHOLD_S segundos. */
export const isOnline = (lastSeen, now = new Date()) => {
  if (!lastSeen) return false;
  const diff = (now - new Date(lastSeen)) / 1000;
  return diff < ONLINE_THRESHOLD_S;
};

/** true si last_seen está entre ONLINE_THRESHOLD_S y IDLE_THRESHOLD_S. */
export const isIdle = (lastSeen, now = new Date()) => {
  if (!lastSeen) return false;
  const diff = (now - new Date(lastSeen)) / 1000;
  return diff >= ONLINE_THRESHOLD_S && diff < IDLE_THRESHOLD_S;
};

/** Duración legible de la sesión desde session_start. */
export const getSessionDuration = (sessionStart, now = new Date()) => {
  if (!sessionStart) return '-';
  const diff = Math.floor((now - new Date(sessionStart)) / 1000);
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  const hours = Math.floor(diff / 3600);
  const mins = Math.floor((diff % 3600) / 60);
  return `${hours}h ${mins}m`;
};

/** Texto legible de "última vez visto". */
export const getLastSeenText = (lastSeen, now = new Date()) => {
  if (!lastSeen) return 'Nunca';
  const diff = Math.floor((now - new Date(lastSeen)) / 1000);
  if (diff < 10) return 'Ahora';
  if (diff < 60) return `Hace ${diff}s`;
  if (diff < 3600) return `Hace ${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `Hace ${Math.floor(diff / 3600)}h`;
  return new Date(lastSeen).toLocaleDateString('es-CL', { day: '2-digit', month: 'short' });
};
