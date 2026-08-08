import { describe, expect, it } from 'vitest';
import catalog from '../data/ccoArchitecture.generated.json';
import { APP_ROUTES } from '../config/modules';

describe('catálogo de arquitectura CCO', () => {
  it('documenta todas las pantallas configuradas', () => {
    const routes = new Set(
      catalog.nodes.filter((node) => node.kind === 'screen').map((node) => node.route)
    );

    for (const route of APP_ROUTES) expect(routes.has(route.value)).toBe(true);
  });

  it('mantiene identificadores únicos y conexiones válidas', () => {
    const ids = catalog.nodes.map((node) => node.id);
    const uniqueIds = new Set(ids);

    expect(uniqueIds.size).toBe(ids.length);
    for (const connection of catalog.connections) {
      expect(uniqueIds.has(connection.from), connection.from).toBe(true);
      expect(uniqueIds.has(connection.to), connection.to).toBe(true);
    }
  });

  it('incluye la capa funcional, de datos y Edge Functions', () => {
    expect(catalog.meta.totals.module).toBeGreaterThanOrEqual(9);
    expect(catalog.meta.totals.screen).toBeGreaterThanOrEqual(60);
    expect(catalog.meta.totals.function + catalog.meta.totals.action).toBeGreaterThanOrEqual(300);
    expect(catalog.meta.totals.table + catalog.meta.totals.rpc).toBeGreaterThanOrEqual(150);
    expect(catalog.meta.totals['edge-function']).toBeGreaterThanOrEqual(8);
  });

  it('explica cada función y conserva trazabilidad al archivo fuente', () => {
    const functions = catalog.nodes.filter((node) => ['function', 'action'].includes(node.kind));

    expect(functions.length).toBeGreaterThan(0);
    for (const fn of functions) {
      expect(fn.description?.length, fn.id).toBeGreaterThan(10);
      expect(fn.source, fn.id).toMatch(/^src\//);
      expect(fn.signature, fn.id).toContain('(');
    }
  });
});
