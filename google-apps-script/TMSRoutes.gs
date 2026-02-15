/**
 * TMS Routes - Route Management and Optimization
 * Gestión y optimización de rutas para el sistema TMS
 * 
 * @fileoverview Funciones para manejo y optimización de rutas
 * @author Sistema CCO
 * @version 1.0.0
 */

/**
 * Clase para manejo de rutas TMS
 */
class TMSRoutes {
  constructor() {
    this.db = new TMSDatabase();
    this.cache = CacheService.getScriptCache();
  }

  // ==================== CREACIÓN Y GESTIÓN DE RUTAS ====================

  /**
   * Crea una nueva ruta con entregas asignadas
   */
  createRoute(routeData) {
    try {
      console.log('TMS Routes: Creando nueva ruta...');
      
      // Validar datos de entrada
      if (!routeData.conductorId) {
        throw new Error('ID de conductor es requerido');
      }
      if (!routeData.entregas || routeData.entregas.length === 0) {
        throw new Error('Al menos una entrega es requerida');
      }

      // Verificar que el conductor esté disponible
      const conductor = this.db.getConductorById(routeData.conductorId);
      if (!conductor) {
        throw new Error('Conductor no encontrado');
      }
      if (conductor.Estado !== TMS_CONFIG.ESTADOS_CONDUCTOR.DISPONIBLE) {
        throw new Error('Conductor no está disponible');
      }

      // Crear la ruta
      const rutaData = {
        Nombre: routeData.nombre || `Ruta ${new Date().toLocaleDateString()}`,
        Descripcion: routeData.descripcion || '',
        ConductorAsignado: routeData.conductorId,
        VehiculoAsignado: conductor.VehiculoAsignado,
        FechaCreacion: new Date(),
        Estado: 'PLANIFICADA',
        Prioridad: routeData.prioridad || 'MEDIA',
        EntregasAsignadas: routeData.entregas.length,
        EntregasCompletadas: 0,
        Observaciones: routeData.observaciones || ''
      };

      const result = this.db.createRuta(rutaData);
      if (!result.success) {
        throw new Error('Error creando ruta: ' + result.message);
      }

      const rutaId = result.rutaId;

      // Asignar entregas a la ruta
      for (let i = 0; i < routeData.entregas.length; i++) {
        const entregaId = routeData.entregas[i];
        this.assignDeliveryToRoute(entregaId, rutaId, i + 1);
      }

      // Actualizar estado del conductor
      this.db.updateConductor(routeData.conductorId, {
        Estado: TMS_CONFIG.ESTADOS_CONDUCTOR.OCUPADO
      });

      console.log(`TMS Routes: Ruta ${rutaId} creada correctamente`);
      return { 
        success: true, 
        rutaId: rutaId, 
        message: 'Ruta creada correctamente',
        entregas: routeData.entregas.length
      };

    } catch (error) {
      console.error('TMS Routes: Error creando ruta:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Asigna una entrega a una ruta específica
   */
  assignDeliveryToRoute(entregaId, rutaId, orden = 1) {
    try {
      const updates = {
        RutaAsignada: rutaId,
        OrdenEnRuta: orden,
        Estado: TMS_CONFIG.ESTADOS_ENTREGA.ASIGNADO,
        FechaAsignacion: new Date()
      };

      return this.db.updateEntrega(entregaId, updates);
    } catch (error) {
      console.error('TMS Routes: Error asignando entrega a ruta:', error);
      throw error;
    }
  }

  /**
   * Optimiza el orden de entregas en una ruta
   */
  optimizeRoute(rutaId, algoritmo = 'nearest_neighbor') {
    try {
      console.log(`TMS Routes: Optimizando ruta ${rutaId} con algoritmo ${algoritmo}`);
      
      // Obtener entregas de la ruta
      const entregas = this.db.getEntregas({ rutaId: rutaId });
      if (entregas.length === 0) {
        return { success: false, error: 'No hay entregas en la ruta' };
      }

      let ordenOptimizado;
      
      switch (algoritmo) {
        case 'nearest_neighbor':
          ordenOptimizado = this.nearestNeighborOptimization(entregas);
          break;
        case 'zone_based':
          ordenOptimizado = this.zoneBasedOptimization(entregas);
          break;
        case 'time_window':
          ordenOptimizado = this.timeWindowOptimization(entregas);
          break;
        default:
          ordenOptimizado = this.nearestNeighborOptimization(entregas);
      }

      // Actualizar orden en la base de datos
      for (let i = 0; i < ordenOptimizado.length; i++) {
        this.db.updateEntrega(ordenOptimizado[i].NV, {
          OrdenEnRuta: i + 1
        });
      }

      // Calcular métricas de la ruta optimizada
      const metricas = this.calculateRouteMetrics(ordenOptimizado);
      
      // Actualizar la ruta con las métricas
      this.db.updateRuta(rutaId, {
        DistanciaTotal: metricas.distanciaTotal,
        TiempoEstimado: metricas.tiempoEstimado,
        RutaOptimizada: true
      });

      console.log(`TMS Routes: Ruta ${rutaId} optimizada correctamente`);
      return { 
        success: true, 
        message: 'Ruta optimizada correctamente',
        metricas: metricas,
        ordenOptimizado: ordenOptimizado.map(e => e.NV)
      };

    } catch (error) {
      console.error('TMS Routes: Error optimizando ruta:', error);
      return { success: false, error: error.message };
    }
  }

  // ==================== ALGORITMOS DE OPTIMIZACIÓN ====================

  /**
   * Algoritmo del vecino más cercano
   */
  nearestNeighborOptimization(entregas) {
    try {
      if (entregas.length <= 1) return entregas;

      const visited = new Set();
      const optimized = [];
      
      // Punto de inicio (depósito o primera entrega)
      let current = entregas[0];
      optimized.push(current);
      visited.add(current.NV);

      while (optimized.length < entregas.length) {
        let nearest = null;
        let minDistance = Infinity;

        // Encontrar la entrega más cercana no visitada
        for (const entrega of entregas) {
          if (!visited.has(entrega.NV)) {
            const distance = this.calculateDistance(current, entrega);
            if (distance < minDistance) {
              minDistance = distance;
              nearest = entrega;
            }
          }
        }

        if (nearest) {
          optimized.push(nearest);
          visited.add(nearest.NV);
          current = nearest;
        }
      }

      return optimized;
    } catch (error) {
      console.error('TMS Routes: Error en optimización nearest neighbor:', error);
      return entregas; // Retornar orden original si hay error
    }
  }

  /**
   * Optimización basada en zonas geográficas
   */
  zoneBasedOptimization(entregas) {
    try {
      // Agrupar entregas por zona
      const zones = {};
      entregas.forEach(entrega => {
        const zone = this.getZoneFromAddress(entrega.Direccion);
        if (!zones[zone]) zones[zone] = [];
        zones[zone].push(entrega);
      });

      // Ordenar zonas por prioridad/distancia
      const sortedZones = Object.keys(zones).sort();
      
      // Optimizar dentro de cada zona y concatenar
      let optimized = [];
      sortedZones.forEach(zone => {
        const zoneEntregas = this.nearestNeighborOptimization(zones[zone]);
        optimized = optimized.concat(zoneEntregas);
      });

      return optimized;
    } catch (error) {
      console.error('TMS Routes: Error en optimización por zonas:', error);
      return entregas;
    }
  }

  /**
   * Optimización considerando ventanas de tiempo
   */
  timeWindowOptimization(entregas) {
    try {
      // Ordenar por prioridad y ventana de tiempo
      const sorted = entregas.sort((a, b) => {
        // Prioridad: ALTA > MEDIA > BAJA
        const prioridadA = a.Prioridad === 'ALTA' ? 3 : a.Prioridad === 'MEDIA' ? 2 : 1;
        const prioridadB = b.Prioridad === 'ALTA' ? 3 : b.Prioridad === 'MEDIA' ? 2 : 1;
        
        if (prioridadA !== prioridadB) {
          return prioridadB - prioridadA;
        }

        // Si tienen la misma prioridad, ordenar por cercanía
        return this.calculateDistance(entregas[0], a) - this.calculateDistance(entregas[0], b);
      });

      return sorted;
    } catch (error) {
      console.error('TMS Routes: Error en optimización por tiempo:', error);
      return entregas;
    }
  }

  // ==================== FUNCIONES DE UTILIDAD ====================

  /**
   * Calcula la distancia entre dos entregas (aproximada)
   */
  calculateDistance(entrega1, entrega2) {
    try {
      // Si tenemos coordenadas, usar fórmula de Haversine
      if (entrega1.Latitud && entrega1.Longitud && entrega2.Latitud && entrega2.Longitud) {
        return this.haversineDistance(
          entrega1.Latitud, entrega1.Longitud,
          entrega2.Latitud, entrega2.Longitud
        );
      }

      // Si no, usar distancia aproximada basada en direcciones
      return this.approximateDistanceFromAddress(entrega1.Direccion, entrega2.Direccion);
    } catch (error) {
      console.error('TMS Routes: Error calculando distancia:', error);
      return 1; // Distancia por defecto
    }
  }

  /**
   * Fórmula de Haversine para calcular distancia entre coordenadas
   */
  haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radio de la Tierra en km
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  /**
   * Convierte grados a radianes
   */
  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  /**
   * Distancia aproximada basada en direcciones
   */
  approximateDistanceFromAddress(address1, address2) {
    try {
      // Extraer comunas/zonas de las direcciones
      const zone1 = this.getZoneFromAddress(address1);
      const zone2 = this.getZoneFromAddress(address2);
      
      // Si son la misma zona, distancia corta
      if (zone1 === zone2) return 1;
      
      // Distancias aproximadas entre zonas comunes de Santiago
      const zoneDistances = {
        'las_condes': { 'providencia': 5, 'nunoa': 8, 'san_miguel': 15, 'maipu': 20 },
        'providencia': { 'nunoa': 3, 'san_miguel': 10, 'maipu': 18 },
        'nunoa': { 'san_miguel': 7, 'maipu': 15 },
        'san_miguel': { 'maipu': 12 }
      };

      return zoneDistances[zone1]?.[zone2] || zoneDistances[zone2]?.[zone1] || 10;
    } catch (error) {
      return 5; // Distancia por defecto
    }
  }

  /**
   * Extrae la zona geográfica de una dirección
   */
  getZoneFromAddress(address) {
    try {
      const addressLower = address.toLowerCase();
      
      if (addressLower.includes('las condes')) return 'las_condes';
      if (addressLower.includes('providencia')) return 'providencia';
      if (addressLower.includes('ñuñoa') || addressLower.includes('nunoa')) return 'nunoa';
      if (addressLower.includes('san miguel')) return 'san_miguel';
      if (addressLower.includes('maipú') || addressLower.includes('maipu')) return 'maipu';
      if (addressLower.includes('santiago')) return 'santiago_centro';
      if (addressLower.includes('vitacura')) return 'vitacura';
      if (addressLower.includes('la reina')) return 'la_reina';
      
      return 'otras_zonas';
    } catch (error) {
      return 'otras_zonas';
    }
  }

  /**
   * Calcula métricas de una ruta
   */
  calculateRouteMetrics(entregas) {
    try {
      let distanciaTotal = 0;
      let tiempoEstimado = 0;
      
      // Calcular distancia total
      for (let i = 0; i < entregas.length - 1; i++) {
        distanciaTotal += this.calculateDistance(entregas[i], entregas[i + 1]);
      }

      // Estimar tiempo (distancia + tiempo por entrega)
      const tiempoPorKm = 3; // 3 minutos por km (aproximado en ciudad)
      const tiempoPorEntrega = 15; // 15 minutos por entrega
      
      tiempoEstimado = (distanciaTotal * tiempoPorKm) + (entregas.length * tiempoPorEntrega);

      return {
        distanciaTotal: Math.round(distanciaTotal * 100) / 100,
        tiempoEstimado: Math.round(tiempoEstimado),
        numeroEntregas: entregas.length,
        eficiencia: this.calculateEfficiency(distanciaTotal, entregas.length)
      };
    } catch (error) {
      console.error('TMS Routes: Error calculando métricas:', error);
      return {
        distanciaTotal: 0,
        tiempoEstimado: 0,
        numeroEntregas: entregas.length,
        eficiencia: 0
      };
    }
  }

  /**
   * Calcula la eficiencia de una ruta
   */
  calculateEfficiency(distancia, numeroEntregas) {
    try {
      if (numeroEntregas === 0) return 0;
      
      // Eficiencia = entregas por km (más alto es mejor)
      const entregasPorKm = numeroEntregas / Math.max(distancia, 1);
      
      // Normalizar a escala 0-100
      return Math.min(Math.round(entregasPorKm * 20), 100);
    } catch (error) {
      return 0;
    }
  }

  // ==================== GESTIÓN DE RUTAS ACTIVAS ====================

  /**
   * Inicia una ruta (cambia estado a EN_PROGRESO)
   */
  startRoute(rutaId) {
    try {
      console.log(`TMS Routes: Iniciando ruta ${rutaId}`);
      
      // Actualizar estado de la ruta
      const result = this.db.updateRuta(rutaId, {
        Estado: 'EN_PROGRESO',
        FechaInicio: new Date()
      });

      if (!result.success) {
        throw new Error('Error actualizando estado de ruta');
      }

      // Obtener información de la ruta
      const rutas = this.db.getRutas({ rutaId: rutaId });
      if (rutas.length === 0) {
        throw new Error('Ruta no encontrada');
      }

      const ruta = rutas[0];

      // Actualizar estado del conductor
      this.db.updateConductor(ruta.ConductorAsignado, {
        Estado: TMS_CONFIG.ESTADOS_CONDUCTOR.EN_RUTA
      });

      // Actualizar estado de las entregas
      const entregas = this.db.getEntregas({ rutaId: rutaId });
      entregas.forEach(entrega => {
        this.db.updateEntrega(entrega.NV, {
          Estado: TMS_CONFIG.ESTADOS_ENTREGA.EN_RUTA,
          FechaInicioRuta: new Date()
        });
      });

      console.log(`TMS Routes: Ruta ${rutaId} iniciada correctamente`);
      return { success: true, message: 'Ruta iniciada correctamente' };

    } catch (error) {
      console.error('TMS Routes: Error iniciando ruta:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Completa una ruta
   */
  completeRoute(rutaId) {
    try {
      console.log(`TMS Routes: Completando ruta ${rutaId}`);
      
      // Verificar que todas las entregas estén completadas
      const entregas = this.db.getEntregas({ rutaId: rutaId });
      const entregasPendientes = entregas.filter(e => 
        e.Estado !== TMS_CONFIG.ESTADOS_ENTREGA.ENTREGADO &&
        e.Estado !== TMS_CONFIG.ESTADOS_ENTREGA.RECHAZADO
      );

      if (entregasPendientes.length > 0) {
        return { 
          success: false, 
          error: `Quedan ${entregasPendientes.length} entregas pendientes` 
        };
      }

      // Calcular métricas finales
      const entregasCompletadas = entregas.filter(e => 
        e.Estado === TMS_CONFIG.ESTADOS_ENTREGA.ENTREGADO
      ).length;

      // Actualizar estado de la ruta
      const result = this.db.updateRuta(rutaId, {
        Estado: 'COMPLETADA',
        FechaFin: new Date(),
        EntregasCompletadas: entregasCompletadas
      });

      if (!result.success) {
        throw new Error('Error actualizando estado de ruta');
      }

      // Obtener información de la ruta para liberar conductor
      const rutas = this.db.getRutas({ rutaId: rutaId });
      if (rutas.length > 0) {
        const ruta = rutas[0];
        
        // Liberar conductor
        this.db.updateConductor(ruta.ConductorAsignado, {
          Estado: TMS_CONFIG.ESTADOS_CONDUCTOR.DISPONIBLE,
          EntregasCompletadas: (ruta.EntregasCompletadas || 0) + entregasCompletadas
        });
      }

      console.log(`TMS Routes: Ruta ${rutaId} completada correctamente`);
      return { 
        success: true, 
        message: 'Ruta completada correctamente',
        entregasCompletadas: entregasCompletadas
      };

    } catch (error) {
      console.error('TMS Routes: Error completando ruta:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Obtiene el progreso de una ruta
   */
  getRouteProgress(rutaId) {
    try {
      const entregas = this.db.getEntregas({ rutaId: rutaId });
      
      const total = entregas.length;
      const completadas = entregas.filter(e => 
        e.Estado === TMS_CONFIG.ESTADOS_ENTREGA.ENTREGADO
      ).length;
      const enRuta = entregas.filter(e => 
        e.Estado === TMS_CONFIG.ESTADOS_ENTREGA.EN_RUTA
      ).length;
      const rechazadas = entregas.filter(e => 
        e.Estado === TMS_CONFIG.ESTADOS_ENTREGA.RECHAZADO
      ).length;

      const progreso = total > 0 ? Math.round((completadas / total) * 100) : 0;

      return {
        total: total,
        completadas: completadas,
        enRuta: enRuta,
        rechazadas: rechazadas,
        pendientes: total - completadas - enRuta - rechazadas,
        progreso: progreso
      };
    } catch (error) {
      console.error('TMS Routes: Error obteniendo progreso:', error);
      return {
        total: 0,
        completadas: 0,
        enRuta: 0,
        rechazadas: 0,
        pendientes: 0,
        progreso: 0
      };
    }
  }
}