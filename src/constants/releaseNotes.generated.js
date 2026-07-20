// ARCHIVO GENERADO — no editar a mano.
// Se regenera en cada build desde el Changelog de DOCUMENTACION_PROYECTO.md
// (scripts/gen_release_notes.js). Para cambiar una nota, edita el changelog
// (opcional: anota {{titulo: …}} y {{simple: [etiqueta] … ;; …}} para lenguaje simple).
export const RELEASE_NOTES = [
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
  },
  {
    "version": "1.55.80",
    "fecha": "2026-07-20",
    "titulo": "Mapa de Procesos bien centrado",
    "emoji": "🔧",
    "cambios": [
      {
        "tipo": "fix",
        "texto": "El Mapa de Procesos se corría a la derecha; ahora sí ocupa todo el ancho y queda centrado."
      }
    ]
  },
  {
    "version": "1.55.79",
    "fecha": "2026-07-20",
    "titulo": "Mapa de Procesos a pantalla completa",
    "emoji": "⬆️",
    "cambios": [
      {
        "tipo": "mejora",
        "texto": "El Mapa de Procesos ahora ocupa todo el ancho de la pantalla (antes se veía como una franja estrecha al centro) y el lienzo es más alto."
      }
    ]
  },
  {
    "version": "1.55.78",
    "fecha": "2026-07-20",
    "titulo": "Mapa de Procesos en modo oscuro",
    "emoji": "🆕",
    "cambios": [
      {
        "tipo": "nuevo",
        "texto": "El Mapa de Procesos (Flujo Maestro) ahora se ve en modo oscuro, con los colores del diseño original."
      },
      {
        "tipo": "mejora",
        "texto": "Nuevo botón sol/luna para cambiar entre claro y oscuro; recuerda tu elección."
      }
    ]
  },
  {
    "version": "1.55.77",
    "fecha": "2026-07-20",
    "titulo": "Novedades más claras",
    "emoji": "⬆️",
    "cambios": [
      {
        "tipo": "mejora",
        "texto": "Este cuadro de Novedades ahora habla en simple, con etiquetas de color (Nuevo, Mejora, Arreglo, Ajuste, Seguridad) como las notas de un parche de videojuego."
      },
      {
        "tipo": "nuevo",
        "texto": "Cada cambio se marca con su tipo para que se entienda de un vistazo."
      }
    ]
  },
  {
    "version": "1.55.76",
    "fecha": "2026-07-19",
    "titulo": "El Asistente IA se puede ocultar",
    "emoji": "🆕",
    "cambios": [
      {
        "tipo": "nuevo",
        "texto": "Ahora puedes prender o apagar el Asistente IA cuando quieras desde Configuración → Vistas."
      }
    ]
  },
  {
    "version": "1.55.75",
    "fecha": "2026-07-19",
    "titulo": "¡Llegó el Asistente IA!",
    "emoji": "🆕",
    "cambios": [
      {
        "tipo": "nuevo",
        "texto": "Un chat con inteligencia artificial: pregúntale por tus ventas, tu stock o tus tickets y te responde al instante."
      },
      {
        "tipo": "seguridad",
        "texto": "Solo consulta información (no cambia nada) y respeta lo que cada persona tiene permitido ver."
      }
    ]
  },
  {
    "version": "1.55.74",
    "fecha": "2026-07-19",
    "titulo": "Historial de ingresos",
    "emoji": "🆕",
    "cambios": [
      {
        "tipo": "nuevo",
        "texto": "Nueva pantalla \"Accesos\" para ver quién entró al sistema y cuándo."
      },
      {
        "tipo": "mejora",
        "texto": "Las pantallas de seguridad avisan mejor cuando algo está cargando o falló."
      }
    ]
  },
  {
    "version": "1.55.73",
    "fecha": "2026-07-19",
    "titulo": "Arreglos y más velocidad",
    "emoji": "🔧",
    "cambios": [
      {
        "tipo": "fix",
        "texto": "Corregidos errores al consultar el estado de ventas y al importar datos."
      },
      {
        "tipo": "mejora",
        "texto": "El sistema quedó un poco más rápido."
      }
    ]
  },
  {
    "version": "1.55.72",
    "fecha": "2026-07-19",
    "titulo": "Se ve mejor",
    "emoji": "🔧",
    "cambios": [
      {
        "tipo": "fix",
        "texto": "El calendario de Post-Venta ahora se ve bien en el celular."
      },
      {
        "tipo": "mejora",
        "texto": "Colores y avisos de carga más claros en varias pantallas."
      }
    ]
  }
];
