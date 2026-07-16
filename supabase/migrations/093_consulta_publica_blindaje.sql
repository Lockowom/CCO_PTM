-- ============================================================================
--  093_consulta_publica_blindaje.sql
--  BLINDAJE de la consulta pública de N.V. (/consulta, sin login) + cierre de
--  la superficie anónima. Objetivo: que el módulo sea de uso público SIN que
--  nadie pueda "meterse al sistema", enumerar clientes ni escribir nada.
--
--  Contexto verificado antes de esta migración:
--   · RLS de tms_operaciones/tms_nv_catalogo/tms_panel_vendedores = solo
--     {authenticated} → el rol `anon` (cuya llave viaja en el bundle público)
--     NO puede leer ninguna tabla directamente (default-deny). ✔
--   · Las RPC de escritura del Panel son SECURITY DEFINER pero chequean
--     `_panel_puede_escribir()` que para `anon` da FALSE → no puede escribir. ✔
--  Esta migración agrega DEFENSA EN PROFUNDIDAD sobre esa base ya segura.
-- ============================================================================

-- ── 1) Rate-limit por IP para la consulta pública ───────────────────────────
-- Tabla contadora (una fila por IP, ventana fija). Sólo la usa la RPC
-- SECURITY DEFINER; se bloquea el acceso directo de cualquier rol cliente.
create table if not exists public.tms_consulta_rate (
  ip       text primary key,
  ventana  timestamptz not null default now(),
  hits     integer     not null default 0
);
alter table public.tms_consulta_rate enable row level security;  -- sin policies ⇒ nadie directo
revoke all on public.tms_consulta_rate from anon, authenticated;

-- ── 2) RPC pública blindada: coincidencia EXACTA + campos mínimos + rate-limit ─
-- Cambia la firma (menos columnas) ⇒ hay que DROP + CREATE.
drop function if exists public.buscar_nv_publico(text);

create function public.buscar_nv_publico(p_q text)
returns table (
  id bigint, canal text, nv text,
  nv_ptm bigint, nv_orange text, nv_farmapack text, varios text,
  factura text, guia text, numero_envio text,
  cliente text, tipo_despacho text, transportista text,
  estado text, urgente boolean, bultos bigint,
  fecha_registro_nv timestamptz, fecha_aprobacion date, fecha_compromiso date,
  fecha_facturacion text, fecha_en_proceso date, fecha_shipping date,
  fecha_despacho date, fecha_en_ruta date, fecha_entregado date,
  fecha_estado timestamptz
)
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_q    text := btrim(coalesce(p_q, ''));
  v_ip   text;
  v_hits integer;
begin
  -- Sólo búsquedas concretas (documento en mano). Nada demasiado corto.
  if length(v_q) < 3 or length(v_q) > 40 then
    return;
  end if;

  -- Rate-limit por IP real (cabecera puesta por el gateway de Supabase). Ventana
  -- fija de 60s, máx. 30 consultas → frena enumeración/scraping incluso si alguien
  -- llama la RPC directo con la llave anónima (un proxy HTTP no podría).
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

  -- Limpieza oportunista para que la tabla no crezca.
  if random() < 0.02 then
    delete from public.tms_consulta_rate where ventana < now() - interval '1 hour';
  end if;

  -- Coincidencia EXACTA (sin substring, sin buscar por nombre de cliente): sólo
  -- encuentra quien tiene el número exacto de su documento. Devuelve un conjunto
  -- MÍNIMO no sensible (sin montos, vendedor, centro de costo, incidencias,
  -- fillrate ni empresa de transporte).
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
     or lower(nullif(o.nv_orange, ''))   = lower(v_q)
     or lower(nullif(o.nv_farmapack, '')) = lower(v_q)
     or lower(nullif(o.varios, ''))       = lower(v_q)
     or lower(nullif(o.factura, ''))      = lower(v_q)
     or lower(nullif(o.guia, ''))         = lower(v_q)
     or lower(nullif(o.numero_envio, '')) = lower(v_q)
  order by o.fecha_estado desc nulls last
  limit 10;
end;
$$;

-- La consulta pública sigue siendo ejecutable por anon (y authenticated).
grant execute on function public.buscar_nv_publico(text) to anon, authenticated;

-- ── 3) Cierre de la superficie anónima: quitar EXECUTE a `anon` en las RPC de
--       escritura/lectura interna del Panel (siguen disponibles para
--       `authenticated`). Ya estaban protegidas por su guard interno; esto es
--       defensa en profundidad para que `anon` ni siquiera las alcance.
revoke execute on function public.guardar_nv(jsonb)                                   from anon;
revoke execute on function public.eliminar_nv(bigint)                                 from anon;
revoke execute on function public.cambiar_estado_nv(bigint, text, boolean)            from anon;
revoke execute on function public.batch_update_nv_estado(uuid[], text, text)          from anon;
revoke execute on function public.guardar_consolidado(jsonb)                          from anon;
revoke execute on function public.eliminar_consolidado(bigint)                        from anon;
revoke execute on function public.guardar_panel_catalogo(text, jsonb)                 from anon;
revoke execute on function public.toggle_panel_catalogo(text, bigint, boolean)        from anon;
revoke execute on function public.eliminar_panel_catalogo(text, bigint)               from anon;
revoke execute on function public.guardar_dashboard(jsonb)                            from anon;
revoke execute on function public.eliminar_dashboard(text)                            from anon;
revoke execute on function public.guardar_campo_calculado(jsonb)                      from anon;
revoke execute on function public.eliminar_campo_calculado(bigint)                    from anon;
revoke execute on function public.panel_sync_operaciones()                            from anon;

-- Nota: se conservan como públicas SOLO las 3 superficies previstas:
--   buscar_nv_publico (esta), verificar_certificado (/verificar) y
--   crear_pv_ticket (intake Post-Venta vía Edge Function con anti-bot).
