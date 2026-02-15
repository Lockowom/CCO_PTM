/**
 * DriveManager.gs
 * Gestión de Google Drive para el módulo de Entregas Enhanced
 * 
 * Responsabilidades:
 * - Crear estructura de carpetas /Entregas/{Año}/{Mes}/{N.V}/
 * - Subir fotos comprimidas
 * - Generar links públicos
 * - Gestionar permisos de archivos
 */

// ID de la carpeta raíz de Entregas (configurar después de ejecutar INIT_ENTREGAS_ENHANCED.gs)
var ENTREGAS_FOLDER_ID = ''; // TODO: Configurar con el ID de la carpeta

/**
 * Crea la estructura de carpetas para una N.V
 * Estructura: /Entregas/{Año}/{Mes}/{N.V}/
 * 
 * @param {string} nv - Número de nota de venta
 * @param {number} año - Año (ej: 2026)
 * @param {string} mes - Mes con formato "01_Enero", "02_Febrero", etc.
 * @returns {Object} - {success, folderId, folderUrl, error}
 */
function crearCarpetaEntrega(nv, año, mes) {
  try {
    Logger.log('DriveManager.crearCarpetaEntrega: ' + nv);
    
    // Validar parámetros
    if (!nv || !año || !mes) {
      return {
        success: false,
        error: 'Parámetros inválidos: nv, año y mes son requeridos'
      };
    }
    
    // Obtener carpeta raíz
    var rootFolder;
    if (ENTREGAS_FOLDER_ID) {
      try {
        rootFolder = DriveApp.getFolderById(ENTREGAS_FOLDER_ID);
      } catch (e) {
        Logger.log('⚠️ ENTREGAS_FOLDER_ID inválido, usando carpeta raíz');
        rootFolder = DriveApp.getRootFolder().getFoldersByName('Entregas').next();
      }
    } else {
      // Buscar carpeta Entregas en raíz
      var folders = DriveApp.getRootFolder().getFoldersByName('Entregas');
      if (folders.hasNext()) {
        rootFolder = folders.next();
      } else {
        return {
          success: false,
          error: 'Carpeta raíz "Entregas" no encontrada. Ejecuta INIT_ENTREGAS_ENHANCED.gs primero.'
        };
      }
    }
    
    // Crear/obtener carpeta de año
    var añoFolder = getOrCreateFolder(rootFolder, String(año));
    
    // Crear/obtener carpeta de mes
    var mesFolder = getOrCreateFolder(añoFolder, mes);
    
    // Crear/obtener carpeta de N.V
    var nvFolder = getOrCreateFolder(mesFolder, nv);
    
    Logger.log('✅ Carpeta creada: ' + nvFolder.getName());
    
    return {
      success: true,
      folderId: nvFolder.getId(),
      folderUrl: nvFolder.getUrl(),
      path: año + '/' + mes + '/' + nv
    };
    
  } catch (e) {
    Logger.log('❌ Error en crearCarpetaEntrega: ' + e.message);
    return {
      success: false,
      error: e.message
    };
  }
}

/**
 * Obtiene o crea una carpeta dentro de un padre
 * @param {Folder} parentFolder - Carpeta padre
 * @param {string} folderName - Nombre de la carpeta
 * @returns {Folder} - Carpeta encontrada o creada
 */
function getOrCreateFolder(parentFolder, folderName) {
  var folders = parentFolder.getFoldersByName(folderName);
  if (folders.hasNext()) {
    return folders.next();
  } else {
    return parentFolder.createFolder(folderName);
  }
}

/**
 * Sube una foto a Google Drive
 * 
 * @param {string} folderId - ID de la carpeta destino
 * @param {string} nv - Número de nota de venta
 * @param {string} fotoBase64 - Foto en formato base64
 * @param {string} usuario - Usuario que sube la foto
 * @returns {Object} - {success, fileId, publicLink, fileName, error}
 */
function subirFoto(folderId, nv, fotoBase64, usuario) {
  try {
    Logger.log('DriveManager.subirFoto: ' + nv + ' por ' + usuario);
    
    // Validar parámetros
    if (!folderId || !nv || !fotoBase64 || !usuario) {
      return {
        success: false,
        error: 'Parámetros inválidos'
      };
    }
    
    // Obtener carpeta
    var folder = DriveApp.getFolderById(folderId);
    
    // Generar nombre de archivo
    var now = new Date();
    var fecha = Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyyyMMdd');
    var hora = Utilities.formatDate(now, Session.getScriptTimeZone(), 'HHmmss');
    var fileName = nv + '_' + fecha + '_' + hora + '_' + usuario + '.jpg';
    
    // Decodificar base64
    var base64Data = fotoBase64;
    if (fotoBase64.indexOf('base64,') !== -1) {
      base64Data = fotoBase64.split('base64,')[1];
    }
    
    var blob = Utilities.newBlob(
      Utilities.base64Decode(base64Data),
      'image/jpeg',
      fileName
    );
    
    // Subir archivo
    var file = folder.createFile(blob);
    
    // Hacer público (anyone with link can view)
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    var fileId = file.getId();
    var publicLink = 'https://drive.google.com/file/d/' + fileId + '/view';
    
    Logger.log('✅ Foto subida: ' + fileName);
    
    return {
      success: true,
      fileId: fileId,
      publicLink: publicLink,
      fileName: fileName,
      size: blob.getBytes().length
    };
    
  } catch (e) {
    Logger.log('❌ Error en subirFoto: ' + e.message);
    return {
      success: false,
      error: e.message
    };
  }
}

/**
 * Comprime una imagen en base64
 * 
 * @param {string} base64 - Imagen en base64
 * @param {number} maxSizeKB - Tamaño máximo en KB (default: 2048 = 2MB)
 * @returns {Object} - {success, base64Comprimido, sizeKB, error}
 */
function comprimirImagen(base64, maxSizeKB) {
  try {
    maxSizeKB = maxSizeKB || 2048; // 2MB por defecto
    
    // Calcular tamaño actual
    var base64Data = base64;
    if (base64.indexOf('base64,') !== -1) {
      base64Data = base64.split('base64,')[1];
    }
    
    var currentSizeKB = Math.ceil((base64Data.length * 3) / 4 / 1024);
    
    Logger.log('Tamaño actual: ' + currentSizeKB + ' KB');
    
    // Si ya es menor al máximo, retornar sin comprimir
    if (currentSizeKB <= maxSizeKB) {
      return {
        success: true,
        base64Comprimido: base64,
        sizeKB: currentSizeKB,
        compressed: false
      };
    }
    
    // NOTA: La compresión real se hace en el frontend con canvas
    // Aquí solo validamos el tamaño
    // Si llega aquí con más de 2MB, rechazamos
    return {
      success: false,
      error: 'Imagen demasiado grande (' + currentSizeKB + ' KB). Comprimir en el frontend primero.',
      sizeKB: currentSizeKB
    };
    
  } catch (e) {
    Logger.log('❌ Error en comprimirImagen: ' + e.message);
    return {
      success: false,
      error: e.message
    };
  }
}

/**
 * Obtiene todas las fotos de una N.V
 * 
 * @param {string} nv - Número de nota de venta
 * @returns {Object} - {success, fotos[], error}
 */
function getFotosEntrega(nv) {
  try {
    Logger.log('DriveManager.getFotosEntrega: ' + nv);
    
    // Buscar carpeta de la N.V
    var rootFolder;
    if (ENTREGAS_FOLDER_ID) {
      rootFolder = DriveApp.getFolderById(ENTREGAS_FOLDER_ID);
    } else {
      var folders = DriveApp.getRootFolder().getFoldersByName('Entregas');
      if (!folders.hasNext()) {
        return { success: true, fotos: [] };
      }
      rootFolder = folders.next();
    }
    
    // Buscar en todos los años/meses
    var fotos = [];
    var añoFolders = rootFolder.getFolders();
    
    while (añoFolders.hasNext()) {
      var añoFolder = añoFolders.next();
      var mesFolders = añoFolder.getFolders();
      
      while (mesFolders.hasNext()) {
        var mesFolder = mesFolders.next();
        var nvFolders = mesFolder.getFoldersByName(nv);
        
        if (nvFolders.hasNext()) {
          var nvFolder = nvFolders.next();
          var files = nvFolder.getFiles();
          
          while (files.hasNext()) {
            var file = files.next();
            fotos.push({
              url: 'https://drive.google.com/file/d/' + file.getId() + '/view',
              nombre: file.getName(),
              fecha: file.getDateCreated(),
              tamaño: file.getSize()
            });
          }
        }
      }
    }
    
    Logger.log('✅ Fotos encontradas: ' + fotos.length);
    
    return {
      success: true,
      fotos: fotos
    };
    
  } catch (e) {
    Logger.log('❌ Error en getFotosEntrega: ' + e.message);
    return {
      success: false,
      error: e.message,
      fotos: []
    };
  }
}

/**
 * Sube foto con reintentos automáticos
 * 
 * @param {string} folderId - ID de la carpeta
 * @param {string} nv - Número de nota de venta
 * @param {string} fotoBase64 - Foto en base64
 * @param {string} usuario - Usuario
 * @param {number} maxRetries - Número máximo de reintentos (default: 3)
 * @returns {Object} - Resultado de la subida
 */
function subirFotoConReintentos(folderId, nv, fotoBase64, usuario, maxRetries) {
  maxRetries = maxRetries || 3;
  var lastError;
  
  for (var attempt = 1; attempt <= maxRetries; attempt++) {
    Logger.log('Intento ' + attempt + ' de ' + maxRetries);
    
    var result = subirFoto(folderId, nv, fotoBase64, usuario);
    
    if (result.success) {
      return result;
    }
    
    lastError = result.error;
    
    if (attempt < maxRetries) {
      // Esperar antes de reintentar (backoff exponencial)
      Utilities.sleep(Math.pow(2, attempt) * 500);
    }
  }
  
  return {
    success: false,
    error: 'Falló después de ' + maxRetries + ' intentos: ' + lastError
  };
}

/**
 * Test del DriveManager
 */
function testDriveManager() {
  Logger.log('=== TEST DRIVE MANAGER ===\n');
  
  // 1. Test crear carpeta
  Logger.log('1. Test crearCarpetaEntrega...');
  var result1 = crearCarpetaEntrega('TEST001', 2026, '01_Enero');
  Logger.log('   Resultado: ' + JSON.stringify(result1));
  
  if (result1.success) {
    // 2. Test subir foto (simulada)
    Logger.log('\n2. Test subirFoto...');
    // Crear una imagen de prueba pequeña en base64 (1x1 pixel rojo)
    var testBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';
    var result2 = subirFoto(result1.folderId, 'TEST001', testBase64, 'TestUser');
    Logger.log('   Resultado: ' + JSON.stringify(result2));
    
    // 3. Test obtener fotos
    Logger.log('\n3. Test getFotosEntrega...');
    var result3 = getFotosEntrega('TEST001');
    Logger.log('   Resultado: ' + JSON.stringify(result3));
  }
  
  Logger.log('\n=== FIN TEST ===');
}
