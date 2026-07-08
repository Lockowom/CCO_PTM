# CCO PTM — Documentación Técnica Completa

> **Versión:** 1.4.59 | **Última actualización:** 2026-06-14
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
| `tms_usuarios` | Cuentas de usuario, push_token, auth_uid | Auth, Admin, Monitor |
| `tms_usuarios_activos` | Presencia/heartbeat de usuarios conectados | AuthContext, Monitor |
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
| `wms_layout` | Layout físico de bodega (racks/niveles) | warehouseStore, Heatmap |
| `tms_cubicaje_historial` | Historial cubicaje productos | CubingRegistry |
| `tms_monitoreo_informes` | Cabecera de informes a Calidad (correlativo `MON-YYYY-NNNN`); `tipo_informe` MONITOREO\|DANOS + `reporte` jsonb (secciones narrativas del informe de daños) | Monitoreo (Calidad) |
| `tms_monitoreo_items` | Detalle por ítem/hallazgo del informe + dictamen de Calidad (`tipo_dano`/`componente_afectado`/`consecuencia` para daños) | Monitoreo (Calidad) |
| `tms_monitoreo_evidencias` | Evidencia fotográfica por hallazgo (bucket `monitoreo-evidencias`) del informe de daños | Monitoreo (Calidad) |
| `tms_calidad_flags` | Overlay persistente de estado de calidad por `codigo_producto`+`partida`+`ubicacion` (sobrevive la recarga del snapshot) | WmsLocations, Monitoreo, useCalidadFlags |
| `tms_notificaciones` | Avisos persistentes (p.ej. movimiento sistémico a transitoria) dirigibles por rol/usuario | Monitoreo (Calidad), Layout |

> **Notas:**
> - `tms_partidas`, `tms_series`, `tms_farmapack` e `tms_inventario_general` se cargan
>   principalmente vía RPC `bulk_upsert` (carga masiva) y no por `.from()` directo desde el
>   front; por eso pueden no aparecer en búsquedas de `.from('...')` en `src/`.
> - Las RPC (`bulk_upsert`, `search_batches`, `fuzzy_search`, `get_dashboard_kpis`,
>   `batch_update_nv_estado`, `prepare_nv_import`, `sync_deleted_items`) y la capa de seguridad
>   (`private.*` + wrappers) están versionadas en **`supabase/functions_snapshot.sql`**
>   (exportadas de la BD live el 2026-05-29). El DDL `CREATE TABLE` de las tablas aún vive solo
>   en la BD live. Scripts SQL históricos en `supabase/legacy_sql/` (no ejecutar).

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
- **Frescura de stock (`StockFreshness` + `useStockFreshness`):** muestra última
  actualización (fecha/hora/usuario, desde `tms_historial_cargas`). Vigencia diaria con
  **corte a las 06:00 hrs** (ciclo `06:00 → 06:00`); si el stock de Partidas/Series/Farmapack
  supera el ciclo, muestra aviso "Favor actualizar stock" con firma animada "Atte, Tío Inventario".
  El corte se fija **antes** de la ventana de carga matutina real (~08:11–08:20) para que una
  carga de la mañana cuente para el día en curso y no se marque desactualizada apenas pasada la
  hora de corte (el corte previo de 08:30 coincidía con la carga y provocaba falsos "Desactualizado").
  Hora de corte parametrizada en `RESET_HOUR`/`RESET_MIN` (`useStockFreshness.js`).

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

### 4.8 Calidad — Monitoreo (`/quality/monitoreo`)
**Archivo:** `src/pages/Quality/Monitoreo.jsx`

Implementa la celda *Inventario · Estancia · Monitoreo rutinario a Calidad* de la matriz
de procesos de bodega. Inventario genera un **informe de monitoreo** sobre el stock; Calidad
emite el **dictamen técnico**; el sistema persiste un **estado de calidad** que se superpone
al inventario (visible para todos) y notifica a Inventario/Admin los **movimientos sistémicos**.

El módulo maneja **dos tipos de informe** (`tipo_informe`):
- **`MONITOREO`** (rutinario): candidatos del stock + dictamen por ítem + export Excel.
- **`DANOS`** (Informe de Daños / No Conformidad, v1.5.0): documento formal de mercadería
  dañada con secciones narrativas (antecedentes, hallazgos, cuadro resumen, causa probable,
  acciones, firmas) y **evidencia fotográfica por hallazgo**, exportable a **Word y PDF**.

**Flujo:**
```
Inventario → Nuevo informe → buscar candidatos (RPC monitoreo_candidatos: stock actual +
  ubicación REAL (wms_ubicaciones) + semáforo de vencimiento) → agregar ítems
  (condición/motivo/obs) → Enviar a Calidad
Calidad → abrir informe → dictaminar por ítem (LIBERAR/CUARENTENA/REPROCESO/RECHAZAR/BAJA
  + bodega destino + acuse) → RPC monitoreo_dictaminar
  → persiste dictamen + upsert en tms_calidad_flags + notifica MOV_TRANSITORIA al ADMIN
Daños → Nuevo Informe de Daños → llenar secciones + hallazgos → Guardar (genera IDs) →
  adjuntar fotos por hallazgo (bucket monitoreo-evidencias) → Exportar Word / PDF
```

- **Tablas:** `tms_monitoreo_informes` (+ `tipo_informe`, `reporte` jsonb), `tms_monitoreo_items`
  (+ `tipo_dano`, `componente_afectado`, `consecuencia`), `tms_monitoreo_evidencias` (fotos),
  `tms_calidad_flags`, `tms_notificaciones`
- **RPCs:** `monitoreo_next_numero()`, `monitoreo_candidatos(text,bool)`, `monitoreo_dictaminar(...)`
  (todas `SECURITY DEFINER`, `search_path=public`, sin EXECUTE para `anon`).
  `monitoreo_candidatos` (migración `012`) se basa en **`wms_ubicaciones`** (verdad física,
  una fila por SKU+ubicación con stock>0), enriquecida con vencimiento/UM desde
  `tms_partidas`/`tms_farmapack` — coincide con la vista *Ubicaciones WMS*.
- **Storage:** bucket público `monitoreo-evidencias` (8MB, solo imágenes; escritura
  `can_manage_calidad()`); fotos comprimidas en cliente (1600px/JPEG 0.82) vía
  `src/components/PhotoUploader.jsx` y `src/lib/imageCompress.js`.
- **Exportación de daños:** `src/lib/exportInformeDanos.js` (`docx` para Word, `pdfmake` para PDF,
  ambos con import dinámico para no inflar el bundle principal; fotos embebidas).
- **Editar/eliminar:** cualquier informe es editable o eliminable (`useActualizarInforme`,
  `useGuardarInformeDanos`, `useEliminarInforme`); borrar un informe dictaminado conserva el
  overlay `tms_calidad_flags`.
- **Persistencia:** el estado de calidad vive en `tms_calidad_flags` anclado por
  `codigo_producto`+`partida`+`ubicacion` → **sobrevive la recarga diaria del snapshot**
  (`tms_partidas`/`tms_series`/`tms_farmapack`, ciclo 08:30→08:30).
- **Overlay global:** `useCalidadFlags` + `CalidadBadge` pintan el estado
  (EN AUDITORÍA / CUARENTENA / MALO / LIBERADO) en *Ubicaciones* (`WmsLocations.jsx`), visible
  para cualquier usuario autenticado.
- **Bodegas destino:** `5` = Servicio Técnico · `99` = Basura/Baja definitiva (estado `transitoria`).
- **Permisos:** `manage_monitoreo` (Inventario crea informes) · `manage_quality` (Calidad dictamina).
  RLS: lectura `authenticated`; escritura `can_manage_calidad()`.

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
- ~~`verify_user_password()`~~ — **ELIMINADA** (migración 006) junto con la columna
  `password_hash`. Todos los usuarios usan Supabase Auth; no hay fallback legacy.

### Flujo de Login
```
Usuario ingresa email/contraseña
→ supabase.auth.signInWithPassword({ email, password })
→ Si OK: sesión JWT automática + cargar perfil de tms_usuarios (por email)
→ Si FALLA: credenciales inválidas (sin fallback legacy — retirado en migración 006)
→ Verificar usuario activo → Cargar rol + permisos de tms_roles
→ Registrar acceso en tms_accesos → Redirigir a landing_page del rol
→ Iniciar heartbeat presencia (30s) → Init OTA + Push (si nativo)
```

### Permisos (client-side)
- **Fuente única:** `ROUTE_PERMISSIONS` (`src/constants/permissions.js`) mapea cada ruta a sus
  permisos. El catálogo otorgable está en `src/config/modules.js` (`APP_PERMISSIONS`), usado por
  la matriz de Roles. Todo permiso que controla una ruta debe existir en el catálogo.
- **Navbar 100% derivado:** un módulo/ruta se muestra solo si el usuario tiene el permiso de esa
  ruta (`canAccessRoute`, **deny-by-default**: ruta sin permiso definido → no se muestra). Una
  sección se muestra solo si el usuario puede acceder a ≥1 de sus rutas (`isModuleVisible`). Se
  eliminó `SECTION_PERMISSIONS` (lista por sección que se desincronizaba).
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

**Calidad / Monitoreo (migración 011, lectura `authenticated`, escritura por helper):**

| Tabla | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| `tms_monitoreo_informes` | All auth | `can_manage_calidad()` | `can_manage_calidad()` | `can_manage_calidad()` |
| `tms_monitoreo_items` | All auth | `can_manage_calidad()` | `can_manage_calidad()` | `can_manage_calidad()` |
| `tms_monitoreo_evidencias` (mig. 013) | All auth | `can_manage_calidad()` | `can_manage_calidad()` | `can_manage_calidad()` |
| `tms_calidad_flags` | All auth | `can_manage_calidad()` | `can_manage_calidad()` | `can_manage_calidad()` |
| `tms_notificaciones` | All auth | `can_manage_calidad()` | All auth (marcar leída) | Admin only |

**Helpers RLS (SECURITY DEFINER):**
- `get_user_role()` → TEXT — Obtiene rol del usuario desde `tms_usuarios.auth_uid`
- `is_admin()` → BOOLEAN — Verifica `rol = 'ADMIN'` o `es_admin_delegado = true`
- `can_manage_fichas()` → BOOLEAN — ADMIN / delegado / permiso `manage_fichas`
- `can_manage_calidad()` → BOOLEAN — ADMIN / delegado / permiso `manage_quality` o `manage_monitoreo`
- Canónicas en esquema `private` (`private.is_admin()`, `private.get_user_role()`) con wrapper
  `public`. Existen helpers legacy `is_admin_safe()` / `is_user_admin()` (por email) pendientes
  de limpieza — ver `REVISION_PROYECTO.md` §DB-2.

### Hardening de RPC SECURITY DEFINER (2026-05-29)
- `bulk_upsert` y `search_batches` (SECURITY DEFINER) ya **no** son ejecutables por el rol
  `anon` (antes permitían escritura/lectura sin autenticar vía `/rest/v1/rpc`). Se revocó
  EXECUTE de `PUBLIC`/`anon` (se conserva `authenticated`) y se fijó `search_path = public,
  extensions, pg_temp`. Migración `004_harden_security_definer_rpcs.sql`.
- `mv_dashboard_kpis` ya no es seleccionable por `anon` (se lee vía RPC `get_dashboard_kpis`).
- `clean_operational_data` está protegida por `is_admin()` (esquema `private`, SECURITY DEFINER).

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
| `@capacitor-mlkit/barcode-scanning` | ^8.1.0 | Escaneo QR/barcode con cámara |
| `@capacitor/haptics` | ^7.0.0 | Vibración feedback |
| `@capacitor/push-notifications` | ^7.0.0 | Notificaciones push FCM |
| `@capgo/capacitor-updater` | ^7.0.0 | OTA updates |

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

> Versiones según rangos declarados en `package.json` (fuente de verdad).

| Librería | Versión | Uso |
|---|---|---|
| React | ^18.2.0 | UI Framework |
| React Router | ^6.20.0 | Routing SPA |
| Vite | ^5.0.0 | Build tool |
| Supabase JS | ^2.98.0 | Backend client |
| TanStack React Query | ^5.50.0 | Server state cache |
| TanStack Virtual | ^3.8.3 | Virtual scrolling |
| TailwindCSS | ^3.3.5 | CSS utility |
| GSAP | ^3.14.2 | Animaciones |
| Recharts | ^3.7.0 | Gráficos |
| Leaflet | ^1.9.4 | Mapas |
| Dexie | ^4.0.8 | IndexedDB offline |
| Sonner | ^2.0.7 | Toast notifications |
| Zustand | ^4.5.2 | State management |
| date-fns | ^4.1.0 | Fechas |
| Sentry | ^7.114.0 | Error tracking |
| Capacitor | ^8.2.0 | Native bridge |

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
| 1.4.67 | 2026-07-07 | **Logo PTM Health incrustado en el Certificado/Acta ISO**. Se agrega `src/assets/logoPtm.js` (logo PNG 257×77 como data URI) y se incrusta en el **encabezado** de control documental del Certificado/Acta, tanto en **PDF** (pdfmake) como en **Word** (docx `ImageRun`), junto a la razón social y el bloque código/revisión/norma. `DOC_CONTROL.logo` apunta al asset (reemplazable). Solo frontend. Tests 45/45 y build OK. |
| 1.4.66 | 2026-07-07 | **Certificado/Acta del CheckList — formato ISO 13485 (control documental) + folio como sello**. Se rehace `src/lib/exportChecklistIngreso.js` con **encabezado y pie de control documental en cada página** (PDF vía `header`/`footer`, Word vía `Header`/`Footer` con `PageNumber`): encabezado con **empresa** (`PTM CHILE LTDA.`, configurable en `DOC_CONTROL`), subtítulo, **código de documento** (`FO-CAL-001`), **revisión**, **norma `ISO 13485:2016`** y vigencia; pie con `Código · Rev · Norma · Documento controlado · Página X de Y`. El **folio** (`CERT-AAAA-NNNN`) se muestra como **sello/timbre** (recuadro verde CONFORME / rojo NO CONFORME) con responsable y fecha. Todo el control documental (empresa, logo en base64, código, revisión, norma) es **configurable** en la constante `DOC_CONTROL`. Solo frontend. Tests 45/45 y build OK. **Pendiente (backlog):** **firma digital** sobre este certificado (server-side, elección A/B/C) y extender el mismo formato ISO a los informes de Monitoreo/Daños. |
| 1.4.65 | 2026-07-07 | **CheckList de Ingreso — descarga del documento (Certificado / Acta) en PDF y Word**. Nuevo `src/lib/exportChecklistIngreso.js` (`exportChecklistPDF` / `exportChecklistWord`, import dinámico como los demás informes): si la tarea es **CONFORME** genera un **"Certificado de Conformidad"** con el **folio**; si es **NO CONFORME** un **"Acta — CheckList de Ingreso (No Conforme)"**. El documento incluye datos de la recepción (proveedor, OC, origen, fecha, bultos), el **detalle de todos los ítems del checklist con su resultado** (Conforme/No conforme/N-A) y notas, observaciones y bloque de firmas. Botones **PDF / Word** en el detalle de la tarea (`ChecklistIngreso.jsx`). Solo frontend. Tests 45/45 y build OK. |
| 1.4.64 | 2026-07-07 | **CheckList de Ingreso — certificación automática + generación directa del Informe de Daños**. **(1) Certificación automática**: se reemplazan los botones manuales "Certificar Conforme / No Conforme" por **un solo "Finalizar"** que **decide el resultado por las respuestas** (todos OK → CONFORME + folio; algún NO → NO CONFORME + tarea urgente). La barra de acciones muestra en vivo el "Resultado automático: CONFORME / NO CONFORME". **(2) Generación directa**: en una tarea NO CONFORME aparece el botón **"Generar Informe de Daños"** que abre el Informe de Daños **pre-cargado** con la recepción (proveedor, OC, origen, fecha en los antecedentes) — antes había que ir a la pestaña Informes y llenarlo desde cero. `Monitoreo.jsx` pasa `onGenerarDanos`/`prefill`; `InformeDanosBuilder` acepta `prefill`. Solo frontend. Tests 45/45 y build OK. |
| 1.4.63 | 2026-07-07 | **FIX (CheckList de Ingreso — la recepción nueva no aparecía en vivo)**: la cola de tareas no se actualizaba al registrar una recepción nueva. Causa: `tms_calidad_tareas` **no estaba en la publicación `supabase_realtime`** (ninguna notificación en vivo) y la query quedaba cacheada (staleTime 2min). **Solución**: **(BD, migración `029_realtime_calidad_tareas`)** `ALTER PUBLICATION supabase_realtime ADD TABLE tms_calidad_tareas`; **(frontend)** suscripción `useRealtimeTable('tms_calidad_tareas', ['calidad_tareas'])` a nivel del módulo Calidad (refresca cola **y** badge en vivo, en ambas pestañas) + la query `useTareasChecklist` pasa a `staleTime:0` / `refetchOnMount:'always'` (al abrir la pestaña siempre trae lo último). Tests 45/45 y build OK. |
| 1.4.62 | 2026-07-07 | **NUEVO: CheckList de Ingreso de Calidad (hito "Ingreso a bodega")**. Conecta **Recepción → Calidad**: cada vez que se **registra una recepción** (Importaciones o Nacionales) un **trigger `AFTER INSERT`** crea automáticamente una **tarea de CheckList** para Calidad. **BD (migración `028_checklist_ingreso_calidad`, en live)**: tabla `tms_calidad_tareas` (cola de tareas, con `estado`, `checklist` jsonb, `folio`, resultado), triggers en `tms_recepciones` y `tms_recepciones_nacionales` (`crear_tarea_checklist_ingreso`, que además inserta notificación), y RPC `guardar_checklist_ingreso` (guarda avance, o finaliza: **CONFORME** → folio de certificación `CERT-AAAA-NNNN` bajo advisory lock; **NO CONFORME** → notificación **URGENTE** para generar el Informe de Daños / NC proveedor). RLS lectura `authenticated`; escritura solo por RPC (gate de permiso Calidad/Monitoreo). **Frontend**: nueva pestaña **"CheckList de Ingreso"** en el módulo Calidad (`src/pages/Quality/ChecklistIngreso.jsx` + integración en `Monitoreo.jsx`, con badge de pendientes); los **parámetros del checklist** viven en `calidadService.js` (`CHECKLIST_INGRESO_NIVELES`: Nivel 1 revisión documental del Packing List, Nivel 2 inspección física de embalajes), respondibles OK/NO/NA con nota; certificar Conforme o marcar No Conforme. **Fuera de alcance (backlog):** la **lectura automática del packing list** — la validación de cantidad es manual dentro del checklist (ver `PENDIENTES_CALIDAD_RECEPCION.md`). Tests 45/45 y build OK. |
| 1.4.61 | 2026-07-07 | **BARRIDO DE BUGS — 2ª tanda** (cierra el resto de la revisión). **CA-7 (migración `026_monitoreo_editar_preserva_dictamen`, en live)**: al reeditar un informe ya DICTAMINADO, `actualizar_informe_monitoreo` ahora **conserva el dictamen** de los ítems que persisten (emparejados por clave natural `codigo_producto\|partida\|ubicacion`) y **re-vincula** `tms_calidad_flags.item_id` al nuevo ítem; los flags de ítems removidos quedan sin `item_id` colgante (se conservan, anclados por clave natural). Verificado end-to-end. **CA-10 (migración `027_monitoreo_candidatos_venc_por_partida`, en live)**: `monitoreo_candidatos` heredaba la fecha de vencimiento de un lote arbitrario cuando la ubicación no traía partida → marcaba PERECIBLE con semáforo incorrecto. Ahora la fecha **solo** se hereda si la partida de la ubicación coincide con el lote (producto/UM siguen por SKU). **IN-9**: `useBarcodeScanner` detiene el scanner al desmontar (defensa). **M-2**: se **unifican las stores** en `src/stores/` (se movió `warehouseStore` desde `src/store/`, ya eliminada) y se retira el método muerto y peligroso `warehouseStore.moveItem` (mutaba `wms_ubicaciones` sin transacción/kardex; no estaba conectado a la UI). **Tests 45/45 y build OK.** Nota: `operaciones` (migración `017`) no existe en la BD live (se creó y luego se eliminó sin migración de drop); `mv_dashboard_kpis` ya no es legible por `anon` y el índice duplicado de `tms_farmapack` ya no está → esos hallazgos de seguridad/perf estaban ya mitigados. Pendientes intencionales: activar "leaked password protection" (dashboard Auth), autorización server-side de rutas (RLS es el gate real), y refactor de god-components / logger central (requieren pruebas dedicadas). |
| 1.4.60 | 2026-07-07 | **REVISIÓN COMPLETA + BARRIDO DE BUGS** (ver `REVISION_PROYECTO_2026-07-07.md`). **BD/Versionado (V-1/V-2)**: se sincronizaron al repo las **8 migraciones que solo vivían en la BD live** (`017_create_operaciones_table`, `018_fix_rbac_privilege_escalation` [seguridad: saca `tms_usuarios/roles/permisos/roles_permisos` del modelo `USING(true)` + trigger anti-escalada], `019_consolidar_roles_basura`, `020_audit_and_hardening` [seguridad: `tms_auditoria` + triggers + hardening de `clean_operational_data`], `021_recepcion_nacionales`, `022_monitoreo_flags_preliminares`, `023_calidad_lotes_series`, `024_monitoreo_no_registrado`), renumeradas cronológicamente sin colisión (cada archivo mapea a su `schema_migrations`). **Calidad — transaccionalidad (migración `025_monitoreo_informe_transaccional`, aplicada en live)**: crear/editar informe de Monitoreo pasa a RPC atómica (`crear_informe_monitoreo` / `actualizar_informe_monitoreo`); antes editar hacía `UPDATE+DELETE+INSERT` en peticiones sueltas y un fallo del INSERT **borraba los ítems sin restaurarlos** (CA-1). El correlativo `MON-AAAA-NNNN` se genera dentro de la transacción bajo `pg_advisory_xact_lock` → sin carrera ni violación de `UNIQUE` (CA-2/CA-3). Verificado end-to-end. **Frontend (bugs)**: **IN-1 (crítico)** la cola offline recupera ítems atascados en `syncing` (corte a mitad de sync) → no se pierden operaciones; **IN-2** `initPushNotifications` hace `removeAllListeners` antes de re-registrar (fin de toasts duplicados/fuga); **IN-3** el CSP de `server.js` permite `nominatim`/`osrm` (Costos de Transporte estaba **roto en la web** por CSP); **IN-4/IN-7** retiradas las llamadas muertas a `InventoryService.moveStock` en Picking y **eliminados 11 archivos sin uso** (`inventoryService`, `wmsLogic`, `labelPrinter`, `AnimatedPage`, `useSupabaseTable/Mutation`, `useScanner`, `usePushNotifications`, `constants/index`, `utils/isoCoords`); **IN-5** `useRealtimeTable` con topic único por instancia; **IN-6** `AuthContext` deduplica la carga de perfil (login + `SIGNED_IN`); **IN-8** `usePresence` depende de `user.id`. **Calidad UI**: CA-4 se limpia `cantidad_afectada` al volver la condición a OK; CA-5 al borrar hallazgos de Daños se limpian las evidencias en Storage (el cascade no borraba los objetos → fuga); CA-6 la precarga en edición no pisa el trabajo en curso; CA-8 `uid()` con fallback si `crypto.randomUUID` no existe; CA-9 el export de Daños no imprime "Cantidad afectada: 0". **Tests 45/45 y build OK.** `dist/` se regenera al desplegar. |
| 1.4.59 | 2026-06-14 | **DEPLOY del informe Word/PDF de Monitoreo**: bundle móvil `com.cco.wms@1.4.59` a Capgo OTA + web a Render. El script `deploy:mobile` auto-incrementa el patch (1.4.58→1.4.59). |
| 1.4.58 | 2026-06-14 | **CALIDAD — Informe de Monitoreo formal a Word y PDF**: el informe de Monitoreo ahora exporta un **documento formal** (además del Excel), igual que el de Daños. Nuevo `src/lib/exportInformeMonitoreo.js` con `exportInformeMonitoreoWord` (docx) y `exportInformeMonitoreoPDF` (pdfmake), import dinámico: título, cabecera (fecha/bodega/analista/periodicidad/estado), **resumen ejecutivo** (total, dictaminados, pendientes, con problema, no registrados, semáforo, por dictamen), **tabla de ítems** (SKU, producto, lote/serie, ubicación, cant, afectadas, condición, dictamen) y firmas (Analista / Calidad). Botones **Word/PDF/Excel** en `InformeDetail` (`Monitoreo.jsx`). Sin cambios de BD. |
| 1.4.57 | 2026-06-14 | **DEPLOY de la Fase 2 (informe de Calidad)**: bundle móvil `com.cco.wms@1.4.57` a Capgo OTA + web a Render. El script `deploy:mobile` auto-incrementa el patch (1.4.56→1.4.57). |
| 1.4.56 | 2026-06-14 | **CALIDAD — Fase 2: rediseño del informe (pantalla + Excel)**. **Pantalla (`InformeDetail` en `Monitoreo.jsx`)**: nuevo **panel de resumen** con barra de avance del dictamen (%), KPIs (Ítems, Dictaminados, Pendientes, Con problema, No registrados) y chips de semáforo de vencimiento; tarjetas de ítem pulidas (badge "No registrado", condición resaltada en ámbar cuando ≠ OK, uds afectadas). **Excel** enriquecido: hoja Detalle con columnas nuevas (Lote_Serie, Uds_Afectadas, No_Registrado) y hoja Resumen ampliada (pendientes, con problema, no registrados, y desgloses por semáforo, por dictamen y por condición). Sin cambios de BD. |
| 1.4.55 | 2026-06-14 | **DEPLOY del push en dictámenes**: bundle móvil `com.cco.wms@1.4.55` a Capgo OTA + web a Render. El script `deploy:mobile` auto-incrementa el patch (1.4.54→1.4.55). |
| 1.4.54 | 2026-06-14 | **CALIDAD — Push a móvil también en dictámenes Cuarentena/Rechazar/Baja**: además del SKU no registrado, ahora cuando Calidad dictamina un ítem como **CUARENTENA, RECHAZAR o BAJA** se envía push a móvil (ADMIN) vía la misma Edge Function `notify-inventario`. Se refactoriza el helper a `pushAdminInventario({title,body,payload})` genérico + `notificarDictamenPush` en `calidadService.js`; se dispara en `enviarDictamen` de `InformeDetail` (`Monitoreo.jsx`). REPROCESO (En Auditoría) no notifica. |
| 1.4.53 | 2026-06-14 | **DEPLOY del push a móvil (Calidad)**: bundle móvil `com.cco.wms@1.4.53` a Capgo OTA + web a Render. Edge Function `notify-inventario` desplegada y ACTIVE en Supabase. El script `deploy:mobile` auto-incrementa el patch (1.4.52→1.4.53). |
| 1.4.52 | 2026-06-14 | **CALIDAD — Push a móvil por SKU no registrado**: la alerta de SKU no registrado ahora **llega como notificación push** al celular de los ADMIN (app Android). **Edge Function `notify-inventario`** (nueva, `verify_jwt`) — clon de `notify-ticket`: FCM HTTP **v1** (OAuth2 con Service Account `FCM_SERVICE_ACCOUNT`), busca `push_token` de los usuarios del rol destino (ADMIN) y envía. Cliente: `notificarInventarioPush` en `calidadService.js` invoca la función al enviar a Calidad cuando hay alertas (`Monitoreo.jsx`). Solo app móvil (no web); requiere permiso de notificaciones y sesión activa. Reutiliza el canal `cco_tickets` y el secreto FCM ya configurado. |
| 1.4.51 | 2026-06-14 | **DEPLOY del alta manual + alerta a Inventario**: bundle móvil `com.cco.wms@1.4.51` a Capgo OTA + web a Render. Migración `020` ya aplicada en BD live. El script `deploy:mobile` auto-incrementa el patch (1.4.50→1.4.51). |
| 1.4.50 | 2026-06-14 | **CALIDAD — Alta manual (SKU no registrado) + alerta a Inventario**: en la toma se agrega botón **"Agregar manual"** para capturar un producto hallado en auditoría que **no aparece** en la búsqueda (código + ubicación obligatorios + lote/serie + cantidad), aunque no esté registrado en ninguna ubicación. El ítem se marca **"No registrado"** (badge ámbar) y condición `Sobrante`. **BD (migración `020_monitoreo_no_registrado.sql`)**: columna `no_registrado` en `tms_monitoreo_items`; la RPC `monitoreo_marcar_preliminar` extendida para (a) crear flag `EN_AUDITORIA` también para ítems no registrados (nota "NO REGISTRADO —") y (b) **insertar una alerta en `tms_notificaciones`** (`tipo=CALIDAD_NO_REGISTRADO`, payload con código/ubicación/lote) para que Inventario lo dé de alta; devuelve `{flags, alertas}`. La alerta queda registrada (aún sin bandeja de notificaciones en el front) y el hallazgo es visible como flag en Ubicaciones. Toast de confirmación de alertas al enviar. |
| 1.4.49 | 2026-06-14 | **DEPLOY del selector de Lote/Serie**: bundle móvil `com.cco.wms@1.4.49` a Capgo OTA + web a Render. Migración `019` ya aplicada en BD live. El script `deploy:mobile` auto-incrementa el patch (1.4.48→1.4.49). |
| 1.4.48 | 2026-06-14 | **CALIDAD — Selector de Lote/Serie en la toma**: al capturar un ítem de auditoría se agrega un **selector desplegable** de lotes (P) y series (S) del producto, con **filtro rápido server-side** (para productos con muchas series), badge tipo (LOTE/SERIE), disponible y ubicación; al elegir uno **autocompleta la ubicación**. Si la partida/serie **no aparece**, permite **ingreso manual** («usar X») para continuar mientras Inventario ajusta. **BD (migración `019_calidad_lotes_series.sql`)**: RPC `calidad_lotes_series(codigo, query, limit)` (`SECURITY DEFINER`, sin anon) que une `tms_partidas` (lote + ubicación vía LATERAL a `wms_ubicaciones`) y `tms_series` (serie + ubicacion_actual), filtrable e IN­dizada por producto. Componente `LoteSerieSelector` + servicio `fetchLotesSeries` en `Monitoreo.jsx`/`calidadService.js`. |
| 1.4.47 | 2026-06-14 | **DEPLOY de la toma de auditoría (Calidad Fase 1)**: bundle móvil `com.cco.wms@1.4.47` a Capgo OTA + web a Render. Migración `018` ya aplicada en BD live. El script `deploy:mobile` auto-incrementa el patch (1.4.46→1.4.47). |
| 1.4.46 | 2026-06-14 | **CALIDAD — Toma de auditoría mejorada + reflejo preliminar en Ubicaciones (Fase 1)**: rediseño de la captura de ítems en `InformeBuilder` (`Monitoreo.jsx`): cada producto se captura en tarjeta con **ubicación obligatoria** (no deja "Enviar a Calidad" si falta; se resalta en rojo y muestra contador "N sin ubicación"), **condición observada en chips de color** (OK verde / problema ámbar con ícono), **cantidad total** y **uds afectadas** (nuevo campo, solo si la condición ≠ OK) y nota. **BD (migración `018_monitoreo_flags_preliminares.sql`)**: columna `cantidad_afectada` en `tms_monitoreo_items` + RPC `monitoreo_marcar_preliminar(uuid)` (`SECURITY DEFINER`, gate `manage_monitoreo`/`manage_quality`/admin) que, al enviar a Calidad, crea flags **EN_AUDITORIA** en `tms_calidad_flags` para los ítems con condición problemática + ubicación → se ven de inmediato en el Explorador de Ubicaciones. El dictamen posterior de Calidad refina el flag (Cuarentena/Malo/Liberado) sin degradar severidades ya mayores. Servicio: `marcarPreliminarCalidad` en `calidadService.js`. |
| 1.4.45 | 2026-06-14 | **DEPLOY del modo search-first de Ubicaciones**: bundle móvil `com.cco.wms@1.4.45` a Capgo OTA + web a Render. El script `deploy:mobile` auto-incrementa el patch (1.4.44→1.4.45). |
| 1.4.44 | 2026-06-14 | **Ubicaciones — modo search-first (rendimiento)**: `WmsLocations.jsx` ya no renderiza todas las ubicaciones al entrar; muestra solo el buscador y un aviso "Empieza a escribir", y los resultados aparecen al escribir. `filteredGroups` retorna `[]` sin término de búsqueda → no se construyen ni virtualizan las ~1.300 tarjetas de entrada (vista abre instantánea y liviana). Sin cambios de BD ni de datos. |
| 1.4.43 | 2026-06-14 | **DEPLOY del rediseño de Ubicaciones**: bundle móvil `com.cco.wms@1.4.43` a Capgo OTA + web a Render. El script `deploy:mobile` auto-incrementa el patch (1.4.42→1.4.43). |
| 1.4.42 | 2026-06-14 | **REDISEÑO: Explorador de Ubicaciones (`/queries/locations`)**: rediseño visual de `WmsLocations.jsx` con buscador central protagónico (estilo Lotes/Series), minimalista y claro. **Título "Ubicaciones" destacado** con degradado ámbar/naranja; barra de búsqueda con **halo animado** al enfocar (glow + ring + leve elevación) y contador de resultados en vivo. **Búsqueda instantánea** (se elimina el debounce de 250 ms → filtra en cada tecla sobre el inventario en memoria; escribir/borrar refleja al instante). Tarjetas de ubicación minimalistas: barra de color por estado de stock, código en monoespaciada, stock grande, y **estados de calidad resaltados** (En cuarentena, etc.) vía `CalidadBadge`. Se conserva toda la lógica: virtualización (TanStack Virtual), filtros Todos/Con stock/Vacías, orden, export CSV, atajo Ctrl+K y overlay de calidad. Sin cambios de BD. |
| 1.4.41 | 2026-06-14 | **DEPLOY del fix de Lotes y Series**: bundle móvil `com.cco.wms@1.4.41` a Capgo OTA + web a Render. El script `deploy:mobile` auto-incrementa el patch (1.4.40→1.4.41). |
| 1.4.40 | 2026-06-14 | **FIX (Lotes y Series solo mostraba 150)**: el módulo `Batches.jsx` (buscador `/queries/batches`) llamaba a la RPC `search_batches` con `p_limit: 150`, por lo que una búsqueda mostraba máximo 150 series aunque la tabla `tms_series` tuviera miles (p. ej. una carga de 4608). No era pérdida de datos en la carga masiva (la carga reportó 4608 · 0 errores) sino un **tope de visualización**. Se sube `p_limit` a **2000** para que la búsqueda por producto muestre todas sus series. `search_batches` limita por tabla, así que el payload sigue acotado. Sin cambios de BD. |
| 1.4.39 | 2026-06-14 | **DEPLOY del módulo Recepción Productos Nacionales**: bundle móvil `com.cco.wms@1.4.39` a Capgo OTA + web a Render. Migración `017` ya aplicada en BD live. El script `deploy:mobile` auto-incrementa el patch (1.4.38→1.4.39). |
| 1.4.38 | 2026-06-14 | **NUEVO MÓDULO: RECEPCIÓN PRODUCTOS NACIONALES (`/inbound/reception-nacional`)**: clon del módulo de Recepción de Importaciones para mercadería nacional, **aislado** (no toca el flujo de importaciones). **BD (migración `017_recepcion_nacionales.sql`)**: tablas espejo `tms_recepciones_nacionales` y `tms_recepcion_items_nacionales` (mismas columnas que las de importaciones; FK con `ON DELETE CASCADE`, índice por `recepcion_id`; RLS `authenticated` igual que los módulos de recepción existentes). **Frontend**: `src/pages/Inbound/ReceptionNacional.jsx` (copia de `Reception.jsx` apuntando a las tablas nacionales, con `queryKey`/canal realtime `recepciones_nac` aislados para no colisionar la caché con Importaciones; dashboard + formulario + export Excel + escáner idénticos). **Permisos**: reutiliza `view_reception`/`process_reception` (quien ya hace recepción ve el módulo sin cambios de rol). Ruta en `App.jsx`, `ROUTE_PERMISSIONS`, `modules.js` y Navbar (Inbound → Recepción Nacionales). |
| 1.4.37 | 2026-06-14 | **DEPLOY** de la descarga de matriz: bundle móvil `com.cco.wms@1.4.37` a Capgo OTA + web a Render. El script `deploy:mobile` auto-incrementa el patch (1.4.36→1.4.37). |
| 1.4.36 | 2026-06-14 | **Maestro de Direcciones — descargar matriz completa a Excel**: botón "Descargar matriz" en el header que exporta TODA la tabla `tms_direcciones` a `.xlsx` (hoja Direcciones), **paginando de a 1000 filas** con `.range()` (Supabase corta a ~1000/request) hasta traer las ~8.100 filas. Columnas: Razón Social, Nombre, RUT, Transporte, Dirección, Comuna, Ciudad, Región, Teléfono, Latitud, Longitud. Reusa `lib/exportExcel.js`; guarda `withTimeout` por página y muestra progreso. Sin cambios de BD. |
| 1.4.35 | 2026-06-14 | **DEPLOY** del borrado en Direcciones: bundle móvil `com.cco.wms@1.4.35` a Capgo OTA + web a Render. El script `deploy:mobile` auto-incrementa el patch (1.4.34→1.4.35). |
| 1.4.34 | 2026-06-14 | **Maestro de Direcciones — eliminar registros (limpieza de duplicados)**: en `Addresses.jsx` se añade borrar registros, con **confirmación de 2 pasos** para evitar borrados accidentales: en cada fila (botón papelera → ✓/✗ inline) y dentro del modal de edición (botón "Eliminar" → "¿Confirmar?"). Borra vía `supabase.from('tms_direcciones').delete().eq('id', …)` con guarda `withTimeout`, y quita la fila de los resultados sin re-buscar. Habilitado por la RLS existente `auth_all_direcciones`. Sin cambios de BD. |
| mantención | 2026-06-14 | **Limpieza del repo**: se eliminan archivos basura sin referencias — scripts de un solo uso (`check_admins.cjs`, `fix_data_import.cjs`), tests scratch que escribían datos falsos (`test.mjs`, `test2.mjs`), un bundle descargado (`downloaded_index.js`) y `RESUMEN_FINAL.txt` — y la tanda de 16 markdowns de "Mejoras" del 2026-05-03 (índices/resúmenes/planes obsoletos). Se conservan `README.md`, `CLAUDE.md`, `DOCUMENTACION_PROYECTO.md` (canónica) y los demás `DOCUMENTACION_*`/manuales. `CLAUDE.md` actualizado (versión vía `package.json`, migraciones 001–016, rama `main`, `dist/` commiteado a propósito para Render). Sin cambios de código de la app ni de BD. |
| 1.4.33 | 2026-06-10 | **DEPLOY del hotfix de login**: bundle móvil `com.cco.wms@1.4.33` a Capgo OTA + web a Render. El script `deploy:mobile` auto-incrementa el patch (1.4.32→1.4.33). |
| 1.4.32 | 2026-06-10 | **HOTFIX CRÍTICO (login — "No se pudo cargar tu perfil" para TODOS los usuarios)**: al iniciar sesión, el handler `SIGNED_IN` de `onAuthStateChange` (`src/context/AuthContext.jsx`) hacía `await supabase.from('tms_usuarios')…` **dentro** del callback. supabase-js mantiene un *auth lock* mientras corre ese callback, por lo que la consulta que necesita el mismo lock se **deadlockeaba** y nunca resolvía → el `withTimeout` de 10s disparaba el toast de error y no se cargaba el perfil. BD verificada sana (consultas de perfil/roles rápidas, sin errores en logs). **Solución oficial**: diferir la carga del perfil fuera del callback con `setTimeout(…, 0)` para liberar el lock antes de consultar. Sin cambios de BD. |
| 1.4.31 | 2026-06-10 | **DEPLOY del módulo Costos de Transporte**: bundle móvil `com.cco.wms@1.4.31` a Capgo OTA (canal `production`) + web a Render. El script `deploy:mobile` auto-incrementa el patch (1.4.30→1.4.31). **Fix de visibilidad (migración `016_perm_view_transport_costs.sql`)**: el permiso nuevo `view_transport_costs` no estaba en el catálogo `tms_permisos` ni asignado a ningún rol → solo ADMIN (que saltea permisos) veía el menú. Se registra el permiso y se asigna a todo rol con algún permiso del módulo TMS (quedó en ADMIN, SUPERVISOR, CONDUCTOR). Para verlo hay que recargar con bundle nuevo (hard-refresh web / aplicar OTA móvil): el ítem de menú vive en el bundle 1.4.31. |
| 1.4.30 | 2026-06-10 | **NUEVO MÓDULO: COSTOS DE TRANSPORTE (`/tms/costos`)**: cruza clientes (direcciones) × distancia real de carretera × valor por km, con mapa y export Excel. **Frontend**: `src/pages/TMS/CostosTransporte.jsx` (fija origen/bodega, busca clientes con `buscar_direcciones`, geocodifica los que no tienen coordenadas, calcula distancia real y costo, mapa Leaflet con `CircleMarker` y export Excel multi-hoja Resumen+Detalle). **Servicio**: `src/services/logisticaService.js` — `geocodeAddress` (Nominatim/OSM, `countrycodes=cl`), `routeDistanceKm` (OSRM, distancia real de manejo) con fallback `haversineKm` (línea recta), throttling (Nominatim ~1.1s, OSRM ~0.35s) y cancelación por `AbortController`. Las coordenadas geocodificadas se **persisten** en `tms_direcciones (latitud, longitud)` para no repetir el trabajo. **Permisos**: nuevo `view_transport_costs` (grupo TMS); ruta en `ROUTE_PERMISSIONS`, `modules.js` y Navbar (TMS Logistics → Costos Transporte). Usa servicios gratuitos de OpenStreetMap (limitados → procesar por lotes); migrable a Google/Mapbox/OSRM self-host. Sin cambios de BD propios (reusa columna `transporte` e índices de la 015). |
| 1.4.29 | 2026-06-10 | **DEPLOY de la mejora del Maestro de Direcciones**: bundle móvil `com.cco.wms@1.4.29` a Capgo OTA (canal `production`) + web a Render. Migración `015` ya aplicada en BD live (columna `transporte`, índices trigram, RPC `buscar_direcciones`). El script `deploy:mobile` auto-incrementa el patch (1.4.28→1.4.29). |
| 1.4.28 | 2026-06-10 | **MEJORA: Maestro de Direcciones (`/queries/addresses`) — columna Transporte, edición y búsqueda más rápida**. **BD (migración `015_direcciones_transporte_y_busqueda.sql`, idempotente)**: (1) nueva columna `transporte` (texto libre) en `tms_direcciones`; (2) índices GIN trigram en `nombre`, `rut`, `direccion`, `comuna` (antes solo `razon_social` los tenía → el resto hacía seq-scan sobre 8k filas); (3) RPC `buscar_direcciones(p_query, p_limit)` (`SECURITY DEFINER`, sin `EXECUTE` para `anon`) que resuelve en **una sola ida al servidor** lo que el cliente hacía en 2-3 (ILIKE exacto + `fuzzy_search` + fetch de extras), devolviendo resultados ya rankeados (RUT exacto > prefijo de razón social > similitud trigram); EXPLAIN ANALYZE ~32 ms. **Frontend (`Addresses.jsx`)**: búsqueda reescrita a la RPC única con guarda `withTimeout`; nueva columna **Transporte** en la tabla; **edición inline por fila** mediante modal (Razón Social, Nombre, RUT, Transporte, Dirección, Comuna, Ciudad, Región, Teléfono) que persiste con `update` + refleja el cambio sin re-buscar. La edición la habilita la RLS existente `auth_all_direcciones` (cualquier usuario con `view_addresses`). Sin permiso nuevo. |
| 1.4.27 | 2026-06-10 | **DEPLOY del fix de Series**: bundle móvil `com.cco.wms@1.4.27` a Capgo OTA (canal `production`) + web a Render. Incluye la migración `014` (ya aplicada en BD live) y el cambio de `uniqueKey` del importador. El script `deploy:mobile` auto-incrementa el patch (1.4.26→1.4.27). |
| 1.4.26 | 2026-06-10 | **FIX (Importación de Series — se perdían filas válidas)**: Al cargar Series, ~60% de las filas se descartaban como "duplicadas (misma clave: serie)" (p. ej. 2843 de 4793, quedando solo 1950). **Causa**: `tms_series` tenía `UNIQUE (serie)` y el importador (`DataImport.jsx`) deduplicaba con esa clave ("el último gana"), pero el MISMO número de serie aparece legítimamente en **productos distintos** (la serie es única por SKU, no global). **Solución (BD, migración `014_series_unique_por_producto.sql`)**: se reemplaza `UNIQUE (serie)` por `UNIQUE (codigo_producto, serie)` (verificado: sin FKs dependientes y la pareja ya era única en los datos actuales → sin violación). **Frontend**: la pestaña *Series* pasa a `uniqueKey: 'codigo_producto, serie'` (igual que Farmapack con `codigo_producto, lote`), de modo que la deduplicación cliente y el `bulk_upsert ON CONFLICT` usan la pareja correcta y conservan las series repetidas entre productos. Texto de ayuda actualizado. |
| 1.4.25 | 2026-06-10 | **DEPLOY móvil OTA de 1.4.24**: bundle `com.cco.wms@1.4.25` subido a Capgo (canal `production`) para que el móvil reciba el endurecimiento de cliente (helper `withTimeout` contra spinners infinitos en búsquedas/cargas) y el resaltado de alto contraste en Lotes y Series. El script `deploy:mobile` auto-incrementa el patch (1.4.24→1.4.25). Sin cambios de código ni BD respecto a 1.4.24. |
| 1.4.24 | 2026-06-10 | **UI (Lotes y Series — resaltado de coincidencia poco visible)**: En *Partidas & Series* (`Batches.jsx`), el texto destacado de la búsqueda (`HighlightText`) usaba `bg-orange-100 text-orange-600` (naranja claro sobre naranja pálido), de bajo contraste; en pantallas TN/lavadas o vistas en ángulo se desvanecía, sobre todo dentro de las *pills* oscuras de **serie**/**partida** (`bg-slate-900 text-white`). Se cambió a un resaltado tipo marcador de alto contraste: `<mark>` con `bg-yellow-300 text-black font-black` + `ring` amarillo, que resalta bien tanto sobre fondo blanco (código/producto) como dentro de las pills oscuras. Sin cambios de BD. |
| 1.4.23 | 2026-06-07 | **ESTABILIDAD: fin del "se queda cargando pegado" (spinner infinito) en módulos de búsqueda y carga masiva**. Diagnóstico: el backend está sano (Supabase `ACTIVE_HEALTHY`, migraciones `012`/`013` aplicadas, advisors solo menores) — el cuelgue era **del cliente**: llamadas async sin resolución acotada dejaban `loading`/`isLoading` en `true` para siempre (auth-lock en WebView, socket caído, query sin límite). **Solución (generalización del patrón de timeout que ya tenía `fetchCandidatos` en 1.4.20):** **(1)** nuevo helper reutilizable `src/lib/supabaseQuery.js` (`withTimeout` con `AbortController`+`.abortSignal()` para builders, o `Promise.race` para promesas crudas; lanza error localizado al vencer; `unwrap`). **(2)** Blindaje del arranque de auth (`AuthContext.jsx`): `getSession()`+`loadUserProfile()` con timeout 10s (inicial y en `onAuthStateChange`) → la pantalla global "Cargando…" siempre resuelve (≤10s) en vez de quedar infinita. **(3)** Timeout en consultas masivas/búsquedas: `Picking.jsx` (+ `.limit(2000)` y aviso de truncado, antes **sin límite**), `SalesOrders.jsx`, `HistorialNV.jsx`, `SalesStatus.jsx` (cada builder del `Promise.all`), `CommandPalette.jsx`, y los hooks `useInformes`/`useInformeItems` (`calidadService.js`). **(4)** Estado de error+reintentar (`src/components/ui/QueryErrorState.jsx`) en esas páginas → al vencer el timeout se muestra el error con botón "Reintentar", no pantalla en blanco ni spinner. **(5)** `QueryClient` (`main.jsx`): `refetchOnReconnect: 'always'`→`true` (solo stale), `networkMode: 'online'`, `retryDelay` con backoff acotado (máx 8s). **(6)** Realtime (`useRealtimeTable.js`): debounce 800→1500ms + jitter (+0–400ms) para escalonar la oleada de revalidación de los ~18 canales al reconectar. **(7)** Fallback de Suspense con escape a los 15s (`src/components/ui/SuspenseLoaderTimeout.jsx`) → un chunk lazy colgado ofrece "Recargar" en vez de spinner eterno. Tests unitarios para el helper (`src/tests/supabaseQuery.test.js`). Sin cambios de BD. |
| 1.4.22 | 2026-06-05 | **DEPLOY a producción** (sobre 1.4.21). Incluye el fix de frescura de stock y el trabajo de Monitoreo a Calidad / Informe de Daños descrito en la fila `monitoreo-danos`. **FIX aviso de frescura de stock en Lotes y Series (`StockFreshness`)**: el corte del ciclo estaba fijo a las **08:30**, pero la carga diaria real se hace ~08:11–08:20 (justo antes del corte). Por eso, apenas pasaban las 08:30, una carga de las 08:15 caía en el ciclo "anterior" y el aviso saltaba a **"Desactualizado"** (rojo) ~15 min después de haber cargado, quedándose rojo hasta que se recargara después de las 08:30 ("se ponía verde mucho más rato"). No era problema de zona horaria (`tms_historial_cargas.fecha_carga` es `timestamptz`, interpretado correctamente). **Solución**: se mueve el corte diario a las **06:00** (`RESET_HOUR=6`/`RESET_MIN=0` en `src/hooks/useStockFreshness.js`), antes de la ventana de carga matutina; así una carga de la mañana cuenta para el día en curso (verde hasta las 06:00 del día siguiente) y solo se muestra rojo entre las 06:00 y la carga (recordatorio útil). La copia visible del aviso (`StockFreshness.jsx`) ahora deriva la hora de la constante `RESET_LABEL` para evitar desajustes. Sin cambios de BD. |
| monitoreo-danos | 2026-06-04 | **MONITOREO A CALIDAD: fix de ubicaciones + editar/eliminar + INFORME DE DAÑOS con fotos (Word/PDF)** (entra en producción en 1.4.22). **(1) Fix `monitoreo_candidatos`** (migración `012_monitoreo_candidatos_fix.sql`, `CREATE OR REPLACE`): ahora se basa en **`wms_ubicaciones`** (verdad física, una fila por SKU+ubicación con stock>0), enriquecida con vencimiento/UM desde `tms_partidas`/`tms_farmapack`; antes resolvía una sola ubicación por SKU desde el stock → no coincidía con *Ubicaciones WMS* y duplicaba filas. **(2) Editar/eliminar informes**: `useActualizarInforme`, `useEliminarInforme` (frontend, sin migración; RLS de la 011 ya lo permite); botones Editar/Eliminar en lista y detalle; borrar un dictaminado conserva el overlay `tms_calidad_flags`. **(3) Nuevo tipo de informe `DANOS` (Informe de Daños / No Conformidad)** (migración `013_informe_danos.sql`, idempotente y aditiva): `tms_monitoreo_informes` + `tipo_informe` (MONITOREO\|DANOS) + `reporte` jsonb (antecedentes, descripción, cuadro resumen, causa probable, acciones, firmas); `tms_monitoreo_items` + `tipo_dano`/`componente_afectado`/`consecuencia` (SKU/ubicación opcionales); nueva tabla **`tms_monitoreo_evidencias`** (fotos por hallazgo, RLS lectura `authenticated`/escritura `can_manage_calidad()`); bucket público **`monitoreo-evidencias`** (8MB, solo imágenes) con políticas de escritura por `can_manage_calidad()`. **Frontend**: `InformeDanosBuilder` en `Monitoreo.jsx` (formulario por secciones + hallazgos con fotos), componente reutilizable `src/components/PhotoUploader.jsx` (cámara/galería + compresión `src/lib/imageCompress.js`), exportación a **Word (`docx`) y PDF (`pdfmake`)** vía `src/lib/exportInformeDanos.js` con **import dinámico** (chunks aparte, no inflan el bundle principal); fotos embebidas. Nuevas deps: `docx`, `pdfmake`. ⚠️ Las migraciones `012` y `013` deben aplicarse a la BD. Aditivas: no modifican datos existentes (los informes actuales quedan `tipo_informe='MONITOREO'`). |
| 1.4.21 | 2026-06-03 | **DEPLOY** del fix 1.4.20: bundle móvil `com.cco.wms@1.4.21` subido a Capgo OTA (canal `production`) y web a Render. El script `deploy:mobile` auto-incrementa el patch (1.4.20→1.4.21). |
| 1.4.20 | 2026-06-03 | **FIX (Monitoreo a Calidad — búsqueda "cargando eternamente")**: La búsqueda de candidatos quedaba con spinner infinito aunque la RPC `monitoreo_candidatos` respondía `HTTP 200` rápido en el servidor (confirmado en logs API). La causa es del lado cliente (promesa de supabase-js que no se resuelve, p. ej. bloqueo de auth-lock en la WebView o conexión colgada). Se agregó una **guarda de timeout (15s) con `AbortController` + `.abortSignal()`** en `fetchCandidatos` (`src/services/calidadService.js`): si la petición no responde, se aborta y se muestra un toast de error en lugar de quedar cargando para siempre. Sin cambios de BD. |
| 1.4.19 | 2026-06-03 | **DEPLOY**: Despliegue del módulo Monitoreo a Calidad a móvil (Capgo OTA canal `production`, bundle `com.cco.wms@1.4.19`) y web (Render). Verificado en BD live que la migración `011_monitoreo_calidad.sql` ya está aplicada (4 tablas + 4 funciones presentes). Sin cambios de código respecto a 1.4.18. |
| 1.4.18 | 2026-06-03 | **NUEVO MÓDULO: MONITOREO A CALIDAD (`/quality/monitoreo`)**: Implementa la celda *Inventario · Estancia · Monitoreo rutinario a Calidad* de la matriz de procesos. Inventario genera un **informe de monitoreo** sobre el stock (candidatos con ubicación y semáforo de vencimiento); Calidad emite el **dictamen** (LIBERAR/CUARENTENA/REPROCESO/RECHAZAR/BAJA) y el sistema persiste un **estado de calidad** que se superpone al inventario y notifica los movimientos sistémicos. **BD (migración `011_monitoreo_calidad.sql`, idempotente)**: tablas `tms_monitoreo_informes`, `tms_monitoreo_items`, `tms_calidad_flags` (overlay anclado por `codigo_producto`+`partida`+`ubicacion`, **sobrevive la recarga diaria del snapshot 08:30→08:30**) y `tms_notificaciones`; helper `can_manage_calidad()`; RPCs `monitoreo_next_numero()`, `monitoreo_candidatos(text,bool)` y `monitoreo_dictaminar(...)` (`SECURITY DEFINER`, `search_path=public`, sin `EXECUTE` para `anon`); RLS lectura `authenticated` / escritura `can_manage_calidad()`. **Frontend**: `src/pages/Quality/Monitoreo.jsx` (lista de informes, constructor con búsqueda de candidatos y export Excel multi-hoja, dictamen inline para Calidad), service `src/services/calidadService.js`, hook `useCalidadFlags` + componente `CalidadBadge`, helper reutilizable `src/lib/exportExcel.js`. **Overlay global**: badge EN AUDITORÍA / CUARENTENA / MALO / LIBERADO en *Ubicaciones* (`WmsLocations.jsx`), visible para todos. **Bodegas destino**: `5` Servicio Técnico · `99` Basura/Baja (estado `transitoria`). **Permisos**: `manage_monitoreo` (crear informes) y `manage_quality` (dictaminar) en grupo Calidad; ruta en `ROUTE_PERMISSIONS`, `modules.js` y Navbar (Inteligencia → Calidad → Monitoreo). ⚠️ La migración `011` debe aplicarse a la BD (no se aplica automáticamente en este commit). Sin cambios de comportamiento en datos existentes. |
| docs-bd | 2026-06-01 | **DDL DE FICHA TÉCNICA VERSIONADO**: Los objetos de BD de la feature 1.4.17 (tabla `tms_fichas_imagenes` + RLS, funciones `can_manage_fichas()`/`get_ficha_producto()`/`search_productos()` con sus grants, bucket `fichas-productos` y políticas de Storage) se habían aplicado solo en la BD live. Se versionaron en `supabase/migrations/010_ficha_tecnica_producto.sql` (idempotente, ya aplicado en prod → no-op) y se reflejaron las 3 funciones en `supabase/functions_snapshot.sql`. Sin cambios funcionales. |
| 1.4.17 | 2026-06-01 | **NUEVO MÓDULO: FICHA TÉCNICA DEL PRODUCTO (`/queries/datasheet`)**: Búsqueda por código/nombre que abre una ficha con cabecera (Cod. Producto, Producto, Cod. U. Medida), galería de fotos de "presentación" del SKU y tabla de partidas/tallas con fecha de vencimiento. **BD**: nueva tabla `tms_fichas_imagenes` (RLS: lectura `authenticated`, escritura solo `can_manage_fichas()`), helper `can_manage_fichas()` (ADMIN/admin delegado/rol con permiso `manage_fichas`), bucket Storage **público** `fichas-productos` (8MB, solo imágenes) con políticas de subida/borrado restringidas, RPCs `search_productos(p_query,p_limit)` y `get_ficha_producto(p_codigo)`. **Frontend**: `src/pages/Queries/ProductDatasheet.jsx` con captura de foto vía `<input type=file capture>` (abre cámara nativa en la WebView, **sin** plugin `@capacitor/camera` → compatible con OTA), compresión cliente a 1600px/JPEG 0.82, marcar principal / eliminar. **Permisos**: `view_fichas` (ver) y `manage_fichas` (editar fotos) en grupo Consultas; ruta en `ROUTE_PERMISSIONS`, `modules.js` y entrada en Navbar (Consultas → Ficha Técnica). **Hardening (advisor)**: revocado `EXECUTE` a `PUBLIC`/`anon` en `can_manage_fichas()`, `get_ficha_producto()` y `search_productos()` (solo `authenticated`/`service_role`, igual que `search_batches`); eliminada la política SELECT del bucket `fichas-productos` (los URLs públicos siguen sirviéndose sin listar el bucket). |
| fix-recepcion | 2026-06-01 | **NO SE PODÍAN AGREGAR ÍTEMS EN RECEPCIÓN**: `addItem` (Reception.jsx) solo insertaba el ítem en el estado local **dentro del `.then()`** de `lookupDescription` (consulta a `tms_matriz_codigos`). En bodega con señal intermitente ese `fetch` (sin timeout) podía quedar colgado sin resolver → el ítem nunca se agregaba y el botón parecía no responder. Ahora el ítem se agrega **de inmediato** (síncrono) y la descripción se enriquece en segundo plano sin bloquear el alta. Añadido `type="button"` al botón. Sin cambios de BD. |
| fix-permisos | 2026-06-01 | **AVISO DE STOCK LLEVABA A "ACCESO DENEGADO"**: El banner "Favor actualizar stock" (`StockFreshness`, Tío Inventario) mostraba el botón "Actualizar ahora" → `/inbound/data-import` a **todos** los usuarios, incluidos roles sin `manage_data_import` (p. ej. Revisión/Operador), que caían en la pantalla de Acceso Denegado. Ahora el CTA solo se muestra a quien tiene el permiso (ADMIN/`es_admin_delegado`/`manage_data_import`); al resto se le indica "Avisa al encargado de inventario". Sin cambios de BD. |
| data-roles | 2026-05-29 | **NORMALIZACIÓN DE PERMISOS POR ROL (BD)**: Limpieza de `tms_roles.permisos_json` de los 10 roles no-admin: se quitaron permisos fantasma (sin ruta: `view_kardex`, `manage_stock`, `view_cubicaje`, etc.), se mapearon los de cubicaje a `view_reception`/`process_reception`, se quitaron accesos indebidos (ej. PDA `view_stock` a "Administración") y se aseguró que cada rol pueda abrir su `landing_page` (fix landing de Transporte → `/tms/mobile`). ADMIN sin cambios. Nota: usuarios con sesión activa deben re-loguear para tomar los permisos. |
| fix-permisos | 2026-05-29 | **ROLES VEÍAN MÓDULOS QUE NO LES CORRESPONDÍAN**: El Navbar mostraba rutas sin permiso definido (`canAccessRoute` devolvía `true` si la ruta no estaba en `ROUTE_PERMISSIONS`, p. ej. `/inbound/reception`) y la visibilidad de sección usaba una lista separada (`SECTION_PERMISSIONS`) desincronizada. Ahora: **deny-by-default** y visibilidad **derivada** de los permisos por ruta (`isModuleVisible` = sección visible si ≥1 ruta accesible). Añadida ruta `/inbound/reception` a `ROUTE_PERMISSIONS` y permisos faltantes al catálogo (`view_stock`, `manage_inventory`, `admin_monitor`). Eliminado `SECTION_PERMISSIONS`. |
| feat | 2026-05-29 | **VIGENCIA DE STOCK 24H + AVISO (Lotes y Series)**: Nuevo `StockFreshness` + hook `useStockFreshness` en el módulo Lotes y Series. Tarjeta vistosa con última actualización (fecha/hora/usuario desde `tms_historial_cargas`). Ciclo diario **08:30→08:30**; si Partidas/Series/Farmapack están fuera de vigencia, muestra aviso "Favor actualizar stock" + firma animada "Atte, Tío Inventario" (keyframes en `index.css`). Botón "Actualizar ahora" → Carga Masiva. Sin cambios de BD. |
| perf | 2026-05-29 | **CARGA MASIVA RÁPIDA + FIX "CARGANDO ETERNO" (Series/Lotes/Farmapack)**: `bulk_upsert` reescrito a inserción **set-based** con `jsonb_to_recordset` (migración `007`) en vez de SQL dinámico fila por fila → mucho más rápido. `DataImport.handleUpload`: chunks de 1000 con **timeout/abort 90s por lote** (`abortSignal`) → si un lote se cuelga se cuenta como error y la carga no queda colgada. Verificados índices únicos y conflict keys de `tms_partidas/series/farmapack`. |
| fix-routing | 2026-05-29 | **FIX REDIRECT A DASHBOARD (roles sin acceso)**: El botón "Reiniciar Módulo" del `ErrorBoundary` hacía `window.location.href='/dashboard'` (hardcodeado) → botaba a dashboard a roles que no lo ven, tras un error de chunk al actualizar la web. Ahora **recarga el módulo actual** (`reload()`, toma chunks nuevos) + botón "Ir al inicio" vía `/` (SmartRedirect → landing del rol). Mismo fix en `NotFound` y `AccessDenied` (ya no enlazan a `/dashboard`). |
| perf | 2026-05-29 | **BÚSQUEDA UBICACIONES ULTRA-RÁPIDA + FIX "CARGANDO ETERNO"**: `warehouseStore.fetchWarehouseData` reescrito: paginación **paralela** (`Promise.all` sobre count) en vez de ~23 round-trips secuenciales, `select` solo de columnas necesarias, orden estable, **timeout/abort 30s** (evita spinner infinito si la red se cuelga), **caché con TTL 2 min** + dedupe de concurrencia (no recarga todo al navegar). `fetchWarehouseData(force)` para refrescos manuales/ediciones. Lotes/Series ya usa RPC server-side. |
| fix-ui | 2026-05-29 | **FIX SOLAPAMIENTO UBICACIONES (móvil vertical)**: La causa real era el virtualizer de `WmsLocations.jsx` con altura **fija** (`COLLAPSED_HEIGHT=64`) menor que el header real en pantallas angostas → las filas se encimaban (la ubicación quedaba tapada). Solución: **medición dinámica** (`virtualizer.measureElement` + `data-index`, sin `height` fija) y header reestructurado (ubicación en su propia fila, stats debajo, a prueba de overflow en 320–412px). |
| auth | 2026-05-29 | **ELIMINACIÓN LEGACY AUTH**: Migración `006` — eliminada función `verify_user_password()` y columna `tms_usuarios.password_hash` (exposición de hashes). Quitado el fallback legacy de login en `AuthContext.jsx` y la escritura de `password_hash` en `Users.jsx`. 21/21 usuarios en Supabase Auth. ⚠️ Requiere desplegar frontend para crear usuarios nuevos. |
| limpieza | 2026-05-29 | **CONSOLIDACIÓN BD + LIMPIEZA**: Migración `005` — eliminados helpers admin legacy `is_admin_safe`/`is_user_admin` (canónica única `private.is_admin()`). RPC versionadas en `supabase/functions_snapshot.sql`. ~15 SQL sueltos movidos a `supabase/legacy_sql/`. Eliminados 4 componentes muertos (`Placeholder`, `PageTransition`, `SkeletonCard`, `SkeletonTable`). Auditoría live: 21/21 usuarios migrados a Supabase Auth. Ver `REVISION_PROYECTO.md`. |
| seguridad | 2026-05-29 | **HARDENING + FIXES**: Migración `004` — revocado EXECUTE de `anon`/`PUBLIC` en `bulk_upsert` y `search_batches` (cierra escritura/lectura no autenticada), `search_path` fijado, `mv_dashboard_kpis` fuera del API anónimo. Fixes de código: `await` faltante en `warehouseStore.moveItem`, promesas sin `.catch` en `MobileApp`/`Reception`/`DataImport`/`AuthContext`. Sincronizados archivos SQL stale del repo. Ver `REVISION_PROYECTO.md`. |
| 1.4.13 | 2026-05-28 | **REDISEÑO UBICACIONES MOBILE v2**: Ubicación ahora como badge oscuro prominente (`bg-slate-800 text-white font-extrabold`) con `shrink-0` para nunca cortarse. Layout simplificado a 1 fila flex: badge ubicación + match badge + SKUs + stock + chevron. Eliminado `overflow-hidden` del contenedor que recortaba contenido. Altura virtualizer 82→64px |
| 1.4.12 | 2026-05-28 | **FIX DISEÑO UBICACIONES MOBILE**: Header de LocationGroup rediseñado a 2 filas en mobile — ubicación (R-01, D-02, etc.) ahora en línea propia con font `text-base font-extrabold`, stats (SKUs/uds/coinciden) en segunda fila. Chevron en la misma línea de la ubicación. En desktop mantiene layout horizontal. Altura virtualizer ajustada 72→82px |
| 1.4.11 | 2026-05-28 | **COMPACTACIÓN DB + FIX SEARCH_BATCHES**: Tabla `wms_ubicaciones` recreada para eliminar bloat (3,328kB→448kB, -87%). Query de 114ms→4ms (-96%). Buffers 416→56 (-87%). Fix RPC `search_batches()`: columna `id` no existía en `tms_pesos` (causaba error). Index trigram `idx_trgm_series_producto` agregado en `tms_series` para fuzzy search. Resultado: búsqueda Lotes y Series ~80ms (antes 500ms+). pg_stat_statements reseteado para baseline limpio |
| 1.4.10 | 2026-05-28 | **FIX PUT AWAY DESCRIPCIÓN NO APARECE**: Bug: useRealtimeTable causaba re-renders que reseteaban el timer de debounce infinitamente → el fetch de descripción nunca se ejecutaba. Fix: timer/abort en useRef (inmune a re-renders), AbortController para cancelar requests en vuelo, caché Map local de SKU→descripción, debounce 800→400ms, guard `prev.codigo === codigo` para evitar actualizar form con data obsoleta |
| 1.4.8 | 2026-05-28 | **FIX PUT AWAY NO GUARDA**: Faltaba UNIQUE constraint en `wms_ubicaciones(ubicacion, codigo)` — el upsert de Entry.jsx fallaba silenciosamente. Limpieza de 22,820 filas duplicadas (26,382→3,562). Tabla 7x más liviana. Constraint `wms_ubicaciones_ubic_codigo_unique` creado |
| 1.4.7 | 2026-05-28 | **FIX LOTES Y SERIES LENTO**: RPC `search_batches()` reemplaza 8 queries paralelas por 1 sola llamada server-side (ilike + fuzzy en 4 tablas). Debounce 300→500ms. Límite 1000→150 filas/tabla. GSAP animación limitada a 15 filas (antes animaba todas). Resultado: búsqueda ~8x menos carga en Supabase |
| 1.4.6 | 2026-05-28 | **FIX CRÍTICO RENDIMIENTO POST-RLS**: Políticas RLS cambiadas de `auth.role()` per-row (función evaluada POR CADA FILA) a `TO authenticated` (check a nivel statement). 29 tablas corregidas. Índices duplicados eliminados: tms_nv_diarias 13→11 (3 unique idénticos), wms_ubicaciones 9→7, tms_partidas 7→6. DataImport ahora SIEMPRE usa RPC `bulk_upsert` (SECURITY DEFINER, bypasea RLS). Resultado: rendimiento restaurado a niveles pre-RLS |
| 1.4.5 | 2026-05-28 | **OPTIMIZACIÓN CARGA MASIVA**: RPC `bulk_upsert()` para transacciones server-side. Deduplicación inteligente paginada en paralelo. Historial de carga non-blocking |
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
