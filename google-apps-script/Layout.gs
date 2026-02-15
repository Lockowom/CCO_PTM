/**
 * Layout.gs - Módulo de Layout de Bodega REESTRUCTURADO
 * Maneja la visualización del mapa de ubicaciones con productos desde UBICACIONES
 * y gestión de estados de ubicación desde LAYOUT
 */

// Constantes
var SHEET_LAYOUT = 'LAYOUT';
var SHEET_UBICACIONES = 'UBICACIONES';

// Estados válidos de ubicación
var ESTADOS_UBICACION = {
  DISPONIBLE: 'DISPONIBLE',
  NO_DISPONIBLE: 'NO DISPONIBLE',
  OCUPADO: 'OCUPADO'
};

/**
 * Obtiene el layout completo con productos desde la hoja INGRESO
 * @returns {Object} - {success, pasillos, estadisticas}
 */
function getLayoutConProductos() {
  try {
    Logger.log('getLayoutConProductos - Iniciando...');
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var layoutSheet = ss.getSheetByName(SHEET_LAYOUT);
    var ubicacionesSheet = ss.getSheetByName(SHEET_UBICACIONES);
    
    // Si no existe hoja LAYOUT, generar ubicaciones desde UBICACIONES
    if (!layoutSheet) {
      Logger.log('Hoja LAYOUT no existe, generando desde UBICACIONES...');
      return generarLayoutDesdeUbicaciones();
    }
    
    // Si LAYOUT está vacío o solo tiene headers, generar desde UBICACIONES
    var lastRow = layoutSheet.getLastRow();
    Logger.log('Hoja LAYOUT tiene ' + lastRow + ' filas');
    if (lastRow <= 1) {
      Logger.log('Hoja LAYOUT vacía, generando desde UBICACIONES...');
      return generarLayoutDesdeUbicaciones();
    }
    
    if (!ubicacionesSheet) {
      Logger.log('Hoja UBICACIONES no encontrada');
      return { success: false, error: 'Hoja UBICACIONES no encontrada' };
    }
    
    // Obtener datos de LAYOUT (ubicaciones y estados)
    var layoutData = layoutSheet.getDataRange().getValues();
    var layoutHeaders = layoutData[0];
    
    // Mapear índices de columnas de LAYOUT por nombre (case-insensitive)
    var colUbicacion = 0, colPasillo = 1, colColumna = 2, colNivel = 3, colEstado = 4;
    
    for (var h = 0; h < layoutHeaders.length; h++) {
      var headerName = String(layoutHeaders[h] || '').trim().toLowerCase();
      if (headerName === 'ubicacion') colUbicacion = h;
      if (headerName === 'pasillo') colPasillo = h;
      if (headerName === 'columna') colColumna = h;
      if (headerName === 'nivel') colNivel = h;
      if (headerName === 'estado') colEstado = h;
    }
    
    Logger.log('getLayoutConProductos - Columnas LAYOUT: Ubicacion=' + colUbicacion + ', Pasillo=' + colPasillo + ', Columna=' + colColumna + ', Nivel=' + colNivel + ', Estado=' + colEstado);
    
    // Obtener productos de INGRESO agrupados por ubicación
    var productosResumen = getProductosAgrupadosPorUbicacion();
    
    // Estructura de pasillos
    var pasillos = {};
    var totalUbicaciones = 0;
    var ubicacionesOcupadas = 0;
    var ubicacionesVacias = 0;

    // Procesar cada ubicación del LAYOUT
    for (var i = 1; i < layoutData.length; i++) {
      var row = layoutData[i];
      var ubicacion = String(row[colUbicacion] || '').trim();
      
      if (!ubicacion) continue;
      
      var pasillo = String(row[colPasillo] || '').trim();
      var columna = String(row[colColumna] || '').trim();
      var nivel = String(row[colNivel] || '').trim();
      var estado = String(row[colEstado] || ESTADOS_UBICACION.DISPONIBLE).trim();
      
      // Parsear ubicación si no hay datos separados
      if (!pasillo && ubicacion.match(/^([A-H])-(\d{2})-(\d{2})$/)) {
        var match = ubicacion.match(/^([A-H])-(\d{2})-(\d{2})$/);
        pasillo = match[1];
        columna = match[2];
        nivel = match[3];
      }
      
      if (!pasillo) continue;
      
      // Inicializar pasillo si no existe
      if (!pasillos[pasillo]) {
        pasillos[pasillo] = { niveles: {} };
      }
      
      // Inicializar nivel si no existe
      if (!pasillos[pasillo].niveles[nivel]) {
        pasillos[pasillo].niveles[nivel] = [];
      }
      
      // Obtener cantidad de productos en esta ubicación
      var infoProductos = productosResumen[ubicacion] || { cantidad: 0, items: 0 };
      var tieneProductos = infoProductos.cantidad > 0;
      
      // Agregar ubicación
      pasillos[pasillo].niveles[nivel].push({
        ubicacion: ubicacion,
        columna: parseInt(columna) || 0,
        nivel: parseInt(nivel) || 0,
        estado: estado,
        cantidad: infoProductos.cantidad,
        items: infoProductos.items,
        tieneProductos: tieneProductos,
        rowIndex: i + 1
      });
      
      totalUbicaciones++;
      if (tieneProductos) {
        ubicacionesOcupadas++;
      } else {
        ubicacionesVacias++;
      }
    }
    
    // Ordenar ubicaciones por columna en cada nivel
    for (var p in pasillos) {
      for (var n in pasillos[p].niveles) {
        pasillos[p].niveles[n].sort(function(a, b) {
          return a.columna - b.columna;
        });
      }
    }
    
    Logger.log('getLayoutConProductos - Total: ' + totalUbicaciones + ' ubicaciones, ' + ubicacionesOcupadas + ' ocupadas, ' + ubicacionesVacias + ' vacías');
    
    return {
      success: true,
      pasillos: pasillos,
      estadisticas: {
        totalUbicaciones: totalUbicaciones,
        ubicacionesOcupadas: ubicacionesOcupadas,
        ubicacionesVacias: ubicacionesVacias,
        porcentajeOcupacion: totalUbicaciones > 0 ? 
          Math.round((ubicacionesOcupadas / totalUbicaciones) * 100) : 0
      }
    };
    
  } catch (e) {
    Logger.log('Error en getLayoutConProductos: ' + e.message);
    return { success: false, error: 'Error al cargar layout: ' + e.message };
  }
}

/**
 * Obtiene productos agrupados por ubicación desde UBICACIONES
 * @returns {Object} - Mapa de ubicación -> {cantidad, items}
 */
function getProductosAgrupadosPorUbicacion() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_UBICACIONES);
    
    if (!sheet) {
      Logger.log('Hoja UBICACIONES no encontrada');
      return {};
    }
    
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      Logger.log('Hoja UBICACIONES vacía o solo tiene headers');
      return {};
    }
    
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var data = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues();
    
    // Encontrar índice de columna Ubicacion y Cantidad por nombre
    var colUbicacion = -1;
    var colCantidad = -1;
    
    for (var h = 0; h < headers.length; h++) {
      var headerName = String(headers[h] || '').trim().toLowerCase();
      if (headerName === 'ubicacion' || headerName === 'ubicación') colUbicacion = h;
      if (headerName === 'cantidad' || headerName === 'stock' || headerName === 'qty') colCantidad = h;
    }
    
    // Si no encuentra por nombre, usar posiciones por defecto
    if (colUbicacion === -1) colUbicacion = 0; // Primera columna
    if (colCantidad === -1) colCantidad = 1;   // Segunda columna
    
    Logger.log('Columnas detectadas - Ubicacion: ' + colUbicacion + ', Cantidad: ' + colCantidad);
    
    var resumen = {};
    
    for (var i = 0; i < data.length; i++) {
      var ubicacion = String(data[i][colUbicacion] || '').trim().toUpperCase();
      var cantidad = Number(data[i][colCantidad]) || 0;
      
      if (ubicacion && ubicacion !== '') {
        if (!resumen[ubicacion]) {
          resumen[ubicacion] = { cantidad: 0, items: 0 };
        }
        resumen[ubicacion].cantidad += cantidad;
        resumen[ubicacion].items += 1;
      }
    }
    
    Logger.log('Resumen de ubicaciones: ' + Object.keys(resumen).length + ' ubicaciones encontradas');
    
    return resumen;
    
  } catch (e) {
    Logger.log('Error en getProductosAgrupadosPorUbicacion: ' + e.message);
    return {};
  }
}


/**
 * Obtiene el detalle de productos en una ubicación específica desde UBICACIONES
 * @param {string} ubicacion - Código de ubicación
 * @returns {Object} - {success, productos, cantidadTotal, totalRegistros}
 */
function getProductosPorUbicacion(ubicacion) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_UBICACIONES);
    
    if (!sheet) {
      Logger.log('Hoja UBICACIONES no encontrada en getProductosPorUbicacion');
      return { success: false, error: 'Hoja UBICACIONES no encontrada' };
    }
    
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      return { success: true, productos: [], cantidadTotal: 0, totalRegistros: 0 };
    }
    
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var data = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues();
    var ubicacionBuscada = ubicacion.trim().toUpperCase();
    
    // Buscar índices de columnas por nombre
    var cols = {
      ubicacion: -1,
      codigo: -1,
      descripcion: -1,
      cantidad: -1,
      talla: -1,
      color: -1
    };
    
    for (var h = 0; h < headers.length; h++) {
      var headerName = String(headers[h] || '').trim().toLowerCase();
      if (headerName === 'ubicacion' || headerName === 'ubicación') cols.ubicacion = h;
      if (headerName === 'codigo' || headerName === 'código' || headerName === 'sku') cols.codigo = h;
      if (headerName === 'descripcion' || headerName === 'descripción' || headerName === 'nombre') cols.descripcion = h;
      if (headerName === 'cantidad' || headerName === 'stock' || headerName === 'qty') cols.cantidad = h;
      if (headerName === 'talla' || headerName === 'size') cols.talla = h;
      if (headerName === 'color') cols.color = h;
    }
    
    // Posiciones por defecto si no encuentra por nombre
    if (cols.ubicacion === -1) cols.ubicacion = 0;
    if (cols.cantidad === -1) cols.cantidad = 1;
    if (cols.codigo === -1) cols.codigo = 2;
    if (cols.descripcion === -1) cols.descripcion = 3;
    
    Logger.log('getProductosPorUbicacion - Buscando ubicación: ' + ubicacionBuscada);
    
    var productos = [];
    var totalCantidad = 0;
    
    for (var i = 0; i < data.length; i++) {
      var ubicacionFila = String(data[i][cols.ubicacion] || '').trim().toUpperCase();
      
      if (ubicacionFila === ubicacionBuscada) {
        var cantidad = Number(data[i][cols.cantidad]) || 0;
        totalCantidad += cantidad;
        
        productos.push({
          codigo: cols.codigo >= 0 ? String(data[i][cols.codigo] || '') : '',
          descripcion: cols.descripcion >= 0 ? String(data[i][cols.descripcion] || '') : '',
          cantidad: cantidad,
          talla: cols.talla >= 0 ? String(data[i][cols.talla] || '') : '',
          color: cols.color >= 0 ? String(data[i][cols.color] || '') : '',
          rowIndex: i + 2
        });
      }
    }
    
    Logger.log('Productos encontrados en ' + ubicacionBuscada + ': ' + productos.length);
    
    // Agrupar por código
    var productosPorCodigo = {};
    for (var j = 0; j < productos.length; j++) {
      var p = productos[j];
      if (!productosPorCodigo[p.codigo]) {
        productosPorCodigo[p.codigo] = {
          codigo: p.codigo,
          descripcion: p.descripcion,
          cantidadTotal: 0,
          registros: []
        };
      }
      productosPorCodigo[p.codigo].cantidadTotal += p.cantidad;
      productosPorCodigo[p.codigo].registros.push(p);
    }
    
    var productosPorCodigoArray = [];
    for (var key in productosPorCodigo) {
      productosPorCodigoArray.push(productosPorCodigo[key]);
    }
    
    return {
      success: true,
      ubicacion: ubicacion,
      productos: productos,
      productosPorCodigo: productosPorCodigoArray,
      cantidadTotal: totalCantidad,
      totalRegistros: productos.length
    };
    
  } catch (e) {
    Logger.log('Error en getProductosPorUbicacion: ' + e.message);
    return { success: false, error: 'Error al obtener productos: ' + e.message };
  }
}

/**
 * Actualiza el estado de una ubicación
 * @param {string} ubicacion - Código de ubicación
 * @param {string} nuevoEstado - Nuevo estado (DISPONIBLE, NO DISPONIBLE, OCUPADO)
 * @param {string} usuario - Usuario que realiza el cambio
 * @returns {Object} - {success, error}
 */
function actualizarEstadoUbicacion(ubicacion, nuevoEstado, usuario) {
  try {
    // Validar estado
    var estadosValidos = [ESTADOS_UBICACION.DISPONIBLE, ESTADOS_UBICACION.NO_DISPONIBLE, ESTADOS_UBICACION.OCUPADO];
    if (estadosValidos.indexOf(nuevoEstado) === -1) {
      return { success: false, error: 'Estado no válido. Use: DISPONIBLE, NO DISPONIBLE u OCUPADO' };
    }
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_LAYOUT);
    
    // Crear hoja LAYOUT si no existe
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_LAYOUT);
      sheet.appendRow(['Ubicacion', 'Pasillo', 'Columna', 'Nivel', 'Estado', 'FechaModificacion', 'UsuarioModificacion']);
    }
    
    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    
    var colUbicacion = headers.indexOf('Ubicacion');
    var colEstado = headers.indexOf('Estado');
    var colFechaMod = headers.indexOf('FechaModificacion');
    var colUsuarioMod = headers.indexOf('UsuarioModificacion');
    
    if (colUbicacion === -1) colUbicacion = 0;
    if (colEstado === -1) colEstado = 4;
    
    var ubicacionBuscada = ubicacion.trim().toUpperCase();
    var filaEncontrada = -1;
    
    for (var i = 1; i < data.length; i++) {
      var ub = String(data[i][colUbicacion] || '').trim().toUpperCase();
      if (ub === ubicacionBuscada) {
        filaEncontrada = i + 1;
        break;
      }
    }
    
    // Si no se encuentra, agregar nueva fila
    if (filaEncontrada === -1) {
      // Parsear ubicación para extraer pasillo, columna, nivel
      var match = ubicacionBuscada.match(/^([A-Z])-?(\d+)-?(\d+)$/i);
      var pasillo = match ? match[1] : ubicacionBuscada.charAt(0);
      var columna = match ? match[2] : '01';
      var nivel = match ? match[3] : '01';
      
      sheet.appendRow([ubicacionBuscada, pasillo, columna, nivel, nuevoEstado, new Date(), usuario || 'Sistema']);
      
      Logger.log('Nueva ubicación agregada a LAYOUT: ' + ubicacionBuscada);
      
      return {
        success: true,
        ubicacion: ubicacionBuscada,
        nuevoEstado: nuevoEstado,
        fechaModificacion: new Date().toISOString(),
        mensaje: 'Ubicación creada y estado actualizado'
      };
    }
    
    // Actualizar estado
    sheet.getRange(filaEncontrada, colEstado + 1).setValue(nuevoEstado);
    
    // Registrar fecha y usuario si existen las columnas
    var fechaHora = new Date();
    if (colFechaMod !== -1) {
      sheet.getRange(filaEncontrada, colFechaMod + 1).setValue(fechaHora);
    }
    if (colUsuarioMod !== -1) {
      sheet.getRange(filaEncontrada, colUsuarioMod + 1).setValue(usuario || 'Sistema');
    }
    
    // Registrar en historial de movimientos
    registrarMovimientoLayout(ubicacion, nuevoEstado, usuario, fechaHora);
    
    Logger.log('Estado de ubicación actualizado: ' + ubicacion + ' -> ' + nuevoEstado);
    
    return {
      success: true,
      ubicacion: ubicacion,
      nuevoEstado: nuevoEstado,
      fechaModificacion: fechaHora.toISOString()
    };
    
  } catch (e) {
    Logger.log('Error en actualizarEstadoUbicacion: ' + e.message);
    return { success: false, error: 'Error al actualizar estado: ' + e.message };
  }
}

/**
 * Registra un cambio de estado en el historial
 */
function registrarMovimientoLayout(ubicacion, nuevoEstado, usuario, fecha) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('MOVIMIENTOS');
    
    if (!sheet) {
      // Crear hoja si no existe
      sheet = ss.insertSheet('MOVIMIENTOS');
      sheet.appendRow(['ID', 'FechaHora', 'TipoMovimiento', 'Codigo', 'Cantidad', 'Ubicacion', 'Referencia', 'Usuario']);
    }
    
    var id = 'MOV-' + new Date().getTime();
    sheet.appendRow([
      id,
      fecha || new Date(),
      'CAMBIO_ESTADO',
      '',
      0,
      ubicacion,
      'Estado: ' + nuevoEstado,
      usuario || 'Sistema'
    ]);
    
  } catch (e) {
    Logger.log('Error al registrar movimiento: ' + e.message);
  }
}

/**
 * Obtiene el detalle completo de una ubicación (alias para compatibilidad)
 */
function getDetalleUbicacion(ubicacion) {
  return getProductosPorUbicacion(ubicacion);
}

/**
 * Obtiene el layout con cantidades (alias para compatibilidad)
 */
function getLayoutConCantidades() {
  return getLayoutConProductos();
}

/**
 * Genera el layout dinámicamente desde los datos de UBICACIONES
 * Útil cuando no existe hoja LAYOUT o está vacía
 */
function generarLayoutDesdeUbicaciones() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var ubicacionesSheet = ss.getSheetByName(SHEET_UBICACIONES);
    
    if (!ubicacionesSheet) {
      Logger.log('Hoja UBICACIONES no encontrada para generar layout');
      return { success: false, error: 'Hoja UBICACIONES no encontrada' };
    }
    
    var lastRow = ubicacionesSheet.getLastRow();
    if (lastRow <= 1) {
      Logger.log('Hoja UBICACIONES vacía, retornando layout vacío');
      return { 
        success: true, 
        pasillos: {}, 
        estadisticas: { totalUbicaciones: 0, ubicacionesOcupadas: 0, ubicacionesVacias: 0, porcentajeOcupacion: 0 }
      };
    }
    
    var headers = ubicacionesSheet.getRange(1, 1, 1, ubicacionesSheet.getLastColumn()).getValues()[0];
    var data = ubicacionesSheet.getRange(2, 1, lastRow - 1, ubicacionesSheet.getLastColumn()).getValues();
    
    // Encontrar columna de ubicación y cantidad por nombre
    var colUbicacion = -1;
    var colCantidad = -1;
    
    for (var h = 0; h < headers.length; h++) {
      var headerName = String(headers[h] || '').trim().toLowerCase();
      if (headerName === 'ubicacion' || headerName === 'ubicación') colUbicacion = h;
      if (headerName === 'cantidad' || headerName === 'stock' || headerName === 'qty') colCantidad = h;
    }
    
    // Usar posiciones por defecto si no se encuentran
    if (colUbicacion === -1) colUbicacion = 0; // Primera columna
    if (colCantidad === -1) colCantidad = 1;   // Segunda columna
    
    Logger.log('generarLayoutDesdeUbicaciones - Columnas: Ubicacion=' + colUbicacion + ', Cantidad=' + colCantidad);
    
    // Agrupar por ubicación
    var ubicacionesMap = {};
    
    for (var i = 0; i < data.length; i++) {
      var ubicacion = String(data[i][colUbicacion] || '').trim().toUpperCase();
      var cantidad = Number(data[i][colCantidad]) || 0;
      
      if (!ubicacion) continue;
      
      if (!ubicacionesMap[ubicacion]) {
        ubicacionesMap[ubicacion] = { cantidad: 0, items: 0 };
      }
      ubicacionesMap[ubicacion].cantidad += cantidad;
      ubicacionesMap[ubicacion].items++;
    }
    
    Logger.log('Ubicaciones encontradas en UBICACIONES: ' + Object.keys(ubicacionesMap).length);
    
    // Construir estructura de pasillos
    var pasillos = {};
    var totalUbicaciones = 0;
    var ubicacionesOcupadas = 0;
    
    for (var ub in ubicacionesMap) {
      // Parsear ubicación (formato esperado: A-01-01 o similar)
      var match = ub.match(/^([A-Z])-?(\d+)-?(\d+)$/i);
      if (!match) {
        // Intentar formato sin guiones
        match = ub.match(/^([A-Z])(\d{2})(\d{2})$/i);
      }
      
      var pasillo, columna, nivel;
      if (match) {
        pasillo = match[1].toUpperCase();
        columna = match[2];
        nivel = match[3];
      } else {
        // Si no coincide, usar primer caracter como pasillo
        pasillo = ub.charAt(0).toUpperCase();
        columna = '01';
        nivel = '01';
      }
      
      if (!pasillos[pasillo]) {
        pasillos[pasillo] = { niveles: {} };
      }
      
      if (!pasillos[pasillo].niveles[nivel]) {
        pasillos[pasillo].niveles[nivel] = [];
      }
      
      var info = ubicacionesMap[ub];
      pasillos[pasillo].niveles[nivel].push({
        ubicacion: ub,
        columna: parseInt(columna) || 0,
        nivel: parseInt(nivel) || 0,
        estado: 'DISPONIBLE',
        cantidad: info.cantidad,
        items: info.items,
        tieneProductos: info.cantidad > 0
      });
      
      totalUbicaciones++;
      if (info.cantidad > 0) ubicacionesOcupadas++;
    }
    
    // Ordenar ubicaciones por columna
    for (var p in pasillos) {
      for (var n in pasillos[p].niveles) {
        pasillos[p].niveles[n].sort(function(a, b) {
          return a.columna - b.columna;
        });
      }
    }
    
    Logger.log('Layout generado: ' + totalUbicaciones + ' ubicaciones, ' + ubicacionesOcupadas + ' ocupadas');
    
    return {
      success: true,
      pasillos: pasillos,
      estadisticas: {
        totalUbicaciones: totalUbicaciones,
        ubicacionesOcupadas: ubicacionesOcupadas,
        ubicacionesVacias: totalUbicaciones - ubicacionesOcupadas,
        porcentajeOcupacion: totalUbicaciones > 0 ? Math.round((ubicacionesOcupadas / totalUbicaciones) * 100) : 0
      }
    };
    
  } catch (e) {
    Logger.log('Error en generarLayoutDesdeUbicaciones: ' + e.message);
    return { success: false, error: 'Error al generar layout: ' + e.message };
  }
}

// Alias para compatibilidad con código antiguo
function generarLayoutDesdeIngreso() {
  return generarLayoutDesdeUbicaciones();
}

/**
 * Obtiene los datos básicos del layout
 */
function getLayoutData() {
  return getLayoutConProductos();
}
