/**
 * Dashboard.gs
 * Módulo de dashboard y métricas en tiempo real
 * 
 * Lee datos de múltiples hojas:
 * - N.V DIARIAS: Notas de venta y estados
 * - UBICACIONES: Stock por ubicación
 * - LAYOUT: Estados de ubicaciones
 * - INGRESO: Productos ingresados
 * - PICKING_LOG: Historial de picking
 * - PACKING_LOG: Historial de packing
 * - DELIVERY_LOG: Historial de entregas
 */

/**
 * Obtiene todas las métricas del dashboard en tiempo real
 * @returns {Object} Objeto con todas las métricas
 */
function getDashboardMetrics() {
  try {
    Logger.log('=== getDashboardMetrics INICIO ===');
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // 1. Estadísticas de Órdenes desde N.V DIARIAS
    var orderStats = getOrderStatsFromNV(ss);
    
    // 2. Estadísticas de Inventario desde UBICACIONES
    var inventoryStats = getInventoryStatsFromUbicaciones(ss);
    
    // 3. Estadísticas de Layout desde LAYOUT
    var layoutStats = getLayoutStatsFromSheet(ss);
    
    // 4. Estadísticas de Despachos
    var dispatchStats = {
      total: orderStats.despachadas + orderStats.entregadas,
      pendientes: orderStats.listoDespacho,
      enTransito: orderStats.enTransito,
      entregados: orderStats.entregadas
    };
    
    // 5. Generar alertas basadas en los datos
    var alerts = generateAlerts(orderStats, inventoryStats, layoutStats);
    
    // 6. Actividad reciente
    var recentActivity = getRecentActivityFromSheets(ss);
    
    Logger.log('=== getDashboardMetrics FIN ===');
    
    return {
      success: true,
      timestamp: new Date().toISOString(),
      orders: orderStats,
      inventory: inventoryStats,
      layout: layoutStats,
      dispatches: dispatchStats,
      deliveries: { total: orderStats.entregadas, entregadas: orderStats.entregadas },
      alerts: alerts,
      recentActivity: recentActivity
    };
    
  } catch (error) {
    Logger.log('Error en getDashboardMetrics: ' + error.message);
    return {
      success: true,
      timestamp: new Date().toISOString(),
      orders: { total: 0, creadas: 0, picking: 0, packing: 0, despachadas: 0, enTransito: 0, entregadas: 0, canceladas: 0 },
      inventory: { totalProducts: 0, totalStock: 0, totalUbicaciones: 0, ubicacionesOcupadas: 0 },
      layout: { totalUbicaciones: 0, disponibles: 0, noDisponibles: 0, ocupadas: 0 },
      dispatches: { total: 0, pendientes: 0, enTransito: 0 },
      deliveries: { total: 0, entregadas: 0 },
      alerts: [],
      recentActivity: []
    };
  }
}

/**
 * Obtiene estadísticas de órdenes desde N.V DIARIAS
 */
function getOrderStatsFromNV(ss) {
  var stats = {
    total: 0,
    creadas: 0,
    pendientes: 0,
    aprobadas: 0,
    pendientePicking: 0,
    picking: 0,
    packing: 0,
    listoDespacho: 0,
    despachadas: 0,
    enTransito: 0,
    entregadas: 0,
    canceladas: 0
  };
  
  var sheet = ss.getSheetByName('N.V DIARIAS');
  if (!sheet || sheet.getLastRow() <= 1) return stats;
  
  var lastRow = sheet.getLastRow();
  var data = sheet.getRange(2, 1, lastRow - 1, 12).getValues();
  var nvContadas = {};
  
  for (var i = 0; i < data.length; i++) {
    var nVenta = String(data[i][1] || '').trim();
    if (!nVenta || nvContadas[nVenta]) continue;
    
    nvContadas[nVenta] = true;
    stats.total++;
    
    var estadoRaw = String(data[i][2] || '').trim();
    var estadoUpper = estadoRaw.toUpperCase().replace(/\s+/g, '_');
    
    if (estadoUpper === 'PENDIENTE' || estadoRaw === 'Pendiente') {
      stats.pendientes++;
      stats.creadas++;
    } else if (estadoUpper === 'APROBADA' || estadoRaw === 'Aprobada') {
      stats.aprobadas++;
    } else if (estadoUpper === 'PENDIENTE_PICKING' || estadoRaw === 'Pendiente Picking') {
      stats.pendientePicking++;
      stats.picking++;
    } else if (estadoUpper === 'EN_PICKING' || estadoRaw === 'En Picking') {
      stats.picking++;
    } else if (estadoUpper === 'PK' || estadoUpper === 'PACKING' || estadoRaw === 'Packing') {
      stats.packing++;
    } else if (estadoUpper === 'LISTO_DESPACHO' || estadoRaw === 'Listo Despacho') {
      stats.listoDespacho++;
    } else if (estadoUpper === 'DESPACHADO' || estadoRaw === 'Despachado') {
      stats.despachadas++;
    } else if (estadoUpper === 'EN_TRANSITO' || estadoRaw === 'En Transito') {
      stats.enTransito++;
    } else if (estadoUpper === 'ENTREGADO' || estadoRaw === 'Entregado') {
      stats.entregadas++;
    } else if (estadoUpper === 'NULA' || estadoRaw === 'Nula') {
      stats.canceladas++;
    }
  }
  
  Logger.log('OrderStats - Total N.V: ' + stats.total);
  return stats;
}

/**
 * Obtiene estadísticas de inventario desde UBICACIONES
 */
function getInventoryStatsFromUbicaciones(ss) {
  var stats = {
    totalProducts: 0,
    totalStock: 0,
    totalUbicaciones: 0,
    ubicacionesOcupadas: 0,
    ubicacionesVacias: 0,
    porcentajeOcupacion: 0,
    productosUnicos: 0
  };
  
  var sheet = ss.getSheetByName('UBICACIONES');
  if (!sheet || sheet.getLastRow() <= 1) {
    // Fallback a INGRESO si no existe UBICACIONES
    return getInventoryStatsFromIngreso(ss);
  }
  
  var lastRow = sheet.getLastRow();
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var data = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues();
  
  // Buscar columnas
  var colUbicacion = -1, colCantidad = -1, colCodigo = -1;
  for (var h = 0; h < headers.length; h++) {
    var header = String(headers[h] || '').trim().toLowerCase();
    if (header === 'ubicacion' || header === 'ubicación') colUbicacion = h;
    if (header === 'cantidad' || header === 'stock' || header === 'qty') colCantidad = h;
    if (header === 'codigo' || header === 'código' || header === 'sku') colCodigo = h;
  }
  
  if (colUbicacion === -1) colUbicacion = 0;
  if (colCantidad === -1) colCantidad = 1;
  if (colCodigo === -1) colCodigo = 2;
  
  var ubicacionesMap = {};
  var productosUnicos = {};
  var totalStock = 0;
  
  for (var i = 0; i < data.length; i++) {
    var ubicacion = String(data[i][colUbicacion] || '').trim().toUpperCase();
    var cantidad = Number(data[i][colCantidad]) || 0;
    var codigo = String(data[i][colCodigo] || '').trim();
    
    if (ubicacion) {
      if (!ubicacionesMap[ubicacion]) {
        ubicacionesMap[ubicacion] = 0;
      }
      ubicacionesMap[ubicacion] += cantidad;
      totalStock += cantidad;
    }
    
    if (codigo) {
      productosUnicos[codigo] = true;
    }
  }
  
  var ubicaciones = Object.keys(ubicacionesMap);
  var ocupadas = ubicaciones.filter(function(u) { return ubicacionesMap[u] > 0; }).length;
  
  stats.totalUbicaciones = ubicaciones.length;
  stats.ubicacionesOcupadas = ocupadas;
  stats.ubicacionesVacias = ubicaciones.length - ocupadas;
  stats.totalStock = totalStock;
  stats.productosUnicos = Object.keys(productosUnicos).length;
  stats.totalProducts = stats.productosUnicos;
  stats.porcentajeOcupacion = ubicaciones.length > 0 ? Math.round((ocupadas / ubicaciones.length) * 100) : 0;
  
  Logger.log('InventoryStats - Ubicaciones: ' + stats.totalUbicaciones + ', Stock: ' + stats.totalStock);
  return stats;
}

/**
 * Fallback: Obtiene estadísticas de inventario desde INGRESO
 */
function getInventoryStatsFromIngreso(ss) {
  var stats = {
    totalProducts: 0,
    totalStock: 0,
    totalUbicaciones: 0,
    ubicacionesOcupadas: 0,
    ubicacionesVacias: 0,
    porcentajeOcupacion: 0,
    productosUnicos: 0
  };
  
  var sheet = ss.getSheetByName('INGRESO');
  if (!sheet || sheet.getLastRow() <= 1) return stats;
  
  var lastRow = sheet.getLastRow();
  var data = sheet.getRange(2, 1, lastRow - 1, 13).getValues();
  
  var productosUnicos = {};
  var ubicacionesMap = {};
  var totalStock = 0;
  
  for (var i = 0; i < data.length; i++) {
    var ubicacion = String(data[i][2] || '').trim().toUpperCase();
    var codigo = String(data[i][3] || '').trim();
    var cantidad = Number(data[i][9]) || 0;
    
    if (codigo) productosUnicos[codigo] = true;
    if (ubicacion) {
      if (!ubicacionesMap[ubicacion]) ubicacionesMap[ubicacion] = 0;
      ubicacionesMap[ubicacion] += cantidad;
    }
    totalStock += cantidad;
  }
  
  var ubicaciones = Object.keys(ubicacionesMap);
  var ocupadas = ubicaciones.filter(function(u) { return ubicacionesMap[u] > 0; }).length;
  
  stats.totalProducts = Object.keys(productosUnicos).length;
  stats.productosUnicos = stats.totalProducts;
  stats.totalStock = totalStock;
  stats.totalUbicaciones = ubicaciones.length;
  stats.ubicacionesOcupadas = ocupadas;
  stats.ubicacionesVacias = ubicaciones.length - ocupadas;
  stats.porcentajeOcupacion = ubicaciones.length > 0 ? Math.round((ocupadas / ubicaciones.length) * 100) : 0;
  
  return stats;
}

/**
 * Obtiene estadísticas de layout desde LAYOUT
 */
function getLayoutStatsFromSheet(ss) {
  var stats = {
    totalUbicaciones: 0,
    disponibles: 0,
    noDisponibles: 0,
    ocupadas: 0,
    porcentajeDisponible: 0
  };
  
  var sheet = ss.getSheetByName('LAYOUT');
  if (!sheet || sheet.getLastRow() <= 1) return stats;
  
  var lastRow = sheet.getLastRow();
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var data = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues();
  
  // Buscar columna de estado
  var colEstado = -1;
  for (var h = 0; h < headers.length; h++) {
    var header = String(headers[h] || '').trim().toLowerCase();
    if (header === 'estado' || header === 'status') colEstado = h;
  }
  if (colEstado === -1) colEstado = 4;
  
  for (var i = 0; i < data.length; i++) {
    var estado = String(data[i][colEstado] || '').trim().toUpperCase();
    stats.totalUbicaciones++;
    
    if (estado === 'NO DISPONIBLE') {
      stats.noDisponibles++;
    } else if (estado === 'OCUPADO') {
      stats.ocupadas++;
    } else {
      stats.disponibles++;
    }
  }
  
  stats.porcentajeDisponible = stats.totalUbicaciones > 0 ? 
    Math.round((stats.disponibles / stats.totalUbicaciones) * 100) : 0;
  
  Logger.log('LayoutStats - Total: ' + stats.totalUbicaciones + ', Disponibles: ' + stats.disponibles);
  return stats;
}

/**
 * Genera alertas basadas en los datos
 */
function generateAlerts(orderStats, inventoryStats, layoutStats) {
  var alerts = [];
  
  // Alertas de órdenes
  if (orderStats.pendientePicking > 0) {
    alerts.push({
      type: 'info',
      icon: 'clipboard-list',
      title: 'Picking Pendiente',
      message: orderStats.pendientePicking + ' N.V esperando picking'
    });
  }
  
  if (orderStats.packing > 0) {
    alerts.push({
      type: 'warning',
      icon: 'box',
      title: 'En Packing',
      message: orderStats.packing + ' N.V en área de empaque'
    });
  }
  
  if (orderStats.listoDespacho > 0) {
    alerts.push({
      type: 'warning',
      icon: 'truck',
      title: 'Listo Despacho',
      message: orderStats.listoDespacho + ' N.V listas para despachar'
    });
  }
  
  if (orderStats.enTransito > 0) {
    alerts.push({
      type: 'info',
      icon: 'shipping-fast',
      title: 'En Tránsito',
      message: orderStats.enTransito + ' N.V en camino al cliente'
    });
  }
  
  // Alertas de inventario
  if (inventoryStats.porcentajeOcupacion > 90) {
    alerts.push({
      type: 'danger',
      icon: 'exclamation-triangle',
      title: 'Bodega Casi Llena',
      message: 'Ocupación al ' + inventoryStats.porcentajeOcupacion + '%'
    });
  }
  
  // Alertas de layout
  if (layoutStats.noDisponibles > 0) {
    alerts.push({
      type: 'warning',
      icon: 'ban',
      title: 'Ubicaciones No Disponibles',
      message: layoutStats.noDisponibles + ' ubicaciones bloqueadas'
    });
  }
  
  return alerts;
}

/**
 * Obtiene actividad reciente de múltiples hojas
 */
function getRecentActivityFromSheets(ss) {
  var activities = [];
  
  // Actividad de N.V DIARIAS
  var nvSheet = ss.getSheetByName('N.V DIARIAS');
  if (nvSheet && nvSheet.getLastRow() > 1) {
    var startRow = Math.max(2, nvSheet.getLastRow() - 9);
    var numRows = Math.min(10, nvSheet.getLastRow() - 1);
    var recentData = nvSheet.getRange(startRow, 1, numRows, 12).getValues();
    var nvVistas = {};
    
    for (var k = recentData.length - 1; k >= 0 && activities.length < 4; k--) {
      var nv = String(recentData[k][1] || '').trim();
      if (nv && !nvVistas[nv]) {
        nvVistas[nv] = true;
        activities.push({
          type: 'order',
          icon: 'file-alt',
          title: 'N.V ' + nv,
          description: 'Estado: ' + (recentData[k][2] || '-'),
          timestamp: recentData[k][0] || new Date()
        });
      }
    }
  }
  
  // Actividad de PICKING_LOG
  var pickingSheet = ss.getSheetByName('PICKING_LOG');
  if (pickingSheet && pickingSheet.getLastRow() > 1) {
    var pickingData = pickingSheet.getRange(Math.max(2, pickingSheet.getLastRow() - 2), 1, Math.min(3, pickingSheet.getLastRow() - 1), 6).getValues();
    for (var p = pickingData.length - 1; p >= 0 && activities.length < 6; p--) {
      if (pickingData[p][1]) {
        activities.push({
          type: 'picking',
          icon: 'hand-pointer',
          title: 'Picking ' + (pickingData[p][1] || ''),
          description: 'Usuario: ' + (pickingData[p][4] || '-'),
          timestamp: pickingData[p][0] || new Date()
        });
      }
    }
  }
  
  // Actividad de PACKING_LOG
  var packingSheet = ss.getSheetByName('PACKING_LOG');
  if (packingSheet && packingSheet.getLastRow() > 1) {
    var packingData = packingSheet.getRange(Math.max(2, packingSheet.getLastRow() - 2), 1, Math.min(3, packingSheet.getLastRow() - 1), 6).getValues();
    for (var pk = packingData.length - 1; pk >= 0 && activities.length < 8; pk--) {
      if (packingData[pk][1]) {
        activities.push({
          type: 'packing',
          icon: 'box',
          title: 'Packing ' + (packingData[pk][1] || ''),
          description: 'Usuario: ' + (packingData[pk][4] || '-'),
          timestamp: packingData[pk][0] || new Date()
        });
      }
    }
  }
  
  // Ordenar por timestamp
  activities.sort(function(a, b) {
    return new Date(b.timestamp) - new Date(a.timestamp);
  });
  
  return activities.slice(0, 6);
}

/**
 * Obtiene el conteo de órdenes por cada etapa del proceso
 * @returns {Object} Conteo por etapa
 */
function getOrdersByStage() {
  try {
    const stages = [
      { name: 'Recepción', status: 'PENDIENTE', sheet: 'Recepciones', field: 'Estado' },
      { name: 'Almacenamiento', count: 0 }, // Calculado del inventario
      { name: 'Órdenes Nuevas', status: 'CREADA', sheet: 'Órdenes', field: 'Estado' },
      { name: 'Picking', status: 'PICKING', sheet: 'Órdenes', field: 'Estado' },
      { name: 'Packing', status: 'PACKING', sheet: 'Órdenes', field: 'Estado' },
      { name: 'Listo Despacho', status: 'LISTA_DESPACHO', sheet: 'Órdenes', field: 'Estado' },
      { name: 'Despachado', status: 'DESPACHADA', sheet: 'Órdenes', field: 'Estado' },
      { name: 'En Tránsito', status: 'EN_TRANSITO', sheet: 'Órdenes', field: 'Estado' },
      { name: 'Entregado', status: 'ENTREGADA', sheet: 'Órdenes', field: 'Estado' }
    ];
    
    const results = stages.map(stage => {
      if (stage.name === 'Almacenamiento') {
        // Contar productos en inventario
        const inventoryStats = getInventoryStats();
        return {
          name: stage.name,
          count: inventoryStats.success ? inventoryStats.stats.totalProducts : 0,
          icon: 'warehouse'
        };
      } else {
        // Contar por estado
        const count = countRows(stage.sheet, { [stage.field]: stage.status });
        return {
          name: stage.name,
          count: count,
          status: stage.status,
          icon: getStageIcon(stage.name)
        };
      }
    });
    
    return {
      success: true,
      stages: results
    };
    
  } catch (error) {
    Logger.log('Error en getOrdersByStage: ' + error.message);
    return {
      success: false,
      error: error.message,
      stages: []
    };
  }
}

/**
 * Obtiene el icono apropiado para cada etapa
 * @param {string} stageName - Nombre de la etapa
 * @returns {string} Nombre del icono de Font Awesome
 */
function getStageIcon(stageName) {
  const icons = {
    'Recepción': 'truck-loading',
    'Almacenamiento': 'warehouse',
    'Órdenes Nuevas': 'file-alt',
    'Picking': 'hand-pointer',
    'Packing': 'box',
    'Listo Despacho': 'clipboard-check',
    'Despachado': 'shipping-fast',
    'En Tránsito': 'route',
    'Entregado': 'check-circle'
  };
  return icons[stageName] || 'circle';
}

/**
 * Calcula tiempos promedio de procesamiento
 * @returns {Object} Tiempos promedio por etapa
 */
function getAverageProcessingTime() {
  try {
    const allOrders = getAllRows('Órdenes');
    
    if (allOrders.length === 0) {
      return {
        success: true,
        times: {
          totalOrders: 0,
          avgCreationToDelivery: 0,
          avgCreationToDispatch: 0
        }
      };
    }
    
    let totalTimeToDelivery = 0;
    let deliveredCount = 0;
    let totalTimeToDispatch = 0;
    let dispatchedCount = 0;
    
    allOrders.forEach(order => {
      const creationDate = new Date(order.data.FechaCreacion);
      
      // Calcular tiempo hasta entrega
      if (order.data.Estado === 'ENTREGADA') {
        const deliveries = findRows('Entregas', { OrdenID: order.data.ID });
        if (deliveries.length > 0) {
          const deliveryDate = new Date(deliveries[0].data.FechaEntrega);
          const timeDiff = (deliveryDate - creationDate) / (1000 * 60 * 60); // horas
          totalTimeToDelivery += timeDiff;
          deliveredCount++;
        }
      }
      
      // Calcular tiempo hasta despacho
      if (order.data.Estado === 'DESPACHADA' || order.data.Estado === 'EN_TRANSITO' || order.data.Estado === 'ENTREGADA') {
        const dispatches = findRows('Despachos', { OrdenID: order.data.ID });
        if (dispatches.length > 0) {
          const dispatchDate = new Date(dispatches[0].data.FechaDespacho);
          const timeDiff = (dispatchDate - creationDate) / (1000 * 60 * 60); // horas
          totalTimeToDispatch += timeDiff;
          dispatchedCount++;
        }
      }
    });
    
    const avgToDelivery = deliveredCount > 0 ? (totalTimeToDelivery / deliveredCount) : 0;
    const avgToDispatch = dispatchedCount > 0 ? (totalTimeToDispatch / dispatchedCount) : 0;
    
    return {
      success: true,
      times: {
        totalOrders: allOrders.length,
        avgCreationToDelivery: Math.round(avgToDelivery * 10) / 10, // Redondear a 1 decimal
        avgCreationToDispatch: Math.round(avgToDispatch * 10) / 10,
        deliveredCount: deliveredCount,
        dispatchedCount: dispatchedCount
      }
    };
    
  } catch (error) {
    Logger.log('Error en getAverageProcessingTime: ' + error.message);
    return {
      success: false,
      error: error.message,
      times: {}
    };
  }
}

/**
 * Obtiene alertas del sistema
 * @returns {Array} Array de alertas
 */
function getAlerts() {
  try {
    const alerts = [];
    
    // Alertas de stock bajo
    const lowStockResult = checkLowStock();
    if (lowStockResult.success && lowStockResult.count > 0) {
      alerts.push({
        type: 'warning',
        category: 'inventory',
        title: 'Stock Bajo',
        message: lowStockResult.count + ' producto(s) con stock bajo el mínimo',
        count: lowStockResult.count,
        icon: 'exclamation-triangle',
        priority: 'high'
      });
    }
    
    // Alertas de recepciones pendientes
    const pendingReceptions = countRows('Recepciones', { Estado: 'PENDIENTE' });
    if (pendingReceptions > 0) {
      alerts.push({
        type: 'info',
        category: 'reception',
        title: 'Recepciones Pendientes',
        message: pendingReceptions + ' recepción(es) pendiente(s) de verificación',
        count: pendingReceptions,
        icon: 'inbox',
        priority: 'medium'
      });
    }
    
    // Alertas de guías pendientes
    const pendingGuides = countRows('Guias', { Estado: 'PENDIENTE' });
    if (pendingGuides > 0) {
      alerts.push({
        type: 'info',
        category: 'picking',
        title: 'Picking Pendiente',
        message: pendingGuides + ' guía(s) de picking pendiente(s)',
        count: pendingGuides,
        icon: 'clipboard-list',
        priority: 'medium'
      });
    }
    
    // Alertas de órdenes en packing
    const packingOrders = countRows('Órdenes', { Estado: 'PACKING' });
    if (packingOrders > 0) {
      alerts.push({
        type: 'info',
        category: 'packing',
        title: 'Packing Pendiente',
        message: packingOrders + ' orden(es) en proceso de empaque',
        count: packingOrders,
        icon: 'box',
        priority: 'medium'
      });
    }
    
    // Alertas de despachos pendientes
    const pendingDispatches = countRows('Despachos', { Estado: 'PENDIENTE' });
    if (pendingDispatches > 0) {
      alerts.push({
        type: 'warning',
        category: 'dispatch',
        title: 'Despachos Pendientes',
        message: pendingDispatches + ' despacho(s) pendiente(s) de envío',
        count: pendingDispatches,
        icon: 'truck',
        priority: 'high'
      });
    }
    
    // Alertas de entregas rechazadas
    const rejectedDeliveries = countRows('Entregas', { Estado: 'RECHAZADA' });
    if (rejectedDeliveries > 0) {
      alerts.push({
        type: 'danger',
        category: 'delivery',
        title: 'Entregas Rechazadas',
        message: rejectedDeliveries + ' entrega(s) rechazada(s) - requiere atención',
        count: rejectedDeliveries,
        icon: 'times-circle',
        priority: 'critical'
      });
    }
    
    // Ordenar por prioridad
    const priorityOrder = { 'critical': 0, 'high': 1, 'medium': 2, 'low': 3 };
    alerts.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    
    return {
      success: true,
      alerts: alerts,
      count: alerts.length
    };
    
  } catch (error) {
    Logger.log('Error en getAlerts: ' + error.message);
    return {
      success: false,
      error: error.message,
      alerts: []
    };
  }
}

/**
 * Obtiene actividad reciente del sistema
 * @param {number} limit - Número máximo de actividades a retornar
 * @returns {Array} Array de actividades recientes
 */
function getRecentActivity(limit) {
  try {
    const maxItems = limit || 10;
    const activities = [];
    
    // Obtener órdenes recientes
    const recentOrders = getAllRows('Órdenes')
      .sort((a, b) => new Date(b.data.FechaActualizacion) - new Date(a.data.FechaActualizacion))
      .slice(0, 5);
    
    recentOrders.forEach(order => {
      activities.push({
        type: 'order',
        icon: 'file-alt',
        title: 'Orden ' + order.data.NumeroOrden,
        description: 'Estado: ' + order.data.Estado,
        timestamp: order.data.FechaActualizacion,
        status: order.data.Estado
      });
    });
    
    // Obtener recepciones recientes
    const recentReceptions = getAllRows('Recepciones')
      .sort((a, b) => new Date(b.data.FechaRecepcion) - new Date(a.data.FechaRecepcion))
      .slice(0, 3);
    
    recentReceptions.forEach(reception => {
      activities.push({
        type: 'reception',
        icon: 'truck-loading',
        title: 'Recepción de ' + reception.data.Proveedor,
        description: 'Estado: ' + reception.data.Estado,
        timestamp: reception.data.FechaRecepcion,
        status: reception.data.Estado
      });
    });
    
    // Obtener despachos recientes
    const recentDispatches = getAllRows('Despachos')
      .sort((a, b) => new Date(b.data.FechaDespacho) - new Date(a.data.FechaDespacho))
      .slice(0, 3);
    
    recentDispatches.forEach(dispatch => {
      activities.push({
        type: 'dispatch',
        icon: 'shipping-fast',
        title: 'Despacho ' + dispatch.data.CodigoSeguimiento,
        description: 'Transportista: ' + (dispatch.data.Transportista || 'Sin asignar'),
        timestamp: dispatch.data.FechaDespacho,
        status: dispatch.data.Estado
      });
    });
    
    // Ordenar por timestamp descendente y limitar
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    return {
      success: true,
      activities: activities.slice(0, maxItems)
    };
    
  } catch (error) {
    Logger.log('Error en getRecentActivity: ' + error.message);
    return {
      success: false,
      error: error.message,
      activities: []
    };
  }
}

/**
 * Obtiene datos para gráficos del dashboard
 * @returns {Object} Datos para gráficos
 */
function getChartData() {
  try {
    // Gráfico de órdenes por estado
    const orderStats = getOrderStats();
    const orderChartData = {
      labels: ['Creadas', 'Picking', 'Packing', 'Despachadas', 'En Tránsito', 'Entregadas'],
      data: orderStats.success ? [
        orderStats.stats.creadas,
        orderStats.stats.picking,
        orderStats.stats.packing,
        orderStats.stats.despachadas,
        orderStats.stats.enTransito,
        orderStats.stats.entregadas
      ] : [0, 0, 0, 0, 0, 0]
    };
    
    // Gráfico de inventario
    const inventoryStats = getInventoryStats();
    const inventoryChartData = {
      labels: ['Disponible', 'Reservado', 'Stock Bajo'],
      data: inventoryStats.success ? [
        inventoryStats.stats.totalAvailable,
        inventoryStats.stats.totalReserved,
        inventoryStats.stats.lowStockCount
      ] : [0, 0, 0]
    };
    
    return {
      success: true,
      charts: {
        orders: orderChartData,
        inventory: inventoryChartData
      }
    };
    
  } catch (error) {
    Logger.log('Error en getChartData: ' + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Obtiene KPIs principales del sistema
 * @returns {Object} KPIs calculados
 */
function getKPIs() {
  try {
    const orderStats = getOrderStats();
    const inventoryStats = getInventoryStats();
    const avgTimes = getAverageProcessingTime();
    const deliveryStats = getDeliveryStats();
    
    // Calcular tasa de éxito de entregas
    const successRate = deliveryStats.success && deliveryStats.stats.total > 0 ?
      Math.round((deliveryStats.stats.entregadas / deliveryStats.stats.total) * 100) : 0;
    
    // Calcular órdenes activas (no entregadas ni canceladas)
    const activeOrders = orderStats.success ?
      (orderStats.stats.total - orderStats.stats.entregadas - orderStats.stats.canceladas) : 0;
    
    return {
      success: true,
      kpis: {
        totalOrders: orderStats.success ? orderStats.stats.total : 0,
        activeOrders: activeOrders,
        deliveredOrders: orderStats.success ? orderStats.stats.entregadas : 0,
        totalProducts: inventoryStats.success ? inventoryStats.stats.totalProducts : 0,
        lowStockProducts: inventoryStats.success ? inventoryStats.stats.lowStockCount : 0,
        avgDeliveryTime: avgTimes.success ? avgTimes.times.avgCreationToDelivery : 0,
        deliverySuccessRate: successRate,
        pendingDispatches: countRows('Despachos', { Estado: 'PENDIENTE' })
      }
    };
    
  } catch (error) {
    Logger.log('Error en getKPIs: ' + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}


