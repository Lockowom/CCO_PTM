/**
 * NotasVenta.gs - Módulo de Notas de Venta
 * Lee datos de la hoja ORDENES
 * Estructura: 
 * A - Fecha Entrega N.Venta
 * B - N.Venta
 * C - Estado
 * E - Nombre Cliente
 * G - Nombre Vendedor
 * I - Cod.Producto
 * J - Descripción Producto
 * K - Unidad Medida
 * L - Pedido
 */

// Posibles nombres de la hoja de órdenes - "N.V DIARIAS" es el nombre principal
var SHEET_ORDENES_NAMES = ['N.V DIARIAS', 'N.V. DIARIAS', 'NV DIARIAS', 'PICKING', 'ORDENES', 'ÓRDENES', 'Ordenes', 'Órdenes', 'ordenes'];

/**
 * Obtiene la hoja de órdenes buscando por diferentes nombres
 */
function getOrdenesSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  for (var i = 0; i < SHEET_ORDENES_NAMES.length; i++) {
    var sheet = ss.getSheetByName(SHEET_ORDENES_NAMES[i]);
    if (sheet) return sheet;
  }
  return null;
}

// ==================== FUNCIONES AUXILIARES DE NOTAS DE VENTA ====================
// NOTA: La función principal getNotasVenta() está en Code.gs para evitar duplicados

/**
 * Calcula estadísticas de las Notas de Venta
 */
function getEstadisticasNV(notasVenta) {
  var stats = {
    totalNV: 0,
    pendientes: 0,
    aprobadas: 0,
    enPicking: 0,      // Solo PENDIENTE_PICKING (Pend. Picking)
    enPickingActivo: 0, // EN_PICKING (En proceso de picking)
    enPacking: 0,
    listasDespacho: 0,
    despachadas: 0,
    entregadas: 0,
    totalProductos: 0,
    clientesUnicos: 0,
    vendedoresUnicos: 0
  };
  
  var clientes = {};
  var vendedores = {};
  
  notasVenta.forEach(function(nv) {
    stats.totalNV++;
    stats.totalProductos += nv.totalItems;
    
    // Normalizar estado: quitar guiones bajos, espacios extras
    var estado = (nv.estado || '').toUpperCase().replace(/_/g, ' ').replace(/\s+/g, ' ').trim();
    
    // PENDIENTE_PICKING o PENDIENTE PICKING cuenta como "enPicking" (Pend. Picking)
    if (estado === 'PENDIENTE PICKING' || estado.indexOf('PENDIENTE PICKING') !== -1) {
      stats.enPicking++;
    } else if (estado === 'EN PICKING' || estado.indexOf('EN PICKING') !== -1) {
      stats.enPickingActivo++;
    } else if (estado === 'APROBADA' || estado === 'APROBADO') {
      stats.aprobadas++;
    } else if (estado.indexOf('PACKING') !== -1) {
      stats.enPacking++;
    } else if (estado.indexOf('LISTO') !== -1 || estado.indexOf('DESPACHO') !== -1) {
      stats.listasDespacho++;
    } else if (estado.indexOf('DESPACHAD') !== -1 || estado.indexOf('TRANSITO') !== -1) {
      stats.despachadas++;
    } else if (estado.indexOf('ENTREGAD') !== -1) {
      stats.entregadas++;
    } else if (estado === 'PENDIENTE' || estado === 'NUEVA') {
      stats.pendientes++;
    } else {
      // Cualquier otro estado se considera pendiente
      stats.pendientes++;
    }
    
    if (nv.cliente) clientes[nv.cliente] = true;
    if (nv.vendedor) vendedores[nv.vendedor] = true;
  });
  
  stats.clientesUnicos = Object.keys(clientes).length;
  stats.vendedoresUnicos = Object.keys(vendedores).length;
  
  return stats;
}

/**
 * Obtiene detalle de una Nota de Venta específica
 * @param {string} notaVenta - Número de N.V
 * @returns {Object} - Detalle de la N.V
 */
function getDetalleNotaVenta(notaVenta) {
  try {
    var resultado = getNotasVenta();
    if (!resultado.success) return resultado;
    
    var nv = resultado.notasVenta.find(function(n) {
      return n.notaVenta === notaVenta;
    });
    
    if (!nv) {
      return { success: false, error: 'Nota de Venta no encontrada' };
    }
    
    return {
      success: true,
      notaVenta: nv
    };
    
  } catch (e) {
    Logger.log('Error en getDetalleNotaVenta: ' + e.message);
    return { success: false, error: e.message };
  }
}

/**
 * Filtra Notas de Venta por estado
 * @param {string} estado - Estado a filtrar
 * @returns {Object} - Notas de Venta filtradas
 */
function getNotasVentaPorEstado(estado) {
  try {
    var resultado = getNotasVenta();
    if (!resultado.success) return resultado;
    
    var estadoBuscado = (estado || '').toUpperCase().replace(/_/g, ' ');
    
    var filtradas = resultado.notasVenta.filter(function(nv) {
      var estadoNV = (nv.estado || '').toUpperCase().replace(/_/g, ' ');
      return estadoNV.indexOf(estadoBuscado) !== -1;
    });
    
    return {
      success: true,
      notasVenta: filtradas,
      total: filtradas.length
    };
    
  } catch (e) {
    Logger.log('Error en getNotasVentaPorEstado: ' + e.message);
    return { success: false, error: e.message };
  }
}

/**
 * Busca Notas de Venta por término
 * @param {string} termino - Término de búsqueda
 * @returns {Object} - Notas de Venta encontradas
 */
function buscarNotasVenta(termino) {
  try {
    var resultado = getNotasVenta();
    if (!resultado.success) return resultado;
    
    if (!termino || termino.trim() === '') {
      return resultado;
    }
    
    var terminoLower = termino.toLowerCase().trim();
    
    var filtradas = resultado.notasVenta.filter(function(nv) {
      return nv.notaVenta.toLowerCase().indexOf(terminoLower) !== -1 ||
             nv.cliente.toLowerCase().indexOf(terminoLower) !== -1 ||
             nv.vendedor.toLowerCase().indexOf(terminoLower) !== -1 ||
             nv.productos.some(function(p) {
               return p.codigo.toLowerCase().indexOf(terminoLower) !== -1 ||
                      p.descripcion.toLowerCase().indexOf(terminoLower) !== -1;
             });
    });
    
    return {
      success: true,
      notasVenta: filtradas,
      total: filtradas.length
    };
    
  } catch (e) {
    Logger.log('Error en buscarNotasVenta: ' + e.message);
    return { success: false, error: e.message };
  }
}

/**
 * Actualiza el estado de una Nota de Venta
 * @param {string} notaVenta - Número de N.V
 * @param {string} nuevoEstado - Nuevo estado
 * @param {string} usuario - Usuario que realiza el cambio
 * @returns {Object} - Resultado de la operación
 */
function actualizarEstadoNV(notaVenta, nuevoEstado, usuario) {
  try {
    var sheet = getOrdenesSheet();
    
    if (!sheet) {
      return { success: false, error: 'Hoja de órdenes no encontrada (PICKING/N.V DIARIAS)' };
    }
    
    var data = sheet.getDataRange().getValues();
    var nVentaBuscada = notaVenta.trim();
    var filasActualizadas = 0;
    var estadoAnterior = '';
    
    for (var i = 1; i < data.length; i++) {
      var nVenta = String(data[i][1] || '').trim();
      if (nVenta === nVentaBuscada) {
        if (filasActualizadas === 0) {
          estadoAnterior = String(data[i][2] || '');
        }
        sheet.getRange(i + 1, 3).setValue(nuevoEstado); // Columna C
        filasActualizadas++;
      }
    }
    
    if (filasActualizadas === 0) {
      return { success: false, error: 'Nota de Venta no encontrada' };
    }
    
    // IMPORTANTE: Invalidar caché de N.V para que se reflejen los cambios
    invalidateNVCache();
    
    // Registrar cambio en MOVIMIENTOS si existe la función
    if (typeof registrarMovimiento === 'function') {
      registrarMovimiento('CAMBIO_ESTADO_NV', notaVenta, 0, '', 
        'De: ' + estadoAnterior + ' A: ' + nuevoEstado, usuario || 'Sistema');
    }
    
    Logger.log('Estado actualizado para N.V: ' + notaVenta + ' - ' + filasActualizadas + ' filas');
    
    return {
      success: true,
      notaVenta: notaVenta,
      estadoAnterior: estadoAnterior,
      nuevoEstado: nuevoEstado,
      filasActualizadas: filasActualizadas
    };
    
  } catch (e) {
    Logger.log('Error en actualizarEstadoNV: ' + e.message);
    return { success: false, error: 'Error al actualizar estado: ' + e.message };
  }
}
