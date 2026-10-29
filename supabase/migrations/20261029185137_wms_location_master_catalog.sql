-- Catálogo maestro de posiciones físicas CCO.
-- Este catálogo es independiente de wms_ubicaciones (stock/Put Away por SKU)
-- y no realiza movimientos, ajustes ni escrituras hacia ERP/Softland.

create table public.wms_ubicaciones_maestras (
  id uuid primary key default gen_random_uuid(),
  ubicacion text not null,
  descripcion text,
  activo boolean not null default true,
  creado_por uuid references public.tms_usuarios(id) on delete set null,
  creado_por_nombre text,
  creado_en timestamptz not null default now(),
  actualizado_por uuid references public.tms_usuarios(id) on delete set null,
  actualizado_por_nombre text,
  actualizado_en timestamptz not null default now(),
  desactivado_por uuid references public.tms_usuarios(id) on delete set null,
  desactivado_por_nombre text,
  desactivado_en timestamptz,
  constraint wms_ubicaciones_maestras_ubicacion_key unique (ubicacion),
  constraint wms_ubicaciones_maestras_descripcion_largo
    check (descripcion is null or char_length(descripcion) <= 500)
);

create index wms_ubicaciones_maestras_estado_ubicacion_idx
  on public.wms_ubicaciones_maestras (activo, ubicacion);

-- Se conserva una auditoría inmutable de las altas, ediciones y bajas lógicas.
create table public.wms_ubicaciones_maestras_historial (
  id bigint generated always as identity primary key,
  ubicacion_maestra_id uuid not null references public.wms_ubicaciones_maestras(id),
  accion text not null check (accion in ('CREADA', 'ACTUALIZADA', 'DESACTIVADA', 'REACTIVADA')),
  datos_anteriores jsonb,
  datos_nuevos jsonb not null,
  actor_id uuid references public.tms_usuarios(id) on delete set null,
  actor_nombre text,
  creado_en timestamptz not null default now()
);

create index wms_ubicaciones_maestras_historial_ubicacion_idx
  on public.wms_ubicaciones_maestras_historial (ubicacion_maestra_id, creado_en desc);

alter table public.wms_ubicaciones_maestras enable row level security;
alter table public.wms_ubicaciones_maestras_historial enable row level security;

create policy wms_ubicaciones_maestras_authenticated_select
  on public.wms_ubicaciones_maestras
  for select to authenticated
  using (true);

create policy wms_ubicaciones_maestras_manager_insert
  on public.wms_ubicaciones_maestras
  for insert to authenticated
  with check ((select public.usuario_tiene_algun_permiso(array['manage_locations'])));

create policy wms_ubicaciones_maestras_manager_update
  on public.wms_ubicaciones_maestras
  for update to authenticated
  using ((select public.usuario_tiene_algun_permiso(array['manage_locations'])))
  with check ((select public.usuario_tiene_algun_permiso(array['manage_locations'])));

create policy wms_ubicaciones_maestras_historial_manager_select
  on public.wms_ubicaciones_maestras_historial
  for select to authenticated
  using ((select public.usuario_tiene_algun_permiso(array['manage_locations'])));

revoke all on table public.wms_ubicaciones_maestras from public, anon;
grant select, insert, update on table public.wms_ubicaciones_maestras to authenticated;
grant all on table public.wms_ubicaciones_maestras to service_role;

revoke all on table public.wms_ubicaciones_maestras_historial from public, anon, authenticated;
grant select on table public.wms_ubicaciones_maestras_historial to authenticated;
grant all on table public.wms_ubicaciones_maestras_historial to service_role;
grant usage, select on sequence public.wms_ubicaciones_maestras_historial_id_seq to service_role;

-- Baseline no destructivo: las ubicaciones ya usadas siguen válidas al activar
-- el catálogo. Las normalizaciones futuras pasan por el trigger de preparación.
insert into public.wms_ubicaciones_maestras (ubicacion, descripcion)
select
  upper(btrim(w.ubicacion)) as ubicacion,
  max(nullif(btrim(w.descripcion), '')) as descripcion
from public.wms_ubicaciones w
where nullif(btrim(w.ubicacion), '') is not null
group by upper(btrim(w.ubicacion))
on conflict (ubicacion) do nothing;

create function public.wms_ubicaciones_maestras_preparar()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor_id uuid;
  v_actor_nombre text;
begin
  new.ubicacion := upper(btrim(coalesce(new.ubicacion, '')));
  new.descripcion := nullif(btrim(new.descripcion), '');

  if new.ubicacion = '' then
    raise exception 'La ubicación es obligatoria' using errcode = '22023';
  end if;
  if new.ubicacion !~ '^[A-Z0-9]+-[A-Z0-9]+-[A-Z0-9]+$' then
    raise exception 'Formato inválido. Use RACK-POS-NIVEL (ej: D-05-02)' using errcode = '22023';
  end if;

  select u.id, coalesce(u.nombre, u.email)
    into v_actor_id, v_actor_nombre
  from public.tms_usuarios u
  where u.auth_uid = auth.uid() and coalesce(u.activo, true)
  limit 1;

  if tg_op = 'INSERT' then
    new.creado_por := coalesce(v_actor_id, new.creado_por);
    new.creado_por_nombre := coalesce(v_actor_nombre, new.creado_por_nombre);
    new.creado_en := coalesce(new.creado_en, now());
  end if;

  new.actualizado_por := coalesce(v_actor_id, new.actualizado_por);
  new.actualizado_por_nombre := coalesce(v_actor_nombre, new.actualizado_por_nombre);
  new.actualizado_en := now();

  if tg_op = 'UPDATE' and old.activo is distinct from new.activo then
    if new.activo then
      new.desactivado_por := null;
      new.desactivado_por_nombre := null;
      new.desactivado_en := null;
    else
      new.desactivado_por := v_actor_id;
      new.desactivado_por_nombre := v_actor_nombre;
      new.desactivado_en := now();
    end if;
  end if;

  return new;
end;
$$;

create function public.wms_ubicaciones_maestras_auditar()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_accion text;
begin
  v_accion := case
    when tg_op = 'INSERT' then 'CREADA'
    when old.activo and not new.activo then 'DESACTIVADA'
    when not old.activo and new.activo then 'REACTIVADA'
    else 'ACTUALIZADA'
  end;

  insert into public.wms_ubicaciones_maestras_historial (
    ubicacion_maestra_id, accion, datos_anteriores, datos_nuevos, actor_id, actor_nombre
  ) values (
    new.id,
    v_accion,
    case when tg_op = 'UPDATE' then to_jsonb(old) end,
    to_jsonb(new),
    new.actualizado_por,
    new.actualizado_por_nombre
  );
  return new;
end;
$$;

revoke all on function public.wms_ubicaciones_maestras_preparar() from public, anon, authenticated;
revoke all on function public.wms_ubicaciones_maestras_auditar() from public, anon, authenticated;

create trigger trg_wms_ubicaciones_maestras_preparar
  before insert or update on public.wms_ubicaciones_maestras
  for each row execute function public.wms_ubicaciones_maestras_preparar();

create trigger trg_wms_ubicaciones_maestras_auditar
  after insert or update on public.wms_ubicaciones_maestras
  for each row execute function public.wms_ubicaciones_maestras_auditar();

-- La entrada de Put Away solo puede usar una posición activa del catálogo.
-- No modifica stock: conserva cantidad = 0 para las filas visuales nuevas.
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
    if not exists (
      select 1
      from public.wms_ubicaciones_maestras m
      where m.ubicacion = v_ubicacion and m.activo
    ) then
      raise exception 'Ubicación no registrada o desactivada: %', v_ubicacion using errcode = '22023';
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

comment on table public.wms_ubicaciones_maestras is
  'Catálogo administrado de posiciones físicas CCO. No representa ni modifica stock ERP.';
