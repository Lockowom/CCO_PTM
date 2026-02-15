/**
 * TMS Optimization - Route Optimization Algorithms
 * Algoritmos de optimización para rutas del TMS
 * 
 * @fileoverview Algoritmos de optimización de rutas y asignación
 * @author Sistema CCO
 * @version 1.0.0
 */

/**
 * Clase de optimización de rutas TMS
 */
class TMSOptimization {
  constructor() {
    this.cache = CacheService.getScriptCache();
  }

  // ==================== ALGORITMOS DE OPTIMIZACIÓN ====================

  /**
   * Optimiza una ruta usando el algoritmo especificado
   */
  optimizarRuta(entregas, algoritmo = 'NEAREST_NEIGHBOR') {
    try {
      console.log('TMS Optimization: Optimizando ruta con algoritmo:', algoritmo);
      
      if (!entregas || entregas.length < 2) {
        return entregas;
      }
      
      switch (algoritmo) {
        case 'NEAREST_NEIGHBOR':
          return this.nearestNeighborOptimization(entregas);
        case 'ZONE_BASED':
          return this.zoneBasedOptimization(entregas);
        case 'TIME_WINDOW':
          return this.timeWindowOptimization(entregas);
        case 'PRIORITY_FIRST':
          return this.priorityFirstOptimization(entregas);
        default:
          console.warn('Algoritmo no reconocido, usando Nearest Neighbor');
          return this.nearestNeighborOptimization(entregas);
      }
    } catch (error) {
      console.error('Error en optimización de ruta:', error);
      return entregas; // Retornar orden original si hay error
    }
  }

  /**
   * Algoritmo Nearest Neighbor (Vecino más cercano)
   */
  nearestNeighborOptimization(entregas) {
    if (entregas.length < 2) return entregas;
    
    const entregasOptimizadas = [];
    const entregasRestantes = [...entregas];
    
    // Comenzar con la primera entrega (o la más prioritaria)
    let entregaActual = this.seleccionarEntregaInicial(entregasRestantes);
    entregasOptimizadas.push(entregaActual);
    entregasRestantes.splice(entregasRestantes.indexOf(entregaActual), 1);
    
    // Continuar con el vecino más cercano
    while (entregasRestantes.length > 0) {
      let entregaMasCercana = null;
      let distanciaMinima = Infinity;
      
      entregasRestantes.forEach(entrega => {
        const distancia = this.calcularDistancia(entregaActual, entrega);
        if (distancia < distanciaMinima) {
          distanciaMinima = distancia;
          entregaMasCercana = entrega;
        }
      });
      
      if (entregaMasCercana) {
        entregasOptimizadas.push(entregaMasCercana);
        entregasRestantes.splice(entregasRestantes.indexOf(entregaMasCercana), 1);
        entregaActual = entregaMasCercana;
      }
    }
    
    return entregasOptimizadas;
  }

  /**
   * Algoritmo basado en zonas geográficas
   */
  zoneBasedOptimization(entregas) {
    if (entregas.length < 2) return entregas;
    
    // Agrupar entregas por zonas
    const zonas = this.agruparPorZonas(entregas);
    const entregasOptimizadas = [];
    
    // Ordenar zonas por proximidad
    const zonasOrdenadas = this.ordenarZonasPorProximidad(zonas);
    
    // Optimizar dentro de cada zona
    zonasOrdenadas.forEach(zona => {
      const entregasZona = this.nearestNeighborOptimization(zona.entregas);
      entregasOptimizadas.push(...entregasZona);
    });
    
    return entregasOptimizadas;
  }

  /**
   * Algoritmo basado en ventanas de tiempo
   */
  timeWindowOptimization(entregas) {
    if (entregas.length < 2) return entregas;
    
    // Ordenar por ventana de tiempo preferida
    const entregasConTiempo = entregas.map(entrega => ({
      ...entrega,
      tiempoPreferido: this.calcularTiempoPreferido(entrega)
    }));
    
    // Ordenar por tiempo preferido y luego optimizar por distancia
    entregasConTiempo.sort((a, b) => a.tiempoPreferido - b.tiempoPreferido);
    
    // Aplicar optimización de distancia dentro de grupos de tiempo
    return this.optimizarGruposPorTiempo(entregasConTiempo);
  }

  /**
   * Algoritmo basado en prioridad
   */
  priorityFirstOptimization(entregas) {
    if (entregas.length < 2) return entregas;
    
    // Separar por prioridad
    const altaPrioridad = entregas.filter(e => e.prioridad === 'ALTA');
    const mediaPrioridad = entregas.filter(e => e.prioridad === 'MEDIA');
    const bajaPrioridad = entregas.filter(e => e.prioridad === 'BAJA' || !e.prioridad);
    
    // Optimizar cada grupo por separado
    const altaOptimizada = this.nearestNeighborOptimization(altaPrioridad);
    const mediaOptimizada = this.nearestNeighborOptimization(mediaPrioridad);
    const bajaOptimizada = this.nearestNeighborOptimization(bajaPrioridad);
    
    return [...altaOptimizada, ...mediaOptimizada, ...bajaOptimizada];
  }

  // ==================== AGRUPACIÓN DE ENTREGAS ====================

  /**
   * Agrupa entregas en rutas automáticamente
   */
  agruparEntregasEnRutas(entregas, conductores, criterios = {}) {
    try {
      console.log('TMS Optimization: Agrupando entregas en rutas...');
      
      const {
        maxEntregasPorRuta = 15,
        maxDistanciaPorRuta = 100, // km
        maxTiempoPorRuta = 480, // minutos (8 horas)
        algoritmoAgrupacion = 'ZONE_BASED'
      } = criterios;
      
      const rutasSugeridas = [];
      const entregasRestantes = [...entregas];
      
      conductores.forEach((conductor, index) => {
        if (entregasRestantes.length === 0) return;
        
        // Seleccionar entregas para este conductor
        const entregasParaConductor = this.seleccionarEntregasParaConductor(
          entregasRestantes,
          conductor,
          {
            maxEntregas: maxEntregasPorRuta,
            maxDistancia: maxDistanciaPorRuta,
            maxTiempo: maxTiempoPorRuta,
            algoritmo: algoritmoAgrupacion
          }
        );
        
        if (entregasParaConductor.length > 0) {
          // Optimizar orden de entregas
          const entregasOptimizadas = this.optimizarRuta(entregasParaConductor, algoritmoAgrupacion);
          
          // Crear ruta sugerida
          const rutaSugerida = {
            nombre: `Ruta ${conductor.nombre} - ${new Date().toLocaleDateString()}`,
            conductorId: conductor.id,
            conductor: conductor,
            entregas: entregasOptimizadas,
            totalEntregas: entregasOptimizadas.length,
            distanciaTotal: this.calcularDistanciaTotal(entregasOptimizadas),
            tiempoEstimado: this.calcularTiempoEstimado(entregasOptimizadas),
            estado: 'SUGERIDA',
            fechaCreacion: new Date().toISOString()
          };
          
          rutasSugeridas.push(rutaSugerida);
          
          // Remover entregas asignadas
          entregasParaConductor.forEach(entrega => {
            const index = entregasRestantes.findIndex(e => e.id === entrega.id);
            if (index > -1) {
              entregasRestantes.splice(index, 1);
            }
          });
        }
      });
      
      return rutasSugeridas;
    } catch (error) {
      console.error('Error agrupando entregas en rutas:', error);
      return [];
    }
  }

  /**
   * Selecciona entregas para un conductor específico
   */
  seleccionarEntregasParaConductor(entregas, conductor, criterios) {
    const {
      maxEntregas,
      maxDistancia,
      maxTiempo,
      algoritmo
    } = criterios;
    
    // Filtrar entregas compatibles con el conductor
    let entregasCompatibles = entregas.filter(entrega => 
      this.esEntregaCompatible(entrega, conductor)
    );
    
    // Aplicar algoritmo de selección
    switch (algoritmo) {
      case 'ZONE_BASED':
        entregasCompatibles = this.seleccionarPorZona(entregasCompatibles, conductor);
        break;
      case 'NEAREST_NEIGHBOR':
        entregasCompatibles = this.seleccionarPorProximidad(entregasCompatibles, conductor);
        break;
      case 'TIME_WINDOW':
        entregasCompatibles = this.seleccionarPorTiempo(entregasCompatibles, conductor);
        break;
    }
    
    // Aplicar límites
    const entregasSeleccionadas = [];
    let distanciaAcumulada = 0;
    let tiempoAcumulado = 0;
    
    for (const entrega of entregasCompatibles) {
      if (entregasSeleccionadas.length >= maxEntregas) break;
      
      const distanciaAdicional = entregasSeleccionadas.length > 0 ? 
        this.calcularDistancia(entregasSeleccionadas[entregasSeleccionadas.length - 1], entrega) : 0;
      const tiempoAdicional = 15; // minutos por entrega
      
      if (distanciaAcumulada + distanciaAdicional <= maxDistancia &&
          tiempoAcumulado + tiempoAdicional <= maxTiempo) {
        entregasSeleccionadas.push(entrega);
        distanciaAcumulada += distanciaAdicional;
        tiempoAcumulado += tiempoAdicional;
      }
    }
    
    return entregasSeleccionadas;
  }

  // ==================== FUNCIONES DE UTILIDAD ====================

  /**
   * Calcula la distancia entre dos entregas
   */
  calcularDistancia(entregaA, entregaB) {
    if (!entregaA.latitud || !entregaA.longitud || !entregaB.latitud || !entregaB.longitud) {
      return 10; // Distancia por defecto si no hay coordenadas
    }
    
    const R = 6371; // Radio de la Tierra en km
    const dLat = this.toRad(entregaB.latitud - entregaA.latitud);
    const dLon = this.toRad(entregaB.longitud - entregaA.longitud);
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(this.toRad(entregaA.latitud)) * Math.cos(this.toRad(entregaB.latitud)) *
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
   * Selecciona la entrega inicial para optimización
   */
  seleccionarEntregaInicial(entregas) {
    // Priorizar entregas urgentes o con ventana de tiempo temprana
    const entregasUrgentes = entregas.filter(e => e.prioridad === 'ALTA');
    if (entregasUrgentes.length > 0) {
      return entregasUrgentes[0];
    }
    
    // Si no hay urgentes, tomar la primera
    return entregas[0];
  }

  /**
   * Agrupa entregas por zonas geográficas
   */
  agruparPorZonas(entregas) {
    const zonas = new Map();
    
    entregas.forEach(entrega => {
      const zona = this.determinarZona(entrega);
      if (!zonas.has(zona)) {
        zonas.set(zona, { nombre: zona, entregas: [] });
      }
      zonas.get(zona).entregas.push(entrega);
    });
    
    return Array.from(zonas.values());
  }

  /**
   * Determina la zona geográfica de una entrega
   */
  determinarZona(entrega) {
    // Implementación básica - en producción usar datos reales de zonas
    if (!entrega.latitud || !entrega.longitud) {
      return 'ZONA_DESCONOCIDA';
    }
    
    const lat = entrega.latitud;
    const lon = entrega.longitud;
    
    // Ejemplo de zonificación simple
    if (lat > -34.5 && lat < -34.4 && lon > -58.5 && lon < -58.4) {
      return 'ZONA_CENTRO';
    } else if (lat > -34.6 && lat < -34.5) {
      return 'ZONA_NORTE';
    } else if (lat > -34.7 && lat < -34.6) {
      return 'ZONA_SUR';
    } else {
      return 'ZONA_EXTERIOR';
    }
  }

  /**
   * Ordena zonas por proximidad
   */
  ordenarZonasPorProximidad(zonas) {
    // Implementación básica - ordenar por nombre de zona
    return zonas.sort((a, b) => a.nombre.localeCompare(b.nombre));
  }

  /**
   * Calcula el tiempo preferido para una entrega
   */
  calcularTiempoPreferido(entrega) {
    // Si tiene ventana de tiempo específica
    if (entrega.horaPreferida) {
      const [hora, minuto] = entrega.horaPreferida.split(':');
      return parseInt(hora) * 60 + parseInt(minuto);
    }
    
    // Si es prioritaria, preferir horario temprano
    if (entrega.prioridad === 'ALTA') {
      return 8 * 60; // 8:00 AM
    }
    
    // Horario normal
    return 10 * 60; // 10:00 AM
  }

  /**
   * Optimiza grupos por tiempo
   */
  optimizarGruposPorTiempo(entregas) {
    const grupos = [];
    let grupoActual = [];
    let tiempoActual = null;
    
    entregas.forEach(entrega => {
      const tiempoEntrega = Math.floor(entrega.tiempoPreferido / 60); // Hora
      
      if (tiempoActual === null || Math.abs(tiempoEntrega - tiempoActual) <= 2) {
        grupoActual.push(entrega);
        tiempoActual = tiempoEntrega;
      } else {
        if (grupoActual.length > 0) {
          grupos.push(grupoActual);
        }
        grupoActual = [entrega];
        tiempoActual = tiempoEntrega;
      }
    });
    
    if (grupoActual.length > 0) {
      grupos.push(grupoActual);
    }
    
    // Optimizar cada grupo por distancia
    const entregasOptimizadas = [];
    grupos.forEach(grupo => {
      const grupoOptimizado = this.nearestNeighborOptimization(grupo);
      entregasOptimizadas.push(...grupoOptimizado);
    });
    
    return entregasOptimizadas;
  }

  /**
   * Verifica si una entrega es compatible con un conductor
   */
  esEntregaCompatible(entrega, conductor) {
    // Verificar capacidad del vehículo
    if (conductor.capacidadMaxima && entrega.peso > conductor.capacidadMaxima) {
      return false;
    }
    
    // Verificar zona de trabajo
    if (conductor.zonaTrabajo && entrega.zona && conductor.zonaTrabajo !== entrega.zona) {
      return false;
    }
    
    // Verificar horario de trabajo
    if (conductor.horarioInicio && conductor.horarioFin && entrega.horaPreferida) {
      const horaEntrega = parseInt(entrega.horaPreferida.split(':')[0]);
      const horaInicio = parseInt(conductor.horarioInicio.split(':')[0]);
      const horaFin = parseInt(conductor.horarioFin.split(':')[0]);
      
      if (horaEntrega < horaInicio || horaEntrega > horaFin) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Selecciona entregas por zona para un conductor
   */
  seleccionarPorZona(entregas, conductor) {
    if (conductor.zonaTrabajo) {
      return entregas.filter(e => e.zona === conductor.zonaTrabajo);
    }
    return entregas;
  }

  /**
   * Selecciona entregas por proximidad a la ubicación del conductor
   */
  seleccionarPorProximidad(entregas, conductor) {
    if (!conductor.latitud || !conductor.longitud) {
      return entregas;
    }
    
    return entregas
      .map(entrega => ({
        ...entrega,
        distanciaConductor: this.calcularDistancia(conductor, entrega)
      }))
      .sort((a, b) => a.distanciaConductor - b.distanciaConductor)
      .slice(0, 20); // Tomar las 20 más cercanas
  }

  /**
   * Selecciona entregas por ventana de tiempo compatible
   */
  seleccionarPorTiempo(entregas, conductor) {
    if (!conductor.horarioInicio || !conductor.horarioFin) {
      return entregas;
    }
    
    const horaInicio = parseInt(conductor.horarioInicio.split(':')[0]);
    const horaFin = parseInt(conductor.horarioFin.split(':')[0]);
    
    return entregas.filter(entrega => {
      if (!entrega.horaPreferida) return true;
      
      const horaEntrega = parseInt(entrega.horaPreferida.split(':')[0]);
      return horaEntrega >= horaInicio && horaEntrega <= horaFin;
    });
  }

  /**
   * Calcula la distancia total de una ruta
   */
  calcularDistanciaTotal(entregas) {
    if (!entregas || entregas.length < 2) return 0;
    
    let distanciaTotal = 0;
    for (let i = 0; i < entregas.length - 1; i++) {
      distanciaTotal += this.calcularDistancia(entregas[i], entregas[i + 1]);
    }
    
    return Math.round(distanciaTotal * 100) / 100;
  }

  /**
   * Calcula el tiempo estimado de una ruta
   */
  calcularTiempoEstimado(entregas) {
    if (!entregas || entregas.length === 0) return 0;
    
    const distanciaTotal = this.calcularDistanciaTotal(entregas);
    const velocidadPromedio = 40; // km/h
    const tiempoPorEntrega = 15; // minutos
    
    const tiempoViaje = (distanciaTotal / velocidadPromedio) * 60;
    const tiempoEntregas = entregas.length * tiempoPorEntrega;
    
    return Math.round(tiempoViaje + tiempoEntregas);
  }
}

// ==================== FUNCIONES GLOBALES ====================

/**
 * Optimiza una ruta específica
 */
function optimizarRutaConAlgoritmo(entregas, algoritmo) {
  try {
    const optimization = new TMSOptimization();
    return optimization.optimizarRuta(entregas, algoritmo);
  } catch (error) {
    console.error('Error en optimizarRutaConAlgoritmo:', error);
    return { error: error.message };
  }
}

/**
 * Agrupa entregas en rutas automáticamente
 */
function agruparEntregasEnRutasAutomaticas(entregas, conductores, criterios) {
  try {
    const optimization = new TMSOptimization();
    return optimization.agruparEntregasEnRutas(entregas, conductores, criterios);
  } catch (error) {
    console.error('Error en agruparEntregasEnRutasAutomaticas:', error);
    return { error: error.message };
  }
}