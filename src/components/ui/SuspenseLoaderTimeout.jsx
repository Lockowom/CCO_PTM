import { useEffect, useState } from 'react';

/**
 * Fallback de Suspense con escape de seguridad. Si tras `timeoutMs` (15s) el
 * chunk lazy sigue sin cargar (descarga colgada, red caída) — caso que el
 * ErrorBoundary NO atrapa porque no es un error de render — cambia el spinner
 * por un aviso + botón "Recargar". Evita el spinner infinito al abrir un módulo.
 */
const SuspenseLoaderTimeout = ({ timeoutMs = 15000 }) => {
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setTimedOut(true), timeoutMs);
    return () => clearTimeout(t);
  }, [timeoutMs]);

  if (timedOut) {
    return (
      <div className="min-h-dvh bg-slate-950 flex flex-col items-center justify-center px-6 text-center">
        <h2 className="text-orange-400 font-black tracking-[0.15em] uppercase text-sm mb-2">
          La página tardó demasiado en cargar
        </h2>
        <p className="text-slate-400 text-xs mb-5 max-w-sm">
          Revisa tu conexión. Si el problema persiste, recarga la aplicación.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-5 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-black hover:bg-orange-400 transition-colors"
        >
          Recargar
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-slate-950 flex flex-col items-center justify-center">
      <div className="relative w-24 h-24 mb-4">
        <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-orange-500 rounded-full border-t-transparent animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 bg-orange-500/20 rounded-full animate-ping"></div>
        </div>
      </div>
      <h2 className="text-orange-400 font-black tracking-[0.2em] uppercase text-sm animate-pulse">
        Inicializando Módulo...
      </h2>
    </div>
  );
};

export default SuspenseLoaderTimeout;
