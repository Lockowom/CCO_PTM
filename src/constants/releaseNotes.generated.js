// ARCHIVO GENERADO — no editar a mano.
// Se regenera en cada build desde el Changelog de DOCUMENTACION_PROYECTO.md
// (scripts/gen_release_notes.js). Para cambiar una nota, edita el changelog
// (opcional: anota {{titulo: …}} y {{simple: [etiqueta] … ;; …}} para lenguaje simple).
export const RELEASE_NOTES = [
  {
    "version": "1.55.95",
    "fecha": "2026-07-21",
    "titulo": "El filtro de fecha ahora sí cambia la tabla de estados",
    "emoji": "🔧",
    "cambios": [
      {
        "tipo": "fix",
        "texto": "La tabla \"por estado\" del Dashboard ahora responde al filtro de fecha: al cambiar el rango (última semana / mes / año completo) también cambian En Proceso, Shipping y En Ruta, no solo Entregado."
      },
      {
        "tipo": "fix",
        "texto": "Se corrigió una N.V. con una fecha mal escrita (año \"20206\") que la dejaba fuera de todos los filtros."
      },
      {
        "tipo": "ajuste",
        "texto": "El KPI \"NVs Activas\" sigue siendo la foto en vivo (igual que TV) e indica que no depende del rango; la tabla de estados es la vista del período elegido."
      }
    ]
  },
  {
    "version": "1.55.94",
    "fecha": "2026-07-21",
    "titulo": "El Panel ahora muestra cliente/vendedor y se actualiza solo",
    "emoji": "🔧",
    "cambios": [
      {
        "tipo": "fix",
        "texto": "El Panel ya muestra el cliente, vendedor, centro de costo y división de cada N.V., igual que en Ingresar. Antes salían vacíos (\"—\") aunque la N.V. sí tenía los datos."
      },
      {
        "tipo": "fix",
        "texto": "El Dashboard ahora se actualiza solo al instante cuando se ingresa o edita una N.V. (antes solo cada 2 minutos)."
      },
      {
        "tipo": "mejora",
        "texto": "Al ingresar una N.V. solo con su estado, el sistema completa cliente/vendedor/centro/división automáticamente desde el catálogo maestro."
      }
    ]
  },
  {
    "version": "1.55.93",
    "fecha": "2026-07-21",
    "titulo": "El Panel ahora cuadra con el Modo TV",
    "emoji": "🔧",
    "cambios": [
      {
        "tipo": "fix",
        "texto": "\"NVs Activas\" del Panel ya coincide con el Modo TV. Antes, al filtrar por un rango de fechas (ej. último mes), el Panel escondía las NVs que seguían abiertas pero se aprobaron antes del rango, mostrando muchas menos activas de las reales."
      },
      {
        "tipo": "mejora",
        "texto": "El backlog activo (En Proceso, Shipping, etc.), su resumen, el embudo y las alertas de riesgo son ahora una foto EN VIVO que no depende del rango de fechas; el rango sigue acotando solo las métricas de período (entregadas, tardanza, fill rate, tendencias)."
      }
    ]
  },
  {
    "version": "1.55.92",
    "fecha": "2026-07-20",
    "titulo": "Se arregló Carga Masiva (\"Tabla no permitida\")",
    "emoji": "🔧",
    "cambios": [
      {
        "tipo": "fix",
        "texto": "Se corrigió un error que impedía subir catálogos en Carga Masiva (por ejemplo N.V. y productos activos): salía \"Tabla no permitida\" y no cargaba nada. Ya vuelve a funcionar."
      }
    ]
  },
  {
    "version": "1.55.91",
    "fecha": "2026-07-20",
    "titulo": "Buscador de grupo por SKU + carga de grupos",
    "emoji": "🆕",
    "cambios": [
      {
        "tipo": "nuevo",
        "texto": "Nueva consulta \"Grupo por SKU\" (Consultas): escribes el código del producto y te dice a qué grupo pertenece."
      },
      {
        "tipo": "nuevo",
        "texto": "En Carga Masiva hay una opción \"Grupos de SKU\" para subir el Excel del ERP: los SKU nuevos se detectan solos y los existentes se actualizan sin duplicar."
      }
    ]
  },
  {
    "version": "1.55.90",
    "fecha": "2026-07-20",
    "titulo": "El checklist ya muestra los 22 grupos",
    "emoji": "🔧",
    "cambios": [
      {
        "tipo": "fix",
        "texto": "Dentro del checklist de Calidad, la sección \"Clasificación del producto\" ahora muestra los 22 grupos comerciales (Muebles Clínicos, Ortopedia y Traumatología, Insumos Médicos, etc.) en vez de las 6 etiquetas antiguas."
      }
    ]
  },
  {
    "version": "1.55.89",
    "fecha": "2026-07-20",
    "titulo": "Calidad clasifica por grupo comercial",
    "emoji": "🆕",
    "cambios": [
      {
        "tipo": "nuevo",
        "texto": "El checklist de Calidad ahora clasifica los productos por los 22 grupos comerciales del ERP (Muebles Clínicos, Ortopedia, Insumos Médicos, etc.) en vez de categorías de riesgo. Hay una pantalla nueva \"Clasificación de Productos\" para cargar/actualizar el mapeo con un botón."
      }
    ]
  },
  {
    "version": "1.55.88",
    "fecha": "2026-07-20",
    "titulo": "Carga Masiva valida el largo de la N.V.",
    "emoji": "🛡️",
    "cambios": [
      {
        "tipo": "seguridad",
        "texto": "La Carga Masiva de N.V. ahora también bloquea si el largo de la N.V. no corresponde al canal (PTM 5 dígitos, Orange/Farmapack 3). Y se ajusta solo: cuando Orange/Farmapack empiecen a usar 4 dígitos o PTM 6, lo acepta automáticamente sin cambiar nada."
      }
    ]
  },
  {
    "version": "1.55.87",
    "fecha": "2026-07-20",
    "titulo": "Carga Masiva bloquea archivos de N.V. equivocados",
    "emoji": "🛡️",
    "cambios": [
      {
        "tipo": "seguridad",
        "texto": "La Carga Masiva de N.V. ahora BLOQUEA el archivo cuando está descuadrado (el \"Cliente\" trae un monto en vez de un nombre) o cuando la mayoría de las N.V. son de otro canal. Antes solo avisaba y se podía cargar igual."
      }
    ]
  },
  {
    "version": "1.55.86",
    "fecha": "2026-07-20",
    "titulo": "El \"Guardado\" ahora se ve también al editar",
    "emoji": "🔧",
    "cambios": [
      {
        "tipo": "fix",
        "texto": "El aviso verde \"Guardado hh:mm:ss\" aparecía solo al crear una recepción nueva; ahora también se muestra cuando editas una existente y agregas ítems, y sale el mensaje \"Ítem agregado y guardado\" en cada alta."
      }
    ]
  },
  {
    "version": "1.55.85",
    "fecha": "2026-07-20",
    "titulo": "Serie duplicada: ahora pregunta",
    "emoji": "⚙️",
    "cambios": [
      {
        "tipo": "ajuste",
        "texto": "Cuando una serie ya existe, Recepción ya no la bloquea: te pregunta \"¿Agregarla de todos modos?\" y decides tú. Si aceptas, queda marcada como duplicada."
      }
    ]
  },
  {
    "version": "1.55.84",
    "fecha": "2026-07-20",
    "titulo": "Recepción avisa series duplicadas",
    "emoji": "🆕",
    "cambios": [
      {
        "tipo": "nuevo",
        "texto": "Si escaneas o agregas una serie que ya está en la lista, el sistema lo bloquea y te avisa; y si hay repetidas, las marca en rojo con un contador."
      },
      {
        "tipo": "mejora",
        "texto": "El aviso \"Guardado hh:mm\" ahora está junto a la lista de ítems, siempre a la vista, aunque bajes la pantalla."
      }
    ]
  },
  {
    "version": "1.55.83",
    "fecha": "2026-07-20",
    "titulo": "Ahora se ve cuándo se guarda",
    "emoji": "⬆️",
    "cambios": [
      {
        "tipo": "mejora",
        "texto": "En Recepción (Importaciones y Nacionales) aparece un indicador verde \"Guardado hh:mm:ss\" que parpadea cada vez que se guarda, y un aviso al agregar cada ítem, para que veas que tu progreso queda a salvo."
      }
    ]
  },
  {
    "version": "1.55.82",
    "fecha": "2026-07-20",
    "titulo": "Recepción Nacionales tampoco pierde tu avance",
    "emoji": "🆕",
    "cambios": [
      {
        "tipo": "nuevo",
        "texto": "El auto-guardado de progreso ahora también está en Recepción Nacionales: cada ítem/dato se guarda solo y puedes continuar donde quedaste tras una recarga."
      }
    ]
  },
  {
    "version": "1.55.81",
    "fecha": "2026-07-20",
    "titulo": "Recepción no pierde tu avance",
    "emoji": "🆕",
    "cambios": [
      {
        "tipo": "nuevo",
        "texto": "En Recepción Importaciones, cada ítem y dato que agregas se guarda solo. Si se recarga o cierra la página, un aviso te deja continuar donde quedaste."
      }
    ]
  }
];
