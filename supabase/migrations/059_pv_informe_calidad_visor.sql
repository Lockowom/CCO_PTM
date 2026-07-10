-- 059_pv_informe_calidad_visor.sql
-- El informe de Calidad "cae" junto con el ticket: RPC pv_informe_calidad(numero)
-- devuelve el informe completo (cabecera + ítem dictaminado + evidencias + acción)
-- para que SERVICIO TÉCNICO lo lea dentro del ticket, sin permisos de Calidad y
-- sin salir del módulo Post-Venta.
CREATE OR REPLACE FUNCTION public.pv_informe_calidad(p_numero text)
 RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE
  v record; t record; a record; v_item jsonb; v_informe jsonb; v_evid jsonb;
BEGIN
  -- Gate: usuario activo con acceso a Post-Venta o Calidad (o admin).
  SELECT u.auth_uid AS uid, u.rol::text AS rol, u.es_admin_delegado,
         coalesce((SELECT permisos_json FROM tms_roles rr WHERE rr.id = u.rol), '[]'::jsonb) AS permisos
    INTO v
  FROM tms_usuarios u WHERE u.auth_uid = auth.uid() AND u.activo = true LIMIT 1;
  IF v.uid IS NULL THEN RAISE EXCEPTION 'Usuario no autenticado'; END IF;
  IF NOT (v.rol = 'ADMIN' OR v.es_admin_delegado
          OR v.permisos ? 'view_postventa' OR v.permisos ? 'manage_postventa' OR v.permisos ? 'supervise_postventa'
          OR v.permisos ? 'manage_quality' OR v.permisos ? 'manage_monitoreo' OR v.permisos ? 'view_acciones_calidad') THEN
    RAISE EXCEPTION 'Acceso denegado';
  END IF;

  SELECT * INTO t FROM tms_postventa_tickets WHERE numero = p_numero;
  IF t.id IS NULL THEN RAISE EXCEPTION 'Ticket no encontrado'; END IF;
  IF t.accion_folio IS NULL AND t.informe_numero IS NULL THEN
    RETURN NULL; -- el ticket no viene de Calidad
  END IF;

  SELECT * INTO a FROM tms_calidad_acciones WHERE folio = t.accion_folio LIMIT 1;

  -- Ítem dictaminado (por la acción) o, si no hay enlace, por SKU dentro del informe.
  SELECT to_jsonb(x) INTO v_item FROM (
    SELECT mi.id, mi.codigo_producto, mi.producto, mi.partida, mi.ubicacion, mi.cantidad,
           mi.unidad_medida, mi.condicion_observada, mi.motivo, mi.observaciones,
           mi.dictamen, mi.accion, mi.bodega_destino, mi.fecha_dictamen, mi.calidad_nombre,
           mi.acuse_texto, mi.tipo_dano, mi.componente_afectado, mi.consecuencia,
           mi.cantidad_afectada, mi.semaforo, mi.fecha_vencimiento
    FROM tms_monitoreo_items mi
    LEFT JOIN tms_monitoreo_informes inf ON inf.id = mi.informe_id
    WHERE (a.item_id IS NOT NULL AND mi.id = a.item_id)
       OR (a.item_id IS NULL AND t.informe_numero IS NOT NULL AND inf.numero = t.informe_numero
           AND (a.codigo_producto IS NULL OR mi.codigo_producto = a.codigo_producto))
    ORDER BY (mi.id = a.item_id) DESC NULLS LAST, mi.created_at DESC
    LIMIT 1
  ) x;

  -- Cabecera del informe (por el ítem o por número).
  SELECT to_jsonb(y) INTO v_informe FROM (
    SELECT inf.numero, inf.fecha, inf.analista_nombre, inf.bodega, inf.periodicidad,
           inf.estado, inf.total_items, inf.observaciones, inf.tipo_informe
    FROM tms_monitoreo_informes inf
    WHERE inf.numero = coalesce(t.informe_numero,
            (SELECT i2.numero FROM tms_monitoreo_items mi2 JOIN tms_monitoreo_informes i2 ON i2.id = mi2.informe_id
              WHERE mi2.id = a.item_id))
    LIMIT 1
  ) y;

  -- Evidencias fotográficas del ítem (o del informe si no hay ítem).
  SELECT coalesce(jsonb_agg(jsonb_build_object(
           'imagen_url', e.imagen_url, 'descripcion', e.descripcion, 'orden', e.orden) ORDER BY e.orden), '[]'::jsonb)
    INTO v_evid
  FROM tms_monitoreo_evidencias e
  WHERE (a.item_id IS NOT NULL AND e.item_id = a.item_id)
     OR (a.item_id IS NULL AND e.informe_id = (SELECT inf.id FROM tms_monitoreo_informes inf WHERE inf.numero = t.informe_numero));

  RETURN jsonb_build_object(
    'informe', v_informe,
    'item', v_item,
    'evidencias', coalesce(v_evid, '[]'::jsonb),
    'accion', CASE WHEN a.id IS NOT NULL THEN jsonb_build_object(
        'folio', a.folio, 'tipo_accion', a.tipo_accion, 'dictamen', a.dictamen,
        'descripcion', a.descripcion, 'prioridad', a.prioridad, 'estado', a.estado,
        'area_responsable', a.area_responsable, 'referencia', a.referencia,
        'creado_nombre', a.creado_nombre, 'created_at', a.created_at) END);
END $$;
REVOKE EXECUTE ON FUNCTION public.pv_informe_calidad(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.pv_informe_calidad(text) TO authenticated, service_role;
