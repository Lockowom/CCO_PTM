-- 034_calidad_certificado_salida.sql
-- Hito 3 del proceso de Calidad — "Salida" (Certificado de Conformidad de salida
-- previo al despacho). Reutiliza la tabla tms_calidad_tareas (folio + firma HMAC +
-- descarga PDF/Word ya construidos), con tipo 'CERTIFICADO_SALIDA' anclado a un
-- despacho (tms_control_despacho). Disparo MANUAL: Calidad elige el despacho a
-- certificar (la tabla de despachos es un histórico masivo; un trigger inundaría).

-- Permitir tareas de salida sin recepción + contexto del despacho.
ALTER TABLE public.tms_calidad_tareas ALTER COLUMN recepcion_id DROP NOT NULL;
ALTER TABLE public.tms_calidad_tareas ADD COLUMN IF NOT EXISTS despacho_id uuid;
ALTER TABLE public.tms_calidad_tareas ADD COLUMN IF NOT EXISTS contexto jsonb NOT NULL DEFAULT '{}'::jsonb;
CREATE INDEX IF NOT EXISTS idx_calidad_tareas_tipo ON public.tms_calidad_tareas (tipo, estado, created_at DESC);

-- ── Folio tipo-aware: SALIDA usa CERT-SAL- / ACTA-SAL- (ingreso sigue CERT-/ACTA-)
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
  v_prefix text;
  v_year   text := to_char(current_date, 'YYYY');
  v_max    int;
  v_tarea  tms_calidad_tareas;
  v_salida boolean;
BEGIN
  PERFORM public._monitoreo_assert_permiso();
  SELECT id, nombre INTO v_user FROM tms_usuarios WHERE auth_uid = auth.uid() AND activo = true;

  SELECT * INTO v_tarea FROM tms_calidad_tareas WHERE id = p_tarea_id;
  IF v_tarea.id IS NULL THEN RAISE EXCEPTION 'Tarea % no encontrada', p_tarea_id; END IF;
  IF v_tarea.estado IN ('CONFORME','NO_CONFORME') THEN
    RAISE EXCEPTION 'La tarea ya fue finalizada (%).', v_tarea.estado;
  END IF;
  v_salida := (v_tarea.tipo = 'CERTIFICADO_SALIDA');

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

  -- Prefijo de folio según hito y resultado.
  IF v_estado = 'CONFORME' THEN
    v_prefix := CASE WHEN v_salida THEN 'CERT-SAL-' ELSE 'CERT-' END;
  ELSE
    v_prefix := CASE WHEN v_salida THEN 'ACTA-SAL-' ELSE 'ACTA-' END;
  END IF;

  PERFORM pg_advisory_xact_lock(hashtext('calidad_folio_' || v_prefix));
  SELECT coalesce(max((regexp_replace(folio, '^' || v_prefix || '\d{4}-', ''))::int), 0) INTO v_max
    FROM tms_calidad_tareas WHERE folio LIKE v_prefix || v_year || '-%';
  v_folio := v_prefix || v_year || '-' || lpad((v_max + 1)::text, 4, '0');

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
      CASE WHEN v_salida THEN 'SALIDA_NO_CONFORME' ELSE 'CHECKLIST_NO_CONFORME' END,
      CASE WHEN v_salida THEN 'URGENTE: Salida NO CONFORME (no despachar)' ELSE 'URGENTE: Recepción NO CONFORME' END,
      CASE WHEN v_salida
        THEN format('El despacho %s de %s resultó NO CONFORME (folio %s). Disposición: %s. No despachar hasta resolver.',
             coalesce(v_tarea.oc,'—'), coalesce(v_tarea.proveedor,'s/cliente'), v_folio, coalesce(p_disposicion,'—'))
        ELSE format('La recepción %s de %s resultó NO CONFORME (folio %s). Disposición: %s. Genere el Informe de Daños / Solicitud NC al proveedor.',
             coalesce(v_tarea.oc,'—'), coalesce(v_tarea.proveedor,'s/proveedor'), v_folio, coalesce(p_disposicion,'—'))
      END,
      NULL,
      jsonb_build_object('tarea_id', p_tarea_id, 'tipo', v_tarea.tipo, 'urgente', true, 'disposicion', p_disposicion,
                         'recepcion_id', v_tarea.recepcion_id, 'despacho_id', v_tarea.despacho_id, 'origen', v_tarea.origen),
      CASE WHEN v_salida THEN 'calidad_salida' ELSE 'calidad_checklist' END
    );
  END IF;

  RETURN jsonb_build_object('id', p_tarea_id, 'estado', v_estado, 'folio', v_folio);
END;
$function$;

-- ── Crear tarea de Certificación de Salida a partir de un despacho ───────────
CREATE OR REPLACE FUNCTION public.crear_tarea_salida(p_despacho_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user record;
  v_d    tms_control_despacho;
  v_id   uuid;
  v_ctx  jsonb;
BEGIN
  PERFORM public._monitoreo_assert_permiso();   -- certificar salida es potestad de Calidad
  SELECT * INTO v_d FROM tms_control_despacho WHERE id = p_despacho_id;
  IF v_d.id IS NULL THEN RAISE EXCEPTION 'Despacho % no encontrado', p_despacho_id; END IF;

  -- Evitar duplicar una certificación en curso para el mismo despacho.
  SELECT id INTO v_id FROM tms_calidad_tareas
   WHERE tipo = 'CERTIFICADO_SALIDA' AND despacho_id = p_despacho_id
     AND estado IN ('PENDIENTE','EN_PROCESO') LIMIT 1;
  IF v_id IS NOT NULL THEN
    RETURN jsonb_build_object('id', v_id, 'estado', 'PENDIENTE', 'reused', true);
  END IF;

  SELECT id, nombre INTO v_user FROM tms_usuarios WHERE auth_uid = auth.uid() AND activo = true;
  v_ctx := jsonb_build_object(
    'cliente', v_d.cliente, 'nv', v_d.nv, 'guia', v_d.guia, 'factura', v_d.facturas,
    'transportista', v_d.transportista, 'empresa_transporte', v_d.empresa_transporte,
    'numero_envio', v_d.numero_envio, 'fecha_despacho', v_d.fecha_despacho
  );

  INSERT INTO tms_calidad_tareas
    (tipo, origen, proveedor, oc, fecha_recepcion, bultos, despacho_id, contexto, estado)
  VALUES
    ('CERTIFICADO_SALIDA', 'SALIDA', v_d.cliente, v_d.nv, v_d.fecha_despacho, v_d.bultos, p_despacho_id, v_ctx, 'PENDIENTE')
  RETURNING id INTO v_id;

  INSERT INTO tms_notificaciones (tipo, titulo, mensaje, destinatario_rol, payload, origen)
  VALUES (
    'CERTIFICADO_SALIDA_PENDIENTE',
    'Certificación de salida pendiente',
    format('El despacho %s de %s requiere Certificado de Conformidad de salida antes de despachar.',
           coalesce(v_d.nv,'—'), coalesce(v_d.cliente,'s/cliente')),
    NULL,
    jsonb_build_object('tarea_id', v_id, 'despacho_id', p_despacho_id, 'nv', v_d.nv),
    'calidad_salida'
  );

  RETURN jsonb_build_object('id', v_id, 'estado', 'PENDIENTE');
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.crear_tarea_salida(uuid) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.crear_tarea_salida(uuid) TO authenticated, service_role;
