-- ============================================================================
--  104_tms_fase1_ordenes.sql  ·  TMS (Transporte) — Fase 1: cimiento de datos
--
--  Reconstrucción desde 0 del módulo de Transporte Propio, a partir del flujo
--  modelado: Crear Orden → Pendiente Asignación → Programado → En Carga →
--  Despachado → En Ruta → Entregado (POD) → Cerrado, con incidencias que
--  pueden Reprogramar (volver a Programado).
--
--  • Tablas NUEVAS y limpias (no se toca tms_control_despacho, con 4.066 filas
--    de Consultas): tms_vehiculos, tms_transporte_ordenes, tms_transporte_incidencias.
--  • Reusa tms_conductores / tms_rutas por referencia (id suelto, sin acoplar).
--  • RLS: lectura authenticated; escrituras SOLO por RPC gateada.
--  • Gate: admin o manage_tms/manage_panel (manage_tms se agrega en Fase 2/UI;
--    hoy admin y manage_panel ya operan, así que el cimiento funciona).
--  • Se enlaza con la N.V.: la orden se crea desde tms_operaciones y el POD
--    marca la N.V. como Entregado.
-- ============================================================================

-- ── Vehículos (flota propia) ────────────────────────────────────────────────
create table if not exists public.tms_vehiculos (
  id           bigint generated always as identity primary key,
  patente      text unique not null,
  tipo         text,                       -- Camión, Camioneta, Furgón, Moto…
  capacidad_kg numeric,
  capacidad_m3 numeric,
  descripcion  text,
  activo       boolean not null default true,
  created_at   timestamptz not null default now()
);

-- ── Orden de transporte (máquina de estados) ────────────────────────────────
create table if not exists public.tms_transporte_ordenes (
  id                bigint generated always as identity primary key,
  folio             text unique,
  oper_id           bigint,                -- N.V. de origen (tms_operaciones.id)
  nv                text,
  cliente           text,
  direccion         text,
  comuna            text,
  estado            text not null default 'pendiente_asignacion',
  vehiculo_id       bigint references public.tms_vehiculos(id) on delete set null,
  conductor_id      bigint,                -- ref tms_conductores (suelto)
  ruta_id           bigint,                -- ref tms_rutas (suelto)
  fecha_programada  date,
  hora_programada   text,
  fecha_en_carga    timestamptz,
  fecha_despachado  timestamptz,
  fecha_en_ruta     timestamptz,
  fecha_entregado   timestamptz,
  pod_foto_url      text,
  pod_firma_url     text,
  pod_gps           text,
  pod_recibido_por  text,
  pod_hora          timestamptz,
  observacion       text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  updated_by        text,
  constraint tms_ot_estado_chk check (estado in
    ('pendiente_asignacion','programado','en_carga','despachado','en_ruta','entregado','cerrado','cancelado'))
);
create index if not exists idx_tms_ot_estado on public.tms_transporte_ordenes(estado);
create index if not exists idx_tms_ot_oper on public.tms_transporte_ordenes(oper_id);

-- ── Incidencias de la orden ─────────────────────────────────────────────────
create table if not exists public.tms_transporte_incidencias (
  id          bigint generated always as identity primary key,
  orden_id    bigint not null references public.tms_transporte_ordenes(id) on delete cascade,
  tipo        text not null,              -- Retraso, Accidente, Cliente Ausente, Dirección Incorrecta, Producto Dañado
  detalle     text,
  estado      text not null default 'abierta',   -- abierta | resuelta
  resolucion  text,
  created_by  text,
  created_at  timestamptz not null default now(),
  resuelta_at timestamptz,
  constraint tms_inc_estado_chk check (estado in ('abierta','resuelta'))
);
create index if not exists idx_tms_inc_orden on public.tms_transporte_incidencias(orden_id);

-- ── RLS: lectura authenticated; escritura por RPC ───────────────────────────
alter table public.tms_vehiculos               enable row level security;
alter table public.tms_transporte_ordenes      enable row level security;
alter table public.tms_transporte_incidencias  enable row level security;
drop policy if exists tms_veh_sel on public.tms_vehiculos;
drop policy if exists tms_ot_sel  on public.tms_transporte_ordenes;
drop policy if exists tms_inc_sel on public.tms_transporte_incidencias;
create policy tms_veh_sel on public.tms_vehiculos              for select to authenticated using (true);
create policy tms_ot_sel  on public.tms_transporte_ordenes     for select to authenticated using (true);
create policy tms_inc_sel on public.tms_transporte_incidencias for select to authenticated using (true);
grant select on public.tms_vehiculos, public.tms_transporte_ordenes, public.tms_transporte_incidencias to authenticated;

-- ── Gate de gestión ─────────────────────────────────────────────────────────
create or replace function public._tms_puede_gestionar()
returns boolean language sql stable security definer set search_path to 'public'
as $$
  select coalesce(private.is_admin(), false)
      or coalesce(public.usuario_tiene_algun_permiso(array['manage_tms','manage_panel']), false);
$$;
revoke all on function public._tms_puede_gestionar() from public, anon;
grant execute on function public._tms_puede_gestionar() to authenticated;

-- ── Folio OT-AAAA-#### ───────────────────────────────────────────────────────
create or replace function public._tms_next_folio()
returns text language sql security definer set search_path to 'public'
as $$
  select 'OT-'||to_char(now() at time zone 'America/Santiago','YYYY')||'-'||
         lpad((1 + count(*))::text, 4, '0')
  from public.tms_transporte_ordenes
  where folio like 'OT-'||to_char(now() at time zone 'America/Santiago','YYYY')||'-%';
$$;

-- ── Crear orden desde una N.V. (idempotente por oper_id abierto) ─────────────
create or replace function public.tms_orden_crear_desde_nv(p_oper_id bigint)
returns jsonb language plpgsql security definer set search_path to 'public'
as $function$
declare o public.tms_operaciones; r public.tms_transporte_ordenes; v_nv text;
begin
  if not public._tms_puede_gestionar() then raise exception 'No autorizado'; end if;
  select * into o from public.tms_operaciones where id = p_oper_id;
  if o.id is null then raise exception 'N.V. no encontrada'; end if;
  -- dedup: si ya hay una orden no cerrada/cancelada para esta N.V., devolverla
  select * into r from public.tms_transporte_ordenes
   where oper_id = p_oper_id and estado not in ('cerrado','cancelado') limit 1;
  if r.id is not null then return jsonb_build_object('ok', true, 'id', r.id, 'folio', r.folio, 'existia', true); end if;
  v_nv := coalesce(o.nv_ptm::text, o.nv_orange, o.nv_farmapack, o.varios);
  insert into public.tms_transporte_ordenes (folio, oper_id, nv, cliente, estado, updated_by)
  values (public._tms_next_folio(), o.id, v_nv, o.cliente, 'pendiente_asignacion', public._panel_actor())
  returning * into r;
  return jsonb_build_object('ok', true, 'id', r.id, 'folio', r.folio);
end; $function$;

-- ── Asignar vehículo + chofer + programación → 'programado' ─────────────────
create or replace function public.tms_orden_asignar(p_id bigint, p jsonb)
returns jsonb language plpgsql security definer set search_path to 'public'
as $function$
declare r public.tms_transporte_ordenes;
begin
  if not public._tms_puede_gestionar() then raise exception 'No autorizado'; end if;
  update public.tms_transporte_ordenes set
    vehiculo_id      = coalesce(nullif(p->>'vehiculo_id','')::bigint, vehiculo_id),
    conductor_id     = coalesce(nullif(p->>'conductor_id','')::bigint, conductor_id),
    ruta_id          = coalesce(nullif(p->>'ruta_id','')::bigint, ruta_id),
    fecha_programada = coalesce(nullif(p->>'fecha_programada','')::date, fecha_programada),
    hora_programada  = coalesce(nullif(p->>'hora_programada',''), hora_programada),
    estado           = case when estado = 'pendiente_asignacion' then 'programado' else estado end,
    updated_at = now(), updated_by = public._panel_actor()
  where id = p_id returning * into r;
  if r.id is null then raise exception 'Orden no encontrada'; end if;
  return jsonb_build_object('ok', true, 'id', r.id, 'estado', r.estado);
end; $function$;

-- ── Transición de estado controlada (con sello de fecha) ────────────────────
create or replace function public.tms_orden_transicion(p_id bigint, p_estado text)
returns jsonb language plpgsql security definer set search_path to 'public'
as $function$
declare r public.tms_transporte_ordenes; v_ok boolean := false;
begin
  if not public._tms_puede_gestionar() then raise exception 'No autorizado'; end if;
  select * into r from public.tms_transporte_ordenes where id = p_id;
  if r.id is null then raise exception 'Orden no encontrada'; end if;
  -- transiciones permitidas
  v_ok := (p_estado='en_carga'  and r.estado='programado')
       or (p_estado='despachado' and r.estado='en_carga')
       or (p_estado='en_ruta'    and r.estado='despachado')
       or (p_estado='entregado'  and r.estado='en_ruta')
       or (p_estado='cerrado'    and r.estado='entregado')
       or (p_estado='programado' and r.estado='en_ruta')          -- reprogramar
       or (p_estado='cancelado'  and r.estado <> 'cerrado');
  if not v_ok then raise exception 'Transición no permitida: % → %', r.estado, p_estado; end if;
  update public.tms_transporte_ordenes set
    estado = p_estado,
    fecha_en_carga   = case when p_estado='en_carga'   then now() else fecha_en_carga end,
    fecha_despachado = case when p_estado='despachado' then now() else fecha_despachado end,
    fecha_en_ruta    = case when p_estado='en_ruta'    then now() else fecha_en_ruta end,
    fecha_entregado  = case when p_estado='entregado'  then now() else fecha_entregado end,
    updated_at = now(), updated_by = public._panel_actor()
  where id = p_id returning * into r;
  return jsonb_build_object('ok', true, 'id', r.id, 'estado', r.estado);
end; $function$;

-- ── POD (prueba de entrega) → 'entregado' + marca la N.V. Entregado ─────────
create or replace function public.tms_orden_pod(p_id bigint, p jsonb)
returns jsonb language plpgsql security definer set search_path to 'public'
as $function$
declare r public.tms_transporte_ordenes;
begin
  if not public._tms_puede_gestionar() then raise exception 'No autorizado'; end if;
  update public.tms_transporte_ordenes set
    pod_foto_url     = coalesce(p->>'foto_url', pod_foto_url),
    pod_firma_url    = coalesce(p->>'firma_url', pod_firma_url),
    pod_gps          = coalesce(p->>'gps', pod_gps),
    pod_recibido_por = coalesce(p->>'recibido_por', pod_recibido_por),
    pod_hora         = now(),
    estado           = 'entregado',
    fecha_entregado  = now(),
    updated_at = now(), updated_by = public._panel_actor()
  where id = p_id and estado = 'en_ruta' returning * into r;
  if r.id is null then raise exception 'Orden no encontrada o no está En Ruta'; end if;
  -- sincroniza la N.V. de origen
  if r.oper_id is not null then
    update public.tms_operaciones set estado = 'Entregado', origen = 'tms' where id = r.oper_id;
  end if;
  return jsonb_build_object('ok', true, 'id', r.id, 'estado', r.estado);
end; $function$;

-- ── Incidencias ─────────────────────────────────────────────────────────────
create or replace function public.tms_incidencia_crear(p_orden_id bigint, p_tipo text, p_detalle text default null)
returns jsonb language plpgsql security definer set search_path to 'public'
as $function$
declare v_id bigint;
begin
  if not public._tms_puede_gestionar() then raise exception 'No autorizado'; end if;
  insert into public.tms_transporte_incidencias (orden_id, tipo, detalle, created_by)
  values (p_orden_id, p_tipo, p_detalle, public._panel_actor()) returning id into v_id;
  return jsonb_build_object('ok', true, 'id', v_id);
end; $function$;

create or replace function public.tms_incidencia_resolver(p_id bigint, p_resolucion text)
returns jsonb language plpgsql security definer set search_path to 'public'
as $function$
declare inc public.tms_transporte_incidencias;
begin
  if not public._tms_puede_gestionar() then raise exception 'No autorizado'; end if;
  update public.tms_transporte_incidencias
     set estado='resuelta', resolucion=p_resolucion, resuelta_at=now()
   where id=p_id returning * into inc;
  if inc.id is null then raise exception 'Incidencia no encontrada'; end if;
  -- si la resolución es reprogramar, la orden vuelve a 'programado'
  if p_resolucion ilike 'reprog%' then
    update public.tms_transporte_ordenes set estado='programado', updated_at=now(), updated_by=public._panel_actor()
     where id=inc.orden_id and estado in ('en_ruta','despachado');
  end if;
  return jsonb_build_object('ok', true, 'id', inc.id);
end; $function$;

-- ── Grants (anon sin acceso) ────────────────────────────────────────────────
do $$
declare fn text;
begin
  foreach fn in array array[
    'tms_orden_crear_desde_nv(bigint)','tms_orden_asignar(bigint, jsonb)','tms_orden_transicion(bigint, text)',
    'tms_orden_pod(bigint, jsonb)','tms_incidencia_crear(bigint, text, text)','tms_incidencia_resolver(bigint, text)',
    '_tms_next_folio()'
  ] loop
    execute format('revoke all on function public.%s from public, anon;', fn);
    execute format('grant execute on function public.%s to authenticated;', fn);
  end loop;
end $$;

-- ── Semilla mínima de flota (demo; editable) ────────────────────────────────
insert into public.tms_vehiculos (patente, tipo, capacidad_kg, descripcion)
select * from (values
  ('AABB11','Camión',3500,'Camión reparto'),
  ('CCDD22','Camioneta',1000,'Camioneta'),
  ('EEFF33','Furgón',1500,'Furgón')
) as v(patente,tipo,cap,descripcion)
where not exists (select 1 from public.tms_vehiculos);
