/**
 * PickingFlowManager.gs
 * Gestión del flujo completo de picking con migración automática de datos
 * 
 * Este módulo maneja:
 * - Migración de N.V DIARIAS → PICKING (copia)
 * - Migración de PICKING → PACKING (mover y eliminar)
 * - Eliminación de PACKING cuando se despacha
 * - Validación de integridad de datos
 * - Auditoría de todas las operaciones
 */

// ==================== CONFIGURACIÓN ====================

var SHEET_NV_DIARIAS = 'N.V DIARIAS';
var SHEET_PICKING = 'PICKING';
var SHEET_PACKING = 'PACKING';
var SHEET_PICKING_LOG = 'PICKING_LOG';

// Estructura de columnas de N.V DIARIAS
var COL_NV = {
  FECHA_ENTREGA: 0,    // A
  N_VENTA: 1,          // B
  ESTADO: 2,           // C
  COD_CLIENTE: 3,      // D
  CLIENTE: 4,          // E
  COD_VENDEDOR: 5,     // F
  VENDEDOR: 6,         // G
  ZONA: 7,             // H
  COD_PRODUCTO: 8,     // I
  DESCRIPCION: 9,      // J
  UNIDAD_MEDIDA: 10,   // K
  PEDIDO: 11           // L
};

// ==================== MIGRACIÓN N.V DIARIAS → PICKING ====================

/**
 * Copia datos de N.V DIARIAS a la hoja PICKING
 * Se ejecuta cuando el estado cambia a "PENDIENTE PICKING"
 * @param {string} notaVenta - Número de nota de venta
 * @returns {Object} - {success, filasCopidas, mensaje}
 */
function migrarNVAPicking(notaVenta) {
  try {
    Logger.log('=== migrarNVAPicking: ' + notaVenta + ' ===');
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheetOrigen = ss.getSheetByName(SHEET_NV_DIARIAS);
    var sheetDestino = ss.getSheetByName(SHEET_PICKING);
    
    // Validar hoja origen
    if (!sheetOrigen) {
      return { success: false, error: 'Hoja N.V DIARIAS no encontrada' };
    }
    
    // Crear hoja PICKING si no existe
    if (!sheetDestino) {
      sheetDestino = crearHojaPicking(ss);
    }
    
    // Validar que la N.V no exista ya en PICKING (evitar duplicados)
    if (existeEnHoja(sheetDestino, notaVenta)) {
      Logger.log('N.V ' + notaVenta + ' ya existe en PICKING');
      return { 
        success: true, 
        mensaje: 'N.V ya existe en PICKING', 
        filasCopidas: 0,
        duplicado: true
      };
    }
    
    // Leer datos de N.V DIARIAS
    var datosOrigen = sheetOrigen.getDataRange().getValues();
    var nVentaBuscada = String(notaVenta).trim();
    var filasACopiar = [];
    var fechaMigracion = new Date();
    
    for (var i = 1; i < datosOrigen.length; i++) {
      var nVentaFila = String(datosOrigen[i][COL_NV.N_VENTA] || '').trim();
      
      if (nVentaFila === nVentaBuscada) {
        filasACopiar.push([
          datosOrigen[i][COL_NV.FECHA_ENTREGA],
          datosOrigen[i][COL_NV.N_VENTA],
          'PENDIENTE PICKING',  // Estado fijo
          datosOrigen[i][COL_NV.COD_CLIENTE],
          datosOrigen[i][COL_NV.CLIENTE],
          datosOrigen[i][COL_NV.COD_VENDEDOR],
          datosOrigen[i][COL_NV.VENDEDOR],
          datosOrigen[i][COL_NV.ZONA],
          datosOrigen[i][COL_NV.COD_PRODUCTO],
          datosOrigen[i][COL_NV.DESCRIPCION],
          datosOrigen[i][COL_NV.UNIDAD_MEDIDA],
          datosOrigen[i][COL_NV.PEDIDO],
          fechaMigracion,
          'Sistema'
        ]);
      }
    }
    
    if (filasACopiar.length === 0) {
      return { success: false, error: 'N.V no encontrada en N.V DIARIAS' };
    }
    
    // Copiar filas a PICKING
    var lastRow = sheetDestino.getLastRow();
    sheetDestino.getRange(lastRow + 1, 1, filasACopiar.length, 14).setValues(filasACopiar);
    
    SpreadsheetApp.flush();
    
    // Registrar en log de auditoría
    registrarMigracion(notaVenta, 'N.V DIARIAS', 'PICKING', filasACopiar.length, 'COPIA', 'Sistema');
    
    Logger.log('Migración exitosa: ' + filasACopiar.length + ' filas copiadas a PICKING');
    
    return {
      success: true,
      notaVenta: notaVenta,
      filasCopidas: filasACopiar.length,
      mensaje: 'Datos copiados a PICKING exitosamente'
    };
    
  } catch (e) {
    Logger.log('Error en migrarNVAPicking: ' + e.message);
    return { success: false, error: 'Error al migrar a PICKING: ' + e.message };
  }
}

// ==================== MIGRACIÓN PICKING → PACKING ====================

/**
 * Mueve datos de PICKING a PACKING y elimina de PICKING
 * Se ejecuta cuando el picking se completa (estado cambia a PACKING)
 * @param {string} notaVenta - Número de nota de venta
 * @returns {Object} - {success, filasCopidas, filasEliminadas}
 */
// NOTA: Renombrada - usar version de FlowManager.gs
function migrarPickingAPackingPFM(notaVenta) {
  try {
    Logger.log('=== migrarPickingAPacking: ' + notaVenta + ' ===');
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheetOrigen = ss.getSheetByName(SHEET_PICKING);
    var sheetDestino = ss.getSheetByName(SHEET_PACKING);
    
    // Validar hoja origen
    if (!sheetOrigen) {
      return { success: false, error: 'Hoja PICKING no encontrada' };
    }
    
    // Crear hoja PACKING si no existe
    if (!sheetDestino) {
      sheetDestino = crearHojaPacking(ss);
    }
    
    // Validar que la N.V exista en PICKING
    if (!existeEnHoja(sheetOrigen, notaVenta)) {
      return { success: false, error: 'N.V no encontrada en PICKING' };
    }
    
    // Validar que la N.V no exista ya en PACKING
    if (existeEnHoja(sheetDestino, notaVenta)) {
      Logger.log('N.V ' + notaVenta + ' ya existe en PACKING');
      // Eliminar de PICKING de todas formas
      var eliminadas = eliminarDeHoja(sheetOrigen, notaVenta);
      return { 
        success: true, 
        mensaje: 'N.V ya existía en PACKING, eliminada de PICKING',
        filasCopidas: 0,
        filasEliminadas: eliminadas
      };
    }
    
    // Leer datos de PICKING
    var datosOrigen = sheetOrigen.getDataRange().getValues();
    var nVentaBuscada = String(notaVenta).trim();
    var filasACopiar = [];
    var filasAEliminar = [];
    var fechaMigracion = new Date();
    
    for (var i = 1; i < datosOrigen.length; i++) {
      var nVentaFila = String(datosOrigen[i][1] || '').trim();
      
      if (nVentaFila === nVentaBuscada) {
        filasACopiar.push([
          datosOrigen[i][0],   // Fecha Entrega
          datosOrigen[i][1],   // N.Venta
          'PACKING',           // Estado actualizado
          datosOrigen[i][3],   // Cod.Cliente
          datosOrigen[i][4],   // Cliente
          datosOrigen[i][5],   // Cod.Vendedor
          datosOrigen[i][6],   // Vendedor
          datosOrigen[i][7],   // Zona
          datosOrigen[i][8],   // Cod.Producto
          datosOrigen[i][9],   // Descripcion
          datosOrigen[i][10],  // U.M
          datosOrigen[i][11],  // Pedido
          fechaMigracion,
          'Sistema'
        ]);
        filasAEliminar.push(i + 1);
      }
    }
    
    if (filasACopiar.length === 0) {
      return { success: false, error: 'No se encontraron datos para copiar' };
    }
    
    // 1. Copiar a PACKING
    var lastRow = sheetDestino.getLastRow();
    sheetDestino.getRange(lastRow + 1, 1, filasACopiar.length, 14).setValues(filasACopiar);
    
    SpreadsheetApp.flush();
    
    // 2. Eliminar de PICKING (de abajo hacia arriba para no afectar índices)
    for (var j = filasAEliminar.length - 1; j >= 0; j--) {
      sheetOrigen.deleteRow(filasAEliminar[j]);
    }
    
    SpreadsheetApp.flush();
    
    // Registrar en log de auditoría
    registrarMigracion(notaVenta, 'PICKING', 'PACKING', filasACopiar.length, 'MOVER', 'Sistema');
    
    Logger.log('Migración exitosa: ' + filasACopiar.length + ' filas movidas a PACKING, ' + filasAEliminar.length + ' eliminadas de PICKING');
    
    return {
      success: true,
      notaVenta: notaVenta,
      filasCopidas: filasACopiar.length,
      filasEliminadas: filasAEliminar.length,
      mensaje: 'Datos movidos a PACKING exitosamente'
    };
    
  } catch (e) {
    Logger.log('Error en migrarPickingAPacking: ' + e.message);
    return { success: false, error: 'Error al migrar a PACKING: ' + e.message };
  }
}

// ==================== ELIMINACIÓN DE PACKING ====================

/**
 * Elimina datos de PACKING cuando se despacha
 * Se ejecuta cuando el estado cambia a DESPACHO
 * @param {string} notaVenta - Número de nota de venta
 * @returns {Object} - {success, filasEliminadas}
 */
// NOTA: Renombrada - usar version de StateManager.gs
function eliminarDePackingPFM(notaVenta) {
  try {
    Logger.log('=== eliminarDePacking: ' + notaVenta + ' ===');
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheetPacking = ss.getSheetByName(SHEET_PACKING);
    
    if (!sheetPacking) {
      return { success: true, mensaje: 'Hoja PACKING no existe', filasEliminadas: 0 };
    }
    
    var filasEliminadas = eliminarDeHoja(sheetPacking, notaVenta);
    
    if (filasEliminadas === 0) {
      return { success: true, mensaje: 'N.V no encontrada en PACKING', filasEliminadas: 0 };
    }
    
    // Registrar en log de auditoría
    registrarMigracion(notaVenta, 'PACKING', 'ELIMINADO', filasEliminadas, 'ELIMINAR', 'Sistema');
    
    Logger.log('Eliminación exitosa: ' + filasEliminadas + ' filas eliminadas de PACKING');
    
    return {
      success: true,
      notaVenta: notaVenta,
      filasEliminadas: filasEliminadas,
      mensaje: 'Datos eliminados de PACKING exitosamente'
    };
    
  } catch (e) {
    Logger.log('Error en eliminarDePacking: ' + e.message);
    return { success: false, error: 'Error al eliminar de PACKING: ' + e.message };
  }
}

// ==================== VALIDACIÓN DE MIGRACIÓN ====================

/**
 * Valida que una migración sea segura antes de ejecutarla
 * @param {string} notaVenta - Número de nota de venta
 * @param {string} hojaOrigen - Nombre de la hoja origen
 * @param {string} hojaDestino - Nombre de la hoja destino
 * @returns {Object} - {valida, errores}
 */
function validarMigracion(notaVenta, hojaOrigen, hojaDestino) {
  try {
    var errores = [];
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // Validar parámetros
    if (!notaVenta || String(notaVenta).trim() === '') {
      errores.push('Número de N.V requerido');
    }
    
    if (!hojaOrigen || !hojaDestino) {
      errores.push('Hojas origen y destino requeridas');
    }
    
    // Validar que las hojas existan
    var sheetOrigen = ss.getSheetByName(hojaOrigen);
    if (!sheetOrigen) {
      errores.push('Hoja origen "' + hojaOrigen + '" no encontrada');
    }
    
    // Hoja destino puede no existir (se crea automáticamente)
    
    // Validar que existan datos en origen
    if (sheetOrigen && !existeEnHoja(sheetOrigen, notaVenta)) {
      errores.push('N.V no encontrada en hoja origen');
    }
    
    // Validar transición válida
    var transicionesValidas = {
      'N.V DIARIAS': ['PICKING'],
      'PICKING': ['PACKING'],
      'PACKING': ['ELIMINADO']
    };
    
    if (transicionesValidas[hojaOrigen] && 
        transicionesValidas[hojaOrigen].indexOf(hojaDestino) === -1) {
      errores.push('Transición no válida: ' + hojaOrigen + ' → ' + hojaDestino);
    }
    
    return {
      valida: errores.length === 0,
      errores: errores,
      notaVenta: notaVenta,
      hojaOrigen: hojaOrigen,
      hojaDestino: hojaDestino
    };
    
  } catch (e) {
    Logger.log('Error en validarMigracion: ' + e.message);
    return {
      valida: false,
      errores: ['Error al validar: ' + e.message]
    };
  }
}

// ==================== FUNCIONES AUXILIARES ====================

/**
 * Crea la hoja PICKING con estructura correcta
 */
function crearHojaPicking(ss) {
  var sheet = ss.insertSheet(SHEET_PICKING);
  sheet.appendRow([
    'Fecha Entrega', 'N.Venta', 'Estado', 'Cod.Cliente', 'Cliente',
    'Cod.Vendedor', 'Vendedor', 'Zona', 'Cod.Producto', 'Descripcion',
    'U.M', 'Pedido', 'Fecha Ingreso', 'Usuario'
  ]);
  sheet.getRange(1, 1, 1, 14).setBackground('#4a5568').setFontColor('white').setFontWeight('bold');
  sheet.setFrozenRows(1);
  Logger.log('Hoja PICKING creada');
  return sheet;
}

/**
 * Crea la hoja PACKING con estructura correcta
 */
function crearHojaPacking(ss) {
  var sheet = ss.insertSheet(SHEET_PACKING);
  sheet.appendRow([
    'Fecha Entrega', 'N.Venta', 'Estado', 'Cod.Cliente', 'Cliente',
    'Cod.Vendedor', 'Vendedor', 'Zona', 'Cod.Producto', 'Descripcion',
    'U.M', 'Pedido', 'Fecha Ingreso', 'Usuario'
  ]);
  sheet.getRange(1, 1, 1, 14).setBackground('#805ad5').setFontColor('white').setFontWeight('bold');
  sheet.setFrozenRows(1);
  Logger.log('Hoja PACKING creada');
  return sheet;
}

/**
 * Verifica si una N.V existe en una hoja
 */
function existeEnHoja(sheet, notaVenta) {
  if (!sheet || sheet.getLastRow() <= 1) return false;
  
  var data = sheet.getRange(2, 2, sheet.getLastRow() - 1, 1).getValues();
  var nVentaBuscada = String(notaVenta).trim();
  
  for (var i = 0; i < data.length; i++) {
    if (String(data[i][0] || '').trim() === nVentaBuscada) {
      return true;
    }
  }
  return false;
}

/**
 * Elimina todas las filas de una N.V de una hoja
 */
function eliminarDeHoja(sheet, notaVenta) {
  var data = sheet.getDataRange().getValues();
  var nVentaBuscada = String(notaVenta).trim();
  var filasAEliminar = [];
  
  for (var i = data.length - 1; i >= 1; i--) {
    if (String(data[i][1] || '').trim() === nVentaBuscada) {
      filasAEliminar.push(i + 1);
    }
  }
  
  for (var j = 0; j < filasAEliminar.length; j++) {
    sheet.deleteRow(filasAEliminar[j]);
  }
  
  SpreadsheetApp.flush();
  return filasAEliminar.length;
}

/**
 * Registra una migración en el log de auditoría
 */
function registrarMigracion(notaVenta, origen, destino, filas, tipo, usuario) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_PICKING_LOG);
    
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_PICKING_LOG);
      sheet.appendRow(['ID', 'FechaHora', 'TipoOperacion', 'NotaVenta', 'Origen', 'Destino', 'Filas', 'Usuario']);
      sheet.getRange(1, 1, 1, 8).setBackground('#2d3748').setFontColor('white').setFontWeight('bold');
      sheet.setFrozenRows(1);
    }
    
    var id = 'MIG-' + new Date().getTime();
    sheet.appendRow([
      id,
      new Date(),
      tipo,
      notaVenta,
      origen,
      destino,
      filas,
      usuario || 'Sistema'
    ]);
    
  } catch (e) {
    Logger.log('Error al registrar migración: ' + e.message);
  }
}

// ==================== FUNCIONES DE COMPATIBILIDAD ====================

/**
 * Alias para compatibilidad con código existente
 */
// NOTA: Aliases removidos para evitar conflicto con StateManager.gs y FlowManager.gs
// copiarNVaPicking -> definida en StateManager.gs
// moverPickingAPacking -> definida en FlowManager.gs
function copiarNVaPickingPFM(notaVenta) {
  return migrarNVAPicking(notaVenta);
}

function moverPickingAPackingPFM(notaVenta, usuario) {
  return migrarPickingAPackingPFM(notaVenta);
}
