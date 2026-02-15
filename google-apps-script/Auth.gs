/**
 * Auth.gs
 * Módulo de autenticación y gestión de sesiones
 * 
 * Maneja el login, logout, validación de sesiones y gestión de usuarios
 * 
 * SEGURIDAD:
 * - Contraseñas hasheadas con SHA-256 + salt
 * - Sesiones con expiración automática (24h)
 * - Rate limiting para prevenir fuerza bruta
 * - Sanitización de inputs
 * - Logging de eventos de seguridad
 */

// Salt UNIFICADO para el hash de contraseñas
// IMPORTANTE: Debe ser el mismo en Auth.gs y Api.gs
var AUTH_SALT = 'CCO_SECURE_2024';

/**
 * Sanitiza una cadena para prevenir inyección
 * @param {string} str - Cadena a sanitizar
 * @returns {string} Cadena sanitizada
 */
function sanitizeInput(str) {
  if (!str) return '';
  return String(str)
    .trim()
    .replace(/[<>\"\'\\]/g, '')
    .substring(0, 255); // Limitar longitud
}

/**
 * Hashea una contraseña usando SHA-256 con salt
 * UNIFICADO: Usa el mismo algoritmo que hashPasswordSimple en Api.gs
 * @param {string} password - Contraseña en texto plano
 * @returns {string} Hash de la contraseña en hexadecimal
 */
function hashPassword(password) {
  try {
    if (!password || password.trim() === '') {
      throw new Error('La contraseña no puede estar vacía');
    }
    
    // Salt UNIFICADO con Api.gs
    var salt = 'CCO_SECURE_2024';
    var saltedPassword = salt + password + salt;
    
    var hash = Utilities.computeDigest(
      Utilities.DigestAlgorithm.SHA_256,
      saltedPassword,
      Utilities.Charset.UTF_8
    );
    
    // Convertir bytes a hexadecimal
    var hexHash = hash.map(function(byte) {
      var v = (byte < 0) ? 256 + byte : byte;
      return ('0' + v.toString(16)).slice(-2);
    }).join('');
    
    return hexHash;
    
  } catch (error) {
    Logger.log('Error en hashPassword: ' + error.message);
    throw error;
  }
}

/**
 * Autentica un usuario con email y contraseña
 * VERSIÓN CORREGIDA - Usa getUserSheet() directamente
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña en texto plano
 * @returns {Object} Resultado de la autenticación con datos del usuario y sessionId
 */
function authenticateUser(email, password) {
  try {
    Logger.log('=== AUTENTICACIÓN ===');
    
    // Sanitizar y validar parámetros
    var cleanEmail = email ? String(email).trim().toLowerCase() : '';
    
    if (!cleanEmail || !password) {
      return { success: false, error: 'Email y contraseña son requeridos' };
    }
    
    Logger.log('Intentando login para: ' + cleanEmail);
    
    // Rate limiting: verificar intentos recientes
    var cacheKey = 'login_attempts_' + cleanEmail;
    var cache = CacheService.getScriptCache();
    var attempts = cache.get(cacheKey);
    
    if (attempts && parseInt(attempts) >= 5) {
      Logger.log('Rate limit alcanzado para ' + cleanEmail);
      return { success: false, error: 'Demasiados intentos. Espere 5 minutos.' };
    }
    
    // Obtener hoja de usuarios
    var userSheet = getUserSheet();
    if (!userSheet) {
      Logger.log('ERROR: No se encontró hoja de usuarios');
      return { success: false, error: 'Error de configuración del sistema' };
    }
    
    var data = userSheet.getDataRange().getValues();
    Logger.log('Total filas en USUARIOS: ' + data.length);
    
    if (data.length <= 1) {
      return { success: false, error: 'No hay usuarios registrados' };
    }
    
    // Detectar columnas
    var headers = data[0];
    var colIndex = { id: 0, email: 1, password: 2, nombre: 3, rol: 4, fechaCreacion: 5, activo: 6 };
    
    for (var h = 0; h < headers.length; h++) {
      var hdr = String(headers[h]).toUpperCase().trim();
      if (hdr === 'ID') colIndex.id = h;
      else if (hdr === 'EMAIL' || hdr === 'CORREO') colIndex.email = h;
      else if (hdr === 'PASSWORD' || hdr === 'CONTRASEÑA' || hdr === 'CLAVE') colIndex.password = h;
      else if (hdr === 'NOMBRE' || hdr === 'NAME') colIndex.nombre = h;
      else if (hdr === 'ROL' || hdr === 'ROLE') colIndex.rol = h;
      else if (hdr.indexOf('FECHA') !== -1) colIndex.fechaCreacion = h;
      else if (hdr === 'ACTIVO' || hdr === 'ACTIVE' || hdr === 'ESTADO') colIndex.activo = h;
    }
    
    // Buscar usuario por email
    var foundUser = null;
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var rowEmail = row[colIndex.email] ? String(row[colIndex.email]).trim().toLowerCase() : '';
      
      if (rowEmail === cleanEmail) {
        foundUser = {
          rowIndex: i + 1,
          id: row[colIndex.id] || ('USR-' + i),
          email: rowEmail,
          password: row[colIndex.password] || '',
          nombre: row[colIndex.nombre] || 'Usuario',
          rol: row[colIndex.rol] || 'OPERADOR',
          activo: row[colIndex.activo] ? String(row[colIndex.activo]).toUpperCase() : 'SI'
        };
        Logger.log('Usuario encontrado: ' + foundUser.nombre + ' | Rol: ' + foundUser.rol + ' | Activo: ' + foundUser.activo);
        break;
      }
    }
    
    if (!foundUser) {
      incrementLoginAttempts(cache, cacheKey, attempts);
      Logger.log('Usuario no encontrado: ' + cleanEmail);
      return { success: false, error: 'Credenciales inválidas' };
    }
    
    // Verificar que el usuario esté activo
    if (foundUser.activo !== 'SI') {
      Logger.log('Usuario inactivo: ' + cleanEmail);
      return { success: false, error: 'Usuario inactivo. Contacte al administrador.' };
    }
    
    // Verificar contraseña - usar el hash unificado
    var passwordHash = hashPassword(password);
    
    Logger.log('Hash almacenado: ' + foundUser.password.substring(0, 20) + '...');
    Logger.log('Hash calculado: ' + passwordHash.substring(0, 20) + '...');
    
    // Comparar hashes
    var passwordMatch = (foundUser.password === passwordHash);
    
    if (!passwordMatch) {
      incrementLoginAttempts(cache, cacheKey, attempts);
      Logger.log('Contraseña incorrecta para: ' + cleanEmail);
      
      // Mostrar intentos restantes
      var currentAttempts = attempts ? parseInt(attempts) + 1 : 1;
      var remaining = 5 - currentAttempts;
      return { 
        success: false, 
        error: 'Credenciales inválidas (' + remaining + ' intentos restantes)' 
      };
    }
    
    // Login exitoso - limpiar contador de intentos
    cache.remove(cacheKey);
    
    // Crear sesión
    var sessionId = 'SES-' + new Date().getTime() + '-' + Math.random().toString(36).substring(2, 10).toUpperCase();
    
    // DETECCIÓN DE REDIRECCIÓN A TMS PARA TRANSPORTISTAS
    var redirectToTms = false;
    // Roles que usan TMS: TRANSPORTISTA, CHOFER, CONDUCTOR, REPARTIDOR, TRANSPORTE
    var rolesTms = ['TRANSPORTISTA', 'CHOFER', 'CONDUCTOR', 'REPARTIDOR', 'TRANSPORTE'];
    var userRolUpper = String(foundUser.rol || '').toUpperCase();
    if (rolesTms.some(r => userRolUpper.includes(r))) {
      redirectToTms = true;
    }
    
    // Guardar sesión en hoja SESIONES (si existe)
    try {
      var ss = getSpreadsheet();
      var sessionSheet = ss.getSheetByName('SESIONES');
      if (!sessionSheet) {
        sessionSheet = ss.insertSheet('SESIONES');
        sessionSheet.getRange(1, 1, 1, 5).setValues([['SessionID', 'UserID', 'Email', 'FechaCreacion', 'Expiracion']]);
      }
      var expiracion = new Date();
      expiracion.setHours(expiracion.getHours() + 24); // 24 horas
      sessionSheet.appendRow([sessionId, foundUser.id, foundUser.email, new Date().toISOString(), expiracion.toISOString()]);
    } catch (e) {
      Logger.log('No se pudo guardar sesión: ' + e.message);
    }
    
    Logger.log('LOGIN EXITOSO: ' + cleanEmail + ' | Sesión: ' + sessionId);
    
    return {
      success: true,
      message: 'Autenticación exitosa',
      user: {
        id: foundUser.id,
        email: foundUser.email,
        nombre: foundUser.nombre,
        rol: foundUser.rol
      },
      sessionId: sessionId,
      redirectToTms: redirectToTms // Flag para redirección frontend
    };
    
  } catch (error) {
    Logger.log('ERROR en authenticateUser: ' + error.message);
    return { success: false, error: 'Error de autenticación: ' + error.message };
  }
}

/**
 * Incrementa el contador de intentos de login fallidos
 * @param {Cache} cache - Instancia del cache
 * @param {string} key - Clave del cache
 * @param {string} currentAttempts - Intentos actuales
 */
function incrementLoginAttempts(cache, key, currentAttempts) {
  var newAttempts = currentAttempts ? parseInt(currentAttempts) + 1 : 1;
  // Guardar por 5 minutos (300 segundos)
  cache.put(key, newAttempts.toString(), 300);
}

/**
 * Crea una nueva sesión para un usuario
 * Usa ConcurrencyManager para operaciones seguras
 * @param {string} userId - ID del usuario
 * @returns {string} ID de la sesión creada
 */
function createSession(userId) {
  return ConcurrencyManager.executeWithLock('session_create', function() {
    try {
      // Generar ID de sesión único
      const sessionId = generateSessionId();
      const now = new Date().toISOString();
      
      // Datos de la sesión
      const sessionData = [
        sessionId,
        userId,
        now,
        now,
        'SI'
      ];
      
      // Insertar sesión en la hoja
      insertSessionRow(sessionData);
      
      // Invalidar cache de sesiones
      const sessionsSheetName = getSessionsSheetName();
      CacheManager.invalidate(sessionsSheetName);
      
      Logger.log('Sesión creada: ' + sessionId + ' para usuario: ' + userId);
      
      return sessionId;
      
    } catch (error) {
      Logger.log('Error en createSession: ' + error.message);
      throw error;
    }
  });
}

/**
 * Valida si una sesión es válida y está activa
 * VERSIÓN CORREGIDA - Accede directamente a las hojas
 * @param {string} sessionId - ID de la sesión a validar
 * @returns {boolean} true si la sesión es válida, false en caso contrario
 */
function validateSession(sessionId) {
  try {
    if (!sessionId) {
      return false;
    }
    
    var ss = getSpreadsheet();
    var sessionSheet = ss.getSheetByName('SESIONES');
    
    if (!sessionSheet) {
      Logger.log('validateSession: Hoja SESIONES no encontrada');
      return false;
    }
    
    var data = sessionSheet.getDataRange().getValues();
    if (data.length <= 1) {
      return false;
    }
    
    // Encontrar columnas
    var headers = data[0];
    var sessionIdCol = -1, activaCol = -1, expiracionCol = -1;
    for (var h = 0; h < headers.length; h++) {
      var hdr = String(headers[h]).toUpperCase();
      if (hdr === 'SESSIONID' || hdr === 'SESSION_ID') sessionIdCol = h;
      else if (hdr === 'ACTIVA' || hdr === 'ACTIVE') activaCol = h;
      else if (hdr === 'EXPIRACION' || hdr === 'ULTIMOACCESO') expiracionCol = h;
    }
    
    // Buscar la sesión
    for (var i = 1; i < data.length; i++) {
      var rowSessionId = String(data[i][sessionIdCol] || '');
      if (rowSessionId === sessionId) {
        // Verificar si está activa
        if (activaCol >= 0) {
          var activa = String(data[i][activaCol] || '').toUpperCase();
          if (activa === 'NO') {
            Logger.log('validateSession: Sesión inactiva');
            return false;
          }
        }
        
        // Verificar expiración (24 horas)
        if (expiracionCol >= 0 && data[i][expiracionCol]) {
          var expiracion = new Date(data[i][expiracionCol]);
          var now = new Date();
          if (now > expiracion) {
            Logger.log('validateSession: Sesión expirada');
            return false;
          }
        }
        
        return true;
      }
    }
    
    Logger.log('validateSession: Sesión no encontrada');
    return false;
    
  } catch (error) {
    Logger.log('Error en validateSession: ' + error.message);
    return false;
  }
}

/**
 * Obtiene los datos del usuario asociado a una sesión
 * VERSIÓN CORREGIDA - Accede directamente a las hojas
 * @param {string} sessionId - ID de la sesión
 * @returns {Object|null} Datos del usuario o null si no se encuentra
 */
function getUserBySession(sessionId) {
  try {
    if (!sessionId) {
      Logger.log('getUserBySession: sessionId vacío');
      return null;
    }
    
    Logger.log('getUserBySession: Buscando sesión ' + sessionId);
    
    var ss = getSpreadsheet();
    
    // Buscar sesión en hoja SESIONES
    var sessionSheet = ss.getSheetByName('SESIONES');
    if (!sessionSheet) {
      Logger.log('getUserBySession: Hoja SESIONES no encontrada');
      return null;
    }
    
    var sessionData = sessionSheet.getDataRange().getValues();
    if (sessionData.length <= 1) {
      Logger.log('getUserBySession: Hoja SESIONES vacía');
      return null;
    }
    
    // Encontrar columnas de sesión
    var sessionHeaders = sessionData[0];
    var sessionIdCol = -1, userIdCol = -1, activaCol = -1;
    for (var h = 0; h < sessionHeaders.length; h++) {
      var hdr = String(sessionHeaders[h]).toUpperCase();
      if (hdr === 'SESSIONID' || hdr === 'SESSION_ID') sessionIdCol = h;
      else if (hdr === 'USERID' || hdr === 'USER_ID') userIdCol = h;
      else if (hdr === 'ACTIVA' || hdr === 'ACTIVE') activaCol = h;
    }
    
    // Buscar la sesión
    var userId = null;
    for (var i = 1; i < sessionData.length; i++) {
      var rowSessionId = String(sessionData[i][sessionIdCol] || '');
      if (rowSessionId === sessionId) {
        // Verificar si está activa (si existe la columna)
        if (activaCol >= 0) {
          var activa = String(sessionData[i][activaCol] || '').toUpperCase();
          if (activa === 'NO') {
            Logger.log('getUserBySession: Sesión inactiva');
            return null;
          }
        }
        userId = sessionData[i][userIdCol];
        Logger.log('getUserBySession: Sesión encontrada, userId=' + userId);
        break;
      }
    }
    
    if (!userId) {
      Logger.log('getUserBySession: Sesión no encontrada');
      return null;
    }
    
    // Buscar usuario en hoja USUARIOS
    var userSheet = ss.getSheetByName('USUARIOS');
    if (!userSheet) {
      Logger.log('getUserBySession: Hoja USUARIOS no encontrada');
      return null;
    }
    
    var userData = userSheet.getDataRange().getValues();
    if (userData.length <= 1) {
      Logger.log('getUserBySession: Hoja USUARIOS vacía');
      return null;
    }
    
    // Encontrar columnas de usuario
    var userHeaders = userData[0];
    var idCol = -1, emailCol = -1, nombreCol = -1, rolCol = -1;
    for (var j = 0; j < userHeaders.length; j++) {
      var uhdr = String(userHeaders[j]).toUpperCase();
      if (uhdr === 'ID') idCol = j;
      else if (uhdr === 'EMAIL' || uhdr === 'CORREO') emailCol = j;
      else if (uhdr === 'NOMBRE' || uhdr === 'NAME') nombreCol = j;
      else if (uhdr === 'ROL' || uhdr === 'ROLE') rolCol = j;
    }
    
    // Buscar el usuario
    for (var k = 1; k < userData.length; k++) {
      var rowUserId = String(userData[k][idCol] || '');
      if (rowUserId === String(userId)) {
        var user = {
          id: rowUserId,
          email: String(userData[k][emailCol] || ''),
          nombre: String(userData[k][nombreCol] || ''),
          rol: String(userData[k][rolCol] || '')
        };
        Logger.log('getUserBySession: Usuario encontrado - ' + user.nombre + ' (' + user.rol + ')');
        return user;
      }
    }
    
    Logger.log('getUserBySession: Usuario no encontrado para ID=' + userId);
    return null;
    
  } catch (error) {
    Logger.log('Error en getUserBySession: ' + error.message);
    return null;
  }
}

function requireRoleBySession(sessionId, allowedRoles) {
  try {
    if (!sessionId) {
      return { success: false, error: 'Session ID requerido', code: 401 };
    }
    
    if (!validateSession(sessionId)) {
      return { success: false, error: 'Sesión inválida o expirada', code: 401 };
    }
    
    var user = getUserBySession(sessionId);
    if (!user) {
      return { success: false, error: 'Usuario no encontrado', code: 401 };
    }
    
    var role = String(user.rol || '').toUpperCase().trim();
    var allowed = (allowedRoles || []).map(function(r) { return String(r || '').toUpperCase().trim(); });
    
    if (!allowed.includes(role)) {
      return { success: false, error: 'No autorizado', code: 403 };
    }
    
    return { success: true, user: user };
  } catch (e) {
    return { success: false, error: 'Error de autorización: ' + e.message, code: 500 };
  }
}

/**
 * Obtiene los permisos del usuario actual basado en su sesión
 * Utilizado por PermissionManager en el frontend
 * @param {string} sessionId - ID de la sesión
 * @returns {Object} { success, permisos, rol, roleColor, moduleCategories }
 */
// NOTA: Renombrada - usar version de Roles.gs que es mas completa
function getUserPermissionsBasic(sessionId) {
  try {
    var user = getUserBySession(sessionId);
    if (!user) {
      return { success: false, error: 'Sesión inválida o usuario no encontrado' };
    }
    
    var roleName = user.rol;
    var roleData = getRolePermissions(roleName);
    var roleUpper = String(roleName).toUpperCase().trim();
    
    // Si es ADMIN, asegurar acceso total siempre (Hardcoded Super-Admin)
    if (roleUpper === 'ADMIN' || roleUpper === 'ADMINISTRADOR') {
       return {
         success: true,
         permisos: ['*'],
         rol: roleName,
         roleColor: (roleData.success && roleData.role.color) ? roleData.role.color : '#ef4444',
         moduleCategories: typeof MODULE_CATEGORIES !== 'undefined' ? MODULE_CATEGORIES : null
       };
    }

    if (roleData.success) {
      return {
        success: true,
        permisos: roleData.role.permisos,
        rol: roleName,
        roleColor: roleData.role.color,
        moduleCategories: typeof MODULE_CATEGORIES !== 'undefined' ? MODULE_CATEGORIES : null
      };
    } else {
      return {
        success: true,
        permisos: [], // Sin permisos explícitos
        rol: roleName,
        roleColor: '#6366f1',
        moduleCategories: typeof MODULE_CATEGORIES !== 'undefined' ? MODULE_CATEGORIES : null
      };
    }
    
  } catch (e) {
    Logger.log('Error en getUserPermissions: ' + e.message);
    return { success: false, error: e.message };
  }
}

/**
 * Cierra la sesión de un usuario
 * VERSIÓN CORREGIDA - Accede directamente a las hojas
 * @param {string} sessionId - ID de la sesión a cerrar
 * @returns {Object} Resultado de la operación
 */
function logout(sessionId) {
  try {
    if (!sessionId) {
      return {
        success: false,
        error: 'Session ID requerido'
      };
    }
    
    var ss = getSpreadsheet();
    var sessionSheet = ss.getSheetByName('SESIONES');
    
    if (!sessionSheet) {
      return {
        success: false,
        error: 'Hoja SESIONES no encontrada'
      };
    }
    
    var data = sessionSheet.getDataRange().getValues();
    if (data.length <= 1) {
      return {
        success: false,
        error: 'Sesión no encontrada'
      };
    }
    
    // Encontrar columnas
    var headers = data[0];
    var sessionIdCol = -1, activaCol = -1;
    for (var h = 0; h < headers.length; h++) {
      var hdr = String(headers[h]).toUpperCase();
      if (hdr === 'SESSIONID' || hdr === 'SESSION_ID') sessionIdCol = h;
      else if (hdr === 'ACTIVA' || hdr === 'ACTIVE') activaCol = h;
    }
    
    // Buscar y desactivar la sesión
    for (var i = 1; i < data.length; i++) {
      var rowSessionId = String(data[i][sessionIdCol] || '');
      if (rowSessionId === sessionId) {
        if (activaCol >= 0) {
          sessionSheet.getRange(i + 1, activaCol + 1).setValue('NO');
        }
        Logger.log('Logout exitoso: ' + sessionId);
        return {
          success: true,
          message: 'Sesión cerrada correctamente'
        };
      }
    }
    
    return {
      success: false,
      error: 'Sesión no encontrada'
    };
    
  } catch (error) {
    Logger.log('Error en logout: ' + error.message);
    return {
      success: false,
      error: 'Error al cerrar sesión: ' + error.message
    };
  }
}

/**
 * Genera un ID único para una sesión
 * @returns {string} ID de sesión único
 */
function generateSessionId() {
  const timestamp = new Date().getTime();
  const random = Math.random().toString(36).substring(2, 15);
  return 'SES-' + timestamp + '-' + random;
}

/**
 * Crea un nuevo usuario en el sistema
 * Usa ConcurrencyManager para operaciones seguras
 * @param {Object} userData - Datos del usuario {email, password, nombre, rol}
 * @returns {Object} Resultado de la operación
 */
/*
function createUser(userData) {
  return ConcurrencyManager.executeWithLock('user_create', function() {
    try {
      // Limpiar y validar datos requeridos
      const email = (userData.email || '').trim();
      const password = (userData.password || '').trim();
      const nombre = (userData.nombre || '').trim();
      
      if (!email || !password || !nombre) {
        return {
          success: false,
          error: 'Email, contraseña y nombre son requeridos'
        };
      }
      
      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return {
          success: false,
          error: 'Formato de email inválido'
        };
      }
      
      // Validar longitud de contraseña
      if (password.length < 6) {
        return {
          success: false,
          error: 'La contraseña debe tener al menos 6 caracteres'
        };
      }
      
      // Verificar que el email no exista
      const existingUsers = findUsersRows({ Email: email });
      
      if (existingUsers.length > 0) {
        return {
          success: false,
          error: 'El email ya está registrado'
        };
      }
      
      // Validar que el rol exista
      const validRoles = ['ADMIN', 'SUPERVISOR', 'OPERADOR'];
      const rol = userData.rol || 'OPERADOR';
      if (!validRoles.includes(rol)) {
        return {
          success: false,
          error: 'Rol inválido. Roles válidos: ' + validRoles.join(', ')
        };
      }
      
      // Generar ID de usuario
      const userId = generateId('USR');
      
      // Hashear contraseña
      const passwordHash = hashPassword(password);
      
      // Datos del nuevo usuario
      const newUserData = [
        userId,
        email,
        passwordHash,
        nombre,
        rol,
        new Date().toISOString(),
        'SI'
      ];
      
      // Insertar usuario
      const result = insertUserRow(newUserData);
      
      if (result.success) {
        // Invalidar cache de usuarios
        const usersSheetName = getUsersSheetName();
        CacheManager.invalidate(usersSheetName);
        
        Logger.log('Usuario creado: ' + email);
        return {
          success: true,
          message: 'Usuario creado correctamente',
          userId: userId
        };
      } else {
        return result;
      }
      
    } catch (error) {
      Logger.log('Error en createUser: ' + error.message);
      return {
        success: false,
        error: 'Error al crear usuario: ' + error.message
      };
    }
  });
}
*/

/**
 * Cambia la contraseña de un usuario
 * @param {string} userId - ID del usuario
 * @param {string} oldPassword - Contraseña actual
 * @param {string} newPassword - Nueva contraseña
 * @returns {Object} Resultado de la operación
 */
function changePassword(userId, oldPassword, newPassword) {
  try {
    // Validar parámetros
    if (!userId || !oldPassword || !newPassword) {
      return {
        success: false,
        error: 'Todos los campos son requeridos'
      };
    }
    
    // Buscar usuario
    const users = findUsersRows({ ID: userId });
    
    if (users.length === 0) {
      return {
        success: false,
        error: 'Usuario no encontrado'
      };
    }
    
    const user = users[0];
    
    // Verificar contraseña actual
    const oldPasswordHash = hashPassword(oldPassword);
    
    if (user.data.Password !== oldPasswordHash) {
      return {
        success: false,
        error: 'Contraseña actual incorrecta'
      };
    }
    
    // Hashear nueva contraseña
    const newPasswordHash = hashPassword(newPassword);
    
    // Actualizar contraseña
    updateUserCell(user.rowIndex, 'Password', newPasswordHash);
    
    Logger.log('Contraseña cambiada para usuario: ' + userId);
    
    return {
      success: true,
      message: 'Contraseña actualizada correctamente'
    };
    
  } catch (error) {
    Logger.log('Error en changePassword: ' + error.message);
    return {
      success: false,
      error: 'Error al cambiar contraseña: ' + error.message
    };
  }
}

// NOTA: cleanExpiredSessions() version antigua removida
// La version correcta esta mas abajo (linea ~1150) con acceso directo a sheets


// ============================================================
// FUNCIONES DE DIAGNÓSTICO Y RESET - Ejecutar desde GAS
// ============================================================

/**
 * FUNCIÓN PARA RESETEAR CONTRASEÑA DE UN USUARIO
 * Ejecutar desde el editor de Google Apps Script
 * Uso: resetUserPassword('jguzman@ptm.cl', 'nuevacontraseña')
 */
function resetUserPassword(email, newPassword) {
  try {
    Logger.log('=== RESET PASSWORD ===');
    Logger.log('Email: ' + email);
    
    if (!email || !newPassword) {
      Logger.log('ERROR: Email y nueva contraseña son requeridos');
      return { success: false, error: 'Email y nueva contraseña son requeridos' };
    }
    
    var cleanEmail = String(email).trim().toLowerCase();
    
    // Obtener hoja de usuarios
    var userSheet = getUserSheet();
    if (!userSheet) {
      Logger.log('ERROR: No se encontró hoja de usuarios');
      return { success: false, error: 'No se encontró hoja de usuarios' };
    }
    
    var data = userSheet.getDataRange().getValues();
    
    // Buscar usuario
    for (var i = 1; i < data.length; i++) {
      var rowEmail = data[i][1] ? String(data[i][1]).trim().toLowerCase() : '';
      if (rowEmail === cleanEmail) {
        // Hashear nueva contraseña con hashPasswordSimple (el que usa createUser)
        var newHash = hashPasswordSimple(newPassword);
        
        // Actualizar contraseña (columna C = 3)
        userSheet.getRange(i + 1, 3).setValue(newHash);
        
        Logger.log('✅ Contraseña actualizada para: ' + email);
        Logger.log('Nueva contraseña: ' + newPassword);
        Logger.log('Hash: ' + newHash.substring(0, 20) + '...');
        
        return { 
          success: true, 
          message: 'Contraseña actualizada',
          email: email
        };
      }
    }
    
    Logger.log('ERROR: Usuario no encontrado: ' + email);
    return { success: false, error: 'Usuario no encontrado: ' + email };
    
  } catch (error) {
    Logger.log('ERROR: ' + error.message);
    return { success: false, error: error.message };
  }
}

/**
 * FUNCIÓN PARA CREAR USUARIO ADMIN DE EMERGENCIA
 * Ejecutar desde el editor de Google Apps Script
 */
function crearUsuarioAdmin() {
  try {
    Logger.log('=== CREAR USUARIO ADMIN ===');
    
    var userSheet = getUserSheet();
    if (!userSheet) {
      Logger.log('ERROR: No se pudo obtener hoja de usuarios');
      return { success: false, error: 'No se pudo obtener hoja de usuarios' };
    }
    
    // Verificar si ya existe admin@sistema.com
    var data = userSheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      var email = data[i][1] ? String(data[i][1]).trim().toLowerCase() : '';
      if (email === 'admin@sistema.com') {
        Logger.log('Usuario admin@sistema.com ya existe, actualizando contraseña...');
        return resetUserPassword('admin@sistema.com', 'admin123');
      }
    }
    
    // Crear nuevo usuario admin
    var userId = 'USR-ADMIN-' + new Date().getTime();
    var passwordHash = hashPasswordSimple('admin123');
    
    var newRow = [
      userId,
      'admin@sistema.com',
      passwordHash,
      'Administrador Sistema',
      'ADMIN',
      new Date().toISOString(),
      'SI'
    ];
    
    userSheet.appendRow(newRow);
    
    Logger.log('✅ Usuario admin creado:');
    Logger.log('   Email: admin@sistema.com');
    Logger.log('   Password: admin123');
    Logger.log('   Rol: ADMIN');
    
    return {
      success: true,
      message: 'Usuario admin creado',
      email: 'admin@sistema.com',
      password: 'admin123'
    };
    
  } catch (error) {
    Logger.log('ERROR: ' + error.message);
    return { success: false, error: error.message };
  }
}

/**
 * FUNCIÓN PARA VER TODOS LOS USUARIOS Y SUS HASHES
 * Ejecutar desde el editor de Google Apps Script
 */
function verUsuariosYHashes() {
  try {
    Logger.log('=== USUARIOS Y HASHES ===');
    
    var userSheet = getUserSheet();
    if (!userSheet) {
      Logger.log('ERROR: No se encontró hoja de usuarios');
      return;
    }
    
    var data = userSheet.getDataRange().getValues();
    Logger.log('Total filas: ' + data.length);
    Logger.log('Headers: ' + JSON.stringify(data[0]));
    
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      Logger.log('---');
      Logger.log('Usuario ' + i + ':');
      Logger.log('  ID: ' + row[0]);
      Logger.log('  Email: ' + row[1]);
      Logger.log('  Hash: ' + (row[2] ? row[2].substring(0, 30) + '...' : 'VACÍO'));
      Logger.log('  Nombre: ' + row[3]);
      Logger.log('  Rol: ' + row[4]);
      Logger.log('  Activo: ' + row[6]);
    }
    
    // Mostrar hashes de prueba
    Logger.log('');
    Logger.log('=== HASHES DE PRUEBA ===');
    Logger.log('Hash de "admin123" (Simple): ' + hashPasswordSimple('admin123'));
    Logger.log('Hash de "admin123" (Auth): ' + hashPassword('admin123'));
    
  } catch (error) {
    Logger.log('ERROR: ' + error.message);
  }
}

/**
 * FUNCIÓN PARA PROBAR LOGIN
 * Ejecutar desde el editor de Google Apps Script
 */
function probarLogin() {
  Logger.log('=== PROBAR LOGIN ===');
  
  // Probar con admin
  var result = authenticateUser('admin@sistema.com', 'admin123');
  Logger.log('Login admin@sistema.com: ' + JSON.stringify(result, null, 2));
  
  return result;
}

// ============================================================
// FUNCIÓN ARREGLAR ADMIN - EJECUTAR DESDE GAS EDITOR
// ============================================================

/**
 * ARREGLAR CONTRASEÑA DEL ADMIN
 * Esta función actualiza directamente el hash de la contraseña del admin
 * sin depender de otras funciones que puedan tener problemas de scope.
 * 
 * INSTRUCCIONES:
 * 1. Copia este código a tu proyecto de Google Apps Script
 * 2. Ejecuta la función arreglarAdmin() desde el editor
 * 3. Verifica en el Log que diga "OK - Password actualizado"
 * 4. Intenta hacer login con admin@sistema.com / admin123
 */
function arreglarAdmin() {
  try {
    Logger.log('=== ARREGLAR ADMIN ===');
    
    // Abrir spreadsheet directamente
    var ss = getSpreadsheet();
    var userSheet = ss.getSheetByName('USUARIOS');
    
    if (!userSheet) {
      Logger.log('ERROR: No se encontró la hoja USUARIOS');
      return 'ERROR: Hoja USUARIOS no encontrada';
    }
    
    var data = userSheet.getDataRange().getValues();
    Logger.log('Total filas: ' + data.length);
    
    // Buscar admin@sistema.com
    for (var i = 1; i < data.length; i++) {
      var email = String(data[i][1]).trim().toLowerCase();
      Logger.log('Fila ' + (i+1) + ': ' + email);
      
      if (email === 'admin@sistema.com') {
        // Calcular hash con el salt correcto CCO_SECURE_2024
        var salt = 'CCO_SECURE_2024';
        var password = 'admin123';
        var saltedPassword = salt + password + salt;
        
        var hash = Utilities.computeDigest(
          Utilities.DigestAlgorithm.SHA_256,
          saltedPassword,
          Utilities.Charset.UTF_8
        );
        
        var newHash = hash.map(function(byte) {
          var v = (byte < 0) ? 256 + byte : byte;
          return ('0' + v.toString(16)).slice(-2);
        }).join('');
        
        // Actualizar la celda de password (columna C = 3)
        userSheet.getRange(i + 1, 3).setValue(newHash);
        
        Logger.log('✅ OK - Password actualizado para admin@sistema.com');
        Logger.log('   Nuevo hash: ' + newHash.substring(0, 30) + '...');
        Logger.log('   Fila actualizada: ' + (i + 1));
        Logger.log('');
        Logger.log('AHORA PUEDES HACER LOGIN CON:');
        Logger.log('   Email: admin@sistema.com');
        Logger.log('   Password: admin123');
        
        return 'OK - Password actualizado';
      }
    }
    
    Logger.log('ERROR: Usuario admin@sistema.com no encontrado');
    Logger.log('Usuarios encontrados:');
    for (var j = 1; j < data.length; j++) {
      Logger.log('  - ' + data[j][1]);
    }
    
    return 'ERROR: Usuario no encontrado';
    
  } catch (error) {
    Logger.log('ERROR: ' + error.message);
    return 'ERROR: ' + error.message;
  }
}

/**
 * ARREGLAR CUALQUIER USUARIO
 * Uso: arreglarUsuario('email@ejemplo.com', 'nuevapassword')
 */
function arreglarUsuario(email, nuevaPassword) {
  try {
    if (!email || !nuevaPassword) {
      Logger.log('ERROR: Email y password son requeridos');
      return 'ERROR: Parámetros faltantes';
    }
    
    Logger.log('=== ARREGLAR USUARIO: ' + email + ' ===');
    
    var ss = getSpreadsheet();
    var userSheet = ss.getSheetByName('USUARIOS');
    
    if (!userSheet) {
      return 'ERROR: Hoja USUARIOS no encontrada';
    }
    
    var data = userSheet.getDataRange().getValues();
    var emailBuscado = String(email).trim().toLowerCase();
    
    for (var i = 1; i < data.length; i++) {
      var rowEmail = String(data[i][1]).trim().toLowerCase();
      
      if (rowEmail === emailBuscado) {
        // Calcular hash
        var salt = 'CCO_SECURE_2024';
        var saltedPassword = salt + nuevaPassword + salt;
        
        var hash = Utilities.computeDigest(
          Utilities.DigestAlgorithm.SHA_256,
          saltedPassword,
          Utilities.Charset.UTF_8
        );
        
        var newHash = hash.map(function(byte) {
          var v = (byte < 0) ? 256 + byte : byte;
          return ('0' + v.toString(16)).slice(-2);
        }).join('');
        
        userSheet.getRange(i + 1, 3).setValue(newHash);
        
        Logger.log('✅ Password actualizado para: ' + email);
        Logger.log('   Nueva password: ' + nuevaPassword);
        
        return 'OK - Password actualizado para ' + email;
      }
    }
    
    return 'ERROR: Usuario no encontrado: ' + email;

  } catch (error) {
    Logger.log('ERROR: ' + error.message);
    return 'ERROR: ' + error.message;
  }
}

// ==================== LIMPIEZA DE SESIONES ====================

/**
 * Limpia sesiones expiradas de la hoja SESIONES
 * Las sesiones expiran despues de 24 horas
 * Se recomienda ejecutar con un trigger temporal cada 6-12 horas
 *
 * Para instalar el trigger:
 *   instalarTriggerLimpiezaSesiones()
 */
function cleanExpiredSessions() {
  try {
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName('SESIONES');

    if (!sheet || sheet.getLastRow() <= 1) {
      Logger.log('cleanExpiredSessions: No hay sesiones que limpiar');
      return { success: true, eliminadas: 0 };
    }

    var data = sheet.getDataRange().getValues();
    var ahora = new Date().getTime();
    var EXPIRACION_MS = 24 * 60 * 60 * 1000; // 24 horas
    var filasEliminar = [];

    // Recorrer de abajo hacia arriba para eliminar sin afectar indices
    for (var i = data.length - 1; i >= 1; i--) {
      var fechaCreacion = data[i][3]; // columna FechaCreacion
      var activa = String(data[i][5] || '').toUpperCase(); // columna Activa

      // Eliminar si esta inactiva o si expiro
      var esInactiva = activa === 'NO';
      var expiro = false;

      if (fechaCreacion instanceof Date) {
        expiro = (ahora - fechaCreacion.getTime()) > EXPIRACION_MS;
      } else if (typeof fechaCreacion === 'string' && fechaCreacion) {
        var fecha = new Date(fechaCreacion);
        if (!isNaN(fecha.getTime())) {
          expiro = (ahora - fecha.getTime()) > EXPIRACION_MS;
        }
      }

      if (esInactiva || expiro) {
        filasEliminar.push(i + 1); // +1 porque sheets es 1-indexed
      }
    }

    // Eliminar filas de abajo hacia arriba
    for (var j = 0; j < filasEliminar.length; j++) {
      sheet.deleteRow(filasEliminar[j]);
    }

    Logger.log('cleanExpiredSessions: Eliminadas ' + filasEliminar.length + ' sesiones expiradas');
    return { success: true, eliminadas: filasEliminar.length };

  } catch (error) {
    Logger.log('Error en cleanExpiredSessions: ' + error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Instala un trigger temporal para limpiar sesiones expiradas cada 6 horas
 * Ejecutar manualmente una vez desde el editor de Apps Script
 */
function instalarTriggerLimpiezaSesiones() {
  // Eliminar triggers existentes de esta funcion
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'cleanExpiredSessions') {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }

  // Crear nuevo trigger cada 6 horas
  ScriptApp.newTrigger('cleanExpiredSessions')
    .timeBased()
    .everyHours(6)
    .create();

  Logger.log('Trigger de limpieza de sesiones instalado (cada 6 horas)');
}
