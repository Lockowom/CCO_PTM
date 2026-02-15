-- Tablas para módulo de Layout de Bodega
CREATE TABLE IF NOT EXISTS public.wms_layout (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ubicacion TEXT NOT NULL,
  pasillo TEXT NOT NULL,
  columna INTEGER NOT NULL,
  nivel INTEGER NOT NULL,
  estado TEXT DEFAULT 'DISPONIBLE',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.wms_ubicaciones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ubicacion TEXT NOT NULL,
  codigo TEXT,
  descripcion TEXT,
  cantidad INTEGER DEFAULT 0,
  talla TEXT,
  color TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wms_layout_ubicacion ON public.wms_layout(ubicacion);
CREATE INDEX IF NOT EXISTS idx_wms_ubicaciones_ubicacion ON public.wms_ubicaciones(ubicacion);
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'wms_layout_ubicacion_key' 
      AND conrelid = 'public.wms_layout'::regclass
  ) THEN
    ALTER TABLE public.wms_layout ADD CONSTRAINT wms_layout_ubicacion_key UNIQUE (ubicacion);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'wms_ubicaciones_ubicacion_codigo_key' 
      AND conrelid = 'public.wms_ubicaciones'::regclass
  ) THEN
    ALTER TABLE public.wms_ubicaciones ADD CONSTRAINT wms_ubicaciones_ubicacion_codigo_key UNIQUE (ubicacion, codigo);
  END IF;
END $$;

-- Datos de prueba (Pasillos A y B)
INSERT INTO public.wms_layout (ubicacion, pasillo, columna, nivel, estado) VALUES
('A-01-01', 'A', 1, 1, 'DISPONIBLE'),
('A-02-01', 'A', 2, 1, 'DISPONIBLE'),
('A-03-01', 'A', 3, 1, 'OCUPADO'),
('A-01-02', 'A', 1, 2, 'NO DISPONIBLE'),
('A-02-02', 'A', 2, 2, 'DISPONIBLE'),
('A-03-02', 'A', 3, 2, 'DISPONIBLE'),
('B-01-01', 'B', 1, 1, 'DISPONIBLE'),
('B-02-01', 'B', 2, 1, 'OCUPADO'),
('B-03-01', 'B', 3, 1, 'DISPONIBLE'),
('B-01-02', 'B', 1, 2, 'DISPONIBLE'),
('B-02-02', 'B', 2, 2, 'DISPONIBLE'),
('B-03-02', 'B', 3, 2, 'NO DISPONIBLE')
ON CONFLICT DO NOTHING;

INSERT INTO public.wms_ubicaciones (ubicacion, codigo, descripcion, cantidad, talla, color) VALUES
('A-03-01', 'SKU-100', 'Zapatilla Running', 25, '42', 'Azul'),
('B-02-01', 'SKU-200', 'Polera Deportiva', 40, 'M', 'Negro'),
('B-01-02', 'SKU-300', 'Pantalón Outdoor', 18, 'L', 'Verde')
ON CONFLICT DO NOTHING;
