-- 039_bodegas_softland.sql
-- Catálogo de bodegas Softland (código numérico + estado DISPONIBLE/TRANSITORIO)
-- para que el DESTINO del dictamen use las bodegas reales del ERP (y así cuadrar
-- y filtrar los movimientos). Se gestiona desde una pantalla de administración.
-- Se parte con los códigos visibles en Softland (21,22,24,5,3,99,7); editables.

CREATE TABLE IF NOT EXISTS public.tms_bodegas_softland (
  codigo               text PRIMARY KEY,     -- '21','5','99'…
  nombre               text NOT NULL,
  estado               text NOT NULL DEFAULT 'DISPONIBLE',  -- DISPONIBLE | TRANSITORIO
  es_destino_dictamen  boolean NOT NULL DEFAULT false,      -- aparece como destino del dictamen
  activo               boolean NOT NULL DEFAULT true,
  orden                int NOT NULL DEFAULT 100,
  updated_at           timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.tms_bodegas_softland ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.tms_bodegas_softland TO authenticated;
DROP POLICY IF EXISTS bodegas_softland_select_auth ON public.tms_bodegas_softland;
CREATE POLICY bodegas_softland_select_auth ON public.tms_bodegas_softland
  FOR SELECT USING (auth.role() = 'authenticated');

-- Semilla (nombres tentativos; se ajustan en la pantalla de administración).
INSERT INTO public.tms_bodegas_softland (codigo, nombre, estado, es_destino_dictamen, orden) VALUES
 ('21', 'Bodega Principal',            'DISPONIBLE',  false, 10),
 ('24', 'Bodega 24',                   'DISPONIBLE',  false, 20),
 ('3',  'Bodega 3',                    'DISPONIBLE',  false, 30),
 ('7',  'Bodega 7',                    'DISPONIBLE',  false, 40),
 ('22', 'Transitorio 22',              'TRANSITORIO', true,  50),
 ('5',  'Transitorio / Serv. Técnico', 'TRANSITORIO', true,  60),
 ('99', 'Baja / Merma',                'TRANSITORIO', true,  70)
ON CONFLICT (codigo) DO NOTHING;

-- La acción guarda la bodega destino (código Softland) para filtrar por ERP.
ALTER TABLE public.tms_calidad_acciones ADD COLUMN IF NOT EXISTS bodega_destino text;

-- ── Admin CRUD del catálogo ─────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.guardar_bodega_softland(
  p_codigo text, p_nombre text, p_estado text DEFAULT 'DISPONIBLE',
  p_es_destino boolean DEFAULT false, p_activo boolean DEFAULT true, p_orden int DEFAULT 100
)
 RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE v_cod text := nullif(trim(coalesce(p_codigo,'')),'');
BEGIN
  PERFORM public._calidad_assert_admin();
  IF v_cod IS NULL THEN RAISE EXCEPTION 'El código es obligatorio'; END IF;
  IF nullif(trim(coalesce(p_nombre,'')),'') IS NULL THEN RAISE EXCEPTION 'El nombre es obligatorio'; END IF;
  INSERT INTO tms_bodegas_softland (codigo, nombre, estado, es_destino_dictamen, activo, orden, updated_at)
  VALUES (v_cod, trim(p_nombre),
          CASE WHEN upper(coalesce(p_estado,''))='TRANSITORIO' THEN 'TRANSITORIO' ELSE 'DISPONIBLE' END,
          coalesce(p_es_destino,false), coalesce(p_activo,true), coalesce(p_orden,100), now())
  ON CONFLICT (codigo) DO UPDATE SET
    nombre = EXCLUDED.nombre, estado = EXCLUDED.estado,
    es_destino_dictamen = EXCLUDED.es_destino_dictamen, activo = EXCLUDED.activo,
    orden = EXCLUDED.orden, updated_at = now();
  RETURN jsonb_build_object('codigo', v_cod);
END;
$function$;

CREATE OR REPLACE FUNCTION public.eliminar_bodega_softland(p_codigo text)
 RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
BEGIN
  PERFORM public._calidad_assert_admin();
  DELETE FROM tms_bodegas_softland WHERE codigo = p_codigo;
  RETURN jsonb_build_object('codigo', p_codigo, 'deleted', true);
END;
$function$;

-- ── Recrear crear_accion_calidad para guardar la bodega destino del ítem ─────
CREATE OR REPLACE FUNCTION public.crear_accion_calidad(
  p_item_id uuid, p_tipo_accion text, p_area text, p_descripcion text DEFAULT NULL,
  p_prioridad text DEFAULT 'NORMAL', p_fecha_limite date DEFAULT NULL
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE
  v_user record; v_item tms_monitoreo_items; v_id uuid; v_folio text;
  v_year text := to_char(current_date, 'YYYY'); v_max int;
  v_prio text := CASE WHEN upper(coalesce(p_prioridad,''))='URGENTE' THEN 'URGENTE' ELSE 'NORMAL' END;
BEGIN
  PERFORM public._monitoreo_assert_permiso();
  IF NOT EXISTS (SELECT 1 FROM tms_areas_calidad WHERE codigo = p_area) THEN
    RAISE EXCEPTION 'Área inválida: %', coalesce(p_area,'null');
  END IF;
  SELECT id, nombre INTO v_user FROM tms_usuarios WHERE auth_uid = auth.uid() AND activo = true;
  SELECT * INTO v_item FROM tms_monitoreo_items WHERE id = p_item_id;
  PERFORM pg_advisory_xact_lock(hashtext('calidad_accion_folio'));
  SELECT coalesce(max((regexp_replace(folio, '^ACC-\d{4}-', ''))::int), 0) INTO v_max
    FROM tms_calidad_acciones WHERE folio LIKE 'ACC-' || v_year || '-%';
  v_folio := 'ACC-' || v_year || '-' || lpad((v_max + 1)::text, 4, '0');
  INSERT INTO tms_calidad_acciones
    (folio, item_id, codigo_producto, producto, partida, ubicacion, cantidad, dictamen,
     tipo_accion, area_responsable, descripcion, prioridad, fecha_limite, estado,
     bodega_destino, creado_por, creado_nombre)
  VALUES
    (v_folio, p_item_id, v_item.codigo_producto, v_item.producto, v_item.partida, v_item.ubicacion,
     v_item.cantidad, v_item.dictamen, p_tipo_accion, p_area, nullif(trim(coalesce(p_descripcion,'')),''),
     v_prio, p_fecha_limite, 'PENDIENTE', v_item.bodega_destino, v_user.id, v_user.nombre)
  RETURNING id INTO v_id;
  INSERT INTO tms_notificaciones (tipo, titulo, mensaje, destinatario_rol, payload, origen)
  VALUES ('ACCION_CALIDAD',
    CASE WHEN v_prio='URGENTE' THEN 'URGENTE: acción de Calidad asignada' ELSE 'Nueva acción de Calidad asignada' END,
    format('%s [%s] para %s (%s): %s', v_folio, p_tipo_accion, coalesce(v_item.codigo_producto,'—'),
           (SELECT label FROM tms_areas_calidad WHERE codigo = p_area),
           coalesce(nullif(trim(coalesce(p_descripcion,'')),''), 'sin descripción')),
    NULL, jsonb_build_object('accion_id', v_id, 'folio', v_folio, 'area', p_area, 'tipo_accion', p_tipo_accion, 'urgente', v_prio='URGENTE'),
    'calidad_acciones');
  RETURN jsonb_build_object('id', v_id, 'folio', v_folio, 'estado', 'PENDIENTE');
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.guardar_bodega_softland(text, text, text, boolean, boolean, int) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.eliminar_bodega_softland(text) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.guardar_bodega_softland(text, text, text, boolean, boolean, int) TO authenticated, service_role;
GRANT  EXECUTE ON FUNCTION public.eliminar_bodega_softland(text) TO authenticated, service_role;
