# ABS-LOC-001 — Aplicación controlada

**Fecha:** 2026-11-05
**Proyecto:** `vtrtyzbgpsvqwbfoudaf`
**Resultado:** `ABS_HISTORY_APPLIED_SAFE`

## Migración aplicada

- Archivo local: `20261105110557_abs_location_assignment_history.sql`
- Tracking remoto creado por el mecanismo de migración: `20261105121624_abs_location_assignment_history`

El timestamp remoto distinto es esperado: el historial remoto ya usa timestamps
de aplicación diferentes de los archivos locales. No se hizo `repair`, `db push`,
`db reset` ni edición manual del historial de migraciones.

## Precheck

| Control | Resultado |
| --- | --- |
| `wms_ubicaciones`, `wms_sku_rotacion`, `wms_ubicaciones_maestras` | Existen |
| Columnas requeridas | Existen |
| Tabla/trigger nuevos antes de aplicar | Ausentes, sin colisión |
| Helper de permisos existente | Disponible |
| Filas WMS | 3.732 |
| SKU catalogados en ABS | 7.126 |
| Asignaciones ABS vigentes para baseline | 3.344 |

## Postcheck

| Control | Resultado |
| --- | --- |
| `wms_abs_asignaciones` | Creada con RLS activo |
| Política | `wms_abs_asignaciones_select_authorized` |
| Índices | PK, activo por fila WMS, SKU/estado y ubicación/estado |
| Trigger en `wms_ubicaciones` | Presente |
| Ejecución directa del trigger | Revocada para `PUBLIC`, `anon` y `authenticated` |
| Historial creado | 3.344 filas `ACTIVA` |
| Filas WMS después | 3.732 |
| Catálogo ABS después | 7.126 |

## Gates

```ini
STOCK_SIDE_EFFECT = 0
ERP_WRITE = 0
CONTEO_AJUSTE_ERP_CALL = 0
WMS_MOVE_STOCK_CALL = 0
QUALITY_CHANGE = 0
TRANSITORY_CHANGE = 0
IAM_CHANGE = 0
NOTIFICATION_CHANGE = 0
DATA_LOSS = 0
```

La migración solo escribió el baseline en la tabla nueva de trazabilidad. No se
crearon movimientos, eliminaciones ni traslados de prueba en producción.

## Pendiente deliberadamente

La interfaz local que expone la última ubicación de un SKU ABS aún no se ha
publicado. La publicación requiere su autorización separada de commit/push y
deploy.
