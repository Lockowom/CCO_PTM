-- Control singleton used to force a cache/session refresh without deploying.
create table if not exists public.app_runtime_control (
  id boolean primary key default true check (id),
  force_token uuid not null default gen_random_uuid(),
  forced_at timestamptz not null default now(),
  reason text,
  updated_by text
);

insert into public.app_runtime_control (id)
values (true)
on conflict (id) do nothing;

alter table public.app_runtime_control enable row level security;
drop policy if exists app_runtime_control_read on public.app_runtime_control;
create policy app_runtime_control_read
  on public.app_runtime_control
  for select
  to anon, authenticated
  using (id = true);

revoke all on public.app_runtime_control from public;
grant select on public.app_runtime_control to anon, authenticated;

create or replace function public.force_app_refresh(p_reason text default null)
returns public.app_runtime_control
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_actor text;
  v_control public.app_runtime_control;
begin
  if not (public.is_admin() or public.usuario_tiene_algun_permiso(array['admin_monitor'])) then
    raise exception 'No autorizado';
  end if;

  select coalesce(nombre, email, auth.uid()::text)
    into v_actor
  from public.tms_usuarios
  where auth_uid = auth.uid()
  limit 1;

  update public.app_runtime_control
     set force_token = gen_random_uuid(),
         forced_at = now(),
         reason = nullif(left(trim(coalesce(p_reason, 'Actualización global solicitada')), 500), ''),
         updated_by = coalesce(v_actor, auth.uid()::text)
   where id = true
   returning * into v_control;

  return v_control;
end;
$$;

revoke all on function public.force_app_refresh(text) from public, anon;
grant execute on function public.force_app_refresh(text) to authenticated, service_role;
