-- Diagnostico historico privado para Coordinacion de Rutas.
-- Los datos y RPC permanecen restringidos al propietario del piloto.

create table if not exists public.coord_rutas_fletes (
  id bigint generated always as identity primary key,
  source_hash text not null unique,
  import_batch uuid not null default gen_random_uuid(),
  fecha_despacho date,
  fecha_entrega date,
  nv text,
  factura text,
  cliente text,
  destino text,
  comuna text,
  ciudad text,
  region text,
  transportista text,
  tipo_transporte text not null default 'SIN_CLASIFICAR'
    check (tipo_transporte in ('PROPIO','EXTERNO','RETIRO_CLIENTE','SIN_CLASIFICAR')),
  bultos integer check (bultos is null or bultos between 0 and 100000),
  kilos numeric(14,3) check (kilos is null or kilos between 0 and 1000000),
  valor_venta numeric(16,2) check (valor_venta is null or valor_venta >= 0),
  costo_flete numeric(16,2) check (costo_flete is null or costo_flete >= 0),
  estado text,
  observaciones text,
  created_by uuid not null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint coord_flete_identificable check (
    nullif(btrim(coalesce(nv,'')), '') is not null
    or nullif(btrim(coalesce(factura,'')), '') is not null
    or nullif(btrim(coalesce(cliente,'')), '') is not null
  )
);

create index if not exists ix_coord_fletes_fecha
  on public.coord_rutas_fletes (fecha_despacho, fecha_entrega);
create index if not exists ix_coord_fletes_transportista
  on public.coord_rutas_fletes (transportista);
create index if not exists ix_coord_fletes_destino
  on public.coord_rutas_fletes (comuna, ciudad, region);
create index if not exists ix_coord_fletes_peso
  on public.coord_rutas_fletes (kilos) where kilos > 0;

alter table public.coord_rutas_fletes enable row level security;
drop policy if exists coord_fletes_owner_select on public.coord_rutas_fletes;
create policy coord_fletes_owner_select on public.coord_rutas_fletes
  for select to authenticated using ((select public.coord_rutas_es_propietario()));

revoke all on table public.coord_rutas_fletes from public, anon, authenticated;
revoke all on sequence public.coord_rutas_fletes_id_seq from public, anon, authenticated;
grant select on table public.coord_rutas_fletes to authenticated, service_role;

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
      if coalesce(nullif(btrim(v_row->>'nv'),''),nullif(btrim(v_row->>'factura'),''),nullif(btrim(v_row->>'cliente'),'')) is null then
        raise exception 'Fila sin N.V., factura ni cliente';
      end if;

      v_hash := md5(concat_ws('|',
        lower(btrim(coalesce(v_row->>'nv',''))),
        lower(btrim(coalesce(v_row->>'factura',''))),
        coalesce(v_fecha_despacho::text,''),
        lower(btrim(coalesce(v_row->>'destino',v_row->>'comuna',v_row->>'ciudad',''))),
        lower(btrim(coalesce(v_row->>'transportista',''))),
        coalesce(v_bultos::text,''), coalesce(v_kilos::text,'')
      ));
      select exists(select 1 from public.coord_rutas_fletes where source_hash=v_hash) into v_exists;

      insert into public.coord_rutas_fletes (
        source_hash,import_batch,fecha_despacho,fecha_entrega,nv,factura,cliente,destino,
        comuna,ciudad,region,transportista,tipo_transporte,bultos,kilos,valor_venta,
        costo_flete,estado,observaciones,created_by
      ) values (
        v_hash,v_batch,v_fecha_despacho,v_fecha_entrega,nullif(btrim(v_row->>'nv'),''),
        nullif(btrim(v_row->>'factura'),''),nullif(btrim(v_row->>'cliente'),''),
        nullif(btrim(v_row->>'destino'),''),nullif(btrim(v_row->>'comuna'),''),
        nullif(btrim(v_row->>'ciudad'),''),nullif(btrim(v_row->>'region'),''),
        nullif(btrim(v_row->>'transportista'),''),v_tipo,v_bultos,v_kilos,v_valor,v_costo,
        nullif(btrim(v_row->>'estado'),''),nullif(btrim(v_row->>'observaciones'),''),auth.uid()
      )
      on conflict (source_hash) do update set
        fecha_entrega=excluded.fecha_entrega, cliente=excluded.cliente,
        region=excluded.region, tipo_transporte=excluded.tipo_transporte,
        valor_venta=excluded.valor_venta, costo_flete=excluded.costo_flete,
        estado=excluded.estado, observaciones=excluded.observaciones,
        import_batch=excluded.import_batch, updated_at=now();
      if v_exists then v_actualizados := v_actualizados + 1;
      else v_insertados := v_insertados + 1; end if;
    exception when others then
      v_errores := v_errores + 1;
      raise warning 'Fila de flete % omitida: %', v_total, sqlerrm;
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
    select count(*)::integer despachos,coalesce(sum(bultos),0)::bigint bultos,
      coalesce(sum(kilos) filter(where kilos>0),0)::numeric kilos,
      coalesce(avg(kilos) filter(where kilos>0),0)::numeric kg_despacho,
      coalesce(avg(bultos) filter(where bultos>0),0)::numeric bultos_despacho,
      count(*) filter(where kilos>0)::integer con_peso,
      count(*) filter(where destino_analisis<>'Sin destino')::integer con_destino,
      count(*) filter(where nullif(btrim(coalesce(transportista,'')),'') is not null)::integer con_transportista,
      min(fecha) desde,max(fecha) hasta
    from base
  ), weight_rows as (
    select tramo_peso,count(*)::integer despachos,coalesce(sum(bultos),0)::bigint bultos,
      coalesce(sum(kilos),0)::numeric kilos,
      round(100*count(*)::numeric/nullif(sum(count(*)) over(),0),1) porcentaje
    from base where kilos>0 group by tramo_peso
  ), destination_rows as (
    select destino_analisis destino,max(region) region,count(*)::integer despachos,
      coalesce(sum(bultos),0)::bigint bultos,coalesce(sum(kilos) filter(where kilos>0),0)::numeric kilos
    from base where destino_analisis<>'Sin destino' group by destino_analisis
  ), carrier_rows as (
    select coalesce(nullif(btrim(transportista),''),'Sin transportista') transportista,
      max(tipo_transporte) tipo_transporte,count(*)::integer despachos,
      coalesce(sum(bultos),0)::bigint bultos,coalesce(sum(kilos) filter(where kilos>0),0)::numeric kilos,
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
        coalesce(sum(kilos),0)::numeric kilos from base where kilos>0 and destino_analisis<>'Sin destino'
       group by destino_analisis,tramo_peso order by despachos desc,kilos desc limit 40) x),'[]'::jsonb),
    'timeline',jsonb_build_object(
      'day',coalesce((select jsonb_agg(to_jsonb(x) order by x.periodo) from
        (select fecha periodo,count(*)::integer despachos,coalesce(sum(bultos),0)::bigint bultos,
          coalesce(sum(kilos) filter(where kilos>0),0)::numeric kilos from base group by fecha) x),'[]'::jsonb),
      'week',coalesce((select jsonb_agg(to_jsonb(x) order by x.periodo) from
        (select date_trunc('week',fecha)::date periodo,count(*)::integer despachos,
          coalesce(sum(bultos),0)::bigint bultos,coalesce(sum(kilos) filter(where kilos>0),0)::numeric kilos
         from base group by 1) x),'[]'::jsonb),
      'month',coalesce((select jsonb_agg(to_jsonb(x) order by x.periodo) from
        (select date_trunc('month',fecha)::date periodo,count(*)::integer despachos,
          coalesce(sum(bultos),0)::bigint bultos,coalesce(sum(kilos) filter(where kilos>0),0)::numeric kilos
         from base group by 1) x),'[]'::jsonb)
    ),
    'transport_types',coalesce((select jsonb_agg(to_jsonb(x) order by x.despachos desc) from
      (select tipo_transporte,count(*)::integer despachos,
        round(100*count(*)::numeric/nullif(sum(count(*)) over(),0),1) porcentaje
       from base group by tipo_transporte) x),'[]'::jsonb),
    'quality',jsonb_build_object(
      'operaciones_total',(select count(*) from public.tms_operaciones),
      'operaciones_despachadas',(select count(*) from public.tms_operaciones where fecha_despacho is not null),
      'operaciones_bultos',(select coalesce(sum(bultos),0) from public.tms_operaciones),
      'fletes_total',(select despachos from summary),
      'fletes_con_peso',(select con_peso from summary),
      'fletes_con_destino',(select con_destino from summary),
      'fletes_con_transportista',(select con_transportista from summary),
      'nota_volumen','No existen dimensiones historicas completas. Peso no equivale a volumen.'
    )
  ) into v_result;
  return v_result;
end;
$$;

revoke all on function public.coord_rutas_importar_fletes(jsonb) from public, anon;
revoke all on function public.coord_rutas_analitica(date,date) from public, anon;
grant execute on function public.coord_rutas_importar_fletes(jsonb) to authenticated, service_role;
grant execute on function public.coord_rutas_analitica(date,date) to authenticated, service_role;

comment on table public.coord_rutas_fletes is
  'Historico privado de fletes para diagnostico y planificacion; no contiene volumen inferido.';
