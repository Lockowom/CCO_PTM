/**
 * InventoryManager.gs
 * Módulo de gestión de inventario con actualización en tiempo real
 * 
 * Este módulo maneja:
 * - Validación de ubicaciones y SKU
 * - Actualización de stock (descuento automático)
 * - Eliminación de filas con stock 0
 * - Estado de ubicaciones para el layout
 */

// ==================== CONFIGURACIÓN ====================

var INGRESO_SHEET = 'INGRESO';

// ==================== VALIDACIÓN DE UBICACIONES ====================

/**
 * Valida que una ubicación existe en la hoja Ingreso
 * @param {string} ubicacion - Código de ubicación
 * @returns {Object} Resultado de validación
 */
function validateLocationExists(ubicacion) {
  try {
    if (!ubicacion || String(ubicacion).trim() === '') {
      return { valid: false, error: 'Ubicación requerida', code: 'EMPTY_LOCATION' };
    }
    
    var ubicacionStr = String(ubicacion).trim().toUpperCase();
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(INGRESO_SHEET);
    
    if (!sheet) {
      return { valid: false, error: 'Hoja INGRESO no encontrada', code: 'SHEET_NOT_FOUND' };
    }
    
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      return { valid: false, error: 'No hay datos en INGRESO', code: 'EMPTY_SHEET' };
    }
    
    // Leer columna A (ubicaciones)
    var ubicaciones = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    var ubicacionesUnicas = {};
    
    for (var i = 0; i < ubicaciones.length; i++) {
      var ub = String(ubicaciones[i][0] || '').trim().toUpperCase();
      if (ub) {
        ubicacionesUnicas[ub] = true;
        if (ub === ubicacionStr) {
          return { 
            valid: true, 
            ubicacion: ubicacionStr,
            message: 'Ubicación válida'
          };
        }
      }
    }
    
    return { 
      valid: false, 
      error: 'Ubicación no encontrada: ' + ubicacionStr,
      code: 'LOCATION_NOT_FOUND',
      ubicacionesSimilares: findSimilarLocations(ubicacionStr, Object.keys(ubicacionesUnicas))
    };
    
  } catch (error) {
    Logger.log('Error en validateLocationExists: ' + error.message);
    return { valid: false, error: error.message, code: 'ERROR' };
  }
}

/**
 * Encuentra ubicaciones similares (para sugerencias)
 * @param {string} ubicacion - Ubicación buscada
 * @param {Array} ubicaciones - Lista de ubicaciones existentes
 * @returns {Array} Ubicaciones similares
 */
function findSimilarLocations(ubicacion, ubicaciones) {
  var similares = [];
  var prefix = ubicacion.substring(0, 2);
  
  for (var i = 0; i < ubicaciones.length && similares.length < 5; i++) {
    if (ubicaciones[i].indexOf(prefix) === 0) {
      similares.push(ubicaciones[i]);
    }
  }
  
  return similares;
}

/**
 * Valida que un SKU existe en una ubicación específica
 * @param {string} sku - Código del producto
 * @param {string} ubicacion - Código de ubicación
 * @returns {Object} Resultado de validación con datos del producto
 */
function validateSKUExists(sku, ubicacion) {
  try {
    if (!sku || String(sku).trim() === '') {
      return { valid: false, error: 'SKU requerido', code: 'EMPTY_SKU' };
    }
    
    if (!ubicacion || String(ubicacion).trim() === '') {
      return { valid: false, error: 'Ubicación requerida', code: 'EMPTY_LOCATION' };
    }
    
    var skuStr = String(sku).trim().toUpperCase();
    var ubicacionStr = String(ubicacion).trim().toUpperCase();
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(INGRESO_SHEET);
    
    if (!sheet) {
      return { valid: false, error: 'Hoja INGRESO no encontrada', code: 'SHEET_NOT_FOUND' };
    }
    
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      return { valid: false, error: 'No hay datos en INGRESO', code: 'EMPTY_SHEET' };
    }
    
    // Leer datos: A=Ubicacion, B=SKU, I=Cantidad, J=Descripcion
    var data = sheet.getRange(2, 1, lastRow - 1, 10).getValues();
    
    for (var i = 0; i < data.length; i++) {
      var rowUbicacion = String(data[i][0] || '').trim().toUpperCase();
      var rowSku = String(data[i][1] || '').trim().toUpperCase();
      
      if (rowUbicacion === ubicacionStr && rowSku === skuStr) {
        var cantidad = Number(data[i][8]) || 0;
        var descripcion = String(data[i][9] || '');
        
        return {
          valid: true,
          product: {
            sku: rowSku,
            ubicacion: rowUbicacion,
            cantidad: cantidad,
            descripcion: descripcion,
            rowIndex: i + 2
          }
        };
      }
    }
    
    return { 
      valid: false, 
      error: 'Este producto no se encuentra en esta ubicación',
      code: 'SKU_NOT_IN_LOCATION',
      sku: skuStr,
      ubicacion: ubicacionStr
    };
    
  } catch (error) {
    Logger.log('Error en validateSKUExists: ' + error.message);
    return { valid: false, error: error.message, code: 'ERROR' };
  }
}

// ==================== ACTUALIZACIÓN DE STOCK ====================

/**
 * Actualiza el stock de un producto en una ubicación
 * @param {string} ubicacion - Código de ubicación
 * @param {string} sku - Código del producto
 * @param {number} cantidad - Cantidad a modificar
 * @param {string} operacion - 'SUBTRACT' para restar, 'ADD' para sumar
 * @returns {Object} Resultado de la operación
 */
function updateStockInLocation(ubicacion, sku, cantidad, operacion) {
  try {
    // Validar parámetros
    if (!ubicacion || !sku) {
      return { success: false, error: 'Ubicación y SKU son requeridos' };
    }
    
    var cantidadNum = Number(cantidad);
    if (isNaN(cantidadNum) || cantidadNum <= 0) {
      return { success: false, error: 'Cantidad debe ser mayor a 0' };
    }
    
    operacion = (operacion || 'SUBTRACT').toUpperCase();
    
    var ubicacionStr = String(ubicacion).trim().toUpperCase();
    var skuStr = String(sku).trim().toUpperCase();
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(INGRESO_SHEET);
    
    if (!sheet) {
      return { success: false, error: 'Hoja INGRESO no encontrada' };
    }
    
    // Usar lock para evitar conflictos
    var lock = LockService.getScriptLock();
    try {
      lock.waitLock(30000);
      
      var lastRow = sheet.getLastRow();
      if (lastRow <= 1) {
        return { success: false, error: 'No hay datos en INGRESO' };
      }
      
      var data = sheet.getRange(2, 1, lastRow - 1, 10).getValues();
      
      for (var i = 0; i < data.length; i++) {
        var rowUbicacion = String(data[i][0] || '').trim().toUpperCase();
        var rowSku = String(data[i][1] || '').trim().toUpperCase();
        
        if (rowUbicacion === ubicacionStr && rowSku === skuStr) {
          var stockActual = Number(data[i][8]) || 0;
          var nuevoStock;
          
          if (operacion === 'SUBTRACT') {
            if (stockActual < cantidadNum) {
              return { 
                success: false, 
                error: 'Stock insuficiente. Disponible: ' + stockActual,
                stockActual: stockActual
              };
            }
            nuevoStock = stockActual - cantidadNum;
          } else if (operacion === 'ADD') {
            nuevoStock = stockActual + cantidadNum;
          } else {
            return { success: false, error: 'Operación no válida: ' + operacion };
          }
          
          var rowIndex = i + 2;
          var descripcion = String(data[i][9] || '');
          var ubicacionVacia = false;
          
          if (nuevoStock <= 0) {
            // Eliminar la fila si el stock llega a 0
            sheet.deleteRow(rowIndex);
            Logger.log('Fila eliminada (stock 0): ' + ubicacionStr + ' - ' + skuStr);
            ubicacionVacia = checkLocationEmpty(ubicacionStr);
          } else {
            // Actualizar la cantidad
            sheet.getRange(rowIndex, 9).setValue(nuevoStock);
            Logger.log('Stock actualizado: ' + ubicacionStr + ' - ' + skuStr + ' = ' + nuevoStock);
          }
          
          // Invalidar caché
          if (typeof invalidateCache === 'function') {
            invalidateCache('INGRESO');
            invalidateCache('INVENTARIO');
          }
          
          return {
            success: true,
            message: 'Stock actualizado correctamente',
            ubicacion: ubicacionStr,
            sku: skuStr,
            descripcion: descripcion,
            stockAnterior: stockActual,
            stockNuevo: nuevoStock,
            operacion: operacion,
            cantidad: cantidadNum,
            filaEliminada: nuevoStock <= 0,
            ubicacionVacia: ubicacionVacia
          };
        }
      }
      
      return { 
        success: false, 
        error: 'Producto no encontrado en la ubicación especificada',
        ubicacion: ubicacionStr,
        sku: skuStr
      };
      
    } finally {
      lock.releaseLock();
    }
    
  } catch (error) {
    Logger.log('Error en updateStockInLocation: ' + error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Elimina una fila de la hoja Ingreso si el stock es 0
 * @param {string} ubicacion - Código de ubicación
 * @param {string} sku - Código del producto
 * @returns {Object} Resultado de la operación
 */
function removeEmptyLocation(ubicacion, sku) {
  try {
    var ubicacionStr = String(ubicacion).trim().toUpperCase();
    var skuStr = String(sku).trim().toUpperCase();
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(INGRESO_SHEET);
    
    if (!sheet) {
      return { success: false, error: 'Hoja INGRESO no encontrada' };
    }
    
    var lock = LockService.getScriptLock();
    try {
      lock.waitLock(30000);
      
      var lastRow = sheet.getLastRow();
      var data = sheet.getRange(2, 1, lastRow - 1, 10).getValues();
      
      for (var i = 0; i < data.length; i++) {
        var rowUbicacion = String(data[i][0] || '').trim().toUpperCase();
        var rowSku = String(data[i][1] || '').trim().toUpperCase();
        var cantidad = Number(data[i][8]) || 0;
        
        if (rowUbicacion === ubicacionStr && rowSku === skuStr && cantidad <= 0) {
          sheet.deleteRow(i + 2);
          Logger.log('Fila eliminada: ' + ubicacionStr + ' - ' + skuStr);
          
          return {
            success: true,
            message: 'Fila eliminada correctamente',
            ubicacion: ubicacionStr,
            sku: skuStr
          };
        }
      }
      
      return { success: false, error: 'No se encontró fila con stock 0' };
      
    } finally {
      lock.releaseLock();
    }
    
  } catch (error) {
    Logger.log('Error en removeEmptyLocation: ' + error.message);
    return { success: false, error: error.message };
  }
}

// ==================== ESTADO DE UBICACIONES ====================

/**
 * Verifica si una ubicación está vacía (sin productos)
 * @param {string} ubicacion - Código de ubicación
 * @returns {boolean} true si está vacía
 */
function checkLocationEmpty(ubicacion) {
  try {
    var ubicacionStr = String(ubicacion).trim().toUpperCase();
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(INGRESO_SHEET);
    
    if (!sheet) return true;
    
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) return true;
    
    var data = sheet.getRange(2, 1, lastRow - 1, 9).getValues();
    
    for (var i = 0; i < data.length; i++) {
      var rowUbicacion = String(data[i][0] || '').trim().toUpperCase();
      var cantidad = Number(data[i][8]) || 0;
      
      if (rowUbicacion === ubicacionStr && cantidad > 0) {
        return false;
      }
    }
    
    return true;
    
  } catch (error) {
    Logger.log('Error en checkLocationEmpty: ' + error.message);
    return true;
  }
}

/**
 * Obtiene el estado de todas las ubicaciones
 * @returns {Object} Estado de ubicaciones para el layout
 */
function getLocationStatus() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(INGRESO_SHEET);
    
    if (!sheet) {
      return { success: false, error: 'Hoja INGRESO no encontrada' };
    }
    
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      return { success: true, locations: {}, total: 0 };
    }
    
    var data = sheet.getRange(2, 1, lastRow - 1, 10).getValues();
    var locations = {};
    
    for (var i = 0; i < data.length; i++) {
      var ubicacion = String(data[i][0] || '').trim().toUpperCase();
      var cantidad = Number(data[i][8]) || 0;
      
      if (!ubicacion) continue;
      
      if (!locations[ubicacion]) {
        locations[ubicacion] = {
          ubicacion: ubicacion,
          estado: 'VACIA',
          productos: 0,
          stockTotal: 0,
          skus: []
        };
      }
      
      if (cantidad > 0) {
        locations[ubicacion].estado = 'OCUPADA';
        locations[ubicacion].productos++;
        locations[ubicacion].stockTotal += cantidad;
        locations[ubicacion].skus.push({
          sku: String(data[i][1] || ''),
          cantidad: cantidad
        });
      }
    }
    
    // Convertir a array
    var locationArray = [];
    for (var key in locations) {
      if (locations.hasOwnProperty(key)) {
        locationArray.push(locations[key]);
      }
    }
    
    return {
      success: true,
      locations: locations,
      locationArray: locationArray,
      total: locationArray.length,
      ocupadas: locationArray.filter(function(l) { return l.estado === 'OCUPADA'; }).length,
      vacias: locationArray.filter(function(l) { return l.estado === 'VACIA'; }).length
    };
    
  } catch (error) {
    Logger.log('Error en getLocationStatus: ' + error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Obtiene todas las ubicaciones únicas
 * @returns {Object} Lista de ubicaciones
 */
function getAllLocations() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(INGRESO_SHEET);
    
    if (!sheet) {
      return { success: false, error: 'Hoja INGRESO no encontrada' };
    }
    
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      return { success: true, locations: [], total: 0 };
    }
    
    var data = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    var ubicacionesUnicas = {};
    
    for (var i = 0; i < data.length; i++) {
      var ubicacion = String(data[i][0] || '').trim().toUpperCase();
      if (ubicacion) {
        ubicacionesUnicas[ubicacion] = true;
      }
    }
    
    var locations = Object.keys(ubicacionesUnicas).sort();
    
    return {
      success: true,
      locations: locations,
      total: locations.length
    };
    
  } catch (error) {
    Logger.log('Error en getAllLocations: ' + error.message);
    return { success: false, error: error.message };
  }
}

// ==================== FUNCIONES PARA PICKING ====================

/**
 * Descuenta stock al confirmar picking
 * @param {string} ubicacion - Ubicación del producto
 * @param {string} sku - SKU del producto
 * @param {number} cantidad - Cantidad pickeada
 * @returns {Object} Resultado de la operación
 */
function confirmPickingStock(ubicacion, sku, cantidad) {
  var result = updateStockInLocation(ubicacion, sku, cantidad, 'SUBTRACT');
  
  if (result.success && result.ubicacionVacia) {
    // Notificar que la ubicación quedó vacía
    result.notification = {
      type: 'LOCATION_EMPTY',
      message: 'Ubicación ' + ubicacion + ' - Disponible',
      ubicacion: ubicacion
    };
  }
  
  return result;
}

// ==================== FUNCIONES EXPUESTAS AL FRONTEND ====================

// Estas funciones son llamadas desde el frontend (Index.html)
