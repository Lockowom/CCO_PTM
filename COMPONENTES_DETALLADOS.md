# 🧩 GUÍA DETALLADA DE COMPONENTES

## 📑 Tabla de Contenidos
1. [Componentes de UI](#componentes-de-ui)
2. [Páginas del Sistema](#páginas-del-sistema)
3. [Patrones de Diseño](#patrones-de-diseño)
4. [Ejemplos de Uso](#ejemplos-de-uso)

---

## 🎨 Componentes de UI

### 1. **StatCard** - Tarjeta de Estadística

**Ubicación:** `src/pages/Dashboard.jsx`

**Props:**
```javascript
{
  title: string,           // Título de la métrica
  value: number,           // Valor a mostrar
  icon: ReactNode,         // Icono (Lucide)
  trend?: string,          // Tendencia (ej: "+5%")
  colorClass: string,      // Clase de color (ej: "text-orange-600 bg-orange-500")
  delay?: number           // Delay de animación
}
```

**Ejemplo:**
```jsx
<StatCard 
  title="N.V. Totales" 
  value={150} 
  icon={<FileText size={20} />} 
  colorClass="text-slate-600 bg-slate-500" 
  trend="+5%"
/>
```

**Características:**
- ✅ Animación de entrada con GSAP
- ✅ Efecto hover con escala
- ✅ Icono decorativo de fondo
- ✅ Indicador de tendencia

---

### 2. **PipelineStep** - Paso del Pipeline

**Ubicación:** `src/pages/Dashboard.jsx`

**Props:**
```javascript
{
  label: string,           // Etiqueta del paso
  value: number,           // Cantidad
  color: string,           // Color de fondo (ej: "bg-slate-500")
  icon: ReactNode,         // Icono
  isLast: boolean          // Si es el último paso (sin línea)
}
```

**Ejemplo:**
```jsx
<PipelineStep 
  label="Picking" 
  value={45} 
  color="bg-cyan-500" 
  icon={<Hand size={20}/>} 
/>
```

**Características:**
- ✅ Línea conectora animada
- ✅ Efecto hover en icono
- ✅ Responsive (oculta línea en mobile)

---

### 3. **ClockWidget** - Reloj en Tiempo Real

**Ubicación:** `src/components/Navbar.jsx`

**Características:**
- ✅ Actualización cada segundo
- ✅ Formato 12 horas con AM/PM
- ✅ Muestra fecha (día-mes)
- ✅ Indicador de conexión

**Ejemplo:**
```jsx
<ClockWidget />
```

---

### 4. **MobileMenu** - Menú Móvil

**Ubicación:** `src/components/Navbar.jsx`

**Características:**
- ✅ Menú desplegable en mobile
- ✅ Validación de permisos
- ✅ Animaciones suaves
- ✅ Submenús anidados

---

## 📄 Páginas del Sistema

### **Módulo TMS (Transportation Management System)**

#### 1. **RoutePlanning** - Planificación de Rutas
```
Ruta: /tms/planning
Permisos: view_routes, create_routes
Descripción: Planificación y optimización de rutas de entrega
```

#### 2. **ControlTower** - Torre de Control
```
Ruta: /tms/control-tower
Permisos: view_control_tower, manage_control_tower
Descripción: Monitoreo en tiempo real de flota
```

#### 3. **Drivers** - Gestión de Conductores
```
Ruta: /tms/drivers
Permisos: view_drivers, manage_drivers
Descripción: CRUD de conductores y asignación de rutas
```

#### 4. **YardManagement** - Gestión de Patios
```
Ruta: /tms/yard
Permisos: view_control_tower
Descripción: Gestión de espacios de carga/descarga
```

---

### **Módulo Inbound (Recepción)**

#### 1. **Reception** - Recepción de Mercancía
```
Ruta: /inbound/reception
Permisos: view_reception, process_reception
Descripción: Registro de entrada de mercancía
Flujo:
  1. Escanear código de recepción
  2. Validar cantidad y calidad
  3. Generar ubicaciones
  4. Confirmar recepción
```

#### 2. **CubingRegistry** - Registro de Cubicaje
```
Ruta: /inbound/cubing
Permisos: view_reception, process_reception
Descripción: Registro de pesos y dimensiones
Campos:
  - SKU
  - Lote
  - Peso (kg)
  - Dimensiones (L x A x H)
  - Volumen calculado
```

#### 3. **Entry** - Ingreso (Putaway)
```
Ruta: /inbound/entry
Permisos: view_entry, process_entry
Descripción: Colocación de mercancía en ubicaciones
Flujo:
  1. Seleccionar mercancía recibida
  2. Sugerir ubicación (FEFO)
  3. Confirmar ubicación
  4. Actualizar inventario
```

#### 4. **Returns** - Devoluciones
```
Ruta: /inbound/returns
Permisos: view_reception, process_reception
Descripción: Gestión de devoluciones de clientes
```

---

### **Módulo Outbound (Despacho)**

#### 1. **SalesOrders** - Notas de Venta
```
Ruta: /outbound/sales-orders
Permisos: view_sales_orders, manage_sales_orders
Descripción: Gestión de órdenes de venta
Estados:
  - Pendiente
  - Aprobada
  - En Picking
  - En Packing
  - Lista para Despacho
  - Despachada
  - Entregada
```

#### 2. **Picking** - Picking (Recolección)
```
Ruta: /outbound/picking
Permisos: view_picking, process_picking
Descripción: Recolección de productos según N.V.
Flujo:
  1. Asignar picking a operario
  2. Mostrar ubicaciones en orden
  3. Validar cantidad
  4. Confirmar picking
  5. Generar etiqueta
```

#### 3. **Packing** - Empaque
```
Ruta: /outbound/packing
Permisos: view_packing, process_packing
Descripción: Empaque de productos
Flujo:
  1. Recibir picking confirmado
  2. Empacar en cajas
  3. Generar etiqueta de caja
  4. Confirmar packing
```

#### 4. **PackingTV** - Monitor de Packing
```
Ruta: /outbound/packing-tv
Permisos: view_packing_tv
Descripción: Pantalla TV para monitoreo de packing
Características:
  - Actualización en tiempo real
  - Grandes números
  - Indicadores de estado
```

#### 5. **Shipping** - Despacho
```
Ruta: /outbound/shipping
Permisos: view_shipping, process_shipping
Descripción: Generación de guías y despacho
Flujo:
  1. Agrupar cajas por ruta
  2. Generar guía de transporte
  3. Asignar conductor
  4. Confirmar despacho
```

---

### **Módulo Inventory (Inventario)**

#### 1. **DashboardWMS** - Dashboard de Inventario
```
Ruta: /inventory/dashboard
Permisos: view_stock, view_layout
Descripción: Resumen de estado del almacén
KPIs:
  - Stock total
  - Ubicaciones ocupadas
  - Rotación promedio
  - Quiebres de stock
```

#### 2. **Stock** - Gestión de Stock
```
Ruta: /inventory/stock
Permisos: view_stock, manage_stock
Descripción: Consulta y ajuste de inventario
Funcionalidades:
  - Búsqueda por SKU
  - Filtro por lote
  - Ajustes manuales
  - Historial de movimientos
```

#### 3. **Layout** - Gestión de Ubicaciones
```
Ruta: /inventory/layout
Permisos: view_layout, manage_layout
Descripción: Configuración de estructura del almacén
Elementos:
  - Zonas
  - Pasillos
  - Estantes
  - Posiciones
```

#### 4. **Transfers** - Transferencias
```
Ruta: /inventory/transfers
Permisos: view_transfers, manage_transfers
Descripción: Movimiento de stock entre ubicaciones
Flujo:
  1. Seleccionar origen
  2. Seleccionar destino
  3. Validar disponibilidad
  4. Confirmar transferencia
```

#### 5. **CycleCount** - Inventario Cíclico
```
Ruta: /inventory/cycle-count
Permisos: view_stock, manage_inventory
Descripción: Conteos periódicos de inventario
Flujo:
  1. Generar ciclo de conteo
  2. Asignar zonas a operarios
  3. Registrar conteos
  4. Reconciliar diferencias
```

#### 6. **Replenishment** - Reabastecimiento
```
Ruta: /inventory/replenishment
Permisos: view_stock, manage_inventory
Descripción: Reabastecimiento automático de picking
Características:
  - Cálculo automático de necesidades
  - Sugerencias de reabastecimiento
  - Historial de tareas
```

---

### **Módulo Quality (Calidad)**

#### 1. **Inspection** - Inspección de Calidad
```
Ruta: /quality/inspection
Permisos: view_quality, process_quality
Descripción: Inspección de productos
Flujo:
  1. Seleccionar lote
  2. Definir criterios
  3. Registrar defectos
  4. Generar reporte
  5. Decidir: Aceptar/Rechazar
```

---

### **Módulo Analytics (Reportes)**

#### 1. **Analytics** - Reportes Generales
```
Ruta: /analytics
Permisos: view_reports
Descripción: Gráficos y reportes de actividad
Gráficos:
  - Actividad por hora
  - Distribución por estado
  - Tendencias de despacho
  - Productividad por operario
```

#### 2. **WarehouseTV** - Modo TV
```
Ruta: /analytics/tv
Permisos: view_reports
Descripción: Pantalla grande para monitoreo
Características:
  - Actualización cada 5 segundos
  - Grandes números
  - Indicadores de alerta
```

---

### **Módulo Queries (Consultas)**

#### 1. **Kardex** - Trazabilidad
```
Ruta: /queries/kardex
Permisos: view_kardex
Descripción: Historial completo de movimientos
Información:
  - Entrada/Salida
  - Ubicación
  - Lote
  - Fecha/Hora
  - Usuario
```

#### 2. **Productivity** - Rendimiento
```
Ruta: /queries/productivity
Permisos: view_productivity
Descripción: Métricas de productividad
Métricas:
  - Picking por hora
  - Packing por hora
  - Recepción por hora
  - Entregas por conductor
```

#### 3. **HistorialNV** - Historial de N.V.
```
Ruta: /queries/historial-nv
Permisos: view_historial_nv
Descripción: Búsqueda de N.V. históricas
Filtros:
  - Fecha
  - Cliente
  - Estado
  - Rango de N.V.
```

#### 4. **DispatchControl** - Control de Despacho
```
Ruta: /queries/dispatch-control
Permisos: view_dispatch_control
Descripción: Monitoreo de despachos
Información:
  - Guía
  - Conductor
  - Ruta
  - Estado
  - ETA
```

#### 5. **Batches** - Lotes y Series
```
Ruta: /queries/batches
Permisos: view_batches
Descripción: Consulta de lotes y números de serie
Información:
  - Lote
  - Vencimiento
  - Cantidad
  - Ubicación
  - Series
```

#### 6. **SalesStatus** - Estado de N.V.
```
Ruta: /queries/sales-status
Permisos: view_sales_status
Descripción: Estado actual de órdenes
Información:
  - N.V.
  - Cliente
  - Estado
  - Fecha
  - Próximo paso
```

#### 7. **Addresses** - Direcciones
```
Ruta: /queries/addresses
Permisos: view_addresses
Descripción: Consulta de direcciones de clientes
Información:
  - Cliente
  - Dirección
  - Teléfono
  - Zona
```

#### 8. **Locations** - Ubicaciones
```
Ruta: /queries/locations
Permisos: view_locations
Descripción: Consulta de ubicaciones del almacén
Información:
  - Ubicación
  - Zona
  - Capacidad
  - Stock actual
  - Disponible
```

---

### **Módulo Admin (Administración)**

#### 1. **Users** - Gestión de Usuarios
```
Ruta: /admin/users
Permisos: manage_users, view_users
Descripción: CRUD de usuarios
Funcionalidades:
  - Crear usuario
  - Editar usuario
  - Cambiar rol
  - Activar/Desactivar
  - Resetear contraseña
```

#### 2. **Roles** - Gestión de Roles
```
Ruta: /admin/roles
Permisos: manage_roles, view_roles
Descripción: Definición de roles y permisos
Funcionalidades:
  - Crear rol
  - Asignar permisos
  - Editar permisos
  - Eliminar rol
```

#### 3. **Views** - Configuración de Módulos
```
Ruta: /admin/views
Permisos: manage_views, view_views
Descripción: Habilitar/Deshabilitar módulos
Módulos:
  - TMS
  - Inbound
  - Outbound
  - Inventory
  - Quality
  - Analytics
  - Queries
  - Admin
```

#### 4. **Mediciones** - Métricas del Sistema
```
Ruta: /admin/mediciones
Permisos: manage_mediciones, view_mediciones
Descripción: Configuración de KPIs
Funcionalidades:
  - Definir métricas
  - Establecer objetivos
  - Configurar alertas
```

#### 5. **SystemHealth** - Salud del Sistema
```
Ruta: /admin/system-health
Permisos: manage_mediciones
Descripción: Monitoreo de sistema
Información:
  - Uptime
  - Conexión BD
  - Usuarios activos
  - Errores recientes
```

#### 6. **OpsControl** - Control de Operaciones
```
Ruta: /admin/ops-control
Permisos: manage_users
Descripción: Control de procesos operacionales
Funcionalidades:
  - Pausar/Reanudar procesos
  - Forzar sincronización
  - Limpiar caché
```

#### 7. **AuditLogs** - Auditoría
```
Ruta: /admin/audit-logs
Permisos: view_reports
Descripción: Registro de acciones
Información:
  - Usuario
  - Acción
  - Fecha/Hora
  - Resultado
```

#### 8. **LoginHistory** - Historial de Accesos
```
Ruta: /admin/login-history
Permisos: manage_users
Descripción: Registro de inicios de sesión
Información:
  - Usuario
  - Fecha/Hora
  - IP
  - Dispositivo
```

#### 9. **WmsSettings** - Configuración WMS
```
Ruta: /admin/wms-settings
Permisos: manage_views
Descripción: Configuración general del sistema
Opciones:
  - Zona de picking por defecto
  - Algoritmo de asignación
  - Reglas de validación
```

#### 10. **Cleanup** - Limpieza de Datos
```
Ruta: /admin/cleanup
Permisos: manage_cleanup
Descripción: Limpieza de datos antiguos
Funcionalidades:
  - Archivar N.V. antiguas
  - Limpiar logs
  - Optimizar BD
```

#### 11. **TimeReports** - Reportes de Tiempo
```
Ruta: /admin/time-reports
Permisos: view_time_reports
Descripción: Análisis de tiempos
Métricas:
  - Tiempo promedio por operación
  - Tiempo de ciclo
  - Eficiencia
```

#### 12. **Tickets** - Soporte TI
```
Ruta: /admin/tickets
Permisos: manage_tickets
Descripción: Sistema de tickets de soporte
Funcionalidades:
  - Crear ticket
  - Asignar a técnico
  - Seguimiento
  - Resolución
```

#### 13. **UploadHistory** - Historial de Cargas
```
Ruta: /admin/upload-history
Permisos: admin_upload_history
Descripción: Registro de cargas de datos
Información:
  - Archivo
  - Fecha
  - Usuario
  - Registros procesados
  - Errores
```

---

## 🎯 Patrones de Diseño

### 1. **Patrón Context + Hook**
```javascript
// Uso de contexto para estado global
const { user, hasPermission } = useAuth();
const { isModuleEnabled } = useConfig();
```

### 2. **Patrón Realtime Subscription**
```javascript
// Suscripción a cambios en BD
const channel = supabase
  .channel('table_changes')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'tabla' }, callback)
  .subscribe();
```

### 3. **Patrón Protected Route**
```javascript
// Validación de permisos en ruta
<Route path="/admin/users" element={<ProtectedRoute />}>
  <Route index element={<Users />} />
</Route>
```

### 4. **Patrón Custom Hook**
```javascript
// Hook reutilizable con lógica
const { data, loading, error, refetch } = useConductores();
```

---

## 💡 Ejemplos de Uso

### Ejemplo 1: Crear un Nuevo Componente
```jsx
import React from 'react';
import { useAuth } from '../context/AuthContext';

const MiComponente = () => {
  const { user, hasPermission } = useAuth();

  if (!hasPermission('view_stock')) {
    return <div>Acceso denegado</div>;
  }

  return (
    <div className="p-4 bg-white rounded-lg">
      <h1>Bienvenido, {user.nombre}</h1>
    </div>
  );
};

export default MiComponente;
```

### Ejemplo 2: Usar Realtime
```jsx
useEffect(() => {
  const channel = supabase
    .channel('stock_changes')
    .on('postgres_changes', 
      { event: 'UPDATE', schema: 'public', table: 'wms_inventory' },
      (payload) => {
        console.log('Stock actualizado:', payload.new);
        setStock(prev => [...prev, payload.new]);
      }
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}, []);
```

### Ejemplo 3: Usar Custom Hook
```jsx
const MiPagina = () => {
  const { conductores, loading, crearConductor } = useConductores();

  const handleCreate = async () => {
    await crearConductor({
      nombre: 'Juan Pérez',
      licencia: 'ABC123',
      estado: 'DISPONIBLE'
    });
  };

  return (
    <div>
      {loading ? <p>Cargando...</p> : (
        <ul>
          {conductores.map(c => <li key={c.id}>{c.nombre}</li>)}
        </ul>
      )}
      <button onClick={handleCreate}>Crear Conductor</button>
    </div>
  );
};
```

---

**Última actualización:** Mayo 2026
**Versión:** 1.0.0
