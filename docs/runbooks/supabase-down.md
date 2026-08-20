# Supabase no disponible

**Detectar:** healthcheck/RPC fallan y Sentry agrupa errores de red. **Contener:** activar modo
degradado, bloquear escrituras no idempotentes y conservar cola offline por usuario. **Diagnosticar:**
revisar status del proveedor, Auth, Postgres y pool. **Recuperar:** reanudar sync gradual, verificar
conteos e idempotencia. **Escalar:** Plataforma a los 5 min. **Rollback:** restaurar release anterior si
el incidente comenzó con deploy; nunca borrar la cola local.
