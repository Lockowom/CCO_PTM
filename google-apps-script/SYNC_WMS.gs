var SUPABASE_URL = 'https://vtrtyzbgpsvqwbfoudaf.supabase.co';
var SUPABASE_KEY = 'sb_publishable_E98rNjBu7rG9mLjgI68sAw_Wr2EIp-f';

function syncLayout() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetLayout = ss.getSheetByName('LAYOUT');
  if (!sheetLayout) return;
  var lastRow = sheetLayout.getLastRow();
  if (lastRow <= 1) return;
  var headers = sheetLayout.getRange(1, 1, 1, sheetLayout.getLastColumn()).getValues()[0];
  var data = sheetLayout.getRange(2, 1, lastRow - 1, sheetLayout.getLastColumn()).getValues();
  var col = { ubicacion: -1, pasillo: -1, columna: -1, nivel: -1, estado: -1 };
  for (var h = 0; h < headers.length; h++) {
    var name = String(headers[h] || '').toLowerCase().trim();
    if (name === 'ubicacion' || name === 'ubicación') col.ubicacion = h;
    if (name === 'pasillo') col.pasillo = h;
    if (name === 'columna') col.columna = h;
    if (name === 'nivel') col.nivel = h;
    if (name === 'estado') col.estado = h;
  }
  if (col.ubicacion === -1) col.ubicacion = 0;
  if (col.pasillo === -1) col.pasillo = 1;
  if (col.columna === -1) col.columna = 2;
  if (col.nivel === -1) col.nivel = 3;
  if (col.estado === -1) col.estado = 4;
  var registros = [];
  for (var i = 0; i < data.length; i++) {
    var ubicacion = String(data[i][col.ubicacion] || '').trim();
    if (!ubicacion) continue;
    registros.push({
      ubicacion: ubicacion.toUpperCase(),
      pasillo: String(data[i][col.pasillo] || '').trim().toUpperCase() || ubicacion.charAt(0).toUpperCase(),
      columna: parseInt(data[i][col.columna]) || 0,
      nivel: parseInt(data[i][col.nivel]) || 0,
      estado: String(data[i][col.estado] || 'DISPONIBLE').trim().toUpperCase()
    });
  }
  var batchSize = 100;
  for (var j = 0; j < registros.length; j += batchSize) {
    var batch = registros.slice(j, j + batchSize);
    var options = {
      method: 'post',
      contentType: 'application/json',
      headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + SUPABASE_KEY, Prefer: 'resolution=merge-duplicates' },
      payload: JSON.stringify(batch),
      muteHttpExceptions: true
    };
    UrlFetchApp.fetch(SUPABASE_URL + '/rest/v1/wms_layout?on_conflict=ubicacion', options);
    Utilities.sleep(100);
  }
}

function syncUbicaciones() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('UBICACIONES');
  if (!sheet) return;
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return;
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var data = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues();
  var col = { ubicacion: -1, codigo: -1, descripcion: -1, cantidad: -1, talla: -1, color: -1, serie: -1, partida: -1, pieza: -1, fecha_vencimiento: -1 };
  for (var h = 0; h < headers.length; h++) {
    var name = String(headers[h] || '').toLowerCase().trim();
    if (name === 'ubicacion' || name === 'ubicación') col.ubicacion = h;
    if (name === 'codigo' || name === 'código' || name === 'sku') col.codigo = h;
    if (name === 'descripcion' || name === 'descripción' || name === 'nombre') col.descripcion = h;
    if (name === 'cantidad' || name === 'cantidad contada' || name === 'stock' || name === 'qty') col.cantidad = h;
    if (name === 'talla' || name === 'talla del producto' || name === 'size') col.talla = h;
    if (name === 'color' || name === 'color del producto') col.color = h;
    if (name === 'serie' || name === 'sn') col.serie = h;
    if (name === 'partida' || name === 'lote') col.partida = h;
    if (name === 'pieza' || name === 'pieza del producto') col.pieza = h;
    if (name === 'fecha de vencimiento' || name === 'fecha_vencimiento' || name === 'vencimiento') col.fecha_vencimiento = h;
  }
  if (col.ubicacion === -1) col.ubicacion = 0;
  if (col.codigo === -1) col.codigo = 1;
  if (col.descripcion === -1) col.descripcion = 2;
  if (col.cantidad === -1) col.cantidad = 3;
  function toISODate(v) {
    if (Object.prototype.toString.call(v) === '[object Date]' && !isNaN(v)) {
      return Utilities.formatDate(v, Session.getScriptTimeZone(), 'yyyy-MM-dd');
    }
    var d = new Date(v);
    if (!isNaN(d)) {
      return Utilities.formatDate(d, Session.getScriptTimeZone(), 'yyyy-MM-dd');
    }
    return '';
  }
  var registros = [];
  for (var i = 0; i < data.length; i++) {
    var ubicacion = String(data[i][col.ubicacion] || '').trim();
    var codigo = String(data[i][col.codigo] || '').trim();
    if (!ubicacion || !codigo) continue;
    registros.push({
      ubicacion: ubicacion.toUpperCase(),
      codigo: codigo.toUpperCase(),
      descripcion: String(data[i][col.descripcion] || '').trim(),
      cantidad: Number(data[i][col.cantidad]) || 0,
      talla: String(data[i][col.talla] || '').trim(),
      color: String(data[i][col.color] || '').trim(),
      serie: String(col.serie !== -1 ? (data[i][col.serie] || '') : '').trim(),
      partida: String(col.partida !== -1 ? (data[i][col.partida] || '') : '').trim(),
      pieza: String(col.pieza !== -1 ? (data[i][col.pieza] || '') : '').trim(),
      fecha_vencimiento: col.fecha_vencimiento !== -1 ? toISODate(data[i][col.fecha_vencimiento]) : ''
    });
  }
  var batchSize = 200;
  for (var j = 0; j < registros.length; j += batchSize) {
    var batch = registros.slice(j, j + batchSize);
    var options = {
      method: 'post',
      contentType: 'application/json',
      headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + SUPABASE_KEY, Prefer: 'resolution=merge-duplicates' },
      payload: JSON.stringify(batch),
      muteHttpExceptions: true
    };
    UrlFetchApp.fetch(SUPABASE_URL + '/rest/v1/wms_ubicaciones?on_conflict=ubicacion,codigo', options);
    Utilities.sleep(100);
  }
}

function syncLayoutCompleto() {
  syncLayout();
  syncUbicaciones();
  // Sincronizar NV y otras hojas manuales
  syncNV();
  syncPartidas();
  syncSeries();
  syncFarmapack();
}

/**
 * Instala un trigger para que syncUbicaciones, NV y otras hojas se ejecuten automáticamente cada 10 minutos.
 * Ejecutar UNA VEZ manualmente desde el editor o el menú.
 */
function instalarActivadorAutomatico() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    var func = triggers[i].getHandlerFunction();
    if (func === 'syncUbicaciones' || func === 'syncLayoutCompleto' || func === 'syncNV' || func === 'syncManualSheets') {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
  
  // Usamos una función wrapper para sincronizar todo lo manual
  ScriptApp.newTrigger('syncManualSheets')
    .timeBased()
    .everyMinutes(10)
    .create();
    
  try {
    var ui = SpreadsheetApp.getUi();
    ui.alert('Activador instalado', 'Sincronización automática (Ubicaciones, NV, Partidas, Series, Farmapack) cada 10 minutos.', ui.ButtonSet.OK);
  } catch (e) {
    console.log('No se pudo mostrar la alerta UI (ejecución sin interfaz): ' + e.message);
  }
}

/**
 * Función wrapper para sincronizar hojas de mantenimiento manual
 */
function syncManualSheets() {
  syncUbicaciones();
  
  // Llamar a la lógica de las otras hojas manuales
  try {
    if (typeof processSheetUntilLimit !== 'undefined') {
       processSheetUntilLimit('N.V DIARIAS', 'tms_nv_diarias', mapNVDiarias);
       processSheetUntilLimit('Partidas', 'tms_partidas', mapPartidas);
       processSheetUntilLimit('Series', 'tms_series', mapSeries);
       processSheetUntilLimit('Farmapack', 'tms_farmapack', mapFarmapack);
    }
  } catch (e) {
    Logger.log('Error sincronizando hojas manuales: ' + e.message);
  }
}

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Migración WMS')
    .addItem('Subir Layout', 'syncLayout')
    .addItem('Subir Ubicaciones (Manual)', 'syncUbicaciones')
    .addItem('Subir NV (Manual)', 'syncNV')
    .addItem('Subir Partidas (Manual)', 'syncPartidas')
    .addItem('Subir Series (Manual)', 'syncSeries')
    .addItem('Subir Farmapack (Manual)', 'syncFarmapack')
    .addItem('Subir Todo', 'syncLayoutCompleto')
    .addSeparator()
    .addItem('Activar Sincronización Automática (10 min)', 'instalarActivadorAutomatico')
    .addToUi();
}

/**
 * Wrappers para menú
 */
function syncNV() {
  if (typeof processSheetUntilLimit !== 'undefined') {
     processSheetUntilLimit('N.V DIARIAS', 'tms_nv_diarias', mapNVDiarias);
  } else {
     SpreadsheetApp.getUi().alert('Error', 'Faltan librerías de TMS_Cloud_Sync', SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

function syncPartidas() {
  if (typeof processSheetUntilLimit !== 'undefined') {
     processSheetUntilLimit('Partidas', 'tms_partidas', mapPartidas);
  } else {
     SpreadsheetApp.getUi().alert('Error', 'Faltan librerías de TMS_Cloud_Sync', SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

function syncSeries() {
  if (typeof processSheetUntilLimit !== 'undefined') {
     processSheetUntilLimit('Series', 'tms_series', mapSeries);
  } else {
     SpreadsheetApp.getUi().alert('Error', 'Faltan librerías de TMS_Cloud_Sync', SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

function syncFarmapack() {
  if (typeof processSheetUntilLimit !== 'undefined') {
     processSheetUntilLimit('Farmapack', 'tms_farmapack', mapFarmapack);
  } else {
     SpreadsheetApp.getUi().alert('Error', 'Faltan librerías de TMS_Cloud_Sync', SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

 
/**
 * Genera ubicaciones para el pasillo C2 en la hoja LAYOUT.
 * Formato: C2-CC-NN donde CC = columna (01..50) y NN = nivel (por defecto 01).
 * Luego puedes ejecutar syncLayout() para enviarlas a Supabase.
 */
function generarPasilloC2() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('LAYOUT');
  if (!sheet) {
    sheet = ss.insertSheet('LAYOUT');
    sheet.appendRow(['Ubicacion', 'Pasillo', 'Columna', 'Nivel', 'Estado']);
  }
  var headers = sheet.getRange(1,1,1,sheet.getLastColumn()).getValues()[0];
  var col = { ubicacion: -1, pasillo: -1, columna: -1, nivel: -1, estado: -1 };
  for (var h = 0; h < headers.length; h++) {
    var name = String(headers[h] || '').toLowerCase().trim();
    if (name === 'ubicacion' || name === 'ubicación') col.ubicacion = h;
    if (name === 'pasillo') col.pasillo = h;
    if (name === 'columna') col.columna = h;
    if (name === 'nivel') col.nivel = h;
    if (name === 'estado') col.estado = h;
  }
  // Si faltan columnas, reescribe la cabecera estándar
  if (col.ubicacion === -1 || col.pasillo === -1 || col.columna === -1 || col.nivel === -1 || col.estado === -1) {
    sheet.clear();
    sheet.appendRow(['Ubicacion', 'Pasillo', 'Columna', 'Nivel', 'Estado']);
    col = { ubicacion: 0, pasillo: 1, columna: 2, nivel: 3, estado: 4 };
  }
  var startRow = sheet.getLastRow() + 1;
  var rows = [];
  var nivelUnico = 1; // Ajusta aquí si quieres varios niveles
  for (var c = 1; c <= 50; c++) {
    var columnaTxt = String(c).padStart(2, '0');
    var nivelTxt = String(nivelUnico).padStart(2, '0');
    var ubicacion = 'C2-' + columnaTxt + '-' + nivelTxt;
    var row = [];
    row[col.ubicacion] = ubicacion;
    row[col.pasillo] = 'C2';
    row[col.columna] = c;
    row[col.nivel] = nivelUnico;
    row[col.estado] = 'DISPONIBLE';
    // Ordenar columnas según cabecera actual
    var ordered = [row[col.ubicacion], row[col.pasillo], row[col.columna], row[col.nivel], row[col.estado]];
    rows.push(ordered);
  }
  if (rows.length) {
    sheet.getRange(startRow, 1, rows.length, rows[0].length).setValues(rows);
  }
}
