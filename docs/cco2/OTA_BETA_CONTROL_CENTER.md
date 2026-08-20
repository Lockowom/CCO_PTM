# Centro de control OTA Beta

El artefacto se construye una sola vez. GitHub Releases conserva el ZIP inmutable y Supabase decide
qué versión sirve cada canal. Un push a `main` solo publica en **beta** cuando cambia `package.json`.

## Gate de producción

- El usuario requiere `deploy_ota`; la Edge Function valida JWT y permiso.
- La beta debe ser la versión vigente del canal.
- Debe existir al menos un dispositivo beta con esa versión, sin error y visto dentro de 24 horas.
- Un administrador debe aprobar la beta con una nota de prueba.
- Producción se valida nuevamente en backend; ocultar o habilitar un botón no decide seguridad.
- Un rollback admite un bundle diferente, pero exige justificación auditada.

## Estados

`BETA_TESTING → APPROVED → PRODUCTION`. Una prueba fallida usa `REJECTED`. Un retroceso explícito
queda como `ROLLED_BACK`. Asignar equipos a Beta o Producción se realiza desde el Monitor web y el
endpoint nativo público respeta la asignación server-side.
