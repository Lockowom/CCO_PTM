-- Pre-requisitos:
-- - Ejecutar previamente SETUP_LAYOUT.sql para crear wms_layout y wms_ubicaciones
-- - Asegurar índice y unique keys existentes
-- 
-- Objetivo:
-- - Integridad referencial entre wms_ubicaciones.ubicacion y wms_layout.ubicacion
-- - Reforzar RLS y políticas mínimas para entorno anon (ajustar en producción)
-- - Índices adicionales para performance en consultas por código y estado

-- FK: ubicaciones deben existir en layout
ALTER TABLE public.wms_ubicaciones
  DROP CONSTRAINT IF EXISTS fk_wms_ubicaciones_layout,
  ADD CONSTRAINT fk_wms_ubicaciones_layout
  FOREIGN KEY (ubicacion) REFERENCES public.wms_layout(ubicacion)
  ON UPDATE CASCADE ON DELETE CASCADE;

-- Índices útiles
CREATE INDEX IF NOT EXISTS idx_wms_ubicaciones_codigo ON public.wms_ubicaciones(codigo);
CREATE INDEX IF NOT EXISTS idx_wms_layout_estado ON public.wms_layout(estado);

ALTER TABLE public.wms_ubicaciones
  ADD COLUMN IF NOT EXISTS serie TEXT,
  ADD COLUMN IF NOT EXISTS partida TEXT,
  ADD COLUMN IF NOT EXISTS pieza TEXT,
  ADD COLUMN IF NOT EXISTS fecha_vencimiento DATE;

CREATE INDEX IF NOT EXISTS idx_wms_ubicaciones_serie ON public.wms_ubicaciones(serie);
CREATE INDEX IF NOT EXISTS idx_wms_ubicaciones_partida ON public.wms_ubicaciones(partida);

-- RLS
ALTER TABLE public.wms_layout ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wms_ubicaciones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anon Select Layout" ON public.wms_layout;
DROP POLICY IF EXISTS "Anon Insert Layout" ON public.wms_layout;
DROP POLICY IF EXISTS "Anon Update Layout" ON public.wms_layout;
DROP POLICY IF EXISTS "Anon Select Ubicaciones" ON public.wms_ubicaciones;
DROP POLICY IF EXISTS "Anon Insert Ubicaciones" ON public.wms_ubicaciones;
DROP POLICY IF EXISTS "Anon Update Ubicaciones" ON public.wms_ubicaciones;

CREATE POLICY "Anon Select Layout" ON public.wms_layout FOR SELECT TO anon USING (true);
CREATE POLICY "Anon Insert Layout" ON public.wms_layout FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon Update Layout" ON public.wms_layout FOR UPDATE TO anon USING (true);
CREATE POLICY "Anon Select Ubicaciones" ON public.wms_ubicaciones FOR SELECT TO anon USING (true);
CREATE POLICY "Anon Insert Ubicaciones" ON public.wms_ubicaciones FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon Update Ubicaciones" ON public.wms_ubicaciones FOR UPDATE TO anon USING (true);
