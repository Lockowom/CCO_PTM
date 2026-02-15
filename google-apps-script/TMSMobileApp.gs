/**
 * TMS Mobile App Backend Controller
 * Provides API endpoints for the mobile PWA driver application
 * 
 * @fileoverview Backend services for TMS mobile driver app
 * @author TMS Development Team
 * @version 1.0.0
 */

/**
 * TMSMobileApp class - Main controller for mobile app backend
 */
class TMSMobileApp {
  constructor() {
    this.database = new TMSDatabase();
    this.tracking = new TMSTracking();
    this.utils = new TMSUtils();
  }

  /**
   * Get driver profile and current session data
   * @param {string} driverId - Driver ID
   * @returns {Object} Driver profile data
   */
  getDriverProfile(driverId) {
    try {
      const driver = this.database.getDriver(driverId);
      if (!driver) {
        throw new Error('Driver not found');
      }

      // Get current route assignment
      const currentRoute = this.database.getDriverCurrentRoute(driverId);
      
      // Get today's statistics
      const todayStats = this.getTodayStatistics(driverId);

      return {
        success: true,
        data: {
          driver: {
            id: driver.id,
            nombre: driver.nombre,
            telefono: driver.telefono,
            vehiculo: driver.vehiculo,
            estado: driver.estado,
            ubicacion: driver.ubicacion
          },
          currentRoute: currentRoute,
          statistics: todayStats,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('TMSMobileApp: Error getting driver profile:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get driver's tasks for today
   * @param {string} driverId - Driver ID
   * @returns {Object} Tasks data
   */
  getDriverTasks(driverId) {
    try {
      const tasks = this.database.getDriverTasks(driverId);
      
      // Sort tasks by priority and sequence
      const sortedTasks = tasks.sort((a, b) => {
        if (a.estado === 'PENDIENTE' && b.estado !== 'PENDIENTE') return -1;
        if (a.estado !== 'PENDIENTE' && b.estado === 'PENDIENTE') return 1;
        return a.secuencia - b.secuencia;
      });

      // Get next task
      const nextTask = sortedTasks.find(task => task.estado === 'PENDIENTE');

      return {
        success: true,
        data: {
          tasks: sortedTasks,
          nextTask: nextTask,
          summary: {
            total: tasks.length,
            pending: tasks.filter(t => t.estado === 'PENDIENTE').length,
            completed: tasks.filter(t => t.estado === 'ENTREGADO').length,
            failed: tasks.filter(t => t.estado === 'FALLIDA').length
          },
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('TMSMobileApp: Error getting driver tasks:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get specific task details
   * @param {string} taskId - Task/Delivery ID
   * @param {string} driverId - Driver ID for validation
   * @returns {Object} Task details
   */
  getTaskDetails(taskId, driverId) {
    try {
      const task = this.database.getDelivery(taskId);
      if (!task) {
        throw new Error('Task not found');
      }

      // Validate driver assignment
      if (task.conductorId !== driverId) {
        throw new Error('Task not assigned to this driver');
      }

      // Get additional details
      const products = this.database.getDeliveryProducts(taskId);
      const history = this.database.getDeliveryHistory(taskId);

      return {
        success: true,
        data: {
          task: task,
          products: products,
          history: history,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('TMSMobileApp: Error getting task details:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Update task status
   * @param {string} taskId - Task ID
   * @param {string} driverId - Driver ID
   * @param {string} status - New status
   * @param {Object} data - Additional data (location, notes, etc.)
   * @returns {Object} Update result
   */
  updateTaskStatus(taskId, driverId, status, data = {}) {
    try {
      const task = this.database.getDelivery(taskId);
      if (!task) {
        throw new Error('Task not found');
      }

      if (task.conductorId !== driverId) {
        throw new Error('Task not assigned to this driver');
      }

      // Validate status transition
      if (!this.isValidStatusTransition(task.estado, status)) {
        throw new Error(`Invalid status transition from ${task.estado} to ${status}`);
      }

      // Update task
      const updateData = {
        estado: status,
        fechaActualizacion: new Date(),
        ...data
      };

      if (status === 'ENTREGADO') {
        updateData.fechaEntrega = new Date();
        updateData.horaEntrega = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'HH:mm');
      }

      const updated = this.database.updateDelivery(taskId, updateData);

      // Log the status change
      this.database.logDeliveryHistory(taskId, {
        accion: `Estado cambiado a ${status}`,
        usuario: driverId,
        fecha: new Date(),
        detalles: data.observaciones || ''
      });

      // Update driver location if provided
      if (data.ubicacion) {
        this.tracking.updateDriverLocation(driverId, data.ubicacion);
      }

      return {
        success: true,
        data: {
          task: updated,
          message: `Task status updated to ${status}`,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('TMSMobileApp: Error updating task status:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Upload delivery photo
   * @param {string} taskId - Task ID
   * @param {string} driverId - Driver ID
   * @param {Blob} photoBlob - Photo data
   * @param {Object} metadata - Photo metadata
   * @returns {Object} Upload result
   */
  uploadDeliveryPhoto(taskId, driverId, photoBlob, metadata = {}) {
    try {
      // Use the dedicated camera system
      const camera = new TMSCamera();
      camera.init();
      
      // Add driver and task info to metadata
      const enhancedMetadata = {
        ...metadata,
        taskId: taskId,
        driverId: driverId,
        photoType: metadata.photoType || 'delivery',
        timestamp: new Date().toISOString()
      };

      return camera.processDeliveryPhoto(taskId, driverId, photoBlob, enhancedMetadata);
      
    } catch (error) {
      console.error('TMSMobileApp: Error uploading photo:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Update driver location
   * @param {string} driverId - Driver ID
   * @param {Object} location - Location data {lat, lng, accuracy, timestamp}
   * @returns {Object} Update result
   */
  updateDriverLocation(driverId, location) {
    try {
      const result = this.tracking.updateDriverLocation(driverId, location);
      
      return {
        success: true,
        data: {
          location: result,
          message: 'Location updated successfully',
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('TMSMobileApp: Error updating location:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get route information for driver
   * @param {string} driverId - Driver ID
   * @returns {Object} Route data
   */
  getDriverRoute(driverId) {
    try {
      const route = this.database.getDriverCurrentRoute(driverId);
      if (!route) {
        return {
          success: true,
          data: {
            route: null,
            message: 'No active route assigned',
            timestamp: new Date().toISOString()
          }
        };
      }

      // Get route deliveries
      const deliveries = this.database.getRouteDeliveries(route.id);
      
      // Calculate progress
      const completed = deliveries.filter(d => d.estado === 'ENTREGADO').length;
      const progress = deliveries.length > 0 ? Math.round((completed / deliveries.length) * 100) : 0;

      return {
        success: true,
        data: {
          route: {
            ...route,
            totalEntregas: deliveries.length,
            completadas: completed,
            pendientes: deliveries.length - completed,
            progreso: progress
          },
          deliveries: deliveries,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('TMSMobileApp: Error getting driver route:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Report an issue
   * @param {string} driverId - Driver ID
   * @param {Object} issue - Issue data
   * @returns {Object} Report result
   */
  reportIssue(driverId, issue) {
    try {
      const issueData = {
        id: this.utils.generateId('ISS'),
        conductorId: driverId,
        tipo: issue.tipo || 'GENERAL',
        descripcion: issue.descripcion,
        ubicacion: issue.ubicacion,
        fecha: new Date(),
        estado: 'ABIERTO',
        prioridad: issue.prioridad || 'MEDIA'
      };

      // Save to issues sheet (create if doesn't exist)
      const result = this.database.createIssue(issueData);

      // Notify administrators (optional)
      this.notifyAdministrators(issueData);

      return {
        success: true,
        data: {
          issue: result,
          message: 'Issue reported successfully',
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('TMSMobileApp: Error reporting issue:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Sync offline data
   * @param {string} driverId - Driver ID
   * @param {Array} offlineActions - Array of offline actions to sync
   * @returns {Object} Sync result
   */
  syncOfflineData(driverId, offlineActions) {
    try {
      // Use the dedicated offline system
      const offline = new TMSOffline();
      return offline.syncOfflineData(driverId, offlineActions);
      
    } catch (error) {
      console.error('TMSMobileApp: Error syncing offline data:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Helper methods

  /**
   * Get today's statistics for driver
   * @param {string} driverId - Driver ID
   * @returns {Object} Statistics
   */
  getTodayStatistics(driverId) {
    const today = new Date();
    const todayStr = Utilities.formatDate(today, Session.getScriptTimeZone(), 'yyyy-MM-dd');
    
    const todayTasks = this.database.getDriverTasksByDate(driverId, todayStr);
    
    return {
      totalTasks: todayTasks.length,
      completed: todayTasks.filter(t => t.estado === 'ENTREGADO').length,
      pending: todayTasks.filter(t => t.estado === 'PENDIENTE').length,
      failed: todayTasks.filter(t => t.estado === 'FALLIDA').length,
      hoursWorked: this.calculateWorkedHours(todayTasks)
    };
  }

  /**
   * Calculate worked hours from tasks
   * @param {Array} tasks - Array of tasks
   * @returns {number} Hours worked
   */
  calculateWorkedHours(tasks) {
    const completedTasks = tasks.filter(t => t.estado === 'ENTREGADO' && t.fechaEntrega);
    if (completedTasks.length === 0) return 0;

    const startTime = Math.min(...completedTasks.map(t => new Date(t.fechaInicio || t.fechaCreacion).getTime()));
    const endTime = Math.max(...completedTasks.map(t => new Date(t.fechaEntrega).getTime()));
    
    return Math.round(((endTime - startTime) / (1000 * 60 * 60)) * 10) / 10;
  }

  /**
   * Validate status transition
   * @param {string} currentStatus - Current status
   * @param {string} newStatus - New status
   * @returns {boolean} Is valid transition
   */
  isValidStatusTransition(currentStatus, newStatus) {
    const validTransitions = {
      'PENDIENTE': ['EN_RUTA', 'ENTREGADO', 'FALLIDA', 'REPROGRAMADO'],
      'EN_RUTA': ['ENTREGADO', 'FALLIDA', 'REPROGRAMADO'],
      'ENTREGADO': [], // Final state
      'FALLIDA': ['REPROGRAMADO'],
      'REPROGRAMADO': ['PENDIENTE']
    };

    return validTransitions[currentStatus]?.includes(newStatus) || false;
  }

  /**
   * Get or create photo folder in Google Drive
   * @returns {DriveApp.Folder} Photo folder
   */
  getOrCreatePhotoFolder() {
    const folderName = 'TMS_Delivery_Photos';
    const folders = DriveApp.getFoldersByName(folderName);
    
    if (folders.hasNext()) {
      return folders.next();
    } else {
      return DriveApp.createFolder(folderName);
    }
  }

  /**
   * Notify administrators about issues
   * @param {Object} issue - Issue data
   */
  notifyAdministrators(issue) {
    try {
      // This could send emails, create notifications, etc.
      console.log('TMSMobileApp: Issue reported:', issue);
      // Implementation depends on notification requirements
    } catch (error) {
      console.error('TMSMobileApp: Error notifying administrators:', error);
    }
  }
}

// Global functions for frontend integration

/**
 * Get driver profile data
 * @param {string} driverId - Driver ID
 * @returns {Object} Driver profile
 */
function getMobileDriverProfile(driverId) {
  const mobileApp = new TMSMobileApp();
  return mobileApp.getDriverProfile(driverId);
}

/**
 * Get driver tasks
 * @param {string} driverId - Driver ID
 * @returns {Object} Tasks data
 */
function getMobileDriverTasks(driverId) {
  const mobileApp = new TMSMobileApp();
  return mobileApp.getDriverTasks(driverId);
}

/**
 * Get task details
 * @param {string} taskId - Task ID
 * @param {string} driverId - Driver ID
 * @returns {Object} Task details
 */
function getMobileTaskDetails(taskId, driverId) {
  const mobileApp = new TMSMobileApp();
  return mobileApp.getTaskDetails(taskId, driverId);
}

/**
 * Update task status from mobile
 * @param {string} taskId - Task ID
 * @param {string} driverId - Driver ID
 * @param {string} status - New status
 * @param {Object} data - Additional data
 * @returns {Object} Update result
 */
function updateMobileTaskStatus(taskId, driverId, status, data) {
  const mobileApp = new TMSMobileApp();
  return mobileApp.updateTaskStatus(taskId, driverId, status, data);
}

/**
 * Upload delivery photo from mobile
 * @param {string} taskId - Task ID
 * @param {string} driverId - Driver ID
 * @param {Blob} photoBlob - Photo data
 * @param {Object} metadata - Photo metadata
 * @returns {Object} Upload result
 */
function uploadMobileDeliveryPhoto(taskId, driverId, photoBlob, metadata) {
  const camera = new TMSCamera();
  camera.init();
  
  // Add mobile-specific metadata
  const enhancedMetadata = {
    ...metadata,
    source: 'mobile_app',
    timestamp: new Date().toISOString()
  };
  
  return camera.processDeliveryPhoto(taskId, driverId, photoBlob, enhancedMetadata);
}

/**
 * Update driver location from mobile
 * @param {string} driverId - Driver ID
 * @param {Object} location - Location data
 * @returns {Object} Update result
 */
function updateMobileDriverLocation(driverId, location) {
  const mobileApp = new TMSMobileApp();
  return mobileApp.updateDriverLocation(driverId, location);
}

/**
 * Get driver route from mobile
 * @param {string} driverId - Driver ID
 * @returns {Object} Route data
 */
function getMobileDriverRoute(driverId) {
  const mobileApp = new TMSMobileApp();
  return mobileApp.getDriverRoute(driverId);
}

/**
 * Report issue from mobile
 * @param {string} driverId - Driver ID
 * @param {Object} issue - Issue data
 * @returns {Object} Report result
 */
function reportMobileIssue(driverId, issue) {
  const mobileApp = new TMSMobileApp();
  return mobileApp.reportIssue(driverId, issue);
}

/**
 * Sync offline data from mobile
 * @param {string} driverId - Driver ID
 * @param {Array} offlineActions - Offline actions to sync
 * @returns {Object} Sync result
 */
function syncMobileOfflineData(driverId, offlineActions) {
  const offline = new TMSOffline();
  return offline.syncOfflineData(driverId, offlineActions);
}

/**
 * Handle mobile app routing
 * @param {string} page - Page to serve
 * @returns {HtmlOutput} HTML page
 */
function serveMobilePage(page) {
  try {
    switch (page) {
      case 'mobile':
      case 'app':
        return HtmlService.createTemplateFromFile('TMS_Mobile_Index')
          .evaluate()
          .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
          .addMetaTag('viewport', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
          
      case 'tasks':
        return HtmlService.createTemplateFromFile('TMS_Mobile_Tasks')
          .evaluate()
          .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
          .addMetaTag('viewport', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
          
      case 'navigation':
        return HtmlService.createTemplateFromFile('TMS_Mobile_Navigation')
          .evaluate()
          .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
          .addMetaTag('viewport', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
          
      case 'manifest':
        const manifest = HtmlService.createTemplateFromFile('TMS_Manifest')
          .evaluate()
          .setMimeType(ContentService.MimeType.JSON);
        return manifest;
        
      case 'sw':
      case 'serviceworker':
        const sw = HtmlService.createTemplateFromFile('TMS_ServiceWorker')
          .evaluate()
          .setMimeType(ContentService.MimeType.JAVASCRIPT);
        return sw;
        
      default:
        throw new Error('Page not found');
    }
  } catch (error) {
    console.error('TMSMobileApp: Error serving mobile page:', error);
    return HtmlService.createHtmlOutput('<h1>Error</h1><p>Page not found</p>');
  }
}

console.log('TMSMobileApp: Backend controller loaded successfully');