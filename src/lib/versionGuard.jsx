import { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

// Versión con la que se compiló este bundle (inyectada por Vite desde package.json).
const CURRENT = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : null;
const CURRENT_BUILD_ID = typeof __APP_BUILD_ID__ !== 'undefined' ? __APP_BUILD_ID__ : CURRENT;
const HARD_REFRESH_MARKER = '__cco_hard_refresh_target__';

async function hardRefreshToBuild(targetBuildId) {
  try {
    sessionStorage.setItem(HARD_REFRESH_MARKER, String(targetBuildId || 'unknown'));
  } catch {
    /* ignore */
  }

  try {
    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.allSettled(
        regs.map(async (registration) => {
          try {
            await registration.update();
          } catch {
            /* ignore */
          }
          try {
            await registration.unregister();
          } catch {
            /* ignore */
          }
        })
      );
    }
  } catch {
    /* ignore */
  }

  try {
    if (typeof caches !== 'undefined') {
      const keys = await caches.keys();
      await Promise.allSettled(keys.map((key) => caches.delete(key)));
    }
  } catch {
    /* ignore */
  }

  try {
    const url = new URL(window.location.href);
    url.searchParams.set('__cv', String(targetBuildId || Date.now()));
    window.location.replace(url.toString());
    return;
  } catch {
    /* ignore */
  }

  window.location.reload();
}

// VersionGuard — "al actualizar, obliga a re-loguear" (igual que el Panel).
// Consulta /api/version (la versión DESPLEGADA en el servidor) al montar, cada
// 60 s y al volver el foco. Si difiere de la versión de este bundle, significa
// que hay un deploy nuevo → cierra la sesión (si hay) y recarga para traer el
// bundle nuevo, dejando al usuario en el login.
export default function VersionGuard() {
  const { user, logout } = useAuth();
  const firing = useRef(false);
  const userRef = useRef(user);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    let alive = true;
    const check = async () => {
      if (firing.current || !CURRENT_BUILD_ID) return;
      try {
        const res = await fetch('/api/version', { cache: 'no-store' });
        if (!res.ok) return;
        const { version, buildId } = await res.json();
        const targetBuildId = buildId || version || null;
        if (!alive || !targetBuildId || targetBuildId === CURRENT_BUILD_ID) {
          try {
            const lastForced = sessionStorage.getItem(HARD_REFRESH_MARKER);
            if (lastForced && lastForced === CURRENT_BUILD_ID) {
              sessionStorage.removeItem(HARD_REFRESH_MARKER);
              const url = new URL(window.location.href);
              if (url.searchParams.has('__cv')) {
                url.searchParams.delete('__cv');
                window.history.replaceState({}, '', url.toString());
              }
            }
          } catch {
            /* ignore */
          }
          return;
        }
        firing.current = true;
        try {
          if (userRef.current) await logout();
        } catch {
          /* ignore */
        }
        await hardRefreshToBuild(targetBuildId);
      } catch {
        /* offline/red: reintenta en el próximo tick */
      }
    };
    check();
    const t = setInterval(check, 60000);
    const onVis = () => {
      if (document.visibilityState === 'visible') check();
    };
    window.addEventListener('focus', check);
    document.addEventListener('visibilitychange', onVis);
    return () => {
      alive = false;
      clearInterval(t);
      window.removeEventListener('focus', check);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [logout]);

  return null;
}
