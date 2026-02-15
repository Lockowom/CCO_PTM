/**
 * PickingEstados.gs
 * Gestión de estados de productos durante el proceso de picking
 * 
 * Este módulo maneja:
 * - Estados de productos (PICKEADO, PENDIENTE, FALTANTE_BIG, FALTANTE_MINI, NO_ENCONTRADO, DANADO)
 * - Persistencia en PropertiesService
 * - Validación de picking completo
 * - Tracking de usuario y timestamp
 */

// ==================== CONFIGURACIÓN ====================

// Estados de productos en picking
var ESTADOS_PRODUCTO = {
  PENDIENTE: 'PENDIENTE',
  PICKEADO: 'PICKEADO',
  FALTANTE_BIG: 'FALTANTE_BIG',
  FALTANTE_MINI: 'FALTANTE_MINI',
  NO_ENCONTRADO: 'NO_ENCONTRADO',
  DANADO: 'DANADO'
};

// ==================== MARCAR PRODUCTO FALTANTE ====================

/**
 * Marca un producto como faltante (Big Ticket o Mini Ticket)
 * Guarda en PropertiesService para persistencia
 * @param {string} notaVenta - Número de nota de venta
 * @param {string} codigo - Código del producto
 * @param {string} tipoFaltante - 'BIG_TICKET' o 'MINI_TICKET'
 * @param {string} usuario - Usuario que marca el faltante
 * @returns {Object} - {success, estado}
 */
function marcarProductoFaltante(notaVenta, codigo, tipoFaltante, usuario) {
  try {
    Logger.log('=== marcarProductoFaltante: ' + notaVenta + ', ' + codigo + ', ' + tipoFaltante + ' ===');
    
    if (!notaVenta || !codigo || !tipoFaltante) {
      return { success: false, error: 'Parámetros requeridos: notaVenta, codigo, tipoFaltante' };
    }
    
    var estadoNuevo = tipoFaltante === 'BIG_TICKET' ? ESTADOS_PRODUCTO.FALTANTE_BIG : ESTADOS_PRODUCTO.FALTANTE_MINI;
    
    // Obtener estado actual de la N.V
    var estadoNV = getEstadoPickingNV(notaVenta);
    
    if (!estadoNV.success) {
      // Si no existe, crear nuevo estado
      estadoNV = {
        success: true,
        notaVenta: notaVenta,
        productos: []
      };
    }
    
    // Buscar el producto en el estado
    var productoEncontrado = false;
    for (var i = 0; i < estadoNV.productos.length; i++) {
      if (estadoNV.productos[i].codigo === codigo) {
        estadoNV.productos[i].estado = estadoNuevo;
        estadoNV.productos[i].usuario = usuario || 'Sistema';
        estadoNV.productos[i].timestamp = new Date().toISOString();
        productoEncontrado = true;
        break;
      }
    }
    
    // Si no existe, agregarlo
    if (!productoEncontrado) {
      estadoNV.productos.push({
        codigo: codigo,
        estado: estadoNuevo,
        usuario: usuario || 'Sistema',
        timestamp: new Date().toISOString()
      });
    }
    
    // Actualizar última modificación
    estadoNV.ultimaActualizacion = new Date().toISOString();
    
    // Guardar en PropertiesService
    var props = PropertiesService.getScriptProperties();
    var key = 'PICKING_STATE_' + notaVenta;
    props.setProperty(key, JSON.stringify(estadoNV));
    
    Logger.log('Producto marcado como ' + estadoNuevo);
    
    return {
      success: true,
      notaVenta: notaVenta,
      codigo: codigo,
      estado: estadoNuevo,
      tipoFaltante: tipoFaltante,
      usuario: usuario
    };
    
  } catch (e) {
    Logger.log('Error en marcarProductoFaltante: ' + e.message);
    return { success: false, error: 'Error al marcar faltante: ' + e.message };
  }
}

// ==================== MARCAR PRODUCTO PICKEADO ====================

/**
 * Marca un producto como pickeado
 * Guarda ubicación, cantidad y usuario en PropertiesService
 * @param {string} notaVenta - Número de nota de venta
 * @param {string} codigo - Código del producto
 * @param {string} ubicacion - Ubicación de donde se pickeó
 * @param {number} cantidad - Cantidad pickeada
 * @param {string} usuario - Usuario que pickeó
 * @returns {Object} - {success, estado}
 */
function marcarProductoPickeado(notaVenta, codigo, ubicacion, cantidad, usuario) {
  try {
    Logger.log('=== marcarProductoPickeado: ' + notaVenta + ', ' + codigo + ', ' + ubicacion + ', ' + cantidad + ' ===');
    
    if (!notaVenta || !codigo) {
      return { success: false, error: 'Parámetros requeridos: notaVenta, codigo' };
    }
    
    // Obtener estado actual de la N.V
    var estadoNV = getEstadoPickingNV(notaVenta);
    
    if (!estadoNV.success) {
      // Si no existe, crear nuevo estado
      estadoNV = {
        success: true,
        notaVenta: notaVenta,
        productos: []
      };
    }
    
    // Buscar el producto en el estado
    var productoEncontrado = false;
    for (var i = 0; i < estadoNV.productos.length; i++) {
      if (estadoNV.productos[i].codigo === codigo) {
        estadoNV.productos[i].estado = ESTADOS_PRODUCTO.PICKEADO;
        estadoNV.productos[i].ubicacion = ubicacion || '';
        estadoNV.productos[i].cantidadPickeada = Number(cantidad) || 0;
        estadoNV.productos[i].usuario = usuario || 'Sistema';
        estadoNV.productos[i].timestamp = new Date().toISOString();
        productoEncontrado = true;
        break;
      }
    }
    
    // Si no existe, agregarlo
    if (!productoEncontrado) {
      estadoNV.productos.push({
        codigo: codigo,
        estado: ESTADOS_PRODUCTO.PICKEADO,
        ubicacion: ubicacion || '',
        cantidadPickeada: Number(cantidad) || 0,
        usuario: usuario || 'Sistema',
        timestamp: new Date().toISOString()
      });
    }
    
    // Actualizar última modificación
    estadoNV.ultimaActualizacion = new Date().toISOString();
    
    // Guardar en PropertiesService
    var props = PropertiesService.getScriptProperties();
    var key = 'PICKING_STATE_' + notaVenta;
    props.setProperty(key, JSON.stringify(estadoNV));
    
    Logger.log('Producto marcado como PICKEADO');
    
    return {
      success: true,
      notaVenta: notaVenta,
      codigo: codigo,
      estado: ESTADOS_PRODUCTO.PICKEADO,
      ubicacion: ubicacion,
      cantidad: cantidad,
      usuario: usuario
    };
    
  } catch (e) {
    Logger.log('Error en marcarProductoPickeado: ' + e.message);
    return { success: false, error: 'Error al marcar pickeado: ' + e.message };
  }
}

// ==================== OBTENER ESTADO DE PICKING ====================

/**
 * Obtiene el estado completo de picking de una N.V
 * Lee de PropertiesService
 * @param {string} notaVenta - Número de nota de venta
 * @returns {Object} - {success, notaVenta, productos, ultimaActualizacion}
 */
function getEstadoPickingNV(notaVenta) {
  try {
    var props = PropertiesService.getScriptProperties();
    var key = 'PICKING_STATE_' + notaVenta;
    var estadoStr = props.getProperty(key);
    
    if (!estadoStr) {
      return {
        success: true,
        notaVenta: notaVenta,
        productos: [],
        ultimaActualizacion: null,
        mensaje: 'No hay estado guardado para esta N.V'
      };
    }
    
    var estado = JSON.parse(estadoStr);
    
    return {
      success: true,
      notaVenta: notaVenta,
      productos: estado.productos || [],
      ultimaActualizacion: estado.ultimaActualizacion,
      bloqueado: estado.bloqueado || false,
      usuarioBloqueado: estado.usuarioBloqueado || null
    };
    
  } catch (e) {
    Logger.log('Error en getEstadoPickingNV: ' + e.message);
    return { 
      success: false, 
      error: 'Error al obtener estado: ' + e.message,
      productos: []
    };
  }
}

// ==================== VALIDAR PICKING COMPLETO ====================

/**
 * Valida si todos los productos de una N.V están procesados
 * Un producto está procesado si está en estado: PICKEADO, FALTANTE_BIG, FALTANTE_MINI, NO_ENCONTRADO o DANADO
 * @param {string} notaVenta - Número de nota de venta
 * @returns {Object} - {completo, pendientes, procesados}
 */
function validarPickingCompleto(notaVenta) {
  try {
    Logger.log('=== validarPickingCompleto: ' + notaVenta + ' ===');
    
    // Obtener productos de la N.V desde la hoja PICKING
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('PICKING');
    
    if (!sheet) {
      return { 
        completo: false, 
        error: 'Hoja PICKING no encontrada',
        pendientes: 0,
        procesados: 0
      };
    }
    
    var data = sheet.getDataRange().getValues();
    var nVentaBuscada = String(notaVenta).trim();
    var productosNV = [];
    
    // Obtener todos los productos de la N.V
    for (var i = 1; i < data.length; i++) {
      var nVentaFila = String(data[i][1] || '').trim();
      if (nVentaFila === nVentaBuscada) {
        productosNV.push({
          codigo: String(data[i][8] || '').trim(),
          descripcion: String(data[i][9] || '').trim()
        });
      }
    }
    
    if (productosNV.length === 0) {
      return {
        completo: false,
        error: 'N.V no encontrada en PICKING',
        pendientes: 0,
        procesados: 0
      };
    }
    
    // Obtener estado de picking
    var estadoNV = getEstadoPickingNV(notaVenta);
    
    var procesados = 0;
    var pendientes = 0;
    var detalleProductos = [];
    
    for (var j = 0; j < productosNV.length; j++) {
      var codigo = productosNV[j].codigo;
      var estadoProducto = ESTADOS_PRODUCTO.PENDIENTE;
      
      // Buscar estado del producto
      if (estadoNV.success && estadoNV.productos) {
        for (var k = 0; k < estadoNV.productos.length; k++) {
          if (estadoNV.productos[k].codigo === codigo) {
            estadoProducto = estadoNV.productos[k].estado;
            break;
          }
        }
      }
      
      // Verificar si está procesado
      var estaProcesado = (
        estadoProducto === ESTADOS_PRODUCTO.PICKEADO ||
        estadoProducto === ESTADOS_PRODUCTO.FALTANTE_BIG ||
        estadoProducto === ESTADOS_PRODUCTO.FALTANTE_MINI ||
        estadoProducto === ESTADOS_PRODUCTO.NO_ENCONTRADO ||
        estadoProducto === ESTADOS_PRODUCTO.DANADO
      );
      
      if (estaProcesado) {
        procesados++;
      } else {
        pendientes++;
      }
      
      detalleProductos.push({
        codigo: codigo,
        descripcion: productosNV[j].descripcion,
        estado: estadoProducto,
        procesado: estaProcesado
      });
    }
    
    var completo = pendientes === 0;
    
    Logger.log('Validación: ' + procesados + ' procesados, ' + pendientes + ' pendientes. Completo: ' + completo);
    
    return {
      completo: completo,
      totalProductos: productosNV.length,
      procesados: procesados,
      pendientes: pendientes,
      detalleProductos: detalleProductos,
      notaVenta: notaVenta
    };
    
  } catch (e) {
    Logger.log('Error en validarPickingCompleto: ' + e.message);
    return { 
      completo: false, 
      error: 'Error al validar: ' + e.message,
      pendientes: 0,
      procesados: 0
    };
  }
}

// ==================== LIMPIAR ESTADO ====================

/**
 * Limpia el estado de picking de una N.V
 * Se ejecuta cuando el picking se completa
 * @param {string} notaVenta - Número de nota de venta
 * @returns {Object} - {success}
 */
function limpiarEstadoPickingNV(notaVenta) {
  try {
    var props = PropertiesService.getScriptProperties();
    var key = 'PICKING_STATE_' + notaVenta;
    props.deleteProperty(key);
    
    Logger.log('Estado de picking limpiado para N.V: ' + notaVenta);
    
    return {
      success: true,
      notaVenta: notaVenta,
      mensaje: 'Estado limpiado exitosamente'
    };
    
  } catch (e) {
    Logger.log('Error en limpiarEstadoPickingNV: ' + e.message);
    return { success: false, error: e.message };
  }
}

// ==================== OBTENER RESUMEN DE ESTADOS ====================

/**
 * Obtiene un resumen de los estados de productos de una N.V
 * @param {string} notaVenta - Número de nota de venta
 * @returns {Object} - {success, resumen}
 */
// NOTA: Renombrada - StateManager.gs tiene getResumenEstadosNV() global
function getResumenEstadosPicking(notaVenta) {
  try {
    var validacion = validarPickingCompleto(notaVenta);
    
    if (!validacion.completo && validacion.error) {
      return { success: false, error: validacion.error };
    }
    
    var resumen = {
      totalProductos: validacion.totalProductos,
      procesados: validacion.procesados,
      pendientes: validacion.pendientes,
      completo: validacion.completo,
      porcentaje: validacion.totalProductos > 0 ? 
        Math.round((validacion.procesados / validacion.totalProductos) * 100) : 0
    };
    
    // Contar por tipo de estado
    resumen.pickeados = 0;
    resumen.faltantesBig = 0;
    resumen.faltantesMini = 0;
    resumen.noEncontrados = 0;
    resumen.danados = 0;
    
    if (validacion.detalleProductos) {
      for (var i = 0; i < validacion.detalleProductos.length; i++) {
        var estado = validacion.detalleProductos[i].estado;
        if (estado === ESTADOS_PRODUCTO.PICKEADO) resumen.pickeados++;
        else if (estado === ESTADOS_PRODUCTO.FALTANTE_BIG) resumen.faltantesBig++;
        else if (estado === ESTADOS_PRODUCTO.FALTANTE_MINI) resumen.faltantesMini++;
        else if (estado === ESTADOS_PRODUCTO.NO_ENCONTRADO) resumen.noEncontrados++;
        else if (estado === ESTADOS_PRODUCTO.DANADO) resumen.danados++;
      }
    }
    
    return {
      success: true,
      notaVenta: notaVenta,
      resumen: resumen
    };
    
  } catch (e) {
    Logger.log('Error en getResumenEstadosNV: ' + e.message);
    return { success: false, error: e.message };
  }
}

// ==================== FUNCIONES DE COMPATIBILIDAD ====================

/**
 * Alias para compatibilidad con código existente
 */
function marcarProductoRecolectado(notaVenta, codigoProducto) {
  return marcarProductoPickeado(notaVenta, codigoProducto, '', 0, 'Sistema');
}

function getProductosRecolectados(notaVenta) {
  var estado = getEstadoPickingNV(notaVenta);
  if (!estado.success) return [];
  
  var recolectados = [];
  for (var i = 0; i < estado.productos.length; i++) {
    if (estado.productos[i].estado === ESTADOS_PRODUCTO.PICKEADO) {
      recolectados.push(estado.productos[i].codigo);
    }
  }
  return recolectados;
}
