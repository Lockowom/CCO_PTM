-- 079_pv_publico_parametros.sql
-- Post-Venta: el formulario PÚBLICO (/soporte) pasa a tener los MISMOS parámetros
-- que el ticket interno (comuna, cotizar, fecha/hora de visita, observaciones),
-- salvo los internos (técnico, N.V., estado). El estado inicial es SIEMPRE
-- 'Abierto' (flujo de entrada). Se recrea crear_pv_ticket_publico con 4 params
-- opcionales nuevos AL FINAL; se dropea la firma anterior primero.

drop function if exists public.crear_pv_ticket_publico(text,text,text,text,text,text,text,text,text,text);

create or replace function public.crear_pv_ticket_publico(
  p_cliente text, p_contacto text, p_equipo_modelo text, p_descripcion text,
  p_tipo_solicitud text default 'Otro'::text, p_prioridad text default 'Media'::text,
  p_region text default 'Por Definir'::text, p_comuna text default null::text,
  p_numero_serie text default null::text, p_ip text default null::text,
  p_observaciones text default null::text, p_cotizar text default 'No'::text,
  p_fecha_programada date default null::date, p_hora_programada text default null::text)
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
  if coalesce(btrim(p_cliente),'')='' or coalesce(btrim(p_contacto),'')=''
     or coalesce(btrim(p_equipo_modelo),'')='' or coalesce(btrim(p_descripcion),'')='' then
    raise exception 'Faltan campos obligatorios (empresa/cliente, contacto, equipo/modelo, descripción)';
  end if;
  if length(p_descripcion) > 5000 or length(coalesce(p_cliente,'')) > 300
     or length(coalesce(p_contacto,'')) > 300 or length(coalesce(p_equipo_modelo,'')) > 300
     or length(coalesce(p_observaciones,'')) > 5000 then
    raise exception 'Contenido demasiado largo';
  end if;

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
        origen, fecha_programada, hora_programada, creado_por_nombre)
      values (v_numero,
        pv_siguiente_folio_tipo(coalesce(nullif(btrim(coalesce(p_tipo_solicitud,'')),''),'Otro')),
        btrim(p_cliente), coalesce(nullif(btrim(coalesce(p_region,'')),''),'Por Definir'),
        nullif(btrim(coalesce(p_comuna,'')),''), btrim(p_contacto), btrim(p_equipo_modelo),
        nullif(btrim(coalesce(p_numero_serie,'')),''),
        coalesce(nullif(btrim(coalesce(p_tipo_solicitud,'')),''),'Otro'),
        coalesce(nullif(btrim(coalesce(p_prioridad,'')),''),'Media'),
        'Sin Asignar', 'Abierto', btrim(p_descripcion),
        coalesce(nullif(btrim(coalesce(p_cotizar,'')),''),'No'),
        -- La observación del solicitante se antepone a la nota de origen.
        trim(both E'\n' from concat_ws(E'\n\n',
          nullif(btrim(coalesce(p_observaciones,'')),''),
          'Solicitud recibida desde el formulario web público.')),
        'Web', p_fecha_programada, nullif(btrim(coalesce(p_hora_programada,'')),''), 'Formulario Web')
      returning * into r;
      insert into tms_postventa_publico_log (ip, numero) values (nullif(btrim(coalesce(p_ip,'')),''), v_numero);
      return v_numero;
    exception when unique_violation then
      continue;
    end;
  end loop;
  raise exception 'No se pudo generar un número de ticket único';
end $function$;

revoke all on function public.crear_pv_ticket_publico(text,text,text,text,text,text,text,text,text,text,text,text,date,text) from public;
revoke all on function public.crear_pv_ticket_publico(text,text,text,text,text,text,text,text,text,text,text,text,date,text) from anon;
revoke all on function public.crear_pv_ticket_publico(text,text,text,text,text,text,text,text,text,text,text,text,date,text) from authenticated;
grant execute on function public.crear_pv_ticket_publico(text,text,text,text,text,text,text,text,text,text,text,text,date,text) to service_role;
