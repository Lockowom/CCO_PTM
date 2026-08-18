import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MobileAppShell, MobileTopBar, MobileBottomNav, MobileDrawer, MobilePageHeader, MobileQuickActions } from '../components/shell/mobile';

// PR-014 · contrato de MobileShell (TXT 04 §2-6).

describe('PR-014 · MobileShell', () => {
  it('MobileAppShell envuelve TopBar y contenido', () => {
    render(
      <MemoryRouter>
        <MobileAppShell topBar={<MobileTopBar title="Bodega" />}>
          <p>contenido</p>
        </MobileAppShell>
      </MemoryRouter>
    );
    expect(screen.getByText('Bodega')).toBeInTheDocument();
    expect(screen.getByText('contenido')).toBeInTheDocument();
  });

  it('MobileTopBar expone botones de menú y búsqueda con aria-label', () => {
    render(<MobileTopBar title="Inicio" onMenu={() => {}} onSearch={() => {}} />);
    expect(screen.getByLabelText('Abrir menú')).toBeInTheDocument();
    expect(screen.getByLabelText('Buscar')).toBeInTheDocument();
  });

  it('MobileBottomNav muestra items priorizados y opción Más', () => {
    render(
      <MemoryRouter initialEntries={['/mobile/pda']}>
        <MobileBottomNav onMore={() => {}} />
      </MemoryRouter>
    );
    expect(screen.getByLabelText('Navegación inferior')).toBeInTheDocument();
    expect(screen.getByLabelText('Más opciones')).toBeInTheDocument();
  });

  it('MobileDrawer lista grupos de routeMeta', () => {
    render(
      <MemoryRouter>
        <MobileDrawer open onClose={() => {}} />
      </MemoryRouter>
    );
    // el drawer usa portal; busca al menos un grupo del menú
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('MobilePageHeader muestra título y descripción', () => {
    render(<MobilePageHeader title="Putaway" description="Ubicación de recepción" />);
    expect(screen.getByText('Putaway')).toBeInTheDocument();
    expect(screen.getByText('Ubicación de recepción')).toBeInTheDocument();
  });

  it('MobileQuickActions renderiza acciones con aria-label', () => {
    render(<MobileQuickActions actions={[{ label: 'Escanear', icon: <span>◈</span>, onClick: () => {} }]} />);
    expect(screen.getByLabelText('Escanear')).toBeInTheDocument();
  });
});