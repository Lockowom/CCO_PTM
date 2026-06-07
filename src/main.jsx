import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './context/AuthContext.jsx'
import { ConfigProvider } from './context/ConfigContext.jsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { initSentry } from './lib/sentry'
import { validateEnv } from './lib/env'

// Validar variables de entorno críticas antes de hacer nada
validateEnv();

// Inicializar Sentry (Monitoreo de Errores)
initSentry();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,       // 2 min — los datos se consideran frescos
      gcTime: 1000 * 60 * 10,          // 10 min en caché antes de GC
      refetchOnWindowFocus: false,      // No refetch al volver a la pestaña
      refetchOnReconnect: true,         // Revalida SOLO queries stale al reconectar
                                        // (evita la tormenta de 'always' refrescando todo)
      networkMode: 'online',            // Falla rápido offline → surge error en vez de quedar en pausa
      retry: 1,                         // 1 reintento (no 3 por defecto)
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000), // backoff acotado (máx 8s)
    },
  },
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
  </React.StrictMode>,
)