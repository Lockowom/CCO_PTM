/**
 * TMS Tracking - Real-time Tracking and Location Services
 * Sistema de seguimiento en tiempo real para el TMS
 * 
 * @fileoverview Funciones para tracking en tiempo real y geolocalización
 * @author Sistema CCO
 * @version 1.0.0
 */

/**
 * Clase para manejo de tracking TMS
 */
class TMSTracking {
  constructor() {
    this.db = new TMSDatabase();
    this.cache = CacheService.getScriptCache();
  }

  // ==================== TRACKING DE CONDUCTORES ====================

  /**
   * Actualiza la ubicación de un conductor
   */
  updateDriverLocation(conductorId, lat, lng, additionalData = {}) {
    try {
      console.log(`TMS Tracking: Actualizando ubicación conductor ${conductorId}`);
      
      // Validar coordenadas
      if (!this.isValidCoordinate(lat, lng)) {
        throw new Error('Coordenadas inválidas');
      }

      // Actualizar ubicación en base de datos
      const result = this.db.updateConductorLocation(conductorId, lat, lng);
      if (!result.success) {
        throw new Error('Error actualizando ubicación en BD');
      }

      // Registrar evento de tracking
      const trackingData = {
        ConductorID: conductorId,
        Latitud: lat,
        Longitud: lng,
        Velocidad: additionalData.velocidad || 0,
        Direccion: additionalData.direccion || 0,
        Estado: additionalData.estado || 'EN_MOVIMIENTO',
        Evento: 'UBICACION_ACTUALIZADA',
        Observaciones: additionalData.observaciones || ''
      };

      this.db.addTrackingEvent(trackingData);

      // Actualizar cache para acceso rápido
      const cacheKey = `conductor_location_${conductorId}`;
      const locationData = {
        lat: lat,
        lng: lng,
        timestamp: new Date().getTime(),
        velocidad: additionalData.velocidad || 0,
        direccion: additionalData.direccion || 0
      };
      this.cache.put(cacheKey, JSON.stringify(locationData), 300); // 5 minutos

      // Verificar si hay entregas cercanas
      this.checkNearbyDeliveries(conductorId, lat, lng);

      console.log(`TMS Tracking: Ubicación actualizada para conductor ${conductorId}`);
      return { success: true, message: 'Ubicación actualizada correctamente' };

    } catch (error) {
      console.error('TMS Tracking: Error actualizando ubicación:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Obtiene la ubicación actual de un conductor
   */
  getDriverLocation(conductorId) {
    try {
      // Intentar obtener del cache primero
      const cacheKey = `conductor_location_${conductorId}`;
      const cached = this.cache.get(cacheKey);
      
      if (cached) {
        const locationData = JSON.parse(cached);
        // Verificar que no sea muy antigua (más de 10 minutos)
        if (new Date().getTime() - locationData.timestamp < 600000) {
          return {
            success: true,
            location: locationData,
            source: 'cache'
          };
        }
      }

      // Si no hay cache o es muy antigua, obtener de BD
      const conductor = this.db.getConductorById(conductorId);
      if (!conductor) {
        throw new Error('Conductor no encontrado');
      }

      if (!conductor.UltimaUbicacion) {
        return {
          success: false,
          error: 'No hay ubicación disponible para este conductor'
        };
      }

      const [lat, lng] = conductor.UltimaUbicacion.split(',');
      return {
        success: true,
        location: {
          lat: parseFloat(lat),
          lng: parseFloat(lng),
          timestamp: new Date(conductor.UltimaActualizacion).getTime(),
          velocidad: 0,
          direccion: 0
        },
        source: 'database'
      };

    } catch (error) {
      console.error('TMS Tracking: Error obteniendo ubicación:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Obtiene ubicaciones de todos los conductores activos
   */
  getAllDriverLocations() {
    try {
      const conductores = this.db.getConductores({ 
        estado: TMS_CONFIG.ESTADOS_CONDUCTOR.EN_RUTA 
      });

      const locations = [];
      
      conductores.forEach(conductor => {
        if (conductor.UltimaUbicacion) {
          const [lat, lng] = conductor.UltimaUbicacion.split(',');
          locations.push({
            conductorId: conductor.ID,
            nombre: `${conductor.Nombre} ${conductor.Apellido}`,
            lat: parseFloat(lat),
            lng: parseFloat(lng),
            timestamp: new Date(conductor.UltimaActualizacion).getTime(),
            vehiculo: conductor.VehiculoAsignado,
            estado: conductor.Estado
          });
        }
      });

      return { success: true, locations: locations };

    } catch (error) {
      console.error('TMS Tracking: Error obteniendo ubicaciones:', error);
      return { success: false, error: error.message };
    }
  }

  // ==================== TRACKING DE ENTREGAS ====================

  /**
   * Actualiza el estado de una entrega con tracking
   */
  updateDeliveryStatus(entregaId, nuevoEstado, conductorId, additionalData = {}) {
    try {
      console.log(`TMS Tracking: Actualizando estado entrega ${entregaId} a ${nuevoEstado}`);
      
      // Obtener ubicación actual del conductor
      const locationResult = this.getDriverLocation(conductorId);
      let lat = null, lng = null;
      
      if (locationResult.success) {
        lat = locationResult.location.lat;
        lng = locationResult.location.lng;
      }

      // Actualizar entrega en base de datos
      const updates = {
        Estado: nuevoEstado,
        UltimaActualizacion: new Date()
      };

      // Agregar datos específicos según el estado
      switch (nuevoEstado) {
        case TMS_CONFIG.ESTADOS_ENTREGA.EN_RUTA:
          updates.FechaInicioRuta = new Date();
          break;
        case TMS_CONFIG.ESTADOS_ENTREGA.EN_DESTINO:
          updates.FechaLlegada = new Date();
          if (lat && lng) {
            updates.Latitud = lat;
            updates.Longitud = lng;
          }
          break;
        case TMS_CONFIG.ESTADOS_ENTREGA.ENTREGADO:
          updates.FechaEntrega = new Date();
          updates.Receptor = additionalData.receptor || '';
          updates.FotoEntrega = additionalData.fotoUrl || '';
          if (lat && lng) {
            updates.Latitud = lat;
            updates.Longitud = lng;
          }
          // Calcular tiempo de entrega
          const entrega = this.db.getEntregaById(entregaId);
          if (entrega && entrega.FechaInicioRuta) {
            const tiempoEntrega = Math.round(
              (new Date() - new Date(entrega.FechaInicioRuta)) / (1000 * 60)
            );
            updates.TiempoEntrega = tiempoEntrega;
          }
          break;
        case TMS_CONFIG.ESTADOS_ENTREGA.RECHAZADO:
          updates.FechaRechazo = new Date();
          updates.MotivoRechazo = additionalData.motivo || '';
          break;
        case TMS_CONFIG.ESTADOS_ENTREGA.REPROGRAMADO:
          updates.FechaReprogramacion = new Date();
          updates.MotivoReprogramacion = additionalData.motivo || '';
          break;
      }

      const result = this.db.updateEntrega(entregaId, updates);
      if (!result.success) {
        throw new Error('Error actualizando entrega en BD');
      }

      // Registrar evento de tracking
      const trackingData = {
        ConductorID: conductorId,
        EntregaID: entregaId,
        Latitud: lat,
        Longitud: lng,
        Estado: nuevoEstado,
        Evento: `ENTREGA_${nuevoEstado}`,
        Observaciones: additionalData.observaciones || ''
      };

      this.db.addTrackingEvent(trackingData);

      // Enviar notificaciones si es necesario
      if (nuevoEstado === TMS_CONFIG.ESTADOS_ENTREGA.ENTREGADO) {
        this.sendDeliveryNotification(entregaId, 'ENTREGADO');
      } else if (nuevoEstado === TMS_CONFIG.ESTADOS_ENTREGA.EN_DESTINO) {
        this.sendDeliveryNotification(entregaId, 'EN_DESTINO');
      }

      console.log(`TMS Tracking: Estado actualizado para entrega ${entregaId}`);
      return { success: true, message: 'Estado de entrega actualizado correctamente' };

    } catch (error) {
      console.error('TMS Tracking: Error actualizando estado entrega:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Obtiene el tracking público de una entrega
   */
  getPublicDeliveryTracking(trackingCode) {
    try {
      // Buscar entrega por código de tracking
      const entregas = this.db.getEntregas();
      const entrega = entregas.find(e => 
        e.TrackingCode === trackingCode || 
        e.NV === trackingCode
      );

      if (!entrega) {
        return { success: false, error: 'Código de tracking no encontrado' };
      }

      // Obtener historial de tracking
      const historial = this.db.getTrackingHistory(entrega.NV);

      // Información pública (sin datos sensibles)
      const trackingInfo = {
        numeroEntrega: entrega.NV,
        cliente: entrega.Cliente,
        direccion: this.maskAddress(entrega.Direccion),
        estado: entrega.Estado,
        fechaCreacion: entrega.FechaCreacion,
        fechaAsignacion: entrega.FechaAsignacion,
        fechaInicioRuta: entrega.FechaInicioRuta,
        fechaEntrega: entrega.FechaEntrega,
        conductor: entrega.ConductorAsignado ? 'Asignado' : 'No asignado',
        tiempoEstimado: this.calculateEstimatedDeliveryTime(entrega),
        historial: historial.map(event => ({
          fecha: event.Timestamp,
          estado: event.Estado,
          evento: event.Evento,
          observaciones: event.Observaciones
        }))
      };

      return { success: true, tracking: trackingInfo };

    } catch (error) {
      console.error('TMS Tracking: Error obteniendo tracking público:', error);
      return { success: false, error: error.message };
    }
  }

  // ==================== FUNCIONES DE UTILIDAD ====================

  /**
   * Valida si las coordenadas son válidas
   */
  isValidCoordinate(lat, lng) {
    try {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);
      
      return !isNaN(latitude) && !isNaN(longitude) &&
             latitude >= -90 && latitude <= 90 &&
             longitude >= -180 && longitude <= 180;
    } catch (error) {
      return false;
    }
  }

  /**
   * Verifica entregas cercanas a la ubicación del conductor
   */
  checkNearbyDeliveries(conductorId, lat, lng) {
    try {
      // Obtener entregas asignadas al conductor
      const entregas = this.db.getEntregas({ conductorId: conductorId });
      const entregasEnRuta = entregas.filter(e => 
        e.Estado === TMS_CONFIG.ESTADOS_ENTREGA.EN_RUTA
      );

      entregasEnRuta.forEach(entrega => {
        if (entrega.Latitud && entrega.Longitud) {
          const distance = this.calculateDistance(
            lat, lng, 
            entrega.Latitud, entrega.Longitud
          );

          // Si está a menos de 200 metros, marcar como "en destino"
          if (distance < 0.2) {
            this.updateDeliveryStatus(
              entrega.NV, 
              TMS_CONFIG.ESTADOS_ENTREGA.EN_DESTINO, 
              conductorId,
              { observaciones: 'Llegada automática detectada por GPS' }
            );
          }
        }
      });

    } catch (error) {
      console.error('TMS Tracking: Error verificando entregas cercanas:', error);
    }
  }

  /**
   * Calcula distancia entre dos puntos (Haversine)
   */
  calculateDistance(lat1, lng1, lat2, lng2) {
    try {
      const R = 6371; // Radio de la Tierra en km
      const dLat = this.toRadians(lat2 - lat1);
      const dLng = this.toRadians(lng2 - lng1);
      
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
                Math.sin(dLng/2) * Math.sin(dLng/2);
      
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    } catch (error) {
      return 999; // Distancia muy grande si hay error
    }
  }

  /**
   * Convierte grados a radianes
   */
  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  /**
   * Enmascara una dirección para mostrar públicamente
   */
  maskAddress(address) {
    try {
      if (!address) return '';
      
      // Mostrar solo la calle y comuna, ocultar número
      const parts = address.split(',');
      if (parts.length > 1) {
        return parts[0].replace(/\d+/g, '***') + ', ' + parts[parts.length - 1];
      }
      
      return address.replace(/\d+/g, '***');
    } catch (error) {
      return 'Dirección no disponible';
    }
  }

  /**
   * Calcula tiempo estimado de entrega
   */
  calculateEstimatedDeliveryTime(entrega) {
    try {
      if (entrega.Estado === TMS_CONFIG.ESTADOS_ENTREGA.ENTREGADO) {
        return 'Entregado';
      }

      if (entrega.Estado === TMS_CONFIG.ESTADOS_ENTREGA.EN_DESTINO) {
        return '5-10 minutos';
      }

      if (entrega.Estado === TMS_CONFIG.ESTADOS_ENTREGA.EN_RUTA) {
        // Estimar basado en orden en ruta y tiempo promedio
        const ordenEnRuta = entrega.OrdenEnRuta || 1;
        const tiempoPorEntrega = 20; // 20 minutos promedio por entrega
        const tiempoEstimado = ordenEnRuta * tiempoPorEntrega;
        
        if (tiempoEstimado < 60) {
          return `${tiempoEstimado} minutos`;
        } else {
          const horas = Math.floor(tiempoEstimado / 60);
          const minutos = tiempoEstimado % 60;
          return `${horas}h ${minutos}m`;
        }
      }

      return 'Por definir';
    } catch (error) {
      return 'No disponible';
    }
  }

  /**
   * Envía notificación de entrega
   */
  sendDeliveryNotification(entregaId, tipo) {
    try {
      // Esta función se puede expandir para enviar SMS, emails, etc.
      console.log(`TMS Tracking: Enviando notificación ${tipo} para entrega ${entregaId}`);
      
      // Por ahora solo registramos el evento
      const trackingData = {
        EntregaID: entregaId,
        Evento: `NOTIFICACION_${tipo}`,
        Observaciones: `Notificación ${tipo} enviada al cliente`
      };

      this.db.addTrackingEvent(trackingData);
      
      return { success: true, message: 'Notificación enviada' };
    } catch (error) {
      console.error('TMS Tracking: Error enviando notificación:', error);
      return { success: false, error: error.message };
    }
  }

  // ==================== MÉTRICAS Y REPORTES ====================

  /**
   * Obtiene métricas de tracking
   */
  getTrackingMetrics(fechaInicio, fechaFin) {
    try {
      const entregas = this.db.getEntregas();
      
      // Filtrar por rango de fechas si se proporciona
      let entregasFiltradas = entregas;
      if (fechaInicio && fechaFin) {
        entregasFiltradas = entregas.filter(e => {
          const fechaEntrega = new Date(e.FechaCreacion);
          return fechaEntrega >= new Date(fechaInicio) && 
                 fechaEntrega <= new Date(fechaFin);
        });
      }

      // Calcular métricas
      const total = entregasFiltradas.length;
      const entregadas = entregasFiltradas.filter(e => 
        e.Estado === TMS_CONFIG.ESTADOS_ENTREGA.ENTREGADO
      ).length;
      const enRuta = entregasFiltradas.filter(e => 
        e.Estado === TMS_CONFIG.ESTADOS_ENTREGA.EN_RUTA
      ).length;
      const rechazadas = entregasFiltradas.filter(e => 
        e.Estado === TMS_CONFIG.ESTADOS_ENTREGA.RECHAZADO
      ).length;

      // Tiempo promedio de entrega
      const entregasConTiempo = entregasFiltradas.filter(e => 
        e.TiempoEntrega && e.TiempoEntrega > 0
      );
      const tiempoPromedio = entregasConTiempo.length > 0 ?
        entregasConTiempo.reduce((sum, e) => sum + e.TiempoEntrega, 0) / entregasConTiempo.length :
        0;

      return {
        success: true,
        metricas: {
          total: total,
          entregadas: entregadas,
          enRuta: enRuta,
          rechazadas: rechazadas,
          pendientes: total - entregadas - enRuta - rechazadas,
          tasaExito: total > 0 ? Math.round((entregadas / total) * 100) : 0,
          tiempoPromedioEntrega: Math.round(tiempoPromedio),
          eficiencia: this.calculateDeliveryEfficiency(entregasFiltradas)
        }
      };

    } catch (error) {
      console.error('TMS Tracking: Error obteniendo métricas:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Calcula la eficiencia de entregas
   */
  calculateDeliveryEfficiency(entregas) {
    try {
      if (entregas.length === 0) return 0;

      const entregasExitosas = entregas.filter(e => 
        e.Estado === TMS_CONFIG.ESTADOS_ENTREGA.ENTREGADO
      ).length;

      const entregasConTiempo = entregas.filter(e => 
        e.TiempoEntrega && e.TiempoEntrega > 0
      );

      // Eficiencia basada en tasa de éxito y tiempo promedio
      const tasaExito = entregasExitosas / entregas.length;
      
      let factorTiempo = 1;
      if (entregasConTiempo.length > 0) {
        const tiempoPromedio = entregasConTiempo.reduce((sum, e) => 
          sum + e.TiempoEntrega, 0
        ) / entregasConTiempo.length;
        
        // Penalizar tiempos muy largos (más de 60 minutos)
        factorTiempo = tiempoPromedio > 60 ? 0.8 : 1;
      }

      return Math.round(tasaExito * factorTiempo * 100);
    } catch (error) {
      return 0;
    }
  }

  /**
   * Genera reporte de tracking
   */
  generateTrackingReport(fechaInicio, fechaFin, formato = 'json') {
    try {
      const metricas = this.getTrackingMetrics(fechaInicio, fechaFin);
      const conductores = this.db.getConductores();
      const entregas = this.db.getEntregas();

      const reporte = {
        periodo: {
          inicio: fechaInicio,
          fin: fechaFin
        },
        resumen: metricas.metricas,
        conductores: conductores.map(c => ({
          id: c.ID,
          nombre: `${c.Nombre} ${c.Apellido}`,
          estado: c.Estado,
          entregasCompletadas: c.EntregasCompletadas || 0,
          calificacion: c.Calificacion || 0
        })),
        entregas: entregas.map(e => ({
          nv: e.NV,
          cliente: e.Cliente,
          estado: e.Estado,
          fechaCreacion: e.FechaCreacion,
          fechaEntrega: e.FechaEntrega,
          tiempoEntrega: e.TiempoEntrega
        }))
      };

      return { success: true, reporte: reporte };
    } catch (error) {
      console.error('TMS Tracking: Error generando reporte:', error);
      return { success: false, error: error.message };
    }
  }
}