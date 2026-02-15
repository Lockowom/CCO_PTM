/**
 * PickingRealTime.gs
 * Gestión de actualización en tiempo real y concurrencia para picking
 * 
 * Este módulo maneja:
 * - Timestamps de última actualización
 * - Bloqueo de N.V para evitar picking simultáneo
 * - Timeout automático de bloqueos (30 minutos)
 * - Liberación de bloqueos
 */

// ==================== CONFIGURACIÓN ====================

var TIMEOUT_BLOQUEO_MINUTOS = 30;

// ==================== ÚLTIMA ACTUALIZACIÓN ====================

/**
 * Obtiene el timestamp de última modificación de una N.V
 * @param {string} notaVenta - Número de nota de venta
 * @returns {Object} - {success, ultimaActualizacion}
 */
function getUltimaActualizacionNV(notaVenta) {
  try {
    var estadoNV = getEstadoPickingNV(notaVenta);
    
    if (!estadoNV.success || !estadoNV.ultimaActualizacion) {
      return {
        success: true,
        notaVenta: notaVenta,
        ultimaActualizacion: null,
        mensaje: 'No hay actualizaciones registradas'
      };
    }
    
    return {
      success: true,
      notaVenta: notaVenta,
      ultimaActualizacion: estadoNV.ultimaActualizacion,
      timestamp: new Date(estadoNV.ultimaActualizacion).getTime()
    };
    
  } catch (e) {
    Logger.log('Error en getUltimaActualizacionNV: ' + e.message);
    return { 
      success: false, 
      error: e.message,
      ultimaActualizacion: null
    };
  }
}

/**
 * Actualiza el timestamp de última modificación
 * @param {string} notaVenta - Número de nota de venta
 * @returns {Object} - {success}
 */
function actualizarTimestampNV(notaVenta) {
  try {
    var props = PropertiesService.getScriptProperties();
    var key = 'PICKING_STATE_' + notaVenta;
    var estadoStr = props.getProperty(key);
    
    var estado = estadoStr ? JSON.parse(estadoStr) : {
      notaVenta: notaVenta,
      productos: []
    };
    
    estado.ultimaActualizacion = new Date().toISOString();
    props.setProperty(key, JSON.stringify(estado));
    
    return {
      success: true,
      notaVenta: notaVenta,
      ultimaActualizacion: estado.ultimaActualizacion
    };
    
  } catch (e) {
    Logger.log('Error en actualizarTimestampNV: ' + e.message);
    return { success: false, error: e.message };
  }
}

// ==================== BLOQUEO DE N.V ====================

/**
 * Bloquea una N.V para evitar picking simultáneo
 * @param {string} notaVenta - Número de nota de venta
 * @param {string} usuario - Usuario que bloquea
 * @returns {Object} - {success, bloqueado, usuarioBloqueado}
 */
function bloquearNVParaPicking(notaVenta, usuario) {
  try {
    Logger.log('=== bloquearNVParaPicking: ' + notaVenta + ', Usuario: ' + usuario + ' ===');
    
    if (!notaVenta || !usuario) {
      return { success: false, error: 'N.V y usuario son requeridos' };
    }
    
    // Verificar si ya está bloqueada
    var estadoBloqueo = verificarBloqueoNV(notaVenta);
    
    if (estadoBloqueo.bloqueado) {
      // Verificar timeout
      var tiempoTranscurrido = (new Date().getTime() - new Date(estadoBloqueo.fechaBloqueo).getTime()) / 1000 / 60;
      
      if (tiempoTranscurrido > TIMEOUT_BLOQUEO_MINUTOS) {
        // Timeout alcanzado, liberar bloqueo automáticamente
        Logger.log('Timeout de bloqueo alcanzado, liberando automáticamente');
        desbloquearNV(notaVenta);
      } else {
        // Aún está bloqueada por otro usuario
        if (estadoBloqueo.usuarioBloqueado !== usuario) {
          return {
            success: false,
            bloqueado: true,
            usuarioBloqueado: estadoBloqueo.usuarioBloqueado,
            fechaBloqueo: estadoBloqueo.fechaBloqueo,
            minutosRestantes: Math.round(TIMEOUT_BLOQUEO_MINUTOS - tiempoTranscurrido),
            error: 'N.V bloqueada por ' + estadoBloqueo.usuarioBloqueado
          };
        } else {
          // El mismo usuario, renovar bloqueo
          Logger.log('Mismo usuario, renovando bloqueo');
        }
      }
    }
    
    // Bloquear N.V
    var props = PropertiesService.getScriptProperties();
    var key = 'PICKING_STATE_' + notaVenta;
    var estadoStr = props.getProperty(key);
    
    var estado = estadoStr ? JSON.parse(estadoStr) : {
      notaVenta: notaVenta,
      productos: []
    };
    
    estado.bloqueado = true;
    estado.usuarioBloqueado = usuario;
    estado.fechaBloqueo = new Date().toISOString();
    estado.ultimaActualizacion = new Date().toISOString();
    
    props.setProperty(key, JSON.stringify(estado));
    
    Logger.log('N.V bloqueada exitosamente para ' + usuario);
    
    return {
      success: true,
      notaVenta: notaVenta,
      bloqueado: true,
      usuarioBloqueado: usuario,
      fechaBloqueo: estado.fechaBloqueo
    };
    
  } catch (e) {
    Logger.log('Error en bloquearNVParaPicking: ' + e.message);
    return { success: false, error: 'Error al bloquear N.V: ' + e.message };
  }
}

/**
 * Libera el bloqueo de una N.V
 * @param {string} notaVenta - Número de nota de venta
 * @returns {Object} - {success}
 */
function desbloquearNV(notaVenta) {
  try {
    Logger.log('=== desbloquearNV: ' + notaVenta + ' ===');
    
    var props = PropertiesService.getScriptProperties();
    var key = 'PICKING_STATE_' + notaVenta;
    var estadoStr = props.getProperty(key);
    
    if (!estadoStr) {
      return {
        success: true,
        notaVenta: notaVenta,
        mensaje: 'N.V no tenía bloqueo'
      };
    }
    
    var estado = JSON.parse(estadoStr);
    estado.bloqueado = false;
    estado.usuarioBloqueado = null;
    estado.fechaBloqueo = null;
    estado.ultimaActualizacion = new Date().toISOString();
    
    props.setProperty(key, JSON.stringify(estado));
    
    Logger.log('N.V desbloqueada exitosamente');
    
    return {
      success: true,
      notaVenta: notaVenta,
      bloqueado: false,
      mensaje: 'Bloqueo liberado exitosamente'
    };
    
  } catch (e) {
    Logger.log('Error en desbloquearNV: ' + e.message);
    return { success: false, error: 'Error al desbloquear N.V: ' + e.message };
  }
}

/**
 * Verifica el estado de bloqueo de una N.V
 * @param {string} notaVenta - Número de nota de venta
 * @returns {Object} - {bloqueado, usuarioBloqueado, fechaBloqueo}
 */
function verificarBloqueoNV(notaVenta) {
  try {
    var props = PropertiesService.getScriptProperties();
    var key = 'PICKING_STATE_' + notaVenta;
    var estadoStr = props.getProperty(key);
    
    if (!estadoStr) {
      return {
        bloqueado: false,
        usuarioBloqueado: null,
        fechaBloqueo: null
      };
    }
    
    var estado = JSON.parse(estadoStr);
    
    return {
      bloqueado: estado.bloqueado || false,
      usuarioBloqueado: estado.usuarioBloqueado || null,
      fechaBloqueo: estado.fechaBloqueo || null
    };
    
  } catch (e) {
    Logger.log('Error en verificarBloqueoNV: ' + e.message);
    return {
      bloqueado: false,
      usuarioBloqueado: null,
      fechaBloqueo: null,
      error: e.message
    };
  }
}

// ==================== LIMPIEZA DE BLOQUEOS EXPIRADOS ====================

/**
 * Limpia todos los bloqueos que han excedido el timeout
 * Se puede ejecutar periódicamente con un trigger
 * @returns {Object} - {success, bloqueosLiberados}
 */
function limpiarBloqueosExpirados() {
  try {
    Logger.log('=== limpiarBloqueosExpirados ===');
    
    var props = PropertiesService.getScriptProperties();
    var allProps = props.getProperties();
    var bloqueosLiberados = 0;
    var ahora = new Date().getTime();
    
    for (var key in allProps) {
      if (key.indexOf('PICKING_STATE_') === 0) {
        try {
          var estado = JSON.parse(allProps[key]);
          
          if (estado.bloqueado && estado.fechaBloqueo) {
            var tiempoTranscurrido = (ahora - new Date(estado.fechaBloqueo).getTime()) / 1000 / 60;
            
            if (tiempoTranscurrido > TIMEOUT_BLOQUEO_MINUTOS) {
              // Liberar bloqueo
              estado.bloqueado = false;
              estado.usuarioBloqueado = null;
              estado.fechaBloqueo = null;
              estado.ultimaActualizacion = new Date().toISOString();
              
              props.setProperty(key, JSON.stringify(estado));
              bloqueosLiberados++;
              
              Logger.log('Bloqueo expirado liberado: ' + estado.notaVenta);
            }
          }
        } catch (parseError) {
          Logger.log('Error al parsear estado: ' + key);
        }
      }
    }
    
    Logger.log('Bloqueos liberados: ' + bloqueosLiberados);
    
    return {
      success: true,
      bloqueosLiberados: bloqueosLiberados,
      mensaje: bloqueosLiberados + ' bloqueos expirados liberados'
    };
    
  } catch (e) {
    Logger.log('Error en limpiarBloqueosExpirados: ' + e.message);
    return { success: false, error: e.message };
  }
}

// ==================== VERIFICAR CAMBIOS ====================

/**
 * Verifica si ha habido cambios en una N.V desde un timestamp dado
 * @param {string} notaVenta - Número de nota de venta
 * @param {string} timestampCliente - Timestamp del cliente (ISO string)
 * @returns {Object} - {hayCambios, ultimaActualizacion}
 */
function verificarCambiosNV(notaVenta, timestampCliente) {
  try {
    var ultimaActualizacion = getUltimaActualizacionNV(notaVenta);
    
    if (!ultimaActualizacion.success || !ultimaActualizacion.ultimaActualizacion) {
      return {
        success: true,
        hayCambios: false,
        ultimaActualizacion: null
      };
    }
    
    var timestampServidor = new Date(ultimaActualizacion.ultimaActualizacion).getTime();
    var timestampClienteNum = new Date(timestampCliente).getTime();
    
    var hayCambios = timestampServidor > timestampClienteNum;
    
    return {
      success: true,
      notaVenta: notaVenta,
      hayCambios: hayCambios,
      ultimaActualizacion: ultimaActualizacion.ultimaActualizacion,
      timestampServidor: timestampServidor,
      timestampCliente: timestampClienteNum
    };
    
  } catch (e) {
    Logger.log('Error en verificarCambiosNV: ' + e.message);
    return { 
      success: false, 
      error: e.message,
      hayCambios: false
    };
  }
}

// ==================== OBTENER ESTADO COMPLETO PARA SINCRONIZACIÓN ====================

/**
 * Obtiene el estado completo de una N.V para sincronización
 * Incluye productos, bloqueo y última actualización
 * @param {string} notaVenta - Número de nota de venta
 * @returns {Object} - {success, estado}
 */
function getEstadoCompletoNV(notaVenta) {
  try {
    var estadoPicking = getEstadoPickingNV(notaVenta);
    var estadoBloqueo = verificarBloqueoNV(notaVenta);
    var ultimaActualizacion = getUltimaActualizacionNV(notaVenta);
    
    return {
      success: true,
      notaVenta: notaVenta,
      productos: estadoPicking.productos || [],
      bloqueado: estadoBloqueo.bloqueado,
      usuarioBloqueado: estadoBloqueo.usuarioBloqueado,
      fechaBloqueo: estadoBloqueo.fechaBloqueo,
      ultimaActualizacion: ultimaActualizacion.ultimaActualizacion,
      timestamp: ultimaActualizacion.timestamp
    };
    
  } catch (e) {
    Logger.log('Error en getEstadoCompletoNV: ' + e.message);
    return { success: false, error: e.message };
  }
}

// ==================== FUNCIONES DE MANTENIMIENTO ====================

/**
 * Obtiene estadísticas de bloqueos activos
 * @returns {Object} - {success, estadisticas}
 */
function getEstadisticasBloqueos() {
  try {
    var props = PropertiesService.getScriptProperties();
    var allProps = props.getProperties();
    var bloqueosActivos = 0;
    var bloqueosExpirados = 0;
    var bloqueos = [];
    var ahora = new Date().getTime();
    
    for (var key in allProps) {
      if (key.indexOf('PICKING_STATE_') === 0) {
        try {
          var estado = JSON.parse(allProps[key]);
          
          if (estado.bloqueado && estado.fechaBloqueo) {
            var tiempoTranscurrido = (ahora - new Date(estado.fechaBloqueo).getTime()) / 1000 / 60;
            
            if (tiempoTranscurrido > TIMEOUT_BLOQUEO_MINUTOS) {
              bloqueosExpirados++;
            } else {
              bloqueosActivos++;
            }
            
            bloqueos.push({
              notaVenta: estado.notaVenta,
              usuario: estado.usuarioBloqueado,
              fechaBloqueo: estado.fechaBloqueo,
              minutosTranscurridos: Math.round(tiempoTranscurrido),
              expirado: tiempoTranscurrido > TIMEOUT_BLOQUEO_MINUTOS
            });
          }
        } catch (parseError) {
          // Ignorar errores de parseo
        }
      }
    }
    
    return {
      success: true,
      estadisticas: {
        bloqueosActivos: bloqueosActivos,
        bloqueosExpirados: bloqueosExpirados,
        total: bloqueosActivos + bloqueosExpirados,
        timeoutMinutos: TIMEOUT_BLOQUEO_MINUTOS
      },
      bloqueos: bloqueos
    };
    
  } catch (e) {
    Logger.log('Error en getEstadisticasBloqueos: ' + e.message);
    return { success: false, error: e.message };
  }
}

/**
 * Crea un trigger para limpiar bloqueos expirados cada hora
 * Ejecutar manualmente una vez para configurar
 */
function crearTriggerLimpiezaBloqueos() {
  try {
    // Eliminar triggers existentes
    var triggers = ScriptApp.getProjectTriggers();
    for (var i = 0; i < triggers.length; i++) {
      if (triggers[i].getHandlerFunction() === 'limpiarBloqueosExpirados') {
        ScriptApp.deleteTrigger(triggers[i]);
      }
    }
    
    // Crear nuevo trigger cada hora
    ScriptApp.newTrigger('limpiarBloqueosExpirados')
      .timeBased()
      .everyHours(1)
      .create();
    
    Logger.log('Trigger de limpieza de bloqueos creado');
    
    return {
      success: true,
      mensaje: 'Trigger creado exitosamente'
    };
    
  } catch (e) {
    Logger.log('Error en crearTriggerLimpiezaBloqueos: ' + e.message);
    return { success: false, error: e.message };
  }
}
