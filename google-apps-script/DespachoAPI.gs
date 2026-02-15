/**
 * ============================================================
 * DESPACHO API - CORREGIDO
 * Backend para módulo de generación de despachos
 * Estructura correcta de hoja DESPACHO según especificación
 * ============================================================
 */

// Índices de columnas para hoja DESPACHO (0-indexed)
// Según imagen de referencia:
// A=0, B=1, C=2, D=3, E=4, F=5, G=6, H=7, I=8, J=9, K=10, L=11, M=12, N=13, O=14
var COL_DESPACHO = {
  FECHA_DOCTO: 0,       // A - AUTOMATICO HOJA DE PACKING
  CLIENTE: 1,           // B - HOJA DE PACKING
  FACTURAS: 2,          // C - FORMULARIO WEB MODULO DESPACHO
  GUIA: 3,              // D - FORMULARIO WEB MODULO DESPACHO
  BULTOS: 4,            // E - AUTOMATICO HOJA DE PACKING
  EMPRESA_TRANSPORTE: 5,// F - FORMULARIO WEB MODULO DESPACHO
  TRANSPORTISTA: 6,     // G - FORMULARIO WEB MODULO DESPACHO
  N_NV: 7,              // H - AUTOMATICO HOJA DE PACKING
  DIVISION: 8,          // I - FORMULARIO WEB MODULO DESPACHO
  VENDEDOR: 9,          // J - AUTOMATICO HOJA DE PACKING
  FECHA_DESPACHO: 10,   // K - AUTOMATICAMENTE CUANDO SE GENERA EL DESPACHO
  VALOR_FLETE: 11,      // L - AUTOMATICO HOJA DE PACKING
  NUM_ENVIO_OT: 12,     // M - FORMULARIO WEB MODULO DESPACHO
  FECHA_CREACION: 13,   // N - AUTOMATICAMENTE CUANDO SE GENERA EL DESPACHO
  ESTADO: 14            // O - SE ACTUALIZA EN TIEMPO REAL DEL MODULO ENTREGAS
};

/**
 * Obtiene todas las N.V pendientes de despacho
 * Lee de la hoja DESPACHO y agrupa por N.V
 * @returns {Object} - {success, notasVenta[], total}
 */
function getNVPendientesDespacho() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Despachos') || ss.getSheetByName('DESPACHO') || ss.getSheetByName('DESPACHOS');
    
    if (!sheet || sheet.getLastRow() <= 1) {
      return {
        success: true,
        notasVenta: [],
        total: 0,
        mensaje: 'No hay N.V en DESPACHO'
      };
    }
    
    var data = sheet.getDataRange().getValues();
    var nvMap = {};
    
    // Procesar datos agrupando por N.V
    for (var i = 1; i < data.length; i++) {
      var nVenta = String(data[i][COL_DESPACHO.N_NV] || '').trim();
      
      if (!nVenta) continue;
      
      if (!nvMap[nVenta]) {
        nvMap[nVenta] = {
          notaVenta: nVenta,
          cliente: String(data[i][COL_DESPACHO.CLIENTE] || ''),
          fechaDocto: data[i][COL_DESPACHO.FECHA_DOCTO] || '',
          vendedor: String(data[i][COL_DESPACHO.VENDEDOR] || ''),
          bultos: Number(data[i][COL_DESPACHO.BULTOS]) || 0,
          zona: '', // No hay columna zona en la nueva estructura
          // Datos de despacho
          facturas: String(data[i][COL_DESPACHO.FACTURAS] || ''),
          guia: String(data[i][COL_DESPACHO.GUIA] || ''),
          empresaTransporte: String(data[i][COL_DESPACHO.EMPRESA_TRANSPORTE] || ''),
          transportista: String(data[i][COL_DESPACHO.TRANSPORTISTA] || ''),
          division: String(data[i][COL_DESPACHO.DIVISION] || ''),
          valorFlete: String(data[i][COL_DESPACHO.VALOR_FLETE] || ''),
          numeroEnvio: String(data[i][COL_DESPACHO.NUM_ENVIO_OT] || ''),
          fechaDespacho: data[i][COL_DESPACHO.FECHA_DESPACHO] || '',
          fechaCreacion: data[i][COL_DESPACHO.FECHA_CREACION] || '',
          estado: String(data[i][COL_DESPACHO.ESTADO] || 'PENDIENTE'),
          tieneDespacho: false,
          fila: i + 1  // Guardar número de fila para actualizaciones
        };
      }
    }
    
    // Determinar si tiene despacho generado
    for (var key in nvMap) {
      var nv = nvMap[key];
      nv.tieneDespacho = !!(nv.facturas || nv.guia || nv.numeroEnvio);
    }
    
    // Convertir a array
    var resultado = [];
    for (var k in nvMap) {
      if (nvMap.hasOwnProperty(k)) {
        resultado.push(nvMap[k]);
      }
    }
    
    // Ordenar por fecha docto (más recientes primero)
    resultado.sort(function(a, b) {
      var dateA = new Date(a.fechaDocto);
      var dateB = new Date(b.fechaDocto);
      return dateB - dateA;
    });
    
    return {
      success: true,
      notasVenta: resultado,
      total: resultado.length
    };
    
  } catch (e) {
    Logger.log('ERROR en getNVPendientesDespacho: ' + e.message);
    return {
      success: false,
      error: e.message,
      notasVenta: [],
      total: 0
    };
  }
}

/**
 * Obtiene el detalle completo de una N.V para despacho
 * @param {string} nVenta - Número de N.V
 * @returns {Object} - {success, nv}
 */
function getDetalleNVDespacho(nVenta) {
  try {
    if (!nVenta) {
      return { success: false, error: 'N.V requerida' };
    }
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Despachos') || ss.getSheetByName('DESPACHO') || ss.getSheetByName('DESPACHOS');
    
    if (!sheet || sheet.getLastRow() <= 1) {
      return { success: false, error: 'Hoja Despachos vacía' };
    }
    
    var data = sheet.getDataRange().getValues();
    var nVentaBuscada = String(nVenta).trim();
    var nvData = null;
    var filaEncontrada = -1;
    
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][COL_DESPACHO.N_NV] || '').trim() === nVentaBuscada) {
        filaEncontrada = i + 1;
        nvData = {
          notaVenta: nVentaBuscada,
          cliente: String(data[i][COL_DESPACHO.CLIENTE] || ''),
          fechaDocto: data[i][COL_DESPACHO.FECHA_DOCTO] || '',
          vendedor: String(data[i][COL_DESPACHO.VENDEDOR] || ''),
          bultos: Number(data[i][COL_DESPACHO.BULTOS]) || 0,
          zona: '', // No hay columna zona
          // Datos de despacho si existen
          facturas: String(data[i][COL_DESPACHO.FACTURAS] || ''),
          guia: String(data[i][COL_DESPACHO.GUIA] || ''),
          empresaTransporte: String(data[i][COL_DESPACHO.EMPRESA_TRANSPORTE] || ''),
          transportista: String(data[i][COL_DESPACHO.TRANSPORTISTA] || ''),
          division: String(data[i][COL_DESPACHO.DIVISION] || ''),
          valorFlete: String(data[i][COL_DESPACHO.VALOR_FLETE] || ''),
          numeroEnvio: String(data[i][COL_DESPACHO.NUM_ENVIO_OT] || ''),
          fechaDespacho: data[i][COL_DESPACHO.FECHA_DESPACHO] || '',
          fechaCreacion: data[i][COL_DESPACHO.FECHA_CREACION] || '',
          estado: String(data[i][COL_DESPACHO.ESTADO] || 'PENDIENTE'),
          fila: filaEncontrada
        };
        break; // Tomar solo la primera fila de esta N.V
      }
    }
    
    if (!nvData) {
      return { success: false, error: 'N.V no encontrada en DESPACHO' };
    }
    
    return {
      success: true,
      nv: nvData
    };
    
  } catch (e) {
    Logger.log('ERROR en getDetalleNVDespacho: ' + e.message);
    return {
      success: false,
      error: e.message
    };
  }
}

/**
 * Genera un despacho con los datos del formulario
 * Actualiza la fila correspondiente en la hoja DESPACHO
 * @param {string} nVenta - Número de N.V
 * @param {Object} datosFormulario - Datos del formulario
 * @returns {Object} - {success, mensaje}
 */
function generarDespacho(nVenta, datosFormulario) {
  try {
    Logger.log('=== GENERAR DESPACHO ===');
    Logger.log('N.V: ' + nVenta);
    Logger.log('Datos: ' + JSON.stringify(datosFormulario));
    
    if (!nVenta || !datosFormulario) {
      return { success: false, error: 'Parámetros incompletos' };
    }
    
    // Validar campos requeridos
    var camposRequeridos = ['facturas', 'guia', 'empresaTransporte', 'transportista'];
    for (var i = 0; i < camposRequeridos.length; i++) {
      if (!datosFormulario[camposRequeridos[i]]) {
        return {
          success: false,
          error: 'Campo requerido: ' + camposRequeridos[i]
        };
      }
    }
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Despachos') || ss.getSheetByName('DESPACHO') || ss.getSheetByName('DESPACHOS');
    
    if (!sheet) {
      return { success: false, error: 'Hoja Despachos no encontrada' };
    }
    
    var data = sheet.getDataRange().getValues();
    var nVentaBuscada = String(nVenta).trim();
    var fechaDespacho = new Date();
    var filasActualizadas = 0;
    
    var cliente = '';
    var bultos = 0;
    
    // Validar estado actual antes de procesar
    var estadoActual = String(data[0][COL_DESPACHO.ESTADO] || '').toUpperCase(); // Solo chequeo rápido, la validación real se hace en el loop
    
    // Buscar y actualizar todas las filas de esta N.V
    for (var j = 1; j < data.length; j++) {
      if (String(data[j][COL_DESPACHO.N_NV] || '').trim() === nVentaBuscada) {
        // VALIDACIÓN DE INTEGRIDAD: Si ya está despachado, abortar si no es una actualización forzada
        var estadoFila = String(data[j][COL_DESPACHO.ESTADO] || '').toUpperCase();
        if (estadoFila === 'DESPACHADO' && !datosFormulario._forceUpdate) {
           Logger.log('N.V ' + nVenta + ' ya está DESPACHADA. Omitiendo.');
           continue; 
        }

        // VALIDACIÓN DE PROCESO: Verificar que tenga bultos (Packing completado)
        var bultosFila = Number(data[j][COL_DESPACHO.BULTOS]) || 0;
        if (bultosFila <= 0 && !datosFormulario._forceUpdate) {
           return { 
             success: false, 
             error: '⛔ BLOQUEO: La N.V ' + nVenta + ' no tiene bultos declarados.\nDebe pasar por Packing primero.' 
           };
        }

        var fila = j + 1;
        
        // Capturar datos para sync
        cliente = data[j][COL_DESPACHO.CLIENTE];
        bultos = bultosFila;
        
        // Columna C - FACTURAS
        sheet.getRange(fila, COL_DESPACHO.FACTURAS + 1).setValue(datosFormulario.facturas || '');
        // Columna D - GUIA
        sheet.getRange(fila, COL_DESPACHO.GUIA + 1).setValue(datosFormulario.guia || '');
        // Columna F - EMPRESA TRANSPORTE
        sheet.getRange(fila, COL_DESPACHO.EMPRESA_TRANSPORTE + 1).setValue(datosFormulario.empresaTransporte || '');
        // Columna G - TRANSPORTISTA
        sheet.getRange(fila, COL_DESPACHO.TRANSPORTISTA + 1).setValue(datosFormulario.transportista || '');
        // Columna I - DIVISION
        sheet.getRange(fila, COL_DESPACHO.DIVISION + 1).setValue(datosFormulario.division || '');
        // Columna M - N° ENVIO/OT
        sheet.getRange(fila, COL_DESPACHO.NUM_ENVIO_OT + 1).setValue(datosFormulario.numeroEnvio || '');
        // Columna K - FECHA DESPACHO
        sheet.getRange(fila, COL_DESPACHO.FECHA_DESPACHO + 1).setValue(fechaDespacho);
        
        // Columna N - FECHA CREACION (solo si no existe)
        if (!data[j][COL_DESPACHO.FECHA_CREACION]) {
          sheet.getRange(fila, COL_DESPACHO.FECHA_CREACION + 1).setValue(fechaDespacho);
        }
        
        // Columna O - ESTADO
        sheet.getRange(fila, COL_DESPACHO.ESTADO + 1).setValue('DESPACHADO');
        
        filasActualizadas++;
      }
    }
    
    if (filasActualizadas === 0) {
      return { success: false, error: 'N.V no encontrada en DESPACHO o ya fue despachada' };
    }
    
    // --- ACTUALIZACIÓN MAESTRA EN N.V DIARIAS ---
    // Esto asegura que Bodega vea inmediatamente el cambio de estado
    if (typeof actualizarEstadoNV === 'function') {
      actualizarEstadoNV(nVenta, 'DESPACHADO', 'DespachoAPI');
      Logger.log('✅ Estado actualizado en N.V DIARIAS a DESPACHADO');
    } else {
       // Fallback manual si no existe la función
       var sheetNV = ss.getSheetByName('N.V DIARIAS');
       if (sheetNV) {
         var dataNV = sheetNV.getDataRange().getValues();
         for(var k=1; k<dataNV.length; k++) {
           if(String(dataNV[k][1]).trim() === nVentaBuscada) {
             sheetNV.getRange(k+1, 3).setValue('DESPACHADO');
           }
         }
       }
    }
    
    SpreadsheetApp.flush();
    
    // Invalidar caché
    if (typeof invalidateNVCache === 'function') {
      invalidateNVCache();
    }
    
    // Sincronizar con TMS Entregas
    try {
      if (typeof syncDespachoToEntregas === 'function') {
        syncDespachoToEntregas(nVenta, datosFormulario);
      } else {
        // Fallback si la función no está disponible globalmente
        var tmsDb = new TMSDatabase();
        var entregaData = {
          NV: nVenta,
          Cliente: cliente || '', 
          Bultos: bultos || 0,
          Estado: 'PENDIENTE',
          FechaCreacion: new Date(),
          Observaciones: 'Despachado via: ' + (datosFormulario.empresaTransporte || '') + ' - Guía: ' + (datosFormulario.guia || '')
        };
        tmsDb.createEntrega(entregaData);
        Logger.log('✅ Sincronizado con TMS Entregas');
      }
    } catch (eSync) {
      Logger.log('⚠️ Error sincronizando con TMS Entregas: ' + eSync.message);
      // No fallamos el despacho si falla la sincro, solo logueamos
    }
    
    Logger.log('✅ Despacho generado: ' + filasActualizadas + ' filas actualizadas');
    
    return {
      success: true,
      mensaje: 'Despacho generado correctamente',
      notaVenta: nVenta,
      filasActualizadas: filasActualizadas,
      fechaDespacho: fechaDespacho
    };
    
  } catch (e) {
    Logger.log('ERROR en generarDespacho: ' + e.message);
    return {
      success: false,
      error: e.message
    };
  }
}

/**
 * Actualiza un despacho existente
 * @param {string} nVenta - Número de N.V
 * @param {Object} datosFormulario - Datos actualizados
 * @returns {Object} - {success, mensaje}
 */
function actualizarDespacho(nVenta, datosFormulario) {
  try {
    Logger.log('=== ACTUALIZAR DESPACHO ===');
    Logger.log('N.V: ' + nVenta);
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Despachos') || ss.getSheetByName('DESPACHO') || ss.getSheetByName('DESPACHOS');
    
    if (!sheet) {
      return { success: false, error: 'Hoja Despachos no encontrada' };
    }
    
    var data = sheet.getDataRange().getValues();
    var nVentaBuscada = String(nVenta).trim();
    var filasActualizadas = 0;
    
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][COL_DESPACHO.N_NV] || '').trim() === nVentaBuscada) {
        var fila = i + 1;
        
        if (datosFormulario.facturas !== undefined) {
          sheet.getRange(fila, COL_DESPACHO.FACTURAS + 1).setValue(datosFormulario.facturas);
        }
        if (datosFormulario.guia !== undefined) {
          sheet.getRange(fila, COL_DESPACHO.GUIA + 1).setValue(datosFormulario.guia);
        }
        if (datosFormulario.empresaTransporte !== undefined) {
          sheet.getRange(fila, COL_DESPACHO.EMPRESA_TRANSPORTE + 1).setValue(datosFormulario.empresaTransporte);
        }
        if (datosFormulario.transportista !== undefined) {
          sheet.getRange(fila, COL_DESPACHO.TRANSPORTISTA + 1).setValue(datosFormulario.transportista);
        }
        if (datosFormulario.division !== undefined) {
          sheet.getRange(fila, COL_DESPACHO.DIVISION + 1).setValue(datosFormulario.division);
        }
        if (datosFormulario.numeroEnvio !== undefined) {
          sheet.getRange(fila, COL_DESPACHO.NUM_ENVIO_OT + 1).setValue(datosFormulario.numeroEnvio);
        }
        
        filasActualizadas++;
      }
    }
    
    if (filasActualizadas === 0) {
      return { success: false, error: 'N.V no encontrada' };
    }
    
    SpreadsheetApp.flush();
    
    Logger.log('✅ Despacho actualizado: ' + filasActualizadas + ' filas');
    
    return {
      success: true,
      mensaje: 'Despacho actualizado correctamente',
      filasActualizadas: filasActualizadas
    };
    
  } catch (e) {
    Logger.log('ERROR en actualizarDespacho: ' + e.message);
    return {
      success: false,
      error: e.message
    };
  }
}

/**
 * Buscar despachos por filtro (cliente, guía, NV)
 * @param {string} filtro - Término de búsqueda
 * @returns {Object} - {success, despachos[]}
 */
// NOTA: Renombrada - usar version de Dispatch.gs
function buscarDespachosAPI(filtro) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Despachos') || ss.getSheetByName('DESPACHO') || ss.getSheetByName('DESPACHOS');
    
    if (!sheet || sheet.getLastRow() <= 1) {
      return { success: true, despachos: [] };
    }
    
    var data = sheet.getDataRange().getValues();
    var despachos = [];
    var filtroLower = String(filtro || '').toLowerCase().trim();
    
    for (var i = 1; i < data.length; i++) {
      var cliente = String(data[i][COL_DESPACHO.CLIENTE] || '').toLowerCase();
      var guia = String(data[i][COL_DESPACHO.GUIA] || '').toLowerCase();
      var nv = String(data[i][COL_DESPACHO.N_NV] || '').toLowerCase();
      var numeroEnvio = String(data[i][COL_DESPACHO.NUM_ENVIO_OT] || '').toLowerCase();
      
      // Si no hay filtro o coincide
      if (!filtroLower || 
          cliente.indexOf(filtroLower) !== -1 || 
          guia.indexOf(filtroLower) !== -1 || 
          nv.indexOf(filtroLower) !== -1 ||
          numeroEnvio.indexOf(filtroLower) !== -1) {
        
        despachos.push({
          fechaDocto: data[i][COL_DESPACHO.FECHA_DOCTO] || '',
          cliente: String(data[i][COL_DESPACHO.CLIENTE] || ''),
          facturas: String(data[i][COL_DESPACHO.FACTURAS] || ''),
          guia: String(data[i][COL_DESPACHO.GUIA] || ''),
          bultos: Number(data[i][COL_DESPACHO.BULTOS]) || 0,
          empresaTransporte: String(data[i][COL_DESPACHO.EMPRESA_TRANSPORTE] || ''),
          transportista: String(data[i][COL_DESPACHO.TRANSPORTISTA] || ''),
          numeroNV: String(data[i][COL_DESPACHO.N_NV] || ''),
          division: String(data[i][COL_DESPACHO.DIVISION] || ''),
          vendedor: String(data[i][COL_DESPACHO.VENDEDOR] || ''),
          fechaDespacho: data[i][COL_DESPACHO.FECHA_DESPACHO] || '',
          valorFlete: String(data[i][COL_DESPACHO.VALOR_FLETE] || ''),
          numeroEnvio: String(data[i][COL_DESPACHO.NUM_ENVIO_OT] || ''),
          fechaCreacion: data[i][COL_DESPACHO.FECHA_CREACION] || '',
          estado: String(data[i][COL_DESPACHO.ESTADO] || 'PENDIENTE')
        });
      }
    }
    
    // Limitar resultados
    if (despachos.length > 50) {
      despachos = despachos.slice(0, 50);
    }
    
    return {
      success: true,
      despachos: despachos,
      total: despachos.length
    };
    
  } catch (e) {
    Logger.log('ERROR en buscarDespachos: ' + e.message);
    return {
      success: false,
      error: e.message,
      despachos: []
    };
  }
}

/**
 * ============================================================
 * FUNCIÓN PRINCIPAL: Copiar datos de PACKING a DESPACHO
 * Mapeo de columnas según especificación:
 * 
 * DESPACHO (destino)      | PACKING (origen)
 * ------------------------|------------------
 * A - FECHA DOCTO         | A - Fecha Entrega (col 0)
 * B - CLIENTE             | E - Cliente (col 4)
 * C - FACTURAS            | (vacío - formulario web)
 * D - GUIA                | (vacío - formulario web)
 * E - BULTOS              | (de MOVIMIENTOS - datos empaque)
 * F - EMPRESA TRANSPORTE  | (vacío - formulario web)
 * G - TRANSPORTISTA       | (vacío - formulario web)
 * H - N° NV               | B - N.V (col 1)
 * I - DIVISION            | (vacío - formulario web)
 * J - VENDEDOR            | G - Vendedor (col 6)
 * K - FECHA DESPACHO      | (vacío - se llena al despachar)
 * L - VALOR FLETE         | (vacío - formulario web)
 * M - N° DE ENVIO /OT     | (vacío - formulario web)
 * N - FECHA CREACION      | (fecha actual al copiar)
 * O - ESTADO              | "PENDIENTE"
 * ============================================================
 */
function copiarDatosPackingADespacho(nVenta, usuario) {
  try {
    Logger.log('=== COPIAR DATOS A DESPACHO ===');
    Logger.log('N.V: ' + nVenta);
    
    if (!nVenta) {
      return { success: false, error: 'N.V requerida' };
    }
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // Obtener hoja origen - PRIORIDAD: N.V DIARIAS (donde están los datos), luego PACKING, luego PICKING
    var hojaOrigen = null;
    var hojaOrigenNombre = '';
    
    // Primero intentar N.V DIARIAS (tiene los datos reales)
    hojaOrigen = ss.getSheetByName('N.V DIARIAS');
    if (hojaOrigen && hojaOrigen.getLastRow() > 1) {
      hojaOrigenNombre = 'N.V DIARIAS';
    } else {
      // Si N.V DIARIAS está vacía, intentar PACKING
      hojaOrigen = ss.getSheetByName('PACKING');
      if (hojaOrigen && hojaOrigen.getLastRow() > 1) {
        hojaOrigenNombre = 'PACKING';
      } else {
        // Si PACKING está vacía, intentar PICKING
        hojaOrigen = ss.getSheetByName('PICKING');
        if (hojaOrigen && hojaOrigen.getLastRow() > 1) {
          hojaOrigenNombre = 'PICKING';
        }
      }
    }
    
    if (!hojaOrigen || hojaOrigen.getLastRow() <= 1) {
      return { success: false, error: 'No hay datos en N.V DIARIAS, PACKING ni PICKING' };
    }
    
    Logger.log('Leyendo datos de: ' + hojaOrigenNombre);
    
    // Obtener o crear hoja Despachos
    var hojaDespacho = ss.getSheetByName('Despachos') || ss.getSheetByName('DESPACHO') || ss.getSheetByName('DESPACHOS');
    if (!hojaDespacho) {
      hojaDespacho = ss.insertSheet('Despachos');
      // Crear encabezados según especificación
      hojaDespacho.appendRow([
        'FECHA DOCTO', 'CLIENTE', 'FACTURAS', 'GUIA', 'BULTOS',
        'EMPRESA TRANSPORTE', 'TRANSPORTISTA', 'N° NV', 'DIVISION',
        'VENDEDOR', 'FECHA DESPACHO', 'VALOR FLETE', 'N° DE ENVIO /OT',
        'FECHA DE CREACION DE DESPACHO', 'ESTADO'
      ]);
      hojaDespacho.getRange(1, 1, 1, 15).setFontWeight('bold').setBackground('#1a5276').setFontColor('white');
      Logger.log('Hoja Despachos creada con encabezados correctos');
    }
    
    // Verificar si ya existe en DESPACHO
    var dataDespacho = hojaDespacho.getDataRange().getValues();
    for (var d = 1; d < dataDespacho.length; d++) {
      if (String(dataDespacho[d][COL_DESPACHO.N_NV] || '').trim() === nVenta.trim()) {
        Logger.log('N.V ' + nVenta + ' ya existe en DESPACHO, omitiendo');
        return { success: true, yaExiste: true, mensaje: 'N.V ya existe en DESPACHO' };
      }
    }
    
    // Leer datos de PACKING
    var dataPacking = hojaOrigen.getDataRange().getValues();
    var nVentaBuscada = nVenta.trim();
    var filasACopiar = [];
    var fechaCreacion = new Date();
    
    // Obtener bultos desde MOVIMIENTOS (datos de empaque)
    var bultos = 0;
    var sheetMov = ss.getSheetByName('MOVIMIENTOS');
    if (sheetMov && sheetMov.getLastRow() > 1) {
      var dataMov = sheetMov.getDataRange().getValues();
      for (var m = dataMov.length - 1; m >= 1; m--) {
        var tipoMov = String(dataMov[m][2] || '').toUpperCase();
        var nvMov = String(dataMov[m][3] || '').trim();
        if ((tipoMov === 'CAMBIO_ESTADO_PACKING' || tipoMov === 'EMPAQUE_COMPLETADO') && nvMov === nVentaBuscada) {
          bultos = Number(dataMov[m][4]) || 0;
          Logger.log('Bultos encontrados en MOVIMIENTOS: ' + bultos);
          break;
        }
      }
    }
    
    // Buscar filas de la N.V en PACKING
    for (var i = 1; i < dataPacking.length; i++) {
      var nvFila = String(dataPacking[i][1] || '').trim(); // Columna B = N.V
      
      if (nvFila === nVentaBuscada) {
        // MAPEO CORRECTO según imagen:
        var filaDespacho = [
          dataPacking[i][0],                    // A - FECHA DOCTO ← PACKING col A (Fecha Entrega)
          String(dataPacking[i][4] || ''),      // B - CLIENTE ← PACKING col E (Cliente)
          '',                                    // C - FACTURAS (formulario web)
          '',                                    // D - GUIA (formulario web)
          bultos,                               // E - BULTOS (de MOVIMIENTOS)
          '',                                    // F - EMPRESA TRANSPORTE (formulario web)
          '',                                    // G - TRANSPORTISTA (formulario web)
          nvFila,                               // H - N° NV ← PACKING col B (N.V)
          '',                                    // I - DIVISION (formulario web)
          String(dataPacking[i][6] || ''),      // J - VENDEDOR ← PACKING col G (Vendedor)
          '',                                    // K - FECHA DESPACHO (se llena al despachar)
          '',                                    // L - VALOR FLETE (formulario web)
          '',                                    // M - N° DE ENVIO /OT (formulario web)
          fechaCreacion,                        // N - FECHA DE CREACION DE DESPACHO
          'PENDIENTE'                           // O - ESTADO
        ];
        
        filasACopiar.push(filaDespacho);
        // Solo copiar una fila por N.V (agrupado)
        break;
      }
    }
    
    if (filasACopiar.length === 0) {
      return { success: false, error: 'N.V ' + nVenta + ' no encontrada en PACKING' };
    }
    
    // Agregar filas al DESPACHO
    for (var f = 0; f < filasACopiar.length; f++) {
      hojaDespacho.appendRow(filasACopiar[f]);
    }
    
    SpreadsheetApp.flush();
    Logger.log('✅ Datos copiados a DESPACHO: ' + filasACopiar.length + ' filas');
    
    return {
      success: true,
      filasCopiadas: filasACopiar.length,
      nVenta: nVenta
    };
    
  } catch (e) {
    Logger.log('ERROR en copiarDatosPackingADespacho: ' + e.message);
    return { success: false, error: e.message };
  }
}

/**
 * Copia automáticamente una N.V al completar packing a la hoja DESPACHO
 * Esta función debe ser llamada después de completarPackingNV
 */
function transferirADespachoAlCompletarPacking(nVenta, datosEmpaque, usuario) {
  try {
    Logger.log('Transfiriendo N.V ' + nVenta + ' a DESPACHO después de completar packing');
    
    // Usar los bultos del empaque si están disponibles
    var resultado = copiarDatosPackingADespacho(nVenta, usuario);
    
    if (resultado.success && !resultado.yaExiste) {
      // Actualizar bultos si vienen del empaque
      if (datosEmpaque && datosEmpaque.bultos > 0) {
        var ss = SpreadsheetApp.getActiveSpreadsheet();
        var hojaDespacho = ss.getSheetByName('Despachos') || ss.getSheetByName('DESPACHO') || ss.getSheetByName('DESPACHOS');
        if (hojaDespacho) {
          var data = hojaDespacho.getDataRange().getValues();
          for (var i = 1; i < data.length; i++) {
            if (String(data[i][COL_DESPACHO.N_NV] || '').trim() === nVenta.trim()) {
              hojaDespacho.getRange(i + 1, COL_DESPACHO.BULTOS + 1).setValue(datosEmpaque.bultos);
              Logger.log('Bultos actualizados a ' + datosEmpaque.bultos);
              break;
            }
          }
        }
      }
    }
    
    return resultado;
    
  } catch (e) {
    Logger.log('Error en transferirADespachoAlCompletarPacking: ' + e.message);
    return { success: false, error: e.message };
  }
}

