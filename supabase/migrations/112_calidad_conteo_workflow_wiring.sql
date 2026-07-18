-- ============================================================================
--  112_calidad_conteo_workflow_wiring.sql
--  Workflow Engine — Fase 2 (final): completa CALIDAD y CONTEO (que estaban como
--  esqueleto) y los cablea al motor por trigger (tablas de bajo volumen).
--   • CALIDAD: máquina del flag de producto (tms_calidad_flags.estado_calidad):
--       EN_AUDITORIA → CUARENTENA / LIBERADO / MALO.
--   • CONTEO: sesión (tms_conteo_sesiones.estado): abierta ⇄ cerrada.
--  Trigger espeja alta + cambio de estado en workflow_history. Sin cambios de
--  lógica ni de autorización del dominio.
-- ============================================================================

-- ── Definición: estados ─────────────────────────────────────────────────────
insert into public.workflow_state (workflow, codigo, etiqueta, es_inicial, es_final, orden, color) values
  ('CALIDAD','EN_AUDITORIA','En Auditoría',true,false,10,'#0891b2'),
  ('CALIDAD','CUARENTENA','Cuarentena',false,false,20,'#f59e0b'),
  ('CALIDAD','LIBERADO','Liberado',false,true,30,'#10b981'),
  ('CALIDAD','MALO','Malo / Rechazado',false,true,40,'#ef4444'),
  ('CONTEO','abierta','Abierta',true,false,10,'#2563eb'),
  ('CONTEO','cerrada','Cerrada',false,true,20,'#10b981')
on conflict (workflow, codigo) do nothing;

-- ── Definición: transiciones ────────────────────────────────────────────────
insert into public.workflow_transition (workflow, desde, hasta, accion, permiso_id, orden) values
  ('CALIDAD', null,           'EN_AUDITORIA', 'crear',     'manage_quality', 10),
  ('CALIDAD', 'EN_AUDITORIA', 'CUARENTENA',   'cuarentena','manage_quality', 20),
  ('CALIDAD', 'EN_AUDITORIA', 'LIBERADO',     'liberar',   'manage_quality', 30),
  ('CALIDAD', 'EN_AUDITORIA', 'MALO',         'rechazar',  'manage_quality', 40),
  ('CALIDAD', 'CUARENTENA',   'LIBERADO',     'liberar',   'manage_quality', 50),
  ('CALIDAD', 'CUARENTENA',   'MALO',         'rechazar',  'manage_quality', 60),
  ('CALIDAD', 'CUARENTENA',   'EN_AUDITORIA', 'reproceso', 'manage_quality', 70),
  ('CONTEO',  null,      'abierta', 'crear',   'manage_conteo',    10),
  ('CONTEO',  'abierta', 'cerrada', 'cerrar',  'supervise_conteo', 20),
  ('CONTEO',  'cerrada', 'abierta', 'reabrir', 'supervise_conteo', 30)
on conflict do nothing;

-- ── CALIDAD: trigger sobre tms_calidad_flags.estado_calidad ─────────────────
create or replace function public._cal_wf_alta()
returns trigger language plpgsql security definer set search_path to 'public'
as $function$
begin
  insert into public.workflow_history (workflow, entidad_id, desde, hasta, accion, actor, nota)
  values ('CALIDAD', new.id::text, null, new.estado_calidad, 'crear', public._panel_actor(), new.codigo_producto);
  return new;
end; $function$;
drop trigger if exists trg_cal_workflow_alta on public.tms_calidad_flags;
create trigger trg_cal_workflow_alta after insert on public.tms_calidad_flags
  for each row execute function public._cal_wf_alta();

create or replace function public._cal_wf_cambio()
returns trigger language plpgsql security definer set search_path to 'public'
as $function$
declare v_accion text;
begin
  if new.estado_calidad is distinct from old.estado_calidad then
    v_accion := case new.estado_calidad
      when 'LIBERADO'     then 'liberar'
      when 'CUARENTENA'   then 'cuarentena'
      when 'MALO'         then 'rechazar'
      when 'EN_AUDITORIA' then 'reproceso'
      else 'cambiar' end;
    insert into public.workflow_history (workflow, entidad_id, desde, hasta, accion, actor, nota)
    values ('CALIDAD', new.id::text, old.estado_calidad, new.estado_calidad, v_accion, public._panel_actor(), new.codigo_producto);
  end if;
  return new;
end; $function$;
drop trigger if exists trg_cal_workflow_cambio on public.tms_calidad_flags;
create trigger trg_cal_workflow_cambio after update on public.tms_calidad_flags
  for each row execute function public._cal_wf_cambio();

-- ── CONTEO: trigger sobre tms_conteo_sesiones.estado ────────────────────────
create or replace function public._conteo_wf_alta()
returns trigger language plpgsql security definer set search_path to 'public'
as $function$
begin
  insert into public.workflow_history (workflow, entidad_id, desde, hasta, accion, actor, nota)
  values ('CONTEO', new.id::text, null, coalesce(new.estado,'abierta'), 'crear', public._panel_actor(), new.nombre);
  return new;
end; $function$;
drop trigger if exists trg_conteo_workflow_alta on public.tms_conteo_sesiones;
create trigger trg_conteo_workflow_alta after insert on public.tms_conteo_sesiones
  for each row execute function public._conteo_wf_alta();

create or replace function public._conteo_wf_cambio()
returns trigger language plpgsql security definer set search_path to 'public'
as $function$
declare v_accion text;
begin
  if new.estado is distinct from old.estado then
    v_accion := case new.estado when 'cerrada' then 'cerrar' when 'abierta' then 'reabrir' else 'cambiar' end;
    insert into public.workflow_history (workflow, entidad_id, desde, hasta, accion, actor, nota)
    values ('CONTEO', new.id::text, old.estado, new.estado, v_accion, public._panel_actor(), new.nombre);
  end if;
  return new;
end; $function$;
drop trigger if exists trg_conteo_workflow_cambio on public.tms_conteo_sesiones;
create trigger trg_conteo_workflow_cambio after update on public.tms_conteo_sesiones
  for each row execute function public._conteo_wf_cambio();
