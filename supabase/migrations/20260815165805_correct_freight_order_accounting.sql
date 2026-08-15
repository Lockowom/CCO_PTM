-- Una orden de flete puede contener varias N.V./documentos. Los bultos y kilos
-- pertenecen a la orden fisica y no deben duplicarse por cada documento.

alter table public.coord_rutas_fletes
  add column if not exists orden_flete text,
  add column if not exists cantidad_nv integer not null default 1;

alter table public.coord_rutas_fletes
  drop constraint if exists coord_rutas_fletes_cantidad_nv_check;
alter table public.coord_rutas_fletes
  add constraint coord_rutas_fletes_cantidad_nv_check
  check (cantidad_nv between 1 and 10000);

create index if not exists ix_coord_fletes_orden
  on public.coord_rutas_fletes (orden_flete)
  where orden_flete is not null;

create or replace function public.coord_rutas_importar_fletes(p_rows jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row jsonb;
  v_total integer := 0;
  v_insertados integer := 0;
  v_actualizados integer := 0;
  v_errores integer := 0;
  v_batch uuid := gen_random_uuid();
  v_hash text;
  v_exists boolean;
  v_fecha_despacho date;
  v_fecha_entrega date;
  v_bultos integer;
  v_cantidad_nv integer;
  v_kilos numeric;
  v_valor numeric;
  v_costo numeric;
  v_tipo text;
begin
  if not public.coord_rutas_es_propietario() then raise exception 'Acceso privado denegado'; end if;
  if jsonb_typeof(p_rows) <> 'array' then raise exception 'El archivo debe contener una lista'; end if;
  if jsonb_array_length(p_rows) = 0 or jsonb_array_length(p_rows) > 1000 then
    raise exception 'Cada lote debe contener entre 1 y 1000 filas';
  end if;

  for v_row in select value from jsonb_array_elements(p_rows)
  loop
    v_total := v_total + 1;
    begin
      v_fecha_despacho := nullif(v_row->>'fecha_despacho','')::date;
      v_fecha_entrega := nullif(v_row->>'fecha_entrega','')::date;
      v_bultos := nullif(v_row->>'bultos','')::integer;
      v_cantidad_nv := greatest(coalesce(nullif(v_row->>'cantidad_nv','')::integer,1),1);
      v_kilos := nullif(v_row->>'kilos','')::numeric;
      v_valor := nullif(v_row->>'valor_venta','')::numeric;
      v_costo := nullif(v_row->>'costo_flete','')::numeric;
      v_tipo := upper(coalesce(nullif(btrim(v_row->>'tipo_transporte'),''),'SIN_CLASIFICAR'));
      if v_tipo not in ('PROPIO','EXTERNO','RETIRO_CLIENTE','SIN_CLASIFICAR') then
        v_tipo := 'SIN_CLASIFICAR';
      end if;
      if v_bultos < 0 or v_kilos < 0 or v_valor < 0 or v_costo < 0 then
        raise exception 'Valores negativos no permitidos';
      end if;
      if coalesce(
        nullif(btrim(v_row->>'orden_flete'),''),
        nullif(btrim(v_row->>'nv'),''),
        nullif(btrim(v_row->>'factura'),''),
        nullif(btrim(v_row->>'cliente'),'')
      ) is null then
        raise exception 'Fila sin orden, N.V., factura ni cliente';
      end if;

      v_hash := md5(concat_ws('|',
        lower(btrim(coalesce(v_row->>'orden_flete',''))),
        lower(btrim(coalesce(v_row->>'nv',''))),
        lower(btrim(coalesce(v_row->>'factura',''))),
        coalesce(v_fecha_despacho::text,''),
        lower(btrim(coalesce(v_row->>'destino',v_row->>'comuna',v_row->>'ciudad',''))),
        lower(btrim(coalesce(v_row->>'transportista',''))),
        coalesce(v_bultos::text,''),coalesce(v_kilos::text,'')
      ));
      select exists(select 1 from public.coord_rutas_fletes where source_hash=v_hash) into v_exists;

      insert into public.coord_rutas_fletes (
        source_hash,import_batch,orden_flete,cantidad_nv,fecha_despacho,fecha_entrega,
        nv,factura,cliente,destino,comuna,ciudad,region,transportista,tipo_transporte,
        bultos,kilos,valor_venta,costo_flete,estado,observaciones,created_by
      ) values (
        v_hash,v_batch,nullif(btrim(v_row->>'orden_flete'),''),v_cantidad_nv,
        v_fecha_despacho,v_fecha_entrega,nullif(btrim(v_row->>'nv'),''),
        nullif(btrim(v_row->>'factura'),''),nullif(btrim(v_row->>'cliente'),''),
        nullif(btrim(v_row->>'destino'),''),nullif(btrim(v_row->>'comuna'),''),
        nullif(btrim(v_row->>'ciudad'),''),nullif(btrim(v_row->>'region'),''),
        nullif(btrim(v_row->>'transportista'),''),v_tipo,v_bultos,v_kilos,v_valor,
        v_costo,nullif(btrim(v_row->>'estado'),''),nullif(btrim(v_row->>'observaciones'),''),
        auth.uid()
      )
      on conflict (source_hash) do update set
        orden_flete=excluded.orden_flete,cantidad_nv=excluded.cantidad_nv,
        fecha_entrega=excluded.fecha_entrega,nv=excluded.nv,factura=excluded.factura,
        cliente=excluded.cliente,region=excluded.region,
        tipo_transporte=excluded.tipo_transporte,valor_venta=excluded.valor_venta,
        costo_flete=excluded.costo_flete,estado=excluded.estado,
        observaciones=excluded.observaciones,import_batch=excluded.import_batch,updated_at=now();
      if v_exists then v_actualizados := v_actualizados + 1;
      else v_insertados := v_insertados + 1; end if;
    exception when others then
      v_errores := v_errores + 1;
      raise warning 'Fila de flete % omitida: %',v_total,sqlerrm;
    end;
  end loop;

  return jsonb_build_object('batch',v_batch,'total',v_total,'insertados',v_insertados,
    'actualizados',v_actualizados,'errores',v_errores);
end;
$$;

create or replace function public.coord_rutas_analitica(
  p_desde date default null,
  p_hasta date default null
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare v_result jsonb;
begin
  if not public.coord_rutas_es_propietario() then raise exception 'Acceso privado denegado'; end if;
  if p_desde is not null and p_hasta is not null and p_desde > p_hasta then
    raise exception 'Rango de fechas invalido';
  end if;

  with base as (
    select f.*,
      coalesce(f.fecha_despacho,f.fecha_entrega,f.created_at::date) as fecha,
      coalesce(nullif(btrim(f.comuna),''),nullif(btrim(f.ciudad),''),nullif(btrim(f.destino),''),'Sin destino') as destino_analisis,
      case when coalesce(f.kilos,0)<=0 then 'Sin peso'
           when f.kilos<=10 then '0-10 kg'
           when f.kilos<=25 then '11-25 kg'
           when f.kilos<=50 then '26-50 kg'
           when f.kilos<=100 then '51-100 kg'
           else '+100 kg' end as tramo_peso
    from public.coord_rutas_fletes f
    where (p_desde is null or coalesce(f.fecha_despacho,f.fecha_entrega,f.created_at::date)>=p_desde)
      and (p_hasta is null or coalesce(f.fecha_despacho,f.fecha_entrega,f.created_at::date)<=p_hasta)
  ), summary as (
    select count(*)::integer despachos,coalesce(sum(cantidad_nv),0)::bigint nvs,
      coalesce(sum(bultos),0)::bigint bultos,
      coalesce(sum(kilos) filter(where kilos>0),0)::numeric kilos,
      coalesce(avg(kilos) filter(where kilos>0),0)::numeric kg_despacho,
      coalesce(avg(bultos) filter(where bultos>0),0)::numeric bultos_despacho,
      count(*) filter(where kilos>0)::integer con_peso,
      count(*) filter(where destino_analisis<>'Sin destino')::integer con_destino,
      count(*) filter(where nullif(btrim(coalesce(transportista,'')),'') is not null)::integer con_transportista,
      min(fecha) desde,max(fecha) hasta
    from base
  ), weight_rows as (
    select tramo_peso,count(*)::integer despachos,coalesce(sum(cantidad_nv),0)::bigint nvs,
      coalesce(sum(bultos),0)::bigint bultos,coalesce(sum(kilos),0)::numeric kilos,
      round(100*count(*)::numeric/nullif(sum(count(*)) over(),0),1) porcentaje
    from base where kilos>0 group by tramo_peso
  ), destination_rows as (
    select destino_analisis destino,max(region) region,count(*)::integer despachos,
      coalesce(sum(cantidad_nv),0)::bigint nvs,coalesce(sum(bultos),0)::bigint bultos,
      coalesce(sum(kilos) filter(where kilos>0),0)::numeric kilos
    from base where destino_analisis<>'Sin destino' group by destino_analisis
  ), carrier_rows as (
    select coalesce(nullif(btrim(transportista),''),'Sin transportista') transportista,
      max(tipo_transporte) tipo_transporte,count(*)::integer despachos,
      coalesce(sum(cantidad_nv),0)::bigint nvs,coalesce(sum(bultos),0)::bigint bultos,
      coalesce(sum(kilos) filter(where kilos>0),0)::numeric kilos,
      coalesce(avg(kilos) filter(where kilos>0),0)::numeric kg_despacho
    from base group by coalesce(nullif(btrim(transportista),''),'Sin transportista')
  )
  select jsonb_build_object(
    'summary',(select to_jsonb(s) from summary s),
    'weights',coalesce((select jsonb_agg(to_jsonb(w) order by case w.tramo_peso
      when '0-10 kg' then 1 when '11-25 kg' then 2 when '26-50 kg' then 3
      when '51-100 kg' then 4 else 5 end) from weight_rows w),'[]'::jsonb),
    'destinations',coalesce((select jsonb_agg(to_jsonb(d) order by d.despachos desc,d.kilos desc) from
      (select * from destination_rows order by despachos desc,kilos desc limit 20) d),'[]'::jsonb),
    'carriers',coalesce((select jsonb_agg(to_jsonb(c)||jsonb_build_object(
      'porcentaje',round(100*c.despachos::numeric/nullif((select despachos from summary),0),1),
      'principales_destinos',coalesce((select jsonb_agg(z.destino order by z.n desc) from
        (select b.destino_analisis destino,count(*) n from base b
         where coalesce(nullif(btrim(b.transportista),''),'Sin transportista')=c.transportista
           and b.destino_analisis<>'Sin destino' group by b.destino_analisis order by n desc limit 3) z),'[]'::jsonb)
      ) order by c.despachos desc) from carrier_rows c),'[]'::jsonb),
    'weight_destination',coalesce((select jsonb_agg(to_jsonb(x) order by x.despachos desc,x.kilos desc) from
      (select destino_analisis destino,tramo_peso,count(*)::integer despachos,
        coalesce(sum(cantidad_nv),0)::bigint nvs,coalesce(sum(kilos),0)::numeric kilos
       from base where kilos>0 and destino_analisis<>'Sin destino'
       group by destino_analisis,tramo_peso order by despachos desc,kilos desc limit 40) x),'[]'::jsonb),
    'timeline',jsonb_build_object(
      'day',coalesce((select jsonb_agg(to_jsonb(x) order by x.periodo) from
        (select fecha periodo,count(*)::integer despachos,coalesce(sum(cantidad_nv),0)::bigint nvs,
          coalesce(sum(bultos),0)::bigint bultos,coalesce(sum(kilos) filter(where kilos>0),0)::numeric kilos
         from base group by fecha) x),'[]'::jsonb),
      'week',coalesce((select jsonb_agg(to_jsonb(x) order by x.periodo) from
        (select date_trunc('week',fecha)::date periodo,count(*)::integer despachos,
          coalesce(sum(cantidad_nv),0)::bigint nvs,coalesce(sum(bultos),0)::bigint bultos,
          coalesce(sum(kilos) filter(where kilos>0),0)::numeric kilos from base group by 1) x),'[]'::jsonb),
      'month',coalesce((select jsonb_agg(to_jsonb(x) order by x.periodo) from
        (select date_trunc('month',fecha)::date periodo,count(*)::integer despachos,
          coalesce(sum(cantidad_nv),0)::bigint nvs,coalesce(sum(bultos),0)::bigint bultos,
          coalesce(sum(kilos) filter(where kilos>0),0)::numeric kilos from base group by 1) x),'[]'::jsonb)
    ),
    'transport_types',coalesce((select jsonb_agg(to_jsonb(x) order by x.despachos desc) from
      (select tipo_transporte,count(*)::integer despachos,coalesce(sum(cantidad_nv),0)::bigint nvs,
        round(100*count(*)::numeric/nullif(sum(count(*)) over(),0),1) porcentaje
       from base group by tipo_transporte) x),'[]'::jsonb),
    'quality',jsonb_build_object(
      'operaciones_total',(select count(*) from public.tms_operaciones),
      'operaciones_despachadas',(select count(*) from public.tms_operaciones where fecha_despacho is not null),
      'operaciones_bultos',(select coalesce(sum(bultos),0) from public.tms_operaciones),
      'fletes_total',(select despachos from summary),'nvs_total',(select nvs from summary),
      'fletes_con_peso',(select con_peso from summary),
      'fletes_con_destino',(select con_destino from summary),
      'fletes_con_transportista',(select con_transportista from summary),
      'pesos_mayores_460',(select count(*) from base where kilos>460),
      'kg_despacho_sin_mayores_460',(
        select coalesce(avg(kilos) filter(where kilos>0 and kilos<=460),0) from base
      ),
      'nota_volumen','No existen dimensiones historicas completas. Peso no equivale a volumen.'
    )
  ) into v_result;
  return v_result;
end;
$$;

revoke all on function public.coord_rutas_importar_fletes(jsonb) from public,anon;
revoke all on function public.coord_rutas_analitica(date,date) from public,anon;
grant execute on function public.coord_rutas_importar_fletes(jsonb) to authenticated,service_role;
grant execute on function public.coord_rutas_analitica(date,date) to authenticated,service_role;

alter table public.coord_rutas_cotizaciones
  add column if not exists modalidad_costo text not null default 'TODO_INCLUIDO',
  add column if not exists costo_tramo_adicional numeric(16,2) not null default 0;

alter table public.coord_rutas_cotizaciones
  drop constraint if exists coord_rutas_cotizaciones_modalidad_costo_check;
alter table public.coord_rutas_cotizaciones
  add constraint coord_rutas_cotizaciones_modalidad_costo_check
  check (modalidad_costo in ('TODO_INCLUIDO','DOS_TRAMOS'));
alter table public.coord_rutas_cotizaciones
  drop constraint if exists coord_rutas_cotizaciones_costo_tramo_adicional_check;
alter table public.coord_rutas_cotizaciones
  add constraint coord_rutas_cotizaciones_costo_tramo_adicional_check
  check (costo_tramo_adicional >= 0);

create or replace function public.coord_rutas_calcular_costo(p_data jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tarifa public.coord_rutas_tarifas%rowtype;
  v_nv integer := greatest(coalesce(nullif(p_data->>'cantidad_nv','')::integer,1),1);
  v_bultos integer := greatest(coalesce(nullif(p_data->>'bultos','')::integer,0),1);
  v_kilos numeric := greatest(coalesce(nullif(p_data->>'kilos','')::numeric,0),0);
  v_km numeric := greatest(coalesce(nullif(p_data->>'distancia_km','')::numeric,0),0);
  v_valor numeric := greatest(coalesce(nullif(p_data->>'valor_nv_total','')::numeric,0),0);
  v_modalidad text := upper(coalesce(nullif(btrim(p_data->>'modalidad_costo'),''),'TODO_INCLUIDO'));
  v_tramo numeric := greatest(coalesce(nullif(p_data->>'costo_tramo_adicional','')::numeric,0),0);
  v_tarifa_subtotal numeric;
  v_subtotal numeric;
  v_recargo numeric;
  v_total numeric;
  v_saved public.coord_rutas_cotizaciones%rowtype;
begin
  if not public.coord_rutas_es_propietario() then raise exception 'Acceso privado denegado'; end if;
  if v_modalidad not in ('TODO_INCLUIDO','DOS_TRAMOS') then
    raise exception 'Modalidad de costo invalida';
  end if;
  if v_modalidad='TODO_INCLUIDO' then v_tramo := 0; end if;
  if v_modalidad='DOS_TRAMOS' and v_tramo<=0 then
    raise exception 'El costo del transportista regional es obligatorio en modalidad de dos tramos';
  end if;

  select * into v_tarifa from public.coord_rutas_tarifas
  where id=(p_data->>'tarifa_id')::bigint and activo
    and current_date>=vigencia_desde
    and (vigencia_hasta is null or current_date<=vigencia_hasta);
  if v_tarifa.id is null then raise exception 'Tarifa no disponible o fuera de vigencia'; end if;

  v_tarifa_subtotal := greatest(
    v_tarifa.minimo,
    v_tarifa.cargo_base+v_tarifa.tarifa_nv*v_nv+v_tarifa.tarifa_bulto*v_bultos
      +v_tarifa.tarifa_kg*v_kilos+v_tarifa.tarifa_km*v_km
  );
  v_subtotal := v_tarifa_subtotal+v_tramo;
  v_recargo := round(v_tarifa_subtotal*v_tarifa.recargo_pct,2);
  v_total := round(v_subtotal+v_recargo,2);

  if coalesce((p_data->>'guardar')::boolean,false) then
    insert into public.coord_rutas_cotizaciones (
      tarifa_id,nv_referencia,destino,region,ambito,cantidad_nv,bultos,kilos,
      distancia_km,duracion_minutos,valor_nv_total,subtotal,recargo,total,
      costo_por_nv,costo_por_bulto,porcentaje_venta,espera_motivo,espera_desde,
      modalidad_costo,costo_tramo_adicional,created_by
    ) values (
      v_tarifa.id,nullif(btrim(p_data->>'nv_referencia'),''),
      coalesce(nullif(btrim(p_data->>'destino'),''),'Sin destino'),
      nullif(btrim(p_data->>'region'),''),v_tarifa.ambito,v_nv,v_bultos,
      nullif(p_data->>'kilos','')::numeric,nullif(p_data->>'distancia_km','')::numeric,
      nullif(p_data->>'duracion_minutos','')::integer,nullif(p_data->>'valor_nv_total','')::numeric,
      v_subtotal,v_recargo,v_total,round(v_total/v_nv,2),round(v_total/v_bultos,2),
      case when v_valor>0 then round(100*v_total/v_valor,4) end,
      nullif(upper(btrim(p_data->>'espera_motivo')),''),
      case when nullif(p_data->>'espera_motivo','') is not null then now() end,
      v_modalidad,v_tramo,auth.uid()
    ) returning * into v_saved;
  end if;

  return jsonb_build_object(
    'cotizacion_id',v_saved.id,'tarifa',to_jsonb(v_tarifa),
    'modalidad_costo',v_modalidad,
    'formula',jsonb_build_object(
      'cargo_base',v_tarifa.cargo_base,'por_nv',v_tarifa.tarifa_nv*v_nv,
      'por_bulto',v_tarifa.tarifa_bulto*v_bultos,'por_kg',v_tarifa.tarifa_kg*v_kilos,
      'por_km',v_tarifa.tarifa_km*v_km,'tramo_adicional',v_tramo,
      'minimo_aplicado',v_tarifa_subtotal>(v_tarifa.cargo_base+v_tarifa.tarifa_nv*v_nv
        +v_tarifa.tarifa_bulto*v_bultos+v_tarifa.tarifa_kg*v_kilos+v_tarifa.tarifa_km*v_km)
    ),
    'subtotal',v_subtotal,'recargo',v_recargo,'total',v_total,
    'costo_por_nv',round(v_total/v_nv,2),'costo_por_bulto',round(v_total/v_bultos,2),
    'porcentaje_venta',case when v_valor>0 then round(100*v_total/v_valor,4) end,
    'sla',jsonb_build_object(
      'horas',48,'se_pausa',false,
      'espera_motivo',nullif(upper(btrim(p_data->>'espera_motivo')),''),
      'mensaje','La espera se atribuye, pero no detiene el SLA contractual.'
    )
  );
end;
$$;

revoke all on function public.coord_rutas_calcular_costo(jsonb) from public,anon;
grant execute on function public.coord_rutas_calcular_costo(jsonb) to authenticated,service_role;

comment on column public.coord_rutas_fletes.orden_flete is
  'Identificador fisico del despacho; evita duplicar bultos y kilos cuando agrupa varias N.V.';
comment on column public.coord_rutas_fletes.cantidad_nv is
  'Cantidad de N.V. o documentos consolidados en la orden de flete.';
