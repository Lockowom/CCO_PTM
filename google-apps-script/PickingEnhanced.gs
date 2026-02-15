/**
 * PickingEnhanced.gs - Módulo de Picking Mejorado
 * Lee datos de N.V DIARIAS (columnas A,B,C,I,J,K,L)
 * Busca ubicaciones de productos en INGRESO (columnas C,D)
 */

var SHEET_NV_DIARIAS_PICKING = 'N.V DIARIAS';
var SHEET_INGRESO_PICKING = 'UBICACIONES';
var CACHE_DURATION = 21600; // 6 horas

// Mapeo de columnas UBICACIONES según estructura real:
// A = UBICACION, B = CODIGO, I = CANTIDAD, J = DESCRIPCION
var COL_INGRESO = {
  UBICACION: 0,       // A - Ubicación del producto
  CODIGO: 1,          // B - Código del producto
  DESCRIPCION: 9,     // J - Descripción
  CANTIDAD: 8         // I - Cantidad
};

/**
 * Obtiene un mapa de todas las ubicaciones de productos CON CANTIDADES
 * Lee la hoja INGRESO una sola vez
 * @returns {Object} Mapa { CODIGO: [{loc: 'A1', qty: 10}, ...] }
 */
function obtenerMapaUbicaciones() {
  var mapa = {};
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_INGRESO_PICKING);
    
    if (!sheet) return mapa;
    
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) return mapa;
    
    // Leer columnas A hasta J para tener Ubicación, Código y Cantidad
    var data = sheet.getRange(2, 1, lastRow - 1, 10).getValues();
    
    for (var i = 0; i < data.length; i++) {
      var codigo = String(data[i][COL_INGRESO.CODIGO] || '').trim().toUpperCase();
      var ubicacion = String(data[i][COL_INGRESO.UBICACION] || '').trim();
      var cantidad = Number(data[i][COL_INGRESO.CANTIDAD]) || 0;
      
      if (codigo && ubicacion) {
        if (!mapa[codigo]) {
          mapa[codigo] = [];
        }
        
        // Agregar objeto con ubicación y cantidad
        // Verificar si ya existe esa ubicación para sumar cantidad (si aplica)
        var existente = false;
        for (var k = 0; k < mapa[codigo].length; k++) {
          if (mapa[codigo][k].loc === ubicacion) {
            mapa[codigo][k].qty += cantidad;
            existente = true;
            break;
          }
        }
        
        if (!existente) {
          mapa[codigo].push({
            loc: ubicacion,
            qty: cantidad
          });
        }
      }
    }
  } catch (e) {
    Logger.log('Error en obtenerMapaUbicaciones: ' + e.message);
  }
  return mapa;
}

/**
 * Guarda el progreso parcial de un picking (para vista Admin)
 * @param {string} nVenta - Nota de Venta
 * @param {Object} progreso - Objeto con el estado de los items
 */
function savePickingProgress(nVenta, progreso) {
  try {
    var cache = CacheService.getScriptCache();
    var key = 'PICK_PROG_' + nVenta;
    cache.put(key, JSON.stringify(progreso), CACHE_DURATION);
    return { success: true };
  } catch (e) {
    Logger.log('Error saving progress: ' + e.message);
    return { success: false };
  }
}

/**
 * Obtiene el progreso parcial de un picking
 * @param {string} nVenta
 */
function getPickingProgress(nVenta) {
  try {
    var cache = CacheService.getScriptCache();
    var key = 'PICK_PROG_' + nVenta;
    var data = cache.get(key);
    return { success: true, progreso: data ? JSON.parse(data) : null };
  } catch (e) {
    return { success: false, progreso: null };
  }
}

/**
 * Obtiene el detalle de una guía con el progreso actual (para supervisión)
 * @param {string} nVenta
 */
function getDetalleGuiaConProgreso(nVenta) {
  try {
    // 1. Obtener detalle normal
    var detalle = getDetalleGuiaPickingEnhanced(nVenta);
    if (!detalle.success) return detalle;
    
    // 2. Obtener progreso de caché
    var progresoResult = getPickingProgress(nVenta);
    
    return {
      success: true,
      guia: detalle.guia,
      productos: detalle.productos,
      progreso: progresoResult.progreso || []
    };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

/**
 * Busca las ubicaciones de un producto en la hoja INGRESO
 * @param {string} codigoProducto - Código del producto
 * @returns {Object} - {success, ubicaciones: string[]}
 */
function buscarUbicacionesProducto(codigoProducto) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_INGRESO_PICKING);
    
    if (!sheet) {
      return { success: true, ubicaciones: ['SIN UBICACIÓN'], mensaje: 'Hoja INGRESO no encontrada' };
    }
    
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      return { success: true, ubicaciones: ['SIN UBICACIÓN'], mensaje: 'Hoja INGRESO vacía' };
    }
    
    // Leer columnas A hasta J (10 columnas) para obtener B (Ubicación) y J (Código)
    var data = sheet.getRange(2, 1, lastRow - 1, 10).getValues();
    var codigoBuscado = String(codigoProducto).trim().toUpperCase();
    var ubicaciones = [];
    var ubicacionesSet = {};
    
    Logger.log('Buscando ubicaciones para código: ' + codigoBuscado);
    
    for (var i = 0; i < data.length; i++) {
      // Columna B (índice 1) = CODIGO del producto
      var codigoFila = String(data[i][COL_INGRESO.CODIGO] || '').trim().toUpperCase();
      
      if (codigoFila === codigoBuscado) {
        // Columna A (índice 0) = UBICACION
        var ubicacion = String(data[i][COL_INGRESO.UBICACION] || '').trim().toUpperCase();
        var cantidad = Number(data[i][COL_INGRESO.CANTIDAD]) || 0;
        
        if (ubicacion && !ubicacionesSet[ubicacion]) {
          ubicacionesSet[ubicacion] = true;
          // Formato: "A-1 (Qty: 10)"
          ubicaciones.push(ubicacion + ' (Stock: ' + cantidad + ')');
          Logger.log('Ubicación encontrada: ' + ubicacion + ' para código: ' + codigoBuscado);
        }
      }
    }
    
    if (ubicaciones.length === 0) {
      Logger.log('No se encontraron ubicaciones para código: ' + codigoBuscado);
      return { 
        success: true, 
        ubicaciones: ['SIN UBICACIÓN'],
        codigo: codigoProducto,
        encontrado: false
      };
    }
    
    return {
      success: true,
      ubicaciones: ubicaciones,
      codigo: codigoProducto,
      encontrado: true,
      totalUbicaciones: ubicaciones.length
    };
    
  } catch (e) {
    Logger.log('Error en buscarUbicacionesProducto: ' + e.message);
    return { success: false, error: e.message, ubicaciones: ['SIN UBICACIÓN'] };
  }
}

/**
 * Obtiene las guías de picking pendientes con ubicaciones
 * Lee de N.V DIARIAS con estado PENDIENTE_PICKING
 * @returns {Object} - {success, guias}
 */
function getGuiasPickingEnhanced() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NV_DIARIAS_PICKING);
    
    if (!sheet) {
      return { success: false, error: 'Hoja N.V DIARIAS no encontrada' };
    }
    
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      return { success: true, guias: [], total: 0 };
    }
    
    var data = sheet.getRange(2, 1, lastRow - 1, 12).getValues();
    var guiasMap = {};
    
    for (var i = 0; i < data.length; i++) {
      var row = data[i];
      var estado = normalizarEstado(row[2]); // Columna C
      
      // Filtrar solo PENDIENTE_PICKING
      if (estado !== 'PENDIENTE_PICKING') {
        continue;
      }
      
      var nVenta = String(row[1] || '').trim(); // Columna B
      if (!nVenta) continue;
      
      if (!guiasMap[nVenta]) {
        guiasMap[nVenta] = {
          notaVenta: nVenta,
          fechaEntrega: row[0],           // Columna A
          fechaEntregaNV: row[0],
          estado: estado,                 // Columna C
          codCliente: String(row[3] || ''),
          cliente: String(row[4] || ''),
          codVendedor: String(row[5] || ''),
          vendedor: String(row[6] || ''),
          zona: String(row[7] || ''),
          productos: [],
          totalItems: 0
        };
      }
      
      guiasMap[nVenta].productos.push({
        codigo: String(row[8] || ''),           // Columna I
        codigoProducto: String(row[8] || ''),
        descripcion: String(row[9] || ''),      // Columna J
        unidadMedida: String(row[10] || ''),    // Columna K
        pedido: Number(row[11]) || 0,           // Columna L
        ubicaciones: [],                        // Se llenará después
        rowIndex: i + 2
      });
      
      guiasMap[nVenta].totalItems++;
    }
    
    // Convertir map a array (compatible con ES5)
    var guias = [];
    for (var key in guiasMap) {
      if (guiasMap.hasOwnProperty(key)) {
        guias.push(guiasMap[key]);
      }
    }
    
    // Ordenar por fecha de entrega ascendente
    guias.sort(function(a, b) {
      try {
        return new Date(a.fechaEntrega) - new Date(b.fechaEntrega);
      } catch (e) {
        return 0;
      }
    });
    
    return {
      success: true,
      guias: guias,
      total: guias.length
    };
    
  } catch (e) {
    Logger.log('Error en getGuiasPickingEnhanced: ' + e.message);
    return { success: false, error: 'Error al obtener guías: ' + e.message };
  }
}

/**
 * Inicia el proceso de picking para una N.V
 * Cambia estado a EN_PICKING y obtiene ubicaciones de productos
 * REGISTRA EL INICIO EN PICKING_LOG
 * @param {string} nVenta - Número de nota de venta
 * @param {string} usuario - Usuario que inicia el picking
 * @returns {Object} - {success, nv, productosConUbicacion}
 */
function iniciarPicking(nVenta, usuario) {
  Logger.log('=== iniciarPicking INICIO ===');
  Logger.log('nVenta: ' + nVenta + ', usuario: ' + usuario);
  
  try {
    // Validar parámetros
    if (!nVenta || String(nVenta).trim() === '') {
      Logger.log('ERROR: nVenta vacío');
      return { success: false, error: 'Número de N.V requerido' };
    }
    
    // Verificar estado actual
    Logger.log('Verificando estado actual...');
    var estadoActual = getEstadoNV(nVenta);
    Logger.log('Estado actual: ' + JSON.stringify(estadoActual));
    
    if (!estadoActual.success) {
      return estadoActual;
    }
    
    if (estadoActual.estado !== 'PENDIENTE_PICKING') {
      return { 
        success: false, 
        error: 'La N.V debe estar en estado PENDIENTE_PICKING para iniciar picking. Estado actual: ' + estadoActual.estado,
        code: 'E002'
      };
    }
    
    // Obtener productos de la N.V primero para tener la info del cliente
    Logger.log('Obteniendo productos de la N.V...');
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NV_DIARIAS_PICKING);
    
    if (!sheet) {
      Logger.log('ERROR: Hoja N.V DIARIAS no encontrada');
      return { success: false, error: 'Hoja N.V DIARIAS no encontrada' };
    }
    
    var data = sheet.getDataRange().getValues();
    var nVentaBuscada = String(nVenta).trim();
    
    var nvInfo = null;
    var productos = [];
    
    // Obtener mapa de ubicaciones CON CANTIDADES
    var mapaUbicaciones = obtenerMapaUbicaciones();
    
    for (var i = 1; i < data.length; i++) {
      var nVentaFila = String(data[i][1] || '').trim();
      
      if (nVentaFila === nVentaBuscada) {
        if (!nvInfo) {
          nvInfo = {
            notaVenta: nVentaFila,
            fechaEntrega: data[i][0],
            estado: 'EN_PICKING',
            cliente: String(data[i][4] || ''),
            vendedor: String(data[i][6] || '')
          };
        }
        
        var codigoProducto = String(data[i][8] || '');
        var codigoKey = codigoProducto.trim().toUpperCase();
        var infoUbicaciones = mapaUbicaciones[codigoKey] || [];
        var ubicacionesStr = [];
        
        // Formatear ubicaciones para el frontend
        if (infoUbicaciones.length > 0) {
          for (var k = 0; k < infoUbicaciones.length; k++) {
            ubicacionesStr.push(infoUbicaciones[k].loc + ' (Stock: ' + infoUbicaciones[k].qty + ')');
          }
        } else {
          ubicacionesStr.push('SIN UBICACIÓN');
        }
        
        productos.push({
          codigo: codigoProducto,
          codigoProducto: codigoProducto,
          descripcion: String(data[i][9] || ''),
          unidadMedida: String(data[i][10] || ''),
          pedido: Number(data[i][11]) || 0,
          ubicaciones: ubicacionesStr,
          ubicacionPrincipal: ubicacionesStr[0] || 'SIN UBICACIÓN'
        });
      }
    }
    
    if (!nvInfo) {
      return { success: false, error: 'N.V no encontrada', code: 'E001' };
    }
    
    // REGISTRAR INICIO DE PICKING EN LOG
    var logResult = registrarInicioPicking(nVenta, usuario, nvInfo.cliente, productos.length);
    if (!logResult.success) {
      return logResult; // Si ya hay un picking activo, retornar el error
    }
    
    // Cambiar estado a EN_PICKING
    var cambio = cambiarEstadoNV(nVenta, 'EN_PICKING', usuario);
    if (!cambio.success) {
      return cambio;
    }
    
    // ==================== COPIAR DATOS A HOJA PICKING ====================
    // Copiar las filas de N.V DIARIAS a la hoja PICKING para tracking en tiempo real
    try {
      var sheetPicking = ss.getSheetByName('PICKING');
      
      // Si la hoja PICKING no tiene datos, inicializarla con encabezados + USER_RESPONSABLE
      if (sheetPicking && sheetPicking.getLastRow() <= 1) {
        var headers = sheetPicking.getRange(1, 1, 1, sheetPicking.getLastColumn()).getValues()[0];
        // Verificar si ya tiene la columna USER_RESPONSABLE (columna 13 o más)
        if (headers.length < 13 || headers[12] !== 'USER_RESPONSABLE') {
          // Agregar columnas adicionales si no existen
          if (headers.length < 13) {
            sheetPicking.getRange(1, 13).setValue('USER_RESPONSABLE');
          }
          if (headers.length < 14) {
            sheetPicking.getRange(1, 14).setValue('FECHA_INICIO_PICKING');
          }
          Logger.log('Columnas USER_RESPONSABLE y FECHA_INICIO_PICKING agregadas a PICKING');
        }
      } else if (!sheetPicking) {
        // Crear la hoja PICKING si no existe
        sheetPicking = ss.insertSheet('PICKING');
        sheetPicking.appendRow([
          'Fecha Entrega N.Venta', 'N.Venta', 'Estado', 'Cod.Cliente', 'Nombre Cliente',
          'Cod.Vendedor', 'Nombre Vendedor', 'Zona', 'Cod.Producto', 'Descripcion Producto',
          'Unidad Medida', 'Pedido', 'USER_RESPONSABLE', 'FECHA_INICIO_PICKING'
        ]);
        sheetPicking.getRange(1, 1, 1, 14).setFontWeight('bold').setBackground('#2980b9').setFontColor('white');
        Logger.log('Hoja PICKING creada con encabezados');
      }
      
      // Verificar que la hoja tenga las columnas adicionales
      var currentLastCol = sheetPicking.getLastColumn();
      if (currentLastCol < 14) {
        if (currentLastCol < 13) {
          sheetPicking.getRange(1, 13).setValue('USER_RESPONSABLE');
        }
        if (currentLastCol < 14) {
          sheetPicking.getRange(1, 14).setValue('FECHA_INICIO_PICKING');
        }
      }
      
      // Copiar filas de esta N.V desde N.V DIARIAS a PICKING
      var filasACopiar = [];
      var fechaInicio = new Date();
      
      for (var j = 1; j < data.length; j++) {
        var nvFila = String(data[j][1] || '').trim();
        
        if (nvFila === nVentaBuscada) {
          // Crear fila con las columnas originales + USER_RESPONSABLE + FECHA_INICIO_PICKING
          var fila = [
            data[j][0],                        // A - Fecha Entrega N.Venta
            data[j][1],                        // B - N.Venta
            'EN_PICKING',                      // C - Estado (actualizado)
            data[j][3],                        // D - Cod.Cliente
            data[j][4],                        // E - Nombre Cliente
            data[j][5],                        // F - Cod.Vendedor
            data[j][6],                        // G - Nombre Vendedor
            data[j][7],                        // H - Zona
            data[j][8],                        // I - Cod.Producto
            data[j][9],                        // J - Descripcion Producto
            data[j][10],                       // K - Unidad Medida
            data[j][11],                       // L - Pedido
            usuario,                           // M - USER_RESPONSABLE
            fechaInicio                        // N - FECHA_INICIO_PICKING
          ];
          
          filasACopiar.push(fila);
        }
      }
      
      // Verificar si ya existe en PICKING para evitar duplicados
      var dataPicking = sheetPicking.getDataRange().getValues();
      var yaExisteEnPicking = false;
      for (var p = 1; p < dataPicking.length; p++) {
        if (String(dataPicking[p][1] || '').trim() === nVentaBuscada) {
          yaExisteEnPicking = true;
          // Actualizar el USER_RESPONSABLE si ya existe
          for (var q = 1; q < dataPicking.length; q++) {
            if (String(dataPicking[q][1] || '').trim() === nVentaBuscada) {
              sheetPicking.getRange(q + 1, 13).setValue(usuario);          // USER_RESPONSABLE
              sheetPicking.getRange(q + 1, 14).setValue(fechaInicio);      // FECHA_INICIO_PICKING
            }
          }
          Logger.log('N.V ya existe en PICKING. Actualizado USER_RESPONSABLE a: ' + usuario);
          break;
        }
      }
      
      if (!yaExisteEnPicking && filasACopiar.length > 0) {
        // Insertar todas las filas de la N.V
        for (var f = 0; f < filasACopiar.length; f++) {
          sheetPicking.appendRow(filasACopiar[f]);
        }
        SpreadsheetApp.flush();
        Logger.log('✅ Copiadas ' + filasACopiar.length + ' filas a PICKING con USER_RESPONSABLE: ' + usuario);
      }
      
    } catch (copyError) {
      Logger.log('⚠️ Error al copiar a PICKING: ' + copyError.message);
      // No fallar el picking si la copia falla
    }
    // ==================== FIN COPIAR DATOS A HOJA PICKING ====================
    
    nvInfo.productos = productos;
    nvInfo.totalItems = productos.length;
    nvInfo.pickingId = logResult.pickingId;
    nvInfo.userResponsable = usuario;
    
    Logger.log('Picking iniciado para N.V ' + nVenta + ' con ' + productos.length + ' productos por ' + usuario);
    
    return {
      success: true,
      nv: nvInfo,
      productosConUbicacion: productos,
      pickingId: logResult.pickingId,
      userResponsable: usuario,
      mensaje: 'Picking iniciado. Recolecte los productos de las ubicaciones indicadas.'
    };
    
  } catch (e) {
    Logger.log('Error en iniciarPicking: ' + e.message);
    return { success: false, error: 'Error al iniciar picking: ' + e.message };
  }
}

/**
 * Completa el picking de una N.V
 * Cambia estado a PK (Packing Area)
 * REGISTRA LA FINALIZACIÓN EN PICKING_LOG
 * @param {string} nVenta - Número de nota de venta
 * @param {string} usuario - Usuario que completa el picking
 * @returns {Object} - {success, mensaje}
 */
function completarPickingEnhanced(nVenta, usuario) {
  return completarPickingConReporte(nVenta, usuario, []);
}

/**
 * Completa el picking con reporte de incidencias (No Stock / Error BD)
 * @param {string} nVenta - Número de nota de venta
 * @param {string} usuario - Usuario que completa
 * @param {Array} reporte - Lista de items con incidencias
 */
function completarPickingConReporte(nVenta, usuario, reporte) {
  try {
    Logger.log('===== COMPLETAR PICKING CON REPORTE =====');
    Logger.log('N.V: ' + nVenta);
    Logger.log('Usuario: ' + usuario);
    
    // 1. Analizar reporte
    var hayErrorBD = false;
    var hayNoStock = false;
    var observaciones = [];
    
    if (reporte && reporte.length > 0) {
      for (var i = 0; i < reporte.length; i++) {
        var item = reporte[i];
        if (item.estado === 'ERROR_BD') {
          hayErrorBD = true;
          observaciones.push('ERROR BD: ' + item.codigo);
        } else if (item.estado === 'NO_STOCK') {
          hayNoStock = true;
          observaciones.push('NO STOCK: ' + item.codigo);
        }
      }
    }
    
    var obsTexto = observaciones.join(', ');
    
    // 2. Si hay Error BD, revertir a Pendiente Picking
    if (hayErrorBD) {
      Logger.log('Reporte contiene Error BD. Revirtiendo picking...');
      
      // Cancelar log actual
      var pickingActivo = getPickingActivoPorNV(nVenta);
      if (pickingActivo) {
        liberarPicking(pickingActivo.pickingId, usuario);
      }
      
      // Revertir estado N.V (liberarPicking ya lo hace, pero aseguramos)
      cambiarEstadoNVDirecto(nVenta, 'PENDIENTE_PICKING', usuario);
      
      return {
        success: true,
        mensaje: 'N.V devuelta a Pendiente por Error de BD. Notificar a sistemas.'
      };
    }
    
    // 3. Flujo normal (o con Quiebre de Stock, que pasa a Packing con aviso)
    Logger.log('Completando picking normalmente...');
    
    // Obtener total items
    var detalleResult = getDetalleGuiaPickingEnhanced(nVenta);
    var totalItems = detalleResult.success ? detalleResult.productos.length : 0;
    
    // Registrar Fin
    var logResult = registrarFinPicking(nVenta, usuario, totalItems, obsTexto);
    
    // ============ VERIFICAR SI N.V EXISTE EN N.V DIARIAS ============
    // CRÍTICO: Si la N.V solo existe en PICKING, copiarla primero a N.V DIARIAS
    Logger.log('Verificando existencia en N.V DIARIAS...');
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheetNVDiarias = ss.getSheetByName(SHEET_NV_DIARIAS);
    var existeEnNVDiarias = false;
    
    if (sheetNVDiarias) {
      var dataNVDiarias = sheetNVDiarias.getDataRange().getValues();
      for (var i = 1; i < dataNVDiarias.length; i++) {
        if (String(dataNVDiarias[i][1] || '').trim() === nVenta) {
          existeEnNVDiarias = true;
          break;
        }
      }
    }
    
    if (!existeEnNVDiarias) {
      Logger.log('⚠️ N.V NO existe en N.V DIARIAS, copiando desde PICKING...');
      
      // Copiar de PICKING a N.V DIARIAS
      var sheetPicking = ss.getSheetByName(SHEET_PICKING);
      if (sheetPicking) {
        var dataPicking = sheetPicking.getDataRange().getValues();
        var filasACopiar = [];
        
        for (var j = 1; j < dataPicking.length; j++) {
          if (String(dataPicking[j][1] || '').trim() === nVenta) {
            var fila = [];
            for (var k = 0; k < 12; k++) {
              fila.push(dataPicking[j][k]);
            }
            filasACopiar.push(fila);
          }
        }
        
        if (filasACopiar.length > 0 && sheetNVDiarias) {
          var lastRow = sheetNVDiarias.getLastRow();
          sheetNVDiarias.getRange(lastRow + 1, 1, filasACopiar.length, 12).setValues(filasACopiar);
          SpreadsheetApp.flush();
          Logger.log('✅ Copiadas ' + filasACopiar.length + ' filas de PICKING a N.V DIARIAS');
        }
      }
    } else {
      Logger.log('✅ N.V existe en N.V DIARIAS');
    }
    
    // ============ CAMBIAR ESTADO A PACKING ============
    // IMPORTANTE: Cambiar estado en N.V DIARIAS de TODAS las filas de esta N.V
    Logger.log('Cambiando estado a PENDIENTE PACKING...');
    
    var cambio = cambiarEstadoNV(nVenta, 'PK', usuario);
    
    if (!cambio.success) {
      Logger.log('❌ Error al cambiar estado: ' + cambio.error);
      return cambio;
    }
    
    Logger.log('✅ Estado cambiado correctamente: ' + cambio.filasActualizadas + ' filas actualizadas');
    
    // ==================== COPIAR DATOS A HOJA PACKING CON RESPONSABLES ====================
    try {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var sheetPicking = ss.getSheetByName('PICKING');
      var sheetPacking = ss.getSheetByName('PACKING');
      
      // Verificar/crear hoja PACKING con columnas correctas
      if (!sheetPacking) {
        sheetPacking = ss.insertSheet('PACKING');
        sheetPacking.appendRow([
          'Fecha Entrega', 'N.Venta', 'Estado', 'Cod.Cliente', 'Nombre Cliente',
          'Cod.Vendedor', 'Nombre Vendedor', 'Zona', 'Cod.Producto', 'Descripcion Producto',
          'Unidad Medida', 'Pedido', 'USER_RESPONSABLE_PICKING', 'FECHA_FIN_PICKING',
          'USER_RESPONSABLE_PACKING', 'FECHA_INICIO_PACKING'
        ]);
        sheetPacking.getRange(1, 1, 1, 16).setFontWeight('bold').setBackground('#27ae60').setFontColor('white');
      }
      
      // Agregar columnas faltantes si es necesario
      var lastColPacking = sheetPacking.getLastColumn();
      if (lastColPacking < 16) {
        if (lastColPacking < 13) sheetPacking.getRange(1, 13).setValue('USER_RESPONSABLE_PICKING');
        if (lastColPacking < 14) sheetPacking.getRange(1, 14).setValue('FECHA_FIN_PICKING');
        if (lastColPacking < 15) sheetPacking.getRange(1, 15).setValue('USER_RESPONSABLE_PACKING');
        if (lastColPacking < 16) sheetPacking.getRange(1, 16).setValue('FECHA_INICIO_PACKING');
      }
      
      // Verificar si ya existe en PACKING
      var dataPacking = sheetPacking.getDataRange().getValues();
      var yaExisteEnPacking = false;
      for (var chk = 1; chk < dataPacking.length; chk++) {
        if (String(dataPacking[chk][1] || '').trim() === nVenta) {
          yaExisteEnPacking = true;
          break;
        }
      }
      
      if (!yaExisteEnPacking && sheetPicking) {
        var dataPicking = sheetPicking.getDataRange().getValues();
        var fechaFinPicking = new Date();
        var filasACopiarPacking = [];
        
        for (var pk = 1; pk < dataPicking.length; pk++) {
          if (String(dataPicking[pk][1] || '').trim() === nVenta) {
            // Obtener USER_RESPONSABLE del picking (columna 13, índice 12)
            var userPicking = String(dataPicking[pk][12] || usuario || '');
            var fechaInicioPicking = dataPicking[pk][13] || '';
            
            var filaPacking = [
              dataPicking[pk][0],           // A - Fecha Entrega
              dataPicking[pk][1],           // B - N.Venta
              'PENDIENTE PACKING',          // C - Estado
              dataPicking[pk][3],           // D - Cod.Cliente
              dataPicking[pk][4],           // E - Nombre Cliente
              dataPicking[pk][5],           // F - Cod.Vendedor
              dataPicking[pk][6],           // G - Nombre Vendedor
              dataPicking[pk][7],           // H - Zona
              dataPicking[pk][8],           // I - Cod.Producto
              dataPicking[pk][9],           // J - Descripcion Producto
              dataPicking[pk][10],          // K - Unidad Medida
              dataPicking[pk][11],          // L - Pedido
              userPicking,                  // M - USER_RESPONSABLE_PICKING
              fechaFinPicking,              // N - FECHA_FIN_PICKING
              '',                           // O - USER_RESPONSABLE_PACKING (se llena cuando inicie)
              ''                            // P - FECHA_INICIO_PACKING (se llena cuando inicie)
            ];
            
            filasACopiarPacking.push(filaPacking);
          }
        }
        
        if (filasACopiarPacking.length > 0) {
          for (var fp = 0; fp < filasACopiarPacking.length; fp++) {
            sheetPacking.appendRow(filasACopiarPacking[fp]);
          }
          SpreadsheetApp.flush();
          Logger.log('✅ Copiadas ' + filasACopiarPacking.length + ' filas a PACKING con USER_RESPONSABLE_PICKING: ' + usuario);
        }
      } else if (yaExisteEnPacking) {
        Logger.log('N.V ya existe en PACKING, omitiendo copia');
      }
      
    } catch (packingError) {
      Logger.log('⚠️ Error al copiar a PACKING: ' + packingError.message);
    }
    // ==================== FIN COPIAR DATOS A PACKING ====================
    
    // ============ MIGRACIONES AUTOMÁTICAS ============
    // NOTA: Las migraciones (PICKING → PACKING) ahora se ejecutan automáticamente
    // en cambiarEstadoNV() a través del OrquestadorMigraciones
    // Ya no es necesario llamar manualmente a moverPickingAPacking()
    Logger.log('✅ Migraciones ejecutadas automáticamente por el sistema');
    
    // CRÍTICO: Forzar actualización inmediata en hojas
    SpreadsheetApp.flush();
    
    // Invalidar caché para que el frontend vea los cambios inmediatamente
    if (typeof invalidateNVCache === 'function') {
      invalidateNVCache();
      Logger.log('✅ Caché invalidado');
    }
    
    var msgFinal = hayNoStock 
      ? 'Picking completado CON QUIEBRES DE STOCK. Revisar en Packing.' 
      : 'Picking completado correctamente. N.V movida a Packing.';
      
    Logger.log('===== PICKING COMPLETADO EXITOSAMENTE =====');
    Logger.log('Mensaje: ' + msgFinal);
    
    return {
      success: true,
      mensaje: msgFinal,
      estado: 'PENDIENTE PACKING',
      userResponsablePicking: usuario
    };
    
  } catch (e) {
    Logger.log('❌ ERROR CRÍTICO en completarPickingConReporte: ' + e.message);
    Logger.log('Stack: ' + e.stack);
    return { success: false, error: e.message };
  }
}

/**
 * Obtiene el detalle de una guía de picking con ubicaciones
 * @param {string} nVenta - Número de nota de venta
 * @returns {Object} - {success, guia, productos}
 */
function getDetalleGuiaPickingEnhanced(nVenta) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NV_DIARIAS_PICKING);
    
    if (!sheet) {
      return { success: false, error: 'Hoja N.V DIARIAS no encontrada' };
    }
    
    var data = sheet.getDataRange().getValues();
    var nVentaBuscada = String(nVenta).trim();
    var guiaInfo = null;
    var productos = [];
    
    // Optimización: cargar mapa de ubicaciones una vez
    var mapaUbicaciones = obtenerMapaUbicaciones();
    
    for (var i = 1; i < data.length; i++) {
      var nVentaFila = String(data[i][1] || '').trim();
      
      if (nVentaFila === nVentaBuscada) {
        if (!guiaInfo) {
          guiaInfo = {
            notaVenta: nVentaFila,
            fechaEntrega: data[i][0],
            estado: normalizarEstado(data[i][2]),
            cliente: String(data[i][4] || ''),
            vendedor: String(data[i][6] || ''),
            zona: String(data[i][7] || '')
          };
        }
        
        var codigoProducto = String(data[i][8] || '');
        var codigoKey = codigoProducto.trim().toUpperCase();
        var infoUbicaciones = mapaUbicaciones[codigoKey] || [];
        var ubicacionesStr = [];
        
        // Formatear ubicaciones para el frontend
        if (infoUbicaciones.length > 0) {
          for (var k = 0; k < infoUbicaciones.length; k++) {
            ubicacionesStr.push(infoUbicaciones[k].loc + ' (Stock: ' + infoUbicaciones[k].qty + ')');
          }
        } else {
          ubicacionesStr.push('SIN UBICACIÓN');
        }
        
        productos.push({
          codigo: codigoProducto,
          codigoProducto: codigoProducto,
          descripcion: String(data[i][9] || ''),
          unidadMedida: String(data[i][10] || ''),
          pedido: Number(data[i][11]) || 0,
          ubicaciones: ubicacionesStr,
          ubicacionPrincipal: ubicacionesStr[0] || 'SIN UBICACIÓN'
        });
      }
    }
    
    if (!guiaInfo) {
      return { success: false, error: 'Nota de venta no encontrada', code: 'E001' };
    }
    
    guiaInfo.productos = productos;
    guiaInfo.totalItems = productos.length;
    
    return {
      success: true,
      guia: guiaInfo,
      productos: productos
    };
    
  } catch (e) {
    Logger.log('Error en getDetalleGuiaPickingEnhanced: ' + e.message);
    return { success: false, error: e.message };
  }
}

/**
 * Obtiene N.V en estado EN_PICKING (en proceso)
 * @returns {Object} - {success, guias}
 */
function getGuiasEnPicking() {
  Logger.log('=== getGuiasEnPicking ===');
  var result = getNVPorEstado('EN_PICKING');
  Logger.log('getGuiasEnPicking resultado: ' + JSON.stringify(result));
  return result;
}


/**
 * Obtiene estadísticas generales del picking para el dashboard
 * @returns {Object} {success, pendientes, enPicking, completadas}
 */
function getPickingStats() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // 1. Pendientes (N.V DIARIAS)
    var pendientes = 0;
    var sheetNV = ss.getSheetByName(SHEET_NV_DIARIAS_PICKING);
    if (sheetNV) {
      // Optimización: leer solo columna C (Estado)
      var lastRow = sheetNV.getLastRow();
      if (lastRow > 1) {
        var estados = sheetNV.getRange(2, 3, lastRow - 1, 1).getValues();
        for (var i = 0; i < estados.length; i++) {
          if (normalizarEstado(estados[i][0]) === 'PENDIENTE_PICKING') {
            pendientes++;
          }
        }
      }
    }
    
    // 2. En Picking (Picking Log - Activos)
    var enPicking = 0;
    if (typeof getPickingsActivos === 'function') {
      var resultActivos = getPickingsActivos();
      if (resultActivos.success) {
        enPicking = resultActivos.total;
      }
    }
    
    // 3. Completadas Hoy (Picking Log)
    var completadas = 0;
    
    // Obtener estadísticas de hoy para el contador
    var hoy = new Date();
    var hoyStr = hoy.getFullYear() + '-' + (hoy.getMonth()+1).toString().padStart(2,'0') + '-' + hoy.getDate().toString().padStart(2,'0');
    
    if (typeof getEstadisticasPickingTodos === 'function') {
      var resultStats = getEstadisticasPickingTodos(hoyStr, hoyStr);
      if (resultStats.success && resultStats.resumen) {
        completadas = resultStats.resumen.pickingsCompletados;
      }
    }
    
    return {
      success: true,
      pendientes: pendientes,
      enPicking: enPicking,
      completadas: completadas
    };
    
  } catch (e) {
    Logger.log('Error en getPickingStats: ' + e.message);
    return { success: false, error: e.message };
  }
}

/**
 * Obtiene el rendimiento de usuarios de hoy
 */
function getDailyUserStats() {
  try {
    var hoy = new Date();
    var hoyStr = hoy.getFullYear() + '-' + (hoy.getMonth()+1).toString().padStart(2,'0') + '-' + hoy.getDate().toString().padStart(2,'0');
    return getEstadisticasPickingTodos(hoyStr, hoyStr);
  } catch (e) {
    return { success: false, error: e.message };
  }
}

/**
 * Obtiene datos para el monitor en tiempo real
 * Incluye pickings activos y su progreso
 */
function getMonitorData() {
  try {
    // 1. Obtener pickings activos del log
    var resultActivos = getPickingsActivos();
    if (!resultActivos.success) {
      return { success: false, error: resultActivos.error };
    }
    
    var activos = resultActivos.pickingsActivos;
    var monitorData = [];
    
    // 2. Enriquecer con progreso en tiempo real (cache)
    for (var i = 0; i < activos.length; i++) {
      var p = activos[i];
      var progresoResult = getPickingProgress(p.notaVenta);
      var itemsPickeados = 0;
      var totalItems = p.totalItems;
      
      if (progresoResult.success && progresoResult.progreso) {
        var prog = progresoResult.progreso;
        if (Array.isArray(prog)) {
          for (var k = 0; k < prog.length; k++) {
            var itemState = prog[k].estado;
            if (itemState && itemState !== 'PENDIENTE') {
              itemsPickeados++;
            }
          }
        }
      }
      
      monitorData.push({
        pickingId: p.pickingId,
        usuario: p.usuario,
        notaVenta: p.notaVenta,
        cliente: p.cliente,
        inicio: p.fechaInicio,
        duracionMin: p.duracionActualMin,
        totalItems: totalItems,
        itemsPickeados: itemsPickeados
      });
    }
    
    // 3. Obtener estadísticas de usuarios (Historial del día)
    var userStats = [];
    var hoy = new Date();
    var hoyStr = hoy.getFullYear() + '-' + (hoy.getMonth()+1).toString().padStart(2,'0') + '-' + hoy.getDate().toString().padStart(2,'0');
    
    if (typeof getEstadisticasPickingTodos === 'function') {
      var resultStats = getEstadisticasPickingTodos(hoyStr, hoyStr);
      if (resultStats.success && resultStats.usuarios) {
        userStats = resultStats.usuarios;
      }
    }
    
    return {
      success: true,
      data: monitorData,
      userStats: userStats,
      timestamp: new Date().toLocaleTimeString()
    };
    
  } catch (e) {
    return { success: false, error: e.message };
  }
}


/**
 * FUNCIÓN DE DIAGNÓSTICO COMPLETO DEL MÓDULO DE PICKING
 * Ejecutar desde el editor de Apps Script para verificar todo el flujo
 * Ver > Registros para ver los resultados
 */
function diagnosticoModuloPicking() {
  Logger.log('========================================');
  Logger.log('DIAGNÓSTICO COMPLETO - MÓDULO DE PICKING');
  Logger.log('========================================');
  Logger.log('Fecha: ' + new Date().toLocaleString());
  Logger.log('');
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var resultado = {
    hojas: {},
    funciones: {},
    datos: {},
    errores: []
  };
  
  // 1. VERIFICAR HOJAS
  Logger.log('1. VERIFICANDO HOJAS...');
  var hojasRequeridas = ['N.V DIARIAS', 'INGRESO', 'PICKING_LOG'];
  hojasRequeridas.forEach(function(nombre) {
    var sheet = ss.getSheetByName(nombre);
    var existe = !!sheet;
    var filas = sheet ? sheet.getLastRow() : 0;
    resultado.hojas[nombre] = { existe: existe, filas: filas };
    Logger.log('  - ' + nombre + ': ' + (existe ? 'OK (' + filas + ' filas)' : 'NO ENCONTRADA'));
    if (!existe && nombre !== 'PICKING_LOG') {
      resultado.errores.push('Hoja "' + nombre + '" no encontrada');
    }
  });
  Logger.log('');
  
  // 2. VERIFICAR ESTRUCTURA DE INGRESO
  Logger.log('2. VERIFICANDO ESTRUCTURA DE INGRESO...');
  var ingresoSheet = ss.getSheetByName('INGRESO');
  if (ingresoSheet && ingresoSheet.getLastRow() > 1) {
    var headers = ingresoSheet.getRange(1, 1, 1, 10).getValues()[0];
    Logger.log('  Headers de INGRESO:');
    Logger.log('    Columna A (índice 0): ' + headers[0]);
    Logger.log('    Columna B (índice 1): ' + headers[1]);
    Logger.log('    Columna I (índice 8): ' + headers[8]);
    Logger.log('    Columna J (índice 9): ' + headers[9]);
    
    // Leer primera fila de datos
    var primeraFila = ingresoSheet.getRange(2, 1, 1, 10).getValues()[0];
    Logger.log('  Primera fila de datos:');
    Logger.log('    Columna A (UBICACION): ' + primeraFila[0]);
    Logger.log('    Columna B (CODIGO): ' + primeraFila[1]);
    Logger.log('    Columna I (DESCRIPCION): ' + primeraFila[8]);
    Logger.log('    Columna J (CANTIDAD): ' + primeraFila[9]);
    
    resultado.datos.ingresoHeaders = headers;
    resultado.datos.ingresoPrimeraFila = primeraFila;
  }
  Logger.log('');
  
  // 3. VERIFICAR ESTADOS EN N.V DIARIAS
  Logger.log('3. VERIFICANDO ESTADOS EN N.V DIARIAS...');
  var nvSheet = ss.getSheetByName('N.V DIARIAS');
  if (nvSheet && nvSheet.getLastRow() > 1) {
    var estadosCount = {};
    var nvData = nvSheet.getRange(2, 3, nvSheet.getLastRow() - 1, 1).getValues();
    for (var i = 0; i < nvData.length; i++) {
      var estado = String(nvData[i][0] || '').trim();
      if (estado) {
        estadosCount[estado] = (estadosCount[estado] || 0) + 1;
      }
    }
    Logger.log('  Estados encontrados:');
    for (var est in estadosCount) {
      Logger.log('    - ' + est + ': ' + estadosCount[est] + ' filas');
    }
    resultado.datos.estadosEncontrados = estadosCount;
  }
  Logger.log('');
  
  // 4. PROBAR FUNCIONES PRINCIPALES
  Logger.log('4. PROBANDO FUNCIONES PRINCIPALES...');
  
  // 4.1 getResumenDesdeHojas
  try {
    var resumen = getResumenDesdeHojas();
    Logger.log('  ✓ getResumenDesdeHojas: OK');
    Logger.log('    - Pendiente Picking: ' + resumen.resumen.pendientePicking);
    Logger.log('    - En Picking: ' + resumen.resumen.enPicking);
    Logger.log('    - En Packing: ' + resumen.resumen.enPacking);
    Logger.log('    - Listo Despacho: ' + resumen.resumen.listoDespacho);
    resultado.funciones.getResumenDesdeHojas = 'OK';
    resultado.datos.resumen = resumen.resumen;
  } catch (e) {
    Logger.log('  ✗ getResumenDesdeHojas: ERROR - ' + e.message);
    resultado.funciones.getResumenDesdeHojas = 'ERROR: ' + e.message;
    resultado.errores.push('getResumenDesdeHojas falló: ' + e.message);
  }
  
  // 4.2 getGuiasDesdeHojaPicking
  try {
    var guias = getGuiasDesdeHojaPicking();
    Logger.log('  ✓ getGuiasDesdeHojaPicking: OK');
    Logger.log('    - Total guías: ' + (guias.guias ? guias.guias.length : 0));
    if (guias.guias && guias.guias.length > 0) {
      Logger.log('    - Primera guía: N.V ' + guias.guias[0].notaVenta + ', Cliente: ' + guias.guias[0].cliente);
    }
    resultado.funciones.getGuiasDesdeHojaPicking = 'OK (' + (guias.guias ? guias.guias.length : 0) + ' guías)';
    resultado.datos.totalGuiasPendientes = guias.guias ? guias.guias.length : 0;
  } catch (e) {
    Logger.log('  ✗ getGuiasDesdeHojaPicking: ERROR - ' + e.message);
    resultado.funciones.getGuiasDesdeHojaPicking = 'ERROR: ' + e.message;
    resultado.errores.push('getGuiasDesdeHojaPicking falló: ' + e.message);
  }
  
  // 4.3 getGuiasEnPicking
  try {
    var enPicking = getGuiasEnPicking();
    Logger.log('  ✓ getGuiasEnPicking: OK');
    Logger.log('    - Total en picking: ' + (enPicking.ordenes ? enPicking.ordenes.length : 0));
    resultado.funciones.getGuiasEnPicking = 'OK (' + (enPicking.ordenes ? enPicking.ordenes.length : 0) + ' en proceso)';
    resultado.datos.totalEnPicking = enPicking.ordenes ? enPicking.ordenes.length : 0;
  } catch (e) {
    Logger.log('  ✗ getGuiasEnPicking: ERROR - ' + e.message);
    resultado.funciones.getGuiasEnPicking = 'ERROR: ' + e.message;
    resultado.errores.push('getGuiasEnPicking falló: ' + e.message);
  }
  
  // 4.4 Probar búsqueda de ubicaciones con un código real
  if (ingresoSheet && ingresoSheet.getLastRow() > 1) {
    var codigoPrueba = ingresoSheet.getRange(2, 2).getValue(); // Columna B = CODIGO
    if (codigoPrueba) {
      try {
        var ubicaciones = buscarUbicacionesProducto(codigoPrueba);
        Logger.log('  ✓ buscarUbicacionesProducto: OK');
        Logger.log('    - Código probado: ' + codigoPrueba);
        Logger.log('    - Ubicaciones encontradas: ' + (ubicaciones.ubicaciones ? ubicaciones.ubicaciones.join(', ') : 'ninguna'));
        resultado.funciones.buscarUbicacionesProducto = 'OK (código: ' + codigoPrueba + ')';
        resultado.datos.ubicacionesPrueba = ubicaciones.ubicaciones;
      } catch (e) {
        Logger.log('  ✗ buscarUbicacionesProducto: ERROR - ' + e.message);
        resultado.funciones.buscarUbicacionesProducto = 'ERROR: ' + e.message;
        resultado.errores.push('buscarUbicacionesProducto falló: ' + e.message);
      }
    }
  }
  
  // 4.5 Probar getDetalleGuiaConUbicaciones con una N.V real
  if (guias && guias.guias && guias.guias.length > 0) {
    var nvPrueba = guias.guias[0].notaVenta;
    try {
      var detalle = getDetalleGuiaConUbicaciones(nvPrueba);
      Logger.log('  ✓ getDetalleGuiaConUbicaciones: OK');
      Logger.log('    - N.V probada: ' + nvPrueba);
      Logger.log('    - Productos: ' + (detalle.productos ? detalle.productos.length : 0));
      if (detalle.productos && detalle.productos.length > 0) {
        Logger.log('    - Primer producto: ' + detalle.productos[0].codigo + ' - ' + detalle.productos[0].descripcion);
        Logger.log('    - Ubicaciones: ' + (detalle.productos[0].ubicaciones ? detalle.productos[0].ubicaciones.join(', ') : 'ninguna'));
      }
      resultado.funciones.getDetalleGuiaConUbicaciones = 'OK (N.V: ' + nvPrueba + ')';
    } catch (e) {
      Logger.log('  ✗ getDetalleGuiaConUbicaciones: ERROR - ' + e.message);
      resultado.funciones.getDetalleGuiaConUbicaciones = 'ERROR: ' + e.message;
      resultado.errores.push('getDetalleGuiaConUbicaciones falló: ' + e.message);
    }
  }
  
  Logger.log('');
  Logger.log('========================================');
  Logger.log('RESUMEN DEL DIAGNÓSTICO');
  Logger.log('========================================');
  Logger.log('Total errores encontrados: ' + resultado.errores.length);
  if (resultado.errores.length > 0) {
    Logger.log('ERRORES:');
    resultado.errores.forEach(function(err) {
      Logger.log('  - ' + err);
    });
  } else {
    Logger.log('✓ No se encontraron errores críticos');
  }
  Logger.log('');
  Logger.log('Para ver el resultado completo, revisa los logs arriba.');
  Logger.log('========================================');
  
  return resultado;
}

/**
 * FUNCIÓN DE PRUEBA - Ejecutar desde el editor de Apps Script
 * Verifica que getGuiasEnPicking funciona correctamente
 */
function testGetGuiasEnPicking() {
  Logger.log('=== TEST getGuiasEnPicking ===');
  
  // 1. Verificar que getNVPorEstado funciona
  var result = getNVPorEstado('EN_PICKING');
  Logger.log('Resultado getNVPorEstado(EN_PICKING): ' + JSON.stringify(result, null, 2));
  
  if (result.success) {
    Logger.log('Total órdenes EN_PICKING: ' + result.total);
    if (result.ordenes && result.ordenes.length > 0) {
      for (var i = 0; i < result.ordenes.length; i++) {
        Logger.log('  - N.V: ' + result.ordenes[i].notaVenta + ', Cliente: ' + result.ordenes[i].cliente);
      }
    }
  } else {
    Logger.log('ERROR: ' + result.error);
  }
  
  // 2. Verificar conteos por estado
  var conteos = getConteosPorEstado();
  Logger.log('Conteos por estado: ' + JSON.stringify(conteos, null, 2));
  
  return result;
}

/**
 * FUNCIÓN DE PRUEBA - Verificar estado de una N.V específica
 * @param {string} nVenta - Número de N.V a verificar
 */
function testVerificarEstadoNV(nVenta) {
  if (!nVenta) {
    Logger.log('ERROR: Proporciona un número de N.V');
    return;
  }
  
  Logger.log('=== TEST Verificar Estado N.V: ' + nVenta + ' ===');
  
  var estado = getEstadoNV(nVenta);
  Logger.log('Estado: ' + JSON.stringify(estado, null, 2));
  
  return estado;
}