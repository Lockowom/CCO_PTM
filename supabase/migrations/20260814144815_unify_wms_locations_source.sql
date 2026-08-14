-- Fuente operacional única para ubicaciones.
-- wms_ubicaciones conserva el stock físico y también registra asignaciones
-- visuales de Put Away (cantidad = 0). La tabla antigua queda únicamente como
-- adaptador temporal para clientes OTA anteriores a esta migración.

alter table public.wms_ubicaciones
  add column if not exists registrado_putaway boolean not null default false,
  add column if not exists origen_registro text not null default 'inventario',
  add column if not exists creado_por uuid references public.tms_usuarios(id),
  add column if not exists creado_por_nombre text,
  add column if not exists creado_en timestamptz not null default now(),
  add column if not exists actualizado_por uuid references public.tms_usuarios(id),
  add column if not exists actualizado_por_nombre text;

alter table public.wms_ubicaciones
  drop constraint if exists wms_ubicaciones_origen_registro_check;
alter table public.wms_ubicaciones
  add constraint wms_ubicaciones_origen_registro_check
  check (origen_registro in ('inventario', 'putaway'));

create index if not exists idx_wms_ubicaciones_putaway
  on public.wms_ubicaciones (updated_at desc)
  where registrado_putaway;
create index if not exists idx_wms_ubicaciones_busqueda_normalizada
  on public.wms_ubicaciones (upper(btrim(codigo)), upper(btrim(ubicacion)));
create index if not exists idx_wms_ubicaciones_creado_por
  on public.wms_ubicaciones (creado_por) where creado_por is not null;
create index if not exists idx_wms_ubicaciones_actualizado_por
  on public.wms_ubicaciones (actualizado_por) where actualizado_por is not null;

-- Primero se enriquecen coincidencias existentes sin tocar su cantidad.
update public.wms_ubicaciones w
set registrado_putaway = true,
    origen_registro = case when coalesce(w.cantidad, 0) > 0 then 'inventario' else 'putaway' end,
    descripcion = coalesce(nullif(w.descripcion, ''), p.descripcion),
    serie = coalesce(nullif(w.serie, ''), p.serie),
    partida = coalesce(nullif(w.partida, ''), p.partida),
    pieza = coalesce(nullif(w.pieza, ''), p.pieza),
    fecha_vencimiento = coalesce(w.fecha_vencimiento, p.fecha_vencimiento),
    talla = coalesce(nullif(w.talla, ''), p.talla),
    color = coalesce(nullif(w.color, ''), p.color),
    creado_por = coalesce(w.creado_por, p.creado_por),
    creado_por_nombre = coalesce(w.creado_por_nombre, p.creado_por_nombre),
    creado_en = least(w.creado_en, p.creado_en),
    actualizado_por = coalesce(p.actualizado_por, p.creado_por, w.actualizado_por),
    actualizado_por_nombre = coalesce(p.actualizado_por_nombre, p.creado_por_nombre, w.actualizado_por_nombre),
    updated_at = greatest(coalesce(w.updated_at, '-infinity'::timestamptz),
                          coalesce(p.actualizado_en, p.creado_en, now()))
from public.wms_putaway_ubicaciones p
where upper(btrim(w.ubicacion)) = p.ubicacion_normalizada
  and upper(btrim(coalesce(w.codigo, ''))) = p.codigo_normalizado;

-- Después se copian las ubicaciones que solo existían en Put Away. Cantidad 0
-- significa referencia visual y evita inventar stock.
insert into public.wms_ubicaciones (
  ubicacion, codigo, descripcion, cantidad, talla, color, serie, partida, pieza,
  fecha_vencimiento, registrado_putaway, origen_registro, creado_por,
  creado_por_nombre, creado_en, actualizado_por, actualizado_por_nombre, updated_at
)
select p.ubicacion_normalizada, p.codigo_normalizado, p.descripcion, 0,
       p.talla, p.color, p.serie, p.partida, p.pieza, p.fecha_vencimiento,
       true, 'putaway', p.creado_por, p.creado_por_nombre, p.creado_en,
       p.actualizado_por, p.actualizado_por_nombre,
       coalesce(p.actualizado_en, p.creado_en, now())
from public.wms_putaway_ubicaciones p
where not exists (
  select 1 from public.wms_ubicaciones w
  where upper(btrim(w.ubicacion)) = p.ubicacion_normalizada
    and upper(btrim(coalesce(w.codigo, ''))) = p.codigo_normalizado
)
on conflict (ubicacion, codigo) do update
set registrado_putaway = true,
    origen_registro = case when coalesce(public.wms_ubicaciones.cantidad, 0) > 0
                           then 'inventario' else 'putaway' end;

create table if not exists public.wms_ubicaciones_historial (
  id bigint generated always as identity primary key,
  ubicacion_id uuid,
  accion text not null check (accion in ('INSERT', 'UPDATE', 'DELETE')),
  datos_anteriores jsonb,
  datos_nuevos jsonb,
  actor_id uuid references public.tms_usuarios(id),
  actor_nombre text,
  creado_en timestamptz not null default now()
);
create index if not exists idx_wms_ubicaciones_historial_registro
  on public.wms_ubicaciones_historial (ubicacion_id, creado_en desc);
create index if not exists idx_wms_ubicaciones_historial_codigo
  on public.wms_ubicaciones_historial ((datos_nuevos->>'codigo'), creado_en desc);
create index if not exists idx_wms_ubicaciones_historial_actor
  on public.wms_ubicaciones_historial (actor_id, creado_en desc)
  where actor_id is not null;

alter table public.wms_ubicaciones_historial enable row level security;
drop policy if exists wms_ubicaciones_historial_admin_select on public.wms_ubicaciones_historial;
create policy wms_ubicaciones_historial_admin_select
  on public.wms_ubicaciones_historial for select to authenticated
  using (public.usuario_tiene_algun_permiso(array['manage_locations']));

revoke all on table public.wms_ubicaciones_historial from public, anon, authenticated;
grant select on table public.wms_ubicaciones_historial to authenticated;
grant all on table public.wms_ubicaciones_historial to service_role;
grant usage, select on sequence public.wms_ubicaciones_historial_id_seq to service_role;

create or replace function public.wms_ubicaciones_preparar()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor_id uuid;
  v_actor_nombre text;
begin
  new.ubicacion := upper(btrim(new.ubicacion));
  new.codigo := nullif(upper(btrim(new.codigo)), '');
  new.updated_at := now();
  select u.id, coalesce(u.nombre, u.email)
    into v_actor_id, v_actor_nombre
  from public.tms_usuarios u
  where u.auth_uid = auth.uid()
  limit 1;

  if tg_op = 'INSERT' then
    new.creado_por := coalesce(new.creado_por, v_actor_id);
    new.creado_por_nombre := coalesce(new.creado_por_nombre, v_actor_nombre);
    new.creado_en := coalesce(new.creado_en, now());
  end if;
  new.actualizado_por := coalesce(v_actor_id, new.actualizado_por);
  new.actualizado_por_nombre := coalesce(v_actor_nombre, new.actualizado_por_nombre);
  return new;
end;
$$;

create or replace function public.wms_ubicaciones_auditar()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor_id uuid;
  v_actor_nombre text;
begin
  select u.id, coalesce(u.nombre, u.email)
    into v_actor_id, v_actor_nombre
  from public.tms_usuarios u
  where u.auth_uid = auth.uid()
  limit 1;

  insert into public.wms_ubicaciones_historial (
    ubicacion_id, accion, datos_anteriores, datos_nuevos, actor_id, actor_nombre
  ) values (
    coalesce(new.id, old.id), tg_op,
    case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) end,
    case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) end,
    v_actor_id, v_actor_nombre
  );
  return coalesce(new, old);
end;
$$;

drop trigger if exists trg_wms_ubicaciones_preparar on public.wms_ubicaciones;
create trigger trg_wms_ubicaciones_preparar
  before insert or update on public.wms_ubicaciones
  for each row execute function public.wms_ubicaciones_preparar();
drop trigger if exists trg_wms_ubicaciones_auditar on public.wms_ubicaciones;
create trigger trg_wms_ubicaciones_auditar
  after insert or update or delete on public.wms_ubicaciones
  for each row execute function public.wms_ubicaciones_auditar();

create or replace function public.registrar_putaway_ubicaciones(p_items jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_item jsonb;
  v_ubicacion text;
  v_codigo text;
  v_id uuid;
  v_actor_id uuid;
  v_actor_nombre text;
  v_fecha date;
  v_saved jsonb := '[]'::jsonb;
begin
  if auth.uid() is null or not coalesce(public.usuario_tiene_algun_permiso(
    array['view_entry', 'process_entry', 'manage_locations', 'manage_inventory']
  ), false) then
    raise exception 'Acceso denegado para registrar Put Away' using errcode = '42501';
  end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Debe enviar al menos una ubicación' using errcode = '22023';
  end if;
  if jsonb_array_length(p_items) > 500 then
    raise exception 'Máximo 500 ubicaciones por lote' using errcode = '22023';
  end if;

  select u.id, coalesce(u.nombre, u.email)
    into v_actor_id, v_actor_nombre
  from public.tms_usuarios u where u.auth_uid = auth.uid() and u.activo limit 1;

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    v_ubicacion := upper(btrim(coalesce(v_item->>'ubicacion', '')));
    v_codigo := upper(btrim(coalesce(v_item->>'codigo', '')));
    if v_ubicacion = '' or v_codigo = '' then
      raise exception 'Ubicación y SKU son obligatorios' using errcode = '22023';
    end if;
    if length(v_ubicacion) > 40 or length(v_codigo) > 80 then
      raise exception 'Ubicación o SKU excede el largo permitido' using errcode = '22001';
    end if;

    v_fecha := null;
    begin
      if nullif(btrim(v_item->>'fecha_vencimiento'), '') is not null then
        v_fecha := (v_item->>'fecha_vencimiento')::date;
      end if;
    exception when invalid_datetime_format or datetime_field_overflow then
      v_fecha := null;
    end;

    perform pg_catalog.pg_advisory_xact_lock(
      pg_catalog.hashtextextended(v_ubicacion || chr(31) || v_codigo, 0)
    );
    select w.id into v_id
    from public.wms_ubicaciones w
    where upper(btrim(w.ubicacion)) = v_ubicacion
      and upper(btrim(coalesce(w.codigo, ''))) = v_codigo
    order by coalesce(w.cantidad, 0) desc, w.updated_at desc nulls last
    limit 1 for update;

    if v_id is null then
      insert into public.wms_ubicaciones (
        ubicacion, codigo, descripcion, cantidad, talla, color, serie, partida,
        pieza, fecha_vencimiento, registrado_putaway, origen_registro,
        creado_por, creado_por_nombre, actualizado_por, actualizado_por_nombre
      ) values (
        v_ubicacion, v_codigo, nullif(btrim(v_item->>'descripcion'), ''), 0,
        nullif(btrim(v_item->>'talla'), ''), nullif(btrim(v_item->>'color'), ''),
        nullif(btrim(v_item->>'serie'), ''), nullif(btrim(v_item->>'partida'), ''),
        nullif(btrim(v_item->>'pieza'), ''), v_fecha, true, 'putaway',
        v_actor_id, v_actor_nombre, v_actor_id, v_actor_nombre
      ) returning id into v_id;
    else
      update public.wms_ubicaciones w set
        registrado_putaway = true,
        origen_registro = case when coalesce(w.cantidad, 0) > 0 then 'inventario' else 'putaway' end,
        descripcion = coalesce(nullif(w.descripcion, ''), nullif(btrim(v_item->>'descripcion'), '')),
        talla = coalesce(nullif(w.talla, ''), nullif(btrim(v_item->>'talla'), '')),
        color = coalesce(nullif(w.color, ''), nullif(btrim(v_item->>'color'), '')),
        serie = coalesce(nullif(w.serie, ''), nullif(btrim(v_item->>'serie'), '')),
        partida = coalesce(nullif(w.partida, ''), nullif(btrim(v_item->>'partida'), '')),
        pieza = coalesce(nullif(w.pieza, ''), nullif(btrim(v_item->>'pieza'), '')),
        fecha_vencimiento = coalesce(w.fecha_vencimiento, v_fecha)
      where w.id = v_id;
    end if;
    v_saved := v_saved || jsonb_build_array(jsonb_build_object(
      'id', v_id, 'ubicacion', v_ubicacion, 'codigo', v_codigo
    ));
  end loop;
  return jsonb_build_object('guardados', jsonb_array_length(v_saved), 'registros', v_saved);
end;
$$;

-- Adaptador de escritura para APK/PWA anteriores. No es fuente de consulta.
create or replace function public.compat_putaway_a_wms()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
begin
  if current_setting('cco.skip_putaway_bridge', true) = 'on' then
    return coalesce(new, old);
  end if;
  if tg_op = 'DELETE' then
    update public.wms_ubicaciones w
       set registrado_putaway = false,
           origen_registro = 'inventario'
     where upper(btrim(w.ubicacion)) = upper(btrim(old.ubicacion))
       and upper(btrim(coalesce(w.codigo, ''))) = upper(btrim(old.codigo))
       and coalesce(w.cantidad, 0) > 0;
    delete from public.wms_ubicaciones w
     where upper(btrim(w.ubicacion)) = upper(btrim(old.ubicacion))
       and upper(btrim(coalesce(w.codigo, ''))) = upper(btrim(old.codigo))
       and coalesce(w.cantidad, 0) = 0;
    return old;
  end if;

  select w.id into v_id from public.wms_ubicaciones w
   where upper(btrim(w.ubicacion)) = upper(btrim(new.ubicacion))
     and upper(btrim(coalesce(w.codigo, ''))) = upper(btrim(new.codigo))
   order by coalesce(w.cantidad, 0) desc limit 1 for update;
  if v_id is null then
    insert into public.wms_ubicaciones (
      ubicacion, codigo, descripcion, cantidad, talla, color, serie, partida,
      pieza, fecha_vencimiento, registrado_putaway, origen_registro,
      creado_por, creado_por_nombre, actualizado_por, actualizado_por_nombre
    ) values (
      new.ubicacion, new.codigo, new.descripcion, 0, new.talla, new.color,
      new.serie, new.partida, new.pieza, new.fecha_vencimiento, true, 'putaway',
      new.creado_por, new.creado_por_nombre, new.actualizado_por, new.actualizado_por_nombre
    );
  else
    update public.wms_ubicaciones w set
      registrado_putaway = true,
      origen_registro = case when coalesce(w.cantidad, 0) > 0 then 'inventario' else 'putaway' end,
      descripcion = coalesce(nullif(w.descripcion, ''), new.descripcion),
      serie = coalesce(nullif(w.serie, ''), new.serie),
      partida = coalesce(nullif(w.partida, ''), new.partida),
      pieza = coalesce(nullif(w.pieza, ''), new.pieza),
      fecha_vencimiento = coalesce(w.fecha_vencimiento, new.fecha_vencimiento)
    where w.id = v_id;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_compat_putaway_a_wms on public.wms_putaway_ubicaciones;
create trigger trg_compat_putaway_a_wms
  after insert or update or delete on public.wms_putaway_ubicaciones
  for each row execute function public.compat_putaway_a_wms();

create or replace function public.mover_ubicacion_wms(p_id uuid, p_nueva_ubicacion text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_source public.wms_ubicaciones%rowtype;
  v_target public.wms_ubicaciones%rowtype;
  v_new text := upper(btrim(coalesce(p_nueva_ubicacion, '')));
begin
  if auth.uid() is null or not coalesce(public.usuario_tiene_algun_permiso(array['manage_locations']), false) then
    raise exception 'Acceso denegado para modificar ubicaciones' using errcode = '42501';
  end if;
  if v_new = '' then raise exception 'La ubicación no puede quedar vacía' using errcode = '22023'; end if;
  select * into v_source from public.wms_ubicaciones where id = p_id for update;
  if not found then raise exception 'Registro de ubicación no encontrado' using errcode = 'P0002'; end if;
  if v_source.ubicacion = v_new then return to_jsonb(v_source); end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(v_new || chr(31) || coalesce(v_source.codigo, ''), 0)
  );
  select * into v_target from public.wms_ubicaciones
   where upper(btrim(ubicacion)) = v_new
     and upper(btrim(coalesce(codigo, ''))) = upper(btrim(coalesce(v_source.codigo, '')))
     and id <> v_source.id
   order by coalesce(cantidad, 0) desc limit 1 for update;

  if v_target.id is null then
    update public.wms_ubicaciones set ubicacion = v_new where id = v_source.id returning * into v_source;
  else
    update public.wms_ubicaciones set
      cantidad = coalesce(v_target.cantidad, 0) + coalesce(v_source.cantidad, 0),
      registrado_putaway = v_target.registrado_putaway or v_source.registrado_putaway,
      origen_registro = case when coalesce(v_target.cantidad, 0) + coalesce(v_source.cantidad, 0) > 0
                             then 'inventario' else 'putaway' end,
      descripcion = coalesce(nullif(v_target.descripcion, ''), v_source.descripcion),
      serie = coalesce(nullif(v_target.serie, ''), v_source.serie),
      partida = coalesce(nullif(v_target.partida, ''), v_source.partida),
      pieza = coalesce(nullif(v_target.pieza, ''), v_source.pieza),
      fecha_vencimiento = coalesce(v_target.fecha_vencimiento, v_source.fecha_vencimiento)
    where id = v_target.id returning * into v_source;
    delete from public.wms_ubicaciones where id = p_id;
  end if;
  return to_jsonb(v_source);
end;
$$;

create or replace function public.eliminar_ubicacion_wms(p_id uuid, p_solo_putaway boolean default false)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null or not coalesce(public.usuario_tiene_algun_permiso(array['manage_locations']), false) then
    raise exception 'Acceso denegado para eliminar ubicaciones' using errcode = '42501';
  end if;
  if p_solo_putaway then
    update public.wms_ubicaciones
       set registrado_putaway = false,
           origen_registro = 'inventario'
     where id = p_id and coalesce(cantidad, 0) > 0;
    if found then return true; end if;
  end if;
  delete from public.wms_ubicaciones where id = p_id;
  return found;
end;
$$;

-- Calidad Hito 2 ahora ve stock físico y ubicaciones visuales Put Away.
create or replace function public.monitoreo_candidatos(p_query text, p_solo_vencimiento boolean default false)
returns jsonb
language sql
stable security definer
set search_path = public
as $$
  with q as (select '%' || trim(coalesce(p_query, '')) || '%' as term),
  venc as (
    select codigo_producto, partida, unidad_medida, producto, fecha_vencimiento from tms_partidas
    union all
    select codigo_producto, lote as partida, unidad_medida, producto, fecha_vencimiento from tms_farmapack
  ),
  base as (
    select u.codigo as codigo_producto,
      coalesce(v.producto, u.descripcion) as producto,
      coalesce(nullif(u.partida, ''), '') as partida,
      u.ubicacion, coalesce(u.cantidad, 0) as disponible,
      v.unidad_medida,
      coalesce(u.fecha_vencimiento, vf.fecha_vencimiento) as fecha_vencimiento,
      u.registrado_putaway as es_ubicacion_putaway,
      u.origen_registro
    from wms_ubicaciones u cross join q
    left join lateral (
      select vv.unidad_medida, vv.producto from venc vv
      where vv.codigo_producto = u.codigo order by vv.fecha_vencimiento nulls last limit 1
    ) v on true
    left join lateral (
      select vv.fecha_vencimiento from venc vv
      where vv.codigo_producto = u.codigo and nullif(u.partida, '') is not null and vv.partida = u.partida
      order by vv.fecha_vencimiento nulls last limit 1
    ) vf on true
    where (coalesce(u.cantidad, 0) > 0 or u.registrado_putaway)
      and (u.codigo ilike q.term or coalesce(u.descripcion, '') ilike q.term
           or coalesce(u.ubicacion, '') ilike q.term)
  ), calc as (
    select b.*,
      case when b.fecha_vencimiento is null then 'NA'
           when b.fecha_vencimiento <= current_date + interval '30 days' then 'ROJO'
           when b.fecha_vencimiento <= current_date + interval '90 days' then 'NARANJA'
           else 'VERDE' end as semaforo,
      case when b.fecha_vencimiento is null then 'NO_PERECIBLE' else 'PERECIBLE' end as tipo
    from base b
  )
  select coalesce(jsonb_agg(row_to_json(c) order by c.ubicacion, c.codigo_producto), '[]'::jsonb)
  from calc c where (not p_solo_vencimiento) or c.semaforo in ('ROJO', 'NARANJA');
$$;

create or replace function public.putaway_admin_resumen()
returns jsonb
language plpgsql stable security definer set search_path = public
as $$
begin
  if not coalesce(public.usuario_tiene_algun_permiso(array['manage_locations']), false) then
    raise exception 'Acceso denegado';
  end if;
  return jsonb_build_object(
    'registros', (select count(*) from public.wms_ubicaciones where registrado_putaway),
    'skus', (select count(distinct upper(btrim(codigo))) from public.wms_ubicaciones where registrado_putaway),
    'ubicaciones', (select count(distinct upper(btrim(ubicacion))) from public.wms_ubicaciones where registrado_putaway),
    'hoy', (select count(*) from public.wms_ubicaciones where registrado_putaway
            and creado_en >= date_trunc('day', now() at time zone 'America/Santiago') at time zone 'America/Santiago'),
    'ultimos', coalesce((select jsonb_agg(to_jsonb(x) order by x.creado_en desc) from (
      select id, codigo, ubicacion, creado_por_nombre, creado_en
      from public.wms_ubicaciones where registrado_putaway order by creado_en desc limit 8
    ) x), '[]'::jsonb)
  );
end;
$$;

alter table public.wms_ubicaciones enable row level security;
drop policy if exists auth_all_wms_ubicaciones on public.wms_ubicaciones;
drop policy if exists wms_ubicaciones_authenticated_select on public.wms_ubicaciones;
drop policy if exists wms_ubicaciones_operacion_insert on public.wms_ubicaciones;
drop policy if exists wms_ubicaciones_admin_update on public.wms_ubicaciones;
drop policy if exists wms_ubicaciones_admin_delete on public.wms_ubicaciones;
create policy wms_ubicaciones_authenticated_select on public.wms_ubicaciones
  for select to authenticated using (true);
create policy wms_ubicaciones_operacion_insert on public.wms_ubicaciones
  for insert to authenticated with check (public.usuario_tiene_algun_permiso(
    array['view_entry', 'process_entry', 'manage_locations', 'manage_inventory']
  ));
create policy wms_ubicaciones_admin_update on public.wms_ubicaciones
  for update to authenticated
  using (public.usuario_tiene_algun_permiso(array['manage_locations']))
  with check (public.usuario_tiene_algun_permiso(array['manage_locations']));
create policy wms_ubicaciones_admin_delete on public.wms_ubicaciones
  for delete to authenticated
  using (public.usuario_tiene_algun_permiso(array['manage_locations']));

revoke all on table public.wms_ubicaciones from public, anon, authenticated;
grant select, insert, update, delete on table public.wms_ubicaciones to authenticated;
grant all on table public.wms_ubicaciones to service_role;

revoke all on function public.registrar_putaway_ubicaciones(jsonb) from public, anon;
revoke all on function public.mover_ubicacion_wms(uuid, text) from public, anon;
revoke all on function public.eliminar_ubicacion_wms(uuid, boolean) from public, anon;
revoke all on function public.monitoreo_candidatos(text, boolean) from public, anon;
revoke all on function public.putaway_admin_resumen() from public, anon;
grant execute on function public.registrar_putaway_ubicaciones(jsonb) to authenticated, service_role;
grant execute on function public.mover_ubicacion_wms(uuid, text) to authenticated, service_role;
grant execute on function public.eliminar_ubicacion_wms(uuid, boolean) to authenticated, service_role;
grant execute on function public.monitoreo_candidatos(text, boolean) to authenticated, service_role;
grant execute on function public.putaway_admin_resumen() to authenticated, service_role;

comment on table public.wms_ubicaciones is
  'Fuente operacional única: stock físico y referencias visuales de Put Away.';
comment on table public.wms_putaway_ubicaciones is
  'Compatibilidad temporal de escritura para clientes OTA antiguos; no usar como fuente de consulta.';
