# Documentación Técnica Integral - Proyecto CCO

## 1. Arquitectura y Stack Tecnológico
El Proyecto CCO es una plataforma Cloud-Native de alto rendimiento diseñada para la gestión logística avanzada (WMS/TMS).

*   **Frontend:** React 18 + Vite.
*   **Diseño:** Tailwind CSS (Sistema Light Enterprise SaaS Premium).
*   **Estado Global:** Zustand (Gestión centralizada de inventario y layout).
*   **Animaciones:** GSAP (Efectos cinemáticos y transiciones de alta densidad).
*   **BaaS:** Supabase (PostgreSQL, Auth, RLS, Realtime).
*   **Despliegue:** Render (Web) + Capacitor/Capgo (Mobile OTA).

---

## 2. Estructura de Módulos

### A. Inteligencia y Consultas (Intelligence)
*   **Mapa de Calor (Heatmap.jsx):** Visualización analítica 2D de ocupación de bodega. Calcula ocupación por nivel y rack (A-I).
*   **Explorador WMS (WmsLocations.jsx):** Servicio de búsqueda técnica de alta densidad con filtrado por pasillo y SKU.
*   **Lotes y Series (Batches.jsx):** Control de stock disponible vs reserva con alertas de fecha de vencimiento.

### B. Administración y Auditoría (System)
*   **Carga Masiva (DataImport.jsx):** Motor optimizado para +22,000 filas con procesamiento por lotes (batching).
*   **Historial de Cargas (UploadHistory.jsx):** Auditoría en tiempo real de subidas de datos con KPIs de éxito.
*   **Gestión de Accesos (Roles/Views.jsx):** Control dinámico de permisos y visibilidad de módulos.

### C. Operación Logística (TMS/WMS)
*   **TMS:** Planificación de rutas, Torre de Control y Gestión de Patio.
*   **WMS Outbound:** Picking, Packing (Vista TV) y Despachos.
*   **WMS Inbound:** Putaway (Ingresos) y Cubicaje.

---

## 3. Funcionalidades Críticas

### Motor de Normalización de Ubicaciones
Implementado en `warehouseStore.js`, este motor garantiza la integridad de los datos físicos:
*   **Heurística de Inversión:** Corrige automáticamente errores de digitación (ej: G 28-03 -> G-03-28) basándose en los límites físicos de los racks.
*   **Limpieza Regex:** Unifica formatos heterogéneos eliminando caracteres especiales y normalizando ceros a la izquierda.

### Sistema de Sincronización Realtime
Utiliza Supabase Realtime para actualizar todos los clientes conectados (Web y PDA) ante cualquier cambio en la base de datos, disparando notificaciones globales de subida de datos.

### Seguridad y Permisos (RLS)
Políticas de seguridad a nivel de fila que protegen tablas críticas (`wms_ubicaciones`, `tms_inventario_general`), asegurando que solo personal autorizado pueda realizar modificaciones masivas.

---

## 4. Despliegue y Mantenimiento

### CI/CD Continuo
*   **Web:** Despliegue automático en Render mediante push a la rama `main`.
*   **Móvil (PDA):** Actualizaciones **Over-The-Air (OTA)** que permiten actualizar las terminales de mano sin intervención del usuario ni reinstalación de aplicaciones.

---
**Última actualización:** 2026-05-22
**Versión del Sistema:** 1.0.2
