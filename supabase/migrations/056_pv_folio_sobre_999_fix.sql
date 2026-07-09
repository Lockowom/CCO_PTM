-- 056_pv_folio_sobre_999_fix.sql
-- FIX CRÍTICO del folio de Post-Venta sobre el Nº 999.
-- Bug: lpad((n+1)::text, 3, '0') TRUNCA cuando n+1 tiene 4+ dígitos
-- (lpad('1000',3,'0') = '100'), por lo que con 999 tickets creados TODO nuevo
-- ticket (manual, por correo o desde Calidad) chocaba con el 100 existente y
-- agotaba los reintentos: "No se pudo generar un número de ticket único".
-- Detectado al verificar accion_a_ticket_pv con la BD ya cargada (999 casos).
--
-- Fix: helper pv_folio_num(n) → 3 dígitos con ceros hasta 999 y el número
-- completo desde 1000 (TKT-2026-999 → TKT-2026-1000). Se recrean las 4
-- funciones que generaban folio: crear_pv_ticket, ingesta_pv_correo,
-- accion_a_ticket_pv y siguiente_pv_numero.

CREATE OR REPLACE FUNCTION public.pv_folio_num(n integer)
 RETURNS text LANGUAGE sql IMMUTABLE SET search_path = public
AS $$ SELECT CASE WHEN n <= 999 THEN lpad(n::text, 3, '0') ELSE n::text END $$;
REVOKE EXECUTE ON FUNCTION public.pv_folio_num(integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.pv_folio_num(integer) TO authenticated, service_role;

-- siguiente_pv_numero (vista previa del folio)
CREATE OR REPLACE FUNCTION public.siguiente_pv_numero()
 RETURNS text LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE v_anio int := extract(year FROM (now() AT TIME ZONE 'America/Santiago')); v_pref text; v_n int;
BEGIN
  v_pref := 'TKT-' || v_anio || '-';
  SELECT coalesce(max((split_part(numero,'-',3))::int), 0) INTO v_n
    FROM tms_postventa_tickets WHERE numero LIKE v_pref || '%';
  RETURN v_pref || pv_folio_num(v_n + 1);
END $$;

-- crear_pv_ticket: misma firma que la 048; solo cambia el armado del folio (+40 reintentos).
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
  FOR i IN 1..40 LOOP
    SELECT coalesce(max((split_part(numero,'-',3))::int),0) INTO v_n FROM tms_postventa_tickets WHERE numero LIKE v_pref || '%';
    v_numero := v_pref || pv_folio_num(v_n + 1);
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

-- ingesta_pv_correo: misma lógica de la 051; folio seguro.
CREATE OR REPLACE FUNCTION public.ingesta_pv_correo(
  p_id_correo text, p_conversation_id text DEFAULT NULL, p_recibido text DEFAULT NULL,
  p_remitente_nombre text DEFAULT '', p_remitente_email text DEFAULT '',
  p_para text DEFAULT '', p_cc text DEFAULT '', p_asunto text DEFAULT '',
  p_cuerpo text DEFAULT '', p_adjuntos text DEFAULT ''
) RETURNS public.tms_postventa_tickets LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE v record; r public.tms_postventa_tickets; v_conv text; v_recibido timestamptz;
  v_cliente text; v_anio int; v_pref text; v_n int; v_numero text; i int;
BEGIN
  SELECT * INTO v FROM public._pv_assert(false);
  IF coalesce(btrim(p_id_correo),'')='' THEN RAISE EXCEPTION 'id_correo requerido'; END IF;
  IF EXISTS (SELECT 1 FROM tms_postventa_descartados d WHERE d.id_correo = p_id_correo) THEN RETURN NULL; END IF;
  SELECT t.* INTO r FROM tms_postventa_correos c JOIN tms_postventa_tickets t ON t.id = c.ticket_id WHERE c.id_correo = p_id_correo LIMIT 1;
  IF r.id IS NOT NULL THEN RETURN r; END IF;
  v_conv := coalesce(nullif(btrim(p_conversation_id),''), p_id_correo);
  BEGIN v_recibido := (nullif(btrim(coalesce(p_recibido,'')),''))::timestamptz; EXCEPTION WHEN others THEN v_recibido := now(); END;
  IF v_recibido IS NULL THEN v_recibido := now(); END IF;
  v_cliente := coalesce(nullif(btrim(p_remitente_nombre),''), nullif(btrim(p_remitente_email),''), 'Correo sin remitente');
  SELECT * INTO r FROM tms_postventa_tickets WHERE conversation_id = v_conv ORDER BY created_at LIMIT 1;
  IF r.id IS NULL THEN
    SELECT * INTO r FROM tms_postventa_tickets WHERE id_correo = p_id_correo LIMIT 1;
    IF r.id IS NOT NULL AND coalesce(r.conversation_id,'') = '' THEN UPDATE tms_postventa_tickets SET conversation_id = v_conv WHERE id = r.id; END IF;
  END IF;
  IF r.id IS NULL THEN
    v_anio := extract(year FROM (now() AT TIME ZONE 'America/Santiago'));
    v_pref := 'TKT-' || v_anio || '-';
    PERFORM pg_advisory_xact_lock(hashtext('pv_ticket_' || v_pref));
    FOR i IN 1..40 LOOP
      SELECT coalesce(max((split_part(numero,'-',3))::int),0) INTO v_n FROM tms_postventa_tickets WHERE numero LIKE v_pref || '%';
      v_numero := v_pref || pv_folio_num(v_n + 1);
      BEGIN
        INSERT INTO tms_postventa_tickets (numero, cliente, region, contacto, equipo_modelo,
          tipo_solicitud, prioridad, tecnico_asignado, estado, descripcion, cotizar,
          origen, id_correo, conversation_id, creado_por, creado_por_nombre)
        VALUES (v_numero, v_cliente, 'Por Definir', nullif(btrim(coalesce(p_remitente_email,'')),''), 'Por Definir',
          'Otro', 'Media', 'Sin Asignar', 'Abierto', coalesce(nullif(btrim(p_asunto),''),'(sin asunto)'), 'No',
          'Correo', p_id_correo, v_conv, v.uid, v.nombre)
        RETURNING * INTO r;
        EXIT;
      EXCEPTION WHEN unique_violation THEN CONTINUE; END;
    END LOOP;
    IF r.id IS NULL THEN RAISE EXCEPTION 'No se pudo generar un número de ticket único'; END IF;
  END IF;
  INSERT INTO tms_postventa_correos (id_correo, conversation_id, ticket_id, remitente_nombre, remitente_email,
    para, cc, asunto, cuerpo, adjuntos, recibido)
  VALUES (p_id_correo, v_conv, r.id, nullif(btrim(p_remitente_nombre),''), nullif(btrim(p_remitente_email),''),
    nullif(btrim(p_para),''), nullif(btrim(p_cc),''), nullif(btrim(p_asunto),''), p_cuerpo, nullif(btrim(p_adjuntos),''), v_recibido)
  ON CONFLICT (id_correo) DO NOTHING;
  UPDATE tms_postventa_tickets SET updated_at = now() WHERE id = r.id;
  RETURN r;
END $$;

-- accion_a_ticket_pv: folio seguro (misma lógica de la 055).
CREATE OR REPLACE FUNCTION public.accion_a_ticket_pv(p_accion_id uuid)
 RETURNS public.tms_postventa_tickets LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE
  v record; a record; r public.tms_postventa_tickets;
  v_informe text; v_tipo text; v_prio text; v_desc text;
  v_anio int; v_pref text; v_n int; v_numero text; i int;
BEGIN
  SELECT u.auth_uid AS uid, u.nombre::text AS nombre, u.rol::text AS rol, u.es_admin_delegado,
         coalesce((SELECT permisos_json FROM tms_roles rr WHERE rr.id = u.rol), '[]'::jsonb) AS permisos
    INTO v
  FROM tms_usuarios u WHERE u.auth_uid = auth.uid() AND u.activo = true LIMIT 1;
  IF v.uid IS NULL THEN RAISE EXCEPTION 'Usuario no autenticado'; END IF;
  IF NOT (v.rol = 'ADMIN' OR v.es_admin_delegado
          OR v.permisos ? 'manage_quality' OR v.permisos ? 'view_acciones_calidad'
          OR v.permisos ? 'manage_postventa' OR v.permisos ? 'supervise_postventa') THEN
    RAISE EXCEPTION 'Acceso denegado: se requiere permiso de Calidad o Post-Venta';
  END IF;

  SELECT * INTO a FROM tms_calidad_acciones WHERE id = p_accion_id;
  IF a.id IS NULL THEN RAISE EXCEPTION 'Acción no encontrada'; END IF;
  IF a.estado = 'ANULADA' THEN RAISE EXCEPTION 'La acción está anulada'; END IF;

  IF a.ticket_postventa IS NOT NULL THEN
    SELECT * INTO r FROM tms_postventa_tickets WHERE numero = a.ticket_postventa;
    IF r.id IS NOT NULL THEN RETURN r; END IF;
  END IF;

  SELECT inf.numero INTO v_informe
  FROM tms_monitoreo_items mi JOIN tms_monitoreo_informes inf ON inf.id = mi.informe_id
  WHERE mi.id = a.item_id;

  v_tipo := CASE a.tipo_accion WHEN 'REPARACION' THEN 'Mantención Correctiva'
                               WHEN 'POST_VENTA' THEN 'Gestión de Garantía'
                               ELSE 'Otro' END;
  v_prio := CASE WHEN a.prioridad = 'URGENTE' THEN 'Alta' ELSE 'Media' END;
  v_desc := concat_ws(E'\n',
    'Acción de Calidad ' || coalesce(a.folio,'') || ' (' || a.tipo_accion || ')' ||
      coalesce(' · Dictamen: ' || a.dictamen, ''),
    'SKU: ' || coalesce(a.codigo_producto,'—') || coalesce(' — ' || a.producto, ''),
    nullif(concat_ws(' · ', nullif('Partida ' || coalesce(a.partida,''), 'Partida '),
                     nullif('Ubicación ' || coalesce(a.ubicacion,''), 'Ubicación '),
                     nullif(a.cantidad::text || ' unid.', ' unid.')), ''),
    nullif('Instrucción de Calidad: ' || coalesce(a.descripcion,''), 'Instrucción de Calidad: '),
    CASE WHEN v_informe IS NOT NULL
         THEN 'Informe de Calidad adjunto: ' || v_informe || ' (ver Calidad → Monitoreo)' END);

  v_anio := extract(year FROM (now() AT TIME ZONE 'America/Santiago'));
  v_pref := 'TKT-' || v_anio || '-';
  PERFORM pg_advisory_xact_lock(hashtext('pv_ticket_' || v_pref));
  FOR i IN 1..40 LOOP
    SELECT coalesce(max((split_part(numero,'-',3))::int),0) INTO v_n FROM tms_postventa_tickets WHERE numero LIKE v_pref || '%';
    v_numero := v_pref || pv_folio_num(v_n + 1);
    BEGIN
      INSERT INTO tms_postventa_tickets (numero, cliente, region, equipo_modelo, numero_serie,
        tipo_solicitud, prioridad, tecnico_asignado, estado, descripcion, cotizar, observaciones,
        origen, accion_folio, informe_numero, creado_por, creado_por_nombre)
      VALUES (v_numero, 'Interno — Calidad PTM', 'Por Definir',
        coalesce(nullif(left(upper(btrim(a.codigo_producto)),3),''),'Por Definir'),
        nullif(btrim(coalesce(a.partida,'')),''),
        v_tipo, v_prio, 'Sin Asignar', 'Abierto', v_desc, 'No',
        'Generado desde Acción de Calidad ' || coalesce(a.folio,''),
        'Calidad', a.folio, v_informe, v.uid, v.nombre)
      RETURNING * INTO r;
      EXIT;
    EXCEPTION WHEN unique_violation THEN CONTINUE; END;
  END LOOP;
  IF r.id IS NULL THEN RAISE EXCEPTION 'No se pudo generar un número de ticket único'; END IF;

  UPDATE tms_calidad_acciones SET
    ticket_postventa = r.numero,
    estado = CASE WHEN estado = 'PENDIENTE' THEN 'EN_PROCESO' ELSE estado END,
    updated_at = now()
  WHERE id = a.id;
  RETURN r;
END $$;
