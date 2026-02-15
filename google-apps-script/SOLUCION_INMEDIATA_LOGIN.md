# 🔥 SOLUCIÓN INMEDIATA - Problema de Login y Permisos

## ⚡ ACCIÓN RÁPIDA (2 minutos)

### Paso 1: Ejecutar Script de Arreglo
1. Abre el **Editor de Google Apps Script**
2. Busca el archivo **`FIX_LOGIN_PERMISOS.gs`**
3. Selecciona la función **`fixLoginPermisos`** en el menú desplegable
4. Haz clic en el botón **▶️ Ejecutar**
5. Espera a que termine (verás "Ejecución completada")

### Paso 2: Revisar Logs
1. Ve a **Ver → Registros** (o presiona Ctrl+Enter)
2. Busca el mensaje: **"🎉 ¡TODO ESTÁ CORRECTO!"**
3. Si ves errores, copia los logs y repórtalos

### Paso 3: Probar Login
1. Abre la aplicación en el navegador
2. **Cierra sesión** si estás logueado
3. **Limpia el caché** del navegador (Ctrl+Shift+Delete) o usa modo incógnito
4. **Inicia sesión** nuevamente
5. Intenta acceder a un módulo (ej: Inventario, Picking, Entregas)

---

## ✅ ¿Qué hace el script?

El script `fixLoginPermisos()` automáticamente:

1. ✅ Verifica que la hoja **USUARIOS** existe y tiene datos correctos
2. ✅ Verifica que la hoja **ROLES** existe (la crea si falta)
3. ✅ Crea 8 roles por defecto con sus permisos:
   - ADMIN (acceso total)
   - ADMINISTRADOR (acceso total)
   - SUPERVISOR (casi todo)
   - COORDINADOR (operaciones)
   - OPERADOR (operaciones básicas)
   - USUARIO (consultas)
   - CHOFER (entregas)
   - BODEGUERO (bodega)
4. ✅ Verifica que todos los usuarios tienen roles válidos
5. ✅ Limpia sesiones antiguas (>24 horas)
6. ✅ Muestra un reporte detallado de lo que arregló

---

## 🆘 Si el problema persiste

### Opción A: Diagnóstico Avanzado
```javascript
// Ejecutar en Google Apps Script
diagnosticoAvanzado()
```
Esto te dará información detallada sobre qué está fallando.

### Opción B: Dar Permisos de Admin de Emergencia
```javascript
// Ejecutar en Google Apps Script
darPermisosAdmin('tu@email.com')
```
Esto te da acceso completo inmediatamente.

### Opción C: Revisar Consola del Navegador
1. Abre la aplicación
2. Presiona **F12** para abrir Developer Tools
3. Ve a la pestaña **Console**
4. Busca errores en rojo
5. Ejecuta estos comandos para ver el estado:
```javascript
console.log('App:', App);
console.log('User:', App.user);
console.log('Permisos:', App.user.permisos);
console.log('SessionId:', App.sessionId);
```

---

## 📋 Verificación Manual

### Verificar Hoja ROLES
1. Abre el Google Spreadsheet
2. Busca la pestaña **"ROLES"** en la parte inferior
3. Debe tener esta estructura:

| Rol | Permisos | Color |
|-----|----------|-------|
| ADMIN | * | #ef4444 |
| ADMINISTRADOR | * | #ef4444 |
| SUPERVISOR | dashboard,inventory,reception,picking,packing,dispatch,shipping,delivery,entregas,entregas-enhanced,reports,consultas,lotes-series,layout,notas-venta,transfers,user-management,role-management,admin | #f59e0b |
| OPERADOR | dashboard,inventory,reception,picking,packing,dispatch,shipping,delivery,entregas,entregas-enhanced,consultas,lotes-series | #10b981 |

### Verificar Hoja USUARIOS
1. Abre la pestaña **"USUARIOS"**
2. Verifica que tu usuario tiene un **ROL** asignado
3. El ROL debe coincidir con uno de los roles en la hoja ROLES

---

## 🎯 Resultado Esperado

Después de ejecutar el script y reiniciar sesión:

✅ Puedes iniciar sesión sin problemas  
✅ Ves el dashboard correctamente  
✅ El menú lateral muestra los módulos permitidos  
✅ Puedes acceder a los módulos sin error "No tienes permisos"  
✅ No ves pantallas en blanco  

---

## 📞 Soporte Adicional

Si después de seguir estos pasos el problema persiste:

1. **Copia los logs** del script `fixLoginPermisos()`
2. **Copia los errores** de la consola del navegador (F12)
3. **Toma una captura** de la hoja ROLES
4. **Toma una captura** de tu usuario en la hoja USUARIOS
5. Reporta el problema con toda esta información

---

## 📚 Documentación Completa

Para más detalles, consulta:
- **Spec completo:** `.kiro/specs/login-permissions-fix/`
- **Diagnóstico detallado:** `DIAGNOSTICO_LOGIN_COMPLETO.md`
- **Script de arreglo:** `FIX_LOGIN_PERMISOS.gs`

---

**Fecha:** 30/01/2026  
**Estado:** ✅ SOLUCIÓN LISTA PARA EJECUTAR  
**Tiempo estimado:** 2-5 minutos  
**Dificultad:** Fácil (solo ejecutar un script)
