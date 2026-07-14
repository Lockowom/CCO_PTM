-- 078_pv_ticket_publico.sql
-- Post-Venta: formulario PÚBLICO de solicitud de servicio (sin login).
-- Un cliente o vendedor abre una URL abierta (/soporte) y crea un ticket. La
-- creación NO pasa por _pv_assert (no hay sesión); en su lugar hay una RPC
-- dedicada con validación estricta + anti-spam (rate-limit por IP y global) que
-- SOLO ejecuta el service_role (la invoca la Edge Function `postventa-publico`,
-- que además aplica honeypot + tiempo mínimo de llenado + Turnstile opcional).
-- El ticket entra como BORRADOR (origen='Web', "Sin Asignar", región/tipo por
-- defecto) para que un técnico lo valide y complete la gestión, igual que los de
-- correo. El campo Equipo/Modelo es texto libre (el cliente puede no saber la familia).

-- Bitácora de envíos públicos (para rate-limit y auditoría de origen).
create table if not exists public.tms_postventa_publico_log (
  id        bigint generated always as identity primary key,
  ip        text,
  numero    text,
  creado_en timestamptz not null default now()
);
create index if not exists idx_pv_publico_log_ip_fecha on public.tms_postventa_publico_log (ip, creado_en desc);
create index if not exists idx_pv_publico_log_fecha on public.tms_postventa_publico_log (creado_en desc);
alter table public.tms_postventa_publico_log enable row level security;
-- Sin política: solo la RPC (definer) y el service_role la tocan.

-- RPC pública de alta. security definer; se revoca a anon/authenticated: solo el
-- service_role de la Edge Function la ejecuta.
create or replace function public.crear_pv_ticket_publico(
  p_cliente text, p_contacto text, p_equipo_modelo text, p_descripcion text,
  p_tipo_solicitud text default 'Otro'::text, p_prioridad text default 'Media'::text,
  p_region text default 'Por Definir'::text, p_comuna text default null::text,
  p_numero_serie text default null::text, p_ip text default null::text)
 returns text
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
declare
  r public.tms_postventa_tickets;
  v_anio int; v_pref text; v_n int; v_numero text; i int;
  v_cnt_ip int; v_cnt_glob int;
begin
  -- Validación mínima de contenido.
  if coalesce(btrim(p_cliente),'')='' or coalesce(btrim(p_contacto),'')=''
     or coalesce(btrim(p_equipo_modelo),'')='' or coalesce(btrim(p_descripcion),'')='' then
    raise exception 'Faltan campos obligatorios (empresa/cliente, contacto, equipo/modelo, descripción)';
  end if;
  if length(p_descripcion) > 5000 or length(coalesce(p_cliente,'')) > 300
     or length(coalesce(p_contacto,'')) > 300 or length(coalesce(p_equipo_modelo,'')) > 300 then
    raise exception 'Contenido demasiado largo';
  end if;

  -- Anti-spam: rate-limit por IP (5 / 10 min) y global (40 / min).
  if p_ip is not null and btrim(p_ip) <> '' then
    select count(*) into v_cnt_ip from tms_postventa_publico_log
      where ip = p_ip and creado_en > now() - interval '10 minutes';
    if v_cnt_ip >= 5 then
      raise exception 'Has enviado demasiadas solicitudes desde esta conexión. Intenta más tarde.';
    end if;
  end if;
  select count(*) into v_cnt_glob from tms_postventa_publico_log
    where creado_en > now() - interval '1 minute';
  if v_cnt_glob >= 40 then
    raise exception 'El servicio está recibiendo muchas solicitudes en este momento. Intenta en unos minutos.';
  end if;

  v_anio := extract(year from (now() at time zone 'America/Santiago'));
  v_pref := 'TKT-' || v_anio || '-';
  perform pg_advisory_xact_lock(hashtext('pv_ticket_' || v_pref));
  for i in 1..40 loop
    select coalesce(max((split_part(numero,'-',3))::int),0) into v_n
      from tms_postventa_tickets where numero like v_pref || '%';
    v_numero := v_pref || pv_folio_num(v_n + 1);
    begin
      insert into tms_postventa_tickets (numero, folio_tipo, cliente, region, comuna, contacto, equipo_modelo,
        numero_serie, tipo_solicitud, prioridad, tecnico_asignado, estado, descripcion, cotizar, observaciones,
        origen, creado_por_nombre)
      values (v_numero,
        pv_siguiente_folio_tipo(coalesce(nullif(btrim(coalesce(p_tipo_solicitud,'')),''),'Otro')),
        btrim(p_cliente), coalesce(nullif(btrim(coalesce(p_region,'')),''),'Por Definir'),
        nullif(btrim(coalesce(p_comuna,'')),''), btrim(p_contacto), btrim(p_equipo_modelo),
        nullif(btrim(coalesce(p_numero_serie,'')),''),
        coalesce(nullif(btrim(coalesce(p_tipo_solicitud,'')),''),'Otro'),
        coalesce(nullif(btrim(coalesce(p_prioridad,'')),''),'Media'),
        'Sin Asignar', 'Abierto', btrim(p_descripcion), 'No',
        'Solicitud recibida desde el formulario web público.', 'Web', 'Formulario Web')
      returning * into r;
      insert into tms_postventa_publico_log (ip, numero) values (nullif(btrim(coalesce(p_ip,'')),''), v_numero);
      return v_numero;
    exception when unique_violation then
      continue;
    end;
  end loop;
  raise exception 'No se pudo generar un número de ticket único';
end $function$;

revoke all on function public.crear_pv_ticket_publico(text,text,text,text,text,text,text,text,text,text) from public;
revoke all on function public.crear_pv_ticket_publico(text,text,text,text,text,text,text,text,text,text) from anon;
revoke all on function public.crear_pv_ticket_publico(text,text,text,text,text,text,text,text,text,text) from authenticated;
grant execute on function public.crear_pv_ticket_publico(text,text,text,text,text,text,text,text,text,text) to service_role;
