/**
 * SCRIPT DE SINCRONIZACIÓN (V7 - MULTI-SUCURSALES)
 * Permite múltiples direcciones para un mismo RUT.
 * Borra todo lo antiguo y carga todo lo nuevo tal cual está en la hoja.
 */

var SUPABASE_URL = 'https://vtrtyzbgpsvqwbfoudaf.supabase.co'; 
var SUPABASE_KEY = 'sb_publishable_E98rNjBu7rG9mLjgI68sAw_Wr2EIp-f'; 

function sincronizarDirecciones() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Direcciones");
  if (!sheet) {
    Logger.log("Error: No se encontró la hoja 'Direcciones'");
    return;
  }

  // 1. BORRAR TODO (Tabla rasa)
  Logger.log("Limpiando base de datos...");
  var deleteOptions = {
    method: 'delete',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': 'Bearer ' + SUPABASE_KEY
    },
    muteHttpExceptions: true
  };
  
  // Borra todos los registros (donde ID no sea nulo)
  UrlFetchApp.fetch(SUPABASE_URL + '/rest/v1/tms_direcciones?id=neq.00000000-0000-0000-0000-000000000000', deleteOptions);


  // 2. CARGAR TODO (Sin filtrar duplicados)
  var data = sheet.getDataRange().getValues();
  var records = [];
  
  // Empezar en fila 1 para saltar encabezados
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var rut = String(row[5]).trim();
    
    // Solo validamos que tenga RUT, pero permitimos que se repita
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

  Logger.log("Cargando " + records.length + " direcciones (incluyendo sucursales)...");

  var batchSize = 100;
  var successCount = 0;
  var errorCount = 0;
  
  for (var j = 0; j < records.length; j += batchSize) {
    var batch = records.slice(j, j + batchSize);
    
    var options = {
      method: 'post',
      contentType: 'application/json',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_KEY,
        'Prefer': 'return=minimal'
      },
      payload: JSON.stringify(batch),
      muteHttpExceptions: true
    };
    
    try {
      var response = UrlFetchApp.fetch(SUPABASE_URL + '/rest/v1/tms_direcciones', options);
      
      if (response.getResponseCode() >= 200 && response.getResponseCode() < 300) {
         successCount += batch.length;
         Logger.log("Lote " + (j/batchSize + 1) + " OK");
      } else {
         errorCount += batch.length;
         Logger.log("Error Lote " + (j/batchSize + 1) + ": " + response.getContentText());
      }
    } catch (e) {
      errorCount += batch.length;
      Logger.log("Error Red: " + e.message);
    }
    
    Utilities.sleep(100);
  }
  
  Logger.log("=== FINALIZADO ===");
  Logger.log("Total Cargados: " + successCount);
}
