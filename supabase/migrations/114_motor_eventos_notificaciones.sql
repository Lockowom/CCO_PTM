-- ============================================================================
--  114_motor_eventos_notificaciones.sql
--  Motores de plataforma del blueprint (ARQUITECTURA_CCO.md §7.2 y §7.4):
--   • MOTOR DE EVENTOS: dominio_eventos (append-only). Se ALIMENTA SOLO desde
--     workflow_history (trigger) → un hecho de negocio = un evento
--     'WORKFLOW.accion' (ej. 'OT.registrar_pod', 'TICKET_PV.crear'). No hay que
--     tocar cada RPC: reusa todo el cableado de la Fase 2.
--   • CENTRO DE NOTIFICACIONES: reglas (evento→canal→rol→plantilla) + bandeja
--     de salida (notificacion). Un trigger sobre dominio_eventos materializa las
--     notificaciones por cada regla activa que casa. Canales: in-app (entrega
--     inmediata, se lee en la app), push (Capgo/FCM vía Edge notify-inventario),
--     correo (encolado). SIN WhatsApp/SMS.
--  Permisos: view_eventos / manage_eventos (módulo Administración).
-- ============================================================================

-- ── Motor de eventos ────────────────────────────────────────────────────────
create table if not exists public.dominio_eventos (
  id          bigint generated always as identity primary key,
  nombre      text not null,            -- 'OT.registrar_pod', 'NV.avanzar', ...
  agregado    text not null,            -- 'OT','TICKET_PV','NV','CALIDAD','CONTEO'
  agregado_id text,
  actor       text,
  payload     jsonb not null default '{}'::jsonb,
  creado_en   timestamptz not null default now()
);
create index if not exists dominio_eventos_idx on public.dominio_eventos (agregado, creado_en desc);
create index if not exists dominio_eventos_nombre_idx on public.dominio_eventos (nombre);
alter table public.dominio_eventos enable row level security;
drop policy if exists eventos_select on public.dominio_eventos;
create policy eventos_select on public.dominio_eventos for select to authenticated using (true);
grant select on public.dominio_eventos to authenticated;

-- ── Centro de notificaciones: reglas + bandeja ──────────────────────────────
create table if not exists public.notificacion_regla (
  id              bigint generated always as identity primary key,
  nombre          text not null,
  evento_patron   text not null,        -- regex POSIX contra dominio_eventos.nombre
  canal           text not null default 'in-app' check (canal in ('in-app','push','correo')),
  destinatario_rol text,                -- rol objetivo (null = ADMIN por defecto en push)
  titulo_tpl      text not null,
  mensaje_tpl     text not null,
  activo          boolean not null default true,
  orden           int not null default 0,
  updated_at      timestamptz not null default now(),
  updated_by      text
);
alter table public.notificacion_regla enable row level security;
drop policy if exists notif_regla_select on public.notificacion_regla;
create policy notif_regla_select on public.notificacion_regla for select to authenticated using (true);
grant select on public.notificacion_regla to authenticated;

create table if not exists public.notificacion (
  id               bigint generated always as identity primary key,
  evento_id        bigint references public.dominio_eventos(id) on delete cascade,
  regla_id         bigint,
  canal            text not null,
  destinatario_rol text,
  titulo           text not null,
  mensaje          text,
  payload          jsonb not null default '{}'::jsonb,
  estado           text not null default 'pendiente', -- pendiente|leido|enviado|error
  creado_en        timestamptz not null default now(),
  procesado_en     timestamptz,
  leido_por        text
);
create index if not exists notificacion_idx on public.notificacion (canal, estado, creado_en desc);
alter table public.notificacion enable row level security;
drop policy if exists notif_select on public.notificacion;
create policy notif_select on public.notificacion for select to authenticated using (true);
grant select on public.notificacion to authenticated;

-- ── Trigger: workflow_history → dominio_eventos ─────────────────────────────
create or replace function public._wf_emitir_evento()
returns trigger language plpgsql security definer set search_path to 'public'
as $function$
begin
  insert into public.dominio_eventos (nombre, agregado, agregado_id, actor, payload)
  values (new.workflow || '.' || coalesce(new.accion,'cambio'), new.workflow, new.entidad_id, new.actor,
          jsonb_build_object('desde', new.desde, 'hasta', new.hasta, 'nota', new.nota));
  return new;
end; $function$;
drop trigger if exists trg_wf_evento on public.workflow_history;
create trigger trg_wf_evento after insert on public.workflow_history
  for each row execute function public._wf_emitir_evento();

-- ── Render de plantilla (placeholders {agregado} {id} {desde} {hasta} {actor}) ─
create or replace function public._notif_render(tpl text, ev public.dominio_eventos)
returns text language sql immutable set search_path to 'public'
as $$
  select replace(replace(replace(replace(replace(coalesce(tpl,''),
    '{agregado}', coalesce(ev.agregado,'')),
    '{id}', coalesce(ev.agregado_id,'')),
    '{desde}', coalesce(ev.payload->>'desde','')),
    '{hasta}', coalesce(ev.payload->>'hasta','')),
    '{actor}', coalesce(ev.actor,''));
$$;

-- ── Trigger: dominio_eventos → notificacion (por reglas activas) ─────────────
create or replace function public._evento_despachar()
returns trigger language plpgsql security definer set search_path to 'public'
as $function$
declare r public.notificacion_regla;
begin
  for r in select * from public.notificacion_regla where activo and new.nombre ~ evento_patron loop
    insert into public.notificacion (evento_id, regla_id, canal, destinatario_rol, titulo, mensaje, payload, estado)
    values (new.id, r.id, r.canal, coalesce(r.destinatario_rol, 'ADMIN'),
            public._notif_render(r.titulo_tpl, new), public._notif_render(r.mensaje_tpl, new),
            new.payload, 'pendiente');
  end loop;
  return new;
end; $function$;
drop trigger if exists trg_evento_despachar on public.dominio_eventos;
create trigger trg_evento_despachar after insert on public.dominio_eventos
  for each row execute function public._evento_despachar();

-- ── Gate + RPCs de gestión ──────────────────────────────────────────────────
create or replace function public._notif_puede_gestionar()
returns boolean language sql stable security definer set search_path to 'public'
as $$ select coalesce(private.is_admin(), false) or coalesce(public.usuario_tiene_algun_permiso(array['manage_eventos']), false); $$;
revoke all on function public._notif_puede_gestionar() from public, anon;
grant execute on function public._notif_puede_gestionar() to authenticated;

create or replace function public.notif_regla_guardar(p jsonb)
returns jsonb language plpgsql security definer set search_path to 'public'
as $function$
declare v_id bigint := nullif(p->>'id','')::bigint;
begin
  if not public._notif_puede_gestionar() then raise exception 'No autorizado'; end if;
  if v_id is not null then
    update public.notificacion_regla set
      nombre = coalesce(nullif(p->>'nombre',''), nombre),
      evento_patron = coalesce(nullif(p->>'evento_patron',''), evento_patron),
      canal = coalesce(nullif(p->>'canal',''), canal),
      destinatario_rol = nullif(p->>'destinatario_rol',''),
      titulo_tpl = coalesce(nullif(p->>'titulo_tpl',''), titulo_tpl),
      mensaje_tpl = coalesce(nullif(p->>'mensaje_tpl',''), mensaje_tpl),
      activo = coalesce((p->>'activo')::boolean, activo),
      orden = coalesce(nullif(p->>'orden','')::int, orden),
      updated_at = now(), updated_by = public._panel_actor()
    where id = v_id;
  else
    insert into public.notificacion_regla (nombre, evento_patron, canal, destinatario_rol, titulo_tpl, mensaje_tpl, activo, orden, updated_by)
    values (nullif(p->>'nombre',''), nullif(p->>'evento_patron',''), coalesce(nullif(p->>'canal',''),'in-app'),
            nullif(p->>'destinatario_rol',''), coalesce(nullif(p->>'titulo_tpl',''),'{agregado} {id}'),
            coalesce(nullif(p->>'mensaje_tpl',''),'{agregado} {id}: {desde} → {hasta}'),
            coalesce((p->>'activo')::boolean, true), coalesce(nullif(p->>'orden','')::int,0), public._panel_actor());
  end if;
  return jsonb_build_object('ok', true);
end; $function$;

create or replace function public.notif_regla_eliminar(p_id bigint)
returns jsonb language plpgsql security definer set search_path to 'public'
as $function$
begin
  if not public._notif_puede_gestionar() then raise exception 'No autorizado'; end if;
  delete from public.notificacion_regla where id = p_id;
  return jsonb_build_object('ok', true, 'id', p_id);
end; $function$;

-- Mis notificaciones in-app (por rol del usuario).
create or replace function public.mis_notificaciones()
returns setof public.notificacion language sql stable security definer set search_path to 'public'
as $$
  select * from public.notificacion
   where canal = 'in-app' and estado = 'pendiente'
     and (destinatario_rol is null or destinatario_rol = (select rol from public.tms_usuarios where auth_uid = auth.uid() limit 1))
   order by creado_en desc limit 100;
$$;

create or replace function public.marcar_notificacion_leida(p_id bigint)
returns jsonb language plpgsql security definer set search_path to 'public'
as $function$
begin
  update public.notificacion set estado = 'leido', procesado_en = now(), leido_por = public._panel_actor()
   where id = p_id and canal = 'in-app';
  return jsonb_build_object('ok', true, 'id', p_id);
end; $function$;

create or replace function public.marcar_todas_leidas()
returns jsonb language plpgsql security definer set search_path to 'public'
as $function$
declare v_rol text := (select rol from public.tms_usuarios where auth_uid = auth.uid() limit 1); v_n int;
begin
  update public.notificacion set estado = 'leido', procesado_en = now(), leido_por = public._panel_actor()
   where canal = 'in-app' and estado = 'pendiente' and (destinatario_rol is null or destinatario_rol = v_rol);
  get diagnostics v_n = row_count;
  return jsonb_build_object('ok', true, 'marcadas', v_n);
end; $function$;

-- Despacho de push: marca como enviadas las filas push que el front ya empujó a FCM.
create or replace function public.notif_marcar_enviadas(p_ids bigint[])
returns jsonb language plpgsql security definer set search_path to 'public'
as $function$
begin
  if not public._notif_puede_gestionar() then raise exception 'No autorizado'; end if;
  update public.notificacion set estado = 'enviado', procesado_en = now()
   where id = any(p_ids) and canal = 'push' and estado = 'pendiente';
  return jsonb_build_object('ok', true);
end; $function$;

revoke all on function public.notif_regla_guardar(jsonb)        from public, anon;
revoke all on function public.notif_regla_eliminar(bigint)      from public, anon;
revoke all on function public.mis_notificaciones()              from public, anon;
revoke all on function public.marcar_notificacion_leida(bigint) from public, anon;
revoke all on function public.marcar_todas_leidas()             from public, anon;
revoke all on function public.notif_marcar_enviadas(bigint[])   from public, anon;
grant execute on function public.notif_regla_guardar(jsonb)        to authenticated;
grant execute on function public.notif_regla_eliminar(bigint)      to authenticated;
grant execute on function public.mis_notificaciones()              to authenticated;
grant execute on function public.marcar_notificacion_leida(bigint) to authenticated;
grant execute on function public.marcar_todas_leidas()             to authenticated;
grant execute on function public.notif_marcar_enviadas(bigint[])   to authenticated;

-- ── Permisos (módulo Administración) ────────────────────────────────────────
insert into public.tms_permisos (id, nombre, modulo) values
  ('view_eventos',   'Eventos/Notificaciones · Ver stream y bandeja', 'Administración'),
  ('manage_eventos', 'Eventos/Notificaciones · Editar reglas y despachar', 'Administración')
on conflict (id) do update set nombre = excluded.nombre, modulo = excluded.modulo;

-- ── Reglas de ejemplo (in-app, activas) ─────────────────────────────────────
insert into public.notificacion_regla (nombre, evento_patron, canal, destinatario_rol, titulo_tpl, mensaje_tpl, orden) values
  ('Entrega registrada (POD)', '^OT\.registrar_pod$', 'in-app', 'ADMIN', 'Entrega registrada', 'La orden {id} quedó Entregada (POD).', 10),
  ('Nuevo ticket Post-Venta',  '^TICKET_PV\.crear$', 'in-app', 'ADMIN', 'Nuevo ticket', 'Se creó el ticket {id}.', 20),
  ('Ticket cerrado',           '^TICKET_PV\.cerrar$', 'in-app', 'ADMIN', 'Ticket cerrado', 'El ticket {id} se cerró.', 30),
  ('N.V. cambió de estado',    '^NV\.(avanzar|cambiar)$', 'in-app', 'ADMIN', 'N.V. actualizada', 'La N.V. {id}: {desde} → {hasta}.', 40),
  ('Calidad · rechazo',        '^CALIDAD\.rechazar$', 'in-app', 'ADMIN', 'Producto rechazado', 'Calidad marcó {id} como Malo.', 50)
on conflict do nothing;
