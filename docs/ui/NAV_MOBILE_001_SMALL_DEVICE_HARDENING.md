# NAV-MOBILE-001 — Small-device hardening

## Causa raíz

El header conservaba branding, badge de sistema, campana, perfil y hamburguesa
en una sola fila sin un bloque de marca reducible ni acciones protegidas contra
shrink. En un Samsung estrecho el contenido podía comprimir la hamburguesa.

## Cambio

`Navbar.jsx` conserva una sola navegación y el mismo catálogo IAM. La marca usa
`flex-1 min-w-0 overflow-hidden`; las acciones usan `shrink-0`. Bajo 400 px se
ocultan el subtítulo, el badge y el perfil superior. La campana sigue montada
una vez y permanece disponible. El botón de menú mide al menos 44 × 44 px e
incluye `aria-label`, `aria-expanded` y `aria-controls`.

El drawer ocupa `left/right: 8px` en XS y vuelve a lateral limitado desde `sm`.
Usa altura explícita basada en `100dvh`, con top/bottom seguros mediante
`env(safe-area-inset-top/bottom)`, scroll interno con `overscroll-contain`, y
footer de usuario fijo. El fondo XS no fuerza blur. La transición es de 200 ms
y respeta `prefers-reduced-motion`.

Al abrir se bloquea el scroll del body y el cleanup restaura el valor anterior.
Se cierra por backdrop, Escape, ruta, query y cualquier enlace del drawer.

## Cobertura

La suite responsive incluye 320×568, 320×720, 360×640, 360×720, 360×800, 375×812,
390×844, 412×915, y landscape 568×320, 640×360 y 800×360; conserva las pruebas
desktop existentes. El contrato autenticado de Navbar cubre acceso al botón,
apertura/cierre repetido, drawer, logout/seguridad y filtrado de rutas.

## Validación local

- `src/tests/navbarMobileContract.test.jsx`: 4 PASS.
- `tests/e2e/responsive.spec.ts`: 41 PASS en Chromium.
- ESLint: PASS, sin errores nuevos.
- Typecheck: PASS.
- Build: PASS.

Excepción de publicación urgente: `npm test` completo no es gate de
NAV-MOBILE-001. Su ejecución posterior al build dejó 406 de 407 pruebas PASS y
un timeout de `recepcionDevoluciones.test.jsx`, ajeno al Navbar y al responsive.
La deuda de catálogo de arquitectura y cualquier corrección de Devoluciones
quedan explícitamente fuera de este commit.

La ejecución E2E usó variables públicas de prueba dirigidas a `127.0.0.1` sin
servicio de base disponible; no ejecutó SQL, no creó datos y no usó credenciales.

## Gates

```ini
MOBILE_MENU_VISIBLE_320 = 1
MOBILE_MENU_OPEN_320 = 1
MOBILE_HEADER_OVERFLOW = 0
MOBILE_DRAWER_OVERFLOW = 0
PAGE_HORIZONTAL_OVERFLOW = 0
MOBILE_ROUTE_LOSS = 0
MOBILE_PRIVILEGE_GAIN = 0
DESKTOP_REGRESSION = 0
IAM_CHANGE = 0
BACKEND_CHANGE = 0
SQL = 0
STOCK_SIDE_EFFECT = 0
CONS_001_CHANGE = 0
```
