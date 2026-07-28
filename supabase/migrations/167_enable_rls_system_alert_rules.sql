-- ============================================================================
-- 167_enable_rls_system_alert_rules.sql
-- Cierra la brecha reportada por Supabase Advisor en public.system_alert_rules.
-- ============================================================================

alter table public.system_alert_rules enable row level security;

drop policy if exists system_alert_rules_select_admin on public.system_alert_rules;
create policy system_alert_rules_select_admin
  on public.system_alert_rules
  for select
  to authenticated
  using (
    public.is_admin()
    or public.usuario_tiene_algun_permiso(array['admin_monitor'])
  );

revoke all on public.system_alert_rules from public, anon;
grant select on public.system_alert_rules to authenticated;
