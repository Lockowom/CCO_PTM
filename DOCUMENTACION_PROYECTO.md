# CCO PTM — Documentación Técnica Completa

> **Versión:** 1.4.5 | **Última actualización:** 2026-05-28
> **Stack:** React 18 + Vite 5 + Supabase + Capacitor 8 + TailwindCSS
> **Plataformas:** Web (Render) + Android (Capgo OTA)

---

## 1. Arquitectura General

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React 18)                   │
│  Vite 5 · TailwindCSS · GSAP · React Query · Zustand   │
├──────────┬──────────┬───────────┬──────────┬────────────┤
│ Dashboard│ Inbound  │ Outbound  │ Queries  │   Admin    │
│          │ WMS      │ Picking   │ Lotes    │   Roles    │
│          │ Entry    │ Packing   │ NV Hist  │   Users    │
│          │ Recepción│ Shipping  │ Heatmap  │   Import   │
├──────────┴──────────┴───────────┴──────────┴────────────┤
│                      TMS (Transporte)                    │
│  Control Tower · Rutas · Conductores · App Móvil · Patio│
├─────────────────────────────────────────────────────────┤
│                   SERVICIOS & HOOKS                      │
│  AuthContext · Realtime · SyncManager · BarcodeScanner  │
├─────────────────────────────────────────────────────────┤
│                    BACKEND (Supabase)                     │
│  PostgreSQL · RLS · RPC Functions · Realtime · Storage  │
├─────────────────────────────────────────────────────────┤
│                   MOBILE (Capacitor 8)                   │
│  ML Kit Barcode · Haptics · Push (FCM) · OTA (Capgo)    │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Estructura de Carpetas

```
src/
├── components/          # Componentes compartidos
│   ├── Layout.jsx       # Layout principal con realtime global
│   ├── Navbar.jsx       # Navegación con permisos dinámicos
│   ├── ErrorBoundary.jsx# Captura errores React → Sentry
│   └── ui/              # CommandPalette, ErrorReportWidget, UpdateOverlay
├── constants/
│   ├── estados.js       # Máquina de estados N.V. (12 estados)
│   ├── permissions.js   # Mapa ruta → permiso (30+ rutas)
│   └── warehouse.js     # Config racks A-I, niveles, posiciones
├── context/
│   ├── AuthContext.jsx   # Auth + permisos + presencia
│   └── ConfigContext.jsx # Feature flags por módulo
├── hooks/
│   ├── useBarcodeScanner.js  # Escaneo QR/barcode nativo
│   ├── useConductores.js     # CRUD conductores + realtime
│   ├── usePresence.js        # Presencia usuarios (heartbeat 30s)
│   ├── useProcessTimer.js    # Timer picking/packing con ocio
│   ├── useRealtimeTable.js   # Suscripción genérica realtime
│   ├── useScanner.js         # Scanner hardware PDA/Zebra
│   ├── useSupabaseMutation.js# Mutación genérica con optimistic
│   ├── useSupabaseTable.js   # Query genérica con filtros
│   └── useSyncQueueCount.js  # Contador cola offline
├── lib/
│   ├── db.js            # Dexie (IndexedDB) para offline
│   ├── syncManager.js   # Cola sync offline con retry
│   ├── notifications.js # Toast WMS personalizados
│   ├── sentry.js        # Tracking errores
│   └── env.js           # Validación env vars
├── services/
│   ├── mobileService.js    # OTA updates + Push notifications
│   ├── inventoryService.js # Movimientos stock ACID (RPC)
│   ├── labelPrinter.js     # Generación ZPL etiquetas
│   └── wmsLogic.js         # FEFO allocation + validaciones
└── pages/               # Ver sección 4
```

---

## 3. Tablas Supabase

| Tabla | Propósito | Módulos que la usan |
|---|---|---|
| `tms_usuarios` | Cuentas de usuario, presencia, push_token | Auth, Admin, Monitor |
| `tms_roles` | Roles con permisos JSON, landing page, import_tabs | Auth, Roles, Views |
| `tms_accesos` | Auditoría de logins | Auth |
| `tms_modules_config` | Feature flags por módulo | ConfigContext, Views |
| `tms_nv_diarias` | Notas de venta diarias (pedidos) | Dashboard, SalesOrders, Picking, Packing, PackingTV, Historial |
| `tms_nv_eliminadas` | Auditoría NV eliminadas | SalesOrders, DataImport |
| `tms_inventario_general` | Stock consolidado por bodega | DataImport |
| `tms_partidas` | Lotes/partidas con vencimiento | Batches, DataImport, Layout |
| `tms_series` | Números de serie | Batches, DataImport, Layout |
| `tms_farmapack` | Lotes farmacéuticos | Batches, DataImport, Layout |
| `tms_pesos` | Pesos y dimensiones productos | Batches, CubingRegistry |
| `tms_matriz_codigos` | Maestro productos (código→descripción) | Entry, DataImport, PDA |
| `tms_control_despacho` | Control de despacho/guías | DispatchControl, Shipping, DataImport |
| `tms_direcciones` | Directorio de direcciones clientes | Addresses, Packing |
| `tms_conductores` | Conductores/choferes | Drivers, ControlTower, Rutas |
| `tms_rutas` | Rutas de despacho | RoutePlanning, ControlTower |
| `tms_entregas` | Entregas individuales | ControlTower, MobileApp, Shipping, SalesStatus |
| `tms_mediciones_tiempos` | Tiempos picking/packing | Picking, Packing, PDA |
| `tms_recepciones` | Recepciones de mercadería | Reception |
| `tms_recepcion_items` | Items por recepción | Reception |
| `tms_tickets` | Tickets soporte TI | Tickets |
| `tms_historial_cargas` | Historial importaciones datos | UploadHistory, DataImport |
| `tms_errores_picking` | Errores detectados en picking | Packing |
| `tms_print_queue` | Cola impresión etiquetas ZPL | LabelPrinter |
| `tms_picking_tasks` | Tareas picking asignadas | PDA |
| `wms_ubicaciones` | Ubicaciones bodega (RACK-POS-NIVEL) | Entry, Heatmap, WmsLocations, LocationManager, Picking, PDA |
| `tms_cubicaje_historial` | Historial cubicaje productos | CubingRegistry |

---

## 4. Módulos y Flujos

### 4.1 Dashboard (`/dashboard`)
**Archivo:** `src/pages/Dashboard.jsx`

Panel operacional con KPIs en tiempo real.

```
┌──────────────────────────────────────┐
│  KPIs: Pendientes · En Picking ·     │
│         En Packing · Despachados     │
├──────────────────────────────────────┤
│  Pipeline visual estados N.V.        │
│  Gráfico barras por estado           │
└──────────────────────────────────────┘
```

- **Datos:** `tms_nv_diarias`, `tms_conductores`
- **Realtime:** Suscripción a cambios en N.V.
- **Hooks:** useRealtimeTable, useProcessTimer, useAuth

---

### 4.2 Inbound (Recepción y Entrada)

#### 4.2.1 Recepción (`/inbound/reception`)
**Archivo:** `src/pages/Inbound/Reception.jsx`

Dashboard de operaciones de recepción con KPIs, gráficos de tendencia y export Excel.

**Flujo:**
```
Proveedor llega → Registrar recepción → Contar bultos/pallets
→ Escanear items → Confirmar cantidades → Cerrar recepción
```

- **Tablas:** `tms_recepciones`, `tms_recepcion_items`
- **Realtime:** Sí

#### 4.2.2 Entrada WMS (`/inbound/entry`)
**Archivo:** `src/pages/Inbound/Entry.jsx`

Registro de productos en ubicaciones con escaneo de código de barras y soporte offline.

**Flujo:**
```
Seleccionar ubicación → Escanear código producto (cámara/manual)
→ Auto-buscar descripción en tms_matriz_codigos
→ Agregar a cola local → Sync a wms_ubicaciones (upsert)
```

- **Tablas:** `wms_ubicaciones`, `tms_matriz_codigos`
- **Offline:** Integrado con syncManager (Dexie). Si offline al guardar → `enqueueUpsert()` directo. Si falla la mutación por error de red → fallback automático a Dexie. Se sincroniza automáticamente al recuperar conexión.
- **Scanner:** Cámara nativa (ML Kit) + input manual
- **Realtime:** Sí

#### 4.2.3 Cubicaje (`/inbound/cubing`)
**Archivo:** `src/pages/Inbound/CubingRegistry.jsx`

Registro de dimensiones y peso de productos para optimización de packing.

**Flujo:**
```
Escanear producto → Ingresar largo/ancho/alto/peso
→ Seleccionar tipo empaque → Calcular cubicaje → Guardar
```

- **Tablas:** `tms_matriz_codigos`, `tms_pesos`, `tms_cubicaje_historial`

#### 4.2.4 Carga Masiva (`/inbound/data-import`)
**Archivo:** `src/pages/Admin/DataImport.jsx`

Sistema de importación masiva con 13 módulos, deduplicación inteligente y escaneo QR/barcode.

**Módulos de importación:**
| Módulo | Tabla destino | Clave única |
|---|---|---|
| Consolidado | `tms_inventario_general` | bodega + codigo_producto |
| BD 21/5/24/3/7/99/22 | `tms_inventario_general` | bodega + codigo_producto |
| N.V Diarias | `tms_nv_diarias` | nv + codigo_producto |
| Control Despacho | `tms_control_despacho` | Sin dedup |
| Partidas | `tms_partidas` | codigo_producto + partida |
| Series | `tms_series` | serie |
| Farmapack | `tms_farmapack` | codigo_producto + lote |
| Inventario WMS | `wms_ubicaciones` | Sin dedup |
| Matriz Códigos | `tms_matriz_codigos` | codigo_producto |

**Flujo Pegado:**
```
Seleccionar módulo → Pegar datos (Ctrl+V desde Excel)
→ Detectar encabezados → Parsear columnas → Dedup inteligente
→ Preview con estado (Nueva/Existe/Eliminada/Actualiza)
→ Confirmar → Bulk upsert paralelo (RPC server-side o batches concurrentes) → Resultado
```

**Flujo Escaneo QR/Barcode (NUEVO v1.3.5):**
```
Seleccionar módulo → Cambiar a modo "Escanear QR / Código"
→ Abrir cámara (nativo) o input manual (web)
→ Escanear código → Auto-buscar producto en tms_matriz_codigos
→ Acumular items escaneados → Procesar → Preview → Confirmar
```

- **Formatos QR soportados:** QR, Code128, Code39, EAN13/8, UPC-A/E, ITF, Codabar, DataMatrix, PDF417
- **Dedup inteligente:** Para N.V., detecta NVs eliminadas y no las recarga
- **Smart dedup N.V.:** RPC `prepare_nv_import` que resetea NVs en proceso y cancela items faltantes
- **Acceso por rol:** Configurable vía `tms_roles.import_tabs`
- **Historial:** Cada carga se registra en `tms_historial_cargas`

---

### 4.3 Outbound (Salida)

#### 4.3.1 Notas de Venta (`/outbound/sales-orders`)
**Archivo:** `src/pages/Outbound/SalesOrders.jsx`

Gestión de pedidos con transiciones de estado y auditoría.

**Máquina de estados N.V.:**
```
Pendiente → Aprobada → Pendiente Picking → PICKING → PACKING
→ LISTO_DESPACHO → Pendiente Shipping → EN_RUTA → ENTREGADO
                                                  → NULA
                                                  → Refacturacion
                                                  → SOLO_FACTURAR
```

- **Tablas:** `tms_nv_diarias`, `tms_nv_eliminadas`
- **Realtime:** Sí
- **Acciones:** Cambiar estado, eliminar con auditoría, ver detalle productos

#### 4.3.2 Picking (`/outbound/picking`)
**Archivo:** `src/pages/Outbound/Picking.jsx`

Operación de picking con timer, tracking de ubicaciones y estados por item.

**Flujo:**
```
Buscar N.V. → Iniciar picking (play) → Timer activo
→ Por cada item: marcar COMPLETO/PARCIAL/ESPERA/SIN_STOCK
→ Si PARCIAL: ingresar cantidad pickeada
→ Mostrar ubicación WMS del producto
→ Finalizar → Registrar tiempo → Cambiar estado N.V.
```

- **Tablas:** `tms_nv_diarias`, `tms_mediciones_tiempos`, `wms_ubicaciones`
- **Timer:** Tiempo activo + tiempo ocio separados
- **Realtime:** Sí
- **Stores:** Zustand (usePickingActions, useItemsStatus, useActiveSession)

#### 4.3.3 Packing (`/outbound/packing`)
**Archivo:** `src/pages/Outbound/Packing.jsx`

Empaque con registro de bultos, búsqueda de dirección y devolución a picking.

**Flujo:**
```
Seleccionar N.V. → Iniciar timer → Registrar bulto (dimensiones/peso)
→ Buscar dirección en tms_direcciones → Escanear productos para confirmar
→ Detectar errores de picking → Completar o devolver a picking
→ Registrar tiempo packing
```

- **Tablas:** `tms_nv_diarias`, `tms_mediciones_tiempos`, `tms_direcciones`, `tms_entregas`, `tms_errores_picking`
- **Realtime:** Sí (N.V. + tiempos)

#### 4.3.4 Packing TV (`/outbound/packing-tv`)
**Archivo:** `src/pages/Outbound/PackingTV.jsx`

Pantalla para TV/monitor grande con cola de packing en 3 columnas.

```
┌─────────────┬─────────────┬─────────────┐
│  EN COLA    │ PREPARANDO  │   LISTOS    │
│  (Pendiente)│ (En proceso)│ (Completo)  │
│  Card 1     │  Card 4     │  Card 7     │
│  Card 2     │  Card 5     │  Card 8     │
│  Card 3     │  Card 6     │             │
└─────────────┴─────────────┴─────────────┘
        Reloj grande · Auto-refresh
```

- **Tabla:** `tms_nv_diarias`
- **Realtime:** Sí
- **Layout:** Landscape optimizado

#### 4.3.5 Shipping (`/outbound/shipping`)
**Archivo:** `src/pages/Outbound/Shipping.jsx`

Documentación de despacho con edición inline.

**Flujo:**
```
Buscar por N.V./Cliente → Editar inline (facturas, guía, transporte, flete)
→ Guardar → Actualizar tms_entregas + tms_control_despacho
```

- **Tablas:** `tms_entregas`, `tms_control_despacho`
- **Edición:** Inline por celda con Enter para guardar

---

### 4.4 TMS (Transporte)

#### 4.4.1 Dashboard TMS (`/tms/dashboard`)
**Archivo:** `src/pages/TMS/Dashboard.jsx`

Dashboard específico de transporte con métricas de entregas y rutas.

#### 4.4.2 Planificación Rutas (`/tms/planning`)
**Archivo:** `src/pages/TMS/RoutePlanning.jsx`

Creación de rutas y asignación de entregas a conductores.

**Flujo:**
```
Panel izquierdo: entregas pendientes con checkboxes
→ Seleccionar entregas → Panel derecho: seleccionar conductor (DISPONIBLE)
→ Nombrar ruta (auto-genera con fecha) → Crear ruta
→ API POST /api/rutas → Actualizar estados
```

- **Tablas:** `tms_entregas`, `tms_conductores`, `tms_rutas`
- **Realtime:** Sí

#### 4.4.3 Torre de Control (`/tms/control-tower`)
**Archivo:** `src/pages/TMS/ControlTower.jsx`

Centro de monitoreo de flota con alertas en tiempo real.

```
┌──────────┬──────────────────┬──────────┐
│  Rutas   │  Feed Entregas   │ Alertas  │
│ Activas  │  (buscable)      │ Rechazo  │
│ [Ruta 1] │  Card expandible │ Reprog.  │
│ [Ruta 2] │  + Maps/Llamada  │ Vol.Alto │
└──────────┴──────────────────┴──────────┘
```

- **Tablas:** `tms_conductores`, `tms_rutas`, `tms_entregas`
- **Realtime:** Toasts en ENTREGADO/RECHAZADO

#### 4.4.4 Conductores (`/tms/drivers`)
**Archivo:** `src/pages/TMS/Drivers.jsx`

CRUD de conductores con estados (DISPONIBLE/OCUPADO/EN_RUTA/INACTIVO).

- **Tabla:** `tms_conductores`
- **Realtime:** Vía useConductores

#### 4.4.5 App Móvil Conductor (`/tms/mobile`)
**Archivo:** `src/pages/TMS/MobileApp.jsx`

Interfaz móvil para conductores con gestión de entregas.

**Flujo:**
```
Login → Detectar perfil conductor → Ver entregas asignadas
→ Filtrar por estado → Seleccionar entrega → Ver detalle
→ Acciones: Entregar / Rechazar / Reprogramar
→ Seleccionar motivo → Observaciones → Confirmar
→ Sync automático
```

- **Tablas:** `tms_conductores`, `tms_entregas`
- **Realtime:** Canal filtrado por conductor_id
- **Features:** Llamada telefónica, navegación Google Maps

#### 4.4.6 Gestión Patio (`/tms/yard`)
**Archivo:** `src/pages/TMS/YardManagement.jsx`

Gestión de docks con cola de camiones y drag-and-drop.

- **Docks:** 4 INBOUND + 4 OUTBOUND
- **Persistencia:** localStorage (sin Supabase)

---

### 4.5 Consultas (Queries)

#### 4.5.1 Lotes y Series (`/queries/batches`)
**Archivo:** `src/pages/Queries/Batches.jsx`

Búsqueda multi-tab de inventario por lote/serie/farmapack/pesos.

- **4 tabs:** Partidas · Series · Farmapack · Pesos
- **Tablas:** `tms_partidas`, `tms_series`, `tms_farmapack`, `tms_pesos`
- **Features:** Highlight búsqueda, badges disponibilidad, export CSV

#### 4.5.2 Estado Pedido (`/queries/sales-status`)
**Archivo:** `src/pages/Queries/SalesStatus.jsx`

Timeline visual de progresión de un pedido con info logística.

```
[Pendiente] → [Picking] → [Packing] → [Despacho] → [En Ruta] → [Entregado]
     ●            ●           ●            ○            ○            ○
```

- **Tablas:** `tms_nv_diarias`, `tms_entregas`, `tms_rutas`, `tms_conductores`
- **Realtime:** Sí

#### 4.5.3 Directorio Direcciones (`/queries/addresses`)
Búsqueda ilike en `tms_direcciones` (razón social, nombre, RUT).

#### 4.5.4 Ubicaciones WMS (`/queries/locations`)
**Archivo:** `src/pages/Queries/WmsLocations.jsx`

Explorador de ubicaciones con virtual scrolling (react-virtual).

- **Filtros:** Todos / Con stock / Vacías
- **Atajos:** Ctrl+K para focus búsqueda
- **Store:** warehouseStore (Zustand)

#### 4.5.5 Mapa Calor Bodega (`/queries/heatmap`)
**Archivo:** `src/pages/Queries/Heatmap.jsx`

Visualización de ocupación por rack/nivel con celdas coloreadas.

```
Ocupación: 0% (gris) · <25% (verde) · <50% (amarillo) · <75% (naranja) · >75% (rojo)
```

- **Selector:** Niveles 1-4, Racks A-I
- **Admin:** Cambiar estado ubicación (LIBRE/OCUPADA/NO_DISPONIBLE)

#### 4.5.6 Historial N.V. (`/queries/historial-nv`)
Historial completo de notas de venta con filtros de fecha y estado.

#### 4.5.7 Control Despacho (`/queries/dispatch-control`)
Seguimiento de guías con KPIs (guías, bultos, flete) y filtros de fecha.

---

### 4.6 Admin (Administración)

#### 4.6.1 Usuarios (`/admin/users`)
CRUD de usuarios con asignación de roles y tracking de actividad.

#### 4.6.2 Roles (`/admin/roles`)
Gestión de permisos granular por módulo con matriz visual.

#### 4.6.3 Vistas (`/admin/views`)
Enable/disable módulos y asignación de landing page por rol.

#### 4.6.4 Tickets (`/admin/tickets`)
Sistema de tickets soporte TI con estados y prioridades.

- **Estados:** ABIERTO → EN_PROCESO → CERRADO / RECHAZADO
- **Realtime:** Sí
- **Push:** Notificaciones FCM al canal `cco_tickets`

#### 4.6.5 Monitor (`/admin/monitor`)
Monitoreo en tiempo real de usuarios activos, sesiones y módulos.

#### 4.6.6 Historial Cargas (`/admin/upload-history`)
Analytics de importaciones con gráficos de tendencia y breakdown por proveedor.

#### 4.6.7 Gestor Ubicaciones (`/admin/locations`)
Edición inline de ubicaciones WMS con normalización.

#### 4.6.8 Limpieza (`/admin/cleanup`)
Utilidad peligrosa para limpiar datos operacionales (RPC `clean_operational_data`).

---

### 4.7 Mobile PDA (`/mobile/pda`)
**Archivo:** `src/pages/Mobile/WarehousePDA.jsx`

Interfaz optimizada para dispositivos PDA (Zebra TC21, Honeywell).

**Modos de operación:**
```
HOME → [PICKING] → Escanear ubicación → Escanear SKU → Confirmar cantidad
     → [PUTAWAY] → Escanear producto → Escanear ubicación destino → Confirmar
     → [INVENTORY] → Escanear ubicación → Ver/contar productos
     → [QUERY] → Escanear código → Ver información producto
```

- **Diseño:** 320px-480px, botones grandes (40-60px), modo oscuro
- **Scanner:** Cámara ML Kit + scanner hardware PDA
- **Haptics:** Vibración éxito/error
- **Offline:** Cola de operaciones

---

## 5. Sistema de Autenticación y Permisos

### Arquitectura Auth (Supabase Auth nativo — v1.3.7+)

**Migración completada 2026-05-26**: El sistema fue migrado de auth custom (RPC `verify_user_password` + localStorage) a **Supabase Auth nativo** con JWT tokens.

**Componentes:**
- `auth.users` — Tabla nativa de Supabase Auth (passwords bcrypt)
- `tms_usuarios.auth_uid` — FK que vincula `tms_usuarios.id` con `auth.users.id`
- `supabase.auth.signInWithPassword()` — Login principal
- `supabase.auth.getSession()` — Restauración de sesión (JWT auto-refresh)
- `supabase.auth.onAuthStateChange()` — Listener de eventos auth
- `supabase.auth.signOut()` — Logout

**RPCs auxiliares (SECURITY DEFINER):**
- `create_auth_user(p_email, p_password)` → UUID — Crea usuario en auth.users (admin)
- `update_auth_password(p_auth_uid, p_new_password)` → void — Actualiza contraseña (admin)
- `get_user_role()` → TEXT — Helper RLS: obtiene rol del usuario autenticado
- `is_admin()` → BOOLEAN — Helper RLS: verifica si es admin o admin delegado
- `verify_user_password()` — **LEGACY**, se mantiene como fallback para migración lazy

### Flujo de Login
```
Usuario ingresa email/contraseña
→ supabase.auth.signInWithPassword({ email, password })
→ Si OK: sesión JWT automática + cargar perfil de tms_usuarios (por email)
→ Si FALLA: fallback legacy RPC verify_user_password (migración lazy)
  → Si legacy OK: crear auth user via RPC create_auth_user + vincular auth_uid
  → Re-login con Supabase Auth
→ Verificar usuario activo → Cargar rol + permisos de tms_roles
→ Registrar acceso en tms_accesos → Redirigir a landing_page del rol
→ Iniciar heartbeat presencia (30s) → Init OTA + Push (si nativo)
```

### Permisos (client-side)
- **30+ rutas** mapeadas a permisos en `ROUTE_PERMISSIONS`
- **6 secciones** (tms, dashboard, inbound, outbound, queries, admin)
- **Navbar dinámico:** Solo muestra módulos con permiso
- **Guard en cada ruta:** `ProtectedRoute` verifica auth + permiso
- **Roles especiales:** ADMIN, ADMIN_DEV tienen acceso total

### Row Level Security (RLS) — Supabase (server-side)

**Estado:** ✅ Habilitado en 30/30 tablas (desde v1.4.0)

**Tier 1 — Tablas operacionales** (26 tablas):
Política: `auth.role() = 'authenticated'` para ALL operations.
Bloquea acceso anónimo, permite operación normal para todos los empleados autenticados.

Tablas: `wms_ubicaciones`, `tms_nv_diarias`, `tms_matriz_codigos`, `tms_partidas`, `tms_series`, `tms_farmapack`, `tms_pesos`, `tms_control_despacho`, `tms_direcciones`, `tms_mediciones_tiempos`, `tms_conductores`, `tms_entregas`, `tms_rutas`, `tms_recepciones`, `tms_recepcion_items`, `tms_nv_eliminadas`, `tms_errores_picking`, `tms_cubicaje_historial`, `tms_inventario_general`, `tms_inventario_resumen`, `wms_layout`, `tms_historial_cargas`, `tms_accesos`, `tms_usuarios_activos`, `tms_permisos`, `tms_roles_permisos`

**Tier 2 — Tablas con restricciones por rol** (4 tablas):

| Tabla | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| `tms_usuarios` | All auth | Admin only | Self o Admin | Admin only |
| `tms_roles` | All auth | Admin only | Admin only | Admin only |
| `tms_modules_config` | All auth | Admin only | Admin only | — |
| `tms_tickets` | Own o Admin | All auth | Admin only | Admin only |

**Helpers RLS (SECURITY DEFINER):**
- `get_user_role()` → TEXT — Obtiene rol del usuario desde `tms_usuarios.auth_uid`
- `is_admin()` → BOOLEAN — Verifica `rol = 'ADMIN'` o `es_admin_delegado = true`

---

## 6. Sistema Offline y Sincronización

```
┌─────────────────────────────────────────┐
│              ONLINE                      │
│  Supabase ←→ React Query (cache 5min)   │
│          ←→ Realtime channels           │
├─────────────────────────────────────────┤
│              OFFLINE                     │
│  Operación → Dexie syncQueue            │
│  (IndexedDB)                            │
│                                          │
│  Reconexión detectada (navigator.onLine) │
│  → syncManager procesa cola             │
│  → Retry exponencial con jitter         │
│    (max 8 intentos, backoff 2^n + rand) │
│  → TTL 72 horas → cleanup cada 10min   │
│  → Items muertos → status 'dead'        │
│    (no borrado silencioso, toast+log)   │
│  → Cola max: 500 items (protección)     │
│  → Sync interval: cada 15s online       │
│  → Tipos: rpc, upsert, update,         │
│    insert, delete                        │
└─────────────────────────────────────────┘
```

**Funciones del syncManager:**
- `enqueueSyncItem()` — Encola operación genérica (rpc/update/create/delete)
- `enqueueUpsert()` — Encola upsert batch (Entry.jsx, DataImport)
- `enqueueOfflineAction()` — Wrapper para acciones específicas (picking)
- `syncOfflineData()` — Procesa cola pendiente, retry con backoff exponencial + jitter
- `getFailedItems()` — Obtiene items fallidos/muertos para UI de auditoría
- `retryItem(id)` — Reintenta un item manualmente
- `removeItem(id)` — Elimina un item manualmente
- `cleanupStaleItems()` — Limpieza de items expirados (>72h)

**Entry.jsx — Integración offline:**
- Si `navigator.onLine === false` al guardar → encola directo a Dexie vía `enqueueUpsert()`
- Si falla la mutación por error de red → fallback automático a Dexie
- Se sincroniza automáticamente al recuperar conexión (listener `online`)

**Dexie Schema (v3):**
- `syncQueue`: type, tableName, recordId, data, onConflict, status, timestamp, retryCount, conflictResolution, lastAttempt, lastError, userId
- `cachedLocations`: ubicaciones cacheadas
- `cachedProducts`: productos cacheados (SKU, barcode, nombre)

---

## 7. Sistema Realtime

### Canales globales (Layout.jsx)
- `tms_nv_diarias` → Toast en nueva NV o cambio de estado
- `tms_partidas` → Toast en nueva partida
- `tms_series` → Toast en nueva serie
- `tms_farmapack` → Toast en nuevo lote

### Canales por módulo
| Módulo | Canal | Eventos |
|---|---|---|
| Picking | `picking_data` | Cambios en N.V. |
| Packing | `packing_data` + `packing` | N.V. + tiempos |
| PackingTV | `packing_tv_realtime` | Cambios N.V. |
| SalesOrders | `sales_orders` | Cambios N.V. |
| ControlTower | `tower_realtime_v3` | Conductores + rutas + entregas |
| MobileApp | `mobile_updates` | Entregas (filtro conductor_id) |
| SalesStatus | `sales_status_realtime` | N.V. + entregas |
| AdminMonitor | `admin_monitor` | Usuarios |
| Tickets | `public:tms_tickets` | Tickets |
| UploadHistory | `realtime-uploads` | Cargas INSERT |

---

## 8. Plataforma Móvil (Capacitor)

### Plugins instalados
| Plugin | Versión | Uso |
|---|---|---|
| `@capacitor-mlkit/barcode-scanning` | 8.1.0 | Escaneo QR/barcode con cámara |
| `@capacitor/haptics` | 7.0.5 | Vibración feedback |
| `@capacitor/push-notifications` | 7.0.6 | Notificaciones push FCM |
| `@capgo/capacitor-updater` | 7.45.10 | OTA updates |

### OTA Updates (Capgo)
**Config:** `autoUpdate: true` en capacitor.config.json

**Flujo actualización (v1.4.2):**
```
App inicia → notifyAppReady() → Capgo verifica versión en background
→ Si hay update: descarga automática → Evento downloadComplete
→ Callback onUpdateAvailable() notifica a App.jsx
→ UpdateOverlay fullscreen se muestra (version + countdown 4s)
→ Usuario puede pulsar "Actualizar Ahora" o esperar auto-apply
→ CapacitorUpdater.set({ id: bundleId }) → App se recarga
→ Si set() falla: fallback CapacitorUpdater.reload()
→ Si reload() falla: window.location.reload()
```

**Componentes:**
- `src/services/mobileService.js` — Core OTA + Push init, exports `onUpdateAvailable(cb)` y `applyPendingUpdate(bundleId)`
- `src/components/ui/UpdateOverlay.jsx` — Overlay fullscreen con countdown, progress bar, botón manual
- Integrado en `App.jsx` → `AppContent()` con state `pendingUpdate`

**Listeners registrados:**
- `downloadComplete` → Notifica UI overlay + auto-apply 4s
- `downloadFailed` → Toast error, retry automático
- `updateFailed` → Toast "versión anterior restaurada"

### Push Notifications (FCM)
**Canales Android:**
- `cco_tickets` (prioridad MAX) — Tickets soporte
- `cco_general` (prioridad HIGH) — General

**Flujo:**
```
App inicia → Verificar permisos → Crear canales → Registrar FCM
→ Token guardado en tms_usuarios.push_token
→ Foreground: toast con título/body
→ Background: al tocar → navegar a /admin/tickets (si ticket)
```

### Config Android
- **App ID:** `com.cco.wms`
- **Min SDK:** 24 (Android 7.0)
- **Target SDK:** 36 (Android 15)
- **Java:** 21

---

## 9. Deploy y CI/CD

### Web (Render)
```bash
git push origin main    # Render auto-detect y rebuild
```
- **Server:** Express.js (server.js) en puerto 3000
- **Static:** Sirve `dist/` con cache 1 día
- **Security:** CSP, HSTS, X-Frame-Options, X-XSS-Protection
- **SPA:** Todas las rutas → index.html

### Mobile OTA (Capgo)
```bash
npm run deploy:mobile   # scripts/deploy_mobile.js
```
1. Auto-increment versión patch en package.json
2. `npm run build` (Vite production)
3. `npx cap sync android` (copiar assets)
4. `npx @capgo/cli bundle upload` (subir a Capgo Cloud)

### APK Nativo
```bash
cd android && ./gradlew assembleRelease
```
- Output: `android/app/build/outputs/apk/release/`

---

## 10. Dependencias Principales

| Librería | Versión | Uso |
|---|---|---|
| React | 18.2.0 | UI Framework |
| React Router | 6.20.0 | Routing SPA |
| Vite | 5.4.21 | Build tool |
| Supabase JS | 2.98.0 | Backend client |
| TanStack React Query | 5.50.0 | Server state cache |
| TanStack Virtual | 3.8.3 | Virtual scrolling |
| TailwindCSS | 3.4.17 | CSS utility |
| GSAP | 3.14.2 | Animaciones |
| Recharts | 3.7.0 | Gráficos |
| Leaflet | 1.9.4 | Mapas |
| Dexie | 4.0.8 | IndexedDB offline |
| Sonner | 1.7.4 | Toast notifications |
| Zustand | 5.0.5 | State management |
| date-fns | 4.1.0 | Fechas |
| Sentry | 7.114.0 | Error tracking |
| Capacitor | 8.2.0 | Native bridge |

---

## 11. Formato Ubicaciones WMS

Las ubicaciones siguen el formato **RACK-POSICIÓN-NIVEL** (NO rack-nivel-posición).

Ejemplo: `A-05-3` = Rack A, Posición 05, Nivel 3

**Racks configurados:** A-I
- Niveles: 1-4 (varía por rack)
- Posiciones: 12-50 por nivel (varía por rack)

---

## 12. Mapa de Rutas

| Ruta | Componente | Categoría |
|---|---|---|
| `/login` | Login | Auth |
| `/dashboard` | Dashboard | Core |
| `/tms/dashboard` | DashboardTMS | TMS |
| `/tms/planning` | RoutePlanning | TMS |
| `/tms/control-tower` | ControlTower | TMS |
| `/tms/drivers` | Drivers | TMS |
| `/tms/mobile` | MobileApp | TMS |
| `/tms/yard` | YardManagement | TMS |
| `/mobile/pda` | WarehousePDA | Mobile |
| `/inbound/reception` | Reception | Inbound |
| `/inbound/entry` | Entry | Inbound |
| `/inbound/cubing` | CubingRegistry | Inbound |
| `/inbound/data-import` | DataImport | Inbound |
| `/outbound/sales-orders` | SalesOrders | Outbound |
| `/outbound/picking` | Picking | Outbound |
| `/outbound/packing` | Packing | Outbound |
| `/outbound/packing-tv` | PackingTV | Outbound |
| `/outbound/shipping` | Shipping | Outbound |
| `/queries/batches` | Batches | Queries |
| `/queries/sales-status` | SalesStatus | Queries |
| `/queries/addresses` | Addresses | Queries |
| `/queries/locations` | WmsLocations | Queries |
| `/queries/heatmap` | Heatmap | Queries |
| `/queries/historial-nv` | HistorialNV | Queries |
| `/queries/dispatch-control` | DispatchControl | Queries |
| `/admin/users` | Users | Admin |
| `/admin/roles` | Roles | Admin |
| `/admin/views` | Views | Admin |
| `/admin/cleanup` | Cleanup | Admin |
| `/admin/tickets` | Tickets | Admin |
| `/admin/upload-history` | UploadHistory | Admin |
| `/admin/locations` | LocationManager | Admin |
| `/admin/monitor` | AdminMonitor | Admin |

---

## 13. Tests Unitarios

Framework: **Vitest 4.x** + jsdom + @testing-library/react

```bash
npm test           # Ejecutar tests una vez
npm run test:watch # Modo watch
npm run test:coverage # Con cobertura
```

### Archivos de test

| Archivo | Módulo | Tests | Cobertura |
|---|---|---|---|
| `src/tests/syncManager.test.js` | SyncManager (offline queue) | 21 | enqueueSyncItem, enqueueUpsert, enqueueOfflineAction, syncOfflineData (upsert/rpc/update/delete), backoff exponencial, dead status, getFailedItems, retryItem, removeItem |
| `src/tests/pickingStore.test.js` | Picking Store (Zustand) | 10 | startSession, updateItemStatus (COMPLETO/PARCIAL/SIN_STOCK), updateTime, endSession, flujo completo, persistencia |
| `src/tests/groupOrders.test.js` | groupByNV (utility) | 8 | Agrupación por NV, null/undefined, cantidades inválidas, flags picking, ordenamiento |

### Setup de tests
- `src/tests/setup.js` — Mocks globales: sonner toast, navigator.onLine, window events

---

## 14. Escalabilidad — Índices y Plan

### Índices de Base de Datos

**Índices agregados (v1.4.0):**

| Tabla | Índice | Columnas | Justificación |
|---|---|---|---|
| tms_nv_diarias | idx_nv_diarias_estado_cliente | (estado, cliente) | Packing filtra por estado IN ('PACKING','QUIEBRE_STOCK') y agrupa por cliente |
| tms_nv_diarias | idx_nv_diarias_estado_fecha | (estado, fecha_emision) | SalesOrders filtra por estado + rango de fechas |
| tms_recepcion_items | idx_recepcion_items_recepcion | (recepcion_id) | FK lookup en detalle de recepciones |
| wms_ubicaciones | idx_wms_ubicaciones_ubic_codigo | (ubicacion, codigo) | ON CONFLICT en upserts de Entry/DataImport |
| tms_usuarios | idx_usuarios_auth_uid | (auth_uid) | RLS helpers is_admin()/get_user_role() hacen lookup por auth_uid en cada query |
| tms_usuarios | idx_usuarios_email | (email) | Login lookup por email en AuthContext |

### pg_cron — Jobs automáticos (v1.4.4)
| Job | Frecuencia | Acción |
|-----|-----------|--------|
| `refresh-dashboard-kpis` | Cada 5 min | REFRESH MATERIALIZED VIEW mv_dashboard_kpis |
| `cleanup-accesos-90d` | Domingo 3am | DELETE tms_accesos > 90 días |
| `cleanup-nv-eliminadas-60d` | Domingo 3am | DELETE tms_nv_eliminadas > 60 días |
| `cleanup-presencia-stale` | Cada 6h | DELETE tms_usuarios_activos > 24h |
| `vacuum-analyze-weekly` | Domingo 4am | VACUUM ANALYZE tablas grandes |
| `reset-pg-stats-monthly` | Día 1, 5am | Reset pg_stat_statements |

### pg_trgm — Búsqueda fuzzy (v1.4.4)
Extensión de trigramas habilitada para búsqueda tolerante a typos. Índices GIN en: `tms_nv_diarias.cliente`, `tms_nv_diarias.descripcion_producto`, `tms_matriz_codigos.producto`, `tms_direcciones.razon_social`, `wms_ubicaciones.descripcion`, `tms_partidas.producto`.

**RPC:** `fuzzy_search(p_table, p_column, p_query, p_limit, p_threshold)` — búsqueda universal con whitelist de tablas/columnas permitidas.

### Vista Materializada — Dashboard KPIs (v1.4.4)
`mv_dashboard_kpis`: Precalcula conteos por estado de NV. Se refresca cada 5 min via pg_cron.
**RPC:** `get_dashboard_kpis()` → JSON con todos los KPIs instantáneamente.

### Índices parciales (v1.4.4)
| Tabla | Índice | Filtro |
|-------|--------|--------|
| tms_nv_diarias | idx_nv_activas | WHERE estado NOT IN ('DESPACHADO','ENTREGADO','FACTURADO') |
| wms_ubicaciones | idx_ubicaciones_con_stock | WHERE cantidad > 0 |
| tms_partidas | idx_partidas_con_stock | WHERE disponible > 0 |
| tms_entregas | idx_entregas_activas | WHERE estado IN ('PENDIENTE','EN_RUTA') |

### Funciones batch (v1.4.4+)
`batch_update_nv_estado(p_nv_ids UUID[], p_nuevo_estado TEXT)` — Actualiza N notas de venta en 1 sola llamada RPC en vez de N requests individuales.

`bulk_upsert(p_table TEXT, p_data JSONB, p_conflict_keys TEXT)` — **(v1.4.5)** Inserta/actualiza miles de filas en una sola transacción PostgreSQL. Whitelist de tablas permitidas. Procesa internamente en batches de 500 dentro de la misma transacción, evitando múltiples round-trips HTTP. Usado por DataImport para datasets ≥ 2000 filas.

### Recomendaciones de paginación
- **SalesOrders**: Implementar paginación cursor-based cuando NVs > 500/día
- **Queries/HistorialNV**: Ya usa .range() — correcto
- **WmsLocations**: Considerar virtualización (react-virtual ya instalado) para > 10k ubicaciones

### Realtime selectivo
- Activo solo en: PackingTV (monitor), SalesOrders (pipeline), ControlTower
- Las tablas de referencia (conductores, skus, ubicaciones) NO usan realtime — correcto
- **Debounce aplicado** (v1.4.1): Todas las suscripciones realtime tienen debounce 800-1500ms para evitar cascadas de invalidación durante uploads masivos
- Layout global: notificaciones de INSERT agrupadas en ventanas de 2s (batch toasts)

### React Query — Configuración global (v1.4.1)
- `staleTime: 2 min` — datos se consideran frescos 2 min (antes 0ms = siempre stale)
- `gcTime: 10 min` — caché permanece 10 min antes de GC
- `refetchOnWindowFocus: false` — no refetch al cambiar de pestaña
- `retry: 1` — 1 reintento (antes 3)

---

## 15. Changelog Reciente

| Versión | Fecha | Cambios |
|---|---|---|
| 1.4.5 | 2026-05-28 | **FIX CARGA MASIVA LENTA**: RPC `bulk_upsert()` procesa datasets ≥2000 filas en una sola transacción PostgreSQL server-side. Datasets menores usan batches paralelos (5 concurrentes × 1000 filas). Deduplicación inteligente paginada en paralelo. Historial de carga non-blocking. Resultado: carga ~5-10x más rápida en datasets grandes |
| 1.4.4 | 2026-05-28 | **OPTIMIZACIONES SUPABASE FREE + INTEGRACIÓN FRONTEND**: **DB**: pg_cron (6 jobs auto), pg_trgm (6 índices GIN), vista materializada mv_dashboard_kpis (refresh 5min), 4 índices parciales. **RPCs**: get_dashboard_kpis(), fuzzy_search(), batch_update_nv_estado(). **Frontend**: Dashboard.jsx usa RPC get_dashboard_kpis() en vez de COUNT(*) sobre todas las NV — carga instantánea. Batches.jsx búsqueda fuzzy+exacta en paralelo — encuentra resultados con typos. SalesStatus.jsx fuzzy_search en campo cliente complementa ilike. Addresses.jsx fuzzy merge con búsqueda exacta. SalesOrders.jsx botón batch "Pasar todas a Picking" / "Despachar todas" usando batch_update_nv_estado RPC (1 call en vez de N) |
| 1.4.3 | 2026-05-27 | **OVERHAUL RESPONSIVE COMPLETO (320-412px) — 30+ archivos**: **Infraestructura**: viewport-fit=cover en index.html, breakpoint `xs:360px` en tailwind.config.js. **Outbound**: SalesOrders tablas overflow-x-auto + min-w-[700px], cell padding px-2 sm:px-4 md:px-6, modal grid-cols-1 xs:2 sm:4. Picking tabla + picking process responsive. Shipping tabla responsive. PackingTV grid-cols-1 sm:2 lg:12 (stacks en móvil). **Inbound**: Entry/Reception/CubingRegistry padding + grids responsive, tabla overflow-x-auto. **Queries**: Batches search pl-10, SalesStatus NV text-3xl sm:5xl, HistorialNV/DispatchControl tablas min-w + padding, Heatmap/WmsLocations/Addresses responsive. **Admin**: Users/Tickets/DataImport/Roles/Views/UploadHistory/LocationManager/AdminMonitor/Cleanup — KPI grids grid-cols-2, tablas padding px-2 sm:px-4, modales responsive, tabs overflow-x-auto. **TMS**: Dashboard stats grid-cols-2, Drivers tabla responsive, RoutePlanning/YardManagement padding + grids. **PDA**: WarehousePDA touch targets min-h-[44px], inputs/buttons sizing responsive |
| 1.4.2 | 2026-05-27 | **OTA UPDATE OVERLAY**: Reemplazo de toast por overlay fullscreen con countdown 4s + botón "Actualizar Ahora" + cadena fallback set→reload→location.reload. **RESPONSIVE MOBILE 320px**: Fix filter pills MobileApp (px-3 sm:px-5), modal max-h-[90vh] overflow, stat cards sizing. Navbar drawer max-w-[280px] en 320px. ControlTower KPI grid-cols-2 sm:4 lg:7. Dashboard tabla padding px-3 sm:px-6. Packing grid-cols-1 sm:3 |
| 1.4.1 | 2026-05-27 | **FIX PERFORMANCE CRÍTICO**: QueryClient configurado con staleTime 2min + gcTime 10min + refetchOnWindowFocus:false. Debounce 800-1500ms en TODAS las suscripciones realtime (useRealtimeTable, PackingTV, ControlTower, SalesStatus, Users). Layout: toasts batch agrupados en ventana 2s — fix directo del freeze en uploads masivos de Farmapack/NV |
| 1.4.0 | 2026-05-26 | **MIGRACIÓN AUTH + RLS**: Custom auth → Supabase Auth nativo. 21 usuarios migrados. AuthContext reescrito. Users.jsx via RPC. RLS 30/30 tablas. **TESTS**: Vitest configurado, 39 tests (syncManager 21, pickingStore 10, groupOrders 8). **ÍNDICES**: 6 índices compuestos agregados para queries críticas. **ESCALABILIDAD**: Plan documentado (paginación, realtime selectivo) |
| 1.3.7 | 2026-05-26 | Rewrite completo syncManager: backoff exponencial con jitter, TTL 72h, status 'dead' en vez de borrado silencioso, soporte upsert batch, cola max 500 items, utilidades getFailedItems/retryItem/removeItem. Entry.jsx integrado con syncManager — offline enqueue automático vía enqueueUpsert + fallback en onError |
| 1.3.6 | 2026-05-26 | Fix OTA update: app no se reiniciaba tras descargar actualización. Se corrigió extracción de bundle ID del evento downloadComplete + fallback reload() |
| 1.3.5 | 2026-05-26 | Escaneo QR/barcode agregado al módulo DataImport. Toggle paste/scan, acumulador de items escaneados, auto-lookup producto en tms_matriz_codigos |
| 1.3.4 | — | Fix responsive para dispositivos Redmi (360px-412px) |
| 1.3.3 | — | Botones cámara siempre visibles para Serie/Partida + fix responsive |
| 1.3.2 | — | Overhaul responsive completo para 360px+ |
| 1.3.1 | — | Estado "Solo Facturar" en pipeline de ventas |
| 1.3.0 | — | Descripción completa de producto en módulo Lotes y Series |
