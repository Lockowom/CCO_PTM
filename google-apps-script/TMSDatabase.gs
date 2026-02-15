/**
 * TMS Database - Data Access Layer
 * Manejo de todas las operaciones de base de datos para el TMS
 * 
 * @fileoverview Capa de acceso a datos para el sistema TMS
 * @author Sistema CCO
 * @version 1.0.0
 */

/**
 * Clase principal para manejo de base de datos TMS
 */
class TMSDatabase {
  constructor() {
    this.spreadsheetId = TMS_CONFIG.SPREADSHEET_ID;
    
    // Fallback: Si no hay ID configurado, intentar usar la hoja activa
    if (!this.spreadsheetId) {
      try {
        const active = SpreadsheetApp.getActiveSpreadsheet();
        if (active) {
          this.spreadsheetId = active.getId();
          // Intentar guardar para la próxima
          try {
            PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID', this.spreadsheetId);
          } catch (e) {
            // Ignorar error de permisos al guardar propiedades
          }
        }
      } catch (e) {
        console.error('TMS Database: No se pudo obtener Spreadsheet ID activo');
      }
    }
    
    if (!this.spreadsheetId) {
      throw new Error('TMS Configuration Error: SPREADSHEET_ID no definido');
    }
    
    this.spreadsheet = SpreadsheetApp.openById(this.spreadsheetId);
    this.cache = CacheService.getScriptCache();
  }

  // ==================== OPERACIONES DE ENTREGAS ====================

  /**
   * Obtiene todas las entregas (AHORA DESDE SUPABASE - PROXY)
   */
  getEntregas(filtros = {}) {
    try {
      // Intentar leer desde Supabase primero si está configurado
      if (typeof SYNC_CONFIG !== 'undefined' && SYNC_CONFIG.API_URL) {
         return this.getEntregasFromCloud(filtros);
      }
      
      // Fallback a Sheets si no hay nube configurada (Legacy)
      return this.getEntregasFromSheets(filtros);
    } catch (error) {
      console.error('TMS Database: Error obteniendo entregas:', error);
      throw error;
    }
  }

  /**
   * Lee entregas desde Supabase (Proxy via Render Backend)
   * Seguridad: Ya no usamos la API Key de Supabase en el cliente.
   * La petición va a nuestro servidor Node.js que maneja la autenticación.
   */
  getEntregasFromCloud(filtros) {
    // URL de tu Backend en Render
    let url = `https://cco-ptm.onrender.com/api/entregas?limit=500`;
    
    // Aplicar filtros query params
    if (filtros.estado) url += `&estado=${encodeURIComponent(filtros.estado)}`;
    if (filtros.conductorId) url += `&conductor_id=${encodeURIComponent(filtros.conductorId)}`;
    
    const options = {
      method: 'get',
      muteHttpExceptions: true
    };

    try {
      const response = UrlFetchApp.fetch(url, options);
      const code = response.getResponseCode();
      
      if (code !== 200) {
         console.warn('TMS Database: Fallo conexión a Render, usando Sheets como backup.');
         return this.getEntregasFromSheets(filtros);
      }

      const data = JSON.parse(response.getContentText());
      
      // Mapear respuesta del Backend a formato UI
      return data.map(d => ({
        ID: d.id,
        NV: d.nv,
        Cliente: d.cliente,
        Direccion: d.direccion,
        Bultos: d.bultos,
        Estado: d.estado,
        Latitud: d.latitud,
        Longitud: d.longitud,
        RutaId: d.ruta_id,
        ConductorAsignado: d.conductor_id,
        FechaCreacion: d.fecha_creacion
      }));
    } catch (e) {
      console.error('TMS Database: Error fatal conectando a Render:', e);
      return this.getEntregasFromSheets(filtros); // Fallback robusto
    }
  }

  /**
   * Método Legacy: Lee desde la hoja de cálculo (Lento)
   */
  getEntregasFromSheets(filtros = {}) {
      const sheet = this.spreadsheet.getSheetByName(TMS_CONFIG.SHEETS.ENTREGAS);
      if (!sheet) throw new Error('Hoja de Entregas no encontrada');

      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      const rows = data.slice(1);

      // Índices esperados (ajustar si cambia la estructura de la hoja)
      // Buscamos dinámicamente los índices para ser tolerantes a cambios de orden
      const idxNV = headers.findIndex(h => h.toString().toUpperCase().includes('NV') || h.toString().toUpperCase().includes('VENTA'));
      const idxCliente = headers.findIndex(h => h.toString().toUpperCase().includes('CLIENTE'));
      const idxDireccion = headers.findIndex(h => h.toString().toUpperCase().includes('DIRECCION'));
      const idxBultos = headers.findIndex(h => h.toString().toUpperCase().includes('BULTOS'));
      const idxEstado = headers.findIndex(h => h.toString().toUpperCase().includes('ESTADO'));
      const idxLat = headers.findIndex(h => h.toString().toUpperCase().includes('LAT'));
      const idxLon = headers.findIndex(h => h.toString().toUpperCase().includes('LON') || h.toString().toUpperCase().includes('LNG'));
      const idxRutaId = headers.findIndex(h => h.toString().toUpperCase().includes('RUTA') && (h.toString().toUpperCase().includes('ID') || h.toString().toUpperCase().includes('ASIGNADA')));
      const idxConductorId = headers.findIndex(h => h.toString().toUpperCase().includes('CONDUCTOR'));

      let entregas = rows.map((row, i) => {
        // Objeto base con mapeo directo
        let entrega = {};
        
        // Mapeo seguro usando índices encontrados o fallback a posición estándar
        entrega.NV = (idxNV >= 0 ? row[idxNV] : row[0]) || 'S/N';
        entrega.Cliente = (idxCliente >= 0 ? row[idxCliente] : row[1]) || 'Cliente Desconocido';
        entrega.Direccion = (idxDireccion >= 0 ? row[idxDireccion] : row[2]) || '';
        entrega.Bultos = (idxBultos >= 0 ? row[idxBultos] : row[4]) || 0;
        entrega.Estado = (idxEstado >= 0 ? row[idxEstado] : row[5]) || 'PENDIENTE';
        entrega.Latitud = (idxLat >= 0 ? row[idxLat] : '');
        entrega.Longitud = (idxLon >= 0 ? row[idxLon] : '');
        entrega.RutaId = (idxRutaId >= 0 ? row[idxRutaId] : '') || '';
        entrega.ConductorAsignado = (idxConductorId >= 0 ? row[idxConductorId] : '') || '';
        
        // Mantener el resto de propiedades dinámicas por si acaso
        headers.forEach((header, index) => {
          if (!entrega[header]) entrega[header] = row[index];
        });
        
        // ID único para el frontend
        entrega.ID = entrega.NV; 
        
        return entrega;
      });

      // Aplicar filtros
      if (filtros.estado) {
        entregas = entregas.filter(e => e.Estado === filtros.estado);
      }
      if (filtros.conductorId) {
        entregas = entregas.filter(e => e.ConductorAsignado === filtros.conductorId);
      }
      if (filtros.fecha) {
        entregas = entregas.filter(e => {
          const fechaEntrega = new Date(e.FechaEntrega);
          const fechaFiltro = new Date(filtros.fecha);
          return fechaEntrega.toDateString() === fechaFiltro.toDateString();
        });
      }
      if (filtros.rutaId) {
        entregas = entregas.filter(e => e.RutaId === filtros.rutaId);
      }

      return entregas;
  }

  /**
   * Obtiene una entrega por ID
   */
  getEntregaById(entregaId) {
    try {
      const entregas = this.getEntregas();
      return entregas.find(e => e.NV === entregaId || e.ID === entregaId);
    } catch (error) {
      console.error('TMS Database: Error obteniendo entrega por ID:', error);
      throw error;
    }
  }

  /**
   * Crea una nueva entrega
   */
  createEntrega(entregaData) {
    try {
      let sheet = this.spreadsheet.getSheetByName(TMS_CONFIG.SHEETS.ENTREGAS);
      
      // Auto-crear hoja si no existe
      if (!sheet) {
        console.log('TMS Database: Hoja Entregas no existe, creando...');
        if (typeof setupEntregasSheet === 'function') {
           sheet = this.spreadsheet.insertSheet(TMS_CONFIG.SHEETS.ENTREGAS);
           setupEntregasSheet(sheet);
        } else {
           // Fallback básico si no está disponible la función de setup
           sheet = this.spreadsheet.insertSheet(TMS_CONFIG.SHEETS.ENTREGAS);
           const headers = ['NV', 'Cliente', 'Direccion', 'Telefono', 'Bultos', 'Estado', 'FechaCreacion', 'Observaciones', 'FechaSync', 'Latitud', 'Longitud', 'RutaId', 'ConductorAsignado'];
           sheet.appendRow(headers);
        }
      }

      const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      
      // Mapa de claves estándar a encabezados reales de la hoja
      const headerMap = {};
      headers.forEach(h => {
        const upperH = h.toString().toUpperCase();
        if (upperH.includes('NV') || upperH.includes('VENTA')) headerMap['NV'] = h;
        else if (upperH.includes('CLIENTE')) headerMap['Cliente'] = h;
        else if (upperH.includes('DIRECCION')) headerMap['Direccion'] = h;
        else if (upperH.includes('TELEFONO')) headerMap['Telefono'] = h;
        else if (upperH.includes('BULTOS')) headerMap['Bultos'] = h;
        else if (upperH.includes('ESTADO')) headerMap['Estado'] = h;
        else if (upperH.includes('LAT')) headerMap['Latitud'] = h;
        else if (upperH.includes('LON') || upperH.includes('LNG')) headerMap['Longitud'] = h;
        else if (upperH.includes('RUTA') && (upperH.includes('ID') || upperH.includes('ASIGNADA'))) headerMap['RutaId'] = h;
        else if (upperH.includes('CONDUCTOR')) headerMap['ConductorAsignado'] = h;
        else if (upperH.includes('FECHA') && upperH.includes('CREACION')) headerMap['FechaCreacion'] = h;
        else if (upperH.includes('SYNC')) headerMap['FechaSync'] = h;
        else if (upperH.includes('OBSERVACIONES')) headerMap['Observaciones'] = h;
      });

      // Verificar si existe la columna FechaSync, si no, agregarla
      if (!headerMap['FechaSync'] && headers.indexOf('FechaSync') === -1) {
        const lastCol = sheet.getLastColumn();
        sheet.getRange(1, lastCol + 1).setValue('FechaSync');
        sheet.getRange(1, lastCol + 1).setFontWeight('bold');
        headers.push('FechaSync'); // Actualizar array headers local
        headerMap['FechaSync'] = 'FechaSync';
      }

      const newRow = [];

      // Llenar datos según headers encontrados
      headers.forEach(header => {
        // 1. Intentar coincidencia exacta
        let val = entregaData[header];
        
        // 2. Intentar coincidencia mapeada
        if (val === undefined) {
          // Buscar qué clave estándar corresponde a este header
          const standardKey = Object.keys(headerMap).find(key => headerMap[key] === header);
          if (standardKey) {
            val = entregaData[standardKey];
          }
        }
        
        newRow.push(val !== undefined ? val : '');
      });

      // Agregar timestamp de creación si no se llenó
      const now = new Date();
      const idxFechaCreacion = headers.indexOf(headerMap['FechaCreacion'] || 'FechaCreacion');
      if (idxFechaCreacion !== -1 && !newRow[idxFechaCreacion]) {
        newRow[idxFechaCreacion] = now;
      }
      
      // Agregar timestamp de sincronización si no viene
      const idxFechaSync = headers.indexOf(headerMap['FechaSync'] || 'FechaSync');
      if (idxFechaSync !== -1 && !newRow[idxFechaSync]) {
        newRow[idxFechaSync] = now;
      }

      // Estado inicial
      const idxEstado = headers.indexOf(headerMap['Estado'] || 'Estado');
      if (idxEstado !== -1 && !newRow[idxEstado]) {
        newRow[idxEstado] = TMS_CONFIG.ESTADOS_ENTREGA.PENDIENTE;
      }

      sheet.appendRow(newRow);
      
      // Limpiar cache
      this.clearCache('entregas');
      
      return { success: true, message: 'Entrega creada correctamente' };
    } catch (error) {
      console.error('TMS Database: Error creando entrega:', error);
      throw error;
    }
  }

  /**
   * Actualiza una entrega existente
   */
  updateEntrega(entregaId, updates) {
    try {
      const sheet = this.spreadsheet.getSheetByName(TMS_CONFIG.SHEETS.ENTREGAS);
      if (!sheet) throw new Error('Hoja de Entregas no encontrada');

      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      
      // Encontrar la fila de la entrega
      let rowIndex = -1;
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] === entregaId || data[i][headers.indexOf('NV')] === entregaId) {
          rowIndex = i + 1; // +1 porque getRange usa índice 1-based
          break;
        }
      }

      if (rowIndex === -1) {
        throw new Error(`Entrega ${entregaId} no encontrada`);
      }

      // Actualizar campos
      Object.keys(updates).forEach(field => {
        const columnIndex = headers.indexOf(field);
        if (columnIndex !== -1) {
          sheet.getRange(rowIndex, columnIndex + 1).setValue(updates[field]);
        }
      });

      // Actualizar timestamp de última modificación
      const ultimaActualizacionIndex = headers.indexOf('UltimaActualizacion');
      if (ultimaActualizacionIndex !== -1) {
        sheet.getRange(rowIndex, ultimaActualizacionIndex + 1).setValue(new Date());
      }

      // Limpiar cache
      this.clearCache('entregas');
      
      return { success: true, message: 'Entrega actualizada correctamente' };
    } catch (error) {
      console.error('TMS Database: Error actualizando entrega:', error);
      throw error;
    }
  }

  // ==================== OPERACIONES DE CONDUCTORES ====================

  /**
   * Obtiene todos los conductores
   */
  getConductores(filtros = {}) {
    try {
      const cacheKey = 'conductores_' + JSON.stringify(filtros);
      const cached = this.cache.get(cacheKey);
      if (cached) return JSON.parse(cached);

      const sheet = this.spreadsheet.getSheetByName(TMS_CONFIG.SHEETS.CONDUCTORES);
      if (!sheet) throw new Error('Hoja de Conductores no encontrada');

      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      const rows = data.slice(1);

      let conductores = rows.map(row => {
        let conductor = {};
        headers.forEach((header, index) => {
          conductor[header] = row[index];
        });
        return conductor;
      });

      // Aplicar filtros
      if (filtros.estado) {
        conductores = conductores.filter(c => c.Estado === filtros.estado);
      }
      if (filtros.activo !== undefined) {
        conductores = conductores.filter(c => c.Activo === filtros.activo);
      }

      // Cache por 5 minutos
      this.cache.put(cacheKey, JSON.stringify(conductores), 300);
      
      return conductores;
    } catch (error) {
      console.error('TMS Database: Error obteniendo conductores:', error);
      throw error;
    }
  }

  /**
   * Obtiene un conductor por ID
   */
  getConductorById(conductorId) {
    try {
      const conductores = this.getConductores();
      return conductores.find(c => c.ID === conductorId);
    } catch (error) {
      console.error('TMS Database: Error obteniendo conductor por ID:', error);
      throw error;
    }
  }

  /**
   * Actualiza la ubicación de un conductor
   */
  updateConductorLocation(conductorId, lat, lng) {
    try {
      const updates = {
        UltimaUbicacion: `${lat},${lng}`,
        UltimaActualizacion: new Date()
      };
      
      return this.updateConductor(conductorId, updates);
    } catch (error) {
      console.error('TMS Database: Error actualizando ubicación conductor:', error);
      throw error;
    }
  }

  /**
   * Actualiza un conductor
   */
  updateConductor(conductorId, updates) {
    try {
      const sheet = this.spreadsheet.getSheetByName(TMS_CONFIG.SHEETS.CONDUCTORES);
      if (!sheet) throw new Error('Hoja de Conductores no encontrada');

      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      
      // Encontrar la fila del conductor
      let rowIndex = -1;
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] === conductorId) {
          rowIndex = i + 1;
          break;
        }
      }

      if (rowIndex === -1) {
        throw new Error(`Conductor ${conductorId} no encontrado`);
      }

      // Actualizar campos
      Object.keys(updates).forEach(field => {
        const columnIndex = headers.indexOf(field);
        if (columnIndex !== -1) {
          sheet.getRange(rowIndex, columnIndex + 1).setValue(updates[field]);
        }
      });

      // Limpiar cache
      this.clearCache('conductores');
      
      return { success: true, message: 'Conductor actualizado correctamente' };
    } catch (error) {
      console.error('TMS Database: Error actualizando conductor:', error);
      throw error;
    }
  }

  // ==================== OPERACIONES DE RUTAS ====================

  /**
   * Obtiene todas las rutas
   */
  getRutas(filtros = {}) {
    try {
      const sheet = this.spreadsheet.getSheetByName(TMS_CONFIG.SHEETS.RUTAS);
      if (!sheet) throw new Error('Hoja de Rutas no encontrada');

      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      const rows = data.slice(1);

      let rutas = rows.map(row => {
        let ruta = {};
        headers.forEach((header, index) => {
          ruta[header] = row[index];
        });
        return ruta;
      });

      // Aplicar filtros
      if (filtros.estado) {
        rutas = rutas.filter(r => r.Estado === filtros.estado);
      }
      if (filtros.conductorId) {
        rutas = rutas.filter(r => r.ConductorAsignado === filtros.conductorId);
      }
      if (filtros.fecha) {
        rutas = rutas.filter(r => {
          const fechaRuta = new Date(r.FechaInicio);
          const fechaFiltro = new Date(filtros.fecha);
          return fechaRuta.toDateString() === fechaFiltro.toDateString();
        });
      }

      return rutas;
    } catch (error) {
      console.error('TMS Database: Error obteniendo rutas:', error);
      throw error;
    }
  }

  /**
   * Crea una nueva ruta
   */
  createRuta(rutaData) {
    try {
      const sheet = this.spreadsheet.getSheetByName(TMS_CONFIG.SHEETS.RUTAS);
      if (!sheet) throw new Error('Hoja de Rutas no encontrada');

      const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      const newRow = [];

      // Generar ID único para la ruta
      const rutaId = 'RUTA_' + new Date().getTime();
      rutaData.ID = rutaId;

      // Llenar datos según headers
      headers.forEach(header => {
        newRow.push(rutaData[header] || '');
      });

      // Agregar timestamp de creación
      const now = new Date();
      const fechaCreacionIndex = headers.indexOf('FechaCreacion');
      if (fechaCreacionIndex !== -1) {
        newRow[fechaCreacionIndex] = now;
      }

      sheet.appendRow(newRow);
      
      return { success: true, rutaId: rutaId, message: 'Ruta creada correctamente' };
    } catch (error) {
      console.error('TMS Database: Error creando ruta:', error);
      throw error;
    }
  }

  /**
   * Obtiene una ruta por ID
   */
  getRutaById(rutaId) {
    try {
      const rutas = this.getRutas();
      return rutas.find(r => r.ID === rutaId);
    } catch (error) {
      console.error('TMS Database: Error obteniendo ruta por ID:', error);
      throw error;
    }
  }

  /**
   * Actualiza una ruta existente
   */
  updateRuta(rutaId, updates) {
    try {
      const sheet = this.spreadsheet.getSheetByName(TMS_CONFIG.SHEETS.RUTAS);
      if (!sheet) throw new Error('Hoja de Rutas no encontrada');

      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      
      // Encontrar la fila de la ruta
      let rowIndex = -1;
      for (let i = 1; i < data.length; i++) {
        if (data[i][headers.indexOf('ID')] === rutaId) {
          rowIndex = i + 1;
          break;
        }
      }

      if (rowIndex === -1) {
        throw new Error(`Ruta ${rutaId} no encontrada`);
      }

      // Actualizar campos
      Object.keys(updates).forEach(field => {
        const columnIndex = headers.indexOf(field);
        if (columnIndex !== -1) {
          sheet.getRange(rowIndex, columnIndex + 1).setValue(updates[field]);
        }
      });

      // Actualizar timestamp
      const ultimaActualizacionIndex = headers.indexOf('UltimaActualizacion');
      if (ultimaActualizacionIndex !== -1) {
        sheet.getRange(rowIndex, ultimaActualizacionIndex + 1).setValue(new Date());
      }
      
      return { success: true, message: 'Ruta actualizada correctamente' };
    } catch (error) {
      console.error('TMS Database: Error actualizando ruta:', error);
      throw error;
    }
  }

  /**
   * Elimina una ruta
   */
  deleteRuta(rutaId) {
    try {
      const sheet = this.spreadsheet.getSheetByName(TMS_CONFIG.SHEETS.RUTAS);
      if (!sheet) throw new Error('Hoja de Rutas no encontrada');

      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      
      let rowIndex = -1;
      for (let i = 1; i < data.length; i++) {
        if (data[i][headers.indexOf('ID')] === rutaId) {
          rowIndex = i + 1;
          break;
        }
      }

      if (rowIndex === -1) {
        throw new Error(`Ruta ${rutaId} no encontrada`);
      }

      sheet.deleteRow(rowIndex);
      
      return { success: true, message: 'Ruta eliminada correctamente' };
    } catch (error) {
      console.error('TMS Database: Error eliminando ruta:', error);
      throw error;
    }
  }

  // ==================== OPERACIONES DE VEHÍCULOS ====================

  /**
   * Obtiene todos los vehículos
   */
  getVehiculos(filtros = {}) {
    try {
      const sheet = this.spreadsheet.getSheetByName(TMS_CONFIG.SHEETS.VEHICULOS);
      if (!sheet) throw new Error('Hoja de Vehículos no encontrada');

      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      const rows = data.slice(1);

      let vehiculos = rows.map(row => {
        let vehiculo = {};
        headers.forEach((header, index) => {
          vehiculo[header] = row[index];
        });
        return vehiculo;
      });

      // Aplicar filtros
      if (filtros.estado) {
        vehiculos = vehiculos.filter(v => v.Estado === filtros.estado);
      }
      if (filtros.activo !== undefined) {
        vehiculos = vehiculos.filter(v => v.Activo === filtros.activo);
      }

      return vehiculos;
    } catch (error) {
      console.error('TMS Database: Error obteniendo vehículos:', error);
      throw error;
    }
  }

  // ==================== OPERACIONES DE TRACKING ====================

  /**
   * Registra un evento de tracking
   */
  addTrackingEvent(trackingData) {
    try {
      const sheet = this.spreadsheet.getSheetByName(TMS_CONFIG.SHEETS.TRACKING);
      if (!sheet) throw new Error('Hoja de Tracking no encontrada');

      const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      const newRow = [];

      // Generar ID único para el evento
      trackingData.ID = 'TRK_' + new Date().getTime();
      trackingData.Timestamp = new Date();

      // Llenar datos según headers
      headers.forEach(header => {
        newRow.push(trackingData[header] || '');
      });

      sheet.appendRow(newRow);
      
      return { success: true, message: 'Evento de tracking registrado' };
    } catch (error) {
      console.error('TMS Database: Error registrando tracking:', error);
      throw error;
    }
  }

  /**
   * Obtiene el historial de tracking de una entrega
   */
  getTrackingHistory(entregaId) {
    try {
      const sheet = this.spreadsheet.getSheetByName(TMS_CONFIG.SHEETS.TRACKING);
      if (!sheet) throw new Error('Hoja de Tracking no encontrada');

      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      const rows = data.slice(1);

      const tracking = rows
        .filter(row => row[headers.indexOf('EntregaID')] === entregaId)
        .map(row => {
          let event = {};
          headers.forEach((header, index) => {
            event[header] = row[index];
          });
          return event;
        })
        .sort((a, b) => new Date(b.Timestamp) - new Date(a.Timestamp));

      return tracking;
    } catch (error) {
      console.error('TMS Database: Error obteniendo historial tracking:', error);
      throw error;
    }
  }

  // ==================== OPERACIONES DE CACHE ====================

  /**
   * Limpia el cache para un tipo específico
   */
  clearCache(type) {
    try {
      if (type) {
        // Limpiar cache específico (esto es limitado en Google Apps Script)
        // Por ahora solo documentamos la intención
        console.log(`TMS Database: Cache limpiado para ${type}`);
      } else {
        // Limpiar todo el cache
        this.cache.removeAll();
      }
    } catch (error) {
      console.error('TMS Database: Error limpiando cache:', error);
    }
  }

  // ==================== OPERACIONES DE ESTADÍSTICAS ====================

  /**
   * Obtiene estadísticas generales del sistema
   */
  getEstadisticas() {
    try {
      const entregas = this.getEntregas();
      const conductores = this.getConductores();
      const vehiculos = this.getVehiculos();
      const rutas = this.getRutas();

      const stats = {
        entregas: {
          total: entregas.length,
          pendientes: entregas.filter(e => e.Estado === TMS_CONFIG.ESTADOS_ENTREGA.PENDIENTE).length,
          enRuta: entregas.filter(e => e.Estado === TMS_CONFIG.ESTADOS_ENTREGA.EN_RUTA).length,
          entregadas: entregas.filter(e => e.Estado === TMS_CONFIG.ESTADOS_ENTREGA.ENTREGADO).length,
          rechazadas: entregas.filter(e => e.Estado === TMS_CONFIG.ESTADOS_ENTREGA.RECHAZADO).length
        },
        conductores: {
          total: conductores.length,
          disponibles: conductores.filter(c => c.Estado === TMS_CONFIG.ESTADOS_CONDUCTOR.DISPONIBLE).length,
          enRuta: conductores.filter(c => c.Estado === TMS_CONFIG.ESTADOS_CONDUCTOR.EN_RUTA).length,
          ocupados: conductores.filter(c => c.Estado === TMS_CONFIG.ESTADOS_CONDUCTOR.OCUPADO).length
        },
        vehiculos: {
          total: vehiculos.length,
          disponibles: vehiculos.filter(v => v.Estado === 'DISPONIBLE').length,
          enUso: vehiculos.filter(v => v.Estado === 'EN_USO').length
        },
        rutas: {
          total: rutas.length,
          activas: rutas.filter(r => r.Estado === 'EN_PROGRESO').length,
          completadas: rutas.filter(r => r.Estado === 'COMPLETADA').length
        }
      };

      return stats;
    } catch (error) {
      console.error('TMS Database: Error obteniendo estadísticas:', error);
      throw error;
    }
  }

  // ==================== OPERACIONES DE BÚSQUEDA ====================

  /**
   * Búsqueda general en el sistema
   */
  search(query, tipo = 'all') {
    try {
      const results = {
        entregas: [],
        conductores: [],
        vehiculos: [],
        rutas: []
      };

      const searchTerm = query.toLowerCase();

      if (tipo === 'all' || tipo === 'entregas') {
        const entregas = this.getEntregas();
        results.entregas = entregas.filter(e => 
          (e.NV && e.NV.toLowerCase().includes(searchTerm)) ||
          (e.Cliente && e.Cliente.toLowerCase().includes(searchTerm)) ||
          (e.Direccion && e.Direccion.toLowerCase().includes(searchTerm))
        );
      }

      if (tipo === 'all' || tipo === 'conductores') {
        const conductores = this.getConductores();
        results.conductores = conductores.filter(c => 
          (c.Nombre && c.Nombre.toLowerCase().includes(searchTerm)) ||
          (c.Apellido && c.Apellido.toLowerCase().includes(searchTerm)) ||
          (c.Telefono && c.Telefono.includes(searchTerm))
        );
      }

      if (tipo === 'all' || tipo === 'vehiculos') {
        const vehiculos = this.getVehiculos();
        results.vehiculos = vehiculos.filter(v => 
          (v.Patente && v.Patente.toLowerCase().includes(searchTerm)) ||
          (v.Marca && v.Marca.toLowerCase().includes(searchTerm)) ||
          (v.Modelo && v.Modelo.toLowerCase().includes(searchTerm))
        );
      }

      return results;
    } catch (error) {
      console.error('TMS Database: Error en búsqueda:', error);
      throw error;
    }
  }

  // ==================== OPERACIONES MÓVILES ADICIONALES ====================

  /**
   * Get driver's tasks for a specific date
   * @param {string} driverId - Driver ID
   * @param {string} date - Date string (YYYY-MM-DD)
   * @returns {Array} Array of tasks for the date
   */
  getDriverTasksByDate(driverId, date) {
    try {
      const sheet = this.spreadsheet.getSheetByName(TMS_CONFIG.SHEETS.ENTREGAS);
      // Fallback: If getting sheet failed by name using config, try direct name
      const targetSheet = sheet || this.spreadsheet.getSheetByName('Entregas');
      
      if (!targetSheet) {
         console.warn('TMSDatabase: Sheet Entregas not found');
         return [];
      }
      
      const data = targetSheet.getDataRange().getValues();
      const headers = data[0];
      const tasks = [];

      // Find column indices
      const conductorIdCol = headers.indexOf('ConductorAsignado');
      const fechaCol = headers.indexOf('FechaAsignacion'); // Assuming this column exists
      
      if (conductorIdCol === -1) {
        console.warn('TMSDatabase: Required columns not found for getDriverTasksByDate');
        return [];
      }

      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        
        if (row[conductorIdCol] === driverId) {
          // Date filtering logic...
          // For now returning all assigned tasks as date logic can be brittle
          // Real implementation should parse date carefully
          tasks.push(row); 
        }
      }
      
      // Need to convert rows to objects (Delivery objects)
      // Re-using getEntregas filter might be safer but this is specific for mobile
      return this.getEntregas({ conductorId: driverId }); 

    } catch (error) {
      console.error('TMSDatabase: Error getting driver tasks by date:', error);
      return [];
    }
  }

  /**
   * Get delivery products (items in the delivery)
   * @param {string} deliveryId - Delivery ID
   * @returns {Array} Array of products
   */
  getDeliveryProducts(deliveryId) {
    try {
      // In a real implementation, this would get products from a related sheet
      // For now, return mock data based on delivery info
      const delivery = this.getEntregaById(deliveryId);
      if (!delivery) return [];

      // Mock products - in real implementation, get from Despachos or related sheet
      return [
        {
          codigo: 'PROD001',
          descripcion: 'Producto de ejemplo 1',
          cantidad: 2,
          unidad: 'UN'
        },
        {
          codigo: 'PROD002',
          descripcion: 'Producto de ejemplo 2',
          cantidad: 1,
          unidad: 'KG'
        }
      ];
    } catch (error) {
      console.error('TMSDatabase: Error getting delivery products:', error);
      return [];
    }
  }

  /**
   * Get delivery history/log
   * @param {string} deliveryId - Delivery ID
   * @returns {Array} Array of history entries
   */
  getDeliveryHistory(deliveryId) {
    try {
      // In a real implementation, this would get from a delivery log sheet
      // For now, return mock history
      return [
        {
          fecha: new Date(),
          accion: 'Entrega creada',
          usuario: 'SYSTEM',
          detalles: 'Entrega asignada al conductor'
        },
        {
          fecha: new Date(Date.now() - 3600000), // 1 hour ago
          accion: 'Ruta asignada',
          usuario: 'ADMIN',
          detalles: 'Entrega incluida en ruta matutina'
        }
      ];
    } catch (error) {
      console.error('TMSDatabase: Error getting delivery history:', error);
      return [];
    }
  }

  /**
   * Log delivery history entry
   * @param {string} deliveryId - Delivery ID
   * @param {Object} entry - History entry
   * @returns {boolean} Success status
   */
  logDeliveryHistory(deliveryId, entry) {
    try {
      // In a real implementation, this would write to a delivery log sheet
      console.log('TMSDatabase: Logging delivery history:', deliveryId, entry);
      return true;
    } catch (error) {
      console.error('TMSDatabase: Error logging delivery history:', error);
      return false;
    }
  }

  /**
   * Create an issue report
   * @param {Object} issueData - Issue data
   * @returns {Object} Created issue
   */
  createIssue(issueData) {
    try {
      // Get or create Issues sheet
      let sheet;
      try {
        sheet = this.spreadsheet.getSheetByName('Issues');
      } catch (e) {
        // Create Issues sheet if it doesn't exist
        const ss = SpreadsheetApp.openById(this.spreadsheetId);
        sheet = ss.insertSheet('Issues');
        
        // Set headers
        const headers = [
          'ID', 'CONDUCTOR_ID', 'TIPO', 'DESCRIPCION', 'UBICACION_LAT', 
          'UBICACION_LNG', 'FECHA', 'ESTADO', 'PRIORIDAD', 'FECHA_RESOLUCION'
        ];
        sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      }

      // Add the issue
      const row = [
        issueData.id,
        issueData.conductorId,
        issueData.tipo,
        issueData.descripcion,
        issueData.ubicacion?.lat || '',
        issueData.ubicacion?.lng || '',
        issueData.fecha,
        issueData.estado,
        issueData.prioridad,
        '' // fecha_resolucion
      ];

      sheet.appendRow(row);
      return issueData;
    } catch (error) {
      console.error('TMSDatabase: Error creating issue:', error);
      throw error;
    }
  }

  /**
   * Get route deliveries
   * @param {string} routeId - Route ID
   * @returns {Array} Array of deliveries in the route
   */
  getRouteDeliveries(routeId) {
    try {
      const entregas = this.getEntregas({ rutaId: routeId });
      return entregas.sort((a, b) => (a.OrdenEnRuta || 0) - (b.OrdenEnRuta || 0));
    } catch (error) {
      console.error('TMSDatabase: Error getting route deliveries:', error);
      return [];
    }
  }

  /**
   * Get driver's current route
   * @param {string} driverId - Driver ID
   * @returns {Object|null} Current route or null
   */
  getDriverCurrentRoute(driverId) {
    try {
      const rutas = this.getRutas({ 
        conductorId: driverId, 
        estado: 'EN_PROGRESO' 
      });
      
      return rutas.length > 0 ? rutas[0] : null;
    } catch (error) {
      console.error('TMSDatabase: Error getting driver current route:', error);
      return null;
    }
  }

  /**
   * Get driver tasks (deliveries assigned to driver)
   * @param {string} driverId - Driver ID
   * @returns {Array} Array of tasks
   */
  getDriverTasks(driverId) {
    try {
      const entregas = this.getEntregas({ conductorId: driverId });
      
      // Convert to task format expected by mobile app
      return entregas.map(entrega => ({
        id: entrega.ID,
        numeroNV: entrega.NV,
        cliente: entrega.Cliente,
        direccion: entrega.Direccion,
        telefono: entrega.Telefono,
        estado: entrega.Estado,
        fechaAsignacion: entrega.FechaAsignacion,
        fechaEntrega: entrega.FechaEntrega,
        observaciones: entrega.Observaciones,
        secuencia: entrega.OrdenEnRuta || 0,
        distancia: entrega.Distancia,
        tiempoEstimado: entrega.TiempoEstimado,
        productos: entrega.TotalProductos || 1
      }));
    } catch (error) {
      console.error('TMSDatabase: Error getting driver tasks:', error);
      return [];
    }
  }
}