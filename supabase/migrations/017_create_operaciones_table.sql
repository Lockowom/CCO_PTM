-- 017_create_operaciones_table.sql
-- Sincronizada desde la BD live (schema_migrations version 20260610192313,
-- nombre original "create_operaciones_table"). Renumerada a 017 para mantener
-- el orden cronológico sin colisionar con 015/016 del repo.
-- Tabla de operaciones/seguimiento de NV (aún no consumida por el frontend).

CREATE TABLE IF NOT EXISTS public.operaciones (
  id SERIAL PRIMARY KEY,
  nv_ptm INTEGER,
  nv_orange TEXT,
  nv_farmapack TEXT,
  factura TEXT,
  guia TEXT,
  varios TEXT,
  vendedor TEXT,
  cliente TEXT,
  centro_costo TEXT,
  fecha_aprobacion DATE,
  fecha_facturacion TEXT,
  fecha_despacho DATE,
  fecha_compromiso DATE,
  transportista TEXT,
  estado TEXT,
  valor_factura NUMERIC,
  costo_flete NUMERIC,
  valor_nv NUMERIC,
  bultos INTEGER,
  numero_envio TEXT,
  incidencia TEXT,
  estado_incidencia TEXT,
  observaciones_incidencia TEXT,
  dias_incidencia INTEGER DEFAULT 0,
  division TEXT,
  empresa_transporte TEXT,
  dias_en_proceso INTEGER DEFAULT 0,
  fecha_estado TIMESTAMPTZ,
  fecha_registro_nv TIMESTAMPTZ,
  fecha_en_proceso DATE,
  fecha_shipping DATE,
  fecha_en_ruta DATE,
  fecha_entregado DATE,
  fillrate TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.operaciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON public.operaciones
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert" ON public.operaciones
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update" ON public.operaciones
  FOR UPDATE USING (true);

CREATE INDEX idx_operaciones_estado ON public.operaciones(estado);
CREATE INDEX idx_operaciones_fecha_despacho ON public.operaciones(fecha_despacho);
CREATE INDEX idx_operaciones_vendedor ON public.operaciones(vendedor);
CREATE INDEX idx_operaciones_transportista ON public.operaciones(transportista);
CREATE INDEX idx_operaciones_division ON public.operaciones(division);
