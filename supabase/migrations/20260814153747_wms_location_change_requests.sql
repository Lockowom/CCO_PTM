-- Solicitudes controladas para corregir ubicaciones desde la consulta WMS.
-- Los operadores nunca modifican inventario directamente: administracion revisa
-- y la RPC ejecuta el cambio atomico contra la fuente unica wms_ubicaciones.

create table public.wms_ubicacion_solicitudes (
  id uuid primary key default gen_random_uuid(),
  ubicacion_id uuid references public.wms_ubicaciones(id) on delete set null,
  tipo text not null check (tipo in ('AGOTADO', 'MOVIDO')),
  estado text not null default 'PENDIENTE'
    check (estado in ('PENDIENTE', 'APROBADA', 'RECHAZADA')),
  codigo text not null,
  descripcion text,
  ubicacion_actual text not null,
  nueva_ubicacion text,
  cantidad_snapshot integer not null default 0,
  observacion text not null,
  solicitante_auth_uid uuid not null references auth.users(id),
  solicitante_id uuid references public.tms_usuarios(id),
  solicitante_nombre text not null,
  solicitante_email text,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  resuelto_en timestamptz,
  resuelto_por_auth_uid uuid references auth.users(id),
  resuelto_por_id uuid references public.tms_usuarios(id),
  resuelto_por_nombre text,
  nota_admin text,
  resultado jsonb,
  constraint wms_ubicacion_solicitud_destino check (
    (tipo = 'MOVIDO' and nueva_ubicacion is not null and length(btrim(nueva_ubicacion)) between 1 and 60)
    or (tipo = 'AGOTADO' and nueva_ubicacion is null)
  ),
  constraint wms_ubicacion_solicitud_observacion_real check (
    length(btrim(observacion)) between 3 and 500
    and btrim(observacion) ~ '[[:alnum:]]'
  )
);

create unique index wms_ubicacion_solicitudes_pendiente_unica
  on public.wms_ubicacion_solicitudes (ubicacion_id)
  where estado = 'PENDIENTE' and ubicacion_id is not null;
create index wms_ubicacion_solicitudes_bandeja
  on public.wms_ubicacion_solicitudes (estado, creado_en desc);
create index wms_ubicacion_solicitudes_solicitante
  on public.wms_ubicacion_solicitudes (solicitante_auth_uid, creado_en desc);
create index wms_ubicacion_solicitudes_codigo
  on public.wms_ubicacion_solicitudes (upper(btrim(codigo)), creado_en desc);

alter table public.wms_ubicacion_solicitudes enable row level security;

create policy wms_ubicacion_solicitudes_lectura
  on public.wms_ubicacion_solicitudes for select to authenticated
  using (
    (select auth.uid()) = solicitante_auth_uid
    or public.usuario_tiene_algun_permiso(array['manage_locations'])
  );

-- No se otorga INSERT/UPDATE/DELETE al cliente: todas las escrituras pasan por
-- RPCs SECURITY DEFINER con validacion de permisos y bloqueo de fila.
revoke all on table public.wms_ubicacion_solicitudes from public, anon, authenticated;
grant select on table public.wms_ubicacion_solicitudes to authenticated;
grant all on table public.wms_ubicacion_solicitudes to service_role;

create or replace function public.solicitar_cambio_ubicacion(
  p_ubicacion_id uuid,
  p_tipo text,
  p_nueva_ubicacion text default null,
  p_observacion text default null
)
returns public.wms_ubicacion_solicitudes
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_usuario public.tms_usuarios%rowtype;
  v_ubicacion public.wms_ubicaciones%rowtype;
  v_tipo text := upper(btrim(coalesce(p_tipo, '')));
  v_nueva text := nullif(upper(btrim(coalesce(p_nueva_ubicacion, ''))), '');
  v_observacion text := btrim(coalesce(p_observacion, ''));
  v_solicitud public.wms_ubicacion_solicitudes%rowtype;
begin
  if auth.uid() is null or not coalesce(
    public.usuario_tiene_algun_permiso(array['view_locations', 'manage_locations']), false
  ) then
    raise exception 'No tienes permiso para reportar ubicaciones' using errcode = '42501';
  end if;

  select * into v_usuario
  from public.tms_usuarios
  where auth_uid = auth.uid() and activo = true
  limit 1;
  if v_usuario.id is null then
    raise exception 'Usuario activo no encontrado' using errcode = '42501';
  end if;

  if v_tipo not in ('AGOTADO', 'MOVIDO') then
    raise exception 'Tipo de solicitud invalido' using errcode = '22023';
  end if;
  if length(v_observacion) < 3 or length(v_observacion) > 500
     or v_observacion !~ '[[:alnum:]]' then
    raise exception 'Escribe una observacion valida' using errcode = '22023';
  end if;
  if v_tipo = 'MOVIDO' then
    if v_nueva is null or length(v_nueva) > 60 or v_nueva !~ '[[:alnum:]]' then
      raise exception 'Indica una ubicacion nueva valida' using errcode = '22023';
    end if;
  else
    v_nueva := null;
  end if;

  select * into v_ubicacion
  from public.wms_ubicaciones
  where id = p_ubicacion_id
  for share;
  if v_ubicacion.id is null then
    raise exception 'La ubicacion ya no existe; actualiza la pantalla' using errcode = 'P0002';
  end if;
  if v_tipo = 'MOVIDO' and upper(btrim(v_ubicacion.ubicacion)) = v_nueva then
    raise exception 'La ubicacion nueva debe ser distinta de la actual' using errcode = '22023';
  end if;

  insert into public.wms_ubicacion_solicitudes (
    ubicacion_id, tipo, codigo, descripcion, ubicacion_actual, nueva_ubicacion,
    cantidad_snapshot, observacion, solicitante_auth_uid, solicitante_id,
    solicitante_nombre, solicitante_email
  ) values (
    v_ubicacion.id, v_tipo, coalesce(v_ubicacion.codigo, '(SIN SKU)'),
    v_ubicacion.descripcion, v_ubicacion.ubicacion, v_nueva,
    coalesce(v_ubicacion.cantidad, 0), v_observacion, auth.uid(), v_usuario.id,
    coalesce(nullif(v_usuario.nombre, ''), v_usuario.email), v_usuario.email
  )
  returning * into v_solicitud;

  return v_solicitud;
exception
  when unique_violation then
    raise exception 'Ya existe una solicitud pendiente para este producto y ubicacion'
      using errcode = '23505';
end;
$$;

create or replace function public.resolver_cambio_ubicacion(
  p_solicitud_id uuid,
  p_aprobar boolean,
  p_nota_admin text default null
)
returns public.wms_ubicacion_solicitudes
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin public.tms_usuarios%rowtype;
  v_solicitud public.wms_ubicacion_solicitudes%rowtype;
  v_ubicacion public.wms_ubicaciones%rowtype;
  v_resultado jsonb;
  v_nota text := nullif(btrim(coalesce(p_nota_admin, '')), '');
begin
  if auth.uid() is null or not coalesce(
    public.usuario_tiene_algun_permiso(array['manage_locations']), false
  ) then
    raise exception 'Solo administracion puede resolver solicitudes' using errcode = '42501';
  end if;

  select * into v_admin from public.tms_usuarios
  where auth_uid = auth.uid() and activo = true limit 1;
  if v_admin.id is null then
    raise exception 'Administrador activo no encontrado' using errcode = '42501';
  end if;
  if not coalesce(p_aprobar, false) and (v_nota is null or v_nota !~ '[[:alnum:]]') then
    raise exception 'Indica el motivo del rechazo' using errcode = '22023';
  end if;
  if v_nota is not null and length(v_nota) > 500 then
    raise exception 'La nota no puede superar 500 caracteres' using errcode = '22023';
  end if;

  select * into v_solicitud from public.wms_ubicacion_solicitudes
  where id = p_solicitud_id for update;
  if v_solicitud.id is null then
    raise exception 'Solicitud no encontrada' using errcode = 'P0002';
  end if;
  if v_solicitud.estado <> 'PENDIENTE' then
    raise exception 'La solicitud ya fue resuelta' using errcode = 'P0001';
  end if;

  if coalesce(p_aprobar, false) then
    select * into v_ubicacion from public.wms_ubicaciones
    where id = v_solicitud.ubicacion_id for update;
    if v_ubicacion.id is null then
      raise exception 'El registro ya no existe; rechaza la solicitud con una nota'
        using errcode = 'P0002';
    end if;
    if upper(btrim(coalesce(v_ubicacion.codigo, ''))) <> upper(btrim(v_solicitud.codigo))
       or upper(btrim(v_ubicacion.ubicacion)) <> upper(btrim(v_solicitud.ubicacion_actual)) then
      raise exception 'El producto cambio desde la solicitud; revisa antes de ejecutar'
        using errcode = '40001';
    end if;

    if v_solicitud.tipo = 'MOVIDO' then
      v_resultado := public.mover_ubicacion_wms(v_ubicacion.id, v_solicitud.nueva_ubicacion);
    else
      perform public.eliminar_ubicacion_wms(v_ubicacion.id, false);
      v_resultado := jsonb_build_object(
        'accion', 'UBICACION_ELIMINADA', 'codigo', v_solicitud.codigo,
        'ubicacion', v_solicitud.ubicacion_actual
      );
    end if;
  else
    v_resultado := jsonb_build_object('accion', 'RECHAZADA');
  end if;

  update public.wms_ubicacion_solicitudes set
    estado = case when coalesce(p_aprobar, false) then 'APROBADA' else 'RECHAZADA' end,
    actualizado_en = now(), resuelto_en = now(), resuelto_por_auth_uid = auth.uid(),
    resuelto_por_id = v_admin.id,
    resuelto_por_nombre = coalesce(nullif(v_admin.nombre, ''), v_admin.email),
    nota_admin = v_nota, resultado = v_resultado
  where id = v_solicitud.id
  returning * into v_solicitud;

  return v_solicitud;
end;
$$;

revoke all on function public.solicitar_cambio_ubicacion(uuid, text, text, text)
  from public, anon;
revoke all on function public.resolver_cambio_ubicacion(uuid, boolean, text)
  from public, anon;
grant execute on function public.solicitar_cambio_ubicacion(uuid, text, text, text)
  to authenticated, service_role;
grant execute on function public.resolver_cambio_ubicacion(uuid, boolean, text)
  to authenticated, service_role;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'wms_ubicacion_solicitudes'
  ) then
    alter publication supabase_realtime add table public.wms_ubicacion_solicitudes;
  end if;
end $$;

comment on table public.wms_ubicacion_solicitudes is
  'Bandeja auditada de solicitudes de retiro o movimiento de ubicaciones WMS.';
