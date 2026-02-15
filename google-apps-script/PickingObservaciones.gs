/**
 * PickingObservaciones.gs
 * Gestión de observaciones para productos con problemas durante el picking
 * 
 * Este módulo maneja:
 * - Registro de productos no encontrados
 * - Registro de productos dañados
 * - Escritura en hoja OBS con estructura A-E
 * - Inclusión de timestamp, usuario y N.V
 */

// ==================== CONFIGURACIÓN ====================

var SHEET_OBS = 'OBS';

// Estructura de columnas de OBS
var COL_OBS = {
  CODIGO: 0,        // A
  DESCRIPCION: 1,   // B
  UBICACION: 2,     // C
  CANTIDAD: 3,      // D
  COMENTARIO: 4     // E
};

// ==================== PRODUCTO NO ENCONTRADO ====================

/**
 * Registra un producto no encontrado en ninguna ubicación
 * Escribe en hoja OBS con ubicación vacía
 * @param {string} codigo - Código del producto
 * @param {string} descripcion - Descripción del producto
 * @param {number} cantidad - Cantidad solicitada
 * @param {string} notaVenta - Número de nota de venta
 * @param {string} usuario - Usuario que reporta
 * @returns {Object} - {success, idObservacion}
 */
function registrarProductoNoEncontrado(codigo, descripcion, cantidad, notaVenta, usuario) {
  try {
    Logger.log('=== registrarProductoNoEncontrado: ' + codigo + ', N.V: ' + notaVenta + ' ===');
    
    if (!codigo || !notaVenta) {
      return { success: false, error: 'Código y N.V son requeridos' };
    }
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_OBS);
    
    // Crear hoja OBS si no existe
    if (!sheet) {
      sheet = crearHojaOBS(ss);
    }
    
    // Preparar comentario con timestamp, usuario y N.V
    var timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm:ss');
    var comentario = 'NO ENCONTRADO | N.V: ' + notaVenta + ' | Usuario: ' + (usuario || 'Sistema') + ' | Fecha: ' + timestamp;
    
    // Agregar fila a OBS
    sheet.appendRow([
      String(codigo).trim(),
      String(descripcion || '').trim(),
      '',  // Ubicación vacía
      Number(cantidad) || 0,
      comentario
    ]);
    
    SpreadsheetApp.flush();
    
    // Marcar producto como NO_ENCONTRADO en el estado
    if (typeof marcarProductoFaltante === 'function') {
      marcarProductoFaltante(notaVenta, codigo, 'NO_ENCONTRADO', usuario);
    }
    
    Logger.log('Producto no encontrado registrado en OBS');
    
    return {
      success: true,
      codigo: codigo,
      notaVenta: notaVenta,
      tipo: 'NO_ENCONTRADO',
      mensaje: 'Observación registrada exitosamente'
    };
    
  } catch (e) {
    Logger.log('Error en registrarProductoNoEncontrado: ' + e.message);
    return { success: false, error: 'Error al registrar observación: ' + e.message };
  }
}

// ==================== PRODUCTO DAÑADO ====================

/**
 * Registra un producto dañado en una ubicación específica
 * Escribe en hoja OBS con la ubicación donde está dañado
 * @param {string} codigo - Código del producto
 * @param {string} descripcion - Descripción del producto
 * @param {string} ubicacion - Ubicación donde está dañado
 * @param {number} cantidad - Cantidad dañada
 * @param {string} notaVenta - Número de nota de venta
 * @param {string} usuario - Usuario que reporta
 * @returns {Object} - {success, idObservacion}
 */
function registrarProductoDanado(codigo, descripcion, ubicacion, cantidad, notaVenta, usuario) {
  try {
    Logger.log('=== registrarProductoDanado: ' + codigo + ', Ubicación: ' + ubicacion + ', N.V: ' + notaVenta + ' ===');
    
    if (!codigo || !ubicacion || !notaVenta) {
      return { success: false, error: 'Código, ubicación y N.V son requeridos' };
    }
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_OBS);
    
    // Crear hoja OBS si no existe
    if (!sheet) {
      sheet = crearHojaOBS(ss);
    }
    
    // Preparar comentario con timestamp, usuario y N.V
    var timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm:ss');
    var comentario = 'DAÑADO | N.V: ' + notaVenta + ' | Usuario: ' + (usuario || 'Sistema') + ' | Fecha: ' + timestamp;
    
    // Agregar fila a OBS
    sheet.appendRow([
      String(codigo).trim(),
      String(descripcion || '').trim(),
      String(ubicacion).trim(),
      Number(cantidad) || 0,
      comentario
    ]);
    
    SpreadsheetApp.flush();
    
    // Marcar producto como DANADO en el estado
    if (typeof marcarProductoFaltante === 'function') {
      marcarProductoFaltante(notaVenta, codigo, 'DANADO', usuario);
    }
    
    Logger.log('Producto dañado registrado en OBS');
    
    return {
      success: true,
      codigo: codigo,
      ubicacion: ubicacion,
      notaVenta: notaVenta,
      tipo: 'DANADO',
      mensaje: 'Observación registrada exitosamente'
    };
    
  } catch (e) {
    Logger.log('Error en registrarProductoDanado: ' + e.message);
    return { success: false, error: 'Error al registrar observación: ' + e.message };
  }
}

// ==================== OBTENER OBSERVACIONES ====================

/**
 * Obtiene todas las observaciones de una N.V
 * @param {string} notaVenta - Número de nota de venta
 * @returns {Object} - {success, observaciones}
 */
function getObservacionesNV(notaVenta) {
  try {
    Logger.log('=== getObservacionesNV: ' + notaVenta + ' ===');
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_OBS);
    
    if (!sheet) {
      return { 
        success: true, 
        observaciones: [],
        mensaje: 'Hoja OBS no existe'
      };
    }
    
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      return { 
        success: true, 
        observaciones: [],
        mensaje: 'No hay observaciones'
      };
    }
    
    var data = sheet.getRange(2, 1, lastRow - 1, 5).getValues();
    var nVentaBuscada = String(notaVenta).trim();
    var observaciones = [];
    
    for (var i = 0; i < data.length; i++) {
      var comentario = String(data[i][COL_OBS.COMENTARIO] || '');
      
      // Verificar si el comentario contiene la N.V
      if (comentario.indexOf('N.V: ' + nVentaBuscada) !== -1) {
        // Extraer tipo de observación
        var tipo = 'DESCONOCIDO';
        if (comentario.indexOf('NO ENCONTRADO') !== -1) {
          tipo = 'NO_ENCONTRADO';
        } else if (comentario.indexOf('DAÑADO') !== -1) {
          tipo = 'DANADO';
        }
        
        // Extraer usuario
        var usuario = '';
        var usuarioMatch = comentario.match(/Usuario: ([^|]+)/);
        if (usuarioMatch) {
          usuario = usuarioMatch[1].trim();
        }
        
        // Extraer fecha
        var fecha = '';
        var fechaMatch = comentario.match(/Fecha: ([^|]+)/);
        if (fechaMatch) {
          fecha = fechaMatch[1].trim();
        }
        
        observaciones.push({
          codigo: String(data[i][COL_OBS.CODIGO] || '').trim(),
          descripcion: String(data[i][COL_OBS.DESCRIPCION] || '').trim(),
          ubicacion: String(data[i][COL_OBS.UBICACION] || '').trim(),
          cantidad: Number(data[i][COL_OBS.CANTIDAD]) || 0,
          tipo: tipo,
          usuario: usuario,
          fecha: fecha,
          comentarioCompleto: comentario,
          rowIndex: i + 2
        });
      }
    }
    
    Logger.log('Observaciones encontradas: ' + observaciones.length);
    
    return {
      success: true,
      notaVenta: notaVenta,
      observaciones: observaciones,
      total: observaciones.length
    };
    
  } catch (e) {
    Logger.log('Error en getObservacionesNV: ' + e.message);
    return { 
      success: false, 
      error: 'Error al obtener observaciones: ' + e.message,
      observaciones: []
    };
  }
}

// ==================== OBTENER TODAS LAS OBSERVACIONES ====================

/**
 * Obtiene todas las observaciones (sin filtrar por N.V)
 * @returns {Object} - {success, observaciones}
 */
function getTodasObservaciones() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_OBS);
    
    if (!sheet) {
      return { 
        success: true, 
        observaciones: [],
        mensaje: 'Hoja OBS no existe'
      };
    }
    
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      return { 
        success: true, 
        observaciones: [],
        mensaje: 'No hay observaciones'
      };
    }
    
    var data = sheet.getRange(2, 1, lastRow - 1, 5).getValues();
    var observaciones = [];
    
    for (var i = 0; i < data.length; i++) {
      var comentario = String(data[i][COL_OBS.COMENTARIO] || '');
      
      // Extraer N.V
      var notaVenta = '';
      var nvMatch = comentario.match(/N\.V: ([^|]+)/);
      if (nvMatch) {
        notaVenta = nvMatch[1].trim();
      }
      
      // Extraer tipo
      var tipo = 'DESCONOCIDO';
      if (comentario.indexOf('NO ENCONTRADO') !== -1) {
        tipo = 'NO_ENCONTRADO';
      } else if (comentario.indexOf('DAÑADO') !== -1) {
        tipo = 'DANADO';
      }
      
      // Extraer usuario
      var usuario = '';
      var usuarioMatch = comentario.match(/Usuario: ([^|]+)/);
      if (usuarioMatch) {
        usuario = usuarioMatch[1].trim();
      }
      
      // Extraer fecha
      var fecha = '';
      var fechaMatch = comentario.match(/Fecha: ([^|]+)/);
      if (fechaMatch) {
        fecha = fechaMatch[1].trim();
      }
      
      observaciones.push({
        codigo: String(data[i][COL_OBS.CODIGO] || '').trim(),
        descripcion: String(data[i][COL_OBS.DESCRIPCION] || '').trim(),
        ubicacion: String(data[i][COL_OBS.UBICACION] || '').trim(),
        cantidad: Number(data[i][COL_OBS.CANTIDAD]) || 0,
        notaVenta: notaVenta,
        tipo: tipo,
        usuario: usuario,
        fecha: fecha,
        comentarioCompleto: comentario,
        rowIndex: i + 2
      });
    }
    
    return {
      success: true,
      observaciones: observaciones,
      total: observaciones.length
    };
    
  } catch (e) {
    Logger.log('Error en getTodasObservaciones: ' + e.message);
    return { 
      success: false, 
      error: e.message,
      observaciones: []
    };
  }
}

// ==================== ELIMINAR OBSERVACIÓN ====================

/**
 * Elimina una observación específica
 * @param {number} rowIndex - Índice de la fila a eliminar
 * @returns {Object} - {success}
 */
function eliminarObservacion(rowIndex) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_OBS);
    
    if (!sheet) {
      return { success: false, error: 'Hoja OBS no encontrada' };
    }
    
    sheet.deleteRow(rowIndex);
    SpreadsheetApp.flush();
    
    return {
      success: true,
      mensaje: 'Observación eliminada exitosamente'
    };
    
  } catch (e) {
    Logger.log('Error en eliminarObservacion: ' + e.message);
    return { success: false, error: e.message };
  }
}

// ==================== FUNCIONES AUXILIARES ====================

/**
 * Crea la hoja OBS con estructura correcta
 */
function crearHojaOBS(ss) {
  var sheet = ss.insertSheet(SHEET_OBS);
  sheet.appendRow([
    'CODIGO',
    'DESCRIPCION',
    'UBICACION',
    'CANTIDAD',
    'COMENTARIO'
  ]);
  sheet.getRange(1, 1, 1, 5).setBackground('#e53e3e').setFontColor('white').setFontWeight('bold');
  sheet.setFrozenRows(1);
  sheet.setColumnWidth(1, 100);  // CODIGO
  sheet.setColumnWidth(2, 200);  // DESCRIPCION
  sheet.setColumnWidth(3, 100);  // UBICACION
  sheet.setColumnWidth(4, 80);   // CANTIDAD
  sheet.setColumnWidth(5, 400);  // COMENTARIO
  Logger.log('Hoja OBS creada');
  return sheet;
}

/**
 * Obtiene estadísticas de observaciones
 * @returns {Object} - {success, estadisticas}
 */
function getEstadisticasObservaciones() {
  try {
    var resultado = getTodasObservaciones();
    
    if (!resultado.success) {
      return resultado;
    }
    
    var estadisticas = {
      total: resultado.observaciones.length,
      noEncontrados: 0,
      danados: 0,
      porNV: {}
    };
    
    for (var i = 0; i < resultado.observaciones.length; i++) {
      var obs = resultado.observaciones[i];
      
      if (obs.tipo === 'NO_ENCONTRADO') {
        estadisticas.noEncontrados++;
      } else if (obs.tipo === 'DANADO') {
        estadisticas.danados++;
      }
      
      if (obs.notaVenta) {
        if (!estadisticas.porNV[obs.notaVenta]) {
          estadisticas.porNV[obs.notaVenta] = 0;
        }
        estadisticas.porNV[obs.notaVenta]++;
      }
    }
    
    return {
      success: true,
      estadisticas: estadisticas
    };
    
  } catch (e) {
    Logger.log('Error en getEstadisticasObservaciones: ' + e.message);
    return { success: false, error: e.message };
  }
}
