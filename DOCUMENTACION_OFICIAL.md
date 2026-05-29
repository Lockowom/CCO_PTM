# 📦 DOCUMENTACIÓN OFICIAL: CCO WMS & TMS
**Versión app (semver):** 1.4.13 — ver `package.json`
**Hito de producto:** "2.0 Enterprise Edition" (rediseño/branding, no es la versión semver)
**Fecha de Actualización:** Mayo 2026
**Arquitectura:** PWA Móvil / Web App React (Serverless Backend)

---

## 🌟 1. RESUMEN DEL PROYECTO
**CCO PTM** es un ecosistema logístico de Centro de Control Operacional (CCO) diseñado para operar a nivel industrial. Integra un Sistema de Gestión de Almacenes (WMS) y un Sistema de Gestión de Transporte (TMS). Su arquitectura permite uso en pantallas gigantes (Torres de Control), navegadores web (Supervisores) y dispositivos móviles Android/PDA (Operarios de piso).

---

## 🛠️ 2. STACK TECNOLÓGICO Y LENGUAJES

### Frontend (Interfaz y Lógica de Cliente)
*   **Lenguaje:** JavaScript (ES6+) / JSX.
*   **Core:** React 18.
*   **Bundler / Compilador:** Vite (Alta velocidad de compilación y Hot Module Replacement).
*   **Enrutamiento:** React Router v6 (Manejo de rutas SPA y protección de vistas por roles).
*   **Estado y Caché de Datos:** `@tanstack/react-query` (Carga optimista, caché en memoria, re-fetching automático).

### Diseño y UI/UX (Cyber-Logística)
*   **Estilos:** Tailwind CSS v3 (Configurado con paleta personalizada `wms-dark`, `wms-panel`, `wms-neon`).
*   **Estética Visual:** Glassmorphism (Efectos de cristal `backdrop-blur`), degradados de neón y sombras reactivas.
*   **Animaciones:** GSAP (`@gsap/react`) para transiciones de montaje de componentes a 60fps.
*   **Iconografía:** Lucide React (Vectores SVG ligeros).
*   **Notificaciones UI:** Sonner (Toasts dinámicos y estilizados).

### Backend as a Service (BaaS) & Base de Datos
*   **Plataforma:** Supabase.
*   **Base de Datos:** PostgreSQL (Relacional, alta concurrencia).
*   **Autenticación:** Supabase Auth (JWT, Sesiones seguras).
*   **Seguridad:** RLS (Row Level Security) implementado en SQL puro.
*   **Tiempo Real:** Supabase Realtime (WebSockets) y Presence (Modo Multijugador).
*   **Funciones Servidor:** Edge Functions (Deno / TypeScript) para ejecución de código en la nube (ej: Push Notifications).

### Ecosistema Móvil y Hardware (Android / PDA)
*   **Motor Nativo:** Capacitor v8 (Empaqueta la web app en una APK nativa).
*   **Actualizaciones OTA:** `@capgo/capacitor-updater` (Permite actualizar el código de los celulares por aire sin pasar por la Play Store).
*   **Push Notifications:** Firebase Cloud Messaging (FCM) + `@capacitor/push-notifications`.
*   **Soporte Offline:** Dexie.js (Wrapper de IndexedDB para encolar datos sin Wi-Fi).
*   **Integración Hardware:** Custom Hook (`useScanner`) para leer disparos láser de PDAs Zebra/Honeywell en < 30ms.

### DevOps y Monitoreo
*   **Hosting Web:** Render (Despliegue continuo desde Git).
*   **Monitoreo de Errores:** Sentry (`@sentry/react` para telemetría de crashes en producción).

---

## ⚙️ 3. CARACTERÍSTICAS Y FUNCIONES CORE DE INGENIERÍA

### 3.1. Arquitectura Offline-First (Cola de Sincronización)
Cuando el celular del operario pierde conexión en un pasillo ciego del almacén:
1. El sistema global detecta la caída de red (`navigator.onLine === false`).
2. Las mutaciones (ej: mover inventario) no fallan; se guardan en la base de datos local del celular mediante **Dexie.js**.
3. La interfaz usa **Carga Optimista (React Query)**, mostrando la tarea como "Completada" instantáneamente para no bloquear al operario.
4. Al recuperar conexión, un *Sync Manager* oculto envía la cola de datos hacia Supabase.

### 3.2. Modo Multijugador (Anti-Colisión Operativa)
Usa *Supabase Presence* (WebSockets) para crear "Salas Virtuales" en los registros de la base de datos. Si un operario abre la Nota de Venta #123 para preparar un pedido, el sistema transmite su presencia. Los demás operarios verán un "candado rojo" en esa nota de venta, evitando duplicidad de trabajo.

### 3.3. Motor de Búsqueda Global (Omni-Search)
Un buscador centralizado tipo *Command Palette*. Usa `Debounce` (600ms) para no saturar la base de datos mientras el usuario escribe. Permite buscar productos, lotes, series o ubicaciones simultáneamente en múltiples tablas de PostgreSQL usando sentencias `.ilike`.

### 3.4. Code Splitting y Carga Perezosa (Lazy Loading)
Para mantener la aplicación ultraligera (TTI < 0.8s), el archivo `App.jsx` utiliza `React.lazy()` y `<Suspense>`. El usuario solo descarga el código de la pantalla a la que ingresa, mostrando un *Radar Loader* animado durante los microsegundos de descarga.

---

## 🏗️ 4. ESTRUCTURA DE MÓDULOS DEL WMS

El sistema está dividido en 6 grandes pilares operativos:

### 📥 1. Inbound (Entradas)
*   **Recepción:** Validación de mercadería de proveedores.
*   **Entry (Ingreso):** Posicionamiento inicial de la mercadería en la bodega.
*   **Cubing (Cubicaje):** Registro de dimensiones (Largo x Ancho x Alto) y pesos mediante interfaz visual de cajas.
*   **Returns:** Gestión de devoluciones (Logística inversa).

### 📤 2. Outbound (Salidas)
*   **Sales Orders:** Visor general de Notas de Venta a despachar.
*   **Picking:** Proceso de recolección de productos en pasillos (Multijugador activado).
*   **Packing:** Auditoría de empaque, generación de cajas (Farmapack) y etiquetas.
*   **Shipping:** Despacho final y carga a camiones.

### 📦 3. Inventory (Inventario)
*   **Dashboard WMS:** Panel de control de KPIs de la bodega.
*   **Stock:** Visor general de existencias por código.
*   **Transfers:** Movimientos internos entre ubicaciones.
*   **Cycle Count:** Inventarios cíclicos y auditorías a ciegas (Offline mode activado).

### 🔍 4. Queries (Consultas Rápidas)
*   **Batches (Lotes y Series):** Omni-search para trazabilidad de números de serie y caducidades.
*   **Locations:** Auditoría visual de qué productos existen en un pasillo/estante específico.
*   **Kardex:** Historial inmutable de entradas y salidas de un SKU.

### 🚚 5. TMS (Gestión de Transporte)
*   **Route Planning:** Planificación de rutas y asignación de vehículos.
*   **Control Tower:** Torre de control con mapas en vivo (Leaflet) para ver la ubicación de la flota.
*   **Drivers:** Gestión de chóferes y estados.

### ⚙️ 6. Admin (Configuración)
*   **Usuarios y Roles:** Control de Accesos (RBAC).
*   **Audit Logs:** Registro inmutable de acciones en el sistema.
*   **System Health:** Monitoreo del estado de la base de datos y la red.

---

## 🚀 5. GUÍA DE DESPLIEGUE Y OPERACIONES

### Despliegue Web (Render)
El Frontend web se despliega automáticamente cuando se hace `git push` a la rama principal (Main). Render compila usando `npm run build` y sirve la carpeta `dist`.

### Despliegue Móvil OTA (Capgo)
Para enviar una actualización a los celulares de los operarios **sin usar Android Studio ni Play Store**:
1. Hacer cambios en el código (CSS, JavaScript).
2. Ejecutar en terminal: `npm run deploy:mobile`.
3. El código se sube a la nube de Capgo.
4. La app móvil detecta el cambio, lo descarga en segundo plano y fuerza un reinicio automático.

### Disparo de Notificaciones Push
Las notificaciones pueden dispararse de dos formas:
1. **Manual / Broadcast:** Desde la consola de Firebase -> Messaging (Ideal para avisos a todo el personal).
2. **Automática:** Vía Triggers de PostgreSQL en Supabase. Cuando una tabla cambia (ej: `UPDATE tms_nv_diarias`), el Trigger llama a una Edge Function (Deno) que le pasa el Token del operario a Firebase, haciendo vibrar el celular.

---

## 🔒 6. SEGURIDAD DE LA BASE DE DATOS (RLS)
El backend está protegido a nivel de fila (Row Level Security).
*   Las consultas desde la app viajan con el JWT del usuario.
*   Supabase lee el rol dentro del JWT (`auth.uid()`).
*   **Ejemplo:** Si un usuario sin rol intenta enviar un `DELETE` a la tabla de inventario mediante la API, PostgreSQL lo rechazará internamente (Error 403), independientemente de lo que diga el código Frontend.

---
*Desarrollado y Arquitectado para Operaciones de Alto Rendimiento.* 🚀
