-- ============================================================
-- MIGRACIÓN 010: Ficha Técnica del Producto (módulo /queries/datasheet)
-- Fecha: 2026-06-01
-- App: v1.4.17
-- ============================================================
-- Objetos que se aplicaron directamente a la BD live al construir la feature
-- y que NO estaban versionados. Este archivo es la FUENTE DE VERDAD para
-- recrearlos (entornos nuevos / restore). Es IDEMPOTENTE y refleja el estado
-- ya existente en producción: NO modifica datos ni cambia el comportamiento
-- actual; aplicarlo sobre la BD live es un no-op seguro.
--
-- Contenido:
--   1) Tabla public.tms_fichas_imagenes + RLS (lectura authenticated,
--      escritura solo can_manage_fichas()).
--   2) Helper can_manage_fichas() y RPCs get_ficha_producto(text) /
--      search_productos(text,int)  — SECURITY DEFINER, search_path=public,
--      EXECUTE revocado a PUBLIC/anon (solo authenticated/service_role).
--   3) Bucket Storage público 'fichas-productos' (8MB, solo imágenes) y
--      políticas de subida/edición/borrado restringidas a can_manage_fichas().
--      (No hay política SELECT en storage: los URLs públicos sirven sin listar.)
-- ============================================================

-- ─────────────────────────────────────────────────────────────────────────
-- 1) TABLA + RLS
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.tms_fichas_imagenes (
  id              uuid        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo_producto text        NOT NULL,
  imagen_url      text        NOT NULL,
  storage_path    text        NOT NULL,
  descripcion     text,
  es_principal    boolean     NOT NULL DEFAULT false,
  orden           integer     NOT NULL DEFAULT 0,
  creado_por      uuid,
  creado_nombre   text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fichas_imagenes_codigo
  ON public.tms_fichas_imagenes (codigo_producto);

ALTER TABLE public.tms_fichas_imagenes ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.tms_fichas_imagenes TO authenticated;

-- Lectura: cualquier usuario autenticado puede ver las fichas.
DROP POLICY IF EXISTS fichas_select_auth ON public.tms_fichas_imagenes;
CREATE POLICY fichas_select_auth ON public.tms_fichas_imagenes
  FOR SELECT TO authenticated
  USING (true);

-- Escritura: solo quien tenga permiso de gestión de fichas.
DROP POLICY IF EXISTS fichas_insert_admin ON public.tms_fichas_imagenes;
CREATE POLICY fichas_insert_admin ON public.tms_fichas_imagenes
  FOR INSERT TO authenticated
  WITH CHECK (can_manage_fichas());

DROP POLICY IF EXISTS fichas_update_admin ON public.tms_fichas_imagenes;
CREATE POLICY fichas_update_admin ON public.tms_fichas_imagenes
  FOR UPDATE TO authenticated
  USING (can_manage_fichas())
  WITH CHECK (can_manage_fichas());

DROP POLICY IF EXISTS fichas_delete_admin ON public.tms_fichas_imagenes;
CREATE POLICY fichas_delete_admin ON public.tms_fichas_imagenes
  FOR DELETE TO authenticated
  USING (can_manage_fichas());

-- ─────────────────────────────────────────────────────────────────────────
-- 2) FUNCIONES
-- ─────────────────────────────────────────────────────────────────────────

-- ¿El usuario actual puede gestionar fichas? (ADMIN / admin delegado / permiso manage_fichas)
CREATE OR REPLACE FUNCTION public.can_manage_fichas()
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
        OR (r.permisos_json ? 'manage_fichas')
      )
  );
$function$;

-- Ficha completa de un código: cabecera + partidas + imágenes.
CREATE OR REPLACE FUNCTION public.get_ficha_producto(p_codigo text)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_code     text := upper(trim(p_codigo));
  v_header   jsonb;
  v_partidas jsonb;
  v_imagenes jsonb;
BEGIN
  SELECT to_jsonb(h) INTO v_header FROM (
    SELECT codigo_producto, producto, unidad_medida FROM tms_partidas  WHERE upper(codigo_producto) = v_code
    UNION ALL
    SELECT codigo_producto, producto, unidad_medida FROM tms_series    WHERE upper(codigo_producto) = v_code
    UNION ALL
    SELECT codigo_producto, producto, unidad_medida FROM tms_farmapack WHERE upper(codigo_producto) = v_code
    LIMIT 1
  ) h;

  SELECT coalesce(jsonb_agg(to_jsonb(p) ORDER BY p.fecha_vencimiento NULLS LAST), '[]'::jsonb)
  INTO v_partidas FROM (
    SELECT partida, fecha_vencimiento, unidad_medida,
           disponible, reserva, transitoria, consignacion, stock_total
    FROM tms_partidas WHERE upper(codigo_producto) = v_code
  ) p;

  SELECT coalesce(jsonb_agg(to_jsonb(i) ORDER BY i.es_principal DESC, i.orden, i.created_at), '[]'::jsonb)
  INTO v_imagenes FROM (
    SELECT id, imagen_url, storage_path, descripcion, es_principal, orden, created_at
    FROM tms_fichas_imagenes WHERE upper(codigo_producto) = v_code
  ) i;

  RETURN jsonb_build_object(
    'codigo',   v_code,
    'header',   v_header,
    'partidas', v_partidas,
    'imagenes', v_imagenes
  );
END;
$function$;

-- Búsqueda de productos por código/nombre (con flag tiene_foto).
CREATE OR REPLACE FUNCTION public.search_productos(p_query text, p_limit integer DEFAULT 30)
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  WITH q AS (SELECT '%' || trim(p_query) || '%' AS term)
  SELECT coalesce(jsonb_agg(row_to_json(t)), '[]'::jsonb)
  FROM (
    SELECT base.codigo_producto,
           max(base.producto)       AS producto,
           max(base.unidad_medida)  AS unidad_medida,
           coalesce(bool_or(img.has_img), false) AS tiene_foto
    FROM (
      SELECT codigo_producto, producto, unidad_medida FROM tms_partidas
      UNION ALL SELECT codigo_producto, producto, unidad_medida FROM tms_series
      UNION ALL SELECT codigo_producto, producto, unidad_medida FROM tms_farmapack
    ) base
    LEFT JOIN LATERAL (
      SELECT true AS has_img FROM tms_fichas_imagenes f
      WHERE f.codigo_producto = base.codigo_producto LIMIT 1
    ) img ON true
    CROSS JOIN q
    WHERE base.codigo_producto ILIKE q.term OR base.producto ILIKE q.term
    GROUP BY base.codigo_producto
    ORDER BY base.codigo_producto
    LIMIT p_limit
  ) t;
$function$;

-- Grants: SECURITY DEFINER NO ejecutable por anon (igual que search_batches/bulk_upsert).
REVOKE EXECUTE ON FUNCTION public.can_manage_fichas()                FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_ficha_producto(text)           FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.search_productos(text, integer)    FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.can_manage_fichas()                TO authenticated, service_role;
GRANT  EXECUTE ON FUNCTION public.get_ficha_producto(text)           TO authenticated, service_role;
GRANT  EXECUTE ON FUNCTION public.search_productos(text, integer)    TO authenticated, service_role;

-- ─────────────────────────────────────────────────────────────────────────
-- 3) STORAGE: bucket público + políticas de escritura restringidas
-- ─────────────────────────────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('fichas-productos', 'fichas-productos', true, 8388608,
        ARRAY['image/jpeg','image/png','image/webp','image/heic','image/heif'])
ON CONFLICT (id) DO NOTHING;

-- Subir / editar / borrar objetos del bucket: solo gestores de fichas.
-- (No se crea política SELECT: el bucket es público, los URLs sirven sin listar.)
DROP POLICY IF EXISTS fichas_obj_insert ON storage.objects;
CREATE POLICY fichas_obj_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'fichas-productos' AND can_manage_fichas());

DROP POLICY IF EXISTS fichas_obj_update ON storage.objects;
CREATE POLICY fichas_obj_update ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'fichas-productos' AND can_manage_fichas())
  WITH CHECK (bucket_id = 'fichas-productos' AND can_manage_fichas());

DROP POLICY IF EXISTS fichas_obj_delete ON storage.objects;
CREATE POLICY fichas_obj_delete ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'fichas-productos' AND can_manage_fichas());
