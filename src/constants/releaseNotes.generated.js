// ARCHIVO GENERADO — no editar a mano.
// Se regenera en cada build desde el Changelog de DOCUMENTACION_PROYECTO.md
// (scripts/gen_release_notes.js). Para cambiar una nota, edita el changelog.
export const RELEASE_NOTES = [
  {
    "version": "1.55.64",
    "fecha": "2026-07-19",
    "titulo": "Identity & Security — Fase 6 (Seguridad avanzada: MFA/2FA + claims JWT)",
    "cambios": [
      {
        "texto": "Migración 127. MFA (TOTP) de extremo a extremo con Supabase Auth (auth.mfa.*, sin config de proveedor): página Seguridad de mi cuenta (/seguridad, cualquier autenticado, src/pages/Seguridad.jsx + src/services/securityService.js) — activar 2FA con QR + clave manual, verificar código de 6 dígitos, listar/quitar…"
      }
    ]
  },
  {
    "version": "1.55.63",
    "fecha": "2026-07-19",
    "titulo": "Identity & Security — Fase 5 (Sesiones + Auditoría)",
    "cambios": [
      {
        "texto": "Migración 126. Reutiliza lo existente sin duplicar: la auditoría genérica (tms_audit_row() → tms_auditoria, ya cubría tms_roles/tms_usuarios) y las sesiones reales de Supabase Auth (auth.sessions) + presencia (tms_usuarios_activos) + bitácora (tms_accesos). Sesiones: RPC iam_sesiones() (lista admin:…"
      }
    ]
  },
  {
    "version": "1.55.62",
    "fecha": "2026-07-19",
    "titulo": "Identity & Security — Fase 4 (Scopes / ABAC: \"sobre qué datos\")",
    "cambios": [
      {
        "texto": "Migraciones 124 (enum centro_costo) + 125. La realidad de PTM: el único eje de ámbito multivaluado real es centro_costo (tms_operaciones, 9 valores); bodega está consolidada — así que el scope se modela sobre centro_costo sin inventar jerarquía de sucursales. iam.assignments gana scope_code (ámbito por código de…"
      }
    ]
  },
  {
    "version": "1.55.61",
    "fecha": "2026-07-19",
    "titulo": "Identity & Security — Fase 3 (Workflow Permissions: capa de decisión de transiciones)",
    "cambios": [
      {
        "texto": "Migración 123. El Workflow Engine (mig 108) ya tenía la matriz transición×permiso (workflow_transition.permiso_id) y el editor visual; Fase 3 añade la función de decisión reutilizable que faltaba y la conecta al IAM: authz.can_transition(workflow, desde, accion) → boolean sin efectos (sin permiso_id → cualquier…"
      }
    ]
  },
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
  }
];
