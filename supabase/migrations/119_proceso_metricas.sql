-- ============================================================================
--  119_proceso_metricas.sql — Métricas de proceso / SLA desde workflow_history.
--  Habilitado por el Motor de Eventos: cada transición quedó registrada, así que
--  se pueden calcular tiempos de ciclo (lead time) y permanencia por estado
--  (cuellos de botella) por proceso. Gate: admin o view_eventos/manage_eventos.
-- ============================================================================
create or replace function public.proceso_metricas(p_workflow text)
returns jsonb language plpgsql stable security definer set search_path to 'public'
as $function$
declare v_res jsonb;
begin
  if not (coalesce(private.is_admin(), false)
       or coalesce(public.usuario_tiene_algun_permiso(array['view_eventos','manage_eventos']), false)) then
    raise exception 'No autorizado';
  end if;

  with ev as (
    select entidad_id, hasta, creado_en,
           lead(creado_en) over (partition by entidad_id order by creado_en) as sig
    from public.workflow_history
    where workflow = p_workflow
  ),
  dwell as (  -- permanencia en cada estado (horas) antes de moverse
    select hasta as estado, extract(epoch from (sig - creado_en)) / 3600.0 as horas
    from ev where sig is not null
  ),
  por_estado as (
    select estado, count(*)::int n,
           round(avg(horas)::numeric, 2) prom,
           round((percentile_cont(0.5) within group (order by horas))::numeric, 2) p50,
           round(max(horas)::numeric, 2) maxh
    from dwell group by estado
  ),
  lead_t as (  -- lead time por entidad (primer → último evento)
    select entidad_id,
           extract(epoch from (max(creado_en) - min(creado_en))) / 3600.0 as horas,
           count(*)::int pasos
    from public.workflow_history where workflow = p_workflow group by entidad_id
  )
  select jsonb_build_object(
    'workflow', p_workflow,
    'entidades', (select count(*) from lead_t),
    'transiciones', (select count(*) from public.workflow_history where workflow = p_workflow),
    'lead_prom_horas', (select round(avg(horas)::numeric, 2) from lead_t where pasos > 1),
    'lead_p50_horas', (select round((percentile_cont(0.5) within group (order by horas))::numeric, 2) from lead_t where pasos > 1),
    'por_estado', coalesce((select jsonb_agg(jsonb_build_object(
        'estado', estado, 'transiciones', n, 'dwell_prom_horas', prom, 'dwell_p50_horas', p50, 'dwell_max_horas', maxh
      ) order by prom desc nulls last) from por_estado), '[]'::jsonb)
  ) into v_res;
  return v_res;
end; $function$;
revoke all on function public.proceso_metricas(text) from public, anon;
grant execute on function public.proceso_metricas(text) to authenticated;
