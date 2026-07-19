// ARCHIVO GENERADO — no editar a mano.
// Se regenera en cada build desde el Changelog de DOCUMENTACION_PROYECTO.md
// (scripts/gen_release_notes.js). Para cambiar una nota, edita el changelog.
export const RELEASE_NOTES = [
  {
    "version": "1.55.54",
    "fecha": "2026-07-18",
    "titulo": "Capgo/OTA v2 — más mejoras al panel de despliegue",
    "cambios": [
      {
        "texto": "(src/components/DespliegueOTA.jsx). (1) Adopción: barra con % de equipos que ya corren la versión de producción (desde ota_dispositivos_resumen). (2) Avisar por push al promover: checkbox en el modal de confirmación que, tras promover, envía un push \"Nueva versión disponible\" vía la Edge notify-inventario (Capgo/FCM).…"
      }
    ]
  },
  {
    "version": "1.55.53",
    "fecha": "2026-07-18",
    "titulo": "API de Operaciones v1 — último motor del blueprint (§8)",
    "cambios": [
      {
        "texto": "Contrato público consumible por Portal Cliente/ERP/integraciones con las mismas reglas que la app. Migración 116: API-keys hasheadas (SHA-256, pgcrypto) con scopes (operaciones:read/write, tms:read/write) en tms_api_keys; RPCs api_key_crear (devuelve la clave en claro una vez), api_key_revocar, api_keys_listar,…"
      }
    ]
  },
  {
    "version": "1.55.52",
    "fecha": "2026-07-18",
    "titulo": "Capgo/OTA — mejoras (dispositivo + panel + gobernanza)",
    "cambios": [
      {
        "texto": "A · Dispositivo: mobileService.buscarActualizacion() (busca e instala a demanda) y versionOTA() (versión/canal vigentes); en CanalOTA se muestra la versión OTA/nativa/canal y un botón Buscar actualización. Los auto-updates ahora se auditan (registrar_ota_aplicado → fila canal='aplicado'). B · Panel (DespliegueOTA):…"
      }
    ]
  },
  {
    "version": "1.55.51",
    "fecha": "2026-07-18",
    "titulo": "Motores de plataforma — Motor de Eventos + Centro de Notificaciones",
    "cambios": [
      {
        "texto": "(blueprint §7.2/§7.4). Migración 114: dominio_eventos (append-only) se alimenta SOLO desde workflow_history por trigger → un hecho de negocio = un evento WORKFLOW.accion (OT.registrar_pod, TICKET_PV.crear, NV.avanzar…); reusa todo el cableado de la Fase 2. Centro de Notificaciones: notificacion_regla…"
      }
    ]
  },
  {
    "version": "1.55.50",
    "fecha": "2026-07-18",
    "titulo": "Mapa de Procesos — “Recortar del maestro” (sub-diagramas automáticos por dominio)",
    "cambios": [
      {
        "texto": "En el editor, con un sub-diagrama seleccionado, el botón Recortar del maestro extrae del Flujo Maestro los nodos de ese dominio (filtro heurístico por etiqueta: Master Data 14 · WMS 22 · Operaciones 12 · TMS 20 · Postventa 14), conserva sus conexiones internas y su posición real, y lo carga en el editor para revisar y…"
      }
    ]
  },
  {
    "version": "1.55.49",
    "fecha": "2026-07-18",
    "titulo": "Mapa de Procesos — propiedades, export/import y los 5 sub-diagramas",
    "cambios": [
      {
        "texto": "Sobre el editor: (1) panel de propiedades al seleccionar un nodo (editar etiqueta, cambiar tipo Tarea/Decisión/Inicio/Fin con re-dimensionado, y color propio con reset) o una conexión (editar etiqueta); (2) Exportar (descarga JSON {_meta,nodes,edges}) e Importar (carga un JSON y lo pinta, valida forma); (3) selector…"
      }
    ]
  },
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
  }
];
