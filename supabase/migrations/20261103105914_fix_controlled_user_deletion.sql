-- Corrige la baja controlada de perfiles. Conserva los registros operativos,
-- anonimiza referencias históricas y no concede acceso adicional a la función.
CREATE OR REPLACE FUNCTION public.eliminar_usuario_completo(p_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  v_auth uuid;
  v_actor uuid := auth.uid();
  v_target public.tms_usuarios%ROWTYPE;
  v_other_admins integer;
BEGIN
  IF v_actor IS NULL OR NOT public.is_admin() THEN
    RAISE EXCEPTION 'Solo administradores pueden eliminar usuarios' USING ERRCODE = '42501';
  END IF;

  SELECT *
    INTO v_target
    FROM public.tms_usuarios
   WHERE id = p_id
   FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Usuario no encontrado' USING ERRCODE = 'P0002';
  END IF;

  IF v_target.auth_uid = v_actor THEN
    RAISE EXCEPTION 'No puedes eliminar tu propia cuenta' USING ERRCODE = '22023';
  END IF;

  IF v_target.activo AND (v_target.rol = 'ADMIN' OR v_target.es_admin_delegado) THEN
    SELECT count(*)
      INTO v_other_admins
      FROM public.tms_usuarios
     WHERE id <> p_id
       AND activo
       AND (rol = 'ADMIN' OR es_admin_delegado);

    IF v_other_admins = 0 THEN
      RAISE EXCEPTION 'No se puede eliminar el último administrador activo' USING ERRCODE = '22023';
    END IF;
  END IF;

  v_auth := v_target.auth_uid;

  -- Registros históricos: se conserva el hecho operativo, sin identidad del perfil eliminado.
  UPDATE public.tms_mediciones_tiempos
     SET usuario_id = NULL,
         usuario_nombre = '(usuario eliminado)'
   WHERE usuario_id = p_id;

  UPDATE public.tms_errores_picking
     SET usuario_picking_id = NULL,
         usuario_picking_nombre = '(usuario eliminado)'
   WHERE usuario_picking_id = p_id;

  UPDATE public.tms_errores_picking
     SET usuario_packing_id = NULL,
         usuario_packing_nombre = '(usuario eliminado)'
   WHERE usuario_packing_id = p_id;

  -- Estas dos columnas son text, no UUID. Es el origen del error reportado.
  UPDATE public.tms_tickets
     SET usuario_id = '(usuario eliminado)',
         usuario_nombre = '(usuario eliminado)'
   WHERE usuario_id = p_id::text;

  DELETE FROM public.tms_usuarios_activos
   WHERE usuario_id = p_id::text;

  -- Las suscripciones no sobreviven a la cuenta; la autoría se conserva sin identidad.
  DELETE FROM public.notificacion_regla_destinatario
   WHERE destinatario_id = p_id;

  UPDATE public.notificacion_regla_destinatario
     SET created_by = NULL
   WHERE created_by = p_id;

  -- Las solicitudes y datos operativos se mantienen, pero dejan de referenciar el perfil.
  UPDATE public.tms_nv_reaperturas
     SET solicitada_por = NULL
   WHERE solicitada_por = p_id;

  UPDATE public.tms_nv_reaperturas
     SET resuelta_por = NULL
   WHERE resuelta_por = p_id;

  UPDATE public.tms_operaciones
     SET incidencia_reportada_por = NULL
   WHERE incidencia_reportada_por = p_id;

  UPDATE public.tms_operaciones
     SET reapertura_aprobada_por = NULL
   WHERE reapertura_aprobada_por = p_id;

  UPDATE public.wms_ubicacion_solicitudes
     SET solicitante_id = NULL
   WHERE solicitante_id = p_id;

  UPDATE public.wms_ubicacion_solicitudes
     SET resuelto_por_id = NULL
   WHERE resuelto_por_id = p_id;

  UPDATE public.wms_ubicaciones
     SET creado_por = NULL,
         actualizado_por = NULL
   WHERE creado_por = p_id
      OR actualizado_por = p_id;

  UPDATE public.wms_ubicaciones_historial
     SET actor_id = NULL
   WHERE actor_id = p_id;

  DELETE FROM public.tms_accesos
   WHERE usuario_id = p_id;

  DELETE FROM public.tms_usuarios
   WHERE id = p_id;

  DELETE FROM public.tms_auditoria
   WHERE tabla = 'tms_usuarios'
     AND registro_id = p_id::text;

  INSERT INTO public.tms_auditoria(
    actor_auth_uid,
    actor_rol,
    tabla,
    accion,
    registro_id,
    datos_antes,
    datos_despues
  )
  VALUES (v_actor, 'ADMIN', 'tms_usuarios', 'SUPRESION_COMPLETA', p_id::text, NULL, NULL);

  IF v_auth IS NOT NULL THEN
    DELETE FROM auth.users
     WHERE id = v_auth;
  END IF;
END;
$function$;

REVOKE ALL ON FUNCTION public.eliminar_usuario_completo(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.eliminar_usuario_completo(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.eliminar_usuario_completo(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.eliminar_usuario_completo(uuid) TO service_role;
