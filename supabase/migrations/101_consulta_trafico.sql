-- ============================================================================
--  101_consulta_trafico.sql
--  Tráfico de la Consulta pública (/consulta) para admin, SIN datos personales:
--  solo un contador diario (total + con/sin resultado). No guarda IP ni el
--  número consultado.
--
--  • Tabla tms_consulta_metricas (dia PK, total, con_resultado, sin_resultado).
--  • buscar_nv_publico incrementa el contador del día (zona Chile) tras pasar
--    el rate-limit — solo cuentan consultas válidas.
--  • Lectura para authenticated (el panel filtra por admin en el front).
-- ============================================================================

create table if not exists public.tms_consulta_metricas (
  dia            date primary key,
  total          integer not null default 0,
  con_resultado  integer not null default 0,
  sin_resultado  integer not null default 0
);

alter table public.tms_consulta_metricas enable row level security;
drop policy if exists consulta_metricas_select on public.tms_consulta_metricas;
create policy consulta_metricas_select on public.tms_consulta_metricas
  for select to authenticated using (true);
grant select on public.tms_consulta_metricas to authenticated;
-- anon NO lee ni escribe directo; el contador lo escribe la RPC (definer).

create or replace function public.buscar_nv_publico(p_q text)
 returns table(id bigint, canal text, nv text, nv_ptm bigint, nv_orange text, nv_farmapack text, varios text, factura text, guia text, numero_envio text, cliente text, tipo_despacho text, transportista text, estado text, urgente boolean, bultos bigint, fecha_registro_nv timestamp with time zone, fecha_aprobacion date, fecha_compromiso date, fecha_facturacion text, fecha_en_proceso date, fecha_shipping date, fecha_despacho date, fecha_en_ruta date, fecha_entregado date, fecha_estado timestamp with time zone)
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
declare
  v_q    text := btrim(coalesce(p_q, ''));
  v_ip   text;
  v_hits integer;
  v_found boolean;
begin
  if length(v_q) < 3 or length(v_q) > 40 then
    return;
  end if;

  v_ip := coalesce(
    nullif(split_part(current_setting('request.headers', true)::json ->> 'x-forwarded-for', ',', 1), ''),
    current_setting('request.headers', true)::json ->> 'cf-connecting-ip',
    'desconocida');

  insert into public.tms_consulta_rate as r (ip, ventana, hits)
       values (v_ip, now(), 1)
  on conflict (ip) do update
       set hits    = case when now() - r.ventana > interval '60 seconds' then 1 else r.hits + 1 end,
           ventana = case when now() - r.ventana > interval '60 seconds' then now() else r.ventana end
  returning r.hits into v_hits;

  if v_hits > 30 then
    raise exception 'rate_limited'
      using errcode = 'P0001',
            hint = 'Demasiadas consultas seguidas; espera un momento.';
  end if;

  if random() < 0.02 then
    delete from public.tms_consulta_rate where ventana < now() - interval '1 hour';
  end if;

  -- ¿hubo coincidencia? (para el contador con/sin resultado)
  select exists (
    select 1 from public.tms_operaciones o
    where (v_q ~ '^\d+$' and o.nv_ptm::text = v_q)
       or lower(nullif(o.nv_orange, ''))    = lower(v_q)
       or lower(nullif(o.nv_farmapack, '')) = lower(v_q)
       or lower(nullif(o.varios, ''))       = lower(v_q)
       or lower(nullif(o.factura, ''))      = lower(v_q)
       or lower(nullif(o.guia, ''))         = lower(v_q)
       or lower(nullif(o.numero_envio, '')) = lower(v_q)
  ) into v_found;

  -- Contador diario (zona Chile), sin PII.
  insert into public.tms_consulta_metricas as m (dia, total, con_resultado, sin_resultado)
       values ((now() at time zone 'America/Santiago')::date, 1,
               case when v_found then 1 else 0 end, case when v_found then 0 else 1 end)
  on conflict (dia) do update
       set total         = m.total + 1,
           con_resultado = m.con_resultado + (case when v_found then 1 else 0 end),
           sin_resultado = m.sin_resultado + (case when v_found then 0 else 1 end);

  return query
  select
    o.id,
    case when o.nv_ptm is not null then 'PTM'
         when o.nv_orange is not null and o.nv_orange <> '' then 'Orange'
         when o.nv_farmapack is not null and o.nv_farmapack <> '' then 'Farmapack'
         else 'Varios' end as canal,
    coalesce(o.nv_ptm::text, nullif(o.nv_orange,''), nullif(o.nv_farmapack,''), o.varios, '—') as nv,
    o.nv_ptm, o.nv_orange, o.nv_farmapack, o.varios,
    o.factura, o.guia, o.numero_envio,
    o.cliente, o.tipo_despacho, o.transportista,
    o.estado, o.urgente, o.bultos,
    o.fecha_registro_nv, o.fecha_aprobacion, o.fecha_compromiso, o.fecha_facturacion,
    o.fecha_en_proceso, o.fecha_shipping, o.fecha_despacho, o.fecha_en_ruta, o.fecha_entregado,
    o.fecha_estado
  from public.tms_operaciones o
  where (v_q ~ '^\d+$' and o.nv_ptm::text = v_q)
     or lower(nullif(o.nv_orange, ''))    = lower(v_q)
     or lower(nullif(o.nv_farmapack, '')) = lower(v_q)
     or lower(nullif(o.varios, ''))       = lower(v_q)
     or lower(nullif(o.factura, ''))      = lower(v_q)
     or lower(nullif(o.guia, ''))         = lower(v_q)
     or lower(nullif(o.numero_envio, '')) = lower(v_q)
  order by o.fecha_estado desc nulls last
  limit 10;
end;
$function$;
