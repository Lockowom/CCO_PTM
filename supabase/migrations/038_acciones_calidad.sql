-- 038_acciones_calidad.sql
-- "Acciones de Calidad": cuando Calidad dictamina, la ACCIÓN RECOMENDADA (ajuste,
-- baja, transitorio, post-venta, reparación, reacondicionar, opinión experta) se
-- promulga como una TAREA rastreable, asignada a un ÁREA responsable, visible en
-- un tablero compartido para que las otras áreas la vean y la cierren con acuse.

-- ── Áreas (código → roles que pertenecen; para permiso de cierre) ───────────
CREATE TABLE IF NOT EXISTS public.tms_areas_calidad (
  codigo text PRIMARY KEY,
  label  text NOT NULL,
  roles  jsonb NOT NULL DEFAULT '[]'::jsonb,
  orden  int NOT NULL DEFAULT 100
);
ALTER TABLE public.tms_areas_calidad ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.tms_areas_calidad TO authenticated;
DROP POLICY IF EXISTS areas_calidad_select_auth ON public.tms_areas_calidad;
CREATE POLICY areas_calidad_select_auth ON public.tms_areas_calidad
  FOR SELECT USING (auth.role() = 'authenticated');

INSERT INTO public.tms_areas_calidad (codigo, label, roles, orden) VALUES
 ('BODEGA',         'Bodega / Inventario',   '["OPERADOR","OPERARIO","OPERARIO_3","SUPERVISOR","SUPERVISOR_"]'::jsonb, 10),
 ('VENTAS',         'Ventas / Post-venta',   '["VENDEDOR"]'::jsonb, 20),
 ('CALIDAD',        'Calidad / Serv. Técnico','["CONTROL_CALIDAD"]'::jsonb, 30),
 ('GERENCIA',       'Gerencia',              '["GERENCIA"]'::jsonb, 40),
 ('ADMINISTRACION', 'Administración',        '["ADMINISTRACION"]'::jsonb, 50)
ON CONFLICT (codigo) DO UPDATE SET label = EXCLUDED.label, roles = EXCLUDED.roles, orden = EXCLUDED.orden;

-- ── Tabla de acciones ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.tms_calidad_acciones (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  folio           text,
  item_id         uuid REFERENCES public.tms_monitoreo_items(id) ON DELETE SET NULL,
  codigo_producto text,
  producto        text,
  partida         text,
  ubicacion       text,
  cantidad        numeric,
  dictamen        text,
  tipo_accion     text NOT NULL,      -- AJUSTE|BAJA|TRANSITORIO|POST_VENTA|REPARACION|REACONDICIONAR|OPINION_EXPERTA
  area_responsable text NOT NULL REFERENCES public.tms_areas_calidad(codigo),
  descripcion     text,
  prioridad       text NOT NULL DEFAULT 'NORMAL',  -- NORMAL|URGENTE
  fecha_limite    date,
  estado          text NOT NULL DEFAULT 'PENDIENTE', -- PENDIENTE|EN_PROCESO|RESUELTA|ANULADA
  creado_por      uuid,
  creado_nombre   text,
  resuelto_por    uuid,
  resuelto_nombre text,
  resuelto_en     timestamptz,
  resolucion      text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_acciones_estado ON public.tms_calidad_acciones (estado, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_acciones_area   ON public.tms_calidad_acciones (area_responsable, estado);

ALTER TABLE public.tms_calidad_acciones ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.tms_calidad_acciones TO authenticated;
DROP POLICY IF EXISTS acciones_select_auth ON public.tms_calidad_acciones;
CREATE POLICY acciones_select_auth ON public.tms_calidad_acciones
  FOR SELECT USING (auth.role() = 'authenticated');

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables
    WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='tms_calidad_acciones') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.tms_calidad_acciones;
  END IF;
END $$;

-- ── Permiso de visibilidad del tablero + otorgamiento a las áreas ───────────
INSERT INTO public.tms_permisos (id, nombre, modulo)
VALUES ('view_acciones_calidad', 'Ver Acciones de Calidad', 'quality')
ON CONFLICT (id) DO NOTHING;

UPDATE public.tms_roles
   SET permisos_json = permisos_json || '["view_acciones_calidad"]'::jsonb
 WHERE id IN ('CONTROL_CALIDAD','OPERADOR','OPERARIO','OPERARIO_3','SUPERVISOR','SUPERVISOR_','VENDEDOR','GERENCIA','ADMINISTRACION')
   AND NOT (permisos_json ? 'view_acciones_calidad');

-- ── RPC: crear (promulgar) la acción desde un ítem dictaminado ──────────────
CREATE OR REPLACE FUNCTION public.crear_accion_calidad(
  p_item_id      uuid,
  p_tipo_accion  text,
  p_area         text,
  p_descripcion  text DEFAULT NULL,
  p_prioridad    text DEFAULT 'NORMAL',
  p_fecha_limite date DEFAULT NULL
)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user  record;
  v_item  tms_monitoreo_items;
  v_id    uuid;
  v_folio text;
  v_year  text := to_char(current_date, 'YYYY');
  v_max   int;
  v_prio  text := CASE WHEN upper(coalesce(p_prioridad,''))='URGENTE' THEN 'URGENTE' ELSE 'NORMAL' END;
BEGIN
  PERFORM public._monitoreo_assert_permiso();   -- crear acción = potestad de Calidad
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
     tipo_accion, area_responsable, descripcion, prioridad, fecha_limite, estado, creado_por, creado_nombre)
  VALUES
    (v_folio, p_item_id, v_item.codigo_producto, v_item.producto, v_item.partida, v_item.ubicacion,
     v_item.cantidad, v_item.dictamen, p_tipo_accion, p_area, nullif(trim(coalesce(p_descripcion,'')),''),
     v_prio, p_fecha_limite, 'PENDIENTE', v_user.id, v_user.nombre)
  RETURNING id INTO v_id;

  INSERT INTO tms_notificaciones (tipo, titulo, mensaje, destinatario_rol, payload, origen)
  VALUES (
    'ACCION_CALIDAD',
    CASE WHEN v_prio='URGENTE' THEN 'URGENTE: acción de Calidad asignada' ELSE 'Nueva acción de Calidad asignada' END,
    format('%s [%s] para %s (%s): %s',
           v_folio, p_tipo_accion, coalesce(v_item.codigo_producto,'—'),
           (SELECT label FROM tms_areas_calidad WHERE codigo = p_area),
           coalesce(nullif(trim(coalesce(p_descripcion,'')),''), 'sin descripción')),
    NULL,
    jsonb_build_object('accion_id', v_id, 'folio', v_folio, 'area', p_area,
                       'tipo_accion', p_tipo_accion, 'urgente', v_prio='URGENTE'),
    'calidad_acciones'
  );

  RETURN jsonb_build_object('id', v_id, 'folio', v_folio, 'estado', 'PENDIENTE');
END;
$function$;

-- ── RPC: resolver (cerrar) la acción — la cierra el ÁREA responsable o admin ─
CREATE OR REPLACE FUNCTION public.resolver_accion_calidad(
  p_accion_id uuid,
  p_resolucion text,
  p_estado    text DEFAULT 'RESUELTA'   -- EN_PROCESO | RESUELTA
)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user   record;
  v_accion tms_calidad_acciones;
  v_roles  jsonb;
  v_estado text := CASE WHEN upper(coalesce(p_estado,''))='EN_PROCESO' THEN 'EN_PROCESO' ELSE 'RESUELTA' END;
BEGIN
  SELECT u.id, u.nombre, u.rol, u.es_admin_delegado INTO v_user
  FROM tms_usuarios u WHERE u.auth_uid = auth.uid() AND u.activo = true;
  IF v_user.id IS NULL THEN RAISE EXCEPTION 'Usuario no autenticado'; END IF;

  SELECT * INTO v_accion FROM tms_calidad_acciones WHERE id = p_accion_id;
  IF v_accion.id IS NULL THEN RAISE EXCEPTION 'Acción % no encontrada', p_accion_id; END IF;
  IF v_accion.estado = 'ANULADA' THEN RAISE EXCEPTION 'La acción está anulada'; END IF;

  SELECT roles INTO v_roles FROM tms_areas_calidad WHERE codigo = v_accion.area_responsable;
  IF NOT (v_user.rol = 'ADMIN' OR v_user.es_admin_delegado OR coalesce(v_roles ? v_user.rol, false)) THEN
    RAISE EXCEPTION 'Solo el área responsable (%) o un administrador puede resolver esta acción', v_accion.area_responsable;
  END IF;

  IF v_estado = 'RESUELTA' AND nullif(trim(coalesce(p_resolucion,'')),'') IS NULL THEN
    RAISE EXCEPTION 'Indica qué se hizo (resolución) para cerrar la acción';
  END IF;

  UPDATE tms_calidad_acciones
     SET estado = v_estado,
         resolucion = coalesce(nullif(trim(coalesce(p_resolucion,'')),''), resolucion),
         resuelto_por = CASE WHEN v_estado='RESUELTA' THEN v_user.id ELSE resuelto_por END,
         resuelto_nombre = CASE WHEN v_estado='RESUELTA' THEN v_user.nombre ELSE resuelto_nombre END,
         resuelto_en = CASE WHEN v_estado='RESUELTA' THEN now() ELSE resuelto_en END,
         updated_at = now()
   WHERE id = p_accion_id;

  RETURN jsonb_build_object('id', p_accion_id, 'estado', v_estado);
END;
$function$;

-- ── RPC: anular (Calidad/admin) ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.anular_accion_calidad(p_accion_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_a tms_calidad_acciones;
BEGIN
  PERFORM public._monitoreo_assert_permiso();
  SELECT * INTO v_a FROM tms_calidad_acciones WHERE id = p_accion_id;
  IF v_a.id IS NULL THEN RAISE EXCEPTION 'Acción % no encontrada', p_accion_id; END IF;
  IF v_a.estado = 'RESUELTA' THEN RAISE EXCEPTION 'La acción ya fue resuelta; no se puede anular'; END IF;
  UPDATE tms_calidad_acciones SET estado='ANULADA', updated_at=now() WHERE id = p_accion_id;
  RETURN jsonb_build_object('id', p_accion_id, 'estado', 'ANULADA');
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.crear_accion_calidad(uuid, text, text, text, text, date) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.resolver_accion_calidad(uuid, text, text)                FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.anular_accion_calidad(uuid)                              FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.crear_accion_calidad(uuid, text, text, text, text, date) TO authenticated, service_role;
GRANT  EXECUTE ON FUNCTION public.resolver_accion_calidad(uuid, text, text)                TO authenticated, service_role;
GRANT  EXECUTE ON FUNCTION public.anular_accion_calidad(uuid)                              TO authenticated, service_role;
