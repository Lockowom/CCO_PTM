import { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase';

// Versión con la que se compiló este bundle (inyectada por Vite desde package.json).
const CURRENT = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : null;
const CURRENT_BUILD_ID = typeof __APP_BUILD_ID__ !== 'undefined' ? __APP_BUILD_ID__ : CURRENT;
const HARD_REFRESH_MARKER = '__cco_hard_refresh_target__';
const FORCE_REFRESH_MARKER = '__cco_force_refresh_token__';

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
// Consulta /version.json (emitido por Vite para el sitio estático) al montar,
// cada 120 s y al volver el foco. Si difiere del build de este bundle, significa
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
    let lastCheckAt = 0;
    const check = async () => {
      if (firing.current || !CURRENT_BUILD_ID || document.visibilityState === 'hidden') return;
      const now = Date.now();
      // focus y visibilitychange suelen llegar juntos; una consulta es suficiente.
      if (now - lastCheckAt < 30000) return;
      lastCheckAt = now;
      try {
        const [versionRes, controlResult] = await Promise.all([
          fetch('/version.json', { cache: 'no-store' }),
          // This table exposes only a random token and timestamp, never user data.
          supabase.from('app_runtime_control').select('force_token').eq('id', true).maybeSingle()
        ]);
        if (!versionRes.ok) return;
        const { version, buildId } = await versionRes.json();
        const targetBuildId = buildId || version || null;
        const forceToken = controlResult?.data?.force_token || null;
        let forceRefresh = false;
        if (forceToken) {
          const previousToken = localStorage.getItem(FORCE_REFRESH_MARKER);
          if (!previousToken) localStorage.setItem(FORCE_REFRESH_MARKER, forceToken);
          else if (previousToken !== forceToken) forceRefresh = true;
        }
        if (!alive || (!forceRefresh && (!targetBuildId || targetBuildId === CURRENT_BUILD_ID))) {
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
        if (forceRefresh) {
          try {
            localStorage.setItem(FORCE_REFRESH_MARKER, forceToken);
          } catch {
            /* ignore */
          }
        }
        try {
          if (userRef.current) await logout();
        } catch {
          /* ignore */
        }
        await hardRefreshToBuild(forceRefresh ? `force-${forceToken}` : targetBuildId);
      } catch {
        /* offline/red: reintenta en el próximo tick */
      }
    };
    check();
    const t = setInterval(check, 120000);
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
