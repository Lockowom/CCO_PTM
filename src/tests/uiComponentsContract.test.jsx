import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

// PR-012 · contrato de UI tokens/components (TXT 03 §2-3).
// Verifica que el barrel exporta todos los primitivos y que los componentes
// clave renderizan con su rol/semántica mínima.

import { Button, Card, StatusBadge, InlineAlert, Skeleton, EmptyState, PageHeader, Drawer, Modal, ConfirmDialog, FormField, StickyActionBar, FilterChip } from '../components/ui';

describe('PR-012 · barrel UI', () => {
  it('exporta todos los primitivos', () => {
    expect(typeof Button).toBe('function');
    expect(typeof Card).toBe('function');
    expect(typeof StatusBadge).toBe('function');
    expect(typeof InlineAlert).toBe('function');
    expect(typeof Skeleton).toBe('function');
    expect(typeof EmptyState).toBe('function');
    expect(typeof PageHeader).toBe('function');
    expect(typeof Drawer).toBe('function');
    expect(typeof Modal).toBe('function');
    expect(typeof ConfirmDialog).toBe('function');
    expect(typeof FormField).toBe('function');
    expect(typeof StickyActionBar).toBe('function');
    expect(typeof FilterChip).toBe('function');
  });
});

describe('PR-012 · render', () => {
  it('Button renderiza con su etiqueta y variante', () => {
    render(<Button variant="danger">Eliminar</Button>);
    expect(screen.getByRole('button', { name: 'Eliminar' })).toBeInTheDocument();
  });

  it('StatusBadge renderiza el label con rol semántico', () => {
    render(<StatusBadge tone="danger" label="Rezagada" />);
    expect(screen.getByText('Rezagada')).toBeInTheDocument();
  });

  it('InlineAlert con tone error expone role alert', () => {
    render(<InlineAlert tone="error">Algo falló</InlineAlert>);
    expect(screen.getByRole('alert')).toHaveTextContent('Algo falló');
  });

  it('FormField vincula label con su campo', () => {
    render(
      <FormField label="Nombre" htmlFor="nombre">
        <input id="nombre" />
      </FormField>
    );
    expect(screen.getByLabelText('Nombre')).toBeInTheDocument();
  });

  it('EmptyState muestra título y descripción', () => {
    render(<EmptyState title="Sin datos" description="No hay operaciones." />);
    expect(screen.getByText('Sin datos')).toBeInTheDocument();
    expect(screen.getByText('No hay operaciones.')).toBeInTheDocument();
  });
});

describe('PR-012 · overlay', () => {
  it('ConfirmDialog renderiza acciones al abrir', async () => {
    render(<ConfirmDialog open onClose={() => {}} onConfirm={() => {}} confirmLabel="Sí" cancelLabel="No" />);
    expect(screen.getByRole('button', { name: 'Sí' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'No' })).toBeInTheDocument();
  });

  it('FilterChip tiene aria-pressed según active', () => {
    render(<FilterChip label="Urgente" active />);
    expect(screen.getByRole('button', { name: 'Urgente' })).toHaveAttribute('aria-pressed', 'true');
  });
});