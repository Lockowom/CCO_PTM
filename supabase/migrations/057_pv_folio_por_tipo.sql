-- 057_pv_folio_por_tipo.sql
-- Correlativo ÚNICO POR TIPO DE SOLICITUD en Post-Venta.
-- Cada ticket conserva su ID global inmutable (numero TKT-AAAA-NNN, clave de
-- seguimiento) y además recibe un folio por serie según su tipo de solicitud:
--   Instalación INS- · Capacitación CAP- · Mantención Preventiva MPR- ·
--   Mantención Correctiva MCO- · Falla Técnica FAL- · Visita Técnica VIS- ·
--   Puesta en Marcha PEM- · Gestión de Garantía GAR- · Venta Servicios VEN- ·
--   Diagnósticos DIA- · Otro OTR-
-- Si el tipo se reclasifica (p.ej. un correo entra como "Otro" y se corrige a
-- "Falla Técnica"), el ticket toma el siguiente correlativo de la serie nueva
-- (el numero TKT- no cambia). Backfill de los tickets existentes por tipo.

ALTER TABLE public.tms_postventa_tickets ADD COLUMN IF NOT EXISTS folio_tipo text;
CREATE UNIQUE INDEX IF NOT EXISTS idx_pv_tickets_folio_tipo
  ON public.tms_postventa_tickets(folio_tipo) WHERE folio_tipo IS NOT NULL;

-- Prefijo de la serie según el tipo de solicitud.
CREATE OR REPLACE FUNCTION public.pv_tipo_prefijo(t text)
 RETURNS text LANGUAGE sql IMMUTABLE SET search_path = public
AS $$
  SELECT CASE btrim(coalesce(t,''))
    WHEN 'Instalación'           THEN 'INS'
    WHEN 'Capacitación'          THEN 'CAP'
    WHEN 'Mantención Preventiva' THEN 'MPR'
    WHEN 'Mantención Correctiva' THEN 'MCO'
    WHEN 'Falla Técnica'         THEN 'FAL'
    WHEN 'Visita Técnica'        THEN 'VIS'
    WHEN 'Puesta en Marcha'      THEN 'PEM'
    WHEN 'Gestión de Garantía'   THEN 'GAR'
    WHEN 'Venta Servicios'       THEN 'VEN'
    WHEN 'Diagnósticos'          THEN 'DIA'
    ELSE 'OTR' END
$$;
REVOKE EXECUTE ON FUNCTION public.pv_tipo_prefijo(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.pv_tipo_prefijo(text) TO authenticated, service_role;

-- Siguiente folio de la serie del tipo (serializado por advisory lock).
CREATE OR REPLACE FUNCTION public.pv_siguiente_folio_tipo(p_tipo text)
 RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE v_base text; v_n int;
BEGIN
  v_base := pv_tipo_prefijo(p_tipo) || '-' ||
            extract(year FROM (now() AT TIME ZONE 'America/Santiago'))::int || '-';
  PERFORM pg_advisory_xact_lock(hashtext('pv_folio_tipo_' || v_base));
  SELECT coalesce(max((split_part(folio_tipo,'-',3))::int), 0) INTO v_n
    FROM tms_postventa_tickets
   WHERE folio_tipo LIKE v_base || '%' AND split_part(folio_tipo,'-',3) ~ '^[0-9]+$';
  RETURN v_base || pv_folio_num(v_n + 1);
END $$;
REVOKE EXECUTE ON FUNCTION public.pv_siguiente_folio_tipo(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.pv_siguiente_folio_tipo(text) TO authenticated, service_role;

-- Backfill de los tickets existentes: correlativo por tipo en orden de creación.
WITH ranked AS (
  SELECT id,
         pv_tipo_prefijo(tipo_solicitud) || '-' ||
           extract(year FROM coalesce(fecha_apertura, created_at::date))::int || '-' AS base,
         row_number() OVER (
           PARTITION BY pv_tipo_prefijo(tipo_solicitud),
                        extract(year FROM coalesce(fecha_apertura, created_at::date))
           ORDER BY created_at, numero) AS rn
  FROM public.tms_postventa_tickets WHERE folio_tipo IS NULL
)
UPDATE public.tms_postventa_tickets t
   SET folio_tipo = r.base || public.pv_folio_num(r.rn::int)
  FROM ranked r WHERE r.id = t.id;

-- Los creadores asignan el folio de la serie; actualizar reasigna al reclasificar.
-- (Se recrean con la MISMA lógica de la 056 + folio_tipo.)

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
      INSERT INTO tms_postventa_tickets (numero, folio_tipo, cliente, region, comuna, contacto, equipo_modelo, numero_serie,
        tipo_solicitud, prioridad, tecnico_asignado, estado, descripcion, cotizar, observaciones,
        origen, id_correo, fecha_programada, hora_programada, creado_por, creado_por_nombre)
      VALUES (v_numero, pv_siguiente_folio_tipo(btrim(p_tipo_solicitud)), btrim(p_cliente), btrim(p_region), nullif(btrim(coalesce(p_comuna,'')),''),
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
        INSERT INTO tms_postventa_tickets (numero, folio_tipo, cliente, region, contacto, equipo_modelo,
          tipo_solicitud, prioridad, tecnico_asignado, estado, descripcion, cotizar,
          origen, id_correo, conversation_id, creado_por, creado_por_nombre)
        VALUES (v_numero, pv_siguiente_folio_tipo('Otro'), v_cliente, 'Por Definir', nullif(btrim(coalesce(p_remitente_email,'')),''), 'Por Definir',
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
      INSERT INTO tms_postventa_tickets (numero, folio_tipo, cliente, region, equipo_modelo, numero_serie,
        tipo_solicitud, prioridad, tecnico_asignado, estado, descripcion, cotizar, observaciones,
        origen, accion_folio, informe_numero, creado_por, creado_por_nombre)
      VALUES (v_numero, pv_siguiente_folio_tipo(v_tipo), 'Interno — Calidad PTM', 'Por Definir',
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

-- actualizar_pv_ticket: si cambia el TIPO, el ticket toma el siguiente correlativo
-- de la serie nueva (el numero TKT- de seguimiento no cambia).
CREATE OR REPLACE FUNCTION public.actualizar_pv_ticket(p_numero text, p_campos jsonb)
 RETURNS public.tms_postventa_tickets LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE r public.tms_postventa_tickets; v_tipo_old text;
BEGIN
  PERFORM public._pv_assert(false);
  IF p_campos IS NULL OR jsonb_typeof(p_campos) <> 'object' THEN RAISE EXCEPTION 'campos inválidos'; END IF;

  SELECT tipo_solicitud INTO v_tipo_old FROM tms_postventa_tickets WHERE numero = p_numero;

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

  -- Reclasificación de tipo → correlativo de la serie nueva (o faltante → asignar).
  IF r.tipo_solicitud IS DISTINCT FROM v_tipo_old OR r.folio_tipo IS NULL THEN
    UPDATE tms_postventa_tickets SET folio_tipo = pv_siguiente_folio_tipo(r.tipo_solicitud)
     WHERE id = r.id
    RETURNING * INTO r;
  END IF;
  RETURN r;
END $$;
