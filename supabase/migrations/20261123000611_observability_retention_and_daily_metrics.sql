-- ============================================================================
-- Observabilidad: retención conservadora, agregados diarios y cron seguro.
-- No borra histórico al aplicar: el job diario ejecuta lotes acotados según
-- antigüedad y conserva error/audit por plazos más largos.
-- ============================================================================

create table if not exists public.tms_observability_daily (
  day date not null,
  module text not null default 'app',
  action text not null default 'unspecified',
  app_version text not null default '',
  sample_count bigint not null default 0,
  estimated_count bigint not null default 0,
  error_count bigint not null default 0,
  warning_count bigint not null default 0,
  avg_duration_ms numeric,
  p50_duration_ms numeric,
  p95_duration_ms numeric,
  max_duration_ms integer,
  updated_at timestamptz not null default now(),
  primary key (day, module, action, app_version)
);

alter table public.tms_observability_daily enable row level security;
revoke all on public.tms_observability_daily from public, anon;
grant select on public.tms_observability_daily to authenticated;

drop policy if exists tms_observability_daily_select_admin on public.tms_observability_daily;
create policy tms_observability_daily_select_admin
  on public.tms_observability_daily
  for select
  to authenticated
  using (
    public.is_admin()
    or public.usuario_tiene_algun_permiso(array['admin_monitor'])
  );

create table if not exists public.system_logs_retention_runs (
  id uuid primary key default gen_random_uuid(),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  deleted_performance bigint not null default 0,
  deleted_application bigint not null default 0,
  deleted_warning bigint not null default 0,
  deleted_error bigint not null default 0,
  deleted_audit bigint not null default 0,
  batches integer not null default 0,
  status text not null default 'running' check (status in ('running', 'completed', 'skipped', 'failed')),
  detail text
);

alter table public.system_logs_retention_runs enable row level security;
revoke all on public.system_logs_retention_runs from public, anon;
grant select on public.system_logs_retention_runs to authenticated;
drop policy if exists system_logs_retention_runs_select_admin on public.system_logs_retention_runs;
create policy system_logs_retention_runs_select_admin
  on public.system_logs_retention_runs
  for select to authenticated
  using (public.is_admin() or public.usuario_tiene_algun_permiso(array['admin_monitor']));

create or replace function public.refresh_observability_daily(p_day date default current_date)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  delete from public.tms_observability_daily where day = p_day;

  insert into public.tms_observability_daily (
    day, module, action, app_version, sample_count, estimated_count,
    error_count, warning_count, avg_duration_ms, p50_duration_ms,
    p95_duration_ms, max_duration_ms, updated_at
  )
  select
    p_day,
    coalesce(nullif(sl.module, ''), 'app'),
    coalesce(nullif(sl.action, ''), 'unspecified'),
    coalesce(sl.app_version, ''),
    count(*) filter (where sl.kind = 'performance' and sl.level = 'info'),
    count(*) filter (where sl.kind = 'performance' and sl.level = 'info') * 20,
    count(*) filter (where sl.level = 'error'),
    count(*) filter (where sl.level = 'warn'),
    round((avg(sl.duration_ms) filter (where sl.duration_ms is not null))::numeric, 2),
    percentile_cont(0.50) within group (order by sl.duration_ms)
      filter (where sl.duration_ms is not null),
    percentile_cont(0.95) within group (order by sl.duration_ms)
      filter (where sl.duration_ms is not null),
    max(sl.duration_ms),
    now()
  from public.system_logs sl
  where sl.created_at >= p_day::timestamptz
    and sl.created_at < (p_day + 1)::timestamptz
  group by coalesce(nullif(sl.module, ''), 'app'),
           coalesce(nullif(sl.action, ''), 'unspecified'),
           coalesce(sl.app_version, '');
end;
$$;

create or replace function public.run_system_logs_retention(
  p_batch_size integer default 5000,
  p_max_batches integer default 4
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_lock boolean;
  v_run_id uuid;
  v_batch integer := 0;
  v_deleted integer := 0;
  v_total bigint := 0;
  v_performance bigint := 0;
  v_application bigint := 0;
  v_warning bigint := 0;
  v_error bigint := 0;
  v_audit bigint := 0;
  v_row record;
begin
  if p_batch_size < 1 or p_batch_size > 10000 then
    raise exception 'p_batch_size debe estar entre 1 y 10000';
  end if;
  if p_max_batches < 1 or p_max_batches > 20 then
    raise exception 'p_max_batches debe estar entre 1 y 20';
  end if;

  select pg_try_advisory_lock(hashtext('public.run_system_logs_retention')) into v_lock;
  if not v_lock then
    return jsonb_build_object('status', 'skipped', 'reason', 'already_running');
  end if;

  insert into public.system_logs_retention_runs (status) values ('running') returning id into v_run_id;

  begin
    loop
      exit when v_batch >= p_max_batches;
      v_deleted := 0;
      for v_row in
        with candidates as (
          select sl.ctid,
            case
              when sl.kind = 'audit' then 'audit'
              when sl.level = 'error' then 'error'
              when sl.level = 'warn' then 'warning'
              when sl.kind in ('performance', 'realtime') then 'performance'
              else 'application'
            end as category
          from public.system_logs sl
          where (
            (sl.kind = 'audit' and sl.created_at < now() - interval '365 days')
            or (sl.kind <> 'audit' and sl.level = 'error' and sl.created_at < now() - interval '180 days')
            or (sl.kind <> 'audit' and sl.level <> 'error' and sl.level = 'warn' and sl.created_at < now() - interval '90 days')
            or (sl.kind <> 'audit' and sl.level not in ('error', 'warn') and sl.kind in ('performance', 'realtime') and sl.created_at < now() - interval '30 days')
            or (sl.kind <> 'audit' and sl.level not in ('error', 'warn') and sl.kind not in ('performance', 'realtime') and sl.created_at < now() - interval '90 days')
          )
          order by sl.created_at asc
          limit p_batch_size
        ), deleted as (
          delete from public.system_logs sl
          using candidates c
          where sl.ctid = c.ctid
          returning c.category
        )
        select category, count(*)::integer as count from deleted group by category
      loop
        v_deleted := v_deleted + v_row.count;
        v_total := v_total + v_row.count;
        if v_row.category = 'performance' then v_performance := v_performance + v_row.count;
        elsif v_row.category = 'application' then v_application := v_application + v_row.count;
        elsif v_row.category = 'warning' then v_warning := v_warning + v_row.count;
        elsif v_row.category = 'error' then v_error := v_error + v_row.count;
        elsif v_row.category = 'audit' then v_audit := v_audit + v_row.count;
        end if;
      end loop;
      exit when v_deleted = 0;
      v_batch := v_batch + 1;
    end loop;

    update public.system_logs_retention_runs
    set finished_at = now(), status = 'completed', batches = v_batch,
        deleted_performance = v_performance, deleted_application = v_application,
        deleted_warning = v_warning, deleted_error = v_error, deleted_audit = v_audit
    where id = v_run_id;
    perform pg_advisory_unlock(hashtext('public.run_system_logs_retention'));
    return jsonb_build_object('status', 'completed', 'run_id', v_run_id, 'deleted', v_total, 'batches', v_batch);
  exception when others then
    update public.system_logs_retention_runs
    set finished_at = now(), status = 'failed', batches = v_batch, detail = sqlerrm
    where id = v_run_id;
    perform pg_advisory_unlock(hashtext('public.run_system_logs_retention'));
    raise;
  end;
end;
$$;

revoke all on function public.refresh_observability_daily(date) from public, anon, authenticated;
revoke all on function public.run_system_logs_retention(integer, integer) from public, anon, authenticated;

create extension if not exists pg_cron;
do $$
begin
  if exists (select 1 from cron.job where jobname = 'observability-daily-metrics') then
    perform cron.unschedule('observability-daily-metrics');
  end if;
  if exists (select 1 from cron.job where jobname = 'system-logs-retention') then
    perform cron.unschedule('system-logs-retention');
  end if;
  perform cron.schedule(
    'observability-daily-metrics',
    '10 3 * * *',
    'select public.refresh_observability_daily(current_date); select public.refresh_observability_daily(current_date - 1);'
  );
  perform cron.schedule(
    'system-logs-retention',
    '30 3 * * *',
    'select public.run_system_logs_retention(5000, 4);'
  );
exception when others then
  raise notice 'No se pudo programar retención de observabilidad: %', sqlerrm;
end;
$$;

comment on table public.tms_observability_daily is
  'Agregados diarios de observabilidad. sampled_count es muestra; estimated_count usa sample rate 1/20.';
comment on function public.run_system_logs_retention(integer, integer) is
  'Retención conservadora por lotes: performance/realtime 30d, app/warn 90d, error 180d, audit 365d.';
