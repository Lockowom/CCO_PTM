/**
 * ============================================================
 * MIGRACION MANAGER
 * Sistema de migración automática entre hojas basado en estados
 * ============================================================
 */

// Nombres de hojas del sistema
var HOJA_MASTER = 'N.V DIARIAS';
var HOJA_PICKING = 'PICKING';
var HOJA_PACKING = 'PACKING';
var HOJA_DESPACHOS = 'DESPACHOS';
var HOJA_ENTREGAS = 'ENTREGAS';
var HOJA_OK = 'OK';

/**
 * Crea o verifica la hoja OK con la estructura correcta
 */
function crearOVerificarHojaOK() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(HOJA_OK);
    
    if (!sheet) {
      Logger.log('Creando hoja OK...');
      sheet = ss.insertSheet(HOJA_OK);
      
      // Headers
      sheet.appendRow([
        'Fecha Entrega',          // A (col 0)
        'N.Venta',                // B (col 1)
        'Estado',                 // C (col 2)
        'Cod.Cliente',            // D (col 3)
        'Nombre Cliente',         // E (col 4)
        'Cod.Vendedor',           // F (col 5)
        'Nombre Vendedor',        // G (col 6)
        'Zona',                   // H (col 7)
        'Cod.Producto',           // I (col 8)
        'Descripcion Producto',   // J (col 9)
        'Unidad Medida',          // K (col 10)
        'Pedido',                 // L (col 11)
        'Fecha Ingreso Picking',  // M (col 12)
        'Usuario Picking',        // N (col 13)
        'Fecha Ingreso Packing',  // O (col 14)
        'Usuario Packing',        // P (col 15)
        'Fecha Ingreso Despacho', // Q (col 16)
        'Usuario Despacho',       // R (col 17)
        'Fecha Entregado',        // S (col 18)
        'Usuario Entregado',      // T (col 19)
        'Estado Final',           // U (col 20)
        'Última Actualización',   // V (col 21)
        'FECHA Y HORA COMPLETADO' // W (col 22) - NUEVO para dashboard
      ]);
      
      // Formatear header
      var headerRange = sheet.getRange(1, 1, 1, 23);
      headerRange.setBackground('#1976d2');
      headerRange.setFontColor('white');
      headerRange.setFontWeight('bold');
      headerRange.setWrap(true);
      
      sheet.setFrozenRows(1);
      sheet.setColumnWidth(2, 80);  // N.Venta
      sheet.setColumnWidth(5, 200); // Nombre Cliente
      sheet.setColumnWidth(10, 200); // Descripcion Producto
      
      Logger.log('✅ Hoja OK creada exitosamente');
    } else {
      Logger.log('Hoja OK ya existe');
    }
    
    return { success: true, sheet: sheet };
    
  } catch (e) {
    Logger.log('ERROR creando hoja OK: ' + e.message);
    return { success: false, error: e.message };
  }
}

/**
 * Copia datos de N.V DIARIAS a una hoja destino
 * @param {string} nVenta - Número de N.V
 * @param {string} nombreHojaDestino - Nombre de la hoja destino
 * @param {string} usuario - Usuario que ejecuta la acción
 * @param {Object} metadata - Metadata adicional según la hoja
 * @returns {Object} - {success, filasCopiadas}
 */
function copiarNVAHoja(nVenta, nombreHojaDestino, usuario, metadata) {
  try {
    Logger.log('Copiando N.V ' + nVenta + ' a hoja ' + nombreHojaDestino);
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheetOrigen = ss.getSheetByName(HOJA_MASTER);
    var sheetDestino = ss.getSheetByName(nombreHojaDestino);
    
    if (!sheetOrigen) {
      return { success: false, error: 'Hoja N.V DIARIAS no encontrada' };
    }
    
    if (!sheetDestino) {
      // Crear hoja si no existe
      sheetDestino = ss.insertSheet(nombreHojaDestino);
      inicializarHojaTrabajo(sheetDestino, nombreHojaDestino);
    }
    
    // Leer datos de N.V DIARIAS
    var dataOrigen = sheetOrigen.getDataRange().getValues();
    var filasACopiar = [];
    var fechaHora = new Date();
    
    for (var i = 1; i < dataOrigen.length; i++) {
      var nvFila = String(dataOrigen[i][1] || '').trim();
      
      if (nvFila === nVenta) {
        var fila = [];
        
        // Copiar columnas A-L (datos estándar)
        for (var j = 0; j < 12; j++) {
          fila.push(dataOrigen[i][j]);
        }
        
        // Agregar metadata según hoja destino
        if (nombreHojaDestino === HOJA_OK) {
          // Para hoja OK, agregar todas las columnas de tracking
          fila.push(metadata.fechaPicking || '');
          fila.push(metadata.usuarioPicking || '');
          fila.push(metadata.fechaPacking || '');
          fila.push(metadata.usuarioPacking || '');
          fila.push(metadata.fechaDespacho || fechaHora);
          fila.push(metadata.usuarioDespacho || usuario);
          fila.push(''); // Fecha Entregado (se llena después)
          fila.push(''); // Usuario Entregado
          fila.push(dataOrigen[i][2]); // Estado Final
          fila.push(fechaHora); // Última Actualización
          fila.push(''); // FECHA Y HORA COMPLETADO (se llena al entregar)
        } else if (nombreHojaDestino === 'DESPACHOS') {
          // Para hoja DESPACHOS, agregar columnas extra para formulario
          fila.push(fechaHora); // Fecha Ingreso (col M)
          fila.push(usuario || 'Sistema'); // Usuario (col N)
          // Columnas manuales (vacías, se llenan con formulario)
          fila.push(''); // Facturas (col O)
          fila.push(''); // Guía (col P)
          fila.push(''); // Empresa Transporte (col Q)
          fila.push(''); // Transportista (col R)
          fila.push(''); // División (col S)
          fila.push(''); // Valor Flete (col T)
          fila.push(''); // N° Envío/OT (col U)
          // Columnas automáticas
          fila.push(''); // Fecha Despacho (col V) - se llena al generar
          fila.push(fechaHora); // Fecha Creación (col W)
          fila.push('PENDIENTE'); // Estado Despacho (col X)
        } else {
          // Para hojas de trabajo estándar, agregar fecha y usuario
          fila.push(fechaHora);
          fila.push(usuario || 'Sistema');
        }
        
        filasACopiar.push(fila);
      }
    }
    
    if (filasACopiar.length === 0) {
      Logger.log('N.V ' + nVenta + ' no encontrada en N.V DIARIAS');
      return { success: false, error: 'N.V no encontrada' };
    }
    
    // Verificar duplicados
    if (existeNVEnHoja(nVenta, nombreHojaDestino)) {
      Logger.log('N.V ' + nVenta + ' ya existe en ' + nombreHojaDestino);
      return { success: true, filasCopiadas: 0, yaExiste: true };
    }
    
    // Copiar a hoja destino
    var lastRow = sheetDestino.getLastRow();
    var numCols = filasACopiar[0].length;
    sheetDestino.getRange(lastRow + 1, 1, filasACopiar.length, numCols).setValues(filasACopiar);
    
    SpreadsheetApp.flush();
    Logger.log('✅ Copiadas ' + filasACopiar.length + ' filas a ' + nombreHojaDestino);
    
    return {
      success: true,
      filasCopiadas: filasACopiar.length
    };
    
  } catch (e) {
    Logger.log('ERROR en copiarNVAHoja: ' + e.message);
    return { success: false, error: e.message };
  }
}

/**
 * Elimina N.V de una hoja
 * @param {string} nVenta - Número de N.V
 * @param {string} nombreHoja - Nombre de la hoja
 * @returns {Object} - {success, filasEliminadas}
 */
function eliminarNVDeHoja(nVenta, nombreHoja) {
  try {
    Logger.log('Eliminando N.V ' + nVenta + ' de hoja ' + nombreHoja);
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(nombreHoja);
    
    if (!sheet) {
      Logger.log('Hoja ' + nombreHoja + ' no existe');
      return { success: true, filasEliminadas: 0 };
    }
    
    if (sheet.getLastRow() <= 1) {
      return { success: true, filasEliminadas: 0 };
    }
    
    var data = sheet.getDataRange().getValues();
    var filasAEliminar = [];
    
    // Buscar filas (de atrás hacia adelante)
    for (var i = data.length - 1; i >= 1; i--) {
      if (String(data[i][1] || '').trim() === nVenta) {
        filasAEliminar.push(i + 1); // +1 porque sheets usa 1-index
      }
    }
    
    // Eliminar filas
    for (var j = 0; j < filasAEliminar.length; j++) {
      sheet.deleteRow(filasAEliminar[j]);
    }
    
    if (filasAEliminar.length > 0) {
      SpreadsheetApp.flush();
      Logger.log('✅ Eliminadas ' + filasAEliminar.length + ' filas de ' + nombreHoja);
    }
    
    return {
      success: true,
      filasEliminadas: filasAEliminar.length
    };
    
  } catch (e) {
    Logger.log('ERROR en eliminarNVDeHoja: ' + e.message);
    return { success: false, error: e.message };
  }
}

/**
 * Actualiza registro en hoja OK
 * @param {string} nVenta - Número de N.V
 * @param {string} nuevoEstado - Nuevo estado
 * @param {string} usuario - Usuario
 * @returns {Object} - {success}
 */
function actualizarNVEnOK(nVenta, nuevoEstado, usuario) {
  try {
    Logger.log('Actualizando N.V ' + nVenta + ' en hoja OK');
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(HOJA_OK);
    
    if (!sheet || sheet.getLastRow() <= 1) {
      return { success: false, error: 'Hoja OK no existe o está vacía' };
    }
    
    var data = sheet.getDataRange().getValues();
    var fechaHora = new Date();
    var actualizado = false;
    
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][1] || '').trim() === nVenta) {
        // Actualizar Estado Final (col U = 20)
        sheet.getRange(i + 1, 21).setValue(nuevoEstado);
        
        // Actualizar Última Actualización (col V = 21)
        sheet.getRange(i + 1, 22).setValue(fechaHora);
        
        // Si es ENTREGADO, actualizar fecha/usuario entregado y FECHA Y HORA COMPLETADO
        if (nuevoEstado === 'ENTREGADO') {
          sheet.getRange(i + 1, 19).setValue(fechaHora); // Col S - Fecha Entregado
          sheet.getRange(i + 1, 20).setValue(usuario);   // Col T - Usuario Entregado
          sheet.getRange(i + 1, 23).setValue(fechaHora); // Col W - FECHA Y HORA COMPLETADO
        }
        
        actualizado = true;
      }
    }
    
    if (actualizado) {
      SpreadsheetApp.flush();
      Logger.log('✅ N.V actualizada en OK');
    }
    
    return { success: true, actualizado: actualizado };
    
  } catch (e) {
    Logger.log('ERROR en actualizarNVEnOK: ' + e.message);
    return { success: false, error: e.message };
  }
}

/**
 * Verifica si una N.V existe en una hoja
 */
function existeNVEnHoja(nVenta, nombreHoja) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(nombreHoja);
    
    if (!sheet || sheet.getLastRow() <= 1) {
      return false;
    }
    
    var data = sheet.getDataRange().getValues();
    
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][1] || '').trim() === nVenta) {
        return true;
      }
    }
    
    return false;
    
  } catch (e) {
    Logger.log('ERROR en existeNVEnHoja: ' + e.message);
    return false;
  }
}

/**
 * Inicializa headers de una hoja de trabajo
 */
function inicializarHojaTrabajo(sheet, nombreHoja) {
  var headers;
  
  if (nombreHoja === 'DESPACHOS' || nombreHoja === 'Despachos') {
    // Hoja DESPACHOS con columnas extendidas para gestión de rutas
    headers = [
      'Fecha Entrega', 'N.Venta', 'Estado', 'Cod.Cliente', 'Nombre Cliente',
      'Cod.Vendedor', 'Nombre Vendedor', 'Zona', 'Cod.Producto', 'Descripcion Producto',
      'Unidad Medida', 'Pedido', 'Fecha Ingreso', 'Usuario',
      // Columnas específicas de despacho (manuales/formulario)
      'Facturas', 'Guía', 'Empresa Transporte', 'Transportista',
      'División', 'Valor Flete', 'N° Envío/OT',
      // Columnas automáticas de despacho
      'Fecha Despacho', 'Fecha Creación Despacho', 'Estado Despacho'
    ];
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setBackground('#ff6f00').setFontColor('white').setFontWeight('bold');
  } else if (nombreHoja === 'PICKING') {
    // Hoja PICKING con columnas de responsable
    headers = [
      'Fecha Entrega', 'N.Venta', 'Estado', 'Cod.Cliente', 'Nombre Cliente',
      'Cod.Vendedor', 'Nombre Vendedor', 'Zona', 'Cod.Producto', 'Descripcion Producto',
      'Unidad Medida', 'Pedido', 'USER_RESPONSABLE', 'FECHA_INICIO_PICKING'
    ];
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setBackground('#2980b9').setFontColor('white').setFontWeight('bold');
  } else if (nombreHoja === 'PACKING') {
    // Hoja PACKING con columnas de responsable
    headers = [
      'Fecha Entrega', 'N.Venta', 'Estado', 'Cod.Cliente', 'Nombre Cliente',
      'Cod.Vendedor', 'Nombre Vendedor', 'Zona', 'Cod.Producto', 'Descripcion Producto',
      'Unidad Medida', 'Pedido', 'USER_RESPONSABLE_PICKING', 'FECHA_FIN_PICKING',
      'USER_RESPONSABLE_PACKING', 'FECHA_INICIO_PACKING'
    ];
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setBackground('#27ae60').setFontColor('white').setFontWeight('bold');
  } else {
    // Hojas de trabajo estándar (ENTREGAS, etc.)
    headers = [
      'Fecha Entrega', 'N.Venta', 'Estado', 'Cod.Cliente', 'Nombre Cliente',
      'Cod.Vendedor', 'Nombre Vendedor', 'Zona', 'Cod.Producto', 'Descripcion Producto',
      'Unidad Medida', 'Pedido', 'Fecha Ingreso', 'Usuario'
    ];
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setBackground('#4caf50').setFontColor('white').setFontWeight('bold');
  }
  
  sheet.setFrozenRows(1);
}
