-- =============================================================================
-- PR-008b · AUDIT LIVE — RPC / GRANT / RLS (phase 2 del PR-008)
--
-- Auditoria ejecutable contra la BD live (NO transaccional, solo lectura).
-- Verifica las 4 invariantes pendientes de phase 1:
--   1) RPCs SECURITY DEFINER cuyo search_path NO incluye pg_temp explicito
--      (riesgo de hijacking por search_path mutable del llamante).
--   2) Policies RLS residuales dirigidas a `public`/`anon` (solo `authenticated`
--      o roles especificos deberian existir).
--   3) RPCs con EXECUTE concedido a `anon` o `public` (superficie de escritura
--      abierta sin autenticacion).
--   4) Flujo service_role intacto: las RPCs de sync/triggers que lo usan siguen
--      con grant a service_role (no se rompio nada en phase 1).
-- Extra: grants SELECT residuales a anon/public en tablas con datos sensibles.
--
-- Uso: ejecutar en la BD live con rol postgres (Management API / supabase db).
-- Todos los resultados son filas a revisar; una lista VACIA = invariante OK.
-- =============================================================================

-- 1) SECURITY DEFINER sin search_path fijo o sin pg_temp -----------------------
\echo '=== 1) SECURITY DEFINER sin pg_temp en search_path (riesgo hijacking) ==='
select n.nspname as schema,
       p.proname as funcion,
       pg_get_function_identity_arguments(p.oid) as args,
       p.proconfig as config
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where p.prosecdef
  and p.prokind = 'f'
  and n.nspname in ('public', 'authz', 'iam', 'private')
  and (p.proconfig is null
       or not exists (
         select 1 from unnest(p.proconfig) c
         where c like 'search_path=%pg_temp%'
       ))
order by n.nspname, p.proname;

-- 2) Policies RLS residuales to public / to anon --------------------------------
\echo '=== 2) Policies RLS dirigidas a public o anon (residual) ==='
select schemaname,
       tablename,
       policyname,
       roles,
       cmd,
       qual
from pg_policies
where 'public' = any(roles) or 'anon' = any(roles)
order by schemaname, tablename, policyname;

-- 3) EXECUTE de RPCs concedido a anon / public ---------------------------------
\echo '=== 3) RPCs con EXECUTE para anon o public (fuera de supabase_functions) ==='
select n.nspname as schema,
       p.proname as funcion,
       pg_get_function_identity_arguments(p.oid) as args
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where p.prokind = 'f'
  and n.nspname not in ('pg_catalog', 'information_schema', 'pg_temp_1',
                        'supabase_functions', 'graphql', 'pgbouncer', 'pgsodium',
                        'vault', 'net', 'pg_net', 'cron', 'pg_cron', 'extensions',
                        'storage', 'realtime', 'auth', '_realtime', 'graphql_public')
  and (
    has_function_privilege('anon', p.oid, 'EXECUTE')
    or has_function_privilege('public', p.oid, 'EXECUTE')
  )
order by n.nspname, p.proname;

-- 4) Flujo service_role: RPCs de sync/swap/trigger con grant intacto ------------
\echo '=== 4a) RPCs de sync/swap/escritura core: tienen EXECUTE para service_role? ==='
select n.nspname as schema,
       p.proname as funcion,
       pg_get_function_identity_arguments(p.oid) as args,
       has_function_privilege('service_role', p.oid, 'EXECUTE') as service_role_exec
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where p.prokind = 'f'
  and n.nspname in ('public')
  and (p.proname ilike '%swap%' or p.proname ilike '%sync%'
       or p.proname in ('guardar_nv', 'cambiar_estado_nv', 'bulk_upsert',
                        'log_client_event', 'registrar_despliegue_ota'))
order by p.proname;

\echo '=== 4b) Triggers en tms_operaciones (funciones que disparan) ==='
select t.tgname as trigger,
       t.tgrelid::regclass::text as tabla,
       p.proname as funcion,
       p.prosecdef as security_definer,
       p.proconfig as config
from pg_trigger t
join pg_proc p on p.oid = t.tgfoid
where t.tgrelid::regclass::text = 'tms_operaciones'
  and not t.tgisinternal
order by t.tgname;

-- 5) Extra: grants SELECT a anon/public en tablas de datos sensibles ------------
\echo '=== 5) Tablas con datos personales con SELECT para anon/public ==='
select table_schema, table_name, privilege_type, grantee
from information_schema.role_table_grants
where table_schema = 'public'
  and privilege_type = 'SELECT'
  and grantee in ('anon', 'public')
  and table_name in ('tms_usuarios', 'tms_roles', 'tms_permisos',
                     'tms_conductores', 'tms_postventa_correos', 'tms_accesos',
                     'tms_auditoria', 'tms_sesiones', 'iam.assignments')
order by table_name, grantee;