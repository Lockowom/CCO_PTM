-- Flujo en dos etapas:
-- 1) el técnico solo registra el detalle y las evidencias;
-- 2) Oscar completa la cabecera administrativa antes de exportar.

alter table public.rendiciones
  alter column centro_costo_id drop not null,
  alter column centro_costo_codigo drop not null,
  alter column centro_costo_nombre drop not null,
  alter column tipo_fondo drop not null;

alter table public.rendiciones drop constraint if exists rendicion_estado_check;
alter table public.rendiciones add constraint rendicion_estado_check
  check (estado in ('Pendiente completar','Enviada','En revision','Aprobada','Rechazada'));

create table if not exists public.rendicion_ediciones_historial (
  id bigint generated always as identity primary key,
  rendicion_id uuid not null references public.rendiciones(id) on delete cascade,
  antes jsonb not null,
  despues jsonb not null,
  editado_por uuid references public.tms_usuarios(id) on delete set null,
  editado_por_nombre text,
  editado_en timestamptz not null default now()
);
alter table public.rendicion_ediciones_historial enable row level security;
revoke all on table public.rendicion_ediciones_historial from public, anon, authenticated;
grant select on table public.rendicion_ediciones_historial to authenticated, service_role;
drop policy if exists rendicion_ediciones_admin_select on public.rendicion_ediciones_historial;
create policy rendicion_ediciones_admin_select on public.rendicion_ediciones_historial
for select to authenticated
using (coalesce(public.usuario_tiene_algun_permiso(array['manage_rendiciones']), false));

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
  v_resp public.rendicion_colaboradores%rowtype;
  v_tecnico public.tms_postventa_tecnicos%rowtype;
  v_report public.rendiciones%rowtype;
  v_item jsonb;
  v_item_id uuid;
  v_items jsonb := '[]'::jsonb;
  v_count integer;
  v_order integer := 0;
  v_total numeric(14,2) := 0;
  v_desc text;
  v_doc_num text;
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
  where token_hash=p_link_hash for update;
  if v_link.id is null or not v_link.activo
     or (v_link.expires_at is not null and v_link.expires_at <= now()) then
    raise exception 'El enlace no existe, expiro o fue desactivado';
  end if;
  if v_link.max_submissions is not null and v_link.submissions_count >= v_link.max_submissions then
    raise exception 'El enlace alcanzo su limite de envios';
  end if;
  if p_ip is not null and btrim(p_ip)<>'' and (
    select count(*) from public.rendicion_public_log
    where ip=p_ip and accion='submit' and created_at > now()-interval '1 hour'
  ) >= 5 then raise exception 'Demasiados envios desde esta conexion. Intenta mas tarde'; end if;

  select * into v_resp from public.rendicion_colaboradores
  where lower(btrim(nombre))='oscar leiva' and activo
  order by updated_at desc nulls last limit 1;
  if v_resp.id is null then raise exception 'Responsable Oscar Leiva no configurado'; end if;
  select * into v_tecnico from public.tms_postventa_tecnicos
  where id=nullif(p_payload->>'solicitante_tecnico_id','')::uuid
    and activo and lower(btrim(nombre))<>'sin asignar';
  if v_tecnico.id is null then raise exception 'Tecnico no registrado en Postventa'; end if;

  v_count := jsonb_array_length(coalesce(p_payload->'items','[]'::jsonb));
  if v_count < 1 or v_count > 15 then raise exception 'La rendicion debe tener entre 1 y 15 gastos'; end if;

  insert into public.rendiciones(
    public_link_id,view_token_hash,fecha_rendicion,
    responsable_id,responsable_nombre,responsable_rut,direccion_area,unidad,
    solicitante_tecnico_id,solicitante_tecnico_nombre,estado,created_ip
  ) values(
    v_link.id,p_view_hash,v_today,
    v_resp.id,v_resp.nombre,v_resp.rut,v_resp.direccion_area,v_resp.unidad,
    v_tecnico.id,v_tecnico.nombre,'Pendiente completar',
    nullif(left(btrim(coalesce(p_ip,'')),120),'')
  ) returning * into v_report;

  for v_item in select value from jsonb_array_elements(p_payload->'items') loop
    v_order := v_order+1;
    v_desc := regexp_replace(btrim(translate(coalesce(v_item->>'descripcion',''),chr(8203)||chr(8204)||chr(8205)||chr(65279),'')),'\s+',' ','g');
    if length(v_desc)<3 or length(v_desc)>800 or v_desc !~* '[[:alpha:]áéíóúñü]' then
      raise exception 'La descripcion del gasto % debe contener letras reales',v_order;
    end if;
    v_fecha := nullif(v_item->>'fecha','')::date;
    if v_fecha is null or v_fecha>v_today or v_fecha<v_today-730 then
      raise exception 'Fecha invalida en el gasto %',v_order;
    end if;
    begin v_monto := (v_item->>'monto')::numeric; exception when others then v_monto:=null; end;
    if v_monto is null or v_monto<=0 or v_monto>999999999 then
      raise exception 'Monto invalido en el gasto %',v_order;
    end if;
    select c.nombre categoria_nombre,s.nombre subcategoria_nombre into v_cat
    from public.rendicion_categoria_subcategoria cs
    join public.rendicion_categorias c on c.codigo=cs.categoria_codigo and c.activo
    join public.rendicion_subcategorias s on s.codigo=cs.subcategoria_codigo and s.activo
    where cs.categoria_codigo=v_item->>'categoria_codigo'
      and cs.subcategoria_codigo=v_item->>'subcategoria_codigo';
    if v_cat.categoria_nombre is null then raise exception 'Categoria/subcategoria invalida en el gasto %',v_order; end if;
    if coalesce(v_item->>'tipo_documento','') not in
      ('Factura','Boleta','Boleta de honorarios','Voucher/comprobante','Comprobante de transferencia','Sin documento') then
      raise exception 'Tipo de documento invalido en el gasto %',v_order;
    end if;
    v_doc_num := regexp_replace(btrim(translate(coalesce(v_item->>'numero_documento',''),chr(8203)||chr(8204)||chr(8205)||chr(65279),'')),'\s+',' ','g');
    if v_doc_num='' then v_doc_num:=null; end if;
    if v_doc_num is not null and (length(v_doc_num)>80 or v_doc_num !~ '[[:alnum:]]') then
      raise exception 'Numero de documento invalido en el gasto %',v_order;
    end if;
    insert into public.rendicion_items(
      rendicion_id,orden,fecha,categoria_codigo,subcategoria_codigo,
      categoria_nombre,subcategoria_nombre,descripcion,monto,tipo_documento,numero_documento
    ) values(
      v_report.id,v_order,v_fecha,v_item->>'categoria_codigo',v_item->>'subcategoria_codigo',
      v_cat.categoria_nombre,v_cat.subcategoria_nombre,v_desc,round(v_monto,2),v_item->>'tipo_documento',v_doc_num
    ) returning id into v_item_id;
    v_items:=v_items||jsonb_build_array(jsonb_build_object('client_id',left(coalesce(v_item->>'client_id',''),80),'id',v_item_id));
    v_total:=v_total+round(v_monto,2);
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
      'RENDICION_NUEVA','Nueva rendicion pendiente de completar',
      v_tecnico.nombre||' envio el detalle de gastos por $'||trim(to_char(v_total,'999G999G999')),
      v_oscar_id,
      jsonb_build_object('rendicion_id',v_report.id,'folio',v_report.folio,'tecnico',v_tecnico.nombre,'total',v_total,'ruta','/admin/rendiciones'),
      'rendiciones'
    );
  end if;
  return jsonb_build_object(
    'id',v_report.id,'folio','REN-'||extract(year from v_report.fecha_rendicion)::int||'-'||lpad(v_report.folio::text,6,'0'),
    'items',v_items,'total',v_total,'tecnico',v_tecnico.nombre,'pendiente_completar',true
  );
end;
$$;
revoke all on function public.crear_rendicion_publica(text,text,jsonb,text) from public,anon,authenticated;
grant execute on function public.crear_rendicion_publica(text,text,jsonb,text) to service_role;

create or replace function public.rendicion_admin_completar_cabecera(p_id uuid,p_payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path=public
as $$
declare
  v_r public.rendiciones%rowtype;
  v_cc public.rendicion_centros_costo%rowtype;
  v_actor record;
  v_before jsonb;
  v_after jsonb;
  v_fecha date;
  v_fondo numeric;
  v_rut text;
  v_area text;
  v_unidad text;
  v_tecnico text;
  v_detalle text;
  v_tipo text;
begin
  if not coalesce(public.usuario_tiene_algun_permiso(array['manage_rendiciones']),false) then
    raise exception 'Acceso denegado';
  end if;
  select * into v_r from public.rendiciones where id=p_id for update;
  if v_r.id is null then raise exception 'Rendicion no encontrada'; end if;
  v_before:=to_jsonb(v_r)-'view_token_hash';
  select * into v_cc from public.rendicion_centros_costo c
  where c.id=nullif(p_payload->>'centro_costo_id','')::uuid and c.activo
    and exists(select 1 from public.tms_panel_vendedores v where v.activo and btrim(v.centro_costo)=c.codigo);
  if v_cc.id is null then raise exception 'Centro de costo invalido'; end if;
  v_fecha:=nullif(p_payload->>'fecha_rendicion','')::date;
  if v_fecha is null or v_fecha>(now() at time zone 'America/Santiago')::date or v_fecha<date '2020-01-01' then
    raise exception 'Fecha de rendicion invalida';
  end if;
  v_tipo:=btrim(coalesce(p_payload->>'tipo_fondo',''));
  if v_tipo not in ('Fondo por rendir','Rendición de gastos','Fondo fijo','Anticipo','Reembolso') then
    raise exception 'Tipo de fondo invalido';
  end if;
  begin v_fondo:=nullif(p_payload->>'fondo_por_rendir','')::numeric; exception when others then v_fondo:=null; end;
  if v_tipo='Fondo por rendir' and (v_fondo is null or v_fondo<=0) then raise exception 'Ingresa el monto del fondo por rendir'; end if;
  if v_fondo is not null and (v_fondo<0 or v_fondo>999999999) then raise exception 'Monto invalido'; end if;
  v_rut:=regexp_replace(btrim(coalesce(p_payload->>'responsable_rut','')),'\s+','','g');
  if v_rut !~ '^[0-9]{1,2}(\.?[0-9]{3}){2}-[0-9Kk]$' then raise exception 'RUT invalido'; end if;
  v_area:=regexp_replace(btrim(coalesce(p_payload->>'direccion_area','')),'\s+',' ','g');
  v_unidad:=regexp_replace(btrim(coalesce(p_payload->>'unidad','')),'\s+',' ','g');
  v_tecnico:=regexp_replace(btrim(coalesce(p_payload->>'tecnico','')),'\s+',' ','g');
  v_detalle:=regexp_replace(btrim(coalesce(p_payload->>'detalle','')),'\s+',' ','g');
  if length(v_area)<3 or v_area !~* '[[:alpha:]áéíóúñü]' then raise exception 'Direccion o area invalida'; end if;
  if length(v_unidad)<2 or v_unidad !~* '[[:alpha:]áéíóúñü]' then raise exception 'Unidad invalida'; end if;
  if length(v_tecnico)<2 or v_tecnico !~* '[[:alpha:]áéíóúñü]' then raise exception 'Tecnico invalido'; end if;
  if length(v_detalle)<3 or v_detalle !~* '[[:alpha:]áéíóúñü]' then raise exception 'Detalle invalido'; end if;
  update public.rendiciones set
    fecha_rendicion=v_fecha,centro_costo_id=v_cc.id,centro_costo_codigo=v_cc.codigo,
    centro_costo_nombre=v_cc.nombre,responsable_nombre='Oscar Leiva',responsable_rut=v_rut,
    direccion_area=v_area,unidad=v_unidad,tecnico=v_tecnico,tipo_fondo=v_tipo,
    fondo_por_rendir=case when v_tipo='Fondo por rendir' then v_fondo else null end,
    detalle=v_detalle,estado=case when estado='Pendiente completar' then 'Enviada' else estado end,updated_at=now()
  where id=p_id returning (to_jsonb(rendiciones)-'view_token_hash') into v_after;
  select id,nombre into v_actor from public.tms_usuarios where auth_uid=(select auth.uid()) limit 1;
  insert into public.rendicion_ediciones_historial(rendicion_id,antes,despues,editado_por,editado_por_nombre)
  values(p_id,v_before,v_after,v_actor.id,v_actor.nombre);
  return jsonb_build_object('ok',true,'rendicion',v_after,'cabecera_completa',true);
end;
$$;
revoke all on function public.rendicion_admin_completar_cabecera(uuid,jsonb) from public,anon;
grant execute on function public.rendicion_admin_completar_cabecera(uuid,jsonb) to authenticated,service_role;

create or replace function public.rendicion_cabecera_completa(r public.rendiciones)
returns boolean language sql immutable set search_path=public
as $$ select r.centro_costo_id is not null and r.tipo_fondo is not null
  and nullif(btrim(r.responsable_rut),'') is not null
  and nullif(btrim(r.direccion_area),'') is not null
  and nullif(btrim(r.unidad),'') is not null
  and nullif(btrim(r.tecnico),'') is not null
  and nullif(btrim(r.detalle),'') is not null
  and (r.tipo_fondo<>'Fondo por rendir' or coalesce(r.fondo_por_rendir,0)>0) $$;
revoke all on function public.rendicion_cabecera_completa(public.rendiciones) from public,anon;
grant execute on function public.rendicion_cabecera_completa(public.rendiciones) to authenticated,service_role;

create or replace function public.rendicion_admin_detalle(p_id uuid)
returns jsonb language plpgsql stable security definer set search_path=public
as $$
declare v_result jsonb;
begin
  if not coalesce(public.usuario_tiene_algun_permiso(array['view_rendiciones','manage_rendiciones']),false) then raise exception 'Acceso denegado'; end if;
  select jsonb_build_object(
    'rendicion',(to_jsonb(r)-'view_token_hash')||jsonb_build_object(
      'folio_texto','REN-'||extract(year from r.fecha_rendicion)::int||'-'||lpad(r.folio::text,6,'0'),
      'cabecera_completa',public.rendicion_cabecera_completa(r)
    ),
    'items',coalesce((select jsonb_agg(to_jsonb(i) order by i.orden) from public.rendicion_items i where i.rendicion_id=r.id),'[]'::jsonb),
    'fotos',coalesce((select jsonb_agg(to_jsonb(f) order by f.created_at) from public.rendicion_fotos f where f.rendicion_id=r.id),'[]'::jsonb)
  ) into v_result from public.rendiciones r where r.id=p_id;
  if v_result is null then raise exception 'Rendicion no encontrada'; end if;
  return v_result;
end;
$$;
revoke all on function public.rendicion_admin_detalle(uuid) from public,anon;
grant execute on function public.rendicion_admin_detalle(uuid) to authenticated,service_role;
