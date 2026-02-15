/**
 * Diagnostico.gs
 * Script para diagnosticar problemas del sistema
 * 
 * Ejecuta runFullDiagnostic() para obtener un reporte completo
 */

/**
 * Ejecuta un diagnóstico completo del sistema
 */
function runFullDiagnostic() {
  Logger.log('='.repeat(60));
  Logger.log('DIAGNÓSTICO COMPLETO DEL SISTEMA');
  Logger.log('='.repeat(60));
  Logger.log('');
  
  // 1. Verificar SPREADSHEET_ID
  Logger.log('1. VERIFICANDO SPREADSHEET_ID...');
  const spreadsheetCheck = checkSpreadsheetId();
  logResult(spreadsheetCheck);
  Logger.log('');
  
  // 2. Verificar hojas
  Logger.log('2. VERIFICANDO HOJAS...');
  const sheetsCheck = checkSheets();
  logResult(sheetsCheck);
  Logger.log('');
  
  // 3. Verificar usuario admin
  Logger.log('3. VERIFICANDO USUARIO ADMIN...');
  const adminCheck = checkAdminUser();
  logResult(adminCheck);
  Logger.log('');
  
  // 4. Verificar funciones principales
  Logger.log('4. VERIFICANDO FUNCIONES PRINCIPALES...');
  const functionsCheck = checkMainFunctions();
  logResult(functionsCheck);
  Logger.log('');
  
  // 5. Probar autenticación
  Logger.log('5. PROBANDO AUTENTICACIÓN...');
  const authCheck = testAuthentication();
  logResult(authCheck);
  Logger.log('');
  
  // 6. Probar getDashboardMetrics
  Logger.log('6. PROBANDO getDashboardMetrics()...');
  const dashboardCheck = testDashboardMetrics();
  logResult(dashboardCheck);
  Logger.log('');
  
  // Resumen final
  Logger.log('='.repeat(60));
  Logger.log('RESUMEN DEL DIAGNÓSTICO');
  Logger.log('='.repeat(60));
  
  const allChecks = [
    spreadsheetCheck,
    sheetsCheck,
    adminCheck,
    functionsCheck,
    authCheck,
    dashboardCheck
  ];
  
  const passed = allChecks.filter(c => c.success).length;
  const total = allChecks.length;
  
  Logger.log('Pruebas pasadas: ' + passed + '/' + total);
  
  if (passed === total) {
    Logger.log('');
    Logger.log('✅ ¡SISTEMA FUNCIONANDO CORRECTAMENTE!');
    Logger.log('');
    Logger.log('Puedes hacer login con:');
    Logger.log('  Email: admin@sistema.com');
    Logger.log('  Password: admin123');
  } else {
    Logger.log('');
    Logger.log('⚠️ SE ENCONTRARON PROBLEMAS');
    Logger.log('');
    Logger.log('Revisa los detalles arriba y sigue las recomendaciones.');
  }
  
  Logger.log('='.repeat(60));
}

/**
 * Verifica que el SPREADSHEET_ID esté configurado
 */
function checkSpreadsheetId() {
  try {
    if (!SPREADSHEET_ID || SPREADSHEET_ID === 'TU_SPREADSHEET_ID_AQUI') {
      return {
        success: false,
        message: 'SPREADSHEET_ID no configurado',
        recommendation: 'Abre Code.gs y configura el SPREADSHEET_ID con tu ID real'
      };
    }
    
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const name = ss.getName();
    
    return {
      success: true,
      message: 'SPREADSHEET_ID configurado correctamente',
      details: 'Spreadsheet: ' + name
    };
    
  } catch (error) {
    return {
      success: false,
      message: 'Error al acceder al spreadsheet',
      error: error.message,
      recommendation: 'Verifica que el SPREADSHEET_ID sea correcto y tengas permisos'
    };
  }
}

/**
 * Verifica que todas las hojas necesarias existan
 */
function checkSheets() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const requiredSheets = [
      'Usuarios',
      'Órdenes',
      'Inventario',
      'Recepciones',
      'Guias',
      'Despachos',
      'Entregas',
      'Sesiones'
    ];
    
    const existingSheets = ss.getSheets().map(s => s.getName());
    const missingSheets = requiredSheets.filter(s => !existingSheets.includes(s));
    
    if (missingSheets.length > 0) {
      return {
        success: false,
        message: 'Faltan ' + missingSheets.length + ' hoja(s)',
        details: 'Hojas faltantes: ' + missingSheets.join(', '),
        recommendation: 'Ejecuta la función setupSheets() para crear las hojas'
      };
    }
    
    return {
      success: true,
      message: 'Todas las hojas existen',
      details: 'Encontradas: ' + existingSheets.join(', ')
    };
    
  } catch (error) {
    return {
      success: false,
      message: 'Error al verificar hojas',
      error: error.message
    };
  }
}

/**
 * Verifica que el usuario admin exista
 */
function checkAdminUser() {
  try {
    const users = findRows('Usuarios', { Email: 'admin@sistema.com' });
    
    if (users.length === 0) {
      return {
        success: false,
        message: 'Usuario admin no existe',
        recommendation: 'Ejecuta la función fixAdminUser() para crear el usuario admin'
      };
    }
    
    const admin = users[0];
    
    if (admin.data.Activo !== 'SI') {
      return {
        success: false,
        message: 'Usuario admin existe pero está inactivo',
        recommendation: 'Ejecuta fixAdminUser() para activar el usuario'
      };
    }
    
    return {
      success: true,
      message: 'Usuario admin existe y está activo',
      details: 'Nombre: ' + admin.data.Nombre + ', Rol: ' + admin.data.Rol
    };
    
  } catch (error) {
    return {
      success: false,
      message: 'Error al verificar usuario admin',
      error: error.message
    };
  }
}

/**
 * Verifica que las funciones principales existan
 */
function checkMainFunctions() {
  try {
    const functions = [
      'authenticateUser',
      'getDashboardMetrics',
      'getOrderStats',
      'getInventoryStats',
      'getReceptionStats',
      'getDispatchStats',
      'getDeliveryStats',
      'getAllRows',
      'findRows',
      'insertRow'
    ];
    
    const missing = [];
    
    functions.forEach(funcName => {
      try {
        const func = eval(funcName);
        if (typeof func !== 'function') {
          missing.push(funcName);
        }
      } catch (e) {
        missing.push(funcName);
      }
    });
    
    if (missing.length > 0) {
      return {
        success: false,
        message: 'Faltan ' + missing.length + ' función(es)',
        details: 'Funciones faltantes: ' + missing.join(', '),
        recommendation: 'Verifica que todos los archivos .gs estén copiados correctamente'
      };
    }
    
    return {
      success: true,
      message: 'Todas las funciones principales existen'
    };
    
  } catch (error) {
    return {
      success: false,
      message: 'Error al verificar funciones',
      error: error.message
    };
  }
}

/**
 * Prueba la autenticación
 */
function testAuthentication() {
  try {
    const result = authenticateUser('admin@sistema.com', 'admin123');
    
    if (!result.success) {
      return {
        success: false,
        message: 'Autenticación falló',
        error: result.error,
        recommendation: 'Ejecuta fixAdminUser() para arreglar el usuario admin'
      };
    }
    
    return {
      success: true,
      message: 'Autenticación exitosa',
      details: 'Usuario: ' + result.user.nombre + ', SessionID: ' + result.sessionId
    };
    
  } catch (error) {
    return {
      success: false,
      message: 'Error al probar autenticación',
      error: error.message
    };
  }
}

/**
 * Prueba getDashboardMetrics
 */
function testDashboardMetrics() {
  try {
    const result = getDashboardMetrics();
    
    if (!result.success) {
      return {
        success: false,
        message: 'getDashboardMetrics() falló',
        error: result.error,
        recommendation: 'Verifica que todos los módulos .gs estén copiados'
      };
    }
    
    return {
      success: true,
      message: 'getDashboardMetrics() funciona correctamente',
      details: 'Órdenes: ' + (result.orders.total || 0) + 
               ', Productos: ' + (result.inventory.totalProducts || 0) +
               ', Alertas: ' + (result.alerts.length || 0)
    };
    
  } catch (error) {
    return {
      success: false,
      message: 'Error al ejecutar getDashboardMetrics()',
      error: error.message,
      recommendation: 'Verifica que Dashboard.gs y todos los módulos dependientes estén copiados'
    };
  }
}

/**
 * Función auxiliar para mostrar resultados
 */
function logResult(result) {
  if (result.success) {
    Logger.log('  ✅ ' + result.message);
    if (result.details) {
      Logger.log('     ' + result.details);
    }
  } else {
    Logger.log('  ❌ ' + result.message);
    if (result.error) {
      Logger.log('     Error: ' + result.error);
    }
    if (result.details) {
      Logger.log('     ' + result.details);
    }
    if (result.recommendation) {
      Logger.log('     💡 Recomendación: ' + result.recommendation);
    }
  }
}

/**
 * Diagnóstico rápido - solo lo esencial
 */
function quickDiagnostic() {
  Logger.log('DIAGNÓSTICO RÁPIDO');
  Logger.log('-'.repeat(40));
  
  // SPREADSHEET_ID
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    Logger.log('✅ Spreadsheet: ' + ss.getName());
  } catch (e) {
    Logger.log('❌ SPREADSHEET_ID incorrecto o sin acceso');
    return;
  }
  
  // Hojas
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheets = ss.getSheets().map(s => s.getName());
  Logger.log('✅ Hojas: ' + sheets.length + ' encontradas');
  
  // Usuario admin
  try {
    const users = findRows('Usuarios', { Email: 'admin@sistema.com' });
    if (users.length > 0) {
      Logger.log('✅ Usuario admin existe');
    } else {
      Logger.log('❌ Usuario admin NO existe - ejecuta fixAdminUser()');
    }
  } catch (e) {
    Logger.log('❌ Error al buscar usuario: ' + e.message);
  }
  
  // Autenticación
  try {
    const auth = authenticateUser('admin@sistema.com', 'admin123');
    if (auth.success) {
      Logger.log('✅ Login funciona');
    } else {
      Logger.log('❌ Login falla: ' + auth.error);
    }
  } catch (e) {
    Logger.log('❌ Error en autenticación: ' + e.message);
  }
  
  Logger.log('-'.repeat(40));
}
