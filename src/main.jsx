import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './context/AuthContext.jsx';
import { ConfigProvider } from './context/ConfigContext.jsx';
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { initSentry } from './lib/sentry';
import { validateEnv } from './lib/env';
import { installGlobalErrorHandlers, Logger, setLoggerAppContext } from './lib/logger';
import { initGoogleAnalytics } from './lib/googleAnalytics';

// Validar variables de entorno críticas antes de hacer nada
validateEnv();

// Inicializar Sentry (Monitoreo de Errores)
initSentry();
initGoogleAnalytics();
installGlobalErrorHandlers();
setLoggerAppContext({
  appVersion: typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'dev',
  buildNumber: typeof __APP_BUILD_ID__ !== 'undefined' ? __APP_BUILD_ID__ : 'dev',
  commitSha: typeof __APP_BUILD_ID__ !== 'undefined' ? __APP_BUILD_ID__ : ''
});

// React Query cancela peticiones al desmontar una pantalla o reemplazarlas por
// una más reciente. No es un fallo de negocio ni debe materializar una alerta.
const isExpectedQueryCancellation = (error) => {
  const text = String(error?.message || error?.details || error || '').toLowerCase();
  return (
    error?.name === 'AbortError' ||
    text.includes('request was aborted') ||
    text.includes('signal is aborted') ||
    text.includes('aborterror')
  );
};

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (isExpectedQueryCancellation(error)) return;
      Logger.error(error, {
        kind: 'query',
        module: 'react-query',
        screen: document.title || '',
        action: 'query_error',
        message: `Query fallo: ${Array.isArray(query.queryKey) ? query.queryKey.join('.') : 'unknown'}`,
        context: {
          queryKey: query.queryKey,
          meta: query.meta || null,
          error:
            error && typeof error === 'object'
              ? {
                  message: error.message || '',
                  code: error.code || '',
                  details: error.details || '',
                  hint: error.hint || '',
                  name: error.name || ''
                }
              : String(error ?? '')
        }
      });
    }
  }),
  mutationCache: new MutationCache({
    onError: (error, variables, _context, mutation) => {
      Logger.error(error, {
        kind: 'mutation',
        module: 'react-query',
        screen: document.title || '',
        action: 'mutation_error',
        message: `Mutacion fallo: ${Array.isArray(mutation.options.mutationKey) ? mutation.options.mutationKey.join('.') : 'unknown'}`,
        payload: variables,
        context: {
          mutationKey: mutation.options.mutationKey || null,
          meta: mutation.meta || null,
          error:
            error && typeof error === 'object'
              ? {
                  message: error.message || '',
                  code: error.code || '',
                  details: error.details || '',
                  hint: error.hint || '',
                  name: error.name || ''
                }
              : String(error ?? '')
        }
      });
    }
  }),
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 min — los datos se consideran frescos
      gcTime: 1000 * 60 * 10, // 10 min en caché antes de GC
      refetchOnWindowFocus: false, // No refetch al volver a la pestaña
      refetchOnReconnect: true, // Revalida SOLO queries stale al reconectar
      // (evita la tormenta de 'always' refrescando todo)
      networkMode: 'online', // Falla rápido offline → surge error en vez de quedar en pausa
      retry: 1, // 1 reintento (no 3 por defecto)
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000) // backoff acotado (máx 8s)
    }
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ConfigProvider>
          <App />
        </ConfigProvider>
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
