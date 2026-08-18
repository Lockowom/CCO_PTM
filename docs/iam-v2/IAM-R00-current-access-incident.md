# IAM-R00 — INCIDENT BASELINE: caso NILO y el permiso amplio manage_panel

Fecha: 2026-08-18 · Spec de referencia: `CCO_2_0_IAM_RECONSTRUCCION_ESTRUCTURAL_CONTROLADA_V1.txt`
(PR-IAM-R00..R23). Relacionado: `IAM-001-control-acceso-ux.md`, `inventario-actual.md`,
`snapshot-00a/`, `harness-00b/`.

## El incidente

**Asignado vs Efectivo.** En la pantalla administrativa, NILO aparece con
**3 permisos del Panel PTM activos** (`manage_panel`, `panel_ingresar`, `panel_info`).
Sin embargo, el usuario **ve 5 pantallas** del Panel: Dashboard, Ingresar N.V., Info N.V.,
Modo TV y Builder — y además las rutas TMS (`/tms/control`, `/tms/pda`) pasan su guard.

```
ASSIGNED_PERMISSION_COUNT (3)  !=  EFFECTIVE_ACCESS_COUNT (5+)
```

Esto NO es un bug visual: es la semántica del resolver actual.

## Resolver actual (fuente: `src/constants/permissions.js`)

Cada ruta declara una lista de permisos con semántica **ANY_MATCH = ALLOW** (regla OR):

| Ruta                   | Permisos declarados                                             |
| ---------------------- | --------------------------------------------------------------- |
| `/panel`               | `view_panel` OR `manage_panel`                                  |
| `/panel/ingresar`      | `panel_ingresar` OR `manage_panel`                              |
| `/panel/info`          | `panel_info` OR `manage_panel`                                  |
| `/panel/tv`            | `panel_tv` OR `manage_panel`                                    |
| `/panel/builder`       | `panel_builder` OR `manage_panel`                               |
| `/panel/reaperturas`   | `approve_panel_reopen_nv` OR `manage_roles`                     |
| `/panel/rutas`         | `manage_panel` + PRIVATE BETA (flag ON, nadie accede)           |
| `/panel/configuracion` | `manage_roles` (solo admin)                                     |
| `/tms/control`         | `view_tms` OR `manage_tms` OR `supervise_tms` OR `manage_panel` |
| `/tms/pda`             | `view_tms` OR `manage_tms` OR `manage_panel`                    |

**Root cause:** `manage_panel` es un **permiso amplio y aditivo** (BROAD): con un solo
checkbox desbloquea 8 rutas (6 del Panel + 2 de TMS) y en backend gatea las RPCs
`guardar_nv`, `cambiar_estado_nv` y `solicitar_reapertura_nv` (mig 173).

## Verificación con datos reales (no intuición)

- `snapshot-00a/rutas_efectivas_por_usuario.csv`: NILO → PERMITIDO en `/panel`,
  `/panel/ingresar`, `/panel/info`, `/panel/tv`, `/panel/builder`, `/tms/control`,
  `/tms/pda`; DENEGADO en `/panel/reaperturas`, `/panel/configuracion`, `/panel/rutas`.
- `snapshot-00a/funciones_rpc_por_usuario.csv`: NILO → `guardar_nv` ✅, `cambiar_estado_nv` ✅,
  `solicitar_reapertura_nv` ✅, `eliminar_nv` ❌, `resolver_reapertura_nv` ❌.
- `harness-00b/`: NILO legacy=4 permisos · IAM2=4 · loss=0 · gain=0 (a nivel permiso/ruta),
  porque el rol SUPERVISOR IAM replica exactamente los 4 permisos del perfil.

## Clasificación del permiso (PR-IAM-R03/R04)

`manage_panel` → **LEGACY_BROAD / DEPRECATED_COMPATIBILITY** (`legacyClassifier.js` +
`legacyExpansionMap.js`). Expansión real documentada:

- Pantallas: `panel.dashboard`, `panel.nv.entry`, `panel.nv.info`, `panel.tv`,
  `panel.builder`, `panel.routes` (beta) + `tms.control`, `tms.pda` (hallazgo).
- Funciones granulares equivalentes: `panel.dashboard.view`, `panel.nv.entry.view/create/
edit/change_state/documents.manage/transport.manage/mark_urgent`, `panel.nv.info.view/
export/history`, `panel.tv.view`, `panel.builder.view/manage`.
- **NO** incluye: `panel.nv.entry.delete` (allowlist por email, mig 099),
  `panel.nv.reopen.approve/reject` (approve_panel_reopen_nv/manage_roles),
  `panel.settings.*` (manage_roles).

## Comportamiento esperado en la migración (spec §19-20, §72)

**Etapa A — Migración (zero-loss):** el IAM 2.0 inicial DEBE reproducir exactamente el
acceso actual de NILO (Dashboard ✅, Ingresar ✅, Info ✅, TV ✅, Builder ✅).

**Etapa B — Normalización administrativa (explícita, nunca durante migración):**
el administrador decide retirar Dashboard/TV/Builder → resultado final: solo
Ingresar + Info.

**Test obligatorio del proyecto (spec §56-58):** fixture NILO — baseline (rutas hoy),
migration (loss=0, gain=0), normalization (rutas finales según decisión).

## Gates del incidente (spec §23, §139)

`PERMISSION_LOSS=0 · ROUTE_LOSS=0 · TAB_LOSS=0 · ACTION_LOSS=0 · SCOPE_LOSS=0 ·
UNEXPECTED_GAIN=0 · UNMAPPED_LEGACY=0 · PRIVATE_BETA_LEAK=0 · DATA_LOSS=0`

Estado hoy (harness-00b): permisos/rutas 0-loss; las 53 pérdidas de FUNCIONES
(`eliminar_nv` 3/16, `wms_move_stock`/`batch_update_nv_estado`/`bulk_upsert` 16/16,
Asistente IA 2/16) son superficie sin permiso de catálogo → plan de cierre en
`harness-00b/README.md` (permisos nuevos `nv_eliminar`, `stock_mover`, `nv_batch_estado`,
`stock_bulk_upsert`).
