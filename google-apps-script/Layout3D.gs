/**
 * Layout3D.gs - Funciones backend para el mapa 3D de bodega
 * Lee ubicaciones desde hoja LAYOUT y stock desde hoja UBICACIONES
 */

// Configuración de pasillos según estructura real de la bodega
var PASILLO_CONFIG = {
  'A': { columnas: 50, niveles: 3, posZ: 0 },
  'B': { columnas: 50, niveles: 2, posZ: 10 },
  'C': { columnas: 50, niveles: 2, posZ: 20 },
  'D': { columnas: 44, niveles: 4, posZ: 30, zonaTransito: [21, 22] },
  'E': { columnas: 32, niveles: 3, posZ: 40 },
  'F': { columnas: 32, niveles: 4, posZ: 50 },
  'G': { columnas: 32, niveles: 4, posZ: 60 },
  'H': { columnas: 6, niveles: 4, posZ: 70 },
  'I': { columnas: 12, niveles: 3, posZ: 80, especial: true }
};

// Nombres de las hojas de datos
var SHEET_LAYOUT = 'LAYOUT';
var SHEET_UBICACIONES = 'UBICACIONES';

/**
 * Obtiene datos estructurados para renderizado 3D
 * Lee ubicaciones desde LAYOUT y stock desde UBICACIONES
 * @returns {Object} - {success, pasillos[], estadisticas, config}
 */
function getLayout3DData() {
  try {
    Logger.log('getLayout3DData - Iniciando lectura de LAYOUT y UBICACIONES...');
    
    // Obtener stock agrupado por ubicación desde hoja UBICACIONES
    var stockResumen = getStockDesdeUbicaciones();
    
    // Obtener estados desde hoja LAYOUT
    var estadosUbicaciones = getEstadosDesdeLayout();
    
    // Generar TODAS las ubicaciones según configuración
    var pasillos = {};
    var totalUbicaciones = 0;
    var ubicacionesOcupadas = 0;
    var ubicacionesVacias = 0;
    var ubicacionesNoDisponible = 0;
    var ubicacionesOcupado = 0;
    
    for (var pasilloLetra in PASILLO_CONFIG) {
      var config = PASILLO_CONFIG[pasilloLetra];
      pasillos[pasilloLetra] = { niveles: {} };
      
      for (var nivel = 1; nivel <= config.niveles; nivel++) {
        pasillos[pasilloLetra].niveles[nivel] = [];
        
        for (var columna = 1; columna <= config.columnas; columna++) {
          // Saltar zona de tránsito en pasillo D (columnas 21-22)
          if (pasilloLetra === 'D' && config.zonaTransito && 
              columna >= config.zonaTransito[0] && columna <= config.zonaTransito[1]) {
            continue;
          }
          
          var codigo = pasilloLetra + '-' + String(columna).padStart(2, '0') + '-' + String(nivel).padStart(2, '0');
          var infoStock = stockResumen[codigo] || { cantidad: 0, items: 0 };
          var tieneProductos = infoStock.cantidad > 0;
          var estado = estadosUbicaciones[codigo] || 'DISPONIBLE';
          
          pasillos[pasilloLetra].niveles[nivel].push({
            ubicacion: codigo,
            columna: columna,
            nivel: nivel,
            estado: estado,
            cantidad: infoStock.cantidad,
            items: infoStock.items,
            tieneProductos: tieneProductos
          });
          
          totalUbicaciones++;
          
          // Contar por estado
          if (estado === 'NO DISPONIBLE') {
            ubicacionesNoDisponible++;
          } else if (estado === 'OCUPADO') {
            ubicacionesOcupado++;
          } else if (tieneProductos) {
            ubicacionesOcupadas++;
          } else {
            ubicacionesVacias++;
          }
        }
      }
    }
    
    Logger.log('getLayout3DData - Total: ' + totalUbicaciones + ' ubicaciones generadas');
    Logger.log('getLayout3DData - Ocupadas: ' + ubicacionesOcupadas + ', Vacías: ' + ubicacionesVacias);
    
    return {
      success: true,
      pasillos: pasillos,
      estadisticas: {
        totalUbicaciones: totalUbicaciones,
        ubicacionesOcupadas: ubicacionesOcupadas,
        ubicacionesVacias: ubicacionesVacias,
        ubicacionesNoDisponible: ubicacionesNoDisponible,
        ubicacionesOcupado: ubicacionesOcupado,
        porcentajeOcupacion: totalUbicaciones > 0 ? 
          Math.round((ubicacionesOcupadas / totalUbicaciones) * 100) : 0
      },
      config: PASILLO_CONFIG
    };
    
  } catch (e) {
    Logger.log('Error en getLayout3DData: ' + e.message);
    return { success: false, error: 'Error al cargar datos 3D: ' + e.message };
  }
}

/**
 * Obtiene stock agrupado por ubicación desde hoja UBICACIONES
 * @returns {Object} - Mapa de ubicación -> {cantidad, items, productos[]}
 */
function getStockDesdeUbicaciones() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_UBICACIONES);
    
    if (!sheet) {
      Logger.log('Hoja UBICACIONES no encontrada');
      return {};
    }
    
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      Logger.log('Hoja UBICACIONES vacía');
      return {};
    }
    
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var data = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues();
    
    // Buscar índices de columnas por nombre (case-insensitive)
    var colUbicacion = -1;
    var colCodigo = -1;
    var colCantidad = -1;
    var colDescripcion = -1;
    var colTalla = -1;
    var colColor = -1;
    
    for (var h = 0; h < headers.length; h++) {
      var headerName = String(headers[h] || '').trim().toLowerCase();
      if (headerName === 'ubicacion' || headerName === 'ubicación') colUbicacion = h;
      if (headerName === 'codigo' || headerName === 'código' || headerName === 'sku') colCodigo = h;
      if (headerName === 'cantidad' || headerName === 'stock' || headerName === 'qty') colCantidad = h;
      if (headerName === 'descripcion' || headerName === 'descripción' || headerName === 'nombre') colDescripcion = h;
      if (headerName === 'talla' || headerName === 'size') colTalla = h;
      if (headerName === 'color') colColor = h;
    }
    
    Logger.log('getStockDesdeUbicaciones - Columnas detectadas: Ubicacion=' + colUbicacion + ', Codigo=' + colCodigo + ', Cantidad=' + colCantidad);
    
    // Si no encuentra columnas por nombre, intentar posiciones comunes
    if (colUbicacion === -1) colUbicacion = 0;  // Primera columna
    if (colCantidad === -1) colCantidad = 1;    // Segunda columna
    if (colCodigo === -1) colCodigo = 2;        // Tercera columna
    if (colDescripcion === -1) colDescripcion = 3; // Cuarta columna
    
    var resumen = {};
    
    for (var i = 0; i < data.length; i++) {
      var ubicacion = String(data[i][colUbicacion] || '').trim().toUpperCase();
      var cantidad = Number(data[i][colCantidad]) || 0;
      
      if (ubicacion && ubicacion !== '') {
        if (!resumen[ubicacion]) {
          resumen[ubicacion] = { cantidad: 0, items: 0, productos: [] };
        }
        resumen[ubicacion].cantidad += cantidad;
        resumen[ubicacion].items += 1;
        
        // Guardar info del producto
        resumen[ubicacion].productos.push({
          codigo: colCodigo >= 0 ? String(data[i][colCodigo] || '').trim() : '',
          descripcion: colDescripcion >= 0 ? String(data[i][colDescripcion] || '').trim() : '',
          cantidad: cantidad,
          talla: colTalla >= 0 ? String(data[i][colTalla] || '').trim() : '',
          color: colColor >= 0 ? String(data[i][colColor] || '').trim() : ''
        });
      }
    }
    
    Logger.log('getStockDesdeUbicaciones - Ubicaciones con stock: ' + Object.keys(resumen).length);
    return resumen;
    
  } catch (e) {
    Logger.log('Error en getStockDesdeUbicaciones: ' + e.message);
    return {};
  }
}

/**
 * Obtiene estados de ubicaciones desde hoja LAYOUT
 * @returns {Object} - Mapa de ubicación -> estado
 */
function getEstadosDesdeLayout() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_LAYOUT);
    
    if (!sheet) {
      Logger.log('Hoja LAYOUT no encontrada');
      return {};
    }
    
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      Logger.log('Hoja LAYOUT vacía');
      return {};
    }
    
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var data = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues();
    var estados = {};
    
    // Buscar columna de ubicación y estado por nombre
    var colUbicacion = 0;
    var colEstado = -1;
    
    for (var h = 0; h < headers.length; h++) {
      var header = String(headers[h] || '').trim().toLowerCase();
      if (header === 'ubicacion' || header === 'ubicación') colUbicacion = h;
      if (header === 'estado' || header === 'status') colEstado = h;
    }
    
    // Si no encuentra estado por nombre, buscar en posición 4 (columna E)
    if (colEstado === -1) colEstado = 4;
    
    Logger.log('getEstadosDesdeLayout - Columnas: Ubicacion=' + colUbicacion + ', Estado=' + colEstado);
    
    for (var i = 0; i < data.length; i++) {
      var ubicacion = String(data[i][colUbicacion] || '').trim().toUpperCase();
      var estado = String(data[i][colEstado] || '').trim();
      
      if (ubicacion && estado) {
        estados[ubicacion] = estado;
      }
    }
    
    Logger.log('getEstadosDesdeLayout - Estados cargados: ' + Object.keys(estados).length);
    return estados;
    
  } catch (e) {
    Logger.log('Error en getEstadosDesdeLayout: ' + e.message);
    return {};
  }
}

/**
 * Obtiene productos de una ubicación específica desde hoja UBICACIONES
 * @param {string} ubicacion - Código de ubicación
 * @returns {Object} - {success, productos[], cantidadTotal, estado, totalRegistros}
 */
function getProductosPorUbicacion3D(ubicacion) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_UBICACIONES);
    
    // Obtener estado de la ubicación desde LAYOUT
    var estado = getEstadoUbicacion(ubicacion);
    
    if (!sheet) {
      Logger.log('Hoja UBICACIONES no encontrada');
      return { success: true, productos: [], cantidadTotal: 0, totalRegistros: 0, estado: estado };
    }
    
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      return { success: true, productos: [], cantidadTotal: 0, totalRegistros: 0, estado: estado };
    }
    
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var data = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getDisplayValues();
    var ubicacionBuscada = ubicacion.trim().toUpperCase();
    
    // Buscar índices de columnas por nombre
    var colUbicacion = -1;
    var colCodigo = -1;
    var colCantidad = -1;
    var colDescripcion = -1;
    var colTalla = -1;
    var colColor = -1;
    
    for (var h = 0; h < headers.length; h++) {
      var headerName = String(headers[h] || '').trim().toLowerCase();
      if (headerName === 'ubicacion' || headerName === 'ubicación') colUbicacion = h;
      if (headerName === 'codigo' || headerName === 'código' || headerName === 'sku') colCodigo = h;
      if (headerName === 'cantidad' || headerName === 'stock' || headerName === 'qty') colCantidad = h;
      if (headerName === 'descripcion' || headerName === 'descripción' || headerName === 'nombre') colDescripcion = h;
      if (headerName === 'talla' || headerName === 'size') colTalla = h;
      if (headerName === 'color') colColor = h;
    }
    
    // Posiciones por defecto si no encuentra por nombre
    if (colUbicacion === -1) colUbicacion = 0;
    if (colCantidad === -1) colCantidad = 1;
    if (colCodigo === -1) colCodigo = 2;
    if (colDescripcion === -1) colDescripcion = 3;
    
    Logger.log('getProductosPorUbicacion3D - Buscando: ' + ubicacionBuscada);
    
    var productos = [];
    var totalCantidad = 0;
    
    for (var i = 0; i < data.length; i++) {
      var ubicacionFila = String(data[i][colUbicacion] || '').trim().toUpperCase();
      
      if (ubicacionFila === ubicacionBuscada) {
        var cantidadStr = String(data[i][colCantidad] || '0').replace(/[^\d.-]/g, '');
        var cantidad = parseFloat(cantidadStr) || 0;
        totalCantidad += cantidad;
        
        var descripcion = colDescripcion >= 0 ? String(data[i][colDescripcion] || '').trim() : '-';
        if (!descripcion || descripcion === '#REF!' || descripcion === '#N/A' || descripcion === '#ERROR!') {
          descripcion = '-';
        }
        
        productos.push({
          codigo: colCodigo >= 0 ? String(data[i][colCodigo] || '').trim() : '',
          descripcion: descripcion,
          cantidad: cantidad,
          talla: colTalla >= 0 ? String(data[i][colTalla] || '').trim() : '-',
          color: colColor >= 0 ? String(data[i][colColor] || '').trim() : '-'
        });
      }
    }
    
    Logger.log('getProductosPorUbicacion3D - ' + ubicacionBuscada + ': ' + productos.length + ' productos, Total: ' + totalCantidad);
    
    return {
      success: true,
      ubicacion: ubicacion,
      productos: productos,
      cantidadTotal: totalCantidad,
      totalRegistros: productos.length,
      estado: estado
    };
    
  } catch (e) {
    Logger.log('Error en getProductosPorUbicacion3D: ' + e.message);
    return { success: false, error: 'Error al obtener productos: ' + e.message };
  }
}

/**
 * Obtiene el estado actual de una ubicación desde hoja LAYOUT
 * @param {string} ubicacion - Código de ubicación
 * @returns {string} - Estado de la ubicación
 */
function getEstadoUbicacion(ubicacion) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_LAYOUT);
    
    if (!sheet) return 'DISPONIBLE';
    
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) return 'DISPONIBLE';
    
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var data = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues();
    var ubicacionBuscada = ubicacion.trim().toUpperCase();
    
    // Buscar columnas por nombre
    var colUbicacion = 0;
    var colEstado = -1;
    
    for (var h = 0; h < headers.length; h++) {
      var header = String(headers[h] || '').trim().toLowerCase();
      if (header === 'ubicacion' || header === 'ubicación') colUbicacion = h;
      if (header === 'estado' || header === 'status') colEstado = h;
    }
    
    if (colEstado === -1) colEstado = 4; // Posición por defecto
    
    for (var i = 0; i < data.length; i++) {
      var ub = String(data[i][colUbicacion] || '').trim().toUpperCase();
      if (ub === ubicacionBuscada) {
        var estado = String(data[i][colEstado] || 'DISPONIBLE').trim();
        return estado || 'DISPONIBLE';
      }
    }
    
    return 'DISPONIBLE';
    
  } catch (e) {
    Logger.log('Error en getEstadoUbicacion: ' + e.message);
    return 'DISPONIBLE';
  }
}

/**
 * Actualiza estado de ubicación para vista 3D
 * @param {string} ubicacion
 * @param {string} nuevoEstado
 * @param {string} usuario
 * @returns {Object} - {success, error}
 */
function actualizarEstadoUbicacion3D(ubicacion, nuevoEstado, usuario) {
  try {
    Logger.log('actualizarEstadoUbicacion3D - Ubicación: ' + ubicacion + ', Estado: ' + nuevoEstado);
    
    // Validar parámetros
    if (!ubicacion || !nuevoEstado) {
      return { success: false, error: 'Ubicación y estado son requeridos' };
    }
    
    // Validar estado
    var estadosValidos = ['DISPONIBLE', 'NO DISPONIBLE', 'OCUPADO'];
    if (estadosValidos.indexOf(nuevoEstado) === -1) {
      return { success: false, error: 'Estado no válido. Use: DISPONIBLE, NO DISPONIBLE u OCUPADO' };
    }
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_LAYOUT);
    
    // Crear hoja LAYOUT si no existe
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_LAYOUT);
      sheet.appendRow(['Ubicacion', 'Pasillo', 'Columna', 'Nivel', 'Estado', 'Tipo', 'FechaCreacion']);
      sheet.getRange(1, 1, 1, 7).setFontWeight('bold').setBackground('#4a5568').setFontColor('white');
    }
    
    var ubicacionBuscada = ubicacion.trim().toUpperCase();
    var data = sheet.getDataRange().getValues();
    var filaEncontrada = -1;
    
    // Buscar la ubicación
    for (var i = 1; i < data.length; i++) {
      var ub = String(data[i][0] || '').trim().toUpperCase();
      if (ub === ubicacionBuscada) {
        filaEncontrada = i + 1; // +1 porque getRange es 1-indexed
        break;
      }
    }
    
    if (filaEncontrada === -1) {
      // Si no existe, crear la ubicación
      var match = ubicacionBuscada.match(/^([A-I])-?(\d+)-?(\d+)$/i);
      var pasillo = match ? match[1].toUpperCase() : ubicacionBuscada.charAt(0);
      var columna = match ? match[2] : '01';
      var nivel = match ? match[3] : '01';
      
      sheet.appendRow([ubicacionBuscada, pasillo, columna, nivel, nuevoEstado, 'RACK', new Date()]);
      Logger.log('Nueva ubicación creada: ' + ubicacionBuscada + ' con estado: ' + nuevoEstado);
    } else {
      // Actualizar estado existente (columna 5 = Estado)
      sheet.getRange(filaEncontrada, 5).setValue(nuevoEstado);
      Logger.log('Estado actualizado: ' + ubicacionBuscada + ' -> ' + nuevoEstado);
    }
    
    return {
      success: true,
      ubicacion: ubicacionBuscada,
      nuevoEstado: nuevoEstado,
      mensaje: 'Estado actualizado correctamente'
    };
    
  } catch (e) {
    Logger.log('Error en actualizarEstadoUbicacion3D: ' + e.message);
    return { success: false, error: 'Error al actualizar estado: ' + e.message };
  }
}

/**
 * Busca ubicación por código
 * @param {string} codigo - Código de ubicación a buscar
 * @returns {Object} - {success, ubicacion, pasillo, columna, nivel, existe}
 */
function buscarUbicacion3D(codigo) {
  try {
    if (!codigo || codigo.trim() === '') {
      return { success: false, error: 'Código de ubicación requerido' };
    }
    
    var codigoBuscado = codigo.trim().toUpperCase();
    
    // Parsear código de ubicación (formato: A-01-01)
    var match = codigoBuscado.match(/^([A-I])-?(\d{1,2})-?(\d{1,2})$/i);
    
    if (!match) {
      return { success: false, error: 'Formato de ubicación inválido. Use: A-01-01' };
    }
    
    var pasillo = match[1].toUpperCase();
    var columna = parseInt(match[2]);
    var nivel = parseInt(match[3]);
    
    // Verificar que el pasillo existe en la configuración
    if (!PASILLO_CONFIG[pasillo]) {
      return { success: false, error: 'Pasillo ' + pasillo + ' no existe' };
    }
    
    var config = PASILLO_CONFIG[pasillo];
    
    // Verificar columna válida
    if (columna < 1 || columna > config.columnas) {
      return { success: false, error: 'Columna ' + columna + ' fuera de rango para pasillo ' + pasillo };
    }
    
    // Verificar nivel válido
    if (nivel < 1 || nivel > config.niveles) {
      return { success: false, error: 'Nivel ' + nivel + ' fuera de rango para pasillo ' + pasillo };
    }
    
    // Formatear código estándar
    var codigoFormateado = pasillo + '-' + String(columna).padStart(2, '0') + '-' + String(nivel).padStart(2, '0');
    
    // Obtener información de productos
    var productosInfo = getProductosPorUbicacion(codigoFormateado);
    var estado = getEstadoUbicacion(codigoFormateado);
    
    return {
      success: true,
      existe: true,
      ubicacion: codigoFormateado,
      pasillo: pasillo,
      columna: columna,
      nivel: nivel,
      estado: estado,
      tieneProductos: productosInfo.success && productosInfo.cantidadTotal > 0,
      cantidadTotal: productosInfo.success ? productosInfo.cantidadTotal : 0
    };
    
  } catch (e) {
    Logger.log('Error en buscarUbicacion3D: ' + e.message);
    return { success: false, error: 'Error al buscar ubicación: ' + e.message };
  }
}

/**
 * Obtiene estadísticas por pasillo
 * @param {string} pasillo - Letra del pasillo (A-H)
 * @returns {Object} - {success, estadisticas}
 */
function getEstadisticasPasillo(pasillo) {
  try {
    var layoutResult = getLayoutConProductos();
    
    if (!layoutResult.success) {
      return layoutResult;
    }
    
    var pasilloData = layoutResult.pasillos[pasillo];
    
    if (!pasilloData) {
      return { 
        success: true, 
        estadisticas: { 
          totalUbicaciones: 0, 
          ubicacionesOcupadas: 0, 
          ubicacionesVacias: 0, 
          porcentajeOcupacion: 0 
        } 
      };
    }
    
    var total = 0;
    var ocupadas = 0;
    
    for (var nivel in pasilloData.niveles) {
      var ubicaciones = pasilloData.niveles[nivel];
      total += ubicaciones.length;
      for (var i = 0; i < ubicaciones.length; i++) {
        if (ubicaciones[i].tieneProductos) {
          ocupadas++;
        }
      }
    }
    
    return {
      success: true,
      pasillo: pasillo,
      estadisticas: {
        totalUbicaciones: total,
        ubicacionesOcupadas: ocupadas,
        ubicacionesVacias: total - ocupadas,
        porcentajeOcupacion: total > 0 ? Math.round((ocupadas / total) * 100) : 0
      }
    };
    
  } catch (e) {
    Logger.log('Error en getEstadisticasPasillo: ' + e.message);
    return { success: false, error: 'Error al obtener estadísticas: ' + e.message };
  }
}


/**
 * Obtiene detalle de una ubicación para el modal
 * Alias para compatibilidad con el frontend
 * @param {string} ubicacion - Código de ubicación
 * @returns {Object} - {success, productos[], cantidadTotal, estado, totalRegistros}
 */
function getDetalleUbicacion3D(ubicacion) {
  return getProductosPorUbicacion3D(ubicacion);
}

/**
 * Cambia el estado de una ubicación
 * @param {string} ubicacion - Código de ubicación
 * @param {string} nuevoEstado - Nuevo estado (DISPONIBLE, NO DISPONIBLE, OCUPADO, VACIA)
 * @returns {Object} - {success, error}
 */
function cambiarEstadoUbicacion3D(ubicacion, nuevoEstado) {
  try {
    if (!ubicacion || !nuevoEstado) {
      return { success: false, error: 'Ubicación y estado son requeridos' };
    }
    
    // Validar estado
    var estadosValidos = ['DISPONIBLE', 'NO DISPONIBLE', 'OCUPADO', 'VACIA'];
    if (estadosValidos.indexOf(nuevoEstado) === -1) {
      return { success: false, error: 'Estado no válido. Use: DISPONIBLE, NO DISPONIBLE, OCUPADO o VACIA' };
    }
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_LAYOUT);
    
    // Crear hoja LAYOUT si no existe
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_LAYOUT);
      sheet.appendRow(['Ubicacion', 'Pasillo', 'Columna', 'Nivel', 'Estado', 'FechaModificacion', 'Usuario']);
      sheet.getRange(1, 1, 1, 7).setFontWeight('bold');
    }
    
    var ubicacionBuscada = ubicacion.trim().toUpperCase();
    
    // Parsear ubicación
    var match = ubicacionBuscada.match(/^([A-I])-?(\d{1,2})-?(\d{1,2})$/i);
    if (!match) {
      return { success: false, error: 'Formato de ubicación inválido' };
    }
    
    var pasillo = match[1].toUpperCase();
    var columna = parseInt(match[2]);
    var nivel = parseInt(match[3]);
    var codigoFormateado = pasillo + '-' + String(columna).padStart(2, '0') + '-' + String(nivel).padStart(2, '0');
    
    var data = sheet.getDataRange().getValues();
    var encontrada = false;
    
    // Buscar la ubicación existente
    for (var i = 1; i < data.length; i++) {
      var ub = String(data[i][0] || '').trim().toUpperCase();
      if (ub === codigoFormateado) {
        sheet.getRange(i + 1, 5).setValue(nuevoEstado);
        sheet.getRange(i + 1, 6).setValue(new Date());
        encontrada = true;
        break;
      }
    }
    
    // Si no existe, crear nueva fila
    if (!encontrada) {
      sheet.appendRow([codigoFormateado, pasillo, columna, nivel, nuevoEstado, new Date(), 'Sistema']);
    }
    
    Logger.log('Estado actualizado: ' + codigoFormateado + ' -> ' + nuevoEstado);
    return { success: true, mensaje: 'Estado actualizado correctamente', ubicacion: codigoFormateado, estado: nuevoEstado };
    
  } catch (e) {
    Logger.log('Error en cambiarEstadoUbicacion3D: ' + e.message);
    return { success: false, error: 'Error al cambiar estado: ' + e.message };
  }
}
