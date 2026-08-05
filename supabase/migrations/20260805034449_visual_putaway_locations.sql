-- Put Away visual: registra la ubicación asignada sin tocar el inventario
-- físico ni las cantidades de wms_ubicaciones.

CREATE TABLE IF NOT EXISTS public.wms_putaway_ubicaciones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ubicacion text NOT NULL,
  codigo text NOT NULL,
  descripcion text,
  serie text,
  partida text,
  pieza text,
  fecha_vencimiento date,
  talla text,
  color text,
  creado_por uuid REFERENCES public.tms_usuarios(id) ON DELETE SET NULL,
  creado_por_nombre text,
  creado_en timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_putaway_visual_ubicacion
  ON public.wms_putaway_ubicaciones (ubicacion, creado_en DESC);
CREATE INDEX IF NOT EXISTS idx_putaway_visual_codigo
  ON public.wms_putaway_ubicaciones (codigo, creado_en DESC);

ALTER TABLE public.wms_putaway_ubicaciones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS putaway_visual_select ON public.wms_putaway_ubicaciones;
CREATE POLICY putaway_visual_select ON public.wms_putaway_ubicaciones
  FOR SELECT TO authenticated
  USING (public.usuario_tiene_algun_permiso(ARRAY['view_entry', 'process_entry']));

DROP POLICY IF EXISTS putaway_visual_insert ON public.wms_putaway_ubicaciones;
CREATE POLICY putaway_visual_insert ON public.wms_putaway_ubicaciones
  FOR INSERT TO authenticated
  WITH CHECK (public.usuario_tiene_algun_permiso(ARRAY['process_entry']));

REVOKE ALL ON TABLE public.wms_putaway_ubicaciones FROM PUBLIC, anon;
GRANT SELECT, INSERT ON TABLE public.wms_putaway_ubicaciones TO authenticated, service_role;
