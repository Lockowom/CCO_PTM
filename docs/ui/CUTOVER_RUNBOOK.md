# CCO 2.0 — Runbook de cutover UI

## Estado

El Shell V2 está integrado al runtime, pero permanece apagado por defecto hasta completar la migración y la regresión visual. La activación no modifica rutas, permisos, tablas, RPC ni reglas de negocio.

## Activar en beta

Definir en el entorno beta:

```bash
VITE_FF_WEB_SHELL_V2=true
```

Compilar y ejecutar smoke tests en 360×800, 768×1024, 1366×768 y 1920×1080.

## Evidencias mínimas

- Usuario limitado: el sidebar solo enumera rutas autorizadas.
- Usuario admin: catálogo completo sin rutas private-beta ajenas.
- Navegación móvil: conserva Navbar y permisos actuales.
- Realtime, OTA, descargas y reporte de errores siguen montados una sola vez.
- `data-shell-version="2"` está presente en el contenedor raíz.

## Rollback inmediato

Quitar la variable o definir:

```bash
VITE_FF_WEB_SHELL_V2=false
```

Volver a desplegar el build anterior. El runtime seleccionará `Layout` legacy y expondrá `data-shell-version="legacy"`; no se requiere rollback de base de datos.

## Gates

```bash
npm run ui:audit
npm run lint -- --quiet
npm run test
npm run build
```

El gate final de retiro legacy exige adopción core ≥95%, cero rutas o permisos perdidos y aprobación visual multi-viewport.
