-- Put Away visual es la fuente de verdad de las asignaciones visuales.
-- Esta migracion permite corregirlas sin tocar cantidades de wms_ubicaciones
-- y deja auditoria recuperable de cada modificacion/eliminacion futura.

alter table public.wms_putaway_ubicaciones
  add column if not exists actualizado_en timestamptz,
  add column if not exists actualizado_por uuid references public.tms_usuarios(id) on delete set null,
  add column if not exists actualizado_por_nombre text;

alter table public.wms_putaway_ubicaciones
  drop constraint if exists wms_putaway_ubicaciones_ubicacion_no_vacia,
  add constraint wms_putaway_ubicaciones_ubicacion_no_vacia
    check (length(btrim(ubicacion)) > 0) not valid;

alter table public.wms_putaway_ubicaciones
  validate constraint wms_putaway_ubicaciones_ubicacion_no_vacia;

create table if not exists public.wms_putaway_ubicaciones_historial (
  id bigint generated always as identity primary key,
  putaway_id uuid,
  accion text not null check (accion in ('UPDATE', 'DELETE')),
  ubicacion_anterior text,
  ubicacion_nueva text,
  codigo text not null,
  antes jsonb not null,
  despues jsonb,
  actor_id uuid references public.tms_usuarios(id) on delete set null,
  actor_nombre text,
  creado_en timestamptz not null default now()
);

create index if not exists idx_putaway_historial_item
  on public.wms_putaway_ubicaciones_historial (putaway_id, creado_en desc);
create index if not exists idx_putaway_historial_codigo
  on public.wms_putaway_ubicaciones_historial (codigo, creado_en desc);

alter table public.wms_putaway_ubicaciones_historial enable row level security;

drop policy if exists putaway_visual_select on public.wms_putaway_ubicaciones;
create policy putaway_visual_select on public.wms_putaway_ubicaciones
  for select to authenticated
  using (
    public.usuario_tiene_algun_permiso(
      array['view_entry', 'process_entry', 'manage_locations']
    )
  );

drop policy if exists putaway_visual_update on public.wms_putaway_ubicaciones;
create policy putaway_visual_update on public.wms_putaway_ubicaciones
  for update to authenticated
  using (public.usuario_tiene_algun_permiso(array['manage_locations']))
  with check (
    public.usuario_tiene_algun_permiso(array['manage_locations'])
    and length(btrim(ubicacion)) > 0
    and length(btrim(codigo)) > 0
  );

drop policy if exists putaway_visual_delete on public.wms_putaway_ubicaciones;
create policy putaway_visual_delete on public.wms_putaway_ubicaciones
  for delete to authenticated
  using (public.usuario_tiene_algun_permiso(array['manage_locations']));

drop policy if exists putaway_visual_history_select on public.wms_putaway_ubicaciones_historial;
create policy putaway_visual_history_select on public.wms_putaway_ubicaciones_historial
  for select to authenticated
  using (public.usuario_tiene_algun_permiso(array['manage_locations']));

revoke all on table public.wms_putaway_ubicaciones from public, anon, authenticated;
grant select, insert, update, delete on table public.wms_putaway_ubicaciones
  to authenticated, service_role;

revoke all on table public.wms_putaway_ubicaciones_historial from public, anon, authenticated;
grant select on table public.wms_putaway_ubicaciones_historial to authenticated, service_role;
grant insert on table public.wms_putaway_ubicaciones_historial to service_role;

create or replace function public.audit_wms_putaway_ubicacion()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user record;
begin
  select id, nombre
    into v_user
  from public.tms_usuarios
  where auth_uid = (select auth.uid())
  limit 1;

  if tg_op = 'UPDATE' then
    new.ubicacion := upper(btrim(new.ubicacion));
    new.codigo := upper(btrim(new.codigo));
    new.actualizado_en := now();
    new.actualizado_por := v_user.id;
    new.actualizado_por_nombre := v_user.nombre;

    insert into public.wms_putaway_ubicaciones_historial (
      putaway_id, accion, ubicacion_anterior, ubicacion_nueva, codigo,
      antes, despues, actor_id, actor_nombre
    ) values (
      old.id, 'UPDATE', old.ubicacion, new.ubicacion, new.codigo,
      to_jsonb(old), to_jsonb(new), v_user.id, v_user.nombre
    );
    return new;
  end if;

  insert into public.wms_putaway_ubicaciones_historial (
    putaway_id, accion, ubicacion_anterior, ubicacion_nueva, codigo,
    antes, despues, actor_id, actor_nombre
  ) values (
    old.id, 'DELETE', old.ubicacion, null, old.codigo,
    to_jsonb(old), null, v_user.id, v_user.nombre
  );
  return old;
end;
$$;

revoke all on function public.audit_wms_putaway_ubicacion() from public, anon, authenticated;

drop trigger if exists trg_audit_wms_putaway_ubicacion on public.wms_putaway_ubicaciones;
create trigger trg_audit_wms_putaway_ubicacion
  before update or delete on public.wms_putaway_ubicaciones
  for each row execute function public.audit_wms_putaway_ubicacion();

comment on table public.wms_putaway_ubicaciones is
  'Asignacion visual vigente de Put Away. No modifica stock ni cantidades fisicas.';
comment on table public.wms_putaway_ubicaciones_historial is
  'Auditoria recuperable de cambios y eliminaciones de ubicaciones visuales Put Away.';
