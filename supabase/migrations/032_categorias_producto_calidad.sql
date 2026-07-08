-- 032_categorias_producto_calidad.sql
-- Segmentación del catálogo por FAMILIA de producto para que el CheckList de
-- ingreso aplique CRITERIOS DE ACEPTACIÓN distintos según la naturaleza del
-- producto (un equipo activo, un insumo estéril, una silla de ruedas y un rollo
-- de empaque NO se inspeccionan igual). Requisito ISO 13485 (§7.4.3 verificación
-- del producto comprado) + marco legal chileno (ISP / DS 825 control obligatorio).
--
-- Familias:
--   EQUIPO_ACTIVO   — dispositivo médico activo (mide/energiza/diagnostica)
--   MOBILIARIO      — mobiliario clínico (camillas, catres, carros, sillones…)
--   AYUDA_TECNICA   — ayuda técnica / ortopedia (sillas de ruedas, fajas, plantillas…)
--   INSUMO_ESTERIL  — insumo estéril / desechable (gasas, apósitos, lancetas…)
--   BIENESTAR       — línea de bienestar NO sanitaria (MAXX)
--   EMPAQUE         — empaque de terceros NO sanitario (rollos BOPP / Farmapack)
--   BASURA          — filas de encabezado/artefactos de importación (excluir)
--   SIN_CLASIFICAR  — sin match → requiere clasificación manual

-- ── 1) Clasificador por palabras clave (fallback puro, IMMUTABLE) ────────────
CREATE OR REPLACE FUNCTION public.clasificar_producto(descripcion text)
 RETURNS text
 LANGUAGE plpgsql
 IMMUTABLE
AS $function$
DECLARE
  d text := lower(coalesce(descripcion, ''));
BEGIN
  IF length(trim(d)) = 0 THEN RETURN 'SIN_CLASIFICAR'; END IF;

  -- Basura / encabezados / artefactos de importación
  IF d ~ '^(descripcion|descripcón|descripcon|codigo|código|color|reff|reff\.|um|n°|nº)$'
     OR d ~ '^color (beige|blck|black|blue|pink|beis)$'
     OR d ~ '^0vi[0-9a-z]+$' THEN
    RETURN 'BASURA';
  END IF;

  -- Bienestar NO sanitario (línea MAXX): marcada siempre con "(MAXX)"
  IF d ~ '\(maxx\)|\bmaxx\b' THEN RETURN 'BIENESTAR'; END IF;

  -- Empaque NO sanitario (Farmapack: rollos BOPP y máquinas de envasado)
  IF d ~ 'rollo bopp|\bbopp\b|opuspac|blister bc|envasadora|alimentador 3ag' THEN
    RETURN 'EMPAQUE';
  END IF;

  -- Insumo estéril / desechable (consumibles clínicos)
  IF d ~ 'gasa|apo?sito|apósito|alcohol pad|lanceta|tira[s]? reactiva|sutura|venda|vendaje|parche|compresa|aerocamara|aerocámara|especulo|espéculo|jeringa|aguja|guante|algod[oó]n|cinta adhesiva|cinta hub|cinta neuromuscular|cortador de pastilla|pastillero|cortadora de blister|botiqu[ií]n|primeros auxilios|frio calor|frío calor|ejercitador|triflow|funda protectora|sticker' THEN
    RETURN 'INSUMO_ESTERIL';
  END IF;

  -- Equipo médico activo (mide / energiza / diagnostica) y sus accesorios
  IF d ~ 'monitor|oximetro|oxímetro|tensiometro|tensiómetro|toma presion|balanza|concentrador|bomba de aspiracion|bomba de aspiración|otoscopio|oftalmoscopio|laringoscopio|cardiomax|sensor spo2|brazalete|transformador mural|estimulador|cabezal|tarjeta fbt|\bcable\b|sistema anytime|sistema central de monitoreo|soporte de (muro|cabecera)|base rodable|nebulizador|term[oó]metro' THEN
    RETURN 'EQUIPO_ACTIVO';
  END IF;

  -- Ayuda técnica / ortopedia
  IF d ~ 'silla de rueda|andador|bast[oó]n|muleta|cabestrillo|faja|plantilla|almohadilla|almoh |anillo de gel|dedal|protector de juanetes|separador taba|tubo de gel|orinal|plantar|dedo garra' THEN
    RETURN 'AYUDA_TECNICA';
  END IF;

  -- Mobiliario clínico
  IF d ~ 'camilla|catre|cuna|sill[oó]n|carro|biombo|colch[oó]n|velador|basurero|cajetin|cajetines|barra lateral|bolsa para carro|montaje de pared|soporte|mesa|divisiones' THEN
    RETURN 'MOBILIARIO';
  END IF;

  RETURN 'SIN_CLASIFICAR';
END;
$function$;

-- ── 2) Metadatos de cada familia (fuente de verdad de criterios y flags) ─────
CREATE TABLE IF NOT EXISTS public.tms_categorias_calidad (
  codigo                 text PRIMARY KEY,
  orden                  int  NOT NULL DEFAULT 100,
  label                  text NOT NULL,
  descripcion            text,
  es_dispositivo_medico  boolean NOT NULL DEFAULT true,
  requiere_registro_isp  boolean NOT NULL DEFAULT false,  -- control obligatorio (DS 825)
  clase_riesgo           text,                            -- I | IIa | IIb | III (ref. ISP)
  params                 jsonb NOT NULL DEFAULT '[]'::jsonb, -- ítems extra del checklist
  activo                 boolean NOT NULL DEFAULT true
);

ALTER TABLE public.tms_categorias_calidad ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.tms_categorias_calidad TO authenticated;
DROP POLICY IF EXISTS categorias_calidad_select_auth ON public.tms_categorias_calidad;
CREATE POLICY categorias_calidad_select_auth ON public.tms_categorias_calidad
  FOR SELECT USING (auth.role() = 'authenticated');

INSERT INTO public.tms_categorias_calidad (codigo, orden, label, descripcion, es_dispositivo_medico, requiere_registro_isp, clase_riesgo, params) VALUES
 ('EQUIPO_ACTIVO', 10, 'Equipo médico activo',
  'Dispositivo médico que mide, energiza o diagnostica (monitores, balanzas, concentradores, otoscopios).', true, false, 'IIa',
  '[{"id":"eq_test_funcional","label":"Prueba funcional / encendido correcto"},
    {"id":"eq_calibracion","label":"Certificado de calibración / verificación metrológica (si aplica)"},
    {"id":"eq_manual_garantia","label":"Manual de uso y garantía incluidos"},
    {"id":"eq_accesorios","label":"Accesorios y cables completos según lista de empaque"},
    {"id":"eq_serie","label":"N° de serie registrado y coincide con lo declarado"}]'::jsonb),
 ('INSUMO_ESTERIL', 20, 'Insumo estéril / desechable',
  'Consumible clínico (gasas, apósitos, lancetas, suturas, vendas). Control estricto de lote/vencimiento/esterilidad.', true, true, 'IIa',
  '[{"id":"ie_esterilidad","label":"Empaque estéril íntegro (sin perforación ni apertura previa)"},
    {"id":"ie_vencimiento","label":"Fecha de vencimiento vigente con margen suficiente"},
    {"id":"ie_lote","label":"Lote registrado y trazable"},
    {"id":"ie_registro_isp","label":"N° de registro sanitario ISP (productos de control obligatorio: jeringas, agujas, guantes, preservativos)"},
    {"id":"ie_condiciones","label":"Condiciones de transporte/almacenamiento cumplidas (cadena de frío si aplica)"}]'::jsonb),
 ('MOBILIARIO', 30, 'Mobiliario clínico',
  'Camillas, catres clínicos, cunas, sillones, carros, biombos, colchones.', true, false, 'I',
  '[{"id":"mob_estructura","label":"Estructura sin deformaciones; soldaduras y uniones firmes"},
    {"id":"mob_mecanismos","label":"Mecanismos operativos (ruedas, frenos, articulaciones, hidráulica)"},
    {"id":"mob_accesorios","label":"Accesorios/partes completos según ficha técnica"},
    {"id":"mob_superficie","label":"Superficies sin rayaduras, óxido ni daño de transporte"}]'::jsonb),
 ('AYUDA_TECNICA', 40, 'Ayuda técnica / ortopedia',
  'Sillas de ruedas, cabestrillos, fajas, plantillas, órtesis.', true, false, 'I',
  '[{"id":"at_funcion","label":"Función mecánica correcta (plegado, ajuste, frenos)"},
    {"id":"at_medidas","label":"Talla / medida correcta según pedido"},
    {"id":"at_ficha","label":"Ficha técnica / instrucciones de uso incluidas"},
    {"id":"at_integridad","label":"Sin daños; costuras/velcros y partes completas"}]'::jsonb),
 ('BIENESTAR', 50, 'Bienestar (no sanitario)',
  'Línea de bienestar personal MAXX. NO es dispositivo médico.', false, false, NULL,
  '[{"id":"bi_integridad","label":"Producto y empaque en buen estado"},
    {"id":"bi_rotulado","label":"Rotulado/etiquetado conforme (marca, contenido)"},
    {"id":"bi_cantidad","label":"Cantidad coincide con lo declarado"}]'::jsonb),
 ('EMPAQUE', 60, 'Empaque / Farmapack (no sanitario)',
  'Rollos BOPP y equipos de envasado de Farmapack; PTM solo despacha. NO es dispositivo médico.', false, false, NULL,
  '[{"id":"em_integridad","label":"Rollos/bobinas sin daño, humedad ni contaminación"},
    {"id":"em_especificacion","label":"Especificación correcta (medida, tipo BOPP, cantidad de bolsas)"},
    {"id":"em_cantidad","label":"Cantidad de rollos coincide con lo declarado"}]'::jsonb),
 ('SIN_CLASIFICAR', 90, 'Sin clasificar',
  'Producto sin familia asignada automáticamente; requiere revisión manual de Calidad.', true, false, NULL, '[]'::jsonb),
 ('BASURA', 99, 'Fila no válida',
  'Encabezado o artefacto de importación; se excluye del control.', false, false, NULL, '[]'::jsonb)
ON CONFLICT (codigo) DO UPDATE SET
  orden = EXCLUDED.orden, label = EXCLUDED.label, descripcion = EXCLUDED.descripcion,
  es_dispositivo_medico = EXCLUDED.es_dispositivo_medico, requiere_registro_isp = EXCLUDED.requiere_registro_isp,
  clase_riesgo = EXCLUDED.clase_riesgo, params = EXCLUDED.params;

-- ── 3) Override manual persistente (correcciones de Calidad) ─────────────────
-- La clasificación efectiva usa primero un override por descripción normalizada;
-- si no hay, cae al clasificador por palabras clave.
CREATE TABLE IF NOT EXISTS public.tms_producto_categoria (
  descripcion_norm text PRIMARY KEY,
  categoria        text NOT NULL REFERENCES public.tms_categorias_calidad(codigo),
  actualizado_por  uuid,
  actualizado_nombre text,
  updated_at       timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.tms_producto_categoria ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.tms_producto_categoria TO authenticated;
DROP POLICY IF EXISTS producto_categoria_select_auth ON public.tms_producto_categoria;
CREATE POLICY producto_categoria_select_auth ON public.tms_producto_categoria
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE OR REPLACE FUNCTION public.categoria_efectiva(descripcion text)
 RETURNS text
 LANGUAGE sql
 STABLE
AS $function$
  SELECT coalesce(
    (SELECT categoria FROM public.tms_producto_categoria
      WHERE descripcion_norm = upper(trim(coalesce(descripcion, '')))),
    public.clasificar_producto(descripcion)
  );
$function$;

-- ── 4) Columna categoria en los ítems de recepción + backfill + trigger ─────
ALTER TABLE public.tms_recepcion_items            ADD COLUMN IF NOT EXISTS categoria text;
ALTER TABLE public.tms_recepcion_items_nacionales ADD COLUMN IF NOT EXISTS categoria text;

UPDATE public.tms_recepcion_items            SET categoria = public.categoria_efectiva(descripcion);
UPDATE public.tms_recepcion_items_nacionales SET categoria = public.categoria_efectiva(descripcion);

CREATE INDEX IF NOT EXISTS idx_recep_items_categoria     ON public.tms_recepcion_items (categoria);
CREATE INDEX IF NOT EXISTS idx_recep_items_nac_categoria ON public.tms_recepcion_items_nacionales (categoria);

CREATE OR REPLACE FUNCTION public.set_categoria_item()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.categoria IS NULL OR NEW.categoria = '' THEN
    NEW.categoria := public.categoria_efectiva(NEW.descripcion);
  END IF;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_categoria_item_imp ON public.tms_recepcion_items;
CREATE TRIGGER trg_categoria_item_imp
  BEFORE INSERT ON public.tms_recepcion_items
  FOR EACH ROW EXECUTE FUNCTION public.set_categoria_item();

DROP TRIGGER IF EXISTS trg_categoria_item_nac ON public.tms_recepcion_items_nacionales;
CREATE TRIGGER trg_categoria_item_nac
  BEFORE INSERT ON public.tms_recepcion_items_nacionales
  FOR EACH ROW EXECUTE FUNCTION public.set_categoria_item();

-- ── 5) RPC: familias presentes en la recepción de una tarea de checklist ─────
-- Devuelve las categorías detectadas (con sus criterios extra y flags) y los
-- agregados que el frontend usa para el checklist y el certificado.
CREATE OR REPLACE FUNCTION public.calidad_categorias_tarea(p_tarea_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_tarea  tms_calidad_tareas;
  v_cats   jsonb;
  v_result jsonb;
BEGIN
  SELECT * INTO v_tarea FROM tms_calidad_tareas WHERE id = p_tarea_id;
  IF v_tarea.id IS NULL THEN RAISE EXCEPTION 'Tarea % no encontrada', p_tarea_id; END IF;

  WITH items AS (
    SELECT categoria, count(*) AS n FROM tms_recepcion_items
      WHERE recepcion_id = v_tarea.recepcion_id AND v_tarea.origen = 'IMPORTACION'
      GROUP BY categoria
    UNION ALL
    SELECT categoria, count(*) AS n FROM tms_recepcion_items_nacionales
      WHERE recepcion_id = v_tarea.recepcion_id AND v_tarea.origen = 'NACIONAL'
      GROUP BY categoria
  ),
  agg AS (
    SELECT coalesce(categoria, 'SIN_CLASIFICAR') AS codigo, sum(n)::int AS items
    FROM items GROUP BY 1
  ),
  joined AS (
    SELECT a.codigo, a.items, c.orden, c.label, c.descripcion, c.es_dispositivo_medico,
           c.requiere_registro_isp, c.clase_riesgo, c.params
    FROM agg a
    LEFT JOIN tms_categorias_calidad c ON c.codigo = a.codigo
    WHERE a.codigo <> 'BASURA'
  )
  SELECT jsonb_agg(jsonb_build_object(
           'codigo', codigo, 'items', items,
           'label', coalesce(label, codigo),
           'descripcion', descripcion,
           'es_dispositivo_medico', coalesce(es_dispositivo_medico, true),
           'requiere_registro_isp', coalesce(requiere_registro_isp, false),
           'clase_riesgo', clase_riesgo,
           'params', coalesce(params, '[]'::jsonb)
         ) ORDER BY coalesce(orden, 100), codigo)
  INTO v_cats FROM joined;

  v_cats := coalesce(v_cats, '[]'::jsonb);

  SELECT jsonb_build_object(
    'categorias', v_cats,
    'total_items', coalesce((SELECT sum((e->>'items')::int) FROM jsonb_array_elements(v_cats) e), 0),
    'contiene_dispositivo_medico',
      coalesce((SELECT bool_or((e->>'es_dispositivo_medico')::boolean) FROM jsonb_array_elements(v_cats) e), false),
    'requiere_registro_isp',
      coalesce((SELECT bool_or((e->>'requiere_registro_isp')::boolean) FROM jsonb_array_elements(v_cats) e), false),
    'solo_no_sanitario',
      (jsonb_array_length(v_cats) > 0 AND
       NOT coalesce((SELECT bool_or((e->>'es_dispositivo_medico')::boolean) FROM jsonb_array_elements(v_cats) e), false)),
    'sin_clasificar',
      coalesce((SELECT sum((e->>'items')::int) FROM jsonb_array_elements(v_cats) e WHERE e->>'codigo' = 'SIN_CLASIFICAR'), 0)
  ) INTO v_result;

  RETURN v_result;
END;
$function$;

-- ── 6) RPC admin: fijar/corregir la categoría de un producto (override) ──────
CREATE OR REPLACE FUNCTION public.set_categoria_producto(p_descripcion text, p_categoria text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user record;
  v_norm text := upper(trim(coalesce(p_descripcion, '')));
  v_n    int := 0;
BEGIN
  PERFORM public._monitoreo_assert_permiso();
  IF NOT EXISTS (SELECT 1 FROM tms_categorias_calidad WHERE codigo = p_categoria) THEN
    RAISE EXCEPTION 'Categoría inválida: %', coalesce(p_categoria, 'null');
  END IF;
  IF length(v_norm) = 0 THEN RAISE EXCEPTION 'Descripción vacía'; END IF;
  SELECT id, nombre INTO v_user FROM tms_usuarios WHERE auth_uid = auth.uid() AND activo = true;

  INSERT INTO tms_producto_categoria (descripcion_norm, categoria, actualizado_por, actualizado_nombre, updated_at)
  VALUES (v_norm, p_categoria, v_user.id, v_user.nombre, now())
  ON CONFLICT (descripcion_norm) DO UPDATE
    SET categoria = EXCLUDED.categoria, actualizado_por = EXCLUDED.actualizado_por,
        actualizado_nombre = EXCLUDED.actualizado_nombre, updated_at = now();

  -- Re-etiquetar los ítems existentes con esa descripción.
  UPDATE tms_recepcion_items SET categoria = p_categoria WHERE upper(trim(descripcion)) = v_norm;
  GET DIAGNOSTICS v_n = ROW_COUNT;
  UPDATE tms_recepcion_items_nacionales SET categoria = p_categoria WHERE upper(trim(descripcion)) = v_norm;

  RETURN jsonb_build_object('descripcion_norm', v_norm, 'categoria', p_categoria);
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.calidad_categorias_tarea(uuid)   FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.calidad_categorias_tarea(uuid)   TO authenticated, service_role;
REVOKE EXECUTE ON FUNCTION public.set_categoria_producto(text,text) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.set_categoria_producto(text,text) TO authenticated, service_role;
