-- 036_tarea_salida_manual.sql
-- Hito 3 (Salida): permitir crear la certificación de salida MANUALMENTE —
-- escribiendo la N.V. (y datos opcionales) y eligiendo los SKUs— sin depender de
-- que el despacho exista en tms_control_despacho. Los SKUs quedan en contexto.skus
-- para verlos en el formulario y en el certificado.
CREATE OR REPLACE FUNCTION public.crear_tarea_salida_manual(
  p_nv            text,
  p_skus          jsonb DEFAULT '[]'::jsonb,
  p_cliente       text DEFAULT NULL,
  p_guia          text DEFAULT NULL,
  p_factura       text DEFAULT NULL,
  p_transportista text DEFAULT NULL,
  p_bultos        integer DEFAULT NULL
)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user record;
  v_id   uuid;
  v_nv   text := nullif(trim(coalesce(p_nv,'')), '');
  v_ctx  jsonb;
BEGIN
  PERFORM public._monitoreo_assert_permiso();
  IF v_nv IS NULL THEN RAISE EXCEPTION 'La N.V. es obligatoria'; END IF;
  SELECT id, nombre INTO v_user FROM tms_usuarios WHERE auth_uid = auth.uid() AND activo = true;

  v_ctx := jsonb_build_object(
    'cliente', nullif(trim(coalesce(p_cliente,'')),''),
    'nv', v_nv,
    'guia', nullif(trim(coalesce(p_guia,'')),''),
    'factura', nullif(trim(coalesce(p_factura,'')),''),
    'transportista', nullif(trim(coalesce(p_transportista,'')),''),
    'manual', true,
    'skus', coalesce(p_skus, '[]'::jsonb)
  );

  INSERT INTO tms_calidad_tareas
    (tipo, origen, proveedor, oc, fecha_recepcion, bultos, despacho_id, contexto, estado)
  VALUES
    ('CERTIFICADO_SALIDA', 'SALIDA', nullif(trim(coalesce(p_cliente,'')),''), v_nv,
     current_date, p_bultos, NULL, v_ctx, 'PENDIENTE')
  RETURNING id INTO v_id;

  INSERT INTO tms_notificaciones (tipo, titulo, mensaje, destinatario_rol, payload, origen)
  VALUES (
    'CERTIFICADO_SALIDA_PENDIENTE', 'Certificación de salida pendiente',
    format('Certificación de salida creada (NV %s%s) — %s SKU(s).',
           v_nv,
           CASE WHEN nullif(trim(coalesce(p_cliente,'')),'') IS NOT NULL THEN ', ' || p_cliente ELSE '' END,
           coalesce(jsonb_array_length(p_skus), 0)),
    NULL, jsonb_build_object('tarea_id', v_id, 'nv', v_nv, 'manual', true), 'calidad_salida');

  RETURN jsonb_build_object('id', v_id, 'estado', 'PENDIENTE');
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.crear_tarea_salida_manual(text, jsonb, text, text, text, text, integer) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.crear_tarea_salida_manual(text, jsonb, text, text, text, text, integer) TO authenticated, service_role;
