/**
 * PickingManager.gs
 * Módulo de gestión avanzada de picking
 * 
 * Este módulo maneja:
 * - Marcar productos como "Sin Stock"
 * - Estados de N.V parcializadas
 * - Confirmación de picking con descuento automático
 * - Historial de picking
 */

// ==================== CONFIGURACIÓN ====================

var PICKING_SHEET = 'PICKING';
var MOVIMIENTOS_SHEET = 'MOVIMIENTOS';

// Estados de picking
var PICKING_ESTADOS = {
  PENDIENTE_PICKING: 'PENDIENTE PICKING',
  EN_PICKING: 'EN PICKING',
  PARCIALIZADA: 'PARCIALIZADA',
  PENDIENTE_PACKING: 'PENDIENTE PACKING',
  COMPLETADA: 'COMPLETADA'
};

// Estados de productos en picking
var PRODUCTO_ESTADOS = {
  PENDIENTE: 'PENDIENTE',
  PICKEADO: 'PICKEADO',
  SIN_STOCK: 'SIN_STOCK'
};

// ==================== MARCAR PRODUCTO SIN STOCK ====================

/**
 * Marca un producto como "Sin Stock" durante el picking
 * @param {string} nvId - ID de la Nota de Venta
 * @param {string} sku - Código del producto
 * @param {string} motivo - Motivo de la falta de stock
 * @param {string} usuario - Usuario que marca el producto
 * @returns {Object} Resultado de la operación
 */
function markProductNoStock(nvId, sku, motivo, usuario) {
  try {
    if (!nvId || !sku) {
      return { success: false, error: 'N.V y SKU son requeridos' };
    }
    
    var nvIdStr = String(nvId).trim();
    var skuStr = String(sku).trim().toUpperCase();
    var motivoStr = String(motivo || 'Sin stock disponible').trim();
    
    // Guardar en PropertiesService
    var props = PropertiesService.getScriptProperties();
    var key = 'NOSTOCK_' + nvIdStr;
    var noStockList = JSON.parse(props.getProperty(key) || '[]');
    
    // Verificar si ya está marcado
    var yaExiste = noStockList.some(function(item) {
      return item.sku === skuStr;
    });
    
    if (!yaExiste) {
      noStockList.push({
        sku: skuStr,
        motivo: motivoStr,
        fecha: new Date().toISOString(),
        usuario: usuario || 'Sistema'
      });
      props.setProperty(key, JSON.stringify(noStockList));
    }
    
    // Actualizar estado de la N.V a PARCIALIZADA
    var updateResult = updateNVStatus(nvIdStr);
    
    // Registrar en historial
    registrarMovimientoPicking(nvIdStr, skuStr, 'SIN_STOCK', motivoStr, usuario);
    
    Logger.log('Producto marcado sin stock: ' + nvIdStr + ' - ' + skuStr);
    
    return {
      success: true,
      message: 'Producto marcado como sin stock',
      notaVenta: nvIdStr,
      sku: skuStr,
      motivo: motivoStr,
      totalSinStock: noStockList.length,
      estadoNV: updateResult.nuevoEstado
    };
    
  } catch (error) {
    Logger.log('Error en markProductNoStock: ' + error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Obtiene los productos marcados como sin stock para una N.V
 * @param {string} nvId - ID de la Nota de Venta
 * @returns {Object} Lista de productos sin stock
 */
function getProductsNoStock(nvId) {
  try {
    var props = PropertiesService.getScriptProperties();
    var key = 'NOSTOCK_' + String(nvId).trim();
    var noStockList = JSON.parse(props.getProperty(key) || '[]');
    
    return {
      success: true,
      notaVenta: nvId,
      productos: noStockList,
      total: noStockList.length
    };
    
  } catch (error) {
    Logger.log('Error en getProductsNoStock: ' + error.message);
    return { success: false, error: error.message, productos: [] };
  }
}

/**
 * Quita la marca de sin stock de un producto
 * @param {string} nvId - ID de la Nota de Venta
 * @param {string} sku - Código del producto
 * @returns {Object} Resultado de la operación
 */
function unmarkProductNoStock(nvId, sku) {
  try {
    var props = PropertiesService.getScriptProperties();
    var key = 'NOSTOCK_' + String(nvId).trim();
    var skuStr = String(sku).trim().toUpperCase();
    var noStockList = JSON.parse(props.getProperty(key) || '[]');
    
    noStockList = noStockList.filter(function(item) {
      return item.sku !== skuStr;
    });
    
    props.setProperty(key, JSON.stringify(noStockList));
    
    // Actualizar estado de la N.V
    updateNVStatus(nvId);
    
    return {
      success: true,
      message: 'Marca de sin stock removida',
      notaVenta: nvId,
      sku: skuStr
    };
    
  } catch (error) {
    Logger.log('Error en unmarkProductNoStock: ' + error.message);
    return { success: false, error: error.message };
  }
}

// ==================== ACTUALIZACIÓN DE ESTADO DE N.V ====================

/**
 * Actualiza el estado de una N.V basado en sus productos
 * @param {string} nvId - ID de la Nota de Venta
 * @returns {Object} Resultado con el nuevo estado
 */
function updateNVStatus(nvId) {
  try {
    var nvIdStr = String(nvId).trim();
    
    // Obtener productos sin stock
    var noStockResult = getProductsNoStock(nvIdStr);
    var productosSinStock = noStockResult.productos || [];
    
    // Obtener productos recolectados
    var recolectados = getProductosRecolectados(nvIdStr);
    
    // Obtener total de productos de la N.V
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(PICKING_SHEET);
    
    if (!sheet) {
      return { success: false, error: 'Hoja PICKING no encontrada' };
    }
    
    var data = sheet.getDataRange().getValues();
    var totalProductos = 0;
    var estadoActual = '';
    var filasNV = [];
    
    for (var i = 1; i < data.length; i++) {
      var nVenta = String(data[i][1] || '').trim();
      if (nVenta === nvIdStr) {
        totalProductos++;
        estadoActual = String(data[i][2] || '');
        filasNV.push(i + 1);
      }
    }
    
    if (totalProductos === 0) {
      return { success: false, error: 'N.V no encontrada' };
    }
    
    // Determinar nuevo estado
    var nuevoEstado = estadoActual;
    
    if (productosSinStock.length > 0) {
      // Si hay productos sin stock, la N.V está parcializada
      nuevoEstado = PICKING_ESTADOS.PARCIALIZADA;
    } else if (recolectados.length >= totalProductos) {
      // Si todos los productos están recolectados
      nuevoEstado = PICKING_ESTADOS.PENDIENTE_PACKING;
    } else if (recolectados.length > 0) {
      // Si hay algunos productos recolectados
      nuevoEstado = PICKING_ESTADOS.EN_PICKING;
    }
    
    // Actualizar estado en la hoja si cambió
    if (nuevoEstado !== estadoActual) {
      for (var j = 0; j < filasNV.length; j++) {
        sheet.getRange(filasNV[j], 3).setValue(nuevoEstado);
      }
      
      // Invalidar caché
      if (typeof invalidateNVCache === 'function') {
        invalidateNVCache();
      }
      
      Logger.log('Estado de N.V actualizado: ' + nvIdStr + ' -> ' + nuevoEstado);
    }
    
    return {
      success: true,
      notaVenta: nvIdStr,
      estadoAnterior: estadoActual,
      nuevoEstado: nuevoEstado,
      totalProductos: totalProductos,
      productosSinStock: productosSinStock.length,
      productosRecolectados: recolectados.length
    };
    
  } catch (error) {
    Logger.log('Error en updateNVStatus: ' + error.message);
    return { success: false, error: error.message };
  }
}

// ==================== CONFIRMACIÓN DE PICKING CON DESCUENTO ====================

/**
 * Confirma el picking de un producto y descuenta del inventario
 * @param {string} nvId - ID de la Nota de Venta
 * @param {string} sku - Código del producto
 * @param {number} cantidad - Cantidad pickeada
 * @param {string} ubicacion - Ubicación de donde se tomó el producto
 * @param {string} usuario - Usuario que realiza el picking
 * @returns {Object} Resultado de la operación
 */
function confirmPicking(nvId, sku, cantidad, ubicacion, usuario) {
  try {
    if (!nvId || !sku || !cantidad || !ubicacion) {
      return { success: false, error: 'Todos los campos son requeridos' };
    }
    
    var nvIdStr = String(nvId).trim();
    var skuStr = String(sku).trim().toUpperCase();
    var cantidadNum = Number(cantidad);
    var ubicacionStr = String(ubicacion).trim().toUpperCase();
    
    if (isNaN(cantidadNum) || cantidadNum <= 0) {
      return { success: false, error: 'Cantidad debe ser mayor a 0' };
    }
    
    // 1. Descontar del inventario
    var stockResult = confirmPickingStock(ubicacionStr, skuStr, cantidadNum);
    
    if (!stockResult.success) {
      return stockResult;
    }
    
    // 2. Marcar producto como recolectado
    marcarProductoRecolectado(nvIdStr, skuStr);
    
    // 3. Actualizar estado de la N.V
    var statusResult = updateNVStatus(nvIdStr);
    
    // 4. Registrar en historial
    registrarMovimientoPicking(nvIdStr, skuStr, 'PICKING_CONFIRMADO', 
      'Cantidad: ' + cantidadNum + ' desde ' + ubicacionStr, usuario);
    
    Logger.log('Picking confirmado: ' + nvIdStr + ' - ' + skuStr + ' x ' + cantidadNum);
    
    return {
      success: true,
      message: 'Picking confirmado y stock actualizado',
      notaVenta: nvIdStr,
      sku: skuStr,
      cantidad: cantidadNum,
      ubicacion: ubicacionStr,
      stockAnterior: stockResult.stockAnterior,
      stockNuevo: stockResult.stockNuevo,
      ubicacionVacia: stockResult.ubicacionVacia,
      estadoNV: statusResult.nuevoEstado,
      notification: stockResult.notification
    };
    
  } catch (error) {
    Logger.log('Error en confirmPicking: ' + error.message);
    return { success: false, error: error.message };
  }
}

// ==================== OBTENER N.V PARCIALIZADAS ====================

/**
 * Obtiene las Notas de Venta parcializadas
 * @returns {Object} Lista de N.V parcializadas
 */
function getPartialNVs() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(PICKING_SHEET);
    
    if (!sheet) {
      return { success: false, error: 'Hoja PICKING no encontrada' };
    }
    
    var data = sheet.getDataRange().getValues();
    var nvsMap = {};
    
    for (var i = 1; i < data.length; i++) {
      var estado = String(data[i][2] || '').trim().toUpperCase();
      
      if (estado === 'PARCIALIZADA') {
        var nVenta = String(data[i][1] || '').trim();
        if (!nVenta) continue;
        
        if (!nvsMap[nVenta]) {
          nvsMap[nVenta] = {
            notaVenta: nVenta,
            fechaEntrega: data[i][0],
            estado: estado,
            cliente: String(data[i][4] || ''),
            productos: [],
            productosSinStock: [],
            totalItems: 0
          };
          
          // Obtener productos sin stock
          var noStockResult = getProductsNoStock(nVenta);
          nvsMap[nVenta].productosSinStock = noStockResult.productos || [];
        }
        
        nvsMap[nVenta].productos.push({
          codigo: String(data[i][8] || ''),
          descripcion: String(data[i][9] || ''),
          pedido: Number(data[i][11]) || 0
        });
        
        nvsMap[nVenta].totalItems++;
      }
    }
    
    var nvs = Object.values(nvsMap);
    
    return {
      success: true,
      notasVenta: nvs,
      total: nvs.length
    };
    
  } catch (error) {
    Logger.log('Error en getPartialNVs: ' + error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Obtiene el estado detallado de picking de una N.V
 * @param {string} nvId - ID de la Nota de Venta
 * @returns {Object} Estado detallado del picking
 */
function getPickingStatus(nvId) {
  try {
    var nvIdStr = String(nvId).trim();
    
    // Obtener productos de la N.V
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(PICKING_SHEET);
    
    if (!sheet) {
      return { success: false, error: 'Hoja PICKING no encontrada' };
    }
    
    var data = sheet.getDataRange().getValues();
    var productos = [];
    var estadoNV = '';
    var cliente = '';
    var fechaEntrega = '';
    
    for (var i = 1; i < data.length; i++) {
      var nVenta = String(data[i][1] || '').trim();
      if (nVenta === nvIdStr) {
        if (!estadoNV) {
          estadoNV = String(data[i][2] || '');
          cliente = String(data[i][4] || '');
          fechaEntrega = data[i][0];
        }
        
        productos.push({
          codigo: String(data[i][8] || ''),
          descripcion: String(data[i][9] || ''),
          unidadMedida: String(data[i][10] || ''),
          pedido: Number(data[i][11]) || 0,
          rowIndex: i + 1
        });
      }
    }
    
    if (productos.length === 0) {
      return { success: false, error: 'N.V no encontrada' };
    }
    
    // Obtener productos recolectados
    var recolectados = getProductosRecolectados(nvIdStr);
    
    // Obtener productos sin stock
    var noStockResult = getProductsNoStock(nvIdStr);
    var productosSinStock = noStockResult.productos || [];
    var skusSinStock = productosSinStock.map(function(p) { return p.sku; });
    
    // Marcar estado de cada producto
    productos = productos.map(function(p) {
      var codigoUpper = p.codigo.toUpperCase();
      if (skusSinStock.indexOf(codigoUpper) !== -1) {
        p.estado = PRODUCTO_ESTADOS.SIN_STOCK;
        var sinStockInfo = productosSinStock.find(function(ps) { return ps.sku === codigoUpper; });
        p.motivoSinStock = sinStockInfo ? sinStockInfo.motivo : '';
      } else if (recolectados.indexOf(p.codigo) !== -1 || recolectados.indexOf(codigoUpper) !== -1) {
        p.estado = PRODUCTO_ESTADOS.PICKEADO;
      } else {
        p.estado = PRODUCTO_ESTADOS.PENDIENTE;
      }
      return p;
    });
    
    return {
      success: true,
      notaVenta: nvIdStr,
      estado: estadoNV,
      cliente: cliente,
      fechaEntrega: fechaEntrega,
      productos: productos,
      totalProductos: productos.length,
      productosPickeados: productos.filter(function(p) { return p.estado === PRODUCTO_ESTADOS.PICKEADO; }).length,
      productosSinStock: productos.filter(function(p) { return p.estado === PRODUCTO_ESTADOS.SIN_STOCK; }).length,
      productosPendientes: productos.filter(function(p) { return p.estado === PRODUCTO_ESTADOS.PENDIENTE; }).length
    };
    
  } catch (error) {
    Logger.log('Error en getPickingStatus: ' + error.message);
    return { success: false, error: error.message };
  }
}

// ==================== COMPLETAR PICKING PARCIAL ====================

/**
 * Completa el picking de una N.V parcializada (solo productos disponibles)
 * @param {string} nvId - ID de la Nota de Venta
 * @param {string} usuario - Usuario que completa el picking
 * @returns {Object} Resultado de la operación
 */
function completePartialPicking(nvId, usuario) {
  try {
    var nvIdStr = String(nvId).trim();
    
    // Obtener estado actual
    var statusResult = getPickingStatus(nvIdStr);
    if (!statusResult.success) {
      return statusResult;
    }
    
    // Verificar que hay productos sin stock
    if (statusResult.productosSinStock === 0) {
      // Si no hay productos sin stock, completar normalmente
      return completarPickingNV(nvIdStr, usuario);
    }
    
    // Actualizar estado a PARCIALIZADA (mantener para despacho posterior)
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(PICKING_SHEET);
    
    var data = sheet.getDataRange().getValues();
    
    for (var i = 1; i < data.length; i++) {
      var nVenta = String(data[i][1] || '').trim();
      if (nVenta === nvIdStr) {
        sheet.getRange(i + 1, 3).setValue(PICKING_ESTADOS.PARCIALIZADA);
      }
    }
    
    // Registrar en historial
    registrarMovimientoPicking(nvIdStr, '', 'PICKING_PARCIAL_COMPLETADO', 
      'Productos sin stock: ' + statusResult.productosSinStock, usuario);
    
    // Invalidar caché
    if (typeof invalidateNVCache === 'function') {
      invalidateNVCache();
    }
    
    Logger.log('Picking parcial completado: ' + nvIdStr);
    
    return {
      success: true,
      message: 'Picking parcial completado. Productos sin stock quedan pendientes.',
      notaVenta: nvIdStr,
      nuevoEstado: PICKING_ESTADOS.PARCIALIZADA,
      productosPickeados: statusResult.productosPickeados,
      productosSinStock: statusResult.productosSinStock
    };
    
  } catch (error) {
    Logger.log('Error en completePartialPicking: ' + error.message);
    return { success: false, error: error.message };
  }
}

// ==================== HISTORIAL ====================

/**
 * Registra un movimiento de picking en el historial
 * @param {string} nvId - ID de la Nota de Venta
 * @param {string} sku - Código del producto
 * @param {string} tipo - Tipo de movimiento
 * @param {string} detalle - Detalle del movimiento
 * @param {string} usuario - Usuario que realiza el movimiento
 */
function registrarMovimientoPicking(nvId, sku, tipo, detalle, usuario) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(MOVIMIENTOS_SHEET);
    
    if (!sheet) {
      sheet = ss.insertSheet(MOVIMIENTOS_SHEET);
      sheet.appendRow(['ID', 'FechaHora', 'TipoMovimiento', 'Codigo', 'SKU', 'Detalle', 'Usuario']);
    }
    
    var id = 'MOV-' + new Date().getTime() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
    
    sheet.appendRow([
      id,
      new Date(),
      tipo,
      nvId,
      sku || '',
      detalle || '',
      usuario || 'Sistema'
    ]);
    
  } catch (error) {
    Logger.log('Error al registrar movimiento: ' + error.message);
  }
}

// ==================== FUNCIONES EXPUESTAS AL FRONTEND ====================

// Estas funciones son llamadas desde el frontend (Index.html)
