/**
 * Delivery.gs - Módulo de Entregas REESTRUCTURADO
 * Nueva estructura de hoja Entregas (13 columnas):
 * A-N.V (Auto desde Despachos.H)
 * B-Factura/GD (Auto desde Despachos.C)
 * C-Guía (Auto desde Despachos.D)
 * D-Transportista (Auto desde Despachos.G)
 * E-Bultos (Auto desde Despachos.E)
 * F-Estado (Manual - Transportista)
 * G-NombreReceptor (Manual - Transportista)
 * H-FotoURL (Manual - Transportista con cámara)
 * I-Observaciones (Manual - Transportista)
 * J-FechaEntrega (Manual - Transportista)
 * K-InicioRuta (Auto - Timer)
 * L-FinEntrega (Auto - Timer)
 * M-Duracion (Auto - Calculado)
 * 
 * Las columnas A-E se crean automáticamente cuando se registra un despacho
 */

var SHEET_ENTREGAS = 'Entregas';
var SHEET_DESPACHO = 'Despachos';
var SHEET_MOVIMIENTOS = 'MOVIMIENTOS';

var ESTADOS_ENTREGA = {
  PENDIENTE: 'PENDIENTE',
  EN_RUTA: 'EN RUTA',
  EN_CAMINO: 'EN CAMINO',
  ENTREGADO: 'ENTREGADO',
  ENTREGADA: 'ENTREGADA',
  RECHAZADO: 'RECHAZADO',
  REPROGRAMADO: 'REPROGRAMADO'
};

// ==================== CREACIÓN AUTOMÁTICA DESDE DESPACHO ====================

/**
 * Crea un registro de entrega automáticamente cuando se crea un despacho
 * Mapeo de columnas:
 * - Despachos.H (N° NV) → Entregas.A (N.V)
 * - Despachos.C (Facturas) → Entregas.B (Factura/GD)
 * - Despachos.D (Guía) → Entregas.C (Guía)
 * - Despachos.G (Transportista) → Entregas.D (Transportista)
 * - Despachos.E (Bultos) → Entregas.E (Bultos)
 * 
 * @param {Object} despachoData - Datos del despacho recién creado
 * @returns {Object} {success, entregaId, error}
 */
function crearEntregaDesdeDespacho(despachoData) {
  try {
    Logger.log('Creando entrega automática desde despacho: ' + JSON.stringify(despachoData));
    
    if (!despachoData.nVenta) {
      return { success: false, error: 'N.V es requerido para crear entrega' };
    }
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = getOrCreateEntregasSheet(ss);
    
    // Verificar si ya existe una entrega para esta N.V
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0] || '').trim() === String(despachoData.nVenta).trim()) {
        Logger.log('Ya existe entrega para N.V: ' + despachoData.nVenta);
        return { success: true, mensaje: 'Entrega ya existe', nv: despachoData.nVenta };
      }
    }
    
    // Crear nuevo registro de entrega con columnas A-E auto-pobladas
    var nuevoRegistro = [
      despachoData.nVenta || '',           // A - N.V (desde Despachos.H)
      despachoData.facturas || '',         // B - Factura/GD (desde Despachos.C)
      despachoData.guia || '',             // C - Guía (desde Despachos.D)
      despachoData.transportista || '',    // D - Transportista (desde Despachos.G)
      despachoData.bultos || 1,            // E - Bultos (desde Despachos.E)
      'PENDIENTE',                         // F - Estado (inicial)
      '',                                  // G - Nombre Receptor (vacío)
      '',                                  // H - Foto URL (vacío)
      '',                                  // I - Observaciones (vacío)
      '',                                  // J - Fecha Entrega (vacío)
      '',                                  // K - InicioRuta
      '',                                  // L - FinEntrega
      ''                                   // M - Duracion
    ];
    
    sheet.appendRow(nuevoRegistro);
    Logger.log('Entrega creada automáticamente para N.V: ' + despachoData.nVenta);
    
    return {
      success: true,
      nv: despachoData.nVenta,
      mensaje: 'Entrega creada automáticamente desde despacho'
    };
    
  } catch (e) {
    Logger.log('Error en crearEntregaDesdeDespacho: ' + e.message);
    return { success: false, error: e.message };
  }
}

/**
 * Obtiene o crea la hoja de Entregas con la estructura correcta de 13 columnas
 */
function getOrCreateEntregasSheet(ss) {
  var sheet = ss.getSheetByName('Entregas');
  
  // Intentar con variantes del nombre
  if (!sheet) {
    var nombres = ['ENTREGAS', 'entregas', 'Entrega', 'ENTREGA'];
    for (var n = 0; n < nombres.length; n++) {
      sheet = ss.getSheetByName(nombres[n]);
      if (sheet) break;
    }
  }
  
  // Si no existe, crear con la nueva estructura de 13 columnas
  if (!sheet) {
    sheet = ss.insertSheet('Entregas');
    sheet.appendRow([
      'N.V',           // A - Auto desde Despachos.H
      'Factura/GD',    // B - Auto desde Despachos.C
      'Guía',          // C - Auto desde Despachos.D
      'Transportista', // D - Auto desde Despachos.G
      'Bultos',        // E - Auto desde Despachos.E
      'Estado',        // F - Manual
      'Receptor',      // G - Manual
      'Foto',          // H - Manual (cámara)
      'Observaciones', // I - Manual
      'FechaEntrega',  // J - Manual
      'InicioRuta',    // K - Timer Start
      'FinEntrega',    // L - Timer End
      'Duracion'       // M - Calculated Duration
    ]);
    sheet.getRange(1, 1, 1, 13).setFontWeight('bold').setBackground('#667eea').setFontColor('white');
    
    // Ajustar anchos de columna
    sheet.setColumnWidth(1, 100);  // N.V
    sheet.setColumnWidth(2, 120);  // Factura/GD
    sheet.setColumnWidth(3, 120);  // Guía
    sheet.setColumnWidth(4, 150);  // Transportista
    sheet.setColumnWidth(5, 80);   // Bultos
    sheet.setColumnWidth(6, 100);  // Estado
    sheet.setColumnWidth(7, 150);  // Receptor
    sheet.setColumnWidth(8, 200);  // Foto
    sheet.setColumnWidth(9, 200);  // Observaciones
    sheet.setColumnWidth(10, 150); // FechaEntrega
    sheet.setColumnWidth(11, 150); // InicioRuta
    sheet.setColumnWidth(12, 150); // FinEntrega
    sheet.setColumnWidth(13, 100); // Duracion
    
    Logger.log('Hoja Entregas creada con estructura de 13 columnas');
  }
  
  return sheet;
}

/**
 * Sincroniza entregas con despachos - crea entregas faltantes
 * @returns {Object} {success, nuevasEntregas, error}
 */
function sincronizarEntregasConDespachos() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // Obtener despachos
    var sheetDespachos = ss.getSheetByName('Despachos');
    if (!sheetDespachos) {
      var nombres = ['DESPACHOS', 'despachos', 'DESPACHO', 'Despacho'];
      for (var n = 0; n < nombres.length; n++) {
        sheetDespachos = ss.getSheetByName(nombres[n]);
        if (sheetDespachos) break;
      }
    }
    
    if (!sheetDespachos) {
      return { success: true, nuevasEntregas: 0, mensaje: 'No hay hoja de despachos' };
    }
    
    var sheetEntregas = getOrCreateEntregasSheet(ss);
    
    // Obtener N.V existentes en entregas
    var dataEntregas = sheetEntregas.getDataRange().getValues();
    var nvExistentes = {};
    for (var i = 1; i < dataEntregas.length; i++) {
      var nv = String(dataEntregas[i][0] || '').trim();
      if (nv) nvExistentes[nv] = true;
    }
    
    // Obtener despachos y crear entregas faltantes
    var dataDespachos = sheetDespachos.getDataRange().getValues();
    var nuevasEntregas = 0;
    
    for (var j = 1; j < dataDespachos.length; j++) {
      var row = dataDespachos[j];
      var nvDespacho = String(row[7] || '').trim(); // Columna H = N° NV
      
      if (nvDespacho && !nvExistentes[nvDespacho]) {
        // Crear entrega desde despacho
        var resultado = crearEntregaDesdeDespacho({
          nVenta: nvDespacho,
          facturas: String(row[2] || ''),      // Columna C = Facturas
          guia: String(row[3] || ''),          // Columna D = Guía
          transportista: String(row[6] || ''), // Columna G = Transportista
          bultos: row[4] || 1                  // Columna E = Bultos
        });
        
        if (resultado.success) {
          nuevasEntregas++;
          nvExistentes[nvDespacho] = true;
        }
      }
    }
    
    return {
      success: true,
      nuevasEntregas: nuevasEntregas,
      mensaje: nuevasEntregas > 0 ? 'Se crearon ' + nuevasEntregas + ' entregas nuevas' : 'Todas las entregas están sincronizadas'
    };
    
  } catch (e) {
    Logger.log('Error en sincronizarEntregasConDespachos: ' + e.message);
    return { success: false, error: e.message };
  }
}

function getEntregasPendientes() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheetDespacho = ss.getSheetByName(SHEET_DESPACHO);
    var sheetEntregas = ss.getSheetByName(SHEET_ENTREGAS);
    
    if (!sheetDespacho) return { success: false, error: 'Hoja DESPACHO no encontrada' };
    
    var dataDespacho = sheetDespacho.getDataRange().getValues();
    var entregasExistentes = {};
    
    if (sheetEntregas) {
      var dataEntregas = sheetEntregas.getDataRange().getValues();
      for (var i = 1; i < dataEntregas.length; i++) {
        var nv = String(dataEntregas[i][0] || '').trim();
        if (nv) entregasExistentes[nv] = { estado: String(dataEntregas[i][4] || ''), rowIndex: i + 1 };
      }
    }
    
    var entregas = [];
    for (var j = 1; j < dataDespacho.length; j++) {
      var row = dataDespacho[j];
      var nVenta = String(row[7] || '').trim();
      if (!nVenta) continue;
      
      var entregaExistente = entregasExistentes[nVenta];
      if (entregaExistente && (entregaExistente.estado === 'ENTREGADA' || entregaExistente.estado === 'ENTREGADO')) continue;
      
      entregas.push({
        nVenta: nVenta, facturaGD: String(row[2] || ''), transportista: String(row[6] || ''),
        cliente: String(row[1] || ''), guia: String(row[3] || ''), fechaDespacho: row[10],
        numeroEnvio: String(row[12] || ''), estado: entregaExistente ? entregaExistente.estado : 'PENDIENTE',
        rowIndex: entregaExistente ? entregaExistente.rowIndex : null
      });
    }
    return { success: true, entregas: entregas, total: entregas.length };
  } catch (e) {
    Logger.log('Error en getEntregasPendientes: ' + e.message);
    return { success: false, error: e.message };
  }
}

function precargarDatosEntrega(notaVenta) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_DESPACHO);
    if (!sheet) return { success: false, error: 'Hoja DESPACHO no encontrada' };
    
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      var nVenta = String(data[i][7] || '').trim();
      if (nVenta === notaVenta.trim()) {
        return { success: true, datos: { nVenta: nVenta, facturaGD: String(data[i][2] || ''), transportista: String(data[i][6] || ''), cliente: String(data[i][1] || ''), guia: String(data[i][3] || ''), numeroEnvio: String(data[i][12] || '') } };
      }
    }
    return { success: false, error: 'Despacho no encontrado' };
  } catch (e) { return { success: false, error: e.message }; }
}

function guardarFotoEntrega(notaVenta, fotoBase64) {
  try {
    if (!notaVenta || !fotoBase64) return { success: false, error: 'N.V y foto son requeridos' };
    if (fotoBase64.length > 7000000) return { success: false, error: 'Imagen excede 5MB' };
    
    var folderName = 'Fotos_Entregas';
    var folders = DriveApp.getFoldersByName(folderName);
    var folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(folderName);
    
    var base64Data = fotoBase64.replace(/^data:image\/\w+;base64,/, '');
    var blob = Utilities.newBlob(Utilities.base64Decode(base64Data), 'image/jpeg', 'entrega_' + notaVenta + '_' + new Date().getTime() + '.jpg');
    var file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    return { success: true, urlFoto: file.getUrl(), fileId: file.getId() };
  } catch (e) { return { success: false, error: 'Error al guardar foto: ' + e.message }; }
}

function confirmarEntrega(entregaData) {
  try {
    if (!entregaData.nVenta) return { success: false, error: 'N.V es requerido' };
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_ENTREGAS);
    
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_ENTREGAS);
      sheet.appendRow(['NV', 'FacturaGD', 'Recepcion', 'Transportista', 'Estado', 'NombreReceptor', 'FotoURL', 'Observaciones']);
    }
    
    var datosPrecargados = precargarDatosEntrega(entregaData.nVenta);
    if (!datosPrecargados.success) return datosPrecargados;
    
    var fechaRecepcion = new Date();
    var data = sheet.getDataRange().getValues();
    var filaExistente = -1;
    
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0] || '').trim() === entregaData.nVenta.trim()) { filaExistente = i + 1; break; }
    }
    
    var registro = [entregaData.nVenta, datosPrecargados.datos.facturaGD, fechaRecepcion, datosPrecargados.datos.transportista, 'ENTREGADA', entregaData.nombreReceptor || '', entregaData.fotoUrl || '', entregaData.observaciones || ''];
    
    if (filaExistente > 0) sheet.getRange(filaExistente, 1, 1, 8).setValues([registro]);
    else sheet.appendRow(registro);
    
    actualizarEstadoOrdenEntrega(entregaData.nVenta, 'ENTREGADA');
    registrarMovimientoEntrega(entregaData.nVenta, entregaData.usuario || 'Sistema');
    
    return { success: true, nVenta: entregaData.nVenta, estado: 'ENTREGADA', fechaRecepcion: fechaRecepcion };
  } catch (e) { return { success: false, error: 'Error al confirmar entrega: ' + e.message }; }
}

function actualizarEstadoOrdenEntrega(notaVenta, nuevoEstado) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('ORDENES');
    if (!sheet) return;
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][1] || '').trim() === notaVenta.trim()) sheet.getRange(i + 1, 3).setValue(nuevoEstado);
    }
  } catch (e) { Logger.log('Error: ' + e.message); }
}

function registrarMovimientoEntrega(notaVenta, usuario) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_MOVIMIENTOS);
    if (!sheet) { sheet = ss.insertSheet(SHEET_MOVIMIENTOS); sheet.appendRow(['ID', 'FechaHora', 'TipoMovimiento', 'Codigo', 'Cantidad', 'Ubicacion', 'Referencia', 'Usuario']); }
    sheet.appendRow(['MOV-' + new Date().getTime(), new Date(), 'ENTREGA_CONFIRMADA', notaVenta, 0, '', 'Entrega confirmada', usuario || 'Sistema']);
  } catch (e) { Logger.log('Error: ' + e.message); }
}

function getHistorialEntregas(filtros) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_ENTREGAS);
    if (!sheet) return { success: true, entregas: [], total: 0 };
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) return { success: true, entregas: [], total: 0 };
    
    var data = sheet.getRange(2, 1, lastRow - 1, 8).getValues();
    var entregas = [];
    
    for (var i = 0; i < data.length; i++) {
      var row = data[i];
      entregas.push({ nVenta: String(row[0] || ''), facturaGD: String(row[1] || ''), recepcion: row[2], transportista: String(row[3] || ''), estado: String(row[4] || ''), nombreReceptor: String(row[5] || ''), fotoUrl: String(row[6] || ''), observaciones: String(row[7] || ''), rowIndex: i + 2 });
    }
    entregas.sort(function(a, b) { return new Date(b.recepcion) - new Date(a.recepcion); });
    return { success: true, entregas: entregas, total: entregas.length };
  } catch (e) { return { success: false, error: e.message }; }
}

function getEstadisticasEntregas() {
  try {
    var resultado = getHistorialEntregas();
    if (!resultado.success) return resultado;
    var stats = { total: resultado.entregas.length, pendientes: 0, enCamino: 0, entregadas: 0, rechazadas: 0, reprogramadas: 0 };
    resultado.entregas.forEach(function(e) {
      if (e.estado === 'PENDIENTE') stats.pendientes++;
      else if (e.estado === 'EN CAMINO') stats.enCamino++;
      else if (e.estado === 'ENTREGADA') stats.entregadas++;
      else if (e.estado === 'RECHAZADA') stats.rechazadas++;
      else if (e.estado === 'REPROGRAMADA') stats.reprogramadas++;
    });
    return { success: true, stats: stats };
  } catch (e) { return { success: false, error: e.message }; }
}

// ==================== NUEVAS FUNCIONES PARA MÓDULO ENTREGAS ====================

/**
 * Obtiene todas las entregas con la nueva estructura de 13 columnas
 * Columnas: A-N.V, B-Factura/GD, C-Guía, D-Transportista, E-ValorFlete, F-Estado, G-Receptor, H-Foto, I-Observaciones, J-FechaEntrega, K-InicioRuta, L-FinEntrega, M-Duracion
 * 
 * FILTRO POR USUARIO:
 * - Transportistas: Solo ven entregas asignadas a su nombre
 * - Supervisores/Admin/Gerencia: Ven todas las entregas
 * 
 * @param {string} sessionId - ID de sesión del usuario (opcional)
 */
function getEntregas(sessionId) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // OPTIMIZACIÓN: No sincronizar en cada lectura para velocidad instantánea
    // La sincronización se debe hacer en segundo plano o manual
    // sincronizarEntregasConDespachos();
    
    var sheet = getOrCreateEntregasSheet(ss);
    
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      return { 
        success: true, 
        entregas: [], 
        estadisticas: { total: 0, pendientes: 0, enRuta: 0, entregadas: 0 }
      };
    }
    
    // Obtener información del usuario para filtrar
    var filtrarPorTransportista = false;
    var nombreTransportista = '';
    var userRol = '';
    
    if (sessionId) {
      try {
        var user = getUserBySession(sessionId);
        if (user) {
          userRol = String(user.rol || '').toUpperCase();
          var nombreUsuario = String(user.nombre || '').toUpperCase();
          
          // Roles que ven TODO: ADMIN, SUPERVISOR, GERENCIA, ADMINISTRADOR, COORDINADOR
          var rolesConVistaTotal = ['ADMIN', 'ADMINISTRADOR', 'SUPERVISOR', 'GERENCIA', 'GERENTE', 'COORDINADOR'];
          
          if (rolesConVistaTotal.indexOf(userRol) === -1) {
            // Es transportista u otro rol - filtrar por su nombre
            filtrarPorTransportista = true;
            nombreTransportista = nombreUsuario;
            Logger.log('getEntregas: Filtrando por transportista: ' + nombreTransportista);
          } else {
            Logger.log('getEntregas: Usuario con rol ' + userRol + ' - mostrando todas las entregas');
          }
        }
      } catch (e) {
        Logger.log('getEntregas: Error obteniendo usuario: ' + e.message);
      }
    }
    
    // Leemos hasta la columna 13 (M)
    var data = sheet.getRange(2, 1, lastRow - 1, 13).getValues();
    var entregas = [];
    var stats = { total: 0, pendientes: 0, enRuta: 0, entregadas: 0, noEntregadas: 0 };
    
    for (var i = 0; i < data.length; i++) {
      var row = data[i];
      var nv = String(row[0] || '').trim();
      if (!nv) continue;
      
      var transportistaEntrega = String(row[3] || '').toUpperCase().trim();
      
      // Filtrar por transportista si es necesario
      if (filtrarPorTransportista) {
        // Comparar nombres (puede ser parcial)
        if (transportistaEntrega.indexOf(nombreTransportista) === -1 && 
            nombreTransportista.indexOf(transportistaEntrega) === -1 &&
            transportistaEntrega !== nombreTransportista) {
          // No coincide, saltar esta entrega
          continue;
        }
      }
      
      var estado = String(row[5] || 'PENDIENTE').toUpperCase().trim();
      var fechaEntrega = row[9];
      
      // Formatear fecha de entrega
      var fechaEntregaStr = '';
      if (fechaEntrega) {
        try {
          if (fechaEntrega instanceof Date) {
            fechaEntregaStr = Utilities.formatDate(fechaEntrega, Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm');
          } else {
            fechaEntregaStr = String(fechaEntrega);
          }
        } catch (e) {
          fechaEntregaStr = String(fechaEntrega);
        }
      }
      
      entregas.push({
        nv: nv,                                      // A - N.V (auto)
        facturaGD: String(row[1] || '').trim(),     // B - Factura/GD (auto)
        guia: String(row[2] || '').trim(),          // C - Guía (auto)
        transportista: String(row[3] || '').trim(), // D - Transportista (auto)
        bultos: Number(row[4]) || 1,                // E - Bultos (auto)
        estado: estado,                              // F - Estado (manual)
        receptor: String(row[6] || '').trim(),      // G - Receptor (manual)
        foto: String(row[7] || '').trim(),          // H - Foto (manual)
        observaciones: String(row[8] || '').trim(), // I - Observaciones (manual)
        fechaEntrega: fechaEntregaStr,              // J - Fecha Entrega (manual)
        inicioRuta: row[10] ? new Date(row[10]).getTime() : null, // K - Inicio Ruta (Timestamp)
        finEntrega: row[11] ? new Date(row[11]).getTime() : null, // L - Fin Entrega (Timestamp)
        duracion: String(row[12] || ''),            // M - Duracion
        rowIndex: i + 2
      });
      
      stats.total++;
      if (estado === 'PENDIENTE') stats.pendientes++;
      else if (estado === 'EN_RUTA' || estado === 'EN RUTA' || estado === 'EN CAMINO') stats.enRuta++;
      else if (estado === 'ENTREGADO' || estado === 'ENTREGADA') stats.entregadas++;
      else if (estado === 'NO_ENTREGADO' || estado === 'NO ENTREGADO' || estado === 'RECHAZADA' || estado === 'RECHAZADO') stats.noEntregadas++;
      else if (estado === 'REPROGRAMADA' || estado === 'REPROGRAMADO') stats.pendientes++; 
      else stats.pendientes++;
    }
    
    return {
      success: true,
      entregas: entregas,
      estadisticas: stats,
      total: entregas.length,
      filtradoPor: filtrarPorTransportista ? nombreTransportista : null
    };
    
  } catch (e) {
    Logger.log('Error en getEntregas: ' + e.message);
    return { success: false, error: e.message, entregas: [], estadisticas: { total: 0, pendientes: 0, enRuta: 0, entregadas: 0 } };
  }
}

/**
 * Guarda o actualiza una entrega (campos manuales del transportista)
 * Solo actualiza las columnas F-J (Estado, Receptor, Foto, Observaciones, FechaEntrega) y K-M (Timers)
 * Las columnas A-E son de solo lectura (auto-pobladas desde Despachos)
 * REGISTRA EL CAMBIO EN DELIVERY_LOG
 * 
 * IMPORTANTE: Guarda en la FILA EXACTA donde está la N.V especificada
 */
function guardarEntrega(datos) {
  try {
    if (!datos.nv) {
      Logger.log('ERROR: N.V es requerido');
      return { success: false, error: 'N.V es requerido' };
    }
    
    Logger.log('===== GUARDAR ENTREGA =====');
    Logger.log('N.V a guardar: ' + datos.nv);
    Logger.log('Estado: ' + datos.estado);
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = getOrCreateEntregasSheet(ss);
    
    // Si hay foto en base64, guardarla en Drive
    var fotoUrl = datos.foto || '';
    if (fotoUrl && fotoUrl.indexOf('data:image') === 0) {
      Logger.log('Guardando foto en Google Drive...');
      var resultadoFoto = guardarFotoEntrega(datos.nv, fotoUrl);
      if (resultadoFoto.success) {
        fotoUrl = resultadoFoto.urlFoto;
      } else {
        fotoUrl = ''; 
      }
    }
    
    // ============ BUSCAR LA FILA CORRECTA SEGÚN N.V ============
    var data = sheet.getDataRange().getValues();
    var filaExistente = -1;
    var estadoAnterior = 'PENDIENTE';
    var cliente = '';
    var transportista = '';
    var inicioRuta = null;
    var finEntrega = null;
    
    // Normalizar NV de entrada (limpiar espacios y convertir a string)
    var nvBuscada = String(datos.nv || '').trim();

    for (var i = 1; i < data.length; i++) {
        // Columna A (índice 0) es N.V - Normalizar valor de la celda
      if (String(data[i][0] || '').trim() === nvBuscada) {
        filaExistente = i + 1; 
        estadoAnterior = String(data[i][5] || 'PENDIENTE'); // Columna F
        cliente = String(data[i][1] || ''); // Columna B
        transportista = String(data[i][3] || ''); // Columna D
        inicioRuta = data[i][10]; // Columna K (índice 10)
        finEntrega = data[i][11]; // Columna L (índice 11)
        break;
      }
    }
    
    // Si no existe, intentar sincronizar primero o rechazar
    if (filaExistente === -1) {
       Logger.log('N.V no encontrada en Entregas, intentando sincronización rápida...');
       // Intento de auto-sincronización rápida
       var syncRes = sincronizarEntregasConDespachos();
       if(syncRes.success) {
           // Reintentar búsqueda
           var data2 = sheet.getDataRange().getValues();
           for (var k = 1; k < data2.length; k++) {
             if (String(data2[k][0] || '').trim() === nvBuscada) {
               filaExistente = k + 1;
               // Recargar datos base
               estadoAnterior = String(data2[k][5] || 'PENDIENTE');
               inicioRuta = data2[k][10];
               break;
             }
           }
       }
       
       if (filaExistente === -1) {
          return { success: false, error: 'Entrega no encontrada. Verifique que la N.V exista en Despachos.' };
       }
    }
    
    var fechaEntrega = new Date();
    var usuario = datos.usuario || transportista || 'Sistema';
    var nuevoEstado = (datos.estado || 'PENDIENTE').toUpperCase();
    var duracionStr = '';
    
    // ============ LOGICA DE TIMER (SLA) ============
    
    // 1. Inicio de Ruta: Si cambia a EN RUTA/EN CAMINO y no tiene fecha de inicio
    if ((nuevoEstado === 'EN RUTA' || nuevoEstado === 'EN CAMINO') && !inicioRuta) {
        inicioRuta = new Date(); // Set current time
        Logger.log('Iniciando timer para N.V ' + datos.nv);
    }
    
    // 2. Fin de Entrega: Si cambia a ENTREGADO/ENTREGADA
    if ((nuevoEstado === 'ENTREGADO' || nuevoEstado === 'ENTREGADA') && inicioRuta) {
        finEntrega = new Date();
        // Calcular duración
        var diffMs = finEntrega - new Date(inicioRuta);
        var diffHrs = Math.floor((diffMs % 86400000) / 3600000); // hours
        var diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000); // minutes
        duracionStr = diffHrs + 'h ' + diffMins + 'm';
        Logger.log('Finalizando timer para N.V ' + datos.nv + ': ' + duracionStr);
    }
    
    // ============ ACTUALIZAR SOLO COLUMNAS F-M EN ENTREGA ============
    // Columna F es índice 6 (1-based)
    var camposManuales = [
      nuevoEstado,                    // F
      datos.receptor || '',           // G
      fotoUrl,                        // H
      datos.observaciones || '',      // I
      fechaEntrega,                   // J
      inicioRuta,                     // K
      finEntrega,                     // L
      duracionStr                     // M
    ];
    
    sheet.getRange(filaExistente, 6, 1, 8).setValues([camposManuales]);
    
    // ============ ACTUALIZAR HOJA DESPACHOS Y N.V DIARIAS ============
    // Requisito: "Apenas se cambie de estados se tienen que actualizar en todos los modulos"
    if (nuevoEstado !== estadoAnterior) {
        // 1. Actualizar Despachos
        actualizarEstadoDespacho(datos.nv, nuevoEstado);
        
        // 2. Actualizar N.V DIARIAS (Master)
        actualizarEstadoNVDiariasDelivery(datos.nv, nuevoEstado);
        
        // 3. Log
        registrarCambioEstadoEntrega(datos.nv, usuario, cliente, estadoAnterior, nuevoEstado, datos.receptor, !!fotoUrl, datos.observaciones);
    }
    
    // FORZAR SINCRONIZACIÓN DE ESTADO EN ENTREGAS
    // A veces la escritura falla silenciosamente o el cache interfiere. 
    // Vamos a escribir explícitamente en la celda de estado una vez más para asegurar.
    try {
       sheet.getRange(filaExistente, 6).setValue(nuevoEstado);
    } catch(e) { console.error('Error doble escritura estado:', e); }

    return { 
      success: true, 
      nv: datos.nv, 
      estado: nuevoEstado,
      fotoGuardada: !!fotoUrl,
      mensaje: 'Estado actualizado a ' + nuevoEstado,
      timer: {
          inicio: inicioRuta ? inicioRuta.getTime() : null,
          duracion: duracionStr
      }
    };
    
  } catch (e) {
    Logger.log('ERROR en guardarEntrega: ' + e.message);
    return { success: false, error: e.message };
  }
}

/**
 * Actualiza el estado en la hoja DESPACHO
 */
function actualizarEstadoDespacho(nv, nuevoEstado) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Despachos') || ss.getSheetByName('DESPACHO') || ss.getSheetByName('DESPACHOS');
    if (!sheet) return;
    
    var data = sheet.getDataRange().getValues();
    // Buscar columna N.V (H = 7) y Estado (O = 14) según la definición en Dispatch.gs/Code.gs
    // COL_ENTREGAS_DESPACHO define N_NV=7, ESTADO=14
    var COL_NV = 7; 
    var COL_ESTADO = 14;
    
    for (var i = 1; i < data.length; i++) {
        if (String(data[i][COL_NV] || '').trim() === nv.trim()) {
            sheet.getRange(i + 1, COL_ESTADO + 1).setValue(nuevoEstado);
            Logger.log('Actualizado Despachos: ' + nv + ' -> ' + nuevoEstado);
            break; // Asumimos NV única
        }
    }
  } catch(e) {
    Logger.log('Error actualizando Despacho: ' + e.message);
  }
}

/**
 * Actualiza estado en hoja N.V DIARIAS
 */
// NOTA: Renombrada para evitar conflicto con FlowManager.gs
function actualizarEstadoNVDiariasDelivery(nv, nuevoEstado) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('N.V DIARIAS');
    if (!sheet) return;
    
    // Asumimos N.V en Col B (índice 1) y Estado en Col C (índice 2)
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][1] || '').trim() === nv.trim()) {
        sheet.getRange(i + 1, 3).setValue(nuevoEstado); 
        Logger.log('Actualizado N.V DIARIAS: ' + nv + ' -> ' + nuevoEstado);
      }
    }
  } catch (e) {
    Logger.log('Error actualizando N.V DIARIAS: ' + e.message);
  }
}

// Compatibilidad con funciones anteriores
function registerDelivery(d) { return confirmarEntrega({ nVenta: d.ordenId || d.nVenta, nombreReceptor: d.receptorNombre, observaciones: d.notas, fotoUrl: d.firma, usuario: d.usuario }); }
function confirmDelivery(d) { return confirmarEntrega(d); }
function updateDeliveryStatus(id, s) { return { success: true }; }
function getDeliveryStats() { return getEstadisticasEntregas(); }
function getPendingDeliveries() { return getEntregasPendientes(); }
function getDeliveryHistory(f) { return getHistorialEntregas(f); }
function captureSignature(id, d) { return guardarFotoEntrega(id, d); }

/**
 * Actualiza solo el estado de una entrega (auto-save al cambiar select)
 * REGISTRA EL CAMBIO EN DELIVERY_LOG
 * @param {string} nv - Número de N.V
 * @param {string} nuevoEstado - Nuevo estado (PENDIENTE, EN CAMINO, ENTREGADA, RECHAZADA, REPROGRAMADA)
 * @param {string} usuario - Usuario que realiza el cambio (opcional)
 * @returns {Object} {success, mensaje, error}
 */
function actualizarEstadoEntrega(nv, nuevoEstado, usuario) {
  try {
    if (!nv) return { success: false, error: 'N.V es requerido' };
    if (!nuevoEstado) return { success: false, error: 'Estado es requerido' };
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = getOrCreateEntregasSheet(ss);
    
    var data = sheet.getDataRange().getValues();
    var filaEncontrada = -1;
    var estadoAnterior = 'PENDIENTE';
    var cliente = '';
    var transportista = '';
    
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0] || '').trim() === nv.trim()) {
        filaEncontrada = i + 1;
        estadoAnterior = String(data[i][5] || 'PENDIENTE');
        cliente = String(data[i][4] || '');
        transportista = String(data[i][3] || '');
        break;
      }
    }
    
    if (filaEncontrada === -1) {
      return { success: false, error: 'Entrega no encontrada para N.V: ' + nv };
    }
    
    // Actualizar solo columna F (Estado)
    sheet.getRange(filaEncontrada, 6).setValue(nuevoEstado);
    
    // REGISTRAR CAMBIO EN DELIVERY_LOG
    if (nuevoEstado !== estadoAnterior) {
      try {
        registrarCambioEstadoEntrega(
          nv,
          usuario || transportista || 'Sistema',
          cliente,
          estadoAnterior,
          nuevoEstado,
          '', // receptor
          false, // tieneFoto
          'Cambio de estado automático'
        );
      } catch (logError) {
        Logger.log('Error registrando en DeliveryLog: ' + logError.message);
      }
    }
    
    // Si el estado es ENTREGADA, actualizar también en N.V DIARIAS
    if (nuevoEstado === 'ENTREGADA' || nuevoEstado === 'ENTREGADO') {
      actualizarEstadoNVDiariasDelivery(nv, 'ENTREGADO');
    }
    
    Logger.log('Estado actualizado: N.V ' + nv + ' -> ' + nuevoEstado);
    
    return {
      success: true,
      nv: nv,
      estado: nuevoEstado,
      mensaje: 'Estado actualizado correctamente'
    };
    
  } catch (e) {
    Logger.log('Error en actualizarEstadoEntrega: ' + e.message);
    return { success: false, error: e.message };
  }
}