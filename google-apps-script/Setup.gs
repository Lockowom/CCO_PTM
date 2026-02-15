/**
 * Setup.gs - Funciones de configuración inicial del sistema
 * Incluye la generación de ubicaciones del Layout
 */

/**
 * Genera todas las ubicaciones del almacén en la hoja LAYOUT
 * Ejecutar esta función una vez para poblar las ubicaciones
 */
function generarTodasLasUbicaciones() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('LAYOUT');
  
  // Crear hoja si no existe
  if (!sheet) {
    sheet = ss.insertSheet('LAYOUT');
  } else {
    // Limpiar datos existentes
    sheet.clear();
  }
  
  // Headers
  sheet.appendRow(['Ubicacion', 'Pasillo', 'Columna', 'Nivel', 'Estado', 'Tipo', 'FechaCreacion']);
  
  var ubicaciones = [];
  var fechaCreacion = new Date();
  
  // ==================== PASILLO A ====================
  // Nivel 03: A-01-03 a A-50-03
  for (var i = 1; i <= 50; i++) {
    var col = i < 10 ? '0' + i : '' + i;
    ubicaciones.push(['A-' + col + '-03', 'A', col, '03', 'DISPONIBLE', 'RACK', fechaCreacion]);
  }
  // Nivel 02: A-01-02 a A-50-02
  for (var i = 1; i <= 50; i++) {
    var col = i < 10 ? '0' + i : '' + i;
    ubicaciones.push(['A-' + col + '-02', 'A', col, '02', 'DISPONIBLE', 'RACK', fechaCreacion]);
  }
  // Nivel 01: A-01-01 a A-50-01
  for (var i = 1; i <= 50; i++) {
    var col = i < 10 ? '0' + i : '' + i;
    ubicaciones.push(['A-' + col + '-01', 'A', col, '01', 'DISPONIBLE', 'RACK', fechaCreacion]);
  }
  
  // ==================== PASILLO B ====================
  // Nivel 02: B-01-02 a B-50-02
  for (var i = 1; i <= 50; i++) {
    var col = i < 10 ? '0' + i : '' + i;
    ubicaciones.push(['B-' + col + '-02', 'B', col, '02', 'DISPONIBLE', 'RACK', fechaCreacion]);
  }
  // Nivel 01: B-01-01 a B-50-01
  for (var i = 1; i <= 50; i++) {
    var col = i < 10 ? '0' + i : '' + i;
    ubicaciones.push(['B-' + col + '-01', 'B', col, '01', 'DISPONIBLE', 'RACK', fechaCreacion]);
  }
  
  // ==================== PASILLO C ====================
  // Nivel 02: C-01-02 a C-50-02
  for (var i = 1; i <= 50; i++) {
    var col = i < 10 ? '0' + i : '' + i;
    ubicaciones.push(['C-' + col + '-02', 'C', col, '02', 'DISPONIBLE', 'RACK', fechaCreacion]);
  }
  // Nivel 01: C-01-01 a C-50-01
  for (var i = 1; i <= 50; i++) {
    var col = i < 10 ? '0' + i : '' + i;
    ubicaciones.push(['C-' + col + '-01', 'C', col, '01', 'DISPONIBLE', 'RACK', fechaCreacion]);
  }
  
  // ==================== PASILLO D ====================
  // Nivel 04: D-01-04 a D-44-04
  for (var i = 1; i <= 44; i++) {
    var col = i < 10 ? '0' + i : '' + i;
    ubicaciones.push(['D-' + col + '-04', 'D', col, '04', 'DISPONIBLE', 'RACK', fechaCreacion]);
  }
  // Nivel 03: D-01-03 a D-20-03, D-23-03 a D-44-03 (gap en 21-22)
  for (var i = 1; i <= 20; i++) {
    var col = i < 10 ? '0' + i : '' + i;
    ubicaciones.push(['D-' + col + '-03', 'D', col, '03', 'DISPONIBLE', 'RACK', fechaCreacion]);
  }
  for (var i = 23; i <= 44; i++) {
    var col = '' + i;
    ubicaciones.push(['D-' + col + '-03', 'D', col, '03', 'DISPONIBLE', 'RACK', fechaCreacion]);
  }
  // Nivel 02: D-01-02 a D-20-02, D-23-02 a D-44-02
  for (var i = 1; i <= 20; i++) {
    var col = i < 10 ? '0' + i : '' + i;
    ubicaciones.push(['D-' + col + '-02', 'D', col, '02', 'DISPONIBLE', 'RACK', fechaCreacion]);
  }
  for (var i = 23; i <= 44; i++) {
    var col = '' + i;
    ubicaciones.push(['D-' + col + '-02', 'D', col, '02', 'DISPONIBLE', 'RACK', fechaCreacion]);
  }
  // Nivel 01: D-01-01 a D-20-01, D-23-01 a D-44-01
  for (var i = 1; i <= 20; i++) {
    var col = i < 10 ? '0' + i : '' + i;
    ubicaciones.push(['D-' + col + '-01', 'D', col, '01', 'DISPONIBLE', 'RACK', fechaCreacion]);
  }
  for (var i = 23; i <= 44; i++) {
    var col = '' + i;
    ubicaciones.push(['D-' + col + '-01', 'D', col, '01', 'DISPONIBLE', 'RACK', fechaCreacion]);
  }
  
  // ==================== PASILLO E ====================
  // Nivel 03: E-01-03 a E-32-03
  for (var i = 1; i <= 32; i++) {
    var col = i < 10 ? '0' + i : '' + i;
    ubicaciones.push(['E-' + col + '-03', 'E', col, '03', 'DISPONIBLE', 'RACK', fechaCreacion]);
  }
  // Nivel 02: E-01-02 a E-32-02
  for (var i = 1; i <= 32; i++) {
    var col = i < 10 ? '0' + i : '' + i;
    ubicaciones.push(['E-' + col + '-02', 'E', col, '02', 'DISPONIBLE', 'RACK', fechaCreacion]);
  }
  // Nivel 01: E-01-01 a E-32-01
  for (var i = 1; i <= 32; i++) {
    var col = i < 10 ? '0' + i : '' + i;
    ubicaciones.push(['E-' + col + '-01', 'E', col, '01', 'DISPONIBLE', 'RACK', fechaCreacion]);
  }
  
  // ==================== PASILLO F ====================
  // Nivel 04: F-01-04 a F-32-04
  for (var i = 1; i <= 32; i++) {
    var col = i < 10 ? '0' + i : '' + i;
    ubicaciones.push(['F-' + col + '-04', 'F', col, '04', 'DISPONIBLE', 'RACK', fechaCreacion]);
  }
  // Nivel 03: F-01-03 a F-32-03
  for (var i = 1; i <= 32; i++) {
    var col = i < 10 ? '0' + i : '' + i;
    ubicaciones.push(['F-' + col + '-03', 'F', col, '03', 'DISPONIBLE', 'RACK', fechaCreacion]);
  }
  // Nivel 02: F-01-02 a F-32-02
  for (var i = 1; i <= 32; i++) {
    var col = i < 10 ? '0' + i : '' + i;
    ubicaciones.push(['F-' + col + '-02', 'F', col, '02', 'DISPONIBLE', 'RACK', fechaCreacion]);
  }
  // Nivel 01: F-01-01 a F-32-01
  for (var i = 1; i <= 32; i++) {
    var col = i < 10 ? '0' + i : '' + i;
    ubicaciones.push(['F-' + col + '-01', 'F', col, '01', 'DISPONIBLE', 'RACK', fechaCreacion]);
  }
  
  // ==================== PASILLO G ====================
  // Nivel 04: G-01-04 a G-32-04
  for (var i = 1; i <= 32; i++) {
    var col = i < 10 ? '0' + i : '' + i;
    ubicaciones.push(['G-' + col + '-04', 'G', col, '04', 'DISPONIBLE', 'RACK', fechaCreacion]);
  }
  // Nivel 03: G-01-03 a G-32-03
  for (var i = 1; i <= 32; i++) {
    var col = i < 10 ? '0' + i : '' + i;
    ubicaciones.push(['G-' + col + '-03', 'G', col, '03', 'DISPONIBLE', 'RACK', fechaCreacion]);
  }
  // Nivel 02: G-01-02 a G-32-02
  for (var i = 1; i <= 32; i++) {
    var col = i < 10 ? '0' + i : '' + i;
    ubicaciones.push(['G-' + col + '-02', 'G', col, '02', 'DISPONIBLE', 'RACK', fechaCreacion]);
  }
  // Nivel 01: G-01-01 a G-32-01
  for (var i = 1; i <= 32; i++) {
    var col = i < 10 ? '0' + i : '' + i;
    ubicaciones.push(['G-' + col + '-01', 'G', col, '01', 'DISPONIBLE', 'RACK', fechaCreacion]);
  }
  
  // ==================== PASILLO H ====================
  // Nivel 04: H-01-04 a H-06-04
  for (var i = 1; i <= 6; i++) {
    var col = i < 10 ? '0' + i : '' + i;
    ubicaciones.push(['H-' + col + '-04', 'H', col, '04', 'DISPONIBLE', 'RACK', fechaCreacion]);
  }
  // Nivel 03: H-01-03 a H-06-03
  for (var i = 1; i <= 6; i++) {
    var col = i < 10 ? '0' + i : '' + i;
    ubicaciones.push(['H-' + col + '-03', 'H', col, '03', 'DISPONIBLE', 'RACK', fechaCreacion]);
  }
  // Nivel 02: H-01-02 a H-06-02
  for (var i = 1; i <= 6; i++) {
    var col = i < 10 ? '0' + i : '' + i;
    ubicaciones.push(['H-' + col + '-02', 'H', col, '02', 'DISPONIBLE', 'RACK', fechaCreacion]);
  }
  // Nivel 01: H-01-01 a H-06-01
  for (var i = 1; i <= 6; i++) {
    var col = i < 10 ? '0' + i : '' + i;
    ubicaciones.push(['H-' + col + '-01', 'H', col, '01', 'DISPONIBLE', 'RACK', fechaCreacion]);
  }
  
  // ==================== PASILLO I ====================
  // Nivel 03: I-01-03 a I-12-03
  for (var i = 1; i <= 12; i++) {
    var col = i < 10 ? '0' + i : '' + i;
    ubicaciones.push(['I-' + col + '-03', 'I', col, '03', 'DISPONIBLE', 'RACK', fechaCreacion]);
  }
  // Nivel 02: I-01-02 a I-12-02
  for (var i = 1; i <= 12; i++) {
    var col = i < 10 ? '0' + i : '' + i;
    ubicaciones.push(['I-' + col + '-02', 'I', col, '02', 'DISPONIBLE', 'RACK', fechaCreacion]);
  }
  // Nivel 01: I-01-01 a I-12-01
  for (var i = 1; i <= 12; i++) {
    var col = i < 10 ? '0' + i : '' + i;
    ubicaciones.push(['I-' + col + '-01', 'I', col, '01', 'DISPONIBLE', 'RACK', fechaCreacion]);
  }
  
  // ==================== ZONAS DE TRÁNSITO ====================
  ubicaciones.push(['TRANSITO-A', 'TRANSITO', '00', '00', 'DISPONIBLE', 'TRANSITO', fechaCreacion]);
  ubicaciones.push(['TRANSITO-B', 'TRANSITO', '00', '00', 'DISPONIBLE', 'TRANSITO', fechaCreacion]);
  ubicaciones.push(['TRANSITO-C', 'TRANSITO', '00', '00', 'DISPONIBLE', 'TRANSITO', fechaCreacion]);
  ubicaciones.push(['TRANSITO-D', 'TRANSITO', '00', '00', 'DISPONIBLE', 'TRANSITO', fechaCreacion]);
  ubicaciones.push(['TRANSITO-E', 'TRANSITO', '00', '00', 'DISPONIBLE', 'TRANSITO', fechaCreacion]);
  ubicaciones.push(['TRANSITO-F', 'TRANSITO', '00', '00', 'DISPONIBLE', 'TRANSITO', fechaCreacion]);
  
  // Insertar todas las ubicaciones en lote
  if (ubicaciones.length > 0) {
    sheet.getRange(2, 1, ubicaciones.length, 7).setValues(ubicaciones);
  }
  
  // Formatear hoja
  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, 7).setFontWeight('bold').setBackground('#4a5568').setFontColor('white');
  sheet.autoResizeColumns(1, 7);
  
  Logger.log('Se generaron ' + ubicaciones.length + ' ubicaciones en la hoja LAYOUT');
  
  return {
    success: true,
    totalUbicaciones: ubicaciones.length,
    mensaje: 'Se generaron ' + ubicaciones.length + ' ubicaciones correctamente'
  };
}

/**
 * Función para ejecutar desde el menú o manualmente
 */
function menuGenerarUbicaciones() {
  var resultado = generarTodasLasUbicaciones();
  if (resultado.success) {
    SpreadsheetApp.getUi().alert('Éxito', resultado.mensaje, SpreadsheetApp.getUi().ButtonSet.OK);
  } else {
    SpreadsheetApp.getUi().alert('Error', resultado.error || 'Error desconocido', SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/**
 * Agrega menú personalizado al abrir la hoja
 */
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('⚙️ Configuración')
    .addItem('🏭 Generar Ubicaciones Layout', 'menuGenerarUbicaciones')
    .addSeparator()
    .addItem('📊 Ver Estadísticas', 'mostrarEstadisticas')
    .addToUi();

  // Agregar menú de TMS (Importador)
  if (typeof createTMSMenu === 'function') {
    createTMSMenu();
  }
}

/**
 * Muestra estadísticas del layout
 */
function mostrarEstadisticas() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('LAYOUT');
  
  if (!sheet) {
    SpreadsheetApp.getUi().alert('La hoja LAYOUT no existe. Ejecute primero "Generar Ubicaciones Layout".');
    return;
  }
  
  var lastRow = sheet.getLastRow();
  var totalUbicaciones = lastRow - 1; // Menos el header
  
  var data = sheet.getDataRange().getValues();
  var pasillos = {};
  
  for (var i = 1; i < data.length; i++) {
    var pasillo = data[i][1];
    if (!pasillos[pasillo]) pasillos[pasillo] = 0;
    pasillos[pasillo]++;
  }
  
  var mensaje = 'Total de ubicaciones: ' + totalUbicaciones + '\n\n';
  mensaje += 'Por pasillo:\n';
  for (var p in pasillos) {
    mensaje += '  ' + p + ': ' + pasillos[p] + ' ubicaciones\n';
  }
  
  SpreadsheetApp.getUi().alert('Estadísticas del Layout', mensaje, SpreadsheetApp.getUi().ButtonSet.OK);
}
