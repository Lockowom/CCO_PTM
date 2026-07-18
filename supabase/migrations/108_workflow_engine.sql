-- ============================================================================
--  108_workflow_engine.sql
--  Workflow Engine: convierte las máquinas de estado "dibujadas/en código" en
--  DATOS, para poder crear/editar procesos sin programar y para que Admin muestre
--  las transiciones y su historial. Diseño en docs/ARQUITECTURA_CCO.md §7.3.
--
--  Tablas:
--    workflow_definition  — un proceso (NV, OT, TICKET_PV, ...)
--    workflow_state       — estados de un proceso (inicial/final, orden, color)
--    workflow_transition  — aristas válidas (desde→hasta por acción) + permiso
--    workflow_history     — quién movió qué y cuándo (bitácora del motor)
--  RLS: lectura para authenticated; escrituras SOLO por RPC gateada
--       (_wf_puede_gestionar → admin o manage_workflows).
--  RPC genérica wf_transicionar(workflow, entidad, desde, accion, nota) valida la
--  transición + su permiso y registra el historial.
--  Permisos: view_workflows / manage_workflows (módulo Administración).
--  Siembra: OT (TMS) y TICKET_PV (Post-Venta) — ya enforced en código — y NV como
--  proceso data-driven (hoy sin enforce). CALIDAD/CONTEO quedan como esqueleto.
-- ============================================================================

-- ── Tablas ──────────────────────────────────────────────────────────────────
create table if not exists public.workflow_definition (
  codigo      text primary key,
  nombre      text not null,
  descripcion text,
  activo      boolean not null default true,
  orden       int not null default 0,
  updated_at  timestamptz not null default now(),
  updated_by  text
);
comment on table public.workflow_definition is 'Workflow Engine: definición de un proceso (máquina de estado como datos).';

create table if not exists public.workflow_state (
  workflow    text not null references public.workflow_definition(codigo) on delete cascade,
  codigo      text not null,
  etiqueta    text not null,
  es_inicial  boolean not null default false,
  es_final    boolean not null default false,
  orden       int not null default 0,
  color       text,
  primary key (workflow, codigo)
);
comment on table public.workflow_state is 'Workflow Engine: estados de un proceso.';

create table if not exists public.workflow_transition (
  id          bigint generated always as identity primary key,
  workflow    text not null references public.workflow_definition(codigo) on delete cascade,
  desde       text,                       -- null = transición de creación
  hasta       text not null,
  accion      text not null,              -- 'asignar','avanzar','cancelar',...
  permiso_id  text references public.tms_permisos(id),  -- Pilar 4: 1 transición = 1 permiso
  orden       int not null default 0,
  updated_at  timestamptz not null default now(),
  updated_by  text,
  constraint workflow_transition_hasta_fk  foreign key (workflow, hasta) references public.workflow_state(workflow, codigo) on delete cascade,
  constraint workflow_transition_desde_fk  foreign key (workflow, desde) references public.workflow_state(workflow, codigo) on delete cascade
);
comment on table public.workflow_transition is 'Workflow Engine: transiciones válidas (desde→hasta por acción) y el permiso que las habilita.';

create table if not exists public.workflow_history (
  id          bigint generated always as identity primary key,
  workflow    text not null,
  entidad_id  text not null,
  desde       text,
  hasta       text not null,
  accion      text,
  actor       text,
  nota        text,
  creado_en   timestamptz not null default now()
);
comment on table public.workflow_history is 'Workflow Engine: bitácora de transiciones ejecutadas.';
create index if not exists workflow_history_idx on public.workflow_history (workflow, entidad_id, creado_en desc);

-- ── RLS: lectura authenticated; escritura solo por RPC ──────────────────────
alter table public.workflow_definition  enable row level security;
alter table public.workflow_state       enable row level security;
alter table public.workflow_transition  enable row level security;
alter table public.workflow_history     enable row level security;

drop policy if exists wf_def_select on public.workflow_definition;
drop policy if exists wf_state_select on public.workflow_state;
drop policy if exists wf_trans_select on public.workflow_transition;
drop policy if exists wf_hist_select on public.workflow_history;
create policy wf_def_select   on public.workflow_definition for select to authenticated using (true);
create policy wf_state_select on public.workflow_state      for select to authenticated using (true);
create policy wf_trans_select on public.workflow_transition for select to authenticated using (true);
create policy wf_hist_select  on public.workflow_history    for select to authenticated using (true);
grant select on public.workflow_definition, public.workflow_state, public.workflow_transition, public.workflow_history to authenticated;

-- ── Gate ────────────────────────────────────────────────────────────────────
create or replace function public._wf_puede_gestionar()
returns boolean language sql stable security definer set search_path to 'public'
as $$
  select coalesce(private.is_admin(), false)
      or coalesce(public.usuario_tiene_algun_permiso(array['manage_workflows']), false);
$$;
revoke all on function public._wf_puede_gestionar() from public, anon;
grant execute on function public._wf_puede_gestionar() to authenticated;

-- ── RPCs de configuración (admin) ───────────────────────────────────────────
create or replace function public.wf_guardar_definicion(p jsonb)
returns jsonb language plpgsql security definer set search_path to 'public'
as $function$
begin
  if not public._wf_puede_gestionar() then raise exception 'No autorizado'; end if;
  insert into public.workflow_definition (codigo, nombre, descripcion, activo, orden, updated_by)
  values (nullif(p->>'codigo',''), nullif(p->>'nombre',''), p->>'descripcion',
          coalesce((p->>'activo')::boolean, true), coalesce(nullif(p->>'orden','')::int,0), public._panel_actor())
  on conflict (codigo) do update set
    nombre = coalesce(nullif(excluded.nombre,''), public.workflow_definition.nombre),
    descripcion = excluded.descripcion, activo = excluded.activo, orden = excluded.orden,
    updated_at = now(), updated_by = public._panel_actor();
  return jsonb_build_object('ok', true, 'codigo', p->>'codigo');
end; $function$;

create or replace function public.wf_eliminar_definicion(p_codigo text)
returns jsonb language plpgsql security definer set search_path to 'public'
as $function$
begin
  if not public._wf_puede_gestionar() then raise exception 'No autorizado'; end if;
  delete from public.workflow_definition where codigo = p_codigo;  -- cascade estados/transiciones
  return jsonb_build_object('ok', true, 'codigo', p_codigo);
end; $function$;

create or replace function public.wf_guardar_estado(p jsonb)
returns jsonb language plpgsql security definer set search_path to 'public'
as $function$
begin
  if not public._wf_puede_gestionar() then raise exception 'No autorizado'; end if;
  insert into public.workflow_state (workflow, codigo, etiqueta, es_inicial, es_final, orden, color)
  values (nullif(p->>'workflow',''), nullif(p->>'codigo',''), coalesce(nullif(p->>'etiqueta',''), p->>'codigo'),
          coalesce((p->>'es_inicial')::boolean,false), coalesce((p->>'es_final')::boolean,false),
          coalesce(nullif(p->>'orden','')::int,0), p->>'color')
  on conflict (workflow, codigo) do update set
    etiqueta = excluded.etiqueta, es_inicial = excluded.es_inicial, es_final = excluded.es_final,
    orden = excluded.orden, color = excluded.color;
  return jsonb_build_object('ok', true);
end; $function$;

create or replace function public.wf_eliminar_estado(p_workflow text, p_codigo text)
returns jsonb language plpgsql security definer set search_path to 'public'
as $function$
begin
  if not public._wf_puede_gestionar() then raise exception 'No autorizado'; end if;
  delete from public.workflow_state where workflow = p_workflow and codigo = p_codigo;
  return jsonb_build_object('ok', true);
end; $function$;

create or replace function public.wf_guardar_transicion(p jsonb)
returns jsonb language plpgsql security definer set search_path to 'public'
as $function$
declare v_id bigint := nullif(p->>'id','')::bigint;
begin
  if not public._wf_puede_gestionar() then raise exception 'No autorizado'; end if;
  if v_id is not null then
    update public.workflow_transition set
      desde = nullif(p->>'desde',''), hasta = coalesce(nullif(p->>'hasta',''), hasta),
      accion = coalesce(nullif(p->>'accion',''), accion), permiso_id = nullif(p->>'permiso_id',''),
      orden = coalesce(nullif(p->>'orden','')::int, orden), updated_at = now(), updated_by = public._panel_actor()
    where id = v_id;
  else
    insert into public.workflow_transition (workflow, desde, hasta, accion, permiso_id, orden, updated_by)
    values (nullif(p->>'workflow',''), nullif(p->>'desde',''), nullif(p->>'hasta',''),
            nullif(p->>'accion',''), nullif(p->>'permiso_id',''), coalesce(nullif(p->>'orden','')::int,0), public._panel_actor());
  end if;
  return jsonb_build_object('ok', true);
end; $function$;

create or replace function public.wf_eliminar_transicion(p_id bigint)
returns jsonb language plpgsql security definer set search_path to 'public'
as $function$
begin
  if not public._wf_puede_gestionar() then raise exception 'No autorizado'; end if;
  delete from public.workflow_transition where id = p_id;
  return jsonb_build_object('ok', true, 'id', p_id);
end; $function$;

-- ── RPC de ejecución: valida transición + permiso y registra historial ──────
create or replace function public.wf_transicionar(p_workflow text, p_entidad_id text, p_desde text, p_accion text, p_nota text default null)
returns jsonb language plpgsql security definer set search_path to 'public'
as $function$
declare t public.workflow_transition;
begin
  -- resuelve la transición por (workflow, desde, accion); desde null = creación
  select * into t from public.workflow_transition
   where workflow = p_workflow and accion = p_accion
     and (desde is not distinct from nullif(p_desde,''))
   order by orden limit 1;
  if t.id is null then
    raise exception 'Transición no válida: % / % desde %', p_workflow, p_accion, coalesce(p_desde,'(inicio)');
  end if;
  -- autorización: si la transición exige permiso, verificarlo
  if t.permiso_id is not null
     and not coalesce(private.is_admin(), false)
     and not coalesce(public.usuario_tiene_algun_permiso(array[t.permiso_id]), false) then
    raise exception 'No autorizado para la acción % (requiere %)', p_accion, t.permiso_id;
  end if;
  insert into public.workflow_history (workflow, entidad_id, desde, hasta, accion, actor, nota)
  values (p_workflow, p_entidad_id, nullif(p_desde,''), t.hasta, p_accion, public._panel_actor(), p_nota);
  return jsonb_build_object('ok', true, 'hasta', t.hasta);
end; $function$;

revoke all on function public.wf_guardar_definicion(jsonb)   from public, anon;
revoke all on function public.wf_eliminar_definicion(text)    from public, anon;
revoke all on function public.wf_guardar_estado(jsonb)        from public, anon;
revoke all on function public.wf_eliminar_estado(text, text)  from public, anon;
revoke all on function public.wf_guardar_transicion(jsonb)    from public, anon;
revoke all on function public.wf_eliminar_transicion(bigint)  from public, anon;
revoke all on function public.wf_transicionar(text, text, text, text, text) from public, anon;
grant execute on function public.wf_guardar_definicion(jsonb)   to authenticated;
grant execute on function public.wf_eliminar_definicion(text)    to authenticated;
grant execute on function public.wf_guardar_estado(jsonb)        to authenticated;
grant execute on function public.wf_eliminar_estado(text, text)  to authenticated;
grant execute on function public.wf_guardar_transicion(jsonb)    to authenticated;
grant execute on function public.wf_eliminar_transicion(bigint)  to authenticated;
grant execute on function public.wf_transicionar(text, text, text, text, text) to authenticated;

-- ── Permisos (módulo Administración) ────────────────────────────────────────
insert into public.tms_permisos (id, nombre, modulo) values
  ('view_workflows',   'Workflows · Ver procesos y transiciones', 'Administración'),
  ('manage_workflows', 'Workflows · Editar procesos/estados/transiciones', 'Administración')
on conflict (id) do update set nombre = excluded.nombre, modulo = excluded.modulo;

-- ── Siembra (idempotente): OT (TMS), TICKET_PV (Post-Venta), NV ─────────────
insert into public.workflow_definition (codigo, nombre, descripcion, orden) values
  ('OT',        'Orden de Transporte (TMS)', 'Transporte propio: asignación → ruta → POD.', 10),
  ('TICKET_PV', 'Ticket Post-Venta',         'Servicio técnico: apertura → gestión → cierre.', 20),
  ('NV',        'Nota de Venta (Operaciones)','Ciclo comercial-logístico de la N.V.', 30),
  ('CALIDAD',   'Dictamen de Calidad',       'Flujo de calidad por producto (esqueleto).', 40),
  ('CONTEO',    'Conteo Cíclico',            'Sesión de conteo (esqueleto).', 50)
on conflict (codigo) do nothing;

-- Estados
insert into public.workflow_state (workflow, codigo, etiqueta, es_inicial, es_final, orden, color) values
  ('OT','pendiente_asignacion','Pendiente Asignación',true,false,10,'#f59e0b'),
  ('OT','programado','Programado',false,false,20,'#2563eb'),
  ('OT','en_carga','En Carga',false,false,30,'#7c3aed'),
  ('OT','despachado','Despachado',false,false,40,'#0891b2'),
  ('OT','en_ruta','En Ruta',false,false,50,'#06b6d4'),
  ('OT','entregado','Entregado',false,false,60,'#10b981'),
  ('OT','cerrado','Cerrado',false,true,70,'#64748b'),
  ('OT','cancelado','Cancelado',false,true,80,'#ef4444'),
  ('TICKET_PV','Abierto','Abierto',true,false,10,'#2563eb'),
  ('TICKET_PV','En Proceso','En Proceso',false,false,20,'#7c3aed'),
  ('TICKET_PV','En Evaluación','En Evaluación',false,false,30,'#0891b2'),
  ('TICKET_PV','Programada','Programada',false,false,40,'#0ea5e9'),
  ('TICKET_PV','Pendiente Cliente','Pendiente Cliente',false,false,50,'#f59e0b'),
  ('TICKET_PV','Cerrado','Cerrado',false,true,60,'#10b981'),
  ('TICKET_PV','Cancelado','Cancelado',false,true,70,'#ef4444'),
  ('NV','En Proceso','En Proceso',true,false,10,'#f59e0b'),
  ('NV','Shipping','Shipping',false,false,20,'#0891b2'),
  ('NV','Currier','Currier',false,false,30,'#7c3aed'),
  ('NV','En Ruta','En Ruta',false,false,40,'#06b6d4'),
  ('NV','Entregado','Entregado',false,true,50,'#10b981')
on conflict (workflow, codigo) do nothing;

-- Transiciones
insert into public.workflow_transition (workflow, desde, hasta, accion, permiso_id, orden) values
  ('OT', null, 'pendiente_asignacion', 'crear', 'manage_tms', 10),
  ('OT', 'pendiente_asignacion', 'programado', 'asignar', 'manage_tms', 20),
  ('OT', 'programado', 'en_carga', 'marcar_en_carga', 'manage_tms', 30),
  ('OT', 'en_carga', 'despachado', 'marcar_despachado', 'manage_tms', 40),
  ('OT', 'despachado', 'en_ruta', 'salir_a_ruta', 'manage_tms', 50),
  ('OT', 'en_ruta', 'entregado', 'registrar_pod', 'manage_tms', 60),
  ('OT', 'entregado', 'cerrado', 'cerrar', 'manage_tms', 70),
  ('OT', 'pendiente_asignacion', 'cancelado', 'cancelar', 'supervise_tms', 80),
  ('OT', 'programado', 'cancelado', 'cancelar', 'supervise_tms', 81),
  ('OT', 'en_carga', 'cancelado', 'cancelar', 'supervise_tms', 82),
  ('OT', 'despachado', 'cancelado', 'cancelar', 'supervise_tms', 83),
  ('OT', 'en_ruta', 'cancelado', 'cancelar', 'supervise_tms', 84),
  ('TICKET_PV', null, 'Abierto', 'crear', 'manage_postventa', 10),
  ('TICKET_PV', 'Abierto', 'En Proceso', 'avanzar', 'manage_postventa', 20),
  ('TICKET_PV', 'En Proceso', 'En Evaluación', 'avanzar', 'manage_postventa', 30),
  ('TICKET_PV', 'En Evaluación', 'Programada', 'avanzar', 'manage_postventa', 40),
  ('TICKET_PV', 'Programada', 'Pendiente Cliente', 'avanzar', 'manage_postventa', 50),
  ('TICKET_PV', 'Pendiente Cliente', 'Cerrado', 'cerrar', 'manage_postventa', 60),
  ('TICKET_PV', 'Abierto', 'Cancelado', 'cancelar', 'supervise_postventa', 70),
  ('TICKET_PV', 'En Proceso', 'Cancelado', 'cancelar', 'supervise_postventa', 71),
  ('TICKET_PV', 'En Evaluación', 'Cancelado', 'cancelar', 'supervise_postventa', 72),
  ('TICKET_PV', 'Programada', 'Cancelado', 'cancelar', 'supervise_postventa', 73),
  ('TICKET_PV', 'Pendiente Cliente', 'Cancelado', 'cancelar', 'supervise_postventa', 74),
  ('NV', null, 'En Proceso', 'crear', 'manage_panel', 10),
  ('NV', 'En Proceso', 'Shipping', 'avanzar', 'manage_panel', 20),
  ('NV', 'Shipping', 'Currier', 'avanzar', 'manage_panel', 30),
  ('NV', 'Currier', 'En Ruta', 'avanzar', 'manage_panel', 40),
  ('NV', 'En Ruta', 'Entregado', 'avanzar', 'manage_panel', 50)
on conflict do nothing;
