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
| 1.32.0 | 2026-07-12 | **Cámara in-app a pantalla completa para las fotos de Calidad** (Ingreso, Salida y Monitoreo). Nuevo componente `src/components/CameraCapture.jsx`: cámara propia con **`getUserMedia`** (visor fullscreen, `object-cover`, `playsInline`, safe-area, botón de captura grande, cambiar frontal/trasera, previsualizar → repetir/usar) que devuelve un File JPEG y pasa por el mismo pipeline (compresión + subida al bucket privado). Reemplaza el `<input capture>`, que en algunos Android (WebView) no abría la cámara de forma confiable. **OTA-safe** (sin plugin nativo; Capacitor corre en `https://localhost` = contexto seguro). Probado el layout para **Samsung Galaxy S24** y **Motorola Edge 50 Pro**. La "Galería" (subir archivo) se mantiene. Tests 77/77. |
| 1.31.4 | 2026-07-12 | **Flujo inverso Calidad → Recepción**. Cuando Calidad finaliza el CheckList (CONFORME / NO_CONFORME + folio + disposición), la **recepción lo refleja**. Migración `076`: columnas `calidad_estado`/`calidad_folio`/`calidad_disposicion`/`calidad_fecha` en `tms_recepciones` y `tms_recepciones_nacionales` + trigger `sync_calidad_a_recepcion` sobre `tms_calidad_tareas` (AFTER UPDATE, cuando cambia estado/folio/disposición) que actualiza la recepción vinculada por `recepcion_id`+`origen`; **backfill** de las ya finalizadas. Frontend: nueva columna **Calidad** en la lista de Recepciones (Importaciones y Nacionales) con badge ✓ Conforme / ✕ No conforme / Pendiente (tooltip con folio/disposición). Con la 075, la comunicación es **bidireccional**. Tests 77/77. |
| 1.31.3 | 2026-07-12 | **Fix comunicación Recepción → Calidad (bultos/OC no llegaban)**. La tarea de CheckList de Ingreso salía con **0 bultos / OC vacía** porque el trigger `crear_tarea_checklist_ingreso` corría **solo en INSERT** (y `DO NOTHING`): si la recepción se guardaba y luego se editaban bultos/OC/pallets, Calidad quedaba desincronizado. Migración `075`: el trigger ahora **sincroniza al crear Y al actualizar** la recepción (bultos, OC, proveedor, fecha; + pallets y tipo de contenedor en `contexto`), sin tocar las respuestas del checklist ni su estado/folio; **backfill** de las tareas existentes. Frontend: la card y el encabezado del checklist muestran ahora **bultos · pallets · tipo**. Aplica a Importaciones (`tms_recepciones`) y Nacionales (`tms_recepciones_nacionales`). Tests 77/77. |
| 1.31.2 | 2026-07-12 | **Post-Venta · Eliminar tickets de a uno o masivo** (admin/supervisión). En la lista de Tickets: **casilla de selección** por fila + "seleccionar todos", botón **"Eliminar (N)"** para borrado masivo, y botón 🗑 por fila para borrado individual (reusa `eliminar_pv_ticket`, que también descarta los correos del caso → no reingresan). Gateado por `supervise_postventa`/admin. Los tickets de correo aparecen en la lista, así que **es lo mismo para el correo**; la Bandeja además ya tenía borrado por caso + "Dejar en 0". Sin cambios de BD. Tests 77/77. |
| 1.31.1 | 2026-07-12 | **Calidad · Recepción: embalaje flexible ("No aplica" + aplicar a todos)**. No todo llega con pallet o film; ahora **Estado del pallet** y **Film stretch** tienen opción **"No aplica"** (neutra: gris, NO suma riesgo en `riesgoIngreso`). Además, botones **"Aplicar a todos"** sobre el bloque: **Todo conforme** (pallet Bueno / film Correcto / sin golpes-deformada-humedad) y **Sin pallet / film (N/A)**, más **Limpiar**. `EMBALAJE_NA` + `EMBALAJE_PRESETS` en `calidadService.js`. Sin cambios de BD. Tests 77/77. |
| 1.31.0 | 2026-07-12 | **Post-Venta · Flujo del ticket + trazabilidad**. En el editor del ticket, barra de **flujo de estados** (Abierto → En Proceso → En Evaluación → Programada → Pendiente Cliente → Cerrado) con: botón **"Siguiente"** (avanza al próximo estado, `avanzar_pv_ticket`), botón **"Dar por terminado"** (cierra con resultado + fecha, `cerrar_pv_ticket`) y **"Ver trazabilidad"** (línea de tiempo con cada cambio: de→a, quién, cuándo y nota). **Historial automático**: migración `074` — tabla `tms_postventa_historial` + **triggers** que registran el alta y todo cambio de estado/resultado (la nota de cada transición viaja por variable de sesión `pv.nota`, así queda registrado venga de Avanzar/Cerrar o del editor). RPC `pv_historial(numero)` (SECURITY DEFINER; la tabla tiene RLS sin SELECT directo). Servicio: `useAvanzarTicket`/`useCerrarTicket`/`usePvHistorial` + `PV_FLUJO`/`pvSiguienteEstado`. Requiere gestión (`manage_postventa`). Tests 77/77. |
| 1.30.1 | 2026-07-12 | **Post-Venta · Bandeja de Correos: reasociar + dejar en 0**. (1) **Reasociar correo al ticket correcto**: en el lector de hilo (ThreadReader), botón por correo (🔗, supervisión) que lo mueve al ticket destino — RPC `reasociar_pv_correo(id_correo, numero_destino)` (migración `073`): cambia `ticket_id` y alinea `conversation_id` (para que el hilo futuro caiga bien), y borra el caso de origen si queda vacío. (2) **"Dejar en 0"**: botón en la barra de la Bandeja (supervisión) que descarta los casos mostrados en lote (reusa `eliminar_pv_ticket` con descarte → no reingresan), para limpiar la bandeja tras reasociar los correctos. Sin permisos nuevos (usa `supervise_postventa`). Servicio `useReasociarCorreo`. Tests 77/77. |
| 1.30.0 | 2026-07-12 | **Control de acceso POR PESTAÑA** en Conteo Cíclico (6), Análisis de Códigos (7) y Post-Venta (6). Nueva capa `TAB_PERMISSIONS` + helper `puedeVerTab()` en `src/constants/permissions.js`: cada pestaña tiene su permiso propio (`conteo_tab_*`, `analisis_tab_*`, `pv_tab_*`) y aparece como casilla en Admin → Roles. **Retrocompatible**: quien tenga un permiso "amplio" del módulo (`view_conteo`/`manage_conteo`/`supervise_conteo`, `view_analisis`, `view_postventa`/`manage_postventa`/`supervise_postventa`) sigue viendo TODAS las pestañas — ningún rol pierde acceso; los permisos nuevos permiten conceder SOLO ciertas pestañas. Gateado en 3 lugares: `ROUTE_PERMISSIONS` (entrar a la ruta con cualquier permiso de pestaña), el **Navbar** (`canAccessRoute` ahora lee el `?tab=` y oculta los sub-items no autorizados; el item base = pestaña por defecto vía `_default`) y cada **página** (clampa la pestaña activa a las permitidas, Post-Venta filtra `visibleTabs`). Migración `072` agrega las 19 al catálogo `tms_permisos`. Tests 77/77. |
| 1.29.2 | 2026-07-12 | **Roles: casilla propia por pantalla de Inventario** (Traspasos, Análisis, Carteles no tenían toggle en Roles; heredaban `manage_inventory` de otro grupo). Nuevos permisos `view_traspasos`/`view_analisis`/`view_carteles` en el grupo Inventario de `APP_PERMISSIONS`, cableados **de forma aditiva** en `ROUTE_PERMISSIONS` (los permisos de bodega existentes siguen dando acceso → ningún rol pierde nada; el nuevo permiso permite conceder SOLO esa pantalla). Migración `071` los agrega a `tms_permisos`. Ahora el grupo Inventario en Roles muestra: Traspasos, Análisis, Carteles, Conteo (ver/contar/supervisar) y Ubicaciones (Mapa de Calor usa `view_locations` de Consultas). Verificado el mapeo del resto: Consultas 7/7, Inbound 5/5, Calidad 3/3, Post-Venta 3 permisos (sus 6 pestañas comparten ruta). |
| 1.29.1 | 2026-07-12 | **Sincronización de Roles/Permisos (catálogo)**. Auditoría de las 4 fuentes (ROUTE_PERMISSIONS, APP_PERMISSIONS, `hasPermission()` del código, `tms_permisos`). (1) **2 permisos usados en botones de N.V. pero sin catalogar** (`manage_orders` = acciones masivas, `delete_sales_orders` = eliminar N.V.) → agregados a `APP_PERMISSIONS` (Outbound); antes solo el admin los veía. (2) **`tms_permisos` (BD) reconstruido como espejo exacto** de `APP_PERMISSIONS` (migración `070`): agregados los que faltaban (Calidad `manage_monitoreo`/`manage_quality`, `manage_locations`, varios de Inbound/Queries/TMS/Admin) y quitados legacy muertos (`manage_transfers`, `track_gps`, `view_logs`, `view_orders`, `view_reports`, `view_layout`, `assign_drivers`). Nota: la autorización real vive en `tms_roles.permisos_json` + `APP_PERMISSIONS`; `tms_permisos` es el catálogo espejo. Navbar de Inventario/Calidad/Post-Venta verificado (todos los sub-items cableados). |
| 1.29.0 | 2026-07-12 | **Post-Venta ↔ N.V. del Panel PTM (asociación opcional)**. En **Nuevo ticket** un bloque "Asociar a Nota de Venta" con campo de N.V. + botón **Traer**: reutiliza la conexión de solo-lectura al Panel PTM (`fetchNvPanel`, la misma de Calidad · Salida) y al encontrar la N.V. **autocompleta Cliente y Vendedor** y guarda una **foto de la trazabilidad del proceso** (estado, factura, guía, transportista, bultos, tipo/fechas de despacho) tal como sale en el Info. Todo **opcional**: si el ticket no nace de una N.V., queda nulo. Migración `069`: columnas `nv`, `vendedor`, `nv_info` (jsonb) en `tms_postventa_tickets` + `crear_pv_ticket` recreada con 3 params opcionales. La trazabilidad se muestra en una tarjeta al crear y en la vista del ticket, y N.V./Vendedor se agregan al export Excel. Servicio `panelPtm.js` (sin cambios). |
| 1.28.4 | 2026-07-12 | **Logo oficial PTM Health Care** en login, navbar y carteles. Se reemplazó el logo externo (imgur) por un **archivo local** `public/logo-ptm.png` (extraído del modelo Excel "CARTELES PTM", mismo origen → respeta el CSP). Login: logo a color, sin tinte. Navbar: se quitó la caja oscura con filtro blanco y se muestra el logo a color (el navbar es claro). **Carteles**: cada cartel lleva el logo arriba (tamaño por formato Único/Doble/Cuádruple) y el CSS de impresión fuerza `print-color-adjust: exact` para que salga a color. Sin cambios de BD. |
| 1.28.3 | 2026-07-12 | **Evidencia fotográfica también en el Checklist de INGRESO** (antes solo tenía el selector de tipo de verificación, sin fotos). Nueva sección "Evidencia fotográfica" con 4 grupos (Producto / Embalaje-Pallet / Documentación / General), cada uno con botón **Cámara** (captura directa) y **Galería** — mismo patrón que Salida, sin plugin nativo. Sube al bucket privado `monitoreo-evidencias` bajo `ingreso/` (`uploadEvidenciaIngreso`, guardado en `checklist._extras.evidencias`, autosave al subir/borrar). Las fotos se **incrustan en el PDF** y se listan en el Word del checklist (`exportChecklistIngreso.js` extendido a la rama de ingreso). Sin migración (la RLS del bucket ya permite cualquier prefijo con `can_manage_calidad()`). |
| 1.28.2 | 2026-07-12 | **Evidencia fotográfica: botón de CÁMARA directo además de subir archivo** (Calidad). Antes había un solo botón con un `<input capture multiple>`: en varios Android eso **forzaba solo cámara** (sin poder elegir de galería) o al revés. Ahora **dos botones separados**: **Cámara** (`<input capture="environment">` → abre la cámara trasera al toque, en web y en la app, sin plugin nativo → OTA-safe) y **Galería/Subir** (`<input>` sin `capture`, permite varias). El botón de Cámara solo aparece en equipos táctiles (móvil/tablet/app); en PC se muestra solo "Foto". Aplica al **certificado de Salida** (`SalidaCertificacion.jsx`, inputs propios) y a **Monitoreo** (componente compartido `PhotoUploader.jsx`, que también usa la evidencia de hallazgos). Sin cambios de BD. |
| 1.28.1 | 2026-07-12 | **Rediseño del login: claro, minimalista y moderno** (antes era oscuro `#020617` y desentonaba con la identidad clara de la app). Fondo `bg-slate-50` con acentos naranja muy sutiles (blur radial), tarjeta blanca con sombra suave y borde fino, inputs claros con foco naranja (`ring-orange-500/10`), botón primario naranja `#f97316`, overlay de carga en tono claro y logo teñido a la marca. Se conserva toda la lógica (fases de carga, mostrar/ocultar contraseña, deep-link `from`) y el badge de versión al pie. `min-h-dvh` para no cortar en móvil. Sin cambios de BD. |
| 1.28.0 | 2026-07-12 | **Despliegue OTA a producción DESDE la app (admin)**. Nuevo panel en **Admin → Monitor** (`src/components/DespliegueOTA.jsx`) que **lista los bundles subidos a Capgo**, muestra qué versión sirve cada canal (beta/producción) y permite **elegir una versión y promoverla a `production`** (toda la bodega) con confirmación — sin GitHub ni el panel de Capgo, y sin recompilar. Arquitectura segura: la API key de Capgo vive **solo** en la Edge Function `supabase/functions/capgo-deploy` (secret `CAPGO_API_KEY`), nunca en el cliente; la función se autentica con el JWT del usuario y autoriza con la RPC `puede_desplegar_ota()` (admin o permiso nuevo `deploy_ota`). Migración `068`: permiso `deploy_ota` (+ otorgado a ADMIN/GERENCIA), RPC de autorización y **auditoría** `tms_ota_despliegues` (quién promovió qué versión, vía RPC `registrar_despliegue_ota`). Servicio `src/services/otaDeployService.js`. **Requiere** setear el secret `CAPGO_API_KEY` (key rol `all`) en Supabase → Edge Functions. |
| 1.27.2 | 2026-07-12 | **Fix pipeline OTA (el canal beta se quedaba en 1.26.0)**. El CI subía el bundle pero no lo **enlazaba** al canal porque el secreto `CAPGO_TOKEN` era una key de rol *upload* (sin permiso para asignar canal → "Cannot set channel as a upload organization member"); el canal beta seguía sirviendo la 1.26.0 y las OTA de 1.27.x nunca bajaban. Se reemplazó `CAPGO_TOKEN` por una key de rol **`all`** (Super Admin de Organización) → `@capgo/cli bundle upload --channel beta` ahora **sube Y enlaza** el bundle al canal en cada push con cambio de versión. Sin cambios de código de la app (solo el secreto + este bump de versión que dispara la primera subida ya enlazada). |
| 1.27.1 | 2026-07-12 | **Versión visible en el LOGIN** (se veía solo en el menú ☰ y en el pie del PDA). Ahora el pie de la tarjeta de login muestra **"CCO WMS · v{versión}"** (`__APP_VERSION__` inyectada por Vite desde `package.json`), la pantalla que TODOS ven al abrir la app — soporte identifica el build sin pedir que abran menús. Nativo alineado: `android/app/build.gradle` **versionCode 3→4**, **versionName "1.27.0"→"1.27.1"**. Todo OTA. |
| 1.27.0 | 2026-07-11 | **Transiciones de pantalla en el PDA + versión visible en el menú móvil**. (1) **Transición entre vistas del PDA**: los cambios de pantalla dentro del PDA (Home ↔ Ubicar ↔ Consulta ↔ Conteo) son cambios de estado (no de ruta), así que no tenían la transición GSAP que sí existe entre módulos; ahora cada vista entra con un **deslizamiento suave** (`.anim-slide-in` en `index.css`, respeta `prefers-reduced-motion`) aplicado a las raíces de `WarehousePDA`, `ConsultaPDA` y `ConteoPDA`. (2) **Versión instalada visible**: pie fijo en el **menú móvil (hamburguesa)** de la Navbar con **"CCO WMS · v{versión}"** (`__APP_VERSION__` inyectada por Vite), para que cualquiera vea qué build corre sin entrar al PDA. Todo OTA. Tests 77/77. |
| 1.26.0 (nativo) | 2026-07-11 | **Preparación de build nativa Android** (para el constructor en la nube de Capgo / build local). El evento de compatibilidad de Capgo pedía una nueva construcción nativa porque cambiaron dependencias nativas (`@capacitor/haptics`, `push-notifications`, `@capgo/capacitor-updater`) y el OTA no cruza cambios nativos. `android/app/build.gradle`: **versionCode 1→2** y **versionName "1.0"→"1.26.0"** (alinea el nativo con la serie OTA → resuelve el evento) + **signingConfig de release** que lee de `keystore.properties` (secretos, en `.gitignore`; fallback a debug si no existe). Nuevos: `android/keystore.properties.example` y guía `docs/BUILD_APK.md` (Capgo cloud builder + build local + creación del keystore). No cambia el web/OTA (no sube el bundle). |
| 1.26.0 | 2026-07-11 | **Baseline responsivo global — TODOS los módulos usables en el celular**. Auditoría: las tablas ya estaban casi todas envueltas (scroll interno), pero había **~91 grids fijos** (`grid-cols-4/5/6/7…` sin breakpoint) que en un teléfono quedaban apretados, y el contenedor principal no contenía el scroll horizontal. Fixes: (1) **colapso responsivo de grids** en `index.css` — a **≤640px** los `grid-cols-4..12` pasan a **2 columnas** (y a 3 en teléfonos ≥400px para grids muy densos); **no toca escritorio** (solo media max-width:640) ni `grid-cols-1/2/3`; verificado con render real (grid-cols-4 → 2 col en 360/412px, 4 col en 1200px). (2) **`overflow-x-hidden`** en el `<main>` (Layout) para que ningún módulo empuje la página de lado; las tablas anchas conservan su scroll interno. Beneficia a TODAS las pantallas (web y móvil) sin rediseñar cada una. La optimización fina por página sigue como barrido incremental. Sin cambios de BD. Tests 77/77. |
| 1.25.0 | 2026-07-11 | **PDA: MODO OFFLINE (no se pierden operaciones sin señal)**. El PDA se conecta a la cola de sincronización que ya existía (`src/lib/syncManager.js` + Dexie `db.syncQueue`: encolar por tipo, sync automático al reconectar/`online`, poll 15s, reintentos con backoff, recuperación de items atascados, expiración 72h). **Putaway offline de punta a punta**: al escanear ubicación/SKU sin señal se aceptan sin validar contra la BD (quedan "por validar (offline)"); al confirmar, si no hay red (o el `insert` cae por red) la operación se **guarda en la cola local** (`enqueueSyncItem type:'insert' tabla wms_ubicaciones`) en vez de perderse, y se sube sola al reconectar. **Indicador de pendientes** (`useSyncQueue`): chip con el N° de operaciones por subir en el Home y en el header de Putaway, banner ámbar "N por subir · Sincronizar" (online) y botón de sincronización manual; el banner offline ahora dice que **se puede seguir trabajando**. Consulta es solo lectura (usa la caché runtime del PWA). Todo OTA. Tests 77/77. |
| 1.24.0 | 2026-07-11 | **Móvil: responsividad universal + animaciones**. **Se ve igual de bien en cualquier modelo, sin cortes**: (1) **`min-h-dvh`** reemplaza `min-h-screen` en todas las pantallas del PDA — `100vh` en móviles incluye la barra del navegador/OS y cortaba los botones de abajo (CONFIRMAR); `dvh` mide el área real visible (con fallbacks `svh`/`vh`). (2) **Escalado tipográfico FLUIDO** solo en la app instalada (`html.is-native { font-size: clamp(14px,4vw,18px) }`, marcado en `App.jsx`): como Tailwind usa rem, TODO escala en proporción al ancho del equipo, acotado para que nunca se vea gigante (tablet) ni minúsculo (PDA 320px); no afecta la web de escritorio. (3) **Safe-area** en todos los headers (notch/isla/barra de gestos) + "app-feel" nativo (sin flash al tocar, sin rubber-band, sin zoom por doble-tap). (4) **Animaciones CSS puras** (fluidas en cualquier equipo, con `prefers-reduced-motion`): entrada escalonada del menú Home (`anim-stagger`), transición de cada paso de PUTAWAY y tarjetas de Consulta (`anim-fade-up`), entrada del overlay de actualización (`anim-scale-in` + `anim-pop` en el ícono), skeleton shimmer disponible. Todo OTA. Tests 75/75. |
| 1.23.1 | 2026-07-11 | **PDA móvil pulido**. (1) **Indicador de conexión REAL**: el "Online" estaba hardcodeado (siempre verde aunque el equipo no tuviera señal); ahora usa `useOnlineStatus` (navigator.onLine + eventos) y muestra **Conectado / Sin señal**, con **banner rojo** en Home y ícono de alerta en PUTAWAY cuando no hay red — el operario ya no cree que guarda estando offline. (2) **CONSULTA funcional** (`ConsultaPDA.jsx`, reemplaza el placeholder "Próximamente"): busca en `wms_ubicaciones` por SKU/descripción/ubicación, agrupa por producto y muestra total + ubicaciones con cantidades, con escaneo por cámara. (3) **Versión real** en el pie (`__APP_VERSION__` inyectada por Vite desde package.json) en vez de "v2.0" fijo — support sabe qué build corre. (4) **Safe-area**: los headers respetan el notch/barra de estado (`env(safe-area-inset-*)`). (5) Robustez menor: avatar/nombre con fallback. Todo OTA (sin recompilar nativo). Tests 75/75. |
| 1.23.0 | 2026-07-11 | **Móvil: canal BETA + promoción manual + rollback (deja de arriesgar toda la bodega en cada OTA)**. Antes cada push a `main` subía el bundle OTA directo a **production** → una versión rota caía de golpe en todos los PDA. Ahora: (1) el CI `capgo-ota.yml` sube a **canal `beta`** (solo los PDA de prueba lo reciben); (2) nuevo workflow `capgo-promote.yml` (`workflow_dispatch`) **promueve** una versión validada beta→production sin recompilar; (3) selector de canal **por dispositivo** en Admin → Monitor (`src/components/CanalOTA.jsx` + `setOTAChannel`/`getOTAChannel` en `mobileService.js`, solo app Android, con self-assign de Capgo); (4) `scripts/deploy_mobile.js` sube a beta por defecto (`-- production` para forzar); (5) runbook `docs/DESPLIEGUE_MOVIL.md` con el flujo desarrollo→beta→producción, rollback (panel Capgo un-clic + auto-rollback por `notifyAppReady`) y cambios nativos (versionCode). Nota: desde ahora un push a `main` NO actualiza la bodega hasta promover — es el freno de seguridad. Tests 73/73. |
| 1.22.0 | 2026-07-11 | **Calidad · Checklist de INGRESO reforzado estilo auditoría ISO** (sin migración: extras en `checklist._extras`). (1) **Clasificación del producto**: chips ☑ Equipo médico / Insumo estéril / Reactivo / Ayuda técnica / Mobiliario clínico / Repuesto (complementa las familias auto-detectadas; base para adaptar el checklist por familia). (2) **Evaluación del embalaje** (bloque exclusivo): Estado del pallet (Excelente/Bueno/Regular/Malo), Film stretch (Correcto/Incorrecto), Golpes visibles, Caja deformada y Humedad (Sí/No) con botones que marcan en rojo lo malo. (3) **Disposición inmediata**: ☑ Recepción aceptada / parcial / Cuarentena / Rechazo proveedor / Devuelto / Pendiente evaluación — obligatoria al finalizar NO CONFORME (ya no depende solo del informe posterior). (4) **Indicador de RIESGO automático** (`riesgoIngreso`): 🟢 Bajo / 🟠 Medio / 🔴 Alto calculado en vivo desde el embalaje dañado y las no conformidades. (5) **Indicadores ISO** al pie (`indicadoresIso`): tiempo de recepción (min), inspector, N° ítems, conformes, no conformes y resultado % — listos para dashboards. (6) **Tabla estilo auditoría en PDF/Word**: columnas **Requisito · Resultado · Evidencia · Observación**, con selector de evidencia por ítem (Documento / Conteo / Inspección visual / Medición / Registro fotográfico / Sistema) en Ingreso **y también en Salida** — el certificado indica CÓMO se verificó cada requisito. Todas las secciones nuevas van en los exports. Tests 73/73. |
| 1.21.0 | 2026-07-11 | **Calidad · Salida — CERTIFICADO REFORZADO para dispositivos médicos** (sin migración: los datos nuevos viven en `checklist._extras` jsonb, quedan dentro de la firma HMAC). (1) **Nivel 3 — Trazabilidad del producto**: 6 ítems nuevos (SKU corresponde al lote, serie coincide, vencimiento validado, sin bloqueo de calidad, sin cuarentena vigente, liberado para despacho) — demuestra que el producto salió de stock liberado. (2) **Evidencia fotográfica**: fotos de pallet / embalaje / dentro del camión (cámara o galería, comprimidas, bucket privado `monitoreo-evidencias` bajo `salida/<tarea>/`, auto-guardado al subir, URLs firmadas) que **se incrustan en el PDF** del certificado. (3) **Control de peso**: esperado vs registrado (kg, coma chilena) con resultado CONFORME/REVISAR (tolerancia ±2%, `resultadoPeso`). (4) **Bultos explícitos**: total editable + botón por bulto "Bulto i/N · Etiqueta OK/Pendiente" con contador. (5) **RIESGOS EVALUADOS**: chips ☑ estéril, frágil, mantener vertical, no apilar, cadena de frío, material peligroso, ninguno (exclusivo). (6) **SEMÁFORO DE CALIDAD** (`semaforoSalida`): banner grande 🟢 LIBERADO PARA DESPACHO / 🟠 DESPACHO CON OBSERVACIONES (no conforme con salvedades autorizadas) / 🔴 NO DESPACHAR / ⚪ EN EVALUACIÓN — en vivo en el formulario, en las tarjetas de la cola y en el PDF/Word (fila "Estado de despacho" + banner). Exports PDF/Word con todas las secciones nuevas. Tests 70/70. |
| 1.20.7 | 2026-07-11 | **Calidad · Salida — mejoras visuales del modal "Certificar salida (manual)"**. (1) **Cliente siempre legible**: pasa a fila completa (antes compartía fila y se cortaba el nombre); N.V+Panel, Guía y Bultos quedan en la primera fila y Transportista en fila completa. (2) **Búsqueda de SKUs sin ubicación**: los resultados se **agrupan por SKU+partida sumando el disponible** de todas las ubicaciones (antes salían 3 filas idénticas A-14-01/A-46-03/A-47-03) y muestran "partida · N UM disponibles"; la lista de SKUs elegidos tampoco muestra ubicación. Se creó una **certificación de muestra** (N.V 97201, cliente del Panel, 1 SKU BALANZA) para revisión visual. Tests 66/66. |
| 1.20.6 | 2026-07-11 | **Calidad · Salida conectado al "Panel Dashboard PTM" (info de la N.V automática)**. Nuevo servicio `src/services/panelPtm.js`: conexión de **solo lectura** al Supabase del panel externo (proyecto `yynlmcxmkrlmhqqoxskb`, tabla `operaciones` — lectura pública por RLS del propio panel, consulta REST con su anon key; la CSP ya permitía `https://*.supabase.co`). En **Certificar salida (manual)**, junto al campo N.V hay un botón (o Enter) **"Traer datos del Panel"**: busca la N.V exacta (`nv_ptm`) y **autollena** Cliente, Guía, Transportista (cae a `empresa_transporte`) y Bultos, además de mostrar una **tarjeta informativa** con Vendedor, Factura, N° envío, Tipo de despacho, Estado, chip URGENTE, fechas compromiso/despacho, División y Centro de costo. Si la N.V no está en el panel avisa y se puede seguir a mano. `fetchNvPanel`/`mapNvPanel` con test propio. Sin cambios de BD en CCO. Tests 66/66. |
| 1.20.5 | 2026-07-11 | **Análisis de Códigos: nueva rama de correo "ACTUALIZACIÓN DE CÓDIGOS"**. En la barra de selección se suma el botón **"Correo Actualización de Códigos"** (además de Ajuste/Traspaso): modal donde por CADA código antiguo seleccionado se informa **cómo debe crearse el código nuevo** — selector **Crear con P (con vencimiento) / S (sin vencimiento)**; si es **P la fecha de vencimiento es obligatoria** (input date, bloquea Copiar/Abrir si falta y resalta en rojo) — y el **código nuevo** editable (precargado con el P/S equivalente si existe; si no, "POR CREAR"; el sufijo del equivalente precarga P o S). Destinatarios recordados (`analisis_correo_dest`), observaciones, vista previa del cuerpo, **"Copiar (con tabla)"** (HTML con columnas Código antiguo/Descripción/UM/Disponible/Stock Total/Crear con/Vencimiento/Código nuevo vía ClipboardItem, fallback texto plano) y **"Abrir en correo"** (`mailto:` con guard de largo). Sin cambios de BD. Tests 64/64. |
| 1.20.4 | 2026-07-11 | **Análisis de Códigos: tabla dinámica completa + generar Traspaso/Ajuste desde la selección + fix del tope de 1.000 filas**. (1) **Números que no cuadraban**: PostgREST corta cada respuesta de RPC en 1.000 filas (max-rows), por lo que las tablas mostraban "(1.000)" aunque el KPI dijera 1.199/1.669 — `useAnalisisCodigos` ahora **pagina con `.range()`** hasta traer todo (el `ORDER BY codigo` de la RPC es estable). (2) **Tabla dinámica**: filtros por columna (Estado, Activo, UM, Duplicado con/sin P/S equivalente, Alertas, Stock), **orden por cualquier encabezado** (clic ▲▼), **fila de TOTALES** de lo filtrado, contador "X de Y" y export Excel que respeta los filtros. (3) **Traspaso/Ajuste directo**: checkbox por fila (+seleccionar todo lo filtrado) → barra de acciones **"Generar Ajuste" / "Generar Traspaso"**: modal con cantidad a usar (Disponible/Stock Total), acción SUMAR/DESCONTAR y observación; los códigos con **P/S equivalente van como recodificación** (destino = código nuevo). Se insertan como PENDIENTE directamente en el historial del módulo *Traspasos y Ajustes* (`enviarAEmil` escribe el blob de `tms_emil_sync` con rev nuevo; la app em-il lo adopta al abrir o en su poll de 12 s, con dedup por SKU ya listado). Sin cambios de BD. Tests 63/63. |
| 1.20.3 | 2026-07-11 | **Análisis de Códigos: carga DIRECTA del reporte de stock IW desde la propia pantalla (fix de la carga corrida)**. El reporte IW del ERP no trae columna "Bodega", por lo que al subirlo por Carga Masiva → Consolidado las columnas entraban corridas una posición (bodega=código, código=descripción → 39 "Nuevo (P)", 3.746 anomalías y ACTIVO 100% "No encontrado"). Se purgó esa carga (`TRUNCATE tms_inventario_general`) y ahora el Resumen de Análisis tiene su propio botón **"Cargar reporte de stock (Excel IW)"**: `parseStockFile()` detecta las columnas **por NOMBRE** ("Cod. Producto", "Producto/Descripción", "U. Medida", "Disponible", "Reserva", "Transitoria", "Consignación", "Stock Total"; números en formato chileno) igual que la carga del catálogo ACTIVO, dedup por código y **reemplaza por completo** la carga anterior (delete de bodega `CONSOLIDADO` + `bulk_upsert` en chunks de 800 por `bodega,codigo_producto`), invalidando resumen y tablas al instante (`useCargarStock`, `src/services/analisisService.js`). Carga Masiva → Consolidado queda como alternativa (nota en la tarjeta). Sin cambios de BD. Tests 62/62 y build OK. |
| 1.20.2 | 2026-07-10 | **Conteo Cíclico: CORREO DE AJUSTE desde Conciliación y Ajuste ERP**. Todo lo que **falta o sobra** en el conteo ahora se convierte en correo con un clic: botón **"Correo de ajuste (N)"** en Conciliación y en Ajuste ERP (este último incluye la partida). Abre un modal con: **selección de diferencias** (todas marcadas por defecto, con su ajuste ± y estado), destinatarios (se recuerdan entre usos), observaciones, **impacto valorizado neto** de lo seleccionado y **vista previa del correo** (FALTANTES / SOBRANTES con contado vs sistema → ajuste). Dos salidas: **"Copiar (con tabla)"** — copia el correo con tabla HTML que al pegar en Outlook conserva el formato (fallback a texto plano) — y **"Abrir en correo"** — `mailto:` con asunto y cuerpo listos (avisa si la selección es muy grande para el largo del mailto). Sin cambios de BD. Tests 62/62 y build OK. |
| 1.20.1 | 2026-07-10 | **Inventario → CARTELES DE BODEGA — port del Excel "CARTELES PTM"**. Impresión de carteles de producto en los 3 formatos del Excel: **Único** (1 por hoja), **Doble** (2) y **Cuádruple** (4), cada cartel con la etiqueta CÓDIGO PRODUCTO, el código gigante, la descripción y el **código de barras CODE128 generado al vuelo** (`src/lib/code128.js`, sin dependencias — en el Excel eran imágenes pegadas a mano). La "tabla de códigos" (hoja BD) se conecta a la **tabla maestra existente** `tms_matriz_codigos`: buscador con debounce por código/descripción, opción de código manual, cola de impresión con copias por producto, vista previa fiel al papel e impresión directa (`@media print`, una página A4 por grupo, tipografías heredadas del Excel por formato). Ruta `/inventory/carteles` con permisos de bodega existentes; item "Carteles de Bodega" en el menú Inventario + catálogos Roles/Vistas. **Sin migración** (no hay tablas ni permisos nuevos). Tests 61/61 y build OK. |
| 1.20.0 | 2026-07-10 | **Inventario → ANÁLISIS DE CÓDIGOS — port nativo del Excel "STOCK NAME" (actualización a nomenclatura P/S)**. Todo lo que hacía el Excel, calculado EN VIVO: clasificación de cada SKU (**Nuevo (P) / Nuevo (S) / Antiguo** según el sufijo del código), **antiguos que aún tienen Disponible**, **duplicados** (la descripción ya existe con un código P/S → muestra el **código equivalente**, réplica del PS_Index), estado **Activo/No activo/No encontrado** contra el catálogo del ERP, **no activos con stock**, y **anomalías con diagnóstico automático** (punto final sobrante, código incompleto, sin dígitos, sufijo inválido ≠ P/S, filas de prueba). **BD (migración `067`)**: tabla `tms_productos_activo` (catálogo Activo Si/No; escritura solo vía `bulk_upsert`, tabla agregada a su allowlist) + RPCs `analisis_codigos(filtro, q)` y `analisis_codigos_resumen()` (SECURITY DEFINER, gate de permisos de bodega/stock) sobre `tms_inventario_general` **sumado por SKU entre bodegas**; verificado contra las filas reales del Excel (N010500035 → duplicado de NGE10500035P, anomalías detectadas 1:1). **Frontend**: `src/pages/Inventory/AnalisisCodigos.jsx` con secciones por menú (`?tab=`): **Resumen** (los KPIs de la hoja Resumen + panel de fuentes de datos con carga del catálogo ACTIVO desde la misma pantalla y link a Carga Masiva → Consolidado para el stock), Antiguos, Antiguos c/Disponible, No Activos c/Stock, Duplicados, Anomalías y Detalle completo con **export del libro entero (6 hojas)**. El "HUB" de pallets del Excel ya existía como Conteo · Proyección. Menú Inventario + catálogos Roles/Vistas actualizados (checklist completo). Tests 59/59 y build OK. |
| 1.19.2 | 2026-07-10 | **Reorganización de menú: Mapa de Calor y Gestión de Ubicaciones pasan al módulo INVENTARIO**. "Mapa de Calor" sale de Consultas y "Gestión de Ubicaciones" sale de Configuración; ambos viven ahora en el desplegable **Inventario** del Navbar (con lo que un rol de bodega con `manage_locations` puede administrar ubicaciones sin ser ADMIN). Las **URLs no cambian** (`/queries/heatmap`, `/admin/locations`) para no romper accesos directos ni landing pages guardadas en roles. Catálogos actualizados: `APP_ROUTES` (module `inventario`, labels nuevos), `APP_PERMISSIONS` (checkbox `manage_locations` movido al grupo Inventario; `view_locations` permanece en Consultas porque también abre Consultas → Ubicaciones), y migración `066` (`tms_permisos.modulo='inventario'` para `manage_locations`). Bodegas Softland permanece en Configuración. Tests 56/56 y build OK. |
| 1.19.1 | 2026-07-10 | **Fix navbar: el item activo del menú ahora respeta la pestaña (`?tab=`)**. Estando en Conteo · Ajuste ERP (o cualquier sección con deep-link de Inventario/Post-Venta), el menú marcaba como activo el primer item de la ruta base ("Conteo · Contar") porque la comparación usaba solo el pathname. Nuevo helper `esRutaActiva()` en `Navbar.jsx`: un item con `?tab=` está activo solo si coinciden ruta Y pestaña, y el item base solo cuando la URL no trae pestaña (aplicado en dropdown desktop, sección activa y menú móvil). Tests 56/56 y build OK. |
| 1.19.0 | 2026-07-10 | **BLOQUE A del informe de seguridad/Ley 21.719 IMPLEMENTADO** (ver `INFORME_SEGURIDAD_LEY_CHILE.md`). **BD**: migración `062` — la auditoría deja de registrar el heartbeat de presencia (trigger por columnas relevantes + minimización sin presencia/push_token), **purga de 102.441 filas/139 MB** (BD total 239→103 MB) y retenciones pg_cron nuevas (auditoría 12 m, mediciones 24 m, errores picking 24 m, correos PV 36 m); `063` — **RLS de datos personales**: `tms_usuarios` solo la fila propia (+admin), conductores solo con permisos TMS/consultas (+fila propia), correos/tickets/técnicos de Post-Venta solo con permisos del módulo (+gate en `pv_correos_ticket`), accesos y errores de picking solo admin, mediciones solo outbound; helper `usuario_tiene_algun_permiso(text[])`; `064` — **supresión completa de usuario** (`eliminar_usuario_completo`: borra cuenta auth + accesos + presencia + auditoría del registro, anonimiza mediciones/errores/tickets; Users.jsx la usa); `065` — **buckets de Storage PRIVADOS** (fichas + evidencias) con URLs firmadas (util `src/lib/storageUrl.js`; PhotoUploader, visor de informe en Post-Venta, ficha técnica y export Word/PDF de Daños firman por `storage_path`). **App/server**: `xlsx` actualizado a SheetJS **0.20.3** parcheado (alias npm `@e965/xlsx`; CVE-2023-30533/CVE-2024-22363) incl. el vendor de Traspasos (el update script lo re-pisa); CSP **sin `unsafe-inline`** en scripts (hash sha256 del único inline); **rate-limit** al proxy IA (20/5 min por sesión) y `trust proxy`; **proxies `/api/geocode` y `/api/route`** con caché y User-Agent identificado — las direcciones de clientes ya no salen del navegador a OSM (CSP sin nominatim/osrm); **Sentry sin Session Replay y sin email/nombre** (solo id interno, `sendDefaultPii:false`); el HTML del asistente IA de Traspasos se **sanitiza** en cco-bridge antes del innerHTML; webhook `postventa-inbox` v7 acepta el token **solo por header**; Android `allowBackup=false`; el logout limpia también cola de recepción, estados de patio y cachés Dexie. Tests 56/56 y build OK. **Pendiente organizacional (Bloque B)**: aviso de privacidad, Reglamento Interno, ARCO, DPAs, brechas — requiere a PTM/abogado. |
| 1.18.3 | 2026-07-10 | **AUDITORÍA FULL-STACK del proyecto + ola de fixes (25+ bugs) + flujo maestro documentado**. Se auditó el proyecto completo con 5 revisiones paralelas (wiring rutas/permisos, frontend↔BD real, Post-Venta, Conteo/Calidad, núcleo auth/server/PWA) y se corrigió todo lo confirmado. **Seguridad/Guard**: `ProtectedRoute` pasa a **default-deny** con normalización (antes `/Admin/Users/` con mayúscula o slash final se saltaba el permiso) y soporta rutas con parámetro vía `matchPath` (nuevo `permisosDeRuta()`; `/inventory/bloque/:codigo` ahora exige permisos de conteo); `SmartRedirect` recorta `?tab=` del landing (los landings con pestaña ya no caían en "Acceso Denegado"); **admin delegado** unificado (hasPermission + Navbar + revocación en caliente por realtime); logout limpia presencia/push token/sesión de picking/cachés SW **antes** de destruir el token; login conserva el deep-link (QR de bloque → login → bloque). **server.js**: `index.html`/manifest/SW con `no-cache` (antes 1 día de caché → pantalla blanca tras cada deploy), assets hasheados immutable 1 año, `/api/*` inexistente responde 404, y el proxy IA con timeout 60s + campos permitidos + tope de tokens + modelo validado. **Post-Venta**: webhook `postventa-inbox` v6 (JSON aunque el Content-Type venga mal, fechas VBA dd/mm/yyyy ya no se invierten día/mes, dedup sintético con fecha, y **errores transitorios responden 500 para que la macro reintente** — antes un correo con falla se marcaba enviado y se perdía); `postventa-extractor` v3 alineado a hilos/descartados (usaba `crear_pv_ticket` → duplicaba tickets por respuesta y revivía casos eliminados); migración **`061`** (hilo con orden estable; `eliminar_pv_ticket/correo` exigen `supervise_postventa` y la UI oculta los 🗑 sin ese permiso); búsqueda escapada (comas/paréntesis ya no rompen la query) y ahora también busca por remitente/asunto; volver a "Tickets" desde el menú funciona; límite 500→2000; selects muestran valores fuera de catálogo como "(no vigente)". **Conteo/Calidad**: registrar/editar/eliminar conteo refrescan Conciliación/Ajuste; QR de bloques generado desde la app Android usa la URL pública (antes `https://localhost/...`); tab sync del menú arreglado; validación del área ANTES de dictaminar (la acción recomendada ya no se podía perder); solo Calidad entra al editor de Daños (Inventario lo abre en lectura); `deleteEvidencia` ya no deja huérfanos en Storage; uploads respetan el tipo real de la imagen y el límite del bucket; anti doble-scan en el escáner (guard síncrono + stop scoped por instancia); debounce de Proyección con limpieza (sin toasts espurios al borrar fila). **PDA**: se elimina el modo "Picking guiado" (leía `tms_picking_tasks`, tabla que **nunca existió** — el botón siempre falló). **Command Palette**: "Kardex" apuntaba a una ruta inexistente → ahora Lotes/Series con `?q=` precargado (Batches/HistorialNV lo leen). **Núcleo**: stores con `useShallow` (fin de re-renders por tick del timer), refetch forzado ya no se descarta si hay carga en vuelo, canales realtime globales ya no se re-suscriben en cada heartbeat, heartbeat reporta el módulo real. Documento nuevo **`FLUJO_SISTEMA.md`** con el flujo completo de conexiones. Tests 56/56 y build OK. |
| 1.18.2 | 2026-07-10 | **Conteo Cíclico: navegación por el menú, como el resto de los módulos**. Se quita la fila de pestañas dentro de la página (Contar/Sesiones/Conciliación/Ajuste ERP/Bloques/Proyección): la sección activa la decide el **menú Inventario** (desplegable con *Conteo · Contar / Sesiones / Conciliación / Ajuste ERP / Bloques-QR / Proyección*) vía deep-link `?tab=` — mismo patrón aplicado a Post-Venta. La página honra la URL (`useSearchParams`, fallback a Contar) y la navegación interna (abrir una sesión → Conciliación) actualiza la URL. Rutas de landing por sección agregadas a `APP_ROUTES`. Tests ajustados a deep-links (56/56) y build OK. |
| 1.18.1 | 2026-07-10 | **Conteo Cíclico: cámara integrada (igual que Recepción Importaciones)**. La pestaña **Contar** de Inventario → Conteo Cíclico suma el escáner de códigos con cámara nativa (ML Kit vía `useBarcodeScanner`, el mismo hook/patrón de Recepción): botón verde **ESCANEAR** en **Ubicación** y en **Producto/SKU** (al escanear el SKU se dispara la búsqueda de stock/lotes automáticamente) y botón de cámara compacto en **Partida/Talla** y **Serie**. En web el botón avisa que el escáner requiere el dispositivo (app Android); en el PDA móvil la cámara ya existía. Tests 56/56 y build OK. |
| 1.18.0 | 2026-07-10 | **Admin: "Usuarios y Roles" UNIFICADOS + estructura precisa de permisos**. Las pantallas Usuarios y Roles se unifican en una sola sección **Configuración → Usuarios y Roles** (`src/pages/Admin/AccessControl.jsx`): cabecera CCO + pestañas *Usuarios* / *Roles y Permisos* (las rutas `/admin/users` y `/admin/roles` abren la misma página en su pestaña; cada una conserva su permiso). **Precisión al crear usuarios**: al elegir el rol en el modal aparece el **resumen en vivo del rol** — cuántos permisos otorga, qué **módulos/pantallas verá** (chips con conteo por módulo, tooltip con las pantallas) y su página de inicio — para saber exactamente qué acceso se da ANTES de guardar. **Precisión al crear roles**: el editor suma el panel **"Accesos que otorga"** (en vivo: al marcar permisos se ve qué pantallas desbloquean, cruzando `ROUTE_PERMISSIONS` con el catálogo de rutas — nuevo helper `accesosConPermisos()` en `constants/permissions.js`), selector de **página de inicio** del rol (se guarda en `tms_roles.landing_page`), lista de **usuarios que tienen el rol** (a quién afecta el cambio), **duplicar rol** (misma matriz de permisos con un clic) y vista previa del ID al crear. Navbar: un solo ítem "Usuarios y Roles". Sin cambios de BD. Tests 56/56 y build OK. |
| 1.17.4 | 2026-07-10 | **Inventario: carpeta "CALIDAD TRAZABILIDAD" en Traspasos + "Correo enviado" resuelve la tarea según el dictamen**. En **Inventario → Traspasos** aparece la carpeta colapsable **CALIDAD TRAZABILIDAD** (contador en vivo vía realtime; se oculta si no hay pendientes): ahí **caen las solicitudes** que el dictamen de Calidad deriva a bodega (`AJUSTE`/`BAJA`/`TRANSITORIO`/`REACONDICIONAR`), cada una con folio ACC-, chips de dictamen/acción/BD destino, SKU/partida/ubicación/cantidad, instrucción y urgencia. Botones: **"Correo enviado"** — al generar el correo de traspaso con la app y marcarlo, la **tarea de Calidad se RESUELVE sola según el dictamen** (RPC `accion_correo_enviado`, migración `060`: acuse automático *"Correo de traspaso enviado · Dictamen X · Acción Y → BD Z"*, referencia opcional, `resuelto_por` y timestamp; gate Inventario/área responsable/Calidad/admin) — y **"Traza"** (abre la trazabilidad del producto, donde queda el evento). Verificado end-to-end en BD (acción TRANSITORIO/CUARENTENA → RESUELTA con acuse por dictamen). Tests 56/56 y build OK. |
| 1.17.3 | 2026-07-10 | **Post-Venta: el INFORME de Calidad cae junto con el ticket (visor para Servicio Técnico)**. Al abrir un ticket derivado de Calidad, el botón **"Ver informe"** (caja verde) abre el **informe completo dentro del ticket**, sin permisos de Calidad ni salir del módulo: cabecera del informe (número, fecha, analista, tipo/periodicidad), **dictamen** con su color, ficha del **producto dictaminado** (SKU, partida/lote, ubicación, cantidad, condición observada, motivo, bodega destino, tipo de daño/componente/consecuencia, quién y cuándo dictaminó), la **instrucción de Calidad** de la acción y las **evidencias fotográficas** (galería clicable). **BD (migración `059`)**: RPC `pv_informe_calidad(numero)` (SECURITY DEFINER, gate Post-Venta/Calidad/admin) que arma el paquete `{informe, item, evidencias, accion}` vía ticket → acción → ítem dictaminado (con fallback por número de informe + SKU). Verificado end-to-end en BD con el informe real MON-2026-0001 (dictamen CUARENTENA, "Daño de empaque"). Frontend: hook `useInformeCalidadTicket` + `InformeCalidadModal`. Tests 56/56 y build OK. |
| 1.17.2 | 2026-07-10 | **Post-Venta: serie ESPECIAL `CAL-AAAA-NNN` para los casos derivados de Calidad + filtro por Origen**. Los tickets que nacen de una Acción de Calidad ya no caen en la serie de su tipo: toman su **correlativo propio `CAL-`** y lo **conservan aunque se reclasifique el tipo** (verificado: CAL-2026-001 se mantiene al pasar de Mant. Correctiva a Falla Técnica; el TKT- tampoco cambia). **BD (migración `058`)**: generador genérico `pv_siguiente_folio_serie(prefijo)` (la versión por tipo delega en él), `accion_a_ticket_pv` asigna serie CAL-, `actualizar_pv_ticket` no re-serializa folios CAL- (y si un ticket origen Calidad quedara sin folio, se le asigna CAL-), backfill de los casos Calidad existentes. **Frontend**: chip del folio en **verde esmeralda** para la serie CAL- (`pvFolioCls`; el resto hereda el color de su tipo) y **filtro "Origen"** (Manual/Correo/Calidad) en la lista de tickets — Post-Venta filtra de una todos los casos que le derivó Calidad. Tests 56/56 y build OK. |
| 1.17.1 | 2026-07-10 | **Post-Venta: correlativo ÚNICO por TIPO de solicitud + filtro y distintivo por tipo**. Cada ticket conserva su ID global inmutable (`TKT-AAAA-NNN`, clave de seguimiento) y además recibe un **folio por serie según su tipo**: `INS-` Instalación, `CAP-` Capacitación, `MPR-` Mant. Preventiva, `MCO-` Mant. Correctiva, `FAL-` Falla Técnica, `VIS-` Visita Técnica, `PEM-` Puesta en Marcha, `GAR-` Garantía, `VEN-` Venta Servicios, `DIA-` Diagnósticos, `OTR-` Otro. **BD (migración `057`)**: columna `folio_tipo` (índice único parcial), `pv_tipo_prefijo()` + `pv_siguiente_folio_tipo()` (advisory lock por serie+año), asignación en `crear_pv_ticket`/`ingesta_pv_correo`/`accion_a_ticket_pv`, **reclasificación**: `actualizar_pv_ticket` re-asigna el folio de la serie nueva cuando cambia el tipo (el TKT no cambia; verificado FAL-2026-001 → INS-2026-001), y **backfill** de los 999 tickets existentes (OTR-2026-001…999). **Frontend**: filtro **"Tipo"** en la lista de tickets, chip de color por tipo (`PV_TIPO_META`), folio visible bajo el TKT en la lista/Bandeja/modal, búsqueda también por folio de tipo y columna "ID Tipo" en el export XLSX. Tests 56/56 y build OK. |
| 1.17.0 | 2026-07-09 | **Calidad conectada con Inventario y Servicio Técnico (el dictamen cae al módulo ejecutor) + FIX crítico del folio de tickets**. **(1) Acción → Servicio Técnico**: una Acción de Calidad `REPARACION`/`POST_VENTA` se convierte con un clic en un **ticket TKT-** (botón "Crear ticket Serv. Técnico" en el tablero de Acciones y en Mi Bandeja) con el **Informe de Calidad adjunto** (número de informe + dictamen + SKU/partida/ubicación + instrucción en la descripción; columnas `accion_folio`/`informe_numero` en el ticket): el ticket nace `origen='Calidad'` (chip verde en la lista y caja "Caso derivado de Calidad" en el modal con link al informe), prioridad URGENTE→Alta, equipo = familia real del SKU, y la acción queda **EN_PROCESO** enlazada al ticket (chip con el TKT). RPC idempotente `accion_a_ticket_pv` (mig `055`). **(2) Acción → Inventario/Traspasos**: en acciones `AJUSTE`/`BAJA`/`TRANSITORIO`/`REACONDICIONAR`, botones "Ir a Traspasos" y **"Registrar traspaso/correo"** (RPC `accion_registrar_referencia`, gate área responsable/Calidad/admin): al generar el traspaso por correo se registra la referencia y la acción pasa a EN_PROCESO. **(3) Trazabilidad**: `trazabilidad_producto` ahora muestra en el evento ACCION el **Ticket ST** y la **Ref. traspaso/correo** (verificado end-to-end en BD). **(4) FIX CRÍTICO (mig `056`)**: el folio `lpad(n,3,'0')` **truncaba sobre el Nº 999** (`lpad('1000',3)='100'`) → con 999 tickets cargados **ningún ticket nuevo podía crearse** (ni correos nuevos de la macro); nuevo helper `pv_folio_num()` en las 4 funciones generadoras (TKT-2026-999 → TKT-2026-1000). Componente compartido `AccionIntegracion.jsx`; hooks `useAccionATicketPv`/`useAccionReferencia`. Tests 56/56 y build OK. |
| 1.16.2 | 2026-07-09 | **Módulos nuevos administrables en Roles y Vistas + regla permanente**. Los módulos integrados no quedaban gobernables: **Inventario** (Traspasos + Conteo Cíclico) no existía en `APP_MODULES` ni en `tms_modules_config` (no se podía encender/apagar en Admin → Vistas) y sus rutas apuntaban a un módulo inexistente (`wms`); los permisos del Conteo estaban mezclados dentro del grupo "TMS" en Admin → Roles. Fixes: (1) `config/modules.js` — módulo `inventario` en `APP_MODULES`, rutas de Inventario re-apuntadas, grupo propio **"Inventario (Traspasos + Conteo Cíclico)"** en `APP_PERMISSIONS` (con nota de que Traspasos usa permisos de bodega existentes), y rutas de landing de Post-Venta (Bandeja/Calendario/Dashboard vía `?tab=`). (2) **Migración `054`** — siembra `inventario` y `postventa` en `tms_modules_config` (Vistas solo muestra módulos con fila en esa tabla ∩ `APP_MODULES`); verificado que `tms_permisos` ya tenía los 6 permisos de conteo/post-venta. (3) **Regla permanente en `CLAUDE.md`**: checklist de 6 pasos al agregar un módulo (App.jsx, ROUTE_PERMISSIONS, Navbar, los 3 catálogos de modules.js, migración tms_permisos+tms_modules_config, docs) para que TODO módulo nuevo quede siempre visible/asignable/apagable desde Roles y Vistas. Tests 56/56 y build OK. |
| — (BD) | 2026-07-09 | **Limpieza aprobada de la auditoría (migración `053`)**: DROP de las **8 tablas muertas** (`wms_bloques(+3)`, `wms_cc_*(3)`, `wms_proyecciones` — 0 filas y 0 referencias, restos del primer intento del Conteo Cíclico) y de las **4 funciones sin uso** (`wms_reserve_stock`, `get_fefo_allocation`, `fn_auto_complete_picking`, `fn_trigger_replenishment`). Verificado en vivo antes y después: el esquema queda en **61 tablas, todas vivas y conectadas**. Se conservó todo lo referenciado (`wms_layout`, `wms_ubicaciones`, `wms_move_stock`, `get_dashboard_kpis`, `fuzzy_search`, `batch_update_nv_estado`, `tms_inventario_general`). `DIAGRAMA_BD.md` §6.4 actualizado. |
| — (BD) | 2026-07-09 | **Auditoría COMPLETA de la base de datos + endurecimiento (migración `052`) + diagrama**. Se auditó la BD live entera: 69 tablas (todas con RLS), 95 funciones `public` + 1 `private`, 5 Edge Functions y las 117 advertencias de `get_advisors`. Resultado en **`supabase/DIAGRAMA_BD.md`**: diagramas **ER por módulo** (FKs reales), tabla de **relaciones lógicas** por texto (SKU del ERP, técnico por nombre, familia = 3 chars — de diseño, sin FK), inventario de funciones con su verificación y hallazgos con estado. **Fixes aplicados (052)**: se revocó `anon` de **11 funciones SECURITY DEFINER** que eran ejecutables sin sesión (fuga real: `pv_dashboard` exponía tickets/clientes, `conteo_conciliacion`/`conteo_stock_sistema` exponían stock valorizado; queda pública solo `verificar_certificado` para el QR); se fijó `search_path` en **7 funciones** que lo tenían mutable (incl. `private.calidad_firma_mensaje`, la firma HMAC); `mv_dashboard_kpis` ya no es legible por `anon`. Verificado post-fix: 0 SECURITY DEFINER ejecutables por anon (salvo la intencional). **Pendientes documentados**: 27 políticas RLS `USING(true)` (ledger interno, decisión de negocio), HIBP en Auth (toggle manual), y limpieza de 8 tablas + 4 funciones muertas (restos del primer intento del conteo; propuesta en §6.4 del diagrama, requiere aprobación). |
| 1.16.1 | 2026-07-09 | **Post-Venta: total "por asignar", eliminar/descartar correos y folio robusto**. La Bandeja de Correos muestra ahora el total **"por asignar"** (casos sin técnico, en rojo) junto al "por gestionar". Se puede **eliminar** un caso completo (botón 🗑 en la Bandeja) o un correo puntual del hilo (🗑 en el lector); lo eliminado entra en una **lista de descartados** (`tms_postventa_descartados`, migración `051`) para que **NO vuelva a cargarse** aunque la macro lo reenvíe (`ingesta_pv_correo` ignora los `id_correo` descartados). RPCs nuevas `eliminar_pv_ticket(numero)` (descarta los correos del caso) y `eliminar_pv_correo(id_correo)` (si el caso queda sin correos, se borra). Además el generador de folio sube a **40 reintentos** para soportar la ráfaga de la carga inicial (la macro insertó ~1.000 casos: **2.166 correos → 999 hilos**, sin duplicados). Tests 56/56 y build OK. |
| 1.16.0 | 2026-07-09 | **Post-Venta: lector de correo estilo Outlook + hilos (un caso por conversación) + Interno/Externo**. Antes cada correo (incluidas las respuestas) creaba un ticket → duplicados del mismo hilo. Ahora **un hilo = un caso**. **BD (migración `050`)**: tabla `tms_postventa_correos` (cada correo con De/Para/CC/Asunto/cuerpo/adjuntos/recibido, dedup por `id_correo`/EntryID), columna `conversation_id` en el ticket, RPC `ingesta_pv_correo(...)` (guarda el correo y lo enlaza a UN ticket por `conversation_id`; crea el ticket solo si el hilo es nuevo; migra los tickets del flujo viejo por `id_correo`) y `pv_correos_ticket(numero)` (devuelve el hilo ordenado por fecha). La **Edge Function `postventa-inbox`** pasa a llamar `ingesta_pv_correo` con todos los campos que ya envía la macro (conversation_id, para, cc, etc.). **Frontend**: en la Bandeja, botón **Leer** abre el **lector de hilo** (`ThreadReader`) con cada mensaje ordenado (De/Para/CC/Asunto/fecha/cuerpo, adjuntos), sin duplicados; chip **Interno/Externo** por dominio del remitente (`ptm.cl` = interno, `DOMINIOS_INTERNOS`) con filtro Todos/Internos/Externos. Verificado en BD (2 correos mismo `CONV` → 1 ticket, hilo con 2 mensajes; reingesta idempotente). Tests 56/56, build OK. |
| 1.15.4 | 2026-07-09 | **Post-Venta: Bandeja de Correos (triage + derivar el caso)**. Nueva pestaña **Bandeja Correos** (`src/pages/Postventa/Postventa.jsx`, `TabBandeja`) que reúne los tickets que entran por correo (`origen='Correo'`) para gestionarlos: muestra el conteo total y los **"por gestionar"** (sin técnico, con datos "Por Definir" o recién abiertos), con búsqueda por remitente/asunto y toggle *Por gestionar / Todos*. Cada caso permite **derivar** rápido a un técnico (dropdown "Derivar a técnico…", que además pasa el estado a *En Proceso*) o abrir la **gestión completa** (modal de edición) para completar región/comuna/equipo/estado/resultado. Enlace en el menú y deep-link `?tab=bandeja`. Tests 56/56 y build OK. |
| 1.15.3 | 2026-07-09 | **Post-Venta: "Equipo / Modelo" conectado al stock (familias reales)**. El selector Equipo/Modelo deja de usar una lista fija y se alimenta de las **familias reales del stock de CCO**: la familia = los **3 primeros caracteres** del código de producto (`tms_partidas.codigo_producto`). **BD (migración `049`)**: RPC `pv_familias_stock()` (solo lectura, `authenticated`) que devuelve las **101 familias** con su conteo de SKUs y un ejemplo de producto. **Frontend**: hook `useFamiliasStock` + el `Sel` ahora admite opciones `{value,label}` (muestra `NGE · MANGO DE BISTURI… (423)` y guarda `NGE`); usado en el alta y en el modal de edición (que también se puede editar), con texto libre para casos fuera de catálogo. Build OK, tests 55/55. |
| 1.15.2 | 2026-07-09 | **Post-Venta: selector Región → Comuna** (más alta de ticket flexible). El formulario Nuevo Ticket y el modal de edición suman un selector **Comuna** en cascada que se llena con las comunas oficiales de la **Región** elegida (`src/constants/comunasChile.js`, 16 regiones → 346 comunas; admite texto libre); al cambiar de región se limpia la comuna. Además, crear un ticket a mano ahora solo exige **cliente + descripción** (región/equipo/tipo/prioridad se autocompletan con "Por Definir"/"Otro"/"Media", como los tickets de correo). **BD (migración `048`)**: columna `comuna` en `tms_postventa_tickets`; `crear_pv_ticket` (+param opcional `p_comuna`) y `actualizar_pv_ticket` la manejan. La comuna se ve en la lista de tickets y en el export XLSX. Verificado en BD (crear con comuna → persistida). Build OK. |
| 1.15.1 | 2026-07-09 | **Post-Venta: Calendario / Agenda de tickets + fecha de visita programada**. Se agrega la pestaña **Calendario** al módulo Post-Venta (`src/pages/Postventa/Postventa.jsx`): grilla mensual (lunes-primero) que ubica **todos los tickets por fecha**, con selector de base (**Fecha de visita** / **Apertura** / **Cierre**), filtro por técnico, navegación mes ± y "Hoy"; cada día muestra los tickets coloreados por estado y al hacer clic se listan abajo (clic en uno abre su edición). **BD (migración `047`)**: columnas `fecha_programada` (date) + `hora_programada` (text) en `tms_postventa_tickets` (índice en `fecha_programada`); `crear_pv_ticket` se recrea con 2 parámetros opcionales al final (`p_fecha_programada`/`p_hora_programada`; los callers por nombre —frontend y edge functions— siguen intactos) y `actualizar_pv_ticket` ahora maneja ambos campos. El formulario de **Nuevo Ticket** y el **modal de edición** suman *Fecha/Hora de visita*. Verificado en BD (agendar visita → fecha_programada persistida). Tests 55/55 y build OK. |
| 1.15.0 | 2026-07-09 | **Módulo Post-Venta / Servicio Técnico — port nativo de `lockowom/post-venta` a CCO (Supabase)**. El otro proyecto (app Flask + extractor Python de correos Outlook/M365 que consolidaba tickets en Excel) se **reescribe como módulo nativo** de CCO. **BD (migración `046`)**: `tms_postventa_tickets` (folio **`TKT-AAAA-###`**, cliente/región/equipo/serie, tipo, prioridad, técnico, estado, cotizar, resultado, `origen` Manual|Correo, `id_correo` con índice único parcial para **dedup** del extractor) y `tms_postventa_tecnicos` (catálogo **editable**, sembrado con Cesar Tapia, Lucas Toloza, Oscar Leiva, Cristobal Altamirano, Leticia Rivera, Sin Asignar). Escrituras por RPCs SECURITY DEFINER (`crear_pv_ticket` idempotente por `id_correo` + advisory lock del folio, `actualizar_pv_ticket`, `guardar_pv_tecnico`, `eliminar_pv_tecnico`, `pv_dashboard`) gateadas por permisos nuevos **`view_postventa`/`manage_postventa`/`supervise_postventa`** (helper `_pv_assert` que además permite `service_role` para el extractor); lectura por RLS `authenticated`. **Frontend**: `src/services/postventaService.js` (catálogos como constantes — regiones, tipos, prioridades, estados, equipos, resultados — + hooks) y `src/pages/Postventa/Postventa.jsx` (tabs **Tickets** con filtros/búsqueda/export XLSX y modal de edición, **Nuevo Ticket**, **Dashboard** con KPIs/tiempos/carga por técnico, **Técnicos** editable para supervisor). Ruta `/postventa/tickets` en `App.jsx`, permiso por ruta (`permissions.js`), menú **Inteligencia → Post-Venta** (`Navbar.jsx`, icono `Wrench`), catálogos de ruta/permiso/módulo en `config/modules.js`. **Extractor de correos**: Edge Function `supabase/functions/postventa-extractor` (Deno) — port del `main.py`: token app-only de Microsoft Graph (client credentials, permiso `Mail.Read`), lee el buzón configurado, dedup por id de mensaje y crea tickets `origen='Correo'` (borrador con campos de gestión "Por Definir" para completar a mano) vía `crear_pv_ticket`. Requiere secrets `GRAPH_TENANT_ID`/`GRAPH_CLIENT_ID`/`GRAPH_CLIENT_SECRET`/`PV_MAILBOX` y programación (pg_cron+pg_net o llamada manual). Flujo crear→idempotencia→actualizar→dashboard verificado en BD (rollback test, `TKT-2026-001`). Tests **54/54** (`src/tests/postventa.test.jsx`, 4 casos) y build OK. |
| — (BD) | 2026-07-09 | **FIX crítico de integridad del stock (Lotes/Series duplicados)**. Síntoma: en Consultas → Lotes/Series un SKU salía con 2 filas (una con lote, otra sin lote) y **sumaba cantidades**. Causa raíz: `UNIQUE(codigo_producto, partida)` (y `serie`) **no deduplica** las filas sin lote porque `bulk_upsert` (mig 009) manda la partida vacía como `NULL`, y en Postgres los `NULL` no chocan → cada carga semanal **re-inserta** las filas sin lote → acumulación masiva (**45.681** duplicados en `tms_partidas`, **44.358** en `tms_series`; hasta 31 copias de una misma fila). **Fix**: (1) migraciones **`044`/`045`** — triggers que normalizan `partida`/`serie` (NULL/espacios → `''`) para que el índice único deduplique y el upsert del import actualice en vez de apilar; (2) **limpieza única** vía MCP con respaldo (`tms_partidas_backup_20260709`, `tms_series_backup_20260709`): dedup por clave normalizada (la más reciente) + quitar la fila sin lote cuando **duplica** el stock del lote real (aprobado por el usuario). Resultado: `tms_partidas` 51.489→**4.784**, `tms_series` 49.432→**5.074**, 3.044 SKUs intactos; el SKU del reporte ahora muestra **1 fila** (lote 1220, 4). Verificado por la RPC `search_batches`. |
| 1.14.6 | 2026-07-09 | **Traspasos: se ve completo a zoom 100% (sin cortes, sin scroll)**. El contenido de CCO vive en `max-w-[1600px] mx-auto` (`Layout.jsx`), así que el módulo tiene un ancho acotado; con el modo 2-columnas (≥1400px) que quedaba, la tabla se apretaba y había que **zoom-out** para verla. Ahora `cco-theme.css` (embebido) **elimina el modo 2 columnas**: el `.layout` es `display:block` (formulario arriba, tabla abajo **siempre**), la tabla usa **todo el ancho** (`min-width:0; width:100%`), con celdas/fechas compactas (fecha y hora en dos líneas). Verificado en Chromium: a **960px y 1100px** la tabla entra completa (scroll = 0), con todas las columnas (CÓDIGO…F. ESTADO) visibles a 100% de zoom. Build OK. |
| 1.14.5 | 2026-07-09 | **Traspasos: la tabla ya no se corta (todas las columnas visibles)**. Aun a todo el ancho, en 2 columnas (formulario 370px + tabla) la tabla de Registros (min-width 940px) no cabía y su scroll interno **cortaba la columna CÓDIGO**. Ahora `cco-theme.css` (embebido) **apila** el layout (`grid-template-columns: 1fr`: formulario arriba, tabla abajo a todo el ancho) por defecto, así la tabla tiene el ancho completo y **entran las 10+ columnas sin scroll ni corte**; solo vuelve a 2 columnas en pantallas **≥1400px** (donde el `1fr` ya supera el ancho mínimo de la tabla). Verificado en Chromium (1200px): overflow de página = 0 **y** scroll de tabla = 0, con CÓDIGO/DESCRIPCIÓN/…/F. ESTADO todas visibles. Build OK. |
| 1.14.4 | 2026-07-09 | **Traspasos: a todo el ancho, sin marco y sin scroll horizontal de página**. El iframe estaba dentro de una tarjeta con borde ("cuadrado") y la tabla de Registros (min-width 940px) desbordaba el `1fr` del grid de em-il provocando **scroll lateral de toda la página**. Fixes: (1) `src/pages/Tools/Traspasos.jsx` quita el marco del iframe (sin borde/redondeo/sombra) y lo deja **full-bleed**; la cabecera queda con margen. (2) `cco-theme.css` (embebido): `.layout` a `370px minmax(0,1fr)` en desktop → la columna derecha se encoge y la tabla scrollea dentro de su propio `.table-wrap` (ya `overflow-x:auto`), no la página; `max-width:none`, padding ajustado y `overflow-x:hidden` de seguridad. Verificado en Chromium: overflow horizontal de página = 0. Build OK. |
| 1.14.3 | 2026-07-09 | **Conteo Cíclico (escritorio): pestaña "Contar" para registrar el conteo dentro de CCO**. Faltaba la pantalla de captura en el módulo de escritorio (solo estaba en el PDA), así que no se podía contar desde la web. Se agrega la pestaña **Contar** (primera y por defecto) en `ConteoCiclico.jsx`, fiel a la app original: selector de **sesión abierta** (+ Nueva), **Ubicación**, **Producto (SKU)** con búsqueda de lotes/series del stock de CCO (chips tocables), **Partida/Talla** + **Serie**, **Cantidad contada** con stepper **− / +** y feedback en vivo (cuadrado/faltan/sobran vs esperado), **Observaciones**, y **Limpiar / Registrar conteo**, más la lista de últimos conteos con borrar. Usa `registrar_conteo` (snapshot de stock server-side). Verificado con test de render runtime (5º caso). Tests 50/50 y build OK. |
| 1.14.2 | 2026-07-09 | **Traspasos embebido: fuerza el tema CLARO de CCO (no desentona)**. El contenido del iframe se veía **oscuro** dentro de CCO (la app em-il tomaba el tema guardado/sistema), rompiendo la estética clara de CCO. Ahora, embebido (`window.self !== window.top`), un inline script en el `<head>` fija `data-theme="light"` **antes de pintar** (sin flash) y marca `html.cco-embedded`; `cco-theme.css` además fuerza la paleta clara para `html.cco-embedded` como red de seguridad. Abierto en pestaña propia ("Abrir") conserva su toggle de tema. El update script re-inyecta el inline script. Verificado en Chromium: con tema **oscuro guardado**, el iframe embebido renderiza **claro**. Build OK. |
| 1.14.1 | 2026-07-09 | **Proyección de palletizado idéntica a la app original** (Conteo Cíclico). La pestaña Proyección se reescribe como **port fiel** de `t-o-inventario`: mismos campos (Cant. OC, **Cajas (manual)**, Unid. x caja, **Pie del pallet**, **Altura (pisos)**) en tarjetas editables con **autoguardado** (debounce) compartidas entre usuarios; cálculo correcto **Cajas x pallet = pie × altura** (antes usaba solo el pie), Cajas (auto o manual con badge), Unid. reales, `1,85 pallets → 2 pallets`, y la **recomendación** de reparto: **Parejo** (`2 pallets de 50 cajas`) + **Llenado máximo** (`1 de 54 y el último con 46`), más el texto de ayuda 💡. KPIs de totales (cajas, pallets exactos/completos) y export XLSX. Verificado con el ejemplo de la planilla (OC 10.000, 100 cajas, 9×6 → 54 cajas/pallet, 1,85→2). Build OK, tests 49/49. |
| 1.14.0 | 2026-07-09 | **Módulo Conteo Cíclico de Inventario — port nativo de `lockowom/t-o-inventario` a CCO (Supabase), reusando el stock existente**. El otro proyecto (app de conteo cíclico en Turso/Hono/auth propio) se **reescribe como módulo nativo** de CCO en vez de duplicar datos: el PDA móvil deja de mostrar "CONTEO CÍCLICO → Próximamente" y ahora cuenta de verdad. **BD (migraciones `042`+`043`)**: tablas `tms_conteo_sesiones`, `tms_conteos`, `tms_conteo_bloques`(+`_items`), `tms_conteo_auditorias`(+`_items`), `tms_conteo_proyecciones`, `tms_conteo_costos`; el stock "de sistema" (snapshot `cantidad_sistema` y conciliación) sale de `tms_partidas`/`tms_series` vía `conteo_stock_sistema` (prioridad serie>partida>SKU) → estado CUADRADO/FALTA/SOBRA/SIN_STOCK. Escrituras por RPCs SECURITY DEFINER gateadas por permisos nuevos `view_conteo`/`manage_conteo`/`supervise_conteo` (regla: contador edita solo lo propio en sesión abierta; supervisor/admin, todo); reportes `conteo_conciliacion` y `conteo_ajuste_erp` (valorizados con `tms_conteo_costos`). **Frontend**: `src/services/conteoService.js` (hooks); **PDA** `src/pages/Mobile/ConteoPDA.jsx` (elegir/crear sesión, contar por SKU con lote/serie, validación en vivo, últimos conteos) enganchado al botón del `WarehousePDA`; **escritorio** `src/pages/Inventory/ConteoCiclico.jsx` (tabs Sesiones, Conciliación, Ajuste ERP con export XLSX, Bloques + **QR** generado con `qrcode`, auditoría, Proyección de palletizado) + `BloqueDetalle.jsx` (destino del QR `/inventory/bloque/:codigo`). Rutas en `App.jsx`, permiso por ruta, menú **Inventario → Conteo Cíclico** (`Navbar.jsx`), catálogo de permisos y rutas en `modules.js`. Dep nueva: `qrcode`. Flujos verificados en BD (conteo con snapshot=150→FALTA; conciliación/ajuste con impacto valorizado; bloque `BLQ-` + auditoría) y con **tests de render runtime** (`src/tests/conteo.test.jsx`) que montan `ConteoCiclico` (escritorio) y `ConteoPDA` (móvil) contra Supabase mockeado con forma de CCO. Tests 49/49 y build OK. |
| 1.13.5 | 2026-07-09 | **IA de correo (Traspasos) sin pedir clave: proxy same-origin con la clave en el servidor**. Para que el asistente "✨ Mejorar con IA" funcione sin que el usuario pegue su clave —y **sin exponerla** en el navegador ni en el repo— se añade el endpoint **`POST /api/traspasos-ai`** en `server.js`: reenvía la petición a `api.anthropic.com` inyectando la clave desde la env var **`ANTHROPIC_API_KEY`** (solo servidor), y **valida el token de sesión de Supabase** del llamador (`/auth/v1/user`) para que la clave no pueda usarse anónimamente (503 si falta la env var, 401 sin sesión válida). `cco-bridge.js` intercepta la llamada del app a Anthropic y la **redirige al proxy same-origin** (con el token CCO), y siembra un valor placeholder en `anthropic_key` para que la app no muestre el modal de clave. El CSP vuelve a **no** incluir `api.anthropic.com` (el navegador ya no lo llama directo; todo pasa por el proxy). **Único paso manual**: definir `ANTHROPIC_API_KEY` en Render (Environment). Verificado los guards del proxy (503 sin env var, 401 sin token y con token inválido). Build OK. |
| 1.13.4 | 2026-07-09 | **Traspasos: cabecera limpia (sin botones de acción) + IA de correo habilitada en CSP**. Se quitan los botones Sincronizar/Catálogo/Exportar/Importar de la cabecera del módulo (`src/pages/Tools/Traspasos.jsx`): la cabecera queda con el título y "Abrir en pestaña". Para **no perder** esas acciones, el topbar propio de em-il ahora se oculta **sólo cuando va embebido** en CCO (clase `cco-embedded` que añade `cco-bridge.js` si `window.self !== window.top`); abierto en pestaña independiente ("Abrir"), el topbar completo (Sincronizar, Catálogo, Exportar, Importar, tema) se conserva. **IA de correo**: la app trae un asistente **"✨ Mejorar con IA"** (dentro del modal de correo, junto a "Generar correo") que llama a `api.anthropic.com` (Claude Opus 4.8) con la clave Anthropic del usuario guardada en su navegador; se conserva intacto, pero embebido lo bloqueaba el CSP — se añade `https://api.anthropic.com` a `connect-src` en `server.js` para habilitarlo. Verificado en Chromium: embebido oculta el topbar y no muestra botones; en pestaña el topbar se conserva. Tests 45/45 y build OK. |
| 1.13.3 | 2026-07-09 | **Traspasos: acciones movidas a la cabecera naranja y topbar del iframe eliminado**. Las acciones del módulo (**Sincronizar, Catálogo, Exportar, Importar**) ahora viven como botones en la cabecera de módulo CCO (`src/pages/Tools/Traspasos.jsx`), junto a "Abrir en pestaña"; cada botón **proxea el click** al botón interno del iframe por `id` vía `iframe.contentWindow.document` (mismo origen), y se deshabilitan mientras el iframe carga. `cco-theme.css` ahora **oculta por completo el `.topbar`** de em-il (antes solo su branding) y ajusta el padding superior del contenido. Resultado: una sola cabecera, sin barra duplicada — idéntico al patrón de los demás módulos. Verificado renderizando el conjunto (cabecera + iframe) en Chromium y probando el proxy (el botón "Catálogo" abre el modal dentro del iframe). Tests 45/45 y build OK. |
| 1.13.2 | 2026-07-09 | **Traspasos/Ajustes integrado como un módulo nativo de CCO (interfaz mejorada)**. Para que se vea como el resto de módulos, el marco React `src/pages/Tools/Traspasos.jsx` ahora usa la **cabecera de módulo estándar de CCO** (tarjeta blanca `rounded-2xl` con barra de acento **naranja**, tile de icono `ArrowLeftRight` naranja, título `Registro de `**`Traspasos`** en `text-3xl font-black` + subtítulo y botón "Abrir en pestaña"), y el iframe queda enmarcado en un **lienzo/panel** redondeado sobre `bg-slate-50` como los demás módulos (loader naranja). Se cambia el acento **índigo → naranja** del wrapper. Para no duplicar el título, `cco-theme.css` **oculta el branding propio de la app** (logo + "Registro de Traspasos" + subtítulo) del topbar de em-il y lo convierte en una **barra de acciones** limpia y alineada a la derecha (tema, Sync, Catálogo, Exportar, Importar); las pestañas Traspasos/Ajustes quedan como sub-navegación del módulo. Verificado renderizando el build en Chromium. Tests 45/45 y build OK. |
| 1.13.1 | 2026-07-09 | **Rediseño del módulo Traspasos/Ajustes con la identidad de CCO (minimalista)**. La app em-il traía un tema índigo/violeta/rosa con fondo 3D de partículas; ahora luce como CCO **sin editar `styles.css`** (para no romper `npm run update:traspasos`). Nuevo `public/traspasos/cco-theme.css` (archivo propio de CCO, re-inyectado en el `<head>` por el update script tras `styles.css`) **re-mapea las variables de diseño** de la app a la marca CCO: acento **naranja `#f97316`** (una sola familia de color, sin arcoíris), superficies claras (`#fff`/slate) y oscuras (paleta void/base `#07080a`), verde `#10b981`, ámbar y rojo; tipografía Inter/Poppins con fallback de sistema (el CSP de la página es `font-src 'self'`, sin fuentes web); tarjetas glass más limpias, logo/pestaña activa en naranja, píldoras de estado PENDIENTE/REVISAR/ENVIADO en ámbar/azul/verde. **Minimalista**: se oculta el fondo 3D Three.js (`#bg`) y el modo inmersivo, conservando las micro-animaciones de UI (fade/hover) coherentes con CCO. `scripts/update_traspasos.mjs` re-inyecta el `<link>` del tema en cada re-sync. Verificado renderizando el build en Chromium (claro y oscuro). Build OK. |
| 1.13.0 | 2026-07-09 | **Módulo Inventario → Traspasos/Ajustes conectado a Supabase (historial + catálogo maestro), sin perder el historial local**. La app em-il guardaba todo en `localStorage` y sincronizaba contra Firestore; ahora persiste en Supabase **sin editar `app.js`** (para no romper la actualización con `npm run update:traspasos`). **BD (migración `041`)**: `tms_emil_sync` (historial compartido, blob `{traspasos,ajustes}` por `space`) y `tms_emil_catalogo` (catálogo maestro de los **12.514 SKUs**, sembrado desde el catálogo estático la 1ª vez), ambas con RLS `authenticated`. **Puente (`public/traspasos/cco-bridge.js`, archivo propio de CCO re-inyectado en `index.html` por el update script)**: siembra un `sync_cfg` para habilitar el sync de la app, redirige `syncDocUrl()` a una URL centinela e **intercepta `window.fetch`** traduciendo el documento con forma Firestore (`{fields:{rev,data}}`) a REST de Supabase; conserva intacta toda la lógica de la app (persistencia, migraciones, `render`, badge). Autentica con el `access_token` de la sesión CCO (el iframe es same-origin → comparte `localStorage`) + anon key pública; el CSP ya permitía `*.supabase.co` en `connect-src`. **Migración de datos no destructiva**: en el 1er arranque, como la nube está vacía (404), la app **sube** el historial local existente; en otros dispositivos **baja** el de la nube. `scripts/update_traspasos.mjs` re-inyecta el `<script>` del puente tras cada re-sync. RLS `authenticated` verificado en BD (INSERT/UPSERT en ambas tablas). Tests y build OK. |
| 1.12.0 | 2026-07-09 | **Integración del módulo Traspasos/Ajustes (`lockowom/em-il`)**. App estática "Registro de Traspasos · Email" (registra traspasos y genera el correo; catálogo de SKUs, estados PENDIENTE/REVISAR/ENVIADO, export/import JSON, fondo 3D Three.js) **vendorizada en `public/traspasos/`** (Vite la copia a `dist/traspasos/`, express la sirve) y **embebida vía iframe** en una ruta React (`/tools/traspasos`, `src/pages/Tools/Traspasos.jsx`) para conservar el navbar/framework de CCO. Enlace en el menú **Operaciones WMS → Traspasos** (`Navbar.jsx`), permiso por ruta (`manage_inventory`/`view_stock`/`view_batches`/`view_reception`). **server.js**: `X-Frame-Options` pasa de `DENY` a `SAMEORIGIN` (permite enmarcar páginas propias; sigue bloqueando enmarcado externo). **PWA**: `/traspasos` excluido del precache (`globIgnores`) y del fallback SPA (`navigateFallbackDenylist`). **Actualizable**: `npm run update:traspasos` (`scripts/update_traspasos.mjs`) re-sincroniza desde el repo fuente + `SOURCE_COMMIT.txt`. Verificado sirviendo el build: `/traspasos/index.html` 200 con la app correcta, assets relativos 200, header SAMEORIGIN. Tests 45/45 y build OK. |
| 1.11.2 | 2026-07-09 | **FIX menú**: el `Navbar` arma el menú desde una lista hardcodeada (no desde `modules.js`), así que las rutas nuevas no aparecían. Se agregan al menú **Mi Bandeja**, **Acciones de Calidad** (sección Calidad) y **Bodegas Softland** (Configuración). El render ya filtra por permiso. |
| 1.11.1 | 2026-07-09 | **FIX Mi Bandeja**: un supervisor/admin sin área asignada veía la bandeja vacía; ahora ve todo por defecto (un rol de área sigue viendo solo lo suyo). |
| 1.11.0 | 2026-07-09 | **"Mi Bandeja" por área + Trazabilidad del producto**. Cada área (Bodega/Inventario, Ventas/Post-venta, etc.) tiene su **menú propio** con sus tareas pendientes (traspaso, baja, reparación, revisión…), auto-filtrado a su área; Calidad/Gerencia/Admin pueden ver todas. Al abrir una tarea se ve la **trazabilidad del producto**: una **línea de tiempo** por todo el proceso (Recepción/checklist → Estancia/dictamen con bodega destino → Acción → Salida) más el **estado de calidad vigente**. **BD (migración `040`)**: RPC `trazabilidad_producto(codigo, partida, ubicacion)` que une recepción, dictámenes de monitoreo, acciones y salida + `tms_calidad_flags`. **Frontend**: nueva página/menú **Calidad → Mi Bandeja** (`src/pages/Quality/MiBandeja.jsx`, ruta `/quality/bandeja`, permiso `view_acciones_calidad`) con filtros Pendientes/Todas y toggle "ver todas las áreas"; componente reutilizable `TrazabilidadModal` (línea de tiempo) también agregado al tablero de Acciones. Hook `useTrazabilidadProducto`. Trazabilidad verificada en BD (SKU con dictamen CUARENTENA + estado vigente). Tests 45/45 y build OK. |
| 1.10.3 | 2026-07-08 | **Alineación de plugins a Capacitor 8** (pre-requisito para la build nativa vía Capgo Builder). El core era Capacitor 8 pero tres plugins estaban en 7 — lo que Capgo marcaba como "paquetes bloqueantes" en el OTA: se suben `@capacitor/haptics` 7→**8.0.2**, `@capacitor/push-notifications` 7→**8.1.1** y `@capgo/capacitor-updater` 7→**8.50.2** (barcode-scanning ya estaba en 8). Usos en código son API estándar (Haptics.impact, PushNotifications.register/createChannel, CapacitorUpdater.notifyAppReady/set/reload) → sin cambios de código. `npx cap sync android` OK (4 plugins v8; los `*.gradle` referencian por ruta a node_modules, así que Capgo Builder compila con v8 desde package.json). Tras la build nativa e instalarla, OTA y nativo quedan alineados y desaparece el aviso. Tests 45/45 y build OK. |
| 1.10.2 | 2026-07-08 | Release de verificación del pipeline Capgo (primer OTA automático real subido al canal `production`). |
| 1.10.1 | 2026-07-08 | **CI: subida automática de OTA a Capgo** (`.github/workflows/capgo-ota.yml`). En cada push a `main`, si **cambia la versión** de `package.json`, GitHub Actions compila el `dist/` (con las claves públicas de Supabase embebidas) y sube el bundle a **Capgo** (`com.cco.wms`, canal `production`, `--bundle <versión>`) — así la app Android con `autoUpdate` recibe la actualización sin pasar por Play. Se salta si la versión no cambió (Capgo rechaza duplicados) y avisa/omite si falta el secreto. **Único requisito manual**: agregar el secreto de repositorio **`CAPGO_TOKEN`** (Settings → Secrets → Actions). No requiere Android SDK en CI (el OTA es el build web). |
| 1.10.0 | 2026-07-08 | **El destino del dictamen usa las bodegas de Softland (código+estado del ERP) + pantalla de administración**. Antes la "bodega destino" del dictamen era un catálogo fijo (BD 5 / BD 99); ahora usa las **bodegas reales de Softland** para cuadrar y filtrar los movimientos con el ERP. **BD (migración `039`)**: `tms_bodegas_softland` (código, nombre, estado DISPONIBLE/TRANSITORIO, `es_destino_dictamen`, activo, orden) sembrada con los códigos visibles (21,22,24,5,3,99,7); RPCs admin `guardar_bodega_softland`/`eliminar_bodega_softland`; columna `bodega_destino` en `tms_calidad_acciones` (snapshot del ítem dictaminado, para filtrar el tablero por bodega). **Frontend**: el select "Bodega destino (Softland)" del dictamen (`Monitoreo.jsx`) se alimenta del catálogo (`useBodegasDestino`); nueva **pantalla de administración** `Admin → Bodegas Softland` (`src/pages/Admin/BodegasSoftland.jsx`, ruta `/admin/bodegas-softland`, gate `manage_locations`) para crear/editar/eliminar bodegas; el tablero de Acciones muestra la bodega destino. CRUD admin verificado en BD. Tests 45/45 y build OK. |
| 1.9.0 | 2026-07-08 | **Acciones de Calidad — la acción recomendada del dictamen queda promulgada como tarea visible por las áreas**. Antes el dictamen solo dejaba estado/flag + notificación a ADMIN; ahora, al dictaminar, Calidad elige la **acción recomendada** (Ajuste, Baja, Transitorio, Reacondicionar, Post-venta, Reparación/servicio técnico, **Opinión experta**) y el **área responsable**, y eso crea una **tarea rastreable** en un **tablero compartido**. **BD (migración `038`)**: `tms_areas_calidad` (áreas→roles), `tms_calidad_acciones` (folio `ACC-AAAA-NNNN`, tipo, área, prioridad, estado PENDIENTE/EN_PROCESO/RESUELTA/ANULADA, resolución/acuse) en realtime, permiso nuevo `view_acciones_calidad` otorgado a los roles de área (Calidad, Bodega, Ventas, Gerencia, Administración), y RPCs `crear_accion_calidad`, `resolver_accion_calidad` (**la cierra el área responsable** o admin, exige acuse) y `anular_accion_calidad`. **Frontend**: nueva página/menú **Calidad → Acciones** (`src/pages/Quality/AccionesCalidad.jsx`, ruta `/quality/acciones`) — tablero con filtros Pendientes/Mi área/Todas; cada área ve todo (transparencia) pero solo resuelve lo suyo, con acuse; realtime + prioridad urgente. El **dictamen** en `Monitoreo.jsx` suma Acción recomendada + Área + Prioridad + Instrucción y promulga la acción al dictaminar. Flujo crear→resolver verificado en BD (`ACC-2026-0001`). Tests 45/45 y build OK. |
| 1.8.3 | 2026-07-08 | **FIX ortografía: "Instancia" → "Estancia"** en el hito 2 (pestaña, subtítulo, encabezados y avisos). Solo frontend. |
| 1.8.2 | 2026-07-08 | **Hito 3: se elimina la opción "Desde despacho"** (no se usará). La certificación de salida se crea solo con **"Certificar salida (N.V. + SKU)"** (manual). Se quita el `DespachoModal` y los hooks/imports que solo él usaba (`useCrearTareaSalida`, `buscarDespachos`) de `SalidaCertificacion.jsx`. Solo frontend. Build OK. |
| 1.8.1 | 2026-07-08 | **El botón "Asignar SKUs a Calidad" (hito 2) queda solo para ADMIN**. Antes lo veían Inventario/Calidad (`manage_inventory`/`canCreate`); ahora `canAssign = isAdmin` (`rol==='ADMIN'` o `es_admin_delegado`) en `Monitoreo.jsx` — solo el admin alimenta el hito 2. Solo frontend. Build OK. |
| 1.8.0 | 2026-07-08 | **ADMIN puede eliminar tareas de Calidad en los 3 hitos** (limpieza de pruebas vs. reales). **BD (migración `037`)**: `_calidad_assert_admin()` + RPCs `eliminar_tarea_calidad(uuid)` (hito 1 CheckList de ingreso / hito 3 Certificado de salida, en `tms_calidad_tareas`) y `eliminar_asignacion_calidad(uuid)` (hito 2, en `tms_calidad_asignaciones`), **gateadas a ADMIN / admin delegado** (SECURITY DEFINER; no ejecutables por anon). **Frontend**: botón de **papelera visible solo para admin** (`user.rol==='ADMIN' || es_admin_delegado`) en las tarjetas de las colas de los 3 hitos (`ChecklistIngreso.jsx`, `AsignacionesCalidad.jsx`, `SalidaCertificacion.jsx`), con confirmación. Hooks `useEliminarTareaCalidad`/`useEliminarAsignacionCalidad`. Verificado en BD (admin borra; el gate rechaza a no-admin). Tests 45/45 y build OK. |
| 1.7.3 | 2026-07-08 | **FIX: las certificaciones de salida aparecían también en la cola de Recepción (hito 1)**. `useTareasChecklist` consultaba `tms_calidad_tareas` sin filtrar por `tipo`, así que las tareas `CERTIFICADO_SALIDA` (hito 3) también salían en el CheckList de Ingreso y en su badge. Se agrega `.eq('tipo','CHECKLIST_INGRESO')` → cada hito muestra solo sus tareas. Solo frontend. Tests 45/45 y build OK. |
| 1.7.2 | 2026-07-08 | **Hito 3 — creación MANUAL del certificado de salida (N.V. a mano + SKU)**. El selector de despacho (desde `tms_control_despacho`) era rígido; ahora se puede **crear la certificación de salida escribiendo la N.V.** (y cliente/guía/transportista/bultos opcionales) y **agregando los SKUs** con el buscador de stock (por código, descripción o ubicación). **BD (migración `036`)**: RPC `crear_tarea_salida_manual(p_nv, p_skus, …)` (gate Calidad; N.V. obligatoria; SKUs en `contexto.skus`). **Frontend**: nuevo modal "Certificar manual (N.V. + SKU)" en `SalidaCertificacion.jsx` (se mantiene "Desde despacho"); el formulario y el certificado (PDF/Word) muestran la **tabla de SKUs del despacho**. Flujo verificado en BD (NV manual + SKU + cliente/guía). Tests 45/45 y build OK. |
| 1.7.1 | 2026-07-08 | **FIX buscador de stock por UBICACIÓN**. `monitoreo_candidatos` (RPC que alimenta el buscador de SKUs al **asignar a Calidad** en el hito 2 y al armar informes de Monitoreo) solo emparejaba por **código** o **descripción**, así que buscar por una **ubicación** (p. ej. "D-01-01") no devolvía nada y no se veían los SKUs de esa ubicación. Migración `035`: se agrega `u.ubicacion ILIKE q.term` al criterio. Verificado: "D-01-01" ahora devuelve 19 SKUs; "D-01" devuelve 52. Solo BD. |
| 1.7.0 | 2026-07-08 | **Hito 3 — Certificado de Conformidad de Salida (previo al despacho)**. Cierra los 3 hitos del proceso de Calidad. **BD (migración `034_calidad_certificado_salida`, en live)**: reutiliza `tms_calidad_tareas` con `tipo='CERTIFICADO_SALIDA'` (se relaja `recepcion_id` a nullable; se agregan `despacho_id` y `contexto` jsonb con cliente/NV/guía/factura/transportista). `guardar_checklist_ingreso` ahora es **tipo-aware** en el folio: salida emite **`CERT-SAL-AAAA-NNNN`** (CONFORME) / **`ACTA-SAL-AAAA-NNNN`** (NO CONFORME); ingreso sigue `CERT-`/`ACTA-`. RPC `crear_tarea_salida(p_despacho_id)` crea la tarea a partir de un despacho de `tms_control_despacho` (**disparo manual** — la tabla de despachos es histórica y masiva, 4K filas; un trigger inundaría — con guarda anti-duplicado). **Frontend**: nuevo `src/pages/Quality/SalidaCertificacion.jsx` (cola del hito 3 + modal de selección de despacho por NV/cliente/guía + checklist de salida `CHECKLIST_SALIDA_NIVELES`: documentación de salida + verificación física de la carga; disposiciones de salida "Retener/no despachar", etc.). Certificación automática por respuestas (CONFORME→certificado; NO CONFORME→acta + alerta "no despachar"), **firmable (HMAC + QR)** y **descargable (PDF/Word)** reusando toda la infraestructura del certificado. `exportChecklistIngreso.js` es tipo-aware (título "Certificado de Conformidad de Salida", etiquetas Cliente/NV/Guía/Factura/Transportista, código documental **FO-CAL-004**). El hito 3 del módulo deja de ser placeholder. Flujo crear→certificar verificado en BD (folio `CERT-SAL-2026-0001`) y generación PDF revalidada en Node. Tests 45/45 y build OK. |
| 1.6.0 | 2026-07-08 | **Rediseño del módulo de Calidad por los 3 HITOS del proceso (en orden) + Hito 2 "Instancia" (Inventario asigna SKUs a Calidad)**. El módulo (`src/pages/Quality/Monitoreo.jsx`) pasa de las pestañas "Informes/CheckList" a **3 hitos ordenados**: **Hito 1 — Recepción** (CheckList de ingreso, con su badge de pendientes), **Hito 2 — Instancia** (producto en almacenamiento) y **Hito 3 — Salida** (Certificado de Conformidad de despacho, *placeholder* "en preparación"). **Hito 2 (nuevo flujo, migración `033_calidad_asignaciones_instancia`, en live)**: el **analista de Inventario** asigna a Calidad uno o varios **SKUs** para revisión → cae en la **cola de tareas pendientes del hito 2** (badge + realtime + notificación). **BD**: `tms_calidad_asignaciones` (SKUs en jsonb, estado PENDIENTE/EN_PROCESO/RESUELTA/ANULADA, prioridad, enlace `informe_id`), RPCs `crear_asignacion_calidad` (gate `manage_inventory`/Calidad/admin), `resolver_asignacion_calidad` y `anular_asignacion_calidad`. **Frontend**: nuevo `src/pages/Quality/AsignacionesCalidad.jsx` (panel de asignaciones + modal de selección de SKUs por búsqueda de stock); al **generar el informe/dictamen** desde una asignación, `InformeBuilder` se **pre-carga con los SKUs** y al guardar **resuelve la asignación** enlazando el informe (reusa todo el flujo de Monitoreo/dictamen). La ruta `/quality/monitoreo` ahora admite `manage_inventory` (Inventario entra a asignar; crear informes sigue gateado por `manage_monitoreo`/`manage_quality`). Hooks en `calidadService.js` (`useAsignacionesCalidad`, `useCrearAsignacion`, `useResolverAsignacion`, `useAnularAsignacion`). Flujo crear→resolver verificado end-to-end en BD (rollback test). Tests 45/45 y build OK. |
| 1.5.0 | 2026-07-08 | **CheckList de Ingreso por FAMILIA de producto (criterios de aceptación segmentados) — ISO 13485 §7.4.3 + marco ISP chileno**. El catálogo de PTM abarca familias con riesgo y control legal muy distintos (equipo médico activo, insumo estéril, mobiliario clínico, ayuda técnica/ortopedia, y líneas **no sanitarias**: bienestar **MAXX** y empaque **Farmapack**), por lo que un checklist único no cumplía ISO. **BD (migración `032_categorias_producto_calidad`, en live)**: `clasificar_producto` (clasificador por palabras clave, IMMUTABLE), tabla `tms_categorias_calidad` (metadatos + **criterios de aceptación por familia** + flags `es_dispositivo_medico`/`requiere_registro_isp`/`clase_riesgo`), columna `categoria` en `tms_recepcion_items(_nacionales)` (backfill de los 191 productos + trigger `BEFORE INSERT`; **0 sin clasificar**), RPC `calidad_categorias_tarea` (familias presentes en la recepción + agregados) y `set_categoria_producto` + `tms_producto_categoria` (**override manual persistente** con re-etiquetado). **Frontend**: el CheckList carga las familias de la recepción (`useCategoriasTarea`) y añade **una sección de criterios específicos por cada familia** detectada, además de los universales (documental + físico); banner de **familias detectadas** con clase de riesgo, aviso de **control obligatorio ISP** (jeringas/agujas/guantes/preservativos) y disclaimer de **producto no sanitario**; la certificación exige responder **todos** los ítems (universales + por familia). El **certificado/acta** (PDF y Word) muestra las familias y, si es solo no sanitario, se emite como conformidad de recepción **sin** certificación de dispositivo médico. Doc regulatorio nuevo `MATRIZ_CATEGORIAS_CALIDAD.md` (para validar con Asuntos Regulatorios). Filas basura de importación marcadas `BASURA` y excluidas (no destructivo). Generación de PDF revalidada en Node (`%PDF` OK). Tests 45/45 y build OK. |
| 1.4.72 | 2026-07-08 | **Correcciones de correctitud del acta de CheckList (feedback de auditoría ISO)**. **(1) Fecha UTC → local**: el default de `fecha_recepcion` usaba `new Date().toISOString()` (UTC) → en la tarde en Chile daba "mañana" y el acta certificaba antes de que llegara la mercancía. Ahora usa fecha **local** (`toLocaleDateString('en-CA')`) en `Reception.jsx` y `ReceptionNacional.jsx`. **(2) Folio para NO CONFORME** (migración `031`): antes solo CONFORME tenía folio → sin trazabilidad; ahora NO CONFORME emite `ACTA-AAAA-NNNN` (CONFORME sigue `CERT-`). **(3) Disposición / Acción a tomar** (columna `disposicion`): campo **obligatorio al finalizar NO CONFORME** (Rechazar y devolver / Cuarentena / Aceptar con salvedades / Reproceso / NC al proveedor), mostrado en el acta (PDF y Word). **(4) Justificación de N/A**: ahora se puede escribir una **nota** en los ítems marcados N/A (antes solo en NO) — recomendada para auditoría. **(5) Glifos ✓/✗**: se veían como ☐ en el PDF (la fuente Roboto no los tiene) → se reemplazan por texto ("CERTIFICADO DE CONFORMIDAD — CONFORME" / "RECEPCIÓN NO CONFORME"). **Nota:** las contradicciones lógicas entre ítems (p. ej. marcar "packing ilegible" y a la vez "cantidad coincide") son criterio del analista; el software provee los campos y permite justificar, pero no fuerza la coherencia. Tests 45/45 y build OK. |
| 1.4.71 | 2026-07-08 | **FIX (PDF no generaba + cola de checklist no refrescaba)**. **(1) PDF**: el logo PNG estaba **corrupto** (el base64 pegado en el chat llegó dañado — chunk IDAT con CRC inválido, no descomprime), lo que hacía **lanzar excepción a pdfmake** (`Z_DATA_ERROR: incorrect data check`) y también malformaba el Word. Diagnosticado reproduciendo la generación en Node. Se **desactiva el logo** (`DOC_CONTROL.logo = null` en `docIso.js`) → el encabezado degrada a solo texto (razón social) y **PDF y Word vuelven a generar** (verificado en Node: `%PDF` OK). Falta re-subir el logo como **archivo** (no base64 pegado) para incrustar uno válido. **(2) Cola de CheckList**: se hace el refresco **robusto** — `useTareasChecklist` con `refetchOnWindowFocus:true` + `refetchInterval:20s` (respaldo si realtime no entrega) además del realtime y `refetchOnMount`; y **botón "Actualizar"** manual en la cola. Tests 45/45 y build OK. |
| 1.4.70 | 2026-07-07 | **FIX (Word corrupto — "contenido no legible")**: el logo del encabezado en los documentos Word (docx) faltaba el campo `type` requerido por `docx@9` en `ImageRun` → el `.docx` salía malformado y Word pedía "recuperar contenido". Se agregó `type: 'png'` en `src/lib/docIso.js`. Verificado generando un `.docx` real (zip válido con `word/document.xml` + media). Afecta a los tres informes (CheckList/Monitoreo/Daños). Solo frontend. Tests 45/45 y build OK. |
| 1.4.69 | 2026-07-07 | **FIRMA ELECTRÓNICA del Certificado/Acta + verificación por QR**. **BD (migración `030_firma_certificado_calidad`, en live)**: firma **HMAC-SHA256** server-side — llave secreta en esquema `private` (nunca sale del servidor), RPC `firmar_certificado` (SECURITY DEFINER, permiso Calidad; firma el mensaje canónico que incluye un hash del checklist → tamper-evident) y `verificar_certificado` (público, para el QR; recomputa y compara, no expone la llave). Columnas de firma en `tms_calidad_tareas`. Verificado end-to-end (firma válida; alterar el checklist invalida la firma; re-firma bloqueada). **Frontend**: botón **"Firmar digitalmente"** en la tarea finalizada + estado de firma; el Certificado (PDF) muestra el bloque de **firma electrónica + QR** que apunta a `/verificar?folio=…`; nueva **página pública `/verificar`** (`src/pages/VerificarCertificado.jsx`) que muestra válido/inválido + datos. Hooks `useFirmarCertificado`/`verificarCertificado`. **Nota:** es una firma criptográfica interna (autenticidad + integridad) para el proceso ISO; una firma con **certificado acreditado (PAdES/FEA)** sigue en backlog (requiere el `.p12`/proveedor del usuario). Tests 45/45 y build OK. |
| 1.4.68 | 2026-07-07 | **Formato ISO 13485 + logo extendido a los informes de Monitoreo y Daños**. Se extrae el control documental a un helper compartido `src/lib/docIso.js` (encabezado con logo + razón social + código/revisión/norma, y pie `Código · Rev · Norma · Documento controlado · Página X de Y`, para PDF y Word). Los tres exportadores lo usan: `exportChecklistIngreso.js` (código `FO-CAL-001`), `exportInformeMonitoreo.js` (`FO-CAL-002`) y `exportInformeDanos.js` (`FO-CAL-003`). Solo frontend. Tests 45/45 y build OK. |
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
