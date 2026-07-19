// ARCHIVO GENERADO — no editar a mano.
// Se regenera en cada build desde el Changelog de DOCUMENTACION_PROYECTO.md
// (scripts/gen_release_notes.js). Para cambiar una nota, edita el changelog.
export const RELEASE_NOTES = [
  {
    "version": "1.55.72",
    "fecha": "2026-07-19",
    "titulo": "Auditoría — bloque de UI (móvil + consistencia + estados)",
    "cambios": [
      {
        "texto": "H2 calendario Post-Venta en móvil: index.css excluye grid-cols-7 del colapso global !important (rompía la semana de 7 días; ahora scrollea). M3 clases Tailwind dinámicas: tailwind.config.js gana un safelist para los colores construidos en runtime (StatCard de Users por glowColor: orange/emerald/rose/amber; Heatmap por…"
      }
    ]
  },
  {
    "version": "1.55.71",
    "fecha": "2026-07-19",
    "titulo": "Auditoría — batch de limpieza y hardening (quick wins)",
    "cambios": [
      {
        "texto": "Tras auditoría completa (4 barridos + advisors). Seguridad: migración 134 revoca SELECT de iam.user_effective_permissions a authenticated (la vista no filtra por auth.uid(); las RPC que la usan son SECURITY DEFINER) → cierra fuga potencial de la matriz de permisos. Repo↔BD: se reconstruyen los archivos de migración…"
      }
    ]
  },
  {
    "version": "1.55.70",
    "fecha": "2026-07-19",
    "titulo": "Fix MFA — .catch inválido sobre supabase.rpc tras verificar",
    "cambios": [
      {
        "texto": "El query builder de supabase-js es *thenable* pero NO tiene .catch; await supabase.rpc('iam_mfa_sync').catch(...) lanzaba *\"r.rpc(…).catch is not a function\"* justo después de verificar el TOTP (el factor quedaba verified pero la UI mostraba error y el espejo mfa_enabled no se actualizaba).…"
      }
    ]
  },
  {
    "version": "1.55.69",
    "fecha": "2026-07-19",
    "titulo": "Fix MFA — enrolamiento auto-limpia factores pendientes",
    "cambios": [
      {
        "texto": "Al reintentar activar 2FA tras abandonar un intento (sin \"Cancelar\"), quedaba un factor unverified y Supabase rechazaba el nuevo con *\"A factor with the friendly name … already exists\"*. src/services/securityService.js (enrolarTOTP) ahora lista y des-enrola los factores sin verificar antes de enrolar (los verificados…"
      }
    ]
  },
  {
    "version": "1.55.68",
    "fecha": "2026-07-19",
    "titulo": "IAM — Primer enforcement REAL de ámbitos (Panel/N.V. por centro de costo)",
    "cambios": [
      {
        "texto": "Se aplica de verdad el scope de Fase 4/8 en el Panel: src/pages/Panel/panelQueries.js (cargarRows, el único punto por el que pasan Dashboard, Detalle, TV y búsqueda) consulta iam_mis_scopes('view_panel','centro_costo') y, si el usuario está acotado a centros de costo (all=false), filtra tms_operaciones con…"
      }
    ]
  },
  {
    "version": "1.55.67",
    "fecha": "2026-07-19",
    "titulo": "Identity & Security — Fase 9 (Delegación / sustituciones: cobertura por vacaciones)",
    "cambios": [
      {
        "texto": "Migraciones 131+132. Un delegador presta sus permisos a un delegado durante una ventana [desde, hasta]; se implementa como una rama en iam.user_effective_permissions (la vista que leen el gate, iam_me, scopes y ABAC) → la cobertura entra y CADUCA sola sin tocar nada más (verificado: el delegado hereda los permisos del…"
      }
    ]
  },
  {
    "version": "1.55.66",
    "fecha": "2026-07-19",
    "titulo": "Identity & Security — Fase 8 (ABAC condicional: políticas por atributo del dato)",
    "cambios": [
      {
        "texto": "Migración 130. Motor de políticas con DSL en JSON evaluado en el servidor: tabla iam.policies (recurso, accion, condicion jsonb, activo); authz.user_context(uid) (rol, es_admin, sin_limite_centro, centros_costo), authz.eval_condition(cond, ctx, row) (combinadores all/any/not + hojas {attr, op, value} con ops…"
      }
    ]
  },
  {
    "version": "1.55.65",
    "fecha": "2026-07-19",
    "titulo": "Identity & Security — Fase 7 (Escala)",
    "cambios": [
      {
        "texto": "Migraciones 128+129. (29) Vista materializada iam.mv_user_permissions (permisos efectivos) con índice único por clave natural (assignment_id, permission_id) → REFRESH … CONCURRENTLY vía authz.refresh_permissions(), programada cada 5 min (pg_cron refresh-iam-permissions) y a demanda (RPC iam_refrescar_permisos);…"
      }
    ]
  },
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
  }
];
