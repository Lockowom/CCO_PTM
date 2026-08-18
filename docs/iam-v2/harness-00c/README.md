# Harness PR-IAM-R06 — Legacy vs Resolver V2 (surface-level, shadow mode)

Shadow mode puro: la autoridad SIGUE siendo `ROUTE_PERMISSIONS` (legacy). El resolver V2
(`src/domain/access/resolverV2.js`) calcula y compara, sin bloquear a ningún usuario.

## Qué compara

- **Surfaces**: 50 pantallas del `SCREEN_REGISTRY` (módulos: panel, inbound, inventario,
  queries, quality, postventa, tms [oculto], admin; incluye private beta `panel.routes`
  fail-closed).
- **Usuarios**: los 16 de `docs/iam-v2/datos_iam.json` (permisos = unión de los roles
  asignados en `iam.assignments`).
- **Legacy**: guard actual = OR por ruta (`ROUTE_PERMISSIONS`) + private beta cerrada.
- **V2**: `resolveAccessV2` con precedencia (shadow): EXPLICIT_DENY > DIRECT_ALLOW >
  PROFILE_ALLOW > LEGACY_COMPATIBILITY > DEFAULT_DENY; sin overrides/delegaciones en este
  harness (no existen datos aún).

## Cómo correrlo

```bash
IAM_HARNESS_WRITE=1 npx vitest run src/tests/iamHarness00c.test.js
```

Sin la env var solo corre la aserción (gate). Con la env var regenera
`diff_screens.csv`, `unmapped.csv` y `report.md`.

## Resultado (2026-08-18)

| diff       | filas |
| ---------- | ----- |
| SAME_ALLOW | 288   |
| SAME_DENY  | 512   |
| LOSS       | 0     |
| GAIN       | 0     |
| ERROR      | 0     |

**Total surfaces: 800 (16 × 50). Gate: PASS — equivalente a nivel pantalla.**

`diff_screens.csv`: cada fila es user+screen con legacy/v2/origen (SAME_ALLOW, SAME_DENY,
LOSS, GAIN, ERROR). `unmapped.csv`: permisos legacy asignados sin pantalla:
`deploy_ota`, `export_data`, `manage_fichas` (solo Admin Respaldo y Administrador; el
`view_asistente` no está asignado a nadie hoy).

## UNMAPPED — plan de resolución (no es pérdida, es deuda de granularidad)

| permiso         | naturaleza                          | plan (R17+, granularización por dominio) |
| --------------- | ----------------------------------- | ---------------------------------------- |
| `deploy_ota`    | acción sin ruta (RPC/UI OTA)        | función `admin.ota.deploy`               |
| `export_data`   | acción transversal (exports)        | función por pantalla `*.export`          |
| `manage_fichas` | acción (gestión de fichas técnicas) | función `queries.datasheet.manage`       |

Se resuelven ANTES del cutover (gate `UNMAPPED_LEGACY=0`, spec §23/§139).

## Estado del resolver V2

- `resolveAccessV2` listo y sin autoridad (shadow). Origen por pantalla y motivos
  (permisos que la otorgan) → alimentará R10 (Effective Access + Origin).
- Overrides (R07), perfiles (R08) y delegaciones (R13) entran como inputs sin tocar la
  autoridad.
- Nilo (fixture spec §56-58): legacy == V2 en las 5 pantallas del Panel; `panel.nv.reopen`
  y `panel.settings` quedan fuera (sin `approve_panel_reopen_nv`/`manage_roles`).
