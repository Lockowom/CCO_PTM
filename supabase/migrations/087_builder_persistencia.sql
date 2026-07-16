-- 087_builder_persistencia.sql
-- ============================================================================
--  Persistencia del Builder del Panel (paridad con /builder):
--   • `tms_dashboard_layouts` — dashboards personalizados (config jsonb).
--   • `tms_builder_calculated_fields` — campos calculados (fórmulas del motor).
--  Reemplaza las tablas dashboard_layouts / builder_calculated_fields del Panel.
--  Lecturas: authenticated (RLS). Escrituras: RPCs gate `manage_panel`.
-- ============================================================================
create table if not exists public.tms_dashboard_layouts (
  id            text primary key,
  name          text not null,
  owner         text,
  min_role_edit text not null default 'supervisor',
  config        jsonb not null default '{"widgets": [], "gridLayout": []}'::jsonb,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create table if not exists public.tms_builder_calculated_fields (
  id          bigint generated always as identity primary key,
  nombre      text not null unique,
  formula     text not null,
  tipo        text not null default 'texto',
  descripcion text,
  activo      boolean not null default true,
  created_by  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.tms_dashboard_layouts          enable row level security;
alter table public.tms_builder_calculated_fields  enable row level security;
drop policy if exists p_tms_dash_sel on public.tms_dashboard_layouts;
create policy p_tms_dash_sel on public.tms_dashboard_layouts for select to authenticated using (true);
drop policy if exists p_tms_calc_sel on public.tms_builder_calculated_fields;
create policy p_tms_calc_sel on public.tms_builder_calculated_fields for select to authenticated using (true);

-- ── Dashboards ───────────────────────────────────────────────────────────────
create or replace function public.guardar_dashboard(p jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_id text := nullif(p->>'id','');
begin
  if not public._panel_puede_escribir() then raise exception 'No autorizado'; end if;
  if v_id is null then raise exception 'id requerido'; end if;
  insert into public.tms_dashboard_layouts (id, name, owner, min_role_edit, config, updated_at)
  values (v_id, coalesce(p->>'name','Dashboard'), nullif(p->>'owner',''), coalesce(nullif(p->>'min_role_edit',''),'supervisor'),
          coalesce(p->'config','{}'::jsonb), now())
  on conflict (id) do update set
    name = excluded.name, owner = excluded.owner, min_role_edit = excluded.min_role_edit,
    config = excluded.config, updated_at = now();
  return jsonb_build_object('ok', true, 'id', v_id);
end; $$;
revoke all on function public.guardar_dashboard(jsonb) from public;
grant execute on function public.guardar_dashboard(jsonb) to authenticated;

create or replace function public.eliminar_dashboard(p_id text)
returns jsonb language plpgsql security definer set search_path = public as $$
begin
  if not public._panel_puede_escribir() then raise exception 'No autorizado'; end if;
  delete from public.tms_dashboard_layouts where id = p_id;
  return jsonb_build_object('ok', true, 'id', p_id);
end; $$;
revoke all on function public.eliminar_dashboard(text) from public;
grant execute on function public.eliminar_dashboard(text) to authenticated;

-- ── Campos calculados ────────────────────────────────────────────────────────
create or replace function public.guardar_campo_calculado(p jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_id bigint := nullif(p->>'id','')::bigint; r public.tms_builder_calculated_fields;
begin
  if not public._panel_puede_escribir() then raise exception 'No autorizado'; end if;
  if v_id is null then
    insert into public.tms_builder_calculated_fields (nombre, formula, tipo, descripcion, activo, created_by)
    values (p->>'nombre', p->>'formula', coalesce(nullif(p->>'tipo',''),'texto'), nullif(p->>'descripcion',''),
            coalesce((p->>'activo')::boolean, true), nullif(p->>'created_by',''))
    returning * into r;
  else
    update public.tms_builder_calculated_fields set
      nombre = coalesce(nullif(p->>'nombre',''), nombre), formula = coalesce(nullif(p->>'formula',''), formula),
      tipo = coalesce(nullif(p->>'tipo',''), tipo), descripcion = nullif(p->>'descripcion',''),
      activo = coalesce((p->>'activo')::boolean, activo), updated_at = now()
    where id = v_id returning * into r;
    if r.id is null then raise exception 'Campo no encontrado'; end if;
  end if;
  return jsonb_build_object('ok', true, 'id', r.id);
end; $$;
revoke all on function public.guardar_campo_calculado(jsonb) from public;
grant execute on function public.guardar_campo_calculado(jsonb) to authenticated;

create or replace function public.eliminar_campo_calculado(p_id bigint)
returns jsonb language plpgsql security definer set search_path = public as $$
begin
  if not public._panel_puede_escribir() then raise exception 'No autorizado'; end if;
  delete from public.tms_builder_calculated_fields where id = p_id;
  return jsonb_build_object('ok', true, 'id', p_id);
end; $$;
revoke all on function public.eliminar_campo_calculado(bigint) from public;
grant execute on function public.eliminar_campo_calculado(bigint) to authenticated;
