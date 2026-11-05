import { useCallback, useEffect, useState } from 'react';
import {
  comprobarConexionCalidad,
  getQualityConnectionStatus
} from '../services/qualityOfflineService';

const PROBE_INTERVAL_MS = 30000;

/**
 * Conectividad operativa de Calidad. A diferencia de navigator.onLine, mide
 * una respuesta real del backend CCO y se recupera aunque el navegador haya
 * dejado un evento offline antiguo en su perfil local.
 */
export default function useQualityConnectionStatus() {
  const [status, setStatus] = useState(() => getQualityConnectionStatus());

  const refresh = useCallback(async () => {
    const connected = await comprobarConexionCalidad();
    setStatus(connected);
    return connected;
  }, []);

  useEffect(() => {
    let active = true;
    const check = async () => {
      const connected = await comprobarConexionCalidad();
      if (active) setStatus(connected);
    };
    const onVisible = () => {
      if (document.visibilityState === 'visible') check();
    };

    check();
    const timer = window.setInterval(check, PROBE_INTERVAL_MS);
    // Ambos eventos disparan una comprobación real: no confiamos en que el
    // valor indicado por Chrome represente conectividad con CCO.
    window.addEventListener('online', check);
    window.addEventListener('offline', check);
    window.addEventListener('focus', check);
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      active = false;
      window.clearInterval(timer);
      window.removeEventListener('online', check);
      window.removeEventListener('offline', check);
      window.removeEventListener('focus', check);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  return { online: status === true, checking: status === null, refresh };
}
