/**
 * Reception.gs
 * Módulo de gestión de recepciones de mercancía
 * 
 * Maneja el registro de recepciones de proveedores, verificación de productos
 * y actualización automática del inventario
 */

/**
 * Crea una nueva recepción de mercancía
 * @param {Object} receptionData - Datos de la recepción
 * @returns {Object} Resultado de la operación
 */
function createReception(receptionData) {
  try {
    // Validar datos requeridos
    if (!receptionData.proveedor) {
      throw new Error('Proveedor es requerido');
    }
    
    if (!receptionData.productos || !Array.isArray(receptionData.productos) || receptionData.productos.length === 0) {
      throw new Error('Debe incluir al menos un producto');
    }
    
    if (!receptionData.cantidades || !Array.isArray(receptionData.cantidades)) {
      throw new Error('Cantidades son requeridas');
    }
    
    if (receptionData.productos.length !== receptionData.cantidades.length) {
      throw new Error('El número de productos y cantidades debe coincidir');
    }
    
    // Generar ID
    const receptionId = generateId('REC');
    
    // Preparar datos de productos
    const productosData = receptionData.productos.map((productId, index) => ({
      productId: productId,
      cantidad: receptionData.cantidades[index]
    }));
    
    // Preparar datos para insertar
    const newReception = [
      receptionId,
      new Date().toISOString(),
      receptionData.proveedor,
      JSON.stringify(receptionData.productos),
      JSON.stringify(receptionData.cantidades),
      'PENDIENTE',
      '',
      receptionData.notas || ''
    ];
    
    // Insertar recepción
    const result = insertRow('Recepciones', newReception);
    
    if (result.success) {
      Logger.log('Recepción creada: ' + receptionId + ' | Proveedor: ' + receptionData.proveedor);
      
      return {
        success: true,
        message: 'Recepción registrada correctamente',
        receptionId: receptionId,
        productos: productosData.length
      };
    } else {
      return result;
    }
    
  } catch (error) {
    Logger.log('Error en createReception: ' + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Verifica una recepción y actualiza el inventario
 * @param {string} receptionId - ID de la recepción
 * @param {string} verifiedBy - Usuario que verifica
 * @returns {Object} Resultado de la operación
 */
function verifyReception(receptionId, verifiedBy) {
  try {
    if (!receptionId) {
      throw new Error('ID de recepción requerido');
    }
    
    // Buscar recepción
    const receptions = findRows('Recepciones', { ID: receptionId });
    
    if (receptions.length === 0) {
      throw new Error('Recepción no encontrada');
    }
    
    const reception = receptions[0];
    
    // Verificar que esté pendiente
    if (reception.data.Estado !== 'PENDIENTE') {
      throw new Error('La recepción ya fue procesada. Estado actual: ' + reception.data.Estado);
    }
    
    // Obtener productos y cantidades
    const productos = JSON.parse(reception.data.Productos);
    const cantidades = JSON.parse(reception.data.Cantidades);
    
    // Actualizar inventario para cada producto
    const updateResults = [];
    for (let i = 0; i < productos.length; i++) {
      const productId = productos[i];
      const cantidad = cantidades[i];
      
      // Verificar si el producto existe
      const productResult = getProductById(productId);
      
      if (productResult.success) {
        // Producto existe, actualizar stock
        const stockResult = updateStock(productId, cantidad, 'ADD');
        updateResults.push({
          productId: productId,
          cantidad: cantidad,
          success: stockResult.success,
          message: stockResult.success ? 'Stock actualizado' : stockResult.error
        });
      } else {
        // Producto no existe, registrar advertencia
        updateResults.push({
          productId: productId,
          cantidad: cantidad,
          success: false,
          message: 'Producto no encontrado en inventario'
        });
      }
    }
    
    // Actualizar estado de la recepción
    updateCell('Recepciones', reception.rowIndex, 'Estado', 'VERIFICADA');
    updateCell('Recepciones', reception.rowIndex, 'VerificadoPor', verifiedBy || 'Sistema');
    
    // Invalidar cache
    CacheManager.invalidate('Recepciones');
    CacheManager.invalidate('Inventario');
    
    Logger.log('Recepción verificada: ' + receptionId + ' | Por: ' + verifiedBy);
    
    return {
      success: true,
      message: 'Recepción verificada correctamente',
      receptionId: receptionId,
      productosActualizados: updateResults.filter(r => r.success).length,
      productosConError: updateResults.filter(r => !r.success).length,
      detalles: updateResults
    };
    
  } catch (error) {
    Logger.log('Error en verifyReception: ' + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Obtiene recepciones pendientes de verificación
 * @returns {Array} Array de recepciones pendientes
 */
function getPendingReceptions() {
  try {
    const receptions = findRows('Recepciones', { Estado: 'PENDIENTE' });
    
    const formattedReceptions = receptions.map(reception => {
      const productos = JSON.parse(reception.data.Productos);
      const cantidades = JSON.parse(reception.data.Cantidades);
      
      // Obtener detalles de productos
      const productDetails = productos.map((productId, index) => {
        const productResult = getProductById(productId);
        return {
          id: productId,
          nombre: productResult.success ? productResult.product.nombre : 'Desconocido',
          codigo: productResult.success ? productResult.product.codigo : productId,
          cantidad: cantidades[index]
        };
      });
      
      return {
        id: reception.data.ID,
        fecha: reception.data.FechaRecepcion,
        proveedor: reception.data.Proveedor,
        productos: productDetails,
        totalProductos: productos.length,
        estado: reception.data.Estado,
        notas: reception.data.Notas,
        rowIndex: reception.rowIndex
      };
    });
    
    // Ordenar por fecha descendente
    formattedReceptions.sort((a, b) => {
      return new Date(b.fecha) - new Date(a.fecha);
    });
    
    Logger.log('Recepciones pendientes: ' + formattedReceptions.length);
    
    return {
      success: true,
      receptions: formattedReceptions,
      count: formattedReceptions.length
    };
    
  } catch (error) {
    Logger.log('Error en getPendingReceptions: ' + error.message);
    return {
      success: false,
      error: error.message,
      receptions: []
    };
  }
}

/**
 * Obtiene el historial de recepciones
 * @param {Object} filters - Filtros opcionales {estado, fechaDesde, fechaHasta, proveedor}
 * @returns {Array} Array de recepciones
 */
function getReceptionHistory(filters) {
  try {
    let receptions = getAllRows('Recepciones');
    
    // Aplicar filtros si existen
    if (filters) {
      if (filters.estado) {
        receptions = receptions.filter(r => r.data.Estado === filters.estado);
      }
      
      if (filters.proveedor) {
        receptions = receptions.filter(r => 
          r.data.Proveedor.toLowerCase().includes(filters.proveedor.toLowerCase())
        );
      }
      
      if (filters.fechaDesde) {
        const fechaDesde = new Date(filters.fechaDesde);
        receptions = receptions.filter(r => {
          const fechaRecepcion = new Date(r.data.FechaRecepcion);
          return fechaRecepcion >= fechaDesde;
        });
      }
      
      if (filters.fechaHasta) {
        const fechaHasta = new Date(filters.fechaHasta);
        receptions = receptions.filter(r => {
          const fechaRecepcion = new Date(r.data.FechaRecepcion);
          return fechaRecepcion <= fechaHasta;
        });
      }
    }
    
    // Formatear datos
    const formattedReceptions = receptions.map(reception => {
      const productos = JSON.parse(reception.data.Productos || '[]');
      const cantidades = JSON.parse(reception.data.Cantidades || '[]');
      
      // Obtener detalles de productos
      const productDetails = productos.map((productId, index) => {
        const productResult = getProductById(productId);
        return {
          id: productId,
          nombre: productResult.success ? productResult.product.nombre : 'Desconocido',
          codigo: productResult.success ? productResult.product.codigo : productId,
          cantidad: cantidades[index] || 0
        };
      });
      
      return {
        id: reception.data.ID,
        fecha: reception.data.FechaRecepcion,
        proveedor: reception.data.Proveedor,
        productos: productDetails,
        totalProductos: productos.length,
        estado: reception.data.Estado,
        verificadoPor: reception.data.VerificadoPor,
        notas: reception.data.Notas,
        rowIndex: reception.rowIndex
      };
    });
    
    // Ordenar por fecha descendente
    formattedReceptions.sort((a, b) => {
      return new Date(b.fecha) - new Date(a.fecha);
    });
    
    Logger.log('Historial de recepciones: ' + formattedReceptions.length + ' registros');
    
    return {
      success: true,
      receptions: formattedReceptions,
      count: formattedReceptions.length
    };
    
  } catch (error) {
    Logger.log('Error en getReceptionHistory: ' + error.message);
    return {
      success: false,
      error: error.message,
      receptions: []
    };
  }
}

/**
 * Obtiene una recepción específica por ID
 * @param {string} receptionId - ID de la recepción
 * @returns {Object} Datos de la recepción
 */
function getReceptionById(receptionId) {
  try {
    if (!receptionId) {
      throw new Error('ID de recepción requerido');
    }
    
    const receptions = findRows('Recepciones', { ID: receptionId });
    
    if (receptions.length === 0) {
      throw new Error('Recepción no encontrada');
    }
    
    const reception = receptions[0];
    const productos = JSON.parse(reception.data.Productos || '[]');
    const cantidades = JSON.parse(reception.data.Cantidades || '[]');
    
    // Obtener detalles de productos
    const productDetails = productos.map((productId, index) => {
      const productResult = getProductById(productId);
      return {
        id: productId,
        nombre: productResult.success ? productResult.product.nombre : 'Desconocido',
        codigo: productResult.success ? productResult.product.codigo : productId,
        cantidad: cantidades[index] || 0
      };
    });
    
    return {
      success: true,
      reception: {
        id: reception.data.ID,
        fecha: reception.data.FechaRecepcion,
        proveedor: reception.data.Proveedor,
        productos: productDetails,
        totalProductos: productos.length,
        estado: reception.data.Estado,
        verificadoPor: reception.data.VerificadoPor,
        notas: reception.data.Notas,
        rowIndex: reception.rowIndex
      }
    };
    
  } catch (error) {
    Logger.log('Error en getReceptionById: ' + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Cancela una recepción pendiente
 * @param {string} receptionId - ID de la recepción
 * @param {string} reason - Razón de cancelación
 * @returns {Object} Resultado de la operación
 */
function cancelReception(receptionId, reason) {
  try {
    if (!receptionId) {
      throw new Error('ID de recepción requerido');
    }
    
    const receptions = findRows('Recepciones', { ID: receptionId });
    
    if (receptions.length === 0) {
      throw new Error('Recepción no encontrada');
    }
    
    const reception = receptions[0];
    
    // Solo se pueden cancelar recepciones pendientes
    if (reception.data.Estado !== 'PENDIENTE') {
      throw new Error('Solo se pueden cancelar recepciones pendientes');
    }
    
    // Actualizar estado
    updateCell('Recepciones', reception.rowIndex, 'Estado', 'CANCELADA');
    
    // Agregar razón a las notas
    const notasActuales = reception.data.Notas || '';
    const nuevasNotas = notasActuales + (notasActuales ? ' | ' : '') + 'CANCELADA: ' + (reason || 'Sin razón especificada');
    updateCell('Recepciones', reception.rowIndex, 'Notas', nuevasNotas);
    
    // Invalidar cache
    CacheManager.invalidate('Recepciones');
    
    Logger.log('Recepción cancelada: ' + receptionId + (reason ? ' | Razón: ' + reason : ''));
    
    return {
      success: true,
      message: 'Recepción cancelada correctamente',
      receptionId: receptionId
    };
    
  } catch (error) {
    Logger.log('Error en cancelReception: ' + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// NOTA: getReceptionStats version antigua removida (duplicada)
// La version correcta esta mas abajo (linea ~517)

/**
 * Busca recepciones por proveedor
 * @param {string} proveedor - Nombre del proveedor
 * @returns {Array} Array de recepciones
 */
function getReceptionsByProvider(proveedor) {
  try {
    if (!proveedor) {
      throw new Error('Proveedor requerido');
    }
    
    const receptions = findRows('Recepciones', { Proveedor: proveedor });
    
    const formattedReceptions = receptions.map(reception => {
      const productos = JSON.parse(reception.data.Productos || '[]');
      const cantidades = JSON.parse(reception.data.Cantidades || '[]');
      
      return {
        id: reception.data.ID,
        fecha: reception.data.FechaRecepcion,
        proveedor: reception.data.Proveedor,
        totalProductos: productos.length,
        estado: reception.data.Estado,
        verificadoPor: reception.data.VerificadoPor,
        notas: reception.data.Notas
      };
    });
    
    Logger.log('Recepciones del proveedor ' + proveedor + ': ' + formattedReceptions.length);
    
    return {
      success: true,
      receptions: formattedReceptions,
      count: formattedReceptions.length
    };
    
  } catch (error) {
    Logger.log('Error en getReceptionsByProvider: ' + error.message);
    return {
      success: false,
      error: error.message,
      receptions: []
    };
  }
}


/**
 * Obtiene estadísticas de recepciones para el dashboard
 * @returns {Object} Estadísticas de recepciones
 */
function getReceptionStats() {
  try {
    const allReceptions = getAllRows('Recepciones');
    
    const stats = {
      total: allReceptions.length,
      pendientes: 0,
      verificadas: 0,
      canceladas: 0,
      pendingCount: 0
    };
    
    allReceptions.forEach(reception => {
      const estado = reception.data.Estado;
      switch(estado) {
        case 'PENDIENTE': 
          stats.pendientes++; 
          stats.pendingCount++;
          break;
        case 'VERIFICADA': stats.verificadas++; break;
        case 'CANCELADA': stats.canceladas++; break;
      }
    });
    
    return {
      success: true,
      stats: stats
    };
    
  } catch (error) {
    Logger.log('Error en getReceptionStats: ' + error.message);
    return {
      success: false,
      error: error.message,
      stats: { total: 0, pendientes: 0, verificadas: 0, canceladas: 0, pendingCount: 0 }
    };
  }
}
