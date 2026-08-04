# Informe ejecutivo — incidente de lentitud del Panel

## Estado y causa confirmada

Los eventos `CCO-D` y `CCO-9` observados en Sentry corresponden al release
`cco-ptm@1.55.144+ee52e0c`; no al hotfix posterior. La base admite 60
conexiones (57 utilizables por la aplicación). Durante la inspección no había
transacciones de más de cinco segundos ni conexiones `idle in transaction`.

La presión se explica por dos factores comprobados en el cliente:

1. Una búsqueda numérica abría cuatro lecturas en paralelo y, sin coincidencia
   exacta, otras seis. Esto multiplica las conexiones por cada usuario.
2. `tms_operaciones_vigentes` hace un `Seq Scan` y una ventana sobre las 2.147
   filas antes de filtrar. Hay 176 claves de N.V. duplicadas, por lo que la
   vista debe conservarse para no mostrar historial como vigente.

Render no administra un pool PostgreSQL en este repositorio: su servidor es
estático/Express y no crea conexiones a Postgres. Por ello no se modifican
variables `PGPOOL_*` inexistentes ni se aumenta un pool ficticio.

## Mitigación aplicada

- La búsqueda numérica pasa de 4+6 solicitudes concurrentes a una solicitud
  exacta y, solo si no encuentra, una solicitud de prefijo, ambas paginadas.
- Reintentos acotados (máximo tres, backoff exponencial con jitter) se aplican
  únicamente a `Timed out acquiring connection` y quedan trazados en Sentry.
- Se elimina Background Sync para API Supabase: las respuestas 401/500 ya no
  se cacheaban, pero los fallos de red podían reintentarse hasta 24 horas.
- Se añade el índice `(estado, fecha_estado DESC, id DESC)` para la carga
  paginada del panel, sin cambiar la lógica de N.V. vigente.

## Verificación y rollback

`npm run typecheck` pasó. Antes de desplegar se debe ejecutar `npm run build`
y aplicar la migración. Tras el deploy, validar búsqueda numérica y revisar
en Sentry `pool_acquire_retry`, `buscar_operaciones` y `lookup_nv_by_id` por
30 minutos. El rollback de aplicación es revertir este PR; el del índice es:

```sql
DROP INDEX IF EXISTS public.ix_tms_operaciones_estado_fecha_id;
```

El rollback no requiere downtime. No se alteraron datos ni permisos.
