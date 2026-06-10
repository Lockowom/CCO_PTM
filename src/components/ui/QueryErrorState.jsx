import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

/**
 * Estado de error + "Reintentar" para consultas (React Query) que fallaron o
 * vencieron por timeout. Evita que la pantalla quede en blanco (o el spinner
 * girando) cuando una carga no resuelve: muestra el mensaje localizado y un
 * botón para volver a intentar.
 *
 * @param {Error|{message?:string}} props.error  El error capturado.
 * @param {() => void} props.onRetry             Normalmente `refetch` de useQuery.
 * @param {string} [props.className]             Clases extra para el contenedor.
 */
const QueryErrorState = ({ error, onRetry, className = '' }) => {
  const message =
    error?.message ||
    'No se pudieron cargar los datos. Revisa tu conexión e inténtalo de nuevo.';

  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 py-12 px-4 text-center ${className}`}
      role="alert"
    >
      <AlertCircle className="text-rose-500" size={36} />
      <p className="text-sm font-medium text-slate-600 max-w-md">{message}</p>
      {onRetry && (
        <button
          onClick={() => onRetry()}
          className="mt-1 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 text-white text-sm font-bold hover:bg-slate-700 transition-colors"
        >
          <RefreshCw size={16} /> Reintentar
        </button>
      )}
    </div>
  );
};

export default QueryErrorState;
