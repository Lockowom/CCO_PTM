# 🚀 GUÍA DE DESARROLLO - CCO WMS

## 📑 Tabla de Contenidos
1. [Configuración del Entorno](#configuración-del-entorno)
2. [Estructura de Carpetas](#estructura-de-carpetas)
3. [Convenciones de Código](#convenciones-de-código)
4. [Flujos de Trabajo](#flujos-de-trabajo)
5. [Mejores Prácticas](#mejores-prácticas)
6. [Troubleshooting](#troubleshooting)

---

## 🔧 Configuración del Entorno

### Requisitos Previos
```bash
Node.js >= 16.x
npm >= 8.x
Git
```

### Instalación Inicial

1. **Clonar repositorio**
```bash
git clone <repo-url>
cd CCO_PTM
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
# Editar .env con credenciales de Supabase
```

4. **Iniciar servidor de desarrollo**
```bash
npm run dev
# Acceder a http://localhost:5173
```

### Configuración de Supabase

1. Crear proyecto en [supabase.com](https://supabase.com)
2. Obtener URL y Anon Key
3. Configurar en `.env`:
```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_KEY=tu_anon_key_aqui
```

4. Crear tablas en PostgreSQL (ver `DOCUMENTACION_TECNICA.md`)

---

## 📁 Estructura de Carpetas

### Crear Nueva Página

```bash
# 1. Crear carpeta en pages
mkdir src/pages/MiModulo

# 2. Crear archivo principal
touch src/pages/MiModulo/MiPagina.jsx

# 3. Agregar ruta en App.jsx
import MiPagina from './pages/MiModulo/MiPagina';

// En Routes:
<Route path="mimodulo/mipagina" element={<MiPagina />} />

# 4. Agregar permiso en ROUTE_PERMISSIONS
'/mimodulo/mipagina': ['view_mimodulo'],

# 5. Agregar a menú en Navbar.jsx
{
  label: 'Mi Página',
  path: '/mimodulo/mipagina',
  icon: <Icon size={16} />
}
```

### Crear Nuevo Componente

```bash
# 1. Crear archivo en components
touch src/components/MiComponente.jsx

# 2. Estructura básica
import React from 'react';

const MiComponente = ({ prop1, prop2 }) => {
  return (
    <div className="p-4 bg-white rounded-lg">
      {/* Contenido */}
    </div>
  );
};

export default MiComponente;
```

### Crear Nuevo Servicio

```bash
# 1. Crear archivo en services
touch src/services/miServicio.js

# 2. Estructura básica
import { supabase } from '../supabase';

export const MiServicio = {
  async obtenerDatos() {
    const { data, error } = await supabase
      .from('mi_tabla')
      .select('*');
    
    if (error) throw error;
    return data;
  }
};
```

---

## 📝 Convenciones de Código

### Nombres de Archivos

```javascript
// Componentes React (PascalCase)
MiComponente.jsx
Dashboard.jsx
UserForm.jsx

// Servicios (camelCase)
inventoryService.js
wmsLogic.js
labelPrinter.js

// Hooks (camelCase con prefijo 'use')
useConductores.js
useInventory.js
useAuth.js

// Contextos (PascalCase con sufijo 'Context')
AuthContext.jsx
ConfigContext.jsx
```

### Estructura de Componentes

```jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase';

// Constantes
const ESTADOS = ['Pendiente', 'Aprobado', 'Rechazado'];

// Componente
const MiComponente = ({ titulo, onSave }) => {
  // 1. Hooks
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // 2. Efectos
  useEffect(() => {
    fetchData();
  }, []);

  // 3. Funciones
  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await supabase.from('tabla').select('*');
      setData(data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // 4. Render
  return (
    <div className="p-4">
      <h1>{titulo}</h1>
      {loading ? <p>Cargando...</p> : <div>{/* Contenido */}</div>}
    </div>
  );
};

export default MiComponente;
```

### Estilos Tailwind

```jsx
// ✅ BIEN: Clases organizadas
<div className="flex items-center justify-between p-4 bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all">

// ❌ MAL: Clases desordenadas
<div className="p-4 flex bg-white rounded-lg border border-slate-200 items-center justify-between shadow-sm">

// Orden recomendado:
// 1. Display (flex, grid, block)
// 2. Sizing (w, h, p, m)
// 3. Colors (bg, text, border)
// 4. Borders (rounded, border)
// 5. Effects (shadow, opacity)
// 6. Interactions (hover, transition)
```

### Comentarios

```javascript
// ✅ BIEN: Comentarios útiles
// Cargar datos del usuario al montar el componente
useEffect(() => {
  fetchUser();
}, []);

// ❌ MAL: Comentarios obvios
// Establecer loading en true
setLoading(true);

// ✅ BIEN: Comentarios de sección
// --- VALIDACIÓN DE PERMISOS ---
if (!hasPermission('view_stock')) {
  return <AccessDenied />;
}

// ✅ BIEN: Comentarios de TODO
// TODO: Implementar paginación cuando haya más de 1000 registros
```

---

## 🔄 Flujos de Trabajo

### Flujo de Desarrollo

```
1. Crear rama
   git checkout -b feature/mi-feature

2. Hacer cambios
   - Editar archivos
   - Probar localmente (npm run dev)
   - Verificar consola (sin errores)

3. Commit
   git add .
   git commit -m "feat: descripción clara"

4. Push
   git push origin feature/mi-feature

5. Pull Request
   - Describir cambios
   - Solicitar review
   - Esperar aprobación

6. Merge
   git checkout main
   git pull origin main
   git merge feature/mi-feature
   git push origin main

7. Deploy
   npm run build
   # Desplegar en producción
```

### Flujo de Autenticación

```
Usuario ingresa email/contraseña
    ↓
AuthContext.login() valida en BD
    ↓
Si válido:
  - Guardar usuario en localStorage
  - Cargar permisos desde tms_roles
  - Crear heartbeat en tms_usuarios_activos
  - Registrar acceso en tms_accesos
  - Redirigir a primera ruta disponible
    ↓
Si inválido:
  - Mostrar error
  - Limpiar formulario
```

### Flujo de Permisos

```
Usuario accede a ruta
    ↓
ProtectedRoute valida:
  1. ¿Está autenticado?
  2. ¿Tiene permisos requeridos?
  3. ¿Módulo está habilitado?
    ↓
Si válido:
  - Mostrar página
    ↓
Si inválido:
  - Mostrar AccessDenied
  - Registrar intento en logs
```

### Flujo de Realtime

```
Componente monta
    ↓
Crear suscripción a tabla
    ↓
Escuchar cambios (INSERT, UPDATE, DELETE)
    ↓
Actualizar estado local
    ↓
Componente desmonta
    ↓
Limpiar suscripción
```

---

## ✅ Mejores Prácticas

### 1. **Manejo de Errores**

```javascript
// ✅ BIEN: Manejo completo
try {
  const { data, error } = await supabase
    .from('tabla')
    .select('*');
  
  if (error) throw error;
  setData(data);
} catch (err) {
  console.error('Error cargando datos:', err);
  toast.error('No se pudieron cargar los datos');
  setError(err.message);
} finally {
  setLoading(false);
}

// ❌ MAL: Sin manejo de errores
const data = await supabase.from('tabla').select('*');
setData(data);
```

### 2. **Limpieza de Efectos**

```javascript
// ✅ BIEN: Limpiar suscripciones
useEffect(() => {
  const channel = supabase.channel('changes').subscribe();
  
  return () => {
    supabase.removeChannel(channel);
  };
}, []);

// ❌ MAL: Sin limpiar
useEffect(() => {
  supabase.channel('changes').subscribe();
}, []);
```

### 3. **Validación de Permisos**

```javascript
// ✅ BIEN: Validar antes de mostrar
const { hasPermission } = useAuth();

if (!hasPermission('view_stock')) {
  return <AccessDenied />;
}

return <StockPage />;

// ❌ MAL: Mostrar y esperar que falle
return <StockPage />;
```

### 4. **Optimización de Renders**

```javascript
// ✅ BIEN: Usar useCallback para funciones
const handleSave = useCallback(async (data) => {
  await saveData(data);
}, []);

// ✅ BIEN: Usar useMemo para cálculos pesados
const filteredData = useMemo(() => {
  return data.filter(item => item.status === 'active');
}, [data]);

// ❌ MAL: Crear función en cada render
const handleSave = async (data) => {
  await saveData(data);
};
```

### 5. **Logs Útiles**

```javascript
// ✅ BIEN: Logs descriptivos
console.log('📥 Cargando datos de usuarios...');
console.log('✅ Datos cargados:', data.length, 'registros');
console.log('❌ Error:', error.message);
console.log('🔄 Refrescando permisos...');

// ❌ MAL: Logs genéricos
console.log('data');
console.log('error');
console.log('loading');
```

### 6. **Animaciones**

```javascript
// ✅ BIEN: Usar GSAP para animaciones complejas
useLayoutEffect(() => {
  const ctx = gsap.context(() => {
    gsap.from('.elemento', {
      opacity: 0,
      y: 20,
      duration: 0.5,
      ease: 'power2.out'
    });
  }, ref);
  
  return () => ctx.revert();
}, []);

// ✅ BIEN: Usar Tailwind para animaciones simples
<div className="animate-pulse">Cargando...</div>

// ❌ MAL: Usar setTimeout para animaciones
setTimeout(() => setVisible(true), 500);
```

### 7. **Notificaciones**

```javascript
// ✅ BIEN: Usar Sonner para notificaciones
import { toast } from 'sonner';

toast.success('Guardado correctamente');
toast.error('Error al guardar');
toast.info('Información importante');

// ❌ MAL: Usar alert
alert('Guardado correctamente');
```

### 8. **Nombres Descriptivos**

```javascript
// ✅ BIEN: Nombres claros
const isUserAdmin = user?.rol === 'ADMIN';
const hasStockAvailable = stock > 0;
const shouldShowWarning = quiebres > 5;

// ❌ MAL: Nombres genéricos
const isAdmin = user?.rol === 'ADMIN';
const hasStock = stock > 0;
const show = quiebres > 5;
```

---

## 🐛 Troubleshooting

### Problema: "Cannot find module"

**Solución:**
```bash
# Limpiar node_modules
rm -rf node_modules
npm install

# Limpiar caché de Vite
rm -rf .vite
npm run dev
```

### Problema: Supabase no conecta

**Solución:**
```javascript
// Verificar credenciales en .env
console.log('URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Key:', import.meta.env.VITE_SUPABASE_KEY);

// Verificar conexión
const { data, error } = await supabase.from('tms_usuarios').select('count');
console.log('Conexión OK:', !error);
```

### Problema: Permisos no se cargan

**Solución:**
```javascript
// Verificar que rol existe en BD
const { data } = await supabase
  .from('tms_roles')
  .select('*')
  .eq('id', user.rol);

console.log('Rol encontrado:', data);

// Refrescar permisos manualmente
const { refreshPermissions } = useAuth();
await refreshPermissions();
```

### Problema: Realtime no actualiza

**Solución:**
```javascript
// Verificar que tabla existe
const { data } = await supabase
  .from('tabla')
  .select('*')
  .limit(1);

// Verificar que REPLICA IDENTITY está configurado
// En Supabase: Settings → Replication → Habilitar tabla

// Verificar que canal está suscrito
const channel = supabase.channel('changes');
channel.on('postgres_changes', { event: '*', schema: 'public', table: 'tabla' }, callback);
const status = await channel.subscribe();
console.log('Status:', status);
```

### Problema: Build falla

**Solución:**
```bash
# Verificar errores de TypeScript
npm run build

# Limpiar y reconstruir
rm -rf dist
npm run build

# Verificar que no hay imports circulares
# Usar herramienta: npm install -D madge
madge --circular src/
```

### Problema: Estilos no aplican

**Solución:**
```javascript
// Verificar que Tailwind está importado
// En src/index.css:
@tailwind base;
@tailwind components;
@tailwind utilities;

// Verificar que clase existe
// Usar DevTools para inspeccionar

// Verificar que no hay conflicto de especificidad
// Usar !important como último recurso
<div className="bg-white !bg-blue-500">
```

### Problema: Componente no renderiza

**Solución:**
```javascript
// Verificar que componente está exportado
export default MiComponente;

// Verificar que está importado correctamente
import MiComponente from './MiComponente';

// Verificar que props son correctas
console.log('Props:', props);

// Verificar que no hay errores en render
// Usar React DevTools para inspeccionar
```

---

## 📚 Recursos Útiles

### Documentación
- [React Docs](https://react.dev)
- [Vite Docs](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Supabase Docs](https://supabase.com/docs)
- [React Router](https://reactrouter.com)

### Herramientas
- [VS Code](https://code.visualstudio.com)
- [React DevTools](https://react-devtools-tutorial.vercel.app)
- [Redux DevTools](https://github.com/reduxjs/redux-devtools)
- [Postman](https://www.postman.com)

### Extensiones VS Code Recomendadas
```
- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- Prettier - Code formatter
- ESLint
- Thunder Client (API testing)
```

---

## 🎯 Checklist de Desarrollo

Antes de hacer commit:

- [ ] Código sin errores en consola
- [ ] Estilos aplicados correctamente
- [ ] Funcionalidad probada en navegador
- [ ] Permisos validados
- [ ] Errores manejados
- [ ] Logs descriptivos
- [ ] Comentarios claros
- [ ] Nombres descriptivos
- [ ] Sin código comentado
- [ ] Sin console.log de debug

Antes de hacer push:

- [ ] Tests pasando (si aplica)
- [ ] Build sin errores
- [ ] Cambios documentados
- [ ] Commit message descriptivo
- [ ] Rama actualizada con main

---

**Última actualización:** Mayo 2026
**Versión:** 1.0.0
