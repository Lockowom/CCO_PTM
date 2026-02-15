# 🎨 DIAGRAMA VISUAL COMPLETO - FLUJO WMS + TMS

## 📋 VISTA GENERAL DEL SISTEMA

```mermaid
graph TB
    subgraph "🏢 SISTEMA INTEGRADO WMS + TMS"
        subgraph "📦 MÓDULO WMS - GESTIÓN DE ALMACÉN"
            WMS1[📥 Recepción<br/>Reception.gs]
            WMS2[📊 Inventario<br/>Inventory.gs]
            WMS3[🏷️ Lotes/Series<br/>LotesSeries.gs]
            WMS4[🎯 Picking<br/>PickingEnhanced.gs]
            WMS5[📦 Packing<br/>PackingEnhanced.gs]
            WMS6[� Despacho<br/>Dispatch.gs]
        end
        
        subgraph "� NÚCLEO DEL SISTEMA"
            CORE[📊 Core System<br/>Code.gs]
            AUTH[🔐 Autenticación<br/>Auth.gs]
            ROLES[🛡️ Roles<br/>Roles.gs]
            API[🔌 API Layer<br/>Api.gs]
        end
        
        subgraph "🚚 MÓDULO TMS - GESTIÓN DE TRANSPORTE"
            TMS1[🗺️ Planificación<br/>TMSRoutePlanning.gs]
            TMS2[🚛 Conductores<br/>TMSDrivers.gs]
            TMS3[📍 Seguimiento<br/>TMSTracking.gs]
            TMS4[� App Móvil<br/>TMSMobileApp.gs]
            TMS5[🏗️ Torre Control<br/>TMSControlTower.gs]
            TMS6[� Clientes<br/>Customer Tracking]
        end
        
        subgraph "💾 CAPA DE DATOS"
            SHEETS[(� Google Sheets<br/>Base de Datos)]
            DRIVE[(� Google Drive<br/>Almacenamiento)]
        end
        
        subgraph "🌐 SERVICIOS EXTERNOS"
            MAPS[�️ Google Maps API]
            SMS[📱 SMS/Email APIs]
        end
    end
    
    %% Flujo WMS
    WMS1 --> WMS2
    WMS2 --> WMS3
    WMS3 --> WMS4
    WMS4 --> WMS5
    WMS5 --> WMS6
    
    %% Integración WMS-TMS
    WMS6 --> TMS1
    
    %% Flujo TMS
    TMS1 --> TMS2
    TMS2 --> TMS3
    TMS3 --> TMS4
    TMS4 --> TMS5
    TMS5 --> TMS6
    
    %% Conexiones al núcleo
    WMS1 --> CORE
    WMS2 --> CORE
    WMS3 --> CORE
    WMS4 --> CORE
    WMS5 --> CORE
    WMS6 --> CORE
    TMS1 --> CORE
    TMS2 --> CORE
    TMS3 --> CORE
    TMS4 --> CORE
    TMS5 --> CORE
    
    %% Autenticación y roles
    CORE --> AUTH
    CORE --> ROLES
    CORE --> API
    
    %% Datos
    API --> SHEETS
    API --> DRIVE
    
    %% Servicios externos
    TMS1 --> MAPS
    TMS3 --> MAPS
    TMS4 --> MAPS
    TMS5 --> SMS
    TMS6 --> SMS
    
    %% Estilos
    classDef wmsStyle fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef tmsStyle fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef coreStyle fill:#fff3e0,stroke:#e65100,stroke-width:2px
    classDef dataStyle fill:#e8f5e8,stroke:#1b5e20,stroke-width:2px
    classDef extStyle fill:#fce4ec,stroke:#880e4f,stroke-width:2px
    
    class WMS1,WMS2,WMS3,WMS4,WMS5,WMS6 wmsStyle
    class TMS1,TMS2,TMS3,TMS4,TMS5,TMS6 tmsStyle
    class CORE,AUTH,ROLES,API coreStyle
    class SHEETS,DRIVE dataStyle
    class MAPS,SMS extStyle
```

## 🔄 FLUJO OPERACIONAL DETALLADO

### FASE 1: GESTIÓN DE ALMACÉN (WMS)

#### � 1.1 RECEPCIÓN DE MERCANCÍA
```
    � LLEGADA DE MERCANCÍA
         │
         ▼
    ┌─────────────────┐
    │  � INSPECCIÓN  │ ◀── � Operario de Recepción
    │                 │
    │  ✅ Verificar   │     📄 Reception_Page.html
    │  📊 Cantidad    │     🖥️ Reception.gs
    │  🔍 Calidad     │     💾 Database.gs
    │  📄 Documentos  │
    └─────────────────┘
         │
         ▼
    ┌─────────────────┐
    │ � REGISTRO     │ ◀── 🖥️ Reception.gs
    │                 │
    │ 📝 Datos        │     ✅ Validación automática
    │ 🏷️ Etiquetas    │     📊 Actualización stock
    │ � Ubicación    │     🔄 Estados en tiempo real
    │ 📊 Inventario   │     📱 Notificaciones
    └─────────────────┘
         │
         ▼
    📦 PRODUCTO ALMACENADO
    
    📊 MÉTRICAS:
    ┌─────────────────────────────┐
    │ ⏱️ Tiempo promedio: 15 min  │
    │ ✅ Precisión: 99.2%         │
    │ 📦 Productos/día: 150       │
    │ 👥 Operarios activos: 3     │
    └─────────────────────────────┘
```

#### 📊 1.2 GESTIÓN DE INVENTARIO
```
    📦 PRODUCTOS EN ALMACÉN
         │
    ┌────┴────┬────────┬────────┬────────┐
    │         │        │        │        │
    ▼         ▼        ▼        ▼        ▼
┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐
│ 📍  │  │ 📊  │  │ 🔄  │  │ ⚠️  │  │ 📈  │
│UBIC │  │STOCK│  │MOVI │  │ALER │  │REPO │
│     │  │     │  │MIEN │  │TAS  │  │RTES │
│A-01 │  │ 150 │  │TOS  │  │MIN  │  │     │
│B-02 │  │ 75  │  │     │  │STOCK│  │📊   │
│C-03 │  │ 200 │  │ +50 │  │ ⚠️  │  │📈   │
│D-04 │  │ 300 │  │ -25 │  │ ✅  │  │📋   │
└─────┘  └─────┘  └─────┘  └─────┘  └─────┘
    │         │        │        │        │
    └────┬────┴────────┴────────┴────────┘
         ▼
    📈 DASHBOARD DE INVENTARIO
    
    🎯 FUNCIONALIDADES AVANZADAS:
    ┌─────────────────────────────┐
    │ 🤖 Reabastecimiento auto    │
    │ 📊 Análisis ABC             │
    │ 🔄 Rotación de productos    │
    │ 📱 Alertas en tiempo real   │
    │ 🎯 Optimización ubicaciones │
    └─────────────────────────────┘
```

#### 🏷️ 1.3 LOTES Y SERIES - TRAZABILIDAD COMPLETA
```
    📦 PRODUCTO CON LOTE/SERIE
         │
         ▼
    ┌─────────────────────────────┐
    │     🏷️ TRAZABILIDAD         │
    │                             │
    │  📅 Fecha: 2026-02-03      │  ◀── 🖥️ LotesSeries.gs
    │  🏷️ Lote: L20260203001     │      📄 LotesSeries_Page.html
    │  📝 Serie: S123456789      │      🎨 LotesSeries_Galaxy.html
    │  📍 Ubicación: A-01-15     │      ⚡ LotesSeries_Logic.html
    │  ⏰ Vencimiento: 2027-02   │      🎨 LotesSeries_Styles.html
    │  👤 Operario: Juan P.      │      📋 LotesSeries_Title.html
    │  🌡️ Temperatura: 20°C      │
    │  📊 Estado: ACTIVO          │
    └─────────────────────────────┘
         │
         ▼
    🔍 SEGUIMIENTO COMPLETO
    
    📊 HISTORIAL DE MOVIMIENTOS:
    ┌─────────────────────────────┐
    │ 📥 Recepción    │ 01/02/26 │ ◀── ✅ Verificado
    │ 📍 Almacenado   │ 01/02/26 │ ◀── 📍 A-01-15
    │ 🎯 Picking      │ 03/02/26 │ ◀── 👤 María G.
    │ 📦 Empaquetado  │ 03/02/26 │ ◀── 📦 Caja-001
    │ 🚚 Despachado   │ 03/02/26 │ ◀── 🚛 Ruta-05
    │ 📍 En tránsito  │ 03/02/26 │ ◀── 🗺️ GPS activo
    │ ✅ Entregado    │ 03/02/26 │ ◀── 📸 POD capturado
    └─────────────────────────────┘
    
    🔬 ANÁLISIS AVANZADO:
    ┌─────────────────────────────┐
    │ 📈 Tiempo en almacén: 2 días│
    │ 🎯 Rotación: FIFO cumplido  │
    │ ⚠️ Alertas vencimiento: 0   │
    │ 🔄 Movimientos totales: 7   │
    │ ✅ Calidad: Sin incidencias │
    └─────────────────────────────┘
```

### FASE 2: PROCESAMIENTO DE ÓRDENES

#### 📄 2.1 NOTAS DE VENTA - CARGA MASIVA
```
    📊 ARCHIVO EXCEL (.xlsx)
         │
         ▼
    ┌─────────────────┐
    │ 📤 CARGA MASIVA │ ◀── 🖥️ ExcelUpload.gs
    │                 │     📄 NotasVenta_Page.html
    │ ✅ Validación   │     🔍 Verificación formato
    │ 🔍 Verificación │     📊 Análisis de datos
    │ 💾 Almacenado   │     ⚡ Procesamiento batch
    │ 📊 Estadísticas │     📱 Notificaciones
    └─────────────────┘
         │
         ▼
    ┌─────────────────┐
    │ 📋 ORDEN VENTA  │
    │                 │
    │ 🆔 NV-001       │ ◀── 📊 Auto-generado
    │ 👤 Cliente A    │     🏢 Datos validados
    │ 📦 5 productos  │     ✅ Stock verificado
    │ 🎯 Prioridad: 1 │     ⏰ SLA definido
    │ 💰 $1,250.00   │     💳 Crédito aprobado
    │ 📅 2026-02-03  │     📍 Dirección validada
    └─────────────────┘
         │
         ▼
    🎯 ORDEN DE PICKING GENERADA
    
    📊 ESTADÍSTICAS DE CARGA:
    ┌─────────────────────────────┐
    │ 📄 Archivo: ventas_feb.xlsx │
    │ 📊 Registros: 150           │
    │ ✅ Válidos: 147 (98%)       │
    │ ❌ Errores: 3 (2%)          │
    │ ⏱️ Tiempo: 2.5 min          │
    │ 🎯 Órdenes generadas: 147   │
    └─────────────────────────────┘
```

#### 🎯 2.2 PROCESO DE PICKING AVANZADO
```
    🎯 ORDEN DE PICKING
         │
         ▼
    ┌─────────────────────────────┐
    │    🤖 OPTIMIZACIÓN AUTO     │ ◀── 🖥️ PickingEnhanced.gs
    │                             │     ⚡ PickingAPI.gs
    │  🗺️ Ruta optimizada         │     📊 PickingRealTime.gs
    │  📍 Secuencia ubicaciones   │     🔄 PickingEstados.gs
    │  ⏰ Tiempo estimado: 12 min │     📍 PickingUbicaciones.gs
    │  👤 Operario asignado       │     📝 PickingObservaciones.gs
    │  🎯 Prioridad: ALTA         │     🔄 PickingFlowManager.gs
    └─────────────────────────────┘
         │
         ▼
    ┌─────────────────────────────┐
    │     📱 INTERFAZ MÓVIL       │ ◀── 📄 Picking_Page.html
    │                             │     🎨 Diseño responsivo
    │  📋 Lista de productos      │     ⚡ Actualizaciones live
    │  📍 Ubicación actual        │     📸 Captura de fotos
    │  ✅ Confirmación por ítem   │     🔊 Alertas sonoras
    │  📊 Progreso en tiempo real │     📱 Funcionalidad offline
    └─────────────────────────────┘
         │
         ▼
    ┌─────────────────────────────┐
    │      🔄 ESTADOS DINÁMICOS   │
    │                             │
    │  🟡 ASIGNADO → 👤 Operario  │
    │  🔵 EN_PROCESO → 🎯 Picking │
    │  🟠 PAUSADO → ⏸️ Temporal   │
    │  🟢 COMPLETADO → ✅ Listo   │
    │  🔴 ERROR → ⚠️ Revisión     │
    └─────────────────────────────┘
         │
         ▼
    📦 PRODUCTOS PICKEADOS
    
    📊 MÉTRICAS DE PICKING:
    ┌─────────────────────────────┐
    │ ⏱️ Tiempo promedio: 8.5 min │
    │ ✅ Precisión: 99.7%         │
    │ 🎯 Órdenes/hora: 7.2        │
    │ 👥 Operarios activos: 4     │
    │ 📊 Eficiencia: 94%          │
    │ 🔄 Retrabajos: 0.3%         │
    └─────────────────────────────┘
```

#### 📦 2.3 PROCESO DE PACKING INTELIGENTE
```
    📦 PRODUCTOS PICKEADOS
         │
         ▼
    ┌─────────────────────────────┐
    │    📦 ESTACIÓN DE PACKING   │ ◀── 🖥️ PackingEnhanced.gs
    │                             │     📄 Packing_Page.html
    │  🔍 Verificación productos  │     📊 PackingLog.gs
    │  📏 Cálculo dimensiones     │     ⚖️ Pesaje automático
    │  📦 Selección de caja       │     🏷️ Etiquetado auto
    │  🎨 Empaquetado óptimo      │     📸 Fotos de calidad
    └─────────────────────────────┘
         │
         ▼
    ┌─────────────────────────────┐
    │     🏷️ ETIQUETADO AUTO      │
    │                             │
    │  📄 Etiqueta de envío       │
    │  📊 Código de barras        │
    │  📍 Dirección completa      │
    │  📞 Teléfono contacto       │
    │  ⚖️ Peso: 2.5 kg           │
    │  📏 Dimensiones: 30x20x15   │
    └─────────────────────────────┘
         │
         ▼
    🚚 PAQUETE LISTO PARA DESPACHO
    
    📊 CONTROL DE CALIDAD:
    ┌─────────────────────────────┐
    │ ✅ Productos completos      │
    │ 📦 Empaque adecuado         │
    │ 🏷️ Etiquetado correcto      │
    │ ⚖️ Peso verificado          │
    │ 📸 Fotos de evidencia       │
    │ 📋 Documentos incluidos     │
    └─────────────────────────────┘
```

### FASE 3: DESPACHO Y PREPARACIÓN PARA TRANSPORTE

#### 🚚 3.1 PROCESO DE DESPACHO INTELIGENTE
```
    📦 PAQUETES LISTOS
         │
         ▼
    ┌─────────────────────────────┐
    │   🤖 CONSOLIDACIÓN AUTO     │ ◀── 🖥️ Dispatch.gs
    │                             │     📄 Dispatch_Page.html
    │  📊 Agrupación por zona     │     🗺️ Análisis geográfico
    │  🚚 Asignación de vehículo  │     ⚖️ Optimización de carga
    │  📋 Manifiesto de carga     │     📄 Documentación auto
    │  ⏰ Horario de salida       │     📱 Notificaciones
    └─────────────────────────────┘
         │
         ▼
    ┌─────────────────────────────┐
    │     📄 DOCUMENTACIÓN        │
    │                             │
    │  📋 Manifiesto de carga     │
    │  📊 Hoja de ruta            │
    │  📄 Guías de remisión       │
    │  📞 Lista de contactos      │
    │  🗺️ Mapa de ruta            │
    │  ⏰ Horarios estimados      │
    └─────────────────────────────┘
         │
         ▼
    🚛 VEHÍCULO CARGADO Y LISTO
    
    📊 ESTADÍSTICAS DE DESPACHO:
    ┌─────────────────────────────┐
    │ 📦 Paquetes despachados: 45 │
    │ 🚚 Vehículos utilizados: 3  │
    │ ⚖️ Capacidad promedio: 85%  │
    │ 🗺️ Rutas optimizadas: 3     │
    │ ⏰ Tiempo de preparación: 45min │
    │ ✅ Documentos completos: 100% │
    └─────────────────────────────┘
```

### FASE 4: GESTIÓN DE TRANSPORTE (TMS)

#### 🗺️ 4.1 PLANIFICACIÓN INTELIGENTE DE RUTAS
```
    📋 ÓRDENES DE ENTREGA
         │
         ▼
    ┌─────────────────────────────┐
    │   🤖 ALGORITMOS DE RUTEO    │ ◀── 🖥️ TMSRoutePlanning.gs
    │                             │     🔧 TMSOptimization.gs
    │  🎯 Nearest Neighbor        │     📄 TMS_RoutePlanning_Page.html
    │  🗺️ Zone-based Routing      │     🗺️ Google Maps API
    │  ⏰ Time Window Optimization│     📊 Análisis de tráfico
    │  🚨 Priority First          │     ⚡ Cálculo en tiempo real
    └─────────────────────────────┘
         │
         ▼
    ┌─────────────────────────────┐
    │     📊 RUTA OPTIMIZADA      │
    │                             │
    │  🗺️ Ruta: A→B→C→D→E        │
    │  📍 Paradas: 12             │
    │  🛣️ Distancia: 85 km        │
    │  ⏰ Tiempo est: 4.5 horas   │
    │  ⛽ Combustible: 8.5 L      │
    │  💰 Costo estimado: $45     │
    └─────────────────────────────┘
         │
         ▼
    👤 ASIGNACIÓN A CONDUCTOR
    
    🎯 ALGORITMOS DISPONIBLES:
    ┌─────────────────────────────┐
    │ 🎯 Nearest Neighbor         │
    │   └─ Rápido, bueno para pocas paradas │
    │ 🗺️ Zone-based              │
    │   └─ Óptimo para muchas entregas │
    │ ⏰ Time Window              │
    │   └─ Respeta horarios específicos │
    │ 🚨 Priority First           │
    │   └─ Prioriza entregas urgentes │
    └─────────────────────────────┘
```

#### 🚛 4.2 GESTIÓN AVANZADA DE CONDUCTORES
```
    👤 CONDUCTORES DISPONIBLES
         │
         ▼
    ┌─────────────────────────────┐
    │    👥 PERFIL DE CONDUCTOR   │ ◀── 🖥️ TMSDrivers.gs
    │                             │     📄 TMS_Drivers_Page.html
    │  👤 Juan Pérez              │     📊 Historial completo
    │  🚗 Licencia: A2B           │     ⭐ Sistema de rating
    │  📱 Móvil: +56912345678     │     📍 Ubicación en tiempo real
    │  ⭐ Rating: 4.8/5.0         │     📊 Métricas de rendimiento
    │  📊 Entregas: 1,247         │     🎯 Especialización por zona
    │  🎯 Zona: Norte             │
    └─────────────────────────────┘
         │
         ▼
    ┌─────────────────────────────┐
    │     🚚 ASIGNACIÓN AUTO      │
    │                             │
    │  🤖 Algoritmo inteligente   │
    │  📍 Proximidad geográfica   │
    │  ⭐ Rating del conductor    │
    │  📊 Carga de trabajo        │
    │  🎯 Especialización         │
    │  ⏰ Disponibilidad horaria  │
    └─────────────────────────────┘
         │
         ▼
    📱 NOTIFICACIÓN A CONDUCTOR
    
    📊 MÉTRICAS DE CONDUCTORES:
    ┌─────────────────────────────┐
    │ 👥 Conductores activos: 12  │
    │ ⭐ Rating promedio: 4.6     │
    │ 📦 Entregas/día: 28.5       │
    │ ⏰ Tiempo promedio: 18 min  │
    │ ✅ Tasa de éxito: 96.8%     │
    │ 📱 Disponibilidad: 94%      │
    └─────────────────────────────┘
```

#### 🏗️ 4.3 TORRE DE CONTROL - MONITOREO 24/7
```
    🗺️ MAPA EN TIEMPO REAL
         │
         ▼
    ┌─────────────────────────────┐
    │     🖥️ CENTRO DE COMANDO    │ ◀── 🖥️ TMSControlTower.gs
    │                             │     📄 TMS_ControlTower_Page.html
    │  🗺️ Mapa interactivo        │     📡 GPS en tiempo real
    │  📍 12 conductores activos  │     📊 Dashboard ejecutivo
    │  🚨 3 alertas pendientes    │     📱 Notificaciones push
    │  📊 85% entregas completadas│     🔄 Actualización cada 30s
    │  ⏰ ETA promedio: 15 min    │     📞 Comunicación directa
    └─────────────────────────────┘
         │
         ▼
    ┌─────────────────────────────┐
    │      🚨 SISTEMA DE ALERTAS  │
    │                             │
    │  🔴 CRÍTICO: Retraso >1h    │
    │  🟠 MEDIO: Desviación ruta  │
    │  🟡 BAJO: Tráfico intenso   │
    │  🔵 INFO: Entrega exitosa   │
    │  ⚪ DEBUG: Datos técnicos   │
    └─────────────────────────────┘
         │
         ▼
    📞 COMUNICACIÓN DIRECTA
    
    📊 DASHBOARD EN TIEMPO REAL:
    ┌─────────────────────────────┐
    │ 🚚 Vehículos en ruta: 8     │
    │ 📦 Entregas pendientes: 47  │
    │ ✅ Entregas completadas: 123│
    │ ⏰ Tiempo promedio: 16.5 min│
    │ 🎯 Eficiencia: 92.3%        │
    │ 🚨 Incidencias: 2           │
    └─────────────────────────────┘
```

### FASE 5: EJECUCIÓN DE ENTREGAS

#### 📱 5.1 APLICACIÓN MÓVIL DEL CONDUCTOR (PWA)
```
    📱 APP MÓVIL CONDUCTOR
         │
         ▼
    ┌─────────────────────────────┐
    │     📱 INTERFAZ PRINCIPAL   │ ◀── 🖥️ TMSMobileApp.gs
    │                             │     📄 TMS_Mobile_Index.html
    │  📋 Lista de entregas: 8    │     🎨 TMS_Mobile_Navigation.html
    │  📍 Ubicación actual        │     📋 TMS_Mobile_Tasks.html
    │  🗺️ Navegación GPS activa   │     📱 PWA con Service Worker
    │  📊 Progreso: 3/8 (37%)     │     💾 Funcionalidad offline
    │  ⏰ ETA próxima: 12 min     │     🔄 Sincronización auto
    └─────────────────────────────┘
         │
         ▼
    ┌─────────────────────────────┐
    │    📍 PROCESO DE ENTREGA    │ ◀── 📸 TMSCamera.gs
    │                             │     💾 TMSOffline.gs
    │  📍 Llegada confirmada      │     🔄 TMSSync.gs
    │  📦 Entrega de paquete      │     📱 Notificaciones push
    │  📸 Captura de POD          │     🗺️ Integración GPS
    │  ✅ Confirmación cliente    │     📊 Métricas en tiempo real
    │  📝 Observaciones opcionales│
    └─────────────────────────────┘
         │
         ▼
    ✅ ENTREGA COMPLETADA
    
    🔧 FUNCIONALIDADES AVANZADAS:
    ┌─────────────────────────────┐
    │ 📱 PWA (Progressive Web App)│
    │ 💾 Funcionalidad offline    │
    │ 📸 Cámara integrada         │
    │ 🗺️ GPS y navegación         │
    │ 🔄 Sincronización auto      │
    │ 📊 Métricas en tiempo real  │
    │ 📱 Notificaciones push      │
    │ 🎨 Diseño responsive        │
    └─────────────────────────────┘
```

#### 👥 5.2 SEGUIMIENTO PARA CLIENTES
```
    🔗 LINK DE SEGUIMIENTO
         │
         ▼
    ┌─────────────────────────────┐
    │    👥 PORTAL DEL CLIENTE    │ ◀── 🖥️ TMSTracking.gs
    │                             │     🌐 Interfaz pública
    │  📦 Pedido: #NV-001        │     📱 Responsive design
    │  📍 Estado: EN TRÁNSITO     │     🔄 Actualización automática
    │  🗺️ Ubicación en tiempo real│     📱 Notificaciones SMS/Email
    │  ⏰ ETA: 15:30 (12 min)     │     📊 Historial completo
    │  👤 Conductor: Juan P.      │     📞 Contacto directo
    └─────────────────────────────┘
         │
         ▼
    ┌─────────────────────────────┐
    │     📱 NOTIFICACIONES       │
    │                             │
    │  📱 SMS: "Su pedido está    │
    │     a 10 min de llegar"     │
    │  📧 Email: Confirmación     │
    │     de entrega exitosa      │
    │  🔔 Push: Estado actualizado│
    │  📞 Llamada: Reagendamiento │
    └─────────────────────────────┘
         │
         ▼
    ✅ CLIENTE INFORMADO
    
    📊 EXPERIENCIA DEL CLIENTE:
    ┌─────────────────────────────┐
    │ 🔗 Link único de seguimiento│
    │ 📍 Ubicación en tiempo real │
    │ ⏰ ETA dinámico actualizado  │
    │ 📱 Notificaciones automáticas│
    │ 📞 Contacto directo conductor│
    │ 📊 Historial de entregas    │
    │ ⭐ Sistema de calificación   │
    │ 📝 Feedback y comentarios   │
    └─────────────────────────────┘
```

## 🔧 ARQUITECTURA TÉCNICA DETALLADA

### 💾 ESTRUCTURA DE DATOS EN GOOGLE SHEETS

```mermaid
graph LR
    subgraph "📊 HOJAS WMS"
        WMS_INV[📦 Inventario<br/>Stock, Ubicaciones, Movimientos]
        WMS_PROD[🏷️ Productos<br/>Catálogo, Especificaciones]
        WMS_LOTES[🔍 Lotes_Series<br/>Trazabilidad Completa]
        WMS_PICK[🎯 Picking<br/>Órdenes y Estados]
        WMS_PACK[📦 Packing<br/>Registro de Empaquetado]
        WMS_DESP[🚚 Despachos<br/>Control de Salidas]
    end
    
    subgraph "🚚 HOJAS TMS"
        TMS_ENT[📦 Entregas<br/>Órdenes y Estados]
        TMS_COND[👤 Conductores<br/>Información Personal]
        TMS_RUT[🗺️ Rutas<br/>Planificación y Optimización]
        TMS_VEH[🚛 Vehículos<br/>Flota y Capacidades]
        TMS_TRACK[📍 Tracking<br/>Seguimiento Tiempo Real]
    end
    
    subgraph "🔐 HOJAS SISTEMA"
        SYS_USER[👥 Usuarios<br/>Credenciales y Perfiles]
        SYS_ROLES[🛡️ Roles<br/>Permisos y Accesos]
        SYS_LOG[📋 Logs<br/>Auditoría y Eventos]
        SYS_CONFIG[⚙️ Configuración<br/>Parámetros del Sistema]
    end
    
    %% Flujo de datos WMS
    WMS_INV --> WMS_PICK
    WMS_PROD --> WMS_PICK
    WMS_LOTES --> WMS_PICK
    WMS_PICK --> WMS_PACK
    WMS_PACK --> WMS_DESP
    
    %% Integración WMS-TMS
    WMS_DESP --> TMS_ENT
    
    %% Flujo de datos TMS
    TMS_ENT --> TMS_RUT
    TMS_RUT --> TMS_COND
    TMS_COND --> TMS_TRACK
    TMS_TRACK --> TMS_VEH
    
    %% Sistema central
    SYS_USER --> WMS_INV
    SYS_USER --> TMS_ENT
    SYS_ROLES --> SYS_USER
    SYS_LOG --> WMS_INV
    SYS_LOG --> TMS_ENT
    SYS_CONFIG --> WMS_INV
    SYS_CONFIG --> TMS_ENT
```

### 🔄 ESTADOS Y TRANSICIONES DEL SISTEMA

```mermaid
stateDiagram-v2
    [*] --> WMS_RECIBIDO
    
    state "📦 MÓDULO WMS" as WMS {
        WMS_RECIBIDO --> WMS_ALMACENADO : Inspección OK
        WMS_ALMACENADO --> WMS_PICKING : Orden generada
        WMS_PICKING --> WMS_PACKED : Productos recolectados
        WMS_PACKED --> WMS_DESPACHADO : Empaquetado completo
    }
    
    state "🚚 MÓDULO TMS" as TMS {
        TMS_PENDIENTE --> TMS_ASIGNADO : Conductor asignado
        TMS_ASIGNADO --> TMS_EN_RUTA : Salida confirmada
        TMS_EN_RUTA --> TMS_EN_DESTINO : Llegada a destino
        TMS_EN_DESTINO --> TMS_ENTREGADO : Entrega exitosa
        TMS_EN_DESTINO --> TMS_RECHAZADO : Cliente rechaza
    }
    
    WMS_DESPACHADO --> TMS_PENDIENTE : Integración automática
    TMS_ENTREGADO --> [*]
    TMS_RECHAZADO --> WMS_ALMACENADO : Retorno a almacén
```

## 📊 MÉTRICAS Y KPIs DEL SISTEMA

### 🎯 KPIs PRINCIPALES

```
📊 DASHBOARD EJECUTIVO
┌─────────────────────────────────────────────────────────────┐
│                    🏢 MÉTRICAS GENERALES                    │
├─────────────────────────────────────────────────────────────┤
│ 📦 Órdenes procesadas hoy: 147                             │
│ ✅ Entregas exitosas: 142 (96.6%)                          │
│ ⏰ Tiempo promedio orden-entrega: 4.2 horas                │
│ 💰 Costo promedio por entrega: $8.50                       │
│ 👥 Operarios activos: 15                                   │
│ 🚚 Conductores en ruta: 8                                  │
└─────────────────────────────────────────────────────────────┘

📦 WMS - GESTIÓN DE ALMACÉN
┌─────────────────────────────────────────────────────────────┐
│ ⏱️ Tiempo promedio picking: 8.5 min                        │
│ ✅ Precisión de inventario: 99.2%                          │
│ 🔄 Rotación de productos: 12.5x/año                        │
│ 📊 Eficiencia de almacenamiento: 87%                       │
│ 🎯 Órdenes picking/hora: 7.2                               │
│ 📦 Productos empaquetados/hora: 45                         │
└─────────────────────────────────────────────────────────────┘

🚚 TMS - GESTIÓN DE TRANSPORTE
┌─────────────────────────────────────────────────────────────┐
│ ⏰ Tiempo promedio de entrega: 16.5 min                    │
│ 🗺️ Eficiencia de rutas: 92.3%                             │
│ ⭐ Satisfacción del cliente: 4.7/5.0                       │
│ 🚛 Utilización de flota: 85%                               │
│ ⛽ Ahorro combustible vs rutas manuales: 23%               │
│ 📱 Adopción app móvil: 100%                                │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 FUNCIONALIDADES AVANZADAS

### 🤖 INTELIGENCIA ARTIFICIAL Y AUTOMATIZACIÓN

```
🧠 ALGORITMOS INTELIGENTES
┌─────────────────────────────────────────────────────────────┐
│ 🎯 Optimización de Rutas                                   │
│   ├─ Nearest Neighbor (rápido, pocas paradas)             │
│   ├─ Zone-based (óptimo para muchas entregas)             │
│   ├─ Time Window (respeta horarios específicos)           │
│   └─ Priority First (prioriza entregas urgentes)          │
│                                                             │
│ 📊 Predicción de Demanda                                   │
│   ├─ Análisis histórico de ventas                         │
│   ├─ Estacionalidad y tendencias                          │
│   ├─ Alertas de reabastecimiento                          │
│   └─ Optimización de stock                                │
│                                                             │
│ 🔄 Automatización de Procesos                             │
│   ├─ Asignación automática de ubicaciones                 │
│   ├─ Generación automática de órdenes                     │
│   ├─ Optimización de rutas en tiempo real                 │
│   └─ Notificaciones inteligentes                          │
└─────────────────────────────────────────────────────────────┘
```

### 📱 EXPERIENCIA DE USUARIO AVANZADA

```
🎨 DISEÑO Y UX
┌─────────────────────────────────────────────────────────────┐
│ 📱 Progressive Web App (PWA)                               │
│   ├─ Funcionalidad offline completa                       │
│   ├─ Instalación en dispositivos móviles                  │
│   ├─ Notificaciones push nativas                          │
│   └─ Sincronización automática                            │
│                                                             │
│ 🎨 Sistema de Diseño Unificado                            │
│   ├─ Componentes reutilizables                            │
│   ├─ Animaciones CSS fluidas                              │
│   ├─ Diseño responsive para todos los dispositivos        │
│   └─ Tema oscuro/claro automático                         │
│                                                             │
│ ⚡ Rendimiento Optimizado                                  │
│   ├─ Carga lazy de componentes                            │
│   ├─ Caché inteligente de datos                           │
│   ├─ Compresión automática de imágenes                    │
│   └─ Actualización incremental de datos                   │
└─────────────────────────────────────────────────────────────┘
```

## 🔮 ROADMAP Y FUTURAS MEJORAS

### 📈 PRÓXIMAS FUNCIONALIDADES

```
🚀 ROADMAP 2026-2027
┌─────────────────────────────────────────────────────────────┐
│ Q1 2026 - MEJORAS ACTUALES                                 │
│   ├─ ✅ Sistema de entregas mobile-first                   │
│   ├─ ✅ Optimización de rutas con IA                       │
│   ├─ ✅ Torre de control en tiempo real                    │
│   └─ ✅ PWA para conductores                               │
│                                                             │
│ Q2 2026 - INTELIGENCIA ARTIFICIAL                          │
│   ├─ 🔄 Predicción de demanda con ML                       │
│   ├─ 🔄 Optimización automática de inventario              │
│   ├─ 🔄 Chatbot para soporte al cliente                    │
│   └─ 🔄 Análisis predictivo de rutas                       │
│                                                             │
│ Q3 2026 - IOT E INTEGRACIÓN                                │
│   ├─ 📡 Sensores de temperatura en vehículos               │
│   ├─ 📍 Tracking GPS avanzado con geofencing               │
│   ├─ 🔗 Integración con sistemas ERP externos              │
│   └─ 📊 Dashboard de analytics avanzado                    │
│                                                             │
│ Q4 2026 - BLOCKCHAIN Y SEGURIDAD                           │
│   ├─ 🔐 Trazabilidad inmutable con blockchain              │
│   ├─ 🛡️ Autenticación biométrica                          │
│   ├─ 🔒 Encriptación end-to-end                            │
│   └─ 📋 Auditoría automática de procesos                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 📞 INFORMACIÓN DE SOPORTE

```
🏢 SISTEMA CCO - WMS + TMS INTEGRADO
┌─────────────────────────────────────────────────────────────┐
│ 📅 Última actualización: Febrero 2026                      │
│ 🔢 Versión del sistema: 2.0                                │
│ 👨‍💻 Desarrollado por: Sistema CCO                            │
│ 🏗️ Arquitectura: Google Apps Script + PWA                  │
│ 💾 Base de datos: Google Sheets                            │
│ 🗺️ Mapas: Google Maps API                                  │
│ 📱 Notificaciones: SMS/Email APIs                          │
│                                                             │
│ 📊 ESTADÍSTICAS DEL SISTEMA:                               │
│   ├─ 📄 Archivos de código: 150+                          │
│   ├─ 🔧 Funciones implementadas: 500+                     │
│   ├─ 📱 Interfaces de usuario: 25+                        │
│   ├─ 🎨 Componentes reutilizables: 40+                    │
│   └─ 📋 Especificaciones técnicas: 12                     │
└─────────────────────────────────────────────────────────────┘
```

Este diagrama representa el estado actual y la visión completa del sistema WMS+TMS integrado, mostrando todos los flujos, procesos, tecnologías y métricas involucradas en la operación completa desde la recepción de mercancía hasta la entrega final al cliente.