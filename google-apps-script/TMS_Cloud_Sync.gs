/**
 * TMS Cloud Sync
 * Sincronizador de Google Sheets hacia Base de Datos Externa (Supabase/Postgres)
 * 
 * @fileoverview Script de ingestión de datos para migración híbrida
 */

const SYNC_CONFIG = {
  // En producción, estas credenciales deben ir en ScriptProperties
  API_URL: PropertiesService.getScriptProperties().getProperty('API_URL') || 'https://vtrtyzbgpsvqwbfoudaf.supabase.co/rest/v1',
  API_KEY: PropertiesService.getScriptProperties().getProperty('API_KEY') || 'sb_publishable_E98rNjBu7rG9mLjgI68sAw_Wr2EIp-f',
  BATCH_SIZE: 1000 // Aumentado de 50 a 1000 para procesar más rápido
};

/**
 * Función Principal: Sincroniza TODAS las tablas clave
 * Configurar este Trigger cada 15 min.
 */
function syncAllToCloud() {
  console.log('Iniciando sincronización masiva...');
  
  // Procesar por lotes (Chunks) hasta terminar con todos los pendientes
  // NOTA: Google Apps Script tiene límite de 6 min. Si hay 6000 filas, 
  // procesaremos las que alcancemos en ese tiempo. El trigger de 15 min continuará el trabajo.
  
  processSheetUntilLimit('Entregas', 'tms_entregas', mapEntregas);
  processSheetUntilLimit('N.V DIARIAS', 'tms_nv_diarias', mapNVDiarias);
  processSheetUntilLimit('Partidas', 'tms_partidas', mapPartidas);
  processSheetUntilLimit('Series', 'tms_series', mapSeries);
  processSheetUntilLimit('Farmapack', 'tms_farmapack', mapFarmapack);
  processSheetUntilLimit('Peso', 'tms_pesos', mapPeso);
  processSheetUntilLimit('Ubicaciones', 'tms_ubicaciones_historial', mapUbicaciones);
  processSheetUntilLimit('Inventario', 'tms_inventario_resumen', mapInventarioResumen); // NUEVO
  
  console.log('Ciclo de sincronización finalizado.');
}

/**
 * Procesa una hoja completa en lotes hasta que no queden pendientes o se acabe el tiempo seguro
 */
function processSheetUntilLimit(sheetName, tableName, mapFunction) {
  const START_TIME = new Date().getTime();
  const MAX_EXECUTION_TIME = 280000; // 4.5 minutos (margen de seguridad para límite de 6 min)

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      console.warn(`Hoja '${sheetName}' no encontrada.`);
      return;
    }

    const lastRow = sheet.getLastRow();
    const lastCol = sheet.getLastColumn();

    if (lastRow <= 1) {
       console.log(`[${sheetName}] Hoja vacía o solo con encabezados.`);
       return;
    }

    // Leer encabezados y datos
    // Optimización: Leer solo lo necesario si es muy grande, pero getDataRange es robusto
    const data = sheet.getRange(1, 1, lastRow, lastCol).getValues();
    const headers = data[0];
    
    console.log(`[${sheetName}] Filas totales: ${data.length}. Columnas: ${headers.join(', ')}`);
    
    // Buscar o crear columna SYNC_STATUS
    let syncColIdx = headers.indexOf('SYNC_STATUS');
    if (syncColIdx === -1) {
      syncColIdx = headers.length;
      sheet.getRange(1, syncColIdx + 1).setValue('SYNC_STATUS');
      // Expandir data en memoria para manejar la nueva columna virtualmente
      // (aunque en el array 'data' original no existirá, lo manejamos con cuidado)
    }

    // Bucle de procesamiento por lotes
    let totalProcessed = 0;
    
    while (true) {
      // Chequear tiempo límite para evitar timeout de Google
      if (new Date().getTime() - START_TIME > MAX_EXECUTION_TIME) {
        console.warn(`[${sheetName}] Tiempo límite alcanzado. Se continuará en la próxima ejecución.`);
        break;
      }

      // Filtrar índices de filas pendientes
      const pendingIndices = [];
      for (let i = 1; i < data.length; i++) {
         // Verificar status. Si la columna no existía en data original, es undefined (pendiente)
         const status = (syncColIdx < data[i].length) ? data[i][syncColIdx] : undefined;
         
         if (status !== 'OK') {
             pendingIndices.push(i);
         }
      }
      
      if (pendingIndices.length === 0) {
          console.log(`[${sheetName}] No hay registros pendientes de sincronización.`);
          break;
      }

      const chunks = [];
      let currentChunk = [];
      let currentIndices = [];
      
      let invalidCount = 0;

      for (let i = 0; i < pendingIndices.length; i++) {
        const rowIndex = pendingIndices[i];
        const row = data[rowIndex];
        
        const dbObj = mapFunction(row, headers);
        if (isValidRecord(dbObj)) {
           currentChunk.push(dbObj);
           currentIndices.push(rowIndex + 1); // 1-based index for Sheet
        } else {
           invalidCount++;
           // Opcional: Loguear primer error para debug
           if (invalidCount === 1) console.log(`[${sheetName}] Registro inválido detectado en fila ${rowIndex+1}. Ejemplo:`, JSON.stringify(dbObj));
        }
        
        if (currentChunk.length >= SYNC_CONFIG.BATCH_SIZE) {
           chunks.push({ data: currentChunk, indices: currentIndices });
           currentChunk = [];
           currentIndices = [];
        }
      }
      
      if (invalidCount > 0) {
          console.warn(`[${sheetName}] Se ignoraron ${invalidCount} registros por datos incompletos (Faltan claves obligatorias).`);
      }
      
      // Agregar el último pedazo si quedó algo
      if (currentChunk.length > 0) {
         chunks.push({ data: currentChunk, indices: currentIndices });
      }
      
      console.log(`[${sheetName}] Se encontraron ${chunks.length} lotes para enviar (Total registros válidos: ${pendingIndices.length - invalidCount}).`);
      
      // Procesar chunks uno por uno
      for (const chunk of chunks) {
         // Chequear tiempo de nuevo
         if (new Date().getTime() - START_TIME > MAX_EXECUTION_TIME) {
            console.warn(`[${sheetName}] Pausando sincronización por tiempo límite.`);
            return; // Salir de la función completa
         }

         const uniqueRows = [];
         const seenKeys = new Set();
         const uniqueIndices = [];
         
         // Filtrar duplicados internos del chunk
         for(let k=0; k<chunk.data.length; k++) {
            const rec = chunk.data[k];
            const key = getCompositeKey(rec, tableName);
            if (key && !seenKeys.has(key)) {
               seenKeys.add(key);
               uniqueRows.push(rec);
               uniqueIndices.push(chunk.indices[k]);
            } else {
               // Duplicado interno, marcar igual para limpiar
               uniqueIndices.push(chunk.indices[k]); 
            }
         }
         
         if (uniqueRows.length > 0) {
            const success = sendBatchToSupabase(tableName, uniqueRows);
            if (success) {
               markRowsAsSynced(sheet, chunk.indices, syncColIdx + 1);
               totalProcessed += uniqueRows.length;
               console.log(`[${sheetName}] Lote procesado: ${uniqueRows.length} registros.`);
            } else {
               console.error(`[${sheetName}] Error en lote. Saltando.`);
            }
         } else {
            // Solo duplicados
            markRowsAsSynced(sheet, chunk.indices, syncColIdx + 1);
         }
      }
      
      // Si llegamos aquí, terminamos todos los chunks de esta hoja
      break; 
    }
    
    console.log(`[${sheetName}] Finalizado. Total procesados hoy: ${totalProcessed}.`);
    
  } catch (e) {
    console.error(`Error procesando hoja ${sheetName}: ${e.toString()}`);
  }
}

/**
 * Función antigua deprecada, reemplazada por processSheetUntilLimit
 */
function syncSheetToTable(sheetName, tableName, mapFunction) {
   processSheetUntilLimit(sheetName, tableName, mapFunction);
}

/**
 * Validar si el registro tiene datos mínimos
 */
function isValidRecord(obj) {
  // Validación flexible según el tipo de objeto
  if (obj.nv) return true; // Notas de Venta / Entregas
  if (obj.lote) return true; // Farmapack
  if (obj.serie) return true; // Series
  if (obj.partida) return true; // Partidas
  if (obj.codigo_producto) return true; // Peso, Ubicaciones
  
  return false;
}

function mapPeso(row, headers) {
  // Asumimos estructura: Codigo(0), Descripcion(1), Peso(2), Largo(3), Ancho(4), Alto(5)
  return {
    codigo_producto: String(row[0]).trim(),
    descripcion: String(row[1]).trim(),
    peso_unitario: parseFloat(String(row[2]).replace(',', '.')) || 0,
    largo: parseFloat(String(row[3]).replace(',', '.')) || 0,
    ancho: parseFloat(String(row[4]).replace(',', '.')) || 0,
    alto: parseFloat(String(row[5]).replace(',', '.')) || 0
  };
}

function mapUbicaciones(row, headers) {
  // Estructura Ubicaciones según LotesSeries.gs:
  // 0: Ubicacion, 1: Codigo, 2: Serie, 3: Partida, 4: Pieza, 5: Venc, 6: Talla, 7: Color, 8: Cant, 9: Desc
  return {
    ubicacion: String(row[0]).trim(),
    codigo_producto: String(row[1]).trim(),
    serie: String(row[2]).trim(),
    partida: String(row[3]).trim(),
    pieza: String(row[4]).trim(),
    fecha_venc: row[5] instanceof Date ? row[5] : null,
    cantidad: parseFloat(String(row[8]).replace(',', '.')) || 0,
    descripcion: String(row[9]).trim(),
    usuario: String(row[11] || 'Sistema')
  };
}

// ============================================================================
// MAPEOS ESPECÍFICOS POR HOJA
// ============================================================================

function mapEntregas(row, headers) {
  const getVal = (keyPart) => {
    const idx = headers.findIndex(h => h.toString().toUpperCase().trim() === keyPart.toUpperCase() || h.toString().toUpperCase().includes(keyPart.toUpperCase()));
    return idx >= 0 ? row[idx] : null;
  };

  return {
    nv: getVal('N.V') || getVal('NV') || getVal('VENTA'),
    cliente: getVal('CLIENTE') || getVal('RECEPTOR'),
    direccion: getVal('DIRECCION'),
    bultos: parseInt(getVal('BULTOS')) || 0,
    estado: getVal('ESTADO') || 'PENDIENTE',
    latitud: getVal('LAT') || null,
    longitud: getVal('LON') || null,
    fecha_creacion: new Date().toISOString()
  };
}

function mapNVDiarias(row, headers) {
  // ESTRATEGIA HÍBRIDA ROBUSTA:
  // 1. Intentar buscar la columna por nombre (para tolerar cambios en el Excel).
  // 2. Si no se encuentra el nombre, usar el índice fijo del Legacy (A, B, C...).
  
  const getIdx = (nombres, defaultIdx) => {
      for (const nombre of nombres) {
          const idx = headers.findIndex(h => String(h).trim().toUpperCase() === nombre.toUpperCase());
          if (idx !== -1) return idx;
      }
      return defaultIdx;
  };

  // Definir índices
  const idxNV = getIdx(['N.Venta', 'N.V', 'Nota de Venta'], 1); // Default: Col B (1)
  const idxFecha = getIdx(['Fecha Entrega N.Venta', 'Fecha'], 0); // Default: Col A (0)
  const idxEstado = getIdx(['Estado', 'Status'], 2); // Default: Col C (2)
  const idxCliente = getIdx(['Nombre Cliente', 'Cliente'], 4); // Default: Col E (4)
  const idxVendedor = getIdx(['Nombre Vendedor', 'Vendedor'], 6); // Default: Col G (6)
  const idxCod = getIdx(['Cod.Producto', 'Cod. Producto', 'Codigo'], 8); // Default: Col I (8)
  const idxDesc = getIdx(['Descripcion Producto', 'Descripcion'], 9); // Default: Col J (9)
  const idxUnidad = getIdx(['Unidad Medida', 'Unidad'], 10); // Default: Col K (10)
  const idxCant = getIdx(['Pedido', 'Cantidad', 'Cant'], 11); // Default: Col L (11)

  let nvValue = row[idxNV];
  
  // CORRECCIÓN DE DATOS BASURA:
   // Si la NV es un número muy pequeño o coincide con la cantidad, es probable que sea un error.
   // Las NVs válidas actuales parecen estar en el rango 90000+.
   
   const nvNum = Number(nvValue);
   const cantNum = parseFloat(row[idxCant]) || 0;
   
   // Condición de error: NV es numérico Y (es menor a 20000 O es igual a la cantidad)
   if (nvValue && !isNaN(nvNum) && (nvNum < 20000 || nvNum === cantNum)) {
       // Intento de recuperación: Buscar en toda la fila un valor que parezca una NV real (90000+)
       let foundNV = null;
       
       // Barrido por todas las celdas de la fila
       for (let k = 0; k < row.length; k++) {
           const val = row[k];
           if (val && (typeof val === 'number' || (typeof val === 'string' && /^\d+$/.test(val)))) {
               const valNum = Number(val);
               // Criterio heurístico: NV válida está entre 50000 y 999999 y NO es igual a la cantidad detectada
               if (valNum >= 50000 && valNum < 999999 && valNum !== cantNum) {
                   foundNV = valNum;
                   break; // Encontramos un candidato fuerte
               }
           }
       }

       if (foundNV) {
           console.warn(`[Auto-Fix] NV corregida de '${nvValue}' a '${foundNV}' (encontrado en la fila).`);
           nvValue = foundNV;
       } else {
           // Si no encontramos una NV válida, es probable que sea un registro basura o mal formado.
           // Opción A: Ignorarlo (return null)
           // Opción B: Dejarlo pasar (el usuario lo verá mal)
           // Opción C: Si es igual a cantidad, casi seguro es basura, lo ignoramos para no ensuciar.
           if (nvNum === cantNum && nvNum > 0) {
              console.warn(`[Skip] Registro ignorado: NV '${nvValue}' es idéntica a la cantidad. Probable error de fila desplazada.`);
              return null;
           }
       }
   }

  // Validación básica: Si no hay NV, el registro no es válido
  if (!nvValue) return null;

  let codProd = row[idxCod]; 
  const desc = row[idxDesc]; 

  // Fallback para código de producto si está vacío
  if (!codProd) {
     if (desc) {
        codProd = 'GEN-' + desc.substring(0, 10).replace(/\s+/g, '');
     } else {
        codProd = 'UNKNOWN-' + new Date().getTime(); 
     }
  }

  return {
    nv: nvValue, 
    fecha_emision: formatDateForDb(row[idxFecha]), 
    cliente: row[idxCliente], 
    vendedor: row[idxVendedor], 
    codigo_producto: codProd, 
    descripcion_producto: desc,
    unidad: row[idxUnidad] || 'UN', 
    cantidad: parseFloat(row[idxCant]) || 0, 
    precio_unitario: 0, 
    neto: 0, 
    estado: row[idxEstado] || 'PENDIENTE' 
  };
}

function mapPartidas(row, headers) {
  // Mapeo EXACTO por posición de columna según especificación del usuario
  // A=0: Cod, B=1: Prod, C=2: UM, D=3: Lote, E=4: Venc, F=5: Disp, G=6: Res, H=7: Trans, I=8: Cons, J=9: Stock
  
  const lote = String(row[3] || '').trim() || 'SIN_LOTE';
  
  return {
    partida: lote, 
    codigo_producto: String(row[0] || '').trim(),
    producto: String(row[1] || '').trim(), 
    unidad_medida: String(row[2] || '').trim(),
    fecha_vencimiento: formatDateForDb(row[4]),
    disponible: parseFloat(row[5]) || 0,     
    reserva: parseFloat(row[6]) || 0,         
    transitoria: parseFloat(row[7]) || 0,     
    consignacion: parseFloat(row[8]) || 0,    
    stock_total: parseFloat(row[9]) || 0
    // Eliminado 'ubicacion' y 'estado' para coincidir exactamente con la tabla SQL
  };
}

function mapSeries(row, headers) {
  // Mapeo EXACTO por posición de columna
  // A=0: Cod, B=1: Prod, C=2: UM, D=3: Serie, E=4: Disp, F=5: Res, G=6: Trans, H=7: Cons, I=8: Stock
  
  return {
    codigo_producto: String(row[0] || '').trim(),
    producto: String(row[1] || '').trim(),
    unidad_medida: String(row[2] || '').trim(),
    serie: String(row[3] || '').trim(),
    disponible: parseFloat(row[4]) || 0,
    reserva: parseFloat(row[5]) || 0,
    transitoria: parseFloat(row[6]) || 0,
    consignacion: parseFloat(row[7]) || 0,
    stock_total: parseFloat(row[8]) || 0,
    estado: 'EN_BODEGA',
    ubicacion_actual: null 
  };
}

function mapFarmapack(row, headers) {
  // Mapeo EXACTO por posición de columna
  // A=0: Cod, B=1: Prod, C=2: UM, D=3: Lote, E=4: Disp, F=5: Res, G=6: Trans, H=7: Cons, I=8: Stock
  
  return {
    codigo_producto: String(row[0] || '').trim(),
    producto: String(row[1] || '').trim(),
    unidad_medida: String(row[2] || '').trim(),
    lote: String(row[3] || '').trim(),
    disponible: parseFloat(row[4]) || 0,      
    reserva: parseFloat(row[5]) || 0,         
    transitoria: parseFloat(row[6]) || 0,     
    consignacion: parseFloat(row[7]) || 0,    
    stock_total: parseFloat(row[8]) || 0
    // Eliminado 'condicion_temperatura' y 'estado_calidad' para evitar errores si no están en esquema
  };
}

function mapInventarioResumen(row, headers) {
  // Mapeo EXACTO Hoja Inventario (A-H)
  // A=0: Cod, B=1: Prod, C=2: UM, D=3: Disp, E=4: Res, F=5: Trans, G=6: Cons, H=7: Stock
  
  return {
    codigo_producto: String(row[0] || '').trim(),
    producto: String(row[1] || '').trim(),
    unidad_medida: String(row[2] || '').trim(),
    disponible: parseFloat(row[3]) || 0,
    reserva: parseFloat(row[4]) || 0,
    transitoria: parseFloat(row[5]) || 0,
    consignacion: parseFloat(row[6]) || 0,
    stock_total: parseFloat(row[7]) || 0
  };
}

// ============================================================================
// HELPERS GENERALES
// ============================================================================

function formatDateForDb(dateVal) {
  if (!dateVal) return null;
  if (dateVal instanceof Date) return dateVal.toISOString();
  // Intentar parsear si es string
  try {
    return new Date(dateVal).toISOString();
  } catch (e) {
    return null;
  }
}

/**
 * Envía datos a Supabase vía REST API
 */
function sendBatchToSupabase(table, records) {
  const url = `${SYNC_CONFIG.API_URL}/${table}`;
  
  const options = {
    method: 'post',
    headers: {
      'apikey': SYNC_CONFIG.API_KEY,
      'Authorization': `Bearer ${SYNC_CONFIG.API_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates' // Upsert: Actualiza si ya existe el ID
    },
    payload: JSON.stringify(records),
    muteHttpExceptions: true
  };

  try {
    // Modificación clave: Agregar ON CONFLICT para PostgreSQL
    // Aunque Supabase dice 'Prefer: resolution=merge-duplicates', a veces falla si no se especifica el índice de conflicto en la URL
    // Intentaremos usar la opción 'on_conflict' en la URL query params
    const conflictTarget = getConflictTarget(table);
    const finalUrl = `${url}?on_conflict=${conflictTarget}`;
    
    const response = UrlFetchApp.fetch(finalUrl, options);
    const code = response.getResponseCode();
    
    if (code >= 200 && code < 300) {
      return true;
    } else {
      console.error(`Error API Supabase (${table}):`, response.getContentText());
      return false;
    }
  } catch (e) {
    console.error('Error de conexión:', e);
    return false;
  }
}

/**
 * Helper para obtener la columna de conflicto según la tabla
 */
function getConflictTarget(table) {
  switch (table) {
    // NV Diarias ahora usa clave compuesta (nv, codigo_producto)
    // Supabase necesita el nombre de la restricción UNIQUE o las columnas separadas por coma
    case 'tms_nv_diarias': return 'nv,codigo_producto'; 
    case 'tms_partidas': return 'codigo_producto,partida'; // NUEVO: Clave compuesta para inventario
    case 'tms_series': return 'serie';
    case 'tms_entregas': return 'nv';
    case 'tms_farmapack': return 'codigo_producto,lote'; 
    case 'tms_inventario_resumen': return 'codigo_producto';
    default: return 'id';
  }
}

/**
 * Genera una clave única compuesta para filtrar duplicados en memoria
 */
function getCompositeKey(record, table) {
  if (table === 'tms_nv_diarias') {
    return `${record.nv}_${record.codigo_producto}`;
  }
  if (table === 'tms_partidas') {
    // Clave compuesta para partidas: Producto + Lote
    return `${record.codigo_producto}_${record.partida}`;
  }
  if (table === 'tms_farmapack') {
    return `${record.codigo_producto}_${record.lote}`;
  }
  if (table === 'tms_inventario_resumen') {
    return record.codigo_producto;
  }
  // Para las demás tablas, usamos la lógica simple
  const keyField = getConflictTarget(table);
  return record[keyField];
}

/**
 * Marca las filas como sincronizadas en el Sheet
 */
function markRowsAsSynced(sheet, indices, colNum) {
  indices.forEach(rowIndex => {
    sheet.getRange(rowIndex, colNum).setValue('OK');
  });
  SpreadsheetApp.flush();
}

/**
 * ============================================================================
 * DOWN-SYNC: SUPABASE -> GOOGLE SHEETS (Despachos)
 * ============================================================================
 */

/**
 * Sincroniza entregas listas desde Supabase hacia la hoja 'Despachos'
 * Se ejecuta periódicamente para mantener el legacy actualizado.
 */
function syncEntregasToSheets() {
  const SHEET_NAME = 'Despachos'; // Ajustar nombre si es 'DESPACHO' o 'Despachos'
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    console.warn(`Hoja '${SHEET_NAME}' no encontrada. Intentando 'DESPACHO'...`);
    sheet = ss.getSheetByName('DESPACHO');
    if (!sheet) return;
  }

  // 1. Obtener entregas pendientes de sync desde Supabase
  // Buscamos entregas creadas en Web (Packing) que aun no están en Sheets
  const url = `${SYNC_CONFIG.API_URL}/tms_entregas?select=*&sincronizado_desde_sheets=is.null`; // null significa creado en web
  
  const options = {
    method: 'get',
    headers: {
      'apikey': SYNC_CONFIG.API_KEY,
      'Authorization': `Bearer ${SYNC_CONFIG.API_KEY}`
    },
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    const entregasWeb = JSON.parse(response.getContentText());
    
    if (!entregasWeb || entregasWeb.length === 0) {
      console.log("No hay nuevas entregas web para sincronizar a Sheets.");
      return;
    }

    console.log(`Encontradas ${entregasWeb.length} entregas web nuevas.`);
    
    // 2. Leer hoja actual para evitar duplicados (o actualizar)
    const lastRow = sheet.getLastRow();
    const data = lastRow > 1 ? sheet.getRange(2, 1, lastRow - 1, 14).getValues() : [];
    const nvMap = new Map();
    
    // Mapear NVs existentes (Columna H = índice 7)
    data.forEach((row, idx) => {
       const nv = String(row[7]).trim();
       if (nv) nvMap.set(nv, idx + 2); // Guardar número de fila
    });

    // 3. Procesar cada entrega web
    entregasWeb.forEach(entrega => {
       const nv = String(entrega.nv).trim();
       const fila = nvMap.get(nv);
       
       const fechaDocto = new Date(); // O traer de nv_diarias si es posible
       const idDespacho = 'WEB-' + entrega.id.substring(0, 8);
       
       if (fila) {
           // ACTUALIZAR (Solo campos automáticos + Manuales editados en Web)
           sheet.getRange(fila, 5).setValue(entrega.bultos || 1); // E - Bultos
           
           // Si se editaron en web, actualizamos Sheets
           if (entrega.facturas) sheet.getRange(fila, 3).setValue(entrega.facturas); // C - Facturas
           if (entrega.guia) sheet.getRange(fila, 4).setValue(entrega.guia);         // D - Guía
           if (entrega.transportista) sheet.getRange(fila, 7).setValue(entrega.transportista); // G - Transportista
           if (entrega.division) sheet.getRange(fila, 9).setValue(entrega.division); // I - División
           if (entrega.num_envio) sheet.getRange(fila, 12).setValue(entrega.num_envio); // L - N° Envío
           
           console.log(`Actualizada NV ${nv} en fila ${fila}`);
        } else {
           // INSERTAR NUEVA (Respetando estructura Manual/Auto)
           // Mapeo EXACTO a las 14 columnas de Shipping.gs
           const nuevaFila = [
             fechaDocto,                     // A - Fecha Docto (Auto)
             entrega.cliente || '',          // B - Cliente (Auto)
             entrega.facturas || '',         // C - Facturas (MANUAL/WEB)
             entrega.guia || '',             // D - Guía (MANUAL/WEB)
             entrega.bultos || 1,            // E - Bultos (Auto desde Packing)
             'PROPIO',                       // F - Empresa Transporte (MANUAL - Default)
             entrega.transportista || '',    // G - Transportista (MANUAL/WEB)
             nv,                             // H - N° NV (Auto - Clave)
             entrega.division || '',         // I - División (MANUAL/WEB)
             entrega.vendedor || '',         // J - Vendedor (Auto - Si viene en el obj)
             '',                             // K - Fecha Despacho (MANUAL/Proceso)
             entrega.num_envio || '',        // L - N° Envío (MANUAL/WEB)
             idDespacho,                     // M - ID Despacho (Auto)
             'PENDIENTE'                     // N - Estado (Auto)
           ];
           sheet.appendRow(nuevaFila);
           console.log(`Insertada NV ${nv} en Despachos`);
        }
       
       // 4. Marcar como sincronizado en Supabase
       marcarSincronizadoEnSupabase(entrega.id);
    });
    
  } catch (e) {
    console.error("Error en syncEntregasToSheets: " + e.message);
  }
}

function marcarSincronizadoEnSupabase(uuid) {
  const url = `${SYNC_CONFIG.API_URL}/tms_entregas?id=eq.${uuid}`;
  const payload = { sincronizado_desde_sheets: true }; // Usamos este flag como "Ya procesado"
  
  const options = {
    method: 'patch',
    headers: {
      'apikey': SYNC_CONFIG.API_KEY,
      'Authorization': `Bearer ${SYNC_CONFIG.API_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    payload: JSON.stringify(payload)
  };
  
  UrlFetchApp.fetch(url, options);
}
