/**
 * PickingIntegration.gs
 * Integración completa del flujo de picking
 * Conecta todas las funciones del backend con el frontend
 */

// ==================== MARCAR PRODUCTO NO ENCONTRADO (INTEGRACIÓN) ====================

/**
 * Marca un producto como NO ENCONTRADO y actualiza el estado
 * @param {string} codigo - Código del producto
 * @param {string} descripcion - Descripción del producto
 * @param {number} cantidad - Cantidad solicitada
 * @param {string} notaVenta - Número de nota de venta
 * @param {string} usuario - Usuario que marca
 * @returns {Object} - {success}
 */
function marcarProductoNoEncontradoIntegrado(codigo, descripcion, cantidad, notaVenta, usuario) {
  try {
    Logger.log('=== marcarProductoNoEncontradoIntegrado ===');
    
    // 1. Registrar en observaciones
    var resultObservacion = registrarProductoNoEncontrado(codigo, descripcion, cantidad, notaVenta, usuario);
    
    if (!resultObservacion.success) {
      return resultObservacion;
    }
    
    // 2. Actualizar estado del producto
    var estadoNV = getEstadoPickingNV(notaVenta);
    
    if (!estadoNV.success) {
      estadoNV = {
        success: true,
        notaVenta: notaVenta,
        productos: []
      };
    }
    
    // Buscar y actualizar el producto
    var productoEncontrado = false;
    for (var i = 0; i < estadoNV.productos.length; i++) {
      if (estadoNV.productos[i].codigo === codigo) {
        estadoNV.productos[i].estado = 'NO_ENCONTRADO';
        estadoNV.productos[i].usuario = usuario;
        estadoNV.productos[i].timestamp = new Date().toISOString();
        productoEncontrado = true;
        break;
      }
    }
    
    if (!productoEncontrado) {
      estadoNV.productos.push({
        codigo: codigo,
        estado: 'NO_ENCONTRADO',
        usuario: usuario,
        timestamp: new Date().toISOString()
      });
    }
    
    // 3. Actualizar timestamp de última modificación
    estadoNV.ultimaActualizacion = new Date().toISOString();
    
    // 4. Guardar estado
    var props = PropertiesService.getScriptProperties();
    var key = 'PICKING_STATE_' + notaVenta;
    props.setProperty(key, JSON.stringify(estadoNV));
    
    return {
      success: true,
      codigo: codigo,
      estado: 'NO_ENCONTRADO',
      idObservacion: resultObservacion.idObservacion
    };
    
  } catch (e) {
    Logger.log('Error: ' + e.message);
    return { success: false, error: e.message };
  }
}

// ==================== MARCAR PRODUCTO DAÑADO (INTEGRACIÓN) ====================

/**
 * Marca un producto como DAÑADO y actualiza el estado
 * @param {string} codigo - Código del producto
 * @param {string} descripcion - Descripción del producto
 * @param {string} ubicacion - Ubicación donde está el producto dañado
 * @param {number} cantidad - Cantidad solicitada
 * @param {string} notaVenta - Número de nota de venta
 * @param {string} usuario - Usuario que marca
 * @returns {Object} - {success}
 */
function marcarProductoDanadoIntegrado(codigo, descripcion, ubicacion, cantidad, notaVenta, usuario) {
  try {
    Logger.log('=== marcarProductoDanadoIntegrado ===');
    
    // 1. Registrar en observaciones
    var resultObservacion = registrarProductoDanado(codigo, descripcion, ubicacion, cantidad, notaVenta, usuario);
    
    if (!resultObservacion.success) {
      return resultObservacion;
    }
    
    // 2. Actualizar estado del producto
    var estadoNV = getEstadoPickingNV(notaVenta);
    
    if (!estadoNV.success) {
      estadoNV = {
        success: true,
        notaVenta: notaVenta,
        productos: []
      };
    }
    
    // Buscar y actualizar el producto
    var productoEncontrado = false;
    for (var i = 0; i < estadoNV.productos.length; i++) {
      if (estadoNV.productos[i].codigo === codigo) {
        estadoNV.productos[i].estado = 'DANADO';
        estadoNV.productos[i].ubicacion = ubicacion;
        estadoNV.productos[i].usuario = usuario;
        estadoNV.productos[i].timestamp = new Date().toISOString();
        productoEncontrado = true;
        break;
      }
    }
    
    if (!productoEncontrado) {
      estadoNV.productos.push({
        codigo: codigo,
        estado: 'DANADO',
        ubicacion: ubicacion,
        usuario: usuario,
        timestamp: new Date().toISOString()
      });
    }
    
    // 3. Actualizar timestamp de última modificación
    estadoNV.ultimaActualizacion = new Date().toISOString();
    
    // 4. Guardar estado
    var props = PropertiesService.getScriptProperties();
    var key = 'PICKING_STATE_' + notaVenta;
    props.setProperty(key, JSON.stringify(estadoNV));
    
    return {
      success: true,
      codigo: codigo,
      estado: 'DANADO',
      ubicacion: ubicacion,
      idObservacion: resultObservacion.idObservacion
    };
    
  } catch (e) {
    Logger.log('Error: ' + e.message);
    return { success: false, error: e.message };
  }
}

// ==================== MARCAR PRODUCTO PICKEADO (INTEGRACIÓN COMPLETA) ====================

/**
 * Marca un producto como PICKEADO, descuenta stock y actualiza estado
 * Si la ubicación es SIN_UBICACION, se salta el descuento de stock
 * @param {string} notaVenta - Número de nota de venta
 * @param {string} codigo - Código del producto
 * @param {string} ubicacion - Ubicación de donde se pickeó
 * @param {number} cantidad - Cantidad pickeada
 * @param {string} usuario - Usuario que pickeó
 * @returns {Object} - {success}
 */
function marcarProductoPickeadoIntegrado(notaVenta, codigo, ubicacion, cantidad, usuario) {
  try {
    Logger.log('=== marcarProductoPickeadoIntegrado ===');
    Logger.log('N.V: ' + notaVenta + ', Código: ' + codigo + ', Ubicación: ' + ubicacion + ', Cantidad: ' + cantidad);
    
    var resultStock = null;
    var sinUbicacion = !ubicacion || 
                       ubicacion === 'SIN_UBICACION' || 
                       ubicacion === 'SIN UBICACION' || 
                       String(ubicacion).toUpperCase().indexOf('SIN UBICACION') !== -1 ||
                       String(ubicacion).toUpperCase().indexOf('SIN_UBICACION') !== -1;
    
    // 1. Descontar stock de la ubicación (solo si hay ubicación registrada)
    if (sinUbicacion) {
      Logger.log('Producto sin ubicación registrada - salteando descuento de stock');
      resultStock = {
        success: true,
        stockAnterior: 0,
        stockNuevo: 0,
        mensaje: 'Sin ubicación registrada - sin descuento de stock'
      };
    } else {
      resultStock = descontarStockUbicacion(ubicacion, codigo, cantidad);
      
      if (!resultStock.success) {
        Logger.log('Error al descontar stock: ' + resultStock.error);
        return resultStock;
      }
      
      Logger.log('Stock descontado exitosamente');
    }
    
    // 2. Marcar producto como pickeado en el estado
    var resultEstado = marcarProductoPickeado(notaVenta, codigo, ubicacion, cantidad, usuario);
    
    if (!resultEstado.success) {
      Logger.log('Error al actualizar estado: ' + resultEstado.error);
      return resultEstado;
    }
    
    Logger.log('Estado actualizado exitosamente');
    
    // 3. Registrar en log de picking
    registrarPickingLog(notaVenta, codigo, ubicacion || 'SIN_UBICACION', cantidad, usuario);
    
    return {
      success: true,
      notaVenta: notaVenta,
      codigo: codigo,
      ubicacion: ubicacion || 'SIN_UBICACION',
      cantidad: cantidad,
      stockAnterior: resultStock.stockAnterior || 0,
      stockNuevo: resultStock.stockNuevo || 0,
      sinUbicacion: sinUbicacion,
      estado: 'PICKEADO'
    };
    
  } catch (e) {
    Logger.log('Error en marcarProductoPickeadoIntegrado: ' + e.message);
    return { success: false, error: 'Error al marcar pickeado: ' + e.message };
  }
}

// ==================== REGISTRAR EN LOG DE PICKING ====================

/**
 * Registra una operación de picking en el log
 */
function registrarPickingLog(notaVenta, codigo, ubicacion, cantidad, usuario) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('PICKING_LOG');
    
    if (!sheet) {
      sheet = ss.insertSheet('PICKING_LOG');
      sheet.appendRow(['ID', 'FechaHora', 'TipoOperacion', 'NotaVenta', 'Codigo', 'Ubicacion', 'Cantidad', 'Usuario']);
      sheet.getRange(1, 1, 1, 8).setBackground('#2d3748').setFontColor('white').setFontWeight('bold');
      sheet.setFrozenRows(1);
    }
    
    var id = 'PICK-' + new Date().getTime();
    sheet.appendRow([
      id,
      new Date(),
      'PICKING',
      notaVenta,
      codigo,
      ubicacion,
      cantidad,
      usuario || 'Sistema'
    ]);
    
    Logger.log('Picking registrado en log');
    
  } catch (e) {
    Logger.log('Error al registrar en log: ' + e.message);
  }
}
