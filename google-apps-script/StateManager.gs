  /**
  * StateManager.gs - Gestión Centralizada de Estados para N.V
  * Controla las transiciones de estado válidas y registra auditoría
  * 
  * IMPORTANTE: Los valores de estado deben coincidir con la validación de datos
  * de la hoja de cálculo. Valores permitidos: Aprobada, Pendiente, Pendiente Picking, etc.
  */

  var SHEET_NV_DIARIAS = 'N.V DIARIAS';
  var SHEET_MOVIMIENTOS = 'MOVIMIENTOS';

  // Nombres alternativos de la hoja de N.V (en orden de prioridad)
  // N.V DIARIAS es la hoja principal de Notas de Venta
  var SHEET_NV_NAMES = ['N.V DIARIAS', 'N.V. DIARIAS', 'NV DIARIAS', 'PICKING', 'ORDENES'];

  /**
  * Obtiene la hoja de N.V buscando por diferentes nombres
  * @returns {Sheet|null}
  */
  function getNVSheetState() {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) return null;
    
    for (var i = 0; i < SHEET_NV_NAMES.length; i++) {
      var sheet = ss.getSheetByName(SHEET_NV_NAMES[i]);
      if (sheet) {
        Logger.log('getNVSheetState: Usando hoja "' + SHEET_NV_NAMES[i] + '"');
        return sheet;
      }
    }
    return null;
  }

  /**
  * FUNCIÓN DE DIAGNÓSTICO - Ejecutar desde el editor de Apps Script
  * Muestra las columnas de la hoja INGRESO para verificar el mapeo
  */
  function diagnosticarHojaIngreso() {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('INGRESO');
    
    if (!sheet) {
      Logger.log('ERROR: Hoja INGRESO no encontrada');
      return { error: 'Hoja INGRESO no encontrada' };
    }
    
    var lastRow = sheet.getLastRow();
    var lastCol = sheet.getLastColumn();
    
    Logger.log('=== DIAGNÓSTICO HOJA INGRESO ===');
    Logger.log('Total filas: ' + lastRow);
    Logger.log('Total columnas: ' + lastCol);
    
    // Leer headers (fila 1)
    var headers = sheet.getRange(1, 1, 1, Math.min(lastCol, 12)).getValues()[0];
    Logger.log('HEADERS:');
    for (var i = 0; i < headers.length; i++) {
      var letra = String.fromCharCode(65 + i); // A, B, C, etc.
      Logger.log('  Columna ' + letra + ' (índice ' + i + '): ' + headers[i]);
    }
    
    // Leer primeras 5 filas de datos
    if (lastRow > 1) {
      Logger.log('\nPRIMERAS 5 FILAS DE DATOS:');
      var data = sheet.getRange(2, 1, Math.min(5, lastRow - 1), Math.min(lastCol, 12)).getValues();
      for (var r = 0; r < data.length; r++) {
        Logger.log('Fila ' + (r + 2) + ':');
        Logger.log('  Col A (0): ' + data[r][0]);
        Logger.log('  Col B (1): ' + data[r][1]);
        if (data[r].length > 8) Logger.log('  Col I (8): ' + data[r][8]);
        if (data[r].length > 9) Logger.log('  Col J (9): ' + data[r][9]);
      }
    }
    
    Logger.log('\n=== CONFIGURACIÓN ACTUAL ===');
    Logger.log('El código busca:');
    Logger.log('  - UBICACIÓN en Columna B (índice 1)');
    Logger.log('  - CÓDIGO en Columna J (índice 9)');
    
    return {
      success: true,
      totalFilas: lastRow,
      totalColumnas: lastCol,
      headers: headers,
      mensaje: 'Revisa los logs en Ver > Registros'
    };
  }

  // Mapeo de estados internos a valores de la hoja de cálculo
  // La clave es el estado normalizado (para comparación), el valor es lo que se escribe en la hoja
  // IMPORTANTE: Estos valores deben coincidir EXACTAMENTE con la validación de datos de la hoja
  var ESTADOS_HOJA = {
    'PENDIENTE': 'Pendiente',
    'PENDIENTE_APROBACION': 'Pendiente',
    'APROBADA': 'Aprobada',
    'PENDIENTE_PICKING': 'Pendiente Picking',
    'EN_PICKING': 'En Picking',
    'PK': 'Packing',
    'PACKING': 'Packing',
    'PENDIENTE_PACKING': 'Packing',
    'PENDIENTE_SHIPPING': 'Pendiente Shipping',
    'LISTO_DESPACHO': 'Listo Despacho',
    'DESPACHADO': 'Despachado',
    'ENTREGADO': 'Entregado',
    'NULA': 'Nula',
    'REFACTURACION': 'Refacturacion',
    'REFACTURACIÓN': 'Refacturacion'
  };

  // Función para obtener los valores permitidos en la validación de datos
  // Si necesitas agregar más estados, debes actualizar también la validación de datos en la hoja
  function getEstadosPermitidos() {
    // Compatible con ES5 - no usar Object.values()
    var valores = [];
    for (var key in ESTADOS_HOJA) {
      if (ESTADOS_HOJA.hasOwnProperty(key)) {
        var val = ESTADOS_HOJA[key];
        if (valores.indexOf(val) === -1) {
          valores.push(val);
        }
      }
    }
    return valores;
  }

  // Estados del flujo de trabajo (para uso interno)
  var ESTADOS_NV = {
    PENDIENTE: 'PENDIENTE',
    PENDIENTE_APROBACION: 'PENDIENTE_APROBACION',
    APROBADA: 'APROBADA',
    PENDIENTE_PICKING: 'PENDIENTE_PICKING',
    EN_PICKING: 'EN_PICKING',
    PK: 'PK',
    PENDIENTE_PACKING: 'PENDIENTE_PACKING',
    PENDIENTE_SHIPPING: 'PENDIENTE_SHIPPING',
    LISTO_DESPACHO: 'LISTO_DESPACHO',
    DESPACHADO: 'DESPACHADO',
    ENTREGADO: 'ENTREGADO',
    NULA: 'NULA',
    REFACTURACION: 'REFACTURACION'
  };

  // Transiciones válidas de estado
  // Flujo: PENDIENTE_PICKING → EN_PICKING → PK → PENDIENTE_SHIPPING → DESPACHADO → ENTREGADO
  var VALID_TRANSITIONS = {
    '': ['PENDIENTE', 'PENDIENTE_APROBACION', 'PENDIENTE_PICKING', 'NULA'],
    'PENDIENTE': ['PENDIENTE_APROBACION', 'PENDIENTE_PICKING', 'PK', 'PENDIENTE_PACKING', 'NULA', 'REFACTURACION'],
    'PENDIENTE_APROBACION': ['APROBADA', 'PENDIENTE_PICKING', 'NULA', 'REFACTURACION'],
    'APROBADA': ['PENDIENTE_PICKING', 'NULA', 'REFACTURACION'],
    'PENDIENTE_PICKING': ['EN_PICKING', 'PK', 'PENDIENTE_PACKING', 'NULA', 'REFACTURACION'],
    'EN_PICKING': ['PK', 'PENDIENTE_PACKING', 'LISTO_DESPACHO', 'PENDIENTE_PICKING', 'NULA', 'REFACTURACION'],
    'PK': ['PENDIENTE_SHIPPING', 'LISTO_DESPACHO', 'NULA', 'REFACTURACION'],
    'PACKING': ['PENDIENTE_SHIPPING', 'LISTO_DESPACHO', 'NULA', 'REFACTURACION'],
    'PENDIENTE_PACKING': ['PENDIENTE_SHIPPING', 'LISTO_DESPACHO', 'NULA', 'REFACTURACION'],
    'PENDIENTE_SHIPPING': ['DESPACHADO', 'NULA', 'REFACTURACION'],
    'LISTO_DESPACHO': ['DESPACHADO', 'NULA', 'REFACTURACION'],
    'DESPACHADO': ['ENTREGADO', 'NULA'],
    'ENTREGADO': [],
    'NULA': [],
    'REFACTURACION': ['PENDIENTE_PICKING']
  };

  /**
  * Convierte un estado normalizado al valor que se escribe en la hoja
  * @param {string} estadoNormalizado - Estado en formato interno (ej: PENDIENTE_PICKING)
  * @returns {string} - Valor para escribir en la hoja (ej: Pendiente Picking)
  */
  function estadoParaHoja(estadoNormalizado) {
    var estado = String(estadoNormalizado || '').trim().toUpperCase().replace(/\s+/g, '_');
    return ESTADOS_HOJA[estado] || estadoNormalizado;
  }

  // Mapeo de columnas de N.V DIARIAS
  var COL_NV_DIARIAS = {
    FECHA_ENTREGA: 0,    // A
    N_VENTA: 1,          // B
    ESTADO: 2,           // C
    COD_CLIENTE: 3,      // D
    CLIENTE: 4,          // E
    COD_VENDEDOR: 5,     // F
    VENDEDOR: 6,         // G
    ZONA: 7,             // H
    COD_PRODUCTO: 8,     // I
    DESCRIPCION: 9,      // J
    UNIDAD_MEDIDA: 10,   // K
    PEDIDO: 11           // L
  };

  /**
  * Valida si una transición de estado es permitida
  * @param {string} estadoActual - Estado actual
  * @param {string} nuevoEstado - Estado destino
  * @returns {boolean}
  */
  function esTransicionValida(estadoActual, nuevoEstado) {
    var estadoNormalizado = normalizarEstado(estadoActual);
    var nuevoNormalizado = normalizarEstado(nuevoEstado);
    
    // Si el estado actual no está definido en las transiciones, 
    // permitir cualquier transición (para estados legacy o desconocidos)
    var transicionesPermitidas = VALID_TRANSITIONS[estadoNormalizado];
    if (!transicionesPermitidas) {
      Logger.log('Estado no definido en transiciones: ' + estadoNormalizado + ' - permitiendo transición a ' + nuevoNormalizado);
      return true;
    }
    
    return transicionesPermitidas.indexOf(nuevoNormalizado) !== -1;
  }

  /**
  * Normaliza un estado para comparación interna
  * Convierte "Pendiente Picking" -> "PENDIENTE_PICKING"
  * @param {string} estado
  * @returns {string}
  */
  function normalizarEstado(estado) {
    if (!estado) return '';
    var normalizado = String(estado).trim().toUpperCase().replace(/\s+/g, '_');
    
    // Mapeo de variantes comunes
    var mapeoVariantes = {
      'PACKING': 'PK',
      'EN_PACKING': 'PK',
      'PENDIENTE_PACKING': 'PK',
      'LISTO_PARA_DESPACHO': 'LISTO_DESPACHO',
      'LISTA_DESPACHO': 'LISTO_DESPACHO'
    };
    
    return mapeoVariantes[normalizado] || normalizado;
  }

  /**
  * Cambia el estado de una N.V con validación
  * @param {string} nVenta - Número de nota de venta
  * @param {string} nuevoEstado - Nuevo estado
  * @param {string} usuario - Usuario que realiza el cambio
  * @returns {Object} - {success, error, estadoAnterior, nuevoEstado}
  */
  function cambiarEstadoNV(nVenta, nuevoEstado, usuario) {
    try {
      // Validar parámetros antes de procesar
      if (!nVenta || nVenta === undefined || nVenta === null || String(nVenta).trim() === '') {
        Logger.log('ERROR cambiarEstadoNV: nVenta es undefined, null o vacío');
        return { success: false, error: 'Número de N.V requerido', code: 'E000' };
      }
      
      if (!nuevoEstado || nuevoEstado === undefined || nuevoEstado === null || String(nuevoEstado).trim() === '') {
        Logger.log('ERROR cambiarEstadoNV: nuevoEstado es undefined, null o vacío');
        return { success: false, error: 'Nuevo estado requerido', code: 'E000' };
      }
      
      // CRÍTICO: Cuando cambiamos a PK (Packing), forzar uso de N.V DIARIAS
      // porque la N.V puede haber sido eliminada de PICKING en el proceso de migración
      var nuevoEstadoNormalizado = normalizarEstado(nuevoEstado);
      var sheet;
      
      if (nuevoEstadoNormalizado === 'PK' || nuevoEstadoNormalizado === 'PENDIENTE_PACKING') {
        Logger.log('cambiarEstadoNV: Forzando uso de N.V DIARIAS para cambio a ' + nuevoEstadoNormalizado);
        var ss = SpreadsheetApp.getActiveSpreadsheet();
        sheet = ss.getSheetByName(SHEET_NV_DIARIAS);
        if (!sheet) {
          return { success: false, error: 'Hoja N.V DIARIAS no encontrada', code: 'E003' };
        }
      } else {
        sheet = getNVSheetState();
        if (!sheet) {
          return { success: false, error: 'Hoja de N.V no encontrada (PICKING/N.V DIARIAS)', code: 'E003' };
        }
      }
      
      var data = sheet.getDataRange().getValues();
      var nVentaBuscada = String(nVenta).trim();
      var valorParaHoja = estadoParaHoja(nuevoEstadoNormalizado); // Convertir al formato de la hoja
      var filasActualizadas = 0;
      var estadoAnterior = '';
      
      Logger.log('cambiarEstadoNV: ' + nVenta + ' -> ' + nuevoEstado + ' (normalizado: ' + nuevoEstadoNormalizado + ', para hoja: ' + valorParaHoja + ')');
      
      // Buscar y validar la N.V
      for (var i = 1; i < data.length; i++) {
        var nVentaFila = String(data[i][COL_NV_DIARIAS.N_VENTA] || '').trim();
        
        if (nVentaFila === nVentaBuscada) {
          if (filasActualizadas === 0) {
            estadoAnterior = normalizarEstado(data[i][COL_NV_DIARIAS.ESTADO]);
            
            // Si el estado ya es el mismo, retornar success sin hacer cambios
            if (estadoAnterior === nuevoEstadoNormalizado) {
              Logger.log('Estado ya es ' + nuevoEstadoNormalizado + ', no se requiere cambio');
              return {
                success: true,
                notaVenta: nVenta,
                estadoAnterior: estadoAnterior,
                nuevoEstado: nuevoEstadoNormalizado,
                filasActualizadas: 0,
                mensaje: 'Estado ya es ' + nuevoEstadoNormalizado
              };
            }
            
            // Validar transición
            if (!esTransicionValida(estadoAnterior, nuevoEstadoNormalizado)) {
              return { 
                success: false, 
                error: 'Transición de estado no permitida: ' + estadoAnterior + ' → ' + nuevoEstadoNormalizado,
                code: 'E002'
              };
            }
          }
          
          // Actualizar estado con el valor formateado para la hoja
          sheet.getRange(i + 1, COL_NV_DIARIAS.ESTADO + 1).setValue(valorParaHoja);
          filasActualizadas++;
        }
      }
      
      if (filasActualizadas === 0) {
        return { success: false, error: 'Nota de venta ' + nVenta + ' no encontrada', code: 'E001' };
      }
      
      // IMPORTANTE: Forzar que los cambios se escriban inmediatamente
      SpreadsheetApp.flush();
      
      // IMPORTANTE: Invalidar caché de N.V para que se reflejen los cambios en tiempo real
      if (typeof invalidateNVCache === 'function') {
        invalidateNVCache();
      }
      
      // ============================================================
      // NUEVO: EJECUTAR MIGRACIONES AUTOMÁTICAS
      // ============================================================
      Logger.log('Ejecutando migraciones automáticas...');
      
      if (typeof ejecutarMigracionPorEstado === 'function') {
        var migracionResult = ejecutarMigracionPorEstado(
          nVenta, 
          estadoAnterior, 
          nuevoEstadoNormalizado, 
          usuario
        );
        
        if (migracionResult.success) {
          Logger.log('✅ Migraciones ejecutadas: ' + migracionResult.totalAcciones + ' acciones');
        } else {
          Logger.log('⚠️ Error en migraciones: ' + (migracionResult.error || 'Desconocido'));
          // No detener el flujo - el estado ya cambió
        }
      } else {
        Logger.log('⚠️ Función ejecutarMigracionPorEstado no disponible');
      }
      
      // Registrar en historial
      registrarCambioEstado(nVenta, estadoAnterior, nuevoEstadoNormalizado, usuario);
      
      Logger.log('Estado cambiado para N.V ' + nVenta + ': ' + estadoAnterior + ' → ' + nuevoEstadoNormalizado);
      
      return {
        success: true,
        notaVenta: nVenta,
        estadoAnterior: estadoAnterior,
        nuevoEstado: nuevoEstadoNormalizado,
        filasActualizadas: filasActualizadas
      };
      
    } catch (e) {
      Logger.log('Error en cambiarEstadoNV: ' + e.message);
      return { success: false, error: 'Error al cambiar estado: ' + e.message, code: 'E003' };
    }
  }

  /**
  * Registra un cambio de estado en MOVIMIENTOS
  * @param {string} nVenta
  * @param {string} estadoAnterior
  * @param {string} nuevoEstado
  * @param {string} usuario
  */
  function registrarCambioEstado(nVenta, estadoAnterior, nuevoEstado, usuario) {
    try {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var sheet = ss.getSheetByName(SHEET_MOVIMIENTOS);
      
      if (!sheet) {
        sheet = ss.insertSheet(SHEET_MOVIMIENTOS);
        sheet.appendRow(['ID', 'FechaHora', 'TipoMovimiento', 'Codigo', 'Cantidad', 'Ubicacion', 'Referencia', 'Usuario']);
      }
      
      var id = 'MOV-' + new Date().getTime();
      var referencia = 'De: ' + estadoAnterior + ' A: ' + nuevoEstado;
      
      sheet.appendRow([
        id,
        new Date(),
        'CAMBIO_ESTADO_NV',
        nVenta,
        0,
        '',
        referencia,
        usuario || 'Sistema'
      ]);
      
    } catch (e) {
      Logger.log('Error al registrar cambio de estado: ' + e.message);
    }
  }

  /**
  * Obtiene conteos de N.V por estado para el dashboard
  * @returns {Object} - {success, conteos}
  */
  function getConteosPorEstado() {
    try {
      var sheet = getNVSheetState();
      
      if (!sheet) {
        return { success: false, error: 'Hoja de N.V no encontrada (PICKING/N.V DIARIAS)' };
      }
      
      var data = sheet.getDataRange().getValues();
      var conteos = {};
      var nvPorEstado = {};
      
      // Inicializar conteos
      Object.keys(ESTADOS_NV).forEach(function(key) {
        conteos[ESTADOS_NV[key]] = 0;
        nvPorEstado[ESTADOS_NV[key]] = {};
      });
      
      // Contar N.V únicas por estado
      for (var i = 1; i < data.length; i++) {
        var estado = normalizarEstado(data[i][COL_NV_DIARIAS.ESTADO]);
        var nVenta = String(data[i][COL_NV_DIARIAS.N_VENTA] || '').trim();
        
        if (estado && nVenta && conteos.hasOwnProperty(estado)) {
          if (!nvPorEstado[estado][nVenta]) {
            nvPorEstado[estado][nVenta] = true;
            conteos[estado]++;
          }
        }
      }
      
      // Calcular total (compatible ES5)
      var total = 0;
      for (var k in conteos) {
        if (conteos.hasOwnProperty(k)) {
          total += conteos[k];
        }
      }
      
      return {
        success: true,
        conteos: conteos,
        total: total
      };
      
    } catch (e) {
      Logger.log('Error en getConteosPorEstado: ' + e.message);
      return { success: false, error: e.message };
    }
  }

  /**
  * Obtiene N.V filtradas por estado
  * @param {string} estado - Estado a filtrar
  * @returns {Object} - {success, ordenes}
  */
  function getNVPorEstado(estado) {
    try {
      var sheet = getNVSheetState();
      
      if (!sheet) {
        return { success: false, error: 'Hoja de N.V no encontrada (PICKING/N.V DIARIAS)' };
      }
      
      var data = sheet.getDataRange().getValues();
      var estadoBuscado = normalizarEstado(estado);
      var ordenesMap = {};
      
      for (var i = 1; i < data.length; i++) {
        var estadoFila = normalizarEstado(data[i][COL_NV_DIARIAS.ESTADO]);
        
        if (estadoFila !== estadoBuscado) continue;
        
        var nVenta = String(data[i][COL_NV_DIARIAS.N_VENTA] || '').trim();
        if (!nVenta) continue;
        
        if (!ordenesMap[nVenta]) {
          ordenesMap[nVenta] = {
            notaVenta: nVenta,
            fechaEntrega: data[i][COL_NV_DIARIAS.FECHA_ENTREGA],
            estado: estadoFila,
            codCliente: String(data[i][COL_NV_DIARIAS.COD_CLIENTE] || ''),
            cliente: String(data[i][COL_NV_DIARIAS.CLIENTE] || ''),
            codVendedor: String(data[i][COL_NV_DIARIAS.COD_VENDEDOR] || ''),
            vendedor: String(data[i][COL_NV_DIARIAS.VENDEDOR] || ''),
            zona: String(data[i][COL_NV_DIARIAS.ZONA] || ''),
            productos: [],
            totalItems: 0
          };
        }
        
        ordenesMap[nVenta].productos.push({
          codigo: String(data[i][COL_NV_DIARIAS.COD_PRODUCTO] || ''),
          descripcion: String(data[i][COL_NV_DIARIAS.DESCRIPCION] || ''),
          unidadMedida: String(data[i][COL_NV_DIARIAS.UNIDAD_MEDIDA] || ''),
          pedido: Number(data[i][COL_NV_DIARIAS.PEDIDO]) || 0,
          rowIndex: i + 1
        });
        
        ordenesMap[nVenta].totalItems++;
      }
      
      // Convertir map a array (compatible ES5)
      var ordenes = [];
      for (var k in ordenesMap) {
        if (ordenesMap.hasOwnProperty(k)) {
          ordenes.push(ordenesMap[k]);
        }
      }
      
      // Ordenar por fecha de entrega
      ordenes.sort(function(a, b) {
        try {
          return new Date(a.fechaEntrega) - new Date(b.fechaEntrega);
        } catch (e) {
          return 0;
        }
      });
      
      return {
        success: true,
        ordenes: ordenes,
        total: ordenes.length,
        estado: estadoBuscado
      };
      
    } catch (e) {
      Logger.log('Error en getNVPorEstado: ' + e.message);
      return { success: false, error: e.message };
    }
  }

  /**
  * Obtiene el historial de cambios de estado para una N.V
  * @param {string} nVenta - Número de nota de venta
  * @returns {Object} - {success, historial}
  */
  function getHistorialNV(nVenta) {
    try {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var sheet = ss.getSheetByName(SHEET_MOVIMIENTOS);
      
      if (!sheet) {
        return { success: true, historial: [] };
      }
      
      var data = sheet.getDataRange().getValues();
      var historial = [];
      var nVentaBuscada = String(nVenta).trim();
      
      for (var i = 1; i < data.length; i++) {
        var tipo = String(data[i][2] || '');
        var codigo = String(data[i][3] || '').trim();
        
        if (tipo.indexOf('CAMBIO_ESTADO') !== -1 && codigo === nVentaBuscada) {
          var referencia = String(data[i][6] || '');
          var partes = referencia.split(' A: ');
          var estadoAnterior = partes[0] ? partes[0].replace('De: ', '') : '';
          var estadoNuevo = partes[1] || '';
          
          historial.push({
            id: data[i][0],
            fechaHora: data[i][1],
            tipo: tipo,
            estadoAnterior: estadoAnterior,
            estadoNuevo: estadoNuevo,
            referencia: referencia,
            usuario: data[i][7]
          });
        }
      }
      
      // Ordenar por fecha ascendente (cronológico)
      historial.sort(function(a, b) {
        return new Date(a.fechaHora) - new Date(b.fechaHora);
      });
      
      return {
        success: true,
        notaVenta: nVenta,
        historial: historial
      };
      
    } catch (e) {
      Logger.log('Error en getHistorialNV: ' + e.message);
      return { success: false, error: e.message };
    }
  }

  /**
  * Obtiene el estado actual de una N.V
  * @param {string} nVenta
  * @returns {Object} - {success, estado}
  */
  function getEstadoNV(nVenta) {
    try {
      var sheet = getNVSheetState();
      
      if (!sheet) {
        return { success: false, error: 'Hoja de N.V no encontrada (PICKING/N.V DIARIAS)' };
      }
      
      var data = sheet.getDataRange().getValues();
      var nVentaBuscada = String(nVenta).trim();
      
      for (var i = 1; i < data.length; i++) {
        var nVentaFila = String(data[i][COL_NV_DIARIAS.N_VENTA] || '').trim();
        if (nVentaFila === nVentaBuscada) {
          return {
            success: true,
            notaVenta: nVenta,
            estado: normalizarEstado(data[i][COL_NV_DIARIAS.ESTADO])
          };
        }
      }
      
      return { success: false, error: 'N.V no encontrada', code: 'E001' };
      
    } catch (e) {
      return { success: false, error: e.message };
    }
  }


  /**
  * Cambia el estado de una N.V directamente (sin validación de transición)
  * Usado para cambios manuales desde el módulo de Notas de Venta
  * OPTIMIZADO: Usa batch update y invalida caché
  * @param {string} nVenta - Número de nota de venta
  * @param {string} nuevoEstado - Nuevo estado
  * @param {string} usuario - Usuario que realiza el cambio
  * @returns {Object} - {success, error}
  */
  function cambiarEstadoNVDirecto(nVenta, nuevoEstado, usuario) {
    Logger.log('=== INICIO cambiarEstadoNVDirecto ===');
    Logger.log('Parámetros recibidos:');
    Logger.log('  nVenta: "' + nVenta + '" (tipo: ' + typeof nVenta + ')');
    Logger.log('  nuevoEstado: "' + nuevoEstado + '" (tipo: ' + typeof nuevoEstado + ')');
    Logger.log('  usuario: "' + usuario + '"');
    
    // Validar parámetros
    if (!nVenta || String(nVenta).trim() === '') {
      Logger.log('ERROR: nVenta vacío o inválido');
      return { success: false, error: 'Número de N.V requerido', code: 'E000' };
    }
    
    if (!nuevoEstado || String(nuevoEstado).trim() === '') {
      Logger.log('ERROR: nuevoEstado vacío o inválido');
      return { success: false, error: 'Nuevo estado requerido', code: 'E000' };
    }
    
    try {
      var sheet = getNVSheetState();
      
      if (!sheet) {
        Logger.log('ERROR: Hoja no encontrada');
        // Listar hojas disponibles para diagnóstico
        var ss = SpreadsheetApp.getActiveSpreadsheet();
        if (ss) {
          var hojas = ss.getSheets().map(function(s) { return s.getName(); });
          Logger.log('Hojas disponibles: ' + hojas.join(', '));
        }
        return { success: false, error: 'Hoja de N.V no encontrada. Verifique que existe una hoja llamada "N.V DIARIAS"', code: 'E003' };
      }
      
      var nombreHoja = sheet.getName();
      Logger.log('Hoja encontrada: "' + nombreHoja + '"');
      
      var lastRow = sheet.getLastRow();
      Logger.log('Última fila: ' + lastRow);
      
      if (lastRow <= 1) {
        Logger.log('ERROR: Hoja vacía (solo tiene encabezados)');
        return { success: false, error: 'La hoja está vacía', code: 'E001' };
      }
      
      // Leer solo columnas B y C (N.Venta y Estado) - más eficiente
      Logger.log('Leyendo datos de columnas B y C...');
      var data = sheet.getRange(2, 2, lastRow - 1, 2).getValues(); // B y C
      Logger.log('Filas leídas: ' + data.length);
      
      var nVentaBuscada = String(nVenta).trim();
      var nuevoEstadoNormalizado = normalizarEstado(nuevoEstado);
      var valorParaHoja = estadoParaHoja(nuevoEstadoNormalizado);
      var filasAActualizar = [];
      var estadoAnterior = '';
      
      Logger.log('Buscando N.V: "' + nVentaBuscada + '"');
      Logger.log('Estado normalizado: "' + nuevoEstadoNormalizado + '"');
      Logger.log('Valor para escribir en hoja: "' + valorParaHoja + '"');
      
      // Buscar filas a actualizar
      for (var i = 0; i < data.length; i++) {
        var nVentaFila = String(data[i][0] || '').trim(); // Columna B
        
        if (nVentaFila === nVentaBuscada) {
          if (filasAActualizar.length === 0) {
            estadoAnterior = String(data[i][1] || ''); // Columna C - estado actual
            Logger.log('Primera coincidencia en fila ' + (i + 2) + ', estado anterior: "' + estadoAnterior + '"');
          }
          filasAActualizar.push(i + 2); // +2 porque empezamos en fila 2
        }
      }
      
      Logger.log('Total filas encontradas: ' + filasAActualizar.length);
      
      if (filasAActualizar.length === 0) {
        Logger.log('ERROR: N.V "' + nVentaBuscada + '" no encontrada en la hoja');
        // Mostrar algunas N.V existentes para diagnóstico
        var ejemplos = [];
        for (var k = 0; k < Math.min(5, data.length); k++) {
          ejemplos.push(String(data[k][0] || '').trim());
        }
        Logger.log('Ejemplos de N.V en la hoja: ' + ejemplos.join(', '));
        return { success: false, error: 'Nota de venta "' + nVenta + '" no encontrada en la hoja', code: 'E001' };
      }
      
      // Actualizar todas las filas
      Logger.log('Actualizando ' + filasAActualizar.length + ' filas con valor: "' + valorParaHoja + '"');
      for (var j = 0; j < filasAActualizar.length; j++) {
        var fila = filasAActualizar[j];
        Logger.log('  Actualizando fila ' + fila);
        sheet.getRange(fila, 3).setValue(valorParaHoja); // Columna C
      }
      
      // IMPORTANTE: Forzar que los cambios se escriban inmediatamente
      SpreadsheetApp.flush();
      Logger.log('SpreadsheetApp.flush() ejecutado - cambios guardados');
      
      // Verificar que el cambio se aplicó
      var verificacion = sheet.getRange(filasAActualizar[0], 3).getValue();
      Logger.log('Verificación: valor en fila ' + filasAActualizar[0] + ' = "' + verificacion + '"');
      
      // Registrar en historial (no crítico)
      try {
        registrarCambioEstado(nVenta, estadoAnterior, valorParaHoja, usuario || 'Sistema');
        Logger.log('Cambio registrado en historial MOVIMIENTOS');
      } catch (regError) {
        Logger.log('Advertencia: No se pudo registrar en historial: ' + regError.message);
      }
      
      // Copiar a PICKING si corresponde (no crítico)
      if (nuevoEstadoNormalizado === 'PENDIENTE_PICKING') {
        try {
          var copiado = copiarNVaPicking(nVenta);
          Logger.log('Copia a PICKING: ' + JSON.stringify(copiado));
        } catch (copyError) {
          Logger.log('Advertencia: No se pudo copiar a PICKING: ' + copyError.message);
        }
      }
      
      // Invalidar caché
      if (typeof invalidateNVCache === 'function') {
        invalidateNVCache();
        Logger.log('Caché de N.V invalidado');
      }
      
      Logger.log('=== FIN cambiarEstadoNVDirecto - ÉXITO ===');
      
      return {
        success: true,
        notaVenta: nVenta,
        estadoAnterior: estadoAnterior,
        nuevoEstado: valorParaHoja,
        filasActualizadas: filasAActualizar.length,
        hojaUsada: nombreHoja
      };
      
    } catch (e) {
      Logger.log('=== ERROR CRÍTICO en cambiarEstadoNVDirecto ===');
      Logger.log('Mensaje: ' + e.message);
      Logger.log('Stack: ' + (e.stack || 'No disponible'));
      return { success: false, error: 'Error al cambiar estado: ' + e.message, code: 'E003' };
    }
  }


  /**
  * FUNCIÓN DE PRUEBA RÁPIDA - Ejecutar desde el editor de Apps Script
  * Cambia el estado de una N.V específica a "Pendiente Picking"
  * USO: Ejecutar testCambioEstadoRapido() y revisar los logs
  */
  function testCambioEstadoRapido() {
    Logger.log('=== TEST RÁPIDO DE CAMBIO DE ESTADO ===');
    
    // 1. Obtener la primera N.V disponible
    var sheet = getNVSheetState();
    if (!sheet) {
      Logger.log('ERROR: No se encontró la hoja de N.V');
      return { success: false, error: 'Hoja no encontrada' };
    }
    
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      Logger.log('ERROR: La hoja está vacía');
      return { success: false, error: 'Hoja vacía' };
    }
    
    // Obtener la primera N.V
    var primeraFila = sheet.getRange(2, 2, 1, 2).getValues()[0];
    var nVentaPrueba = String(primeraFila[0]).trim();
    var estadoActual = String(primeraFila[1]).trim();
    
    Logger.log('N.V de prueba: "' + nVentaPrueba + '"');
    Logger.log('Estado actual: "' + estadoActual + '"');
    
    if (!nVentaPrueba) {
      Logger.log('ERROR: No hay N.V válida en la primera fila');
      return { success: false, error: 'No hay N.V válida' };
    }
    
    // 2. Intentar cambiar el estado
    Logger.log('Intentando cambiar estado a "PENDIENTE_PICKING"...');
    var resultado = cambiarEstadoNVDirecto(nVentaPrueba, 'PENDIENTE_PICKING', 'TEST');
    
    Logger.log('Resultado: ' + JSON.stringify(resultado, null, 2));
    
    // 3. Verificar el cambio
    SpreadsheetApp.flush();
    var nuevoValor = sheet.getRange(2, 3).getValue();
    Logger.log('Valor en la hoja después del cambio: "' + nuevoValor + '"');
    
    Logger.log('=== FIN TEST ===');
    return resultado;
  }


  /**
  * Función de prueba para verificar que StateManager funciona
  * Ejecutar desde el editor de Apps Script
  */
  function testStateManager() {
    Logger.log('=== Test StateManager ===');
    
    // Test 1: Verificar que las constantes existen
    Logger.log('Estados disponibles: ' + JSON.stringify(ESTADOS_NV));
    Logger.log('Transiciones válidas: ' + JSON.stringify(VALID_TRANSITIONS));
    
    // Test 2: Probar normalización
    Logger.log('Normalizar "pendiente picking": ' + normalizarEstado('pendiente picking'));
    Logger.log('Normalizar "NULA": ' + normalizarEstado('NULA'));
    
    // Test 3: Probar conteos
    var conteos = getConteosPorEstado();
    Logger.log('Conteos por estado: ' + JSON.stringify(conteos));
    
    return 'StateManager OK';
  }


  /**
  * Función de diagnóstico para verificar el cambio de estado
  * Ejecutar desde el editor de Apps Script con una N.V de prueba
  * @param {string} nVenta - Número de N.V a probar
  */
  function diagnosticarCambioEstado(nVenta) {
    Logger.log('=== DIAGNÓSTICO DE CAMBIO DE ESTADO ===');
    Logger.log('N.V a probar: ' + nVenta);
    
    // 1. Verificar que la hoja existe
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NV_DIARIAS);
    
    if (!sheet) {
      Logger.log('ERROR: Hoja "' + SHEET_NV_DIARIAS + '" no encontrada');
      Logger.log('Hojas disponibles: ' + ss.getSheets().map(function(s) { return s.getName(); }).join(', '));
      return { success: false, error: 'Hoja no encontrada' };
    }
    Logger.log('OK: Hoja encontrada: ' + sheet.getName());
    
    // 2. Buscar la N.V
    var data = sheet.getRange(2, 2, sheet.getLastRow() - 1, 2).getValues();
    var encontrada = false;
    var estadoActual = '';
    var filas = [];
    
    for (var i = 0; i < data.length; i++) {
      if (String(data[i][0]).trim() === String(nVenta).trim()) {
        encontrada = true;
        estadoActual = data[i][1];
        filas.push(i + 2);
      }
    }
    
    if (!encontrada) {
      Logger.log('ERROR: N.V "' + nVenta + '" no encontrada en la hoja');
      return { success: false, error: 'N.V no encontrada' };
    }
    
    Logger.log('OK: N.V encontrada en ' + filas.length + ' filas');
    Logger.log('Estado actual: "' + estadoActual + '"');
    Logger.log('Estado normalizado: "' + normalizarEstado(estadoActual) + '"');
    
    // 3. Probar cambio de estado
    Logger.log('Probando cambio a PENDIENTE_PICKING...');
    var resultado = cambiarEstadoNVDirecto(nVenta, 'PENDIENTE_PICKING', 'DIAGNOSTICO');
    
    Logger.log('Resultado: ' + JSON.stringify(resultado));
    
    // 4. Verificar que el cambio se aplicó
    SpreadsheetApp.flush();
    var dataVerif = sheet.getRange(filas[0], 3).getValue();
    Logger.log('Estado después del cambio (verificación directa): "' + dataVerif + '"');
    
    // 5. Verificar caché
    Logger.log('Invalidando caché...');
    if (typeof invalidateNVCache === 'function') {
      invalidateNVCache();
      Logger.log('Caché invalidado');
    } else {
      Logger.log('ADVERTENCIA: Función invalidateNVCache no encontrada');
    }
    
    Logger.log('=== FIN DIAGNÓSTICO ===');
    return resultado;
  }

  /**
  * Obtiene el resumen de estados de N.V para el dashboard de Picking
  * @returns {Object} - {success, resumen}
  */
  function getResumenEstadosNV() {
    try {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var sheet = ss.getSheetByName(SHEET_NV_DIARIAS);
      
      if (!sheet) {
        return { success: false, error: 'Hoja N.V DIARIAS no encontrada' };
      }
      
      var lastRow = sheet.getLastRow();
      if (lastRow <= 1) {
        return { 
          success: true, 
          resumen: {
            pendientePicking: 0,
            enPicking: 0,
            enPacking: 0,
            listoDespacho: 0
          }
        };
      }
      
      var data = sheet.getRange(2, 2, lastRow - 1, 2).getValues(); // B y C
      var nvContadas = {};
      var resumen = {
        pendientePicking: 0,
        enPicking: 0,
        enPacking: 0,
        listoDespacho: 0
      };
      
      for (var i = 0; i < data.length; i++) {
        var nVenta = String(data[i][0] || '').trim();
        if (!nVenta || nvContadas[nVenta]) continue;
        
        nvContadas[nVenta] = true;
        var estado = normalizarEstado(data[i][1]);
        
        if (estado === 'PENDIENTE_PICKING') {
          resumen.pendientePicking++;
        } else if (estado === 'EN_PICKING') {
          resumen.enPicking++;
        } else if (estado === 'PK' || estado === 'PENDIENTE_PACKING') {
          resumen.enPacking++;
        } else if (estado === 'LISTO_DESPACHO') {
          resumen.listoDespacho++;
        }
      }
      
      return {
        success: true,
        resumen: resumen
      };
      
    } catch (e) {
      Logger.log('Error en getResumenEstadosNV: ' + e.message);
      return { success: false, error: e.message };
    }
  }


  // ============================================================
  // GESTIÓN DE HOJAS DE TRABAJO (PICKING, PACKING)
  // ============================================================

  var SHEET_PICKING = 'PICKING';
  var SHEET_PACKING = 'PACKING';

  /**
  * Copia los datos de una N.V a la hoja PICKING
  * Se ejecuta automáticamente cuando el estado cambia a "Pendiente Picking"
  * @param {string} nVenta - Número de nota de venta
  * @returns {Object} - {success, filasCopidas}
  */
  function copiarNVaPicking(nVenta) {
    try {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var sheetOrigen = ss.getSheetByName(SHEET_NV_DIARIAS);
      var sheetPicking = ss.getSheetByName(SHEET_PICKING);
      
      if (!sheetOrigen) {
        return { success: false, error: 'Hoja N.V DIARIAS no encontrada' };
      }
      
      // Crear hoja PICKING si no existe
      if (!sheetPicking) {
        sheetPicking = ss.insertSheet(SHEET_PICKING);
        // Agregar encabezados
        sheetPicking.appendRow([
          'Fecha Entrega', 'N.Venta', 'Estado', 'Cod.Cliente', 'Cliente', 
          'Cod.Vendedor', 'Vendedor', 'Zona', 'Cod.Producto', 'Descripcion', 
          'U.M', 'Pedido', 'Fecha Ingreso', 'Usuario'
        ]);
        // Formato de encabezados
        sheetPicking.getRange(1, 1, 1, 14).setBackground('#4a5568').setFontColor('white').setFontWeight('bold');
        sheetPicking.setFrozenRows(1);
      }
      
      // Verificar si ya existe en PICKING (evitar duplicados)
      var pickingData = sheetPicking.getDataRange().getValues();
      for (var p = 1; p < pickingData.length; p++) {
        if (String(pickingData[p][1]).trim() === String(nVenta).trim()) {
          Logger.log('N.V ' + nVenta + ' ya existe en PICKING');
          return { success: true, mensaje: 'Ya existe en PICKING', filasCopidas: 0 };
        }
      }
      
      // Leer datos de N.V DIARIAS
      var dataOrigen = sheetOrigen.getDataRange().getValues();
      var nVentaBuscada = String(nVenta).trim();
      var filasACopiar = [];
      var fechaIngreso = new Date();
      
      for (var i = 1; i < dataOrigen.length; i++) {
        var nVentaFila = String(dataOrigen[i][1] || '').trim();
        
        if (nVentaFila === nVentaBuscada) {
          filasACopiar.push([
            dataOrigen[i][0],  // Fecha Entrega (A)
            dataOrigen[i][1],  // N.Venta (B)
            'Pendiente Picking', // Estado fijo
            dataOrigen[i][3],  // Cod.Cliente (D)
            dataOrigen[i][4],  // Cliente (E)
            dataOrigen[i][5],  // Cod.Vendedor (F)
            dataOrigen[i][6],  // Vendedor (G)
            dataOrigen[i][7],  // Zona (H)
            dataOrigen[i][8],  // Cod.Producto (I)
            dataOrigen[i][9],  // Descripcion (J)
            dataOrigen[i][10], // U.M (K)
            dataOrigen[i][11], // Pedido (L)
            fechaIngreso,      // Fecha Ingreso
            'Sistema'          // Usuario
          ]);
        }
      }
      
      if (filasACopiar.length === 0) {
        return { success: false, error: 'N.V no encontrada en N.V DIARIAS' };
      }
      
      // Copiar filas a PICKING
      var lastRow = sheetPicking.getLastRow();
      sheetPicking.getRange(lastRow + 1, 1, filasACopiar.length, 14).setValues(filasACopiar);
      
      SpreadsheetApp.flush();
      Logger.log('Copiadas ' + filasACopiar.length + ' filas de N.V ' + nVenta + ' a PICKING');
      
      return {
        success: true,
        notaVenta: nVenta,
        filasCopidas: filasACopiar.length
      };
      
    } catch (e) {
      Logger.log('Error en copiarNVaPicking: ' + e.message);
      return { success: false, error: e.message };
    }
  }

  /**
  * Copia los datos de una N.V desde N.V DIARIAS a la hoja PACKING
  * Se ejecuta automáticamente cuando se completa el picking (estado PK)
  * Columnas: Fecha Entrega, N.Venta, Estado, Cod.Cliente, Nombre Cliente, 
  *           Cod.Vendedor, Nombre Vendedor, Zona, Cod.Producto, Descripcion Producto, 
  *           Unidad Medida, Pedido
  * @param {string} nVenta - Número de nota de venta
  * @param {string} usuario - Usuario que completa
  * @returns {Object} - {success}
  */
  function moverPickingAPacking(nVenta, usuario) {
    try {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var sheetNV = ss.getSheetByName(SHEET_NV_DIARIAS);
      var sheetPacking = ss.getSheetByName('PACKING');
      
      if (!sheetNV) {
        return { success: false, error: 'Hoja N.V DIARIAS no encontrada' };
      }
      
      // Crear hoja PACKING si no existe con los headers correctos
      if (!sheetPacking) {
        sheetPacking = ss.insertSheet('PACKING');
        sheetPacking.appendRow([
          'Fecha Entrega', 'N.Venta', 'Estado', 'Cod.Cliente', 'Nombre Cliente', 
          'Cod.Vendedor', 'Nombre Vendedor', 'Zona', 'Cod.Producto', 'Descripcion Producto', 
          'Unidad Medida', 'Pedido', 'Fecha Ingreso Packing', 'Usuario'
        ]);
        sheetPacking.getRange(1, 1, 1, 14).setBackground('#805ad5').setFontColor('white').setFontWeight('bold');
        sheetPacking.setFrozenRows(1);
        sheetPacking.setColumnWidth(1, 100);
        sheetPacking.setColumnWidth(2, 80);
        sheetPacking.setColumnWidth(5, 150);
        sheetPacking.setColumnWidth(10, 200);
      }
      
      // Leer datos de N.V DIARIAS
      var nvData = sheetNV.getDataRange().getValues();
      var nVentaBuscada = String(nVenta).trim();
      var filasACopiar = [];
      var fechaIngresoPacking = new Date();
      
      Logger.log('Copiando N.V ' + nVentaBuscada + ' a hoja PACKING');
      
      // Buscar todas las filas de la N.V en N.V DIARIAS
      for (var i = 1; i < nvData.length; i++) {
        var nVentaFila = String(nvData[i][1] || '').trim();
        
        if (nVentaFila === nVentaBuscada) {
          var fila = [
            nvData[i][0],   // Fecha Entrega (A)
            nvData[i][1],   // N.Venta (B)
            'Packing',      // Estado
            nvData[i][3],   // Cod.Cliente (D)
            nvData[i][4],   // Nombre Cliente (E)
            nvData[i][5],   // Cod.Vendedor (F)
            nvData[i][6],   // Nombre Vendedor (G)
            nvData[i][7],   // Zona (H)
            nvData[i][8],   // Cod.Producto (I)
            nvData[i][9],   // Descripcion Producto (J)
            nvData[i][10],  // Unidad Medida (K)
            nvData[i][11],  // Pedido (L)
            fechaIngresoPacking,
            usuario || 'Sistema'
          ];
          filasACopiar.push(fila);
        }
      }
      
      if (filasACopiar.length === 0) {
        Logger.log('N.V ' + nVentaBuscada + ' no encontrada en N.V DIARIAS');
        return { success: true, mensaje: 'N.V no encontrada, pero estado actualizado' };
      }
      
      // ============================================================
      // CRÍTICO: ELIMINAR DE PICKING **ANTES** DE VERIFICAR DUPLICADOS
      // Esto asegura que la N.V se elimine SIEMPRE, incluso si ya existe en PACKING
      // ============================================================
      var sheetPicking = ss.getSheetByName(SHEET_PICKING);
      var filasEliminadas = 0;
      
      if (sheetPicking && sheetPicking.getLastRow() > 1) {
        Logger.log('Eliminando N.V ' + nVentaBuscada + ' de hoja PICKING...');
        var pickingData = sheetPicking.getDataRange().getValues();
        var filasAEliminar = [];
        
        // Buscar filas a eliminar (de atrás hacia adelante para no afectar índices)
        for (var r = pickingData.length - 1; r >= 1; r--) {
          if (String(pickingData[r][1] || '').trim() === nVentaBuscada) {
            filasAEliminar.push(r + 1); // +1 porque las filas en Sheets son 1-indexed
          }
        }
        
        // Eliminar filas (ya están en orden descendente)
        for (var d = 0; d < filasAEliminar.length; d++) {
          sheetPicking.deleteRow(filasAEliminar[d]);
          filasEliminadas++;
        }
        
        if (filasEliminadas > 0) {
          SpreadsheetApp.flush();
          Logger.log('✅ Eliminadas ' + filasEliminadas + ' filas de N.V ' + nVenta + ' de PICKING');
        }
      }
      
      // Verificar si ya existe en PACKING para evitar duplicados
      var packingData = sheetPacking.getDataRange().getValues();
      var yaExisteEnPacking = false;
      
      for (var p = 1; p < packingData.length; p++) {
        if (String(packingData[p][1] || '').trim() === nVentaBuscada) {
          yaExisteEnPacking = true;
          break;
        }
      }
      
      if (yaExisteEnPacking) {
        Logger.log('N.V ' + nVentaBuscada + ' ya existe en PACKING (no se duplicará)');
        return { 
          success: true, 
          notaVenta: nVenta, 
          mensaje: 'Ya existe en PACKING',
          filasCopiadas: 0,
          filasEliminadasDePicking: filasEliminadas
        };
      }
      
      // Agregar a PACKING (solo si NO existe)
      var lastRowPacking = sheetPacking.getLastRow();
      sheetPacking.getRange(lastRowPacking + 1, 1, filasACopiar.length, 14).setValues(filasACopiar);
      
      SpreadsheetApp.flush();
      Logger.log('Copiadas ' + filasACopiar.length + ' filas de N.V ' + nVenta + ' a PACKING');
      
      return {
        success: true,
        notaVenta: nVenta,
        filasCopiadas: filasACopiar.length,
        filasEliminadasDePicking: filasEliminadas
      };
      
    } catch (e) {
      Logger.log('Error en moverPickingAPacking: ' + e.message);
      return { success: false, error: e.message };
    }
  }

  /**
  * Elimina una N.V de PACKING (cuando se completa)
  * @param {string} nVenta - Número de nota de venta
  * @returns {Object} - {success}
  */
  function eliminarDePacking(nVenta) {
    try {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var sheetPacking = ss.getSheetByName(SHEET_PACKING);
      
      if (!sheetPacking) {
        return { success: true, mensaje: 'Hoja PACKING no existe' };
      }
      
      var data = sheetPacking.getDataRange().getValues();
      var nVentaBuscada = String(nVenta).trim();
      var filasAEliminar = [];
      
      for (var i = data.length - 1; i >= 1; i--) {
        if (String(data[i][1]).trim() === nVentaBuscada) {
          filasAEliminar.push(i + 1);
        }
      }
      
      // Eliminar de abajo hacia arriba
      for (var j = 0; j < filasAEliminar.length; j++) {
        sheetPacking.deleteRow(filasAEliminar[j]);
      }
      
      SpreadsheetApp.flush();
      return { success: true, filasEliminadas: filasAEliminar.length };
      
    } catch (e) {
      Logger.log('Error en eliminarDePacking: ' + e.message);
      return { success: false, error: e.message };
    }
  }

  /**
  * Obtiene las N.V de la hoja PICKING para mostrar en el módulo
  * Busca en N.V DIARIAS las N.V con estado "Pendiente Picking"
  * @returns {Object} - {success, guias}
  */
  function getGuiasDesdeHojaPicking() {
    Logger.log('=== getGuiasDesdeHojaPicking INICIO ===');
    var guiasMap = {};
    
    try {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      if (!ss) {
        Logger.log('ERROR: No se pudo acceder al spreadsheet');
        return { success: false, guias: [], total: 0, error: 'No se pudo acceder al spreadsheet' };
      }
      
      // Buscar en N.V DIARIAS las N.V con estado "Pendiente Picking"
      var nvSheet = ss.getSheetByName(SHEET_NV_DIARIAS);
      if (!nvSheet) {
        Logger.log('ERROR: Hoja N.V DIARIAS no encontrada');
        return { success: false, guias: [], total: 0, error: 'Hoja N.V DIARIAS no encontrada' };
      }
      
      var nvLastRow = nvSheet.getLastRow();
      Logger.log('Última fila en N.V DIARIAS: ' + nvLastRow);
      
      if (nvLastRow <= 1) {
        Logger.log('Hoja N.V DIARIAS vacía');
        return { success: true, guias: [], total: 0, mensaje: 'Hoja vacía' };
      }
      
      var nvData = nvSheet.getRange(2, 1, nvLastRow - 1, 12).getValues();
      Logger.log('Filas leídas: ' + nvData.length);
      
      var contadorPendientes = 0;
      for (var i = 0; i < nvData.length; i++) {
        var row = nvData[i];
        var estadoRaw = String(row[2] || '').trim();
        var estadoNorm = estadoRaw.toUpperCase().replace(/\s+/g, '_');
        
        // Filtrar solo "Pendiente Picking"
        if (estadoNorm === 'PENDIENTE_PICKING' || estadoRaw === 'Pendiente Picking') {
          contadorPendientes++;
          var nVenta = String(row[1] || '').trim();
          if (!nVenta) continue;
          
          if (!guiasMap[nVenta]) {
            // IMPORTANTE: Convertir fecha a string para evitar problemas de serialización
            var fechaStr = '';
            try {
              if (row[0] instanceof Date) {
                fechaStr = Utilities.formatDate(row[0], Session.getScriptTimeZone(), 'dd/MM/yyyy');
              } else if (row[0]) {
                fechaStr = String(row[0]);
              }
            } catch (fe) {
              fechaStr = String(row[0] || '');
            }
            
            guiasMap[nVenta] = {
              notaVenta: nVenta,
              fechaEntrega: fechaStr,
              estado: 'Pendiente Picking',
              codCliente: String(row[3] || ''),
              cliente: String(row[4] || ''),
              vendedor: String(row[6] || ''),
              zona: String(row[7] || ''),
              productos: [],
              totalItems: 0
            };
          }
          
          var codigo = String(row[8] || '').trim();
          if (codigo) {
            guiasMap[nVenta].productos.push({
              codigo: codigo,
              descripcion: String(row[9] || ''),
              unidadMedida: String(row[10] || ''),
              pedido: Number(row[11]) || 0
            });
            guiasMap[nVenta].totalItems++;
          }
        }
      }
      
      Logger.log('Filas con estado Pendiente Picking: ' + contadorPendientes);
      
      // Convertir map a array
      var guias = [];
      for (var key in guiasMap) {
        if (guiasMap.hasOwnProperty(key)) {
          guias.push(guiasMap[key]);
        }
      }
      
      Logger.log('N.V únicas encontradas: ' + guias.length);
      
      // Ordenar por fecha (ya son strings, ordenar alfabéticamente)
      guias.sort(function(a, b) {
        return String(a.fechaEntrega || '').localeCompare(String(b.fechaEntrega || ''));
      });
      
      var resultado = {
        success: true,
        guias: guias,
        total: guias.length
      };
      
      Logger.log('=== getGuiasDesdeHojaPicking FIN - Retornando ' + guias.length + ' guías ===');
      return resultado;
      
    } catch (e) {
      Logger.log('ERROR en getGuiasDesdeHojaPicking: ' + e.message);
      Logger.log('Stack: ' + (e.stack || 'N/A'));
      return { success: false, error: String(e.message || e), guias: [], total: 0 };
    }
  }

  /**
  * Obtiene las N.V de la hoja PACKING
  * @returns {Object} - {success, ordenes}
  */
  function getOrdenesDesdeHojaPacking() {
    Logger.log('=== getOrdenesDesdeHojaPacking INICIO ===');
    try {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var sheet = ss.getSheetByName(SHEET_PACKING);
      
      if (!sheet) {
        Logger.log('Hoja PACKING no existe');
        return { success: true, ordenes: [], total: 0, mensaje: 'Hoja PACKING no existe' };
      }
      
      var lastRow = sheet.getLastRow();
      if (lastRow <= 1) {
        Logger.log('Hoja PACKING vacía');
        return { success: true, ordenes: [], total: 0, mensaje: 'Hoja vacía' };
      }
      
      var data = sheet.getRange(2, 1, lastRow - 1, 14).getValues();
      var ordenesMap = {};
      
      for (var i = 0; i < data.length; i++) {
        var row = data[i];
        var nVenta = String(row[1] || '').trim();
        if (!nVenta) continue;
        
        if (!ordenesMap[nVenta]) {
          // Convertir fecha a string
          var fechaStr = '';
          try {
            if (row[0] instanceof Date) {
              fechaStr = Utilities.formatDate(row[0], Session.getScriptTimeZone(), 'dd/MM/yyyy');
            } else if (row[0]) {
              fechaStr = String(row[0]);
            }
          } catch (fe) {
            fechaStr = String(row[0] || '');
          }
          
          ordenesMap[nVenta] = {
            notaVenta: nVenta,
            fechaEntrega: fechaStr,
            estado: String(row[2] || ''),
            cliente: String(row[4] || ''),
            productos: [],
            totalItems: 0
          };
        }
        
        ordenesMap[nVenta].productos.push({
          codigo: String(row[8] || ''),
          descripcion: String(row[9] || ''),
          unidadMedida: String(row[10] || ''),
          pedido: Number(row[11]) || 0
        });
        ordenesMap[nVenta].totalItems++;
      }
      
      // Convertir map a array (compatible con ES5)
      var ordenes = [];
      for (var key in ordenesMap) {
        if (ordenesMap.hasOwnProperty(key)) {
          ordenes.push(ordenesMap[key]);
        }
      }
      
      Logger.log('=== getOrdenesDesdeHojaPacking FIN - ' + ordenes.length + ' órdenes ===');
      return {
        success: true,
        ordenes: ordenes,
        total: ordenes.length
      };
      
    } catch (e) {
      Logger.log('ERROR en getOrdenesDesdeHojaPacking: ' + e.message);
      return { success: false, error: String(e.message || e), ordenes: [], total: 0 };
    }
  }

  /**
  * Busca ubicaciones de un producto en la hoja INGRESO
  * Columnas según requisitos: A=ID, B=Ubicación, I=Descripción, J=Código
  * @param {string} codigoProducto - Código del producto
  * @returns {Object} - {success, ubicaciones}
  */
  function buscarUbicacionesEnIngreso(codigoProducto) {
    try {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var sheet = ss.getSheetByName('INGRESO');
      
      if (!sheet) {
        return { success: true, ubicaciones: ['SIN UBICACIÓN'], mensaje: 'Hoja INGRESO no encontrada' };
      }
      
      var lastRow = sheet.getLastRow();
      if (lastRow <= 1) {
        return { success: true, ubicaciones: ['SIN UBICACIÓN'] };
      }
      
      // Leer columnas A hasta J (10 columnas) para obtener B (Ubicación) y J (Código)
      var data = sheet.getRange(2, 1, lastRow - 1, 10).getValues();
      var codigoBuscado = String(codigoProducto).trim().toUpperCase();
      var ubicacionesSet = {};
      
      Logger.log('buscarUbicacionesEnIngreso - Buscando código: ' + codigoBuscado);
      
      for (var i = 0; i < data.length; i++) {
        // COLUMNAS CORRECTAS: A=UBICACION, B=CODIGO, I=DESCRIPCION, J=CANTIDAD
        var codigo = String(data[i][1] || '').trim().toUpperCase(); // Columna B (índice 1) = CODIGO
        if (codigo === codigoBuscado) {
          var ubicacion = String(data[i][0] || '').trim(); // Columna A (índice 0) = UBICACION
          if (ubicacion) {
            ubicacionesSet[ubicacion] = true;
            Logger.log('Ubicación encontrada: ' + ubicacion);
          }
        }
      }
      
      var ubicaciones = Object.keys(ubicacionesSet);
      
      if (ubicaciones.length === 0) {
        Logger.log('No se encontraron ubicaciones para: ' + codigoBuscado);
        return { success: true, ubicaciones: ['SIN UBICACIÓN'], encontrado: false };
      }
      
      return {
        success: true,
        ubicaciones: ubicaciones,
        codigo: codigoProducto,
        encontrado: true,
        totalUbicaciones: ubicaciones.length
      };
      
    } catch (e) {
      Logger.log('Error en buscarUbicacionesEnIngreso: ' + e.message);
      return { success: false, error: e.message, ubicaciones: ['ERROR'] };
    }
  }

  /**
  * Obtiene el detalle de una guía de picking con todas las ubicaciones
  * Hace una sola lectura de INGRESO para obtener todas las ubicaciones
  * @param {string} nVenta - Número de nota de venta
  * @returns {Object} - {success, guia, productos}
  */
  function getDetalleGuiaConUbicaciones(nVenta) {
    Logger.log('=== getDetalleGuiaConUbicaciones: ' + nVenta + ' ===');
    try {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var nvSheet = ss.getSheetByName(SHEET_NV_DIARIAS);
      
      if (!nvSheet) {
        return { success: false, error: 'Hoja N.V DIARIAS no encontrada' };
      }
      
      var nvLastRow = nvSheet.getLastRow();
      if (nvLastRow <= 1) {
        return { success: false, error: 'Hoja vacía' };
      }
      
      // 1. Leer datos de la N.V
      var nvData = nvSheet.getRange(2, 1, nvLastRow - 1, 12).getValues();
      var nVentaBuscada = String(nVenta).trim();
      var guiaInfo = null;
      var productos = [];
      var codigosUnicos = {};
      
      for (var i = 0; i < nvData.length; i++) {
        var row = nvData[i];
        var nVentaFila = String(row[1] || '').trim();
        
        if (nVentaFila === nVentaBuscada) {
          if (!guiaInfo) {
            var fechaStr = '';
            try {
              if (row[0] instanceof Date) {
                fechaStr = Utilities.formatDate(row[0], Session.getScriptTimeZone(), 'dd/MM/yyyy');
              } else if (row[0]) {
                fechaStr = String(row[0]);
              }
            } catch (fe) {
              fechaStr = String(row[0] || '');
            }
            
            guiaInfo = {
              notaVenta: nVentaFila,
              fechaEntrega: fechaStr,
              estado: String(row[2] || ''),
              codCliente: String(row[3] || ''),
              cliente: String(row[4] || ''),
              vendedor: String(row[6] || ''),
              zona: String(row[7] || '')
            };
          }
          
          var codigo = String(row[8] || '').trim();
          if (codigo) {
            productos.push({
              codigo: codigo,
              descripcion: String(row[9] || ''),
              unidadMedida: String(row[10] || ''),
              pedido: Number(row[11]) || 0,
              ubicaciones: [] // Se llenará después
            });
            codigosUnicos[codigo.toUpperCase()] = true;
          }
        }
      }
      
      if (!guiaInfo) {
        return { success: false, error: 'N.V no encontrada' };
      }
      
      // 2. Leer TODAS las ubicaciones de INGRESO de una sola vez
      // Columnas: A=ID, B=Ubicación, I=Descripción, J=Código
      var ingresoSheet = ss.getSheetByName('INGRESO');
      var ubicacionesPorCodigo = {};
      
      Logger.log('Códigos a buscar: ' + Object.keys(codigosUnicos).join(', '));
      
      if (ingresoSheet && ingresoSheet.getLastRow() > 1) {
        var ingresoLastRow = ingresoSheet.getLastRow();
        Logger.log('Hoja INGRESO tiene ' + ingresoLastRow + ' filas');
        
        // Leer columnas A hasta J (10 columnas) para obtener B (Ubicación) y J (Código)
        var ingresoData = ingresoSheet.getRange(2, 1, ingresoLastRow - 1, 10).getValues();
        
        // Log de las primeras 3 filas para debug
        for (var d = 0; d < Math.min(3, ingresoData.length); d++) {
          Logger.log('INGRESO fila ' + (d+2) + ': ColB(Ubic)=' + ingresoData[d][1] + ', ColJ(Cod)=' + ingresoData[d][9]);
        }
        
        for (var j = 0; j < ingresoData.length; j++) {
          // COLUMNAS CORRECTAS DE INGRESO:
          // A (índice 0) = UBICACION
          // B (índice 1) = CODIGO
          // I (índice 8) = DESCRIPCION
          // J (índice 9) = CANTIDAD
          var ubicacion = String(ingresoData[j][0] || '').trim();      // Columna A (índice 0) = UBICACION
          var codigoIngreso = String(ingresoData[j][1] || '').trim().toUpperCase(); // Columna B (índice 1) = CODIGO
          var cantidad = Number(ingresoData[j][9]) || 0;                // Columna J (índice 9) = CANTIDAD
          
          if (codigoIngreso && ubicacion && codigosUnicos[codigoIngreso]) {
            Logger.log('MATCH encontrado: Código=' + codigoIngreso + ', Ubicación=' + ubicacion + ', Cantidad=' + cantidad);
            if (!ubicacionesPorCodigo[codigoIngreso]) {
              ubicacionesPorCodigo[codigoIngreso] = [];
            }
            // Agregar ubicación con cantidad en formato "A-1 (Stock: 10)"
            ubicacionesPorCodigo[codigoIngreso].push(ubicacion + ' (Stock: ' + cantidad + ')');
          }
        }
        
        Logger.log('Ubicaciones encontradas: ' + JSON.stringify(ubicacionesPorCodigo));
      } else {
        Logger.log('Hoja INGRESO no encontrada o vacía');
      }
      
      // 3. Asignar ubicaciones a cada producto
      for (var k = 0; k < productos.length; k++) {
        var codigoUpper = productos[k].codigo.toUpperCase();
        if (ubicacionesPorCodigo[codigoUpper] && ubicacionesPorCodigo[codigoUpper].length > 0) {
          productos[k].ubicaciones = ubicacionesPorCodigo[codigoUpper];
        } else {
          productos[k].ubicaciones = ['SIN UBICACIÓN'];
        }
      }
      
      guiaInfo.productos = productos;
      guiaInfo.totalItems = productos.length;
      
      Logger.log('Guía encontrada con ' + productos.length + ' productos');
      
      return {
        success: true,
        guia: guiaInfo,
        productos: productos
      };
      
    } catch (e) {
      Logger.log('Error en getDetalleGuiaConUbicaciones: ' + e.message);
      return { success: false, error: e.message };
    }
  }

  /**
  * Completa el picking de una N.V
  * 1. Actualiza estado en N.V DIARIAS a "Packing"
  * 2. Mueve de hoja PICKING a hoja PACKING
  * @param {string} nVenta - Número de nota de venta
  * @param {string} usuario - Usuario que completa
  * @returns {Object} - {success, mensaje}
  */
  function completarPickingYMover(nVenta, usuario) {
    try {
      // 1. Cambiar estado en N.V DIARIAS
      var cambioEstado = cambiarEstadoNVDirecto(nVenta, 'PK', usuario);
      if (!cambioEstado.success) {
        return cambioEstado;
      }
      
      // 2. Mover de PICKING a PACKING
      var mover = moverPickingAPacking(nVenta, usuario);
      if (!mover.success) {
        Logger.log('Advertencia: No se pudo mover a PACKING: ' + mover.error);
      }
      
      // 3. Invalidar caché
      if (typeof invalidateNVCache === 'function') {
        invalidateNVCache();
      }
      
      return {
        success: true,
        notaVenta: nVenta,
        nuevoEstado: 'Packing',
        mensaje: '¡PICKING COMPLETO! Dejar en PACKING AREA'
      };
      
    } catch (e) {
      Logger.log('Error en completarPickingYMover: ' + e.message);
      return { success: false, error: e.message };
    }
  }

  /**
  * Completa el packing de una N.V
  * 1. Actualiza estado en N.V DIARIAS a "Listo Despacho"
  * 2. Elimina de hoja PACKING
  * @param {string} nVenta - Número de nota de venta
  * @param {Object} datosEmpaque - {bultos, peso, dimensiones}
  * @param {string} usuario - Usuario que completa
  * @returns {Object} - {success, mensaje}
  */
  function completarPackingYMover(nVenta, datosEmpaque, usuario) {
    try {
      // 1. Cambiar estado en N.V DIARIAS
      var cambioEstado = cambiarEstadoNVDirecto(nVenta, 'LISTO_DESPACHO', usuario);
      if (!cambioEstado.success) {
        return cambioEstado;
      }
      
      // 2. Eliminar de PACKING
      eliminarDePacking(nVenta);
      
      // 3. Registrar datos de empaque si existen
      if (datosEmpaque) {
        registrarDatosEmpaqueEnMovimientos(nVenta, datosEmpaque, usuario);
      }
      
      // 4. Invalidar caché
      if (typeof invalidateNVCache === 'function') {
        invalidateNVCache();
      }
      
      return {
        success: true,
        notaVenta: nVenta,
        nuevoEstado: 'Listo Despacho',
        mensaje: '¡PACKING COMPLETO! Orden lista para despacho'
      };
      
    } catch (e) {
      Logger.log('Error en completarPackingYMover: ' + e.message);
      return { success: false, error: e.message };
    }
  }

  /**
  * Registra datos de empaque en MOVIMIENTOS
  */
  function registrarDatosEmpaqueEnMovimientos(nVenta, datosEmpaque, usuario) {
    try {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var sheet = ss.getSheetByName(SHEET_MOVIMIENTOS);
      
      if (!sheet) return;
      
      var referencia = 'Bultos: ' + (datosEmpaque.bultos || 0);
      referencia += ', Peso: ' + (datosEmpaque.peso || 0) + 'kg';
      if (datosEmpaque.dimensiones) referencia += ', Dim: ' + datosEmpaque.dimensiones;
      
      sheet.appendRow([
        'EMP-' + Date.now(),
        new Date(),
        'EMPAQUE_COMPLETADO',
        nVenta,
        datosEmpaque.bultos || 0,
        '',
        referencia,
        usuario || 'Sistema'
      ]);
    } catch (e) {
      Logger.log('Error registrando empaque: ' + e.message);
    }
  }


  /**
  * Obtiene el resumen de estados contando desde N.V DIARIAS
  * @returns {Object} - {success, resumen}
  */
  function getResumenDesdeHojas() {
    try {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var resumen = {
        pendientePicking: 0,
        enPicking: 0,
        enPacking: 0,
        listoDespacho: 0
      };
      
      // Contar todo desde N.V DIARIAS
      var sheetNV = ss.getSheetByName(SHEET_NV_DIARIAS);
      if (sheetNV && sheetNV.getLastRow() > 1) {
        var dataNV = sheetNV.getRange(2, 2, sheetNV.getLastRow() - 1, 2).getValues();
        var nvContadas = {
          pendientePicking: {},
          enPicking: {},
          enPacking: {},
          listoDespacho: {}
        };
        
        for (var i = 0; i < dataNV.length; i++) {
          var nvNum = String(dataNV[i][0] || '').trim();
          if (!nvNum) continue;
          
          var estadoRaw = String(dataNV[i][1] || '').trim();
          var estado = estadoRaw.toUpperCase().replace(/\s+/g, '_');
          
          if (estado === 'PENDIENTE_PICKING' && !nvContadas.pendientePicking[nvNum]) {
            nvContadas.pendientePicking[nvNum] = true;
            resumen.pendientePicking++;
          } else if (estado === 'EN_PICKING' && !nvContadas.enPicking[nvNum]) {
            nvContadas.enPicking[nvNum] = true;
            resumen.enPicking++;
          } else if ((estado === 'PACKING' || estado === 'PK') && !nvContadas.enPacking[nvNum]) {
            nvContadas.enPacking[nvNum] = true;
            resumen.enPacking++;
          } else if (estado === 'LISTO_DESPACHO' && !nvContadas.listoDespacho[nvNum]) {
            nvContadas.listoDespacho[nvNum] = true;
            resumen.listoDespacho++;
          }
        }
      }
      
      return {
        success: true,
        resumen: resumen
      };
      
    } catch (e) {
      return { success: false, error: String(e.message || e), resumen: { pendientePicking: 0, enPicking: 0, enPacking: 0, listoDespacho: 0 } };
    }
  }


  /**
  * Función de diagnóstico completo del sistema de Picking/Packing
  * Ejecutar desde el editor de Apps Script para verificar que todo funcione
  */
  function diagnosticoSistemaPickingPacking() {
    var resultado = {
      timestamp: new Date().toISOString(),
      hojas: {},
      funciones: {},
      errores: []
    };
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // 1. Verificar hojas necesarias
    var hojasRequeridas = ['N.V DIARIAS', 'PICKING', 'PACKING', 'INGRESO', 'MOVIMIENTOS'];
    hojasRequeridas.forEach(function(nombre) {
      var sheet = ss.getSheetByName(nombre);
      resultado.hojas[nombre] = {
        existe: !!sheet,
        filas: sheet ? sheet.getLastRow() : 0
      };
      if (!sheet && nombre !== 'PICKING' && nombre !== 'PACKING' && nombre !== 'MOVIMIENTOS') {
        resultado.errores.push('Hoja "' + nombre + '" no encontrada');
      }
    });
    
    // 2. Verificar estructura de INGRESO (columnas C y D)
    var ingresoSheet = ss.getSheetByName('INGRESO');
    if (ingresoSheet && ingresoSheet.getLastRow() > 1) {
      var headers = ingresoSheet.getRange(1, 1, 1, 5).getValues()[0];
      resultado.hojas['INGRESO'].headers = headers;
      resultado.hojas['INGRESO'].columnaC = headers[2] || 'Sin header';
      resultado.hojas['INGRESO'].columnaD = headers[3] || 'Sin header';
    }
    
    // 3. Verificar estados permitidos en validación de datos
    var nvSheet = ss.getSheetByName('N.V DIARIAS');
    if (nvSheet) {
      try {
        var validacion = nvSheet.getRange('C2').getDataValidation();
        if (validacion) {
          var criterio = validacion.getCriteriaType();
          resultado.hojas['N.V DIARIAS'].tieneValidacion = true;
          resultado.hojas['N.V DIARIAS'].tipoValidacion = criterio.toString();
          
          var valores = validacion.getCriteriaValues();
          if (valores && valores[0]) {
            resultado.hojas['N.V DIARIAS'].valoresPermitidos = valores[0];
          }
        } else {
          resultado.hojas['N.V DIARIAS'].tieneValidacion = false;
        }
      } catch (e) {
        resultado.hojas['N.V DIARIAS'].errorValidacion = e.message;
      }
    }
    
    // 4. Probar funciones principales
    try {
      var resumen = getResumenDesdeHojas();
      resultado.funciones.getResumenDesdeHojas = resumen.success ? 'OK' : resumen.error;
      resultado.resumen = resumen.resumen;
    } catch (e) {
      resultado.funciones.getResumenDesdeHojas = 'ERROR: ' + e.message;
    }
    
    try {
      var guias = getGuiasDesdeHojaPicking();
      resultado.funciones.getGuiasDesdeHojaPicking = guias.success ? 'OK (' + (guias.guias ? guias.guias.length : 0) + ' guías)' : guias.error;
    } catch (e) {
      resultado.funciones.getGuiasDesdeHojaPicking = 'ERROR: ' + e.message;
    }
    
    try {
      var ordenes = getOrdenesDesdeHojaPacking();
      resultado.funciones.getOrdenesDesdeHojaPacking = ordenes.success ? 'OK (' + (ordenes.ordenes ? ordenes.ordenes.length : 0) + ' órdenes)' : ordenes.error;
    } catch (e) {
      resultado.funciones.getOrdenesDesdeHojaPacking = 'ERROR: ' + e.message;
    }
    
    // 5. Probar búsqueda de ubicaciones con un código de ejemplo
    if (ingresoSheet && ingresoSheet.getLastRow() > 1) {
      var primerCodigo = ingresoSheet.getRange(2, 10).getValue(); // Columna J (índice 10) = Código
      if (primerCodigo) {
        try {
          var ubicaciones = buscarUbicacionesEnIngreso(primerCodigo);
          resultado.funciones.buscarUbicacionesEnIngreso = ubicaciones.success ? 
            'OK (código: ' + primerCodigo + ', ubicaciones: ' + ubicaciones.ubicaciones.join(', ') + ')' : 
            ubicaciones.error;
        } catch (e) {
          resultado.funciones.buscarUbicacionesEnIngreso = 'ERROR: ' + e.message;
        }
      }
    }
    
    // 6. Mostrar estados permitidos que deberían estar en la validación
    resultado.estadosRequeridos = getEstadosPermitidos();
    
    Logger.log('=== DIAGNÓSTICO SISTEMA PICKING/PACKING ===');
    Logger.log(JSON.stringify(resultado, null, 2));
    
    return resultado;
  }

  /**
  * Función para actualizar la validación de datos de la columna Estado
  * Ejecutar si necesitas agregar los estados faltantes
  */
  function actualizarValidacionEstados() {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('N.V DIARIAS');
    
    if (!sheet) {
      Logger.log('Hoja N.V DIARIAS no encontrada');
      return { success: false, error: 'Hoja no encontrada' };
    }
    
    var lastRow = sheet.getLastRow();
    if (lastRow < 2) lastRow = 2;
    
    // Estados permitidos
    var estados = getEstadosPermitidos();
    Logger.log('Estados a configurar: ' + estados.join(', '));
    
    // Crear regla de validación
    var regla = SpreadsheetApp.newDataValidation()
      .requireValueInList(estados, true)
      .setAllowInvalid(false)
      .setHelpText('Seleccione un estado válido')
      .build();
    
    // Aplicar a toda la columna C (Estado)
    var rango = sheet.getRange('C2:C' + lastRow);
    rango.setDataValidation(regla);
    
    Logger.log('Validación actualizada para ' + (lastRow - 1) + ' filas');
    
    return {
      success: true,
      mensaje: 'Validación actualizada',
      estados: estados,
      filas: lastRow - 1
    };
  }


  /**
  * FUNCIÓN DE PRUEBA SIMPLE - Ejecutar desde el editor de Apps Script
  * Esto te mostrará exactamente qué está pasando
  */
  function testGetGuiasPicking() {
    Logger.log('=== TEST getGuiasDesdeHojaPicking ===');
    
    try {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      Logger.log('Spreadsheet: ' + (ss ? ss.getName() : 'NULL'));
      
      // Verificar hoja PICKING
      var pickingSheet = ss.getSheetByName('PICKING');
      Logger.log('Hoja PICKING existe: ' + (pickingSheet ? 'SI' : 'NO'));
      
      if (pickingSheet) {
        var lastRow = pickingSheet.getLastRow();
        Logger.log('Última fila en PICKING: ' + lastRow);
        
        if (lastRow >= 1) {
          var headers = pickingSheet.getRange(1, 1, 1, 13).getValues()[0];
          Logger.log('Headers: ' + JSON.stringify(headers));
        }
        
        if (lastRow > 1) {
          var primeraFila = pickingSheet.getRange(2, 1, 1, 13).getValues()[0];
          Logger.log('Primera fila de datos: ' + JSON.stringify(primeraFila));
        }
      }
      
      // Verificar hoja N.V DIARIAS
      var nvSheet = ss.getSheetByName('N.V DIARIAS');
      Logger.log('Hoja N.V DIARIAS existe: ' + (nvSheet ? 'SI' : 'NO'));
      
      if (nvSheet) {
        var nvLastRow = nvSheet.getLastRow();
        Logger.log('Última fila en N.V DIARIAS: ' + nvLastRow);
        
        // Buscar N.V con estado Pendiente Picking
        if (nvLastRow > 1) {
          var nvData = nvSheet.getRange(2, 1, nvLastRow - 1, 3).getValues();
          var pendientes = 0;
          for (var i = 0; i < nvData.length; i++) {
            var estado = String(nvData[i][2] || '').trim();
            if (estado === 'Pendiente Picking' || estado.toUpperCase().replace(/\s+/g, '_') === 'PENDIENTE_PICKING') {
              pendientes++;
              if (pendientes <= 3) {
                Logger.log('N.V Pendiente: ' + nvData[i][1] + ' - Estado: ' + estado);
              }
            }
          }
          Logger.log('Total N.V con estado Pendiente Picking: ' + pendientes);
        }
      }
      
      // Ahora llamar a la función real
      Logger.log('--- Llamando a getGuiasDesdeHojaPicking() ---');
      var resultado = getGuiasDesdeHojaPicking();
      Logger.log('Resultado: ' + JSON.stringify(resultado));
      
      return resultado;
      
    } catch (e) {
      Logger.log('ERROR: ' + e.message);
      Logger.log('Stack: ' + e.stack);
      return { success: false, error: e.message };
    }
  }


  /**
  * Obtiene todas las N.V para el módulo Estado N.V (Pipeline View)
  * @returns {Object} - {success, ordenes, vendedores}
  */
  function getTodasLasNV() {
    Logger.log('=== getTodasLasNV INICIO ===');
    try {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var sheet = getNVSheetState();
      
      if (!sheet) {
        return { success: false, error: 'Hoja de N.V no encontrada', ordenes: [], vendedores: [] };
      }
      
      var lastRow = sheet.getLastRow();
      if (lastRow <= 1) {
        return { success: true, ordenes: [], vendedores: [], total: 0 };
      }
      
      var data = sheet.getRange(2, 1, lastRow - 1, 12).getValues();
      var ordenesMap = {};
      var vendedoresSet = {};
      
      for (var i = 0; i < data.length; i++) {
        var row = data[i];
        var nVenta = String(row[COL_NV_DIARIAS.N_VENTA] || '').trim();
        if (!nVenta) continue;
        
        var vendedor = String(row[COL_NV_DIARIAS.VENDEDOR] || '').trim();
        if (vendedor) vendedoresSet[vendedor] = true;
        
        if (!ordenesMap[nVenta]) {
          var fechaStr = '';
          try {
            if (row[COL_NV_DIARIAS.FECHA_ENTREGA] instanceof Date) {
              fechaStr = Utilities.formatDate(row[COL_NV_DIARIAS.FECHA_ENTREGA], Session.getScriptTimeZone(), 'yyyy-MM-dd');
            } else if (row[COL_NV_DIARIAS.FECHA_ENTREGA]) {
              fechaStr = String(row[COL_NV_DIARIAS.FECHA_ENTREGA]);
            }
          } catch (fe) {
            fechaStr = String(row[COL_NV_DIARIAS.FECHA_ENTREGA] || '');
          }
          
          ordenesMap[nVenta] = {
            notaVenta: nVenta,
            fechaEntrega: fechaStr,
            estado: String(row[COL_NV_DIARIAS.ESTADO] || ''),
            codCliente: String(row[COL_NV_DIARIAS.COD_CLIENTE] || ''),
            cliente: String(row[COL_NV_DIARIAS.CLIENTE] || ''),
            codVendedor: String(row[COL_NV_DIARIAS.COD_VENDEDOR] || ''),
            vendedor: vendedor,
            zona: String(row[COL_NV_DIARIAS.ZONA] || ''),
            totalItems: 0
          };
        }
        ordenesMap[nVenta].totalItems++;
      }
      
      var ordenes = [];
      for (var key in ordenesMap) {
        if (ordenesMap.hasOwnProperty(key)) {
          ordenes.push(ordenesMap[key]);
        }
      }
      
      var vendedores = Object.keys(vendedoresSet).sort();
      
      Logger.log('=== getTodasLasNV FIN - ' + ordenes.length + ' órdenes ===');
      return {
        success: true,
        ordenes: ordenes,
        vendedores: vendedores,
        total: ordenes.length
      };
      
    } catch (e) {
      Logger.log('ERROR en getTodasLasNV: ' + e.message);
      return { success: false, error: e.message, ordenes: [], vendedores: [] };
    }
  }

  /**
  * Obtiene el detalle de una N.V específica
  * @param {string} nVenta - Número de nota de venta
  * @returns {Object} - {success, detalle}
  */
  function getDetalleNV(nVenta) {
    try {
      var sheet = getNVSheetState();
      if (!sheet) {
        return { success: false, error: 'Hoja no encontrada' };
      }
      
      var data = sheet.getDataRange().getValues();
      var nVentaBuscada = String(nVenta).trim();
      var detalle = null;
      var productos = [];
      
      for (var i = 1; i < data.length; i++) {
        var nVentaFila = String(data[i][COL_NV_DIARIAS.N_VENTA] || '').trim();
        if (nVentaFila !== nVentaBuscada) continue;
        
        if (!detalle) {
          var fechaStr = '';
          try {
            if (data[i][COL_NV_DIARIAS.FECHA_ENTREGA] instanceof Date) {
              fechaStr = Utilities.formatDate(data[i][COL_NV_DIARIAS.FECHA_ENTREGA], Session.getScriptTimeZone(), 'dd/MM/yyyy');
            } else {
              fechaStr = String(data[i][COL_NV_DIARIAS.FECHA_ENTREGA] || '');
            }
          } catch (e) {
            fechaStr = String(data[i][COL_NV_DIARIAS.FECHA_ENTREGA] || '');
          }
          
          detalle = {
            notaVenta: nVentaFila,
            fechaEntrega: fechaStr,
            estado: String(data[i][COL_NV_DIARIAS.ESTADO] || ''),
            codCliente: String(data[i][COL_NV_DIARIAS.COD_CLIENTE] || ''),
            cliente: String(data[i][COL_NV_DIARIAS.CLIENTE] || ''),
            codVendedor: String(data[i][COL_NV_DIARIAS.COD_VENDEDOR] || ''),
            vendedor: String(data[i][COL_NV_DIARIAS.VENDEDOR] || ''),
            zona: String(data[i][COL_NV_DIARIAS.ZONA] || '')
          };
        }
        
        productos.push({
          codigo: String(data[i][COL_NV_DIARIAS.COD_PRODUCTO] || ''),
          descripcion: String(data[i][COL_NV_DIARIAS.DESCRIPCION] || ''),
          unidadMedida: String(data[i][COL_NV_DIARIAS.UNIDAD_MEDIDA] || ''),
          pedido: Number(data[i][COL_NV_DIARIAS.PEDIDO]) || 0
        });
      }
      
      if (!detalle) {
        return { success: false, error: 'N.V no encontrada' };
      }
      
      detalle.productos = productos;
      detalle.totalItems = productos.length;
      
      return { success: true, detalle: detalle };
      
    } catch (e) {
      Logger.log('Error en getDetalleNV: ' + e.message);
      return { success: false, error: e.message };
    }
  }
