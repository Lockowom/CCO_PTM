# 📋 DOCUMENTACIÓN TÉCNICA - CCO WMS (Centro de Control Operacional)

## 📑 Tabla de Contenidos
1. [Visión General](#visión-general)
2. [Stack Tecnológico](#stack-tecnológico)
3. [Arquitectura del Proyecto](#arquitectura-del-proyecto)
4. [Componentes Principales](#componentes-principales)
5. [Servicios y Lógica](#servicios-y-lógica)
6. [Contextos y Estado Global](#contextos-y-estado-global)
7. [Rutas y Permisos](#rutas-y-permisos)
8. [Base de Datos](#base-de-datos)
9. [Librerías Utilizadas](#librerías-utilizadas)
10. [Configuración y Deployment](#configuración-y-deployment)

---

## 🎯 Visión General

**CCO WMS** es una aplicación web progresiva (PWA) de gestión de almacén y transporte desarrollada con React. Es un sistema integral que combina:

- **WMS (Warehouse Management System)**: Gestión de inventario, picking, packing, recepción
- **TMS (Transportation Management System)**: Planificación de rutas, gestión de conductores, control de flota
- **Analytics**: Reportes en tiempo real y monitoreo de KPIs
- **Control Operacional**: Auditoría, usuarios, roles y permisos granulares

**Características Clave:**
- ✅ Autenticación y autorización basada en roles
- ✅ Sincronización en tiempo real con Supabase (Realtime)
- ✅ Interfaz responsiva (Mobile, Tablet, Desktop)
- ✅ Soporte offline con PWA
- ✅ Animaciones fluidas con GSAP
- ✅ Mapas interactivos con Leaflet
- ✅ Gráficos y reportes con Recharts

---

## 🛠️ Stack Tecnológico

### Frontend
| Tecnología | Versión | Propósito |
|-----------|---------|----------|
| **React** | 18.2.0 | Framework principal |
| **React Router DOM** | 6.20.0 | Enrutamiento SPA |
| **Vite** | 5.0.0 | Build tool y dev server |
| **Tailwind CSS** | 3.3.5 | Estilos y diseño responsivo |
| **TypeScript** | (Opcional) | Tipado estático |

### Backend & Base de Datos
| Tecnología | Versión | Propósito |
|-----------|---------|----------|
| **Supabase** | - | Backend as a Service (PostgreSQL + Auth) |
| **PostgreSQL** | (Supabase) | Base de datos relacional |
| **Realtime** | (Supabase) | Sincronización en tiempo real |

### Librerías Principales
| Librería | Versión | Propósito |
|----------|---------|----------|
| **@supabase/supabase-js** | 2.98.0 | Cliente Supabase |
| **Axios** | 1.13.5 | HTTP client |
| **GSAP** | 3.14.2 | Animaciones avanzadas |
| **Leaflet** | 1.9.4 | Mapas interactivos |
| **React Leaflet** | 4.2.1 | Componentes React para Leaflet |
| **Recharts** | 3.7.0 | Gráficos y visualización |
| **Lucide React** | 0.294.0 | Iconos SVG |
| **Sonner** | 2.0.7 | Notificaciones toast |
| **date-fns** | 4.1.0 | Manipulación de fechas |

### Mobile & PWA
| Tecnología | Versión | Propósito |
|-----------|---------|----------|
| **Capacitor** | 8.2.0 | Framework para apps nativas |
| **Capacitor Android** | 8.2.0 | Soporte Android |
| **Vite PWA Plugin** | 1.2.0 | Generación de PWA |

### DevDependencies
| Herramienta | Versión | Propósito |
|-----------|---------|----------|
| **@vitejs/plugin-react** | 4.2.0 | Plugin React para Vite |
| **Autoprefixer** | 10.4.16 | Prefijos CSS automáticos |
| **PostCSS** | 8.4.31 | Procesamiento CSS |

---

## 🏗️ Arquitectura del Proyecto

### Estructura de Carpetas

```
src/
├── components/              # Componentes reutilizables
│   ├── Charts/             # Gráficos (AreaChart, BarChart, PieChart)
│   ├── AnimatedPage.jsx    # Wrapper para animaciones de página
│   ├── ErrorReportWidget.jsx # Widget de reporte de errores
│   ├── Layout.jsx          # Layout principal con navbar
│   ├── Navbar.jsx          # Barra de navegación
│   └── Placeholder.jsx     # Componente placeholder
│
├── context/                # Contextos de React (Estado Global)
│   ├── AuthContext.jsx     # Autenticación y permisos
│   └── ConfigContext.jsx   # Configuración de módulos
│
├── hooks/                  # Custom Hooks
│   └── useConductores.js   # Hook para gestión de conductores
│
├── lib/                    # Utilidades y configuración
│   └── supabaseClient.js   # Re-exporta cliente Supabase
│
├── pages/                  # Páginas/Vistas principales
│   ├── Admin/              # Módulo de administración
│   ├── Analytics/          # Reportes y analytics
│   ├── Inbound/            # Recepción y entrada
│   ├── Inventory/          # Gestión de inventario
│   ├── Mobile/             # Aplicaciones móviles
│   ├── Outbound/           # Picking, packing, shipping
│   ├── QualityControl/     # Control de calidad
│   ├── Queries/            # Consultas y reportes
│   ├── TMS/                # Gestión de transporte
│   ├── Dashboard.jsx       # Dashboard principal
│   └── Login.jsx           # Página de login
│
├── services/               # Servicios y lógica de negocio
│   ├── inventoryService.js # Operaciones de inventario
│   ├── labelPrinter.js     # Impresión de etiquetas
│   ├── stressTest.js       # Pruebas de carga
│   └── wmsLogic.js         # Lógica WMS inteligente
│
├── public/                 # Archivos estáticos
│   ├── _redirects          # Configuración de redirecciones
│   └── staticwebapp.config.json # Config de Azure Static Web Apps
│
├── App.jsx                 # Componente raíz con rutas
├── main.jsx                # Punto de entrada
├── index.css               # Estilos globales
└── supabase.js             # Configuración de Supabase

android/                    # Proyecto Android (Capacitor)
├── app/
│   ├── src/main/
│   │   ├── AndroidManifest.xml
│   │   ├── assets/public/  # Archivos compilados de React
│   │   └── java/           # Código Java nativo
│   └── build.gradle
└── ...

public/                     # Archivos públicos (PWA)
├── pwa-192x192.png
├── pwa-512x512.png
├── manifest.webmanifest
└── ...

vite.config.js             # Configuración de Vite
capacitor.config.json      # Configuración de Capacitor
package.json               # Dependencias y scripts
.env.example               # Variables de entorno
```

---

## 🧩 Componentes Principales

### 1. **Layout.jsx** - Contenedor Principal
```javascript
// Propósito: Envuelve todas las páginas protegidas
// Características:
// - Navbar fijo en la parte superior
// - Sistema de notificaciones en tiempo real (Sonner)
// - Suscripción a cambios en BD (N.V., Partidas, Series)
// - Animaciones de transición de página (GSAP)
// - Widget de reporte de errores
```

**Funcionalidades:**
- Escucha cambios en tiempo real de tablas críticas
- Muestra notificaciones toast automáticas
- Anima transiciones entre páginas
- Proporciona contexto global de layout

### 2. **Navbar.jsx** - Navegación Principal
```javascript
// Propósito: Menú de navegación dinámico basado en permisos
// Características:
// - Menú adaptativo (Desktop/Mobile)
// - Validación de permisos por ruta
// - Indicador de conexión online/offline
// - Reloj en tiempo real
// - Información del usuario logueado
```

**Estructura del Menú:**
- TMS (Rutas, Torre de Control, Conductores)
- Dashboard
- Inbound (Recepción, Cubicaje, Devoluciones)
- Outbound (Picking, Packing, Shipping)
- Inventory (Stock, Layout, Transferencias)
- Quality (Inspección)
- Analytics (Reportes, Modo TV)
- Queries (Consultas especializadas)
- Admin (Usuarios, Roles, Configuración)

### 3. **Dashboard.jsx** - Centro de Control
```javascript
// Propósito: Vista principal con KPIs y métricas
// Características:
// - Estadísticas en tiempo real
// - Gráficos de actividad
// - Pipeline visual del flujo operativo
// - Tabla de últimas N.V.
// - Alertas de quiebres y refacturación
```

**KPIs Mostrados:**
- Total de N.V. (Notas de Venta)
- Pendientes de procesar
- En picking
- En packing
- Listos para despacho
- Quiebres de stock
- Refacturaciones

### 4. **Login.jsx** - Autenticación
```javascript
// Propósito: Página de login con validación
// Características:
// - Formulario de email/contraseña
// - Animaciones GSAP
// - Validación de credenciales contra BD
// - Redirección automática si ya está autenticado
```

---

## 🔐 Contextos y Estado Global

### 1. **AuthContext.jsx** - Gestión de Autenticación

**Estado:**
```javascript
{
  user: {
    id: string,
    nombre: string,
    email: string,
    rol: string,
    activo: boolean,
    es_admin_delegado: boolean
  },
  permissions: string[],
  loading: boolean,
  error: string,
  isAuthenticated: boolean
}
```

**Funciones Principales:**
- `login(email, password)` - Autentica usuario
- `logout()` - Cierra sesión
- `hasPermission(permissionId)` - Verifica permiso
- `refreshPermissions()` - Recarga permisos desde BD

**Características Avanzadas:**
- ✅ Heartbeat automático (cada 30s) para marcar usuario como ONLINE
- ✅ Vigilancia de sesión: Detecta si usuario es eliminado o desactivado
- ✅ Suscripción a cambios de roles en tiempo real
- ✅ Persistencia en localStorage
- ✅ Bypass automático para ADMIN

**Tabla de Permisos:**
```
view_dashboard, view_reports, view_kpis
view_routes, create_routes, view_control_tower, manage_control_tower
view_drivers, manage_drivers, view_mobile_app, use_mobile_app
view_reception, process_reception, view_entry, process_entry
view_returns, view_picking, process_picking
view_packing, process_packing, view_packing_tv
view_shipping, process_shipping, view_deliveries, process_deliveries
view_stock, manage_stock, manage_inventory
view_layout, manage_layout
view_transfers, manage_transfers
view_cycle_count, view_quality, process_quality
view_batches, view_sales_status, view_addresses, view_locations
view_historial_nv, view_dispatch_control, view_kardex, view_productivity
manage_users, view_users, manage_roles, view_roles
manage_views, view_views, manage_mediciones, view_mediciones
manage_reports, view_time_reports, manage_tickets
manage_cleanup, admin_upload_history
```

### 2. **ConfigContext.jsx** - Configuración de Módulos

**Estado:**
```javascript
{
  modulesConfig: {
    [moduleId]: boolean  // true = habilitado, false = deshabilitado
  },
  loading: boolean
}
```

**Funciones Principales:**
- `isModuleEnabled(moduleId)` - Verifica si módulo está habilitado
- `refreshConfig()` - Recarga configuración desde BD

**Módulos Configurables:**
- tms, dashboard, inbound, outbound, inventory, quality, analytics, queries, admin

---

## 🛣️ Rutas y Permisos

### Mapeo de Rutas a Permisos

```javascript
ROUTE_PERMISSIONS = {
  '/dashboard': ['view_dashboard'],
  '/tms/planning': ['view_routes', 'create_routes'],
  '/tms/control-tower': ['view_control_tower', 'manage_control_tower'],
  '/tms/drivers': ['view_drivers', 'manage_drivers'],
  '/inbound/reception': ['view_reception', 'process_reception'],
  '/outbound/picking': ['view_picking', 'process_picking'],
  '/outbound/packing': ['view_packing', 'process_packing'],
  '/inventory/stock': ['view_stock', 'manage_stock'],
  '/admin/users': ['manage_users', 'view_users'],
  // ... más rutas
}
```

### Componente ProtectedRoute

```javascript
// Valida:
// 1. Usuario autenticado
// 2. Permisos requeridos para la ruta
// 3. Módulo habilitado en configuración
// 4. Rol ADMIN tiene acceso a todo
```

### SmartRedirect

```javascript
// Redirige automáticamente a la primera ruta disponible
// según los permisos del usuario
// Orden de prioridad: Dashboard → Outbound → Inbound → Inventory → Admin
```

---

## 💾 Base de Datos (Supabase/PostgreSQL)

### Tablas Principales

#### 1. **tms_usuarios**
```sql
id (UUID, PK)
nombre (VARCHAR)
email (VARCHAR, UNIQUE)
password_hash (VARCHAR)
rol (VARCHAR, FK → tms_roles)
activo (BOOLEAN)
es_admin_delegado (BOOLEAN)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

#### 2. **tms_roles**
```sql
id (UUID, PK)
nombre (VARCHAR, UNIQUE)
descripcion (TEXT)
permisos_json (JSON[])  -- Array de permisos
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

#### 3. **tms_nv_diarias** (Notas de Venta)
```sql
id (UUID, PK)
nv (VARCHAR, UNIQUE)
cliente (VARCHAR)
cantidad (INTEGER)
estado (VARCHAR)  -- Pendiente, Aprobada, Picking, Packing, etc.
fecha_emision (DATE)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

#### 4. **tms_conductores** (Drivers)
```sql
id (UUID, PK)
nombre (VARCHAR)
licencia (VARCHAR)
estado (VARCHAR)  -- EN_RUTA, DISPONIBLE, DESCANSANDO
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

#### 5. **tms_usuarios_activos** (Heartbeat)
```sql
usuario_id (UUID, PK, FK → tms_usuarios)
nombre (VARCHAR)
rol (VARCHAR)
ultima_actividad (TIMESTAMP)
modulo_actual (VARCHAR)
estado (VARCHAR)  -- ONLINE, OFFLINE
```

#### 6. **tms_accesos** (Audit Log)
```sql
id (UUID, PK)
usuario_id (UUID, FK)
nombre (VARCHAR)
email (VARCHAR)
rol (VARCHAR)
timestamp (TIMESTAMP)
```

#### 7. **tms_modules_config** (Configuración)
```sql
id (VARCHAR, PK)  -- Ej: 'tms', 'inbound', 'outbound'
enabled (BOOLEAN)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

#### 8. **tms_partidas** (Líneas de Venta)
```sql
id (UUID, PK)
nv_id (UUID, FK → tms_nv_diarias)
partida (VARCHAR)
sku (VARCHAR)
cantidad (INTEGER)
lote (VARCHAR)
created_at (TIMESTAMP)
```

#### 9. **tms_series** (Números de Serie)
```sql
id (UUID, PK)
partida_id (UUID, FK → tms_partidas)
serie (VARCHAR)
created_at (TIMESTAMP)
```

#### 10. **tms_farmapack** (Lotes Farmacéuticos)
```sql
id (UUID, PK)
lote (VARCHAR)
vencimiento (DATE)
cantidad (INTEGER)
created_at (TIMESTAMP)
```

#### 11. **wms_inventory** (Stock)
```sql
id (UUID, PK)
sku (VARCHAR)
batch (VARCHAR)
location (VARCHAR)
qty (INTEGER)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

#### 12. **wms_movements** (Historial de Movimientos)
```sql
id (UUID, PK)
sku (VARCHAR)
batch (VARCHAR)
from_location (VARCHAR)
to_location (VARCHAR)
qty (INTEGER)
user_id (UUID)
reason (VARCHAR)
timestamp (TIMESTAMP)
```

---

## 🔧 Servicios y Lógica

### 1. **inventoryService.js** - Operaciones de Inventario

```javascript
InventoryService = {
  moveStock({ sku, batch, fromLoc, toLoc, qty, userId, reason })
    // Mueve stock de forma atómica (RPC)
    // Lanza error si no hay saldo o hay bloqueo concurrente
    
  reserveStock(orderId, sku, qty)
    // Intenta reservar stock para una orden
    // Retorna true/false
}
```

**Características:**
- ✅ Transacciones ACID garantizadas
- ✅ Prevención de race conditions
- ✅ Auditoría automática de movimientos
- ✅ Validación de disponibilidad

### 2. **wmsLogic.js** - Inteligencia WMS

```javascript
WmsIntelligence = {
  getSuggestedAllocation(sku, qtyNeeded)
    // Retorna sugerencias FEFO (First Expire, First Out)
    // Basado en lotes y fechas de vencimiento
    
  triggerManualReplenishment(zoneId)
    // Dispara reabastecimiento manual
    
  validateMovement(sku, targetLocation, batch)
    // Valida si movimiento es permitido según reglas
}
```

**Características:**
- ✅ Algoritmo FEFO para picking
- ✅ Validación de reglas de negocio
- ✅ Sugerencias inteligentes de ubicación

### 3. **useConductores.js** - Hook de Conductores

```javascript
useConductores() {
  conductores: [],
  loading: boolean,
  error: string,
  crearConductor(conductor),
  actualizarConductor(id, updates),
  eliminarConductor(id),
  refetch()
}
```

**Características:**
- ✅ Sincronización Realtime automática
- ✅ CRUD completo
- ✅ Suscripción a cambios en BD

---

## 📊 Componentes de Gráficos

### 1. **BarChart.jsx**
```javascript
<BarChart 
  data={chartData}
  dataKey="valor"
  color="#6366f1"
  height={200}
/>
```

### 2. **PieChart.jsx**
```javascript
<PieChart 
  data={chartData}
  dataKey="valor"
/>
```

### 3. **AreaChart.jsx**
```javascript
<AreaChart 
  data={chartData}
  dataKey="valor"
/>
```

---

## 🎨 Estilos y Diseño

### Tailwind CSS
- **Colores Principales:**
  - Orange: `#f97316` (Primario)
  - Slate: `#64748b` (Neutral)
  - Emerald: `#10b981` (Success)
  - Red: `#ef4444` (Error)

- **Breakpoints:**
  - `sm`: 640px
  - `md`: 768px
  - `lg`: 1024px
  - `xl`: 1280px

### Animaciones (GSAP)
- Transiciones de página
- Elementos flotantes
- Efectos hover
- Animaciones de carga

---

## 🚀 Configuración y Deployment

### Variables de Entorno (.env)
```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_KEY=tu_anon_key_aqui
```

### Scripts de Build
```bash
npm run dev          # Inicia servidor de desarrollo
npm run build        # Compila para producción
npm run preview      # Previsualiza build
npm start            # Inicia servidor Node (server.js)
```

### Vite Configuration
```javascript
// vite.config.js
- React plugin
- PWA plugin (autoUpdate)
- Build output: dist/
- Assets directory: assets/
```

### Capacitor Configuration
```json
{
  "appId": "com.cco.wms",
  "appName": "WMS CCO",
  "webDir": "dist"
}
```

### PWA Manifest
```json
{
  "name": "CCO WMS",
  "short_name": "CCO",
  "description": "Centro de Control Operacional & WMS",
  "theme_color": "#f97316",
  "icons": [
    { "src": "pwa-192x192.png", "sizes": "192x192" },
    { "src": "pwa-512x512.png", "sizes": "512x512" }
  ]
}
```

---

## 📱 Características Mobile

### Capacitor Android
- Acceso a cámara
- Geolocalización
- Notificaciones push
- Almacenamiento local

### PWA Features
- Instalable en home screen
- Funciona offline
- Sincronización en background
- Actualización automática

---

## 🔄 Flujo de Datos

```
Usuario Login
    ↓
AuthContext.login()
    ↓
Validar credenciales en BD (tms_usuarios)
    ↓
Cargar permisos (tms_roles)
    ↓
Guardar en localStorage
    ↓
Crear heartbeat en tms_usuarios_activos
    ↓
Registrar acceso en tms_accesos
    ↓
Redirigir a primera ruta disponible
```

---

## 🔐 Seguridad

### Autenticación
- ✅ Contraseñas hasheadas en BD
- ✅ Validación en cliente y servidor
- ✅ Sesión persistente en localStorage
- ✅ Logout automático si usuario es eliminado

### Autorización
- ✅ Validación de permisos por ruta
- ✅ Bypass automático para ADMIN
- ✅ Permisos granulares por módulo
- ✅ Auditoría de accesos

### Datos
- ✅ Conexión HTTPS (Supabase)
- ✅ Anon key para frontend (segura)
- ✅ RPC para operaciones críticas
- ✅ Transacciones ACID

---

## 📈 Performance

### Optimizaciones
- ✅ Code splitting automático (Vite)
- ✅ Lazy loading de rutas
- ✅ Memoización de componentes
- ✅ Virtualización de listas largas
- ✅ Caché de Realtime

### Monitoreo
- ✅ Heartbeat cada 30s
- ✅ Indicador online/offline
- ✅ Logs de errores
- ✅ Métricas de actividad

---

## 🐛 Debugging

### Logs Disponibles
```javascript
// AuthContext
console.log('📥 Cargando permisos...')
console.log('✅ Permisos cargados')
console.log('🔄 Refrescando permisos...')
console.log('🎭 Cambio detectado en Roles')
console.log('👁️ Iniciando vigilancia de sesión')

// ConfigContext
console.log('📥 Cargando configuración...')
console.log('✅ Módulos cargados')
console.log('🔔 Cambio detectado en configuración')

// Navbar
console.log('🎨 Navbar render')
console.log('🔄 Refrescando manualmente...')
```

---

## 📚 Recursos Adicionales

### Documentación Oficial
- [React](https://react.dev)
- [Vite](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Supabase](https://supabase.com/docs)
- [Capacitor](https://capacitorjs.com)
- [GSAP](https://gsap.com)
- [Leaflet](https://leafletjs.com)
- [Recharts](https://recharts.org)

### Comandos Útiles
```bash
# Desarrollo
npm run dev

# Build
npm run build

# Preview
npm run preview

# Capacitor
npx cap add android
npx cap build android
npx cap open android
```

---

## 📝 Notas Importantes

1. **Supabase Realtime**: Configurado con 10 eventos por segundo
2. **Heartbeat**: Se actualiza cada 30 segundos automáticamente
3. **Permisos**: Se cargan al login y se sincronizan en tiempo real
4. **Módulos**: Se pueden habilitar/deshabilitar desde Admin
5. **PWA**: Se actualiza automáticamente cuando hay cambios
6. **Offline**: Funciona con datos cacheados (limitado)

---

**Última actualización:** Mayo 2026
**Versión:** 1.0.0
**Autor:** Centro de Control Operacional (CCO)
