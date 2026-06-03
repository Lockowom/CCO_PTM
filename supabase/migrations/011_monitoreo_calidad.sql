-- ============================================================
-- MIGRACIÓN 011: Monitoreo a Calidad (módulo /quality/monitoreo)
-- Fecha: 2026-06-03
-- ============================================================
-- Implementa la celda "Inventario · Estancia · Monitoreo rutinario a Calidad"
-- de la matriz de procesos: un informe persistente de monitoreo, el dictamen
-- técnico de Calidad, un overlay de estado de calidad por producto/lote/ubicación
-- que SOBREVIVE a la recarga diaria del stock (snapshot 08:30→08:30) y notificaciones
-- de movimiento sistémico al admin/inventario.
--
-- Es IDEMPOTENTE (CREATE IF NOT EXISTS / OR REPLACE / DROP POLICY IF EXISTS).
-- No modifica datos existentes: solo agrega objetos nuevos.
--
-- Contenido:
--   1) Tablas tms_monitoreo_informes, tms_monitoreo_items, tms_calidad_flags,
--      tms_notificaciones + índices + RLS.
--   2) Helper can_manage_calidad() y trigger updated_at.
--   3) RPCs monitoreo_next_numero(), monitoreo_candidatos(text,bool),
--      monitoreo_dictaminar(...) — SECURITY DEFINER, search_path=public,
--      EXECUTE revocado a PUBLIC/anon.
-- ============================================================

-- ─────────────────────────────────────────────────────────────────────────
-- 0) UTILIDAD: trigger genérico updated_at (idempotente; ya existe en la BD live)
-- ─────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- ─────────────────────────────────────────────────────────────────────────
-- 1) TABLAS
-- ─────────────────────────────────────────────────────────────────────────

-- 1.1 Cabecera del informe de monitoreo entregado a Calidad
CREATE TABLE IF NOT EXISTS public.tms_monitoreo_informes (
  id              uuid        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  numero          text        NOT NULL UNIQUE,                 -- MON-YYYY-NNNN
  fecha           date        NOT NULL DEFAULT current_date,
  analista_id     uuid,
  analista_nombre text,
  bodega          text,
  periodicidad    text        NOT NULL DEFAULT 'ADHOC',        -- SEMANAL|MENSUAL|ADHOC
  periodo_desde   date,
  periodo_hasta   date,
  estado          text        NOT NULL DEFAULT 'BORRADOR',     -- BORRADOR|ENVIADO_CALIDAD|DICTAMINADO|CERRADO
  total_items     integer     NOT NULL DEFAULT 0,
  observaciones   text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- 1.2 Detalle por ítem: hechos del analista + dictamen de Calidad
CREATE TABLE IF NOT EXISTS public.tms_monitoreo_items (
  id                  uuid        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  informe_id          uuid        NOT NULL REFERENCES public.tms_monitoreo_informes(id) ON DELETE CASCADE,
  -- Clave de negocio estable (sobrevive la recarga del snapshot):
  codigo_producto     text        NOT NULL,
  partida             text        NOT NULL DEFAULT '',
  ubicacion           text        NOT NULL DEFAULT '',
  producto            text,
  unidad_medida       text,
  cantidad            numeric     NOT NULL DEFAULT 0,
  estado_inventario   text,                                    -- Disponible|Cuarentena|Reserva|Transitoria|Consignacion
  tipo                text,                                    -- PERECIBLE|NO_PERECIBLE
  fecha_vencimiento   date,
  semaforo            text,                                    -- ROJO|NARANJA|VERDE|NA
  condicion_observada text,
  motivo              text,
  observaciones       text,
  evidencia_url       text,
  -- Bloque dictamen (Calidad):
  dictamen            text,                                    -- LIBERAR|CUARENTENA|RECHAZAR|REPROCESO|BAJA
  accion              text,
  bodega_destino      text,                                    -- p.ej. 5 (servicio técnico) | 99 (basura/baja)
  fecha_limite        date,
  calidad_usuario_id  uuid,
  calidad_nombre      text,
  fecha_dictamen      timestamptz,
  acuse_texto         text,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_monitoreo_items_informe ON public.tms_monitoreo_items (informe_id);
CREATE INDEX IF NOT EXISTS idx_monitoreo_items_codigo  ON public.tms_monitoreo_items (codigo_producto);

-- 1.3 Overlay persistente de estado de calidad (alimenta los badges en pantalla)
CREATE TABLE IF NOT EXISTS public.tms_calidad_flags (
  id                  uuid        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo_producto     text        NOT NULL,
  partida             text        NOT NULL DEFAULT '',
  ubicacion           text        NOT NULL DEFAULT '',
  estado_calidad      text        NOT NULL,                    -- EN_AUDITORIA|CUARENTENA|MALO|LIBERADO
  severidad           integer     NOT NULL DEFAULT 0,          -- 0 liberado · 1 auditoría · 2 cuarentena · 3 malo
  item_id             uuid,
  nota                text,
  vigente             boolean     NOT NULL DEFAULT true,
  actualizado_por     uuid,
  actualizado_nombre  text,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT tms_calidad_flags_clave_unique UNIQUE (codigo_producto, partida, ubicacion)
);

CREATE INDEX IF NOT EXISTS idx_calidad_flags_codigo ON public.tms_calidad_flags (codigo_producto) WHERE vigente;

-- 1.4 Notificaciones persistentes (avisos de movimiento sistémico al admin/inventario)
CREATE TABLE IF NOT EXISTS public.tms_notificaciones (
  id                uuid        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo              text        NOT NULL,                      -- MOV_TRANSITORIA|CALIDAD_DICTAMEN|...
  titulo            text        NOT NULL,
  mensaje           text,
  destinatario_rol  text,                                      -- p.ej. ADMIN (NULL = cualquiera)
  destinatario_id   uuid,
  payload           jsonb,
  leida             boolean     NOT NULL DEFAULT false,
  origen            text,
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notificaciones_no_leidas ON public.tms_notificaciones (created_at DESC) WHERE NOT leida;

-- Triggers updated_at
DROP TRIGGER IF EXISTS trg_monitoreo_informes_updated ON public.tms_monitoreo_informes;
CREATE TRIGGER trg_monitoreo_informes_updated BEFORE UPDATE ON public.tms_monitoreo_informes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_monitoreo_items_updated ON public.tms_monitoreo_items;
CREATE TRIGGER trg_monitoreo_items_updated BEFORE UPDATE ON public.tms_monitoreo_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_calidad_flags_updated ON public.tms_calidad_flags;
CREATE TRIGGER trg_calidad_flags_updated BEFORE UPDATE ON public.tms_calidad_flags
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ─────────────────────────────────────────────────────────────────────────
-- 2) HELPER de autorización
-- ─────────────────────────────────────────────────────────────────────────
-- ¿El usuario actual puede operar el módulo de Calidad/Monitoreo?
-- (ADMIN / admin delegado / permiso manage_quality o manage_monitoreo)
CREATE OR REPLACE FUNCTION public.can_manage_calidad()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.tms_usuarios u
    LEFT JOIN public.tms_roles r ON r.id = u.rol
    WHERE u.auth_uid = auth.uid()
      AND u.activo = true
      AND (
        u.rol = 'ADMIN'
        OR u.es_admin_delegado = true
        OR (r.permisos_json ? 'manage_quality')
        OR (r.permisos_json ? 'manage_monitoreo')
      )
  );
$function$;

-- ─────────────────────────────────────────────────────────────────────────
-- 3) RLS
-- ─────────────────────────────────────────────────────────────────────────
-- Lectura: cualquier autenticado (visibilidad global de estado de calidad).
-- Escritura: solo can_manage_calidad() (analista de inventario y Calidad).

ALTER TABLE public.tms_monitoreo_informes ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tms_monitoreo_informes TO authenticated;
DROP POLICY IF EXISTS monitoreo_informes_select ON public.tms_monitoreo_informes;
CREATE POLICY monitoreo_informes_select ON public.tms_monitoreo_informes FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS monitoreo_informes_write ON public.tms_monitoreo_informes;
CREATE POLICY monitoreo_informes_write ON public.tms_monitoreo_informes FOR INSERT TO authenticated WITH CHECK (can_manage_calidad());
DROP POLICY IF EXISTS monitoreo_informes_update ON public.tms_monitoreo_informes;
CREATE POLICY monitoreo_informes_update ON public.tms_monitoreo_informes FOR UPDATE TO authenticated USING (can_manage_calidad()) WITH CHECK (can_manage_calidad());
DROP POLICY IF EXISTS monitoreo_informes_delete ON public.tms_monitoreo_informes;
CREATE POLICY monitoreo_informes_delete ON public.tms_monitoreo_informes FOR DELETE TO authenticated USING (can_manage_calidad());

ALTER TABLE public.tms_monitoreo_items ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tms_monitoreo_items TO authenticated;
DROP POLICY IF EXISTS monitoreo_items_select ON public.tms_monitoreo_items;
CREATE POLICY monitoreo_items_select ON public.tms_monitoreo_items FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS monitoreo_items_write ON public.tms_monitoreo_items;
CREATE POLICY monitoreo_items_write ON public.tms_monitoreo_items FOR INSERT TO authenticated WITH CHECK (can_manage_calidad());
DROP POLICY IF EXISTS monitoreo_items_update ON public.tms_monitoreo_items;
CREATE POLICY monitoreo_items_update ON public.tms_monitoreo_items FOR UPDATE TO authenticated USING (can_manage_calidad()) WITH CHECK (can_manage_calidad());
DROP POLICY IF EXISTS monitoreo_items_delete ON public.tms_monitoreo_items;
CREATE POLICY monitoreo_items_delete ON public.tms_monitoreo_items FOR DELETE TO authenticated USING (can_manage_calidad());

ALTER TABLE public.tms_calidad_flags ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tms_calidad_flags TO authenticated;
DROP POLICY IF EXISTS calidad_flags_select ON public.tms_calidad_flags;
CREATE POLICY calidad_flags_select ON public.tms_calidad_flags FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS calidad_flags_write ON public.tms_calidad_flags;
CREATE POLICY calidad_flags_write ON public.tms_calidad_flags FOR INSERT TO authenticated WITH CHECK (can_manage_calidad());
DROP POLICY IF EXISTS calidad_flags_update ON public.tms_calidad_flags;
CREATE POLICY calidad_flags_update ON public.tms_calidad_flags FOR UPDATE TO authenticated USING (can_manage_calidad()) WITH CHECK (can_manage_calidad());
DROP POLICY IF EXISTS calidad_flags_delete ON public.tms_calidad_flags;
CREATE POLICY calidad_flags_delete ON public.tms_calidad_flags FOR DELETE TO authenticated USING (can_manage_calidad());

ALTER TABLE public.tms_notificaciones ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tms_notificaciones TO authenticated;
-- Lectura: autenticado (el filtrado por rol/usuario se hace en cliente/Realtime).
DROP POLICY IF EXISTS notificaciones_select ON public.tms_notificaciones;
CREATE POLICY notificaciones_select ON public.tms_notificaciones FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS notificaciones_insert ON public.tms_notificaciones;
CREATE POLICY notificaciones_insert ON public.tms_notificaciones FOR INSERT TO authenticated WITH CHECK (can_manage_calidad());
-- Marcar leída: cualquier autenticado.
DROP POLICY IF EXISTS notificaciones_update ON public.tms_notificaciones;
CREATE POLICY notificaciones_update ON public.tms_notificaciones FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS notificaciones_delete ON public.tms_notificaciones;
CREATE POLICY notificaciones_delete ON public.tms_notificaciones FOR DELETE TO authenticated USING (is_admin());

-- ─────────────────────────────────────────────────────────────────────────
-- 4) RPCs
-- ─────────────────────────────────────────────────────────────────────────

-- 4.1 Próximo correlativo MON-YYYY-NNNN para el año en curso.
CREATE OR REPLACE FUNCTION public.monitoreo_next_numero()
 RETURNS text
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_year text := to_char(current_date, 'YYYY');
  v_max  int;
BEGIN
  SELECT coalesce(max((regexp_replace(numero, '^MON-\d{4}-', ''))::int), 0)
    INTO v_max
  FROM tms_monitoreo_informes
  WHERE numero LIKE 'MON-' || v_year || '-%';
  RETURN 'MON-' || v_year || '-' || lpad((v_max + 1)::text, 4, '0');
END;
$function$;

-- 4.2 Candidatos a monitoreo: stock actual (partidas + farmapack) con ubicación
--     y semáforo de vencimiento calculado. Sirve para prellenar el informe.
CREATE OR REPLACE FUNCTION public.monitoreo_candidatos(p_query text, p_solo_vencimiento boolean DEFAULT false)
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  WITH q AS (SELECT '%' || trim(coalesce(p_query, '')) || '%' AS term),
  base AS (
    SELECT codigo_producto, producto, unidad_medida, partida,
           fecha_vencimiento, disponible, reserva, transitoria, consignacion,
           'PERECIBLE'::text AS tipo
    FROM tms_partidas
    UNION ALL
    SELECT codigo_producto, producto, unidad_medida, lote AS partida,
           fecha_vencimiento, disponible, reserva, transitoria, consignacion,
           'PERECIBLE'::text AS tipo
    FROM tms_farmapack
  ),
  calc AS (
    SELECT b.*,
      CASE
        WHEN b.fecha_vencimiento IS NULL THEN 'NA'
        WHEN b.fecha_vencimiento <= current_date + INTERVAL '30 days' THEN 'ROJO'
        WHEN b.fecha_vencimiento <= current_date + INTERVAL '90 days' THEN 'NARANJA'
        ELSE 'VERDE'
      END AS semaforo,
      (SELECT u.ubicacion FROM wms_ubicaciones u
        WHERE u.codigo = b.codigo_producto AND coalesce(u.cantidad,0) > 0
        ORDER BY u.cantidad DESC LIMIT 1) AS ubicacion
    FROM base b, q
    WHERE b.codigo_producto ILIKE q.term OR b.producto ILIKE q.term
  )
  SELECT coalesce(jsonb_agg(row_to_json(c) ORDER BY c.fecha_vencimiento NULLS LAST), '[]'::jsonb)
  FROM calc c
  WHERE (NOT p_solo_vencimiento) OR c.semaforo IN ('ROJO', 'NARANJA');
$function$;

-- 4.3 Dictamen de Calidad sobre un ítem: persiste el dictamen, actualiza el
--     overlay de estado (tms_calidad_flags) y, si implica movimiento sistémico,
--     genera la notificación al admin/inventario.
CREATE OR REPLACE FUNCTION public.monitoreo_dictaminar(
  p_item_id        uuid,
  p_dictamen       text,
  p_bodega_destino text DEFAULT NULL,
  p_accion         text DEFAULT NULL,
  p_fecha_limite   date DEFAULT NULL,
  p_acuse          text DEFAULT NULL
)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user   record;
  v_item   record;
  v_estado text;
  v_sev    int;
  v_mueve  boolean := false;
BEGIN
  -- Usuario actual + verificación de autoridad de dictamen (manage_quality / admin).
  SELECT u.id, u.nombre, u.rol, u.es_admin_delegado,
         (SELECT permisos_json FROM tms_roles r WHERE r.id = u.rol) AS permisos
    INTO v_user
  FROM tms_usuarios u
  WHERE u.auth_uid = auth.uid() AND u.activo = true;

  IF v_user.id IS NULL THEN
    RAISE EXCEPTION 'Usuario no autenticado';
  END IF;
  IF NOT (v_user.rol = 'ADMIN' OR v_user.es_admin_delegado
          OR (v_user.permisos ? 'manage_quality')) THEN
    RAISE EXCEPTION 'Acceso denegado: se requiere permiso de Calidad (manage_quality)';
  END IF;

  SELECT * INTO v_item FROM tms_monitoreo_items WHERE id = p_item_id;
  IF v_item.id IS NULL THEN
    RAISE EXCEPTION 'Ítem de monitoreo no encontrado';
  END IF;

  -- Mapeo dictamen → estado de calidad + severidad + ¿requiere movimiento?
  CASE upper(p_dictamen)
    WHEN 'LIBERAR'    THEN v_estado := 'LIBERADO';     v_sev := 0; v_mueve := false;
    WHEN 'CUARENTENA' THEN v_estado := 'CUARENTENA';   v_sev := 2; v_mueve := true;
    WHEN 'REPROCESO'  THEN v_estado := 'EN_AUDITORIA'; v_sev := 1; v_mueve := true;
    WHEN 'RECHAZAR'   THEN v_estado := 'MALO';         v_sev := 3; v_mueve := true;
    WHEN 'BAJA'       THEN v_estado := 'MALO';         v_sev := 3; v_mueve := true;
    ELSE RAISE EXCEPTION 'Dictamen inválido: %', p_dictamen;
  END CASE;

  -- 1) Persistir dictamen en el ítem.
  UPDATE tms_monitoreo_items
     SET dictamen           = upper(p_dictamen),
         accion             = p_accion,
         bodega_destino     = p_bodega_destino,
         fecha_limite       = p_fecha_limite,
         acuse_texto        = p_acuse,
         calidad_usuario_id = v_user.id,
         calidad_nombre     = v_user.nombre,
         fecha_dictamen     = now()
   WHERE id = p_item_id;

  -- 2) Upsert del overlay persistente (sobrevive recargas del snapshot).
  INSERT INTO tms_calidad_flags
    (codigo_producto, partida, ubicacion, estado_calidad, severidad, item_id,
     nota, vigente, actualizado_por, actualizado_nombre)
  VALUES
    (v_item.codigo_producto, coalesce(v_item.partida,''), coalesce(v_item.ubicacion,''),
     v_estado, v_sev, p_item_id, p_acuse, true, v_user.id, v_user.nombre)
  ON CONFLICT (codigo_producto, partida, ubicacion) DO UPDATE
    SET estado_calidad     = EXCLUDED.estado_calidad,
        severidad          = EXCLUDED.severidad,
        item_id            = EXCLUDED.item_id,
        nota               = EXCLUDED.nota,
        vigente            = true,
        actualizado_por    = EXCLUDED.actualizado_por,
        actualizado_nombre = EXCLUDED.actualizado_nombre,
        updated_at         = now();

  -- 3) Notificación de movimiento sistémico al admin/inventario.
  IF v_mueve THEN
    INSERT INTO tms_notificaciones (tipo, titulo, mensaje, destinatario_rol, payload, origen)
    VALUES (
      'MOV_TRANSITORIA',
      'Mover a transitoria: ' || v_item.codigo_producto,
      format('Calidad dictaminó %s. Mover %s uds de %s (lote %s, ubic. %s) a transitoria%s.',
             upper(p_dictamen), v_item.cantidad, v_item.codigo_producto,
             coalesce(v_item.partida,'-'), coalesce(v_item.ubicacion,'-'),
             CASE WHEN p_bodega_destino IS NOT NULL THEN ' bodega ' || p_bodega_destino ELSE '' END),
      'ADMIN',
      jsonb_build_object(
        'codigo_producto', v_item.codigo_producto,
        'partida',         v_item.partida,
        'ubicacion',       v_item.ubicacion,
        'cantidad',        v_item.cantidad,
        'dictamen',        upper(p_dictamen),
        'bodega_destino',  p_bodega_destino,
        'item_id',         p_item_id
      ),
      'monitoreo_calidad'
    );
  END IF;

  RETURN jsonb_build_object(
    'ok', true,
    'estado_calidad', v_estado,
    'requiere_movimiento', v_mueve
  );
END;
$function$;

-- Grants: SECURITY DEFINER NO ejecutable por anon (igual que search_batches/bulk_upsert).
REVOKE EXECUTE ON FUNCTION public.can_manage_calidad()                              FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.monitoreo_next_numero()                           FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.monitoreo_candidatos(text, boolean)               FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.monitoreo_dictaminar(uuid, text, text, text, date, text) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.can_manage_calidad()                              TO authenticated, service_role;
GRANT  EXECUTE ON FUNCTION public.monitoreo_next_numero()                           TO authenticated, service_role;
GRANT  EXECUTE ON FUNCTION public.monitoreo_candidatos(text, boolean)               TO authenticated, service_role;
GRANT  EXECUTE ON FUNCTION public.monitoreo_dictaminar(uuid, text, text, text, date, text) TO authenticated, service_role;
