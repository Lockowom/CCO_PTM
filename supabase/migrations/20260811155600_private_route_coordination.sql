-- Coordinacion de Rutas (beta privada).
-- El propietario es el usuario Administrador activo que solicitó el piloto.
-- La UI tambien oculta la ruta, pero la frontera real está en RLS y en cada RPC.

create or replace function public.coord_rutas_es_propietario()
returns boolean
language sql
stable
set search_path = public
as $$
  select (select auth.uid()) = 'c12e2286-9619-445e-afe4-e9aefc51996c'::uuid
$$;

create or replace function public.coord_rutas_normalizar_nombre(p_text text)
returns text
language sql
immutable
parallel safe
set search_path = public
as $$
  select regexp_replace(
    translate(lower(coalesce(p_text, '')), 'áéíóúñü', 'aeiounu'),
    '[^a-z0-9]+', '', 'g'
  )
$$;

create or replace function public.coord_rutas_sector_comuna(p_comuna text)
returns text
language sql
immutable
parallel safe
set search_path = public
as $$
  select case translate(lower(btrim(coalesce(p_comuna, ''))), 'áéíóúñü', 'aeiounu')
    when 'conchali' then 'Norte'
    when 'huechuraba' then 'Norte'
    when 'independencia' then 'Norte'
    when 'recoleta' then 'Norte'
    when 'quilicura' then 'Norte'
    when 'santiago' then 'Centro'
    when 'providencia' then 'Nororiente'
    when 'nunoa' then 'Nororiente'
    when 'las condes' then 'Nororiente'
    when 'la reina' then 'Nororiente'
    when 'vitacura' then 'Nororiente'
    when 'lo barnechea' then 'Nororiente'
    when 'macul' then 'Suroriente'
    when 'penalolen' then 'Suroriente'
    when 'la florida' then 'Suroriente'
    when 'puente alto' then 'Suroriente'
    when 'san miguel' then 'Sur'
    when 'san joaquin' then 'Sur'
    when 'pedro aguirre cerda' then 'Sur'
    when 'lo espejo' then 'Sur'
    when 'la cisterna' then 'Sur'
    when 'el bosque' then 'Sur'
    when 'la granja' then 'Sur'
    when 'la pintana' then 'Sur'
    when 'san ramon' then 'Sur'
    when 'san bernardo' then 'Sur'
    when 'maipu' then 'Surponiente'
    when 'cerrillos' then 'Surponiente'
    when 'estacion central' then 'Surponiente'
    when 'padre hurtado' then 'Surponiente'
    when 'cerro navia' then 'Norponiente'
    when 'lo prado' then 'Norponiente'
    when 'pudahuel' then 'Norponiente'
    when 'quinta normal' then 'Norponiente'
    when 'renca' then 'Norponiente'
    else 'Fuera de Santiago'
  end
$$;

create table if not exists public.coord_rutas_retiros (
  id uuid primary key default gen_random_uuid(),
  cliente text not null,
  direccion text not null,
  contacto text not null,
  comuna text not null,
  sector text not null,
  fecha_solicitada date not null default current_date,
  prioridad boolean not null default false,
  notas text,
  latitud double precision,
  longitud double precision,
  estado text not null default 'PENDIENTE'
    check (estado in ('PENDIENTE','ASIGNADO','COMPLETADO','CANCELADO')),
  created_by uuid not null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint coord_retiro_cliente_real check (cliente ~* '[[:alpha:]áéíóúñü]'),
  constraint coord_retiro_direccion_real check (direccion ~* '[[:alpha:]áéíóúñü]'),
  constraint coord_retiro_contacto_real check (contacto ~* '[[:alnum:]áéíóúñü]'),
  constraint coord_retiro_sector_valido check (sector <> 'Fuera de Santiago')
);

create table if not exists public.coord_rutas_planes (
  id uuid primary key default gen_random_uuid(),
  fecha date not null,
  vuelta smallint not null check (vuelta between 1 and 20),
  transportista_id bigint not null references public.tms_panel_transportistas(id),
  transportista_nombre text not null,
  estado text not null default 'BORRADOR'
    check (estado in ('BORRADOR','CONFIRMADA','EN_RUTA','COMPLETADA','CANCELADA')),
  notas text,
  created_by uuid not null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (fecha, vuelta, transportista_id)
);

create table if not exists public.coord_rutas_paradas (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.coord_rutas_planes(id) on delete cascade,
  tipo text not null check (tipo in ('NV','RETIRO')),
  operacion_id bigint references public.tms_operaciones(id) on delete restrict,
  retiro_id uuid references public.coord_rutas_retiros(id) on delete restrict,
  orden smallint not null default 1 check (orden between 1 and 200),
  nv text,
  cliente text not null,
  direccion text not null,
  comuna text not null,
  sector text not null,
  contacto text,
  latitud double precision,
  longitud double precision,
  coordenada_aproximada boolean not null default false,
  urgente boolean not null default false,
  estado text not null default 'PENDIENTE'
    check (estado in ('PENDIENTE','VISITADA','NO_ENTREGADA')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint coord_parada_origen check (
    (tipo = 'NV' and operacion_id is not null and retiro_id is null)
    or (tipo = 'RETIRO' and retiro_id is not null and operacion_id is null)
  ),
  unique (operacion_id),
  unique (retiro_id)
);

create index if not exists ix_coord_planes_fecha on public.coord_rutas_planes (fecha, vuelta);
create index if not exists ix_coord_paradas_plan on public.coord_rutas_paradas (plan_id, orden);
create index if not exists ix_coord_retiros_estado on public.coord_rutas_retiros (estado, fecha_solicitada);
create index if not exists ix_coord_oper_shipping_cliente
  on public.tms_operaciones (estado, cliente) where estado = 'Shipping';

alter table public.coord_rutas_retiros enable row level security;
alter table public.coord_rutas_planes enable row level security;
alter table public.coord_rutas_paradas enable row level security;

create policy coord_retiros_owner_select on public.coord_rutas_retiros
  for select to authenticated using ((select public.coord_rutas_es_propietario()));
create policy coord_planes_owner_select on public.coord_rutas_planes
  for select to authenticated using ((select public.coord_rutas_es_propietario()));
create policy coord_paradas_owner_select on public.coord_rutas_paradas
  for select to authenticated using ((select public.coord_rutas_es_propietario()));

revoke all on table public.coord_rutas_retiros, public.coord_rutas_planes, public.coord_rutas_paradas from public, anon;
grant select on table public.coord_rutas_retiros, public.coord_rutas_planes, public.coord_rutas_paradas to authenticated, service_role;

create or replace function public.coord_rutas_tablero()
returns jsonb
language plpgsql
stable
security definer
set search_path = public, extensions
as $$
declare v_result jsonb;
begin
  if not public.coord_rutas_es_propietario() then raise exception 'Acceso privado denegado'; end if;

  select jsonb_build_object(
    'shipping', coalesce((
      select jsonb_agg(to_jsonb(x) order by x.urgente desc, x.fecha_shipping nulls last, x.nv)
      from (
        select o.id as operacion_id,
          coalesce(o.nv_ptm::text, o.nv_orange, o.nv_farmapack, o.varios) as nv,
          o.cliente, o.urgente, o.fecha_shipping, o.fecha_compromiso, o.bultos,
          d.id as direccion_id, coalesce(d.direccion, 'Dirección no encontrada') as direccion,
          coalesce(d.comuna, '') as comuna,
          coalesce(d.telefono_1, '') as contacto,
          d.latitud, d.longitud,
          public.coord_rutas_sector_comuna(d.comuna) as sector,
          (d.latitud is null or d.longitud is null) as coordenada_aproximada,
          p.id as parada_id, p.plan_id,
          pl.fecha as ruta_fecha, pl.vuelta as ruta_vuelta,
          pl.transportista_nombre as ruta_transportista
        from public.tms_operaciones o
        left join lateral (
          select a.* from public.tms_direcciones a
          where public.coord_rutas_normalizar_nombre(a.razon_social) = public.coord_rutas_normalizar_nombre(o.cliente)
             or public.coord_rutas_normalizar_nombre(a.nombre) = public.coord_rutas_normalizar_nombre(o.cliente)
          order by (a.latitud is not null and a.longitud is not null) desc, a.updated_at desc nulls last
          limit 1
        ) d on true
        left join public.coord_rutas_paradas p on p.operacion_id = o.id
        left join public.coord_rutas_planes pl on pl.id = p.plan_id
        where o.estado = 'Shipping' and o.shipping_subestado is null
      ) x
    ), '[]'::jsonb),
    'retiros', coalesce((
      select jsonb_agg(to_jsonb(r) order by r.prioridad desc, r.fecha_solicitada, r.created_at)
      from public.coord_rutas_retiros r
      where r.estado not in ('COMPLETADO','CANCELADO')
    ), '[]'::jsonb),
    'planes', coalesce((
      select jsonb_agg(
        to_jsonb(pl) || jsonb_build_object('paradas', coalesce((
          select jsonb_agg(to_jsonb(pa) order by pa.orden, pa.created_at)
          from public.coord_rutas_paradas pa where pa.plan_id = pl.id
        ), '[]'::jsonb))
        order by pl.fecha, pl.vuelta, pl.transportista_nombre
      )
      from public.coord_rutas_planes pl
      where pl.fecha >= current_date - 1 and pl.estado <> 'CANCELADA'
    ), '[]'::jsonb),
    'transportistas', coalesce((
      select jsonb_agg(jsonb_build_object('id', t.id, 'nombre', t.nombre) order by t.nombre)
      from public.tms_panel_transportistas t where t.activo
    ), '[]'::jsonb)
  ) into v_result;
  return v_result;
end;
$$;

create or replace function public.coord_rutas_crear_retiro(p_data jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cliente text := nullif(regexp_replace(btrim(coalesce(p_data->>'cliente','')), '\s+', ' ', 'g'), '');
  v_direccion text := nullif(regexp_replace(btrim(coalesce(p_data->>'direccion','')), '\s+', ' ', 'g'), '');
  v_contacto text := nullif(regexp_replace(btrim(coalesce(p_data->>'contacto','')), '\s+', ' ', 'g'), '');
  v_comuna text := nullif(regexp_replace(btrim(coalesce(p_data->>'comuna','')), '\s+', ' ', 'g'), '');
  v_sector text;
  v_row public.coord_rutas_retiros%rowtype;
begin
  if not public.coord_rutas_es_propietario() then raise exception 'Acceso privado denegado'; end if;
  v_sector := public.coord_rutas_sector_comuna(v_comuna);
  if v_cliente is null or v_cliente !~* '[[:alpha:]áéíóúñü]' then raise exception 'Cliente inválido'; end if;
  if v_direccion is null or v_direccion !~* '[[:alpha:]áéíóúñü]' then raise exception 'Dirección inválida'; end if;
  if v_contacto is null or v_contacto !~* '[[:alnum:]áéíóúñü]' then raise exception 'Contacto inválido'; end if;
  if v_sector = 'Fuera de Santiago' then raise exception 'La comuna aún no pertenece al piloto Santiago'; end if;

  insert into public.coord_rutas_retiros
    (cliente, direccion, contacto, comuna, sector, fecha_solicitada, prioridad, notas, created_by)
  values
    (v_cliente, v_direccion, v_contacto, v_comuna, v_sector,
     coalesce(nullif(p_data->>'fecha_solicitada','')::date, current_date),
     coalesce((p_data->>'prioridad')::boolean, false),
     nullif(regexp_replace(btrim(coalesce(p_data->>'notas','')), '\s+', ' ', 'g'), ''),
     auth.uid())
  returning * into v_row;
  return to_jsonb(v_row);
end;
$$;

create or replace function public.coord_rutas_crear_plan(
  p_fecha date, p_vuelta integer, p_transportista_id bigint, p_notas text default null
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare v_t public.tms_panel_transportistas%rowtype; v_plan public.coord_rutas_planes%rowtype;
begin
  if not public.coord_rutas_es_propietario() then raise exception 'Acceso privado denegado'; end if;
  if p_fecha < current_date then raise exception 'No puedes planificar una fecha pasada'; end if;
  if p_vuelta not between 1 and 20 then raise exception 'Vuelta inválida'; end if;
  select * into v_t from public.tms_panel_transportistas where id=p_transportista_id and activo;
  if v_t.id is null then raise exception 'Transportista inválido'; end if;
  insert into public.coord_rutas_planes (fecha,vuelta,transportista_id,transportista_nombre,notas,created_by)
  values (p_fecha,p_vuelta,v_t.id,v_t.nombre,nullif(btrim(p_notas),''),auth.uid())
  on conflict (fecha,vuelta,transportista_id) do update
    set notas=excluded.notas, updated_at=now()
  returning * into v_plan;
  return to_jsonb(v_plan);
end;
$$;

create or replace function public.coord_rutas_asignar_parada(
  p_plan_id uuid, p_tipo text, p_origen_id text
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_plan public.coord_rutas_planes%rowtype;
  v_op public.tms_operaciones%rowtype;
  v_ret public.coord_rutas_retiros%rowtype;
  v_dir public.tms_direcciones%rowtype;
  v_row public.coord_rutas_paradas%rowtype;
  v_orden integer;
begin
  if not public.coord_rutas_es_propietario() then raise exception 'Acceso privado denegado'; end if;
  select * into v_plan from public.coord_rutas_planes where id=p_plan_id and estado='BORRADOR';
  if v_plan.id is null then raise exception 'Ruta no disponible para edición'; end if;
  select coalesce(max(orden),0)+1 into v_orden from public.coord_rutas_paradas where plan_id=p_plan_id;

  if upper(p_tipo)='NV' then
    select * into v_op from public.tms_operaciones
      where id=p_origen_id::bigint and estado='Shipping' and shipping_subestado is null;
    if v_op.id is null then raise exception 'N.V. no disponible en Shipping'; end if;
    select a.* into v_dir from public.tms_direcciones a
      where public.coord_rutas_normalizar_nombre(a.razon_social)=public.coord_rutas_normalizar_nombre(v_op.cliente)
         or public.coord_rutas_normalizar_nombre(a.nombre)=public.coord_rutas_normalizar_nombre(v_op.cliente)
      order by (a.latitud is not null and a.longitud is not null) desc, a.updated_at desc nulls last limit 1;
    if v_dir.id is null or public.coord_rutas_sector_comuna(v_dir.comuna)='Fuera de Santiago' then
      raise exception 'La N.V. no tiene una dirección válida dentro de Santiago';
    end if;
    insert into public.coord_rutas_paradas
      (plan_id,tipo,operacion_id,orden,nv,cliente,direccion,comuna,sector,contacto,latitud,longitud,coordenada_aproximada,urgente)
    values
      (p_plan_id,'NV',v_op.id,v_orden,coalesce(v_op.nv_ptm::text,v_op.nv_orange,v_op.nv_farmapack,v_op.varios),
       v_op.cliente,v_dir.direccion,v_dir.comuna,public.coord_rutas_sector_comuna(v_dir.comuna),v_dir.telefono_1,
       v_dir.latitud,v_dir.longitud,(v_dir.latitud is null or v_dir.longitud is null),v_op.urgente)
    returning * into v_row;
  elsif upper(p_tipo)='RETIRO' then
    select * into v_ret from public.coord_rutas_retiros where id=p_origen_id::uuid and estado='PENDIENTE';
    if v_ret.id is null then raise exception 'Retiro no disponible'; end if;
    insert into public.coord_rutas_paradas
      (plan_id,tipo,retiro_id,orden,cliente,direccion,comuna,sector,contacto,latitud,longitud,coordenada_aproximada,urgente)
    values
      (p_plan_id,'RETIRO',v_ret.id,v_orden,v_ret.cliente,v_ret.direccion,v_ret.comuna,v_ret.sector,v_ret.contacto,
       v_ret.latitud,v_ret.longitud,(v_ret.latitud is null or v_ret.longitud is null),v_ret.prioridad)
    returning * into v_row;
    update public.coord_rutas_retiros set estado='ASIGNADO',updated_at=now() where id=v_ret.id;
  else raise exception 'Tipo de parada inválido';
  end if;
  return to_jsonb(v_row);
exception when unique_violation then
  raise exception 'Este despacho o retiro ya está asignado a una ruta';
end;
$$;

create or replace function public.coord_rutas_quitar_parada(p_parada_id uuid)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_row public.coord_rutas_paradas%rowtype;
begin
  if not public.coord_rutas_es_propietario() then raise exception 'Acceso privado denegado'; end if;
  delete from public.coord_rutas_paradas p using public.coord_rutas_planes pl
  where p.id=p_parada_id and pl.id=p.plan_id and pl.estado='BORRADOR'
  returning p.* into v_row;
  if v_row.id is null then raise exception 'Parada no disponible'; end if;
  if v_row.retiro_id is not null then
    update public.coord_rutas_retiros set estado='PENDIENTE',updated_at=now() where id=v_row.retiro_id;
  end if;
  return jsonb_build_object('ok',true,'id',v_row.id);
end;
$$;

create or replace function public.coord_rutas_reordenar(p_plan_id uuid, p_paradas uuid[])
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_total integer; v_ids integer;
begin
  if not public.coord_rutas_es_propietario() then raise exception 'Acceso privado denegado'; end if;
  if not exists(select 1 from public.coord_rutas_planes where id=p_plan_id and estado='BORRADOR') then
    raise exception 'Ruta no disponible para edición';
  end if;
  select count(*) into v_total from public.coord_rutas_paradas where plan_id=p_plan_id;
  select count(distinct x) into v_ids from unnest(p_paradas) x;
  if v_total<>coalesce(array_length(p_paradas,1),0) or v_total<>v_ids
     or exists(select 1 from unnest(p_paradas) x where not exists(
       select 1 from public.coord_rutas_paradas p where p.id=x and p.plan_id=p_plan_id
     )) then raise exception 'Orden de paradas incompleto'; end if;
  update public.coord_rutas_paradas p set orden=u.ord,updated_at=now()
  from unnest(p_paradas) with ordinality u(id,ord)
  where p.id=u.id and p.plan_id=p_plan_id;
  return jsonb_build_object('ok',true,'total',v_total);
end;
$$;

create or replace function public.coord_rutas_cambiar_estado_plan(p_plan_id uuid, p_estado text)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_plan public.coord_rutas_planes%rowtype; v_new text:=upper(btrim(p_estado));
begin
  if not public.coord_rutas_es_propietario() then raise exception 'Acceso privado denegado'; end if;
  if v_new not in ('BORRADOR','CONFIRMADA','EN_RUTA','COMPLETADA','CANCELADA') then raise exception 'Estado inválido'; end if;
  select * into v_plan from public.coord_rutas_planes where id=p_plan_id for update;
  if v_plan.id is null then raise exception 'Ruta no encontrada'; end if;
  if v_plan.estado='BORRADOR' and v_new='CONFIRMADA' and not exists(
    select 1 from public.coord_rutas_paradas where plan_id=p_plan_id
  ) then raise exception 'Agrega al menos una parada antes de confirmar'; end if;
  if not ((v_plan.estado='BORRADOR' and v_new in ('CONFIRMADA','CANCELADA'))
       or (v_plan.estado='CONFIRMADA' and v_new in ('BORRADOR','EN_RUTA','CANCELADA'))
       or (v_plan.estado='EN_RUTA' and v_new in ('COMPLETADA','CANCELADA'))
       or v_plan.estado=v_new) then raise exception 'Transición de estado no permitida'; end if;
  update public.coord_rutas_planes set estado=v_new,updated_at=now() where id=p_plan_id returning * into v_plan;
  return to_jsonb(v_plan);
end;
$$;

revoke all on function public.coord_rutas_es_propietario() from public, anon;
revoke all on function public.coord_rutas_normalizar_nombre(text) from public, anon, authenticated;
revoke all on function public.coord_rutas_sector_comuna(text) from public, anon;
revoke all on function public.coord_rutas_tablero() from public, anon;
revoke all on function public.coord_rutas_crear_retiro(jsonb) from public, anon;
revoke all on function public.coord_rutas_crear_plan(date,integer,bigint,text) from public, anon;
revoke all on function public.coord_rutas_asignar_parada(uuid,text,text) from public, anon;
revoke all on function public.coord_rutas_quitar_parada(uuid) from public, anon;
revoke all on function public.coord_rutas_reordenar(uuid,uuid[]) from public, anon;
revoke all on function public.coord_rutas_cambiar_estado_plan(uuid,text) from public, anon;

grant execute on function public.coord_rutas_es_propietario() to authenticated, service_role;
grant execute on function public.coord_rutas_sector_comuna(text) to authenticated, service_role;
grant execute on function public.coord_rutas_tablero() to authenticated, service_role;
grant execute on function public.coord_rutas_crear_retiro(jsonb) to authenticated, service_role;
grant execute on function public.coord_rutas_crear_plan(date,integer,bigint,text) to authenticated, service_role;
grant execute on function public.coord_rutas_asignar_parada(uuid,text,text) to authenticated, service_role;
grant execute on function public.coord_rutas_quitar_parada(uuid) to authenticated, service_role;
grant execute on function public.coord_rutas_reordenar(uuid,uuid[]) to authenticated, service_role;
grant execute on function public.coord_rutas_cambiar_estado_plan(uuid,text) to authenticated, service_role;

alter publication supabase_realtime add table public.coord_rutas_retiros;
alter publication supabase_realtime add table public.coord_rutas_planes;
alter publication supabase_realtime add table public.coord_rutas_paradas;

comment on table public.coord_rutas_planes is 'Piloto privado de planificación de rutas urbanas; acceso restringido al propietario.';
