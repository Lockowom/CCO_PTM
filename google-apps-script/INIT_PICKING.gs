/**
 * ============================================================
 * INICIALIZAR PICKING - Agregar columnas USER_RESPONSABLE
 * Ejecutar una vez para preparar la hoja PICKING
 * ============================================================
 */

/**
 * Inicializa la hoja PICKING con las nuevas columnas
 * Ejecutar este script desde el editor de Apps Script
 */
function inicializarHojaPicking() {
  Logger.log('=== INICIALIZAR HOJA PICKING ===');
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetPicking = ss.getSheetByName('PICKING');
  
  if (!sheetPicking) {
    // Crear la hoja si no existe
    sheetPicking = ss.insertSheet('PICKING');
    sheetPicking.appendRow([
      'Fecha Entrega N.Venta', 'N.Venta', 'Estado', 'Cod.Cliente', 'Nombre Cliente',
      'Cod.Vendedor', 'Nombre Vendedor', 'Zona', 'Cod.Producto', 'Descripcion Producto',
      'Unidad Medida', 'Pedido', 'USER_RESPONSABLE', 'FECHA_INICIO_PICKING'
    ]);
    sheetPicking.getRange(1, 1, 1, 14).setFontWeight('bold').setBackground('#2980b9').setFontColor('white');
    Logger.log('✅ Hoja PICKING creada con todas las columnas');
    return;
  }
  
  // Verificar columnas existentes
  var lastCol = sheetPicking.getLastColumn();
  Logger.log('Columnas actuales: ' + lastCol);
  
  // Agregar columna USER_RESPONSABLE si no existe (columna 13 = M)
  if (lastCol < 13) {
    sheetPicking.getRange(1, 13).setValue('USER_RESPONSABLE');
    sheetPicking.getRange(1, 13).setFontWeight('bold').setBackground('#2980b9').setFontColor('white');
    Logger.log('✅ Columna USER_RESPONSABLE agregada (col 13)');
  } else {
    var headerM = sheetPicking.getRange(1, 13).getValue();
    if (headerM !== 'USER_RESPONSABLE') {
      sheetPicking.getRange(1, 13).setValue('USER_RESPONSABLE');
      Logger.log('✅ Encabezado columna 13 actualizado a USER_RESPONSABLE');
    } else {
      Logger.log('✓ Columna USER_RESPONSABLE ya existe');
    }
  }
  
  // Agregar columna FECHA_INICIO_PICKING si no existe (columna 14 = N)
  if (lastCol < 14) {
    sheetPicking.getRange(1, 14).setValue('FECHA_INICIO_PICKING');
    sheetPicking.getRange(1, 14).setFontWeight('bold').setBackground('#2980b9').setFontColor('white');
    Logger.log('✅ Columna FECHA_INICIO_PICKING agregada (col 14)');
  } else {
    var headerN = sheetPicking.getRange(1, 14).getValue();
    if (headerN !== 'FECHA_INICIO_PICKING') {
      sheetPicking.getRange(1, 14).setValue('FECHA_INICIO_PICKING');
      Logger.log('✅ Encabezado columna 14 actualizado a FECHA_INICIO_PICKING');
    } else {
      Logger.log('✓ Columna FECHA_INICIO_PICKING ya existe');
    }
  }
  
  SpreadsheetApp.flush();
  Logger.log('✅ Hoja PICKING inicializada correctamente');
  Logger.log('=== FIN ===');
}

/**
 * Ver estructura actual de la hoja PICKING
 */
function verEstructuraPicking() {
  Logger.log('=== ESTRUCTURA HOJA PICKING ===');
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetPicking = ss.getSheetByName('PICKING');
  
  if (!sheetPicking) {
    Logger.log('❌ Hoja PICKING no existe');
    return;
  }
  
  var headers = sheetPicking.getRange(1, 1, 1, sheetPicking.getLastColumn()).getValues()[0];
  
  Logger.log('Total columnas: ' + headers.length);
  Logger.log('Total filas: ' + sheetPicking.getLastRow());
  Logger.log('');
  Logger.log('Encabezados:');
  
  for (var j = 0; j < headers.length; j++) {
    var letra = String.fromCharCode(65 + j);
    Logger.log('  ' + letra + ' (col ' + (j+1) + '): ' + headers[j]);
  }
  
  if (sheetPicking.getLastRow() > 1) {
    Logger.log('');
    Logger.log('Ejemplo fila 2:');
    var ejemplo = sheetPicking.getRange(2, 1, 1, Math.min(14, sheetPicking.getLastColumn())).getValues()[0];
    for (var k = 0; k < ejemplo.length; k++) {
      var letra = String.fromCharCode(65 + k);
      var valor = String(ejemplo[k] || '').substring(0, 30);
      Logger.log('  ' + letra + ': ' + valor);
    }
  }
  
  Logger.log('=== FIN ===');
}

/**
 * Probar el inicio de picking con una N.V
 */
function testIniciarPicking() {
  Logger.log('=== TEST INICIAR PICKING ===');
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetNV = ss.getSheetByName('N.V DIARIAS');
  
  if (!sheetNV || sheetNV.getLastRow() <= 1) {
    Logger.log('❌ No hay datos en N.V DIARIAS');
    return;
  }
  
  // Buscar una N.V con estado PENDIENTE_PICKING
  var data = sheetNV.getDataRange().getValues();
  var nvPrueba = null;
  
  for (var i = 1; i < data.length; i++) {
    var estado = String(data[i][2] || '').toUpperCase().replace(/_/g, ' ').replace(/\s+/g, '_');
    if (estado === 'PENDIENTE_PICKING' || estado === 'PENDIENTE PICKING') {
      nvPrueba = String(data[i][1] || '').trim();
      Logger.log('Encontrada N.V pendiente: ' + nvPrueba);
      break;
    }
  }
  
  if (!nvPrueba) {
    Logger.log('❌ No hay N.V con estado PENDIENTE_PICKING');
    return;
  }
  
  Logger.log('');
  Logger.log('Ejecutando iniciarPicking(' + nvPrueba + ', "TEST_USER")...');
  
  var resultado = iniciarPicking(nvPrueba, 'TEST_USER');
  
  Logger.log('');
  Logger.log('--- RESULTADO ---');
  Logger.log('success: ' + resultado.success);
  if (resultado.success) {
    Logger.log('N.V: ' + resultado.nv.notaVenta);
    Logger.log('Cliente: ' + resultado.nv.cliente);
    Logger.log('Productos: ' + resultado.productosConUbicacion.length);
    Logger.log('User Responsable: ' + resultado.userResponsable);
    Logger.log('Mensaje: ' + resultado.mensaje);
  } else {
    Logger.log('Error: ' + resultado.error);
  }
  
  // Verificar en la hoja PICKING
  Logger.log('');
  Logger.log('--- VERIFICAR EN HOJA PICKING ---');
  var sheetPicking = ss.getSheetByName('PICKING');
  if (sheetPicking && sheetPicking.getLastRow() > 1) {
    Logger.log('Filas en PICKING: ' + (sheetPicking.getLastRow() - 1));
    
    var dataPicking = sheetPicking.getDataRange().getValues();
    for (var p = 1; p < dataPicking.length; p++) {
      if (String(dataPicking[p][1] || '').trim() === nvPrueba) {
        Logger.log('✅ N.V encontrada en PICKING en fila ' + (p+1));
        Logger.log('   USER_RESPONSABLE (col M): ' + dataPicking[p][12]);
        Logger.log('   FECHA_INICIO (col N): ' + dataPicking[p][13]);
        break;
      }
    }
  } else {
    Logger.log('⚠️ Hoja PICKING sigue vacía');
  }
  
  Logger.log('=== FIN TEST ===');
}

/**
 * Inicializa la hoja PACKING con las nuevas columnas
 */
function inicializarHojaPackingDesdeInit() {
  Logger.log('=== INICIALIZAR HOJA PACKING ===');
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetPacking = ss.getSheetByName('PACKING');
  
  if (!sheetPacking) {
    sheetPacking = ss.insertSheet('PACKING');
    sheetPacking.appendRow([
      'Fecha Entrega', 'N.Venta', 'Estado', 'Cod.Cliente', 'Nombre Cliente',
      'Cod.Vendedor', 'Nombre Vendedor', 'Zona', 'Cod.Producto', 'Descripcion Producto',
      'Unidad Medida', 'Pedido', 'USER_RESPONSABLE_PICKING', 'FECHA_FIN_PICKING',
      'USER_RESPONSABLE_PACKING', 'FECHA_INICIO_PACKING'
    ]);
    sheetPacking.getRange(1, 1, 1, 16).setFontWeight('bold').setBackground('#27ae60').setFontColor('white');
    Logger.log('✅ Hoja PACKING creada con todas las columnas');
    return;
  }
  
  var lastCol = sheetPacking.getLastColumn();
  if (lastCol < 13) {
    sheetPacking.getRange(1, 13).setValue('USER_RESPONSABLE_PICKING');
    sheetPacking.getRange(1, 13).setFontWeight('bold');
  }
  if (lastCol < 14) {
    sheetPacking.getRange(1, 14).setValue('FECHA_FIN_PICKING');
    sheetPacking.getRange(1, 14).setFontWeight('bold');
  }
  if (lastCol < 15) {
    sheetPacking.getRange(1, 15).setValue('USER_RESPONSABLE_PACKING');
    sheetPacking.getRange(1, 15).setFontWeight('bold');
  }
  if (lastCol < 16) {
    sheetPacking.getRange(1, 16).setValue('FECHA_INICIO_PACKING');
    sheetPacking.getRange(1, 16).setFontWeight('bold');
  }
  
  Logger.log('✅ Hoja PACKING inicializada');
  Logger.log('=== FIN ===');
}

/**
 * Inicializa AMBAS hojas (PICKING y PACKING)
 */
function inicializarTodasLasHojas() {
  Logger.log('============================================================');
  Logger.log('INICIALIZANDO TODAS LAS HOJAS');
  Logger.log('============================================================');
  
  inicializarHojaPicking();
  Logger.log('');
  inicializarHojaPackingDesdeInit();
  
  Logger.log('');
  Logger.log('============================================================');
  Logger.log('✅ FINALIZADO - Ambas hojas inicializadas');
  Logger.log('============================================================');
}
