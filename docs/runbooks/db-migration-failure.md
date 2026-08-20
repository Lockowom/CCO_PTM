# Falla de migración de base de datos

Detener deploy y mantener flags apagados. Capturar error sin secretos. Si la transacción sigue activa,
ejecutar `ROLLBACK`; si hubo commit, aplicar únicamente el rollback versionado y validado. No usar
`DROP` improvisado. Verificar esquema, RLS, permisos, conteos e integridad; restaurar backup solo con
aprobación y ensayo de RTO/RPO. Reabrir despliegue tras prueba completa en staging.
