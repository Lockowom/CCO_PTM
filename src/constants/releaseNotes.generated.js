// ARCHIVO GENERADO — no editar a mano.
// Se regenera en cada build desde el Changelog de DOCUMENTACION_PROYECTO.md
// (scripts/gen_release_notes.js). Para cambiar una nota, edita el changelog
// (opcional: anota {{titulo: …}} y {{simple: [etiqueta] … ;; …}} para lenguaje simple).
export const RELEASE_NOTES = [
  {
    version: '1.55.165',
    fecha: '2026-08-19',
    titulo:
      'Nueva pantalla "Control de Acceso (IAM 2.0)": ve exactamente qué tiene cada usuario y por qué',
    emoji: '🆕',
    cambios: [
      {
        tipo: 'nuevo',
        texto:
          'Nueva pantalla en Sistema → Control de Acceso (IAM 2.0) que muestra qué puede hacer cada usuario: pantallas permitidas o negadas, con el origen de cada permiso (perfil, permiso individual, legacy o no asignado) y si algo cambiaría respecto al acceso actual.'
      },
      {
        tipo: 'nuevo',
        texto: 'Catálogo completo de módulos, pantallas y funciones del sistema para revisión.'
      },
      {
        tipo: 'seguridad',
        texto:
          'Es solo lectura: no modifica permisos ni roles; la administración sigue en Identidad y Seguridad.'
      }
    ]
  },
  {
    version: '1.55.164',
    fecha: '2026-08-18',
    titulo: 'Overrides individuales de acceso listos en base de datos (base del nuevo IAM)',
    emoji: '🛡️',
    cambios: [
      {
        tipo: 'seguridad',
        texto:
          'Se preparó la base para excepciones puntuales de acceso por usuario (permitir/bloquear una pantalla concreta sin cambiarle el rol), con contador de versión de permisos y trazabilidad de quién lo cambió.'
      },
      {
        tipo: 'nuevo',
        texto:
          'Se definieron 8 perfiles operacionales de referencia (operador panel, bodega, inventario, calidad, despacho, supervisor, gerencia, admin) derivados del acceso real actual, listos para la nueva administración de accesos.'
      }
    ]
  },
  {
    version: '1.55.163',
    fecha: '2026-08-18',
    titulo:
      'El bloque de marca ahora vive en su propio panel premium con estado "Operativo" y los ítems del menú activos se ven más elegantes',
    emoji: '⬆️',
    cambios: [
      {
        tipo: 'mejora',
        texto:
          'La marca del menú quedó en un panel premium con separador de luz; debajo del subtítulo ahora se ve un indicador "● Operativo".'
      },
      {
        tipo: 'mejora',
        texto:
          'El ítem del menú donde estás se ve con más elegancia (relleno suave, borde naranja sutil y sombra) tanto en escritorio como en el menú móvil.'
      }
    ]
  },
  {
    version: '1.55.162',
    fecha: '2026-08-17',
    titulo:
      'El branding del menú subió de nivel: CCO más proeminente y badge SYSTEM premium con animación',
    emoji: '⬆️',
    cambios: [
      {
        tipo: 'mejora',
        texto:
          'El bloque de marca del menú se volvió premium: "CCO" es ahora la pieza visual dominante y "SYSTEM" es un badge tecnológico con fondo naranja en vez de texto pegado.'
      },
      {
        tipo: 'fix',
        texto:
          'El subtítulo "Centro Control Operacional" ahora también se ve en pantalla pequeña (antes desaparecía en mobile).'
      },
      {
        tipo: 'nuevo',
        texto:
          'El branding entra con una animación elegante y un brillo sutil al cargar, con movimiento respetuoso (prefers-reduced-motion).'
      }
    ]
  },
  {
    version: '1.55.161',
    fecha: '2026-08-17',
    titulo: 'Acceso anónimo cerrado a funciones internas + bloqueos IAM registrados',
    emoji: '🛡️',
    cambios: [
      {
        tipo: 'seguridad',
        texto:
          'Las funciones internas del sistema (movimiento de stock, cambios masivos de estado, KPIs del dashboard, dictamen de monitoreo, etc.) ya NO pueden ser llamadas por conexiones anónimas: solo operadores con sesión.'
      },
      {
        tipo: 'nuevo',
        texto:
          'Cuando un operador intenta crear o cambiar una N.V. fuera de su ámbito (otro centro de costo), el intento queda REGISTRADO (quién, qué y cuándo) para trazabilidad del administrador.'
      },
      {
        tipo: 'fix',
        texto:
          'La web ahora se puede instalar correctamente: faltaban los iconos de instalación (PWA) y ya se generaron.'
      },
      {
        tipo: 'mejora',
        texto:
          'Las reglas de presencia de usuarios, de registro de operaciones y de la configuración PWA quedaron cubiertas por tests automatizados.'
      }
    ]
  },
  {
    version: '1.55.160',
    fecha: '2026-08-17',
    titulo: 'Refactor del guardado de N.V.: datos limpios y sin pisar cambios ajenos',
    emoji: '⬆️',
    cambios: [
      {
        tipo: 'mejora',
        texto:
          'Al guardar o actualizar una N.V. (Ingresar) la app ahora limpia los datos automaticamente (numeros, fechas, N.V. con .0) antes de enviarlos, para que el registro quede igual que en la base.'
      },
      {
        tipo: 'seguridad',
        texto:
          'Si dos personas editan la misma N.V. a la vez, la segunda ya NO pisa el cambio de la primera: se avisa, se recarga la version actual y hay que guardar de nuevo.'
      },
      {
        tipo: 'mejora',
        texto:
          'Las reglas de validacion del formulario (estado, pausa Shipping, permisos, N.V. entregada) quedaron centralizadas y cubiertas por tests.'
      }
    ]
  },
  {
    version: '1.55.159',
    fecha: '2026-08-17',
    titulo: 'La regla de modulos ocultos llega a CCO 2.0',
    emoji: '🛡️',
    cambios: [
      {
        tipo: 'seguridad',
        texto:
          'Los modulos nuevos de la actualizacion 2.0 nacen OCULTOS: aunque esten implementados no aparecen en el menu, en la busqueda ni en el inicio hasta que el admin los libere por etapas. Solo entran quienes tengan el rol de beta asignado, y ademas se bloquea en el servidor.'
      }
    ]
  },
  {
    version: '1.55.158',
    fecha: '2026-08-17',
    titulo: 'El PDA deja de pedir cantidad al ubicar productos',
    emoji: '⬆️',
    cambios: [
      {
        tipo: 'mejora',
        texto:
          'Al ubicar (Put Away) desde el PDA ya NO se pide cantidad: se registra solo la referencia visual de la ubicacion, igual que se hacia en la base de datos.'
      },
      {
        tipo: 'mejora',
        texto:
          'La pantalla de confirmacion ahora aclara que es una referencia operacional y que no modifica el stock del ERP.'
      },
      {
        tipo: 'mejora',
        texto:
          'Si la bodega queda sin senal y se registra la misma ubicacion dos veces, ya no se duplica: la cola de sincronizacion es idempotente por ubicacion + producto.'
      }
    ]
  },
  {
    version: '1.55.157',
    fecha: '2026-08-17',
    titulo: 'Fundacion de interfaz lista para la actualizacion 2.0',
    emoji: '⬆️',
    cambios: [
      {
        tipo: 'mejora',
        texto:
          'Se creo la base de diseno compartida (colores, superficies, estados, animaciones) y los componentes reutilizables (botones, tarjetas, modales, estados vacios, skeletons) que usara la nueva interfaz.'
      },
      {
        tipo: 'mejora',
        texto:
          'Se anadio el nuevo esqueleto de escritorio (menu lateral + barra superior con breadcrumb y busqueda) y el esqueleto movil (barra inferior de accesos rapidos + menu lateral + acciones flotantes), aun sin activar: conviven con la interfaz actual sin cambios visibles.'
      }
    ]
  },
  {
    version: '1.55.156',
    fecha: '2026-08-17',
    titulo: 'El Dashboard vuelve a cargar para todos los usuarios',
    emoji: '🔧',
    cambios: [
      {
        tipo: 'fix',
        texto:
          'El Dashboard del Panel ya no se queda en "Error de carga" para los usuarios no administradores: la carga de datos vuelve a completar sin agotar el tiempo de espera.'
      },
      {
        tipo: 'fix',
        texto:
          'Se corrigió un error que impedía cargar la información de consolidados en el Dashboard.'
      }
    ]
  },
  {
    version: '1.55.96',
    fecha: '2026-07-21',
    titulo: 'Trazabilidad de la N.V. (quién hizo qué y cuándo)',
    emoji: '🆕',
    cambios: [
      {
        tipo: 'nuevo',
        texto:
          'La ficha de una N.V. (Consulta · Info) ahora muestra su historial en "Actividad": quién la creó, cada cambio de estado (ej. "María cambió estado · En Proceso → Shipping") y ediciones de datos, con fecha y hora.'
      },
      {
        tipo: 'nuevo',
        texto:
          'Se registró el historial de todas las N.V. existentes desde sus fechas ya guardadas, para que las antiguas también muestren su trazabilidad.'
      }
    ]
  },
  {
    version: '1.55.95',
    fecha: '2026-07-21',
    titulo: 'El filtro de fecha ahora sí cambia la tabla de estados',
    emoji: '🔧',
    cambios: [
      {
        tipo: 'fix',
        texto:
          'La tabla "por estado" del Dashboard ahora responde al filtro de fecha: al cambiar el rango (última semana / mes / año completo) también cambian En Proceso, Shipping y En Ruta, no solo Entregado.'
      },
      {
        tipo: 'fix',
        texto:
          'Se corrigió una N.V. con una fecha mal escrita (año "20206") que la dejaba fuera de todos los filtros.'
      },
      {
        tipo: 'ajuste',
        texto:
          'El KPI "NVs Activas" sigue siendo la foto en vivo (igual que TV) e indica que no depende del rango; la tabla de estados es la vista del período elegido.'
      }
    ]
  },
  {
    version: '1.55.94',
    fecha: '2026-07-21',
    titulo: 'El Panel ahora muestra cliente/vendedor y se actualiza solo',
    emoji: '🔧',
    cambios: [
      {
        tipo: 'fix',
        texto:
          'El Panel ya muestra el cliente, vendedor, centro de costo y división de cada N.V., igual que en Ingresar. Antes salían vacíos ("—") aunque la N.V. sí tenía los datos.'
      },
      {
        tipo: 'fix',
        texto:
          'El Dashboard ahora se actualiza solo al instante cuando se ingresa o edita una N.V. (antes solo cada 2 minutos).'
      },
      {
        tipo: 'mejora',
        texto:
          'Al ingresar una N.V. solo con su estado, el sistema completa cliente/vendedor/centro/división automáticamente desde el catálogo maestro.'
      }
    ]
  },
  {
    version: '1.55.93',
    fecha: '2026-07-21',
    titulo: 'El Panel ahora cuadra con el Modo TV',
    emoji: '🔧',
    cambios: [
      {
        tipo: 'fix',
        texto:
          '"NVs Activas" del Panel ya coincide con el Modo TV. Antes, al filtrar por un rango de fechas (ej. último mes), el Panel escondía las NVs que seguían abiertas pero se aprobaron antes del rango, mostrando muchas menos activas de las reales.'
      },
      {
        tipo: 'mejora',
        texto:
          'El backlog activo (En Proceso, Shipping, etc.), su resumen, el embudo y las alertas de riesgo son ahora una foto EN VIVO que no depende del rango de fechas; el rango sigue acotando solo las métricas de período (entregadas, tardanza, fill rate, tendencias).'
      }
    ]
  },
  {
    version: '1.55.92',
    fecha: '2026-07-20',
    titulo: 'Se arregló Carga Masiva ("Tabla no permitida")',
    emoji: '🔧',
    cambios: [
      {
        tipo: 'fix',
        texto:
          'Se corrigió un error que impedía subir catálogos en Carga Masiva (por ejemplo N.V. y productos activos): salía "Tabla no permitida" y no cargaba nada. Ya vuelve a funcionar.'
      }
    ]
  }
];
