/**
 * Inventory.gs - Módulo de Inventario REESTRUCTURADO COMPLETO
 * Nueva estructura INGRESO: Ubicación(A), Código(B), Serie(C), Partida(D), Pieza(E), 
 * FechaVencimiento(F), Talla(G), Color(H), CantidadContada(I), Descripción(J), 
 * FechaHoraRegistro(K), Usuario(L), ID-UUID(M)
 */

var SHEET_INGRESO = 'INGRESO';
var SHEET_INVENTARIO = 'INVENTARIO';
var SHEET_LAYOUT = 'LAYOUT';
var SHEET_MOVIMIENTOS = 'MOVIMIENTOS';
var SHEET_MATRIZ = 'MATRIZ';

// ==================== REGISTRO DE PRODUCTOS ====================

/**
 * Registra un nuevo producto en la hoja INGRESO con la nueva estructura
 * @param {Object} data - Datos del producto
 * @returns {Object} - {success, id, error}
 */
function registrarProductoInventario(data) {
  try {
    // Validaciones obligatorias
    if (!data.ubicacion || !data.codigo || !data.cantidad) {
      return { success: false, error: 'Ubicación, código y cantidad son requeridos' };
    }
    
    // Validar longitud de ubicación (máximo 8 caracteres)
    if (data.ubicacion.length > 8) {
      return { success: false, error: 'La ubicación debe tener máximo 8 caracteres' };
    }
    
    // Validar longitud de código (máximo 12 caracteres)
    if (data.codigo.length > 12) {
      return { success: false, error: 'El código debe tener máximo 12 caracteres' };
    }
    
    // Validar cantidad positiva
    var cantidad = Number(data.cantidad);
    if (isNaN(cantidad) || cantidad <= 0) {
      return { success: false, error: 'La cantidad debe ser un número positivo' };
    }
    
    // Validar ubicación en LAYOUT
    var ubicacionValida = validarUbicacionEnLayout(data.ubicacion);
    if (!ubicacionValida.existe) {
      return { success: false, error: 'La ubicación ' + data.ubicacion + ' no existe en LAYOUT' };
    }
    
    // Buscar descripción en MATRIZ si no se proporciona
    var descripcion = data.descripcion || '';
    if (!descripcion) {
      var productoMatriz = buscarProductoEnMatriz(data.codigo);
      if (productoMatriz.success) {
        descripcion = productoMatriz.descripcion;
      }
    }
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_INGRESO);
    
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_INGRESO);
      sheet.appendRow([
        'Ubicacion', 'Codigo', 'Serie', 'Partida', 'Pieza', 
        'FechaVencimiento', 'Talla', 'Color', 'CantidadContada', 
        'Descripcion', 'FechaHoraRegistro', 'Usuario', 'ID'
      ]);
    }
    
    // Generar UUID único
    var uuid = Utilities.getUuid();
    var fechaHora = new Date();
    var usuario = data.usuario || Session.getActiveUser().getEmail() || 'Sistema';
    
    // Nueva estructura de 13 columnas (A-M)
    var nuevoRegistro = [
      data.ubicacion.toUpperCase(),           // A - Ubicación
      data.codigo.toUpperCase(),              // B - Código
      data.serie || '',                       // C - Serie
      data.partida || '',                     // D - Partida
      data.pieza || '',                       // E - Pieza
      data.fechaVencimiento || '',            // F - Fecha Vencimiento
      data.talla || '',                       // G - Talla
      data.color || '',                       // H - Color
      cantidad,                               // I - Cantidad Contada
      descripcion,                            // J - Descripción
      fechaHora,                              // K - Fecha y hora del registro (auto)
      usuario,                                // L - Usuario (auto)
      uuid                                    // M - ID UUID (auto)
    ];
    
    sheet.appendRow(nuevoRegistro);
    
    // Actualizar inventario consolidado
    actualizarInventarioConsolidado(data.codigo, cantidad, 'disponible');
    
    // Registrar movimiento de entrada
    registrarMovimiento('ENTRADA', data.codigo, cantidad, data.ubicacion, uuid, usuario);
    
    Logger.log('Producto registrado: ' + uuid + ' - ' + data.codigo + ' x ' + cantidad);
    
    return {
      success: true,
      id: uuid,
      codigo: data.codigo,
      cantidad: cantidad,
      ubicacion: data.ubicacion,
      descripcion: descripcion,
      fechaRegistro: fechaHora
    };
    
  } catch (e) {
    Logger.log('Error en registrarProductoInventario: ' + e.message);
    return { success: false, error: 'Error al registrar producto: ' + e.message };
  }
}

// ==================== ACTUALIZACIÓN DE UBICACIÓN EN TIEMPO REAL ====================

/**
 * Actualiza la ubicación de un producto en tiempo real
 * @param {string} id - UUID del registro
 * @param {string} nuevaUbicacion - Nueva ubicación
 * @param {string} usuario - Usuario que realiza el cambio
 * @returns {Object} - {success, error}
 */
function actualizarUbicacionEnTiempoReal(id, nuevaUbicacion, usuario) {
  try {
    if (!id || !nuevaUbicacion) {
      return { success: false, error: 'ID y nueva ubicación son requeridos' };
    }
    
    // Validar longitud de ubicación
    if (nuevaUbicacion.length > 8) {
      return { success: false, error: 'La ubicación debe tener máximo 8 caracteres' };
    }
    
    // Validar que la ubicación exista en LAYOUT
    var validacion = validarUbicacionEnLayout(nuevaUbicacion);
    if (!validacion.existe) {
      return { success: false, error: 'La ubicación ' + nuevaUbicacion + ' no existe en LAYOUT' };
    }
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_INGRESO);
    
    if (!sheet) {
      return { success: false, error: 'Hoja INGRESO no encontrada' };
    }
    
    var data = sheet.getDataRange().getValues();
    var idBuscado = id.trim();
    var ubicacionAnterior = '';
    var codigo = '';
    var filaEncontrada = -1;
    
    // Buscar por UUID (columna M = índice 12)
    for (var i = 1; i < data.length; i++) {
      var idFila = String(data[i][12] || '').trim();
      if (idFila === idBuscado) {
        ubicacionAnterior = String(data[i][0] || '');
        codigo = String(data[i][1] || '');
        filaEncontrada = i + 1;
        break;
      }
    }
    
    if (filaEncontrada === -1) {
      return { success: false, error: 'Registro con ID ' + id + ' no encontrado' };
    }
    
    // Actualizar ubicación (columna A)
    sheet.getRange(filaEncontrada, 1).setValue(nuevaUbicacion.toUpperCase());
    
    // Registrar movimiento de cambio de ubicación
    registrarMovimiento('CAMBIO_UBICACION', codigo, 0, nuevaUbicacion, 
      'De: ' + ubicacionAnterior + ' A: ' + nuevaUbicacion, usuario || 'Sistema');
    
    Logger.log('Ubicación actualizada: ' + id + ' de ' + ubicacionAnterior + ' a ' + nuevaUbicacion);
    
    return {
      success: true,
      id: id,
      codigo: codigo,
      ubicacionAnterior: ubicacionAnterior,
      nuevaUbicacion: nuevaUbicacion.toUpperCase()
    };
    
  } catch (e) {
    Logger.log('Error en actualizarUbicacionEnTiempoReal: ' + e.message);
    return { success: false, error: 'Error al actualizar ubicación: ' + e.message };
  }
}

// ==================== ESTADÍSTICAS DE INVENTARIO ====================

/**
 * Obtiene estadísticas completas del inventario
 * @returns {Object} - Estadísticas consolidadas
 */
function getEstadisticasInventario() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheetIngreso = ss.getSheetByName(SHEET_INGRESO);
    var sheetInventario = ss.getSheetByName(SHEET_INVENTARIO);
    
    var stats = {
      totalProductosDisponibles: 0,
      totalProductosReservados: 0,
      totalProductosTransitorio: 0,
      totalCodigosUnicos: 0,
      codigosTerminacionP: 0,
      codigosTerminacionS: 0,
      codigosSinTerminacion: 0,
      stockTotal: 0,
      stockBajo: 0,
      agotados: 0
    };
    
    // Obtener datos de INGRESO para códigos únicos
    if (sheetIngreso) {
      var dataIngreso = sheetIngreso.getDataRange().getValues();
      var codigosUnicos = {};
      
      for (var i = 1; i < dataIngreso.length; i++) {
        var codigo = String(dataIngreso[i][1] || '').trim().toUpperCase();
        var cantidad = Number(dataIngreso[i][8]) || 0;
        
        if (codigo) {
          if (!codigosUnicos[codigo]) {
            codigosUnicos[codigo] = 0;
          }
          codigosUnicos[codigo] += cantidad;
        }
      }
      
      // Clasificar códigos por terminación
      var codigos = Object.keys(codigosUnicos);
      stats.totalCodigosUnicos = codigos.length;
      
      codigos.forEach(function(codigo) {
        var ultimoCaracter = codigo.slice(-1).toUpperCase();
        if (ultimoCaracter === 'P') {
          stats.codigosTerminacionP++;
        } else if (ultimoCaracter === 'S') {
          stats.codigosTerminacionS++;
        } else {
          stats.codigosSinTerminacion++;
        }
        stats.stockTotal += codigosUnicos[codigo];
      });
    }
    
    // Obtener datos de INVENTARIO para stock por tipo
    if (sheetInventario) {
      var dataInventario = sheetInventario.getDataRange().getValues();
      
      for (var j = 1; j < dataInventario.length; j++) {
        var disponible = Number(dataInventario[j][3]) || 0;
        var reservado = Number(dataInventario[j][4]) || 0;
        var transitorio = Number(dataInventario[j][5]) || 0;
        
        stats.totalProductosDisponibles += disponible;
        stats.totalProductosReservados += reservado;
        stats.totalProductosTransitorio += transitorio;
        
        // Verificar stock bajo y agotados
        if (disponible <= 0) {
          stats.agotados++;
        } else if (disponible <= 10) {
          stats.stockBajo++;
        }
      }
    }
    
    return {
      success: true,
      estadisticas: stats
    };
    
  } catch (e) {
    Logger.log('Error en getEstadisticasInventario: ' + e.message);
    return { success: false, error: e.message };
  }
}

// ==================== RESUMEN DE MOVIMIENTOS ====================

/**
 * Obtiene resumen de movimientos con datos para gráfico
 * @param {string} fechaDesde - Fecha inicio (YYYY-MM-DD)
 * @param {string} fechaHasta - Fecha fin (YYYY-MM-DD)
 * @returns {Object} - {agregados, descontados, graficoData}
 */
function getResumenMovimientos(fechaDesde, fechaHasta) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_MOVIMIENTOS);
    
    var resultado = {
      agregados: [],
      descontados: [],
      graficoData: [],
      totales: { ingresados: 0, despachados: 0 }
    };
    
    if (!sheet) {
      return { success: true, ...resultado };
    }
    
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      return { success: true, ...resultado };
    }
    
    var data = sheet.getRange(2, 1, lastRow - 1, 8).getValues();
    
    // Parsear fechas de filtro
    var desde = fechaDesde ? new Date(fechaDesde) : new Date(0);
    var hasta = fechaHasta ? new Date(fechaHasta + 'T23:59:59') : new Date();
    
    var movimientosPorDia = {};
    
    for (var i = 0; i < data.length; i++) {
      var row = data[i];
      var fechaMov = new Date(row[1]);
      var tipo = String(row[2] || '').toUpperCase();
      var codigo = String(row[3] || '');
      var cantidad = Number(row[4]) || 0;
      var ubicacion = String(row[5] || '');
      
      // Filtrar por rango de fechas
      if (fechaMov < desde || fechaMov > hasta) continue;
      
      var fechaStr = Utilities.formatDate(fechaMov, Session.getScriptTimeZone(), 'yyyy-MM-dd');
      
      // Inicializar día si no existe
      if (!movimientosPorDia[fechaStr]) {
        movimientosPorDia[fechaStr] = { entrada: 0, salida: 0 };
      }
      
      // Clasificar movimiento
      if (tipo === 'ENTRADA' || tipo === 'INGRESO') {
        resultado.agregados.push({
          fecha: fechaStr,
          codigo: codigo,
          cantidad: cantidad,
          ubicacion: ubicacion
        });
        resultado.totales.ingresados += cantidad;
        movimientosPorDia[fechaStr].entrada += cantidad;
        
      } else if (tipo === 'SALIDA' || tipo === 'DESPACHO') {
        resultado.descontados.push({
          fecha: fechaStr,
          codigo: codigo,
          cantidad: cantidad,
          ubicacion: ubicacion
        });
        resultado.totales.despachados += cantidad;
        movimientosPorDia[fechaStr].salida += cantidad;
      }
    }
    
    // Preparar datos para gráfico
    var fechasOrdenadas = Object.keys(movimientosPorDia).sort();
    resultado.graficoData = fechasOrdenadas.map(function(f) {
      return {
        fecha: f,
        entradas: movimientosPorDia[f].entrada,
        salidas: movimientosPorDia[f].salida,
        neto: movimientosPorDia[f].entrada - movimientosPorDia[f].salida
      };
    });
    
    return {
      success: true,
      agregados: resultado.agregados,
      descontados: resultado.descontados,
      graficoData: resultado.graficoData,
      totales: resultado.totales
    };
    
  } catch (e) {
    Logger.log('Error en getResumenMovimientos: ' + e.message);
    return { success: false, error: e.message };
  }
}

// ==================== OBTENER INVENTARIO COMPLETO ====================

/**
 * Obtiene todos los registros de INVENTARIO consolidado
 * @returns {Object} - {success, productos, resumen}
 */
function getInventarioCompleto() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheetInventario = ss.getSheetByName(SHEET_INVENTARIO);
    var sheetIngreso = ss.getSheetByName(SHEET_INGRESO);
    
    var productos = [];
    var resumen = {
      totalProductos: 0,
      totalDisponible: 0,
      totalReservado: 0,
      stockBajo: 0,
      agotados: 0
    };
    
    // Primero intentar leer de INVENTARIO (consolidado)
    if (sheetInventario && sheetInventario.getLastRow() > 1) {
      var dataInv = sheetInventario.getRange(2, 1, sheetInventario.getLastRow() - 1, 8).getValues();
      
      for (var i = 0; i < dataInv.length; i++) {
        var row = dataInv[i];
        var codigo = String(row[0] || '').trim();
        if (!codigo) continue;
        
        var disponible = Number(row[3]) || 0;
        var reserva = Number(row[4]) || 0;
        var transitoria = Number(row[5]) || 0;
        var consignacion = Number(row[6]) || 0;
        var stockTotal = Number(row[7]) || (disponible + reserva + transitoria + consignacion);
        
        var estado = 'OK';
        if (disponible <= 0) {
          estado = 'AGOTADO';
          resumen.agotados++;
        } else if (disponible <= 10) {
          estado = 'STOCK_BAJO';
          resumen.stockBajo++;
        }
        
        productos.push({
          codigo: codigo,
          descripcion: String(row[1] || ''),
          unidadMedida: String(row[2] || ''),
          disponible: disponible,
          reserva: reserva,
          transitoria: transitoria,
          consignacion: consignacion,
          stockTotal: stockTotal,
          estado: estado,
          rowIndex: i + 2
        });
        
        resumen.totalDisponible += disponible;
        resumen.totalReservado += reserva;
      }
      
      resumen.totalProductos = productos.length;
      
    } else if (sheetIngreso && sheetIngreso.getLastRow() > 1) {
      // Fallback: leer de INGRESO y agrupar por código
      var dataIng = sheetIngreso.getRange(2, 1, sheetIngreso.getLastRow() - 1, 13).getValues();
      var productosMap = {};
      
      for (var j = 0; j < dataIng.length; j++) {
        var rowIng = dataIng[j];
        var codigoIng = String(rowIng[1] || '').trim();
        if (!codigoIng) continue;
        
        var cantidadIng = Number(rowIng[8]) || 0;
        
        if (!productosMap[codigoIng]) {
          productosMap[codigoIng] = {
            codigo: codigoIng,
            descripcion: String(rowIng[9] || ''),
            unidadMedida: '',
            disponible: 0,
            reserva: 0,
            transitoria: 0,
            consignacion: 0,
            stockTotal: 0,
            estado: 'OK'
          };
        }
        
        productosMap[codigoIng].disponible += cantidadIng;
        productosMap[codigoIng].stockTotal += cantidadIng;
      }
      
      productos = Object.values(productosMap);
      
      productos.forEach(function(p) {
        if (p.disponible <= 0) {
          p.estado = 'AGOTADO';
          resumen.agotados++;
        } else if (p.disponible <= 10) {
          p.estado = 'STOCK_BAJO';
          resumen.stockBajo++;
        }
        resumen.totalDisponible += p.disponible;
      });
      
      resumen.totalProductos = productos.length;
    }
    
    // Obtener estadísticas adicionales
    var statsResult = getEstadisticasInventario();
    
    return {
      success: true,
      productos: productos,
      products: productos,
      resumen: resumen,
      estadisticas: statsResult.success ? statsResult.estadisticas : {},
      total: productos.length
    };
    
  } catch (e) {
    Logger.log('Error en getInventarioCompleto: ' + e.message);
    return { success: false, error: e.message };
  }
}

/**
 * Obtiene todos los registros de INGRESO con la nueva estructura
 * @returns {Object} - {success, productos, estadisticas}
 */
function getInventarioIngreso() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_INGRESO);
    
    if (!sheet) {
      return { success: true, productos: [], estadisticas: {} };
    }
    
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      return { success: true, productos: [], estadisticas: {} };
    }
    
    var data = sheet.getRange(2, 1, lastRow - 1, 13).getValues();
    var productos = [];
    
    for (var i = 0; i < data.length; i++) {
      var row = data[i];
      var codigo = String(row[1] || '').trim();
      
      if (!codigo) continue;
      
      productos.push({
        ubicacion: String(row[0] || ''),
        codigo: codigo,
        serie: String(row[2] || ''),
        partida: String(row[3] || ''),
        pieza: String(row[4] || ''),
        fechaVencimiento: row[5],
        talla: String(row[6] || ''),
        color: String(row[7] || ''),
        cantidad: Number(row[8]) || 0,
        descripcion: String(row[9] || ''),
        fechaRegistro: row[10],
        usuario: String(row[11] || ''),
        id: String(row[12] || ''),
        rowIndex: i + 2
      });
    }
    
    var statsResult = getEstadisticasInventario();
    
    return {
      success: true,
      productos: productos,
      estadisticas: statsResult.success ? statsResult.estadisticas : {},
      total: productos.length
    };
    
  } catch (e) {
    Logger.log('Error en getInventarioIngreso: ' + e.message);
    return { success: false, error: e.message };
  }
}

// ==================== FUNCIONES AUXILIARES ====================

/**
 * Valida que una ubicación exista en LAYOUT
 */
function validarUbicacionEnLayout(ubicacion) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_LAYOUT);
    
    if (!sheet) return { existe: false };
    
    var data = sheet.getDataRange().getValues();
    var ubicacionBuscada = ubicacion.trim().toUpperCase();
    
    for (var i = 1; i < data.length; i++) {
      var ub = String(data[i][0] || '').trim().toUpperCase();
      if (ub === ubicacionBuscada) {
        return { existe: true };
      }
    }
    
    return { existe: false };
  } catch (e) {
    return { existe: false };
  }
}

/**
 * Busca un producto en la hoja MATRIZ
 */
function buscarProductoEnMatriz(codigo) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_MATRIZ);
    
    if (!sheet) {
      return { success: false, error: 'Hoja MATRIZ no encontrada' };
    }
    
    var data = sheet.getDataRange().getValues();
    var codigoBuscado = codigo.trim().toUpperCase();
    
    for (var i = 1; i < data.length; i++) {
      var codigoFila = String(data[i][0] || '').trim().toUpperCase();
      if (codigoFila === codigoBuscado) {
        return {
          success: true,
          codigo: codigoFila,
          descripcion: String(data[i][1] || ''),
          unidadMedida: String(data[i][2] || '')
        };
      }
    }
    
    return { success: false, error: 'Producto no encontrado' };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

/**
 * Actualiza el inventario consolidado
 */
function actualizarInventarioConsolidado(codigo, cantidad, tipo) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_INVENTARIO);
    
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_INVENTARIO);
      sheet.appendRow(['Codigo', 'Descripcion', 'U.M', 'Disponible', 'Reserva', 'Transitoria', 'Consignacion', 'StockTotal']);
    }
    
    var data = sheet.getDataRange().getValues();
    var codigoBuscado = codigo.trim().toUpperCase();
    var colMap = { 'disponible': 3, 'reserva': 4, 'transitoria': 5, 'consignacion': 6 };
    var columna = colMap[tipo.toLowerCase()] || 3;
    
    for (var i = 1; i < data.length; i++) {
      var codigoFila = String(data[i][0] || '').trim().toUpperCase();
      if (codigoFila === codigoBuscado) {
        var valorActual = Number(data[i][columna]) || 0;
        var nuevoValor = valorActual + cantidad;
        sheet.getRange(i + 1, columna + 1).setValue(nuevoValor);
        
        // Recalcular stock total
        var disponible = columna === 3 ? nuevoValor : Number(data[i][3]) || 0;
        var reserva = columna === 4 ? nuevoValor : Number(data[i][4]) || 0;
        var transitoria = columna === 5 ? nuevoValor : Number(data[i][5]) || 0;
        var consignacion = columna === 6 ? nuevoValor : Number(data[i][6]) || 0;
        sheet.getRange(i + 1, 8).setValue(disponible + reserva + transitoria + consignacion);
        return;
      }
    }
    
    // Crear nuevo registro
    var productoMatriz = buscarProductoEnMatriz(codigo);
    sheet.appendRow([
      codigo.toUpperCase(),
      productoMatriz.success ? productoMatriz.descripcion : '',
      productoMatriz.success ? productoMatriz.unidadMedida : '',
      tipo === 'disponible' ? cantidad : 0,
      tipo === 'reserva' ? cantidad : 0,
      tipo === 'transitoria' ? cantidad : 0,
      tipo === 'consignacion' ? cantidad : 0,
      cantidad
    ]);
    
  } catch (e) {
    Logger.log('Error en actualizarInventarioConsolidado: ' + e.message);
  }
}

/**
 * Registra un movimiento en la hoja MOVIMIENTOS
 */
function registrarMovimiento(tipo, codigo, cantidad, ubicacion, referencia, usuario) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_MOVIMIENTOS);
    
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_MOVIMIENTOS);
      sheet.appendRow(['ID', 'FechaHora', 'TipoMovimiento', 'Codigo', 'Cantidad', 'Ubicacion', 'Referencia', 'Usuario']);
    }
    
    var id = 'MOV-' + new Date().getTime();
    sheet.appendRow([id, new Date(), tipo, codigo, cantidad, ubicacion, referencia, usuario || 'Sistema']);
    
  } catch (e) {
    Logger.log('Error al registrar movimiento: ' + e.message);
  }
}

// ==================== FUNCIONES DE COMPATIBILIDAD ====================

/**
 * Función de compatibilidad con frontend existente
 */
function getInventory() {
  var resultado = getInventarioCompleto();
  if (!resultado.success) return resultado;
  
  var products = resultado.productos.map(function(p) {
    return {
      id: p.id,
      codigo: p.codigo,
      nombre: p.descripcion,
      descripcion: p.descripcion,
      cantidad: p.cantidad,
      cantidadReservada: 0,
      cantidadDisponible: p.cantidad,
      stockMinimo: 10,
      ubicacion: p.ubicacion,
      stockBajo: p.cantidad <= 10,
      rowIndex: p.rowIndex
    };
  });
  
  return {
    success: true,
    products: products,
    total: products.length
  };
}

/**
 * Buscar productos por término
 */
function buscarProductosInventario(termino) {
  var resultado = getInventarioCompleto();
  if (!resultado.success) return resultado;
  
  if (!termino || termino.trim() === '') {
    return resultado;
  }
  
  var terminoLower = termino.toLowerCase().trim();
  var filtrados = resultado.productos.filter(function(p) {
    return p.codigo.toLowerCase().indexOf(terminoLower) !== -1 ||
           p.descripcion.toLowerCase().indexOf(terminoLower) !== -1 ||
           p.ubicacion.toLowerCase().indexOf(terminoLower) !== -1;
  });
  
  return {
    success: true,
    productos: filtrados,
    products: filtrados,
    total: filtrados.length
  };
}


/**
 * Actualiza la ubicación de un producto por código (compatibilidad con Index.html)
 * @param {string} codigo - Código del producto
 * @param {string} nuevaUbicacion - Nueva ubicación
 * @param {string} usuario - Usuario que realiza el cambio
 * @returns {Object} - {success, error}
 */
function actualizarUbicacionProducto(codigo, nuevaUbicacion, usuario) {
  try {
    if (!codigo || !nuevaUbicacion) {
      return { success: false, error: 'Código y nueva ubicación son requeridos' };
    }
    
    // Validar longitud de ubicación
    if (nuevaUbicacion.length > 8) {
      return { success: false, error: 'La ubicación debe tener máximo 8 caracteres' };
    }
    
    // Validar que la ubicación exista en LAYOUT
    var validacion = validarUbicacionEnLayout(nuevaUbicacion);
    if (!validacion.existe) {
      return { success: false, error: 'La ubicación ' + nuevaUbicacion + ' no existe en LAYOUT' };
    }
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_INGRESO);
    
    if (!sheet) {
      return { success: false, error: 'Hoja INGRESO no encontrada' };
    }
    
    var data = sheet.getDataRange().getValues();
    var codigoBuscado = codigo.trim().toUpperCase();
    var filasActualizadas = 0;
    var ubicacionAnterior = '';
    
    // Actualizar todas las filas con ese código
    for (var i = 1; i < data.length; i++) {
      var codigoFila = String(data[i][1] || '').trim().toUpperCase();
      if (codigoFila === codigoBuscado) {
        if (filasActualizadas === 0) {
          ubicacionAnterior = String(data[i][0] || '');
        }
        sheet.getRange(i + 1, 1).setValue(nuevaUbicacion.toUpperCase());
        filasActualizadas++;
      }
    }
    
    if (filasActualizadas === 0) {
      return { success: false, error: 'Producto con código ' + codigo + ' no encontrado' };
    }
    
    // Registrar movimiento
    registrarMovimiento('CAMBIO_UBICACION', codigo, 0, nuevaUbicacion, 
      'De: ' + ubicacionAnterior + ' A: ' + nuevaUbicacion, usuario || 'Sistema');
    
    Logger.log('Ubicación actualizada para código: ' + codigo + ' - ' + filasActualizadas + ' filas');
    
    return {
      success: true,
      codigo: codigo,
      ubicacionAnterior: ubicacionAnterior,
      nuevaUbicacion: nuevaUbicacion.toUpperCase(),
      filasActualizadas: filasActualizadas
    };
    
  } catch (e) {
    Logger.log('Error en actualizarUbicacionProducto: ' + e.message);
    return { success: false, error: 'Error al actualizar ubicación: ' + e.message };
  }
}

/**
 * Obtiene movimientos de stock para el modal de movimientos
 * @param {string} fechaDesde - Fecha inicio
 * @param {string} fechaHasta - Fecha fin
 * @returns {Object} - {success, agregados, descontados, grafico}
 */
function getMovimientosStock(fechaDesde, fechaHasta) {
  var resultado = getResumenMovimientos(fechaDesde, fechaHasta);
  
  if (!resultado.success) {
    return resultado;
  }
  
  // Adaptar formato para el Index.html
  return {
    success: true,
    agregados: resultado.agregados || [],
    descontados: resultado.descontados || [],
    grafico: resultado.graficoData || [],
    totales: resultado.totales || { ingresados: 0, despachados: 0 }
  };
}
