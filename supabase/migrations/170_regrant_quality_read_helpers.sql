-- ============================================================================
-- 170_regrant_quality_read_helpers.sql
-- Reaplica grants críticos para lecturas de Calidad protegidas por helpers RLS.
-- ============================================================================

revoke all on function public.can_view_calidad_operativa() from public, anon;
grant execute on function public.can_view_calidad_operativa() to authenticated, service_role;

revoke all on function public.can_view_calidad_flags() from public, anon;
grant execute on function public.can_view_calidad_flags() to authenticated, service_role;

revoke all on public.tms_calidad_tareas from public, anon;
grant select on public.tms_calidad_tareas to authenticated, service_role;

revoke all on public.tms_calidad_asignaciones from public, anon;
grant select on public.tms_calidad_asignaciones to authenticated, service_role;

revoke all on public.tms_monitoreo_items from public, anon;
grant select on public.tms_monitoreo_items to authenticated, service_role;

revoke all on public.tms_calidad_flags from public, anon;
grant select on public.tms_calidad_flags to authenticated, service_role;
