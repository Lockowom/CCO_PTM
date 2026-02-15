/**
 * Packing.gs - Módulo de Packing SEPARADO
 * Proceso independiente de Picking
 * Estructura desde PICKING (antes ORDENES):
 * Fecha de entrega N.V (A), Nota de Venta (B), Estado (E), Código Prod (G), Descripción (I), Pedido (L)
 * Incluye resumen de clientes para planificación de rutas
 */

// PICKING es el nombre correcto de la hoja de órdenes
var SHEET_ORDENES = 'PICKING';
var SHEET_MOVIMIENTOS = 'MOVIMIENTOS';

// Estados del flujo de packing
var ESTADOS_PACKING = {
  PENDIENTE_PACKING: 'PENDIENTE PACKING',
  LISTO_DESPACHO: 'LISTO DESPACHO'
};

// ==================== OBTENER ÓRDENES PENDIENTES DE PACKING ====================

/**
 * Obtiene las órdenes pendientes de packing
 * Filtra órdenes con estado "PENDIENTE PACKING" desde ORDENES
 * @returns {Object} - {success, ordenes, resumenClientes}
 */
function getOrdenesPendientesPacking() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_ORDENES);
    
    if (!sheet) {
      return { success: false, error: 'Hoja PICKING no encontrada' };
    }
    
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      return { success: true, ordenes: [], resumenClientes: { total: 0, clientes: [] } };
    }
    
    var data = sheet.getRange(2, 1, lastRow - 1, 18).getValues();
    var ordenesMap = {};
    var clientesUnicos = {};
    
    for (var i = 0; i < data.length; i++) {
      var row = data[i];
      var estado = String(row[2] || '').trim().toUpperCase();
      
      // Filtrar solo órdenes pendientes de packing
      if (estado !== 'PENDIENTE PACKING' && estado !== 'PENDIENTE_PACKING') {
        continue;
      }
      
      var nVenta = String(row[1] || '').trim();
      if (!nVenta) continue;
      
      var cliente = String(row[4] || '').trim();
      var codCliente = String(row[3] || '').trim();
      
      // Contar clientes únicos
      if (codCliente && !clientesUnicos[codCliente]) {
        clientesUnicos[codCliente] = {
          codigo: codCliente,
          nombre: cliente,
          ordenes: 0
        };
      }
      
      // Agrupar productos por Nota de Venta
      if (!ordenesMap[nVenta]) {
        ordenesMap[nVenta] = {
          notaVenta: nVenta,
          fechaEntrega: row[0],                    // Columna A
          estado: estado,                          // Columna C (E en display)
          codCliente: codCliente,                  // Columna D
          cliente: cliente,                        // Columna E
          codVendedor: String(row[5] || ''),       // Columna F
          vendedor: String(row[6] || ''),          // Columna G
          zona: String(row[7] || ''),              // Columna H
          productos: [],
          totalItems: 0,
          bultos: 0,
          peso: 0,
          dimensiones: ''
        };
        
        if (clientesUnicos[codCliente]) {
          clientesUnicos[codCliente].ordenes++;
        }
      }
      
      ordenesMap[nVenta].productos.push({
        codigo: String(row[8] || ''),              // Columna I (G en display) - Código Prod
        descripcion: String(row[9] || ''),         // Columna J (I en display) - Descripción
        unidadMedida: String(row[10] || ''),       // Columna K - U.M
        pedido: Number(row[11]) || 0,              // Columna L - Pedido
        rowIndex: i + 2
      });
      
      ordenesMap[nVenta].totalItems++;
    }
    
    var ordenes = Object.values(ordenesMap);
    var clientes = Object.values(clientesUnicos);
    
    // Ordenar órdenes por fecha de entrega
    ordenes.sort(function(a, b) {
      return new Date(a.fechaEntrega) - new Date(b.fechaEntrega);
    });
    
    // Ordenar clientes por cantidad de órdenes (descendente)
    clientes.sort(function(a, b) {
      return b.ordenes - a.ordenes;
    });
    
    return {
      success: true,
      ordenes: ordenes,
      total: ordenes.length,
      resumenClientes: {
        total: clientes.length,
        clientes: clientes
      }
    };
    
  } catch (e) {
    Logger.log('Error en getOrdenesPendientesPacking: ' + e.message);
    return { success: false, error: 'Error al obtener órdenes: ' + e.message };
  }
}

// ==================== RESUMEN DE CLIENTES PARA RUTAS ====================

/**
 * Obtiene resumen de clientes para planificación de rutas de despacho
 * @returns {Object} - {success, clientes, totalClientes}
 */
function getResumenClientesPacking() {
  try {
    var resultado = getOrdenesPendientesPacking();
    if (!resultado.success) return resultado;
    
    return {
      success: true,
      totalClientes: resultado.resumenClientes.total,
      clientes: resultado.resumenClientes.clientes,
      totalOrdenes: resultado.total
    };
    
  } catch (e) {
    Logger.log('Error en getResumenClientesPacking: ' + e.message);
    return { success: false, error: e.message };
  }
}

// ==================== COMPLETAR PACKING ====================

/**
 * Completa el packing de una Nota de Venta
 * Cambia estado a LISTO DESPACHO y registra datos del empaque
 * ADEMÁS: Copia automáticamente los datos a la hoja DESPACHO
 * @param {string} notaVenta - Número de nota de venta
 * @param {Object} datosEmpaque - {bultos, peso, dimensiones}
 * @param {string} usuario - Usuario que completa el packing
 * @returns {Object} - {success, error}
 */
function completarPackingNV(notaVenta, datosEmpaque, usuario) {
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
    
    // Actualizar estado a LISTO DESPACHO
    for (var i = 1; i < data.length; i++) {
      var nVenta = String(data[i][1] || '').trim();
      if (nVenta === nVentaBuscada) {
        estadoAnterior = String(data[i][2] || '');
        sheet.getRange(i + 1, 3).setValue(ESTADOS_PACKING.LISTO_DESPACHO); // Columna C
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
    
    // Registrar en historial con datos de empaque
    registrarCambioEstadoPacking(notaVenta, estadoAnterior, ESTADOS_PACKING.LISTO_DESPACHO, datosEmpaque, usuario);
    
    // ==================== COPIAR AUTOMÁTICAMENTE A DESPACHO ====================
    // Transferir datos a la hoja DESPACHO con el mapeo correcto de columnas
    try {
      if (typeof transferirADespachoAlCompletarPacking === 'function') {
        var resultadoTransferencia = transferirADespachoAlCompletarPacking(notaVenta, datosEmpaque, usuario);
        if (resultadoTransferencia.success) {
          Logger.log('✅ N.V ' + notaVenta + ' transferida a DESPACHO correctamente');
        } else if (!resultadoTransferencia.yaExiste) {
          Logger.log('⚠️ Error transfiriendo a DESPACHO: ' + resultadoTransferencia.error);
        }
      } else if (typeof copiarDatosPackingADespacho === 'function') {
        var resultadoCopia = copiarDatosPackingADespacho(notaVenta, usuario);
        if (resultadoCopia.success && !resultadoCopia.yaExiste && datosEmpaque && datosEmpaque.bultos > 0) {
          // Actualizar bultos en DESPACHO
          var hojaDespacho = ss.getSheetByName('DESPACHO');
          if (hojaDespacho) {
            var dataDespacho = hojaDespacho.getDataRange().getValues();
            for (var d = 1; d < dataDespacho.length; d++) {
              if (String(dataDespacho[d][7] || '').trim() === notaVenta.trim()) {
                hojaDespacho.getRange(d + 1, 5).setValue(datosEmpaque.bultos); // Columna E = Bultos
                break;
              }
            }
          }
        }
        Logger.log('✅ N.V ' + notaVenta + ' copiada a DESPACHO');
      } else {
        Logger.log('⚠️ Función de transferencia a DESPACHO no disponible');
      }
    } catch (transferError) {
      Logger.log('Error en transferencia a DESPACHO: ' + transferError.message);
      // No fallar el packing si la transferencia falla
    }
    // ==================== FIN COPIAR A DESPACHO ====================
    
    Logger.log('Packing completado para N.V: ' + notaVenta + ' por ' + usuario);
    
    return {
      success: true,
      notaVenta: notaVenta,
      nuevoEstado: ESTADOS_PACKING.LISTO_DESPACHO,
      filasActualizadas: filasActualizadas,
      datosEmpaque: datosEmpaque
    };
    
  } catch (e) {
    Logger.log('Error en completarPackingNV: ' + e.message);
    return { success: false, error: 'Error al completar packing: ' + e.message };
  }
}

// ==================== FUNCIONES AUXILIARES ====================

/**
 * Registra un cambio de estado de packing en el historial
 */
function registrarCambioEstadoPacking(notaVenta, estadoAnterior, nuevoEstado, datosEmpaque, usuario) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_MOVIMIENTOS);
    
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_MOVIMIENTOS);
      sheet.appendRow(['ID', 'FechaHora', 'TipoMovimiento', 'Codigo', 'Cantidad', 'Ubicacion', 'Referencia', 'Usuario']);
    }
    
    var id = 'MOV-' + new Date().getTime();
    var referencia = 'De: ' + estadoAnterior + ' A: ' + nuevoEstado;
    
    // Agregar datos de empaque si existen
    if (datosEmpaque) {
      referencia += ' | Bultos: ' + (datosEmpaque.bultos || 0);
      referencia += ', Peso: ' + (datosEmpaque.peso || 0) + 'kg';
      if (datosEmpaque.dimensiones) {
        referencia += ', Dim: ' + datosEmpaque.dimensiones;
      }
    }
    
    sheet.appendRow([
      id,
      new Date(),
      'CAMBIO_ESTADO_PACKING',
      notaVenta,
      datosEmpaque ? datosEmpaque.bultos || 0 : 0,
      '',
      referencia,
      usuario || 'Sistema'
    ]);
    
  } catch (e) {
    Logger.log('Error al registrar cambio de estado packing: ' + e.message);
  }
}

/**
 * Obtiene los datos de empaque de una N.V
 * @param {string} notaVenta - Número de nota de venta
 * @returns {Object} - {success, datosEmpaque}
 */
function getDatosEmpaque(notaVenta) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_MOVIMIENTOS);
    
    if (!sheet) {
      return { success: false, error: 'No hay datos de empaque' };
    }
    
    var data = sheet.getDataRange().getValues();
    var nVentaBuscada = notaVenta.trim();
    
    for (var i = data.length - 1; i >= 1; i--) {
      var tipo = String(data[i][2] || '');
      var codigo = String(data[i][3] || '').trim();
      
      if (tipo === 'CAMBIO_ESTADO_PACKING' && codigo === nVentaBuscada) {
        var referencia = String(data[i][6] || '');
        var bultos = Number(data[i][4]) || 0;
        
        // Parsear datos de empaque de la referencia
        var pesoMatch = referencia.match(/Peso: (\d+(?:\.\d+)?)/);
        var dimMatch = referencia.match(/Dim: ([^,|]+)/);
        
        return {
          success: true,
          datosEmpaque: {
            bultos: bultos,
            peso: pesoMatch ? parseFloat(pesoMatch[1]) : 0,
            dimensiones: dimMatch ? dimMatch[1].trim() : ''
          }
        };
      }
    }
    
    return { success: false, error: 'No se encontraron datos de empaque' };
    
  } catch (e) {
    Logger.log('Error en getDatosEmpaque: ' + e.message);
    return { success: false, error: e.message };
  }
}

// ==================== FUNCIONES DE COMPATIBILIDAD ====================

/**
 * Función de compatibilidad con frontend existente
 */
// NOTA: Renombrada - usar version de Orders.gs
function getOrdersByStatusPacking(status) {
  if (status === 'PACKING' || status === 'PENDIENTE_PACKING') {
    var resultado = getOrdenesPendientesPacking();
    if (!resultado.success) return resultado;
    
    return {
      success: true,
      orders: resultado.ordenes.map(function(o) {
        return {
          id: o.notaVenta,
          numeroOrden: o.notaVenta,
          cliente: o.cliente,
          totalItems: o.totalItems,
          productos: o.productos
        };
      }),
      resumenClientes: resultado.resumenClientes
    };
  } else if (status === 'LISTA_DESPACHO' || status === 'LISTO_DESPACHO') {
    return filtrarOrdenesPorEstadoPacking(ESTADOS_PACKING.LISTO_DESPACHO);
  }
  
  return { success: true, orders: [] };
}

/**
 * Filtra órdenes por estado para packing
 */
function filtrarOrdenesPorEstadoPacking(estado) {
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
      var estadoNormalizado = estadoFila.replace(/_/g, ' ');
      var estadoBuscadoNormalizado = estadoBuscado.replace(/_/g, ' ');
      
      if (estadoNormalizado !== estadoBuscadoNormalizado) continue;
      
      var nVenta = String(data[i][1] || '').trim();
      if (!nVenta) continue;
      
      if (!ordenesMap[nVenta]) {
        ordenesMap[nVenta] = {
          id: nVenta,
          notaVenta: nVenta,
          numeroOrden: nVenta,
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
      orders: Object.values(ordenesMap),
      ordenes: Object.values(ordenesMap)
    };
    
  } catch (e) {
    Logger.log('Error en filtrarOrdenesPorEstadoPacking: ' + e.message);
    return { success: false, error: e.message };
  }
}

// NOTA: Renombrada - usar version de Orders.gs
function updateOrderStatusPacking(orderId, newStatus) {
  if (newStatus === 'LISTA_DESPACHO' || newStatus === 'LISTO_DESPACHO') {
    return completarPackingNV(orderId, null, 'Sistema');
  }
  return { success: true };
}


/**
 * Obtiene datos de packing para el frontend
 * @returns {Object} - {success, ordenes}
 */
function getPackingData() {
  return getOrdenesPendientesPacking();
}

/**
 * Alias para completar packing
 * @param {Object} data - {notaVenta, bultos, peso, dimensiones}
 * @returns {Object} - {success}
 */
function completarPacking(data) {
  var datosEmpaque = {
    bultos: data.bultos || 0,
    peso: data.peso || 0,
    dimensiones: data.dimensiones || ''
  };
  return completarPackingNV(data.notaVenta || data.ordenId, datosEmpaque, data.usuario || 'Sistema');
}

/**
 * Obtiene órdenes listas para despacho
 * @returns {Object} - {success, ordenes}
 */
function getOrdenesListasDespachoFromPacking() {
  return filtrarOrdenesPorEstadoPacking(ESTADOS_PACKING.LISTO_DESPACHO);
}
