/**
 * FlowManager.gs
 * Gestiona el flujo de datos entre hojas: N.V DIARIAS → PICKING → PACKING → SHIPPING
 * 
 * Funcionalidades:
 * - Migrar datos de N.V DIARIAS a PICKING
 * - Migrar datos de PICKING a PACKING (y borrar de PICKING)
 * - Migrar datos de PACKING a SHIPPING (y borrar de PACKING)
 * - Actualizar estados en N.V DIARIAS
 */

// ==================== CONFIGURACIÓN ====================

var SHEET_NV_DIARIAS = 'N.V DIARIAS';
var SHEET_PICKING = 'PICKING';
var SHEET_PACKING = 'PACKING';
var SHEET_SHIPPING = 'SHIPPING';

// ==================== MIGRAR DE N.V DIARIAS A PICKING ====================

/**
 * Copia datos de N.V DIARIAS a PICKING cuando el estado cambia a PENDIENTE PICKING
 * @param {string} notaVenta - Número de nota de venta
 * @returns {Object} - {success, mensaje}
 */
function migrarNVDiariasAPicking(notaVenta) {
  try {
    Logger.log('=== migrarNVDiariasAPicking: ' + notaVenta + ' ===');
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheetNV = ss.getSheetByName(SHEET_NV_DIARIAS);
    var sheetPicking = ss.getSheetByName(SHEET_PICKING);
    
    if (!sheetNV) {
      return { success: false, error: 'Hoja N.V DIARIAS no encontrada' };
    }
    
    if (!sheetPicking) {
      return { success: false, error: 'Hoja PICKING no encontrada' };
    }
    
    // Buscar todas las filas de esta N.V en N.V DIARIAS
    var dataNV = sheetNV.getDataRange().getValues();
    var filasACopiar = [];
    
    for (var i = 1; i < dataNV.length; i++) {
      var nvFila = String(dataNV[i][1] || '').trim();
      if (nvFila === notaVenta) {
        filasACopiar.push(dataNV[i]);
      }
    }
    
    if (filasACopiar.length === 0) {
      return { success: false, error: 'No se encontraron productos para esta N.V' };
    }
    
    // Verificar si ya existe en PICKING
    var dataPicking = sheetPicking.getDataRange().getValues();
    var yaExiste = false;
    
    for (var j = 1; j < dataPicking.length; j++) {
      var nvPicking = String(dataPicking[j][1] || '').trim();
      if (nvPicking === notaVenta) {
        yaExiste = true;
        break;
      }
    }
    
    if (yaExiste) {
      Logger.log('N.V ya existe en PICKING, no se copia de nuevo');
      return { success: true, mensaje: 'N.V ya existe en PICKING' };
    }
    
    // Copiar filas a PICKING
    var lastRowPicking = sheetPicking.getLastRow();
    sheetPicking.getRange(lastRowPicking + 1, 1, filasACopiar.length, filasACopiar[0].length)
      .setValues(filasACopiar);
    
    SpreadsheetApp.flush();
    
    Logger.log('Copiadas ' + filasACopiar.length + ' filas a PICKING');
    
    return {
      success: true,
      mensaje: 'N.V copiada a PICKING exitosamente',
      filasCopiadas: filasACopiar.length
    };
    
  } catch (e) {
    Logger.log('Error en migrarNVDiariasAPicking: ' + e.message);
    return { success: false, error: e.message };
  }
}

// ==================== MIGRAR DE PICKING A PACKING ====================

/**
 * Migra datos de PICKING a PACKING y BORRA de PICKING
 * @param {string} notaVenta - Número de nota de venta
 * @returns {Object} - {success, mensaje}
 */
function migrarPickingAPacking(notaVenta) {
  try {
    Logger.log('=== migrarPickingAPacking: ' + notaVenta + ' ===');
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheetPicking = ss.getSheetByName(SHEET_PICKING);
    var sheetPacking = ss.getSheetByName(SHEET_PACKING);
    var sheetNV = ss.getSheetByName(SHEET_NV_DIARIAS);
    
    if (!sheetPicking) {
      return { success: false, error: 'Hoja PICKING no encontrada' };
    }
    
    if (!sheetPacking) {
      return { success: false, error: 'Hoja PACKING no encontrada' };
    }
    
    // 1. Buscar todas las filas de esta N.V en PICKING
    var dataPicking = sheetPicking.getDataRange().getValues();
    var filasACopiar = [];
    var filasABorrar = [];
    
    for (var i = 1; i < dataPicking.length; i++) {
      var nvFila = String(dataPicking[i][1] || '').trim();
      if (nvFila === notaVenta) {
        filasACopiar.push(dataPicking[i]);
        filasABorrar.push(i + 1); // +1 porque las filas empiezan en 1
      }
    }
    
    if (filasACopiar.length === 0) {
      return { success: false, error: 'No se encontró la N.V en PICKING' };
    }
    
    // 2. Copiar a PACKING
    var lastRowPacking = sheetPacking.getLastRow();
    sheetPacking.getRange(lastRowPacking + 1, 1, filasACopiar.length, filasACopiar[0].length)
      .setValues(filasACopiar);
    
    Logger.log('Copiadas ' + filasACopiar.length + ' filas a PACKING');
    
    // 3. BORRAR de PICKING (de abajo hacia arriba para no afectar índices)
    for (var j = filasABorrar.length - 1; j >= 0; j--) {
      sheetPicking.deleteRow(filasABorrar[j]);
    }
    
    Logger.log('Borradas ' + filasABorrar.length + ' filas de PICKING');
    
    // 4. Actualizar estado en N.V DIARIAS
    if (sheetNV) {
      actualizarEstadoNVDiarias(notaVenta, 'PENDIENTE PACKING');
    }
    
    SpreadsheetApp.flush();
    
    return {
      success: true,
      mensaje: 'N.V migrada a PACKING y borrada de PICKING',
      filasMigradas: filasACopiar.length
    };
    
  } catch (e) {
    Logger.log('Error en migrarPickingAPacking: ' + e.message);
    return { success: false, error: e.message };
  }
}

// ==================== MIGRAR DE PACKING A SHIPPING ====================

/**
 * Migra datos de PACKING a SHIPPING y BORRA de PACKING
 * @param {string} notaVenta - Número de nota de venta
 * @returns {Object} - {success, mensaje}
 */
function migrarPackingAShipping(notaVenta) {
  try {
    Logger.log('=== migrarPackingAShipping: ' + notaVenta + ' ===');
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheetPacking = ss.getSheetByName(SHEET_PACKING);
    var sheetShipping = ss.getSheetByName(SHEET_SHIPPING);
    var sheetNV = ss.getSheetByName(SHEET_NV_DIARIAS);
    
    if (!sheetPacking) {
      return { success: false, error: 'Hoja PACKING no encontrada' };
    }
    
    if (!sheetShipping) {
      return { success: false, error: 'Hoja SHIPPING no encontrada' };
    }
    
    // 1. Buscar todas las filas de esta N.V en PACKING
    var dataPacking = sheetPacking.getDataRange().getValues();
    var filasACopiar = [];
    var filasABorrar = [];
    
    for (var i = 1; i < dataPacking.length; i++) {
      var nvFila = String(dataPacking[i][1] || '').trim();
      if (nvFila === notaVenta) {
        filasACopiar.push(dataPacking[i]);
        filasABorrar.push(i + 1);
      }
    }
    
    if (filasACopiar.length === 0) {
      return { success: false, error: 'No se encontró la N.V en PACKING' };
    }
    
    // 2. Copiar a SHIPPING
    var lastRowShipping = sheetShipping.getLastRow();
    sheetShipping.getRange(lastRowShipping + 1, 1, filasACopiar.length, filasACopiar[0].length)
      .setValues(filasACopiar);
    
    Logger.log('Copiadas ' + filasACopiar.length + ' filas a SHIPPING');
    
    // 3. BORRAR de PACKING
    for (var j = filasABorrar.length - 1; j >= 0; j--) {
      sheetPacking.deleteRow(filasABorrar[j]);
    }
    
    Logger.log('Borradas ' + filasABorrar.length + ' filas de PACKING');
    
    // 4. Actualizar estado en N.V DIARIAS
    if (sheetNV) {
      actualizarEstadoNVDiarias(notaVenta, 'DESPACHADO');
    }
    
    SpreadsheetApp.flush();
    
    return {
      success: true,
      mensaje: 'N.V migrada a SHIPPING y borrada de PACKING',
      filasMigradas: filasACopiar.length
    };
    
  } catch (e) {
    Logger.log('Error en migrarPackingAShipping: ' + e.message);
    return { success: false, error: e.message };
  }
}

// ==================== ACTUALIZAR ESTADO EN N.V DIARIAS ====================

/**
 * Actualiza el estado de una N.V en N.V DIARIAS
 * @param {string} notaVenta - Número de nota de venta
 * @param {string} nuevoEstado - Nuevo estado
 * @returns {Object} - {success}
 */
function actualizarEstadoNVDiarias(notaVenta, nuevoEstado) {
  try {
    Logger.log('=== actualizarEstadoNVDiarias: ' + notaVenta + ' → ' + nuevoEstado + ' ===');
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NV_DIARIAS);
    
    if (!sheet) {
      return { success: false, error: 'Hoja N.V DIARIAS no encontrada' };
    }
    
    var data = sheet.getDataRange().getValues();
    var filasActualizadas = 0;
    
    for (var i = 1; i < data.length; i++) {
      var nvFila = String(data[i][1] || '').trim();
      if (nvFila === notaVenta) {
        sheet.getRange(i + 1, 3).setValue(nuevoEstado); // Columna C = Estado
        filasActualizadas++;
      }
    }
    
    SpreadsheetApp.flush();
    
    Logger.log('Actualizadas ' + filasActualizadas + ' filas en N.V DIARIAS');
    
    return {
      success: true,
      filasActualizadas: filasActualizadas
    };
    
  } catch (e) {
    Logger.log('Error en actualizarEstadoNVDiarias: ' + e.message);
    return { success: false, error: e.message };
  }
}

// ==================== VOLVER A PENDIENTE PICKING ====================

/**
 * Vuelve una N.V a estado PENDIENTE PICKING (para faltantes)
 * @param {string} notaVenta - Número de nota de venta
 * @param {string} motivo - Motivo (FALTANTE PROD BIG TICKET o FALTANTE PROD MINI TICKET)
 * @returns {Object} - {success}
 */
function volverAPendientePicking(notaVenta, motivo) {
  try {
    Logger.log('=== volverAPendientePicking: ' + notaVenta + ' - ' + motivo + ' ===');
    
    var nuevoEstado = 'PENDIENTE PICKING - ' + motivo;
    var result = actualizarEstadoNVDiarias(notaVenta, nuevoEstado);
    
    if (result.success) {
      // Registrar en log
      registrarCambioEstadoFlow(notaVenta, 'PICKING', nuevoEstado, motivo);
    }
    
    return result;
    
  } catch (e) {
    Logger.log('Error en volverAPendientePicking: ' + e.message);
    return { success: false, error: e.message };
  }
}

// ==================== COMPLETAR PICKING ====================

/**
 * Completa el picking de una N.V
 * Cambia el estado a PK (Packing) en N.V DIARIAS
 * El módulo de Packing lee desde N.V DIARIAS las órdenes con estado PK/Packing
 * @param {string} notaVenta - Número de nota de venta
 * @param {string} usuario - Usuario que completa
 * @returns {Object} - {success}
 */
function completarPicking(notaVenta, usuario) {
  try {
    Logger.log('=== completarPicking: ' + notaVenta + ' por ' + usuario + ' ===');
    
    if (!notaVenta || String(notaVenta).trim() === '') {
      return { success: false, error: 'Número de N.V requerido' };
    }
    
    // Usar StateManager para cambiar el estado correctamente
    // Esto actualiza N.V DIARIAS con el valor mapeado (PK -> "Packing")
    var resultado = cambiarEstadoNV(String(notaVenta).trim(), 'PK', usuario || 'Sistema');
    
    if (!resultado.success) {
      Logger.log('Error al cambiar estado: ' + resultado.error);
      return resultado;
    }
    
    Logger.log('Estado cambiado a PK/Packing para N.V: ' + notaVenta + ' (' + resultado.filasActualizadas + ' filas)');
    
    // Registrar en log de estados
    registrarCambioEstadoFlow(notaVenta, resultado.estadoAnterior, 'PK', usuario);
    
    return {
      success: true,
      mensaje: 'Picking completado. N.V lista para Packing.',
      notaVenta: notaVenta,
      nuevoEstado: 'PK',
      filasActualizadas: resultado.filasActualizadas
    };
    
  } catch (e) {
    Logger.log('Error en completarPicking: ' + e.message);
    return { success: false, error: 'Error al completar picking: ' + e.message };
  }
}

// ==================== REGISTRAR CAMBIO DE ESTADO ====================

/**
 * Registra un cambio de estado en el log
 */
// NOTA: Renombrada para evitar conflicto con StateManager.gs
function registrarCambioEstadoFlow(notaVenta, estadoAnterior, estadoNuevo, usuario) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('ESTADO_LOG');
    
    if (!sheet) {
      sheet = ss.insertSheet('ESTADO_LOG');
      sheet.appendRow(['ID', 'FechaHora', 'NotaVenta', 'EstadoAnterior', 'EstadoNuevo', 'Usuario']);
      sheet.getRange(1, 1, 1, 6).setBackground('#2d3748').setFontColor('white').setFontWeight('bold');
      sheet.setFrozenRows(1);
    }
    
    var id = 'EST-' + new Date().getTime();
    sheet.appendRow([
      id,
      new Date(),
      notaVenta,
      estadoAnterior,
      estadoNuevo,
      usuario || 'Sistema'
    ]);
    
  } catch (e) {
    Logger.log('Error al registrar cambio de estado: ' + e.message);
  }
}

// ==================== FUNCIONES DE COMPATIBILIDAD ====================

/**
 * Alias para compatibilidad
 */
// NOTA: Renombrada - StateManager.gs tiene moverPickingAPacking()
function moverPickingAPackingFlow(notaVenta) {
  return migrarPickingAPacking(notaVenta);
}

function moverPackingAShipping(notaVenta) {
  return migrarPackingAShipping(notaVenta);
}
