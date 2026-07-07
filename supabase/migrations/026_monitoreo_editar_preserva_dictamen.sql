-- 026_monitoreo_editar_preserva_dictamen.sql
-- FIX CA-7: al reeditar un informe ya DICTAMINADO, actualizar_informe_monitoreo
-- borraba y reinsertaba los ítems perdiendo el dictamen, y dejaba las filas de
-- tms_calidad_flags apuntando a un item_id inexistente (divergencia ítem↔overlay:
-- Ubicaciones seguía mostrando Cuarentena/Malo mientras el detalle volvía a
-- "Pendiente").
-- Solución: preservar los campos de dictamen para los ítems que persisten
-- (emparejados por clave natural codigo_producto|partida|ubicacion) y re-vincular
-- los flags al nuevo item_id. Los flags de ítems removidos quedan sin item_id
-- (se conservan: retirarlos sería una decisión de negocio, no de correctitud).

CREATE OR REPLACE FUNCTION public.actualizar_informe_monitoreo(p_informe_id uuid, p_cabecera jsonb, p_items jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_old jsonb;
  r     record;
  nk    text;
  dic   jsonb;
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

  -- Snapshot de los ítems dictaminados actuales, indexado por clave natural.
  SELECT coalesce(jsonb_object_agg(k, v), '{}'::jsonb) INTO v_old
  FROM (
    SELECT (codigo_producto || '|' || coalesce(partida,'') || '|' || coalesce(ubicacion,'')) AS k,
           jsonb_build_object(
             'id', id, 'dictamen', dictamen, 'accion', accion,
             'bodega_destino', bodega_destino, 'fecha_limite', fecha_limite,
             'calidad_usuario_id', calidad_usuario_id, 'calidad_nombre', calidad_nombre,
             'fecha_dictamen', fecha_dictamen, 'acuse_texto', acuse_texto,
             'evidencia_url', evidencia_url) AS v
    FROM tms_monitoreo_items
    WHERE informe_id = p_informe_id AND dictamen IS NOT NULL
  ) t;

  DELETE FROM tms_monitoreo_items WHERE informe_id = p_informe_id;
  PERFORM public._monitoreo_insert_items(p_informe_id, p_items);

  -- Restaurar dictamen + re-vincular flags para los ítems que persisten.
  IF v_old <> '{}'::jsonb THEN
    FOR r IN SELECT id, codigo_producto, partida, ubicacion
             FROM tms_monitoreo_items WHERE informe_id = p_informe_id
    LOOP
      nk := r.codigo_producto || '|' || coalesce(r.partida,'') || '|' || coalesce(r.ubicacion,'');
      IF v_old ? nk THEN
        dic := v_old -> nk;
        UPDATE tms_monitoreo_items SET
          dictamen           = dic->>'dictamen',
          accion             = dic->>'accion',
          bodega_destino     = dic->>'bodega_destino',
          fecha_limite       = (dic->>'fecha_limite')::date,
          calidad_usuario_id = (dic->>'calidad_usuario_id')::uuid,
          calidad_nombre     = dic->>'calidad_nombre',
          fecha_dictamen     = (dic->>'fecha_dictamen')::timestamptz,
          acuse_texto        = dic->>'acuse_texto',
          evidencia_url      = dic->>'evidencia_url'
        WHERE id = r.id;

        UPDATE tms_calidad_flags SET item_id = r.id
        WHERE item_id = (dic->>'id')::uuid;
      END IF;
    END LOOP;

    -- Flags de ítems dictaminados que ya no existen (removidos): limpiar item_id
    -- colgante (se conserva el flag; su clave natural sigue anclando el overlay).
    UPDATE tms_calidad_flags f SET item_id = NULL
    WHERE f.item_id = ANY (SELECT (value->>'id')::uuid FROM jsonb_each(v_old))
      AND NOT EXISTS (SELECT 1 FROM tms_monitoreo_items i WHERE i.id = f.item_id);
  END IF;

  RETURN jsonb_build_object('id', p_informe_id);
END;
$function$;
