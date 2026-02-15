/**
 * TMS Offline Functionality System
 * Handles offline data storage, synchronization, and conflict resolution
 * 
 * @fileoverview Offline capabilities for TMS mobile app
 * @author TMS Development Team
 * @version 1.0.0
 */

/**
 * TMSOffline class - Manages offline functionality and data synchronization
 */
class TMSOffline {
  constructor() {
    this.database = new TMSDatabase();
    this.utils = new TMSUtils();
    this.syncBatchSize = 50;
    this.maxRetries = 3;
    this.syncTimeout = 30000; // 30 seconds
  }

  /**
   * Process offline data synchronization
   * @param {string} driverId - Driver ID
   * @param {Array} offlineActions - Array of offline actions to sync
   * @returns {Object} Sync result
   */
  syncOfflineData(driverId, offlineActions) {
    try {
      console.log(`TMSOffline: Starting sync for driver ${driverId} with ${offlineActions.length} actions`);

      const results = {
        successful: [],
        failed: [],
        conflicts: [],
        summary: {
          total: offlineActions.length,
          processed: 0,
          successful: 0,
          failed: 0,
          conflicts: 0
        }
      };

      // Process actions in batches
      const batches = this.createBatches(offlineActions, this.syncBatchSize);
      
      for (const batch of batches) {
        const batchResult = this.processBatch(driverId, batch);
        this.mergeBatchResults(results, batchResult);
      }

      // Update summary
      results.summary.processed = results.successful.length + results.failed.length + results.conflicts.length;
      results.summary.successful = results.successful.length;
      results.summary.failed = results.failed.length;
      results.summary.conflicts = results.conflicts.length;

      console.log('TMSOffline: Sync completed:', results.summary);

      return {
        success: true,
        data: results,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('TMSOffline: Sync error:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Create batches from actions array
   * @param {Array} actions - Actions to batch
   * @param {number} batchSize - Size of each batch
   * @returns {Array} Array of batches
   */
  createBatches(actions, batchSize) {
    const batches = [];
    for (let i = 0; i < actions.length; i += batchSize) {
      batches.push(actions.slice(i, i + batchSize));
    }
    return batches;
  }

  /**
   * Process a batch of offline actions
   * @param {string} driverId - Driver ID
   * @param {Array} batch - Batch of actions
   * @returns {Object} Batch processing result
   */
  processBatch(driverId, batch) {
    const batchResult = {
      successful: [],
      failed: [],
      conflicts: []
    };

    for (const action of batch) {
      try {
        const result = this.processAction(driverId, action);
        
        if (result.success) {
          if (result.conflict) {
            batchResult.conflicts.push({
              action: action,
              result: result,
              conflictInfo: result.conflictInfo
            });
          } else {
            batchResult.successful.push({
              action: action,
              result: result
            });
          }
        } else {
          batchResult.failed.push({
            action: action,
            error: result.error,
            retryable: result.retryable || false
          });
        }

      } catch (error) {
        console.error('TMSOffline: Action processing error:', error);
        batchResult.failed.push({
          action: action,
          error: error.message,
          retryable: true
        });
      }
    }

    return batchResult;
  }

  /**
   * Process individual offline action
   * @param {string} driverId - Driver ID
   * @param {Object} action - Action to process
   * @returns {Object} Processing result
   */
  processAction(driverId, action) {
    try {
      console.log('TMSOffline: Processing action:', action.type, action.id);

      // Validate action structure
      if (!action.id || !action.type || !action.timestamp) {
        throw new Error('Invalid action structure');
      }

      // Check for conflicts
      const conflictCheck = this.checkForConflicts(action);
      if (conflictCheck.hasConflict) {
        return {
          success: true,
          conflict: true,
          conflictInfo: conflictCheck.conflictInfo,
          resolution: this.resolveConflict(action, conflictCheck.conflictInfo)
        };
      }

      // Process based on action type
      let result;
      switch (action.type) {
        case 'UPDATE_TASK_STATUS':
          result = this.processTaskStatusUpdate(driverId, action);
          break;

        case 'UPDATE_LOCATION':
          result = this.processLocationUpdate(driverId, action);
          break;

        case 'CAPTURE_PHOTO':
          result = this.processPhotoCapture(driverId, action);
          break;

        case 'REPORT_ISSUE':
          result = this.processIssueReport(driverId, action);
          break;

        case 'ADD_NOTES':
          result = this.processNotesUpdate(driverId, action);
          break;

        case 'UPDATE_DELIVERY_TIME':
          result = this.processDeliveryTimeUpdate(driverId, action);
          break;

        default:
          throw new Error(`Unknown action type: ${action.type}`);
      }

      // Log successful sync
      this.logSyncAction(driverId, action, result);

      return {
        success: true,
        data: result,
        syncedAt: new Date().toISOString()
      };

    } catch (error) {
      console.error('TMSOffline: Action processing error:', error);
      return {
        success: false,
        error: error.message,
        retryable: this.isRetryableError(error)
      };
    }
  }

  /**
   * Check for data conflicts
   * @param {Object} action - Action to check
   * @returns {Object} Conflict check result
   */
  checkForConflicts(action) {
    try {
      switch (action.type) {
        case 'UPDATE_TASK_STATUS':
          return this.checkTaskStatusConflict(action);

        case 'UPDATE_DELIVERY_TIME':
          return this.checkDeliveryTimeConflict(action);

        default:
          return { hasConflict: false };
      }

    } catch (error) {
      console.error('TMSOffline: Conflict check error:', error);
      return { hasConflict: false };
    }
  }

  /**
   * Check for task status conflicts
   * @param {Object} action - Task status action
   * @returns {Object} Conflict check result
   */
  checkTaskStatusConflict(action) {
    try {
      const currentTask = this.database.getDelivery(action.data.taskId);
      if (!currentTask) {
        return { hasConflict: false };
      }

      // Check if task status was modified after offline action timestamp
      const actionTime = new Date(action.timestamp);
      const lastModified = new Date(currentTask.fechaActualizacion || currentTask.fechaCreacion);

      if (lastModified > actionTime) {
        return {
          hasConflict: true,
          conflictInfo: {
            type: 'STATUS_CONFLICT',
            offlineStatus: action.data.status,
            currentStatus: currentTask.estado,
            offlineTimestamp: action.timestamp,
            currentTimestamp: currentTask.fechaActualizacion,
            conflictReason: 'Task status was modified while offline'
          }
        };
      }

      return { hasConflict: false };

    } catch (error) {
      console.error('TMSOffline: Task conflict check error:', error);
      return { hasConflict: false };
    }
  }

  /**
   * Check for delivery time conflicts
   * @param {Object} action - Delivery time action
   * @returns {Object} Conflict check result
   */
  checkDeliveryTimeConflict(action) {
    try {
      const currentTask = this.database.getDelivery(action.data.taskId);
      if (!currentTask || !currentTask.fechaEntrega) {
        return { hasConflict: false };
      }

      // Check if delivery time already exists
      const existingTime = new Date(currentTask.fechaEntrega);
      const offlineTime = new Date(action.data.deliveryTime);

      // Allow small time differences (5 minutes)
      const timeDiff = Math.abs(existingTime - offlineTime);
      if (timeDiff > 5 * 60 * 1000) { // 5 minutes in milliseconds
        return {
          hasConflict: true,
          conflictInfo: {
            type: 'TIME_CONFLICT',
            offlineTime: action.data.deliveryTime,
            currentTime: currentTask.fechaEntrega,
            timeDifference: timeDiff,
            conflictReason: 'Delivery time differs significantly'
          }
        };
      }

      return { hasConflict: false };

    } catch (error) {
      console.error('TMSOffline: Time conflict check error:', error);
      return { hasConflict: false };
    }
  }

  /**
   * Resolve data conflicts
   * @param {Object} action - Conflicting action
   * @param {Object} conflictInfo - Conflict information
   * @returns {Object} Conflict resolution
   */
  resolveConflict(action, conflictInfo) {
    try {
      console.log('TMSOffline: Resolving conflict:', conflictInfo.type);

      switch (conflictInfo.type) {
        case 'STATUS_CONFLICT':
          return this.resolveStatusConflict(action, conflictInfo);

        case 'TIME_CONFLICT':
          return this.resolveTimeConflict(action, conflictInfo);

        default:
          return {
            resolution: 'MANUAL_REVIEW',
            message: 'Conflict requires manual review',
            action: 'QUEUE_FOR_REVIEW'
          };
      }

    } catch (error) {
      console.error('TMSOffline: Conflict resolution error:', error);
      return {
        resolution: 'ERROR',
        message: 'Error resolving conflict',
        action: 'RETRY_LATER'
      };
    }
  }

  /**
   * Resolve status conflicts
   * @param {Object} action - Conflicting action
   * @param {Object} conflictInfo - Conflict information
   * @returns {Object} Resolution result
   */
  resolveStatusConflict(action, conflictInfo) {
    // Priority-based resolution
    const statusPriority = {
      'ENTREGADO': 5,
      'FALLIDA': 4,
      'EN_RUTA': 3,
      'ASIGNADO': 2,
      'PENDIENTE': 1
    };

    const offlinePriority = statusPriority[conflictInfo.offlineStatus] || 0;
    const currentPriority = statusPriority[conflictInfo.currentStatus] || 0;

    if (offlinePriority > currentPriority) {
      return {
        resolution: 'USE_OFFLINE',
        message: 'Offline status has higher priority',
        action: 'APPLY_OFFLINE_STATUS'
      };
    } else if (currentPriority > offlinePriority) {
      return {
        resolution: 'USE_CURRENT',
        message: 'Current status has higher priority',
        action: 'KEEP_CURRENT_STATUS'
      };
    } else {
      return {
        resolution: 'USE_LATEST',
        message: 'Using most recent timestamp',
        action: 'COMPARE_TIMESTAMPS'
      };
    }
  }

  /**
   * Resolve time conflicts
   * @param {Object} action - Conflicting action
   * @param {Object} conflictInfo - Conflict information
   * @returns {Object} Resolution result
   */
  resolveTimeConflict(action, conflictInfo) {
    // Use the earlier time (first completion)
    const offlineTime = new Date(conflictInfo.offlineTime);
    const currentTime = new Date(conflictInfo.currentTime);

    if (offlineTime < currentTime) {
      return {
        resolution: 'USE_OFFLINE',
        message: 'Offline time is earlier (first completion)',
        action: 'APPLY_OFFLINE_TIME'
      };
    } else {
      return {
        resolution: 'USE_CURRENT',
        message: 'Current time is earlier (first completion)',
        action: 'KEEP_CURRENT_TIME'
      };
    }
  }

  /**
   * Process task status update
   * @param {string} driverId - Driver ID
   * @param {Object} action - Action data
   * @returns {Object} Processing result
   */
  processTaskStatusUpdate(driverId, action) {
    const mobileApp = new TMSMobileApp();
    return mobileApp.updateTaskStatus(
      action.data.taskId,
      driverId,
      action.data.status,
      action.data.additionalData || {}
    );
  }

  /**
   * Process location update
   * @param {string} driverId - Driver ID
   * @param {Object} action - Action data
   * @returns {Object} Processing result
   */
  processLocationUpdate(driverId, action) {
    const mobileApp = new TMSMobileApp();
    return mobileApp.updateDriverLocation(driverId, action.data.location);
  }

  /**
   * Process photo capture
   * @param {string} driverId - Driver ID
   * @param {Object} action - Action data
   * @returns {Object} Processing result
   */
  processPhotoCapture(driverId, action) {
    const camera = new TMSCamera();
    camera.init();
    
    // Convert base64 to blob if needed
    let photoBlob = action.data.photoBlob;
    if (typeof photoBlob === 'string') {
      photoBlob = Utilities.newBlob(
        Utilities.base64Decode(photoBlob),
        action.data.contentType || 'image/jpeg',
        action.data.filename || 'photo.jpg'
      );
    }

    return camera.processDeliveryPhoto(
      action.data.taskId,
      driverId,
      photoBlob,
      action.data.metadata || {}
    );
  }

  /**
   * Process issue report
   * @param {string} driverId - Driver ID
   * @param {Object} action - Action data
   * @returns {Object} Processing result
   */
  processIssueReport(driverId, action) {
    const mobileApp = new TMSMobileApp();
    return mobileApp.reportIssue(driverId, action.data.issue);
  }

  /**
   * Process notes update
   * @param {string} driverId - Driver ID
   * @param {Object} action - Action data
   * @returns {Object} Processing result
   */
  processNotesUpdate(driverId, action) {
    const updateData = {
      observaciones: action.data.notes,
      fechaActualizacion: new Date()
    };

    return this.database.updateDelivery(action.data.taskId, updateData);
  }

  /**
   * Process delivery time update
   * @param {string} driverId - Driver ID
   * @param {Object} action - Action data
   * @returns {Object} Processing result
   */
  processDeliveryTimeUpdate(driverId, action) {
    const updateData = {
      fechaEntrega: new Date(action.data.deliveryTime),
      horaEntrega: Utilities.formatDate(
        new Date(action.data.deliveryTime),
        Session.getScriptTimeZone(),
        'HH:mm'
      ),
      fechaActualizacion: new Date()
    };

    return this.database.updateDelivery(action.data.taskId, updateData);
  }

  /**
   * Merge batch results
   * @param {Object} mainResults - Main results object
   * @param {Object} batchResult - Batch result to merge
   */
  mergeBatchResults(mainResults, batchResult) {
    mainResults.successful.push(...batchResult.successful);
    mainResults.failed.push(...batchResult.failed);
    mainResults.conflicts.push(...batchResult.conflicts);
  }

  /**
   * Check if error is retryable
   * @param {Error} error - Error to check
   * @returns {boolean} Is retryable
   */
  isRetryableError(error) {
    const retryableErrors = [
      'timeout',
      'network',
      'temporary',
      'rate limit',
      'service unavailable'
    ];

    const errorMessage = error.message.toLowerCase();
    return retryableErrors.some(retryable => errorMessage.includes(retryable));
  }

  /**
   * Log sync action
   * @param {string} driverId - Driver ID
   * @param {Object} action - Synced action
   * @param {Object} result - Sync result
   */
  logSyncAction(driverId, action, result) {
    try {
      // Log to a sync history sheet or database
      const logEntry = {
        driverId: driverId,
        actionId: action.id,
        actionType: action.type,
        offlineTimestamp: action.timestamp,
        syncTimestamp: new Date().toISOString(),
        success: true,
        result: JSON.stringify(result)
      };

      // In a real implementation, you might store this in a dedicated sync log
      console.log('TMSOffline: Sync logged:', logEntry);

    } catch (error) {
      console.error('TMSOffline: Sync logging error:', error);
    }
  }

  /**
   * Get sync statistics
   * @param {string} driverId - Driver ID (optional)
   * @param {string} dateRange - Date range (optional)
   * @returns {Object} Sync statistics
   */
  getSyncStatistics(driverId = null, dateRange = null) {
    try {
      // This would query sync logs in a real implementation
      // For now, return mock statistics
      
      const stats = {
        totalSyncs: 0,
        successfulSyncs: 0,
        failedSyncs: 0,
        conflictsSyncs: 0,
        averageSyncTime: 0,
        lastSyncTime: null,
        syncsByType: {},
        syncsByDate: {},
        conflictResolutions: {}
      };

      return {
        success: true,
        data: stats,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('TMSOffline: Statistics error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Clean up old sync data
   * @param {number} daysToKeep - Days of data to keep
   * @returns {Object} Cleanup result
   */
  cleanupSyncData(daysToKeep = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      // In a real implementation, this would clean up old sync logs
      console.log(`TMSOffline: Cleaning up sync data older than ${cutoffDate.toISOString()}`);

      return {
        success: true,
        message: `Sync data cleanup completed`,
        cutoffDate: cutoffDate.toISOString(),
        recordsRemoved: 0 // Would be actual count
      };

    } catch (error) {
      console.error('TMSOffline: Cleanup error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Global functions for frontend integration

/**
 * Sync offline data from mobile app
 * @param {string} driverId - Driver ID
 * @param {Array} offlineActions - Offline actions to sync
 * @returns {Object} Sync result
 */
function syncMobileOfflineData(driverId, offlineActions) {
  const offline = new TMSOffline();
  return offline.syncOfflineData(driverId, offlineActions);
}

/**
 * Get sync statistics
 * @param {string} driverId - Driver ID (optional)
 * @param {string} dateRange - Date range (optional)
 * @returns {Object} Sync statistics
 */
function getSyncStatistics(driverId, dateRange) {
  const offline = new TMSOffline();
  return offline.getSyncStatistics(driverId, dateRange);
}

/**
 * Clean up old sync data
 * @param {number} daysToKeep - Days of data to keep
 * @returns {Object} Cleanup result
 */
function cleanupSyncData(daysToKeep) {
  const offline = new TMSOffline();
  return offline.cleanupSyncData(daysToKeep);
}

console.log('TMSOffline: Offline functionality system loaded successfully');