/**
 * Triggers.gs
 * Manejadores de eventos del spreadsheet (onEdit, onOpen, etc.)
 */

/**
 * Trigger que se ejecuta al editar cualquier celda
 * @param {Object} e - Evento de edición
 */
function onEdit(e) {
  try {
    if (!e || !e.range) return;
    
    var sheet = e.range.getSheet();
    var sheetName = sheet.getName();
    var range = e.range;
    var col = range.getColumn();
    var row = range.getRow();
    var val = e.value; // Nuevo valor
    
    // 1. Manejo de cambios de estado en N.V DIARIAS
    // Columna C (3) es ESTADO
    if (sheetName === 'N.V DIARIAS' && col === 3 && row > 1) {
      var nVenta = sheet.getRange(row, 2).getValue(); // Columna B es N.Venta
      var nuevoEstado = String(val || '').trim().toUpperCase();
      
      Logger.log('Cambio de estado en N.V DIARIAS: ' + nVenta + ' -> ' + nuevoEstado);
      
      // Si el estado cambia a PENDIENTE PICKING, migrar automáticamente
      if (nuevoEstado === 'PENDIENTE PICKING' || nuevoEstado === 'PENDIENTE_PICKING') {
        Logger.log('Iniciando migración automática a PICKING para N.V: ' + nVenta);
        
        // Esperar un momento para asegurar que la celda se guardó
        Utilities.sleep(100);
        
        if (typeof migrarNVDiariasAPicking === 'function') {
          var result = migrarNVDiariasAPicking(nVenta);
          Logger.log('Resultado migración automática: ' + JSON.stringify(result));
          
          if (result.success) {
            e.source.toast('N.V ' + nVenta + ' copiada a PICKING automáticamente', 'Sistema Picking', 3);
          } else if (result.mensaje === 'N.V ya existe en PICKING') {
             // Ya estaba, no es error critico
          } else {
            e.source.toast('Error al copiar a PICKING: ' + result.error, 'Error', 5);
          }
        }
      }
    }
    
    // 2. Otros triggers existentes (ej: Deduplicacion)
    if (typeof onEditDeduplicacion === 'function') {
      onEditDeduplicacion(e);
    }
    
  } catch (error) {
    Logger.log('Error en onEdit global: ' + error.message);
  }
}
