import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { useEffect } from 'react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Sidebar from '../components/shell/Sidebar';
import { getSidebarIcon, SIDEBAR_ICONS } from '../components/shell/sidebar/sidebarIcons';
import {
  SIDEBAR_STORAGE_KEY,
  usePersistentSidebarState
} from '../components/shell/sidebar/usePersistentSidebarState';

const NAV_GROUPS = [
  {
    id: 'panel',
    label: 'Panel PTM',
    icon: 'LayoutDashboard',
    items: [
      { path: '/panel/dashboard', title: 'Panel PTM - Dashboard' },
      { path: '/panel/ingresar', title: 'Panel PTM - Ingresar N.V.' }
    ]
  },
  {
    id: 'quality',
    label: 'Calidad',
    icon: 'ClipboardCheck',
    items: [{ path: '/quality/bandeja', title: 'Calidad - Mi bandeja' }]
  },
  {
    id: 'admin',
    label: 'Admin',
    icon: 'ShieldCog',
    items: [
      { path: '/admin/access', title: 'Admin - Control de Acceso' },
      { path: '/admin/observability', title: 'Admin - Observabilidad' }
    ]
  }
];

const TEST_SESSION = {
  user: { id: 'user-1', nombre: 'Cristopher Cabezas', rol: 'ADMIN' },
  logout: vi.fn(async () => {}),
  isAuthenticated: false,
  loading: false
};

vi.mock('../services/eventosService', () => ({
  misNotificaciones: vi.fn(async () => []),
  marcarLeida: vi.fn(async () => {}),
  marcarTodasLeidas: vi.fn(async () => {})
}));

vi.mock('../constants/routeMeta', () => ({
  getNavGroups: (canAccessRoute) =>
    NAV_GROUPS.map((group) => ({
      ...group,
      items: canAccessRoute ? group.items.filter((item) => canAccessRoute(item.path)) : group.items
    })).filter((group) => group.items.length > 0)
}));

function renderSidebar({
  collapsed = false,
  path = '/panel/dashboard',
  canAccessRoute,
  session = TEST_SESSION
} = {}) {
  const onToggle = vi.fn();
  const result = render(
    <MemoryRouter initialEntries={[path]}>
      <Sidebar
        collapsed={collapsed}
        onToggle={onToggle}
        canAccessRoute={canAccessRoute}
        session={session}
      />
    </MemoryRouter>
  );
  return { ...result, onToggle };
}

describe('NAV-002 · Sidebar operacional', () => {
  beforeEach(() => {
    window.localStorage.clear();
    TEST_SESSION.logout.mockClear();
  });

  it('renderiza el modo expandido con branding, módulos, rutas permitidas e iconos SVG', () => {
    const { container } = renderSidebar();

    expect(screen.getByRole('navigation', { name: 'Módulos CCO' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Operación' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Sistema' })).toBeInTheDocument();
    expect(screen.getByAltText('PTM Health Care')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Contraer Panel PTM' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Dashboard/ })).toHaveAttribute('aria-current', 'page');
    expect(container.querySelectorAll('svg.lucide').length).toBeGreaterThan(3);
    expect(container.textContent).not.toMatch(/[→▣⌕▦✓♪⚙▬]/);
    expect(screen.getByText('Cristopher Cabezas')).toBeInTheDocument();
    expect(screen.getByText('ADMIN')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Notificaciones' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cerrar sesión' })).toBeInTheDocument();
    expect(screen.getByText('Operativo')).toBeInTheDocument();
  });

  it('renderiza exactamente un trigger por módulo en collapsed y abre flyout multi-ruta', () => {
    const { container } = renderSidebar({ collapsed: true });
    const sidebar = screen.getByLabelText('Navegación principal');

    expect(sidebar).toHaveAttribute('data-collapsed', 'true');
    expect(container.querySelectorAll('[data-sidebar-group="panel"]')).toHaveLength(1);
    expect(screen.queryByText('Ingresar N.V.')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Abrir Panel PTM' }));
    const flyout = screen.getByRole('group', { name: 'Rutas de Panel PTM' });
    expect(within(flyout).getByRole('link', { name: /Dashboard/ })).toBeInTheDocument();
    expect(within(flyout).getByRole('link', { name: /Ingresar N.V./ })).toBeInTheDocument();
  });

  it('navega directamente cuando el módulo colapsado tiene una sola ruta', () => {
    renderSidebar({ collapsed: true });
    const directLink = screen.getByRole('link', { name: 'Calidad' });

    expect(directLink).toHaveAttribute('href', '/quality/bandeja');
    expect(screen.queryByRole('group', { name: 'Rutas de Calidad' })).not.toBeInTheDocument();
  });

  it('respeta el filtro IAM en expandido y collapsed', () => {
    const canAccessRoute = (path) => !path.startsWith('/admin');
    const { rerender } = render(
      <MemoryRouter>
        <Sidebar
          collapsed={false}
          onToggle={vi.fn()}
          canAccessRoute={canAccessRoute}
          session={TEST_SESSION}
        />
      </MemoryRouter>
    );
    expect(screen.queryByRole('button', { name: /Admin/ })).not.toBeInTheDocument();

    rerender(
      <MemoryRouter>
        <Sidebar
          collapsed
          onToggle={vi.fn()}
          canAccessRoute={canAccessRoute}
          session={TEST_SESSION}
        />
      </MemoryRouter>
    );
    expect(screen.queryByRole('button', { name: /Admin/ })).not.toBeInTheDocument();
  });

  it('cierra el flyout con Escape y devuelve foco al trigger', () => {
    renderSidebar({ collapsed: true });
    const trigger = screen.getByRole('button', { name: 'Abrir Admin' });
    trigger.focus();
    fireEvent.keyDown(trigger, { key: 'Enter' });
    expect(screen.getByRole('group', { name: 'Rutas de Admin' })).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('group', { name: 'Rutas de Admin' })).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('usa Circle Lucide como fallback sin introducir glyphs Unicode', () => {
    expect(getSidebarIcon('UnknownIcon').displayName).toBe('Circle');
  });

  it('mapea los módulos a iconografía logística Lucide', () => {
    expect(SIDEBAR_ICONS.PackagePlus.displayName).toBe('PackagePlus');
    expect(SIDEBAR_ICONS.Warehouse.displayName).toBe('Warehouse');
    expect(SIDEBAR_ICONS.ScanSearch.displayName).toBe('ScanSearch');
    expect(SIDEBAR_ICONS.LayoutDashboard.displayName).toBe('LayoutDashboard');
    expect(SIDEBAR_ICONS.ClipboardCheck.displayName).toBe('ClipboardCheck');
    expect(SIDEBAR_ICONS.Headphones.displayName).toBe('Headphones');
    expect(SIDEBAR_ICONS.ShieldCog.displayName).toBe('ShieldCheck');
    expect(SIDEBAR_ICONS.Truck.displayName).toBe('Truck');
  });

  it('oculta etiquetas de sección en collapsed y mantiene acciones del footer accesibles', () => {
    renderSidebar({ collapsed: true });
    expect(screen.queryByText('Operación')).not.toBeInTheDocument();
    expect(screen.queryByText('Sistema')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Notificaciones' })).toBeInTheDocument();
    expect(screen.getByLabelText('Cristopher Cabezas, rol ADMIN')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cerrar sesión' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Expandir menú' })).toBeInTheDocument();
  });

  it('oculta el acceso al centro completo sin permiso, pero conserva la campana', async () => {
    renderSidebar({ canAccessRoute: () => false });
    fireEvent.click(screen.getByRole('button', { name: 'Notificaciones' }));
    expect(await screen.findByLabelText('Centro de notificaciones')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Ver centro completo/ })).not.toBeInTheDocument();
  });

  it('ejecuta logout una vez y reemplaza la ruta por login', async () => {
    const logout = vi.fn(async () => {});
    const LocationProbe = () => <span data-testid="location">{useLocation().pathname}</span>;
    render(
      <MemoryRouter initialEntries={['/panel/dashboard']}>
        <Sidebar
          collapsed={false}
          onToggle={vi.fn()}
          canAccessRoute={() => true}
          session={{ ...TEST_SESSION, logout }}
        />
        <LocationProbe />
      </MemoryRouter>
    );
    const button = screen.getByRole('button', { name: 'Cerrar sesión' });
    fireEvent.click(button);
    fireEvent.click(button);
    await waitFor(() => expect(logout).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/login'));
  });
});

const StateHarness = ({ onValue }) => {
  const [collapsed, setCollapsed] = usePersistentSidebarState();
  useEffect(() => onValue(collapsed), [collapsed, onValue]);
  return (
    <button type="button" onClick={() => setCollapsed((current) => !current)}>
      alternar
    </button>
  );
};

describe('NAV-001 · persistencia', () => {
  it('restaura, actualiza y tolera valores inválidos de localStorage', () => {
    window.localStorage.setItem(SIDEBAR_STORAGE_KEY, 'true');
    const onValue = vi.fn();
    const { unmount } = render(<StateHarness onValue={onValue} />);
    expect(onValue).toHaveBeenLastCalledWith(true);

    fireEvent.click(screen.getByRole('button', { name: 'alternar' }));
    expect(window.localStorage.getItem(SIDEBAR_STORAGE_KEY)).toBe('false');
    expect(onValue).toHaveBeenLastCalledWith(false);
    unmount();

    window.localStorage.setItem(SIDEBAR_STORAGE_KEY, 'valor-invalido');
    const fallback = vi.fn();
    render(<StateHarness onValue={fallback} />);
    expect(fallback).toHaveBeenLastCalledWith(false);
  });
});
