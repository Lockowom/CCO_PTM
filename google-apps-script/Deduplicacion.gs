/**
 * Deduplicacion.gs - Funciones para evitar duplicados en N.V DIARIAS
 * 
 * La clave única es: N.Venta (Col B) + Cod.Producto (Col I)
 * Esto significa que una misma N.V puede tener múltiples productos,
 * pero no puede tener el mismo producto dos veces.
 * 
 * INSTRUCCIONES:
 * 1. Para ejecutar manualmente: Ejecutar función "eliminarDuplicadosNVDiarias"
 * 2. Para configurar trigger automático: Ejecutar función "configurarTriggerDeduplicacion"
 */

var HOJA_NV_DIARIAS = 'N.V DIARIAS';

// Columnas de N.V DIARIAS (0-indexed)
var COL_NV = {
  FECHA_ENTREGA: 0,    // A
  N_VENTA: 1,          // B - Parte de la clave única
  ESTADO: 2,           // C
  COD_CLIENTE: 3,      // D
  CLIENTE: 4,          // E
  COD_VENDEDOR: 5,     // F
  VENDEDOR: 6,         // G
  ZONA: 7,             // H
  COD_PRODUCTO: 8,     // I - Parte de la clave única
  DESCRIPCION: 9,      // J
  UNIDAD_MEDIDA: 10,   // K
  PEDIDO: 11           // L
};

/**
 * FUNCIÓN PRINCIPAL - Elimina duplicados de N.V DIARIAS
 * Mantiene la PRIMERA ocurrencia de cada combinación N.Venta + Cod.Producto
 * @returns {Object} - {success, eliminados, mensaje}
 */
function eliminarDuplicadosNVDiarias() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(HOJA_NV_DIARIAS);
    
    if (!sheet) {
      Logger.log('ERROR: Hoja N.V DIARIAS no encontrada');
      return { success: false, error: 'Hoja N.V DIARIAS no encontrada' };
    }
    
    var lastRow = sheet.getLastRow();
    var lastCol = sheet.getLastColumn();
    
    if (lastRow <= 1) {
      Logger.log('Hoja vacía, nada que procesar');
      return { success: true, eliminados: 0, mensaje: 'Hoja vacía' };
    }
    
    Logger.log('=== INICIANDO DEDUPLICACIÓN ===');
    Logger.log('Total filas antes: ' + (lastRow - 1));
    
    // Leer todos los datos (sin header)
    var data = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
    
    var clavesVistas = {};
    var filasAEliminar = [];
    var duplicadosEncontrados = 0;
    
    // Recorrer de arriba hacia abajo, marcando duplicados
    for (var i = 0; i < data.length; i++) {
      var nVenta = String(data[i][COL_NV.N_VENTA] || '').trim();
      var codProducto = String(data[i][COL_NV.COD_PRODUCTO] || '').trim();
      
      // Crear clave única
      var clave = nVenta + '|' + codProducto;
      
      if (!nVenta || !codProducto) {
        // Si falta N.Venta o Cod.Producto, mantener la fila (podría ser un error de datos)
        continue;
      }
      
      if (clavesVistas[clave]) {
        // Es un duplicado - marcar para eliminar
        filasAEliminar.push(i + 2); // +2 porque empezamos en fila 2
        duplicadosEncontrados++;
        Logger.log('Duplicado encontrado en fila ' + (i + 2) + ': ' + clave);
      } else {
        // Primera ocurrencia - guardar
        clavesVistas[clave] = true;
      }
    }
    
    Logger.log('Duplicados encontrados: ' + duplicadosEncontrados);
    
    // Eliminar filas de abajo hacia arriba (para no afectar los índices)
    if (filasAEliminar.length > 0) {
      filasAEliminar.sort(function(a, b) { return b - a; }); // Ordenar descendente
      
      for (var j = 0; j < filasAEliminar.length; j++) {
        sheet.deleteRow(filasAEliminar[j]);
      }
      
      SpreadsheetApp.flush();
      Logger.log('Eliminadas ' + filasAEliminar.length + ' filas duplicadas');
    }
    
    var filasFinales = sheet.getLastRow() - 1;
    Logger.log('Total filas después: ' + filasFinales);
    Logger.log('=== DEDUPLICACIÓN COMPLETADA ===');
    
    return {
      success: true,
      eliminados: duplicadosEncontrados,
      filasAntes: lastRow - 1,
      filasDespues: filasFinales,
      mensaje: 'Se eliminaron ' + duplicadosEncontrados + ' duplicados'
    };
    
  } catch (e) {
    Logger.log('ERROR en eliminarDuplicadosNVDiarias: ' + e.message);
    return { success: false, error: e.message };
  }
}

/**
 * Verifica si hay duplicados sin eliminarlos (solo diagnóstico)
 * @returns {Object} - {success, duplicados, detalle}
 */
function verificarDuplicadosNVDiarias() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(HOJA_NV_DIARIAS);
    
    if (!sheet) {
      return { success: false, error: 'Hoja N.V DIARIAS no encontrada' };
    }
    
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      return { success: true, duplicados: 0, mensaje: 'Hoja vacía' };
    }
    
    var data = sheet.getRange(2, 1, lastRow - 1, 12).getValues();
    var clavesVistas = {};
    var duplicados = [];
    
    for (var i = 0; i < data.length; i++) {
      var nVenta = String(data[i][COL_NV.N_VENTA] || '').trim();
      var codProducto = String(data[i][COL_NV.COD_PRODUCTO] || '').trim();
      var clave = nVenta + '|' + codProducto;
      
      if (!nVenta || !codProducto) continue;
      
      if (clavesVistas[clave]) {
        duplicados.push({
          fila: i + 2,
          nVenta: nVenta,
          codProducto: codProducto,
          descripcion: String(data[i][COL_NV.DESCRIPCION] || '')
        });
      } else {
        clavesVistas[clave] = i + 2; // Guardar fila de primera ocurrencia
      }
    }
    
    Logger.log('Verificación completada. Duplicados encontrados: ' + duplicados.length);
    
    return {
      success: true,
      duplicados: duplicados.length,
      detalle: duplicados,
      mensaje: duplicados.length > 0 ? 
        'Se encontraron ' + duplicados.length + ' duplicados' : 
        'No hay duplicados'
    };
    
  } catch (e) {
    Logger.log('ERROR en verificarDuplicadosNVDiarias: ' + e.message);
    return { success: false, error: e.message };
  }
}

/**
 * Trigger que se ejecuta cuando se edita la hoja
 * Solo procesa si se editó N.V DIARIAS y se pegaron múltiples filas
 * @param {Object} e - Evento de edición
 */
function onEditDeduplicacion(e) {
  try {
    if (!e || !e.range) return;
    
    var sheet = e.range.getSheet();
    var sheetName = sheet.getName();
    
    // Solo procesar si es la hoja N.V DIARIAS
    if (sheetName !== HOJA_NV_DIARIAS) return;
    
    // Solo procesar si se editaron múltiples filas (pegado)
    var numRows = e.range.getNumRows();
    if (numRows < 2) return; // Si es solo 1 fila, no verificar
    
    Logger.log('Detectado pegado de ' + numRows + ' filas en N.V DIARIAS');
    
    // Esperar un momento para que se complete el pegado
    Utilities.sleep(500);
    
    // Ejecutar deduplicación
    var resultado = eliminarDuplicadosNVDiarias();
    
    if (resultado.eliminados > 0) {
      Logger.log('Deduplicación automática: ' + resultado.eliminados + ' duplicados eliminados');
    }
    
  } catch (e) {
    Logger.log('Error en onEditDeduplicacion: ' + e.message);
  }
}

/**
 * Configura el trigger automático para deduplicación
 * Ejecutar esta función UNA VEZ desde el editor de Apps Script
 */
function configurarTriggerDeduplicacion() {
  // Eliminar triggers existentes de esta función
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'onEditDeduplicacion') {
      ScriptApp.deleteTrigger(triggers[i]);
      Logger.log('Trigger anterior eliminado');
    }
  }
  
  // Crear nuevo trigger
  ScriptApp.newTrigger('onEditDeduplicacion')
    .forSpreadsheet(SpreadsheetApp.getActiveSpreadsheet())
    .onEdit()
    .create();
  
  Logger.log('Trigger de deduplicación configurado correctamente');
  return { success: true, mensaje: 'Trigger configurado. La deduplicación se ejecutará automáticamente al pegar datos.' };
}

/**
 * Elimina el trigger de deduplicación automática
 */
function eliminarTriggerDeduplicacion() {
  var triggers = ScriptApp.getProjectTriggers();
  var eliminados = 0;
  
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'onEditDeduplicacion') {
      ScriptApp.deleteTrigger(triggers[i]);
      eliminados++;
    }
  }
  
  Logger.log('Triggers eliminados: ' + eliminados);
  return { success: true, eliminados: eliminados };
}

/**
 * Importa datos nuevos a N.V DIARIAS evitando duplicados
 * Útil para importar desde otra hoja o fuente
 * @param {Array} datosNuevos - Array de arrays con los datos a importar
 * @returns {Object} - {success, agregados, duplicadosIgnorados}
 */
function importarSinDuplicados(datosNuevos) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(HOJA_NV_DIARIAS);
    
    if (!sheet) {
      return { success: false, error: 'Hoja N.V DIARIAS no encontrada' };
    }
    
    // Obtener claves existentes
    var lastRow = sheet.getLastRow();
    var clavesExistentes = {};
    
    if (lastRow > 1) {
      var dataExistente = sheet.getRange(2, 1, lastRow - 1, 12).getValues();
      for (var i = 0; i < dataExistente.length; i++) {
        var nVenta = String(dataExistente[i][COL_NV.N_VENTA] || '').trim();
        var codProducto = String(dataExistente[i][COL_NV.COD_PRODUCTO] || '').trim();
        if (nVenta && codProducto) {
          clavesExistentes[nVenta + '|' + codProducto] = true;
        }
      }
    }
    
    // Filtrar datos nuevos que no sean duplicados
    var datosAAgregar = [];
    var duplicadosIgnorados = 0;
    
    for (var j = 0; j < datosNuevos.length; j++) {
      var fila = datosNuevos[j];
      var nVenta = String(fila[COL_NV.N_VENTA] || '').trim();
      var codProducto = String(fila[COL_NV.COD_PRODUCTO] || '').trim();
      var clave = nVenta + '|' + codProducto;
      
      if (!nVenta || !codProducto) {
        // Fila incompleta, ignorar
        continue;
      }
      
      if (clavesExistentes[clave]) {
        duplicadosIgnorados++;
        Logger.log('Duplicado ignorado: ' + clave);
      } else {
        datosAAgregar.push(fila);
        clavesExistentes[clave] = true; // Marcar como existente para evitar duplicados dentro de los nuevos datos
      }
    }
    
    // Agregar datos nuevos
    if (datosAAgregar.length > 0) {
      var nuevaFila = sheet.getLastRow() + 1;
      sheet.getRange(nuevaFila, 1, datosAAgregar.length, datosAAgregar[0].length).setValues(datosAAgregar);
      SpreadsheetApp.flush();
    }
    
    Logger.log('Importación completada. Agregados: ' + datosAAgregar.length + ', Duplicados ignorados: ' + duplicadosIgnorados);
    
    return {
      success: true,
      agregados: datosAAgregar.length,
      duplicadosIgnorados: duplicadosIgnorados,
      mensaje: 'Se agregaron ' + datosAAgregar.length + ' filas. ' + duplicadosIgnorados + ' duplicados ignorados.'
    };
    
  } catch (e) {
    Logger.log('ERROR en importarSinDuplicados: ' + e.message);
    return { success: false, error: e.message };
  }
}

/**
 * Menú personalizado para ejecutar funciones de deduplicación
 * Se agrega automáticamente al abrir el spreadsheet
 */
// NOTA: onOpen renombrado para evitar conflicto con Setup.gs
// Llamar desde onOpen() principal si se necesita este menu
function onOpenDeduplicacion() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Herramientas NV')
    .addItem('Verificar Duplicados', 'menuVerificarDuplicados')
    .addItem('Eliminar Duplicados', 'menuEliminarDuplicados')
    .addSeparator()
    .addItem('Configurar Auto-Deduplicacion', 'configurarTriggerDeduplicacion')
    .addItem('Desactivar Auto-Deduplicacion', 'eliminarTriggerDeduplicacion')
    .addToUi();
}

function menuVerificarDuplicados() {
  var resultado = verificarDuplicadosNVDiarias();
  var ui = SpreadsheetApp.getUi();
  
  if (resultado.success) {
    if (resultado.duplicados > 0) {
      ui.alert('Duplicados Encontrados', 
        'Se encontraron ' + resultado.duplicados + ' filas duplicadas.\n\n' +
        'Use "Eliminar Duplicados" para limpiarlos.',
        ui.ButtonSet.OK);
    } else {
      ui.alert('Sin Duplicados', 'No se encontraron duplicados en N.V DIARIAS.', ui.ButtonSet.OK);
    }
  } else {
    ui.alert('Error', resultado.error, ui.ButtonSet.OK);
  }
}

function menuEliminarDuplicados() {
  var ui = SpreadsheetApp.getUi();
  var respuesta = ui.alert('Confirmar', 
    '¿Está seguro de eliminar los duplicados?\n\nSe mantendrá la primera ocurrencia de cada N.Venta + Producto.',
    ui.ButtonSet.YES_NO);
  
  if (respuesta === ui.Button.YES) {
    var resultado = eliminarDuplicadosNVDiarias();
    if (resultado.success) {
      ui.alert('Completado', 
        'Se eliminaron ' + resultado.eliminados + ' duplicados.\n' +
        'Filas antes: ' + resultado.filasAntes + '\n' +
        'Filas después: ' + resultado.filasDespues,
        ui.ButtonSet.OK);
    } else {
      ui.alert('Error', resultado.error, ui.ButtonSet.OK);
    }
  }
}
