# PR-016 · Panel N.V. — Refactor service (preflight + data quality + optimistic concurrency)

> Contrato: TXT 05 §22 **PANEL INGRESAR NV**
> _Refactor service. Preflight. Data quality. Optimistic version. No inventory mutation._

## Objetivo

El módulo `src/pages/Panel/ingresar` acumulaba toda la lógica de validación del
guardado **inline** dentro del `handleSubmit` del screen `PanelIngresar.jsx`
(~170 líneas de reglas no testeables). PR-016 extrae esa lógica a módulos puros y
testeables, añade **data quality** (el cliente envía datos limpios, espejo del
trigger de BD) y **optimistic concurrency** (token dedicado `row_version`) para
que dos operadores no se pisen mutuamente los cambios. Confirma la regla
transversal **No inventory mutation**: el flujo de Ingresar N.V. solo toca
`tms_operaciones`.

## Estado real del PR (rev. P0 — NO sobrevender)

| Banderín                  | Valor                                                                    |
| ------------------------- | ------------------------------------------------------------------------ |
| PR-016 CODE_READY         | `true`                                                                   |
| PR-016 DB_DEPLOYED        | `true` (migración 173 aplicada en PROD el 2026-08-17)                    |
| PR-016 CONCURRENCY_ACTIVE | `true` (smoke de concurrencia PASS en BD real)                           |
| Concurrency hoy           | **compatibility mode** (fase A): gate solo si el cliente envía `version` |

Estrategia de fases A→D (ver §6). Mientras el cliente no envía `version`, la RPC
se comporta igual que antes (fail-open). El enforcement definitivo es la fase D
(`nv_version_obligatoria()` hoy devuelve `false`; activar con
`set app.nv_require_version = 'on'` + flag cliente `panel_nv_require_version`).

## Cambios

### 1) `src/pages/Panel/ingresar/preflight.js` (nuevo)

Centraliza TODAS las reglas que vivían en `handleSubmit`. Cada una devuelve un
problema `{ field, message, code }` o `null`:

| Regla                                                     | Código                         |
| --------------------------------------------------------- | ------------------------------ |
| Estado obligatorio                                        | `ESTADO_REQUERIDO`             |
| Pausa Shipping exige motivo al cambiar subestado          | `SHIPPING_PAUSA_SIN_MOTIVO`    |
| Pausa Shipping activa bloquea avanzar a En Ruta           | `SHIPPING_PAUSA_ACTIVA`        |
| IAM sin permiso de edición (salvo transición restringida) | `IAM_DENEGADO`                 |
| N.V. entregada → bloqueada (solo reapertura)              | `NV_ENTREGADA`                 |
| Asociación Orange obligatoria para clientes PTM Orange    | `ORANGE_ASSOCIATION_REQUERIDA` |
| Cliente requerido en alta (salvo canal Varios)            | `CLIENTE_REQUERIDO`            |

`preflightGuardar(st, ctx)` ejecuta todas las reglas relevantes y devuelve
`{ ok, problems }`; `primerProblema()` prioriza (mismo comportamiento que el
mensaje único del handleSubmit original).

### 2) `src/pages/Panel/ingresar/dataQuality.js` (nuevo)

Saneamiento/normalización 100% puro:

- `normNV` — quita sufijo `.0` de N.V. (`"001234.0"` → `"001234"`); conserva
  ceros a la izquierda y alfanuméricos. **Regla: identificador ≠ cantidad**.
  `normNumber` solo se aplica a CANTIDADES (bultos, valorFactura); los
  identificadores (NV, guía, factura, RUT, SKU, serie, partida…) usan
  `normText`/`normNV` para no destruir `"001234"`.
- `normText` — trim + colapso de espacios.
- `normNumber` — acepta `"1.234,5"`, `"12.5"`, `"12"` → `Number`; rechaza basura.
- `soloFecha` — recorta timestamps a `YYYY-MM-DD` para `<input type=date>`.
- `normEstadoInput` — estado vacío/inválido → primer estado del flujo.
- `sanitizePayload` — aplica todo lo anterior sin mutar el input.
- `resumenPayload` — extrae solo lo relevante para audit/resumen.
- `tieneCamposInventario` — red de seguridad a nivel APP (payload sin campos de
  stock). NO demuestra por sí solo ausencia de mutación en BD → ver §7.
- `diffNvConflict(loaded, server, intent)` — diff legible para el modal de
  conflicto: `serverChanges` (qué cambió el otro operador) y `tusChanges` (qué
  intentó el usuario y no se aplicó).

### 3) `src/pages/Panel/ingresar/optimisticVersion.js` (nuevo)

Token de concurrencia = `row_version` (bigint, dedicado), NO `fecha_estado`:

- `versionDeRow(row)` → `row.row_version` (bigint). Tras cada escritura la RPC
  devuelve la **nueva** versión → el cliente no necesita lookup extra.
- `versionEsActual(enviada, actual)` — comparación numérica exacta; retrocompatible
  (sin versión no hay gate, compat mode).
- `esConflicto(result)` / `resultadoConflicto(result)` — tipifica
  `{ ok:false, conflict:true, code:'CONFLICT', version }`.
- `esVersionRequerida(result)` — fase D (la RPC exige versión).

### 4) `src/pages/Panel/ingresar/ingresarService.js` (refactor)

- `guardar(payload)` — envía `version` (del lookup) y, si la RPC responde
  conflicto, lo tipifica y **no resetea los caches** (el cambio no aplicó).
  El PREVIEW de lookup ahora incluye `row_version`.
- `cambiarEstado(id, estado, urgente, expectedVersion)` — nuevo 4º parámetro
  `p_expected_version` (bigint, opcional, retrocompatible).
- `actualizarCampos(id, dirty)` — mismo manejo de conflicto.

### 5) `src/pages/Panel/screens/PanelIngresar.jsx` (refactor)

`handleSubmit` queda: **preflight → sanitizePayload → version optimista → guardar**.

- Conflicto: recarga el lookup con `syncFoundResult`, avisa y **no cierra el
  modal** (no se pierde lo editado) y muestra el **diff legible** (Cambios del
  otro operador / Tus cambios no aplicados) — UX de conflicto, no solo
  "inténtalo de nuevo".
- Fase D (`version_required`): recarga el lookup (trae `row_version`) y avisa.
- El caso `NV_ENTREGADA` conserva el flujo de reapertura.

### 6) Migración SQL `173_panel_nv_optimistic_version.sql`

- **`row_version bigint NOT NULL DEFAULT 1`** en `tms_operaciones` (token dedicado;
  `fecha_estado` queda solo como "cuándo cambió el estado", como debe ser).
- Trigger `tms_operaciones_bump_version` (BEFORE UPDATE) incrementa `row_version`
  en CADA UPDATE (cualquier campo). No toca `tms_operaciones_before_write`.
- `guardar_nv(p jsonb)`:
  - CREATE (`id=null, version=null`): sin gate de versión (authz + duplicate lock).
  - UPDATE (`id≠null, version=row_version esperado`): con `FOR UPDATE`, si
    `version <> row_version` → `{ok:false, conflict:true, version}` y NO aplica.
  - Si `version` falta y `nv_version_obligatoria()` (fase D) → `version_required`.
  - Mantiene authz IAM completa: `_panel_puede_escribir()` + `can_manage_operacion_row`
    / `can_change_operacion_estado_row` / `can_create_operacion_scope`.
  - Devuelve la **nueva** `version` (row_version) tras cada escritura.
- `cambiar_estado_nv(bigint, text, boolean, bigint)`: mismo gate con
  `p_expected_version`. DROP de firmas previas (3 args y 4 args text).
- Grants: revoke de `public` **y de `anon`** + grant a `authenticated` (mismo patrón
  que 085/158; el revoke defensivo de `anon` corrige un grant residual detectado en
  PROD tras el deploy: `anon` quedaba con EXECUTE en la firma 4-arg).
- **No toca tablas de inventario** (solo `tms_operaciones` + log + workflow).

## Tests

`src/tests/panelIngresarPreflight.test.js` (**28 tests**):

- data quality: normNV (incl. casos límite: `"001234"`, `"12A34"`, null),
  normNumber solo en cantidades, sanitize sin mutación, resumen sin datos
  sensibles, detección de campos de inventario.
- preflight: cada regla + orquestador + prioridad de `primerProblema`.
- optimistic version: `row_version` numérico, comparación exacta, tipificación de
  conflicto con `ERROR_CODES.CONFLICT`, `version_required`.
- UX de conflicto: `diffNvConflict` (serverChanges/tusChanges).

## Verificación — redacción EXACTA (rev. P1)

La suite es 100% verde en esta máquina:

- `TEST_ASSERTIONS_PASS = 240` (todas las aserciones pasaron).
- `TEST_FILES_FAILED_ENV = 0` (`src/tests/panelDashboardWeeklyTrend.test.js` usa
  el mock de `supabase` del resto de la suite; el fail previo era el import
  transitivo `dashData → supabase → parseAppEnv`, no lógica).
- `FULL_TEST_COMMAND_GREEN = true` (exit de vitest = 0 localmente).
- `tsc --noEmit` limpio; eslint 0 errores (warnings preexistentes ajenos a PR-016);
  `npm run build` OK (PWA v1.3.0).

La suite está "verde" sin calificativos.

## No stock mutation — dos niveles (rev. P1)

| Nivel      | Evidencia                                                                                                                                                                                                                             | Estado                                                                                  |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Aplicación | `sanitizePayload` no añade campos de stock + `tieneCamposInventario` rechaza payload con SKU/stock/cantidad/wms_move_stock                                                                                                            | ✅ implementado + test                                                                  |
| BD         | `supabase/verificacion/PR-016_no_stock_mutation_test.sql`: snapshot de `tms_partidas`/`tms_series`/`tms_inventario_general` ANTES → ejecuta `guardar_nv`/`cambiar_estado_nv` → snapshot DESPUÉS → `expect before == after` (rollback) | ✅ **PASS en PROD** (2026-08-17): `stock_mutation_test = PASS`, rollback sin residuales |

Gate renombrado: **`STOCK_SIDE_EFFECT_FROM_PANEL_NV = 0`** (antes
`STOCK_SIDE_EFFECT_FROM_ROUTE`, nombre incorrecto: no es Routes).

## Deploy / pendiente

- ✅ **Aplicada**: migración `173_panel_nv_optimistic_version.sql` desplegada en
  PROD el 2026-08-17 (Management API, sesión única). Verificada: columna
  `row_version bigint NOT NULL DEFAULT 1`, trigger `trg_tms_operaciones_bump_version`,
  firmas `guardar_nv(jsonb)` + `cambiar_estado_nv(bigint,text,boolean,bigint)`,
  `nv_version_obligatoria()`, grants `authenticated` sí / `anon` no.
- ✅ **Smoke post-deploy (PROD)**: 7 casos PASS con sesión authenticated de un
  ADMIN real — create→ok v1; update con version correcta→ok v2; update con
  version vieja→CONFLICT sin pisar (estado intacto, devuelve version actual);
  recarga (version 2)→ok v3; cambiar_estado_nv con version→ok v4; legacy sin
  version→aplica (compat mode); version vieja→CONFLICT; `nv_version_obligatoria()=false`.
- ✅ **Test no-stock en BD real**: PASS (snapshots antes/después idénticos).
- Pendiente (fase D): medir clientes sin `version` (telemetry en
  `tms_operaciones_log`), `legacy_without_version = 0`, y recién entonces activar
  `set app.nv_require_version = 'on';` + flag cliente `panel_nv_require_version`
  (OFF por defecto).
- Versión: **1.55.160**. Rama: `release-a-foundation`.

## Gates cumplidos (estado actual)

- PERMISSION_LOSS = 0 (grants idénticos; firmas nuevas son superset).
- FUNCTION_LOSS = 0 (misma semántica salvo el gate opcional).
- ROUTE_LOSS = 0 · DATA_LOSS = 0.
- STOCK_SIDE_EFFECT_FROM_PANEL_NV = 0 → nivel APP ✅ / nivel BD ✅ (verificado en PROD).
- CONCURRENCY_ACTIVE = true (compatibility mode fase A: gate solo si el cliente envía `version`).
