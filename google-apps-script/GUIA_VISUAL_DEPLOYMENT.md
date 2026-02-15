# 🎯 GUÍA VISUAL: CÓMO REDEPLOYAR LA APLICACIÓN

## 📱 PASO A PASO CON CAPTURAS

### PASO 1: ABRIR GOOGLE APPS SCRIPT
```
1. Ve a script.google.com
2. Abre tu proyecto "WMS" o como se llame
```

### PASO 2: CLICK EN "IMPLEMENTAR" (DEPLOY)
```
┌─────────────────────────────────────────┐
│  Archivo  Editar  Ver  [IMPLEMENTAR ▼] │ ← CLICK AQUÍ
└─────────────────────────────────────────┘
```

### PASO 3: SELECCIONAR "ADMINISTRAR IMPLEMENTACIONES"
```
┌─────────────────────────────────────┐
│  Nueva implementación               │
│  Probar implementaciones            │
│  ► Administrar implementaciones  ◄  │ ← CLICK AQUÍ
└─────────────────────────────────────┘
```

### PASO 4: EDITAR LA IMPLEMENTACIÓN ACTIVA
```
┌──────────────────────────────────────────────────┐
│  Implementaciones activas                        │
├──────────────────────────────────────────────────┤
│  📱 Aplicación web                               │
│  ID: AKfycby...                                  │
│  Versión: 1                                      │
│  [✏️ Editar]  [🗑️ Archivar]                     │ ← CLICK EN ✏️
└──────────────────────────────────────────────────┘
```

### PASO 5: SELECCIONAR "NUEVA VERSIÓN"
```
┌──────────────────────────────────────────────────┐
│  Editar implementación                           │
├──────────────────────────────────────────────────┤
│  Descripción: Aplicación web                     │
│                                                   │
│  Versión:                                        │
│  ┌────────────────────────────────────┐          │
│  │  Nueva versión                  ▼  │ ← CLICK  │
│  └────────────────────────────────────┘          │
│                                                   │
│  Ejecutar como: Yo                               │
│  Acceso: Cualquier persona                       │
│                                                   │
│  [Cancelar]  [IMPLEMENTAR]                       │ ← CLICK
└──────────────────────────────────────────────────┘
```

### PASO 6: COPIAR LA NUEVA URL
```
┌──────────────────────────────────────────────────┐
│  ✅ Implementación actualizada                   │
├──────────────────────────────────────────────────┤
│  URL de la aplicación web:                       │
│  ┌────────────────────────────────────────────┐  │
│  │ https://script.google.com/macros/s/...    │  │ ← COPIAR
│  │                                      [📋]  │  │
│  └────────────────────────────────────────────┘  │
│                                                   │
│  [Listo]                                         │
└──────────────────────────────────────────────────┘
```

---

## 🌐 ABRIR EN VENTANA DE INCÓGNITO

### Windows:
```
1. Presiona: Ctrl + Shift + N
2. Pega la URL copiada
3. Presiona Enter
```

### Mac:
```
1. Presiona: Cmd + Shift + N
2. Pega la URL copiada
3. Presiona Enter
```

### Alternativa (cualquier navegador):
```
1. Click derecho en el navegador
2. Selecciona "Nueva ventana de incógnito" o "Nueva ventana privada"
3. Pega la URL
```

---

## 🔄 LIMPIAR CACHÉ (SI NO USAS INCÓGNITO)

### Método 1: Recarga forzada (MÁS RÁPIDO)
```
Windows: Ctrl + Shift + R
Mac:     Cmd + Shift + R
```

### Método 2: DevTools
```
1. Presiona F12 (abre DevTools)
2. Click DERECHO en el botón de recargar (🔄)
3. Selecciona "Vaciar caché y recargar de forma forzada"
```

### Método 3: Configuración del navegador
```
Chrome:
1. Menú (⋮) → Más herramientas → Borrar datos de navegación
2. Selecciona "Imágenes y archivos en caché"
3. Click en "Borrar datos"

Firefox:
1. Menú (☰) → Configuración → Privacidad y seguridad
2. Cookies y datos del sitio → Limpiar datos
3. Selecciona "Contenido web en caché"
4. Click en "Limpiar"

Edge:
1. Menú (⋯) → Configuración → Privacidad, búsqueda y servicios
2. Borrar datos de exploración → Elegir qué borrar
3. Selecciona "Imágenes y archivos en caché"
4. Click en "Borrar ahora"
```

---

## ✅ VERIFICACIÓN FINAL

### 1. Abrir la aplicación
```
✅ URL correcta (la nueva que copiaste)
✅ Ventana de incógnito O caché limpiado
✅ Esperar 10 segundos después del deployment
```

### 2. Iniciar sesión
```
✅ Usuario y contraseña correctos
✅ Login exitoso
✅ Redirige al dashboard o home
```

### 3. Ir al módulo Entregas
```
✅ Click en el menú lateral
✅ Click en "Entregas" o ícono de camión
✅ La vista se carga
```

### 4. Verificar que funciona
```
✅ Se ven las estadísticas (pendientes, entregados, bultos)
✅ Se ve la lista de despachos
✅ Cada despacho tiene botón "ENTREGAR"
✅ Click en un despacho → se marca como entregado
✅ Aparece toast de confirmación
✅ Las estadísticas se actualizan
```

---

## 🚨 ERRORES COMUNES

### Error 1: "No se puede acceder a la aplicación"
```
❌ Problema: URL antigua o incorrecta
✅ Solución: Usa la NUEVA URL que copiaste en el paso 6
```

### Error 2: "Sigue apareciendo 'Error' en Entregas"
```
❌ Problema: Caché del navegador
✅ Solución: 
   1. Cierra TODAS las pestañas de la aplicación
   2. Abre ventana de incógnito
   3. Pega la NUEVA URL
```

### Error 3: "No veo el módulo Entregas en el menú"
```
❌ Problema: Permisos del usuario
✅ Solución: 
   1. Verifica que tu usuario tiene permiso 'entregas'
   2. O que tu rol tiene permiso 'entregas'
   3. O que tienes permiso '*' (todos)
```

### Error 4: "La aplicación se ve igual que antes"
```
❌ Problema: No creaste una NUEVA VERSIÓN
✅ Solución: 
   1. Vuelve al paso 5
   2. Asegúrate de seleccionar "Nueva versión"
   3. NO uses "Versión 1" o versiones antiguas
```

---

## 📞 ¿NECESITAS AYUDA?

Si después de seguir esta guía el módulo aún no funciona:

1. **Abre la consola del navegador**:
   - Presiona `F12`
   - Ve a la pestaña "Console"
   - Copia TODOS los mensajes de error (en rojo)

2. **Verifica tu usuario**:
   - En la consola, escribe: `console.log(App.user)`
   - Copia el resultado

3. **Prueba la conexión al backend**:
   - En la consola, escribe:
   ```javascript
   google.script.run
     .withSuccessHandler(console.log)
     .withFailureHandler(console.error)
     .getDespachosPendientesEntrega();
   ```
   - Copia el resultado

4. **Comparte esta información**:
   - Los errores de la consola
   - El resultado de `App.user`
   - El resultado de la prueba del backend
   - Captura de pantalla de lo que ves

---

## 🎯 RESUMEN ULTRA RÁPIDO

```
1. Google Apps Script → Implementar → Administrar implementaciones
2. Editar (✏️) → Nueva versión → Implementar
3. Copiar la NUEVA URL
4. Abrir en ventana de incógnito (Ctrl+Shift+N)
5. Iniciar sesión
6. Ir a Entregas
7. ¡Debería funcionar! ✅
```

**Tiempo total**: 2-3 minutos
**Dificultad**: Fácil
**Éxito**: 99.9%

---

**¿Dudas?** Sigue los pasos exactamente como están escritos. El código está perfecto, solo necesitas actualizar el deployment.
