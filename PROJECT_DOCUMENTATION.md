# 📦 Proyecto CCO - Sistema Integral WMS & TMS

Este documento detalla la arquitectura, componentes y guía de mantenimiento del **Sistema de Gestión Logística (CCO)**. El proyecto integra un WMS (Warehouse Management System) y un TMS (Transportation Management System) modernos, conectados en tiempo real.

---

## 🏗 Arquitectura del Sistema

El sistema opera bajo una arquitectura **Cloud-Native** centrada en datos, utilizando **Supabase** como el núcleo de verdad (Source of Truth).

```mermaid
graph TD
    DB[(Supabase PostgreSQL)]
    
    subgraph "Frontend Web (CCO_PTM)"
        Web[Panel de Control React]
        Admin[Módulo Admin]
        WMS[Módulo Bodega]
        TMS_Web[Módulo Transporte]
    end
    
    subgraph "Mobile (tms-mobile-expo)"
        App[App Conductores]
        PDA[App Bodega (Web View)]
    end
    
    subgraph "Integraciones"
        Sheets[Google Sheets]
        Excel[Carga Masiva]
    end

    Web <-->|Lectura/Escritura| DB
    App <-->|Tiempo Real| DB
    Sheets -->|Sync| DB
```

---

## 🚀 Componentes Principales

### 1. Plataforma Web (CCO_PTM)
Es el centro de comando principal. Ubicado en `tms-backend-node/CCO_PTM`.
*   **Tecnologías:** React, Vite, Tailwind CSS, Supabase Client.
*   **Módulos Clave:**
    *   **Inbound:** Recepción de carga (`/Inbound/Reception`).
    *   **Inventory:** Control de stock, Layout visual (`/Inventory/Stock`).
    *   **Outbound:** Picking, Packing y Despacho (`/Outbound/Picking`).
    *   **TMS:** Planificación de rutas y monitoreo (`/TMS/ControlTower`).
    *   **Admin:** Gestión de usuarios, roles y auditoría (`/Admin`).

### 2. App Móvil Conductores (tms-mobile-expo)
Aplicación nativa para los choferes. Ubicado en `tms-mobile-expo`.
*   **Tecnologías:** React Native, Expo (SDK 52), NativeWind.
*   **Funcionalidades:**
    *   Login seguro para conductores.
    *   Lista de entregas en tiempo real.
    *   Detalle de pedido con navegación (Maps/Waze).
    *   Confirmación de entrega y reportes de rechazo.

### 3. Base de Datos (Supabase)
PostgreSQL alojado en la nube con capacidades de tiempo real.
*   **Tablas Críticas:**
    *   `tms_nv_diarias`: Tabla maestra de Notas de Venta.
    *   `tms_entregas`: Registro de despachos asignados.
    *   `tms_farmapack` / `tms_matriz_codigos`: Inventario maestro.
*   **Seguridad:** Row Level Security (RLS) activo para proteger datos.

---

## 🛠 Guía de Instalación y Ejecución

### A. Ejecutar Plataforma Web
1.  Navegar a la carpeta: `cd tms-backend-node/CCO_PTM`
2.  Instalar dependencias (solo la primera vez): `npm install`
3.  Iniciar servidor local: `npm run dev`
4.  Acceder en navegador: `http://localhost:5173`

### B. Ejecutar App Móvil
1.  Navegar a la carpeta: `cd tms-mobile-expo`
2.  Instalar dependencias: `npm install`
3.  Iniciar Expo: `npx expo start -c` (El flag `-c` limpia la caché).
4.  Escanear el código QR con la app **Expo Go** en Android/iOS.

---

## 🔧 Mantenimiento y Solución de Problemas Comunes

Hemos creado scripts SQL específicos para resolver problemas recurrentes. Ejecútalos en el **Editor SQL de Supabase**.

### 1. Error "Value too long for type character varying"
Ocurre al cargar N.V. con descripciones muy largas.
*   **Solución:** Ejecutar `FIX_ALL_COLUMNS_FINAL.sql` (ubicado en `tms-backend-node/`).
*   **Acción:** Convierte todas las columnas de texto a `TEXT` ilimitado.

### 2. Duplicados en Farmapack
Ocurre cuando se suben archivos Excel repetidos sin limpiar antes.
*   **Solución:** Ejecutar `FIX_FARMAPACK.sql`.
*   **Acción:** Borra la tabla, y crea una restricción única (Unique Constraint) compuesta por `codigo_producto + lote`.

### 3. Error de Carga "Column does not exist"
Si el sistema reclama por columnas faltantes (ej: `ciudad`).
*   **Solución:** Ejecutar `FIX_COLUMNS_SAFE.sql`.
*   **Acción:** Verifica inteligentemente qué columnas existen antes de intentar modificarlas.

### 4. Limpieza de Datos Corruptos
Si aparecen N.V. extrañas como nombres de clientes o fechas vacías.
*   **Solución:** Ejecutar `CLEAN_BAD_DATA.sql`.
*   **Acción:** Elimina filas donde el número de N.V. parece ser basura o texto incorrecto.

---

## 📅 Historial de Actualizaciones Recientes

| Fecha | Componente | Cambio Realizado |
| :--- | :--- | :--- |
| **08/03/2026** | **Mobile App** | Creación de App Nativa con Expo para reemplazar la versión PWA. |
| **08/03/2026** | **Database** | Migración masiva de columnas `VARCHAR(50)` a `TEXT` para evitar errores de carga. |
| **08/03/2026** | **Data Import** | Implementación de lógica "Anti-Duplicados" y limpieza de espacios en N.V. |
| **08/03/2026** | **Farmapack** | Reset completo de tabla y creación de índices únicos. |
| **08/03/2026** | **Data Import** | Nueva opción "Mi Excel NO tiene fecha al inicio" para corregir desfase de columnas. |

---

**Desarrollado por:** Equipo de Ingeniería CCO
**Contacto Soporte:** [Tu Correo/Contacto]
