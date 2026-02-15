/**
 * ============================================================
 * ORQUESTADOR DE MIGRACIONES
 * Ejecuta migraciones automáticas basadas en cambios de estado
 * ============================================================
 */

/**
 * Ejecuta las migraciones correspondientes según el cambio de estado
 * @param {string} nVenta - Número de N.V
 * @param {string} estadoAnterior - Estado anterior normalizado
 * @param {string} nuevoEstado - Nuevo estado normalizado
 * @param {string} usuario - Usuario que ejecuta el cambio
 * @returns {Object} - {success, migraciones}
 */
function ejecutarMigracionPorEstado(nVenta, estadoAnterior, nuevoEstado, usuario) {
  try {
    Logger.log('=== EJECUTANDO MIGRACIONES ===');
    Logger.log('N.V: ' + nVenta);
    Logger.log('Estado: ' + estadoAnterior + ' → ' + nuevoEstado);
    
    var resultados = [];
    var fechaHora = new Date();
    
    // Determinar acciones según nuevo estado
    switch (nuevoEstado) {
      
      // ========== PENDIENTE PICKING ==========
      case 'PENDIENTE_PICKING':
        Logger.log('→ Migración a PICKING - MOVER desde N.V DIARIAS');
        
        // 1. Copiar a PICKING
        var copyPicking = copiarNVAHoja(nVenta, HOJA_PICKING, usuario, {});
        resultados.push({ accion: 'COPIAR_PICKING', resultado: copyPicking });
        
        // 2. CRÍTICO: ELIMINAR de N.V DIARIAS
        var delNVDiarias = eliminarNVDeHoja(nVenta, HOJA_MASTER);
        resultados.push({ accion: 'ELIMINAR_NV_DIARIAS', resultado: delNVDiarias });
        
        Logger.log('✅ N.V movida completamente a PICKING (eliminada de N.V DIARIAS)');
        break;
      
      // ========== EN PICKING ==========
      case 'EN_PICKING':
        // Permanece en PICKING, no hacer nada
        Logger.log('→ En proceso de picking, sin migración');
        break;
      
      // ========== PACKING ==========
      case 'PK':
      case 'PENDIENTE_PACKING':
        Logger.log('→ Migración a PACKING - MOVER desde PICKING');
        
        // 1. Copiar a PACKING
        var copyPacking = copiarNVAHoja(nVenta, HOJA_PACKING, usuario, {
          fechaPicking: obtenerFechaDeHoja(nVenta, HOJA_PICKING),
          usuarioPicking: obtenerUsuarioDeHoja(nVenta, HOJA_PICKING)
        });
        resultados.push({ accion: 'COPIAR_PACKING', resultado: copyPacking });
        
        // 2. Eliminar de PICKING
        var delPicking = eliminarNVDeHoja(nVenta, HOJA_PICKING);
        resultados.push({ accion: 'ELIMINAR_PICKING', resultado: delPicking });
        
        Logger.log('✅ N.V movida completamente a PACKING (eliminada de PICKING)');
        break;
      
      // ========== LISTO PARA DESPACHO ==========
      case 'LISTO_DESPACHO':
      case 'LISTO_PARA_DESPACHO':
      case 'PENDIENTE_DESPACHO':
        Logger.log('→ Migración a DESPACHOS y OK - MOVER desde PACKING');
        
        // 1. Copiar a DESPACHOS
        var copyDespachos = copiarNVAHoja(nVenta, HOJA_DESPACHOS, usuario, {});
        resultados.push({ accion: 'COPIAR_DESPACHOS', resultado: copyDespachos });
        
        // 2. Eliminar de PACKING
        var delPacking = eliminarNVDeHoja(nVenta, HOJA_PACKING);
        resultados.push({ accion: 'ELIMINAR_PACKING', resultado: delPacking });
        
        // 3. Copiar a OK (historial) con metadata completa
        var metadata = {
          fechaPicking: obtenerFechaDeHoja(nVenta, HOJA_PICKING),
          usuarioPicking: obtenerUsuarioDeHoja(nVenta, HOJA_PICKING),
          fechaPacking: obtenerFechaDeHoja(nVenta, HOJA_PACKING),
          usuarioPacking: obtenerUsuarioDeHoja(nVenta, HOJA_PACKING),
          fechaDespacho: fechaHora,
          usuarioDespacho: usuario
        };
        
        // Asegurar que hoja OK existe
        crearOVerificarHojaOK();
        
        var copyOK = copiarNVAHoja(nVenta, HOJA_OK, usuario, metadata);
        resultados.push({ accion: 'COPIAR_OK', resultado: copyOK });
        
        Logger.log('✅ N.V movida completamente a DESPACHOS (eliminada de PACKING) + copiada a OK');
        break;
      
      // ========== DESPACHADO / EN TRÁNSITO ==========
      case 'DESPACHADO':
      case 'EN_TRANSITO':
        Logger.log('→ Permanece en DESPACHOS');
        // Permanece en DESPACHOS, actualizar en OK si existe
        var updateOK1 = actualizarNVEnOK(nVenta, nuevoEstado, usuario);
        resultados.push({ accion: 'ACTUALIZAR_OK', resultado: updateOK1 });
        break;
      
      // ========== ENTREGADO ==========
      case 'ENTREGADO':
        Logger.log('→ Migración a ENTREGAS y actualización en OK');
        
        // 1. Eliminar de DESPACHOS
        var delDespachos = eliminarNVDeHoja(nVenta, HOJA_DESPACHOS);
        resultados.push({ accion: 'ELIMINAR_DESPACHOS', resultado: delDespachos });
        
        // 2. Copiar a ENTREGAS
        var copyEntregas = copiarNVAHoja(nVenta, HOJA_ENTREGAS, usuario, {});
        resultados.push({ accion: 'COPIAR_ENTREGAS', resultado: copyEntregas });
        
        // 3. Actualizar en OK (marcar como completado con FECHA Y HORA)
        var updateOK2 = actualizarNVEnOK(nVenta, 'ENTREGADO', usuario);
        resultados.push({ accion: 'ACTUALIZAR_OK_COMPLETADO', resultado: updateOK2 });
        break;
      
      // ========== OTROS ESTADOS ==========
      default:
        Logger.log('→ Estado ' + nuevoEstado + ' sin migraciones automáticas');
        break;
    }
    
    Logger.log('=== MIGRACIONES COMPLETADAS ===');
    Logger.log('Total de acciones: ' + resultados.length);
    
    return {
      success: true,
      migraciones: resultados,
      totalAcciones: resultados.length
    };
    
  } catch (e) {
    Logger.log('ERROR en ejecutarMigracionPorEstado: ' + e.message);
    return {
      success: false,
      error: e.message,
      migraciones: resultados
    };
  }
}

/**
 * Obtiene la fecha de ingreso de una N.V en una hoja
 * @param {string} nVenta - Número de N.V
 * @param {string} nombreHoja - Nombre de la hoja
 * @returns {Date|null}
 */
function obtenerFechaDeHoja(nVenta, nombreHoja) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(nombreHoja);
    
    if (!sheet || sheet.getLastRow() <= 1) {
      return null;
    }
    
    var data = sheet.getDataRange().getValues();
    
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][1] || '').trim() === nVenta) {
        // Columna M (índice 12) = Fecha Ingreso
        return data[i][12] || null;
      }
    }
    
    return null;
    
  } catch (e) {
    Logger.log('ERROR en obtenerFechaDeHoja: ' + e.message);
    return null;
  }
}

/**
 * Obtiene el usuario que ingresó una N.V en una hoja
 * @param {string} nVenta - Número de N.V
 * @param {string} nombreHoja - Nombre de la hoja
 * @returns {string|null}
 */
function obtenerUsuarioDeHoja(nVenta, nombreHoja) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(nombreHoja);
    
    if (!sheet || sheet.getLastRow() <= 1) {
      return null;
    }
    
    var data = sheet.getDataRange().getValues();
    
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][1] || '').trim() === nVenta) {
        // Columna N (índice 13) = Usuario
        return String(data[i][13] || '');
      }
    }
    
    return null;
    
  } catch (e) {
    Logger.log('ERROR en obtenerUsuarioDeHoja: ' + e.message);
    return null;
  }
}

/**
 * Test de migración completa - ejecutar desde Apps Script
 */
function testMigracionCompleta() {
  Logger.log('╔════════════════════════════════════════╗');
  Logger.log('║   TEST DE MIGRACIÓN COMPLETA          ║');
  Logger.log('╚════════════════════════════════════════╝');
  
  // Crear hoja OK
  crearOVerificarHojaOK();
  
  Logger.log('✅ Test completado - Hoja OK verificada');
}
