/**
 * ObservacionesManager.gs
 * Gestiona la hoja OBS para registrar productos no encontrados o dañados
 * 
 * Estructura de hoja OBS:
 * A: CODIGO
 * B: DESCRIPCION
 * C: UBICACION
 * D: CANTIDAD
 * E: COMENTARIO
 */

// ==================== CONFIGURACIÓN ====================

var SHEET_OBS = 'OBS';

// ==================== REGISTRAR PRODUCTO NO ENCONTRADO ====================

/**
 * Registra un producto no encontrado en la hoja OBS
 * @param {string} codigo - Código del producto
 * @param {string} descripcion - Descripción del producto
 * @param {number} cantidad - Cantidad solicitada
 * @param {string} notaVenta - Número de nota de venta
 * @param {string} usuario - Usuario que reporta
 * @returns {Object} - {success, idObservacion}
 */
// NOTA: Renombrada - usar version de PickingObservaciones.gs
function registrarProductoNoEncontrado_obs(codigo, descripcion, cantidad, notaVenta, usuario) {
  try {
    Logger.log('=== registrarProductoNoEncontrado: ' + codigo + ' ===');
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_OBS);
    
    // Crear hoja si no existe
    if (!sheet) {
      sheet = crearHojaOBS_obs();
    }
    
    var comentario = 'PRODUCTO NO ENCONTRADO EN NINGUNA UBICACION - N.V: ' + notaVenta + ' - Usuario: ' + (usuario || 'Sistema') + ' - Fecha: ' + new Date().toLocaleString();
    
    var idObservacion = 'OBS-' + new Date().getTime();
    
    sheet.appendRow([
      codigo,
      descripcion,
      'N/A',
      cantidad,
      comentario
    ]);
    
    SpreadsheetApp.flush();
    
    Logger.log('Observación registrada: ' + idObservacion);
    
    return {
      success: true,
      idObservacion: idObservacion,
      mensaje: 'Producto no encontrado registrado en OBS'
    };
    
  } catch (e) {
    Logger.log('Error en registrarProductoNoEncontrado: ' + e.message);
    return { success: false, error: e.message };
  }
}

// ==================== REGISTRAR PRODUCTO DAÑADO ====================

/**
 * Registra un producto dañado en la hoja OBS
 * @param {string} codigo - Código del producto
 * @param {string} descripcion - Descripción del producto
 * @param {string} ubicacion - Ubicación donde está el producto dañado
 * @param {number} cantidad - Cantidad solicitada
 * @param {string} notaVenta - Número de nota de venta
 * @param {string} usuario - Usuario que reporta
 * @returns {Object} - {success, idObservacion}
 */
// NOTA: Renombrada - usar version de PickingObservaciones.gs
function registrarProductoDanado_obs(codigo, descripcion, ubicacion, cantidad, notaVenta, usuario) {
  try {
    Logger.log('=== registrarProductoDanado: ' + codigo + ' en ' + ubicacion + ' ===');
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_OBS);
    
    // Crear hoja si no existe
    if (!sheet) {
      sheet = crearHojaOBS_obs();
    }
    
    var comentario = 'PRODUCTO DAÑADO - N.V: ' + notaVenta + ' - Usuario: ' + (usuario || 'Sistema') + ' - Fecha: ' + new Date().toLocaleString();
    
    var idObservacion = 'OBS-' + new Date().getTime();
    
    sheet.appendRow([
      codigo,
      descripcion,
      ubicacion,
      cantidad,
      comentario
    ]);
    
    SpreadsheetApp.flush();
    
    Logger.log('Observación registrada: ' + idObservacion);
    
    return {
      success: true,
      idObservacion: idObservacion,
      mensaje: 'Producto dañado registrado en OBS'
    };
    
  } catch (e) {
    Logger.log('Error en registrarProductoDanado: ' + e.message);
    return { success: false, error: e.message };
  }
}

// ==================== CREAR HOJA OBS ====================

/**
 * Crea la hoja OBS con la estructura correcta
 * @returns {Sheet} - Hoja creada
 */
// NOTA: Renombrada - usar version de PickingObservaciones.gs
function crearHojaOBS_obs() {
  try {
    Logger.log('=== crearHojaOBS ===');
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.insertSheet(SHEET_OBS);
    
    // Agregar encabezados
    var headers = ['CODIGO', 'DESCRIPCION', 'UBICACION', 'CANTIDAD', 'COMENTARIO'];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    
    // Formatear encabezados
    sheet.getRange(1, 1, 1, headers.length)
      .setBackground('#2d3748')
      .setFontColor('white')
      .setFontWeight('bold')
      .setHorizontalAlignment('center');
    
    // Ajustar anchos de columna
    sheet.setColumnWidth(1, 120);  // CODIGO
    sheet.setColumnWidth(2, 250);  // DESCRIPCION
    sheet.setColumnWidth(3, 100);  // UBICACION
    sheet.setColumnWidth(4, 100);  // CANTIDAD
    sheet.setColumnWidth(5, 400);  // COMENTARIO
    
    sheet.setFrozenRows(1);
    
    Logger.log('Hoja OBS creada exitosamente');
    
    return sheet;
    
  } catch (e) {
    Logger.log('Error en crearHojaOBS: ' + e.message);
    throw e;
  }
}

// ==================== OBTENER OBSERVACIONES ====================

/**
 * Obtiene todas las observaciones de una N.V
 * @param {string} notaVenta - Número de nota de venta
 * @returns {Object} - {success, observaciones}
 */
// NOTA: Renombrada - usar version de PickingObservaciones.gs
function getObservacionesNV_obs(notaVenta) {
  try {
    Logger.log('=== getObservacionesNV: ' + notaVenta + ' ===');
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_OBS);
    
    if (!sheet) {
      return {
        success: true,
        observaciones: [],
        mensaje: 'No hay observaciones registradas'
      };
    }
    
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      return {
        success: true,
        observaciones: [],
        mensaje: 'No hay observaciones registradas'
      };
    }
    
    var data = sheet.getRange(2, 1, lastRow - 1, 5).getValues();
    var observaciones = [];
    
    for (var i = 0; i < data.length; i++) {
      var comentario = String(data[i][4] || '');
      
      // Verificar si la observación pertenece a esta N.V
      if (comentario.indexOf('N.V: ' + notaVenta) !== -1) {
        observaciones.push({
          codigo: String(data[i][0] || ''),
          descripcion: String(data[i][1] || ''),
          ubicacion: String(data[i][2] || ''),
          cantidad: Number(data[i][3]) || 0,
          comentario: comentario,
          fila: i + 2
        });
      }
    }
    
    Logger.log('Observaciones encontradas: ' + observaciones.length);
    
    return {
      success: true,
      observaciones: observaciones,
      total: observaciones.length
    };
    
  } catch (e) {
    Logger.log('Error en getObservacionesNV: ' + e.message);
    return { success: false, error: e.message, observaciones: [] };
  }
}

// ==================== REGISTRAR OBSERVACIÓN GENÉRICA ====================

/**
 * Registra una observación genérica en la hoja OBS
 * @param {string} codigo - Código del producto
 * @param {string} descripcion - Descripción del producto
 * @param {string} ubicacion - Ubicación (puede ser N/A)
 * @param {number} cantidad - Cantidad
 * @param {string} comentario - Comentario personalizado
 * @returns {Object} - {success, idObservacion}
 */
function registrarObservacion(codigo, descripcion, ubicacion, cantidad, comentario) {
  try {
    Logger.log('=== registrarObservacion: ' + codigo + ' ===');
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_OBS);
    
    // Crear hoja si no existe
    if (!sheet) {
      sheet = crearHojaOBS_obs();
    }
    
    var idObservacion = 'OBS-' + new Date().getTime();
    
    sheet.appendRow([
      codigo,
      descripcion,
      ubicacion || 'N/A',
      cantidad,
      comentario + ' - Fecha: ' + new Date().toLocaleString()
    ]);
    
    SpreadsheetApp.flush();
    
    Logger.log('Observación registrada: ' + idObservacion);
    
    return {
      success: true,
      idObservacion: idObservacion,
      mensaje: 'Observación registrada en OBS'
    };
    
  } catch (e) {
    Logger.log('Error en registrarObservacion: ' + e.message);
    return { success: false, error: e.message };
  }
}
