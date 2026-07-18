// ARCHIVO GENERADO — no editar a mano.
// Se regenera en cada build desde el Changelog de DOCUMENTACION_PROYECTO.md
// (scripts/gen_release_notes.js). Para cambiar una nota, edita el changelog.
export const RELEASE_NOTES = [
  {
    "version": "1.55.48",
    "fecha": "2026-07-18",
    "titulo": "Mapa de Procesos — ahora EDITABLE dentro de la app + salto al módulo",
    "cambios": [
      {
        "texto": "La pantalla src/pages/Tools/FlujoMaestro.jsx pasa de solo lectura a editor completo (modo *Editar*, solo con manage_workflows/admin): arrastrar nodos, agregar (Tarea/Decisión/Inicio/Fin), conectar (toca origen→destino), renombrar (doble clic), borrar (Supr o botón) y Guardar. Persistencia en BD (migración 113: tabla…"
      }
    ]
  },
  {
    "version": "1.55.47",
    "fecha": "2026-07-18",
    "titulo": "Mapa de Procesos (Flujo Maestro) — visible dentro de la app",
    "cambios": [
      {
        "texto": "Nueva pantalla de solo lectura src/pages/Tools/FlujoMaestro.jsx (ruta /admin/flujo-maestro, menú *Configuración → Mapa de Procesos*) que renderiza el plano maestro (src/data/flujoMaestro.json, copia de docs/flujo-maestro-cco.json: 83 nodos, 108 conexiones) en un lienzo pan/zoom: nodos posicionados por sus coordenadas…"
      }
    ]
  },
  {
    "version": "1.55.46",
    "fecha": "2026-07-18",
    "titulo": "Workflows — rediseño visual: diagrama de la máquina de estados",
    "cambios": [
      {
        "texto": "La pantalla src/pages/Admin/Workflows.jsx desperdiciaba el ancho (listas sueltas). Ahora el protagonista es un diagrama SVG de la máquina: los estados se dibujan como nodos (color propio, badges INICIAL/FINAL) posicionados por orden, con flechas de transición etiquetadas con su acción — avance (recta), salto (arco…"
      }
    ]
  },
  {
    "version": "1.55.45",
    "fecha": "2026-07-18",
    "titulo": "Workflow Engine — Fase 2 completa: Calidad y Conteo cableados (los 5 procesos)",
    "cambios": [
      {
        "texto": "Migración 112: se sacan de esqueleto CALIDAD (flag de producto tms_calidad_flags.estado_calidad: EN_AUDITORIA → CUARENTENA/LIBERADO/MALO, 4 estados/7 transiciones) y CONTEO (sesión tms_conteo_sesiones.estado: abierta ⇄ cerrada, 2/3) — con sus definiciones sembradas y triggers que espejan alta + cambio de estado en…"
      }
    ]
  },
  {
    "version": "1.55.44",
    "fecha": "2026-07-18",
    "titulo": "Workflow Engine — Fase 2: N.V. cableada al motor (mitiga deuda P2)",
    "cambios": [
      {
        "texto": "Migración 111: la Nota de Venta era el único proceso central sin máquina; ahora cambiar_estado_nv y guardar_nv registran cada cambio de estado en workflow_history (proceso NV) vía el helper _nv_wf_log. Decisiones de seguridad: (1) se instrumentan SOLO los caminos de usuario (RPCs), NO un trigger sobre tms_operaciones,…"
      }
    ]
  },
  {
    "version": "1.55.43",
    "fecha": "2026-07-18",
    "titulo": "Workflow Engine — Fase 2: Post-Venta cableado al motor",
    "cambios": [
      {
        "texto": "Migración 110: como los tickets tienen múltiples caminos de escritura (avanzar_pv_ticket, cerrar_pv_ticket, actualizar_pv_ticket free-form, ingesta de correo), en vez de instrumentar cada RPC se usa un trigger paralelo al de tms_postventa_historial: _pv_wf_alta (INSERT → crear) y _pv_wf_cambio (UPDATE con estado…"
      }
    ]
  },
  {
    "version": "1.55.42",
    "fecha": "2026-07-18",
    "titulo": "Workflow Engine — Fase 2: TMS cableado al motor (libro mayor real)",
    "cambios": [
      {
        "texto": "Migración 109: helper interno _wf_registrar(workflow,entidad,desde,hasta,accion,nota) (inserta en workflow_history con el actor) y recreación de las 5 RPCs de TMS (tms_orden_crear_desde_nv, tms_orden_asignar, tms_orden_transicion, tms_orden_pod, tms_incidencia_resolver) para que cada cambio de estado de una Orden de…"
      }
    ]
  },
  {
    "version": "1.55.41",
    "fecha": "2026-07-18",
    "titulo": "Workflow Engine — procesos como datos (Admin → Workflows)",
    "cambios": [
      {
        "texto": "Primer motor de plataforma del blueprint (docs/ARQUITECTURA_CCO.md §7.3): las máquinas de estado dejan de estar solo en código y viven en tablas. Migración 108: workflow_definition / workflow_state (inicial/final, orden, color) / workflow_transition (desde→hasta por acción + permiso_id → 1 transición = 1 permiso) /…"
      }
    ]
  },
  {
    "version": "1.55.40",
    "fecha": "2026-07-18",
    "titulo": "TMS · Torre de Control — detalle en panel lateral (no overlay) en escritorio",
    "cambios": [
      {
        "texto": "El detalle de la orden dejaba a oscuras toda la pantalla y tapaba los botones *Nueva orden*/*Actualizar*. Ahora en escritorio (lg+) se abre como columna lateral en línea junto a la lista (sticky, sin fondo oscuro, aprovechando el ancho): la fila seleccionada se resalta y el panel hace scroll interno con max-h. En…"
      }
    ]
  },
  {
    "version": "1.55.39",
    "fecha": "2026-07-18",
    "titulo": "TMS · Torre de Control — rediseño visual",
    "cambios": [
      {
        "texto": "Se rehízo la presentación de src/pages/TMS/Transporte.jsx (sin cambios de lógica ni de BD): encabezado con badge naranja, tarjeta Todos + KPIs de estado con mejor contraste (número grande, punto de color, gris tenue cuando el conteo es 0 y borde/anillo del color del estado al estar activo), la lista de órdenes vive…"
      }
    ]
  },
  {
    "version": "1.55.38",
    "fecha": "2026-07-17",
    "titulo": "TMS — fix de tipos chofer/ruta + puente usuario↔conductor",
    "cambios": [
      {
        "texto": "Migración 107: tms_conductores.id y tms_rutas.id son uuid, pero tms_transporte_ordenes.conductor_id/ruta_id se habían creado como bigint (Fase 1); con la tabla vacía se cambian a uuid y se ajusta el cast de tms_orden_asignar (sin esto, asignar chofer/ruta fallaba y el filtro \"Mis órdenes\" nunca calzaba). Frontend:…"
      }
    ]
  },
  {
    "version": "1.55.37",
    "fecha": "2026-07-17",
    "titulo": "TMS (Transporte) — Fase 3: app del chofer con foto y firma (POD)",
    "cambios": [
      {
        "texto": "Migración 106: bucket privado tms-pod (evidencia servida con URL firmada). Componente reutilizable src/pages/TMS/PodCapture.jsx: captura foto (cámara), firma en canvas, GPS (geolocalización) y \"recibido por\"; sube la evidencia a Storage y llama tms_orden_pod (que marca la N.V. Entregado). Se usa tanto en el drawer de…"
      }
    ]
  },
  {
    "version": "1.55.36",
    "fecha": "2026-07-17",
    "titulo": "TMS (Transporte) — Fase 2: módulo funcional (Torre de Control)",
    "cambios": [
      {
        "texto": "Frontend nativo del transporte propio sobre el cimiento de la Fase 1. Ruta /tms/control, sección TMS en el menú (Operaciones WMS). Página src/pages/TMS/Transporte.jsx + src/services/tmsService.js: Torre de Control con KPIs por estado (Pendiente/Programado/En Carga/Despachado/En Ruta/Entregado) que filtran, buscador y…"
      }
    ]
  },
  {
    "version": "1.55.35",
    "fecha": "2026-07-17",
    "titulo": "TMS (Transporte) — Fase 1: cimiento de datos (reconstrucción desde 0)",
    "cambios": [
      {
        "texto": "A partir del flujo modelado por el usuario, migración 104 crea el esquema limpio del transporte propio (sin tocar tms_control_despacho, que tiene 4.066 filas de Consultas): tablas nuevas tms_vehiculos, tms_transporte_ordenes (máquina de estados pendiente_asignacion → programado → en_carga → despachado → en_ruta →…"
      }
    ]
  },
  {
    "version": "1.55.34",
    "fecha": "2026-07-17",
    "titulo": "Se retira el módulo Dashboard General",
    "cambios": [
      {
        "texto": "(/dashboard). Se elimina la página src/pages/Dashboard.jsx, su ruta, permiso (ROUTE_PERMISSIONS), grupo de permisos (view_dashboard/view_kpis) y entradas de APP_MODULES/APP_ROUTES, la sección *Core* del Navbar y su etiqueta en usePresence. Inicio repunteado: como /dashboard era el landing por defecto, ahora lo…"
      }
    ]
  }
];
