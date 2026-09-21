import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';

vi.mock('../context/AuthContext', () => ({ useAuth: () => ({ user: { id: 'u-1', nombre: 'Nilo Langebach', email: 'nilo@ptm.cl', rol: 'OPERADOR' }, logout: vi.fn(), hasPermission: () => true, roles: [], canAccessRoute: (path) => path !== '/admin/users' }) }));
vi.mock('../context/ConfigContext', () => ({ useConfig: () => ({ isModuleEnabled: () => true }) }));
vi.mock('../hooks/useSyncQueueCount', () => ({ useSyncQueueCount: () => 0 }));
vi.mock('../components/NotificationBell', () => ({ default: () => <button aria-label="Notificaciones">N</button> }));
vi.mock('../components/NovedadesModal', () => ({ mostrarNovedades: vi.fn() }));
vi.mock('@gsap/react', () => ({ useGSAP: () => {} }));
vi.mock('gsap', () => ({ default: { fromTo: vi.fn() } }));

import Navbar from '../components/Navbar';

function RouteProbe() { return <output data-testid="route">{useLocation().pathname}</output>; }
function renderNavbar() { return render(<MemoryRouter initialEntries={['/panel']}><Navbar /><RouteProbe /></MemoryRouter>); }

describe('NAV-MOBILE-001 · navbar móvil autenticado', () => {
  it('MOB_NAV_01/02: expone hamburguesa crítica con contrato 44px y ARIA', () => {
    renderNavbar();
    const button = screen.getByRole('button', { name: 'Abrir menú' });
    expect(button).toHaveAttribute('aria-controls', 'cco-mobile-navigation');
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(button.className).toContain('min-w-[44px]');
    expect(button.className).toContain('min-h-[44px]');
  });

  it('MOB_NAV_03/07/09/12: abre, cierra por backdrop y Escape, y restaura scroll', () => {
    renderNavbar();
    const button = screen.getByRole('button', { name: 'Abrir menú' });
    for (let index = 0; index < 5; index += 1) {
      fireEvent.click(button);
      expect(screen.getByRole('dialog', { name: 'Navegación móvil' })).toBeInTheDocument();
      expect(document.body.style.overflow).toBe('hidden');
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(document.body.style.overflow).toBe('');
    }
    fireEvent.click(button);
    fireEvent.click(screen.getByRole('dialog', { name: 'Navegación móvil' }).parentElement.firstChild);
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('MOB_NAV_04/05/14/15: declara geometría segura, scroll interno y movimiento reducido', () => {
    renderNavbar();
    fireEvent.click(screen.getByRole('button', { name: 'Abrir menú' }));
    const drawer = screen.getByRole('dialog', { name: 'Navegación móvil' });
    expect(drawer.className).toContain('left-2');
    expect(drawer.className).toContain('right-2');
    expect(drawer.className).toContain('100dvh');
    expect(drawer.className).toContain('safe-area-inset-top');
    expect(drawer.className).toContain('safe-area-inset-bottom');
    expect(drawer.className).toContain('motion-reduce:transition-none');
    expect(drawer.firstChild.className).toContain('overscroll-contain');
    expect(drawer.firstChild.className).toContain('overflow-y-auto');
  });

  it('MOB_NAV_08/10/11/13: conserva acciones, filtra rutas y cierra al navegar', () => {
    renderNavbar();
    fireEvent.click(screen.getByRole('button', { name: 'Abrir menú' }));
    const drawer = screen.getByRole('dialog', { name: 'Navegación móvil' });
    expect(within(drawer).getByText('Nilo Langebach')).toBeInTheDocument();
    expect(within(drawer).getByRole('link', { name: /seguridad/i })).toBeInTheDocument();
    expect(within(drawer).getByRole('button', { name: /cerrar sesión/i })).toBeInTheDocument();
    expect(screen.queryByText('Identidad y Seguridad')).not.toBeInTheDocument();
    fireEvent.click(within(drawer).getByRole('button', { name: 'Inbound' }));
    fireEvent.click(within(drawer).getByRole('link', { name: 'Devoluciones' }));
    expect(screen.getByTestId('route')).toHaveTextContent('/inbound/devoluciones');
    expect(screen.getByRole('button', { name: 'Abrir menú' })).toHaveAttribute('aria-expanded', 'false');
  });
});
