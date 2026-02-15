/**
 * PickingAPI.gs
 * API endpoints para el nuevo flujo de picking
 * 
 * Este módulo expone funciones que el frontend puede llamar
 * para interactuar con el sistema de picking
 */

// ==================== OBTENER N.V PENDIENTES ====================

/**
 * Obtiene todas las N.V con estado PENDIENTE PICKING
 * Lee de N.V DIARIAS y filtra por estado PENDIENTE PICKING
 * @returns {Object} - {success, notasVenta}
 */
function getNVPendientesPicking() {
  try {
    Logger.log('=== getNVPendientesPicking ===');
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var todasLasNV = [];
    
    // Primero intentar leer de hoja PICKING (si existe y tiene datos)
    var sheetPicking = ss.getSheetByName('PICKING');
    if (sheetPicking && sheetPicking.getLastRow() > 1) {
      var resultPicking = getNVDesdePicking(sheetPicking);
      if (resultPicking.success && resultPicking.notasVenta.length > 0) {
        Logger.log('N.V encontradas en PICKING: ' + resultPicking.notasVenta.length);
        todasLasNV = todasLasNV.concat(resultPicking.notasVenta);
      }
    }
    
    // También leer de N.V DIARIAS para incluir N.V que aún no se han migrado
    var sheetNVDiarias = ss.getSheetByName('N.V DIARIAS');
    if (sheetNVDiarias && sheetNVDiarias.getLastRow() > 1) {
      var resultNVDiarias = getNVDesdeNVDiarias(sheetNVDiarias);
      if (resultNVDiarias.success && resultNVDiarias.notasVenta.length > 0) {
        Logger.log('N.V encontradas en N.V DIARIAS: ' + resultNVDiarias.notasVenta.length);
        
        // Agregar solo las N.V que no están ya en la lista (evitar duplicados)
        for (var i = 0; i < resultNVDiarias.notasVenta.length; i++) {
          var nvDiaria = resultNVDiarias.notasVenta[i];
          var yaExiste = false;
          
          for (var j = 0; j < todasLasNV.length; j++) {
            if (todasLasNV[j].notaVenta === nvDiaria.notaVenta) {
              yaExiste = true;
              break;
            }
          }
          
          if (!yaExiste) {
            todasLasNV.push(nvDiaria);
          }
        }
      }
    }
    
    if (todasLasNV.length === 0) {
      return {
        success: true,
        notasVenta: [],
        mensaje: 'No hay N.V pendientes de picking'
      };
    }
    
    Logger.log('Total N.V pendientes: ' + todasLasNV.length);
    
    return {
      success: true,
      notasVenta: todasLasNV,
      total: todasLasNV.length
    };
    
  } catch (e) {
    Logger.log('Error en getNVPendientesPicking: ' + e.message);
    return {
      success: false,
      error: 'Error al obtener N.V pendientes: ' + e.message,
      notasVenta: []
    };
  }
}

/**
 * Lee N.V desde la hoja PICKING
 */
function getNVDesdePicking(sheet) {
  var data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 12).getValues();
  var nvMap = {};
  
  // Agrupar productos por N.V
  for (var i = 0; i < data.length; i++) {
    var row = data[i];
    var notaVenta = String(row[1] || '').trim();
    
    if (!notaVenta) continue;
    
    if (!nvMap[notaVenta]) {
      nvMap[notaVenta] = {
        notaVenta: notaVenta,
        fechaEntrega: row[0] instanceof Date ? 
          Utilities.formatDate(row[0], Session.getScriptTimeZone(), 'dd/MM/yyyy') : 
          String(row[0] || ''),
        estado: String(row[2] || ''),
        cliente: String(row[4] || ''),
        productos: [],
        totalProductos: 0
      };
    }
    
    nvMap[notaVenta].productos.push({
      codigo: String(row[8] || ''),
      descripcion: String(row[9] || ''),
      cantidad: Number(row[11]) || 0
    });
    nvMap[notaVenta].totalProductos++;
  }
  
  // Convertir map a array
  var notasVenta = [];
  for (var nv in nvMap) {
    notasVenta.push(nvMap[nv]);
  }
  
  Logger.log('N.V encontradas en PICKING: ' + notasVenta.length);
  
  return {
    success: true,
    notasVenta: notasVenta,
    total: notasVenta.length
  };
}

/**
 * Lee N.V desde N.V DIARIAS con estado PENDIENTE PICKING
 */
function getNVDesdeNVDiarias(sheet) {
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    return {
      success: true,
      notasVenta: [],
      mensaje: 'No hay N.V en N.V DIARIAS'
    };
  }
  
  var data = sheet.getRange(2, 1, lastRow - 1, 12).getValues();
  var nvMap = {};
  
  // Agrupar productos por N.V con estado PENDIENTE PICKING
  for (var i = 0; i < data.length; i++) {
    var row = data[i];
    var notaVenta = String(row[1] || '').trim();
    var estadoRaw = String(row[2] || '').trim();
    
    if (!notaVenta) continue;
    
    // Normalizar estado para comparación consistente
    var estadoNormalizado = normalizarEstado(estadoRaw);
    
    // Filtrar solo PENDIENTE PICKING
    if (estadoNormalizado !== 'PENDIENTE_PICKING') {
      continue;
    }
    
    Logger.log('N.V ' + notaVenta + ' con estado normalizado: ' + estadoNormalizado);
    
    if (!nvMap[notaVenta]) {
      nvMap[notaVenta] = {
        notaVenta: notaVenta,
        fechaEntrega: row[0] instanceof Date ? 
          Utilities.formatDate(row[0], Session.getScriptTimeZone(), 'dd/MM/yyyy') : 
          String(row[0] || ''),
        estado: estadoRaw,
        cliente: String(row[4] || ''),
        productos: [],
        totalProductos: 0
      };
    }
    
    nvMap[notaVenta].productos.push({
      codigo: String(row[8] || ''),
      descripcion: String(row[9] || ''),
      cantidad: Number(row[11]) || 0
    });
    nvMap[notaVenta].totalProductos++;
  }
  
  // Convertir map a array
  var notasVenta = [];
  for (var nv in nvMap) {
    notasVenta.push(nvMap[nv]);
  }
  
  Logger.log('N.V encontradas en N.V DIARIAS con estado PENDIENTE PICKING: ' + notasVenta.length);
  
  return {
    success: true,
    notasVenta: notasVenta,
    total: notasVenta.length
  };
}

// ==================== OBTENER PRODUCTOS DE N.V ====================

/**
 * Obtiene todos los productos de una N.V
 * Busca primero en PICKING, luego en N.V DIARIAS
 * @param {string} notaVenta - Número de nota de venta
 * @returns {Object} - {success, productos, cliente, fechaEntrega}
 */
function getProductosNV(notaVenta) {
  try {
    Logger.log('=== getProductosNV: ' + notaVenta + ' ===');
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var nVentaBuscada = String(notaVenta).trim();
    
    // Intentar primero en PICKING
    var sheetPicking = ss.getSheetByName('PICKING');
    if (sheetPicking && sheetPicking.getLastRow() > 1) {
      var resultPicking = buscarProductosEnHoja(sheetPicking, nVentaBuscada);
      if (resultPicking.success && resultPicking.productos.length > 0) {
        Logger.log('Productos encontrados en PICKING: ' + resultPicking.productos.length);
        return resultPicking;
      }
    }
    
    // Si no está en PICKING, buscar en N.V DIARIAS
    var sheetNVDiarias = ss.getSheetByName('N.V DIARIAS');
    if (!sheetNVDiarias) {
      return {
        success: false,
        error: 'N.V no encontrada en ninguna hoja'
      };
    }
    
    var resultNVDiarias = buscarProductosEnHoja(sheetNVDiarias, nVentaBuscada);
    if (resultNVDiarias.success && resultNVDiarias.productos.length > 0) {
      Logger.log('Productos encontrados en N.V DIARIAS: ' + resultNVDiarias.productos.length);
      return resultNVDiarias;
    }
    
    return {
      success: false,
      error: 'N.V ' + notaVenta + ' no encontrada'
    };
    
  } catch (e) {
    Logger.log('Error en getProductosNV: ' + e.message);
    return {
      success: false,
      error: 'Error al obtener productos: ' + e.message
    };
  }
}

/**
 * Busca productos de una N.V en una hoja específica
 * Incluye las ubicaciones disponibles de cada producto
 */
function buscarProductosEnHoja(sheet, notaVenta) {
  var data = sheet.getDataRange().getValues();
  var productos = [];
  var cliente = '';
  var fechaEntrega = '';
  
  for (var i = 1; i < data.length; i++) {
    var nVentaFila = String(data[i][1] || '').trim();
    
    if (nVentaFila === notaVenta) {
      if (!cliente) {
        cliente = String(data[i][4] || '');
        fechaEntrega = data[i][0] instanceof Date ? 
          Utilities.formatDate(data[i][0], Session.getScriptTimeZone(), 'dd/MM/yyyy') : 
          String(data[i][0] || '');
      }
      
      var codigo = String(data[i][8] || '').trim();
      
      // Buscar ubicaciones para este producto
      var ubicacionesProducto = [];
      try {
        var resultUbic = getUbicacionesDisponibles(codigo);
        if (resultUbic.success && resultUbic.ubicaciones && resultUbic.ubicaciones.length > 0) {
          for (var u = 0; u < resultUbic.ubicaciones.length; u++) {
            ubicacionesProducto.push(resultUbic.ubicaciones[u].ubicacion);
          }
        }
      } catch (e) {
        Logger.log('Error al obtener ubicaciones para ' + codigo + ': ' + e.message);
      }
      
      productos.push({
        codigo: codigo,
        descripcion: String(data[i][9] || '').trim(),
        unidadMedida: String(data[i][10] || '').trim(),
        pedido: Number(data[i][11]) || 0,
        ubicaciones: ubicacionesProducto
      });
    }
  }
  
  return {
    success: productos.length > 0,
    notaVenta: notaVenta,
    cliente: cliente,
    fechaEntrega: fechaEntrega,
    productos: productos,
    totalProductos: productos.length
  };
}

// ==================== ESTADÍSTICAS ====================

/**
 * Obtiene estadísticas de picking para los cards superiores
 * @returns {Object} - {success, pendientes, enPicking, completadas}
 */
// NOTA: Renombrada para evitar conflicto con PickingEnhanced.gs que tiene version mas completa
function getPickingStatsSimple() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // Contar N.V pendientes en PICKING
    var sheetPicking = ss.getSheetByName('PICKING');
    var pendientes = 0;
    
    if (sheetPicking && sheetPicking.getLastRow() > 1) {
      var data = sheetPicking.getRange(2, 2, sheetPicking.getLastRow() - 1, 1).getValues();
      var nvSet = {};
      for (var i = 0; i < data.length; i++) {
        var nv = String(data[i][0] || '').trim();
        if (nv) nvSet[nv] = true;
      }
      pendientes = Object.keys(nvSet).length;
    }
    
    // Contar N.V en PACKING
    var sheetPacking = ss.getSheetByName('PACKING');
    var enPicking = 0;
    
    if (sheetPacking && sheetPacking.getLastRow() > 1) {
      var dataPacking = sheetPacking.getRange(2, 2, sheetPacking.getLastRow() - 1, 1).getValues();
      var nvSetPacking = {};
      for (var j = 0; j < dataPacking.length; j++) {
        var nvPacking = String(dataPacking[j][0] || '').trim();
        if (nvPacking) nvSetPacking[nvPacking] = true;
      }
      enPicking = Object.keys(nvSetPacking).length;
    }
    
    // Contar completadas hoy (desde log)
    var sheetLog = ss.getSheetByName('PICKING_LOG');
    var completadas = 0;
    
    if (sheetLog && sheetLog.getLastRow() > 1) {
      var dataLog = sheetLog.getDataRange().getValues();
      var hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      
      for (var k = 1; k < dataLog.length; k++) {
        var fecha = dataLog[k][1];
        var tipo = dataLog[k][2];
        
        if (fecha instanceof Date && tipo === 'MOVER') {
          var fechaLog = new Date(fecha);
          fechaLog.setHours(0, 0, 0, 0);
          
          if (fechaLog.getTime() === hoy.getTime()) {
            completadas++;
          }
        }
      }
    }
    
    return {
      success: true,
      pendientes: pendientes,
      enPicking: enPicking,
      completadas: completadas
    };
    
  } catch (e) {
    Logger.log('Error en getPickingStats: ' + e.message);
    return {
      success: false,
      error: e.message,
      pendientes: 0,
      enPicking: 0,
      completadas: 0
    };
  }
}

// ==================== FUNCIONES DE COMPATIBILIDAD ====================

/**
 * Alias para compatibilidad con código existente
 */
function getNotasVentaPendientes() {
  return getNVPendientesPicking();
}

// NOTA: Renombrada - usar version de NotasVenta.gs
function getDetalleNotaVentaPicking(notaVenta) {
  return getProductosNV(notaVenta);
}

