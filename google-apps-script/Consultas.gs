/**
 * Consultas.gs
 * Módulo de consultas de despachos
 * Hoja: "DESPACHO"
 * 
 * Columnas a mostrar en orden:
 * 2 (Cliente), 3 (Factura), 4 (Guía), 8 (N° de N/V),
 * 11 (Fecha de Despacho, dd/MM/yyyy),
 * 13 (N° de Envío), 6 (Empresa Transporte),
 * 7 (Transportista)
 * 
 * Filtra por: columnas 2 (Cliente), 3 (Factura),
 * 4 (Guía) y 8 (N° de N/V)
 * 
 * Rango fijo: filas 2 a 19999
 */

const CONSULTAS_HOJA = 'Despachos';     // Nombre exacto de la pestaña
const CONSULTAS_FILA_INICIO = 2;       // Desde la fila 2 empiezan los datos
const CONSULTAS_FILA_FIN = 19999;      // Hasta la fila 19999
const CONSULTAS_NUM_FILAS = CONSULTAS_FILA_FIN - CONSULTAS_FILA_INICIO + 1;

// Columnas a mostrar en orden (basadas en índice 1)
// 1: FECHA DOCTO, 2: CLIENTE, 3: FACTURAS, 4: GUIA, 8: N° NV, 9: DIVISION, 10: VENDEDOR, 11: FECHA DESPACHO, 12: VALOR FLETE, 13: N° DE ENVIO
const CONSULTAS_COLS_MOSTRAR = [1, 2, 3, 4, 8, 9, 10, 11, 12, 13];

/**
 * Filtra datos de despacho por texto de búsqueda
 * @param {string} texto - Texto a buscar
 * @returns {Array} Array de filas que coinciden con la búsqueda
 */
function filtrarConsultas(texto) {
  try {
    // Asegura que texto siempre sea válido
    texto = (texto || '').toString().toLowerCase().trim();
    
    if (texto === '') return [];
    
    const ss = getSpreadsheet();
    const sh = ss.getSheetByName(CONSULTAS_HOJA);
    
    if (!sh) {
      Logger.log('Hoja no encontrada: ' + CONSULTAS_HOJA);
      throw new Error('No existe la hoja "' + CONSULTAS_HOJA + '".');
    }
    
    // Verificar que hay datos
    const lastRow = sh.getLastRow();
    if (lastRow < CONSULTAS_FILA_INICIO) {
      return [];
    }
    
    // Calcular filas a leer
    const filasALeer = Math.min(CONSULTAS_NUM_FILAS, lastRow - CONSULTAS_FILA_INICIO + 1);
    
    // Lee rango fijo A–M (13 columnas)
    const values = sh.getRange(CONSULTAS_FILA_INICIO, 1, filasALeer, 13).getValues();
    
    const resultados = [];
    
    for (let i = 0; i < values.length; i++) {
      const fila = values[i];
      
      // Columnas que se usan para filtrar
      const factura = String(fila[2] || '').toLowerCase(); // C: FACTURAS
      const guia    = String(fila[3] || '').toLowerCase(); // D: GUIA
      const nv      = String(fila[7] || '').toLowerCase(); // H: N° NV
      
      const coincide =
        factura.includes(texto) ||
        guia.includes(texto) ||
        nv.includes(texto);
      
      if (coincide) {
        const filaOut = CONSULTAS_COLS_MOSTRAR.map(function(c) {
          let val = fila[c - 1];
          
          // Formato de fecha corta si es col 1 (FECHA DOCTO) o col 11 (FECHA DESPACHO)
          if ((c === 1 || c === 11) && val instanceof Date) {
            return Utilities.formatDate(val, Session.getScriptTimeZone(), 'dd/MM/yyyy');
          }
          
          return val == null ? '' : String(val);
        });
        
        resultados.push(filaOut);
      }
    }
    
    Logger.log('Consultas: ' + resultados.length + ' resultados para "' + texto + '"');
    
    return resultados.slice(0, 500); // Máximo 500 filas
    
  } catch (err) {
    Logger.log('Error en filtrarConsultas: ' + err.message);
    throw err;
  }
}

/**
 * Obtiene estadísticas de consultas para el dashboard
 * @returns {Object} Estadísticas de despachos
 */
function getConsultasStats() {
  try {
    const ss = getSpreadsheet();
    const sh = ss.getSheetByName(CONSULTAS_HOJA);
    
    if (!sh) {
      return { success: true, total: 0 };
    }
    
    const lastRow = sh.getLastRow();
    const total = Math.max(0, lastRow - 1); // Restar header
    
    return {
      success: true,
      total: total
    };
    
  } catch (error) {
    Logger.log('Error en getConsultasStats: ' + error.message);
    return { success: false, total: 0, error: error.message };
  }
}
