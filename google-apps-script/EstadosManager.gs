/**
 * EstadosManager.gs
 * Gestión de estados de entregas para el módulo de Entregas Enhanced
 * 
 * Responsabilidades:
 * - Validar transiciones de estado
 * - Registrar cambios en historial
 * - Notificar cambios
 * - Mantener integridad de datos
 */

// Estados válidos
var ESTADOS_ENTREGAS = {
  EN_RUTA: 'EN RUTA',
  REPROGRAMADO: 'REPROGRAMADO',
  RECHAZADO: 'RECHAZADO',
  ENTREGADO: 'ENTREGADO'
};

/**
 * Valida un cambio de estado
 * 
 * @param {string} estadoActual - Estado actual de la entrega
 * @param {string} nuevoEstado - Nuevo estado propuesto
 * @param {Object} datos - Datos adicionales (foto, motivo, fecha)
 * @returns {Object} - {valido, errores[]}
 */
function validarCambioEstado(estadoActual, nuevoEstado, datos) {
  try {
    Logger.log('EstadosManager.validarCambioEstado: ' + estadoActual + ' → ' + nuevoEstado);
    
    var errores = [];
    datos = datos || {};
    
    // Normalizar estados
    nuevoEstado = nuevoEstado.toUpperCase().trim();
    
    // 1. Validar que el nuevo estado es válido
    var estadosValidos = Object.keys(ESTADOS_ENTREGAS).map(function(k) { return ESTADOS_ENTREGAS[k]; });
    if (estadosValidos.indexOf(nuevoEstado) === -1) {
      errores.push('Estado inválido: ' + nuevoEstado);
    }
    
    // 2. Validar foto obligatoria para ENTREGADO
    if (nuevoEstado === ESTADOS_ENTREGAS.ENTREGADO) {
      if (!datos.foto || datos.foto.trim() === '') {
        errores.push('Foto obligatoria para marcar como ENTREGADO');
      }
    }
    
    // 3. Validar motivo obligatorio para RECHAZADO
    if (nuevoEstado === ESTADOS_ENTREGAS.RECHAZADO) {
      if (!datos.motivo || datos.motivo.trim() === '') {
        errores.push('Motivo obligatorio para marcar como RECHAZADO');
      }
    }
    
    // 4. Validar fecha obligatoria para REPROGRAMADO
    if (nuevoEstado === ESTADOS_ENTREGAS.REPROGRAMADO) {
      if (!datos.fechaReprogramacion) {
        errores.push('Fecha de reprogramación obligatoria');
      }
    }
    
    // 5. Validar que no se cambie desde ENTREGADO sin autorización
    if (estadoActual && estadoActual.toUpperCase().indexOf('ENTREGADO') !== -1) {
      if (!datos.autorizacionSupervisor) {
        errores.push('No se puede cambiar el estado de una entrega ya ENTREGADA sin autorización de supervisor');
      }
    }
    
    var valido = errores.length === 0;
    
    Logger.log(valido ? '✅ Validación exitosa' : '❌ Validación fallida: ' + errores.join(', '));
    
    return {
      valido: valido,
      errores: errores
    };
    
  } catch (e) {
    Logger.log('❌ Error en validarCambioEstado: ' + e.message);
    return {
      valido: false,
      errores: ['Error de validación: ' + e.message]
    };
  }
}

/**
 * Registra un cambio de estado en el historial
 * 
 * @param {string} nv - Número de nota de venta
 * @param {string} estadoAnterior - Estado anterior
 * @param {string} nuevoEstado - Nuevo estado
 * @param {string} usuario - Usuario que realiza el cambio
 * @param {Object} datos - Datos adicionales
 * @returns {Object} - {success, historialId, error}
 */
// NOTA: Renombrada para evitar conflicto con StateManager.gs
function registrarCambioEstadoEntregas(nv, estadoAnterior, nuevoEstado, usuario, datos) {
  try {
    Logger.log('EstadosManager.registrarCambioEstado: ' + nv);
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('HISTORIAL_ENTREGAS');
    
    if (!sheet) {
      return {
        success: false,
        error: 'Hoja HISTORIAL_ENTREGAS no encontrada'
      };
    }
    
    datos = datos || {};
    
    // Preparar fila
    var timestamp = new Date();
    var fila = [
      timestamp,                              // A: TIMESTAMP
      nv,                                     // B: N_NV
      usuario,                                // C: USUARIO
      estadoAnterior || '',                   // D: ESTADO_ANTERIOR
      nuevoEstado,                            // E: ESTADO_NUEVO
      datos.motivo || '',                     // F: MOTIVO
      datos.fotoLink || '',                   // G: FOTO_LINK
      datos.latitud || '',                    // H: LATITUD
      datos.longitud || '',                   // I: LONGITUD
      datos.dispositivo || 'Web'              // J: DISPOSITIVO
    ];
    
    // Insertar en la siguiente fila disponible
    sheet.appendRow(fila);
    
    var historialId = sheet.getLastRow();
    
    Logger.log('✅ Cambio registrado en historial (fila ' + historialId + ')');
    
    return {
      success: true,
      historialId: historialId,
      timestamp: timestamp
    };
    
  } catch (e) {
    Logger.log('❌ Error en registrarCambioEstado: ' + e.message);
    return {
      success: false,
      error: e.message
    };
  }
}

/**
 * Obtiene los estados permitidos según el estado actual y rol
 * 
 * @param {string} estadoActual - Estado actual
 * @param {string} rol - Rol del usuario
 * @returns {Object} - {success, estados[]}
 */
// NOTA: Renombrada para evitar conflicto con StateManager.gs
function getEstadosPermitidosEntregas(estadoActual, rol) {
  try {
    var estados = [];
    
    // Normalizar estado actual
    estadoActual = estadoActual ? estadoActual.toUpperCase().trim() : '';
    
    // Todos los usuarios pueden marcar como EN RUTA
    estados.push(ESTADOS_ENTREGAS.EN_RUTA);
    
    // Todos pueden marcar como REPROGRAMADO o RECHAZADO
    estados.push(ESTADOS_ENTREGAS.REPROGRAMADO);
    estados.push(ESTADOS_ENTREGAS.RECHAZADO);
    
    // Todos pueden marcar como ENTREGADO (con foto)
    estados.push(ESTADOS_ENTREGAS.ENTREGADO);
    
    // Si ya está ENTREGADO, solo supervisores pueden cambiar
    if (estadoActual.indexOf('ENTREGADO') !== -1) {
      if (rol && ['SUPERVISOR', 'COORDINADOR', 'ADMINISTRADOR'].indexOf(rol.toUpperCase()) === -1) {
        estados = []; // No puede cambiar
      }
    }
    
    return {
      success: true,
      estados: estados
    };
    
  } catch (e) {
    Logger.log('❌ Error en getEstadosPermitidos: ' + e.message);
    return {
      success: false,
      error: e.message,
      estados: []
    };
  }
}

/**
 * Notifica un cambio de estado a supervisores
 * 
 * @param {string} nv - Número de nota de venta
 * @param {string} nuevoEstado - Nuevo estado
 * @param {string} usuario - Usuario que realizó el cambio
 * @returns {Object} - {success, notificados[], error}
 */
function notificarCambioEstado(nv, nuevoEstado, usuario) {
  try {
    Logger.log('EstadosManager.notificarCambioEstado: ' + nv + ' → ' + nuevoEstado);
    
    // NOTA: En Google Apps Script no hay notificaciones push nativas
    // Esta función prepara los datos para que el frontend los consuma via polling
    
    var notificados = [];
    
    // Solo notificar para estados críticos
    if (nuevoEstado === ESTADOS_ENTREGAS.RECHAZADO || 
        nuevoEstado === ESTADOS_ENTREGAS.REPROGRAMADO) {
      
      // Obtener supervisores (esto se puede mejorar con una tabla de usuarios)
      // Por ahora, registramos la notificación en una hoja temporal
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var notifSheet = ss.getSheetByName('NOTIFICACIONES_ENTREGAS');
      
      if (!notifSheet) {
        // Crear hoja si no existe
        notifSheet = ss.insertSheet('NOTIFICACIONES_ENTREGAS');
        notifSheet.appendRow(['TIMESTAMP', 'N_NV', 'ESTADO', 'USUARIO', 'LEIDA']);
      }
      
      // Agregar notificación
      notifSheet.appendRow([
        new Date(),
        nv,
        nuevoEstado,
        usuario,
        false // No leída
      ]);
      
      notificados.push('supervisores');
      
      Logger.log('✅ Notificación registrada');
    }
    
    return {
      success: true,
      notificados: notificados
    };
    
  } catch (e) {
    Logger.log('❌ Error en notificarCambioEstado: ' + e.message);
    return {
      success: false,
      error: e.message,
      notificados: []
    };
  }
}

/**
 * Obtiene el historial de una N.V
 * 
 * @param {string} nv - Número de nota de venta
 * @returns {Object} - {success, historial[], error}
 */
function getHistorialEntrega(nv) {
  try {
    Logger.log('EstadosManager.getHistorialEntrega: ' + nv);
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('HISTORIAL_ENTREGAS');
    
    if (!sheet) {
      return {
        success: true,
        historial: []
      };
    }
    
    var data = sheet.getDataRange().getValues();
    var historial = [];
    
    // Saltar header (fila 0)
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      if (String(row[1]).trim() === nv) {
        historial.push({
          timestamp: row[0],
          nv: row[1],
          usuario: row[2],
          estadoAnterior: row[3],
          estadoNuevo: row[4],
          motivo: row[5],
          fotoLink: row[6],
          latitud: row[7],
          longitud: row[8],
          dispositivo: row[9]
        });
      }
    }
    
    // Ordenar por timestamp descendente (más reciente primero)
    historial.sort(function(a, b) {
      return new Date(b.timestamp) - new Date(a.timestamp);
    });
    
    Logger.log('✅ Historial encontrado: ' + historial.length + ' registros');
    
    return {
      success: true,
      historial: historial
    };
    
  } catch (e) {
    Logger.log('❌ Error en getHistorialEntrega: ' + e.message);
    return {
      success: false,
      error: e.message,
      historial: []
    };
  }
}

/**
 * Test del EstadosManager
 */
function testEstadosManager() {
  Logger.log('=== TEST ESTADOS MANAGER ===\n');
  
  // 1. Test validación ENTREGADO sin foto
  Logger.log('1. Test validación ENTREGADO sin foto...');
  var result1 = validarCambioEstado('EN RUTA', 'ENTREGADO', {});
  Logger.log('   Resultado: ' + JSON.stringify(result1));
  Logger.log('   Esperado: valido=false, error sobre foto');
  
  // 2. Test validación ENTREGADO con foto
  Logger.log('\n2. Test validación ENTREGADO con foto...');
  var result2 = validarCambioEstado('EN RUTA', 'ENTREGADO', { foto: 'https://drive.google.com/...' });
  Logger.log('   Resultado: ' + JSON.stringify(result2));
  Logger.log('   Esperado: valido=true');
  
  // 3. Test validación RECHAZADO sin motivo
  Logger.log('\n3. Test validación RECHAZADO sin motivo...');
  var result3 = validarCambioEstado('EN RUTA', 'RECHAZADO', {});
  Logger.log('   Resultado: ' + JSON.stringify(result3));
  Logger.log('   Esperado: valido=false, error sobre motivo');
  
  // 4. Test registrar cambio
  Logger.log('\n4. Test registrarCambioEstado...');
  var result4 = registrarCambioEstadoEntregas('TEST001', 'EN RUTA', 'ENTREGADO', 'TestUser', {
    fotoLink: 'https://drive.google.com/test',
    motivo: 'Test'
  });
  Logger.log('   Resultado: ' + JSON.stringify(result4));
  
  // 5. Test obtener historial
  Logger.log('\n5. Test getHistorialEntrega...');
  var result5 = getHistorialEntrega('TEST001');
  Logger.log('   Resultado: ' + JSON.stringify(result5));
  
  // 6. Test estados permitidos
  Logger.log('\n6. Test getEstadosPermitidos...');
  var result6 = getEstadosPermitidos('EN RUTA', 'USUARIO');
  Logger.log('   Resultado: ' + JSON.stringify(result6));
  
  Logger.log('\n=== FIN TEST ===');
}
