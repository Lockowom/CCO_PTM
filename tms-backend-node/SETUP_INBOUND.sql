-- 1. Tabla de Recepciones
CREATE TABLE IF NOT EXISTS public.tms_recepciones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    proveedor TEXT NOT NULL,
    productos TEXT NOT NULL, -- IDs separados por coma o JSON
    cantidades TEXT NOT NULL, -- Cantidades separadas por coma
    notas TEXT,
    items_count INTEGER DEFAULT 0,
    estado TEXT DEFAULT 'PENDIENTE', -- 'PENDIENTE', 'VERIFICADA', 'CON_DISCREPANCIAS'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Data (Opcional)
INSERT INTO public.tms_recepciones (proveedor, productos, cantidades, items_count, estado, created_at) VALUES
('Proveedor A', 'PRD-001, PRD-002', '10, 20', 30, 'VERIFICADA', NOW() - INTERVAL '1 day'),
('Proveedor B', 'PRD-005', '5', 5, 'PENDIENTE', NOW()),
('Importadora X', 'PRD-100, PRD-101, PRD-102', '50, 50, 50', 150, 'VERIFICADA', NOW() - INTERVAL '2 hours');
