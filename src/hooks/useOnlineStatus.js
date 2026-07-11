import { useEffect, useState } from 'react';

/**
 * Estado de conectividad REAL del dispositivo (navigator.onLine + eventos).
 * Reemplaza indicadores "Online" hardcodeados: en un PDA de bodega el operario
 * DEBE saber cuándo está sin señal (sus escaneos no se guardan).
 */
export default function useOnlineStatus() {
  const [online, setOnline] = useState(
    typeof navigator === 'undefined' ? true : navigator.onLine,
  );

  useEffect(() => {
    const up = () => setOnline(true);
    const down = () => setOnline(false);
    window.addEventListener('online', up);
    window.addEventListener('offline', down);
    return () => {
      window.removeEventListener('online', up);
      window.removeEventListener('offline', down);
    };
  }, []);

  return online;
}
