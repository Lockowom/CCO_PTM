/**
 * DireccionesAPI.gs
 * Backend optimizado usando TextFinder (Motor de búsqueda nativo)
 * Ideal para hojas grandes sin saturar la memoria
 */

// Configuración de columnas (Indices basados en 0)
var COL_DIR = {
  RAZON_SOCIAL: 1,    // Col 2
  NOMBRE: 2,          // Col 3
  RUT: 5,             // Col 6
  REGION: 8,          // Col 9
  CIUDAD: 9,          // Col 10
  COMUNA: 10,         // Col 11
  DIRECCION: 11,      // Col 12
  NUM_DIRECC: 12,     // Col 13
  EMAIL: 16,          // Col 17
  TELEFONO_1: 18,     // Col 19
  TELEFONO_2: 20,     // Col 21
  TIPO_TRANSPORTE: 71 // Col 72
};

/**
 * Busca direcciones usando TextFinder (Nativo y Rápido)
 */
function buscarDirecciones(termino) {
  var inicio = new Date();
  
  try {
    if (!termino || termino.length < 2) {
      return { success: true, resultados: [] };
    }
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Direcciones');
    
    if (!sheet) return { success: false, error: 'Hoja Direcciones no encontrada' };
    
    // Usar TextFinder para buscar en toda la hoja
    var finder = sheet.createTextFinder(termino).useRegularExpression(false);
    var matches = finder.findAll();
    
    var resultados = [];
    var filasProcesadas = {}; // Evitar duplicados si encuentra el término en varias columnas de la misma fila
    
    // Limitar a 50 resultados para velocidad
    var maxResultados = 50;
    var count = 0;
    
    // Recorrer coincidencias de atrás hacia adelante (a veces es mejor) o normal
    for (var i = 0; i < matches.length; i++) {
      if (count >= maxResultados) break;
      
      var row = matches[i].getRow();
      
      // Saltar encabezados
      if (row <= 1) continue;
      
      // Si ya procesamos esta fila, saltar
      if (filasProcesadas[row]) continue;
      
      filasProcesadas[row] = true;
      
      // Leer toda la fila de una vez para extraer datos
      // Optimizamos leyendo solo el rango de esa fila
      // Nota: Esto hace muchas llamadas de lectura si hay muchos matches dispersos.
      // Mejor estrategia: Obtener los índices de fila, ordenarlos y leer en bloque si están cerca,
      // o leer la fila individualmente si son pocos.
      
      var datosFila = sheet.getRange(row, 1, 1, 72).getValues()[0];
      
      resultados.push({
        rs: datosFila[COL_DIR.RAZON_SOCIAL],
        n: datosFila[COL_DIR.NOMBRE],
        r: datosFila[COL_DIR.RUT],
        reg: datosFila[COL_DIR.REGION],
        c: datosFila[COL_DIR.CIUDAD],
        com: datosFila[COL_DIR.COMUNA],
        d: datosFila[COL_DIR.DIRECCION],
        num: datosFila[COL_DIR.NUM_DIRECC],
        em: datosFila[COL_DIR.EMAIL],
        t1: datosFila[COL_DIR.TELEFONO_1],
        t2: datosFila[COL_DIR.TELEFONO_2],
        tt: datosFila[COL_DIR.TIPO_TRANSPORTE]
      });
      
      count++;
    }
    
    var fin = new Date();
    return {
      success: true,
      resultados: resultados,
      tiempo: (fin - inicio) / 1000
    };
    
  } catch (e) {
    return { success: false, error: e.message };
  }
}

/**
 * Función legacy para mantener compatibilidad si el frontend llama a obtenerMaestro
 * pero redirige a búsqueda vacía para no cargar nada al inicio.
 */
function obtenerMaestroDirecciones() {
  return { success: true, resultados: [], mensaje: "Modo Búsqueda On-Demand Activo" };
}
