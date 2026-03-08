
-- Tabla para almacenar el historial de N.V. eliminadas manualmente
-- Esto evita que se vuelvan a importar accidentalmente durante la carga masiva diaria

CREATE TABLE IF NOT EXISTS public.tms_nv_eliminadas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nv TEXT NOT NULL,
    fecha_eliminacion TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    usuario_elimino UUID REFERENCES auth.users(id),
    motivo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Crear índice para búsquedas rápidas por NV
CREATE INDEX IF NOT EXISTS idx_tms_nv_eliminadas_nv ON public.tms_nv_eliminadas(nv);

-- Habilitar RLS
ALTER TABLE public.tms_nv_eliminadas ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso
-- Permitir lectura a usuarios autenticados (para que DataImport pueda verificar)
CREATE POLICY "Usuarios autenticados pueden ver N.V. eliminadas" 
ON public.tms_nv_eliminadas FOR SELECT 
TO authenticated 
USING (true);

-- Permitir inserción a usuarios autenticados (para que SalesOrders pueda registrar)
CREATE POLICY "Usuarios autenticados pueden registrar N.V. eliminadas" 
ON public.tms_nv_eliminadas FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Comentarios
COMMENT ON TABLE public.tms_nv_eliminadas IS 'Registro de Notas de Venta eliminadas manualmente para evitar re-importación';
