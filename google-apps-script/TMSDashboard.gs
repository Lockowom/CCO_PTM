/**
 * TMS Dashboard - Dashboard Controller
 * Controlador del dashboard principal del TMS
 * 
 * @fileoverview Funciones para el dashboard del TMS con métricas en tiempo real
 * @author Sistema CCO
 * @version 1.0.0
 */

/**
 * Clase principal del Dashboard TMS
 */
class TMSDashboard {
  constructor() {
    // Usar funciones directas en lugar de clases para compatibilidad
    this.cache = CacheService.getScriptCache();
  }

  // ==================== MÉTRICAS PRINCIPALES ====================

  /**
   * Obtiene todas las métricas del dashboard
   */
  getDashboardMetrics() {
    try {
      console.log('TMS Dashboard: Obteniendo métricas...');
      
      // Intentar obtener del cache primero
      const cacheKey = 'dashboard_metrics';
      const cached = this.cache.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      // Obtener datos usando funciones directas
      const entregas = getTMSEntregas() || [];
      const conductores = getTMSConductores() || [];
      const vehiculos = getTMSVehiculos() || [];
      const rutas = getTMSRutas() || [];

      // Calcular métricas
      const metrics = {
        entregas: this.calculateEntregasMetrics(entregas),
        conductores: this.calculateConductoresMetrics(conductores),
        vehiculos: this.calculateVehiculosMetrics(vehiculos),
        rutas: this.calculateRutasMetrics(rutas),
        performance: this.calculatePerformanceMetrics(entregas),
        timestamp: new Date().toISOString()
      };

      // Guardar en cache por 2 minutos
      this.cache.put(cacheKey, JSON.stringify(metrics), 120);
      
      console.log('TMS Dashboard: Métricas calculadas correctamente');
      return { success: true, metrics: metrics };

    } catch (error) {
      console.error('TMS Dashboard: Error obteniendo métricas:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Calcula métricas de entregas
   */
  calculateEntregasMetrics(entregas) {
    const total = entregas.length;
    const pendientes = entregas.filter(e => e.Estado === TMS_CONFIG.ESTADOS_ENTREGA.PENDIENTE).length;
    const asignadas = entregas.filter(e => e.Estado === TMS_CONFIG.ESTADOS_ENTREGA.ASIGNADO).length;
    const enRuta = entregas.filter(e => e.Estado === TMS_CONFIG.ESTADOS_ENTREGA.EN_RUTA).length;
    const enDestino = entregas.filter(e => e.Estado === TMS_CONFIG.ESTADOS_ENTREGA.EN_DESTINO).length;
    const entregadas = entregas.filter(e => e.Estado === TMS_CONFIG.ESTADOS_ENTREGA.ENTREGADO).length;
    const rechazadas = entregas.filter(e => e.Estado === TMS_CONFIG.ESTADOS_ENTREGA.RECHAZADO).length;
    const reprogramadas = entregas.filter(e => e.Estado === TMS_CONFIG.ESTADOS_ENTREGA.REPROGRAMADO).length;

    // Calcular porcentajes
    const porcentajeExito = total > 0 ? Math.round((entregadas / total) * 100) : 0;
    const porcentajeRechazo = total > 0 ? Math.round((rechazadas / total) * 100) : 0;

    return {
      total: total,
      pendientes: pendientes,
      asignadas: asignadas,
      enRuta: enRuta,
      enDestino: enDestino,
      entregadas: entregadas,
      rechazadas: rechazadas,
      reprogramadas: reprogramadas,
      porcentajeExito: porcentajeExito,
      porcentajeRechazo: porcentajeRechazo,
      activas: enRuta + enDestino
    };
  }

  /**
   * Calcula métricas de conductores
   */
  calculateConductoresMetrics(conductores) {
    const total = conductores.length;
    const disponibles = conductores.filter(c => c.Estado === TMS_CONFIG.ESTADOS_CONDUCTOR.DISPONIBLE).length;
    const enRuta = conductores.filter(c => c.Estado === TMS_CONFIG.ESTADOS_CONDUCTOR.EN_RUTA).length;
    const ocupados = conductores.filter(c => c.Estado === TMS_CONFIG.ESTADOS_CONDUCTOR.OCUPADO).length;
    const descanso = conductores.filter(c => c.Estado === TMS_CONFIG.ESTADOS_CONDUCTOR.DESCANSO).length;
    const offline = conductores.filter(c => c.Estado === TMS_CONFIG.ESTADOS_CONDUCTOR.OFFLINE).length;

    // Calcular eficiencia promedio
    const conductoresConCalificacion = conductores.filter(c => c.Calificacion && c.Calificacion > 0);
    const calificacionPromedio = conductoresConCalificacion.length > 0 ?
      conductoresConCalificacion.reduce((sum, c) => sum + c.Calificacion, 0) / conductoresConCalificacion.length :
      0;

    return {
      total: total,
      disponibles: disponibles,
      enRuta: enRuta,
      ocupados: ocupados,
      descanso: descanso,
      offline: offline,
      activos: disponibles + enRuta + ocupados,
      calificacionPromedio: Math.round(calificacionPromedio * 10) / 10,
      utilizacion: total > 0 ? Math.round(((enRuta + ocupados) / total) * 100) : 0
    };
  }

  /**
   * Calcula métricas de vehículos
   */
  calculateVehiculosMetrics(vehiculos) {
    const total = vehiculos.length;
    const disponibles = vehiculos.filter(v => v.Estado === 'DISPONIBLE').length;
    const enUso = vehiculos.filter(v => v.Estado === 'EN_USO').length;
    const mantenimiento = vehiculos.filter(v => v.Estado === 'MANTENIMIENTO').length;
    const inactivos = vehiculos.filter(v => !v.Activo).length;

    return {
      total: total,
      disponibles: disponibles,
      enUso: enUso,
      mantenimiento: mantenimiento,
      inactivos: inactivos,
      utilizacion: total > 0 ? Math.round((enUso / total) * 100) : 0
    };
  }

  /**
   * Calcula métricas de rutas
   */
  calculateRutasMetrics(rutas) {
    const total = rutas.length;
    const planificadas = rutas.filter(r => r.Estado === 'PLANIFICADA').length;
    const enProgreso = rutas.filter(r => r.Estado === 'EN_PROGRESO').length;
    const completadas = rutas.filter(r => r.Estado === 'COMPLETADA').length;
    const canceladas = rutas.filter(r => r.Estado === 'CANCELADA').length;

    return {
      total: total,
      planificadas: planificadas,
      enProgreso: enProgreso,
      completadas: completadas,
      canceladas: canceladas,
      activas: planificadas + enProgreso
    };
  }

  /**
   * Calcula métricas de performance
   */
  calculatePerformanceMetrics(entregas) {
    const hoy = new Date();
    const inicioHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
    
    // Entregas de hoy
    const entregasHoy = entregas.filter(e => {
      const fechaEntrega = new Date(e.FechaCreacion);
      return fechaEntrega >= inicioHoy;
    });

    // Entregas completadas hoy
    const completadasHoy = entregasHoy.filter(e => e.Estado === TMS_CONFIG.ESTADOS_ENTREGA.ENTREGADO);

    // Tiempo promedio de entrega
    const entregasConTiempo = completadasHoy.filter(e => e.TiempoEntrega && e.TiempoEntrega > 0);
    const tiempoPromedio = entregasConTiempo.length > 0 ?
      entregasConTiempo.reduce((sum, e) => sum + e.TiempoEntrega, 0) / entregasConTiempo.length :
      0;

    return {
      entregasHoy: entregasHoy.length,
      completadasHoy: completadasHoy.length,
      tiempoPromedioEntrega: Math.round(tiempoPromedio),
      eficienciaHoy: entregasHoy.length > 0 ? Math.round((completadasHoy.length / entregasHoy.length) * 100) : 0
    };
  }

  // ==================== ENTREGAS ACTIVAS ====================

  /**
   * Obtiene lista de entregas activas para el dashboard
   */
  getActiveDeliveries(limit = 10) {
    try {
      const entregas = getTMSEntregas({
        estado: [TMS_CONFIG.ESTADOS_ENTREGA.EN_RUTA, TMS_CONFIG.ESTADOS_ENTREGA.EN_DESTINO]
      }) || [];

      // Ordenar por prioridad y fecha
      const entregasOrdenadas = entregas.sort((a, b) => {
        // Prioridad: ALTA > MEDIA > BAJA
        const prioridadA = a.Prioridad === 'ALTA' ? 3 : a.Prioridad === 'MEDIA' ? 2 : 1;
        const prioridadB = b.Prioridad === 'ALTA' ? 3 : b.Prioridad === 'MEDIA' ? 2 : 1;
        
        if (prioridadA !== prioridadB) {
          return prioridadB - prioridadA;
        }
        
        // Si tienen la misma prioridad, ordenar por fecha
        return new Date(a.FechaAsignacion) - new Date(b.FechaAsignacion);
      });

      // Limitar resultados y agregar información adicional
      const entregasActivas = entregasOrdenadas.slice(0, limit).map(entrega => {
        const conductor = getTMSConductorById(entrega.ConductorAsignado);
        
        return {
          nv: entrega.NV,
          cliente: entrega.Cliente,
          direccion: entrega.Direccion,
          telefono: entrega.Telefono,
          estado: entrega.Estado,
          prioridad: entrega.Prioridad,
          conductorNombre: conductor ? `${conductor.Nombre} ${conductor.Apellido}` : 'No asignado',
          conductorTelefono: conductor ? conductor.Telefono : '',
          tiempoEstimado: this.calculateEstimatedTime(entrega),
          fechaAsignacion: entrega.FechaAsignacion,
          observaciones: entrega.Observaciones || ''
        };
      });

      return { success: true, entregas: entregasActivas };

    } catch (error) {
      console.error('TMS Dashboard: Error obteniendo entregas activas:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Calcula tiempo estimado de entrega
   */
  calculateEstimatedTime(entrega) {
    try {
      if (entrega.Estado === TMS_CONFIG.ESTADOS_ENTREGA.EN_DESTINO) {
        return '5-10 min';
      }

      if (entrega.OrdenEnRuta) {
        const tiempoPorEntrega = 20; // 20 minutos promedio
        const tiempoEstimado = entrega.OrdenEnRuta * tiempoPorEntrega;
        
        if (tiempoEstimado < 60) {
          return `${tiempoEstimado} min`;
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

  // ==================== UBICACIONES DE CONDUCTORES ====================

  /**
   * Obtiene ubicaciones de conductores para el mapa
   */
  getDriverLocations() {
    try {
      const locations = getTMSDriverLocations() || [];
      
      if (locations.length > 0) {
        // Agregar información adicional de entregas
        const locationsWithDeliveries = locations.map(location => {
          const entregas = getTMSEntregas({ conductorId: location.conductorId }) || [];
          const entregasActivas = entregas.filter(e => 
            e.Estado === TMS_CONFIG.ESTADOS_ENTREGA.EN_RUTA || 
            e.Estado === TMS_CONFIG.ESTADOS_ENTREGA.EN_DESTINO
          );

          return {
            ...location,
            entregasAsignadas: entregas.length,
            entregasActivas: entregasActivas.length,
            proximaEntrega: entregasActivas.length > 0 ? entregasActivas[0].Cliente : null
          };
        });

        return { success: true, locations: locationsWithDeliveries };
      }

      return { success: true, locations: [] };
    } catch (error) {
      console.error('TMS Dashboard: Error obteniendo ubicaciones:', error);
      return { success: false, error: error.message };
    }
  }

  // ==================== ALERTAS Y NOTIFICACIONES ====================

  /**
   * Obtiene alertas del sistema
   */
  getSystemAlerts() {
    try {
      const alerts = [];
      
      // Verificar entregas retrasadas
      const entregas = getTMSEntregas() || [];
      const now = new Date();
      
      entregas.forEach(entrega => {
        if (entrega.Estado === TMS_CONFIG.ESTADOS_ENTREGA.EN_RUTA) {
          const fechaAsignacion = new Date(entrega.FechaAsignacion);
          const horasTranscurridas = (now - fechaAsignacion) / (1000 * 60 * 60);
          
          if (horasTranscurridas > 4) { // Más de 4 horas
            alerts.push({
              tipo: 'warning',
              titulo: 'Entrega Retrasada',
              mensaje: `Entrega ${entrega.NV} lleva ${Math.round(horasTranscurridas)} horas en ruta`,
              entregaId: entrega.NV,
              timestamp: now
            });
          }
        }
      });

      // Verificar conductores offline
      const conductores = getTMSConductores() || [];
      conductores.forEach(conductor => {
        if (conductor.Estado === TMS_CONFIG.ESTADOS_CONDUCTOR.EN_RUTA) {
          const ultimaActualizacion = new Date(conductor.UltimaActualizacion);
          const minutosTranscurridos = (now - ultimaActualizacion) / (1000 * 60);
          
          if (minutosTranscurridos > 30) { // Más de 30 minutos sin actualizar
            alerts.push({
              tipo: 'error',
              titulo: 'Conductor Sin Señal',
              mensaje: `${conductor.Nombre} ${conductor.Apellido} sin actualizar ubicación por ${Math.round(minutosTranscurridos)} min`,
              conductorId: conductor.ID,
              timestamp: now
            });
          }
        }
      });

      // Ordenar por timestamp (más recientes primero)
      alerts.sort((a, b) => b.timestamp - a.timestamp);

      return { success: true, alerts: alerts.slice(0, 5) }; // Máximo 5 alertas

    } catch (error) {
      console.error('TMS Dashboard: Error obteniendo alertas:', error);
      return { success: false, error: error.message };
    }
  }

  // ==================== FUNCIONES DE ACTUALIZACIÓN ====================

  /**
   * Refresca todas las métricas del dashboard
   */
  refreshDashboard() {
    try {
      // Limpiar cache
      this.cache.remove('dashboard_metrics');
      
      // Obtener métricas frescas
      const metrics = this.getDashboardMetrics();
      const activeDeliveries = this.getActiveDeliveries();
      const driverLocations = this.getDriverLocations();
      const alerts = this.getSystemAlerts();

      return {
        success: true,
        data: {
          metrics: metrics.success ? metrics.metrics : null,
          activeDeliveries: activeDeliveries.success ? activeDeliveries.entregas : [],
          driverLocations: driverLocations.success ? driverLocations.locations : [],
          alerts: alerts.success ? alerts.alerts : []
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('TMS Dashboard: Error refrescando dashboard:', error);
      return { success: false, error: error.message };
    }
  }
}

// ==================== FUNCIONES GLOBALES ====================

/**
 * Obtiene todas las métricas del dashboard
 */
function getTMSDashboardData() {
  try {
    console.log('TMS Dashboard: Obteniendo datos del dashboard...');
    
    // Auto-inicializar TMS si no está inicializado
    if (typeof autoInitTMS === 'function') {
      autoInitTMS();
    }
    
    // Datos de ejemplo para mostrar el dashboard funcionando
    const mockData = {
      metrics: {
        entregas: {
          total: 25,
          pendientes: 8,
          asignadas: 5,
          enRuta: 7,
          enDestino: 2,
          entregadas: 15,
          rechazadas: 1,
          reprogramadas: 2,
          porcentajeExito: 60,
          porcentajeRechazo: 4,
          activas: 9
        },
        conductores: {
          total: 6,
          disponibles: 2,
          enRuta: 3,
          ocupados: 1,
          descanso: 0,
          offline: 0,
          activos: 6,
          calificacionPromedio: 4.5,
          utilizacion: 67
        },
        vehiculos: {
          total: 8,
          disponibles: 3,
          enUso: 4,
          mantenimiento: 1,
          inactivos: 0,
          utilizacion: 50
        },
        performance: {
          entregasHoy: 12,
          completadasHoy: 8,
          tiempoPromedioEntrega: 25,
          eficienciaHoy: 67
        }
      },
      activeDeliveries: [
        {
          nv: 'NV001',
          cliente: 'Farmacia Central',
          direccion: 'Av. Providencia 1234, Santiago',
          telefono: '+56912345678',
          estado: 'EN_RUTA',
          prioridad: 'ALTA',
          conductorNombre: 'Juan Pérez',
          conductorTelefono: '+56987654321',
          tiempoEstimado: '15 min',
          fechaAsignacion: new Date(),
          observaciones: ''
        },
        {
          nv: 'NV002',
          cliente: 'Hospital San Juan',
          direccion: 'Calle Los Médicos 567, Las Condes',
          telefono: '+56923456789',
          estado: 'EN_DESTINO',
          prioridad: 'ALTA',
          conductorNombre: 'María González',
          conductorTelefono: '+56976543210',
          tiempoEstimado: '5 min',
          fechaAsignacion: new Date(),
          observaciones: 'Cliente esperando'
        },
        {
          nv: 'NV003',
          cliente: 'Clínica Alemana',
          direccion: 'Av. Vitacura 5951, Vitacura',
          telefono: '+56934567890',
          estado: 'EN_RUTA',
          prioridad: 'MEDIA',
          conductorNombre: 'Carlos López',
          conductorTelefono: '+56965432109',
          tiempoEstimado: '30 min',
          fechaAsignacion: new Date(),
          observaciones: ''
        }
      ],
      driverLocations: [
        {
          conductorId: 'COND001',
          conductorNombre: 'Juan Pérez',
          latitud: -33.4489,
          longitud: -70.6693,
          estado: 'EN_RUTA',
          ultimaActualizacion: new Date(),
          entregasAsignadas: 3,
          entregasActivas: 2,
          proximaEntrega: 'Farmacia Central'
        },
        {
          conductorId: 'COND002',
          conductorNombre: 'María González',
          latitud: -33.4150,
          longitud: -70.5475,
          estado: 'EN_DESTINO',
          ultimaActualizacion: new Date(),
          entregasAsignadas: 2,
          entregasActivas: 1,
          proximaEntrega: 'Hospital San Juan'
        }
      ],
      alerts: [
        {
          tipo: 'warning',
          titulo: 'Entrega Retrasada',
          mensaje: 'Entrega NV004 lleva 3 horas en ruta sin actualización',
          entregaId: 'NV004',
          timestamp: new Date()
        },
        {
          tipo: 'error',
          titulo: 'Conductor Sin Señal',
          mensaje: 'Pedro Martínez sin actualizar ubicación por 45 min',
          conductorId: 'COND003',
          timestamp: new Date()
        }
      ]
    };
    
    console.log('TMS Dashboard: Datos mock generados correctamente');
    return {
      success: true,
      data: mockData,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('TMS Dashboard: Error obteniendo datos:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Función global para obtener métricas específicas
 */
function getTMSMetrics() {
  try {
    const result = getTMSDashboardData();
    if (result.success) {
      return { success: true, metrics: result.data.metrics };
    }
    return result;
  } catch (error) {
    console.error('Error obteniendo métricas TMS:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Función global para obtener entregas activas
 */
function getTMSActiveDeliveries(limit = 10) {
  try {
    const result = getTMSDashboardData();
    if (result.success) {
      const deliveries = result.data.activeDeliveries.slice(0, limit);
      return { success: true, entregas: deliveries };
    }
    return result;
  } catch (error) {
    console.error('Error obteniendo entregas activas TMS:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Función global para obtener ubicaciones de conductores
 */
function getTMSDriverLocations() {
  try {
    const result = getTMSDashboardData();
    if (result.success) {
      return { success: true, locations: result.data.driverLocations };
    }
    return result;
  } catch (error) {
    console.error('Error obteniendo ubicaciones de conductores TMS:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Función global para obtener alertas del sistema
 */
function getTMSAlerts() {
  try {
    const result = getTMSDashboardData();
    if (result.success) {
      return { success: true, alerts: result.data.alerts };
    }
    return result;
  } catch (error) {
    console.error('Error obteniendo alertas TMS:', error);
    return { success: false, error: error.message };
  }
}