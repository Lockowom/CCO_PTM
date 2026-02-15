/**
 * TMS Control Tower - Backend Controller
 * Handles data aggregation and real-time updates for the Control Tower
 * 
 * @fileoverview Backend para el Centro de Control TMS
 */

/**
 * Obtiene todos los conductores con su estado actual
 * @returns {Array} Lista de conductores
 */
function getTMSDrivers() {
  try {
    const db = new TMSDatabase();
    const conductores = db.getConductores();
    
    // Mapear a formato para el frontend
    return conductores.map(c => ({
      id: c.ID,
      nombre: c.Nombre,
      apellido: c.Apellido,
      nombreCompleto: `${c.Nombre} ${c.Apellido}`,
      estado: c.Estado, // DISPONIBLE, EN_RUTA, OCUPADO, etc.
      vehiculo: c.VehiculoAsignado ? { placa: db.getVehiculos().find(v => v.ID === c.VehiculoAsignado)?.Patente || 'N/A' } : null,
      ubicacion: c.UltimaUbicacion
    }));
  } catch (error) {
    console.error('Error obteniendo conductores:', error);
    return { error: error.message };
  }
}

/**
 * Obtiene las entregas activas
 * @returns {Array} Lista de entregas activas
 */
function getTMSActiveDeliveries() {
  try {
    const db = new TMSDatabase();
    // Obtener entregas que no están completadas ni canceladas
    const entregas = db.getEntregas().filter(e => 
      ['EN_RUTA', 'EN_DESTINO', 'PENDIENTE', 'RETRASADO'].includes(e.Estado)
    );
    
    return entregas.map(e => ({
      id: e.ID || e.NV, // Usar NV como ID si ID no existe
      cliente: e.Cliente,
      direccion: e.Direccion,
      estado: e.Estado,
      conductor: e.ConductorAsignado ? `${db.getConductorById(e.ConductorAsignado)?.Nombre || ''} ${db.getConductorById(e.ConductorAsignado)?.Apellido || ''}` : 'Sin asignar',
      fechaCreacion: e.FechaCreacion,
      fechaAsignacion: e.FechaAsignacion,
      latitud: e.Latitud,
      longitud: e.Longitud
    }));
  } catch (error) {
    console.error('Error obteniendo entregas activas:', error);
    return { error: error.message };
  }
}

/**
 * Obtiene alertas del sistema
 * @returns {Array} Lista de alertas
 */
function getTMSSystemAlerts() {
  try {
    // En una implementación real, esto vendría de una tabla de Alertas
    // Por ahora simulamos algunas alertas basadas en datos reales
    const alertas = [];
    const db = new TMSDatabase();
    const entregas = db.getEntregas();
    
    // Generar alertas de retraso
    const hoy = new Date();
    entregas.forEach(e => {
      if (e.Estado === 'PENDIENTE' && e.FechaCreacion) {
        const fechaCreacion = new Date(e.FechaCreacion);
        const diffHoras = (hoy - fechaCreacion) / (1000 * 60 * 60);
        
        if (diffHoras > 24) {
          alertas.push({
            id: 'ALT_' + e.NV,
            tipo: 'DELAY',
            prioridad: 'HIGH',
            titulo: 'Entrega Retrasada',
            mensaje: `La entrega ${e.NV} lleva más de 24 horas pendiente.`,
            fecha: new Date()
          });
        }
      }
    });
    
    // Si no hay alertas reales, devolver vacio o mock para demo
    return alertas;
  } catch (error) {
    console.error('Error obteniendo alertas:', error);
    return { error: error.message };
  }
}

/**
 * Obtiene métricas de rendimiento
 * @returns {Object} Métricas calculadas
 */
function getTMSPerformanceMetrics() {
  try {
    const db = new TMSDatabase();
    const stats = db.getEstadisticas(); // Usar la función existente en TMSDatabase
    
    // Calcular métricas derivadas
    const totalEntregas = stats.entregas.total;
    const entregasExitosas = stats.entregas.entregadas;
    const tasaExito = totalEntregas > 0 ? Math.round((entregasExitosas / totalEntregas) * 100) : 0;
    
    return {
      tasaExito: tasaExito,
      tiempoPromedio: 45, // Placeholder, requeriría cálculo real de tiempos
      eficienciaRutas: 85, // Placeholder
      utilizacionConductores: stats.conductores.total > 0 ? 
        Math.round(((stats.conductores.enRuta + stats.conductores.ocupados) / stats.conductores.total) * 100) : 0
    };
  } catch (error) {
    console.error('Error obteniendo métricas:', error);
    return { error: error.message };
  }
}

/**
 * Envía una alerta de emergencia
 * @param {Object} alertData - Datos de la alerta
 */
function sendTMSEmergencyAlert(alertData) {
  try {
    console.log('Procesando alerta de emergencia:', alertData);
    
    // Registrar en tabla de Tracking o Alertas
    const db = new TMSDatabase();
    db.addTrackingEvent({
      Tipo: 'EMERGENCY',
      ConductorID: alertData.driverId || 'ALL',
      Mensaje: alertData.message,
      Prioridad: 'CRITICAL',
      Estado: 'ACTIVE',
      RequiereAck: alertData.requireAck
    });
    
    // Aquí se podría integrar envío de email o SMS
    
    return { success: true };
  } catch (error) {
    console.error('Error enviando alerta:', error);
    throw error;
  }
}