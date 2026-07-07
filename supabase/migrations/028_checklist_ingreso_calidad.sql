-- 028_checklist_ingreso_calidad.sql
-- Hito "Ingreso a bodega" de la matriz de Calidad: cada vez que se registra una
-- recepción (Importaciones o Nacionales) se crea automáticamente una TAREA de
-- CheckList para Calidad. Calidad la completa (revisión documental PL + inspección
-- física de embalajes); si todo OK → CONFORME + folio de certificación; si algo
-- falla → NO_CONFORME + notificación URGENTE para generar el Informe de Daños.
-- (La lectura automática del packing list queda fuera de alcance: la validación de
--  cantidad es una verificación manual dentro del checklist.)

-- ── Tabla de tareas de calidad (cola de checklists de ingreso) ──────────────
CREATE TABLE IF NOT EXISTS public.tms_calidad_tareas (
  id              uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo            text NOT NULL DEFAULT 'CHECKLIST_INGRESO',
  recepcion_id    uuid NOT NULL,
  origen          text NOT NULL,                    -- IMPORTACION | NACIONAL
  proveedor       text,
  oc              text,
  fecha_recepcion date,
  bultos          integer,
  estado          text NOT NULL DEFAULT 'PENDIENTE',-- PENDIENTE|EN_PROCESO|CONFORME|NO_CONFORME
  checklist       jsonb NOT NULL DEFAULT '{}'::jsonb,
  resultado       text,                             -- CONFORME | NO_CONFORME
  observaciones   text,
  folio           text,                             -- certificado de conformidad (al quedar CONFORME)
  realizado_por   uuid,
  realizado_nombre text,
  completado_en   timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (recepcion_id, origen)
);

CREATE INDEX IF NOT EXISTS idx_calidad_tareas_estado  ON public.tms_calidad_tareas (estado, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_calidad_tareas_recep   ON public.tms_calidad_tareas (recepcion_id);

ALTER TABLE public.tms_calidad_tareas ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.tms_calidad_tareas TO authenticated;
DROP POLICY IF EXISTS calidad_tareas_select_auth ON public.tms_calidad_tareas;
CREATE POLICY calidad_tareas_select_auth ON public.tms_calidad_tareas
  FOR SELECT USING (auth.role() = 'authenticated');
-- La escritura va SIEMPRE por RPC SECURITY DEFINER (trigger + completar), no por policy.

-- ── Trigger: al INSERT en una recepción, crear la tarea de checklist ─────────
CREATE OR REPLACE FUNCTION public.crear_tarea_checklist_ingreso()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_origen text := CASE WHEN TG_TABLE_NAME = 'tms_recepciones_nacionales' THEN 'NACIONAL' ELSE 'IMPORTACION' END;
BEGIN
  INSERT INTO tms_calidad_tareas (recepcion_id, origen, proveedor, oc, fecha_recepcion, bultos, estado)
  VALUES (NEW.id, v_origen, NEW.proveedor, NEW.oc, NEW.fecha_recepcion, NEW.cant_bultos, 'PENDIENTE')
  ON CONFLICT (recepcion_id, origen) DO NOTHING;

  INSERT INTO tms_notificaciones (tipo, titulo, mensaje, destinatario_rol, payload, origen)
  VALUES (
    'CHECKLIST_INGRESO_PENDIENTE',
    'Nueva recepción: CheckList de ingreso pendiente',
    format('Recepción %s de %s requiere CheckList de Calidad (revisión documental + inspección de embalajes).',
           coalesce(NEW.oc, '—'), coalesce(NEW.proveedor, 's/proveedor')),
    NULL,
    jsonb_build_object('recepcion_id', NEW.id, 'origen', v_origen, 'proveedor', NEW.proveedor, 'oc', NEW.oc),
    'recepcion_ingreso'
  );

  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_checklist_ingreso_imp ON public.tms_recepciones;
CREATE TRIGGER trg_checklist_ingreso_imp
  AFTER INSERT ON public.tms_recepciones
  FOR EACH ROW EXECUTE FUNCTION public.crear_tarea_checklist_ingreso();

DROP TRIGGER IF EXISTS trg_checklist_ingreso_nac ON public.tms_recepciones_nacionales;
CREATE TRIGGER trg_checklist_ingreso_nac
  AFTER INSERT ON public.tms_recepciones_nacionales
  FOR EACH ROW EXECUTE FUNCTION public.crear_tarea_checklist_ingreso();

-- ── RPC: guardar / finalizar el checklist ───────────────────────────────────
CREATE OR REPLACE FUNCTION public.guardar_checklist_ingreso(
  p_tarea_id      uuid,
  p_checklist     jsonb,
  p_observaciones text DEFAULT NULL,
  p_finalizar     boolean DEFAULT false,
  p_resultado     text DEFAULT NULL     -- 'CONFORME' | 'NO_CONFORME' (requerido si p_finalizar)
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
  -- Permiso: Monitoreo/Calidad o admin (reusa el gate de Monitoreo).
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
          estado = 'EN_PROCESO', updated_at = now()
      WHERE id = p_tarea_id;
    RETURN jsonb_build_object('id', p_tarea_id, 'estado', 'EN_PROCESO');
  END IF;

  IF p_resultado NOT IN ('CONFORME','NO_CONFORME') THEN
    RAISE EXCEPTION 'Resultado inválido: %', coalesce(p_resultado,'null');
  END IF;
  v_estado := p_resultado;

  -- Folio de certificación al quedar CONFORME (bajo lock, sin carrera).
  IF v_estado = 'CONFORME' THEN
    PERFORM pg_advisory_xact_lock(hashtext('calidad_cert_folio'));
    SELECT coalesce(max((regexp_replace(folio, '^CERT-\d{4}-', ''))::int), 0) INTO v_max
    FROM tms_calidad_tareas WHERE folio LIKE 'CERT-' || v_year || '-%';
    v_folio := 'CERT-' || v_year || '-' || lpad((v_max + 1)::text, 4, '0');
  END IF;

  UPDATE tms_calidad_tareas
    SET checklist = coalesce(p_checklist, checklist),
        observaciones = coalesce(p_observaciones, observaciones),
        estado = v_estado, resultado = v_estado, folio = v_folio,
        realizado_por = v_user.id, realizado_nombre = v_user.nombre,
        completado_en = now(), updated_at = now()
    WHERE id = p_tarea_id;

  -- No conforme → tarea URGENTE para generar Informe de Daños / NC proveedor.
  IF v_estado = 'NO_CONFORME' THEN
    INSERT INTO tms_notificaciones (tipo, titulo, mensaje, destinatario_rol, payload, origen)
    VALUES (
      'CHECKLIST_NO_CONFORME',
      '⚠️ URGENTE: Recepción NO CONFORME',
      format('La recepción %s de %s resultó NO CONFORME en el CheckList de ingreso. Genere el Informe de Daños / Solicitud NC al proveedor.',
             coalesce(v_tarea.oc,'—'), coalesce(v_tarea.proveedor,'s/proveedor')),
      NULL,
      jsonb_build_object('recepcion_id', v_tarea.recepcion_id, 'origen', v_tarea.origen,
                         'tarea_id', p_tarea_id, 'urgente', true),
      'calidad_checklist'
    );
  END IF;

  RETURN jsonb_build_object('id', p_tarea_id, 'estado', v_estado, 'folio', v_folio);
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.crear_tarea_checklist_ingreso() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.guardar_checklist_ingreso(uuid, jsonb, text, boolean, text) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.guardar_checklist_ingreso(uuid, jsonb, text, boolean, text) TO authenticated, service_role;
