# Inventario de secretos (plantilla, nunca pegar valores)

| Nombre                    | Entorno      | Consumidor          | Responsable          | Rotación             | Estado  |
| ------------------------- | ------------ | ------------------- | -------------------- | -------------------- | ------- |
| SUPABASE_ANON_KEY         | staging/prod | web                 | Plataforma           | según política       | PENDING |
| SUPABASE_SERVICE_ROLE_KEY | servidor     | Edge/CI autorizado  | Plataforma           | trimestral/incidente | PENDING |
| SENTRY_AUTH_TOKEN         | CI           | releases/sourcemaps | Plataforma           | trimestral           | PENDING |
| ROUTING_PROVIDER_KEY      | Edge         | coord-route-plan    | Logística/Plataforma | trimestral           | PENDING |

Los valores viven exclusivamente en el gestor de secretos del entorno.
