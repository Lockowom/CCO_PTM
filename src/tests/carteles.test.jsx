import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { code128Svg } from '../lib/code128';

const MATRIZ = [
  { codigo_producto: 'NGE10500035P', producto: 'TAPA ROJA', unidad_medida: 'UNI' },
  { codigo_producto: 'NGE10500050P', producto: 'TAPA AMARILLA X UNIDAD', unidad_medida: 'UNI' },
  { codigo_producto: 'SIN-DESC', producto: '', unidad_medida: 'UNI' }
];
const trace = vi.hoisted(() => ({ data: [], fetch: vi.fn(async () => trace.data) }));
function builder(data) { const b = {}; ['select', 'or', 'order', 'limit'].forEach((m) => (b[m] = () => b)); b.then = (resolve) => resolve({ data, error: null }); return b; }
vi.mock('../supabase', () => ({ supabase: { from: () => builder(MATRIZ) } }));
vi.mock('../services/calidadService', () => ({ fetchLotesSeries: trace.fetch }));
import Carteles from '../pages/Inventory/Carteles';

const wrap = () => render(<MemoryRouter><Carteles /></MemoryRouter>);
async function addManual(codigo, producto = '') {
  fireEvent.click(screen.getByText(/Agregar código manual/i));
  fireEvent.change(screen.getByLabelText('Código'), { target: { value: codigo } });
  if (producto) fireEvent.change(screen.getByLabelText(/Descripción/), { target: { value: producto } });
  fireEvent.click(screen.getByRole('button', { name: 'Agregar a cola' }));
}
async function openTraceability() { fireEvent.click(screen.getByRole('button', { name: /Trazabilidad:/ })); }

describe('Carteles de Bodega', () => {
  beforeEach(() => { cleanup(); trace.data = []; trace.fetch.mockReset(); trace.fetch.mockImplementation(async () => trace.data); });
  it('mantiene CODE128', () => { expect(code128Svg('NGE10500035P')).toContain('<rect'); expect(code128Svg('CÓDIGO')).toBe(''); });
  it('busca SKU y agrega descripción correcta', async () => { wrap(); fireEvent.change(screen.getByPlaceholderText(/Código o descripción/i), { target: { value: 'TAPA' } }); await waitFor(() => expect(screen.getByText('NGE10500035P')).toBeInTheDocument()); fireEvent.click(screen.getByText('NGE10500035P')); expect(screen.getAllByText('TAPA ROJA').length).toBeGreaterThanOrEqual(2); });
  it('no muestra el mensaje antiguo sin descripción', async () => { wrap(); fireEvent.change(screen.getByPlaceholderText(/Código o descripción/i), { target: { value: 'SIN-DESC' } }); await waitFor(() => expect(screen.getByText('SIN-DESC')).toBeInTheDocument()); fireEvent.click(screen.getByText('SIN-DESC')); expect(screen.queryByText(/SI TE APARECE ESTO/i)).not.toBeInTheDocument(); expect(screen.getAllByText('Descripción no disponible').length).toBeGreaterThan(0); });
  it('soporta Único, Doble y Cuádruple', async () => { wrap(); await addManual('MANUAL-01'); fireEvent.click(screen.getByText('Único')); expect(screen.getByTestId('cartel-grid-1')).toBeInTheDocument(); fireEvent.click(screen.getByText('Doble')); expect(screen.getByTestId('cartel-grid-2')).toBeInTheDocument(); fireEvent.click(screen.getByText('Cuádruple')); expect(screen.getByTestId('cartel-grid-4')).toBeInTheDocument(); });
  it('cuatro SKU generan una página y cinco dos páginas con celdas vacías', async () => { wrap(); for (const code of ['A-1','A-2','A-3','A-4']) await addManual(code); expect(screen.getAllByTestId('cartel-page')).toHaveLength(1); await addManual('A-5'); expect(screen.getAllByTestId('cartel-page')).toHaveLength(2); expect(screen.getAllByTestId('cartel-empty-cell')).toHaveLength(3); });
  it('fija la geometría A4 de la cuadrícula cuádruple', async () => { wrap(); await addManual('A4-CHECK'); const css = document.querySelector('style').textContent; expect(css).toContain('width:194mm'); expect(css).toContain('height:281mm'); expect(css).toContain('gap:3mm'); });
  it('selecciona lote del sistema con disponible, ubicación y vencimiento', async () => { trace.data = [{ tipo: 'P', valor: '20261001', disponible: 14, ubicacion: 'A-05-03', venc: '2028-10-01' }]; wrap(); await addManual('SKU-LOTE'); await openTraceability(); fireEvent.click(screen.getByText('Sistema')); await waitFor(() => expect(trace.fetch).toHaveBeenCalledWith('SKU-LOTE', '')); expect(screen.getByText(/Disponible: 14/)).toHaveTextContent('A-05-03'); fireEvent.click(screen.getByLabelText('Seleccionar lote 20261001')); expect(screen.getAllByText('20261001').length).toBeGreaterThan(1); });
  it('permite multiselección de series y copias por combinación', async () => { trace.data = [{ tipo: 'S', valor: 'P2508030', disponible: 1 }, { tipo: 'S', valor: 'P2508036', disponible: 1 }]; wrap(); await addManual('SKU-SERIE'); await openTraceability(); fireEvent.click(screen.getByText('Sistema')); await waitFor(() => expect(screen.getByLabelText('Seleccionar serie P2508030')).toBeInTheDocument()); fireEvent.click(screen.getByLabelText('Seleccionar serie P2508030')); fireEvent.click(screen.getByLabelText('Seleccionar serie P2508036')); fireEvent.click(screen.getByLabelText('Sumar copias SKU-SERIE')); expect(screen.getAllByText('SKU-SERIE').length).toBeGreaterThanOrEqual(4); });
  it('oculta agotados por defecto y los muestra si se desactiva el filtro', async () => { trace.data = [{ tipo: 'P', valor: 'AGOTADO', disponible: 0 }, { tipo: 'P', valor: 'ACTIVO', disponible: 3 }]; wrap(); await addManual('SKU-STOCK'); await openTraceability(); fireEvent.click(screen.getByText('Sistema')); await waitFor(() => expect(screen.getByText('ACTIVO')).toBeInTheDocument()); expect(screen.queryByText('AGOTADO')).not.toBeInTheDocument(); fireEvent.click(screen.getByLabelText(/Solo disponibles/)); expect(screen.getByText('AGOTADO')).toBeInTheDocument(); });
  it('permite lote manual sin window.prompt', async () => { const prompt = vi.spyOn(window, 'prompt'); wrap(); await addManual('SKU-MANUAL'); await openTraceability(); fireEvent.click(screen.getByText('Manual')); fireEvent.change(screen.getByLabelText('Valor manual'), { target: { value: 'LOTE-LARGO-123456789' } }); fireEvent.click(screen.getByText('Agregar')); expect(screen.getAllByText(/LOTE-LARGO-123456789/).length).toBeGreaterThan(0); expect(prompt).not.toHaveBeenCalled(); prompt.mockRestore(); });
  it('informa error de la consulta de lotes y series', async () => { trace.fetch.mockRejectedValueOnce(new Error('network')); wrap(); await addManual('SKU-ERROR'); await openTraceability(); fireEvent.click(screen.getByText('Sistema')); await waitFor(() => expect(screen.getByText(/No pudimos consultar lotes y series/)).toBeInTheDocument()); });
  it('no incorpora llamadas de escritura de stock', async () => { wrap(); await addManual('SOLO-LECTURA'); await openTraceability(); fireEvent.click(screen.getByText('Sistema')); await waitFor(() => expect(trace.fetch).toHaveBeenCalled()); expect(trace.fetch.mock.calls.flat()).not.toContain('wms_move_stock'); expect(trace.fetch.mock.calls.flat()).not.toContain('conteo_ajuste_erp'); });
});
