/**
 * ============================================================
 * FORMATO AUTOMÁTICO Y MANEJO DE DUPLICADOS
 * 
 * 1. Columna I siempre en formato TEXTO SIN FORMATO
 * 2. Manejo de duplicados con análisis de cambio de estado
 * ============================================================
 */

/**
 * Trigger onEdit para aplicar formato automático a columna I
 * Instalar con: Triggers > Add Trigger > onEditFormatoColumnaI > On Edit
 */
function onEditFormatoColumnaI(e) {
  try {
    if (!e || !e.range) return;
    
    var sheet = e.range.getSheet();
    var sheetName = sheet.getName();
    
    // Solo aplicar a hojas específicas
    var hojasObjetivo = ['N.V DIARIAS', 'PICKING', 'PACKING'];
    if (hojasObjetivo.indexOf(sheetName) === -1) return;
    
    var col = e.range.getColumn();
    var row = e.range.getRow();
    
    // Si se edita la columna I (9) o cualquier dato, formatear columna I
    if (col === 9 && row > 1) {
      // Formatear la celda editada como texto
      var cell = sheet.getRange(row, 9);
      var valor = cell.getValue();
      if (valor !== '' && valor !== null) {
        cell.setNumberFormat('@'); // Formato texto
      }
    }
    
    // Si se pega un rango, formatear toda la columna I del rango
    if (e.range.getNumRows() > 1 || e.range.getNumColumns() > 1) {
      var startRow = e.range.getRow();
      var numRows = e.range.getNumRows();
      
      if (startRow > 1 && numRows > 0) {
        var rangeI = sheet.getRange(startRow, 9, numRows, 1);
        rangeI.setNumberFormat('@');
      }
    }
    
  } catch (error) {
    Logger.log('Error en onEditFormatoColumnaI: ' + error.message);
  }
}

/**
 * Trigger onChange para detectar cuando se pegan datos nuevos
 * Instalar con: Triggers > Add Trigger > onChangeNVDiarias > On Change
 */
function onChangeNVDiarias(e) {
  try {
    if (!e || e.changeType !== 'EDIT') return;
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getActiveSheet();
    
    if (sheet.getName() !== 'N.V DIARIAS') return;
    
    // Aplicar formato a columna I
    aplicarFormatoTextoColumnaI(sheet);
    
    // Procesar duplicados
    procesarDuplicadosConEstado();
    
  } catch (error) {
    Logger.log('Error en onChangeNVDiarias: ' + error.message);
  }
}

/**
 * Aplica formato TEXTO a la columna I de una hoja
 */
function aplicarFormatoTextoColumnaI(sheet) {
  if (!sheet) return;
  
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return;
  
  var rangeI = sheet.getRange(2, 9, lastRow - 1, 1);
  rangeI.setNumberFormat('@');
  
  Logger.log('✅ Formato TEXTO aplicado a columna I de ' + sheet.getName());
}

/**
 * Inicializa el formato de columna I en todas las hojas objetivo
 * Ejecutar manualmente una vez
 */
function inicializarFormatoColumnaI() {
  Logger.log('=== INICIALIZAR FORMATO COLUMNA I ===');
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hojas = ['N.V DIARIAS', 'PICKING', 'PACKING'];
  
  for (var i = 0; i < hojas.length; i++) {
    var sheet = ss.getSheetByName(hojas[i]);
    if (sheet) {
      aplicarFormatoTextoColumnaI(sheet);
      Logger.log('✅ ' + hojas[i] + ' - Columna I formateada');
    } else {
      Logger.log('⚠️ Hoja ' + hojas[i] + ' no encontrada');
    }
  }
  
  Logger.log('=== FORMATO APLICADO ===');
}

/**
 * ============================================================
 * MANEJO DE DUPLICADOS CON ANÁLISIS DE ESTADO
 * ============================================================
 */

/**
 * Procesa duplicados en N.V DIARIAS analizando cambios de estado
 * - Si el estado cambió de PENDIENTE a APROBADAS: actualiza el original y elimina duplicado
 * - Si no cambió: solo elimina duplicado
 */
function procesarDuplicadosConEstado() {
  Logger.log('=== PROCESANDO DUPLICADOS CON ANÁLISIS DE ESTADO ===');
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('N.V DIARIAS');
  
  if (!sheet) {
    Logger.log('❌ Hoja N.V DIARIAS no encontrada');
    return;
  }
  
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    Logger.log('Hoja vacía, nada que procesar');
    return;
  }
  
  // Leer todos los datos (B = N.Venta, C = Estado)
  var data = sheet.getRange(2, 1, lastRow - 1, 12).getValues();
  
  // Mapa para rastrear N.V vistas: { nVenta: { filaOriginal, estadoOriginal } }
  var nvMapa = {};
  var filasAEliminar = [];
  var actualizaciones = [];
  
  // Primera pasada: identificar duplicados y cambios de estado
  for (var i = 0; i < data.length; i++) {
    var nVenta = String(data[i][1] || '').trim(); // Columna B
    var estado = String(data[i][2] || '').trim().toUpperCase(); // Columna C
    var filaReal = i + 2; // Fila real en la hoja (1-indexed, con header)
    
    if (!nVenta) continue;
    
    if (!nvMapa[nVenta]) {
      // Primera aparición de esta N.V
      nvMapa[nVenta] = {
        filaOriginal: filaReal,
        estadoOriginal: estado,
        indice: i
      };
    } else {
      // Duplicado encontrado
      var original = nvMapa[nVenta];
      Logger.log('🔄 Duplicado encontrado: N.V ' + nVenta);
      Logger.log('   Original (fila ' + original.filaOriginal + '): ' + original.estadoOriginal);
      Logger.log('   Duplicado (fila ' + filaReal + '): ' + estado);
      
      // Normalizar estados para comparación
      var estadoOrigNorm = normalizarEstadoParaDuplicados(original.estadoOriginal);
      var estadoNuevoNorm = normalizarEstadoParaDuplicados(estado);
      
      // Verificar si hay cambio de estado relevante
      if (estadoOrigNorm === 'PENDIENTE' && estadoNuevoNorm === 'APROBADO') {
        // El estado cambió de PENDIENTE a APROBADO
        Logger.log('   ✅ Cambio de estado detectado: PENDIENTE → APROBADO');
        actualizaciones.push({
          fila: original.filaOriginal,
          nuevoEstado: estado // Usar el estado exacto del duplicado
        });
        filasAEliminar.push(filaReal);
      } else if (estadoNuevoNorm === 'APROBADO' && estadoOrigNorm !== 'APROBADO') {
        // Cualquier otro cambio a APROBADO
        Logger.log('   ✅ Cambio a APROBADO detectado');
        actualizaciones.push({
          fila: original.filaOriginal,
          nuevoEstado: estado
        });
        filasAEliminar.push(filaReal);
      } else {
        // No hay cambio relevante, solo eliminar duplicado
        Logger.log('   ⚠️ Sin cambio relevante, eliminando duplicado');
        filasAEliminar.push(filaReal);
      }
    }
  }
  
  // Segunda pasada: aplicar actualizaciones de estado
  for (var j = 0; j < actualizaciones.length; j++) {
    var upd = actualizaciones[j];
    sheet.getRange(upd.fila, 3).setValue(upd.nuevoEstado); // Columna C
    Logger.log('✅ Actualizado estado en fila ' + upd.fila + ' a: ' + upd.nuevoEstado);
  }
  
  // Tercera pasada: eliminar filas duplicadas (de abajo hacia arriba para no afectar índices)
  filasAEliminar.sort(function(a, b) { return b - a; }); // Ordenar descendente
  
  for (var k = 0; k < filasAEliminar.length; k++) {
    sheet.deleteRow(filasAEliminar[k]);
    Logger.log('🗑️ Eliminada fila duplicada: ' + filasAEliminar[k]);
  }
  
  SpreadsheetApp.flush();
  
  Logger.log('=== PROCESAMIENTO COMPLETADO ===');
  Logger.log('Actualizaciones: ' + actualizaciones.length);
  Logger.log('Duplicados eliminados: ' + filasAEliminar.length);
  
  return {
    actualizaciones: actualizaciones.length,
    eliminados: filasAEliminar.length
  };
}

/**
 * Normaliza el estado para comparación de duplicados
 */
function normalizarEstadoParaDuplicados(estado) {
  var est = String(estado || '').trim().toUpperCase();
  
  // Normalizar variantes de PENDIENTE
  if (est.indexOf('PENDIENTE') !== -1) {
    return 'PENDIENTE';
  }
  
  // Normalizar variantes de APROBADO
  if (est.indexOf('APROBAD') !== -1 || est.indexOf('APROB') !== -1) {
    return 'APROBADO';
  }
  
  // Normalizar variantes de PICKING
  if (est.indexOf('PICKING') !== -1) {
    return 'PICKING';
  }
  
  // Normalizar variantes de PACKING
  if (est.indexOf('PACKING') !== -1) {
    return 'PACKING';
  }
  
  return est;
}

/**
 * Ejecutar manualmente para procesar duplicados actuales
 */
function ejecutarProcesamientoDuplicados() {
  var resultado = procesarDuplicadosConEstado();
  
  if (resultado) {
    SpreadsheetApp.getUi().alert(
      'Procesamiento Completado\n\n' +
      'Estados actualizados: ' + resultado.actualizaciones + '\n' +
      'Duplicados eliminados: ' + resultado.eliminados
    );
  }
}

/**
 * ============================================================
 * INSTALAR TRIGGERS AUTOMÁTICAMENTE
 * Ejecutar una vez para configurar los triggers
 * ============================================================
 */
function instalarTriggersAutomaticos() {
  Logger.log('=== INSTALANDO TRIGGERS AUTOMÁTICOS ===');
  
  // Eliminar triggers existentes para evitar duplicados
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    var funcName = triggers[i].getHandlerFunction();
    if (funcName === 'onEditFormatoColumnaI' || funcName === 'onChangeNVDiarias') {
      ScriptApp.deleteTrigger(triggers[i]);
      Logger.log('Trigger eliminado: ' + funcName);
    }
  }
  
  // Instalar trigger onEdit
  ScriptApp.newTrigger('onEditFormatoColumnaI')
    .forSpreadsheet(SpreadsheetApp.getActive())
    .onEdit()
    .create();
  Logger.log('✅ Trigger onEdit instalado');
  
  // Instalar trigger onChange
  ScriptApp.newTrigger('onChangeNVDiarias')
    .forSpreadsheet(SpreadsheetApp.getActive())
    .onChange()
    .create();
  Logger.log('✅ Trigger onChange instalado');
  
  Logger.log('=== TRIGGERS INSTALADOS ===');
  Logger.log('• onEdit: Formato automático columna I');
  Logger.log('• onChange: Procesamiento de duplicados');
  
  // Nota: No usar getUi() aquí porque puede ejecutarse sin contexto de UI
}

/**
 * Menú personalizado para ejecutar funciones manualmente
 */
// NOTA: onOpen renombrado para evitar conflicto con Setup.gs
// Llamar desde onOpen() principal si se necesita este menu
function onOpenFormatoAutomatico() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Herramientas Formato')
    .addItem('Aplicar formato columna I', 'inicializarFormatoColumnaI')
    .addItem('Procesar duplicados', 'ejecutarProcesamientoDuplicados')
    .addSeparator()
    .addItem('Instalar triggers automaticos', 'instalarTriggersAutomaticos')
    .addToUi();
}
