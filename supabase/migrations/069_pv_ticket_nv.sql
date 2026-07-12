-- 069_pv_ticket_nv.sql
-- Post-Venta: asociar (opcionalmente) un ticket a una Nota de Venta del Panel PTM.
-- Guarda N.V., vendedor y una foto de la trazabilidad del proceso (estado, factura,
-- guía, transportista, fechas…) tal como sale en el Info del Panel. Todo opcional:
-- si el ticket no nace de una N.V., estos campos quedan nulos.

alter table public.tms_postventa_tickets
  add column if not exists nv       text,
  add column if not exists vendedor text,
  add column if not exists nv_info  jsonb;

-- Recrear crear_pv_ticket con 3 params nuevos AL FINAL (opcionales). Se DROPEA
-- primero para no crear un overload ambiguo con la firma anterior.
drop function if exists public.crear_pv_ticket(text,text,text,text,text,text,text,text,text,text,text,text,text,text,date,text,text);

create or replace function public.crear_pv_ticket(
  p_cliente text, p_region text, p_equipo_modelo text, p_tipo_solicitud text, p_prioridad text, p_descripcion text,
  p_contacto text default ''::text, p_numero_serie text default ''::text, p_tecnico text default 'Sin Asignar'::text,
  p_estado text default 'Abierto'::text, p_cotizar text default 'No'::text, p_observaciones text default ''::text,
  p_origen text default 'Manual'::text, p_id_correo text default null::text, p_fecha_programada date default null::date,
  p_hora_programada text default null::text, p_comuna text default null::text,
  p_nv text default null::text, p_vendedor text default null::text, p_nv_info jsonb default null::jsonb)
 returns tms_postventa_tickets
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
DECLARE v record; r public.tms_postventa_tickets; v_anio int; v_pref text; v_n int; v_numero text; i int;
BEGIN
  SELECT * INTO v FROM public._pv_assert(false);

  IF p_id_correo IS NOT NULL AND btrim(p_id_correo) <> '' THEN
    SELECT * INTO r FROM tms_postventa_tickets WHERE id_correo = p_id_correo LIMIT 1;
    IF r.id IS NOT NULL THEN RETURN r; END IF;
  END IF;

  IF coalesce(btrim(p_cliente),'')='' OR coalesce(btrim(p_region),'')='' OR coalesce(btrim(p_equipo_modelo),'')=''
     OR coalesce(btrim(p_tipo_solicitud),'')='' OR coalesce(btrim(p_prioridad),'')='' OR coalesce(btrim(p_descripcion),'')='' THEN
    RAISE EXCEPTION 'Faltan campos obligatorios (cliente, región, equipo, tipo, prioridad, descripción)';
  END IF;

  v_anio := extract(year FROM (now() AT TIME ZONE 'America/Santiago'));
  v_pref := 'TKT-' || v_anio || '-';
  PERFORM pg_advisory_xact_lock(hashtext('pv_ticket_' || v_pref));
  FOR i IN 1..40 LOOP
    SELECT coalesce(max((split_part(numero,'-',3))::int),0) INTO v_n FROM tms_postventa_tickets WHERE numero LIKE v_pref || '%';
    v_numero := v_pref || pv_folio_num(v_n + 1);
    BEGIN
      INSERT INTO tms_postventa_tickets (numero, folio_tipo, cliente, region, comuna, contacto, equipo_modelo, numero_serie,
        tipo_solicitud, prioridad, tecnico_asignado, estado, descripcion, cotizar, observaciones,
        origen, id_correo, fecha_programada, hora_programada, nv, vendedor, nv_info, creado_por, creado_por_nombre)
      VALUES (v_numero, pv_siguiente_folio_tipo(btrim(p_tipo_solicitud)), btrim(p_cliente), btrim(p_region), nullif(btrim(coalesce(p_comuna,'')),''),
        nullif(btrim(coalesce(p_contacto,'')),''), btrim(p_equipo_modelo),
        nullif(btrim(coalesce(p_numero_serie,'')),''), btrim(p_tipo_solicitud), btrim(p_prioridad),
        coalesce(nullif(btrim(coalesce(p_tecnico,'')),''),'Sin Asignar'), coalesce(nullif(btrim(coalesce(p_estado,'')),''),'Abierto'),
        btrim(p_descripcion), coalesce(nullif(btrim(coalesce(p_cotizar,'')),''),'No'), nullif(btrim(coalesce(p_observaciones,'')),''),
        coalesce(nullif(btrim(coalesce(p_origen,'')),''),'Manual'), p_id_correo,
        p_fecha_programada, nullif(btrim(coalesce(p_hora_programada,'')),''),
        nullif(btrim(coalesce(p_nv,'')),''), nullif(btrim(coalesce(p_vendedor,'')),''), p_nv_info,
        v.uid, v.nombre)
      RETURNING * INTO r;
      RETURN r;
    EXCEPTION WHEN unique_violation THEN
      CONTINUE;
    END;
  END LOOP;
  RAISE EXCEPTION 'No se pudo generar un número de ticket único';
END $function$;
