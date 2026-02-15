/**
 * TMS Route Planning - Route Planning Controller
 * Controlador para planificación y optimización de rutas
 * 
 * @fileoverview Funciones para planificación de rutas del TMS
 * @author Sistema CCO
 * @version 1.0.0
 */

/**
 * Clase principal de Planificación de Rutas
 */
class TMSRoutePlanning {
  constructor() {
    this.db = new TMSDatabase();
    this.optimization = new TMSOptimization();
    this.cache = CacheService.getScriptCache();
  }

  // ==================== GESTIÓN DE RUTAS ====================

  /**
   * Obtiene todas las rutas con información detallada
   */
  getRutasDetalladas() {
    try {
      console.log('TMS Route Planning: Obteniendo rutas detalladas...');
      
      const rutas = this.db.getRutas();
      const entregas = this.db.getEntregas();
      const conductores = this.db.getConductores();
      
      return rutas.map(ruta => {
        const entregasRuta = entregas.filter(e => e.RutaId === ruta.ID);
        const conductor = conductores.find(c => c.ID === ruta.ConductorAsignado);
        
        return {
          ...ruta,
          id: ruta.ID, // Frontend expects lowercase id
          nombre: ruta.Nombre, // Frontend expects lowercase nombre
          estado: ruta.Estado,
          conductor: conductor || null,
          entregas: entregasRuta,
          totalEntregas: entregasRuta.length,
          entregasCompletadas: entregasRuta.filter(e => e.Estado === 'ENTREGADO').length,
          distanciaTotal: this.calcularDistanciaTotal(entregasRuta),
          tiempoEstimado: this.calcularTiempoEstimado(entregasRuta),
          progreso: entregasRuta.length > 0 ? 
            (entregasRuta.filter(e => e.Estado === 'ENTREGADO').length / entregasRuta.length) * 100 : 0
        };
      });
    } catch (error) {
      console.error('Error obteniendo rutas detalladas:', error);
      throw new Error('Error al obtener rutas detalladas');
    }
  }

  /**
   * Crea una nueva ruta
   */
  crearRuta(datosRuta) {
    try {
      console.log('TMS Route Planning: Creando nueva ruta...', datosRuta);
      
      // Validar datos
      if (!datosRuta.nombre || !datosRuta.conductorId) {
        throw new Error('Nombre y conductor son requeridos');
      }
      
      const nuevaRuta = {
        Nombre: datosRuta.nombre,
        ConductorAsignado: datosRuta.conductorId,
        VehiculoAsignado: datosRuta.vehiculoId || '',
        FechaInicio: datosRuta.fechaPlanificada || new Date().toISOString(),
        Estado: 'PLANIFICADA',
        Prioridad: datosRuta.prioridad || 'NORMAL',
        Observaciones: datosRuta.observaciones || '',
        DistanciaTotal: 0,
        TiempoEstimado: 0,
        Coordenadas: datosRuta.coordenadas || []
      };
      
      // Guardar en base de datos
      const resultado = this.db.createRuta(nuevaRuta);
      
      // Limpiar cache
      this.cache.remove('rutas_detalladas');
      
      return resultado;
    } catch (error) {
      console.error('Error creando ruta:', error);
      throw new Error('Error al crear ruta: ' + error.message);
    }
  }

  /**
   * Actualiza una ruta existente
   */
  actualizarRuta(rutaId, datosActualizacion) {
    try {
      console.log('TMS Route Planning: Actualizando ruta...', rutaId);
      
      const resultado = this.db.updateRuta(rutaId, datosActualizacion);
      
      // Limpiar cache
      this.cache.remove('rutas_detalladas');
      
      return resultado;
    } catch (error) {
      console.error('Error actualizando ruta:', error);
      throw new Error('Error al actualizar ruta: ' + error.message);
    }
  }

  /**
   * Elimina una ruta
   */
  eliminarRuta(rutaId) {
    try {
      console.log('TMS Route Planning: Eliminando ruta...', rutaId);
      
      // Verificar que no tenga entregas asignadas
      const entregas = this.db.getEntregas().filter(e => e.RutaId === rutaId);
      if (entregas.length > 0) {
        throw new Error('No se puede eliminar una ruta con entregas asignadas');
      }
      
      const resultado = this.db.deleteRuta(rutaId);
      
      // Limpiar cache
      this.cache.remove('rutas_detalladas');
      
      return resultado;
    } catch (error) {
      console.error('Error eliminando ruta:', error);
      throw new Error('Error al eliminar ruta: ' + error.message);
    }
  }

  // ==================== ASIGNACIÓN DE ENTREGAS ====================

  /**
   * Asigna entregas a una ruta
   */
  asignarEntregasARuta(rutaId, entregaIds) {
    try {
      console.log('TMS Route Planning: Asignando entregas a ruta...', rutaId, entregaIds);
      
      const ruta = this.db.getRutaById(rutaId);
      if (!ruta) {
        throw new Error('Ruta no encontrada');
      }
      
      // Actualizar entregas
      const resultados = entregaIds.map(entregaId => {
        return this.db.updateEntrega(entregaId, {
          RutaId: rutaId,
          Estado: 'ASIGNADO',
          FechaAsignacion: new Date().toISOString()
        });
      });
      
      // Actualizar ruta con nueva información
      const entregas = this.db.getEntregas().filter(e => e.RutaId === rutaId);
      const distanciaTotal = this.calcularDistanciaTotal(entregas);
      const tiempoEstimado = this.calcularTiempoEstimado(entregas);
      
      this.db.updateRuta(rutaId, {
        DistanciaTotal: distanciaTotal,
        TiempoEstimado: tiempoEstimado,
        TotalEntregas: entregas.length
      });
      
      // Limpiar cache
      this.cache.remove('rutas_detalladas');
      
      return {
        success: true,
        entregasAsignadas: resultados.length,
        distanciaTotal: distanciaTotal,
        tiempoEstimado: tiempoEstimado
      };
    } catch (error) {
      console.error('Error asignando entregas a ruta:', error);
      throw new Error('Error al asignar entregas: ' + error.message);
    }
  }

  /**
   * Remueve entregas de una ruta
   */
  removerEntregasDeRuta(rutaId, entregaIds) {
    try {
      console.log('TMS Route Planning: Removiendo entregas de ruta...', rutaId, entregaIds);
      
      // Actualizar entregas
      const resultados = entregaIds.map(entregaId => {
        return this.db.updateEntrega(entregaId, {
          RutaId: '',
          Estado: 'PENDIENTE',
          FechaAsignacion: ''
        });
      });
      
      // Actualizar ruta
      const entregas = this.db.getEntregas().filter(e => e.RutaId === rutaId);
      const distanciaTotal = this.calcularDistanciaTotal(entregas);
      const tiempoEstimado = this.calcularTiempoEstimado(entregas);
      
      this.db.updateRuta(rutaId, {
        DistanciaTotal: distanciaTotal,
        TiempoEstimado: tiempoEstimado,
        TotalEntregas: entregas.length
      });
      
      // Limpiar cache
      this.cache.remove('rutas_detalladas');
      
      return {
        success: true,
        entregasRemovidas: resultados.length
      };
    } catch (error) {
      console.error('Error removiendo entregas de ruta:', error);
      throw new Error('Error al remover entregas: ' + error.message);
    }
  }

  // ==================== OPTIMIZACIÓN DE RUTAS ====================

  /**
   * Optimiza el orden de entregas en una ruta
   */
  optimizarRuta(rutaId, algoritmo = 'NEAREST_NEIGHBOR') {
    try {
      console.log('TMS Route Planning: Optimizando ruta...', rutaId, algoritmo);
      
      const entregas = this.db.getEntregas().filter(e => e.RutaId === rutaId);
      if (entregas.length < 2) {
        return { success: true, message: 'Ruta no requiere optimización' };
      }
      
      // Aplicar algoritmo de optimización
      const entregasOptimizadas = this.optimization.optimizarRuta(entregas, algoritmo);
      
      // Actualizar orden de entregas
      entregasOptimizadas.forEach((entrega, index) => {
        this.db.updateEntrega(entrega.id, {
          OrdenEnRuta: index + 1,
          FechaOptimizacion: new Date().toISOString()
        });
      });
      
      // Recalcular métricas de ruta
      const distanciaTotal = this.calcularDistanciaTotal(entregasOptimizadas);
      const tiempoEstimado = this.calcularTiempoEstimado(entregasOptimizadas);
      
      this.db.updateRuta(rutaId, {
        DistanciaTotal: distanciaTotal,
        TiempoEstimado: tiempoEstimado,
        FechaOptimizacion: new Date().toISOString(),
        AlgoritmoOptimizacion: algoritmo
      });
      
      // Limpiar cache
      this.cache.remove('rutas_detalladas');
      
      return {
        success: true,
        entregasOptimizadas: entregasOptimizadas.length,
        distanciaTotal: distanciaTotal,
        tiempoEstimado: tiempoEstimado,
        mejora: this.calcularMejora(entregas, entregasOptimizadas)
      };
    } catch (error) {
      console.error('Error optimizando ruta:', error);
      throw new Error('Error al optimizar ruta: ' + error.message);
    }
  }

  /**
   * Sugiere rutas automáticamente basado en criterios
   */
  sugerirRutasAutomaticas(criterios = {}) {
    try {
      console.log('TMS Route Planning: Sugiriendo rutas automáticas...', criterios);
      
      const entregasPendientes = this.db.getEntregas().filter(e => e.estado === 'PENDIENTE');
      const conductoresDisponibles = this.db.getConductores().filter(c => c.estado === 'DISPONIBLE');
      
      if (entregasPendientes.length === 0) {
        return { success: true, rutas: [], message: 'No hay entregas pendientes' };
      }
      
      if (conductoresDisponibles.length === 0) {
        return { success: false, message: 'No hay conductores disponibles' };
      }
      
      // Aplicar algoritmo de agrupación
      const rutasSugeridas = this.optimization.agruparEntregasEnRutas(
        entregasPendientes, 
        conductoresDisponibles, 
        criterios
      );
      
      return {
        success: true,
        rutas: rutasSugeridas,
        totalEntregas: entregasPendientes.length,
        rutasGeneradas: rutasSugeridas.length
      };
    } catch (error) {
      console.error('Error sugiriendo rutas automáticas:', error);
      throw new Error('Error al sugerir rutas: ' + error.message);
    }
  }

  // ==================== FUNCIONES DE CÁLCULO ====================

  /**
   * Calcula la distancia total de una ruta
   */
  calcularDistanciaTotal(entregas) {
    if (!entregas || entregas.length === 0) return 0;
    
    // Implementación básica - en producción usar Google Maps API
    let distanciaTotal = 0;
    for (let i = 0; i < entregas.length - 1; i++) {
      const entregaA = entregas[i];
      const entregaB = entregas[i + 1];
      
      if (entregaA.latitud && entregaA.longitud && entregaB.latitud && entregaB.longitud) {
        distanciaTotal += this.calcularDistanciaEntrePuntos(
          entregaA.latitud, entregaA.longitud,
          entregaB.latitud, entregaB.longitud
        );
      }
    }
    
    return Math.round(distanciaTotal * 100) / 100; // Redondear a 2 decimales
  }

  /**
   * Calcula el tiempo estimado de una ruta
   */
  calcularTiempoEstimado(entregas) {
    if (!entregas || entregas.length === 0) return 0;
    
    const distanciaTotal = this.calcularDistanciaTotal(entregas);
    const velocidadPromedio = 40; // km/h promedio en ciudad
    const tiempoPorEntrega = 15; // minutos por entrega
    
    const tiempoViaje = (distanciaTotal / velocidadPromedio) * 60; // minutos
    const tiempoEntregas = entregas.length * tiempoPorEntrega;
    
    return Math.round(tiempoViaje + tiempoEntregas);
  }

  /**
   * Calcula la distancia entre dos puntos geográficos
   */
  calcularDistanciaEntrePuntos(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radio de la Tierra en km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  /**
   * Convierte grados a radianes
   */
  toRad(grados) {
    return grados * (Math.PI / 180);
  }

  /**
   * Calcula la mejora obtenida por optimización
   */
  calcularMejora(entregasOriginales, entregasOptimizadas) {
    const distanciaOriginal = this.calcularDistanciaTotal(entregasOriginales);
    const distanciaOptimizada = this.calcularDistanciaTotal(entregasOptimizadas);
    
    if (distanciaOriginal === 0) return 0;
    
    const mejora = ((distanciaOriginal - distanciaOptimizada) / distanciaOriginal) * 100;
    return Math.round(mejora * 100) / 100;
  }

  // ==================== FUNCIONES DE UTILIDAD ====================

  /**
   * Helper para obtener valor de propiedad sin importar mayúsculas/minúsculas
   */
  getValue(obj, key) {
    if (!obj) return undefined;
    const foundKey = Object.keys(obj).find(k => k.toLowerCase() === key.toLowerCase());
    return foundKey ? obj[foundKey] : undefined;
  }

  /**
   * Obtiene entregas disponibles para asignar
   */
  getEntregasDisponibles() {
    try {
      const entregas = this.db.getEntregas();
      // Filtrar usando helper para ser insensible a mayúsculas
      const pendientes = entregas.filter(e => {
        const estado = this.getValue(e, 'Estado');
        // Buscar RutaId, Ruta_Id, RutaID, etc.
        const rutaId = this.getValue(e, 'RutaId') || this.getValue(e, 'Ruta_Id') || this.getValue(e, 'Ruta');
        
        // Estado debe ser pendiente Y no debe tener ruta asignada
        const isPendiente = (estado === 'PENDIENTE' || estado === 'Pendiente' || estado === 'POR_ENTREGAR');
        const hasNoRoute = !rutaId || rutaId === '' || rutaId === '0';
        
        return isPendiente && hasNoRoute;
      });

      // Mapear a formato estándar para el Frontend
      return pendientes.map(e => ({
        ID: this.getValue(e, 'ID') || this.getValue(e, 'NV') || '', // ID único
        NV: this.getValue(e, 'NV') || this.getValue(e, 'N.Venta') || this.getValue(e, 'NotaVenta') || 'S/N',
        Cliente: this.getValue(e, 'Cliente') || this.getValue(e, 'NombreCliente') || 'Cliente Desconocido',
        Direccion: this.getValue(e, 'Direccion') || this.getValue(e, 'Dirección') || '',
        Bultos: this.getValue(e, 'Bultos') || this.getValue(e, 'Cantidad') || 0,
        Latitud: this.getValue(e, 'Latitud') || this.getValue(e, 'Lat'),
        Longitud: this.getValue(e, 'Longitud') || this.getValue(e, 'Lon') || this.getValue(e, 'Lng')
      }));

    } catch (error) {
      console.error('Error obteniendo entregas disponibles:', error);
      return [];
    }
  }

  /**
   * Obtiene lista de conductores disponibles
   */
  getConductoresDisponibles() {
    try {
      // Obtener todos y filtrar en memoria para asegurar compatibilidad
      const allConductores = this.db.getConductores();
      const conductores = allConductores.filter(c => {
        const estado = this.getValue(c, 'Estado');
        return !estado || estado === 'DISPONIBLE' || estado === 'DESCANSO' || estado === 'ACTIVO';
      });
      
      // Fallback: Si no hay conductores en DB, devolver mock data para pruebas
      if (!conductores || conductores.length === 0) {
        return [
          { ID: 'COND-001', Nombre: 'Juan Pérez', Estado: 'DISPONIBLE' },
          { ID: 'COND-002', Nombre: 'Pedro González', Estado: 'DISPONIBLE' },
          { ID: 'COND-003', Nombre: 'Chofer Externo 1', Estado: 'DISPONIBLE' }
        ];
      }

      return conductores.map(c => ({
        ID: this.getValue(c, 'ID'),
        Nombre: (this.getValue(c, 'Nombre') || '') + ' ' + (this.getValue(c, 'Apellido') || ''),
        Estado: this.getValue(c, 'Estado') || 'DISPONIBLE'
      }));
    } catch (error) {
      console.error('Error obteniendo conductores:', error);
      // Fallback en caso de error
      return [
          { ID: 'COND-ERR', Nombre: 'Conductor Default', Estado: 'DISPONIBLE' }
      ];
    }
  }

  /**
   * Valida datos de ruta
   */
  validarDatosRuta(datos) {
    const errores = [];
    
    if (!datos.nombre || datos.nombre.trim() === '') {
      errores.push('El nombre de la ruta es requerido');
    }
    
    if (!datos.conductorId) {
      errores.push('El conductor es requerido');
    }
    
    if (datos.fechaPlanificada && new Date(datos.fechaPlanificada) < new Date()) {
      errores.push('La fecha planificada no puede ser en el pasado');
    }
    
    return errores;
  }
}

// ==================== FUNCIONES GLOBALES ====================

/**
 * Obtiene rutas detalladas para la interfaz
 */
function getRutasDetalladas() {
  try {
    const routePlanning = new TMSRoutePlanning();
    return routePlanning.getRutasDetalladas();
  } catch (error) {
    console.error('Error en getRutasDetalladas:', error);
    return { error: error.message };
  }
}

/**
 * Crea una nueva ruta
 */
function crearNuevaRuta(datosRuta) {
  try {
    const routePlanning = new TMSRoutePlanning();
    return routePlanning.crearRuta(datosRuta);
  } catch (error) {
    console.error('Error en crearNuevaRuta:', error);
    return { error: error.message };
  }
}

/**
 * Actualiza una ruta existente
 */
function actualizarRutaExistente(rutaId, datosActualizacion) {
  try {
    const routePlanning = new TMSRoutePlanning();
    return routePlanning.actualizarRuta(rutaId, datosActualizacion);
  } catch (error) {
    console.error('Error en actualizarRutaExistente:', error);
    return { error: error.message };
  }
}

/**
 * Asigna entregas a una ruta
 */
function asignarEntregasARuta(rutaId, entregaIds) {
  try {
    const routePlanning = new TMSRoutePlanning();
    return routePlanning.asignarEntregasARuta(rutaId, entregaIds);
  } catch (error) {
    console.error('Error en asignarEntregasARuta:', error);
    return { error: error.message };
  }
}

/**
 * Optimiza una ruta
 */
function optimizarRutaExistente(rutaId, algoritmo) {
  try {
    const routePlanning = new TMSRoutePlanning();
    return routePlanning.optimizarRuta(rutaId, algoritmo);
  } catch (error) {
    console.error('Error en optimizarRutaExistente:', error);
    return { error: error.message };
  }
}

/**
 * Sugiere rutas automáticas
 */
function sugerirRutasAutomaticas(criterios) {
  try {
    const routePlanning = new TMSRoutePlanning();
    return routePlanning.sugerirRutasAutomaticas(criterios);
  } catch (error) {
    console.error('Error en sugerirRutasAutomaticas:', error);
    return { error: error.message };
  }
}

/**
 * Obtiene todos los datos iniciales para el TMS de una sola vez
 * Optimización para evitar error de "Exceeded maximum execution time/concurrent"
 */
function getTMSInitialData() {
  try {
    const routePlanning = new TMSRoutePlanning();
    
    // Ejecutar en serie para evitar bloqueos, aunque sea un poco más lento
    const entregas = routePlanning.getEntregasDisponibles();
    const rutas = routePlanning.getRutasDetalladas();
    const conductores = routePlanning.getConductoresDisponibles();
    
    return {
      success: true,
      entregas: entregas,
      rutas: rutas,
      conductores: conductores
    };
  } catch (error) {
    console.error('Error en getTMSInitialData:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Obtiene entregas disponibles
 */
function getEntregasDisponibles() {
  try {
    const routePlanning = new TMSRoutePlanning();
    return routePlanning.getEntregasDisponibles();
  } catch (error) {
    console.error('Error en getEntregasDisponibles:', error);
    return { error: error.message };
  }
}

/**
 * Obtiene conductores disponibles
 */
function getConductoresDisponibles() {
  try {
    const routePlanning = new TMSRoutePlanning();
    return routePlanning.getConductoresDisponibles();
  } catch (error) {
    console.error('Error en getConductoresDisponibles:', error);
    return { error: error.message };
  }
}