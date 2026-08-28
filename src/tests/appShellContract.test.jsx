import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppShell } from '../components/shell';
import {
  ROUTE_META,
  getRouteMeta,
  getBreadcrumb,
  getNavGroups,
  SEARCHABLE_ROUTES
} from '../constants/routeMeta';

// PR-013 · contrato de AppShell + routeMeta (TXT 03 §4-5).

describe('PR-013 · routeMeta SSOT', () => {
  it('cubre las rutas de APP_ROUTES con metadatos', () => {
    expect(ROUTE_META.length).toBeGreaterThan(20);
    expect(ROUTE_META.every((m) => m.path && m.title)).toBe(true);
  });

  it('deriva requiredPermissions de ROUTE_PERMISSIONS (no duplica lógica)', () => {
    const r = getRouteMeta('/inbound/entry');
    expect(r).not.toBeNull();
    expect(r.requiredPermissions).toEqual(['view_entry', 'process_entry']);
  });

  it('getRouteMeta normaliza query y trailing slash', () => {
    expect(getRouteMeta('/inventory/conteo?tab=sesiones')?.path).toBe(
      '/inventory/conteo?tab=sesiones'
    );
    expect(getRouteMeta('/inbound/entry/')?.path).toBe('/inbound/entry');
  });

  it('getBreadcrumb incluye grupo y página', () => {
    const crumbs = getBreadcrumb('/inbound/entry');
    expect(crumbs.length).toBeGreaterThanOrEqual(2);
    expect(crumbs[crumbs.length - 1].path).toBe('/inbound/entry');
  });

  it('getNavGroups agrupa y no incluye hiddenFromNav', () => {
    const groups = getNavGroups();
    expect(groups.length).toBeGreaterThan(3);
    const allItems = groups.flatMap((g) => g.items);
    expect(allItems.some((i) => i.hiddenFromNav)).toBe(false);
    expect(allItems.some((i) => i.path === '/panel/tv')).toBe(false);
  });

  it('asigna iconografía logística a cada dominio sin alterar rutas', () => {
    const icons = Object.fromEntries(
      ROUTE_META.filter((meta) => meta.module && meta.group).map((meta) => [
        meta.module,
        meta.group.icon
      ])
    );
    expect(icons).toMatchObject({
      inbound: 'PackagePlus',
      inventario: 'Warehouse',
      queries: 'ScanSearch',
      panel: 'LayoutDashboard',
      quality: 'ClipboardCheck',
      postventa: 'Headphones',
      admin: 'ShieldCog',
      tms: 'Truck'
    });
  });

  it('SEARCHABLE_ROUTES está ordenado por mobilePriority', () => {
    const prios = SEARCHABLE_ROUTES.map((r) => r.mobilePriority);
    expect([...prios]).toEqual([...prios].sort((a, b) => a - b));
  });
});

describe('PR-013 · AppShell', () => {
  it('renderiza Sidebar + Topbar con breadcrumb', () => {
    const sidebarSession = {
      user: { id: 'test', nombre: 'Usuario Prueba', rol: 'ADMIN' },
      logout: async () => {},
      isAuthenticated: false,
      loading: false
    };
    render(
      <MemoryRouter initialEntries={['/inbound/entry']}>
        <AppShell sidebarSession={sidebarSession}>
          <p>contenido</p>
        </AppShell>
      </MemoryRouter>
    );
    expect(screen.getByLabelText('Navegación principal')).toBeInTheDocument();
    const breadcrumb = screen.getByLabelText('Breadcrumb');
    expect(breadcrumb).toBeInTheDocument();
    expect(within(breadcrumb).getByText('Inbound')).toBeInTheDocument(); // grupo
  });
});
