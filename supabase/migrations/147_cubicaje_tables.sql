-- ============================================================
-- MIGRACION: Crear y blindar tablas de cubicaje
-- Objetivo: asegurar que Cubicaje siempre pueda guardar pesos
--            y dimensiones aunque las tablas no existan.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.tms_pesos (
  codigo_producto text PRIMARY KEY,
  descripcion text,
  peso_unitario numeric DEFAULT 0 CHECK (peso_unitario >= 0),
  largo numeric DEFAULT 0 CHECK (largo >= 0),
  ancho numeric DEFAULT 0 CHECK (ancho >= 0),
  alto numeric DEFAULT 0 CHECK (alto >= 0),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tms_pesos_updated_at
  ON public.tms_pesos (updated_at DESC);

CREATE TABLE IF NOT EXISTS public.tms_cubicaje_historial (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo_producto text NOT NULL,
  peso numeric CHECK (peso >= 0),
  largo numeric CHECK (largo >= 0),
  ancho numeric CHECK (ancho >= 0),
  alto numeric CHECK (alto >= 0),
  tipo_empaque text,
  usuario_id uuid,
  observaciones text,
  created_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tms_cubicaje_historial_codigo
  ON public.tms_cubicaje_historial (codigo_producto);

CREATE INDEX IF NOT EXISTS idx_tms_cubicaje_historial_created_at
  ON public.tms_cubicaje_historial (created_at DESC);

ALTER TABLE public.tms_pesos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tms_cubicaje_historial ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'tms_pesos'
      AND policyname = 'auth_all_pesos'
  ) THEN
    EXECUTE 'CREATE POLICY "auth_all_pesos" ON public.tms_pesos FOR ALL USING (auth.role() = ''authenticated'') WITH CHECK (auth.role() = ''authenticated'')';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'tms_cubicaje_historial'
      AND policyname = 'auth_all_cubicaje'
  ) THEN
    EXECUTE 'CREATE POLICY "auth_all_cubicaje" ON public.tms_cubicaje_historial FOR ALL USING (auth.role() = ''authenticated'') WITH CHECK (auth.role() = ''authenticated'')';
  END IF;
END $$;
