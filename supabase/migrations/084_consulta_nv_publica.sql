-- 084_consulta_nv_publica.sql
-- ============================================================================
--  Consulta pública de Nota de Venta (Info N.V. sin login).
--  Único acceso público del Panel en CCO: permite a un cliente/courier seguir
--  el estado y la logística de una NV SIN exponer datos financieros ni internos.
--
--  Expone (curado): estado, fechas del flujo, transportista/empresa, guía,
--  N° de envío, cliente, canal, N.V., tipo de despacho, bultos, fill rate y el
--  estado de incidencia. OCULTA a propósito: valor_factura, valor_nv,
--  costo_flete (montos), vendedor, centro_costo, division, fecha_aprobacion_real
--  y observaciones_incidencia (notas internas).
--
--  Anti-abuso: SECURITY DEFINER (lee saltando RLS pero solo los campos del
--  SELECT), exige término de ≥3 caracteres y tope de 25 resultados → no permite
--  volcar la tabla. Ejecutable por anon (página pública) y authenticated.
-- ============================================================================
create or replace function public.buscar_nv_publico(p_q text)
returns table (
  id bigint, canal text, nv text,
  nv_ptm bigint, nv_orange text, nv_farmapack text, varios text,
  factura text, guia text, numero_envio text,
  cliente text, tipo_despacho text, transportista text, empresa_transporte text,
  estado text, urgente boolean, bultos bigint, fillrate text,
  incidencia text, estado_incidencia text, dias_incidencia bigint,
  fecha_registro_nv timestamptz, fecha_aprobacion date, fecha_compromiso date,
  fecha_facturacion text, fecha_en_proceso date, fecha_shipping date,
  fecha_despacho date, fecha_en_ruta date, fecha_entregado date, fecha_estado timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    o.id,
    case when o.nv_ptm is not null then 'PTM'
         when o.nv_orange is not null and o.nv_orange <> '' then 'Orange'
         when o.nv_farmapack is not null and o.nv_farmapack <> '' then 'Farmapack'
         else 'Varios' end as canal,
    coalesce(o.nv_ptm::text, nullif(o.nv_orange,''), nullif(o.nv_farmapack,''), o.varios, '—') as nv,
    o.nv_ptm, o.nv_orange, o.nv_farmapack, o.varios,
    o.factura, o.guia, o.numero_envio,
    o.cliente, o.tipo_despacho, o.transportista, o.empresa_transporte,
    o.estado, o.urgente, o.bultos, o.fillrate,
    o.incidencia, o.estado_incidencia, o.dias_incidencia,
    o.fecha_registro_nv, o.fecha_aprobacion, o.fecha_compromiso, o.fecha_facturacion,
    o.fecha_en_proceso, o.fecha_shipping, o.fecha_despacho, o.fecha_en_ruta, o.fecha_entregado, o.fecha_estado
  from public.tms_operaciones o
  where length(btrim(p_q)) >= 3
    and (
      o.nv_ptm::text = btrim(p_q)
      or o.nv_orange ilike '%'||btrim(p_q)||'%'
      or o.nv_farmapack ilike '%'||btrim(p_q)||'%'
      or o.varios ilike '%'||btrim(p_q)||'%'
      or o.factura ilike '%'||btrim(p_q)||'%'
      or o.guia ilike '%'||btrim(p_q)||'%'
      or o.numero_envio ilike '%'||btrim(p_q)||'%'
      or o.cliente ilike '%'||btrim(p_q)||'%'
    )
  order by o.fecha_estado desc nulls last
  limit 25;
$$;

revoke all on function public.buscar_nv_publico(text) from public;
grant execute on function public.buscar_nv_publico(text) to anon, authenticated;

comment on function public.buscar_nv_publico(text) is
  'Consulta pública de NV (sin login): estado + logística, sin montos ni datos internos. Min 3 chars, tope 25.';
