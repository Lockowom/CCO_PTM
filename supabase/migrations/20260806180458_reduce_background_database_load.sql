-- Reduce picos de I/O en el plan Free sin eliminar compatibilidad legacy.
-- El dashboard actual no consume get_dashboard_kpis; se conserva la vista
-- materializada con refresco horario para cualquier consumidor historico.
do $$
declare
  v_dashboard_job bigint;
  v_permissions_job bigint;
begin
  select jobid into v_dashboard_job
  from cron.job
  where jobname = 'refresh-dashboard-kpis';

  if v_dashboard_job is not null then
    perform cron.alter_job(job_id := v_dashboard_job, schedule := '17 * * * *');
  end if;

  -- Conserva el refresco IAM cada cinco minutos, pero fuera del segundo cero.
  select jobid into v_permissions_job
  from cron.job
  where jobname = 'refresh-iam-permissions';

  if v_permissions_job is not null then
    perform cron.alter_job(job_id := v_permissions_job, schedule := '2-59/5 * * * *');
  end if;
end
$$;
