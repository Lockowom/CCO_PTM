}
ación:');
    Logger.log(JSON.stringify(result.ubicaciones[0], null, 2));
  } else if (result.success && result.total === 0) {
    Logger.log('⚠️ No se encontraron ubicaciones para este código');
    Logger.log('');
    Logger.log('Posibles causas:');
    Logger.log('1. El código no existe en UBICACIONES');
    Logger.log('2. El código existe pero la cantidad (columna I) es 0');
    Logger.log('3. El código está escrito diferente (mayúsculas, espacios)');
  } else {
    Logger.log('❌ ERROR: ' + result.error);
  }
                ║');
  Logger.log('╚════════════════════════════════════════════════════════╝');
  Logger.log('');
  Logger.log('🔍 Probando código: "' + codigo + '"');
  Logger.log('');
  
  var result = getUbicacionesDisponibles(codigo);
  
  Logger.log('📦 RESULTADO:');
  Logger.log(JSON.stringify(result, null, 2));
  Logger.log('');
  
  if (result.success && result.total > 0) {
    Logger.log('✅ FUNCIONA! Se encontraron ' + result.total + ' ubicaciones');
    Logger.log('');
    Logger.log('Primera ubic   
    Logger.log('');
    Logger.log('═══════════════════════════════════════════════════════');
    
  } catch (e) {
    Logger.log('❌ ERROR: ' + e.message);
    Logger.log('Stack: ' + e.stack);
  }
}

/**
 * TEST RÁPIDO: Prueba getUbicacionesDisponibles con un código específico
 * @param {string} codigo - Código del producto a probar
 */
function TEST_CODIGO_ESPECIFICO(codigo) {
  Logger.log('╔════════════════════════════════════════════════════════╗');
  Logger.log('║   TEST CON CÓDIGO ESPECÍFICO          : 'N/A') + '"');
      Logger.log('   ¿Son EXACTAMENTE iguales?');
    } else {
      Logger.log('');
      Logger.log('✅ HAY ' + coincidencias.length + ' COINCIDENCIAS');
      Logger.log('   El sistema DEBERÍA funcionar para estos productos.');
      Logger.log('');
      Logger.log('🧪 PRUEBA:');
      Logger.log('   Intenta hacer picking de uno de estos códigos:');
      for (var s = 0; s < Math.min(3, coincidencias.length); s++) {
        Logger.log('   - "' + coincidencias[s].codigo + '"');
      }
    }
      Logger.log('   2. La columna I (CANTIDAD_CONTADA) en UBICACIONES tiene valores en 0');
      Logger.log('   3. Los códigos en UBICACIONES no corresponden a los productos en N.V');
      Logger.log('');
      Logger.log('🔧 SOLUCIÓN:');
      Logger.log('   Compara manualmente los códigos mostrados arriba.');
      Logger.log('   Ejemplo de N.V: "' + (codigosNVArray.length > 0 ? codigosNVArray[0] : 'N/A') + '"');
      Logger.log('   Ejemplo de UBICACIONES: "' + (codigosArray.length > 0 ? codigosArray[0] 🎯 DIAGNÓSTICO:');
    Logger.log('═══════════════════════════════════════════════════════');
    
    if (coincidencias.length === 0) {
      Logger.log('');
      Logger.log('❌ PROBLEMA IDENTIFICADO:');
      Logger.log('   NO HAY NINGUNA COINCIDENCIA entre los códigos de N.V DIARIAS');
      Logger.log('   y los códigos en UBICACIONES con stock > 0');
      Logger.log('');
      Logger.log('💡 POSIBLES CAUSAS:');
      Logger.log('   1. Los códigos están escritos diferente (mayúsculas, espacios, guiones)');
 or (var r = 0; r < Math.min(10, noCoinciden.length); r++) {
        var noCoin = noCoinciden[r];
        if (noCoin.enUbicaciones) {
          Logger.log('   ' + (r + 1) + '. "' + noCoin.codigo + '" - SÍ está en UBICACIONES pero stock = ' + noCoin.stockTotal);
        } else {
          Logger.log('   ' + (r + 1) + '. "' + noCoin.codigo + '" - NO está en UBICACIONES');
        }
      }
    }
    
    Logger.log('');
    Logger.log('═══════════════════════════════════════════════════════');
    Logger.log(';
      for (var q = 0; q < Math.min(10, coincidencias.length); q++) {
        var coin = coincidencias[q];
        Logger.log('   ' + (q + 1) + '. "' + coin.codigo + '" - ' + coin.ubicaciones + ' ubicaciones, Stock: ' + coin.stockTotal);
      }
    }
    
    Logger.log('');
    Logger.log('❌ NO COINCIDEN (códigos que NO tienen ubicaciones o stock):');
    Logger.log('   Total: ' + noCoinciden.length);
    
    if (noCoinciden.length > 0) {
      Logger.log('');
      Logger.log('   Primeros 10:');
      fUbicacion ? codigosUbic[codNV2].stockTotal : 0
        });
      }
    }
    
    Logger.log('═══════════════════════════════════════════════════════');
    Logger.log('📊 RESULTADO FINAL:');
    Logger.log('═══════════════════════════════════════════════════════');
    Logger.log('');
    Logger.log('✅ COINCIDENCIAS (códigos que SÍ tienen ubicaciones con stock):');
    Logger.log('   Total: ' + coincidencias.length);
    
    if (coincidencias.length > 0) {
      Logger.log('');
      Logger.log('   Primeros 10:')ientePicking) continue;
      
      var tieneUbicacion = codigosUbic.hasOwnProperty(codNV2);
      var tieneStock = tieneUbicacion && codigosUbic[codNV2].stockTotal > 0;
      
      if (tieneStock) {
        coincidencias.push({
          codigo: codNV2,
          stockTotal: codigosUbic[codNV2].stockTotal,
          ubicaciones: codigosUbic[codNV2].ubicaciones
        });
      } else {
        noCoinciden.push({
          codigo: codNV2,
          enUbicaciones: tieneUbicacion,
          stockTotal: tiene '" - ' + infoNV.apariciones + ' apariciones, Pendiente: ' + infoNV.pendientePicking);
    }
    
    // 3. Verificar coincidencias
    Logger.log('');
    Logger.log('🔍 PASO 5: Verificando coincidencias...');
    Logger.log('');
    
    var coincidencias = [];
    var noCoinciden = [];
    
    for (var p = 0; p < codigosNVArray.length; p++) {
      var codNV2 = codigosNVArray[p];
      var infoNV2 = codigosNV[codNV2];
      
      // Solo verificar productos con PENDIENTE PICKING
      if (!infoNV2.pendNV.length);
    Logger.log('   - Códigos únicos: ' + Object.keys(codigosNV).length);
    Logger.log('   - Productos con estado PENDIENTE PICKING: ' + nvPendientes);
    
    // Mostrar primeros 10 códigos
    Logger.log('');
    Logger.log('📝 PRIMEROS 10 CÓDIGOS EN N.V DIARIAS:');
    var codigosNVArray = Object.keys(codigosNV);
    for (var n = 0; n < Math.min(10, codigosNVArray.length); n++) {
      var codNV = codigosNVArray[n];
      var infoNV = codigosNV[codNV];
      Logger.log((n + 1) + '. "' + codNV +
      if (!codigoNV) continue;
      
      if (!codigosNV[codigoNV]) {
        codigosNV[codigoNV] = {
          codigo: codigoNV,
          apariciones: 0,
          pendientePicking: false,
          primeraFila: m + 2
        };
      }
      
      codigosNV[codigoNV].apariciones++;
      
      if (estado === 'PENDIENTE PICKING') {
        codigosNV[codigoNV].pendientePicking = true;
        nvPendientes++;
      }
    }
    
    Logger.log('✅ Análisis completado:');
    Logger.log('   - Total filas: ' + datastado=' + sampleDataNV[k][2] + ', Código=' + sampleDataNV[k][8]);
    }
    
    Logger.log('');
    Logger.log('🔍 PASO 4: Analizando códigos en N.V DIARIAS...');
    var dataNV = sheetNV.getRange(2, 1, lastRowNV - 1, 12).getValues();
    
    var codigosNV = {};
    var nvPendientes = 0;
    
    for (var m = 0; m < dataNV.length; m++) {
      var codigoNV = String(dataNV[m][8] || '').trim().toUpperCase(); // Columna I
      var estado = String(dataNV[m][2] || '').trim().toUpperCase(); // Columna C
      etNV.getLastRow();
    Logger.log('✅ Hoja encontrada con ' + lastRowNV + ' filas');
    
    if (lastRowNV <= 1) {
      Logger.log('❌ ERROR: La hoja solo tiene encabezados');
      return;
    }
    
    // Leer primeras filas para ver estructura
    Logger.log('');
    Logger.log('📋 ESTRUCTURA DE N.V DIARIAS (primeras 3 filas):');
    var sampleDataNV = sheetNV.getRange(1, 1, Math.min(4, lastRowNV), 12).getValues();
    for (var k = 0; k < sampleDataNV.length; k++) {
      Logger.log('Fila ' + (k + 1) + ': EigosArray.length); j++) {
      var cod = codigosArray[j];
      var info = codigosUbic[cod];
      Logger.log((j + 1) + '. "' + cod + '" - ' + info.ubicaciones + ' ubicaciones, Stock total: ' + info.stockTotal);
    }
    
    // 2. Leer N.V DIARIAS
    Logger.log('');
    Logger.log('📋 PASO 3: Leyendo hoja N.V DIARIAS...');
    var sheetNV = ss.getSheetByName('N.V DIARIAS');
    
    if (!sheetNV) {
      Logger.log('❌ ERROR: Hoja N.V DIARIAS no encontrada');
      return;
    }
    
    var lastRowNV = she Total filas: ' + dataUbic.length);
    Logger.log('   - Códigos únicos: ' + Object.keys(codigosUbic).length);
    Logger.log('   - Ubicaciones con stock > 0: ' + totalConStock);
    Logger.log('   - Ubicaciones con stock = 0: ' + totalSinStock);
    Logger.log('   - Filas sin código: ' + codigosVacios);
    
    // Mostrar primeros 10 códigos
    Logger.log('');
    Logger.log('📝 PRIMEROS 10 CÓDIGOS EN UBICACIONES:');
    var codigosArray = Object.keys(codigosUbic);
    for (var j = 0; j < Math.min(10, codsVacios++;
        continue;
      }
      
      if (!codigosUbic[codigo]) {
        codigosUbic[codigo] = {
          codigo: codigo,
          ubicaciones: 0,
          stockTotal: 0,
          primeraFila: i + 2
        };
      }
      
      codigosUbic[codigo].ubicaciones++;
      codigosUbic[codigo].stockTotal += cantidad;
      
      if (cantidad > 0) {
        totalConStock++;
      } else {
        totalSinStock++;
      }
    }
    
    Logger.log('✅ Análisis completado:');
    Logger.log('   -
    Logger.log('');
    Logger.log('🔍 PASO 2: Analizando códigos en UBICACIONES...');
    var dataUbic = sheetUbic.getRange(2, 1, lastRowUbic - 1, 10).getValues();
    
    var codigosUbic = {};
    var totalConStock = 0;
    var totalSinStock = 0;
    var codigosVacios = 0;
    
    for (var i = 0; i < dataUbic.length; i++) {
      var codigo = String(dataUbic[i][1] || '').trim().toUpperCase(); // Columna B
      var cantidad = Number(dataUbic[i][8]) || 0; // Columna I
      
      if (!codigo) {
        codigo   
    if (lastRowUbic <= 1) {
      Logger.log('❌ ERROR: La hoja solo tiene encabezados');
      return;
    }
    
    // Leer primeras 10 filas para ver la estructura
    Logger.log('');
    Logger.log('📋 ESTRUCTURA DE UBICACIONES (primeras 3 filas):');
    var sampleData = sheetUbic.getRange(1, 1, Math.min(4, lastRowUbic), 10).getValues();
    for (var i = 0; i < sampleData.length; i++) {
      Logger.log('Fila ' + (i + 1) + ': ' + JSON.stringify(sampleData[i]));
    }
    
    // Leer todos los datosg('╚════════════════════════════════════════════════════════╝');
  Logger.log('');
  
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // 1. Leer UBICACIONES
    Logger.log('📦 PASO 1: Leyendo hoja UBICACIONES...');
    var sheetUbic = ss.getSheetByName('UBICACIONES');
    
    if (!sheetUbic) {
      Logger.log('❌ ERROR: Hoja UBICACIONES no encontrada');
      return;
    }
    
    var lastRowUbic = sheetUbic.getLastRow();
    Logger.log('✅ Hoja encontrada con ' + lastRowUbic + ' filas');
 /**
 * TEST_COINCIDENCIA_CODIGOS.gs
 * Prueba específica para verificar por qué no se ven las ubicaciones
 * cuando la hoja tiene 5700 filas con datos
 */

/**
 * TEST ESPECÍFICO: Verifica coincidencia de códigos entre UBICACIONES y N.V DIARIAS
 * Ejecuta esta función para ver EXACTAMENTE qué está pasando
 */
function TEST_COINCIDENCIA_CODIGOS() {
  Logger.log('╔════════════════════════════════════════════════════════╗');
  Logger.log('║   TEST DE COINCIDENCIA DE CÓDIGOS                     ║');
  Logger.lo