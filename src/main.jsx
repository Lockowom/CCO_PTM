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

const queryClient = new QueryClient();

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