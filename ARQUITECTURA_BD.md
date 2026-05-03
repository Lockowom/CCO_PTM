# 💾 ARQUITECTURA DE BASE DE DATOS - CCO WMS

## 📑 Tabla de Contenidos
1. [Diagrama ER](#diagrama-er)
2. [Tablas Principales](#tablas-principales)
3. [Relaciones](#relaciones)
4. [Índices](#índices)
5. [Funciones RPC](#funciones-rpc)
6. [Políticas de Seguridad](#políticas-de-seguridad)
7. [Triggers](#triggers)
8. [Vistas](#vistas)

---

## 🗂️ Diagrama ER

```
┌─────────────────────────────────────────────────────────────────┐
│                    SISTEMA CCO WMS                              │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────┐
│   tms_usuarios       │
├──────────────────────┤
│ id (PK)              │
│ nombre               │
│ email (UNIQUE)       │
│ password_hash        │
│ rol (FK)             │
│ activo               │
│ es_admin_delegado    │
│ created_at           │
│ updated_at           │
└──────────────────────┘
         │
         │ FK
         ▼
┌──────────────────────┐
│   tms_roles          │
├──────────────────────┤
│ id (PK)              │
│ nombre (UNIQUE)      │
│ descripcion          │
│ permisos_json (JSON) │
│ created_at           │
│ updated_at           │
└──────────────────────┘

┌──────────────────────┐
│ tms_nv_diarias       │
├──────────────────────┤
│ id (PK)              │
│ nv (UNIQUE)          │
│ cliente              │
│ cantidad             │
│ estado               │
│ fecha_emision        │
│ created_at           │
│ updated_at           │
└──────────────────────┘
         │
         │ 1:N
         ▼
┌──────────────────────┐
│   tms_partidas       │
├──────────────────────┤
│ id (PK)              │
│ nv_id (FK)           │
│ partida              │
│ sku                  │
│ cantidad             │
│ lote                 │
│ created_at           │
└──────────────────────┘
         │
         │ 1:N
         ▼
┌──────────────────────┐
│   tms_series         │
├──────────────────────┤
│ id (PK)              │
│ partida_id (FK)      │
│ serie                │
│ created_at           │
└──────────────────────┘

┌──────────────────────┐
│  wms_inventory       │
├──────────────────────┤
│ id (PK)              │
│ sku                  │
│ batch                │
│ location             │
│ qty                  │
│ created_at           │
│ updated_at           │
└──────────────────────┘

┌──────────────────────┐
│  wms_movements       │
├──────────────────────┤
│ id (PK)              │
│ sku                  │
│ batch                │
│ from_location        │
│ to_location          │
│ qty                  │
│ user_id (FK)         │
│ reason               │
│ timestamp            │
└──────────────────────┘

┌──────────────────────┐
│  tms_conductores     │
├──────────────────────┤
│ id (PK)              │
│ nombre               │
│ licencia             │
│ estado               │
│ created_at           │
│ updated_at           │
└──────────────────────┘

┌──────────────────────┐
│ tms_usuarios_activos │
├──────────────────────┤
│ usuario_id (PK, FK)  │
│ nombre               │
│ rol                  │
│ ultima_actividad     │
│ modulo_actual        │
│ estado               │
└──────────────────────┘

┌──────────────────────┐
│   tms_accesos        │
├──────────────────────┤
│ id (PK)              │
│ usuario_id (FK)      │
│ nombre               │
│ email                │
│ rol                  │
│ timestamp            │
└──────────────────────┘

┌──────────────────────┐
│ tms_modules_config   │
├──────────────────────┤
│ id (PK)              │
│ enabled              │
│ created_at           │
│ updated_at           │
└──────────────────────┘

┌──────────────────────┐
│  tms_farmapack       │
├──────────────────────┤
│ id (PK)              │
│ lote                 │
│ vencimiento          │
│ cantidad             │
│ created_at           │
└──────────────────────┘
```

---

## 📋 Tablas Principales

### 1. **tms_usuarios** - Usuarios del Sistema

```sql
CREATE TABLE tms_usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  rol UUID NOT NULL REFERENCES tms_roles(id),
  activo BOOLEAN DEFAULT true,
  es_admin_delegado BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Índices
CREATE INDEX idx_usuarios_email ON tms_usuarios(email);
CREATE INDEX idx_usuarios_rol ON tms_usuarios(rol);
CREATE INDEX idx_usuarios_activo ON tms_usuarios(activo);
```

**Campos:**
- `id`: Identificador único (UUID)
- `nombre`: Nombre completo del usuario
- `email`: Email único para login
- `password_hash`: Contraseña hasheada (NUNCA guardar en texto plano)
- `rol`: Referencia a rol (FK)
- `activo`: Si usuario está activo
- `es_admin_delegado`: Si tiene permisos de admin delegado
- `created_at`: Fecha de creación
- `updated_at`: Fecha de última actualización

---

### 2. **tms_roles** - Roles y Permisos

```sql
CREATE TABLE tms_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(255) UNIQUE NOT NULL,
  descripcion TEXT,
  permisos_json JSON[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Índices
CREATE INDEX idx_roles_nombre ON tms_roles(nombre);
```

**Campos:**
- `id`: Identificador único
- `nombre`: Nombre del rol (ADMIN, OPERARIO, SUPERVISOR, etc.)
- `descripcion`: Descripción del rol
- `permisos_json`: Array JSON de permisos
  ```json
  [
    "view_dashboard",
    "view_stock",
    "manage_stock",
    "view_picking",
    "process_picking"
  ]
  ```

**Roles Predefinidos:**
```sql
INSERT INTO tms_roles (nombre, descripcion, permisos_json) VALUES
('ADMIN', 'Administrador del sistema', '["*"]'),
('SUPERVISOR', 'Supervisor de almacén', '["view_dashboard", "view_stock", "view_picking", "view_packing", "view_shipping"]'),
('OPERARIO', 'Operario de almacén', '["view_stock", "process_picking", "process_packing"]'),
('CONDUCTOR', 'Conductor de transporte', '["view_routes", "view_deliveries"]'),
('AUDITOR', 'Auditor del sistema', '["view_reports", "view_audit_logs"]');
```

---

### 3. **tms_nv_diarias** - Notas de Venta

```sql
CREATE TABLE tms_nv_diarias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nv VARCHAR(50) UNIQUE NOT NULL,
  cliente VARCHAR(255) NOT NULL,
  cantidad INTEGER NOT NULL,
  estado VARCHAR(50) DEFAULT 'Pendiente',
  fecha_emision DATE NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Índices
CREATE INDEX idx_nv_nv ON tms_nv_diarias(nv);
CREATE INDEX idx_nv_cliente ON tms_nv_diarias(cliente);
CREATE INDEX idx_nv_estado ON tms_nv_diarias(estado);
CREATE INDEX idx_nv_fecha ON tms_nv_diarias(fecha_emision);
```

**Estados Posibles:**
```
Pendiente
Aprobada
Pendiente Picking
QUIEBRE_STOCK
PACKING
LISTO_DESPACHO
Pendiente Shipping
Despachado
ENTREGADO
Refacturacion
```

---

### 4. **tms_partidas** - Líneas de Venta

```sql
CREATE TABLE tms_partidas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nv_id UUID NOT NULL REFERENCES tms_nv_diarias(id) ON DELETE CASCADE,
  partida VARCHAR(50) NOT NULL,
  sku VARCHAR(50) NOT NULL,
  cantidad INTEGER NOT NULL,
  lote VARCHAR(50),
  created_at TIMESTAMP DEFAULT now()
);

-- Índices
CREATE INDEX idx_partidas_nv_id ON tms_partidas(nv_id);
CREATE INDEX idx_partidas_sku ON tms_partidas(sku);
CREATE INDEX idx_partidas_lote ON tms_partidas(lote);
```

---

### 5. **tms_series** - Números de Serie

```sql
CREATE TABLE tms_series (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partida_id UUID NOT NULL REFERENCES tms_partidas(id) ON DELETE CASCADE,
  serie VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

-- Índices
CREATE INDEX idx_series_partida_id ON tms_series(partida_id);
CREATE INDEX idx_series_serie ON tms_series(serie);
```

---

### 6. **wms_inventory** - Inventario

```sql
CREATE TABLE wms_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku VARCHAR(50) NOT NULL,
  batch VARCHAR(50) NOT NULL,
  location VARCHAR(50) NOT NULL,
  qty INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(sku, batch, location)
);

-- Índices
CREATE INDEX idx_inventory_sku ON wms_inventory(sku);
CREATE INDEX idx_inventory_batch ON wms_inventory(batch);
CREATE INDEX idx_inventory_location ON wms_inventory(location);
CREATE INDEX idx_inventory_qty ON wms_inventory(qty);
```

**Campos:**
- `sku`: Código del producto
- `batch`: Número de lote
- `location`: Ubicación en almacén (ej: A-01-01-01)
- `qty`: Cantidad disponible

---

### 7. **wms_movements** - Historial de Movimientos

```sql
CREATE TABLE wms_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku VARCHAR(50) NOT NULL,
  batch VARCHAR(50) NOT NULL,
  from_location VARCHAR(50),
  to_location VARCHAR(50),
  qty INTEGER NOT NULL,
  user_id UUID REFERENCES tms_usuarios(id),
  reason VARCHAR(255),
  timestamp TIMESTAMP DEFAULT now()
);

-- Índices
CREATE INDEX idx_movements_sku ON wms_movements(sku);
CREATE INDEX idx_movements_batch ON wms_movements(batch);
CREATE INDEX idx_movements_user_id ON wms_movements(user_id);
CREATE INDEX idx_movements_timestamp ON wms_movements(timestamp);
```

---

### 8. **tms_conductores** - Conductores

```sql
CREATE TABLE tms_conductores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(255) NOT NULL,
  licencia VARCHAR(50) UNIQUE NOT NULL,
  estado VARCHAR(50) DEFAULT 'DISPONIBLE',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Índices
CREATE INDEX idx_conductores_licencia ON tms_conductores(licencia);
CREATE INDEX idx_conductores_estado ON tms_conductores(estado);
```

**Estados:**
- `DISPONIBLE`: Listo para asignar
- `EN_RUTA`: Actualmente en ruta
- `DESCANSANDO`: En descanso
- `INACTIVO`: No disponible

---

### 9. **tms_usuarios_activos** - Heartbeat de Usuarios

```sql
CREATE TABLE tms_usuarios_activos (
  usuario_id UUID PRIMARY KEY REFERENCES tms_usuarios(id) ON DELETE CASCADE,
  nombre VARCHAR(255) NOT NULL,
  rol VARCHAR(50) NOT NULL,
  ultima_actividad TIMESTAMP DEFAULT now(),
  modulo_actual VARCHAR(255),
  estado VARCHAR(50) DEFAULT 'ONLINE'
);

-- Índices
CREATE INDEX idx_activos_estado ON tms_usuarios_activos(estado);
CREATE INDEX idx_activos_ultima_actividad ON tms_usuarios_activos(ultima_actividad);
```

---

### 10. **tms_accesos** - Auditoría de Accesos

```sql
CREATE TABLE tms_accesos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES tms_usuarios(id),
  nombre VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  rol VARCHAR(50) NOT NULL,
  timestamp TIMESTAMP DEFAULT now()
);

-- Índices
CREATE INDEX idx_accesos_usuario_id ON tms_accesos(usuario_id);
CREATE INDEX idx_accesos_timestamp ON tms_accesos(timestamp);
```

---

### 11. **tms_modules_config** - Configuración de Módulos

```sql
CREATE TABLE tms_modules_config (
  id VARCHAR(50) PRIMARY KEY,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Datos iniciales
INSERT INTO tms_modules_config (id, enabled) VALUES
('tms', true),
('dashboard', true),
('inbound', true),
('outbound', true),
('inventory', true),
('quality', true),
('analytics', true),
('queries', true),
('admin', true);
```

---

### 12. **tms_farmapack** - Lotes Farmacéuticos

```sql
CREATE TABLE tms_farmapack (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lote VARCHAR(50) UNIQUE NOT NULL,
  vencimiento DATE NOT NULL,
  cantidad INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

-- Índices
CREATE INDEX idx_farmapack_lote ON tms_farmapack(lote);
CREATE INDEX idx_farmapack_vencimiento ON tms_farmapack(vencimiento);
```

---

## 🔗 Relaciones

### Relaciones Principales

```
tms_usuarios (1) ──────────────── (N) tms_accesos
                                  (N) wms_movements
                                  (N) tms_usuarios_activos

tms_roles (1) ──────────────── (N) tms_usuarios

tms_nv_diarias (1) ──────────────── (N) tms_partidas

tms_partidas (1) ──────────────── (N) tms_series

wms_inventory (1) ──────────────── (N) wms_movements
```

### Integridad Referencial

```sql
-- ON DELETE CASCADE: Eliminar registros relacionados
-- ON DELETE RESTRICT: No permitir eliminación si hay registros relacionados
-- ON DELETE SET NULL: Establecer NULL en registros relacionados

-- Ejemplo: Si se elimina una N.V., eliminar sus partidas
ALTER TABLE tms_partidas
ADD CONSTRAINT fk_partidas_nv
FOREIGN KEY (nv_id) REFERENCES tms_nv_diarias(id)
ON DELETE CASCADE;
```

---

## 🔍 Índices

### Índices Recomendados

```sql
-- Búsquedas frecuentes
CREATE INDEX idx_nv_estado_fecha ON tms_nv_diarias(estado, fecha_emision);
CREATE INDEX idx_inventory_sku_batch ON wms_inventory(sku, batch);
CREATE INDEX idx_movements_timestamp_user ON wms_movements(timestamp, user_id);

-- Ordenamientos
CREATE INDEX idx_usuarios_nombre ON tms_usuarios(nombre);
CREATE INDEX idx_conductores_nombre ON tms_conductores(nombre);

-- Filtros
CREATE INDEX idx_nv_cliente_estado ON tms_nv_diarias(cliente, estado);
CREATE INDEX idx_partidas_sku_lote ON tms_partidas(sku, lote);
```

### Análisis de Índices

```sql
-- Ver índices de una tabla
SELECT * FROM pg_indexes WHERE tablename = 'tms_nv_diarias';

-- Ver tamaño de índices
SELECT schemaname, tablename, indexname, pg_size_pretty(pg_relation_size(indexrelid)) 
FROM pg_indexes 
WHERE schemaname = 'public';
```

---

## 🔧 Funciones RPC

### 1. **get_fefo_allocation** - Sugerencia FEFO

```sql
CREATE OR REPLACE FUNCTION get_fefo_allocation(
  p_sku VARCHAR,
  p_qty_needed INTEGER
)
RETURNS TABLE (
  location VARCHAR,
  batch VARCHAR,
  qty_available INTEGER,
  vencimiento DATE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    wi.location,
    wi.batch,
    wi.qty,
    fp.vencimiento
  FROM wms_inventory wi
  LEFT JOIN tms_farmapack fp ON wi.batch = fp.lote
  WHERE wi.sku = p_sku
    AND wi.qty > 0
  ORDER BY fp.vencimiento ASC NULLS LAST, wi.created_at ASC
  LIMIT CEIL(p_qty_needed::FLOAT / 10);
END;
$$ LANGUAGE plpgsql;
```

**Uso desde Frontend:**
```javascript
const { data } = await supabase.rpc('get_fefo_allocation', {
  p_sku: 'SKU123',
  p_qty_needed: 100
});
```

---

### 2. **wms_move_stock** - Movimiento Atómico

```sql
CREATE OR REPLACE FUNCTION wms_move_stock(
  p_sku VARCHAR,
  p_batch VARCHAR,
  p_from_location VARCHAR,
  p_to_location VARCHAR,
  p_qty INTEGER,
  p_user_id UUID,
  p_reason VARCHAR
)
RETURNS TABLE (
  success BOOLEAN,
  message VARCHAR
) AS $$
DECLARE
  v_available INTEGER;
BEGIN
  -- Validar disponibilidad
  SELECT qty INTO v_available
  FROM wms_inventory
  WHERE sku = p_sku
    AND batch = p_batch
    AND location = p_from_location
  FOR UPDATE;

  IF v_available IS NULL OR v_available < p_qty THEN
    RETURN QUERY SELECT false, 'Stock insuficiente'::VARCHAR;
    RETURN;
  END IF;

  -- Restar del origen
  UPDATE wms_inventory
  SET qty = qty - p_qty, updated_at = now()
  WHERE sku = p_sku
    AND batch = p_batch
    AND location = p_from_location;

  -- Sumar al destino
  INSERT INTO wms_inventory (sku, batch, location, qty)
  VALUES (p_sku, p_batch, p_to_location, p_qty)
  ON CONFLICT (sku, batch, location)
  DO UPDATE SET qty = qty + p_qty, updated_at = now();

  -- Registrar movimiento
  INSERT INTO wms_movements (sku, batch, from_location, to_location, qty, user_id, reason)
  VALUES (p_sku, p_batch, p_from_location, p_to_location, p_qty, p_user_id, p_reason);

  RETURN QUERY SELECT true, 'Movimiento exitoso'::VARCHAR;
END;
$$ LANGUAGE plpgsql;
```

---

### 3. **wms_reserve_stock** - Reserva de Stock

```sql
CREATE OR REPLACE FUNCTION wms_reserve_stock(
  p_order_id UUID,
  p_sku VARCHAR,
  p_qty INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
  v_available INTEGER;
BEGIN
  -- Calcular disponible
  SELECT COALESCE(SUM(qty), 0) INTO v_available
  FROM wms_inventory
  WHERE sku = p_sku;

  IF v_available < p_qty THEN
    RETURN false;
  END IF;

  -- Crear reserva (implementar tabla de reservas si es necesario)
  RETURN true;
END;
$$ LANGUAGE plpgsql;
```

---

## 🔐 Políticas de Seguridad (RLS)

### Habilitar RLS

```sql
-- Habilitar RLS en tablas sensibles
ALTER TABLE tms_usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE tms_accesos ENABLE ROW LEVEL SECURITY;
ALTER TABLE wms_movements ENABLE ROW LEVEL SECURITY;

-- Política: Solo ADMIN puede ver todos los usuarios
CREATE POLICY admin_view_all_users ON tms_usuarios
  FOR SELECT
  USING (
    auth.jwt() ->> 'role' = 'ADMIN'
  );

-- Política: Usuarios ven solo sus propios accesos
CREATE POLICY users_view_own_access ON tms_accesos
  FOR SELECT
  USING (
    usuario_id = auth.uid()
  );
```

---

## ⚙️ Triggers

### 1. **Actualizar updated_at**

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar a todas las tablas
CREATE TRIGGER update_usuarios_updated_at
  BEFORE UPDATE ON tms_usuarios
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_nv_updated_at
  BEFORE UPDATE ON tms_nv_diarias
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ... más triggers
```

### 2. **Validar Stock Negativo**

```sql
CREATE OR REPLACE FUNCTION validate_inventory_qty()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.qty < 0 THEN
    RAISE EXCEPTION 'Stock no puede ser negativo';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_inventory_qty
  BEFORE INSERT OR UPDATE ON wms_inventory
  FOR EACH ROW
  EXECUTE FUNCTION validate_inventory_qty();
```

### 3. **Auditoría de Cambios**

```sql
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tabla VARCHAR(50),
  operacion VARCHAR(10),
  registro_id UUID,
  datos_anterior JSONB,
  datos_nuevo JSONB,
  usuario_id UUID,
  timestamp TIMESTAMP DEFAULT now()
);

CREATE OR REPLACE FUNCTION audit_changes()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_log (tabla, operacion, registro_id, datos_anterior, datos_nuevo, usuario_id)
  VALUES (
    TG_TABLE_NAME,
    TG_OP,
    COALESCE(NEW.id, OLD.id),
    to_jsonb(OLD),
    to_jsonb(NEW),
    auth.uid()
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;
```

---

## 👁️ Vistas

### 1. **Vista: Resumen de N.V.**

```sql
CREATE OR REPLACE VIEW v_nv_resumen AS
SELECT 
  nv.id,
  nv.nv,
  nv.cliente,
  nv.estado,
  COUNT(p.id) as total_partidas,
  SUM(p.cantidad) as cantidad_total,
  nv.fecha_emision,
  nv.created_at
FROM tms_nv_diarias nv
LEFT JOIN tms_partidas p ON nv.id = p.nv_id
GROUP BY nv.id, nv.nv, nv.cliente, nv.estado, nv.fecha_emision, nv.created_at;
```

### 2. **Vista: Stock por Ubicación**

```sql
CREATE OR REPLACE VIEW v_stock_ubicacion AS
SELECT 
  location,
  COUNT(DISTINCT sku) as productos_diferentes,
  SUM(qty) as cantidad_total,
  MAX(updated_at) as ultima_actualizacion
FROM wms_inventory
WHERE qty > 0
GROUP BY location
ORDER BY cantidad_total DESC;
```

### 3. **Vista: Usuarios Activos**

```sql
CREATE OR REPLACE VIEW v_usuarios_activos AS
SELECT 
  ua.usuario_id,
  ua.nombre,
  ua.rol,
  ua.modulo_actual,
  ua.estado,
  EXTRACT(MINUTE FROM (now() - ua.ultima_actividad)) as minutos_inactivo
FROM tms_usuarios_activos ua
WHERE ua.estado = 'ONLINE'
  AND (now() - ua.ultima_actividad) < INTERVAL '30 minutes'
ORDER BY ua.ultima_actividad DESC;
```

---

## 📊 Consultas Útiles

### Estadísticas de N.V.

```sql
SELECT 
  estado,
  COUNT(*) as cantidad,
  SUM(cantidad) as total_items
FROM tms_nv_diarias
WHERE fecha_emision >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY estado
ORDER BY cantidad DESC;
```

### Stock Bajo

```sql
SELECT 
  sku,
  SUM(qty) as cantidad_total,
  COUNT(DISTINCT location) as ubicaciones
FROM wms_inventory
GROUP BY sku
HAVING SUM(qty) < 10
ORDER BY cantidad_total ASC;
```

### Movimientos por Usuario

```sql
SELECT 
  u.nombre,
  COUNT(m.id) as total_movimientos,
  SUM(m.qty) as cantidad_movida,
  MAX(m.timestamp) as ultimo_movimiento
FROM wms_movements m
JOIN tms_usuarios u ON m.user_id = u.id
WHERE m.timestamp >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY u.id, u.nombre
ORDER BY total_movimientos DESC;
```

### Lotes Próximos a Vencer

```sql
SELECT 
  lote,
  vencimiento,
  cantidad,
  EXTRACT(DAY FROM (vencimiento - CURRENT_DATE)) as dias_para_vencer
FROM tms_farmapack
WHERE vencimiento <= CURRENT_DATE + INTERVAL '30 days'
  AND vencimiento > CURRENT_DATE
ORDER BY vencimiento ASC;
```

---

## 🔄 Mantenimiento

### Backup

```bash
# Backup completo
pg_dump -h host -U usuario -d base_datos > backup.sql

# Backup de tabla específica
pg_dump -h host -U usuario -d base_datos -t tms_nv_diarias > nv_backup.sql
```

### Restore

```bash
# Restaurar backup
psql -h host -U usuario -d base_datos < backup.sql
```

### Optimización

```sql
-- Analizar tablas
ANALYZE;

-- Vacuum (limpiar espacio)
VACUUM ANALYZE;

-- Ver tamaño de tablas
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

**Última actualización:** Mayo 2026
**Versión:** 1.0.0
