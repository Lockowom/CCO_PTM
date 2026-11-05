# ABS-LOC-001 — Trazabilidad de ubicaciones ABS

## Propósito

La clasificación ABS pertenece al SKU y no a la fila activa de `wms_ubicaciones`.
Cuando un SKU se traslada, se retira de Put Away o se archiva desde la vista de
ubicaciones, su categoría y rotación deben seguir disponibles para volver a
ubicarlo correctamente.

## Fuentes de verdad

| Dato | Fuente | Regla |
| --- | --- | --- |
| Categoría ABS y rotación | `wms_sku_rotacion` | Se mantiene aunque el SKU no tenga una ubicación activa. |
| Posiciones físicas que son ABS | `wms_ubicaciones_maestras.es_ubicacion_abs` | Es catálogo de posición; no depende del inventario. |
| Ocupación visual vigente | `wms_ubicaciones` | Muestra solo dónde se encuentra hoy el SKU. |
| Última ocupación / trazabilidad | `wms_abs_asignaciones` | Nueva bitácora: conserva altas, traslados y liberaciones. |

## Comportamiento esperado

| Operación sobre `wms_ubicaciones` | Resultado en `wms_abs_asignaciones` |
| --- | --- |
| Alta de SKU con ABS | Abre una asignación `ACTIVA`. |
| Traslado de ubicación | Cierra la anterior como `TRASLADADA` y abre la nueva. |
| Cambio a SKU sin ABS | Cierra la previa como `LIBERADA`; no crea una nueva. |
| Eliminación o archivo de la fila | Cierra la previa como `LIBERADA` con motivo `REGISTRO_WMS_RETIRADO`. |
| Reingreso del SKU | Abre una nueva asignación, conservando todo el historial anterior. |

La vista Ubicaciones sigue mostrando las filas activas. Cuando se busque un SKU
ABS sin ubicación vigente, mostrará su última ubicación registrada y aclarará
que la clasificación ABS se conserva.

## Seguridad y límites

- La tabla se protege con RLS y solo permite lectura a usuarios con acceso a
  Ubicaciones o Inventario.
- La función del trigger no es una API pública; su ejecución queda revocada a
  `PUBLIC`, `anon` y `authenticated`.
- No se crea ningún permiso ni rol nuevo y no se modifica IAM, Calidad,
  Transitorio ni NotificationBell.
- No actualiza `wms_ubicaciones`, cantidades, Softland, ERP ni stock.
- No llama `conteo_ajuste_erp` ni `wms_move_stock`.

## Despliegue seguro

La migración forward-only es
`20261105110557_abs_location_assignment_history.sql`. Al aplicarse crea la
bitácora y realiza un baseline de los SKU ABS vigentes; ese baseline escribe
solo en la tabla nueva. Antes de publicar la interfaz, debe aplicarse primero la
migración y verificarse con una consulta de solo lectura que la tabla, RLS,
índices y trigger existen.
