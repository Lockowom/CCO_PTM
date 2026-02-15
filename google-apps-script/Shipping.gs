/**
 * Shipping.gs - Módulo de Despachos y Entregas
 * Gestiona el flujo completo desde PENDIENTE_SHIPPING hasta ENTREGADO
 * 
 * ESTRUCTURA HOJA DESPACHOS (14 columnas):
 * A-Fecha Docto, B-Cliente, C-Facturas, D-Guía, E-Bultos, F-Empresa Transporte,
 * G-Transportista, H-N° NV, I-División, J-Vendedor, K-Fecha Despacho, L-N° Envío,
 * M-Fecha Creación, N-Estado
 * 
 * ESTRUCTURA HOJA ENTREGAS (10 columnas):
 * A-N.V, B-Factura/GD, C-Recepción, D-Transportista, E-Estado,
 * F-Persona Recibe, G-Observaciones, H-Foto URL, I-Fecha Entrega, J-Usuario
 */

var SHEET_DESPACHOS = 'Despachos';
var SHEET_ENTREGAS_SHIP = 'Entregas';
var SHEET_NV_DIARIAS_SHIP = 'N.V DIARIAS';

var ESTADOS_ENTREGA_SHIP = ['PENDIENTE', 'EN RUTA', 'EN CAMINO', 'ENTREGADO', 'RECHAZADO', 'REPROGRAMADO'];

// ==================== FUNCIONES PARA DESPACHOS ====================

/**
 * Obtiene N.V en estado PENDIENTE_SHIPPING para crear despachos
 * @returns {Object} {success, ordenes}
 */
function getNVPendientesShipping() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NV_DIARIAS_SHIP);
    
    if (!sheet) {
      return { success: false, error: 'Hoja N.V DIARIAS no encontrada' };
    }
    
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      return { success: true, ordenes: [], total: 0 };
    }
    
    var data = sheet.getRange(2, 1, lastRow - 1, 12).getValues();
    var ordenesMap = {};
    
    for (var i = 0; i < data.length; i++) {
      var row = data[i];
      var estadoRaw = String(row[2] || '').trim().toUpperCase().replace(/\s+/g, '_');
      
      // Filtrar PENDIENTE_SHIPPING o LISTO_DESPACHO
      if (estadoRaw !== 'PENDIENTE_SHIPPING' && estadoRaw !== 'LISTO_DESPACHO') {
        continue;
      }
      
      var nVenta = String(row[1] || '').trim();
      if (!nVenta) continue;
      
      if (!ordenesMap[nVenta]) {
        var fechaStr = '';
        try {
          if (row[0] instanceof Date) {
            fechaStr = Utilities.formatDate(row[0], Session.getScriptTimeZone(), 'dd/MM/yyyy');
          } else if (row[0]) {
            fechaStr = String(row[0]);
          }
        } catch (e) {
          fechaStr = String(row[0] || '');
        }
        
        ordenesMap[nVenta] = {
          nVenta: nVenta,
          fechaDocto: fechaStr,
          cliente: String(row[4] || '').trim(),
          codCliente: String(row[3] || '').trim(),
          vendedor: String(row[6] || '').trim(),
          codVendedor: String(row[5] || '').trim(),
          zona: String(row[7] || '').trim(),
          estado: estadoRaw,
          productos: [],
          totalItems: 0
        };
      }
      
      ordenesMap[nVenta].productos.push({
        codigo: String(row[8] || ''),
        descripcion: String(row[9] || ''),
        unidadMedida: String(row[10] || ''),
        pedido: Number(row[11]) || 0
      });
      ordenesMap[nVenta].totalItems++;
    }
    
    // Obtener bultos desde hoja Despachos (si ya existe registro parcial)
    var sheetDespachos = ss.getSheetByName(SHEET_DESPACHOS);
    if (sheetDespachos && sheetDespachos.getLastRow() > 1) {
      var dataDespachos = sheetDespachos.getRange(2, 1, sheetDespachos.getLastRow() - 1, 14).getValues();
      for (var d = 0; d < dataDespachos.length; d++) {
        var nvDespacho = String(dataDespachos[d][7] || '').trim(); // Columna H = N° NV
        if (ordenesMap[nvDespacho]) {
          ordenesMap[nvDespacho].bultos = dataDespachos[d][4] || 1; // Columna E = Bultos
        }
      }
    }
    
    var ordenes = [];
    for (var key in ordenesMap) {
      if (ordenesMap.hasOwnProperty(key)) {
        ordenes.push(ordenesMap[key]);
      }
    }
    
    ordenes.sort(function(a, b) {
      return String(a.fechaDocto || '').localeCompare(String(b.fechaDocto || ''));
    });
    
    return {
      success: true,
      ordenes: ordenes,
      total: ordenes.length
    };
    
  } catch (e) {
    Logger.log('Error en getNVPendientesShipping: ' + e.message);
    return { success: false, error: e.message };
  }
}

/**
 * Obtiene datos de una N.V para prellenar el formulario de despacho
 * @param {string} nVenta - Número de N.V
 * @returns {Object} {success, datos}
 */
function getDatosNVParaDespacho(nVenta) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // Buscar en N.V DIARIAS
    var sheetNV = ss.getSheetByName(SHEET_NV_DIARIAS_SHIP);
    if (!sheetNV) {
      return { success: false, error: 'Hoja N.V DIARIAS no encontrada' };
    }
    
    var dataNV = sheetNV.getDataRange().getValues();
    var nVentaBuscada = String(nVenta).trim();
    var datosNV = null;
    
    for (var i = 1; i < dataNV.length; i++) {
      if (String(dataNV[i][1] || '').trim() === nVentaBuscada) {
        var fechaStr = '';
        try {
          if (dataNV[i][0] instanceof Date) {
            fechaStr = Utilities.formatDate(dataNV[i][0], Session.getScriptTimeZone(), 'dd-MM-yyyy HH:mm');
          } else {
            fechaStr = String(dataNV[i][0] || '');
          }
        } catch (e) {
          fechaStr = String(dataNV[i][0] || '');
        }
        
        datosNV = {
          nVenta: nVentaBuscada,
          fechaDocto: fechaStr,
          cliente: String(dataNV[i][4] || '').trim(),
          vendedor: String(dataNV[i][6] || '').trim()
        };
        break;
      }
    }
    
    if (!datosNV) {
      return { success: false, error: 'N.V no encontrada' };
    }
    
    // Buscar bultos en hoja Despachos (si existe registro previo de packing)
    var sheetDespachos = ss.getSheetByName(SHEET_DESPACHOS);
    if (sheetDespachos && sheetDespachos.getLastRow() > 1) {
      var dataDespachos = sheetDespachos.getRange(2, 1, sheetDespachos.getLastRow() - 1, 14).getValues();
      for (var d = 0; d < dataDespachos.length; d++) {
        if (String(dataDespachos[d][7] || '').trim() === nVentaBuscada) {
          datosNV.bultos = dataDespachos[d][4] || 1;
          break;
        }
      }
    }
    
    // Si no hay bultos, buscar en PACKING o usar 1 por defecto
    if (!datosNV.bultos) {
      datosNV.bultos = 1;
    }
    
    return {
      success: true,
      datos: datosNV
    };
    
  } catch (e) {
    Logger.log('Error en getDatosNVParaDespacho: ' + e.message);
    return { success: false, error: e.message };
  }
}


/**
 * Crea un despacho completo
 * Guarda en hoja Despachos y crea registro en Entregas
 * @param {Object} datos - Datos del despacho
 * @returns {Object} {success, despachoId}
 */
// NOTA: Renombrada - usar version de Dispatch.gs
function crearDespachoShipping(datos) {
  try {
    Logger.log('crearDespacho: ' + JSON.stringify(datos));
    
    // Validar datos requeridos
    if (!datos.nVenta) {
      return { success: false, error: 'N° de N.V es requerido' };
    }
    if (!datos.transportista) {
      return { success: false, error: 'Transportista es requerido' };
    }
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheetDespachos = getOrCreateDespachosSheetCompleta();
    
    // Verificar si ya existe despacho para esta N.V
    var dataExistente = sheetDespachos.getDataRange().getValues();
    for (var i = 1; i < dataExistente.length; i++) {
      if (String(dataExistente[i][7] || '').trim() === String(datos.nVenta).trim()) {
        // Ya existe, actualizar en lugar de crear
        return actualizarDespacho(datos, i + 1);
      }
    }
    
    var ahora = new Date();
    var despachoId = 'ENV-' + ahora.getTime();
    
    // Estructura de la fila según especificación
    var nuevaFila = [
      datos.fechaDocto || ahora,           // A - Fecha Docto (auto desde N.V DIARIAS)
      datos.cliente || '',                  // B - Cliente (auto desde N.V DIARIAS)
      datos.facturas || '',                 // C - Facturas (manual)
      datos.guia || '',                     // D - Guía (manual)
      datos.bultos || 1,                    // E - Bultos (auto desde Packing)
      datos.empresaTransporte || 'PROPIO', // F - Empresa Transporte (manual)
      datos.transportista || '',            // G - Transportista (manual)
      datos.nVenta,                         // H - N° NV (auto desde N.V DIARIAS)
      datos.division || '',                 // I - División (manual)
      datos.vendedor || '',                 // J - Vendedor (auto desde N.V DIARIAS)
      ahora,                                // K - Fecha Despacho (auto)
      datos.numeroEnvio || '0',             // L - N° de Envío (manual)
      despachoId,                           // M - Fecha Creación (ID único)
      'PENDIENTE'                           // N - Estado (auto)
    ];
    
    sheetDespachos.appendRow(nuevaFila);
    
    // Crear registro en hoja Entregas
    var resultadoEntrega = crearEntregaDesdeDespachoNuevo({
      nVenta: datos.nVenta,
      facturas: datos.facturas || '',
      guia: datos.guia || '',
      transportista: datos.transportista,
      bultos: datos.bultos || 1
    });
    
    // Cambiar estado de N.V a DESPACHADO
    if (typeof cambiarEstadoNV === 'function') {
      cambiarEstadoNV(datos.nVenta, 'DESPACHADO', datos.usuario || 'Sistema');
    }
    
    SpreadsheetApp.flush();
    
    Logger.log('Despacho creado: ' + despachoId + ' para N.V ' + datos.nVenta);
    
    return {
      success: true,
      despachoId: despachoId,
      nVenta: datos.nVenta,
      entregaCreada: resultadoEntrega.success,
      mensaje: 'Despacho creado correctamente'
    };
    
  } catch (e) {
    Logger.log('Error en crearDespacho: ' + e.message);
    return { success: false, error: e.message };
  }
}

/**
 * Actualiza un despacho existente
 */
// NOTA: Renombrada - usar version de DespachoAPI.gs
function actualizarDespachoShipping(datos, fila) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_DESPACHOS);
    
    if (!sheet) {
      return { success: false, error: 'Hoja Despachos no encontrada' };
    }
    
    var ahora = new Date();
    
    // Actualizar campos manuales (C, D, F, G, I, L)
    sheet.getRange(fila, 3).setValue(datos.facturas || '');      // C - Facturas
    sheet.getRange(fila, 4).setValue(datos.guia || '');          // D - Guía
    sheet.getRange(fila, 6).setValue(datos.empresaTransporte || 'PROPIO'); // F - Empresa
    sheet.getRange(fila, 7).setValue(datos.transportista || ''); // G - Transportista
    sheet.getRange(fila, 9).setValue(datos.division || '');      // I - División
    sheet.getRange(fila, 11).setValue(ahora);                    // K - Fecha Despacho
    sheet.getRange(fila, 12).setValue(datos.numeroEnvio || '0'); // L - N° Envío
    
    // Actualizar entrega si existe
    actualizarEntregaTransportista(datos.nVenta, datos.transportista, datos.facturas, datos.guia);
    
    // Cambiar estado de N.V a DESPACHADO
    if (typeof cambiarEstadoNV === 'function') {
      cambiarEstadoNV(datos.nVenta, 'DESPACHADO', datos.usuario || 'Sistema');
    }
    
    SpreadsheetApp.flush();
    
    return {
      success: true,
      nVenta: datos.nVenta,
      mensaje: 'Despacho actualizado correctamente'
    };
    
  } catch (e) {
    Logger.log('Error en actualizarDespacho: ' + e.message);
    return { success: false, error: e.message };
  }
}

/**
 * Crea o obtiene la hoja Despachos con estructura completa de 14 columnas
 */
function getOrCreateDespachosSheetCompleta() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_DESPACHOS);
  
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_DESPACHOS);
    
    var headers = [
      'Fecha Docto',       // A - Auto
      'Cliente',           // B - Auto
      'Facturas',          // C - Manual
      'Guía',              // D - Manual
      'Bultos',            // E - Auto (desde Packing)
      'Empresa Transporte',// F - Manual
      'Transportista',     // G - Manual
      'N° NV',             // H - Auto
      'División',          // I - Manual
      'Vendedor',          // J - Auto
      'Fecha Despacho',    // K - Auto
      'N° Envío',          // L - Manual
      'ID Despacho',       // M - Auto
      'Estado'             // N - Auto
    ];
    
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground('#1a73e8');
    headerRange.setFontColor('#ffffff');
    headerRange.setFontWeight('bold');
    headerRange.setHorizontalAlignment('center');
    
    sheet.setFrozenRows(1);
    
    Logger.log('Hoja Despachos creada con 14 columnas');
  }
  
  return sheet;
}

/**
 * Crea registro en hoja Entregas desde un despacho
 */
function crearEntregaDesdeDespachoNuevo(datos) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = getOrCreateEntregasSheetCompleta();
    
    // Verificar si ya existe
    var dataExistente = sheet.getDataRange().getValues();
    for (var i = 1; i < dataExistente.length; i++) {
      if (String(dataExistente[i][0] || '').trim() === String(datos.nVenta).trim()) {
        // Ya existe, actualizar transportista
        sheet.getRange(i + 1, 4).setValue(datos.transportista || '');
        return { success: true, mensaje: 'Entrega actualizada' };
      }
    }
    
    var nuevaFila = [
      datos.nVenta,                    // A - N.V
      datos.facturas || '',            // B - Factura/GD
      '',                              // C - Recepción
      datos.transportista || '',       // D - Transportista
      'PENDIENTE',                     // E - Estado
      '',                              // F - Persona Recibe
      '',                              // G - Observaciones
      '',                              // H - Foto URL
      '',                              // I - Fecha Entrega
      ''                               // J - Usuario
    ];
    
    sheet.appendRow(nuevaFila);
    
    return { success: true, nVenta: datos.nVenta };
    
  } catch (e) {
    Logger.log('Error en crearEntregaDesdeDespachoNuevo: ' + e.message);
    return { success: false, error: e.message };
  }
}

/**
 * Actualiza transportista en entrega existente
 */
function actualizarEntregaTransportista(nVenta, transportista, facturas, guia) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_ENTREGAS_SHIP);
    if (!sheet) return;
    
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0] || '').trim() === String(nVenta).trim()) {
        sheet.getRange(i + 1, 2).setValue(facturas || '');      // B - Factura
        sheet.getRange(i + 1, 4).setValue(transportista || ''); // D - Transportista
        break;
      }
    }
  } catch (e) {
    Logger.log('Error actualizando entrega: ' + e.message);
  }
}

/**
 * Crea o obtiene hoja Entregas con estructura de 10 columnas
 */
function getOrCreateEntregasSheetCompleta() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_ENTREGAS_SHIP);
  
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_ENTREGAS_SHIP);
    
    var headers = [
      'N.V',              // A
      'Factura/GD',       // B
      'Recepción',        // C
      'Transportista',    // D
      'Estado',           // E
      'Persona Recibe',   // F
      'Observaciones',    // G
      'Foto URL',         // H
      'Fecha Entrega',    // I
      'Usuario'           // J
    ];
    
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground('#10b981');
    headerRange.setFontColor('#ffffff');
    headerRange.setFontWeight('bold');
    
    sheet.setFrozenRows(1);
  }
  
  return sheet;
}


// ==================== FUNCIONES PARA ENTREGAS ====================

/**
 * Obtiene entregas filtradas por rol de usuario
 * - Transportistas: Solo ven sus entregas asignadas
 * - Admin/Supervisor/Gerencia: Ven todas
 * @param {string} usuario - Nombre del usuario actual
 * @param {string} rol - Rol del usuario
 * @returns {Object} {success, entregas, estadisticas}
 */
function getEntregasParaUsuario(usuario, rol) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = getOrCreateEntregasSheetCompleta();
    
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      return { 
        success: true, 
        entregas: [], 
        estadisticas: { total: 0, pendientes: 0, enRuta: 0, entregados: 0, rechazados: 0, reprogramados: 0 }
      };
    }
    
    var data = sheet.getRange(2, 1, lastRow - 1, 10).getValues();
    var entregas = [];
    var stats = { total: 0, pendientes: 0, enRuta: 0, entregados: 0, rechazados: 0, reprogramados: 0 };
    
    // Roles con vista total
    var rolesAdmin = ['ADMIN', 'ADMINISTRADOR', 'SUPERVISOR', 'GERENCIA', 'GERENTE'];
    var esAdmin = rolesAdmin.indexOf(String(rol || '').toUpperCase()) !== -1;
    var nombreUsuario = String(usuario || '').toUpperCase().trim();
    
    for (var i = 0; i < data.length; i++) {
      var row = data[i];
      var nv = String(row[0] || '').trim();
      if (!nv) continue;
      
      var transportista = String(row[3] || '').toUpperCase().trim();
      var estado = String(row[4] || 'PENDIENTE').toUpperCase().trim();
      
      // Filtrar por transportista si no es admin
      if (!esAdmin && transportista !== nombreUsuario) {
        continue;
      }
      
      // No mostrar entregados (según requerimiento)
      if (estado === 'ENTREGADO' || estado === 'ENTREGADA') {
        stats.entregados++;
        continue; // No agregar a la lista visible
      }
      
      var fechaEntrega = row[8];
      var fechaStr = '';
      if (fechaEntrega) {
        try {
          if (fechaEntrega instanceof Date) {
            fechaStr = Utilities.formatDate(fechaEntrega, Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm');
          } else {
            fechaStr = String(fechaEntrega);
          }
        } catch (e) {
          fechaStr = String(fechaEntrega);
        }
      }
      
      entregas.push({
        nv: nv,
        facturaGD: String(row[1] || '').trim(),
        recepcion: row[2] || '',
        transportista: String(row[3] || '').trim(),
        estado: estado,
        personaRecibe: String(row[5] || '').trim(),
        observaciones: String(row[6] || '').trim(),
        fotoUrl: String(row[7] || '').trim(),
        fechaEntrega: fechaStr,
        usuario: String(row[9] || '').trim(),
        rowIndex: i + 2
      });
      
      stats.total++;
      if (estado === 'PENDIENTE') stats.pendientes++;
      else if (estado === 'EN RUTA' || estado === 'EN_RUTA') stats.enRuta++;
      else if (estado === 'EN CAMINO') stats.enRuta++;
      else if (estado === 'RECHAZADO' || estado === 'RECHAZADA') stats.rechazados++;
      else if (estado === 'REPROGRAMADO' || estado === 'REPROGRAMADA') stats.reprogramados++;
    }
    
    return {
      success: true,
      entregas: entregas,
      estadisticas: stats,
      filtradoPor: esAdmin ? null : nombreUsuario
    };
    
  } catch (e) {
    Logger.log('Error en getEntregasParaUsuario: ' + e.message);
    return { success: false, error: e.message };
  }
}

/**
 * Actualiza el estado de una entrega
 * @param {string} nv - Número de N.V
 * @param {string} nuevoEstado - Nuevo estado
 * @param {string} usuario - Usuario que realiza el cambio
 * @returns {Object} {success}
 */
function actualizarEstadoEntregaShipping(nv, nuevoEstado, usuario) {
  try {
    if (!nv) return { success: false, error: 'N.V es requerido' };
    if (!nuevoEstado) return { success: false, error: 'Estado es requerido' };
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_ENTREGAS_SHIP);
    
    if (!sheet) {
      return { success: false, error: 'Hoja Entregas no encontrada' };
    }
    
    var data = sheet.getDataRange().getValues();
    var filaEncontrada = -1;
    
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0] || '').trim() === String(nv).trim()) {
        filaEncontrada = i + 1;
        break;
      }
    }
    
    if (filaEncontrada === -1) {
      return { success: false, error: 'Entrega no encontrada' };
    }
    
    // Actualizar estado (columna E)
    sheet.getRange(filaEncontrada, 5).setValue(nuevoEstado);
    
    // Si es ENTREGADO, actualizar fecha y estado en N.V DIARIAS
    if (nuevoEstado === 'ENTREGADO' || nuevoEstado === 'ENTREGADA') {
      sheet.getRange(filaEncontrada, 9).setValue(new Date()); // Fecha entrega
      sheet.getRange(filaEncontrada, 10).setValue(usuario || 'Sistema'); // Usuario
      
      // Actualizar N.V DIARIAS
      actualizarEstadoNVDiariasShipping(nv, 'ENTREGADO');
    }
    
    SpreadsheetApp.flush();
    
    Logger.log('Estado actualizado: N.V ' + nv + ' -> ' + nuevoEstado);
    
    return {
      success: true,
      nv: nv,
      estado: nuevoEstado
    };
    
  } catch (e) {
    Logger.log('Error en actualizarEstadoEntregaShipping: ' + e.message);
    return { success: false, error: e.message };
  }
}

/**
 * Guarda datos completos de entrega (receptor, observaciones, foto)
 */
function guardarDatosEntregaCompletos(datos) {
  try {
    if (!datos.nv) return { success: false, error: 'N.V es requerido' };
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_ENTREGAS_SHIP);
    
    if (!sheet) {
      return { success: false, error: 'Hoja Entregas no encontrada' };
    }
    
    // Si hay foto en base64, guardarla en Drive
    var fotoUrl = datos.fotoUrl || '';
    if (fotoUrl && fotoUrl.indexOf('data:image') === 0) {
      var resultadoFoto = guardarFotoEntregaDriveShipping(datos.nv, fotoUrl);
      if (resultadoFoto.success) {
        fotoUrl = resultadoFoto.urlFoto;
      }
    }
    
    var data = sheet.getDataRange().getValues();
    var filaEncontrada = -1;
    
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0] || '').trim() === String(datos.nv).trim()) {
        filaEncontrada = i + 1;
        break;
      }
    }
    
    if (filaEncontrada === -1) {
      return { success: false, error: 'Entrega no encontrada' };
    }
    
    var ahora = new Date();
    
    // Actualizar campos
    sheet.getRange(filaEncontrada, 5).setValue(datos.estado || 'ENTREGADO');  // E - Estado
    sheet.getRange(filaEncontrada, 6).setValue(datos.personaRecibe || '');    // F - Persona Recibe
    sheet.getRange(filaEncontrada, 7).setValue(datos.observaciones || '');    // G - Observaciones
    sheet.getRange(filaEncontrada, 8).setValue(fotoUrl);                      // H - Foto URL
    sheet.getRange(filaEncontrada, 9).setValue(ahora);                        // I - Fecha Entrega
    sheet.getRange(filaEncontrada, 10).setValue(datos.usuario || 'Sistema');  // J - Usuario
    
    // Si es ENTREGADO, actualizar N.V DIARIAS
    if (datos.estado === 'ENTREGADO' || datos.estado === 'ENTREGADA') {
      actualizarEstadoNVDiariasShipping(datos.nv, 'ENTREGADO');
    }
    
    SpreadsheetApp.flush();
    
    return {
      success: true,
      nv: datos.nv,
      fotoUrl: fotoUrl,
      mensaje: 'Entrega guardada correctamente'
    };
    
  } catch (e) {
    Logger.log('Error en guardarDatosEntregaCompletos: ' + e.message);
    return { success: false, error: e.message };
  }
}

/**
 * Guarda foto en Google Drive
 */
function guardarFotoEntregaDriveShipping(nv, fotoBase64) {
  try {
    if (!fotoBase64) return { success: false, error: 'No hay foto' };
    
    var folderName = 'Fotos_Entregas_WMS';
    var folders = DriveApp.getFoldersByName(folderName);
    var folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(folderName);
    
    var base64Data = fotoBase64.replace(/^data:image\/\w+;base64,/, '');
    var blob = Utilities.newBlob(Utilities.base64Decode(base64Data), 'image/jpeg', 'entrega_' + nv + '_' + new Date().getTime() + '.jpg');
    
    var file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    var fileId = file.getId();
    var urlFoto = 'https://drive.google.com/thumbnail?id=' + fileId + '&sz=w400';
    
    return { success: true, urlFoto: urlFoto, fileId: fileId };
    
  } catch (e) {
    Logger.log('Error guardando foto: ' + e.message);
    return { success: false, error: e.message };
  }
}

/**
 * Actualiza estado en N.V DIARIAS
 */
function actualizarEstadoNVDiariasShipping(nv, nuevoEstado) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NV_DIARIAS_SHIP);
    if (!sheet) return;
    
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][1] || '').trim() === String(nv).trim()) {
        sheet.getRange(i + 1, 3).setValue(nuevoEstado);
      }
    }
    SpreadsheetApp.flush();
  } catch (e) {
    Logger.log('Error actualizando N.V DIARIAS: ' + e.message);
  }
}

/**
 * Obtiene lista de transportistas únicos
 */
function getTransportistas() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_DESPACHOS);
    
    if (!sheet || sheet.getLastRow() <= 1) {
      return { success: true, transportistas: ['PROPIO'] };
    }
    
    var data = sheet.getRange(2, 7, sheet.getLastRow() - 1, 1).getValues();
    var transportistasUnicos = {};
    
    for (var i = 0; i < data.length; i++) {
      var t = String(data[i][0] || '').trim();
      if (t) transportistasUnicos[t] = true;
    }
    
    var lista = Object.keys(transportistasUnicos);
    lista.sort();
    
    return { success: true, transportistas: lista };
    
  } catch (e) {
    return { success: true, transportistas: ['PROPIO'] };
  }
}

/**
 * Obtiene estadísticas de despachos
 */
// NOTA: Renombrada - usar version de Dispatch.gs
function getEstadisticasDespachosShipping() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var stats = { total: 0, pendientes: 0, despachados: 0, entregados: 0 };
    
    // Contar pendientes desde N.V DIARIAS (PENDIENTE_SHIPPING o LISTO_DESPACHO)
    var sheetNV = ss.getSheetByName(SHEET_NV_DIARIAS_SHIP);
    if (sheetNV && sheetNV.getLastRow() > 1) {
      var dataNV = sheetNV.getRange(2, 2, sheetNV.getLastRow() - 1, 2).getValues(); // Columnas B y C
      var nvContadas = {};
      
      for (var i = 0; i < dataNV.length; i++) {
        var nv = String(dataNV[i][0] || '').trim();
        var estado = String(dataNV[i][1] || '').trim().toUpperCase().replace(/\s+/g, '_');
        
        if (nv && !nvContadas[nv] && (estado === 'PENDIENTE_SHIPPING' || estado === 'LISTO_DESPACHO')) {
          stats.pendientes++;
          nvContadas[nv] = true;
        }
      }
    }
    
    // Contar despachos desde hoja Despachos
    var sheet = ss.getSheetByName(SHEET_DESPACHOS);
    if (sheet && sheet.getLastRow() > 1) {
      var data = sheet.getRange(2, 11, sheet.getLastRow() - 1, 4).getValues(); // K=Fecha Despacho, L, M, N=Estado
      var hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      
      for (var i = 0; i < data.length; i++) {
        var fechaDespacho = data[i][0];
        var estado = String(data[i][3] || '').toUpperCase();
        
        stats.total++;
        
        // Contar despachados hoy
        if (fechaDespacho instanceof Date) {
          var fechaComp = new Date(fechaDespacho);
          fechaComp.setHours(0, 0, 0, 0);
          if (fechaComp.getTime() === hoy.getTime()) {
            stats.despachados++;
          }
        }
        
        if (estado === 'ENTREGADO') stats.entregados++;
      }
    }
    
    return { success: true, estadisticas: stats };
    
  } catch (e) {
    Logger.log('Error en getEstadisticasDespachos: ' + e.message);
    return { success: false, error: e.message };
  }
}
