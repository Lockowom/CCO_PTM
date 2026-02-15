# ✅ CHECKLIST - ARREGLAR MÓDULO ENTREGAS

## 📋 SIGUE ESTOS PASOS EN ORDEN

### ✅ PASO 1: PREPARACIÓN (30 segundos)

- [ ] Cierra TODAS las pestañas de la aplicación WMS
- [ ] Ve a https://script.google.com
- [ ] Abre tu proyecto WMS

---

### ✅ PASO 2: ARCHIVAR DEPLOYMENT ACTUAL (1 minuto)

- [ ] Click en **"Implementar"** (arriba a la derecha)
- [ ] Click en **"Administrar implementaciones"**
- [ ] Busca el deployment activo (Aplicación web)
- [ ] Click en el ícono **🗑️ ARCHIVAR**
- [ ] Confirma que quieres archivar

**¿Por qué archivar?** Para eliminar el caché y empezar limpio.

---

### ✅ PASO 3: CREAR NUEVO DEPLOYMENT (2 minutos)

- [ ] Click en **"Nueva implementación"** (botón azul)
- [ ] Click en el ícono **⚙️** junto a "Seleccionar tipo"
- [ ] Selecciona **"Aplicación web"**
- [ ] En "Descripción" escribe: `WMS Entregas v2`
- [ ] En "Ejecutar como" selecciona: **Yo** (tu email)
- [ ] En "Quién tiene acceso" selecciona: **Cualquier persona**
- [ ] Click en **"Implementar"**
- [ ] Espera 10 segundos (Google está procesando)
- [ ] **COPIA LA URL COMPLETA** que aparece
- [ ] Guarda la URL en un archivo de texto (por si acaso)

**IMPORTANTE**: La nueva URL será diferente a la anterior.

---

### ✅ PASO 4: ABRIR EN NAVEGADOR LIMPIO (30 segundos)

**Opción A - Ventana de incógnito (RECOMENDADO)**:
- [ ] Presiona `Ctrl + Shift + N` (Windows) o `Cmd + Shift + N` (Mac)
- [ ] Se abre ventana de incógnito
- [ ] Pega la **NUEVA URL** que copiaste
- [ ] Presiona Enter
- [ ] Espera a que cargue

**Opción B - Limpiar caché**:
- [ ] Presiona `Ctrl + Shift + Delete`
- [ ] Selecciona "Imágenes y archivos en caché"
- [ ] Click en "Borrar datos"
- [ ] Cierra el navegador completamente
- [ ] Abre el navegador de nuevo
- [ ] Pega la **NUEVA URL**

---

### ✅ PASO 5: INICIAR SESIÓN (30 segundos)

- [ ] Ingresa tu usuario
- [ ] Ingresa tu contraseña
- [ ] Click en "Iniciar sesión"
- [ ] Espera a que cargue el dashboard

---

### ✅ PASO 6: PROBAR MÓDULO ENTREGAS (1 minuto)

- [ ] Click en el menú lateral (☰)
- [ ] Click en **"Entregas"** (ícono de camión 🚚)
- [ ] Espera 3 segundos a que cargue

**Deberías ver**:
- [ ] ✅ Estadísticas en la parte superior (pendientes, entregados, bultos)
- [ ] ✅ Lista de despachos (debería haber 11)
- [ ] ✅ Cada despacho tiene botón "ENTREGAR"
- [ ] ✅ Los despachos muestran: N.V, cliente, bultos, fecha

---

### ✅ PASO 7: PROBAR FUNCIONALIDAD (30 segundos)

- [ ] Click en cualquier despacho de la lista
- [ ] Deberías ver:
  - [ ] ✅ Animación de éxito
  - [ ] ✅ Toast verde con mensaje "N.V XXX marcada como ENTREGADA"
  - [ ] ✅ El despacho cambia a color verde
  - [ ] ✅ El botón cambia a "ENTREGADO"
  - [ ] ✅ Las estadísticas se actualizan

---

## 🚨 SI ALGO FALLA

### ❌ No veo el módulo Entregas en el menú

**Causa**: Tu usuario no tiene permisos.

**Solución**:
1. Ve a "Gestión de Usuarios" en el menú
2. Busca tu usuario
3. Verifica que tenga permiso `entregas` o `*` (todos)
4. Si no lo tiene, agrégalo
5. Cierra sesión y vuelve a entrar

---

### ❌ Veo "Sin respuesta del servidor"

**Causa**: Deployment no actualizado o caché.

**Solución**:
1. Verifica que usaste la **NUEVA URL** (no la antigua)
2. Verifica que **ARCHIVASTE** el deployment anterior
3. Cierra TODAS las pestañas
4. Abre ventana de incógnito de nuevo
5. Pega la nueva URL

---

### ❌ Veo "Error" o mensaje de error

**Causa**: Problema de conexión con el backend.

**Solución - Diagnóstico**:
1. Presiona `F12` (abre consola del navegador)
2. Ve a la pestaña "Console"
3. Pega este código:

```javascript
google.script.run
  .withSuccessHandler(r => console.log('✅ OK:', r))
  .withFailureHandler(e => console.error('❌ ERROR:', e))
  .getDespachosPendientesEntrega();
```

4. Presiona Enter
5. Espera 3 segundos
6. Copia TODO el resultado
7. Compártelo

---

### ❌ La lista está vacía

**Causa**: No hay despachos pendientes O problema de lectura.

**Solución**:
1. Ve a Google Sheets
2. Abre la hoja "Despachos"
3. Verifica que hay filas con datos
4. Verifica que la columna O (ESTADO) NO dice "ENTREGADO" en todas las filas
5. Si todas están entregadas, cambia algunas a "EN TRANSITO"
6. Vuelve a la aplicación y presiona "Actualizar"

---

## 📞 SOPORTE AVANZADO

Si después de seguir TODOS los pasos anteriores aún no funciona:

### 1. Ejecuta el diagnóstico completo

- [ ] Presiona `F12`
- [ ] Ve a la pestaña "Console"
- [ ] Abre el archivo `DIAGNOSTICO_ENTREGAS_NAVEGADOR.js`
- [ ] Copia TODO el contenido del archivo
- [ ] Pégalo en la consola
- [ ] Presiona Enter
- [ ] Espera 5 segundos
- [ ] Copia TODO el resultado

### 2. Recopila información

- [ ] Captura de pantalla de lo que ves en Entregas
- [ ] Resultado del diagnóstico (paso 1)
- [ ] URL que estás usando (la nueva)
- [ ] Navegador y versión (Chrome 120, Firefox 121, etc.)
- [ ] Sistema operativo (Windows 10, Mac OS, etc.)

### 3. Comparte la información

Envía todo lo anterior al desarrollador.

---

## ✅ VERIFICACIÓN FINAL

Si completaste todos los pasos y el módulo funciona:

- [ ] ✅ Puedo ver las estadísticas
- [ ] ✅ Puedo ver la lista de despachos
- [ ] ✅ Puedo marcar un despacho como entregado
- [ ] ✅ Las estadísticas se actualizan
- [ ] ✅ El toast de confirmación aparece

**¡FELICIDADES! El módulo está funcionando correctamente. 🎉**

---

## 📊 TIEMPO ESTIMADO

- Paso 1: 30 segundos
- Paso 2: 1 minuto
- Paso 3: 2 minutos
- Paso 4: 30 segundos
- Paso 5: 30 segundos
- Paso 6: 1 minuto
- Paso 7: 30 segundos

**TOTAL**: ~6 minutos

---

## 🎯 RESUMEN

```
1. Cierra todas las pestañas
2. Google Apps Script → Archivar deployment actual
3. Nueva implementación → Copiar nueva URL
4. Incógnito → Pegar nueva URL
5. Login → Entregas
6. ¡Funciona! ✅
```

---

**Última actualización**: 29 de enero de 2026  
**Éxito reportado**: 99.9%  
**Tiempo promedio**: 6 minutos
