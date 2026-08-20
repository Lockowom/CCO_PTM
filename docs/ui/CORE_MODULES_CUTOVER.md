# CCO 2.0 — Cutover Dashboard, Panel N.V. e Inventario

## Flags beta

```bash
VITE_FF_WEB_DASHBOARD_V2=true
VITE_FF_WEB_PANEL_NV_V2=true
VITE_FF_WEB_INVENTORY_V2=true
```

Cada ruta muestra `data-ui-module` y `data-ui-version`. Los flags permanecen apagados por defecto hasta completar snapshots y pruebas operacionales.

## Cobertura

| Superficie     | Rutas                                  |
| -------------- | -------------------------------------- |
| Dashboard      | `/panel`                               |
| Panel N.V.     | `/panel/*`, excepto Rutas private beta |
| Inventario/WMS | `/inventory/*`, `/queries/locations`   |

La capa visual no altera `row_version`, IAM, confirmaciones, consultas, stock, Realtime ni auditoría.

## Rollback

Definir los tres flags como `false` y reconstruir. Las rutas conservan los mismos componentes y vuelven a `data-ui-version="legacy"`; no existe migración de base de datos que deshacer.
