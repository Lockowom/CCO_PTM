-- 025_monitoreo_informe_transaccional.sql
-- FIX de correctitud (CA-1/CA-2/CA-3 de la revisión 2026-07-07):
--  * CA-1: editar un informe de Monitoreo hacía UPDATE + DELETE + INSERT en 3
--    peticiones sueltas; si el INSERT fallaba, los ítems ya estaban borrados y
--    no se restauraban (pérdida de datos). Ahora es una sola RPC transaccional.
--  * CA-3: crear informe insertaba cabecera e ítems por separado → cabecera
--    huérfana si fallaba el 2º paso. Ahora atómico.
--  * CA-2: el correlativo MON-AAAA-NNNN se calculaba (max+1) sin lock y en una
--    llamada separada del INSERT → dos analistas simultáneos obtenían el mismo
--    número y el 2º violaba UNIQUE. Ahora el número se genera DENTRO de la misma
--    transacción, protegido por advisory lock → serializa y elimina la carrera.
--    monitoreo_next_numero (que sigue usando el informe de Daños) también toma el
--    lock como mitigación.

-- Correlativo con advisory lock (mitiga la carrera para los callers que lo usan).
CREATE OR REPLACE FUNCTION public.monitoreo_next_numero()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_year text := to_char(current_date, 'YYYY');
  v_max  int;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext('monitoreo_numero'));
  SELECT coalesce(max((regexp_replace(numero, '^MON-\d{4}-', ''))::int), 0)
    INTO v_max
  FROM tms_monitoreo_informes
  WHERE numero LIKE 'MON-' || v_year || '-%';
  RETURN 'MON-' || v_year || '-' || lpad((v_max + 1)::text, 4, '0');
END;
$function$;

-- Helper interno: valida permiso de Monitoreo/Calidad para el usuario actual.
CREATE OR REPLACE FUNCTION public._monitoreo_assert_permiso()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_user record;
BEGIN
  SELECT u.rol, u.es_admin_delegado,
         (SELECT permisos_json FROM tms_roles rr WHERE rr.id = u.rol) AS permisos
    INTO v_user
  FROM tms_usuarios u
  WHERE u.auth_uid = auth.uid() AND u.activo = true;

  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Usuario no autenticado';
  END IF;
  IF NOT (v_user.rol = 'ADMIN' OR v_user.es_admin_delegado
          OR (v_user.permisos ? 'manage_monitoreo') OR (v_user.permisos ? 'manage_quality')) THEN
    RAISE EXCEPTION 'Acceso denegado: se requiere permiso de Monitoreo o Calidad';
  END IF;
END;
$function$;

-- Inserta los ítems (jsonb array) de un informe; enumera columnas para no chocar
-- con id/created_at/updated_at (defaults) ni con las columnas de dictamen.
CREATE OR REPLACE FUNCTION public._monitoreo_insert_items(p_informe_id uuid, p_items jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO tms_monitoreo_items
    (informe_id, codigo_producto, partida, ubicacion, producto, unidad_medida,
     cantidad, estado_inventario, tipo, fecha_vencimiento, semaforo,
     condicion_observada, motivo, observaciones, tipo_dano, componente_afectado,
     consecuencia, cantidad_afectada, no_registrado)
  SELECT p_informe_id,
         coalesce(x.codigo_producto, ''), coalesce(x.partida, ''), coalesce(x.ubicacion, ''),
         x.producto, x.unidad_medida, coalesce(x.cantidad, 0), x.estado_inventario, x.tipo,
         x.fecha_vencimiento, x.semaforo, x.condicion_observada, x.motivo, x.observaciones,
         x.tipo_dano, x.componente_afectado, x.consecuencia, x.cantidad_afectada,
         coalesce(x.no_registrado, false)
  FROM jsonb_populate_recordset(null::tms_monitoreo_items, coalesce(p_items, '[]'::jsonb)) x;
END;
$function$;

-- Crear informe (cabecera + ítems) atómico, con número generado bajo lock.
CREATE OR REPLACE FUNCTION public.crear_informe_monitoreo(p_cabecera jsonb, p_items jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_year   text := to_char(current_date, 'YYYY');
  v_max    int;
  v_numero text;
  v_informe tms_monitoreo_informes;
BEGIN
  PERFORM public._monitoreo_assert_permiso();

  -- Número dentro de la misma transacción (lock) → sin carrera con UNIQUE.
  PERFORM pg_advisory_xact_lock(hashtext('monitoreo_numero'));
  SELECT coalesce(max((regexp_replace(numero, '^MON-\d{4}-', ''))::int), 0)
    INTO v_max
  FROM tms_monitoreo_informes
  WHERE numero LIKE 'MON-' || v_year || '-%';
  v_numero := 'MON-' || v_year || '-' || lpad((v_max + 1)::text, 4, '0');

  INSERT INTO tms_monitoreo_informes
    (numero, fecha, analista_id, analista_nombre, bodega, periodicidad,
     periodo_desde, periodo_hasta, estado, total_items, observaciones,
     tipo_informe, reporte)
  VALUES (
    v_numero,
    coalesce((p_cabecera->>'fecha')::date, current_date),
    (p_cabecera->>'analista_id')::uuid,
    p_cabecera->>'analista_nombre',
    p_cabecera->>'bodega',
    coalesce(p_cabecera->>'periodicidad', 'ADHOC'),
    (p_cabecera->>'periodo_desde')::date,
    (p_cabecera->>'periodo_hasta')::date,
    coalesce(p_cabecera->>'estado', 'BORRADOR'),
    coalesce(jsonb_array_length(p_items), 0),
    p_cabecera->>'observaciones',
    coalesce(p_cabecera->>'tipo_informe', 'MONITOREO'),
    CASE WHEN p_cabecera ? 'reporte' THEN p_cabecera->'reporte' ELSE NULL END
  )
  RETURNING * INTO v_informe;

  PERFORM public._monitoreo_insert_items(v_informe.id, p_items);

  RETURN to_jsonb(v_informe);
END;
$function$;

-- Actualizar informe (cabecera + reemplazo de ítems) atómico: si el INSERT
-- falla, todo revierte (incluido el DELETE) → nunca deja el informe sin ítems.
CREATE OR REPLACE FUNCTION public.actualizar_informe_monitoreo(p_informe_id uuid, p_cabecera jsonb, p_items jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  PERFORM public._monitoreo_assert_permiso();

  UPDATE tms_monitoreo_informes SET
    bodega        = CASE WHEN p_cabecera ? 'bodega'        THEN p_cabecera->>'bodega'        ELSE bodega END,
    periodicidad  = coalesce(p_cabecera->>'periodicidad', periodicidad),
    estado        = coalesce(p_cabecera->>'estado', estado),
    observaciones = CASE WHEN p_cabecera ? 'observaciones' THEN p_cabecera->>'observaciones' ELSE observaciones END,
    reporte       = CASE WHEN p_cabecera ? 'reporte'       THEN p_cabecera->'reporte'         ELSE reporte END,
    total_items   = coalesce(jsonb_array_length(p_items), 0),
    updated_at    = now()
  WHERE id = p_informe_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Informe % no encontrado', p_informe_id;
  END IF;

  DELETE FROM tms_monitoreo_items WHERE informe_id = p_informe_id;
  PERFORM public._monitoreo_insert_items(p_informe_id, p_items);

  RETURN jsonb_build_object('id', p_informe_id);
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.crear_informe_monitoreo(jsonb, jsonb) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.actualizar_informe_monitoreo(uuid, jsonb, jsonb) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public._monitoreo_assert_permiso() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public._monitoreo_insert_items(uuid, jsonb) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.crear_informe_monitoreo(jsonb, jsonb) TO authenticated, service_role;
GRANT  EXECUTE ON FUNCTION public.actualizar_informe_monitoreo(uuid, jsonb, jsonb) TO authenticated, service_role;
