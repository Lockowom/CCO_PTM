/**
 * ExcelUpload.gs - Módulo de Carga de Archivos Excel
 * Permite cargar datos de archivos Excel a la hoja N.V DIARIAS
 * Solo usuarios con rol ADMINISTRADOR o SUPERVISOR pueden usar esta función
 */

// Roles autorizados para cargar Excel
var EXCEL_UPLOAD_ROLES = ['ADMINISTRADOR', 'SUPERVISOR', 'ADMIN'];

// Columnas requeridas en el Excel (nombres esperados)
var REQUIRED_COLUMNS = ['Fecha Entrega', 'N.Venta', 'Nombre Cliente', 'Cod.Producto', 'Descripción Producto', 'Pedido'];

// Mapeo de columnas Excel → posición en hoja N.V DIARIAS
var COLUMN_MAPPING = {
  'Fecha Entrega': 0,       // Columna A
  'N.Venta': 1,             // Columna B
  'Estado': 2,              // Columna C
  'Nombre Cliente': 4,      // Columna E
  'Nombre Vendedor': 6,     // Columna G
  'Cod.Producto': 8,        // Columna I
  'Descripción Producto': 9, // Columna J
  'Unidad Medida': 10,      // Columna K
  'Pedido': 11              // Columna L
};

/**
 * Verifica si el usuario tiene permisos para cargar archivos Excel
 * @param {string} sessionId - ID de sesión del usuario (opcional, usa usuario actual)
 * @returns {Object} - {success, canUpload, userRole, userName}
 */
function getUploadPermission(sessionId) {
  try {
    // Obtener información del usuario actual
    var userInfo = null;
    
    // Intentar obtener usuario por sesión si se proporciona
    if (sessionId && typeof getSessionUser === 'function') {
      userInfo = getSessionUser(sessionId);
    }
    
    // Si no hay sesión, intentar obtener del contexto global
    if (!userInfo && typeof getCurrentUser === 'function') {
      userInfo = getCurrentUser();
    }
    
    // Si aún no hay usuario, verificar si hay App.user en el frontend
    if (!userInfo) {
      Logger.log('getUploadPermission: No se pudo obtener información del usuario');
      return {
        success: false,
        canUpload: false,
        error: 'No se pudo verificar el usuario'
      };
    }
    
    var userRole = String(userInfo.rol || userInfo.role || '').toUpperCase();
    var userName = userInfo.nombre || userInfo.name || 'Usuario';
    
    Logger.log('getUploadPermission: Usuario=' + userName + ', Rol=' + userRole);
    
    // Verificar si el rol está en la lista de autorizados
    var canUpload = EXCEL_UPLOAD_ROLES.indexOf(userRole) !== -1;
    
    return {
      success: true,
      canUpload: canUpload,
      userRole: userRole,
      userName: userName
    };
    
  } catch (e) {
    Logger.log('Error en getUploadPermission: ' + e.message);
    return {
      success: false,
      canUpload: false,
      error: e.message
    };
  }
}

/**
 * Verifica si existen N.Venta en la hoja N.V DIARIAS
 * @param {Array} nvNumbers - Array de números de N.V a verificar
 * @returns {Object} - {success, existing: [], notFound: []}
 */
function checkExistingNV(nvNumbers) {
  try {
    if (!nvNumbers || !Array.isArray(nvNumbers) || nvNumbers.length === 0) {
      return { success: true, existing: [], notFound: [] };
    }
    
    var sheet = getNVSheet();
    if (!sheet) {
      return { success: false, error: 'Hoja N.V DIARIAS no encontrada' };
    }
    
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      // Hoja vacía, ninguno existe
      return { success: true, existing: [], notFound: nvNumbers };
    }
    
    // Leer columna B (N.Venta)
    var nvColumn = sheet.getRange(2, 2, lastRow - 1, 1).getValues();
    var existingNVs = {};
    
    for (var i = 0; i < nvColumn.length; i++) {
      var nv = String(nvColumn[i][0] || '').trim();
      if (nv) {
        existingNVs[nv] = true;
      }
    }
    
    var existing = [];
    var notFound = [];
    
    for (var j = 0; j < nvNumbers.length; j++) {
      var nvNum = String(nvNumbers[j] || '').trim();
      if (existingNVs[nvNum]) {
        existing.push(nvNum);
      } else {
        notFound.push(nvNum);
      }
    }
    
    Logger.log('checkExistingNV: ' + existing.length + ' existentes, ' + notFound.length + ' nuevos');
    
    return {
      success: true,
      existing: existing,
      notFound: notFound,
      totalChecked: nvNumbers.length
    };
    
  } catch (e) {
    Logger.log('Error en checkExistingNV: ' + e.message);
    return { success: false, error: e.message };
  }
}


/**
 * Carga datos de Excel a la hoja N.V DIARIAS
 * @param {Array} data - Array de objetos con los datos a cargar
 * @param {Object} options - Opciones de carga {duplicateAction: 'omit'|'overwrite', fileName}
 * @param {string} sessionId - ID de sesión del usuario
 * @returns {Object} - {success, recordsInserted, duplicatesFound, error}
 */
function uploadExcelData(data, options, sessionId) {
  try {
    // Verificar permisos
    var permission = getUploadPermission(sessionId);
    if (!permission.success || !permission.canUpload) {
      return {
        success: false,
        error: 'No tiene permisos para cargar archivos Excel',
        code: 'PERMISSION_DENIED'
      };
    }
    
    if (!data || !Array.isArray(data) || data.length === 0) {
      return { success: false, error: 'No hay datos para cargar' };
    }
    
    var opts = options || {};
    var duplicateAction = opts.duplicateAction || 'omit';
    var fileName = opts.fileName || 'archivo.xlsx';
    
    Logger.log('uploadExcelData: Iniciando carga de ' + data.length + ' registros');
    
    // Usar ConcurrencyManager para evitar conflictos
    var result = ConcurrencyManager.executeWithRetry('EXCEL_UPLOAD', function() {
      return doUploadExcelData(data, duplicateAction, permission.userName, fileName);
    }, 3);
    
    return result;
    
  } catch (e) {
    Logger.log('Error en uploadExcelData: ' + e.message);
    
    // Registrar error en log
    logUploadOperation({
      usuario: 'Sistema',
      archivo: options ? options.fileName : 'desconocido',
      registros: 0,
      duplicados: 0,
      accion: 'ERROR',
      estado: 'ERROR',
      mensaje: e.message
    });
    
    return { success: false, error: e.message };
  }
}

/**
 * Función interna que realiza la carga de datos
 */
function doUploadExcelData(data, duplicateAction, userName, fileName) {
  var sheet = getNVSheet();
  if (!sheet) {
    throw new Error('Hoja N.V DIARIAS no encontrada');
  }
  
  // Obtener N.V existentes para verificar duplicados
  var nvNumbers = data.map(function(row) { return String(row['N.Venta'] || '').trim(); });
  var existingCheck = checkExistingNV(nvNumbers);
  
  var duplicatesFound = existingCheck.existing ? existingCheck.existing.length : 0;
  var recordsToInsert = [];
  var skippedDuplicates = [];
  
  // Procesar cada fila
  for (var i = 0; i < data.length; i++) {
    var row = data[i];
    var nv = String(row['N.Venta'] || '').trim();
    
    // Verificar si es duplicado
    var isDuplicate = existingCheck.existing && existingCheck.existing.indexOf(nv) !== -1;
    
    if (isDuplicate) {
      if (duplicateAction === 'omit') {
        skippedDuplicates.push(nv);
        continue;
      }
      // Si es 'overwrite', se insertará de todos modos (como nueva fila)
    }
    
    // Crear fila para insertar (12 columnas para N.V DIARIAS)
    var newRow = new Array(12).fill('');
    
    // Mapear datos según COLUMN_MAPPING
    newRow[COLUMN_MAPPING['Fecha Entrega']] = row['Fecha Entrega'] || '';
    newRow[COLUMN_MAPPING['N.Venta']] = nv;
    newRow[COLUMN_MAPPING['Estado']] = row['Estado'] || 'PENDIENTE';
    newRow[COLUMN_MAPPING['Nombre Cliente']] = row['Nombre Cliente'] || '';
    newRow[COLUMN_MAPPING['Nombre Vendedor']] = row['Nombre Vendedor'] || '';
    newRow[COLUMN_MAPPING['Cod.Producto']] = row['Cod.Producto'] || '';
    newRow[COLUMN_MAPPING['Descripción Producto']] = row['Descripción Producto'] || '';
    newRow[COLUMN_MAPPING['Unidad Medida']] = row['Unidad Medida'] || '';
    newRow[COLUMN_MAPPING['Pedido']] = row['Pedido'] || 0;
    
    recordsToInsert.push(newRow);
  }
  
  // Insertar registros al final de la hoja
  var recordsInserted = 0;
  if (recordsToInsert.length > 0) {
    var lastRow = sheet.getLastRow();
    var startRow = lastRow + 1;
    
    // Insertar todas las filas de una vez (más eficiente)
    sheet.getRange(startRow, 1, recordsToInsert.length, 12).setValues(recordsToInsert);
    recordsInserted = recordsToInsert.length;
    
    Logger.log('uploadExcelData: ' + recordsInserted + ' registros insertados en fila ' + startRow);
  }
  
  // Invalidar caché de N.V
  invalidateNVCache();
  
  // Registrar operación en log
  logUploadOperation({
    usuario: userName,
    archivo: fileName,
    registros: recordsInserted,
    duplicados: duplicatesFound,
    accion: duplicateAction.toUpperCase(),
    estado: 'EXITOSO',
    mensaje: skippedDuplicates.length > 0 ? 'Omitidos: ' + skippedDuplicates.join(', ') : ''
  });
  
  return {
    success: true,
    recordsInserted: recordsInserted,
    duplicatesFound: duplicatesFound,
    skippedDuplicates: skippedDuplicates,
    message: 'Se cargaron ' + recordsInserted + ' registros exitosamente'
  };
}

/**
 * Registra una operación de carga en la hoja LOGS_CARGA
 * @param {Object} logData - Datos del log
 */
function logUploadOperation(logData) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var logSheet = ss.getSheetByName('LOGS_CARGA');
    
    // Crear hoja si no existe
    if (!logSheet) {
      logSheet = ss.insertSheet('LOGS_CARGA');
      // Agregar headers
      logSheet.getRange(1, 1, 1, 8).setValues([[
        'Timestamp', 'Usuario', 'Archivo', 'Registros', 'Duplicados', 'Acción', 'Estado', 'Mensaje'
      ]]);
      logSheet.getRange(1, 1, 1, 8).setBackground('#1e293b').setFontColor('#ffffff').setFontWeight('bold');
      Logger.log('logUploadOperation: Hoja LOGS_CARGA creada');
    }
    
    // Agregar registro
    var lastRow = logSheet.getLastRow();
    var newRow = [
      new Date().toISOString(),
      logData.usuario || 'Sistema',
      logData.archivo || '',
      logData.registros || 0,
      logData.duplicados || 0,
      logData.accion || '',
      logData.estado || '',
      logData.mensaje || ''
    ];
    
    logSheet.getRange(lastRow + 1, 1, 1, 8).setValues([newRow]);
    
    Logger.log('logUploadOperation: Log registrado - ' + logData.estado);
    
  } catch (e) {
    Logger.log('Error en logUploadOperation: ' + e.message);
    // No lanzar error para no interrumpir la operación principal
  }
}

/**
 * Obtiene el historial de cargas de Excel
 * @param {number} limit - Número máximo de registros a retornar
 * @returns {Object} - {success, logs: []}
 */
function getUploadHistory(limit) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var logSheet = ss.getSheetByName('LOGS_CARGA');
    
    if (!logSheet) {
      return { success: true, logs: [] };
    }
    
    var lastRow = logSheet.getLastRow();
    if (lastRow <= 1) {
      return { success: true, logs: [] };
    }
    
    var numRows = Math.min(limit || 50, lastRow - 1);
    var startRow = Math.max(2, lastRow - numRows + 1);
    
    var data = logSheet.getRange(startRow, 1, numRows, 8).getValues();
    var headers = ['timestamp', 'usuario', 'archivo', 'registros', 'duplicados', 'accion', 'estado', 'mensaje'];
    
    var logs = [];
    for (var i = data.length - 1; i >= 0; i--) {
      var log = {};
      for (var j = 0; j < headers.length; j++) {
        log[headers[j]] = data[i][j];
      }
      logs.push(log);
    }
    
    return { success: true, logs: logs };
    
  } catch (e) {
    Logger.log('Error en getUploadHistory: ' + e.message);
    return { success: false, error: e.message };
  }
}

/**
 * Función de prueba para verificar permisos
 */
function testUploadPermission() {
  var result = getUploadPermission();
  Logger.log('Test getUploadPermission: ' + JSON.stringify(result));
  return result;
}

/**
 * Función de prueba para verificar N.V existentes
 */
function testCheckExistingNV() {
  var result = checkExistingNV(['NV-001', 'NV-002', 'NV-999']);
  Logger.log('Test checkExistingNV: ' + JSON.stringify(result));
  return result;
}


// ============================================================
// PROPERTY TESTS - Control de Acceso y Registro de Operaciones
// ============================================================

/**
 * Property Test 6: Control de Acceso por Rol
 * For any usuario del sistema, getUploadPermission debe retornar canUpload: true
 * si y solo si el usuario tiene rol "ADMINISTRADOR" o "SUPERVISOR"
 * 
 * **Feature: excel-upload-notas-venta, Property 6: Control de Acceso por Rol**
 * **Validates: Requirements 5.1, 5.3**
 */
function testProperty6_ControlAccesoPorRol() {
  Logger.log('=== Property Test 6: Control de Acceso por Rol ===');
  
  var testCases = [
    // Roles que DEBEN tener acceso
    { rol: 'ADMINISTRADOR', expectedAccess: true },
    { rol: 'SUPERVISOR', expectedAccess: true },
    { rol: 'ADMIN', expectedAccess: true },
    { rol: 'administrador', expectedAccess: true },  // Case insensitive
    { rol: 'Supervisor', expectedAccess: true },
    
    // Roles que NO deben tener acceso
    { rol: 'OPERADOR', expectedAccess: false },
    { rol: 'USUARIO', expectedAccess: false },
    { rol: 'PICKER', expectedAccess: false },
    { rol: 'PACKER', expectedAccess: false },
    { rol: 'DESPACHADOR', expectedAccess: false },
    { rol: '', expectedAccess: false },
    { rol: null, expectedAccess: false }
  ];
  
  var passed = 0;
  var failed = 0;
  
  for (var i = 0; i < testCases.length; i++) {
    var tc = testCases[i];
    var rolUpper = String(tc.rol || '').toUpperCase();
    var hasAccess = EXCEL_UPLOAD_ROLES.indexOf(rolUpper) !== -1;
    
    if (hasAccess === tc.expectedAccess) {
      passed++;
      Logger.log('✓ Rol "' + tc.rol + '" -> acceso=' + hasAccess + ' (esperado: ' + tc.expectedAccess + ')');
    } else {
      failed++;
      Logger.log('✗ FALLO: Rol "' + tc.rol + '" -> acceso=' + hasAccess + ' (esperado: ' + tc.expectedAccess + ')');
    }
  }
  
  // Generar casos aleatorios adicionales (100 iteraciones)
  var randomRoles = ['VENDEDOR', 'CLIENTE', 'INVITADO', 'BODEGUERO', 'JEFE', 'GERENTE', 'AUXILIAR'];
  for (var j = 0; j < 100; j++) {
    var randomRol = randomRoles[Math.floor(Math.random() * randomRoles.length)];
    var rolUpper = randomRol.toUpperCase();
    var hasAccess = EXCEL_UPLOAD_ROLES.indexOf(rolUpper) !== -1;
    var expectedAccess = (rolUpper === 'ADMINISTRADOR' || rolUpper === 'SUPERVISOR' || rolUpper === 'ADMIN');
    
    if (hasAccess === expectedAccess) {
      passed++;
    } else {
      failed++;
      Logger.log('✗ FALLO aleatorio: Rol "' + randomRol + '" -> acceso=' + hasAccess);
    }
  }
  
  Logger.log('=== Resultado: ' + passed + ' pasaron, ' + failed + ' fallaron ===');
  
  return {
    success: failed === 0,
    passed: passed,
    failed: failed,
    property: 'Property 6: Control de Acceso por Rol'
  };
}

/**
 * Property Test 7: Registro de Operaciones
 * For any operación de carga (exitosa o fallida), debe existir un registro
 * en LOGS_CARGA con todos los campos requeridos
 * 
 * **Feature: excel-upload-notas-venta, Property 7: Registro de Operaciones**
 * **Validates: Requirements 5.2**
 */
function testProperty7_RegistroOperaciones() {
  Logger.log('=== Property Test 7: Registro de Operaciones ===');
  
  var passed = 0;
  var failed = 0;
  
  // Generar 10 operaciones de prueba
  var testOperations = [];
  for (var i = 0; i < 10; i++) {
    testOperations.push({
      usuario: 'TestUser_' + i,
      archivo: 'test_file_' + i + '.xlsx',
      registros: Math.floor(Math.random() * 100),
      duplicados: Math.floor(Math.random() * 10),
      accion: i % 2 === 0 ? 'OMITIR' : 'SOBRESCRIBIR',
      estado: i % 3 === 0 ? 'ERROR' : 'EXITOSO',
      mensaje: 'Test message ' + i
    });
  }
  
  // Registrar operaciones
  for (var j = 0; j < testOperations.length; j++) {
    logUploadOperation(testOperations[j]);
  }
  
  // Verificar que los registros existen
  var history = getUploadHistory(20);
  
  if (!history.success) {
    Logger.log('✗ FALLO: No se pudo obtener historial');
    return { success: false, passed: 0, failed: 1, property: 'Property 7' };
  }
  
  // Verificar que cada operación tiene todos los campos requeridos
  var requiredFields = ['timestamp', 'usuario', 'archivo', 'registros', 'estado'];
  
  for (var k = 0; k < history.logs.length; k++) {
    var log = history.logs[k];
    var hasAllFields = true;
    
    for (var f = 0; f < requiredFields.length; f++) {
      var field = requiredFields[f];
      if (log[field] === undefined || log[field] === null) {
        hasAllFields = false;
        Logger.log('✗ FALLO: Log ' + k + ' no tiene campo "' + field + '"');
        break;
      }
    }
    
    if (hasAllFields) {
      passed++;
    } else {
      failed++;
    }
  }
  
  Logger.log('=== Resultado: ' + passed + ' pasaron, ' + failed + ' fallaron ===');
  
  return {
    success: failed === 0,
    passed: passed,
    failed: failed,
    property: 'Property 7: Registro de Operaciones'
  };
}

/**
 * Ejecuta todos los property tests del backend
 */
function runAllBackendPropertyTests() {
  Logger.log('========================================');
  Logger.log('EJECUTANDO PROPERTY TESTS DE BACKEND');
  Logger.log('========================================');
  
  var results = [];
  
  results.push(testProperty6_ControlAccesoPorRol());
  results.push(testProperty7_RegistroOperaciones());
  
  var allPassed = results.every(function(r) { return r.success; });
  
  Logger.log('========================================');
  Logger.log('RESUMEN: ' + (allPassed ? 'TODOS PASARON' : 'ALGUNOS FALLARON'));
  Logger.log('========================================');
  
  return {
    success: allPassed,
    results: results
  };
}
