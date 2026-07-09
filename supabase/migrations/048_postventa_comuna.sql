-- 048_postventa_comuna.sql
-- Post-Venta: selector Región → Comuna. Se agrega la columna `comuna` al ticket
-- y se maneja en crear_pv_ticket (nuevo param opcional al final) y actualizar_pv_ticket.

ALTER TABLE public.tms_postventa_tickets ADD COLUMN IF NOT EXISTS comuna text;

DROP FUNCTION IF EXISTS public.crear_pv_ticket(text,text,text,text,text,text,text,text,text,text,text,text,text,text,date,text);

CREATE OR REPLACE FUNCTION public.crear_pv_ticket(
  p_cliente text, p_region text, p_equipo_modelo text, p_tipo_solicitud text,
  p_prioridad text, p_descripcion text,
  p_contacto text DEFAULT '', p_numero_serie text DEFAULT '', p_tecnico text DEFAULT 'Sin Asignar',
  p_estado text DEFAULT 'Abierto', p_cotizar text DEFAULT 'No', p_observaciones text DEFAULT '',
  p_origen text DEFAULT 'Manual', p_id_correo text DEFAULT NULL,
  p_fecha_programada date DEFAULT NULL, p_hora_programada text DEFAULT NULL,
  p_comuna text DEFAULT NULL
) RETURNS public.tms_postventa_tickets LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
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
  FOR i IN 1..6 LOOP
    SELECT coalesce(max((split_part(numero,'-',3))::int),0) INTO v_n FROM tms_postventa_tickets WHERE numero LIKE v_pref || '%';
    v_numero := v_pref || lpad((v_n+1)::text, 3, '0');
    BEGIN
      INSERT INTO tms_postventa_tickets (numero, cliente, region, comuna, contacto, equipo_modelo, numero_serie,
        tipo_solicitud, prioridad, tecnico_asignado, estado, descripcion, cotizar, observaciones,
        origen, id_correo, fecha_programada, hora_programada, creado_por, creado_por_nombre)
      VALUES (v_numero, btrim(p_cliente), btrim(p_region), nullif(btrim(coalesce(p_comuna,'')),''),
        nullif(btrim(coalesce(p_contacto,'')),''), btrim(p_equipo_modelo),
        nullif(btrim(coalesce(p_numero_serie,'')),''), btrim(p_tipo_solicitud), btrim(p_prioridad),
        coalesce(nullif(btrim(coalesce(p_tecnico,'')),''),'Sin Asignar'), coalesce(nullif(btrim(coalesce(p_estado,'')),''),'Abierto'),
        btrim(p_descripcion), coalesce(nullif(btrim(coalesce(p_cotizar,'')),''),'No'), nullif(btrim(coalesce(p_observaciones,'')),''),
        coalesce(nullif(btrim(coalesce(p_origen,'')),''),'Manual'), p_id_correo,
        p_fecha_programada, nullif(btrim(coalesce(p_hora_programada,'')),''), v.uid, v.nombre)
      RETURNING * INTO r;
      RETURN r;
    EXCEPTION WHEN unique_violation THEN
      CONTINUE;
    END;
  END LOOP;
  RAISE EXCEPTION 'No se pudo generar un número de ticket único';
END $$;

REVOKE EXECUTE ON FUNCTION public.crear_pv_ticket(text,text,text,text,text,text,text,text,text,text,text,text,text,text,date,text,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.crear_pv_ticket(text,text,text,text,text,text,text,text,text,text,text,text,text,text,date,text,text) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.actualizar_pv_ticket(p_numero text, p_campos jsonb)
 RETURNS public.tms_postventa_tickets LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE r public.tms_postventa_tickets;
BEGIN
  PERFORM public._pv_assert(false);
  IF p_campos IS NULL OR jsonb_typeof(p_campos) <> 'object' THEN RAISE EXCEPTION 'campos inválidos'; END IF;

  UPDATE tms_postventa_tickets t SET
    cliente          = coalesce(p_campos->>'cliente', cliente),
    region           = coalesce(p_campos->>'region', region),
    comuna           = CASE WHEN p_campos ? 'comuna' THEN nullif(p_campos->>'comuna','') ELSE comuna END,
    contacto         = coalesce(p_campos->>'contacto', contacto),
    equipo_modelo    = coalesce(p_campos->>'equipo_modelo', equipo_modelo),
    numero_serie     = coalesce(p_campos->>'numero_serie', numero_serie),
    tipo_solicitud   = coalesce(p_campos->>'tipo_solicitud', tipo_solicitud),
    prioridad        = coalesce(p_campos->>'prioridad', prioridad),
    tecnico_asignado = coalesce(p_campos->>'tecnico_asignado', tecnico_asignado),
    estado           = coalesce(p_campos->>'estado', estado),
    descripcion      = coalesce(p_campos->>'descripcion', descripcion),
    cotizar          = coalesce(p_campos->>'cotizar', cotizar),
    resultado        = coalesce(p_campos->>'resultado', resultado),
    observaciones    = coalesce(p_campos->>'observaciones', observaciones),
    hora_programada  = CASE WHEN p_campos ? 'hora_programada' THEN nullif(p_campos->>'hora_programada','') ELSE hora_programada END,
    fecha_programada = CASE WHEN p_campos ? 'fecha_programada' THEN nullif(p_campos->>'fecha_programada','')::date ELSE fecha_programada END,
    fecha_cierre     = CASE WHEN p_campos ? 'fecha_cierre'
                            THEN nullif(p_campos->>'fecha_cierre','')::date
                            WHEN coalesce(p_campos->>'estado','') = 'Cerrado' AND t.fecha_cierre IS NULL
                            THEN (now() AT TIME ZONE 'America/Santiago')::date
                            ELSE fecha_cierre END,
    updated_at       = now()
  WHERE t.numero = p_numero
  RETURNING * INTO r;
  IF r.id IS NULL THEN RAISE EXCEPTION 'Ticket no encontrado'; END IF;
  RETURN r;
END $$;
