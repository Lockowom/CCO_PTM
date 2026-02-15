
/**
 * ============================================================================
 * UTILIDADES DE MANTENIMIENTO
 * ============================================================================
 */

/**
 * ⚠️ EJECUTAR ESTA FUNCIÓN MANUALMENTE PARA REINICIAR LA SINCRONIZACIÓN
 * Borra la marca "OK" de la columna SYNC_STATUS en todas las hojas de inventario.
 * Útil cuando se ha limpiado la base de datos y se necesita reenviar todo.
 */
function FORZAR_REINICIO_INVENTARIO() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  // Solo reseteamos las hojas maestras de inventario
  const hojas = ['Partidas', 'Series', 'Farmapack', 'Peso', 'Ubicaciones'];
  
  hojas.forEach(nombre => {
    const sheet = ss.getSheetByName(nombre);
    if (!sheet) {
      console.warn(`Hoja ${nombre} no encontrada.`);
      return;
    }
    
    const lastRow = sheet.getLastRow();
    const lastCol = sheet.getLastColumn();
    
    if (lastRow < 2) return;
    
    // Buscar la columna SYNC_STATUS
    const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    const colIdx = headers.indexOf('SYNC_STATUS');
    
    if (colIdx !== -1) {
      // Limpiar contenido de la columna (fila 2 hacia abajo)
      // colIdx + 1 porque getRange usa base-1
      sheet.getRange(2, colIdx + 1, lastRow - 1, 1).clearContent();
      console.log(`[${nombre}] Marcas de sincronización eliminadas. Listo para reenviar.`);
    } else {
      console.warn(`[${nombre}] No se encontró columna SYNC_STATUS.`);
    }
  });
  
  console.log("✅ Reinicio completado. Ahora ejecuta la función 'syncAllToCloud' para cargar los datos a la nueva base de datos.");
}
