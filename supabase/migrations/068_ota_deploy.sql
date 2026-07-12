-- 068_ota_deploy.sql
-- Despliegue OTA a producción DESDE la app (admin): permiso + autorización
-- server-side + auditoría. La Edge Function `capgo-deploy` es la que llama a la
-- API de Capgo (la API key vive SOLO en la función, nunca en el cliente); estas
-- piezas verifican que quien la invoca tenga permiso y dejan traza de cada
-- promoción a producción.

-- 1) Permiso nuevo (catálogo de Roles) --------------------------------------
insert into public.tms_permisos (id, nombre, modulo)
values ('deploy_ota', 'Desplegar OTA a producción', 'Administración')
on conflict (id) do nothing;

-- Otorgarlo de una a los roles de mando (admin bypassa igual por is_admin()).
update public.tms_roles
set permisos_json = (coalesce(permisos_json, '[]'::jsonb) || '["deploy_ota"]'::jsonb)
where id in ('ADMIN', 'GERENCIA')
  and not (coalesce(permisos_json, '[]'::jsonb) ? 'deploy_ota');

-- 2) Autorización server-side (la Edge Function la llama con el JWT del usuario)
create or replace function public.puede_desplegar_ota()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin() or exists (
    select 1
    from public.tms_usuarios u
    join public.tms_roles r on r.id = u.rol
    where u.id = auth.uid()
      and coalesce(r.permisos_json, '[]'::jsonb) ? 'deploy_ota'
  );
$$;
revoke all on function public.puede_desplegar_ota() from public, anon;
grant execute on function public.puede_desplegar_ota() to authenticated;

-- 3) Auditoría: quién promovió qué versión a qué canal ----------------------
create table if not exists public.tms_ota_despliegues (
  id          bigint generated always as identity primary key,
  version     text not null,
  canal       text not null default 'production',
  usuario_id  uuid,
  usuario_email text,
  ok          boolean not null default true,
  detalle     text,
  created_at  timestamptz not null default now()
);
alter table public.tms_ota_despliegues enable row level security;

drop policy if exists ota_despliegues_sel on public.tms_ota_despliegues;
create policy ota_despliegues_sel on public.tms_ota_despliegues
  for select to authenticated
  using (public.puede_desplegar_ota());
-- El insert NO se hace directo desde el cliente: solo vía la RPC de abajo.

create or replace function public.registrar_despliegue_ota(
  p_version text,
  p_canal   text,
  p_ok      boolean,
  p_detalle text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.puede_desplegar_ota() then
    raise exception 'no autorizado para registrar despliegues OTA';
  end if;
  insert into public.tms_ota_despliegues (version, canal, usuario_id, usuario_email, ok, detalle)
  values (
    p_version,
    coalesce(p_canal, 'production'),
    auth.uid(),
    (select email from auth.users where id = auth.uid()),
    coalesce(p_ok, true),
    p_detalle
  );
end;
$$;
revoke all on function public.registrar_despliegue_ota(text, text, boolean, text) from public, anon;
grant execute on function public.registrar_despliegue_ota(text, text, boolean, text) to authenticated;
