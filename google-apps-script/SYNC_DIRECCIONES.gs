/**
 * SCRIPT DE SINCRONIZACIÓN (V5 - Corrección Upsert)
 */

var SUPABASE_URL = 'https://vtrtyzbgpsvqwbfoudaf.supabase.co'; 
var SUPABASE_KEY = 'sb_publishable_E98rNjBu7rG9mLjgI68sAw_Wr2EIp-f'; 

function sincronizarDirecciones() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Direcciones");
  if (!sheet) {
    Logger.log("Error: No se encontró la hoja 'Direcciones'");
    return;
  }

  // Leer todos los datos
  var data = sheet.getDataRange().getValues();
  var records = [];

  // Empezar en fila 1 (i=1) para saltar encabezados (fila 0)
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var rut = String(row[5]).trim();
    if (!rut) continue;

    records.push({
      razon_social: row[1],
      nombre: row[2],
      rut: rut,
      region: row[8],
      ciudad: row[9],
      comuna: row[10],
      direccion: row[11],
      telefono_1: String(row[18])
    });
  }

  Logger.log("Encontrados " + records.length + " registros. Iniciando carga...");

  var batchSize = 100;
  var successCount = 0;
  var errorCount = 0;
  
  for (var j = 0; j < records.length; j += batchSize) {
    var batch = records.slice(j, j + batchSize);
    
    // CAMBIO CLAVE: Usamos upsert=true en la URL para que Supabase entienda que debe actualizar si existe
    var endpoint = SUPABASE_URL + '/rest/v1/tms_direcciones?on_conflict=rut';
    
    var options = {
      method: 'post',
      contentType: 'application/json',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_KEY,
        'Prefer': 'resolution=merge-duplicates' // Esto es crucial
      },
      payload: JSON.stringify(batch),
      muteHttpExceptions: true
    };
    
    try {
      var response = UrlFetchApp.fetch(endpoint, options);
      var code = response.getResponseCode();
      
      if (code >= 200 && code < 300) {
         successCount += batch.length;
         Logger.log("Lote " + (j/batchSize + 1) + " enviado: OK");
      } else {
         errorCount += batch.length;
         Logger.log("Error en lote " + (j/batchSize + 1) + ": " + response.getContentText());
      }
    } catch (e) {
      errorCount += batch.length;
      Logger.log("Error red: " + e.message);
    }
    
    Utilities.sleep(200);
  }
  
  Logger.log("=== Sincronización Completada ===");
  Logger.log("Exitosos: " + successCount);
  Logger.log("Errores: " + errorCount);
}
