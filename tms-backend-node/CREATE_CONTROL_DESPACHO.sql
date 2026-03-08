-- Tabla para el módulo "Control Despacho"
CREATE TABLE IF NOT EXISTS tms_control_despacho (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fecha_docto DATE,
    cliente TEXT,
    facturas TEXT,
    guia TEXT,
    bultos INTEGER DEFAULT 0,
    empresa_transporte TEXT,
    transportista TEXT,
    nv TEXT,
    division TEXT,
    vendedor TEXT,
    fecha_despacho DATE,
    valor_flete NUMERIC(15, 2) DEFAULT 0,
    numero_envio TEXT,
    
    -- Auditoría
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para búsqueda rápida
CREATE INDEX IF NOT EXISTS idx_control_despacho_nv ON tms_control_despacho(nv);
CREATE INDEX IF NOT EXISTS idx_control_despacho_cliente ON tms_control_despacho(cliente);
CREATE INDEX IF NOT EXISTS idx_control_despacho_fecha ON tms_control_despacho(fecha_despacho);

-- Constraint de unicidad opcional (si se desea evitar duplicados exactos de guía o NV)
-- ALTER TABLE tms_control_despacho ADD CONSTRAINT unique_guia UNIQUE (guia);
