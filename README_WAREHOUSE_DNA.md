# Warehouse DNA - Módulo de Ubicaciones WMS 3D

## Instalación y Activación

El módulo `WarehouseDNA` ha sido implementado exitosamente reemplazando la antigua vista plana por un entorno 3D isométrico interactivo.

### 1. Dependencias Requeridas
Asegúrate de que las siguientes dependencias estén instaladas en tu proyecto (ya lo hemos intentado, pero si tienes errores EPERM en Windows, cierra el servidor local `npm run dev` y ejecútalo manualmente):
```bash
npm install zustand gsap lucide-react
```
*(Nota: Hemos construido las animaciones usando `GSAP` que ya tenías instalado, omitiendo `framer-motion` para evitar dependencias innecesarias que puedan chocar con tu Capacitor/Android).*

### 2. Estructura de Archivos
- **`src/store/warehouseStore.js`**: Estado global de Zustand que maneja el inventario, el layout físico, cálculos en tiempo real y suscripciones a Supabase.
- **`src/utils/isoCoords.js`**: Motor de proyección 3D que mapea coordenadas lógicas (A-01-01) a pixeles espaciales X, Y, Z.
- **`src/components/WarehouseDNA/WarehouseScene.jsx`**: Contenedor principal que maneja la cámara (pan/zoom) y la rotación isométrica (`rotateX(60deg) rotateZ(45deg)`).
- **`src/components/WarehouseDNA/StorageCell.jsx`**: Componente de celda. Renderiza un cuboide en puro CSS 3D (caras Top, Front, Right) con colores basados en estado y ocupación.
- **`src/components/WarehouseDNA/FloatingDetailPanel.jsx`**: Panel lateral emergente para editar, mover o bloquear ubicaciones con inputs inline.
- **`src/components/WarehouseDNA/SearchOmnibar.jsx`**: Buscador global invocado con `Ctrl + K`.

### 3. Activación en el Proyecto
El módulo ya ha sido vinculado en `src/App.jsx` y `src/pages/Admin/Views.jsx`. 
Ruta accesible en: `/inventory/layout`.

### 4. Base de Datos
Se han utilizado estrictamente las tablas existentes que pediste:
- `wms_ubicaciones` (Inventario real y productos)
- `wms_layout` (Estados físicos: DISPONIBLE, NO DISPONIBLE, OCUPADA)

No se requiere migración SQL adicional, ya que la lógica de unión (Join lógico en frontend) se hace dentro de `warehouseStore.js` de forma ultra-rápida.

### 5. Controles de Cámara
- **Click + Arrastrar**: Mueve la escena a través de los pasillos.
- **Scroll del Ratón**: Acercar o alejar el zoom de forma fluida.
- **Click en Celda**: Abre el panel de detalle de la celda y enfoca visualmente la estantería.
- **Ctrl + K / Cmd + K**: Abre el buscador rápido de SKU o Ubicación.