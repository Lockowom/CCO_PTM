-- 037_admin_eliminar_tareas_calidad.sql
-- Permitir al ADMIN eliminar tareas de Calidad de los 3 hitos (limpieza de
-- pruebas): CheckList de ingreso (hito 1) y Certificado de salida (hito 3) viven
-- en tms_calidad_tareas; las asignaciones de instancia (hito 2) en
-- tms_calidad_asignaciones. Borrado SOLO por RPC gateada a ADMIN / admin delegado.

CREATE OR REPLACE FUNCTION public._calidad_assert_admin()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_user record;
BEGIN
  SELECT rol, es_admin_delegado INTO v_user
  FROM tms_usuarios WHERE auth_uid = auth.uid() AND activo = true;
  IF v_user IS NULL THEN RAISE EXCEPTION 'Usuario no autenticado'; END IF;
  IF NOT (v_user.rol = 'ADMIN' OR v_user.es_admin_delegado) THEN
    RAISE EXCEPTION 'Acceso denegado: solo un administrador puede eliminar tareas de Calidad';
  END IF;
END;
$function$;

-- Elimina una tarea de calidad (checklist de ingreso o certificado de salida).
CREATE OR REPLACE FUNCTION public.eliminar_tarea_calidad(p_tarea_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_t tms_calidad_tareas;
BEGIN
  PERFORM public._calidad_assert_admin();
  SELECT * INTO v_t FROM tms_calidad_tareas WHERE id = p_tarea_id;
  IF v_t.id IS NULL THEN RAISE EXCEPTION 'Tarea % no encontrada', p_tarea_id; END IF;
  DELETE FROM tms_calidad_tareas WHERE id = p_tarea_id;
  RETURN jsonb_build_object('id', p_tarea_id, 'deleted', true, 'tipo', v_t.tipo);
END;
$function$;

-- Elimina una asignación de instancia (hito 2).
CREATE OR REPLACE FUNCTION public.eliminar_asignacion_calidad(p_asignacion_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_a tms_calidad_asignaciones;
BEGIN
  PERFORM public._calidad_assert_admin();
  SELECT * INTO v_a FROM tms_calidad_asignaciones WHERE id = p_asignacion_id;
  IF v_a.id IS NULL THEN RAISE EXCEPTION 'Asignación % no encontrada', p_asignacion_id; END IF;
  DELETE FROM tms_calidad_asignaciones WHERE id = p_asignacion_id;
  RETURN jsonb_build_object('id', p_asignacion_id, 'deleted', true);
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.eliminar_tarea_calidad(uuid)      FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.eliminar_asignacion_calidad(uuid) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.eliminar_tarea_calidad(uuid)      TO authenticated, service_role;
GRANT  EXECUTE ON FUNCTION public.eliminar_asignacion_calidad(uuid) TO authenticated, service_role;
