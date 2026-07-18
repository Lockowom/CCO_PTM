-- ============================================================================
--  110_postventa_workflow_wiring.sql
--  Workflow Engine — Fase 2 (cont.): cablea Post-Venta al motor. A diferencia de
--  TMS (que instrumenta cada RPC), Post-Venta tiene MÚLTIPLES caminos de escritura
--  (avanzar_pv_ticket, cerrar_pv_ticket, actualizar_pv_ticket free-form, ingesta
--  de correo), así que se usa un TRIGGER paralelo al de tms_postventa_historial:
--  captura TODO cambio de estado y lo espeja en workflow_history (proceso
--  TICKET_PV). No cambia la autorización ni la lógica del dominio.
--    • alta (INSERT):     null → estado_inicial, acción 'crear'
--    • cambio (UPDATE):   old.estado → new.estado, acción derivada
--                         (Cerrado→'cerrar', Cancelado→'cancelar', si no 'avanzar')
--  entidad_id = ticket.id (uuid) en texto. Actor vía _panel_actor().
-- ============================================================================

create or replace function public._pv_wf_alta()
returns trigger language plpgsql security definer set search_path to 'public'
as $function$
begin
  insert into public.workflow_history (workflow, entidad_id, desde, hasta, accion, actor, nota)
  values ('TICKET_PV', new.id::text, null, new.estado, 'crear', public._panel_actor(),
          coalesce(new.numero, 'Ticket creado'));
  return new;
end; $function$;

drop trigger if exists trg_pv_workflow_alta on public.tms_postventa_tickets;
create trigger trg_pv_workflow_alta after insert on public.tms_postventa_tickets
  for each row execute function public._pv_wf_alta();

create or replace function public._pv_wf_cambio()
returns trigger language plpgsql security definer set search_path to 'public'
as $function$
declare v_accion text;
begin
  if new.estado is distinct from old.estado then
    v_accion := case
      when new.estado = 'Cerrado'   then 'cerrar'
      when new.estado = 'Cancelado' then 'cancelar'
      else 'avanzar' end;
    insert into public.workflow_history (workflow, entidad_id, desde, hasta, accion, actor, nota)
    values ('TICKET_PV', new.id::text, old.estado, new.estado, v_accion, public._panel_actor(),
            nullif(current_setting('pv.nota', true), ''));
  end if;
  return new;
end; $function$;

drop trigger if exists trg_pv_workflow_cambio on public.tms_postventa_tickets;
create trigger trg_pv_workflow_cambio after update on public.tms_postventa_tickets
  for each row execute function public._pv_wf_cambio();
