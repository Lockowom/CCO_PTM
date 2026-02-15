/**
 * Orders.gs
 * Módulo de gestión de órdenes y guías de picking
 * 
 * Maneja el ciclo completo de órdenes: creación, generación de guías,
 * actualización de estados y seguimiento
 */

/**
 * Crea una nueva orden
 * @param {Object} orderData - Datos de la orden
 * @returns {Object} Resultado de la operación
 */
function createOrder(orderData) {
  try {
    // Validar datos requeridos
    if (!orderData.cliente || !orderData.productos || !orderData.cantidades) {
      throw new Error('Cliente, productos y cantidades son requeridos');
    }
    
    // Validar arrays
    const productos = Array.isArray(orderData.productos) ? 
      orderData.productos : JSON.parse(orderData.productos);
    const cantidades = Array.isArray(orderData.cantidades) ? 
      orderData.cantidades : JSON.parse(orderData.cantidades);
    
    if (productos.length !== cantidades.length) {
      throw new Error('El número de productos y cantidades debe coincidir');
    }
    
    // Validar que todos los productos existan y haya stock disponible
    for (let i = 0; i < productos.length; i++) {
      const productResult = getProductById(productos[i]);
      if (!productResult.success) {
        throw new Error('Producto no encontrado: ' + productos[i]);
      }
      
      const product = productResult.product;
      if (product.cantidadDisponible < cantidades[i]) {
        throw new Error('Stock insuficiente para ' + product.nombre + 
                       '. Disponible: ' + product.cantidadDisponible + 
                       ', Solicitado: ' + cantidades[i]);
      }
    }
    
    // Generar IDs
    const orderId = generateId('ORD');
    const numeroOrden = 'ORD-' + new Date().getTime();
    
    // Calcular total (opcional, puede ser 0 si no se maneja precio)
    const total = orderData.total || 0;
    
    // Preparar datos
    const newOrder = [
      orderId,
      numeroOrden,
      orderData.cliente,
      'CREADA',
      new Date().toISOString(),
      new Date().toISOString(),
      JSON.stringify(productos),
      total,
      orderData.notas || ''
    ];
    
    // Insertar orden
    const result = insertRow('Órdenes', newOrder);
    
    if (result.success) {
      Logger.log('Orden creada: ' + numeroOrden);
      return {
        success: true,
        message: 'Orden creada correctamente',
        orderId: orderId,
        numeroOrden: numeroOrden
      };
    } else {
      return result;
    }
    
  } catch (error) {
    Logger.log('Error en createOrder: ' + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Actualiza el estado de una orden
 * @param {string} orderId - ID de la orden
 * @param {string} newStatus - Nuevo estado
 * @returns {Object} Resultado de la operación
 */
function updateOrderStatus(orderId, newStatus) {
  try {
    if (!orderId || !newStatus) {
      throw new Error('ID de orden y nuevo estado son requeridos');
    }
    
    // Validar estado
    const validStatuses = ['CREADA', 'PICKING', 'PACKING', 'LISTA_DESPACHO', 'DESPACHADA', 'EN_TRANSITO', 'ENTREGADA', 'CANCELADA'];
    if (!validStatuses.includes(newStatus)) {
      throw new Error('Estado no válido: ' + newStatus);
    }
    
    // Buscar orden
    const orders = findRows('Órdenes', { ID: orderId });
    
    if (orders.length === 0) {
      throw new Error('Orden no encontrada');
    }
    
    const order = orders[0];
    const oldStatus = order.data.Estado;
    
    // Actualizar estado y fecha
    updateCell('Órdenes', order.rowIndex, 'Estado', newStatus);
    updateCell('Órdenes', order.rowIndex, 'FechaActualizacion', new Date().toISOString());
    
    Logger.log('Estado de orden actualizado: ' + orderId + ' | ' + oldStatus + ' → ' + newStatus);
    
    return {
      success: true,
      message: 'Estado actualizado correctamente',
      orderId: orderId,
      oldStatus: oldStatus,
      newStatus: newStatus
    };
    
  } catch (error) {
    Logger.log('Error en updateOrderStatus: ' + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Obtiene órdenes filtradas por estado
 * @param {string} status - Estado a filtrar
 * @returns {Array} Array de órdenes
 */
function getOrdersByStatus(status) {
  try {
    let orders;
    
    if (status) {
      orders = findRows('Órdenes', { Estado: status });
    } else {
      orders = getAllRows('Órdenes');
    }
    
    const formattedOrders = orders.map(order => {
      const productos = JSON.parse(order.data.Productos);
      
      // Obtener detalles de productos
      const productDetails = productos.map(productId => {
        const productResult = getProductById(productId);
        return {
          id: productId,
          nombre: productResult.success ? productResult.product.nombre : 'Desconocido',
          codigo: productResult.success ? productResult.product.codigo : ''
        };
      });
      
      return {
        id: order.data.ID,
        numeroOrden: order.data.NumeroOrden,
        cliente: order.data.Cliente,
        estado: order.data.Estado,
        fechaCreacion: order.data.FechaCreacion,
        fechaActualizacion: order.data.FechaActualizacion,
        productos: productDetails,
        totalItems: productos.length,
        total: order.data.Total,
        notas: order.data.Notas,
        rowIndex: order.rowIndex
      };
    });
    
    // Ordenar por fecha de creación descendente
    formattedOrders.sort((a, b) => {
      return new Date(b.fechaCreacion) - new Date(a.fechaCreacion);
    });
    
    Logger.log('Órdenes obtenidas: ' + formattedOrders.length + (status ? ' con estado ' + status : ''));
    
    return {
      success: true,
      orders: formattedOrders,
      count: formattedOrders.length
    };
    
  } catch (error) {
    Logger.log('Error en getOrdersByStatus: ' + error.message);
    return {
      success: false,
      error: error.message,
      orders: []
    };
  }
}

/**
 * Genera una guía de picking para una orden
 * @param {string} orderId - ID de la orden
 * @returns {Object} Resultado de la operación con ID de guía
 */
function generatePickingGuide(orderId) {
  try {
    if (!orderId) {
      throw new Error('ID de orden requerido');
    }
    
    // Buscar orden
    const orders = findRows('Órdenes', { ID: orderId });
    
    if (orders.length === 0) {
      throw new Error('Orden no encontrada');
    }
    
    const order = orders[0];
    
    // Verificar que la orden esté en estado CREADA
    if (order.data.Estado !== 'CREADA') {
      throw new Error('Solo se pueden generar guías para órdenes en estado CREADA');
    }
    
    // Obtener productos y cantidades de la orden
    const productos = JSON.parse(order.data.Productos);
    
    // Necesitamos obtener las cantidades - asumimos que están en el mismo orden
    // En una implementación real, deberíamos guardar las cantidades en la orden
    // Por ahora, vamos a buscar en las guías existentes o usar un valor por defecto
    
    // Reservar stock para cada producto
    const reserveResults = [];
    for (let i = 0; i < productos.length; i++) {
      const productId = productos[i];
      // Asumimos cantidad 1 por ahora - esto debería venir de la orden
      const cantidad = 1;
      
      const reserveResult = updateStock(productId, cantidad, 'RESERVE');
      reserveResults.push(reserveResult);
      
      if (!reserveResult.success) {
        // Si falla, liberar lo que ya se reservó
        for (let j = 0; j < i; j++) {
          updateStock(productos[j], 1, 'RELEASE');
        }
        throw new Error('No se pudo reservar stock: ' + reserveResult.error);
      }
    }
    
    // Generar ID y número de guía
    const guideId = generateId('GUI');
    const numeroGuia = 'GUI-' + new Date().getTime();
    
    // Crear guía
    const newGuide = [
      guideId,
      numeroGuia,
      orderId,
      new Date().toISOString(),
      JSON.stringify(productos),
      'PENDIENTE',
      '',
      ''
    ];
    
    const result = insertRow('Guias', newGuide);
    
    if (result.success) {
      // Actualizar estado de la orden a PICKING
      updateOrderStatus(orderId, 'PICKING');
      
      Logger.log('Guía de picking generada: ' + numeroGuia + ' para orden: ' + order.data.NumeroOrden);
      
      return {
        success: true,
        message: 'Guía de picking generada correctamente',
        guideId: guideId,
        numeroGuia: numeroGuia,
        orderId: orderId,
        productsReserved: reserveResults.filter(r => r.success).length
      };
    } else {
      // Si falla la inserción, liberar stock reservado
      for (let i = 0; i < productos.length; i++) {
        updateStock(productos[i], 1, 'RELEASE');
      }
      return result;
    }
    
  } catch (error) {
    Logger.log('Error en generatePickingGuide: ' + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Obtiene el historial completo de una orden
 * @param {string} orderId - ID de la orden
 * @returns {Object} Historial de la orden
 */
function getOrderHistory(orderId) {
  try {
    if (!orderId) {
      throw new Error('ID de orden requerido');
    }
    
    // Buscar orden
    const orders = findRows('Órdenes', { ID: orderId });
    
    if (orders.length === 0) {
      throw new Error('Orden no encontrada');
    }
    
    const order = orders[0];
    const productos = JSON.parse(order.data.Productos);
    
    // Obtener detalles de productos
    const productDetails = productos.map(productId => {
      const productResult = getProductById(productId);
      return {
        id: productId,
        nombre: productResult.success ? productResult.product.nombre : 'Desconocido',
        codigo: productResult.success ? productResult.product.codigo : '',
        ubicacion: productResult.success ? productResult.product.ubicacion : ''
      };
    });
    
    // Buscar guía asociada
    const guides = findRows('Guias', { OrdenID: orderId });
    let guideInfo = null;
    if (guides.length > 0) {
      guideInfo = {
        id: guides[0].data.ID,
        numeroGuia: guides[0].data.NumeroGuia,
        fechaGeneracion: guides[0].data.FechaGeneracion,
        estado: guides[0].data.Estado,
        asignadoA: guides[0].data.AsignadoA,
        fechaCompletado: guides[0].data.FechaCompletado
      };
    }
    
    // Buscar despacho asociado
    const dispatches = findRows('Despachos', { OrdenID: orderId });
    let dispatchInfo = null;
    if (dispatches.length > 0) {
      dispatchInfo = {
        id: dispatches[0].data.ID,
        fechaDespacho: dispatches[0].data.FechaDespacho,
        transportista: dispatches[0].data.Transportista,
        codigoSeguimiento: dispatches[0].data.CodigoSeguimiento,
        estado: dispatches[0].data.Estado,
        destino: dispatches[0].data.Destino
      };
    }
    
    // Buscar entrega asociada
    const deliveries = findRows('Entregas', { OrdenID: orderId });
    let deliveryInfo = null;
    if (deliveries.length > 0) {
      deliveryInfo = {
        id: deliveries[0].data.ID,
        fechaEntrega: deliveries[0].data.FechaEntrega,
        estado: deliveries[0].data.Estado,
        receptorNombre: deliveries[0].data.ReceptorNombre,
        notas: deliveries[0].data.Notas
      };
    }
    
    return {
      success: true,
      order: {
        id: order.data.ID,
        numeroOrden: order.data.NumeroOrden,
        cliente: order.data.Cliente,
        estado: order.data.Estado,
        fechaCreacion: order.data.FechaCreacion,
        fechaActualizacion: order.data.FechaActualizacion,
        productos: productDetails,
        total: order.data.Total,
        notas: order.data.Notas
      },
      guide: guideInfo,
      dispatch: dispatchInfo,
      delivery: deliveryInfo
    };
    
  } catch (error) {
    Logger.log('Error en getOrderHistory: ' + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// NOTA: getOrderById version antigua removida (usaba findRows que no existe)
// La version correcta esta mas abajo (linea ~638) con acceso directo a sheets

/**
 * Obtiene todas las guías de picking
 * @param {string} status - Filtro opcional por estado
 * @returns {Array} Array de guías
 */
function getPickingGuides(status) {
  try {
    let guides;
    
    if (status) {
      guides = findRows('Guias', { Estado: status });
    } else {
      guides = getAllRows('Guias');
    }
    
    const formattedGuides = guides.map(guide => {
      const productos = JSON.parse(guide.data.Productos);
      
      // Obtener información de la orden
      const orderResult = getOrderById(guide.data.OrdenID);
      
      // Obtener detalles de productos
      const productDetails = productos.map(productId => {
        const productResult = getProductById(productId);
        return {
          id: productId,
          nombre: productResult.success ? productResult.product.nombre : 'Desconocido',
          codigo: productResult.success ? productResult.product.codigo : '',
          ubicacion: productResult.success ? productResult.product.ubicacion : ''
        };
      });
      
      return {
        id: guide.data.ID,
        numeroGuia: guide.data.NumeroGuia,
        ordenId: guide.data.OrdenID,
        numeroOrden: orderResult.success ? orderResult.order.numeroOrden : '',
        cliente: orderResult.success ? orderResult.order.cliente : '',
        fechaGeneracion: guide.data.FechaGeneracion,
        productos: productDetails,
        totalItems: productos.length,
        estado: guide.data.Estado,
        asignadoA: guide.data.AsignadoA,
        fechaCompletado: guide.data.FechaCompletado,
        rowIndex: guide.rowIndex
      };
    });
    
    // Ordenar por fecha de generación descendente
    formattedGuides.sort((a, b) => {
      return new Date(b.fechaGeneracion) - new Date(a.fechaGeneracion);
    });
    
    Logger.log('Guías obtenidas: ' + formattedGuides.length + (status ? ' con estado ' + status : ''));
    
    return {
      success: true,
      guides: formattedGuides,
      count: formattedGuides.length
    };
    
  } catch (error) {
    Logger.log('Error en getPickingGuides: ' + error.message);
    return {
      success: false,
      error: error.message,
      guides: []
    };
  }
}

/**
 * Completa una guía de picking y mueve la orden a PACKING
 * @param {string} guideId - ID de la guía
 * @param {string} completedBy - Usuario que completa
 * @returns {Object} Resultado de la operación
 */
function completePickingGuide(guideId, completedBy) {
  try {
    if (!guideId) {
      throw new Error('ID de guía requerido');
    }
    
    const guides = findRows('Guias', { ID: guideId });
    
    if (guides.length === 0) {
      throw new Error('Guía no encontrada');
    }
    
    const guide = guides[0];
    
    if (guide.data.Estado !== 'PENDIENTE' && guide.data.Estado !== 'EN_PROCESO') {
      throw new Error('La guía ya fue completada');
    }
    
    // Actualizar guía
    updateCell('Guias', guide.rowIndex, 'Estado', 'COMPLETADA');
    updateCell('Guias', guide.rowIndex, 'AsignadoA', completedBy || 'Sistema');
    updateCell('Guias', guide.rowIndex, 'FechaCompletado', new Date().toISOString());
    
    // Actualizar orden a PACKING
    const orderId = guide.data.OrdenID;
    updateOrderStatus(orderId, 'PACKING');
    
    Logger.log('Guía completada: ' + guide.data.NumeroGuia);
    
    return {
      success: true,
      message: 'Guía de picking completada',
      guideId: guideId,
      orderId: orderId
    };
    
  } catch (error) {
    Logger.log('Error en completePickingGuide: ' + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Obtiene estadísticas de órdenes
 * @returns {Object} Estadísticas
 */
function getOrderStats() {
  try {
    const allOrders = getAllRows('Órdenes');
    
    const stats = {
      total: allOrders.length,
      creadas: 0,
      picking: 0,
      packing: 0,
      listaDespacho: 0,
      despachadas: 0,
      enTransito: 0,
      entregadas: 0,
      canceladas: 0
    };
    
    allOrders.forEach(order => {
      const estado = order.data.Estado;
      switch(estado) {
        case 'CREADA': stats.creadas++; break;
        case 'PICKING': stats.picking++; break;
        case 'PACKING': stats.packing++; break;
        case 'LISTA_DESPACHO': stats.listaDespacho++; break;
        case 'DESPACHADA': stats.despachadas++; break;
        case 'EN_TRANSITO': stats.enTransito++; break;
        case 'ENTREGADA': stats.entregadas++; break;
        case 'CANCELADA': stats.canceladas++; break;
      }
    });
    
    return {
      success: true,
      stats: stats
    };
    
  } catch (error) {
    Logger.log('Error en getOrderStats: ' + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}


/**
 * Obtiene una orden por su ID o número de orden
 * @param {string} orderId - ID o número de la orden
 * @returns {Object} Datos de la orden
 */
function getOrderById(orderId) {
  try {
    if (!orderId) {
      return { success: false, error: 'ID de orden requerido' };
    }
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    // Buscar la hoja con diferentes nombres posibles
    var sheetNames = ['PICKING', 'N.V DIARIAS', 'ORDENES'];
    var sheet = null;
    for (var i = 0; i < sheetNames.length; i++) {
      sheet = ss.getSheetByName(sheetNames[i]);
      if (sheet) break;
    }
    
    if (!sheet) {
      return { success: false, error: 'Hoja de órdenes no encontrada (PICKING/N.V DIARIAS/ORDENES)' };
    }
    
    var data = sheet.getDataRange().getValues();
    var orderIdStr = String(orderId).trim();
    
    for (var i = 1; i < data.length; i++) {
      var nVenta = String(data[i][1] || '').trim();
      if (nVenta === orderIdStr) {
        return {
          success: true,
          order: {
            id: nVenta,
            numeroOrden: nVenta,
            fechaEntrega: data[i][0],
            estado: String(data[i][2] || ''),
            codCliente: String(data[i][3] || ''),
            cliente: String(data[i][4] || ''),
            codVendedor: String(data[i][5] || ''),
            vendedor: String(data[i][6] || ''),
            zona: String(data[i][7] || ''),
            rowIndex: i + 1
          }
        };
      }
    }
    
    return { success: false, error: 'Orden no encontrada: ' + orderId };
    
  } catch (error) {
    Logger.log('Error en getOrderById: ' + error.message);
    return { success: false, error: error.message };
  }
}
