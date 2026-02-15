/**
 * ============================================================
 * TRACKING DE TIEMPOS - PICKING, PACKING Y ENTREGAS
 * 
 * Registra tiempos de inicio y fin para métricas y reportes
 * ============================================================
 */

/**
 * ============================================================
 * HOJA ENTREGAS - Registro de Tiempos de Entrega
 * ============================================================
 */

// Estructura de columnas para hoja ENTREGAS
var COL_ENTREGAS = {
  FECHA: 0,           // A - Fecha del registro
  N_NV: 1,            // B - Número de N.V
  CLIENTE: 2,         // C - Nombre del cliente
  REPARTIDOR: 3,      // D - Usuario/Repartidor
  ESTADO: 4,          // E - Estado actual (EN CAMINO, ENTREGADO)
  FECHA_EN_CAMINO: 5, // F - Timestamp cuando salió a repartir
  FECHA_ENTREGADO: 6, // G - Timestamp cuando se entregó
  TIEMPO_MIN: 7,      // H - Tiempo en minutos (calculado)
  OBSERVACIONES: 8    // I - Observaciones
};

/**
 * Inicializa la hoja ENTREGAS si no existe
 */
function inicializarHojaEntregas() {
  Logger.log('=== INICIALIZANDO HOJA ENTREGAS ===');
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('ENTREGAS');
  
  if (!sheet) {
    sheet = ss.insertSheet('ENTREGAS');
    Logger.log('✅ Hoja ENTREGAS creada');
  }
  
  // Headers
  var headers = [
    'FECHA', 'N.V', 'CLIENTE', 'REPARTIDOR', 'ESTADO', 
    'FECHA EN CAMINO', 'FECHA ENTREGADO', 'TIEMPO (MIN)', 'OBSERVACIONES'
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length)
    .setFontWeight('bold')
    .setBackground('#27ae60')
    .setFontColor('white');
  
  // Formato de columnas
  sheet.setColumnWidth(1, 100);
  sheet.setColumnWidth(2, 100);
  sheet.setColumnWidth(3, 200);
  sheet.setColumnWidth(4, 120);
  sheet.setColumnWidth(5, 100);
  sheet.setColumnWidth(6, 150);
  sheet.setColumnWidth(7, 150);
  sheet.setColumnWidth(8, 100);
  sheet.setColumnWidth(9, 200);
  
  Logger.log('=== HOJA ENTREGAS INICIALIZADA ===');
  return sheet;
}

/**
 * Registra cuando una N.V sale EN CAMINO
 */
function registrarEnCamino(nVenta, cliente, repartidor) {
  try {
    Logger.log('📦 Registrando EN CAMINO: ' + nVenta);
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('ENTREGAS');
    
    if (!sheet) {
      sheet = inicializarHojaEntregas();
    }
    
    var ahora = new Date();
    
    // Buscar si ya existe un registro para esta N.V
    var data = sheet.getDataRange().getValues();
    var filaExistente = -1;
    
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][COL_ENTREGAS.N_NV]).trim() === nVenta) {
        filaExistente = i + 1;
        break;
      }
    }
    
    if (filaExistente > 0) {
      // Actualizar registro existente
      sheet.getRange(filaExistente, COL_ENTREGAS.ESTADO + 1).setValue('EN CAMINO');
      sheet.getRange(filaExistente, COL_ENTREGAS.FECHA_EN_CAMINO + 1).setValue(ahora);
      sheet.getRange(filaExistente, COL_ENTREGAS.REPARTIDOR + 1).setValue(repartidor);
      Logger.log('✅ Actualizado registro existente fila ' + filaExistente);
    } else {
      // Crear nuevo registro
      var nuevaFila = [
        ahora,              // FECHA
        nVenta,             // N.V
        cliente || '',      // CLIENTE
        repartidor || '',   // REPARTIDOR
        'EN CAMINO',        // ESTADO
        ahora,              // FECHA EN CAMINO
        '',                 // FECHA ENTREGADO (vacío)
        '',                 // TIEMPO (vacío)
        ''                  // OBSERVACIONES
      ];
      
      sheet.appendRow(nuevaFila);
      Logger.log('✅ Nuevo registro creado para N.V ' + nVenta);
    }
    
    SpreadsheetApp.flush();
    
    return { success: true, mensaje: 'N.V ' + nVenta + ' registrada EN CAMINO' };
    
  } catch (e) {
    Logger.log('ERROR en registrarEnCamino: ' + e.message);
    return { success: false, error: e.message };
  }
}

/**
 * Registra cuando una N.V es ENTREGADA y calcula tiempo
 */
function registrarEntregado(nVenta, repartidor, observaciones) {
  try {
    Logger.log('✅ Registrando ENTREGADO: ' + nVenta);
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('ENTREGAS');
    
    if (!sheet) {
      sheet = inicializarHojaEntregas();
    }
    
    var ahora = new Date();
    
    // Buscar registro de esta N.V
    var data = sheet.getDataRange().getValues();
    var filaExistente = -1;
    var fechaEnCamino = null;
    
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][COL_ENTREGAS.N_NV]).trim() === nVenta) {
        filaExistente = i + 1;
        fechaEnCamino = data[i][COL_ENTREGAS.FECHA_EN_CAMINO];
        break;
      }
    }
    
    var tiempoMin = 0;
    
    if (filaExistente > 0) {
      // Calcular tiempo si hay fecha EN CAMINO
      if (fechaEnCamino) {
        var inicio = new Date(fechaEnCamino);
        tiempoMin = Math.round((ahora.getTime() - inicio.getTime()) / 60000);
      }
      
      // Actualizar registro
      sheet.getRange(filaExistente, COL_ENTREGAS.ESTADO + 1).setValue('ENTREGADO');
      sheet.getRange(filaExistente, COL_ENTREGAS.FECHA_ENTREGADO + 1).setValue(ahora);
      sheet.getRange(filaExistente, COL_ENTREGAS.TIEMPO_MIN + 1).setValue(tiempoMin);
      
      if (observaciones) {
        sheet.getRange(filaExistente, COL_ENTREGAS.OBSERVACIONES + 1).setValue(observaciones);
      }
      
      Logger.log('✅ Entrega registrada - Tiempo: ' + tiempoMin + ' min');
    } else {
      // Crear nuevo registro (sin tiempo de EN CAMINO)
      var nuevaFila = [
        ahora,
        nVenta,
        '',
        repartidor || '',
        'ENTREGADO',
        '',              // Sin fecha EN CAMINO
        ahora,           // FECHA ENTREGADO
        0,               // Sin tiempo
        observaciones || ''
      ];
      
      sheet.appendRow(nuevaFila);
      Logger.log('⚠️ N.V entregada sin registro previo de EN CAMINO');
    }
    
    SpreadsheetApp.flush();
    
    return { 
      success: true, 
      mensaje: 'N.V ' + nVenta + ' ENTREGADA',
      tiempoMin: tiempoMin
    };
    
  } catch (e) {
    Logger.log('ERROR en registrarEntregado: ' + e.message);
    return { success: false, error: e.message };
  }
}

/**
 * ============================================================
 * HOJA PICKING - Tracking de Tiempos
 * ============================================================
 */

/**
 * Inicializa columnas de tiempo en hoja PICKING
 */
function inicializarTiemposHojaPicking() {
  Logger.log('=== INICIALIZANDO TIEMPOS EN PICKING ===');
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('PICKING');
  
  if (!sheet) {
    Logger.log('❌ Hoja PICKING no encontrada');
    return { success: false, error: 'Hoja PICKING no encontrada' };
  }
  
  var lastCol = sheet.getLastColumn();
  var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  
  // Verificar si ya existen las columnas
  var colTiempoInicio = -1;
  var colTiempoFin = -1;
  var colDuracionMin = -1;
  
  for (var i = 0; i < headers.length; i++) {
    var h = String(headers[i]).toUpperCase();
    if (h.indexOf('TIEMPO_INICIO') !== -1 || h.indexOf('INICIO') !== -1 && h.indexOf('PICKING') !== -1) colTiempoInicio = i;
    if (h.indexOf('TIEMPO_FIN') !== -1 || h.indexOf('FIN') !== -1 && h.indexOf('PICKING') !== -1) colTiempoFin = i;
    if (h.indexOf('DURACION') !== -1 || h.indexOf('TIEMPO_TOTAL') !== -1) colDuracionMin = i;
  }
  
  // Si no existen, agregarlas
  if (colTiempoInicio === -1) {
    sheet.getRange(1, lastCol + 1).setValue('TIEMPO_INICIO_PICKING');
    lastCol++;
    Logger.log('✅ Columna TIEMPO_INICIO_PICKING agregada');
  }
  
  if (colTiempoFin === -1) {
    sheet.getRange(1, lastCol + 1).setValue('TIEMPO_FIN_PICKING');
    lastCol++;
    Logger.log('✅ Columna TIEMPO_FIN_PICKING agregada');
  }
  
  if (colDuracionMin === -1) {
    sheet.getRange(1, lastCol + 1).setValue('DURACION_PICKING_MIN');
    lastCol++;
    Logger.log('✅ Columna DURACION_PICKING_MIN agregada');
  }
  
  SpreadsheetApp.flush();
  
  Logger.log('=== TIEMPOS PICKING INICIALIZADOS ===');
  return { success: true };
}

/**
 * Registra inicio de picking para una N.V
 */
function registrarInicioPicking(nVenta, usuario) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('PICKING');
    
    if (!sheet) return { success: false, error: 'Hoja PICKING no encontrada' };
    
    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    
    // Buscar columnas
    var colNV = -1, colTiempoInicio = -1;
    for (var c = 0; c < headers.length; c++) {
      var h = String(headers[c]).toUpperCase();
      if (h.indexOf('N.V') !== -1 || h.indexOf('NV') !== -1 || h === 'NOTAVENTA') colNV = c;
      if (h.indexOf('TIEMPO_INICIO') !== -1) colTiempoInicio = c;
    }
    
    if (colNV === -1 || colTiempoInicio === -1) {
      return { success: false, error: 'Columnas no encontradas' };
    }
    
    // Buscar y actualizar fila
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][colNV]).trim() === nVenta) {
        sheet.getRange(i + 1, colTiempoInicio + 1).setValue(new Date());
        Logger.log('✅ Inicio picking registrado para ' + nVenta);
        return { success: true };
      }
    }
    
    return { success: false, error: 'N.V no encontrada' };
    
  } catch (e) {
    Logger.log('ERROR: ' + e.message);
    return { success: false, error: e.message };
  }
}

/**
 * Registra fin de picking y calcula duración
 */
function registrarFinPicking(nVenta, usuario) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('PICKING');
    
    if (!sheet) return { success: false, error: 'Hoja PICKING no encontrada' };
    
    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    var ahora = new Date();
    
    // Buscar columnas
    var colNV = -1, colTiempoInicio = -1, colTiempoFin = -1, colDuracion = -1;
    for (var c = 0; c < headers.length; c++) {
      var h = String(headers[c]).toUpperCase();
      if (h.indexOf('N.V') !== -1 || h.indexOf('NV') !== -1 || h === 'NOTAVENTA') colNV = c;
      if (h.indexOf('TIEMPO_INICIO') !== -1) colTiempoInicio = c;
      if (h.indexOf('TIEMPO_FIN') !== -1) colTiempoFin = c;
      if (h.indexOf('DURACION') !== -1) colDuracion = c;
    }
    
    // Buscar y actualizar fila
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][colNV]).trim() === nVenta) {
        var fila = i + 1;
        
        // Registrar tiempo fin
        if (colTiempoFin !== -1) {
          sheet.getRange(fila, colTiempoFin + 1).setValue(ahora);
        }
        
        // Calcular duración
        if (colTiempoInicio !== -1 && colDuracion !== -1 && data[i][colTiempoInicio]) {
          var inicio = new Date(data[i][colTiempoInicio]);
          var duracionMin = Math.round((ahora.getTime() - inicio.getTime()) / 60000);
          sheet.getRange(fila, colDuracion + 1).setValue(duracionMin);
          Logger.log('✅ Picking completado: ' + duracionMin + ' min');
        }
        
        return { success: true };
      }
    }
    
    return { success: false, error: 'N.V no encontrada' };
    
  } catch (e) {
    Logger.log('ERROR: ' + e.message);
    return { success: false, error: e.message };
  }
}

/**
 * ============================================================
 * HOJA PACKING - Tracking de Tiempos
 * ============================================================
 */

/**
 * Inicializa columnas de tiempo en hoja PACKING
 */
function inicializarTiemposHojaPacking() {
  Logger.log('=== INICIALIZANDO TIEMPOS EN PACKING ===');
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('PACKING');
  
  if (!sheet) {
    Logger.log('❌ Hoja PACKING no encontrada');
    return { success: false, error: 'Hoja PACKING no encontrada' };
  }
  
  var lastCol = sheet.getLastColumn();
  var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  
  // Verificar si ya existen las columnas
  var colTiempoInicio = -1;
  var colTiempoFin = -1;
  var colDuracionMin = -1;
  
  for (var i = 0; i < headers.length; i++) {
    var h = String(headers[i]).toUpperCase();
    if (h.indexOf('TIEMPO_INICIO') !== -1) colTiempoInicio = i;
    if (h.indexOf('TIEMPO_FIN') !== -1) colTiempoFin = i;
    if (h.indexOf('DURACION') !== -1) colDuracionMin = i;
  }
  
  // Si no existen, agregarlas
  if (colTiempoInicio === -1) {
    sheet.getRange(1, lastCol + 1).setValue('TIEMPO_INICIO_PACKING');
    lastCol++;
    Logger.log('✅ Columna TIEMPO_INICIO_PACKING agregada');
  }
  
  if (colTiempoFin === -1) {
    sheet.getRange(1, lastCol + 1).setValue('TIEMPO_FIN_PACKING');
    lastCol++;
    Logger.log('✅ Columna TIEMPO_FIN_PACKING agregada');
  }
  
  if (colDuracionMin === -1) {
    sheet.getRange(1, lastCol + 1).setValue('DURACION_PACKING_MIN');
    lastCol++;
    Logger.log('✅ Columna DURACION_PACKING_MIN agregada');
  }
  
  SpreadsheetApp.flush();
  
  Logger.log('=== TIEMPOS PACKING INICIALIZADOS ===');
  return { success: true };
}

/**
 * Registra inicio de packing para una N.V
 */
function registrarInicioPacking(nVenta, usuario) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('PACKING');
    
    if (!sheet) return { success: false, error: 'Hoja PACKING no encontrada' };
    
    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    
    // Buscar columnas
    var colNV = -1, colTiempoInicio = -1;
    for (var c = 0; c < headers.length; c++) {
      var h = String(headers[c]).toUpperCase();
      if (h.indexOf('N.V') !== -1 || h.indexOf('NV') !== -1 || h === 'NOTAVENTA') colNV = c;
      if (h.indexOf('TIEMPO_INICIO') !== -1) colTiempoInicio = c;
    }
    
    if (colNV === -1 || colTiempoInicio === -1) {
      return { success: false, error: 'Columnas no encontradas' };
    }
    
    // Buscar y actualizar fila
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][colNV]).trim() === nVenta) {
        sheet.getRange(i + 1, colTiempoInicio + 1).setValue(new Date());
        Logger.log('✅ Inicio packing registrado para ' + nVenta);
        return { success: true };
      }
    }
    
    return { success: false, error: 'N.V no encontrada' };
    
  } catch (e) {
    Logger.log('ERROR: ' + e.message);
    return { success: false, error: e.message };
  }
}

/**
 * Registra fin de packing y calcula duración
 */
function registrarFinPacking(nVenta, usuario) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('PACKING');
    
    if (!sheet) return { success: false, error: 'Hoja PACKING no encontrada' };
    
    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    var ahora = new Date();
    
    // Buscar columnas
    var colNV = -1, colTiempoInicio = -1, colTiempoFin = -1, colDuracion = -1;
    for (var c = 0; c < headers.length; c++) {
      var h = String(headers[c]).toUpperCase();
      if (h.indexOf('N.V') !== -1 || h.indexOf('NV') !== -1 || h === 'NOTAVENTA') colNV = c;
      if (h.indexOf('TIEMPO_INICIO') !== -1) colTiempoInicio = c;
      if (h.indexOf('TIEMPO_FIN') !== -1) colTiempoFin = c;
      if (h.indexOf('DURACION') !== -1) colDuracion = c;
    }
    
    // Buscar y actualizar fila
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][colNV]).trim() === nVenta) {
        var fila = i + 1;
        
        // Registrar tiempo fin
        if (colTiempoFin !== -1) {
          sheet.getRange(fila, colTiempoFin + 1).setValue(ahora);
        }
        
        // Calcular duración
        if (colTiempoInicio !== -1 && colDuracion !== -1 && data[i][colTiempoInicio]) {
          var inicio = new Date(data[i][colTiempoInicio]);
          var duracionMin = Math.round((ahora.getTime() - inicio.getTime()) / 60000);
          sheet.getRange(fila, colDuracion + 1).setValue(duracionMin);
          Logger.log('✅ Packing completado: ' + duracionMin + ' min');
        }
        
        return { success: true };
      }
    }
    
    return { success: false, error: 'N.V no encontrada' };
    
  } catch (e) {
    Logger.log('ERROR: ' + e.message);
    return { success: false, error: e.message };
  }
}

/**
 * ============================================================
 * FUNCIONES DE INICIALIZACIÓN Y REPORTES
 * ============================================================
 */

/**
 * Inicializa todas las hojas con columnas de tiempo
 */
function inicializarTodasLasHojasTiempos() {
  Logger.log('=== INICIALIZANDO TODAS LAS HOJAS CON TIEMPOS ===');
  
  var resultados = {
    entregas: inicializarHojaEntregas(),
    picking: inicializarTiemposHojaPicking(),
    packing: inicializarTiemposHojaPacking()
  };
  
  Logger.log('=== INICIALIZACIÓN COMPLETA ===');
  Logger.log(JSON.stringify(resultados, null, 2));
  
  return resultados;
}

/**
 * Obtiene reporte de tiempos por repartidor
 */
function getReporteTiemposRepartidores() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('ENTREGAS');
    
    if (!sheet || sheet.getLastRow() <= 1) {
      return { success: true, repartidores: [], total: 0 };
    }
    
    var data = sheet.getDataRange().getValues();
    var resumen = {};
    
    for (var i = 1; i < data.length; i++) {
      var repartidor = String(data[i][COL_ENTREGAS.REPARTIDOR] || 'Sin asignar');
      var estado = String(data[i][COL_ENTREGAS.ESTADO] || '');
      var tiempo = Number(data[i][COL_ENTREGAS.TIEMPO_MIN]) || 0;
      
      if (!resumen[repartidor]) {
        resumen[repartidor] = {
          repartidor: repartidor,
          totalEntregas: 0,
          entregasCompletadas: 0,
          tiempoTotalMin: 0,
          tiempoPromedioMin: 0
        };
      }
      
      resumen[repartidor].totalEntregas++;
      
      if (estado.toUpperCase() === 'ENTREGADO') {
        resumen[repartidor].entregasCompletadas++;
        resumen[repartidor].tiempoTotalMin += tiempo;
      }
    }
    
    // Calcular promedios
    var resultado = [];
    for (var key in resumen) {
      var r = resumen[key];
      if (r.entregasCompletadas > 0) {
        r.tiempoPromedioMin = Math.round(r.tiempoTotalMin / r.entregasCompletadas);
      }
      resultado.push(r);
    }
    
    // Ordenar por entregas completadas
    resultado.sort(function(a, b) {
      return b.entregasCompletadas - a.entregasCompletadas;
    });
    
    return { success: true, repartidores: resultado, total: resultado.length };
    
  } catch (e) {
    Logger.log('ERROR: ' + e.message);
    return { success: false, error: e.message };
  }
}

/**
 * Obtiene reporte de tiempos de picking por usuario
 */
function getReporteTiemposPicking() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('PICKING_LOG') || ss.getSheetByName('PICKING');
    
    if (!sheet || sheet.getLastRow() <= 1) {
      return { success: true, usuarios: [], total: 0 };
    }
    
    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    
    // Buscar columnas
    var colUsuario = -1, colDuracion = -1;
    for (var c = 0; c < headers.length; c++) {
      var h = String(headers[c]).toUpperCase();
      if (h.indexOf('USUARIO') !== -1 || h.indexOf('USER') !== -1) colUsuario = c;
      if (h.indexOf('DURACION') !== -1) colDuracion = c;
    }
    
    if (colUsuario === -1 || colDuracion === -1) {
      return { success: true, usuarios: [], total: 0 };
    }
    
    var resumen = {};
    
    for (var i = 1; i < data.length; i++) {
      var usuario = String(data[i][colUsuario] || 'Sin asignar');
      var duracion = Number(data[i][colDuracion]) || 0;
      
      if (!resumen[usuario]) {
        resumen[usuario] = {
          usuario: usuario,
          totalPickings: 0,
          tiempoTotalMin: 0,
          tiempoPromedioMin: 0
        };
      }
      
      resumen[usuario].totalPickings++;
      resumen[usuario].tiempoTotalMin += duracion;
    }
    
    // Calcular promedios
    var resultado = [];
    for (var key in resumen) {
      var r = resumen[key];
      if (r.totalPickings > 0) {
        r.tiempoPromedioMin = Math.round(r.tiempoTotalMin / r.totalPickings);
      }
      resultado.push(r);
    }
    
    return { success: true, usuarios: resultado, total: resultado.length };
    
  } catch (e) {
    Logger.log('ERROR: ' + e.message);
    return { success: false, error: e.message };
  }
}
