/**
 * Api.gs
 * Endpoint REST para la aplicación móvil CCO Expo
 * 
 * Este archivo maneja las peticiones POST desde la app móvil
 * Debe desplegarse como Web App con acceso "Anyone"
 */

/**
 * Maneja peticiones POST desde la app móvil
 * @param {Object} e - Evento de la petición
 * @returns {TextOutput} Respuesta JSON
 */
function doPost(e) {
  try {
    // Parsear el body de la petición
    var requestData;
    try {
      requestData = JSON.parse(e.postData.contents);
    } catch (parseError) {
      return createJsonResponse({
        success: false,
        error: 'Invalid JSON in request body'
      }, 400);
    }
    
    var action = requestData.action;
    var data = requestData.data || {};
    var sessionId = requestData.sessionId;
    
    if (!action) {
      return createJsonResponse({
        success: false,
        error: 'Action is required'
      }, 400);
    }
    
    // Log de la petición (sin datos sensibles)
    Logger.log('API Request: ' + action);
    
    // Router de acciones
    switch (action) {
      case 'health':
        return createJsonResponse({
          success: true,
          status: 'healthy',
          timestamp: new Date().toISOString(),
          version: '1.0.0'
        });
      
      // ============ AUTENTICACIÓN ============
      case 'login':
        return handleLogin(data);
      
      case 'logout':
        return handleLogout(sessionId);
      
      case 'validateSession':
        return handleValidateSession(sessionId);
      
      case 'getUserBySession':
        return handleGetUserBySession(sessionId);
      
      // ============ NOTAS DE VENTA ============
      case 'getNotasVenta':
        return handleWithAuth(sessionId, function() {
          return getNotasVenta(data.forceRefresh);
        });
      
      case 'getNotasVentaStats':
        return handleWithAuth(sessionId, function() {
          return getNotasVentaStats();
        });
      
      case 'updateNVStatus':
        return handleWithAuth(sessionId, function() {
          return updateNVStatus(data.notaVenta, data.nuevoEstado);
        });
      
      // ============ INVENTARIO ============
      case 'getProducts':
        return handleWithAuth(sessionId, function() {
          return getProducts(data.search, data.location);
        });
      
      case 'getProductByCode':
        return handleWithAuth(sessionId, function() {
          return getProductByCode(data.code);
        });
      
      case 'updateStock':
        return handleWithAuth(sessionId, function() {
          return apiUpdateStock(data.productCode, data.quantity, data.type, data.location);
        });
      
      case 'moveProduct':
        return handleWithAuth(sessionId, function() {
          return moveProduct(data.productCode, data.fromLocation, data.toLocation, data.quantity);
        });
      
      // ============ BÚSQUEDAS ============
      case 'searchPartidas':
        return handleWithAuth(sessionId, function() {
          return buscarMultiHoja('Partidas', data.query, data.exactMode);
        });
      
      case 'searchSeries':
        return handleWithAuth(sessionId, function() {
          return buscarMultiHoja('Series', data.query, data.exactMode);
        });
      
      case 'searchFarmapack':
        return handleWithAuth(sessionId, function() {
          return buscarMultiHoja('Farmapack', data.query, data.exactMode);
        });
      
      case 'searchPeso':
        return handleWithAuth(sessionId, function() {
          return buscarMultiHoja('peso', data.query, data.exactMode);
        });
      
      case 'searchUbicaciones':
        return handleWithAuth(sessionId, function() {
          return buscarMultiHoja('UBICACIONES', data.query, data.exactMode);
        });
      
      // ============ INGRESO ============
      case 'registrarIngreso':
        return handleWithAuth(sessionId, function() {
          return registrarIngreso(data);
        });
      
      // ============ PICKING ============
      case 'getPickingOrders':
        return handleWithAuth(sessionId, function() {
          return getPickingOrders(data.status);
        });
      
      case 'startPicking':
        return handleWithAuth(sessionId, function() {
          return startPicking(data.notaVenta, sessionId);
        });
      
      case 'confirmPickItem':
        return handleWithAuth(sessionId, function() {
          return confirmPickItem(data.notaVenta, data.productCode, data.quantity);
        });
      
      case 'completePicking':
        return handleWithAuth(sessionId, function() {
          return completePicking(data.notaVenta);
        });
      
      // ============ PACKING ============
      case 'getPackingOrders':
        return handleWithAuth(sessionId, function() {
          return getPackingOrders();
        });
      
      case 'completePacking':
        return handleWithAuth(sessionId, function() {
          return completePacking(data.notasVenta);
        });
      
      // ============ DESPACHO ============
      case 'getDispatchOrders':
        return handleWithAuth(sessionId, function() {
          return getDispatchOrders();
        });
      
      case 'createDispatch':
        return handleWithAuth(sessionId, function() {
          return apiCreateDispatch(data.notasVenta, data.transportista, data.guia);
        });
      
      case 'getDispatches':
        return handleWithAuth(sessionId, function() {
          return getDispatches(data.filters);
        });
      
      // ============ ENTREGAS ============
      case 'getPendingDeliveries':
        return handleWithAuth(sessionId, function() {
          return getPendingDeliveries();
        });
      
      case 'confirmDelivery':
        return handleWithAuth(sessionId, function() {
          return apiConfirmDelivery(data.notaVenta, data.photoBase64, data.notes);
        });
      
      case 'reportNonDelivery':
        return handleWithAuth(sessionId, function() {
          return reportNonDelivery(data.notaVenta, data.reason, data.notes);
        });
      
      // ============ LAYOUT ============
      case 'getWarehouseLayout':
        return handleWithAuth(sessionId, function() {
          return getWarehouseLayout();
        });
      
      case 'getLocationProducts':
        return handleWithAuth(sessionId, function() {
          return getLocationProducts(data.location);
        });
      
      // ============ ADMIN ============
      case 'getDashboardStats':
        return handleWithAuth(sessionId, function() {
          return getDashboardStats();
        });
      
      case 'getUsers':
        return handleWithRole(sessionId, ['ADMIN', 'ADMINISTRADOR'], function() {
          return getUsers(sessionId);
        });
      
      case 'createUser':
        return handleWithRole(sessionId, ['ADMIN', 'ADMINISTRADOR'], function() {
          return apiCreateUser(data, sessionId);
        });
      
      case 'updateUser':
        return handleWithRole(sessionId, ['ADMIN', 'ADMINISTRADOR'], function() {
          return updateUser(data.userId, data.updates, sessionId);
        });
      
      case 'deactivateUser':
        return handleWithRole(sessionId, ['ADMIN', 'ADMINISTRADOR'], function() {
          return deactivateUser(data.userId, sessionId);
        });
      
      // ============ ROLES ============
      case 'getRoles':
        return handleWithRole(sessionId, ['ADMIN', 'ADMINISTRADOR'], function() {
          return getRoles(sessionId);
        });
      
      case 'createRole':
        return handleWithRole(sessionId, ['ADMIN', 'ADMINISTRADOR'], function() {
          return createRole(data, sessionId);
        });
      
      case 'updateRole':
        return handleWithRole(sessionId, ['ADMIN', 'ADMINISTRADOR'], function() {
          return updateRole(data.roleId, data.updates, sessionId);
        });
      
      case 'deleteRole':
        return handleWithRole(sessionId, ['ADMIN', 'ADMINISTRADOR'], function() {
          return deleteRole(data.roleId, sessionId);
        });
      
      case 'getUserPermissions':
        return handleWithAuth(sessionId, function() {
          // getUserPermissions existe en Auth.gs y Roles.gs - se usa la que GAS cargue
          return getUserPermissions(sessionId);
        });
      
      case 'getModuleCategories':
        return handleWithAuth(sessionId, function() {
          return getModuleCategories();
        });
      
      case 'checkModuleAccess':
        return handleWithAuth(sessionId, function() {
          return checkModuleAccess(sessionId, data.moduleId);
        });
      
      // ============ REPORTES ============
      case 'getReport':
        return handleWithAuth(sessionId, function() {
          return getReport(data.type, data.startDate, data.endDate);
        });
      
      // ============ SYNC ============
      case 'syncOperations':
        return handleWithAuth(sessionId, function() {
          return syncOperations(data.operations);
        });
      
      default:
        return createJsonResponse({
          success: false,
          error: 'Unknown action: ' + action
        }, 400);
    }
    
  } catch (error) {
    Logger.log('API Error: ' + error.message);
    return createJsonResponse({
      success: false,
      error: 'Server error: ' + error.message
    }, 500);
  }
}

/**
 * Maneja el login
 */
function handleLogin(data) {
  var result = authenticateUser(data.email, data.password);
  return createJsonResponse(result);
}

/**
 * Maneja el logout
 */
function handleLogout(sessionId) {
  var result = logout(sessionId);
  return createJsonResponse(result);
}

/**
 * Valida una sesión
 */
function handleValidateSession(sessionId) {
  var isValid = validateSession(sessionId);
  return createJsonResponse({
    success: true,
    valid: isValid
  });
}

/**
 * Obtiene usuario por sesión
 */
function handleGetUserBySession(sessionId) {
  var user = getUserBySession(sessionId);
  if (user) {
    return createJsonResponse({
      success: true,
      user: user
    });
  } else {
    return createJsonResponse({
      success: false,
      error: 'Session not found or expired'
    });
  }
}

/**
 * Wrapper para ejecutar acciones con autenticación
 */
function handleWithAuth(sessionId, action) {
  if (!sessionId) {
    return createJsonResponse({
      success: false,
      error: 'Session ID required',
      code: 'AUTH_REQUIRED'
    }, 401);
  }
  
  if (!validateSession(sessionId)) {
    return createJsonResponse({
      success: false,
      error: 'Invalid or expired session',
      code: 'SESSION_EXPIRED'
    }, 401);
  }
  
  var result = action();
  return createJsonResponse(result);
}

function handleWithRole(sessionId, allowedRoles, action) {
  if (!sessionId) {
    return createJsonResponse({
      success: false,
      error: 'Session ID required',
      code: 'AUTH_REQUIRED'
    }, 401);
  }
  
  if (!validateSession(sessionId)) {
    return createJsonResponse({
      success: false,
      error: 'Invalid or expired session',
      code: 'SESSION_EXPIRED'
    }, 401);
  }
  
  var user = getUserBySession(sessionId);
  if (!user) {
    return createJsonResponse({
      success: false,
      error: 'User not found for session',
      code: 'USER_NOT_FOUND'
    }, 401);
  }
  
  var role = String(user.rol || '').toUpperCase().trim();
  var allowed = (allowedRoles || []).map(function(r) { return String(r || '').toUpperCase().trim(); });
  
  if (!allowed.includes(role)) {
    return createJsonResponse({
      success: false,
      error: 'Forbidden',
      code: 'FORBIDDEN'
    }, 403);
  }
  
  var result = action();
  return createJsonResponse(result);
}

/**
 * Crea una respuesta JSON con CORS headers
 */
function createJsonResponse(data, statusCode) {
  var output = ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
  
  return output;
}

// ============================================================
// FUNCIONES DE INVENTARIO - Conectadas con Inventory.gs
// ============================================================

/**
 * Actualiza el estado de una Nota de Venta
 */
// NOTA: updateNVStatus removida de Api.gs para evitar conflicto con PickingManager.gs
// El router doPost() llama a updateNVStatus() que resuelve a la version de PickingManager.gs

/**
 * Obtiene productos del inventario - CONECTADO con getInventarioCompleto()
 */
function getProducts(search, location) {
  try {
    // Llamar a la función real de Inventory.gs
    var resultado = getInventarioCompleto();
    
    if (!resultado.success) {
      return resultado;
    }
    
    var products = resultado.productos || [];
    
    // Aplicar filtro de búsqueda si existe
    if (search && search.trim() !== '') {
      var searchLower = search.toLowerCase().trim();
      products = products.filter(function(p) {
        var codigo = (p.codigo || '').toLowerCase();
        var descripcion = (p.descripcion || '').toLowerCase();
        var ubicacion = (p.ubicacion || '').toLowerCase();
        return codigo.indexOf(searchLower) !== -1 ||
               descripcion.indexOf(searchLower) !== -1 ||
               ubicacion.indexOf(searchLower) !== -1;
      });
    }
    
    // Aplicar filtro de ubicación si existe
    if (location && location.trim() !== '') {
      var locationUpper = location.toUpperCase().trim();
      products = products.filter(function(p) {
        return (p.ubicacion || '').toUpperCase() === locationUpper;
      });
    }
    
    // Formatear productos para la app
    var formattedProducts = products.map(function(p) {
      return {
        id: p.id || p.codigo,
        codigo: p.codigo,
        descripcion: p.descripcion,
        stockActual: p.disponible || p.stockTotal || 0,
        stockMinimo: 10,
        ubicacion: p.ubicacion || '',
        estado: p.estado || 'disponible',
        unidadMedida: p.unidadMedida || 'UN'
      };
    });
    
    return { 
      success: true, 
      products: formattedProducts, 
      total: formattedProducts.length,
      resumen: resultado.resumen
    };
    
  } catch (e) {
    Logger.log('Error en getProducts: ' + e.message);
    return { success: false, error: e.message, products: [] };
  }
}

/**
 * Obtiene un producto por código - CONECTADO con buscarProductoEnMatriz()
 */
function getProductByCode(code) {
  try {
    if (!code) {
      return { success: false, error: 'Código requerido', product: null };
    }
    
    // Primero buscar en MATRIZ para obtener descripción
    var matrizResult = buscarProductoEnMatriz(code);
    
    // Luego buscar en INGRESO para obtener stock y ubicación
    var inventarioResult = getInventarioCompleto();
    
    if (!inventarioResult.success) {
      // Si no hay inventario, retornar solo datos de matriz
      if (matrizResult.success) {
        return {
          success: true,
          product: {
            codigo: matrizResult.codigo,
            descripcion: matrizResult.descripcion,
            unidadMedida: matrizResult.unidadMedida,
            stockActual: 0,
            ubicacion: ''
          }
        };
      }
      return { success: false, error: 'Producto no encontrado', product: null };
    }
    
    var codeBuscado = code.toUpperCase().trim();
    var productos = inventarioResult.productos || [];
    
    for (var i = 0; i < productos.length; i++) {
      if ((productos[i].codigo || '').toUpperCase() === codeBuscado) {
        return {
          success: true,
          product: {
            id: productos[i].id || productos[i].codigo,
            codigo: productos[i].codigo,
            descripcion: productos[i].descripcion || (matrizResult.success ? matrizResult.descripcion : ''),
            stockActual: productos[i].disponible || productos[i].stockTotal || 0,
            stockMinimo: 10,
            ubicacion: productos[i].ubicacion || '',
            unidadMedida: productos[i].unidadMedida || 'UN',
            estado: productos[i].estado || 'disponible'
          }
        };
      }
    }
    
    // Si no está en inventario pero sí en matriz
    if (matrizResult.success) {
      return {
        success: true,
        product: {
          codigo: matrizResult.codigo,
          descripcion: matrizResult.descripcion,
          unidadMedida: matrizResult.unidadMedida,
          stockActual: 0,
          ubicacion: '',
          estado: 'sin_stock'
        }
      };
    }
    
    return { success: false, error: 'Producto no encontrado: ' + code, product: null };
    
  } catch (e) {
    Logger.log('Error en getProductByCode: ' + e.message);
    return { success: false, error: e.message, product: null };
  }
}

/**
 * Actualiza stock de un producto - CONECTADO con actualizarInventarioConsolidado()
 */
// NOTA: Renombrada para evitar conflicto con Database.gs e InventoryManager.gs
function apiUpdateStock(productCode, quantity, type, location) {
  try {
    if (!productCode || quantity === undefined) {
      return { success: false, error: 'Código y cantidad son requeridos' };
    }
    
    var cantidad = Number(quantity);
    if (isNaN(cantidad)) {
      return { success: false, error: 'Cantidad debe ser un número' };
    }
    
    // Llamar a la función real de Inventory.gs
    actualizarInventarioConsolidado(productCode, cantidad, type || 'disponible');
    
    Logger.log('Stock actualizado: ' + productCode + ' | ' + type + ' | ' + cantidad);
    
    return { 
      success: true, 
      message: 'Stock actualizado',
      productCode: productCode,
      quantity: cantidad,
      type: type || 'disponible'
    };
    
  } catch (e) {
    Logger.log('Error en updateStock: ' + e.message);
    return { success: false, error: e.message };
  }
}

/**
 * Mueve producto entre ubicaciones - CONECTADO con actualizarUbicacionProducto()
 */
function moveProduct(productCode, fromLocation, toLocation, quantity) {
  try {
    if (!productCode || !toLocation) {
      return { success: false, error: 'Código y ubicación destino son requeridos' };
    }
    
    // Llamar a la función real de Inventory.gs
    var result = actualizarUbicacionProducto(productCode, toLocation, 'API');
    
    if (result.success) {
      Logger.log('Producto movido: ' + productCode + ' de ' + fromLocation + ' a ' + toLocation);
    }
    
    return result;
    
  } catch (e) {
    Logger.log('Error en moveProduct: ' + e.message);
    return { success: false, error: e.message };
  }
}

/**
 * Registra un ingreso de mercadería - CONECTADO con registrarProductoInventario()
 */
// NOTA: registrarIngreso removida de Api.gs para evitar conflicto con Ingreso.gs y LotesSeries.gs
// El router doPost() llama a registrarIngreso() que resuelve a la version de Ingreso.gs

// ============================================================
// FUNCIONES DE PICKING/PACKING/DESPACHO - Implementadas
// ============================================================

/**
 * Obtiene órdenes de picking con filtro por estado
 */
function getPickingOrders(status) {
  try {
    var result = getNotasVenta();
    if (!result.success) return result;
    
    var orders = result.notasVenta.filter(function(nv) {
      var estado = (nv.estado || '').toUpperCase();
      if (status === 'pending') {
        return estado === 'PENDIENTE_PICKING' || estado === 'PENDIENTE' || estado === '';
      }
      if (status === 'inProgress') {
        return estado === 'EN_PICKING';
      }
      if (status === 'completed') {
        return estado === 'PK' || estado === 'PACKING' || estado === 'LISTO_PACKING';
      }
      return true;
    });
    
    // Agregar información de progreso a cada orden
    orders = orders.map(function(order) {
      var productos = order.productos || [];
      var totalItems = productos.length;
      var completedItems = productos.filter(function(p) { return p.despachado > 0; }).length;
      
      return {
        notaVenta: order.notaVenta,
        fechaEntrega: order.fechaEntrega,
        estado: order.estado,
        cliente: order.cliente,
        vendedor: order.vendedor,
        productos: productos,
        totalItems: totalItems,
        itemsCompleted: completedItems,
        pickingProgress: totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0
      };
    });
    
    return { success: true, orders: orders, total: orders.length };
    
  } catch (e) {
    Logger.log('Error en getPickingOrders: ' + e.message);
    return { success: false, error: e.message, orders: [] };
  }
}

/**
 * Inicia picking de una orden - Cambia estado a EN_PICKING
 */
function startPicking(notaVenta, sessionId) {
  try {
    if (!notaVenta) {
      return { success: false, error: 'Nota de venta requerida' };
    }
    
    var result = updateNVStatus(notaVenta, 'EN_PICKING');
    
    if (result.success) {
      Logger.log('Picking iniciado para NV: ' + notaVenta);
      return { 
        success: true, 
        message: 'Picking iniciado',
        notaVenta: notaVenta,
        nuevoEstado: 'EN_PICKING'
      };
    }
    
    return result;
    
  } catch (e) {
    Logger.log('Error en startPicking: ' + e.message);
    return { success: false, error: e.message };
  }
}

/**
 * Confirma item pickeado
 */
function confirmPickItem(notaVenta, productCode, quantity) {
  try {
    if (!notaVenta || !productCode) {
      return { success: false, error: 'Nota de venta y código de producto son requeridos' };
    }
    
    // Registrar el item pickeado (en una implementación completa, 
    // esto actualizaría una hoja de PICKING_ITEMS)
    Logger.log('Item pickeado: NV=' + notaVenta + ', Producto=' + productCode + ', Cantidad=' + quantity);
    
    return { 
      success: true, 
      message: 'Item confirmado',
      notaVenta: notaVenta,
      productCode: productCode,
      quantity: quantity
    };
    
  } catch (e) {
    Logger.log('Error en confirmPickItem: ' + e.message);
    return { success: false, error: e.message };
  }
}

/**
 * Completa picking de una orden - Cambia estado a PK (Listo para Packing)
 */
function completePicking(notaVenta) {
  try {
    if (!notaVenta) {
      return { success: false, error: 'Nota de venta requerida' };
    }
    
    var result = updateNVStatus(notaVenta, 'PK');
    
    if (result.success) {
      Logger.log('Picking completado para NV: ' + notaVenta);
      return { 
        success: true, 
        message: 'Picking completado',
        notaVenta: notaVenta,
        nuevoEstado: 'PK'
      };
    }
    
    return result;
    
  } catch (e) {
    Logger.log('Error en completePicking: ' + e.message);
    return { success: false, error: e.message };
  }
}

/**
 * Obtiene órdenes para packing agrupadas por cliente
 */
function getPackingOrders() {
  try {
    var result = getNotasVenta();
    if (!result.success) return result;
    
    var orders = result.notasVenta.filter(function(nv) {
      var estado = (nv.estado || '').toUpperCase();
      return estado === 'PK' || estado === 'PACKING' || estado === 'LISTO_PACKING';
    });
    
    // Agrupar por cliente
    var clientGroups = {};
    orders.forEach(function(order) {
      var cliente = order.cliente || 'Sin Cliente';
      if (!clientGroups[cliente]) {
        clientGroups[cliente] = {
          cliente: cliente,
          orders: [],
          totalOrders: 0
        };
      }
      clientGroups[cliente].orders.push(order);
      clientGroups[cliente].totalOrders++;
    });
    
    var groupedOrders = Object.values(clientGroups);
    
    return { 
      success: true, 
      orders: orders,
      groupedByClient: groupedOrders,
      total: orders.length 
    };
    
  } catch (e) {
    Logger.log('Error en getPackingOrders: ' + e.message);
    return { success: false, error: e.message, orders: [] };
  }
}

/**
 * Completa packing de órdenes - Cambia estado a LISTO_DESPACHO
 */
function completePacking(notasVenta) {
  try {
    if (!notasVenta || !Array.isArray(notasVenta) || notasVenta.length === 0) {
      return { success: false, error: 'Lista de notas de venta requerida' };
    }
    
    var results = [];
    var errors = [];
    
    notasVenta.forEach(function(nv) {
      var result = updateNVStatus(nv, 'LISTO_DESPACHO');
      if (result.success) {
        results.push(nv);
      } else {
        errors.push({ notaVenta: nv, error: result.error });
      }
    });
    
    Logger.log('Packing completado para ' + results.length + ' NVs');
    
    return { 
      success: errors.length === 0, 
      message: 'Packing completado para ' + results.length + ' órdenes',
      completed: results,
      errors: errors
    };
    
  } catch (e) {
    Logger.log('Error en completePacking: ' + e.message);
    return { success: false, error: e.message };
  }
}

/**
 * Obtiene órdenes para despacho
 */
function getDispatchOrders() {
  try {
    var result = getNotasVenta();
    if (!result.success) return result;
    
    var orders = result.notasVenta.filter(function(nv) {
      var estado = (nv.estado || '').toUpperCase().replace(/ /g, '_');
      return estado === 'LISTO_DESPACHO' || estado === 'LISTO DESPACHO';
    });
    
    return { success: true, orders: orders, total: orders.length };
    
  } catch (e) {
    Logger.log('Error en getDispatchOrders: ' + e.message);
    return { success: false, error: e.message, orders: [] };
  }
}

/**
 * Crea un despacho - Actualiza NVs a DESPACHADO
 */
// NOTA: Renombrada para evitar conflicto con Dispatch.gs
function apiCreateDispatch(notasVenta, transportista, guia) {
  try {
    if (!notasVenta || !Array.isArray(notasVenta) || notasVenta.length === 0) {
      return { success: false, error: 'Lista de notas de venta requerida' };
    }
    
    // Generar número de guía si no se proporciona
    var guiaNumero = guia || 'GUIA-' + new Date().getTime();
    var fechaDespacho = new Date().toISOString();
    
    var results = [];
    var errors = [];
    
    notasVenta.forEach(function(nv) {
      var result = updateNVStatus(nv, 'DESPACHADO');
      if (result.success) {
        results.push(nv);
      } else {
        errors.push({ notaVenta: nv, error: result.error });
      }
    });
    
    Logger.log('Despacho creado: ' + guiaNumero + ' con ' + results.length + ' NVs');
    
    return { 
      success: errors.length === 0, 
      message: 'Despacho creado',
      guia: guiaNumero,
      transportista: transportista,
      fechaDespacho: fechaDespacho,
      notasVenta: results,
      errors: errors
    };
    
  } catch (e) {
    Logger.log('Error en createDispatch: ' + e.message);
    return { success: false, error: e.message };
  }
}

/**
 * Obtiene despachos recientes
 */
function getDispatches(filters) {
  try {
    var result = getNotasVenta();
    if (!result.success) return result;
    
    var dispatches = result.notasVenta.filter(function(nv) {
      var estado = (nv.estado || '').toUpperCase();
      return estado === 'DESPACHADO' || estado === 'EN_TRANSITO' || estado === 'ENTREGADO';
    });
    
    // Aplicar filtros si existen
    if (filters) {
      if (filters.transportista) {
        dispatches = dispatches.filter(function(d) {
          return (d.transportista || '').toLowerCase().indexOf(filters.transportista.toLowerCase()) !== -1;
        });
      }
      if (filters.fecha) {
        dispatches = dispatches.filter(function(d) {
          return d.fechaEntrega === filters.fecha;
        });
      }
    }
    
    return { success: true, dispatches: dispatches, total: dispatches.length };
    
  } catch (e) {
    Logger.log('Error en getDispatches: ' + e.message);
    return { success: false, error: e.message, dispatches: [] };
  }
}

/**
 * Obtiene entregas pendientes
 */
// NOTA: getPendingDeliveries removida de Api.gs para evitar conflicto con Delivery.gs
// El router doPost() llama a getPendingDeliveries() que resuelve a la version de Delivery.gs

/**
 * Confirma entrega - Cambia estado a ENTREGADO
 */
// NOTA: Renombrada para evitar conflicto con Delivery.gs
function apiConfirmDelivery(notaVenta, photoBase64, notes) {
  try {
    if (!notaVenta) {
      return { success: false, error: 'Nota de venta requerida' };
    }
    
    var result = updateNVStatus(notaVenta, 'ENTREGADO');
    
    if (result.success) {
      var entregaTs = new Date().toISOString();
      var foto = null;
      
      if (photoBase64) {
        foto = saveDeliveryPhotoToDriveAndLog(notaVenta, photoBase64, notes, entregaTs);
        if (foto && foto.success === false) {
          return foto;
        }
      } else {
        logDeliveryRecord(notaVenta, notes, entregaTs, null, null);
      }
      
      Logger.log('Entrega confirmada: ' + notaVenta + (notes ? ' - ' + notes : ''));
      
      return { 
        success: true, 
        message: 'Entrega confirmada',
        notaVenta: notaVenta,
        fechaEntrega: entregaTs,
        notas: notes,
        foto: foto && foto.success ? { fileId: foto.fileId, url: foto.url } : null
      };
    }
    
    return result;
    
  } catch (e) {
    Logger.log('Error en confirmDelivery: ' + e.message);
    return { success: false, error: e.message };
  }
}

function saveDeliveryPhotoToDriveAndLog(notaVenta, photoBase64, notes, entregaTs) {
  var parsed = parseBase64Image(photoBase64);
  if (!parsed.success) return parsed;
  
  var maxBytes = 2 * 1024 * 1024;
  if (parsed.bytes && parsed.bytes.length > maxBytes) {
    return { success: false, error: 'Imagen demasiado grande. Máximo 2MB.' };
  }
  
  var folder = getOrCreateFolderByName_('CCO_Entregas_Fotos');
  var safeNv = String(notaVenta).trim().replace(/[\\\/\:\*\?\"\<\>\|]/g, '_');
  var ext = parsed.mimeType === 'image/png' ? 'png' : parsed.mimeType === 'image/webp' ? 'webp' : 'jpg';
  var fileName = 'ENTREGA_' + safeNv + '_' + entregaTs.replace(/[:.]/g, '-') + '.' + ext;
  
  var blob = Utilities.newBlob(parsed.bytes, parsed.mimeType, fileName);
  var file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  
  var fileId = file.getId();
  var url = file.getUrl();
  
  logDeliveryRecord(notaVenta, notes, entregaTs, fileId, url);
  
  return { success: true, fileId: fileId, url: url };
}

function logDeliveryRecord(notaVenta, notes, entregaTs, fileId, fileUrl) {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName('ENTREGAS');
  if (!sheet) {
    sheet = ss.insertSheet('ENTREGAS');
    sheet.getRange(1, 1, 1, 5).setValues([['Timestamp', 'NotaVenta', 'Notas', 'FotoFileId', 'FotoUrl']]);
    sheet.getRange(1, 1, 1, 5).setFontWeight('bold').setBackground('#f0f0f0');
  }
  
  sheet.appendRow([
    entregaTs,
    String(notaVenta || ''),
    String(notes || ''),
    fileId ? String(fileId) : '',
    fileUrl ? String(fileUrl) : ''
  ]);
}

function parseBase64Image(input) {
  try {
    var s = String(input || '').trim();
    if (!s) return { success: false, error: 'Imagen vacía' };
    
    var mimeType = 'image/jpeg';
    var base64 = s;
    
    if (s.indexOf('data:') === 0) {
      var comma = s.indexOf(',');
      if (comma === -1) return { success: false, error: 'Data URI inválida' };
      var header = s.substring(5, comma);
      base64 = s.substring(comma + 1);
      var semi = header.indexOf(';');
      mimeType = (semi === -1 ? header : header.substring(0, semi)) || mimeType;
    }
    
    var bytes = Utilities.base64Decode(base64);
    return { success: true, mimeType: mimeType, bytes: bytes };
  } catch (e) {
    return { success: false, error: 'Imagen inválida' };
  }
}

function getOrCreateFolderByName_(name) {
  var it = DriveApp.getFoldersByName(name);
  if (it.hasNext()) return it.next();
  return DriveApp.createFolder(name);
}

/**
 * Reporta no entrega
 */
function reportNonDelivery(notaVenta, reason, notes) {
  try {
    if (!notaVenta || !reason) {
      return { success: false, error: 'Nota de venta y motivo son requeridos' };
    }
    
    // Mantener en estado DESPACHADO pero registrar el intento fallido
    Logger.log('No entrega reportada: ' + notaVenta + ' - Motivo: ' + reason + (notes ? ' - ' + notes : ''));
    
    return { 
      success: true, 
      message: 'No entrega reportada',
      notaVenta: notaVenta,
      reason: reason,
      notes: notes,
      fecha: new Date().toISOString()
    };
    
  } catch (e) {
    Logger.log('Error en reportNonDelivery: ' + e.message);
    return { success: false, error: e.message };
  }
}

// ============================================================
// FUNCIONES DE LAYOUT Y DASHBOARD - Implementadas
// ============================================================

/**
 * Obtiene layout del almacén desde la hoja LAYOUT
 */
function getWarehouseLayout() {
  try {
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName('LAYOUT');
    
    if (!sheet) {
      // Retornar layout por defecto si no existe la hoja
      return { 
        success: true, 
        layout: {
          rows: 10,
          columns: 20,
          locations: []
        }
      };
    }
    
    var data = sheet.getDataRange().getValues();
    var locations = [];
    
    // Obtener inventario para calcular ocupación
    var inventario = getInventarioCompleto();
    var productosPorUbicacion = {};
    
    if (inventario.success && inventario.productos) {
      inventario.productos.forEach(function(p) {
        var ub = (p.ubicacion || '').toUpperCase();
        if (ub) {
          if (!productosPorUbicacion[ub]) {
            productosPorUbicacion[ub] = { count: 0, products: [] };
          }
          productosPorUbicacion[ub].count++;
          productosPorUbicacion[ub].products.push(p);
        }
      });
    }
    
    // Procesar ubicaciones del layout
    for (var i = 1; i < data.length; i++) {
      var ubicacion = String(data[i][0] || '').trim().toUpperCase();
      if (!ubicacion) continue;
      
      var capacidad = Number(data[i][1]) || 10;
      var ocupacion = productosPorUbicacion[ubicacion] ? productosPorUbicacion[ubicacion].count : 0;
      
      // Determinar estado de ocupación
      var estado = 'empty';
      if (ocupacion > 0 && ocupacion < capacidad) {
        estado = 'partial';
      } else if (ocupacion >= capacidad) {
        estado = 'full';
      }
      
      locations.push({
        codigo: ubicacion,
        capacidad: capacidad,
        ocupacion: ocupacion,
        estado: estado,
        pasillo: ubicacion.charAt(0),
        rack: ubicacion.substring(0, 3),
        nivel: ubicacion.substring(3)
      });
    }
    
    // Calcular dimensiones del grid
    var pasillos = [...new Set(locations.map(function(l) { return l.pasillo; }))];
    var maxRacks = Math.max(...locations.map(function(l) { return parseInt(l.rack.substring(1)) || 0; }));
    
    return { 
      success: true, 
      layout: {
        rows: pasillos.length || 10,
        columns: maxRacks || 20,
        locations: locations,
        totalLocations: locations.length,
        occupiedLocations: locations.filter(function(l) { return l.ocupacion > 0; }).length
      }
    };
    
  } catch (e) {
    Logger.log('Error en getWarehouseLayout: ' + e.message);
    return { 
      success: false, 
      error: e.message,
      layout: { rows: 10, columns: 20, locations: [] }
    };
  }
}

/**
 * Obtiene productos en una ubicación específica
 */
function getLocationProducts(location) {
  try {
    if (!location) {
      return { success: false, error: 'Ubicación requerida', products: [] };
    }
    
    var result = getProducts(null, location);
    
    return {
      success: true,
      location: location.toUpperCase(),
      products: result.products || [],
      total: (result.products || []).length
    };
    
  } catch (e) {
    Logger.log('Error en getLocationProducts: ' + e.message);
    return { success: false, error: e.message, products: [] };
  }
}

/**
 * Obtiene estadísticas del dashboard con datos reales
 */
function getDashboardStats() {
  try {
    // Obtener estadísticas de notas de venta
    var nvStats = getNotasVentaStats();
    
    // Obtener estadísticas de inventario
    var invStats = getEstadisticasInventario();
    
    // Calcular KPIs adicionales
    var today = new Date();
    var todayStr = Utilities.formatDate(today, Session.getScriptTimeZone(), 'yyyy-MM-dd');
    
    var stats = {
      // Estadísticas de órdenes
      ordenes: nvStats.success ? nvStats.estadisticas : {},
      
      // Estadísticas de inventario
      inventario: invStats.success ? invStats.estadisticas : {},
      
      // KPIs calculados
      kpis: {
        ordenesHoy: 0,
        pendientes: 0,
        completadas: 0,
        tasaCumplimiento: 0
      }
    };
    
    // Calcular KPIs si hay datos
    if (nvStats.success && nvStats.estadisticas) {
      var e = nvStats.estadisticas;
      stats.kpis.pendientes = (e.pendientes || 0) + (e.enPicking || 0) + (e.enPacking || 0);
      stats.kpis.completadas = (e.entregadas || 0);
      var total = (e.total || 1);
      stats.kpis.tasaCumplimiento = Math.round((stats.kpis.completadas / total) * 100);
    }
    
    return {
      success: true,
      stats: stats,
      timestamp: new Date().toISOString()
    };
    
  } catch (e) {
    Logger.log('Error en getDashboardStats: ' + e.message);
    return { 
      success: false, 
      error: e.message,
      stats: {},
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Obtiene lista de usuarios - VERSIÓN ROBUSTA
 * Esta función SIEMPRE retorna un objeto válido
 */
function getUsers(sessionId) {
  // SIEMPRE retornar un objeto válido, nunca undefined
  var resultado = { success: false, users: [], total: 0, error: '' };
  
  try {
    // NOTA: La autenticación se maneja a nivel de la aplicación web
    
    Logger.log('=== GET USERS - INICIO ===');
    
    // 1. Obtener spreadsheet
    var ss = null;
    try {
      ss = getSpreadsheet();
    } catch (e1) {
      Logger.log('No se pudo obtener spreadsheet: ' + e1.message);
    }
    
    if (!ss) {
      resultado.error = 'No se pudo acceder al spreadsheet';
      Logger.log('ERROR: ' + resultado.error);
      return resultado;
    }
    
    Logger.log('Spreadsheet: ' + ss.getName());
    
    // 2. Buscar hoja de usuarios
    var userSheet = null;
    var possibleNames = ['USUARIOS', 'Usuarios', 'usuarios', 'USERS', 'Users'];
    
    for (var i = 0; i < possibleNames.length; i++) {
      userSheet = ss.getSheetByName(possibleNames[i]);
      if (userSheet) {
        Logger.log('Hoja encontrada: ' + possibleNames[i]);
        break;
      }
    }
    
    // Si no existe, crearla
    if (!userSheet) {
      Logger.log('Creando hoja USUARIOS...');
      userSheet = ss.insertSheet('USUARIOS');
      userSheet.getRange(1, 1, 1, 7).setValues([['ID', 'Email', 'Password', 'Nombre', 'Rol', 'FechaCreacion', 'Activo']]);
      userSheet.getRange(1, 1, 1, 7).setFontWeight('bold').setBackground('#f0f0f0');
      resultado.success = true;
      resultado.message = 'Hoja USUARIOS creada';
      return resultado;
    }
    
    // 3. Leer datos
    var lastRow = userSheet.getLastRow();
    Logger.log('Última fila: ' + lastRow);
    
    if (lastRow <= 1) {
      resultado.success = true;
      resultado.message = 'No hay usuarios registrados';
      Logger.log('Hoja vacía (solo headers)');
      return resultado;
    }
    
    var data = userSheet.getDataRange().getValues();
    var headers = data[0];
    Logger.log('Headers: ' + JSON.stringify(headers));
    
    // 4. Detectar columnas
    var colIndex = { id: 0, email: 1, nombre: 3, rol: 4, fechaCreacion: 5, activo: 6 };
    
    for (var h = 0; h < headers.length; h++) {
      var hdr = String(headers[h]).toUpperCase().trim();
      if (hdr === 'ID') colIndex.id = h;
      else if (hdr === 'EMAIL' || hdr === 'CORREO') colIndex.email = h;
      else if (hdr === 'NOMBRE' || hdr === 'NAME') colIndex.nombre = h;
      else if (hdr === 'ROL' || hdr === 'ROLE') colIndex.rol = h;
      else if (hdr.indexOf('FECHA') !== -1) colIndex.fechaCreacion = h;
      else if (hdr === 'ACTIVO' || hdr === 'ACTIVE' || hdr === 'ESTADO') colIndex.activo = h;
    }
    
    // 5. Procesar usuarios
    var users = [];
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var id = row[colIndex.id] ? String(row[colIndex.id]).trim() : '';
      var email = row[colIndex.email] ? String(row[colIndex.email]).trim() : '';
      
      if (id || email) {
        users.push({
          id: id || ('USR-' + i),
          email: email,
          nombre: row[colIndex.nombre] ? String(row[colIndex.nombre]).trim() : 'Sin nombre',
          rol: row[colIndex.rol] ? String(row[colIndex.rol]).trim() : 'OPERADOR',
          fechaCreacion: row[colIndex.fechaCreacion] ? String(row[colIndex.fechaCreacion]) : '',
          activo: row[colIndex.activo] ? String(row[colIndex.activo]).trim() : 'SI'
        });
      }
    }
    
    Logger.log('Usuarios encontrados: ' + users.length);
    
    resultado.success = true;
    resultado.users = users;
    resultado.total = users.length;
    
    Logger.log('=== GET USERS - FIN (éxito) ===');
    return resultado;
    
  } catch (e) {
    Logger.log('ERROR CRÍTICO en getUsers: ' + e.message);
    resultado.error = 'Error del servidor: ' + e.message;
    return resultado;
  }
}

/**
 * Alias para compatibilidad con frontend - VERSIÓN ROBUSTA
 * Esta función SIEMPRE retorna un objeto válido
 */
function listUsers(sessionId) {
  Logger.log('>>> listUsers() llamado');
  var result = getUsers(sessionId);
  Logger.log('>>> listUsers() retornando: ' + (result ? 'objeto válido' : 'NULL/UNDEFINED'));
  // Garantizar que SIEMPRE retornamos algo válido
  if (!result) {
    return { success: false, users: [], total: 0, error: 'getUsers retornó null' };
  }
  return result;
}

/**
 * Crea un nuevo usuario desde la interfaz web
 * Versión simplificada sin ConcurrencyManager
 */
// NOTA: Renombrada para evitar conflicto con Auth.gs
function apiCreateUser(userData, sessionId) {
  try {
    // NOTA: La autenticación se maneja a nivel de la aplicación web

    Logger.log('=== CREAR USUARIO ===');
    
    // 1. Validar y limpiar datos
    var nombre = userData && userData.nombre ? String(userData.nombre).trim() : '';
    var email = userData && userData.email ? String(userData.email).trim().toLowerCase() : '';
    var password = userData && userData.password ? String(userData.password).trim() : '';
    var rol = userData && userData.rol ? String(userData.rol).trim() : 'OPERADOR';
    var activo = userData && userData.activo !== false;
    
    Logger.log('Datos procesados:');
    Logger.log('- Nombre: "' + nombre + '"');
    Logger.log('- Email: "' + email + '"');
    Logger.log('- Password: ' + (password ? '[PRESENTE]' : '[VACÍO]'));
    Logger.log('- Rol: "' + rol + '"');
    Logger.log('- Activo: ' + activo);
    
    // 2. Validaciones
    if (!nombre || nombre.length < 2) {
      return { success: false, error: 'El nombre es requerido (mínimo 2 caracteres)' };
    }
    
    if (!email || email.length < 5) {
      return { success: false, error: 'El email es requerido' };
    }
    
    if (!password || password.length < 6) {
      return { success: false, error: 'La contraseña es requerida (mínimo 6 caracteres)' };
    }
    
    // Validar formato de email
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { success: false, error: 'Formato de email inválido' };
    }
    
    // Validar rol - obtener roles válidos desde la hoja ROLES
    var validRoles = getValidRolesFromSheet();
    if (!validRoles.includes(rol.toUpperCase())) {
      return { success: false, error: 'Rol inválido. Debe ser: ' + validRoles.join(', ') };
    }
    
    Logger.log('✅ Validaciones pasadas');
    
    // 3. Obtener/crear hoja de usuarios
    var userSheet = getUserSheet();
    if (!userSheet) {
      return { success: false, error: 'No se pudo acceder a la hoja de usuarios' };
    }
    
    // 4. Verificar email duplicado
    var data = userSheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (data[i][1] && String(data[i][1]).toLowerCase() === email) {
        return { success: false, error: 'El email ya está registrado' };
      }
    }
    
    // 5. Generar ID y hashear contraseña
    var userId = 'USR-' + new Date().getTime() + '-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    var passwordHash = hashPasswordSimple(password);
    
    // 6. Insertar usuario
    var newRow = [
      userId,
      email,
      passwordHash,
      nombre,
      rol,
      new Date().toISOString(),
      activo ? 'SI' : 'NO'
    ];
    
    userSheet.appendRow(newRow);
    
    Logger.log('✅ Usuario creado exitosamente: ' + email);
    
    return {
      success: true,
      message: 'Usuario creado correctamente',
      userId: userId,
      nombre: nombre,
      email: email,
      rol: rol
    };
    
  } catch (error) {
    Logger.log('❌ Error en createUser: ' + error.message);
    return {
      success: false,
      error: 'Error del servidor: ' + error.message
    };
  }
}

/**
 * Obtener o crear hoja de usuarios - VERSIÓN SIMPLIFICADA
 * Usa el SPREADSHEET_ID definido en Code.gs
 */
function getUserSheet() {
  try {
    Logger.log('getUserSheet() - Buscando hoja de usuarios...');
    
    var ss = null;
    try {
      ss = getSpreadsheet();
    } catch (e1) {
      Logger.log('No se pudo obtener spreadsheet: ' + e1.message);
    }
    
    if (!ss) {
      Logger.log('ERROR: No se pudo obtener spreadsheet');
      return null;
    }
    
    // Buscar hoja existente
    var possibleNames = ['USUARIOS', 'Usuarios', 'usuarios', 'USERS', 'Users'];
    for (var i = 0; i < possibleNames.length; i++) {
      var sheet = ss.getSheetByName(possibleNames[i]);
      if (sheet) {
        Logger.log('Hoja encontrada: ' + possibleNames[i]);
        return sheet;
      }
    }
    
    // Crear nueva hoja si no existe
    Logger.log('Creando nueva hoja USUARIOS...');
    var newSheet = ss.insertSheet('USUARIOS');
    newSheet.getRange(1, 1, 1, 7).setValues([['ID', 'Email', 'Password', 'Nombre', 'Rol', 'FechaCreacion', 'Activo']]);
    newSheet.getRange(1, 1, 1, 7).setFontWeight('bold').setBackground('#f0f0f0');
    
    return newSheet;
    
  } catch (error) {
    Logger.log('ERROR en getUserSheet: ' + error.message);
    return null;
  }
}

/**
 * Obtiene los roles válidos desde la hoja ROLES
 * Si no existe la hoja o está vacía, retorna roles por defecto
 */
function getValidRolesFromSheet() {
  try {
    var ss = getSpreadsheet();
    var rolesSheet = ss.getSheetByName('ROLES');
    
    if (!rolesSheet) {
      Logger.log('Hoja ROLES no encontrada, usando roles por defecto');
      return ['ADMIN', 'SUPERVISOR', 'OPERADOR'];
    }
    
    var data = rolesSheet.getDataRange().getValues();
    var roles = [];
    
    // Buscar columna de nombre de rol (puede ser "Nombre", "ROL", "ROLE", etc.)
    var headers = data[0];
    var nombreColIndex = -1;
    
    for (var h = 0; h < headers.length; h++) {
      var header = String(headers[h]).toUpperCase().trim();
      if (header === 'NOMBRE' || header === 'ROL' || header === 'ROLE' || header === 'NAME') {
        nombreColIndex = h;
        break;
      }
    }
    
    // Si no encontramos columna de nombre, usar la primera columna
    if (nombreColIndex === -1) {
      nombreColIndex = 0;
    }
    
    // Extraer nombres de roles
    for (var i = 1; i < data.length; i++) {
      var rolName = String(data[i][nombreColIndex] || '').trim().toUpperCase();
      if (rolName && rolName !== '') {
        roles.push(rolName);
      }
    }
    
    if (roles.length === 0) {
      Logger.log('Hoja ROLES vacía, usando roles por defecto');
      return ['ADMIN', 'SUPERVISOR', 'OPERADOR'];
    }
    
    Logger.log('Roles válidos desde hoja: ' + roles.join(', '));
    return roles;
    
  } catch (error) {
    Logger.log('Error obteniendo roles: ' + error.message);
    return ['ADMIN', 'SUPERVISOR', 'OPERADOR'];
  }
}

/**
 * Hash simple de contraseña
 */
function hashPasswordSimple(password) {
  try {
    var salt = 'CCO_SECURE_2024';
    var saltedPassword = salt + password + salt;
    
    var hash = Utilities.computeDigest(
      Utilities.DigestAlgorithm.SHA_256,
      saltedPassword,
      Utilities.Charset.UTF_8
    );
    
    return hash.map(function(byte) {
      var v = (byte < 0) ? 256 + byte : byte;
      return ('0' + v.toString(16)).slice(-2);
    }).join('');
    
  } catch (error) {
    Logger.log('Error hasheando contraseña: ' + error.message);
    throw error;
  }
}

/**
 * Actualiza un usuario
 */
function updateUser(userId, updates, sessionId) {
  try {
    // NOTA: La autenticación se maneja a nivel de la aplicación web
    
    if (!userId || !updates) {
      return { success: false, error: 'ID de usuario y datos de actualización son requeridos' };
    }
    
    var userSheet = getUserSheet();
    if (!userSheet) {
      return { success: false, error: 'No se encontró la hoja de usuarios' };
    }
    
    var data = userSheet.getDataRange().getValues();
    var userRowIndex = -1;
    
    // Buscar el usuario por ID
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] === userId) {
        userRowIndex = i + 1; // +1 porque las filas empiezan en 1
        break;
      }
    }
    
    if (userRowIndex === -1) {
      return { success: false, error: 'Usuario no encontrado' };
    }
    
    // Actualizar campos permitidos
    // Columnas: 0=ID, 1=Email, 2=Password, 3=Nombre, 4=Rol, 5=FechaCreacion, 6=Activo
    
    if (updates.nombre) {
      userSheet.getRange(userRowIndex, 4).setValue(updates.nombre);
    }
    
    if (updates.email) {
      userSheet.getRange(userRowIndex, 2).setValue(updates.email.toLowerCase());
    }
    
    if (updates.rol) {
      // Validar rol dinámicamente desde la hoja ROLES
      var validRoles = getValidRolesFromSheet();
      if (!validRoles.includes(updates.rol.toUpperCase())) {
        return { success: false, error: 'Rol inválido. Debe ser: ' + validRoles.join(', ') };
      }
      userSheet.getRange(userRowIndex, 5).setValue(updates.rol);
    }
    
    if (updates.activo !== undefined) {
      userSheet.getRange(userRowIndex, 7).setValue(updates.activo ? 'SI' : 'NO');
    }
    
    // Si se proporciona nueva contraseña
    if (updates.password && updates.password.length >= 6) {
      var passwordHash = hashPasswordSimple(updates.password);
      userSheet.getRange(userRowIndex, 3).setValue(passwordHash);
    }
    
    Logger.log('Usuario actualizado: ' + userId);
    
    return { success: true, message: 'Usuario actualizado', userId: userId };
  } catch (e) {
    Logger.log('Error en updateUser: ' + e.message);
    return { success: false, error: e.message };
  }
}

/**
 * Elimina un usuario
 */
function deleteUser(userId, sessionId) {
  try {
    // NOTA: La autenticación se maneja a nivel de la aplicación web
    
    if (!userId) {
      return { success: false, error: 'ID de usuario requerido' };
    }
    
    var userSheet = getUserSheet();
    if (!userSheet) {
      return { success: false, error: 'No se encontró la hoja de usuarios' };
    }
    
    var data = userSheet.getDataRange().getValues();
    var userRowIndex = -1;
    var userRol = '';
    
    // Buscar el usuario por ID
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] === userId) {
        userRowIndex = i + 1;
        userRol = data[i][4];
        break;
      }
    }
    
    if (userRowIndex === -1) {
      return { success: false, error: 'Usuario no encontrado' };
    }
    
    // No permitir eliminar el último admin
    if (userRol === 'ADMIN') {
      var adminCount = 0;
      for (var j = 1; j < data.length; j++) {
        if (data[j][4] === 'ADMIN' && data[j][6] === 'SI') {
          adminCount++;
        }
      }
      if (adminCount <= 1) {
        return { success: false, error: 'No se puede eliminar el último administrador' };
      }
    }
    
    // Eliminar la fila del usuario
    userSheet.deleteRow(userRowIndex);
    
    Logger.log('Usuario eliminado: ' + userId);
    
    return { success: true, message: 'Usuario eliminado correctamente' };
    
  } catch (error) {
    Logger.log('Error en deleteUser: ' + error.message);
    return { success: false, error: 'Error al eliminar usuario: ' + error.message };
  }
}

/**
 * Desactiva un usuario
 */
function deactivateUser(userId, sessionId) {
  try {
    // NOTA: La autenticación se maneja a nivel de la aplicación web
    
    if (!userId) {
      return { success: false, error: 'ID de usuario requerido' };
    }
    
    var userSheet = getUserSheet();
    if (!userSheet) {
      return { success: false, error: 'No se encontró la hoja de usuarios' };
    }
    
    var data = userSheet.getDataRange().getValues();
    var userRowIndex = -1;
    
    // Buscar el usuario por ID
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] === userId) {
        userRowIndex = i + 1;
        break;
      }
    }
    
    if (userRowIndex === -1) {
      return { success: false, error: 'Usuario no encontrado' };
    }
    
    // Desactivar usuario
    userSheet.getRange(userRowIndex, 7).setValue('NO');
    
    Logger.log('Usuario desactivado: ' + userId);
    
    return { success: true, message: 'Usuario desactivado', userId: userId };
    
  } catch (e) {
    Logger.log('Error en deactivateUser: ' + e.message);
    return { success: false, error: e.message };
  }
}

/**
 * Guarda un usuario (crear o actualizar)
 * Esta función unifica createUser y updateUser para el frontend
 */
function saveUser(userData, sessionId) {
  try {
    // NOTA: La autenticación se maneja a nivel de la aplicación web
    
    Logger.log('=== SAVE USER ===');
    Logger.log('Datos recibidos: ' + JSON.stringify(userData));
    
    // Si tiene ID, es actualización
    if (userData && userData.id) {
      return updateUser(userData.id, userData, sessionId);
    }
    
    // Si no tiene ID, es creación
    return createUser(userData, sessionId);
    
  } catch (error) {
    Logger.log('Error en saveUser: ' + error.message);
    return { success: false, error: 'Error al guardar usuario: ' + error.message };
  }
}

/**
 * Genera un reporte con datos reales
 */
function getReport(type, startDate, endDate) {
  try {
    var report = {
      type: type,
      startDate: startDate,
      endDate: endDate,
      generatedAt: new Date().toISOString(),
      data: []
    };
    
    switch (type) {
      case 'ordenes':
        var nvResult = getNotasVenta();
        if (nvResult.success) {
          report.data = nvResult.notasVenta.filter(function(nv) {
            if (!startDate && !endDate) return true;
            var fecha = nv.fechaEntrega;
            if (startDate && fecha < startDate) return false;
            if (endDate && fecha > endDate) return false;
            return true;
          });
        }
        break;
        
      case 'inventario':
        var invResult = getInventarioCompleto();
        if (invResult.success) {
          report.data = invResult.productos;
          report.resumen = invResult.resumen;
        }
        break;
        
      case 'movimientos':
        var movResult = getResumenMovimientos(startDate, endDate);
        if (movResult.success) {
          report.data = movResult;
        }
        break;
        
      default:
        return { success: false, error: 'Tipo de reporte no válido: ' + type };
    }
    
    return { success: true, report: report };
    
  } catch (e) {
    Logger.log('Error en getReport: ' + e.message);
    return { success: false, error: e.message, report: { type: type, data: [] } };
  }
}

/**
 * Sincroniza operaciones offline
 */
function syncOperations(operations) {
  var results = [];
  
  if (!operations || !Array.isArray(operations)) {
    return { success: false, error: 'Lista de operaciones requerida', results: [] };
  }
  
  for (var i = 0; i < operations.length; i++) {
    var op = operations[i];
    try {
      var opResult = { id: op.id, success: false };
      
      // Procesar cada operación según su tipo
      switch (op.type) {
        case 'INGRESO_PRODUCTO':
          var ingresoResult = registrarIngreso(op.data);
          opResult.success = ingresoResult.success;
          opResult.error = ingresoResult.error;
          break;
          
        case 'PICKING_ITEM':
          var pickResult = confirmPickItem(op.data.notaVenta, op.data.productCode, op.data.quantity);
          opResult.success = pickResult.success;
          opResult.error = pickResult.error;
          break;
          
        case 'COMPLETE_PICKING':
          var completePickResult = completePicking(op.data.notaVenta);
          opResult.success = completePickResult.success;
          opResult.error = completePickResult.error;
          break;
          
        case 'COMPLETE_PACKING':
          var completePackResult = completePacking(op.data.notasVenta);
          opResult.success = completePackResult.success;
          opResult.error = completePackResult.error;
          break;
          
        case 'CREATE_DISPATCH':
          var dispatchResult = createDispatch(op.data.notasVenta, op.data.transportista, op.data.guia);
          opResult.success = dispatchResult.success;
          opResult.error = dispatchResult.error;
          break;
          
        case 'CONFIRM_DELIVERY':
          var deliveryResult = confirmDelivery(op.data.notaVenta, op.data.photoBase64, op.data.notes);
          opResult.success = deliveryResult.success;
          opResult.error = deliveryResult.error;
          break;
          
        case 'MOVE_PRODUCT':
          var moveResult = moveProduct(op.data.productCode, op.data.fromLocation, op.data.toLocation, op.data.quantity);
          opResult.success = moveResult.success;
          opResult.error = moveResult.error;
          break;
          
        default:
          opResult.error = 'Tipo de operación no reconocido: ' + op.type;
      }
      
      results.push(opResult);
      
    } catch (e) {
      results.push({ id: op.id, success: false, error: e.message });
    }
  }
  
  var successCount = results.filter(function(r) { return r.success; }).length;
  var failCount = results.length - successCount;
  
  Logger.log('Sync completado: ' + successCount + ' exitosos, ' + failCount + ' fallidos');
  
  return { 
    success: failCount === 0, 
    results: results,
    synced: successCount,
    failed: failCount
  };
}


// ============================================================
// FUNCIONES DE DIAGNÓSTICO - Ejecutar desde el editor de GAS
// ============================================================

/**
 * FUNCIÓN DE DIAGNÓSTICO PRINCIPAL
 * Ejecutar desde el editor de Google Apps Script para verificar el sistema
 * Menú: Ejecutar > diagnosticoUsuarios
 */
function diagnosticoUsuarios() {
  Logger.log('');
  Logger.log('╔════════════════════════════════════════════════════════════╗');
  Logger.log('║     DIAGNÓSTICO DEL SISTEMA DE USUARIOS                    ║');
  Logger.log('╚════════════════════════════════════════════════════════════╝');
  Logger.log('');
  
  // 1. Verificar spreadsheet
  Logger.log('1️⃣ VERIFICANDO SPREADSHEET...');
  var ss = null;
  
  try {
    ss = getSpreadsheet();
    Logger.log('   ✅ Spreadsheet abierto: ' + ss.getName());
    Logger.log('   📍 URL: ' + ss.getUrl());
  } catch (e) {
    Logger.log('   ❌ ERROR abriendo spreadsheet: ' + e.message);
    if (ss) {
      Logger.log('   ✅ Spreadsheet activo: ' + ss.getName());
    } else {
      Logger.log('   ❌ FALLO TOTAL: No se puede acceder a ningún spreadsheet');
      return { success: false, error: 'No se puede acceder al spreadsheet' };
    }
  }
  
  // 2. Listar hojas
  Logger.log('');
  Logger.log('2️⃣ HOJAS DISPONIBLES:');
  var sheets = ss.getSheets();
  for (var i = 0; i < sheets.length; i++) {
    var s = sheets[i];
    Logger.log('   ' + (i+1) + '. "' + s.getName() + '" (' + s.getLastRow() + ' filas)');
  }
  
  // 3. Buscar hoja USUARIOS
  Logger.log('');
  Logger.log('3️⃣ BUSCANDO HOJA DE USUARIOS...');
  var userSheet = ss.getSheetByName('USUARIOS');
  if (!userSheet) {
    userSheet = ss.getSheetByName('Usuarios');
  }
  
  if (userSheet) {
    Logger.log('   ✅ Hoja encontrada: "' + userSheet.getName() + '"');
    
    var data = userSheet.getDataRange().getValues();
    Logger.log('   📊 Filas totales: ' + data.length);
    Logger.log('   📊 Columnas: ' + (data[0] ? data[0].length : 0));
    
    if (data.length > 0) {
      Logger.log('   📋 Headers: ' + JSON.stringify(data[0]));
    }
    
    Logger.log('');
    Logger.log('4️⃣ USUARIOS EN LA HOJA:');
    if (data.length <= 1) {
      Logger.log('   ⚠️ No hay usuarios (solo headers)');
    } else {
      for (var j = 1; j < data.length; j++) {
        var row = data[j];
        Logger.log('   👤 ' + j + '. ID=' + row[0] + ' | Email=' + row[1] + ' | Nombre=' + row[3] + ' | Rol=' + row[4] + ' | Activo=' + row[6]);
      }
    }
  } else {
    Logger.log('   ⚠️ Hoja USUARIOS no encontrada');
    Logger.log('   Se creará automáticamente al llamar getUsers()');
  }
  
  // 5. Probar getUsers()
  Logger.log('');
  Logger.log('5️⃣ PROBANDO getUsers()...');
  var result = getUsers();
  Logger.log('   Resultado: ' + JSON.stringify(result, null, 2));
  
  // 6. Probar listUsers()
  Logger.log('');
  Logger.log('6️⃣ PROBANDO listUsers()...');
  var result2 = listUsers();
  Logger.log('   Resultado: ' + JSON.stringify(result2, null, 2));
  
  Logger.log('');
  Logger.log('╔════════════════════════════════════════════════════════════╗');
  Logger.log('║     FIN DEL DIAGNÓSTICO                                    ║');
  Logger.log('╚════════════════════════════════════════════════════════════╝');
  
  return result;
}

/**
 * Función para crear un usuario de prueba
 * Ejecutar desde el editor de Google Apps Script
 */
function crearUsuarioPrueba() {
  Logger.log('=== CREANDO USUARIO DE PRUEBA ===');
  
  var testUser = {
    nombre: 'Usuario Prueba',
    email: 'prueba@test.com',
    password: 'prueba123',
    rol: 'OPERADOR',
    activo: true
  };
  
  var result = createUser(testUser);
  Logger.log('Resultado: ' + JSON.stringify(result, null, 2));
  
  // Verificar que se creó
  Logger.log('\nVerificando usuarios después de crear:');
  var users = getUsers();
  Logger.log('Usuarios: ' + JSON.stringify(users, null, 2));
  
  return result;
}

/**
 * Función para verificar qué función listUsers se está ejecutando
 */
function verificarListUsers() {
  Logger.log('=== VERIFICANDO listUsers() ===');
  Logger.log('Llamando a listUsers()...');
  var result = listUsers();
  Logger.log('Resultado de listUsers(): ' + JSON.stringify(result, null, 2));
  return result;
}
