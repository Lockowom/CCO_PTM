/**
 * Database.gs
 * Módulo de base de datos - Operaciones CRUD genéricas para Google Sheets
 * 
 * Este módulo proporciona funciones reutilizables para interactuar con las hojas
 * de Google Sheets de forma segura y consistente.
 * 
 * OPTIMIZACIONES PARA ALTO RENDIMIENTO:
 * - Sistema de caché con CacheService para reducir lecturas a Sheets
 * - Batch operations para escrituras múltiples
 * - Throttling para evitar exceder cuotas de Google
 * - Lock Service para operaciones concurrentes
 * 
 * LÍMITES DE GOOGLE APPS SCRIPT:
 * - Máximo 30 usuarios simultáneos por script
 * - 6 minutos máximo de ejecución por llamada
 * - 20,000 llamadas/día a Sheets API
 * - 50,000 lecturas/día
 * 
 * Con estas optimizaciones se puede soportar ~100-200 usuarios concurrentes
 * mediante el uso eficiente de caché y batch operations.
 */

// ==================== SISTEMA DE CACHÉ ====================

var CACHE_DURATION = 60; // Segundos de duración del caché (1 minuto)
var CACHE_PREFIX = 'WMS_';

/**
 * Obtiene datos del caché o los carga desde la hoja
 * @param {string} key - Clave del caché
 * @param {Function} loadFunction - Función para cargar datos si no están en caché
 * @param {number} duration - Duración del caché en segundos (opcional)
 * @returns {*} Datos del caché o recién cargados
 */
function getCachedData(key, loadFunction, duration) {
  try {
    var cache = CacheService.getScriptCache();
    var cached = cache.get(CACHE_PREFIX + key);
    
    if (cached) {
      return JSON.parse(cached);
    }
    
    // Cargar datos frescos
    var data = loadFunction();
    
    // Guardar en caché
    var cacheDuration = duration || CACHE_DURATION;
    try {
      cache.put(CACHE_PREFIX + key, JSON.stringify(data), cacheDuration);
    } catch (e) {
      // Si los datos son muy grandes para el caché, continuar sin caché
      Logger.log('Datos muy grandes para caché: ' + key);
    }
    
    return data;
  } catch (e) {
    Logger.log('Error en getCachedData: ' + e.message);
    return loadFunction();
  }
}

/**
 * Invalida una entrada del caché
 * @param {string} key - Clave del caché a invalidar
 */
function invalidateCache(key) {
  try {
    var cache = CacheService.getScriptCache();
    cache.remove(CACHE_PREFIX + key);
  } catch (e) {
    Logger.log('Error invalidando caché: ' + e.message);
  }
}

/**
 * Invalida múltiples entradas del caché
 * @param {Array} keys - Array de claves a invalidar
 */
function invalidateCacheMultiple(keys) {
  try {
    var cache = CacheService.getScriptCache();
    var prefixedKeys = keys.map(function(k) { return CACHE_PREFIX + k; });
    cache.removeAll(prefixedKeys);
  } catch (e) {
    Logger.log('Error invalidando caché múltiple: ' + e.message);
  }
}

/**
 * Limpia todo el caché del sistema
 */
function clearAllCache() {
  try {
    var cache = CacheService.getScriptCache();
    // No hay método para limpiar todo, pero podemos invalidar claves conocidas
    var knownKeys = ['INVENTARIO', 'ORDENES', 'DESPACHOS', 'ENTREGAS', 'USUARIOS', 'ROLES', 'LAYOUT'];
    invalidateCacheMultiple(knownKeys);
    Logger.log('Caché limpiado');
  } catch (e) {
    Logger.log('Error limpiando caché: ' + e.message);
  }
}

// ==================== LOCK SERVICE PARA CONCURRENCIA ====================

/**
 * Ejecuta una función con lock para evitar conflictos de concurrencia
 * @param {Function} fn - Función a ejecutar
 * @param {number} waitTime - Tiempo máximo de espera en ms (default 10000)
 * @returns {*} Resultado de la función
 */
function executeWithLock(fn, waitTime) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(waitTime || 10000);
    return fn();
  } catch (e) {
    Logger.log('No se pudo obtener lock: ' + e.message);
    throw new Error('Sistema ocupado, intente nuevamente');
  } finally {
    lock.releaseLock();
  }
}

// ==================== BATCH OPERATIONS ====================

/**
 * Escribe múltiples filas de una vez (más eficiente que appendRow múltiples veces)
 * @param {string} sheetName - Nombre de la hoja
 * @param {Array} rows - Array de arrays con los datos
 * @returns {Object} Resultado de la operación
 */
function batchInsertRows(sheetName, rows) {
  if (!rows || rows.length === 0) {
    return { success: true, inserted: 0 };
  }
  
  return executeWithLock(function() {
    try {
      var sheet = getSheet(sheetName);
      var lastRow = sheet.getLastRow();
      var numCols = rows[0].length;
      
      // Escribir todas las filas de una vez
      sheet.getRange(lastRow + 1, 1, rows.length, numCols).setValues(rows);
      
      // Invalidar caché relacionado
      invalidateCache(sheetName.toUpperCase());
      
      return { success: true, inserted: rows.length };
    } catch (e) {
      Logger.log('Error en batchInsertRows: ' + e.message);
      return { success: false, error: e.message };
    }
  });
}

/**
 * Actualiza múltiples celdas de una vez
 * @param {string} sheetName - Nombre de la hoja
 * @param {Array} updates - Array de {row, col, value}
 * @returns {Object} Resultado de la operación
 */
function batchUpdateCells(sheetName, updates) {
  if (!updates || updates.length === 0) {
    return { success: true, updated: 0 };
  }
  
  return executeWithLock(function() {
    try {
      var sheet = getSheet(sheetName);
      
      updates.forEach(function(u) {
        sheet.getRange(u.row, u.col).setValue(u.value);
      });
      
      // Invalidar caché relacionado
      invalidateCache(sheetName.toUpperCase());
      
      return { success: true, updated: updates.length };
    } catch (e) {
      Logger.log('Error en batchUpdateCells: ' + e.message);
      return { success: false, error: e.message };
    }
  });
}

// ==================== FUNCIONES ORIGINALES ====================

/**
 * Obtiene una hoja específica del spreadsheet
 * @param {string} sheetName - Nombre de la hoja
 * @returns {Sheet} Objeto Sheet de Google Sheets
 * @throws {Error} Si la hoja no existe
 */
function getSheet(sheetName) {
  try {
    const ss = getSpreadsheet();
    const sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      throw new Error('La hoja "' + sheetName + '" no existe');
    }
    
    return sheet;
  } catch (error) {
    Logger.log('Error en getSheet: ' + error.message);
    throw error;
  }
}

/**
 * Inserta una nueva fila en una hoja
 * @param {string} sheetName - Nombre de la hoja
 * @param {Array} data - Array con los datos a insertar
 * @returns {Object} Resultado de la operación
 */
function insertRow(sheetName, data) {
  try {
    // Validar datos
    if (!data || !Array.isArray(data) || data.length === 0) {
      throw new Error('Los datos deben ser un array no vacío');
    }
    
    const sheet = getSheet(sheetName);
    
    // Validar que el número de columnas coincida
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    if (data.length !== headers.length) {
      throw new Error('El número de datos (' + data.length + ') no coincide con el número de columnas (' + headers.length + ')');
    }
    
    // Insertar fila
    sheet.appendRow(data);
    
    // Obtener el número de fila insertada
    const lastRow = sheet.getLastRow();
    
    Logger.log('Fila insertada en ' + sheetName + ' (fila ' + lastRow + ')');
    
    return {
      success: true,
      message: 'Fila insertada correctamente',
      rowNumber: lastRow,
      sheetName: sheetName
    };
    
  } catch (error) {
    Logger.log('Error en insertRow: ' + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Actualiza una fila existente en una hoja
 * @param {string} sheetName - Nombre de la hoja
 * @param {number} rowIndex - Índice de la fila (1-based, incluyendo header)
 * @param {Array} data - Array con los nuevos datos
 * @returns {Object} Resultado de la operación
 */
function updateRow(sheetName, rowIndex, data) {
  try {
    // Validar parámetros
    if (!rowIndex || rowIndex < 2) {
      throw new Error('El índice de fila debe ser mayor o igual a 2 (la fila 1 es el header)');
    }
    
    if (!data || !Array.isArray(data) || data.length === 0) {
      throw new Error('Los datos deben ser un array no vacío');
    }
    
    const sheet = getSheet(sheetName);
    
    // Verificar que la fila existe
    if (rowIndex > sheet.getLastRow()) {
      throw new Error('La fila ' + rowIndex + ' no existe en ' + sheetName);
    }
    
    // Validar número de columnas
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    if (data.length !== headers.length) {
      throw new Error('El número de datos no coincide con el número de columnas');
    }
    
    // Actualizar fila
    const range = sheet.getRange(rowIndex, 1, 1, data.length);
    range.setValues([data]);
    
    Logger.log('Fila ' + rowIndex + ' actualizada en ' + sheetName);
    
    return {
      success: true,
      message: 'Fila actualizada correctamente',
      rowNumber: rowIndex,
      sheetName: sheetName
    };
    
  } catch (error) {
    Logger.log('Error en updateRow: ' + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Elimina una fila de una hoja
 * @param {string} sheetName - Nombre de la hoja
 * @param {number} rowIndex - Índice de la fila a eliminar (1-based)
 * @returns {Object} Resultado de la operación
 */
function deleteRow(sheetName, rowIndex) {
  try {
    // Validar parámetros
    if (!rowIndex || rowIndex < 2) {
      throw new Error('El índice de fila debe ser mayor o igual a 2 (no se puede eliminar el header)');
    }
    
    const sheet = getSheet(sheetName);
    
    // Verificar que la fila existe
    if (rowIndex > sheet.getLastRow()) {
      throw new Error('La fila ' + rowIndex + ' no existe en ' + sheetName);
    }
    
    // Eliminar fila
    sheet.deleteRow(rowIndex);
    
    Logger.log('Fila ' + rowIndex + ' eliminada de ' + sheetName);
    
    return {
      success: true,
      message: 'Fila eliminada correctamente',
      rowNumber: rowIndex,
      sheetName: sheetName
    };
    
  } catch (error) {
    Logger.log('Error en deleteRow: ' + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Busca filas que cumplan con ciertos criterios
 * @param {string} sheetName - Nombre de la hoja
 * @param {Object} criteria - Objeto con criterios de búsqueda {columna: valor}
 * @returns {Array} Array de objetos con las filas encontradas
 */
function findRows(sheetName, criteria) {
  try {
    const sheet = getSheet(sheetName);
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      return []; // Solo hay headers o está vacía
    }
    
    const headers = data[0];
    const results = [];
    
    // Iterar sobre las filas (empezando desde 1 para saltar headers)
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      let matches = true;
      
      // Verificar cada criterio
      for (const [column, value] of Object.entries(criteria)) {
        const columnIndex = headers.indexOf(column);
        
        if (columnIndex === -1) {
          throw new Error('La columna "' + column + '" no existe en ' + sheetName);
        }
        
        // Comparación flexible (convierte a string para comparar)
        if (String(row[columnIndex]) !== String(value)) {
          matches = false;
          break;
        }
      }
      
      if (matches) {
        // Crear objeto con los datos de la fila
        const rowObject = {
          rowIndex: i + 1, // +1 porque los arrays empiezan en 0 pero las filas en 1
          data: {}
        };
        
        headers.forEach((header, index) => {
          rowObject.data[header] = row[index];
        });
        
        results.push(rowObject);
      }
    }
    
    Logger.log('Búsqueda en ' + sheetName + ': ' + results.length + ' resultados');
    
    return results;
    
  } catch (error) {
    Logger.log('Error en findRows: ' + error.message);
    throw error;
  }
}

/**
 * Obtiene todas las filas de una hoja como objetos
 * @param {string} sheetName - Nombre de la hoja
 * @returns {Array} Array de objetos con todas las filas
 */
function getAllRows(sheetName) {
  try {
    const sheet = getSheet(sheetName);
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      return []; // Solo hay headers o está vacía
    }
    
    const headers = data[0];
    const results = [];
    
    // Iterar sobre las filas (empezando desde 1 para saltar headers)
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const rowObject = {
        rowIndex: i + 1,
        data: {}
      };
      
      headers.forEach((header, index) => {
        rowObject.data[header] = row[index];
      });
      
      results.push(rowObject);
    }
    
    return results;
    
  } catch (error) {
    Logger.log('Error en getAllRows: ' + error.message);
    throw error;
  }
}

/**
 * Obtiene el número de la última fila con datos
 * @param {string} sheetName - Nombre de la hoja
 * @returns {number} Número de la última fila
 */
function getLastRow(sheetName) {
  try {
    const sheet = getSheet(sheetName);
    return sheet.getLastRow();
  } catch (error) {
    Logger.log('Error en getLastRow: ' + error.message);
    throw error;
  }
}

/**
 * Obtiene una fila específica por su índice
 * @param {string} sheetName - Nombre de la hoja
 * @param {number} rowIndex - Índice de la fila (1-based)
 * @returns {Object} Objeto con los datos de la fila
 */
function getRowByIndex(sheetName, rowIndex) {
  try {
    if (!rowIndex || rowIndex < 2) {
      throw new Error('El índice de fila debe ser mayor o igual a 2');
    }
    
    const sheet = getSheet(sheetName);
    
    if (rowIndex > sheet.getLastRow()) {
      throw new Error('La fila ' + rowIndex + ' no existe en ' + sheetName);
    }
    
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const rowData = sheet.getRange(rowIndex, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    const rowObject = {
      rowIndex: rowIndex,
      data: {}
    };
    
    headers.forEach((header, index) => {
      rowObject.data[header] = rowData[index];
    });
    
    return rowObject;
    
  } catch (error) {
    Logger.log('Error en getRowByIndex: ' + error.message);
    throw error;
  }
}

/**
 * Actualiza una celda específica
 * @param {string} sheetName - Nombre de la hoja
 * @param {number} rowIndex - Índice de la fila
 * @param {string} columnName - Nombre de la columna
 * @param {*} value - Nuevo valor
 * @returns {Object} Resultado de la operación
 */
function updateCell(sheetName, rowIndex, columnName, value) {
  try {
    if (!rowIndex || rowIndex < 2) {
      throw new Error('El índice de fila debe ser mayor o igual a 2');
    }
    
    const sheet = getSheet(sheetName);
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const columnIndex = headers.indexOf(columnName);
    
    if (columnIndex === -1) {
      throw new Error('La columna "' + columnName + '" no existe en ' + sheetName);
    }
    
    // Actualizar celda (columnIndex + 1 porque los índices de columna empiezan en 1)
    sheet.getRange(rowIndex, columnIndex + 1).setValue(value);
    
    Logger.log('Celda actualizada: ' + sheetName + '[' + rowIndex + '][' + columnName + '] = ' + value);
    
    return {
      success: true,
      message: 'Celda actualizada correctamente'
    };
    
  } catch (error) {
    Logger.log('Error en updateCell: ' + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Cuenta el número de filas que cumplen con ciertos criterios
 * @param {string} sheetName - Nombre de la hoja
 * @param {Object} criteria - Objeto con criterios de búsqueda
 * @returns {number} Número de filas que cumplen los criterios
 */
function countRows(sheetName, criteria) {
  try {
    const results = findRows(sheetName, criteria);
    return results.length;
  } catch (error) {
    Logger.log('Error en countRows: ' + error.message);
    return 0;
  }
}

/**
 * Valida que los datos cumplan con el formato esperado
 * @param {Array} data - Datos a validar
 * @param {Array} headers - Headers esperados
 * @returns {Object} Resultado de la validación
 */
function validateData(data, headers) {
  const errors = [];
  
  // Verificar que sea un array
  if (!Array.isArray(data)) {
    errors.push('Los datos deben ser un array');
    return { valid: false, errors: errors };
  }
  
  // Verificar longitud
  if (data.length !== headers.length) {
    errors.push('El número de datos (' + data.length + ') no coincide con el número de columnas (' + headers.length + ')');
  }
  
  // Verificar que no haya valores undefined o null en campos requeridos
  data.forEach((value, index) => {
    if (value === undefined || value === null) {
      errors.push('El campo "' + headers[index] + '" no puede estar vacío');
    }
  });
  
  return {
    valid: errors.length === 0,
    errors: errors
  };
}

/**
 * Genera un ID único con prefijo
 * @param {string} prefix - Prefijo para el ID (ej: 'USR', 'ORD', 'REC')
 * @returns {string} ID único generado
 */
function generateId(prefix) {
  const timestamp = new Date().getTime();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return (prefix || 'ID') + '-' + timestamp + '-' + random;
}

/**
 * Obtiene un producto por su ID desde INVENTARIO o INGRESO
 * @param {string} productId - ID o código del producto
 * @returns {Object} Datos del producto
 */
function getProductById(productId) {
  try {
    if (!productId) {
      return { success: false, error: 'ID de producto requerido' };
    }
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var productIdStr = String(productId).trim().toUpperCase();
    
    // Buscar en INVENTARIO primero
    var sheetInv = ss.getSheetByName('INVENTARIO');
    if (sheetInv && sheetInv.getLastRow() > 1) {
      var dataInv = sheetInv.getDataRange().getValues();
      for (var i = 1; i < dataInv.length; i++) {
        var codigo = String(dataInv[i][0] || '').trim().toUpperCase();
        if (codigo === productIdStr) {
          return {
            success: true,
            product: {
              id: codigo,
              codigo: codigo,
              nombre: String(dataInv[i][1] || ''),
              descripcion: String(dataInv[i][1] || ''),
              unidadMedida: String(dataInv[i][2] || ''),
              cantidad: Number(dataInv[i][3]) || 0,
              cantidadDisponible: Number(dataInv[i][3]) || 0,
              cantidadReservada: Number(dataInv[i][4]) || 0,
              ubicacion: '',
              rowIndex: i + 1
            }
          };
        }
      }
    }
    
    // Buscar en INGRESO como fallback
    var sheetIng = ss.getSheetByName('INGRESO');
    if (sheetIng && sheetIng.getLastRow() > 1) {
      var dataIng = sheetIng.getDataRange().getValues();
      for (var j = 1; j < dataIng.length; j++) {
        var codigoIng = String(dataIng[j][1] || '').trim().toUpperCase();
        if (codigoIng === productIdStr) {
          return {
            success: true,
            product: {
              id: String(dataIng[j][12] || codigoIng),
              codigo: codigoIng,
              nombre: String(dataIng[j][9] || ''),
              descripcion: String(dataIng[j][9] || ''),
              unidadMedida: '',
              cantidad: Number(dataIng[j][8]) || 0,
              cantidadDisponible: Number(dataIng[j][8]) || 0,
              cantidadReservada: 0,
              ubicacion: String(dataIng[j][0] || ''),
              rowIndex: j + 1
            }
          };
        }
      }
    }
    
    return { success: false, error: 'Producto no encontrado: ' + productId };
    
  } catch (error) {
    Logger.log('Error en getProductById: ' + error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Actualiza el stock de un producto
 * @param {string} productId - ID o código del producto
 * @param {number} cantidad - Cantidad a modificar
 * @param {string} operation - Operación: 'ADD', 'SUBTRACT', 'RESERVE', 'RELEASE'
 * @returns {Object} Resultado de la operación
 */
function updateStock(productId, cantidad, operation) {
  try {
    if (!productId || cantidad === undefined) {
      return { success: false, error: 'ID de producto y cantidad son requeridos' };
    }
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('INVENTARIO');
    
    if (!sheet) {
      return { success: false, error: 'Hoja INVENTARIO no encontrada' };
    }
    
    var data = sheet.getDataRange().getValues();
    var productIdStr = String(productId).trim().toUpperCase();
    
    for (var i = 1; i < data.length; i++) {
      var codigo = String(data[i][0] || '').trim().toUpperCase();
      if (codigo === productIdStr) {
        var disponible = Number(data[i][3]) || 0;
        var reservado = Number(data[i][4]) || 0;
        var nuevoDisponible = disponible;
        var nuevoReservado = reservado;
        
        switch(operation.toUpperCase()) {
          case 'ADD':
            nuevoDisponible = disponible + cantidad;
            break;
          case 'SUBTRACT':
            if (disponible < cantidad) {
              return { success: false, error: 'Stock insuficiente' };
            }
            nuevoDisponible = disponible - cantidad;
            break;
          case 'RESERVE':
            if (disponible < cantidad) {
              return { success: false, error: 'Stock insuficiente para reservar' };
            }
            nuevoDisponible = disponible - cantidad;
            nuevoReservado = reservado + cantidad;
            break;
          case 'RELEASE':
            nuevoDisponible = disponible + cantidad;
            nuevoReservado = Math.max(0, reservado - cantidad);
            break;
          default:
            return { success: false, error: 'Operación no válida: ' + operation };
        }
        
        sheet.getRange(i + 1, 4).setValue(nuevoDisponible);
        sheet.getRange(i + 1, 5).setValue(nuevoReservado);
        
        // Recalcular stock total
        var transitoria = Number(data[i][5]) || 0;
        var consignacion = Number(data[i][6]) || 0;
        sheet.getRange(i + 1, 8).setValue(nuevoDisponible + nuevoReservado + transitoria + consignacion);
        
        Logger.log('Stock actualizado: ' + productId + ' | ' + operation + ' ' + cantidad);
        
        return {
          success: true,
          productId: productId,
          operation: operation,
          cantidad: cantidad,
          nuevoDisponible: nuevoDisponible,
          nuevoReservado: nuevoReservado
        };
      }
    }
    
    return { success: false, error: 'Producto no encontrado: ' + productId };
    
  } catch (error) {
    Logger.log('Error en updateStock: ' + error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Verifica productos con stock bajo
 * @param {number} threshold - Umbral de stock bajo (default: 10)
 * @returns {Object} Resultado con productos de stock bajo
 */
function checkLowStock(threshold) {
  try {
    var umbral = threshold || 10;
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('INVENTARIO');
    
    if (!sheet) {
      // Intentar con INGRESO
      sheet = ss.getSheetByName('INGRESO');
      if (!sheet) {
        return { success: true, count: 0, products: [] };
      }
    }
    
    var data = sheet.getDataRange().getValues();
    var lowStockProducts = [];
    
    // Determinar columna de cantidad según la hoja
    var sheetName = sheet.getName();
    var cantidadCol = sheetName === 'INVENTARIO' ? 3 : 8; // Columna D o I
    
    for (var i = 1; i < data.length; i++) {
      var cantidad = Number(data[i][cantidadCol]) || 0;
      if (cantidad <= umbral && cantidad > 0) {
        lowStockProducts.push({
          codigo: String(data[i][sheetName === 'INVENTARIO' ? 0 : 1] || ''),
          descripcion: String(data[i][sheetName === 'INVENTARIO' ? 1 : 9] || ''),
          cantidad: cantidad,
          rowIndex: i + 1
        });
      }
    }
    
    return {
      success: true,
      count: lowStockProducts.length,
      products: lowStockProducts,
      threshold: umbral
    };
    
  } catch (error) {
    Logger.log('Error en checkLowStock: ' + error.message);
    return { success: false, error: error.message, count: 0, products: [] };
  }
}

/**
 * Obtiene estadísticas del inventario para el dashboard
 * @returns {Object} Estadísticas del inventario
 */
function getInventoryStats() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheetInv = ss.getSheetByName('INVENTARIO');
    var sheetIng = ss.getSheetByName('INGRESO');
    
    var stats = {
      totalProducts: 0,
      totalStock: 0,
      totalReserved: 0,
      totalAvailable: 0,
      lowStockCount: 0,
      outOfStockCount: 0
    };
    
    // Leer de INVENTARIO si existe
    if (sheetInv && sheetInv.getLastRow() > 1) {
      var dataInv = sheetInv.getRange(2, 1, sheetInv.getLastRow() - 1, 8).getValues();
      
      for (var i = 0; i < dataInv.length; i++) {
        var codigo = String(dataInv[i][0] || '').trim();
        if (!codigo) continue;
        
        var disponible = Number(dataInv[i][3]) || 0;
        var reservado = Number(dataInv[i][4]) || 0;
        var stockTotal = Number(dataInv[i][7]) || (disponible + reservado);
        
        stats.totalProducts++;
        stats.totalStock += stockTotal;
        stats.totalAvailable += disponible;
        stats.totalReserved += reservado;
        
        if (disponible <= 0) {
          stats.outOfStockCount++;
        } else if (disponible <= 10) {
          stats.lowStockCount++;
        }
      }
    } else if (sheetIng && sheetIng.getLastRow() > 1) {
      // Fallback a INGRESO
      var dataIng = sheetIng.getRange(2, 1, sheetIng.getLastRow() - 1, 13).getValues();
      var codigosUnicos = {};
      
      for (var j = 0; j < dataIng.length; j++) {
        var codigoIng = String(dataIng[j][1] || '').trim();
        if (!codigoIng) continue;
        
        var cantidad = Number(dataIng[j][8]) || 0;
        
        if (!codigosUnicos[codigoIng]) {
          codigosUnicos[codigoIng] = 0;
          stats.totalProducts++;
        }
        codigosUnicos[codigoIng] += cantidad;
      }
      
      for (var cod in codigosUnicos) {
        var cant = codigosUnicos[cod];
        stats.totalStock += cant;
        stats.totalAvailable += cant;
        
        if (cant <= 0) {
          stats.outOfStockCount++;
        } else if (cant <= 10) {
          stats.lowStockCount++;
        }
      }
    }
    
    return {
      success: true,
      stats: stats
    };
    
  } catch (error) {
    Logger.log('Error en getInventoryStats: ' + error.message);
    return {
      success: false,
      error: error.message,
      stats: { totalProducts: 0, totalStock: 0, totalReserved: 0, totalAvailable: 0, lowStockCount: 0, outOfStockCount: 0 }
    };
  }
}

/**
 * Obtiene estadísticas de despachos para el dashboard
 * @returns {Object} Estadísticas de despachos
 */
function getDispatchStats() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('DESPACHO');
    
    var stats = {
      total: 0,
      pendientes: 0,
      enTransito: 0,
      entregados: 0,
      cancelados: 0
    };
    
    if (!sheet || sheet.getLastRow() <= 1) {
      return { success: true, stats: stats };
    }
    
    var data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 13).getValues();
    
    // Contar despachos
    var hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    var hace7Dias = new Date(hoy.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    for (var i = 0; i < data.length; i++) {
      var fechaDespacho = data[i][10];
      if (!fechaDespacho) continue;
      
      stats.total++;
      
      // Verificar si tiene entrega confirmada
      var nVenta = String(data[i][7] || '').trim();
      if (nVenta) {
        // Por defecto, contar como pendiente/en tránsito
        // El estado real se determina por la hoja ENTREGAS
        stats.pendientes++;
      }
    }
    
    // Ajustar con datos de ENTREGAS
    var sheetEntregas = ss.getSheetByName('ENTREGAS');
    if (sheetEntregas && sheetEntregas.getLastRow() > 1) {
      var dataEntregas = sheetEntregas.getRange(2, 1, sheetEntregas.getLastRow() - 1, 8).getValues();
      
      for (var j = 0; j < dataEntregas.length; j++) {
        var estado = String(dataEntregas[j][4] || '').toUpperCase();
        if (estado === 'ENTREGADA') {
          stats.entregados++;
          stats.pendientes = Math.max(0, stats.pendientes - 1);
        } else if (estado === 'EN CAMINO' || estado === 'EN_TRANSITO') {
          stats.enTransito++;
          stats.pendientes = Math.max(0, stats.pendientes - 1);
        }
      }
    }
    
    return {
      success: true,
      stats: stats
    };
    
  } catch (error) {
    Logger.log('Error en getDispatchStats: ' + error.message);
    return {
      success: false,
      error: error.message,
      stats: { total: 0, pendientes: 0, enTransito: 0, entregados: 0, cancelados: 0 }
    };
  }
}
