-- 060_accion_correo_enviado.sql
-- Carpeta "CALIDAD TRAZABILIDAD" en Inventario → Traspasos: ahí caen las
-- solicitudes de Calidad para bodega (AJUSTE/BAJA/TRANSITORIO/REACONDICIONAR).
-- Cuando Inventario marca "Correo enviado" (el correo de traspaso ya salió),
-- esta RPC ACTUALIZA la tarea de Calidad automáticamente SEGÚN EL DICTAMEN:
-- estado → RESUELTA con acuse "Correo de traspaso enviado · Dictamen X → BD Y",
-- guarda la referencia y el resuelto_por — y queda en la trazabilidad.
CREATE OR REPLACE FUNCTION public.accion_correo_enviado(p_accion_id uuid, p_referencia text DEFAULT NULL)
 RETURNS public.tms_calidad_acciones LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE v record; a public.tms_calidad_acciones; v_es_area boolean;
BEGIN
  SELECT u.auth_uid AS uid, u.nombre::text AS nombre, u.rol::text AS rol, u.es_admin_delegado,
         coalesce((SELECT permisos_json FROM tms_roles rr WHERE rr.id = u.rol), '[]'::jsonb) AS permisos
    INTO v
  FROM tms_usuarios u WHERE u.auth_uid = auth.uid() AND u.activo = true LIMIT 1;
  IF v.uid IS NULL THEN RAISE EXCEPTION 'Usuario no autenticado'; END IF;

  SELECT * INTO a FROM tms_calidad_acciones WHERE id = p_accion_id;
  IF a.id IS NULL THEN RAISE EXCEPTION 'Acción no encontrada'; END IF;
  IF a.estado NOT IN ('PENDIENTE','EN_PROCESO') THEN
    RAISE EXCEPTION 'La acción ya está % (no se puede marcar el correo)', a.estado;
  END IF;

  -- Puede marcar: admin/delegado, Calidad, quien gestiona inventario, o rol del área responsable.
  SELECT EXISTS (
    SELECT 1 FROM tms_areas_calidad ar WHERE ar.codigo = a.area_responsable AND ar.roles ? v.rol
  ) INTO v_es_area;
  IF NOT (v.rol = 'ADMIN' OR v.es_admin_delegado OR v.permisos ? 'manage_quality'
          OR v.permisos ? 'manage_inventory' OR v_es_area) THEN
    RAISE EXCEPTION 'Acceso denegado: solo Inventario/área responsable (o Calidad/admin)';
  END IF;

  UPDATE tms_calidad_acciones SET
    referencia       = coalesce(nullif(btrim(coalesce(p_referencia,'')),''), referencia,
                                'Correo de traspaso enviado (módulo Traspasos)'),
    estado           = 'RESUELTA',
    resuelto_por     = v.uid,
    resuelto_nombre  = v.nombre,
    resuelto_en      = now(),
    resolucion       = concat_ws(' · ',
                         'Correo de traspaso enviado',
                         nullif('Dictamen ' || coalesce(a.dictamen,''), 'Dictamen '),
                         nullif('Acción ' || coalesce(a.tipo_accion,''), 'Acción '),
                         nullif('→ BD ' || coalesce(a.bodega_destino,''), '→ BD ')),
    updated_at       = now()
  WHERE id = a.id
  RETURNING * INTO a;
  RETURN a;
END $$;
REVOKE EXECUTE ON FUNCTION public.accion_correo_enviado(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.accion_correo_enviado(uuid, text) TO authenticated, service_role;
