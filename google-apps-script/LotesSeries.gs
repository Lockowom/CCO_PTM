/**
 * LotesSeries.gs - Módulo de Lotes y Series ULTRA-OPTIMIZADO
 * Usa CacheService para búsquedas instantáneas
 * Buscador: Partidas / Series / Farmapack / Peso / Ubicaciones
 */

// Tiempo de cache: 10 minutos (600 segundos)
var CACHE_TTL = 600;

/**
 * Búsqueda principal - ULTRA RÁPIDA con cache
 */
function buscarLotesSeries(nombreVista, texto, exactMode) {
  var t0 = Date.now();
  
  var CONFIG = {
    Partidas:    { sheets: ["Partidas", "PARTIDAS"], cols: 10, iCod: 0, iDesc: 1 },
    Series:      { sheets: ["Series", "SERIES"],     cols: 9,  iCod: 0, iDesc: 1 },
    Farmapack:   { sheets: ["Farmapack", "FARMAPACK"], cols: 9, iCod: 0, iDesc: 1 },
    Peso:        { sheets: ["peso", "PESO", "Peso"], cols: 7, iCod: 0, iDesc: 1 },
    Ubicaciones: { sheets: ["UBICACIONES", "Ubicaciones"], cols: 10, iCod: 1, iDesc: 9, esUbic: true }
  };

  var cfg = CONFIG[nombreVista];
  if (!cfg) {
    return { hoja: nombreVista, columns: ["Error"], rows: [["Vista no soportada"]], total: 0, ms: 0 };
  }

  // Obtener datos (desde cache o hoja)
  var datos = _obtenerDatosConCache(nombreVista, cfg);
  if (!datos || !datos.rows) {
    return { hoja: nombreVista, columns: ["Error"], rows: [["Sin datos"]], total: 0, ms: Date.now() - t0 };
  }

  // Buscar
  var q = _norm(texto);
  var exact = (exactMode === true);
  var resultado = _buscarEnDatos(datos, q, exact, cfg);
  
  return {
    hoja: nombreVista,
    columns: datos.headers,
    rows: resultado,
    total: resultado.length,
    ms: Date.now() - t0
  };
}

/**
 * Obtiene datos con cache (10 min TTL)
 */
function _obtenerDatosConCache(nombre, cfg) {
  var cache = CacheService.getScriptCache();
  var cacheKey = "LS_" + nombre;
  
  // Intentar desde cache
  var cached = cache.get(cacheKey);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch(e) {}
  }
  
  // Leer de hoja
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = _findSheet(ss, cfg.sheets);
  if (!sh) return null;
  
  var lastRow = sh.getLastRow();
  if (lastRow < 2) return { headers: [], rows: [] };
  
  // Leer SOLO las columnas necesarias para búsqueda + display
  var colsToRead = Math.min(cfg.cols, 10);
  var valores = sh.getRange(1, 1, lastRow, colsToRead).getValues();
  var headers = valores[0].map(function(h) { return String(h); });
  
  // Procesar filas - normalizar para búsqueda rápida
  var rows = [];
  for (var i = 1; i < valores.length; i++) {
    var row = valores[i];
    var codigo = String(row[cfg.iCod] || "");
    var desc = String(row[cfg.iDesc] || "");
    
    rows.push({
      d: row.map(function(c) { return c instanceof Date ? _formatDate(c) : String(c || ""); }),
      c: _norm(codigo),
      p: _norm(desc)
    });
  }
  
  var datos = { headers: headers, rows: rows };
  
  // Guardar en cache (max 100KB por entrada)
  try {
    var json = JSON.stringify(datos);
    if (json.length < 100000) {
      cache.put(cacheKey, json, CACHE_TTL);
    }
  } catch(e) {}
  
  return datos;
}

/**
 * Búsqueda en datos pre-indexados
 */
function _buscarEnDatos(datos, q, exact, cfg) {
  var rows = datos.rows;
  var out = [];
  var limit = 150;
  
  if (!q || q.length < 2) {
    // Sin búsqueda: últimos 50
    var start = Math.max(0, rows.length - 50);
    for (var i = start; i < rows.length; i++) {
      out.push(rows[i].d);
    }
    return out;
  }
  
  // Búsqueda rápida
  for (var j = 0; j < rows.length && out.length < limit; j++) {
    var r = rows[j];
    var match = exact ? 
      (r.c === q || r.p === q) : 
      (r.c.indexOf(q) !== -1 || r.p.indexOf(q) !== -1);
    
    if (match) {
      out.push(r.d);
    }
  }
  
  return out;
}

/**
 * Limpia cache de una hoja específica
 */
function limpiarCache(nombreVista) {
  var cache = CacheService.getScriptCache();
  cache.remove("LS_" + nombreVista);
  return { ok: true, mensaje: "Cache limpiado para " + nombreVista };
}

/**
 * Limpia todo el cache
 */
function limpiarTodoCache() {
  var cache = CacheService.getScriptCache();
  var hojas = ["Partidas", "Series", "Farmapack", "Peso", "Ubicaciones"];
  for (var i = 0; i < hojas.length; i++) {
    cache.remove("LS_" + hojas[i]);
  }
  return { ok: true, mensaje: "Cache limpiado" };
}

/**
 * Helpers
 */
function _findSheet(ss, nombres) {
  for (var i = 0; i < nombres.length; i++) {
    var sh = ss.getSheetByName(nombres[i]);
    if (sh) return sh;
  }
  return null;
}

function _norm(s) {
  if (!s) return "";
  return String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

function _formatDate(d) {
  if (!d) return "";
  try {
    return Utilities.formatDate(d, Session.getScriptTimeZone(), "dd/MM/yyyy");
  } catch(e) {
    return String(d);
  }
}

function _parseNum(v) {
  if (!v) return 0;
  var s = String(v).replace(/\./g, "").replace(/,/g, ".");
  var n = parseFloat(s);
  return isNaN(n) ? 0 : n;
}

/**
 * Registrar ingreso en UBICACIONES
 */
function registrarIngresoLotesSeries(payload) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sh = _findSheet(ss, ["UBICACIONES", "Ubicaciones"]);
    if (!sh) return { ok: false, error: "Hoja no encontrada" };

    sh.appendRow([
      payload.ubicacion || "",
      payload.codigo || "",
      payload.serie || "",
      payload.partida || "",
      payload.pieza || "",
      payload.fechaVenc || "",
      payload.talla || "",
      payload.color || "",
      _parseNum(payload.cantidad),
      payload.descripcion || "",
      new Date(),
      payload.usuario || Session.getActiveUser().getEmail() || "Sistema",
      Utilities.getUuid()
    ]);
    
    // Limpiar cache para reflejar nuevo dato
    limpiarCache("Ubicaciones");
    
    return { ok: true };
  } catch(e) {
    return { ok: false, error: e.message };
  }
}

/**
 * Fechas de actualización
 */
function getFechasActualizacionLS() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var result = {};
  var hojas = ["Partidas", "Series", "Farmapack", "peso"];
  for (var i = 0; i < hojas.length; i++) {
    var sh = ss.getSheetByName(hojas[i]);
    result[hojas[i]] = sh ? "Activa" : "No encontrada";
  }
  return result;
}

// ===== ALIAS =====
function buscarMultiHoja(v, t, e) { return buscarLotesSeries(v, t, e); }
function registrarIngresoUbicaciones(p) { return registrarIngresoLotesSeries(p); }
function getFechasActualizacion() { return getFechasActualizacionLS(); }

/**
 * Precarga cache para todas las hojas (ejecutar manualmente para calentar)
 */
function precalentarCache() {
  var hojas = ["Partidas", "Series", "Farmapack", "Peso", "Ubicaciones"];
  var resultado = [];
  for (var i = 0; i < hojas.length; i++) {
    var t0 = Date.now();
    buscarLotesSeries(hojas[i], "", false);
    resultado.push(hojas[i] + ": " + (Date.now() - t0) + "ms");
  }
  return resultado.join("\n");
}
