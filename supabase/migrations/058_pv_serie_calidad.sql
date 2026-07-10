-- 058_pv_serie_calidad.sql
-- Serie ESPECIAL para los casos derivados de Calidad en Post-Venta: CAL-AAAA-NNN.
--   * Generaliza el generador de series: pv_siguiente_folio_serie(prefijo).
--   * accion_a_ticket_pv asigna folio de la serie CAL- (no de la serie del tipo).
--   * actualizar_pv_ticket NO re-asigna el folio de un caso CAL- al reclasificar
--     el tipo (el correlativo de Calidad se conserva; el TKT- tampoco cambia).
--   * Backfill de tickets origen='Calidad' existentes a la serie CAL-.

-- Generador genérico por serie (prefijo + año, advisory lock por serie).
CREATE OR REPLACE FUNCTION public.pv_siguiente_folio_serie(p_prefijo text)
 RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE v_base text; v_n int;
BEGIN
  IF coalesce(btrim(p_prefijo),'') = '' THEN RAISE EXCEPTION 'prefijo requerido'; END IF;
  v_base := upper(btrim(p_prefijo)) || '-' ||
            extract(year FROM (now() AT TIME ZONE 'America/Santiago'))::int || '-';
  PERFORM pg_advisory_xact_lock(hashtext('pv_folio_tipo_' || v_base));
  SELECT coalesce(max((split_part(folio_tipo,'-',3))::int), 0) INTO v_n
    FROM tms_postventa_tickets
   WHERE folio_tipo LIKE v_base || '%' AND split_part(folio_tipo,'-',3) ~ '^[0-9]+$';
  RETURN v_base || pv_folio_num(v_n + 1);
END $$;
REVOKE EXECUTE ON FUNCTION public.pv_siguiente_folio_serie(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.pv_siguiente_folio_serie(text) TO authenticated, service_role;

-- La versión por tipo delega en la genérica.
CREATE OR REPLACE FUNCTION public.pv_siguiente_folio_tipo(p_tipo text)
 RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
BEGIN
  RETURN pv_siguiente_folio_serie(pv_tipo_prefijo(p_tipo));
END $$;

-- Backfill: casos de Calidad existentes → serie CAL- (por orden de creación).
DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT id FROM tms_postventa_tickets WHERE origen = 'Calidad'
             AND coalesce(folio_tipo,'') NOT LIKE 'CAL-%' ORDER BY created_at, numero
  LOOP
    UPDATE tms_postventa_tickets SET folio_tipo = pv_siguiente_folio_serie('CAL') WHERE id = r.id;
  END LOOP;
END $$;

-- accion_a_ticket_pv: el ticket derivado de Calidad nace en la serie CAL-.
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
      VALUES (v_numero, pv_siguiente_folio_serie('CAL'), 'Interno — Calidad PTM', 'Por Definir',
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

-- actualizar_pv_ticket: los casos CAL- CONSERVAN su correlativo de Calidad al
-- reclasificar el tipo; el resto re-serializa como en la 057.
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

  IF coalesce(r.folio_tipo,'') NOT LIKE 'CAL-%'
     AND (r.tipo_solicitud IS DISTINCT FROM v_tipo_old OR r.folio_tipo IS NULL) THEN
    UPDATE tms_postventa_tickets
       SET folio_tipo = CASE WHEN r.origen = 'Calidad' THEN pv_siguiente_folio_serie('CAL')
                             ELSE pv_siguiente_folio_tipo(r.tipo_solicitud) END
     WHERE id = r.id
    RETURNING * INTO r;
  END IF;
  RETURN r;
END $$;
