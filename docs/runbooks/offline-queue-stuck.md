# Cola offline atascada

Verificar usuario activo, conectividad, cantidad y último error sin exponer payload sensible. No
sincronizar elementos de otro usuario. Reintentar un comando a la vez; `REJECTED` requiere corrección
manual. Exportar evidencia antes de eliminar. Cierre: cola del usuario en cero y conteos servidor
conciliados; si hay duplicados, detener sync y escalar por idempotency key.
