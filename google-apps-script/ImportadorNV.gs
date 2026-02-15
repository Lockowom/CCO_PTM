/**
 * ImportadorNV.gs
 * Módulo para gestionar la carga masiva de Notas de Venta sin duplicados.
 * Protege el trabajo realizado (estados) en la hoja principal.
 */

// Configuración de columnas (Indices basados en 0)
// Ajustar según el orden de tu Excel pegado en CARGA_NV
var COL_IMPORT = {
  FECHA: 0,
  NV: 1,
  ESTADO: 2,
  CLIENTE: 4,
  VENDEDOR: 6,
  CODIGO: 8,
  DESCRIPCION: 9,
  UNIDAD: 10,
  CANTIDAD: 11
};

/**
 * Función principal llamada desde el menú
 * Toma los datos de CARGA_NV y los lleva a N.V DIARIAS solo si son nuevos
 */
function importarNuevasVentas() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var ui = null;
  
  // Intentar obtener la UI solo si estamos en un contexto interactivo
  try {
    ui = SpreadsheetApp.getUi();
  } catch (e) {
    Logger.log('Ejecutando en modo background (sin UI)');
  }
  
  // Helper para mostrar mensajes (UI o Log)
  function mostrarMensaje(titulo, mensaje, tipoBoton) {
    if (ui) {
      return ui.alert(titulo, mensaje, tipoBoton || ui.ButtonSet.OK);
    } else {
      Logger.log('[MSG] ' + titulo + ': ' + mensaje);
      // Si no hay UI, asumimos respuesta afirmativa para confirmaciones simples o retornamos OK
      return ui ? ui.Button.OK : 'OK'; 
    }
  }

  // 1. Obtener hoja de Carga y Destino
  var sheetCarga = ss.getSheetByName('CARGA_NV');
  var sheetDestino = getNVSheet(); // Usa la función helper existente en Code.gs
  
  // Validación inicial
  if (!sheetCarga) {
    // Si no existe, la creamos y damos instrucciones
    sheetCarga = ss.insertSheet('CARGA_NV');
    // Copiar cabeceras de N.V DIARIAS si es posible para guiar al usuario
    if (sheetDestino && sheetDestino.getLastColumn() > 0) {
      var headers = sheetDestino.getRange(1, 1, 1, sheetDestino.getLastColumn()).getValues();
      if (headers[0].length > 0) {
         sheetCarga.getRange(1, 1, 1, headers[0].length).setValues(headers);
      } else {
         // Headers por defecto si la hoja destino está vacía
         sheetCarga.appendRow(['Fecha', 'N.Venta', 'Estado', 'Cliente', 'Vendedor', 'Codigo', 'Descripcion', 'Unidad', 'Cantidad']);
      }
    } else {
       // Headers por defecto si no se pueden leer
       sheetCarga.appendRow(['Fecha', 'N.Venta', 'Estado', 'Cliente', 'Vendedor', 'Codigo', 'Descripcion', 'Unidad', 'Cantidad']);
    }
    mostrarMensaje('Configuración Inicial', 
      'Se ha creado la hoja "CARGA_NV".\n\n' +
      'PASO 1: Pega tus datos del ERP en esta hoja (CARGA_NV).\n' +
      'PASO 2: Vuelve a ejecutar esta opción del menú.');
    return;
  }
  
  if (!sheetDestino) {
    mostrarMensaje('Error', 'No se encuentra la hoja de destino "N.V DIARIAS".');
    return;
  }

  // 2. Leer datos existentes (Para no duplicar)
  var lastRowDest = sheetDestino.getLastRow();
  var existentesMap = {}; // Mapa para búsqueda rápida { "NV-1001": true }
  
  if (lastRowDest > 1) {
    // Leemos solo la columna de N.V (Columna B, índice 1)
    var datosExistentes = sheetDestino.getRange(2, 2, lastRowDest - 1, 1).getValues();
    for (var i = 0; i < datosExistentes.length; i++) {
      var nv = String(datosExistentes[i][0]).trim();
      if (nv) {
        existentesMap[nv] = true;
      }
    }
  }

  // 3. Leer datos nuevos de CARGA_NV
  var lastRowCarga = sheetCarga.getLastRow();
  if (lastRowCarga <= 1) {
    mostrarMensaje('Atención', 'La hoja CARGA_NV está vacía. Pega los datos primero.');
    return;
  }
  
  var datosCarga = sheetCarga.getDataRange().getValues();
  var nuevasFilas = [];
  var nvIgnoradas = 0;
  
  // Asumimos que la fila 1 son cabeceras, empezamos en i=1
  for (var i = 1; i < datosCarga.length; i++) {
    var row = datosCarga[i];
    var nvImport = String(row[COL_IMPORT.NV] || '').trim();
    
    if (!nvImport) continue; // Saltar filas vacías
    
    // LA MAGIA: Si ya existe en el destino, SE IGNORA.
    // Esto protege el estado (Picking, Listo, etc.) que ya trabajaste.
    if (existentesMap[nvImport]) {
      nvIgnoradas++;
    } else {
      // Si no existe, preparamos para agregar
      // Opcional: Forzar estado "PENDIENTE" si viene vacío o con otro estado
      // row[COL_IMPORT.ESTADO] = 'PENDIENTE'; 
      nuevasFilas.push(row);
      
      // Agregamos al mapa temporal para evitar duplicados dentro de la misma carga
      existentesMap[nvImport] = true;
    }
  }
  
  // 4. Escribir resultados
  if (nuevasFilas.length > 0) {
    // Escribir al final de la hoja destino
    sheetDestino.getRange(lastRowDest + 1, 1, nuevasFilas.length, nuevasFilas[0].length)
                .setValues(nuevasFilas);
    
    // Limpiar hoja de carga (Opcional, preguntar al usuario si hay UI)
    var limpiar = false;
    if (ui) {
      var response = ui.alert('Proceso Completado', 
        '✅ Se agregaron ' + nuevasFilas.length + ' filas nuevas.\n' +
        '🛡️ Se ignoraron ' + nvIgnoradas + ' filas que ya existían (protegiendo tus estados).\n\n' +
        '¿Deseas limpiar la hoja CARGA_NV para la próxima vez?', ui.ButtonSet.YES_NO);
      if (response == ui.Button.YES) limpiar = true;
    } else {
      // En automático NO limpiamos por seguridad, o podríamos definir limpiar = true
      Logger.log('Modo automático: NO se limpia CARGA_NV por seguridad.');
    }

    if (limpiar) {
      // Limpiar datos pero dejar cabeceras
      if (lastRowCarga > 1) {
        sheetCarga.getRange(2, 1, lastRowCarga - 1, sheetCarga.getLastColumn()).clearContent();
      }
    }
    
    // Invalidar caché para que el sistema web vea los cambios
    if (typeof invalidateNVCache === 'function') {
      invalidateNVCache();
    }
    
    if (!ui) {
        Logger.log('Importación completada: ' + nuevasFilas.length + ' agregadas, ' + nvIgnoradas + ' ignoradas.');
    }
    
  } else {
    mostrarMensaje('Sin Cambios', 
      'No se encontraron N.V nuevas.\n' +
      'Todas las filas en CARGA_NV ya existían en el sistema.');
  }
}

/**
 * Archiva las ventas finalizadas (ENTREGADO, ANULADA, RECHAZADA)
 * Mueve las filas a la hoja HISTORICO_NV para optimizar el rendimiento
 */
function archivarVentasFinalizadas() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var ui = null;
  try { ui = SpreadsheetApp.getUi(); } catch(e) {}
  
  // Helper para mensajes
  function mostrarMensaje(titulo, mensaje, tipoBoton) {
    if (ui) {
      return ui.alert(titulo, mensaje, tipoBoton || ui.ButtonSet.OK);
    } else {
      Logger.log('[MSG] ' + titulo + ': ' + mensaje);
      return ui ? ui.Button.OK : 'OK'; 
    }
  }

  var sheetOrigen = getNVSheet();
  if (!sheetOrigen) {
    mostrarMensaje('Error', 'No se encuentra la hoja N.V DIARIAS.');
    return;
  }

  var sheetHistorico = ss.getSheetByName('HISTORICO_NV');
  if (!sheetHistorico) {
    sheetHistorico = ss.insertSheet('HISTORICO_NV');
    // Copiar cabeceras
    var headers = sheetOrigen.getRange(1, 1, 1, sheetOrigen.getLastColumn()).getValues();
    sheetHistorico.getRange(1, 1, 1, headers[0].length).setValues(headers);
    // Agregar columna de fecha de archivado
    sheetHistorico.getRange(1, headers[0].length + 1).setValue('Fecha_Archivado');
  }

  var data = sheetOrigen.getDataRange().getValues();
  var filasAArchivar = [];
  var indicesBorrar = []; // Indices de filas para borrar (de abajo hacia arriba)
  var fechaArchivado = new Date();

  // Recorrer datos (saltando header)
  // Columna Estado es C (índice 2)
  var COL_ESTADO = 2;
  
  for (var i = 1; i < data.length; i++) {
    var estado = String(data[i][COL_ESTADO] || '').toUpperCase().trim();
    
    // CRITERIOS DE ARCHIVADO
    if (estado === 'ENTREGADO' || estado === 'ANULADA' || estado === 'RECHAZADA' || estado === 'CANCELADA') {
      var fila = data[i].slice(); // Copia de la fila
      fila.push(fechaArchivado);  // Agregar timestamp de archivado
      filasAArchivar.push(fila);
      indicesBorrar.push(i + 1); // +1 porque getRange es 1-based
    }
  }

  if (filasAArchivar.length === 0) {
    mostrarMensaje('Info', 'No hay ventas finalizadas para archivar.');
    return;
  }

  // Confirmación si hay UI
  if (ui) {
    var resp = ui.alert('Confirmar Archivado', 
      'Se encontraron ' + filasAArchivar.length + ' filas finalizadas (ENTREGADO/ANULADA).\n' +
      '¿Deseas moverlas al HISTORICO_NV ahora?\n\n' +
      'Esto aligerará la carga de la hoja principal.', ui.ButtonSet.YES_NO);
    if (resp != ui.Button.YES) return;
  }

  // 1. Escribir en Histórico
  var lastRowHist = sheetHistorico.getLastRow();
  sheetHistorico.getRange(lastRowHist + 1, 1, filasAArchivar.length, filasAArchivar[0].length)
                .setValues(filasAArchivar);

  // 2. Borrar de Origen (De abajo hacia arriba para no alterar índices)
  // Ordenar índices de mayor a menor
  indicesBorrar.sort(function(a, b){ return b - a });
  
  // Optimización: Borrar en bloques si son consecutivos (opcional, por ahora uno a uno es seguro)
  // Para 500+ filas esto puede ser lento, pero seguro.
  // Usaremos deleteRow uno por uno para máxima seguridad
  indicesBorrar.forEach(function(indice) {
    sheetOrigen.deleteRow(indice);
  });

  // Invalidar caché
  if (typeof invalidateNVCache === 'function') {
    invalidateNVCache();
  }

  mostrarMensaje('Éxito', 'Se archivaron ' + filasAArchivar.length + ' ventas correctamente.');
}

/**
 * Función para crear el menú al abrir la hoja
 * (Llamada desde onOpen en Setup.gs)
 */
function createTMSMenu() {
  try {
    var ui = SpreadsheetApp.getUi();
    ui.createMenu('🚀 TMS Control')
      .addItem('📥 Importar N.V (Sin Duplicados)', 'importarNuevasVentas')
      .addSeparator()
      .addItem('📦 Archivar Ventas Finalizadas', 'archivarVentasFinalizadas')
      .addSeparator()
      .addItem('🔄 Refrescar Caché', 'invalidateNVCache')
      .addToUi();
  } catch (e) {
    // Si no hay UI (ej: ejecución desde trigger o editor), ignoramos el error
    Logger.log('No se pudo crear el menú (contexto sin UI): ' + e.message);
  }
}

/**
 * EJECUTAR MANUALMENTE ESTA FUNCIÓN PARA FORZAR LA APARICIÓN DEL MENÚ
 */
function forzarMenu() {
  createTMSMenu();
  var ui = SpreadsheetApp.getUi();
  ui.alert('Menú Creado', 'El menú "🚀 TMS Control" debería aparecer ahora arriba.', ui.ButtonSet.OK);
}
