/**
 * ============================================================
 * ENTREGAS API - Backend para el módulo de Entregas
 * Funciones para marcado inmediato de entregas
 * INDEPENDIENTE - Define su propia estructura de columnas
 * ============================================================
 */

// Definición local de estructura de columnas DESPACHO
// Para evitar dependencias de otros archivos
var COL_ENTREGAS_DESPACHO = {
  FECHA_DOCTO: 0,       // A
  CLIENTE: 1,           // B
  FACTURAS: 2,          // C
  GUIA: 3,              // D
  BULTOS: 4,            // E
  EMPRESA_TRANSPORTE: 5,// F
  TRANSPORTISTA: 6,     // G
  N_NV: 7,              // H
  DIVISION: 8,          // I
  VENDEDOR: 9,          // J
  FECHA_DESPACHO: 10,   // K
  VALOR_FLETE: 11,      // L
  NUM_ENVIO_OT: 12,     // M
  FECHA_CREACION: 13,   // N
  ESTADO: 14            // O
};

/**
 * Obtiene los despachos pendientes de entrega
 * Lee de la hoja DESPACHO y filtra los que no están entregados
 * @returns {Object} - {success, despachos}
 */
function getDespachosPendientesEntrega() {
  try {
    Logger.log('=== GET DESPACHOS PENDIENTES ENTREGA ===');
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Despachos') || ss.getSheetByName('DESPACHO') || ss.getSheetByName('DESPACHOS');
    
    if (!sheet) {
      Logger.log('⚠️ Hoja de despachos no encontrada, buscando en N.V DIARIAS');
      return getDespachosDesdeMaster();
    }
    
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      Logger.log('Hoja de despachos vacía');
      return { success: true, despachos: [] };
    }
    
    var data = sheet.getDataRange().getValues();
    var despachos = [];
    var nvProcesadas = {};
    
    // Usar estructura local de columnas
    var COL = COL_ENTREGAS_DESPACHO;
    
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var nVenta = String(row[COL.N_NV] || '').trim();
      var estado = String(row[COL.ESTADO] || '').toUpperCase();
      
      if (!nVenta) continue;
      if (nvProcesadas[nVenta]) continue;
      
      // Filtrar solo los que no están entregados
      if (estado.indexOf('ENTREGADO') === -1) {
        nvProcesadas[nVenta] = true;
        
        despachos.push({
          notaVenta: nVenta,
          cliente: String(row[COL.CLIENTE] || ''),
          fechaDespacho: row[COL.FECHA_DESPACHO] || row[COL.FECHA_DOCTO],
          bultos: Number(row[COL.BULTOS]) || 0,
          transportista: String(row[COL.TRANSPORTISTA] || row[COL.EMPRESA_TRANSPORTE] || ''),
          guia: String(row[COL.GUIA] || ''),
          estado: estado || 'EN TRANSITO',
          rowIndex: i + 1
        });
      }
    }
    
    Logger.log('✅ Despachos pendientes encontrados: ' + despachos.length);
    
    return {
      success: true,
      despachos: despachos
    };
    
  } catch (e) {
    Logger.log('ERROR en getDespachosPendientesEntrega: ' + e.message);
    return { success: false, error: e.message };
  }
}

/**
 * Fallback: Obtener despachos desde N.V DIARIAS
 */
function getDespachosDesdeMaster() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheetMaster = ss.getSheetByName('N.V DIARIAS');
    
    if (!sheetMaster) {
      Logger.log('Hoja N.V DIARIAS no encontrada');
      return { success: true, despachos: [] };
    }
    
    var lastRow = sheetMaster.getLastRow();
    if (lastRow <= 1) {
      return { success: true, despachos: [] };
    }
    
    var data = sheetMaster.getDataRange().getValues();
    var despachosMap = {};
    
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var estado = String(row[2] || '').toUpperCase(); // Columna C = estado
      
      // Filtrar estados de despacho pendiente
      if (estado.indexOf('LISTO') !== -1 || 
          estado.indexOf('DESPACHO') !== -1 ||
          estado.indexOf('TRANSITO') !== -1 ||
          estado.indexOf('RUTA') !== -1 ||
          estado.indexOf('ENVIADO') !== -1) {
        
        var nv = String(row[1] || '').trim(); // Columna B = N.Venta
        if (nv && !despachosMap[nv]) {
          despachosMap[nv] = {
            notaVenta: nv,
            cliente: String(row[4] || row[3] || ''), // Cliente
            fechaDespacho: row[0],
            bultos: 0,
            estado: estado,
            rowIndex: i + 1
          };
        }
      }
    }
    
    var despachos = [];
    for (var key in despachosMap) {
      despachos.push(despachosMap[key]);
    }
    
    Logger.log('✅ Despachos desde N.V DIARIAS: ' + despachos.length);
    
    return { success: true, despachos: despachos };
    
  } catch (e) {
    Logger.log('ERROR en getDespachosDesdeMaster: ' + e.message);
    return { success: false, error: e.message };
  }
}

/**
 * Marca una N.V como entregada de forma inmediata
 * @param {string} notaVenta - Número de nota de venta
 * @param {string} usuario - Usuario que marca la entrega
 * @returns {Object} - {success, error}
 */
function marcarEntregadoInmediato(notaVenta, usuario) {
  try {
    Logger.log('=== MARCAR ENTREGADO INMEDIATO ===');
    Logger.log('N.V: ' + notaVenta + ' | Usuario: ' + usuario);
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var fechaEntrega = new Date();
    var filasActualizadas = 0;
    
    // Usar estructura local de columnas
    var COL = COL_ENTREGAS_DESPACHO;
    
    // 1. Actualizar en hoja Despachos/DESPACHO
    var sheetDespachos = ss.getSheetByName('Despachos') || ss.getSheetByName('DESPACHO') || ss.getSheetByName('DESPACHOS');
    if (sheetDespachos) {
      var dataDespachos = sheetDespachos.getDataRange().getValues();
      for (var i = 1; i < dataDespachos.length; i++) {
        if (String(dataDespachos[i][COL.N_NV]).trim() === notaVenta) {
          // Columna O (15) = Estado
          sheetDespachos.getRange(i + 1, COL.ESTADO + 1).setValue('ENTREGADO');
          filasActualizadas++;
          Logger.log('✅ Actualizado en DESPACHOS fila ' + (i + 1));
        }
      }
    }
    
    // 2. Actualizar en N.V DIARIAS
    var sheetMaster = ss.getSheetByName('N.V DIARIAS');
    if (sheetMaster) {
      var dataMaster = sheetMaster.getDataRange().getValues();
      for (var j = 1; j < dataMaster.length; j++) {
        if (String(dataMaster[j][1]).trim() === notaVenta) {
          sheetMaster.getRange(j + 1, 3).setValue('ENTREGADO'); // Columna C = estado
          filasActualizadas++;
        }
      }
      Logger.log('✅ Actualizado en N.V DIARIAS');
    }
    
    SpreadsheetApp.flush();
    
    // 3. NUEVO: Registrar en hoja ENTREGAS con cálculo de tiempo
    var tiempoResult = null;
    if (typeof registrarEntregado === 'function') {
      tiempoResult = registrarEntregado(notaVenta, usuario, '');
      Logger.log('✅ Registrado en hoja ENTREGAS con tiempo');
    }
    
    // 4. Registrar en historial legacy
    registrarHistorialEntrega(notaVenta, usuario, fechaEntrega);
    
    // 5. Invalidar caché si existe
    if (typeof invalidateNVCache === 'function') {
      invalidateNVCache();
    }
    
    Logger.log('=== ENTREGA MARCADA EXITOSAMENTE ===');
    Logger.log('Filas actualizadas: ' + filasActualizadas);
    
    return {
      success: true,
      mensaje: 'N.V ' + notaVenta + ' marcada como ENTREGADA',
      filasActualizadas: filasActualizadas,
      tiempoMin: tiempoResult ? tiempoResult.tiempoMin : 0
    };
    
  } catch (e) {
    Logger.log('ERROR en marcarEntregadoInmediato: ' + e.message);
    return { success: false, error: e.message };
  }
}

/**
 * Obtiene estadísticas del módulo de entregas
 * @returns {Object} - {success, pendientes, entregados, bultosEntregados}
 */
function getStatsEntregas() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var stats = {
      pendientes: 0,
      entregados: 0,
      bultosEntregados: 0
    };
    
    var hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    // Usar estructura local de columnas
    var COL = COL_ENTREGAS_DESPACHO;
    
    // Contar desde DESPACHOS
    var sheetDespachos = ss.getSheetByName('Despachos') || ss.getSheetByName('DESPACHO') || ss.getSheetByName('DESPACHOS');
    if (sheetDespachos && sheetDespachos.getLastRow() > 1) {
      var data = sheetDespachos.getDataRange().getValues();
      var nvContadas = {};
      
      for (var i = 1; i < data.length; i++) {
        var nv = String(data[i][COL.N_NV] || '').trim();
        var estado = String(data[i][COL.ESTADO] || '').toUpperCase();
        var bultos = Number(data[i][COL.BULTOS]) || 0;
        
        if (!nv || nvContadas[nv]) continue;
        nvContadas[nv] = true;
        
        if (estado.indexOf('ENTREGADO') !== -1) {
          stats.entregados++;
          stats.bultosEntregados += bultos;
        } else {
          // TODO: Cualquier estado que NO sea ENTREGADO es pendiente
          stats.pendientes++;
        }
      }
    } else {
      // Fallback: contar desde N.V DIARIAS
      var sheetMaster = ss.getSheetByName('N.V DIARIAS');
      if (sheetMaster && sheetMaster.getLastRow() > 1) {
        var dataMaster = sheetMaster.getDataRange().getValues();
        var nvContadasM = {};
        
        for (var j = 1; j < dataMaster.length; j++) {
          var nvM = String(dataMaster[j][1] || '').trim();
          var estadoM = String(dataMaster[j][2] || '').toUpperCase();
          
          if (!nvM || nvContadasM[nvM]) continue;
          nvContadasM[nvM] = true;
          
          if (estadoM.indexOf('ENTREGADO') !== -1) {
            stats.entregados++;
          } else if (estadoM.indexOf('DESPACHO') !== -1 || 
                     estadoM.indexOf('TRANSITO') !== -1 ||
                     estadoM.indexOf('RUTA') !== -1 ||
                     estadoM.indexOf('ENVIADO') !== -1 ||
                     estadoM.indexOf('CAMINO') !== -1) {
            stats.pendientes++;
          }
        }
      }
    }
    
    return {
      success: true,
      pendientes: stats.pendientes,
      entregados: stats.entregados,
      bultosEntregados: stats.bultosEntregados
    };
    
  } catch (e) {
    Logger.log('ERROR en getStatsEntregas: ' + e.message);
    return { success: false, error: e.message };
  }
}

/**
 * Registra la entrega en historial
 */
function registrarHistorialEntrega(notaVenta, usuario, fechaEntrega) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheetHistorial = ss.getSheetByName('HISTORIAL_ENTREGAS');
    
    if (!sheetHistorial) {
      // Crear hoja si no existe
      sheetHistorial = ss.insertSheet('HISTORIAL_ENTREGAS');
      sheetHistorial.appendRow([
        'Fecha', 'N.Venta', 'Usuario', 'Accion', 'Timestamp'
      ]);
      sheetHistorial.getRange(1, 1, 1, 5).setFontWeight('bold').setBackground('#27ae60').setFontColor('white');
    }
    
    sheetHistorial.appendRow([
      fechaEntrega,
      notaVenta,
      usuario,
      'ENTREGADO',
      new Date()
    ]);
    
    Logger.log('✅ Registrado en HISTORIAL_ENTREGAS');
    
  } catch (e) {
    Logger.log('Error en registrarHistorialEntrega: ' + e.message);
  }
}

/**
 * Función de prueba para verificar la conexión
 */
function testEntregasAPI() {
  Logger.log('=== TEST ENTREGAS API ===');
  
  var result = getDespachosPendientesEntrega();
  Logger.log('Resultado: ' + JSON.stringify(result, null, 2));
  
  var stats = getStatsEntregas();
  Logger.log('Stats: ' + JSON.stringify(stats, null, 2));
  
  return { despachos: result, stats: stats };
}
