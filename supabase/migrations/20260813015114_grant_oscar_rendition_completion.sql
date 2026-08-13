-- Acceso mínimo para Oscar: ver rendiciones y completar su cabecera.
-- No incluye eliminar registros, enlaces ni catálogos.
insert into iam.permissions(id,codigo,recurso,accion,descripcion,grupo,es_sistema)
values(gen_random_uuid(),'complete_rendiciones','rendiciones','complete','Completar datos administrativos de rendiciones','Administracion',true)
on conflict(codigo) do update set descripcion=excluded.descripcion;

insert into iam.roles(id,codigo,nombre,descripcion,es_sistema,activo)
values(gen_random_uuid(),'rendiciones_oscar','Responsable de rendiciones','Acceso acotado para revisar y completar rendiciones',true,true)
on conflict(codigo) do update set activo=true,descripcion=excluded.descripcion;

insert into iam.role_permissions(role_id,permission_id)
select r.id,p.id from iam.roles r cross join iam.permissions p
where r.codigo='rendiciones_oscar' and p.codigo in ('view_rendiciones','complete_rendiciones')
on conflict do nothing;

insert into iam.assignments(id,principal_type,principal_id,role_id,scope_type,scope_id,scope_code,granted_at)
select gen_random_uuid(),'user'::iam.principal_type,u.id,r.id,'global'::iam.scope_type,null,null,now()
from public.tms_usuarios u cross join iam.roles r
where lower(btrim(u.nombre))='oscar leiva' and r.codigo='rendiciones_oscar'
on conflict(principal_type,principal_id,role_id,scope_type,scope_id) do nothing;

create or replace function public.rendicion_admin_completar_cabecera(p_id uuid,p_payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path=public
as $$
declare
  v_r public.rendiciones%rowtype; v_cc public.rendicion_centros_costo%rowtype;
  v_actor record; v_before jsonb; v_after jsonb; v_fecha date; v_fondo numeric;
  v_rut text; v_area text; v_unidad text; v_tecnico text; v_detalle text; v_tipo text;
begin
  if not coalesce(public.usuario_tiene_algun_permiso(array['complete_rendiciones','manage_rendiciones']),false) then raise exception 'Acceso denegado'; end if;
  select * into v_r from public.rendiciones where id=p_id for update;
  if v_r.id is null then raise exception 'Rendicion no encontrada'; end if;
  v_before:=to_jsonb(v_r)-'view_token_hash';
  select * into v_cc from public.rendicion_centros_costo c where c.id=nullif(p_payload->>'centro_costo_id','')::uuid and c.activo
    and exists(select 1 from public.tms_panel_vendedores v where v.activo and btrim(v.centro_costo)=c.codigo);
  if v_cc.id is null then raise exception 'Centro de costo invalido'; end if;
  v_fecha:=nullif(p_payload->>'fecha_rendicion','')::date;
  if v_fecha is null or v_fecha>(now() at time zone 'America/Santiago')::date or v_fecha<date '2020-01-01' then raise exception 'Fecha de rendicion invalida'; end if;
  v_tipo:=btrim(coalesce(p_payload->>'tipo_fondo',''));
  if v_tipo not in ('Fondo por rendir','Rendición de gastos','Fondo fijo','Anticipo','Reembolso') then raise exception 'Tipo de fondo invalido'; end if;
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
  update public.rendiciones set fecha_rendicion=v_fecha,centro_costo_id=v_cc.id,centro_costo_codigo=v_cc.codigo,
    centro_costo_nombre=v_cc.nombre,responsable_nombre='Oscar Leiva',responsable_rut=v_rut,direccion_area=v_area,
    unidad=v_unidad,tecnico=v_tecnico,tipo_fondo=v_tipo,fondo_por_rendir=case when v_tipo='Fondo por rendir' then v_fondo else null end,
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

select authz.refresh_permissions();
