/**
 * ============================================================
 * INICIALIZAR PACKING - Agregar columnas USER_RESPONSABLE
 * Ejecutar una vez para preparar la hoja PACKING
 * ============================================================
 */

/**
 * Inicializa la hoja PACKING con las nuevas columnas
 * Ejecutar este script desde el editor de Apps Script
 */
function inicializarHojaPacking() {
  Logger.log('=== INICIALIZAR HOJA PACKING ===');
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetPacking = ss.getSheetByName('PACKING');
  
  if (!sheetPacking) {
    // Crear la hoja si no existe
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
  
  // Verificar columnas existentes
  var lastCol = sheetPacking.getLastColumn();
  Logger.log('Columnas actuales: ' + lastCol);
  
  // Agregar columnas si no existen
  // Col 13 = USER_RESPONSABLE_PICKING
  // Col 14 = FECHA_FIN_PICKING
  // Col 15 = USER_RESPONSABLE_PACKING
  // Col 16 = FECHA_INICIO_PACKING
  
  if (lastCol < 13) {
    sheetPacking.getRange(1, 13).setValue('USER_RESPONSABLE_PICKING');
    sheetPacking.getRange(1, 13).setFontWeight('bold').setBackground('#27ae60').setFontColor('white');
    Logger.log('✅ Columna USER_RESPONSABLE_PICKING agregada (col 13)');
  }
  
  if (lastCol < 14) {
    sheetPacking.getRange(1, 14).setValue('FECHA_FIN_PICKING');
    sheetPacking.getRange(1, 14).setFontWeight('bold').setBackground('#27ae60').setFontColor('white');
    Logger.log('✅ Columna FECHA_FIN_PICKING agregada (col 14)');
  }
  
  if (lastCol < 15) {
    sheetPacking.getRange(1, 15).setValue('USER_RESPONSABLE_PACKING');
    sheetPacking.getRange(1, 15).setFontWeight('bold').setBackground('#27ae60').setFontColor('white');
    Logger.log('✅ Columna USER_RESPONSABLE_PACKING agregada (col 15)');
  }
  
  if (lastCol < 16) {
    sheetPacking.getRange(1, 16).setValue('FECHA_INICIO_PACKING');
    sheetPacking.getRange(1, 16).setFontWeight('bold').setBackground('#27ae60').setFontColor('white');
    Logger.log('✅ Columna FECHA_INICIO_PACKING agregada (col 16)');
  }
  
  SpreadsheetApp.flush();
  Logger.log('✅ Hoja PACKING inicializada correctamente');
  Logger.log('=== FIN ===');
}

/**
 * Ver estructura actual de la hoja PACKING
 */
function verEstructuraPacking() {
  Logger.log('=== ESTRUCTURA HOJA PACKING ===');
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetPacking = ss.getSheetByName('PACKING');
  
  if (!sheetPacking) {
    Logger.log('❌ Hoja PACKING no existe');
    return;
  }
  
  var headers = sheetPacking.getRange(1, 1, 1, sheetPacking.getLastColumn()).getValues()[0];
  
  Logger.log('Total columnas: ' + headers.length);
  Logger.log('Total filas: ' + sheetPacking.getLastRow());
  Logger.log('');
  Logger.log('Encabezados:');
  
  for (var j = 0; j < headers.length; j++) {
    var letra = String.fromCharCode(65 + j);
    Logger.log('  ' + letra + ' (col ' + (j+1) + '): ' + headers[j]);
  }
  
  if (sheetPacking.getLastRow() > 1) {
    Logger.log('');
    Logger.log('Ejemplo fila 2:');
    var ejemplo = sheetPacking.getRange(2, 1, 1, Math.min(16, sheetPacking.getLastColumn())).getValues()[0];
    for (var k = 0; k < ejemplo.length; k++) {
      var letra = String.fromCharCode(65 + k);
      var valor = String(ejemplo[k] || '').substring(0, 30);
      Logger.log('  ' + letra + ': ' + valor);
    }
  }
  
  Logger.log('=== FIN ===');
}

/**
 * Inicializar AMBAS hojas (PICKING y PACKING)
 */
// NOTA: Renombrada para evitar conflicto con INIT_PICKING.gs
function inicializarTodasLasHojasPacking() {
  Logger.log('============================================================');
  Logger.log('INICIALIZANDO TODAS LAS HOJAS');
  Logger.log('============================================================');
  
  inicializarHojaPicking();
  Logger.log('');
  inicializarHojaPacking();
  
  Logger.log('');
  Logger.log('============================================================');
  Logger.log('FINALIZADO');
  Logger.log('============================================================');
}
