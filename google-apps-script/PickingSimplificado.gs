/**
 * PickingSimplificado.gs - Módulo de Picking SIMPLIFICADO
 * 
 * CAMBIO PRINCIPAL: Elimina validación estricta por ubicación
 * Permite confirmar picking sin seleccionar ubicación específica
 * 
 * DECISIONES DE DISEÑO:
 * - NO validar stock (confiar en el usuario)
 * - Hoja UBICACIONES solo como referencia
 * - Permite cantidad completa o parcial
 * - Descuento de stock se hace en etapa posterior
 */

/**
 * Confirma picking de un producto de forma simplificada
 * SIN validar stock ni requerir ubicación específica
 * 
 * @param {string} notaVenta - Número de N.V
 * @param {string} codigoProducto - Código del producto
 * @param {number} cantidadPickeada - Cantidad que se pickeó
 * @param {string} usuario - Usuario que realiza el picking
 * @returns {Object} {success, mensaje, cantidad}
 */
function confirmarPickingSimplificado(notaVenta, codigoProducto, cantidadPickeada, usuario) {
  try {
    Logger.log('===== PICKING SIMPLIFICADO =====');
    Logger.log('N.V: ' + notaVenta);
    Logger.log('Producto: ' + codigoProducto);
    Logger.log('Cantidad pickeada: ' + cantidadPickeada);
    Logger.log('Usuario: ' + usuario);
    
    if (!notaVenta || !codigoProducto || !cantidadPickeada) {
      return { success: false, error: 'Datos incompletos' };
    }
    
    // 1. Marcar producto como recolectado en ORDENES
    var marcado = marcarProductoRecolectado(notaVenta, codigoProducto);
    if (!marcado) {
      Logger.log('⚠️ No se pudo marcar producto en ORDENES');
    }
    
    // 2. Registrar en PICKING_LOG o MOVIMIENTOS para trazabilidad
    try {
      registrarPickingEnLog({
        notaVenta: notaVenta,
        codigoProducto: codigoProducto,
        cantidad: cantidadPickeada,
        usuario: usuario,
        fecha: new Date(),
        tipo: 'PICKING_CONFIRMADO'
      });
    } catch (logError) {
      Logger.log('⚠️ Error registrando en log: ' + logError.message);
      // No fallar si el log falla
    }
    
    Logger.log('✅ Picking confirmado correctamente');
    
    return {
      success: true,
      mensaje: 'Producto pickeado: ' + cantidadPickeada + ' unidades',
      cantidad: cantidadPickeada,
      codigo: codigoProducto
    };
    
  } catch (e) {
    Logger.log('❌ Error en confirmarPickingSimplificado: ' + e.message);
    return {
      success: false,
      error: 'Error al confirmar picking: ' + e.message
    };
  }
}

/**
 * Registra el picking en log para trazabilidad
 * Crea/usa hoja PICKING_LOG con estructura simple
 */
function registrarPickingEnLog(datos) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('PICKING_LOG');
    
    // Crear hoja si no existe
    if (!sheet) {
      sheet = ss.insertSheet('PICKING_LOG');
      sheet.appendRow([
        'ID',
        'Fecha/Hora',
        'N.V',
        'Código Producto',
        'Cantidad',
        'Usuario',
        'Tipo'
      ]);
      sheet.getRange(1, 1, 1, 7).setFontWeight('bold').setBackground('#4CAF50').setFontColor('white');
    }
    
    // Agregar registro
    var id = 'PICK-' + new Date().getTime();
    sheet.appendRow([
      id,
      datos.fecha || new Date(),
      datos.notaVenta,
      datos.codigoProducto,
      datos.cantidad,
      datos.usuario || 'Sistema',
      datos.tipo || 'PICKING'
    ]);
    
    Logger.log('✅ Picking registrado en log: ' + id);
    
  } catch (e) {
    Logger.log('Error en registrarPickingEnLog: ' + e.message);
    // No lanzar error, solo log
  }
}

/**
 * Verifica si todos los productos de una N.V fueron pickeados
 * @param {string} notaVenta - Número de N.V
 * @returns {Object} {completo: boolean, pickeados: number, total: number}
 */
function verificarPickingCompleto(notaVenta) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheetOrdenes = ss.getSheetByName('ORDENES');
    
    if (!sheetOrdenes) {
      return { completo: false, error: 'Hoja ORDENES no encontrada' };
    }
    
    var data = sheetOrdenes.getDataRange().getValues();
    var productosNV = [];
    var pickeados = 0;
    
    // Buscar todos los productos de esta N.V
    for (var i = 1; i < data.length; i++) {
      var nvFila = String(data[i][1] || '').trim(); // Columna B = N.V
      
      if (nvFila === notaVenta.trim()) {
        var codigo = String(data[i][8] || '').trim(); // Columna I = Código
        if (codigo) {
          productosNV.push(codigo);
        }
      }
    }
    
    // Contar cuántos fueron pickeados
    var recolectados = getProductosRecolectados(notaVenta);
    pickeados = recolectados.length;
    
    var completo = (pickeados === productosNV.length && productosNV.length > 0);
    
    Logger.log('Verificando picking N.V ' + notaVenta + ': ' + pickeados + '/' + productosNV.length);
    
    return {
      completo: completo,
      pickeados: pickeados,
      total: productosNV.length,
      faltantes: productosNV.length - pickeados
    };
    
  } catch (e) {
    Logger.log('Error en verificarPickingCompleto: ' + e.message);
    return { completo: false, error: e.message };
  }
}

/**
 * Alias de compatibilidad para el frontend
 */
function pickProductoSimplificado(nv, codigo, cantidad, usuario) {
  return confirmarPickingSimplificado(nv, codigo, cantidad, usuario);
}
