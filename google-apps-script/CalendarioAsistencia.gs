/**
 * TRACKER SIMPLE - REGISTROS ILIMITADOS
 * ======================================
 * - Registros ilimitados por día
 * - Guarda fecha y hora exacta al presionar
 * - Calendario anual que muestra cantidad de registros por día
 */

const ASISTENCIA_CONFIG = {
  HOJA_REGISTROS: 'Registros',
  HOJA_CALENDARIO: 'Calendario'
};

// ============================================
// MENÚ Y WEB APP
// ============================================

// NOTA: onOpen y doGet removidos para evitar conflicto con Code.gs
// Usar onOpenAsistencia() y doGetAsistencia() si se necesita este modulo independiente

function onOpenAsistencia() {
  SpreadsheetApp.getUi().createMenu('Tracker')
    .addItem('Inicializar Sistema', 'inicializarSistema')
    .addItem('Abrir Tracker', 'abrirWebAsistencia')
    .addSeparator()
    .addItem('Actualizar Calendario', 'actualizarCalendarioCompleto')
    .addToUi();
}

function doGetAsistencia() {
  return HtmlService.createHtmlOutputFromFile('AsistenciaWeb')
    .setTitle('Tracker')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function abrirWebAsistencia() {
  const html = HtmlService.createHtmlOutputFromFile('AsistenciaWeb')
    .setWidth(450)
    .setHeight(650);
  SpreadsheetApp.getUi().showModalDialog(html, '🚽 Tracker');
}

// ============================================
// INICIALIZACIÓN
// ============================================

function inicializarSistema() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  crearHojaRegistros(ss);
  crearHojaCalendario(ss);
  
  SpreadsheetApp.getUi().alert('✅ Sistema inicializado');
}

function crearHojaRegistros(ss) {
  let sheet = ss.getSheetByName(ASISTENCIA_CONFIG.HOJA_REGISTROS);
  if (sheet) ss.deleteSheet(sheet);
  
  sheet = ss.insertSheet(ASISTENCIA_CONFIG.HOJA_REGISTROS);
  sheet.getRange('A1:D1').setValues([['Fecha', 'Hora', 'Estado', 'Notas']]);
  sheet.getRange('A1:D1').setFontWeight('bold').setBackground('#4285f4').setFontColor('white');
  sheet.setFrozenRows(1);
  sheet.setColumnWidth(1, 100);
  sheet.setColumnWidth(2, 100);
  sheet.setColumnWidth(3, 80);
  sheet.setColumnWidth(4, 200);
}

function crearHojaCalendario(ss) {
  let sheet = ss.getSheetByName(ASISTENCIA_CONFIG.HOJA_CALENDARIO);
  if (sheet) ss.deleteSheet(sheet);
  
  sheet = ss.insertSheet(ASISTENCIA_CONFIG.HOJA_CALENDARIO);
  ss.setActiveSheet(sheet);
  ss.moveActiveSheet(1);
  
  const año = new Date().getFullYear();
  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  
  // Título
  sheet.getRange('A1').setValue(`🚽 CALENDARIO ${año}`);
  sheet.getRange('A1:H1').merge();
  sheet.getRange('A1').setFontSize(16).setFontWeight('bold').setBackground('#667eea').setFontColor('white');
  
  sheet.getRange('A2').setValue('El número indica cantidad de registros "Fui" ese día');
  sheet.getRange('A2:H2').merge();
  sheet.getRange('A2').setFontSize(10).setFontColor('#666');
  
  let filaActual = 4;
  
  meses.forEach((mes, indexMes) => {
    sheet.getRange(filaActual, 1).setValue(`📅 ${mes}`);
    sheet.getRange(filaActual, 1, 1, 8).merge();
    sheet.getRange(filaActual, 1).setFontWeight('bold').setBackground('#e8eaf6').setFontSize(12);
    filaActual++;
    
    const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    sheet.getRange(filaActual, 1, 1, 7).setValues([diasSemana]);
    sheet.getRange(filaActual, 1, 1, 7).setFontWeight('bold').setBackground('#f5f5f5').setHorizontalAlignment('center');
    sheet.getRange(filaActual, 8).setValue('Total');
    sheet.getRange(filaActual, 8).setFontWeight('bold').setBackground('#f5f5f5');
    filaActual++;
    
    const diasEnMes = new Date(año, indexMes + 1, 0).getDate();
    const primerDia = new Date(año, indexMes, 1).getDay();
    
    let dia = 1;
    let semanaInicio = filaActual;
    
    while (dia <= diasEnMes) {
      const semana = ['', '', '', '', '', '', '', ''];
      
      for (let d = (filaActual === semanaInicio ? primerDia : 0); d < 7 && dia <= diasEnMes; d++) {
        semana[d] = dia;
        dia++;
      }
      
      sheet.getRange(filaActual, 1, 1, 8).setValues([semana]);
      sheet.getRange(filaActual, 1, 1, 7).setHorizontalAlignment('center');
      sheet.getRange(filaActual, 1).setBackground('#fff3e0');
      sheet.getRange(filaActual, 7).setBackground('#fff3e0');
      filaActual++;
    }
    
    filaActual += 2;
  });
  
  for (let i = 1; i <= 7; i++) sheet.setColumnWidth(i, 50);
  sheet.setColumnWidth(8, 60);
}

// ============================================
// REGISTRO
// ============================================

function registrarAsistenciaWeb(estado, notas) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(ASISTENCIA_CONFIG.HOJA_REGISTROS);
    
    if (!sheet) {
      inicializarSistema();
      sheet = ss.getSheetByName(ASISTENCIA_CONFIG.HOJA_REGISTROS);
    }
    
    const ahora = new Date();
    const tz = Session.getScriptTimeZone();
    const fecha = Utilities.formatDate(ahora, tz, 'dd/MM/yyyy');
    const hora = Utilities.formatDate(ahora, tz, 'HH:mm:ss');
    
    sheet.appendRow([fecha, hora, estado, notas || '']);
    
    const fila = sheet.getLastRow();
    const color = estado === 'Fui' ? '#c8e6c9' : '#ffcdd2';
    sheet.getRange(fila, 1, 1, 4).setBackground(color);
    
    // Actualizar calendario
    actualizarDiaEnCalendario(ahora);
    
    return { 
      success: true, 
      fecha: fecha,
      hora: hora,
      message: `${estado} registrado: ${fecha} ${hora}` 
    };
  } catch (e) {
    return { success: false, message: e.toString() };
  }
}

// ============================================
// CALENDARIO
// ============================================

function actualizarDiaEnCalendario(fecha) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const registros = ss.getSheetByName(ASISTENCIA_CONFIG.HOJA_REGISTROS);
  const calendario = ss.getSheetByName(ASISTENCIA_CONFIG.HOJA_CALENDARIO);
  
  if (!registros || !calendario) return;
  
  const tz = Session.getScriptTimeZone();
  const fechaStr = Utilities.formatDate(fecha, tz, 'dd/MM/yyyy');
  
  // Contar registros "Fui" del día
  const datos = registros.getDataRange().getValues();
  let conteo = 0;
  
  datos.slice(1).forEach(fila => {
    if (fila[0] === fechaStr && fila[2] === 'Fui') conteo++;
  });
  
  const dia = fecha.getDate();
  const mes = fecha.getMonth();
  const año = fecha.getFullYear();
  
  const celda = encontrarCeldaDia(calendario, dia, mes, año);
  
  if (celda) {
    // Mostrar día con cantidad si hay registros
    const texto = conteo > 0 ? `${dia} (${conteo})` : dia;
    celda.setValue(texto);
    
    // Color según cantidad
    let color = '#ffffff';
    const diaSemana = new Date(año, mes, dia).getDay();
    
    if (conteo > 0) {
      if (conteo >= 5) color = '#81c784';      // Verde oscuro
      else if (conteo >= 3) color = '#a5d6a7'; // Verde medio
      else color = '#c8e6c9';                   // Verde claro
    } else if (diaSemana === 0 || diaSemana === 6) {
      color = '#fff3e0'; // Fin de semana sin registros
    }
    
    celda.setBackground(color);
  }
}

function encontrarCeldaDia(sheet, dia, mes, año) {
  const datos = sheet.getDataRange().getValues();
  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  
  const nombreMes = meses[mes];
  let enMes = false;
  
  for (let fila = 0; fila < datos.length; fila++) {
    const valor = datos[fila][0];
    
    if (typeof valor === 'string' && valor.includes(nombreMes)) {
      enMes = true;
      continue;
    }
    
    if (enMes && typeof valor === 'string' && valor.includes('📅') && !valor.includes(nombreMes)) {
      break;
    }
    
    if (enMes) {
      for (let col = 0; col < 7; col++) {
        const celda = datos[fila][col];
        const num = typeof celda === 'string' ? parseInt(celda) : celda;
        if (num === dia) {
          return sheet.getRange(fila + 1, col + 1);
        }
      }
    }
  }
  return null;
}

function actualizarCalendarioCompleto() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const registros = ss.getSheetByName(ASISTENCIA_CONFIG.HOJA_REGISTROS);
  
  if (!registros) {
    SpreadsheetApp.getUi().alert('❌ No hay registros');
    return;
  }
  
  crearHojaCalendario(ss);
  
  const datos = registros.getDataRange().getValues();
  const fechas = new Set();
  
  datos.slice(1).forEach(fila => {
    if (fila[0]) fechas.add(fila[0]);
  });
  
  fechas.forEach(fechaStr => {
    const p = fechaStr.split('/');
    if (p.length === 3) {
      const fecha = new Date(parseInt(p[2]), parseInt(p[1]) - 1, parseInt(p[0]));
      actualizarDiaEnCalendario(fecha);
    }
  });
  
  SpreadsheetApp.getUi().alert('✅ Calendario actualizado');
}

// ============================================
// FUNCIONES WEB
// ============================================

function obtenerResumenHoy() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(ASISTENCIA_CONFIG.HOJA_REGISTROS);
    
    if (!sheet) return { registros: [], fui: 0, noFui: 0 };
    
    const hoy = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd/MM/yyyy');
    const datos = sheet.getDataRange().getValues();
    
    const registros = [];
    let fui = 0, noFui = 0;
    
    datos.slice(1).forEach((f, i) => {
      if (f[0] === hoy) {
        registros.push({
          id: i + 2,
          fecha: f[0],
          hora: f[1],
          estado: f[2],
          notas: f[3]
        });
        if (f[2] === 'Fui') fui++;
        else noFui++;
      }
    });
    
    return { fecha: hoy, registros: registros.reverse(), fui, noFui, total: registros.length };
  } catch (e) {
    return { registros: [], fui: 0, noFui: 0, total: 0 };
  }
}

function obtenerEstadisticasMes() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(ASISTENCIA_CONFIG.HOJA_REGISTROS);
    
    if (!sheet) return { dias: 0, totalFui: 0, promedio: 0 };
    
    const ahora = new Date();
    const mes = ahora.getMonth();
    const año = ahora.getFullYear();
    
    const datos = sheet.getDataRange().getValues();
    const diasSet = new Set();
    let totalFui = 0, totalNoFui = 0;
    
    datos.slice(1).forEach(f => {
      if (!f[0]) return;
      const p = f[0].split('/');
      if (p.length !== 3) return;
      
      if (parseInt(p[1]) - 1 === mes && parseInt(p[2]) === año) {
        diasSet.add(f[0]);
        if (f[2] === 'Fui') totalFui++;
        else totalNoFui++;
      }
    });
    
    const dias = diasSet.size;
    const promedio = dias > 0 ? (totalFui / dias).toFixed(1) : 0;
    
    return { dias, totalFui, totalNoFui, promedio };
  } catch (e) {
    return { dias: 0, totalFui: 0, totalNoFui: 0, promedio: 0 };
  }
}

function obtenerCalendarioMes() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(ASISTENCIA_CONFIG.HOJA_REGISTROS);
    
    const ahora = new Date();
    const mes = ahora.getMonth();
    const año = ahora.getFullYear();
    const diasEnMes = new Date(año, mes + 1, 0).getDate();
    
    const conteoPorDia = {};
    
    if (sheet) {
      const datos = sheet.getDataRange().getValues();
      datos.slice(1).forEach(f => {
        if (!f[0]) return;
        const p = f[0].split('/');
        if (p.length !== 3) return;
        
        if (parseInt(p[1]) - 1 === mes && parseInt(p[2]) === año && f[2] === 'Fui') {
          const dia = parseInt(p[0]);
          conteoPorDia[dia] = (conteoPorDia[dia] || 0) + 1;
        }
      });
    }
    
    const dias = [];
    for (let d = 1; d <= diasEnMes; d++) {
      dias.push({
        dia: d,
        cantidad: conteoPorDia[d] || 0,
        esHoy: d === ahora.getDate()
      });
    }
    
    return { 
      dias, 
      mes, 
      año,
      primerDia: new Date(año, mes, 1).getDay()
    };
  } catch (e) {
    return { dias: [], mes: 0, año: 0, primerDia: 0 };
  }
}

function eliminarRegistro(fila) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(ASISTENCIA_CONFIG.HOJA_REGISTROS);
    
    if (!sheet) return { success: false };
    
    const fechaStr = sheet.getRange(fila, 1).getValue();
    sheet.deleteRow(fila);
    
    // Actualizar calendario
    if (fechaStr) {
      const p = fechaStr.split('/');
      if (p.length === 3) {
        const fecha = new Date(parseInt(p[2]), parseInt(p[1]) - 1, parseInt(p[0]));
        actualizarDiaEnCalendario(fecha);
      }
    }
    
    return { success: true };
  } catch (e) {
    return { success: false };
  }
}
