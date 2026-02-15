/**
 * PickingDiagnostico.gs
 * Funciones de diagnóstico para el módulo de picking
 * Ayuda a identificar por qué no se muestran las ubicaciones
 */

/**
 * Diagnóstico completo del sistema de ubicaciones
 * @returns {Object} - Información detallada del estado del sistema
 */
function diagnosticarSistemaUbicaciones() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var diagnostico = {
      success: true,
      timestamp: new Date().toISOString(),
      hojas: {},
      ubicaciones: {},
      notasVenta: {},
      coincidencias: []
    };
    
    // 1. Verificar hoja UBICACIONES
    var sheetUbic = ss.getSheetByName('UBICACIONES');
    if (!sheetUbic) {
      diagnostico.ubicaciones = {
        existe: false,
        error: 'Hoja UBICACIONES no encontrada'
      };
    } else {
      var lastRowUbic = sheetUbic.getLastRow();
      diagnostico.ubicaciones = {
        existe: true,
        totalFilas: lastRowUbic,
        tieneEncabezados: lastRowUbic >= 1,
        tieneDatos: lastRowUbic > 1
      };
      
      if (lastRowUbic > 1) {
        var dataUbic = sheetUbic.getRange(2, 1, lastRowUbic - 1, 10).getValues();
        var codigosUbic = {};
        var conStock = 0;
        var sinStock = 0;
        
        for (var i = 0; i < dataUbic.length; i++) {
          var codigo = String(dataUbic[i][1] || '').trim().toUpperCase();
          var cantidad = Number(dataUbic[i][8]) || 0;
          
          if (codigo) {
            if (!codigosUbic[codigo]) {
              codigosUbic[codigo] = {
                codigo: codigo,
                ubicaciones: 0,
                stockTotal: 0
              };
            }
            codigosUbic[codigo].ubicaciones++;
            codigosUbic[codigo].stockTotal += cantidad;
            
            if (cantidad > 0) {
              conStock++;
            } else {
              sinStock++;
            }
          }
        }
        
        diagnostico.ubicaciones.productosUnicos = Object.keys(codigosUbic).length;
        diagnostico.ubicaciones.ubicacionesConStock = conStock;
        diagnostico.ubicaciones.ubicacionesSinStock = sinStock;
        diagnostico.ubicaciones.codigosDisponibles = Object.keys(codigosUbic);
        diagnostico.ubicaciones.detalleProductos = codigosUbic;
      }
    }
    
    // 2. Verificar hoja N.V DIARIAS
    var sheetNV = ss.getSheetByName('N.V DIARIAS');
    if (!sheetNV) {
      diagnostico.notasVenta = {
        existe: false,
        error: 'Hoja N.V DIARIAS no encontrada'
      };
    } else {
      var lastRowNV = sheetNV.getLastRow();
      diagnostico.notasVenta = {
        existe: true,
        totalFilas: lastRowNV,
        tieneEncabezados: lastRowNV >= 1,
        tieneDatos: lastRowNV > 1
      };
      
      if (lastRowNV > 1) {
        var dataNV = sheetNV.getRange(2, 1, lastRowNV - 1, 12).getValues();
        var codigosNV = {};
        var nvPendientes = 0;
        
        for (var j = 0; j < dataNV.length; j++) {
          var codigoNV = String(dataNV[j][8] || '').trim().toUpperCase();
          var estado = String(dataNV[j][2] || '').trim().toUpperCase();
          
          if (codigoNV) {
            if (!codigosNV[codigoNV]) {
              codigosNV[codigoNV] = {
                codigo: codigoNV,
                apariciones: 0,
                pendientePicking: false
              };
            }
            codigosNV[codigoNV].apariciones++;
            
            if (estado === 'PENDIENTE PICKING') {
              codigosNV[codigoNV].pendientePicking = true;
              nvPendientes++;
            }
          }
        }
        
        diagnostico.notasVenta.productosUnicos = Object.keys(codigosNV).length;
        diagnostico.notasVenta.productosPendientes = nvPendientes;
        diagnostico.notasVenta.codigosEnNV = Object.keys(codigosNV);
        diagnostico.notasVenta.detalleProductos = codigosNV;
      }
    }
    
    // 3. Verificar coincidencias entre UBICACIONES y N.V DIARIAS
    if (diagnostico.ubicaciones.codigosDisponibles && diagnostico.notasVenta.codigosEnNV) {
      var codigosUbicSet = diagnostico.ubicaciones.codigosDisponibles;
      var codigosNVSet = diagnostico.notasVenta.codigosEnNV;
      
      for (var k = 0; k < codigosNVSet.length; k++) {
        var codigoNV = codigosNVSet[k];
        var tieneUbicacion = codigosUbicSet.indexOf(codigoNV) !== -1;
        var tieneStock = tieneUbicacion && diagnostico.ubicaciones.detalleProductos[codigoNV].stockTotal > 0;
        
        diagnostico.coincidencias.push({
          codigo: codigoNV,
          enNV: true,
          enUbicaciones: tieneUbicacion,
          tieneStock: tieneStock,
          stockTotal: tieneStock ? diagnostico.ubicaciones.detalleProductos[codigoNV].stockTotal : 0,
          ubicaciones: tieneUbicacion ? diagnostico.ubicaciones.detalleProductos[codigoNV].ubicaciones : 0
        });
      }
      
      // Contar coincidencias
      var coincidenciasCompletas = 0;
      for (var m = 0; m < diagnostico.coincidencias.length; m++) {
        if (diagnostico.coincidencias[m].tieneStock) {
          coincidenciasCompletas++;
        }
      }
      
      diagnostico.resumen = {
        productosEnNV: codigosNVSet.length,
        productosEnUbicaciones: codigosUbicSet.length,
        coincidenciasConStock: coincidenciasCompletas,
        porcentajeCoincidencia: codigosNVSet.length > 0 ? 
          Math.round((coincidenciasCompletas / codigosNVSet.length) * 100) : 0
      };
    }
    
    // 4. Listar todas las hojas
    var sheets = ss.getSheets();
    diagnostico.hojas.total = sheets.length;
    diagnostico.hojas.nombres = [];
    for (var n = 0; n < sheets.length; n++) {
      diagnostico.hojas.nombres.push(sheets[n].getName());
    }
    
    return diagnostico;
    
  } catch (e) {
    return {
      success: false,
      error: 'Error en diagnóstico: ' + e.message,
      stack: e.stack
    };
  }
}

/**
 * Obtiene un resumen simple del diagnóstico
 * @returns {Object} - Resumen en formato legible
 */
function diagnosticoResumen() {
  var diag = diagnosticarSistemaUbicaciones();
  
  if (!diag.success) {
    return diag;
  }
  
  var resumen = {
    success: true,
    mensaje: '',
    problemas: [],
    soluciones: []
  };
  
  // Verificar hoja UBICACIONES
  if (!diag.ubicaciones.existe) {
    resumen.problemas.push('❌ Hoja UBICACIONES no existe');
    resumen.soluciones.push('Ejecuta: SETUP_crearHojaUbicaciones()');
  } else if (!diag.ubicaciones.tieneDatos) {
    resumen.problemas.push('❌ Hoja UBICACIONES está vacía');
    resumen.soluciones.push('Ejecuta: SETUP_agregarDatosEjemplo()');
  } else if (diag.ubicaciones.ubicacionesConStock === 0) {
    resumen.problemas.push('❌ No hay productos con stock > 0 en UBICACIONES');
    resumen.soluciones.push('Actualiza la columna I (CANTIDAD_CONTADA) con valores > 0');
  }
  
  // Verificar hoja N.V DIARIAS
  if (!diag.notasVenta.existe) {
    resumen.problemas.push('❌ Hoja N.V DIARIAS no existe');
    resumen.soluciones.push('Crea la hoja N.V DIARIAS manualmente');
  } else if (!diag.notasVenta.tieneDatos) {
    resumen.problemas.push('❌ Hoja N.V DIARIAS está vacía');
    resumen.soluciones.push('Ejecuta: SETUP_agregarNVEjemplo()');
  } else if (diag.notasVenta.productosPendientes === 0) {
    resumen.problemas.push('❌ No hay N.V con estado PENDIENTE PICKING');
    resumen.soluciones.push('Cambia el estado de algunas N.V a "PENDIENTE PICKING"');
  }
  
  // Verificar coincidencias
  if (diag.resumen && diag.resumen.coincidenciasConStock === 0) {
    resumen.problemas.push('❌ Los códigos en UBICACIONES no coinciden con los de N.V DIARIAS');
    resumen.soluciones.push('Verifica que los códigos sean EXACTAMENTE iguales (mayúsculas, espacios, etc.)');
  }
  
  if (resumen.problemas.length === 0) {
    resumen.mensaje = '✅ Sistema configurado correctamente';
    resumen.estadisticas = diag.resumen;
  } else {
    resumen.mensaje = '⚠️ Se encontraron ' + resumen.problemas.length + ' problemas';
  }
  
  return resumen;
}

/**
 * Prueba rápida: obtiene ubicaciones para el primer código disponible
 * @returns {Object} - Resultado de la prueba
 */
function pruebaRapidaUbicaciones() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('UBICACIONES');
    
    if (!sheet) {
      return {
        success: false,
        error: 'Hoja UBICACIONES no encontrada',
        solucion: 'Ejecuta: SETUP_COMPLETO()'
      };
    }
    
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      return {
        success: false,
        error: 'Hoja UBICACIONES está vacía',
        solucion: 'Ejecuta: SETUP_agregarDatosEjemplo()'
      };
    }
    
    // Buscar primer producto con stock
    var data = sheet.getRange(2, 1, lastRow - 1, 10).getValues();
    var codigoEncontrado = null;
    
    for (var i = 0; i < data.length; i++) {
      var codigo = String(data[i][1] || '').trim();
      var cantidad = Number(data[i][8]) || 0;
      
      if (codigo && cantidad > 0) {
        codigoEncontrado = codigo;
        break;
      }
    }
    
    if (!codigoEncontrado) {
      return {
        success: false,
        error: 'No hay productos con stock > 0',
        solucion: 'Actualiza la columna I con cantidades > 0'
      };
    }
    
    // Probar getUbicacionesDisponibles
    var result = getUbicacionesDisponibles(codigoEncontrado);
    
    return {
      success: true,
      codigoProbado: codigoEncontrado,
      resultado: result,
      mensaje: result.success && result.total > 0 ? 
        '✅ Funciona correctamente. Encontradas ' + result.total + ' ubicaciones' :
        '⚠️ No se encontraron ubicaciones para el código ' + codigoEncontrado
    };
    
  } catch (e) {
    return {
      success: false,
      error: 'Error en prueba: ' + e.message
    };
  }
}
