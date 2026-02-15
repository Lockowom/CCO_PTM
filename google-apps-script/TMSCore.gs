/**
 * TMS Core - Transportation Management System
 * Controlador principal del sistema de gestión de transporte
 * 
 * @fileoverview Funciones principales para el manejo del TMS
 * @author Sistema CCO
 * @version 1.0.0
 */

// ==================== CONFIGURACIÓN GLOBAL ====================

/**
 * Configuración global del TMS
 */
const TMS_CONFIG = {
  // IDs de las hojas de cálculo
  SPREADSHEET_ID: PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID'),
  
  // Nombres de las hojas
  SHEETS: {
    CONDUCTORES: 'Conductores',
    RUTAS: 'Rutas', 
    ENTREGAS: 'Entregas',
    VEHICULOS: 'Vehiculos',
    TRACKING: 'Tracking'
  },
  
  // Estados de entrega
  ESTADOS_ENTREGA: {
    PENDIENTE: 'PENDIENTE',
    ASIGNADO: 'ASIGNADO',
    EN_RUTA: 'EN_RUTA',
    EN_DESTINO: 'EN_DESTINO',
    ENTREGADO: 'ENTREGADO',
    RECHAZADO: 'RECHAZADO',
    REPROGRAMADO: 'REPROGRAMADO'
  },
  
  // Estados de conductor
  ESTADOS_CONDUCTOR: {
    DISPONIBLE: 'DISPONIBLE',
    EN_RUTA: 'EN_RUTA',
    OCUPADO: 'OCUPADO',
    DESCANSO: 'DESCANSO',
    OFFLINE: 'OFFLINE'
  },
  
  // Configuración de tiempo
  TIEMPO: {
    TIMEOUT_TRACKING: 5 * 60 * 1000, // 5 minutos
    INTERVALO_SYNC: 30 * 1000, // 30 segundos
    TTL_CACHE: 10 * 60 * 1000 // 10 minutos
  }
};

// ==================== FUNCIONES PRINCIPALES ====================

/**
 * Configura el ID de la hoja de cálculo para el TMS
 * EJECUTAR ESTA FUNCIÓN PRIMERO antes de initializeTMS()
 */
function setupTMSSpreadsheet() {
  try {
    // Obtener el ID de la hoja de cálculo actual
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const spreadsheetId = spreadsheet.getId();
    
    // Guardar en las propiedades del script
    PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID', spreadsheetId);
    
    console.log('TMS: Spreadsheet ID configurado:', spreadsheetId);
    return { 
      success: true, 
      message: 'Spreadsheet ID configurado correctamente',
      spreadsheetId: spreadsheetId
    };
  } catch (error) {
    console.error('TMS: Error configurando spreadsheet:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Inicializa el sistema TMS
 * Crea las hojas necesarias si no existen
 */
function initializeTMS() {
  try {
    console.log('TMS: Inicializando sistema...');
    
    // Verificar que el SPREADSHEET_ID esté configurado
    let spreadsheetId = TMS_CONFIG.SPREADSHEET_ID;
    if (!spreadsheetId) {
      console.log('TMS: SPREADSHEET_ID no configurado, usando hoja actual...');
      const currentSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
      spreadsheetId = currentSpreadsheet.getId();
      
      // Guardar para futuras ejecuciones
      PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID', spreadsheetId);
      console.log('TMS: SPREADSHEET_ID configurado automáticamente:', spreadsheetId);
    }
    
    // Verificar acceso a la hoja de cálculo
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    if (!spreadsheet) {
      throw new Error('No se pudo acceder a la hoja de cálculo');
    }
    
    console.log('TMS: Usando hoja de cálculo:', spreadsheet.getName());
    
    // Crear hojas si no existen
    createSheetsIfNotExist(spreadsheet);
    
    // Configurar estructura de datos
    setupDataStructure(spreadsheet);
    
    console.log('TMS: Sistema inicializado correctamente');
    return { 
      success: true, 
      message: 'TMS inicializado correctamente',
      spreadsheetId: spreadsheetId,
      spreadsheetName: spreadsheet.getName()
    };
    
  } catch (error) {
    console.error('TMS: Error al inicializar:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Crea las hojas necesarias si no existen
 */
function createSheetsIfNotExist(spreadsheet) {
  const sheets = TMS_CONFIG.SHEETS;
  
  // Crear hoja de Conductores
  if (!spreadsheet.getSheetByName(sheets.CONDUCTORES)) {
    const conductoresSheet = spreadsheet.insertSheet(sheets.CONDUCTORES);
    setupConductoresSheet(conductoresSheet);
  }
  
  // Crear hoja de Rutas
  if (!spreadsheet.getSheetByName(sheets.RUTAS)) {
    const rutasSheet = spreadsheet.insertSheet(sheets.RUTAS);
    setupRutasSheet(rutasSheet);
  }
  
  // Crear hoja de Vehículos
  if (!spreadsheet.getSheetByName(sheets.VEHICULOS)) {
    const vehiculosSheet = spreadsheet.insertSheet(sheets.VEHICULOS);
    setupVehiculosSheet(vehiculosSheet);
  }
  
  // Crear hoja de Tracking
  if (!spreadsheet.getSheetByName(sheets.TRACKING)) {
    const trackingSheet = spreadsheet.insertSheet(sheets.TRACKING);
    setupTrackingSheet(trackingSheet);
  }
  
  // Verificar que la hoja de Entregas existe (debería existir del WMS)
  if (!spreadsheet.getSheetByName(sheets.ENTREGAS)) {
    const entregasSheet = spreadsheet.insertSheet(sheets.ENTREGAS);
    setupEntregasSheet(entregasSheet);
  } else {
    // Extender la hoja existente con campos TMS
    extendEntregasSheetForTMS(spreadsheet.getSheetByName(sheets.ENTREGAS));
  }
}

/**
 * Configura la hoja de Conductores
 */
function setupConductoresSheet(sheet) {
  const headers = [
    'ID', 'Nombre', 'Apellido', 'Telefono', 'Email', 'Licencia', 
    'VehiculoAsignado', 'Estado', 'UltimaUbicacion', 'UltimaActualizacion',
    'FechaIngreso', 'Activo', 'Calificacion', 'EntregasCompletadas',
    'TiempoPromedioEntrega', 'Observaciones'
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  sheet.setFrozenRows(1);
  
  // Datos de ejemplo
  const sampleData = [
    ['COND001', 'Juan', 'Pérez', '+56912345678', 'juan.perez@empresa.com', 'B123456', 
     'VEH001', 'DISPONIBLE', '', new Date(), new Date(), true, 4.5, 150, 25, ''],
    ['COND002', 'María', 'González', '+56987654321', 'maria.gonzalez@empresa.com', 'B789012',
     'VEH002', 'DISPONIBLE', '', new Date(), new Date(), true, 4.8, 200, 22, '']
  ];
  
  sheet.getRange(2, 1, sampleData.length, headers.length).setValues(sampleData);
}

/**
 * Configura la hoja de Rutas
 */
function setupRutasSheet(sheet) {
  const headers = [
    'ID', 'Nombre', 'Descripcion', 'ConductorAsignado', 'VehiculoAsignado',
    'FechaCreacion', 'FechaInicio', 'FechaFin', 'Estado', 'Prioridad',
    'EntregasAsignadas', 'EntregasCompletadas', 'DistanciaTotal', 'TiempoEstimado',
    'TiempoReal', 'Observaciones', 'RutaOptimizada'
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  sheet.setFrozenRows(1);
}

/**
 * Configura la hoja de Vehículos
 */
function setupVehiculosSheet(sheet) {
  const headers = [
    'ID', 'Patente', 'Marca', 'Modelo', 'Año', 'Tipo', 'CapacidadKg',
    'CapacidadM3', 'Estado', 'ConductorAsignado', 'UltimaMantencion',
    'ProximaMantencion', 'Kilometraje', 'Combustible', 'Activo', 'Observaciones'
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  sheet.setFrozenRows(1);
  
  // Datos de ejemplo
  const sampleData = [
    ['VEH001', 'ABC123', 'Toyota', 'Hiace', 2020, 'Furgón', 1500, 10, 
     'DISPONIBLE', 'COND001', new Date(), new Date(), 50000, 80, true, ''],
    ['VEH002', 'DEF456', 'Chevrolet', 'N300', 2019, 'Camión', 3000, 15,
     'DISPONIBLE', 'COND002', new Date(), new Date(), 75000, 60, true, '']
  ];
  
  sheet.getRange(2, 1, sampleData.length, headers.length).setValues(sampleData);
}

/**
 * Configura la hoja de Tracking
 */
function setupTrackingSheet(sheet) {
  const headers = [
    'ID', 'ConductorID', 'RutaID', 'EntregaID', 'Timestamp', 'Latitud',
    'Longitud', 'Velocidad', 'Direccion', 'Estado', 'Evento', 'Observaciones'
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  sheet.setFrozenRows(1);
}

/**
 * Configura la hoja de Entregas (nueva)
 */
function setupEntregasSheet(sheet) {
  const headers = [
    'NV', 'Cliente', 'Direccion', 'Telefono', 'Bultos', 'Peso', 'Estado',
    'FechaCreacion', 'FechaAsignacion', 'FechaEntrega', 'ConductorAsignado',
    'RutaAsignada', 'Prioridad', 'Observaciones', 'FotoEntrega', 'Receptor',
    'TiempoEntrega', 'Calificacion', 'Latitud', 'Longitud'
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  sheet.setFrozenRows(1);
}

/**
 * Extiende la hoja de Entregas existente con campos TMS
 */
function extendEntregasSheetForTMS(sheet) {
  const lastColumn = sheet.getLastColumn();
  const headers = sheet.getRange(1, 1, 1, lastColumn).getValues()[0];
  
  // Campos TMS adicionales
  const tmsFields = [
    'ConductorAsignado', 'RutaAsignada', 'TiempoEntrega', 
    'Calificacion', 'Latitud', 'Longitud', 'FotoEntrega'
  ];
  
  // Agregar campos que no existen
  let newColumn = lastColumn + 1;
  tmsFields.forEach(field => {
    if (!headers.includes(field)) {
      sheet.getRange(1, newColumn).setValue(field);
      sheet.getRange(1, newColumn).setFontWeight('bold');
      newColumn++;
    }
  });
}

/**
 * Configura la estructura de datos y validaciones
 */
function setupDataStructure(spreadsheet) {
  // Configurar validaciones de datos
  setupDataValidations(spreadsheet);
  
  // Configurar formatos
  setupDataFormats(spreadsheet);
  
  // Configurar fórmulas automáticas
  setupAutomaticFormulas(spreadsheet);
}

/**
 * Configura validaciones de datos
 */
function setupDataValidations(spreadsheet) {
  // Validaciones para hoja de Conductores
  const conductoresSheet = spreadsheet.getSheetByName(TMS_CONFIG.SHEETS.CONDUCTORES);
  if (conductoresSheet) {
    // Estado del conductor
    const estadosRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(Object.values(TMS_CONFIG.ESTADOS_CONDUCTOR))
      .build();
    conductoresSheet.getRange('H:H').setDataValidation(estadosRule);
    
    // Activo (boolean)
    const activoRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(['true', 'false'])
      .build();
    conductoresSheet.getRange('L:L').setDataValidation(activoRule);
  }
  
  // Validaciones para hoja de Entregas
  const entregasSheet = spreadsheet.getSheetByName(TMS_CONFIG.SHEETS.ENTREGAS);
  if (entregasSheet) {
    // Estado de entrega
    const estadosEntregaRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(Object.values(TMS_CONFIG.ESTADOS_ENTREGA))
      .build();
    entregasSheet.getRange('G:G').setDataValidation(estadosEntregaRule);
  }
}

/**
 * Configura formatos de datos
 */
function setupDataFormats(spreadsheet) {
  // Formato de fechas
  const dateFormat = 'dd/mm/yyyy hh:mm';
  
  Object.values(TMS_CONFIG.SHEETS).forEach(sheetName => {
    const sheet = spreadsheet.getSheetByName(sheetName);
    if (sheet) {
      // Aplicar formato de fecha a columnas que contengan "Fecha" o "Timestamp"
      const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      headers.forEach((header, index) => {
        if (header.toString().toLowerCase().includes('fecha') || 
            header.toString().toLowerCase().includes('timestamp')) {
          const column = String.fromCharCode(65 + index);
          sheet.getRange(`${column}:${column}`).setNumberFormat(dateFormat);
        }
      });
    }
  });
}

/**
 * Configura fórmulas automáticas
 */
function setupAutomaticFormulas(spreadsheet) {
  // Fórmulas para cálculos automáticos en las hojas
  // Esto se puede expandir según las necesidades específicas
}

// ==================== FUNCIONES DE UTILIDAD ====================

/**
 * Obtiene la configuración actual del TMS
 */
function getTMSConfig() {
  return TMS_CONFIG;
}

/**
 * Verifica si el TMS está inicializado correctamente
 */
function isTMSInitialized() {
  try {
    const spreadsheet = SpreadsheetApp.openById(TMS_CONFIG.SPREADSHEET_ID);
    const requiredSheets = Object.values(TMS_CONFIG.SHEETS);
    
    return requiredSheets.every(sheetName => 
      spreadsheet.getSheetByName(sheetName) !== null
    );
  } catch (error) {
    console.error('TMS: Error verificando inicialización:', error);
    return false;
  }
}

/**
 * Obtiene estadísticas generales del TMS
 */
function getTMSStats() {
  try {
    const db = new TMSDatabase();
    
    const stats = {
      conductores: {
        total: db.getConductores().length,
        disponibles: db.getConductores().filter(c => c.estado === 'DISPONIBLE').length,
        enRuta: db.getConductores().filter(c => c.estado === 'EN_RUTA').length
      },
      entregas: {
        total: db.getEntregas().length,
        pendientes: db.getEntregas().filter(e => e.estado === 'PENDIENTE').length,
        enRuta: db.getEntregas().filter(e => e.estado === 'EN_RUTA').length,
        completadas: db.getEntregas().filter(e => e.estado === 'ENTREGADO').length
      },
      vehiculos: {
        total: db.getVehiculos().length,
        disponibles: db.getVehiculos().filter(v => v.estado === 'DISPONIBLE').length,
        enUso: db.getVehiculos().filter(v => v.estado === 'EN_USO').length
      }
    };
    
    return { success: true, stats };
  } catch (error) {
    console.error('TMS: Error obteniendo estadísticas:', error);
    return { success: false, error: error.message };
  }
}

// ==================== FUNCIONES DE ACCESO A DATOS ====================

/**
 * Obtiene todas las entregas del TMS
 */
function getTMSEntregas(filters = {}) {
  try {
    const spreadsheet = SpreadsheetApp.openById(TMS_CONFIG.SPREADSHEET_ID);
    const entregasSheet = spreadsheet.getSheetByName(TMS_CONFIG.SHEETS.ENTREGAS);
    
    if (!entregasSheet) {
      console.warn('getTMSEntregas: Hoja de entregas no encontrada, devolviendo datos mock');
      return getMockEntregas();
    }
    
    const data = entregasSheet.getDataRange().getValues();
    const headers = data[0];
    const rows = data.slice(1);
    
    const entregas = rows.map(row => {
      const entrega = {};
      headers.forEach((header, index) => {
        entrega[header] = row[index];
      });
      return entrega;
    });
    
    // Aplicar filtros si existen
    if (filters.estado && Array.isArray(filters.estado)) {
      return entregas.filter(e => filters.estado.includes(e.Estado));
    }
    
    if (filters.conductorId) {
      return entregas.filter(e => e.ConductorAsignado === filters.conductorId);
    }
    
    return entregas;
    
  } catch (error) {
    console.error('getTMSEntregas: Error obteniendo entregas:', error);
    return getMockEntregas();
  }
}

/**
 * Obtiene todos los conductores del TMS
 */
function getTMSConductores() {
  try {
    const spreadsheet = SpreadsheetApp.openById(TMS_CONFIG.SPREADSHEET_ID);
    const conductoresSheet = spreadsheet.getSheetByName(TMS_CONFIG.SHEETS.CONDUCTORES);
    
    if (!conductoresSheet) {
      console.warn('getTMSConductores: Hoja de conductores no encontrada, devolviendo datos mock');
      return getMockConductores();
    }
    
    const data = conductoresSheet.getDataRange().getValues();
    const headers = data[0];
    const rows = data.slice(1);
    
    return rows.map(row => {
      const conductor = {};
      headers.forEach((header, index) => {
        conductor[header] = row[index];
      });
      return conductor;
    });
    
  } catch (error) {
    console.error('getTMSConductores: Error obteniendo conductores:', error);
    return getMockConductores();
  }
}

/**
 * Obtiene un conductor por ID
 */
function getTMSConductorById(conductorId) {
  try {
    const conductores = getTMSConductores();
    return conductores.find(c => c.ID === conductorId);
  } catch (error) {
    console.error('getTMSConductorById: Error obteniendo conductor:', error);
    return null;
  }
}

/**
 * Obtiene todos los vehículos del TMS
 */
function getTMSVehiculos() {
  try {
    const spreadsheet = SpreadsheetApp.openById(TMS_CONFIG.SPREADSHEET_ID);
    const vehiculosSheet = spreadsheet.getSheetByName(TMS_CONFIG.SHEETS.VEHICULOS);
    
    if (!vehiculosSheet) {
      console.warn('getTMSVehiculos: Hoja de vehículos no encontrada, devolviendo datos mock');
      return getMockVehiculos();
    }
    
    const data = vehiculosSheet.getDataRange().getValues();
    const headers = data[0];
    const rows = data.slice(1);
    
    return rows.map(row => {
      const vehiculo = {};
      headers.forEach((header, index) => {
        vehiculo[header] = row[index];
      });
      return vehiculo;
    });
    
  } catch (error) {
    console.error('getTMSVehiculos: Error obteniendo vehículos:', error);
    return getMockVehiculos();
  }
}

/**
 * Obtiene todas las rutas del TMS
 */
function getTMSRutas() {
  try {
    const spreadsheet = SpreadsheetApp.openById(TMS_CONFIG.SPREADSHEET_ID);
    const rutasSheet = spreadsheet.getSheetByName(TMS_CONFIG.SHEETS.RUTAS);
    
    if (!rutasSheet) {
      console.warn('getTMSRutas: Hoja de rutas no encontrada, devolviendo datos mock');
      return getMockRutas();
    }
    
    const data = rutasSheet.getDataRange().getValues();
    const headers = data[0];
    const rows = data.slice(1);
    
    return rows.map(row => {
      const ruta = {};
      headers.forEach((header, index) => {
        ruta[header] = row[index];
      });
      return ruta;
    });
    
  } catch (error) {
    console.error('getTMSRutas: Error obteniendo rutas:', error);
    return getMockRutas();
  }
}

/**
 * Obtiene ubicaciones de conductores
 */
function getTMSDriverLocations() {
  try {
    const conductores = getTMSConductores();
    return conductores.filter(c => c.Estado === TMS_CONFIG.ESTADOS_CONDUCTOR.EN_RUTA).map(conductor => ({
      conductorId: conductor.ID,
      conductorNombre: `${conductor.Nombre} ${conductor.Apellido}`,
      latitud: conductor.UltimaUbicacion ? conductor.UltimaUbicacion.split(',')[0] : -33.4489,
      longitud: conductor.UltimaUbicacion ? conductor.UltimaUbicacion.split(',')[1] : -70.6693,
      estado: conductor.Estado,
      ultimaActualizacion: conductor.UltimaActualizacion
    }));
  } catch (error) {
    console.error('getTMSDriverLocations: Error obteniendo ubicaciones:', error);
    return [];
  }
}

// ==================== DATOS MOCK PARA DESARROLLO ====================

/**
 * Datos mock de entregas para desarrollo
 */
function getMockEntregas() {
  return [
    {
      NV: 'NV001',
      Cliente: 'Farmacia Central',
      Direccion: 'Av. Providencia 1234, Santiago',
      Telefono: '+56912345678',
      Estado: TMS_CONFIG.ESTADOS_ENTREGA.EN_RUTA,
      Prioridad: 'ALTA',
      ConductorAsignado: 'COND001',
      FechaAsignacion: new Date(),
      Observaciones: ''
    },
    {
      NV: 'NV002',
      Cliente: 'Hospital San Juan',
      Direccion: 'Calle Los Médicos 567, Las Condes',
      Telefono: '+56923456789',
      Estado: TMS_CONFIG.ESTADOS_ENTREGA.EN_DESTINO,
      Prioridad: 'ALTA',
      ConductorAsignado: 'COND002',
      FechaAsignacion: new Date(),
      Observaciones: 'Cliente esperando'
    },
    {
      NV: 'NV003',
      Cliente: 'Clínica Alemana',
      Direccion: 'Av. Vitacura 5951, Vitacura',
      Telefono: '+56934567890',
      Estado: TMS_CONFIG.ESTADOS_ENTREGA.EN_RUTA,
      Prioridad: 'MEDIA',
      ConductorAsignado: 'COND001',
      FechaAsignacion: new Date(),
      Observaciones: ''
    },
    {
      NV: 'NV004',
      Cliente: 'Farmacia Cruz Verde',
      Direccion: 'Av. Las Condes 12000, Las Condes',
      Telefono: '+56945678901',
      Estado: TMS_CONFIG.ESTADOS_ENTREGA.ENTREGADO,
      Prioridad: 'BAJA',
      ConductorAsignado: 'COND002',
      FechaAsignacion: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 horas atrás
      Observaciones: 'Entregado correctamente'
    },
    {
      NV: 'NV005',
      Cliente: 'Hospital Clínico UC',
      Direccion: 'Av. Diagonal Paraguay 362, Santiago',
      Telefono: '+56956789012',
      Estado: TMS_CONFIG.ESTADOS_ENTREGA.PENDIENTE,
      Prioridad: 'ALTA',
      ConductorAsignado: null,
      FechaAsignacion: null,
      Observaciones: 'Pendiente de asignación'
    }
  ];
}

/**
 * Datos mock de conductores para desarrollo
 */
function getMockConductores() {
  return [
    {
      ID: 'COND001',
      Nombre: 'Juan',
      Apellido: 'Pérez',
      Telefono: '+56912345678',
      Email: 'juan.perez@empresa.com',
      Licencia: 'B123456',
      VehiculoAsignado: 'VEH001',
      Estado: TMS_CONFIG.ESTADOS_CONDUCTOR.EN_RUTA,
      UltimaUbicacion: '-33.4489,-70.6693',
      UltimaActualizacion: new Date(),
      FechaIngreso: new Date(),
      Activo: true,
      Calificacion: 4.5,
      EntregasCompletadas: 150,
      TiempoPromedioEntrega: 25
    },
    {
      ID: 'COND002',
      Nombre: 'María',
      Apellido: 'González',
      Telefono: '+56987654321',
      Email: 'maria.gonzalez@empresa.com',
      Licencia: 'B789012',
      VehiculoAsignado: 'VEH002',
      Estado: TMS_CONFIG.ESTADOS_CONDUCTOR.EN_RUTA,
      UltimaUbicacion: '-33.4150,-70.5475',
      UltimaActualizacion: new Date(),
      FechaIngreso: new Date(),
      Activo: true,
      Calificacion: 4.8,
      EntregasCompletadas: 200,
      TiempoPromedioEntrega: 22
    },
    {
      ID: 'COND003',
      Nombre: 'Carlos',
      Apellido: 'López',
      Telefono: '+56965432109',
      Email: 'carlos.lopez@empresa.com',
      Licencia: 'B345678',
      VehiculoAsignado: 'VEH003',
      Estado: TMS_CONFIG.ESTADOS_CONDUCTOR.DISPONIBLE,
      UltimaUbicacion: '-33.4372,-70.6506',
      UltimaActualizacion: new Date(),
      FechaIngreso: new Date(),
      Activo: true,
      Calificacion: 4.2,
      EntregasCompletadas: 120,
      TiempoPromedioEntrega: 28
    }
  ];
}

/**
 * Datos mock de vehículos para desarrollo
 */
function getMockVehiculos() {
  return [
    {
      ID: 'VEH001',
      Patente: 'ABC123',
      Marca: 'Toyota',
      Modelo: 'Hiace',
      Año: 2020,
      Tipo: 'Furgón',
      CapacidadKg: 1500,
      CapacidadM3: 10,
      Estado: 'EN_USO',
      ConductorAsignado: 'COND001',
      UltimaMantencion: new Date(),
      ProximaMantencion: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      Kilometraje: 50000,
      Combustible: 80,
      Activo: true
    },
    {
      ID: 'VEH002',
      Patente: 'DEF456',
      Marca: 'Chevrolet',
      Modelo: 'N300',
      Año: 2019,
      Tipo: 'Camión',
      CapacidadKg: 3000,
      CapacidadM3: 15,
      Estado: 'EN_USO',
      ConductorAsignado: 'COND002',
      UltimaMantencion: new Date(),
      ProximaMantencion: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      Kilometraje: 75000,
      Combustible: 60,
      Activo: true
    },
    {
      ID: 'VEH003',
      Patente: 'GHI789',
      Marca: 'Ford',
      Modelo: 'Transit',
      Año: 2021,
      Tipo: 'Furgón',
      CapacidadKg: 1200,
      CapacidadM3: 8,
      Estado: 'DISPONIBLE',
      ConductorAsignado: null,
      UltimaMantencion: new Date(),
      ProximaMantencion: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      Kilometraje: 25000,
      Combustible: 90,
      Activo: true
    }
  ];
}

/**
 * Datos mock de rutas para desarrollo
 */
function getMockRutas() {
  return [
    {
      ID: 'RUTA001',
      Nombre: 'Ruta Oriente',
      Descripcion: 'Entregas zona oriente de Santiago',
      ConductorAsignado: 'COND001',
      VehiculoAsignado: 'VEH001',
      FechaCreacion: new Date(),
      FechaInicio: new Date(),
      Estado: 'EN_PROGRESO',
      Prioridad: 'ALTA',
      EntregasAsignadas: 3,
      EntregasCompletadas: 1,
      DistanciaTotal: 45,
      TiempoEstimado: 180,
      TiempoReal: 120
    },
    {
      ID: 'RUTA002',
      Nombre: 'Ruta Centro',
      Descripcion: 'Entregas zona centro de Santiago',
      ConductorAsignado: 'COND002',
      VehiculoAsignado: 'VEH002',
      FechaCreacion: new Date(),
      FechaInicio: new Date(),
      Estado: 'EN_PROGRESO',
      Prioridad: 'MEDIA',
      EntregasAsignadas: 2,
      EntregasCompletadas: 1,
      DistanciaTotal: 30,
      TiempoEstimado: 120,
      TiempoReal: 90
    }
  ];
}

/**
 * Función principal para manejar requests del frontend
 */
function handleTMSRequest(action, data) {
  try {
    console.log(`TMS: Procesando acción: ${action}`);
    
    switch (action) {
      case 'init':
        return initializeTMS();
      
      case 'getStats':
        return getTMSStats();
      
      case 'getConductores':
        return new TMSDatabase().getConductores();
      
      case 'getEntregas':
        return new TMSDatabase().getEntregas();
      
      case 'getRutas':
        return new TMSDatabase().getRutas();
      
      case 'getVehiculos':
        return new TMSDatabase().getVehiculos();
      
      default:
        throw new Error(`Acción no reconocida: ${action}`);
    }
  } catch (error) {
    console.error(`TMS: Error procesando ${action}:`, error);
    return { success: false, error: error.message };
  }
}

/**
 * Función de inicialización automática del TMS
 * Se ejecuta al cargar el sistema
 */
function autoInitTMS() {
  try {
    console.log('TMS: Auto-inicialización...');
    
    // Verificar si ya está inicializado
    if (isTMSInitialized()) {
      console.log('TMS: Ya está inicializado');
      return { success: true, message: 'TMS ya inicializado' };
    }
    
    // Inicializar automáticamente
    const result = initializeTMS();
    
    if (result.success) {
      console.log('TMS: Auto-inicialización exitosa');
    } else {
      console.error('TMS: Error en auto-inicialización:', result.error);
    }
    
    return result;
    
  } catch (error) {
    console.error('TMS: Error en auto-inicialización:', error);
    return { success: false, error: error.message };
  }
}

// ==================== FUNCIONES DE TESTING ====================

/**
 * Función de testing - crea datos de prueba
 */
function createTestData() {
  try {
    console.log('TMS: Creando datos de prueba...');
    
    // Inicializar TMS si no está inicializado
    if (!isTMSInitialized()) {
      initializeTMS();
    }
    
    // Los datos de ejemplo ya se crean en las funciones setup
    console.log('TMS: Datos de prueba creados correctamente');
    return { success: true, message: 'Datos de prueba creados' };
    
  } catch (error) {
    console.error('TMS: Error creando datos de prueba:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Función para limpiar datos de prueba
 */
function clearTestData() {
  try {
    console.log('TMS: Limpiando datos de prueba...');
    
    const spreadsheet = SpreadsheetApp.openById(TMS_CONFIG.SPREADSHEET_ID);
    
    // Limpiar todas las hojas TMS excepto headers
    Object.values(TMS_CONFIG.SHEETS).forEach(sheetName => {
      const sheet = spreadsheet.getSheetByName(sheetName);
      if (sheet && sheet.getLastRow() > 1) {
        sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).clearContent();
      }
    });
    
    console.log('TMS: Datos de prueba limpiados correctamente');
    return { success: true, message: 'Datos de prueba limpiados' };
    
  } catch (error) {
    console.error('TMS: Error limpiando datos de prueba:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Función de testing completo del TMS
 * Ejecutar desde el editor de GAS para probar todo el sistema
 */
function testTMSComplete() {
  console.log('=== PRUEBA COMPLETA DEL SISTEMA TMS ===');
  
  try {
    // 1. Probar inicialización
    console.log('\n1. Probando inicialización...');
    var initResult = autoInitTMS();
    console.log('Resultado inicialización:', initResult);
    
    // 2. Probar obtención de datos
    console.log('\n2. Probando obtención de datos...');
    var entregas = getTMSEntregas();
    var conductores = getTMSConductores();
    var vehiculos = getTMSVehiculos();
    var rutas = getTMSRutas();
    
    console.log('Entregas obtenidas:', entregas ? entregas.length : 0);
    console.log('Conductores obtenidos:', conductores ? conductores.length : 0);
    console.log('Vehículos obtenidos:', vehiculos ? vehiculos.length : 0);
    console.log('Rutas obtenidas:', rutas ? rutas.length : 0);
    
    // 3. Probar dashboard
    console.log('\n3. Probando dashboard...');
    var dashboardResult = getTMSDashboardData();
    console.log('Dashboard result:', dashboardResult.success ? 'SUCCESS' : 'ERROR');
    if (dashboardResult.success) {
      console.log('Métricas disponibles:', Object.keys(dashboardResult.data.metrics || {}));
      console.log('Entregas activas:', dashboardResult.data.activeDeliveries ? dashboardResult.data.activeDeliveries.length : 0);
    }
    
    // 4. Probar permisos
    console.log('\n4. Probando permisos TMS...');
    var permissionsResult = ensureTMSPermissionsForCurrentUser();
    console.log('Permisos result:', permissionsResult);
    
    console.log('\n=== PRUEBA COMPLETADA ===');
    
    return {
      success: true,
      results: {
        initialization: initResult,
        dataAccess: {
          entregas: entregas ? entregas.length : 0,
          conductores: conductores ? conductores.length : 0,
          vehiculos: vehiculos ? vehiculos.length : 0,
          rutas: rutas ? rutas.length : 0
        },
        dashboard: dashboardResult.success,
        permissions: permissionsResult.success
      }
    };
    
  } catch (error) {
    console.error('Error en prueba completa TMS:', error);
    return { success: false, error: error.message };
  }
}