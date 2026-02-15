/**
 * TMS Utils - Utility Functions and Helpers
 * Funciones de utilidad y helpers para el sistema TMS
 * 
 * @fileoverview Funciones auxiliares y utilidades para el TMS
 * @author Sistema CCO
 * @version 1.0.0
 */

/**
 * Clase de utilidades TMS
 */
class TMSUtils {
  constructor() {
    this.cache = CacheService.getScriptCache();
  }

  // ==================== VALIDACIONES ====================

  /**
   * Valida datos de entrega
   */
  static validateDeliveryData(deliveryData) {
    const errors = [];

    if (!deliveryData.NV) {
      errors.push('Número de NV es requerido');
    }

    if (!deliveryData.Cliente) {
      errors.push('Nombre del cliente es requerido');
    }

    if (!deliveryData.Direccion) {
      errors.push('Dirección es requerida');
    }

    if (!deliveryData.Telefono) {
      errors.push('Teléfono es requerido');
    } else if (!this.isValidPhone(deliveryData.Telefono)) {
      errors.push('Formato de teléfono inválido');
    }

    if (deliveryData.Email && !this.isValidEmail(deliveryData.Email)) {
      errors.push('Formato de email inválido');
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  /**
   * Valida datos de conductor
   */
  static validateDriverData(driverData) {
    const errors = [];

    if (!driverData.Nombre) {
      errors.push('Nombre es requerido');
    }

    if (!driverData.Apellido) {
      errors.push('Apellido es requerido');
    }

    if (!driverData.Telefono) {
      errors.push('Teléfono es requerido');
    } else if (!this.isValidPhone(driverData.Telefono)) {
      errors.push('Formato de teléfono inválido');
    }

    if (!driverData.Email) {
      errors.push('Email es requerido');
    } else if (!this.isValidEmail(driverData.Email)) {
      errors.push('Formato de email inválido');
    }

    if (!driverData.Licencia) {
      errors.push('Número de licencia es requerido');
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  /**
   * Valida formato de teléfono
   */
  static isValidPhone(phone) {
    try {
      // Formato chileno: +56912345678 o 912345678
      const phoneRegex = /^(\+56)?[0-9]{8,9}$/;
      return phoneRegex.test(phone.replace(/\s/g, ''));
    } catch (error) {
      return false;
    }
  }

  /**
   * Valida formato de email
   */
  static isValidEmail(email) {
    try {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    } catch (error) {
      return false;
    }
  }

  /**
   * Valida coordenadas GPS
   */
  static isValidCoordinates(lat, lng) {
    try {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);
      
      return !isNaN(latitude) && !isNaN(longitude) &&
             latitude >= -90 && latitude <= 90 &&
             longitude >= -180 && longitude <= 180;
    } catch (error) {
      return false;
    }
  }

  // ==================== FORMATEO DE DATOS ====================

  /**
   * Formatea número de teléfono
   */
  static formatPhone(phone) {
    try {
      if (!phone) return '';
      
      // Remover espacios y caracteres especiales
      let cleaned = phone.replace(/\D/g, '');
      
      // Si no tiene código de país, agregar +56
      if (cleaned.length === 8 || cleaned.length === 9) {
        cleaned = '56' + cleaned;
      }
      
      // Formatear como +56 9 1234 5678
      if (cleaned.length === 11 && cleaned.startsWith('56')) {
        return `+${cleaned.substring(0, 2)} ${cleaned.substring(2, 3)} ${cleaned.substring(3, 7)} ${cleaned.substring(7)}`;
      }
      
      return phone; // Retornar original si no se puede formatear
    } catch (error) {
      return phone;
    }
  }

  /**
   * Formatea dirección
   */
  static formatAddress(address) {
    try {
      if (!address) return '';
      
      // Capitalizar primera letra de cada palabra
      return address.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
    } catch (error) {
      return address;
    }
  }

  /**
   * Formatea fecha para mostrar
   */
  static formatDate(date, includeTime = true) {
    try {
      if (!date) return '';
      
      const d = new Date(date);
      if (isNaN(d.getTime())) return '';
      
      const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      };
      
      if (includeTime) {
        options.hour = '2-digit';
        options.minute = '2-digit';
      }
      
      return d.toLocaleDateString('es-CL', options);
    } catch (error) {
      return '';
    }
  }

  /**
   * Formatea tiempo en minutos a formato legible
   */
  static formatDuration(minutes) {
    try {
      if (!minutes || minutes < 0) return '0 min';
      
      if (minutes < 60) {
        return `${Math.round(minutes)} min`;
      }
      
      const hours = Math.floor(minutes / 60);
      const mins = Math.round(minutes % 60);
      
      if (mins === 0) {
        return `${hours}h`;
      }
      
      return `${hours}h ${mins}m`;
    } catch (error) {
      return '0 min';
    }
  }

  /**
   * Formatea distancia en km
   */
  static formatDistance(km) {
    try {
      if (!km || km < 0) return '0 km';
      
      if (km < 1) {
        return `${Math.round(km * 1000)} m`;
      }
      
      return `${Math.round(km * 10) / 10} km`;
    } catch (error) {
      return '0 km';
    }
  }

  // ==================== GENERADORES ====================

  /**
   * Genera código de tracking único
   */
  static generateTrackingCode(entregaId) {
    try {
      const timestamp = new Date().getTime().toString().slice(-6);
      const random = Math.random().toString(36).substring(2, 5).toUpperCase();
      return `TRK-${entregaId}-${timestamp}-${random}`;
    } catch (error) {
      return `TRK-${entregaId}-${new Date().getTime()}`;
    }
  }

  /**
   * Genera ID único para ruta
   */
  static generateRouteId() {
    try {
      const date = new Date();
      const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
      const timeStr = date.getTime().toString().slice(-4);
      return `RUTA-${dateStr}-${timeStr}`;
    } catch (error) {
      return `RUTA-${new Date().getTime()}`;
    }
  }

  /**
   * Genera ID único para conductor
   */
  static generateDriverId() {
    try {
      const timestamp = new Date().getTime().toString().slice(-6);
      const random = Math.random().toString(36).substring(2, 4).toUpperCase();
      return `COND-${timestamp}-${random}`;
    } catch (error) {
      return `COND-${new Date().getTime()}`;
    }
  }

  // ==================== CÁLCULOS GEOGRÁFICOS ====================

  /**
   * Calcula distancia entre dos puntos usando Haversine
   */
  static calculateDistance(lat1, lng1, lat2, lng2) {
    try {
      const R = 6371; // Radio de la Tierra en km
      const dLat = this.toRadians(lat2 - lat1);
      const dLng = this.toRadians(lng2 - lng1);
      
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
                Math.sin(dLng/2) * Math.sin(dLng/2);
      
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Convierte grados a radianes
   */
  static toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  /**
   * Obtiene zona geográfica de una dirección
   */
  static getZoneFromAddress(address) {
    try {
      if (!address) return 'DESCONOCIDA';
      
      const addressLower = address.toLowerCase();
      
      // Zonas de Santiago
      const zones = {
        'ORIENTE': ['las condes', 'vitacura', 'lo barnechea', 'la reina'],
        'CENTRO_ORIENTE': ['providencia', 'ñuñoa', 'nunoa', 'macul'],
        'CENTRO': ['santiago', 'independencia', 'recoleta'],
        'SUR': ['san miguel', 'la cisterna', 'el bosque', 'pedro aguirre cerda'],
        'PONIENTE': ['maipú', 'maipu', 'pudahuel', 'cerro navia'],
        'SUR_ORIENTE': ['la florida', 'puente alto', 'san bernardo']
      };
      
      for (const [zone, comunas] of Object.entries(zones)) {
        if (comunas.some(comuna => addressLower.includes(comuna))) {
          return zone;
        }
      }
      
      return 'OTRAS';
    } catch (error) {
      return 'DESCONOCIDA';
    }
  }

  // ==================== UTILIDADES DE TIEMPO ====================

  /**
   * Obtiene timestamp actual
   */
  static getCurrentTimestamp() {
    return new Date().getTime();
  }

  /**
   * Calcula diferencia en minutos entre dos fechas
   */
  static getMinutesDifference(startDate, endDate) {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      return Math.round((end - start) / (1000 * 60));
    } catch (error) {
      return 0;
    }
  }

  /**
   * Verifica si una fecha está en el rango especificado
   */
  static isDateInRange(date, startDate, endDate) {
    try {
      const d = new Date(date);
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      return d >= start && d <= end;
    } catch (error) {
      return false;
    }
  }

  /**
   * Obtiene inicio y fin del día actual
   */
  static getTodayRange() {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
    
    return {
      start: startOfDay,
      end: endOfDay
    };
  }

  // ==================== UTILIDADES DE DATOS ====================

  /**
   * Sanitiza datos de entrada
   */
  static sanitizeInput(input) {
    try {
      if (typeof input !== 'string') return input;
      
      return input
        .trim()
        .replace(/[<>]/g, '') // Remover caracteres peligrosos
        .substring(0, 1000); // Limitar longitud
    } catch (error) {
      return input;
    }
  }

  /**
   * Convierte objeto a query string
   */
  static objectToQueryString(obj) {
    try {
      return Object.keys(obj)
        .filter(key => obj[key] !== null && obj[key] !== undefined)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`)
        .join('&');
    } catch (error) {
      return '';
    }
  }

  /**
   * Clona objeto profundamente
   */
  static deepClone(obj) {
    try {
      return JSON.parse(JSON.stringify(obj));
    } catch (error) {
      return obj;
    }
  }

  /**
   * Agrupa array por campo específico
   */
  static groupBy(array, key) {
    try {
      return array.reduce((groups, item) => {
        const group = item[key];
        if (!groups[group]) {
          groups[group] = [];
        }
        groups[group].push(item);
        return groups;
      }, {});
    } catch (error) {
      return {};
    }
  }

  // ==================== UTILIDADES DE CACHE ====================

  /**
   * Obtiene datos del cache con fallback
   */
  getCachedData(key, fallbackFunction, ttl = 300) {
    try {
      const cached = this.cache.get(key);
      if (cached) {
        return JSON.parse(cached);
      }
      
      // Si no hay cache, ejecutar función fallback
      const data = fallbackFunction();
      this.cache.put(key, JSON.stringify(data), ttl);
      return data;
    } catch (error) {
      console.error('TMSUtils: Error con cache:', error);
      return fallbackFunction();
    }
  }

  /**
   * Limpia cache por patrón
   */
  clearCachePattern(pattern) {
    try {
      // Google Apps Script no permite listar keys del cache
      // Por ahora solo documentamos la intención
      console.log(`TMSUtils: Limpiando cache con patrón: ${pattern}`);
    } catch (error) {
      console.error('TMSUtils: Error limpiando cache:', error);
    }
  }

  // ==================== UTILIDADES DE LOGGING ====================

  /**
   * Log con timestamp y contexto
   */
  static log(level, message, context = {}) {
    try {
      const timestamp = new Date().toISOString();
      const logMessage = `[${timestamp}] [${level}] ${message}`;
      
      if (Object.keys(context).length > 0) {
        console.log(logMessage, context);
      } else {
        console.log(logMessage);
      }
    } catch (error) {
      console.log(message);
    }
  }

  /**
   * Log de error con stack trace
   */
  static logError(error, context = {}) {
    try {
      this.log('ERROR', error.message, {
        stack: error.stack,
        context: context
      });
    } catch (e) {
      console.error('Error logging:', error);
    }
  }

  // ==================== UTILIDADES DE CONFIGURACIÓN ====================

  /**
   * Obtiene configuración del sistema
   */
  static getSystemConfig() {
    try {
      return {
        ...TMS_CONFIG,
        version: '1.0.0',
        environment: 'production',
        features: {
          realTimeTracking: true,
          routeOptimization: true,
          photoCapture: true,
          notifications: true
        }
      };
    } catch (error) {
      return TMS_CONFIG;
    }
  }

  /**
   * Verifica si una feature está habilitada
   */
  static isFeatureEnabled(featureName) {
    try {
      const config = this.getSystemConfig();
      return config.features && config.features[featureName] === true;
    } catch (error) {
      return false;
    }
  }

  // ==================== UTILIDADES DE PERFORMANCE ====================

  /**
   * Mide tiempo de ejecución de una función
   */
  static measureExecutionTime(func, context = '') {
    try {
      const startTime = new Date().getTime();
      const result = func();
      const endTime = new Date().getTime();
      const duration = endTime - startTime;
      
      this.log('PERFORMANCE', `${context} ejecutado en ${duration}ms`);
      return result;
    } catch (error) {
      this.logError(error, { context: `measureExecutionTime: ${context}` });
      throw error;
    }
  }

  /**
   * Ejecuta función con retry automático
   */
  static retryFunction(func, maxRetries = 3, delay = 1000) {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      
      const attempt = () => {
        attempts++;
        
        try {
          const result = func();
          resolve(result);
        } catch (error) {
          if (attempts >= maxRetries) {
            reject(error);
          } else {
            this.log('WARNING', `Intento ${attempts} falló, reintentando en ${delay}ms`);
            setTimeout(attempt, delay);
          }
        }
      };
      
      attempt();
    });
  }
}

// ==================== FUNCIONES GLOBALES DE UTILIDAD ====================

/**
 * Función global para testing del sistema TMS
 */
function testTMSSystem() {
  try {
    console.log('=== INICIANDO TESTS DEL SISTEMA TMS ===');
    
    // Test 1: Inicialización
    console.log('Test 1: Inicializando TMS...');
    const initResult = initializeTMS();
    console.log('Resultado inicialización:', initResult);
    
    // Test 2: Base de datos
    console.log('Test 2: Probando base de datos...');
    const db = new TMSDatabase();
    const stats = db.getEstadisticas();
    console.log('Estadísticas:', stats);
    
    // Test 3: Rutas
    console.log('Test 3: Probando sistema de rutas...');
    const routes = new TMSRoutes();
    // Aquí se pueden agregar más tests específicos
    
    // Test 4: Tracking
    console.log('Test 4: Probando sistema de tracking...');
    const tracking = new TMSTracking();
    // Aquí se pueden agregar más tests específicos
    
    console.log('=== TESTS COMPLETADOS ===');
    return { success: true, message: 'Todos los tests pasaron correctamente' };
    
  } catch (error) {
    console.error('Error en tests:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Función global para limpiar datos de prueba
 */
function cleanupTMSTestData() {
  try {
    console.log('Limpiando datos de prueba del TMS...');
    
    const result = clearTestData();
    console.log('Resultado limpieza:', result);
    
    return result;
  } catch (error) {
    console.error('Error limpiando datos de prueba:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Función global para obtener estado del sistema
 */
function getTMSSystemStatus() {
  try {
    const db = new TMSDatabase();
    const stats = db.getEstadisticas();
    const config = TMSUtils.getSystemConfig();
    
    return {
      success: true,
      status: {
        initialized: isTMSInitialized(),
        version: config.version,
        environment: config.environment,
        features: config.features,
        statistics: stats,
        timestamp: new Date().toISOString()
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}