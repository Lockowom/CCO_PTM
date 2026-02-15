/**
 * FUNCIÓN PARA FORZAR REFRESCO COMPLETO DEL MÓDULO PICKING
 * Invalida todos los caches relacionados
 */
function refrescarModuloPicking() {
  try {
    Logger.log('=== REFRESCANDO MÓDULO PICKING ===');
    
    // 1. Invalidar cache de N.V
    if (typeof invalidateNVCache === 'function') {
      invalidateNVCache();
      Logger.log('✅ Cache de N.V invalidado');
    }
    
    // 2. Invalidar cache del CacheManager si existe
    if (typeof CacheManager !== 'undefined' && CacheManager.invalidate) {
      CacheManager.invalidate('N.V DIARIAS');
      CacheManager.invalidate('PICKING');
      CacheManager.invalidate('PACKING');
      Logger.log('✅ Cache Manager invalidado');
    }
    
    // 3. Forzar flush del spreadsheet
    SpreadsheetApp.flush();
    Logger.log('✅ Spreadsheet flush ejecutado');
    
    Logger.log('=== REFRESCO COMPLETADO ===');
    
    return {
      success: true,
      mensaje: 'Módulo refrescado correctamente'
    };
    
  } catch (e) {
    Logger.log('ERROR al refrescar módulo: ' + e.message);
    return {
      success: false,
      error: e.message
    };
  }
}
