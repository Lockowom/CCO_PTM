// ARCHIVO GENERADO — no editar a mano.
// Se regenera en cada build desde el Changelog de DOCUMENTACION_PROYECTO.md
// (scripts/gen_release_notes.js). Para cambiar una nota, edita el changelog.
export const RELEASE_NOTES = [
  {
    "version": "1.55.60",
    "fecha": "2026-07-19",
    "titulo": "Identity & Security — Fase 2 (cliente consume el IAM + primitivas de guarda)",
    "cambios": [
      {
        "texto": "El cliente pasa a leer los permisos efectivos del IAM vía la RPC iam_me() (Fase 1): src/context/AuthContext.jsx (loadRoleConfig) llama iam_me y usa sus permisos en UNIÓN con el permisos_json legado como red de seguridad — idéntico al gate del servidor (IAM ∨ legado) → el cliente nunca muestra menos permisos que antes,…"
      }
    ]
  },
  {
    "version": "1.55.59",
    "fecha": "2026-07-19",
    "titulo": "Identity & Security — Fase 1 (Authorization Service: IAM como espejo vivo)",
    "cambios": [
      {
        "texto": "Migración 122. Reconciliación crítica: el runtime autoriza leyendo tms_roles.permisos_json (array jsonb, ?|), pero la Fase 0 pobló iam.role_permissions desde la tabla puente tms_roles_permisos, que estaba desactualizada (ADMIN 60 vs 12, CONTROL_CALIDAD 13 vs 0, GERENCIA 27 vs 3). Se reconstruye iam.role_permissions…"
      }
    ]
  },
  {
    "version": "1.55.58",
    "fecha": "2026-07-18",
    "titulo": "Identity & Security — Fase 0 (cimiento IAM, NO destructivo)",
    "cambios": [
      {
        "texto": "Primera fase del rediseño enterprise (docs/IAM_ARQUITECTURA.md). Migración 121: esquemas iam (datos) y authz (decisión); enums scope_type/principal_type; org units (iam.empresas con seed PTM, departamentos/sucursales/centros_distribucion/bodegas/teams); iam.users (1:1 con auth.users), iam.roles, iam.permissions…"
      }
    ]
  },
  {
    "version": "1.55.57",
    "fecha": "2026-07-18",
    "titulo": "Capgo/OTA — experiencia de actualización más fluida",
    "cambios": [
      {
        "texto": "src/services/mobileService.js engancha el evento download de Capgo (antes ignorado) para reportar progreso real (percent), y el overlay src/components/ui/UpdateOverlay.jsx ahora tiene tres fases fluidas: descargando → píldora inferior no intrusiva con barra + % en vivo (no bloquea la app); listo → tarjeta con…"
      }
    ]
  },
  {
    "version": "1.55.56",
    "fecha": "2026-07-18",
    "titulo": "TMS (Transporte) OCULTO — módulo no operativo",
    "cambios": [
      {
        "texto": "El módulo TMS no está operativo (no hay entrada real de órdenes; ver deuda P4 puente N.V.→TMS), así que se oculta de la UI sin borrar nada para poder reactivarlo: comentado en src/config/modules.js (fuera de APP_MODULES/APP_ROUTES/APP_PERMISSIONS) y en el menú (src/components/Navbar.jsx); migración 120 deshabilita su…"
      }
    ]
  },
  {
    "version": "1.55.55",
    "fecha": "2026-07-18",
    "titulo": "Campana de notificaciones + Métricas de proceso (SLA)",
    "cambios": [
      {
        "texto": "(2) NotificationBell en el Navbar (todos los usuarios): campana con contador de no leídas que abre un panel con mis_notificaciones() (in-app del Centro de Notificaciones), marcar leída/todas y \"Ver todas →\". Poll cada 45 s. Hace visible el Centro de Notificaciones que ya operaba por debajo. (3) Métricas / SLA:…"
      }
    ]
  },
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
  }
];
