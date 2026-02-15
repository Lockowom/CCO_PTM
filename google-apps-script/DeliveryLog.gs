/**
 * DeliveryLog.gs - Sistema de Registro de Entregas por Usuario
 * Registra cada operación de entrega con usuario, fecha, estados
 * Permite ver historial y estadísticas por transportista
 */

var SHEET_DELIVERY_LOG = 'DELIVERY_LOG';

/**
 * Estructura de la hoja DELIVERY_LOG:
 * A - ID (único)
 * B - Fecha/Hora Cambio
 * C - Usuario/Transportista
 * D - N.V (Nota de Venta)
 * E - Cliente
 * F - Estado Anterior
 * G - Estado Nuevo
 * H - Receptor
 * I - Tiene Foto
 * J - Observaciones
 */

var COL_DELIVERY_LOG = {
  ID: 0,
  FECHA_CAMBIO: 1,
  USUARIO: 2,
  NOTA_VENTA: 3,
  CLIENTE: 4,
  ESTADO_ANTERIOR: 5,
  ESTADO_NUEVO: 6,
  RECEPTOR: 7,
  TIENE_FOTO: 8,
  OBSERVACIONES: 9
};

/**
 * Inicializa la hoja DELIVERY_LOG si no existe
 */
function initDeliveryLogSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_DELIVERY_LOG);
  
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_DELIVERY_LOG);
    
    var headers = [
      'ID', 'Fecha/Hora', 'Usuario', 'N.V', 'Cliente',
      'Estado Anterior', 'Estado Nuevo', 'Receptor', 'Tiene Foto', 'Observaciones'
    ];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    
    sheet.getRange(1, 1, 1, headers.length)
      .setBackground('#10B981')
      .setFontColor('white')
      .setFontWeight('bold');
    
    sheet.setFrozenRows(1);
    
    sheet.setColumnWidth(1, 120);
    sheet.setColumnWidth(2, 150);
    sheet.setColumnWidth(3, 120);
    sheet.setColumnWidth(4, 100);
    sheet.setColumnWidth(5, 200);
    sheet.setColumnWidth(6, 120);
    sheet.setColumnWidth(7, 120);
    sheet.setColumnWidth(8, 150);
    sheet.setColumnWidth(9, 80);
    sheet.setColumnWidth(10, 200);
    
    Logger.log('Hoja DELIVERY_LOG creada');
  }
  
  return sheet;
}

/**
 * Registra un cambio de estado en entrega
 */
function registrarCambioEstadoEntrega(nVenta, usuario, cliente, estadoAnterior, estadoNuevo, receptor, tieneFoto, observaciones) {
  try {
    var sheet = initDeliveryLogSheet();
    
    var logId = 'DEL-' + new Date().getTime();
    var fechaCambio = new Date();
    
    var newRow = [
      logId,
      fechaCambio,
      usuario || 'Sistema',
      nVenta,
      cliente || '',
      estadoAnterior || 'PENDIENTE',
      estadoNuevo,
      receptor || '',
      tieneFoto ? 'SI' : 'NO',
      observaciones || ''
    ];
    
    sheet.appendRow(newRow);
    Logger.log('Cambio de estado registrado: ' + nVenta + ' -> ' + estadoNuevo + ' por ' + usuario);
    
    return {
      success: true,
      logId: logId,
      fechaCambio: fechaCambio,
      notaVenta: nVenta,
      estadoNuevo: estadoNuevo
    };
    
  } catch (e) {
    Logger.log('Error en registrarCambioEstadoEntrega: ' + e.message);
    return { success: false, error: e.message };
  }
}

/**
 * Obtiene estadísticas de entregas por transportista
 */
function getEstadisticasEntregasTodos(fechaDesde, fechaHasta) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_DELIVERY_LOG);
    
    if (!sheet) {
      return { success: true, usuarios: [], resumen: getResumenEntregasVacio() };
    }
    
    var data = sheet.getDataRange().getValues();
    var usuariosMap = {};
    var resumen = {
      totalCambios: 0,
      entregasCompletadas: 0,
      entregasRechazadas: 0,
      entregasReprogramadas: 0
    };
    
    var desde = fechaDesde ? new Date(fechaDesde) : null;
    var hasta = fechaHasta ? new Date(fechaHasta + 'T23:59:59') : null;
    
    for (var i = 1; i < data.length; i++) {
      var fechaCambio = new Date(data[i][COL_DELIVERY_LOG.FECHA_CAMBIO]);
      
      if (desde && fechaCambio < desde) continue;
      if (hasta && fechaCambio > hasta) continue;
      
      var usuario = String(data[i][COL_DELIVERY_LOG.USUARIO] || '').trim();
      if (!usuario || usuario === 'Sistema') continue;
      
      var estadoNuevo = String(data[i][COL_DELIVERY_LOG.ESTADO_NUEVO] || '').toUpperCase();
      
      if (!usuariosMap[usuario]) {
        usuariosMap[usuario] = {
          usuario: usuario,
          totalCambios: 0,
          entregasCompletadas: 0,
          entregasRechazadas: 0,
          entregasReprogramadas: 0,
          enRuta: 0
        };
      }
      
      usuariosMap[usuario].totalCambios++;
      resumen.totalCambios++;
      
      if (estadoNuevo === 'ENTREGADA' || estadoNuevo === 'ENTREGADO') {
        usuariosMap[usuario].entregasCompletadas++;
        resumen.entregasCompletadas++;
      } else if (estadoNuevo === 'RECHAZADA' || estadoNuevo === 'NO ENTREGADO') {
        usuariosMap[usuario].entregasRechazadas++;
        resumen.entregasRechazadas++;
      } else if (estadoNuevo === 'REPROGRAMADA') {
        usuariosMap[usuario].entregasReprogramadas++;
        resumen.entregasReprogramadas++;
      } else if (estadoNuevo === 'EN CAMINO' || estadoNuevo === 'EN_RUTA') {
        usuariosMap[usuario].enRuta++;
      }
    }
    
    var usuarios = [];
    for (var key in usuariosMap) {
      if (usuariosMap.hasOwnProperty(key)) {
        usuarios.push(usuariosMap[key]);
      }
    }
    
    usuarios.sort(function(a, b) {
      return b.entregasCompletadas - a.entregasCompletadas;
    });
    
    return {
      success: true,
      usuarios: usuarios,
      resumen: resumen
    };
    
  } catch (e) {
    Logger.log('Error en getEstadisticasEntregasTodos: ' + e.message);
    return { success: false, error: e.message };
  }
}

/**
 * Obtiene el historial de cambios de estado de entregas
 */
function getHistorialEntregasLog(limite) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_DELIVERY_LOG);
    
    if (!sheet) {
      return { success: true, historial: [] };
    }
    
    var data = sheet.getDataRange().getValues();
    var historial = [];
    limite = limite || 100;
    
    for (var i = data.length - 1; i >= 1 && historial.length < limite; i--) {
      historial.push({
        logId: data[i][COL_DELIVERY_LOG.ID],
        fechaCambio: data[i][COL_DELIVERY_LOG.FECHA_CAMBIO],
        usuario: data[i][COL_DELIVERY_LOG.USUARIO],
        notaVenta: data[i][COL_DELIVERY_LOG.NOTA_VENTA],
        cliente: data[i][COL_DELIVERY_LOG.CLIENTE],
        estadoAnterior: data[i][COL_DELIVERY_LOG.ESTADO_ANTERIOR],
        estadoNuevo: data[i][COL_DELIVERY_LOG.ESTADO_NUEVO],
        receptor: data[i][COL_DELIVERY_LOG.RECEPTOR],
        tieneFoto: data[i][COL_DELIVERY_LOG.TIENE_FOTO],
        observaciones: data[i][COL_DELIVERY_LOG.OBSERVACIONES]
      });
    }
    
    return {
      success: true,
      historial: historial,
      total: historial.length
    };
    
  } catch (e) {
    Logger.log('Error en getHistorialEntregasLog: ' + e.message);
    return { success: false, error: e.message };
  }
}

/**
 * Obtiene las entregas activas (en proceso) por transportista
 */
function getEntregasActivasPorTransportista() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = getOrCreateEntregasSheet(ss);
    
    if (!sheet) {
      return { success: true, activos: [] };
    }
    
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      return { success: true, activos: [] };
    }
    
    var data = sheet.getRange(2, 1, lastRow - 1, 10).getValues();
    var transportistasMap = {};
    
    for (var i = 0; i < data.length; i++) {
      var estado = String(data[i][5] || '').toUpperCase().trim();
      
      // Solo contar EN CAMINO o PENDIENTE
      if (estado !== 'EN CAMINO' && estado !== 'EN_RUTA' && estado !== 'PENDIENTE') continue;
      
      var transportista = String(data[i][3] || '').trim();
      if (!transportista) continue;
      
      if (!transportistasMap[transportista]) {
        transportistasMap[transportista] = {
          transportista: transportista,
          pendientes: 0,
          enRuta: 0,
          entregas: []
        };
      }
      
      if (estado === 'PENDIENTE') {
        transportistasMap[transportista].pendientes++;
      } else {
        transportistasMap[transportista].enRuta++;
      }
      
      transportistasMap[transportista].entregas.push({
        nv: data[i][0],
        estado: estado,
        cliente: data[i][4] || ''
      });
    }
    
    var activos = [];
    for (var key in transportistasMap) {
      if (transportistasMap.hasOwnProperty(key)) {
        activos.push(transportistasMap[key]);
      }
    }
    
    activos.sort(function(a, b) {
      return (b.pendientes + b.enRuta) - (a.pendientes + a.enRuta);
    });
    
    return {
      success: true,
      activos: activos,
      total: activos.length
    };
    
  } catch (e) {
    Logger.log('Error en getEntregasActivasPorTransportista: ' + e.message);
    return { success: false, error: e.message };
  }
}

function getResumenEntregasVacio() {
  return {
    totalCambios: 0,
    entregasCompletadas: 0,
    entregasRechazadas: 0,
    entregasReprogramadas: 0
  };
}
