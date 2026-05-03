# 📚 GUÍA DE IMPLEMENTACIÓN DE MEJORAS - CCO WMS

## 📑 Tabla de Contenidos
1. [Mejora 1: Code Splitting](#mejora-1-code-splitting)
2. [Mejora 2: Optimizar Imágenes](#mejora-2-optimizar-imágenes)
3. [Mejora 3: Implementar Caché](#mejora-3-implementar-caché)
4. [Mejora 4: Mejorar Accesibilidad](#mejora-4-mejorar-accesibilidad)
5. [Mejora 5: Agregar Monitoreo](#mejora-5-agregar-monitoreo)

---

## 🚀 Mejora 1: Code Splitting

### Objetivo
Reducir el tiempo de carga inicial (TTI) de 5.1s a 2.8s mediante lazy loading de rutas y contextos.

### Paso 1: Instalar Dependencias
```bash
npm install react-lazy-load-image-component
```

### Paso 2: Modificar vite.config.js
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui': ['lucide-react', 'sonner'],
          'supabase': ['@supabase/supabase-js'],
          'charts': ['recharts'],
        }
      }
    },
    chunkSizeWarningLimit: 1000,
  }
})
```

### Paso 3: Lazy Load de Rutas en App.jsx
```javascript
import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

// Lazy load de páginas
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Analytics = lazy(() => import('./pages/Analytics/Analytics'))
const RoutePlanning = lazy(() => import('./pages/TMS/RoutePlanning'))
const Inventory = lazy(() => import('./pages/Inventory/Inventory'))
const Users = lazy(() => import('./pages/Admin/Users'))

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin">
      <Loader size={40} />
    </div>
  </div>
)

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/route-planning" element={<RoutePlanning />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/users" element={<Users />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
```

### Paso 4: Lazy Load de Contextos
```javascript
// src/main.jsx
import { lazy, Suspense } from 'react'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './context/AuthContext.jsx'

// Lazy load de contextos no críticos
const ConfigProvider = lazy(() => import('./context/ConfigContext.jsx'))
const QueryClientProvider = lazy(() => import('@tanstack/react-query').then(m => ({ default: m.QueryClientProvider })))

export default function Root() {
  return (
    <AuthProvider>
      <Suspense fallback={<div>Cargando...</div>}>
        <ConfigProvider>
          <App />
        </ConfigProvider>
      </Suspense>
    </AuthProvider>
  )
}
```

### Paso 5: Verificar Mejora
```bash
npm run build
# Revisar tamaño de chunks en dist/
# Esperado: Múltiples archivos .js en lugar de uno grande
```

### Resultado Esperado
- Bundle inicial: 450 KB → 280 KB (38% reducción)
- TTI: 5.1s → 2.8s (45% mejora)
- Tiempo de implementación: 2-3 días

---

## 🖼️ Mejora 2: Optimizar Imágenes

### Objetivo
Reducir tamaño de imágenes de 85 KB a 25 KB mediante WebP y lazy loading.

### Paso 1: Instalar Herramientas
```bash
npm install sharp vite-plugin-compression
```

### Paso 2: Crear Script de Conversión
```javascript
// scripts/optimize-images.js
import sharp from 'sharp'
import fs from 'fs'
import path from 'path'

const imageDir = './public/images'
const outputDir = './public/images/optimized'

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
}

fs.readdirSync(imageDir).forEach(file => {
  if (!['.png', '.jpg', '.jpeg'].includes(path.extname(file).toLowerCase())) {
    return
  }

  const inputPath = path.join(imageDir, file)
  const outputPath = path.join(outputDir, `${path.parse(file).name}.webp`)

  sharp(inputPath)
    .webp({ quality: 80 })
    .toFile(outputPath)
    .then(() => {
      console.log(`✓ Optimizado: ${file}`)
    })
    .catch(err => {
      console.error(`✗ Error: ${file}`, err)
    })
})
```

### Paso 3: Agregar Script a package.json
```json
{
  "scripts": {
    "optimize-images": "node scripts/optimize-images.js"
  }
}
```

### Paso 4: Ejecutar Optimización
```bash
npm run optimize-images
```

### Paso 5: Actualizar Componentes
```javascript
// ❌ ANTES
<img src="https://i.imgur.com/YJh67CY.png" alt="Logo" />

// ✅ DESPUÉS
<picture>
  <source srcSet="/images/optimized/logo.webp" type="image/webp" />
  <img 
    src="/images/logo.png" 
    alt="Logo"
    loading="lazy"
    decoding="async"
    className="w-full h-full"
  />
</picture>
```

### Paso 6: Crear Componente Reutilizable
```javascript
// src/components/OptimizedImage.jsx
export const OptimizedImage = ({ src, alt, className, ...props }) => {
  const baseName = src.split('/').pop().split('.')[0]
  
  return (
    <picture>
      <source 
        srcSet={`/images/optimized/${baseName}.webp`} 
        type="image/webp" 
      />
      <img 
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        className={className}
        {...props}
      />
    </picture>
  )
}

// Uso
<OptimizedImage 
  src="/images/logo.png" 
  alt="Logo"
  className="w-full h-full"
/>
```

### Resultado Esperado
- Tamaño de imágenes: 85 KB → 25 KB (70% reducción)
- Tiempo de implementación: 1 día

---

## 💾 Mejora 3: Implementar Caché

### Objetivo
Implementar caché con Service Worker e IndexedDB para funcionar offline.

### Paso 1: Crear Service Worker Mejorado
```javascript
// public/sw.js
const CACHE_NAME = 'cco-wms-v1'
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/assets/main.js',
  '/assets/main.css',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache)
    })
  )
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response
      }

      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response
        }

        const responseToCache = response.clone()
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache)
        })

        return response
      })
    })
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
})
```

### Paso 2: Instalar Dexie para IndexedDB
```bash
npm install dexie
```

### Paso 3: Crear Database Service
```javascript
// src/services/db.js
import Dexie from 'dexie'

export const db = new Dexie('CCO_WMS')

db.version(1).stores({
  nv_diarias: '++id, estado, fecha',
  inventory: '++id, sku, almacen',
  usuarios: '++id, email',
  rutas: '++id, estado, fecha',
  picking: '++id, nv_id, estado',
})

// Funciones de caché
export const cacheData = async (table, data) => {
  try {
    await db[table].bulkPut(data)
  } catch (error) {
    console.error(`Error caching ${table}:`, error)
  }
}

export const getCachedData = async (table) => {
  try {
    return await db[table].toArray()
  } catch (error) {
    console.error(`Error getting cached ${table}:`, error)
    return []
  }
}

export const clearCache = async (table) => {
  try {
    await db[table].clear()
  } catch (error) {
    console.error(`Error clearing ${table}:`, error)
  }
}
```

### Paso 4: Integrar Caché en Servicios
```javascript
// src/services/dashboardService.js
import { supabase } from '../lib/supabase'
import { cacheData, getCachedData } from './db'

export const fetchDashboardData = async () => {
  try {
    // Intentar obtener de Supabase
    const { data, error } = await supabase
      .from('nv_diarias')
      .select('*')
      .limit(100)

    if (error) throw error

    // Cachear datos
    await cacheData('nv_diarias', data)
    return data
  } catch (error) {
    console.error('Error fetching dashboard:', error)
    // Fallback a caché
    return await getCachedData('nv_diarias')
  }
}
```

### Paso 5: Usar en Componentes
```javascript
// src/pages/Dashboard.jsx
import { useEffect, useState } from 'react'
import { fetchDashboardData } from '../services/dashboardService'

export default function Dashboard() {
  const [data, setData] = useState([])
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  useEffect(() => {
    fetchDashboardData().then(setData)
  }, [])

  return (
    <div>
      {!isOnline && (
        <div className="bg-amber-100 text-amber-800 p-4 rounded mb-4">
          ⚠️ Modo offline - Mostrando datos en caché
        </div>
      )}
      {/* Contenido */}
    </div>
  )
}
```

### Resultado Esperado
- Funciona offline: ✅
- Caché inteligente: ✅
- Tiempo de implementación: 2-3 días

---

## ♿ Mejora 4: Mejorar Accesibilidad

### Objetivo
Aumentar contraste y tamaño de elementos para cumplir WCAG AAA.

### Paso 1: Actualizar Tailwind Config
```javascript
// tailwind.config.js
export default {
  theme: {
    extend: {
      colors: {
        // Aumentar contraste
        slate: {
          600: '#475569', // Más oscuro que antes
          700: '#334155',
        },
      },
      minHeight: {
        touch: '48px', // Tamaño mínimo para tocar
      },
      minWidth: {
        touch: '48px',
      },
    },
  },
}
```

### Paso 2: Crear Componentes Accesibles
```javascript
// src/components/Button.jsx
export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  ...props 
}) => {
  const baseClasses = 'font-bold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2'
  
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm min-h-[40px] min-w-[40px]',
    md: 'px-4 py-3 text-base min-h-[48px] min-w-[48px]',
    lg: 'px-6 py-4 text-lg min-h-[56px] min-w-[56px]',
  }

  const variantClasses = {
    primary: 'bg-orange-500 hover:bg-orange-600 text-white focus:ring-orange-500',
    secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-900 focus:ring-slate-500',
    danger: 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-500',
  }

  return (
    <button 
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]}`}
      {...props}
    >
      {children}
    </button>
  )
}
```

### Paso 3: Actualizar Componentes Existentes
```javascript
// ❌ ANTES
<button className="p-2 text-slate-400">
  <LogOut size={20} />
</button>

// ✅ DESPUÉS
<button 
  className="p-3 text-slate-600 hover:text-slate-700 min-h-[48px] min-w-[48px] focus:outline-none focus:ring-2 focus:ring-orange-500 rounded"
  aria-label="Cerrar sesión"
  title="Cerrar sesión"
>
  <LogOut size={20} />
</button>
```

### Paso 4: Agregar ARIA Labels
```javascript
// src/components/Navbar.jsx
<nav aria-label="Navegación principal">
  <ul role="menubar">
    {menuItems.map(item => (
      <li key={item.id} role="none">
        <a 
          href={item.href}
          role="menuitem"
          aria-current={isActive ? 'page' : undefined}
        >
          {item.label}
        </a>
      </li>
    ))}
  </ul>
</nav>
```

### Paso 5: Verificar Contraste
```bash
# Usar herramienta online
# https://webaim.org/resources/contrastchecker/

# O instalar localmente
npm install axe-core
```

### Resultado Esperado
- Contraste: 4.5:1 → 7:1 (WCAG AAA)
- Tamaño de botones: 32x32 → 48x48 px
- Lighthouse Accessibility: 85 → 95
- Tiempo de implementación: 1-2 días

---

## 📊 Mejora 5: Agregar Monitoreo

### Objetivo
Implementar Sentry para monitoreo de errores en producción.

### Paso 1: Instalar Sentry
```bash
npm install @sentry/react @sentry/tracing
```

### Paso 2: Configurar Sentry
```javascript
// src/main.jsx
import * as Sentry from "@sentry/react"
import { BrowserTracing } from "@sentry/tracing"

Sentry.init({
  dsn: "https://YOUR_DSN@sentry.io/PROJECT_ID",
  integrations: [
    new BrowserTracing(),
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  environment: import.meta.env.MODE,
})
```

### Paso 3: Crear Error Boundary
```javascript
// src/components/ErrorBoundary.jsx
import * as Sentry from "@sentry/react"

const ErrorFallback = ({ error, resetError }) => (
  <div className="flex flex-col items-center justify-center h-screen bg-slate-50">
    <div className="text-center">
      <h1 className="text-3xl font-bold text-red-600 mb-4">
        Algo salió mal
      </h1>
      <p className="text-slate-600 mb-6">
        {error?.message || 'Error desconocido'}
      </p>
      <button
        onClick={resetError}
        className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
      >
        Intentar de nuevo
      </button>
    </div>
  </div>
)

export const ErrorBoundary = Sentry.withErrorBoundary(
  ({ children }) => children,
  { fallback: ErrorFallback }
)
```

### Paso 4: Usar en App
```javascript
// src/App.jsx
import { ErrorBoundary } from './components/ErrorBoundary'

export default function App() {
  return (
    <ErrorBoundary>
      {/* Contenido */}
    </ErrorBoundary>
  )
}
```

### Paso 5: Capturar Errores Manuales
```javascript
// En servicios o componentes
import * as Sentry from "@sentry/react"

try {
  await fetchData()
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      section: 'dashboard',
      action: 'fetch_data',
    },
  })
}
```

### Resultado Esperado
- Monitoreo de errores: ✅
- Trazas de performance: ✅
- Sesiones de usuario: ✅
- Tiempo de implementación: 1 día

---

## 📋 Checklist de Implementación

### Fase 1: Crítica (Semana 1-2)
- [ ] Code Splitting (2-3 días)
- [ ] Optimizar Imágenes (1 día)
- [ ] Implementar Caché (2-3 días)
- [ ] Mejorar Accesibilidad (1-2 días)

### Fase 2: Alta (Semana 3-4)
- [ ] Agregar Monitoreo (1 día)
- [ ] Implementar 2FA (3-4 días)
- [ ] Virtualización de Listas (2-3 días)
- [ ] Refactorizar Contextos (3-4 días)

### Fase 3: Media (Semana 5-6)
- [ ] Implementar Zustand (2-3 días)
- [ ] Agregar Tests (5-7 días)
- [ ] Documentar API (2-3 días)

---

**Última actualización:** Mayo 2026
**Versión:** 1.0.0
**Estado:** ✅ Guía Completa


---

## 🔐 Mejora 6: Implementar 2FA (Two-Factor Authentication)

### Objetivo
Agregar autenticación de dos factores para mayor seguridad.

### Paso 1: Instalar Dependencias
```bash
npm install speakeasy qrcode.react
```

### Paso 2: Crear Servicio de 2FA
```javascript
// src/services/twoFactorService.js
import speakeasy from 'speakeasy'
import QRCode from 'qrcode.react'
import { supabase } from '../lib/supabase'

export const generateSecret = (email) => {
  return speakeasy.generateSecret({
    name: `CCO WMS (${email})`,
    issuer: 'CCO WMS',
    length: 32,
  })
}

export const verifyToken = (secret, token) => {
  return speakeasy.totp.verify({
    secret: secret,
    encoding: 'base32',
    token: token,
    window: 2,
  })
}

export const enableTwoFactor = async (userId, secret) => {
  const { error } = await supabase
    .from('tms_usuarios')
    .update({
      two_factor_enabled: true,
      two_factor_secret: secret,
    })
    .eq('id', userId)

  if (error) throw error
}

export const disableTwoFactor = async (userId) => {
  const { error } = await supabase
    .from('tms_usuarios')
    .update({
      two_factor_enabled: false,
      two_factor_secret: null,
    })
    .eq('id', userId)

  if (error) throw error
}
```

### Paso 3: Crear Componente de Setup
```javascript
// src/components/TwoFactorSetup.jsx
import { useState } from 'react'
import QRCode from 'qrcode.react'
import { generateSecret, enableTwoFactor, verifyToken } from '../services/twoFactorService'

export const TwoFactorSetup = ({ userId, email, onComplete }) => {
  const [step, setStep] = useState('generate') // generate, verify, complete
  const [secret, setSecret] = useState(null)
  const [token, setToken] = useState('')
  const [backupCodes, setBackupCodes] = useState([])
  const [loading, setLoading] = useState(false)

  const handleGenerate = () => {
    const newSecret = generateSecret(email)
    setSecret(newSecret)
    setStep('verify')
  }

  const handleVerify = async () => {
    setLoading(true)
    try {
      if (!verifyToken(secret.base32, token)) {
        throw new Error('Código inválido')
      }

      // Generar códigos de recuperación
      const codes = Array.from({ length: 10 }, () =>
        Math.random().toString(36).substring(2, 10).toUpperCase()
      )
      setBackupCodes(codes)

      // Guardar en BD
      await enableTwoFactor(userId, secret.base32)
      setStep('complete')
    } catch (error) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg border">
      {step === 'generate' && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Configurar 2FA</h2>
          <p className="text-slate-600">
            Escanea este código QR con tu aplicación de autenticación
          </p>
          <button
            onClick={handleGenerate}
            className="w-full py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
          >
            Generar Código QR
          </button>
        </div>
      )}

      {step === 'verify' && secret && (
        <div className="space-y-4">
          <div className="flex justify-center">
            <QRCode value={secret.otpauth_url} size={200} />
          </div>
          <p className="text-sm text-slate-600 text-center">
            O ingresa manualmente: {secret.base32}
          </p>
          <input
            type="text"
            placeholder="Código de 6 dígitos"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            maxLength="6"
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <button
            onClick={handleVerify}
            disabled={loading || token.length !== 6}
            className="w-full py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
          >
            {loading ? 'Verificando...' : 'Verificar'}
          </button>
        </div>
      )}

      {step === 'complete' && (
        <div className="space-y-4">
          <h3 className="font-bold text-green-600">✓ 2FA Activado</h3>
          <p className="text-sm text-slate-600">
            Guarda estos códigos de recuperación en un lugar seguro:
          </p>
          <div className="bg-slate-50 p-4 rounded space-y-1">
            {backupCodes.map((code, i) => (
              <code key={i} className="block text-sm font-mono">
                {code}
              </code>
            ))}
          </div>
          <button
            onClick={onComplete}
            className="w-full py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
          >
            Completado
          </button>
        </div>
      )}
    </div>
  )
}
```

### Paso 4: Integrar en Login
```javascript
// src/pages/Login.jsx
import { useState } from 'react'
import { verifyToken } from '../services/twoFactorService'

export default function Login() {
  const [step, setStep] = useState('credentials') // credentials, 2fa
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [token, setToken] = useState('')
  const [user2FA, setUser2FA] = useState(null)

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      // Verificar si tiene 2FA
      const { data: userData } = await supabase
        .from('tms_usuarios')
        .select('two_factor_enabled, two_factor_secret')
        .eq('id', data.user.id)
        .single()

      if (userData?.two_factor_enabled) {
        setUser2FA(data.user)
        setStep('2fa')
      } else {
        // Login exitoso sin 2FA
        window.location.href = '/dashboard'
      }
    } catch (error) {
      alert(error.message)
    }
  }

  const handleVerify2FA = async (e) => {
    e.preventDefault()
    try {
      const { data: userData } = await supabase
        .from('tms_usuarios')
        .select('two_factor_secret')
        .eq('id', user2FA.id)
        .single()

      if (!verifyToken(userData.two_factor_secret, token)) {
        throw new Error('Código 2FA inválido')
      }

      // Login exitoso con 2FA
      window.location.href = '/dashboard'
    } catch (error) {
      alert(error.message)
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      {step === 'credentials' && (
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded"
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded"
          />
          <button
            type="submit"
            className="w-full py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
          >
            Iniciar Sesión
          </button>
        </form>
      )}

      {step === '2fa' && (
        <form onSubmit={handleVerify2FA} className="space-y-4">
          <h2 className="text-xl font-bold">Verificación 2FA</h2>
          <input
            type="text"
            placeholder="Código de 6 dígitos"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            maxLength="6"
            className="w-full px-4 py-2 border rounded"
          />
          <button
            type="submit"
            className="w-full py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
          >
            Verificar
          </button>
        </form>
      )}
    </div>
  )
}
```

### Resultado Esperado
- 2FA implementado: ✅
- Códigos de recuperación: ✅
- Tiempo de implementación: 3-4 días

---

## 📊 Mejora 7: Virtualización de Listas

### Objetivo
Optimizar listas largas (>100 items) con virtualización.

### Paso 1: Instalar react-window
```bash
npm install react-window
```

### Paso 2: Crear Componente Virtualizado
```javascript
// src/components/VirtualizedList.jsx
import { FixedSizeList as List } from 'react-window'

export const VirtualizedList = ({ 
  items, 
  itemHeight = 50, 
  height = 600,
  renderItem,
}) => {
  const Row = ({ index, style }) => (
    <div style={style}>
      {renderItem(items[index], index)}
    </div>
  )

  return (
    <List
      height={height}
      itemCount={items.length}
      itemSize={itemHeight}
      width="100%"
    >
      {Row}
    </List>
  )
}
```

### Paso 3: Usar en Tablas
```javascript
// src/pages/Inventory/Inventory.jsx
import { VirtualizedList } from '../../components/VirtualizedList'

export default function Inventory() {
  const [items, setItems] = useState([])

  const renderRow = (item) => (
    <div className="flex gap-4 px-4 py-2 border-b">
      <div className="flex-1">{item.sku}</div>
      <div className="flex-1">{item.nombre}</div>
      <div className="flex-1">{item.cantidad}</div>
      <div className="flex-1">{item.almacen}</div>
    </div>
  )

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Inventario</h1>
      <VirtualizedList
        items={items}
        itemHeight={50}
        height={600}
        renderItem={renderRow}
      />
    </div>
  )
}
```

### Resultado Esperado
- Scroll suave con 10,000+ items: ✅
- Mejor performance: ✅
- Tiempo de implementación: 2-3 días

---

## 🏗️ Mejora 8: Refactorizar Contextos

### Objetivo
Separar responsabilidades en múltiples contextos más pequeños.

### Paso 1: Crear AuthContext Simplificado
```javascript
// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => subscription?.unsubscribe()
  }, [])

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    return data
  }

  const logout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }
  return context
}
```

### Paso 2: Crear PermissionsContext
```javascript
// src/context/PermissionsContext.jsx
import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

const PermissionsContext = createContext()

export const PermissionsProvider = ({ children }) => {
  const { user } = useAuth()
  const [permissions, setPermissions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setPermissions([])
      setLoading(false)
      return
    }

    const fetchPermissions = async () => {
      try {
        const { data, error } = await supabase
          .from('tms_permisos')
          .select('*')
          .eq('usuario_id', user.id)

        if (error) throw error
        setPermissions(data || [])
      } catch (error) {
        console.error('Error fetching permissions:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPermissions()
  }, [user])

  const hasPermission = (permission) => {
    return permissions.some(p => p.nombre === permission)
  }

  return (
    <PermissionsContext.Provider value={{ permissions, loading, hasPermission }}>
      {children}
    </PermissionsContext.Provider>
  )
}

export const usePermissions = () => {
  const context = useContext(PermissionsContext)
  if (!context) {
    throw new Error('usePermissions debe usarse dentro de PermissionsProvider')
  }
  return context
}
```

### Paso 3: Crear SessionContext
```javascript
// src/context/SessionContext.jsx
import { createContext, useContext, useEffect } from 'react'
import { useAuth } from './AuthContext'

const SessionContext = createContext()

export const SessionProvider = ({ children }) => {
  const { user, logout } = useAuth()

  // Heartbeat
  useEffect(() => {
    if (!user) return

    const interval = setInterval(async () => {
      try {
        const response = await fetch('/api/heartbeat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id }),
        })

        if (!response.ok) {
          logout()
        }
      } catch (error) {
        console.error('Heartbeat error:', error)
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [user, logout])

  // Session timeout
  useEffect(() => {
    if (!user) return

    let timeout
    const resetTimeout = () => {
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        logout()
      }, 30 * 60 * 1000) // 30 minutos
    }

    window.addEventListener('mousemove', resetTimeout)
    window.addEventListener('keypress', resetTimeout)

    resetTimeout()

    return () => {
      window.removeEventListener('mousemove', resetTimeout)
      window.removeEventListener('keypress', resetTimeout)
      clearTimeout(timeout)
    }
  }, [user, logout])

  return <>{children}</>
}
```

### Paso 4: Actualizar App.jsx
```javascript
// src/App.jsx
import { AuthProvider } from './context/AuthContext'
import { PermissionsProvider } from './context/PermissionsContext'
import { SessionProvider } from './context/SessionContext'

export default function App() {
  return (
    <AuthProvider>
      <PermissionsProvider>
        <SessionProvider>
          {/* Contenido */}
        </SessionProvider>
      </PermissionsProvider>
    </AuthProvider>
  )
}
```

### Resultado Esperado
- Contextos separados: ✅
- Código más mantenible: ✅
- Mejor performance: ✅
- Tiempo de implementación: 3-4 días

---

## 📈 Resumen de Mejoras Implementadas

| Mejora | Impacto | Esfuerzo | Tiempo | Estado |
|--------|---------|----------|--------|--------|
| Code Splitting | Alto | Medio | 2-3 días | 📋 Guía |
| Optimizar Imágenes | Alto | Bajo | 1 día | 📋 Guía |
| Implementar Caché | Alto | Medio | 2-3 días | 📋 Guía |
| Mejorar Accesibilidad | Medio | Bajo | 1-2 días | 📋 Guía |
| Agregar Monitoreo | Medio | Bajo | 1 día | 📋 Guía |
| Implementar 2FA | Medio | Alto | 3-4 días | 📋 Guía |
| Virtualización | Medio | Medio | 2-3 días | 📋 Guía |
| Refactorizar Contextos | Bajo | Alto | 3-4 días | 📋 Guía |

---

## 🎯 Próximos Pasos

1. **Selecciona una mejora** de la lista anterior
2. **Sigue los pasos** de la guía correspondiente
3. **Prueba localmente** con `npm run dev`
4. **Verifica mejoras** con herramientas como Lighthouse
5. **Despliega a Android** cuando esté listo

---

**Última actualización:** Mayo 2026
**Versión:** 1.0.0
**Estado:** ✅ Guía Completa con 8 Mejoras
