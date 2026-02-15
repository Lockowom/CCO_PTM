/**
 * PickingLog.gs - Sistema de Registro de Picking por Usuario
 * Registra cada operación de picking con usuario, fecha, cantidades
 * Permite ver historial y estadísticas por usuario
 */

var SHEET_PICKING_LOG = 'PICKING_LOG';

/**
 * Estructura de la hoja PICKING_LOG:
 * A - ID (único)
 * B - Fecha/Hora Inicio
 * C - Fecha/Hora Fin
 * D - Usuario
 * E - N.V (Nota de Venta)
 * F - Cliente
 * G - Total Items
 * H - Items Pickeados
 * I - Estado (EN_PROCESO, COMPLETADO, CANCELADO)
 * J - Duración (minutos)
 * K - Observaciones
 */

var COL_PICKING_LOG = {
  ID: 0,
  FECHA_INICIO: 1,
  FECHA_FIN: 2,
  USUARIO: 3,
  NOTA_VENTA: 4,
  CLIENTE: 5,
  TOTAL_ITEMS: 6,
  ITEMS_PICKEADOS: 7,
  ESTADO: 8,
  DURACION: 9,
  OBSERVACIONES: 10
};

/**
 * Inicializa la hoja PICKING_LOG si no existe
 * @returns {Sheet} - La hoja PICKING_LOG
 */
function initPickingLogSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_PICKING_LOG);
  
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_PICKING_LOG);
    
    // Crear encabezados
    var headers = [
      'ID', 'Fecha Inicio', 'Fecha Fin', 'Usuario', 'N.V', 
      'Cliente', 'Total Items', 'Items Pickeados', 'Estado', 
      'Duración (min)', 'Observaciones'
    ];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    
    // Formato de encabezados
    sheet.getRange(1, 1, 1, headers.length)
      .setBackground('#FF6B00')
      .setFontColor('white')
      .setFontWeight('bold');
    
    sheet.setFrozenRows(1);
    
    // Ajustar anchos de columna
    sheet.setColumnWidth(1, 120);  // ID
    sheet.setColumnWidth(2, 150);  // Fecha Inicio
    sheet.setColumnWidth(3, 150);  // Fecha Fin
    sheet.setColumnWidth(4, 120);  // Usuario
    sheet.setColumnWidth(5, 100);  // N.V
    sheet.setColumnWidth(6, 200);  // Cliente
    sheet.setColumnWidth(7, 80);   // Total Items
    sheet.setColumnWidth(8, 100);  // Items Pickeados
    sheet.setColumnWidth(9, 100);  // Estado
    sheet.setColumnWidth(10, 100); // Duración
    sheet.setColumnWidth(11, 200); // Observaciones
    
    Logger.log('Hoja PICKING_LOG creada');
  }
  
  return sheet;
}

/**
 * Registra el inicio de un picking
 * @param {string} nVenta - Número de nota de venta
 * @param {string} usuario - Usuario que inicia el picking
 * @param {string} cliente - Nombre del cliente
 * @param {number} totalItems - Total de items a pickear
 * @returns {Object} - {success, pickingId}
 */
function registrarInicioPicking(nVenta, usuario, cliente, totalItems) {
  Logger.log('=== registrarInicioPicking ===');
  Logger.log('nVenta: ' + nVenta + ', usuario: ' + usuario + ', cliente: ' + cliente + ', totalItems: ' + totalItems);
  
  try {
    var sheet = initPickingLogSheet();
    Logger.log('Hoja PICKING_LOG obtenida: ' + (sheet ? sheet.getName() : 'null'));
    
    // Verificar si ya hay un picking en proceso para esta N.V
    var pickingActivo = getPickingActivoPorNV(nVenta);
    Logger.log('Picking activo encontrado: ' + JSON.stringify(pickingActivo));
    
    if (pickingActivo) {
      return {
        success: false,
        error: 'Ya existe un picking en proceso para esta N.V por ' + pickingActivo.usuario,
        pickingActivo: pickingActivo
      };
    }
    
    var pickingId = 'PK-' + new Date().getTime();
    var fechaInicio = new Date();
    
    var newRow = [
      pickingId,
      fechaInicio,
      '',  // Fecha fin (vacío hasta completar)
      usuario,
      nVenta,
      cliente || '',
      totalItems || 0,
      0,   // Items pickeados (inicia en 0)
      'EN_PROCESO',
      '',  // Duración (se calcula al completar)
      ''   // Observaciones
    ];
    
    sheet.appendRow(newRow);
    
    Logger.log('Picking iniciado: ' + pickingId + ' por ' + usuario + ' para N.V ' + nVenta);
    
    return {
      success: true,
      pickingId: pickingId,
      fechaInicio: fechaInicio,
      usuario: usuario,
      notaVenta: nVenta
    };
    
  } catch (e) {
    Logger.log('Error en registrarInicioPicking: ' + e.message);
    return { success: false, error: 'Error al registrar inicio: ' + e.message };
  }
}

/**
 * Registra la finalización de un picking
 * @param {string} nVenta - Número de nota de venta
 * @param {string} usuario - Usuario que completa el picking
 * @param {number} itemsPickeados - Cantidad de items pickeados
 * @param {string} observaciones - Observaciones opcionales
 * @returns {Object} - {success, duracion}
 */
function registrarFinPicking(nVenta, usuario, itemsPickeados, observaciones) {
  try {
    var sheet = initPickingLogSheet();
    var data = sheet.getDataRange().getValues();
    var nVentaBuscada = String(nVenta).trim();
    
    // Buscar el picking activo para esta N.V
    for (var i = data.length - 1; i >= 1; i--) {
      var nvFila = String(data[i][COL_PICKING_LOG.NOTA_VENTA] || '').trim();
      var estadoFila = String(data[i][COL_PICKING_LOG.ESTADO] || '').trim();
      
      if (nvFila === nVentaBuscada && estadoFila === 'EN_PROCESO') {
        var fechaInicio = new Date(data[i][COL_PICKING_LOG.FECHA_INICIO]);
        var fechaFin = new Date();
        var duracionMs = fechaFin - fechaInicio;
        var duracionMin = Math.round(duracionMs / 60000);
        
        // Actualizar la fila
        sheet.getRange(i + 1, COL_PICKING_LOG.FECHA_FIN + 1).setValue(fechaFin);
        sheet.getRange(i + 1, COL_PICKING_LOG.ITEMS_PICKEADOS + 1).setValue(itemsPickeados || data[i][COL_PICKING_LOG.TOTAL_ITEMS]);
        sheet.getRange(i + 1, COL_PICKING_LOG.ESTADO + 1).setValue('COMPLETADO');
        sheet.getRange(i + 1, COL_PICKING_LOG.DURACION + 1).setValue(duracionMin);
        if (observaciones) {
          sheet.getRange(i + 1, COL_PICKING_LOG.OBSERVACIONES + 1).setValue(observaciones);
        }
        
        Logger.log('Picking completado para N.V ' + nVenta + ' - Duración: ' + duracionMin + ' min');
        
        return {
          success: true,
          pickingId: data[i][COL_PICKING_LOG.ID],
          notaVenta: nVenta,
          usuario: data[i][COL_PICKING_LOG.USUARIO],
          duracionMinutos: duracionMin,
          itemsPickeados: itemsPickeados || data[i][COL_PICKING_LOG.TOTAL_ITEMS]
        };
      }
    }
    
    return { success: false, error: 'No se encontró picking activo para N.V ' + nVenta };
    
  } catch (e) {
    Logger.log('Error en registrarFinPicking: ' + e.message);
    return { success: false, error: e.message };
  }
}

/**
 * Obtiene el picking activo para una N.V
 * @param {string} nVenta - Número de nota de venta
 * @returns {Object|null} - Datos del picking activo o null
 */
function getPickingActivoPorNV(nVenta) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_PICKING_LOG);
    
    if (!sheet) return null;
    
    var data = sheet.getDataRange().getValues();
    var nVentaBuscada = String(nVenta).trim();
    
    for (var i = data.length - 1; i >= 1; i--) {
      var nvFila = String(data[i][COL_PICKING_LOG.NOTA_VENTA] || '').trim();
      var estadoFila = String(data[i][COL_PICKING_LOG.ESTADO] || '').trim();
      
      if (nvFila === nVentaBuscada && estadoFila === 'EN_PROCESO') {
        return {
          pickingId: data[i][COL_PICKING_LOG.ID],
          fechaInicio: data[i][COL_PICKING_LOG.FECHA_INICIO],
          usuario: data[i][COL_PICKING_LOG.USUARIO],
          notaVenta: nvFila,
          cliente: data[i][COL_PICKING_LOG.CLIENTE],
          totalItems: data[i][COL_PICKING_LOG.TOTAL_ITEMS]
        };
      }
    }
    
    return null;
    
  } catch (e) {
    Logger.log('Error en getPickingActivoPorNV: ' + e.message);
    return null;
  }
}


/**
 * Obtiene el historial de picking de un usuario
 * @param {string} usuario - Nombre del usuario
 * @param {number} limite - Límite de registros (default 50)
 * @returns {Object} - {success, historial, estadisticas}
 */
function getHistorialPickingUsuario(usuario, limite) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_PICKING_LOG);
    
    if (!sheet) {
      return { success: true, historial: [], estadisticas: getEstadisticasVacias() };
    }
    
    var data = sheet.getDataRange().getValues();
    var usuarioBuscado = String(usuario).trim().toLowerCase();
    var historial = [];
    var stats = {
      totalPickings: 0,
      pickingsCompletados: 0,
      pickingsEnProceso: 0,
      totalItemsPickeados: 0,
      tiempoPromedioMin: 0,
      tiempoTotalMin: 0
    };
    
    limite = limite || 50;
    
    for (var i = data.length - 1; i >= 1 && historial.length < limite; i--) {
      var usuarioFila = String(data[i][COL_PICKING_LOG.USUARIO] || '').trim().toLowerCase();
      
      if (usuarioFila === usuarioBuscado) {
        var estado = String(data[i][COL_PICKING_LOG.ESTADO] || '');
        var duracion = Number(data[i][COL_PICKING_LOG.DURACION]) || 0;
        var itemsPickeados = Number(data[i][COL_PICKING_LOG.ITEMS_PICKEADOS]) || 0;
        
        historial.push({
          pickingId: data[i][COL_PICKING_LOG.ID],
          fechaInicio: data[i][COL_PICKING_LOG.FECHA_INICIO],
          fechaFin: data[i][COL_PICKING_LOG.FECHA_FIN],
          notaVenta: data[i][COL_PICKING_LOG.NOTA_VENTA],
          cliente: data[i][COL_PICKING_LOG.CLIENTE],
          totalItems: data[i][COL_PICKING_LOG.TOTAL_ITEMS],
          itemsPickeados: itemsPickeados,
          estado: estado,
          duracionMin: duracion,
          observaciones: data[i][COL_PICKING_LOG.OBSERVACIONES]
        });
        
        stats.totalPickings++;
        if (estado === 'COMPLETADO') {
          stats.pickingsCompletados++;
          stats.totalItemsPickeados += itemsPickeados;
          stats.tiempoTotalMin += duracion;
        } else if (estado === 'EN_PROCESO') {
          stats.pickingsEnProceso++;
        }
      }
    }
    
    // Calcular promedio
    if (stats.pickingsCompletados > 0) {
      stats.tiempoPromedioMin = Math.round(stats.tiempoTotalMin / stats.pickingsCompletados);
    }
    
    return {
      success: true,
      usuario: usuario,
      historial: historial,
      estadisticas: stats
    };
    
  } catch (e) {
    Logger.log('Error en getHistorialPickingUsuario: ' + e.message);
    return { success: false, error: e.message };
  }
}

/**
 * Obtiene estadísticas de picking de todos los usuarios
 * @param {string} fechaDesde - Fecha desde (opcional, formato YYYY-MM-DD)
 * @param {string} fechaHasta - Fecha hasta (opcional, formato YYYY-MM-DD)
 * @returns {Object} - {success, usuarios, resumen}
 */
function getEstadisticasPickingTodos(fechaDesde, fechaHasta) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_PICKING_LOG);
    
    if (!sheet) {
      return { success: true, usuarios: [], resumen: getResumenVacio() };
    }
    
    var data = sheet.getDataRange().getValues();
    var usuariosMap = {};
    var resumen = {
      totalPickings: 0,
      pickingsCompletados: 0,
      totalItemsPickeados: 0,
      tiempoTotalMin: 0
    };
    
    // Parsear fechas si se proporcionan
    var desde = fechaDesde ? new Date(fechaDesde) : null;
    var hasta = fechaHasta ? new Date(fechaHasta + 'T23:59:59') : null;
    
    for (var i = 1; i < data.length; i++) {
      var fechaInicio = new Date(data[i][COL_PICKING_LOG.FECHA_INICIO]);
      
      // Filtrar por fecha si se especifica
      if (desde && fechaInicio < desde) continue;
      if (hasta && fechaInicio > hasta) continue;
      
      var usuario = String(data[i][COL_PICKING_LOG.USUARIO] || '').trim();
      if (!usuario) continue;
      
      var estado = String(data[i][COL_PICKING_LOG.ESTADO] || '');
      var duracion = Number(data[i][COL_PICKING_LOG.DURACION]) || 0;
      var itemsPickeados = Number(data[i][COL_PICKING_LOG.ITEMS_PICKEADOS]) || 0;
      
      if (!usuariosMap[usuario]) {
        usuariosMap[usuario] = {
          usuario: usuario,
          totalPickings: 0,
          pickingsCompletados: 0,
          pickingsEnProceso: 0,
          totalItemsPickeados: 0,
          tiempoTotalMin: 0,
          tiempoPromedioMin: 0
        };
      }
      
      usuariosMap[usuario].totalPickings++;
      resumen.totalPickings++;
      
      if (estado === 'COMPLETADO') {
        usuariosMap[usuario].pickingsCompletados++;
        usuariosMap[usuario].totalItemsPickeados += itemsPickeados;
        usuariosMap[usuario].tiempoTotalMin += duracion;
        
        resumen.pickingsCompletados++;
        resumen.totalItemsPickeados += itemsPickeados;
        resumen.tiempoTotalMin += duracion;
      } else if (estado === 'EN_PROCESO') {
        usuariosMap[usuario].pickingsEnProceso++;
      }
    }
    
    // Calcular promedios y convertir a array
    var usuarios = [];
    for (var key in usuariosMap) {
      if (usuariosMap.hasOwnProperty(key)) {
        var u = usuariosMap[key];
        if (u.pickingsCompletados > 0) {
          u.tiempoPromedioMin = Math.round(u.tiempoTotalMin / u.pickingsCompletados);
        }
        usuarios.push(u);
      }
    }
    
    // Ordenar por total de pickings (descendente)
    usuarios.sort(function(a, b) {
      return b.totalPickings - a.totalPickings;
    });
    
    return {
      success: true,
      usuarios: usuarios,
      resumen: resumen,
      fechaDesde: fechaDesde,
      fechaHasta: fechaHasta
    };
    
  } catch (e) {
    Logger.log('Error en getEstadisticasPickingTodos: ' + e.message);
    return { success: false, error: e.message };
  }
}

/**
 * Obtiene los pickings activos (en proceso)
 * @returns {Object} - {success, pickingsActivos}
 */
function getPickingsActivos() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_PICKING_LOG);
    
    if (!sheet) {
      return { success: true, pickingsActivos: [] };
    }
    
    var data = sheet.getDataRange().getValues();
    var activos = [];
    
    for (var i = 1; i < data.length; i++) {
      var estado = String(data[i][COL_PICKING_LOG.ESTADO] || '').trim();
      
      if (estado === 'EN_PROCESO') {
        var fechaInicio = new Date(data[i][COL_PICKING_LOG.FECHA_INICIO]);
        var ahora = new Date();
        var duracionActual = Math.round((ahora - fechaInicio) / 60000);
        
        activos.push({
          pickingId: data[i][COL_PICKING_LOG.ID],
          fechaInicio: fechaInicio,
          usuario: data[i][COL_PICKING_LOG.USUARIO],
          notaVenta: data[i][COL_PICKING_LOG.NOTA_VENTA],
          cliente: data[i][COL_PICKING_LOG.CLIENTE],
          totalItems: data[i][COL_PICKING_LOG.TOTAL_ITEMS],
          duracionActualMin: duracionActual
        });
      }
    }
    
    // Ordenar por duración (más antiguo primero)
    activos.sort(function(a, b) {
      return b.duracionActualMin - a.duracionActualMin;
    });
    
    return {
      success: true,
      pickingsActivos: activos,
      total: activos.length
    };
    
  } catch (e) {
    Logger.log('Error en getPickingsActivos: ' + e.message);
    return { success: false, error: e.message };
  }
}

/**
 * Obtiene el historial completo de picking (últimos N registros)
 * @param {number} limite - Límite de registros (default 100)
 * @returns {Object} - {success, historial}
 */
function getHistorialPickingCompleto(limite) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_PICKING_LOG);
    
    if (!sheet) {
      return { success: true, historial: [] };
    }
    
    var data = sheet.getDataRange().getValues();
    var historial = [];
    limite = limite || 100;
    
    for (var i = data.length - 1; i >= 1 && historial.length < limite; i--) {
      historial.push({
        pickingId: data[i][COL_PICKING_LOG.ID],
        fechaInicio: data[i][COL_PICKING_LOG.FECHA_INICIO],
        fechaFin: data[i][COL_PICKING_LOG.FECHA_FIN],
        usuario: data[i][COL_PICKING_LOG.USUARIO],
        notaVenta: data[i][COL_PICKING_LOG.NOTA_VENTA],
        cliente: data[i][COL_PICKING_LOG.CLIENTE],
        totalItems: data[i][COL_PICKING_LOG.TOTAL_ITEMS],
        itemsPickeados: data[i][COL_PICKING_LOG.ITEMS_PICKEADOS],
        estado: data[i][COL_PICKING_LOG.ESTADO],
        duracionMin: data[i][COL_PICKING_LOG.DURACION],
        observaciones: data[i][COL_PICKING_LOG.OBSERVACIONES]
      });
    }
    
    return {
      success: true,
      historial: historial,
      total: historial.length
    };
    
  } catch (e) {
    Logger.log('Error en getHistorialPickingCompleto: ' + e.message);
    return { success: false, error: e.message };
  }
}

/**
 * Libera un picking activo (Admin)
 * 1. Marca el log como CANCELADO
 * 2. Revierte el estado de la N.V a PENDIENTE_PICKING
 * @param {string} pickingId - ID del picking a liberar
 * @param {string} usuarioAdmin - Usuario que realiza la acción
 * @returns {Object} - {success, mensaje}
 */
function liberarPicking(pickingId, usuarioAdmin) {
  try {
    var sheet = initPickingLogSheet();
    var data = sheet.getDataRange().getValues();
    var found = false;
    var nVenta = '';
    
    // 1. Buscar y cancelar en el log
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][COL_PICKING_LOG.ID]) === pickingId) {
        if (data[i][COL_PICKING_LOG.ESTADO] !== 'EN_PROCESO') {
          return { success: false, error: 'El picking no está en proceso' };
        }
        
        nVenta = String(data[i][COL_PICKING_LOG.NOTA_VENTA]);
        
        // Actualizar log
        sheet.getRange(i + 1, COL_PICKING_LOG.FECHA_FIN + 1).setValue(new Date());
        sheet.getRange(i + 1, COL_PICKING_LOG.ESTADO + 1).setValue('CANCELADO');
        sheet.getRange(i + 1, COL_PICKING_LOG.OBSERVACIONES + 1).setValue('Liberado por admin: ' + usuarioAdmin);
        
        found = true;
        break;
      }
    }
    
    if (!found) {
      return { success: false, error: 'Picking no encontrado' };
    }
    
    // 2. Revertir estado de la N.V
    if (nVenta && typeof cambiarEstadoNVDirecto === 'function') {
      var revertir = cambiarEstadoNVDirecto(nVenta, 'PENDIENTE_PICKING', usuarioAdmin);
      if (!revertir.success) {
        Logger.log('Advertencia: Log cancelado pero error al revertir N.V: ' + revertir.error);
      }
    }
    
    return { success: true, mensaje: 'Picking liberado correctamente' };
    
  } catch (e) {
    Logger.log('Error en liberarPicking: ' + e.message);
    return { success: false, error: e.message };
  }
}

// Funciones auxiliares
function getEstadisticasVacias() {
  return {
    totalPickings: 0,
    pickingsCompletados: 0,
    pickingsEnProceso: 0,
    totalItemsPickeados: 0,
    tiempoPromedioMin: 0,
    tiempoTotalMin: 0
  };
}

function getResumenVacio() {
  return {
    totalPickings: 0,
    pickingsCompletados: 0,
    totalItemsPickeados: 0,
    tiempoTotalMin: 0
  };
}
