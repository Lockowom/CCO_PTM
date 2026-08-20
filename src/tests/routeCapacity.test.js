import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  calculateGroupVolume,
  summarizeSelectedLoads,
  validateCubicageGroups
} from '../pages/Panel/rutas/routeCapacity';

describe('capacidad logística de Coordinación Rutas', () => {
  it('calcula volumen considerando todas las cajas del grupo', () => {
    expect(
      calculateGroupVolume({ cantidad: 3, largo_cm: 50, ancho_cm: 40, alto_cm: 30 })
    ).toBeCloseTo(0.18, 6);
  });

  it('resume N.V. y detecta registros físicos incompletos', () => {
    expect(
      summarizeSelectedLoads([
        { bultos: 2, peso_total_kg: 25.5, volumen_total_m3: 0.15 },
        { bultos: 1, peso_total_kg: null, volumen_total_m3: 0.04 }
      ])
    ).toEqual({ nvs: 2, bultos: 3, peso: 25.5, volumen: 0.19, faltan: 1 });
  });

  it('rechaza grupos que no coinciden con los bultos de la N.V.', () => {
    expect(
      validateCubicageGroups([{ cantidad: 2, largo_cm: 10, ancho_cm: 20, alto_cm: 30 }], 3)
    ).toMatchObject({ valid: false, reason: 'PACKAGE_MISMATCH', totalPackages: 2 });
  });

  it('acepta grupos mixtos dentro de los límites operativos', () => {
    expect(
      validateCubicageGroups(
        [
          { cantidad: 1, largo_cm: 10, ancho_cm: 20, alto_cm: 30 },
          { cantidad: 2, largo_cm: 40, ancho_cm: 50, alto_cm: 60 }
        ],
        3
      )
    ).toEqual({ valid: true, reason: null, totalPackages: 3 });
  });
});

describe('contrato SQL de la beta privada', () => {
  const sql = readFileSync(
    join(
      process.cwd(),
      'supabase/migrations/20260820163037_coord_rutas_capacity_fleet_v1_polished.sql'
    ),
    'utf8'
  ).toLowerCase();

  it('mantiene RLS y revoca acceso público a las superficies nuevas', () => {
    expect(sql).toContain('alter table public.tms_operacion_bultos enable row level security');
    expect(sql).toContain('alter table public.tms_vehiculos');
    expect(sql).toMatch(/from\s+public,\s*anon,\s*authenticated/);
    expect(sql).toContain('revoke all on function public.coord_rutas_guardar_cubicaje');
  });

  it('autoriza con rol y permiso IAM, no con UUID durante el runtime', () => {
    expect(sql).toContain("er.role_codigo='cco_private_beta_rutas'");
    expect(sql).toContain("private.coord_rutas_tiene_permiso('manage_route_coordination')");
    expect(sql).toContain("set search_path = ''");
  });

  it('persiste las tarifas por volumen y urgencia', () => {
    expect(sql).toContain('tarifa_m3=coalesce');
    expect(sql).toContain('recargo_urgencia_pct=coalesce');
    expect(sql).toContain("'por_m3',v_tarifa.tarifa_m3*v_m3");
  });

  it('reutiliza las entidades TMS y no crea silos paralelos', () => {
    expect(sql).toContain('create table if not exists public.tms_operacion_bultos');
    expect(sql).toContain('alter table public.tms_vehiculos');
    expect(sql).not.toContain('create table if not exists public.coord_rutas_flota');
    expect(sql).not.toContain('create table if not exists public.coord_rutas_bulto_grupos');
  });

  it('confirma planes con concurrencia, idempotencia y bloqueo por sobrecarga', () => {
    expect(sql).toContain('p_expected_version bigint');
    expect(sql).toContain('p_idempotency_key text');
    expect(sql).toContain('idempotency_key_reused');
    expect(sql).toContain('capacity_overload');
    expect(sql).toContain('pg_advisory_xact_lock');
    expect(sql).toContain('public.tms_transporte_ordenes');
  });
});

describe('contrato Edge de planificación', () => {
  const edge = readFileSync(
    join(process.cwd(), 'supabase/functions/coord-route-plan/index.ts'),
    'utf8'
  ).toLowerCase();
  const distance = readFileSync(
    join(process.cwd(), 'supabase/functions/coord-route-distance/index.ts'),
    'utf8'
  ).toLowerCase();

  it('protege por JWT/RPC y no contiene UUID de propietario hardcodeado', () => {
    expect(edge).toContain('coord_rutas_es_propietario');
    expect(edge).toContain('routing_provider_url');
    expect(distance).toContain('coord_rutas_es_propietario');
    expect(edge).not.toMatch(
      /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/
    );
    expect(distance).not.toContain('owner_uid');
  });
});
