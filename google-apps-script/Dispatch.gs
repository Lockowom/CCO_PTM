/**
 * Dispatch.gs - Módulo de Despachos CORREGIDO
 * Estructura correcta de hoja DESPACHO (15 columnas):
 * A-FECHA DOCTO, B-CLIENTE, C-FACTURAS, D-GUIA, E-BULTOS, F-EMPRESA TRANSPORTE, 
 * G-TRANSPORTISTA, H-N°NV, I-DIVISION, J-VENDEDOR, K-FECHA DESPACHO, L-VALOR FLETE, 
 * M-N° DE ENVIO/OT, N-FECHA CREACION DE DESPACHO, O-ESTADO
 * 
 * Columnas automáticas: A, B, E, H, J, L (desde PACKING)
 * Columnas manuales: C, D, F, G, I, M
 * Columnas auto-generadas: K, N, O
 */

var SHEET_DESPACHO = 'DESPACHO';
var SHEET_ORDENES = 'PICKING';
var SHEET_MOVIMIENTOS = 'MOVIMIENTOS';

// ==================== OBTENER ÓRDENES LISTAS PARA DESPACHO ====================

/**
 * Obtiene las órdenes listas para despacho desde N.V DIARIAS
 * Busca N.V con estado "Listo Despacho" o "LISTO_DESPACHO" o variantes
 * @returns {Object} - {success, ordenes}
 */
function getOrdenesListasDespacho() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // Buscar la hoja - N.V DIARIAS es donde se guardan los estados
    var sheetNames = ['N.V DIARIAS', 'PICKING', 'ORDENES'];
    var sheet = null;
    for (var i = 0; i < sheetNames.length; i++) {
      sheet = ss.getSheetByName(sheetNames[i]);
      if (sheet) {
        Logger.log('getOrdenesListasDespacho - Usando hoja: ' + sheetNames[i]);
        break;
      }
    }
    
    if (!sheet) {
      Logger.log('ERROR: No se encontró hoja N.V DIARIAS, PICKING ni ORDENES');
      return { success: false, error: 'Hoja de datos no encontrada' };
    }
    
    var lastRow = sheet.getLastRow();
    Logger.log('getOrdenesListasDespacho - Hoja: ' + sheet.getName() + ', lastRow: ' + lastRow);
    
    if (lastRow <= 1) {
      return { success: true, ordenes: [], total: 0 };
    }
    
    var data = sheet.getRange(2, 1, lastRow - 1, 12).getValues();
    var ordenesMap = {};
    var estadosEncontrados = {};
    
    for (var i = 0; i < data.length; i++) {
      var row = data[i];
      var estadoRaw = String(row[2] || '').trim();
      
      // Normalizar estado para comparación
      var estadoNormalizado = estadoRaw.toUpperCase().replace(/\s+/g, '_').replace(/-/g, '_');
      
      // Registrar estados encontrados para debug
      if (!estadosEncontrados[estadoNormalizado]) {
        estadosEncontrados[estadoNormalizado] = 0;
      }
      estadosEncontrados[estadoNormalizado]++;
      
      // Filtrar solo órdenes listas para despacho - más variantes
      var esListoDespacho = (
        estadoNormalizado === 'LISTO_DESPACHO' || 
        estadoNormalizado === 'LISTA_DESPACHO' ||
        estadoNormalizado === 'LISTO_PARA_DESPACHO' ||
        estadoNormalizado === 'PENDIENTE_DESPACHO' ||
        estadoNormalizado === 'PENDIENTE_SHIPPING' ||
        estadoRaw.toLowerCase() === 'listo despacho' ||
        estadoRaw.toLowerCase() === 'lista despacho' ||
        estadoRaw.toLowerCase() === 'pendiente shipping' ||
        estadoRaw === 'Listo Despacho' ||
        estadoRaw === 'Lista Despacho' ||
        estadoRaw === 'Pendiente Shipping'
      );
      
      if (!esListoDespacho) {
        continue;
      }
      
      var nVenta = String(row[1] || '').trim();
      if (!nVenta) continue;
      
      Logger.log('Encontrada N.V lista para despacho: ' + nVenta + ' (estado: ' + estadoRaw + ')');
      
      // Agrupar por N.Venta
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
          nVenta: nVenta,
          fechaEntrega: fechaStr,
          fechaDocto: fechaStr,
          nombreCliente: String(row[4] || ''),    // Columna E - Nombre Cliente
          cliente: String(row[4] || ''),          // Columna E - Nombre Cliente
          codCliente: String(row[3] || ''),       // Columna D - Cod.Cliente
          vendedor: String(row[6] || ''),         // Columna G - Nombre Vendedor
          codVendedor: String(row[5] || ''),      // Columna F - Cod.Vendedor
          zona: String(row[7] || ''),             // Columna H - Zona
          productos: [],
          totalItems: 0
        };
      }
      
      ordenesMap[nVenta].productos.push({
        codigo: String(row[8] || ''),             // Columna I - Cod.Producto
        descripcion: String(row[9] || ''),        // Columna J - Descripcion Producto
        unidadMedida: String(row[10] || ''),      // Columna K - Unidad Medida
        pedido: Number(row[11]) || 0              // Columna L - Pedido
      });
      
      ordenesMap[nVenta].totalItems++;
    }
    
    // Log de estados encontrados para debug
    Logger.log('Estados encontrados en la hoja: ' + JSON.stringify(estadosEncontrados));
    
    // Convertir map a array (compatible ES5)
    var ordenes = [];
    for (var key in ordenesMap) {
      if (ordenesMap.hasOwnProperty(key)) {
        ordenes.push(ordenesMap[key]);
      }
    }
    
    // Ordenar por fecha de entrega
    ordenes.sort(function(a, b) {
      return String(a.fechaEntrega || '').localeCompare(String(b.fechaEntrega || ''));
    });
    
    Logger.log('getOrdenesListasDespacho - Total órdenes: ' + ordenes.length);
    
    return {
      success: true,
      ordenes: ordenes,
      total: ordenes.length
    };
    
  } catch (e) {
    Logger.log('Error en getOrdenesListasDespacho: ' + e.message);
    return { success: false, error: 'Error al obtener órdenes: ' + e.message };
  }
}

// ==================== PRECARGAR DATOS AUTOMÁTICOS ====================

/**
 * Precarga los datos automáticos de una orden para el formulario de despacho
 * Columnas automáticas: A (FechaDocto), D (Guía), E (Bultos), F (EmpresaTransporte), H (N°NV), J (Vendedor)
 * @param {string} notaVenta - Número de nota de venta
 * @returns {Object} - {success, datos}
 */
function precargarDatosDespacho(notaVenta) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_ORDENES);
    
    if (!sheet) {
      return { success: false, error: 'Hoja PICKING no encontrada' };
    }
    
    var data = sheet.getDataRange().getValues();
    var nVentaBuscada = notaVenta.trim();
    var datosNV = null;
    
    // Buscar datos de la N.V en PICKING/N.V DIARIAS
    for (var i = 1; i < data.length; i++) {
      var nVenta = String(data[i][1] || '').trim();
      if (nVenta === nVentaBuscada) {
        datosNV = {
          fechaDocto: data[i][0],                   // A - Fecha de la N.V
          cliente: String(data[i][4] || ''),        // E - Cliente
          codCliente: String(data[i][3] || ''),     // D - Cod.Cliente
          codVendedor: String(data[i][5] || ''),    // F - Cod.Vendedor
          vendedor: String(data[i][6] || ''),       // G - Vendedor
          zona: String(data[i][7] || '')            // H - Zona
        };
        break;
      }
    }
    
    if (!datosNV) {
      return { success: false, error: 'Nota de venta no encontrada' };
    }
    
    // Buscar bultos en MOVIMIENTOS (del packing completado)
    var bultos = 0;
    var sheetMov = ss.getSheetByName(SHEET_MOVIMIENTOS);
    if (sheetMov && sheetMov.getLastRow() > 1) {
      var dataMov = sheetMov.getDataRange().getValues();
      // Buscar el registro de empaque más reciente para esta N.V
      for (var j = dataMov.length - 1; j >= 1; j--) {
        var tipoMov = String(dataMov[j][2] || '').toUpperCase();
        var nvMov = String(dataMov[j][3] || '').trim();
        
        if (tipoMov === 'EMPAQUE_COMPLETADO' && nvMov === nVentaBuscada) {
          bultos = Number(dataMov[j][4]) || 0;  // Columna E tiene los bultos
          break;
        }
      }
    }
    
    // Generar número de guía automático
    var guiaAuto = 'GUIA-' + nVentaBuscada + '-' + new Date().getTime().toString().slice(-6);
    
    // Formatear fecha
    var fechaFormateada = '';
    try {
      if (datosNV.fechaDocto instanceof Date) {
        fechaFormateada = Utilities.formatDate(datosNV.fechaDocto, Session.getScriptTimeZone(), 'yyyy-MM-dd');
      } else if (datosNV.fechaDocto) {
        var fecha = new Date(datosNV.fechaDocto);
        if (!isNaN(fecha.getTime())) {
          fechaFormateada = Utilities.formatDate(fecha, Session.getScriptTimeZone(), 'yyyy-MM-dd');
        } else {
          fechaFormateada = String(datosNV.fechaDocto);
        }
      }
    } catch (fe) {
      fechaFormateada = String(datosNV.fechaDocto || '');
    }
    
    return {
      success: true,
      datos: {
        // Campos automáticos
        fechaDocto: fechaFormateada,              // A - Auto (fecha de la N.V)
        guia: guiaAuto,                           // D - Auto (generado)
        bultos: bultos,                           // E - Auto (del packing)
        empresaTransporte: '',                    // F - Auto (puede venir de config)
        nVenta: nVentaBuscada,                    // H - Auto
        vendedor: datosNV.vendedor,               // J - Auto
        
        // Campos informativos
        cliente: datosNV.cliente,
        codCliente: datosNV.codCliente,
        codVendedor: datosNV.codVendedor,
        zona: datosNV.zona,
        fechaEntrega: fechaFormateada
      }
    };
    
  } catch (e) {
    Logger.log('Error en precargarDatosDespacho: ' + e.message);
    return { success: false, error: e.message };
  }
}

// ==================== CREAR DESPACHO ====================

/**
 * Crea un nuevo despacho con la estructura correcta
 * Columnas: A-FechaDocto, B-Cliente, C-Facturas, D-Guía, E-Bultos, F-EmpresaTransporte,
 * G-Transportista, H-N°NV, I-División, J-Vendedor, K-FechaDespacho, L-ValorFlete, M-N°Envío, N-FechaHoraCreacion
 * @param {Object} despachoData - Datos del despacho
 * @returns {Object} - {success, codigoSeguimiento}
 */
function crearDespacho(despachoData) {
  try {
    Logger.log('Iniciando crearDespacho con datos: ' + JSON.stringify(despachoData));
    
    // Validar campos obligatorios
    if (!despachoData.nVenta) {
      return { success: false, error: 'Número de N.V es requerido' };
    }
    if (!despachoData.cliente) {
      return { success: false, error: 'Cliente es requerido' };
    }
    if (!despachoData.guia) {
      return { success: false, error: 'Guía es requerida' };
    }
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // Buscar hoja de despachos con diferentes nombres
    var sheet = ss.getSheetByName('Despachos');
    if (!sheet) {
      var nombres = ['DESPACHOS', 'despachos', 'DESPACHO', 'Despacho'];
      for (var n = 0; n < nombres.length; n++) {
        sheet = ss.getSheetByName(nombres[n]);
        if (sheet) break;
      }
    }
    
    if (!sheet) {
      // Crear hoja si no existe con estructura de 15 columnas según especificación
      sheet = ss.insertSheet('DESPACHO');
      sheet.appendRow([
        'FECHA DOCTO', 'CLIENTE', 'FACTURAS', 'GUIA', 'BULTOS', 
        'EMPRESA TRANSPORTE', 'TRANSPORTISTA', 'N° NV', 'DIVISION', 
        'VENDEDOR', 'FECHA DESPACHO', 'VALOR FLETE', 'N° DE ENVIO /OT', 
        'FECHA DE CREACION DE DESPACHO', 'ESTADO'
      ]);
      sheet.getRange(1, 1, 1, 15).setFontWeight('bold').setBackground('#667eea').setFontColor('white');
      Logger.log('Hoja DESPACHO creada con 15 columnas');
    }
    
    // Generar número de envío automático
    var numeroEnvio = 'ENV-' + new Date().getTime();
    var fechaHoraCreacion = new Date();
    
    // Formatear fecha de documento
    var fechaDocto = despachoData.fechaDocto || fechaHoraCreacion;
    if (typeof fechaDocto === 'string' && fechaDocto) {
      fechaDocto = new Date(fechaDocto);
    }
    
    // Crear registro de despacho con estructura de 15 columnas
    var nuevoDespacho = [
      fechaDocto,                                     // A - FECHA DOCTO
      despachoData.cliente || '',                     // B - CLIENTE
      despachoData.facturas || '',                    // C - FACTURAS
      despachoData.guia || '',                        // D - GUIA
      despachoData.bultos || 1,                       // E - BULTOS
      despachoData.empresaTransporte || '',           // F - EMPRESA TRANSPORTE
      despachoData.transportista || '',               // G - TRANSPORTISTA
      despachoData.nVenta,                            // H - N° NV
      despachoData.division || '',                    // I - DIVISION
      despachoData.vendedor || '',                    // J - VENDEDOR
      fechaHoraCreacion,                              // K - FECHA DESPACHO
      despachoData.valorFlete || 0,                   // L - VALOR FLETE
      numeroEnvio,                                    // M - N° DE ENVIO /OT
      fechaHoraCreacion,                              // N - FECHA DE CREACION DE DESPACHO
      'PENDIENTE'                                     // O - ESTADO
    ];
    
    sheet.appendRow(nuevoDespacho);
    Logger.log('Fila agregada a Despachos');
    
    // Actualizar estado de la orden a DESPACHADO en N.V DIARIAS
    actualizarEstadoNVDiariasDespacho(despachoData.nVenta, 'DESPACHADO');
    
    // ==================== CREAR ENTREGA AUTOMÁTICAMENTE ====================
    // Cuando se crea un despacho, automáticamente se crea un registro en Entregas
    // Mapeo: Despachos.H→Entregas.A, Despachos.C→Entregas.B, Despachos.D→Entregas.C, 
    //        Despachos.G→Entregas.D, Despachos.E→Entregas.E (Bultos)
    try {
      var entregaData = {
        nVenta: despachoData.nVenta,                    // H → A
        facturas: despachoData.facturas || '',          // C → B
        guia: despachoData.guia || '',                  // D → C
        transportista: despachoData.transportista || '', // G → D
        bultos: despachoData.bultos || 1                // E → E (Bultos)
      };
      
      var resultadoEntrega = crearEntregaDesdeDespacho(entregaData);
      if (resultadoEntrega.success) {
        Logger.log('Entrega creada automáticamente para N.V: ' + despachoData.nVenta);
      } else {
        Logger.log('Advertencia: No se pudo crear entrega automática: ' + resultadoEntrega.error);
      }
    } catch (entregaError) {
      Logger.log('Error al crear entrega automática: ' + entregaError.message);
      // No fallar el despacho si la entrega falla
    }
    // ==================== FIN CREAR ENTREGA ====================
    
    Logger.log('Despacho creado exitosamente: ' + numeroEnvio);
    
    return {
      success: true,
      codigoSeguimiento: numeroEnvio,
      numeroEnvio: numeroEnvio,
      nVenta: despachoData.nVenta,
      cliente: despachoData.cliente,
      mensaje: 'Despacho creado correctamente y entrega registrada'
    };
    
  } catch (e) {
    Logger.log('ERROR en crearDespacho: ' + e.message + ' - Stack: ' + e.stack);
    return { success: false, error: 'Error al crear despacho: ' + e.message };
  }
}

/**
 * Actualiza el estado en la hoja N.V DIARIAS
 */
function actualizarEstadoNVDiariasDespacho(nv, nuevoEstado) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('N.V DIARIAS');
    if (!sheet) {
      Logger.log('Hoja N.V DIARIAS no encontrada para actualizar estado');
      return;
    }
    
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][1] || '').trim() === nv.trim()) {
        sheet.getRange(i + 1, 3).setValue(nuevoEstado); // Columna C = Estado
      }
    }
    Logger.log('Estado actualizado en N.V DIARIAS: ' + nv + ' -> ' + nuevoEstado);
  } catch (e) {
    Logger.log('Error actualizando estado N.V DIARIAS: ' + e.message);
  }
}

// ==================== FUNCIONES AUXILIARES ====================

/**
 * Actualiza el estado de una orden a DESPACHADO
 */
function actualizarEstadoOrdenDespacho(notaVenta, nuevoEstado) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_ORDENES);
    
    if (!sheet) return;
    
    var data = sheet.getDataRange().getValues();
    var nVentaBuscada = notaVenta.trim();
    
    for (var i = 1; i < data.length; i++) {
      var nVenta = String(data[i][1] || '').trim();
      if (nVenta === nVentaBuscada) {
        sheet.getRange(i + 1, 3).setValue(nuevoEstado); // Columna C
      }
    }
    
  } catch (e) {
    Logger.log('Error en actualizarEstadoOrdenDespacho: ' + e.message);
  }
}

/**
 * Registra un movimiento de despacho
 */
function registrarMovimientoDespacho(notaVenta, numeroEnvio, usuario) {
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
      'DESPACHO',
      notaVenta,
      0,
      '',
      'N° Envío: ' + numeroEnvio,
      usuario || 'Sistema'
    ]);
    
  } catch (e) {
    Logger.log('Error al registrar movimiento de despacho: ' + e.message);
  }
}

// ==================== BUSCAR Y LISTAR DESPACHOS ====================

/**
 * Busca despachos por cliente, guía o N.V
 * @param {string} filtro - Término de búsqueda
 * @returns {Object} - {success, despachos}
 */
function buscarDespachos(filtro) {
  try {
    Logger.log('buscarDespachos - Iniciando...');
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    if (!ss) {
      Logger.log('buscarDespachos - ERROR: No se pudo obtener el spreadsheet');
      return { success: false, error: 'No se pudo acceder al spreadsheet' };
    }
    
    // Buscar hoja de despachos con diferentes nombres
    var nombres = ['Despachos', 'DESPACHOS', 'despachos', 'DESPACHO', 'Despacho'];
    var sheet = null;
    for (var n = 0; n < nombres.length; n++) {
      sheet = ss.getSheetByName(nombres[n]);
      if (sheet) {
        Logger.log('buscarDespachos - Usando hoja: ' + nombres[n]);
        break;
      }
    }
    
    if (!sheet) {
      Logger.log('buscarDespachos - Hoja de despachos no encontrada');
      // No crear la hoja automáticamente, solo devolver vacío
      return { success: true, despachos: [], total: 0, mensaje: 'Hoja Despachos no existe' };
    }
    
    var lastRow = sheet.getLastRow();
    Logger.log('buscarDespachos - lastRow: ' + lastRow);
    
    if (lastRow <= 1) {
      Logger.log('buscarDespachos - Hoja vacía o solo encabezados');
      return { success: true, despachos: [], total: 0 };
    }
    
    var data = sheet.getRange(2, 1, lastRow - 1, 15).getValues();
    Logger.log('buscarDespachos - Filas leídas: ' + data.length);
    
    var filtroLower = (filtro || '').toLowerCase().trim();
    var despachos = [];
    
    for (var i = 0; i < data.length; i++) {
      var row = data[i];
      var cliente = String(row[1] || '').toLowerCase();
      var guia = String(row[3] || '').toLowerCase();
      var nVenta = String(row[7] || '').toLowerCase();
      var numeroEnvio = String(row[12] || '').toLowerCase();
      
      // Si no hay filtro, devolver todos
      if (!filtroLower || 
          cliente.indexOf(filtroLower) !== -1 ||
          guia.indexOf(filtroLower) !== -1 ||
          nVenta.indexOf(filtroLower) !== -1 ||
          numeroEnvio.indexOf(filtroLower) !== -1) {
        
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
        
        despachos.push({
          fechaDocto: fechaStr,
          cliente: String(row[1] || ''),
          facturas: String(row[2] || ''),
          guia: String(row[3] || ''),
          bultos: row[4],
          empresaTransporte: String(row[5] || ''),
          transportista: String(row[6] || ''),
          numeroNV: String(row[7] || ''),
          nVenta: String(row[7] || ''),
          division: String(row[8] || ''),
          vendedor: String(row[9] || ''),
          fechaDespacho: row[10],
          valorFlete: row[11],
          numeroEnvio: String(row[12] || ''),
          fechaCreacion: row[13],
          estado: String(row[14] || 'PENDIENTE'),
          rowIndex: i + 2
        });
      }
    }
    
    // Ordenar por fecha descendente (más recientes primero)
    despachos.sort(function(a, b) {
      try {
        return new Date(b.fechaDespacho) - new Date(a.fechaDespacho);
      } catch (e) {
        return 0;
      }
    });
    
    Logger.log('buscarDespachos - Total despachos: ' + despachos.length);
    
    return {
      success: true,
      despachos: despachos,
      total: despachos.length
    };
    
  } catch (e) {
    Logger.log('Error en buscarDespachos: ' + e.message + ' - Stack: ' + e.stack);
    return { success: false, error: 'Error: ' + e.message };
  }
}

/**
 * Obtiene estadísticas de despachos
 */
function getEstadisticasDespachos() {
  try {
    var resultado = buscarDespachos('');
    if (!resultado.success) return resultado;
    
    var hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    var stats = {
      total: resultado.despachos.length,
      hoy: 0,
      semana: 0,
      mes: 0
    };
    
    var hace7Dias = new Date(hoy.getTime() - 7 * 24 * 60 * 60 * 1000);
    var hace30Dias = new Date(hoy.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    resultado.despachos.forEach(function(d) {
      var fecha = new Date(d.fechaDespacho);
      if (fecha >= hoy) stats.hoy++;
      if (fecha >= hace7Dias) stats.semana++;
      if (fecha >= hace30Dias) stats.mes++;
    });
    
    return {
      success: true,
      stats: stats
    };
    
  } catch (e) {
    Logger.log('Error en getEstadisticasDespachos: ' + e.message);
    return { success: false, error: e.message };
  }
}

// ==================== FUNCIONES DE COMPATIBILIDAD ====================

function getDispatchesByStatus(status) {
  var resultado = buscarDespachos('');
  if (!resultado.success) return resultado;
  
  return {
    success: true,
    dispatches: resultado.despachos.map(function(d) {
      return {
        id: d.numeroEnvio,
        ordenId: d.nVenta,
        numeroOrden: d.nVenta,
        cliente: d.cliente,
        fechaDespacho: d.fechaDespacho,
        transportista: d.transportista,
        codigoSeguimiento: d.numeroEnvio,
        estado: 'DESPACHADO',
        destino: d.division
      };
    }),
    count: resultado.despachos.length
  };
}

function createDispatch(dispatchData) {
  return crearDespacho({
    nVenta: dispatchData.ordenId || dispatchData.nVenta,
    guia: dispatchData.guia,
    empresaTransporte: dispatchData.empresaTransporte || dispatchData.transportista,
    transportista: dispatchData.transportista,
    division: dispatchData.destino || dispatchData.division,
    bultos: dispatchData.bultos,
    facturas: dispatchData.facturas,
    valorFlete: dispatchData.valorFlete,
    usuario: dispatchData.usuario
  });
}

function markDispatchInTransit(dispatchId) {
  return { success: true, message: 'Despacho marcado en tránsito' };
}

function crearDespachoDesdeOrden(despachoData) {
  // Normalizar el campo nVenta
  if (despachoData.numeroNV && !despachoData.nVenta) {
    despachoData.nVenta = despachoData.numeroNV;
  }
  return crearDespacho(despachoData);
}

/**
 * Precarga datos de una orden para el formulario de despacho
 * Incluye: cliente, vendedor, zona, fecha, bultos (del packing)
 * @param {string} notaVenta - Número de nota de venta
 * @returns {Object} - {success, cliente, vendedor, zona, fechaDocto, bultos}
 */
function precargarDatosOrden(notaVenta) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // Buscar en N.V DIARIAS primero (donde están los estados), luego en PICKING
    var sheetNames = ['N.V DIARIAS', 'PICKING'];
    var sheet = null;
    for (var s = 0; s < sheetNames.length; s++) {
      sheet = ss.getSheetByName(sheetNames[s]);
      if (sheet) break;
    }
    
    if (!sheet) {
      return { success: false, error: 'Hoja de datos no encontrada' };
    }
    
    var data = sheet.getDataRange().getValues();
    var nVentaBuscada = String(notaVenta).trim();
    var datosNV = null;
    
    Logger.log('precargarDatosOrden - Buscando N.V: ' + nVentaBuscada);
    
    for (var i = 1; i < data.length; i++) {
      var nVenta = String(data[i][1] || '').trim();
      if (nVenta === nVentaBuscada) {
        // Formatear fecha para input type="date"
        var fechaFormateada = '';
        try {
          if (data[i][0] instanceof Date) {
            fechaFormateada = Utilities.formatDate(data[i][0], Session.getScriptTimeZone(), 'yyyy-MM-dd');
          } else if (data[i][0]) {
            var fecha = new Date(data[i][0]);
            if (!isNaN(fecha.getTime())) {
              fechaFormateada = Utilities.formatDate(fecha, Session.getScriptTimeZone(), 'yyyy-MM-dd');
            }
          }
        } catch (fe) {
          Logger.log('Error formateando fecha: ' + fe.message);
        }
        
        datosNV = {
          cliente: String(data[i][4] || ''),      // Columna E - Nombre Cliente
          codCliente: String(data[i][3] || ''),   // Columna D - Cod.Cliente
          vendedor: String(data[i][6] || ''),     // Columna G - Nombre Vendedor
          codVendedor: String(data[i][5] || ''),  // Columna F - Cod.Vendedor
          zona: String(data[i][7] || ''),         // Columna H - Zona
          fechaDocto: fechaFormateada,            // Fecha de la N.V formateada
          fechaEntrega: data[i][0]
        };
        break;
      }
    }
    
    if (!datosNV) {
      Logger.log('precargarDatosOrden - N.V no encontrada: ' + nVentaBuscada);
      return { success: false, error: 'Nota de venta no encontrada' };
    }
    
    // Buscar bultos en MOVIMIENTOS (del packing completado)
    var bultos = 0;
    var sheetMov = ss.getSheetByName('MOVIMIENTOS');
    if (sheetMov && sheetMov.getLastRow() > 1) {
      var dataMov = sheetMov.getDataRange().getValues();
      // Buscar el registro de empaque más reciente para esta N.V
      for (var j = dataMov.length - 1; j >= 1; j--) {
        var tipoMov = String(dataMov[j][2] || '').toUpperCase();
        var nvMov = String(dataMov[j][3] || '').trim();
        
        if (tipoMov === 'EMPAQUE_COMPLETADO' && nvMov === nVentaBuscada) {
          bultos = Number(dataMov[j][4]) || 0;  // Columna E tiene los bultos
          Logger.log('precargarDatosOrden - Bultos encontrados: ' + bultos);
          break;
        }
      }
    }
    
    var resultado = {
      success: true,
      cliente: datosNV.cliente,
      codCliente: datosNV.codCliente,
      vendedor: datosNV.vendedor,
      codVendedor: datosNV.codVendedor,
      zona: datosNV.zona,
      fechaDocto: datosNV.fechaDocto,
      fechaEntrega: datosNV.fechaEntrega,
      bultos: bultos
    };
    
    Logger.log('precargarDatosOrden - Resultado: ' + JSON.stringify(resultado));
    return resultado;
    
  } catch (e) {
    Logger.log('Error en precargarDatosOrden: ' + e.message);
    return { success: false, error: e.message };
  }
}


/**
 * Función de diagnóstico para ver los estados en la hoja PICKING
 * Ejecutar desde el editor de Apps Script para debug
 */
function diagnosticarEstadosDespacho() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  var sheetNames = ['PICKING', 'N.V DIARIAS', 'ORDENES'];
  var sheet = null;
  for (var i = 0; i < sheetNames.length; i++) {
    sheet = ss.getSheetByName(sheetNames[i]);
    if (sheet) {
      Logger.log('Usando hoja: ' + sheetNames[i]);
      break;
    }
  }
  
  if (!sheet) {
    Logger.log('ERROR: No se encontró ninguna hoja de datos');
    return;
  }
  
  var lastRow = sheet.getLastRow();
  Logger.log('Total filas: ' + lastRow);
  
  if (lastRow <= 1) {
    Logger.log('La hoja está vacía');
    return;
  }
  
  var data = sheet.getRange(2, 1, lastRow - 1, 3).getValues();
  var estadosConteo = {};
  var ejemplos = {};
  
  for (var i = 0; i < data.length; i++) {
    var estadoRaw = String(data[i][2] || '').trim();
    var nVenta = String(data[i][1] || '').trim();
    
    if (!estadosConteo[estadoRaw]) {
      estadosConteo[estadoRaw] = 0;
      ejemplos[estadoRaw] = nVenta;
    }
    estadosConteo[estadoRaw]++;
  }
  
  Logger.log('=== ESTADOS ENCONTRADOS ===');
  for (var estado in estadosConteo) {
    Logger.log('Estado: "' + estado + '" - Cantidad: ' + estadosConteo[estado] + ' - Ejemplo NV: ' + ejemplos[estado]);
  }
  
  // Buscar específicamente estados de despacho
  Logger.log('=== BUSCANDO ESTADOS DE DESPACHO ===');
  for (var estado in estadosConteo) {
    var estadoUpper = estado.toUpperCase().replace(/\s+/g, '_');
    if (estadoUpper.indexOf('DESPACHO') !== -1 || estadoUpper.indexOf('LISTO') !== -1) {
      Logger.log('ENCONTRADO: "' + estado + '" (' + estadosConteo[estado] + ' registros)');
    }
  }
  
  return estadosConteo;
}


/**
 * Función de prueba para verificar que buscarDespachos funciona
 * Ejecutar desde el editor de Apps Script
 */
function testBuscarDespachos() {
  var resultado = buscarDespachos('');
  Logger.log('Resultado: ' + JSON.stringify(resultado));
  return resultado;
}

/**
 * Función alternativa para obtener despachos recientes
 * Por si buscarDespachos tiene problemas
 */
function getDespachosRecientes() {
  try {
    Logger.log('getDespachosRecientes - Iniciando...');
    return buscarDespachos('');
  } catch (e) {
    Logger.log('Error en getDespachosRecientes: ' + e.message);
    return { success: false, error: e.message };
  }
}
