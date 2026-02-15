# ✅ CHECKLIST - Arreglar Problema de Login y Permisos

## 🎯 Objetivo
Resolver el error "No tienes permisos para acceder a este módulo" después del login.

---

## 📋 FASE 1: EJECUCIÓN DEL FIX (2 minutos)

### ☐ Paso 1: Abrir Google Apps Script
- [ ] Abre el proyecto en Google Apps Script
- [ ] Localiza el archivo `FIX_LOGIN_PERMISOS.gs`
- [ ] Verifica que el archivo contiene la función `fixLoginPermisos()`

### ☐ Paso 2: Ejecutar Script de Arreglo
- [ ] Selecciona `fixLoginPermisos` en el menú desplegable de funciones
- [ ] Haz clic en el botón **▶️ Ejecutar**
- [ ] Espera a que aparezca "Ejecución completada"
- [ ] **Tiempo estimado:** 30-60 segundos

### ☐ Paso 3: Revisar Logs de Ejecución
- [ ] Ve a **Ver → Registros** (o Ctrl+Enter)
- [ ] Busca el encabezado: `FIX LOGIN PERMISOS - DIAGNÓSTICO Y REPARACIÓN`
- [ ] Verifica que aparezca: `🎉 ¡TODO ESTÁ CORRECTO!`
- [ ] Si hay problemas, anota los mensajes de error

**Logs esperados:**
```
✅ SOLUCIONADO:
   • Hoja USUARIOS: OK (X usuarios)
   • Hoja ROLES: CREADA con permisos por defecto
   • Permisos de usuarios: OK
   • Función getUserPermissions: OK
   • Sesiones limpiadas: X
```

---

## 📊 FASE 2: VERIFICACIÓN DE DATOS (1 minuto)

### ☐ Paso 4: Verificar Hoja ROLES
- [ ] Abre el Google Spreadsheet
- [ ] Busca la pestaña **"ROLES"** en la parte inferior
- [ ] Verifica que contiene al menos 8 roles:
  - [ ] ADMIN
  - [ ] ADMINISTRADOR
  - [ ] SUPERVISOR
  - [ ] COORDINADOR
  - [ ] OPERADOR
  - [ ] USUARIO
  - [ ] CHOFER
  - [ ] BODEGUERO
- [ ] Verifica que cada rol tiene permisos en la columna "Permisos"
- [ ] Verifica que ADMIN tiene `*` como permiso

### ☐ Paso 5: Verificar Hoja USUARIOS
- [ ] Abre la pestaña **"USUARIOS"**
- [ ] Localiza tu usuario (busca tu email)
- [ ] Verifica que tienes un **ROL** asignado
- [ ] Verifica que el ROL existe en la hoja ROLES
- [ ] Verifica que la columna **ACTIVO** dice "SI"

---

## 🧪 FASE 3: PRUEBA DE LOGIN (2 minutos)

### ☐ Paso 6: Preparar Navegador
- [ ] Abre la aplicación en el navegador
- [ ] Si estás logueado, **cierra sesión**
- [ ] Limpia el caché del navegador:
  - **Chrome/Edge:** Ctrl+Shift+Delete → Borrar caché e imágenes
  - **Firefox:** Ctrl+Shift+Delete → Caché
  - **O usa modo incógnito:** Ctrl+Shift+N
- [ ] Cierra todas las pestañas de la aplicación

### ☐ Paso 7: Iniciar Sesión
- [ ] Abre la aplicación en una nueva pestaña
- [ ] Ingresa tu email
- [ ] Ingresa tu contraseña
- [ ] Haz clic en "Iniciar Sesión"
- [ ] Verifica que el login es exitoso
- [ ] Verifica que ves el dashboard

### ☐ Paso 8: Probar Acceso a Módulos
- [ ] Verifica que el menú lateral muestra módulos
- [ ] Haz clic en **"Inventario"** (o cualquier módulo permitido)
- [ ] Verifica que el módulo carga correctamente
- [ ] **NO** debe aparecer "No tienes permisos"
- [ ] Prueba al menos 2-3 módulos diferentes

**Módulos a probar (según tu rol):**
- [ ] Dashboard
- [ ] Inventario
- [ ] Picking
- [ ] Packing
- [ ] Entregas
- [ ] Consultas

---

## 🔍 FASE 4: DIAGNÓSTICO (Solo si hay problemas)

### ☐ Paso 9: Revisar Consola del Navegador
- [ ] Presiona **F12** para abrir Developer Tools
- [ ] Ve a la pestaña **"Console"**
- [ ] Busca errores en rojo
- [ ] Copia cualquier error que veas

**Comandos de diagnóstico (ejecutar en consola):**
```javascript
console.log('App:', App);
console.log('User:', App.user);
console.log('Permisos:', App.user.permisos);
console.log('SessionId:', App.sessionId);
```

### ☐ Paso 10: Ejecutar Diagnóstico Avanzado
- [ ] Vuelve a Google Apps Script
- [ ] Selecciona función `diagnosticoAvanzado`
- [ ] Ejecuta la función
- [ ] Revisa los logs detallados
- [ ] Anota cualquier función que diga "NO EXISTE"

### ☐ Paso 11: Acceso de Emergencia (si nada funciona)
- [ ] En Google Apps Script, selecciona `darPermisosAdmin`
- [ ] Ejecuta la función
- [ ] Cuando pida el email, ingresa tu email
- [ ] Verifica que diga "Usuario X ahora es ADMIN"
- [ ] Cierra sesión y vuelve a iniciar sesión

---

## ✅ VERIFICACIÓN FINAL

### Checklist de Éxito
- [ ] ✅ Puedo iniciar sesión sin problemas
- [ ] ✅ Veo el dashboard correctamente
- [ ] ✅ El menú lateral muestra módulos
- [ ] ✅ Puedo acceder a los módulos sin error
- [ ] ✅ No veo "No tienes permisos" en módulos permitidos
- [ ] ✅ La aplicación funciona normalmente

### Si TODO está ✅
**¡Felicitaciones! El problema está resuelto.**

### Si algo está ❌
**Continúa con la sección de Soporte.**

---

## 🆘 SOPORTE ADICIONAL

### Información a Recopilar
Si el problema persiste, recopila esta información:

1. **Logs del Script:**
   - [ ] Copia completa de los logs de `fixLoginPermisos()`
   - [ ] Copia completa de los logs de `diagnosticoAvanzado()`

2. **Errores del Navegador:**
   - [ ] Captura de pantalla de errores en consola (F12)
   - [ ] Copia de los comandos de diagnóstico ejecutados

3. **Datos del Sistema:**
   - [ ] Captura de pantalla de la hoja ROLES
   - [ ] Captura de pantalla de tu usuario en USUARIOS
   - [ ] Tu rol asignado: _______________

4. **Comportamiento Observado:**
   - [ ] ¿Puedes iniciar sesión? Sí / No
   - [ ] ¿Ves el dashboard? Sí / No
   - [ ] ¿Qué módulo intentaste acceder? _______________
   - [ ] ¿Qué error exacto aparece? _______________

### Recursos de Ayuda
- 📄 **Guía rápida:** `SOLUCION_INMEDIATA_LOGIN.md`
- 📄 **Diagnóstico completo:** `DIAGNOSTICO_LOGIN_COMPLETO.md`
- 📄 **Script de arreglo:** `FIX_LOGIN_PERMISOS.gs`
- 📁 **Spec completo:** `.kiro/specs/login-permissions-fix/`

---

## 📊 RESUMEN DE TIEMPO

| Fase | Tiempo Estimado | Estado |
|------|-----------------|--------|
| Fase 1: Ejecución del Fix | 2 min | ⬜ |
| Fase 2: Verificación de Datos | 1 min | ⬜ |
| Fase 3: Prueba de Login | 2 min | ⬜ |
| Fase 4: Diagnóstico (si necesario) | 5 min | ⬜ |
| **TOTAL** | **5-10 min** | |

---

## 📝 NOTAS

### Notas de Ejecución
```
Fecha: _______________
Hora: _______________
Usuario: _______________
Resultado: ⬜ Éxito  ⬜ Problemas

Observaciones:
_________________________________
_________________________________
_________________________________
```

### Problemas Encontrados
```
Problema 1: _________________________________
Solución: _________________________________

Problema 2: _________________________________
Solución: _________________________________
```

---

**Última actualización:** 2026-01-30  
**Versión:** 1.0  
**Dificultad:** ⭐ Fácil  
**Tiempo total:** 5-10 minutos
