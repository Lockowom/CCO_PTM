# PR-012 · PR-013 · PR-014 — UI Foundation (RELEASE B)

Fecha: 2026-08-17 · Rama: `release-a-foundation` (sin commit aún) · Baseline: 162 tests OK.

RELEASE B del plan **CCO 2.0 (TXT 03 + foundations TXT 04)**. Crea la **capa de UI
compartida** y los dos **shells** (desktop + móvil) **sin tocar** las pantallas
existentes ni los permisos. Todo convive bajo los feature flags `web_shell_v2`
/ `mobile_shell_v2` hasta el CUTOVER del plan; `Layout`/`Navbar` siguen intactos.

---

## PR-012 — Design tokens + componentes UI compartidos

### `src/styles/tokens.css` (TXT 03 §2)
Tokens semánticos en variables CSS consumibles desde Tailwind o CSS puro:
- **Brand**: escala naranja CCO (`--brand-50…900`).
- **Surface (dark-first)**: `--surface-void/base/elevated/card/overlay/inverse`.
- **Border**: `--border-subtle/default/strong/accent`.
- **Text**: `--text-primary/secondary/muted/faint/inverse/link`.
- **Semantic status**: `--status-ok/warning/danger/info/accent` + variantes subtle.
- **Spacing / Radius / Shadow / Font / Motion** (`120/180/240ms`, easings) / **Z-index**.
- `@media (prefers-reduced-motion: reduce)` que anula animaciones (WCAG 2.3.3).

> No se eliminó `src/styles/tokens.js` (lo consume `tailwind.config.js`). El CSS
> nuevo es complementario y no rompe el JS.

### `src/components/ui/*` (TXT 03 §3)
Primitivos reutilizables, estilo del repo (funciones + `lucide-react` + Tailwind),
**sin dependencias nuevas**:
- `Button.jsx` — variantes `primary/secondary/ghost/danger/success`, tamaños
  `sm/md/lg`, `loading`, `icon`. (Sustituye el `confirm/prompt` nativo en flujos migrados.)
- `Card.jsx`, `StatusBadge.jsx` (tone semántico, no por nombre de estado),
  `InlineAlert.jsx` (role `alert`/`status`), `Skeleton.jsx` (`.pda-skeleton`),
  `EmptyState.jsx`, `PageHeader.jsx`, `FormField.jsx` (label↔input vía id),
  `FilterChip.jsx` (`aria-pressed`), `StickyActionBar.jsx` (dirty/saving/offline/conflict).
- `Overlay.jsx` — `Drawer`, `Modal`, `ConfirmDialog` con **portal + trap de foco +
  Escape + scroll-lock** (`useTrapFocus`/`OverlayRoot`), reemplazo accesible del
  `window.confirm`.
- `index.js` — barrel público (`export { Button, Card, … }`).

**Test** `src/tests/uiComponentsContract.test.jsx` (8): barrel + render mínimo +
`aria-pressed` + `role=alert`.

---

## PR-013 — routeMeta SSOT + AppShell (TXT 03 §4-5)

### `src/constants/routeMeta.js` — metadatos de ruta (SSOT)
Derivado de `APP_ROUTES` (`src/config/modules.js`) **+** `ROUTE_PERMISSIONS`
(`src/constants/permissions.js`). **NO duplica lógica de permisos**: lee
`requiredPermissions` de la fuente de verdad. Cada entrada: `{ path, title,
module, group, parent, requiredPermissions, searchable, mobilePriority,
hiddenFromNav }`.
- `getRouteMeta(pathname)` — normaliza query y trailing slash, fallback por prefijo.
- `getBreadcrumb(pathname)` — `[grupo, página]` para el Topbar.
- `SEARCHABLE_ROUTES` — ordenadas por `mobilePriority` (búsqueda global).
- `getNavGroups()` — rutas agrupadas por módulo, **sin** `hiddenFromNav`
  (`/panel/tv`, `/admin/monitor`, `/tms/*`).

### Shell desktop `src/components/shell/`
- `AppShell.jsx` — Sidebar + Topbar + contenedor `max-w-[1600px]`.
- `Sidebar.jsx` — `w-60` expandido / `w-16` colapsado (`lg:`), grupos colapsables,
  `NavLink` activo con `bg-brand-500/10`.
- `Topbar.jsx` — breadcrumb routeMeta-driven + búsqueda (Ctrl+K) + sync.
- `index.js` — barrel.

**Test** `src/tests/appShellContract.test.jsx` (7): cobertura de APP_ROUTES,
derivación de permisos, normalización de rutas, breadcrumb, grupos sin
hiddenFromNav, orden de SEARCHABLE_ROUTES, render del shell.

---

## PR-014 — MobileShell (TXT 04 §2-6)

`src/components/shell/mobile/`:
- `MobileAppShell.jsx` — `h-[100dvh]` + `env(safe-area-inset-*)`.
- `MobileTopBar.jsx` — título corto + menú/búsqueda; targets táctiles **≥44px**.
- `MobileBottomNav.jsx` — 3-5 accesos por `mobilePriority` de routeMeta + item **Más**;
  `min-h-[44px]`, safe-area bottom.
- `MobileDrawer.jsx` — drawer accesible reutilizando `Drawer` (portal/focus/Escape).
- `MobileQuickActions.jsx` — FAB flotantes (44×44px).
- `MobilePageHeader.jsx` — encabezado compacto.
- `index.js` — barrel.

**Test** `src/tests/mobileShellContract.test.jsx` (6): render de cada pieza +
`aria-label` de accesibilidad.

---

## Gates RELEASE B

| Gate | Resultado |
|------|-----------|
| PERMISSION_LOSS | 0 (no se tocó ninguna ruta/permiso existente) |
| ROUTE_LOSS | 0 (`Layout`/`Navbar` intactos; shells nuevos aditivos) |
| FUNCTION_LOSS | 0 |
| DATA_LOSS | 0 (sin migraciones de datos) |
| STOCK_SIDE_EFFECT | 0 |

## Verificación
- Lint: sin errores nuevos (los 2 errores de `downloadService.js` son baseline preexistente).
- Typecheck: `tsc --noEmit` limpio.
- Suite: **183/183 tests OK** (31/32 archivos; `panelDashboardWeeklyTrend.test.js` falla
  solo por falta de `VITE_SUPABASE_URL` — baseline conocido, CI provee env).
- Build: ✅ 47.7s, PWA v1.3.0 (115 entries precache).

## Archivos nuevos
```
src/styles/tokens.css
src/components/ui/{Button,Card,StatusBadge,InlineAlert,Skeleton,EmptyState,PageHeader,FormField,FilterChip,StickyActionBar,Overlay}.jsx
src/components/ui/index.js
src/constants/routeMeta.js
src/components/shell/{AppShell,Sidebar,Topbar}.jsx
src/components/shell/index.js
src/components/shell/mobile/{MobileAppShell,MobileTopBar,MobileBottomNav,MobileDrawer,MobileQuickActions,MobilePageHeader}.jsx
src/components/shell/mobile/index.js
src/tests/{uiComponentsContract.test.jsx,appShellContract.test.jsx,mobileShellContract.test.jsx}
```