/**
 * AdminViews.gs
 * Backend para gestión de vistas del sistema WMS
 * Almacena configuración en hoja CONFIG_VISTAS con sincronización en tiempo real
 */

// Nombre de la hoja de configuración
const CONFIG_VIEWS_SHEET = 'CONFIG_VISTAS';

// Configuración por defecto de todas las vistas del sistema
const DEFAULT_VIEWS_CONFIG = {
  areas: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'fa-chart-line',
      color: '#6366f1',
      enabled: true,
      order: 1,
      isLink: true,
      view: 'dashboard',
      permiso: 'dashboard'
    },
    {
      id: 'inbound',
      label: 'Inbound',
      icon: 'fa-arrow-down',
      color: '#10b981',
      enabled: true,
      order: 2,
      modules: [
        { id: 'reception', label: 'Recepción', icon: 'fa-truck-loading', view: 'reception', permiso: 'recepcion', enabled: true, order: 1 },
        { id: 'ingreso', label: 'Ingreso', icon: 'fa-dolly-flatbed', view: 'ingreso', permiso: 'ingreso', enabled: true, order: 2 }
      ]
    },
    {
      id: 'outbound',
      label: 'Outbound',
      icon: 'fa-arrow-up',
      color: '#3b82f6',
      enabled: true,
      order: 3,
      modules: [
        { id: 'notasventa', label: 'Notas de Venta', icon: 'fa-file-invoice', view: 'notasventa', permiso: 'notasventa', enabled: true, order: 1 },
        { id: 'picking', label: 'Picking', icon: 'fa-hand-pointer', view: 'picking', permiso: 'picking', enabled: true, order: 2 },
        { id: 'packing', label: 'Packing', icon: 'fa-box', view: 'packing', permiso: 'packing', enabled: true, order: 3 },
        { id: 'shipping', label: 'Despachos', icon: 'fa-shipping-fast', view: 'shipping', permiso: 'shipping', enabled: true, order: 4 },
        { id: 'delivery', label: 'Entregas', icon: 'fa-clipboard-check', view: 'delivery', permiso: 'delivery', enabled: true, order: 5 }
      ]
    },
    {
      id: 'inventario',
      label: 'Inventario',
      icon: 'fa-warehouse',
      color: '#f59e0b',
      enabled: true,
      order: 4,
      modules: [
        { id: 'inventory', label: 'Stock', icon: 'fa-boxes-stacked', view: 'inventory', permiso: 'inventory', enabled: true, order: 1 },
        { id: 'layout', label: 'Layout', icon: 'fa-map', view: 'layout', permiso: 'layout', enabled: true, order: 2 },
        { id: 'transferencias', label: 'Transferencias', icon: 'fa-right-left', view: 'transferencias', permiso: 'transferencias', enabled: true, order: 3 }
      ]
    },
    {
      id: 'consultas',
      label: 'Consultas',
      icon: 'fa-search',
      color: '#8b5cf6',
      enabled: true,
      order: 5,
      modules: [
        { id: 'lotesseries', label: 'Lotes/Series', icon: 'fa-barcode', view: 'lotesseries', permiso: 'lotesseries', enabled: true, order: 1 },
        { id: 'estadonv', label: 'Estado N.V', icon: 'fa-magnifying-glass-chart', view: 'estadonv', permiso: 'consultas', enabled: true, order: 2 }
      ]
    },
    {
      id: 'admin',
      label: 'Admin',
      icon: 'fa-gear',
      color: '#ef4444',
      enabled: true,
      order: 6,
      adminOnly: true,
      modules: [
        { id: 'users', label: 'Usuarios', icon: 'fa-users', view: 'users', permiso: 'users', enabled: true, order: 1 },
        { id: 'roles', label: 'Roles', icon: 'fa-shield-halved', view: 'roles', permiso: 'roles', enabled: true, order: 2 },
        { id: 'adminviews', label: 'Vistas', icon: 'fa-layer-group', view: 'adminviews', permiso: 'adminviews', enabled: true, order: 3 },
        { id: 'reports', label: 'Reportes', icon: 'fa-file-lines', view: 'reports', permiso: 'reports', enabled: true, order: 4 }
      ]
    }
  ],
  version: 1,
  lastUpdate: null
};

/**
 * Obtiene o crea la hoja CONFIG_VISTAS
 * @returns {Sheet} Hoja de configuración
 */
function getConfigViewsSheet() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(CONFIG_VIEWS_SHEET);
  
  if (!sheet) {
    Logger.log('AdminViews: Creando hoja CONFIG_VISTAS...');
    sheet = ss.insertSheet(CONFIG_VIEWS_SHEET);
    
    // Crear estructura de la hoja
    sheet.getRange('A1:G1').setValues([['ID', 'TIPO', 'LABEL', 'ICON', 'COLOR', 'ENABLED', 'ORDER']]);
    sheet.getRange('A1:G1').setFontWeight('bold').setBackground('#f3f4f6');
    
    // Insertar configuración por defecto
    initializeDefaultViews(sheet);
    
    // Formatear hoja
    sheet.setFrozenRows(1);
    sheet.autoResizeColumns(1, 7);
    
    Logger.log('AdminViews: Hoja CONFIG_VISTAS creada correctamente');
  }
  
  return sheet;
}

/**
 * Inicializa la hoja con la configuración por defecto
 * @param {Sheet} sheet - Hoja a inicializar
 */
function initializeDefaultViews(sheet) {
  var rows = [];
  
  DEFAULT_VIEWS_CONFIG.areas.forEach(function(area) {
    // Agregar área
    rows.push([
      area.id,
      'AREA',
      area.label,
      area.icon,
      area.color,
      area.enabled ? 'SI' : 'NO',
      area.order
    ]);
    
    // Agregar módulos del área
    if (area.modules) {
      area.modules.forEach(function(module) {
        rows.push([
          module.id,
          'MODULE:' + area.id,
          module.label,
          module.icon,
          '',
          module.enabled ? 'SI' : 'NO',
          module.order
        ]);
      });
    }
  });
  
  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, 7).setValues(rows);
  }
}

/**
 * Obtiene la configuración actual de vistas desde la hoja
 * @returns {Object} Configuración de vistas
 */
function getViewsConfig() {
  try {
    var sheet = getConfigViewsSheet();
    var data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      return { success: true, config: DEFAULT_VIEWS_CONFIG, source: 'default' };
    }
    
    var areas = [];
    var currentArea = null;
    var stats = { total: 0, enabled: 0, disabled: 0, areas: 0, modules: 0 };
    
    // Procesar filas (saltando header)
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var id = String(row[0] || '').trim();
      var tipo = String(row[1] || '').trim();
      var label = String(row[2] || '').trim();
      var icon = String(row[3] || '').trim();
      var color = String(row[4] || '').trim();
      var enabled = String(row[5] || '').toUpperCase() === 'SI';
      var order = Number(row[6]) || i;
      
      if (!id) continue;
      
      stats.total++;
      if (enabled) stats.enabled++;
      else stats.disabled++;
      
      if (tipo === 'AREA') {
        // Es un área
        if (currentArea) {
          areas.push(currentArea);
        }
        currentArea = {
          id: id,
          label: label,
          icon: icon,
          color: color,
          enabled: enabled,
          order: order,
          modules: [],
          isLink: id === 'dashboard',
          view: id === 'dashboard' ? 'dashboard' : undefined,
          permiso: id === 'dashboard' ? 'dashboard' : undefined,
          adminOnly: id === 'admin'
        };
        stats.areas++;
      } else if (tipo.startsWith('MODULE:')) {
        // Es un módulo
        var parentArea = tipo.replace('MODULE:', '');
        var module = {
          id: id,
          label: label,
          icon: icon,
          view: id,
          permiso: getModulePermission(id),
          enabled: enabled,
          order: order
        };
        
        if (currentArea && currentArea.id === parentArea) {
          currentArea.modules.push(module);
        }
        stats.modules++;
      }
    }
    
    // Agregar última área
    if (currentArea) {
      areas.push(currentArea);
    }
    
    // Ordenar áreas y módulos
    areas.sort(function(a, b) { return a.order - b.order; });
    areas.forEach(function(area) {
      if (area.modules) {
        area.modules.sort(function(a, b) { return a.order - b.order; });
      }
    });
    
    return {
      success: true,
      config: { areas: areas, version: 1, lastUpdate: new Date().toISOString() },
      stats: stats,
      source: 'sheet'
    };
    
  } catch (error) {
    Logger.log('AdminViews ERROR getViewsConfig: ' + error.message);
    return { success: false, error: error.message, config: DEFAULT_VIEWS_CONFIG };
  }
}

/**
 * Obtiene el permiso correcto para un módulo
 * @param {string} moduleId - ID del módulo
 * @returns {string} Nombre del permiso
 */
function getModulePermission(moduleId) {
  var permissionMap = {
    'reception': 'recepcion',
    'estadonv': 'consultas'
  };
  return permissionMap[moduleId] || moduleId;
}

/**
 * Actualiza el estado de una vista (habilitada/deshabilitada)
 * @param {string} viewId - ID de la vista/módulo
 * @param {boolean} enabled - Estado habilitado
 * @returns {Object} Resultado de la operación
 */
function updateViewStatus(viewId, enabled) {
  try {
    var sheet = getConfigViewsSheet();
    var data = sheet.getDataRange().getValues();
    var found = false;
    
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0]).trim() === viewId) {
        // Actualizar columna ENABLED (F = 6)
        sheet.getRange(i + 1, 6).setValue(enabled ? 'SI' : 'NO');
        found = true;
        break;
      }
    }
    
    if (!found) {
      return { success: false, error: 'Vista no encontrada: ' + viewId };
    }
    
    // Invalidar cache
    CacheManager.invalidate(CONFIG_VIEWS_SHEET);
    
    Logger.log('AdminViews: Vista ' + viewId + ' actualizada a ' + (enabled ? 'habilitada' : 'deshabilitada'));
    
    return {
      success: true,
      viewId: viewId,
      enabled: enabled,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    Logger.log('AdminViews ERROR updateViewStatus: ' + error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Actualiza el orden de las vistas
 * @param {Array} viewsOrder - Array de {id, order}
 * @returns {Object} Resultado de la operación
 */
function updateViewsOrder(viewsOrder) {
  try {
    var sheet = getConfigViewsSheet();
    var data = sheet.getDataRange().getValues();
    
    viewsOrder.forEach(function(item) {
      for (var i = 1; i < data.length; i++) {
        if (String(data[i][0]).trim() === item.id) {
          // Actualizar columna ORDER (G = 7)
          sheet.getRange(i + 1, 7).setValue(item.order);
          break;
        }
      }
    });
    
    // Invalidar cache
    CacheManager.invalidate(CONFIG_VIEWS_SHEET);
    
    return { success: true, updated: viewsOrder.length, timestamp: new Date().toISOString() };
    
  } catch (error) {
    Logger.log('AdminViews ERROR updateViewsOrder: ' + error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Actualiza la información de una vista (label, icon, color)
 * @param {string} viewId - ID de la vista
 * @param {Object} updates - {label, icon, color}
 * @returns {Object} Resultado
 */
function updateViewInfo(viewId, updates) {
  try {
    var sheet = getConfigViewsSheet();
    var data = sheet.getDataRange().getValues();
    
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0]).trim() === viewId) {
        if (updates.label) sheet.getRange(i + 1, 3).setValue(updates.label);
        if (updates.icon) sheet.getRange(i + 1, 4).setValue(updates.icon);
        if (updates.color) sheet.getRange(i + 1, 5).setValue(updates.color);
        
        CacheManager.invalidate(CONFIG_VIEWS_SHEET);
        
        return { success: true, viewId: viewId, updates: updates };
      }
    }
    
    return { success: false, error: 'Vista no encontrada' };
    
  } catch (error) {
    Logger.log('AdminViews ERROR updateViewInfo: ' + error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Obtiene estadísticas de las vistas
 * @returns {Object} Estadísticas
 */
function getViewsStats() {
  try {
    var result = getViewsConfig();
    if (!result.success) return result;
    
    return {
      success: true,
      stats: result.stats
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Reinicia la configuración de vistas a los valores por defecto
 * @returns {Object} Resultado
 */
function resetViewsConfig() {
  try {
    var sheet = getConfigViewsSheet();
    
    // Limpiar datos existentes (excepto header)
    var lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      sheet.getRange(2, 1, lastRow - 1, 7).clear();
    }
    
    // Insertar configuración por defecto
    initializeDefaultViews(sheet);
    
    // Invalidar cache
    CacheManager.invalidate(CONFIG_VIEWS_SHEET);
    
    return { success: true, message: 'Configuración reiniciada a valores por defecto' };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ============================================================
// CONFIGURACIÓN DE VISTA INICIAL POR ROL
// ============================================================

const CONFIG_ROLE_VIEWS_SHEET = 'CONFIG_ROLES_VISTAS';

/**
 * Obtiene o crea la hoja CONFIG_ROLES_VISTAS para guardar vista inicial por rol
 * @returns {Sheet} Hoja de configuración
 */
function getRoleViewsSheet() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(CONFIG_ROLE_VIEWS_SHEET);
  
  if (!sheet) {
    Logger.log('AdminViews: Creando hoja CONFIG_ROLES_VISTAS...');
    sheet = ss.insertSheet(CONFIG_ROLE_VIEWS_SHEET);
    
    // Crear estructura de la hoja
    sheet.getRange('A1:D1').setValues([['ROL', 'VISTA_INICIAL', 'FECHA_ACTUALIZACION', 'ACTUALIZADO_POR']]);
    sheet.getRange('A1:D1').setFontWeight('bold').setBackground('#1e293b').setFontColor('#ffffff');
    
    // Formatear hoja
    sheet.setFrozenRows(1);
    sheet.autoResizeColumns(1, 4);
    
    Logger.log('AdminViews: Hoja CONFIG_ROLES_VISTAS creada correctamente');
  }
  
  return sheet;
}

/**
 * Obtiene la configuración de vistas por rol
 * @returns {Object} Configuración de vistas por rol
 */
function getRoleViewsConfig() {
  try {
    Logger.log('getRoleViewsConfig: Iniciando...');
    var sheet = getRoleViewsSheet();
    var data = sheet.getDataRange().getValues();
    
    var config = [];
    for (var i = 1; i < data.length; i++) {
      var rol = String(data[i][0] || '').trim();
      var vistaInicial = String(data[i][1] || '').trim();
      if (rol && vistaInicial) {
        config.push({
          rol: rol,
          vistaInicial: vistaInicial
        });
      }
    }
    
    Logger.log('getRoleViewsConfig: ' + config.length + ' configuraciones encontradas');
    return { success: true, config: config };
    
  } catch (error) {
    Logger.log('getRoleViewsConfig ERROR: ' + error.message);
    return { success: false, error: error.message, config: [] };
  }
}

/**
 * Obtiene todos los roles con su vista inicial configurada
 * @returns {Object} Lista de roles con su configuración
 */
function getRolesWithDefaultViews() {
  try {
    Logger.log('getRolesWithDefaultViews: Iniciando...');
    
    // Usar la función getAllRoles existente del sistema
    var rolesResult = getAllRoles();
    Logger.log('getRolesWithDefaultViews: Resultado de getAllRoles: ' + JSON.stringify(rolesResult ? rolesResult.success : 'null'));
    
    if (!rolesResult || !rolesResult.success) {
      Logger.log('getRolesWithDefaultViews: getAllRoles falló: ' + (rolesResult ? rolesResult.error : 'null'));
      return { 
        success: false, 
        error: rolesResult ? rolesResult.error : 'No se pudo obtener roles',
        roles: [], 
        availableViews: getDefaultAvailableViews() 
      };
    }
    
    // Obtener configuración de vistas por rol (si existe)
    var viewByRole = {};
    try {
      var roleViewsSheet = getRoleViewsSheet();
      var roleViewsData = roleViewsSheet.getDataRange().getValues();
      
      for (var i = 1; i < roleViewsData.length; i++) {
        var rolName = String(roleViewsData[i][0] || '').toUpperCase();
        var vistaInicial = String(roleViewsData[i][1] || '').trim();
        if (rolName && vistaInicial) {
          viewByRole[rolName] = vistaInicial;
        }
      }
      Logger.log('getRolesWithDefaultViews: Vistas por rol cargadas: ' + Object.keys(viewByRole).length);
    } catch (e) {
      Logger.log('getRolesWithDefaultViews: Error al leer CONFIG_ROLES_VISTAS: ' + e.message);
    }
    
    // Obtener vistas disponibles
    var availableViews = getDefaultAvailableViews();
    
    // Construir lista de roles simplificada
    var roles = [];
    if (rolesResult.roles && rolesResult.roles.length > 0) {
      rolesResult.roles.forEach(function(role) {
        var nombreUpper = role.nombre ? String(role.nombre).toUpperCase() : '';
        var vistaInicial = viewByRole[nombreUpper] || 'dashboard';
        
        roles.push({
          nombre: role.nombre || 'Sin nombre',
          color: role.color || role.colorBg || '#6366f1',
          icono: role.icono || 'fa-user-shield',
          vistaInicial: vistaInicial
        });
      });
    }
    
    Logger.log('getRolesWithDefaultViews: ' + roles.length + ' roles procesados');
    
    return {
      success: true,
      roles: roles,
      availableViews: availableViews,
      totalRoles: roles.length
    };
    
  } catch (error) {
    Logger.log('AdminViews ERROR getRolesWithDefaultViews: ' + error.message);
    return { 
      success: false, 
      error: error.message, 
      roles: [], 
      availableViews: getDefaultAvailableViews() 
    };
  }
}

/**
 * Obtiene las vistas disponibles por defecto
 * @returns {Array} Lista de vistas por defecto
 */
function getDefaultAvailableViews() {
  return [
    { id: 'dashboard', label: 'Dashboard', icon: 'fa-chart-line', color: '#6366f1' },
    { id: 'reception', label: 'Recepción', icon: 'fa-truck-loading', color: '#10b981' },
    { id: 'ingreso', label: 'Ingreso', icon: 'fa-dolly-flatbed', color: '#10b981' },
    { id: 'notasventa', label: 'Notas de Venta', icon: 'fa-file-invoice', color: '#3b82f6' },
    { id: 'picking', label: 'Picking', icon: 'fa-hand-pointer', color: '#3b82f6' },
    { id: 'packing', label: 'Packing', icon: 'fa-box', color: '#3b82f6' },
    { id: 'shipping', label: 'Despachos', icon: 'fa-shipping-fast', color: '#3b82f6' },
    { id: 'delivery', label: 'Entregas', icon: 'fa-clipboard-check', color: '#3b82f6' },
    { id: 'inventory', label: 'Stock', icon: 'fa-boxes-stacked', color: '#f59e0b' },
    { id: 'layout', label: 'Layout', icon: 'fa-map', color: '#f59e0b' },
    { id: 'transferencias', label: 'Transferencias', icon: 'fa-right-left', color: '#f59e0b' },
    { id: 'lotesseries', label: 'Lotes/Series', icon: 'fa-barcode', color: '#8b5cf6' },
    { id: 'estadonv', label: 'Estado N.V', icon: 'fa-magnifying-glass-chart', color: '#8b5cf6' }
  ];
}

/**
 * Actualiza la vista inicial de un rol
 * @param {string} roleName - Nombre del rol
 * @param {string} viewId - ID de la vista inicial
 * @returns {Object} Resultado
 */
function updateRoleDefaultView(roleName, viewId) {
  try {
    if (!roleName || !viewId) {
      return { success: false, error: 'Rol y vista son requeridos' };
    }
    
    var sheet = getRoleViewsSheet();
    var data = sheet.getDataRange().getValues();
    var roleNameUpper = roleName.toUpperCase();
    var found = false;
    
    // Buscar si el rol ya tiene configuración
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0] || '').toUpperCase() === roleNameUpper) {
        // Actualizar fila existente
        sheet.getRange(i + 1, 2).setValue(viewId); // Vista inicial
        sheet.getRange(i + 1, 3).setValue(new Date().toISOString()); // Fecha
        found = true;
        break;
      }
    }
    
    // Si no existe, agregar nueva fila
    if (!found) {
      var lastRow = sheet.getLastRow();
      sheet.getRange(lastRow + 1, 1, 1, 4).setValues([[
        roleName,
        viewId,
        new Date().toISOString(),
        'Admin'
      ]]);
    }
    
    Logger.log('AdminViews: Vista inicial del rol "' + roleName + '" actualizada a "' + viewId + '"');
    
    return {
      success: true,
      roleName: roleName,
      viewId: viewId,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    Logger.log('AdminViews ERROR updateRoleDefaultView: ' + error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Obtiene la vista inicial para un rol específico
 * @param {string} roleName - Nombre del rol
 * @returns {string} ID de la vista inicial (o 'dashboard' por defecto)
 */
function getRoleDefaultView(roleName) {
  try {
    if (!roleName) return 'dashboard';
    
    var sheet = getRoleViewsSheet();
    var data = sheet.getDataRange().getValues();
    var roleNameUpper = roleName.toUpperCase();
    
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0] || '').toUpperCase() === roleNameUpper) {
        var vista = String(data[i][1] || '').trim();
        return vista || 'dashboard';
      }
    }
    
    return 'dashboard'; // Por defecto
    
  } catch (error) {
    Logger.log('AdminViews ERROR getRoleDefaultView: ' + error.message);
    return 'dashboard';
  }
}

/**
 * Obtiene la vista inicial para el usuario actual basándose en su rol
 * Esta función se llama después del login exitoso
 * @param {string} userRol - Rol del usuario
 * @returns {Object} Información de la vista inicial
 */
function getInitialViewForUser(userRol) {
  try {
    var viewId = getRoleDefaultView(userRol);
    
    return {
      success: true,
      viewId: viewId,
      rol: userRol
    };
  } catch (error) {
    return {
      success: true,
      viewId: 'dashboard',
      rol: userRol,
      error: error.message
    };
  }
}

// Exponer funciones globales
this.getViewsConfig = getViewsConfig;
this.updateViewStatus = updateViewStatus;
this.updateViewsOrder = updateViewsOrder;
this.updateViewInfo = updateViewInfo;
this.getViewsStats = getViewsStats;
this.resetViewsConfig = resetViewsConfig;
this.getRoleViewsConfig = getRoleViewsConfig;
this.getRolesWithDefaultViews = getRolesWithDefaultViews;
this.updateRoleDefaultView = updateRoleDefaultView;
this.getRoleDefaultView = getRoleDefaultView;
this.getInitialViewForUser = getInitialViewForUser;
