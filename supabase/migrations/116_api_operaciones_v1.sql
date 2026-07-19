-- ============================================================================
--  116_api_operaciones_v1.sql — API de Operaciones versionada (blueprint §8)
--  Promueve las RPCs canónicas a un contrato público v1 consumible por
--  Android / Portal Cliente / API pública / ERP, con las MISMAS reglas.
--   • API-keys (hasheadas) con scopes → autenticación máquina-a-máquina.
--   • La Edge `api-v1` valida la key + scope y llama las RPCs canónicas como
--     service_role; por eso se agrega bypass de service_role a los gates de
--     escritura (mismo patrón que _pv_assert). service_role sólo es alcanzable
--     desde el servidor (secret en la Edge), nunca desde el cliente.
--   • Auditoría de llamadas en tms_api_log.
--  Permisos: view_api / manage_api (módulo Administración).
-- ============================================================================

-- ── Bypass de service_role en gates de escritura (para la API) ──────────────
create or replace function public._panel_puede_escribir()
returns boolean language sql stable security definer set search_path = public
as $$
  select coalesce(private.is_admin(), false)
      or coalesce(public.usuario_tiene_algun_permiso(array['manage_panel']), false)
      or (auth.role() = 'service_role');
$$;

create or replace function public._tms_puede_gestionar()
returns boolean language sql stable security definer set search_path to 'public'
as $$
  select coalesce(private.is_admin(), false)
      or coalesce(public.usuario_tiene_algun_permiso(array['manage_tms','manage_panel']), false)
      or (auth.role() = 'service_role');
$$;

-- ── API keys ────────────────────────────────────────────────────────────────
create table if not exists public.tms_api_keys (
  id         bigint generated always as identity primary key,
  nombre     text not null,
  prefijo    text not null unique,          -- 8 chars visibles (para identificar)
  hash       text not null,                 -- sha256(key) hex
  scopes     text[] not null default '{}',  -- ej. {operaciones:read, operaciones:write, tms:read, tms:write}
  activo     boolean not null default true,
  creado_por text,
  creado_en  timestamptz not null default now(),
  ultimo_uso timestamptz
);
alter table public.tms_api_keys enable row level security;
-- Sin SELECT directo del cliente (el hash no debe exponerse). Se lista por RPC.

create table if not exists public.tms_api_log (
  id          bigint generated always as identity primary key,
  api_key_id  bigint,
  prefijo     text,
  metodo      text,
  ruta        text,
  estado_http int,
  detalle     text,
  creado_en   timestamptz not null default now()
);
create index if not exists tms_api_log_idx on public.tms_api_log (creado_en desc);
alter table public.tms_api_log enable row level security;

-- ── Gate de gestión ─────────────────────────────────────────────────────────
create or replace function public._api_puede_gestionar()
returns boolean language sql stable security definer set search_path to 'public'
as $$ select coalesce(private.is_admin(), false) or coalesce(public.usuario_tiene_algun_permiso(array['manage_api']), false); $$;
revoke all on function public._api_puede_gestionar() from public, anon;
grant execute on function public._api_puede_gestionar() to authenticated;

-- ── Crear API key (devuelve la clave en claro UNA sola vez) ──────────────────
create or replace function public.api_key_crear(p_nombre text, p_scopes text[])
returns jsonb language plpgsql security definer set search_path to 'public'
as $function$
declare v_key text; v_pref text; v_hash text; v_id bigint;
begin
  if not public._api_puede_gestionar() then raise exception 'No autorizado'; end if;
  v_pref := substr(replace(gen_random_uuid()::text,'-',''),1,8);
  v_key  := 'cco_' || v_pref || '_' || encode(extensions.gen_random_bytes(24),'hex');
  v_hash := encode(extensions.digest(convert_to(v_key,'UTF8'),'sha256'),'hex');
  insert into public.tms_api_keys (nombre, prefijo, hash, scopes, creado_por)
  values (coalesce(nullif(p_nombre,''),'API key'), v_pref, v_hash, coalesce(p_scopes,'{}'), public._panel_actor())
  returning id into v_id;
  return jsonb_build_object('ok', true, 'id', v_id, 'prefijo', v_pref, 'key', v_key);
end; $function$;

create or replace function public.api_key_revocar(p_id bigint)
returns jsonb language plpgsql security definer set search_path to 'public'
as $function$
begin
  if not public._api_puede_gestionar() then raise exception 'No autorizado'; end if;
  update public.tms_api_keys set activo = false where id = p_id;
  return jsonb_build_object('ok', true, 'id', p_id);
end; $function$;

-- Listado seguro (sin exponer el hash).
create or replace function public.api_keys_listar()
returns table(id bigint, nombre text, prefijo text, scopes text[], activo boolean, creado_por text, creado_en timestamptz, ultimo_uso timestamptz)
language sql stable security definer set search_path to 'public'
as $$
  select id, nombre, prefijo, scopes, activo, creado_por, creado_en, ultimo_uso
  from public.tms_api_keys order by creado_en desc;
$$;

-- Validación para la Edge (la usa el service_role): devuelve scopes si la key es válida.
create or replace function public._api_validar(p_key text)
returns text[] language plpgsql security definer set search_path to 'public'
as $function$
declare r public.tms_api_keys; v_pref text;
begin
  v_pref := split_part(p_key, '_', 2);
  select * into r from public.tms_api_keys where prefijo = v_pref and activo limit 1;
  if r.id is null then return null; end if;
  if r.hash <> encode(extensions.digest(convert_to(p_key,'UTF8'),'sha256'),'hex') then return null; end if;
  update public.tms_api_keys set ultimo_uso = now() where id = r.id;
  return r.scopes;
end; $function$;

revoke all on function public.api_key_crear(text, text[]) from public, anon;
revoke all on function public.api_key_revocar(bigint)     from public, anon;
revoke all on function public.api_keys_listar()           from public, anon;
grant execute on function public.api_key_crear(text, text[]) to authenticated;
grant execute on function public.api_key_revocar(bigint)     to authenticated;
grant execute on function public.api_keys_listar()           to authenticated;
-- _api_validar: sólo service_role (la Edge). No se concede a authenticated/anon.
revoke all on function public._api_validar(text) from public, anon, authenticated;

insert into public.tms_permisos (id, nombre, modulo) values
  ('view_api',   'API · Ver claves y llamadas',        'Administración'),
  ('manage_api', 'API · Crear/revocar claves',         'Administración')
on conflict (id) do update set nombre = excluded.nombre, modulo = excluded.modulo;
