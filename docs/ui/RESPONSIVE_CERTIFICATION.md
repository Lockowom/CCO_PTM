# PR23 · Certificación responsive

## Contrato automatizado

La suite `tests/e2e/responsive.spec.ts` valida que Login y Consulta pública no produzcan overflow horizontal crítico en:

`320x720`, `360x800`, `375x812`, `390x844`, `412x915`, `430x932`, `480x960`, `600x960`, `768x1024`, `1024x768`, `1280x800`, `1366x768`, `1440x900` y `1920x1080`.

También comprueba que la acción primaria del login siga accesible a `320x720`.

```bash
npx playwright test tests/e2e/responsive.spec.ts
```

## Estados de certificación por ruta

Para cada ruta interna, la beta debe registrar evidencia de: default, loading, empty, error, texto largo, tabla grande, modal, drawer, dropdown, teclado abierto, zoom 125% y zoom 150%.

## Dispositivos físicos pendientes

La automatización web no certifica cámara, notch, navegación por gestos, rotación, botón Atrás ni teclado nativo. Esos casos requieren ejecución manual en Xiaomi, Motorola y Samsung antes del cutover general.

## Criterio blocker

No se aprueba una ruta si una acción queda oculta, existe scroll horizontal de página, un modal sale del viewport, el CTA queda detrás del teclado o BottomNav cubre una acción.

## Rollback

Este PR no cambia funcionalidad. Para retirar la certificación automatizada, revertir el PR; los flags de superficies V2 siguen apagados.
