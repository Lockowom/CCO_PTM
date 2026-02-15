/**
 * TransferManager.gs
 * Módulo de gestión de transferencias de productos entre ubicaciones
 * 
 * Este módulo maneja:
 * - Creación de la hoja Transferencias
 * - Validación de transferencias
 * - Ejecución de transferencias con actualización de Ingreso
 * - Historial de transferencias
 */

// ==================== CONFIGURACIÓN ====================

var TRANSFER_SHEET_NAME = 'Transferencias';
var INGRESO_SHEET_NAME = 'INGRESO';

// Columnas de la hoja Transferencias
var TRANSFER_HEADERS = [
  'ID',
  'Fecha',
  'Hora',
  'Usuario',
  'UbicacionOrigen',
  'UbicacionDestino',
  'SKU',
  'Descripcion',
  'Cantidad'
];

// ==================== INICIALIZACIÓN ====================

/**
 * Crea la hoja Transferencias si no existe
 * @returns {Object} Resultado de la operación
 */
function createTransferSheet() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(TRANSFER_SHEET_NAME);
    
    if (sheet) {
      Logger.log('Hoja Transferencias ya existe');
      return { success: true, message: 'Hoja ya existe', created: false };
    }
    
    // Crear la hoja
    sheet = ss.insertSheet(TRANSFER_SHEET_NAME);
    
    // Agregar headers
    sheet.getRange(1, 1, 1, TRANSFER_HEADERS.length).setValues([TRANSFER_HEADERS]);
    
    // Formatear headers
    var headerRange = sheet.getRange(1, 1, 1, TRANSFER_HEADERS.length);
    headerRange.setBackground('#FF6B00');
    headerRange.setFontColor('#FFFFFF');
    headerRange.setFontWeight('bold');
    headerRange.setHorizontalAlignment('center');
    
    // Ajustar anchos de columna
    sheet.setColumnWidth(1, 180); // ID
    sheet.setColumnWidth(2, 100); // Fecha
    sheet.setColumnWidth(3, 80);  // Hora
    sheet.setColumnWidth(4, 150); // Usuario
    sheet.setColumnWidth(5, 120); // UbicacionOrigen
    sheet.setColumnWidth(6, 120); // UbicacionDestino
    sheet.setColumnWidth(7, 150); // SKU
    sheet.setColumnWidth(8, 250); // Descripcion
    sheet.setColumnWidth(9, 80);  // Cantidad
    
    // Congelar primera fila
    sheet.setFrozenRows(1);
    
    Logger.log('Hoja Transferencias creada exitosamente');
    
    return { success: true, message: 'Hoja creada exitosamente', created: true };
    
  } catch (error) {
    Logger.log('Error creando hoja Transferencias: ' + error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Inicializa el módulo de transferencias (llamar al inicio del sistema)
 */
function initTransferModule() {
  createTransferSheet();
}

// ==================== VALIDACIÓN ====================

/**
 * Valida que una ubicación existe en la hoja Ingreso
 * @param {string} ubicacion - Código de ubicación
 * @returns {Object} Resultado de validación
 */
function validateLocation(ubicacion) {
  try {
    if (!ubicacion || String(ubicacion).trim() === '') {
      return { valid: false, error: 'Ubicación requerida' };
    }
    
    var ubicacionStr = String(ubicacion).trim().toUpperCase();
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(INGRESO_SHEET_NAME);
    
    if (!sheet) {
      return { valid: false, error: 'Hoja INGRESO no encontrada' };
    }
    
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      return { valid: false, error: 'Hoja INGRESO vacía' };
    }
    
    // Leer columna A (ubicaciones)
    var ubicaciones = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    
    for (var i = 0; i < ubicaciones.length; i++) {
      var ub = String(ubicaciones[i][0] || '').trim().toUpperCase();
      if (ub === ubicacionStr) {
        return { valid: true, ubicacion: ubicacionStr };
      }
    }
    
    return { valid: false, error: 'Ubicación no encontrada: ' + ubicacionStr };
    
  } catch (error) {
    Logger.log('Error en validateLocation: ' + error.message);
    return { valid: false, error: error.message };
  }
}

/**
 * Valida que un SKU existe en una ubicación específica
 * @param {string} sku - Código del producto
 * @param {string} ubicacion - Código de ubicación
 * @returns {Object} Resultado de validación con datos del producto
 */
function validateSKUInLocation(sku, ubicacion) {
  try {
    if (!sku || String(sku).trim() === '') {
      return { valid: false, error: 'SKU requerido' };
    }
    
    if (!ubicacion || String(ubicacion).trim() === '') {
      return { valid: false, error: 'Ubicación requerida' };
    }
    
    var skuStr = String(sku).trim().toUpperCase();
    var ubicacionStr = String(ubicacion).trim().toUpperCase();
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(INGRESO_SHEET_NAME);
    
    if (!sheet) {
      return { valid: false, error: 'Hoja INGRESO no encontrada' };
    }
    
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      return { valid: false, error: 'Hoja INGRESO vacía' };
    }
    
    // Leer datos relevantes: A=Ubicacion, B=SKU, I=Cantidad, J=Descripcion
    var data = sheet.getRange(2, 1, lastRow - 1, 10).getValues();
    
    for (var i = 0; i < data.length; i++) {
      var rowUbicacion = String(data[i][0] || '').trim().toUpperCase();
      var rowSku = String(data[i][1] || '').trim().toUpperCase();
      
      if (rowUbicacion === ubicacionStr && rowSku === skuStr) {
        var cantidad = Number(data[i][8]) || 0; // Columna I (índice 8)
        var descripcion = String(data[i][9] || ''); // Columna J (índice 9)
        
        return {
          valid: true,
          product: {
            sku: rowSku,
            ubicacion: rowUbicacion,
            cantidad: cantidad,
            descripcion: descripcion,
            rowIndex: i + 2 // +2 porque empezamos en fila 2 y arrays en 0
          }
        };
      }
    }
    
    return { 
      valid: false, 
      error: 'Este producto no se encuentra en esta ubicación',
      sku: skuStr,
      ubicacion: ubicacionStr
    };
    
  } catch (error) {
    Logger.log('Error en validateSKUInLocation: ' + error.message);
    return { valid: false, error: error.message };
  }
}

/**
 * Obtiene información de un producto en una ubicación
 * @param {string} ubicacion - Código de ubicación
 * @param {string} sku - Código del producto
 * @returns {Object} Datos del producto o error
 */
function getProductInLocation(ubicacion, sku) {
  return validateSKUInLocation(sku, ubicacion);
}

/**
 * Valida una transferencia completa antes de ejecutarla
 * @param {string} origen - Ubicación origen
 * @param {string} sku - Código del producto
 * @param {number} cantidad - Cantidad a transferir
 * @param {string} destino - Ubicación destino
 * @returns {Object} Resultado de validación
 */
function validateTransfer(origen, sku, cantidad, destino) {
  try {
    // Validar ubicación origen
    var origenValid = validateLocation(origen);
    if (!origenValid.valid) {
      return { valid: false, error: 'Ubicación origen: ' + origenValid.error, code: 'INVALID_ORIGIN' };
    }
    
    // Validar que el SKU existe en la ubicación origen
    var skuValid = validateSKUInLocation(sku, origen);
    if (!skuValid.valid) {
      return { valid: false, error: skuValid.error, code: 'SKU_NOT_FOUND' };
    }
    
    // Validar cantidad
    var cantidadNum = Number(cantidad);
    if (isNaN(cantidadNum) || cantidadNum <= 0) {
      return { valid: false, error: 'Cantidad debe ser mayor a 0', code: 'INVALID_QUANTITY' };
    }
    
    if (cantidadNum > skuValid.product.cantidad) {
      return { 
        valid: false, 
        error: 'Stock insuficiente. Disponible: ' + skuValid.product.cantidad + ' unidades',
        code: 'INSUFFICIENT_STOCK',
        disponible: skuValid.product.cantidad
      };
    }
    
    // Validar ubicación destino (puede ser nueva o existente)
    // No validamos que exista porque puede ser una ubicación nueva
    if (!destino || String(destino).trim() === '') {
      return { valid: false, error: 'Ubicación destino requerida', code: 'INVALID_DESTINATION' };
    }
    
    // Validar que origen y destino sean diferentes
    var origenStr = String(origen).trim().toUpperCase();
    var destinoStr = String(destino).trim().toUpperCase();
    
    if (origenStr === destinoStr) {
      return { valid: false, error: 'Origen y destino deben ser diferentes', code: 'SAME_LOCATION' };
    }
    
    return {
      valid: true,
      product: skuValid.product,
      cantidad: cantidadNum,
      origen: origenStr,
      destino: destinoStr
    };
    
  } catch (error) {
    Logger.log('Error en validateTransfer: ' + error.message);
    return { valid: false, error: error.message, code: 'VALIDATION_ERROR' };
  }
}

// ==================== EJECUCIÓN DE TRANSFERENCIAS ====================

/**
 * Ejecuta una transferencia de productos
 * @param {Object} data - Datos de la transferencia
 * @param {string} data.origen - Ubicación origen
 * @param {string} data.sku - Código del producto
 * @param {number} data.cantidad - Cantidad a transferir
 * @param {string} data.destino - Ubicación destino
 * @param {string} data.usuario - Email del usuario que realiza la transferencia
 * @returns {Object} Resultado de la operación
 */
function executeTransfer(data) {
  try {
    // Validar la transferencia
    var validation = validateTransfer(data.origen, data.sku, data.cantidad, data.destino);
    if (!validation.valid) {
      return { success: false, error: validation.error, code: validation.code };
    }
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheetIngreso = ss.getSheetByName(INGRESO_SHEET_NAME);
    
    if (!sheetIngreso) {
      return { success: false, error: 'Hoja INGRESO no encontrada' };
    }
    
    // Usar lock para evitar conflictos de concurrencia
    var lock = LockService.getScriptLock();
    try {
      lock.waitLock(30000); // Esperar hasta 30 segundos
      
      // Re-validar después de obtener el lock (por si cambió el stock)
      validation = validateTransfer(data.origen, data.sku, data.cantidad, data.destino);
      if (!validation.valid) {
        return { success: false, error: validation.error, code: validation.code };
      }
      
      var product = validation.product;
      var cantidad = validation.cantidad;
      var origen = validation.origen;
      var destino = validation.destino;
      
      // 1. Actualizar stock en ubicación origen
      var nuevoStockOrigen = product.cantidad - cantidad;
      
      if (nuevoStockOrigen <= 0) {
        // Eliminar la fila si el stock llega a 0
        sheetIngreso.deleteRow(product.rowIndex);
        Logger.log('Fila eliminada (stock 0): ' + origen + ' - ' + product.sku);
      } else {
        // Actualizar la cantidad
        sheetIngreso.getRange(product.rowIndex, 9).setValue(nuevoStockOrigen); // Columna I
        Logger.log('Stock actualizado en origen: ' + origen + ' - ' + product.sku + ' = ' + nuevoStockOrigen);
      }
      
      // 2. Buscar si ya existe el producto en la ubicación destino
      var lastRow = sheetIngreso.getLastRow();
      var dataIngreso = sheetIngreso.getRange(2, 1, lastRow - 1, 10).getValues();
      var destinoRowIndex = -1;
      
      for (var i = 0; i < dataIngreso.length; i++) {
        var rowUbicacion = String(dataIngreso[i][0] || '').trim().toUpperCase();
        var rowSku = String(dataIngreso[i][1] || '').trim().toUpperCase();
        
        if (rowUbicacion === destino && rowSku === product.sku) {
          destinoRowIndex = i + 2;
          break;
        }
      }
      
      if (destinoRowIndex > 0) {
        // Actualizar cantidad en destino existente
        var stockActualDestino = Number(sheetIngreso.getRange(destinoRowIndex, 9).getValue()) || 0;
        var nuevoStockDestino = stockActualDestino + cantidad;
        sheetIngreso.getRange(destinoRowIndex, 9).setValue(nuevoStockDestino);
        Logger.log('Stock actualizado en destino: ' + destino + ' - ' + product.sku + ' = ' + nuevoStockDestino);
      } else {
        // Crear nueva fila en destino
        // Copiar datos del producto original pero con nueva ubicación y cantidad
        var newRow = [
          destino,           // A: Ubicación
          product.sku,       // B: SKU
          '',                // C
          '',                // D
          '',                // E
          '',                // F
          '',                // G
          '',                // H
          cantidad,          // I: Cantidad
          product.descripcion // J: Descripción
        ];
        sheetIngreso.appendRow(newRow);
        Logger.log('Nueva fila creada en destino: ' + destino + ' - ' + product.sku + ' = ' + cantidad);
      }
      
      // 3. Registrar la transferencia en la hoja Transferencias
      var transferId = generateTransferId();
      var now = new Date();
      var fecha = Utilities.formatDate(now, Session.getScriptTimeZone(), 'dd/MM/yyyy');
      var hora = Utilities.formatDate(now, Session.getScriptTimeZone(), 'HH:mm:ss');
      
      var sheetTransfer = ss.getSheetByName(TRANSFER_SHEET_NAME);
      if (!sheetTransfer) {
        createTransferSheet();
        sheetTransfer = ss.getSheetByName(TRANSFER_SHEET_NAME);
      }
      
      var transferRow = [
        transferId,
        fecha,
        hora,
        data.usuario || 'Sistema',
        origen,
        destino,
        product.sku,
        product.descripcion,
        cantidad
      ];
      
      sheetTransfer.appendRow(transferRow);
      Logger.log('Transferencia registrada: ' + transferId);
      
      // Invalidar caché
      if (typeof invalidateCache === 'function') {
        invalidateCache('INGRESO');
        invalidateCache('INVENTARIO');
      }
      
      return {
        success: true,
        message: 'Transferencia completada exitosamente',
        transferId: transferId,
        origen: origen,
        destino: destino,
        sku: product.sku,
        descripcion: product.descripcion,
        cantidad: cantidad,
        stockOrigenAnterior: product.cantidad,
        stockOrigenNuevo: nuevoStockOrigen
      };
      
    } finally {
      lock.releaseLock();
    }
    
  } catch (error) {
    Logger.log('Error en executeTransfer: ' + error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Genera un ID único para transferencias
 * @returns {string} ID único
 */
function generateTransferId() {
  var timestamp = new Date().getTime();
  var random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return 'TRF-' + timestamp + '-' + random;
}

// ==================== HISTORIAL ====================

/**
 * Obtiene el historial de transferencias
 * @param {Object} filters - Filtros opcionales
 * @param {string} filters.ubicacion - Filtrar por ubicación (origen o destino)
 * @param {string} filters.sku - Filtrar por SKU
 * @param {string} filters.fechaDesde - Fecha desde (dd/MM/yyyy)
 * @param {string} filters.fechaHasta - Fecha hasta (dd/MM/yyyy)
 * @param {number} filters.limit - Límite de resultados
 * @returns {Object} Historial de transferencias
 */
function getTransferHistory(filters) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(TRANSFER_SHEET_NAME);
    
    if (!sheet) {
      return { success: true, transfers: [], total: 0, message: 'Hoja Transferencias no existe' };
    }
    
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      return { success: true, transfers: [], total: 0 };
    }
    
    var data = sheet.getRange(2, 1, lastRow - 1, TRANSFER_HEADERS.length).getValues();
    var transfers = [];
    
    filters = filters || {};
    var ubicacionFilter = filters.ubicacion ? String(filters.ubicacion).trim().toUpperCase() : null;
    var skuFilter = filters.sku ? String(filters.sku).trim().toUpperCase() : null;
    var limit = filters.limit || 100;
    
    for (var i = data.length - 1; i >= 0 && transfers.length < limit; i--) {
      var row = data[i];
      var transfer = {
        id: String(row[0] || ''),
        fecha: String(row[1] || ''),
        hora: String(row[2] || ''),
        usuario: String(row[3] || ''),
        ubicacionOrigen: String(row[4] || ''),
        ubicacionDestino: String(row[5] || ''),
        sku: String(row[6] || ''),
        descripcion: String(row[7] || ''),
        cantidad: Number(row[8]) || 0
      };
      
      // Aplicar filtros
      if (ubicacionFilter) {
        var origenUpper = transfer.ubicacionOrigen.toUpperCase();
        var destinoUpper = transfer.ubicacionDestino.toUpperCase();
        if (origenUpper.indexOf(ubicacionFilter) === -1 && destinoUpper.indexOf(ubicacionFilter) === -1) {
          continue;
        }
      }
      
      if (skuFilter) {
        if (transfer.sku.toUpperCase().indexOf(skuFilter) === -1) {
          continue;
        }
      }
      
      transfers.push(transfer);
    }
    
    return {
      success: true,
      transfers: transfers,
      total: transfers.length
    };
    
  } catch (error) {
    Logger.log('Error en getTransferHistory: ' + error.message);
    return { success: false, error: error.message, transfers: [], total: 0 };
  }
}

/**
 * Obtiene los productos disponibles en una ubicación
 * @param {string} ubicacion - Código de ubicación
 * @returns {Object} Lista de productos en la ubicación
 */
function getProductsInLocation(ubicacion) {
  try {
    if (!ubicacion || String(ubicacion).trim() === '') {
      return { success: false, error: 'Ubicación requerida' };
    }
    
    var ubicacionStr = String(ubicacion).trim().toUpperCase();
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(INGRESO_SHEET_NAME);
    
    if (!sheet) {
      return { success: false, error: 'Hoja INGRESO no encontrada' };
    }
    
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      return { success: true, products: [], total: 0 };
    }
    
    var data = sheet.getRange(2, 1, lastRow - 1, 10).getValues();
    var products = [];
    
    for (var i = 0; i < data.length; i++) {
      var rowUbicacion = String(data[i][0] || '').trim().toUpperCase();
      
      if (rowUbicacion === ubicacionStr) {
        var cantidad = Number(data[i][8]) || 0;
        if (cantidad > 0) {
          products.push({
            sku: String(data[i][1] || '').trim(),
            descripcion: String(data[i][9] || ''),
            cantidad: cantidad,
            rowIndex: i + 2
          });
        }
      }
    }
    
    return {
      success: true,
      ubicacion: ubicacionStr,
      products: products,
      total: products.length
    };
    
  } catch (error) {
    Logger.log('Error en getProductsInLocation: ' + error.message);
    return { success: false, error: error.message };
  }
}

// ==================== FUNCIONES EXPUESTAS AL FRONTEND ====================

// Estas funciones son llamadas desde el frontend (Index.html)
