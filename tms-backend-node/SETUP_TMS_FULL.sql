-- SETUP COMPLETO DEL MÓDULO TMS (Transporte)
-- Ejecuta este script para inicializar todas las tablas necesarias para el Planificador de Rutas

-- 1. Tabla de Conductores
CREATE TABLE IF NOT EXISTS public.tms_conductores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre TEXT NOT NULL,
    apellido TEXT,
    rut TEXT,
    telefono TEXT,
    vehiculo_patente TEXT,
    estado TEXT DEFAULT 'DISPONIBLE', -- DISPONIBLE, EN_RUTA, FUERA_SERVICIO
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabla de Rutas (Cabecera de viaje)
CREATE TABLE IF NOT EXISTS public.tms_rutas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre TEXT NOT NULL, -- Ej: "Ruta Norte - 2024-03-20"
    conductor_id UUID REFERENCES public.tms_conductores(id),
    fecha_inicio TIMESTAMPTZ,
    fecha_fin TIMESTAMPTZ,
    estado TEXT DEFAULT 'PLANIFICADA', -- PLANIFICADA, EN_CURSO, COMPLETADA, CANCELADA
    total_entregas INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabla de Entregas (Puntos de parada)
CREATE TABLE IF NOT EXISTS public.tms_entregas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nv TEXT NOT NULL, -- Número de Nota de Venta / Factura
    cliente TEXT,
    direccion TEXT,
    comuna TEXT,
    latitud DOUBLE PRECISION,
    longitud DOUBLE PRECISION,
    bultos INTEGER DEFAULT 1,
    peso DOUBLE PRECISION DEFAULT 0,
    estado TEXT DEFAULT 'PENDIENTE', -- PENDIENTE, PLANIFICADA, EN_RUTA, ENTREGADO, FALLIDO
    ruta_id UUID REFERENCES public.tms_rutas(id),
    conductor_id UUID REFERENCES public.tms_conductores(id), -- Desnormalizado para consultas rápidas
    fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
    fecha_asignacion TIMESTAMPTZ,
    fecha_entrega TIMESTAMPTZ,
    orden_visita INTEGER -- Orden en la ruta (1, 2, 3...)
);

-- 4. Tabla de Direcciones (Maestro de direcciones geocodificadas para matching)
CREATE TABLE IF NOT EXISTS public.tms_direcciones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    rut TEXT,
    razon_social TEXT,
    nombre TEXT,
    direccion TEXT,
    comuna TEXT,
    ciudad TEXT,
    region TEXT,
    latitud DOUBLE PRECISION,
    longitud DOUBLE PRECISION,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- FORZAR CREACIÓN DE COLUMNAS SI LA TABLA YA EXISTÍA
ALTER TABLE public.tms_direcciones ADD COLUMN IF NOT EXISTS latitud DOUBLE PRECISION;
ALTER TABLE public.tms_direcciones ADD COLUMN IF NOT EXISTS longitud DOUBLE PRECISION;


-- 5. Habilitar Realtime
DO $$
BEGIN
  -- Crear publicación si no existe
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;

  -- Agregar tablas solo si no están ya en la publicación
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'tms_conductores') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE tms_conductores;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'tms_rutas') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE tms_rutas;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'tms_entregas') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE tms_entregas;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'tms_direcciones') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE tms_direcciones;
  END IF;
END
$$;

-- 6. Insertar Datos de Prueba (Seed Data)

-- Conductores (Solo si la tabla está vacía para no re-insertar fantasmas)
INSERT INTO public.tms_conductores (nombre, apellido, rut, telefono, vehiculo_patente, estado)
SELECT 'Juan Pérez', 'Pérez', '12.345.678-9', '+56911111111', 'ABCD-12', 'DISPONIBLE'
WHERE NOT EXISTS (SELECT 1 FROM public.tms_conductores);

INSERT INTO public.tms_conductores (nombre, apellido, rut, telefono, vehiculo_patente, estado)
SELECT 'María González', 'González', '9.876.543-2', '+56922222222', 'WXYZ-99', 'DISPONIBLE'
WHERE NOT EXISTS (SELECT 1 FROM public.tms_conductores);

INSERT INTO public.tms_conductores (nombre, apellido, rut, telefono, vehiculo_patente, estado)
SELECT 'Carlos López', 'López', '15.555.555-5', '+56933333333', 'JJKK-55', 'EN_RUTA'
WHERE NOT EXISTS (SELECT 1 FROM public.tms_conductores);

-- Direcciones Maestras (Para auto-geocoding)
INSERT INTO public.tms_direcciones (rut, razon_social, nombre, direccion, comuna, latitud, longitud) VALUES
('76.111.111-1', 'Farmacias Ahumada', 'Local Providencia', 'Av. Providencia 1234', 'Providencia', -33.426280, -70.610930),
('76.222.222-2', 'Hospital Salvador', 'Hospital', 'Av. Salvador 364', 'Providencia', -33.439500, -70.624000),
('76.333.333-3', 'Cliente Centro', 'Oficina Central', 'Alameda 1000', 'Santiago', -33.444000, -70.650000)
ON CONFLICT DO NOTHING;

-- Entregas Pendientes
-- Borramos algunas para reinicializar si ya existen con datos viejos
DELETE FROM public.tms_entregas WHERE nv LIKE 'TEST-NV%';

INSERT INTO public.tms_entregas (nv, cliente, direccion, comuna, latitud, longitud, estado, bultos) VALUES
('TEST-NV-1001', 'Farmacias Ahumada', 'Av. Providencia 1234', 'Providencia', -33.426280, -70.610930, 'PENDIENTE', 5),
('TEST-NV-1002', 'Hospital Salvador', 'Av. Salvador 364', 'Providencia', -33.439500, -70.624000, 'PENDIENTE', 12),
('TEST-NV-1003', 'Cliente Centro', 'Alameda 1000', 'Santiago', -33.444000, -70.650000, 'PENDIENTE', 3),
('TEST-NV-1004', 'Cliente Sin Coordenadas', 'Calle Nueva 555', 'Maipú', NULL, NULL, 'PENDIENTE', 2)
ON CONFLICT DO NOTHING;

-- 7. Configuración de Módulos (Asegurar visibilidad)
CREATE TABLE IF NOT EXISTS public.tms_modules_config (
    id TEXT PRIMARY KEY,
    enabled BOOLEAN DEFAULT TRUE,
    label TEXT
);

INSERT INTO public.tms_modules_config (id, enabled, label) VALUES
('tms', true, 'TMS (Transporte)'),
('tms-dashboard', true, 'Dashboard TMS'),
('tms-routes', true, 'Planificar Rutas'),
('tms-control', true, 'Torre de Control'),
('tms-drivers', true, 'Conductores'),
('tms-mobile', true, 'App Móvil')
ON CONFLICT (id) DO UPDATE SET enabled = EXCLUDED.enabled;

-- Políticas RLS Simples (Dev)
ALTER TABLE public.tms_conductores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tms_rutas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tms_entregas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tms_direcciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tms_modules_config ENABLE ROW LEVEL SECURITY;

-- Policies para tms_modules_config
DROP POLICY IF EXISTS "Anon Select Config" ON public.tms_modules_config;
CREATE POLICY "Anon Select Config" ON public.tms_modules_config FOR SELECT USING (true);

-- Policies para tablas TMS (Drop if exists para evitar errores al re-ejecutar)
DROP POLICY IF EXISTS "Anon Select TMS" ON public.tms_conductores;
DROP POLICY IF EXISTS "Anon Insert TMS" ON public.tms_conductores;
DROP POLICY IF EXISTS "Anon Update TMS" ON public.tms_conductores;

CREATE POLICY "Anon Select TMS" ON public.tms_conductores FOR SELECT USING (true);
CREATE POLICY "Anon Insert TMS" ON public.tms_conductores FOR INSERT WITH CHECK (true);
CREATE POLICY "Anon Update TMS" ON public.tms_conductores FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Anon Select TMS Rutas" ON public.tms_rutas;
DROP POLICY IF EXISTS "Anon Insert TMS Rutas" ON public.tms_rutas;
DROP POLICY IF EXISTS "Anon Update TMS Rutas" ON public.tms_rutas;

CREATE POLICY "Anon Select TMS Rutas" ON public.tms_rutas FOR SELECT USING (true);
CREATE POLICY "Anon Insert TMS Rutas" ON public.tms_rutas FOR INSERT WITH CHECK (true);
CREATE POLICY "Anon Update TMS Rutas" ON public.tms_rutas FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Anon Select TMS Entregas" ON public.tms_entregas;
DROP POLICY IF EXISTS "Anon Insert TMS Entregas" ON public.tms_entregas;
DROP POLICY IF EXISTS "Anon Update TMS Entregas" ON public.tms_entregas;

CREATE POLICY "Anon Select TMS Entregas" ON public.tms_entregas FOR SELECT USING (true);
CREATE POLICY "Anon Insert TMS Entregas" ON public.tms_entregas FOR INSERT WITH CHECK (true);
CREATE POLICY "Anon Update TMS Entregas" ON public.tms_entregas FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Anon Select TMS Direcciones" ON public.tms_direcciones;
DROP POLICY IF EXISTS "Anon Insert TMS Direcciones" ON public.tms_direcciones;
DROP POLICY IF EXISTS "Anon Update TMS Direcciones" ON public.tms_direcciones;

CREATE POLICY "Anon Select TMS Direcciones" ON public.tms_direcciones FOR SELECT USING (true);
CREATE POLICY "Anon Insert TMS Direcciones" ON public.tms_direcciones FOR INSERT WITH CHECK (true);
CREATE POLICY "Anon Update TMS Direcciones" ON public.tms_direcciones FOR UPDATE USING (true);
