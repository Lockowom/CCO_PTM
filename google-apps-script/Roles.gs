/**
 * Roles.gs
 * Servicio de gestión de roles y permisos dinámicos
 * Controla el acceso a vistas según el rol del usuario
 * 
 * ESTRUCTURA DE MÓDULOS:
 * - INBOUND: ingreso (Recepción)
 * - OUTBOUND: notasventa, picking, packing, shipping, delivery
 * - CONSULTAS: lotesseries, estadonv
 * - INVENTARIO: inventory, layout, transferencias
 * - ADMIN: dashboard, users, roles, reports
 */

// Mapeo de nombres antiguos a nuevos (para compatibilidad con datos existentes)
const MODULE_ALIASES = {
  'despacho': 'dispatch',
  'shipping': 'shipping',
  'entregas': 'delivery',
  'inventario': 'inventory',
  'usuarios': 'users',
  'reportes': 'reports',
  'consultas': 'estadonv'
};

// Función para normalizar ID de módulo
function normalizeModuleId(moduleId) {
  if (!moduleId) return '';
  var lower = moduleId.toLowerCase();
  return MODULE_ALIASES[lower] || lower;
}

// Estructura de categorías y módulos del sistema
const MODULE_CATEGORIES = {
  INBOUND: {
    name: 'Inbound',
    icon: 'fa-arrow-down',
    color: '#10b981',
    modules: [
      { id: 'ingreso', name: 'Recepción', icon: 'fa-truck-loading' }
    ]
  },
  OUTBOUND: {
    name: 'Outbound',
    icon: 'fa-arrow-up',
    color: '#8b5cf6',
    modules: [
      { id: 'notasventa', name: 'Notas Venta', icon: 'fa-file-invoice' },
      { id: 'picking', name: 'Picking', icon: 'fa-hand-pointer' },
      { id: 'packing', name: 'Packing', icon: 'fa-box-open' },
      { id: 'shipping', name: 'Despachos', icon: 'fa-shipping-fast' },
      { id: 'delivery', name: 'Entregas', icon: 'fa-clipboard-check' }
    ]
  },
  CONSULTAS: {
    name: 'Consultas',
    icon: 'fa-search',
    color: '#f59e0b',
    modules: [
      { id: 'lotesseries', name: 'Lotes/Series', icon: 'fa-qrcode' },
      { id: 'estadonv', name: 'Estado de N.V', icon: 'fa-search' }
    ]
  },
  INVENTARIO: {
    name: 'Inventario',
    icon: 'fa-warehouse',
    color: '#3b82f6',
    modules: [
      { id: 'inventory', name: 'Stock', icon: 'fa-cubes' },
      { id: 'layout', name: 'Layout', icon: 'fa-th-large' },
      { id: 'transferencias', name: 'Transferencias', icon: 'fa-exchange-alt' }
    ]
  },
  ADMIN: {
    name: 'Administración',
    icon: 'fa-cog',
    color: '#ef4444',
    modules: [
      { id: 'dashboard', name: 'Dashboard', icon: 'fa-chart-pie' },
      { id: 'users', name: 'Usuarios', icon: 'fa-users' },
      { id: 'roles', name: 'Roles', icon: 'fa-user-shield' },
      { id: 'adminviews', name: 'Vistas', icon: 'fa-layer-group' },
      { id: 'reports', name: 'Reportes', icon: 'fa-chart-bar' }
    ]
  }
};

// Lista plana de todos los módulos disponibles
const ALL_MODULES = (function() {
  var modules = [];
  for (var cat in MODULE_CATEGORIES) {
    MODULE_CATEGORIES[cat].modules.forEach(function(m) {
      modules.push(m.id);
    });
  }
  return modules;
})();

// Alias para compatibilidad con código existente
const ALL_VIEWS = ALL_MODULES;

/**
 * Obtiene todos los roles del sistema
 * VERSIÓN CORREGIDA - Accede directamente a la hoja ROLES
 * Incluye conteo de usuarios por rol
 * @returns {Object} Lista de roles con sus permisos
 */
function getAllRoles(sessionId) {
  try {
    // NOTA: La autenticación se maneja a nivel de la aplicación web
    // El usuario ya está logueado si puede acceder a esta función
    
    // Verificar y agregar columnas Icono/ColorBg si no existen
    ensureRoleColumns();
    
    // Acceder directamente a la hoja ROLES (no usar getAllRows que puede fallar con el nombre)
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName('ROLES') || ss.getSheetByName('Roles');
    
    if (!sheet) {
      Logger.log('getAllRoles: Hoja ROLES no encontrada');
      return {
        success: false,
        error: 'Hoja ROLES no encontrada'
      };
    }
    
    var data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return {
        success: true,
        roles: [],
        allModules: ALL_MODULES,
        moduleCategories: MODULE_CATEGORIES
      };
    }
    
    // Obtener conteo de usuarios por rol
    var userCountByRole = getUserCountByRole(ss);
    
    var headers = data[0];
    var headersUpper = headers.map(function(h) { return String(h).toUpperCase(); });
    
    // Encontrar índices de columnas
    var idCol = headersUpper.indexOf('ID');
    var nombreCol = headersUpper.indexOf('NOMBRE');
    var permisosCol = headersUpper.indexOf('PERMISOS');
    if (permisosCol === -1) permisosCol = headersUpper.indexOf('VISTAS');
    var descripcionCol = headersUpper.indexOf('DESCRIPCION');
    var colorCol = headersUpper.indexOf('COLOR');
    var colorBgCol = headersUpper.indexOf('COLORBG');
    var iconoCol = headersUpper.indexOf('ICONO');
    var activoCol = headersUpper.indexOf('ACTIVO');
    var fechaCreacionCol = headersUpper.indexOf('FECHACREACION');
    var fechaModificacionCol = headersUpper.indexOf('FECHAMODIFICACION');
    
    var roleList = [];
    
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      
      // Verificar si está activo
      var activo = activoCol >= 0 ? String(row[activoCol] || '').toUpperCase() !== 'NO' : true;
      if (!activo) continue; // Saltar roles inactivos
      
      // Parsear permisos
      var permisos = [];
      var permisosRaw = permisosCol >= 0 ? row[permisosCol] : '';
      
      if (permisosRaw) {
        try {
          var permisosStr = String(permisosRaw).trim();
          if (permisosStr.startsWith('[')) {
            permisos = JSON.parse(permisosStr);
          } else {
            permisos = permisosStr.split(',').map(function(v) { return v.trim().toLowerCase(); });
          }
        } catch (e) {
          permisos = String(permisosRaw).split(',').map(function(v) { return v.trim().toLowerCase(); });
        }
      }
      
      // Filtrar valores vacíos
      permisos = permisos.filter(function(p) { return p && p.length > 0; });
      
      // Obtener nombre del rol para buscar conteo de usuarios
      var roleName = nombreCol >= 0 ? String(row[nombreCol] || '').toUpperCase() : '';
      var usuariosCount = userCountByRole[roleName] || 0;
      
      roleList.push({
        id: idCol >= 0 ? row[idCol] : '',
        nombre: nombreCol >= 0 ? row[nombreCol] : '',
        permisos: permisos,
        vistas: permisos,
        descripcion: descripcionCol >= 0 ? (row[descripcionCol] || '') : '',
        color: colorCol >= 0 ? (row[colorCol] || '#6366f1') : '#6366f1',
        colorBg: colorBgCol >= 0 ? (row[colorBgCol] || '#e0e7ff') : '#e0e7ff',
        icono: iconoCol >= 0 ? (row[iconoCol] || 'user-cog') : 'user-cog',
        activo: true,
        usuarios: usuariosCount,
        fechaCreacion: fechaCreacionCol >= 0 ? row[fechaCreacionCol] : '',
        fechaModificacion: fechaModificacionCol >= 0 ? row[fechaModificacionCol] : ''
      });
    }
    
    Logger.log('getAllRoles: ' + roleList.length + ' roles encontrados');
    
    return {
      success: true,
      roles: roleList,
      allModules: ALL_MODULES,
      moduleCategories: MODULE_CATEGORIES
    };
    
  } catch (error) {
    Logger.log('Error en getAllRoles: ' + error.message);
    return {
      success: false,
      error: 'Error al obtener roles: ' + error.message
    };
  }
}

/**
 * Obtiene el conteo de usuarios por rol
 * @param {Spreadsheet} ss - Spreadsheet activo
 * @returns {Object} Objeto con conteo de usuarios por nombre de rol (en mayúsculas)
 */
function getUserCountByRole(ss) {
  try {
    var userSheet = ss.getSheetByName('USUARIOS') || ss.getSheetByName('Usuarios');
    
    if (!userSheet) {
      Logger.log('getUserCountByRole: Hoja USUARIOS no encontrada');
      return {};
    }
    
    var userData = userSheet.getDataRange().getValues();
    if (userData.length <= 1) {
      return {};
    }
    
    var userHeaders = userData[0].map(function(h) { return String(h).toUpperCase(); });
    var rolCol = userHeaders.indexOf('ROL');
    if (rolCol === -1) rolCol = userHeaders.indexOf('ROLE');
    var activoCol = userHeaders.indexOf('ACTIVO');
    
    if (rolCol === -1) {
      Logger.log('getUserCountByRole: Columna ROL no encontrada');
      return {};
    }
    
    var countByRole = {};
    
    for (var i = 1; i < userData.length; i++) {
      // Solo contar usuarios activos
      var activo = activoCol >= 0 ? String(userData[i][activoCol] || '').toUpperCase() !== 'NO' : true;
      if (!activo) continue;
      
      var userRol = String(userData[i][rolCol] || '').toUpperCase();
      if (userRol) {
        countByRole[userRol] = (countByRole[userRol] || 0) + 1;
      }
    }
    
    Logger.log('getUserCountByRole: ' + JSON.stringify(countByRole));
    return countByRole;
    
  } catch (error) {
    Logger.log('Error en getUserCountByRole: ' + error.message);
    return {};
  }
}

/**
 * Asegura que existan las columnas Icono y ColorBg en la hoja ROLES
 */
function ensureRoleColumns() {
  try {
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName('ROLES') || ss.getSheetByName('Roles');
    
    if (!sheet) {
      Logger.log('ensureRoleColumns: Hoja ROLES no encontrada');
      return false;
    }
    
    var lastCol = sheet.getLastColumn();
    if (lastCol === 0) {
      Logger.log('ensureRoleColumns: Hoja vacía');
      return false;
    }
    
    var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    var headersUpper = headers.map(function(h) { return String(h).toUpperCase(); });
    
    var hasIcono = headersUpper.indexOf('ICONO') !== -1;
    var hasColorBg = headersUpper.indexOf('COLORBG') !== -1;
    
    var nextCol = lastCol + 1;
    var added = [];
    
    if (!hasIcono) {
      sheet.getRange(1, nextCol).setValue('Icono');
      sheet.getRange(1, nextCol).setBackground('#1e293b').setFontColor('#ffffff').setFontWeight('bold');
      added.push('Icono');
      Logger.log('ensureRoleColumns: Columna Icono agregada en posición ' + nextCol);
      nextCol++;
    }
    
    if (!hasColorBg) {
      sheet.getRange(1, nextCol).setValue('ColorBg');
      sheet.getRange(1, nextCol).setBackground('#1e293b').setFontColor('#ffffff').setFontWeight('bold');
      added.push('ColorBg');
      Logger.log('ensureRoleColumns: Columna ColorBg agregada en posición ' + nextCol);
    }
    
    if (added.length > 0) {
      Logger.log('ensureRoleColumns: Columnas agregadas: ' + added.join(', '));
      // Invalidar cache para que se recarguen los headers
      if (typeof CacheManager !== 'undefined') {
        CacheManager.invalidate('Roles');
      }
    }
    
    return true;
  } catch (e) {
    Logger.log('Error en ensureRoleColumns: ' + e.message);
    return false;
  }
}

/**
 * Obtiene los permisos de un rol específico
 * @param {string} roleName - Nombre del rol
 * @returns {Object} Permisos del rol
 */
function getRolePermissions(roleName) {
  try {
    if (!roleName) {
      return {
        success: false,
        error: 'Nombre de rol requerido'
      };
    }
    
    Logger.log('getRolePermissions: Buscando rol "' + roleName + '"');
    
    // Buscar directamente en la hoja ROLES
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName('ROLES') || ss.getSheetByName('Roles');
    
    if (!sheet) {
      Logger.log('getRolePermissions: Hoja ROLES no encontrada');
      return {
        success: false,
        error: 'Hoja ROLES no encontrada'
      };
    }
    
    var data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return {
        success: false,
        error: 'Hoja ROLES vacía'
      };
    }
    
    var headers = data[0];
    var headersUpper = headers.map(function(h) { return String(h).toUpperCase(); });
    
    // Encontrar índices de columnas
    var nombreCol = headersUpper.indexOf('NOMBRE');
    var permisosCol = headersUpper.indexOf('PERMISOS');
    if (permisosCol === -1) permisosCol = headersUpper.indexOf('VISTAS');
    var colorCol = headersUpper.indexOf('COLOR');
    var descripcionCol = headersUpper.indexOf('DESCRIPCION');
    var idCol = headersUpper.indexOf('ID');
    
    Logger.log('getRolePermissions: Columnas - Nombre:' + nombreCol + ', Permisos:' + permisosCol);
    
    // Buscar el rol
    var roleNameUpper = roleName.toUpperCase();
    for (var i = 1; i < data.length; i++) {
      var nombre = String(data[i][nombreCol] || '').toUpperCase();
      if (nombre === roleNameUpper) {
        var permisosRaw = data[i][permisosCol] || '';
        var permisos = [];
        
        Logger.log('getRolePermissions: Rol encontrado, permisos raw: ' + permisosRaw);
        
        if (permisosRaw) {
          try {
            var permisosStr = String(permisosRaw).trim();
            if (permisosStr.startsWith('[')) {
              permisos = JSON.parse(permisosStr);
            } else {
              permisos = permisosStr.split(',').map(function(v) { return v.trim().toLowerCase(); });
            }
          } catch (e) {
            Logger.log('getRolePermissions: Error parseando permisos: ' + e.message);
            permisos = String(permisosRaw).split(',').map(function(v) { return v.trim().toLowerCase(); });
          }
        }
        
        // Filtrar valores vacíos
        permisos = permisos.filter(function(p) { return p && p.length > 0; });
        
        Logger.log('getRolePermissions: Permisos parseados: ' + JSON.stringify(permisos));
        
        return {
          success: true,
          role: {
            id: idCol >= 0 ? data[i][idCol] : '',
            nombre: data[i][nombreCol],
            permisos: permisos,
            vistas: permisos,
            descripcion: descripcionCol >= 0 ? (data[i][descripcionCol] || '') : '',
            color: colorCol >= 0 ? (data[i][colorCol] || '#6366f1') : '#6366f1'
          }
        };
      }
    }
    
    Logger.log('getRolePermissions: Rol "' + roleName + '" no encontrado');
    return {
      success: false,
      error: 'Rol no encontrado: ' + roleName
    };
    
  } catch (error) {
    Logger.log('Error en getRolePermissions: ' + error.message);
    return {
      success: false,
      error: 'Error al obtener permisos: ' + error.message
    };
  }
}

/**
 * Actualiza un rol existente
 * VERSIÓN CORREGIDA - Accede directamente a la hoja ROLES
 * IMPORTANTE: Si se cambia el nombre del rol, actualiza automáticamente todos los usuarios con ese rol
 * @param {string} roleId - ID del rol
 * @param {Object} updates - Datos a actualizar {nombre, permisos, descripcion, color, colorBg, icono}
 * @returns {Object} Resultado de la operación
 */
function updateRole(roleId, updates, sessionId) {
  try {
    // NOTA: La autenticación se maneja a nivel de la aplicación web
    
    if (!roleId) {
      return {
        success: false,
        error: 'ID de rol requerido'
      };
    }
    
    Logger.log('updateRole: Actualizando rol "' + roleId + '" con datos: ' + JSON.stringify(updates));
    
    // IMPORTANTE: Asegurar que existan las columnas Icono y ColorBg antes de actualizar
    ensureRoleColumns();
    
    // Acceder directamente a la hoja ROLES
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName('ROLES') || ss.getSheetByName('Roles');
    
    if (!sheet) {
      Logger.log('updateRole: Hoja ROLES no encontrada');
      return {
        success: false,
        error: 'Hoja ROLES no encontrada'
      };
    }
    
    var data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return {
        success: false,
        error: 'Hoja ROLES vacía'
      };
    }
    
    var headers = data[0];
    var headersUpper = headers.map(function(h) { return String(h).toUpperCase(); });
    
    // Encontrar índices de columnas
    var idCol = headersUpper.indexOf('ID');
    var nombreCol = headersUpper.indexOf('NOMBRE');
    var permisosCol = headersUpper.indexOf('PERMISOS');
    if (permisosCol === -1) permisosCol = headersUpper.indexOf('VISTAS');
    var descripcionCol = headersUpper.indexOf('DESCRIPCION');
    var colorCol = headersUpper.indexOf('COLOR');
    var colorBgCol = headersUpper.indexOf('COLORBG');
    var iconoCol = headersUpper.indexOf('ICONO');
    var fechaModCol = headersUpper.indexOf('FECHAMODIFICACION');
    
    // Buscar el rol por ID o por nombre
    var roleIdUpper = String(roleId).toUpperCase();
    var rowIndex = -1;
    var oldRoleName = ''; // Guardar el nombre anterior para actualizar usuarios
    
    for (var i = 1; i < data.length; i++) {
      var id = idCol >= 0 ? String(data[i][idCol] || '').toUpperCase() : '';
      var nombre = nombreCol >= 0 ? String(data[i][nombreCol] || '').toUpperCase() : '';
      
      if (id === roleIdUpper || nombre === roleIdUpper) {
        rowIndex = i + 1; // +1 porque las filas en Sheets empiezan en 1
        oldRoleName = nombreCol >= 0 ? data[i][nombreCol] : ''; // Guardar nombre original
        break;
      }
    }
    
    if (rowIndex === -1) {
      Logger.log('updateRole: Rol "' + roleId + '" no encontrado');
      return {
        success: false,
        error: 'Rol no encontrado: ' + roleId
      };
    }
    
    Logger.log('updateRole: Rol encontrado en fila ' + rowIndex + ', nombre anterior: ' + oldRoleName);
    
    // Actualizar campos
    var newRoleName = oldRoleName; // Por defecto mantener el nombre
    if (updates.nombre && nombreCol >= 0) {
      newRoleName = updates.nombre;
      sheet.getRange(rowIndex, nombreCol + 1).setValue(updates.nombre);
      Logger.log('updateRole: Nombre cambiado de "' + oldRoleName + '" a "' + newRoleName + '"');
    }
    
    if ((updates.permisos !== undefined || updates.vistas !== undefined) && permisosCol >= 0) {
      var permisos = updates.permisos || updates.vistas || [];
      if (!Array.isArray(permisos)) permisos = [];
      sheet.getRange(rowIndex, permisosCol + 1).setValue(JSON.stringify(permisos));
    }
    
    if (updates.descripcion !== undefined && descripcionCol >= 0) {
      sheet.getRange(rowIndex, descripcionCol + 1).setValue(updates.descripcion);
    }
    
    if (updates.color && colorCol >= 0) {
      Logger.log('updateRole: Actualizando Color: ' + updates.color);
      sheet.getRange(rowIndex, colorCol + 1).setValue(updates.color);
    }
    
    if (updates.colorBg && colorBgCol >= 0) {
      Logger.log('updateRole: Actualizando ColorBg: ' + updates.colorBg);
      sheet.getRange(rowIndex, colorBgCol + 1).setValue(updates.colorBg);
    }
    
    if (updates.icono && iconoCol >= 0) {
      Logger.log('updateRole: Actualizando Icono: ' + updates.icono);
      sheet.getRange(rowIndex, iconoCol + 1).setValue(updates.icono);
    }
    
    if (fechaModCol >= 0) {
      sheet.getRange(rowIndex, fechaModCol + 1).setValue(new Date().toISOString());
    }
    
    // *** IMPORTANTE: Si el nombre del rol cambió, actualizar todos los usuarios con ese rol ***
    var usersUpdated = 0;
    if (oldRoleName && newRoleName && oldRoleName.toUpperCase() !== newRoleName.toUpperCase()) {
      usersUpdated = updateUsersWithRole(ss, oldRoleName, newRoleName);
      Logger.log('updateRole: ' + usersUpdated + ' usuarios actualizados de "' + oldRoleName + '" a "' + newRoleName + '"');
    }
    
    // Invalidar cache
    if (typeof CacheManager !== 'undefined') {
      CacheManager.invalidate('Roles');
      CacheManager.invalidate('ROLES');
      CacheManager.invalidate('Usuarios');
      CacheManager.invalidate('USUARIOS');
    }
    
    Logger.log('updateRole: Rol actualizado correctamente: ' + roleId);
    
    return {
      success: true,
      message: usersUpdated > 0 
        ? 'Rol actualizado correctamente. ' + usersUpdated + ' usuario(s) actualizado(s) al nuevo nombre de rol.'
        : 'Rol actualizado correctamente',
      roleId: roleId,
      usersUpdated: usersUpdated
    };
    
  } catch (error) {
    Logger.log('Error en updateRole: ' + error.message);
    return {
      success: false,
      error: 'Error al actualizar rol: ' + error.message
    };
  }
}

/**
 * Actualiza todos los usuarios que tienen un rol específico al nuevo nombre de rol
 * @param {Spreadsheet} ss - Spreadsheet activo
 * @param {string} oldRoleName - Nombre anterior del rol
 * @param {string} newRoleName - Nuevo nombre del rol
 * @returns {number} Cantidad de usuarios actualizados
 */
function updateUsersWithRole(ss, oldRoleName, newRoleName) {
  try {
    var userSheet = ss.getSheetByName('USUARIOS') || ss.getSheetByName('Usuarios');
    
    if (!userSheet) {
      Logger.log('updateUsersWithRole: Hoja USUARIOS no encontrada');
      return 0;
    }
    
    var userData = userSheet.getDataRange().getValues();
    if (userData.length <= 1) {
      return 0;
    }
    
    var userHeaders = userData[0].map(function(h) { return String(h).toUpperCase(); });
    var rolCol = userHeaders.indexOf('ROL');
    if (rolCol === -1) rolCol = userHeaders.indexOf('ROLE');
    
    if (rolCol === -1) {
      Logger.log('updateUsersWithRole: Columna ROL no encontrada');
      return 0;
    }
    
    var oldRoleUpper = oldRoleName.toUpperCase();
    var usersUpdated = 0;
    
    for (var i = 1; i < userData.length; i++) {
      var userRol = String(userData[i][rolCol] || '').toUpperCase();
      if (userRol === oldRoleUpper) {
        // Actualizar el rol del usuario (i+1 porque filas empiezan en 1, rolCol+1 porque columnas empiezan en 1)
        userSheet.getRange(i + 1, rolCol + 1).setValue(newRoleName);
        usersUpdated++;
        Logger.log('updateUsersWithRole: Usuario en fila ' + (i + 1) + ' actualizado a rol "' + newRoleName + '"');
      }
    }
    
    return usersUpdated;
    
  } catch (error) {
    Logger.log('Error en updateUsersWithRole: ' + error.message);
    return 0;
  }
}

/**
 * Actualiza los permisos de un rol (por nombre - compatibilidad)
 * VERSIÓN CORREGIDA - Accede directamente a la hoja ROLES
 * Los cambios se aplican inmediatamente a todos los usuarios con ese rol
 * @param {string} roleName - Nombre del rol
 * @param {Array} views - Lista de vistas permitidas
 * @returns {Object} Resultado de la operación
 */
function updateRolePermissions(roleName, views, sessionId) {
  try {
    // NOTA: La autenticación se maneja a nivel de la aplicación web
    
    Logger.log('updateRolePermissions: Actualizando permisos para rol "' + roleName + '"');
    Logger.log('updateRolePermissions: Vistas recibidas: ' + JSON.stringify(views));
    
    if (!roleName) {
      return {
        success: false,
        error: 'Nombre de rol requerido'
      };
    }
    
    // Validar vistas
    if (!Array.isArray(views)) {
      return {
        success: false,
        error: 'Las vistas deben ser un array'
      };
    }
    
    // Acceder directamente a la hoja ROLES
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName('ROLES') || ss.getSheetByName('Roles');
    
    if (!sheet) {
      Logger.log('updateRolePermissions: Hoja ROLES no encontrada');
      return {
        success: false,
        error: 'Hoja ROLES no encontrada'
      };
    }
    
    var data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return {
        success: false,
        error: 'Hoja ROLES vacía'
      };
    }
    
    var headers = data[0];
    var headersUpper = headers.map(function(h) { return String(h).toUpperCase(); });
    
    // Encontrar índices de columnas
    var nombreCol = headersUpper.indexOf('NOMBRE');
    var permisosCol = headersUpper.indexOf('PERMISOS');
    if (permisosCol === -1) permisosCol = headersUpper.indexOf('VISTAS');
    var fechaModCol = headersUpper.indexOf('FECHAMODIFICACION');
    
    Logger.log('updateRolePermissions: Columnas - Nombre:' + nombreCol + ', Permisos:' + permisosCol);
    
    if (nombreCol === -1 || permisosCol === -1) {
      return {
        success: false,
        error: 'Columnas requeridas no encontradas en hoja ROLES'
      };
    }
    
    // Buscar el rol
    var roleNameUpper = roleName.toUpperCase();
    for (var i = 1; i < data.length; i++) {
      var nombre = String(data[i][nombreCol] || '').toUpperCase();
      if (nombre === roleNameUpper) {
        // Convertir a minúsculas y guardar como JSON
        var permisos = views.map(function(v) { return String(v).toLowerCase(); });
        var permisosJson = JSON.stringify(permisos);
        
        Logger.log('updateRolePermissions: Rol encontrado en fila ' + (i + 1));
        Logger.log('updateRolePermissions: Guardando permisos: ' + permisosJson);
        
        // Actualizar celda de permisos (i+1 porque las filas empiezan en 1, permisosCol+1 porque las columnas empiezan en 1)
        sheet.getRange(i + 1, permisosCol + 1).setValue(permisosJson);
        
        // Actualizar fecha de modificación si existe la columna
        if (fechaModCol !== -1) {
          sheet.getRange(i + 1, fechaModCol + 1).setValue(new Date().toISOString());
        }
        
        // Invalidar cache de roles Y usuarios para que los cambios se apliquen inmediatamente
        if (typeof CacheManager !== 'undefined') {
          CacheManager.invalidate('Roles');
          CacheManager.invalidate('ROLES');
          CacheManager.invalidate('Usuarios');
          CacheManager.invalidate('USUARIOS');
        }
        
        // Contar usuarios afectados
        var usersAffected = countUsersWithRole(ss, roleName);
        
        Logger.log('updateRolePermissions: Permisos actualizados correctamente para ' + roleName + '. ' + usersAffected + ' usuarios afectados.');
        
        return {
          success: true,
          message: 'Permisos actualizados correctamente. ' + usersAffected + ' usuario(s) con este rol verán los cambios inmediatamente.',
          permisos: permisos,
          usersAffected: usersAffected
        };
      }
    }
    
    Logger.log('updateRolePermissions: Rol "' + roleName + '" no encontrado');
    return {
      success: false,
      error: 'Rol no encontrado: ' + roleName
    };
    
  } catch (error) {
    Logger.log('Error en updateRolePermissions: ' + error.message);
    return {
      success: false,
      error: 'Error al actualizar permisos: ' + error.message
    };
  }
}

/**
 * Cuenta cuántos usuarios tienen un rol específico
 * @param {Spreadsheet} ss - Spreadsheet activo
 * @param {string} roleName - Nombre del rol
 * @returns {number} Cantidad de usuarios con ese rol
 */
function countUsersWithRole(ss, roleName) {
  try {
    var userSheet = ss.getSheetByName('USUARIOS') || ss.getSheetByName('Usuarios');
    
    if (!userSheet) {
      return 0;
    }
    
    var userData = userSheet.getDataRange().getValues();
    if (userData.length <= 1) {
      return 0;
    }
    
    var userHeaders = userData[0].map(function(h) { return String(h).toUpperCase(); });
    var rolCol = userHeaders.indexOf('ROL');
    if (rolCol === -1) rolCol = userHeaders.indexOf('ROLE');
    
    if (rolCol === -1) {
      return 0;
    }
    
    var roleNameUpper = roleName.toUpperCase();
    var count = 0;
    
    for (var i = 1; i < userData.length; i++) {
      var userRol = String(userData[i][rolCol] || '').toUpperCase();
      if (userRol === roleNameUpper) {
        count++;
      }
    }
    
    return count;
    
  } catch (error) {
    Logger.log('Error en countUsersWithRole: ' + error.message);
    return 0;
  }
}

/**
 * Sincroniza todos los usuarios con los roles existentes
 * Útil para corregir usuarios que tienen roles que ya no existen
 * @returns {Object} Resultado de la sincronización
 */
function syncAllUsersWithRoles() {
  try {
    var ss = getSpreadsheet();
    
    // Obtener todos los roles válidos
    var roleSheet = ss.getSheetByName('ROLES') || ss.getSheetByName('Roles');
    if (!roleSheet) {
      return { success: false, error: 'Hoja ROLES no encontrada' };
    }
    
    var roleData = roleSheet.getDataRange().getValues();
    var roleHeaders = roleData[0].map(function(h) { return String(h).toUpperCase(); });
    var roleNombreCol = roleHeaders.indexOf('NOMBRE');
    var roleActivoCol = roleHeaders.indexOf('ACTIVO');
    
    // Crear lista de roles válidos (activos)
    var validRoles = [];
    for (var r = 1; r < roleData.length; r++) {
      var activo = roleActivoCol >= 0 ? String(roleData[r][roleActivoCol] || '').toUpperCase() !== 'NO' : true;
      if (activo && roleNombreCol >= 0) {
        validRoles.push(String(roleData[r][roleNombreCol] || '').toUpperCase());
      }
    }
    
    Logger.log('syncAllUsersWithRoles: Roles válidos: ' + validRoles.join(', '));
    
    // Obtener usuarios
    var userSheet = ss.getSheetByName('USUARIOS') || ss.getSheetByName('Usuarios');
    if (!userSheet) {
      return { success: false, error: 'Hoja USUARIOS no encontrada' };
    }
    
    var userData = userSheet.getDataRange().getValues();
    var userHeaders = userData[0].map(function(h) { return String(h).toUpperCase(); });
    var userRolCol = userHeaders.indexOf('ROL');
    if (userRolCol === -1) userRolCol = userHeaders.indexOf('ROLE');
    var userNombreCol = userHeaders.indexOf('NOMBRE');
    
    if (userRolCol === -1) {
      return { success: false, error: 'Columna ROL no encontrada en USUARIOS' };
    }
    
    var usersWithInvalidRoles = [];
    
    for (var u = 1; u < userData.length; u++) {
      var userRol = String(userData[u][userRolCol] || '').toUpperCase();
      var userName = userNombreCol >= 0 ? userData[u][userNombreCol] : 'Usuario fila ' + (u + 1);
      
      if (userRol && validRoles.indexOf(userRol) === -1) {
        usersWithInvalidRoles.push({
          row: u + 1,
          nombre: userName,
          rolActual: userData[u][userRolCol]
        });
      }
    }
    
    Logger.log('syncAllUsersWithRoles: ' + usersWithInvalidRoles.length + ' usuarios con roles inválidos');
    
    return {
      success: true,
      validRoles: validRoles,
      usersWithInvalidRoles: usersWithInvalidRoles,
      message: usersWithInvalidRoles.length > 0 
        ? 'Se encontraron ' + usersWithInvalidRoles.length + ' usuario(s) con roles que no existen'
        : 'Todos los usuarios tienen roles válidos'
    };
    
  } catch (error) {
    Logger.log('Error en syncAllUsersWithRoles: ' + error.message);
    return {
      success: false,
      error: 'Error al sincronizar: ' + error.message
    };
  }
}

/**
 * Obtiene todas las vistas permitidas para un usuario
 * @param {string} userId - ID del usuario
 * @returns {Object} Lista de vistas permitidas
 */
function getUserViews(userId) {
  try {
    if (!userId) {
      return {
        success: false,
        error: 'ID de usuario requerido'
      };
    }
    
    // Obtener usuario
    const users = findRows('Usuarios', { ID: userId });
    
    if (users.length === 0) {
      return {
        success: false,
        error: 'Usuario no encontrado'
      };
    }
    
    const user = users[0];
    const roleName = user.data.Rol;
    
    // Obtener permisos del rol
    const roleResult = getRolePermissions(roleName);
    
    if (!roleResult.success) {
      return roleResult;
    }
    
    return {
      success: true,
      userId: userId,
      rol: roleName,
      vistas: roleResult.role.vistas
    };
    
  } catch (error) {
    Logger.log('Error en getUserViews: ' + error.message);
    return {
      success: false,
      error: 'Error al obtener vistas del usuario: ' + error.message
    };
  }
}

/**
 * Verifica si un usuario tiene acceso a una vista específica
 * @param {string} userId - ID del usuario
 * @param {string} viewName - Nombre de la vista
 * @returns {boolean} true si tiene acceso, false si no
 */
function hasAccess(userId, viewName) {
  try {
    const userViews = getUserViews(userId);
    
    if (!userViews.success) {
      return false;
    }
    
    // Verificar wildcard primero
    if (userViews.vistas.includes('*')) {
      return true;
    }
    
    // Normalizar el nombre de la vista
    var viewNormalized = normalizeModuleId(viewName);
    
    // Normalizar todas las vistas del usuario y verificar
    var vistasNormalizadas = userViews.vistas.map(function(v) {
      return normalizeModuleId(v);
    });
    
    return vistasNormalizadas.includes(viewNormalized);
    
  } catch (error) {
    Logger.log('Error en hasAccess: ' + error.message);
    return false;
  }
}

/**
 * Verifica acceso por sesión
 * @param {string} sessionId - ID de la sesión
 * @param {string} viewName - Nombre de la vista
 * @returns {Object} Resultado de la verificación
 */
function checkAccessBySession(sessionId, viewName) {
  try {
    // Validar sesión
    if (!validateSession(sessionId)) {
      return {
        success: false,
        error: 'Sesión inválida o expirada',
        code: 401
      };
    }
    
    // Obtener usuario de la sesión
    const user = getUserBySession(sessionId);
    
    if (!user) {
      return {
        success: false,
        error: 'Usuario no encontrado',
        code: 401
      };
    }
    
    // Verificar acceso
    const hasPermission = hasAccess(user.id, viewName);
    
    if (!hasPermission) {
      return {
        success: false,
        error: 'No tiene permiso para acceder a esta vista',
        code: 403
      };
    }
    
    return {
      success: true,
      user: user,
      view: viewName
    };
    
  } catch (error) {
    Logger.log('Error en checkAccessBySession: ' + error.message);
    return {
      success: false,
      error: 'Error al verificar acceso: ' + error.message,
      code: 500
    };
  }
}

/**
 * Crea un nuevo rol
 * VERSIÓN CORREGIDA - Accede directamente a la hoja ROLES
 * @param {Object} roleData - Datos del rol {nombre, permisos, descripcion, color, colorBg, icono}
 * @returns {Object} Resultado de la operación
 */
function createRole(roleData, sessionId) {
  try {
    // NOTA: La autenticación se maneja a nivel de la aplicación web
    
    if (!roleData.nombre) {
      return {
        success: false,
        error: 'Nombre de rol requerido'
      };
    }
    
    Logger.log('createRole: Creando rol "' + roleData.nombre + '"');
    
    // IMPORTANTE: Asegurar que existan las columnas Icono y ColorBg ANTES de cualquier operación
    ensureRoleColumns();
    
    // Acceder directamente a la hoja ROLES
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName('ROLES') || ss.getSheetByName('Roles');
    
    if (!sheet) {
      return {
        success: false,
        error: 'Hoja ROLES no encontrada'
      };
    }
    
    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    var headersUpper = headers.map(function(h) { return String(h).toUpperCase(); });
    
    // Verificar que no exista un rol con el mismo nombre
    var nombreCol = headersUpper.indexOf('NOMBRE');
    var roleNameUpper = roleData.nombre.toUpperCase();
    
    for (var i = 1; i < data.length; i++) {
      var existingName = nombreCol >= 0 ? String(data[i][nombreCol] || '').toUpperCase() : '';
      if (existingName === roleNameUpper) {
        return {
          success: false,
          error: 'El rol ya existe'
        };
      }
    }
    
    // Generar ID único
    var roleId = 'ROL-' + new Date().getTime();
    
    // Convertir permisos a JSON
    var permisos = roleData.permisos || roleData.vistas || [];
    if (!Array.isArray(permisos)) {
      permisos = [];
    }
    var permisosJson = JSON.stringify(permisos);
    
    var fechaActual = new Date().toISOString();
    
    Logger.log('createRole: Headers de ROLES: ' + headersUpper.join(', '));
    
    // Construir array de datos basado en los headers existentes
    var newRoleData = [];
    for (var j = 0; j < headers.length; j++) {
      var header = headersUpper[j];
      switch(header) {
        case 'ID': newRoleData.push(roleId); break;
        case 'NOMBRE': newRoleData.push(roleData.nombre); break;
        case 'PERMISOS': newRoleData.push(permisosJson); break;
        case 'VISTAS': newRoleData.push(permisosJson); break;
        case 'ACTIVO': newRoleData.push('SI'); break;
        case 'COLOR': newRoleData.push(roleData.color || '#6366f1'); break;
        case 'DESCRIPCION': newRoleData.push(roleData.descripcion || ''); break;
        case 'FECHACREACION': newRoleData.push(fechaActual); break;
        case 'FECHAMODIFICACION': newRoleData.push(fechaActual); break;
        case 'ICONO': newRoleData.push(roleData.icono || 'user-cog'); break;
        case 'COLORBG': newRoleData.push(roleData.colorBg || '#e0e7ff'); break;
        default: newRoleData.push(''); break;
      }
    }
    
    Logger.log('createRole: Datos a insertar: ' + JSON.stringify(newRoleData));
    
    // Insertar directamente en la hoja
    sheet.appendRow(newRoleData);
    
    // Invalidar cache
    if (typeof CacheManager !== 'undefined') {
      CacheManager.invalidate('Roles');
      CacheManager.invalidate('ROLES');
    }
    
    Logger.log('createRole: Rol creado correctamente: ' + roleData.nombre);
    
    return {
      success: true,
      message: 'Rol creado correctamente',
      role: {
        id: roleId,
        nombre: roleData.nombre,
        permisos: permisos,
        descripcion: roleData.descripcion || '',
        color: roleData.color || '#6366f1',
        colorBg: roleData.colorBg || '#e0e7ff',
        icono: roleData.icono || 'user-cog'
      }
    };
    
  } catch (error) {
    Logger.log('Error en createRole: ' + error.message);
    return {
      success: false,
      error: 'Error al crear rol: ' + error.message
    };
  }
}

/**
 * Elimina un rol (soft delete - marca como inactivo)
 * VERSIÓN CORREGIDA - Accede directamente a la hoja ROLES
 * @param {string} roleId - ID del rol
 * @returns {Object} Resultado de la operación
 */
function deleteRole(roleId, sessionId) {
  try {
    // NOTA: La autenticación se maneja a nivel de la aplicación web
    
    if (!roleId) {
      return {
        success: false,
        error: 'ID de rol requerido'
      };
    }
    
    Logger.log('deleteRole: Eliminando rol "' + roleId + '"');
    
    // Acceder directamente a la hoja ROLES
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName('ROLES') || ss.getSheetByName('Roles');
    
    if (!sheet) {
      return {
        success: false,
        error: 'Hoja ROLES no encontrada'
      };
    }
    
    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    var headersUpper = headers.map(function(h) { return String(h).toUpperCase(); });
    
    // Encontrar índices de columnas
    var idCol = headersUpper.indexOf('ID');
    var nombreCol = headersUpper.indexOf('NOMBRE');
    var activoCol = headersUpper.indexOf('ACTIVO');
    var fechaModCol = headersUpper.indexOf('FECHAMODIFICACION');
    
    // Buscar el rol por ID o por nombre
    var roleIdUpper = String(roleId).toUpperCase();
    var rowIndex = -1;
    var roleName = '';
    
    for (var i = 1; i < data.length; i++) {
      var id = idCol >= 0 ? String(data[i][idCol] || '').toUpperCase() : '';
      var nombre = nombreCol >= 0 ? String(data[i][nombreCol] || '').toUpperCase() : '';
      
      if (id === roleIdUpper || nombre === roleIdUpper) {
        rowIndex = i + 1;
        roleName = nombreCol >= 0 ? data[i][nombreCol] : '';
        break;
      }
    }
    
    if (rowIndex === -1) {
      return {
        success: false,
        error: 'Rol no encontrado'
      };
    }
    
    // Roles del sistema no se pueden eliminar
    var systemRoles = ['ADMIN', 'ADMINISTRADOR', 'SUPERVISOR', 'OPERADOR'];
    if (systemRoles.indexOf(String(roleName).toUpperCase()) !== -1) {
      return {
        success: false,
        error: 'No se pueden eliminar roles del sistema'
      };
    }
    
    // Verificar que no haya usuarios con este rol (acceder directamente a USUARIOS)
    var userSheet = ss.getSheetByName('USUARIOS');
    if (userSheet) {
      var userData = userSheet.getDataRange().getValues();
      var userHeaders = userData[0].map(function(h) { return String(h).toUpperCase(); });
      var rolCol = userHeaders.indexOf('ROL');
      if (rolCol === -1) rolCol = userHeaders.indexOf('ROLE');
      
      var usersWithRole = 0;
      for (var j = 1; j < userData.length; j++) {
        var userRol = rolCol >= 0 ? String(userData[j][rolCol] || '').toUpperCase() : '';
        if (userRol === String(roleName).toUpperCase()) {
          usersWithRole++;
        }
      }
      
      if (usersWithRole > 0) {
        return {
          success: false,
          error: 'No se puede eliminar el rol porque hay ' + usersWithRole + ' usuario(s) asignado(s)',
          usersCount: usersWithRole
        };
      }
    }
    
    // Soft delete: marcar como inactivo
    if (activoCol >= 0) {
      sheet.getRange(rowIndex, activoCol + 1).setValue('NO');
    }
    if (fechaModCol >= 0) {
      sheet.getRange(rowIndex, fechaModCol + 1).setValue(new Date().toISOString());
    }
    
    // Invalidar cache
    if (typeof CacheManager !== 'undefined') {
      CacheManager.invalidate('Roles');
      CacheManager.invalidate('ROLES');
    }
    
    Logger.log('deleteRole: Rol eliminado (soft delete): ' + roleName);
    
    return {
      success: true,
      message: 'Rol eliminado correctamente'
    };
    
  } catch (error) {
    Logger.log('Error en deleteRole: ' + error.message);
    return {
      success: false,
      error: 'Error al eliminar rol: ' + error.message
    };
  }
}


/**
 * Alias para getAllRoles - compatibilidad con frontend
 * @returns {Object} Lista de roles
 */
function getRoles(sessionId) {
  return getAllRoles(sessionId);
}

/**
 * Alias para loadRoles - compatibilidad con frontend
 * @returns {Object} Lista de roles
 */
function loadRoles() {
  return getAllRoles.apply(this, arguments);
}

/**
 * Obtiene los permisos de un usuario por su sesión
 * @param {string} sessionId - ID de la sesión
 * @returns {Object} Permisos del usuario
 */
function getUserPermissions(sessionId) {
  try {
    if (!sessionId) {
      return {
        success: false,
        error: 'Session ID requerido'
      };
    }
    
    // Obtener usuario de la sesión
    var user = getUserBySession(sessionId);
    
    if (!user) {
      return {
        success: false,
        error: 'Sesión inválida o expirada'
      };
    }
    
    var roleName = user.rol;
    
    if (!roleName) {
      return {
        success: true,
        permisos: [],
        rol: null,
        moduleCategories: MODULE_CATEGORIES
      };
    }
    
    // Obtener permisos del rol
    var roleResult = getRolePermissions(roleName);
    
    if (!roleResult.success) {
      return {
        success: true,
        permisos: [],
        rol: roleName,
        error: roleResult.error,
        moduleCategories: MODULE_CATEGORIES
      };
    }
    
    return {
      success: true,
      permisos: roleResult.role.permisos,
      rol: roleName,
      roleColor: roleResult.role.color,
      moduleCategories: MODULE_CATEGORIES
    };
    
  } catch (error) {
    Logger.log('Error en getUserPermissions: ' + error.message);
    return {
      success: false,
      error: 'Error al obtener permisos: ' + error.message
    };
  }
}

/**
 * Obtiene la estructura de categorías y módulos
 * @returns {Object} Estructura de módulos
 */
function getModuleCategories() {
  return {
    success: true,
    categories: MODULE_CATEGORIES,
    allModules: ALL_MODULES
  };
}

/**
 * Verifica si un usuario tiene permiso para un módulo específico
 * @param {string} sessionId - ID de la sesión
 * @param {string} moduleId - ID del módulo
 * @returns {Object} Resultado de la verificación
 */
function checkModuleAccess(sessionId, moduleId) {
  try {
    var permResult = getUserPermissions(sessionId);
    
    if (!permResult.success) {
      return {
        success: false,
        hasAccess: false,
        error: permResult.error
      };
    }
    
    var permisos = permResult.permisos || [];
    var moduleIdNormalized = normalizeModuleId(moduleId);
    
    // Verificar wildcard
    if (permisos.includes('*')) {
      return {
        success: true,
        hasAccess: true,
        moduleId: moduleId,
        rol: permResult.rol
      };
    }
    
    // Normalizar permisos y verificar
    var permisosNormalizados = permisos.map(function(p) {
      return normalizeModuleId(p);
    });
    
    var hasAccess = permisosNormalizados.includes(moduleIdNormalized);
    
    return {
      success: true,
      hasAccess: hasAccess,
      moduleId: moduleId,
      rol: permResult.rol
    };
    
  } catch (error) {
    Logger.log('Error en checkModuleAccess: ' + error.message);
    return {
      success: false,
      hasAccess: false,
      error: error.message
    };
  }
}

/**

 * Inicializa la hoja de Roles con la estructura y datos por defecto
 * Ejecutar una vez para configurar el sistema
 */
function initRolesSheet() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Roles');
    
    // Si la hoja no existe, crearla
    if (!sheet) {
      sheet = ss.insertSheet('Roles');
      Logger.log('Hoja Roles creada');
    }
    
    // Verificar si ya tiene datos
    var lastRow = sheet.getLastRow();
    
    if (lastRow <= 1) {
      // Configurar encabezados (incluyendo Icono y ColorBg)
      var headers = ['ID', 'Nombre', 'Permisos', 'Activo', 'Color', 'Descripcion', 'FechaCreacion', 'FechaModificacion', 'Icono', 'ColorBg'];
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      
      // Formatear encabezados
      var headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground('#1e293b');
      headerRange.setFontColor('#ffffff');
      headerRange.setFontWeight('bold');
      
      // Crear roles por defecto con iconos y colores
      var fechaActual = new Date().toISOString();
      var defaultRoles = [
        ['ROL001', 'ADMIN', '["*"]', 'SI', '#dc2626', 'Administrador con acceso total al sistema', fechaActual, fechaActual, 'crown', '#fee2e2'],
        ['ROL002', 'SUPERVISOR', '["dashboard","ingreso","notasventa","picking","packing","shipping","delivery","inventory","layout","lotesseries","estadonv","reports"]', 'SI', '#d97706', 'Supervisor con acceso a operaciones y reportes', fechaActual, fechaActual, 'user-tie', '#fef3c7'],
        ['ROL003', 'OPERADOR', '["ingreso","notasventa","picking","packing","shipping","delivery","inventory","lotesseries","estadonv"]', 'SI', '#16a34a', 'Operador con acceso a módulos operativos', fechaActual, fechaActual, 'user', '#dcfce7'],
        ['ROL004', 'CONSULTA', '["inventory","lotesseries","estadonv","reports"]', 'SI', '#0ea5e9', 'Usuario de consulta con acceso de solo lectura', fechaActual, fechaActual, 'user-check', '#e0f2fe'],
        ['ROL005', 'BODEGUERO', '["ingreso","inventory","layout","transferencias","lotesseries"]', 'SI', '#f59e0b', 'Bodeguero con acceso a inventario y recepción', fechaActual, fechaActual, 'hard-hat', '#fef3c7']
      ];
      
      // Insertar roles por defecto
      sheet.getRange(2, 1, defaultRoles.length, headers.length).setValues(defaultRoles);
      
      // Ajustar anchos de columna
      sheet.setColumnWidth(1, 100);  // ID
      sheet.setColumnWidth(2, 120);  // Nombre
      sheet.setColumnWidth(3, 400);  // Permisos
      sheet.setColumnWidth(4, 60);   // Activo
      sheet.setColumnWidth(5, 80);   // Color
      sheet.setColumnWidth(6, 250);  // Descripcion
      sheet.setColumnWidth(7, 180);  // FechaCreacion
      sheet.setColumnWidth(8, 180);  // FechaModificacion
      sheet.setColumnWidth(9, 100);  // Icono
      sheet.setColumnWidth(10, 100); // ColorBg
      
      Logger.log('Roles por defecto creados: ' + defaultRoles.length);
      
      return {
        success: true,
        message: 'Hoja Roles inicializada con ' + defaultRoles.length + ' roles por defecto',
        roles: defaultRoles.map(function(r) { return r[1]; })
      };
    } else {
      // Verificar si faltan las columnas Icono y ColorBg
      var existingHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      var hasIcono = existingHeaders.includes('Icono');
      var hasColorBg = existingHeaders.includes('ColorBg');
      
      if (!hasIcono || !hasColorBg) {
        var nextCol = sheet.getLastColumn() + 1;
        if (!hasIcono) {
          sheet.getRange(1, nextCol).setValue('Icono');
          sheet.getRange(1, nextCol).setBackground('#1e293b').setFontColor('#ffffff').setFontWeight('bold');
          nextCol++;
        }
        if (!hasColorBg) {
          sheet.getRange(1, nextCol).setValue('ColorBg');
          sheet.getRange(1, nextCol).setBackground('#1e293b').setFontColor('#ffffff').setFontWeight('bold');
        }
        Logger.log('Columnas Icono/ColorBg agregadas a hoja Roles');
      }
      
      return {
        success: true,
        message: 'La hoja Roles ya existe con ' + (lastRow - 1) + ' roles',
        rolesCount: lastRow - 1
      };
    }
    
  } catch (error) {
    Logger.log('Error en initRolesSheet: ' + error.message);
    return {
      success: false,
      error: 'Error al inicializar hoja Roles: ' + error.message
    };
  }
}

/**
 * Verifica y repara la estructura de la hoja Roles
 */
function verifyRolesSheet() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Roles');
    
    if (!sheet) {
      return initRolesSheet();
    }
    
    // Verificar encabezados
    var expectedHeaders = ['ID', 'Nombre', 'Permisos', 'Activo', 'Color', 'Descripcion', 'FechaCreacion', 'FechaModificacion'];
    var currentHeaders = sheet.getRange(1, 1, 1, expectedHeaders.length).getValues()[0];
    
    var issues = [];
    
    for (var i = 0; i < expectedHeaders.length; i++) {
      if (currentHeaders[i] !== expectedHeaders[i]) {
        issues.push('Columna ' + (i + 1) + ': esperado "' + expectedHeaders[i] + '", encontrado "' + currentHeaders[i] + '"');
      }
    }
    
    if (issues.length > 0) {
      return {
        success: false,
        message: 'La hoja Roles tiene problemas de estructura',
        issues: issues
      };
    }
    
    var rolesCount = sheet.getLastRow() - 1;
    
    return {
      success: true,
      message: 'Hoja Roles verificada correctamente',
      rolesCount: rolesCount
    };
    
  } catch (error) {
    Logger.log('Error en verifyRolesSheet: ' + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}


/**
 * FUNCIÓN DE MIGRACIÓN: Agrega columnas Icono y ColorBg a la hoja ROLES existente
 * Ejecutar UNA VEZ desde el editor de GAS para actualizar la estructura
 */
function migrateRolesAddIconColumns() {
  try {
    Logger.log('=== MIGRACIÓN: Agregar columnas Icono y ColorBg ===');
    
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName('ROLES') || ss.getSheetByName('Roles');
    
    if (!sheet) {
      Logger.log('ERROR: Hoja ROLES no encontrada');
      return { success: false, error: 'Hoja ROLES no encontrada' };
    }
    
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    Logger.log('Headers actuales: ' + headers.join(', '));
    
    var hasIcono = headers.some(h => String(h).toUpperCase() === 'ICONO');
    var hasColorBg = headers.some(h => String(h).toUpperCase() === 'COLORBG');
    
    var nextCol = sheet.getLastColumn() + 1;
    var added = [];
    
    if (!hasIcono) {
      sheet.getRange(1, nextCol).setValue('Icono');
      sheet.getRange(1, nextCol).setBackground('#1e293b').setFontColor('#ffffff').setFontWeight('bold');
      sheet.setColumnWidth(nextCol, 100);
      added.push('Icono');
      nextCol++;
    }
    
    if (!hasColorBg) {
      sheet.getRange(1, nextCol).setValue('ColorBg');
      sheet.getRange(1, nextCol).setBackground('#1e293b').setFontColor('#ffffff').setFontWeight('bold');
      sheet.setColumnWidth(nextCol, 100);
      added.push('ColorBg');
    }
    
    if (added.length > 0) {
      Logger.log('✅ Columnas agregadas: ' + added.join(', '));
      
      // Asignar valores por defecto a roles existentes
      var lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        var defaultIcons = {
          'ADMIN': { icon: 'crown', bg: '#fee2e2' },
          'SUPERVISOR': { icon: 'user-tie', bg: '#fef3c7' },
          'OPERADOR': { icon: 'user', bg: '#dcfce7' },
          'GERENCIA': { icon: 'building', bg: '#e0e7ff' },
          'VENDEDOR': { icon: 'briefcase', bg: '#fef3c7' },
          'CORDINADOR': { icon: 'clipboard-list', bg: '#dbeafe' },
          'COORDINADOR': { icon: 'clipboard-list', bg: '#dbeafe' }
        };
        
        var data = sheet.getDataRange().getValues();
        var nombreCol = headers.findIndex(h => String(h).toUpperCase() === 'NOMBRE');
        
        for (var i = 1; i < data.length; i++) {
          var roleName = String(data[i][nombreCol] || '').toUpperCase();
          var defaults = defaultIcons[roleName] || { icon: 'user-cog', bg: '#e0e7ff' };
          
          // Encontrar columnas Icono y ColorBg
          var newHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
          var iconoCol = newHeaders.findIndex(h => String(h).toUpperCase() === 'ICONO') + 1;
          var colorBgCol = newHeaders.findIndex(h => String(h).toUpperCase() === 'COLORBG') + 1;
          
          if (iconoCol > 0 && !data[i][iconoCol - 1]) {
            sheet.getRange(i + 1, iconoCol).setValue(defaults.icon);
          }
          if (colorBgCol > 0 && !data[i][colorBgCol - 1]) {
            sheet.getRange(i + 1, colorBgCol).setValue(defaults.bg);
          }
        }
        
        Logger.log('✅ Valores por defecto asignados a ' + (lastRow - 1) + ' roles');
      }
      
      return { 
        success: true, 
        message: 'Migración completada. Columnas agregadas: ' + added.join(', '),
        columnsAdded: added
      };
    } else {
      Logger.log('Las columnas Icono y ColorBg ya existen');
      return { 
        success: true, 
        message: 'Las columnas ya existen, no se requiere migración',
        columnsAdded: []
      };
    }
    
  } catch (error) {
    Logger.log('ERROR en migración: ' + error.message);
    return { success: false, error: error.message };
  }
}


/**
 * FUNCIÓN DE PRUEBA: Verifica que el sistema de roles funcione correctamente
 * Ejecutar desde el editor de GAS para diagnosticar problemas
 */
function testRolesSystem() {
  Logger.log('=== PRUEBA DEL SISTEMA DE ROLES ===');
  
  // 1. Verificar columnas
  Logger.log('\n1. Verificando columnas Icono/ColorBg...');
  var columnsOk = ensureRoleColumns();
  Logger.log('   Resultado: ' + (columnsOk ? 'OK' : 'ERROR'));
  
  // 2. Obtener headers actuales
  Logger.log('\n2. Verificando estructura de la hoja ROLES...');
  try {
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName('ROLES') || ss.getSheetByName('Roles');
    if (sheet) {
      var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      Logger.log('   Headers encontrados: ' + headers.join(', '));
      Logger.log('   Total columnas: ' + headers.length);
      
      var hasIcono = headers.some(function(h) { return String(h).toUpperCase() === 'ICONO'; });
      var hasColorBg = headers.some(function(h) { return String(h).toUpperCase() === 'COLORBG'; });
      Logger.log('   Columna Icono: ' + (hasIcono ? 'SÍ' : 'NO'));
      Logger.log('   Columna ColorBg: ' + (hasColorBg ? 'SÍ' : 'NO'));
    } else {
      Logger.log('   ERROR: Hoja ROLES no encontrada');
    }
  } catch (e) {
    Logger.log('   ERROR: ' + e.message);
  }
  
  // 3. Probar getAllRoles
  Logger.log('\n3. Probando getAllRoles()...');
  var rolesResult = getAllRoles();
  if (rolesResult.success) {
    Logger.log('   Roles encontrados: ' + rolesResult.roles.length);
    rolesResult.roles.forEach(function(role) {
      Logger.log('   - ' + role.nombre + ' | Icono: ' + (role.icono || 'N/A') + ' | Color: ' + (role.color || 'N/A') + ' | ColorBg: ' + (role.colorBg || 'N/A'));
    });
  } else {
    Logger.log('   ERROR: ' + rolesResult.error);
  }
  
  Logger.log('\n=== FIN DE PRUEBA ===');
  return {
    columnsOk: columnsOk,
    rolesResult: rolesResult
  };
}

/**
 * FUNCIÓN DE REPARACIÓN: Asigna iconos y colores por defecto a roles existentes
 * Ejecutar UNA VEZ si los roles existentes no tienen icono/color
 */
function repairExistingRoles() {
  Logger.log('=== REPARACIÓN DE ROLES EXISTENTES ===');
  
  // Primero asegurar columnas
  ensureRoleColumns();
  
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName('ROLES') || ss.getSheetByName('Roles');
  
  if (!sheet) {
    Logger.log('ERROR: Hoja ROLES no encontrada');
    return { success: false, error: 'Hoja no encontrada' };
  }
  
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var headersUpper = headers.map(function(h) { return String(h).toUpperCase(); });
  
  var nombreCol = headersUpper.indexOf('NOMBRE');
  var iconoCol = headersUpper.indexOf('ICONO');
  var colorBgCol = headersUpper.indexOf('COLORBG');
  var colorCol = headersUpper.indexOf('COLOR');
  
  if (iconoCol === -1 || colorBgCol === -1) {
    Logger.log('ERROR: Columnas Icono o ColorBg no encontradas');
    return { success: false, error: 'Columnas no encontradas' };
  }
  
  var defaultStyles = {
    'ADMIN': { icon: 'crown', color: '#dc2626', bg: '#fee2e2' },
    'ADMINISTRADOR': { icon: 'crown', color: '#dc2626', bg: '#fee2e2' },
    'SUPERVISOR': { icon: 'user-tie', color: '#d97706', bg: '#fef3c7' },
    'OPERADOR': { icon: 'user', color: '#16a34a', bg: '#dcfce7' },
    'GERENCIA': { icon: 'building', color: '#4f46e5', bg: '#e0e7ff' },
    'VENDEDOR': { icon: 'briefcase', color: '#f59e0b', bg: '#fef3c7' },
    'COORDINADOR': { icon: 'clipboard-list', color: '#3b82f6', bg: '#dbeafe' },
    'CORDINADOR': { icon: 'clipboard-list', color: '#3b82f6', bg: '#dbeafe' },
    'BODEGUERO': { icon: 'hard-hat', color: '#f59e0b', bg: '#fef3c7' },
    'CONSULTA': { icon: 'user-check', color: '#0ea5e9', bg: '#e0f2fe' }
  };
  
  var data = sheet.getDataRange().getValues();
  var repaired = 0;
  
  for (var i = 1; i < data.length; i++) {
    var roleName = String(data[i][nombreCol] || '').toUpperCase();
    var currentIcono = data[i][iconoCol];
    var currentColorBg = data[i][colorBgCol];
    
    // Solo reparar si está vacío
    if (!currentIcono || !currentColorBg) {
      var defaults = defaultStyles[roleName] || { icon: 'user-cog', color: '#6366f1', bg: '#e0e7ff' };
      
      if (!currentIcono) {
        sheet.getRange(i + 1, iconoCol + 1).setValue(defaults.icon);
      }
      if (!currentColorBg) {
        sheet.getRange(i + 1, colorBgCol + 1).setValue(defaults.bg);
      }
      if (colorCol !== -1 && !data[i][colorCol]) {
        sheet.getRange(i + 1, colorCol + 1).setValue(defaults.color);
      }
      
      Logger.log('Reparado: ' + roleName + ' -> Icono: ' + defaults.icon + ', ColorBg: ' + defaults.bg);
      repaired++;
    }
  }
  
  Logger.log('Total roles reparados: ' + repaired);
  CacheManager.invalidate('Roles');
  
  return { success: true, repaired: repaired };
}


/**
 * FUNCIÓN DE DIAGNÓSTICO: Verifica los permisos de un rol específico
 * Ejecutar desde el editor de GAS para diagnosticar problemas de permisos
 * @param {string} roleName - Nombre del rol a verificar (ej: 'SUPERVISOR')
 */
function diagnosticarPermisos(roleName) {
  Logger.log('=== DIAGNÓSTICO DE PERMISOS PARA ROL: ' + roleName + ' ===');
  
  // 1. Buscar el rol en la hoja
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName('ROLES') || ss.getSheetByName('Roles');
  
  if (!sheet) {
    Logger.log('ERROR: Hoja ROLES no encontrada');
    return { success: false, error: 'Hoja no encontrada' };
  }
  
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  Logger.log('Headers: ' + headers.join(', '));
  
  // Encontrar índices de columnas
  var nombreCol = -1, permisosCol = -1;
  for (var i = 0; i < headers.length; i++) {
    var h = String(headers[i]).toUpperCase();
    if (h === 'NOMBRE') nombreCol = i;
    if (h === 'PERMISOS' || h === 'VISTAS') permisosCol = i;
  }
  
  Logger.log('Columna Nombre: ' + nombreCol);
  Logger.log('Columna Permisos: ' + permisosCol);
  
  // Buscar el rol
  var rolFound = false;
  for (var j = 1; j < data.length; j++) {
    var nombre = String(data[j][nombreCol] || '').toUpperCase();
    if (nombre === roleName.toUpperCase()) {
      rolFound = true;
      var permisosRaw = data[j][permisosCol];
      Logger.log('');
      Logger.log('ROL ENCONTRADO en fila ' + (j + 1));
      Logger.log('Nombre: ' + data[j][nombreCol]);
      Logger.log('Permisos RAW: ' + permisosRaw);
      Logger.log('Tipo de permisos: ' + typeof permisosRaw);
      
      // Intentar parsear
      var permisos = [];
      if (permisosRaw) {
        try {
          if (String(permisosRaw).startsWith('[')) {
            permisos = JSON.parse(permisosRaw);
            Logger.log('Permisos parseados como JSON: ' + JSON.stringify(permisos));
          } else {
            permisos = String(permisosRaw).split(',').map(function(v) { return v.trim(); });
            Logger.log('Permisos parseados como CSV: ' + JSON.stringify(permisos));
          }
        } catch (e) {
          Logger.log('ERROR al parsear permisos: ' + e.message);
        }
      }
      
      Logger.log('');
      Logger.log('PERMISOS FINALES (' + permisos.length + '):');
      permisos.forEach(function(p, idx) {
        Logger.log('  ' + (idx + 1) + '. ' + p);
      });
      
      // Verificar módulos específicos
      Logger.log('');
      Logger.log('VERIFICACIÓN DE MÓDULOS:');
      var modulosAVerificar = ['dashboard', 'ingreso', 'notasventa', 'picking', 'packing', 'shipping', 'delivery', 'lotesseries', 'estadonv', 'inventory', 'layout', 'transferencias', 'users', 'roles', 'reports'];
      modulosAVerificar.forEach(function(mod) {
        var tiene = permisos.includes(mod) || permisos.includes('*');
        Logger.log('  ' + mod + ': ' + (tiene ? 'SÍ' : 'NO'));
      });
      
      return {
        success: true,
        rol: nombre,
        permisosRaw: permisosRaw,
        permisos: permisos
      };
    }
  }
  
  if (!rolFound) {
    Logger.log('ERROR: Rol "' + roleName + '" no encontrado');
    return { success: false, error: 'Rol no encontrado' };
  }
}

/**
 * Ejecutar para diagnosticar el rol SUPERVISOR
 */
function diagnosticarSupervisor() {
  return diagnosticarPermisos('SUPERVISOR');
}

/**
 * Ejecutar para diagnosticar el rol ADMIN
 */
function diagnosticarAdmin() {
  return diagnosticarPermisos('ADMIN');
}


/**
 * DIAGNÓSTICO COMPLETO DEL SISTEMA DE PERMISOS
 * Ejecutar desde el editor de GAS para verificar todo el flujo
 */
function diagnosticoCompletoPermisos() {
  Logger.log('========================================');
  Logger.log('DIAGNÓSTICO COMPLETO DEL SISTEMA DE PERMISOS');
  Logger.log('========================================');
  
  var ss = getSpreadsheet();
  
  // 1. Verificar hoja ROLES
  Logger.log('\n1. VERIFICANDO HOJA ROLES...');
  var rolesSheet = ss.getSheetByName('ROLES') || ss.getSheetByName('Roles');
  if (!rolesSheet) {
    Logger.log('   ❌ ERROR: Hoja ROLES no encontrada');
    return { success: false, error: 'Hoja ROLES no encontrada' };
  }
  Logger.log('   ✅ Hoja ROLES encontrada: ' + rolesSheet.getName());
  
  var rolesData = rolesSheet.getDataRange().getValues();
  Logger.log('   Total filas: ' + rolesData.length);
  Logger.log('   Headers: ' + rolesData[0].join(', '));
  
  // Listar roles
  Logger.log('\n   ROLES EXISTENTES:');
  var headersUpper = rolesData[0].map(function(h) { return String(h).toUpperCase(); });
  var nombreCol = headersUpper.indexOf('NOMBRE');
  var permisosCol = headersUpper.indexOf('PERMISOS');
  if (permisosCol === -1) permisosCol = headersUpper.indexOf('VISTAS');
  
  for (var i = 1; i < rolesData.length; i++) {
    var nombre = rolesData[i][nombreCol];
    var permisos = rolesData[i][permisosCol];
    Logger.log('   - ' + nombre + ': ' + (permisos ? permisos.substring(0, 50) + '...' : 'SIN PERMISOS'));
  }
  
  // 2. Verificar hoja SESIONES
  Logger.log('\n2. VERIFICANDO HOJA SESIONES...');
  var sessionSheet = ss.getSheetByName('SESIONES');
  if (!sessionSheet) {
    Logger.log('   ⚠️ ADVERTENCIA: Hoja SESIONES no encontrada');
  } else {
    Logger.log('   ✅ Hoja SESIONES encontrada');
    var sessionData = sessionSheet.getDataRange().getValues();
    Logger.log('   Total sesiones: ' + (sessionData.length - 1));
    Logger.log('   Headers: ' + sessionData[0].join(', '));
  }
  
  // 3. Verificar hoja USUARIOS
  Logger.log('\n3. VERIFICANDO HOJA USUARIOS...');
  var userSheet = ss.getSheetByName('USUARIOS');
  if (!userSheet) {
    Logger.log('   ❌ ERROR: Hoja USUARIOS no encontrada');
    return { success: false, error: 'Hoja USUARIOS no encontrada' };
  }
  Logger.log('   ✅ Hoja USUARIOS encontrada');
  var userData = userSheet.getDataRange().getValues();
  Logger.log('   Total usuarios: ' + (userData.length - 1));
  
  // Listar usuarios y sus roles
  Logger.log('\n   USUARIOS Y ROLES:');
  var userHeaders = userData[0].map(function(h) { return String(h).toUpperCase(); });
  var emailCol = userHeaders.indexOf('EMAIL');
  if (emailCol === -1) emailCol = userHeaders.indexOf('CORREO');
  var rolCol = userHeaders.indexOf('ROL');
  if (rolCol === -1) rolCol = userHeaders.indexOf('ROLE');
  
  for (var j = 1; j < userData.length; j++) {
    var email = userData[j][emailCol];
    var rol = userData[j][rolCol];
    Logger.log('   - ' + email + ' -> ' + rol);
  }
  
  // 4. Probar getRolePermissions para ADMIN
  Logger.log('\n4. PROBANDO getRolePermissions("ADMIN")...');
  var adminResult = getRolePermissions('ADMIN');
  Logger.log('   Resultado: ' + JSON.stringify(adminResult));
  
  // 5. Probar getRolePermissions para SUPERVISOR
  Logger.log('\n5. PROBANDO getRolePermissions("SUPERVISOR")...');
  var supervisorResult = getRolePermissions('SUPERVISOR');
  Logger.log('   Resultado: ' + JSON.stringify(supervisorResult));
  
  Logger.log('\n========================================');
  Logger.log('FIN DEL DIAGNÓSTICO');
  Logger.log('========================================');
  
  return {
    success: true,
    rolesCount: rolesData.length - 1,
    usersCount: userData.length - 1,
    adminPermisos: adminResult.success ? adminResult.role.permisos : [],
    supervisorPermisos: supervisorResult.success ? supervisorResult.role.permisos : []
  };
}

/**
 * FUNCIÓN PARA ASEGURAR QUE ADMIN TENGA PERMISO WILDCARD
 * Ejecutar si el admin no puede ver módulos
 */
function asegurarAdminWildcard() {
  Logger.log('=== ASEGURANDO PERMISO WILDCARD PARA ADMIN ===');
  
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName('ROLES') || ss.getSheetByName('Roles');
  
  if (!sheet) {
    Logger.log('ERROR: Hoja ROLES no encontrada');
    return { success: false, error: 'Hoja no encontrada' };
  }
  
  var data = sheet.getDataRange().getValues();
  var headers = data[0].map(function(h) { return String(h).toUpperCase(); });
  var nombreCol = headers.indexOf('NOMBRE');
  var permisosCol = headers.indexOf('PERMISOS');
  if (permisosCol === -1) permisosCol = headers.indexOf('VISTAS');
  
  for (var i = 1; i < data.length; i++) {
    var nombre = String(data[i][nombreCol] || '').toUpperCase();
    if (nombre === 'ADMIN' || nombre === 'ADMINISTRADOR') {
      var permisosActuales = data[i][permisosCol];
      Logger.log('Rol ADMIN encontrado en fila ' + (i + 1));
      Logger.log('Permisos actuales: ' + permisosActuales);
      
      // Verificar si ya tiene wildcard
      if (permisosActuales && String(permisosActuales).includes('*')) {
        Logger.log('✅ ADMIN ya tiene permiso wildcard');
        return { success: true, message: 'ADMIN ya tiene wildcard' };
      }
      
      // Actualizar a wildcard
      sheet.getRange(i + 1, permisosCol + 1).setValue('["*"]');
      Logger.log('✅ Permiso wildcard asignado a ADMIN');
      
      return { success: true, message: 'Wildcard asignado a ADMIN' };
    }
  }
  
  Logger.log('ERROR: Rol ADMIN no encontrado');
  return { success: false, error: 'Rol ADMIN no encontrado' };
}


/**
 * FUNCIÓN DE CORRECCIÓN: Asegura que el usuario tenga permisos TMS
 * @param {string} userEmail - Email del usuario (opcional, si no se proporciona usa el usuario actual)
 * @returns {Object} Resultado de la operación
 */
function ensureTMSPermissions(userEmail) {
  try {
    Logger.log('=== ASEGURAR PERMISOS TMS ===');
    
    // Si no se proporciona email, intentar obtener el usuario actual
    if (!userEmail && typeof App !== 'undefined' && App.user && App.user.email) {
      userEmail = App.user.email;
    }
    
    if (!userEmail) {
      Logger.log('No se pudo determinar el usuario para asignar permisos TMS');
      return { success: false, error: 'Usuario no especificado' };
    }
    
    Logger.log('Asegurando permisos TMS para: ' + userEmail);
    
    var ss = getSpreadsheet();
    var userSheet = ss.getSheetByName('USUARIOS') || ss.getSheetByName('Usuarios');
    
    if (!userSheet) {
      Logger.log('Hoja de usuarios no encontrada');
      return { success: false, error: 'Hoja de usuarios no encontrada' };
    }
    
    var data = userSheet.getDataRange().getValues();
    var headers = data[0].map(function(h) { return String(h).toUpperCase(); });
    
    var emailCol = headers.indexOf('EMAIL');
    var rolCol = headers.indexOf('ROL');
    var permisosCol = headers.indexOf('PERMISOS');
    
    if (emailCol === -1) {
      Logger.log('Columna EMAIL no encontrada');
      return { success: false, error: 'Estructura de usuarios incorrecta' };
    }
    
    // Buscar el usuario
    for (var i = 1; i < data.length; i++) {
      var email = String(data[i][emailCol] || '').toLowerCase().trim();
      
      if (email === userEmail.toLowerCase().trim()) {
        Logger.log('Usuario encontrado en fila ' + (i + 1));
        
        var rolActual = String(data[i][rolCol] || '').toUpperCase();
        Logger.log('Rol actual: ' + rolActual);
        
        // Si es ADMIN, asegurar que tenga wildcard
        if (rolActual === 'ADMIN' || rolActual === 'ADMINISTRADOR') {
          Logger.log('Usuario es ADMIN, asegurando wildcard...');
          
          if (permisosCol >= 0) {
            var permisosActuales = data[i][permisosCol];
            if (!permisosActuales || !String(permisosActuales).includes('*')) {
              userSheet.getRange(i + 1, permisosCol + 1).setValue('["*"]');
              Logger.log('✅ Wildcard asignado al usuario ADMIN');
            } else {
              Logger.log('✅ Usuario ADMIN ya tiene wildcard');
            }
          }
          
          return { success: true, message: 'Usuario ADMIN tiene acceso completo' };
        }
        
        // Para otros roles, agregar permisos TMS específicos
        if (permisosCol >= 0) {
          var permisosActuales = data[i][permisosCol];
          var permisos = [];
          
          try {
            if (permisosActuales) {
              permisos = JSON.parse(permisosActuales);
            }
          } catch (e) {
            Logger.log('Error parseando permisos actuales, creando nuevos');
            permisos = [];
          }
          
          if (!Array.isArray(permisos)) {
            permisos = [];
          }
          
          // Agregar permisos TMS si no los tiene
          var tmsPermisos = ['tms', 'dashboard'];
          var permisosAgregados = [];
          
          tmsPermisos.forEach(function(permiso) {
            if (permisos.indexOf(permiso) === -1) {
              permisos.push(permiso);
              permisosAgregados.push(permiso);
            }
          });
          
          if (permisosAgregados.length > 0) {
            userSheet.getRange(i + 1, permisosCol + 1).setValue(JSON.stringify(permisos));
            Logger.log('✅ Permisos TMS agregados: ' + permisosAgregados.join(', '));
            return { 
              success: true, 
              message: 'Permisos TMS agregados: ' + permisosAgregados.join(', '),
              permisosAgregados: permisosAgregados
            };
          } else {
            Logger.log('✅ Usuario ya tiene permisos TMS');
            return { success: true, message: 'Usuario ya tiene permisos TMS' };
          }
        } else {
          Logger.log('Columna PERMISOS no encontrada, no se pueden asignar permisos específicos');
          return { success: false, error: 'Columna PERMISOS no encontrada' };
        }
      }
    }
    
    Logger.log('Usuario no encontrado: ' + userEmail);
    return { success: false, error: 'Usuario no encontrado' };
    
  } catch (error) {
    Logger.log('Error asegurando permisos TMS: ' + error.message);
    return { success: false, error: error.message };
  }
}

/**
 * FUNCIÓN DE CORRECCIÓN: Actualiza el rol de un usuario específico
 * Útil cuando un usuario tiene un rol que ya no existe
 * @param {string} userEmail - Email del usuario a corregir
 * @param {string} newRoleName - Nuevo nombre del rol
 * @returns {Object} Resultado de la operación
 */
function corregirRolUsuario(userEmail, newRoleName) {
  try {
    if (!userEmail || !newRoleName) {
      return { success: false, error: 'Email y nuevo rol son requeridos' };
    }
    
    var ss = getSpreadsheet();
    
    // Verificar que el nuevo rol existe
    var roleSheet = ss.getSheetByName('ROLES') || ss.getSheetByName('Roles');
    if (!roleSheet) {
      return { success: false, error: 'Hoja ROLES no encontrada' };
    }
    
    var roleData = roleSheet.getDataRange().getValues();
    var roleHeaders = roleData[0].map(function(h) { return String(h).toUpperCase(); });
    var roleNombreCol = roleHeaders.indexOf('NOMBRE');
    var roleActivoCol = roleHeaders.indexOf('ACTIVO');
    
    var roleExists = false;
    for (var r = 1; r < roleData.length; r++) {
      var roleName = roleNombreCol >= 0 ? String(roleData[r][roleNombreCol] || '').toUpperCase() : '';
      var activo = roleActivoCol >= 0 ? String(roleData[r][roleActivoCol] || '').toUpperCase() !== 'NO' : true;
      if (roleName === newRoleName.toUpperCase() && activo) {
        roleExists = true;
        break;
      }
    }
    
    if (!roleExists) {
      return { success: false, error: 'El rol "' + newRoleName + '" no existe o está inactivo' };
    }
    
    // Buscar y actualizar el usuario
    var userSheet = ss.getSheetByName('USUARIOS') || ss.getSheetByName('Usuarios');
    if (!userSheet) {
      return { success: false, error: 'Hoja USUARIOS no encontrada' };
    }
    
    var userData = userSheet.getDataRange().getValues();
    var userHeaders = userData[0].map(function(h) { return String(h).toUpperCase(); });
    var emailCol = userHeaders.indexOf('EMAIL');
    if (emailCol === -1) emailCol = userHeaders.indexOf('CORREO');
    var rolCol = userHeaders.indexOf('ROL');
    if (rolCol === -1) rolCol = userHeaders.indexOf('ROLE');
    var nombreCol = userHeaders.indexOf('NOMBRE');
    
    if (emailCol === -1 || rolCol === -1) {
      return { success: false, error: 'Columnas EMAIL o ROL no encontradas' };
    }
    
    var userEmailUpper = userEmail.toUpperCase();
    for (var u = 1; u < userData.length; u++) {
      var email = String(userData[u][emailCol] || '').toUpperCase();
      if (email === userEmailUpper) {
        var oldRol = userData[u][rolCol];
        var userName = nombreCol >= 0 ? userData[u][nombreCol] : email;
        
        userSheet.getRange(u + 1, rolCol + 1).setValue(newRoleName);
        
        Logger.log('corregirRolUsuario: Usuario "' + userName + '" actualizado de "' + oldRol + '" a "' + newRoleName + '"');
        
        // Invalidar cache
        if (typeof CacheManager !== 'undefined') {
          CacheManager.invalidate('Usuarios');
          CacheManager.invalidate('USUARIOS');
        }
        
        return {
          success: true,
          message: 'Usuario "' + userName + '" actualizado de "' + oldRol + '" a "' + newRoleName + '"',
          usuario: userName,
          rolAnterior: oldRol,
          rolNuevo: newRoleName
        };
      }
    }
    
    return { success: false, error: 'Usuario con email "' + userEmail + '" no encontrado' };
    
  } catch (error) {
    Logger.log('Error en corregirRolUsuario: ' + error.message);
    return { success: false, error: error.message };
  }
}

/**
 * FUNCIÓN DE CORRECCIÓN MASIVA: Cambia todos los usuarios de un rol a otro
 * Útil cuando se renombró un rol manualmente en la hoja y los usuarios quedaron desincronizados
 * @param {string} oldRoleName - Nombre del rol antiguo (que tienen los usuarios)
 * @param {string} newRoleName - Nombre del rol nuevo (al que se cambiarán)
 * @returns {Object} Resultado de la operación
 */
function cambiarRolMasivo(oldRoleName, newRoleName) {
  try {
    if (!oldRoleName || !newRoleName) {
      return { success: false, error: 'Rol antiguo y nuevo son requeridos' };
    }
    
    var ss = getSpreadsheet();
    
    // Verificar que el nuevo rol existe
    var roleSheet = ss.getSheetByName('ROLES') || ss.getSheetByName('Roles');
    if (!roleSheet) {
      return { success: false, error: 'Hoja ROLES no encontrada' };
    }
    
    var roleData = roleSheet.getDataRange().getValues();
    var roleHeaders = roleData[0].map(function(h) { return String(h).toUpperCase(); });
    var roleNombreCol = roleHeaders.indexOf('NOMBRE');
    var roleActivoCol = roleHeaders.indexOf('ACTIVO');
    
    var roleExists = false;
    for (var r = 1; r < roleData.length; r++) {
      var roleName = roleNombreCol >= 0 ? String(roleData[r][roleNombreCol] || '').toUpperCase() : '';
      var activo = roleActivoCol >= 0 ? String(roleData[r][roleActivoCol] || '').toUpperCase() !== 'NO' : true;
      if (roleName === newRoleName.toUpperCase() && activo) {
        roleExists = true;
        break;
      }
    }
    
    if (!roleExists) {
      return { success: false, error: 'El rol destino "' + newRoleName + '" no existe o está inactivo' };
    }
    
    // Actualizar usuarios
    var usersUpdated = updateUsersWithRole(ss, oldRoleName, newRoleName);
    
    Logger.log('cambiarRolMasivo: ' + usersUpdated + ' usuarios cambiados de "' + oldRoleName + '" a "' + newRoleName + '"');
    
    return {
      success: true,
      message: usersUpdated + ' usuario(s) actualizado(s) de "' + oldRoleName + '" a "' + newRoleName + '"',
      usersUpdated: usersUpdated,
      rolAnterior: oldRoleName,
      rolNuevo: newRoleName
    };
    
  } catch (error) {
    Logger.log('Error en cambiarRolMasivo: ' + error.message);
    return { success: false, error: error.message };
  }
}

/**
 * FUNCIÓN DE DIAGNÓSTICO: Lista todos los usuarios y sus roles actuales
 * Útil para verificar el estado de los usuarios
 */
function listarUsuariosConRoles() {
  try {
    var ss = getSpreadsheet();
    var userSheet = ss.getSheetByName('USUARIOS') || ss.getSheetByName('Usuarios');
    
    if (!userSheet) {
      Logger.log('Hoja USUARIOS no encontrada');
      return { success: false, error: 'Hoja USUARIOS no encontrada' };
    }
    
    var userData = userSheet.getDataRange().getValues();
    var userHeaders = userData[0].map(function(h) { return String(h).toUpperCase(); });
    var nombreCol = userHeaders.indexOf('NOMBRE');
    var emailCol = userHeaders.indexOf('EMAIL');
    if (emailCol === -1) emailCol = userHeaders.indexOf('CORREO');
    var rolCol = userHeaders.indexOf('ROL');
    if (rolCol === -1) rolCol = userHeaders.indexOf('ROLE');
    
    Logger.log('=== LISTA DE USUARIOS Y ROLES ===');
    
    var usuarios = [];
    for (var u = 1; u < userData.length; u++) {
      var nombre = nombreCol >= 0 ? userData[u][nombreCol] : '';
      var email = emailCol >= 0 ? userData[u][emailCol] : '';
      var rol = rolCol >= 0 ? userData[u][rolCol] : '';
      
      Logger.log((u) + '. ' + nombre + ' (' + email + ') - Rol: ' + rol);
      usuarios.push({ nombre: nombre, email: email, rol: rol });
    }
    
    Logger.log('=== TOTAL: ' + usuarios.length + ' usuarios ===');
    
    return { success: true, usuarios: usuarios };
    
  } catch (error) {
    Logger.log('Error: ' + error.message);
    return { success: false, error: error.message };
  }
}
/**
 * Función global para asegurar permisos TMS al usuario actual
 * Se ejecuta automáticamente cuando se accede al TMS
 */
function ensureTMSPermissionsForCurrentUser() {
  try {
    console.log('ensureTMSPermissionsForCurrentUser: Iniciando...');
    
    // Obtener usuario actual
    var currentUser = Session.getActiveUser().getEmail();
    if (!currentUser) {
      console.warn('ensureTMSPermissionsForCurrentUser: No se pudo obtener usuario actual');
      return { success: false, error: 'Usuario no identificado' };
    }
    
    console.log('ensureTMSPermissionsForCurrentUser: Usuario actual:', currentUser);
    
    // Usar la función existente
    var result = ensureTMSPermissions(currentUser);
    
    if (result.success) {
      console.log('ensureTMSPermissionsForCurrentUser: Permisos TMS asegurados correctamente');
    } else {
      console.error('ensureTMSPermissionsForCurrentUser: Error:', result.error);
    }
    
    return result;
    
  } catch (error) {
    console.error('ensureTMSPermissionsForCurrentUser: Error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Función para verificar si el usuario actual tiene permisos TMS
 */
function checkCurrentUserTMSPermissions() {
  try {
    var currentUser = Session.getActiveUser().getEmail();
    if (!currentUser) {
      return { success: false, hasPermissions: false, error: 'Usuario no identificado' };
    }
    
    // Obtener permisos del usuario
    var ss = getSpreadsheet();
    var userSheet = ss.getSheetByName('USUARIOS') || ss.getSheetByName('Usuarios');
    
    if (!userSheet) {
      return { success: false, hasPermissions: false, error: 'Hoja de usuarios no encontrada' };
    }
    
    var data = userSheet.getDataRange().getValues();
    var headers = data[0].map(function(h) { return String(h).toUpperCase(); });
    
    var emailCol = headers.indexOf('EMAIL');
    var rolCol = headers.indexOf('ROL');
    var permisosCol = headers.indexOf('PERMISOS');
    
    if (emailCol === -1) {
      return { success: false, hasPermissions: false, error: 'Estructura de usuarios incorrecta' };
    }
    
    // Buscar el usuario
    for (var i = 1; i < data.length; i++) {
      var email = String(data[i][emailCol] || '').toLowerCase().trim();
      
      if (email === currentUser.toLowerCase().trim()) {
        var rolActual = String(data[i][rolCol] || '').toUpperCase();
        
        // Si es ADMIN, tiene todos los permisos
        if (rolActual === 'ADMIN' || rolActual === 'ADMINISTRADOR') {
          return { 
            success: true, 
            hasPermissions: true, 
            rol: rolActual,
            permissions: ['*'],
            message: 'Usuario administrador con acceso completo'
          };
        }
        
        // Verificar permisos específicos
        if (permisosCol >= 0) {
          var permisosActuales = data[i][permisosCol];
          var permisos = [];
          
          try {
            if (permisosActuales) {
              permisos = JSON.parse(permisosActuales);
            }
          } catch (e) {
            permisos = [];
          }
          
          if (!Array.isArray(permisos)) {
            permisos = [];
          }
          
          // Verificar si tiene permisos TMS
          var hasTMS = permisos.includes('*') || permisos.includes('tms') || permisos.includes('dashboard');
          
          return {
            success: true,
            hasPermissions: hasTMS,
            rol: rolActual,
            permissions: permisos,
            message: hasTMS ? 'Usuario tiene permisos TMS' : 'Usuario no tiene permisos TMS'
          };
        }
        
        return { 
          success: true, 
          hasPermissions: false, 
          rol: rolActual,
          permissions: [],
          message: 'Usuario encontrado pero sin permisos específicos'
        };
      }
    }
    
    return { success: false, hasPermissions: false, error: 'Usuario no encontrado' };
    
  } catch (error) {
    console.error('checkCurrentUserTMSPermissions: Error:', error);
    return { success: false, hasPermissions: false, error: error.message };
  }
}

/**
 * Función para asegurar que todos los usuarios tengan permisos básicos de TMS
 * Ejecutar una vez para migrar usuarios existentes
 */
function migrateTMSPermissionsForAllUsers() {
  try {
    console.log('migrateTMSPermissionsForAllUsers: Iniciando migración...');
    
    var ss = getSpreadsheet();
    var userSheet = ss.getSheetByName('USUARIOS') || ss.getSheetByName('Usuarios');
    
    if (!userSheet) {
      return { success: false, error: 'Hoja de usuarios no encontrada' };
    }
    
    var data = userSheet.getDataRange().getValues();
    var headers = data[0].map(function(h) { return String(h).toUpperCase(); });
    
    var emailCol = headers.indexOf('EMAIL');
    var rolCol = headers.indexOf('ROL');
    var permisosCol = headers.indexOf('PERMISOS');
    
    if (emailCol === -1) {
      return { success: false, error: 'Estructura de usuarios incorrecta' };
    }
    
    var usuariosActualizados = 0;
    var usuariosConErrores = 0;
    
    // Procesar cada usuario
    for (var i = 1; i < data.length; i++) {
      try {
        var email = String(data[i][emailCol] || '').trim();
        var rolActual = String(data[i][rolCol] || '').toUpperCase();
        
        if (!email) continue;
        
        console.log('Procesando usuario:', email, 'Rol:', rolActual);
        
        // Si es ADMIN, asegurar wildcard
        if (rolActual === 'ADMIN' || rolActual === 'ADMINISTRADOR') {
          if (permisosCol >= 0) {
            var permisosActuales = data[i][permisosCol];
            if (!permisosActuales || !String(permisosActuales).includes('*')) {
              userSheet.getRange(i + 1, permisosCol + 1).setValue('["*"]');
              usuariosActualizados++;
              console.log('Wildcard asignado a ADMIN:', email);
            }
          }
          continue;
        }
        
        // Para otros roles, agregar permisos TMS básicos
        if (permisosCol >= 0) {
          var permisosActuales = data[i][permisosCol];
          var permisos = [];
          
          try {
            if (permisosActuales) {
              permisos = JSON.parse(permisosActuales);
            }
          } catch (e) {
            permisos = [];
          }
          
          if (!Array.isArray(permisos)) {
            permisos = [];
          }
          
          // Agregar permisos TMS básicos si no los tiene
          var tmsPermisos = ['tms', 'dashboard'];
          var permisosAgregados = [];
          
          tmsPermisos.forEach(function(permiso) {
            if (permisos.indexOf(permiso) === -1) {
              permisos.push(permiso);
              permisosAgregados.push(permiso);
            }
          });
          
          if (permisosAgregados.length > 0) {
            userSheet.getRange(i + 1, permisosCol + 1).setValue(JSON.stringify(permisos));
            usuariosActualizados++;
            console.log('Permisos TMS agregados a', email, ':', permisosAgregados.join(', '));
          }
        }
        
      } catch (error) {
        console.error('Error procesando usuario en fila', i + 1, ':', error);
        usuariosConErrores++;
      }
    }
    
    console.log('migrateTMSPermissionsForAllUsers: Migración completada');
    console.log('Usuarios actualizados:', usuariosActualizados);
    console.log('Usuarios con errores:', usuariosConErrores);
    
    return {
      success: true,
      message: 'Migración completada. ' + usuariosActualizados + ' usuarios actualizados.',
      usuariosActualizados: usuariosActualizados,
      usuariosConErrores: usuariosConErrores
    };
    
  } catch (error) {
    console.error('migrateTMSPermissionsForAllUsers: Error:', error);
    return { success: false, error: error.message };
  }
}