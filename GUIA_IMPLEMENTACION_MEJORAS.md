# 📖 GUÍA DE IMPLEMENTACIÓN: Mejoras CCO WMS

Esta guía detalla los pasos exactos y el código necesario para implementar las mejoras técnicas y de UX en la aplicación.

## 1. Code Splitting con Vite y React.lazy

**Objetivo:** Reducir el tamaño del bundle inicial cargando componentes solo cuando se necesitan.

### Implementación en `App.jsx`

En lugar de importar todas las vistas directamente, usa `React.lazy`:

```javascript
import React, { Suspense, lazy } from 'react';
// ... otros imports ...

// Cambiar esto:
// import DashboardWMS from './pages/Inventory/DashboardWMS';

// A esto:
const DashboardWMS = lazy(() => import('./pages/Inventory/DashboardWMS'));
const Stock = lazy(() => import('./pages/Inventory/Stock'));
const Picking = lazy(() => import('./pages/Outbound/Picking'));

// Y envuelve tus rutas en un Suspense:
function AppContent() {
  return (
    <Router>
      <Suspense fallback={<div className="flex-center h-screen text-wms-neon">Cargando módulo...</div>}>
        <Routes>
           {/* ... tus rutas ... */}
           <Route path="inventory/dashboard" element={<DashboardWMS />} />
        </Routes>
      </Suspense>
    </Router>
  );
}
```

## 2. Optimización de Imágenes

**Objetivo:** Reducir peso de imágenes estáticas.

1. Instala un plugin de Vite: `npm install vite-plugin-imagemin -D`
2. Configúralo en `vite.config.js`.
3. Reemplaza PNGs grandes por formatos WEBP o SVG donde sea posible.

## 3. Virtualización de Listas (React Virtual)

**Objetivo:** Renderizar miles de filas sin congelar el navegador.

1. Instala: `npm install @tanstack/react-virtual`
2. Úsalo en tablas grandes como el Kardex o el Historial.

```javascript
import { useVirtualizer } from '@tanstack/react-virtual';

// ... dentro de tu componente de tabla ...
const rowVirtualizer = useVirtualizer({
  count: data.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 35, // Altura estimada de fila
});
```

## 4. Implementación de Caché Offline (Dexie + React Query)

**Objetivo:** Operar sin red.

Ya hemos avanzado en esto en `inventoryService.js` (mutaciones optimistas) y `AuthContext.jsx` (Detección online/offline). Sigue expandiendo este patrón a los módulos de Picking y Packing.

---
*(Esta guía contiene los ejemplos base, expande según las necesidades específicas de cada módulo detallado en los Análisis)*