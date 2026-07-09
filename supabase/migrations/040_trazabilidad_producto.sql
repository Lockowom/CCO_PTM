-- 040_trazabilidad_producto.sql
-- Trazabilidad de un producto a lo largo del proceso de Calidad: reúne en una
-- línea de tiempo la Recepción (CheckList de ingreso), la Estancia (dictámenes de
-- monitoreo), las Acciones (traspaso/baja/reparación/…) y la Salida, más el estado
-- de calidad vigente. Alimenta la "Mi Bandeja" de cada área.
CREATE OR REPLACE FUNCTION public.trazabilidad_producto(
  p_codigo    text,
  p_partida   text DEFAULT NULL,
  p_ubicacion text DEFAULT NULL
)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_cod   text := trim(coalesce(p_codigo, ''));
  v_flag  jsonb;
  v_ev    jsonb;
BEGIN
  IF v_cod = '' THEN RETURN jsonb_build_object('codigo', '', 'estado_actual', NULL, 'eventos', '[]'::jsonb); END IF;

  -- Estado de calidad vigente (flag más reciente).
  SELECT to_jsonb(f) INTO v_flag
  FROM (
    SELECT estado_calidad, severidad, nota, ubicacion, partida, updated_at
    FROM tms_calidad_flags
    WHERE codigo_producto = v_cod AND vigente = true
      AND (p_partida IS NULL OR coalesce(partida,'') = p_partida)
      AND (p_ubicacion IS NULL OR coalesce(ubicacion,'') = p_ubicacion)
    ORDER BY updated_at DESC LIMIT 1
  ) f;

  -- Eventos (unión de todas las etapas), ordenados por fecha.
  WITH eventos AS (
    -- Hito 1 — Recepción / CheckList de ingreso (por referencia del ítem)
    SELECT coalesce(t.completado_en, t.created_at) AS fecha, 1 AS orden, 'RECEPCION' AS hito,
           'CheckList de ingreso' AS titulo, t.estado AS estado, t.folio AS folio,
           concat_ws(' · ', nullif(t.proveedor,''), nullif('OC '||coalesce(t.oc,''),'OC '),
                     nullif(t.disposicion,'')) AS detalle
    FROM tms_recepcion_items ri
    JOIN tms_calidad_tareas t ON t.recepcion_id = ri.recepcion_id AND t.tipo = 'CHECKLIST_INGRESO'
    WHERE ri.reff = v_cod
    UNION ALL
    SELECT coalesce(t.completado_en, t.created_at), 1, 'RECEPCION',
           'CheckList de ingreso', t.estado, t.folio,
           concat_ws(' · ', nullif(t.proveedor,''), nullif('OC '||coalesce(t.oc,''),'OC '))
    FROM tms_recepcion_items_nacionales ri
    JOIN tms_calidad_tareas t ON t.recepcion_id = ri.recepcion_id AND t.tipo = 'CHECKLIST_INGRESO'
    WHERE ri.reff = v_cod

    -- Hito 2 — Estancia / Monitoreo (revisión y dictamen)
    UNION ALL
    SELECT coalesce(mi.fecha_dictamen, mi.created_at), 2, 'ESTANCIA',
           CASE WHEN mi.dictamen IS NOT NULL THEN 'Dictamen: ' || mi.dictamen ELSE 'En revisión (Calidad)' END,
           coalesce(mi.dictamen, 'EN_REVISION'),
           inf.numero,
           concat_ws(' · ', nullif(mi.condicion_observada,''),
                     nullif('Bodega '||coalesce(mi.bodega_destino,''),'Bodega '),
                     nullif(mi.calidad_nombre,''), nullif(mi.acuse_texto,''),
                     nullif('Ubic. '||coalesce(mi.ubicacion,''),'Ubic. '))
    FROM tms_monitoreo_items mi
    LEFT JOIN tms_monitoreo_informes inf ON inf.id = mi.informe_id
    WHERE mi.codigo_producto = v_cod
      AND (p_partida IS NULL OR coalesce(mi.partida,'') = p_partida)
      AND (p_ubicacion IS NULL OR coalesce(mi.ubicacion,'') = p_ubicacion)

    -- Acciones (traspaso / baja / reparación / …)
    UNION ALL
    SELECT a.created_at, 3, 'ACCION',
           'Acción: ' || a.tipo_accion, a.estado, a.folio,
           concat_ws(' · ', nullif(a.area_responsable,''), nullif('BD '||coalesce(a.bodega_destino,''),'BD '),
                     nullif(a.descripcion,''),
                     CASE WHEN a.estado='RESUELTA' THEN 'Resuelta: '||coalesce(a.resolucion,'') END)
    FROM tms_calidad_acciones a
    WHERE a.codigo_producto = v_cod

    -- Hito 3 — Salida (certificación de despacho que incluye el SKU)
    UNION ALL
    SELECT coalesce(t.completado_en, t.created_at), 4, 'SALIDA',
           'Certificación de salida', t.estado, t.folio,
           concat_ws(' · ', nullif('Cliente '||coalesce(t.proveedor,''),'Cliente '),
                     nullif('NV '||coalesce(t.oc,''),'NV '))
    FROM tms_calidad_tareas t
    WHERE t.tipo = 'CERTIFICADO_SALIDA'
      AND EXISTS (
        SELECT 1 FROM jsonb_array_elements(coalesce(t.contexto->'skus','[]'::jsonb)) e
        WHERE e->>'codigo_producto' = v_cod
      )
  )
  SELECT jsonb_agg(jsonb_build_object(
           'fecha', fecha, 'hito', hito, 'titulo', titulo,
           'estado', estado, 'folio', folio, 'detalle', nullif(detalle,'')
         ) ORDER BY fecha DESC NULLS LAST, orden DESC)
  INTO v_ev
  FROM (SELECT * FROM eventos ORDER BY fecha DESC NULLS LAST LIMIT 100) e;

  RETURN jsonb_build_object('codigo', v_cod, 'estado_actual', v_flag, 'eventos', coalesce(v_ev, '[]'::jsonb));
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.trazabilidad_producto(text, text, text) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.trazabilidad_producto(text, text, text) TO authenticated, service_role;
