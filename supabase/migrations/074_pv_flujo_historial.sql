-- 074_pv_flujo_historial.sql
-- Post-Venta: flujo de estados con trazabilidad. (1) Historial automático de
-- cada cambio de estado (quién, cuándo, de→a, nota, resultado) vía trigger.
-- (2) RPC avanzar_pv_ticket (siguiente estado del flujo) y cerrar_pv_ticket
-- (dar por terminado con resultado). La nota de cada transición viaja por una
-- variable de sesión que lee el trigger, así TODO cambio de estado queda
-- registrado — venga de Avanzar, Cerrar o del editor genérico.

create table if not exists public.tms_postventa_historial (
  id              bigint generated always as identity primary key,
  ticket_id       uuid not null references public.tms_postventa_tickets(id) on delete cascade,
  numero          text,
  estado_anterior text,
  estado_nuevo    text,
  resultado       text,
  nota            text,
  usuario_id      uuid,
  usuario_nombre  text,
  created_at      timestamptz not null default now()
);
create index if not exists idx_pv_hist_ticket on public.tms_postventa_historial(ticket_id, created_at);
alter table public.tms_postventa_historial enable row level security;
-- Sin política de SELECT directo: se consulta vía la RPC pv_historial (definer).

-- Trigger: registra cada cambio de estado (o de resultado).
create or replace function public.pv_log_historial()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  if (new.estado is distinct from old.estado) or (new.resultado is distinct from old.resultado) then
    insert into public.tms_postventa_historial
      (ticket_id, numero, estado_anterior, estado_nuevo, resultado, nota, usuario_id, usuario_nombre)
    values (
      new.id, new.numero, old.estado, new.estado, new.resultado,
      nullif(current_setting('pv.nota', true), ''),
      auth.uid(),
      coalesce((select nombre from tms_usuarios where auth_uid = auth.uid() limit 1),
               case when auth.role() = 'service_role' then 'Sistema' else null end)
    );
  end if;
  return new;
end $function$;

drop trigger if exists trg_pv_historial on public.tms_postventa_tickets;
create trigger trg_pv_historial after update on public.tms_postventa_tickets
  for each row execute function public.pv_log_historial();

-- Registro inicial (estado de apertura) al crear el ticket.
create or replace function public.pv_log_historial_alta()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  insert into public.tms_postventa_historial
    (ticket_id, numero, estado_anterior, estado_nuevo, nota, usuario_id, usuario_nombre)
  values (new.id, new.numero, null, new.estado, 'Ticket creado', new.creado_por, new.creado_por_nombre);
  return new;
end $function$;
drop trigger if exists trg_pv_historial_alta on public.tms_postventa_tickets;
create trigger trg_pv_historial_alta after insert on public.tms_postventa_tickets
  for each row execute function public.pv_log_historial_alta();

-- Flujo canónico (para "Siguiente"). Cancelado queda fuera del flujo lineal.
create or replace function public.avanzar_pv_ticket(p_numero text, p_nota text default null)
returns public.tms_postventa_tickets
language plpgsql
security definer
set search_path to 'public'
as $function$
declare v record; r public.tms_postventa_tickets;
  v_flujo text[] := array['Abierto','En Proceso','En Evaluación','Programada','Pendiente Cliente','Cerrado'];
  v_idx int; v_next text;
begin
  select * into v from public._pv_assert(false);   -- requiere gestión
  select * into r from public.tms_postventa_tickets where numero = btrim(p_numero);
  if r.id is null then raise exception 'El ticket % no existe', p_numero; end if;
  v_idx := array_position(v_flujo, r.estado);
  if v_idx is null then raise exception 'El estado actual (%) no está en el flujo; usa el editor para elegir el estado.', r.estado; end if;
  if v_idx >= array_length(v_flujo, 1) then raise exception 'El ticket ya está en el último estado (%).', r.estado; end if;
  v_next := v_flujo[v_idx + 1];
  perform set_config('pv.nota', coalesce(p_nota, ''), true);
  update public.tms_postventa_tickets
     set estado = v_next,
         fecha_cierre = case when v_next = 'Cerrado' then coalesce(fecha_cierre, (now() at time zone 'America/Santiago')::date) else fecha_cierre end,
         updated_at = now()
   where id = r.id returning * into r;
  return r;
end $function$;
revoke all on function public.avanzar_pv_ticket(text, text) from public, anon;
grant execute on function public.avanzar_pv_ticket(text, text) to authenticated;

-- Dar por terminado (cerrar con resultado).
create or replace function public.cerrar_pv_ticket(p_numero text, p_resultado text default 'Resuelto', p_nota text default null)
returns public.tms_postventa_tickets
language plpgsql
security definer
set search_path to 'public'
as $function$
declare v record; r public.tms_postventa_tickets;
begin
  select * into v from public._pv_assert(false);
  select * into r from public.tms_postventa_tickets where numero = btrim(p_numero);
  if r.id is null then raise exception 'El ticket % no existe', p_numero; end if;
  perform set_config('pv.nota', coalesce(p_nota, ''), true);
  update public.tms_postventa_tickets
     set estado = 'Cerrado',
         resultado = coalesce(nullif(btrim(coalesce(p_resultado, '')), ''), 'Resuelto'),
         fecha_cierre = coalesce(fecha_cierre, (now() at time zone 'America/Santiago')::date),
         updated_at = now()
   where id = r.id returning * into r;
  return r;
end $function$;
revoke all on function public.cerrar_pv_ticket(text, text, text) from public, anon;
grant execute on function public.cerrar_pv_ticket(text, text, text) to authenticated;

-- Historial de un ticket (ordenado).
create or replace function public.pv_historial(p_numero text)
returns setof public.tms_postventa_historial
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  perform public._pv_assert(false);
  return query
    select h.* from public.tms_postventa_historial h
    join public.tms_postventa_tickets t on t.id = h.ticket_id
    where t.numero = btrim(p_numero)
    order by h.created_at asc, h.id asc;
end $function$;
revoke all on function public.pv_historial(text) from public, anon;
grant execute on function public.pv_historial(text) to authenticated;
