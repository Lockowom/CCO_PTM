-- ============================================================================
--  100_panel_insumos.sql
--  Panel de Insumos (Inventario): control visual del stock de insumos de
--  embalaje/despacho con semáforo (OK / por acabarse / crítico) y solicitud por
--  correo de los que se están agotando.
--
--  • Tabla tms_insumos (catálogo + cantidad + umbrales).
--  • RLS: lectura para authenticated; escrituras SOLO por RPC gateada.
--  • Permisos: view_insumos (ver) / manage_insumos (editar). Ambos en el módulo
--    Inventario (aparecen como casillas en Admin → Roles).
--  • Siembra con la lista provista (Cajas C1–C6, Pallets/embalaje, Otros).
-- ============================================================================

create table if not exists public.tms_insumos (
  id             bigint generated always as identity primary key,
  categoria      text not null default 'OTROS',      -- CAJAS | PALLETS | OTROS
  nombre         text not null,
  medida         text,                                -- solo cajas (ej. 20 x 20 x 10)
  codigo_ptm     text,                                -- solo cajas
  unidad         text not null default 'unidad',
  cantidad       numeric not null default 0,
  umbral_bajo    numeric not null default 10,         -- <= bajo  → amarillo
  umbral_critico numeric not null default 5,          -- <= crítico → rojo
  orden          int not null default 0,
  activo         boolean not null default true,
  updated_at     timestamptz not null default now(),
  updated_by     text
);

comment on table public.tms_insumos is 'Insumos de embalaje/despacho: stock + umbrales de semáforo (Panel de Insumos).';

alter table public.tms_insumos enable row level security;

-- Lectura para cualquier usuario autenticado (initplan-safe).
drop policy if exists insumos_select on public.tms_insumos;
create policy insumos_select on public.tms_insumos
  for select to authenticated using (true);

grant select on public.tms_insumos to authenticated;

-- ── Gate de gestión: admin o permiso manage_insumos/manage_inventory ────────
create or replace function public._insumos_puede_gestionar()
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $$
  select coalesce(private.is_admin(), false)
      or coalesce(public.usuario_tiene_algun_permiso(array['manage_insumos','manage_inventory']), false);
$$;
revoke all on function public._insumos_puede_gestionar() from public, anon;
grant execute on function public._insumos_puede_gestionar() to authenticated;

-- ── Guardar (insert/update) un insumo ───────────────────────────────────────
create or replace function public.insumos_guardar(p jsonb)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $function$
declare v_id bigint := nullif(p->>'id','')::bigint; r public.tms_insumos;
begin
  if not public._insumos_puede_gestionar() then raise exception 'No autorizado'; end if;
  if v_id is not null then
    update public.tms_insumos set
      categoria      = coalesce(nullif(p->>'categoria',''), categoria),
      nombre         = coalesce(nullif(p->>'nombre',''), nombre),
      medida         = coalesce(p->>'medida', medida),
      codigo_ptm     = coalesce(p->>'codigo_ptm', codigo_ptm),
      unidad         = coalesce(nullif(p->>'unidad',''), unidad),
      cantidad       = coalesce(nullif(p->>'cantidad','')::numeric, cantidad),
      umbral_bajo    = coalesce(nullif(p->>'umbral_bajo','')::numeric, umbral_bajo),
      umbral_critico = coalesce(nullif(p->>'umbral_critico','')::numeric, umbral_critico),
      orden          = coalesce(nullif(p->>'orden','')::int, orden),
      activo         = coalesce((p->>'activo')::boolean, activo),
      updated_at     = now(),
      updated_by     = public._panel_actor()
    where id = v_id returning * into r;
    if r.id is null then raise exception 'Insumo no encontrado'; end if;
  else
    insert into public.tms_insumos (categoria, nombre, medida, codigo_ptm, unidad, cantidad, umbral_bajo, umbral_critico, orden, updated_by)
    values (
      coalesce(nullif(p->>'categoria',''), 'OTROS'), nullif(p->>'nombre',''), p->>'medida', p->>'codigo_ptm',
      coalesce(nullif(p->>'unidad',''), 'unidad'), coalesce(nullif(p->>'cantidad','')::numeric, 0),
      coalesce(nullif(p->>'umbral_bajo','')::numeric, 10), coalesce(nullif(p->>'umbral_critico','')::numeric, 5),
      coalesce(nullif(p->>'orden','')::int, 0), public._panel_actor()
    ) returning * into r;
  end if;
  return jsonb_build_object('ok', true, 'id', r.id);
end; $function$;

-- ── Ajuste rápido de cantidad ───────────────────────────────────────────────
create or replace function public.insumos_set_cantidad(p_id bigint, p_cantidad numeric)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $function$
declare r public.tms_insumos;
begin
  if not public._insumos_puede_gestionar() then raise exception 'No autorizado'; end if;
  update public.tms_insumos
     set cantidad = greatest(0, coalesce(p_cantidad, 0)), updated_at = now(), updated_by = public._panel_actor()
   where id = p_id returning * into r;
  if r.id is null then raise exception 'Insumo no encontrado'; end if;
  return jsonb_build_object('ok', true, 'id', r.id, 'cantidad', r.cantidad);
end; $function$;

-- ── Eliminar ────────────────────────────────────────────────────────────────
create or replace function public.insumos_eliminar(p_id bigint)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  if not public._insumos_puede_gestionar() then raise exception 'No autorizado'; end if;
  delete from public.tms_insumos where id = p_id;
  return jsonb_build_object('ok', true, 'id', p_id);
end; $function$;

revoke all on function public.insumos_guardar(jsonb)          from public, anon;
revoke all on function public.insumos_set_cantidad(bigint, numeric) from public, anon;
revoke all on function public.insumos_eliminar(bigint)        from public, anon;
grant execute on function public.insumos_guardar(jsonb)          to authenticated;
grant execute on function public.insumos_set_cantidad(bigint, numeric) to authenticated;
grant execute on function public.insumos_eliminar(bigint)        to authenticated;

-- ── Permisos (casillas en Admin → Roles, módulo Inventario) ─────────────────
insert into public.tms_permisos (id, nombre, modulo) values
  ('view_insumos',   'Insumos · Ver panel',                        'Inventario'),
  ('manage_insumos', 'Insumos · Editar stock/umbrales y solicitar','Inventario')
on conflict (id) do update set nombre = excluded.nombre, modulo = excluded.modulo;

-- ── Siembra (solo la 1ª vez; no duplica si ya hay filas) ────────────────────
insert into public.tms_insumos (categoria, nombre, medida, codigo_ptm, unidad, orden)
select * from (values
  ('CAJAS','C1','20 x 20 x 10','NGE66551425P','unidad',10),
  ('CAJAS','C2','31 x 21 x 31','NGE16651775P','unidad',20),
  ('CAJAS','C3','40 x 30 x 30','NGE16651940P','unidad',30),
  ('CAJAS','C4','45 x 27 x 27','NGE66551710P','unidad',40),
  ('CAJAS','C5','50 x 40 x 30','NGE16650945P','unidad',50),
  ('CAJAS','C6','70 x 40 x 60','NGE66551730P','unidad',60),
  ('PALLETS','FILM GRANDE',null,null,'rollo',110),
  ('PALLETS','HUINCHA PTM',null,null,'rollo',120),
  ('PALLETS','BURBUJA',null,null,'rollo',130),
  ('PALLETS','ROLLO CARTON CORRUGADO',null,null,'rollo',140),
  ('PALLETS','FILM CHICO',null,null,'rollo',150),
  ('PALLETS','HUINCHA TRANSPARENTE "SCOTCH"',null,null,'rollo',160),
  ('PALLETS','CHUCKO',null,null,'unidad',170),
  ('PALLETS','ALARGADOR',null,null,'unidad',180),
  ('OTROS','ETIQUETAS AUTOADHESIVAS (DENIERS)',null,null,'unidad',210),
  ('OTROS','SOLAPAS 8X16 CM',null,null,'unidad',220),
  ('OTROS','PACK PILAS RECARGABLES AAA X 2 UNIDADES',null,null,'pack',230),
  ('OTROS','ADHESIVO METALICO PARA DEA 3X5CMS',null,null,'unidad',240),
  ('OTROS','CABLE DE PODER c13',null,null,'unidad',250)
) AS seed(categoria, nombre, medida, codigo_ptm, unidad, orden)
where not exists (select 1 from public.tms_insumos);
