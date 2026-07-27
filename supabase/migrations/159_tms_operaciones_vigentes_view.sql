-- ============================================================================
-- 159_tms_operaciones_vigentes_view.sql
-- SSOT de lectura para Panel: una sola fila vigente por N.V. (canal:nv).
-- Mantiene `tms_operaciones` como histórico multi-fila, pero expone una vista
-- consistente para dashboard, búsqueda, TV, detalle y lookups operacionales.
-- ============================================================================

drop view if exists public.tms_operaciones_vigentes;

create view public.tms_operaciones_vigentes
with (security_invoker = true)
as
with ranked as (
  select
    o.*,
    case
      when o.nv_ptm is not null then 'ptm:' || o.nv_ptm::text
      when nullif(btrim(coalesce(o.nv_orange, '')), '') is not null then 'orange:' || lower(btrim(o.nv_orange))
      when nullif(btrim(coalesce(o.nv_farmapack, '')), '') is not null then 'farmapack:' || lower(btrim(o.nv_farmapack))
      when nullif(btrim(coalesce(o.varios, '')), '') is not null then 'varios:' || lower(btrim(o.varios))
      else 'row:' || o.id::text
    end as nv_key,
    row_number() over (
      partition by
        case
          when o.nv_ptm is not null then 'ptm:' || o.nv_ptm::text
          when nullif(btrim(coalesce(o.nv_orange, '')), '') is not null then 'orange:' || lower(btrim(o.nv_orange))
          when nullif(btrim(coalesce(o.nv_farmapack, '')), '') is not null then 'farmapack:' || lower(btrim(o.nv_farmapack))
          when nullif(btrim(coalesce(o.varios, '')), '') is not null then 'varios:' || lower(btrim(o.varios))
          else 'row:' || o.id::text
        end
      order by
        coalesce(
          o.fecha_estado,
          o.fecha_aprobacion_real::timestamptz,
          o.fecha_aprobacion::timestamptz,
          o.created_at
        ) desc,
        o.id desc
    ) as rn
  from public.tms_operaciones o
)
select
  id,
  nv_ptm,
  nv_orange,
  nv_farmapack,
  varios,
  factura,
  guia,
  numero_envio,
  vendedor,
  cliente,
  centro_costo,
  division,
  transportista,
  empresa_transporte,
  tipo_despacho,
  estado,
  urgente,
  fecha_aprobacion,
  fecha_aprobacion_real,
  fecha_facturacion,
  fecha_despacho,
  fecha_compromiso,
  fecha_estado,
  fecha_registro_nv,
  fecha_en_proceso,
  fecha_shipping,
  fecha_en_ruta,
  fecha_entregado,
  valor_factura,
  costo_flete,
  valor_nv,
  bultos,
  dias_en_proceso,
  incidencia,
  estado_incidencia,
  observaciones_incidencia,
  dias_incidencia,
  fillrate,
  origen,
  row_hash,
  created_at,
  updated_at,
  reabierta,
  fecha_reapertura,
  motivo_reapertura,
  reapertura_aprobada_por,
  case
    when nv_ptm is not null then 'ptm'
    when nv_orange is not null then 'orange'
    when nv_farmapack is not null then 'farmapack'
    else 'varios'
  end as canal_operacion,
  coalesce(nv_ptm::text, nv_orange, nv_farmapack, varios) as nv_operacion,
  nv_key
from ranked
where rn = 1;

comment on view public.tms_operaciones_vigentes is
  'Vista vigente del Panel: una fila por canal:nv, tomando la version mas reciente por fecha_estado y desempate por id.';

grant select on public.tms_operaciones_vigentes to authenticated;
