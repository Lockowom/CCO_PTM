-- 083_operaciones_sync_dual.sql
-- ============================================================================
--  Auto-refresco de tms_operaciones desde el Panel (doble corrida / Fase 2 del
--  plan de migración). Mientras el Google Sheet siga siendo la fuente de verdad
--  (antes del cutover), CCO se mantiene fresca reejecutando el import cada 10
--  min: lee la PostgREST del Panel (server-side, extensión http) y reemplaza el
--  set 'sheet' en UNA transacción (delete+insert atómico → los lectores nunca
--  ven la tabla vacía). Preserva filas nativas de CCO (origen='cco').
--
--  Al hacer el CUTOVER (CCO pasa a ser la fuente de verdad) se DESACTIVA el cron:
--     select cron.unschedule('panel-sync-operaciones');
--
--  Nota: el `anon_key` es la llave PÚBLICA anon del Panel (la misma que viaja en
--  el bundle del dashboard) — NO es un secreto. Vive en el esquema `private`
--  (no expuesto por la API) solo para no hardcodearla en la función.
-- ============================================================================

create extension if not exists http     with schema extensions;
create extension if not exists pg_cron;

-- ── Config de la sincronización (privada) ───────────────────────────────────
create table if not exists private.panel_sync_config (
  id        smallint primary key default 1 check (id = 1),
  base_url  text not null,
  anon_key  text not null,
  enabled   boolean not null default true
);

insert into private.panel_sync_config (id, base_url, anon_key, enabled) values (
  1,
  'https://yynlmcxmkrlmhqqoxskb.supabase.co/rest/v1/operaciones?select=*&order=id.asc',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5bmxtY3hta3JsbWhxcW94c2tiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExMTQzMzgsImV4cCI6MjA5NjY5MDMzOH0.zO8D87FBytEvSRuhiAhtBI733qHqCLhViJVkHdU-D6k',
  true
) on conflict (id) do update set base_url = excluded.base_url, anon_key = excluded.anon_key;

-- ── Estado de la sincronización (observabilidad) ────────────────────────────
create table if not exists public.tms_operaciones_sync (
  id           smallint primary key default 1 check (id = 1),
  last_sync_at timestamptz,
  row_count    integer,
  ok           boolean,
  detalle      text
);
insert into public.tms_operaciones_sync (id) values (1) on conflict (id) do nothing;
alter table public.tms_operaciones_sync enable row level security;
drop policy if exists p_tms_oper_sync_sel on public.tms_operaciones_sync;
create policy p_tms_oper_sync_sel on public.tms_operaciones_sync for select to authenticated using (true);

-- ── Función de sincronización (reemplazo atómico del set 'sheet') ───────────
create or replace function public.panel_sync_operaciones()
returns text
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  cfg private.panel_sync_config;
  off int := 0; body jsonb; cnt int; total int := 0;
begin
  select * into cfg from private.panel_sync_config where id = 1;
  if cfg is null or not cfg.enabled then return 'deshabilitado'; end if;
  perform set_config('statement_timeout','180000', true);

  delete from public.tms_operaciones where origen = 'sheet';
  loop
    select content::jsonb into body
    from extensions.http_get(cfg.base_url || '&limit=500&offset=' || off || '&apikey=' || cfg.anon_key);
    if body is null or jsonb_array_length(body) = 0 then exit; end if;
    insert into public.tms_operaciones
      (nv_ptm,nv_orange,nv_farmapack,varios,factura,guia,numero_envio,vendedor,cliente,centro_costo,division,
       transportista,empresa_transporte,tipo_despacho,estado,urgente,
       fecha_aprobacion,fecha_aprobacion_real,fecha_facturacion,fecha_despacho,fecha_compromiso,
       fecha_estado,fecha_registro_nv,fecha_en_proceso,fecha_shipping,fecha_en_ruta,fecha_entregado,
       valor_factura,costo_flete,valor_nv,bultos,dias_en_proceso,
       incidencia,estado_incidencia,observaciones_incidencia,dias_incidencia,fillrate,created_at,origen,row_hash)
    select
       r.nv_ptm,r.nv_orange,r.nv_farmapack,r.varios,r.factura,r.guia,r.numero_envio,r.vendedor,r.cliente,r.centro_costo,r.division,
       r.transportista,r.empresa_transporte,r.tipo_despacho,r.estado,coalesce(r.urgente,false),
       r.fecha_aprobacion,r.fecha_aprobacion_real,r.fecha_facturacion,r.fecha_despacho,r.fecha_compromiso,
       r.fecha_estado,r.fecha_registro_nv,r.fecha_en_proceso,r.fecha_shipping,r.fecha_en_ruta,r.fecha_entregado,
       r.valor_factura,r.costo_flete,r.valor_nv,r.bultos,coalesce(r.dias_en_proceso,0),
       r.incidencia,r.estado_incidencia,r.observaciones_incidencia,coalesce(r.dias_incidencia,0),r.fillrate,
       coalesce(r.created_at, now()),'sheet',
       md5(concat_ws('|',r.nv_ptm::text,r.nv_orange,r.nv_farmapack,r.varios,r.guia,r.factura,r.estado,r.fecha_despacho::text,r.bultos::text,r.valor_nv::text))
    from jsonb_populate_recordset(null::public.tms_operaciones, body) r;
    get diagnostics cnt = row_count;
    total := total + cnt;
    exit when jsonb_array_length(body) < 500;
    off := off + 500;
  end loop;

  update public.tms_operaciones_sync
     set last_sync_at = now(), row_count = total, ok = true, detalle = null where id = 1;
  return 'sync ok: ' || total;
end;
$$;

-- Solo el owner/cron ejecutan (nunca anon/authenticated).
revoke all on function public.panel_sync_operaciones() from public;

-- Reemplaza a la función temporal del import inicial.
drop function if exists public._migrar_operaciones();

-- ── Programación cada 10 min ────────────────────────────────────────────────
select cron.unschedule('panel-sync-operaciones')
  where exists (select 1 from cron.job where jobname = 'panel-sync-operaciones');
select cron.schedule('panel-sync-operaciones', '*/10 * * * *', $$ select public.panel_sync_operaciones(); $$);
