# PR-015B · Regla transversal HIDDEN_PRIVATE_BETA (FEATURE_IMPLEMENTED ≠ FEATURE_RELEASED)

Fecha: 2026-08-17 · Rama: `release-a-foundation` · Requisito del usuario (regla transversal CCO 2.0).

## Objetivo

Un módulo puede estar **100% implementado y desplegado** en código/BD/rutas pero **NO publicado**.
La implementación técnica **no autoriza la publicación**: la visibilidad es una decisión de release
independiente. Todo módulo nuevo debe nacer **oculto** (HIDDEN_PRIVATE_BETA) hasta que se autorice
su liberación por etapas.

```
NEW_MODULE_PUBLIC_VISIBILITY = 0
NEW_MODULE_NAV_VISIBILITY    = 0
NEW_MODULE_GENERAL_ACCESS    = 0
FEATURE_IMPLEMENTED != FEATURE_RELEASED
```

## Capas de protección (TODAS deben pasar)

| #   | Capa                                                                             | Implementación                                                                                   |
| --- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| 1   | Feature flag `module_<nombre>_private_beta`                                      | `src/config/featureFlags.js` (OFF por defecto, fail-closed, override `VITE_FF_<FLAG>=true`)      |
| 2   | Allowlist por rol IAM `cco_private_beta_<modulo>`                                | `src/constants/privateBeta.js` → `evaluatePrivateBetaAccess` (ADMIN no abre la beta por sí solo) |
| 3   | Permiso específico `view_<nombre>_private_beta` / `manage_<nombre>_private_beta` | guard de rutas + RPC                                                                             |
| 4   | Autorización backend/RPC + RLS                                                   | el guard del cliente no basta; la RPC/RLS deben gatear igual                                     |

Flujo del guard: `flag ON?` → `NO` → **404** (el módulo no existe, no filtra su existencia).
`SÍ` → `¿en beta (rol IAM)?` → `NO` → Access Denied/404. `SÍ` → `¿permiso específico?` → `NO` →
Access Denied. `SÍ` → módulo.

## Superficies donde un módulo oculto NUNCA aparece

Sidebar / AppShell, menú móvil, Command Palette / búsqueda global, Home, favoritos, notificaciones,
breadcrumbs, dashboards, enlaces públicos, docs visibles, Release Notes. `routeMeta` marca
`privateBeta: true` → `hiddenFromNav: true` + `searchable: false` automáticamente.

## Arquitectura (código nuevo)

- **`src/config/featureFlags.js`** — registry `FEATURE_FLAGS` + `isFeatureFlagEnabled(flag)` +
  `enabledFeatureFlags()`. Fail-closed (flag no registrado = OFF).
- **`src/constants/privateBeta.js`** — `RELEASE_STAGES`, `PRIVATE_BETA_MODULES` (registro por módulo:
  path, flag, viewPermission, managePermission, betaRole, stage), `privateBetaForPath(pathname)`,
  `evaluatePrivateBetaAccess(cfg, {flagOn, hasPermission, roles})` → `{allowed, reason, stage}`,
  `inPrivateBetaRole(cfg, roles)`. **Sin UUIDs hardcodeados** (se eliminó el patrón de Coordinación de
  Rutas: `PRIVATE_ROUTE_COORDINATOR_AUTH_UID`).
- **`src/constants/routeMeta.js`** — rutas en beta: `privateBeta: true`, `privateBetaStage`,
  `hiddenFromNav: true`, `searchable: false`; `PRIVATE_BETA_EXTRA` cataloga rutas beta no presentes en
  `APP_ROUTES` (p. ej. `/panel/rutas`) para que el AppShell las resuelva sin listarlas.
- **`src/constants/permissions.js`** — `puedeAccederRuta(pathname, user, hasPermission, roles)`: evalúa
  primero `privateBetaForPath` (flag + rol + permiso) y luego el resto de rutas. `puedeVerCoordinacionRutas`
  delegó en `evaluatePrivateBetaAccess` (migración del UUID al patrón IAM).
- **`src/App.jsx`** — `ProtectedRoute`: si el acceso falla por `FLAG_OFF` renderiza **`<NotFound/>`**
  (no AccessDenied, para no filtrar la existencia). El resto de razones → AccessDenied.

## Etapas de release y gates

`DEVELOPMENT` → `PRIVATE BETA` → `INTERNAL PILOT` → `LIMITED RELEASE` → `GENERAL AVAILABILITY`.
Cada salto de etapa es una decisión del dueño (Admin), NO consecuencia de merge/deploy. En TXT 00 cada
módulo nuevo debe marcarse `RELEASE STATUS = HIDDEN_PRIVATE_BETA` hasta autorizarlo.

## Migración del patrón viejo (Coordinación de Rutas)

Antes: `permissions.js` hardcodeaba `PRIVATE_ROUTE_COORDINATOR_AUTH_UID = 'c12e2286-…'` (allowlist por
UUID). Ahora: flag `module_rutas_private_beta` **ON** (pilot activo) + rol IAM `cco_private_beta_rutas`

- permisos `view_rutas_private_beta`/`manage_rutas_private_beta`. El backend queda cerrado por la
  migración `20260820163037_coord_rutas_capacity_fleet_v1_polished.sql`: crea el rol, asigna únicamente
  al propietario histórico del piloto y redefine `coord_rutas_es_propietario()` para validar rol y
  permiso IAM en todas las políticas/RPC existentes. El UUID se usa una sola vez como dato de migración
  para la asignación inicial; no participa en la autorización en tiempo de ejecución.

## Cómo registrar un módulo nuevo (checklist)

1. `src/config/featureFlags.js` → añadir `module_<nombre>_private_beta: false`.
2. `src/constants/privateBeta.js` → `PRIVATE_BETA_MODULES.<nombre>` con su path/flag/permisos/rol/stage.
3. Ruta lazy en `App.jsx` (si existe en `APP_ROUTES` será auto-oculta; si no, registrarla en
   `PRIVATE_BETA_EXTRA` de `routeMeta.js`).
4. Backend: rol IAM `cco_private_beta_<modulo>`, permisos en `tms_permisos`, RPC gateadas + RLS.
5. NO tocar Navbar/CommandPalette/Home/notificaciones/docs/release notes (el sistema las oculta solo).
6. Tests: ampliar `src/tests/privateBetaContract.test.js` (nuevo módulo = 3 capas + ocultamiento).

## Verificación

- `npm test` → suite completa. Tests nuevos: `src/tests/privateBetaContract.test.js` (19 tests).
- `npx tsc --noEmit` → limpio.
- `npx eslint` sobre los archivos tocados → 0 errores (3 warnings preexistentes de App.jsx).
- Build → OK.
- Fallo estable de env (no relacionado): `panelDashboardWeeklyTrend.test.js` (necesita `VITE_SUPABASE_URL`).
