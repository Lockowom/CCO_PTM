/**
 * PackingLog.gs - Sistema de Registro de Packing por Usuario
 * Registra cada operación de packing con usuario, fecha, cantidades
 * Permite ver historial y estadísticas por usuario
 */

var SHEET_PACKING_LOG = 'PACKING_LOG';

/**
 * Estructura de la hoja PACKING_LOG:
 * A - ID (único)
 * B - Fecha/Hora Inicio
 * C - Fecha/Hora Fin
 * D - Usuario
 * E - N.V (Nota de Venta)
 * F - Cliente
 * G - Total Items
 * H - Bultos
 * I - Pallets
 * J - Estado (EN_PROCESO, COMPLETADO, CANCELADO)
 * K - Duración (minutos)
 * L - Observaciones
 */

var COL_PACKING_LOG = {
  ID: 0,
  FECHA_INICIO: 1,
  FECHA_FIN: 2,
  USUARIO: 3,
  NOTA_VENTA: 4,
  CLIENTE: 5,
  TOTAL_ITEMS: 6,
  BULTOS: 7,
  PALLETS: 8,
  ESTADO: 9,
  DURACION: 10,
  OBSERVACIONES: 11
};

/**
 * Inicializa la hoja PACKING_LOG si no existe
 * @returns {Sheet} - La hoja PACKING_LOG
 */
function initPackingLogSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_PACKING_LOG);
  
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_PACKING_LOG);
    
    var headers = [
      'ID', 'Fecha Inicio', 'Fecha Fin', 'Usuario', 'N.V', 
      'Cliente', 'Total Items', 'Bultos', 'Pallets', 'Estado', 
      'Duración (min)', 'Observaciones'
    ];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    
    sheet.getRange(1, 1, 1, headers.length)
      .setBackground('#8B5CF6')
      .setFontColor('white')
      .setFontWeight('bold');
    
    sheet.setFrozenRows(1);
    
    sheet.setColumnWidth(1, 120);
    sheet.setColumnWidth(2, 150);
    sheet.setColumnWidth(3, 150);
    sheet.setColumnWidth(4, 120);
    sheet.setColumnWidth(5, 100);
    sheet.setColumnWidth(6, 200);
    sheet.setColumnWidth(7, 80);
    sheet.setColumnWidth(8, 80);
    sheet.setColumnWidth(9, 80);
    sheet.setColumnWidth(10, 100);
    sheet.setColumnWidth(11, 100);
    sheet.setColumnWidth(12, 200);
    
    Logger.log('Hoja PACKING_LOG creada');
  }
  
  return sheet;
}

/**
 * Registra el inicio de un packing
 */
function registrarInicioPacking(nVenta, usuario, cliente, totalItems) {
  try {
    var sheet = initPackingLogSheet();
    
    var packingActivo = getPackingActivoPorNV(nVenta);
    if (packingActivo) {
      return {
        success: false,
        error: 'Ya existe un packing en proceso para esta N.V por ' + packingActivo.usuario,
        packingActivo: packingActivo
      };
    }
    
    var packingId = 'PCK-' + new Date().getTime();
    var fechaInicio = new Date();
    
    var newRow = [
      packingId, fechaInicio, '', usuario, nVenta, cliente || '',
      totalItems || 0, 0, 0, 'EN_PROCESO', '', ''
    ];
    
    sheet.appendRow(newRow);
    Logger.log('Packing iniciado: ' + packingId + ' por ' + usuario + ' para N.V ' + nVenta);
    
    return {
      success: true,
      packingId: packingId,
      fechaInicio: fechaInicio,
      usuario: usuario,
      notaVenta: nVenta
    };
    
  } catch (e) {
    Logger.log('Error en registrarInicioPacking: ' + e.message);
    return { success: false, error: e.message };
  }
}

/**
 * Registra la finalización de un packing
 */
function registrarFinPackingLog(nVenta, usuario, bultos, pallets, observaciones) {
  try {
    var sheet = initPackingLogSheet();
    var data = sheet.getDataRange().getValues();
    var nVentaBuscada = String(nVenta).trim();
    
    for (var i = data.length - 1; i >= 1; i--) {
      var nvFila = String(data[i][COL_PACKING_LOG.NOTA_VENTA] || '').trim();
      var estadoFila = String(data[i][COL_PACKING_LOG.ESTADO] || '').trim();
      
      if (nvFila === nVentaBuscada && estadoFila === 'EN_PROCESO') {
        var fechaInicio = new Date(data[i][COL_PACKING_LOG.FECHA_INICIO]);
        var fechaFin = new Date();
        var duracionMs = fechaFin - fechaInicio;
        var duracionMin = Math.round(duracionMs / 60000);
        
        sheet.getRange(i + 1, COL_PACKING_LOG.FECHA_FIN + 1).setValue(fechaFin);
        sheet.getRange(i + 1, COL_PACKING_LOG.BULTOS + 1).setValue(bultos || 0);
        sheet.getRange(i + 1, COL_PACKING_LOG.PALLETS + 1).setValue(pallets || 0);
        sheet.getRange(i + 1, COL_PACKING_LOG.ESTADO + 1).setValue('COMPLETADO');
        sheet.getRange(i + 1, COL_PACKING_LOG.DURACION + 1).setValue(duracionMin);
        if (observaciones) {
          sheet.getRange(i + 1, COL_PACKING_LOG.OBSERVACIONES + 1).setValue(observaciones);
        }
        
        Logger.log('Packing completado para N.V ' + nVenta + ' - Duración: ' + duracionMin + ' min');
        
        return {
          success: true,
          packingId: data[i][COL_PACKING_LOG.ID],
          notaVenta: nVenta,
          usuario: data[i][COL_PACKING_LOG.USUARIO],
          duracionMinutos: duracionMin,
          bultos: bultos,
          pallets: pallets
        };
      }
    }
    
    return { success: false, error: 'No se encontró packing activo para N.V ' + nVenta };
    
  } catch (e) {
    Logger.log('Error en registrarFinPackingLog: ' + e.message);
    return { success: false, error: e.message };
  }
}

/**
 * Obtiene el packing activo para una N.V
 */
function getPackingActivoPorNV(nVenta) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_PACKING_LOG);
    
    if (!sheet) return null;
    
    var data = sheet.getDataRange().getValues();
    var nVentaBuscada = String(nVenta).trim();
    
    for (var i = data.length - 1; i >= 1; i--) {
      var nvFila = String(data[i][COL_PACKING_LOG.NOTA_VENTA] || '').trim();
      var estadoFila = String(data[i][COL_PACKING_LOG.ESTADO] || '').trim();
      
      if (nvFila === nVentaBuscada && estadoFila === 'EN_PROCESO') {
        return {
          packingId: data[i][COL_PACKING_LOG.ID],
          fechaInicio: data[i][COL_PACKING_LOG.FECHA_INICIO],
          usuario: data[i][COL_PACKING_LOG.USUARIO],
          notaVenta: nvFila,
          cliente: data[i][COL_PACKING_LOG.CLIENTE],
          totalItems: data[i][COL_PACKING_LOG.TOTAL_ITEMS]
        };
      }
    }
    
    return null;
    
  } catch (e) {
    Logger.log('Error en getPackingActivoPorNV: ' + e.message);
    return null;
  }
}

/**
 * Obtiene los packings activos (en proceso)
 */
function getPackingsActivos() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_PACKING_LOG);
    
    if (!sheet) {
      return { success: true, packingsActivos: [] };
    }
    
    var data = sheet.getDataRange().getValues();
    var activos = [];
    
    for (var i = 1; i < data.length; i++) {
      var estado = String(data[i][COL_PACKING_LOG.ESTADO] || '').trim();
      
      if (estado === 'EN_PROCESO') {
        var fechaInicio = new Date(data[i][COL_PACKING_LOG.FECHA_INICIO]);
        var ahora = new Date();
        var duracionActual = Math.round((ahora - fechaInicio) / 60000);
        
        activos.push({
          packingId: data[i][COL_PACKING_LOG.ID],
          fechaInicio: fechaInicio,
          usuario: data[i][COL_PACKING_LOG.USUARIO],
          notaVenta: data[i][COL_PACKING_LOG.NOTA_VENTA],
          cliente: data[i][COL_PACKING_LOG.CLIENTE],
          totalItems: data[i][COL_PACKING_LOG.TOTAL_ITEMS],
          duracionActualMin: duracionActual
        });
      }
    }
    
    activos.sort(function(a, b) {
      return b.duracionActualMin - a.duracionActualMin;
    });
    
    return {
      success: true,
      packingsActivos: activos,
      total: activos.length
    };
    
  } catch (e) {
    Logger.log('Error en getPackingsActivos: ' + e.message);
    return { success: false, error: e.message };
  }
}

/**
 * Obtiene estadísticas de packing de todos los usuarios
 */
function getEstadisticasPackingTodos(fechaDesde, fechaHasta) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_PACKING_LOG);
    
    if (!sheet) {
      return { success: true, usuarios: [], resumen: getResumenPackingVacio() };
    }
    
    var data = sheet.getDataRange().getValues();
    var usuariosMap = {};
    var resumen = {
      totalPackings: 0,
      packingsCompletados: 0,
      totalBultos: 0,
      totalPallets: 0,
      tiempoTotalMin: 0
    };
    
    var desde = fechaDesde ? new Date(fechaDesde) : null;
    var hasta = fechaHasta ? new Date(fechaHasta + 'T23:59:59') : null;
    
    for (var i = 1; i < data.length; i++) {
      var fechaInicio = new Date(data[i][COL_PACKING_LOG.FECHA_INICIO]);
      
      if (desde && fechaInicio < desde) continue;
      if (hasta && fechaInicio > hasta) continue;
      
      var usuario = String(data[i][COL_PACKING_LOG.USUARIO] || '').trim();
      if (!usuario) continue;
      
      var estado = String(data[i][COL_PACKING_LOG.ESTADO] || '');
      var duracion = Number(data[i][COL_PACKING_LOG.DURACION]) || 0;
      var bultos = Number(data[i][COL_PACKING_LOG.BULTOS]) || 0;
      var pallets = Number(data[i][COL_PACKING_LOG.PALLETS]) || 0;
      
      if (!usuariosMap[usuario]) {
        usuariosMap[usuario] = {
          usuario: usuario,
          totalPackings: 0,
          packingsCompletados: 0,
          packingsEnProceso: 0,
          totalBultos: 0,
          totalPallets: 0,
          tiempoTotalMin: 0,
          tiempoPromedioMin: 0
        };
      }
      
      usuariosMap[usuario].totalPackings++;
      resumen.totalPackings++;
      
      if (estado === 'COMPLETADO') {
        usuariosMap[usuario].packingsCompletados++;
        usuariosMap[usuario].totalBultos += bultos;
        usuariosMap[usuario].totalPallets += pallets;
        usuariosMap[usuario].tiempoTotalMin += duracion;
        
        resumen.packingsCompletados++;
        resumen.totalBultos += bultos;
        resumen.totalPallets += pallets;
        resumen.tiempoTotalMin += duracion;
      } else if (estado === 'EN_PROCESO') {
        usuariosMap[usuario].packingsEnProceso++;
      }
    }
    
    var usuarios = [];
    for (var key in usuariosMap) {
      if (usuariosMap.hasOwnProperty(key)) {
        var u = usuariosMap[key];
        if (u.packingsCompletados > 0) {
          u.tiempoPromedioMin = Math.round(u.tiempoTotalMin / u.packingsCompletados);
        }
        usuarios.push(u);
      }
    }
    
    usuarios.sort(function(a, b) {
      return b.totalPackings - a.totalPackings;
    });
    
    return {
      success: true,
      usuarios: usuarios,
      resumen: resumen
    };
    
  } catch (e) {
    Logger.log('Error en getEstadisticasPackingTodos: ' + e.message);
    return { success: false, error: e.message };
  }
}

/**
 * Obtiene el historial completo de packing
 */
function getHistorialPackingCompleto(limite) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_PACKING_LOG);
    
    if (!sheet) {
      return { success: true, historial: [] };
    }
    
    var data = sheet.getDataRange().getValues();
    var historial = [];
    limite = limite || 100;
    
    for (var i = data.length - 1; i >= 1 && historial.length < limite; i--) {
      historial.push({
        packingId: data[i][COL_PACKING_LOG.ID],
        fechaInicio: data[i][COL_PACKING_LOG.FECHA_INICIO],
        fechaFin: data[i][COL_PACKING_LOG.FECHA_FIN],
        usuario: data[i][COL_PACKING_LOG.USUARIO],
        notaVenta: data[i][COL_PACKING_LOG.NOTA_VENTA],
        cliente: data[i][COL_PACKING_LOG.CLIENTE],
        totalItems: data[i][COL_PACKING_LOG.TOTAL_ITEMS],
        bultos: data[i][COL_PACKING_LOG.BULTOS],
        pallets: data[i][COL_PACKING_LOG.PALLETS],
        estado: data[i][COL_PACKING_LOG.ESTADO],
        duracionMin: data[i][COL_PACKING_LOG.DURACION],
        observaciones: data[i][COL_PACKING_LOG.OBSERVACIONES]
      });
    }
    
    return {
      success: true,
      historial: historial,
      total: historial.length
    };
    
  } catch (e) {
    Logger.log('Error en getHistorialPackingCompleto: ' + e.message);
    return { success: false, error: e.message };
  }
}

function getResumenPackingVacio() {
  return {
    totalPackings: 0,
    packingsCompletados: 0,
    totalBultos: 0,
    totalPallets: 0,
    tiempoTotalMin: 0
  };
}
