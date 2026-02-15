/**
 * EntregasEnhanced.gs
 * Lógica principal del módulo de Entregas Enhanced
 * 
 * Responsabilidades:
 * - Gestión de entregas con filtrado por usuario
 * - Cambio de estados con validaciones
 * - Integración con Google Drive
 * - Historial de cambios
 * - Notificaciones
 */

// Estructura de columnas de Despachos (extendida)
var COL_DESPACHOS_ENHANCED = {
  FECHA_DOCTO: 0,           // A
  CLIENTE: 1,               // B
  FACTURAS: 2,              // C
  GUIA: 3,                  // D
  BULTOS: 4,                // E
  EMPRESA_TRANSPORTE: 5,    // F
  TRANSPORTISTA: 6,         // G
  N_NV: 7,                  // H
  DIVISION: 8,              // I
  VENDEDOR: 9,              // J
  FECHA_DESPACHO: 10,       // K
  VALOR_FLETE: 11,          // L
  NUM_ENVIO_OT: 12,         // M
  FECHA_CREACION: 13,       // N
  ESTADO: 14,               // O
  FOTO_ENTREGA: 15,         // P
  FECHA_FOTO: 16,           // Q
  USUARIO_FOTO: 17,         // R
  MOTIVO_RECHAZO: 18,       // S
  FECHA_REPROGRAMACION: 19, // T
  PALLETS: 20,              // U
  ULTIMA_ACTUALIZACION: 21, // V
  ACTUALIZADO_POR: 22       // W
};

/**
 * Obtiene entregas filtradas por usuario y rol
 * 
 * @param {string} usuario - Nombre del usuario
 * @param {string} rol - Rol del usuario
 * @returns {Object} - {success, entregas[], stats, error}
 */
function getEntregasPorUsuario(usuario, rol) {
  try {
    Logger.log('EntregasEnhanced.getEntregasPorUsuario: ' + usuario + ' (' + rol + ')');
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Despachos') || ss.getSheetByName('DESPACHO') || ss.getSheetByName('DESPACHOS');
    
    if (!sheet) {
      return {
        success: true,
        entregas: [],
        stats: { pendientes: 0, enRuta: 0, entregados: 0, rechazados: 0, reprogramados: 0 }
      };
    }
    
    var data = sheet.getDataRange().getValues();
    var entregas = [];
    var nvProcesadas = {};
    var COL = COL_DESPACHOS_ENHANCED;
    
    // Determinar si es supervisor
    var esSupervisor = rol && ['SUPERVISOR', 'COORDINADOR', 'ADMINISTRADOR'].indexOf(rol.toUpperCase()) !== -1;
    
    // Procesar filas
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var nv = String(row[COL.N_NV] || '').trim();
      var transportista = String(row[COL.TRANSPORTISTA] || '').trim();
      
      if (!nv) continue;
      if (nvProcesadas[nv]) continue;
      
      // Filtrar por usuario si no es supervisor
      if (!esSupervisor) {
        // Búsqueda parcial (contiene)
        if (transportista.toUpperCase().indexOf(usuario.toUpperCase()) === -1) {
          continue;
        }
      }
      
      nvProcesadas[nv] = true;
      
      // Formatear fecha
      var fechaStr = '';
      var fechaRaw = row[COL.FECHA_DESPACHO] || row[COL.FECHA_DOCTO];
      try {
        if (fechaRaw instanceof Date) {
          fechaStr = Utilities.formatDate(fechaRaw, Session.getScriptTimeZone(), 'dd/MM/yyyy');
        } else {
          fechaStr = String(fechaRaw || '');
        }
      } catch (e) {
        fechaStr = String(fechaRaw || '');
      }
      
      entregas.push({
        notaVenta: nv,
        cliente: String(row[COL.CLIENTE] || ''),
        fechaDespacho: fechaStr,
        bultos: Number(row[COL.BULTOS]) || 0,
        pallets: Number(row[COL.PALLETS]) || 0,
        transportista: transportista,
        guia: String(row[COL.GUIA] || ''),
        estado: String(row[COL.ESTADO] || 'PENDIENTE').toUpperCase(),
        fotoEntrega: String(row[COL.FOTO_ENTREGA] || ''),
        fechaFoto: row[COL.FECHA_FOTO] || null,
        usuarioFoto: String(row[COL.USUARIO_FOTO] || ''),
        motivoRechazo: String(row[COL.MOTIVO_RECHAZO] || ''),
        fechaReprogramacion: row[COL.FECHA_REPROGRAMACION] || null,
        ultimaActualizacion: row[COL.ULTIMA_ACTUALIZACION] || null,
        actualizadoPor: String(row[COL.ACTUALIZADO_POR] || ''),
        rowIndex: i + 1
      });
    }
    
    // Calcular estadísticas
    var stats = {
      pendientes: 0,
      enRuta: 0,
      entregados: 0,
      rechazados: 0,
      reprogramados: 0
    };
    
    for (var j = 0; j < entregas.length; j++) {
      var estado = entregas[j].estado;
      if (estado.indexOf('ENTREGADO') !== -1) {
        stats.entregados++;
      } else if (estado.indexOf('RUTA') !== -1) {
        stats.enRuta++;
      } else if (estado.indexOf('RECHAZADO') !== -1) {
        stats.rechazados++;
      } else if (estado.indexOf('REPROGRAMADO') !== -1) {
        stats.reprogramados++;
      } else {
        stats.pendientes++;
      }
    }
    
    Logger.log('✅ Entregas encontradas: ' + entregas.length);
    
    return {
      success: true,
      entregas: entregas,
      stats: stats,
      filtrado: !esSupervisor
    };
    
  } catch (e) {
    Logger.log('❌ Error en getEntregasPorUsuario: ' + e.message);
    return {
      success: false,
      error: e.message,
      entregas: [],
      stats: { pendientes: 0, enRuta: 0, entregados: 0, rechazados: 0, reprogramados: 0 }
    };
  }
}

/**
 * Cambia el estado de una entrega
 * 
 * @param {string} nv - Número de nota de venta
 * @param {string} nuevoEstado - Nuevo estado
 * @param {string} usuario - Usuario que realiza el cambio
 * @param {Object} datos - Datos adicionales (foto, motivo, fecha)
 * @returns {Object} - {success, mensaje, timestamp, error}
 */
function cambiarEstadoEntrega(nv, nuevoEstado, usuario, datos) {
  try {
    Logger.log('EntregasEnhanced.cambiarEstadoEntrega: ' + nv + ' → ' + nuevoEstado);
    
    datos = datos || {};
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Despachos') || ss.getSheetByName('DESPACHO') || ss.getSheetByName('DESPACHOS');
    
    if (!sheet) {
      return { success: false, error: 'Hoja Despachos no encontrada' };
    }
    
    // Buscar la fila de la N.V
    var data = sheet.getDataRange().getValues();
    var COL = COL_DESPACHOS_ENHANCED;
    var filaEncontrada = -1;
    var estadoActual = '';
    
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][COL.N_NV]).trim() === nv) {
        filaEncontrada = i + 1;
        estadoActual = String(data[i][COL.ESTADO] || '');
        break;
      }
    }
    
    if (filaEncontrada === -1) {
      return { success: false, error: 'N.V no encontrada: ' + nv };
    }
    
    // Validar cambio de estado
    var validacion = validarCambioEstado(estadoActual, nuevoEstado, datos);
    if (!validacion.valido) {
      return {
        success: false,
        error: 'Validación fallida: ' + validacion.errores.join(', '),
        errores: validacion.errores
      };
    }
    
    // Actualizar estado en Despachos
    var timestamp = new Date();
    sheet.getRange(filaEncontrada, COL.ESTADO + 1).setValue(nuevoEstado);
    sheet.getRange(filaEncontrada, COL.ULTIMA_ACTUALIZACION + 1).setValue(timestamp);
    sheet.getRange(filaEncontrada, COL.ACTUALIZADO_POR + 1).setValue(usuario);
    
    // Actualizar campos específicos según estado
    if (nuevoEstado === 'RECHAZADO' && datos.motivo) {
      sheet.getRange(filaEncontrada, COL.MOTIVO_RECHAZO + 1).setValue(datos.motivo);
    }
    
    if (nuevoEstado === 'REPROGRAMADO' && datos.fechaReprogramacion) {
      sheet.getRange(filaEncontrada, COL.FECHA_REPROGRAMACION + 1).setValue(datos.fechaReprogramacion);
    }
    
    // Actualizar en N.V DIARIAS
    var sheetMaster = ss.getSheetByName('N.V DIARIAS');
    if (sheetMaster) {
      var dataMaster = sheetMaster.getDataRange().getValues();
      for (var j = 1; j < dataMaster.length; j++) {
        if (String(dataMaster[j][1]).trim() === nv) {
          sheetMaster.getRange(j + 1, 3).setValue(nuevoEstado);
        }
      }
    }
    
    SpreadsheetApp.flush();
    
    // Registrar en historial
    registrarCambioEstado(nv, estadoActual, nuevoEstado, usuario, datos);
    
    // Notificar cambio
    notificarCambioEstado(nv, nuevoEstado, usuario);
    
    // Invalidar caché
    invalidateNVCache();
    
    Logger.log('✅ Estado cambiado exitosamente');
    
    return {
      success: true,
      mensaje: 'Estado actualizado a ' + nuevoEstado,
      timestamp: timestamp
    };
    
  } catch (e) {
    Logger.log('❌ Error en cambiarEstadoEntrega: ' + e.message);
    return {
      success: false,
      error: e.message
    };
  }
}

/**
 * Sube una foto de entrega
 * 
 * @param {string} nv - Número de nota de venta
 * @param {string} fotoBase64 - Foto en base64
 * @param {string} usuario - Usuario que sube la foto
 * @returns {Object} - {success, driveLink, fileId, error}
 */
function subirFotoEntrega(nv, fotoBase64, usuario) {
  try {
    Logger.log('EntregasEnhanced.subirFotoEntrega: ' + nv);
    
    // Obtener fecha actual
    var now = new Date();
    var año = now.getFullYear();
    var mes = Utilities.formatDate(now, Session.getScriptTimeZone(), 'MM_MMMM');
    
    // Crear carpeta
    var carpetaResult = crearCarpetaEntrega(nv, año, mes);
    if (!carpetaResult.success) {
      return carpetaResult;
    }
    
    // Subir foto con reintentos
    var subirResult = subirFotoConReintentos(carpetaResult.folderId, nv, fotoBase64, usuario, 3);
    if (!subirResult.success) {
      return subirResult;
    }
    
    // Actualizar hoja Despachos
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Despachos') || ss.getSheetByName('DESPACHO') || ss.getSheetByName('DESPACHOS');
    
    if (sheet) {
      var data = sheet.getDataRange().getValues();
      var COL = COL_DESPACHOS_ENHANCED;
      
      for (var i = 1; i < data.length; i++) {
        if (String(data[i][COL.N_NV]).trim() === nv) {
          var fila = i + 1;
          
          // Actualizar columnas de foto
          sheet.getRange(fila, COL.FOTO_ENTREGA + 1).setValue(subirResult.publicLink);
          sheet.getRange(fila, COL.FECHA_FOTO + 1).setValue(now);
          sheet.getRange(fila, COL.USUARIO_FOTO + 1).setValue(usuario);
          
          break;
        }
      }
      
      SpreadsheetApp.flush();
    }
    
    Logger.log('✅ Foto subida y vinculada exitosamente');
    
    return {
      success: true,
      driveLink: subirResult.publicLink,
      fileId: subirResult.fileId,
      fileName: subirResult.fileName
    };
    
  } catch (e) {
    Logger.log('❌ Error en subirFotoEntrega: ' + e.message);
    return {
      success: false,
      error: e.message
    };
  }
}

/**
 * Verifica permisos de acceso a una entrega
 * 
 * @param {string} usuario - Nombre del usuario
 * @param {string} rol - Rol del usuario
 * @param {string} nv - Número de nota de venta
 * @returns {Object} - {permitido, motivo}
 */
function verificarPermisoEntregas(usuario, rol, nv) {
  try {
    // Supervisores tienen acceso a todo
    if (rol && ['SUPERVISOR', 'COORDINADOR', 'ADMINISTRADOR'].indexOf(rol.toUpperCase()) !== -1) {
      return { permitido: true };
    }
    
    // Buscar la N.V y verificar transportista
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Despachos') || ss.getSheetByName('DESPACHO') || ss.getSheetByName('DESPACHOS');
    
    if (!sheet) {
      return { permitido: false, motivo: 'Hoja Despachos no encontrada' };
    }
    
    var data = sheet.getDataRange().getValues();
    var COL = COL_DESPACHOS_ENHANCED;
    
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][COL.N_NV]).trim() === nv) {
        var transportista = String(data[i][COL.TRANSPORTISTA] || '').trim();
        
        // Búsqueda parcial
        if (transportista.toUpperCase().indexOf(usuario.toUpperCase()) !== -1) {
          return { permitido: true };
        } else {
          return {
            permitido: false,
            motivo: 'Esta N.V está asignada a ' + transportista
          };
        }
      }
    }
    
    return { permitido: false, motivo: 'N.V no encontrada' };
    
  } catch (e) {
    Logger.log('❌ Error en verificarPermisoEntregas: ' + e.message);
    return { permitido: false, motivo: 'Error: ' + e.message };
  }
}

/**
 * Obtiene cambios desde un timestamp (para polling)
 * 
 * @param {number} timestamp - Timestamp desde el cual buscar cambios
 * @returns {Object} - {success, cambios[], ultimoTimestamp}
 */
function getCambiosDesde(timestamp) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('HISTORIAL_ENTREGAS');
    
    if (!sheet) {
      return {
        success: true,
        cambios: [],
        ultimoTimestamp: Date.now()
      };
    }
    
    var data = sheet.getDataRange().getValues();
    var cambios = [];
    var ultimoTimestamp = timestamp;
    
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var rowTimestamp = new Date(row[0]).getTime();
      
      if (rowTimestamp > timestamp) {
        cambios.push({
          timestamp: rowTimestamp,
          nv: row[1],
          usuario: row[2],
          estadoAnterior: row[3],
          estadoNuevo: row[4],
          motivo: row[5]
        });
        
        if (rowTimestamp > ultimoTimestamp) {
          ultimoTimestamp = rowTimestamp;
        }
      }
    }
    
    return {
      success: true,
      cambios: cambios,
      ultimoTimestamp: ultimoTimestamp
    };
    
  } catch (e) {
    Logger.log('❌ Error en getCambiosDesde: ' + e.message);
    return {
      success: false,
      error: e.message,
      cambios: [],
      ultimoTimestamp: timestamp
    };
  }
}

/**
 * Test del EntregasEnhanced
 */
function testEntregasEnhanced() {
  Logger.log('=== TEST ENTREGAS ENHANCED ===\n');
  
  // 1. Test getEntregasPorUsuario (supervisor)
  Logger.log('1. Test getEntregasPorUsuario (supervisor)...');
  var result1 = getEntregasPorUsuario('Admin', 'SUPERVISOR');
  Logger.log('   Entregas: ' + result1.entregas.length);
  Logger.log('   Stats: ' + JSON.stringify(result1.stats));
  
  // 2. Test getEntregasPorUsuario (usuario normal)
  Logger.log('\n2. Test getEntregasPorUsuario (usuario)...');
  var result2 = getEntregasPorUsuario('Hector', 'USUARIO');
  Logger.log('   Entregas: ' + result2.entregas.length);
  Logger.log('   Filtrado: ' + result2.filtrado);
  
  // 3. Test verificarPermisoEntregas
  if (result2.entregas.length > 0) {
    var nv = result2.entregas[0].notaVenta;
    Logger.log('\n3. Test verificarPermisoEntregas...');
    var result3 = verificarPermisoEntregas('Hector', 'USUARIO', nv);
    Logger.log('   Resultado: ' + JSON.stringify(result3));
  }
  
  Logger.log('\n=== FIN TEST ===');
}
