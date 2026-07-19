-- ============================================================================
--  115_ota_mejoras.sql — Mejoras Capgo/OTA
--   C) Gobernanza de versión: tms_ota_gobernanza (min_version + obligatorio +
--      mensaje) para exigir/avisar actualización mínima. Set gateado por
--      puede_desplegar_ota(); lectura authenticated.
--   C) Auditoría de auto-updates aplicados en el dispositivo:
--      registrar_ota_aplicado() → fila canal='aplicado' en tms_ota_despliegues
--      (cualquier usuario autenticado; antes solo se auditaban las promociones).
--   B) Inventario de versiones por dispositivo desde NUESTRO log (no requiere la
--      API de stats de Capgo): ota_dispositivos_resumen().
-- ============================================================================

create table if not exists public.tms_ota_gobernanza (
  id          int primary key default 1 check (id = 1),
  min_version text,
  obligatorio boolean not null default false,
  mensaje     text,
  updated_at  timestamptz not null default now(),
  updated_by  text
);
insert into public.tms_ota_gobernanza (id) values (1) on conflict (id) do nothing;
alter table public.tms_ota_gobernanza enable row level security;
drop policy if exists ota_gob_select on public.tms_ota_gobernanza;
create policy ota_gob_select on public.tms_ota_gobernanza for select to authenticated using (true);
grant select on public.tms_ota_gobernanza to authenticated;

create or replace function public.ota_gobernanza_set(p jsonb)
returns jsonb language plpgsql security definer set search_path to 'public'
as $function$
begin
  if not public.puede_desplegar_ota() then raise exception 'No autorizado'; end if;
  update public.tms_ota_gobernanza set
    min_version = nullif(p->>'min_version',''),
    obligatorio = coalesce((p->>'obligatorio')::boolean, obligatorio),
    mensaje     = nullif(p->>'mensaje',''),
    updated_at  = now(), updated_by = public._panel_actor()
  where id = 1;
  return jsonb_build_object('ok', true);
end; $function$;
revoke all on function public.ota_gobernanza_set(jsonb) from public, anon;
grant execute on function public.ota_gobernanza_set(jsonb) to authenticated;

-- Auditoría del update aplicado en el dispositivo (self, authenticated).
create or replace function public.registrar_ota_aplicado(p_version text, p_detalle text default null)
returns jsonb language plpgsql security definer set search_path to 'public'
as $function$
declare v_email text;
begin
  select email into v_email from public.tms_usuarios where auth_uid = auth.uid() limit 1;
  insert into public.tms_ota_despliegues (version, canal, usuario_id, usuario_email, ok, detalle)
  values (coalesce(nullif(p_version,''),'?'), 'aplicado', auth.uid(), v_email, true, coalesce(p_detalle,'auto-update'));
  return jsonb_build_object('ok', true);
end; $function$;
revoke all on function public.registrar_ota_aplicado(text, text) from public, anon;
grant execute on function public.registrar_ota_aplicado(text, text) to authenticated;

-- Inventario: qué versión aplicó cada dispositivo (desde nuestro propio log).
create or replace function public.ota_dispositivos_resumen()
returns table(version text, dispositivos bigint, ultima timestamptz, ultimo_email text)
language sql stable security definer set search_path to 'public'
as $$
  with apl as (
    select distinct on (usuario_id) usuario_id, version, usuario_email, created_at
    from public.tms_ota_despliegues
    where canal = 'aplicado' and usuario_id is not null
    order by usuario_id, created_at desc
  )
  select version, count(*)::bigint dispositivos, max(created_at) ultima,
         (array_agg(usuario_email order by created_at desc))[1] ultimo_email
  from apl group by version order by 3 desc;
$$;
revoke all on function public.ota_dispositivos_resumen() from public, anon;
grant execute on function public.ota_dispositivos_resumen() to authenticated;
