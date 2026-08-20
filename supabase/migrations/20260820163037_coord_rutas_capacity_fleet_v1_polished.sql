-- Coordinacion de Rutas: cubicaje, flota propia y comparador de capacidad/costo.
-- Piloto privado: todas las lecturas y mutaciones quedan restringidas al
-- propietario de Coordinacion Rutas. No modifica el workflow oficial de N.V.

-- Cierra el backend pendiente de PR-015B: el módulo deja de depender de un
-- UUID hardcodeado para autorizar y pasa a rol + permiso IAM. La asignación
-- inicial conserva exactamente al propietario histórico del piloto.
insert into public.tms_permisos (id,nombre,modulo) values
  ('view_rutas_private_beta','Ver Coordinación de Rutas (beta privada)','panel'),
  ('manage_rutas_private_beta','Gestionar Coordinación de Rutas (beta privada)','panel'),
  ('view_route_coordination','Ver coordinación de rutas','panel'),
  ('manage_route_coordination','Gestionar coordinación de rutas','panel'),
  ('manage_route_costs','Gestionar costos de rutas','panel'),
  ('manage_route_fleet','Gestionar flota de rutas','panel'),
  ('view_route_analytics','Ver analítica de rutas','panel'),
  ('dispatch_route','Confirmar y despachar rutas','panel')
on conflict (id) do update set nombre=excluded.nombre,modulo=excluded.modulo;

insert into iam.roles (id,codigo,nombre,descripcion,es_sistema,activo)
values (
  gen_random_uuid(),'cco_private_beta_rutas','Piloto privado · Coordinación Rutas',
  'Acceso exclusivo al piloto no publicado de planificación logística',true,true
)
on conflict (codigo) do update set
  nombre=excluded.nombre,descripcion=excluded.descripcion,activo=true,updated_at=now();

insert into iam.role_permissions (role_id,permission_id)
select r.id,p.id
from iam.roles r
join iam.permissions p on p.codigo in (
  'view_rutas_private_beta','manage_rutas_private_beta','view_route_coordination',
  'manage_route_coordination','manage_route_costs','manage_route_fleet',
  'view_route_analytics','dispatch_route'
)
where r.codigo='cco_private_beta_rutas'
on conflict do nothing;

insert into iam.assignments (
  id,principal_type,principal_id,role_id,scope_type,scope_id,scope_code,granted_at
)
select
  gen_random_uuid(),'user'::iam.principal_type,u.id,r.id,
  'global'::iam.scope_type,null,null,now()
from iam.users u
cross join iam.roles r
where u.id='c12e2286-9619-445e-afe4-e9aefc51996c'::uuid
  and u.activo
  and r.codigo='cco_private_beta_rutas'
on conflict (principal_type,principal_id,role_id,scope_type,scope_id) do nothing;

create schema if not exists private;

create or replace function private.coord_rutas_tiene_permiso(p_permission text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from iam.user_effective_roles er
    join iam.role_permissions rp on rp.role_id=er.role_id
    join iam.permissions p on p.id=rp.permission_id
    where er.user_id=(select auth.uid())
      and er.role_codigo='cco_private_beta_rutas'
      and p.codigo=p_permission
  )
$$;

create or replace function private.coord_rutas_puede_ver()
returns boolean language sql stable security definer set search_path=''
as $$ select private.coord_rutas_tiene_permiso('view_route_coordination') $$;
create or replace function private.coord_rutas_puede_gestionar()
returns boolean language sql stable security definer set search_path=''
as $$ select private.coord_rutas_tiene_permiso('manage_route_coordination') $$;
create or replace function private.coord_rutas_puede_costos()
returns boolean language sql stable security definer set search_path=''
as $$ select private.coord_rutas_tiene_permiso('manage_route_costs') $$;
create or replace function private.coord_rutas_puede_flota()
returns boolean language sql stable security definer set search_path=''
as $$ select private.coord_rutas_tiene_permiso('manage_route_fleet') $$;
create or replace function private.coord_rutas_puede_despachar()
returns boolean language sql stable security definer set search_path=''
as $$ select private.coord_rutas_tiene_permiso('dispatch_route') $$;

revoke all on function private.coord_rutas_tiene_permiso(text) from public,anon,authenticated;
revoke all on function private.coord_rutas_puede_ver() from public,anon,authenticated;
revoke all on function private.coord_rutas_puede_gestionar() from public,anon,authenticated;
revoke all on function private.coord_rutas_puede_costos() from public,anon,authenticated;
revoke all on function private.coord_rutas_puede_flota() from public,anon,authenticated;
revoke all on function private.coord_rutas_puede_despachar() from public,anon,authenticated;

create or replace function public.coord_rutas_es_propietario()
returns boolean language sql stable security definer set search_path=''
as $$ select private.coord_rutas_puede_ver() $$;

revoke all on function public.coord_rutas_es_propietario() from public,anon;
grant execute on function public.coord_rutas_es_propietario() to authenticated,service_role;

select authz.refresh_permissions();

alter table public.tms_operaciones
  add column if not exists bultos_igual_tamano boolean,
  add column if not exists largo_cm integer,
  add column if not exists ancho_cm integer,
  add column if not exists alto_cm integer,
  add column if not exists peso_total_kg numeric(12,2),
  add column if not exists volumen_total_m3 numeric(14,4),
  add column if not exists bultos_total integer,
  add column if not exists physical_data_source text,
  add column if not exists physical_data_verified_at timestamptz,
  add column if not exists physical_data_version bigint not null default 0,
  add column if not exists cubicaje_actualizado_at timestamptz,
  add column if not exists cubicaje_actualizado_por uuid;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname='tms_operaciones_dimensiones_rango'
      and conrelid='public.tms_operaciones'::regclass
  ) then
    alter table public.tms_operaciones add constraint tms_operaciones_dimensiones_rango check (
      (largo_cm is null or largo_cm between 1 and 400)
      and (ancho_cm is null or ancho_cm between 1 and 400)
      and (alto_cm is null or alto_cm between 1 and 400)
      and (peso_total_kg is null or peso_total_kg >= 0)
      and (volumen_total_m3 is null or volumen_total_m3 >= 0)
    );
  end if;
end $$;

create table if not exists public.tms_operacion_bultos (
  id bigint generated by default as identity primary key,
  operacion_id bigint not null references public.tms_operaciones(id) on delete cascade,
  version bigint not null default 1,
  grupo_orden smallint not null check (grupo_orden between 1 and 50),
  cantidad integer not null check (cantidad between 1 and 10000),
  length_cm numeric(10,2) not null check (length_cm between 0.1 and 400),
  width_cm numeric(10,2) not null check (width_cm between 0.1 and 400),
  height_cm numeric(10,2) not null check (height_cm between 0.1 and 400),
  peso_unit_kg numeric(12,3) check (peso_unit_kg is null or peso_unit_kg > 0),
  volume_unit_m3 numeric(14,6) not null check (volume_unit_m3 > 0),
  volume_total_m3 numeric(14,4) not null check (volume_total_m3 > 0),
  packaging text,
  stackable boolean,
  source text not null default 'MANUAL_CCO',
  verified boolean not null default false,
  notes text,
  created_by uuid not null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_by uuid,
  updated_at timestamptz not null default now(),
  unique (operacion_id, grupo_orden)
);

create index if not exists ix_tms_operacion_bultos_operacion
  on public.tms_operacion_bultos (operacion_id, grupo_orden);
create index if not exists ix_tms_operaciones_shipping_cubicaje
  on public.tms_operaciones (fecha_compromiso, id)
  where estado='Shipping' and shipping_subestado is null;

alter table public.tms_vehiculos
  add column if not exists largo_util_cm numeric(10,2),
  add column if not exists ancho_util_cm numeric(10,2),
  add column if not exists alto_util_cm numeric(10,2),
  add column if not exists ancho_puerta_cm numeric(10,2),
  add column if not exists alto_puerta_cm numeric(10,2),
  add column if not exists costo_fijo_por_viaje numeric(14,2) not null default 0,
  add column if not exists costo_variable_por_km numeric(12,2) not null default 0,
  add column if not exists costo_por_hora numeric(12,2) not null default 0,
  add column if not exists velocidad_promedio_kmh numeric(8,2) not null default 40,
  add column if not exists autonomia_km numeric(10,2),
  add column if not exists max_paradas smallint not null default 12,
  add column if not exists ocupacion_minima_pct numeric(5,2) not null default 30,
  add column if not exists disponibilidad text not null default 'DISPONIBLE',
  add column if not exists updated_by uuid,
  add column if not exists updated_at timestamptz not null default now();

alter table public.coord_rutas_planes
  add column if not exists version bigint not null default 1,
  add column if not exists vehiculo_id bigint references public.tms_vehiculos(id) on delete set null,
  add column if not exists conductor_id uuid references public.tms_conductores(id) on delete set null,
  add column if not exists modo_transporte text,
  add column if not exists peso_total_kg numeric(14,2),
  add column if not exists volumen_total_m3 numeric(14,4),
  add column if not exists bultos_total integer,
  add column if not exists paradas_total integer,
  add column if not exists ocupacion_peso_pct numeric(8,2),
  add column if not exists ocupacion_volumen_pct numeric(8,2),
  add column if not exists distancia_km numeric(12,2),
  add column if not exists duracion_minutos integer,
  add column if not exists eta_at timestamptz,
  add column if not exists route_provider text,
  add column if not exists route_precision text,
  add column if not exists route_signature text,
  add column if not exists costo_total numeric(16,2),
  add column if not exists quote_snapshot jsonb,
  add column if not exists confirmed_snapshot jsonb;

alter table public.tms_transporte_ordenes
  add column if not exists plan_coord_id uuid references public.coord_rutas_planes(id) on delete set null,
  add column if not exists parada_coord_id uuid references public.coord_rutas_paradas(id) on delete set null;

create unique index if not exists uq_tms_ot_parada_coord
  on public.tms_transporte_ordenes (parada_coord_id) where parada_coord_id is not null;

create table if not exists public.coord_rutas_configuracion (
  id boolean primary key default true check (id),
  warehouse_name text not null,
  origin_lat double precision not null check (origin_lat between -90 and 90),
  origin_lon double precision not null check (origin_lon between -180 and 180),
  return_to_origin boolean not null default true,
  source text not null default 'ADMIN_VERIFIED',
  verified_at timestamptz,
  updated_by uuid not null default auth.uid(),
  updated_at timestamptz not null default now()
);

create table if not exists public.coord_rutas_comandos (
  id bigint generated by default as identity primary key,
  idempotency_key text not null unique,
  scope text not null,
  entity_id text not null,
  request_hash text not null,
  response jsonb not null,
  actor uuid not null default auth.uid(),
  created_at timestamptz not null default now(),
  constraint coord_comandos_key_formato check (length(idempotency_key) between 16 and 180)
);

create index if not exists ix_coord_comandos_entity
  on public.coord_rutas_comandos (scope,entity_id,created_at desc);

create table if not exists public.coord_rutas_decisiones_flota (
  id bigint generated by default as identity primary key,
  plan_id uuid references public.coord_rutas_planes(id) on delete set null,
  operacion_ids bigint[] not null,
  flota_id bigint references public.tms_vehiculos(id) on delete restrict,
  tarifa_id bigint references public.coord_rutas_tarifas(id) on delete restrict,
  opcion_elegida text check (opcion_elegida is null or opcion_elegida in ('PROPIA','EXTERNA','PENDIENTE')),
  recomendacion text not null,
  peso_total_kg numeric(14,2) not null default 0,
  volumen_total_m3 numeric(14,4) not null default 0,
  bultos_total integer not null default 0,
  distancia_km numeric(12,2) not null default 0,
  costo_propio numeric(16,2),
  costo_externo numeric(16,2),
  ahorro_estimado numeric(16,2),
  ocupacion_peso_pct numeric(8,2),
  ocupacion_volumen_pct numeric(8,2),
  snapshot jsonb not null default '{}'::jsonb,
  created_by uuid not null default auth.uid(),
  created_at timestamptz not null default now(),
  constraint coord_decision_operaciones check (cardinality(operacion_ids) between 1 and 100)
);

create index if not exists ix_coord_decisiones_created
  on public.coord_rutas_decisiones_flota (created_at desc);
create index if not exists ix_coord_decisiones_plan
  on public.coord_rutas_decisiones_flota (plan_id) where plan_id is not null;
create index if not exists ix_coord_decisiones_flota
  on public.coord_rutas_decisiones_flota (flota_id) where flota_id is not null;
create index if not exists ix_coord_decisiones_tarifa
  on public.coord_rutas_decisiones_flota (tarifa_id) where tarifa_id is not null;

alter table public.coord_rutas_tarifas
  add column if not exists tarifa_m3 numeric(14,2) not null default 0,
  add column if not exists recargo_urgencia_pct numeric(7,4) not null default 0;

alter table public.coord_rutas_cotizaciones
  add column if not exists volumen_m3 numeric(14,4),
  add column if not exists urgente boolean not null default false,
  add column if not exists recargo_urgencia numeric(16,2) not null default 0;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname='coord_tarifas_capacidad_rango'
      and conrelid='public.coord_rutas_tarifas'::regclass
  ) then
    alter table public.coord_rutas_tarifas add constraint coord_tarifas_capacidad_rango check (
      tarifa_m3 >= 0 and recargo_urgencia_pct between 0 and 10
    );
  end if;
end $$;

alter table public.tms_operacion_bultos enable row level security;
alter table public.coord_rutas_decisiones_flota enable row level security;
alter table public.coord_rutas_comandos enable row level security;
alter table public.coord_rutas_configuracion enable row level security;

create policy tms_operacion_bultos_owner_select on public.tms_operacion_bultos
  for select to authenticated using ((select public.coord_rutas_es_propietario()));
create policy coord_decisiones_owner_select on public.coord_rutas_decisiones_flota
  for select to authenticated using ((select public.coord_rutas_es_propietario()));
create policy coord_comandos_owner_select on public.coord_rutas_comandos
  for select to authenticated using (
    actor=(select auth.uid()) and (select public.coord_rutas_es_propietario())
  );
create policy coord_config_owner_select on public.coord_rutas_configuracion
  for select to authenticated using ((select public.coord_rutas_es_propietario()));

revoke all on table public.tms_operacion_bultos,
  public.coord_rutas_decisiones_flota,public.coord_rutas_comandos,
  public.coord_rutas_configuracion
  from public, anon, authenticated;
revoke all on sequence public.tms_operacion_bultos_id_seq,
  public.coord_rutas_decisiones_flota_id_seq,public.coord_rutas_comandos_id_seq
  from public, anon, authenticated;
grant select on table public.tms_operacion_bultos,
  public.coord_rutas_decisiones_flota,public.coord_rutas_comandos,
  public.coord_rutas_configuracion
  to authenticated, service_role;

-- Realtime no incorpora automáticamente tablas creadas por SQL. El servicio
-- cliente ya escucha estas superficies, por lo que se publican de forma idempotente.
do $$
declare v_table text;
begin
  foreach v_table in array array[
    'tms_operacion_bultos','coord_rutas_decisiones_flota','coord_rutas_comandos',
    'coord_rutas_configuracion'
  ] loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname='supabase_realtime' and schemaname='public' and tablename=v_table
    ) then
      execute format('alter publication supabase_realtime add table public.%I',v_table);
    end if;
  end loop;
end $$;

create or replace function public.coord_rutas_guardar_cubicaje(
  p_operacion_id bigint,
  p_grupos jsonb,
  p_peso_total_kg numeric default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_op public.tms_operaciones%rowtype;
  v_item jsonb;
  v_grupo integer := 0;
  v_cantidad integer;
  v_largo integer;
  v_ancho integer;
  v_alto integer;
  v_total_bultos integer := 0;
  v_total_m3 numeric(14,4) := 0;
  v_first jsonb;
begin
  if not public.coord_rutas_es_propietario() then raise exception 'Acceso privado denegado'; end if;
  if jsonb_typeof(p_grupos) <> 'array' or jsonb_array_length(p_grupos) not between 1 and 50 then
    raise exception 'Debes informar entre 1 y 50 grupos de bultos';
  end if;
  if p_peso_total_kg is not null and p_peso_total_kg <= 0 then
    raise exception 'El peso total debe ser mayor que cero';
  end if;

  select * into v_op from public.tms_operaciones where id=p_operacion_id for update;
  if v_op.id is null then raise exception 'N.V. no encontrada'; end if;
  if v_op.estado <> 'Shipping' then
    raise exception 'El cubicaje operativo solo se edita mientras la N.V. está en Shipping';
  end if;

  delete from public.tms_operacion_bultos where operacion_id=p_operacion_id;
  for v_item in select value from jsonb_array_elements(p_grupos)
  loop
    v_grupo := v_grupo + 1;
    v_cantidad := nullif(v_item->>'cantidad','')::integer;
    v_largo := nullif(v_item->>'largo_cm','')::integer;
    v_ancho := nullif(v_item->>'ancho_cm','')::integer;
    v_alto := nullif(v_item->>'alto_cm','')::integer;
    if v_cantidad not between 1 and 10000
       or v_largo not between 1 and 400
       or v_ancho not between 1 and 400
       or v_alto not between 1 and 400 then
      raise exception 'Grupo % inválido: cantidad 1-10000 y dimensiones 1-400 cm',v_grupo;
    end if;
    if v_first is null then v_first := v_item; end if;
    v_total_bultos := v_total_bultos + v_cantidad;
    v_total_m3 := v_total_m3 + round((v_cantidad::numeric*v_largo*v_ancho*v_alto)/1000000,4);
    insert into public.tms_operacion_bultos (
      operacion_id,grupo_orden,cantidad,length_cm,width_cm,height_cm,
      volume_unit_m3,volume_total_m3,source,verified,created_by
    ) values (
      p_operacion_id,v_grupo,v_cantidad,v_largo,v_ancho,v_alto,
      round((v_largo::numeric*v_ancho*v_alto)/1000000,6),
      round((v_cantidad::numeric*v_largo*v_ancho*v_alto)/1000000,4),
      'MANUAL_CCO',true,auth.uid()
    );
  end loop;

  if coalesce(v_op.bultos,0) > 0 and v_op.bultos <> v_total_bultos then
    raise exception 'Los grupos suman % bultos, pero la N.V. registra %',v_total_bultos,v_op.bultos;
  end if;

  update public.tms_operaciones set
    bultos=coalesce(nullif(bultos,0),v_total_bultos),
    bultos_igual_tamano=(jsonb_array_length(p_grupos)=1),
    largo_cm=(v_first->>'largo_cm')::integer,
    ancho_cm=(v_first->>'ancho_cm')::integer,
    alto_cm=(v_first->>'alto_cm')::integer,
    peso_total_kg=p_peso_total_kg,
    volumen_total_m3=round(v_total_m3,4),
    bultos_total=v_total_bultos,
    physical_data_source='MANUAL_VERIFIED',
    physical_data_verified_at=now(),
    physical_data_version=physical_data_version+1,
    cubicaje_actualizado_at=now(),cubicaje_actualizado_por=auth.uid(),updated_at=now()
  where id=p_operacion_id
  returning * into v_op;

  return jsonb_build_object(
    'ok',true,'operacion_id',v_op.id,'bultos',v_op.bultos,
    'peso_total_kg',v_op.peso_total_kg,'volumen_total_m3',v_op.volumen_total_m3,
    'bultos_igual_tamano',v_op.bultos_igual_tamano
  );
end;
$$;

create or replace function public.coord_rutas_guardar_flota(p_data jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id bigint := nullif(p_data->>'id','')::bigint;
  v_nombre text := nullif(regexp_replace(btrim(coalesce(p_data->>'nombre','')),'\s+',' ','g'),'');
  v_patente text := nullif(upper(regexp_replace(btrim(coalesce(p_data->>'patente','')),'\s+','','g')),'');
  v_row public.tms_vehiculos%rowtype;
begin
  if not private.coord_rutas_puede_flota() then raise exception 'Acceso privado denegado'; end if;
  if v_nombre is null or v_nombre !~* '[[:alpha:]áéíóúñü]' then raise exception 'Nombre de vehículo inválido'; end if;
  if v_patente is null or v_patente !~ '^[A-Z0-9-]{4,10}$' then raise exception 'Patente inválida'; end if;
  if coalesce(nullif(p_data->>'capacidad_kg','')::numeric,0) <= 0
     or coalesce(nullif(p_data->>'capacidad_m3','')::numeric,0) <= 0 then
    raise exception 'Capacidad de peso y volumen deben ser mayores que cero';
  end if;

  if v_id is null then
    insert into public.tms_vehiculos (
      patente,tipo,descripcion,capacidad_kg,capacidad_m3,costo_fijo_por_viaje,
      costo_variable_por_km,costo_por_hora,velocidad_promedio_kmh,autonomia_km,
      max_paradas,ocupacion_minima_pct,disponibilidad,activo,updated_by
    ) values (
      v_patente,coalesce(nullif(btrim(p_data->>'tipo'),''),'FLOTA_PROPIA'),v_nombre,
      (p_data->>'capacidad_kg')::numeric,(p_data->>'capacidad_m3')::numeric,
      coalesce(nullif(p_data->>'costo_fijo_por_viaje','')::numeric,0),
      coalesce(nullif(p_data->>'costo_variable_por_km','')::numeric,0),
      coalesce(nullif(p_data->>'costo_por_hora','')::numeric,0),
      coalesce(nullif(p_data->>'velocidad_promedio_kmh','')::numeric,40),
      nullif(p_data->>'autonomia_km','')::numeric,
      coalesce(nullif(p_data->>'max_paradas','')::smallint,12),
      coalesce(nullif(p_data->>'ocupacion_minima_pct','')::numeric,30),
      coalesce(nullif(p_data->>'disponibilidad',''),'DISPONIBLE'),
      coalesce(nullif(p_data->>'activo','')::boolean,true),auth.uid()
    ) returning * into v_row;
  else
    update public.tms_vehiculos set
      descripcion=v_nombre,patente=v_patente,
      capacidad_kg=(p_data->>'capacidad_kg')::numeric,
      capacidad_m3=(p_data->>'capacidad_m3')::numeric,
      costo_fijo_por_viaje=coalesce(nullif(p_data->>'costo_fijo_por_viaje','')::numeric,0),
      costo_variable_por_km=coalesce(nullif(p_data->>'costo_variable_por_km','')::numeric,0),
      costo_por_hora=coalesce(nullif(p_data->>'costo_por_hora','')::numeric,0),
      velocidad_promedio_kmh=coalesce(nullif(p_data->>'velocidad_promedio_kmh','')::numeric,40),
      autonomia_km=nullif(p_data->>'autonomia_km','')::numeric,
      max_paradas=coalesce(nullif(p_data->>'max_paradas','')::smallint,12),
      ocupacion_minima_pct=coalesce(nullif(p_data->>'ocupacion_minima_pct','')::numeric,30),
      disponibilidad=coalesce(nullif(p_data->>'disponibilidad',''),'DISPONIBLE'),
      activo=coalesce(nullif(p_data->>'activo','')::boolean,true),updated_by=auth.uid(),updated_at=now()
    where id=v_id returning * into v_row;
    if v_row.id is null then raise exception 'Vehículo no encontrado'; end if;
  end if;
  return to_jsonb(v_row) || jsonb_build_object(
    'nombre',coalesce(v_row.descripcion,v_row.tipo,v_row.patente)
  );
end;
$$;

create or replace function public.coord_rutas_capacidad_catalogo()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.coord_rutas_es_propietario() then raise exception 'Acceso privado denegado'; end if;
  return jsonb_build_object(
    'shipping',coalesce((
      select jsonb_agg(to_jsonb(x) order by x.urgente desc,x.fecha_compromiso nulls last,x.nv)
      from (
        select o.id as operacion_id,
          coalesce(o.nv_ptm::text,o.nv_orange,o.nv_farmapack,o.varios) as nv,
          o.cliente,o.urgente,o.fecha_compromiso,o.bultos,o.peso_total_kg,
          o.volumen_total_m3,o.bultos_igual_tamano,o.largo_cm,o.ancho_cm,o.alto_cm,
          coalesce(d.comuna,'') as comuna,coalesce(d.region,'') as region,
          public.coord_rutas_sector_comuna(d.comuna) as sector,
          coalesce((select jsonb_agg(jsonb_build_object(
              'id',g.id,'grupo',g.grupo_orden,'cantidad',g.cantidad,
              'largo_cm',g.length_cm,'ancho_cm',g.width_cm,'alto_cm',g.height_cm,
              'peso_unit_kg',g.peso_unit_kg,'volumen_m3',g.volume_total_m3,
              'packaging',g.packaging,'stackable',g.stackable,'source',g.source,
              'verified',g.verified,'version',g.version
            ) order by g.grupo_orden)
            from public.tms_operacion_bultos g where g.operacion_id=o.id),'[]'::jsonb) as grupos
        from public.tms_operaciones o
        left join lateral (
          select a.* from public.tms_direcciones a
          where public.coord_rutas_normalizar_nombre(a.razon_social)=public.coord_rutas_normalizar_nombre(o.cliente)
             or public.coord_rutas_normalizar_nombre(a.nombre)=public.coord_rutas_normalizar_nombre(o.cliente)
          order by (a.latitud is not null and a.longitud is not null) desc,a.updated_at desc nulls last
          limit 1
        ) d on true
        where o.estado='Shipping' and o.shipping_subestado is null
      ) x
    ),'[]'::jsonb),
    'flota',coalesce((select jsonb_agg(to_jsonb(f) || jsonb_build_object(
        'nombre',coalesce(f.descripcion,f.tipo,f.patente)
      ) order by f.activo desc,coalesce(f.descripcion,f.tipo,f.patente))
      from public.tms_vehiculos f where f.activo),'[]'::jsonb),
    'tarifas',coalesce((select jsonb_agg(to_jsonb(t) order by t.transportista_nombre,t.ambito)
      from public.coord_rutas_tarifas t where t.activo and current_date>=t.vigencia_desde
        and (t.vigencia_hasta is null or current_date<=t.vigencia_hasta)),'[]'::jsonb),
    'decisiones_recientes',coalesce((select jsonb_agg(to_jsonb(d) order by d.created_at desc)
      from (select * from public.coord_rutas_decisiones_flota order by created_at desc limit 20) d),'[]'::jsonb)
  );
end;
$$;

create or replace function public.coord_rutas_evaluar_alternativas(p_data jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_ids bigint[];
  v_count integer;
  v_bultos integer;
  v_peso numeric(14,2);
  v_volumen numeric(14,4);
  v_valor numeric(16,2);
  v_faltan_peso integer;
  v_faltan_volumen integer;
  v_urgente boolean;
  v_flota public.tms_vehiculos%rowtype;
  v_tarifa public.coord_rutas_tarifas%rowtype;
  v_km numeric(12,2) := greatest(coalesce(nullif(p_data->>'distancia_km','')::numeric,0),0);
  v_ocup_peso numeric(8,2);
  v_ocup_vol numeric(8,2);
  v_costo_propio numeric(16,2);
  v_costo_ext_base numeric(16,2);
  v_costo_externo numeric(16,2);
  v_tiempo_propio numeric(10,2);
  v_cabe boolean;
  v_recomendacion text;
  v_ahorro numeric(16,2);
  v_snapshot jsonb;
  v_saved public.coord_rutas_decisiones_flota%rowtype;
begin
  if not public.coord_rutas_es_propietario() then raise exception 'Acceso privado denegado'; end if;
  if jsonb_typeof(p_data->'operacion_ids') <> 'array' then raise exception 'Selecciona las N.V. a evaluar'; end if;
  select array_agg(distinct value::bigint) into v_ids
  from jsonb_array_elements_text(p_data->'operacion_ids');
  if coalesce(cardinality(v_ids),0) not between 1 and 100 then raise exception 'Selecciona entre 1 y 100 N.V.'; end if;

  select count(*),coalesce(sum(coalesce(o.bultos,0)),0)::integer,
    coalesce(sum(coalesce(o.peso_total_kg,0)),0),coalesce(sum(coalesce(o.volumen_total_m3,0)),0),
    coalesce(sum(coalesce(o.valor_factura,o.valor_nv,0)),0),
    count(*) filter(where coalesce(o.peso_total_kg,0)<=0),
    count(*) filter(where coalesce(o.volumen_total_m3,0)<=0),bool_or(o.urgente)
  into v_count,v_bultos,v_peso,v_volumen,v_valor,v_faltan_peso,v_faltan_volumen,v_urgente
  from public.tms_operaciones o where o.id=any(v_ids) and o.estado='Shipping' and o.shipping_subestado is null;
  if v_count <> cardinality(v_ids) then raise exception 'Una o más N.V. ya no están disponibles en Shipping'; end if;

  if nullif(p_data->>'flota_id','') is not null then
    select * into v_flota from public.tms_vehiculos
    where id=(p_data->>'flota_id')::bigint and activo;
    if v_flota.id is null then raise exception 'Vehículo no disponible'; end if;
    v_ocup_peso := round(100*v_peso/nullif(v_flota.capacidad_kg,0),2);
    v_ocup_vol := round(100*v_volumen/nullif(v_flota.capacidad_m3,0),2);
    v_cabe := v_peso<=v_flota.capacidad_kg and v_volumen<=v_flota.capacidad_m3
      and v_count<=v_flota.max_paradas;
    v_costo_propio := round(v_flota.costo_fijo_por_viaje+v_km*v_flota.costo_variable_por_km,2);
    v_tiempo_propio := round(v_km/nullif(v_flota.velocidad_promedio_kmh,0)+v_count*0.5,2);
  end if;

  if nullif(p_data->>'tarifa_id','') is not null then
    select * into v_tarifa from public.coord_rutas_tarifas
    where id=(p_data->>'tarifa_id')::bigint and activo
      and current_date>=vigencia_desde and (vigencia_hasta is null or current_date<=vigencia_hasta);
    if v_tarifa.id is null then raise exception 'Tarifa externa no disponible'; end if;
    v_costo_ext_base := greatest(v_tarifa.minimo,
      v_tarifa.cargo_base+v_tarifa.tarifa_nv*v_count+v_tarifa.tarifa_bulto*greatest(v_bultos,1)
      +v_tarifa.tarifa_kg*v_peso+v_tarifa.tarifa_km*v_km+v_tarifa.tarifa_m3*v_volumen);
    v_costo_externo := round(v_costo_ext_base*(1+v_tarifa.recargo_pct+
      case when v_urgente then v_tarifa.recargo_urgencia_pct else 0 end),2);
  end if;

  if v_faltan_peso>0 or v_faltan_volumen>0 then
    v_recomendacion := 'COMPLETAR_DATOS';
  elsif v_flota.id is null and v_tarifa.id is null then
    v_recomendacion := 'SIN_ALTERNATIVAS';
  elsif v_flota.id is null then
    v_recomendacion := 'EXTERNA_SIN_COMPARACION';
  elsif not v_cabe then
    v_recomendacion := 'EXTERNO_OBLIGATORIO';
  elsif v_tarifa.id is null then
    v_recomendacion := case when greatest(v_ocup_peso,v_ocup_vol)<v_flota.ocupacion_minima_pct
      then 'PROPIA_BAJA_OCUPACION' else 'PROPIA_SIN_COMPARACION' end;
  elsif v_costo_propio<v_costo_externo then
    v_recomendacion := case when greatest(v_ocup_peso,v_ocup_vol)<v_flota.ocupacion_minima_pct
      then 'CONSOLIDAR_ANTES_DE_SALIR' else 'PROPIA_RECOMENDADA' end;
  else
    v_recomendacion := 'EXTERNA_RECOMENDADA';
  end if;
  if v_costo_propio is not null and v_costo_externo is not null then
    v_ahorro := abs(v_costo_propio-v_costo_externo);
  end if;

  v_snapshot := jsonb_build_object(
    'operacion_ids',to_jsonb(v_ids),'nvs',v_count,'bultos',v_bultos,'peso_total_kg',v_peso,
    'volumen_total_m3',v_volumen,'valor_total',v_valor,'faltan_peso',v_faltan_peso,
    'faltan_volumen',v_faltan_volumen,'urgente',v_urgente,'distancia_km',v_km,
    'flota',case when v_flota.id is null then null else to_jsonb(v_flota) ||
      jsonb_build_object('nombre',coalesce(v_flota.descripcion,v_flota.tipo,v_flota.patente)) end,
    'tarifa',case when v_tarifa.id is null then null else to_jsonb(v_tarifa) end,
    'cabe',v_cabe,'ocupacion_peso_pct',v_ocup_peso,'ocupacion_volumen_pct',v_ocup_vol,
    'costo_propio',v_costo_propio,'costo_externo',v_costo_externo,
    'tiempo_propio_horas',v_tiempo_propio,'recomendacion',v_recomendacion
  );

  if coalesce((p_data->>'guardar')::boolean,false) then
    insert into public.coord_rutas_decisiones_flota (
      plan_id,operacion_ids,flota_id,tarifa_id,opcion_elegida,recomendacion,peso_total_kg,
      volumen_total_m3,bultos_total,distancia_km,costo_propio,costo_externo,ahorro_estimado,
      ocupacion_peso_pct,ocupacion_volumen_pct,snapshot,created_by
    ) values (
      nullif(p_data->>'plan_id','')::uuid,v_ids,v_flota.id,v_tarifa.id,
      coalesce(nullif(upper(p_data->>'opcion_elegida'),''),'PENDIENTE'),v_recomendacion,
      v_peso,v_volumen,v_bultos,v_km,v_costo_propio,v_costo_externo,v_ahorro,
      v_ocup_peso,v_ocup_vol,v_snapshot,auth.uid()
    ) returning * into v_saved;
  end if;
  return v_snapshot||jsonb_build_object('decision_id',v_saved.id,'ahorro_estimado',v_ahorro);
end;
$$;

-- Mantiene el alta/edición de tarifas alineada con los nuevos factores.
create or replace function public.coord_rutas_guardar_tarifa(p_data jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id bigint := nullif(p_data->>'id','')::bigint;
  v_transportista public.tms_panel_transportistas%rowtype;
  v_row public.coord_rutas_tarifas%rowtype;
  v_ambito text := upper(btrim(coalesce(p_data->>'ambito','')));
begin
  if not public.coord_rutas_es_propietario() then raise exception 'Acceso privado denegado'; end if;
  select * into v_transportista from public.tms_panel_transportistas
  where id=(p_data->>'transportista_id')::bigint and activo;
  if v_transportista.id is null then raise exception 'Transportista inválido'; end if;
  if v_ambito not in ('SANTIAGO','REGIONES','NACIONAL') then raise exception 'Ámbito inválido'; end if;

  if v_id is null then
    insert into public.coord_rutas_tarifas (
      transportista_id,transportista_nombre,ambito,region,localidad,cargo_base,
      tarifa_nv,tarifa_bulto,tarifa_kg,tarifa_km,tarifa_m3,minimo,recargo_pct,
      recargo_urgencia_pct,incluye_iva,vigencia_desde,vigencia_hasta,notas,created_by
    ) values (
      v_transportista.id,v_transportista.nombre,v_ambito,
      nullif(btrim(p_data->>'region'),''),nullif(btrim(p_data->>'localidad'),''),
      coalesce(nullif(p_data->>'cargo_base','')::numeric,0),
      coalesce(nullif(p_data->>'tarifa_nv','')::numeric,0),
      coalesce(nullif(p_data->>'tarifa_bulto','')::numeric,0),
      coalesce(nullif(p_data->>'tarifa_kg','')::numeric,0),
      coalesce(nullif(p_data->>'tarifa_km','')::numeric,0),
      coalesce(nullif(p_data->>'tarifa_m3','')::numeric,0),
      coalesce(nullif(p_data->>'minimo','')::numeric,0),
      coalesce(nullif(p_data->>'recargo_pct','')::numeric,0),
      coalesce(nullif(p_data->>'recargo_urgencia_pct','')::numeric,0),
      case when p_data ? 'incluye_iva' then (p_data->>'incluye_iva')::boolean else null end,
      coalesce(nullif(p_data->>'vigencia_desde','')::date,current_date),
      nullif(p_data->>'vigencia_hasta','')::date,
      nullif(btrim(p_data->>'notas'),''),auth.uid()
    ) returning * into v_row;
  else
    update public.coord_rutas_tarifas set
      transportista_id=v_transportista.id,transportista_nombre=v_transportista.nombre,
      ambito=v_ambito,region=nullif(btrim(p_data->>'region'),''),
      localidad=nullif(btrim(p_data->>'localidad'),''),
      cargo_base=coalesce(nullif(p_data->>'cargo_base','')::numeric,0),
      tarifa_nv=coalesce(nullif(p_data->>'tarifa_nv','')::numeric,0),
      tarifa_bulto=coalesce(nullif(p_data->>'tarifa_bulto','')::numeric,0),
      tarifa_kg=coalesce(nullif(p_data->>'tarifa_kg','')::numeric,0),
      tarifa_km=coalesce(nullif(p_data->>'tarifa_km','')::numeric,0),
      tarifa_m3=coalesce(nullif(p_data->>'tarifa_m3','')::numeric,0),
      minimo=coalesce(nullif(p_data->>'minimo','')::numeric,0),
      recargo_pct=coalesce(nullif(p_data->>'recargo_pct','')::numeric,0),
      recargo_urgencia_pct=coalesce(nullif(p_data->>'recargo_urgencia_pct','')::numeric,0),
      incluye_iva=case when p_data ? 'incluye_iva' then (p_data->>'incluye_iva')::boolean else null end,
      vigencia_desde=coalesce(nullif(p_data->>'vigencia_desde','')::date,current_date),
      vigencia_hasta=nullif(p_data->>'vigencia_hasta','')::date,
      notas=nullif(btrim(p_data->>'notas'),''),updated_at=now()
    where id=v_id returning * into v_row;
    if v_row.id is null then raise exception 'Tarifa no encontrada'; end if;
  end if;
  return to_jsonb(v_row);
end;
$$;

-- Amplía la calculadora externa vigente sin perder la modalidad de dos tramos.
create or replace function public.coord_rutas_calcular_costo(p_data jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_tarifa public.coord_rutas_tarifas%rowtype;
  v_nv integer := greatest(coalesce(nullif(p_data->>'cantidad_nv','')::integer,1),1);
  v_bultos integer := greatest(coalesce(nullif(p_data->>'bultos','')::integer,0),1);
  v_kilos numeric := greatest(coalesce(nullif(p_data->>'kilos','')::numeric,0),0);
  v_m3 numeric := greatest(coalesce(nullif(p_data->>'volumen_m3','')::numeric,0),0);
  v_km numeric := greatest(coalesce(nullif(p_data->>'distancia_km','')::numeric,0),0);
  v_valor numeric := greatest(coalesce(nullif(p_data->>'valor_nv_total','')::numeric,0),0);
  v_urgente boolean := coalesce(nullif(p_data->>'urgente','')::boolean,false);
  v_modalidad text := upper(coalesce(nullif(btrim(p_data->>'modalidad_costo'),''),'TODO_INCLUIDO'));
  v_tramo numeric := greatest(coalesce(nullif(p_data->>'costo_tramo_adicional','')::numeric,0),0);
  v_tarifa_subtotal numeric; v_subtotal numeric; v_recargo numeric;
  v_recargo_urgencia numeric; v_total numeric;
  v_saved public.coord_rutas_cotizaciones%rowtype;
begin
  if not public.coord_rutas_es_propietario() then raise exception 'Acceso privado denegado'; end if;
  if v_modalidad not in ('TODO_INCLUIDO','DOS_TRAMOS') then raise exception 'Modalidad de costo inválida'; end if;
  if v_modalidad='TODO_INCLUIDO' then v_tramo:=0; end if;
  if v_modalidad='DOS_TRAMOS' and v_tramo<=0 then
    raise exception 'El costo regional es obligatorio en modalidad de dos tramos';
  end if;
  select * into v_tarifa from public.coord_rutas_tarifas
  where id=(p_data->>'tarifa_id')::bigint and activo and current_date>=vigencia_desde
    and (vigencia_hasta is null or current_date<=vigencia_hasta);
  if v_tarifa.id is null then raise exception 'Tarifa no disponible o fuera de vigencia'; end if;

  v_tarifa_subtotal:=greatest(v_tarifa.minimo,v_tarifa.cargo_base+v_tarifa.tarifa_nv*v_nv
    +v_tarifa.tarifa_bulto*v_bultos+v_tarifa.tarifa_kg*v_kilos+v_tarifa.tarifa_km*v_km
    +v_tarifa.tarifa_m3*v_m3);
  v_subtotal:=v_tarifa_subtotal+v_tramo;
  v_recargo:=round(v_tarifa_subtotal*v_tarifa.recargo_pct,2);
  v_recargo_urgencia:=round(v_tarifa_subtotal*case when v_urgente then v_tarifa.recargo_urgencia_pct else 0 end,2);
  v_total:=round(v_subtotal+v_recargo+v_recargo_urgencia,2);

  if coalesce((p_data->>'guardar')::boolean,false) then
    insert into public.coord_rutas_cotizaciones (
      tarifa_id,nv_referencia,destino,region,ambito,cantidad_nv,bultos,kilos,volumen_m3,
      urgente,distancia_km,duracion_minutos,valor_nv_total,subtotal,recargo,recargo_urgencia,
      total,costo_por_nv,costo_por_bulto,porcentaje_venta,espera_motivo,espera_desde,
      modalidad_costo,costo_tramo_adicional,created_by
    ) values (
      v_tarifa.id,nullif(btrim(p_data->>'nv_referencia'),''),
      coalesce(nullif(btrim(p_data->>'destino'),''),'Sin destino'),nullif(btrim(p_data->>'region'),''),
      v_tarifa.ambito,v_nv,v_bultos,nullif(p_data->>'kilos','')::numeric,
      nullif(p_data->>'volumen_m3','')::numeric,v_urgente,nullif(p_data->>'distancia_km','')::numeric,
      nullif(p_data->>'duracion_minutos','')::integer,nullif(p_data->>'valor_nv_total','')::numeric,
      v_subtotal,v_recargo,v_recargo_urgencia,v_total,round(v_total/v_nv,2),round(v_total/v_bultos,2),
      case when v_valor>0 then round(100*v_total/v_valor,4) end,
      nullif(upper(btrim(p_data->>'espera_motivo')),''),
      case when nullif(p_data->>'espera_motivo','') is not null then now() end,
      v_modalidad,v_tramo,auth.uid()
    ) returning * into v_saved;
  end if;
  return jsonb_build_object(
    'cotizacion_id',v_saved.id,'tarifa',to_jsonb(v_tarifa),'modalidad_costo',v_modalidad,
    'formula',jsonb_build_object('cargo_base',v_tarifa.cargo_base,'por_nv',v_tarifa.tarifa_nv*v_nv,
      'por_bulto',v_tarifa.tarifa_bulto*v_bultos,'por_kg',v_tarifa.tarifa_kg*v_kilos,
      'por_m3',v_tarifa.tarifa_m3*v_m3,'por_km',v_tarifa.tarifa_km*v_km,
      'tramo_adicional',v_tramo,'minimo_aplicado',v_tarifa_subtotal>(v_tarifa.cargo_base+
      v_tarifa.tarifa_nv*v_nv+v_tarifa.tarifa_bulto*v_bultos+v_tarifa.tarifa_kg*v_kilos+
      v_tarifa.tarifa_m3*v_m3+v_tarifa.tarifa_km*v_km)),
    'subtotal',v_subtotal,'recargo',v_recargo,'recargo_urgencia',v_recargo_urgencia,
    'total',v_total,'costo_por_nv',round(v_total/v_nv,2),'costo_por_bulto',round(v_total/v_bultos,2),
    'porcentaje_venta',case when v_valor>0 then round(100*v_total/v_valor,4) end,
    'sla',jsonb_build_object('horas',48,'se_pausa',false,
      'espera_motivo',nullif(upper(btrim(p_data->>'espera_motivo')),''),
      'mensaje','La espera se atribuye, pero no detiene el SLA contractual.')
  );
end;
$$;

create or replace function public.coord_rutas_origen()
returns jsonb
language sql
stable
security definer
set search_path=''
as $$
  select case when private.coord_rutas_puede_ver() then
    coalesce((select to_jsonb(c) from public.coord_rutas_configuracion c where c.id),'null'::jsonb)
  else null end
$$;

create or replace function public.coord_rutas_guardar_origen(p_data jsonb)
returns jsonb
language plpgsql
security definer
set search_path=''
as $$
declare v_row public.coord_rutas_configuracion%rowtype;
begin
  if not private.coord_rutas_puede_gestionar() then raise exception 'Acceso privado denegado'; end if;
  if nullif(btrim(p_data->>'warehouse_name'),'') is null then raise exception 'Nombre de origen obligatorio'; end if;
  insert into public.coord_rutas_configuracion (
    id,warehouse_name,origin_lat,origin_lon,return_to_origin,source,verified_at,updated_by,updated_at
  ) values (
    true,btrim(p_data->>'warehouse_name'),(p_data->>'origin_lat')::double precision,
    (p_data->>'origin_lon')::double precision,coalesce((p_data->>'return_to_origin')::boolean,true),
    'ADMIN_VERIFIED',now(),auth.uid(),now()
  ) on conflict (id) do update set
    warehouse_name=excluded.warehouse_name,origin_lat=excluded.origin_lat,
    origin_lon=excluded.origin_lon,return_to_origin=excluded.return_to_origin,
    source=excluded.source,verified_at=excluded.verified_at,updated_by=excluded.updated_by,
    updated_at=excluded.updated_at
  returning * into v_row;
  return to_jsonb(v_row);
end;
$$;

create or replace function public.coord_rutas_confirmar_plan(
  p_plan_id uuid,
  p_expected_version bigint,
  p_idempotency_key text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_plan public.coord_rutas_planes%rowtype;
  v_vehicle public.tms_vehiculos%rowtype;
  v_command public.coord_rutas_comandos%rowtype;
  v_stop public.coord_rutas_paradas%rowtype;
  v_request_hash text;
  v_response jsonb;
  v_weight numeric(14,2);
  v_volume numeric(14,4);
  v_packages integer;
  v_stops integer;
  v_missing_weight integer;
  v_missing_volume integer;
  v_weight_pct numeric(8,2);
  v_volume_pct numeric(8,2);
  v_warnings jsonb := '[]'::jsonb;
begin
  if not private.coord_rutas_puede_despachar() then
    raise exception 'No tienes permiso para confirmar rutas' using errcode='42501';
  end if;
  if p_idempotency_key is null or length(btrim(p_idempotency_key)) not between 16 and 180 then
    raise exception 'Idempotency key inválida' using errcode='22023';
  end if;
  if p_expected_version is null or p_expected_version < 1 then
    raise exception 'expected_version es obligatorio' using errcode='22023';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(p_idempotency_key,0));
  v_request_hash := md5(p_plan_id::text||':'||p_expected_version::text);
  select * into v_command from public.coord_rutas_comandos
  where idempotency_key=p_idempotency_key;
  if v_command.id is not null then
    if v_command.request_hash<>v_request_hash then
      raise exception 'IDEMPOTENCY_KEY_REUSED' using errcode='23505';
    end if;
    return v_command.response;
  end if;

  select * into v_plan from public.coord_rutas_planes where id=p_plan_id for update;
  if v_plan.id is null then raise exception 'Plan no encontrado' using errcode='P0002'; end if;
  if v_plan.version<>p_expected_version then
    raise exception 'PLAN_VERSION_CONFLICT:%',v_plan.version using errcode='40001';
  end if;
  if v_plan.estado<>'BORRADOR' then raise exception 'El plan ya no está en borrador'; end if;

  select count(*),coalesce(sum(coalesce(o.bultos_total,o.bultos::integer)),0)::integer,
         sum(o.peso_total_kg),sum(o.volumen_total_m3),
         count(*) filter (where o.peso_total_kg is null),
         count(*) filter (where o.volumen_total_m3 is null)
    into v_stops,v_packages,v_weight,v_volume,v_missing_weight,v_missing_volume
  from public.coord_rutas_paradas p
  left join public.tms_operaciones o on o.id=p.operacion_id
  where p.plan_id=p_plan_id;
  if v_stops=0 then raise exception 'El plan no tiene paradas'; end if;

  if v_missing_weight>0 then v_warnings:=v_warnings||jsonb_build_array('PESO_DESCONOCIDO'); end if;
  if v_missing_volume>0 then v_warnings:=v_warnings||jsonb_build_array('VOLUMEN_DESCONOCIDO'); end if;
  if v_plan.vehiculo_id is not null then
    select * into v_vehicle from public.tms_vehiculos where id=v_plan.vehiculo_id and activo;
    if v_vehicle.id is null then raise exception 'Vehículo no disponible'; end if;
    if v_weight is not null and v_vehicle.capacidad_kg is not null then
      v_weight_pct:=round(100*v_weight/nullif(v_vehicle.capacidad_kg,0),2);
    end if;
    if v_volume is not null and v_vehicle.capacidad_m3 is not null then
      v_volume_pct:=round(100*v_volume/nullif(v_vehicle.capacidad_m3,0),2);
    end if;
    if coalesce(v_weight_pct,0)>100 or coalesce(v_volume_pct,0)>100 then
      raise exception 'CAPACITY_OVERLOAD';
    end if;
    if greatest(coalesce(v_weight_pct,0),coalesce(v_volume_pct,0))>=95 then
      v_warnings:=v_warnings||jsonb_build_array('CAPACITY_PHYSICAL_REVIEW');
    end if;
  end if;

  v_response:=jsonb_build_object(
    'ok',true,'plan_id',p_plan_id,'version',v_plan.version+1,
    'stops',v_stops,'packages',v_packages,'weight_kg',v_weight,'volume_m3',v_volume,
    'weight_pct',v_weight_pct,'volume_pct',v_volume_pct,'warnings',v_warnings,
    'confirmed_at',now()
  );

  for v_stop in select * from public.coord_rutas_paradas
    where plan_id=p_plan_id and tipo='NV' order by orden
  loop
    insert into public.tms_transporte_ordenes (
      folio,oper_id,nv,cliente,direccion,comuna,estado,vehiculo_id,conductor_id,
      fecha_programada,plan_coord_id,parada_coord_id,updated_by
    ) values (
      'OT-'||to_char(clock_timestamp(),'YYYYMMDDHH24MISSMS')||'-'||v_stop.orden,
      v_stop.operacion_id,v_stop.nv,v_stop.cliente,v_stop.direccion,v_stop.comuna,
      'pendiente_asignacion',v_plan.vehiculo_id,v_plan.conductor_id,v_plan.fecha,
      v_plan.id,v_stop.id,(select auth.uid())::text
    ) on conflict (parada_coord_id) where parada_coord_id is not null do nothing;
  end loop;

  update public.coord_rutas_planes set
    estado='CONFIRMADA',peso_total_kg=v_weight,volumen_total_m3=v_volume,
    bultos_total=v_packages,paradas_total=v_stops,ocupacion_peso_pct=v_weight_pct,
    ocupacion_volumen_pct=v_volume_pct,confirmed_snapshot=v_response,
    version=version+1,updated_at=now()
  where id=p_plan_id;

  insert into public.coord_rutas_comandos (
    idempotency_key,scope,entity_id,request_hash,response,actor
  ) values (p_idempotency_key,'CONFIRM_ROUTE',p_plan_id::text,v_request_hash,v_response,auth.uid());
  return v_response;
end;
$$;

revoke all on function public.coord_rutas_guardar_cubicaje(bigint,jsonb,numeric) from public,anon;
revoke all on function public.coord_rutas_guardar_flota(jsonb) from public,anon;
revoke all on function public.coord_rutas_capacidad_catalogo() from public,anon;
revoke all on function public.coord_rutas_evaluar_alternativas(jsonb) from public,anon;
revoke all on function public.coord_rutas_calcular_costo(jsonb) from public,anon;
revoke all on function public.coord_rutas_confirmar_plan(uuid,bigint,text) from public,anon;
revoke all on function public.coord_rutas_origen() from public,anon;
revoke all on function public.coord_rutas_guardar_origen(jsonb) from public,anon;
revoke all on function public.coord_rutas_guardar_tarifa(jsonb) from public,anon;
grant execute on function public.coord_rutas_guardar_cubicaje(bigint,jsonb,numeric) to authenticated,service_role;
grant execute on function public.coord_rutas_guardar_flota(jsonb) to authenticated,service_role;
grant execute on function public.coord_rutas_capacidad_catalogo() to authenticated,service_role;
grant execute on function public.coord_rutas_evaluar_alternativas(jsonb) to authenticated,service_role;
grant execute on function public.coord_rutas_calcular_costo(jsonb) to authenticated,service_role;
grant execute on function public.coord_rutas_confirmar_plan(uuid,bigint,text) to authenticated,service_role;
grant execute on function public.coord_rutas_origen() to authenticated,service_role;
grant execute on function public.coord_rutas_guardar_origen(jsonb) to authenticated,service_role;
grant execute on function public.coord_rutas_guardar_tarifa(jsonb) to authenticated,service_role;

comment on table public.tms_operacion_bultos is
  'Datos físicos versionados por operación; describen carga y no modifican inventario.';
comment on table public.tms_vehiculos is
  'SSOT de vehículos TMS, extendido con capacidad, dimensiones y costos operacionales.';
comment on table public.coord_rutas_decisiones_flota is
  'Auditoría de comparaciones y decisiones propia versus externa.';
