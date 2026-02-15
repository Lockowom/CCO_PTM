/**
 * PickingUbicaciones.gs
 * Gestión de ubicaciones y stock para el proceso de picking
 * 
 * Este módulo maneja:
 * - Lectura de ubicaciones disponibles desde hoja UBICACIONES
 * - Validación de stock disponible
 * - Descuento de stock al confirmar picking
 * - Filtrado y ordenamiento de ubicaciones
 */

// ==================== CONFIGURACIÓN ====================

var SHEET_UBICACIONES = 'UBICACIONES';

// Estructura de columnas de UBICACIONES
var COL_UBIC = {
  UBICACION: 0,           // A
  CODIGO: 1,              // B
  SERIE: 2,               // C
  PARTIDA: 3,             // D
  PIEZA: 4,               // E
  FECHA_VENCIMIENTO: 5,   // F
  TALLA: 6,               // G
  COLOR: 7,               // H
  CANTIDAD: 8,            // I
  DESCRIPCION: 9          // J
};

// ==================== OBTENER UBICACIONES DISPONIBLES ====================

/**
 * Obtiene todas las ubicaciones disponibles para un producto
 * Lee de la hoja UBICACIONES y filtra por código de producto
 * @param {string} codigoProducto - Código del producto
 * @returns {Object} - {success, ubicaciones}
 */
function getUbicacionesDisponibles(codigoProducto) {
  try {
    Logger.log('=== getUbicacionesDisponibles: ' + codigoProducto + ' ===');
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_UBICACIONES);
    
    if (!sheet) {
      return { 
        success: false, 
        error: 'Hoja UBICACIONES no encontrada',
        ubicaciones: []
      };
    }
    
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      return { 
        success: true, 
        ubicaciones: [],
        mensaje: 'Hoja UBICACIONES vacía'
      };
    }
    
    // Leer todas las columnas A-J
    var data = sheet.getRange(2, 1, lastRow - 1, 10).getValues();
    var codigoBuscado = String(codigoProducto).trim().toUpperCase();
    var ubicaciones = [];
    
    for (var i = 0; i < data.length; i++) {
      var row = data[i];
      var codigoFila = String(row[COL_UBIC.CODIGO] || '').trim().toUpperCase();
      var cantidad = Number(row[COL_UBIC.CANTIDAD]) || 0;
      
      // Filtrar por código y cantidad > 0
      if (codigoFila === codigoBuscado && cantidad > 0) {
        // Formatear fecha de vencimiento
        var fechaVenc = '';
        try {
          if (row[COL_UBIC.FECHA_VENCIMIENTO] instanceof Date) {
            fechaVenc = Utilities.formatDate(
              row[COL_UBIC.FECHA_VENCIMIENTO], 
              Session.getScriptTimeZone(), 
              'dd/MM/yyyy'
            );
          } else if (row[COL_UBIC.FECHA_VENCIMIENTO]) {
            fechaVenc = String(row[COL_UBIC.FECHA_VENCIMIENTO]);
          }
        } catch (e) {
          fechaVenc = String(row[COL_UBIC.FECHA_VENCIMIENTO] || '');
        }
        
        ubicaciones.push({
          ubicacion: String(row[COL_UBIC.UBICACION] || '').trim(),
          codigo: String(row[COL_UBIC.CODIGO] || '').trim(),
          serie: String(row[COL_UBIC.SERIE] || '').trim(),
          partida: String(row[COL_UBIC.PARTIDA] || '').trim(),
          pieza: String(row[COL_UBIC.PIEZA] || '').trim(),
          fechaVencimiento: fechaVenc,
          talla: String(row[COL_UBIC.TALLA] || '').trim(),
          color: String(row[COL_UBIC.COLOR] || '').trim(),
          cantidad: cantidad,
          descripcion: String(row[COL_UBIC.DESCRIPCION] || '').trim(),
          rowIndex: i + 2  // Para actualizar después
        });
      }
    }
    
    // Ordenar por cantidad disponible (mayor a menor)
    ubicaciones.sort(function(a, b) {
      return b.cantidad - a.cantidad;
    });
    
    Logger.log('Ubicaciones encontradas: ' + ubicaciones.length);
    
    return {
      success: true,
      ubicaciones: ubicaciones,
      codigo: codigoProducto,
      total: ubicaciones.length
    };
    
  } catch (e) {
    Logger.log('Error en getUbicacionesDisponibles: ' + e.message);
    return { 
      success: false, 
      error: 'Error al obtener ubicaciones: ' + e.message,
      ubicaciones: []
    };
  }
}

// ==================== VALIDACIÓN DE STOCK ====================

/**
 * Valida que haya stock suficiente en una ubicación
 * @param {string} ubicacion - Código de ubicación
 * @param {string} codigo - Código del producto
 * @param {number} cantidad - Cantidad solicitada
 * @returns {Object} - {valido, stockDisponible, mensaje}
 */
function validarStockUbicacion(ubicacion, codigo, cantidad) {
  try {
    Logger.log('=== validarStockUbicacion: ' + ubicacion + ', ' + codigo + ', ' + cantidad + ' ===');
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_UBICACIONES);
    
    if (!sheet) {
      return { 
        valido: false, 
        error: 'Hoja UBICACIONES no encontrada',
        stockDisponible: 0
      };
    }
    
    var data = sheet.getDataRange().getValues();
    var ubicacionBuscada = String(ubicacion).trim().toUpperCase();
    var codigoBuscado = String(codigo).trim().toUpperCase();
    var cantidadSolicitada = Number(cantidad);
    
    if (isNaN(cantidadSolicitada) || cantidadSolicitada <= 0) {
      return {
        valido: false,
        error: 'Cantidad debe ser mayor a 0',
        stockDisponible: 0
      };
    }
    
    // Buscar la ubicación específica
    for (var i = 1; i < data.length; i++) {
      var ubicacionFila = String(data[i][COL_UBIC.UBICACION] || '').trim().toUpperCase();
      var codigoFila = String(data[i][COL_UBIC.CODIGO] || '').trim().toUpperCase();
      
      if (ubicacionFila === ubicacionBuscada && codigoFila === codigoBuscado) {
        var stockDisponible = Number(data[i][COL_UBIC.CANTIDAD]) || 0;
        
        if (stockDisponible >= cantidadSolicitada) {
          return {
            valido: true,
            stockDisponible: stockDisponible,
            cantidadSolicitada: cantidadSolicitada,
            ubicacion: ubicacion,
            codigo: codigo,
            rowIndex: i + 1
          };
        } else {
          return {
            valido: false,
            error: 'Stock insuficiente. Disponible: ' + stockDisponible + ', Solicitado: ' + cantidadSolicitada,
            stockDisponible: stockDisponible,
            cantidadSolicitada: cantidadSolicitada
          };
        }
      }
    }
    
    return {
      valido: false,
      error: 'Ubicación no encontrada o producto no existe en esa ubicación',
      stockDisponible: 0
    };
    
  } catch (e) {
    Logger.log('Error en validarStockUbicacion: ' + e.message);
    return { 
      valido: false, 
      error: 'Error al validar stock: ' + e.message,
      stockDisponible: 0
    };
  }
}

// ==================== DESCUENTO DE STOCK ====================

/**
 * Descuenta stock de una ubicación al confirmar picking
 * @param {string} ubicacion - Código de ubicación
 * @param {string} codigo - Código del producto
 * @param {number} cantidad - Cantidad a descontar
 * @returns {Object} - {success, stockAnterior, stockNuevo}
 */
function descontarStockUbicacion(ubicacion, codigo, cantidad) {
  try {
    Logger.log('=== descontarStockUbicacion: ' + ubicacion + ', ' + codigo + ', ' + cantidad + ' ===');
    
    // Primero validar que hay stock suficiente
    var validacion = validarStockUbicacion(ubicacion, codigo, cantidad);
    
    if (!validacion.valido) {
      return {
        success: false,
        error: validacion.error,
        stockAnterior: validacion.stockDisponible
      };
    }
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_UBICACIONES);
    
    var stockAnterior = validacion.stockDisponible;
    var stockNuevo = stockAnterior - cantidad;
    
    // Actualizar el stock en la hoja
    var rowIndex = validacion.rowIndex;
    sheet.getRange(rowIndex, COL_UBIC.CANTIDAD + 1).setValue(stockNuevo);
    
    SpreadsheetApp.flush();
    
    Logger.log('Stock actualizado: ' + stockAnterior + ' → ' + stockNuevo);
    
    // Registrar en log si es necesario
    registrarMovimientoStock(ubicacion, codigo, cantidad, 'PICKING', 'Sistema');
    
    return {
      success: true,
      ubicacion: ubicacion,
      codigo: codigo,
      cantidadDescontada: cantidad,
      stockAnterior: stockAnterior,
      stockNuevo: stockNuevo,
      ubicacionVacia: stockNuevo === 0,
      mensaje: 'Stock actualizado exitosamente'
    };
    
  } catch (e) {
    Logger.log('Error en descontarStockUbicacion: ' + e.message);
    return { 
      success: false, 
      error: 'Error al descontar stock: ' + e.message
    };
  }
}

// ==================== FUNCIONES AUXILIARES ====================

/**
 * Registra un movimiento de stock en el log
 */
function registrarMovimientoStock(ubicacion, codigo, cantidad, tipo, usuario) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('MOVIMIENTOS');
    
    if (!sheet) {
      sheet = ss.insertSheet('MOVIMIENTOS');
      sheet.appendRow(['ID', 'FechaHora', 'TipoMovimiento', 'Codigo', 'Cantidad', 'Ubicacion', 'Referencia', 'Usuario']);
      sheet.getRange(1, 1, 1, 8).setBackground('#2d3748').setFontColor('white').setFontWeight('bold');
      sheet.setFrozenRows(1);
    }
    
    var id = 'MOV-' + new Date().getTime();
    sheet.appendRow([
      id,
      new Date(),
      tipo,
      codigo,
      -cantidad,  // Negativo porque es salida
      ubicacion,
      'Descuento por picking',
      usuario || 'Sistema'
    ]);
    
  } catch (e) {
    Logger.log('Error al registrar movimiento de stock: ' + e.message);
  }
}

/**
 * Obtiene el stock total de un producto en todas las ubicaciones
 * @param {string} codigoProducto - Código del producto
 * @returns {Object} - {success, stockTotal, ubicaciones}
 */
function getStockTotalProducto(codigoProducto) {
  try {
    var resultado = getUbicacionesDisponibles(codigoProducto);
    
    if (!resultado.success) {
      return resultado;
    }
    
    var stockTotal = 0;
    for (var i = 0; i < resultado.ubicaciones.length; i++) {
      stockTotal += resultado.ubicaciones[i].cantidad;
    }
    
    return {
      success: true,
      codigo: codigoProducto,
      stockTotal: stockTotal,
      ubicaciones: resultado.ubicaciones.length,
      detalle: resultado.ubicaciones
    };
    
  } catch (e) {
    Logger.log('Error en getStockTotalProducto: ' + e.message);
    return { 
      success: false, 
      error: e.message,
      stockTotal: 0
    };
  }
}

/**
 * Busca una ubicación específica por código de ubicación y producto
 * @param {string} ubicacion - Código de ubicación
 * @param {string} codigo - Código del producto
 * @returns {Object} - {success, ubicacion}
 */
function buscarUbicacionEspecifica(ubicacion, codigo) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_UBICACIONES);
    
    if (!sheet) {
      return { success: false, error: 'Hoja UBICACIONES no encontrada' };
    }
    
    var data = sheet.getDataRange().getValues();
    var ubicacionBuscada = String(ubicacion).trim().toUpperCase();
    var codigoBuscado = String(codigo).trim().toUpperCase();
    
    for (var i = 1; i < data.length; i++) {
      var ubicacionFila = String(data[i][COL_UBIC.UBICACION] || '').trim().toUpperCase();
      var codigoFila = String(data[i][COL_UBIC.CODIGO] || '').trim().toUpperCase();
      
      if (ubicacionFila === ubicacionBuscada && codigoFila === codigoBuscado) {
        var fechaVenc = '';
        try {
          if (data[i][COL_UBIC.FECHA_VENCIMIENTO] instanceof Date) {
            fechaVenc = Utilities.formatDate(
              data[i][COL_UBIC.FECHA_VENCIMIENTO], 
              Session.getScriptTimeZone(), 
              'dd/MM/yyyy'
            );
          } else if (data[i][COL_UBIC.FECHA_VENCIMIENTO]) {
            fechaVenc = String(data[i][COL_UBIC.FECHA_VENCIMIENTO]);
          }
        } catch (e) {
          fechaVenc = String(data[i][COL_UBIC.FECHA_VENCIMIENTO] || '');
        }
        
        return {
          success: true,
          ubicacion: {
            ubicacion: String(data[i][COL_UBIC.UBICACION] || '').trim(),
            codigo: String(data[i][COL_UBIC.CODIGO] || '').trim(),
            serie: String(data[i][COL_UBIC.SERIE] || '').trim(),
            partida: String(data[i][COL_UBIC.PARTIDA] || '').trim(),
            pieza: String(data[i][COL_UBIC.PIEZA] || '').trim(),
            fechaVencimiento: fechaVenc,
            talla: String(data[i][COL_UBIC.TALLA] || '').trim(),
            color: String(data[i][COL_UBIC.COLOR] || '').trim(),
            cantidad: Number(data[i][COL_UBIC.CANTIDAD]) || 0,
            descripcion: String(data[i][COL_UBIC.DESCRIPCION] || '').trim(),
            rowIndex: i + 1
          }
        };
      }
    }
    
    return {
      success: false,
      error: 'Ubicación no encontrada'
    };
    
  } catch (e) {
    Logger.log('Error en buscarUbicacionEspecifica: ' + e.message);
    return { success: false, error: e.message };
  }
}

// ==================== FUNCIONES DE COMPATIBILIDAD ====================

/**
 * Alias para compatibilidad con PickingManager.gs
 */
function confirmPickingStock(ubicacion, codigo, cantidad) {
  return descontarStockUbicacion(ubicacion, codigo, cantidad);
}
