/**
 * PackingEnhanced.gs - Módulo de Packing Mejorado
 * Lee datos de N.V DIARIAS (columnas A,B,E,G,I,J,K,L)
 * Gestiona órdenes en estado PK (Packing Area)
 */

var SHEET_NV_DIARIAS_PACKING = 'N.V DIARIAS';

/**
 * Obtiene las órdenes en área de packing (estado PK/Packing)
 * @returns {Object} - {success, ordenes, resumenClientes}
 */
function getOrdenesPackingEnhanced() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NV_DIARIAS_PACKING);
    
    if (!sheet) {
      Logger.log('ERROR: Hoja N.V DIARIAS no encontrada');
      return { success: false, error: 'Hoja N.V DIARIAS no encontrada' };
    }
    
    var lastRow = sheet.getLastRow();
    Logger.log('getOrdenesPackingEnhanced - lastRow: ' + lastRow);
    
    if (lastRow <= 1) {
      return { success: true, ordenes: [], total: 0, resumenClientes: { total: 0, clientes: [] } };
    }
    
    var data = sheet.getRange(2, 1, lastRow - 1, 12).getValues();
    var ordenesMap = {};
    var clientesUnicos = {};
    
    Logger.log('Buscando órdenes en estado Packing/PK...');
    
    for (var i = 0; i < data.length; i++) {
      var row = data[i];
      var estadoRaw = String(row[2] || '').trim(); // Columna C
      var estadoUpper = estadoRaw.toUpperCase().replace(/\s+/g, '_');
      
      // Filtrar estado PK o PACKING (cualquier variante)
      var esPacking = (estadoUpper === 'PK' || estadoUpper === 'PACKING' || estadoRaw === 'Packing');
      
      if (!esPacking) {
        continue;
      }
      
      var nVenta = String(row[1] || '').trim(); // Columna B
      if (!nVenta) continue;
      
      Logger.log('Encontrada N.V en Packing: ' + nVenta + ' (estado: ' + estadoRaw + ')');
      
      var cliente = String(row[4] || '').trim();     // Columna E
      var codCliente = String(row[3] || '').trim();  // Columna D
      
      // Contar clientes únicos
      if (codCliente && !clientesUnicos[codCliente]) {
        clientesUnicos[codCliente] = {
          codigo: codCliente,
          nombre: cliente,
          ordenes: 0
        };
      }
      
      if (!ordenesMap[nVenta]) {
        // Formatear fecha
        var fechaStr = '';
        try {
          if (row[0] instanceof Date) {
            fechaStr = Utilities.formatDate(row[0], Session.getScriptTimeZone(), 'dd/MM/yyyy');
          } else if (row[0]) {
            fechaStr = String(row[0]);
          }
        } catch (fe) {
          fechaStr = String(row[0] || '');
        }
        
        ordenesMap[nVenta] = {
          notaVenta: nVenta,
          fechaEntrega: fechaStr,
          estado: 'PK',
          codCliente: codCliente,
          cliente: cliente,
          codVendedor: String(row[5] || ''),
          vendedor: String(row[6] || ''),
          zona: String(row[7] || ''),
          productos: [],
          totalItems: 0
        };
        
        if (clientesUnicos[codCliente]) {
          clientesUnicos[codCliente].ordenes++;
        }
      }
      
      ordenesMap[nVenta].productos.push({
        codigo: String(row[8] || ''),
        descripcion: String(row[9] || ''),
        unidadMedida: String(row[10] || ''),
        pedido: Number(row[11]) || 0,
        rowIndex: i + 2
      });
      
      ordenesMap[nVenta].totalItems++;
    }
    
    // Convertir map a array (compatible ES5)
    var ordenes = [];
    for (var key in ordenesMap) {
      if (ordenesMap.hasOwnProperty(key)) {
        ordenes.push(ordenesMap[key]);
      }
    }
    
    var clientes = [];
    for (var ckey in clientesUnicos) {
      if (clientesUnicos.hasOwnProperty(ckey)) {
        clientes.push(clientesUnicos[ckey]);
      }
    }
    
    // Ordenar por fecha de entrega
    ordenes.sort(function(a, b) {
      return String(a.fechaEntrega || '').localeCompare(String(b.fechaEntrega || ''));
    });
    
    // Ordenar clientes por cantidad de órdenes
    clientes.sort(function(a, b) {
      return b.ordenes - a.ordenes;
    });
    
    Logger.log('getOrdenesPackingEnhanced - Total órdenes: ' + ordenes.length + ', Clientes: ' + clientes.length);
    
    return {
      success: true,
      ordenes: ordenes,
      total: ordenes.length,
      resumenClientes: {
        total: clientes.length,
        clientes: clientes
      }
    };
    
  } catch (e) {
    Logger.log('Error en getOrdenesPackingEnhanced: ' + e.message);
    return { success: false, error: 'Error al obtener órdenes: ' + e.message };
  }
}

/**
 * Obtiene el detalle de una orden para packing
 * @param {string} nVenta - Número de nota de venta
 * @returns {Object} - {success, orden, productos}
 */
function getDetalleOrdenPacking(nVenta) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NV_DIARIAS_PACKING);
    
    if (!sheet) {
      return { success: false, error: 'Hoja N.V DIARIAS no encontrada' };
    }
    
    var data = sheet.getDataRange().getValues();
    var nVentaBuscada = String(nVenta).trim();
    var ordenInfo = null;
    var productos = [];
    
    for (var i = 1; i < data.length; i++) {
      var nVentaFila = String(data[i][1] || '').trim();
      
      if (nVentaFila === nVentaBuscada) {
        if (!ordenInfo) {
          ordenInfo = {
            notaVenta: nVentaFila,
            fechaEntrega: data[i][0],
            estado: normalizarEstado(data[i][2]),
            cliente: String(data[i][4] || ''),
            codVendedor: String(data[i][5] || ''),
            vendedor: String(data[i][6] || ''),
            zona: String(data[i][7] || '')
          };
        }
        
        productos.push({
          codigo: String(data[i][8] || ''),
          descripcion: String(data[i][9] || ''),
          unidadMedida: String(data[i][10] || ''),
          pedido: Number(data[i][11]) || 0
        });
      }
    }
    
    if (!ordenInfo) {
      return { success: false, error: 'Nota de venta no encontrada', code: 'E001' };
    }
    
    ordenInfo.productos = productos;
    ordenInfo.totalItems = productos.length;
    
    return {
      success: true,
      orden: ordenInfo,
      productos: productos
    };
    
  } catch (e) {
    Logger.log('Error en getDetalleOrdenPacking: ' + e.message);
    return { success: false, error: e.message };
  }
}

/**
 * Inicia el proceso de packing para una N.V
 * REGISTRA EL INICIO EN PACKING_LOG
 * @param {string} nVenta - Número de nota de venta
 * @param {string} usuario - Usuario que inicia el packing
 * @returns {Object} - {success, packingId}
 */
function iniciarPackingEnhanced(nVenta, usuario) {
  try {
    // Verificar estado actual
    var estadoActual = getEstadoNV(nVenta);
    if (!estadoActual.success) {
      return estadoActual;
    }
    
    if (estadoActual.estado !== 'PK') {
      return { 
        success: false, 
        error: 'La N.V debe estar en estado PK para iniciar packing. Estado actual: ' + estadoActual.estado,
        code: 'E002'
      };
    }
    
    // Obtener info de la orden
    var detalleResult = getDetalleOrdenPacking(nVenta);
    var cliente = detalleResult.success ? detalleResult.orden.cliente : '';
    var totalItems = detalleResult.success ? detalleResult.productos.length : 0;
    
    // REGISTRAR INICIO DE PACKING EN LOG
    var logResult = registrarInicioPacking(nVenta, usuario, cliente, totalItems);
    if (!logResult.success) {
      return logResult;
    }
    
    Logger.log('Packing iniciado para N.V ' + nVenta + ' por ' + usuario);
    
    return {
      success: true,
      notaVenta: nVenta,
      packingId: logResult.packingId,
      cliente: cliente,
      totalItems: totalItems,
      mensaje: 'Packing iniciado correctamente'
    };
    
  } catch (e) {
    Logger.log('Error en iniciarPackingEnhanced: ' + e.message);
    return { success: false, error: 'Error al iniciar packing: ' + e.message };
  }
}

/**
 * Completa el packing de una N.V
 * Cambia estado a LISTO_DESPACHO y elimina de hoja PACKING
 * REGISTRA LA FINALIZACIÓN EN PACKING_LOG
 * @param {string} nVenta - Número de nota de venta
 * @param {Object} datosEmpaque - {bultos, pallets, observaciones}
 * @param {string} usuario - Usuario que completa el packing
 * @returns {Object} - {success, mensaje}
 */
function completarPackingEnhanced(nVenta, datosEmpaque, usuario) {
  try {
    // Verificar estado actual
    var estadoActual = getEstadoNV(nVenta);
    if (!estadoActual.success) {
      return estadoActual;
    }
    
    if (estadoActual.estado !== 'PK') {
      return { 
        success: false, 
        error: 'La N.V debe estar en estado PK para completar packing. Estado actual: ' + estadoActual.estado,
        code: 'E002'
      };
    }
    
    // REGISTRAR FIN DE PACKING EN LOG
    var bultos = datosEmpaque ? datosEmpaque.bultos : 0;
    var pallets = datosEmpaque ? datosEmpaque.pallets : 0;
    var observaciones = datosEmpaque ? datosEmpaque.observaciones : '';
    
    var logResult = registrarFinPackingLog(nVenta, usuario, bultos, pallets, observaciones);
    if (logResult.success) {
      Logger.log('Packing registrado en log: ' + JSON.stringify(logResult));
    }
    
    // Cambiar estado a LISTO_DESPACHO
    var cambio = cambiarEstadoNV(nVenta, 'LISTO_DESPACHO', usuario);
    if (!cambio.success) {
      return cambio;
    }
    
    // Eliminar de hoja PACKING
    eliminarDeHojaPacking(nVenta);
    
    // Registrar datos de empaque en MOVIMIENTOS
    if (datosEmpaque) {
      registrarDatosEmpaque(nVenta, datosEmpaque, usuario);
    }
    
    Logger.log('Packing completado para N.V ' + nVenta + ' - Bultos: ' + bultos + ', Pallets: ' + pallets);
    
    return {
      success: true,
      notaVenta: nVenta,
      nuevoEstado: 'LISTO_DESPACHO',
      datosEmpaque: datosEmpaque,
      duracionMinutos: logResult.duracionMinutos || 0,
      mensaje: 'PEDIDO EN ZONA FT - ' + bultos + ' Bultos listos para despacho.'
    };
    
  } catch (e) {
    Logger.log('Error en completarPackingEnhanced: ' + e.message);
    return { success: false, error: 'Error al completar packing: ' + e.message };
  }
}

/**
 * Elimina una N.V de la hoja PACKING cuando se completa
 */
function eliminarDeHojaPacking(nVenta) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('PACKING');
    
    if (!sheet) return;
    
    var data = sheet.getDataRange().getValues();
    var nVentaBuscada = String(nVenta).trim();
    var filasAEliminar = [];
    
    for (var i = data.length - 1; i >= 1; i--) {
      if (String(data[i][1] || '').trim() === nVentaBuscada) {
        filasAEliminar.push(i + 1);
      }
    }
    
    // Eliminar de abajo hacia arriba
    for (var j = 0; j < filasAEliminar.length; j++) {
      sheet.deleteRow(filasAEliminar[j]);
    }
    
    SpreadsheetApp.flush();
    Logger.log('Eliminadas ' + filasAEliminar.length + ' filas de N.V ' + nVenta + ' de hoja PACKING');
    
  } catch (e) {
    Logger.log('Error al eliminar de PACKING: ' + e.message);
  }
}

/**
 * Registra los datos de empaque en MOVIMIENTOS
 */
function registrarDatosEmpaque(nVenta, datosEmpaque, usuario) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('MOVIMIENTOS');
    
    if (!sheet) return;
    
    var id = 'EMP-' + new Date().getTime();
    var referencia = 'ZONA FT - Bultos: ' + (datosEmpaque.bultos || 0);
    referencia += ', Pallets: ' + (datosEmpaque.pallets || 0);
    if (datosEmpaque.observaciones) {
      referencia += ', Obs: ' + datosEmpaque.observaciones;
    }
    
    sheet.appendRow([
      id,
      new Date(),
      'PACKING_COMPLETADO_ZONA_FT',
      nVenta,
      datosEmpaque.bultos || 0,
      datosEmpaque.pallets || 0,
      referencia,
      usuario || 'Sistema'
    ]);
    
    Logger.log('Registrado empaque N.V ' + nVenta + ': ' + referencia);
    
  } catch (e) {
    Logger.log('Error al registrar datos de empaque: ' + e.message);
  }
}

/**
 * Obtiene el resumen de estados para el dashboard
 * @returns {Object} - {success, resumen}
 */
// NOTA: Renombrada - usar version de StateManager.gs
function getResumenEstadosNVPacking() {
  var conteos = getConteosPorEstado();
  if (!conteos.success) return conteos;
  
  return {
    success: true,
    resumen: {
      pendienteAprobacion: conteos.conteos['PENDIENTE_APROBACION'] || 0,
      aprobadas: conteos.conteos['APROBADA'] || 0,
      pendientePicking: conteos.conteos['PENDIENTE_PICKING'] || 0,
      enPicking: conteos.conteos['EN_PICKING'] || 0,
      enPacking: conteos.conteos['PK'] || 0,
      listoDespacho: conteos.conteos['LISTO_DESPACHO'] || 0
    },
    total: conteos.total
  };
}


/**
 * Obtiene o crea la hoja Despachos con la estructura correcta
 * Headers: Fecha Packing, N.V, Fecha Entrega, Cliente, Bultos, Pallets, Peso Bulto, Peso con Pallet, Usuario, Estado
 * @returns {Sheet} - Hoja Despachos
 */
function getOrCreateDespachosSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Despachos');
  
  if (!sheet) {
    sheet = ss.insertSheet('Despachos');
    
    // Headers
    var headers = [
      'Fecha Packing',  // A
      'N.V',            // B
      'Fecha Entrega',  // C
      'Cliente',        // D
      'Bultos',         // E
      'Pallets',        // F
      'Peso Bulto',     // G
      'Peso con Pallet',// H
      'Usuario',        // I
      'Estado'          // J
    ];
    
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    
    // Formato headers
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground('#1a73e8');
    headerRange.setFontColor('#ffffff');
    headerRange.setFontWeight('bold');
    headerRange.setHorizontalAlignment('center');
    
    // Ajustar anchos de columna
    sheet.setColumnWidth(1, 120); // Fecha Packing
    sheet.setColumnWidth(2, 100); // N.V
    sheet.setColumnWidth(3, 120); // Fecha Entrega
    sheet.setColumnWidth(4, 200); // Cliente
    sheet.setColumnWidth(5, 80);  // Bultos
    sheet.setColumnWidth(6, 80);  // Pallets
    sheet.setColumnWidth(7, 100); // Peso Bulto
    sheet.setColumnWidth(8, 120); // Peso con Pallet
    sheet.setColumnWidth(9, 120); // Usuario
    sheet.setColumnWidth(10, 120);// Estado
    
    // Congelar fila de headers
    sheet.setFrozenRows(1);
    
    Logger.log('Hoja Despachos creada con estructura correcta');
  }
  
  return sheet;
}

/**
 * Copia datos de una N.V completada a la hoja Despachos
 * @param {string} nVenta - Número de nota de venta
 * @param {Object} datosEmpaque - {bultos, pallets, pesoBulto, pesoBultoPallet}
 * @param {string} usuario - Usuario que completa el packing
 * @returns {Object} - {success, mensaje}
 */
function copiarADespachos(nVenta, datosEmpaque, usuario) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheetNV = ss.getSheetByName(SHEET_NV_DIARIAS_PACKING);
    
    if (!sheetNV) {
      return { success: false, error: 'Hoja N.V DIARIAS no encontrada' };
    }
    
    // Buscar datos de la N.V
    var data = sheetNV.getDataRange().getValues();
    var nVentaBuscada = String(nVenta).trim();
    var ordenInfo = null;
    
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][1] || '').trim() === nVentaBuscada) {
        ordenInfo = {
          fechaEntrega: data[i][0],
          cliente: String(data[i][4] || '').trim()
        };
        break;
      }
    }
    
    if (!ordenInfo) {
      return { success: false, error: 'N.V no encontrada en N.V DIARIAS' };
    }
    
    // Obtener o crear hoja Despachos
    var sheetDespachos = getOrCreateDespachosSheet();
    
    // Formatear fechas
    var fechaPacking = new Date();
    var fechaEntrega = ordenInfo.fechaEntrega;
    
    // Preparar fila de datos
    var nuevaFila = [
      fechaPacking,                           // A: Fecha Packing
      nVenta,                                 // B: N.V
      fechaEntrega,                           // C: Fecha Entrega
      ordenInfo.cliente,                      // D: Cliente
      datosEmpaque.bultos || 0,               // E: Bultos
      datosEmpaque.pallets || 0,              // F: Pallets
      datosEmpaque.pesoBulto || 0,            // G: Peso Bulto
      datosEmpaque.pesoBultoPallet || 0,      // H: Peso con Pallet
      usuario || 'Sistema',                   // I: Usuario
      'PENDIENTE'                             // J: Estado
    ];
    
    sheetDespachos.appendRow(nuevaFila);
    SpreadsheetApp.flush();
    
    Logger.log('N.V ' + nVenta + ' copiada a Despachos');
    
    return {
      success: true,
      notaVenta: nVenta,
      mensaje: 'Datos copiados a hoja Despachos'
    };
    
  } catch (e) {
    Logger.log('Error en copiarADespachos: ' + e.message);
    return { success: false, error: 'Error al copiar a Despachos: ' + e.message };
  }
}

/**
 * Completa el packing y envía a Despachos (NUEVO FLUJO)
 * Cambia estado a PENDIENTE_SHIPPING y copia datos a hoja Despachos
 * @param {string} nVenta - Número de nota de venta
 * @param {Object} datosEmpaque - {bultos, pallets, pesoBulto, pesoBultoPallet, observaciones}
 * @param {string} usuario - Usuario que completa el packing
 * @returns {Object} - {success, mensaje}
 */
function completarPackingYDespachar(nVenta, datosEmpaque, usuario) {
  try {
    // Validar parámetros
    if (!nVenta || String(nVenta).trim() === '') {
      return { success: false, error: 'Número de N.V requerido' };
    }
    
    // Validar datos de empaque
    var bultos = parseInt(datosEmpaque.bultos) || 0;
    var pallets = parseInt(datosEmpaque.pallets) || 0;
    var pesoBulto = parseFloat(datosEmpaque.pesoBulto) || 0;
    var pesoBultoPallet = parseFloat(datosEmpaque.pesoBultoPallet) || 0;
    
    if (bultos < 1) {
      return { success: false, error: 'Debe ingresar al menos 1 bulto' };
    }
    
    // Verificar estado actual
    var estadoActual = getEstadoNV(nVenta);
    if (!estadoActual.success) {
      return estadoActual;
    }
    
    if (estadoActual.estado !== 'PK') {
      return { 
        success: false, 
        error: 'La N.V debe estar en estado PK para completar packing. Estado actual: ' + estadoActual.estado,
        code: 'E002'
      };
    }
    
    // Preparar datos normalizados
    var datosNormalizados = {
      bultos: bultos,
      pallets: pallets,
      pesoBulto: pesoBulto,
      pesoBultoPallet: pesoBultoPallet,
      observaciones: datosEmpaque.observaciones || ''
    };
    
    // REGISTRAR FIN DE PACKING EN LOG
    var logResult = registrarFinPackingLog(nVenta, usuario, bultos, pallets, datosNormalizados.observaciones);
    if (logResult.success) {
      Logger.log('Packing registrado en log: ' + JSON.stringify(logResult));
    }
    
    // Copiar a hoja Despachos ANTES de cambiar estado
    var copiaResult = copiarADespachos(nVenta, datosNormalizados, usuario);
    if (!copiaResult.success) {
      Logger.log('Advertencia: No se pudo copiar a Despachos: ' + copiaResult.error);
      // Continuar de todas formas
    }
    
    // Cambiar estado a PENDIENTE_SHIPPING
    var cambio = cambiarEstadoNV(nVenta, 'PENDIENTE_SHIPPING', usuario);
    if (!cambio.success) {
      return cambio;
    }
    
    // Eliminar de hoja PACKING
    eliminarDeHojaPacking(nVenta);
    
    // Registrar datos de empaque en MOVIMIENTOS
    registrarDatosEmpaque(nVenta, datosNormalizados, usuario);
    
    Logger.log('Packing completado para N.V ' + nVenta + ' - Estado: PENDIENTE_SHIPPING');
    
    return {
      success: true,
      notaVenta: nVenta,
      nuevoEstado: 'PENDIENTE_SHIPPING',
      datosEmpaque: datosNormalizados,
      duracionMinutos: logResult.duracionMinutos || 0,
      copiadoADespachos: copiaResult.success,
      mensaje: 'Packing completado - N.V lista para despacho'
    };
    
  } catch (e) {
    Logger.log('Error en completarPackingYDespachar: ' + e.message);
    return { success: false, error: 'Error al completar packing: ' + e.message };
  }
}
