import { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

// Versión con la que se compiló este bundle (inyectada por Vite desde package.json).
const CURRENT = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : null;

// VersionGuard — "al actualizar, obliga a re-loguear" (igual que el Panel).
// Consulta /api/version (la versión DESPLEGADA en el servidor) al montar, cada
// 60 s y al volver el foco. Si difiere de la versión de este bundle, significa
// que hay un deploy nuevo → cierra la sesión (si hay) y recarga para traer el
// bundle nuevo, dejando al usuario en el login.
export default function VersionGuard() {
  const { user, logout } = useAuth();
  const firing = useRef(false);
  const userRef = useRef(user);
  useEffect(() => { userRef.current = user; }, [user]);

  useEffect(() => {
    let alive = true;
    const check = async () => {
      if (firing.current || !CURRENT) return;
      try {
        const res = await fetch('/api/version', { cache: 'no-store' });
        if (!res.ok) return;
        const { version } = await res.json();
        if (!alive || !version || version === CURRENT) return;
        firing.current = true;
        // Cierra sesión si hay una activa (limpieza + signOut de CCO).
        try { if (userRef.current) await logout(); } catch { /* ignore */ }
        // Fuerza al service worker a buscar el bundle nuevo.
        try {
          if ('serviceWorker' in navigator) {
            const regs = await navigator.serviceWorker.getRegistrations();
            await Promise.all(regs.map((r) => r.update().catch(() => {})));
          }
        } catch { /* ignore */ }
        window.location.reload();
      } catch { /* offline/red: reintenta en el próximo tick */ }
    };
    check();
    const t = setInterval(check, 60000);
    const onVis = () => { if (document.visibilityState === 'visible') check(); };
    window.addEventListener('focus', check);
    document.addEventListener('visibilitychange', onVis);
    return () => {
      alive = false; clearInterval(t);
      window.removeEventListener('focus', check);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [logout]);

  return null;
}
