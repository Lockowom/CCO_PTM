-- 055_calidad_acciones_integracion_modulos.sql
-- Las Acciones de Calidad (dictamen) se conectan con los módulos ejecutores:
--   * INVENTARIO: al generar el traspaso por correo (módulo Traspasos), el área
--     registra la referencia → la acción pasa a EN_PROCESO y queda trazado.
--   * SERVICIO TÉCNICO (Post-Venta): una acción REPARACION/POST_VENTA se convierte
--     en un ticket TKT- con el INFORME DE CALIDAD adjunto (numero + dictamen +
--     instrucción en la descripción; referencias en columnas) para revisar el caso
--     y hacerle seguimiento. El ticket queda enlazado en la acción y viceversa.
--   * TRAZABILIDAD: la línea de tiempo muestra ticket y referencia de traspaso.

-- 1. Enlaces
ALTER TABLE public.tms_calidad_acciones
  ADD COLUMN IF NOT EXISTS ticket_postventa text,   -- TKT-AAAA-NNN vinculado
  ADD COLUMN IF NOT EXISTS referencia text;         -- ref del traspaso/correo (Inventario)
ALTER TABLE public.tms_postventa_tickets
  ADD COLUMN IF NOT EXISTS accion_folio text,       -- ACC-AAAA-NNNN de origen
  ADD COLUMN IF NOT EXISTS informe_numero text;     -- Informe de Calidad adjunto

-- 2. Acción → Ticket de Servicio Técnico (con informe adjunto). Idempotente.
CREATE OR REPLACE FUNCTION public.accion_a_ticket_pv(p_accion_id uuid)
 RETURNS public.tms_postventa_tickets LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE
  v record; a record; r public.tms_postventa_tickets;
  v_informe text; v_tipo text; v_prio text; v_desc text;
  v_anio int; v_pref text; v_n int; v_numero text; i int;
BEGIN
  -- Gate: usuario activo con permiso de Calidad, de área o de Post-Venta (o admin).
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

  -- Idempotente: si ya tiene ticket, devolverlo.
  IF a.ticket_postventa IS NOT NULL THEN
    SELECT * INTO r FROM tms_postventa_tickets WHERE numero = a.ticket_postventa;
    IF r.id IS NOT NULL THEN RETURN r; END IF;
  END IF;

  -- Informe de Calidad asociado (vía ítem del dictamen).
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
    v_numero := v_pref || lpad((v_n+1)::text, 3, '0');
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

-- 3. Registrar referencia de ejecución (traspaso/correo generado por Inventario).
CREATE OR REPLACE FUNCTION public.accion_registrar_referencia(p_accion_id uuid, p_referencia text)
 RETURNS public.tms_calidad_acciones LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE v record; a public.tms_calidad_acciones; v_es_area boolean;
BEGIN
  SELECT u.auth_uid AS uid, u.nombre::text AS nombre, u.rol::text AS rol, u.es_admin_delegado,
         coalesce((SELECT permisos_json FROM tms_roles rr WHERE rr.id = u.rol), '[]'::jsonb) AS permisos
    INTO v
  FROM tms_usuarios u WHERE u.auth_uid = auth.uid() AND u.activo = true LIMIT 1;
  IF v.uid IS NULL THEN RAISE EXCEPTION 'Usuario no autenticado'; END IF;
  IF coalesce(btrim(p_referencia),'') = '' THEN RAISE EXCEPTION 'La referencia es obligatoria'; END IF;

  SELECT * INTO a FROM tms_calidad_acciones WHERE id = p_accion_id;
  IF a.id IS NULL THEN RAISE EXCEPTION 'Acción no encontrada'; END IF;

  -- Puede registrar: admin/delegado, Calidad, o un rol del área responsable.
  SELECT EXISTS (
    SELECT 1 FROM tms_areas_calidad ar
    WHERE ar.codigo = a.area_responsable AND ar.roles ? v.rol
  ) INTO v_es_area;
  IF NOT (v.rol = 'ADMIN' OR v.es_admin_delegado OR v.permisos ? 'manage_quality' OR v_es_area) THEN
    RAISE EXCEPTION 'Acceso denegado: solo el área responsable (o Calidad/admin)';
  END IF;

  UPDATE tms_calidad_acciones SET
    referencia = btrim(p_referencia),
    estado = CASE WHEN estado = 'PENDIENTE' THEN 'EN_PROCESO' ELSE estado END,
    updated_at = now()
  WHERE id = a.id
  RETURNING * INTO a;
  RETURN a;
END $$;

-- 4. Trazabilidad: el evento ACCION muestra ticket y referencia.
CREATE OR REPLACE FUNCTION public.trazabilidad_producto(p_codigo text, p_partida text DEFAULT NULL::text, p_ubicacion text DEFAULT NULL::text)
 RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE
  v_cod text := trim(coalesce(p_codigo, '')); v_flag jsonb; v_ev jsonb;
BEGIN
  IF v_cod = '' THEN RETURN jsonb_build_object('codigo', '', 'estado_actual', NULL, 'eventos', '[]'::jsonb); END IF;
  SELECT to_jsonb(f) INTO v_flag
  FROM (
    SELECT estado_calidad, severidad, nota, ubicacion, partida, updated_at
    FROM tms_calidad_flags
    WHERE codigo_producto = v_cod AND vigente = true
      AND (p_partida IS NULL OR coalesce(partida,'') = p_partida)
      AND (p_ubicacion IS NULL OR coalesce(ubicacion,'') = p_ubicacion)
    ORDER BY updated_at DESC LIMIT 1
  ) f;
  WITH eventos AS (
    SELECT coalesce(t.completado_en, t.created_at) AS fecha, 1 AS orden, 'RECEPCION' AS hito,
           'CheckList de ingreso' AS titulo, t.estado AS estado, t.folio AS folio,
           concat_ws(' · ', nullif(t.proveedor,''), nullif('OC '||coalesce(t.oc,''),'OC '), nullif(t.disposicion,'')) AS detalle
    FROM tms_recepcion_items ri
    JOIN tms_calidad_tareas t ON t.recepcion_id = ri.recepcion_id AND t.tipo = 'CHECKLIST_INGRESO'
    WHERE ri.reff = v_cod
    UNION ALL
    SELECT coalesce(t.completado_en, t.created_at), 1, 'RECEPCION', 'CheckList de ingreso', t.estado, t.folio,
           concat_ws(' · ', nullif(t.proveedor,''), nullif('OC '||coalesce(t.oc,''),'OC '))
    FROM tms_recepcion_items_nacionales ri
    JOIN tms_calidad_tareas t ON t.recepcion_id = ri.recepcion_id AND t.tipo = 'CHECKLIST_INGRESO'
    WHERE ri.reff = v_cod
    UNION ALL
    SELECT coalesce(mi.fecha_dictamen, mi.created_at), 2, 'ESTANCIA',
           CASE WHEN mi.dictamen IS NOT NULL THEN 'Dictamen: ' || mi.dictamen ELSE 'En revisión (Calidad)' END,
           coalesce(mi.dictamen, 'EN_REVISION'), inf.numero,
           concat_ws(' · ', nullif(mi.condicion_observada,''), nullif('Bodega '||coalesce(mi.bodega_destino,''),'Bodega '),
                     nullif(mi.calidad_nombre,''), nullif(mi.acuse_texto,''), nullif('Ubic. '||coalesce(mi.ubicacion,''),'Ubic. '))
    FROM tms_monitoreo_items mi
    LEFT JOIN tms_monitoreo_informes inf ON inf.id = mi.informe_id
    WHERE mi.codigo_producto = v_cod
      AND (p_partida IS NULL OR coalesce(mi.partida,'') = p_partida)
      AND (p_ubicacion IS NULL OR coalesce(mi.ubicacion,'') = p_ubicacion)
    UNION ALL
    SELECT a.created_at, 3, 'ACCION', 'Acción: ' || a.tipo_accion, a.estado, a.folio,
           concat_ws(' · ', nullif(a.area_responsable,''), nullif('BD '||coalesce(a.bodega_destino,''),'BD '),
                     nullif(a.descripcion,''),
                     nullif('Ticket ST '||coalesce(a.ticket_postventa,''),'Ticket ST '),
                     nullif('Ref. traspaso/correo: '||coalesce(a.referencia,''),'Ref. traspaso/correo: '),
                     CASE WHEN a.estado='RESUELTA' THEN 'Resuelta: '||coalesce(a.resolucion,'') END)
    FROM tms_calidad_acciones a WHERE a.codigo_producto = v_cod
    UNION ALL
    SELECT coalesce(t.completado_en, t.created_at), 4, 'SALIDA', 'Certificación de salida', t.estado, t.folio,
           concat_ws(' · ', nullif('Cliente '||coalesce(t.proveedor,''),'Cliente '), nullif('NV '||coalesce(t.oc,''),'NV '))
    FROM tms_calidad_tareas t
    WHERE t.tipo = 'CERTIFICADO_SALIDA'
      AND EXISTS (SELECT 1 FROM jsonb_array_elements(coalesce(t.contexto->'skus','[]'::jsonb)) e WHERE e->>'codigo_producto' = v_cod)
  )
  SELECT jsonb_agg(jsonb_build_object(
           'fecha', fecha, 'hito', hito, 'titulo', titulo, 'estado', estado, 'folio', folio, 'detalle', nullif(detalle,'')
         ) ORDER BY fecha DESC NULLS LAST, orden DESC)
  INTO v_ev FROM (SELECT * FROM eventos ORDER BY fecha DESC NULLS LAST LIMIT 100) e;
  RETURN jsonb_build_object('codigo', v_cod, 'estado_actual', v_flag, 'eventos', coalesce(v_ev, '[]'::jsonb));
END;
$function$;

-- 5. Grants
DO $$
DECLARE fn text;
BEGIN
  FOREACH fn IN ARRAY ARRAY['accion_a_ticket_pv(uuid)','accion_registrar_referencia(uuid,text)'] LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION public.%s FROM PUBLIC, anon', fn);
    EXECUTE format('GRANT EXECUTE ON FUNCTION public.%s TO authenticated, service_role', fn);
  END LOOP;
END $$;
