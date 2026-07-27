import { AlertTriangle, RefreshCw, Inbox } from 'lucide-react';

// Estados unificados para listas/tablas de las pantallas de administración:
//   - Cargando  → skeleton (usa .pda-skeleton de index.css), no un texto pelado.
//   - Error     → mensaje + botón Reintentar (antes los errores se tragaban y
//                 se veían como "sin datos").
//   - Vacío     → estado vacío explícito.

export function ListaSkeleton({ filas = 5 }) {
  return (
    <div className="divide-y divide-slate-100" aria-busy="true" aria-label="Cargando">
      {Array.from({ length: filas }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3">
          <div className="w-9 h-9 rounded-xl pda-skeleton shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-2/5 rounded pda-skeleton" />
            <div className="h-2.5 w-3/5 rounded pda-skeleton" />
          </div>
          <div className="h-6 w-16 rounded-lg pda-skeleton shrink-0" />
        </div>
      ))}
    </div>
  );
}

export function ListaError({ mensaje, onRetry }) {
  return (
    <div className="py-12 text-center px-4">
      <AlertTriangle size={28} className="mx-auto text-red-400 mb-2" />
      <p className="text-slate-600 text-sm font-bold">No se pudo cargar</p>
      {mensaje && (
        <p className="text-slate-400 text-[12px] mt-0.5 max-w-md mx-auto break-words">{mensaje}</p>
      )}
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-600 hover:bg-slate-50"
        >
          <RefreshCw size={14} /> Reintentar
        </button>
      )}
    </div>
  );
}

export function ListaVacia({ children }) {
  return (
    <div className="py-12 text-center text-slate-400 text-sm px-4 flex flex-col items-center gap-2">
      <Inbox size={26} className="text-slate-300" />
      <span>{children}</span>
    </div>
  );
}
