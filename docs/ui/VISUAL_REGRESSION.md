# PR26 · Regresión visual

## Infraestructura

Playwright captura Login y Consulta pública en siete breakpoints con movimiento reducido, animaciones deshabilitadas y tolerancia máxima de 1% de píxeles.

```bash
npx playwright test tests/e2e/visual.spec.ts
```

Actualizar baselines es una acción explícita y revisable:

```bash
npx playwright test tests/e2e/visual.spec.ts --update-snapshots
```

Nunca se actualizan snapshots automáticamente en CI.

## Rutas internas

El inventario obligatorio está versionado en `tests/e2e/visual-routes.ts`: Panel, Ingresar N.V., Info N.V., Conteo, Análisis, Recepción, Calidad, Postventa, IAM y TMS beta. Sus capturas deben ejecutarse en INTERNAL BETA con un `storageState` de usuario de prueba y datos semilla estables; una redirección al login no cuenta como baseline.

## Política de diff

Todo diff superior al umbral requiere revisión humana. Se estabilizan fecha/hora, animaciones, datos dinámicos y cursores antes de aceptar un nuevo baseline.

## Rollback

Revertir el PR retira exclusivamente la infraestructura y sus baselines; no altera producción.
