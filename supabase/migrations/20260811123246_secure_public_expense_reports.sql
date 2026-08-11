-- Rendiciones publicas seguras.
-- El enlace publico solo conoce un token aleatorio de 256 bits. La base guarda
-- exclusivamente SHA-256(token). Las fotografias viven en Storage privado y se
-- sirven con URLs firmadas de corta duracion desde la Edge Function.

begin;

-- ---------------------------------------------------------------------------
-- Permisos IAM
-- ---------------------------------------------------------------------------
insert into public.tms_permisos (id, nombre, modulo)
values
  ('view_rendiciones', 'Rendiciones - ver y exportar', 'Administracion'),
  ('manage_rendiciones', 'Rendiciones - administrar enlaces y catalogos', 'Administracion')
on conflict (id) do update
set nombre = excluded.nombre, modulo = excluded.modulo;

update public.tms_roles
set permisos_json = coalesce(permisos_json, '[]'::jsonb) || '["view_rendiciones","manage_rendiciones"]'::jsonb
where id = 'ADMIN'
  and not (coalesce(permisos_json, '[]'::jsonb) @> '["view_rendiciones","manage_rendiciones"]'::jsonb);

insert into iam.permissions (codigo, recurso, accion, descripcion, grupo, es_sistema)
values
  ('view_rendiciones', 'rendiciones', 'read', 'Ver y exportar rendiciones', 'Administracion', true),
  ('manage_rendiciones', 'rendiciones', 'manage', 'Administrar enlaces y catalogos de rendiciones', 'Administracion', true)
on conflict (codigo) do update
set recurso = excluded.recurso,
    accion = excluded.accion,
    descripcion = excluded.descripcion,
    grupo = excluded.grupo;

insert into iam.role_permissions (role_id, permission_id)
select r.id, p.id
from iam.roles r
cross join iam.permissions p
where r.codigo = 'ADMIN'
  and p.codigo in ('view_rendiciones', 'manage_rendiciones')
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- Catalogos privados
-- ---------------------------------------------------------------------------
create table if not exists public.rendicion_centros_costo (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique,
  nombre text not null,
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint rendicion_cc_codigo_valido check (codigo ~ '^[A-Za-z0-9][A-Za-z0-9._ -]{0,39}$'),
  constraint rendicion_cc_nombre_letras check (nombre ~* '[[:alpha:]áéíóúñü]')
);

create table if not exists public.rendicion_colaboradores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references public.tms_usuarios(id) on delete set null,
  nombre text not null,
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint rendicion_colaborador_nombre_letras check (nombre ~* '[[:alpha:]áéíóúñü]')
);

create table if not exists public.rendicion_categorias (
  codigo text primary key,
  nombre text not null unique,
  activo boolean not null default true
);

create table if not exists public.rendicion_subcategorias (
  codigo text primary key,
  nombre text not null unique,
  activo boolean not null default true
);

create table if not exists public.rendicion_categoria_subcategoria (
  categoria_codigo text not null references public.rendicion_categorias(codigo) on delete cascade,
  subcategoria_codigo text not null references public.rendicion_subcategorias(codigo) on delete cascade,
  primary key (categoria_codigo, subcategoria_codigo)
);

insert into public.rendicion_centros_costo (codigo, nombre)
select distinct btrim(centro_costo), 'Centro ' || btrim(centro_costo)
from public.tms_operaciones
where btrim(coalesce(centro_costo, '')) ~ '^[A-Za-z0-9][A-Za-z0-9._ -]{0,39}$'
on conflict (codigo) do nothing;

insert into public.rendicion_colaboradores (user_id, nombre)
select id, btrim(nombre)
from public.tms_usuarios
where coalesce(activo, true)
  and btrim(coalesce(nombre, '')) ~* '[[:alpha:]áéíóúñü]'
on conflict (user_id) do update set nombre = excluded.nombre, activo = true, updated_at = now();

insert into public.rendicion_colaboradores (nombre)
select v.nombre
from (values
  ('Juan Marchant'), ('Cesar Tapia'), ('Gisselle Romero'), ('Cristopher Cabezas')
) as v(nombre)
where not exists (
  select 1 from public.rendicion_colaboradores c where lower(c.nombre) = lower(v.nombre)
);

insert into public.rendicion_categorias (codigo, nombre) values
  ('operaciones', 'Operaciones'),
  ('bodega', 'Bodega'),
  ('logistica', 'Logística'),
  ('postventa', 'Postventa'),
  ('inventario', 'Inventario'),
  ('calidad', 'Calidad'),
  ('comercial', 'Comercial'),
  ('administracion', 'Administración')
on conflict (codigo) do update set nombre = excluded.nombre, activo = true;

insert into public.rendicion_subcategorias (codigo, nombre) values
  ('colacion', 'Colación'), ('viaticos', 'Viáticos'), ('alojamiento', 'Alojamiento'),
  ('movilizacion', 'Movilización'), ('insumos_bodega', 'Insumos bodega'),
  ('embalaje', 'Embalaje'), ('epp', 'EPP'), ('aseo', 'Aseo'),
  ('transporte', 'Transporte'), ('mp_camioneta', 'MP Camioneta'),
  ('combustible', 'Combustible'), ('peajes_tag', 'Peajes/TAG'),
  ('estacionamiento', 'Estacionamiento'), ('flete_courier', 'Flete/Courier')
on conflict (codigo) do update set nombre = excluded.nombre, activo = true;

insert into public.rendicion_categoria_subcategoria (categoria_codigo, subcategoria_codigo)
values
  ('operaciones','colacion'), ('operaciones','viaticos'), ('operaciones','alojamiento'),
  ('operaciones','movilizacion'), ('operaciones','transporte'),
  ('bodega','insumos_bodega'), ('bodega','embalaje'), ('bodega','epp'), ('bodega','aseo'),
  ('logistica','transporte'), ('logistica','mp_camioneta'), ('logistica','combustible'),
  ('logistica','peajes_tag'), ('logistica','estacionamiento'), ('logistica','flete_courier'),
  ('postventa','colacion'), ('postventa','viaticos'), ('postventa','alojamiento'),
  ('postventa','movilizacion'), ('postventa','transporte'), ('postventa','flete_courier'),
  ('inventario','insumos_bodega'), ('inventario','embalaje'), ('inventario','epp'), ('inventario','aseo'),
  ('calidad','colacion'), ('calidad','viaticos'), ('calidad','alojamiento'),
  ('calidad','movilizacion'), ('calidad','epp'),
  ('comercial','colacion'), ('comercial','viaticos'), ('comercial','alojamiento'),
  ('comercial','movilizacion'), ('comercial','transporte'), ('comercial','estacionamiento'),
  ('administracion','colacion'), ('administracion','viaticos'), ('administracion','alojamiento'),
  ('administracion','movilizacion'), ('administracion','aseo'), ('administracion','transporte'),
  ('administracion','estacionamiento')
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- Enlaces, cabecera, detalle y evidencias
-- ---------------------------------------------------------------------------
create table if not exists public.rendicion_public_links (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  token_hash text not null unique,
  activo boolean not null default true,
  expires_at timestamptz,
  max_submissions integer check (max_submissions is null or max_submissions between 1 and 10000),
  submissions_count integer not null default 0 check (submissions_count >= 0),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint rendicion_link_nombre_letras check (nombre ~* '[[:alpha:]áéíóúñü]'),
  constraint rendicion_link_hash_hex check (token_hash ~ '^[0-9a-f]{64}$')
);

create table if not exists public.rendiciones (
  id uuid primary key default gen_random_uuid(),
  folio bigint generated always as identity unique,
  public_link_id uuid not null references public.rendicion_public_links(id),
  view_token_hash text not null unique,
  fecha_rendicion date not null default (now() at time zone 'America/Santiago')::date,
  centro_costo_id uuid not null references public.rendicion_centros_costo(id),
  centro_costo_codigo text not null,
  centro_costo_nombre text not null,
  responsable_id uuid not null references public.rendicion_colaboradores(id),
  responsable_nombre text not null,
  tipo_fondo text not null,
  detalle text,
  estado text not null default 'Enviada',
  total numeric(14,2) not null default 0,
  created_ip text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint rendicion_view_hash_hex check (view_token_hash ~ '^[0-9a-f]{64}$'),
  constraint rendicion_tipo_fondo_check check (tipo_fondo in ('Fondo por rendir','Rendición de gastos','Fondo fijo','Anticipo','Reembolso')),
  constraint rendicion_estado_check check (estado in ('Enviada','En revision','Aprobada','Rechazada')),
  constraint rendicion_total_check check (total >= 0),
  constraint rendicion_detalle_letras check (detalle is null or detalle ~* '[[:alpha:]áéíóúñü]')
);

create table if not exists public.rendicion_items (
  id uuid primary key default gen_random_uuid(),
  rendicion_id uuid not null references public.rendiciones(id) on delete cascade,
  orden smallint not null check (orden between 1 and 15),
  fecha date not null,
  categoria_codigo text not null,
  subcategoria_codigo text not null,
  categoria_nombre text not null,
  subcategoria_nombre text not null,
  descripcion text not null,
  monto numeric(14,2) not null,
  tipo_documento text not null,
  numero_documento text,
  created_at timestamptz not null default now(),
  unique (rendicion_id, orden),
  foreign key (categoria_codigo, subcategoria_codigo)
    references public.rendicion_categoria_subcategoria(categoria_codigo, subcategoria_codigo),
  constraint rendicion_item_descripcion_letras check (descripcion ~* '[[:alpha:]áéíóúñü]'),
  constraint rendicion_item_monto_positivo check (monto > 0 and monto <= 999999999),
  constraint rendicion_item_documento_check check (tipo_documento in (
    'Factura','Boleta','Boleta de honorarios','Voucher/comprobante',
    'Comprobante de transferencia','Sin documento'
  )),
  constraint rendicion_item_numero_largo check (numero_documento is null or length(numero_documento) <= 80)
);

create table if not exists public.rendicion_fotos (
  id uuid primary key default gen_random_uuid(),
  rendicion_id uuid not null references public.rendiciones(id) on delete cascade,
  item_id uuid not null references public.rendicion_items(id) on delete cascade,
  storage_path text not null unique,
  mime_type text not null,
  bytes integer not null,
  created_at timestamptz not null default now(),
  constraint rendicion_foto_mime_check check (mime_type in ('image/jpeg','image/png','image/webp','image/heic','image/heif')),
  constraint rendicion_foto_size_check check (bytes between 1 and 1572864)
);

create table if not exists public.rendicion_public_log (
  id bigint generated always as identity primary key,
  link_id uuid references public.rendicion_public_links(id) on delete set null,
  rendicion_id uuid references public.rendiciones(id) on delete set null,
  ip text,
  accion text not null,
  created_at timestamptz not null default now(),
  constraint rendicion_log_accion_check check (accion in ('bootstrap','submit','upload','view'))
);

create index if not exists rendiciones_created_idx on public.rendiciones(created_at desc);
create index if not exists rendiciones_responsable_idx on public.rendiciones(responsable_id, created_at desc);
create index if not exists rendicion_items_report_idx on public.rendicion_items(rendicion_id, orden);
create index if not exists rendicion_fotos_report_idx on public.rendicion_fotos(rendicion_id, item_id);
create index if not exists rendicion_log_ip_idx on public.rendicion_public_log(ip, created_at desc);
create index if not exists rendicion_log_link_idx on public.rendicion_public_log(link_id, created_at desc);

alter table public.rendicion_centros_costo enable row level security;
alter table public.rendicion_colaboradores enable row level security;
alter table public.rendicion_categorias enable row level security;
alter table public.rendicion_subcategorias enable row level security;
alter table public.rendicion_categoria_subcategoria enable row level security;
alter table public.rendicion_public_links enable row level security;
alter table public.rendiciones enable row level security;
alter table public.rendicion_items enable row level security;
alter table public.rendicion_fotos enable row level security;
alter table public.rendicion_public_log enable row level security;

-- Los datos se leen por RPC o por la Edge Function. Solo las evidencias se
-- firman desde el cliente autenticado, con permiso explicito.
drop policy if exists rendiciones_select_admin on public.rendiciones;
create policy rendiciones_select_admin on public.rendiciones for select to authenticated
using (coalesce(public.usuario_tiene_algun_permiso(array['view_rendiciones','manage_rendiciones']), false));
drop policy if exists rendicion_items_select_admin on public.rendicion_items;
create policy rendicion_items_select_admin on public.rendicion_items for select to authenticated
using (coalesce(public.usuario_tiene_algun_permiso(array['view_rendiciones','manage_rendiciones']), false));
drop policy if exists rendicion_fotos_select_admin on public.rendicion_fotos;
create policy rendicion_fotos_select_admin on public.rendicion_fotos for select to authenticated
using (coalesce(public.usuario_tiene_algun_permiso(array['view_rendiciones','manage_rendiciones']), false));

-- Bucket privado: 1.5 MB por fotografia y solo formatos de imagen.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'rendicion-evidencias', 'rendicion-evidencias', false, 1572864,
  array['image/jpeg','image/png','image/webp','image/heic','image/heif']
)
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists rendicion_evidencias_select_admin on storage.objects;
create policy rendicion_evidencias_select_admin on storage.objects
for select to authenticated
using (
  bucket_id = 'rendicion-evidencias'
  and coalesce(public.usuario_tiene_algun_permiso(array['view_rendiciones','manage_rendiciones']), false)
);

-- ---------------------------------------------------------------------------
-- Validacion y alta transaccional publica (solo service_role)
-- ---------------------------------------------------------------------------
create or replace function public.crear_rendicion_publica(
  p_link_hash text,
  p_view_hash text,
  p_payload jsonb,
  p_ip text default null
) returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_link public.rendicion_public_links%rowtype;
  v_cc public.rendicion_centros_costo%rowtype;
  v_resp public.rendicion_colaboradores%rowtype;
  v_report public.rendiciones%rowtype;
  v_item jsonb;
  v_item_id uuid;
  v_items jsonb := '[]'::jsonb;
  v_count integer;
  v_order integer := 0;
  v_total numeric(14,2) := 0;
  v_desc text;
  v_doc_num text;
  v_detail text;
  v_fecha date;
  v_monto numeric;
  v_cat record;
  v_today date := (now() at time zone 'America/Santiago')::date;
begin
  if p_link_hash !~ '^[0-9a-f]{64}$' or p_view_hash !~ '^[0-9a-f]{64}$' then
    raise exception 'Token invalido';
  end if;

  select * into v_link from public.rendicion_public_links
  where token_hash = p_link_hash
  for update;
  if v_link.id is null or not v_link.activo or (v_link.expires_at is not null and v_link.expires_at <= now()) then
    raise exception 'El enlace no existe, expiro o fue desactivado';
  end if;
  if v_link.max_submissions is not null and v_link.submissions_count >= v_link.max_submissions then
    raise exception 'El enlace alcanzo su limite de envios';
  end if;

  if p_ip is not null and btrim(p_ip) <> '' and (
    select count(*) from public.rendicion_public_log
    where ip = p_ip and accion = 'submit' and created_at > now() - interval '1 hour'
  ) >= 5 then
    raise exception 'Demasiados envios desde esta conexion. Intenta mas tarde';
  end if;
  if (
    select count(*) from public.rendicion_public_log
    where link_id = v_link.id and accion = 'submit' and created_at > now() - interval '1 day'
  ) >= 50 then
    raise exception 'El enlace alcanzo el limite diario de seguridad';
  end if;

  select * into v_cc from public.rendicion_centros_costo
  where id = nullif(p_payload->>'centro_costo_id','')::uuid and activo;
  if v_cc.id is null then raise exception 'Centro de costo invalido'; end if;

  select * into v_resp from public.rendicion_colaboradores
  where id = nullif(p_payload->>'responsable_id','')::uuid and activo;
  if v_resp.id is null then raise exception 'Responsable invalido'; end if;

  if coalesce(p_payload->>'tipo_fondo','') not in
    ('Fondo por rendir','Rendición de gastos','Fondo fijo','Anticipo','Reembolso') then
    raise exception 'Tipo de fondo invalido';
  end if;

  v_fecha := coalesce(nullif(p_payload->>'fecha_rendicion','')::date, v_today);
  if v_fecha > v_today or v_fecha < v_today - 730 then
    raise exception 'Fecha de rendicion fuera del rango permitido';
  end if;

  v_detail := regexp_replace(btrim(translate(coalesce(p_payload->>'detalle',''), chr(8203)||chr(8204)||chr(8205)||chr(65279), '')), '\s+', ' ', 'g');
  if v_detail = '' then v_detail := null; end if;
  if v_detail is not null and (length(v_detail) > 500 or v_detail !~* '[[:alpha:]áéíóúñü]') then
    raise exception 'El detalle debe contener texto real y tener hasta 500 caracteres';
  end if;

  v_count := jsonb_array_length(coalesce(p_payload->'items','[]'::jsonb));
  if v_count < 1 or v_count > 15 then
    raise exception 'La rendicion debe tener entre 1 y 15 gastos';
  end if;

  insert into public.rendiciones (
    public_link_id, view_token_hash, fecha_rendicion,
    centro_costo_id, centro_costo_codigo, centro_costo_nombre,
    responsable_id, responsable_nombre, tipo_fondo, detalle, created_ip
  ) values (
    v_link.id, p_view_hash, v_fecha,
    v_cc.id, v_cc.codigo, v_cc.nombre,
    v_resp.id, v_resp.nombre, p_payload->>'tipo_fondo', v_detail,
    nullif(left(btrim(coalesce(p_ip,'')), 120), '')
  ) returning * into v_report;

  for v_item in select value from jsonb_array_elements(p_payload->'items') loop
    v_order := v_order + 1;
    v_desc := regexp_replace(btrim(translate(coalesce(v_item->>'descripcion',''), chr(8203)||chr(8204)||chr(8205)||chr(65279), '')), '\s+', ' ', 'g');
    if length(v_desc) < 3 or length(v_desc) > 800 or v_desc !~* '[[:alpha:]áéíóúñü]' then
      raise exception 'La descripcion del gasto % debe contener letras reales (3 a 800 caracteres)', v_order;
    end if;

    v_fecha := nullif(v_item->>'fecha','')::date;
    if v_fecha is null or v_fecha > v_today or v_fecha < v_today - 730 then
      raise exception 'Fecha invalida en el gasto %', v_order;
    end if;

    begin v_monto := (v_item->>'monto')::numeric; exception when others then v_monto := null; end;
    if v_monto is null or v_monto <= 0 or v_monto > 999999999 then
      raise exception 'Monto invalido en el gasto %', v_order;
    end if;

    select c.nombre as categoria_nombre, s.nombre as subcategoria_nombre into v_cat
    from public.rendicion_categoria_subcategoria cs
    join public.rendicion_categorias c on c.codigo = cs.categoria_codigo and c.activo
    join public.rendicion_subcategorias s on s.codigo = cs.subcategoria_codigo and s.activo
    where cs.categoria_codigo = v_item->>'categoria_codigo'
      and cs.subcategoria_codigo = v_item->>'subcategoria_codigo';
    if v_cat.categoria_nombre is null then raise exception 'Categoria/subcategoria invalida en el gasto %', v_order; end if;

    if coalesce(v_item->>'tipo_documento','') not in (
      'Factura','Boleta','Boleta de honorarios','Voucher/comprobante',
      'Comprobante de transferencia','Sin documento'
    ) then raise exception 'Tipo de documento invalido en el gasto %', v_order; end if;

    v_doc_num := regexp_replace(btrim(translate(coalesce(v_item->>'numero_documento',''), chr(8203)||chr(8204)||chr(8205)||chr(65279), '')), '\s+', ' ', 'g');
    if v_doc_num = '' then v_doc_num := null; end if;
    if v_doc_num is not null and (length(v_doc_num) > 80 or v_doc_num !~ '[[:alnum:]]') then
      raise exception 'Numero de documento invalido en el gasto %', v_order;
    end if;

    insert into public.rendicion_items (
      rendicion_id, orden, fecha, categoria_codigo, subcategoria_codigo,
      categoria_nombre, subcategoria_nombre, descripcion, monto,
      tipo_documento, numero_documento
    ) values (
      v_report.id, v_order, v_fecha, v_item->>'categoria_codigo', v_item->>'subcategoria_codigo',
      v_cat.categoria_nombre, v_cat.subcategoria_nombre, v_desc, round(v_monto, 2),
      v_item->>'tipo_documento', v_doc_num
    ) returning id into v_item_id;

    v_items := v_items || jsonb_build_array(jsonb_build_object(
      'client_id', left(coalesce(v_item->>'client_id',''), 80),
      'id', v_item_id
    ));
    v_total := v_total + round(v_monto, 2);
  end loop;

  update public.rendiciones set total = v_total, updated_at = now() where id = v_report.id;
  update public.rendicion_public_links
  set submissions_count = submissions_count + 1, updated_at = now()
  where id = v_link.id;
  insert into public.rendicion_public_log (link_id, rendicion_id, ip, accion)
  values (v_link.id, v_report.id, nullif(left(btrim(coalesce(p_ip,'')),120),''), 'submit');

  return jsonb_build_object(
    'id', v_report.id,
    'folio', 'REN-' || extract(year from v_report.fecha_rendicion)::int || '-' || lpad(v_report.folio::text, 6, '0'),
    'items', v_items,
    'total', v_total
  );
end;
$$;

revoke all on function public.crear_rendicion_publica(text,text,jsonb,text) from public, anon, authenticated;
grant execute on function public.crear_rendicion_publica(text,text,jsonb,text) to service_role;

-- ---------------------------------------------------------------------------
-- RPC internas para administracion
-- ---------------------------------------------------------------------------
create or replace function public.rendicion_admin_dashboard(p_limit integer default 100)
returns jsonb
language plpgsql stable security definer set search_path = public
as $$
declare v_ok boolean; v_result jsonb;
begin
  v_ok := coalesce(public.usuario_tiene_algun_permiso(array['view_rendiciones','manage_rendiciones']), false);
  if not v_ok then raise exception 'Acceso denegado'; end if;
  select jsonb_build_object(
    'rendiciones', coalesce((select jsonb_agg(to_jsonb(x) order by x.created_at desc) from (
      select r.id,
             'REN-' || extract(year from r.fecha_rendicion)::int || '-' || lpad(r.folio::text,6,'0') as folio,
             r.fecha_rendicion, r.responsable_nombre, r.centro_costo_codigo,
             r.centro_costo_nombre, r.tipo_fondo, r.estado, r.total, r.created_at,
             (select count(*) from public.rendicion_items i where i.rendicion_id=r.id) as items,
             (select count(*) from public.rendicion_fotos f where f.rendicion_id=r.id) as fotos
      from public.rendiciones r order by r.created_at desc limit greatest(1,least(coalesce(p_limit,100),500))
    ) x), '[]'::jsonb),
    'links', coalesce((select jsonb_agg(to_jsonb(l) order by l.created_at desc) from (
      select id,nombre,activo,expires_at,max_submissions,submissions_count,created_at
      from public.rendicion_public_links order by created_at desc limit 100
    ) l), '[]'::jsonb),
    'centros', coalesce((select jsonb_agg(to_jsonb(c) order by c.codigo) from (
      select id,codigo,nombre,activo from public.rendicion_centros_costo
    ) c), '[]'::jsonb),
    'colaboradores', coalesce((select jsonb_agg(to_jsonb(c) order by c.nombre) from (
      select id,nombre,activo from public.rendicion_colaboradores
    ) c), '[]'::jsonb),
    'storage', jsonb_build_object(
      'archivos', (select count(*) from public.rendicion_fotos),
      'rendicion_bytes', (select coalesce(sum(bytes),0) from public.rendicion_fotos),
      'bytes', (select coalesce(sum((metadata->>'size')::bigint),0) from storage.objects)
    )
  ) into v_result;
  return v_result;
end;
$$;

create or replace function public.rendicion_admin_detalle(p_id uuid)
returns jsonb
language plpgsql stable security definer set search_path = public
as $$
declare v_ok boolean; v_result jsonb;
begin
  v_ok := coalesce(public.usuario_tiene_algun_permiso(array['view_rendiciones','manage_rendiciones']), false);
  if not v_ok then raise exception 'Acceso denegado'; end if;
  select jsonb_build_object(
    'rendicion', (to_jsonb(r) - 'view_token_hash') || jsonb_build_object(
      'folio_texto','REN-' || extract(year from r.fecha_rendicion)::int || '-' || lpad(r.folio::text,6,'0')
    ),
    'items', coalesce((select jsonb_agg(to_jsonb(i) order by i.orden) from public.rendicion_items i where i.rendicion_id=r.id),'[]'::jsonb),
    'fotos', coalesce((select jsonb_agg(to_jsonb(f) order by f.created_at) from public.rendicion_fotos f where f.rendicion_id=r.id),'[]'::jsonb)
  ) into v_result
  from public.rendiciones r where r.id = p_id;
  if v_result is null then raise exception 'Rendicion no encontrada'; end if;
  return v_result;
end;
$$;

create or replace function public.rendicion_admin_crear_link(
  p_nombre text,
  p_expires_at timestamptz default null,
  p_max_submissions integer default null
) returns jsonb
language plpgsql security definer set search_path = public, extensions
as $$
declare v_token text; v_row public.rendicion_public_links%rowtype; v_nombre text;
begin
  if not coalesce(public.usuario_tiene_algun_permiso(array['manage_rendiciones']), false) then
    raise exception 'Acceso denegado';
  end if;
  v_nombre := regexp_replace(btrim(translate(coalesce(p_nombre,''), chr(8203)||chr(8204)||chr(8205)||chr(65279), '')), '\s+', ' ', 'g');
  if length(v_nombre) < 3 or length(v_nombre) > 120 or v_nombre !~* '[[:alpha:]áéíóúñü]' then
    raise exception 'El nombre del enlace debe contener letras reales';
  end if;
  if p_expires_at is not null and p_expires_at <= now() then raise exception 'La expiracion debe ser futura'; end if;
  if p_max_submissions is not null and (p_max_submissions < 1 or p_max_submissions > 10000) then
    raise exception 'Limite de envios invalido';
  end if;
  v_token := encode(gen_random_bytes(32), 'hex');
  insert into public.rendicion_public_links
    (nombre,token_hash,expires_at,max_submissions,created_by)
  values
    (v_nombre,encode(digest(convert_to(v_token,'UTF8'),'sha256'),'hex'),p_expires_at,p_max_submissions,auth.uid())
  returning * into v_row;
  return jsonb_build_object('id',v_row.id,'nombre',v_row.nombre,'token',v_token,'expires_at',v_row.expires_at);
end;
$$;

create or replace function public.rendicion_admin_toggle_link(p_id uuid, p_activo boolean)
returns boolean language plpgsql security definer set search_path = public
as $$
begin
  if not coalesce(public.usuario_tiene_algun_permiso(array['manage_rendiciones']), false) then
    raise exception 'Acceso denegado';
  end if;
  update public.rendicion_public_links set activo=p_activo,updated_at=now() where id=p_id;
  if not found then raise exception 'Enlace no encontrado'; end if;
  return true;
end;
$$;

create or replace function public.rendicion_admin_guardar_catalogo(
  p_tipo text, p_id uuid, p_codigo text, p_nombre text, p_activo boolean default true
) returns uuid language plpgsql security definer set search_path = public
as $$
declare v_id uuid; v_nombre text; v_codigo text;
begin
  if not coalesce(public.usuario_tiene_algun_permiso(array['manage_rendiciones']), false) then
    raise exception 'Acceso denegado';
  end if;
  v_nombre := regexp_replace(btrim(translate(coalesce(p_nombre,''), chr(8203)||chr(8204)||chr(8205)||chr(65279), '')), '\s+', ' ', 'g');
  if length(v_nombre) < 2 or length(v_nombre) > 120 or v_nombre !~* '[[:alpha:]áéíóúñü]' then
    raise exception 'El nombre debe contener letras reales';
  end if;
  if p_tipo = 'centro' then
    v_codigo := upper(btrim(coalesce(p_codigo,'')));
    if v_codigo !~ '^[A-Z0-9][A-Z0-9._ -]{0,39}$' then raise exception 'Codigo invalido'; end if;
    if p_id is null then
      insert into public.rendicion_centros_costo(codigo,nombre,activo) values(v_codigo,v_nombre,p_activo) returning id into v_id;
    else
      update public.rendicion_centros_costo set codigo=v_codigo,nombre=v_nombre,activo=p_activo,updated_at=now() where id=p_id returning id into v_id;
    end if;
  elsif p_tipo = 'colaborador' then
    if p_id is null then
      insert into public.rendicion_colaboradores(nombre,activo) values(v_nombre,p_activo) returning id into v_id;
    else
      update public.rendicion_colaboradores set nombre=v_nombre,activo=p_activo,updated_at=now() where id=p_id returning id into v_id;
    end if;
  else raise exception 'Tipo de catalogo invalido';
  end if;
  if v_id is null then raise exception 'Registro no encontrado'; end if;
  return v_id;
end;
$$;

revoke all on function public.rendicion_admin_dashboard(integer) from public, anon;
revoke all on function public.rendicion_admin_detalle(uuid) from public, anon;
revoke all on function public.rendicion_admin_crear_link(text,timestamptz,integer) from public, anon;
revoke all on function public.rendicion_admin_toggle_link(uuid,boolean) from public, anon;
revoke all on function public.rendicion_admin_guardar_catalogo(text,uuid,text,text,boolean) from public, anon;
grant execute on function public.rendicion_admin_dashboard(integer) to authenticated, service_role;
grant execute on function public.rendicion_admin_detalle(uuid) to authenticated, service_role;
grant execute on function public.rendicion_admin_crear_link(text,timestamptz,integer) to authenticated, service_role;
grant execute on function public.rendicion_admin_toggle_link(uuid,boolean) to authenticated, service_role;
grant execute on function public.rendicion_admin_guardar_catalogo(text,uuid,text,text,boolean) to authenticated, service_role;

commit;
