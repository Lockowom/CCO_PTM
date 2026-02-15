/**
 * Reports.gs
 * Módulo de generación de reportes y análisis
 * 
 * Genera reportes detallados, calcula KPIs y proporciona análisis
 * de desempeño del sistema logístico
 */

/**
 * Genera un reporte según el tipo especificado
 * @param {string} reportType - Tipo de reporte
 * @param {Object} dateRange - Rango de fechas {desde, hasta}
 * @returns {Object} Datos del reporte
 */
function generateReport(reportType, dateRange) {
  try {
    let reportData;
    
    switch(reportType) {
      case 'orders':
        reportData = generateOrdersReport(dateRange);
        break;
      case 'inventory':
        reportData = generateInventoryReport();
        break;
      case 'receptions':
        reportData = generateReceptionsReport(dateRange);
        break;
      case 'dispatches':
        reportData = generateDispatchesReport(dateRange);
        break;
      case 'deliveries':
        reportData = generateDeliveriesReport(dateRange);
        break;
      case 'performance':
        reportData = generatePerformanceReport(dateRange);
        break;
      default:
        throw new Error('Tipo de reporte no válido: ' + reportType);
    }
    
    return {
      success: true,
      reportType: reportType,
      dateRange: dateRange,
      generatedAt: new Date().toISOString(),
      data: reportData
    };
    
  } catch (error) {
    Logger.log('Error en generateReport: ' + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Genera reporte de órdenes
 * @param {Object} dateRange - Rango de fechas
 * @returns {Object} Datos del reporte
 */
function generateOrdersReport(dateRange) {
  try {
    let orders = getAllRows('Órdenes');
    
    // Filtrar por rango de fechas si se proporciona
    if (dateRange && dateRange.desde) {
      const fechaDesde = new Date(dateRange.desde);
      orders = orders.filter(o => new Date(o.data.FechaCreacion) >= fechaDesde);
    }
    
    if (dateRange && dateRange.hasta) {
      const fechaHasta = new Date(dateRange.hasta);
      orders = orders.filter(o => new Date(o.data.FechaCreacion) <= fechaHasta);
    }
    
    // Calcular estadísticas
    const stats = {
      total: orders.length,
      porEstado: {},
      porCliente: {},
      totalMonto: 0
    };
    
    orders.forEach(order => {
      // Contar por estado
      const estado = order.data.Estado;
      stats.porEstado[estado] = (stats.porEstado[estado] || 0) + 1;
      
      // Contar por cliente
      const cliente = order.data.Cliente;
      stats.porCliente[cliente] = (stats.porCliente[cliente] || 0) + 1;
      
      // Sumar montos
      stats.totalMonto += parseFloat(order.data.Total) || 0;
    });
    
    // Formatear órdenes para el reporte
    const formattedOrders = orders.map(order => ({
      numeroOrden: order.data.NumeroOrden,
      cliente: order.data.Cliente,
      estado: order.data.Estado,
      fechaCreacion: order.data.FechaCreacion,
      total: order.data.Total
    }));
    
    return {
      summary: stats,
      orders: formattedOrders
    };
    
  } catch (error) {
    Logger.log('Error en generateOrdersReport: ' + error.message);
    throw error;
  }
}

/**
 * Genera reporte de inventario
 * @returns {Object} Datos del reporte
 */
function generateInventoryReport() {
  try {
    const inventoryResult = getInventory();
    
    if (!inventoryResult.success) {
      throw new Error('Error al obtener inventario');
    }
    
    const products = inventoryResult.products;
    
    // Calcular estadísticas
    const stats = {
      totalProductos: products.length,
      stockTotal: 0,
      stockReservado: 0,
      stockDisponible: 0,
      productosStockBajo: 0,
      productosAgotados: 0,
      valorTotal: 0
    };
    
    products.forEach(product => {
      stats.stockTotal += product.cantidad;
      stats.stockReservado += product.cantidadReservada;
      stats.stockDisponible += product.cantidadDisponible;
      
      if (product.cantidadDisponible <= 0) {
        stats.productosAgotados++;
      } else if (product.stockBajo) {
        stats.productosStockBajo++;
      }
    });
    
    // Productos con stock bajo
    const lowStockProducts = products.filter(p => p.stockBajo && p.cantidadDisponible > 0);
    
    // Productos agotados
    const outOfStockProducts = products.filter(p => p.cantidadDisponible <= 0);
    
    return {
      summary: stats,
      lowStockProducts: lowStockProducts,
      outOfStockProducts: outOfStockProducts,
      allProducts: products
    };
    
  } catch (error) {
    Logger.log('Error en generateInventoryReport: ' + error.message);
    throw error;
  }
}

/**
 * Genera reporte de recepciones
 * @param {Object} dateRange - Rango de fechas
 * @returns {Object} Datos del reporte
 */
function generateReceptionsReport(dateRange) {
  try {
    const receptionResult = getReceptionHistory(dateRange);
    
    if (!receptionResult.success) {
      throw new Error('Error al obtener recepciones');
    }
    
    const receptions = receptionResult.receptions;
    
    // Calcular estadísticas
    const stats = {
      total: receptions.length,
      verificadas: 0,
      pendientes: 0,
      canceladas: 0,
      porProveedor: {},
      totalProductosRecibidos: 0
    };
    
    receptions.forEach(reception => {
      // Contar por estado
      if (reception.estado === 'VERIFICADA') stats.verificadas++;
      else if (reception.estado === 'PENDIENTE') stats.pendientes++;
      else if (reception.estado === 'CANCELADA') stats.canceladas++;
      
      // Contar por proveedor
      const proveedor = reception.proveedor;
      stats.porProveedor[proveedor] = (stats.porProveedor[proveedor] || 0) + 1;
      
      // Contar productos recibidos (solo verificadas)
      if (reception.estado === 'VERIFICADA') {
        reception.productos.forEach(p => {
          stats.totalProductosRecibidos += p.cantidad;
        });
      }
    });
    
    return {
      summary: stats,
      receptions: receptions
    };
    
  } catch (error) {
    Logger.log('Error en generateReceptionsReport: ' + error.message);
    throw error;
  }
}

/**
 * Genera reporte de despachos
 * @param {Object} dateRange - Rango de fechas
 * @returns {Object} Datos del reporte
 */
function generateDispatchesReport(dateRange) {
  try {
    let dispatches = getAllRows('Despachos');
    
    // Filtrar por rango de fechas
    if (dateRange && dateRange.desde) {
      const fechaDesde = new Date(dateRange.desde);
      dispatches = dispatches.filter(d => new Date(d.data.FechaDespacho) >= fechaDesde);
    }
    
    if (dateRange && dateRange.hasta) {
      const fechaHasta = new Date(dateRange.hasta);
      dispatches = dispatches.filter(d => new Date(d.data.FechaDespacho) <= fechaHasta);
    }
    
    // Calcular estadísticas
    const stats = {
      total: dispatches.length,
      porEstado: {},
      porTransportista: {}
    };
    
    dispatches.forEach(dispatch => {
      // Contar por estado
      const estado = dispatch.data.Estado;
      stats.porEstado[estado] = (stats.porEstado[estado] || 0) + 1;
      
      // Contar por transportista
      const transportista = dispatch.data.Transportista || 'Sin asignar';
      stats.porTransportista[transportista] = (stats.porTransportista[transportista] || 0) + 1;
    });
    
    // Formatear despachos
    const formattedDispatches = dispatches.map(dispatch => {
      const orderResult = getOrderById(dispatch.data.OrdenID);
      return {
        codigoSeguimiento: dispatch.data.CodigoSeguimiento,
        numeroOrden: orderResult.success ? orderResult.order.numeroOrden : '',
        cliente: orderResult.success ? orderResult.order.cliente : '',
        transportista: dispatch.data.Transportista,
        estado: dispatch.data.Estado,
        fechaDespacho: dispatch.data.FechaDespacho,
        destino: dispatch.data.Destino
      };
    });
    
    return {
      summary: stats,
      dispatches: formattedDispatches
    };
    
  } catch (error) {
    Logger.log('Error en generateDispatchesReport: ' + error.message);
    throw error;
  }
}

/**
 * Genera reporte de entregas
 * @param {Object} dateRange - Rango de fechas
 * @returns {Object} Datos del reporte
 */
function generateDeliveriesReport(dateRange) {
  try {
    const deliveryResult = getDeliveryHistory(dateRange);
    
    if (!deliveryResult.success) {
      throw new Error('Error al obtener entregas');
    }
    
    const deliveries = deliveryResult.deliveries;
    
    // Calcular estadísticas
    const stats = {
      total: deliveries.length,
      entregadas: 0,
      pendientes: 0,
      rechazadas: 0,
      reprogramadas: 0,
      tasaExito: 0
    };
    
    deliveries.forEach(delivery => {
      if (delivery.estado === 'ENTREGADA') stats.entregadas++;
      else if (delivery.estado === 'PENDIENTE') stats.pendientes++;
      else if (delivery.estado === 'RECHAZADA') stats.rechazadas++;
      else if (delivery.estado === 'REPROGRAMADA') stats.reprogramadas++;
    });
    
    // Calcular tasa de éxito
    if (stats.total > 0) {
      stats.tasaExito = Math.round((stats.entregadas / stats.total) * 100);
    }
    
    return {
      summary: stats,
      deliveries: deliveries
    };
    
  } catch (error) {
    Logger.log('Error en generateDeliveriesReport: ' + error.message);
    throw error;
  }
}

/**
 * Genera reporte de desempeño general
 * @param {Object} dateRange - Rango de fechas
 * @returns {Object} Datos del reporte
 */
function generatePerformanceReport(dateRange) {
  try {
    // Obtener métricas de todos los módulos
    const ordersReport = generateOrdersReport(dateRange);
    const inventoryReport = generateInventoryReport();
    const receptionsReport = generateReceptionsReport(dateRange);
    const dispatchesReport = generateDispatchesReport(dateRange);
    const deliveriesReport = generateDeliveriesReport(dateRange);
    
    // Calcular tiempos promedio
    const avgTimes = getAverageProcessingTime();
    
    // Calcular KPIs
    const kpis = calculateKPIs();
    
    return {
      kpis: kpis,
      averageTimes: avgTimes.success ? avgTimes.times : {},
      orders: ordersReport.summary,
      inventory: inventoryReport.summary,
      receptions: receptionsReport.summary,
      dispatches: dispatchesReport.summary,
      deliveries: deliveriesReport.summary
    };
    
  } catch (error) {
    Logger.log('Error en generatePerformanceReport: ' + error.message);
    throw error;
  }
}

/**
 * Calcula KPIs del sistema
 * @returns {Object} KPIs calculados
 */
function calculateKPIs() {
  try {
    const orderStats = getOrderStats();
    const inventoryStats = getInventoryStats();
    const deliveryStats = getDeliveryStats();
    const avgTimes = getAverageProcessingTime();
    
    // KPI: Tasa de cumplimiento de entregas
    const deliveryRate = deliveryStats.success && deliveryStats.stats.total > 0 ?
      Math.round((deliveryStats.stats.entregadas / deliveryStats.stats.total) * 100) : 0;
    
    // KPI: Eficiencia de inventario (disponible vs total)
    const inventoryEfficiency = inventoryStats.success && inventoryStats.stats.totalStock > 0 ?
      Math.round((inventoryStats.stats.totalAvailable / inventoryStats.stats.totalStock) * 100) : 0;
    
    // KPI: Órdenes completadas vs total
    const orderCompletionRate = orderStats.success && orderStats.stats.total > 0 ?
      Math.round((orderStats.stats.entregadas / orderStats.stats.total) * 100) : 0;
    
    // KPI: Tiempo promedio de entrega (en días)
    const avgDeliveryDays = avgTimes.success ?
      Math.round((avgTimes.times.avgCreationToDelivery / 24) * 10) / 10 : 0;
    
    return {
      deliverySuccessRate: deliveryRate,
      inventoryEfficiency: inventoryEfficiency,
      orderCompletionRate: orderCompletionRate,
      avgDeliveryDays: avgDeliveryDays,
      totalOrders: orderStats.success ? orderStats.stats.total : 0,
      activeOrders: orderStats.success ? 
        (orderStats.stats.total - orderStats.stats.entregadas - orderStats.stats.canceladas) : 0,
      lowStockProducts: inventoryStats.success ? inventoryStats.stats.lowStockCount : 0
    };
    
  } catch (error) {
    Logger.log('Error en calculateKPIs: ' + error.message);
    return {};
  }
}

/**
 * Obtiene métricas de desempeño
 * @returns {Object} Métricas de desempeño
 */
function getPerformanceMetrics() {
  try {
    const kpis = calculateKPIs();
    const avgTimes = getAverageProcessingTime();
    
    return {
      success: true,
      kpis: kpis,
      processingTimes: avgTimes.success ? avgTimes.times : {},
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    Logger.log('Error en getPerformanceMetrics: ' + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Exporta datos de reporte a formato CSV
 * @param {Array} data - Datos a exportar
 * @param {Array} headers - Headers de las columnas
 * @returns {string} Datos en formato CSV
 */
function exportToCSV(data, headers) {
  try {
    let csv = headers.join(',') + '\n';
    
    data.forEach(row => {
      const values = headers.map(header => {
        const value = row[header] || '';
        // Escapar comillas y comas
        return '"' + String(value).replace(/"/g, '""') + '"';
      });
      csv += values.join(',') + '\n';
    });
    
    return csv;
    
  } catch (error) {
    Logger.log('Error en exportToCSV: ' + error.message);
    throw error;
  }
}

/**
 * Genera reporte de tendencias (últimos 30 días)
 * @returns {Object} Datos de tendencias
 */
function generateTrendsReport() {
  try {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
    
    const dateRange = {
      desde: thirtyDaysAgo.toISOString(),
      hasta: today.toISOString()
    };
    
    // Obtener órdenes del período
    let orders = getAllRows('Órdenes');
    orders = orders.filter(o => {
      const fecha = new Date(o.data.FechaCreacion);
      return fecha >= thirtyDaysAgo && fecha <= today;
    });
    
    // Agrupar por día
    const ordersByDay = {};
    orders.forEach(order => {
      const fecha = new Date(order.data.FechaCreacion);
      const dia = fecha.toISOString().split('T')[0];
      ordersByDay[dia] = (ordersByDay[dia] || 0) + 1;
    });
    
    // Obtener entregas del período
    let deliveries = getAllRows('Entregas');
    deliveries = deliveries.filter(d => {
      const fecha = new Date(d.data.FechaEntrega);
      return fecha >= thirtyDaysAgo && fecha <= today && d.data.Estado === 'ENTREGADA';
    });
    
    // Agrupar entregas por día
    const deliveriesByDay = {};
    deliveries.forEach(delivery => {
      const fecha = new Date(delivery.data.FechaEntrega);
      const dia = fecha.toISOString().split('T')[0];
      deliveriesByDay[dia] = (deliveriesByDay[dia] || 0) + 1;
    });
    
    return {
      success: true,
      period: '30 días',
      dateRange: dateRange,
      ordersByDay: ordersByDay,
      deliveriesByDay: deliveriesByDay,
      totalOrders: orders.length,
      totalDeliveries: deliveries.length
    };
    
  } catch (error) {
    Logger.log('Error en generateTrendsReport: ' + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}


/**
 * Obtiene datos de KPIs para el frontend
 * @returns {Object} - {success, kpis}
 */
function getKPIsData() {
  try {
    var kpis = calculateKPIs();
    var metrics = getPerformanceMetrics();
    
    return {
      success: true,
      kpis: kpis,
      metrics: metrics.success ? metrics : {},
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    Logger.log('Error en getKPIsData: ' + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Alias para loadKPIs - compatibilidad con frontend
 * @returns {Object} - {success, kpis}
 */
function loadKPIs() {
  return getKPIsData();
}
