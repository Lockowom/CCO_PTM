-- Clasificación operativa del catálogo maestro. No representa stock, no escribe
-- en ERP/Softland y permite proteger ubicaciones especiales de limpiezas masivas.
ALTER TABLE public.wms_ubicaciones_maestras
  ADD COLUMN IF NOT EXISTS tipo_uso text NOT NULL DEFAULT 'GENERAL';

ALTER TABLE public.wms_ubicaciones_maestras
  DROP CONSTRAINT IF EXISTS wms_ubicaciones_maestras_tipo_uso_check;

ALTER TABLE public.wms_ubicaciones_maestras
  ADD CONSTRAINT wms_ubicaciones_maestras_tipo_uso_check
  CHECK (tipo_uso IN ('GENERAL', 'CALIDAD', 'TRANSITORIO'));

CREATE INDEX IF NOT EXISTS wms_ubicaciones_maestras_tipo_uso_idx
  ON public.wms_ubicaciones_maestras (tipo_uso, activo, ubicacion);

-- Baseline autorizado: estas posiciones pasan a ser resguardo de Calidad.
-- La validación evita que una migración parcial deje el control incompleto.
DO $$
DECLARE
  v_esperadas constant text[] := ARRAY[
    'D-01-01', 'D-01-02', 'D-01-03',
    'D-02-01', 'D-02-02', 'D-02-03'
  ];
  v_encontradas integer;
BEGIN
  SELECT count(*)
    INTO v_encontradas
    FROM public.wms_ubicaciones_maestras
   WHERE ubicacion = ANY(v_esperadas);

  IF v_encontradas <> array_length(v_esperadas, 1) THEN
    RAISE EXCEPTION 'No se pudo clasificar Calidad: se esperaban % ubicaciones y se encontraron %',
      array_length(v_esperadas, 1), v_encontradas
      USING ERRCODE = 'P0001';
  END IF;

  UPDATE public.wms_ubicaciones_maestras
     SET tipo_uso = 'CALIDAD'
   WHERE ubicacion = ANY(v_esperadas);
END;
$$;

COMMENT ON COLUMN public.wms_ubicaciones_maestras.tipo_uso IS
  'GENERAL permite archivo operativo; CALIDAD y TRANSITORIO quedan excluidos del archivo masivo. CALIDAD además bloquea retiro, eliminación y movimiento saliente de registros WMS.';

-- Ninguna limpieza masiva puede retirar registros de CALIDAD o TRANSITORIO.
CREATE OR REPLACE FUNCTION public.archivar_ubicaciones_wms(
  p_ids uuid[],
  p_motivo text DEFAULT 'Limpieza controlada desde Gestion de Ubicaciones'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  v_ids uuid[];
  v_actor_id uuid;
  v_actor_nombre text;
  v_motivo text := nullif(btrim(coalesce(p_motivo, '')), '');
  v_archivados integer := 0;
  v_protegidas_calidad integer := 0;
  v_protegidas_transitorio integer := 0;
  v_solicitudes_desvinculadas integer := 0;
BEGIN
  IF auth.uid() IS NULL
     OR NOT coalesce(public.usuario_tiene_algun_permiso(array['manage_locations']), false) THEN
    RAISE EXCEPTION 'No tienes permiso para archivar ubicaciones WMS' USING ERRCODE = '42501';
  END IF;

  IF p_ids IS NULL OR coalesce(array_length(p_ids, 1), 0) = 0 THEN
    RAISE EXCEPTION 'Debe seleccionar al menos una ubicacion' USING ERRCODE = '22023';
  END IF;

  SELECT array_agg(DISTINCT source.location_id ORDER BY source.location_id)
    INTO v_ids
    FROM unnest(p_ids) AS source(location_id)
   WHERE source.location_id IS NOT NULL;

  IF coalesce(array_length(v_ids, 1), 0) = 0 THEN
    RAISE EXCEPTION 'Debe seleccionar al menos una ubicacion valida' USING ERRCODE = '22023';
  END IF;
  IF array_length(v_ids, 1) > 500 THEN
    RAISE EXCEPTION 'Maximo 500 ubicaciones por archivo' USING ERRCODE = '22023';
  END IF;
  IF v_motivo IS NULL OR length(v_motivo) > 500 OR v_motivo !~ '[[:alnum:]]' THEN
    RAISE EXCEPTION 'Indica un motivo de archivo valido' USING ERRCODE = '22023';
  END IF;

  SELECT u.id, coalesce(nullif(u.nombre, ''), u.email)
    INTO v_actor_id, v_actor_nombre
    FROM public.tms_usuarios u
   WHERE u.auth_uid = auth.uid()
     AND u.activo
   LIMIT 1;
  IF v_actor_id IS NULL THEN
    RAISE EXCEPTION 'Usuario activo no encontrado' USING ERRCODE = '42501';
  END IF;

  SELECT count(*)
    INTO v_solicitudes_desvinculadas
    FROM public.wms_ubicacion_solicitudes s
    JOIN public.wms_ubicaciones w ON w.id = s.ubicacion_id
    LEFT JOIN public.wms_ubicaciones_maestras m
      ON m.ubicacion = upper(btrim(w.ubicacion))
   WHERE w.id = ANY(v_ids)
     AND coalesce(m.tipo_uso, 'GENERAL') = 'GENERAL';

  WITH seleccionadas AS MATERIALIZED (
    SELECT w.id, to_jsonb(w) AS datos, coalesce(m.tipo_uso, 'GENERAL') AS tipo_uso
      FROM public.wms_ubicaciones w
      LEFT JOIN public.wms_ubicaciones_maestras m
        ON m.ubicacion = upper(btrim(w.ubicacion))
     WHERE w.id = ANY(v_ids)
     ORDER BY w.id
     FOR UPDATE OF w
  ), archivadas AS (
    INSERT INTO public.wms_ubicaciones_archivadas (
      ubicacion_id_original, datos, motivo, archivado_por, archivado_por_nombre
    )
    SELECT id, datos, v_motivo, v_actor_id, v_actor_nombre
      FROM seleccionadas
     WHERE tipo_uso = 'GENERAL'
    ON CONFLICT (ubicacion_id_original) DO NOTHING
    RETURNING ubicacion_id_original
  ), retiradas AS (
    DELETE FROM public.wms_ubicaciones w
     USING archivadas a
     WHERE w.id = a.ubicacion_id_original
    RETURNING w.id
  )
  SELECT
    (SELECT count(*) FROM retiradas),
    (SELECT count(*) FROM seleccionadas WHERE tipo_uso = 'CALIDAD'),
    (SELECT count(*) FROM seleccionadas WHERE tipo_uso = 'TRANSITORIO')
  INTO v_archivados, v_protegidas_calidad, v_protegidas_transitorio;

  RETURN jsonb_build_object(
    'archivados', v_archivados,
    'omitidos', array_length(v_ids, 1) - v_archivados,
    'protegidas_calidad', v_protegidas_calidad,
    'protegidas_transitorio', v_protegidas_transitorio,
    'solicitudes_desvinculadas', v_solicitudes_desvinculadas,
    'stock_side_effect', 0,
    'erp_write', 0
  );
END;
$function$;

-- Calidad es un resguardo: los productos pueden entrar, pero no salir ni
-- eliminarse desde la gestión de ubicaciones hasta que se cambie la clasificación.
CREATE OR REPLACE FUNCTION public.mover_ubicacion_wms(p_id uuid, p_nueva_ubicacion text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  v_source public.wms_ubicaciones%ROWTYPE;
  v_target public.wms_ubicaciones%ROWTYPE;
  v_source_tipo_uso text;
  v_new text := upper(btrim(coalesce(p_nueva_ubicacion, '')));
BEGIN
  IF auth.uid() IS NULL OR NOT coalesce(public.usuario_tiene_algun_permiso(array['manage_locations']), false) THEN
    RAISE EXCEPTION 'Acceso denegado para modificar ubicaciones' USING ERRCODE = '42501';
  END IF;
  IF v_new = '' THEN
    RAISE EXCEPTION 'La ubicación no puede quedar vacía' USING ERRCODE = '22023';
  END IF;

  SELECT * INTO v_source
    FROM public.wms_ubicaciones
   WHERE id = p_id
   FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Registro de ubicación no encontrado' USING ERRCODE = 'P0002';
  END IF;

  SELECT m.tipo_uso INTO v_source_tipo_uso
    FROM public.wms_ubicaciones_maestras m
   WHERE m.ubicacion = upper(btrim(v_source.ubicacion));
  IF coalesce(v_source_tipo_uso, 'GENERAL') = 'CALIDAD' THEN
    RAISE EXCEPTION 'No se puede sacar producto de una ubicación de Calidad' USING ERRCODE = '22023';
  END IF;
  IF v_source.ubicacion = v_new THEN
    RETURN to_jsonb(v_source);
  END IF;

  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(v_new || chr(31) || coalesce(v_source.codigo, ''), 0)
  );
  SELECT * INTO v_target
    FROM public.wms_ubicaciones
   WHERE upper(btrim(ubicacion)) = v_new
     AND upper(btrim(coalesce(codigo, ''))) = upper(btrim(coalesce(v_source.codigo, '')))
     AND id <> v_source.id
   ORDER BY coalesce(cantidad, 0) DESC
   LIMIT 1
   FOR UPDATE;

  IF v_target.id IS NULL THEN
    UPDATE public.wms_ubicaciones
       SET ubicacion = v_new
     WHERE id = v_source.id
     RETURNING * INTO v_source;
  ELSE
    UPDATE public.wms_ubicaciones
       SET cantidad = coalesce(v_target.cantidad, 0) + coalesce(v_source.cantidad, 0),
           registrado_putaway = v_target.registrado_putaway OR v_source.registrado_putaway,
           origen_registro = CASE WHEN coalesce(v_target.cantidad, 0) + coalesce(v_source.cantidad, 0) > 0 THEN 'inventario' ELSE 'putaway' END,
           descripcion = coalesce(nullif(v_target.descripcion, ''), v_source.descripcion),
           serie = coalesce(nullif(v_target.serie, ''), v_source.serie),
           partida = coalesce(nullif(v_target.partida, ''), v_source.partida),
           pieza = coalesce(nullif(v_target.pieza, ''), v_source.pieza),
           fecha_vencimiento = coalesce(v_target.fecha_vencimiento, v_source.fecha_vencimiento)
     WHERE id = v_target.id
     RETURNING * INTO v_source;
    DELETE FROM public.wms_ubicaciones WHERE id = p_id;
  END IF;
  RETURN to_jsonb(v_source);
END;
$function$;

CREATE OR REPLACE FUNCTION public.eliminar_ubicacion_wms(
  p_id uuid,
  p_solo_putaway boolean DEFAULT false
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  v_ubicacion text;
  v_tipo_uso text;
BEGIN
  IF auth.uid() IS NULL OR NOT coalesce(public.usuario_tiene_algun_permiso(array['manage_locations']), false) THEN
    RAISE EXCEPTION 'Acceso denegado para eliminar ubicaciones' USING ERRCODE = '42501';
  END IF;

  SELECT upper(btrim(w.ubicacion))
    INTO v_ubicacion
    FROM public.wms_ubicaciones w
   WHERE w.id = p_id
   FOR UPDATE;
  IF NOT FOUND THEN
    RETURN false;
  END IF;

  SELECT m.tipo_uso INTO v_tipo_uso
    FROM public.wms_ubicaciones_maestras m
   WHERE m.ubicacion = v_ubicacion;
  IF coalesce(v_tipo_uso, 'GENERAL') = 'CALIDAD' THEN
    RAISE EXCEPTION 'No se puede sacar producto de una ubicación de Calidad' USING ERRCODE = '22023';
  END IF;

  IF p_solo_putaway THEN
    UPDATE public.wms_ubicaciones
       SET registrado_putaway = false,
           origen_registro = 'inventario'
     WHERE id = p_id
       AND coalesce(cantidad, 0) > 0;
    IF FOUND THEN
      RETURN true;
    END IF;
  END IF;

  DELETE FROM public.wms_ubicaciones WHERE id = p_id;
  RETURN FOUND;
END;
$function$;

CREATE OR REPLACE FUNCTION public.retirar_putaway_ubicaciones(p_items jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  v_item jsonb;
  v_ubicacion text;
  v_codigo text;
  v_actualizados integer;
  v_retirados integer := 0;
  v_omitidos integer := 0;
  v_resultados jsonb := '[]'::jsonb;
BEGIN
  IF auth.uid() IS NULL OR NOT coalesce(public.usuario_tiene_algun_permiso(array['manage_locations']), false) THEN
    RAISE EXCEPTION 'Acceso denegado para retirar ubicaciones Put Away' USING ERRCODE = '42501';
  END IF;
  IF jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Debe enviar al menos una ubicación y SKU' USING ERRCODE = '22023';
  END IF;
  IF jsonb_array_length(p_items) > 500 THEN
    RAISE EXCEPTION 'Máximo 500 ubicaciones por lote' USING ERRCODE = '22023';
  END IF;

  FOR v_item IN SELECT value FROM jsonb_array_elements(p_items)
  LOOP
    v_ubicacion := upper(btrim(coalesce(v_item->>'ubicacion', '')));
    v_codigo := upper(btrim(coalesce(v_item->>'codigo', '')));

    IF v_ubicacion = '' OR v_codigo = '' THEN
      v_omitidos := v_omitidos + 1;
      v_resultados := v_resultados || jsonb_build_array(jsonb_build_object(
        'ubicacion', v_ubicacion, 'codigo', v_codigo, 'estado', 'OMITIDO',
        'motivo', 'Ubicación y SKU son obligatorios'
      ));
      CONTINUE;
    END IF;

    IF EXISTS (
      SELECT 1
        FROM public.wms_ubicaciones_maestras m
       WHERE m.ubicacion = v_ubicacion
         AND m.tipo_uso = 'CALIDAD'
    ) THEN
      v_omitidos := v_omitidos + 1;
      v_resultados := v_resultados || jsonb_build_array(jsonb_build_object(
        'ubicacion', v_ubicacion, 'codigo', v_codigo, 'estado', 'PROTEGIDO',
        'motivo', 'Ubicación de Calidad: no se puede retirar producto'
      ));
      CONTINUE;
    END IF;

    WITH retirados AS (
      UPDATE public.wms_ubicaciones w
         SET registrado_putaway = false,
             origen_registro = 'inventario'
       WHERE upper(btrim(w.ubicacion)) = v_ubicacion
         AND upper(btrim(coalesce(w.codigo, ''))) = v_codigo
         AND coalesce(w.registrado_putaway, false)
      RETURNING w.id
    )
    SELECT count(*) INTO v_actualizados FROM retirados;

    IF v_actualizados = 0 THEN
      v_omitidos := v_omitidos + 1;
      v_resultados := v_resultados || jsonb_build_array(jsonb_build_object(
        'ubicacion', v_ubicacion, 'codigo', v_codigo, 'estado', 'OMITIDO',
        'motivo', 'No existe como registro Put Away activo'
      ));
    ELSE
      v_retirados := v_retirados + v_actualizados;
      v_resultados := v_resultados || jsonb_build_array(jsonb_build_object(
        'ubicacion', v_ubicacion, 'codigo', v_codigo, 'estado', 'RETIRADO',
        'registros_actualizados', v_actualizados
      ));
    END IF;
  END LOOP;

  RETURN jsonb_build_object(
    'retirados', v_retirados,
    'omitidos', v_omitidos,
    'resultados', v_resultados,
    'stock_side_effect', 0,
    'erp_write', 0
  );
END;
$function$;
