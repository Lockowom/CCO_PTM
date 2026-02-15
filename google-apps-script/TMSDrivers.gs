/**
 * TMS Drivers Management System
 * Sistema de gestión de conductores para TMS
 * 
 * @fileoverview Gestión completa de conductores, vehículos y asignaciones
 * @author Sistema CCO
 * @version 1.0.0
 */

/**
 * Clase principal para gestión de conductores
 */
class TMSDrivers {
  constructor() {
    this.database = new TMSDatabase();
    this.tracking = new TMSTracking();
    this.cache = CacheService.getScriptCache();
  }

  // ==================== GESTIÓN DE CONDUCTORES ====================

  /**
   * Obtiene todos los conductores con información completa
   */
  getAllDrivers() {
    try {
      console.log('TMSDrivers: Obteniendo todos los conductores...');
      
      const conductores = this.database.getConductores();
      const vehiculos = this.database.getVehiculos();
      const entregas = this.database.getEntregas();
      
      return conductores.map(conductor => {
        const vehiculo = vehiculos.find(v => v.ID === conductor.VehiculoAsignado);
        const entregasAsignadas = entregas.filter(e => e.ConductorAsignado === conductor.ID);
        const entregasCompletadas = entregasAsignadas.filter(e => e.Estado === TMS_CONFIG.ESTADOS_ENTREGA.ENTREGADO);
        const entregasEnRuta = entregasAsignadas.filter(e => 
          e.Estado === TMS_CONFIG.ESTADOS_ENTREGA.EN_RUTA || 
          e.Estado === TMS_CONFIG.ESTADOS_ENTREGA.EN_DESTINO
        );
        
        // Calcular métricas de rendimiento
        const metricas = this.calculateDriverMetrics(conductor.ID);
        
        return {
          id: conductor.ID,
          nombre: conductor.Nombre,
          apellido: conductor.Apellido,
          nombreCompleto: `${conductor.Nombre} ${conductor.Apellido}`,
          telefono: conductor.Telefono,
          email: conductor.Email,
          licencia: conductor.Licencia,
          fechaIngreso: conductor.FechaIngreso,
          estado: conductor.Estado,
          vehiculo: vehiculo ? {
            id: vehiculo.ID,
            placa: vehiculo.Placa,
            modelo: vehiculo.Modelo,
            tipo: vehiculo.Tipo
          } : null,
          estadisticas: {
            entregasAsignadas: entregasAsignadas.length,
            entregasCompletadas: entregasCompletadas.length,
            entregasEnRuta: entregasEnRuta.length,
            eficiencia: entregasAsignadas.length > 0 ? 
              Math.round((entregasCompletadas.length / entregasAsignadas.length) * 100) : 0
          },
          metricas: metricas,
          ultimaActualizacion: conductor.UltimaActualizacion,
          ubicacionActual: this.tracking.getDriverLocation(conductor.ID)
        };
      });
    } catch (error) {
      console.error('TMSDrivers: Error obteniendo conductores:', error);
      return [];
    }
  }

  /**
   * Obtiene un conductor específico por ID
   */
  getDriverById(driverId) {
    try {
      const drivers = this.getAllDrivers();
      return drivers.find(driver => driver.id === driverId) || null;
    } catch (error) {
      console.error('TMSDrivers: Error obteniendo conductor:', error);
      return null;
    }
  }

  /**
   * Crea un nuevo conductor
   */
  createDriver(driverData) {
    try {
      console.log('TMSDrivers: Creando nuevo conductor:', driverData);
      
      // Validar datos requeridos
      if (!driverData.nombre || !driverData.apellido || !driverData.telefono) {
        throw new Error('Datos requeridos faltantes: nombre, apellido, teléfono');
      }
      
      // Validar que no exista conductor con mismo teléfono
      const existingDrivers = this.database.getConductores();
      const duplicatePhone = existingDrivers.find(c => c.Telefono === driverData.telefono);
      if (duplicatePhone) {
        throw new Error('Ya existe un conductor con ese número de teléfono');
      }
      
      // Generar ID único
      const newId = 'DRV_' + new Date().getTime();
      
      const newDriver = {
        ID: newId,
        Nombre: driverData.nombre,
        Apellido: driverData.apellido,
        Telefono: driverData.telefono,
        Email: driverData.email || '',
        Licencia: driverData.licencia || '',
        FechaIngreso: new Date().toISOString(),
        Estado: TMS_CONFIG.ESTADOS_CONDUCTOR.DISPONIBLE,
        VehiculoAsignado: driverData.vehiculoId || '',
        UltimaActualizacion: new Date().toISOString(),
        Observaciones: driverData.observaciones || ''
      };
      
      const result = this.database.crearConductor(newDriver);
      
      if (result.success) {
        console.log('TMSDrivers: Conductor creado exitosamente:', newId);
        return { success: true, driverId: newId, driver: newDriver };
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('TMSDrivers: Error creando conductor:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Actualiza un conductor existente
   */
  updateDriver(driverId, updateData) {
    try {
      console.log('TMSDrivers: Actualizando conductor:', driverId, updateData);
      
      const existingDriver = this.database.getConductorById(driverId);
      if (!existingDriver) {
        throw new Error('Conductor no encontrado');
      }
      
      // Validar teléfono único si se está cambiando
      if (updateData.telefono && updateData.telefono !== existingDriver.Telefono) {
        const existingDrivers = this.database.getConductores();
        const duplicatePhone = existingDrivers.find(c => 
          c.Telefono === updateData.telefono && c.ID !== driverId
        );
        if (duplicatePhone) {
          throw new Error('Ya existe un conductor con ese número de teléfono');
        }
      }
      
      const updatedDriver = {
        ...existingDriver,
        Nombre: updateData.nombre || existingDriver.Nombre,
        Apellido: updateData.apellido || existingDriver.Apellido,
        Telefono: updateData.telefono || existingDriver.Telefono,
        Email: updateData.email !== undefined ? updateData.email : existingDriver.Email,
        Licencia: updateData.licencia !== undefined ? updateData.licencia : existingDriver.Licencia,
        Estado: updateData.estado || existingDriver.Estado,
        VehiculoAsignado: updateData.vehiculoId !== undefined ? updateData.vehiculoId : existingDriver.VehiculoAsignado,
        UltimaActualizacion: new Date().toISOString(),
        Observaciones: updateData.observaciones !== undefined ? updateData.observaciones : existingDriver.Observaciones
      };
      
      const result = this.database.actualizarConductor(driverId, updatedDriver);
      
      if (result.success) {
        console.log('TMSDrivers: Conductor actualizado exitosamente:', driverId);
        return { success: true, driver: updatedDriver };
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('TMSDrivers: Error actualizando conductor:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Elimina un conductor (cambio de estado a INACTIVO)
   */
  deleteDriver(driverId) {
    try {
      console.log('TMSDrivers: Eliminando conductor:', driverId);
      
      // Verificar que no tenga entregas activas
      const entregas = this.database.getEntregas();
      const entregasActivas = entregas.filter(e => 
        e.ConductorAsignado === driverId && 
        (e.Estado === TMS_CONFIG.ESTADOS_ENTREGA.EN_RUTA || 
         e.Estado === TMS_CONFIG.ESTADOS_ENTREGA.EN_DESTINO ||
         e.Estado === TMS_CONFIG.ESTADOS_ENTREGA.ASIGNADO)
      );
      
      if (entregasActivas.length > 0) {
        throw new Error('No se puede eliminar conductor con entregas activas');
      }
      
      // Cambiar estado a INACTIVO en lugar de eliminar
      const result = this.updateDriver(driverId, { 
        estado: TMS_CONFIG.ESTADOS_CONDUCTOR.INACTIVO 
      });
      
      if (result.success) {
        console.log('TMSDrivers: Conductor marcado como inactivo:', driverId);
        return { success: true, message: 'Conductor marcado como inactivo' };
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('TMSDrivers: Error eliminando conductor:', error);
      return { success: false, error: error.message };
    }
  }

  // ==================== GESTIÓN DE VEHÍCULOS ====================

  /**
   * Obtiene todos los vehículos
   */
  getAllVehicles() {
    try {
      console.log('TMSDrivers: Obteniendo todos los vehículos...');
      
      const vehiculos = this.database.getVehiculos();
      const conductores = this.database.getConductores();
      
      return vehiculos.map(vehiculo => {
        const conductor = conductores.find(c => c.VehiculoAsignado === vehiculo.ID);
        
        return {
          id: vehiculo.ID,
          placa: vehiculo.Placa,
          modelo: vehiculo.Modelo,
          marca: vehiculo.Marca,
          año: vehiculo.Año,
          tipo: vehiculo.Tipo,
          capacidad: vehiculo.Capacidad,
          estado: vehiculo.Estado,
          conductor: conductor ? {
            id: conductor.ID,
            nombre: `${conductor.Nombre} ${conductor.Apellido}`,
            telefono: conductor.Telefono
          } : null,
          fechaRegistro: vehiculo.FechaRegistro,
          ultimoMantenimiento: vehiculo.UltimoMantenimiento,
          proximoMantenimiento: vehiculo.ProximoMantenimiento,
          observaciones: vehiculo.Observaciones
        };
      });
    } catch (error) {
      console.error('TMSDrivers: Error obteniendo vehículos:', error);
      return [];
    }
  }

  /**
   * Crea un nuevo vehículo
   */
  createVehicle(vehicleData) {
    try {
      console.log('TMSDrivers: Creando nuevo vehículo:', vehicleData);
      
      // Validar datos requeridos
      if (!vehicleData.placa || !vehicleData.modelo) {
        throw new Error('Datos requeridos faltantes: placa, modelo');
      }
      
      // Validar que no exista vehículo con misma placa
      const existingVehicles = this.database.getVehiculos();
      const duplicatePlate = existingVehicles.find(v => v.Placa === vehicleData.placa);
      if (duplicatePlate) {
        throw new Error('Ya existe un vehículo con esa placa');
      }
      
      // Generar ID único
      const newId = 'VEH_' + new Date().getTime();
      
      const newVehicle = {
        ID: newId,
        Placa: vehicleData.placa,
        Modelo: vehicleData.modelo,
        Marca: vehicleData.marca || '',
        Año: vehicleData.año || '',
        Tipo: vehicleData.tipo || 'CAMIONETA',
        Capacidad: vehicleData.capacidad || '',
        Estado: 'DISPONIBLE',
        FechaRegistro: new Date().toISOString(),
        UltimoMantenimiento: vehicleData.ultimoMantenimiento || '',
        ProximoMantenimiento: vehicleData.proximoMantenimiento || '',
        Observaciones: vehicleData.observaciones || ''
      };
      
      const result = this.database.crearVehiculo(newVehicle);
      
      if (result.success) {
        console.log('TMSDrivers: Vehículo creado exitosamente:', newId);
        return { success: true, vehicleId: newId, vehicle: newVehicle };
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('TMSDrivers: Error creando vehículo:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Asigna un vehículo a un conductor
   */
  assignVehicleToDriver(driverId, vehicleId) {
    try {
      console.log('TMSDrivers: Asignando vehículo:', vehicleId, 'a conductor:', driverId);
      
      // Verificar que el conductor existe
      const driver = this.database.getConductorById(driverId);
      if (!driver) {
        throw new Error('Conductor no encontrado');
      }
      
      // Verificar que el vehículo existe y está disponible
      const vehicle = this.database.getVehiculoById(vehicleId);
      if (!vehicle) {
        throw new Error('Vehículo no encontrado');
      }
      
      if (vehicle.Estado !== 'DISPONIBLE') {
        throw new Error('Vehículo no está disponible');
      }
      
      // Liberar vehículo anterior del conductor si existe
      if (driver.VehiculoAsignado) {
        const oldVehicle = this.database.getVehiculoById(driver.VehiculoAsignado);
        if (oldVehicle) {
          this.database.actualizarVehiculo(driver.VehiculoAsignado, {
            ...oldVehicle,
            Estado: 'DISPONIBLE'
          });
        }
      }
      
      // Asignar nuevo vehículo
      const driverResult = this.database.actualizarConductor(driverId, {
        ...driver,
        VehiculoAsignado: vehicleId,
        UltimaActualizacion: new Date().toISOString()
      });
      
      const vehicleResult = this.database.actualizarVehiculo(vehicleId, {
        ...vehicle,
        Estado: 'EN_USO'
      });
      
      if (driverResult.success && vehicleResult.success) {
        console.log('TMSDrivers: Asignación exitosa');
        return { success: true, message: 'Vehículo asignado correctamente' };
      } else {
        throw new Error('Error en la asignación');
      }
    } catch (error) {
      console.error('TMSDrivers: Error asignando vehículo:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Desasigna un vehículo de un conductor
   */
  unassignVehicleFromDriver(driverId) {
    try {
      console.log('TMSDrivers: Desasignando vehículo del conductor:', driverId);
      
      const driver = this.database.getConductorById(driverId);
      if (!driver) {
        throw new Error('Conductor no encontrado');
      }
      
      if (!driver.VehiculoAsignado) {
        throw new Error('Conductor no tiene vehículo asignado');
      }
      
      // Liberar vehículo
      const vehicle = this.database.getVehiculoById(driver.VehiculoAsignado);
      if (vehicle) {
        this.database.actualizarVehiculo(driver.VehiculoAsignado, {
          ...vehicle,
          Estado: 'DISPONIBLE'
        });
      }
      
      // Actualizar conductor
      const result = this.database.actualizarConductor(driverId, {
        ...driver,
        VehiculoAsignado: '',
        UltimaActualizacion: new Date().toISOString()
      });
      
      if (result.success) {
        console.log('TMSDrivers: Vehículo desasignado exitosamente');
        return { success: true, message: 'Vehículo desasignado correctamente' };
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('TMSDrivers: Error desasignando vehículo:', error);
      return { success: false, error: error.message };
    }
  }

  // ==================== MÉTRICAS Y RENDIMIENTO ====================

  /**
   * Calcula métricas de rendimiento de un conductor
   */
  calculateDriverMetrics(driverId) {
    try {
      const entregas = this.database.getEntregas();
      const driverDeliveries = entregas.filter(e => e.ConductorAsignado === driverId);
      
      // Filtrar entregas del último mes
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      
      const recentDeliveries = driverDeliveries.filter(e => {
        if (!e.FechaCreacion) return false;
        const deliveryDate = new Date(e.FechaCreacion);
        return deliveryDate >= lastMonth;
      });
      
      const completedDeliveries = recentDeliveries.filter(e => 
        e.Estado === TMS_CONFIG.ESTADOS_ENTREGA.ENTREGADO
      );
      
      const failedDeliveries = recentDeliveries.filter(e => 
        e.Estado === TMS_CONFIG.ESTADOS_ENTREGA.FALLIDO
      );
      
      // Calcular tiempo promedio de entrega
      let avgDeliveryTime = 0;
      if (completedDeliveries.length > 0) {
        const totalTime = completedDeliveries.reduce((sum, delivery) => {
          if (delivery.FechaAsignacion && delivery.FechaEntrega) {
            const assignTime = new Date(delivery.FechaAsignacion);
            const deliveryTime = new Date(delivery.FechaEntrega);
            return sum + (deliveryTime - assignTime);
          }
          return sum;
        }, 0);
        
        avgDeliveryTime = Math.round(totalTime / completedDeliveries.length / (1000 * 60)); // en minutos
      }
      
      return {
        entregasUltimoMes: recentDeliveries.length,
        entregasCompletadas: completedDeliveries.length,
        entregasFallidas: failedDeliveries.length,
        tasaExito: recentDeliveries.length > 0 ? 
          Math.round((completedDeliveries.length / recentDeliveries.length) * 100) : 0,
        tiempoPromedioEntrega: avgDeliveryTime,
        puntuacion: this.calculateDriverScore(driverId, recentDeliveries)
      };
    } catch (error) {
      console.error('TMSDrivers: Error calculando métricas:', error);
      return {
        entregasUltimoMes: 0,
        entregasCompletadas: 0,
        entregasFallidas: 0,
        tasaExito: 0,
        tiempoPromedioEntrega: 0,
        puntuacion: 0
      };
    }
  }

  /**
   * Calcula puntuación de rendimiento del conductor
   */
  calculateDriverScore(driverId, deliveries) {
    try {
      if (deliveries.length === 0) return 0;
      
      const completed = deliveries.filter(e => e.Estado === TMS_CONFIG.ESTADOS_ENTREGA.ENTREGADO).length;
      const failed = deliveries.filter(e => e.Estado === TMS_CONFIG.ESTADOS_ENTREGA.FALLIDO).length;
      
      // Puntuación base por tasa de éxito (0-70 puntos)
      const successRate = completed / deliveries.length;
      let score = successRate * 70;
      
      // Bonificación por volumen (0-20 puntos)
      const volumeBonus = Math.min(deliveries.length / 50, 1) * 20;
      score += volumeBonus;
      
      // Penalización por fallos (-10 puntos por cada 10% de fallos)
      const failureRate = failed / deliveries.length;
      const failurePenalty = failureRate * 100;
      score -= failurePenalty;
      
      // Bonificación por consistencia (0-10 puntos)
      const consistencyBonus = deliveries.length >= 10 ? 10 : 0;
      score += consistencyBonus;
      
      return Math.max(0, Math.min(100, Math.round(score)));
    } catch (error) {
      console.error('TMSDrivers: Error calculando puntuación:', error);
      return 0;
    }
  }

  /**
   * Obtiene estadísticas generales de conductores
   */
  getDriversStatistics() {
    try {
      const drivers = this.getAllDrivers();
      const vehicles = this.getAllVehicles();
      
      const activeDrivers = drivers.filter(d => d.estado === TMS_CONFIG.ESTADOS_CONDUCTOR.DISPONIBLE || 
                                                d.estado === TMS_CONFIG.ESTADOS_CONDUCTOR.EN_RUTA);
      const availableDrivers = drivers.filter(d => d.estado === TMS_CONFIG.ESTADOS_CONDUCTOR.DISPONIBLE);
      const busyDrivers = drivers.filter(d => d.estado === TMS_CONFIG.ESTADOS_CONDUCTOR.EN_RUTA);
      
      const availableVehicles = vehicles.filter(v => v.estado === 'DISPONIBLE');
      const busyVehicles = vehicles.filter(v => v.estado === 'EN_USO');
      
      return {
        conductores: {
          total: drivers.length,
          activos: activeDrivers.length,
          disponibles: availableDrivers.length,
          enRuta: busyDrivers.length,
          utilizacion: drivers.length > 0 ? Math.round((busyDrivers.length / drivers.length) * 100) : 0
        },
        vehiculos: {
          total: vehicles.length,
          disponibles: availableVehicles.length,
          enUso: busyVehicles.length,
          utilizacion: vehicles.length > 0 ? Math.round((busyVehicles.length / vehicles.length) * 100) : 0
        },
        rendimiento: {
          puntuacionPromedio: drivers.length > 0 ? 
            Math.round(drivers.reduce((sum, d) => sum + (d.metricas?.puntuacion || 0), 0) / drivers.length) : 0,
          tasaExitoPromedio: drivers.length > 0 ?
            Math.round(drivers.reduce((sum, d) => sum + (d.metricas?.tasaExito || 0), 0) / drivers.length) : 0
        }
      };
    } catch (error) {
      console.error('TMSDrivers: Error obteniendo estadísticas:', error);
      return {};
    }
  }
}

// ==================== FUNCIONES GLOBALES ====================

/**
 * Obtiene todos los conductores
 */
function getTMSDrivers() {
  try {
    const driversManager = new TMSDrivers();
    return driversManager.getAllDrivers();
  } catch (error) {
    console.error('Error en getTMSDrivers:', error);
    return { error: error.message };
  }
}

/**
 * Obtiene un conductor específico
 */
function getTMSDriverById(driverId) {
  try {
    const driversManager = new TMSDrivers();
    return driversManager.getDriverById(driverId);
  } catch (error) {
    console.error('Error en getTMSDriverById:', error);
    return { error: error.message };
  }
}

/**
 * Crea un nuevo conductor
 */
function createTMSDriver(driverData) {
  try {
    const driversManager = new TMSDrivers();
    return driversManager.createDriver(driverData);
  } catch (error) {
    console.error('Error en createTMSDriver:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Actualiza un conductor
 */
function updateTMSDriver(driverId, updateData) {
  try {
    const driversManager = new TMSDrivers();
    return driversManager.updateDriver(driverId, updateData);
  } catch (error) {
    console.error('Error en updateTMSDriver:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Elimina un conductor
 */
function deleteTMSDriver(driverId) {
  try {
    const driversManager = new TMSDrivers();
    return driversManager.deleteDriver(driverId);
  } catch (error) {
    console.error('Error en deleteTMSDriver:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Obtiene todos los vehículos
 */
function getTMSVehicles() {
  try {
    const driversManager = new TMSDrivers();
    return driversManager.getAllVehicles();
  } catch (error) {
    console.error('Error en getTMSVehicles:', error);
    return { error: error.message };
  }
}

/**
 * Crea un nuevo vehículo
 */
function createTMSVehicle(vehicleData) {
  try {
    const driversManager = new TMSDrivers();
    return driversManager.createVehicle(vehicleData);
  } catch (error) {
    console.error('Error en createTMSVehicle:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Asigna vehículo a conductor
 */
function assignTMSVehicleToDriver(driverId, vehicleId) {
  try {
    const driversManager = new TMSDrivers();
    return driversManager.assignVehicleToDriver(driverId, vehicleId);
  } catch (error) {
    console.error('Error en assignTMSVehicleToDriver:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Desasigna vehículo de conductor
 */
function unassignTMSVehicleFromDriver(driverId) {
  try {
    const driversManager = new TMSDrivers();
    return driversManager.unassignVehicleFromDriver(driverId);
  } catch (error) {
    console.error('Error en unassignTMSVehicleFromDriver:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Obtiene estadísticas de conductores
 */
function getTMSDriversStatistics() {
  try {
    const driversManager = new TMSDrivers();
    return driversManager.getDriversStatistics();
  } catch (error) {
    console.error('Error en getTMSDriversStatistics:', error);
    return { error: error.message };
  }
}