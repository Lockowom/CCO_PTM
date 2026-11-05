import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const migration = readFileSync(
  resolve(process.cwd(), 'supabase/migrations/20261105110557_abs_location_assignment_history.sql'),
  'utf8'
);

describe('ABS-LOC-001 · contrato de migración', () => {
  it('conserva asignaciones cerradas y sincroniza bajas o traslados WMS', () => {
    expect(migration).toContain('CREATE TABLE public.wms_abs_asignaciones');
    expect(migration).toContain("estado IN ('ACTIVA', 'TRASLADADA', 'LIBERADA')");
    expect(migration).toContain('AFTER INSERT OR UPDATE OF codigo, ubicacion OR DELETE');
    expect(migration).toContain("motivo_cierre = 'REGISTRO_WMS_RETIRADO'");
  });

  it('protege la tabla expuesta con RLS y una política de solo lectura', () => {
    expect(migration).toContain('ENABLE ROW LEVEL SECURITY');
    expect(migration).toContain('FOR SELECT');
    expect(migration).toContain("'view_locations'");
    expect(migration).toContain('GRANT SELECT ON TABLE public.wms_abs_asignaciones TO authenticated');
  });

  it('no transacciona stock, ERP ni invoca los RPC de ajuste', () => {
    expect(migration).not.toMatch(/conteo_ajuste_erp|wms_move_stock/i);
    expect(migration).not.toMatch(/(?:UPDATE|DELETE FROM)\s+public\.wms_ubicaciones\b/i);
    expect(migration).not.toMatch(/\bTRUNCATE\b|\bDROP\s+TABLE\b/i);
  });
});
