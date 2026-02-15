/**
 * TMS Sync - Synchronization Module
 * Handles synchronization between core system modules and TMS
 * 
 * @fileoverview Sincronización entre módulos WMS/ERP y TMS
 */

/**
 * Sincroniza un despacho generado hacia la tabla de Entregas del TMS
 * Esta función es llamada desde DespachoAPI.gs
 * 
 * @param {string} nVenta - Número de Nota de Venta
 * @param {Object} datosDespacho - Datos del formulario de despacho
 * @returns {Object} Resultado de la operación
 */
function syncDespachoToEntregas(nVenta, datosDespacho) {
  try {
    console.log(`TMS Sync: Sincronizando despacho NV ${nVenta} a Entregas...`);
    
    // 1. Obtener datos de origen (Despachos)
    // Necesitamos leer la fila recién actualizada o usar los datos pasados
    // Para asegurar consistencia, leemos de la hoja Despachos
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheetDespachos = ss.getSheetByName('Despachos') || ss.getSheetByName('DESPACHO');
    
    if (!sheetDespachos) {
      throw new Error('Hoja Despachos no encontrada');
    }
    
    const data = sheetDespachos.getDataRange().getValues();
    // Asumimos estructura conocida de Despachos (ver DespachoAPI.gs)
    const COL_NV = 7; // H - N° NV
    
    let despachoRow = null;
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][COL_NV] || '').trim() === String(nVenta).trim()) {
        despachoRow = data[i];
        break;
      }
    }
    
    if (!despachoRow) {
      console.warn(`TMS Sync: No se encontró la NV ${nVenta} en hoja Despachos`);
      // Usamos datos mínimos del formulario
      despachoRow = []; 
    }
    
    // 2. Preparar datos para Entregas
    // Indices basados en DespachoAPI.gs
    const cliente = despachoRow[1] || ''; // B - CLIENTE
    const bultos = despachoRow[4] || 0;   // E - BULTOS
    
    // Validar si ya existe en Entregas para evitar duplicados
    const tmsDb = new TMSDatabase();
    
    // Verificar si ya existe
    const existingEntregas = tmsDb.getEntregas({
      // No tenemos filtro exacto por NV en getEntregas, pero podemos filtrar después
    });
    const exists = existingEntregas.some(e => e.NV === nVenta);
    
    if (exists) {
      console.log(`TMS Sync: La entrega para NV ${nVenta} ya existe. Actualizando...`);
      // Podríamos actualizar si fuera necesario, por ahora retornamos éxito
      // Opcional: Actualizar estado si estaba en otro estado
      return { success: true, message: 'Entrega ya existía' };
    }
    
    // 3. Crear nueva entrega
    const nuevaEntrega = {
      NV: nVenta,
      Cliente: cliente,
      Direccion: datosDespacho.direccion || '', 
      Telefono: '',
      Bultos: Number(bultos) || 0,
      Peso: 0,
      Estado: 'PENDIENTE',
      FechaCreacion: new Date(),
      FechaSync: new Date(), // Nueva columna para trazar cuándo se sincronizó
      FechaAsignacion: '',
      FechaEntrega: '',
      ConductorAsignado: '',
      RutaAsignada: '',
      Prioridad: 'NORMAL',
      Observaciones: `Generado desde Despacho. Transp: ${datosDespacho.empresaTransporte || ''} Guía: ${despachoRow[3] || datosDespacho.guia || ''}`,
      FotoEntrega: '',
      Receptor: '',
      TiempoEntrega: '',
      Calificacion: '',
      Latitud: '',
      Longitud: ''
    };
    
    // Intentar obtener dirección de una hoja de Entregas (si se usó anteriormente) o Clientes
    // La lógica aquí es buscar si este cliente ya tiene entregas previas para reusar la dirección
    try {
      // 1. Buscar en histórico de entregas (prioridad)
      const historialEntregas = tmsDb.getEntregas(); // Ya tenemos esto cargado en existingEntregas si optimizamos
      const entregaPrevia = historialEntregas.find(e => 
        e.Cliente && e.Cliente.toLowerCase() === cliente.toLowerCase() && e.Direccion
      );
      
      if (entregaPrevia) {
        console.log(`TMS Sync: Dirección encontrada en historial para ${cliente}`);
        nuevaEntrega.Direccion = entregaPrevia.Direccion;
        nuevaEntrega.Telefono = entregaPrevia.Telefono || '';
        nuevaEntrega.Latitud = entregaPrevia.Latitud || '';
        nuevaEntrega.Longitud = entregaPrevia.Longitud || '';
      } else {
        // 2. Buscar en hoja de Clientes (fallback)
        const sheetClientes = ss.getSheetByName('CLIENTES') || ss.getSheetByName('Clientes');
        if (sheetClientes && cliente) {
          const dataClientes = sheetClientes.getDataRange().getValues();
          // Asumimos headers en fila 1: Nombre, Direccion, Telefono, Lat, Long
          // Ajustar índices según estructura real de hoja Clientes
          for (let c = 1; c < dataClientes.length; c++) {
            if (String(dataClientes[c][0]).toLowerCase().includes(cliente.toLowerCase())) {
              nuevaEntrega.Direccion = dataClientes[c][1] || ''; 
              nuevaEntrega.Telefono = dataClientes[c][2] || '';
              // Si hay lat/long en clientes, usarlas
              if (dataClientes[c].length > 3) nuevaEntrega.Latitud = dataClientes[c][3] || '';
              if (dataClientes[c].length > 4) nuevaEntrega.Longitud = dataClientes[c][4] || '';
              console.log(`TMS Sync: Dirección encontrada en maestro Clientes para ${cliente}`);
              break;
            }
          }
        }

        // 3. (NUEVO) Buscar en N.V DIARIAS como último recurso
        if (!nuevaEntrega.Direccion) {
             // ... lógica existente ...
        }

        // 4. (IA LITE) Match Automático con Maestro de Direcciones
        if (!nuevaEntrega.Direccion && typeof buscarDirecciones === 'function') {
           console.log(`TMS Sync: Intentando match de dirección para ${nuevaEntrega.Cliente}`);
           var match = buscarDirecciones(nuevaEntrega.Cliente);
           if (match.success && match.resultados.length > 0) {
              // Tomar el primer resultado
              var mejorMatch = match.resultados[0];
              nuevaEntrega.Direccion = mejorMatch.d + ' #' + mejorMatch.num + ', ' + mejorMatch.com;
              nuevaEntrega.Comuna = mejorMatch.com;
              nuevaEntrega.Region = mejorMatch.reg;
              // Si tuviera lat/lon en maestro, asignarlo también
              console.log(`TMS Sync: ✅ Dirección encontrada en maestro: ${nuevaEntrega.Direccion}`);
           }
        }

        if (!nuevaEntrega.Direccion) {
             nuevaEntrega.Direccion = "SIN DIRECCIÓN - COMPLETAR MANUALMENTE";
             nuevaEntrega.Prioridad = "ALTA";
        }
      }
    } catch (e) {
      console.warn('Error buscando dirección cliente:', e);
    }
    
    const result = tmsDb.createEntrega(nuevaEntrega);
    
    console.log('TMS Sync: Sincronización exitosa', result);
    return result;
    
  } catch (error) {
    console.error('TMS Sync Error:', error);
    // No lanzamos error para no romper el flujo de Despacho, pero logueamos
    return { success: false, error: error.message };
  }
}
