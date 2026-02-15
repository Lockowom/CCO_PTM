/**
 * TMS Camera and Photo Management System
 * Handles photo capture, processing, and storage for delivery proof
 * 
 * @fileoverview Photo management system for TMS mobile app
 * @author TMS Development Team
 * @version 1.0.0
 */

/**
 * TMSCamera class - Handles photo operations for delivery proof
 */
class TMSCamera {
  constructor() {
    this.database = new TMSDatabase();
    this.utils = new TMSUtils();
    this.photoFolder = null;
    this.maxPhotoSize = 5 * 1024 * 1024; // 5MB
    this.allowedFormats = ['image/jpeg', 'image/png', 'image/webp'];
  }

  /**
   * Initialize photo management system
   */
  init() {
    try {
      this.photoFolder = this.getOrCreatePhotoFolder();
      console.log('TMSCamera: Photo system initialized');
      return { success: true };
    } catch (error) {
      console.error('TMSCamera: Initialization error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Process and store delivery photo
   * @param {string} taskId - Task/Delivery ID
   * @param {string} driverId - Driver ID
   * @param {Blob} photoBlob - Photo data
   * @param {Object} metadata - Photo metadata
   * @returns {Object} Processing result
   */
  processDeliveryPhoto(taskId, driverId, photoBlob, metadata = {}) {
    try {
      console.log('TMSCamera: Processing delivery photo for task:', taskId);

      // Validate inputs
      if (!taskId || !driverId || !photoBlob) {
        throw new Error('Missing required parameters');
      }

      // Validate task exists and is assigned to driver
      const task = this.database.getDelivery(taskId);
      if (!task) {
        throw new Error('Task not found');
      }

      if (task.conductorId !== driverId) {
        throw new Error('Task not assigned to this driver');
      }

      // Validate photo format and size
      this.validatePhoto(photoBlob, metadata);

      // Process and compress photo
      const processedPhoto = this.compressPhoto(photoBlob, metadata);

      // Generate filename
      const filename = this.generatePhotoFilename(taskId, driverId, metadata);

      // Upload to Google Drive
      const uploadResult = this.uploadToGoogleDrive(processedPhoto, filename, metadata);

      // Update task with photo information
      const updateResult = this.updateTaskWithPhoto(taskId, uploadResult, metadata);

      // Log photo capture
      this.logPhotoCapture(taskId, driverId, uploadResult, metadata);

      return {
        success: true,
        data: {
          fileId: uploadResult.fileId,
          fileUrl: uploadResult.fileUrl,
          filename: filename,
          size: processedPhoto.getBytes().length,
          timestamp: new Date().toISOString(),
          metadata: metadata
        }
      };

    } catch (error) {
      console.error('TMSCamera: Error processing photo:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Validate photo format and size
   * @param {Blob} photoBlob - Photo data
   * @param {Object} metadata - Photo metadata
   */
  validatePhoto(photoBlob, metadata) {
    // Check file size
    if (photoBlob.getBytes().length > this.maxPhotoSize) {
      throw new Error(`Photo size exceeds maximum allowed (${this.maxPhotoSize / 1024 / 1024}MB)`);
    }

    // Check format (basic validation)
    const contentType = metadata.contentType || 'image/jpeg';
    if (!this.allowedFormats.includes(contentType)) {
      throw new Error(`Unsupported photo format: ${contentType}`);
    }

    console.log('TMSCamera: Photo validation passed');
  }

  /**
   * Compress photo for optimal storage
   * @param {Blob} photoBlob - Original photo
   * @param {Object} metadata - Photo metadata
   * @returns {Blob} Compressed photo
   */
  compressPhoto(photoBlob, metadata) {
    try {
      // For Google Apps Script, we'll implement basic compression
      // In a real implementation, you might use image processing libraries
      
      const originalSize = photoBlob.getBytes().length;
      
      // If photo is already small enough, return as-is
      if (originalSize <= 1024 * 1024) { // 1MB
        console.log('TMSCamera: Photo already optimized');
        return photoBlob;
      }

      // Basic compression by reducing quality (simulated)
      // In practice, you'd use proper image processing
      const compressionRatio = Math.min(0.8, (1024 * 1024) / originalSize);
      
      console.log(`TMSCamera: Compressing photo (ratio: ${compressionRatio})`);
      
      // Return original for now - implement actual compression as needed
      return photoBlob;

    } catch (error) {
      console.error('TMSCamera: Compression error:', error);
      return photoBlob; // Return original on error
    }
  }

  /**
   * Generate unique filename for photo
   * @param {string} taskId - Task ID
   * @param {string} driverId - Driver ID
   * @param {Object} metadata - Photo metadata
   * @returns {string} Generated filename
   */
  generatePhotoFilename(taskId, driverId, metadata) {
    const timestamp = Utilities.formatDate(
      new Date(), 
      Session.getScriptTimeZone(), 
      'yyyyMMdd_HHmmss'
    );
    
    const photoType = metadata.photoType || 'delivery';
    const extension = this.getFileExtension(metadata.contentType || 'image/jpeg');
    
    return `TMS_${photoType}_${taskId}_${driverId}_${timestamp}${extension}`;
  }

  /**
   * Get file extension from content type
   * @param {string} contentType - MIME type
   * @returns {string} File extension
   */
  getFileExtension(contentType) {
    const extensions = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp',
      'image/gif': '.gif'
    };
    return extensions[contentType] || '.jpg';
  }

  /**
   * Upload photo to Google Drive
   * @param {Blob} photoBlob - Photo data
   * @param {string} filename - File name
   * @param {Object} metadata - Photo metadata
   * @returns {Object} Upload result
   */
  uploadToGoogleDrive(photoBlob, filename, metadata) {
    try {
      if (!this.photoFolder) {
        this.photoFolder = this.getOrCreatePhotoFolder();
      }

      // Create file in Google Drive
      const file = this.photoFolder.createFile(photoBlob.setName(filename));
      
      // Set file description with metadata
      const description = JSON.stringify({
        taskId: metadata.taskId,
        driverId: metadata.driverId,
        photoType: metadata.photoType || 'delivery',
        timestamp: new Date().toISOString(),
        location: metadata.location,
        deviceInfo: metadata.deviceInfo
      });
      
      file.setDescription(description);

      // Make file viewable by anyone with link (for customer access)
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

      console.log('TMSCamera: Photo uploaded to Drive:', file.getId());

      return {
        fileId: file.getId(),
        fileUrl: file.getUrl(),
        downloadUrl: file.getDownloadUrl(),
        viewUrl: `https://drive.google.com/file/d/${file.getId()}/view`,
        thumbnailUrl: file.getThumbnail() ? file.getThumbnail().getUrl() : null
      };

    } catch (error) {
      console.error('TMSCamera: Drive upload error:', error);
      throw new Error(`Failed to upload photo: ${error.message}`);
    }
  }

  /**
   * Update task with photo information
   * @param {string} taskId - Task ID
   * @param {Object} uploadResult - Upload result
   * @param {Object} metadata - Photo metadata
   * @returns {Object} Update result
   */
  updateTaskWithPhoto(taskId, uploadResult, metadata) {
    try {
      const updateData = {
        fotoEntrega: uploadResult.fileId,
        fotoEntregaUrl: uploadResult.viewUrl,
        fotoEntregaThumbnail: uploadResult.thumbnailUrl,
        fechaFoto: new Date(),
        fotoMetadata: JSON.stringify(metadata)
      };

      const result = this.database.updateDelivery(taskId, updateData);
      
      if (!result.success) {
        throw new Error(result.error);
      }

      console.log('TMSCamera: Task updated with photo info');
      return result;

    } catch (error) {
      console.error('TMSCamera: Task update error:', error);
      throw error;
    }
  }

  /**
   * Log photo capture event
   * @param {string} taskId - Task ID
   * @param {string} driverId - Driver ID
   * @param {Object} uploadResult - Upload result
   * @param {Object} metadata - Photo metadata
   */
  logPhotoCapture(taskId, driverId, uploadResult, metadata) {
    try {
      this.database.logDeliveryHistory(taskId, {
        accion: 'Foto de entrega capturada',
        usuario: driverId,
        fecha: new Date(),
        detalles: `Archivo: ${uploadResult.fileId}`,
        metadata: {
          fileId: uploadResult.fileId,
          photoType: metadata.photoType || 'delivery',
          location: metadata.location,
          deviceInfo: metadata.deviceInfo
        }
      });

      console.log('TMSCamera: Photo capture logged');

    } catch (error) {
      console.error('TMSCamera: Logging error:', error);
      // Don't throw - logging failure shouldn't break photo capture
    }
  }

  /**
   * Get or create photo storage folder
   * @returns {DriveApp.Folder} Photo folder
   */
  getOrCreatePhotoFolder() {
    try {
      const folderName = 'TMS_Delivery_Photos';
      const folders = DriveApp.getFoldersByName(folderName);
      
      if (folders.hasNext()) {
        const folder = folders.next();
        console.log('TMSCamera: Using existing photo folder:', folder.getId());
        return folder;
      } else {
        const folder = DriveApp.createFolder(folderName);
        console.log('TMSCamera: Created new photo folder:', folder.getId());
        return folder;
      }

    } catch (error) {
      console.error('TMSCamera: Folder creation error:', error);
      throw new Error(`Failed to create photo folder: ${error.message}`);
    }
  }

  /**
   * Get delivery photos for a task
   * @param {string} taskId - Task ID
   * @returns {Object} Photos data
   */
  getDeliveryPhotos(taskId) {
    try {
      const task = this.database.getDelivery(taskId);
      if (!task) {
        throw new Error('Task not found');
      }

      const photos = [];

      // Main delivery photo
      if (task.fotoEntrega) {
        try {
          const file = DriveApp.getFileById(task.fotoEntrega);
          photos.push({
            id: task.fotoEntrega,
            type: 'delivery',
            url: task.fotoEntregaUrl || file.getUrl(),
            thumbnailUrl: task.fotoEntregaThumbnail,
            timestamp: task.fechaFoto,
            metadata: task.fotoMetadata ? JSON.parse(task.fotoMetadata) : {}
          });
        } catch (error) {
          console.error('TMSCamera: Error accessing main photo:', error);
        }
      }

      // Additional photos (if stored separately)
      const additionalPhotos = this.getAdditionalPhotos(taskId);
      photos.push(...additionalPhotos);

      return {
        success: true,
        data: {
          taskId: taskId,
          photos: photos,
          count: photos.length
        }
      };

    } catch (error) {
      console.error('TMSCamera: Error getting photos:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get additional photos for a task
   * @param {string} taskId - Task ID
   * @returns {Array} Additional photos
   */
  getAdditionalPhotos(taskId) {
    try {
      if (!this.photoFolder) {
        this.photoFolder = this.getOrCreatePhotoFolder();
      }

      const photos = [];
      const files = this.photoFolder.getFiles();

      while (files.hasNext()) {
        const file = files.next();
        const filename = file.getName();
        
        // Check if file belongs to this task
        if (filename.includes(taskId)) {
          try {
            const description = file.getDescription();
            const metadata = description ? JSON.parse(description) : {};
            
            if (metadata.taskId === taskId) {
              photos.push({
                id: file.getId(),
                type: metadata.photoType || 'additional',
                url: file.getUrl(),
                thumbnailUrl: file.getThumbnail() ? file.getThumbnail().getUrl() : null,
                timestamp: metadata.timestamp,
                metadata: metadata
              });
            }
          } catch (error) {
            console.error('TMSCamera: Error parsing photo metadata:', error);
          }
        }
      }

      return photos;

    } catch (error) {
      console.error('TMSCamera: Error getting additional photos:', error);
      return [];
    }
  }

  /**
   * Delete delivery photo
   * @param {string} photoId - Photo file ID
   * @param {string} taskId - Task ID for validation
   * @param {string} driverId - Driver ID for validation
   * @returns {Object} Deletion result
   */
  deleteDeliveryPhoto(photoId, taskId, driverId) {
    try {
      // Validate permissions
      const task = this.database.getDelivery(taskId);
      if (!task || task.conductorId !== driverId) {
        throw new Error('Unauthorized to delete this photo');
      }

      // Get and delete file
      const file = DriveApp.getFileById(photoId);
      file.setTrashed(true);

      // Update task if this was the main photo
      if (task.fotoEntrega === photoId) {
        this.database.updateDelivery(taskId, {
          fotoEntrega: '',
          fotoEntregaUrl: '',
          fotoEntregaThumbnail: '',
          fechaFoto: null,
          fotoMetadata: ''
        });
      }

      // Log deletion
      this.database.logDeliveryHistory(taskId, {
        accion: 'Foto de entrega eliminada',
        usuario: driverId,
        fecha: new Date(),
        detalles: `Archivo eliminado: ${photoId}`
      });

      return {
        success: true,
        message: 'Photo deleted successfully'
      };

    } catch (error) {
      console.error('TMSCamera: Photo deletion error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get photo statistics
   * @returns {Object} Photo statistics
   */
  getPhotoStatistics() {
    try {
      if (!this.photoFolder) {
        this.photoFolder = this.getOrCreatePhotoFolder();
      }

      const files = this.photoFolder.getFiles();
      let totalFiles = 0;
      let totalSize = 0;
      const photoTypes = {};
      const dailyStats = {};

      while (files.hasNext()) {
        const file = files.next();
        totalFiles++;
        totalSize += file.getSize();

        try {
          const description = file.getDescription();
          const metadata = description ? JSON.parse(description) : {};
          
          // Count by type
          const type = metadata.photoType || 'unknown';
          photoTypes[type] = (photoTypes[type] || 0) + 1;

          // Count by date
          const date = metadata.timestamp ? 
            new Date(metadata.timestamp).toDateString() : 
            file.getDateCreated().toDateString();
          dailyStats[date] = (dailyStats[date] || 0) + 1;

        } catch (error) {
          console.error('TMSCamera: Error parsing photo stats:', error);
        }
      }

      return {
        success: true,
        data: {
          totalPhotos: totalFiles,
          totalSize: totalSize,
          averageSize: totalFiles > 0 ? Math.round(totalSize / totalFiles) : 0,
          photoTypes: photoTypes,
          dailyStats: dailyStats,
          folderInfo: {
            id: this.photoFolder.getId(),
            name: this.photoFolder.getName(),
            url: this.photoFolder.getUrl()
          }
        }
      };

    } catch (error) {
      console.error('TMSCamera: Statistics error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Global functions for frontend integration

/**
 * Process delivery photo from mobile app
 * @param {string} taskId - Task ID
 * @param {string} driverId - Driver ID
 * @param {Blob} photoBlob - Photo data
 * @param {Object} metadata - Photo metadata
 * @returns {Object} Processing result
 */
function processMobileDeliveryPhoto(taskId, driverId, photoBlob, metadata) {
  const camera = new TMSCamera();
  camera.init();
  return camera.processDeliveryPhoto(taskId, driverId, photoBlob, metadata);
}

/**
 * Get delivery photos for a task
 * @param {string} taskId - Task ID
 * @returns {Object} Photos data
 */
function getDeliveryPhotos(taskId) {
  const camera = new TMSCamera();
  return camera.getDeliveryPhotos(taskId);
}

/**
 * Delete delivery photo
 * @param {string} photoId - Photo file ID
 * @param {string} taskId - Task ID
 * @param {string} driverId - Driver ID
 * @returns {Object} Deletion result
 */
function deleteDeliveryPhoto(photoId, taskId, driverId) {
  const camera = new TMSCamera();
  return camera.deleteDeliveryPhoto(photoId, taskId, driverId);
}

/**
 * Get photo statistics
 * @returns {Object} Photo statistics
 */
function getPhotoStatistics() {
  const camera = new TMSCamera();
  return camera.getPhotoStatistics();
}

/**
 * Initialize photo system
 * @returns {Object} Initialization result
 */
function initializePhotoSystem() {
  const camera = new TMSCamera();
  return camera.init();
}

console.log('TMSCamera: Photo management system loaded successfully');