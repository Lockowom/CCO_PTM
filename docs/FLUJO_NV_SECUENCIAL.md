# Flujo secuencial de N.V.

## Estados principales

El flujo operativo es único y no admite saltos:

`En Proceso -> Shipping -> En Ruta -> Entregado`

- Toda N.V. creada desde CCO comienza en `En Proceso`.
- La interfaz ofrece únicamente el estado actual y el siguiente.
- PostgreSQL vuelve a validar la transición; un cliente antiguo o una llamada directa tampoco puede saltarse etapas.
- Una N.V. `Entregado` permanece bloqueada. La reapertura aprobada es la única excepción y vuelve a `En Proceso`.

## Pausas de Shipping

`REZAGADA_COMERCIAL` y `RETIRO_CLIENTE` son subestados de `Shipping`, no estados principales.

- Mientras exista un subestado, no se puede avanzar a `En Ruta`.
- Si la pausa comenzó antes del vencimiento, la N.V. queda temporalmente fuera de SLA, OTIF y Fill Rate.
- Al reactivar, el tiempo elegible acumulado extiende la fecha de promesa efectiva.
- Si la N.V. ya estaba vencida cuando se pausó, el atraso anterior se conserva.
- Dashboard y Modo TV siguen mostrando la N.V. como `Shipping`, con su etiqueta de pausa.

RPC: `gestionar_pausa_shipping_nv(id, subestado, motivo)`. Enviar `subestado = null` para reactivar.

## Incidencia posterior a la entrega

Un armado incorrecto no requiere reabrir la N.V. para quedar registrado:

- La N.V. conserva el estado `Entregado`.
- Se crea una incidencia `PROBLEMA DE ARMADO`, estado `ABIERTA`.
- El área responsable queda como `BODEGA` y el origen como `POST_ENTREGA`.
- La incidencia aparece en el listado de incidencias activas del Dashboard.

RPC: `reportar_incidencia_armado_nv(id, observacion)`.

## Trazabilidad

Las pausas, reactivaciones, transiciones e incidencias se escriben en `tms_operaciones_log` y, cuando corresponde, en `workflow_history`.

## Rollback de emergencia

En los primeros minutos, el rollback seguro es revertir primero la aplicación al commit anterior. La migración agrega columnas compatibles y puede permanecer aplicada sin afectar clientes antiguos. No eliminar columnas mientras existan datos nuevos; desactivar temporalmente las nuevas RPC y restaurar la versión anterior de `tms_operaciones_before_write` mediante una migración compensatoria.
