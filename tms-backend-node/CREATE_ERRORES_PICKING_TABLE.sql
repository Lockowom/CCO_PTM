
-- Tabla para registrar errores de picking detectados en packing
CREATE TABLE IF NOT EXISTS public.tms_errores_picking (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nv TEXT NOT NULL,
    usuario_picking_id UUID REFERENCES auth.users(id),
    usuario_picking_nombre TEXT,
    usuario_packing_id UUID REFERENCES auth.users(id), -- Quien detectó el error
    usuario_packing_nombre TEXT,
    motivo TEXT,
    fecha_deteccion TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_tms_errores_picking_nv ON public.tms_errores_picking(nv);
CREATE INDEX IF NOT EXISTS idx_tms_errores_picking_usuario_picking ON public.tms_errores_picking(usuario_picking_id);

-- RLS
ALTER TABLE public.tms_errores_picking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura errores para autenticados" ON public.tms_errores_picking FOR SELECT TO authenticated USING (true);
CREATE POLICY "Insercion errores para autenticados" ON public.tms_errores_picking FOR INSERT TO authenticated WITH CHECK (true);

-- Comentario
COMMENT ON TABLE public.tms_errores_picking IS 'Registro de devoluciones a picking por errores detectados en packing';
