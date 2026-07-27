import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { code128Svg } from '../lib/code128';

// Tabla maestra simulada (tms_matriz_codigos)
const MATRIZ = [
  { codigo_producto: 'NGE10500035P', producto: 'TAPA ROJA', unidad_medida: 'UNI' },
  { codigo_producto: 'NGE10500050P', producto: 'TAPA AMARILLA X UNIDAD', unidad_medida: 'UNI' }
];

function builder(data) {
  const b = {};
  ['select', 'or', 'order', 'limit', 'eq', 'ilike'].forEach((m) => (b[m] = () => b));
  b.then = (resolve) => resolve({ data, error: null });
  return b;
}
vi.mock('../supabase', () => ({
  supabase: { from: () => builder(MATRIZ) }
}));

import Carteles from '../pages/Inventory/Carteles';

const wrap = (ui) =>
  render(<MemoryRouter initialEntries={['/inventory/carteles']}>{ui}</MemoryRouter>);

describe('Carteles de Bodega (Inventario)', () => {
  beforeEach(() => cleanup());

  it('el generador CODE128 produce un SVG válido con barras', () => {
    const svg = code128Svg('NGE10500035P');
    expect(svg).toContain('<svg');
    expect(svg).toContain('<rect');
    // caracteres fuera del set B → no representable
    expect(code128Svg('CÓDIGO')).toBe('');
  });

  it('buscar en la tabla maestra y agregar arma el cartel en la vista previa', async () => {
    wrap(<Carteles />);
    expect(screen.getByRole('heading', { name: /Carteles de/i })).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText(/Código o descripción/i), {
      target: { value: 'TAPA' }
    });
    await waitFor(() => expect(screen.getByText('NGE10500035P')).toBeInTheDocument(), {
      timeout: 2500
    });
    fireEvent.click(screen.getByText('NGE10500035P'));
    // El cartel aparece en la vista previa (código en la cola + código gigante + etiqueta CÓDIGO BARRA)
    await waitFor(() =>
      expect(screen.getAllByText('NGE10500035P').length).toBeGreaterThanOrEqual(2)
    );
    expect(screen.getByText(/Código Barra/i)).toBeInTheDocument();
    // La descripción aparece en el resultado de búsqueda, la cola y el cartel.
    expect(screen.getAllByText('TAPA ROJA').length).toBeGreaterThanOrEqual(2);
  });
});
