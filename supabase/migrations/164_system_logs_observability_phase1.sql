-- ============================================================================
-- 164_system_logs_observability_phase1.sql
-- Fases 1 y 2 del Centro de Observabilidad:
--   - tabla tecnica centralizada de logs del cliente
--   - RLS deny-by-default
--   - RPC segura para insercion desde frontend autenticado
-- ============================================================================

create table if not exists public.system_logs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  level text not null default 'info' check (level in ('info', 'warn', 'error')),
  kind text not null default 'application',
  source text not null default 'frontend',
  module text not null default 'app',
  screen text,
  action text not null default 'unspecified',
  route text,
  status text,
  message text not null,
  error_name text,
  stack text,
  payload jsonb not null default '{}'::jsonb,
  context jsonb not null default '{}'::jsonb,
  browser jsonb not null default '{}'::jsonb,
  duration_ms integer,
  app_version text,
  commit_sha text,
  build_number text,
  correlation_id uuid,
  session_id uuid,
  handled boolean not null default true,
  fingerprint text,
  auth_uid uuid not null,
  usuario_id text,
  usuario_email text,
  usuario_nombre text,
  rol text
);

alter table public.system_logs
  alter column payload set default '{}'::jsonb,
  alter column context set default '{}'::jsonb,
  alter column browser set default '{}'::jsonb;

create index if not exists idx_system_logs_created_at on public.system_logs (created_at desc);
create index if not exists idx_system_logs_level_created_at on public.system_logs (level, created_at desc);
create index if not exists idx_system_logs_module_created_at on public.system_logs (module, created_at desc);
create index if not exists idx_system_logs_auth_uid_created_at on public.system_logs (auth_uid, created_at desc);
create index if not exists idx_system_logs_fingerprint_created_at on public.system_logs (fingerprint, created_at desc);
create index if not exists idx_system_logs_correlation_id on public.system_logs (correlation_id);

alter table public.system_logs enable row level security;

drop policy if exists system_logs_select_admin on public.system_logs;
create policy system_logs_select_admin
  on public.system_logs
  for select
  to authenticated
  using (
    public.is_admin()
    or public.usuario_tiene_algun_permiso(array['admin_monitor'])
  );

revoke all on public.system_logs from public, anon;
grant select on public.system_logs to authenticated;

create or replace function public.log_client_event(p_event jsonb)
returns uuid
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_auth_uid uuid := auth.uid();
  v_log_id uuid;
  v_actor record;
  v_level text := lower(coalesce(p_event->>'level', 'info'));
  v_kind text := lower(coalesce(p_event->>'kind', 'application'));
  v_payload jsonb := coalesce(p_event->'payload', '{}'::jsonb);
  v_context jsonb := coalesce(p_event->'context', '{}'::jsonb);
  v_browser jsonb := coalesce(p_event->'browser', '{}'::jsonb);
  v_correlation_id uuid := nullif(p_event->>'correlation_id', '')::uuid;
  v_session_id uuid := nullif(p_event->>'session_id', '')::uuid;
begin
  if v_auth_uid is null then
    raise exception 'Autenticacion requerida';
  end if;

  select
    u.id::text as usuario_id,
    u.email,
    u.nombre,
    u.rol
  into v_actor
  from public.tms_usuarios u
  where u.auth_uid = v_auth_uid
    and u.activo = true
  limit 1;

  if not found then
    raise exception 'Usuario no activo para registrar logs';
  end if;

  if v_level not in ('info', 'warn', 'error') then
    v_level := 'info';
  end if;

  if coalesce(jsonb_typeof(v_payload), 'null') <> 'object' then
    v_payload := jsonb_build_object('value', v_payload);
  end if;
  if coalesce(jsonb_typeof(v_context), 'null') <> 'object' then
    v_context := jsonb_build_object('value', v_context);
  end if;
  if coalesce(jsonb_typeof(v_browser), 'null') <> 'object' then
    v_browser := jsonb_build_object('value', v_browser);
  end if;

  if pg_column_size(v_payload) > 65535 then
    v_payload := jsonb_build_object('_truncated', true, 'size', pg_column_size(v_payload));
  end if;
  if pg_column_size(v_context) > 65535 then
    v_context := jsonb_build_object('_truncated', true, 'size', pg_column_size(v_context));
  end if;
  if pg_column_size(v_browser) > 32768 then
    v_browser := jsonb_build_object('_truncated', true, 'size', pg_column_size(v_browser));
  end if;

  insert into public.system_logs (
    level,
    kind,
    source,
    module,
    screen,
    action,
    route,
    status,
    message,
    error_name,
    stack,
    payload,
    context,
    browser,
    duration_ms,
    app_version,
    commit_sha,
    build_number,
    correlation_id,
    session_id,
    handled,
    fingerprint,
    auth_uid,
    usuario_id,
    usuario_email,
    usuario_nombre,
    rol
  )
  values (
    v_level,
    left(v_kind, 64),
    left(coalesce(p_event->>'source', 'frontend'), 32),
    left(coalesce(p_event->>'module', 'app'), 120),
    left(coalesce(p_event->>'screen', ''), 160),
    left(coalesce(p_event->>'action', 'unspecified'), 160),
    left(coalesce(p_event->>'route', ''), 300),
    left(coalesce(p_event->>'status', ''), 64),
    left(coalesce(p_event->>'message', 'Sin mensaje'), 4000),
    left(coalesce(p_event->>'error_name', ''), 160),
    left(coalesce(p_event->>'stack', ''), 12000),
    v_payload,
    v_context,
    v_browser,
    greatest(coalesce((p_event->>'duration_ms')::integer, null), 0),
    left(coalesce(p_event->>'app_version', ''), 64),
    left(coalesce(p_event->>'commit_sha', ''), 64),
    left(coalesce(p_event->>'build_number', ''), 64),
    v_correlation_id,
    v_session_id,
    coalesce((p_event->>'handled')::boolean, true),
    left(coalesce(p_event->>'fingerprint', ''), 512),
    v_auth_uid,
    v_actor.usuario_id,
    left(coalesce(v_actor.email, ''), 255),
    left(coalesce(v_actor.nombre, ''), 255),
    left(coalesce(v_actor.rol, ''), 120)
  )
  returning id into v_log_id;

  return v_log_id;
end;
$$;

revoke all on function public.log_client_event(jsonb) from public, anon;
grant execute on function public.log_client_event(jsonb) to authenticated, service_role;

comment on table public.system_logs is 'Observabilidad tecnica centralizada del cliente CCO.';
comment on function public.log_client_event(jsonb) is 'Inserta logs tecnicos del frontend en system_logs con identidad derivada desde auth.uid().';
