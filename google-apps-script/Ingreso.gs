/**
 * Ingreso.gs - Módulo de Ingreso de Recepciones REESTRUCTURADO
 * Registra recepciones en la hoja INGRESO con validaciones
 * Actualiza automáticamente el inventario
 */

var SHEET_INGRESO = 'INGRESO';
var SHEET_MATRIZ = 'MATRIZ';
var SHEET_INVENTARIO = 'INVENTARIO';
var SHEET_LAYOUT = 'LAYOUT';
var SHEET_MOVIMIENTOS = 'MOVIMIENTOS';

/**
 * Registra un nuevo ingreso de producto
 * Valida ubicación (máx 8 caracteres) y código (máx 12 caracteres)
 * @param {Object} data - Datos del ingreso
 * @returns {Object} - {success, error, id}
 */
function registrarIngreso(data) {
  try {
    // Validaciones
    if (!data.ubicacion || !data.codigo || !data.cantidad) {
      return { success: false, error: 'Ubicación, código y cantidad son requeridos' };
    }
    
    // Validar longitud de ubicación (máximo 8 caracteres)
    if (data.ubicacion.length > 8) {
      return { success: false, error: 'La ubicación debe tener máximo 8 caracteres' };
    }
    
    // Validar longitud de código (máximo 12 caracteres)
    if (data.codigo.length > 12) {
      return { success: false, error: 'El código debe tener máximo 12 caracteres' };
    }
    
    // Validar cantidad positiva
    var cantidad = Number(data.cantidad);
    if (isNaN(cantidad) || cantidad <= 0) {
      return { success: false, error: 'La cantidad debe ser un número positivo' };
    }
    
    // Validar que la ubicación exista en LAYOUT (opcional pero recomendado)
    var ubicacionValida = validarUbicacionEnLayout(data.ubicacion);
    if (!ubicacionValida.existe) {
      Logger.log('Advertencia: Ubicación ' + data.ubicacion + ' no existe en LAYOUT');
    }
    
    // Buscar descripción en MATRIZ si no se proporciona
    var descripcion = data.descripcion || '';
    if (!descripcion) {
      var productoMatriz = buscarEnMatriz(data.codigo);
      if (productoMatriz.success) {
        descripcion = productoMatriz.descripcion;
      }
    }
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_INGRESO);
    
    if (!sheet) {
      // Crear hoja si no existe
      sheet = ss.insertSheet(SHEET_INGRESO);
      sheet.appendRow([
        'ID', 'FechaHoraRegistro', 'Ubicacion', 'Codigo', 'Descripcion',
        'Serie', 'Partida', 'Pieza', 'FechaVencimiento', 'Cantidad',
        'Talla', 'Color', 'Usuario'
      ]);
    }
    
    // Generar ID único
    var id = 'ING-' + new Date().getTime();
    var fechaHora = new Date();
    
    // Preparar datos para insertar
    var nuevoIngreso = [
      id,
      fechaHora,
      data.ubicacion.toUpperCase(),
      data.codigo.toUpperCase(),
      descripcion,
      data.serie || '',
      data.partida || '',
      data.pieza || '',
      data.fechaVencimiento || '',
      cantidad,
      data.talla || '',
      data.color || '',
      data.usuario || 'Sistema'
    ];
    
    // Insertar en la siguiente fila disponible
    sheet.appendRow(nuevoIngreso);
    
    // Actualizar stock disponible en inventario
    actualizarInventarioIngreso(data.codigo, cantidad);
    
    // Registrar movimiento de entrada
    registrarMovimientoEntrada(data.codigo, cantidad, data.ubicacion, id, data.usuario);
    
    Logger.log('Ingreso registrado: ' + id + ' - ' + data.codigo + ' x ' + cantidad);
    
    return {
      success: true,
      id: id,
      codigo: data.codigo,
      cantidad: cantidad,
      ubicacion: data.ubicacion,
      descripcion: descripcion
    };
    
  } catch (e) {
    Logger.log('Error en registrarIngreso: ' + e.message);
    return { success: false, error: 'Error al registrar ingreso: ' + e.message };
  }
}


/**
 * Valida que una ubicación exista en la hoja LAYOUT
 * @param {string} ubicacion - Código de ubicación
 * @returns {Object} - {existe: boolean}
 */
function validarUbicacionEnLayout(ubicacion) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_LAYOUT);
    
    if (!sheet) return { existe: false };
    
    var data = sheet.getDataRange().getValues();
    var ubicacionBuscada = ubicacion.trim().toUpperCase();
    
    for (var i = 1; i < data.length; i++) {
      var ub = String(data[i][0] || '').trim().toUpperCase();
      if (ub === ubicacionBuscada) {
        return { existe: true };
      }
    }
    
    return { existe: false };
    
  } catch (e) {
    return { existe: false };
  }
}

/**
 * Busca un producto en la hoja MATRIZ
 * @param {string} codigo - Código del producto
 * @returns {Object} - {success, descripcion, unidadMedida}
 */
function buscarEnMatriz(codigo) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_MATRIZ);
    
    if (!sheet) {
      return { success: false, error: 'Hoja MATRIZ no encontrada' };
    }
    
    var data = sheet.getDataRange().getValues();
    var codigoBuscado = codigo.trim().toUpperCase();
    
    for (var i = 1; i < data.length; i++) {
      var codigoFila = String(data[i][0] || '').trim().toUpperCase();
      if (codigoFila === codigoBuscado) {
        return {
          success: true,
          codigo: codigoFila,
          descripcion: String(data[i][1] || ''),
          unidadMedida: String(data[i][2] || '')
        };
      }
    }
    
    return { success: false, error: 'Producto no encontrado en catálogo' };
    
  } catch (e) {
    Logger.log('Error en buscarEnMatriz: ' + e.message);
    return { success: false, error: e.message };
  }
}

/**
 * Actualiza el stock disponible en la hoja INVENTARIO
 * @param {string} codigo - Código del producto
 * @param {number} cantidad - Cantidad a agregar
 */
function actualizarInventarioIngreso(codigo, cantidad) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_INVENTARIO);
    
    if (!sheet) {
      Logger.log('Hoja INVENTARIO no encontrada, no se actualizó el stock');
      return;
    }
    
    var data = sheet.getDataRange().getValues();
    var codigoBuscado = codigo.trim().toUpperCase();
    var encontrado = false;
    
    for (var i = 1; i < data.length; i++) {
      var codigoFila = String(data[i][0] || '').trim().toUpperCase();
      if (codigoFila === codigoBuscado) {
        // Actualizar stock disponible (columna D)
        var disponibleActual = Number(data[i][3]) || 0;
        var nuevoDisponible = disponibleActual + cantidad;
        sheet.getRange(i + 1, 4).setValue(nuevoDisponible);
        
        // Recalcular stock total (columna H)
        var reserva = Number(data[i][4]) || 0;
        var transitoria = Number(data[i][5]) || 0;
        var consignacion = Number(data[i][6]) || 0;
        var stockTotal = nuevoDisponible + reserva + transitoria + consignacion;
        sheet.getRange(i + 1, 8).setValue(stockTotal);
        
        encontrado = true;
        Logger.log('Stock actualizado para ' + codigo + ': ' + disponibleActual + ' -> ' + nuevoDisponible);
        break;
      }
    }
    
    if (!encontrado) {
      // Crear nuevo registro en inventario
      var productoMatriz = buscarEnMatriz(codigo);
      var descripcion = productoMatriz.success ? productoMatriz.descripcion : '';
      var unidadMedida = productoMatriz.success ? productoMatriz.unidadMedida : '';
      
      sheet.appendRow([
        codigo.toUpperCase(),
        descripcion,
        unidadMedida,
        cantidad,  // Disponible
        0,         // Reserva
        0,         // Transitoria
        0,         // Consignación
        cantidad   // Stock Total
      ]);
      
      Logger.log('Nuevo producto agregado al inventario: ' + codigo);
    }
    
  } catch (e) {
    Logger.log('Error en actualizarInventarioIngreso: ' + e.message);
  }
}

/**
 * Registra un movimiento de entrada en la hoja MOVIMIENTOS
 */
function registrarMovimientoEntrada(codigo, cantidad, ubicacion, referencia, usuario) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_MOVIMIENTOS);
    
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_MOVIMIENTOS);
      sheet.appendRow(['ID', 'FechaHora', 'TipoMovimiento', 'Codigo', 'Cantidad', 'Ubicacion', 'Referencia', 'Usuario']);
    }
    
    var id = 'MOV-' + new Date().getTime();
    sheet.appendRow([
      id,
      new Date(),
      'ENTRADA',
      codigo,
      cantidad,
      ubicacion,
      referencia,
      usuario || 'Sistema'
    ]);
    
  } catch (e) {
    Logger.log('Error al registrar movimiento de entrada: ' + e.message);
  }
}

/**
 * Obtiene el historial de ingresos recientes
 * @param {number} limite - Número máximo de registros a devolver
 * @returns {Object} - {success, ingresos}
 */
function getHistorialIngresos(limite) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_INGRESO);
    
    if (!sheet) {
      return { success: true, ingresos: [] };
    }
    
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      return { success: true, ingresos: [] };
    }
    
    var numRows = Math.min(limite || 50, lastRow - 1);
    var startRow = Math.max(2, lastRow - numRows + 1);
    
    var data = sheet.getRange(startRow, 1, numRows, 13).getValues();
    var ingresos = [];
    
    for (var i = data.length - 1; i >= 0; i--) {
      var row = data[i];
      if (!row[0]) continue;
      
      ingresos.push({
        id: row[0],
        fechaHoraRegistro: row[1],
        ubicacion: row[2],
        codigo: row[3],
        descripcion: row[4],
        serie: row[5],
        partida: row[6],
        pieza: row[7],
        fechaVencimiento: row[8],
        cantidad: row[9],
        talla: row[10],
        color: row[11],
        usuario: row[12]
      });
    }
    
    return {
      success: true,
      ingresos: ingresos,
      total: ingresos.length
    };
    
  } catch (e) {
    Logger.log('Error en getHistorialIngresos: ' + e.message);
    return { success: false, error: e.message };
  }
}

/**
 * Función de compatibilidad - buscar producto en matriz
 */
function buscarProductoEnMatriz(codigo) {
  return buscarEnMatriz(codigo);
}


/**
 * Guarda múltiples registros de ingreso en batch
 * Soporta hasta 20 registros por llamada
 * Columnas en hoja Ubicaciones:
 *   A: Ubicación, B: Código, C: Serie, D: Partida, E: Pieza,
 *   F: Fecha Vencimiento, G: Talla (vacío), H: Color (vacío),
 *   I: Cantidad, J: (vacío), K: Fecha/Hora Registro, L: Usuario
 * @param {Array} registros - Array de objetos con datos de ingreso
 * @returns {Object} - {success, total, guardados, errores}
 */
function guardarIngresoBatch(registros) {
  Logger.log('=== guardarIngresoBatch INICIO ===');
  Logger.log('Registros recibidos: ' + (registros ? registros.length : 0));
  
  if (!registros || !Array.isArray(registros) || registros.length === 0) {
    return { success: false, error: 'No hay registros para guardar' };
  }
  
  // Limitar a 20 registros por batch
  var batch = registros.slice(0, 20);
  var guardados = [];
  var errores = [];
  
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Ubicaciones');
    
    // Crear hoja Ubicaciones si no existe con las columnas correctas
    if (!sheet) {
      sheet = ss.insertSheet('Ubicaciones');
      // Columnas: A-Ubicación, B-Código, C-Serie, D-Partida, E-Pieza, F-FechaVenc, G-Talla, H-Color, I-Cantidad, J-(vacío), K-FechaRegistro, L-Usuario
      sheet.appendRow([
        'Ubicación', 'Código', 'Serie', 'Partida', 'Pieza', 
        'Fecha Vencimiento', 'Talla', 'Color', 'Cantidad', 
        '', 'Fecha Registro', 'Usuario'
      ]);
      sheet.getRange(1, 1, 1, 12).setBackground('#10b981').setFontColor('white').setFontWeight('bold');
      sheet.setFrozenRows(1);
    }
    
    var filasAInsertar = [];
    var fechaRegistro = new Date();
    var usuario = Session.getActiveUser().getEmail() || 'Sistema';
    
    for (var i = 0; i < batch.length; i++) {
      var reg = batch[i];
      
      // Validaciones
      if (!reg.ubicacion || String(reg.ubicacion).length > 8) {
        errores.push({ id: reg.id, error: 'Ubicación inválida' });
        continue;
      }
      
      if (!reg.codigo || String(reg.codigo).length > 12) {
        errores.push({ id: reg.id, error: 'Código inválido' });
        continue;
      }
      
      var cantidad = Number(reg.cantidad);
      if (isNaN(cantidad) || cantidad <= 0) {
        errores.push({ id: reg.id, error: 'Cantidad inválida' });
        continue;
      }
      
      // Preparar fila según el mapeo de columnas:
      // A: Ubicación, B: Código, C: Serie, D: Partida, E: Pieza,
      // F: Fecha Vencimiento, G: Talla (vacío), H: Color (vacío),
      // I: Cantidad, J: (vacío), K: Fecha/Hora Registro, L: Usuario
      filasAInsertar.push([
        String(reg.ubicacion).toUpperCase(),  // A - Ubicación
        String(reg.codigo).toUpperCase(),     // B - Código
        reg.serie || '',                       // C - Serie
        reg.partida || '',                     // D - Partida
        reg.pieza || '',                       // E - Pieza
        reg.fechaVenc || '',                   // F - Fecha Vencimiento
        '',                                    // G - Talla (vacío)
        '',                                    // H - Color (vacío)
        cantidad,                              // I - Cantidad
        '',                                    // J - (vacío)
        fechaRegistro,                         // K - Fecha/Hora Registro
        usuario                                // L - Usuario
      ]);
      
      guardados.push(reg.id);
    }
    
    // Insertar todas las filas de una vez (más eficiente)
    if (filasAInsertar.length > 0) {
      var lastRow = sheet.getLastRow();
      sheet.getRange(lastRow + 1, 1, filasAInsertar.length, 12).setValues(filasAInsertar);
      SpreadsheetApp.flush();
      
      Logger.log('Insertadas ' + filasAInsertar.length + ' filas en Ubicaciones');
      
      // Actualizar inventario para cada código único
      var codigosUnicos = {};
      for (var j = 0; j < filasAInsertar.length; j++) {
        var cod = filasAInsertar[j][1];  // Columna B - Código
        var cant = filasAInsertar[j][8]; // Columna I - Cantidad
        codigosUnicos[cod] = (codigosUnicos[cod] || 0) + cant;
      }
      
      for (var codigo in codigosUnicos) {
        if (codigosUnicos.hasOwnProperty(codigo)) {
          actualizarInventarioIngreso(codigo, codigosUnicos[codigo]);
        }
      }
    }
    
    Logger.log('=== guardarIngresoBatch FIN - Guardados: ' + guardados.length + ', Errores: ' + errores.length + ' ===');
    
    return {
      success: true,
      total: guardados.length,
      guardados: guardados,
      errores: errores
    };
    
  } catch (e) {
    Logger.log('ERROR en guardarIngresoBatch: ' + e.message);
    return { success: false, error: e.message };
  }
}
