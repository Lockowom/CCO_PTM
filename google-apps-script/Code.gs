/**
 * Sistema de Monitoreo Logístico en Tiempo Real
 * Code.gs - Archivo principal con arquitectura SPA
 */

// ID del Google Spreadsheet (REEMPLAZA CON TU ID)
const SPREADSHEET_ID = '1st3UjRakRT1R9uwBOA1ATQ_9NYuP8Xk_AIXu-Wju0fM';

/**
 * Función helper para incluir archivos HTML
 * Permite usar <?!= include('nombre_archivo') ?> en templates
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * Función principal que maneja las peticiones GET
 * Sirve la aplicación del Sistema Logístico
 */
function doGet(e) {
  try {
    // 1. Revisar si es la App TMS Mobile (PWA)
    if (e.parameter && (e.parameter.page === 'mobile' || e.parameter.page === 'app')) {
      var template = HtmlService.createTemplateFromFile('TMS_Mobile_Index');
      return template.evaluate()
        .setTitle('TMS Conductor - Aplicación Móvil')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
        .addMetaTag('viewport', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no')
        .addMetaTag('apple-mobile-web-app-capable', 'yes')
        .addMetaTag('mobile-web-app-capable', 'yes')
        .addMetaTag('theme-color', '#3b82f6');
    }
    
    // 1.1. TMS Mobile Tasks Interface
    if (e.parameter && e.parameter.page === 'tasks') {
      var template = HtmlService.createTemplateFromFile('TMS_Mobile_Tasks');
      return template.evaluate()
        .setTitle('TMS - Mis Tareas')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
        .addMetaTag('viewport', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no')
        .addMetaTag('apple-mobile-web-app-capable', 'yes')
        .addMetaTag('mobile-web-app-capable', 'yes')
        .addMetaTag('theme-color', '#3b82f6');
    }
    
    // 1.2. TMS Mobile Navigation Interface
    if (e.parameter && e.parameter.page === 'navigation') {
      var template = HtmlService.createTemplateFromFile('TMS_Mobile_Navigation');
      return template.evaluate()
        .setTitle('TMS - Navegación')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
        .addMetaTag('viewport', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no')
        .addMetaTag('apple-mobile-web-app-capable', 'yes')
        .addMetaTag('mobile-web-app-capable', 'yes')
        .addMetaTag('theme-color', '#3b82f6');
    }
    
    // 2. Revisar si es el PWA Manifest
    if (e.parameter && e.parameter.page === 'manifest') {
      var manifestContent = HtmlService.createTemplateFromFile('TMS_Manifest').evaluate().getContent();
      return ContentService.createTextOutput(manifestContent)
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // 3. Revisar si es el Service Worker
    if (e.parameter && (e.parameter.page === 'sw' || e.parameter.page === 'serviceworker')) {
      var swContent = HtmlService.createTemplateFromFile('TMS_ServiceWorker').evaluate().getContent();
      return ContentService.createTextOutput(swContent)
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }

    // 4. Revisar si es la App TMS Desktop (Driver App)
    if (e.parameter && e.parameter.app === 'tms') {
      var template = HtmlService.createTemplateFromFile('TMS_Index');
      return template.evaluate()
        .setTitle('CCO TMS - App Conductores')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
        .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1');
    }

    // 5. App Principal (ERP)
    var template = HtmlService.createTemplateFromFile('Index');
    return template.evaluate()
      .setTitle('Sistema Logístico - Gestión de Almacén')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
      
  } catch (error) {
    // Si hay error, mostrar página de error
    Logger.log('Error en doGet: ' + error.message);
    return HtmlService.createHtmlOutput(
      '<h1>Error</h1>' +
      '<p>No se pudo cargar la aplicación</p>' +
      '<p>Error: ' + error.message + '</p>' +
      '<p>Verifica que todos los archivos HTML existan</p>'
    );
  }
}

/**
 * Obtiene el Spreadsheet principal
 */
function getSpreadsheet() {
  try {
    return SpreadsheetApp.openById(SPREADSHEET_ID);
  } catch (error) {
    Logger.log('Error al abrir spreadsheet: ' + error.message);
    throw new Error('No se pudo acceder a la base de datos. Verifica el SPREADSHEET_ID.');
  }
}

/**
 * ============================================================
 * CacheManager - Gestión de cache para optimizar lecturas
 * Soporta hasta 50 usuarios simultáneos
 * ============================================================
 */
const CacheManager = {
  CACHE_TTL: 60, // 1 minuto en segundos (reducido de 5 min para evitar datos desactualizados en picking/packing)
  CACHE_PREFIX: 'WMS_',
  
  /**
   * Obtiene datos del cache o los carga del spreadsheet
   * @param {string} sheetName - Nombre de la hoja
   * @param {boolean} forceRefresh - Forzar recarga desde spreadsheet
   * @returns {Object} Datos de la hoja con headers y rows
   */
  getData: function(sheetName, forceRefresh) {
    const cache = CacheService.getScriptCache();
    const cacheKey = this.CACHE_PREFIX + sheetName;
    
    // Intentar obtener del cache si no se fuerza refresh
    if (!forceRefresh) {
      const cached = cache.get(cacheKey);
      if (cached) {
        try {
          Logger.log('Cache HIT: ' + sheetName);
          return JSON.parse(cached);
        } catch (e) {
          Logger.log('Error parsing cache: ' + e.message);
        }
      }
    }
    
    // Cache MISS - cargar desde spreadsheet
    Logger.log('Cache MISS: ' + sheetName + ' - cargando desde spreadsheet');
    const sheet = getSheet(sheetName);
    const data = sheet.getDataRange().getDisplayValues();
    
    if (data.length === 0) {
      return { headers: [], rows: [], timestamp: Date.now() };
    }
    
    const result = {
      headers: data[0],
      rows: data.slice(1),
      timestamp: Date.now()
    };
    
    // Guardar en cache
    try {
      cache.put(cacheKey, JSON.stringify(result), this.CACHE_TTL);
    } catch (e) {
      Logger.log('Error guardando en cache: ' + e.message);
    }
    
    return result;
  },
  
  /**
   * Invalida el cache de una hoja específica
   * @param {string} sheetName - Nombre de la hoja
   */
  invalidate: function(sheetName) {
    const cache = CacheService.getScriptCache();
    const cacheKey = this.CACHE_PREFIX + sheetName;
    cache.remove(cacheKey);
    Logger.log('Cache invalidado: ' + sheetName);
  },
  
  /**
   * Invalida todo el cache del sistema
   */
  invalidateAll: function() {
    const cache = CacheService.getScriptCache();
    const sheets = ['Usuarios', 'Roles', 'Sesiones', 'Partidas', 'Series', 'Farmapack', 'peso', 'UBICACIONES'];
    sheets.forEach(sheet => {
      cache.remove(this.CACHE_PREFIX + sheet);
    });
    Logger.log('Cache completo invalidado');
  },
  
  /**
   * Obtiene el timestamp del cache para una hoja
   * @param {string} sheetName - Nombre de la hoja
   * @returns {number|null} Timestamp o null si no hay cache
   */
  getTimestamp: function(sheetName) {
    const cache = CacheService.getScriptCache();
    const cacheKey = this.CACHE_PREFIX + sheetName;
    const cached = cache.get(cacheKey);
    if (cached) {
      try {
        const data = JSON.parse(cached);
        return data.timestamp || null;
      } catch (e) {
        return null;
      }
    }
    return null;
  },
  
  /**
   * Verifica si hay conflicto entre cache y spreadsheet
   * El spreadsheet es siempre la fuente de verdad
   * @param {string} sheetName - Nombre de la hoja
   * @returns {Object} Resultado de la verificación
   */
  checkConflict: function(sheetName) {
    const cacheTimestamp = this.getTimestamp(sheetName);
    
    if (!cacheTimestamp) {
      return { hasConflict: false, reason: 'no_cache' };
    }
    
    // Obtener timestamp de última modificación del spreadsheet
    try {
      const ss = getSpreadsheet();
      const lastUpdate = ss.getLastUpdated();
      const spreadsheetTimestamp = lastUpdate ? lastUpdate.getTime() : Date.now();
      
      // Si el spreadsheet fue modificado después del cache, hay conflicto
      if (spreadsheetTimestamp > cacheTimestamp) {
        Logger.log('Conflicto detectado en ' + sheetName + ': spreadsheet más reciente');
        this.invalidate(sheetName);
        return { 
          hasConflict: true, 
          reason: 'spreadsheet_newer',
          cacheTime: cacheTimestamp,
          spreadsheetTime: spreadsheetTimestamp
        };
      }
      
      return { hasConflict: false, reason: 'cache_valid' };
      
    } catch (e) {
      Logger.log('Error verificando conflicto: ' + e.message);
      // En caso de error, invalidar cache por seguridad
      this.invalidate(sheetName);
      return { hasConflict: true, reason: 'error' };
    }
  },
  
  /**
   * Obtiene datos con verificación de conflictos
   * Siempre usa el spreadsheet como fuente de verdad si hay conflicto
   * @param {string} sheetName - Nombre de la hoja
   * @returns {Object} Datos de la hoja
   */
  getDataWithConflictCheck: function(sheetName) {
    const conflict = this.checkConflict(sheetName);
    
    if (conflict.hasConflict) {
      Logger.log('Recargando datos por conflicto: ' + sheetName);
      return this.getData(sheetName, true); // Forzar refresh
    }
    
    return this.getData(sheetName, false);
  }
};

/**
 * ============================================================
 * ConcurrencyManager - Gestión de operaciones concurrentes
 * Usa LockService para prevenir corrupción de datos
 * ============================================================
 */
const ConcurrencyManager = {
  LOCK_TIMEOUT: 30000, // 30 segundos
  
  /**
   * Ejecuta una operación de escritura con lock exclusivo
   * @param {string} lockName - Nombre identificador del lock
   * @param {Function} operation - Función a ejecutar
   * @returns {*} Resultado de la operación
   */
  executeWithLock: function(lockName, operation) {
    const lock = LockService.getScriptLock();
    
    try {
      // Intentar obtener el lock
      const acquired = lock.tryLock(this.LOCK_TIMEOUT);
      
      if (!acquired) {
        Logger.log('No se pudo obtener lock: ' + lockName);
        throw new Error('Sistema ocupado. Por favor intente de nuevo en unos segundos.');
      }
      
      Logger.log('Lock adquirido: ' + lockName);
      
      // Ejecutar la operación
      const result = operation();
      
      return result;
      
    } catch (error) {
      Logger.log('Error en operación con lock: ' + error.message);
      throw error;
      
    } finally {
      // Siempre liberar el lock
      try {
        lock.releaseLock();
        Logger.log('Lock liberado: ' + lockName);
      } catch (e) {
        Logger.log('Error liberando lock: ' + e.message);
      }
    }
  },
  
  /**
   * Ejecuta una operación de escritura con lock y reintentos
   * @param {string} lockName - Nombre identificador del lock
   * @param {Function} operation - Función a ejecutar
   * @param {number} maxRetries - Número máximo de reintentos
   * @returns {*} Resultado de la operación
   */
  executeWithRetry: function(lockName, operation, maxRetries) {
    maxRetries = maxRetries || 3;
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return this.executeWithLock(lockName, operation);
      } catch (error) {
        lastError = error;
        Logger.log('Intento ' + attempt + ' fallido: ' + error.message);
        
        if (attempt < maxRetries) {
          // Esperar antes de reintentar (backoff exponencial)
          Utilities.sleep(Math.pow(2, attempt) * 500);
        }
      }
    }
    
    throw lastError;
  }
};

/**
 * ============================================================
 * Búsqueda con verificación de permisos
 * ============================================================
 */

/**
 * Búsqueda multihojas con verificación de acceso por rol
 * @param {string} sessionId - ID de la sesión del usuario
 * @param {string} nombreVista - Nombre de la vista/hoja a buscar
 * @param {string} texto - Texto a buscar
 * @param {boolean} exactMode - Modo de búsqueda exacta
 * @returns {Object} Resultados de la búsqueda o error de acceso
 */
function buscarConPermisos(sessionId, nombreVista, texto, exactMode) {
  try {
    // Verificar acceso
    const accessCheck = checkAccessBySession(sessionId, nombreVista);
    
    if (!accessCheck.success) {
      return {
        hoja: nombreVista,
        columns: ['Error'],
        rows: [[accessCheck.error]],
        total: 0,
        ms: 0,
        accessDenied: true,
        code: accessCheck.code
      };
    }
    
    // Si tiene acceso, realizar la búsqueda normal
    // Nota: buscarMultiHoja debe estar definida en otro archivo
    if (typeof buscarMultiHoja === 'function') {
      return buscarMultiHoja(nombreVista, texto, exactMode);
    }
    
    // Fallback si no existe buscarMultiHoja
    return {
      hoja: nombreVista,
      columns: ['Error'],
      rows: [['Función de búsqueda no disponible']],
      total: 0,
      ms: 0
    };
    
  } catch (error) {
    Logger.log('Error en buscarConPermisos: ' + error.message);
    return {
      hoja: nombreVista,
      columns: ['Error'],
      rows: [[error.message]],
      total: 0,
      ms: 0
    };
  }
}

/**
 * Obtiene el contenido HTML de una vista para carga dinámica
 * @param {string} viewName - Nombre del archivo HTML (sin extensión)
 * @returns {string} Contenido HTML de la vista
 */
function getViewContent(viewName) {
  try {
    return HtmlService.createHtmlOutputFromFile(viewName).getContent();
  } catch (error) {
    Logger.log('Error cargando vista ' + viewName + ': ' + error.message);
    return null;
  }
}

/**
 * Función de prueba
 */
function test() {
  Logger.log('Sistema de Monitoreo Logístico - Test OK');
  return 'OK';
}

/**
 * Función de prueba para N.V - ejecutar desde el editor de Apps Script
 */
function testGetNotasVenta() {
  var result = getNotasVenta();
  Logger.log('Resultado: ' + JSON.stringify(result));
  return result;
}

/**
 * Lista todas las hojas del spreadsheet - para debug
 */
function listarHojas() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hojas = ss.getSheets().map(function(s) { return s.getName(); });
  Logger.log('Hojas disponibles: ' + hojas.join(', '));
  return hojas;
}


/**
 * ============================================================
 * MÓDULO DE NOTAS DE VENTA - OPTIMIZADO
 * Lee de hoja N.V DIARIAS con caché y procesamiento eficiente
 * Estructura: A=Fecha, B=N.Venta, C=Estado, E=Cliente, G=Vendedor, I=Cod, J=Desc, K=Unidad, L=Pedido
 * ============================================================
 */

// Cache interno para N.V (evita múltiples lecturas)
var _nvCache = null;
var _nvCacheTime = 0;
var NV_CACHE_TTL = 60000; // 60 segundos de caché

/**
 * Convierte fecha a string para evitar problemas de serialización
 */
function formatearFecha(fecha) {
  if (!fecha) return '';
  try {
    if (fecha instanceof Date) {
      return Utilities.formatDate(fecha, Session.getScriptTimeZone(), 'dd/MM/yyyy');
    }
    return String(fecha);
  } catch (e) {
    return String(fecha || '');
  }
}

/**
 * Obtiene la hoja de N.V DIARIAS (con fallbacks)
 */
function getNVSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    Logger.log('getNVSheet: No se pudo obtener el spreadsheet activo');
    return null;
  }
  
  // N.V DIARIAS es el nombre principal de la hoja de Notas de Venta
  var nombres = ['N.V DIARIAS', 'N.V. DIARIAS', 'NV DIARIAS', 'PICKING', 'ORDENES'];
  for (var i = 0; i < nombres.length; i++) {
    var sheet = ss.getSheetByName(nombres[i]);
    if (sheet) {
      Logger.log('getNVSheet: Usando hoja "' + nombres[i] + '"');
      return sheet;
    }
  }
  Logger.log('getNVSheet: No se encontró ninguna hoja de N.V');
  return null;
}

/**
 * Obtiene todas las Notas de Venta agrupadas - OPTIMIZADO
 * Usa caché interno y lectura eficiente
 * @param {boolean} forceRefresh - Forzar recarga desde spreadsheet
 * @returns {Object} - {success, notasVenta, estadisticas}
 */
function getNotasVenta(forceRefresh) {
  try {
    var now = Date.now();
    
    // Verificar caché (solo si no se fuerza refresh)
    if (!forceRefresh && _nvCache && (now - _nvCacheTime < NV_CACHE_TTL)) {
      Logger.log('N.V Cache HIT');
      return _nvCache;
    }
    
    Logger.log('N.V Cache MISS - cargando desde spreadsheet');
    
    var sheet = getNVSheet();
    if (!sheet) {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var hojas = ss ? ss.getSheets().map(function(s){return s.getName();}).join(', ') : 'N/A';
      return { 
        success: true, 
        notasVenta: [], 
        estadisticas: getEmptyStats(), 
        total: 0, 
        mensaje: 'Hoja no encontrada. Disponibles: ' + hojas 
      };
    }
    
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      return { 
        success: true, 
        notasVenta: [], 
        estadisticas: getEmptyStats(), 
        total: 0, 
        mensaje: 'Hoja vacía' 
      };
    }
    
    // Leer SOLO las columnas necesarias (A,B,C,E,G,I,J,K,L) - más eficiente
    // A=1, B=2, C=3, E=5, G=7, I=9, J=10, K=11, L=12
    var data = sheet.getRange(2, 1, lastRow - 1, 12).getValues();
    
    var notasMap = {};
    var clientes = {};
    var stats = getEmptyStats();
    
    // Procesar datos en un solo loop
    var dataLen = data.length;
    for (var i = 0; i < dataLen; i++) {
      var row = data[i];
      var nVenta = String(row[1] || '').trim(); // Columna B
      if (!nVenta) continue;
      
      if (!notasMap[nVenta]) {
        var cliente = String(row[4] || '').trim();
        notasMap[nVenta] = {
          notaVenta: nVenta,
          fechaEntrega: formatearFecha(row[0]),  // Columna A
          estado: String(row[2] || '').trim(),   // Columna C
          cliente: cliente,                       // Columna E
          vendedor: String(row[6] || '').trim(), // Columna G
          productos: [],
          totalItems: 0,
          totalPedido: 0
        };
        if (cliente) clientes[cliente] = 1;
      }
      
      var cantidad = Number(row[11]) || 0; // Columna L
      notasMap[nVenta].productos.push({
        codigo: String(row[8] || '').trim(),      // Columna I
        descripcion: String(row[9] || '').trim(), // Columna J
        unidadMedida: String(row[10] || '').trim(),// Columna K
        pedido: cantidad
      });
      notasMap[nVenta].totalItems++;
      notasMap[nVenta].totalPedido += cantidad;
    }
    
    // Convertir a array y calcular estadísticas en un solo loop
    var notasVenta = [];
    for (var key in notasMap) {
      if (notasMap.hasOwnProperty(key)) {
        var nv = notasMap[key];
        notasVenta.push(nv);
        
        // Calcular estadísticas
        stats.totalNV++;
        // Normalizar estado: convertir a mayúsculas y reemplazar espacios por guiones bajos
        var estado = (nv.estado || '').toUpperCase().replace(/\s+/g, '_');
        
        if (estado === 'NULA') {
          // No contar en ninguna categoría
        } else if (estado === 'REFACTURACION') {
          // No contar en ninguna categoría
        } else if (estado.indexOf('ENTREGAD') !== -1) {
          stats.entregadas++;
        } else if (estado.indexOf('DESPACHAD') !== -1 || estado.indexOf('TRANSITO') !== -1) {
          stats.despachadas++;
        } else if (estado.indexOf('LISTO') !== -1) {
          stats.listasDespacho++;
        } else if (estado === 'PK' || estado === 'PACKING' || estado.indexOf('PACKING') !== -1) {
          stats.enPacking++;
        } else if (estado === 'EN_PICKING') {
          // En proceso de picking activo (no se muestra en tarjeta principal)
          stats.enPicking++;
        } else if (estado === 'PENDIENTE_PICKING') {
          // Pendiente de picking - se muestra en tarjeta "Pend. Picking"
          stats.enPicking++;
        } else if (estado === 'APROBADA' || estado === 'APROBADO') {
          stats.aprobadas++;
        } else {
          stats.pendientes++;
        }
      }
    }
    
    stats.clientesUnicos = Object.keys(clientes).length;
    
    // Guardar en caché
    var result = {
      success: true,
      notasVenta: notasVenta,
      estadisticas: stats,
      total: notasVenta.length,
      cacheTime: now
    };
    
    _nvCache = result;
    _nvCacheTime = now;
    
    return result;
    
  } catch (e) {
    Logger.log('ERROR getNotasVenta: ' + e.message);
    return { 
      success: false, 
      error: e.message, 
      notasVenta: [], 
      estadisticas: getEmptyStats(), 
      total: 0 
    };
  }
}

/**
 * Retorna estadísticas vacías
 */
function getEmptyStats() {
  return {
    totalNV: 0,
    pendientes: 0,
    aprobadas: 0,
    enPicking: 0,
    enPacking: 0,
    listasDespacho: 0,
    despachadas: 0,
    entregadas: 0,
    clientesUnicos: 0
  };
}

/**
 * Invalida el caché de N.V (llamar después de cambios)
 */
function invalidateNVCache() {
  _nvCache = null;
  _nvCacheTime = 0;
  Logger.log('N.V Cache invalidado');
}

/**
 * Obtiene solo las estadísticas de N.V (más rápido que cargar todo)
 * @returns {Object} - {success, estadisticas}
 */
function getNotasVentaStats() {
  var result = getNotasVenta();
  return {
    success: result.success,
    estadisticas: result.estadisticas,
    total: result.total,
    error: result.error
  };
}


/**
 * ============================================================
 * MÓDULO DE ENTREGAS - Funciones para marcado inmediato
 * ============================================================
 */

// Definición local de estructura de columnas DESPACHO
var COL_ENTREGAS_DESPACHO = {
  FECHA_DOCTO: 0,       // A
  CLIENTE: 1,           // B
  FACTURAS: 2,          // C
  GUIA: 3,              // D
  BULTOS: 4,            // E
  EMPRESA_TRANSPORTE: 5,// F
  TRANSPORTISTA: 6,     // G
  N_NV: 7,              // H
  DIVISION: 8,          // I
  VENDEDOR: 9,          // J
  FECHA_DESPACHO: 10,   // K
  VALOR_FLETE: 11,      // L
  NUM_ENVIO_OT: 12,     // M
  FECHA_CREACION: 13,   // N
  ESTADO: 14            // O
};

/**
 * Obtiene los despachos pendientes de entrega
 * @returns {Object} - {success, despachos}
 */
function getDespachosPendientesEntrega() {
  try {
    Logger.log('=== GET DESPACHOS PENDIENTES ENTREGA ===');
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Despachos') || ss.getSheetByName('DESPACHO') || ss.getSheetByName('DESPACHOS');
    
    if (!sheet) {
      Logger.log('⚠️ Hoja de despachos no encontrada');
      return { success: true, despachos: [] };
    }
    
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      Logger.log('Hoja de despachos vacía');
      return { success: true, despachos: [] };
    }
    
    var data = sheet.getDataRange().getValues();
    var despachos = [];
    var nvProcesadas = {};
    var COL = COL_ENTREGAS_DESPACHO;
    
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var nVenta = String(row[COL.N_NV] || '').trim();
      var estado = String(row[COL.ESTADO] || '').toUpperCase();
      
      if (!nVenta) continue;
      if (nvProcesadas[nVenta]) continue;
      
      // Filtrar solo los que no están entregados
      if (estado.indexOf('ENTREGADO') === -1) {
        nvProcesadas[nVenta] = true;
        
        // Manejo seguro de fechas
        var fechaStr = '';
        var fechaRaw = row[COL.FECHA_DESPACHO] || row[COL.FECHA_DOCTO];
        try {
            if (fechaRaw instanceof Date) {
                fechaStr = Utilities.formatDate(fechaRaw, Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm");
            } else {
                fechaStr = String(fechaRaw || '');
            }
        } catch(e) {
            fechaStr = String(fechaRaw || '');
        }

        despachos.push({
          notaVenta: nVenta,
          cliente: String(row[COL.CLIENTE] || ''),
          fechaDespacho: fechaStr,
          bultos: Number(row[COL.BULTOS]) || 0,
          transportista: String(row[COL.TRANSPORTISTA] || row[COL.EMPRESA_TRANSPORTE] || ''),
          guia: String(row[COL.GUIA] || ''),
          estado: estado || 'EN TRANSITO',
          rowIndex: i + 1
        });
      }
    }
    
    Logger.log('✅ Despachos pendientes encontrados: ' + despachos.length);
    
    var result = {
      success: true,
      despachos: despachos
    };
    
    // Validar que el resultado no sea null/undefined antes de retornar (aunque JS retorna referencia)
    Logger.log('Retornando result: ' + JSON.stringify(result));
    return result;
    
  } catch (e) {
    Logger.log('ERROR en getDespachosPendientesEntrega: ' + e.message);
    return { success: false, error: String(e.message) };
  }
}

/**
 * Marca una N.V como entregada de forma inmediata
 * @param {string} notaVenta - Número de nota de venta
 * @param {string} usuario - Usuario que marca la entrega
 * @returns {Object} - {success, error}
 */
/**
 * Marca una N.V como entregada de forma inmediata
 * Sincroniza estado en: Despachos, N.V DIARIAS y Entregas
 * @param {string} notaVenta - Número de nota de venta
 * @param {string} usuario - Usuario que marca la entrega
 * @returns {Object} - {success, error}
 */
function marcarEntregadoInmediato(notaVenta, usuario) {
  try {
    Logger.log('=== MARCAR ENTREGADO INMEDIATO ===');
    Logger.log('N.V: ' + notaVenta + ' | Usuario: ' + usuario);
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var fechaEntrega = new Date();
    var filasActualizadas = 0;
    var COL = COL_ENTREGAS_DESPACHO;
    
    // 1. Actualizar en hoja Despachos
    var sheetDespachos = ss.getSheetByName('Despachos') || ss.getSheetByName('DESPACHO') || ss.getSheetByName('DESPACHOS');
    if (sheetDespachos) {
      var dataDespachos = sheetDespachos.getDataRange().getValues();
      for (var i = 1; i < dataDespachos.length; i++) {
        if (String(dataDespachos[i][COL.N_NV]).trim() === notaVenta) {
          // Actualizar Estado (Col O)
          sheetDespachos.getRange(i + 1, COL.ESTADO + 1).setValue('ENTREGADO');
          filasActualizadas++;
          Logger.log('✅ Actualizado en DESPACHOS fila ' + (i + 1));
        }
      }
    }
    
    // 2. Actualizar en N.V DIARIAS
    var sheetMaster = ss.getSheetByName('N.V DIARIAS');
    if (sheetMaster) {
      var dataMaster = sheetMaster.getDataRange().getValues();
      for (var j = 1; j < dataMaster.length; j++) {
        if (String(dataMaster[j][1]).trim() === notaVenta) {
          sheetMaster.getRange(j + 1, 3).setValue('ENTREGADO');
          filasActualizadas++;
        }
      }
      Logger.log('✅ Actualizado en N.V DIARIAS');
    }

    // 3. Actualizar en Entregas (Si existe)
    var sheetEntregas = ss.getSheetByName('Entregas') || ss.getSheetByName('ENTREGAS');
    if (sheetEntregas) {
      var dataEntregas = sheetEntregas.getDataRange().getValues();
      for (var k = 1; k < dataEntregas.length; k++) {
        // Asumiendo Col A es N.V
        if (String(dataEntregas[k][0]).trim() === notaVenta) {
             // Actualizar Estado (Col F = 6) y Fecha (Col J = 10)
             // Indices son 0-based, getRange es 1-based
             // Col F is index 5 -> range column 6
             // Col J is index 9 -> range column 10
             sheetEntregas.getRange(k + 1, 6).setValue('ENTREGADO');
             sheetEntregas.getRange(k + 1, 10).setValue(fechaEntrega);
             Logger.log('✅ Actualizado en ENTREGAS fila ' + (k + 1));
             filasActualizadas++;
        }
      }
    }
    
    SpreadsheetApp.flush();
    
    // 4. Invalidar caché
    invalidateNVCache();
    
    Logger.log('=== ENTREGA MARCADA EXITOSAMENTE ===');
    Logger.log('Filas actualizadas: ' + filasActualizadas);
    
    return {
      success: true,
      mensaje: 'N.V ' + notaVenta + ' marcada como ENTREGADA',
      filasActualizadas: filasActualizadas
    };
    
  } catch (e) {
    Logger.log('ERROR en marcarEntregadoInmediato: ' + e.message);
    return { success: false, error: e.message };
  }
}

/**
 * Obtiene estadísticas del módulo de entregas
 * @returns {Object} - {success, pendientes, entregados, bultosEntregados}
 */
function getStatsEntregas() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var stats = {
      pendientes: 0,
      entregados: 0,
      bultosEntregados: 0
    };
    
    var COL = COL_ENTREGAS_DESPACHO;
    
    // Contar desde DESPACHOS
    var sheetDespachos = ss.getSheetByName('Despachos') || ss.getSheetByName('DESPACHO') || ss.getSheetByName('DESPACHOS');
    if (sheetDespachos && sheetDespachos.getLastRow() > 1) {
      var data = sheetDespachos.getDataRange().getValues();
      var nvContadas = {};
      
      for (var i = 1; i < data.length; i++) {
        var nv = String(data[i][COL.N_NV] || '').trim();
        var estado = String(data[i][COL.ESTADO] || '').toUpperCase();
        var bultos = Number(data[i][COL.BULTOS]) || 0;
        
        if (!nv || nvContadas[nv]) continue;
        nvContadas[nv] = true;
        
        if (estado.indexOf('ENTREGADO') !== -1) {
          stats.entregados++;
          stats.bultosEntregados += bultos;
        } else {
          stats.pendientes++;
        }
      }
    }
    
    return {
      success: true,
      pendientes: stats.pendientes,
      entregados: stats.entregados,
      bultosEntregados: stats.bultosEntregados
    };
    
  } catch (e) {
    Logger.log('ERROR en getStatsEntregas: ' + e.message);
    return { success: false, error: e.message };
  }
}
// ==================== FUNCIONES DE SESIÓN Y USUARIO ====================

// NOTA: getUserBySession removida de Code.gs - usar version de Auth.gs que lee de hoja SESIONES
function getUserBySessionFallback(sessionId) {
  if (!sessionId) return null;
  try {
    var raw = PropertiesService.getUserProperties().getProperty('SESSION_' + sessionId);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch(e) {
    return null;
  }
}

function getSessionConfig() {
  return {
    timeout: 3600000 // 1 hora
  };
}
