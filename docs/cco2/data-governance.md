# CCO 2.0 · Gobierno de datos

- `tms_operaciones` es la SSOT logística de N.V.; `tms_operacion_bultos` guarda datos físicos versionados.
- `tms_vehiculos`, `tms_conductores` y `tms_transporte_ordenes` son entidades TMS canónicas.
- Ubicación visual, conteo, Calidad, Rutas, POD y notificaciones no modifican stock.
- Todo comando crítico exige identidad, permiso, versión esperada e idempotency key.
- Datos inciertos se guardan como `UNKNOWN`/`ESTIMATED`; nunca se convierten silenciosamente en cero.
- Retención, anonimización y borrado están `PENDING_BUSINESS_APPROVAL` hasta aprobación legal/negocio.
- Toda migración es aditiva, reversible y probada dentro de `BEGIN ... ROLLBACK` antes del push.
