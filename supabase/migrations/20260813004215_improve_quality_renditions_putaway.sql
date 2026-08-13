-- Integridad Put Away + rendiciones con fuentes maestras oficiales.

-- ---------------------------------------------------------------------------
-- Put Away: idempotencia y resumen administrativo
-- ---------------------------------------------------------------------------
alter table public.wms_putaway_ubicaciones
  add column if not exists ubicacion_normalizada text
    generated always as (upper(btrim(ubicacion))) stored,
  add column if not exists codigo_normalizado text
    generated always as (upper(btrim(codigo))) stored,
  add column if not exists serie_normalizada text
    generated always as (coalesce(upper(btrim(serie)), '')) stored,
  add column if not exists partida_normalizada text
    generated always as (coalesce(upper(btrim(partida)), '')) stored;

-- Conserva el registro más reciente. Las copias eliminadas permanecen
-- recuperables en wms_putaway_ubicaciones_historial por el trigger vigente.
with repetidos as (
  select id,
         row_number() over (
           partition by ubicacion_normalizada, codigo_normalizado,
                        serie_normalizada, partida_normalizada
           order by coalesce(actualizado_en, creado_en) desc, creado_en desc, id desc
         ) as posicion
  from public.wms_putaway_ubicaciones
)
delete from public.wms_putaway_ubicaciones p
using repetidos r
where p.id = r.id and r.posicion > 1;

create unique index if not exists uq_putaway_visual_asignacion
  on public.wms_putaway_ubicaciones (
    ubicacion_normalizada, codigo_normalizado,
    serie_normalizada, partida_normalizada
  );

create or replace function public.putaway_admin_resumen()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not coalesce(public.usuario_tiene_algun_permiso(array['manage_locations']), false) then
    raise exception 'Acceso denegado';
  end if;
  return jsonb_build_object(
    'registros', (select count(*) from public.wms_putaway_ubicaciones),
    'skus', (select count(distinct codigo_normalizado) from public.wms_putaway_ubicaciones),
    'ubicaciones', (select count(distinct ubicacion_normalizada) from public.wms_putaway_ubicaciones),
    'hoy', (select count(*) from public.wms_putaway_ubicaciones
            where creado_en >= date_trunc('day', now() at time zone 'America/Santiago') at time zone 'America/Santiago'),
    'ultimos', coalesce((
      select jsonb_agg(to_jsonb(x) order by x.creado_en desc)
      from (
        select id, codigo, ubicacion, creado_por_nombre, creado_en
        from public.wms_putaway_ubicaciones
        order by creado_en desc
        limit 8
      ) x
    ), '[]'::jsonb)
  );
end;
$$;

revoke all on function public.putaway_admin_resumen() from public, anon;
grant execute on function public.putaway_admin_resumen() to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Rendiciones: responsable fijo, técnico oficial, datos y borrado auditado
-- ---------------------------------------------------------------------------
alter table public.rendiciones
  add column if not exists solicitante_tecnico_id uuid references public.tms_postventa_tecnicos(id),
  add column if not exists solicitante_tecnico_nombre text,
  add column if not exists solicitante_rut text,
  add column if not exists solicitante_direccion_area text,
  add column if not exists fondo_por_rendir numeric(14,2);

alter table public.rendiciones
  drop constraint if exists rendicion_solicitante_rut_formato,
  drop constraint if exists rendicion_solicitante_area_letras,
  drop constraint if exists rendicion_fondo_por_rendir_positivo;

alter table public.rendiciones
  add constraint rendicion_solicitante_rut_formato
    check (solicitante_rut is null or solicitante_rut ~ '^[0-9]{1,2}(\.?[0-9]{3}){2}-[0-9Kk]$'),
  add constraint rendicion_solicitante_area_letras
    check (solicitante_direccion_area is null or solicitante_direccion_area ~* '[[:alpha:]áéíóúñü]'),
  add constraint rendicion_fondo_por_rendir_positivo
    check (fondo_por_rendir is null or fondo_por_rendir >= 0);

create index if not exists idx_rendiciones_solicitante_fecha
  on public.rendiciones (solicitante_tecnico_id, created_at desc);

-- El catálogo de centros queda sincronizado exclusivamente con el usado por
-- Ingreso N.V. (tms_panel_vendedores). Se elige el nombre más frecuente por CC.
with oficiales as (
  select distinct on (btrim(centro_costo))
         btrim(centro_costo) as codigo,
         coalesce(nullif(btrim(division), ''), btrim(centro_costo)) as nombre
  from public.tms_panel_vendedores
  where activo and nullif(btrim(centro_costo), '') is not null
  group by btrim(centro_costo), btrim(division)
  order by btrim(centro_costo), count(*) desc, btrim(division)
)
insert into public.rendicion_centros_costo (codigo, nombre, activo)
select codigo, nombre, true from oficiales
on conflict (codigo) do update
set nombre = excluded.nombre, activo = true, updated_at = now();

update public.rendicion_centros_costo c
set activo = false, updated_at = now()
where not exists (
  select 1 from public.tms_panel_vendedores v
  where v.activo and btrim(v.centro_costo) = c.codigo
);

-- Oscar Leiva es el responsable/aprobador fijo de todas las nuevas rendiciones.
insert into public.rendicion_colaboradores
  (nombre, rut, direccion_area, unidad, tecnico, activo)
select 'Oscar Leiva', '16.068.403-8', 'Operaciones', 'PV - ST', null, true
where not exists (
  select 1 from public.rendicion_colaboradores where lower(btrim(nombre)) = 'oscar leiva'
);

update public.rendicion_colaboradores
set activo = (lower(btrim(nombre)) = 'oscar leiva'), updated_at = now()
where lower(btrim(nombre)) <> 'oscar leiva' or not activo;

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
  v_tecnico public.tms_postventa_tecnicos%rowtype;
  v_report public.rendiciones%rowtype;
  v_item jsonb;
  v_item_id uuid;
  v_items jsonb := '[]'::jsonb;
  v_count integer;
  v_order integer := 0;
  v_total numeric(14,2) := 0;
  v_fondo numeric(14,2);
  v_desc text;
  v_doc_num text;
  v_detail text;
  v_rut text;
  v_area text;
  v_fecha date;
  v_monto numeric;
  v_cat record;
  v_oscar_id uuid;
  v_today date := (now() at time zone 'America/Santiago')::date;
begin
  if p_link_hash !~ '^[0-9a-f]{64}$' or p_view_hash !~ '^[0-9a-f]{64}$' then
    raise exception 'Token invalido';
  end if;

  select * into v_link from public.rendicion_public_links
  where token_hash = p_link_hash for update;
  if v_link.id is null or not v_link.activo
     or (v_link.expires_at is not null and v_link.expires_at <= now()) then
    raise exception 'El enlace no existe, expiro o fue desactivado';
  end if;
  if v_link.max_submissions is not null and v_link.submissions_count >= v_link.max_submissions then
    raise exception 'El enlace alcanzo su limite de envios';
  end if;
  if p_ip is not null and btrim(p_ip) <> '' and (
    select count(*) from public.rendicion_public_log
    where ip = p_ip and accion = 'submit' and created_at > now() - interval '1 hour'
  ) >= 5 then raise exception 'Demasiados envios desde esta conexion. Intenta mas tarde'; end if;

  select * into v_cc from public.rendicion_centros_costo c
  where c.id = nullif(p_payload->>'centro_costo_id','')::uuid and c.activo
    and exists (
      select 1 from public.tms_panel_vendedores v
      where v.activo and btrim(v.centro_costo) = c.codigo
    );
  if v_cc.id is null then raise exception 'Centro de costo invalido'; end if;

  select * into v_resp from public.rendicion_colaboradores
  where lower(btrim(nombre)) = 'oscar leiva' and activo
  order by updated_at desc nulls last limit 1;
  if v_resp.id is null then raise exception 'Responsable Oscar Leiva no configurado'; end if;

  select * into v_tecnico from public.tms_postventa_tecnicos
  where id = nullif(p_payload->>'solicitante_tecnico_id','')::uuid
    and activo and lower(btrim(nombre)) <> 'sin asignar';
  if v_tecnico.id is null then raise exception 'Tecnico no registrado en Postventa'; end if;

  v_rut := regexp_replace(btrim(coalesce(p_payload->>'solicitante_rut','')), '\s+', '', 'g');
  if v_rut !~ '^[0-9]{1,2}(\.?[0-9]{3}){2}-[0-9Kk]$' then
    raise exception 'RUT invalido. Usa formato 12.345.678-9';
  end if;
  v_area := regexp_replace(btrim(translate(coalesce(p_payload->>'solicitante_direccion_area',''), chr(8203)||chr(8204)||chr(8205)||chr(65279), '')), '\s+', ' ', 'g');
  if length(v_area) < 3 or length(v_area) > 120 or v_area !~* '[[:alpha:]áéíóúñü]' then
    raise exception 'Direccion o area invalida';
  end if;

  if coalesce(p_payload->>'tipo_fondo','') not in
    ('Fondo por rendir','Rendición de gastos','Fondo fijo','Anticipo','Reembolso') then
    raise exception 'Tipo de fondo invalido';
  end if;
  begin v_fondo := nullif(p_payload->>'fondo_por_rendir','')::numeric;
  exception when others then v_fondo := null; end;
  if p_payload->>'tipo_fondo' = 'Fondo por rendir' and (v_fondo is null or v_fondo <= 0) then
    raise exception 'El monto del fondo por rendir debe ser mayor a cero';
  end if;
  if v_fondo is not null and (v_fondo < 0 or v_fondo > 999999999) then
    raise exception 'Monto de fondo por rendir invalido';
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
  if v_count < 1 or v_count > 15 then raise exception 'La rendicion debe tener entre 1 y 15 gastos'; end if;

  insert into public.rendiciones (
    public_link_id, view_token_hash, fecha_rendicion,
    centro_costo_id, centro_costo_codigo, centro_costo_nombre,
    responsable_id, responsable_nombre, tipo_fondo, detalle, created_ip,
    solicitante_tecnico_id, solicitante_tecnico_nombre,
    solicitante_rut, solicitante_direccion_area, fondo_por_rendir
  ) values (
    v_link.id, p_view_hash, v_fecha,
    v_cc.id, v_cc.codigo, v_cc.nombre,
    v_resp.id, v_resp.nombre, p_payload->>'tipo_fondo', v_detail,
    nullif(left(btrim(coalesce(p_ip,'')), 120), ''),
    v_tecnico.id, v_tecnico.nombre, v_rut, v_area, v_fondo
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
    select c.nombre categoria_nombre, s.nombre subcategoria_nombre into v_cat
    from public.rendicion_categoria_subcategoria cs
    join public.rendicion_categorias c on c.codigo=cs.categoria_codigo and c.activo
    join public.rendicion_subcategorias s on s.codigo=cs.subcategoria_codigo and s.activo
    where cs.categoria_codigo=v_item->>'categoria_codigo'
      and cs.subcategoria_codigo=v_item->>'subcategoria_codigo';
    if v_cat.categoria_nombre is null then raise exception 'Categoria/subcategoria invalida en el gasto %', v_order; end if;
    if coalesce(v_item->>'tipo_documento','') not in
      ('Factura','Boleta','Boleta de honorarios','Voucher/comprobante','Comprobante de transferencia','Sin documento') then
      raise exception 'Tipo de documento invalido en el gasto %', v_order;
    end if;
    v_doc_num := regexp_replace(btrim(translate(coalesce(v_item->>'numero_documento',''), chr(8203)||chr(8204)||chr(8205)||chr(65279), '')), '\s+', ' ', 'g');
    if v_doc_num = '' then v_doc_num := null; end if;
    if v_doc_num is not null and (length(v_doc_num)>80 or v_doc_num !~ '[[:alnum:]]') then
      raise exception 'Numero de documento invalido en el gasto %', v_order;
    end if;
    insert into public.rendicion_items (
      rendicion_id,orden,fecha,categoria_codigo,subcategoria_codigo,
      categoria_nombre,subcategoria_nombre,descripcion,monto,tipo_documento,numero_documento
    ) values (
      v_report.id,v_order,v_fecha,v_item->>'categoria_codigo',v_item->>'subcategoria_codigo',
      v_cat.categoria_nombre,v_cat.subcategoria_nombre,v_desc,round(v_monto,2),v_item->>'tipo_documento',v_doc_num
    ) returning id into v_item_id;
    v_items := v_items || jsonb_build_array(jsonb_build_object(
      'client_id',left(coalesce(v_item->>'client_id',''),80),'id',v_item_id
    ));
    v_total := v_total + round(v_monto,2);
  end loop;

  update public.rendiciones set total=v_total,updated_at=now() where id=v_report.id;
  update public.rendicion_public_links set submissions_count=submissions_count+1,updated_at=now() where id=v_link.id;
  insert into public.rendicion_public_log(link_id,rendicion_id,ip,accion)
  values(v_link.id,v_report.id,nullif(left(btrim(coalesce(p_ip,'')),120),''),'submit');

  select id into v_oscar_id from public.tms_usuarios
  where lower(btrim(nombre))='oscar leiva' order by activo desc limit 1;
  if v_oscar_id is not null then
    insert into public.tms_notificaciones(tipo,titulo,mensaje,destinatario_id,payload,origen)
    values(
      'RENDICION_NUEVA',
      'Nueva rendición ' || 'REN-' || extract(year from v_report.fecha_rendicion)::int || '-' || lpad(v_report.folio::text,6,'0'),
      v_tecnico.nombre || ' envió una rendición por $' || trim(to_char(v_total,'999G999G999')),
      v_oscar_id,
      jsonb_build_object('rendicion_id',v_report.id,'folio',v_report.folio,'tecnico',v_tecnico.nombre,'total',v_total,'ruta','/admin/rendiciones'),
      'rendiciones'
    );
  end if;

  return jsonb_build_object(
    'id',v_report.id,
    'folio','REN-' || extract(year from v_report.fecha_rendicion)::int || '-' || lpad(v_report.folio::text,6,'0'),
    'items',v_items,'total',v_total,'tecnico',v_tecnico.nombre
  );
end;
$$;

revoke all on function public.crear_rendicion_publica(text,text,jsonb,text) from public,anon,authenticated;
grant execute on function public.crear_rendicion_publica(text,text,jsonb,text) to service_role;

create table if not exists public.rendicion_eliminaciones_historial (
  id bigint generated always as identity primary key,
  rendicion_id uuid not null,
  folio_texto text not null,
  snapshot jsonb not null,
  eliminado_por uuid references public.tms_usuarios(id) on delete set null,
  eliminado_por_nombre text,
  eliminado_en timestamptz not null default now()
);
alter table public.rendicion_eliminaciones_historial enable row level security;
revoke all on table public.rendicion_eliminaciones_historial from public,anon,authenticated;
grant select on table public.rendicion_eliminaciones_historial to authenticated,service_role;
drop policy if exists rendicion_eliminaciones_admin_select on public.rendicion_eliminaciones_historial;
create policy rendicion_eliminaciones_admin_select on public.rendicion_eliminaciones_historial
for select to authenticated
using (coalesce(public.usuario_tiene_algun_permiso(array['manage_rendiciones']),false));

create or replace function public.rendicion_admin_eliminar(p_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare v_r public.rendiciones%rowtype; v_actor record; v_paths jsonb;
begin
  if not coalesce(public.usuario_tiene_algun_permiso(array['manage_rendiciones']),false) then
    raise exception 'Acceso denegado';
  end if;
  select * into v_r from public.rendiciones where id=p_id for update;
  if v_r.id is null then raise exception 'Rendicion no encontrada'; end if;
  select id,nombre into v_actor from public.tms_usuarios where auth_uid=(select auth.uid()) limit 1;
  select coalesce(jsonb_agg(storage_path),'[]'::jsonb) into v_paths
  from public.rendicion_fotos where rendicion_id=p_id;
  insert into public.rendicion_eliminaciones_historial(
    rendicion_id,folio_texto,snapshot,eliminado_por,eliminado_por_nombre
  ) values(
    v_r.id,'REN-'||extract(year from v_r.fecha_rendicion)::int||'-'||lpad(v_r.folio::text,6,'0'),
    to_jsonb(v_r),v_actor.id,v_actor.nombre
  );
  delete from public.rendiciones where id=p_id;
  return jsonb_build_object('ok',true,'storage_paths',v_paths);
end;
$$;
revoke all on function public.rendicion_admin_eliminar(uuid) from public,anon;
grant execute on function public.rendicion_admin_eliminar(uuid) to authenticated,service_role;

drop policy if exists rendicion_evidencias_delete_admin on storage.objects;
create policy rendicion_evidencias_delete_admin on storage.objects
for delete to authenticated
using (
  bucket_id = 'rendicion-evidencias'
  and coalesce(public.usuario_tiene_algun_permiso(array['manage_rendiciones']),false)
);

-- Dashboard actualizado: quién rindió, cuándo y datos de origen.
create or replace function public.rendicion_admin_dashboard(p_limit integer default 100)
returns jsonb language plpgsql stable security definer set search_path=public
as $$
begin
  if not coalesce(public.usuario_tiene_algun_permiso(array['view_rendiciones','manage_rendiciones']),false) then
    raise exception 'Acceso denegado';
  end if;
  return jsonb_build_object(
    'rendiciones',coalesce((select jsonb_agg(to_jsonb(x) order by x.created_at desc) from (
      select r.id,'REN-'||extract(year from r.fecha_rendicion)::int||'-'||lpad(r.folio::text,6,'0') folio,
             r.fecha_rendicion,r.responsable_nombre,r.solicitante_tecnico_nombre,
             r.solicitante_rut,r.solicitante_direccion_area,r.centro_costo_codigo,
             r.centro_costo_nombre,r.tipo_fondo,r.fondo_por_rendir,r.estado,r.total,r.created_at,
             (select count(*) from public.rendicion_items i where i.rendicion_id=r.id) items,
             (select count(*) from public.rendicion_fotos f where f.rendicion_id=r.id) fotos
      from public.rendiciones r order by r.created_at desc limit greatest(1,least(coalesce(p_limit,100),500))
    ) x),'[]'::jsonb),
    'links','[]'::jsonb,
    'centros',coalesce((select jsonb_agg(to_jsonb(c) order by c.codigo) from (
      select id,codigo,nombre,activo from public.rendicion_centros_costo where activo
    ) c),'[]'::jsonb),
    'colaboradores',coalesce((select jsonb_agg(to_jsonb(c)) from (
      select id,nombre,activo from public.rendicion_colaboradores where lower(btrim(nombre))='oscar leiva'
    ) c),'[]'::jsonb),
    'por_tecnico',coalesce((select jsonb_agg(to_jsonb(t) order by t.ultima desc) from (
      select coalesce(solicitante_tecnico_nombre,'Sin identificar') nombre,count(*) cantidad,
             sum(total) total,max(created_at) ultima
      from public.rendiciones group by 1 order by count(*) desc limit 12
    ) t),'[]'::jsonb),
    'storage',jsonb_build_object(
      'archivos',(select count(*) from public.rendicion_fotos),
      'rendicion_bytes',(select coalesce(sum(bytes),0) from public.rendicion_fotos),
      'bytes',(select coalesce(sum((metadata->>'size')::bigint),0) from storage.objects where bucket_id='rendicion-evidencias')
    )
  );
end;
$$;
revoke all on function public.rendicion_admin_dashboard(integer) from public,anon;
grant execute on function public.rendicion_admin_dashboard(integer) to authenticated,service_role;
