/**
 * FIX_LOGIN_PERMISOS.gs
 * Script para arreglar problemas de permisos después del login
 * 
 * INSTRUCCIONES:
 * 1. Copia este archivo completo a tu proyecto de Google Apps Script
 * 2. Ejecuta la función principal: fixLoginPermisos()
 * 3. Revisa los logs para ver qué se arregló
 * 4. Prueba hacer login nuevamente
 */

/**
 * FUNCIÓN PRINCIPAL - EJECUTAR ESTA
 * Arregla todos los problemas comunes de permisos
 */
function fixLoginPermisos() {
  Logger.log('╔════════════════════════════════════════════════════════╗');
  Logger.log('║     FIX LOGIN PERMISOS - DIAGNÓSTICO Y REPARACIÓN     ║');
  Logger.log('╚════════════════════════════════════════════════════════╝');
  Logger.log('');
  
  var problemas = [];
  var solucionados = [];
  
  // 1. Verificar hoja USUARIOS
  Logger.log('1️⃣ Verificando hoja USUARIOS...');
  var checkUsuarios = verificarHojaUsuarios();
  if (!checkUsuarios.ok) {
    problemas.push('Hoja USUARIOS: ' + checkUsuarios.error);
  } else {
    solucionados.push('Hoja USUARIOS: OK (' + checkUsuarios.total + ' usuarios)');
  }
  
  // 2. Verificar hoja ROLES
  Logger.log('');
  Logger.log('2️⃣ Verificando hoja ROLES...');
  var checkRoles = verificarHojaRoles();
  if (!checkRoles.ok) {
    problemas.push('Hoja ROLES: ' + checkRoles.error);
    Logger.log('   ⚠️ Creando hoja ROLES...');
    crearHojaRolesCompleta();
    solucionados.push('Hoja ROLES: CREADA con permisos por defecto');
  } else {
    solucionados.push('Hoja ROLES: OK (' + checkRoles.total + ' roles)');
  }
  
  // 3. Verificar permisos de cada usuario
  Logger.log('');
  Logger.log('3️⃣ Verificando permisos de usuarios...');
  var checkPermisos = verificarPermisosUsuarios();
  if (checkPermisos.sinPermisos > 0) {
    problemas.push('Usuarios sin permisos: ' + checkPermisos.sinPermisos);
  } else {
    solucionados.push('Permisos de usuarios: OK');
  }
  
  // 4. Verificar función getUserPermissions
  Logger.log('');
  Logger.log('4️⃣ Verificando función getUserPermissions...');
  var checkFunction = verificarFuncionPermisos();
  if (!checkFunction.ok) {
    problemas.push('Función getUserPermissions: ' + checkFunction.error);
  } else {
    solucionados.push('Función getUserPermissions: OK');
  }
  
  // 5. Limpiar sesiones antiguas
  Logger.log('');
  Logger.log('5️⃣ Limpiando sesiones antiguas...');
  var cleaned = limpiarSesionesAntiguas();
  solucionados.push('Sesiones limpiadas: ' + cleaned);
  
  // RESUMEN
  Logger.log('');
  Logger.log('╔════════════════════════════════════════════════════════╗');
  Logger.log('║                      RESUMEN                           ║');
  Logger.log('╚════════════════════════════════════════════════════════╝');
  Logger.log('');
  
  if (solucionados.length > 0) {
    Logger.log('✅ SOLUCIONADO:');
    solucionados.forEach(function(item) {
      Logger.log('   • ' + item);
    });
  }
  
  if (problemas.length > 0) {
    Logger.log('');
    Logger.log('⚠️ PROBLEMAS ENCONTRADOS:');
    problemas.forEach(function(item) {
      Logger.log('   • ' + item);
    });
  } else {
    Logger.log('');
    Logger.log('🎉 ¡TODO ESTÁ CORRECTO!');
  }
  
  Logger.log('');
  Logger.log('╔════════════════════════════════════════════════════════╗');
  Logger.log('║              PRÓXIMOS PASOS                            ║');
  Logger.log('╚════════════════════════════════════════════════════════╝');
  Logger.log('');
  Logger.log('1. Cierra sesión en la aplicación');
  Logger.log('2. Vuelve a iniciar sesión');
  Logger.log('3. Intenta acceder a los módulos');
  Logger.log('');
  Logger.log('Si el problema persiste, ejecuta: diagnosticoAvanzado()');
  Logger.log('');
}

/**
 * Verifica la hoja USUARIOS
 */
function verificarHojaUsuarios() {
  try {
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName('USUARIOS');
    
    if (!sheet) {
      return { ok: false, error: 'Hoja no encontrada' };
    }
    
    var data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return { ok: false, error: 'Hoja vacía' };
    }
    
    // Verificar columnas requeridas
    var headers = data[0];
    var requiredCols = ['ID', 'EMAIL', 'PASSWORD', 'NOMBRE', 'ROL'];
    var missingCols = [];
    
    requiredCols.forEach(function(col) {
      var found = false;
      for (var i = 0; i < headers.length; i++) {
        if (String(headers[i]).toUpperCase().indexOf(col) !== -1) {
          found = true;
          break;
        }
      }
      if (!found) missingCols.push(col);
    });
    
    if (missingCols.length > 0) {
      return { ok: false, error: 'Columnas faltantes: ' + missingCols.join(', ') };
    }
    
    return { ok: true, total: data.length - 1 };
    
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

/**
 * Verifica la hoja ROLES
 */
function verificarHojaRoles() {
  try {
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName('ROLES');
    
    if (!sheet) {
      return { ok: false, error: 'Hoja no encontrada' };
    }
    
    var data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return { ok: false, error: 'Hoja vacía' };
    }
    
    return { ok: true, total: data.length - 1 };
    
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

/**
 * Crea la hoja ROLES con permisos completos
 */
function crearHojaRolesCompleta() {
  try {
    var ss = getSpreadsheet();
    
    // Eliminar hoja ROLES si existe
    var existingSheet = ss.getSheetByName('ROLES');
    if (existingSheet) {
      ss.deleteSheet(existingSheet);
    }
    
    // Crear nueva hoja
    var roleSheet = ss.insertSheet('ROLES');
    
    // Headers
    roleSheet.getRange(1, 1, 1, 3).setValues([['Rol', 'Permisos', 'Color']]);
    roleSheet.getRange(1, 1, 1, 3).setFontWeight('bold');
    roleSheet.getRange(1, 1, 1, 3).setBackground('#f3f4f6');
    
    // Roles con TODOS los permisos
    var roles = [
      ['ADMIN', '*', '#ef4444'],
      ['ADMINISTRADOR', '*', '#ef4444'],
      ['SUPERVISOR', 'dashboard,inventory,reception,picking,packing,dispatch,shipping,delivery,entregas,entregas-enhanced,reports,consultas,lotes-series,layout,notas-venta,transfers,user-management,role-management,admin', '#f59e0b'],
      ['COORDINADOR', 'dashboard,inventory,reception,picking,packing,dispatch,shipping,delivery,entregas,entregas-enhanced,reports,consultas,lotes-series,layout,notas-venta,transfers', '#3b82f6'],
      ['OPERADOR', 'dashboard,inventory,reception,picking,packing,dispatch,shipping,delivery,entregas,entregas-enhanced,consultas,lotes-series', '#10b981'],
      ['USUARIO', 'dashboard,entregas,entregas-enhanced,consultas', '#6366f1'],
      ['CHOFER', 'dashboard,entregas,entregas-enhanced', '#8b5cf6'],
      ['BODEGUERO', 'dashboard,inventory,reception,picking,packing,dispatch,consultas,lotes-series,layout', '#06b6d4']
    ];
    
    roleSheet.getRange(2, 1, roles.length, 3).setValues(roles);
    
    // Ajustar anchos de columna
    roleSheet.setColumnWidth(1, 150);
    roleSheet.setColumnWidth(2, 600);
    roleSheet.setColumnWidth(3, 100);
    
    Logger.log('   ✅ Hoja ROLES creada con ' + roles.length + ' roles');
    
  } catch (error) {
    Logger.log('   ❌ Error creando hoja ROLES: ' + error.message);
  }
}

/**
 * Verifica permisos de todos los usuarios
 */
function verificarPermisosUsuarios() {
  try {
    var ss = getSpreadsheet();
    var userSheet = ss.getSheetByName('USUARIOS');
    var roleSheet = ss.getSheetByName('ROLES');
    
    if (!userSheet || !roleSheet) {
      return { ok: false, sinPermisos: 0 };
    }
    
    var userData = userSheet.getDataRange().getValues();
    var roleData = roleSheet.getDataRange().getValues();
    
    // Crear mapa de roles
    var rolesMap = {};
    for (var i = 1; i < roleData.length; i++) {
      var roleName = String(roleData[i][0]).toUpperCase().trim();
      var permisos = String(roleData[i][1] || '');
      rolesMap[roleName] = permisos;
    }
    
    var sinPermisos = 0;
    
    // Verificar cada usuario
    for (var j = 1; j < userData.length; j++) {
      var userRol = String(userData[j][4] || '').toUpperCase().trim();
      var email = userData[j][1];
      
      if (!rolesMap[userRol]) {
        Logger.log('   ⚠️ Usuario ' + email + ' tiene rol "' + userRol + '" sin permisos definidos');
        sinPermisos++;
      } else {
        Logger.log('   ✅ Usuario ' + email + ' (' + userRol + ') tiene permisos');
      }
    }
    
    return { ok: true, sinPermisos: sinPermisos };
    
  } catch (error) {
    return { ok: false, error: error.message, sinPermisos: 0 };
  }
}

/**
 * Verifica que la función getUserPermissions existe y funciona
 */
function verificarFuncionPermisos() {
  try {
    // Verificar que la función existe
    if (typeof getUserPermissions !== 'function') {
      return { ok: false, error: 'Función no encontrada' };
    }
    
    // Probar con una sesión de prueba
    var testResult = getUserPermissions('TEST-SESSION');
    
    if (!testResult) {
      return { ok: false, error: 'Función no retorna resultado' };
    }
    
    Logger.log('   ✅ Función getUserPermissions existe y responde');
    return { ok: true };
    
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

/**
 * Limpia sesiones antiguas (más de 24 horas)
 */
function limpiarSesionesAntiguas() {
  try {
    var ss = getSpreadsheet();
    var sessionSheet = ss.getSheetByName('SESIONES');
    
    if (!sessionSheet) {
      return 0;
    }
    
    var data = sessionSheet.getDataRange().getValues();
    var cleaned = 0;
    var now = new Date();
    
    for (var i = data.length - 1; i >= 1; i--) {
      var fechaCreacion = data[i][3];
      if (fechaCreacion) {
        var diff = now - new Date(fechaCreacion);
        var hours = diff / (1000 * 60 * 60);
        
        if (hours > 24) {
          sessionSheet.deleteRow(i + 1);
          cleaned++;
        }
      }
    }
    
    Logger.log('   ✅ ' + cleaned + ' sesiones antiguas eliminadas');
    return cleaned;
    
  } catch (error) {
    Logger.log('   ⚠️ Error limpiando sesiones: ' + error.message);
    return 0;
  }
}

/**
 * DIAGNÓSTICO AVANZADO
 * Ejecutar si el problema persiste después de fixLoginPermisos()
 */
function diagnosticoAvanzado() {
  Logger.log('╔════════════════════════════════════════════════════════╗');
  Logger.log('║           DIAGNÓSTICO AVANZADO DE LOGIN               ║');
  Logger.log('╚════════════════════════════════════════════════════════╝');
  Logger.log('');
  
  // 1. Probar login completo
  Logger.log('1️⃣ Probando login completo...');
  var ss = getSpreadsheet();
  var userSheet = ss.getSheetByName('USUARIOS');
  var data = userSheet.getDataRange().getValues();
  
  if (data.length > 1) {
    var testEmail = data[1][1];
    Logger.log('   Probando con usuario: ' + testEmail);
    
    // Intentar login (necesitarás la contraseña correcta)
    Logger.log('   ⚠️ Para probar login completo, ejecuta:');
    Logger.log('   authenticateUser("' + testEmail + '", "tu_password")');
  }
  
  // 2. Verificar estructura de datos
  Logger.log('');
  Logger.log('2️⃣ Verificando estructura de datos...');
  Logger.log('   Usuarios: ' + (data.length - 1));
  
  var roleSheet = ss.getSheetByName('ROLES');
  if (roleSheet) {
    var roleData = roleSheet.getDataRange().getValues();
    Logger.log('   Roles: ' + (roleData.length - 1));
  }
  
  var sessionSheet = ss.getSheetByName('SESIONES');
  if (sessionSheet) {
    var sessionData = sessionSheet.getDataRange().getValues();
    Logger.log('   Sesiones activas: ' + (sessionData.length - 1));
  }
  
  // 3. Verificar funciones críticas
  Logger.log('');
  Logger.log('3️⃣ Verificando funciones críticas...');
  var funciones = [
    'authenticateUser',
    'getUserPermissions',
    'validateSession',
    'getUserBySession',
    'getRolePermissions'
  ];
  
  funciones.forEach(function(func) {
    if (typeof eval(func) === 'function') {
      Logger.log('   ✅ ' + func + ' existe');
    } else {
      Logger.log('   ❌ ' + func + ' NO EXISTE');
    }
  });
  
  Logger.log('');
  Logger.log('╔════════════════════════════════════════════════════════╗');
  Logger.log('║                  FIN DIAGNÓSTICO                       ║');
  Logger.log('╚════════════════════════════════════════════════════════╝');
}

/**
 * DAR PERMISOS DE ADMIN A UN USUARIO
 * Uso: darPermisosAdmin('email@ejemplo.com')
 */
function darPermisosAdmin(email) {
  try {
    if (!email) {
      Logger.log('ERROR: Email requerido');
      Logger.log('Uso: darPermisosAdmin("email@ejemplo.com")');
      return;
    }
    
    var ss = getSpreadsheet();
    var userSheet = ss.getSheetByName('USUARIOS');
    var data = userSheet.getDataRange().getValues();
    
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][1]).trim().toLowerCase() === email.toLowerCase()) {
        userSheet.getRange(i + 1, 5).setValue('ADMIN');
        Logger.log('✅ Usuario ' + email + ' ahora es ADMIN');
        Logger.log('   Cierra sesión y vuelve a iniciar sesión');
        return;
      }
    }
    
    Logger.log('❌ Usuario no encontrado: ' + email);
    Logger.log('Usuarios disponibles:');
    for (var j = 1; j < data.length; j++) {
      Logger.log('   • ' + data[j][1]);
    }
    
  } catch (error) {
    Logger.log('ERROR: ' + error.message);
  }
}
