-- ============================================================================
-- 165_system_alerts_phase5.sql
-- Fase 5 del Centro de Observabilidad:
--   - reglas automaticas sobre system_logs
--   - materializacion de alertas
--   - notificacion in-app + push a ADMIN
-- ============================================================================

create table if not exists public.system_alert_rules (
  code text primary key,
  nombre text not null,
  descripcion text,
  severity text not null default 'high' check (severity in ('medium', 'high', 'critical')),
  levels text[] not null default '{}'::text[],
  kinds text[] not null default '{}'::text[],
  modules text[] not null default '{}'::text[],
  min_occurrences integer not null check (min_occurrences > 0),
  window_minutes integer not null check (window_minutes > 0),
  min_duration_ms integer,
  group_by text not null default 'global' check (group_by in ('global', 'module', 'fingerprint', 'action')),
  cooldown_minutes integer not null default 30 check (cooldown_minutes > 0),
  activo boolean not null default true,
  updated_at timestamptz not null default now(),
  updated_by text
);

create table if not exists public.system_alerts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  status text not null default 'open' check (status in ('open', 'ack', 'resolved')),
  severity text not null check (severity in ('medium', 'high', 'critical')),
  rule_code text not null references public.system_alert_rules(code) on delete restrict,
  scope_key text not null,
  titulo text not null,
  mensaje text not null,
  payload jsonb not null default '{}'::jsonb,
  occurrences integer not null default 0,
  first_seen_at timestamptz,
  last_seen_at timestamptz,
  notified_at timestamptz,
  resolved_at timestamptz,
  resolved_by text
);

create index if not exists idx_system_alerts_created_at on public.system_alerts (created_at desc);
create index if not exists idx_system_alerts_status_created_at on public.system_alerts (status, created_at desc);
create index if not exists idx_system_alerts_rule_scope on public.system_alerts (rule_code, scope_key, created_at desc);

alter table public.system_alerts enable row level security;

drop policy if exists system_alerts_select_admin on public.system_alerts;
create policy system_alerts_select_admin
  on public.system_alerts
  for select
  to authenticated
  using (
    public.is_admin()
    or public.usuario_tiene_algun_permiso(array['admin_monitor'])
  );

revoke all on public.system_alerts from public, anon;
grant select on public.system_alerts to authenticated;

create or replace function public._system_alert_notify_admin(p_alert_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_alert public.system_alerts;
  v_payload jsonb;
begin
  select *
    into v_alert
  from public.system_alerts
  where id = p_alert_id;

  if v_alert.id is null then
    return;
  end if;

  v_payload := coalesce(v_alert.payload, '{}'::jsonb)
    || jsonb_build_object(
      'type', 'OBS_ALERT',
      'alert_id', v_alert.id,
      'severity', v_alert.severity,
      'rule_code', v_alert.rule_code,
      'route', '/admin/observability'
    );

  insert into public.notificacion (
    canal,
    destinatario_rol,
    titulo,
    mensaje,
    payload,
    estado
  )
  values (
    'in-app',
    'ADMIN',
    v_alert.titulo,
    v_alert.mensaje,
    v_payload,
    'pendiente'
  );

  begin
    perform net.http_post(
      url := 'https://vtrtyzbgpsvqwbfoudaf.supabase.co/functions/v1/notify-inventario',
      body := jsonb_build_object(
        'titulo', v_alert.titulo,
        'mensaje', v_alert.mensaje,
        'rol', 'ADMIN',
        'payload', v_payload
      ),
      headers := jsonb_build_object('Content-Type', 'application/json'),
      timeout_milliseconds := 2000
    );
  exception when others then
    null;
  end;

  update public.system_alerts
     set notified_at = coalesce(notified_at, now())
   where id = p_alert_id;
end;
$$;

create or replace function public._system_logs_evaluate_alerts()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.system_alert_rules;
  v_scope_key text;
  v_count integer;
  v_first_seen timestamptz;
  v_last_seen timestamptz;
  v_existing uuid;
  v_alert_id uuid;
  v_from timestamptz;
  v_message text;
begin
  for r in
    select *
    from public.system_alert_rules
    where activo = true
    order by severity desc, code asc
  loop
    if coalesce(array_length(r.levels, 1), 0) > 0 and not (new.level = any(r.levels)) then
      continue;
    end if;
    if coalesce(array_length(r.kinds, 1), 0) > 0 and not (new.kind = any(r.kinds)) then
      continue;
    end if;
    if coalesce(array_length(r.modules, 1), 0) > 0 and not (new.module = any(r.modules)) then
      continue;
    end if;
    if coalesce(r.min_duration_ms, 0) > 0 and coalesce(new.duration_ms, 0) < r.min_duration_ms then
      continue;
    end if;
    if r.group_by = 'fingerprint' and coalesce(new.fingerprint, '') = '' then
      continue;
    end if;

    v_scope_key := case r.group_by
      when 'module' then coalesce(new.module, 'app')
      when 'fingerprint' then coalesce(new.fingerprint, 'sin_fingerprint')
      when 'action' then coalesce(new.module, 'app') || '.' || coalesce(new.action, 'unspecified')
      else 'global'
    end;

    v_from := now() - make_interval(mins => r.window_minutes);

    select
      count(*)::integer,
      min(sl.created_at),
      max(sl.created_at)
    into
      v_count,
      v_first_seen,
      v_last_seen
    from public.system_logs sl
    where sl.created_at >= v_from
      and (coalesce(array_length(r.levels, 1), 0) = 0 or sl.level = any(r.levels))
      and (coalesce(array_length(r.kinds, 1), 0) = 0 or sl.kind = any(r.kinds))
      and (coalesce(array_length(r.modules, 1), 0) = 0 or sl.module = any(r.modules))
      and (coalesce(r.min_duration_ms, 0) = 0 or coalesce(sl.duration_ms, 0) >= r.min_duration_ms)
      and (
        r.group_by = 'global'
        or (r.group_by = 'module' and sl.module = new.module)
        or (r.group_by = 'fingerprint' and sl.fingerprint = new.fingerprint)
        or (r.group_by = 'action' and sl.module = new.module and sl.action = new.action)
      );

    if coalesce(v_count, 0) < r.min_occurrences then
      continue;
    end if;

    select a.id
      into v_existing
    from public.system_alerts a
    where a.rule_code = r.code
      and a.scope_key = v_scope_key
      and a.status in ('open', 'ack')
      and a.created_at >= now() - make_interval(mins => r.cooldown_minutes)
    order by a.created_at desc
    limit 1;

    if v_existing is not null then
      continue;
    end if;

    v_message := format(
      '%s evento(s) detectados en %s min. Modulo: %s. Accion: %s. Ultimo mensaje: %s',
      v_count,
      r.window_minutes,
      coalesce(new.module, 'app'),
      coalesce(new.action, 'unspecified'),
      left(coalesce(new.message, 'Sin mensaje'), 240)
    );

    insert into public.system_alerts (
      severity,
      rule_code,
      scope_key,
      titulo,
      mensaje,
      payload,
      occurrences,
      first_seen_at,
      last_seen_at
    )
    values (
      r.severity,
      r.code,
      v_scope_key,
      format('[%s] %s', upper(r.severity), r.nombre),
      v_message,
      jsonb_build_object(
        'rule_code', r.code,
        'rule_name', r.nombre,
        'scope_key', v_scope_key,
        'occurrences', v_count,
        'window_minutes', r.window_minutes,
        'level', new.level,
        'kind', new.kind,
        'module', new.module,
        'action', new.action,
        'message', new.message,
        'fingerprint', new.fingerprint,
        'duration_ms', new.duration_ms,
        'route', '/admin/observability'
      ),
      v_count,
      v_first_seen,
      v_last_seen
    )
    returning id into v_alert_id;

    perform public._system_alert_notify_admin(v_alert_id);
  end loop;

  return new;
end;
$$;

drop trigger if exists trg_system_logs_evaluate_alerts on public.system_logs;
create trigger trg_system_logs_evaluate_alerts
  after insert on public.system_logs
  for each row execute function public._system_logs_evaluate_alerts();

create or replace function public.system_alerts_recent(p_limit integer default 25)
returns setof public.system_alerts
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not (public.is_admin() or public.usuario_tiene_algun_permiso(array['admin_monitor'])) then
    raise exception 'No autorizado';
  end if;

  return query
  select *
  from public.system_alerts
  order by created_at desc
  limit greatest(1, least(coalesce(p_limit, 25), 100));
end;
$$;

revoke all on function public._system_alert_notify_admin(uuid) from public, anon;
revoke all on function public._system_logs_evaluate_alerts() from public, anon;
revoke all on function public.system_alerts_recent(integer) from public, anon;
grant execute on function public._system_alert_notify_admin(uuid) to authenticated, service_role;
grant execute on function public.system_alerts_recent(integer) to authenticated, service_role;

insert into public.system_alert_rules (
  code, nombre, descripcion, severity, levels, kinds, modules, min_occurrences, window_minutes, min_duration_ms, group_by, cooldown_minutes, activo, updated_by
) values
  (
    'OBS_ERROR_BURST_GLOBAL',
    'Rafaga global de errores',
    'Dispara una alerta cuando los errores del cliente suben rapidamente en una ventana corta.',
    'critical',
    array['error']::text[],
    '{}'::text[],
    '{}'::text[],
    12,
    10,
    null,
    'global',
    30,
    true,
    'migration_165'
  ),
  (
    'OBS_REPEAT_FINGERPRINT',
    'Error repetido por fingerprint',
    'Detecta el mismo error reiterado para evidenciar regresiones o incidentes repetitivos.',
    'critical',
    array['error']::text[],
    '{}'::text[],
    '{}'::text[],
    5,
    10,
    null,
    'fingerprint',
    20,
    true,
    'migration_165'
  ),
  (
    'OBS_SLOW_ACTION_MODULE',
    'Operacion lenta por modulo',
    'Detecta acumulacion de operaciones lentas para actuar antes de que el usuario perciba degradacion masiva.',
    'high',
    '{}'::text[],
    array['performance', 'application', 'query', 'mutation']::text[],
    '{}'::text[],
    8,
    15,
    1500,
    'module',
    25,
    true,
    'migration_165'
  )
on conflict (code) do update
  set nombre = excluded.nombre,
      descripcion = excluded.descripcion,
      severity = excluded.severity,
      levels = excluded.levels,
      kinds = excluded.kinds,
      modules = excluded.modules,
      min_occurrences = excluded.min_occurrences,
      window_minutes = excluded.window_minutes,
      min_duration_ms = excluded.min_duration_ms,
      group_by = excluded.group_by,
      cooldown_minutes = excluded.cooldown_minutes,
      activo = excluded.activo,
      updated_at = now(),
      updated_by = excluded.updated_by;

comment on table public.system_alert_rules is 'Reglas automáticas para materializar alertas desde system_logs.';
comment on table public.system_alerts is 'Alertas materializadas por observabilidad técnica del CCO.';
