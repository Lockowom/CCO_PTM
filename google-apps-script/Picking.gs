/**
 * Picking.gs - Módulo de Picking REESTRUCTURADO
 * Proceso separado de Packing
 * Estructura desde ORDENES:
 * Fecha de entrega N.V (A), Nota de Venta (B), Estado (C), Código Prod (I), Descripción (J), Pedido (L)
 * Incluye trazabilidad de estados y transiciones
 */

// PICKING es el nombre correcto de la hoja de órdenes
var SHEET_ORDENES = 'PICKING';
var SHEET_MOVIMIENTOS = 'MOVIMIENTOS';

// Estados del flujo de picking
var ESTADOS_PICKING = {
  PENDIENTE_PICKING: 'PENDIENTE PICKING',
  PENDIENTE_PACKING: 'PENDIENTE PACKING'
};

// ==================== OBTENER GUÍAS DE PICKING ====================

/**
 * Obtiene las guías de picking pendientes
 * Filtra órdenes con estado "PENDIENTE PICKING" desde ORDENES
 * @returns {Object} - {success, guias}
 */
function getGuiasPicking() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_ORDENES);
    
    if (!sheet) {
      return { success: false, error: 'Hoja PICKING no encontrada' };
    }
    
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      return { success: true, guias: [] };
    }
    
    var data = sheet.getRange(2, 1, lastRow - 1, 18).getValues();
    var guiasMap = {};
    
    for (var i = 0; i < data.length; i++) {
      var row = data[i];
      var estado = String(row[2] || '').trim().toUpperCase();
      
      // Filtrar solo órdenes pendientes de picking
      if (estado !== 'PENDIENTE PICKING' && estado !== 'PENDIENTE_PICKING') {
        continue;
      }
      
      var nVenta = String(row[1] || '').trim();
      if (!nVenta) continue;
      
      // Agrupar productos por Nota de Venta
      if (!guiasMap[nVenta]) {
        guiasMap[nVenta] = {
          notaVenta: nVenta,
          fechaEntrega: row[0],                    // Columna A
          fechaEntregaNV: row[0],                  // Alias
          estado: estado,                          // Columna C
          codCliente: String(row[3] || ''),        // Columna D
          cliente: String(row[4] || ''),           // Columna E
          codVendedor: String(row[5] || ''),       // Columna F
          vendedor: String(row[6] || ''),          // Columna G
          zona: String(row[7] || ''),              // Columna H
          productos: [],
          totalItems: 0,
          productosRecolectados: 0
        };
      }
      
      guiasMap[nVenta].productos.push({
        codigo: String(row[8] || ''),              // Columna I - Código Prod
        codigoProducto: String(row[8] || ''),      // Alias
        descripcion: String(row[9] || ''),         // Columna J - Descripción
        unidadMedida: String(row[10] || ''),       // Columna K - U.M
        pedido: Number(row[11]) || 0,              // Columna L - Pedido
        recolectado: false,
        rowIndex: i + 2
      });
      
      guiasMap[nVenta].totalItems++;
    }
    
    var guias = Object.values(guiasMap);
    
    // Ordenar por fecha de entrega
    guias.sort(function(a, b) {
      return new Date(a.fechaEntrega) - new Date(b.fechaEntrega);
    });
    
    return {
      success: true,
      guias: guias,
      total: guias.length
    };
    
  } catch (e) {
    Logger.log('Error en getGuiasPicking: ' + e.message);
    return { success: false, error: 'Error al obtener guías: ' + e.message };
  }
}

// ==================== MARCAR PRODUCTO RECOLECTADO ====================

/**
 * Marca un producto como recolectado durante el picking
 * @param {string} notaVenta - Número de nota de venta
 * @param {string} codigoProducto - Código del producto
 * @returns {Object} - {success}
 */
// NOTA: Renombrada para evitar conflicto con PickingEstados.gs que tiene la version actualizada
function marcarProductoRecolectado_legacy(notaVenta, codigoProducto) {
  try {
    var props = PropertiesService.getScriptProperties();
    var key = 'PICKING_' + notaVenta;
    var recolectados = JSON.parse(props.getProperty(key) || '[]');
    
    if (recolectados.indexOf(codigoProducto) === -1) {
      recolectados.push(codigoProducto);
      props.setProperty(key, JSON.stringify(recolectados));
    }
    
    return {
      success: true,
      notaVenta: notaVenta,
      codigoProducto: codigoProducto,
      totalRecolectados: recolectados.length
    };
    
  } catch (e) {
    Logger.log('Error en marcarProductoRecolectado: ' + e.message);
    return { success: false, error: e.message };
  }
}

/**
 * Obtiene los productos recolectados de una N.V
 * @param {string} notaVenta - Número de nota de venta
 * @returns {Array} - Lista de códigos recolectados
 */
// NOTA: Renombrada para evitar conflicto con PickingEstados.gs que tiene la version actualizada
function getProductosRecolectados_legacy(notaVenta) {
  try {
    var props = PropertiesService.getScriptProperties();
    var key = 'PICKING_' + notaVenta;
    return JSON.parse(props.getProperty(key) || '[]');
  } catch (e) {
    return [];
  }
}

// ==================== COMPLETAR PICKING ====================

/**
 * Completa el picking de una Nota de Venta
 * Cambia estado a PENDIENTE PACKING
 * @param {string} notaVenta - Número de nota de venta
 * @param {string} usuario - Usuario que completa el picking
 * @returns {Object} - {success, error}
 */
function completarPickingNV(notaVenta, usuario) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_ORDENES);
    
    if (!sheet) {
      return { success: false, error: 'Hoja PICKING no encontrada' };
    }
    
    var data = sheet.getDataRange().getValues();
    var nVentaBuscada = notaVenta.trim();
    var filasActualizadas = 0;
    var estadoAnterior = '';
    
    // Actualizar estado a PENDIENTE PACKING
    for (var j = 1; j < data.length; j++) {
      var nVentaFila = String(data[j][1] || '').trim();
      if (nVentaFila === nVentaBuscada) {
        estadoAnterior = String(data[j][2] || '');
        sheet.getRange(j + 1, 3).setValue(ESTADOS_PICKING.PENDIENTE_PACKING); // Columna C
        filasActualizadas++;
      }
    }
    
    if (filasActualizadas === 0) {
      return { success: false, error: 'Nota de venta ' + notaVenta + ' no encontrada' };
    }
    
    // IMPORTANTE: Invalidar caché de N.V para que se reflejen los cambios en tiempo real
    if (typeof invalidateNVCache === 'function') {
      invalidateNVCache();
    }
    
    // Registrar en historial
    registrarCambioEstadoPicking(notaVenta, estadoAnterior, ESTADOS_PICKING.PENDIENTE_PACKING, usuario);
    
    // Limpiar productos recolectados
    var props = PropertiesService.getScriptProperties();
    props.deleteProperty('PICKING_' + notaVenta);
    
    Logger.log('Picking completado para N.V: ' + notaVenta + ' por ' + usuario);
    
    return {
      success: true,
      notaVenta: notaVenta,
      nuevoEstado: ESTADOS_PICKING.PENDIENTE_PACKING,
      filasActualizadas: filasActualizadas
    };
    
  } catch (e) {
    Logger.log('Error en completarPickingNV: ' + e.message);
    return { success: false, error: 'Error al completar picking: ' + e.message };
  }
}

// ==================== FUNCIONES AUXILIARES ====================

/**
 * Registra un cambio de estado en el historial de movimientos
 */
function registrarCambioEstadoPicking(notaVenta, estadoAnterior, nuevoEstado, usuario) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_MOVIMIENTOS);
    
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_MOVIMIENTOS);
      sheet.appendRow(['ID', 'FechaHora', 'TipoMovimiento', 'Codigo', 'Cantidad', 'Ubicacion', 'Referencia', 'Usuario']);
    }
    
    var id = 'MOV-' + new Date().getTime();
    sheet.appendRow([
      id,
      new Date(),
      'CAMBIO_ESTADO_PICKING',
      notaVenta,
      0,
      '',
      'De: ' + estadoAnterior + ' A: ' + nuevoEstado,
      usuario || 'Sistema'
    ]);
    
  } catch (e) {
    Logger.log('Error al registrar cambio de estado: ' + e.message);
  }
}

/**
 * Obtiene el historial de cambios de estado para una Nota de Venta
 * @param {string} notaVenta - Número de nota de venta
 * @returns {Object} - {success, historial}
 */
function getHistorialEstadosNV(notaVenta) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_MOVIMIENTOS);
    
    if (!sheet) {
      return { success: true, historial: [] };
    }
    
    var data = sheet.getDataRange().getValues();
    var historial = [];
    var nVentaBuscada = notaVenta.trim();
    
    for (var i = 1; i < data.length; i++) {
      var tipo = String(data[i][2] || '');
      var codigo = String(data[i][3] || '').trim();
      
      if ((tipo.indexOf('CAMBIO_ESTADO') !== -1 || tipo === 'EMPAQUE_COMPLETADO') && codigo === nVentaBuscada) {
        var referencia = String(data[i][6] || '');
        var partes = referencia.split(' A: ');
        var estadoAnterior = partes[0] ? partes[0].replace('De: ', '') : '';
        var estadoNuevo = partes[1] || tipo;
        
        historial.push({
          id: data[i][0],
          fechaHora: data[i][1],
          tipo: tipo,
          estadoAnterior: estadoAnterior,
          estadoNuevo: estadoNuevo,
          referencia: referencia,
          usuario: data[i][7]
        });
      }
    }
    
    // Ordenar por fecha descendente
    historial.sort(function(a, b) {
      return new Date(b.fechaHora) - new Date(a.fechaHora);
    });
    
    return {
      success: true,
      notaVenta: notaVenta,
      historial: historial
    };
    
  } catch (e) {
    Logger.log('Error en getHistorialEstadosNV: ' + e.message);
    return { success: false, error: e.message };
  }
}

/**
 * Filtra órdenes por estado
 * @param {string} estado - Estado a filtrar
 * @returns {Object} - {success, ordenes}
 */
function filtrarOrdenesPorEstado(estado) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_ORDENES);
    
    if (!sheet) {
      return { success: false, error: 'Hoja PICKING no encontrada' };
    }
    
    var data = sheet.getDataRange().getValues();
    var estadoBuscado = estado.trim().toUpperCase();
    var ordenesMap = {};
    
    for (var i = 1; i < data.length; i++) {
      var estadoFila = String(data[i][2] || '').trim().toUpperCase();
      
      // Normalizar estados para comparación
      var estadoNormalizado = estadoFila.replace(/_/g, ' ');
      var estadoBuscadoNormalizado = estadoBuscado.replace(/_/g, ' ');
      
      if (estadoNormalizado !== estadoBuscadoNormalizado) continue;
      
      var nVenta = String(data[i][1] || '').trim();
      if (!nVenta) continue;
      
      if (!ordenesMap[nVenta]) {
        ordenesMap[nVenta] = {
          notaVenta: nVenta,
          fechaEntrega: data[i][0],
          estado: estadoFila,
          cliente: String(data[i][4] || ''),
          productos: [],
          totalItems: 0
        };
      }
      
      ordenesMap[nVenta].productos.push({
        codigo: String(data[i][8] || ''),
        descripcion: String(data[i][9] || ''),
        pedido: Number(data[i][11]) || 0
      });
      
      ordenesMap[nVenta].totalItems++;
    }
    
    return {
      success: true,
      ordenes: Object.values(ordenesMap),
      estado: estado
    };
    
  } catch (e) {
    Logger.log('Error en filtrarOrdenesPorEstado: ' + e.message);
    return { success: false, error: e.message };
  }
}

/**
 * Obtiene las órdenes pendientes de packing (para compatibilidad)
 * @returns {Object} - {success, ordenes}
 */
function getOrdenesPacking() {
  return filtrarOrdenesPorEstado(ESTADOS_PICKING.PENDIENTE_PACKING);
}

// ==================== FUNCIONES DE COMPATIBILIDAD ====================

/**
 * Funciones de compatibilidad con el frontend existente
 */
// NOTA: Renombrada - usar version de Orders.gs
function getPickingGuidesPicking(status) {
  if (status === 'PENDIENTE' || status === 'PENDIENTE_PICKING') {
    var resultado = getGuiasPicking();
    if (!resultado.success) return resultado;
    
    return {
      success: true,
      guides: resultado.guias.map(function(g) {
        return {
          id: g.notaVenta,
          numeroGuia: g.notaVenta,
          numeroOrden: g.notaVenta,
          cliente: g.cliente,
          totalItems: g.totalItems,
          productos: g.productos
        };
      })
    };
  } else if (status === 'COMPLETADA') {
    return { success: true, guides: [] };
  }
  
  return { success: true, guides: [] };
}

// NOTA: Renombrada - usar version de Orders.gs
function completePickingGuidePicking(guideId, usuario) {
  // Usar la versión enhanced que registra en PICKING_LOG
  if (typeof completarPickingEnhanced === 'function') {
    return completarPickingEnhanced(guideId, usuario);
  }
  return completarPickingNV(guideId, usuario);
}


/**
 * Obtiene el detalle de una guía de picking específica
 * @param {string} notaVenta - Número de nota de venta
 * @returns {Object} - {success, guia, productos}
 */
function getDetalleGuiaPicking(notaVenta) {
  try {
    var resultado = getGuiasPicking();
    if (!resultado.success) return resultado;
    
    var guiaEncontrada = null;
    for (var i = 0; i < resultado.guias.length; i++) {
      if (resultado.guias[i].notaVenta === notaVenta) {
        guiaEncontrada = resultado.guias[i];
        break;
      }
    }
    
    if (!guiaEncontrada) {
      // Buscar en todas las órdenes, no solo pendientes
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var sheet = ss.getSheetByName(SHEET_ORDENES);
      
      if (!sheet) return { success: false, error: 'Hoja PICKING no encontrada' };
      
      var data = sheet.getDataRange().getValues();
      var productos = [];
      var guiaInfo = null;
      
      for (var j = 1; j < data.length; j++) {
        var nVenta = String(data[j][1] || '').trim();
        if (nVenta === notaVenta) {
          if (!guiaInfo) {
            guiaInfo = {
              notaVenta: nVenta,
              fechaEntrega: data[j][0],
              estado: String(data[j][2] || ''),
              cliente: String(data[j][4] || ''),
              vendedor: String(data[j][6] || '')
            };
          }
          productos.push({
            codigo: String(data[j][8] || ''),
            descripcion: String(data[j][9] || ''),
            unidadMedida: String(data[j][10] || ''),
            pedido: Number(data[j][11]) || 0
          });
        }
      }
      
      if (guiaInfo) {
        guiaInfo.productos = productos;
        guiaInfo.totalItems = productos.length;
        return { success: true, guia: guiaInfo, productos: productos };
      }
      
      return { success: false, error: 'Nota de venta no encontrada' };
    }
    
    return {
      success: true,
      guia: guiaEncontrada,
      productos: guiaEncontrada.productos
    };
    
  } catch (e) {
    Logger.log('Error en getDetalleGuiaPicking: ' + e.message);
    return { success: false, error: e.message };
  }
}

/**
 * Alias para completar picking (OBSOLETO - usar completarPicking de FlowManager.gs)
 * @param {string} notaVenta - Número de nota de venta
 * @returns {Object} - {success}
 * @deprecated Usar completarPicking de FlowManager.gs
 */
function completarPicking_OLD(notaVenta) {
  return completarPickingNV(notaVenta, 'Sistema');
}
