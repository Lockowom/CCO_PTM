-- 088_config_catalogos.sql
-- ============================================================================
--  Configuración del Panel (paridad con /configuracion): catálogos maestros de
--  Transportistas y Vendedores (CRUD). Tablas `tms_panel_transportistas` /
--  `tms_panel_vendedores` (nombre distinto para no chocar con entidades WMS).
--  Se siembran con los valores reales presentes en tms_operaciones.
--  Lecturas: authenticated (RLS). Escrituras: RPCs genéricas gate `manage_panel`.
-- ============================================================================
create table if not exists public.tms_panel_transportistas (
  id bigint generated always as identity primary key,
  nombre text not null unique, codigo text, telefono text, email text,
  activo boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.tms_panel_vendedores (
  id bigint generated always as identity primary key,
  nombre text not null unique, codigo text, telefono text, email text,
  activo boolean not null default true, centro_costo text, division text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

-- Siembra desde los valores reales de operaciones (si están vacías).
insert into public.tms_panel_transportistas (nombre)
select distinct btrim(transportista) from public.tms_operaciones
where transportista is not null and btrim(transportista) <> ''
on conflict (nombre) do nothing;

insert into public.tms_panel_vendedores (nombre, division, centro_costo)
select distinct on (btrim(vendedor)) btrim(vendedor), max(division), max(centro_costo)
from public.tms_operaciones
where vendedor is not null and btrim(vendedor) <> ''
group by btrim(vendedor)
on conflict (nombre) do nothing;

alter table public.tms_panel_transportistas enable row level security;
alter table public.tms_panel_vendedores      enable row level security;
drop policy if exists p_tms_ptrans_sel on public.tms_panel_transportistas;
create policy p_tms_ptrans_sel on public.tms_panel_transportistas for select to authenticated using (true);
drop policy if exists p_tms_pvend_sel on public.tms_panel_vendedores;
create policy p_tms_pvend_sel on public.tms_panel_vendedores for select to authenticated using (true);

-- ── RPCs genéricas de catálogo (tipo = 'transportistas' | 'vendedores') ─────
create or replace function public.guardar_panel_catalogo(p_tipo text, p jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_id bigint := nullif(p->>'id','')::bigint; new_id bigint;
begin
  if not public._panel_puede_escribir() then raise exception 'No autorizado'; end if;
  if p_tipo = 'transportistas' then
    if v_id is null then
      insert into public.tms_panel_transportistas (nombre, codigo, telefono, email, activo)
      values (btrim(p->>'nombre'), nullif(p->>'codigo',''), nullif(p->>'telefono',''), nullif(p->>'email',''), coalesce((p->>'activo')::boolean, true))
      returning id into new_id;
    else
      update public.tms_panel_transportistas set nombre = coalesce(nullif(btrim(p->>'nombre'),''), nombre),
        codigo = nullif(p->>'codigo',''), telefono = nullif(p->>'telefono',''), email = nullif(p->>'email',''),
        activo = coalesce((p->>'activo')::boolean, activo), updated_at = now() where id = v_id returning id into new_id;
    end if;
  elsif p_tipo = 'vendedores' then
    if v_id is null then
      insert into public.tms_panel_vendedores (nombre, codigo, telefono, email, activo, centro_costo, division)
      values (btrim(p->>'nombre'), nullif(p->>'codigo',''), nullif(p->>'telefono',''), nullif(p->>'email',''), coalesce((p->>'activo')::boolean, true), nullif(p->>'centro_costo',''), nullif(p->>'division',''))
      returning id into new_id;
    else
      update public.tms_panel_vendedores set nombre = coalesce(nullif(btrim(p->>'nombre'),''), nombre),
        codigo = nullif(p->>'codigo',''), telefono = nullif(p->>'telefono',''), email = nullif(p->>'email',''),
        activo = coalesce((p->>'activo')::boolean, activo), centro_costo = nullif(p->>'centro_costo',''), division = nullif(p->>'division',''),
        updated_at = now() where id = v_id returning id into new_id;
    end if;
  else raise exception 'tipo inválido'; end if;
  return jsonb_build_object('ok', true, 'id', new_id);
end; $$;
revoke all on function public.guardar_panel_catalogo(text, jsonb) from public;
grant execute on function public.guardar_panel_catalogo(text, jsonb) to authenticated;

create or replace function public.toggle_panel_catalogo(p_tipo text, p_id bigint, p_activo boolean)
returns jsonb language plpgsql security definer set search_path = public as $$
begin
  if not public._panel_puede_escribir() then raise exception 'No autorizado'; end if;
  if p_tipo = 'transportistas' then update public.tms_panel_transportistas set activo = p_activo, updated_at = now() where id = p_id;
  elsif p_tipo = 'vendedores' then update public.tms_panel_vendedores set activo = p_activo, updated_at = now() where id = p_id;
  else raise exception 'tipo inválido'; end if;
  return jsonb_build_object('ok', true, 'id', p_id);
end; $$;
revoke all on function public.toggle_panel_catalogo(text, bigint, boolean) from public;
grant execute on function public.toggle_panel_catalogo(text, bigint, boolean) to authenticated;

create or replace function public.eliminar_panel_catalogo(p_tipo text, p_id bigint)
returns jsonb language plpgsql security definer set search_path = public as $$
begin
  if not public._panel_puede_escribir() then raise exception 'No autorizado'; end if;
  if p_tipo = 'transportistas' then delete from public.tms_panel_transportistas where id = p_id;
  elsif p_tipo = 'vendedores' then delete from public.tms_panel_vendedores where id = p_id;
  else raise exception 'tipo inválido'; end if;
  return jsonb_build_object('ok', true, 'id', p_id);
end; $$;
revoke all on function public.eliminar_panel_catalogo(text, bigint) from public;
grant execute on function public.eliminar_panel_catalogo(text, bigint) to authenticated;
