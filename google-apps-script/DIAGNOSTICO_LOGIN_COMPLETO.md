# 🔍 DIAGNÓSTICO COMPLETO - PROBLEMA DE LOGIN

## 📊 ESTADO ACTUAL

Basado en la captura de pantalla y el código revisado:

**Síntoma**: El usuario puede ver el dashboard pero aparece el mensaje "No tienes permisos para acceder a este módulo"

**Causa Raíz**: El sistema de permisos no está cargando correctamente después del login exitoso.

---

## 🔎 ANÁLISIS DEL FLUJO DE LOGIN

### 1. Login Exitoso ✅
El login funciona correctamente:
- `authenticateUser()` en `Auth.gs` valida credenciales
- Retorna `{success: true, user: {...}, sessionId: "..."}`
- La sesión se crea correctamente

### 2. Problema en Carga de Permisos ❌
El problema está en `Login_Success_Handler.html`:

```javascript
// Cargar permisos
if (typeof PermissionManager !== 'undefined') {
  PermissionManager.loadPermissions(function (result) {
    // ...
  });
}
```

**Problema**: `PermissionManager` puede no estar definido o la función `loadPermissions()` falla.

### 3. Problema en Verificación de Permisos ❌
Cuando el usuario intenta acceder a un módulo, el sistema verifica permisos pero:
- Los permisos no se cargaron correctamente
- El usuario no tiene `App.user.permisos` definido
- Resultado: "No tienes permisos"

---

## 🛠️ SOLUCIONES

### SOLUCIÓN 1: Verificar y Arreglar Permisos del Usuario (RÁPIDA)

Ejecuta esta función desde Google Apps Script:

```javascript
function verificarYArreglarPermisos() {
  try {
    Logger.log('=== VERIFICAR PERMISOS ===');
    
    var ss = getSpreadsheet();
    var userSheet = ss.getSheetByName('USUARIOS');
    
    if (!userSheet) {
      Logger.log('ERROR: Hoja USUARIOS no encontrada');
      return;
    }
    
    var data = userSheet.getDataRange().getValues();
    Logger.log('Usuarios encontrados: ' + (data.length - 1));
    
    // Mostrar todos los usuarios y sus roles
    for (var i = 1; i < data.length; i++) {
      var email = data[i][1];
      var rol = data[i][4];
      var activo = data[i][6];
      
      Logger.log('Usuario ' + i + ':');
      Logger.log('  Email: ' + email);
      Logger.log('  Rol: ' + rol);
      Logger.log('  Activo: ' + activo);
      
      // Verificar permisos del rol
      var permisos = getRolePermissions(rol);
      Logger.log('  Permisos: ' + JSON.stringify(permisos));
    }
    
    // Verificar hoja de ROLES
    var roleSheet = ss.getSheetByName('ROLES');
    if (!roleSheet) {
      Logger.log('⚠️ ADVERTENCIA: Hoja ROLES no encontrada');
      Logger.log('Creando hoja ROLES con permisos por defecto...');
      crearHojaRolesDefault();
    } else {
      Logger.log('✅ Hoja ROLES existe');
      var roleData = roleSheet.getDataRange().getValues();
      Logger.log('Roles definidos: ' + (roleData.length - 1));
      
      for (var j = 1; j < roleData.length; j++) {
        Logger.log('Rol: ' + roleData[j][0] + ' | Permisos: ' + roleData[j][1]);
      }
    }
    
  } catch (error) {
    Logger.log('ERROR: ' + error.message);
  }
}

function crearHojaRolesDefault() {
  try {
    var ss = getSpreadsheet();
    var roleSheet = ss.insertSheet('ROLES');
    
    // Headers
    roleSheet.getRange(1, 1, 1, 3).setValues([['Rol', 'Permisos', 'Color']]);
    
    // Roles por defecto
    var roles = [
      ['ADMIN', '*', '#ef4444'],
      ['ADMINISTRADOR', '*', '#ef4444'],
      ['SUPERVISOR', 'dashboard,inventory,reception,picking,packing,dispatch,shipping,delivery,entregas,reports,consultas,lotes-series,layout,notas-venta,transfers', '#f59e0b'],
      ['COORDINADOR', 'dashboard,inventory,reception,picking,packing,dispatch,shipping,delivery,entregas,reports,consultas,lotes-series', '#3b82f6'],
      ['OPERADOR', 'dashboard,inventory,reception,picking,packing,dispatch,shipping,delivery,entregas,consultas', '#10b981'],
      ['USUARIO', 'dashboard,entregas,consultas', '#6366f1']
    ];
    
    roleSheet.getRange(2, 1, roles.length, 3).setValues(roles);
    
    Logger.log('✅ Hoja ROLES creada con permisos por defecto');
    
  } catch (error) {
    Logger.log('ERROR creando hoja ROLES: ' + error.message);
  }
}
```

### SOLUCIÓN 2: Arreglar PermissionManager (COMPLETA)

El problema puede estar en que `PermissionManager` no está cargando correctamente. Necesitas verificar:

1. **Verificar que existe el archivo con PermissionManager**
   - Busca en tu proyecto: `WMS_Components_JS.html` o similar
   - Debe contener la definición de `PermissionManager`

2. **Verificar que se incluye en Index.html**
   ```html
   <?!= include('WMS_Components_JS') ?>
   ```

3. **Verificar la función getUserPermissions en Auth.gs**
   - Ya existe y está correcta
   - Retorna permisos basados en el rol del usuario

### SOLUCIÓN 3: Bypass Temporal para Administradores (EMERGENCIA)

Si necesitas acceso inmediato, modifica `Login_Success_Handler.html`:

```javascript
// Después de guardar en sessionStorage, agregar:
if (sanitizedUser.rol === 'ADMIN' || sanitizedUser.rol === 'ADMINISTRADOR') {
  // Dar permisos completos a administradores
  App.user.permisos = ['*'];
  App.user.vistas = ['*'];
  sessionStorage.setItem('userPermissions', JSON.stringify(['*']));
}
```

---

## 🔧 PASOS PARA RESOLVER

### PASO 1: Ejecutar Diagnóstico

1. Abre Google Apps Script
2. Copia la función `verificarYArreglarPermisos()` de arriba
3. Pégala en `Auth.gs` o `Code.gs`
4. Ejecuta la función
5. Revisa los logs (Ver → Registros)

### PASO 2: Verificar Resultado

Los logs deben mostrar:
- ✅ Usuarios con sus roles
- ✅ Hoja ROLES existe
- ✅ Cada rol tiene permisos definidos

Si falta la hoja ROLES, la función la creará automáticamente.

### PASO 3: Probar Login

1. Cierra sesión
2. Vuelve a iniciar sesión
3. Intenta acceder a un módulo
4. Debe funcionar correctamente

### PASO 4: Si Persiste el Problema

Abre la consola del navegador (F12) y busca errores:

```javascript
// En la consola del navegador, ejecuta:
console.log('App:', App);
console.log('User:', App.user);
console.log('Permisos:', App.user.permisos);
console.log('SessionId:', App.sessionId);
```

Esto te dirá exactamente qué está faltando.

---

## 📝 VERIFICACIÓN FINAL

Después de aplicar las soluciones, verifica:

- [ ] El usuario puede iniciar sesión
- [ ] El dashboard se muestra correctamente
- [ ] El menú lateral muestra los módulos permitidos
- [ ] Al hacer click en un módulo, se carga correctamente
- [ ] No aparece el mensaje "No tienes permisos"

---

## 🆘 SI NADA FUNCIONA

Ejecuta esta función de emergencia que da permisos completos al usuario actual:

```javascript
function darPermisosEmergencia(email) {
  try {
    var ss = getSpreadsheet();
    var userSheet = ss.getSheetByName('USUARIOS');
    var data = userSheet.getDataRange().getValues();
    
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][1]).trim().toLowerCase() === email.toLowerCase()) {
        // Cambiar rol a ADMIN
        userSheet.getRange(i + 1, 5).setValue('ADMIN');
        Logger.log('✅ Usuario ' + email + ' ahora es ADMIN');
        return 'OK';
      }
    }
    
    Logger.log('ERROR: Usuario no encontrado');
    return 'ERROR';
    
  } catch (error) {
    Logger.log('ERROR: ' + error.message);
    return 'ERROR';
  }
}

// Uso: darPermisosEmergencia('tu@email.com')
```

---

**Fecha**: 30/01/2026  
**Estado**: 🔴 PROBLEMA IDENTIFICADO - SOLUCIONES DISPONIBLES
