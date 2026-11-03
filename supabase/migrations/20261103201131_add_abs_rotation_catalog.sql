-- Catálogo operativo importado desde la pestaña "ABS ROTACION".
-- Es informativo para Ubicaciones: no modifica stock, ERP, Calidad ni
-- las reglas de ubicación existentes.
CREATE TABLE IF NOT EXISTS public.wms_sku_rotacion (
  codigo text PRIMARY KEY,
  abs_categoria text NOT NULL,
  rotacion text NOT NULL,
  fuente_actualizada_en timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT wms_sku_rotacion_codigo_check
    CHECK (codigo = upper(btrim(codigo)) AND codigo <> ''),
  CONSTRAINT wms_sku_rotacion_abs_categoria_check
    CHECK (abs_categoria IN ('A', 'B', 'S')),
  CONSTRAINT wms_sku_rotacion_rotacion_check
    CHECK (rotacion IN ('MUY ALTA', 'ALTA', 'MEDIA', 'BAJA', 'MUY BAJA', 'SIN ROTACIÓN'))
);

COMMENT ON TABLE public.wms_sku_rotacion IS
  'Catálogo informativo de ABS y rotación importado de Google Sheets. La ausencia de un SKU significa Sin clasificación ABS aún.';

ALTER TABLE public.wms_sku_rotacion ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS wms_sku_rotacion_authenticated_select ON public.wms_sku_rotacion;
CREATE POLICY wms_sku_rotacion_authenticated_select
  ON public.wms_sku_rotacion
  FOR SELECT
  TO authenticated
  USING (true);

REVOKE ALL ON TABLE public.wms_sku_rotacion FROM anon;
REVOKE ALL ON TABLE public.wms_sku_rotacion FROM authenticated;
GRANT SELECT ON TABLE public.wms_sku_rotacion TO authenticated;
