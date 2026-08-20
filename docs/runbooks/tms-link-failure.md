# Falla de vínculo N.V. ↔ TMS

No cambiar estado de la N.V. Confirmar `operacion_id`, `plan_coord_id` y `parada_coord_id`; reintentar
el comando original con la misma idempotency key. Si el plan ya fue confirmado, conciliar órdenes y
paradas bajo transacción. Cierre: una orden por parada, trazabilidad completa y cero efectos en stock.
