# Optimización de Observabilidad y system_logs — 2026-11-22

## Objetivo

Reducir la generación rutinaria de `system_logs` sin perder errores, warnings reales, auditoría operacional ni evidencia de operaciones lentas.

## Baseline

Auditoría previa: 129.258 filas y ~158 MB (tabla + índices); 91,6% correspondía a telemetría `performance` exitosa. Antes del despliegue de esta optimización, PROD registró 135.521 filas.

Principales focos históricos:

- IAM `runtime_context`.
- Eventos `mis_notificaciones`.
- Panel/TV `fetch_tv_estados`.

## Política frontend

`src/lib/logger.js` aplica una política central:

- `error`: persistencia 100% + Sentry.
- `warn`: persistencia 100%.
- `audit`: persistencia 100%.
- `performance >= 3000 ms`: persistencia 100%.
- `performance < 3000 ms`: sampling determinístico 1/20 por sesión + fingerprint.
- `realtime` rutinario de nivel info: no persistir por defecto.

`rpcQuery` y `rpcCommand` continúan midiendo vía `traceAsyncOperation`; la reducción ocurre en la política central, no en cada servicio.

## IAM runtime_context

`runtimeContext()` mantiene caché de sesión de 60 segundos y deduplica requests simultáneas. La caché se invalida ante cambio de identidad, refresh explícito de permisos y cambios del rol observados por Realtime.

El backend continúa siendo la autoridad de autorización; la caché frontend no sustituye gates/RLS.

## NotificationBell

La campana mantiene la caché de `misNotificaciones` existente y agrega una ventana de deduplicación de 5 segundos para que `focus` y `visibilitychange` no disparen refresh redundantes.

## Panel TV

Realtime es el mecanismo principal de frescura.

- Polling de 30 s queda como fallback.
- Tras un refresh por Realtime, el polling queda suprimido 60 s.
- Solo se permite una carga concurrente.
- Con la pestaña oculta, el polling se omite.
- Al volver visible se refresca solo si los datos están vencidos.

## Supabase

Migración aplicada y registrada:

`20261123000611_observability_retention_and_daily_metrics`

Objetos:

- `public.tms_observability_daily`
- `public.system_logs_retention_runs`
- `public.refresh_observability_daily(date)`
- `public.run_system_logs_retention(integer, integer)`

Jobs pg_cron:

- `observability-daily-metrics`: `10 3 * * *`
- `system-logs-retention`: `30 3 * * *`

Las funciones de mantenimiento no son ejecutables por `anon` ni `authenticated`.

## Retención

Precedencia conservadora:

- audit: 365 días.
- error: 180 días.
- warn/application/query/mutation/frontend: 90 días.
- performance/realtime rutinario: 30 días.

La limpieza se realiza por lotes de hasta 5.000 filas, máximo 4 lotes por ejecución y con advisory lock para impedir jobs solapados.

No se ejecutó borrado histórico inicial ni `VACUUM FULL`.

## Dashboard

`/admin/observability` mantiene evidencia reciente limitada y consume `tms_observability_daily` para mostrar:

- muestra performance;
- volumen estimado;
- P95 agregado;
- estado de la última retención.

`estimated_count` es una estimación derivada del sampling 1/20, no un conteo exacto.

## Gobierno de migraciones

El cambio remoto fue aplicado antes de quedar versionado en Git. La migración `20261123000611` ya figura como aplicada en `supabase_migrations.schema_migrations`. El archivo con la misma versión se incorporó al repositorio para reconciliar historial local/remoto sin `migration repair` ni reejecución de DDL.

## Rollback

Frontend: revertir los commits de observabilidad y redeploy web.

Base de datos: no realizar DROP improvisado. Los objetos agregados son compatibles con el frontend anterior. Si un cron presenta problemas, desactivarlo/unschedule mediante cambio versionado.

## Criterios de aceptación

- Error, warning, audit y performance lenta conservan 100% de señal.
- Performance rápida deja de persistirse al 100%.
- IAM runtime context deduplicado.
- NotificationBell sin doble refresh focus/visibility.
- Panel TV sin polling/realtime duplicado.
- Retención y agregados programados.
- Sin limpieza histórica destructiva inicial.
- Sin eliminación de índices.
