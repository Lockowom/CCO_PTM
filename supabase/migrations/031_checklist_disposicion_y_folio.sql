-- 031_checklist_disposicion_y_folio.sql
-- Correcciones de correctitud del acta (feedback de auditoría):
--  * Folio también para NO CONFORME (antes solo CONFORME → sin trazabilidad):
--    CONFORME → CERT-AAAA-NNNN ; NO CONFORME → ACTA-AAAA-NNNN.
--  * Nueva "Disposición / Acción a tomar" (rechazar/devolver, cuarentena, etc.),
--    obligatoria de facto cuando el resultado es NO CONFORME.

ALTER TABLE public.tms_calidad_tareas
  ADD COLUMN IF NOT EXISTS disposicion text;

-- Se agrega el parámetro p_disposicion → cambia la firma: DROP + CREATE.
DROP FUNCTION IF EXISTS public.guardar_checklist_ingreso(uuid, jsonb, text, boolean, text);

CREATE OR REPLACE FUNCTION public.guardar_checklist_ingreso(
  p_tarea_id      uuid,
  p_checklist     jsonb,
  p_observaciones text DEFAULT NULL,
  p_finalizar     boolean DEFAULT false,
  p_resultado     text DEFAULT NULL,
  p_disposicion   text DEFAULT NULL
)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user   record;
  v_estado text;
  v_folio  text;
  v_year   text := to_char(current_date, 'YYYY');
  v_max    int;
  v_tarea  tms_calidad_tareas;
BEGIN
  PERFORM public._monitoreo_assert_permiso();
  SELECT id, nombre INTO v_user FROM tms_usuarios WHERE auth_uid = auth.uid() AND activo = true;

  SELECT * INTO v_tarea FROM tms_calidad_tareas WHERE id = p_tarea_id;
  IF v_tarea.id IS NULL THEN RAISE EXCEPTION 'Tarea % no encontrada', p_tarea_id; END IF;
  IF v_tarea.estado IN ('CONFORME','NO_CONFORME') THEN
    RAISE EXCEPTION 'La tarea ya fue finalizada (%).', v_tarea.estado;
  END IF;

  IF NOT p_finalizar THEN
    UPDATE tms_calidad_tareas
      SET checklist = coalesce(p_checklist, checklist),
          observaciones = coalesce(p_observaciones, observaciones),
          disposicion = coalesce(p_disposicion, disposicion),
          estado = 'EN_PROCESO', updated_at = now()
      WHERE id = p_tarea_id;
    RETURN jsonb_build_object('id', p_tarea_id, 'estado', 'EN_PROCESO');
  END IF;

  IF p_resultado NOT IN ('CONFORME','NO_CONFORME') THEN
    RAISE EXCEPTION 'Resultado inválido: %', coalesce(p_resultado,'null');
  END IF;
  v_estado := p_resultado;

  -- Folio para AMBOS resultados (trazabilidad), bajo lock, sin carrera.
  IF v_estado = 'CONFORME' THEN
    PERFORM pg_advisory_xact_lock(hashtext('calidad_cert_folio'));
    SELECT coalesce(max((regexp_replace(folio, '^CERT-\d{4}-', ''))::int), 0) INTO v_max
    FROM tms_calidad_tareas WHERE folio LIKE 'CERT-' || v_year || '-%';
    v_folio := 'CERT-' || v_year || '-' || lpad((v_max + 1)::text, 4, '0');
  ELSE
    PERFORM pg_advisory_xact_lock(hashtext('calidad_acta_folio'));
    SELECT coalesce(max((regexp_replace(folio, '^ACTA-\d{4}-', ''))::int), 0) INTO v_max
    FROM tms_calidad_tareas WHERE folio LIKE 'ACTA-' || v_year || '-%';
    v_folio := 'ACTA-' || v_year || '-' || lpad((v_max + 1)::text, 4, '0');
  END IF;

  UPDATE tms_calidad_tareas
    SET checklist = coalesce(p_checklist, checklist),
        observaciones = coalesce(p_observaciones, observaciones),
        disposicion = coalesce(p_disposicion, disposicion),
        estado = v_estado, resultado = v_estado, folio = v_folio,
        realizado_por = v_user.id, realizado_nombre = v_user.nombre,
        completado_en = now(), updated_at = now()
    WHERE id = p_tarea_id;

  IF v_estado = 'NO_CONFORME' THEN
    INSERT INTO tms_notificaciones (tipo, titulo, mensaje, destinatario_rol, payload, origen)
    VALUES (
      'CHECKLIST_NO_CONFORME',
      'URGENTE: Recepción NO CONFORME',
      format('La recepción %s de %s resultó NO CONFORME (folio %s). Disposición: %s. Genere el Informe de Daños / Solicitud NC al proveedor.',
             coalesce(v_tarea.oc,'—'), coalesce(v_tarea.proveedor,'s/proveedor'), v_folio, coalesce(p_disposicion,'—')),
      NULL,
      jsonb_build_object('recepcion_id', v_tarea.recepcion_id, 'origen', v_tarea.origen,
                         'tarea_id', p_tarea_id, 'urgente', true, 'disposicion', p_disposicion),
      'calidad_checklist'
    );
  END IF;

  RETURN jsonb_build_object('id', p_tarea_id, 'estado', v_estado, 'folio', v_folio);
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.guardar_checklist_ingreso(uuid, jsonb, text, boolean, text, text) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.guardar_checklist_ingreso(uuid, jsonb, text, boolean, text, text) TO authenticated, service_role;
